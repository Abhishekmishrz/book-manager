'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { BookCard } from '@/components/books/BookCard';
import { BookFilters } from '@/components/books/BookFilters';
import { BookSearch } from '@/components/books/BookSearch';
import { BookCardSkeleton } from '@/components/ui/Skeleton';
import { ToastProvider } from '@/components/ui/Toast';
import { ReadingStatus } from '@/types';
import { cn } from '@/lib/utils';

function LibraryContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();

  const status = searchParams.get('status') as ReadingStatus | null;
  const genre = searchParams.get('genre') || undefined;
  const search = searchParams.get('search') || undefined;
  const sort = (searchParams.get('sort') as 'newest' | 'oldest' | 'title' | 'author' | 'rating') || 'newest';
  const favourite = searchParams.get('favourite') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { books, pagination, isLoading } = useBooks({ status: status || undefined, genre, search, sort, favourite, page });

  const year = new Date().getFullYear();
  const completedThisYear = books.filter(b => b.status === 'completed' && b.finishedAt && new Date(b.finishedAt).getFullYear() === year).length;
  const goalProgress = user ? Math.min(100, Math.round((completedThisYear / user.readingGoal) * 100)) : 0;

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">My Library</h1>
          <p className="text-text-muted mt-1">
            {pagination?.total ?? 0} book{pagination?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/add"
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Book
        </Link>
      </div>

      {/* Goal progress bar */}
      {user && user.readingGoal > 0 && (
        <div className="card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">{year} Reading Goal</span>
            <span className="text-text-primary font-medium">{completedThisYear} / {user.readingGoal} books</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Search */}
      <BookSearch />

      {/* Filters + view toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <BookFilters />
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setView('grid')}
            className={cn('px-2.5 py-1.5 rounded text-sm transition-colors', view === 'grid' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary')}
          >
            ▦
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('px-2.5 py-1.5 rounded text-sm transition-colors', view === 'list' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary')}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Books grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <span className="text-6xl">📭</span>
          <h3 className="font-display text-xl font-semibold text-text-primary">No books here yet</h3>
          <p className="text-text-muted max-w-sm">
            {search ? `No results for "${search}". Try a different search.` : 'Start building your library by adding a book.'}
          </p>
          {!search && (
            <Link href="/add" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors mt-2">
              Add your first book
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={view === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
            : 'space-y-3'
          }>
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })}`}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                    page === p ? 'bg-accent text-white' : 'border border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="p-8 text-text-muted">Loading...</div>}>
        <LibraryContent />
      </Suspense>
    </ToastProvider>
  );
}
