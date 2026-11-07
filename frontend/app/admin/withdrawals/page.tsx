'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function AdminWithdrawalsPage() {
  useDocumentTitle('Admin · Withdrawals');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/referrals/admin/withdrawals').then((res) => setWithdrawals(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id: string, status: 'paid' | 'rejected') => {
    if (status === 'rejected' && !confirm('Reject this withdrawal request? The amount will be returned to the user\'s balance.')) return;
    setProcessingId(id);
    try {
      await api.patch(`/referrals/admin/withdrawals/${id}`, { status });
      toast.success(status === 'paid' ? 'Marked as paid.' : 'Request rejected.');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not update request.');
    } finally {
      setProcessingId(null);
    }
  };

  const pending = withdrawals.filter((w) => w.status === 'pending');
  const processed = withdrawals.filter((w) => w.status !== 'pending');

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-2">Withdrawal Requests</h1>
      <p className="text-sm text-gray-500 mb-8">
        Pay approved requests manually via UPI/bank transfer using the details shown, then mark
        as paid here.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <>
          <h2 className="font-semibold text-sm mb-3">Pending ({pending.length})</h2>
          <div className="space-y-3 mb-10">
            {pending.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending requests.</p>
            ) : (
              pending.map((w) => (
                <div key={w._id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {w.user?.name} <span className="text-gray-400 font-normal">({w.user?.email})</span>
                      </p>
                      <p className="text-lg font-semibold mt-1">₹{w.amount}</p>
                      {w.method === 'upi' ? (
                        <p className="text-sm text-gray-600 mt-1">UPI: <span className="font-mono">{w.upiId}</span></p>
                      ) : (
                        <div className="text-sm text-gray-600 mt-1">
                          <p>{w.bankAccountName}</p>
                          <p className="font-mono">{w.bankAccountNumber} · {w.bankIfsc}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdate(w._id, 'paid')}
                        disabled={processingId === w._id}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleUpdate(w._id, 'rejected')}
                        disabled={processingId === w._id}
                        className="btn-outline text-xs px-3 py-1.5 border-red-300 text-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="font-semibold text-sm mb-3">History</h2>
          <div className="space-y-2">
            {processed.map((w) => (
              <div key={w._id} className="card p-3 flex items-center justify-between text-sm">
                <span>{w.user?.name} — ₹{w.amount} ({w.method.toUpperCase()})</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  w.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
