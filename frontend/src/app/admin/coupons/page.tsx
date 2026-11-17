'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X, Ticket } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Coupon } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

const emptyForm = {
  code: '', discountType: 'percentage' as 'percentage' | 'fixed', discountPercentage: '10',
  discountValue: '', maxDiscount: '', minOrderValue: '0', expiryDate: '', description: '', isActive: true,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService.getCoupons(),
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType || 'percentage',
      discountPercentage: String(c.discountPercentage),
      discountValue: c.discountValue != null ? String(c.discountValue) : '',
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '',
      minOrderValue: String(c.minOrderValue || 0),
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : '',
      description: c.description || '',
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code.trim()) return toast.error('Code is required');
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountPercentage: Number(form.discountPercentage) || 10,
      discountValue: form.discountValue ? Number(form.discountValue) : undefined,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrderValue: Number(form.minOrderValue) || 0,
      expiryDate: form.expiryDate || undefined,
      description: form.description || undefined,
      isActive: form.isActive,
    };
    try {
      if (editing) await adminService.updateCoupon(editing.id, payload);
      else await adminService.createCoupon(payload);
      toast.success('Coupon saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon');
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await adminService.deleteCoupon(c.id);
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="Create and manage discount codes"
        action={<button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover"><Plus className="w-4 h-4" /> Add Coupon</button>}
      />
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No coupons yet" description="Create your first discount code." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-lg tracking-wider bg-brand-charcoal text-brand-lime px-3 py-1 rounded-lg">{c.code}</span>
                <Badge color={c.isActive ? 'green' : 'red'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-2xl font-bold text-brand-charcoal">
                {c.discountType === 'fixed' ? `$${c.discountValue ?? c.discountPercentage}` : `${c.discountPercentage}% OFF`}
                {c.maxDiscount ? <span className="text-xs font-normal text-gray-400"> (max ${c.maxDiscount})</span> : null}
              </p>
              <p className="text-xs text-gray-500 mt-1">Min order: ${c.minOrderValue || 0}</p>
              {c.expiryDate && <p className="text-xs text-gray-400 mt-0.5">Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>}
              {c.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.description}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:border-brand-lime"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => remove(c)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-red-200 text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg uppercase">{editing ? 'Edit' : 'Add'} Coupon</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold tracking-wider" />
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
              {form.discountType === 'percentage' ? (
                <input type="number" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} placeholder="Discount %" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              ) : (
                <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="Amount $" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              )}
              <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Max discount $ (optional)" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} placeholder="Min order value $" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-brand-lime" /> Active</label>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 font-bold text-sm rounded-xl">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl disabled:opacity-50">{saving ? 'Saving…' : 'Save Coupon'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
