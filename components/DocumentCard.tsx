import Link from 'next/link';
import type { Document } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ACCENT_COLORS: Record<string, string> = {
  PAST_PAPERS: 'bg-violet-500',
  MODEL_PAPERS: 'bg-blue-500',
  TERM_TEST: 'bg-cyan-500',
  SYLLABUS: 'bg-emerald-500',
  TEACHERS_GUIDE: 'bg-amber-500',
  TEXT_BOOKS: 'bg-rose-500',
  GAZETTE: 'bg-yellow-500',
};

export function DocumentCard({ doc }: { doc: Document }) {
  const facets = doc.facets?.map((f) => f.facetValue.label).join(' · ') || '';
  const rootType = doc.category?.rootType || 'PAST_PAPERS';
  const accentColor = ACCENT_COLORS[rootType] || ACCENT_COLORS.PAST_PAPERS;

  return (
    <Link href={`/doc/${doc.slug}`} className="group block">
      <Card className="relative flex overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
        {/* Left accent bar */}
        <div className={`w-1 shrink-0 ${accentColor} transition-all duration-300 group-hover:w-1.5`} />

        <div className="flex flex-1 flex-col p-5">
          {/* Category badge */}
          {doc.category && (
            <Badge variant="secondary" className="mb-3 w-fit text-xs">
              {doc.category.name}
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary line-clamp-2">
            {doc.title}
          </h3>

          {/* Facets */}
          {facets && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{facets}</p>
          )}

          {/* Bottom row */}
          <div className="mt-auto flex items-center justify-between pt-3">
            {doc.files && doc.files.length > 0 && (
              <div className="flex gap-1.5">
                {doc.files.map((f) => (
                  <Badge key={f.id} variant="outline" className="text-[10px] uppercase tracking-wide px-1.5 py-0">
                    {f.medium}
                  </Badge>
                ))}
              </div>
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-auto text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
            >
              <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}
