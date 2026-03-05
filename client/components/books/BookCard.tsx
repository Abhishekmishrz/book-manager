'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { ReadingStatusBadge } from './ReadingStatusBadge';
import { useBooks } from '@/hooks/useBooks';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
}

function CoverPlaceholder({ title, author }: { title: string; author: string }) {
  const colors = ['from-violet-900 to-purple-700', 'from-blue-900 to-cyan-700', 'from-emerald-900 to-teal-700', 'from-rose-900 to-pink-700', 'from-amber-900 to-orange-700'];
  const colorIdx = (title.charCodeAt(0) + author.charCodeAt(0)) % colors.length;
  return (
    <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br', colors[colorIdx])}>
      <span className="text-white/80 font-display text-4xl font-bold">{title.charAt(0)}</span>
    </div>
  );
}

export function BookCard({ book }: BookCardProps) {
  const { toggleFavourite } = useBooks();
  const { toast } = useToast();

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await toggleFavourite(book._id);
      toast(book.favourite ? 'Removed from favourites' : 'Added to favourites', 'success');
    } catch {
      toast('Failed to update', 'error');
    }
  };

  return (
    <Link href={`/library/${book._id}`}>
      <div className="card-hover rounded-xl overflow-hidden group cursor-pointer animate-fade-in">
        {/* Cover */}
        <div className="relative h-52 bg-surface-2">
          {book.cover ? (
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <CoverPlaceholder title={book.title} author={book.author} />
          )}

          {/* Favourite button */}
          <button
            onClick={handleFavourite}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              'opacity-0 group-hover:opacity-100',
              book.favourite ? 'bg-danger/20 text-danger opacity-100' : 'bg-black/40 text-white hover:bg-danger/20 hover:text-danger'
            )}
          >
            {book.favourite ? '♥' : '♡'}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <ReadingStatusBadge status={book.status} />
          <h3 className="font-display font-semibold text-text-primary line-clamp-2 leading-tight">{book.title}</h3>
          <p className="text-text-muted text-sm truncate">{book.author}</p>
          {book.rating && (
            <StarRating value={book.rating} readOnly size="sm" />
          )}
          {book.genre && (
            <p className="text-text-muted text-xs truncate">{book.genre}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
