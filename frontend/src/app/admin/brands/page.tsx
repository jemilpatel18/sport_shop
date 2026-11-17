'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { brandService } from '@/services/brandService';
import { adminCategoryBrandService } from '@/services/adminService';
import { mockStore } from '@/lib/mockStore';
import { Brand } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => brandService.getBrands(),
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', logo: '', description: '' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm({ name: '', logo: '', description: '' }); setShowForm(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logo: b.logo || '', description: b.description || '' }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    const payload = { name: form.name, logo: form.logo, description: form.description, status: 'active' };
    try {
      if (editing) await adminCategoryBrandService.updateBrand(editing.id, payload);
      else await adminCategoryBrandService.createBrand(payload);
      toast.success(editing ? 'Brand updated' : 'Brand created');
    } catch {
      const all = mockStore.getBrands();
      if (editing) {
        mockStore.saveBrands(all.map((b) => (b.id === editing.id ? { ...b, ...form } : b)));
      } else {
        const nb: Brand = { id: `brand-${Date.now()}`, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), itemCount: 0, ...form };
        mockStore.saveBrands([...all, nb]);
      }
      toast.info('Saved locally (backend offline)');
    }
    setSaving(false);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  };

  const remove = async (b: Brand) => {
    if (!window.confirm(`Delete brand "${b.name}"?`)) return;
    try {
      await adminCategoryBrandService.deleteBrand(b.id);
      toast.success('Brand deleted');
    } catch {
      toast.error('Delete failed — backend offline');
    }
    queryClient.invalidateQueries({ queryKey: ['brands'] });
  };

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} brands`}
        action={<button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover"><Plus className="w-4 h-4" /> Add Brand</button>}
      />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No brands" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-brand-gray/50">
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-brand-gray/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-charcoal flex items-center justify-center font-display font-bold text-brand-lime text-sm">
                        {b.name?.[0]}
                      </div>
                      <span className="font-bold">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{b.description || '—'}</td>
                  <td className="px-4 py-3"><Badge color="blue">{b.itemCount ?? 0}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(b)} className="p-2 text-gray-500 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(b)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg uppercase">{editing ? 'Edit' : 'Add'} Brand</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brand name *" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Logo URL" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none" />
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
