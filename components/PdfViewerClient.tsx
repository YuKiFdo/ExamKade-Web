'use client';

import dynamic from 'next/dynamic';

export const PdfViewerClient = dynamic(
  () => import('./PdfViewer').then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => <div className="flex h-96 items-center justify-center text-muted-foreground">Loading PDF Viewer…</div>,
  }
);
