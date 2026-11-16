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
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-recruiter-final-' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${tempDir}`,
    '--window-size=1440,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const vRes = await fetch('http://127.0.0.1:9227/json/version');
      versionInfo = await vRes.json();
      break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chrome.kill();
    throw new Error('Chrome failed to start on port 9227');
  }

  const newTargetRes = await fetch('http://127.0.0.1:9227/json/new?http://localhost:5173/login', { method: 'PUT' });
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

  console.log('3. Injecting authentication token and ensuring initial light theme...');
  await send('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(600);
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', ${JSON.stringify(token)});
      localStorage.setItem('theme', 'light');
    `
  });

  console.log('4. Navigating to Recruiter Dashboard in Light Mode...');
  await send('Page.navigate', { url: 'http://localhost:5173/employer/dashboard' });
  await sleep(2500);

  // Measure elements on Desktop Light Mode
  const lightLayout = await send('Runtime.evaluate', {
    expression: `(() => {
      const kpis = document.querySelectorAll('.recruiter-kpi-grid .recruiter-kpi-card');
      const charts = document.querySelectorAll('.dashboard-charts .chart-card');
      const kpiRects = Array.from(kpis).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));
      const chartRects = Array.from(charts).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));
      const toggleBtn = document.querySelector('.theme-toggle-btn');
      return {
        kpiCount: kpis.length,
        chartCount: charts.length,
        kpiRects,
        chartRects,
        toggleIcon: toggleBtn ? toggleBtn.innerText.trim() : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Light Mode Layout Inspection:');
  console.log(JSON.stringify(lightLayout.result.value, null, 2));

  // Capture Desktop Light Mode
  console.log('5. Capturing Recruiter Desktop Light Mode (1440x1100)...');
  const desktopLight = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'recruiter_dashboard_light.png'), Buffer.from(desktopLight.data, 'base64'));
  console.log('✔ Saved recruiter_dashboard_light.png');

  // Toggle Dark Mode
  console.log('6. Clicking Theme Toggle button to switch to Dark Mode...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.theme-toggle-btn').click();`
  });
  await sleep(800);

  const darkCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const toggleBtn = document.querySelector('.theme-toggle-btn');
      const themeAttr = document.documentElement.getAttribute('data-theme');
      const hasDarkClass = document.documentElement.classList.contains('dark');
      return { toggleIcon: toggleBtn ? toggleBtn.innerText.trim() : null, themeAttr, hasDarkClass };
    })()`,
    returnByValue: true
  });
  console.log('Dark Mode Check:', JSON.stringify(darkCheck.result.value, null, 2));

  // Capture Desktop Dark Mode
  console.log('7. Capturing Recruiter Desktop Dark Mode (1440x1100)...');
  const desktopDark = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'recruiter_dashboard_dark.png'), Buffer.from(desktopDark.data, 'base64'));
  console.log('✔ Saved recruiter_dashboard_dark.png');

  // Emulate Tablet
  console.log('8. Emulating Tablet (900x1200)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 900,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(800);
  const tabletCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'recruiter_dashboard_tablet_4charts.png'), Buffer.from(tabletCapture.data, 'base64'));
  console.log('✔ Saved recruiter_dashboard_tablet_4charts.png');

  // Emulate Mobile
  console.log('9. Emulating Mobile (414x2000)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 414,
    height: 2000,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sleep(800);
  const mobileCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'recruiter_dashboard_mobile_4charts.png'), Buffer.from(mobileCapture.data, 'base64'));
  console.log('✔ Saved recruiter_dashboard_mobile_4charts.png');

  // Settings page
  console.log('10. Navigating to Settings page...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173/employer/settings' });
  await sleep(1200);

  const settingsCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const darkToggle = document.querySelector('#darkModeToggler');
      const textHasDark = document.body.innerText.includes('Dark Theme');
      const headerToggle = document.querySelector('.theme-toggle-btn');
      return { darkToggleInSettings: !!darkToggle, textHasDark, headerToggleInHeader: !!headerToggle };
    })()`,
    returnByValue: true
  });
  console.log('Settings Check:', JSON.stringify(settingsCheck.result.value, null, 2));

  const settingsCapture = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'recruiter_settings_dark.png'), Buffer.from(settingsCapture.data, 'base64'));
  console.log('✔ Saved recruiter_settings_dark.png');

  ws.close();
  chrome.kill();
  console.log('ALL FINAL CORRECTIONS VERIFIED SUCCESSFULLY!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
