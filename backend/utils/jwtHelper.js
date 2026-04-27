import jwt from 'jsonwebtoken';
import AppError from './AppError.js';
import { readFileSync } from './fsHelper.js';

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('憑證已過期，請重新登入', 403);
    }
    throw new AppError('無效的憑證', 403);
  }
};

export const signAccessToken = (payload) => {
  const privateKey = readFileSync('./jwtRS256.key');
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const signRefreshToken = (payload) => {
  const privateKey = readFileSync('./jwtRS256.key');
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const signTempToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '5m',
  });
};

export const verifyRefreshToken = (token) => {
  const publicKey = readFileSync('./jwtRS256.key.pub');
  return verifyToken(token, publicKey);
};

export const verifyAccessToken = (token) => {
  const publicKey = readFileSync('./jwtRS256.key.pub');
  return verifyToken(token, publicKey);
};

export const verifyTempToken = (token) => {
  return verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
};
