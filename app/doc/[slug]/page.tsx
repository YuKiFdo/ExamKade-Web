import Link from 'next/link';
import { api, MEDIUM_LABELS } from '@/lib/api';
import { DownloadButton } from '@/components/DownloadButton';
import { DocumentCard } from '@/components/DocumentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';

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
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        {document.category && (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/50">
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Link
              href={`/category/${document.category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {document.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{document.title}</h1>
      {document.description && (
        <p className="mt-3 text-muted-foreground">{document.description}</p>
      )}

      {/* Tags */}
      {document.facets && document.facets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {document.facets.map((f) => (
            <Badge key={f.facetValue.id} variant="secondary">
              {f.facetValue.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Files Section */}
      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Available files</h2>
        {(document.files || []).map((file) => (
          <Card key={file.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-foreground">
                  {MEDIUM_LABELS[file.medium] || file.medium} Medium
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{file.fileName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" render={<Link href={`/view/${document.id}?file=${file.id}`} />}>
                  View PDF
                </Button>
                <DownloadButton fileId={file.id} fileName={file.fileName} />
              </div>
            </CardContent>
          </Card>
        ))}
        {(!document.files || document.files.length === 0) && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">No files uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Related Documents */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-xl font-bold text-foreground">Related documents</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
