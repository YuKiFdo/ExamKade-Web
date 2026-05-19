'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Facet = {
  id: string;
  label: string;
  facetKey: string;
  slug: string;
  sortOrder: number;
};

const FACET_KEY_LABELS: Record<string, string> = {
  EXAM: 'Exam Types',
  GRADE: 'Grades',
  SUBJECT: 'Subjects',
  YEAR: 'Years',
  MEDIUM: 'Mediums',
  TERM: 'Terms',
  PROVINCE: 'Provinces',
};

const FACET_KEY_COLORS: Record<string, string> = {
  EXAM: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  GRADE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SUBJECT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  YEAR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  MEDIUM: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  TERM: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  PROVINCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export default function AdminFacetsPage() {
  const router = useRouter();
  const [facets, setFacets] = useState<Facet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi
      .facets()
      .then((data) => {
        setFacets(data as Facet[]);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  };

  useEffect(load, [router]);

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete filter value "${label}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteFacet(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete filter value');
    }
  };

  // Group by facetKey
  const grouped = facets.reduce<Record<string, Facet[]>>((acc, facet) => {
    if (!acc[facet.facetKey]) acc[facet.facetKey] = [];
    acc[facet.facetKey].push(facet);
    return acc;
  }, {});

  if (loading) {
    return <p className="text-muted-foreground">Loading filters…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Filters & Metadata</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global metadata options (Grades, Subjects, Mediums, Exams, etc.) used to filter documents
          </p>
        </div>
        <Button render={<Link href="/admin/facets/new" />}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Filter Option
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {Object.keys(FACET_KEY_LABELS).map((key) => {
          const items = grouped[key] || [];
          return (
            <Card key={key} className="flex flex-col">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Badge className={FACET_KEY_COLORS[key] || ''} variant="secondary">
                    {FACET_KEY_LABELS[key] || key}
                  </Badge>
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </CardHeader>
              <CardContent className="flex-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">No options added yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">Slug: {item.slug} {item.sortOrder > 0 && `• Order: ${item.sortOrder}`}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 px-2" render={<Link href={`/admin/facets/${item.id}`} />}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => remove(item.id, item.label)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
