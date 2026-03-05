'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStats } from '@/hooks/useStats';
import { useAuthorPhoto } from '@/hooks/useAuthorPhoto';
import { StarRating } from '@/components/ui/StarRating';
import { Skeleton } from '@/components/ui/Skeleton';
import { AuthorData } from '@/types';

function AuthorCard({ a }: { a: AuthorData }) {
  const photoUrl = useAuthorPhoto(a.author);
  const [imgError, setImgError] = useState(false);
  const topGenre = a.genres?.filter(Boolean)[0];

  return (
    <Link
      href={`/library?search=${encodeURIComponent(a.author)}`}
      className="card-hover p-5 space-y-4 block"
    >
      {/* Author avatar */}
      <div className="flex items-center gap-3">
        {photoUrl && !imgError ? (
          <Image
            src={photoUrl}
            alt={a.author}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border border-border"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent-light font-display text-xl font-bold">
            {a.author.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-text-primary font-semibold truncate">{a.author}</p>
          <p className="text-text-muted text-sm">{a.count} book{a.count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <div>
          {a.avgRating ? (
            <StarRating value={Math.round(a.avgRating)} readOnly size="sm" />
          ) : (
            <span className="text-text-muted text-xs">Not rated</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-success text-xs font-medium">{a.completed} completed</span>
        </div>
      </div>

      {/* Top genre */}
      {topGenre && (
        <span className="inline-block bg-surface-2 border border-border text-text-muted text-xs px-2.5 py-1 rounded-full">
          {topGenre}
        </span>
      )}

      {/* Titles */}
      <div className="space-y-1">
        {(a.titles as string[]).slice(0, 3).map((title: string) => (
          <p key={title} className="text-text-muted text-xs truncate">• {title}</p>
        ))}
        {a.titles.length > 3 && (
          <p className="text-text-muted text-xs">+{a.titles.length - 3} more</p>
        )}
      </div>
    </Link>
  );
}

export default function AuthorsPage() {
  const { authors } = useStats();

  if (!authors) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto flex flex-col items-center justify-center py-32 text-center space-y-4">
        <span className="text-6xl">✍️</span>
        <h2 className="font-display text-2xl font-bold text-text-primary">No authors yet</h2>
        <p className="text-text-muted">Add some books to see your author breakdown.</p>
        <Link href="/add" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
          Add a Book
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Authors</h1>
        <p className="text-text-muted mt-1">{authors.length} author{authors.length !== 1 ? 's' : ''} in your library</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((a) => (
          <AuthorCard key={a.author} a={a} />
        ))}
      </div>
    </div>
  );
}
