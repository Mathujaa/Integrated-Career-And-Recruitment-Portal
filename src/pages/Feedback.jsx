import React, { createContext, useContext, useState, useEffect } from "react";

// ---------- Feedback Context ----------
const FeedbackContext = createContext();

const FeedbackProvider = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem("feedbacks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (feedback) => {
    setFeedbacks([feedback, ...feedbacks]);
  };

  return (
    <FeedbackContext.Provider value={{ feedbacks, addFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

// ---------- Main Feedback Component ----------
const Feedback = () => {
  const role = localStorage.getItem("role") || "student";
  const userId = localStorage.getItem("userId") || `${role}_anonymous`;
  const { feedbacks, addFeedback } = useContext(FeedbackContext);

  const [form, setForm] = useState({
    name: "",
    type: "Portal Experience",
    rating: 0,
    message: "",
    anonymous: false,
  });

  // Get appearance preferences
  const getPreferences = () => ({
    theme: localStorage.getItem("theme") || "light",
    fontSize: localStorage.getItem("fontSize") || "medium",
    fontStyle: localStorage.getItem("fontStyle") || "Arial",
  });

  const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };

  const themeStyles = {
    light: {
      backgroundColor: "#ffffff",
      textColor: "#111827",
      cardBackground: "#f9f9f9",
      borderColor: "#ddd",
      inputBackground: "#ffffff",
    },
    dark: {
      backgroundColor: "#1f2937",
      textColor: "#ffffff",
      cardBackground: "#2c3e50",
      borderColor: "#444",
      inputBackground: "#374151",
    },
  };

  const [preferences, setPreferences] = useState(getPreferences());

  useEffect(() => {
    const updatePreferences = () => setPreferences(getPreferences());
    window.addEventListener("themeChange", updatePreferences);
    window.addEventListener("fontStyleChange", updatePreferences);
    window.addEventListener("fontSizeChange", updatePreferences);

    return () => {
      window.removeEventListener("themeChange", updatePreferences);
      window.removeEventListener("fontStyleChange", updatePreferences);
      window.removeEventListener("fontSizeChange", updatePreferences);
    };
  }, []);

  const { theme, fontSize, fontStyle } = preferences;
  const ts = themeStyles[theme];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim() || form.rating === 0) {
      alert("Please provide both rating and message.");
      return;
    }

    const newFeedback = {
      ...form,
      id: Date.now(),
      role,
      userId,
      name: form.anonymous ? "Anonymous User" : form.name || "Anonymous User",
      timestamp: new Date().toISOString(),
    };

    addFeedback(newFeedback);

    setForm({
      name: "",
      type: "Portal Experience",
      rating: 0,
      message: "",
      anonymous: false,
    });
  };

  // ---------- ROLE-BASED FILTER ----------
  const displayFeedbacks =
    role === "admin" ? feedbacks : feedbacks.filter((f) => f.userId === userId);

  const averageRating =
    displayFeedbacks.length > 0
      ? (
          displayFeedbacks.reduce((sum, f) => sum + parseInt(f.rating), 0) /
          displayFeedbacks.length
        ).toFixed(1)
      : 0;

  // ---------- Dynamic Styles ----------
  const styles = {
    main: {
      padding: "1rem",
      paddingLeft: "45px", // <-- space for sidebar
    },
    heading: { textAlign: "center", marginBottom: "25px" },
    label: { display: "block", fontWeight: "bold", marginTop: "15px" },
    input: {
      width: "100%",
      padding: "10px",
      marginTop: "5px",
      borderRadius: "8px",
      border: `1px solid ${ts.borderColor}`,
      backgroundColor: ts.inputBackground,
      color: ts.textColor,
      fontSize: "14px",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      marginTop: "5px",
      borderRadius: "8px",
      border: `1px solid ${ts.borderColor}`,
      backgroundColor: ts.inputBackground,
      color: ts.textColor,
      fontSize: "14px",
      resize: "vertical",
      height: "80px",
    },
    stars: {
      display: "flex",
      flexDirection: "row-reverse",
      justifyContent: "flex-end",
      marginTop: "5px",
    },
    starLabel: {
      fontSize: "25px",
      color: "#ccc",
      cursor: "pointer",
      transition: "color 0.2s",
    },
    anon: {
      marginTop: "10px",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    button: {
      marginTop: "20px",
      width: "100%",
      padding: "12px",
      background: "#3f51b5",
      color: "white",
      fontSize: "15px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "0.3s",
    },
    hr: { margin: "25px 0", border: 0, height: "1px", background: ts.borderColor },
    stats: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "15px",
      fontWeight: "bold",
    },
    feedbackList: {
      overflow: "visible",
    },
    feedbackItem: {
      border: `1px solid ${ts.borderColor}`,
      borderRadius: "10px",
      padding: "12px",
      marginBottom: "12px",
      background: ts.cardBackground,
    },
    ratingDisplay: { color: "#fbc02d" },
    noFeedback: { textAlign: "center", color: "#888", fontStyle: "italic" },
  };

  return (
    <div style={styles.main}>
      <h2 style={styles.heading}>Feedback & Suggestions</h2>

      {/* Submit form only for non-admins */}
      {role !== "admin" && (
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Your Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            style={styles.input}
          />

          <label style={styles.label}>Feedback Type:</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={styles.input}
          >
            <option>Portal Experience</option>
            <option>Company Feedback</option>
            <option>Suggestion</option>
            <option>Complaint</option>
          </select>

          <label style={styles.label}>Rating:</label>
          <div style={styles.stars}>
            {[5, 4, 3, 2, 1].map((num) => (
              <label
                key={num}
                style={{
                  ...styles.starLabel,
                  color: form.rating >= num ? "#fbc02d" : "#ccc",
                }}
              >
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={parseInt(form.rating) === num}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                ★
              </label>
            ))}
          </div>

          <label style={styles.label}>Your Message:</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your feedback here..."
            style={styles.textarea}
          ></textarea>

          <div style={styles.anon}>
            <input
              type="checkbox"
              name="anonymous"
              checked={form.anonymous}
              onChange={handleChange}
            />
            <label>Submit anonymously</label>
          </div>

          <button type="submit" style={styles.button}>
            Submit Feedback
          </button>
        </form>
      )}

      <hr style={styles.hr} />

      <div style={styles.stats}>
        <p>Total Feedback: {displayFeedbacks.length}</p>
        <p>Average Rating: {averageRating}</p>
      </div>

      {displayFeedbacks.length === 0 ? (
        <p style={styles.noFeedback}>No feedback yet.</p>
      ) : (
        <div style={styles.feedbackList}>
          {displayFeedbacks.map((f) => (
            <div key={f.id} style={styles.feedbackItem}>
              <p>
                <strong>{f.name}</strong> ({f.role}) -{" "}
                <span style={styles.ratingDisplay}>
                  {"★".repeat(f.rating) + "☆".repeat(5 - f.rating)}
                </span>
              </p>
              <p><em>{f.type}</em></p>
              <p>{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Export with Context ----------
export default function FeedbackApp() {
  return (
    <FeedbackProvider>
      <Feedback />
    </FeedbackProvider>
  );
}
