'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import AccountSettingsForm from '@/components/AccountSettingsForm';

type Tab = 'orders' | 'wishlist' | 'settings';

export default function DashboardPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/account/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'orders') api.get('/orders/my').then((res) => setOrders(res.data));
    if (tab === 'wishlist')
      api.get('/wishlist').then((res) => setWishlistProducts(res.data.products || []));
  }, [tab, user]);

  if (loading || !user) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-semibold">Hi, {user.name}</h1>
        <button onClick={logout} className="text-sm text-red-500">
          Log out
        </button>
      </div>

      <div className="flex gap-2 border-b mb-8">
        {(['orders', 'wishlist', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 ${
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Order #{order._id.slice(-8)}</span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {order.items.length} item(s) — ₹{order.totalAmount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No items saved yet.</p>
          ) : (
            wishlistProducts.map((p: any) => (
              <Link key={p._id} href={`/products/${p.slug}`} className="card p-3">
                <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                <p className="text-sm text-gray-500">₹{p.basePrice}</p>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'settings' && <AccountSettingsForm onUpdated={refreshUser} />}
    </div>
  );
}
