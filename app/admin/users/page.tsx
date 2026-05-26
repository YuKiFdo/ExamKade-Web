'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type User = {
  id: string;
  mobile: string;
  operator: string;
  subscriptionStatus: string;
  registrationSource: string;
  subscribedAt?: string;
  _count?: { downloadLogs: number };
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  useEffect(() => {
    adminApi
      .users(sourceFilter)
      .then(setUsers)
      .catch(() => router.push('/admin/login'));
  }, [router, sourceFilter]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage platform users and subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val || 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              <SelectItem value="WEB">Web</SelectItem>
              <SelectItem value="MOBILE">Mobile</SelectItem>
            </SelectContent>
          </Select>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Source</th>
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
                      <Badge variant="outline">{u.registrationSource}</Badge>
                    </td>
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
