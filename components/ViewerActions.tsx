'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Lock, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ViewerActions({
  fileId,
  fileName = 'document.pdf',
}: {
  fileId: string;
  fileName?: string;
}) {
  const [user, setUser] = useState<{
    mobile: string;
    subscriptionStatus: string;
    operator: string;
    name?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="w-[120px]" disabled>
          Loading…
        </Button>
      </div>
    );
  }

  const active = user?.subscriptionStatus === 'ACTIVE';

  return (
    <div className="flex items-center gap-2">
      {/* Download Action */}
      {active ? (
        <Button size="sm" render={<a href={api.downloadUrl(fileId)} download={fileName} />}>
          <Download className="mr-1.5 size-4" />
          Download PDF
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/80 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/60 shadow-xs font-medium"
          render={<Link href={user ? "/account" : "/login"} />}
        >
          <Lock className="mr-1.5 size-3.5 opacity-80" />
          {user ? 'Activate subscription' : 'Sign in to download'}
        </Button>
      )}

      {/* Auth Action */}
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-colors"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      )}
    </div>
  );
}
