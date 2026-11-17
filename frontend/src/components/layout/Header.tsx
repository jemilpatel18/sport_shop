'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Search, User, Heart, ShoppingCart, Menu, X, ChevronDown, LogOut, Package, Settings, LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useUIStore } from '@/stores/uiStore';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';
import { Category, Brand } from '@/types';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const toast = useUIStore((s) => s.addToast);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const accountRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
    brandService.getBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast('success', 'Logged out successfully');
    setAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2 text-brand-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 bg-brand-lime rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-brand-charcoal text-lg leading-none">SZ</span>
            </span>
            <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-brand-charcoal">
              SPORT<span className="text-brand-charcoal">ZONE</span>
              <span className="hidden sm:inline text-[10px] font-sans font-semibold text-gray-400 block -mt-1 tracking-widest uppercase">
                Everything for Every Athlete
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg transition-colors"
              >
                {l.label}
              </Link>
            ))}
            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg transition-colors flex items-center gap-1"
              >
                Categories <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-96 overflow-y-auto">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-gray hover:text-brand-charcoal"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {categories.length === 0 && <p className="px-4 py-2 text-sm text-gray-400">Loading…</p>}
                </div>
              )}
            </div>
            {/* Brands */}
            <Link
              href="/shop?sort=popular"
              className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-brand-charcoal hover:bg-brand-gray rounded-lg transition-colors"
            >
              Brands
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <form onSubmit={submitSearch} className="hidden md:flex items-center">
              <div className="relative">
                {searchOpen ? (
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                    placeholder="Search products…"
                    className="w-56 lg:w-64 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/30"
                  />
                ) : (
                  <button type="button" onClick={() => setSearchOpen(true)} className="p-2 text-gray-600 hover:text-brand-charcoal" aria-label="Search">
                    <Search className="w-5 h-5" />
                  </button>
                )}
                {searchOpen && (
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-charcoal">
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Account */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="p-2 text-gray-600 hover:text-brand-charcoal flex items-center gap-1"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
                <span className="hidden xl:inline text-sm font-semibold">{user ? user.name.split(' ')[0] : 'Account'}</span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-brand-charcoal">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-gray">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                      <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-gray">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-gray">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-gray">
                        Sign In
                      </Link>
                      <Link href="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-gray">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-brand-charcoal" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-brand-charcoal" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-lime text-brand-charcoal text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-brand-charcoal/20">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
          <form onSubmit={submitSearch} className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-brand-lime"
              />
            </div>
          </form>
          <nav className="p-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-brand-gray rounded-lg"
              >
                {l.label}
              </Link>
            ))}
            <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Categories</p>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-gray rounded-lg"
              >
                {c.name}
              </Link>
            ))}
            <p className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Brands</p>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/shop?brand=${encodeURIComponent(b.name)}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-gray rounded-lg"
              >
                {b.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
