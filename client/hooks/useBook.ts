'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { Book } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data.book);

export function useBook(id: string) {
  const { data: book, error, isLoading, mutate } = useSWR<Book>(id ? `/books/${id}` : null, fetcher);

  const updateBook = async (data: Partial<Book>) => {
    const res = await api.patch(`/books/${id}`, data);
    await mutate(res.data.book, false);
    return res.data.book;
  };

  return { book, isLoading, isError: !!error, updateBook, mutate };
}
