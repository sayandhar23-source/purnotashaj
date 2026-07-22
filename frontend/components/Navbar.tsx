'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronRight,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import AnimatedLogo from './AnimatedLogo';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const accountHref = user
    ? user.role === 'admin'
      ? '/admin/dashboard'
      : '/account/dashboard'
    : '/account/login';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="shrink-0" aria-label="Purnota Shaj home">
            <AnimatedLogo variant="wordmark" />
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            {categories.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="hover:text-brand-500">
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/search" aria-label="Search" className="hover:text-brand-500">
              <Search size={20} />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hover:text-brand-500">
              <Heart size={20} />
            </Link>
            <Link href={accountHref} aria-label="Account" className="hover:text-brand-500">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 top-16 bg-black/30 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-down mobile menu panel */}
      <div
        className={`md:hidden fixed left-0 right-0 top-16 bg-white rounded-b-2xl shadow-xl overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Shop by Category
          </p>
          <nav className="flex flex-col mb-5 rounded-xl border border-gray-100 overflow-hidden">
            {categories.map((c, i) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-brand-50 hover:text-brand-600 ${
                  i !== categories.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {c.name}
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </nav>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
            My Account
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50"
            >
              <Heart size={20} className="text-brand-500" />
              <span className="text-xs font-medium text-gray-700">Wishlist</span>
            </Link>
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50"
            >
              {user?.role === 'admin' ? (
                <LayoutDashboard size={20} className="text-brand-500" />
              ) : (
                <ClipboardList size={20} className="text-brand-500" />
              )}
              <span className="text-xs font-medium text-gray-700">
                {user?.role === 'admin' ? 'Admin' : 'Orders'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
