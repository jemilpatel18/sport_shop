'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Search, Edit3, Trash2, X, Upload } from 'lucide-react';
import { productService } from '@/services/productService';
import { adminService } from '@/services/adminService';
import { mockStore } from '@/lib/mockStore';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

const emptyForm = {
  name: '', brand: '', category: '', description: '', originalPrice: '', price: '', stock: '',
  imageUrl: '', sizes: '', colors: '', isFeatured: false, isNewArrival: false, isBestSeller: false,
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productService.getProducts({ search: search || undefined, page, limit: 12, sort: 'newest' }),
  });
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand, category: p.category, description: p.description || '',
      originalPrice: String(p.originalPrice), price: String(p.price), stock: String(p.stock),
      imageUrl: p.images?.[0] || '',
      sizes: (p.sizes || []).join(', '),
      colors: (p.colors || []).map((c) => `${c.name}:${c.hex}`).join(', '),
      isFeatured: !!p.isFeatured, isNewArrival: !!p.isNewArrival, isBestSeller: !!p.isBestSeller,
    });
    setShowForm(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminService.uploadImage(file);
      if (url) {
        setForm((f) => ({ ...f, imageUrl: url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed — use an image URL instead');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.brand || !form.category || !form.price || !form.imageUrl) {
      toast.error('Name, brand, category, price and image are required');
      return;
    }
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      description: form.description || `${form.name} by ${form.brand}`,
      originalPrice: Number(form.originalPrice) || Number(form.price),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      images: [form.imageUrl],
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((c) => {
        const [name, hex] = c.split(':').map((x) => x.trim());
        return { name: name || 'Default', hex: hex || '#111111' };
      }).filter((c) => c.name),
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
      specifications: {},
      features: [],
      tags: [form.category.toLowerCase()],
    };
    try {
      if (editing) {
        await adminService.updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(payload);
        toast.success('Product created');
      }
    } catch {
      // Offline fallback: update local mock store
      const all = mockStore.getProducts();
      if (editing) {
        mockStore.saveProducts(all.map((p) => (p.id === editing.id ? { ...p, ...payload, id: p.id, slug: p.slug, images: payload.images, price: Number(payload.price), originalPrice: Number(payload.originalPrice), stock: Number(payload.stock) } as Product : p)));
        toast.info('Saved locally (backend offline)');
      } else {
        const newProduct: Product = {
          ...payload,
          id: `prod-${Date.now()}`,
          slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          discount: payload.originalPrice > payload.price ? Math.round(((payload.originalPrice - payload.price) / payload.originalPrice) * 100) : 0,
          rating: 0, reviewCount: 0, inStock: payload.stock > 0,
          createdAt: new Date().toISOString(),
        } as Product;
        mockStore.saveProducts([...all, newProduct]);
        toast.info('Product added locally (backend offline)');
      }
    }
    setSaving(false);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await adminService.deleteProduct(p.id);
      toast.success('Product deleted');
    } catch {
      mockStore.saveProducts(mockStore.getProducts().filter((x) => x.id !== p.id));
      toast.info('Deleted locally (backend offline)');
    }
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${pagination?.total ?? products.length} products`}
        action={
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-lime"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No products" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-brand-gray/50">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-gray/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-brand-gray shrink-0">
                          <Image src={p.images?.[0]} alt={p.name} fill className="object-cover" sizes="44px" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-[220px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.sku || p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.brand}</td>
                    <td className="px-4 py-3 capitalize">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <Badge color={p.stock <= 5 ? 'red' : p.stock <= 15 ? 'orange' : 'green'}>{p.stock}</Badge>
                    </td>
                    <td className="px-4 py-3"><Badge color={p.inStock ? 'green' : 'red'}>{p.inStock ? 'Active' : 'Out'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-500 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => remove(p)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
              <span className="px-4 py-2 text-sm font-semibold">{page} / {pagination.totalPages}</span>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl uppercase">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Brand *</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Nike" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Category *</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. cricket" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Original Price ($) *</label>
                <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Selling Price ($) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Stock *</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Image *</label>
                <div className="flex gap-2">
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://… image URL" className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
                  <label className={`px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-bold cursor-pointer hover:border-brand-lime flex items-center gap-2 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="w-4 h-4" /> {uploading ? '…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
                {form.imageUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden mt-2 bg-brand-gray">
                    <Image src={form.imageUrl} alt="preview" fill className="object-cover" sizes="80px" />
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Sizes (comma separated)</label>
                <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Colors (Name:#hex, …)</label>
                <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black:#111111, White:#FFFFFF" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              {[
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'isBestSeller', label: 'Best Seller' },
              ].map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="w-4 h-4 accent-brand-lime" />
                  {f.label}
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 font-bold text-sm rounded-xl hover:bg-brand-gray">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
