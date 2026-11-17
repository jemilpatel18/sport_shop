import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS, USER_ROLES } from '../constants';
import { AuthenticatedRequest } from '../types';

export class ReviewController {
  static async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await ReviewService.getProductReviews(req.params.productId);
      ApiResponse.success(res, {
        message: 'Product reviews fetched successfully',
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await ReviewService.createReview(
        req.user!.id,
        req.user!.name || 'Customer',
        req.body
      );
      ApiResponse.success(res, {
        message: 'Review posted successfully. Thank you for your feedback!',
        data: review,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await ReviewService.updateReview(req.params.id, req.user!.id, req.body);
      ApiResponse.success(res, {
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user?.role === USER_ROLES.ADMIN;
      const result = await ReviewService.deleteReview(req.params.id, req.user!.id, isAdmin);
      ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

