'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROOT_TYPES = [
  { value: 'PAST_PAPERS', label: 'Past Papers' },
  { value: 'MODEL_PAPERS', label: 'Model Papers' },
  { value: 'TERM_TEST', label: 'Term Test Papers' },
  { value: 'SYLLABUS', label: 'Syllabus' },
  { value: 'TEACHERS_GUIDE', label: "Teacher's Guides" },
  { value: 'TEXT_BOOKS', label: 'Text Books' },
  { value: 'GAZETTE', label: 'Government Gazette' },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string; rootType: string; parentId: string | null }[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [rootType, setRootType] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [allowedFilters, setAllowedFilters] = useState<string[]>([]);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminApi.categories().then((cats) => setCategories(cats as typeof categories)).catch(() => router.push('/admin/login'));
  }, [router]);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  // Filter parent options by selected rootType (only root-level categories)
  const parentOptions = categories.filter(
    (c) => c.rootType === rootType && !c.parentId
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createCategory({
        name,
        slug,
        rootType,
        parentId: parentId || undefined,
        sortOrder: parseInt(sortOrder, 10) || 0,
        allowedFilters,
      });
      router.push('/admin/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">New Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new category or subcategory for organizing documents
      </p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            {/* Root Type */}
            <div>
              <label className="text-sm font-medium">Root Type</label>
              <Select value={rootType} onValueChange={(val) => { setRootType(val || ''); setParentId(''); }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select root type…" />
                </SelectTrigger>
                <SelectContent>
                  {ROOT_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parent Category (optional) */}
            {rootType && parentOptions.length > 0 && (
              <div>
                <label className="text-sm font-medium">Parent Category (optional)</label>
                <p className="text-xs text-muted-foreground mb-1.5">Leave empty to create a root-level category</p>
                <Select value={parentId} onValueChange={(val) => setParentId(val || '')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None (root level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (root level)</SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                placeholder="e.g., G.C.E. Ordinary Level"
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
                placeholder="gce-ordinary-level"
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

            {/* Allowed Filters */}
            <div>
              <label className="text-sm font-medium">Allowed Filters (Dynamic Facets)</label>
              <p className="text-xs text-muted-foreground mb-2">Select which filter dropdowns should be visible for this category. Leave empty to fall back to the default filters for the root type.</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { value: 'EXAM', label: 'Exam' },
                  { value: 'GRADE', label: 'Grade' },
                  { value: 'SUBJECT', label: 'Subject' },
                  { value: 'YEAR', label: 'Year' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'TERM', label: 'Term' },
                  { value: 'PROVINCE', label: 'Province' },
                ].map((f) => {
                  const checked = allowedFilters.includes(f.value);
                  return (
                    <label key={f.value} className="flex items-center gap-2 text-sm select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedFilters([...allowedFilters, f.value]);
                          } else {
                            setAllowedFilters(allowedFilters.filter((x) => x !== f.value));
                          }
                        }}
                        className="rounded border border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading || !rootType || !name || !slug}>
                {loading ? 'Creating…' : 'Create Category'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
