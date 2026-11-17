import apiClient from '@/lib/api';
import { Order, Address, PaymentMethod, CartItem } from '@/types';
import { mockStore } from '@/lib/mockStore';
import { generateOrderNumber } from '@/lib/utils';

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders/my-orders');
      return response.data;
    } catch {
      return mockStore.getOrders();
    }
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch {
      const orders = mockStore.getOrders();
      return orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
    }
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    try {
      const response = await apiClient.post<Order>('/orders', payload);
      return response.data;
    } catch {
      // Calculate totals
      const subtotal = payload.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
      const shipping = subtotal > 100 ? 0 : 9.99;
      const discount = payload.couponCode ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
      const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
      const total = Math.max(0, subtotal - discount + shipping + tax);

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: generateOrderNumber(),
        userId: 'user-customer-demo',
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        items: payload.items.map((it) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: it.productId,
          name: it.product.name,
          image: it.product.images[0],
          brand: it.product.brand,
          price: it.price,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        })),
        shippingAddress: payload.shippingAddress,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'PENDING',
        subtotal: Math.round(subtotal * 100) / 100,
        discount,
        shipping,
        tax,
        total: Math.round(total * 100) / 100,
        timeline: [
          {
            status: 'PENDING',
            title: 'Order Placed',
            description: payload.paymentMethod === 'COD' ? 'Cash on Delivery order booked.' : 'Payment received and order verified.',
            timestamp: new Date().toISOString(),
            completed: true,
          },
          {
            status: 'PROCESSING',
            title: 'Processing & Verification',
            description: 'Item being picked from central warehouse.',
            timestamp: new Date().toISOString(),
            completed: false,
          },
          {
            status: 'SHIPPED',
            title: 'Express Dispatch',
            description: 'Order handed to logistics partner.',
            timestamp: '',
            completed: false,
          },
          {
            status: 'DELIVERED',
            title: 'Delivered',
            description: 'Package delivered to recipient.',
            timestamp: '',
            completed: false,
          },
        ],
        trackingNumber: `SZ-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
        trackingCarrier: 'SportZone Express Delivery',
        estimatedDelivery: '3 - 5 Business Days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return mockStore.addOrder(newOrder);
    }
  },

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch {
      const updated = mockStore.updateOrderStatus(orderId, 'CANCELLED');
      if (!updated) throw new Error('Order not found');
      return updated;
    }
  },
};

