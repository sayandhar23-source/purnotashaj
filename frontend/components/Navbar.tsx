'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import AnimatedLogo from './AnimatedLogo';

const CATEGORIES = [
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Jewellery', slug: 'jewellery' },
  { name: 'Ornaments', slug: 'ornaments' },
  { name: 'Makeup', slug: 'makeup' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();

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
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-brand-500">
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
            <Link href="/cart" aria-label="Cart" className="relative hover:text-brand-500">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/account/dashboard') : '/account/login'}
              aria-label="Account"
              className="hover:text-brand-500"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        {open && (
          <nav className="md:hidden flex flex-col gap-3 pb-4 text-sm font-medium">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={() => setOpen(false)}
                className="hover:text-brand-500"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
