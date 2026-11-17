import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, currency, receipt } = req.body;
      const order = await PaymentService.createRazorpayOrder(amount, currency, receipt);
      ApiResponse.success(res, {
        message: 'Razorpay order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PaymentService.verifyPayment(req.body);
      ApiResponse.success(res, {
        message: 'Payment verified and confirmed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookSignature = (req.headers['x-razorpay-signature'] as string) || '';
      const result = await PaymentService.handleWebhook(req.body, webhookSignature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

