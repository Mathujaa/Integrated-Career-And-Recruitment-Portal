import './env.js';

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173'
];

export const CORS_CONFIG = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, postman, or local tests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
