import pool from '../src/config/db.config.js';

const ddlStatements = [
  `CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      role VARCHAR(100) NULL,
      description TEXT NULL,
      link VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS languages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS student_languages (
      student_id INT NOT NULL,
      language_id INT NOT NULL,
      proficiency ENUM('elementary', 'limited', 'professional', 'full', 'native') DEFAULT 'professional',
      PRIMARY KEY (student_id, language_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS achievements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      description TEXT NULL,
      date_earned DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS interviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      job_id INT NOT NULL,
      interview_date DATETIME NOT NULL,
      mode ENUM('online', 'face-to-face') DEFAULT 'online',
      location_link VARCHAR(255) NULL,
      notes TEXT NULL,
      status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      category ENUM('jobs', 'interviews', 'assessments', 'system') DEFAULT 'system',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS assessments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      duration_minutes INT DEFAULT 30,
      total_questions INT DEFAULT 10
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS student_assessments (
      student_id INT NOT NULL,
      assessment_id INT NOT NULL,
      score INT NOT NULL,
      status ENUM('completed', 'failed') DEFAULT 'completed',
      taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, assessment_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS career_roadmaps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      career_goal VARCHAR(150) NOT NULL,
      progress_percent INT DEFAULT 0,
      roadmap_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

async function runMigration() {
  try {
    console.log('Starting V2 migration...');
    for (const ddl of ddlStatements) {
      await pool.query(ddl);
    }
    console.log('✔ All V2 Database tables created successfully.');

    // Seed master languages
    const [languages] = await pool.query('SELECT COUNT(*) as count FROM languages');
    if (languages[0].count === 0) {
      await pool.query(
        `INSERT INTO languages (name) VALUES 
        ('English'), ('Hindi'), ('Spanish'), ('German'), ('Mandarin'), ('French')`
      );
      console.log('✔ Seeded languages master list.');
    }

    // Seed master assessments
    const [assessments] = await pool.query('SELECT COUNT(*) as count FROM assessments');
    if (assessments[0].count === 0) {
      await pool.query(
        `INSERT INTO assessments (title, category, duration_minutes, total_questions) VALUES 
        ('React Core Assessment', 'Frontend Development', 20, 10),
        ('NodeJS & Express Essentials', 'Backend Development', 25, 10),
        ('SQL Queries & Database Tuning', 'Databases', 30, 15),
        ('Python Data Structure Basics', 'General Programming', 20, 10)`
      );
      console.log('✔ Seeded master assessments.');
    }
  } catch (error) {
    console.error('V2 Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
