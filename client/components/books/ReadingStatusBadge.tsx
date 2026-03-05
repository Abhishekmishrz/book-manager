import { ReadingStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReadingStatusBadgeProps {
  status: ReadingStatus;
  className?: string;
}

export function ReadingStatusBadge({ status, className }: ReadingStatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      STATUS_COLORS[status],
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
