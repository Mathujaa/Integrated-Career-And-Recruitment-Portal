import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, HTTP_STATUS.BAD_REQUEST));
  }
  next();
};
