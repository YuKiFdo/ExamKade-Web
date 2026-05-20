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
      <section className="relative overflow-hidden border-b border-border">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background dark:from-primary/10" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[100px] animate-float" />
          <div className="absolute bottom-10 right-[15%] h-64 w-64 rounded-full bg-chart-2/10 blur-[80px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <HomeHero />
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Find exactly what you need for your studies</p>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
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
      </section>

      {/* Latest Uploads */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Latest Uploads</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Recently added documents</p>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex" render={<Link href="/search" />}>
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
      <section className="relative overflow-hidden border-t border-border py-16">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute right-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-chart-2/10 blur-[60px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to start learning?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Register via your mobile and get unlimited access to download all documents.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" render={<Link href="/login" />}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/category/past-papers" />}>
              Browse Papers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
