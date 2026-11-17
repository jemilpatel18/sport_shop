'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/stores/uiStore';

const shopLinks = [
  { href: '/shop', label: 'Shop All' },
  { href: '/category/cricket', label: 'Cricket' },
  { href: '/category/chess', label: 'Chess' },
  { href: '/category/volleyball', label: 'Volleyball' },
  { href: '/category/football', label: 'Football' },
  { href: '/category/badminton', label: 'Badminton' },
  { href: '/category/basketball', label: 'Basketball' },
  { href: '/category/fitness', label: 'Gym & Fitness' },
];

const supportLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/account/orders', label: 'Track Order' },
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping-returns', label: 'Shipping & Returns' },
];

const accountLinks = [
  { href: '/account', label: 'My Account' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await apiClient.post('/newsletter/subscribe', { email });
      toast.success('Subscribed to SPORTZONE newsletter!');
      setEmail('');
    } catch {
      toast.info('Thanks for subscribing!');
      setEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-brand-charcoal text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white uppercase">Join the Zone</h3>
            <p className="text-sm text-gray-400 mt-1">Get exclusive offers, early access to drops and training tips.</p>
          </div>
          <form onSubmit={subscribe} className="flex w-full lg:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 lg:w-80 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-lime text-sm"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-5 py-3 bg-brand-lime text-brand-charcoal font-bold text-sm rounded-xl hover:bg-brand-lime-hover transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" /> SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 bg-brand-lime rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-brand-charcoal text-lg">SZ</span>
            </span>
            <span className="font-display text-xl font-bold text-white">SPORTZONE</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium sports equipment, footwear, apparel and accessories for every athlete. Everything for every athlete.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-lime hover:text-brand-charcoal transition-colors"
                aria-label="Social link"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-gray-400 hover:text-brand-lime transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2.5">
            {supportLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-gray-400 hover:text-brand-lime transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-lime shrink-0" />
              100 Arena Street, Sports District, NY 10001
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-lime shrink-0" />
              +1 (555) 123-4567
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-brand-lime shrink-0" />
              support@sportzone.com
            </li>
          </ul>
          <div className="mt-5">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">My Account</h4>
            <ul className="space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-brand-lime transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SPORTZONE. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand-lime">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-lime">Terms of Service</Link>
            <Link href="/contact" className="hover:text-brand-lime">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
