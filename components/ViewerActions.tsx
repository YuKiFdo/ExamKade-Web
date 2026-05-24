'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Lock, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMeAction, logoutAction } from '@/app/actions/auth';

export function ViewerActions({
  fileId,
  fileName = 'document.pdf',
}: {
  fileId: string;
  fileName?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{
    mobile: string;
    subscriptionStatus: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeAction()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);


  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
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
    <div className="flex items-center gap-3">
      {/* Download Action */}
      {active ? (
        <Button size="sm" className="rounded-full !bg-indigo-600 hover:!bg-indigo-700 !text-white font-bold shadow-md shadow-indigo-500/20 px-4" render={<a href={api.downloadUrl(fileId)} download={fileName} />}>
          <Download className="mr-1.5 size-4" />
          Download PDF
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-indigo-150/80 !bg-indigo-50/30 !text-indigo-600 hover:!bg-indigo-50/60 hover:!text-indigo-700 dark:border-indigo-900/30 dark:!bg-indigo-950/20 dark:!text-indigo-400 dark:hover:!bg-indigo-900/30 shadow-sm font-bold px-4"
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
          className="gap-1.5 rounded-full font-bold text-slate-500 border-slate-200 dark:border-slate-800 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-900/50 transition-colors px-4"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      )}
    </div>
  );
}
