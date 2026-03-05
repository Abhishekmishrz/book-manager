'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBook } from '@/hooks/useBook';
import { useBooks } from '@/hooks/useBooks';
import { BookForm } from '@/components/books/BookForm';
import { ReadingStatusBadge } from '@/components/books/ReadingStatusBadge';
import { StarRating } from '@/components/ui/StarRating';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Book } from '@/types';

function BookDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { book, isLoading, updateBook } = useBook(id);
  const { deleteBook, toggleFavourite } = useBooks();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (data: Partial<Book>) => {
    try {
      setSaving(true);
      await updateBook(data);
      setEditing(false);
      toast('Book updated!', 'success');
    } catch {
      toast('Failed to update book', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBook(id);
      toast('Book removed from library', 'info');
      router.push('/library');
    } catch {
      toast('Failed to delete book', 'error');
    }
  };

  const handleFavourite = async () => {
    try {
      await toggleFavourite(id);
      toast(book?.favourite ? 'Removed from favourites' : 'Added to favourites', 'success');
    } catch {
      toast('Failed to update', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-[240px,1fr] gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return <div className="p-8 text-text-muted">Book not found.</div>;

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-text-muted hover:text-text-primary transition-colors text-sm flex items-center gap-2"
      >
        ← Back to Library
      </button>

      {/* Edit modal */}
      <Modal open={editing} onClose={() => setEditing(false)} className="max-w-2xl">
        <div className="p-6 space-y-6">
          <h2 className="font-display text-2xl font-bold text-text-primary">Edit Book</h2>
          <BookForm defaultValues={book} onSubmit={handleUpdate} isLoading={saving} submitLabel="Save Changes" />
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div className="p-6 space-y-4 text-center">
          <span className="text-5xl">🗑️</span>
          <h2 className="font-display text-xl font-bold text-text-primary">Remove this book?</h2>
          <p className="text-text-muted text-sm">This will permanently remove &ldquo;{book.title}&rdquo; from your library.</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove Book</Button>
          </div>
        </div>
      </Modal>

      {/* Main layout */}
      <div className="grid md:grid-cols-[200px,1fr] gap-8 items-start">
        {/* Cover */}
        <div className="space-y-3">
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-2">
            {book.cover ? (
              <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="200px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900 to-purple-700">
                <span className="text-white font-display text-6xl font-bold">{book.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Edit Book
            </button>
            <button
              onClick={handleFavourite}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all border ${
                book.favourite
                  ? 'bg-danger/10 border-danger/20 text-danger'
                  : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
              }`}
            >
              {book.favourite ? '♥ Unfavourite' : '♡ Add to Favourites'}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-border text-text-muted hover:border-danger/40 hover:text-danger transition-all"
            >
              Remove Book
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div className="space-y-2">
            <ReadingStatusBadge status={book.status} />
            <h1 className="font-display text-3xl font-bold text-text-primary leading-tight">{book.title}</h1>
            <p className="text-text-muted text-lg">{book.author}</p>
          </div>

          {book.rating && (
            <div className="flex items-center gap-3">
              <StarRating value={book.rating} readOnly size="lg" />
              <span className="text-text-muted text-sm">{book.rating}/5</span>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {book.genre && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">Genre</p>
                <p className="text-text-primary text-sm font-medium">{book.genre}</p>
              </div>
            )}
            {book.pages && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">Pages</p>
                <p className="text-text-primary text-sm font-medium">{book.pages.toLocaleString()}</p>
              </div>
            )}
            {book.publishedYear && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">Published</p>
                <p className="text-text-primary text-sm font-medium">{book.publishedYear}</p>
              </div>
            )}
            {book.startedAt && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">Started</p>
                <p className="text-text-primary text-sm font-medium">{formatDate(book.startedAt)}</p>
              </div>
            )}
            {book.finishedAt && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">Finished</p>
                <p className="text-text-primary text-sm font-medium">{formatDate(book.finishedAt)}</p>
              </div>
            )}
            {book.isbn && (
              <div className="card p-3 space-y-0.5">
                <p className="text-text-muted text-xs">ISBN</p>
                <p className="text-text-primary text-sm font-medium">{book.isbn}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {book.tags?.length > 0 && (
            <div className="space-y-2">
              <p className="text-text-muted text-sm font-medium">Tags</p>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <span key={tag} className="bg-surface-2 border border-border text-text-muted text-xs px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review */}
          {book.review && (
            <div className="space-y-2">
              <p className="text-text-muted text-sm font-medium">My Review</p>
              <div className="card p-4">
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{book.review}</p>
              </div>
            </div>
          )}

          <p className="text-text-muted text-xs">Added {formatDate(book.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function BookDetailPage() {
  return (
    <ToastProvider>
      <BookDetailContent />
    </ToastProvider>
  );
}
