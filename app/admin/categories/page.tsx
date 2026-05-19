'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Category = {
  id: string;
  name: string;
  slug: string;
  rootType: string;
  parentId: string | null;
  sortOrder: number;
  parent?: { id: string; name: string } | null;
};

const ROOT_TYPE_LABELS: Record<string, string> = {
  PAST_PAPERS: 'Past Papers',
  MODEL_PAPERS: 'Model Papers',
  TERM_TEST: 'Term Test Papers',
  SYLLABUS: 'Syllabus',
  TEACHERS_GUIDE: "Teacher's Guides",
  TEXT_BOOKS: 'Text Books',
  GAZETTE: 'Government Gazette',
};

const ROOT_TYPE_COLORS: Record<string, string> = {
  PAST_PAPERS: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  MODEL_PAPERS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TERM_TEST: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  SYLLABUS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  TEACHERS_GUIDE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TEXT_BOOKS: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  GAZETTE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    adminApi
      .categories()
      .then((cats) => {
        setCategories(cats as Category[]);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  };

  useEffect(load, [router]);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteCategory(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  // Group by rootType
  const grouped = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    if (!acc[cat.rootType]) acc[cat.rootType] = [];
    acc[cat.rootType].push(cat);
    return acc;
  }, {});

  if (loading) {
    return <p className="text-muted-foreground">Loading categories…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage document categories and subcategories
          </p>
        </div>
        <Button render={<Link href="/admin/categories/new" />}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Category
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([rootType, cats]) => {
          const roots = cats.filter((c) => !c.parentId);
          const children = cats.filter((c) => c.parentId);

          return (
            <Card key={rootType}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={ROOT_TYPE_COLORS[rootType] || ''} variant="secondary">
                      {ROOT_TYPE_LABELS[rootType] || rootType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {cats.length} categor{cats.length === 1 ? 'y' : 'ies'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {roots.map((root) => {
                    const subs = children.filter((c) => c.parentId === root.id);
                    return (
                      <div key={root.id}>
                        {/* Root category row */}
                        <div className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                            </svg>
                            <div>
                              <p className="font-medium text-sm">{root.name}</p>
                              <p className="text-xs text-muted-foreground">/{root.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {subs.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {subs.length} sub
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" render={<Link href={`/admin/categories/${root.id}`} />}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => remove(root.id, root.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Subcategories */}
                        {subs.length > 0 && (
                          <div className="ml-8 border-l-2 border-border pl-4 space-y-1">
                            {subs.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
                                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                                  </svg>
                                  <div>
                                    <p className="text-sm">{sub.name}</p>
                                    <p className="text-xs text-muted-foreground">/{sub.slug}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" render={<Link href={`/admin/categories/${sub.id}`} />}>
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => remove(sub.id, sub.name)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
