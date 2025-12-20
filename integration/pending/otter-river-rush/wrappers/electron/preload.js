// Preload script for Electron
// This runs in a separate context with access to Node.js APIs

import { contextBridge } from 'electron';

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
});
