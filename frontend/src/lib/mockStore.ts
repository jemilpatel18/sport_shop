import { Product, Category, Brand, Review, Coupon, Order, User, ContactMessage } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_REVIEWS, INITIAL_COUPONS, INITIAL_ORDERS } from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'sz_mock_products_v2',
  CATEGORIES: 'sz_mock_categories_v2',
  BRANDS: 'sz_mock_brands_v2',
  REVIEWS: 'sz_mock_reviews_v2',
  COUPONS: 'sz_mock_coupons_v2',
  ORDERS: 'sz_mock_orders_v2',
  MESSAGES: 'sz_mock_messages_v2',
  USER: 'sz_mock_user_v2',
};

export const DEFAULT_CUSTOMER: User = {
  id: 'user-customer-demo',
  name: 'Alex Mercer',
  email: 'alex.athlete@sportzone.com',
  phone: '+1 (555) 349-8812',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  addresses: [
    {
      id: 'addr-01',
      fullName: 'Alex Mercer',
      phone: '+1 (555) 349-8812',
      street: '742 Evergreen Olympic Blvd',
      apartment: 'Apt 4B',
      city: 'Portland',
      state: 'Oregon',
      postalCode: '97201',
      country: 'United States',
      isDefault: true,
      type: 'home',
    },
    {
      id: 'addr-02',
      fullName: 'Alex Mercer',
      phone: '+1 (555) 349-8812',
      street: '1200 Athlete Way',
      apartment: 'Suite 200',
      city: 'Portland',
      state: 'Oregon',
      postalCode: '97205',
      country: 'United States',
      isDefault: false,
      type: 'work',
    },
  ],
  createdAt: '2026-01-01T08:00:00Z',
};

export const DEFAULT_ADMIN: User = {
  id: 'user-admin-demo',
  name: 'SportZone Admin',
  email: 'admin@sportzone.com',
  phone: '+1 (555) 000-7777',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  addresses: [],
  createdAt: '2026-01-01T00:00:00Z',
};

class MockStorage {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getProducts(): Product[] {
    if (!this.isBrowser()) return INITIAL_PRODUCTS;
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  saveProducts(products: Product[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  getCategories(): Category[] {
    if (!this.isBrowser()) return INITIAL_CATEGORIES;
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  saveCategories(categories: Category[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  getBrands(): Brand[] {
    if (!this.isBrowser()) return INITIAL_BRANDS;
    const stored = localStorage.getItem(STORAGE_KEYS.BRANDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
      return INITIAL_BRANDS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BRANDS;
    }
  }

  saveBrands(brands: Brand[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }

  getReviews(productId?: string): Review[] {
    if (!this.isBrowser()) return INITIAL_REVIEWS;
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    let reviews: Review[] = INITIAL_REVIEWS;
    if (stored) {
      try {
        reviews = JSON.parse(stored);
      } catch {
        reviews = INITIAL_REVIEWS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    return productId ? reviews.filter((r) => r.productId === productId) : reviews;
  }

  saveReviews(reviews: Review[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }

  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const all = this.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReview, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    }
    return newReview;
  }

  getCoupons(): Coupon[] {
    if (!this.isBrowser()) return INITIAL_COUPONS;
    const stored = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_COUPONS;
    }
  }

  saveCoupons(coupons: Coupon[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }

  getOrders(userId?: string): Order[] {
    if (!this.isBrowser()) return INITIAL_ORDERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    let orders: Order[] = INITIAL_ORDERS;
    if (stored) {
      try {
        orders = JSON.parse(stored);
      } catch {
        orders = INITIAL_ORDERS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    return userId ? orders.filter((o) => o.userId === userId) : orders;
  }

  addOrder(order: Order): Order {
    const all = this.getOrders();
    const updated = [order, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    }
    return order;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Order | null {
    const all = this.getOrders();
    const index = all.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    
    const existing = all[index];
    const updatedOrder: Order = {
      ...existing,
      orderStatus: status,
      paymentStatus: paymentStatus || existing.paymentStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...existing.timeline,
        {
          status,
          title: `Status: ${status}`,
          description: `Order updated to ${status} by administrator.`,
          timestamp: new Date().toISOString(),
          completed: true,
        },
      ],
    };
    all[index] = updatedOrder;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
    }
    return updatedOrder;
  }

  getMessages(): ContactMessage[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!stored) {
      const initial: ContactMessage[] = [
        {
          id: 'msg-01',
          name: 'Coach Marcus Vance',
          email: 'marcus@academyfc.org',
          phone: '+1 (555) 882-9901',
          subject: 'Bulk Equipment Inquiry for Youth Soccer Club',
          message: 'Looking to order 40 Adidas match balls and 80 pairs of shin guards for our upcoming season. Do you provide club discounts?',
          status: 'UNREAD',
          createdAt: '2026-03-02T11:20:00Z',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  addMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
    const all = this.getMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'UNREAD',
      createdAt: new Date().toISOString(),
    };
    const updated = [newMsg, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    }
    return newMsg;
  }
}

export const mockStore = new MockStorage();

