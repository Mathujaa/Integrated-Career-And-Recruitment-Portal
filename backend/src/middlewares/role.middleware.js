import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };
};
