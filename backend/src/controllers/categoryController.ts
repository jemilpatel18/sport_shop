import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.all !== 'true';
      const categories = await CategoryService.getCategories(activeOnly);
      ApiResponse.success(res, {
        message: 'Categories fetched successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.getCategoryByIdOrSlug(req.params.idOrSlug || req.params.id || req.params.slug);
      ApiResponse.success(res, {
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      ApiResponse.success(res, {
        message: 'Category created successfully',
        data: category,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      ApiResponse.success(res, {
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CategoryService.deleteCategory(req.params.id);
      ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

