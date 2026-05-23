import { api } from '@/lib/api';
import { DocumentCard } from '@/components/DocumentCard';

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
      <div className="mb-8 rounded-[2rem] bg-gradient-to-tr from-slate-100 to-teal-50 dark:from-slate-900/80 dark:to-teal-900/30 p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Search results</h1>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl">
          {result.pagination.total} document(s) found for your query.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
      {result.documents.length === 0 && (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-20 text-center bg-slate-50/50 dark:bg-slate-900/20">
          <p className="text-lg font-bold text-slate-400">No documents match your filters.</p>
        </div>
      )}
    </div>
  );
}
