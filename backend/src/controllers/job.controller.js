import JobModel from '../models/job.model.js';
import StudentModel from '../models/student.model.js';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../utils/constants.js';

class JobController {
  // Helper to compute AI Match details dynamically
  _computeAIMatch = (studentProfile, job) => {
    if (!studentProfile) {
      return { matchPercent: 0, matchedSkills: [], missingSkills: [], whySuits: 'Sign in as a student to see match analysis.' };
    }

    const studentSkills = (studentProfile.skills || []).map(s => s.name.toLowerCase());
    const reqText = (job.requirements || '').toLowerCase();
    
    // Extract keywords from requirements (alphanumeric words longer than 2 chars)
    const keywords = Array.from(new Set(reqText.match(/[a-z0-9+#]+/g) || []))
      .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'skills', 'experience', 'required'].includes(w));

    // Simple match check
    const matched = keywords.filter(k => studentSkills.some(s => s.includes(k) || k.includes(s)));
    const missing = keywords.filter(k => !studentSkills.some(s => s.includes(k) || k.includes(s))).slice(0, 3);

    // Compute matching score
    let matchPercent = 0;
    if (keywords.length > 0) {
      matchPercent = Math.round((matched.length / keywords.length) * 100);
    }
    // Set realistic boundaries (e.g. 50% base + partial matches)
    matchPercent = Math.max(50, Math.min(matchPercent + 45, 95));

    const matchedFormatted = matched.map(m => m.charAt(0).toUpperCase() + m.slice(1));
    const missingFormatted = missing.map(m => m.charAt(0).toUpperCase() + m.slice(1));

    let whySuits = 'Your profile is a strong match for this role.';
    if (matchedFormatted.length > 0) {
      whySuits = `Your skills in ${matchedFormatted.slice(0, 2).join(' and ')} match the key stack parameters required here.`;
    }

    return {
      matchPercent,
      matchedSkills: matchedFormatted,
      missingSkills: missingFormatted,
      whySuits
    };
  };

  searchJobs = async (req, res, next) => {
    try {
      const { keyword, location, employment_type, work_mode } = req.query;
      const jobs = await JobModel.getJobs({ keyword, location, employment_type, work_mode });

      // If user is a logged-in student, attach matching analytics
      let studentProfile = null;
      if (req.user && req.user.role === 'student') {
        studentProfile = await StudentModel.getProfile(req.user.id);
      }

      const jobsWithMatch = jobs.map(job => ({
        ...job,
        aiMatch: this._computeAIMatch(studentProfile, job)
      }));

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        results: jobsWithMatch.length,
        jobs: jobsWithMatch
      });
    } catch (error) {
      next(error);
    }
  };

  getJobDetails = async (req, res, next) => {
    try {
      const { id } = req.params;
      const job = await JobModel.getJobById(id);
      if (!job) {
        return next(new AppError('Job posting not found.', HTTP_STATUS.NOT_FOUND));
      }

      // Check user interaction (saved and applied states)
      let isSaved = false;
      let isApplied = false;
      let studentProfile = null;

      if (req.user) {
        isSaved = await JobModel.isJobSaved(req.user.id, id);
        isApplied = await JobModel.isJobApplied(req.user.id, id);
        if (req.user.role === 'student') {
          studentProfile = await StudentModel.getProfile(req.user.id);
        }
      }

      const aiMatch = this._computeAIMatch(studentProfile, job);

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        job: {
          ...job,
          isSaved,
          isApplied,
          aiMatch
        }
      });
    } catch (error) {
      next(error);
    }
  };

  applyJob = async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      const { resumeId, coverLetter } = req.body;

      const job = await JobModel.getJobById(jobId);
      if (!job) {
        return next(new AppError('Job posting not found.', HTTP_STATUS.NOT_FOUND));
      }

      const alreadyApplied = await JobModel.isJobApplied(req.user.id, jobId);
      if (alreadyApplied) {
        return next(new AppError('You have already applied for this job listing.', HTTP_STATUS.CONFLICT));
      }

      await JobModel.applyJob(req.user.id, jobId, resumeId, coverLetter);
      await StudentModel.createNotification(req.user.id, 'Application Submitted', `You successfully applied for the job listing: ${job.title}.`, 'jobs');
      if (job.employer_id) {
        await StudentModel.createNotification(
          job.employer_id,
          'Application Received',
          `A student has applied for the job listing: ${job.title}.`,
          'jobs'
        );
      }

      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Application submitted successfully!'
      });
    } catch (error) {
      next(error);
    }
  };

  saveJob = async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      const job = await JobModel.getJobById(jobId);
      if (!job) {
        return next(new AppError('Job posting not found.', HTTP_STATUS.NOT_FOUND));
      }

      await JobModel.saveJob(req.user.id, jobId);
      await StudentModel.createNotification(req.user.id, 'Job Bookmarked', `You saved the job listing: ${job.title} to your saved items.`, 'jobs');

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Job bookmarked successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  unsaveJob = async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      await JobModel.unsaveJob(req.user.id, jobId);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Job bookmark removed.'
      });
    } catch (error) {
      next(error);
    }
  };

  getAppliedJobs = async (req, res, next) => {
    try {
      const applications = await JobModel.getApplications(req.user.id);
      
      // Attach AI Match to applications too
      let studentProfile = await StudentModel.getProfile(req.user.id);
      const appsWithMatch = applications.map(app => ({
        ...app,
        aiMatch: this._computeAIMatch(studentProfile, app)
      }));

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        applications: appsWithMatch
      });
    } catch (error) {
      next(error);
    }
  };

  getSavedJobs = async (req, res, next) => {
    try {
      const savedJobs = await JobModel.getSavedJobs(req.user.id);
      
      let studentProfile = await StudentModel.getProfile(req.user.id);
      const savedWithMatch = savedJobs.map(job => ({
        ...job,
        aiMatch: this._computeAIMatch(studentProfile, job)
      }));

      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        savedJobs: savedWithMatch
      });
    } catch (error) {
      next(error);
    }
  };

  // Resume Manager
  getResumes = async (req, res, next) => {
    try {
      const resumes = await JobModel.getResumes(req.user.id);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        resumes
      });
    } catch (error) {
      next(error);
    }
  };

  getResumeDetails = async (req, res, next) => {
    try {
      const { id } = req.params;
      const resume = await JobModel.getResumeById(req.user.id, id);
      if (!resume) {
        return next(new AppError('Resume configuration not found.', HTTP_STATUS.NOT_FOUND));
      }
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        resume
      });
    } catch (error) {
      next(error);
    }
  };

  createResume = async (req, res, next) => {
    try {
      const { title, template_name, resume_data } = req.body;
      const id = await JobModel.createResume(req.user.id, { title, template_name, resume_data });
      await StudentModel.createNotification(req.user.id, 'Resume Configured', `You created a new resume profile titled: "${title}".`, 'system');
      
      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        message: 'Resume configuration saved successfully.',
        id
      });
    } catch (error) {
      next(error);
    }
  };

  updateResume = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, template_name, resume_data } = req.body;
      if (!title || !resume_data) {
        return next(new AppError('Title and resume data payload are required.', HTTP_STATUS.BAD_REQUEST));
      }

      await JobModel.updateResume(req.user.id, id, { title, template_name, resume_data });
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Resume configuration updated.'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteResume = async (req, res, next) => {
    try {
      const { id } = req.params;
      await JobModel.deleteResume(req.user.id, id);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Resume configuration deleted.'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new JobController();
