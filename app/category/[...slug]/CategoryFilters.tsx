'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { FacetValue } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FACET_LABELS: Record<string, string> = {
  EXAM: 'Exam',
  GRADE: 'Grade',
  SUBJECT: 'Subject',
  YEAR: 'Year',
  MEDIUM: 'Medium',
  TERM: 'Term',
  PROVINCE: 'Province',
};

const FACET_PARAM: Record<string, string> = {
  EXAM: 'exam',
  GRADE: 'grade',
  SUBJECT: 'subject',
  YEAR: 'year',
  MEDIUM: 'medium',
  TERM: 'term',
  PROVINCE: 'province',
};

export function CategoryFilters({
  facetOptions,
  currentPath,
}: {
  facetOptions: { key: string; options: FacetValue[] }[];
  currentPath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (facetKey: string, slug: string) => {
    const param = FACET_PARAM[facetKey];
    if (!param) return;
    
    // We clone the existing params so we can combine filters
    const q = new URLSearchParams(searchParams.toString());
    
    if (slug === 'ALL') {
      q.delete(param);
    } else {
      q.set(param, slug);
    }
    
    // Push back to the exact same category page, with updated params
    router.push(`/category/${currentPath}?${q.toString()}`);
  };

  if (facetOptions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 shadow-sm">
      <div className="flex flex-wrap gap-4">
        {facetOptions.map(({ key, options }) => {
          const param = FACET_PARAM[key];
          const activeValue = param ? searchParams.get(param) || 'ALL' : 'ALL';
          
          return (
            <div key={key} className="min-w-[140px] flex-1">
              <label className="mb-2 block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {FACET_LABELS[key] || key}
              </label>
              <Select
                value={activeValue}
                onValueChange={(val) => {
                  if (val) handleFilter(key, val);
                }}
              >
                <SelectTrigger className="w-full h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl font-medium text-sm">
                  <SelectValue placeholder="All">
                    {activeValue === 'ALL'
                      ? 'All'
                      : options.find((o) => o.slug === activeValue)?.label ||
                        activeValue.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <SelectItem value="ALL" className="rounded-lg">All</SelectItem>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.slug} className="rounded-lg">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
