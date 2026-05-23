'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
  // Dynamically grab the correct icon component
  const IconComponent = (LucideIcons as any)[icon];

  return (
    <Link href={`/category/${slug}`} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="h-full"
      >
        <Card className="relative h-full overflow-hidden bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-teal-500/30 transition-all duration-300 rounded-2xl">
          <CardContent className="relative flex items-center p-6 gap-5 h-full">
            {/* Icon Container */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
              {IconComponent ? <IconComponent className="size-6 stroke-[1.5]" /> : null}
            </div>

            {/* Text Content */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 line-clamp-2">
                {name}
              </h2>
              {description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  {description}
                </p>
              )}
            </div>
            
            {/* Arrow */}
            <div className="shrink-0 text-slate-300 dark:text-slate-700 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-teal-500 transition-all duration-300">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M11 5L16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
