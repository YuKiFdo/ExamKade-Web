import Link from 'next/link';
import { api } from '@/lib/api';
import { PdfViewerClient } from '@/components/PdfViewerClient';
import { DownloadButton } from '@/components/DownloadButton';

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
        <p className="text-red-600">No file specified.</p>
        <Link href="/" className="mt-4 inline-block text-teal-700 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const previewUrl = api.previewUrl(fileId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          ← Back
        </Link>
        <div className="flex gap-2">
          <DownloadButton fileId={fileId} fileName="document.pdf" />
          <Link
            href="/login"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="flex-1 p-4">
        <PdfViewerClient url={previewUrl} />
      </div>
    </div>
  );
}
