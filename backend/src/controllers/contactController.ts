import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { Newsletter } from '../models/Newsletter';
import { ApiResponse } from '../utils/apiResponse';
import { HTTP_STATUS } from '../constants';

export class ContactController {
  static async submitContactMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const msg = new ContactMessage(req.body);
      await msg.save();

      ApiResponse.success(res, {
        message: 'Thank you for reaching out! A SPORTZONE sports specialist will respond shortly.',
        data: msg.toJSON(),
        statusCode: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body.email.toLowerCase().trim();
      let sub = await Newsletter.findOne({ email });

      if (sub) {
        if (!sub.isActive) {
          sub.isActive = true;
          await sub.save();
        }
      } else {
        sub = new Newsletter({ email, isActive: true });
        await sub.save();
      }

      ApiResponse.success(res, {
        message: 'You have successfully subscribed to SPORTZONE exclusive drops and promotions!',
        data: { email: sub.email, subscribed: true },
      });
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body.email.toLowerCase().trim();
      await Newsletter.findOneAndUpdate({ email }, { isActive: false });

      ApiResponse.success(res, {
        message: 'You have been unsubscribed from our newsletter notifications.',
        data: { email, subscribed: false },
      });
    } catch (error) {
      next(error);
    }
  }
}

