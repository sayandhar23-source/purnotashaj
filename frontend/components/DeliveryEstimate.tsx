'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type Estimate = {
  district: string;
  state: string;
  estimatedDateRange: string;
};

export default function DeliveryEstimate() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState('');

  const checkPincode = async () => {
    setError('');
    setEstimate(null);
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError('Enter a valid 6-digit pincode.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/delivery/estimate', { params: { pincode } });
      setEstimate(res.data);
    } catch (err: any) {
      setError(err?.message || 'Could not check that pincode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-3 sm:p-4">
      <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
        <MapPin size={15} className="text-brand-500 shrink-0" />
        Check delivery date
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter pincode"
          className="input flex-1 min-w-0 text-sm"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
        />
        <button
          onClick={checkPincode}
          disabled={loading}
          className="btn-outline text-sm px-4 shrink-0 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {estimate && (
        <div className="mt-3 text-sm">
          <p className="text-gray-500">
            Delivering to <span className="font-medium text-gray-700">{estimate.district}, {estimate.state}</span>
          </p>
          <p className="font-medium text-brand-600 mt-0.5">
            Estimated delivery: {estimate.estimatedDateRange}
          </p>
        </div>
      )}
    </div>
  );
}
