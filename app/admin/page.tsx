'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type DashboardStats = {
  users: number;
  documents: number;
  downloads: number;
  todayDownloads: number;
};

const STAT_CONFIG = [
  {
    key: 'users' as const,
    label: 'Total Users',
    href: '/admin/users',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'documents' as const,
    label: 'Documents',
    href: '/admin/documents',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      </svg>
    ),
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'downloads' as const,
    label: 'Total Downloads',
    href: '/admin/downloads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
    ),
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    key: 'todayDownloads' as const,
    label: 'Downloads Today',
    href: '/admin/downloads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4"/>
        <path d="M16 2v4"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <path d="M3 10h18"/>
      </svg>
    ),
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch(() => router.push('/admin/login'));
  }, [router]);

  if (!stats) {
    return <p className="text-muted-foreground">Loading dashboard…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIG.map((cfg) => (
          <Link key={cfg.key} href={cfg.href} className="group">
            <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{cfg.label}</p>
                  <p className="mt-0.5 text-2xl font-bold">{stats[cfg.key]}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button render={<Link href="/admin/documents/new" />}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Document
          </Button>
          <Button variant="outline" render={<Link href="/admin/categories/new" />}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                <path d="M12 10v6M9 13h6"/>
              </svg>
              New Category
          </Button>
          <Button variant="outline" render={<Link href="/admin/categories" />}>
            Manage Categories
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
