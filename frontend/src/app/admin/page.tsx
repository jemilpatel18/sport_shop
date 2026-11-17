'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign, ShoppingCart, Users, Package, AlertTriangle, ArrowRight, TrendingUp,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { formatPrice, formatDate } from '@/lib/utils';
import StatCard, { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import { Order } from '@/types';

const statusColor: Record<string, 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange'> = {
  PENDING: 'yellow', CONFIRMED: 'blue', PROCESSING: 'blue', SHIPPED: 'purple',
  OUT_FOR_DELIVERY: 'purple', DELIVERED: 'green', CANCELLED: 'red',
  RETURN_REQUESTED: 'orange', RETURNED: 'orange',
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminService.getDashboardStats() });
  const { data: sales = [] } = useQuery({ queryKey: ['admin-sales'], queryFn: () => adminService.getSalesReport('30d') });
  const { data: recentOrders = [] } = useQuery<Order[]>({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const res = await adminService.getAllOrders({ limit: 5 });
      return res.data as Order[];
    },
  });
  const { data: lowStock = [] } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: () => adminService.getInventoryAlerts(5),
  });

  const maxRevenue = Math.max(...sales.map((s) => s.revenue || 0), 1);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Store performance at a glance" />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Revenue" value={formatPrice(stats?.totalRevenue ?? 0)} icon={DollarSign} />
            <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingCart} />
            <StatCard title="Customers" value={stats?.totalCustomers ?? 0} icon={Users} />
            <StatCard title="Products" value={stats?.totalProducts ?? 0} icon={Package} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* Sales chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg uppercase">Sales — Last 30 Days</h2>
                <TrendingUp className="w-5 h-5 text-brand-lime" />
              </div>
              {sales.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-16">No sales data yet.</p>
              ) : (
                <div className="flex items-end gap-1.5 h-48">
                  {sales.slice(-30).map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-brand-lime rounded-t hover:bg-brand-lime-hover transition-colors cursor-pointer"
                        style={{ height: `${Math.max(4, ((s.revenue || 0) / maxRevenue) * 100)}%` }}
                        title={`${s.date}: ${formatPrice(s.revenue || 0)}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low stock alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-lg uppercase mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Low Stock
              </h2>
              {lowStock.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">All inventory healthy.</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.slice(0, 6).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-brand-gray shrink-0">
                        <Image src={p.images?.[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.stock} left</p>
                      </div>
                      <Badge color={p.stock <= 2 ? 'red' : 'orange'}>{p.stock}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg uppercase">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-bold text-brand-charcoal hover:text-brand-lime-hover flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-gray/50">
                        <td className="py-3 font-bold">{o.orderNumber}</td>
                        <td className="py-3">{o.customerName}</td>
                        <td className="py-3 font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-3"><Badge color={statusColor[o.orderStatus] || 'gray'}>{o.orderStatus}</Badge></td>
                        <td className="py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
