import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EmployerSkills() {
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [savedTests, setSavedTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentMedals, setStudentMedals] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // ✅ theme state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const darkMode = theme === "dark";

  // ✅ listen for theme change
  useEffect(() => {
    const updateTheme = () => setTheme(localStorage.getItem("theme") || "light");
    window.addEventListener("themeChange", updateTheme);
    return () => window.removeEventListener("themeChange", updateTheme);
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAttempts();
      loadMedals();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadTests(), loadAttempts(), loadStudents(), loadMedals()]);
  };

  const loadTests = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/employer/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedTests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tests:", err.response?.data || err.message);
    }
  };

  const loadAttempts = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/employer/attempts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttempts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch attempts:", err.response?.data || err.message);
    }
  };

  const loadStudents = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to load students:", err.response?.data || err.message);
    }
  };

  const loadMedals = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/employer/medals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentMedals(res.data || []);
    } catch (err) {
      console.error("Failed to load medals:", err.response?.data || err.message);
    }
  };

  const getStudentName = (userRef) => {
    const student = students.find((s) => s.email === userRef || s.id === userRef);
    return student ? student.username : userRef;
  };

  const getStudentMedals = (userRef) => {
    const record = studentMedals.find(
      (m) => m.student_email === userRef || m.student_id === userRef
    );
    return record ? record.medals : 0;
  };

  const handleSaveTest = async () => {
    if (!testTitle.trim()) return alert("Please enter a test title.");
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        !q.question.trim() ||
        !q.answer.trim() ||
        q.options.some((o) => !o.trim())
      ) {
        return alert(`Please complete all fields for question ${i + 1}`);
      }
    }

    const newTest = {
      title: testTitle.trim(),
      description: "Employer provided test",
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
        answer: q.answer.trim(),
      })),
    };

    try {
      const res = await axios.post(`${API_URL}/employer/skills`, newTest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedTests([{ ...newTest, id: res.data.testId }, ...savedTests]);
      setTestTitle("");
      setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
      await loadTests();
      alert("Test saved successfully!");
    } catch (err) {
      console.error("Failed to save test:", err.response?.data || err.message);
      alert("Failed to save test. Check console for details.");
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await axios.delete(`${API_URL}/employer/skills/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedTests(savedTests.filter((t) => t.id !== testId));
      await loadTests();
      alert("Test deleted successfully.");
    } catch (err) {
      console.error("Failed to delete test:", err.response?.data || err.message);
      alert("Failed to delete test. Check console for details.");
    }
  };

  const handleAddQuestion = () => {
    const lastQ = questions[questions.length - 1];
    if (
      !lastQ.question.trim() ||
      !lastQ.answer.trim() ||
      lastQ.options.some((o) => !o.trim())
    ) {
      return alert("Please complete the current question before adding a new one.");
    }
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "" }]);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#fff",
        color: darkMode ? "#fff" : "#000",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <h1>🧑‍💼 Employer Skill Test Manager</h1>

      <input
        type="text"
        placeholder="Test Title"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
        style={{
          ...styles.input,
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#fff" : "#000",
        }}
      />

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          style={{
            ...styles.questionBlock,
            backgroundColor: darkMode ? "#1e1e1e" : "#f8f9fa",
            color: darkMode ? "#fff" : "#000",
          }}
        >
          <input
            type="text"
            placeholder={`Question ${qIndex + 1}`}
            value={q.question}
            onChange={(e) => {
              const updated = [...questions];
              updated[qIndex].question = e.target.value;
              setQuestions(updated);
            }}
            style={{
              ...styles.input,
              backgroundColor: darkMode ? "#2a2a2a" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />
          {q.options.map((opt, optIndex) => (
            <input
              key={optIndex}
              type="text"
              placeholder={`Option ${optIndex + 1}`}
              value={opt}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].options[optIndex] = e.target.value;
                setQuestions(updated);
              }}
              style={{
                ...styles.input,
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            />
          ))}
          <input
            type="text"
            placeholder="Correct Answer"
            value={q.answer}
            onChange={(e) => {
              const updated = [...questions];
              updated[qIndex].answer = e.target.value;
              setQuestions(updated);
            }}
            style={{
              ...styles.input,
              backgroundColor: darkMode ? "#2a2a2a" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />
        </div>
      ))}

      <button style={styles.button} onClick={handleAddQuestion}>
        + Add Question
      </button>
      <button
        style={styles.button}
        onClick={handleSaveTest}
        disabled={!testTitle.trim() || questions.length === 0}
      >
        Save Test
      </button>

      <h2>🗂 Saved Tests</h2>
      <ul style={styles.list}>
        {savedTests.length === 0 && <p>No tests saved yet.</p>}
        {savedTests.map((test) => (
          <li
            key={test.id}
            style={{
              ...styles.listItem,
              backgroundColor: darkMode ? "#1e1e1e" : "#f1f1f1",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            <strong>{test.title}</strong>
            <button style={styles.deleteButton} onClick={() => handleDeleteTest(test.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>📊 Student Test Attempts</h2>
      {attempts.length === 0 ? (
        <p>No attempts recorded yet.</p>
      ) : (
        <table style={{ ...styles.table, color: darkMode ? "#fff" : "#000" }}>
          <thead>
            <tr>
              <th style={{ ...styles.th, backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5" }}>Student</th>
              <th style={{ ...styles.th, backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5" }}>Test</th>
              <th style={{ ...styles.th, backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5" }}>Score</th>
              <th style={{ ...styles.th, backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{getStudentName(a.student_email)}</td>
                <td style={styles.td}>
                  {savedTests.find((t) => t.id === a.test_id)?.title || "N/A"}
                </td>
                <td style={styles.td}>{a.score}</td>
                <td style={styles.td}>{new Date(a.attempt_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ===== Styles ===== */
const styles = {
  input: {
    display: "block",
    width: "100%",
    padding: 10,
    marginBottom: 10,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  questionBlock: {
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
  },
  button: {
    padding: "10px 18px",
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    marginLeft: 10,
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
  },
  listItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
  },
  th: {
    border: "1px solid #ccc",
    padding: 8,
  },
  td: {
    border: "1px solid #ccc",
    padding: 8,
    textAlign: "center",
  },
};
