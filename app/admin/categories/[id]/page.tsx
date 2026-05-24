'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const DEFAULT_ROOT_FILTERS: Record<string, string[]> = {
  PAST_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
  MODEL_PAPERS: ['EXAM', 'SUBJECT', 'YEAR', 'MEDIUM'],
  TERM_TEST: ['GRADE', 'SUBJECT', 'YEAR', 'TERM', 'PROVINCE'],
  SYLLABUS: ['GRADE', 'SUBJECT', 'MEDIUM'],
  TEACHERS_GUIDE: ['GRADE', 'SUBJECT', 'MEDIUM'],
  TEXT_BOOKS: ['GRADE', 'SUBJECT', 'MEDIUM'],
  GAZETTE: [],
};

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [allowedFilters, setAllowedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .categories()
      .then((cats) => {
        const cat = (cats as { id: string; name: string; rootType: string; slug: string; sortOrder?: number; allowedFilters?: string[] }[]).find(
          (c) => c.id === id
        );
        if (cat) {
          setName(cat.name);
          setSlug(cat.slug);
          setSortOrder(String(cat.sortOrder || 0));
          
          // Pre-populate with default filters if allowedFilters is empty
          const filters = cat.allowedFilters && cat.allowedFilters.length > 0
            ? cat.allowedFilters
            : DEFAULT_ROOT_FILTERS[cat.rootType] || [];
          setAllowedFilters(filters);
        }
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [id, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateCategory(id, {
        name,
        slug,
        sortOrder: parseInt(sortOrder, 10) || 0,
        allowedFilters,
      });
      router.push('/admin/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      router.push('/admin/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update category details</p>

      <Card className="mt-6 max-w-xl">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

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

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="ml-auto"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
