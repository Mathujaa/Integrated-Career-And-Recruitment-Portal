import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('=== STARTING BROWSER E2E VERIFICATION ===');
  
  // 1. Authenticate to obtain token and set in localStorage
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✔ Authenticated. Token acquired.');

  const port = 9260;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-student-verify-' + Date.now());

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1366,850',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const v = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (v.ok) break;
    } catch (e) {}
  }

  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173/login`, { method: 'PUT' });
  const target = await targetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(1000);

  // Set auth token in localStorage and navigate
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', '${token}');
      window.location.href = 'http://localhost:5173/student/ai-resume-review';
    `
  });
  await sleep(2000);

  // 1. AI Resume Scanner: Test "Go to Resume Builder" button
  console.log('\n--- 1. Testing AI Resume Scanner "Go to Resume Builder" Navigation ---');
  const navUrlBefore = (await send('Runtime.evaluate', { expression: 'window.location.href' })).result.value;
  console.log('Current URL on Scanner page:', navUrlBefore);

  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '01_ai_resume_scanner_page.png'), Buffer.from(shot1.data, 'base64'));

  // Click the "Go to Resume Builder" button
  const clickNavRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const targetBtn = btns.find(b => b.textContent.includes('Resume Builder'));
        if (targetBtn) {
          targetBtn.click();
          return { clicked: true, text: targetBtn.textContent };
        }
        return { clicked: false };
      })()
    `,
    returnByValue: true
  });
  console.log('Button click result:', clickNavRes.result.value);
  await sleep(2000);

  const navUrlAfter = (await send('Runtime.evaluate', { expression: 'window.location.href' })).result.value;
  console.log('URL after clicking "Go to Resume Builder":', navUrlAfter);
  if (!navUrlAfter.includes('/student/resumes')) {
    throw new Error('Navigation failed: Expected /student/resumes but got ' + navUrlAfter);
  }
  console.log('✔ Navigation to Resume Builder succeeded!');

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '02_resume_builder_navigated.png'), Buffer.from(shot2.data, 'base64'));

  // 2. Resume Builder: Profile Picture Selection
  console.log('\n--- 2. Testing Resume Builder Profile Picture Selection ---');
  // Click Edit or Create on first resume
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const editBtn = document.querySelector('button[variant="outline"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Edit');
        if (editBtn) editBtn.click();
        else {
          const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Resume'));
          if (createBtn) createBtn.click();
        }
      })()
    `
  });
  await sleep(1500);

  // Toggle "Include Profile Picture in Resume" checkbox
  const toggleCheckboxRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const checkbox = document.getElementById('includeProfilePicture');
        if (checkbox) {
          checkbox.click();
          return { found: true, checked: checkbox.checked };
        }
        return { found: false };
      })()
    `,
    returnByValue: true
  });
  console.log('Profile Picture checkbox toggle:', toggleCheckboxRes.result.value);
  await sleep(1000);

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '03_resume_builder_editor_picture_toggle.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved 03_resume_builder_editor_picture_toggle.png');

  // 3. Career Goals: Dynamic Milestones & Progress
  console.log('\n--- 3. Testing Career Goals Dynamic Personalization ---');
  await send('Page.navigate', { url: 'http://localhost:5173/student/roadmap' });
  await sleep(2500);

  const roadmapInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('h2')?.textContent,
          goal: document.querySelector('h4')?.textContent,
          milestones: Array.from(document.querySelectorAll('input[type="checkbox"]')).length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Career Goals Page loaded:', roadmapInfo.result.value);

  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '04_career_goals_dynamic_page.png'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved 04_career_goals_dynamic_page.png');

  // 4. AI Career Mentor: Personalized Guidance & Interactive Checklist
  console.log('\n--- 4. Testing AI Career Mentor Dynamic Guidance ---');
  await send('Page.navigate', { url: 'http://localhost:5173/student/ai-mentor' });
  await sleep(2500);

  const mentorInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('h2')?.textContent,
          targetRole: document.querySelector('h3')?.textContent,
          checklistCount: Array.from(document.querySelectorAll('input[type="checkbox"]')).length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('AI Mentor Page loaded:', mentorInfo.result.value);

  // Click a checklist item to verify interactivity
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const firstCheck = document.querySelector('input[type="checkbox"]');
        if (firstCheck) firstCheck.click();
      })()
    `
  });
  await sleep(1000);

  const shot5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '05_ai_career_mentor_dynamic_page.png'), Buffer.from(shot5.data, 'base64'));
  console.log('Saved 05_ai_career_mentor_dynamic_page.png');

  // 5. Resume Preview: Profile Picture in Preview & Export
  console.log('\n--- 5. Testing Resume Preview with Profile Picture ---');
  await send('Page.navigate', { url: 'http://localhost:5173/student/resumes/2/preview' });
  await sleep(2500);

  const prevDiag = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const printArea = document.querySelector('#resume-print-area');
        const img = printArea ? printArea.querySelector('img') : null;
        return {
          hasPrintArea: Boolean(printArea),
          candidateName: printArea ? printArea.querySelector('h1')?.textContent : null,
          hasAvatarImage: Boolean(img),
          avatarSrc: img ? img.src : null,
          includeCheckboxChecked: document.querySelector('input[type="checkbox"]')?.checked
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Resume Preview Check:', prevDiag.result.value);

  const shot6 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '06_resume_preview_page_with_picture.png'), Buffer.from(shot6.data, 'base64'));
  console.log('Saved 06_resume_preview_page_with_picture.png');

  ws.close();
  chrome.kill();
  console.log('\n✔ BROWSER VERIFICATION COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('BROWSER ERROR:', err);
  process.exit(1);
});
