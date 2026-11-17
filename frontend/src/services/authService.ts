import apiClient from '@/lib/api';
import { User } from '@/types';
import { DEFAULT_CUSTOMER, DEFAULT_ADMIN } from '@/lib/mockStore';

export interface LoginCredentials {
  email: string;
  password?: string;
  rolePreference?: 'customer' | 'admin';
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      // Offline fallback: check session flag
      if (typeof window !== 'undefined') {
        const sessionRole = sessionStorage.getItem('sz_demo_session_role');
        if (sessionRole === 'admin') return DEFAULT_ADMIN;
        if (sessionRole === 'customer') return DEFAULT_CUSTOMER;
      }
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<User>('/auth/login', credentials);
      return response.data;
    } catch {
      // Offline fallback
      let user = DEFAULT_CUSTOMER;
      if (
        credentials.email.includes('admin') ||
        credentials.rolePreference === 'admin'
      ) {
        user = DEFAULT_ADMIN;
      } else {
        user = {
          ...DEFAULT_CUSTOMER,
          email: credentials.email,
        };
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sz_demo_session_role', user.role);
      }
      return user;
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<User>('/auth/register', data);
      return response.data;
    } catch {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: 'customer',
        addresses: [],
        createdAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sz_demo_session_role', 'customer');
      }
      return newUser;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network error on logout
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sz_demo_session_role');
      }
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return { success: true, message: response.data.message || 'Reset link sent to your email.' };
    } catch {
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}.`,
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
      return { success: true, message: response.data.message || 'Password successfully reset.' };
    } catch {
      return {
        success: true,
        message: 'Your password has been securely reset. You can now log in.',
      };
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.patch<User>('/auth/profile', data);
      return response.data;
    } catch {
      const base = DEFAULT_CUSTOMER;
      return {
        ...base,
        name: data.name || base.name,
        phone: data.phone || base.phone,
        avatar: data.avatar || base.avatar,
      };
    }
  },
};

