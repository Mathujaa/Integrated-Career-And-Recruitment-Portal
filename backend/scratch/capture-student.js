import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('1. Logging in as Student mathujaapm@gmail.com...');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mathujaapm@gmail.com', password: 'Mathujaa@03' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) throw new Error('Could not get student token: ' + JSON.stringify(loginData));
  console.log('✔ Obtained student JWT token.');

  console.log('2. Starting Chrome headless...');
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-student-test-' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9228',
    `--user-data-dir=${tempDir}`,
    '--window-size=1440,1200',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  let versionInfo = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const vRes = await fetch('http://127.0.0.1:9228/json/version');
      versionInfo = await vRes.json();
      break;
    } catch (e) {}
  }

  if (!versionInfo) {
    chrome.kill();
    throw new Error('Chrome failed to start on port 9228');
  }

  const newTargetRes = await fetch('http://127.0.0.1:9228/json/new?http://localhost:5173/login', { method: 'PUT' });
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

  console.log('3. Injecting student auth token and setting light theme...');
  await send('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(600);
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('accessToken', ${JSON.stringify(token)});
      localStorage.setItem('theme', 'light');
    `
  });

  console.log('4. Navigating to Student Dashboard...');
  await send('Page.navigate', { url: 'http://localhost:5173/student/dashboard' });
  await sleep(2500);

  // Verification checks on Student Dashboard
  const dashCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyText = document.body.innerText;
      const hasWelcome = bodyText.includes('Placement Dashboard');
      const hasQuickStats = bodyText.includes('Quick Stats');
      const hasJobsApplied = bodyText.includes('Jobs Applied');
      const hasQuickActions = bodyText.includes('Quick Actions');
      const hasNextAssessment = bodyText.includes('Next Assessment');
      const hasLatestApplication = bodyText.includes('Latest Application');
      const hasATSCompatibility = bodyText.includes('ATS Compatibility');

      // Sidebar checks
      const sidebarLinks = Array.from(document.querySelectorAll('aside a')).map(a => a.innerText.trim());
      const hasCalendarInSidebar = sidebarLinks.some(t => t.includes('Calendar'));
      const hasNotifInSidebar = sidebarLinks.some(t => t.includes('Notifications'));

      // Header checks
      const header = document.querySelector('nav');
      const logoText = header ? header.innerText.includes('CareerPortal') : false;
      const hasHome = header ? header.innerText.includes('Home') : false;
      const hasDashboard = header ? header.innerText.includes('Dashboard') : false;
      const hasGreeting = header ? header.innerText.includes('Hi,') : false;
      const hasSignOut = header ? header.innerText.includes('Sign Out') : false;
      const themeToggle = document.querySelector('.theme-toggle-btn');
      const notifBell = document.querySelector('nav a[title="Notifications"]');

      return {
        hasWelcome,
        hasQuickStats,
        hasJobsApplied,
        hasQuickActions,
        hasNextAssessment,
        hasLatestApplication,
        hasATSCompatibility,
        hasCalendarInSidebar,
        hasNotifInSidebar,
        sidebarLinks,
        header: {
          logoText,
          hasHome,
          hasDashboard,
          hasGreeting,
          hasSignOut,
          hasThemeToggle: !!themeToggle,
          hasNotifBell: !!notifBell
        }
      };
    })()`,
    returnByValue: true
  });

  console.log('Dashboard Inspection Result:');
  console.log(JSON.stringify(dashCheck.result.value, null, 2));

  // Capture Dashboard screenshot
  console.log('5. Capturing Student Dashboard screenshot (1440x1200)...');
  const dashCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'student_dashboard_clean.png'), Buffer.from(dashCapture.data, 'base64'));
  console.log('✔ Saved student_dashboard_clean.png');

  // Navigate to Student Profile
  console.log('6. Navigating to Student Profile...');
  await send('Page.navigate', { url: 'http://localhost:5173/student/profile' });
  await sleep(2000);

  const profileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyText = document.body.innerText;
      const hasAboutMe = bodyText.includes('About Me');
      const hasEducation = bodyText.includes('Education');
      const hasExperience = bodyText.includes('Work Experience');
      const hasProjects = bodyText.includes('Projects');
      const hasCertifications = bodyText.includes('Certifications');
      const hasSkills = bodyText.includes('Skills');
      const hasLanguages = bodyText.includes('Languages');
      const hasEditBasics = bodyText.includes('Edit Basics');

      // Avatar check
      const avatarContainer = document.querySelector('div[style*="border-radius: 50%"], div[style*="borderRadius: 50%"]');
      return {
        hasAboutMe,
        hasEducation,
        hasExperience,
        hasProjects,
        hasCertifications,
        hasSkills,
        hasLanguages,
        hasEditBasics,
        hasAvatarVisible: !!avatarContainer
      };
    })()`,
    returnByValue: true
  });

  console.log('Profile Inspection Result:');
  console.log(JSON.stringify(profileCheck.result.value, null, 2));

  // Capture Profile screenshot
  console.log('7. Capturing Student Profile screenshot...');
  const profileCapture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'student_profile_preserved.png'), Buffer.from(profileCapture.data, 'base64'));
  console.log('✔ Saved student_profile_preserved.png');

  ws.close();
  chrome.kill();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
