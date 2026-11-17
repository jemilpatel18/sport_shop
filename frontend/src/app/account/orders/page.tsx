'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ChevronRight, Search } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { orderStatusColors as statusColors } from '@/lib/orderStatus';

export default function MyOrdersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal uppercase">My Orders</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-56 focus:outline-none focus:border-brand-lime"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="w-10 h-10" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders found" description={search ? 'Try a different search term.' : 'When you place an order, it will appear here.'} />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id || o.orderNumber}`}
              className="block border border-gray-100 rounded-xl p-4 hover:border-brand-lime transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex -space-x-2 shrink-0">
                  {o.items.slice(0, 4).map((it, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white bg-brand-gray">
                      <Image src={it.image} alt={it.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{o.orderNumber}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[o.orderStatus] || 'bg-gray-100'}`}>
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {o.items.length} item{o.items.length !== 1 ? 's' : ''} · {formatDate(o.createdAt)} · {o.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <p className="font-bold">{formatPrice(o.total)}</p>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
