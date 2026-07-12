import './config/env.js';
import app from './app.js';
import pool from './config/db.config.js';

// Catch synchronous exceptions immediately
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down process...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish and verify MySQL connectivity
    const connection = await pool.getConnection();
    console.log('✔ Database connection established successfully.');
    connection.release();

    // 2. Start Express listener
    const server = app.listen(port, () => {
      console.log(`✔ Backend server listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
    });

    // Catch asynchronous promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down server...');
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('❌ Failed to establish database connection on boot:', error.message);
    process.exit(1);
  }
};

startServer();
