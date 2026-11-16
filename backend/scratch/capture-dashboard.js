import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('1. Logging in as admin to obtain JWT...');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@careerportal.com', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error('Could not get admin token: ' + JSON.stringify(loginData));
  console.log('✔ Obtained admin JWT token.');

  console.log('2. Starting Chrome headless...');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-dash-profile-' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9224',
    `--user-data-dir=${tempDir}`,
    '--window-size=1440,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  chrome.on('error', (err) => console.error('Chrome spawn error:', err));

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const vRes = await fetch('http://127.0.0.1:9224/json/version');
      versionInfo = await vRes.json();
      break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chrome.kill();
    throw new Error('Chrome failed to start on port 9224');
  }

  console.log('✔ Chrome running. Target WebSocket:', versionInfo.webSocketDebuggerUrl);

  const newTargetRes = await fetch('http://127.0.0.1:9224/json/new?http://localhost:5173/login', { method: 'PUT' });
  const targetPage = await newTargetRes.json();
  const pageWsUrl = targetPage.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);

  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, (res) => {
        if (res.error) reject(res.error);
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((resolve) => ws.onopen = resolve);
  console.log('✔ Connected to Chrome Page WebSocket');

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('3. Navigating to login page and injecting admin credentials...');
  await send('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(1000);

  // Set local storage
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('accessToken', ${JSON.stringify(token)});`
  });

  console.log('4. Navigating to Admin Dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
  await sleep(2500); // Allow charts, animations, and stats to render

  // Desktop screenshot with full view
  console.log('5. Capturing Desktop screenshot (1440x1400 full view)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1420,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(1000);
  const desktopCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const desktopPath = path.join(ARTIFACT_DIR, 'admin_dashboard_desktop.png');
  fs.writeFileSync(desktopPath, Buffer.from(desktopCapture.data, 'base64'));
  console.log('✔ Desktop screenshot saved to:', desktopPath);

  // Tablet emulation
  console.log('6. Emulating Tablet (900x1600)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 900,
    height: 1600,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(800);
  const tabletCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const tabletPath = path.join(ARTIFACT_DIR, 'admin_dashboard_tablet.png');
  fs.writeFileSync(tabletPath, Buffer.from(tabletCapture.data, 'base64'));
  console.log('✔ Tablet screenshot saved to:', tabletPath);

  // Mobile emulation
  console.log('7. Emulating Mobile (414x2400)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 414,
    height: 2400,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sleep(800);
  const mobileCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  const mobilePath = path.join(ARTIFACT_DIR, 'admin_dashboard_mobile.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileCapture.data, 'base64'));
  console.log('✔ Mobile screenshot saved to:', mobilePath);

  // Measure elements to verify exact positioning
  const layoutCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const kpis = document.querySelectorAll('.dashboard-kpi-grid .kpi-card');
      const charts = document.querySelectorAll('.dashboard-charts .chart-card');
      const kpiRects = Array.from(kpis).map(el => ({ top: el.getBoundingClientRect().top, left: el.getBoundingClientRect().left, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
      const chartRects = Array.from(charts).map(el => ({ top: el.getBoundingClientRect().top, left: el.getBoundingClientRect().left, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
      const grid = document.querySelector('.dashboard-charts');
      const gridRect = grid ? { width: grid.getBoundingClientRect().width, left: grid.getBoundingClientRect().left } : null;
      return { kpiCount: kpis.length, chartCount: charts.length, kpiRects, chartRects, gridRect };
    })()`,
    returnByValue: true
  });

  console.log('8. Element inspection under mobile/tablet/desktop:');
  console.log(JSON.stringify(layoutCheck.result.value, null, 2));

  // Reset to desktop and re-check desktop layout measurements
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(500);

  const desktopCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const kpis = document.querySelectorAll('.dashboard-kpi-grid .kpi-card');
      const charts = document.querySelectorAll('.dashboard-charts .chart-card');
      const kpiRects = Array.from(kpis).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width) }));
      const chartRects = Array.from(charts).map(el => ({ top: Math.round(el.getBoundingClientRect().top), left: Math.round(el.getBoundingClientRect().left), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) }));
      const grid = document.querySelector('.dashboard-charts');
      const gridRect = grid ? { width: Math.round(grid.getBoundingClientRect().width), left: Math.round(grid.getBoundingClientRect().left) } : null;
      return { kpiRects, chartRects, gridRect };
    })()`,
    returnByValue: true
  });

  console.log('Desktop Layout Check:');
  console.log(JSON.stringify(desktopCheck.result.value, null, 2));

  ws.close();
  chrome.kill();
  console.log('DONE!');
}

run().catch(err => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
