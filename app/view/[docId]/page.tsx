import Link from 'next/link';
import { api } from '@/lib/api';
import { PdfViewerClient } from '@/components/PdfViewerClient';
import { ViewerActions } from '@/components/ViewerActions';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ docId: string }>;
  searchParams: Promise<{ file?: string }>;
};

export default async function ViewPage({ params, searchParams }: Props) {
  const { docId } = await params;
  const { file: fileId } = await searchParams;

  if (!fileId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-600 font-medium">No file specified.</p>
        <Button variant="ghost" className="mt-4" render={<Link href="/" />}>
          Back to home
        </Button>
      </div>
    );
  }

  const previewUrl = api.previewUrl(fileId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/30 dark:bg-zinc-950/20">
      {/* Sticky Document Control Bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-4 border-b border-border/80 bg-background/85 backdrop-blur-md px-4 py-3 sm:px-6 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/" />}
          className="gap-1.5 px-3 text-muted-foreground hover:text-foreground transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M6 5L3 8L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Button>
        <ViewerActions fileId={fileId} />
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex justify-center items-start">
        <div className="w-full max-w-5xl">
          <PdfViewerClient url={previewUrl} />
        </div>
      </div>
    </div>
  );
}
