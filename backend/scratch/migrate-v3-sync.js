import pool from '../src/config/db.config.js';

const sqlStatements = [
  {
    desc: 'Alter jobs status enum',
    query: `ALTER TABLE jobs MODIFY COLUMN status ENUM('draft', 'active', 'closed', 'flagged') DEFAULT 'draft';`
  },
  {
    desc: 'Create offers table',
    query: `CREATE TABLE IF NOT EXISTS offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        job_id INT NOT NULL,
        employer_id INT NOT NULL,
        role VARCHAR(150) NOT NULL,
        salary DECIMAL(15,2) NOT NULL,
        joining_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
        offer_letter_url VARCHAR(255) NULL,
        offer_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    desc: 'Create offer_status_history table',
    query: `CREATE TABLE IF NOT EXISTS offer_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        offer_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'expired') NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    desc: 'Create assessment_results table',
    query: `CREATE TABLE IF NOT EXISTS assessment_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        assessment_id INT NOT NULL,
        score INT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        time_taken_seconds INT NOT NULL,
        answers_json JSON NOT NULL,
        status ENUM('pass', 'fail') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  },
  {
    desc: 'Add job_id to assessments',
    query: `ALTER TABLE assessments ADD COLUMN job_id INT NULL;`
  },
  {
    desc: 'Add passing_score to assessments',
    query: `ALTER TABLE assessments ADD COLUMN passing_score INT DEFAULT 50;`
  },
  {
    desc: 'Add attempts_allowed to assessments',
    query: `ALTER TABLE assessments ADD COLUMN attempts_allowed INT DEFAULT 1;`
  },
  {
    desc: 'Add publish_date to assessments',
    query: `ALTER TABLE assessments ADD COLUMN publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`
  },
  {
    desc: 'Add fk_assessments_jobs constraint',
    query: `ALTER TABLE assessments ADD CONSTRAINT fk_assessments_jobs FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;`
  }
];

async function alignDatabase() {
  console.log('Aligning database tables to precise Milestone 4 specs...');
  for (const item of sqlStatements) {
    try {
      await pool.query(item.query);
      console.log(`✔ [Success] ${item.desc}`);
    } catch (err) {
      // Column/Constraint might already exist - log it and continue
      if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_FK_DUP_NAME' || err.message.includes('Multiple primary key') || err.message.includes('already exists')) {
        console.log(`ℹ [Skipped] ${item.desc} (Already configured)`);
      } else {
        console.warn(`⚠ [Error] ${item.desc}: ${err.message}`);
      }
    }
  }
  console.log('Database alignment execution finished.');
  process.exit(0);
}

alignDatabase();
