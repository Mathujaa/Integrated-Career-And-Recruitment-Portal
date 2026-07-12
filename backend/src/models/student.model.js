import pool from '../config/db.config.js';

class StudentModel {
  async getProfile(studentId) {
    const [students] = await pool.execute('SELECT * FROM students WHERE id = ? LIMIT 1', [studentId]);
    const student = students[0];
    if (!student) return null;

    const [educations] = await pool.execute('SELECT * FROM educations WHERE student_id = ?', [studentId]);
    const [experiences] = await pool.execute('SELECT * FROM experiences WHERE student_id = ?', [studentId]);
    const [certifications] = await pool.execute('SELECT * FROM certifications WHERE student_id = ?', [studentId]);
    const [projects] = await pool.execute('SELECT * FROM projects WHERE student_id = ?', [studentId]);
    const [achievements] = await pool.execute('SELECT * FROM achievements WHERE student_id = ?', [studentId]);

    const [projectReviews] = await pool.execute(
      `SELECT pr.*, p.title as project_title 
       FROM project_reviews pr
       JOIN projects p ON pr.project_id = p.id
       WHERE pr.student_id = ?`,
      [studentId]
    );

    const [offers] = await pool.execute(
      `SELECT ol.*, j.title as job_title, e.company_name, ol.salary as salary_offered
       FROM offers ol
       JOIN jobs j ON ol.job_id = j.id
       JOIN employers e ON ol.employer_id = e.id
       WHERE ol.student_id = ?`,
      [studentId]
    );

    const [rejections] = await pool.execute(
      `SELECT rf.*, j.title as job_title
       FROM rejection_feedback rf
       JOIN applications a ON rf.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = ?`,
      [studentId]
    );

    const [languages] = await pool.execute(
      `SELECT l.id, l.name, sl.proficiency 
       FROM languages l
       JOIN student_languages sl ON l.id = sl.language_id
       WHERE sl.student_id = ?`,
      [studentId]
    );

    const [skills] = await pool.execute(
      `SELECT s.id, s.name, ss.proficiency_level 
       FROM skills s 
       JOIN student_skills ss ON s.id = ss.skill_id 
       WHERE ss.student_id = ?`,
      [studentId]
    );

    return {
      ...student,
      educations,
      experiences,
      certifications,
      projects,
      achievements,
      projectReviews,
      offers,
      rejections,
      languages,
      skills
    };
  }

  async updateProfile(studentId, data) {
    await pool.execute(
      `UPDATE students SET 
        first_name = ?, 
        last_name = ?, 
        phone = ?, 
        date_of_birth = ?, 
        avatar_url = ?, 
        headline = ?, 
        bio = ?, 
        github_url = ?, 
        linkedin_url = ?, 
        portfolio_url = ? 
      WHERE id = ?`,
      [
        data.first_name,
        data.last_name,
        data.phone || null,
        data.date_of_birth || null,
        data.avatar_url || null,
        data.headline || null,
        data.bio || null,
        data.github_url || null,
        data.linkedin_url || null,
        data.portfolio_url || null,
        studentId
      ]
    );
  }

  // Educations
  async addEducation(studentId, data) {
    const [result] = await pool.execute(
      `INSERT INTO educations (student_id, institution_name, degree, field_of_study, start_date, end_date, grade_gpa, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        data.institution_name,
        data.degree,
        data.field_of_study,
        data.start_date,
        data.end_date || null,
        data.grade_gpa || null,
        data.description || null
      ]
    );
    return result.insertId;
  }

  async deleteEducation(studentId, educationId) {
    await pool.execute('DELETE FROM educations WHERE id = ? AND student_id = ?', [educationId, studentId]);
  }

  // Experiences
  async addExperience(studentId, data) {
    const [result] = await pool.execute(
      `INSERT INTO experiences (student_id, company_name, job_title, location, start_date, end_date, is_current, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        data.company_name,
        data.job_title,
        data.location || null,
        data.start_date,
        data.end_date || null,
        data.is_current ? 1 : 0,
        data.description || null
      ]
    );
    return result.insertId;
  }

  async deleteExperience(studentId, experienceId) {
    await pool.execute('DELETE FROM experiences WHERE id = ? AND student_id = ?', [experienceId, studentId]);
  }

