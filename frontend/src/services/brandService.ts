import apiClient from '@/lib/api';
import { Brand } from '@/types';
import { mockStore } from '@/lib/mockStore';

export const brandService = {
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await apiClient.get<Brand[]>('/brands');
      return response.data;
    } catch {
      return mockStore.getBrands();
    }
  },

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    try {
      const response = await apiClient.get<Brand>(`/brands/${slug}`);
      return response.data;
    } catch {
      return mockStore.getBrands().find((b) => b.slug.toLowerCase() === slug.toLowerCase()) || null;
    }
  },
};

