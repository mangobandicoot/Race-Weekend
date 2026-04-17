// preload.js — exposes bridge toggle to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
    getBridgeEnabled: () => ipcRenderer.invoke('get-bridge-enabled'),
    setBridgeEnabled: (val) => ipcRenderer.invoke('set-bridge-enabled', val),
});