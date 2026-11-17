import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';
import { config } from '../config';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'An unexpected internal error occurred';
  let errors = err.errors || [];

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value '${value}' entered for ${field}. Please use a unique value.`;
    errors = [{ field, message }];
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation error occurred';
    errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Resource not found with invalid identifier: ${err.value}`;
    errors = [{ field: err.path, message: 'Invalid ID format' }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token has expired. Please sign in again.';
  }

  // Log error (safe logging: omit sensitive payloads)
  if (statusCode >= 500 && config.env !== 'test') {
    console.error('[Error] Internal Server Exception:', {
      message: err.message,
      stack: config.env === 'development' ? err.stack : undefined,
    });
  }

  ApiResponse.error(res, {
    message,
    errors,
    statusCode,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(res, {
    message: `API endpoint '${req.method} ${req.originalUrl}' not found. Check documentation at /docs or /api-docs.`,
    statusCode: HTTP_STATUS.NOT_FOUND,
  });
};

