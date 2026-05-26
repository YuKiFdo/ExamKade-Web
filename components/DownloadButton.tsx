'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getMeAction } from '@/app/actions/auth';

export function DownloadButton({
  fileId,
  fileName,
}: {
  fileId: string;
  fileName: string;
}) {
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadHref, setDownloadHref] = useState<string | null>(null);

  useEffect(() => {
    getMeAction()
      .then((u) => setCanDownload(u.subscriptionStatus === 'ACTIVE'))
      .catch(() => setCanDownload(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (canDownload) {
      api.downloadUrl(fileId).then(setDownloadHref).catch(() => {});
    }
  }, [canDownload, fileId]);

  if (loading) {
    return (
      <Button variant="secondary" disabled className="rounded-full font-bold">
        Loading…
      </Button>
    );
  }

  if (!canDownload) {
    return (
      <Button
        variant="outline"
        className="rounded-full border-indigo-150/80 !bg-indigo-50/30 !text-indigo-600 hover:!bg-indigo-50/60 hover:!text-indigo-700 dark:border-indigo-900/30 dark:!bg-indigo-950/20 dark:!text-indigo-400 dark:hover:!bg-indigo-900/30 shadow-sm font-bold"
        render={<Link href="/login" />}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 opacity-80">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Sign in to download
      </Button>
    );
  }

  return (
    <Button
      className="rounded-full !bg-indigo-600 hover:!bg-indigo-700 !text-white font-bold shadow-md shadow-indigo-500/20"
      disabled={!downloadHref}
      render={downloadHref ? <a href={downloadHref} download={fileName} /> : undefined}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
      {downloadHref ? 'Download PDF' : 'Preparing…'}
    </Button>
  );
}

