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

  const data = await api.getDocument(docId).catch(() => null);
  const document = data?.document;

  let formattedFileName = 'document.pdf';
  if (document) {
    const file = document.files?.find((f) => f.id === fileId);
    const categoryName = document.category?.name || 'Document';
    const extension = file?.fileName?.split('.').pop() || 'pdf';
    formattedFileName = `${categoryName} - ${document.title} - ExamKade.${extension}`;
  }

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

  const previewUrl = await api.previewUrl(fileId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/30 dark:bg-zinc-950/20">
      {/* Sticky Document Control Bar */}
      <div className="sticky top-20 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={document ? `/doc/${document.slug}` : '/'} />}
            className="gap-1.5 px-4 font-bold rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M6 5L3 8L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Button>
          <ViewerActions fileId={fileId} fileName={formattedFileName} />
        </div>
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
