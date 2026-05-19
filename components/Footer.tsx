import Link from 'next/link';
import { ROOT_TYPE_ICONS } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
    <footer className="mt-auto border-t border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground">
                F
              </span>
              <span>
                <span className="text-gradient font-extrabold">Fonix</span>{' '}
                <span className="text-muted-foreground font-semibold">Edu</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Sri Lanka&apos;s comprehensive education resource platform. Access past papers,
              model papers, term tests, syllabi, teacher&apos;s guides, text books and government
              gazettes — all in one place.
            </p>
          </div>

          {/* Category links */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/category/${item.slug}`}
                      className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center text-primary/60 transition-colors group-hover:text-primary">
                        {(() => {
                          const Icon = (require('lucide-react') as any)[item.icon];
                          return Icon ? <Icon className="size-4" /> : null;
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

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fonix Edu. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Content published for educational purposes. Copyright belongs to respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
