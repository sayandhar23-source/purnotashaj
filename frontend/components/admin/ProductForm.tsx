'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

type Variant = {
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  image?: string;
};

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  category: '',
  images: [''],
  videoUrl: '',
  basePrice: 0,
  compareAtPrice: undefined as number | undefined,
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isHotDeal: false,
  variants: [] as Variant[],
};

export default function ProductForm({
  categories,
  editingProduct,
  onSaved,
  onCancel,
}: {
  categories: any[];
  editingProduct: any | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() =>
    editingProduct
      ? {
          title: editingProduct.title,
          slug: editingProduct.slug,
          description: editingProduct.description || '',
          category: editingProduct.category?._id || editingProduct.category,
          images: editingProduct.images?.length ? editingProduct.images : [''],
          videoUrl: editingProduct.videoUrl || '',
          basePrice: editingProduct.basePrice,
          compareAtPrice: editingProduct.compareAtPrice,
          isActive: editingProduct.isActive,
          isFeatured: editingProduct.isFeatured,
          isNewArrival: !!editingProduct.isNewArrival,
          isBestSeller: !!editingProduct.isBestSeller,
          isHotDeal: !!editingProduct.isHotDeal,
          variants: editingProduct.variants || [],
        }
      : { ...emptyForm },
  );
  const [saving, setSaving] = useState(false);

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { name: '', price: form.basePrice || 0, stock: 0 }],
    });
  };

  const updateVariant = (idx: number, patch: Partial<Variant>) => {
    const copy = [...form.variants];
    copy[idx] = { ...copy[idx], ...patch };
    setForm({ ...form, variants: copy });
  };

  const removeVariant = (idx: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, images: form.images.filter(Boolean) };
      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created.');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input className="input" placeholder="Title" required value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Slug (url-friendly)" required value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </div>

      <textarea className="input" placeholder="Description" rows={3} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <div className="grid sm:grid-cols-3 gap-4">
        <select className="input" required value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.parent?.name ? `${c.parent.name} > ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <input type="number" className="input" placeholder="Base price" required value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
        <input type="number" className="input" placeholder="Compare-at price (optional)"
          value={form.compareAtPrice ?? ''}
          onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Image URLs (up to 5 — first one is the main photo)</p>
          <span className="text-xs text-gray-400">{form.images.filter(Boolean).length}/5</span>
        </div>
        {form.images.map((img, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="input" placeholder="https://..." value={img}
              onChange={(e) => {
                const copy = [...form.images];
                copy[i] = e.target.value;
                setForm({ ...form, images: copy });
              }} />
            {form.images.length > 1 && (
              <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                className="text-red-500 text-sm px-2">✕</button>
            )}
          </div>
        ))}
        {form.images.length < 5 && (
          <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ''] })}
            className="text-sm text-brand-500">+ Add image URL</button>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Product video (optional)</p>
        <p className="text-xs text-gray-500 mb-2">
          A YouTube link (upload as "Unlisted") or a direct .mp4/.webm file from a proper video
          host. Google Drive links don't work reliably for video — avoid those.
        </p>
        <input className="input" placeholder="https://youtube.com/watch?v=... or https://.../video.mp4"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isNewArrival}
            onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} />
          New Arrivals
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isBestSeller}
            onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} />
          Most Selling
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isHotDeal}
            onChange={(e) => setForm({ ...form, isHotDeal: e.target.checked })} />
          Hot Deals Now
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Variants (size / color / material combos, each with its own price)</p>
          <button type="button" onClick={addVariant} className="text-sm text-brand-500 flex items-center gap-1">
            <Plus size={14} /> Add variant
          </button>
        </div>
        <div className="space-y-3">
          {form.variants.map((v, i) => (
            <div key={i} className="border rounded-lg p-3 grid sm:grid-cols-5 gap-2 items-center">
              <input className="input" placeholder="Variant name e.g. Small / Gold" value={v.name}
                onChange={(e) => updateVariant(i, { name: e.target.value })} />
              <input type="number" className="input" placeholder="Price" value={v.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })} />
              <input type="number" className="input" placeholder="Compare-at" value={v.compareAtPrice ?? ''}
                onChange={(e) => updateVariant(i, { compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
              <input type="number" className="input" placeholder="Stock" value={v.stock}
                onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
              <button type="button" onClick={() => removeVariant(i)} className="text-red-500 justify-self-start">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
