import Link from 'next/link';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import Newsletter from './Newsletter';
import AnimatedLogo from './AnimatedLogo';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

async function getCategories() {
  try {
    const res = await fetch(`${API}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API}/settings`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Simple inline Pinterest glyph — lucide-react doesn't ship one
function PinterestIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.223.083.343-.09.375-.293 1.194-.333 1.361-.052.219-.174.265-.402.16-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146A12 12 0 1 0 12 0z" />
    </svg>
  );
}

export default async function Footer() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  const socialLinks = [
    { href: settings?.instagramUrl, label: 'Instagram', Icon: Instagram },
    { href: settings?.facebookUrl, label: 'Facebook', Icon: Facebook },
    { href: settings?.youtubeUrl, label: 'YouTube', Icon: Youtube },
    { href: settings?.pinterestUrl, label: 'Pinterest', Icon: PinterestIcon },
  ].filter((s) => !!s.href);

  return (
    <footer className="bg-[#2C120A] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-12">
          <AnimatedLogo variant="full" />
        </div>

        <Newsletter />

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-600 hover:border-white hover:text-white transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat: any) => (
                  <li key={cat._id}>
                    <Link href={`/category/${cat.slug}`} className="hover:text-white">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Browse coming soon</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/account/dashboard" className="hover:text-white">My Orders</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white">Wishlist</Link>
              </li>
              <li>
                <Link href="/account/dashboard" className="hover:text-white">Track Order</Link>
              </li>
              <li>
                <Link href="/refer-and-earn" className="hover:text-white">Refer &amp; Earn</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white">Shipping</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white">Returns</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Purnota Shaj</h4>
            <p>Curated clothing, jewellery, ornaments and makeup — delivered with care.</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-10">
          © {new Date().getFullYear()} Purnota Shaj. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
