'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROOT_TYPE_ICONS } from '@/lib/api';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
import { User, LogOut, Settings } from 'lucide-react';

export function Header({ initialRoots }: { initialRoots?: any[] }) {
  const router = useRouter();
  const [roots, setRoots] = useState<any[]>(initialRoots || []);

  useEffect(() => {
    if (!initialRoots || initialRoots.length === 0) {
      api.getRoots().then(setRoots).catch(() => {});
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
    api.getMe().then(setUser).catch(() => setUser(null));
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
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              F
            </span>
            <span className="hidden text-lg sm:inline">
              <span className="text-gradient font-extrabold">Fonix</span>{' '}
              <span className="text-muted-foreground font-semibold">Edu</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  megaOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Categories
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-1/2 top-full z-50 mt-1 w-[540px] -translate-x-1/2"
                  >
                    <div className="rounded-xl border border-border bg-popover p-5 shadow-xl">
                      <div className="grid grid-cols-3 gap-5">
                        {categoryGroups.map((group) => (
                          <div key={group.title}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {group.title}
                            </p>
                            <div className="space-y-0.5">
                              {group.items.map((item) => (
                                <Link
                                  key={item.slug}
                                  href={`/category/${item.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                    pathname?.includes(item.slug)
                                      ? 'bg-accent text-accent-foreground font-medium'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  <span className="flex size-5 shrink-0 items-center justify-center text-primary/70">
                                    {(() => {
                                      const Icon = (require('lucide-react') as any)[item.icon];
                                      return Icon ? <Icon className="size-4" /> : null;
                                    })()}
                                  </span>
                                  <span>{item.name}</span>
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
 
            {/* Quick links */}
            {roots
              .filter((n) => ['past-papers', 'teacher-guides', 'gazette', 'government-gazette'].includes(n.slug))
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    pathname?.includes(item.slug)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <SearchBar />
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-muted-foreground sm:inline font-medium max-w-[120px] truncate">
                  {user.name ? user.name : `+${user.mobile}`}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <User className="size-4 shrink-0" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border border-border">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent cursor-pointer">
                        <Settings className="size-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive cursor-pointer"
                      onClick={async () => {
                        await api.logout();
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
              <Button size="sm" render={<Link href="/login" />}>
                Sign In
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
              className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-popover border-l border-border overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="font-extrabold text-gradient">Fonix Edu</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Button>
              </div>
              <div className="flex-1 p-4 space-y-5">
                {categoryGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/category/${item.slug}`}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${
                            pathname?.includes(item.slug)
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center text-primary/70">
                            {(() => {
                              const Icon = (require('lucide-react') as any)[item.icon];
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
                  <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">
                    Hello, <span className="text-foreground">{user.name || `+${user.mobile}`}</span>
                  </div>
                )}
                <Separator />
                {user ? (
                  <div className="space-y-2 w-full">
                    <Button variant="outline" className="w-full" render={<Link href="/account" onClick={() => setMobileOpen(false)} />}>
                      My Account
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={async () => {
                        await api.logout();
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
                  <Button className="w-full" render={<Link href="/login" onClick={() => setMobileOpen(false)} />}>
                    Sign In
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
