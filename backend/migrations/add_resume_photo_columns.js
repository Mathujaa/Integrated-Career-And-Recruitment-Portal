import pool from '../src/config/db.config.js';

async function migrateResumes() {
  try {
    const [cols] = await pool.query('DESCRIBE resumes');
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('resume_photo_url')) {
      await pool.query('ALTER TABLE resumes ADD COLUMN resume_photo_url VARCHAR(500) NULL AFTER template_name');
      console.log('Added resume_photo_url column');
    }
    if (!colNames.includes('resume_photo_source')) {
      await pool.query("ALTER TABLE resumes ADD COLUMN resume_photo_source VARCHAR(20) DEFAULT 'profile' AFTER resume_photo_url");
      console.log('Added resume_photo_source column');
    }
    if (!colNames.includes('include_photo')) {
      await pool.query('ALTER TABLE resumes ADD COLUMN include_photo BOOLEAN DEFAULT TRUE AFTER resume_photo_source');
      console.log('Added include_photo column');
    }
    console.log('✔ Resumes schema migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrateResumes();
