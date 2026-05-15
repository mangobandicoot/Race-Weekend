const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

function getSavePath() {
  return path.join(app.getPath('userData'), 'race-weekend-save.json');
}

// ─── NO_BRIDGE detection ─────────────────────────────────────────────────────
// Read from package.json extraMetadata — set by build:win:noflags script
let NO_BRIDGE = false;
try {
  const pkgPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    NO_BRIDGE = !!(pkg.nobridge);
  }
} catch(e) {}

// ─── Bridge process handle ───────────────────────────────────────────────────
let bridgeProcess = null;
let bridgeEnabled = !NO_BRIDGE;
let mainWindow = null;
let _isQuitting = false;

function getBridgePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bridge', 'bridge.exe');
  }
  return path.join(__dirname, 'bridge', 'bridge.exe');
}

function killBridgeProcess() {
  if (bridgeProcess && bridgeProcess.pid) {
    try { execSync(`taskkill /F /PID ${bridgeProcess.pid} /T`, { stdio: 'ignore' }); } catch(e) {}
    try { bridgeProcess.kill('SIGKILL'); } catch(e) {}
  }
  try { execSync('taskkill /F /IM bridge.exe /T', { stdio: 'ignore' }); } catch(e) {}
  bridgeProcess = null;
}

function startBridge() {
  if (NO_BRIDGE) return;
  if (!bridgeEnabled) return;
  if (bridgeProcess) return;
  if (_isQuitting) return;

  try { execSync('taskkill /F /IM bridge.exe /T', { stdio: 'ignore' }); } catch(e) {}

  const bridgePath = getBridgePath();
  if (!fs.existsSync(bridgePath)) {
    console.warn('[Bridge] bridge.exe not found at:', bridgePath);
    return;
  }

  console.log('[Bridge] Starting:', bridgePath);
  bridgeProcess = spawn(bridgePath, [], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  bridgeProcess.stdout.on('data', (d) => console.log('[Bridge]', d.toString().trim()));
  bridgeProcess.stderr.on('data', (d) => console.warn('[Bridge ERR]', d.toString().trim()));

  bridgeProcess.on('exit', (code) => {
    console.log('[Bridge] Exited with code', code);
    bridgeProcess = null;
    if (!_isQuitting && bridgeEnabled && !NO_BRIDGE) {
      setTimeout(startBridge, 3000);
    }
  });

  bridgeProcess.on('error', (err) => {
    console.error('[Bridge] Failed to start:', err.message);
    bridgeProcess = null;
  });
}

function stopBridge() {
  _isQuitting = true;
  killBridgeProcess();
}

// ─── Window creation ─────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0B0F1A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    autoHideMenuBar: true,
    title: 'iRacing Career Manager',
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC handlers ────────────────────────────────────────────────────────────
ipcMain.handle('bridge:getEnabled', () => !NO_BRIDGE && bridgeEnabled);

ipcMain.handle('bridge:setEnabled', (_, val) => {
  if (NO_BRIDGE) return false;
  bridgeEnabled = !!val;
  if (bridgeEnabled) startBridge();
  else killBridgeProcess();
  return bridgeEnabled;
});

ipcMain.handle('bridge:getStatus', () => ({
  running: !!bridgeProcess,
  pid: bridgeProcess ? bridgeProcess.pid : null,
}));

ipcMain.handle('bridge:restart', () => {
  if (NO_BRIDGE) return false;
  killBridgeProcess();
  setTimeout(startBridge, 500);
  return true;
});

ipcMain.handle('bridge:isNoFlags', () => NO_BRIDGE);

ipcMain.handle('save:write', (_, data) => {
  try {
    fs.writeFileSync(getSavePath(), data, 'utf8');
    try {
      const backupDir = path.join(path.dirname(getSavePath()), 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupPath = path.join(backupDir, `race-weekend-save-${stamp}.json`);
      fs.writeFileSync(backupPath, data, 'utf8');
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('race-weekend-save-') && f.endsWith('.json'))
        .sort();
      if (files.length > 5) {
        files.slice(0, files.length - 5).forEach(f => {
          fs.unlinkSync(path.join(backupDir, f));
        });
      }
    } catch(be) {
      console.warn('[Save] Backup failed:', be.message);
    }
    return true;
  } catch(e) {
    console.error('[Save] Write failed:', e.message);
    return false;
  }
});

ipcMain.handle('save:read', () => {
  try {
    const p = getSavePath();
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    return null;
  } catch(e) {
    console.error('[Save] Read failed:', e.message);
    return null;
  }
});

ipcMain.handle('save:delete', () => {
  try {
    const p = getSavePath();
    if (fs.existsSync(p)) fs.unlinkSync(p);
    return true;
  } catch(e) {
    console.error('[Save] Delete failed:', e.message);
    return false;
  }
});

ipcMain.handle('paints:copyToIRacing', (_, { seriesId, carPath, paintAssignments }) => {
  // paintAssignments: [{ driverName, carNumber, paintFile }]
  // carPath: e.g. 'nascarnextgencup' — used to find iRacing's paint folder
  try {
    const docsPath = app.getPath('documents');
    const iRacingPaintDir = path.join(docsPath, 'iRacing', 'paint', carPath);
    const gamePaintDir = path.join(app.isPackaged ? process.resourcesPath : __dirname, 'paints', seriesId);
    const defaultsDir = path.join(gamePaintDir, 'defaults');

    if (!fs.existsSync(iRacingPaintDir)) {
      fs.mkdirSync(iRacingPaintDir, { recursive: true });
    }

    const results = [];
    for (const entry of paintAssignments) {
      const destName = 'car_' + entry.carNumber + '.tga';
      const destPath = path.join(iRacingPaintDir, destName);

      let srcPath = null;
      if (entry.paintFile) {
        const candidate = path.join(gamePaintDir, entry.paintFile);
        if (fs.existsSync(candidate)) srcPath = candidate;
      }
      // Fallback: check defaults folder for car_NUMBER.tga or default.tga
      if (!srcPath && fs.existsSync(defaultsDir)) {
        const numbered = path.join(defaultsDir, entry.carNumber + '.tga');
        const generic = path.join(defaultsDir, 'default.tga');
        if (fs.existsSync(numbered)) srcPath = numbered;
        else if (fs.existsSync(generic)) srcPath = generic;
      }

      if (srcPath) {
        fs.copyFileSync(srcPath, destPath);
        results.push({ driver: entry.driverName, file: destName, status: 'copied' });
      } else {
        results.push({ driver: entry.driverName, file: destName, status: 'skipped' });
      }
    }
    return { ok: true, iRacingPaintDir, results };
  } catch (e) {
    console.error('[Paints] Copy failed:', e.message);
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('paints:openFolder', (_, { seriesId }) => {
  const gamePaintDir = path.join(app.isPackaged ? process.resourcesPath : __dirname, 'paints', seriesId);
  if (!fs.existsSync(gamePaintDir)) fs.mkdirSync(gamePaintDir, { recursive: true });
  shell.openPath(gamePaintDir);
  return true;
});

ipcMain.handle('bridge:readEvents', () => {
  if (NO_BRIDGE) return null;
  try {
    const eventsPath = path.join(
      process.env.LOCALAPPDATA || app.getPath('userData'),
      'iRacing Career Manager',
      'bridge_events.json'
    );
    if (!fs.existsSync(eventsPath)) return null;
    const raw = fs.readFileSync(eventsPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.timestamp || (Date.now() / 1000) - data.timestamp > 14400) return null;
    return data;
  } catch(e) {
    console.error('[Bridge] readEvents failed:', e.message);
    return null;
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
  _isQuitting = true;
  stopBridge();
});

app.on('will-quit', () => {
  _isQuitting = true;
  stopBridge();
});

app.on('window-all-closed', () => {
  _isQuitting = true;
  stopBridge();
  app.quit();
});
