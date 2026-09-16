import multer from 'multer';
import { badRequest } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(badRequest('Sirf JPG, PNG, WEBP, GIF ya SVG image upload kar sakte ho'));
    }
    return cb(null, true);
  },
});

export default upload;
