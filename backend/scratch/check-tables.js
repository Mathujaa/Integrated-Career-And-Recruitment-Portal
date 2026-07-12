import pool from '../src/config/db.config.js';

async function testConnection() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', rows);
  } catch (error) {
    console.error('Error listing tables:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
