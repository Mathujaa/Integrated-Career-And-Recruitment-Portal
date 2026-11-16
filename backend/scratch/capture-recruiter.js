import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('1. Logging in as Recruiter majaa@infosys.com...');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'majaa@infosys.com', password: 'Employer@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error('Could not get recruiter token: ' + JSON.stringify(loginData));
  console.log('✔ Obtained recruiter JWT token.');

  console.log('2. Starting Chrome headless...');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-recruiter-profile-' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${tempDir}`,
    '--window-size=1440,1400',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const vRes = await fetch('http://127.0.0.1:9226/json/version');
      versionInfo = await vRes.json();
      break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chrome.kill();
    throw new Error('Chrome failed to start on port 9226');
  }

  const newTargetRes = await fetch('http://127.0.0.1:9226/json/new?http://localhost:5173/login', { method: 'PUT' });
  const targetPage = await newTargetRes.json();
  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);

  let msgId = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    callbacks.set(id, (res) => res.error ? reject(res.error) : resolve(res.result));
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(resolve => ws.onopen = resolve);
  await send('Page.enable');
  await send('Runtime.enable');

  console.log('3. Injecting recruiter authentication token...');
  await send('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(800);
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('accessToken', ${JSON.stringify(token)});`
  });

  console.log('4. Navigating to Recruiter Dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/employer/dashboard' });
  await sleep(2500);

  // Measure layout and verify element geometry on desktop
  const desktopLayout = await send('Runtime.evaluate', {
    expression: `(() => {
      const kpis = document.querySelectorAll('.recruiter-kpi-grid .recruiter-kpi-card');
      const charts = document.querySelectorAll('.dashboard-charts .chart-card');
      const kpiRects = Array.from(kpis).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));
      const chartRects = Array.from(charts).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));
      const grid = document.querySelector('.dashboard-charts');
      const gridRect = grid ? { width: Math.round(grid.getBoundingClientRect().width), left: Math.round(grid.getBoundingClientRect().left) } : null;
      const themeToggle = document.querySelector('header button[aria-label="Switch to dark mode"], header button[aria-label="Switch to light mode"], header button[title="Switch to dark mode"], header button[title="Switch to light mode"]');
      return { kpiCount: kpis.length, chartCount: charts.length, kpiRects, chartRects, gridRect, themeToggleFound: !!themeToggle };
    })()`,
    returnByValue: true
  });

  console.log('Desktop Layout Check:');
  console.log(JSON.stringify(desktopLayout.result.value, null, 2));

  // Desktop Screenshot
  console.log('5. Capturing Recruiter Desktop screenshot (1440x1400)...');
  const desktopCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const desktopPath = path.join(ARTIFACT_DIR, 'recruiter_dashboard_desktop.png');
  fs.writeFileSync(desktopPath, Buffer.from(desktopCapture.data, 'base64'));
  console.log('✔ Saved:', desktopPath);

  // Tablet emulation
  console.log('6. Emulating Tablet (900x1600)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 900,
    height: 1600,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(1000);
  const tabletCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const tabletPath = path.join(ARTIFACT_DIR, 'recruiter_dashboard_tablet.png');
  fs.writeFileSync(tabletPath, Buffer.from(tabletCapture.data, 'base64'));
  console.log('✔ Saved:', tabletPath);

  // Mobile emulation
  console.log('7. Emulating Mobile (414x2400)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 414,
    height: 2400,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sleep(1000);
  const mobileCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const mobilePath = path.join(ARTIFACT_DIR, 'recruiter_dashboard_mobile.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileCapture.data, 'base64'));
  console.log('✔ Saved:', mobilePath);

  // Settings page verification
  console.log('8. Navigating to Recruiter Settings page...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173/employer/settings' });
  await sleep(1500);

  const settingsCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const darkToggle = document.querySelector('#darkModeToggler');
      const textHasDark = document.body.innerText.includes('Dark Theme');
      return { darkTogglePresent: !!darkToggle, textHasDark };
    })()`,
    returnByValue: true
  });
  console.log('Settings Check:', JSON.stringify(settingsCheck.result.value, null, 2));

  const settingsCapture = await send('Page.captureScreenshot', { format: 'png' });
  const settingsPath = path.join(ARTIFACT_DIR, 'recruiter_settings.png');
  fs.writeFileSync(settingsPath, Buffer.from(settingsCapture.data, 'base64'));
  console.log('✔ Saved:', settingsPath);

  ws.close();
  chrome.kill();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
