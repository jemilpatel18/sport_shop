import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { PaginationParams } from '../types';

export class ApiResponse {
  static success<T = any>(
    res: Response,
    options: {
      message?: string;
      data?: T;
      pagination?: PaginationParams;
      statusCode?: number;
    } = {}
  ): Response {
    const {
      message = 'Operation completed successfully',
      data,
      pagination,
      statusCode = HTTP_STATUS.OK,
    } = options;

    const body: Record<string, any> = {
      success: true,
      message,
    };

    if (data !== undefined) {
      body.data = data;

      // When data is a plain object (like user or order), also merge its properties
      // at the top level for frontend clients expecting `response.data.id` directly
      if (
        data !== null &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        !('data' in (data as any))
      ) {
        // Merge properties without overriding 'success', 'message', 'data', 'pagination'
        for (const [key, val] of Object.entries(data)) {
          if (!['success', 'message', 'data', 'pagination', 'errors'].includes(key)) {
            body[key] = val;
          }
        }
      }
    }

    if (pagination) {
      body.pagination = pagination;
    }

    return res.status(statusCode).json(body);
  }

  static error(
    res: Response,
    options: {
      message?: string;
      errors?: any[];
      statusCode?: number;
    } = {}
  ): Response {
    const {
      message = 'An error occurred during request processing',
      errors = [],
      statusCode = HTTP_STATUS.BAD_REQUEST,
    } = options;

    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

