'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const { refreshUser } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setWhatsappNumber(res.data.whatsappNumber || ''))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/settings', { whatsappNumber });
      toast.success('WhatsApp number updated — it takes effect immediately across the site.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update WhatsApp number.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-8">Settings</h1>

      <div className="max-w-md space-y-8">
        <form onSubmit={handleSaveWhatsapp} className="card p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle size={18} className="text-green-600" />
            WhatsApp Number
          </h3>
          <p className="text-xs text-gray-500">
            This is the number every "Ask on WhatsApp" button across the site redirects to.
            Digits only, with country code, no spaces or +. e.g. <code>919999999999</code>
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <input
                className="input"
                placeholder="919999999999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                pattern="[0-9]{7,15}"
              />
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : 'Update WhatsApp Number'}
              </button>
            </>
          )}
        </form>

        <div>
          <h2 className="text-lg font-serif font-semibold mb-2">Account</h2>
          <p className="text-sm text-gray-500 mb-4">
            Update the email or password for this admin account.
          </p>
          <AccountSettingsForm onUpdated={refreshUser} />
        </div>
      </div>
    </>
  );
}
