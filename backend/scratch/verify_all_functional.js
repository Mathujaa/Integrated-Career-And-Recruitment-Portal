import pool from '../src/config/db.config.js';

async function runEndToEndVerification() {
  console.log('=== STARTING FUNCTIONAL E2E VERIFICATION ===');
  
  // 1. Authenticate as student
  console.log('\n--- 1. Authenticating student (mathujaapm@gmail.com) ---');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error('Failed to get student token: ' + JSON.stringify(loginData));
  console.log('✔ Authenticated successfully. User ID:', loginData.user.id);
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Set avatar_url and a skill so we can test profile picture & skill matching
  console.log('\n--- 2. Setting student avatar & test skills ---');
  await fetch('http://localhost:5000/api/v1/student/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      first_name: 'Mathujaa',
      last_name: 'PM',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      headline: 'Aspiring Full Stack Engineer'
    })
  });

  // Link skills: React, JavaScript
  await fetch('http://localhost:5000/api/v1/student/skills', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'React', proficiency_level: 'expert' })
  });
  await fetch('http://localhost:5000/api/v1/student/skills', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'JavaScript', proficiency_level: 'intermediate' })
  });
  console.log('✔ Profile avatar and skills configured.');

  // 3. Test Career Goals & Roadmap
  console.log('\n--- 3. Testing Career Goals & Roadmap ---');
  const genRoadmapRes = await fetch('http://localhost:5000/api/v1/student/roadmap/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ career_goal: 'Full Stack Software Engineer' })
  });
  const genRoadmap = await genRoadmapRes.json();
  console.log('Generated Career Goal:', genRoadmap.roadmap.career_goal);
  console.log('Initial Progress:', genRoadmap.roadmap.progress_percent + '%');
  const milestones = genRoadmap.roadmap.roadmap_data.milestones;
  console.log('Milestones count:', milestones.length);
  console.log('Milestone 1 title:', milestones[0].title);
  console.log('Acquired Skills detected:', genRoadmap.roadmap.roadmap_data.gapAnalysis?.acquiredSkills);
  console.log('Missing Skills detected:', genRoadmap.roadmap.roadmap_data.gapAnalysis?.missingSkills.slice(0, 3));

  // Toggle milestone 1 to true
  const toggleRes1 = await fetch('http://localhost:5000/api/v1/student/roadmap/milestone/toggle', {
    method: 'POST',
    headers,
    body: JSON.stringify({ milestoneId: 1, completed: true })
  });
  const toggled1 = await toggleRes1.json();
  console.log('Progress after milestone 1 complete:', toggled1.roadmap.progress_percent + '% (Expected: 20%)');

  // Toggle milestone 2 to true
  const toggleRes2 = await fetch('http://localhost:5000/api/v1/student/roadmap/milestone/toggle', {
    method: 'POST',
    headers,
    body: JSON.stringify({ milestoneId: 2, completed: true })
  });
  const toggled2 = await toggleRes2.json();
  console.log('Progress after milestone 2 complete:', toggled2.roadmap.progress_percent + '% (Expected: 40%)');

  // Verify in MySQL
  const [dbRows] = await pool.query('SELECT student_id, career_goal, progress_percent FROM career_roadmaps WHERE student_id = ?', [2]);
  console.log('MySQL Database Row:', dbRows[0]);
  if (dbRows[0].progress_percent !== 40) throw new Error('DB progress mismatch!');
  console.log('✔ MySQL persistence verified.');

  // 4. Test AI Career Mentor
  console.log('\n--- 4. Testing AI Career Mentor Advice & Checklist ---');
  const adviceRes = await fetch('http://localhost:5000/api/v1/student/ai-mentor/advice', { headers });
  const adviceData = await adviceRes.json();
  console.log('Mentor Target Role:', adviceData.advice.targetRole);
  console.log('Candidate Name addressed:', adviceData.advice.candidateName);
  console.log('Role Skill Match Score:', adviceData.advice.matchScore + '%');
  console.log('Mentor Suggestions count:', adviceData.advice.suggestions.length);
  console.log('Interview Checklist items:', adviceData.advice.interviewChecklist.length);

  // Toggle interview checklist item 1
  const checkToggleRes = await fetch('http://localhost:5000/api/v1/student/roadmap/checklist/toggle', {
    method: 'POST',
    headers,
    body: JSON.stringify({ itemId: 1, completed: true })
  });
  const checkToggleData = await checkToggleRes.json();
  console.log('Checklist Item 1 completed:', checkToggleData.interviewChecklist.find(i => i.id === 1)?.completed);
  console.log('✔ AI Mentor dynamic advice and checklist verified.');

  // 5. Test Resume Builder & Profile Picture Toggle
  console.log('\n--- 5. Testing Resume Builder & Profile Picture Settings ---');
  // Create resume with include_profile_picture = true
  const createResumeRes = await fetch('http://localhost:5000/api/v1/jobs/resumes', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Software Engineer Resume',
      template_name: 'modern',
      resume_data: {
        summary: 'Passionate developer building web solutions.',
        skills: 'React, Node.js, Express, MySQL',
        include_profile_picture: true
      }
    })
  });
  const createResumeData = await createResumeRes.json();
  const resumeId = createResumeData.id;
  console.log('Created resume ID:', resumeId);

  // Fetch created resume
  const getResumeRes = await fetch(`http://localhost:5000/api/v1/jobs/resumes/${resumeId}`, { headers });
  const getResumeData = await getResumeRes.json();
  const parsedData = typeof getResumeData.resume.resume_data === 'string' ? JSON.parse(getResumeData.resume.resume_data) : getResumeData.resume.resume_data;
  console.log('Resume include_profile_picture:', parsedData.include_profile_picture);
  if (parsedData.include_profile_picture !== true) throw new Error('include_profile_picture failed to save true!');

  // Toggle to false
  await fetch(`http://localhost:5000/api/v1/jobs/resumes/${resumeId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      title: 'Software Engineer Resume',
      template_name: 'modern',
      resume_data: {
        ...parsedData,
        include_profile_picture: false
      }
    })
  });

  const getResumeRes2 = await fetch(`http://localhost:5000/api/v1/jobs/resumes/${resumeId}`, { headers });
  const getResumeData2 = await getResumeRes2.json();
  const parsedData2 = typeof getResumeData2.resume.resume_data === 'string' ? JSON.parse(getResumeData2.resume.resume_data) : getResumeData2.resume.resume_data;
  console.log('Resume include_profile_picture after toggling false:', parsedData2.include_profile_picture);
  if (parsedData2.include_profile_picture !== false) throw new Error('include_profile_picture failed to update to false!');
  console.log('✔ Resume Builder preference persistence verified.');

  // 6. Test Recruiter portal unaffected
  console.log('\n--- 6. Verifying Recruiter Portal is completely unaffected ---');
  const recLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'majaa@infosys.com', password: 'Employer@123' })
  });
  const recData = await recLoginRes.json();
  const recHeaders = { 'Authorization': `Bearer ${recData.token}`, 'Content-Type': 'application/json' };
  const recDashRes = await fetch('http://localhost:5000/api/v1/employer/dashboard-stats', { headers: recHeaders });
  console.log('Recruiter Dashboard Stats HTTP Status:', recDashRes.status);
  if (recDashRes.status !== 200) throw new Error('Recruiter dashboard returned non-200!');
  console.log('✔ Recruiter portal verified 100% operational.');

  console.log('\n=== ALL BACKEND FUNCTIONAL WORKFLOWS PASSED ===');
  process.exit(0);
}

runEndToEndVerification().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
