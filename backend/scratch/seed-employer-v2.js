import pool from '../src/config/db.config.js';
import bcrypt from 'bcryptjs';

async function seedEmployerV2() {
  try {
    console.log('Seeding Employer V2 tables...');

    // 1. Check if an employer user exists, otherwise create one
    let employerUserId = null;
    const [employers] = await pool.query("SELECT * FROM users WHERE role = 'employer' LIMIT 1");
    
    if (employers.length > 0) {
      employerUserId = employers[0].id;
      console.log(`Found existing employer user (ID: ${employerUserId})`);
    } else {
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const [insertUser] = await pool.query(
        "INSERT INTO users (email, password_hash, role, is_verified, status) VALUES ('recruiter@techcorp.com', ?, 'employer', 1, 'active')",
        [passwordHash]
      );
      employerUserId = insertUser.insertId;
      console.log(`Created new recruiter user (ID: ${employerUserId})`);

      // Create profile in employers table
      await pool.query(
        "INSERT INTO employers (id, company_name, contact_phone, website) VALUES (?, 'TechCorp Solutions', '9876543210', 'https://techcorp.com') ON DUPLICATE KEY UPDATE company_name='TechCorp Solutions'",
        [employerUserId]
      );
      console.log('Created TechCorp profile.');
    }

    // 2. Fetch first student and first job
    const [students] = await pool.query('SELECT * FROM students LIMIT 1');
    const student = students[0];
    if (!student) {
      console.log('⚠ No student registered. Please sign up a student first to run integrations seeding.');
      process.exit(0);
    }
    const studentId = student.id;

    const [jobs] = await pool.query('SELECT * FROM jobs LIMIT 1');
    const job = jobs[0];
    if (!job) {
      console.log('⚠ No jobs registered.');
      process.exit(0);
    }
    const jobId = job.id;

    // 3. Seed assessment questions for React Core (assessment_id = 1)
    const [existingQuestions] = await pool.query('SELECT COUNT(*) as count FROM assessment_questions WHERE assessment_id = 1');
    if (existingQuestions[0].count === 0) {
      // Question 1: MCQ
      const [q1] = await pool.query(
        `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
         VALUES (1, 'Which hook is used to handle side-effects in a React component?', 'mcq', 'easy', 10, '1')`
      );
      const q1Id = q1.insertId;
      await pool.query(
        `INSERT INTO assessment_options (question_id, option_text, option_index) VALUES 
        (?, 'useState', 0),
        (?, 'useEffect', 1),
        (?, 'useContext', 2),
        (?, 'useMemo', 3)`,
        [q1Id, q1Id, q1Id, q1Id]
      );

      // Question 2: True/False
      await pool.query(
        `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
         VALUES (1, 'React components must always start with a capital letter.', 'true_false', 'easy', 10, 'true')`
      );

      // Question 3: Blank
      await pool.query(
        `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
         VALUES (1, 'The function to update state in [count, setCount] = useState(0) is named ______.', 'blank', 'easy', 10, 'setCount')`
      );

      // Question 4: Output
      await pool.query(
        `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
         VALUES (1, 'What is the output? console.log(typeof React);', 'output', 'medium', 10, 'object')`
      );

      // Question 5: Coding
      await pool.query(
        `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
         VALUES (1, 'Write a JavaScript function "sum(a, b)" that returns their sum.', 'coding', 'medium', 20, 'function sum(a, b) { return a + b; }')`
      );

      console.log('✔ Seeded 5 assessment questions and MCQ options for React Core.');
    }

    // 4. Seed mock project reviews for student 1 (if they have a project, otherwise insert a mock project first)
    let projectId = null;
    const [projs] = await pool.query('SELECT * FROM projects WHERE student_id = ? LIMIT 1', [studentId]);
    if (projs.length > 0) {
      projectId = projs[0].id;
    } else {
      const [insertProj] = await pool.query(
        `INSERT INTO projects (student_id, title, role, description, link) 
         VALUES (?, 'Responsive E-Commerce Platform', 'Lead Developer', 'Build modular shopping cart grids with HSL dynamic colors.', 'https://github.com/mathu/ecom')`,
        [studentId]
      );
      projectId = insertProj.insertId;
      console.log('✔ Created mock project to review.');
    }

    await pool.query(
      `INSERT INTO project_reviews (student_id, project_id, employer_id, rating, comments, status) 
       VALUES (?, ?, ?, 5, 'Highly responsive layout and excellent use of CSS custom properties. Code is clean and modular!', 'excellent') 
       ON DUPLICATE KEY UPDATE rating=5, comments='Excellent layout!'`,
      [studentId, projectId, employerUserId]
    );
    console.log('✔ Seeded 1 mock project review.');

    // 5. Seed Candidate Rankings
    await pool.query(
      `INSERT INTO candidate_rankings (student_id, level, total_points) 
       VALUES (?, 'gold', 920) 
       ON DUPLICATE KEY UPDATE level='gold', total_points=920`,
      [studentId]
    );
    console.log('✔ Seeded gold tier candidate ranking.');

    // 6. Seed mock offer letter
    await pool.query(
      `INSERT INTO offer_letters (student_id, job_id, employer_id, role, salary_offered, joining_date, status, offer_text) 
       VALUES (?, ?, ?, 'Frontend Software Engineer', 1200000.00, '2026-08-01', 'pending', 'We are delighted to extend our official offer for the Frontend Developer position at TechCorp. Salary: INR 12,00,000 per annum. Joining Date: August 1, 2026.')`,
      [studentId, jobId, employerUserId]
    );
    console.log('✔ Seeded 1 mock pending offer letter.');

  } catch (error) {
    console.error('Failed to seed Employer V2 database:', error.message);
  } finally {
    process.exit(0);
  }
}

seedEmployerV2();
