'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, User, Phone, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    mobile: string;
    subscriptionStatus: string;
    operator: string;
    name?: string | null;
  } | null>(null);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => router.push('/login'));
  }, [router]);

  const logout = async () => {
    await api.logout();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="text-sm font-medium text-muted-foreground">Loading your account…</div>
        </div>
      </div>
    );
  }

  const active = user.subscriptionStatus === 'ACTIVE';

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-xl border-border bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-col items-center space-y-4 pb-8 pt-10 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs">
              <UserCircle className="size-12" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">My Account</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border bg-card/50 p-5 shadow-xs">
              <dl className="space-y-4 text-sm">
                {user.name && (
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="size-4 shrink-0 text-primary/70" />
                      <dt>Name</dt>
                    </div>
                    <dd className="font-semibold text-foreground">{user.name}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 shrink-0 text-primary/70" />
                    <dt>Mobile</dt>
                  </div>
                  <dd className="font-semibold text-foreground">+{user.mobile}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {active ? (
                      <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="size-4 shrink-0 text-amber-500" />
                    )}
                    <dt>Account Status</dt>
                  </div>
                  <dd>
                    <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 px-2.5 py-0.5 font-semibold text-xs' : 'px-2.5 py-0.5 font-semibold text-xs'}>
                      {user.subscriptionStatus}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
            
            {!active && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-center text-sm text-amber-600 dark:text-amber-400 font-medium">
                Register via your mobile operator to enable downloads.
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 sm:flex-row pb-8">
            <Button variant="outline" className="w-full" render={<Link href="/" />}>
              Browse documents
            </Button>
            <Button variant="destructive" className="w-full" onClick={logout}>
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
