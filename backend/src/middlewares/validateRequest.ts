import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        ApiResponse.error(res, {
          message: 'Validation failed',
          errors,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        ApiResponse.error(res, {
          message: 'Query parameter validation failed',
          errors,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        ApiResponse.error(res, {
          message: 'URL parameters validation failed',
          errors,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
        return;
      }
      next(error);
    }
  };
};

