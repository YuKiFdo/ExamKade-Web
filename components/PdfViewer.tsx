'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<string | null>(null);

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
      className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-lg border border-border bg-card select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="h-full w-full overflow-y-auto bg-muted/20 pb-12 pt-4">
        <div className="flex flex-col items-center gap-4">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex h-96 items-center justify-center text-muted-foreground">
                Loading PDF…
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-4 overflow-hidden rounded-md shadow-sm border border-border relative">
                {/* 
                  renderTextLayer={false} disables text selection and copying.
                  renderAnnotationLayer={false} disables links which might be clickable.
                */}
                <Page 
                  pageNumber={index + 1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 800) : 800}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
      
      {/* Heavy Watermark Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex select-none flex-col items-center justify-center overflow-hidden opacity-10 mix-blend-difference dark:mix-blend-overlay">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="flex w-[150%] -translate-x-1/4 -rotate-12 items-center justify-around gap-12 whitespace-nowrap text-5xl font-extrabold uppercase tracking-widest text-black dark:text-white py-12"
          >
            <span>Fonix Edu</span>
            <span>Fonix Edu</span>
            <span>Fonix Edu</span>
            <span>Fonix Edu</span>
          </div>
        ))}
      </div>
    </div>
  );
}
