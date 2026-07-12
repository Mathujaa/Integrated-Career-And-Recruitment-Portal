import './env.js';

export const SECURITY_CONFIG = {
  bcryptSaltRounds: 10,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'd8ef9c7bca4d081f21568c07e2ab7b9264fa58d203cb06757be509d8bb10901e',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '7f51bb1a0d8e202be11cc45e12e9b08f4c1c73db2f8c5c0cbe2b0e77d24a9192',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  cookie: {
    refreshCookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
};
