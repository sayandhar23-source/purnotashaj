'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const emptyForm = { name: '', slug: '', description: '', image: '', parent: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/categories/admin/all').then((res) => setCategories(res.data));
  useEffect(() => {
    load();
  }, []);

  const topLevelCategories = categories.filter((c) => !c.parent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parent: form.parent || null };
      if (editingId) {
        await api.patch(`/categories/${editingId}`, payload);
        toast.success('Category updated.');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created.');
      }
      setForm({ ...emptyForm });
      setEditingId(null);
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Subcategories under it will be orphaned.')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted.');
    load();
  };

  return (
    <>
      <h1 className="text-2xl font-serif font-semibold mb-8">Categories</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-10 max-w-lg">
        <h2 className="font-semibold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
        <input className="input" placeholder="Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Slug" required value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <select className="input" value={form.parent}
          onChange={(e) => setForm({ ...form, parent: e.target.value })}>
          <option value="">— Top-level category —</option>
          {topLevelCategories.map((c) => (
            <option key={c._id} value={c._id}>Subcategory of: {c.name}</option>
          ))}
        </select>
        <input className="input" placeholder="Image URL" value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea className="input" placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={() => { setForm({ ...emptyForm }); setEditingId(null); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {topLevelCategories.map((c) => (
          <div key={c._id}>
            <div className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">/{c.slug}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => {
                    setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '', parent: '' });
                    setEditingId(c._id);
                  }}
                  className="text-brand-500"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
            <div className="ml-6 mt-2 space-y-2">
              {categories
                .filter((sub) => sub.parent?._id === c._id || sub.parent === c._id)
                .map((sub) => (
                  <div key={sub._id} className="card p-3 flex items-center justify-between bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">↳ {sub.name}</p>
                      <p className="text-xs text-gray-500">/{sub.slug}</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        onClick={() => {
                          setForm({ name: sub.name, slug: sub.slug, description: sub.description || '', image: sub.image || '', parent: c._id });
                          setEditingId(sub._id);
                        }}
                        className="text-brand-500"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(sub._id)} className="text-red-500">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
  </>
  );
}
