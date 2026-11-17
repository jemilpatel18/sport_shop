'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { adminService, AdminCustomer } from '@/services/adminService';
import { formatDate } from '@/lib/utils';
import { PageHeader, Badge } from '@/components/admin/AdminUI';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => adminService.getCustomers({ page, limit: 15, search: search || undefined }),
  });
  const customers = (data?.data ?? []) as AdminCustomer[];
  const pagination = data?.pagination as any;

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage customer accounts" />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email…" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-brand-lime" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100"><EmptyState title="No customers found" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-brand-gray/50">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total Spent</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-gray/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-lime flex items-center justify-center font-bold text-brand-charcoal text-sm">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{c.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p>{c.email}</p>
                      <p className="text-xs text-gray-400">{c.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3">{c.ordersCount ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold">{c.totalSpent != null ? `$${c.totalSpent.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3"><Badge color={c.isActive === false ? 'red' : 'green'}>{c.isActive === false ? 'Inactive' : 'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(c)} className="p-2 text-gray-500 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3 p-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
              <span className="px-4 py-2 text-sm font-semibold">{page} / {pagination.totalPages}</span>
              <button disabled={!pagination.hasNextPage} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="font-display font-bold text-xl uppercase mb-4">Customer Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-bold">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selected.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selected.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="capitalize">{selected.role}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Orders</span><span>{selected.ordersCount ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Spent</span><span className="font-bold">{selected.totalSpent != null ? `$${selected.totalSpent.toFixed(2)}` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span>{formatDate(selected.createdAt)}</span></div>
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-5 py-3 bg-brand-charcoal text-white font-bold text-sm rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
