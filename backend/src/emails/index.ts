import { mailerTransporter } from '../config/mailer';
import { config } from '../config';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<boolean> => {
  try {
    if (config.env === 'test') {
      return true; // Skip sending in test mode
    }

    await mailerTransporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`[Mailer] Failed to send email to ${to}:`, error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding: 15px; background: #000; color: #fff; border-radius: 6px;">
        <h1 style="margin: 0; letter-spacing: 2px;">SPORTZONE</h1>
        <p style="margin: 5px 0 0; color: #f97316; font-weight: bold;">EVERYTHING FOR EVERY ATHLETE</p>
      </div>
      <div style="background: #ffffff; padding: 25px; border-radius: 6px; margin-top: 15px; border: 1px solid #e5e7eb;">
        <h2>Welcome to SPORTZONE, ${name}!</h2>
        <p>Thank you for joining our community of athletes, fitness enthusiasts, and sports fans.</p>
        <p>Explore thousands of high-performance gear, apparel, and footwear from the world's leading brands.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${config.frontendUrl}/shop" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">START SHOPPING</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not sign up for this account, please disregard this email.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Welcome to SPORTZONE!', html });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding: 15px; background: #000; color: #fff; border-radius: 6px;">
        <h1 style="margin: 0; letter-spacing: 2px;">SPORTZONE</h1>
      </div>
      <div style="background: #ffffff; padding: 25px; border-radius: 6px; margin-top: 15px; border: 1px solid #e5e7eb;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your SPORTZONE account.</p>
        <p>Click the button below to securely reset your password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">RESET PASSWORD</a>
        </div>
        <p style="word-break: break-all; color: #6b7280; font-size: 13px;">Or copy and paste this link into your browser: <br>${resetUrl}</p>
        <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'SPORTZONE - Password Reset Request', html });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number,
  itemCount: number
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding: 15px; background: #000; color: #fff; border-radius: 6px;">
        <h1 style="margin: 0; letter-spacing: 2px;">SPORTZONE</h1>
        <p style="margin: 5px 0 0; color: #22c55e; font-weight: bold;">ORDER CONFIRMED</p>
      </div>
      <div style="background: #ffffff; padding: 25px; border-radius: 6px; margin-top: 15px; border: 1px solid #e5e7eb;">
        <h2>Thank you for your order!</h2>
        <p>We've received your order and are currently preparing it for shipment.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 4px 0;"><strong>Total Items:</strong> ${itemCount}</p>
          <p style="margin: 4px 0;"><strong>Order Total:</strong> $${total.toFixed(2)}</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${config.frontendUrl}/orders/${orderNumber}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">TRACK YOUR ORDER</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `SPORTZONE - Order Confirmation #${orderNumber}`, html });
};

