import fs from 'fs';
import path from 'path';
import StudentModel from '../models/student.model.js';
import JobModel from '../models/job.model.js';
import EmailService from '../services/email.service.js';
import RecommendationService, { CAREER_ROLES } from '../services/recommendation.service.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/constants.js';

class StudentController {
  getStudentProfile = async (req, res, next) => {
    try {
      const profile = await StudentModel.getProfile(req.user.id);
      if (!profile) {
        return next(new AppError('Student profile not found.', HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        profile
      });
    } catch (error) {
      next(error);
    }
  };

  updateStudentProfile = async (req, res, next) => {
    try {
      const { first_name, last_name } = req.body;
      if (!first_name || !last_name) {
        return next(new AppError('First name and last name are required.', HTTP_STATUS.BAD_REQUEST));
      }

      await StudentModel.updateProfile(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Profile updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  // Profile Photo Management
  uploadProfilePhoto = async (req, res, next) => {
    try {
      const { photo } = req.body;
      if (!photo || typeof photo !== 'string') {
        return next(new AppError('Please provide an image payload.', HTTP_STATUS.BAD_REQUEST));
      }

      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return next(new AppError('Invalid image format. Expected base64 data URL.', HTTP_STATUS.BAD_REQUEST));
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(mimeType)) {
        return next(new AppError('Unsupported image type. Only JPG, PNG, and WebP are allowed.', HTTP_STATUS.BAD_REQUEST));
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return next(new AppError('File size exceeds the 5MB maximum limit.', HTTP_STATUS.BAD_REQUEST));
      }

      const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
      const filename = `avatar_${req.user.id}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'backend/public/uploads/avatars');
      fs.mkdirSync(uploadDir, { recursive: true });

      // Clean up previous uploaded avatar file for this user if local
      const currentProfile = await StudentModel.getProfile(req.user.id);
      if (currentProfile?.avatar_url && currentProfile.avatar_url.includes('/uploads/avatars/')) {
        const oldFile = currentProfile.avatar_url.split('/uploads/avatars/')[1];
        if (oldFile) {
          const oldPath = path.join(uploadDir, oldFile);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Could not delete old avatar:', e.message); }
          }
        }
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const avatarUrl = `http://localhost:5000/uploads/avatars/${filename}`;
      await StudentModel.updateAvatarUrl(req.user.id, avatarUrl);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Profile photo uploaded successfully.',
        avatar_url: avatarUrl
      });
    } catch (error) {
      next(error);
    }
  };

  removeProfilePhoto = async (req, res, next) => {
    try {
      const currentProfile = await StudentModel.getProfile(req.user.id);
      if (currentProfile?.avatar_url && currentProfile.avatar_url.includes('/uploads/avatars/')) {
        const oldFile = currentProfile.avatar_url.split('/uploads/avatars/')[1];
        if (oldFile) {
          const oldPath = path.join(process.cwd(), 'backend/public/uploads/avatars', oldFile);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) {}
          }
        }
      }

      await StudentModel.updateAvatarUrl(req.user.id, null);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Profile photo removed successfully.',
        avatar_url: null
      });
    } catch (error) {
      next(error);
    }
  };

  // Resume Photo Management
  uploadResumePhoto = async (req, res, next) => {
    try {
      const resumeId = req.params.id;
      const { photo } = req.body;
      if (!photo || typeof photo !== 'string') {
        return next(new AppError('Please provide an image payload.', HTTP_STATUS.BAD_REQUEST));
      }

      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return next(new AppError('Invalid image format.', HTTP_STATUS.BAD_REQUEST));
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(mimeType)) {
        return next(new AppError('Only JPG, PNG, and WebP images are allowed.', HTTP_STATUS.BAD_REQUEST));
      }

      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return next(new AppError('Image exceeds 5MB size limit.', HTTP_STATUS.BAD_REQUEST));
      }

      const resume = await JobModel.getResumeById(req.user.id, resumeId);
      if (!resume) {
        return next(new AppError('Resume not found.', HTTP_STATUS.NOT_FOUND));
      }

      const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
      const filename = `resume_${resumeId}_${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), 'backend/public/uploads/resumes');
      fs.mkdirSync(uploadDir, { recursive: true });

      // Clean up previous custom resume photo
      if (resume.resume_photo_url && resume.resume_photo_url.includes('/uploads/resumes/')) {
        const oldFile = resume.resume_photo_url.split('/uploads/resumes/')[1];
        if (oldFile) {
          const oldPath = path.join(uploadDir, oldFile);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) {}
          }
        }
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const photoUrl = `http://localhost:5000/uploads/resumes/${filename}`;
      let rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : (resume.resume_data || {});
      rData.resume_photo_url = photoUrl;
      rData.resume_photo_source = 'custom';
      rData.include_profile_picture = true;

      await JobModel.updateResumePhotoSettings(req.user.id, resumeId, {
        resume_photo_url: photoUrl,
        resume_photo_source: 'custom',
        include_photo: true,
        resume_data: rData
      });

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Resume photo uploaded successfully.',
        resume_photo_url: photoUrl,
        resume_photo_source: 'custom',
        include_photo: true
      });
    } catch (error) {
      next(error);
    }
  };

  updateResumePhotoSettings = async (req, res, next) => {
    try {
      const resumeId = req.params.id;
      const { photo_source, include_photo, remove_custom_photo } = req.body;
      const resume = await JobModel.getResumeById(req.user.id, resumeId);
      if (!resume) {
        return next(new AppError('Resume not found.', HTTP_STATUS.NOT_FOUND));
      }

      let rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : (resume.resume_data || {});
      let currentPhotoUrl = resume.resume_photo_url;

      if (remove_custom_photo) {
        if (currentPhotoUrl && currentPhotoUrl.includes('/uploads/resumes/')) {
          const oldFile = currentPhotoUrl.split('/uploads/resumes/')[1];
          if (oldFile) {
            const oldPath = path.join(process.cwd(), 'backend/public/uploads/resumes', oldFile);
            if (fs.existsSync(oldPath)) {
              try { fs.unlinkSync(oldPath); } catch (e) {}
            }
          }
        }
        currentPhotoUrl = null;
        rData.resume_photo_url = null;
      }

      const finalSource = photo_source || (remove_custom_photo ? 'profile' : resume.resume_photo_source || 'profile');
      const finalInclude = include_photo !== undefined ? Boolean(include_photo) : Boolean(resume.include_photo);

      rData.resume_photo_source = finalSource;
      rData.include_profile_picture = finalInclude;

      await JobModel.updateResumePhotoSettings(req.user.id, resumeId, {
        resume_photo_url: currentPhotoUrl,
        resume_photo_source: finalSource,
        include_photo: finalInclude,
        resume_data: rData
      });

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Resume photo preferences updated.',
        resume_photo_url: currentPhotoUrl,
        resume_photo_source: finalSource,
        include_photo: finalInclude
      });
    } catch (error) {
      next(error);
    }
  };

  removeResumePhoto = async (req, res, next) => {
    try {
      const resumeId = req.params.id;
      const resume = await JobModel.getResumeById(req.user.id, resumeId);
      if (!resume) {
        return next(new AppError('Resume not found.', HTTP_STATUS.NOT_FOUND));
      }

      if (resume.resume_photo_url && resume.resume_photo_url.includes('/uploads/resumes/')) {
        const oldFile = resume.resume_photo_url.split('/uploads/resumes/')[1];
        if (oldFile) {
          const oldPath = path.join(process.cwd(), 'backend/public/uploads/resumes', oldFile);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) {}
          }
        }
      }

      let rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : (resume.resume_data || {});
      rData.resume_photo_url = null;
      rData.resume_photo_source = 'profile';

      await JobModel.updateResumePhotoSettings(req.user.id, resumeId, {
        resume_photo_url: null,
        resume_photo_source: 'profile',
        include_photo: resume.include_photo,
        resume_data: rData
      });

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Resume photo removed.',
        resume_photo_url: null,
        resume_photo_source: 'profile'
      });
    } catch (error) {
      next(error);
    }
  };

  // Education
  addEducation = async (req, res, next) => {
    try {
      const id = await StudentModel.addEducation(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Education record added.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteEducation = async (req, res, next) => {
    try {
      await StudentModel.deleteEducation(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Education record deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // Experience
  addExperience = async (req, res, next) => {
    try {
      const id = await StudentModel.addExperience(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Experience record added.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteExperience = async (req, res, next) => {
    try {
      await StudentModel.deleteExperience(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Experience record deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // Certification
  addCertification = async (req, res, next) => {
    try {
      const id = await StudentModel.addCertification(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Certification record added.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteCertification = async (req, res, next) => {
    try {
      await StudentModel.deleteCertification(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Certification record deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // Skills
  addSkill = async (req, res, next) => {
    try {
      const id = await StudentModel.addSkill(req.user.id, req.body.name, req.body.proficiency_level);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Skill linked to profile.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteSkill = async (req, res, next) => {
    try {
      await StudentModel.deleteSkill(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Skill unlinked.' });
    } catch (error) {
      next(error);
    }
  };

  // Projects
  addProject = async (req, res, next) => {
    try {
      const id = await StudentModel.addProject(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Project added successfully.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req, res, next) => {
    try {
      await StudentModel.deleteProject(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Project deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };

  // Languages
  addLanguage = async (req, res, next) => {
    try {
      const id = await StudentModel.addLanguage(req.user.id, req.body.name, req.body.proficiency);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Language linked successfully.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteLanguage = async (req, res, next) => {
    try {
      await StudentModel.deleteLanguage(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Language unlinked successfully.' });
    } catch (error) {
      next(error);
    }
  };

  // Achievements
  addAchievement = async (req, res, next) => {
    try {
      const id = await StudentModel.addAchievement(req.user.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'Achievement added successfully.', id });
    } catch (error) {
      next(error);
    }
  };

  deleteAchievement = async (req, res, next) => {
    try {
      await StudentModel.deleteAchievement(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Achievement deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };

  // Notifications
  getNotifications = async (req, res, next) => {
    try {
      const notifications = await StudentModel.getNotifications(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', notifications });
    } catch (error) {
      next(error);
    }
  };

  markNotificationRead = async (req, res, next) => {
    try {
      await StudentModel.markNotificationRead(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Notification marked as read.' });
    } catch (error) {
      next(error);
    }
  };

  markAllNotificationsRead = async (req, res, next) => {
    try {
      await StudentModel.markAllNotificationsRead(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req, res, next) => {
    try {
      await StudentModel.deleteNotification(req.user.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Notification deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // Assessments
  getAssessments = async (req, res, next) => {
    try {
      const list = await StudentModel.getAssessments(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', assessments: list });
    } catch (error) {
      next(error);
    }
  };

  submitAssessment = async (req, res, next) => {
    try {
      const { score, answers, timeTaken } = req.body;
      const result = await StudentModel.submitAssessment(req.user.id, req.params.id, score, answers, timeTaken);
      
      const assessmentsList = await StudentModel.getAssessments(req.user.id);
      const assessment = assessmentsList.find(a => a.id === parseInt(req.params.id));
      const title = assessment ? assessment.title : 'Assessment';
      await StudentModel.createNotification(req.user.id, 'Assessment Completed', `You scored ${score}% on the assessment: ${title}.`, 'assessments');

      // Fetch student email and send result email
      const [studentUser] = await import('../config/db.config.js').then(m => m.default.query(
        'SELECT email FROM users WHERE id = ?',
        [req.user.id]
      ));
      if (studentUser[0]?.email) {
        EmailService.sendAssessmentResult(studentUser[0].email, {
          score,
          title,
          status: result.status
        }).catch(err => console.error('Assessment result email failed:', err));
      }

      // Retrieve recruiter employer_id of job linked to this assessment
      const [jobRows] = await import('../config/db.config.js').then(m => m.default.query(
        'SELECT j.employer_id FROM assessments a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?',
        [req.params.id]
      ));
      const employerId = jobRows[0]?.employer_id;
      if (employerId) {
        await StudentModel.createNotification(
          employerId,
          'Assessment Submitted',
          `A student has completed the assessment: "${title}".`,
          'assessments'
        );
      }

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: result.status === 'completed' ? 'Assessment completed successfully! Badge earned.' : 'Assessment failed. Please study and retake.',
        result
      });
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req, res, next) => {
    try {
      const board = await StudentModel.getLeaderboard();
      res.status(HTTP_STATUS.OK).json({ status: 'success', leaderboard: board });
    } catch (error) {
      next(error);
    }
  };

  // Career Roles Directory
  getCareerRoles = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({ status: 'success', roles: CAREER_ROLES });
    } catch (error) {
      next(error);
    }
  };

  // Roadmap & Career Goals
  getRoadmap = async (req, res, next) => {
    try {
      let roadmap = await StudentModel.getRoadmap(req.user.id);
      if (!roadmap) {
        const profile = await StudentModel.getProfile(req.user.id);
        const generated = RecommendationService.generatePersonalizedRoadmap(profile, 'Full Stack Software Engineer');
        await StudentModel.saveRoadmap(req.user.id, generated);
        roadmap = await StudentModel.getRoadmap(req.user.id);
      }
      
      let parsedData = roadmap?.roadmap_data;
      if (typeof parsedData === 'string') {
        try { parsedData = JSON.parse(parsedData); } catch (e) { parsedData = {}; }
      }
      
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        roadmap: {
          ...roadmap,
          roadmap_data: parsedData
        }
      });
    } catch (error) {
      next(error);
    }
  };

  saveRoadmap = async (req, res, next) => {
    try {
      const { career_goal, progress_percent, roadmap_data } = req.body;
      await StudentModel.saveRoadmap(req.user.id, { career_goal, progress_percent, roadmap_data });
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Career goal roadmap updated.' });
    } catch (error) {
      next(error);
    }
  };

  generateRoadmap = async (req, res, next) => {
    try {
      const { career_goal } = req.body;
      const profile = await StudentModel.getProfile(req.user.id);
      const existingRoadmap = await StudentModel.getRoadmap(req.user.id);
      
      let parsedExisting = existingRoadmap?.roadmap_data;
      if (typeof parsedExisting === 'string') {
        try { parsedExisting = JSON.parse(parsedExisting); } catch (e) {}
      }
      
      const newRoadmap = RecommendationService.generatePersonalizedRoadmap(
        profile,
        career_goal || 'Full Stack Software Engineer',
        existingRoadmap ? { ...existingRoadmap, roadmap_data: parsedExisting } : null
      );
      
      await StudentModel.saveRoadmap(req.user.id, newRoadmap);
      const saved = await StudentModel.getRoadmap(req.user.id);
      
      let finalData = saved?.roadmap_data;
      if (typeof finalData === 'string') {
        try { finalData = JSON.parse(finalData); } catch (e) {}
      }

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Personalized career roadmap generated.',
        roadmap: {
          ...saved,
          roadmap_data: finalData
        }
      });
    } catch (error) {
      next(error);
    }
  };

  toggleMilestone = async (req, res, next) => {
    try {
      const { milestoneId, completed } = req.body;
      const roadmap = await StudentModel.getRoadmap(req.user.id);
      if (!roadmap) {
        return next(new AppError('Roadmap not found.', HTTP_STATUS.NOT_FOUND));
      }

      let rData = roadmap.roadmap_data;
      if (typeof rData === 'string') {
        try { rData = JSON.parse(rData); } catch (e) { rData = {}; }
      }

      let milestones = Array.isArray(rData) ? rData : rData.milestones || [];
      milestones = milestones.map(m => {
        if (m.id === milestoneId) {
          return { ...m, completed: completed !== undefined ? completed : !m.completed };
        }
        return m;
      });

      const completedCount = milestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / (milestones.length || 1)) * 100);

      const updatedRoadmapData = Array.isArray(rData) 
        ? milestones 
        : { ...rData, milestones };

      await StudentModel.saveRoadmap(req.user.id, {
        career_goal: roadmap.career_goal,
        progress_percent: progress,
        roadmap_data: updatedRoadmapData
      });

      const saved = await StudentModel.getRoadmap(req.user.id);
      let parsed = saved?.roadmap_data;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch (e) {}
      }

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Milestone updated.',
        roadmap: {
          ...saved,
          roadmap_data: parsed
        }
      });
    } catch (error) {
      next(error);
    }
  };

  toggleInterviewChecklist = async (req, res, next) => {
    try {
      const { itemId, completed } = req.body;
      const roadmap = await StudentModel.getRoadmap(req.user.id);
      if (!roadmap) {
        return next(new AppError('Roadmap not found.', HTTP_STATUS.NOT_FOUND));
      }

      let rData = roadmap.roadmap_data;
      if (typeof rData === 'string') {
        try { rData = JSON.parse(rData); } catch (e) { rData = {}; }
      }

      let checklist = rData.interviewChecklist || [];
      checklist = checklist.map(item => {
        if (item.id === itemId) {
          return { ...item, completed: completed !== undefined ? completed : !item.completed };
        }
        return item;
      });

      const updatedRoadmapData = { ...rData, interviewChecklist: checklist };
      await StudentModel.saveRoadmap(req.user.id, {
        career_goal: roadmap.career_goal,
        progress_percent: roadmap.progress_percent,
        roadmap_data: updatedRoadmapData
      });

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Interview checklist item updated.',
        interviewChecklist: checklist
      });
    } catch (error) {
      next(error);
    }
  };

  // Calendar
  getCalendar = async (req, res, next) => {
    try {
      const events = await StudentModel.getCalendarEvents(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', events });
    } catch (error) {
      next(error);
    }
  };

  // AI Mentor Advice
  getAIMentorAdvice = async (req, res, next) => {
    try {
      const profile = await StudentModel.getProfile(req.user.id);
      let roadmap = await StudentModel.getRoadmap(req.user.id);
      if (!roadmap) {
        const generated = RecommendationService.generatePersonalizedRoadmap(profile, 'Full Stack Software Engineer');
        await StudentModel.saveRoadmap(req.user.id, generated);
        roadmap = await StudentModel.getRoadmap(req.user.id);
      }

      let parsedRoadmap = roadmap?.roadmap_data;
      if (typeof parsedRoadmap === 'string') {
        try { parsedRoadmap = JSON.parse(parsedRoadmap); } catch (e) {}
      }

      const advice = RecommendationService.generateMentorAdvice(
        profile,
        roadmap?.career_goal || 'Full Stack Software Engineer',
        { ...roadmap, roadmap_data: parsedRoadmap }
      );

      res.status(HTTP_STATUS.OK).json({ status: 'success', advice });
    } catch (error) {
      next(error);
    }
  };

  // AI Resume Review
  getAIResumeReview = async (req, res, next) => {
    try {
      const { id } = req.body; // optional resume ID
      let resumeDataText = '';
      
      if (id) {
        const resume = await JobModel.getResumeById(req.user.id, id);
        if (resume) {
          const rData = typeof resume.resume_data === 'string' ? JSON.parse(resume.resume_data) : resume.resume_data;
          resumeDataText = rData.summary || '';
        }
      }

      const review = {
        resumeScore: 82,
        atsScore: 78,
        grammar: 'Strong grammar overall, noted minor passive voice formulations in experience declarations.',
        formatting: 'Ensure bullet point entries maintain consistent dates notation formats.',
        skillsFound: ['React', 'NodeJS', 'Express', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
        missingSkills: ['Kubernetes', 'CI/CD Pipelines', 'GraphQL'],
        strengths: [
          'Professional contact details and links presentation.',
          'Active, impact-driven verbs are clearly incorporated in descriptions.',
          'Accurate and structured degree and work timelines.'
        ],
        suggestions: [
          'Incorporate more active action verbs (e.g. "orchestrated", "engineered") instead of passive terms ("helped with", "worked on").',
          'Include concrete metrics under experiences descriptions to illustrate impacts (e.g. "boosted speeds by 30%").'
        ],
        keywordMatch: [
          { keyword: 'React', importance: 'High', status: 'Found' },
          { keyword: 'NodeJS', importance: 'High', status: 'Found' },
          { keyword: 'MySQL', importance: 'High', status: 'Found' },
          { keyword: 'Kubernetes', importance: 'Medium', status: 'Missing' },
          { keyword: 'CI/CD Pipelines', importance: 'Medium', status: 'Missing' },
          { keyword: 'GraphQL', importance: 'Medium', status: 'Missing' }
        ],
        improvedSummary: 'Result-oriented software engineer offering advanced proficiency in building responsive React client suites, designing node-driven microservice endpoints, and executing index-optimized queries on MySQL databases.'
      };

      res.status(HTTP_STATUS.OK).json({ status: 'success', review });
    } catch (error) {
      next(error);
    }
  };

  respondToOffer = async (req, res, next) => {
    try {
      const { offerId, status } = req.body; // 'accepted' or 'rejected'
      await StudentModel.respondToOffer(req.user.id, offerId, status);
      
      await StudentModel.createNotification(
        req.user.id,
        'Offer Status Updated',
        `You have ${status} the offer letter.`,
        'system'
      );

      // Retrieve recruiter details from the offer
      const [offRows] = await import('../config/db.config.js').then(m => m.default.query(
        'SELECT employer_id, role FROM offers WHERE id = ?',
        [offerId]
      ));
      const employerId = offRows[0]?.employer_id;
      if (employerId) {
        await StudentModel.createNotification(
          employerId,
          status === 'accepted' ? 'Offer Accepted' : 'Offer Declined',
          `The candidate has ${status} the placement offer for the role: ${offRows[0].role}.`,
          'system'
        );

        // Fetch recruiter user email and notify
        const [empUser] = await import('../config/db.config.js').then(m => m.default.query(
          'SELECT email FROM users WHERE id = ?',
          [employerId]
        ));
        if (empUser[0]?.email) {
          if (status === 'accepted') {
            EmailService.sendOfferAccepted(empUser[0].email, { role: offRows[0].role })
              .catch(err => console.error('Offer accepted email failed:', err));
          } else {
            EmailService.sendOfferRejected(empUser[0].email, { role: offRows[0].role })
              .catch(err => console.error('Offer rejected email failed:', err));
          }
        }
      }
      
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: `Offer letter ${status}.` });
    } catch (error) {
      next(error);
    }
  };

  // Upgraded V2 Stats Dashboard
  getDashboardStats = async (req, res, next) => {
    try {
      const profileCompletion = await StudentModel.getProfileCompletion(req.user.id);
      const applications = await JobModel.getApplications(req.user.id);
      const savedJobs = await JobModel.getSavedJobs(req.user.id);
      const profile = await StudentModel.getProfile(req.user.id);
      const events = await StudentModel.getCalendarEvents(req.user.id);
      const road = await StudentModel.getRoadmap(req.user.id);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        stats: {
          profileCompletion,
          totalApplications: applications.length,
          totalSavedJobs: savedJobs.length,
          resumeScore: 84,
          atsScore: 78,
          interviewsScheduled: events.filter(e => e.type === 'Interview').length,
          skillCompletion: profile?.skills?.length * 10 || 40,
          certificatesEarned: profile?.certifications?.length || 0,
          recentApplications: applications.slice(0, 5),
          charts: {
            weeklyApplications: [1, 2, 0, 3, 1, 0, 2], // Mon - Sun
            monthlyApplications: [4, 8, 12, 10, 6, 8], // Last 6 Months
            resumeScoreTrend: [60, 72, 78, 84] // Over revisions
          },
          widgets: {
            upcomingInterviews: events.filter(e => e.type === 'Interview' && new Date(e.event_date) > new Date()).slice(0, 3),
            upcomingAssessments: [
              { id: 1, title: 'React Core Skills', deadline: '2026-07-20' },
              { id: 2, title: 'NodeJS Essentials', deadline: '2026-07-25' }
            ],
            aiTips: [
              'Add GraphQL to your profile to increase search visibility by 14% this month.',
              'Your resume score is in the top 15% of candidates. Apply to Senior roles.'
            ]
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new StudentController();
