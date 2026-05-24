'use client';

import Link from 'next/link';
import type { Document } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export function DocumentCard({ doc }: { doc: Document }) {
  const facets = doc.facets?.map((f) => f.facetValue.label).join(' · ') || '';

  return (
    <Link href={`/doc/${doc.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="h-full"
      >
        <Card className="relative h-full flex flex-col overflow-hidden bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-500/30 transition-all duration-300 rounded-2xl p-6">
          
          <div className="flex items-start justify-between mb-4">
            {/* Category badge */}
            {doc.category && (
              <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold border-none px-3 py-1 text-xs">
                {doc.category.name}
              </Badge>
            )}
            
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <FileText className="size-4" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold leading-snug text-slate-800 dark:text-slate-100 transition-colors group-hover:text-indigo-600 line-clamp-2 mb-2">
            {doc.title}
          </h3>

          {/* Facets */}
          {facets && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mb-6">
              {facets}
            </p>
          )}

          {/* Bottom row */}
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {doc.files && doc.files.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {doc.files.map((f) => (
                  <Badge key={f.id} variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    {f.medium}
                  </Badge>
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 text-xs text-indigo-600 font-bold opacity-0 transition-all duration-300 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
              <span>View</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
