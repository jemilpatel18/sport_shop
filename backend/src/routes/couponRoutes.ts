import { Router } from 'express';
import { CouponController } from '../controllers/couponController';
import { optionalAuth, authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { validateCouponSchema, createCouponSchema } from '../validators';

const router = Router();

// Validation endpoints
router.post('/validate', optionalAuth, validateBody(validateCouponSchema), CouponController.validate);
router.post('/apply', optionalAuth, validateBody(validateCouponSchema), CouponController.validate);

export default router;

