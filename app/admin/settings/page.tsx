'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getLoginWarning()
      .then((data) => {
        setShowWarning(data.showWarning);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const newValue = !showWarning;
      await adminApi.toggleLoginWarning(newValue);
      setShowWarning(newValue);
    } catch {
      alert('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Login Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-border p-5 transition-colors hover:bg-accent/40">
            <div className="space-y-1 pr-4">
              <p className="font-semibold text-sm">Service Fee Notice</p>
              <p className="text-sm text-muted-foreground">
                When enabled, users will see <strong>&quot;Rs.3 daily service fee applicable&quot;</strong> on the login page before subscribing.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showWarning}
              disabled={saving}
              onClick={handleToggle}
              className={`
                relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:cursor-not-allowed disabled:opacity-50
                ${showWarning ? 'bg-primary' : 'bg-muted'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0
                  transition-transform duration-200 ease-in-out
                  ${showWarning ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