  // Certifications
  async addCertification(studentId, data) {
    const [result] = await pool.execute(
      `INSERT INTO certifications (student_id, certification_name, issuing_organization, issue_date, expiration_date, credential_id, credential_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        data.certification_name,
        data.issuing_organization,
        data.issue_date || null,
        data.expiration_date || null,
        data.credential_id || null,
        data.credential_url || null
      ]
    );
    return result.insertId;
  }

  async deleteCertification(studentId, certificationId) {
    await pool.execute('DELETE FROM certifications WHERE id = ? AND student_id = ?', [certificationId, studentId]);
  }

  // Skills
  async addSkill(studentId, skillName, proficiencyLevel) {
    let skillId;
    const [existing] = await pool.execute('SELECT id FROM skills WHERE name = ? LIMIT 1', [skillName]);
    if (existing[0]) {
      skillId = existing[0].id;
    } else {
      const [insertResult] = await pool.execute('INSERT INTO skills (name) VALUES (?)', [skillName]);
      skillId = insertResult.insertId;
    }

    await pool.execute(
      'INSERT INTO student_skills (student_id, skill_id, proficiency_level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency_level = ?',
      [studentId, skillId, proficiencyLevel || 'intermediate', proficiencyLevel || 'intermediate']
    );
    return skillId;
  }

  async deleteSkill(studentId, skillId) {
    await pool.execute('DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?', [studentId, skillId]);
  }

  // V2 Projects
  async addProject(studentId, data) {
    const [result] = await pool.execute(
      `INSERT INTO projects (student_id, title, role, description, link) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        studentId,
        data.title,
        data.role || null,
        data.description || null,
        data.link || null
      ]
    );
    return result.insertId;
  }

  async deleteProject(studentId, projectId) {
    await pool.execute('DELETE FROM projects WHERE id = ? AND student_id = ?', [projectId, studentId]);
  }

  // V2 Languages
  async addLanguage(studentId, languageName, proficiency) {
    let languageId;
    const [existing] = await pool.execute('SELECT id FROM languages WHERE name = ? LIMIT 1', [languageName]);
    if (existing[0]) {
      languageId = existing[0].id;
    } else {
      const [insertResult] = await pool.execute('INSERT INTO languages (name) VALUES (?)', [languageName]);
      languageId = insertResult.insertId;
    }

    await pool.execute(
      'INSERT INTO student_languages (student_id, language_id, proficiency) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency = ?',
      [studentId, languageId, proficiency || 'professional', proficiency || 'professional']
    );
    return languageId;
  }

  async deleteLanguage(studentId, languageId) {
    await pool.execute('DELETE FROM student_languages WHERE student_id = ? AND language_id = ?', [studentId, languageId]);
  }

  // V2 Achievements
  async addAchievement(studentId, data) {
    const [result] = await pool.execute(
      `INSERT INTO achievements (student_id, title, description, date_earned) 
       VALUES (?, ?, ?, ?)`,
      [
        studentId,
        data.title,
        data.description || null,
        data.date_earned || null
      ]
    );
    return result.insertId;
  }

  async deleteAchievement(studentId, achievementId) {
    await pool.execute('DELETE FROM achievements WHERE id = ? AND student_id = ?', [achievementId, studentId]);
  }

  // V2 Roadmap
  async getRoadmap(studentId) {
    const [rows] = await pool.execute('SELECT * FROM career_roadmaps WHERE student_id = ? LIMIT 1', [studentId]);
    return rows[0] || null;
  }

  async saveRoadmap(studentId, data) {
    const roadmapJson = JSON.stringify(data.roadmap_data || {});
    await pool.execute(
      `INSERT INTO career_roadmaps (student_id, career_goal, progress_percent, roadmap_data) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE career_goal = ?, progress_percent = ?, roadmap_data = ?`,
      [studentId, data.career_goal, data.progress_percent || 0, roadmapJson, data.career_goal, data.progress_percent || 0, roadmapJson]
    );
  }

  // V2 Notifications
  async getNotifications(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async markNotificationRead(userId, notificationId) {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [notificationId, userId]);
  }

  async markAllNotificationsRead(userId) {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
  }

  async deleteNotification(userId, notificationId) {
    await pool.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
  }

  // V2 Assessments
  async getAssessments(studentId) {
    const [rows] = await pool.execute(
      `SELECT a.*, sa.score, sa.status as attempt_status, sa.taken_at 
       FROM assessments a
       LEFT JOIN student_assessments sa ON a.id = sa.assessment_id AND sa.student_id = ?`,
      [studentId]
    );
    return rows;
  }

  async submitAssessment(studentId, assessmentId, score, answers = {}, timeTaken = 120) {
    const status = score >= 70 ? 'completed' : 'failed';
    await pool.execute(
      `INSERT INTO student_assessments (student_id, assessment_id, score, status) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE score = ?, status = ?, taken_at = CURRENT_TIMESTAMP`,
      [studentId, assessmentId, score, status, score, status]
    );

    // Also insert into assessment_results table
    const passFail = score >= 70 ? 'pass' : 'fail';
    const answersJson = JSON.stringify(answers);
    await pool.execute(
      `INSERT INTO assessment_results (student_id, assessment_id, score, percentage, time_taken_seconds, answers_json, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, assessmentId, score, score, timeTaken, answersJson, passFail]
    );

    return { status, score };
  }

  async getLeaderboard() {
    const [rows] = await pool.execute(
      `SELECT s.id, CONCAT(s.first_name, ' ', s.last_name) as name, SUM(sa.score) as total_score 
       FROM student_assessments sa
       JOIN students s ON sa.student_id = s.id
       GROUP BY s.id
       ORDER BY total_score DESC
       LIMIT 10`
    );
    return rows;
  }

  // V2 Calendar Events
  async getCalendarEvents(studentId) {
    // 1. Fetch Interviews
    const [interviews] = await pool.execute(
      `SELECT i.id, i.interview_date as event_date, 'Interview' as type, i.mode, i.status, j.title as details
       FROM interviews i
       JOIN jobs j ON i.job_id = j.id
       WHERE i.student_id = ?`,
      [studentId]
    );

    // 2. Fetch Assessments taken or available deadlines
    const [assessments] = await pool.execute(
      `SELECT sa.assessment_id as id, sa.taken_at as event_date, 'Assessment' as type, sa.status, a.title as details
       FROM student_assessments sa
       JOIN assessments a ON sa.assessment_id = a.id
       WHERE sa.student_id = ?`,
      [studentId]
    );

    // 3. Fetch Job Deadlines/Applied dates
    const [applications] = await pool.execute(
      `SELECT a.id, a.created_at as event_date, 'Job Applied' as type, a.status, j.title as details
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = ?`,
      [studentId]
    );

    return [
      ...interviews,
      ...assessments,
      ...applications
    ];
  }

  // Dynamic V2 Profile Completion Score
  async getProfileCompletion(studentId) {
    const profile = await this.getProfile(studentId);
    if (!profile) return 0;

    let score = 0;
    
    // 1. Bio basic details (30% total - 3% each)
    const basicFields = [
      'first_name', 'last_name', 'phone', 'date_of_birth',
      'avatar_url', 'headline', 'bio', 'github_url',
      'linkedin_url', 'portfolio_url'
    ];
    basicFields.forEach(field => {
      if (profile[field]) score += 3;
    });

    // 2. Sections grids completeness (10% each if has >= 1)
    if (profile.educations?.length > 0) score += 10;
    if (profile.experiences?.length > 0) score += 10;
    if (profile.skills?.length > 0) score += 10;
    if (profile.projects?.length > 0) score += 10;
    if (profile.certifications?.length > 0) score += 10;
    if (profile.languages?.length > 0) score += 10;
    if (profile.achievements?.length > 0) score += 10;

    return Math.min(score, 100);
  }

  async createNotification(userId, title, message, category = 'system') {
    await pool.execute(
      'INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, ?)',
      [userId, title, message, category]
    );
  }

  async respondToOffer(studentId, offerId, status) {
    await pool.execute(
      'UPDATE offers SET status = ? WHERE id = ? AND student_id = ?',
      [status, offerId, studentId]
    );

    // Track status history log
    await pool.execute(
      'INSERT INTO offer_status_history (offer_id, status) VALUES (?, ?)',
      [offerId, status]
    );
  }
}

export default new StudentModel();
