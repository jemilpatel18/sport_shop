import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { validateBody } from '../middlewares/validateRequest';
import { contactMessageSchema, newsletterSchema } from '../validators';

const router = Router();

router.post('/contact', validateBody(contactMessageSchema), ContactController.submitContactMessage);
router.post('/newsletter/subscribe', validateBody(newsletterSchema), ContactController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', validateBody(newsletterSchema), ContactController.unsubscribeNewsletter);

export default router;

