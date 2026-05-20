'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const GRADIENT_MAP: Record<string, string> = {
  'past-papers': 'from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20',
  'model-papers': 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
  'term-test-papers': 'from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20',
  syllabus: 'from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20',
  'teacher-guides': 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
  'text-books': 'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20',
  gazette: 'from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20',
};

const ICON_BG_MAP: Record<string, string> = {
  'past-papers': 'from-violet-500 to-purple-600',
  'model-papers': 'from-blue-500 to-indigo-600',
  'term-test-papers': 'from-cyan-500 to-teal-600',
  syllabus: 'from-emerald-500 to-green-600',
  'teacher-guides': 'from-amber-500 to-orange-600',
  'text-books': 'from-rose-500 to-pink-600',
  gazette: 'from-yellow-500 to-amber-600',
};

export function CategoryTile({
  slug,
  name,
  icon,
  description,
}: {
  slug: string;
  name: string;
  icon: string;
  description?: string;
}) {
  const gradient = GRADIENT_MAP[slug] || 'from-primary/10 to-primary/5';
  const iconBg = ICON_BG_MAP[slug] || 'from-primary to-primary';
  
  // Dynamically grab the correct icon component
  const IconComponent = (LucideIcons as any)[icon];

  return (
    <Link href={`/category/${slug}`} className="group block">
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="relative overflow-hidden transition-colors duration-300 hover:border-primary/40 shadow-sm hover:shadow-xl dark:shadow-black/20">
          {/* Hover gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          />

          <CardContent className="relative flex flex-col items-center p-6 text-center">
            {/* Icon */}
            <motion.div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${iconBg} text-white shadow-lg`}
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {IconComponent ? <IconComponent className="size-6" /> : null}
            </motion.div>

            <h2 className="mt-4 text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
              {name}
            </h2>

            {description && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 px-1">
                {description}
              </p>
            )}

            {/* Arrow on hover */}
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
              <span>Browse</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
