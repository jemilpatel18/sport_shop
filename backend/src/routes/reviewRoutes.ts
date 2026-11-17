import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { createReviewSchema } from '../validators';

const router = Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/', authenticate, validateBody(createReviewSchema), ReviewController.createReview);
router.put('/:id', authenticate, validateBody(createReviewSchema.partial()), ReviewController.updateReview);
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;

