import { HTTP_STATUS } from '../utils/constants.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR 💥:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Format common MySQL driver exceptions
  if (err.code === 'ER_DUP_ENTRY') {
    err.statusCode = HTTP_STATUS.CONFLICT;
    err.status = 'fail';
    err.message = 'A record with this email or profile information already exists.';
    err.isOperational = true;
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
