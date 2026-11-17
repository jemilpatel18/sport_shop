import mongoose, { Schema, Document } from 'mongoose';
import { ORDER_STATUS, OrderStatus, PAYMENT_METHODS, PaymentMethod, PAYMENT_STATUS, PaymentStatus } from '../constants';
import { IAddress } from '../types';

export interface IOrderItem {
  id?: string;
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  brand: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IOrderTimelineItem {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  timeline: IOrderTimelineItem[];
  trackingNumber?: string;
  trackingCarrier?: string;
  estimatedDelivery?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
  },
  {
    _id: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.productId = ret.product ? ret.product.toString() : undefined;
        delete ret._id;
        return ret;
      },
    },
  }
);

const TimelineSchema = new Schema<IOrderTimelineItem>(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      isDefault: { type: Boolean, default: false },
      type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
      default: PAYMENT_METHODS.COD,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      required: true,
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    timeline: [TimelineSchema],
    trackingNumber: { type: String },
    trackingCarrier: { type: String, default: 'SportZone Express Logistics' },
    estimatedDelivery: { type: String, default: '3 - 5 Business Days' },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.user ? ret.user.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;

