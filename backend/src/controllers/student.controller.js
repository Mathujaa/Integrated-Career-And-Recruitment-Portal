import StudentModel from '../models/student.model.js';
import JobModel from '../models/job.model.js';
import EmailService from '../services/email.service.js';
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

  // Roadmap
  getRoadmap = async (req, res, next) => {
    try {
      const roadmap = await StudentModel.getRoadmap(req.user.id);
      res.status(HTTP_STATUS.OK).json({ status: 'success', roadmap });
    } catch (error) {
      next(error);
    }
  };

  saveRoadmap = async (req, res, next) => {
    try {
      await StudentModel.saveRoadmap(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({ status: 'success', message: 'Career goal roadmap updated.' });
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
      const skills = profile?.skills?.map(s => s.name) || [];
      const goal = (await StudentModel.getRoadmap(req.user.id))?.career_goal || 'Full Stack Engineer';

      const advice = {
        suggestions: [
          `Focus on building deep knowledge in backend system designs if your target goal is ${goal}.`,
          `Consider working on intermediate to advanced cloud infrastructure (like AWS or Docker) next.`
        ],
        skillGap: skills.includes('React') ? ['Docker', 'AWS', 'Redis'] : ['React', 'JavaScript', 'System Architecture'],
        learningPath: [
          { step: 'Core Concepts Mastery', duration: '2 weeks', resources: 'FreeCodeCamp / Official Docs' },
          { step: 'System Integration Project', duration: '3 weeks', resources: 'Build a Dockerized NodeJS/React application' },
          { step: 'Cloud Deployment', duration: '1 week', resources: 'Deploy on AWS free tier EC2' }
        ],
        interviewTips: [
          'Prepare solid explanations about SQL indexes and database tuning techniques.',
          'Review JavaScript microtask queues and asynchronous execution loops before coding tests.'
        ]
      };

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
