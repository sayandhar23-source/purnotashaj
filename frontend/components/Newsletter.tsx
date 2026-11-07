'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed! Watch your inbox for offers.');
      setEmail('');
    } catch (err: any) {
      toast.error(err?.message || 'Could not subscribe. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center max-w-xl mx-auto">
      <h3 className="text-white font-serif text-2xl mb-2">Join our newsletter</h3>
      <p className="text-sm text-gray-400 mb-4">
        Get early access to new drops and exclusive sale offers.
      </p>
      <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full px-4 py-2.5 text-gray-900 focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
