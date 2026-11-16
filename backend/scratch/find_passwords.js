import pool from '../src/config/db.config.js';
import bcrypt from 'bcryptjs';

async function check() {
  const [users] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', ['majaa@infosys.com']);
  console.log('majaa:', users[0]);
  const candidates = ['Admin@123', 'Password123!', 'Mathujaa@03', 'Mathuja@03', 'Recruiter@123', 'Infosys@123', 'majaa@123', 'Majaa@123', 'password', 'Majaa@03'];
  for (const c of candidates) {
    if (await bcrypt.compare(c, users[0].password_hash)) {
      console.log('MATCH:', c);
    }
  }
  process.exit(0);
}
check();
