/**
 * Electron main process for Civilization Simulator.
 *
 * - Spawns the Node.js HTTP server (server.js) as a child process
 * - Waits for the server to be ready, then loads the app
 * - Manages Ollama detection, installation, and model pulling via IPC
 * - Cleans up server process on quit
 */
const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const { spawn, execFile, exec } = require('child_process');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');

const PORT = 8080;
let mainWindow = null;
let serverProcess = null;

// ── Server Management ────────────────────────────────────────

function startServer() {
  const serverPath = path.join(__dirname, 'server.js');
  // ELECTRON_RUN_AS_NODE makes the Electron binary act as plain Node.js
  serverProcess = spawn(process.execPath, [serverPath, String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  });
  if (serverProcess.stdout) serverProcess.stdout.on('data', d => process.stdout.write(d));
  if (serverProcess.stderr) serverProcess.stderr.on('data', d => process.stderr.write(d));

  serverProcess.on('error', (err) => {
    console.error('Server failed to start:', err.message);
  });
}

function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

function waitForServer(maxAttempts = 50) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${PORT}/`, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => {
        if (attempts < maxAttempts) setTimeout(check, 100);
        else resolve(false);
      });
      req.setTimeout(500, () => { req.destroy(); });
    };
    check();
  });
}

// ── Window Management ────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Civilization Simulator',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── App Menu ─────────────────────────────────────────────────

function buildMenu() {
  const template = [
    {
      label: 'Civilization Simulator',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Manual',
          click: () => { shell.openExternal('https://github.com/barakwater/civ-sim'); },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template[0].submenu.splice(1, 0, { type: 'separator' }, { role: 'hide' }, { role: 'unhide' });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Ollama IPC Handlers ──────────────────────────────────────

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout: 3000 }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

ipcMain.handle('ollama:check', async () => {
  try {
    const res = await httpGet('http://localhost:11434/api/tags');
    const data = JSON.parse(res.body);
    return { running: true, models: (data.models || []).map(m => m.name) };
  } catch {
    return { running: false, models: [] };
  }
});

ipcMain.handle('ollama:status', async (_event, model) => {
  try {
    const res = await httpGet('http://localhost:11434/api/tags');
    const data = JSON.parse(res.body);
    const models = (data.models || []).map(m => m.name);
    return { installed: models.some(m => m.startsWith(model)) };
  } catch {
    return { installed: false };
  }
});

ipcMain.handle('ollama:install', async () => {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      // macOS: download and open the Ollama installer
      const tmpPath = path.join(os.tmpdir(), 'Ollama-darwin.zip');
      const downloadUrl = 'https://ollama.com/download/Ollama-darwin.zip';

      await downloadFile(downloadUrl, tmpPath, (pct) => {
        if (mainWindow) mainWindow.webContents.send('ollama:progress', { stage: 'download', percent: pct });
      });

      // Extract and install — opens Ollama.app
      await runCommand(`unzip -o "${tmpPath}" -d /Applications`);
      // Launch Ollama to start the service
      await runCommand('open /Applications/Ollama.app');
      // Wait for Ollama to become responsive
      await waitForOllama(30);
      return { success: true };

    } else if (platform === 'win32') {
      // Windows: download and run the installer
      const tmpPath = path.join(os.tmpdir(), 'OllamaSetup.exe');
      const downloadUrl = 'https://ollama.com/download/OllamaSetup.exe';

      await downloadFile(downloadUrl, tmpPath, (pct) => {
        if (mainWindow) mainWindow.webContents.send('ollama:progress', { stage: 'download', percent: pct });
      });

      // Run installer silently
      await runCommand(`"${tmpPath}" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART`);
      // Wait for Ollama service
      await waitForOllama(30);
      return { success: true };

    } else {
      return { success: false, error: `Unsupported platform: ${platform}` };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('ollama:pull-model', async (_event, model) => {
  try {
    return new Promise((resolve, reject) => {
      const proc = spawn('ollama', ['pull', model], { stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
        // Parse progress from ollama output (e.g., "pulling manifest... 45%")
        const match = data.toString().match(/(\d+)%/);
        if (match && mainWindow) {
          mainWindow.webContents.send('ollama:progress', { stage: 'pull', percent: parseInt(match[1]) });
        }
      });
      proc.stderr.on('data', (data) => { output += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0) resolve({ success: true });
        else reject(new Error(`ollama pull exited with code ${code}: ${output}`));
      });
      proc.on('error', reject);
    });
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ── Helper Functions ─────────────────────────────────────────

function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest, onProgress).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }

      const total = parseInt(res.headers['content-length'], 10) || 0;
      let received = 0;
      const file = fs.createWriteStream(dest);

      res.on('data', (chunk) => {
        received += chunk.length;
        file.write(chunk);
        if (total > 0 && onProgress) onProgress(Math.round(received / total * 100));
      });
      res.on('end', () => { file.end(); resolve(); });
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

function waitForOllama(maxSeconds) {
  return new Promise((resolve) => {
    let elapsed = 0;
    const check = () => {
      httpGet('http://localhost:11434/api/tags')
        .then(() => resolve(true))
        .catch(() => {
          elapsed += 2;
          if (elapsed < maxSeconds) setTimeout(check, 2000);
          else resolve(false);
        });
    };
    setTimeout(check, 2000); // Initial delay for Ollama to start
  });
}

// ── App Lifecycle ────────────────────────────────────────────

app.whenReady().then(async () => {
  buildMenu();

  // Start the embedded HTTP server
  startServer();
  const serverReady = await waitForServer();
  if (!serverReady) {
    dialog.showErrorBox('Server Error', 'Could not start the CivSim server. Please try restarting the application.');
    app.quit();
    return;
  }

  createWindow();
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  stopServer();
});
