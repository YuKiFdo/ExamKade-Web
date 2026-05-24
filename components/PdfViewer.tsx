'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { api } from '@/lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  useEffect(() => {
    api.getMe()
      .then((user) => setHasSubscription(user.subscriptionStatus === 'ACTIVE'))
      .catch(() => setHasSubscription(false));
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message);
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="relative h-[calc(100vh-6rem)] min-h-[500px] w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 pb-16 pt-6">
        <div className="flex flex-col items-center gap-6">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex h-[400px] items-center justify-center text-sm font-medium text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span>Loading PDF pages…</span>
                </div>
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div 
                key={`page_${index + 1}`} 
                className="mb-6 overflow-hidden rounded-xl shadow-md border border-border/50 bg-background transition-shadow duration-300 hover:shadow-lg relative"
              >
                {/* 
                  renderTextLayer={false} disables text selection and copying.
                  renderAnnotationLayer={false} disables links which might be clickable.
                */}
                <Page 
                  pageNumber={index + 1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 800) : 800}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
      
      {/* Heavy Watermark Overlay */}
      {!hasSubscription && (
        <div className="pointer-events-none absolute inset-0 z-10 flex select-none flex-col items-center justify-center overflow-hidden opacity-25">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i} 
              className="flex w-[150%] -translate-x-1/4 -rotate-12 items-center justify-around gap-12 whitespace-nowrap text-5xl font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 py-12"
            >
              <span>examkade.com</span>
              <span>examkade.com</span>
              <span>examkade.com</span>
              <span>examkade.com</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
