import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testPreview() {
  const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const { token } = await loginRes.json();
  const resumeId = 2;

  const port = 9272;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-prev-diag-' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--window-size=1280,950',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const v = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (v.ok) break;
    } catch(e){}
  }

  const targetRes = await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173/login`, { method: 'PUT' });
  const target = await targetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      const handler = evt => {
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

  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', '${token}');
      window.location.href = 'http://localhost:5173/student/resumes/${resumeId}/preview';
    `
  });

  // Poll until #resume-print-area appears
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const evalRes = await send('Runtime.evaluate', {
      expression: "Boolean(document.querySelector('#resume-print-area'))"
    });
    if (evalRes.result.value) {
      console.log('✔ Found #resume-print-area at poll', i);
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  const evalContent = await send('Runtime.evaluate', {
    expression: "({ title: document.querySelector('h1')?.textContent, hasImg: Boolean(document.querySelector('#resume-print-area img')) })",
    returnByValue: true
  });
  console.log('Resume content:', evalContent.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '06_resume_preview_verified.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved 06_resume_preview_verified.png');

  ws.close();
  chrome.kill();
}
testPreview();
