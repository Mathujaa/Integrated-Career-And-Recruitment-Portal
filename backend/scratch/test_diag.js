import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testDiagnostic() {
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const { token } = await loginRes.json();

  const port = 9280;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-diag-' + Date.now());
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

  // Go to /student/resumes first so auth state is initialized in React Router
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', '${token}');
      window.location.href = 'http://localhost:5173/student/resumes';
    `
  });

  await new Promise(r => setTimeout(r, 2000));
  console.log('On resumes page. Now navigating to preview...');

  // Click Preview & PDF button on first resume card
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const previewBtn = btns.find(b => b.textContent.includes('Preview & PDF'));
        if (previewBtn) {
          previewBtn.click();
          return { clicked: true };
        }
        return { clicked: false, allBtns: btns.map(b => b.textContent) };
      })()
    `,
    returnByValue: true
  });
  console.log('Preview button clicked:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 2500));

  const diag = await send('Runtime.evaluate', {
    expression: `
      ({
        url: window.location.href,
        hasPrintArea: Boolean(document.querySelector('#resume-print-area')),
        images: Array.from(document.querySelectorAll('#resume-print-area img')).map(img => img.src),
        h1: document.querySelector('#resume-print-area h1')?.textContent,
        checkboxChecked: document.querySelector('input[type="checkbox"]')?.checked
      })
    `,
    returnByValue: true
  });
  console.log('Preview Diagnosis:', diag.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
  fs.writeFileSync(path.join(ARTIFACT_DIR, '06_resume_preview_actual.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved 06_resume_preview_actual.png');

  ws.close();
  chrome.kill();
}
testDiagnostic();
