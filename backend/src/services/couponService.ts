import mongoose from 'mongoose';
import { Coupon, ICoupon } from '../models/Coupon';
import { ApiError } from '../utils/apiError';
import { roundPrice } from '../utils/helpers';

export class CouponService {
  static async validateCoupon(code: string, subtotal: number, userId?: string) {
    if (!code || !code.trim()) {
      throw ApiError.badRequest('Coupon code is required.');
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw ApiError.badRequest('Invalid or inactive coupon code.');
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      throw ApiError.badRequest('This coupon code has expired.');
    }

    if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
      throw ApiError.badRequest('This promotional campaign has not started yet.');
    }

    if (subtotal < coupon.minOrderValue) {
      throw ApiError.badRequest(
        `Minimum order value of $${coupon.minOrderValue.toFixed(2)} is required for this coupon.`
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its maximum total usage limit.');
    }

    if (userId && coupon.usedBy && coupon.usedBy.length > 0) {
      const userUsageCount = coupon.usedBy.filter(
        (id) => id.toString() === userId
      ).length;
      if (userUsageCount >= coupon.perUserLimit) {
        throw ApiError.badRequest('You have already redeemed this coupon the maximum allowed number of times.');
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountPercentage) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountValue) {
      discount = coupon.discountValue;
    }

    discount = roundPrice(Math.min(discount, subtotal));

    return {
      valid: true,
      coupon: coupon.toJSON(),
      discount,
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    };
  }

  static async recordCouponUsage(code: string, userId?: string) {
    if (!code) return;
    const update: any = { $inc: { usedCount: 1 } };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      update.$push = { usedBy: new mongoose.Types.ObjectId(userId) };
    }
    await Coupon.findOneAndUpdate({ code: code.toUpperCase() }, update);
  }

  static async getAllCoupons() {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return coupons.map((c) => c.toJSON());
  }

  static async createCoupon(data: any) {
    const code = data.code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code });
    if (existing) {
      throw ApiError.conflict(`Coupon with code '${code}' already exists.`);
    }

    const coupon = new Coupon({
      ...data,
      code,
      expiryDate: new Date(data.expiryDate),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
    });

    await coupon.save();
    return coupon.toJSON();
  }

  static async updateCoupon(id: string, data: any) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found.');
    }

    if (data.code) {
      data.code = data.code.trim().toUpperCase();
    }
    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate);
    }

    Object.assign(coupon, data);
    await coupon.save();
    return coupon.toJSON();
  }

  static async deleteCoupon(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw ApiError.notFound('Coupon not found.');
    }
    return { message: 'Coupon deleted successfully.' };
  }
}

