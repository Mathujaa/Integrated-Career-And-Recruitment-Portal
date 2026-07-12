import { Router } from 'express';
import EmployerController from '../controllers/employer.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = Router();

// Protect all route endpoints to verified recruiter users only
router.use(protect);
router.use(restrictTo('employer'));

router.get('/dashboard-stats', EmployerController.getDashboardStats);
router.get('/jobs', EmployerController.getJobs);

router.post('/jobs', EmployerController.createJob);
router.put('/jobs/:id', EmployerController.updateJob);
router.put('/jobs/:id/close', EmployerController.closeJob);
router.delete('/jobs/:id', EmployerController.deleteJob);

router.get('/jobs/:jobId/applicants', EmployerController.getApplicants);
router.put('/applications/:id/status', EmployerController.updateApplicantStatus);

router.get('/projects', EmployerController.getProjects);
router.post('/projects/:studentId/:projectId/reviews', EmployerController.createProjectReview);

router.post('/assessments', EmployerController.createAssessment);
router.get('/assessments/:id/results', EmployerController.getAssessmentLeaderboard);

router.get('/rankings', EmployerController.getRankings);
router.post('/interviews', EmployerController.scheduleInterview);
router.get('/offers', EmployerController.getOffers);
router.post('/offers', EmployerController.createOfferLetter);

export default router;
