import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import CompleteProfilePage from '../pages/CompleteProfilePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Student Pages
import StudentDashboard from '../pages/StudentDashboard';
import StudentProfile from '../pages/StudentProfile';
import ResumeBuilder from '../pages/ResumeBuilder';
import ResumePreview from '../pages/ResumePreview';
import JobSearch from '../pages/JobSearch';
import JobDetails from '../pages/JobDetails';
import AppliedJobs from '../pages/AppliedJobs';
import SavedJobs from '../pages/SavedJobs';
import AIResumeReview from '../pages/AIResumeReview';
import AIMentor from '../pages/AIMentor';
import SkillAssessment from '../pages/SkillAssessment';
import CalendarView from '../pages/CalendarView';
import CareerRoadmap from '../pages/CareerRoadmap';
import SettingsPage from '../pages/SettingsPage';
import NotificationCenter from '../pages/NotificationCenter';

// Employer Pages
import EmployerDashboard from '../pages/EmployerDashboard';
import EmployerJobs from '../pages/EmployerJobs';
import EmployerApplicants from '../pages/EmployerApplicants';
import EmployerProjectsReview from '../pages/EmployerProjectsReview';
import EmployerAssessmentBuilder from '../pages/EmployerAssessmentBuilder';
import EmployerOffers from '../pages/EmployerOffers';
import EmployerSettings from '../pages/EmployerSettings';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminStudents from '../pages/AdminStudents';
import AdminRecruiters from '../pages/AdminRecruiters';
import AdminJobs from '../pages/AdminJobs';
import AdminAssessments from '../pages/AdminAssessments';
import AdminInterviews from '../pages/AdminInterviews';
import AdminOffers from '../pages/AdminOffers';
import AdminReports from '../pages/AdminReports';
import AdminSettings from '../pages/AdminSettings';
import AdminAuditLog from '../pages/AdminAuditLog';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. General Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 2. Public Guests-Only Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* 3. Common Authenticated Route */}
      <Route element={<ProtectedRoute />}>
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
      </Route>

      {/* 4. Role-Based Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/resumes" element={<ResumeBuilder />} />
        <Route path="/student/resumes/:id/preview" element={<ResumePreview />} />
        <Route path="/student/jobs" element={<JobSearch />} />
        <Route path="/student/jobs/:id" element={<JobDetails />} />
        <Route path="/student/applications" element={<AppliedJobs />} />
        <Route path="/student/saved-jobs" element={<SavedJobs />} />
        <Route path="/student/ai-resume-review" element={<AIResumeReview />} />
        <Route path="/student/ai-mentor" element={<AIMentor />} />
        <Route path="/student/assessments" element={<SkillAssessment />} />
        <Route path="/student/calendar" element={<CalendarView />} />
        <Route path="/student/roadmap" element={<CareerRoadmap />} />
        <Route path="/student/settings" element={<SettingsPage />} />
        <Route path="/student/notifications" element={<NotificationCenter />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/employer/jobs/:jobId/applicants" element={<EmployerApplicants />} />
        <Route path="/employer/projects" element={<EmployerProjectsReview />} />
        <Route path="/employer/assessments" element={<EmployerAssessmentBuilder />} />
        <Route path="/employer/offers" element={<EmployerOffers />} />
        <Route path="/employer/settings" element={<EmployerSettings />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/recruiters" element={<AdminRecruiters />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/assessments" element={<AdminAssessments />} />
        <Route path="/admin/interviews" element={<AdminInterviews />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* 5. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
