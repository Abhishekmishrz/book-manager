'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import { StatsOverview, MonthlyData, GenreData, AuthorData, StreakData } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function useStats() {
  const { data: overview } = useSWR<StatsOverview>('/stats/overview', fetcher);
  const { data: monthly } = useSWR<MonthlyData[]>('/stats/monthly', fetcher);
  const { data: genres } = useSWR<GenreData[]>('/stats/genres', fetcher);
  const { data: authors } = useSWR<AuthorData[]>('/stats/authors', fetcher);
  const { data: streak } = useSWR<StreakData[]>('/stats/streak', fetcher);

  return { overview, monthly, genres, authors, streak };
}
