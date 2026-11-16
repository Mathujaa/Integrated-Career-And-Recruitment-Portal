import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SECURITY_CONFIG } from '../config/security.config.js';

class TokenService {
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, SECURITY_CONFIG.jwt.accessSecret, {
      expiresIn: SECURITY_CONFIG.jwt.accessExpiry
    });
  }

  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      jti: crypto.randomUUID()
    };
    return jwt.sign(payload, SECURITY_CONFIG.jwt.refreshSecret, {
      expiresIn: SECURITY_CONFIG.jwt.refreshExpiry
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, SECURITY_CONFIG.jwt.accessSecret);
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, SECURITY_CONFIG.jwt.refreshSecret);
    } catch (error) {
      return null;
    }
  }
}

export default new TokenService();
