import AppError from '../utils/AppError.js';
import tokenService from '../services/token.service.js';
import userModel from '../models/user.model.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please login to gain access.', HTTP_STATUS.UNAUTHORIZED));
    }

    const decoded = tokenService.verifyAccessToken(token);
    if (!decoded) {
      return next(new AppError('Invalid token or token has expired. Please login again.', HTTP_STATUS.UNAUTHORIZED));
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (user.status === 'suspended') {
      return next(new AppError('Your account has been suspended. Please contact support.', HTTP_STATUS.FORBIDDEN));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
