import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(protect);
router.use(restrictTo('admin'));

// ─── Dashboard ────────────────────────────────────────────
router.get('/dashboard-stats', AdminController.getDashboardStats);

// ─── Students ─────────────────────────────────────────────
router.get('/students',                 AdminController.getStudents);
router.get('/students/:id',             AdminController.getStudentDetails);
router.put('/students/:id/status',      AdminController.updateStudentStatus);
router.delete('/students/:id',          AdminController.deleteStudent);

// ─── Recruiters ───────────────────────────────────────────
router.get('/recruiters',               AdminController.getRecruiters);
router.get('/recruiters/:id',           AdminController.getRecruiterDetails);
router.put('/recruiters/:id/status',    AdminController.updateRecruiterStatus);
router.delete('/recruiters/:id',        AdminController.deleteRecruiter);

// ─── Jobs ─────────────────────────────────────────────────
router.get('/jobs',                     AdminController.getJobs);
router.put('/jobs/:id/status',          AdminController.updateJobStatus);
router.put('/jobs/:id/details',         AdminController.updateJobDetails);
router.delete('/jobs/:id',              AdminController.deleteJob);

// ─── Assessments ──────────────────────────────────────────
router.get('/assessments',              AdminController.getAssessments);
router.delete('/assessments/:id',       AdminController.deleteAssessment);
router.get('/assessments/:id/results',  AdminController.getAssessmentResults);

// ─── Interviews ───────────────────────────────────────────
router.get('/interviews',               AdminController.getInterviews);
router.put('/interviews/:id/reschedule', AdminController.rescheduleInterview);
router.patch('/interviews/:id/cancel',   AdminController.cancelInterview);

// ─── Offers ───────────────────────────────────────────────
router.get('/offers',                   AdminController.getOffers);

// ─── Audit Logs ───────────────────────────────────────────
router.get('/audit-logs',               AdminController.getAuditLogs);

// ─── Admin Notifications ──────────────────────────────────
router.get('/notifications',            AdminController.getAdminNotifications);
router.patch('/notifications/:id/read', AdminController.markNotificationRead);

export default router;
