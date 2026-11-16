import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9248;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-react-test-' + Date.now());

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1280,800',
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
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (evt) => {
        const res = JSON.parse(evt.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  ws.addEventListener('message', (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', data.params.type, data.params.args.map((a) => a.value));
    }
  });

  await sleep(1500);

  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const setVal = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const email = document.getElementById('email');
        const pass = document.getElementById('password');
        setVal(email, 'mathujaapm@gmail.com');
        setVal(pass, 'Mathuja@03');

        // Click eye toggle to verify
        const toggle = document.querySelector('button[aria-label="Show password"]');
        if (toggle) toggle.click();

        await new Promise(r => setTimeout(r, 400));
        return {
          emailVal: email.value,
          passVal: pass.value,
          passType: pass.type
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('INPUT VALUES BEFORE SUBMIT:', evalResult.result.value);

  // Take screenshot of filled form with revealed password
  const formShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'login_form_filled_revealed.png'), Buffer.from(formShot.data, 'base64'));

  // Now submit form
  const submitResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const btn = document.querySelector('button[type="submit"]');
        btn.click();
        await new Promise(r => setTimeout(r, 2500));
        return {
          currentUrl: window.location.href,
          toastError: document.querySelector('.toast-error')?.textContent || null
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('SUBMIT RESULT:', submitResult.result.value);

  const afterShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'dashboard_after_login.png'), Buffer.from(afterShot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Done.');
}

run().catch(console.error);
