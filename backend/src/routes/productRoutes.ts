import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody, validateQuery } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/new-arrivals', ProductController.getNewArrivals);
router.get('/best-sellers', ProductController.getBestSellers);
router.get('/bestsellers', ProductController.getBestSellers);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id/related', ProductController.getRelatedProducts);
router.get('/:id', ProductController.getProductById);

// Admin-only management routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(updateProductSchema),
  ProductController.updateProduct
);

router.delete('/:id', authenticate, requireAdmin, ProductController.deleteProduct);

export default router;

