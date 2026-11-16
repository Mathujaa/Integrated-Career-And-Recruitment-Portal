import pool from '../src/config/db.config.js';

async function migrateUsers() {
  try {
    const [cols] = await pool.query('DESCRIBE users');
    const names = cols.map(c => c.Field);
    if (!names.includes('google_id')) {
      await pool.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL AFTER email');
      console.log('Added google_id column');
    }
    if (!names.includes('auth_provider')) {
      await pool.query("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local' AFTER status");
      console.log('Added auth_provider column');
    }
    console.log('✔ Users migration complete.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

migrateUsers();
