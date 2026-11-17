import apiClient from '@/lib/api';
import { Category } from '@/types';
import { mockStore } from '@/lib/mockStore';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    } catch {
      return mockStore.getCategories();
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<Category>(`/categories/${slug}`);
      return response.data;
    } catch {
      return mockStore.getCategories().find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
    }
  },
};

