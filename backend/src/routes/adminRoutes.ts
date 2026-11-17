import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { OrderController } from '../controllers/orderController';
import { CouponController } from '../controllers/couponController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { updateOrderStatusSchema, createCouponSchema } from '../validators';

const router = Router();

// All routes here strictly require admin authentication
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/dashboard/sales', AdminController.getSalesReport);

// Customers
router.get('/customers', AdminController.getCustomers);
router.get('/customers/:id', AdminController.getCustomerById);

// Orders
router.get('/orders', OrderController.adminGetAllOrders);
router.get('/orders/:id', OrderController.adminGetOrderById);
router.put(
  '/orders/:id/status',
  validateBody(updateOrderStatusSchema),
  OrderController.adminUpdateOrderStatus
);

// Inventory
router.get('/inventory', AdminController.getInventoryAlerts);

// Messages
router.get('/messages', AdminController.getContactMessages);

// Coupons
router.get('/coupons', CouponController.adminGetAll);
router.post('/coupons', validateBody(createCouponSchema), CouponController.adminCreate);
router.put('/coupons/:id', validateBody(createCouponSchema.partial()), CouponController.adminUpdate);
router.delete('/coupons/:id', CouponController.adminDelete);

export default router;

