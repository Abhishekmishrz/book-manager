export type ReadingStatus = 'want_to_read' | 'reading' | 'completed' | 'paused' | 'dropped';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  readingGoal: number;
}

export interface Book {
  _id: string;
  user: string;
  title: string;
  author: string;
  cover?: string;
  genre?: string;
  pages?: number;
  publishedYear?: number;
  isbn?: string;
  status: ReadingStatus;
  rating?: number;
  review?: string;
  startedAt?: string;
  finishedAt?: string;
  tags: string[];
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BooksResponse {
  success: boolean;
  books: Book[];
  pagination: Pagination;
}

export interface StatsOverview {
  total: number;
  byStatus: Record<string, number>;
  averageRating: number;
  pagesRead: number;
}

export interface MonthlyData {
  month: number;
  count: number;
}

export interface GenreData {
  genre: string;
  count: number;
  percentage: number;
}

export interface AuthorData {
  author: string;
  count: number;
  avgRating: number;
  genres: string[];
  titles: string[];
  completed: number;
}

export interface StreakData {
  year: number;
  week: number;
  count: number;
}

export interface BookFilters {
  status?: ReadingStatus | 'all';
  genre?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'title' | 'author' | 'rating';
  favourite?: boolean;
  page?: number;
}
