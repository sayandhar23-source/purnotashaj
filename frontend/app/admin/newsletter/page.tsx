'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/lib/api';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/newsletter').then((res) => {
      setSubscribers(res.data.subscribers);
      setTotal(res.data.total);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-serif font-semibold mb-2">Newsletter Subscribers</h1>
      <p className="text-sm text-gray-500 mb-8">{total} total subscribers</p>

      <div className="card divide-y">
        {subscribers.map((s) => (
          <div key={s._id} className="p-4 flex items-center justify-between text-sm">
            <span>{s.email}</span>
            <span className={s.isSubscribed ? 'text-green-600' : 'text-gray-400'}>
              {s.isSubscribed ? 'Subscribed' : 'Unsubscribed'}
            </span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
