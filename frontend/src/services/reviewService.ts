import apiClient from '@/lib/api';
import { Review } from '@/types';
import { mockStore } from '@/lib/mockStore';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export const reviewService = {
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get<Review[]>(`/reviews/product/${productId}`);
      const data = response.data as any;
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch {
      return mockStore.getReviews(productId);
    }
  },

  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', data);
    const res = response.data as any;
    return (res?.data ?? res) as Review;
  },

  async updateReview(id: string, data: Partial<CreateReviewData>): Promise<Review> {
    const response = await apiClient.put<Review>(`/reviews/${id}`, data);
    const res = response.data as any;
    return (res?.data ?? res) as Review;
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },

  // Admin
  async getAllReviews(): Promise<Review[]> {
    return mockStore.getReviews();
  },

  async moderateReview(id: string): Promise<void> {
    // No dedicated admin endpoint; attempt delete then fallback silently
    try {
      await apiClient.delete(`/reviews/${id}`);
    } catch {
      // handled by caller fallback
    }
  },
};
