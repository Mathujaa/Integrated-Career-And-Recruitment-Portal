import pool from '../src/config/db.config.js';

const sqlStatements = [
  // 1. Add status to employers table
  {
    desc: 'Add status column to employers table',
    query: `ALTER TABLE employers ADD COLUMN status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending';`
  },
  // 2. Add detailed feedback columns to project_reviews
  {
    desc: 'Add code_quality to project_reviews',
    query: `ALTER TABLE project_reviews ADD COLUMN code_quality INT DEFAULT 5;`
  },
  {
    desc: 'Add ui_design to project_reviews',
    query: `ALTER TABLE project_reviews ADD COLUMN ui_design INT DEFAULT 5;`
  },
  {
    desc: 'Add documentation to project_reviews',
    query: `ALTER TABLE project_reviews ADD COLUMN documentation INT DEFAULT 5;`
  },
  {
    desc: 'Add innovation to project_reviews',
    query: `ALTER TABLE project_reviews ADD COLUMN innovation INT DEFAULT 5;`
  },
  {
    desc: 'Add suggestions to project_reviews',
    query: `ALTER TABLE project_reviews ADD COLUMN suggestions TEXT NULL;`
  },
  // 3. Add detailed feedback columns to rejection_feedback
  {
    desc: 'Add skills_to_improve to rejection_feedback',
    query: `ALTER TABLE rejection_feedback ADD COLUMN skills_to_improve TEXT NULL;`
  },
  {
    desc: 'Add technical_weaknesses to rejection_feedback',
    query: `ALTER TABLE rejection_feedback ADD COLUMN technical_weaknesses TEXT NULL;`
  },
  {
    desc: 'Add communication_remarks to rejection_feedback',
    query: `ALTER TABLE rejection_feedback ADD COLUMN communication_remarks TEXT NULL;`
  },
  {
    desc: 'Add suggestions to rejection_feedback',
    query: `ALTER TABLE rejection_feedback ADD COLUMN suggestions TEXT NULL;`
  },
  // 4. Add location to offers
  {
    desc: 'Add location to offers table',
    query: `ALTER TABLE offers ADD COLUMN location VARCHAR(150) DEFAULT 'Remote';`
  },
  // 5. Update pre-existing recruiters to approved status for compatibility
  {
    desc: 'Set pre-existing recruiters to approved',
    query: `UPDATE employers SET status = 'approved';`
  }
];

async function runAdminMigration() {
  console.log('Running Admin Portal DDL Migration...');
  for (const item of sqlStatements) {
    try {
      await pool.query(item.query);
      console.log(`✔ [Success] ${item.desc}`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_FK_DUP_NAME' || err.message.includes('already exists')) {
        console.log(`ℹ [Skipped] ${item.desc} (Already configured)`);
      } else {
        console.warn(`⚠ [Error] ${item.desc}: ${err.message}`);
      }
    }
  }
  console.log('Admin migration execution finished.');
  process.exit(0);
}

runAdminMigration();
