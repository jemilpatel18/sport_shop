'use client';

import { create } from 'zustand';
import { CartItem, Product } from '@/types';
import { cartService } from '@/services/cartService';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  isLoading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  addItem: (product: Product, size?: string, color?: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCoupon: (code?: string) => void;
  itemCount: () => number;
}

function makeItemId(productId: string, size?: string, color?: string) {
  return `${productId}__${size || ''}__${color || ''}`;
}

export const useCartStore = create<CartState>((set, get) => {
  const sync = (items: CartItem[], couponCode?: string) => {
    if (useAuthStore.getState().user) {
      cartService.syncCart(items, couponCode).catch(() => undefined);
    }
  };

  return {
    items: [],
    couponCode: undefined,
    isLoading: false,
    initialized: false,

    init: async () => {
      if (typeof window === 'undefined') return;
      const saved = localStorage.getItem('sz_cart_items');
      const savedCoupon = localStorage.getItem('sz_cart_coupon');
      const items: CartItem[] = saved ? JSON.parse(saved) : [];
      set({ items, couponCode: savedCoupon || undefined, initialized: true });
      if (useAuthStore.getState().user) {
        const cart = await cartService.getCart();
        if (cart.items?.length) {
          set({ items: cart.items, couponCode: cart.couponCode });
        }
      }
    },

    addItem: (product, size, color, quantity = 1) => {
      const id = makeItemId(product.id, size, color);
      let items = [...get().items];
      const existing = items.find((i) => i.id === id);
      if (existing) {
        items = items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i));
      } else {
        items.push({
          id,
          productId: product.id,
          product,
          size,
          color,
          quantity,
          price: product.price,
        });
      }
      set({ items });
      localStorage.setItem('sz_cart_items', JSON.stringify(items));
      sync(items, get().couponCode);
    },

    updateQuantity: (itemId, quantity) => {
      let items = [...get().items];
      if (quantity <= 0) {
        items = items.filter((i) => i.id !== itemId);
      } else {
        items = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      }
      set({ items });
      localStorage.setItem('sz_cart_items', JSON.stringify(items));
      sync(items, get().couponCode);
    },

    removeItem: (itemId) => {
      const items = get().items.filter((i) => i.id !== itemId);
      set({ items });
      localStorage.setItem('sz_cart_items', JSON.stringify(items));
      sync(items, get().couponCode);
    },

    clearCart: () => {
      set({ items: [], couponCode: undefined });
      localStorage.removeItem('sz_cart_items');
      localStorage.removeItem('sz_cart_coupon');
    },

    setCoupon: (code) => {
      set({ couponCode: code });
      if (code) localStorage.setItem('sz_cart_coupon', code);
      else localStorage.removeItem('sz_cart_coupon');
      sync(get().items, code);
    },

    itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
  };
});
