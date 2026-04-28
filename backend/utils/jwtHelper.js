import jwt from 'jsonwebtoken';
import { readFileSync } from './fsHelper.js';

const privateKey = readFileSync('./jwtRS256.key');
const publicKey = readFileSync('./jwtRS256.key.pub');

export const signAccessToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const signRefreshToken = (payload) => {
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
  return jwt.verify(token, publicKey);
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, publicKey);
};

export const verifyTempToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
