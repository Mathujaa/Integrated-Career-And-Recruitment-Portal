import pool from '../config/db.config.js';
import AdminModel from '../models/admin.model.js';
import StudentModel from '../models/student.model.js';
import EmailService from '../services/email.service.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/constants.js';

class AdminController {

  // ─────────────────────────────
  // 1. DASHBOARD
  // ─────────────────────────────
  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await AdminModel.getDashboardStats();
      res.status(HTTP_STATUS.OK).json({ status: 'success', stats });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 2. STUDENTS
  // ─────────────────────────────
  getStudents = async (req, res, next) => {
    try {
      const { search = '', page = 1, limit = 20 } = req.query;
      const result = await AdminModel.getStudentsList({
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  };

  getStudentDetails = async (req, res, next) => {
    try {
      const student = await AdminModel.getStudentDetails(req.params.id);
      if (!student) {
        return next(new AppError('Student profile not found.', HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json({ status: 'success', student });
    } catch (error) {
      next(error);
    }
  };

  updateStudentStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!['active', 'suspended'].includes(status)) {
        return next(new AppError('Invalid status value.', HTTP_STATUS.BAD_REQUEST));
      }
      await AdminModel.updateStudentStatus(req.params.id, status);

      // Log admin action
      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_${status === 'active' ? 'activate' : 'suspend'}_student_${req.params.id}`, ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({ status: 'success', message: `Student status set to ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  deleteStudent = async (req, res, next) => {
    try {
      await AdminModel.deleteStudent(req.params.id);
      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_delete_student_${req.params.id}`, ipAddress, userAgent);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Student account deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 3. RECRUITERS
  // ─────────────────────────────
  getRecruiters = async (req, res, next) => {
    try {
      const { search = '', status: statusFilter = 'all', page = 1, limit = 20 } = req.query;
      const result = await AdminModel.getRecruitersList({
        search,
        statusFilter,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  };

  getRecruiterDetails = async (req, res, next) => {
    try {
      const recruiter = await AdminModel.getRecruiterDetails(req.params.id);
      if (!recruiter) {
        return next(new AppError('Recruiter profile not found.', HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json({ status: 'success', recruiter });
    } catch (error) {
      next(error);
    }
  };

  updateRecruiterStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
        return next(new AppError('Invalid status value.', HTTP_STATUS.BAD_REQUEST));
      }
      await AdminModel.updateRecruiterStatus(req.params.id, status);

      // Send email & create admin notification
      try {
        const [empRows] = await pool.query(
          'SELECT u.email, e.company_name FROM employers e JOIN users u ON e.id = u.id WHERE e.id = ?',
          [req.params.id]
        );
        if (empRows[0]) {
          const { email, company_name } = empRows[0];
          if (status === 'approved') {
            await AdminModel.createAdminNotification(
              'Recruiter Approved',
              `${company_name} has been approved and can now post jobs.`,
              'recruiter'
            );
          } else if (status === 'rejected') {
            await AdminModel.createAdminNotification(
              'Recruiter Rejected',
              `${company_name} registration has been rejected.`,
              'recruiter'
            );
          }
        }
      } catch (notifErr) {
        console.warn('Notification error:', notifErr.message);
      }

      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_${status}_recruiter_${req.params.id}`, ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({ status: 'success', message: `Recruiter status set to ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  deleteRecruiter = async (req, res, next) => {
    try {
      await AdminModel.deleteRecruiter(req.params.id);
      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_delete_recruiter_${req.params.id}`, ipAddress, userAgent);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Recruiter account deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 4. JOBS
  // ─────────────────────────────
  getJobs = async (req, res, next) => {
    try {
      const { search = '', status: statusFilter = 'all', page = 1, limit = 25 } = req.query;
      const result = await AdminModel.getJobsList({
        search, statusFilter,
        page: parseInt(page), limit: parseInt(limit)
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', jobs: result.rows });
    } catch (error) {
      next(error);
    }
  };

  updateJobStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!['draft', 'active', 'closed', 'flagged'].includes(status)) {
        return next(new AppError('Invalid status value.', HTTP_STATUS.BAD_REQUEST));
      }
      await AdminModel.updateJobStatus(req.params.id, status);

      if (status === 'flagged') {
        await AdminModel.createAdminNotification(
          'Job Flagged',
          `Job #${req.params.id} has been flagged as suspicious/fake.`,
          'jobs'
        );
      }

      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_job_status_${status}_${req.params.id}`, ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({ status: 'success', message: `Job status set to ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  updateJobDetails = async (req, res, next) => {
    try {
      await AdminModel.updateJobDetails(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Job listing updated.' });
    } catch (error) {
      next(error);
    }
  };

  deleteJob = async (req, res, next) => {
    try {
      await AdminModel.deleteJob(req.params.id);
      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_delete_job_${req.params.id}`, ipAddress, userAgent);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Job listing deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 5. ASSESSMENTS
  // ─────────────────────────────
  getAssessments = async (req, res, next) => {
    try {
      const assessments = await AdminModel.getAssessmentsList();
      res.status(HTTP_STATUS.OK).json({ status: 'success', assessments });
    } catch (error) {
      next(error);
    }
  };

  deleteAssessment = async (req, res, next) => {
    try {
      await AdminModel.deleteAssessment(req.params.id);
      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_delete_assessment_${req.params.id}`, ipAddress, userAgent);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Assessment and all results deleted.' });
    } catch (error) {
      next(error);
    }
  };

  getAssessmentResults = async (req, res, next) => {
    try {
      const results = await AdminModel.getAssessmentResults(req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', results });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 6. INTERVIEWS
  // ─────────────────────────────
  getInterviews = async (req, res, next) => {
    try {
      const { status: statusFilter = 'all', search = '', page = 1, limit = 25 } = req.query;
      const interviews = await AdminModel.getInterviewsList({
        statusFilter, search,
        page: parseInt(page), limit: parseInt(limit)
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', interviews });
    } catch (error) {
      next(error);
    }
  };

  rescheduleInterview = async (req, res, next) => {
    try {
      const { date, time } = req.body;
      if (!date || !time) {
        return next(new AppError('Rescheduled date and time are required.', HTTP_STATUS.BAD_REQUEST));
      }
      await AdminModel.rescheduleInterview(req.params.id, date, time);

      // Notify student
      try {
        const [intRows] = await pool.query(
          'SELECT student_id, job_id, mode FROM interviews WHERE id = ?',
          [req.params.id]
        );
        const studentId = intRows[0]?.student_id;
        if (studentId) {
          await StudentModel.createNotification(
            studentId,
            'Interview Rescheduled',
            `Admin rescheduled your interview for ${date} at ${time}.`,
            'interviews'
          );
          const [userRows] = await pool.query('SELECT email FROM users WHERE id = ?', [studentId]);
          if (userRows[0]?.email) {
            EmailService.sendInterviewScheduled(userRows[0].email, { date, time, mode: intRows[0].mode || 'online' })
              .catch(err => console.error('Reschedule email failed:', err));
          }
        }
      } catch (notifErr) {
        console.warn('Reschedule notification error:', notifErr.message);
      }

      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_reschedule_interview_${req.params.id}`, ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Interview slot rescheduled.' });
    } catch (error) {
      next(error);
    }
  };

  cancelInterview = async (req, res, next) => {
    try {
      await AdminModel.cancelInterview(req.params.id);

      // Notify student
      try {
        const [intRows] = await pool.query(
          'SELECT student_id FROM interviews WHERE id = ?',
          [req.params.id]
        );
        const studentId = intRows[0]?.student_id;
        if (studentId) {
          await StudentModel.createNotification(
            studentId,
            'Interview Cancelled',
            'Your scheduled interview has been cancelled by the admin. Please check with your recruiter.',
            'interviews'
          );
        }
      } catch (notifErr) {
        console.warn('Cancel notification error:', notifErr.message);
      }

      const { ipAddress, userAgent } = this._getRequestDetails(req);
      await this._logAdminAction(req.user.id, `admin_cancel_interview_${req.params.id}`, ipAddress, userAgent);

      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Interview cancelled.' });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 7. OFFERS
  // ─────────────────────────────
  getOffers = async (req, res, next) => {
    try {
      const { search = '', status: statusFilter = 'all', page = 1, limit = 25 } = req.query;
      const result = await AdminModel.getOffersList({
        search, statusFilter,
        page: parseInt(page), limit: parseInt(limit)
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', offers: result.rows, summary: result.summary });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 8. AUDIT LOGS
  // ─────────────────────────────
  getAuditLogs = async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await AdminModel.getAuditLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });
      res.status(HTTP_STATUS.OK).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // 9. ADMIN NOTIFICATIONS
  // ─────────────────────────────
  getAdminNotifications = async (req, res, next) => {
    try {
      const notifications = await AdminModel.getAdminNotifications();
      res.status(HTTP_STATUS.OK).json({ status: 'success', notifications });
    } catch (error) {
      next(error);
    }
  };

  markNotificationRead = async (req, res, next) => {
    try {
      await AdminModel.markAdminNotificationRead(req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Notification marked read.' });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  _getRequestDetails(req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return { ipAddress, userAgent };
  }

  async _logAdminAction(userId, action, ipAddress, userAgent) {
    try {
      await pool.execute(
        'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [userId, action, ipAddress, userAgent]
      );
    } catch (err) {
      console.warn('Admin audit log failed:', err.message);
    }
  }
}

export default new AdminController();
