/**
 * Electron preload script — exposes safe IPC bridge to renderer.
 * Used by setup_assistant.js for Ollama management and system operations.
 */
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Ollama management
  ollamaCheck:     ()        => ipcRenderer.invoke('ollama:check'),
  ollamaInstall:   ()        => ipcRenderer.invoke('ollama:install'),
  ollamaPullModel: (model)   => ipcRenderer.invoke('ollama:pull-model', model),
  ollamaStatus:    (model)   => ipcRenderer.invoke('ollama:status', model),

  // Progress events from main process
  onProgress: (callback) => {
    ipcRenderer.on('ollama:progress', (_event, data) => callback(data));
  },

  // Open URL in system browser
  openExternal: (url) => shell.openExternal(url),

  // Platform info
  platform: process.platform,
});
