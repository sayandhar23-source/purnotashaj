import Link from 'next/link';
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

export default async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="bg-[#2C120A] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-12">
          <AnimatedLogo variant="full" />
        </div>

        <Newsletter />

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
