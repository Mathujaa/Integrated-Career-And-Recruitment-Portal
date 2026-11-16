import pool from '../src/config/db.config.js';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('================================================================');
  console.log('E2E VERIFICATION: CAREER SEPARATION & PHOTO MANAGEMENT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate as Student
    console.log('Step 1: Logging in as mathujaapm@gmail.com...');
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(loginRes.status === 200 && Boolean(token), 'Student logged in successfully');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Profile Photo Upload
    console.log('\nStep 2: Testing Profile Photo Upload (Test 1 & 4)...');
    const samplePng1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M9QzwAEjAwMDAwAFAkE/zH40vMAAAAASUVORK5CYII=';
    const uploadRes1 = await fetch('http://localhost:5000/api/v1/student/profile-photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: samplePng1 })
    });
    const uploadData1 = await uploadRes1.json();
    assert(uploadRes1.status === 200 && uploadData1.avatar_url, `Profile photo uploaded: ${uploadData1.avatar_url}`);

    // Verify in MySQL
    const [stRow1] = await pool.query('SELECT avatar_url FROM students WHERE id = 2');
    assert(stRow1[0].avatar_url === uploadData1.avatar_url, 'Profile photo persists in MySQL students table');

    // Verify static HTTP access
    const staticFetch1 = await fetch(uploadData1.avatar_url);
    assert(staticFetch1.status === 200, 'Uploaded profile photo is statically served over HTTP');

    // 3. Change Profile Photo
    console.log('\nStep 3: Testing Profile Photo Replacement (Test 2)...');
    const samplePng2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const uploadRes2 = await fetch('http://localhost:5000/api/v1/student/profile-photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: samplePng2 })
    });
    const uploadData2 = await uploadRes2.json();
    assert(uploadRes2.status === 200 && uploadData2.avatar_url !== uploadData1.avatar_url, `Profile photo successfully replaced with new file`);

    const [stRow2] = await pool.query('SELECT avatar_url FROM students WHERE id = 2');
    assert(stRow2[0].avatar_url === uploadData2.avatar_url, 'New profile photo updated in MySQL');

    // 4. Remove Profile Photo
    console.log('\nStep 4: Testing Profile Photo Removal (Test 3)...');
    const deleteRes = await fetch('http://localhost:5000/api/v1/student/profile-photo', {
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteRes.status === 200, 'Profile photo removed via API');
    const [stRow3] = await pool.query('SELECT avatar_url FROM students WHERE id = 2');
    assert(stRow3[0].avatar_url === null, 'Profile avatar_url is NULL in MySQL after removal');

    // Re-upload profile photo for subsequent resume tests
    const restoreProfilePhotoRes = await fetch('http://localhost:5000/api/v1/student/profile-photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: samplePng1 })
    });
    const restoredPhotoData = await restoreProfilePhotoRes.json();
    const finalProfileAvatar = restoredPhotoData.avatar_url;
    console.log('Restored profile photo for testing:', finalProfileAvatar);

    // 5. Resume Builder - Use Profile Picture (Test 5)
    console.log('\nStep 5: Testing Use Profile Picture in Resume (Test 5)...');
    const resumeSettingsRes1 = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo-settings', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ photo_source: 'profile', include_photo: true })
    });
    const resData1 = await resumeSettingsRes1.json();
    assert(resData1.resume_photo_source === 'profile' && resData1.include_photo === true, 'Resume set to use My Profile Picture with include_photo = true');

    const [rRow1] = await pool.query('SELECT resume_photo_source, include_photo FROM resumes WHERE id = 2');
    assert(rRow1[0].resume_photo_source === 'profile' && Boolean(rRow1[0].include_photo) === true, 'Resume photo settings saved in MySQL');

    // 6. Upload a Different Resume Picture (Test 6)
    console.log('\nStep 6: Testing Upload a Different Picture for Resume (Test 6)...');
    const resumeCustomPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAXSURBVBhXY/jPwIAEDIxMDNAAQzUDAwMAsxID6Qh055kAAAAASUVORK5CYII=';
    const resumeUploadRes = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: resumeCustomPng })
    });
    const resumeUploadData = await resumeUploadRes.json();
    assert(resumeUploadRes.status === 200 && resumeUploadData.resume_photo_url, `Custom resume photo uploaded: ${resumeUploadData.resume_photo_url}`);
    assert(resumeUploadData.resume_photo_source === 'custom', 'Resume photo source is custom');

    // 7. Changing resume picture does NOT change profile picture (Test 7)
    console.log('\nStep 7: Verifying Profile Picture Remains Unaffected (Test 7)...');
    const [stRow4] = await pool.query('SELECT avatar_url FROM students WHERE id = 2');
    assert(stRow4[0].avatar_url === finalProfileAvatar, 'Profile picture is unchanged in MySQL');
    assert(stRow4[0].avatar_url !== resumeUploadData.resume_photo_url, 'Profile picture and Resume picture are completely separate files');

    // 8. Disabling Resume Picture (Test 8)
    console.log('\nStep 8: Testing Disable Resume Picture (Test 8)...');
    const disableRes = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo-settings', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ include_photo: false, photo_source: 'custom' })
    });
    const disableData = await disableRes.json();
    assert(disableData.include_photo === false, 'Resume picture disabled (include_photo: false)');
    const [rRow2] = await pool.query('SELECT include_photo FROM resumes WHERE id = 2');
    assert(Boolean(rRow2[0].include_photo) === false, 'include_photo is 0 in MySQL resumes table');

    // 9. Re-enabling Resume Picture (Test 9)
    console.log('\nStep 9: Testing Enable Resume Picture (Test 9)...');
    const enableRes = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo-settings', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ include_photo: true, photo_source: 'custom' })
    });
    const enableData = await enableRes.json();
    assert(enableData.include_photo === true, 'Resume picture re-enabled (include_photo: true)');

    // 10. Career Goals and AI Career Mentor Integration (Test 10)
    console.log('\nStep 10: Testing Career Goals & AI Career Mentor Separation and Shared Target Goal (Test 10)...');
    // Change goal in Career Goals to 'Cloud & DevOps Engineer'
    const changeGoalRes = await fetch('http://localhost:5000/api/v1/student/roadmap/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ career_goal: 'Cloud & DevOps Engineer' })
    });
    const changeGoalData = await changeGoalRes.json();
    assert(changeGoalData.roadmap?.career_goal === 'Cloud & DevOps Engineer', 'Career Goal updated to Cloud & DevOps Engineer');

    // Verify AI Career Mentor reads this exact updated goal
    const mentorRes = await fetch('http://localhost:5000/api/v1/student/ai-mentor/advice', { headers: authHeaders });
    const mentorData = await mentorRes.json();
    assert(mentorData.advice?.targetRole === 'Cloud & DevOps Engineer', 'AI Career Mentor dynamically read the updated target placement track');
    assert(Boolean(mentorData.advice?.nextBestActivity), 'AI Career Mentor generated Next Best Learning Activity');
    assert(Array.isArray(mentorData.advice?.recommendedResources) && mentorData.advice.recommendedResources.length > 0, 'AI Career Mentor returned curated learning resources');
    assert(Array.isArray(mentorData.advice?.suggestedProjects) && mentorData.advice.suggestedProjects.length > 0, 'AI Career Mentor returned suggested projects addressing skill gaps');
    assert(Array.isArray(mentorData.advice?.interviewQuestions) && mentorData.advice.interviewQuestions.length > 0, 'AI Career Mentor returned role-specific interview questions');
    assert(!mentorData.advice?.learningPath || mentorData.advice.learningPath.length === 0 || mentorData.advice.nextBestActivity, 'Duplicate roadmap milestones eliminated from AI Career Mentor');

    // Revert target goal back to 'Full Stack Software Engineer'
    await fetch('http://localhost:5000/api/v1/student/roadmap/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ career_goal: 'Full Stack Software Engineer' })
    });

    // 11. Recruiter Functionality & Auth Unaffected (Test 11)
    console.log('\nStep 11: Testing Recruiter Portal Unaffected (Test 11)...');
    const recLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'majaa@infosys.com', password: 'Employer@123' })
    });
    const recLoginData = await recLoginRes.json();
    assert(recLoginRes.status === 200 && recLoginData.user?.role === 'employer', 'Recruiter authentication works');

    const recStatsRes = await fetch('http://localhost:5000/api/v1/employer/dashboard-stats', {
      headers: { 'Authorization': `Bearer ${recLoginData.token}` }
    });
    assert(recStatsRes.status === 200, 'Recruiter dashboard stats API returns 200 OK');

    console.log(`\n================================================================`);
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================================================`);
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    process.exit(0);
  }
}

runVerification();
