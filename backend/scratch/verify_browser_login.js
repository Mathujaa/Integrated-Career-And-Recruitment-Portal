import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9245;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-verify-login-' + Date.now());

  console.log('1. Starting Chrome headless...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1280,800',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
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

  console.log('✔ Chrome started.');

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

  console.log('2. Capturing login page...');
  const initialShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'login_page_with_toggle.png'), Buffer.from(initialShot.data, 'base64'));

  console.log('3. Typing credentials mathujaapm@gmail.com and Mathuja@03 (10 chars)...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        
        emailInput.value = 'mathujaapm@gmail.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        passInput.value = 'Mathuja@03';
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
        passInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `
  });

  await sleep(600);

  // Toggle eye icon to reveal password
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const toggleBtn = document.querySelector('button[aria-label="Show password"], button[title="Show password"]');
        if (toggleBtn) toggleBtn.click();
      })()
    `
  });

  await sleep(600);
  const revealedShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'login_page_password_revealed.png'), Buffer.from(revealedShot.data, 'base64'));
  console.log('Saved login_page_password_revealed.png');

  console.log('4. Clicking Sign In button...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `
  });

  await sleep(3000);

  const currentUrlRes = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL after login:', currentUrlRes.result.value);

  const dashboardShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'student_dashboard_authenticated.png'), Buffer.from(dashboardShot.data, 'base64'));
  console.log('Saved student_dashboard_authenticated.png');

  ws.close();
  chrome.kill();
  console.log('✔ Complete.');
}

run().catch(console.error);
