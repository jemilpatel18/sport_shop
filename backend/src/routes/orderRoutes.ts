import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { createOrderSchema, cancelOrderSchema, updateOrderStatusSchema } from '../validators';

const router = Router();

// Customer Order Endpoints
router.post('/', authenticate, validateBody(createOrderSchema), OrderController.createOrder);
router.get('/my-orders', authenticate, OrderController.getMyOrders);
router.get('/:id', authenticate, OrderController.getOrderById);
router.post('/:id/cancel', authenticate, validateBody(cancelOrderSchema), OrderController.cancelOrder);

export default router;

