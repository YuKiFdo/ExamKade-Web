'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import JSZip from 'jszip';

type FacetValue = { id: string; label: string; facetKey: string };

type BulkDocEntry = {
  tempId: string;
  title: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  selectedFacets: Record<string, string>; // facetKey -> facetValueId
  sinhalaFile?: File;
  tamilFile?: File;
  englishFile?: File;
  importStatus: 'idle' | 'creating' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
};

type FileWithPath = {
  file: File;
  relativePath: string;
};

type Category = {
  id: string;
  name: string;
  rootType: string;
  parentId: string | null;
  allowedFilters: string[];
};

export default function BulkImportPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [facets, setFacets] = useState<FacetValue[]>([]);
  
  const [categoryId, setCategoryId] = useState('');
  const [entries, setEntries] = useState<BulkDocEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [uploadFileProgress, setUploadFileProgress] = useState<{ name: string; percent: number } | null>(null);
  const [zipProgress, setZipProgress] = useState<{ action: 'extract' | 'compress'; stage?: 'folders' | 'compress'; current: number; total: number; percent?: number } | null>(null);

  // Load categories and facets
  useEffect(() => {
    Promise.all([adminApi.categories(), adminApi.facets()])
      .then(([cats, f]) => {
        setCategories(cats as Category[]);
        setFacets(f as typeof facets);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  // Determine allowed filters (facets) for the selected category
  const selectedCat: Category | undefined = categories.find((c) => c.id === categoryId);

  const getAllowedKeysForCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return [];
    
    let allowed: string[] = [];
    let currentCat = cat;
    while (currentCat) {
      if (currentCat.allowedFilters && currentCat.allowedFilters.length > 0) {
        allowed = currentCat.allowedFilters;
        break;
      }
      const parentId = currentCat.parentId;
      if (parentId) {
        const parent = categories.find((c) => c.id === parentId);
        currentCat = parent!;
      } else {
        break;
      }
    }
    
    if (allowed.length === 0 && cat.rootType) {
      const ROOT_FACETS: Record<string, string[]> = {
        PAST_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
        MODEL_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
        TERM_TEST: ['GRADE', 'SUBJECT', 'YEAR', 'TERM', 'PROVINCE'],
        SYLLABUS: ['GRADE', 'SUBJECT', 'MEDIUM'],
        TEACHERS_GUIDE: ['GRADE', 'SUBJECT', 'MEDIUM'],
        TEXT_BOOKS: ['GRADE', 'SUBJECT', 'MEDIUM'],
        GAZETTE: ['YEAR', 'MEDIUM'],
      };
      allowed = ROOT_FACETS[cat.rootType] || [];
    }
    return allowed;
  };

  const allowedKeys = getAllowedKeysForCategory(categoryId);
  const hasMediumFacet = allowedKeys.some((key) => key.toUpperCase() === 'MEDIUM');

  // Group facets by key, only including those in allowedKeys
  const groupedFacets = facets.reduce<Record<string, FacetValue[]>>((acc, f) => {
    if (allowedKeys.includes(f.facetKey)) {
      if (!acc[f.facetKey]) acc[f.facetKey] = [];
      acc[f.facetKey].push(f);
    }
    return acc;
  }, {});

  // Clean filename to Title (e.g., "gce-ol-maths-2024.pdf" -> "Gce Ol Maths 2024")
  const cleanFilenameToTitle = (filename: string): string => {
    let base = filename.replace(/\.[^/.]+$/, ""); // remove extension
    base = base.replace(/[-_]/g, " "); // replace symbols
    return base.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  // Auto-deduce language medium from PDF filename
  const deduceMedium = (filename: string): 'sinhalaFile' | 'tamilFile' | 'englishFile' => {
    const nameLower = filename.toLowerCase();
    if (nameLower.includes('tamil') || nameLower.includes('-t') || nameLower.includes('_t') || nameLower.includes('.t.')) {
      return 'tamilFile';
    }
    if (nameLower.includes('english') || nameLower.includes('-e') || nameLower.includes('_e') || nameLower.includes('.e.')) {
      return 'englishFile';
    }
    return 'sinhalaFile'; // Default
  };

  // Traverses directory entries recursively
  const readEntry = (entry: any): Promise<FileWithPath[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file(
          (file: File) => {
            const relativePath = entry.fullPath.startsWith('/')
              ? entry.fullPath.substring(1)
              : entry.fullPath;
            resolve([{ file, relativePath }]);
          },
          () => resolve([])
        );
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readAllEntries = (): Promise<any[]> => {
          return new Promise((res) => {
            const results: any[] = [];
            const read = () => {
              dirReader.readEntries(
                (entriesList: any[]) => {
                  if (entriesList.length === 0) {
                    res(results);
                  } else {
                    results.push(...entriesList);
                    read();
                  }
                },
                () => res(results)
              );
            };
            read();
          });
        };

        readAllEntries().then(async (entriesList) => {
          const promises = entriesList.map((ent) => readEntry(ent));
          const fileArrays = await Promise.all(promises);
          resolve(fileArrays.flat());
        });
      } else {
        resolve([]);
      }
    });
  };

  const deduceFacetKey = (part: string, allowed: string[], index: number): string | null => {
    const clean = part.trim().toLowerCase();

    if (allowed.includes('YEAR') && /^(19|20)\d{2}$/.test(clean)) {
      return 'YEAR';
    }
    if (allowed.includes('GRADE') && (clean.includes('grade') || clean.includes('std') || /^(grade|g|std)\s*\d+$/i.test(clean))) {
      return 'GRADE';
    }
    if (allowed.includes('TERM') && (clean.includes('term') || clean.includes('semester') || /^\d+(st|nd|rd|th)?\s*term$/i.test(clean))) {
      return 'TERM';
    }
    if (allowed.includes('MEDIUM') && ['sinhala', 'english', 'tamil', 'si', 'en', 'ta'].includes(clean)) {
      return 'MEDIUM';
    }

    if (index < allowed.length) {
      const candidateKey = allowed[index];
      if (candidateKey === 'YEAR') {
        if (/^(19|20)\d{2}$/.test(clean)) {
          return 'YEAR';
        }
        return null;
      }
      return candidateKey;
    }

    return null;
  };

  // Parser for files with relative paths (handles folders, zip contents, etc.)
  const processFilesWithPaths = async (filesWithPaths: FileWithPath[]) => {
    // 1. Scan for target category in paths
    let detectedCategoryId = categoryId;
    for (const item of filesWithPaths) {
      const parts = item.relativePath.split('/').filter(Boolean);
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i].trim().toLowerCase();
        const matched = categories.find((c) => 
          c.id.toLowerCase() === part || 
          c.name.toLowerCase() === part
        );
        if (matched) {
          detectedCategoryId = matched.id;
          break;
        }
      }
      if (detectedCategoryId && detectedCategoryId !== categoryId) {
        break;
      }
    }

    let targetCatId = categoryId;
    if (detectedCategoryId && detectedCategoryId !== categoryId) {
      setCategoryId(detectedCategoryId);
      targetCatId = detectedCategoryId;
    }

    if (!targetCatId) {
      alert('Please select a Target Category first, or ensure your folder/ZIP name matches a category.');
      return;
    }

    const allowed = getAllowedKeysForCategory(targetCatId);
    const tempIdMap = new Map<string, BulkDocEntry>();
    const sessionFacets = [...facets];

    const getOrCreateFacetValue = async (facetKey: string, label: string): Promise<string | null> => {
      const cleanLabel = label.trim();
      let existing = sessionFacets.find(f => f.facetKey === facetKey && f.label.toLowerCase() === cleanLabel.toLowerCase());
      if (existing) return existing.id;

      try {
        const slug = cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const response = await adminApi.createFacet({
          facetKey,
          label: cleanLabel,
          slug: slug || 'value'
        });
        const newId = response.id;

        const newFacetObj = {
          id: newId,
          label: cleanLabel,
          facetKey,
          slug: slug || 'value',
          sortOrder: 0
        };
        
        sessionFacets.push(newFacetObj);
        setFacets(prev => [...prev, newFacetObj]);
        return newId;
      } catch (err) {
        console.error('Failed to create facet value:', err);
        return null;
      }
    };

    for (const item of filesWithPaths) {
      const parts = item.relativePath.split('/').filter(Boolean);
      if (parts.length === 0) continue;

      const filename = parts[parts.length - 1];
      if (!filename.toLowerCase().endsWith('.pdf')) continue;

      const folderParts = parts.slice(0, -1);

      // Detect medium from path
      let mediumKey: 'sinhalaFile' | 'tamilFile' | 'englishFile' = 'sinhalaFile';
      let mediumFoundInPath = false;
      for (let i = folderParts.length - 1; i >= 0; i--) {
        const part = folderParts[i].trim().toLowerCase();
        if (['sinhala', 'si', 'sin', 's'].includes(part)) {
          mediumKey = 'sinhalaFile';
          mediumFoundInPath = true;
          folderParts.splice(i, 1);
          break;
        } else if (['english', 'en', 'eng', 'e'].includes(part)) {
          mediumKey = 'englishFile';
          mediumFoundInPath = true;
          folderParts.splice(i, 1);
          break;
        } else if (['tamil', 'ta', 'tam', 't'].includes(part)) {
          mediumKey = 'tamilFile';
          mediumFoundInPath = true;
          folderParts.splice(i, 1);
          break;
        }
      }

      if (!mediumFoundInPath) {
        mediumKey = deduceMedium(filename);
      }

      // Remove category from folders
      const catIndex = folderParts.findIndex((part) => {
        const p = part.trim().toLowerCase();
        const matched = categories.find((c) => 
          c.id.toLowerCase() === p || 
          c.name.toLowerCase() === p
        );
        return !!matched;
      });
      if (catIndex !== -1) {
        folderParts.splice(catIndex, 1);
      }

      // If there are more folders than filters to match, remove the container/root folders from the beginning
      const keysToMatch = allowed.filter(k => k.toUpperCase() !== 'MEDIUM');
      while (folderParts.length > keysToMatch.length && folderParts.length > 0) {
        folderParts.shift();
      }

      // Match folders with facets (or create them dynamically)
      const selectedFacets: Record<string, string> = {};
      for (let i = 0; i < folderParts.length; i++) {
        const part = folderParts[i];
        const cleanPart = part.replace(/[-_]/g, ' ').trim().toLowerCase();
        
        let matchedFacet = sessionFacets.find((f) => 
          allowed.includes(f.facetKey) && 
          (f.label.toLowerCase() === cleanPart || f.id.toLowerCase() === cleanPart)
        );

        if (matchedFacet) {
          selectedFacets[matchedFacet.facetKey] = matchedFacet.id;
        } else {
          const deducedKey = deduceFacetKey(part, allowed, i);
          if (deducedKey) {
            const newFacetId = await getOrCreateFacetValue(deducedKey, part);
            if (newFacetId) {
              selectedFacets[deducedKey] = newFacetId;
            }
          }
        }
      }

      // Auto-match medium folder to MEDIUM facet if allowed and not already set
      const hasMediumFacet = allowed.some((key) => key.toUpperCase() === 'MEDIUM');
      if (hasMediumFacet && mediumFoundInPath) {
        const mediumFacetKey = allowed.find((key) => key.toUpperCase() === 'MEDIUM');
        if (mediumFacetKey && !selectedFacets[mediumFacetKey]) {
          let labelToFind = 'sinhala';
          if (mediumKey === 'englishFile') labelToFind = 'english';
          if (mediumKey === 'tamilFile') labelToFind = 'tamil';
          
          let matchedFacet = sessionFacets.find((f) => 
            f.facetKey === mediumFacetKey && 
            f.label.toLowerCase() === labelToFind
          );
          
          if (!matchedFacet) {
            const newFacetId = await getOrCreateFacetValue(mediumFacetKey, labelToFind.charAt(0).toUpperCase() + labelToFind.slice(1));
            if (newFacetId) {
              selectedFacets[mediumFacetKey] = newFacetId;
            }
          } else {
            selectedFacets[mediumFacetKey] = matchedFacet.id;
          }
        }
      }

      const title = cleanFilenameToTitle(filename);
      const facetKeyString = Object.entries(selectedFacets)
        .sort(([k1], [k2]) => k1.localeCompare(k2))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
      const groupKey = `${title.toLowerCase()}_${facetKeyString}`;

      if (tempIdMap.has(groupKey)) {
        const existing = tempIdMap.get(groupKey)!;
        existing[mediumKey] = item.file;
      } else {
        tempIdMap.set(groupKey, {
          tempId: Math.random().toString(36).substr(2, 9),
          title,
          description: '',
          status: 'PUBLISHED',
          selectedFacets,
          [mediumKey]: item.file,
          importStatus: 'idle',
        });
      }
    }

    const newEntries = Array.from(tempIdMap.values());
    if (newEntries.length === 0) return;

    setEntries((prev) => {
      const updated = [...prev];
      for (const entry of newEntries) {
        const existingIndex = updated.findIndex((item) => {
          if (item.title.toLowerCase() !== entry.title.toLowerCase()) return false;
          const itemFacetsStr = Object.entries(item.selectedFacets).sort().join(',');
          const entryFacetsStr = Object.entries(entry.selectedFacets).sort().join(',');
          return itemFacetsStr === entryFacetsStr;
        });

        if (existingIndex !== -1) {
          if (entry.sinhalaFile) updated[existingIndex].sinhalaFile = entry.sinhalaFile;
          if (entry.tamilFile) updated[existingIndex].tamilFile = entry.tamilFile;
          if (entry.englishFile) updated[existingIndex].englishFile = entry.englishFile;
        } else {
          updated.push(entry);
        }
      }
      return updated;
    });
  };

  const processFiles = (files: File[]) => {
    const filesWithPaths = files.map((file) => ({
      file,
      relativePath: file.name,
    }));
    processFilesWithPaths(filesWithPaths);
  };

  const processZipFile = async (file: File) => {
    setLoading(true);
    setZipProgress({ action: 'extract', current: 0, total: 0 });

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const worker = new Worker(new URL('./zip.worker.ts', import.meta.url), { type: 'module' });

      const filesWithPaths: FileWithPath[] = await new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          const { type, current, total, files, error } = e.data;

          if (type === 'PROGRESS') {
            setZipProgress({ action: 'extract', current, total });
          } else if (type === 'SUCCESS_UNZIP') {
            const results = files.map((f: any) => {
              const blob = new Blob([f.arrayBuffer], { type: 'application/pdf' });
              const pdfFile = new File([blob], f.name, { type: 'application/pdf' });
              return { file: pdfFile, relativePath: f.relativePath };
            });
            resolve(results);
            worker.terminate();
          } else if (type === 'ERROR') {
            reject(new Error(error));
            worker.terminate();
          }
        };

        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
        };

        worker.postMessage({ action: 'UNZIP', fileArrayBuffer }, [fileArrayBuffer]);
      });

      setZipProgress(null);
      setLoading(false);

      if (filesWithPaths.length === 0) {
        alert('No PDF files found inside the uploaded ZIP file.');
        return;
      }

      await processFilesWithPaths(filesWithPaths);
    } catch (err: any) {
      console.error(err);
      setZipProgress(null);
      setLoading(false);
      alert('Failed to parse ZIP file: ' + err.message);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const items = Array.from(e.dataTransfer.items);
      const entriesList = items
        .map((item) => item.webkitGetAsEntry())
        .filter((entry) => entry !== null);

      if (entriesList.length > 0) {
        const filePromises = entriesList.map((entry) => readEntry(entry));
        const fileArrays = await Promise.all(filePromises);
        const filesWithPaths = fileArrays.flat();
        
        const zipFileItem = filesWithPaths.find((f) => f.file.name.toLowerCase().endsWith('.zip'));
        if (zipFileItem) {
          await processZipFile(zipFileItem.file);
        } else {
          await processFilesWithPaths(filesWithPaths);
        }
        return;
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip'));
      if (zipFile) {
        await processZipFile(zipFile);
      } else {
        const filesWithPaths = files.map((file) => ({
          file,
          relativePath: file.name,
        }));
        await processFilesWithPaths(filesWithPaths);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const zipFile = files.find((f) => f.name.toLowerCase().endsWith('.zip'));
      if (zipFile) {
        processZipFile(zipFile);
      } else {
        processFiles(files);
      }
    }
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const filesWithPaths = files.map((file) => ({
        file,
        relativePath: (file as any).webkitRelativePath || file.name,
      }));
      await processFilesWithPaths(filesWithPaths);
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processZipFile(file);
    }
  };

  const downloadZipTemplate = async () => {
    if (!categoryId) {
      alert('Please select a Target Category first.');
      return;
    }
    
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    setLoading(true);
    setZipProgress({ action: 'compress', current: 0, total: 0, percent: 0 });

    try {
      const blob = await adminApi.downloadCategoryZipTemplate(categoryId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cat.name.replace(/\s+/g, '_')}_template.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      setZipProgress(null);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setZipProgress(null);
      setLoading(false);
      alert('Failed to generate template: ' + err.message);
    }
  };

  const exportBatchZip = async () => {
    if (entries.length === 0) {
      alert('No documents in the grid to export.');
      return;
    }

    setLoading(true);
    setZipProgress({ action: 'compress', current: 0, total: 0, percent: 0 });

    try {
      const cat = categories.find((c) => c.id === categoryId);
      const catName = cat ? cat.name : 'Bulk_Import';
      const allowed = getAllowedKeysForCategory(categoryId);
      const hasMediumFacet = allowed.some((key) => key.toUpperCase() === 'MEDIUM');

      const filesToZip: { arrayBuffer: ArrayBuffer; path: string }[] = [];

      for (const item of entries) {
        const facetPaths: string[] = [];
        for (const key of allowed) {
          const valId = item.selectedFacets[key];
          if (valId) {
            const opt = facets.find((f) => f.id === valId);
            if (opt) {
              facetPaths.push(opt.label.replace(/[\\/:*?"<>|]/g, '-'));
            }
          }
        }

        const baseFolder = [catName, ...facetPaths].join('/');
        const filesToAdd: { file?: File; path: string }[] = [];

        if (hasMediumFacet) {
          if (item.sinhalaFile) filesToAdd.push({ file: item.sinhalaFile, path: `${baseFolder}/${item.sinhalaFile.name}` });
          if (item.tamilFile) filesToAdd.push({ file: item.tamilFile, path: `${baseFolder}/${item.tamilFile.name}` });
          if (item.englishFile) filesToAdd.push({ file: item.englishFile, path: `${baseFolder}/${item.englishFile.name}` });
        } else {
          if (item.sinhalaFile) filesToAdd.push({ file: item.sinhalaFile, path: `${baseFolder}/Sinhala/${item.sinhalaFile.name}` });
          if (item.tamilFile) filesToAdd.push({ file: item.tamilFile, path: `${baseFolder}/Tamil/${item.tamilFile.name}` });
          if (item.englishFile) filesToAdd.push({ file: item.englishFile, path: `${baseFolder}/English/${item.englishFile.name}` });
        }

        for (const add of filesToAdd) {
          if (add.file) {
            const ab = await add.file.arrayBuffer();
            filesToZip.push({
              arrayBuffer: ab,
              path: add.path
            });
          }
        }
      }

      if (filesToZip.length === 0) {
        alert('No files found to export.');
        setLoading(false);
        setZipProgress(null);
        return;
      }

      const worker = new Worker(new URL('./zip.worker.ts', import.meta.url), { type: 'module' });

      const zipArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (e) => {
          const { type, stage, current, total, percent, arrayBuffer, error } = e.data;
          if (type === 'PROGRESS_ZIP') {
            setZipProgress({ 
              action: 'compress', 
              stage, 
              current: current || 0, 
              total: total || 0, 
              percent 
            });
          } else if (type === 'SUCCESS_ZIP') {
            resolve(arrayBuffer);
            worker.terminate();
          } else if (type === 'ERROR') {
            reject(new Error(error));
            worker.terminate();
          }
        };

        worker.onerror = (err) => {
          reject(err);
          worker.terminate();
        };

        const transferables = filesToZip.map(f => f.arrayBuffer);
        worker.postMessage({ action: 'ZIP', files: filesToZip }, transferables);
      });

      const blob = new Blob([zipArrayBuffer], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${catName.replace(/\s+/g, '_')}_batch.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      setZipProgress(null);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setZipProgress(null);
      setLoading(false);
      alert('Failed to generate batch ZIP: ' + err.message);
    }
  };

  const addEmptyRow = () => {
    const newEntry: BulkDocEntry = {
      tempId: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      status: 'PUBLISHED',
      selectedFacets: {},
      importStatus: 'idle',
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const updateEntry = (tempId: string, field: keyof BulkDocEntry, value: any) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const getFileFieldNameForMedium = (item: BulkDocEntry) => {
    const mediumFacetKey = allowedKeys.find(k => k.toUpperCase() === 'MEDIUM');
    if (!mediumFacetKey) return 'sinhalaFile';

    const valId = item.selectedFacets[mediumFacetKey];
    if (!valId) return 'sinhalaFile';

    const opt = facets.find(f => f.id === valId);
    if (!opt) return 'sinhalaFile';

    const label = opt.label.toLowerCase();
    if (label === 'english') return 'englishFile';
    if (label === 'tamil') return 'tamilFile';
    return 'sinhalaFile';
  };

  const updateEntryFacet = (tempId: string, facetKey: string, facetValueId: string) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          const updatedFacets = { ...item.selectedFacets, [facetKey]: facetValueId };
          let updatedItem = { ...item, selectedFacets: updatedFacets };

          if (facetKey.toUpperCase() === 'MEDIUM') {
            const opt = facets.find((f) => f.id === facetValueId);
            const label = opt ? opt.label.toLowerCase() : 'sinhala';
            
            const currentFile = item.sinhalaFile || item.tamilFile || item.englishFile;
            if (currentFile) {
              updatedItem.sinhalaFile = undefined;
              updatedItem.tamilFile = undefined;
              updatedItem.englishFile = undefined;

              if (label === 'english') updatedItem.englishFile = currentFile;
              else if (label === 'tamil') updatedItem.tamilFile = currentFile;
              else updatedItem.sinhalaFile = currentFile;
            }
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const triggerFileInput = (tempId: string, fileFieldName: 'sinhalaFile' | 'tamilFile' | 'englishFile') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        updateEntry(tempId, fileFieldName, file);
      }
    };
    input.click();
  };

  const clearFile = (tempId: string, fileFieldName: 'sinhalaFile' | 'tamilFile' | 'englishFile') => {
    updateEntry(tempId, fileFieldName, undefined);
  };

  const deleteRow = (tempId: string) => {
    setEntries((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const clearAll = () => {
    if (confirm('Clear all rows?')) {
      setEntries([]);
      setImportProgress({ current: 0, total: 0 });
      setIsImporting(false);
    }
  };

  // Run sequential creators & uploads
  const runImport = async () => {
    if (entries.length === 0) return;
    
    const emptyTitles = entries.some(e => !e.title.trim());
    if (emptyTitles) {
      alert('Please fill in Titles for all document rows.');
      return;
    }

    setIsImporting(true);
    setLoading(true);
    setImportProgress({ current: 0, total: entries.length });

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      setImportProgress((p) => ({ ...p, current: i + 1 }));

      setEntries((prev) =>
        prev.map((item) => (item.tempId === entry.tempId ? { ...item, importStatus: 'creating' } : item))
      );

      try {
        const createdDoc = await adminApi.createDocument({
          title: entry.title,
          description: entry.description,
          categoryId: categoryId,
          status: entry.status,
          facetValueIds: Object.values(entry.selectedFacets),
        });

        const docId = (createdDoc as { id: string }).id;

        setEntries((prev) =>
          prev.map((item) => (item.tempId === entry.tempId ? { ...item, importStatus: 'uploading' } : item))
        );

        if (entry.sinhalaFile) {
          setUploadFileProgress({ name: `${entry.title} (Sinhala)`, percent: 0 });
          await adminApi.uploadFile(docId, 'SINHALA', entry.sinhalaFile, (percent) => {
            setUploadFileProgress({ name: `${entry.title} (Sinhala)`, percent });
          });
        }
        if (entry.tamilFile) {
          setUploadFileProgress({ name: `${entry.title} (Tamil)`, percent: 0 });
          await adminApi.uploadFile(docId, 'TAMIL', entry.tamilFile, (percent) => {
            setUploadFileProgress({ name: `${entry.title} (Tamil)`, percent });
          });
        }
        if (entry.englishFile) {
          setUploadFileProgress({ name: `${entry.title} (English)`, percent: 0 });
          await adminApi.uploadFile(docId, 'ENGLISH', entry.englishFile, (percent) => {
            setUploadFileProgress({ name: `${entry.title} (English)`, percent });
          });
        }

        setUploadFileProgress(null);

        setEntries((prev) =>
          prev.map((item) => (item.tempId === entry.tempId ? { ...item, importStatus: 'success' } : item))
        );
      } catch (err: any) {
        setUploadFileProgress(null);
        setEntries((prev) =>
          prev.map((item) =>
            item.tempId === entry.tempId
              ? { ...item, importStatus: 'error', errorMessage: err.message || 'Error occurred' }
              : item
          )
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Smart Bulk Uploader</h1>
          <p className="text-sm text-muted-foreground mt-1">Select category, drop PDF files, folders, or ZIPs, edit metadata directly in browser, and save.</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/documents" />} disabled={isImporting && loading}>
          Back to Documents
        </Button>
      </div>

      {/* Row controls */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <span className="text-sm font-semibold shrink-0">1. Target Category</span>
            <Select value={categoryId} onValueChange={(val) => { setCategoryId(val || ''); setEntries([]); }} disabled={isImporting && loading}>
              <SelectTrigger className="w-full sm:w-[320px]">
                {selectedCat ? (
                  <span className="text-sm truncate">
                    {selectedCat.name} ({selectedCat.rootType})
                  </span>
                ) : (
                  <SelectValue placeholder="Select category..." />
                )}
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.rootType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categoryId && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="bulk-folder-input"
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                onChange={handleFolderChange}
                className="hidden"
              />
              <input
                id="bulk-zip-input"
                type="file"
                accept=".zip"
                onChange={handleZipChange}
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('bulk-folder-input')?.click()}
                disabled={isImporting && loading}
                title="Import files from a structured folder"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Import Folder
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('bulk-zip-input')?.click()}
                disabled={isImporting && loading}
                title="Import files from a structured ZIP archive"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                Import ZIP
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadZipTemplate}
                disabled={isImporting && loading}
                title="Download an empty folder structure ZIP based on this category's filter combinations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                ZIP Template
              </Button>

              {entries.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportBatchZip}
                  disabled={isImporting && loading}
                  title="Export current rows and their attached PDFs in a structured ZIP"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4M12 8v8"/>
                  </svg>
                  Export Batch ZIP
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={addEmptyRow} disabled={isImporting && loading}>
                + Add Empty Row
              </Button>
              {entries.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:bg-destructive/10" disabled={isImporting && loading}>
                  Clear All
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drop Zone & Grid Table */}
      {categoryId && (
        <div className="space-y-4">
          {/* File drag drop zone */}
          {(!isImporting || !loading) && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bulk-pdf-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                dragActive 
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                  : 'border-border bg-card hover:bg-muted/10'
              }`}
            >
              <input 
                id="bulk-pdf-input"
                type="file" 
                multiple
                accept="application/pdf,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
              <p className="font-semibold text-sm">Drag & drop multiple PDF files, a structured folder, or a ZIP here, or click to select</p>
              <p className="text-xs text-muted-foreground mt-1">This will automatically detect categories, filters, and language mediums, and group matching files.</p>
            </div>
          )}

          {/* Progress Banner */}
          {isImporting && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-sm">Import Process In Progress</p>
                <p className="text-xs text-muted-foreground">Document {importProgress.current} of {importProgress.total} is currently being created and attachments uploaded.</p>
                {uploadFileProgress && (
                  <p className="text-xs font-semibold text-primary mt-1">
                    Uploading: {uploadFileProgress.name}... {uploadFileProgress.percent}%
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full md:w-60">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden" title="Overall Progress">
                  <div className="bg-slate-400 h-full transition-all duration-300" style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }} />
                </div>
                {uploadFileProgress && (
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden" title="Current File Upload Progress">
                    <div className="bg-primary h-full transition-all duration-150" style={{ width: `${uploadFileProgress.percent}%` }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ZIP Progress Banner */}
          {zipProgress && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-sm">
                  {zipProgress.action === 'extract' ? 'Extracting ZIP Archive' : 'Generating ZIP Archive'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {zipProgress.action === 'extract' 
                    ? `Processed ${zipProgress.current} files${zipProgress.total > 0 ? ` of ${zipProgress.total}` : ''}...` 
                    : zipProgress.stage === 'folders'
                      ? `Generating template folders... ${zipProgress.current.toLocaleString()} of ${zipProgress.total.toLocaleString()}`
                      : `Compressing files... ${zipProgress.percent}%`
                  }
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-60">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-150" 
                    style={{ 
                      width: zipProgress.action === 'extract' 
                        ? `${zipProgress.total > 0 ? (zipProgress.current / zipProgress.total) * 100 : 0}%` 
                        : zipProgress.stage === 'folders'
                          ? `${zipProgress.total > 0 ? (zipProgress.current / zipProgress.total) * 100 : 0}%`
                          : `${zipProgress.percent || 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive Document Grid Table */}
          {entries.length > 0 ? (
            <Card className="shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                  <thead className="bg-muted/60 border-b">
                    <tr>
                      <th className="px-3 py-3 font-semibold text-muted-foreground w-12 text-center">Status</th>
                      <th className="px-3 py-3 font-semibold text-muted-foreground">Document Title (Required)</th>
                      <th className="px-3 py-3 font-semibold text-muted-foreground w-24">State</th>
                      {allowedKeys.map((key) => (
                        <th key={key} className="px-3 py-3 font-semibold text-muted-foreground w-40">{key}</th>
                      ))}
                      {hasMediumFacet ? (
                        <th className="px-3 py-3 font-semibold text-muted-foreground text-center w-40">Attached PDF</th>
                      ) : (
                        <>
                          <th className="px-3 py-3 font-semibold text-muted-foreground text-center w-36">Sinhala PDF</th>
                          <th className="px-3 py-3 font-semibold text-muted-foreground text-center w-36">Tamil PDF</th>
                          <th className="px-3 py-3 font-semibold text-muted-foreground text-center w-36">English PDF</th>
                        </>
                      )}
                      <th className="px-3 py-3 font-semibold text-muted-foreground w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entries.map((item) => (
                      <tr key={item.tempId} className="hover:bg-muted/10 transition-colors">
                        
                        {/* Real-time Import Status Icon */}
                        <td className="px-3 py-3 text-center align-middle">
                          {renderStatusIcon(item.importStatus, item.errorMessage)}
                        </td>

                        {/* Title Input */}
                        <td className="px-3 py-3 align-middle">
                          <input 
                            type="text" 
                            value={item.title} 
                            placeholder="Enter document title..."
                            onChange={(e) => updateEntry(item.tempId, 'title', e.target.value)}
                            disabled={isImporting && loading}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 text-sm font-semibold p-1 rounded-sm focus:bg-card"
                          />
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-3 py-3 align-middle">
                          <Select 
                            value={item.status} 
                            onValueChange={(val) => updateEntry(item.tempId, 'status', val as any)}
                            disabled={isImporting && loading}
                          >
                            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/40 px-2 shadow-none font-bold text-xs">
                              {item.status === 'PUBLISHED' ? 'Published' : item.status === 'DRAFT' ? 'Draft' : <SelectValue />}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PUBLISHED">Published</SelectItem>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Allowed filter dropdowns */}
                        {allowedKeys.map((key) => {
                          const options = groupedFacets[key] || [];
                          const selectedOption = options.find((o) => o.id === (item.selectedFacets[key] || ''));
                          return (
                            <td key={key} className="px-3 py-3 align-middle">
                              <Select
                                value={item.selectedFacets[key] || ''}
                                onValueChange={(val) => updateEntryFacet(item.tempId, key, val || '')}
                                disabled={isImporting && loading}
                              >
                                <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/40 px-2 shadow-none text-xs">
                                  {selectedOption ? (
                                    <span className="truncate">{selectedOption.label}</span>
                                  ) : (
                                    <SelectValue placeholder={`Select ${key.toLowerCase()}...`} />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          );
                        })}

                        {/* File columns */}
                        {hasMediumFacet ? (
                          <td className="px-3 py-3 text-center align-middle">
                            {(() => {
                              const fieldName = getFileFieldNameForMedium(item);
                              const file = item[fieldName];
                              return renderFileCell(item.tempId, fieldName, file);
                            })()}
                          </td>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-center align-middle">
                              {renderFileCell(item.tempId, 'sinhalaFile', item.sinhalaFile)}
                            </td>
                            <td className="px-3 py-3 text-center align-middle">
                              {renderFileCell(item.tempId, 'tamilFile', item.tamilFile)}
                            </td>
                            <td className="px-3 py-3 text-center align-middle">
                              {renderFileCell(item.tempId, 'englishFile', item.englishFile)}
                            </td>
                          </>
                        )}

                        {/* Action column (delete row) */}
                        <td className="px-3 py-3 text-center align-middle">
                          <button 
                            onClick={() => deleteRow(item.tempId)}
                            disabled={isImporting && loading}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-muted/40 cursor-pointer disabled:opacity-40"
                            title="Delete row"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom Actions */}
              <div className="bg-muted/30 border-t p-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">{entries.length} document entries to create</span>
                <Button 
                  onClick={runImport} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                      Importing {importProgress.current}/{importProgress.total}...
                    </span>
                  ) : (
                    'Import All Documents'
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="border border-dashed rounded-xl p-16 text-center text-muted-foreground">
              Drop PDF files, a structured folder, or a ZIP in the zone above, or use the Import buttons.
            </div>
          )}
        </div>
      )}
    </div>
  );

  function renderStatusIcon(status: string, errMsg?: string) {
    if (status === 'success') {
      return (
        <span className="text-emerald-500 flex justify-center" title="Imported successfully">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      );
    }
    if (status === 'creating') {
      return (
        <span className="text-indigo-600 flex justify-center animate-pulse" title="Creating document record...">
          <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
        </span>
      );
    }
    if (status === 'uploading') {
      return (
        <span className="text-amber-500 flex justify-center animate-pulse" title="Uploading attachments...">
          <div className="h-4 w-4 animate-spin border-2 border-amber-500 border-t-transparent rounded-full" />
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="text-destructive flex justify-center cursor-help" title={errMsg || 'Failed to import'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        </span>
      );
    }
    return (
      <span className="text-muted-foreground/30 flex justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </span>
    );
  }

  function renderFileCell(
    tempId: string,
    fileFieldName: 'sinhalaFile' | 'tamilFile' | 'englishFile',
    file?: File
  ) {
    if (file) {
      return (
        <div className="flex flex-col items-center gap-0.5">
          <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400 text-xs max-w-[100px]" title={file.name}>
            <span className="truncate text-[10px]">{file.name}</span>
          </div>
          <button 
            onClick={() => clearFile(tempId, fileFieldName)}
            disabled={isImporting && loading}
            className="text-[9px] text-destructive hover:underline cursor-pointer disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      );
    }

    return (
      <button 
        onClick={() => triggerFileInput(tempId, fileFieldName)}
        disabled={isImporting && loading}
        className="text-[10px] text-primary hover:bg-muted/40 px-2 py-1 border rounded hover:border-primary/50 cursor-pointer disabled:opacity-40"
      >
        + Attach
      </button>
    );
  }
}
