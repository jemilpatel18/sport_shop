import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/token';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { COOKIE_NAMES, USER_ROLES, UserRole } from '../constants';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies[COOKIE_NAMES.ACCESS_TOKEN]) {
      // Check HttpOnly cookie
      token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing. Please log in.');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session expired. Please refresh your token or log in again.');
      }
      throw ApiError.unauthorized('Invalid authentication token.');
    }

    const user = await User.findById(payload.id).select('_id email role name status');
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account has been deactivated or suspended. Please contact support.');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies[COOKIE_NAMES.ACCESS_TOKEN]) {
      token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.id).select('_id email role name status');
        if (user && user.status === 'active') {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role as UserRole,
            name: user.name,
          };
        }
      } catch {
        // Token invalid or expired: treat as unauthenticated guest
      }
    }

    // Guest ID header or fallback
    const guestIdHeader = req.headers['x-guest-id'] as string;
    if (guestIdHeader) {
      req.guestId = guestIdHeader;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required to access this resource.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${req.user.role}.`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(USER_ROLES.ADMIN);

