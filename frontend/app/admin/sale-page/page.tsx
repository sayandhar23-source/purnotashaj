'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function AdminSalePagePage() {
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    ctaText: '',
    pageTitle: '',
    pageSubtitle: '',
    isActive: true,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [contentRes, categoriesRes, productsRes] = await Promise.all([
        api.get('/sale-banner'),
        api.get('/categories/admin/all'),
        api.get('/products/admin/all', { params: { limit: 500 } }),
      ]);
      setContent(contentRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      await api.patch('/sale-banner', content);
      toast.success('Sale banner text updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save.');
    } finally {
      setSavingContent(false);
    }
  };

  const toggleCategory = async (cat: any) => {
    const next = !cat.showOnSalePage;
    setCategories((prev) => prev.map((c) => (c._id === cat._id ? { ...c, showOnSalePage: next } : c)));
    try {
      await api.patch(`/categories/${cat._id}`, { showOnSalePage: next });
    } catch {
      toast.error('Could not update category.');
      setCategories((prev) => prev.map((c) => (c._id === cat._id ? { ...c, showOnSalePage: !next } : c)));
    }
  };

  const toggleProduct = async (product: any) => {
    const next = !product.showOnSalePage;
    setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, showOnSalePage: next } : p)));
    try {
      await api.patch(`/products/${product._id}`, { showOnSalePage: next });
    } catch {
      toast.error('Could not update product.');
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, showOnSalePage: !next } : p)));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <p className="text-gray-400 text-sm">Loading...</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-2">Sale Page</h1>
      <p className="text-sm text-gray-500 mb-8">
        Control the homepage banner text and the dedicated <code>/sale</code> page — both the
        wording and which categories or individual products show up there.
      </p>

      <form onSubmit={saveContent} className="card p-6 space-y-4 mb-10 max-w-2xl">
        <h2 className="font-semibold">Banner &amp; page text</h2>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={content.isActive}
            onChange={(e) => setContent({ ...content, isActive: e.target.checked })} />
          Show the sale banner on the homepage
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Homepage banner — hero title</label>
            <input className="input" value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Homepage banner — subtitle</label>
            <input className="input" value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Homepage banner — button text</label>
            <input className="input" value={content.ctaText}
              onChange={(e) => setContent({ ...content, ctaText: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">/sale page — heading</label>
            <input className="input" value={content.pageTitle}
              onChange={(e) => setContent({ ...content, pageTitle: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 block mb-1">/sale page — subtitle</label>
            <input className="input" value={content.pageSubtitle}
              onChange={(e) => setContent({ ...content, pageSubtitle: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={savingContent} className="btn-primary">
          {savingContent ? 'Saving...' : 'Save text'}
        </button>
      </form>

      <div className="card p-6 mb-10">
        <h2 className="font-semibold mb-1">Categories on the sale page</h2>
        <p className="text-xs text-gray-500 mb-4">
          Turning on a category includes every product in it (and its subcategories) on the sale page.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label key={c._id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2">
              <input type="checkbox" checked={!!c.showOnSalePage} onChange={() => toggleCategory(c)} />
              {c.parent?.name ? `${c.parent.name} > ${c.name}` : c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Individual products on the sale page</h2>
          <input className="input w-56" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="space-y-1 max-h-[420px] overflow-y-auto">
          {filteredProducts.map((p) => (
            <label key={p._id} className="flex items-center gap-3 text-sm border-b last:border-0 py-2">
              <input type="checkbox" checked={!!p.showOnSalePage} onChange={() => toggleProduct(p)} />
              <span className="flex-1">{p.title}</span>
              <span className="text-xs text-gray-400">{p.category?.name}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
