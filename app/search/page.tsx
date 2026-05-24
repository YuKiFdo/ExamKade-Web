import { api } from '@/lib/api';
import { DocumentCard } from '@/components/DocumentCard';
import { Search } from 'lucide-react';

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const result = await api.searchDocuments({
    rootType: params.rootType,
    exam: params.exam,
    grade: params.grade,
    subject: params.subject,
    year: params.year,
    medium: params.medium,
    term: params.term,
    province: params.province,
    q: params.q,
    page: params.page ? parseInt(params.page, 10) : 1,
  }).catch(() => ({ documents: [], pagination: { page: 1, total: 0, totalPages: 0 } }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* Page Header Area */}
      <div className="mb-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-10 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#4f46e508,transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Search Results</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            Found {result.pagination.total} verified resource{result.pagination.total === 1 ? '' : 's'} matching your criteria.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
      
      {result.documents.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 px-4 text-center bg-slate-50/30 dark:bg-slate-900/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
            <Search className="size-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Resources Found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            We couldn&apos;t find any documents matching your search term or filters. Try adjusting your query or filters.
          </p>
        </div>
      )}
    </div>
  );
}
