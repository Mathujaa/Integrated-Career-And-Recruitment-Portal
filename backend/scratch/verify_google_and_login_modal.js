import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9285;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-google-auth-' + Date.now());

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

  // 1. Capture Login Page with Continue with Google and Quick Fill
  console.log('2. Capturing initial login page...');
  const shot1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '17_login_page_with_google_button.png'), Buffer.from(shot1.data, 'base64'));

  // 2. Click "Continue with Google"
  console.log('3. Clicking Continue with Google button...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.social-login-btn');
        if (btn) btn.click();
      })()
    `
  });
  await sleep(600);

  // 3. Capture Google Account Selector Modal
  console.log('4. Capturing Google Account Selector Modal...');
  const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '18_google_account_selection_modal.png'), Buffer.from(shot2.data, 'base64'));

  // 4. Click Cancel
  console.log('5. Clicking Cancel in Google Modal...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find(b => b.textContent.trim() === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      })()
    `
  });
  await sleep(600);

  // 5. Capture cancellation response
  console.log('6. Capturing Google sign-in cancelled response...');
  const shot3 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '19_google_cancellation_response.png'), Buffer.from(shot3.data, 'base64'));

  // 6. Click Continue with Google again and select Mathujaa PM
  console.log('7. Re-opening modal and selecting Mathujaa PM (Student)...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.social-login-btn');
        if (btn) btn.click();
      })()
    `
  });
  await sleep(500);

  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const mathujaaBtn = buttons.find(b => b.textContent.includes('Mathujaa PM'));
        if (mathujaaBtn) mathujaaBtn.click();
      })()
    `
  });
  await sleep(2500);

  const urlRes = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Redirected to URL:', urlRes.result.value);

  // 7. Capture redirected dashboard
  const shot4 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '20_google_login_dashboard_redirect.png'), Buffer.from(shot4.data, 'base64'));

  ws.close();
  chrome.kill();

  if (urlRes.result.value.includes('/student/dashboard')) {
    console.log('✔ All Google Authentication and UI steps verified successfully!');
  } else {
    throw new Error('Did not redirect to student dashboard: ' + urlRes.result.value);
  }
}

run().catch(console.error);
