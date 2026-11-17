'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  initialized: false,

  init: async () => {
    if (typeof window === 'undefined') return;
    const user = await authService.getCurrentUser();
    set({ user, initialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await authService.login({ email, password });
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const user = await authService.register(data);
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null });
  },

  refreshUser: async () => {
    const user = await authService.getCurrentUser();
    set({ user });
  },
}));
