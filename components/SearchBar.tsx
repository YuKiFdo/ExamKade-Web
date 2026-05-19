'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      className="hidden md:block"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search documents…"
          className="w-48 pl-9 lg:w-64"
        />
      </div>
    </form>
  );
}
