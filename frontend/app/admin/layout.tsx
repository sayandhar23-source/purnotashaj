'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  LayoutDashboard,
  Package,
  FolderTree,
  BadgePercent,
  ClipboardList,
  Mail,
  History,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/sale-page', label: 'Sale Page', icon: BadgePercent },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, showBadge: true },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/logs', label: 'User Logs', icon: History },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/account/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const poll = () => {
      api
        .get('/orders/admin/pending-count')
        .then((res) => setPendingCount(res.data.count))
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6 flex gap-4 items-start">
      <aside
        className={`shrink-0 sticky top-20 card p-2 transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        <div className="flex items-center justify-between px-1.5 py-2 mb-1">
          {!collapsed && <h2 className="font-serif text-base font-semibold">Admin</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-brand-500 shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {!collapsed && pendingCount > 0 && (
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 mx-1.5 mb-2 px-2 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium"
          >
            <Bell size={14} />
            {pendingCount} order{pendingCount > 1 ? 's' : ''} awaiting confirmation
          </Link>
        )}

        <nav className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm ${
                  active ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.showBadge && pendingCount > 0 && (
                  <span
                    className={`bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center ${
                      collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
