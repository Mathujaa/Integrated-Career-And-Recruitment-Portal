import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "student";
  const isViewMode = localStorage.getItem("viewMode") === "true";

  // ✅ Use role-specific theme key
  const [theme, setTheme] = useState(localStorage.getItem(`${role}_theme`) || "light");

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem(`${role}_theme`) || "light");
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, [role]);

  const isDark = theme === "dark";

  const cardStyle = {
    backgroundColor: isDark ? "#2d3748" : "#fafafa",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderLeft: "5px solid #3f51b5",
    color: isDark ? "#ffffff" : "#111827",
  };

  const dashboardStyle = {
    fontFamily: "Arial, sans-serif",
    padding: "2rem",
    cursor: isViewMode
      ? "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 height=%2224%22 width=%2224%22><text y=%2220%22 font-size=%2220%22>🚫</text></svg>') 12 12, auto"
      : "auto",
    backgroundColor: isDark ? "#1a202c" : "#ffffff",
    color: isDark ? "#ffffff" : "#111827",
    minHeight: "100vh",
  };

  const viewOnlyBadge = isViewMode ? " (View Only)" : "";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("viewMode");
    navigate("/login");
  };

  // ✅ Detect if we are on Dashboard Home or a nested page
  const isDashboardHome =
    location.pathname === "/dashboard" || location.pathname === "/admin-dashboard";

  return (
    <div style={dashboardStyle}>
      {isDashboardHome ? (
        <>
          {/* Dashboard Header */}
          <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            {role === "admin" && !isViewMode
              ? "👩‍💼 Admin Dashboard"
              : isViewMode
              ? `👀 Viewing ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
              : "Welcome to Your Dashboard"}
          </h1>

          <p style={{ marginBottom: "2rem", color: isDark ? "#e5e7eb" : "#333" }}>
            {role === "employer"
              ? "This portal helps employers post jobs, review applicants, and assess skills."
              : role === "student"
              ? "This portal helps students find internships, build resumes, track applications, assess skills, and explore careers."
              : "Manage users, analytics, and system settings for the platform."}
          </p>

          {/* Role-specific cards */}
          {role === "employer" ? (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🔍 <strong>Post Jobs & View Applicants</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Publish new job postings and manage applications.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🧠 <strong>Skill Assessment</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Review candidate skills and assessments.
                </p>
              </div>
            </>
          ) : role === "student" ? (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🔍 <strong>Find Jobs & Internships</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Explore openings in your domain and apply directly.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  📄 <strong>Build Your Resume</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Use our AI-powered resume builder to create a professional resume.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🎯 <strong>Career Path</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Explore career paths based on your skills and assessments.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  📌 <strong>Track Applications</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Monitor applications, interview statuses, and more.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🧠 <strong>Skill Assessment</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Take quizzes in your domain and get instant results.
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  🛠 <strong>Manage Users</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  View and manage all student and employer accounts.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  📊 <strong>Analytics</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  See platform statistics and user activity reports.
                </p>
              </div>
              <div style={cardStyle}>
                <h3 style={{ margin: 0 }}>
                  ⚙ <strong>System Settings</strong>{viewOnlyBadge}
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Manage site settings, roles, and permissions.
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        // ✅ Nested pages like Feedback, Resume, Career etc. render here
        <Outlet />
      )}
    </div>
  );
}
