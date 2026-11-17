export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory?: string;
  originalPrice: number;
  price: number;
  discount: number; // percentage
  rating: number;
  reviewCount: number;
  stock: number;
  inStock: boolean;
  images: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  itemCount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export type PaymentMethod = 'COD' | 'RAZORPAY_UPI' | 'RAZORPAY_CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export interface OrderTimelineItem {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  brand: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  timeline: OrderTimelineItem[];
  trackingNumber?: string;
  trackingCarrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountPercentage: number;
  discountValue?: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate?: string;
  expiryDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount?: number;
  isActive: boolean;
  description?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'RESOLVED';
  createdAt: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  rating?: number;
  sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

