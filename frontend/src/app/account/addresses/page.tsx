'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, Trash2, Star, Edit3, X } from 'lucide-react';
import { userService } from '@/services/userService';
import { Address } from '@/types';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

const emptyForm: Omit<Address, 'id'> = {
  fullName: '', phone: '', street: '', apartment: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false, type: 'home',
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => userService.getAddresses(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      fullName: a.fullName, phone: a.phone, street: a.street, apartment: a.apartment || '',
      city: a.city, state: a.state, postalCode: a.postalCode, country: a.country || 'India',
      isDefault: a.isDefault, type: a.type || 'home',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    if (editingId) {
      await userService.updateAddress(editingId, form);
      toast.success('Address updated');
    } else {
      await userService.addAddress(form as Omit<Address, 'id'>);
      toast.success('Address added');
    }
    setSaving(false);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
  };

  const remove = async (id: string) => {
    await userService.deleteAddress(id);
    toast.success('Address removed');
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
  };

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal uppercase">Saved Addresses</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-brand-charcoal text-white text-sm font-bold rounded-xl hover:bg-brand-dark">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : addresses.length === 0 ? (
        <EmptyState title="No saved addresses" description="Add a delivery address for faster checkout." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-gray-100 rounded-xl p-4 relative hover:border-brand-lime transition-colors">
              {a.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-brand-lime text-brand-charcoal px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> DEFAULT
                </span>
              )}
              <MapPin className="w-5 h-5 text-brand-lime mb-2" />
              <p className="font-bold text-sm">{a.fullName}</p>
              <p className="text-xs text-gray-400 capitalize mb-1">{a.type || 'home'}</p>
              <p className="text-sm text-gray-600">{a.street}{a.apartment ? `, ${a.apartment}` : ''}</p>
              <p className="text-sm text-gray-600">{a.city}, {a.state} — {a.postalCode}</p>
              <p className="text-xs text-gray-400 mt-1">{a.country} · {a.phone}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(a)} className="flex items-center gap-1 text-xs font-bold text-brand-charcoal hover:text-brand-lime-hover">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => remove(a.id)} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg uppercase">{editingId ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Full Name *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="Street Address *" className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.apartment} onChange={(e) => set('apartment', e.target.value)} placeholder="Apartment / Landmark" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="State *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="PIN Code *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              <input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-semibold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} className="w-4 h-4 accent-brand-lime" />
              Set as default address
            </label>
            <button onClick={save} disabled={saving} className="w-full mt-5 py-3 bg-brand-lime text-brand-charcoal font-bold rounded-xl hover:bg-brand-lime-hover disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
