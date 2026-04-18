/**
 * preload.js
 * Runs in a privileged context with access to Node APIs,
 * but exposes only a safe, narrow API to the renderer via contextBridge.
 *
 * The renderer's bridge.js already checks for window.electronBridge —
 * this is the implementation of that contract.
 */
const { contextBridge, ipcRenderer } = require('electron');
 
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
});