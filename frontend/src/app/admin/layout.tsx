'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, FolderTree, Award, ShoppingCart, Users,
  Ticket, Star, Mail, LogOut, Menu, X, ExternalLink, LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import Spinner from '@/components/Spinner';

interface NavItem { href: string; label: string; icon: LucideIcon; exact?: boolean }
const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: FolderTree },
      { href: '/admin/brands', label: 'Brands', icon: Award },
    ],
  },
  {
    title: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
      { href: '/admin/messages', label: 'Messages', icon: Mail },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized, init, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login?redirect=/admin');
    } else if (initialized && user && user.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/account');
    }
  }, [initialized, user, router]);

  if (!initialized || !user || user.role !== 'admin') {
    return <div className="flex justify-center py-32"><Spinner className="w-10 h-10" /></div>;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 bg-brand-lime rounded-lg flex items-center justify-center font-display font-bold text-brand-charcoal">SZ</span>
          <div>
            <p className="font-display font-bold text-white leading-none">SPORTZONE</p>
            <p className="text-[10px] text-brand-lime font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`admin-nav-link ${active ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" className="admin-nav-link">
          <ExternalLink className="w-4 h-4" /> View Storefront
        </Link>
        <button onClick={handleLogout} className="admin-nav-link w-full text-red-400 hover:!bg-red-500/10">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-gray -mt-0">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-brand-charcoal z-40">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-charcoal">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-brand-charcoal">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Welcome back,</p>
            <p className="font-bold text-brand-charcoal text-sm">{user.name}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-lime flex items-center justify-center font-bold text-brand-charcoal text-sm">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
