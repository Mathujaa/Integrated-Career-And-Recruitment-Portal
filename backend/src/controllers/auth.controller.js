import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UserModel from '../models/user.model.js';
import LogModel from '../models/log.model.js';
import TokenService from '../services/token.service.js';
import EmailService from '../services/email.service.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS, ROLES, TOKEN_EXPIRY_MS } from '../utils/constants.js';
import { SECURITY_CONFIG } from '../config/security.config.js';

class AuthController {
  // Helper to extract IP and User Agent
  _getRequestDetails(req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return { ipAddress, userAgent };
  }

  // Helper to set refresh token cookie
  _setRefreshCookie(res, token) {
    res.cookie('refreshToken', token, {
      maxAge: SECURITY_CONFIG.cookie.refreshCookieMaxAge,
      httpOnly: SECURITY_CONFIG.cookie.httpOnly,
      secure: SECURITY_CONFIG.cookie.secure,
      sameSite: SECURITY_CONFIG.cookie.sameSite
    });
  }

  registerStudent = async (req, res, next) => {
    try {
      const { first_name, last_name, email, password, phone } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return next(new AppError('A user with this email address already exists.', HTTP_STATUS.CONFLICT));
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SECURITY_CONFIG.bcryptSaltRounds);

      // Create user and profile in transaction
      const userId = await UserModel.createUserWithProfile({
        email,
        passwordHash,
        role: ROLES.STUDENT,
        firstName: first_name,
        lastName: last_name,
        phone,
        isVerified: false
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS.EMAIL_VERIFICATION);
      await UserModel.createEmailVerificationToken(userId, verificationToken, expiresAt);

      // Send verification email (non-blocking notification)
      EmailService.sendVerificationEmail(email, verificationToken, first_name)
        .catch(err => console.error('Verification email dispatch failed:', err));

      // Log action
      await LogModel.createActivityLog(userId, 'register_student', ipAddress, userAgent);

      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      next(error);
    }
  };

