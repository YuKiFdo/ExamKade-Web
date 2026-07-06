import Link from 'next/link';
import { api, ROOT_TYPE_ICONS } from '@/lib/api';
import * as LucideIcons from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import { CategoryFilters } from './CategoryFilters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const path = slug.join('/');
  try {
    const data = await api.getCategoryPage(path, 1);
    const title = data.breadcrumbs[data.breadcrumbs.length - 1]?.name || slug.join(' ');
    return { title };
  } catch {
    return { title: slug.join(' ') };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const { page: pageStr, ...filters } = resolvedSearchParams;
  const path = slug.join('/');
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  let data: Awaited<ReturnType<typeof api.getCategoryPage>>;
  try {
    data = await api.getCategoryPage(path, page, filters);
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <p className="text-destructive">Category not found.</p>
      </div>
    );
  }

  const title =
    data.breadcrumbs[data.breadcrumbs.length - 1]?.name || 'Documents';

  const rootBreadcrumb = data.breadcrumbs[0];
  const rootIconName = rootBreadcrumb ? ROOT_TYPE_ICONS[rootBreadcrumb.rootType] : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* Page Header Area */}
      <div className="mb-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 p-8 sm:p-10 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#4f46e508,transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link href="/" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
              <LucideIcons.Home className="size-4" />
              Home
            </Link>
            {data.breadcrumbs.map((b, i) => (
              <span key={b.id} className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-300 dark:text-slate-600">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Link
                  href={`/category/${slug.slice(0, i + 1).join('/')}`}
                  className={`transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    i === data.breadcrumbs.length - 1 ? 'text-slate-900 dark:text-slate-200 font-bold' : ''
                  }`}
                >
                  {b.name}
                </Link>
              </span>
            ))}
          </nav>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            {rootIconName && (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/80">
                {(() => {
                  const Icon = (LucideIcons as any)[rootIconName];
                  return Icon ? <Icon className="size-8 stroke-[1.5]" /> : null;
                })()}
              </span>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
              <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                Access verified past papers, syllabuses, and curriculum-aligned resources designed for academic success.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {rootBreadcrumb?.rootType !== 'GAZETTE' && (
        <CategoryFilters
          facetOptions={data.facetOptions}
          currentPath={path}
        />
      )}

      {/* Documents grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {data.documents.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 px-4 text-center bg-slate-50/30 dark:bg-slate-900/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
            <LucideIcons.FileQuestion className="size-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Documents Found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            We couldn&apos;t find any academic resources matching this category or filters. Check back soon for new uploads.
          </p>
        </div>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" render={<Link href={`/category/${path}?page=${page - 1}`} />}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mr-1">
                  <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
            </Button>
          )}
          <div className="flex items-center gap-1">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  render={<Link href={`/category/${path}?page=${p}`} />}
                >
                  {p}
                </Button>
              ),
            )}
          </div>
          {page < data.pagination.totalPages && (
            <Button variant="outline" size="sm" render={<Link href={`/category/${path}?page=${page + 1}`} />}>
                Next
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
