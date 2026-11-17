import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { CartService } from '../services/cartService';
import { ApiResponse } from '../utils/apiResponse';
import { setAuthCookies, clearAuthCookies } from '../utils/token';
import { COOKIE_NAMES, HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await AuthService.register(req.body);
      setAuthCookies(res, tokens);

      // Migrate guest cart if guest ID exists in headers or cookies
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id;
      if (guestId) {
        await CartService.migrateGuestCart(guestId, user.id);
      }

      ApiResponse.success(res, {
        message: 'Registration successful! Welcome to SPORTZONE.',
        data: { user, token: tokens.accessToken },
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await AuthService.login(req.body);
      setAuthCookies(res, tokens);

      // Migrate guest cart if guest ID exists
      const guestId = (req.headers['x-guest-id'] as string) || req.cookies?.sz_guest_id;
      if (guestId) {
        await CartService.migrateGuestCart(guestId, user.id);
      }

      ApiResponse.success(res, {
        message: 'Signed in successfully.',
        data: { user, token: tokens.accessToken },
        statusCode: HTTP_STATUS.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.id) {
        await AuthService.logout(req.user.id);
      }
      clearAuthCookies(res);
      ApiResponse.success(res, {
        message: 'Logged out successfully.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken =
        req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN] || req.body?.refreshToken;

      const { user, tokens } = await AuthService.refreshToken(refreshToken);
      setAuthCookies(res, tokens);

      ApiResponse.success(res, {
        message: 'Token refreshed successfully.',
        data: { user, token: tokens.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body.token, req.body.newPassword);
      ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      ApiResponse.success(res, {
        message: 'User profile retrieved successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await AuthService.updateProfile(req.user!.id, req.body);
      ApiResponse.success(res, {
        message: 'Profile updated successfully.',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.changePassword(
        req.user!.id,
        req.body.currentPassword,
        req.body.newPassword
      );
      ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

