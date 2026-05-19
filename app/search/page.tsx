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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Search results</h1>
      <p className="mt-2 text-slate-600">
        {result.pagination.total} document(s) found
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
      {result.documents.length === 0 && (
        <p className="mt-8 text-center text-slate-500">No documents match your filters.</p>
      )}
    </div>
  );
}
