'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FACET_KEYS = [
  { value: 'EXAM', label: 'Exam Type' },
  { value: 'GRADE', label: 'Grade' },
  { value: 'SUBJECT', label: 'Subject' },
  { value: 'YEAR', label: 'Year' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'TERM', label: 'Term' },
  { value: 'PROVINCE', label: 'Province' },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewFacetPage() {
  const router = useRouter();
  const [facetKey, setFacetKey] = useState('');
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoSlug && label) {
      setSlug(slugify(label));
    }
  }, [label, autoSlug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facetKey) {
      alert('Please select a Filter Type');
      return;
    }
    setLoading(true);
    try {
      await adminApi.createFacet({
        facetKey,
        label,
        slug,
        sortOrder: parseInt(sortOrder, 10) || 0,
      });
      router.push('/admin/facets');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create filter option');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">New Filter Option</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new option (e.g. a specific Grade, Subject, or Medium) for filtering documents
      </p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            {/* Filter Type */}
            <div>
              <label className="text-sm font-medium">Filter Type</label>
              <Select value={facetKey} onValueChange={(val) => setFacetKey(val || '')}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select filter type…" />
                </SelectTrigger>
                <SelectContent>
                  {FACET_KEYS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div>
              <label className="text-sm font-medium">Label / Name</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1.5"
                placeholder="e.g., Sinhala, Grade 11, Western"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-sm font-medium">Slug</label>
              <p className="text-xs text-muted-foreground mb-1.5">URL-friendly identifier (auto-generated from name)</p>
              <Input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                className="mt-1"
                placeholder="e.g., sinhala, grade-11"
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
              <Button type="submit" disabled={loading || !facetKey || !label || !slug}>
                {loading ? 'Creating…' : 'Create Option'}
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
