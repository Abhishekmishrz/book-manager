'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ReadingStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: '📖 Reading', value: 'reading' },
  { label: '✅ Completed', value: 'completed' },
  { label: '🔖 Want to Read', value: 'want_to_read' },
  { label: '⏸ Paused', value: 'paused' },
  { label: '❌ Dropped', value: 'dropped' },
  { label: '♥ Favourites', value: 'favourite' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Rating', value: 'rating' },
];

export function BookFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatus = searchParams.get('status') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatus = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('favourite');
    params.delete('page');
    if (val === 'favourite') {
      params.set('favourite', 'true');
    } else if (val !== 'all') {
      params.set('status', val);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFav = searchParams.get('favourite') === 'true';
  const computedActive = activeFav ? 'favourite' : activeStatus;

  return (
    <div className="space-y-3">
      {/* Status pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatus(f.value)}
            className={cn(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
              computedActive === f.value
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-sm">Sort:</span>
        <select
          value={activeSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="bg-surface-2 border border-border text-text-primary text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
