'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type User = {
  id: string;
  mobile: string;
  operator: string;
  subscriptionStatus: string;
  subscribedAt?: string;
  _count?: { downloadLogs: number };
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    adminApi
      .users()
      .then(setUsers)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage platform users and subscriptions</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Mobile</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Operator</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Subscription</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Downloads</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">+{u.mobile}</td>
                    <td className="px-4 py-3">{u.operator}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.subscriptionStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                        {u.subscriptionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{u._count?.downloadLogs ?? 0}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.subscribedAt ? new Date(u.subscribedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">No users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
