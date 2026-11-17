import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS, USER_ROLES } from '../constants';
import { AuthenticatedRequest } from '../types';

export class OrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.createOrder(req.user!.id, req.body);
      ApiResponse.success(res, {
        message: 'Order placed successfully! A confirmation email has been dispatched.',
        data: order,
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await OrderService.getMyOrders(req.user!.id);
      ApiResponse.success(res, {
        message: 'My orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user?.role === USER_ROLES.ADMIN;
      const order = await OrderService.getOrderById(req.params.id, req.user?.id, isAdmin);
      ApiResponse.success(res, {
        message: 'Order details retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reason = req.body.reason || 'Cancelled by customer';
      const order = await OrderService.cancelOrder(req.params.id, req.user!.id, reason);
      ApiResponse.success(res, {
        message: 'Order cancelled successfully and inventory restored.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrderService.adminGetAllOrders(req.query as any);
      ApiResponse.success(res, {
        message: 'Admin orders list fetched successfully',
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.getOrderById(req.params.id, undefined, true);
      ApiResponse.success(res, {
        message: 'Admin order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.adminUpdateOrderStatus(req.params.id, req.body);
      ApiResponse.success(res, {
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

