import { api, ROOT_TYPE_ICONS } from "@/lib/api";
import { CategoryTile } from "@/components/CategoryTile";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:px-6 lg:py-28">
          <div className="animate-fade-in-up">
            <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Sri Lanka Education Platform
            </Badge>
          </div>

          <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl stagger-1" style={{ opacity: 0 }}>
            <span className="text-foreground">All Your Study</span>
            <br />
            <span className="text-gradient">Resources in One Place</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
            Past papers, model papers, term tests, syllabi, teacher&apos;s guides, text books
            and government gazette — preview free, download with subscription.
          </p>

          {/* Hero search */}
          <div className="mx-auto mt-8 max-w-xl animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
            <form action="/search" className="relative">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <Input
                name="q"
                type="search"
                placeholder="Search past papers, guides, gazette..."
                className="h-12 w-full rounded-xl pl-12 pr-28 text-base shadow-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg"
              >
                Search
              </Button>
            </form>
          </div>

          {/* Quick stats */}
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-8 animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
            {[
              { value: '7', label: 'Categories' },
              { value: '3', label: 'Languages' },
              { value: 'Free', label: 'Preview' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                {i > 0 && <div className="h-8 w-px bg-border -ml-8" />}
                <div className="text-center">
                  <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          {roots.map((cat, i) => (
            <div key={cat.slug} className={`animate-fade-in-up stagger-${Math.min(i + 1, 7)}`} style={{ opacity: 0 }}>
              <CategoryTile
                slug={cat.slug}
                name={cat.name}
                icon={ROOT_TYPE_ICONS[cat.rootType] || 'FileText'}
                description={cat.description || undefined}
              />
            </div>
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
