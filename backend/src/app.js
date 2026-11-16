import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { CORS_CONFIG } from './config/cors.config.js';
import apiRouter from './routes/index.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import AppError from './utils/AppError.js';
import { HTTP_STATUS } from './utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Secure HTTP Headers with Cross-Origin Resource Policy for image assets
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Setup CORS
app.use(cors(CORS_CONFIG));

// 3. Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request Body Parsers (allow up to 10mb for image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Static file serving for user uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 6. Parse Cookie Headers (essential for HTTP-only refresh tokens)
app.use(cookieParser());

// 7. Mount main API routes
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
