import pool from '../config/db.config.js';

class EmployerModel {
  // Employer dashboard metrics
  async getDashboardStats(employerId) {
    // 1. Total Jobs Posted
    const [jobs] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?', [employerId]);
    const totalJobs = jobs[0].count;

    // 2. Active Jobs
    const [activeJobs] = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = 'active'", [employerId]);
    const totalActiveJobs = activeJobs[0].count;

    // 3. Applications Received
    const [apps] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ?`,
      [employerId]
    );
    const totalApplications = apps[0].count;

    // 4. Shortlisted Candidates
    const [short] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ? AND a.status = 'shortlisted'`,
      [employerId]
    );
    const totalShortlisted = short[0].count;

    // 5. Interviews Scheduled
    const [interviews] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM interviews i
       JOIN jobs j ON i.job_id = j.id
       WHERE j.employer_id = ? AND i.status = 'scheduled'`,
      [employerId]
    );
    const totalInterviews = interviews[0].count;

    // 6. Assessments Created
    const [assessments] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM assessments a`
    );
    const totalAssessments = assessments[0].count;

    // 7. Average Candidate Match Score
    const averageMatchScore = 78; // Mock overall ATS match compatibility baseline

    // Chart: Applications per Job
    const [appsPerJob] = await pool.query(
      `SELECT j.title, COUNT(a.id) as count 
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.employer_id = ?
       GROUP BY j.id`,
      [employerId]
    );

    // Chart: Hiring Pipeline distribution
    const [pipeline] = await pool.query(
      `SELECT a.status, COUNT(a.id) as count 
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = ?
       GROUP BY a.status`,
      [employerId]
    );

    // Chart: Assessment Completion
    const [assCompletions] = await pool.query(
      `SELECT a.title, COUNT(ar.student_id) as count
       FROM assessments a
       LEFT JOIN assessment_results ar ON a.id = ar.assessment_id
       GROUP BY a.id`
    );

    // Chart: Offer Acceptance Rate
    const [offersData] = await pool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
       FROM offers
       WHERE employer_id = ?`,
      [employerId]
    );
    const totalOffers = offersData[0]?.total || 0;
    const acceptedOffers = offersData[0]?.accepted || 0;

    return {
      totalJobs,
      totalActiveJobs,
      totalApplications,
      totalShortlisted,
      totalInterviews,
      totalAssessments,
      averageMatchScore,
      charts: {
        applicationsPerJob: appsPerJob.map(r => ({ name: r.title, value: r.count })),
        hiringPipeline: pipeline.map(r => ({ name: r.status.replace('_', ' '), value: r.count })),
        jobStatus: [
          { name: 'Open', value: totalActiveJobs },
          { name: 'Closed', value: Math.max(0, totalJobs - totalActiveJobs) }
        ],
        assessmentCompletions: assCompletions.map(r => ({ name: r.title, value: r.count })),
        offerAcceptanceRate: [
          { name: 'Accepted', value: acceptedOffers },
          { name: 'Pending/Declined', value: Math.max(0, totalOffers - acceptedOffers) }
        ]
      }
    };
  }

  async getJobs(employerId) {
    const [rows] = await pool.execute(
      'SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC',
      [employerId]
    );
    return rows;
  }

  // Job management
  async createJob(employerId, data) {
    const [result] = await pool.execute(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, work_mode, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        employerId,
        data.title,
        data.description,
        data.requirements || '',
        data.location || 'Remote',
        data.salary_min || null,
        data.salary_max || null,
        data.employment_type || 'full-time',
        data.work_mode || 'remote'
      ]
    );
    return result.insertId;
  }

  async updateJob(employerId, jobId, data) {
    const statusVal = data.status === 'open' ? 'active' : (data.status || 'active');
    await pool.execute(
      `UPDATE jobs SET 
        title = ?, 
        description = ?, 
        requirements = ?, 
        location = ?, 
        salary_min = ?, 
        salary_max = ?, 
        employment_type = ?, 
        work_mode = ?, 
        status = ?
      WHERE id = ? AND employer_id = ?`,
      [
        data.title,
        data.description,
        data.requirements || '',
        data.location || 'Remote',
        data.salary_min || null,
        data.salary_max || null,
        data.employment_type || 'full-time',
        data.work_mode || 'remote',
        statusVal,
        jobId,
        employerId
      ]
    );
  }

  async closeJob(employerId, jobId) {
    await pool.execute(
      "UPDATE jobs SET status = 'closed' WHERE id = ? AND employer_id = ?",
      [jobId, employerId]
    );
  }

  async deleteJob(employerId, jobId) {
    await pool.execute(
      "DELETE FROM jobs WHERE id = ? AND employer_id = ?",
      [jobId, employerId]
    );
  }

  // Applicants view
  async getApplicants(employerId, jobId) {
    const [rows] = await pool.execute(
      `SELECT a.id as application_id, a.status as application_status, a.cover_letter, a.created_at as applied_at,
              s.id as student_id, s.first_name, s.last_name, s.phone, s.headline, s.bio, s.github_url, s.linkedin_url, s.portfolio_url
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN jobs j ON a.job_id = j.id
       WHERE j.id = ? AND j.employer_id = ?`,
      [jobId, employerId]
    );
    return rows;
  }

  async updateApplicantStatus(applicationId, status, feedbackData) {
    // 1. Update applications status
    await pool.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    // 2. If status is rejected, insert rejection feedback
    if (status === 'rejected' && feedbackData) {
      await pool.execute(
        `INSERT INTO rejection_feedback (application_id, reason, improvements, next_steps, skills_to_improve, technical_weaknesses, communication_remarks, suggestions) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE reason = ?, improvements = ?, next_steps = ?, skills_to_improve = ?, technical_weaknesses = ?, communication_remarks = ?, suggestions = ?`,
        [
          applicationId,
          feedbackData.reason || 'Experience mismatch',
          feedbackData.improvements || feedbackData.suggestions || 'Focus on building project portfolio.',
          feedbackData.next_steps || 'Revise React fundamentals and re-apply in 3 months.',
          feedbackData.skills_to_improve || 'N/A',
          feedbackData.technical_weaknesses || 'N/A',
          feedbackData.communication_remarks || 'N/A',
          feedbackData.suggestions || 'N/A',
          
          feedbackData.reason || 'Experience mismatch',
          feedbackData.improvements || feedbackData.suggestions || 'Focus on building project portfolio.',
          feedbackData.next_steps || 'Revise React fundamentals and re-apply in 3 months.',
          feedbackData.skills_to_improve || 'N/A',
          feedbackData.technical_weaknesses || 'N/A',
          feedbackData.communication_remarks || 'N/A',
          feedbackData.suggestions || 'N/A'
        ]
      );
    }
  }

  async createProjectReview(studentId, projectId, employerId, data) {
    await pool.execute(
      `INSERT INTO project_reviews (student_id, project_id, employer_id, rating, comments, status, code_quality, ui_design, documentation, innovation, suggestions) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = ?, comments = ?, status = ?, code_quality = ?, ui_design = ?, documentation = ?, innovation = ?, suggestions = ?`,
      [
        studentId,
        projectId,
        employerId,
        data.rating,
        data.comments || '',
        data.status || 'good',
        data.code_quality || 5,
        data.ui_design || 5,
        data.documentation || 5,
        data.innovation || 5,
        data.suggestions || '',
        
        data.rating,
        data.comments || '',
        data.status || 'good',
        data.code_quality || 5,
        data.ui_design || 5,
        data.documentation || 5,
        data.innovation || 5,
        data.suggestions || ''
      ]
    );
  }

  // Custom Assessment Creator
  async createAssessment(employerId, data) {
    // 1. Insert assessment record
    const [result] = await pool.execute(
      `INSERT INTO assessments (title, category, duration_minutes, total_questions, job_id, passing_score, attempts_allowed) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.category || 'Programming',
        data.duration_minutes || 30,
        data.questions?.length || 0,
        data.job_id || null,
        data.passing_score || 50,
        data.attempts_allowed || 1
      ]
    );
    const assessmentId = result.insertId;

    // 2. Insert questions & options
    if (data.questions && data.questions.length > 0) {
      for (const q of data.questions) {
        const [qResult] = await pool.execute(
          `INSERT INTO assessment_questions (assessment_id, question_text, type, difficulty, points, correct_answer) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            assessmentId,
            q.question_text,
            q.type || 'mcq',
            q.difficulty || 'medium',
            q.points || 10,
            q.correct_answer || ''
          ]
        );
        const questionId = qResult.insertId;

        // If MCQ choices exist, insert them
        if (q.type === 'mcq' && q.options && q.options.length > 0) {
          for (let idx = 0; idx < q.options.length; idx++) {
            await pool.execute(
              `INSERT INTO assessment_options (question_id, option_text, option_index) 
               VALUES (?, ?, ?)`,
              [questionId, q.options[idx], idx]
            );
          }
        }
      }
    }

    return assessmentId;
  }

  // Assessment results Leaderboard
  async getAssessmentLeaderboard(assessmentId) {
    const [rows] = await pool.execute(
      `SELECT sa.student_id, sa.score, sa.status, sa.taken_at,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM student_assessments sa
       JOIN students s ON sa.student_id = s.id
       WHERE sa.assessment_id = ?
       ORDER BY sa.score DESC`,
      [assessmentId]
    );
    return rows;
  }

  // Candidate Rankings
  async getRankings() {
    const [rows] = await pool.execute(
      `SELECT cr.*, CONCAT(s.first_name, ' ', s.last_name) as name, s.headline
       FROM candidate_rankings cr
       JOIN students s ON cr.student_id = s.id
       ORDER BY cr.total_points DESC`
    );
    return rows;
  }

  async getProjects(employerId) {
    const [rows] = await pool.execute(
      `SELECT p.*, s.first_name, s.last_name, s.headline, pr.rating, pr.comments, pr.status as review_status
       FROM projects p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN project_reviews pr ON p.id = pr.project_id AND pr.employer_id = ?`,
      [employerId]
    );
    return rows;
  }

  // Interview Scheduler
  async scheduleInterview(employerId, data) {
    const [result] = await pool.execute(
      `INSERT INTO interviews (student_id, job_id, interview_date, mode, location_link, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [
        data.student_id,
        data.job_id,
        `${data.date} ${data.time}:00`,
        data.mode || 'online',
        data.location_link || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  async getOffers(employerId) {
    const [rows] = await pool.execute(
      `SELECT ol.*, s.first_name, s.last_name, j.title as job_title, ol.salary as salary_offered
       FROM offers ol
       JOIN students s ON ol.student_id = s.id
       JOIN jobs j ON ol.job_id = j.id
       WHERE ol.employer_id = ?
       ORDER BY ol.created_at DESC`,
      [employerId]
    );
    return rows;
  }

  // Offer Letter Builder
  async createOfferLetter(employerId, data) {
    const expiryDate = data.expiry_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const [result] = await pool.execute(
      `INSERT INTO offers (student_id, job_id, employer_id, role, salary, joining_date, expiry_date, status, offer_text) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        data.student_id,
        data.job_id,
        employerId,
        data.role,
        data.salary_offered || data.salary || 800000,
        data.joining_date,
        expiryDate,
        data.offer_text || 'Welcome to the team!'
      ]
    );
    const offerId = result.insertId;

    // Track status history
    await pool.execute(
      `INSERT INTO offer_status_history (offer_id, status) VALUES (?, 'pending')`,
      [offerId]
    );

    return offerId;
  }
}

export default new EmployerModel();
