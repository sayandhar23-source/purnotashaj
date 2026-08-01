'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Instagram, Facebook, Youtube, Send, Percent, Truck } from 'lucide-react';
import AccountSettingsForm from '@/components/AccountSettingsForm';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

export default function AdminSettingsPage() {
  useDocumentTitle('Admin · Settings');
  const { refreshUser } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('10');
  const [savingCommission, setSavingCommission] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [settingUpWebhook, setSettingUpWebhook] = useState(false);
  const [social, setSocial] = useState({
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    pinterestUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [delivery, setDelivery] = useState({
    shippingOriginState: 'West Bengal',
    sameStateDeliveryMinDays: 3,
    sameStateDeliveryMaxDays: 6,
    otherStateDeliveryMinDays: 7,
    otherStateDeliveryMaxDays: 10,
    remoteDeliveryMinDays: 12,
    remoteDeliveryMaxDays: 15,
    remoteStates: [] as string[],
  });
  const [savingDelivery, setSavingDelivery] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        setWhatsappNumber(res.data.whatsappNumber || '');
        setTelegramChatId(res.data.telegramChatId || '');
        setCommissionPercent(String(res.data.referralCommissionPercent ?? 10));
        setSocial({
          instagramUrl: res.data.instagramUrl || '',
          facebookUrl: res.data.facebookUrl || '',
          youtubeUrl: res.data.youtubeUrl || '',
          pinterestUrl: res.data.pinterestUrl || '',
        });
        setDelivery({
          shippingOriginState: res.data.shippingOriginState || 'West Bengal',
          sameStateDeliveryMinDays: res.data.sameStateDeliveryMinDays ?? 3,
          sameStateDeliveryMaxDays: res.data.sameStateDeliveryMaxDays ?? 6,
          otherStateDeliveryMinDays: res.data.otherStateDeliveryMinDays ?? 7,
          otherStateDeliveryMaxDays: res.data.otherStateDeliveryMaxDays ?? 10,
          remoteDeliveryMinDays: res.data.remoteDeliveryMinDays ?? 12,
          remoteDeliveryMaxDays: res.data.remoteDeliveryMaxDays ?? 15,
          remoteStates: res.data.remoteStates || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDelivery(true);
    try {
      await api.patch('/settings', delivery);
      toast.success('Delivery estimate settings updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update delivery settings.');
    } finally {
      setSavingDelivery(false);
    }
  };

  const toggleRemoteState = (state: string) => {
    setDelivery((prev) => ({
      ...prev,
      remoteStates: prev.remoteStates.includes(state)
        ? prev.remoteStates.filter((s) => s !== state)
        : [...prev.remoteStates, state],
    }));
  };

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

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(commissionPercent);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Enter a percentage between 0 and 100.');
      return;
    }
    setSavingCommission(true);
    try {
      await api.patch('/settings', { referralCommissionPercent: value });
      toast.success('Referral commission rate updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update commission rate.');
    } finally {
      setSavingCommission(false);
    }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegram(true);
    try {
      await api.patch('/settings', { telegramChatId });
      toast.success('Telegram chat ID updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not update Telegram chat ID.');
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleSetupWebhook = async () => {
    setSettingUpWebhook(true);
    try {
      const res = await api.post('/chat/setup-webhook');
      if (res.data.ok) {
        toast.success('Telegram webhook connected — replies will now reach the site.');
      } else {
        toast.error(res.data.message || 'Could not set up the webhook.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not set up the webhook.');
    } finally {
      setSettingUpWebhook(false);
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

        <form onSubmit={handleSaveCommission} className="card p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Percent size={18} className="text-brand-500" />
            Referral Commission Rate
          </h3>
          <p className="text-xs text-gray-500">
            The percentage of an order's total that a referrer earns once you confirm the order.
            Applies to all future orders — past earnings aren't affected by changing this.
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input pr-8"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <button type="submit" disabled={savingCommission} className="btn-primary w-full">
                {savingCommission ? 'Saving...' : 'Update Commission Rate'}
              </button>
            </>
          )}
        </form>

        <form onSubmit={handleSaveTelegram} className="card p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Send size={18} className="text-blue-500" />
            Live Chat (Telegram)
          </h3>
          <p className="text-xs text-gray-500">
            Messages from the site's live chat bubble get forwarded to this Telegram chat.
            Reply to a message on Telegram (use Telegram's native "reply" feature, not a new
            message) and it appears back in the customer's chat on the site.
          </p>
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer text-brand-500 font-medium">
              How do I find my chat ID?
            </summary>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline">@BotFather</a> on Telegram, and set its token as <code>TELEGRAM_BOT_TOKEN</code> in the backend environment (Render).</li>
              <li>Message your new bot anything (e.g. "hi") to start a chat with it.</li>
              <li>Message <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline">@userinfobot</a> to get your numeric Telegram user ID — that's your chat ID.</li>
              <li>Paste it below and save, then click "Connect webhook".</li>
            </ol>
          </details>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <input
                className="input"
                placeholder="e.g. 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value.replace(/[^0-9-]/g, ''))}
              />
              <button type="submit" disabled={savingTelegram} className="btn-primary w-full">
                {savingTelegram ? 'Saving...' : 'Update Chat ID'}
              </button>
              <button
                type="button"
                onClick={handleSetupWebhook}
                disabled={settingUpWebhook}
                className="btn-outline w-full"
              >
                {settingUpWebhook ? 'Connecting...' : 'Connect webhook'}
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

        <form onSubmit={handleSaveDelivery} className="card p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Truck size={18} className="text-brand-500" />
            Delivery Estimate
          </h3>
          <p className="text-xs text-gray-500">
            Powers the "Check delivery date" box on product pages. Estimates are calculated from
            today's date using these day ranges — no courier account needed.
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">You ship from</label>
                <select
                  className="input"
                  value={delivery.shippingOriginState}
                  onChange={(e) => setDelivery({ ...delivery, shippingOriginState: e.target.value })}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {[
                { label: 'Same state', minKey: 'sameStateDeliveryMinDays', maxKey: 'sameStateDeliveryMaxDays' },
                { label: 'Other states', minKey: 'otherStateDeliveryMinDays', maxKey: 'otherStateDeliveryMaxDays' },
                { label: 'Remote areas', minKey: 'remoteDeliveryMinDays', maxKey: 'remoteDeliveryMaxDays' },
              ].map(({ label, minKey, maxKey }) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1">{label} (days)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={(delivery as any)[minKey]}
                      onChange={(e) => setDelivery({ ...delivery, [minKey]: Number(e.target.value) })}
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={(delivery as any)[maxKey]}
                      onChange={(e) => setDelivery({ ...delivery, [maxKey]: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-gray-500 block mb-2">
                  States treated as "remote areas" (overrides same/other-state rules)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {INDIAN_STATES.map((s) => (
                    <label key={s} className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={delivery.remoteStates.includes(s)}
                        onChange={() => toggleRemoteState(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={savingDelivery} className="btn-primary w-full">
                {savingDelivery ? 'Saving...' : 'Update Delivery Settings'}
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
