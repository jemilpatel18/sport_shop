'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Package, Truck, CheckCircle2, XCircle, MapPin, Phone, CreditCard } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDateTime } from '@/lib/utils';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';
import { orderStatusColors as statusColors } from '@/lib/orderStatus';

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>;
  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <EmptyState title="Order not found" />
        <div className="text-center"><Link href="/account/orders" className="text-sm font-bold">← Back to orders</Link></div>
      </div>
    );
  }

  const cancelOrder = async () => {
    const reason = window.prompt('Reason for cancellation?');
    if (!reason) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(order.id, reason);
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const timeline = order.timeline || [];

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-charcoal">
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-brand-charcoal">{order.orderNumber}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && (
            <button onClick={cancelOrder} disabled={cancelling} className="px-5 py-2.5 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50">
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>

        {order.trackingNumber && (
          <div className="mt-5 p-4 bg-brand-gray rounded-xl flex items-center gap-3">
            <Truck className="w-5 h-5 text-brand-charcoal" />
            <div>
              <p className="text-sm font-bold">Tracking: {order.trackingNumber}</p>
              <p className="text-xs text-gray-500">{order.trackingCarrier} · Est. {order.estimatedDelivery || '3-5 business days'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-lg uppercase mb-5">Order Tracking</h2>
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.completed ? 'bg-brand-lime' : 'bg-gray-100'}`}>
                    {t.completed ? <CheckCircle2 className="w-4 h-4 text-brand-charcoal" /> : <Package className="w-4 h-4 text-gray-400" />}
                  </div>
                  {i < timeline.length - 1 && <div className={`w-0.5 h-10 ${t.completed ? 'bg-brand-lime' : 'bg-gray-200'}`} />}
                </div>
                <div className="pb-6">
                  <p className={`font-bold text-sm ${t.completed ? 'text-brand-charcoal' : 'text-gray-400'}`}>{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                  {t.timestamp && <p className="text-[11px] text-gray-400 mt-0.5">{formatDateTime(t.timestamp)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display font-bold text-lg uppercase mb-4">Items</h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-gray shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.brand} {item.size && `· Size ${item.size}`} {item.color && `· ${item.color}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>

        {/* Address & payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-lg uppercase mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-lime" /> Delivery Address</h2>
            <p className="font-bold text-sm">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.street}{order.shippingAddress?.apartment ? `, ${order.shippingAddress.apartment}` : ''}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Phone className="w-3 h-3" /> {order.shippingAddress?.phone || order.customerPhone}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-bold text-lg uppercase mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-lime" /> Payment</h2>
            <p className="font-bold text-sm">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
            <p className="text-sm text-gray-600 mt-1">Status: <span className="font-semibold">{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
