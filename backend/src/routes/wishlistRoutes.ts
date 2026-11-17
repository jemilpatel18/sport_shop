import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addToWishlist);
router.post('/:productId', WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);

export default router;

