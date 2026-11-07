'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Send, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

type LinkType = 'product' | 'category' | 'sale' | 'none';

export default function AdminNotificationsPage() {
  useDocumentTitle('Admin · Notifications');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'price_drop' | 'new_deal' | 'general'>('new_deal');
  const [linkType, setLinkType] = useState<LinkType>('none');
  const [productSlug, setProductSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [customImage, setCustomImage] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    api.get('/products/admin/all', { params: { limit: 500 } }).then((res) => setProducts(res.data.products));
    api.get('/categories/admin/all').then((res) => setCategories(res.data));
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoadingHistory(true);
    api.get('/notifications/admin/history').then((res) => setHistory(res.data)).finally(() => setLoadingHistory(false));
  };

  const selectedProduct = products.find((p) => p.slug === productSlug);
  const previewImage = linkType === 'product' ? selectedProduct?.images?.[0] : customImage || undefined;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    setSending(true);
    try {
      const payload: any = { title, message, type, linkType };
      if (linkType === 'product') payload.productSlug = productSlug;
      if (linkType === 'category') payload.categorySlug = categorySlug;
      if (linkType === 'none' || linkType === 'sale') payload.customImage = customImage || undefined;

      const res = await api.post('/notifications/admin/send', payload);
      toast.success(res.data.message);
      setTitle('');
      setMessage('');
      setProductSlug('');
      setCategorySlug('');
      setCustomImage('');
      setLinkType('none');
      loadHistory();
    } catch (err: any) {
      toast.error(err?.message || 'Could not send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-2">Notifications</h1>
      <p className="text-sm text-gray-500 mb-8">
        Send an announcement to every registered customer — it appears in their notification bell
        immediately, with an optional product/category photo and a tap-through link.
      </p>

      <form onSubmit={handleSend} className="card p-6 space-y-4 max-w-xl mb-10">
        <div className="flex gap-2">
          {(['new_deal', 'price_drop', 'general'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${
                type === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300 text-gray-600'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder="Title, e.g. Price Drop Alert!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Message shown to customers..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Link this notification to</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['product', 'category', 'sale', 'none'] as LinkType[]).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setLinkType(lt)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${
                  linkType === lt ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300 text-gray-600'
                }`}
              >
                {lt === 'none' ? 'No link' : lt}
              </button>
            ))}
          </div>

          {linkType === 'product' && (
            <select className="input" value={productSlug} onChange={(e) => setProductSlug(e.target.value)}>
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p._id} value={p.slug}>{p.title}</option>
              ))}
            </select>
          )}

          {linkType === 'category' && (
            <select className="input" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
              <option value="">Select a category...</option>
              {categories.map((c: any) => (
                <option key={c._id} value={c.slug}>
                  {c.parent?.name ? `${c.parent.name} > ${c.name}` : c.name}
                </option>
              ))}
            </select>
          )}

          {(linkType === 'none' || linkType === 'sale') && (
            <input
              className="input"
              placeholder="Optional image URL for this announcement"
              value={customImage}
              onChange={(e) => setCustomImage(e.target.value)}
            />
          )}
        </div>

        {previewImage && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
              <Image src={previewImage} alt="" fill className="object-cover" />
            </div>
            Image that will show with this notification
          </div>
        )}

        <button type="submit" disabled={sending} className="btn-primary flex items-center justify-center gap-1.5 w-full">
          <Send size={16} />
          {sending ? 'Sending...' : 'Send to All Customers'}
        </button>
      </form>

      <h2 className="font-semibold text-sm mb-3">Sent history</h2>
      {loadingHistory ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-500 text-sm">Nothing sent yet.</p>
      ) : (
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h._id} className="card p-3 flex items-center gap-3">
              {h.image ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={h.image} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Bell size={14} className="text-brand-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{h.title}</p>
                <p className="text-xs text-gray-500 truncate">{h.message}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-brand-500">{h.recipientCount} sent</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
