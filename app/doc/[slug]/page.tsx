import Link from 'next/link';
import { api, MEDIUM_LABELS } from '@/lib/api';
import { DownloadButton } from '@/components/DownloadButton';
import { DocumentCard } from '@/components/DocumentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { Home, FileText } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const { document } = await api.getDocument(slug);
    return { title: document.title };
  } catch {
    return { title: 'Document' };
  }
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  let data: Awaited<ReturnType<typeof api.getDocument>>;
  try {
    data = await api.getDocument(slug);
  } catch {
    notFound();
  }

  const { document, related } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* Top Header Card */}
      <div className="mb-10 rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-10 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#4f46e508,transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link href="/" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
              <Home className="size-4" />
              Home
            </Link>
            {document.category && (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-300 dark:text-slate-600">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Link
                  href={`/category/${document.category.slug}`}
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {document.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Header Content */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
             <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/80">
               <FileText className="size-8 stroke-[1.5]" />
             </span>
             <div>
               <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{document.title}</h1>
               {document.description && (
                 <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">{document.description}</p>
               )}
               
               {/* Tags */}
               {document.facets && document.facets.length > 0 && (
                 <div className="mt-5 flex flex-wrap gap-2">
                   {document.facets.map((f) => (
                     <Badge key={f.facetValue.id} className="bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 font-bold px-3 py-1 text-xs rounded-lg">
                       {f.facetValue.label}
                     </Badge>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Available files</h2>
        {(document.files || []).map((file) => {
          const extension = file.fileName.split('.').pop() || 'pdf';
          const categoryName = document.category?.name || 'Document';
          const formattedFileName = `${categoryName} - ${document.title} - ExamKade.${extension}`;

          return (
            <div key={file.id} className="transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-indigo-500/20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <FileText className="size-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                    {MEDIUM_LABELS[file.medium] || file.medium} Medium
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{file.fileName}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none rounded-full border-2 border-slate-200 dark:border-slate-700 font-bold hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors" render={<Link href={`/view/${document.id}?file=${file.id}`} />}>
                  View PDF
                </Button>
                <div className="flex-1 sm:flex-none">
                  <DownloadButton fileId={file.id} fileName={formattedFileName} />
                </div>
              </div>
            </div>
          );
        })}
        {(!document.files || document.files.length === 0) && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 text-center bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-lg font-bold text-slate-400">No files uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Related Documents */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12">
          <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Related Documents</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {related.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
