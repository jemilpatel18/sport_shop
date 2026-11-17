import { Response, NextFunction } from 'express';
import { AdminDashboardService } from '../services/adminDashboardService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  static async getDashboardStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminDashboardService.getStats();
      ApiResponse.success(res, {
        message: 'Admin dashboard statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as 'daily' | 'monthly') || 'daily';
      const sales = await AdminDashboardService.getSalesReport(period);
      ApiResponse.success(res, {
        message: 'Sales report generated successfully',
        data: sales,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;

      const result = await AdminDashboardService.getCustomers(page, limit, search);
      ApiResponse.success(res, {
        message: 'Customers retrieved successfully',
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await AdminDashboardService.getCustomerById(req.params.id);
      ApiResponse.success(res, {
        message: 'Customer details retrieved successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const threshold = parseInt(req.query.threshold as string, 10) || 10;
      const items = await AdminDashboardService.getInventoryAlerts(threshold);
      ApiResponse.success(res, {
        message: 'Low stock inventory alerts retrieved',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getContactMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const messages = await AdminDashboardService.getContactMessages(status);
      ApiResponse.success(res, {
        message: 'Contact messages retrieved successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}

