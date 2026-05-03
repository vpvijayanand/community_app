import jwt from 'jsonwebtoken';
import { env } from './env';

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET || env.JWT_SECRET || 'secret', { expiresIn: env.ACCESS_TOKEN_EXPIRY } as any);
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET || env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: env.REFRESH_TOKEN_EXPIRY } as any);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET || env.JWT_SECRET || 'secret');
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET || env.JWT_REFRESH_SECRET || 'refresh_secret');
};
