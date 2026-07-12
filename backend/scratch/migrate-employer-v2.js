import pool from '../src/config/db.config.js';

const ddlStatements = [
  `CREATE TABLE IF NOT EXISTS assessment_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      assessment_id INT NOT NULL,
      question_text TEXT NOT NULL,
      type ENUM('mcq', 'true_false', 'output', 'blank', 'coding') NOT NULL,
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      points INT DEFAULT 10,
      correct_answer TEXT NULL,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS assessment_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      option_text VARCHAR(255) NOT NULL,
      option_index INT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS assessment_results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      assessment_id INT NOT NULL,
      score INT NOT NULL,
      percentage DECIMAL(5,2) NOT NULL,
      time_taken_seconds INT NOT NULL,
      answers_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS project_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      project_id INT NOT NULL,
      employer_id INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comments TEXT NULL,
      status ENUM('excellent', 'good', 'needs_improvement', 'rejected') DEFAULT 'good',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS interview_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      interview_id INT NOT NULL,
      rating INT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS offer_letters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      job_id INT NOT NULL,
      employer_id INT NOT NULL,
      role VARCHAR(150) NOT NULL,
      salary_offered DECIMAL(15,2) NOT NULL,
      joining_date DATE NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      offer_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS rejection_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_id INT NOT NULL,
      reason VARCHAR(255) NOT NULL,
      improvements TEXT NULL,
      next_steps TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS candidate_rankings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      level ENUM('gold', 'silver', 'bronze', 'none') DEFAULT 'none',
      total_points INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

async function runMigration() {
  try {
    console.log('Starting Employer V2 migration...');
    for (const ddl of ddlStatements) {
      await pool.query(ddl);
    }
    console.log('✔ All Employer V2 tables created successfully.');
  } catch (error) {
    console.error('Employer V2 Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
