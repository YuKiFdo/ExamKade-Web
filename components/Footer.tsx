import Link from 'next/link';
import { ROOT_TYPE_ICONS } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export function Footer({ initialRoots }: { initialRoots?: any[] }) {
  const roots = initialRoots || [];
  const examSlugs = ['past-papers', 'model-papers', 'term-test-papers'];

  const footerGroups = [
    {
      title: 'Exam Papers',
      items: roots
        .filter((n) => examSlugs.includes(n.slug))
        .map((n) => ({ ...n, icon: ROOT_TYPE_ICONS[n.rootType] || 'FileText' })),
    },
    {
      title: 'Study Materials',
      items: roots
        .filter((n) => !examSlugs.includes(n.slug))
        .map((n) => ({ ...n, icon: ROOT_TYPE_ICONS[n.rootType] || 'Book' })),
    },
  ];
  return (
    <footer className="mt-auto border-t border-border/50 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-black tracking-tight group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md transition-transform group-hover:scale-105">
                <FileText className="size-5" />
              </span>
              <span className="text-xl">
                <span className="text-foreground">Exam</span>
                <span className="text-teal-600">Kade</span>
              </span>
            </Link>
            <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Sri Lanka&apos;s comprehensive education resource platform. Access past papers,
              model papers, term tests, syllabi, teacher&apos;s guides, text books and government
              gazettes all in one place.
            </p>
          </div>

          {/* Category links */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/category/${item.slug}`}
                      className="group flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 transition-all">
                        {(() => {
                          const Icon = (require('lucide-react') as any)[item.icon];
                          return Icon ? <Icon className="size-3.5" /> : null;
                        })()}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-12 bg-border/50" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} ExamKade. All rights reserved.
          </p>
          <p className="text-xs font-medium text-slate-500">
            Content published for educational purposes. Copyright belongs to respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
