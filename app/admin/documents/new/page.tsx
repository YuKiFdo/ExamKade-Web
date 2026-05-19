'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewDocumentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; rootType: string; parentId: string | null; allowedFilters: string[] }[]>([]);
  const [facets, setFacets] = useState<{ id: string; label: string; facetKey: string }[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.categories(), adminApi.facets()])
      .then(([cats, f]) => {
        setCategories(cats as typeof categories);
        setFacets(f as typeof facets);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doc = await adminApi.createDocument({
        title,
        description,
        categoryId,
        status,
        facetValueIds: selectedFacets,
      });
      router.push(`/admin/documents/${(doc as { id: string }).id}`);
    } catch {
      alert('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  // Find allowed filter keys for selected category
  const selectedCat = categories.find((c) => c.id === categoryId);
  
  let allowedKeys: string[] = [];
  if (selectedCat) {
    let currentCat = selectedCat;
    while (currentCat) {
      if (currentCat.allowedFilters && currentCat.allowedFilters.length > 0) {
        allowedKeys = currentCat.allowedFilters;
        break;
      }
      if (currentCat.parentId) {
        const parent = categories.find((c) => c.id === currentCat.parentId);
        currentCat = parent!;
      } else {
        break;
      }
    }
    // Fallback to default facets for this rootType if none specified in hierarchy
    if (allowedKeys.length === 0 && selectedCat.rootType) {
      const ROOT_FACETS: Record<string, string[]> = {
        PAST_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
        MODEL_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
        TERM_TEST: ['GRADE', 'SUBJECT', 'YEAR', 'TERM', 'PROVINCE'],
        SYLLABUS: ['GRADE', 'SUBJECT', 'MEDIUM'],
        TEACHERS_GUIDE: ['GRADE', 'SUBJECT', 'MEDIUM'],
        TEXT_BOOKS: ['GRADE', 'SUBJECT', 'MEDIUM'],
        GAZETTE: ['YEAR', 'MEDIUM'],
      };
      allowedKeys = ROOT_FACETS[selectedCat.rootType] || [];
    }
  }

  // Group facets by key, only including those in allowedKeys
  const groupedFacets = facets.reduce<Record<string, typeof facets>>((acc, f) => {
    if (allowedKeys.includes(f.facetKey)) {
      if (!acc[f.facetKey]) acc[f.facetKey] = [];
      acc[f.facetKey].push(f);
    }
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold">New Document</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create a new document and upload files</p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
                placeholder="Enter document title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category…" />
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

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val || '')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Facets</label>
              {!categoryId ? (
                <p className="mt-1.5 text-xs text-muted-foreground bg-muted/40 border border-dashed rounded-lg p-3 text-center">
                  Please select a category first to see available filter values.
                </p>
              ) : Object.keys(groupedFacets).length === 0 ? (
                <p className="mt-1.5 text-xs text-muted-foreground bg-muted/40 border border-dashed rounded-lg p-3 text-center">
                  No filters configured for this category.
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  {Object.entries(groupedFacets).map(([key, options]) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{key}</p>
                      <div className="flex flex-wrap gap-2">
                        {options.map((f) => (
                          <label
                            key={f.id}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedFacets.includes(f.id)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFacets.includes(f.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFacets([...selectedFacets, f.id]);
                                } else {
                                  setSelectedFacets(selectedFacets.filter((id) => id !== f.id));
                                }
                              }}
                              className="sr-only"
                            />
                            {f.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create & Upload Files'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/documents')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
