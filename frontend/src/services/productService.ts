import apiClient from '@/lib/api';
import { Product, ProductFilterParams, PaginatedResponse } from '@/types';
import { mockStore } from '@/lib/mockStore';

export const productService = {
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
      return response.data;
    } catch {
      // Offline / fallback filtering logic
      let products = [...mockStore.getProducts()];

      if (params.search) {
        const query = params.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.tags?.some((t) => t.toLowerCase().includes(query))
        );
      }

      if (params.category && params.category !== 'all') {
        products = products.filter(
          (p) => p.category.toLowerCase() === params.category?.toLowerCase()
        );
      }

      if (params.brand && params.brand !== 'all') {
        products = products.filter(
          (p) => p.brand.toLowerCase() === params.brand?.toLowerCase()
        );
      }

      if (params.minPrice !== undefined) {
        products = products.filter((p) => p.price >= (params.minPrice ?? 0));
      }

      if (params.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= (params.maxPrice ?? 99999));
      }

      if (params.rating) {
        products = products.filter((p) => p.rating >= (params.rating ?? 0));
      }

      if (params.sizes && params.sizes.length > 0) {
        products = products.filter((p) =>
          p.sizes?.some((s) => params.sizes?.includes(s))
        );
      }

      // Sorting
      if (params.sort) {
        switch (params.sort) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            products.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
          default:
            products.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            break;
        }
      }

      const page = params.page || 1;
      const limit = params.limit || 12;
      const total = products.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = products.slice(startIndex, startIndex + limit);

      return {
        data: paginatedData,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch {
      const products = mockStore.getProducts();
      return products.find((p) => p.id === id || p.slug === id) || null;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/slug/${slug}`);
      return response.data;
    } catch {
      const products = mockStore.getProducts();
      return products.find((p) => p.slug === slug || p.id === slug) || null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/featured');
      return response.data;
    } catch {
      return mockStore.getProducts().filter((p) => p.isFeatured || p.isBestSeller).slice(0, 8);
    }
  },

  async getBestSellers(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/bestsellers');
      return response.data;
    } catch {
      return mockStore.getProducts().filter((p) => p.isBestSeller).slice(0, 8);
    }
  },

  async getNewArrivals(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/new-arrivals');
      return response.data;
    } catch {
      return mockStore.getProducts().filter((p) => p.isNewArrival).slice(0, 8);
    }
  },

  async getRelatedProducts(productId: string, category: string): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(`/products/${productId}/related`);
      return response.data;
    } catch {
      return mockStore
        .getProducts()
        .filter((p) => p.id !== productId && p.category.toLowerCase() === category.toLowerCase())
        .slice(0, 4);
    }
  },
};

