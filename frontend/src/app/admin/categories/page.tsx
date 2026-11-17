'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { adminCategoryBrandService } from '@/services/adminService';
import { mockStore } from '@/lib/mockStore';
import { Category } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', featured: false });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', image: '', featured: false }); setShowForm(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', image: c.image || '', featured: !!c.featured });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    const payload = { name: form.name, description: form.description, image: form.image, featured: form.featured, status: 'active' };
    try {
      if (editing) await adminCategoryBrandService.updateCategory(editing.id, payload);
      else await adminCategoryBrandService.createCategory(payload);
      toast.success(editing ? 'Category updated' : 'Category created');
    } catch {
      // Offline fallback
      const all = mockStore.getCategories();
      if (editing) {
        mockStore.saveCategories?.(all.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
      } else {
        const nc: Category = { id: `cat-${Date.now()}`, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), itemCount: 0, ...form };
        mockStore.saveCategories?.([...all, nc]);
      }
      toast.info('Saved locally (backend offline)');
    }
    setSaving(false);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminCategoryBrandService.deleteCategory(c.id);
      toast.success('Category deleted');
    } catch {
      toast.error('Delete failed — backend offline');
    }
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover"><Plus className="w-4 h-4" /> Add Category</button>}
      />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No categories" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="relative h-32 bg-brand-gray">
                {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.itemCount ?? 0} products</p>
                  </div>
                  {c.featured && <Badge color="green">Featured</Badge>}
                </div>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:border-brand-lime"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => remove(c)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-red-200 text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg uppercase">{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name *" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none" />
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-brand-lime" /> Featured on homepage</label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 font-bold text-sm rounded-xl">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
