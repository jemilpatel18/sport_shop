import { HTTP_STATUS } from '../constants';

export class ApiError extends Error {
  public statusCode: number;
  public errors: any[];
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors: any[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: any[] = []): ApiError {
    return new ApiError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(message: string = 'Authentication required'): ApiError {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Access denied: insufficient permissions'): ApiError {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, HTTP_STATUS.CONFLICT);
  }

  static unprocessable(message: string, errors: any[] = []): ApiError {
    return new ApiError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

