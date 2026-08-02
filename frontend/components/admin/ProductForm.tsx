'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { slugify } from '@/lib/slugify';

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
  imageMeta: [{ name: '', title: '', alt: '' }] as { name: string; title: string; alt: string }[],
  videoUrl: '',
  basePrice: 0,
  compareAtPrice: undefined as number | undefined,
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isHotDeal: false,
  saleEnabled: false,
  salePrice: undefined as number | undefined,
  saleEndsAt: '',
  trackStock: false,
  stock: undefined as number | undefined,
  variants: [] as Variant[],
};

// Converts an ISO date string to the "YYYY-MM-DDTHH:mm" format <input type="datetime-local"> expects.
function toDatetimeLocal(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
          category: editingProduct.category?._id || editingProduct.category || '',
          images: editingProduct.images?.length ? editingProduct.images : [''],
          imageMeta: (editingProduct.images?.length ? editingProduct.images : ['']).map((url: string) => {
            const existing = editingProduct.imageMeta?.find((m: any) => m.url === url);
            return { name: existing?.name || '', title: existing?.title || '', alt: existing?.alt || '' };
          }),
          videoUrl: editingProduct.videoUrl || '',
          basePrice: editingProduct.basePrice,
          compareAtPrice: editingProduct.compareAtPrice,
          isActive: editingProduct.isActive,
          isFeatured: editingProduct.isFeatured,
          isNewArrival: !!editingProduct.isNewArrival,
          isBestSeller: !!editingProduct.isBestSeller,
          isHotDeal: !!editingProduct.isHotDeal,
          saleEnabled: !!editingProduct.saleEnabled,
          salePrice: editingProduct.salePrice,
          saleEndsAt: toDatetimeLocal(editingProduct.saleEndsAt),
          trackStock: !!editingProduct.trackStock,
          stock: editingProduct.stock,
          variants: editingProduct.variants || [],
        }
      : { ...emptyForm },
  );
  const [saving, setSaving] = useState(false);
  // Once admin edits the slug directly, stop auto-generating it from the title.
  // Existing products' slugs are treated as already "manual" so editing the
  // title doesn't silently change a live product's URL.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!editingProduct);

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
      const nonEmptyPairs = form.images
        .map((url, i) => ({ url, meta: form.imageMeta[i] || { name: '', title: '', alt: '' } }))
        .filter((pair) => Boolean(pair.url));
      const payload = {
        ...form,
        images: nonEmptyPairs.map((p) => p.url),
        imageMeta: nonEmptyPairs.map((p) => ({ url: p.url, ...p.meta })),
        saleEndsAt: form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : undefined,
      };
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
          onChange={(e) => {
            const title = e.target.value;
            setForm({ ...form, title, slug: slugManuallyEdited ? form.slug : slugify(title) });
          }} />
        <input className="input" placeholder="Slug (url-friendly, auto-filled from title)" required value={form.slug}
          onChange={(e) => {
            setSlugManuallyEdited(true);
            setForm({ ...form, slug: e.target.value });
          }} />
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

      <div className="border rounded-lg p-4 space-y-3 bg-red-50/40 border-red-100">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.saleEnabled}
            onChange={(e) => setForm({ ...form, saleEnabled: e.target.checked })} />
          Flash sale (applies only when no variant is selected — see docs)
        </label>
        {form.saleEnabled && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sale price</label>
              <input type="number" className="input" placeholder="e.g. 399"
                value={form.salePrice ?? ''}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sale ends at</label>
              <input type="datetime-local" className="input"
                value={form.saleEndsAt}
                onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })} />
            </div>
            {form.salePrice != null && form.basePrice > 0 && form.salePrice < form.basePrice && (
              <p className="text-xs text-red-600 sm:col-span-2">
                {Math.round(((form.basePrice - form.salePrice) / form.basePrice) * 100)}% off — the base price (₹{form.basePrice}) will show struck through, with a live countdown on the product page.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Images (up to 5 — first one is the main photo)</p>
          <span className="text-xs text-gray-400">{form.images.filter(Boolean).length}/5</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Name, title and alt text help search engines understand and rank each photo — alt text
          especially also matters for accessibility (screen readers).
        </p>
        {form.images.map((img, i) => (
          <div key={i} className="border rounded-lg p-3 mb-3 space-y-2">
            <div className="flex gap-2">
              <input className="input" placeholder="https://..." value={img}
                onChange={(e) => {
                  const copy = [...form.images];
                  copy[i] = e.target.value;
                  setForm({ ...form, images: copy });
                }} />
              {form.images.length > 1 && (
                <button type="button" onClick={() => {
                  setForm({
                    ...form,
                    images: form.images.filter((_, idx) => idx !== i),
                    imageMeta: form.imageMeta.filter((_, idx) => idx !== i),
                  });
                }}
                  className="text-red-500 text-sm px-2 shrink-0">✕</button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              <input className="input text-xs" placeholder="Name (SEO — auto-formatted)"
                value={form.imageMeta[i]?.name || ''}
                onChange={(e) => {
                  const copy = [...form.imageMeta];
                  copy[i] = { ...copy[i], name: slugify(e.target.value) };
                  setForm({ ...form, imageMeta: copy });
                }} />
              <input className="input text-xs" placeholder="Title attribute"
                value={form.imageMeta[i]?.title || ''}
                onChange={(e) => {
                  const copy = [...form.imageMeta];
                  copy[i] = { ...copy[i], title: e.target.value };
                  setForm({ ...form, imageMeta: copy });
                }} />
              <input className="input text-xs" placeholder="Alt text"
                value={form.imageMeta[i]?.alt || ''}
                onChange={(e) => {
                  const copy = [...form.imageMeta];
                  copy[i] = { ...copy[i], alt: e.target.value };
                  setForm({ ...form, imageMeta: copy });
                }} />
            </div>
          </div>
        ))}
        {form.images.length < 5 && (
          <button type="button" onClick={() => setForm({
            ...form,
            images: [...form.images, ''],
            imageMeta: [...form.imageMeta, { name: '', title: '', alt: '' }],
          })}
            className="text-sm text-brand-500">+ Add image</button>
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

      {form.variants.length === 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.trackStock}
              onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
            Track stock for this product
          </label>
          <p className="text-xs text-gray-500">
            Off by default — the product always shows as available. Turn this on to mark it "Sold
            Out" automatically once stock hits zero. (Products with variants track stock per
            variant instead, above.)
          </p>
          {form.trackStock && (
            <input type="number" min={0} className="input" placeholder="Quantity in stock"
              value={form.stock ?? ''}
              onChange={(e) => setForm({ ...form, stock: e.target.value ? Number(e.target.value) : undefined })} />
          )}
        </div>
      )}

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
