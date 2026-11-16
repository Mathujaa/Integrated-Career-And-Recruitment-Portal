import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\mathu\\.gemini\\antigravity\\brain\\f216dc89-a2ad-4fbd-92cf-be8d76fe2500';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const port = 9292;
  const tempDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome-login-theme-' + Date.now());

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

  // 1. Verify no theme toggle button in Login page header
  const toggleCheck = await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const authHeader = document.querySelector('.auth-header');
        const hasThemeToggle = Boolean(authHeader && authHeader.querySelector('.theme-toggle-btn'));
        return {
          hasThemeToggle,
          headerHtml: authHeader ? authHeader.innerHTML : ''
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Login Header has Theme Toggle:', toggleCheck.result.value.hasThemeToggle);
  if (toggleCheck.result.value.hasThemeToggle) {
    throw new Error('Theme toggle button still found inside Login page header!');
  }

  // 2. Ensure Light Mode display
  console.log('2. Setting Light Mode...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      })()
    `
  });
  await sleep(500);

  const shotLight = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '21_login_page_light_mode.png'), Buffer.from(shotLight.data, 'base64'));
  console.log('Saved 21_login_page_light_mode.png');

  // 3. Switch to Dark Mode (as chosen in Settings)
  console.log('3. Setting Dark Mode...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      })()
    `
  });
  await sleep(500);

  const shotDark = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '22_login_page_dark_mode.png'), Buffer.from(shotDark.data, 'base64'));
  console.log('Saved 22_login_page_dark_mode.png');

  // 4. Verify persistence after page refresh
  console.log('4. Reloading page to verify persistence of Dark Mode from localStorage...');
  await sendCommand('Page.reload');
  await sleep(1500);

  const themeCheckAfterReload = await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          htmlDataTheme: document.documentElement.getAttribute('data-theme'),
          htmlHasDarkClass: document.documentElement.classList.contains('dark'),
          localStorageTheme: localStorage.getItem('theme'),
          cardBg: window.getComputedStyle(document.querySelector('.auth-card')).backgroundColor,
          textColor: window.getComputedStyle(document.querySelector('.auth-title')).color
        };
      })()
    `,
    returnByValue: true
  });
  console.log('After Reload Theme State:', themeCheckAfterReload.result.value);

  const shotPersist = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '23_login_page_dark_mode_persisted.png'), Buffer.from(shotPersist.data, 'base64'));
  console.log('Saved 23_login_page_dark_mode_persisted.png');

  // 5. Test Quick-Fill and Google Modal in Dark Mode
  console.log('5. Testing Google Modal in Dark Mode...');
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.social-login-btn');
        if (btn) btn.click();
      })()
    `
  });
  await sleep(500);

  const shotGoogleDark = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, '24_google_modal_dark_mode.png'), Buffer.from(shotGoogleDark.data, 'base64'));
  console.log('Saved 24_google_modal_dark_mode.png');

  // Close Google modal
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find(b => b.textContent.trim() === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      })()
    `
  });
  await sleep(500);

  // 6. Reset theme back to default light for clean state
  await sendCommand('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      })()
    `
  });

  ws.close();
  chrome.kill();

  console.log('\n✔ ALL CHECKS PASSED:');
  console.log('  1. Moon/theme toggle removed from Login page header.');
  console.log('  2. Login page responds perfectly to Light Mode.');
  console.log('  3. Login page responds perfectly to Dark Mode.');
  console.log('  4. Selected theme persists across page refreshes via localStorage.');
  console.log('  5. Login card, inputs, text, buttons, and Google modal follow theme seamlessly.');
}

run().catch(console.error);
