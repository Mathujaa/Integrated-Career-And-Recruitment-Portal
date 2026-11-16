import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function capturePreview() {
  const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const { token } = await loginRes.json();
  const resumesRes = await fetch('http://localhost:5000/api/v1/jobs/resumes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const { resumes } = await resumesRes.json();
  const resumeId = resumes[0].id;

  const rData = typeof resumes[0].resume_data === 'string' ? JSON.parse(resumes[0].resume_data) : resumes[0].resume_data;
  await fetch(`http://localhost:5000/api/v1/jobs/resumes/${resumeId}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: resumes[0].title,
      template_name: resumes[0].template_name,
      resume_data: { ...rData, include_profile_picture: true }
    })
  });

  const port = 9265;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-preview-' + Date.now());
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
  await new Promise(r => setTimeout(r, 500));

  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', '${token}');
      window.location.href = 'http://localhost:5173/student/resumes/${resumeId}/preview';
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '06_resume_preview_page_with_picture.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved 06_resume_preview_page_with_picture.png');

  ws.close();
  chrome.kill();
}
capturePreview();
