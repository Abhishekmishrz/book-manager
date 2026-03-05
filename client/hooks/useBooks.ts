'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { BooksResponse, Book, BookFilters } from '@/types';

const buildUrl = (filters: BookFilters) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.favourite) params.set('favourite', 'true');
  if (filters.page) params.set('page', String(filters.page));
  const qs = params.toString();
  return `/books${qs ? `?${qs}` : ''}`;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export function useBooks(filters: BookFilters = {}) {
  const url = buildUrl(filters);
  const { data, error, isLoading, mutate } = useSWR<BooksResponse>(url, fetcher);

  const addBook = async (bookData: Partial<Book>) => {
    const res = await api.post('/books', bookData);
    await mutate();
    return res.data.book;
  };

  const updateBook = async (id: string, bookData: Partial<Book>) => {
    const res = await api.patch(`/books/${id}`, bookData);
    await mutate();
    return res.data.book;
  };

  const deleteBook = async (id: string) => {
    await api.delete(`/books/${id}`);
    await mutate();
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await api.patch(`/books/${id}/status`, { status });
    await mutate();
    return res.data.book;
  };

  const toggleFavourite = async (id: string) => {
    const res = await api.patch(`/books/${id}/favourite`);
    await mutate();
    return res.data.book;
  };

  return {
    books: data?.books || [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    addBook,
    updateBook,
    deleteBook,
    updateStatus,
    toggleFavourite,
    mutate,
  };
}
