import { Router } from 'express';
import StudentController from '../controllers/student.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';

const router = Router();

// Secure all endpoints to verified student profiles only
router.use(protect);
router.use(restrictTo('student'));

router.get('/profile', StudentController.getStudentProfile);
router.put('/profile', StudentController.updateStudentProfile);

router.post('/education', StudentController.addEducation);
router.delete('/education/:id', StudentController.deleteEducation);

router.post('/experience', StudentController.addExperience);
router.delete('/experience/:id', StudentController.deleteExperience);

router.post('/certification', StudentController.addCertification);
router.delete('/certification/:id', StudentController.deleteCertification);

router.post('/skills', StudentController.addSkill);
router.delete('/skills/:id', StudentController.deleteSkill);

// V2 Profiles extra segments
router.post('/projects', StudentController.addProject);
router.delete('/projects/:id', StudentController.deleteProject);

router.post('/languages', StudentController.addLanguage);
router.delete('/languages/:id', StudentController.deleteLanguage);

router.post('/achievements', StudentController.addAchievement);
router.delete('/achievements/:id', StudentController.deleteAchievement);

// V2 Notifications Center
router.get('/notifications', StudentController.getNotifications);
router.put('/notifications/read-all', StudentController.markAllNotificationsRead);
router.put('/notifications/:id/read', StudentController.markNotificationRead);
router.delete('/notifications/:id', StudentController.deleteNotification);

// V2 Skill Assessments
router.get('/assessments', StudentController.getAssessments);
router.post('/assessments/:id/submit', StudentController.submitAssessment);
router.get('/assessments/leaderboard', StudentController.getLeaderboard);

// V2 Roadmap & Career Goals
router.get('/roadmap', StudentController.getRoadmap);
router.post('/roadmap', StudentController.saveRoadmap);

// V2 Calendars & Agenda
router.get('/calendar', StudentController.getCalendar);

// V2 AI Integrations
router.get('/ai-mentor/advice', StudentController.getAIMentorAdvice);
router.post('/ai-resume/review', StudentController.getAIResumeReview);

// Redesigned V2 Stats
router.get('/dashboard-stats', StudentController.getDashboardStats);

router.post('/offers/respond', StudentController.respondToOffer);

export default router;
