import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/couponService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class CouponController {
  static async validate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.body.code;
      const subtotal = req.body.subtotal || 0;
      const result = await CouponService.validateCoupon(code, subtotal, req.user?.id);
      ApiResponse.success(res, {
        message: 'Coupon code applied successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await CouponService.getAllCoupons();
      ApiResponse.success(res, {
        message: 'Coupons retrieved successfully',
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminCreate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      ApiResponse.success(res, {
        message: 'Coupon created successfully',
        data: coupon,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await CouponService.updateCoupon(req.params.id, req.body);
      ApiResponse.success(res, {
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CouponService.deleteCoupon(req.params.id);
      ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

