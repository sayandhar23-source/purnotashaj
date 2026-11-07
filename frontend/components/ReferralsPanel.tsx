'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Wallet } from 'lucide-react';
import { api } from '@/lib/api';

export default function ReferralsPanel() {
  const [me, setMe] = useState<{ referralCode: string; balance: number; totalEarned: number; pendingWithdrawalAmount: number } | null>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [productUrl, setProductUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/referrals/me'),
      api.get('/referrals/earnings'),
      api.get('/referrals/withdrawals'),
    ])
      .then(([meRes, earningsRes, withdrawalsRes]) => {
        setMe(meRes.data);
        setEarnings(earningsRes.data);
        setWithdrawals(withdrawalsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const generateLink = () => {
    if (!productUrl.trim() || !me) return;
    try {
      const url = new URL(productUrl.trim());
      url.searchParams.set('ref', me.referralCode);
      setGeneratedLink(url.toString());
    } catch {
      toast.error('That doesn\'t look like a valid link — paste the full product URL.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    if (amountNum > me.balance) {
      toast.error('Amount exceeds your available balance.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { amount: amountNum, method };
      if (method === 'upi') payload.upiId = upiId;
      else {
        payload.bankAccountName = bankAccountName;
        payload.bankAccountNumber = bankAccountNumber;
        payload.bankIfsc = bankIfsc;
      }
      await api.post('/referrals/withdraw', payload);
      toast.success('Withdrawal request submitted — we\'ll process it shortly.');
      setShowWithdrawForm(false);
      setAmount('');
      setUpiId('');
      setBankAccountName('');
      setBankAccountNumber('');
      setBankIfsc('');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !me) {
    return <p className="text-gray-400 text-sm">Loading...</p>;
  }

  const myReferralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${me.referralCode}`;

  return (
    <div className="space-y-6">
      {/* Balance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Available balance</p>
          <p className="text-xl font-semibold text-brand-600">₹{me.balance}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total earned</p>
          <p className="text-xl font-semibold">₹{me.totalEarned}</p>
        </div>
        <div className="card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500">Pending withdrawal</p>
          <p className="text-xl font-semibold">₹{me.pendingWithdrawalAmount}</p>
        </div>
      </div>

      {/* Referral code + generic link */}
      <div className="card p-4">
        <p className="text-sm font-medium mb-2">Your referral code</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono">{me.referralCode}</code>
          <button onClick={() => copyToClipboard(me.referralCode, 'Code')} className="btn-outline px-3 py-2 shrink-0" aria-label="Copy code">
            <Copy size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 mb-1">Or share your general store link:</p>
        <div className="flex items-center gap-2">
          <input readOnly value={myReferralLink} className="input text-xs flex-1 min-w-0" />
          <button onClick={() => copyToClipboard(myReferralLink, 'Link')} className="btn-outline px-3 py-2 shrink-0" aria-label="Copy link">
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Product link generator */}
      <div className="card p-4">
        <p className="text-sm font-medium mb-2">Generate a referral link for a specific product</p>
        <p className="text-xs text-gray-500 mb-3">
          Paste any product page link from the store — we'll add your referral code to it.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="input flex-1 min-w-0"
            placeholder="https://purnotashaj.shop/products/..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
          />
          <button onClick={generateLink} className="btn-primary shrink-0">Generate</button>
        </div>
        {generatedLink && (
          <div className="flex items-center gap-2 mt-3">
            <input readOnly value={generatedLink} className="input text-xs flex-1 min-w-0" />
            <button onClick={() => copyToClipboard(generatedLink, 'Link')} className="btn-outline px-3 py-2 shrink-0" aria-label="Copy link">
              <Copy size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Withdrawal */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Wallet size={16} /> Withdraw earnings
          </p>
          {!showWithdrawForm && (
            <button onClick={() => setShowWithdrawForm(true)} className="btn-primary text-xs px-3 py-1.5">
              Request Withdrawal
            </button>
          )}
        </div>

        {showWithdrawForm && (
          <form onSubmit={submitWithdrawal} className="space-y-3">
            <input
              type="number"
              placeholder={`Amount (max ₹${me.balance})`}
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setMethod('upi')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${method === 'upi' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'}`}>
                UPI
              </button>
              <button type="button" onClick={() => setMethod('bank')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${method === 'bank' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300'}`}>
                Bank Transfer
              </button>
            </div>
            {method === 'upi' ? (
              <input className="input" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            ) : (
              <div className="space-y-2">
                <input className="input" placeholder="Account holder name" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} />
                <input className="input" placeholder="Account number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
                <input className="input" placeholder="IFSC code" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowWithdrawForm(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        )}

        {withdrawals.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">History</p>
            {withdrawals.map((w) => (
              <div key={w._id} className="flex items-center justify-between text-sm border-t pt-2">
                <span>₹{w.amount} · {w.method.toUpperCase()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  w.status === 'paid' ? 'bg-green-100 text-green-700' :
                  w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earnings history */}
      <div className="card p-4">
        <p className="text-sm font-medium mb-3">Earnings history</p>
        {earnings.length === 0 ? (
          <p className="text-gray-500 text-sm">No referral earnings yet — share a product link to get started.</p>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div key={e._id} className="flex items-center justify-between text-sm border-t pt-2 first:border-0 first:pt-0">
                <div>
                  <p>Order #{e.order?._id?.slice(-8) || '—'}</p>
                  <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">+₹{e.commissionAmount}</p>
                  <p className={`text-xs ${e.status === 'reversed' ? 'text-red-500' : 'text-green-600'}`}>{e.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
