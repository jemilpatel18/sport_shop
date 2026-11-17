import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary';
import { config } from '../config';
import { ApiError } from '../utils/apiError';

export class UploadService {
  static async uploadImageBuffer(
    buffer: Buffer,
    originalName: string,
    folder = 'sportzone/products'
  ): Promise<{ url: string; publicId: string }> {
    const isCloudinaryConfigured =
      Boolean(config.cloudinary.cloudName) &&
      Boolean(config.cloudinary.apiKey) &&
      Boolean(config.cloudinary.apiSecret) &&
      !config.cloudinary.cloudName.includes('demo');

    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            format: 'webp',
            transformation: [{ quality: 'auto:good' }],
          },
          (error, result) => {
            if (error || !result) {
              return reject(new ApiError(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
        uploadStream.end(buffer);
      });
    }

    // Local file fallback for local development or when Cloudinary keys are not set
    const ext = path.extname(originalName) || '.jpg';
    const randomName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, randomName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${randomName}`;
    return {
      url: localUrl,
      publicId: `local_${randomName}`,
    };
  }

  static async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) return false;

    if (publicId.startsWith('local_')) {
      const fileName = publicId.replace('local_', '');
      const filePath = path.resolve(process.cwd(), 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (err) {
      console.error('[UploadService] Cloudinary deletion error:', err);
      return false;
    }
  }
}

