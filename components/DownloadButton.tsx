'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function DownloadButton({
  fileId,
  fileName,
}: {
  fileId: string;
  fileName: string;
}) {
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then((u) => setCanDownload(u.subscriptionStatus === 'ACTIVE'))
      .catch(() => setCanDownload(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Button variant="secondary" disabled>
        Loading…
      </Button>
    );
  }

  if (!canDownload) {
    return (
      <Button
        variant="outline"
        className="border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/80 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/60 shadow-xs"
        render={<Link href="/login" />}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 opacity-80">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Sign in to download
      </Button>
    );
  }

  return (
    <Button render={<a href={api.downloadUrl(fileId)} download={fileName} />}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
      Download PDF
    </Button>
  );
}
