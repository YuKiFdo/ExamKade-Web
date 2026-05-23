'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMeAction, logoutAction, unsubscribeAction } from '@/app/actions/auth';
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
    getMeAction()
      .then(setUser)
      .catch(() => router.push('/login'));
  }, [router]);

  const logout = async () => {
    await logoutAction();
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
        <Card className="w-full shadow-2xl rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <CardHeader className="flex flex-col items-center space-y-4 pb-8 pt-10 text-center">
            <div className="flex size-24 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 shadow-sm border border-teal-100 dark:border-teal-900/50">
              <UserCircle className="size-14 stroke-[1.5]" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">My Account</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-6 shadow-sm">
              <dl className="space-y-5 text-sm">
                {user.name && (
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold">
                      <User className="size-5 shrink-0 text-teal-600" />
                      <dt>Name</dt>
                    </div>
                    <dd className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{user.name}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold">
                    <Phone className="size-5 shrink-0 text-teal-600" />
                    <dt>Mobile</dt>
                  </div>
                  <dd className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">+{user.mobile}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold">
                    {active ? (
                      <ShieldCheck className="size-5 shrink-0 text-teal-600" />
                    ) : (
                      <ShieldAlert className="size-5 shrink-0 text-orange-500" />
                    )}
                    <dt>Status</dt>
                  </div>
                  <dd>
                    <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400 border-none px-3 py-1 font-bold text-xs rounded-full' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-none px-3 py-1 font-bold text-xs rounded-full'}>
                      {user.subscriptionStatus}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
            
            {!active && (
              <div className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30 p-4 text-center text-[15px] text-orange-700 dark:text-orange-400 font-bold shadow-sm">
                Register via your mobile operator to enable downloads.
              </div>
            )}

            {active && (
              <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-5">
                <h3 className="text-sm font-black text-red-800 dark:text-red-400 mb-2 uppercase tracking-wide">Danger Zone</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium mb-4">
                  Unsubscribing will immediately revoke your download access and you will no longer be billed.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="rounded-full font-bold shadow-md shadow-red-500/20"
                  onClick={async () => {
                    if (confirm('Are you sure you want to unsubscribe?')) {
                      try {
                        await unsubscribeAction();
                        alert('Unsubscribed successfully');
                        getMeAction().then(setUser);
                      } catch (err) {
                        alert(err instanceof Error ? err.message : 'Failed to unsubscribe');
                      }
                    }
                  }}
                >
                  Unsubscribe
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 sm:flex-row pb-10 pt-2 px-6">
            <Button variant="outline" className="w-full rounded-full h-12 font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-600 hover:text-teal-600 transition-colors" render={<Link href="/" />}>
              Browse documents
            </Button>
            <Button variant="destructive" className="w-full rounded-full h-12 font-bold bg-slate-800 hover:bg-slate-900 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border dark:border-red-900/50" onClick={logout}>
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
