import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config';
import { COOKIE_NAMES, UserRole } from '../constants';
import { IAuthUser } from '../types';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export const generateAccessToken = (user: TokenPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn as any }
  );
};

export const generateRefreshToken = (user: TokenPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as any }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void => {
  const isProd = config.isProduction;

  // Access Token: 15 minutes
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token: 7 days
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: '/',
  });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    domain: config.cookie.domain,
    path: '/',
  });
};

