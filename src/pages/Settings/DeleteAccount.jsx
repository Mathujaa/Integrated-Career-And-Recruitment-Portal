// src/pages/Settings/DeleteAccount.jsx
import React, { useEffect, useState } from "react";
import styles from "./settingsStyles";

const DeleteAccount = ({ goBack }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const isDark = theme === "dark";
  const textColor = isDark ? "#ffffff" : "#111827"; // white in dark mode, dark gray in light mode

  return (
    <div style={{ padding: "20px", color: textColor }}>
      <button onClick={goBack} style={{ ...styles.backBtn, color: textColor }}>
        ← Back
      </button>

      <h2 style={{ color: isDark ? "#ffffff" : "#c0392b" }}>Delete Account</h2>
      <p
        style={{
          color: isDark ? "#ffffff" : "#a94442",
          marginBottom: "20px",
        }}
      >
        Once you delete your account, there is no going back. Please be certain.
      </p>

      <button
        style={styles.deleteButton}
        onClick={() => alert("Account deletion requested")}
      >
        Delete Account
      </button>
    </div>
  );
};

export default DeleteAccount;
