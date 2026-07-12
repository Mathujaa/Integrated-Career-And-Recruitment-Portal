import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { CORS_CONFIG } from './config/cors.config.js';
import apiRouter from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';
import { HTTP_STATUS } from './utils/constants.js';

const app = express();

// 1. Secure HTTP Headers
app.use(helmet());

// 2. Setup CORS
app.use(cors(CORS_CONFIG));

// 3. Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Parse Cookie Headers (essential for HTTP-only refresh tokens)
app.use(cookieParser());

// 6. Mount main API routes
app.use('/api/v1', apiRouter);

// 7. General Server Health Check
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Backend server is healthy and running.',
    timestamp: new Date().toISOString()
  });
});

// 8. 404 Handler for undefined paths
app.all('*', (req, res, next) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found on this server.`, HTTP_STATUS.NOT_FOUND));
});

// 9. Centralized Error Handler Middleware
app.use(globalErrorHandler);

export default app;
