'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

export default function StoreInitializer() {
  useEffect(() => {
    useAuthStore.getState().init();
    useCartStore.getState().init();
    useWishlistStore.getState().init();

    const onExpired = () => {
      useAuthStore.setState({ user: null });
    };
    window.addEventListener('auth:session_expired', onExpired);
    return () => window.removeEventListener('auth:session_expired', onExpired);
  }, []);

  // Re-sync wishlist/cart when auth state changes
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    if (user) {
      useWishlistStore.getState().init();
      useCartStore.getState().init();
    }
  }, [user]);

  return null;
}
