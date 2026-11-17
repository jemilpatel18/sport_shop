'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { cartService } from '@/services/cartService';
import { formatPrice } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/stores/uiStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, couponCode, setCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const cart = useMemo(() => cartService.calculateCart(items, couponCode), [items, couponCode]);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    const result = await cartService.applyCoupon(couponInput, cart.subtotal);
    if (result.valid) {
      setCoupon(couponInput.trim().toUpperCase());
      toast.success(`Coupon ${couponInput.toUpperCase()} applied!`);
    } else {
      setCouponError(result.error || 'Invalid coupon');
    }
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState title="Your cart is empty" description="Looks like you haven't added anything yet. Explore our collection!" />
        <div className="text-center mt-6">
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-charcoal text-white font-bold rounded-xl hover:bg-brand-dark transition-colors">
            <ShoppingBag className="w-5 h-5" /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-charcoal uppercase mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <Link href={`/product/${item.product.slug || item.product.id}`} className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-brand-gray shrink-0">
                <Image src={item.product.images?.[0]} alt={item.product.name} fill className="object-cover" sizes="112px" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.product.brand}</p>
                    <Link href={`/product/${item.product.slug || item.product.id}`} className="font-semibold text-sm text-brand-charcoal line-clamp-1 hover:text-brand-lime-hover">
                      {item.product.name}
                    </Link>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 self-start" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.size && `Size: ${item.size}`}
                  {item.color && ` · Color: ${item.color}`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-brand-gray rounded-l-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-brand-gray rounded-r-lg">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-charcoal">{formatPrice(item.price * item.quantity)}</p>
                    {item.product.originalPrice > item.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(item.product.originalPrice * item.quantity)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Link href="/shop" className="text-sm font-bold text-brand-charcoal hover:text-brand-lime-hover flex items-center gap-1">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-sm font-semibold text-red-500 hover:text-red-600">
              Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-display text-xl font-bold text-brand-charcoal uppercase mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4" /> Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  disabled={!!couponCode}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-brand-lime disabled:bg-brand-gray"
                />
                {couponCode ? (
                  <button
                    onClick={() => { setCoupon(undefined); setCouponInput(''); toast.info('Coupon removed'); }}
                    className="px-4 py-2.5 text-sm font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 bg-brand-charcoal text-white text-sm font-bold rounded-xl hover:bg-brand-dark disabled:opacity-50"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
              {couponCode && <p className="text-xs text-green-600 font-semibold mt-1.5">Coupon {couponCode} applied!</p>}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatPrice(cart.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold">{cart.shipping === 0 ? 'FREE' : formatPrice(cart.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="font-semibold">{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-brand-charcoal">Total</span>
                <span className="text-xl font-bold text-brand-charcoal">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full mt-6 py-4 bg-brand-lime text-brand-charcoal font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-lime-hover transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-gray-400 text-center mt-3">Secure checkout · COD & online payments available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
