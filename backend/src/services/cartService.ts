import mongoose from 'mongoose';
import { Cart, ICart } from '../models/Cart';
import { Product, IProduct } from '../models/Product';
import { CouponService } from './couponService';
import { ApiError } from '../utils/apiError';
import { roundPrice } from '../utils/helpers';

export class CartService {
  private static async getOrCreateCart(userId?: string, guestId?: string): Promise<ICart> {
    let cart: ICart | null = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      cart = new Cart({
        user: userId && mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
        guestId: !userId ? guestId : undefined,
        items: [],
      });
      await cart.save();
    }

    return cart;
  }

  static async calculateCart(cart: ICart, userId?: string) {
    await cart.populate({
      path: 'items.product',
      model: 'Product',
    });

    const formattedItems: any[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product as unknown as IProduct;
      if (!product || !product.isActive) {
        continue; // Skip deactivated or deleted products
      }

      const price = product.price;
      const quantity = Math.min(item.quantity, Math.max(1, product.stock));
      const itemSubtotal = price * quantity;
      subtotal += itemSubtotal;

      formattedItems.push({
        id: (item as any)._id?.toString() || item.id,
        productId: product._id.toString(),
        product: product.toJSON ? product.toJSON() : product,
        size: item.size || '',
        color: item.color || '',
        quantity,
        price,
        inStock: product.stock >= quantity,
        maxStock: product.stock,
      });
    }

    subtotal = roundPrice(subtotal);

    let couponDiscount = 0;
    let couponDetails = null;

    if (cart.couponCode) {
      try {
        const val = await CouponService.validateCoupon(cart.couponCode, subtotal, userId);
        couponDiscount = val.discount;
        couponDetails = val.coupon;
      } catch {
        // Coupon no longer valid: reset it
        cart.couponCode = undefined;
        await Cart.findByIdAndUpdate(cart._id, { $unset: { couponCode: 1 } });
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    // Free shipping on orders over $100 or when cart is empty
    const shipping = subtotal > 100 || formattedItems.length === 0 ? 0 : 9.99;
    const tax = roundPrice(discountedSubtotal * 0.08); // 8% standard tax
    const total = roundPrice(discountedSubtotal + shipping + tax);

    return {
      id: cart._id.toString(),
      items: formattedItems,
      subtotal,
      discount: couponDiscount,
      couponCode: cart.couponCode,
      couponDiscount,
      coupon: couponDetails,
      shipping,
      tax,
      total,
      itemCount: formattedItems.reduce((acc, it) => acc + it.quantity, 0),
    };
  }

  static async getCart(userId?: string, guestId?: string) {
    const cart = await this.getOrCreateCart(userId, guestId);
    return this.calculateCart(cart, userId);
  }

  static async addToCart(
    userId?: string,
    guestId?: string,
    itemData?: { productId: string; size?: string; color?: string; quantity: number }
  ) {
    if (!itemData || !itemData.productId) {
      throw ApiError.badRequest('Product ID is required.');
    }

    const product = await Product.findById(itemData.productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or currently unavailable.');
    }

    if (product.stock < 1) {
      throw ApiError.badRequest(`'${product.name}' is currently out of stock.`);
    }

    const cart = await this.getOrCreateCart(userId, guestId);

    const existingIndex = cart.items.findIndex(
      (it) =>
        it.product.toString() === itemData.productId &&
        (it.size || '') === (itemData.size || '') &&
        (it.color || '') === (itemData.color || '')
    );

    const addQty = itemData.quantity || 1;

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + addQty;
      if (newQty > product.stock) {
        throw ApiError.badRequest(
          `Cannot add more than ${product.stock} items of this product (available stock).`
        );
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      if (addQty > product.stock) {
        throw ApiError.badRequest(
          `Requested quantity (${addQty}) exceeds available stock (${product.stock}).`
        );
      }
      cart.items.push({
        product: product._id as any,
        size: itemData.size || '',
        color: itemData.color || '',
        quantity: addQty,
      });
    }

    await cart.save();
    return this.calculateCart(cart, userId);
  }

  static async updateCartItem(
    itemId: string,
    userId?: string,
    guestId?: string,
    updateData?: { quantity?: number; size?: string; color?: string }
  ) {
    const cart = await this.getOrCreateCart(userId, guestId);
    const item = cart.items.find((it: any) => it._id.toString() === itemId);

    if (!item) {
      throw ApiError.notFound('Item not found in your cart.');
    }

    if (updateData?.quantity !== undefined) {
      if (updateData.quantity <= 0) {
        cart.items = cart.items.filter((it: any) => it._id.toString() !== itemId) as any;
      } else {
        const product = await Product.findById(item.product);
        if (product && updateData.quantity > product.stock) {
          throw ApiError.badRequest(`Requested quantity exceeds available stock (${product.stock}).`);
        }
        item.quantity = updateData.quantity;
      }
    }

    if (updateData?.size !== undefined) item.size = updateData.size;
    if (updateData?.color !== undefined) item.color = updateData.color;

    await cart.save();
    return this.calculateCart(cart, userId);
  }

  static async removeCartItem(itemId: string, userId?: string, guestId?: string) {
    const cart = await this.getOrCreateCart(userId, guestId);
    cart.items = cart.items.filter((it: any) => it._id.toString() !== itemId) as any;
    await cart.save();
    return this.calculateCart(cart, userId);
  }

  static async clearCart(userId?: string, guestId?: string) {
    const cart = await this.getOrCreateCart(userId, guestId);
    cart.items = [] as any;
    cart.couponCode = undefined;
    await cart.save();
    return this.calculateCart(cart, userId);
  }

  static async syncCart(
    items: Array<{ productId: string; quantity: number; size?: string; color?: string }>,
    couponCode?: string,
    userId?: string,
    guestId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, guestId);

    // Merge or replace items with validated ones
    const validatedItems: any[] = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product && product.isActive && product.stock > 0) {
        const qty = Math.min(item.quantity, product.stock);
        validatedItems.push({
          product: product._id,
          size: item.size || '',
          color: item.color || '',
          quantity: qty,
        });
      }
    }

    cart.items = validatedItems as any;
    if (couponCode !== undefined) {
      cart.couponCode = couponCode ? couponCode.trim().toUpperCase() : undefined;
    }

    await cart.save();
    return this.calculateCart(cart, userId);
  }

  static async migrateGuestCart(guestId: string, userId: string) {
    if (!guestId || !userId) return;

    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await this.getOrCreateCart(userId);

    for (const gItem of guestCart.items) {
      const existing = userCart.items.find(
        (it) =>
          it.product.toString() === gItem.product.toString() &&
          (it.size || '') === (gItem.size || '') &&
          (it.color || '') === (gItem.color || '')
      );
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        userCart.items.push(gItem);
      }
    }

    if (!userCart.couponCode && guestCart.couponCode) {
      userCart.couponCode = guestCart.couponCode;
    }

    await userCart.save();
    await Cart.findByIdAndDelete(guestCart._id);
  }
}

