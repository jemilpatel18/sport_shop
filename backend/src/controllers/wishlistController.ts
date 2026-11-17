import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlistService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class WishlistController {
  static async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await WishlistService.getWishlist(req.user!.id);
      ApiResponse.success(res, {
        message: 'Wishlist retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.productId || req.body.productId;
      const items = await WishlistService.addToWishlist(req.user!.id, productId);
      ApiResponse.success(res, {
        message: 'Product added to wishlist',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.productId;
      const items = await WishlistService.removeFromWishlist(req.user!.id, productId);
      ApiResponse.success(res, {
        message: 'Product removed from wishlist',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
}

