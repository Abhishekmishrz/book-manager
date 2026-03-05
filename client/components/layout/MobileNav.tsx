'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/library', label: 'Library', icon: '📚' },
  { href: '/add', label: 'Add', icon: '➕' },
  { href: '/stats', label: 'Stats', icon: '📊' },
  { href: '/authors', label: 'Authors', icon: '✍️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/add' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-accent-light' : 'text-text-muted'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
