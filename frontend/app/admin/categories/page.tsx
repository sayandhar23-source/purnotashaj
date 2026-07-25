'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const emptyForm = { name: '', slug: '', description: '', image: '', parent: '' };

// Normalizes a category's parent field to a plain id string — the backend
// sometimes returns it populated as { _id, name }, sometimes as a bare id.
function parentId(category: any): string | null {
  if (!category.parent) return null;
  return typeof category.parent === 'object' ? category.parent._id : category.parent;
}

// Builds a proper tree from the flat admin list, at any depth — not just
// one level. Also returns a flat "options" list (each with a depth, for
// indentation) so the parent-picker can offer ANY existing category, not
// just top-level ones.
function buildTree(categories: any[]) {
  const byId: Record<string, any> = {};
  categories.forEach((c) => (byId[c._id] = { ...c, children: [] }));
  const roots: any[] = [];
  categories.forEach((c) => {
    const pId = parentId(c);
    if (pId && byId[pId]) byId[pId].children.push(byId[c._id]);
    else roots.push(byId[c._id]);
  });

  const options: { _id: string; name: string; depth: number }[] = [];
  function walk(nodes: any[], depth: number) {
    for (const node of nodes) {
      options.push({ _id: node._id, name: node.name, depth });
      walk(node.children, depth + 1);
    }
  }
  walk(roots, 0);

  return { roots, options };
}

export default function AdminCategoriesPage() {
  useDocumentTitle('Admin · Categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/categories/admin/all').then((res) => setCategories(res.data));
  useEffect(() => {
    load();
  }, []);

  const { roots, options } = buildTree(categories);
  // A category can't be its own parent, and (to keep things simple) can't be
  // parented under one of its own descendants either — filter those out.
  const parentOptions = editingId
    ? options.filter((o) => o._id !== editingId && !isDescendant(categories, editingId, o._id))
    : options;

  function isDescendant(all: any[], ancestorId: string, candidateId: string): boolean {
    const node = all.find((c) => c._id === candidateId);
    if (!node) return false;
    const pId = parentId(node);
    if (!pId) return false;
    if (pId === ancestorId) return true;
    return isDescendant(all, ancestorId, pId);
  }

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

  const handleEdit = (c: any) => {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      parent: parentId(c) || '',
    });
    setEditingId(c._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Subcategories under it will be orphaned.')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Category deleted.');
    load();
  };

  const cancelEdit = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
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
        <div>
          <select className="input" value={form.parent}
            onChange={(e) => setForm({ ...form, parent: e.target.value })}>
            <option value="">— Top-level category —</option>
            {parentOptions.map((o) => (
              <option key={o._id} value={o._id}>
                {'—'.repeat(o.depth)} {o.depth > 0 ? ' ' : ''}{o.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pick any existing category as the parent — subcategories can nest as deep as you like
            (e.g. Saree → Cotton → Jamdani).
          </p>
        </div>
        <input className="input" placeholder="Image URL" value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea className="input" placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="btn-outline" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {roots.map((node) => (
          <CategoryNode key={node._id} node={node} depth={0} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}

function CategoryNode({
  node,
  depth,
  onEdit,
  onDelete,
}: {
  node: any;
  depth: number;
  onEdit: (c: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <div className={`card p-4 flex items-center justify-between ${depth > 0 ? 'bg-gray-50' : ''}`}>
        <div>
          <p className={depth > 0 ? 'text-sm font-medium' : 'font-medium'}>
            {depth > 0 && '↳ '}
            {node.name}
          </p>
          <p className="text-xs text-gray-500">/{node.slug}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <button onClick={() => onEdit(node)} className="text-brand-500">
            Edit
          </button>
          <button onClick={() => onDelete(node._id)} className="text-red-500">
            Delete
          </button>
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child: any) => (
            <CategoryNode key={child._id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
