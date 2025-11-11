import React, { useState, useEffect } from "react";
import { FaUser, FaBell, FaPalette, FaInfoCircle, FaTrash } from "react-icons/fa";
import AccountSettings from "./AccountSettings";
import NotificationsSettings from "./NotificationsSettings";
import AppearanceSettings from "./AppearanceSettings";
import AboutSettings from "./AboutSettings";
import DeleteAccount from "./DeleteAccount";
import styles from "./settingsStyles";

const Settings = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const goBack = () => setActiveSection(null);

  // Listen for theme changes from AppearanceSettings
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const themeStyles = {
    light: { backgroundColor: "#ffffff", color: "#111827" },
    dark: { backgroundColor: "#1f2937", color: "#ffffff" },
  };

  const sections = [
    { key: "account", icon: <FaUser size={20} />, title: "Account", description: "Manage personal info" },
    { key: "notifications", icon: <FaBell size={20} />, title: "Notifications", description: "Control alerts" },
    { key: "appearance", icon: <FaPalette size={20} />, title: "Appearance", description: "Customize look" },
    { key: "about", icon: <FaInfoCircle size={20} />, title: "About", description: "App info and support" },
    { key: "delete", icon: <FaTrash size={20} />, title: "Delete Account", description: "Permanently delete" },
  ];

  const renderMainMenu = () => (
    <>
      <h1 style={{ ...styles.heading, color: themeStyles[theme].color }}>⚙️ Settings</h1>
      <p style={{ ...styles.subheading, color: themeStyles[theme].color }}>
        Manage your account settings and preferences
      </p>
      <div style={styles.cardList}>
        {sections.map(({ key, icon, title, description }) => (
          <div
            key={key}
            style={{
              ...styles.card,
              backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
              color: themeStyles[theme].color,
              transition: "all 0.3s ease",
            }}
            onClick={() => setActiveSection(key)}
          >
            <div style={styles.cardIcon}>{icon}</div>
            <div style={styles.cardContent}>
              <div style={{ ...styles.cardTitle, color: themeStyles[theme].color }}>{title}</div>
              <div style={{ ...styles.cardDescription, color: themeStyles[theme].color }}>{description}</div>
            </div>
            <div style={{ ...styles.arrow, color: themeStyles[theme].color }}>&#8250;</div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: themeStyles[theme].backgroundColor,
        color: themeStyles[theme].color,
        transition: "all 0.3s ease",
      }}
    >
      {activeSection === null && renderMainMenu()}
      {activeSection === "account" && <AccountSettings goBack={goBack} />}
      {activeSection === "notifications" && <NotificationsSettings goBack={goBack} />}
      {activeSection === "appearance" && <AppearanceSettings goBack={goBack} />}
      {activeSection === "about" && <AboutSettings goBack={goBack} />}
      {activeSection === "delete" && <DeleteAccount goBack={goBack} />}
    </div>
  );
};

export default Settings;
