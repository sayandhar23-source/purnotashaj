'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus, ArrowLeft, ImageOff } from 'lucide-react';
import { api } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';

// Collect a category node's id plus every descendant id, so selecting "Jewellery"
// shows products filed under any of its subcategories too.
function collectIds(node: any): string[] {
  const ids = [node._id];
  for (const child of node.children || []) ids.push(...collectIds(child));
  return ids;
}

export default function AdminProductsPage() {
  const [view, setView] = useState<'browse' | 'form'>('browse');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTop, setSelectedTop] = useState<any | null>(null);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [productsRes, treeRes, flatRes] = await Promise.all([
        api.get('/products/admin/all', { params: { limit: 500 } }),
        api.get('/categories'),
        api.get('/categories/admin/all'),
      ]);
      setProducts(productsRes.data.products);
      setCategoryTree(treeRes.data);
      setFlatCategories(flatRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const visibleProducts = useMemo(() => {
    const node = selectedSub || selectedTop;
    if (!node) return products;
    const ids = collectIds(node);
    return products.filter((p) => ids.includes(p.category?._id || p.category));
  }, [products, selectedTop, selectedSub]);

  const startAdd = () => {
    setEditingProduct(null);
    setView('form');
  };

  const startEdit = (p: any) => {
    setEditingProduct(p);
    setView('form');
  };

  const handleSaved = () => {
    setView('browse');
    setEditingProduct(null);
    loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted.');
    loadAll();
  };

  if (view === 'form') {
    return (
      <div>
        <button
          onClick={() => { setView('browse'); setEditingProduct(null); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-500 mb-4"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
        <h1 className="text-2xl font-serif font-semibold mb-6">
          {editingProduct ? `Edit: ${editingProduct.title}` : 'Add New Product'}
        </h1>
        <ProductForm
          categories={flatCategories}
          editingProduct={editingProduct}
          onSaved={handleSaved}
          onCancel={() => { setView('browse'); setEditingProduct(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-semibold">Products</h1>
        <button onClick={startAdd} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Top-level category navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        <button
          onClick={() => { setSelectedTop(null); setSelectedSub(null); }}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
            !selectedTop ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 text-gray-600 hover:border-brand-400'
          }`}
        >
          All Products ({products.length})
        </button>
        {categoryTree.map((cat) => (
          <button
            key={cat._id}
            onClick={() => { setSelectedTop(cat); setSelectedSub(null); }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
              selectedTop?._id === cat._id ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 text-gray-600 hover:border-brand-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategory navigation — appears once a top-level category with children is selected */}
      {selectedTop?.children?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          <button
            onClick={() => setSelectedSub(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
              !selectedSub ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300'
            }`}
          >
            All in {selectedTop.name}
          </button>
          {selectedTop.children.map((sub: any) => (
            <button
              key={sub._id}
              onClick={() => setSelectedSub(sub)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
                selectedSub?._id === sub._id ? 'bg-brand-50 border-brand-500 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading products...</p>
      ) : visibleProducts.length === 0 ? (
        <p className="text-gray-500 text-sm">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleProducts.map((p) => (
            <div key={p._id} className="card overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageOff size={28} />
                  </div>
                )}
                {!p.isActive && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-1" title={p.title}>{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ₹{p.basePrice} · Stock: {p.totalStock}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{p.category?.name}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg border border-gray-300 hover:border-brand-500 hover:text-brand-600"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-gray-300 text-red-500 hover:border-red-400"
                    aria-label="Delete product"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
