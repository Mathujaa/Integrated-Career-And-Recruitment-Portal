import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const SkillAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [submitting, setSubmitting] = useState(false);

  // Success Modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Notifications
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const quizQuestions = {
    1: [ // React Quiz
      { q: 'How do you handle side-effects in a React component?', a: ['useMemo', 'useEffect', 'useCallback', 'useState'], correct: 1 },
      { q: 'Which method prevents prop-drilling down child trees?', a: ['Props parameters', 'React Memo', 'React Context API', 'State hoisting'], correct: 2 },
      { q: 'What is the correct hook to cache expensive function results?', a: ['useEffect', 'useMemo', 'useReducer', 'useRef'], correct: 1 },
      { q: 'What is the Virtual DOM?', a: ['A replication of browser DOM in memory', 'A node server instance', 'An HTML compilation file', 'A CSS styling sheet'], correct: 0 },
      { q: 'How do you update state in functional components?', a: ['this.setState()', 'useState setter function', 'Direct value assignment', 'Force update call'], correct: 1 }
    ],
    2: [ // NodeJS Quiz
      { q: 'What engine does NodeJS execute on?', a: ['Gecko engine', 'V8 JavaScript engine', 'Chakra engine', 'Webkit'], correct: 1 },
      { q: 'Which framework is standard for REST API servers?', a: ['Vite', 'Express', 'Nodemon', 'Babel'], correct: 1 },
      { q: 'What is the purpose of package.json?', a: ['Compiles JavaScript code', 'Lists configuration and dependencies', 'Maintains databases schemas', 'Styles front pages'], correct: 1 },
      { q: 'How do you import ES modules statically?', a: ['require()', 'import declarations', 'module.exports', 'fetch()'], correct: 1 },
      { q: 'Which module handles path operations in NodeJS?', a: ['fs', 'path', 'http', 'os'], correct: 1 }
    ]
  };

  useEffect(() => {
    fetchAssessmentsAndLeaderboard();
  }, []);

  // Timer loop for active quiz
  useEffect(() => {
    if (!activeQuiz) return;
    if (timeLeft === 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  const fetchAssessmentsAndLeaderboard = async () => {
    try {
      const [assResponse, leadResponse] = await Promise.all([
        apiClient.get('/student/assessments'),
        apiClient.get('/student/assessments/leaderboard')
      ]);
      setAssessments(assResponse.data.assessments);
      setLeaderboard(leadResponse.data.leaderboard);
    } catch (err) {
      console.error(err);
      showToast('Failed to load assessment lists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleStartQuiz = (assessment) => {
    const qList = quizQuestions[assessment.id] || quizQuestions[1]; // default fallback
    setActiveQuiz({
      ...assessment,
      questions: qList
    });
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(120);
  };

  const handleSelectAnswer = (ansIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: ansIdx
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const computeScore = () => {
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    return Math.round((correctCount / activeQuiz.questions.length) * 100);
  };

  const handleAutoSubmit = () => {
    showToast('Time has expired! Submitting answers automatically...', 'warning');
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    const finalScore = computeScore();

    try {
      const response = await apiClient.post(`/student/assessments/${activeQuiz.id}/submit`, { score: finalScore });
      setQuizResult({
        title: activeQuiz.title,
        score: finalScore,
        status: response.data.result.status,
        message: response.data.message
      });
      setSuccessModalOpen(true);
      setActiveQuiz(null);
      fetchAssessmentsAndLeaderboard();
    } catch (err) {
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="fade-in">
        
        {/* Dynamic Quiz Frame */}
        {activeQuiz ? (
          <Card style={{ padding: '40px', maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeQuiz.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
              </div>
              <div style={{
                backgroundColor: timeLeft < 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                color: timeLeft < 30 ? 'var(--error)' : 'var(--primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}>
                ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                {activeQuiz.questions[currentQuestionIndex].q}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeQuiz.questions[currentQuestionIndex].a.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAnswer(idx)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '16px 20px',
                      backgroundColor: selectedAnswers[currentQuestionIndex] === idx ? 'rgba(79, 70, 229, 0.06)' : 'var(--bg-main)',
                      border: '1px solid',
                      borderColor: selectedAnswers[currentQuestionIndex] === idx ? 'var(--primary)' : 'var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.95rem',
                      fontWeight: selectedAnswers[currentQuestionIndex] === idx ? 600 : 500,
                      color: selectedAnswers[currentQuestionIndex] === idx ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>

              {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                <Button variant="primary" onClick={handleNext} disabled={selectedAnswers[currentQuestionIndex] === undefined}>
                  Next Question
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleSubmitQuiz} loading={submitting} disabled={selectedAnswers[currentQuestionIndex] === undefined}>
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skill Assessments</h2>
              <p style={{ color: 'var(--text-muted)' }}>Complete standardized multiple-choice tests to earn certified credentials for your profile.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Assessments Listings Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {assessments.map((ass, i) => (
                  <Card key={i} style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{ass.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', backgroundColor: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {ass.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                        ⏱ {ass.duration_minutes} mins • {ass.total_questions} questions
                      </p>
                      {ass.attempt_status && (
                        <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                          Status:{' '}
                          <strong style={{ color: ass.attempt_status === 'completed' ? 'var(--success)' : 'var(--error)' }}>
                            {ass.attempt_status === 'completed' ? `Passed (${ass.score}%)` : `Failed (${ass.score}%)`}
                          </strong>
                        </div>
                      )}
                    </div>
                    <div>
                      {ass.attempt_status === 'completed' ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          border: '2px solid var(--success)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--success)',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}>
                          Passed 🎖
                        </span>
                      ) : (
                        <Button variant="primary" onClick={() => handleStartQuiz(ass)}>
                          {ass.attempt_status === 'failed' ? 'Retake Quiz' : 'Start Quiz'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Leaderboard Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Leaderboard rankings</h3>
                  {leaderboard.length === 0 ? (
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Take assessments to begin ranking on the leaderboard.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {leaderboard.map((student, rankIdx) => (
                        <div key={rankIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{
                              fontWeight: 'bold',
                              color: rankIdx === 0 ? '#FBBC05' : rankIdx === 1 ? '#94A3B8' : rankIdx === 2 ? '#B45309' : 'var(--text-light)',
                              fontSize: '1rem',
                              width: '20px'
                            }}>
                              #{rankIdx + 1}
                            </span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{student.name}</span>
                          </div>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{student.total_score} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Quiz Result Modal */}
      <Modal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} title="Assessment Result">
        {quizResult && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>
              {quizResult.status === 'completed' ? '🏅' : '❌'}
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              {quizResult.status === 'completed' ? 'Assessment Passed!' : 'Assessment Failed'}
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              You scored {quizResult.score}% on the {quizResult.title}.
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              {quizResult.message}
            </p>
            <Button variant="primary" onClick={() => setSuccessModalOpen(false)}>Close</Button>
          </div>
        )}
      </Modal>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </StudentLayout>
  );
};

export default SkillAssessment;
