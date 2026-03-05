'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

export function BookSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced) {
      params.set('search', debounced);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [debounced]); // eslint-disable-line

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or author..."
        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
