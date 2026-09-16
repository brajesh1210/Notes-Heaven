import { Router } from 'express';
import * as uploads from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.use(protect, uploadLimiter);

router.post('/image', upload.single('image'), uploads.uploadImage);
router.delete('/image', uploads.deleteImage);

export default router;
