export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatYear(date: string | Date | undefined): string {
  if (!date) return '';
  return new Date(date).getFullYear().toString();
}

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const STATUS_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  completed: 'Completed',
  paused: 'Paused',
  dropped: 'Dropped',
};

export const STATUS_COLORS: Record<string, string> = {
  want_to_read: 'text-[#8B8BA7] bg-[#8B8BA7]/10 border-[#8B8BA7]/20',
  reading: 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/20',
  completed: 'text-[#059669] bg-[#059669]/10 border-[#059669]/20',
  paused: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20',
  dropped: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/20',
};
