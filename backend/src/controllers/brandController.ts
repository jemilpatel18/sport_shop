import { Request, Response, NextFunction } from 'express';
import { BrandService } from '../services/brandService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class BrandController {
  static async getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.all !== 'true';
      const brands = await BrandService.getBrands(activeOnly);
      ApiResponse.success(res, {
        message: 'Brands fetched successfully',
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.getBrandByIdOrSlug(req.params.idOrSlug || req.params.id || req.params.slug);
      ApiResponse.success(res, {
        message: 'Brand retrieved successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.createBrand(req.body);
      ApiResponse.success(res, {
        message: 'Brand created successfully',
        data: brand,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = await BrandService.updateBrand(req.params.id, req.body);
      ApiResponse.success(res, {
        message: 'Brand updated successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBrand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BrandService.deleteBrand(req.params.id);
      ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

