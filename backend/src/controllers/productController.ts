import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query as any);
      ApiResponse.success(res, {
        message: 'Products fetched successfully',
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      ApiResponse.success(res, {
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);
      ApiResponse.success(res, {
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFeaturedProducts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getFeaturedProducts();
      ApiResponse.success(res, {
        message: 'Featured products fetched successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBestSellers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getBestSellers();
      ApiResponse.success(res, {
        message: 'Best-selling products fetched successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNewArrivals(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getNewArrivals();
      ApiResponse.success(res, {
        message: 'New arrival products fetched successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = (req.query.category as string) || '';
      const products = await ProductService.getRelatedProducts(req.params.id, category);
      ApiResponse.success(res, {
        message: 'Related products fetched successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      ApiResponse.success(res, {
        message: 'Product created successfully',
        data: product,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      ApiResponse.success(res, {
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

