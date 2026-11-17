import apiClient from '@/lib/api';
import { Product } from '@/types';

export const wishlistService = {
  async getWishlist(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/wishlist');
      return response.data;
    } catch {
      return [];
    }
  },

  async addToWishlist(productId: string): Promise<void> {
    try {
      await apiClient.post('/wishlist', { productId });
    } catch {
      // Offline fallback: handled by Zustand store
    }
  },

  async removeFromWishlist(productId: string): Promise<void> {
    try {
      await apiClient.delete(`/wishlist/${productId}`);
    } catch {
      // Offline fallback: handled by Zustand store
    }
  },
};

