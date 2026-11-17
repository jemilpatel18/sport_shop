import apiClient from '@/lib/api';
import { apiClient as client } from '@/lib/api';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  [key: string]: any;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive?: boolean;
  ordersCount?: number;
  totalSpent?: number;
  createdAt: string;
}

export type ContactMessageAdmin = import('@/types').ContactMessage;

const unwrap = <T,>(res: any): T => (res?.data && typeof res.data === 'object' && 'success' in res ? res.data.data ?? res.data : res);

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const res = await apiClient.get('/admin/dashboard/stats');
      return unwrap<DashboardStats>(res.data);
    } catch {
      return null;
    }
  },

  async getSalesReport(period = '30d'): Promise<SalesPoint[]> {
    try {
      const res = await apiClient.get('/admin/dashboard/sales', { params: { period } });
      const data = unwrap<any>(res.data);
      return Array.isArray(data) ? data : data?.sales ?? data?.data ?? [];
    } catch {
      return [];
    }
  },

  async getCustomers(params: { page?: number; limit?: number; search?: string } = {}) {
    try {
      const res = await apiClient.get('/admin/customers', { params });
      const data = unwrap<any>(res.data);
      return {
        data: data?.customers ?? data?.data ?? [],
        pagination: res.data?.pagination ?? data?.pagination,
      };
    } catch {
      return { data: [] as AdminCustomer[], pagination: undefined };
    }
  },

  async getCustomerById(id: string): Promise<AdminCustomer | null> {
    try {
      const res = await apiClient.get(`/admin/customers/${id}`);
      return unwrap<AdminCustomer>(res.data);
    } catch {
      return null;
    }
  },

  async getAllOrders(params: Record<string, any> = {}) {
    try {
      const res = await apiClient.get('/admin/orders', { params });
      const env = res.data as any;
      return {
        data: env?.data ?? env?.orders ?? [],
        pagination: env?.pagination,
      };
    } catch {
      return { data: [] as import('@/types').Order[], pagination: undefined };
    }
  },

  async updateOrderStatus(orderId: string, payload: {
    status: string;
    trackingNumber?: string;
    trackingCarrier?: string;
    estimatedDelivery?: string;
    description?: string;
  }) {
    const res = await apiClient.put(`/admin/orders/${orderId}/status`, payload);
    return unwrap<any>(res.data);
  },

  async getInventoryAlerts(threshold = 5) {
    try {
      const res = await apiClient.get('/admin/inventory', { params: { threshold } });
      const data = unwrap<any>(res.data);
      return Array.isArray(data) ? data : data?.products ?? data?.data ?? [];
    } catch {
      return [] as import('@/types').Product[];
    }
  },

  async getContactMessages(status?: string) {
    try {
      const res = await apiClient.get('/admin/messages', { params: status ? { status } : {} });
      const data = unwrap<any>(res.data);
      return Array.isArray(data) ? data : data?.messages ?? data?.data ?? [];
    } catch {
      return [] as ContactMessageAdmin[];
    }
  },

  // Coupons
  async getCoupons() {
    try {
      const res = await apiClient.get('/admin/coupons');
      const data = unwrap<any>(res.data);
      return Array.isArray(data) ? data : data?.coupons ?? data?.data ?? [];
    } catch {
      return [] as import('@/types').Coupon[];
    }
  },

  async createCoupon(payload: Record<string, any>) {
    const res = await apiClient.post('/admin/coupons', payload);
    return unwrap<any>(res.data);
  },

  async updateCoupon(id: string, payload: Record<string, any>) {
    const res = await apiClient.put(`/admin/coupons/${id}`, payload);
    return unwrap<any>(res.data);
  },

  async deleteCoupon(id: string) {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  // Products (admin CRUD on product routes)
  async createProduct(payload: Record<string, any>) {
    const res = await apiClient.post('/products', payload);
    return unwrap<any>(res.data);
  },

  async updateProduct(id: string, payload: Record<string, any>) {
    const res = await apiClient.put(`/products/${id}`, payload);
    return unwrap<any>(res.data);
  },

  async deleteProduct(id: string) {
    await apiClient.delete(`/products/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('image', file);
    const res = await apiClient.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = unwrap<any>(res.data);
    return data?.url ?? data?.secure_url ?? data?.path ?? '';
  },
};

export const adminCategoryBrandService = {
  async createCategory(payload: Record<string, any>) {
    const res = await apiClient.post('/categories', payload);
    return unwrap<any>(res.data);
  },
  async updateCategory(id: string, payload: Record<string, any>) {
    const res = await apiClient.put(`/categories/${id}`, payload);
    return unwrap<any>(res.data);
  },
  async deleteCategory(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
  async createBrand(payload: Record<string, any>) {
    const res = await apiClient.post('/brands', payload);
    return unwrap<any>(res.data);
  },
  async updateBrand(id: string, payload: Record<string, any>) {
    const res = await apiClient.put(`/brands/${id}`, payload);
    return unwrap<any>(res.data);
  },
  async deleteBrand(id: string) {
    await apiClient.delete(`/brands/${id}`);
  },
};
