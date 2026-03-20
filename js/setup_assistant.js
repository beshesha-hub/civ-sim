// ============================================================
// setup_assistant.js — First-run LLM setup wizard
// ============================================================
//
// Shows on first launch (no civSimSettings in localStorage).
// Handles Ollama auto-install, tinyllama model pull, and
// optional cloud LLM API key configuration (Groq / Gemini).
//
// In Electron: uses window.electronAPI (from preload.js) for
//   Ollama install/pull. Falls back to browser-only flow when
//   running outside Electron (web hosting).

const SetupAssistant = {

  _overlay: null,
  _currentStep: 0,
  _settings: {
    apiKey: '',
    apiProvider: 'none',
    apiModel: '',
    ollamaUrl: 'http://localhost:11434',
    ollamaDetected: false,
  },

  // ── Entry Point ──────────────────────────────────────────

  /** Returns true if first-run setup should be shown. */
  needsSetup() {
    // Skip if settings already exist
    if (localStorage.getItem('civSimSettings')) return false;
    return true;
  },

  /** Show the setup wizard overlay. Returns a Promise that resolves when done. */
  show() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._overlay = document.createElement('div');
      this._overlay.className = 'setup-assistant-overlay';
      this._overlay.innerHTML = '<div class="setup-assistant-panel"></div>';
      document.body.appendChild(this._overlay);
      this._showStep(0);
    });
  },

  // ── Step Rendering ───────────────────────────────────────

  _showStep(step) {
    this._currentStep = step;
    const panel = this._overlay.querySelector('.setup-assistant-panel');
    panel.innerHTML = '';

    switch (step) {
      case 0: this._renderWelcome(panel); break;
      case 1: this._renderOllamaStep(panel); break;
      case 2: this._renderCloudStep(panel); break;
      case 3: this._renderDone(panel); break;
    }
  },

  // ── Step 0: Welcome ──────────────────────────────────────

  _renderWelcome(panel) {
    panel.innerHTML = `
      <h2>Welcome to Civilization Simulator</h2>
      <p class="sa-desc">Let's set up AI-powered NPC interviews. This takes about 2 minutes.</p>
      <p class="sa-desc">NPC interviews let you talk to citizens of your civilization — a farmer about crop yields, a merchant about trade, an elite about power. An AI model generates contextual responses based on your civilization's actual conditions.</p>
      <div class="sa-info-box">
        <strong>What we'll set up:</strong>
        <ul>
          <li><strong>Ollama + tinyllama</strong> — A small, fast AI model that runs locally on your computer. Free, private, no internet needed. (English only)</li>
          <li><strong>Cloud LLM (optional)</strong> — Groq or Gemini for richer responses in 5 languages. Free tiers available.</li>
        </ul>
      </div>
      <p class="sa-note">You can skip this entirely — the game is fully playable without AI interviews.</p>
      <div class="sa-buttons">
        <button class="sa-btn sa-btn-primary" id="sa-begin">Set Up AI Interviews</button>
        <button class="sa-btn sa-btn-skip" id="sa-skip-all">Skip — Play Without AI</button>
      </div>
    `;
    panel.querySelector('#sa-begin').onclick = () => this._showStep(1);
    panel.querySelector('#sa-skip-all').onclick = () => this._finish();
  },

  // ── Step 1: Ollama ───────────────────────────────────────

  async _renderOllamaStep(panel) {
    const isElectron = !!window.electronAPI;

    panel.innerHTML = `
      <h2>Step 1: Local AI Model</h2>
      <p class="sa-desc">Ollama runs a small AI model (tinyllama, 637 MB) locally on your computer. It's free and private — nothing leaves your machine.</p>
      <div id="sa-ollama-status" class="sa-status">Checking for Ollama...</div>
      <div id="sa-ollama-progress" class="sa-progress-wrap" style="display:none">
        <div class="sa-progress-bar"><div class="sa-progress-fill" id="sa-progress-fill"></div></div>
        <div class="sa-progress-text" id="sa-progress-text"></div>
      </div>
      <div id="sa-ollama-actions" class="sa-buttons" style="display:none"></div>
    `;

    const statusEl = panel.querySelector('#sa-ollama-status');
    const actionsEl = panel.querySelector('#sa-ollama-actions');
    const progressEl = panel.querySelector('#sa-ollama-progress');

    if (!isElectron) {
      // Web/dev mode — can't auto-install, give instructions
      statusEl.innerHTML = `
        <div class="sa-info-box">
          <p>You're running in a browser. To use local AI interviews:</p>
          <ol>
            <li>Install Ollama from <a href="https://ollama.com/download" target="_blank" rel="noopener">ollama.com/download</a></li>
            <li>Open Terminal and run: <code>ollama pull tinyllama</code></li>
            <li>Leave Ollama running in the background</li>
          </ol>
        </div>
      `;
      actionsEl.style.display = '';
      actionsEl.innerHTML = `
        <button class="sa-btn sa-btn-primary" id="sa-ollama-recheck">I've Installed It — Check Again</button>
        <button class="sa-btn sa-btn-skip" id="sa-ollama-skip">Skip Local AI</button>
      `;
      actionsEl.querySelector('#sa-ollama-recheck').onclick = () => this._checkOllamaWeb(statusEl, actionsEl);
      actionsEl.querySelector('#sa-ollama-skip').onclick = () => this._showStep(2);
      return;
    }

    // Electron mode — auto-detect and install
    const result = await window.electronAPI.ollamaCheck();

    if (result.running) {
      // Ollama is running — check for tinyllama
      const modelStatus = await window.electronAPI.ollamaStatus('tinyllama');
      if (modelStatus.installed) {
        statusEl.innerHTML = '<span class="sa-ok">Ollama is running and tinyllama is installed.</span>';
        this._settings.apiProvider = 'ollama';
        this._settings.ollamaDetected = true;
        actionsEl.style.display = '';
        actionsEl.innerHTML = '<button class="sa-btn sa-btn-primary" id="sa-ollama-next">Next</button>';
        actionsEl.querySelector('#sa-ollama-next').onclick = () => this._showStep(2);
      } else {
        statusEl.innerHTML = '<span class="sa-warn">Ollama is running but tinyllama is not installed.</span>';
        actionsEl.style.display = '';
        actionsEl.innerHTML = `
          <button class="sa-btn sa-btn-primary" id="sa-pull-model">Download tinyllama (637 MB)</button>
          <button class="sa-btn sa-btn-skip" id="sa-ollama-skip">Skip</button>
        `;
        actionsEl.querySelector('#sa-pull-model').onclick = () => this._pullTinyllama(statusEl, actionsEl, progressEl);
        actionsEl.querySelector('#sa-ollama-skip').onclick = () => this._showStep(2);
      }
    } else {
      statusEl.innerHTML = '<span class="sa-warn">Ollama is not installed.</span>';
      actionsEl.style.display = '';
      actionsEl.innerHTML = `
        <button class="sa-btn sa-btn-primary" id="sa-install-ollama">Install Ollama + tinyllama</button>
        <button class="sa-btn sa-btn-skip" id="sa-ollama-skip">Skip Local AI</button>
      `;
      actionsEl.querySelector('#sa-install-ollama').onclick = () => this._installOllama(statusEl, actionsEl, progressEl);
      actionsEl.querySelector('#sa-ollama-skip').onclick = () => this._showStep(2);
    }
  },

  async _installOllama(statusEl, actionsEl, progressEl) {
    actionsEl.style.display = 'none';
    progressEl.style.display = '';
    statusEl.innerHTML = '<span class="sa-info">Downloading Ollama...</span>';

    // Listen for progress events
    window.electronAPI.onProgress((data) => {
      const fill = progressEl.querySelector('#sa-progress-fill');
      const text = progressEl.querySelector('#sa-progress-text');
      fill.style.width = `${data.percent}%`;
      if (data.stage === 'download') text.textContent = `Downloading Ollama... ${data.percent}%`;
      else if (data.stage === 'pull') text.textContent = `Downloading tinyllama... ${data.percent}%`;
    });

    const result = await window.electronAPI.ollamaInstall();
    if (!result.success) {
      statusEl.innerHTML = `<span class="sa-error">Installation failed: ${result.error}</span>`;
      actionsEl.style.display = '';
      actionsEl.innerHTML = `
        <button class="sa-btn sa-btn-primary" id="sa-retry">Retry</button>
        <button class="sa-btn sa-btn-skip" id="sa-ollama-skip">Skip</button>
      `;
      actionsEl.querySelector('#sa-retry').onclick = () => this._installOllama(statusEl, actionsEl, progressEl);
      actionsEl.querySelector('#sa-ollama-skip').onclick = () => this._showStep(2);
      return;
    }

    // Now pull tinyllama
    await this._pullTinyllama(statusEl, actionsEl, progressEl);
  },

  async _pullTinyllama(statusEl, actionsEl, progressEl) {
    actionsEl.style.display = 'none';
    progressEl.style.display = '';
    statusEl.innerHTML = '<span class="sa-info">Downloading tinyllama model (637 MB)...</span>';

    const result = await window.electronAPI.ollamaPullModel('tinyllama');
    progressEl.style.display = 'none';

    if (result.success) {
      this._settings.apiProvider = 'ollama';
      this._settings.ollamaDetected = true;
      statusEl.innerHTML = '<span class="sa-ok">tinyllama installed successfully!</span>';
      actionsEl.style.display = '';
      actionsEl.innerHTML = '<button class="sa-btn sa-btn-primary" id="sa-ollama-next">Next</button>';
      actionsEl.querySelector('#sa-ollama-next').onclick = () => this._showStep(2);
    } else {
      statusEl.innerHTML = `<span class="sa-error">Model download failed: ${result.error}</span>`;
      actionsEl.style.display = '';
      actionsEl.innerHTML = `
        <button class="sa-btn sa-btn-primary" id="sa-retry">Retry</button>
        <button class="sa-btn sa-btn-skip" id="sa-ollama-skip">Skip</button>
      `;
      actionsEl.querySelector('#sa-retry').onclick = () => this._pullTinyllama(statusEl, actionsEl, progressEl);
      actionsEl.querySelector('#sa-ollama-skip').onclick = () => this._showStep(2);
    }
  },

  async _checkOllamaWeb(statusEl, actionsEl) {
    statusEl.innerHTML = 'Checking...';
    try {
      const resp = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
      const data = await resp.json();
      const models = (data.models || []).map(m => m.name);
      if (models.some(m => m.startsWith('tinyllama'))) {
        this._settings.apiProvider = 'ollama';
        this._settings.ollamaDetected = true;
        statusEl.innerHTML = '<span class="sa-ok">Ollama detected with tinyllama!</span>';
        actionsEl.innerHTML = '<button class="sa-btn sa-btn-primary" id="sa-ollama-next">Next</button>';
        actionsEl.querySelector('#sa-ollama-next').onclick = () => this._showStep(2);
      } else {
        statusEl.innerHTML = '<span class="sa-warn">Ollama detected but tinyllama not found. Run: <code>ollama pull tinyllama</code></span>';
      }
    } catch {
      statusEl.innerHTML = '<span class="sa-warn">Ollama not detected. Make sure it is running.</span>';
    }
  },

  // ── Step 2: Cloud LLM ───────────────────────────────────

  _renderCloudStep(panel) {
    panel.innerHTML = `
      <h2>Step 2: Cloud AI (Optional)</h2>
      <p class="sa-desc">Cloud LLMs provide richer, multilingual AI interviews (English, Spanish, German, Chinese, Russian). Free tiers are available.</p>
      ${this._settings.ollamaDetected ? '<p class="sa-note">You already have Ollama set up for English interviews. A cloud provider adds multilingual support and richer responses.</p>' : '<p class="sa-note">Without a cloud provider, AI interviews won\'t be available (you skipped local AI). The game still works — you\'ll get rule-based NPC responses instead.</p>'}
      <div class="sa-cloud-cards">
        <div class="sa-cloud-card" id="sa-card-groq">
          <h3>Groq</h3>
          <p>Fast, free tier (30 req/min). Recommended.</p>
          <button class="sa-btn sa-btn-link" id="sa-groq-signup">Get Free API Key</button>
          <div class="sa-key-input">
            <input type="password" id="sa-groq-key" placeholder="Paste Groq API key here" spellcheck="false" autocomplete="off">
            <button class="sa-btn sa-btn-small" id="sa-groq-test">Test</button>
          </div>
          <div class="sa-key-status" id="sa-groq-status"></div>
        </div>
        <div class="sa-cloud-card" id="sa-card-gemini">
          <h3>Gemini</h3>
          <p>Google's AI. Free tier available.</p>
          <button class="sa-btn sa-btn-link" id="sa-gemini-signup">Get Free API Key</button>
          <div class="sa-key-input">
            <input type="password" id="sa-gemini-key" placeholder="Paste Gemini API key here" spellcheck="false" autocomplete="off">
            <button class="sa-btn sa-btn-small" id="sa-gemini-test">Test</button>
          </div>
          <div class="sa-key-status" id="sa-gemini-status"></div>
        </div>
      </div>
      <div class="sa-buttons">
        <button class="sa-btn sa-btn-primary" id="sa-cloud-next">Next</button>
        <button class="sa-btn sa-btn-skip" id="sa-cloud-skip">Skip Cloud AI</button>
      </div>
    `;

    const openUrl = (url) => {
      if (window.electronAPI) window.electronAPI.openExternal(url);
      else window.open(url, '_blank');
    };

    panel.querySelector('#sa-groq-signup').onclick = () => openUrl('https://console.groq.com/keys');
    panel.querySelector('#sa-gemini-signup').onclick = () => openUrl('https://aistudio.google.com/app/apikey');

    panel.querySelector('#sa-groq-test').onclick = () => this._testApiKey('groq');
    panel.querySelector('#sa-gemini-test').onclick = () => this._testApiKey('gemini');

    panel.querySelector('#sa-cloud-next').onclick = () => this._saveCloudKey();
    panel.querySelector('#sa-cloud-skip').onclick = () => this._showStep(3);
  },

  async _testApiKey(provider) {
    const keyEl = document.getElementById(`sa-${provider}-key`);
    const statusEl = document.getElementById(`sa-${provider}-status`);
    const key = keyEl.value.trim();
    if (!key) { statusEl.innerHTML = '<span class="sa-warn">Please enter an API key.</span>'; return; }

    statusEl.innerHTML = 'Testing...';

    try {
      let url, headers, body;
      if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers = { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' };
        body = { model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 };
      } else {
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        headers = { 'Content-Type': 'application/json' };
        body = { contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 5 } };
      }

      const resp = await Utils.llmFetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (resp.ok) {
        statusEl.innerHTML = '<span class="sa-ok">Key is valid!</span>';
        // Highlight this card
        document.getElementById(`sa-card-${provider}`).classList.add('sa-card-selected');
        // Deselect the other
        const other = provider === 'groq' ? 'gemini' : 'groq';
        document.getElementById(`sa-card-${other}`).classList.remove('sa-card-selected');
      } else {
        const data = await resp.json().catch(() => ({}));
        statusEl.innerHTML = `<span class="sa-error">Invalid key (HTTP ${resp.status})</span>`;
      }
    } catch (e) {
      statusEl.innerHTML = `<span class="sa-error">Test failed: ${e.message}</span>`;
    }
  },

  _saveCloudKey() {
    // Check which provider has a validated key
    const groqKey = document.getElementById('sa-groq-key')?.value.trim();
    const geminiKey = document.getElementById('sa-gemini-key')?.value.trim();
    const groqSelected = document.getElementById('sa-card-groq')?.classList.contains('sa-card-selected');
    const geminiSelected = document.getElementById('sa-card-gemini')?.classList.contains('sa-card-selected');

    if (groqSelected && groqKey) {
      this._settings.apiProvider = 'groq';
      this._settings.apiKey = groqKey;
    } else if (geminiSelected && geminiKey) {
      this._settings.apiProvider = 'gemini';
      this._settings.apiKey = geminiKey;
    }
    // If Ollama was set up but a cloud key is also provided, prefer the cloud for multilingual
    // The user can change this in Settings later

    this._showStep(3);
  },

  // ── Step 3: Done ─────────────────────────────────────────

  _renderDone(panel) {
    const hasOllama = this._settings.ollamaDetected;
    const hasCloud = this._settings.apiKey && this._settings.apiProvider !== 'none' && this._settings.apiProvider !== 'ollama';
    const provider = this._settings.apiProvider;

    let summary = '';
    if (hasOllama && hasCloud) {
      summary = `Ollama (tinyllama) is ready for local English interviews. ${provider.charAt(0).toUpperCase() + provider.slice(1)} is configured for multilingual support. You can switch between them in Settings.`;
    } else if (hasOllama) {
      summary = 'Ollama (tinyllama) is ready for local English AI interviews. You can add a cloud provider later in Settings for multilingual support.';
    } else if (hasCloud) {
      summary = `${provider.charAt(0).toUpperCase() + provider.slice(1)} is configured for AI interviews in all 5 supported languages.`;
    } else {
      summary = 'No AI provider configured. NPC interviews will use rule-based responses (still informative!). You can set up AI anytime in Settings.';
    }

    panel.innerHTML = `
      <h2>Setup Complete</h2>
      <p class="sa-desc">${summary}</p>
      <div class="sa-info-box">
        <strong>Quick tips:</strong>
        <ul>
          <li>Press <strong>C</strong> during gameplay to open the Chronicle panel and interview NPCs</li>
          <li>Change AI settings anytime via the Settings button in the game toolbar</li>
          <li>Try asking NPCs about their daily life, the environment, or recent events</li>
        </ul>
      </div>
      <div class="sa-buttons">
        <button class="sa-btn sa-btn-primary sa-btn-large" id="sa-start-playing">Start Playing</button>
      </div>
    `;
    panel.querySelector('#sa-start-playing').onclick = () => this._finish();
  },

  // ── Finish ───────────────────────────────────────────────

  _finish() {
    // Save settings to localStorage
    const existing = JSON.parse(localStorage.getItem('civSimSettings') || '{}');
    const merged = { ...existing, ...this._settings };
    // Ensure all default fields are present
    merged.yearsPerTurn = merged.yearsPerTurn || 10;
    merged.overlayMode = merged.overlayMode || 'terrain';
    merged.language = merged.language || 'en';
    localStorage.setItem('civSimSettings', JSON.stringify(merged));

    // Remove overlay
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }

    if (this._resolve) this._resolve();
  },
};
