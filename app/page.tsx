import { api, ROOT_TYPE_ICONS } from "@/lib/api";
import { CategoryTile } from "@/components/CategoryTile";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { HomeHero } from "@/components/HomeHero";
import Link from "next/link";

export default async function HomePage() {
  let latest: Awaited<ReturnType<typeof api.getLatest>> = [];
  let roots: any[] = [];
  try {
    const [latestData, rootsData] = await Promise.all([
      api.getLatest(12).catch(() => []),
      api.getRoots().catch(() => []),
    ]);
    latest = latestData;
    roots = rootsData;
  } catch {
    latest = [];
    roots = [];
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#FFF5F0] via-background to-[#F0F2FF] dark:from-background dark:to-background">
        <HomeHero />
      </section>

      {/* Categories Grid */}
      <section className="bg-slate-50/50 dark:bg-slate-900/20 py-20 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-12 text-center sm:text-left flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-foreground">
              Browse by <span className="text-orange-500 dark:text-orange-400">Category</span>
            </h2>
          </div>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {roots.map((cat) => (
              <CategoryTile
                key={cat.slug}
                slug={cat.slug}
                name={cat.name}
                icon={ROOT_TYPE_ICONS[cat.rootType] || 'FileText'}
                description={cat.description || undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Uploads */}
      <section className="bg-white dark:bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-12 text-center sm:text-left flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-foreground">
              New <span className="text-orange-500 dark:text-orange-400">Arrivals</span>
            </h2>
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-full border-2 hover:bg-slate-50" render={<Link href="/search" />}>
                View all
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1">
                  <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Button>
          </div>
          {latest.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg text-muted-foreground">No documents yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon for new uploads.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-32 px-4 lg:px-6 bg-slate-50 dark:bg-slate-900/20 border-t border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 sm:text-5xl md:text-6xl tracking-tight">
            Ready to start <span className="text-teal-600">learning?</span>
          </h2>
          <p className="mt-6 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
            Register via your mobile and get unlimited access to download all documents.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full bg-teal-600 px-10 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-teal-700 hover:shadow-teal-500/25 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
            >
              Get Started Now
            </Link>
            <Link 
              href="/category/past-papers"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 text-base font-bold text-slate-600 dark:text-slate-300 transition-all hover:border-teal-600 hover:text-teal-600 focus:outline-none focus:ring-4 focus:ring-slate-500/20"
            >
              Browse Papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
