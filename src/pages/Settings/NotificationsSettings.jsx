// src/pages/Settings/NotificationsSettings.jsx
import React, { useState, useEffect } from "react";
import styles from "./settingsStyles";

const soundOptions = [
  { name: "Chime", url: "/sounds/chime.mp3" },
  { name: "Ding", url: "/sounds/ding.mp3" },
  { name: "Pop", url: "/sounds/pop.mp3" },
  { name: "Notify", url: "/sounds/notify.mp3" },
];

const NotificationsSettings = ({ goBack }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState(soundOptions[0].name);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem("notificationSoundEnabled");
    const savedSound = localStorage.getItem("notificationSoundName");
    if (savedEnabled !== null) setSoundEnabled(savedEnabled === "true");
    if (savedSound) setSelectedSound(savedSound);

    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const themeStyles = {
    light: { color: "#111827" },
    dark: { color: "#ffffff" },
  };

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const playSound = (url) => {
    if (!soundEnabled) return;
    const audio = new Audio(url);
    audio.play().catch((err) => console.log("Audio play error:", err));
  };

  const savePreferences = () => {
    localStorage.setItem("notificationSoundEnabled", soundEnabled);
    localStorage.setItem("notificationSoundName", selectedSound);
    alert("Notification preferences saved!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", ...themeStyles[theme] }}>
      {/* Back button */}
      <button onClick={goBack} style={{ ...styles.backBtn, ...themeStyles[theme] }}>
        ← Back
      </button>

      <h2 style={{ ...styles.sectionTitle, ...themeStyles[theme] }}>Notifications</h2>
      <p style={themeStyles[theme]}>
        Manage your notification preferences (email alerts, push notifications, etc.)
      </p>

      {/* Sound Toggle */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          ...themeStyles[theme],
        }}
      >
        <label style={{ fontWeight: "600", fontSize: "16px", ...themeStyles[theme] }}>
          Notification Sound
        </label>
        <label style={styles.switch}>
          <input type="checkbox" checked={soundEnabled} onChange={toggleSound} />
          <span
            style={{
              ...styles.slider,
              backgroundColor: soundEnabled ? "#3f51b5" : "#666",
            }}
          >
            <span
              style={{
                position: "absolute",
                height: "18px",
                width: "18px",
                left: soundEnabled ? "24px" : "4px",
                bottom: "3px",
                backgroundColor: "#fff",
                borderRadius: "50%",
                transition: "0.4s",
              }}
            ></span>
          </span>
        </label>
      </div>

      {/* Sound Selection */}
      <div style={{ marginTop: "30px" }}>
        <h3 style={{ ...styles.sectionTitle, ...themeStyles[theme] }}>Choose a Sound</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {soundOptions.map((sound) => (
            <button
              key={sound.name}
              onClick={() => {
                setSelectedSound(sound.name);
                playSound(sound.url);
              }}
              style={{
                padding: "10px 15px",
                fontSize: "15px",
                borderRadius: "6px",
                border: selectedSound === sound.name ? "2px solid #3f51b5" : "1px solid #666",
                backgroundColor:
                  selectedSound === sound.name
                    ? theme === "dark"
                      ? "#374151"
                      : "#e0e7ff"
                    : theme === "dark"
                    ? "#1f2937"
                    : "#f9fafb",
                color: theme === "dark" ? "#fff" : "#111827",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {sound.name}
            </button>
          ))}
        </div>
      </div>

      {/* Save Preferences Button */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={savePreferences}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3f51b5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationsSettings;
