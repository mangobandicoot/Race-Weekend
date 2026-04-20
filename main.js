const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

function getSavePath() {
  return path.join(app.getPath('userData'), 'race-weekend-save.json');
}

// ─── Bridge process handle ───────────────────────────────────────────────────
const NO_BRIDGE = !!(require('./electron/package.json').nobridge);
let bridgeProcess = null;
let bridgeEnabled = !NO_BRIDGE;
let mainWindow = null;

function getBridgePath() {
  // In production (packaged), bridge.exe is in resources/bridge/
  // In dev, it's at ../bridge/bridge.exe relative to main.js
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bridge', 'bridge.exe');
  }
  return path.join(__dirname, 'bridge', 'bridge.exe');
}

function startBridge() {
  if (!bridgeEnabled) return;
  if (bridgeProcess) return; // already running
  // Kill any orphaned bridge processes from previous sessions
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /F /IM bridge.exe /T', { stdio: 'ignore' });
  } catch(e) { /* no orphans, that's fine */ }

  const bridgePath = getBridgePath();
  if (!fs.existsSync(bridgePath)) {
    console.warn('[Bridge] bridge.exe not found at:', bridgePath);
    return;
  }

  console.log('[Bridge] Starting:', bridgePath);
  bridgeProcess = spawn(bridgePath, [], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true, // no console window popping up
  });

  bridgeProcess.stdout.on('data', (d) => console.log('[Bridge]', d.toString().trim()));
  bridgeProcess.stderr.on('data', (d) => console.warn('[Bridge ERR]', d.toString().trim()));

  bridgeProcess.on('exit', (code) => {
    console.log('[Bridge] Exited with code', code);
    bridgeProcess = null;
    // Auto-restart after 3s unless app is quitting
    if (!app.isQuitting && bridgeEnabled) {
      setTimeout(startBridge, 3000);
    }
  });

  bridgeProcess.on('error', (err) => {
    console.error('[Bridge] Failed to start:', err.message);
    bridgeProcess = null;
  });
}

function stopBridge() {
  app.isQuitting = true; // prevent auto-restart
  if (bridgeProcess) {
    try {
      const { execSync } = require('child_process');
      execSync(`taskkill /F /PID ${bridgeProcess.pid} /T`, { stdio: 'ignore' });
    } catch(e) {}
    try { bridgeProcess.kill(); } catch(e) {}
    bridgeProcess = null;
  }
  // Also kill any orphaned bridge.exe just in case
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /F /IM bridge.exe /T', { stdio: 'ignore' });
  } catch(e) {}
}

// ─── Window creation ─────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0B0F1A', // match app dark bg, no white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow localhost fetch for bridge communication
      webSecurity: true,
    },
    autoHideMenuBar: true, // hide menu bar but keep accessible via Alt
    title: 'iRacing Career Manager',
  });

  // Load the app — index.html is always next to main.js
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in dev mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Open external links in default browser, not electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC handlers (exposed to renderer via preload) ──────────────────────────
ipcMain.handle('bridge:getEnabled', () => bridgeEnabled);

ipcMain.handle('bridge:setEnabled', (_, val) => {
  bridgeEnabled = !!val;
  if (bridgeEnabled) {
    startBridge();
  } else {
    stopBridge();
  }
  return bridgeEnabled;
});

ipcMain.handle('bridge:getStatus', () => ({
  running: !!bridgeProcess,
  pid: bridgeProcess ? bridgeProcess.pid : null,
}));

ipcMain.handle('bridge:restart', () => {
  stopBridge();
  setTimeout(startBridge, 500);
  return true;
});

// ─── Save/Load handlers (persist to userData, survives app updates) ───────────
ipcMain.handle('save:write', (_, data) => {
  try {
    fs.writeFileSync(getSavePath(), data, 'utf8');

    // Silent backup — keep last 5, rotate on every save
    try {
      const backupDir = path.join(path.dirname(getSavePath()), 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(backupDir, `race-weekend-save-${stamp}.json`);
      fs.writeFileSync(backupPath, data, 'utf8');
      // Trim to last 5 backups
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('race-weekend-save-') && f.endsWith('.json'))
        .sort();
      if (files.length > 5) {
        files.slice(0, files.length - 5).forEach(f => {
          fs.unlinkSync(path.join(backupDir, f));
        });
      }
    } catch (be) {
      console.warn('[Save] Backup failed:', be.message);
    }

    return true;
  } catch (e) {
    console.error('[Save] Write failed:', e.message);
    return false;
  }
});

ipcMain.handle('save:read', () => {
  try {
    const p = getSavePath();
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return null;
  } catch (e) {
    console.error('[Save] Read failed:', e.message);
    return null;
  }
});

ipcMain.handle('bridge:readEvents', () => {
  try {
    const eventsPath = path.join(
      process.env.LOCALAPPDATA || app.getPath('userData'),
      'iRacing Career Manager',
      'bridge_events.json'
    );
    if (!fs.existsSync(eventsPath)) return null;
    const raw = fs.readFileSync(eventsPath, 'utf-8');
    const data = JSON.parse(raw);
    // Ignore if older than 4 hours
    if (!data.timestamp || (Date.now() / 1000) - data.timestamp > 14400) return null;
    return data;
  } catch (e) {
    console.error('[Bridge] readEvents failed:', e.message);
    return null;
  }
});

ipcMain.handle('save:delete', () => {
  try {
    const p = getSavePath();
    if (fs.existsSync(p)) fs.unlinkSync(p);
    return true;
  } catch (e) {
    console.error('[Save] Delete failed:', e.message);
    return false;
  }
});

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();
  if (!NO_BRIDGE) startBridge();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopBridge();
});

app.on('will-quit', () => {
  app.isQuitting = true;
  stopBridge();
});

app.on('window-all-closed', () => {
  app.isQuitting = true;
  stopBridge();
  app.quit(); // Windows: always quit when window closes
});