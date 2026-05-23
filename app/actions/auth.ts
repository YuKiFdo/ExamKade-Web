'use server';

import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Cookie: `access_token=${token.value}` } : {}),
  };
}

export async function requestOtpAction(mobile: string, operator?: 'DIALOG' | 'MOBITEL') {
  const res = await fetch(`${API_URL}/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operator ? { mobile, operator } : { mobile }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Failed to request OTP');
  }
  
  return res.json();
}

export async function verifyOtpAction(referenceNo: string, otp: string, name?: string) {
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referenceNo, otp, name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Invalid OTP');
  }

  // Parse Set-Cookie header
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    const match = setCookieHeader.match(/access_token=([^;]+)/);
    if (match) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'access_token',
        value: match[1],
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  return res.json();
}

export async function logoutAction() {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  }).catch(() => {});
  
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
}


export async function getMeAction() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: await getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Unauthorized');
  }
  
  return res.json();
}

export async function unsubscribeAction() {
  const res = await fetch(`${API_URL}/auth/unsubscribe`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Failed to unsubscribe');
  }
  
  return res.json();
}
