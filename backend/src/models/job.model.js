import pool from '../config/db.config.js';

class JobModel {
  // Retrieve Job Listings
  async getJobs(filters = {}) {
    let sql = "SELECT * FROM jobs WHERE status = 'active'";
    const params = [];

    if (filters.keyword) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
      const keywordWildcard = `%${filters.keyword}%`;
      params.push(keywordWildcard, keywordWildcard, keywordWildcard);
    }

    if (filters.location) {
      sql += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.employment_type) {
      sql += ' AND employment_type = ?';
      params.push(filters.employment_type);
    }

    if (filters.work_mode) {
      sql += ' AND work_mode = ?';
      params.push(filters.work_mode);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async getJobById(id) {
    const [rows] = await pool.execute('SELECT * FROM jobs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  // Saved Jobs
  async saveJob(studentId, jobId) {
    await pool.execute(
      'INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE saved_at = CURRENT_TIMESTAMP',
      [studentId, jobId]
    );
  }

  async unsaveJob(studentId, jobId) {
    await pool.execute('DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?', [studentId, jobId]);
  }

  async getSavedJobs(studentId) {
    const [rows] = await pool.execute(
      `SELECT j.*, sj.saved_at 
       FROM jobs j
       JOIN saved_jobs sj ON j.id = sj.job_id 
       WHERE sj.student_id = ? 
       ORDER BY sj.saved_at DESC`,
      [studentId]
    );
    return rows;
  }

  async isJobSaved(studentId, jobId) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM saved_jobs WHERE student_id = ? AND job_id = ? LIMIT 1',
      [studentId, jobId]
    );
    return rows.length > 0;
  }

  // Applications
  async applyJob(studentId, jobId, resumeId, coverLetter) {
    await pool.execute(
      'INSERT INTO applications (student_id, job_id, resume_id, cover_letter, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, jobId, resumeId || null, coverLetter || null, 'submitted']
    );
  }

  async getApplications(studentId) {
    const [rows] = await pool.execute(
      `SELECT a.id as application_id, a.status as application_status, a.cover_letter, a.created_at as applied_at, j.* 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [studentId]
    );
    return rows;
  }

  async isJobApplied(studentId, jobId) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM applications WHERE student_id = ? AND job_id = ? LIMIT 1',
      [studentId, jobId]
    );
    return rows.length > 0;
  }

  // Resumes
  async getResumes(studentId) {
    const [rows] = await pool.execute('SELECT * FROM resumes WHERE student_id = ? ORDER BY updated_at DESC', [studentId]);
    return rows;
  }

  async getResumeById(studentId, resumeId) {
    const [rows] = await pool.execute('SELECT * FROM resumes WHERE id = ? AND student_id = ? LIMIT 1', [resumeId, studentId]);
    return rows[0] || null;
  }

  async createResume(studentId, data) {
    const [result] = await pool.execute(
      'INSERT INTO resumes (student_id, title, template_name, resume_data) VALUES (?, ?, ?, ?)',
      [studentId, data.title || 'My Resume', data.template_name || 'classic', JSON.stringify(data.resume_data || {})]
    );
    return result.insertId;
  }

  async updateResume(studentId, resumeId, data) {
    await pool.execute(
      'UPDATE resumes SET title = ?, template_name = ?, resume_data = ? WHERE id = ? AND student_id = ?',
      [data.title, data.template_name, JSON.stringify(data.resume_data), resumeId, studentId]
    );
  }

  async deleteResume(studentId, resumeId) {
    await pool.execute('DELETE FROM resumes WHERE id = ? AND student_id = ?', [resumeId, studentId]);
  }
}

export default new JobModel();
