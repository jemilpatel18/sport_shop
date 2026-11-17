import { z } from 'zod';
import { PAYMENT_METHODS, ORDER_STATUS } from '../constants';

// Authentication Validators
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rolePreference: z.enum(['customer', 'admin']).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

// Address Validator
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  street: z.string().min(3, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
  type: z.enum(['home', 'work', 'other']).default('home'),
});

// Product Validators
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  originalPrice: z.number().positive('Original price must be positive'),
  price: z.number().positive('Selling price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sizes: z.array(z.string()).default([]),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex: z.string(),
      })
    )
    .default([]),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
  specifications: z.record(z.string()).default({}),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

// Product Query Filters
export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sizes: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  colors: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
  inStock: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true')
    .optional(),
  sort: z.enum(['popular', 'newest', 'price-asc', 'price-desc', 'rating']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

// Category & Brand Validators
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  logo: z.string().optional().default(''),
  description: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Cart Validators
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      size: z.string().optional(),
      color: z.string().optional(),
      price: z.number().optional(),
      product: z.any().optional(),
    })
  ),
  couponCode: z.string().optional(),
});

// Order Validators
export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Customer email is required'),
  customerPhone: z.string().min(6, 'Customer phone number is required'),
  shippingAddress: addressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        size: z.string().optional(),
        color: z.string().optional(),
        price: z.number().optional(), // Snapshot verified on backend
        product: z.any().optional(),
      })
    )
    .min(1, 'Order must contain at least one product item'),
  paymentMethod: z.enum([
    PAYMENT_METHODS.COD,
    PAYMENT_METHODS.RAZORPAY_UPI,
    PAYMENT_METHODS.RAZORPAY_CARD,
  ]),
  couponCode: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.RETURN_REQUESTED,
    ORDER_STATUS.RETURNED,
  ]),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  description: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

// Coupon Validators
export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0, 'Subtotal is required'),
});

export const createCouponSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountPercentage: z.number().min(1).max(100),
  discountValue: z.number().optional(),
  maxDiscount: z.number().optional(),
  minOrderValue: z.number().min(0).default(0),
  startDate: z.string().or(z.date()).optional(),
  expiryDate: z.string().or(z.date()),
  usageLimit: z.number().optional(),
  perUserLimit: z.number().default(1),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// Review Validators
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1).max(5),
  title: z.string().optional().default(''),
  comment: z.string().min(3, 'Review comment must be at least 3 characters'),
});

// Payment Verification Validators
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  orderNumber: z.string().optional(),
});

// Contact & Newsletter Validators
export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
});

