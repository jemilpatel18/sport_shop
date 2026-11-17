import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { optionalAuth, authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { addToCartSchema, updateCartItemSchema, syncCartSchema } from '../validators';

const router = Router();

// Cart supports both authenticated users and guests (with x-guest-id)
router.use(optionalAuth);

router.get('/', CartController.getCart);
router.post('/items', validateBody(addToCartSchema), CartController.addItem);
router.post('/', validateBody(addToCartSchema), CartController.addItem);
router.put('/items/:itemId', validateBody(updateCartItemSchema), CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

router.post('/sync', validateBody(syncCartSchema), CartController.syncCart);
router.post('/migrate', authenticate, CartController.migrateGuestCart);

export default router;

