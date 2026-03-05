'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookForm } from '@/components/books/BookForm';
import { useBooks } from '@/hooks/useBooks';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Book } from '@/types';

function AddBookContent() {
  const router = useRouter();
  const { addBook } = useBooks();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Book>) => {
    try {
      setLoading(true);
      await addBook(data);
      toast('Book added to your library!', 'success');
      router.push('/library');
    } catch {
      toast('Failed to add book. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Add a Book</h1>
        <p className="text-text-muted mt-1">Search Open Library or fill in the details manually.</p>
      </div>
      <BookForm onSubmit={handleSubmit} isLoading={loading} submitLabel="Add to Library" />
    </div>
  );
}

export default function AddBookPage() {
  return (
    <ToastProvider>
      <AddBookContent />
    </ToastProvider>
  );
}
