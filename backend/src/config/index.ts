import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportzone',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'sportzone_access_secret_development_fallback_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'sportzone_refresh_secret_development_fallback_key',
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sportzone_demo123',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_demo456',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key_789',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'SPORTZONE <no-reply@sportzone.com>',
  },
};

