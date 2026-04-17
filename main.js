// Race Weekend — Electron main.js
// Spawns the Python bridge as a child process on startup

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let bridgeProcess = null;

function getBridgePath() {
    // In production (packaged): bridge.exe sits next to the app
    // In dev: look for raceweekend_bridge.exe or raceweekend_bridge.py
    const exeDir = path.dirname(process.execPath);
    const candidates = [
        path.join(exeDir, 'raceweekend_bridge.exe'),
        path.join(exeDir, 'bridge', 'raceweekend_bridge.exe'),
        path.join(__dirname, 'raceweekend_bridge.exe'),
        path.join(__dirname, 'raceweekend_bridge.py'), // dev fallback
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function getPrefsPath() {
    return path.join(app.getPath('userData'), 'rw-prefs.json');
}

function readPrefs() {
    try {
        return JSON.parse(fs.readFileSync(getPrefsPath(), 'utf8'));
    } catch (e) {
        return { bridgeEnabled: true }; // default on
    }
}

function writePrefs(prefs) {
    try {
        fs.writeFileSync(getPrefsPath(), JSON.stringify(prefs, null, 2));
    } catch (e) {
        console.error('[Main] Could not write prefs:', e);
    }
}

function startBridge() {
    const prefs = readPrefs();
    if (!prefs.bridgeEnabled) {
        console.log('[Main] Bridge disabled in preferences — skipping');
        return;
    }

    const bridgePath = getBridgePath();
    if (!bridgePath) {
        console.log('[Main] Bridge not found — SDK features disabled');
        return;
    }

    const isPy = bridgePath.endsWith('.py');
    const cmd = isPy ? 'python' : bridgePath;
    const args = isPy ? [bridgePath] : [];

    console.log(`[Main] Starting bridge: ${bridgePath}`);
    bridgeProcess = spawn(cmd, args, {
        windowsHide: true,
        detached: false,
        stdio: 'ignore',  // fully silent — no stdout/stderr piped
    });

    bridgeProcess.on('exit', (code) => {
        console.log(`[Main] Bridge exited with code ${code}`);
        bridgeProcess = null;
    });
}

function stopBridge() {
    if (bridgeProcess) {
        bridgeProcess.kill();
        bridgeProcess = null;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        minWidth: 768,
        minHeight: 600,
        backgroundColor: '#060A10',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, 'icon.ico'),
        title: 'Race Weekend',
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

const { ipcMain } = require('electron');

ipcMain.handle('get-bridge-enabled', () => {
    return readPrefs().bridgeEnabled;
});

ipcMain.handle('set-bridge-enabled', (event, enabled) => {
    const prefs = readPrefs();
    prefs.bridgeEnabled = !!enabled;
    writePrefs(prefs);
    if (enabled && !bridgeProcess) {
        startBridge();
    } else if (!enabled && bridgeProcess) {
        stopBridge();
    }
    return prefs.bridgeEnabled;
});

app.whenReady().then(() => {
    startBridge();
    createWindow();
});

app.on('window-all-closed', () => {
    stopBridge();
    app.quit();
});

app.on('before-quit', () => {
    stopBridge();
});
