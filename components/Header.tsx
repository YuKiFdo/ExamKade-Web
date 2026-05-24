'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROOT_TYPE_ICONS } from '@/lib/api';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getMeAction, logoutAction } from '@/app/actions/auth';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import * as LucideIcons from 'lucide-react';
import { User, LogOut, Settings, FileText } from 'lucide-react';

export function Header({ initialRoots }: { initialRoots?: any[] }) {
  const router = useRouter();
  const [roots, setRoots] = useState<any[]>(initialRoots || []);

  useEffect(() => {
    if (!initialRoots || initialRoots.length === 0) {
      api.getRoots().then(setRoots).catch(() => { });
    }
  }, [initialRoots]);

  const examSlugs = ['past-papers', 'model-papers', 'term-test-papers'];
  const officialSlugs = ['gazette', 'government-gazette'];

  const categoryGroups = [
    {
      title: 'Exam Papers',
      items: roots
        .filter((n) => examSlugs.includes(n.slug))
        .map((n) => ({ ...n, icon: ROOT_TYPE_ICONS[n.rootType] || 'FileText' })),
    },
    {
      title: 'Study Materials',
      items: roots
        .filter((n) => !examSlugs.includes(n.slug) && !officialSlugs.includes(n.slug))
        .map((n) => ({ ...n, icon: ROOT_TYPE_ICONS[n.rootType] || 'Book' })),
    },
    {
      title: 'Official Documents',
      items: roots
        .filter((n) => officialSlugs.includes(n.slug))
        .map((n) => ({ ...n, icon: ROOT_TYPE_ICONS[n.rootType] || 'Newspaper' })),
    },
  ];
  const pathname = usePathname();
  const [user, setUser] = useState<{ mobile: string; name?: string | null } | null>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getMeAction().then(setUser).catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 dark:bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Left: Logo */}
          <div className="flex lg:w-[250px] items-center justify-start shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight group">
              <span className="text-xl">
                <span className="text-foreground">Exam</span>
                <span className="text-indigo-600">Kade</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-6 xl:gap-8">
            <Link href="/" className="text-[15px] font-bold text-foreground transition-colors hover:text-indigo-600">
              Home
            </Link>

            <div
              className="relative group"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 text-[15px] font-bold transition-colors hover:text-indigo-600 ${megaOpen ? 'text-indigo-600' : 'text-foreground'
                  }`}
              >
                Categories
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-200 ${megaOpen ? 'rotate-180 text-indigo-600' : 'text-foreground/50'}`}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-1/2 top-[calc(100%+1.5rem)] z-50 w-[540px] -translate-x-1/2 pt-2"
                  >
                    <div className="rounded-2xl border border-border/50 bg-white dark:bg-slate-900 p-6 shadow-2xl">
                      <div className="grid grid-cols-3 gap-6">
                        {categoryGroups.map((group) => (
                          <div key={group.title}>
                            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.items.map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/category/${item.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${pathname?.includes(item.slug)
                                      ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                      : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                  <span className={`flex size-5 shrink-0 items-center justify-center transition-colors ${pathname?.includes(item.slug) ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-indigo-500'}`}>
                                    {(() => {
                                      const Icon = (LucideIcons as any)[item.icon];
                                      return Icon ? <Icon className="size-4" strokeWidth={2.5} /> : null;
                                    })()}
                                  </span>
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {roots
              .filter((n) => ['past-papers', 'teacher-guides', 'model-papers'].includes(n.slug))
              .slice(0, 3)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className={`text-[15px] font-bold transition-colors whitespace-nowrap ${pathname?.includes(item.slug) ? 'text-indigo-600' : 'text-foreground hover:text-indigo-600'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Right: Controls */}
          <div className="flex lg:w-[250px] items-center justify-end gap-3 lg:gap-5 shrink-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-bold sm:inline max-w-[120px] truncate text-foreground">
                  {user.name ? user.name : `+${user.mobile}`}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" className="rounded-full gap-2 border-2 px-5 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                        <User className="size-4 shrink-0" />
                        Account
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-white dark:bg-slate-900 border border-border/50 shadow-xl p-2">
                    <DropdownMenuItem
                      render={
                        <Link href="/account" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                          <Settings className="size-4" />
                          My Account
                        </Link>
                      }
                    />
                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                    <DropdownMenuItem
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      onClick={async () => {
                        await logoutAction();
                        setUser(null);
                        router.push('/');
                        router.refresh();
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button variant="outline" className="rounded-full px-8 font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800" render={<Link href="/login" />}>
                Login
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 lg:hidden rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white dark:bg-slate-900 border-l border-border/50 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/50 p-5">
                <div className="flex items-center gap-2 font-bold tracking-tight group">
                  <span className="text-lg">
                    <span className="text-foreground">Exam</span>
                    <span className="text-indigo-600">Kade</span>
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </Button>
              </div>
              <div className="flex-1 p-5 space-y-6">
                {categoryGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/category/${item.slug}`}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${pathname?.includes(item.slug)
                              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'text-foreground'
                            }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center text-indigo-600/70">
                            {(() => {
                              const Icon = (LucideIcons as any)[item.icon];
                              return Icon ? <Icon className="size-4" /> : null;
                            })()}
                          </span>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                {user && (
                  <div className="px-3 py-1 text-sm font-bold text-muted-foreground">
                    Hello, <span className="text-foreground">{user.name || `+${user.mobile}`}</span>
                  </div>
                )}
                <Separator className="bg-border/50" />
                {user ? (
                  <div className="space-y-3 w-full">
                    <Button variant="outline" className="w-full rounded-full border-2 font-bold hover:bg-slate-50 dark:hover:bg-slate-800" render={<Link href="/account" onClick={() => setMobileOpen(false)} />}>
                      My Account
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full rounded-full font-bold bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        await logoutAction();
                        setUser(null);
                        setMobileOpen(false);
                        router.push('/');
                        router.refresh();
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full rounded-full font-bold bg-indigo-600 hover:bg-indigo-700 text-white" render={<Link href="/login" onClick={() => setMobileOpen(false)} />}>
                    Login
                  </Button>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
