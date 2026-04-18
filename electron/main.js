const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// ─── Bridge process handle ───────────────────────────────────────────────────
let bridgeProcess = null;
let bridgeEnabled = true;
let mainWindow = null;

function getBridgePath() {
  // In production (packaged), bridge.exe is in resources/bridge/
  // In dev, it's at ../bridge/bridge.exe relative to main.js
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bridge', 'bridge.exe');
  }
  return path.join(__dirname, '..', 'bridge', 'bridge.exe');
}

function startBridge() {
  if (!bridgeEnabled) return;
  if (bridgeProcess) return; // already running

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
  if (bridgeProcess) {
    bridgeProcess.kill();
    bridgeProcess = null;
  }
}

// ─── Window creation ─────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0B0F1A', // match app dark bg, no white flash
    icon: path.join(__dirname, 'assets', 'icon.ico'),
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

  // Load the app
  const indexPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'index.html')
    : path.join(__dirname, '..', 'index.html');

  mainWindow.loadFile(indexPath);

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

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  startBridge();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopBridge();
});

app.on('window-all-closed', () => {
  stopBridge();
  app.quit(); // Windows: always quit when window closes
});
