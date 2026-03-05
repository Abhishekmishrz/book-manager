'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Book } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  cover: z.string().optional(),
  genre: z.string().optional(),
  pages: z.string().optional(),
  publishedYear: z.string().optional(),
  isbn: z.string().optional(),
  status: z.enum(['want_to_read', 'reading', 'completed', 'paused', 'dropped']),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface OLResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  first_publish_year?: number;
  isbn?: string[];
}

interface BookFormProps {
  defaultValues?: Partial<Book>;
  onSubmit: (data: Partial<Book>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BookForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Book' }: BookFormProps) {
  const [tagInput, setTagInput] = useState(defaultValues?.tags?.join(', ') || '');
  const [titleSearch, setTitleSearch] = useState('');
  const [suggestions, setSuggestions] = useState<OLResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const debouncedTitle = useDebounce(titleSearch, 600);
  const suggRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      author: defaultValues?.author || '',
      cover: defaultValues?.cover || '',
      genre: defaultValues?.genre || '',
      pages: defaultValues?.pages ? String(defaultValues.pages) : '',
      publishedYear: defaultValues?.publishedYear ? String(defaultValues.publishedYear) : '',
      isbn: defaultValues?.isbn || '',
      status: defaultValues?.status || 'want_to_read',
      rating: defaultValues?.rating,
      review: defaultValues?.review || '',
      startedAt: defaultValues?.startedAt ? defaultValues.startedAt.slice(0, 10) : '',
      finishedAt: defaultValues?.finishedAt ? defaultValues.finishedAt.slice(0, 10) : '',
      tags: defaultValues?.tags?.join(', ') || '',
    },
  });

  // Open Library lookup
  useEffect(() => {
    if (!debouncedTitle || debouncedTitle.length < 3 || defaultValues?.title) return;
    setLookingUp(true);
    axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(debouncedTitle)}&limit=6&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year,isbn`)
      .then((res) => {
        setSuggestions(res.data.docs || []);
        setShowSuggestions(true);
      })
      .catch(() => {})
      .finally(() => setLookingUp(false));
  }, [debouncedTitle, defaultValues?.title]);

  const fillFromOL = (result: OLResult) => {
    setValue('title', result.title);
    setValue('author', result.author_name?.[0] || '');
    if (result.cover_i) {
      setValue('cover', `https://covers.openlibrary.org/b/id/${result.cover_i}-L.jpg`);
    }
    if (result.number_of_pages_median) setValue('pages', String(result.number_of_pages_median));
    if (result.first_publish_year) setValue('publishedYear', String(result.first_publish_year));
    if (result.isbn?.[0]) setValue('isbn', result.isbn[0]);
    setShowSuggestions(false);
    setTitleSearch('');
  };

  const handleSubmitForm = async (data: FormData) => {
    const tags = tagInput ? tagInput.split(',').map((t) => t.trim()).filter(Boolean) : [];
    await onSubmit({
      ...data,
      pages: data.pages ? Number(data.pages) : undefined,
      publishedYear: data.publishedYear ? Number(data.publishedYear) : undefined,
      tags,
    });
  };

  const coverValue = watch('cover');

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      {/* Open Library lookup (only for new books) */}
      {!defaultValues?.title && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-muted">Quick search (Open Library)</label>
          <div className="relative" ref={suggRef}>
            <input
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="Type a title to auto-fill..."
              className="w-full bg-surface-2 border border-accent/30 rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {lookingUp && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm animate-pulse">Searching...</span>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-2 border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => fillFromOL(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface text-left transition-colors border-b border-border/50 last:border-0"
                  >
                    {s.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${s.cover_i}-S.jpg`}
                        alt={s.title}
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-surface rounded flex-shrink-0 flex items-center justify-center text-text-muted text-lg">📖</div>
                    )}
                    <div>
                      <p className="text-text-primary text-sm font-medium line-clamp-1">{s.title}</p>
                      <p className="text-text-muted text-xs">{s.author_name?.[0]}{s.first_publish_year ? ` · ${s.first_publish_year}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-text-muted text-xs">Or fill in the details below manually</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Title *</label>
          <input
            {...register('title')}
            placeholder="The Midnight Library"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {errors.title && <p className="text-danger text-xs">{errors.title.message}</p>}
        </div>

        {/* Author */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Author *</label>
          <input
            {...register('author')}
            placeholder="Matt Haig"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {errors.author && <p className="text-danger text-xs">{errors.author.message}</p>}
        </div>

        {/* Genre */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Genre</label>
          <input
            {...register('genre')}
            placeholder="Fiction"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Status</label>
          <select
            {...register('status')}
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Pages */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Pages</label>
          <input
            {...register('pages')}
            type="number"
            placeholder="320"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Published Year */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Published Year</label>
          <input
            {...register('publishedYear')}
            type="number"
            placeholder="2020"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Start date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Started</label>
          <input
            {...register('startedAt')}
            type="date"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Finish date */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Finished</label>
          <input
            {...register('finishedAt')}
            type="date"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Rating */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Rating</label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating value={field.value} onChange={field.onChange} size="lg" />
            )}
          />
        </div>

        {/* Cover URL */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Cover URL</label>
          <div className="flex gap-3">
            <input
              {...register('cover')}
              placeholder="https://..."
              className="flex-1 bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
            {coverValue && (
              <img src={coverValue} alt="cover preview" className="w-12 h-16 object-cover rounded-lg border border-border flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Tags</label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="re-read, audiobook, book-club"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <p className="text-text-muted text-xs">Separate tags with commas</p>
        </div>

        {/* Review */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">Review / Notes</label>
          <textarea
            {...register('review')}
            rows={4}
            placeholder="What did you think?"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} size="lg" className="w-full">
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
