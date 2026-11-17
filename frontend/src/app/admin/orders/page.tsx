'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

const statusColor: Record<string, 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange'> = {
  PENDING: 'yellow', CONFIRMED: 'blue', PROCESSING: 'blue', SHIPPED: 'purple',
  OUT_FOR_DELIVERY: 'purple', DELIVERED: 'green', CANCELLED: 'red',
  RETURN_REQUESTED: 'orange', RETURNED: 'orange',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => adminService.getAllOrders({ page, limit: 15, status: statusFilter || undefined }),
  });
  const orders = (data?.data ?? []) as Order[];
  const pagination = data?.pagination as any;

  const filtered = orders.filter(
    (o) => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const openOrder = (o: Order) => {
    setSelected(o);
    setNewStatus(o.orderStatus);
    setTrackingNumber(o.trackingNumber || '');
  };

  const updateStatus = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      await adminService.updateOrderStatus(selected.id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });
      toast.success(`Order ${selected.orderNumber} → ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelected(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage all store orders" />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, customer, email…" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-lime" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No orders" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-brand-gray/50">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-gray/40">
                    <td className="px-4 py-3 font-bold">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">{o.items?.length ?? 0}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3"><Badge color={o.paymentStatus === 'PAID' ? 'green' : 'yellow'}>{o.paymentStatus}</Badge></td>
                    <td className="px-4 py-3"><Badge color={statusColor[o.orderStatus] || 'gray'}>{o.orderStatus?.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openOrder(o)} className="p-2 text-gray-500 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-semibold">Page {page} of {pagination.totalPages}</span>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-xl uppercase">{selected.orderNumber}</h2>
                <p className="text-xs text-gray-500">{formatDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-5 text-sm">
              <div className="bg-brand-gray rounded-xl p-4">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Customer</p>
                <p className="font-bold">{selected.customerName}</p>
                <p className="text-gray-600">{selected.customerEmail}</p>
                <p className="text-gray-600">{selected.customerPhone}</p>
              </div>
              <div className="bg-brand-gray rounded-xl p-4">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Delivery Address</p>
                <p className="font-semibold">{selected.shippingAddress?.fullName}</p>
                <p className="text-gray-600">{selected.shippingAddress?.street}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} — {selected.shippingAddress?.postalCode}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead className="bg-brand-gray/50 text-xs uppercase text-gray-400">
                  <tr><th className="text-left px-3 py-2">Item</th><th className="text-left px-3 py-2">Qty</th><th className="text-right px-3 py-2">Price</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selected.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 font-semibold">{it.name}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 text-sm space-y-1 border-t border-gray-100">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{selected.shipping === 0 ? 'FREE' : formatPrice(selected.shipping)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>
            </div>

            {/* Status update */}
            <div className="bg-brand-gray rounded-xl p-4">
              <p className="text-xs font-bold uppercase text-gray-400 mb-3">Update Order Status</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number (optional)" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <button onClick={updateStatus} disabled={updating} className="mt-3 w-full py-3 bg-brand-charcoal text-white font-bold text-sm rounded-xl hover:bg-brand-dark disabled:opacity-50">
                {updating ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
