import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../utils/apiError';

// Use memory storage so we can directly upload buffer to Cloudinary or disk
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        `Unsupported file type '${file.mimetype}'. Only JPG, PNG, WEBP, and GIF images are permitted.`,
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // max 10 files in single request
  },
  fileFilter,
});

