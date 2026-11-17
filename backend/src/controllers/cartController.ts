import { Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.getCart(req.user?.id, guestId);
      ApiResponse.success(res, {
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.addToCart(req.user?.id, guestId, req.body);
      ApiResponse.success(res, {
        message: 'Item added to cart successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.updateCartItem(
        req.params.itemId,
        req.user?.id,
        guestId,
        req.body
      );
      ApiResponse.success(res, {
        message: 'Cart item updated successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.removeCartItem(req.params.itemId, req.user?.id, guestId);
      ApiResponse.success(res, {
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.clearCart(req.user?.id, guestId);
      ApiResponse.success(res, {
        message: 'Cart cleared successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id || req.guestId;
      const cart = await CartService.syncCart(
        req.body.items,
        req.body.couponCode,
        req.user?.id,
        guestId
      );
      ApiResponse.success(res, {
        message: 'Cart synchronized with server',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async migrateGuestCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const guestId = req.body.guestId || (req.headers['x-guest-id'] as string);
      if (req.user?.id && guestId) {
        await CartService.migrateGuestCart(guestId, req.user.id);
      }
      const cart = await CartService.getCart(req.user?.id);
      ApiResponse.success(res, {
        message: 'Guest cart migrated successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}

