'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DocFile = { id: string; medium: string; fileName: string };

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<{
    id: string;
    title: string;
    status: string;
    files: DocFile[];
  } | null>(null);
  const [medium, setMedium] = useState('SINHALA');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = () => {
    adminApi
      .getDocument(id)
      .then(setDoc)
      .catch(() => router.push('/admin/login'));
  };

  useEffect(load, [id, router]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await adminApi.uploadFile(id, medium, file, (progress) => {
        setUploadProgress(progress);
      });
      load();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = async (fileId: string) => {
    if (!confirm('Delete file?')) return;
    await adminApi.deleteFile(fileId);
    load();
  };

  if (!doc) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={doc.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {doc.status}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/documents')}>
          ← Back
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-40">
              <label className="text-sm font-medium">Medium</label>
              <Select value={medium} onValueChange={(val) => setMedium(val || '')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINHALA">Sinhala</SelectItem>
                  <SelectItem value="TAMIL">Tamil</SelectItem>
                  <SelectItem value="ENGLISH">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={upload}
                disabled={uploading}
                className="mt-1.5 block text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>
          {uploading && (
            <div className="mt-4 w-full max-w-md">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Files</CardTitle>
        </CardHeader>
        <CardContent>
          {doc.files?.length > 0 ? (
            <ul className="space-y-2">
              {doc.files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{f.medium}</Badge>
                    <span>{f.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFile(f.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No files yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
