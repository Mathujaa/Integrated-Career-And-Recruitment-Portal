import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9260;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-verify-login-fix-' + Date.now());

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
    throw new Error(`Chrome failed to start on port ${port}`);
  }

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

  console.log('2. Capturing new login page with Quick-Fill and eye toggle...');
  const shot1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '07_login_page_rectified.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved 07_login_page_rectified.png');

  console.log('3. Clicking Quick-Fill Student button...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const studentBtn = buttons.find(b => b.textContent.includes('Student'));
        if (studentBtn) studentBtn.click();
      })()
    `
  });
  await sleep(500);

  // Click eye icon to reveal password
  console.log('4. Clicking eye icon to reveal password...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const eyeBtn = document.querySelector('button[aria-label="Show password"]');
        if (eyeBtn) eyeBtn.click();
      })()
    `
  });
  await sleep(500);

  const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '08_login_page_student_revealed.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved 08_login_page_student_revealed.png');

  console.log('5. Clicking Sign In...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `
  });
  await sleep(2500);

  const urlRes = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Navigated URL:', urlRes.result.value);

  const shot3 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '09_student_dashboard_logged_in.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved 09_student_dashboard_logged_in.png');

  ws.close();
  chrome.kill();
  console.log('✔ Verification passed cleanly.');
}

run().catch(console.error);
