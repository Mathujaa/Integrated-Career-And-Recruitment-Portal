import pool from '../config/db.config.js';

class AdminModel {

  // ─────────────────────────────────────────────
  // 1. DASHBOARD STATS
  // ─────────────────────────────────────────────
  async getDashboardStats() {
    const safe = (rows, key) => parseInt(rows[0]?.[key] || 0, 10);
    const safeFloat = (rows, key) => parseFloat(rows[0]?.[key] || 0);

    const [students]       = await pool.query('SELECT COUNT(*) as count FROM students');
    const [recruiters]     = await pool.query('SELECT COUNT(*) as count FROM employers');
    const [activeJobs]     = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'");
    const [applications]   = await pool.query('SELECT COUNT(*) as count FROM applications');
    const [shortlisted]    = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'shortlisted'");
    const [interviews]     = await pool.query("SELECT COUNT(*) as count FROM interviews WHERE status = 'scheduled'");
    const [offersSent]     = await pool.query('SELECT COUNT(*) as count FROM offers');
    const [offersAccepted] = await pool.query("SELECT COUNT(*) as count FROM offers WHERE status = 'accepted'");
    const [placedCount]    = await pool.query("SELECT COUNT(DISTINCT student_id) as count FROM offers WHERE status = 'accepted'");

    const totalStudents = safe(students, 'count');
    const totalPlaced   = safe(placedCount, 'count');
    const placementPercent = totalStudents > 0
      ? Math.round((totalPlaced / totalStudents) * 100)
      : 0;

    const [monthlyApps] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%b %Y') as name, COUNT(*) as value
       FROM applications
       GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b %Y')
       ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
       LIMIT 12`
    );

    const [companyPlacements] = await pool.query(
      `SELECT e.company_name as name, COUNT(o.id) as value
       FROM offers o
       JOIN employers e ON o.employer_id = e.id
       WHERE o.status = 'accepted'
       GROUP BY e.id, e.company_name
       ORDER BY value DESC
       LIMIT 8`
    );

    const [deptPlacements] = await pool.query(
      `SELECT COALESCE(edu.field_of_study, 'General') as name, COUNT(DISTINCT o.student_id) as value
       FROM offers o
       JOIN educations edu ON o.student_id = edu.student_id
       WHERE o.status = 'accepted'
       GROUP BY edu.field_of_study
       ORDER BY value DESC
       LIMIT 8`
    );

    const [salaryStats] = await pool.query(
      `SELECT MAX(salary) as highest, AVG(salary) as average
       FROM offers WHERE status = 'accepted'`
    );

    const totalOffers   = safe(offersSent, 'count');
    const acceptedOffers = safe(offersAccepted, 'count');
    const offerAcceptRate = totalOffers > 0
      ? Math.round((acceptedOffers / totalOffers) * 100)
      : 0;

    return {
      counts: {
        totalStudents,
        totalRecruiters: safe(recruiters, 'count'),
        activeJobs:      safe(activeJobs, 'count'),
        applications:    safe(applications, 'count'),
        shortlisted:     safe(shortlisted, 'count'),
        interviews:      safe(interviews, 'count'),
        offersSent:      totalOffers,
        offersAccepted:  acceptedOffers,
        placementPercent
      },
      charts: {
        applicationsPerMonth: monthlyApps,
        companyPlacements,
        departmentPlacements: deptPlacements,
        highestPackage:  safeFloat(salaryStats, 'highest'),
        averagePackage:  safeFloat(salaryStats, 'average'),
        offerAcceptRate,
        // For donut chart
        offerBreakdown: [
          { name: 'Accepted', value: acceptedOffers },
          { name: 'Pending',  value: Math.max(0, totalOffers - acceptedOffers - safe(offersAccepted, 'count')) },
          { name: 'Declined', value: 0 }
        ]
      }
    };
  }

  // ─────────────────────────────────────────────
  // 2. STUDENT MANAGEMENT
  // ─────────────────────────────────────────────
  async getStudentsList({ search = '', page = 1, limit = 20 } = {}) {
    const safeLimit  = parseInt(limit, 10);
    const safeOffset = (parseInt(page, 10) - 1) * safeLimit;
    const searchParam = `%${search}%`;

    const [rows] = await pool.execute(
      `SELECT s.id, s.first_name, s.last_name, u.email, u.status, s.phone, s.headline, s.created_at
       FROM students s
       JOIN users u ON s.id = u.id
       WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?)
       ORDER BY s.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [searchParam, searchParam, searchParam]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM students s JOIN users u ON s.id = u.id
       WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?)`,
      [searchParam, searchParam, searchParam]
    );

    return { rows, total, page, limit };
  }

  async getStudentDetails(studentId) {
    const [profile] = await pool.execute(
      `SELECT s.*, u.email, u.status FROM students s
       JOIN users u ON s.id = u.id WHERE s.id = ?`,
      [studentId]
    );
    if (profile.length === 0) return null;

    const [projects]       = await pool.execute('SELECT * FROM projects WHERE student_id = ?', [studentId]);
    const [educations]     = await pool.execute('SELECT * FROM educations WHERE student_id = ?', [studentId]);
    const [experiences]    = await pool.execute('SELECT * FROM experiences WHERE student_id = ?', [studentId]);
    const [certifications] = await pool.execute('SELECT * FROM certifications WHERE student_id = ?', [studentId]);
    const [resumes]        = await pool.execute(
      'SELECT id, title, created_at FROM resumes WHERE student_id = ? ORDER BY created_at DESC LIMIT 5',
      [studentId]
    );

    const [skills] = await pool.execute(
      `SELECT s.name, ss.proficiency_level
       FROM student_skills ss JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    const [scores] = await pool.execute(
      `SELECT ar.id, ar.score, ar.percentage, ar.status, ar.time_taken_seconds, ar.created_at,
              a.title as assessment_title, a.category, a.passing_score
       FROM assessment_results ar
       JOIN assessments a ON ar.assessment_id = a.id
       WHERE ar.student_id = ?
       ORDER BY ar.created_at DESC`,
      [studentId]
    );

    const [apps] = await pool.execute(
      `SELECT a.id, a.status, a.created_at as applied_at, j.title as job_title, e.company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [studentId]
    );

    const [interviewsList] = await pool.execute(
      `SELECT i.*, j.title as job_title, e.company_name
       FROM interviews i
       JOIN jobs j ON i.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       WHERE i.student_id = ?
       ORDER BY i.interview_date DESC`,
      [studentId]
    );

    const [offers] = await pool.execute(
      `SELECT o.*, e.company_name
       FROM offers o JOIN employers e ON o.employer_id = e.id
       WHERE o.student_id = ?
       ORDER BY o.created_at DESC`,
      [studentId]
    );

    return {
      profile: profile[0],
      projects, educations, experiences, certifications, resumes,
      skills, assessmentScores: scores, applications: apps,
      interviews: interviewsList, offers
    };
  }

  async updateStudentStatus(studentId, status) {
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, studentId]);
  }

  async deleteStudent(studentId) {
    await pool.execute('DELETE FROM users WHERE id = ?', [studentId]);
  }

  // ─────────────────────────────────────────────
  // 3. RECRUITER MANAGEMENT
  // ─────────────────────────────────────────────
  async getRecruitersList({ search = '', statusFilter = 'all', page = 1, limit = 20 } = {}) {
    const safeLimit  = parseInt(limit, 10);
    const safeOffset = (parseInt(page, 10) - 1) * safeLimit;
    const searchParam = `%${search}%`;

    let statusClause = '';
    const params = [searchParam, searchParam, searchParam];
    if (statusFilter !== 'all') {
      statusClause = 'AND e.status = ?';
      params.push(statusFilter);
    }

    const [rows] = await pool.execute(
      `SELECT e.id, e.company_name, e.company_website, e.company_industry, e.status,
              u.email, e.created_at,
              COUNT(j.id) as jobs_count
       FROM employers e
       JOIN users u ON e.id = u.id
       LEFT JOIN jobs j ON j.employer_id = e.id
       WHERE (e.company_name LIKE ? OR e.company_industry LIKE ? OR u.email LIKE ?)
       ${statusClause}
       GROUP BY e.id
       ORDER BY e.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    const countParams = [searchParam, searchParam, searchParam];
    if (statusFilter !== 'all') countParams.push(statusFilter);

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM employers e JOIN users u ON e.id = u.id
       WHERE (e.company_name LIKE ? OR e.company_industry LIKE ? OR u.email LIKE ?)
       ${statusClause}`,
      countParams
    );

    return { rows, total, page, limit };
  }

  async getRecruiterDetails(employerId) {
    const [profile] = await pool.execute(
      `SELECT e.*, u.email, u.status as user_status
       FROM employers e JOIN users u ON e.id = u.id WHERE e.id = ?`,
      [employerId]
    );
    if (profile.length === 0) return null;

    const [jobs] = await pool.execute(
      `SELECT j.*, COUNT(a.id) as applicants_count
       FROM jobs j LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.employer_id = ?
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [employerId]
    );

    const [placements] = await pool.execute(
      `SELECT COUNT(*) as count FROM offers WHERE employer_id = ? AND status = 'accepted'`,
      [employerId]
    );

    return { profile: profile[0], jobs, placementsCount: placements[0]?.count || 0 };
  }

  async updateRecruiterStatus(employerId, status) {
    await pool.execute('UPDATE employers SET status = ? WHERE id = ?', [status, employerId]);
    if (status === 'suspended') {
      await pool.execute("UPDATE users SET status = 'suspended' WHERE id = ?", [employerId]);
    } else if (status === 'approved') {
      await pool.execute("UPDATE users SET status = 'active' WHERE id = ?", [employerId]);
    } else if (status === 'rejected') {
      await pool.execute("UPDATE users SET status = 'suspended' WHERE id = ?", [employerId]);
    }
  }

  async deleteRecruiter(employerId) {
    await pool.execute('DELETE FROM users WHERE id = ?', [employerId]);
  }

  // ─────────────────────────────────────────────
  // 4. JOB MANAGEMENT
  // ─────────────────────────────────────────────
  async getJobsList({ search = '', statusFilter = 'all', page = 1, limit = 25 } = {}) {
    const safeLimit  = parseInt(limit, 10);
    const safeOffset = (parseInt(page, 10) - 1) * safeLimit;
    const searchParam = `%${search}%`;

    let statusClause = '';
    const params = [searchParam, searchParam, searchParam];
    if (statusFilter !== 'all') {
      statusClause = 'AND j.status = ?';
      params.push(statusFilter);
    }

    const [rows] = await pool.execute(
      `SELECT j.*, e.company_name, COUNT(a.id) as applicants_count
       FROM jobs j
       LEFT JOIN employers e ON j.employer_id = e.id
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE (j.title LIKE ? OR COALESCE(e.company_name, '') LIKE ? OR j.location LIKE ?)
       ${statusClause}
       GROUP BY j.id
       ORDER BY j.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    return { rows };
  }

  async updateJobStatus(jobId, status) {
    await pool.execute('UPDATE jobs SET status = ? WHERE id = ?', [status, jobId]);
  }

  async updateJobDetails(jobId, data) {
    const { title, location, employment_type, work_mode, description, requirements } = data;
    await pool.execute(
      'UPDATE jobs SET title=?, location=?, employment_type=?, work_mode=?, description=?, requirements=? WHERE id=?',
      [title, location, employment_type, work_mode, description, requirements, jobId]
    );
  }

  async deleteJob(jobId) {
    await pool.execute('DELETE FROM jobs WHERE id = ?', [jobId]);
  }

  // ─────────────────────────────────────────────
  // 5. ASSESSMENT MANAGEMENT
  // ─────────────────────────────────────────────
  async getAssessmentsList() {
    const [rows] = await pool.execute(
      `SELECT a.*,
              COUNT(DISTINCT q.id) as questions_count,
              COUNT(DISTINCT ar.id) as attempts_count,
              ROUND(AVG(ar.percentage), 1) as avg_score
       FROM assessments a
       LEFT JOIN assessment_questions q ON a.id = q.assessment_id
       LEFT JOIN assessment_results ar ON a.id = ar.assessment_id
       GROUP BY a.id
       ORDER BY a.id DESC`
    );
    return rows;
  }

  async deleteAssessment(assessmentId) {
    await pool.execute('DELETE FROM assessment_results WHERE assessment_id = ?', [assessmentId]);
    await pool.execute('DELETE FROM assessment_options WHERE question_id IN (SELECT id FROM assessment_questions WHERE assessment_id = ?)', [assessmentId]);
    await pool.execute('DELETE FROM assessment_questions WHERE assessment_id = ?', [assessmentId]);
    await pool.execute('DELETE FROM assessments WHERE id = ?', [assessmentId]);
  }

  async getAssessmentResults(assessmentId) {
    const [rows] = await pool.execute(
      `SELECT ar.id, ar.score, ar.percentage, ar.status, ar.time_taken_seconds, ar.created_at,
              s.first_name, s.last_name, u.email,
              a.passing_score, a.title as assessment_title
       FROM assessment_results ar
       JOIN students s ON ar.student_id = s.id
       JOIN users u ON s.id = u.id
       JOIN assessments a ON ar.assessment_id = a.id
       WHERE ar.assessment_id = ?
       ORDER BY ar.percentage DESC, ar.score DESC`,
      [assessmentId]
    );
    // Recompute status in case column was added after existing rows
    return rows.map(r => ({
      ...r,
      status: r.percentage >= r.passing_score ? 'pass' : 'fail'
    }));
  }

  // ─────────────────────────────────────────────
  // 6. INTERVIEW MANAGEMENT
  // ─────────────────────────────────────────────
  async getInterviewsList({ statusFilter = 'all', search = '', page = 1, limit = 25 } = {}) {
    const safeLimit  = parseInt(limit, 10);
    const safeOffset = (parseInt(page, 10) - 1) * safeLimit;
    const searchParam = `%${search}%`;

    let statusClause = '';
    const params = [searchParam, searchParam, searchParam];
    if (statusFilter !== 'all') {
      statusClause = 'AND i.status = ?';
      params.push(statusFilter);
    }

    const [rows] = await pool.execute(
      `SELECT i.*, s.first_name, s.last_name, j.title as job_title, e.company_name
       FROM interviews i
       JOIN students s ON i.student_id = s.id
       JOIN jobs j ON i.job_id = j.id
       JOIN employers e ON j.employer_id = e.id
       WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR e.company_name LIKE ?)
       ${statusClause}
       ORDER BY i.interview_date DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );
    return rows;
  }

  async rescheduleInterview(interviewId, date, time) {
    await pool.execute(
      "UPDATE interviews SET interview_date = ?, status = 'scheduled' WHERE id = ?",
      [`${date} ${time}:00`, interviewId]
    );
  }

  async cancelInterview(interviewId) {
    await pool.execute(
      "UPDATE interviews SET status = 'cancelled' WHERE id = ?",
      [interviewId]
    );
  }

  // ─────────────────────────────────────────────
  // 7. OFFERS LEDGER
  // ─────────────────────────────────────────────
  async getOffersList({ search = '', statusFilter = 'all', page = 1, limit = 25 } = {}) {
    const safeLimit  = parseInt(limit, 10);
    const safeOffset = (parseInt(page, 10) - 1) * safeLimit;
    const searchParam = `%${search}%`;

    let statusClause = '';
    const params = [searchParam, searchParam, searchParam];
    if (statusFilter !== 'all') {
      statusClause = 'AND o.status = ?';
      params.push(statusFilter);
    }

    const [rows] = await pool.execute(
      `SELECT o.*, s.first_name, s.last_name, e.company_name
       FROM offers o
       JOIN students s ON o.student_id = s.id
       JOIN employers e ON o.employer_id = e.id
       WHERE (s.first_name LIKE ? OR s.last_name LIKE ? OR e.company_name LIKE ?)
       ${statusClause}
       ORDER BY o.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    const [[summary]] = await pool.execute(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined
       FROM offers`
    );

    return { rows, summary };
  }

  // ─────────────────────────────────────────────
  // 8. AUDIT LOGS
  // ─────────────────────────────────────────────
  async getAuditLogs({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (page - 1) * limit;
    const safeLimit  = parseInt(limit,  10);
    const safeOffset = parseInt(offset, 10);
    const searchParam = `%${search}%`;

    const [rows] = await pool.execute(
      `SELECT al.id, al.action, al.ip_address, al.created_at,
              u.email, u.role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE (al.action LIKE ? OR COALESCE(u.email, '') LIKE ?)
       ORDER BY al.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [searchParam, searchParam]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE (al.action LIKE ? OR COALESCE(u.email, '') LIKE ?)`,
      [searchParam, searchParam]
    );

    return { rows, total, page, limit };
  }

  // ─────────────────────────────────────────────
  // 9. ADMIN NOTIFICATIONS
  // ─────────────────────────────────────────────
  async getAdminNotifications() {
    const [rows] = await pool.execute(
      'SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50'
    );
    return rows;
  }

  async createAdminNotification(title, message, category = 'general') {
    await pool.execute(
      'INSERT INTO admin_notifications (title, message, category) VALUES (?, ?, ?)',
      [title, message, category]
    );
  }

  async markAdminNotificationRead(id) {
    await pool.execute('UPDATE admin_notifications SET is_read = 1 WHERE id = ?', [id]);
  }
}

export default new AdminModel();
