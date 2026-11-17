'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User, Package, MapPin, Settings, Heart, LayoutDashboard, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import Spinner from '@/components/Spinner';

const navItems = [
  { href: '/account', label: 'Dashboard', icon: User, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/settings', label: 'Account Settings', icon: Settings },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized, init, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [initialized, user, pathname, router]);

  if (!initialized || !user) {
    return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 bg-brand-charcoal text-center">
              <div className="w-16 h-16 rounded-full bg-brand-lime mx-auto flex items-center justify-center font-display text-2xl font-bold text-brand-charcoal">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <p className="text-white font-bold mt-3 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {user.role === 'admin' && (
                <Link href="/admin" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-brand-lime hover:underline">
                  <LayoutDashboard className="w-3 h-3" /> Admin Dashboard
                </Link>
              )}
            </div>
            <nav className="p-2">
              {navItems.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      active ? 'bg-brand-lime text-brand-charcoal' : 'text-gray-600 hover:bg-brand-gray hover:text-brand-charcoal'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
