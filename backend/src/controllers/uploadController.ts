import { Response, NextFunction } from 'express';
import { UploadService } from '../services/uploadService';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest } from '../types';

export class UploadController {
  static async uploadSingle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No image file uploaded.');
      }

      const result = await UploadService.uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        'sportzone/products'
      );

      ApiResponse.success(res, {
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadMultiple(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw ApiError.badRequest('No image files uploaded.');
      }

      const uploadPromises = files.map((file) =>
        UploadService.uploadImageBuffer(file.buffer, file.originalname, 'sportzone/products')
      );

      const results = await Promise.all(uploadPromises);

      ApiResponse.success(res, {
        message: `${results.length} images uploaded successfully`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.body.publicId || req.query.publicId;
      if (!publicId) {
        throw ApiError.badRequest('Public ID of the image is required.');
      }

      await UploadService.deleteImage(publicId as string);

      ApiResponse.success(res, {
        message: 'Image deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

