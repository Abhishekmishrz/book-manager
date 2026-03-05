import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-surface-2 rounded-lg', className)} />;
}

export function BookCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton className="h-48 rounded-none rounded-t-xl" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4 mt-3" />
      </div>
    </div>
  );
}
