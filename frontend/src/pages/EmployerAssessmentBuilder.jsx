import React, { useEffect, useState } from 'react';
import EmployerLayout from '../components/EmployerLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import apiClient from '../services/api.client';
import '../styles/pages.css';

const EmployerAssessmentBuilder = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Parameters
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programming');
  const [duration, setDuration] = useState('30');
  const [jobId, setJobId] = useState('');
  
  // Questions array
  const [questions, setQuestions] = useState([]);
  
  // Current editing question structure
  const [currQ, setCurrQ] = useState({
    question_text: '',
    type: 'mcq',
    difficulty: 'medium',
    points: 10,
    options: ['', '', '', ''],
    correct_answer: '0'
  });

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiClient.get('/employer/jobs');
      setJobs(response.data.jobs);
      if (response.data.jobs?.length > 0) {
        setJobId(response.data.jobs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!currQ.question_text.trim()) {
      showToast('Question text cannot be blank.', 'error');
      return;
    }
    
    // Validate MCQ parameters
    if (currQ.type === 'mcq') {
      if (currQ.options.some(opt => !opt.trim())) {
        showToast('All MCQ options must be populated.', 'error');
        return;
      }
    }

    setQuestions([...questions, { ...currQ }]);
    
    // Reset question builder form
    setCurrQ({
      question_text: '',
      type: 'mcq',
      difficulty: 'medium',
      points: 10,
      options: ['', '', '', ''],
      correct_answer: '0'
    });
    showToast('Question added to placement assessment package.');
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...currQ.options];
    updated[idx] = val;
    setCurrQ({ ...currQ, options: updated });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      showToast('Please specify an assessment title.', 'error');
      return;
    }
    if (questions.length === 0) {
      showToast('Please add at least 1 question before publishing.', 'error');
      return;
    }

    const payload = {
      title,
      category,
      duration_minutes: parseInt(duration),
      job_id: jobId,
      questions
    };

    try {
      await apiClient.post('/employer/assessments', payload);
      showToast('Skill assessment compiled & published successfully!');
      setTitle('');
      setQuestions([]);
    } catch (err) {
      console.error(err);
      showToast('Failed to compile and publish assessment.', 'error');
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner size="lg" />
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side Column: Assessment Parameters & Creator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skill Assessment Compiler</h2>
            <p style={{ color: 'var(--text-muted)' }}>Assemble coding tests, custom MCQs, or fill-in-blanks checks.</p>
          </div>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>1. General parameters</h3>
            <Input label="Assessment Title" id="assTitle" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. React hooks core skills check" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="input-group">
                <label className="input-label">Linked Position</label>
                <select className="input-field" value={jobId} onChange={(e) => setJobId(e.target.value)} style={{ appearance: 'auto' }}>
                  {jobs.map((j, idx) => (
                    <option key={idx} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
              <Input label="Time Duration (Minutes)" type="number" id="assDur" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </div>

            <div className="input-group" style={{ marginTop: '16px', marginBottom: 0 }}>
              <label className="input-label">Domain Subject Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} style={{ appearance: 'auto' }}>
                <option value="Programming">Programming / Software</option>
                <option value="Database">Database Systems</option>
                <option value="Frontend">Frontend UI Layouts</option>
                <option value="General Aptitude">General Aptitude</option>
              </select>
            </div>
          </Card>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>2. Add a Question</h3>
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="input-group">
                <label className="input-label">Question Text Prompt</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={currQ.question_text}
                  onChange={(e) => setCurrQ({ ...currQ, question_text: e.target.value })}
                  required
                  placeholder="e.g. Which keyword binds context parameters in JavaScript?"
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Question Type</label>
                  <select className="input-field" value={currQ.type} onChange={(e) => setCurrQ({ ...currQ, type: e.target.value })} style={{ appearance: 'auto' }}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="blank">Fill in Blanks</option>
                    <option value="output">Output Guessing</option>
                    <option value="coding">Coding Sandbox</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Difficulty Rating</label>
                  <select className="input-field" value={currQ.difficulty} onChange={(e) => setCurrQ({ ...currQ, difficulty: e.target.value })} style={{ appearance: 'auto' }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Dynamic question parameters based on type */}
              {currQ.type === 'mcq' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="input-label">Configure MCQ Choices (Fill All)</label>
                  {currQ.options.map((opt, i) => (
                    <Input key={i} label={`Choice option ${i + 1}`} id={`mcqOpt${i}`} value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} required />
                  ))}
                  <div className="input-group">
                    <label className="input-label">Index of Correct Answer (0-3)</label>
                    <select className="input-field" value={currQ.correct_answer} onChange={(e) => setCurrQ({ ...currQ, correct_answer: e.target.value })} style={{ appearance: 'auto' }}>
                      <option value="0">Option 1</option>
                      <option value="1">Option 2</option>
                      <option value="2">Option 3</option>
                      <option value="3">Option 4</option>
                    </select>
                  </div>
                </div>
              )}

              {currQ.type === 'true_false' && (
                <div className="input-group">
                  <label className="input-label">Correct Assertion</label>
                  <select className="input-field" value={currQ.correct_answer} onChange={(e) => setCurrQ({ ...currQ, correct_answer: e.target.value })} style={{ appearance: 'auto' }}>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              )}

              {(currQ.type === 'blank' || currQ.type === 'output' || currQ.type === 'coding') && (
                <Input label="Target Correct Answer String" id="qAns" value={currQ.correct_answer} onChange={(e) => setCurrQ({ ...currQ, correct_answer: e.target.value })} required placeholder="Expected exact string match" />
              )}

              <Button type="submit" variant="outline" style={{ marginTop: '12px' }}>+ Add Question to Package</Button>
            </form>
          </Card>
        </div>

        {/* Right Side Column: Live Package compilation details */}
        <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ minHeight: '400px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-light)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Active Compiler Bundle</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{questions.length} questions added</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '55vh', overflowY: 'auto', marginBottom: '24px' }}>
              {questions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '60px' }}>
                  No questions built into the package yet. Use the question builder.
                </p>
              ) : (
                questions.map((q, idx) => (
                  <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', textTransform: 'uppercase' }}>
                        Q{idx + 1}: {q.type} ({q.difficulty})
                      </span>
                      <Button variant="text" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} style={{ color: 'var(--error)', padding: 0 }}>
                        &times;
                      </Button>
                    </div>
                    <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-main)', marginBottom: '6px' }}>{q.question_text}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Answer key: "{q.correct_answer}"</span>
                  </div>
                ))
              )}
            </div>

            {questions.length > 0 && (
              <Button variant="primary" onClick={handlePublish} style={{ width: '100%', padding: '12px' }}>
                Publish Assessment Bundle
              </Button>
            )}
          </Card>
        </div>

      </div>

      {toastMsg && (
        <div className="toast-container">
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
        </div>
      )}
    </EmployerLayout>
  );
};

export default EmployerAssessmentBuilder;
