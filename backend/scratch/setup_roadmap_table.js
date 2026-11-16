import pool from '../src/config/db.config.js';

async function setup() {
  try {
    // Delete duplicate older entries
    await pool.query('DELETE c1 FROM career_roadmaps c1 INNER JOIN career_roadmaps c2 WHERE c1.id < c2.id AND c1.student_id = c2.student_id');
    
    // Check if unique index exists
    const [indexes] = await pool.query("SHOW INDEX FROM career_roadmaps WHERE Key_name = 'uniq_student_id'");
    if (indexes.length === 0) {
      await pool.query('ALTER TABLE career_roadmaps ADD UNIQUE KEY uniq_student_id (student_id)');
      console.log('Added UNIQUE KEY uniq_student_id to career_roadmaps');
    } else {
      console.log('UNIQUE KEY already exists');
    }

    const [rows] = await pool.query('SELECT id, student_id, career_goal, progress_percent FROM career_roadmaps');
    console.log('Cleaned career_roadmaps:', rows);
  } catch (err) {
    console.error('Setup error:', err);
  }
  process.exit(0);
}

setup();
