import apiClient from '@/lib/api';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  async createRazorpayOrder(amount: number): Promise<RazorpayOrder | null> {
    try {
      const res = await apiClient.post('/payments/create-order', { amount });
      const env = res.data as any;
      const data = env?.data ?? env;
      if (data?.id) return { id: data.id, amount: data.amount, currency: data.currency };
      return null;
    } catch {
      return null;
    }
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await apiClient.post('/payments/verify', payload);
    return res.data;
  },
};

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}
