import { api, ROOT_TYPE_ICONS } from "@/lib/api";
import { CategoryTile } from "@/components/CategoryTile";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Library, FileText, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950/20">
      {/* Professional Portal Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 sm:py-20">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50 mb-6">
            <Library className="size-3.5" />
            <span>Academic Resource Portal</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
            Access Curriculum-Aligned <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-400">
              Study & Exam Resources
            </span>
          </h1>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Search or select a category below to browse past papers, model papers, term tests, syllabi, textbooks, and teacher guides.
          </p>

          {/* Centered Professional Search Bar */}
          <div className="mt-8 mx-auto w-full max-w-lg">
            <form action="/search" className="relative flex items-center shadow-md shadow-slate-100 dark:shadow-none">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="size-5" />
              </div>
              <Input
                name="q"
                type="search"
                placeholder="Search resources, past papers, subjects..."
                className="h-13 w-full pl-11 pr-32 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors"
              />
              <Button
                type="submit"
                className="absolute right-1.5 h-10 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 text-xs transition-colors"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16 sm:py-20 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span className="h-6 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
              Browse by Category
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Select a section to explore structured resources, question papers, and official educational documents.
            </p>
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

      {/* New Arrivals Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <span className="h-6 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
                Recently Uploaded Resources
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                The latest curriculum and examination files added to the platform.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mx-auto sm:mx-0 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-4"
              render={<Link href="/search" />}
            >
              View All Resources
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>

          {latest.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-16 text-center bg-slate-50/50 dark:bg-slate-900/10">
              <FileText className="size-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No documents uploaded yet.</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please check back soon for new additions.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
