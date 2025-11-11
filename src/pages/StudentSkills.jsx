import React, { useState, useEffect } from "react";
import quizData from "./QuizData";
import confetti from "canvas-confetti";
import axios from "axios";

const StudentSkills = ({ userEmail }) => {
  const [testType, setTestType] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const [scheduledTests, setScheduledTests] = useState([]);
  const [currentEmployerTest, setCurrentEmployerTest] = useState(null);
  const [medals, setMedals] = useState(0);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const theme = localStorage.getItem("theme") || "light"; // ✅ detect theme

  // Store completed domain tests { "Domain|Level": true }
  const [completedDomainTests, setCompletedDomainTests] = useState({});

  useEffect(() => {
    fetchEmployerTests();
    fetchMedals();
    loadCompletedDomainTests();
    resetTest();
  }, [userEmail]);

  const fetchEmployerTests = async () => {
    try {
      const res = await axios.get(`${API_URL}/employer/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScheduledTests(res.data || []);
      localStorage.setItem("employeeTests", JSON.stringify(res.data || []));
    } catch (err) {
      console.error("❌ Failed to fetch employer tests:", err.response?.data || err.message);
      const storedTests = JSON.parse(localStorage.getItem("employeeTests")) || [];
      setScheduledTests(storedTests);
    }
  };

  const fetchMedals = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/medals/${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedals(res.data.medals || 0);
      const storedMedals = JSON.parse(localStorage.getItem("userMedals")) || {};
      storedMedals[userEmail] = res.data.medals || 0;
      localStorage.setItem("userMedals", JSON.stringify(storedMedals));
    } catch (err) {
      console.error("❌ Failed to fetch medals:", err.response?.data || err.message);
      const storedMedals = JSON.parse(localStorage.getItem("userMedals")) || {};
      setMedals(storedMedals[userEmail] || 0);
    }
  };

  const loadCompletedDomainTests = () => {
    const saved = JSON.parse(localStorage.getItem("completedDomainTests") || "{}");
    setCompletedDomainTests(saved);
  };

  const saveCompletedDomainTest = (domain, level) => {
    const key = `${domain}|${level}`;
    const updated = { ...completedDomainTests, [key]: true };
    setCompletedDomainTests(updated);
    localStorage.setItem("completedDomainTests", JSON.stringify(updated));
  };

  const resetTest = () => {
    setSelectedDomain(null);
    setSelectedLevel(null);
    setTestType(null);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentEmployerTest(null);
  };

  const calculateMedals = async (correct, total, testId = null, testTitle = null) => {
    let earned = 0;
    if (correct === total) earned = 3;
    else if (correct >= total / 2) earned = 2;
    else if (correct > 0) earned = 1;

    const updatedMedals = medals + earned;
    setMedals(updatedMedals);

    const storedMedals = JSON.parse(localStorage.getItem("userMedals")) || {};
    storedMedals[userEmail] = updatedMedals;
    localStorage.setItem("userMedals", JSON.stringify(storedMedals));

   if (correct === total && total > 0) {
  // 🎊 Big confetti blast from both sides
  const duration = 2 * 1000; // 2 seconds
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}


    try {
      await axios.post(
        `${API_URL}/student/medals`,
        { studentEmail: userEmail, medals: updatedMedals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (testId) {
        await axios.post(
          `${API_URL}/student/attempts`,
          { student_email: userEmail, test_id: testId, score: correct, testTitle },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("DB save error:", err.response?.data || err.message);
    }

    return earned;
  };

  const submitDomainTest = async () => {
    const questions = quizData[selectedDomain][selectedLevel] || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correctCount++;
    });

    setScore(correctCount);
    setShowResults(true);

    const earned = await calculateMedals(correctCount, questions.length);

    if (correctCount === questions.length && questions.length > 0) {
      saveCompletedDomainTest(selectedDomain, selectedLevel);
    }

    alert(`🎯 You completed the quiz and earned ${earned} medal(s)!`);
  };

  const submitEmployerTest = async () => {
    if (!currentEmployerTest) return;
    const questions = currentEmployerTest.questions || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correctCount++;
    });

    setScore(correctCount);
    setShowResults(true);

    const earned = await calculateMedals(
      correctCount,
      questions.length,
      currentEmployerTest.id,
      currentEmployerTest.title
    );

    if (correctCount === questions.length) {
      const completedTests = JSON.parse(localStorage.getItem("completedEmployerTests") || "{}");
      completedTests[currentEmployerTest.id] = true;
      localStorage.setItem("completedEmployerTests", JSON.stringify(completedTests));
    }

    alert(`🎯 You completed "${currentEmployerTest.title}" and earned ${earned} medal(s)!`);
  };

  return (
    <div
      style={{
        padding: 40,
        backgroundColor: theme === "dark" ? "#121212" : "#fff",
        color: theme === "dark" ? "#fff" : "#111827",
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          fontSize: 28,
          fontWeight: "bold",
          color: "gold",
        }}
      >
        🏅 {medals}
      </div>

      <h2 style={{ fontWeight: "bold" }}>Choose Skill Assessment Mode</h2>

      {!testType && (
        <div style={{ marginTop: 30 }}>
          <button style={iconButtonStyle("#3b4cca", "#fff")} onClick={() => setTestType("Domain Based Test")}>
            💻 Domain Based Test
          </button>
          <button style={iconButtonStyle("#3b4cca", "#fff")} onClick={() => setTestType("Employer Provided Tests")}>
            📝 Employer Provided Tests
          </button>
        </div>
      )}

      {testType === "Domain Based Test" && !selectedDomain && (
        <DomainSelection
          quizData={quizData}
          setSelectedDomain={setSelectedDomain}
          resetTest={resetTest}
          completedDomainTests={completedDomainTests}
          theme={theme}
        />
      )}
      {selectedDomain && !selectedLevel && (
        <LevelSelection
          selectedDomain={selectedDomain}
          levels={Object.keys(quizData[selectedDomain])}
          setSelectedLevel={setSelectedLevel}
          goBack={() => setSelectedDomain(null)}
          completedDomainTests={completedDomainTests}
          theme={theme}
        />
      )}
      {selectedDomain && selectedLevel && !showResults && (
        <Quiz
          quizQuestions={quizData[selectedDomain][selectedLevel]}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          submitTest={submitDomainTest}
          goBack={() => setSelectedLevel(null)}
          title={`${selectedDomain} - ${selectedLevel}`}
          theme={theme}
        />
      )}
      {selectedDomain && selectedLevel && showResults && (
        <QuizResults
          quizQuestions={quizData[selectedDomain][selectedLevel]}
          userAnswers={userAnswers}
          score={score}
          goBack={() => {
            setSelectedLevel(null);
            setUserAnswers({});
            setShowResults(false);
            setScore(0);
          }}
          title={`${selectedDomain} - ${selectedLevel}`}
          theme={theme}
        />
      )}

      {testType === "Employer Provided Tests" && !currentEmployerTest && (
        <EmployerTests scheduledTests={scheduledTests} setCurrentEmployerTest={setCurrentEmployerTest} resetTest={resetTest} theme={theme} />
      )}
      {currentEmployerTest && !showResults && (
        <Quiz
          quizQuestions={currentEmployerTest.questions}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          submitTest={submitEmployerTest}
          goBack={() => setCurrentEmployerTest(null)}
          title={currentEmployerTest.title}
          theme={theme}
        />
      )}
      {currentEmployerTest && showResults && (
        <QuizResults
          quizQuestions={currentEmployerTest.questions}
          userAnswers={userAnswers}
          score={score}
          goBack={() => {
            setCurrentEmployerTest(null);
            setUserAnswers({});
            setShowResults(false);
            setScore(0);
          }}
          title={currentEmployerTest.title}
          theme={theme}
        />
      )}
    </div>
  );
};

/* ===== Components ===== */
const DomainSelection = ({ quizData, setSelectedDomain, resetTest, completedDomainTests, theme }) => (
  <div style={{ marginTop: 30 }}>
    <h3>Select a Domain:</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 20 }}>
      {Object.keys(quizData).map((domain) => {
        const domainLevels = Object.keys(quizData[domain]);
        const domainCompleted = domainLevels.every(level => completedDomainTests[`${domain}|${level}`]);
        return (
          <div
            key={domain}
            onClick={() => !domainCompleted && setSelectedDomain(domain)}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 20,
              cursor: domainCompleted ? "not-allowed" : "pointer",
              backgroundColor: domainCompleted ? "#444" : theme === "dark" ? "#1e1e1e" : "white",
              color: theme === "dark" ? "#fff" : "black",
              position: "relative",
              userSelect: "none",
            }}
            title={domainCompleted ? "All levels completed" : undefined}
          >
            {domain}
            {domainCompleted && (
              <span style={{ position: "absolute", top: 8, right: 8, color: "green", fontWeight: "bold" }}>
                ✅ Completed
              </span>
            )}
          </div>
        );
      })}
    </div>
    <br />
    <button style={buttonStyle("#c0392b")} onClick={resetTest}>⬅ Back</button>
  </div>
);

const LevelSelection = ({ selectedDomain, levels, setSelectedLevel, goBack, completedDomainTests, theme }) => (
  <div style={{ marginTop: 30 }}>
    <h3>{selectedDomain} - Choose a Level:</h3>
    {levels.map((level) => {
      const key = `${selectedDomain}|${level}`;
      const isCompleted = completedDomainTests[key];
      return (
        <button
          key={level}
          style={{
            ...buttonStyle(isCompleted ? "gray" : "#3b4cca"),
            cursor: isCompleted ? "not-allowed" : "pointer",
            color: "#fff",
          }}
          onClick={() => !isCompleted && setSelectedLevel(level)}
          disabled={isCompleted}
          title={isCompleted ? "Completed" : undefined}
        >
          {level}
        </button>
      );
    })}
    <br />
    <button style={buttonStyle("#c0392b")} onClick={goBack}>⬅ Back to Domains</button>
  </div>
);

const Quiz = ({ quizQuestions, userAnswers, setUserAnswers, submitTest, goBack, title, theme }) => (
  <div style={{ marginTop: 30 }}>
    {title && <h3>{title}</h3>}
    {quizQuestions.map((q, idx) => (
      <div
        key={idx}
        style={{
          marginBottom: 25,
          color: theme === "dark" ? "#fff" : "#111",
        }}
      >
        <p><b>Q{idx + 1}:</b> {q.question}</p>
        {q.options.map((option, optIdx) => (
          <div key={optIdx}>
            <label style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name={`q-${idx}`}
                checked={userAnswers[idx] === option}
                onChange={() => setUserAnswers(prev => ({ ...prev, [idx]: option }))}
                style={{ marginRight: 8 }}
              />
              {option}
            </label>
          </div>
        ))}
      </div>
    ))}
    <button style={buttonStyle("#27ae60")} onClick={submitTest}>✅ Submit Quiz</button>
    {goBack && <button style={buttonStyle("#c0392b")} onClick={goBack}>⬅ Back</button>}
  </div>
);

const QuizResults = ({ quizQuestions, userAnswers, score, goBack, title, theme }) => (
  <div style={{ marginTop: 30 }}>
    <h3>{title} - Results</h3>
    <p>🎉 You scored {score} / {quizQuestions.length}</p>

    {quizQuestions.map((q, idx) => {
      const isCorrect = userAnswers[idx] === q.answer;
      return (
        <div
          key={idx}
          style={{
            padding: 10,
            marginBottom: 10,
            border: "1px solid #ccc",
            borderRadius: 8,
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#f9f9f9",
            color: theme === "dark" ? "#fff" : "#111",
          }}
        >
          <p>
            <b>Q{idx + 1}:</b> {q.question}
          </p>

          {q.options.map((opt, optIdx) => (
            <div
              key={optIdx}
              style={{
                padding: "4px 0",
                color:
                  opt === q.answer
                    ? "green"
                    : userAnswers[idx] === opt
                    ? "red"
                    : theme === "dark"
                    ? "#ddd"
                    : "#333",
              }}
            >
              {opt}{" "}
              {opt === q.answer && "✅"}{" "}
              {userAnswers[idx] === opt && opt !== q.answer && "❌"}
            </div>
          ))}
        </div>
      );
    })}

    <button style={buttonStyle("#2980b9")} onClick={goBack}>
      🔁 Back
    </button>
  </div>
);

const EmployerTests = ({ scheduledTests, setCurrentEmployerTest, resetTest, theme }) => {
  const completedTests = JSON.parse(localStorage.getItem("completedEmployerTests") || "{}");

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Employer Provided Tests</h3>
      {scheduledTests.length === 0 ? (
        <p>No tests scheduled by employers yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {scheduledTests.map((test, idx) => {
            const isCompleted = completedTests[test.id];

            return (
              <li
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: 10,
                  borderRadius: 6,
                  backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                  color: theme === "dark" ? "#fff" : "#111",
                }}
              >
                <h4>{test.title}</h4>
                <p>{test.description}</p>
                <button
                  disabled={isCompleted}
                  style={{
                    ...buttonStyle(isCompleted ? "gray" : "#27ae60"),
                    cursor: isCompleted ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !isCompleted && setCurrentEmployerTest(test)}
                >
                  {isCompleted ? "✅ Completed" : "Take Test"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button style={buttonStyle("#c0392b")} onClick={resetTest}>⬅ Back</button>
    </div>
  );
};

/* ===== Styles ===== */
const buttonStyle = (bg = "#3b4cca", color = "white") => ({
  margin: "5px",
  padding: "10px 20px",
  background: bg,
  color,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
});

const iconButtonStyle = (bg = "#3b4cca", color = "white") => ({
  margin: "5px",
  padding: "10px 16px",
  background: bg,
  color,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
});

export default StudentSkills;
