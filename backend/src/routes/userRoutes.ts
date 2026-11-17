import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validateRequest';
import { updateProfileSchema, changePasswordSchema, addressSchema } from '../validators';

const router = Router();

router.use(authenticate);

// Profile
router.get('/profile', UserController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);
router.put('/change-password', validateBody(changePasswordSchema), UserController.changePassword);

// Addresses
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', validateBody(addressSchema), UserController.addAddress);
router.put('/addresses/:id', validateBody(addressSchema.partial()), UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);

export default router;

