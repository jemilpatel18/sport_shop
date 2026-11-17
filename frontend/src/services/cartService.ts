import apiClient from '@/lib/api';
import { Cart, CartItem, Coupon } from '@/types';
import { mockStore } from '@/lib/mockStore';

export const cartService = {
  async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get<Cart>('/cart');
      return response.data;
    } catch {
      return {
        items: [],
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      };
    }
  },

  async syncCart(items: CartItem[], couponCode?: string): Promise<Cart> {
    try {
      const response = await apiClient.post<Cart>('/cart/sync', { items, couponCode });
      return response.data;
    } catch {
      // Offline calculation
      return this.calculateCart(items, couponCode);
    }
  },

  async applyCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    try {
      const response = await apiClient.post<{ coupon: Coupon }>('/coupons/apply', { code, subtotal });
      return { valid: true, coupon: response.data.coupon };
    } catch {
      const coupons = mockStore.getCoupons();
      const match = coupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
      );
      if (!match) {
        return { valid: false, error: 'Invalid coupon code or expired promotional code.' };
      }
      if (subtotal < match.minOrderValue) {
        return {
          valid: false,
          error: `Minimum order value of $${match.minOrderValue} required for this coupon.`,
        };
      }
      return { valid: true, coupon: match };
    }
  },

  calculateCart(items: CartItem[], couponCode?: string): Cart {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let couponDiscount = 0;
    if (couponCode) {
      const coupons = mockStore.getCoupons();
      const match = coupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (match && subtotal >= match.minOrderValue) {
        let disc = (subtotal * match.discountPercentage) / 100;
        if (match.maxDiscount && disc > match.maxDiscount) {
          disc = match.maxDiscount;
        }
        couponDiscount = disc;
      }
    }

    // Free shipping on orders over $100
    const shipping = subtotal > 100 || items.length === 0 ? 0 : 9.99;
    const taxableAmount = Math.max(0, subtotal - couponDiscount);
    const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
    const total = Math.max(0, taxableAmount + shipping + tax);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: couponDiscount,
      couponCode,
      couponDiscount: Math.round(couponDiscount * 100) / 100,
      shipping,
      tax,
      total: Math.round(total * 100) / 100,
    };
  },
};

