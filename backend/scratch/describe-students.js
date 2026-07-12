import pool from '../src/config/db.config.js';

async function describeTable() {
  try {
    const [cols] = await pool.query('DESCRIBE students');
    console.log('Columns in students:', cols);
    const [users] = await pool.query('SELECT * FROM users LIMIT 1');
    console.log('First user:', users[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

describeTable();
