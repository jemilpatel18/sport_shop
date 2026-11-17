import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/apiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../emails';
import { USER_ROLES } from '../constants';

export class AuthService {
  static async register(data: { name: string; email: string; password?: string; phone?: string }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const user = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone || '',
      role: USER_ROLES.CUSTOMER,
      status: 'active',
      isEmailVerified: true,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email asynchronously
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('[AuthService] Welcome email failed:', err)
    );

    return {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  static async login(credentials: { email: string; password?: string; rolePreference?: string }) {
    const user = await User.findOne({ email: credentials.email.toLowerCase() }).select(
      '+password +refreshToken'
    );

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account is deactivated or suspended. Please contact customer support.');
    }

    if (credentials.password) {
      const isMatch = await user.comparePassword(credentials.password);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password.');
      }
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token. Please sign in again.');
    }

    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw ApiError.unauthorized('Invalid refresh token.');
    }

    // Refresh token rotation
    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const newRefreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal email existence to prevent user enumeration
      return { message: 'If that email address exists in our database, reset instructions have been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    return { message: 'Password reset link sent to your email address.' };
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Your password has been successfully reset. You can now log in.' };
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user.toJSON();
  }

  static async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await user.save();
    return user.toJSON();
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw ApiError.badRequest('Current password does not match.');
    }

    user.password = newPass;
    await user.save();
    return { message: 'Password changed successfully.' };
  }
}

