import React, { useState, useEffect } from "react";

const AppearanceSettings = ({ goBack }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "medium");
  const [fontStyle, setFontStyle] = useState(() => localStorage.getItem("fontStyle") || "Arial");

  const fontSizes = ["small", "medium", "large"];
  const fontStyles = ["Arial", "Verdana", "Georgia", "Tahoma", "Times New Roman"];

  const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };

  const themeStyles = {
    light: { backgroundColor: "#ffffff", color: "#111827" },
    dark: { backgroundColor: "#1f2937", color: "#ffffff" },
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "15px",
    backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
    color: theme === "dark" ? "#ffffff" : "#000000",
    border: "1px solid #ccc",
    outline: "none",
  };

  useEffect(() => {
    const ts = themeStyles[theme] || themeStyles.light;

    document.documentElement.style.backgroundColor = ts.backgroundColor;
    document.documentElement.style.color = ts.color;

    document.body.style.backgroundColor = ts.backgroundColor;
    document.body.style.color = ts.color;
    document.body.style.fontFamily = fontStyle;
    document.body.style.fontSize = fontSizeMap[fontSize];
    document.body.style.transition = "all 0.3s ease";

    localStorage.setItem("theme", theme);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("fontStyle", fontStyle);

    // 🔥 Dispatch events so Layout can listen
    window.dispatchEvent(new Event("themeChange"));
    window.dispatchEvent(new Event("fontStyleChange"));
    window.dispatchEvent(new Event("fontSizeChange"));
  }, [theme, fontSize, fontStyle]);

  const savePreferences = () => {
    alert("Appearance preferences saved!");
  };

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: themeStyles[theme].backgroundColor,
        color: themeStyles[theme].color,
        minHeight: "100vh",
        fontFamily: fontStyle,
        fontSize: fontSizeMap[fontSize],
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={goBack}
        style={{
          marginBottom: 20,
          background: "none",
          border: "none",
          color: theme === "dark" ? "#ffffff" : "#3f51b5",
          fontSize: 16,
          cursor: "pointer",
          fontWeight: "600",
          padding: 0,
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "10px" }}>
        🎨 Appearance Settings
      </h2>
      <p style={{ marginBottom: "30px", fontSize: "16px" }}>
        Customize the look and feel of your application
      </p>

      {/* Theme */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "600", marginRight: "10px" }}>Theme:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={inputStyle}>
          <option value="light">🌞 Light Mode</option>
          <option value="dark">🌙 Dark Mode</option>
        </select>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "600", marginRight: "10px" }}>Font Size:</label>
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={inputStyle}>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Font Style */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "600", marginRight: "10px" }}>Font Style:</label>
        <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} style={inputStyle}>
          {fontStyles.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Save */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={savePreferences}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3f51b5",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          💾 Save Preferences
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
