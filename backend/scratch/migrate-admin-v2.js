import '../src/config/env.js';
import pool from '../src/config/db.config.js';

const migrations = [
  {
    desc: 'Add status column to assessment_results (pass/fail)',
    query: `ALTER TABLE assessment_results ADD COLUMN status ENUM('pass','fail') DEFAULT 'fail';`
  },
  {
    desc: 'Backfill assessment_results.status from percentage and passing_score',
    query: `UPDATE assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            SET ar.status = IF(ar.percentage >= a.passing_score, 'pass', 'fail');`
  },
  {
    desc: 'Add cancelled status to interviews',
    query: `ALTER TABLE interviews MODIFY COLUMN status ENUM('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled';`
  },
  {
    desc: 'Add admin_notifications table for admin-specific alerts',
    query: `CREATE TABLE IF NOT EXISTS admin_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  }
];

async function runMigration() {
  console.log('Running Admin Integration Migration...');
  for (const m of migrations) {
    try {
      await pool.query(m.query);
      console.log(`✔ ${m.desc}`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('already exists') || err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`ℹ Skipped (already done): ${m.desc}`);
      } else {
        console.warn(`⚠ ${m.desc}: ${err.message}`);
      }
    }
  }
  console.log('Migration complete.');
  process.exit(0);
}

runMigration();
