import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      ApiResponse.success(res, {
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await AuthService.updateProfile(req.user!.id, req.body);
      ApiResponse.success(res, {
        message: 'Profile updated successfully',
        data: updated,
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

  static async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw ApiError.notFound('User not found.');
      ApiResponse.success(res, {
        message: 'Addresses fetched successfully',
        data: user.addresses.map((a: any) => a.toJSON ? a.toJSON() : a),
      });
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw ApiError.notFound('User not found.');

      if (req.body.isDefault) {
        user.addresses.forEach((addr: any) => {
          addr.isDefault = false;
        });
      } else if (user.addresses.length === 0) {
        req.body.isDefault = true;
      }

      user.addresses.push(req.body);
      await user.save();

      ApiResponse.success(res, {
        message: 'Address added successfully',
        data: user.addresses.map((a: any) => a.toJSON ? a.toJSON() : a),
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw ApiError.notFound('User not found.');

      const address = (user.addresses as any).id(req.params.id);
      if (!address) throw ApiError.notFound('Address not found.');

      if (req.body.isDefault) {
        user.addresses.forEach((addr: any) => {
          addr.isDefault = false;
        });
      }

      Object.assign(address, req.body);
      await user.save();

      ApiResponse.success(res, {
        message: 'Address updated successfully',
        data: user.addresses.map((a: any) => a.toJSON ? a.toJSON() : a),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) throw ApiError.notFound('User not found.');

      const address = (user.addresses as any).id(req.params.id);
      if (!address) throw ApiError.notFound('Address not found.');

      address.deleteOne();
      await user.save();

      ApiResponse.success(res, {
        message: 'Address deleted successfully',
        data: user.addresses.map((a: any) => a.toJSON ? a.toJSON() : a),
      });
    } catch (error) {
      next(error);
    }
  }
}

