'use server';

import { API_URL } from '@/lib/api';

export async function getLoginWarningAction(): Promise<{ showWarning: boolean }> {
  try {
    const res = await fetch(`${API_URL}/auth/settings/login-warning`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { showWarning: false };
    return res.json();
  } catch {
    return { showWarning: false };
  }
}
