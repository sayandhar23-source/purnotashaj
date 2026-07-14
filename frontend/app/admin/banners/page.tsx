'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const emptyForm = {
  title: '',
  subtitle: '',
  desktopImage: '',
  mobileImage: '',
  linkUrl: '',
  ctaText: '',
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/banners/admin/all').then((res) => setBanners(res.data));
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/banners/${editingId}`, form);
        toast.success('Banner updated.');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created.');
      }
      setForm({ ...emptyForm });
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await api.delete(`/banners/${id}`);
    toast.success('Banner deleted.');
    load();
  };

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-8">Sale Banners</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload separate images optimized for desktop (wide) and mobile (square/tall) — the storefront
        automatically shows the right one based on screen size.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-10 max-w-xl">
        <h2 className="font-semibold">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
        <input className="input" placeholder="Title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Subtitle" value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <input className="input" placeholder="Desktop image URL (wide, e.g. 1600x500)" required value={form.desktopImage}
          onChange={(e) => setForm({ ...form, desktopImage: e.target.value })} />
        <input className="input" placeholder="Mobile image URL (e.g. 800x450)" required value={form.mobileImage}
          onChange={(e) => setForm({ ...form, mobileImage: e.target.value })} />
        <input className="input" placeholder="Link URL (optional, e.g. /category/clothing)" value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        <input className="input" placeholder="CTA text (optional, e.g. Shop Now)" value={form.ctaText}
          onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
        <div className="flex items-center gap-4">
          <input type="number" className="input w-32" placeholder="Sort order" value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
        </button>
      </form>

      <div className="space-y-3">
        {banners.map((b) => (
          <div key={b._id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-gray-500">{b.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => {
                  setForm({ ...emptyForm, ...b });
                  setEditingId(b._id);
                }}
                className="text-brand-500"
              >
                Edit
              </button>
              <button onClick={() => handleDelete(b._id)} className="text-red-500">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
  </>
  );
}
