import nodemailer from 'nodemailer';
import { config } from './index';

export const mailerTransporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: config.smtp.user ? {
    user: config.smtp.user,
    pass: config.smtp.pass,
  } : undefined,
});

if (process.env.NODE_ENV !== 'test') {
  mailerTransporter.verify().catch(() => {
    console.warn('[Mailer] SMTP server connection check skipped or unverified (using mock fallback).');
  });
}

export default mailerTransporter;
