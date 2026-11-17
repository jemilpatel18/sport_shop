import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { categorySchema } from '../validators';

const router = Router();

// Public routes
router.get('/', CategoryController.getCategories);
router.get('/slug/:slug', CategoryController.getCategory);
router.get('/:id', CategoryController.getCategory);

// Admin-only routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(categorySchema),
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(categorySchema.partial()),
  CategoryController.updateCategory
);

router.delete('/:id', authenticate, requireAdmin, CategoryController.deleteCategory);

export default router;

