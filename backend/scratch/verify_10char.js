import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9270;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-verify-10char2-' + Date.now());

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

  console.log('Typing credentials using native setter...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        
        nativeSetter.call(emailInput, 'mathujaapm@gmail.com');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));

        nativeSetter.call(passInput, 'Mathujaa03'); // 10 chars
        passInput.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `
  });
  await sleep(600);

  // Click submit
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `
  });
  await sleep(3000);

  const urlRes = await sendCommand('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Result URL:', urlRes.result.value);

  const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '10_student_dashboard_from_10char.png'), Buffer.from(shot.data, 'base64'));

  ws.close();
  chrome.kill();
  if (urlRes.result.value.includes('/student/dashboard')) {
    console.log('✔ Succeeded! Student logged in with 10-char password to dashboard.');
  } else {
    throw new Error('Still not redirected: ' + urlRes.result.value);
  }
}

run().catch(console.error);
