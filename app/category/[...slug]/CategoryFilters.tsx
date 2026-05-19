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
import { Card, CardContent } from '@/components/ui/card';

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
    <Card>
      <CardContent className="flex flex-wrap gap-3 p-4">
        {facetOptions.map(({ key, options }) => {
          const param = FACET_PARAM[key];
          const activeValue = param ? searchParams.get(param) || 'ALL' : 'ALL';
          
          return (
            <div key={key} className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {FACET_LABELS[key] || key}
              </label>
              <Select
                value={activeValue}
                onValueChange={(val) => {
                  if (val) handleFilter(key, val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.slug}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
