'use client';

import { create } from 'zustand';
import { Product } from '@/types';
import { wishlistService } from '@/services/wishlistService';
import { useAuthStore } from './authStore';

const STORAGE_KEY = 'sz_wishlist_ids';

interface WishlistState {
  productIds: string[];
  cache: Record<string, Product>;
  initialized: boolean;
  init: () => Promise<void>;
  toggle: (product: Product) => Promise<void>;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  cache: {},
  initialized: false,

  init: async () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = saved ? JSON.parse(saved) : [];
    set({ productIds: ids, initialized: true });
    if (useAuthStore.getState().user) {
      const products = await wishlistService.getWishlist();
      if (products.length) {
        set({
          productIds: products.map((p) => p.id),
          cache: Object.fromEntries(products.map((p) => [p.id, p])),
        });
      }
    }
  },

  toggle: async (product) => {
    const { productIds, cache } = get();
    const exists = productIds.includes(product.id);
    const nextIds = exists ? productIds.filter((id) => id !== product.id) : [...productIds, product.id];
    const nextCache = { ...cache, [product.id]: product };
    set({ productIds: nextIds, cache: nextCache });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    if (useAuthStore.getState().user) {
      if (exists) await wishlistService.removeFromWishlist(product.id);
      else await wishlistService.addToWishlist(product.id);
    }
  },

  has: (productId) => get().productIds.includes(productId),
  clear: () => {
    set({ productIds: [], cache: {} });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
