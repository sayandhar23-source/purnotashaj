'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/banners', label: 'Sale Banners' },
  { href: '/admin/orders', label: 'Orders', showBadge: true },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/logs', label: 'User Logs' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold">Admin</h2>
          {pendingCount > 0 && (
            <Link href="/admin/orders" className="relative text-brand-500" title={`${pendingCount} order(s) awaiting confirmation`}>
              <Bell size={18} />
              <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            </Link>
          )}
        </div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              pathname === item.href ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.label}</span>
            {item.showBadge && pendingCount > 0 && (
              <span className="bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
