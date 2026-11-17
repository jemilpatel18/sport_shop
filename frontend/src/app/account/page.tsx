'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Package, Heart, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Order } from '@/types';
import Spinner from '@/components/Spinner';
import { toast } from '@/stores/uiStore';
import { useWishlistStore } from '@/stores/wishlistStore';

import { orderStatusColors } from '@/lib/orderStatus';

export default function AccountDashboardPage() {
  const { user, refreshUser } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
  });
  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: () => userService.getAddresses() });

  useEffect(() => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    const updated = await userService.updateProfile(profileForm);
    if (updated) {
      await refreshUser();
      toast.success('Profile updated');
    } else {
      toast.info('Profile saved (offline mode)');
    }
    setEditingProfile(false);
    setSaving(false);
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-brand-charcoal rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-brand-lime/10 rounded-full" />
        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
          Hey, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here's what's happening with your account.</p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Orders', value: orders.length, icon: Package, href: '/account/orders' },
            { label: 'Wishlist', value: wishlistCount, icon: Heart, href: '/wishlist' },
            { label: 'Addresses', value: addresses.length, icon: MapPin, href: '/account/addresses' },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors">
              <s.icon className="w-5 h-5 text-brand-lime mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg uppercase">Profile</h2>
            <button onClick={() => setEditingProfile(!editingProfile)} className="text-xs font-bold text-brand-charcoal hover:text-brand-lime-hover">
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-brand-lime flex items-center justify-center font-display text-xl font-bold text-brand-charcoal">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role} account</p>
            </div>
          </div>
          {editingProfile ? (
            <div className="space-y-3">
              <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Phone" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <button onClick={saveProfile} disabled={saving} className="w-full py-2.5 bg-brand-charcoal text-white text-sm font-bold rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{user?.phone || 'No phone added'}</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg uppercase">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-bold text-brand-charcoal hover:text-brand-lime-hover flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet.</p>
              <Link href="/shop" className="text-sm font-bold text-brand-charcoal hover:text-brand-lime-hover mt-2 inline-block">Start Shopping →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/account/orders/${o.id || o.orderNumber}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-gray transition-colors">
                  <div className="flex -space-x-2">
                    {o.items.slice(0, 3).map((it, i) => (
                      <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-brand-gray">
                        <Image src={it.image} alt={it.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatPrice(o.total)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orderStatusColors[o.orderStatus] || 'bg-gray-100'}`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
