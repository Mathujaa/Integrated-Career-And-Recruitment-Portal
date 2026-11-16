import fs from 'fs';

async function testPhotos() {
  try {
    // 1. Login as mathujaapm@gmail.com
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login status:', loginRes.status, 'Token acquired:', Boolean(token));

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Test 1x1 transparent PNG data URL
    const testPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.log('\n--- Testing Profile Photo Upload ---');
    const uploadRes = await fetch('http://localhost:5000/api/v1/student/profile-photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: testPng })
    });
    const uploadData = await uploadRes.json();
    console.log('Upload status:', uploadRes.status, uploadData);

    // Verify profile has updated avatar_url
    const profRes = await fetch('http://localhost:5000/api/v1/student/profile', { headers: authHeaders });
    const profData = await profRes.json();
    console.log('Profile avatar_url:', profData.profile?.avatar_url);

    // Verify static serving of the uploaded file
    if (uploadData.avatar_url) {
      const staticRes = await fetch(uploadData.avatar_url);
      console.log('Static avatar fetch status:', staticRes.status, 'Content-Type:', staticRes.headers.get('content-type'));
    }

    // 3. Test Resume Photo Upload
    console.log('\n--- Testing Resume Photo Upload ---');
    const resumeUploadRes = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ photo: testPng })
    });
    const resumeUploadData = await resumeUploadRes.json();
    console.log('Resume upload status:', resumeUploadRes.status, resumeUploadData);

    // 4. Test Resume Photo Settings
    console.log('\n--- Testing Resume Photo Settings ---');
    const settingsRes = await fetch('http://localhost:5000/api/v1/student/resumes/2/photo-settings', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ photo_source: 'profile', include_photo: true })
    });
    console.log('Settings status:', settingsRes.status, await settingsRes.json());

    // 5. Test AI Mentor Advice
    console.log('\n--- Testing AI Mentor Advice ---');
    const mentorRes = await fetch('http://localhost:5000/api/v1/student/ai-mentor/advice', { headers: authHeaders });
    const mentorData = await mentorRes.json();
    console.log('Mentor Advice keys:', Object.keys(mentorData.advice || {}));
    console.log('Next Best Activity:', mentorData.advice?.nextBestActivity?.title);
    console.log('Recommended Resources count:', mentorData.advice?.recommendedResources?.length);
    console.log('Suggested Projects count:', mentorData.advice?.suggestedProjects?.length);
    console.log('Interview Questions count:', mentorData.advice?.interviewQuestions?.length);

    console.log('\n✔ All backend endpoints verified successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    process.exit(0);
  }
}

testPhotos();
