import { Request } from 'express';
import { UserRole, OrderStatus, PaymentMethod, PaymentStatus } from '../constants';

export interface IAddress {
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface IAuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthUser;
  guestId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationParams;
  errors?: any[];
}

