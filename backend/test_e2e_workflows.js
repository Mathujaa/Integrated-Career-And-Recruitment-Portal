import pool from './src/config/db.config.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

const results = [];
function record(id, module, scenario, expected, actual, pass) {
  results.push({ id, module, scenario, expected, actual, pass });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] [${id}] ${scenario}`);
}

async function runTests() {
  console.log('========================================');
  console.log('STARTING COMPLETE END-TO-END AUDIT SUITE');
  console.log('========================================\n');

  // Clean up any previous test runs for these specific emails
  const testStudentEmail = 'audit.student.workflow@portal.com';
  const testRecruiterEmail = 'audit.recruiter.workflow@portal.com';
  await pool.query('DELETE FROM users WHERE email IN (?, ?)', [testStudentEmail, testRecruiterEmail]);

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 1: STUDENT PLACEMENT LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- EXECUTING WORKFLOW 1: STUDENT PLACEMENT ---');

  // TC-01: Student Registration
  const regStudentRes = await request('/auth/register/student', {
    method: 'POST',
    body: JSON.stringify({
      first_name: 'AuditStudent',
      last_name: 'Tester',
      email: testStudentEmail,
      password: 'Password123!',
      phone: '9876543210'
    })
  });
  record('TC-STU-01', 'Student Module', 'Student account registration', 201, regStudentRes.status, regStudentRes.status === 201);

  // Directly verify user in MySQL and auto-verify for testing workflow
  const [createdStudentUser] = await pool.query('SELECT * FROM users WHERE email = ?', [testStudentEmail]);
  await pool.query('UPDATE users SET is_verified = 1 WHERE email = ?', [testStudentEmail]);
  const isStudentInDB = createdStudentUser.length > 0;
  record('TC-STU-02', 'Student Module', 'Verify student in MySQL users and students tables', true, isStudentInDB, isStudentInDB);

  // TC-03: Student Login
  const studentLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testStudentEmail, password: 'Password123!' })
  });
  const studentToken = studentLoginRes.data.token;
  const studentId = studentLoginRes.data.user?.id;
  record('TC-STU-03', 'Student Module', 'Student login and JWT generation', 200, studentLoginRes.status, studentLoginRes.status === 200 && !!studentToken);

  // TC-04: Student Profile Update
  const updateProfileRes = await request('/student/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      first_name: 'AuditStudent',
      last_name: 'Tester',
      phone: '9876543210',
      headline: 'Full Stack Developer Enthusiast',
      bio: 'Auditing end-to-end recruitment capabilities.',
      github_url: 'https://github.com/tester',
      linkedin_url: 'https://linkedin.com/in/tester'
    })
  });
  record('TC-STU-04', 'Student Module', 'Student profile update', 200, updateProfileRes.status, updateProfileRes.status === 200);

  // TC-05: Add Education, Experience, Skill
  const addEduRes = await request('/student/education', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      institution_name: 'National Engineering College',
      degree: 'B.E',
      field_of_study: 'Computer Science and Engineering',
      start_date: '2022-09-01',
      end_date: '2026-05-30',
      grade_gpa: '8.8/10',
      description: 'Focus on Distributed Systems and Relational Databases'
    })
  });
  record('TC-STU-05', 'Student Module', 'Add student academic education', 201, addEduRes.status, addEduRes.status === 201);

  const addSkillRes = await request('/student/skills', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ name: 'React', proficiency_level: 'advanced' })
  });
  record('TC-STU-06', 'Student Module', 'Link skill to student profile', 201, addSkillRes.status, addSkillRes.status === 201);

  // TC-07: Search Jobs
  const searchJobsRes = await request('/jobs', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const availableJobs = searchJobsRes.data.jobs || [];
  record('TC-JOB-01', 'Job Module', 'Student job catalog browsing', 200, searchJobsRes.status, searchJobsRes.status === 200 && availableJobs.length > 0);

  // Use the first active job for application
  const targetJob = availableJobs[0];
  const targetJobId = targetJob.id;

  // TC-08: Save / Bookmark Job
  const saveJobRes = await request(`/jobs/details/${targetJobId}/save`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('TC-JOB-02', 'Job Module', 'Bookmark/Save job posting', 200, saveJobRes.status, saveJobRes.status === 200);

  // TC-09: Apply for Job
  const applyJobRes = await request(`/jobs/details/${targetJobId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ coverLetter: 'I am excited to apply for this engineering position.' })
  });
  record('TC-APP-01', 'Application Module', 'Submit job application', 201, applyJobRes.status, applyJobRes.status === 201);

  // Verify application in MySQL
  const [appInDB] = await pool.query('SELECT * FROM applications WHERE student_id = ? AND job_id = ?', [studentId, targetJobId]);
  const applicationId = appInDB[0]?.id;
  record('TC-APP-02', 'Application Module', 'Verify application persistence in MySQL', true, appInDB.length > 0, appInDB.length > 0);

  // TC-10: Recruiter Login & Applicant Review
  const employerLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'majaa@infosys.com', password: 'Employer@123' })
  });
  const employerToken = employerLoginRes.data.token;
  const employerId = employerLoginRes.data.user?.id;
  record('TC-EMP-01', 'Employer Module', 'Recruiter login with valid credentials', 200, employerLoginRes.status, employerLoginRes.status === 200 && !!employerToken);

  // Employer reviews applicants
  const getApplicantsRes = await request(`/employer/jobs/${targetJobId}/applicants`, {
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  const applicants = getApplicantsRes.data.applicants || [];
  const foundApplicant = applicants.find(a => a.student_id === studentId);
  record('TC-EMP-02', 'Employer Module', 'Recruiter views job applicants list', 200, getApplicantsRes.status, getApplicantsRes.status === 200 && !!foundApplicant);

  // TC-11: Recruiter Shortlists Applicant
  const shortlistRes = await request(`/employer/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({ status: 'shortlisted' })
  });
  record('TC-EMP-03', 'Employer Module', 'Recruiter shortlists applicant', 200, shortlistRes.status, shortlistRes.status === 200);

  // Verify applicant status in DB
  const [updatedApp] = await pool.query('SELECT status FROM applications WHERE id = ?', [applicationId]);
  record('TC-EMP-04', 'Employer Module', 'Verify application status updated to shortlisted in MySQL', 'shortlisted', updatedApp[0]?.status, updatedApp[0]?.status === 'shortlisted');

  // Verify student received in-app notification
  const [studentNotifs] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 1', [studentId]);
  record('TC-NOTIF-01', 'Notification Module', 'Student received shortlist notification in DB', true, studentNotifs.length > 0, studentNotifs.length > 0);

  // TC-12: Recruiter Creates Assessment
  const createAssRes = await request('/employer/assessments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'Full Stack Diagnostic Assessment',
      category: 'Software Engineering',
      duration_minutes: 20,
      passing_score: 70,
      questions: [
        {
          question_text: 'What hook is used for memoized computations in React?',
          type: 'mcq',
          points: 50,
          options: ['useEffect', 'useMemo', 'useRef', 'useState'],
          correct_answer: 'useMemo'
        },
        {
          question_text: 'Which SQL keyword ensures ACID transaction isolation?',
          type: 'mcq',
          points: 50,
          options: ['ISOLATION', 'TRANSACTION', 'COMMIT', 'BEGIN'],
          correct_answer: 'TRANSACTION'
        }
      ]
    })
  });
  const assessmentId = createAssRes.data.id;
  record('TC-ASS-01', 'Assessment Module', 'Recruiter creates custom technical assessment', 201, createAssRes.status, createAssRes.status === 201 && !!assessmentId);

  // TC-13: Student Submits Assessment Quiz
  const submitAssRes = await request(`/student/assessments/${assessmentId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      score: 100,
      answers: { 0: 'useMemo', 1: 'TRANSACTION' },
      timeTaken: 180
    })
  });
  record('TC-ASS-02', 'Assessment Module', 'Student submits assessment quiz', 200, submitAssRes.status, submitAssRes.status === 200);

  // Verify assessment result in MySQL
  const [assResultDB] = await pool.query('SELECT * FROM assessment_results WHERE student_id = ? AND assessment_id = ?', [studentId, assessmentId]);
  record('TC-ASS-03', 'Assessment Module', 'Verify assessment score recorded in MySQL', 'pass', assResultDB[0]?.status, assResultDB[0]?.status === 'pass');

  // TC-14: Recruiter Schedules Interview
  const schedInterviewRes = await request('/employer/interviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      student_id: studentId,
      job_id: targetJobId,
      date: '2026-12-01',
      time: '11:00',
      mode: 'online',
      location_link: 'https://meet.google.com/test-room',
      notes: 'Final technical interview with engineering lead.'
    })
  });
  const interviewId = schedInterviewRes.data.id;
  record('TC-INT-01', 'Interview Module', 'Recruiter schedules candidate interview', 201, schedInterviewRes.status, schedInterviewRes.status === 201 && !!interviewId);

  // Verify interview in MySQL
  const [interviewDB] = await pool.query('SELECT * FROM interviews WHERE id = ?', [interviewId]);
  record('TC-INT-02', 'Interview Module', 'Verify interview persistence in MySQL', 'scheduled', interviewDB[0]?.status, interviewDB[0]?.status === 'scheduled');

  // TC-15: Recruiter Extends Offer Letter
  const createOfferRes = await request('/employer/offers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      student_id: studentId,
      job_id: targetJobId,
      role: 'Associate Software Engineer',
      salary: 850000,
      joining_date: '2026-12-15',
      offer_text: 'Congratulations! We are delighted to offer you this position.'
    })
  });
  const offerId = createOfferRes.data.id;
  record('TC-OFF-01', 'Offer Module', 'Recruiter generates and extends offer letter', 201, createOfferRes.status, createOfferRes.status === 201 && !!offerId);

  // TC-16: Student Accepts Offer
  const respondOfferRes = await request('/student/offers/respond', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ offerId, status: 'accepted' })
  });
  record('TC-OFF-02', 'Offer Module', 'Student responds to offer (accepts)', 200, respondOfferRes.status, respondOfferRes.status === 200);

  // Verify offer status in MySQL
  const [offerInDB] = await pool.query('SELECT status FROM offers WHERE id = ?', [offerId]);
  record('TC-OFF-03', 'Offer Module', 'Verify offer status updated to accepted in MySQL', 'accepted', offerInDB[0]?.status, offerInDB[0]?.status === 'accepted');

  const [historyInDB] = await pool.query('SELECT status FROM offer_status_history WHERE offer_id = ? ORDER BY id DESC LIMIT 1', [offerId]);
  record('TC-OFF-04', 'Offer Module', 'Verify offer status history entry recorded', 'accepted', historyInDB[0]?.status, historyInDB[0]?.status === 'accepted');


  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 2: RECRUITER REGISTRATION & ADMIN APPROVAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- EXECUTING WORKFLOW 2: RECRUITER APPROVAL ---');

  // TC-17: Recruiter Registers
  const regEmpRes = await request('/auth/register/employer', {
    method: 'POST',
    body: JSON.stringify({
      company_name: 'Audit Tech Global',
      email: testRecruiterEmail,
      password: 'Password123!',
      phone: '9876543219'
    })
  });
  record('TC-REC-01', 'Recruiter Module', 'Recruiter company registration', 201, regEmpRes.status, regEmpRes.status === 201);

  // Verify recruiter in MySQL
  const [newRecUser] = await pool.query('SELECT * FROM users WHERE email = ?', [testRecruiterEmail]);
  const newRecId = newRecUser[0]?.id;
  await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [newRecId]);

  // TC-18: Unapproved recruiter tries to log in
  const unapprovedLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testRecruiterEmail, password: 'Password123!' })
  });
  record('TC-REC-02', 'Recruiter Module', 'Unapproved recruiter login blocked (403)', 403, unapprovedLoginRes.status, unapprovedLoginRes.status === 403);

  // TC-19: Admin logs in
  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@careerportal.com', password: 'Admin@123' })
  });
  const adminToken = adminLoginRes.data.token;
  record('TC-ADM-01', 'Admin Module', 'Admin login with secure credentials', 200, adminLoginRes.status, adminLoginRes.status === 200 && !!adminToken);

  // TC-20: Admin approves recruiter
  const approveRecRes = await request(`/admin/recruiters/${newRecId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'approved' })
  });
  record('TC-ADM-02', 'Admin Module', 'Admin approves pending recruiter', 200, approveRecRes.status, approveRecRes.status === 200);

  // Verify approval in MySQL
  const [approvedRecDB] = await pool.query('SELECT status FROM employers WHERE id = ?', [newRecId]);
  record('TC-ADM-03', 'Admin Module', 'Verify recruiter status is approved in MySQL', 'approved', approvedRecDB[0]?.status, approvedRecDB[0]?.status === 'approved');

  // TC-21: Approved recruiter can now log in
  const approvedLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testRecruiterEmail, password: 'Password123!' })
  });
  const approvedRecToken = approvedLoginRes.data.token;
  record('TC-REC-03', 'Recruiter Module', 'Approved recruiter logs in successfully', 200, approvedLoginRes.status, approvedLoginRes.status === 200 && !!approvedRecToken);

  // TC-22: Recruiter creates a new job
  const newJobRes = await request('/employer/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${approvedRecToken}` },
    body: JSON.stringify({
      title: 'Cloud DevOps Engineer',
      description: 'Build Kubernetes clusters and Terraform cloud infrastructure.',
      requirements: 'Docker, Kubernetes, AWS, CI/CD',
      location: 'Hyderabad, India',
      employment_type: 'full-time',
      work_mode: 'hybrid',
      salary_min: 750000,
      salary_max: 1400000
    })
  });
  const newCreatedJobId = newJobRes.data.id;
  record('TC-REC-04', 'Recruiter Module', 'Recruiter posts and publishes new job opportunity', 201, newJobRes.status, newJobRes.status === 201 && !!newCreatedJobId);

  // TC-23: Students can see the newly published job in search
  const studentCheckJobRes = await request('/jobs', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const allCurrentJobs = studentCheckJobRes.data.jobs || [];
  const foundNewJob = allCurrentJobs.find(j => j.id === newCreatedJobId);
  record('TC-REC-05', 'Recruiter Module', 'Newly published job is immediately visible to students', true, !!foundNewJob, !!foundNewJob);


  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 3: ADMIN MANAGEMENT & AUDIT CONTROL
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- EXECUTING WORKFLOW 3: ADMIN MANAGEMENT ---');

  // TC-24: Admin Dashboard Stats
  const adminStatsRes = await request('/admin/dashboard-stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('TC-ADM-04', 'Admin Module', 'Admin retrieves platform analytics dashboard', 200, adminStatsRes.status, adminStatsRes.status === 200 && adminStatsRes.data.stats?.counts?.totalStudents > 0);

  // TC-25: Admin Student Management (Suspend & Activate)
  const suspendStudentRes = await request(`/admin/students/${studentId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'suspended' })
  });
  record('TC-ADM-05', 'Admin Module', 'Admin suspends student account', 200, suspendStudentRes.status, suspendStudentRes.status === 200);

  const [suspendedUserDB] = await pool.query('SELECT status FROM users WHERE id = ?', [studentId]);
  record('TC-ADM-06', 'Admin Module', 'Verify student status is suspended in MySQL', 'suspended', suspendedUserDB[0]?.status, suspendedUserDB[0]?.status === 'suspended');

  // Student tries to access API while suspended -> Expect 403
  const suspendedAccessRes = await request('/student/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('TC-SEC-01', 'Security Module', 'Suspended user blocked from accessing protected APIs (403)', 403, suspendedAccessRes.status, suspendedAccessRes.status === 403);

  // Admin reactivates student
  await request(`/admin/students/${studentId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'active' })
  });

  // TC-26: Admin Job Moderation (Close/Flag)
  const flagJobRes = await request(`/admin/jobs/${newCreatedJobId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'closed' })
  });
  record('TC-ADM-07', 'Admin Module', 'Admin moderates job status (close job)', 200, flagJobRes.status, flagJobRes.status === 200);

  const [jobStatusDB] = await pool.query('SELECT status FROM jobs WHERE id = ?', [newCreatedJobId]);
  record('TC-ADM-08', 'Admin Module', 'Verify job status updated to closed in MySQL', 'closed', jobStatusDB[0]?.status, jobStatusDB[0]?.status === 'closed');

  // TC-27: Admin Interview Rescheduling
  const reschedRes = await request(`/admin/interviews/${interviewId}/reschedule`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ date: '2026-12-05', time: '14:30' })
  });
  record('TC-ADM-09', 'Admin Module', 'Admin reschedules candidate interview', 200, reschedRes.status, reschedRes.status === 200);

  // TC-28: Admin Offers Ledger Listing
  const offersLedgerRes = await request('/admin/offers', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('TC-ADM-10', 'Admin Module', 'Admin retrieves platform offers ledger', 200, offersLedgerRes.status, offersLedgerRes.status === 200 && offersLedgerRes.data.offers?.length > 0);

  // TC-29: Admin Audit Logs
  const auditLogsRes = await request('/admin/audit-logs', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  record('TC-ADM-11', 'Admin Module', 'Admin reviews system activity audit logs', 200, auditLogsRes.status, auditLogsRes.status === 200 && auditLogsRes.data.rows?.length > 0);

  // TC-30: Role-Based Authorization Enforcement
  const forbiddenAccessRes = await request('/admin/dashboard-stats', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  record('TC-SEC-02', 'Security Module', 'Non-admin role blocked from admin APIs (403)', 403, forbiddenAccessRes.status, forbiddenAccessRes.status === 403);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('TEST SUITE EXECUTION SUMMARY');
  console.log('========================================');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`TOTAL TEST SCENARIOS: ${results.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  // Output test results as JSON for test cases report
  console.log('TEST_RESULTS_JSON_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('TEST_RESULTS_JSON_END');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
