'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle } from 'lucide-react';

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
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const active = user.subscriptionStatus === 'ACTIVE';

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-4 pb-8 pt-10 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle className="size-12" />
          </div>
          <CardTitle className="text-2xl font-bold">My Account</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <dl className="space-y-4 text-sm">
              {user.name && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">{user.name}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="font-medium text-foreground">+{user.mobile}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Account Status</dt>
                <dd>
                  <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                    {user.subscriptionStatus}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
          
          {!active && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center text-sm text-amber-600 dark:text-amber-400">
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
    </div>
  );
}
