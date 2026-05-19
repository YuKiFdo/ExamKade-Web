'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Log = {
  id: string;
  createdAt: string;
  user: { mobile: string; operator: string };
  document: { title: string; slug: string };
  documentFile: { medium: string; fileName: string };
};

export default function AdminDownloadsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    adminApi
      .downloads()
      .then(setLogs)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Download Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track all document downloads</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">When</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Document</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono">+{log.user.mobile}</td>
                    <td className="px-4 py-3">{log.document.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.documentFile.medium}</Badge>
                        <span className="text-muted-foreground">{log.documentFile.fileName}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No downloads yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
