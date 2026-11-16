import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9288;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-verify-vis-' + Date.now());

  console.log('1. Starting headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1280,850',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const vRes = await fetch(`http://127.0.0.1:${port}/json/version`);
      versionInfo = await vRes.json();
      break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chrome.kill();
    throw new Error('Chrome failed to start');
  }

  // Open login page first
  const newTargetRes = await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173/login`, { method: 'PUT' });
  const targetPage = await newTargetRes.json();
  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let msgId = 1;
  function sendCommand(method, params = {}) {
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

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sleep(1500);

  // Quick Login
  console.log('2. Quick-logging in as Student...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const studentBtn = buttons.find(b => b.textContent.includes('Student'));
        if (studentBtn) studentBtn.click();
      })()
    `
  });
  await sleep(600);

  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `
  });
  await sleep(3000);

  const loginCheck = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL after login:', loginCheck.result.value);

  // 1. Capture My Profile Photo Management
  console.log('3. Navigating to My Profile...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/student/profile' });
  await sleep(2000);
  const shot1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '12_student_profile_photo_management.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved 12_student_profile_photo_management.png');

  // 2. Open Resume Builder & Edit Resume
  console.log('4. Navigating to Resume Builder...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/student/resumes' });
  await sleep(2000);
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const editButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Edit'));
        if (editButtons.length > 0) editButtons[0].click();
      })()
    `
  });
  await sleep(1500);
  const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '13_resume_builder_independent_photos.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved 13_resume_builder_independent_photos.png');

  // 3. Open Resume Preview & PDF Printable Area
  console.log('5. Navigating to Resume Preview...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/student/resumes/2/preview' });
  await sleep(2000);
  const shot3 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '14_resume_preview_with_photo.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved 14_resume_preview_with_photo.png');

  // 4. Open Career Goals
  console.log('6. Navigating to Career Goals...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/student/roadmap' });
  await sleep(2000);
  const shot4 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '15_career_goals_page.png'), Buffer.from(shot4.data, 'base64'));
  console.log('Saved 15_career_goals_page.png');

  // 5. Open AI Career Mentor
  console.log('7. Navigating to AI Career Mentor...');
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/student/ai-mentor' });
  await sleep(2000);
  const shot5 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '16_ai_career_mentor_advisor.png'), Buffer.from(shot5.data, 'base64'));
  console.log('Saved 16_ai_career_mentor_advisor.png');

  ws.close();
  chrome.kill();
  console.log('✔ All visual artifacts captured successfully.');
}

run().catch(console.error);
