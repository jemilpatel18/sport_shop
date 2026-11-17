import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { upload } from '../middlewares/upload';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

// Image upload and deletion protected by admin authorization
router.use(authenticate, requireAdmin);

router.post('/image', upload.single('image'), UploadController.uploadSingle);
router.post('/images', upload.array('images', 10), UploadController.uploadMultiple);
router.delete('/image', UploadController.deleteImage);

export default router;

