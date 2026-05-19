'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

const FACET_KEY_LABELS: Record<string, string> = {
  EXAM: 'Exam Type',
  GRADE: 'Grade',
  SUBJECT: 'Subject',
  YEAR: 'Year',
  MEDIUM: 'Medium',
  TERM: 'Term',
  PROVINCE: 'Province',
};

export default function EditFacetPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [facetKey, setFacetKey] = useState('');
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getFacet(id)
      .then((f) => {
        setFacetKey(f.facetKey);
        setLabel(f.label);
        setSlug(f.slug);
        setSortOrder(String(f.sortOrder));
        setLoading(false);
      })
      .catch(() => {
        alert('Failed to load filter option');
        router.push('/admin/facets');
      });
  }, [id, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateFacet(id, {
        label,
        slug,
        sortOrder: parseInt(sortOrder, 10) || 0,
      });
      router.push('/admin/facets');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update filter option');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading filter option details…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Filter Option</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Modify the label, URL slug, or sorting order for this filter option
      </p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            {/* Filter Type (Readonly) */}
            <div>
              <label className="text-sm font-medium">Filter Type</label>
              <Input value={FACET_KEY_LABELS[facetKey] || facetKey} className="mt-1.5 opacity-70 bg-accent" disabled />
            </div>

            {/* Label */}
            <div>
              <label className="text-sm font-medium">Label / Name</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-sm font-medium">Slug</label>
              <p className="text-xs text-muted-foreground mb-1.5">URL-friendly identifier</p>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1.5 w-24"
                min="0"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || !label || !slug}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/facets')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
