import pool from '../src/config/db.config.js';

const ddlStatements = [
  `CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      INDEX idx_skills_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS student_skills (
      student_id INT NOT NULL,
      skill_id INT NOT NULL,
      proficiency_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
      PRIMARY KEY (student_id, skill_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS educations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      institution_name VARCHAR(150) NOT NULL,
      degree VARCHAR(100) NOT NULL,
      field_of_study VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      grade_gpa VARCHAR(20) NULL,
      description TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS experiences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      company_name VARCHAR(150) NOT NULL,
      job_title VARCHAR(100) NOT NULL,
      location VARCHAR(150) NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      is_current BOOLEAN DEFAULT FALSE,
      description TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS certifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      certification_name VARCHAR(150) NOT NULL,
      issuing_organization VARCHAR(150) NOT NULL,
      issue_date DATE NULL,
      expiration_date DATE NULL,
      credential_id VARCHAR(100) NULL,
      credential_url VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employer_id INT NULL,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      location VARCHAR(150) NOT NULL,
      employment_type ENUM('full-time', 'part-time', 'contract', 'internship') NOT NULL,
      work_mode ENUM('on-site', 'hybrid', 'remote') NOT NULL,
      salary_min DECIMAL(12, 2) NULL,
      salary_max DECIMAL(12, 2) NULL,
      status ENUM('draft', 'active', 'closed', 'flagged') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_jobs_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS saved_jobs (
      student_id INT NOT NULL,
      job_id INT NOT NULL,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, job_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS resumes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      title VARCHAR(100) DEFAULT 'My Resume',
      template_name VARCHAR(50) DEFAULT 'classic',
      resume_data JSON NOT NULL,
      version INT DEFAULT 1,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      job_id INT NOT NULL,
      resume_id INT NULL,
      status ENUM('submitted', 'under_review', 'shortlisted', 'rejected', 'offered', 'hired') DEFAULT 'submitted',
      cover_letter TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_job (student_id, job_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
      INDEX idx_app_student (student_id),
      INDEX idx_app_job (job_id),
      INDEX idx_app_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

async function runMigration() {
  try {
    console.log('Starting migration...');
    for (const ddl of ddlStatements) {
      await pool.query(ddl);
    }
    console.log('✔ All Student and Job tables created successfully.');

    // Insert dummy jobs if there are none
    const [jobs] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    if (jobs[0].count === 0) {
      await pool.query(
        `INSERT INTO jobs (title, description, requirements, location, employment_type, work_mode, salary_min, salary_max, status) VALUES 
        ('Frontend Software Engineer', 'We are looking for a React developer to build responsive web apps.', 'React, JavaScript, HTML, CSS, Axios', 'Bangalore, India', 'full-time', 'hybrid', 600000.00, 1200000.00, 'active'),
        ('Backend NodeJS Engineer', 'Build highly scalable REST APIs using Node.js, Express, and MySQL.', 'NodeJS, Express, MySQL, REST APIs, Git', 'Remote, India', 'full-time', 'remote', 800000.00, 1500000.00, 'active'),
        ('Product Design Intern', 'Learn product design and draft Figma mockups with product managers.', 'Figma, UX/UI Research, Wireframing, Communication', 'Mumbai, India', 'internship', 'on-site', 15000.00, 30000.00, 'active'),
        ('Full Stack Software Developer', 'Work on client-side React and server-side NodeJS systems.', 'React, Node, MySQL, AWS, Javascript', 'Hyderabad, India', 'full-time', 'hybrid', 900000.00, 1800000.00, 'active')`
      );
      console.log('✔ Seeded 4 dummy job listings.');
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
