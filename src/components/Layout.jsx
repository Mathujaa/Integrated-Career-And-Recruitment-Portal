import React, { useEffect, useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const token = localStorage.getItem("token");
  const isViewMode = localStorage.getItem("viewMode") === "true";

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem("fontStyle") || "Arial");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "medium");

  const themeStyles = {
    light: {
      sidebarBg: "#3f51b5",
      sidebarColor: "white",
      mainBg: "#ffffff",
      mainColor: "#111827",
      bodyBg: "#ffffff",
      bodyColor: "#111827",
    },
    dark: {
      sidebarBg: "#111827",
      sidebarColor: "#ffffff",
      mainBg: "#121212",
      mainColor: "#ffffff",
      bodyBg: "#121212",
      bodyColor: "#ffffff",
    },
  };

  const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };

  useEffect(() => {
    if (!token) navigate("/login");

    const updateThemeFromStorage = () => {
      const newTheme = localStorage.getItem("theme") || "light";
      setTheme(newTheme);
      const ts = themeStyles[newTheme];
      if (ts) {
        document.documentElement.style.backgroundColor = ts.bodyBg;
        document.documentElement.style.color = ts.bodyColor;
        document.body.style.backgroundColor = ts.bodyBg;
        document.body.style.color = ts.bodyColor;
      }
    };

    const updateFontStyleFromStorage = () => {
      const newFont = localStorage.getItem("fontStyle") || "Arial";
      setFontStyle(newFont);
      document.body.style.fontFamily = newFont;
    };

    const updateFontSizeFromStorage = () => {
      const newSize = localStorage.getItem("fontSize") || "medium";
      setFontSize(newSize);
      document.body.style.fontSize = fontSizeMap[newSize];
    };

    updateThemeFromStorage();
    updateFontStyleFromStorage();
    updateFontSizeFromStorage();

    window.addEventListener("themeChange", updateThemeFromStorage);
    window.addEventListener("fontStyleChange", updateFontStyleFromStorage);
    window.addEventListener("fontSizeChange", updateFontSizeFromStorage);

    return () => {
      window.removeEventListener("themeChange", updateThemeFromStorage);
      window.removeEventListener("fontStyleChange", updateFontStyleFromStorage);
      window.removeEventListener("fontSizeChange", updateFontSizeFromStorage);
    };
  }, [token, navigate]);

  const handleRoleSwitch = (newRole, path) => {
    localStorage.setItem("role", newRole);
    localStorage.setItem("viewMode", "true");
    navigate(path);
  };

  const backToAdmin = () => {
    localStorage.setItem("role", "admin");
    localStorage.removeItem("viewMode");
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("viewMode");
    navigate("/login");
  };

  const disabledStyle = {
    color: "#a9a9a9",
    textDecoration: "none",
    cursor: "not-allowed",
    pointerEvents: "none",
  };

 const navItems =
  role === "student"
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Jobs & Internships", path: "/dashboard/StudentJobs", disabled: isViewMode },
        { name: "Resume Builder", path: "/dashboard/Resume" },
        { name: "Career Path", path: "/dashboard/Career" },
        { name: "Application Tracker", path: "/dashboard/Tracking", disabled: isViewMode },
        { name: "Skill Assessment", path: "/dashboard/SkillAssessment" },
        // ✅ Show Feedback only if not viewing from admin
        ...(isViewMode ? [] : [{ name: "Feedback", path: "/dashboard/Feedback" }]),
        { name: "Chat", path: "/dashboard/Chat" },
        { name: "Settings", path: "/dashboard/Settings" },
        ...(isViewMode ? [{ name: "Back to Admin", action: backToAdmin }] : []),
        { name: "Logout", action: handleLogout },
      ]
    : role === "employer"
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Post Jobs", path: "/dashboard/EmployerJobs", disabled: isViewMode },
        { name: "Skill Assessment", path: "/dashboard/SkillAssessment" },
        // ✅ Show Feedback only if not viewing from admin
        ...(isViewMode ? [] : [{ name: "Feedback", path: "/dashboard/Feedback" }]),
        { name: "Chat", path: "/dashboard/Chat" },
        { name: "Settings", path: "/dashboard/Settings" },
        ...(isViewMode ? [{ name: "Back to Admin", action: backToAdmin }] : []),
        { name: "Logout", action: handleLogout },
      ]
    : [
        { name: "Dashboard", path: "/dashboard" },
        { name: "View Student Dashboard", action: () => handleRoleSwitch("student", "/dashboard") },
        { name: "View Employer Dashboard", action: () => handleRoleSwitch("employer", "/dashboard") },
        // ✅ Admin should never see Feedback in viewMode
        ...(isViewMode ? [] : [{ name: "Feedback", path: "/dashboard/Feedback" }]),
        { name: "Settings", path: "/dashboard/Settings" },
        { name: "Logout", action: handleLogout },
      ];


  return (
    <div
      style={{
        display: "flex",
        fontFamily: fontStyle,
        fontSize: fontSizeMap[fontSize],
        backgroundColor: themeStyles[theme].bodyBg,
        color: themeStyles[theme].bodyColor,
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      {/* Sidebar */}
      <nav
        style={{
          width: "220px",
          backgroundColor: themeStyles[theme].sidebarBg,
          color: themeStyles[theme].sidebarColor,
          height: "100vh",
          padding: "1rem",
          
          position: "fixed",
          top: 0,
          left: 0,
          transition: "all 0.3s ease",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.2rem" }}>
          {role === "student" ? "Student Portal" : role === "employer" ? "Employer Portal" : "Admin Portal"}
        </h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {navItems.map((item) => (
            <li key={item.name} style={{ marginBottom: "1rem" }}>
              {item.action ? (
                <span
                  onClick={item.disabled ? null : item.action}
                  style={{
                    ...(!item.disabled
                      ? { color: themeStyles[theme].sidebarColor, cursor: "pointer" }
                      : disabledStyle),
                  }}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  style={
                    item.disabled
                      ? disabledStyle
                      : { color: themeStyles[theme].sidebarColor, textDecoration: "none" }
                  }
                  onClick={(e) => {
                    if (item.disabled) e.preventDefault();
                  }}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main
        style={{
          marginLeft: "240px",
          padding: "2rem",
          flexGrow: 1,
          backgroundColor: themeStyles[theme].mainBg,
          color: themeStyles[theme].mainColor,
          minHeight: "100vh",
          transition: "all 0.3s ease",
        }}
      >
        {/* Wrap Outlet with FeedbackContextProvider for Feedback page */}
        <Outlet />
      </main>
    </div>
  );
}
