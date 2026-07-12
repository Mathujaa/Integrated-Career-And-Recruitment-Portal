import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

const validateStudentRegister = [
  body('first_name').trim().notEmpty().withMessage('First name is required.'),
  body('last_name').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 8, max: 15 }).withMessage('Invalid phone number format.'),
  validateRequest
];

const validateEmployerRegister = [
  body('company_name').trim().notEmpty().withMessage('Company name is required.'),
  body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 8, max: 15 }).withMessage('Invalid phone number format.'),
  validateRequest
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  validateRequest
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  validateRequest
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Token is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  validateRequest
];

const validateVerifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required.'),
  validateRequest
];

router.post('/register/student', validateStudentRegister, authController.registerStudent);
router.post('/register/employer', validateEmployerRegister, authController.registerEmployer);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', protect, authController.getCurrentUser);

export default router;
