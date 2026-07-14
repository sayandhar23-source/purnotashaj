'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';

const STATUSES = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = () => api.get('/orders').then((res) => setOrders(res.data.orders));
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success('Order status updated.');
    load();
  };

  const confirmOrder = async (id: string) => {
    setConfirming(id);
    try {
      await api.patch(`/orders/${id}/confirm`);
      toast.success('Order confirmed — confirmation email sent to the customer.');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not confirm order.');
    } finally {
      setConfirming(null);
    }
  };

  const needsConfirmation = (o: any) => o.status === 'paid' && !o.adminConfirmed;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-semibold mb-2">Orders</h1>
      <p className="text-sm text-gray-500 mb-8">
        New paid orders need your confirmation before the customer gets a confirmation email —
        look for the "Confirm Order" button below.
      </p>
      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o._id}
            className={`card p-4 ${needsConfirmation(o) ? 'border-brand-400 bg-brand-50/40' : ''}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    #{o._id.slice(-8)} — {o.user?.name} ({o.user?.email})
                  </p>
                  {needsConfirmation(o) && (
                    <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">
                      Needs confirmation
                    </span>
                  )}
                  {o.adminConfirmed && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Confirmed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {o.items.length} item(s) · ₹{o.totalAmount} · {o.paymentProvider}
                </p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {needsConfirmation(o) && (
                  <button
                    onClick={() => confirmOrder(o._id)}
                    disabled={confirming === o._id}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {confirming === o._id ? 'Confirming...' : 'Confirm Order'}
                  </button>
                )}
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="input w-36"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
