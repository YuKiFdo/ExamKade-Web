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
  const { page: pageStr } = await searchParams;
  const path = slug.join('/');
  const page = pageStr ? parseInt(pageStr, 10) : 1;

  let data: Awaited<ReturnType<typeof api.getCategoryPage>>;
  try {
    data = await api.getCategoryPage(path, page);
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
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        {data.breadcrumbs.map((b, i) => (
          <span key={b.id} className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/50">
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Link
              href={`/category/${slug.slice(0, i + 1).join('/')}`}
              className={`transition-colors hover:text-foreground ${
                i === data.breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
              }`}
            >
              {b.name}
            </Link>
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        {rootIconName && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {(() => {
              const Icon = (LucideIcons as any)[rootIconName];
              return Icon ? <Icon className="size-6" /> : null;
            })()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and preview documents. Download requires mobile subscription.
          </p>
        </div>
      </div>

      {/* Filters */}
      <CategoryFilters
        facetOptions={data.facetOptions}
        currentPath={path}
      />

      {/* Documents grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {data.documents.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg text-muted-foreground">No documents in this category yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon for new uploads.</p>
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
