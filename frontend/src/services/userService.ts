import apiClient from '@/lib/api';
import { User, Address } from '@/types';
import { DEFAULT_CUSTOMER } from '@/lib/mockStore';

const unwrap = <T,>(res: any): T => {
  const env = res?.data;
  if (env && typeof env === 'object' && 'data' in env) return env.data as T;
  return env as T;
};

export const userService = {
  async getProfile(): Promise<User | null> {
    try {
      const res = await apiClient.get('/users/profile');
      return unwrap<User>(res);
    } catch {
      return null;
    }
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }): Promise<User | null> {
    try {
      const res = await apiClient.put('/users/profile', data);
      return unwrap<User>(res);
    } catch {
      return null;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.put('/users/change-password', { currentPassword, newPassword });
      return true;
    } catch {
      return false;
    }
  },

  async getAddresses(): Promise<Address[]> {
    try {
      const res = await apiClient.get('/users/addresses');
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.addresses ?? [];
    } catch {
      return DEFAULT_CUSTOMER.addresses;
    }
  },

  async addAddress(address: Omit<Address, 'id'>): Promise<Address | null> {
    try {
      const res = await apiClient.post('/users/addresses', address);
      return unwrap<Address>(res);
    } catch {
      return { ...address, id: `addr-${Date.now()}` } as Address;
    }
  },

  async updateAddress(id: string, address: Partial<Address>): Promise<Address | null> {
    try {
      const res = await apiClient.put(`/users/addresses/${id}`, address);
      return unwrap<Address>(res);
    } catch {
      return null;
    }
  },

  async deleteAddress(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
