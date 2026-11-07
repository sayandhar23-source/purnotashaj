'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, LayoutGrid, Percent, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// The App Feel's thumb-height bar. Shown wherever the full desktop menu isn't (below 1280px),
// and never in the admin or during checkout, where it would only get in the way.
export default function BottomNav() {
  const pathname = usePathname() || '';
  const { user } = useAuth();
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const base = 'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium';

  const links = [
    { label: 'Offers', href: '/sale', icon: Percent },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: user ? 'Account' : 'Login', href: user ? '/account/dashboard' : '/account/login', icon: User },
  ];

  return (
    <nav aria-label="Main" className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        <li>
          <Link href="/" className={`${base} ${isActive('/') ? 'text-[#5C1010]' : 'text-gray-500'}`}>
            <Home size={20} />
            Home
          </Link>
        </li>
        <li>
          <button
            onClick={() => window.dispatchEvent(new Event('open-menu'))}
            className={`${base} w-full text-gray-500`}
          >
            <LayoutGrid size={20} />
            Categories
          </button>
        </li>
        {links.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className={`${base} ${isActive(href) ? 'text-[#5C1010]' : 'text-gray-500'}`}>
              <Icon size={20} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
