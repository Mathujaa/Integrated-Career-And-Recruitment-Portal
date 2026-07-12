import pool from '../src/config/db.config.js';

async function seedEvents() {
  try {
    console.log('Seeding mock V2 events...');
    
    // 1. Get first student
    const [students] = await pool.query('SELECT * FROM students LIMIT 1');
    if (students.length === 0) {
      console.log('⚠ No student registered in database. Register a student first.');
      process.exit(0);
    }
    const student = students[0];
    const studentId = student.id;
    const userId = student.id; // 1-to-1 mapping where student.id is user_id

    // 2. Get first active job
    const [jobs] = await pool.query('SELECT * FROM jobs LIMIT 1');
    if (jobs.length === 0) {
      console.log('⚠ No jobs in database.');
      process.exit(0);
    }
    const job = jobs[0];
    const jobId = job.id;

    // 3. Insert mock application if not exists
    await pool.query(
      `INSERT INTO applications (student_id, job_id, status, cover_letter) 
       VALUES (?, ?, 'shortlisted', 'I am very excited about this role!') 
       ON DUPLICATE KEY UPDATE status = 'shortlisted'`,
      [studentId, jobId]
    );

    // 4. Insert mock interview scheduled for July 15, 2026
    await pool.query(
      `INSERT INTO interviews (student_id, job_id, interview_date, mode, location_link, notes, status) 
       VALUES (?, ?, '2026-07-15 14:00:00', 'online', 'https://meet.google.com/abc-xyz', 'Technical round with engineering lead.', 'scheduled')`,
      [studentId, jobId]
    );
    console.log('✔ Seeded 1 mock scheduled interview.');

    // 5. Insert mock notifications
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, category, is_read) VALUES 
      (?, 'Interview Scheduled', 'Your interview for Frontend Software Engineer has been scheduled for July 15, 2026 at 2:00 PM.', 'interviews', FALSE),
      (?, 'React Core Assessment Available', 'Take the React Core Skill Assessment now to display a certified badge on your profile.', 'assessments', FALSE),
      (?, 'Welcome to V2 Portal Upgrade!', 'Discover roadmaps, scanner reviews, and settings integrations on your dashboard.', 'system', TRUE)`,
      [userId, userId, userId]
    );
    console.log('✔ Seeded 3 mock unread notifications.');

  } catch (error) {
    console.error('Failed to seed V2 events:', error.message);
  } finally {
    process.exit(0);
  }
}

seedEvents();
