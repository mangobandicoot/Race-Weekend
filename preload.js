/**
 * preload.js
 * Runs in a privileged context with access to Node APIs,
 * but exposes only a safe, narrow API to the renderer via contextBridge.
 */
const { contextBridge, ipcRenderer } = require('electron');

// Expose save/load to renderer as simple async functions
contextBridge.exposeInMainWorld('_electronSave', (data) => ipcRenderer.invoke('save:write', data));
contextBridge.exposeInMainWorld('_electronLoad', () => ipcRenderer.invoke('save:read'));
contextBridge.exposeInMainWorld('_electronDelete', () => ipcRenderer.invoke('save:delete'));

// _noBridge — resolved via IPC so no file system access needed in preload
// Defaults to false until main process responds
let _noBridgeValue = false;
ipcRenderer.invoke('bridge:isNoFlags').then(val => { _noBridgeValue = !!val; }).catch(() => {});
contextBridge.exposeInMainWorld('_noBridge', false); // safe default — updated at runtime via electronBridge

contextBridge.exposeInMainWorld('electronBridge', {
  // Whether the bridge auto-starts on launch
  getBridgeEnabled: () => ipcRenderer.invoke('bridge:getEnabled'),
  setBridgeEnabled: (val) => ipcRenderer.invoke('bridge:setEnabled', val),

  // Live process status (running, pid)
  getBridgeStatus: () => ipcRenderer.invoke('bridge:getStatus'),

  // Manual restart
  restartBridge: () => ipcRenderer.invoke('bridge:restart'),

  // App version
  getVersion: () => ipcRenderer.invoke('app:version'),

  // Bridge race event log
  readBridgeEvents: () => ipcRenderer.invoke('bridge:readEvents'),

  // Is this a no-flags build?
  isNoFlags: () => ipcRenderer.invoke('bridge:isNoFlags'),
});
