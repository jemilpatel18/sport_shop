import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { brandSchema } from '../validators';

const router = Router();

// Public routes
router.get('/', BrandController.getBrands);
router.get('/slug/:slug', BrandController.getBrand);
router.get('/:id', BrandController.getBrand);

// Admin-only routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(brandSchema),
  BrandController.createBrand
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(brandSchema.partial()),
  BrandController.updateBrand
);

router.delete('/:id', authenticate, requireAdmin, BrandController.deleteBrand);

export default router;

