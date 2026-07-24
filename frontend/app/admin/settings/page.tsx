'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Instagram, Facebook, Youtube } from 'lucide-react';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function AdminSettingsPage() {
  useDocumentTitle('Admin · Settings');
  const { refreshUser } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [social, setSocial] = useState({
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    pinterestUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        setWhatsappNumber(res.data.whatsappNumber || '');
        setSocial({
          instagramUrl: res.data.instagramUrl || '',
          facebookUrl: res.data.facebookUrl || '',
          youtubeUrl: res.data.youtubeUrl || '',
          pinterestUrl: res.data.pinterestUrl || '',
        });
      })
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

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      await api.patch('/settings', social);
      toast.success('Social links updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update social links.');
    } finally {
      setSavingSocial(false);
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

        <form onSubmit={handleSaveSocial} className="card p-6 space-y-3">
          <h3 className="font-semibold">Social Links</h3>
          <p className="text-xs text-gray-500">
            Shown as icons in the footer. Leave any field blank to hide that icon.
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <label className="flex items-center gap-2">
                <Instagram size={16} className="text-gray-400 shrink-0" />
                <input
                  className="input"
                  placeholder="https://instagram.com/yourstore"
                  value={social.instagramUrl}
                  onChange={(e) => setSocial({ ...social, instagramUrl: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2">
                <Facebook size={16} className="text-gray-400 shrink-0" />
                <input
                  className="input"
                  placeholder="https://facebook.com/yourstore"
                  value={social.facebookUrl}
                  onChange={(e) => setSocial({ ...social, facebookUrl: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2">
                <Youtube size={16} className="text-gray-400 shrink-0" />
                <input
                  className="input"
                  placeholder="https://youtube.com/@yourstore"
                  value={social.youtubeUrl}
                  onChange={(e) => setSocial({ ...social, youtubeUrl: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-gray-400 shrink-0 w-4 text-center text-xs font-bold">P</span>
                <input
                  className="input"
                  placeholder="https://pinterest.com/yourstore"
                  value={social.pinterestUrl}
                  onChange={(e) => setSocial({ ...social, pinterestUrl: e.target.value })}
                />
              </label>
              <button type="submit" disabled={savingSocial} className="btn-primary w-full">
                {savingSocial ? 'Saving...' : 'Update Social Links'}
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
