// Uses global fetch in Node 18+

async function runFullAuthVerification() {
  const BASE = 'http://localhost:5000/api/v1';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('  [PASS]', message);
      passed++;
    } else {
      console.error('  [FAIL]', message);
      failed++;
    }
  }

  console.log('=== 1. VERIFYING STUDENT AUTHENTICATION ===');
  const sRes = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ email: '2312026@nec.edu.in', password: 'Mathujaa@03' })
  });
  assert(sRes.status === 200, 'Student login HTTP status is 200');
  const sData = await sRes.json();
  assert(sData.status === 'success', 'Student login payload status is success');
  assert(typeof sData.token === 'string' && sData.token.length > 20, 'Student token returned');
  assert(sData.user?.role === 'student', 'Student user role is student');
  assert(sData.user?.is_verified === 1, 'Student is_verified is 1');

  // Verify second student email (mathujaa@gmail.com)
  const sRes2 = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ email: 'mathujaa@gmail.com', password: 'Mathujaa@03' })
  });
  assert(sRes2.status === 200, 'Student (mathujaa@gmail.com) login HTTP status is 200');
  const sData2 = await sRes2.json();
  assert(sData2.user?.role === 'student', 'Student user role is student');

  // Validate student /auth/me
  const sMe = await fetch(BASE + '/auth/me', {
    headers: { 'Authorization': 'Bearer ' + sData.token }
  });
  assert(sMe.status === 200, 'Student /auth/me session check returns 200');
  const sMeData = await sMe.json();
  assert(sMeData.user?.email === '2312026@nec.edu.in', 'Student /auth/me returns correct user');

  // Validate student dashboard
  const sDash = await fetch(BASE + '/student/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + sData.token }
  });
  assert(sDash.status === 200, 'Student dashboard-stats returns 200');

  console.log('\n=== 2. VERIFYING EMPLOYER AUTHENTICATION ===');
  const eRes = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ email: 'majaa@infosys.com', password: 'Employer@123' })
  });
  assert(eRes.status === 200, 'Employer login HTTP status is 200');
  const eData = await eRes.json();
  assert(eData.status === 'success', 'Employer login payload status is success');
  assert(typeof eData.token === 'string' && eData.token.length > 20, 'Employer token returned');
  assert(eData.user?.role === 'employer', 'Employer user role is employer');
  assert(eData.user?.profile?.company_name === 'Infosys', 'Employer company profile loaded');

  // Validate employer dashboard
  const eDash = await fetch(BASE + '/employer/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + eData.token }
  });
  assert(eDash.status === 200, 'Employer dashboard-stats returns 200');

  console.log('\n=== 3. VERIFYING ADMIN AUTHENTICATION ===');
  const aRes = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ email: 'admin@careerportal.com', password: 'Admin@123' })
  });
  assert(aRes.status === 200, 'Admin login HTTP status is 200');
  const aData = await aRes.json();
  assert(aData.status === 'success', 'Admin login payload status is success');
  assert(typeof aData.token === 'string' && aData.token.length > 20, 'Admin token returned');
  assert(aData.user?.role === 'admin', 'Admin user role is admin');

  // Validate admin dashboard
  const aDash = await fetch(BASE + '/admin/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + aData.token }
  });
  assert(aDash.status === 200, 'Admin dashboard-stats returns 200');

  console.log('\n=== 4. VERIFYING RBAC ROUTE GUARDS ===');
  const sToAdmin = await fetch(BASE + '/admin/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + sData.token }
  });
  assert(sToAdmin.status === 403, 'Student blocked from Admin endpoints (403)');

  const sToEmployer = await fetch(BASE + '/employer/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + sData.token }
  });
  assert(sToEmployer.status === 403, 'Student blocked from Employer endpoints (403)');

  const eToAdmin = await fetch(BASE + '/admin/dashboard-stats', {
    headers: { 'Authorization': 'Bearer ' + eData.token }
  });
  assert(eToAdmin.status === 403, 'Employer blocked from Admin endpoints (403)');

  const anonToAdmin = await fetch(BASE + '/admin/dashboard-stats');
  assert(anonToAdmin.status === 401, 'Anonymous request blocked (401)');

  console.log('\n=== 5. VERIFYING FAILED LOGIN HANDLING AND AUDIT LOGS ===');
  const failRes = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:5173' },
    body: JSON.stringify({ email: 'ghost.user@nonexistent.domain', password: 'WrongPassword@123' })
  });
  assert(failRes.status === 401, 'Nonexistent email returns 401');
  const failData = await failRes.json();
  assert(failData.status === 'fail', 'Failed response has status fail');
  assert(failData.message === 'Incorrect email or password.', 'Expected sanitized error message returned');

  console.log('\n=======================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed > 0) process.exit(1);
  process.exit(0);
}

runFullAuthVerification();
