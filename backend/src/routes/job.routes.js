import { Router } from 'express';
import JobController from '../controllers/job.controller.js';
import StudentController from '../controllers/student.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = Router();

// 1. General jobs retrieval (accessible by guests or logged-in users)
router.get('/', optionalAuth, JobController.searchJobs);
router.get('/details/:id', optionalAuth, JobController.getJobDetails);

// 2. Student operations (applying, bookmarking, and resume building)
router.use(protect);
router.use(restrictTo('student'));

router.post('/details/:id/apply', JobController.applyJob);
router.post('/details/:id/save', JobController.saveJob);
router.delete('/details/:id/unsave', JobController.unsaveJob);

router.get('/applications', JobController.getAppliedJobs);
router.get('/saved', JobController.getSavedJobs);

router.get('/resumes', JobController.getResumes);
router.post('/resumes', JobController.createResume);
router.get('/resumes/:id', JobController.getResumeDetails);
router.put('/resumes/:id', JobController.updateResume);
router.delete('/resumes/:id', JobController.deleteResume);
router.post('/resumes/:id/photo', StudentController.uploadResumePhoto);
router.put('/resumes/:id/photo-settings', StudentController.updateResumePhotoSettings);
router.delete('/resumes/:id/photo', StudentController.removeResumePhoto);

export default router;
