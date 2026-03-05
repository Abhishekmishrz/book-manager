'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/library', label: 'Library', icon: '📚' },
  { href: '/add', label: 'Add Book', icon: '➕' },
  { href: '/stats', label: 'Statistics', icon: '📊' },
  { href: '/authors', label: 'Authors', icon: '✍️' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/library" className="flex items-center gap-2.5">
          <span className="text-2xl">📚</span>
          <span className="font-display text-lg font-semibold text-text-primary">Bookshelf</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/add' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-accent/15 text-accent-light border border-accent/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-light text-sm font-semibold">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg text-sm font-medium transition-all"
        >
          <span>🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
