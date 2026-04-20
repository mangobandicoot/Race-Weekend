/**
 * preload.js
 * Runs in a privileged context with access to Node APIs,
 * but exposes only a safe, narrow API to the renderer via contextBridge.
 *
 * The renderer's bridge.js already checks for window.electronBridge —
 * this is the implementation of that contract.
 */
const { contextBridge, ipcRenderer } = require('electron');

// Expose save/load to renderer as simple async functions
contextBridge.exposeInMainWorld('_electronSave', (data) => ipcRenderer.invoke('save:write', data));
contextBridge.exposeInMainWorld('_electronLoad', () => ipcRenderer.invoke('save:read'));
contextBridge.exposeInMainWorld('_electronDelete', () => ipcRenderer.invoke('save:delete'));

// Flag for no-bridge builds
contextBridge.exposeInMainWorld('_noBridge', !!(require('./package.json').nobridge));

contextBridge.exposeInMainWorld('electronBridge', {
  // Whether the bridge auto-starts on launch
  getBridgeEnabled: () => ipcRenderer.invoke('bridge:getEnabled'),
  setBridgeEnabled: (val) => ipcRenderer.invoke('bridge:setEnabled', val),
 
  // Live process status (running, pid)
  getBridgeStatus: () => ipcRenderer.invoke('bridge:getStatus'),
 
  // Manual restart
  restartBridge: () => ipcRenderer.invoke('bridge:restart'),
 
  // App version (useful for "About" display)
  getVersion: () => ipcRenderer.invoke('app:version'),

  // Bridge race event log (DNFs + yellows written at session end)
  readBridgeEvents: () => ipcRenderer.invoke('bridge:readEvents'),
});