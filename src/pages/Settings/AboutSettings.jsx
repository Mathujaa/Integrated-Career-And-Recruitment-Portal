// src/pages/Settings/AboutSettings.jsx
import React, { useEffect, useState } from "react";
import {
  MdWork,
  MdAssessment,
  MdArticle,
  MdExplore,
  MdTrackChanges,
  MdDashboard,
} from "react-icons/md";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import styles from "./settingsStyles";

const AboutSettings = ({ goBack }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Watch for theme change
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  // Define theme colors
  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#111827";
  const containerBg = isDark ? "#1f2937" : "#ffffff";
  const cardBg = isDark ? "#374151" : "#f9f9f9"; // darker for dark mode

  return (
    <div style={{ ...styles.aboutContainer, backgroundColor: containerBg, color: textColor }}>
      <button onClick={goBack} style={{ ...styles.backBtn, color: textColor }}>
        ← Back
      </button>

      <div style={styles.aboutHeader}>
        <h2 style={{ ...styles.aboutTitle, color: textColor }}>About Student Job Board</h2>
        <p style={{ ...styles.aboutSubtitle, color: textColor }}>
          Connecting students with career opportunities through a seamless, modern platform
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color: textColor }}>🎯 Our Mission</h3>
        <p style={{ ...styles.text, color: textColor }}>
          The <strong>Student Job Board and Internship Portal</strong> bridges the gap between
          students and employers.
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color: textColor }}>🚀 Platform Features</h3>
        <div style={styles.featureGrid}>
          {[
            { icon: <MdWork />, title: "Seamless Applications", desc: "Apply for internships easily." },
            { icon: <MdAssessment />, title: "Skill Assessments", desc: "Custom tests for candidate evaluation." },
            { icon: <MdArticle />, title: "Resume Builder", desc: "Build and manage professional resumes." },
            { icon: <MdExplore />, title: "Career Exploration", desc: "Discover opportunities aligned with interests." },
            { icon: <MdTrackChanges />, title: "Application Tracking", desc: "Track application status in real-time." },
            { icon: <MdDashboard />, title: "Employer Dashboard", desc: "Manage postings and review applications." },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                ...styles.featureCard,
                backgroundColor: cardBg,
                color: textColor,
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <div>
                <div style={{ ...styles.featureTitle, color: textColor }}>{feature.title}</div>
                <div style={{ ...styles.featureDesc, color: textColor }}>{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color: textColor }}>👨‍💻 Development Team</h3>
        <div style={styles.devCardContainer}>
          {[{ initials: "RJ", name: "R. Jerina Gnana Pushpa" }, { initials: "PM", name: "P.M. Mathujaa" }].map((dev, idx) => (
            <div
              key={idx}
              style={{
                ...styles.devCard,
                backgroundColor: cardBg,
                color: textColor,
              }}
            >
              <div style={styles.avatar}>{dev.initials}</div>
              <div><div style={{ ...styles.devName, color: textColor }}>{dev.name}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={{ ...styles.sectionTitle, color: textColor }}>📞 Get in Touch</h3>
        <div
          style={{
            ...styles.contactCard,
            backgroundColor: cardBg,
            color: textColor,
          }}
        >
          <div style={{ ...styles.contactRow, color: textColor }}>
            <FaPhoneAlt style={styles.contactIcon} /> 9677683342
          </div>
          <div style={{ ...styles.contactRow, color: textColor }}>
            <FaEnvelope style={styles.contactIcon} />
            <a href="mailto:jerinaraja69@gmail.com" style={{ ...styles.emailLink, color: textColor }}>
              jerinaraja69@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;
