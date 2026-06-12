'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Doc = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category?: { name: string };
  _count?: { downloadLogs: number };
};

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Doc[]>([]);

  useEffect(() => {
    adminApi
      .documents()
      .then((r: { documents: Doc[] }) => setDocuments(r.documents))
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const remove = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await adminApi.deleteDocument(id);
    setDocuments((d) => d.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all uploaded documents</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" render={<Link href="/admin/documents/bulk" />}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            Bulk Import
          </Button>
          <Button render={<Link href="/admin/documents/new" />}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Document
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Downloads</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{doc.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.category?.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={doc.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{doc._count?.downloadLogs ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" render={<Link href={`/admin/documents/${doc.id}`} />}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => remove(doc.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {documents.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No documents yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
