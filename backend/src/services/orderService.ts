import mongoose from 'mongoose';
import { Order, IOrder, IOrderItem, IOrderTimelineItem } from '../models/Order';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { CouponService } from './couponService';
import { ApiError } from '../utils/apiError';
import { generateOrderNumber, roundPrice } from '../utils/helpers';
import { sendOrderConfirmationEmail } from '../emails';
import { ORDER_STATUS, OrderStatus, PAYMENT_METHODS, PaymentMethod, PAYMENT_STATUS, PaymentStatus } from '../constants';
import { IAddress } from '../types';

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: IAddress;
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export class OrderService {
  static async createOrder(userId: string, input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw ApiError.badRequest('Cannot place an order with no items.');
    }

    // 1. Fetch products from DB to validate stock and snapshot real server-side prices
    const productIds = input.items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map<string, any>();
    for (const p of dbProducts) {
      productMap.set(p._id.toString(), p);
    }

    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw ApiError.notFound(`Product with ID '${item.productId}' not found.`);
      }
      if (!product.isActive) {
        throw ApiError.badRequest(`Product '${product.name}' is currently unavailable for purchase.`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        brand: product.brand,
        price: product.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      });
    }

    subtotal = roundPrice(subtotal);

    // 2. Validate coupon and calculate discount
    let couponDiscount = 0;
    if (input.couponCode) {
      try {
        const val = await CouponService.validateCoupon(input.couponCode, subtotal, userId);
        couponDiscount = val.discount;
      } catch (err: any) {
        throw ApiError.badRequest(err.message || 'Coupon validation failed.');
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = roundPrice(discountedSubtotal * 0.08);
    const total = roundPrice(discountedSubtotal + shipping + tax);

    // 3. Deduct stock safely
    for (const item of input.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        throw ApiError.badRequest('Failed to reserve inventory. Item may have gone out of stock.');
      }
    }

    // 4. Record coupon usage
    if (input.couponCode) {
      await CouponService.recordCouponUsage(input.couponCode, userId);
    }

    // 5. Build timeline
    const isPaid =
      input.paymentMethod !== PAYMENT_METHODS.COD &&
      (!!input.razorpayPaymentId || !!input.razorpayOrderId);

    const initialStatus = ORDER_STATUS.PENDING;
    const initialPaymentStatus =
      input.paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : (isPaid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING);

    const timeline: IOrderTimelineItem[] = [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Placed',
        description:
          input.paymentMethod === PAYMENT_METHODS.COD
            ? 'Cash on Delivery order booked and awaiting verification.'
            : 'Order received and digital payment registered.',
        timestamp: new Date().toISOString(),
        completed: true,
      },
      {
        status: ORDER_STATUS.PROCESSING,
        title: 'Processing & Verification',
        description: 'Item is being inspected and packed at central sports warehouse.',
        timestamp: '',
        completed: false,
      },
      {
        status: ORDER_STATUS.SHIPPED,
        title: 'Dispatched for Delivery',
        description: 'Order handed to logistics carrier partner.',
        timestamp: '',
        completed: false,
      },
      {
        status: ORDER_STATUS.DELIVERED,
        title: 'Delivered',
        description: 'Package delivered safely to recipient address.',
        timestamp: '',
        completed: false,
      },
    ];

    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      user: new mongoose.Types.ObjectId(userId),
      customerName: input.customerName,
      customerEmail: input.customerEmail.toLowerCase(),
      customerPhone: input.customerPhone,
      items: orderItems,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialStatus,
      subtotal,
      discount: couponDiscount,
      couponCode: input.couponCode,
      couponDiscount,
      shipping,
      tax,
      total,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
      timeline,
      trackingNumber: `SZ-LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingCarrier: 'SportZone Express Logistics',
      estimatedDelivery: '3 - 5 Business Days',
    });

    await order.save();

    // 6. Clear user cart
    await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { $set: { items: [] }, $unset: { couponCode: 1 } }
    );

    // 7. Send confirmation email
    sendOrderConfirmationEmail(
      order.customerEmail,
      order.orderNumber,
      order.total,
      order.items.reduce((acc, it) => acc + it.quantity, 0)
    ).catch((err) => console.error('[OrderService] Email notification error:', err));

    return order.toJSON();
  }

  static async getMyOrders(userId: string) {
    const orders = await Order.find({ user: new mongoose.Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
    return orders.map((o) => o.toJSON());
  }

  static async getOrderById(orderIdOrNumber: string, userId?: string, isAdmin = false) {
    let order;
    if (orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderIdOrNumber);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderIdOrNumber });
    }

    if (!order) {
      throw ApiError.notFound(`Order '${orderIdOrNumber}' not found.`);
    }

    if (!isAdmin && userId && order.user.toString() !== userId) {
      throw ApiError.forbidden('You are not authorized to view this order.');
    }

    return order.toJSON();
  }

  static async cancelOrder(orderIdOrNumber: string, userId: string, reason: string) {
    let order;
    if (orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderIdOrNumber);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderIdOrNumber });
    }

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (order.user.toString() !== userId) {
      throw ApiError.forbidden('You can only cancel your own orders.');
    }

    if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.orderStatus as any)) {
      throw ApiError.badRequest(
        `Orders in '${order.orderStatus}' status cannot be cancelled online. Please contact support.`
      );
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancellationReason = reason;

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // Append to timeline
    order.timeline.push({
      status: ORDER_STATUS.CANCELLED,
      title: 'Order Cancelled',
      description: `Cancelled by customer. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      completed: true,
    });

    await order.save();
    return order.toJSON();
  }

  static async adminGetAllOrders(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status && filters.status !== 'all') {
      query.orderStatus = filters.status;
    }
    if (filters.search) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders: orders.map((o) => o.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async adminUpdateOrderStatus(
    orderIdOrNumber: string,
    data: {
      status: OrderStatus;
      trackingNumber?: string;
      trackingCarrier?: string;
      estimatedDelivery?: string;
      description?: string;
    }
  ) {
    let order;
    if (orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderIdOrNumber);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderIdOrNumber });
    }

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    const oldStatus = order.orderStatus;
    const newStatus = data.status;

    order.orderStatus = newStatus;

    if (data.trackingNumber) order.trackingNumber = data.trackingNumber;
    if (data.trackingCarrier) order.trackingCarrier = data.trackingCarrier;
    if (data.estimatedDelivery) order.estimatedDelivery = data.estimatedDelivery;

    if (newStatus === ORDER_STATUS.DELIVERED) {
      if (order.paymentMethod === PAYMENT_METHODS.COD) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
      }
    }

    // If cancelled or returned and wasn't already, restore inventory
    if (
      [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(newStatus as any) &&
      ![ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(oldStatus as any)
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Add or update timeline item
    const existingIdx = order.timeline.findIndex((t) => t.status === newStatus);
    if (existingIdx > -1) {
      order.timeline[existingIdx].completed = true;
      order.timeline[existingIdx].timestamp = new Date().toISOString();
      if (data.description) {
        order.timeline[existingIdx].description = data.description;
      }
    } else {
      order.timeline.push({
        status: newStatus,
        title: `Status: ${newStatus}`,
        description: data.description || `Order status updated to ${newStatus}`,
        timestamp: new Date().toISOString(),
        completed: true,
      });
    }

    await order.save();
    return order.toJSON();
  }
}

