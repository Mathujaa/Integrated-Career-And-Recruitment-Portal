import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Register from "./pages/Register";
import Login from "./components/Login";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import StudentJobs from "./pages/StudentJobs";
import EmployerJobs from "./pages/EmployerJobs";
import Resume from "./pages/Resume";
import Career from "./pages/Career";
import Tracking from "./pages/StudentApplicationTracker";
import Settings from "./pages/Settings/Settings";

import Layout from "./components/Layout";
import EmployerSkills from "./pages/EmployerSkills";
import StudentSkills from "./pages/StudentSkills";
import FeedbackWrapper from "./pages/Feedback";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function SkillAssessmentWrapper() {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;
  return role === "employer" ? <EmployerSkills /> : <StudentSkills />;
}

function SettingsWrapper() {
  const role = localStorage.getItem("role");
  if (!role) return <Navigate to="/login" replace />;
  return <Settings role={role} />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="StudentJobs" element={<StudentJobs />} />
            <Route path="Resume" element={<Resume />} />
            <Route path="Career" element={<Career />} />
            <Route path="Tracking" element={<Tracking />} />
            <Route path="EmployerJobs" element={<EmployerJobs />} />
            <Route path="SkillAssessment" element={<SkillAssessmentWrapper />} />
            <Route path="Settings" element={<SettingsWrapper />} />
            <Route path="Feedback" element={<FeedbackWrapper />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
