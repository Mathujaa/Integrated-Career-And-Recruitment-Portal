import '../src/config/env.js';
import pool from '../src/config/db.config.js';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@careerportal.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_FULL_NAME = 'System Administrator';

async function seedAdmin() {
  console.log('🔧 Seeding Admin account...');

  try {
    // Check if admin already exists
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND role = 'admin'",
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      const adminId = existing[0].id;
      // Make sure admins profile row also exists
      const [adminProfile] = await pool.execute('SELECT id FROM admins WHERE id = ?', [adminId]);
      if (adminProfile.length === 0) {
        await pool.execute(
          'INSERT INTO admins (id, full_name) VALUES (?, ?)',
          [adminId, ADMIN_FULL_NAME]
        );
        console.log('ℹ Admin profile row inserted.');
      }
      console.log('ℹ Admin account already exists. Skipping seed.');
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert into users table (is_verified=1 so no email verification required)
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, role, is_verified, status, created_at, updated_at)
       VALUES (?, ?, 'admin', 1, 'active', NOW(), NOW())`,
      [ADMIN_EMAIL, passwordHash]
    );

    const adminId = result.insertId;

    // Insert into admins profile table
    await pool.execute(
      'INSERT INTO admins (id, full_name) VALUES (?, ?)',
      [adminId, ADMIN_FULL_NAME]
    );

    console.log('✔ Admin account created successfully!');
    console.log(`  Email   : ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role    : admin`);
    console.log('');
    console.log('Go to /login and sign in with the above credentials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin account:', err.message);
    process.exit(1);
  }
}

seedAdmin();
