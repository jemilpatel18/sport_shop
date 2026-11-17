import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { verifyPaymentSchema } from '../validators';

const router = Router();

router.post('/create-order', authenticate, PaymentController.createOrder);
router.post('/verify', authenticate, validateBody(verifyPaymentSchema), PaymentController.verifyPayment);
router.post('/webhook', PaymentController.webhook);

export default router;