  registerEmployer = async (req, res, next) => {
    try {
      const { company_name, email, password, phone } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return next(new AppError('A user with this email address already exists.', HTTP_STATUS.CONFLICT));
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SECURITY_CONFIG.bcryptSaltRounds);

      // Create user and profile in transaction
      const userId = await UserModel.createUserWithProfile({
        email,
        passwordHash,
        role: ROLES.EMPLOYER,
        companyName: company_name,
        phone,
        isVerified: false
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS.EMAIL_VERIFICATION);
      await UserModel.createEmailVerificationToken(userId, verificationToken, expiresAt);

      // Send verification email
      EmailService.sendVerificationEmail(email, verificationToken, company_name)
        .catch(err => console.error('Verification email dispatch failed:', err));

      // Log action
      await LogModel.createActivityLog(userId, 'register_employer', ipAddress, userAgent);

      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req, res, next) => {
    try {
      const { token } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (!token) {
        return next(new AppError('Verification token is required.', HTTP_STATUS.BAD_REQUEST));
      }

      // Check verification token
      const tokenRecord = await UserModel.findEmailVerificationToken(token);
      if (!tokenRecord) {
        return next(new AppError('Invalid or expired verification token.', HTTP_STATUS.BAD_REQUEST));
      }

      // Check if token is expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        await UserModel.deleteEmailVerificationToken(token);
        return next(new AppError('Verification token has expired.', HTTP_STATUS.BAD_REQUEST));
      }

      // Update user verification status
      await UserModel.updateVerificationStatus(tokenRecord.user_id, true);

      // Clean up verification token
      await UserModel.deleteEmailVerificationToken(token);

      // Log activity
      await LogModel.createActivityLog(tokenRecord.user_id, 'verify_email', ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (!email || !password) {
        return next(new AppError('Please provide email and password.', HTTP_STATUS.BAD_REQUEST));
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        await LogModel.createLoginLog(null, ipAddress, userAgent, 'failed', 'Invalid email credentials');
        return next(new AppError('Incorrect email or password.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Compare password
      const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordCorrect) {
        await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Incorrect password credentials');
        return next(new AppError('Incorrect email or password.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Verify email status
      if (!user.is_verified) {
        await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Email not verified');
        return next(new AppError('Please verify your email address before logging in.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Verify account active status
      if (user.status === 'suspended') {
        await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Account suspended');
        return next(new AppError('Your account has been suspended. Please contact support.', HTTP_STATUS.FORBIDDEN));
      }

      // Verify recruiter status
      if (user.role === 'employer') {
        const [empRows] = await import('../config/db.config.js').then(m => m.default.query(
          'SELECT status FROM employers WHERE id = ?',
          [user.id]
        ));
        const empStatus = empRows[0]?.status || 'pending';
        if (empStatus === 'pending') {
          await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Recruiter pending admin approval');
          return next(new AppError('Your recruiter registration is pending admin approval.', HTTP_STATUS.FORBIDDEN));
        } else if (empStatus === 'rejected') {
          await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Recruiter rejected by admin');
          return next(new AppError('Your recruiter registration has been rejected by admin.', HTTP_STATUS.FORBIDDEN));
        } else if (empStatus === 'suspended') {
          await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'failed', 'Recruiter suspended by admin');
          return next(new AppError('Your recruiter account has been suspended by admin.', HTTP_STATUS.FORBIDDEN));
        }
      }

      // Generate Access & Refresh tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      // Save refresh token to database
      const expiresAt = new Date(Date.now() + SECURITY_CONFIG.cookie.refreshCookieMaxAge);
      await UserModel.createRefreshToken(user.id, refreshToken, expiresAt);

      // Set Refresh token cookie
      this._setRefreshCookie(res, refreshToken);

      // Log audit successes
      await LogModel.createLoginLog(user.id, ipAddress, userAgent, 'success');
      await LogModel.createActivityLog(user.id, 'login', ipAddress, userAgent);

      // Get profile
      const userDetails = await UserModel.findUserWithProfile(user.id);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        token: accessToken,
        user: {
          id: userDetails.id,
          email: userDetails.email,
          role: userDetails.role,
          is_verified: userDetails.is_verified,
          profile: userDetails.profile
        }
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (!refreshToken) {
        return next(new AppError('Access Denied. No refresh token provided.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Verify JWT Refresh format
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return next(new AppError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Look up refresh token in database
      const tokenRecord = await UserModel.findRefreshToken(refreshToken);
      if (!tokenRecord) {
        return next(new AppError('Refresh token was revoked or invalid.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Check expiry in DB
      if (new Date(tokenRecord.expires_at) < new Date()) {
        await UserModel.revokeRefreshToken(refreshToken);
        return next(new AppError('Refresh token expired. Please login again.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Fetch user
      const user = await UserModel.findById(decoded.id);
      if (!user || user.status === 'suspended') {
        return next(new AppError('User not found or suspended.', HTTP_STATUS.UNAUTHORIZED));
      }

      // Rotate tokens
      const newAccessToken = TokenService.generateAccessToken(user);
      const newRefreshToken = TokenService.generateRefreshToken(user);

      // Update Database (Revoke old token, store new one)
      await UserModel.revokeRefreshToken(refreshToken);
      const expiresAt = new Date(Date.now() + SECURITY_CONFIG.cookie.refreshCookieMaxAge);
      await UserModel.createRefreshToken(user.id, newRefreshToken, expiresAt);

      // Set cookie
      this._setRefreshCookie(res, newRefreshToken);

      // Log activity
      await LogModel.createActivityLog(user.id, 'refresh_token', ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        token: newAccessToken
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (refreshToken) {
        // Revoke token in DB
        await UserModel.revokeRefreshToken(refreshToken);
      }

      // Clear cookie
      res.clearCookie('refreshToken', {
        httpOnly: SECURITY_CONFIG.cookie.httpOnly,
        secure: SECURITY_CONFIG.cookie.secure,
        sameSite: SECURITY_CONFIG.cookie.sameSite
      });

      if (req.user) {
        await LogModel.createActivityLog(req.user.id, 'logout', ipAddress, userAgent);
      }

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (!email) {
        return next(new AppError('Email address is required.', HTTP_STATUS.BAD_REQUEST));
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Return 200 to prevent user enumeration attacks
        return res.status(HTTP_STATUS.OK).json({
          status: 'success',
          message: 'If the email matches an active account, a password reset link will be sent.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS.PASSWORD_RESET);
      await UserModel.createPasswordResetToken(user.id, resetToken, expiresAt);

      // Get profile to retrieve first_name/company_name/full_name
      const userDetails = await UserModel.findUserWithProfile(user.id);
      let firstName = 'User';
      if (userDetails.role === 'student' && userDetails.profile) {
        firstName = userDetails.profile.first_name;
      } else if (userDetails.role === 'employer' && userDetails.profile) {
        firstName = userDetails.profile.company_name;
      } else if (userDetails.role === 'admin' && userDetails.profile) {
        firstName = userDetails.profile.full_name;
      }

      // Send email
      EmailService.sendPasswordResetEmail(email, resetToken, firstName)
        .catch(err => console.error('Password reset email dispatch failed:', err));

      // Log activity
      await LogModel.createActivityLog(user.id, 'request_password_reset', ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'If the email matches an active account, a password reset link will be sent.'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const { ipAddress, userAgent } = this._getRequestDetails(req);

      if (!token || !password) {
        return next(new AppError('Token and new password are required.', HTTP_STATUS.BAD_REQUEST));
      }

      // Check reset token in database
      const resetRecord = await UserModel.findPasswordResetToken(token);
      if (!resetRecord) {
        return next(new AppError('Invalid or expired password reset token.', HTTP_STATUS.BAD_REQUEST));
      }

      // Check expiry
      if (new Date(resetRecord.expires_at) < new Date()) {
        return next(new AppError('Password reset token has expired.', HTTP_STATUS.BAD_REQUEST));
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, SECURITY_CONFIG.bcryptSaltRounds);

      // Update password
      await UserModel.updatePassword(resetRecord.user_id, passwordHash);

      // Mark token as used
      await UserModel.markPasswordResetTokenUsed(token);

      // Revoke all refresh tokens (forces login on all devices)
      await UserModel.deleteRefreshTokensByUserId(resetRecord.user_id);

      // Log activity
      await LogModel.createActivityLog(resetRecord.user_id, 'reset_password', ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Password reset successfully. You can now login.'
      });
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req, res, next) => {
    try {
      // req.user is loaded by protect middleware
      const userDetails = await UserModel.findUserWithProfile(req.user.id);
      if (!userDetails) {
        return next(new AppError('User session invalid.', HTTP_STATUS.UNAUTHORIZED));
      }

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        user: {
          id: userDetails.id,
          email: userDetails.email,
          role: userDetails.role,
          is_verified: userDetails.is_verified,
          profile: userDetails.profile
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
