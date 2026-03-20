// ============================================================
// ui.js - UI manager: screens, panels, and HUD
// ============================================================

class UIManager {
  constructor(game) {
    this.game = game;
    this.currentScreen = 'title';
    this.notificationQueue = [];   // { msg, type, year } — capped at 200
    this.unreadNotifCount  = 0;
    this._notifLogTab      = 'all';
    this._notifTimer = null;
    this.setupWizardStep = 0;
    this.setupData = {};
    this._animFrame = null;
    this._strataImpactVerbose = false; // toggled by 📝 Notes button in Strata panel
  }

  // ── Screen Management ─────────────────────────────────────────
  showScreen(screenId) {
    Utils.qsa('.screen').forEach(s => s.style.display = 'none');
    const screen = Utils.el(screenId);
    if (screen) screen.style.display = 'flex';
    this.currentScreen = screenId;
  }

  showTitle() {
    this.showScreen('title-screen');
  }

  showSetup() {
    this.setupWizardStep = 0;
    this.setupData = this._defaultSetupData();
    this.showScreen('setup-screen');
    this.renderSetupStep();
  }

  /** Pre-fill setup wizard with saved scenario params, then open the wizard. */
  startSetupFromScenario(prefilledData) {
    this.setupWizardStep = 0;
    this.setupData = { ...this._defaultSetupData(), ...prefilledData };
    // Close Settings panel if open
    const settingsPanel = Utils.el('settings-panel');
    if (settingsPanel) settingsPanel.style.display = 'none';
    this.showScreen('setup-screen');
    this.renderSetupStep();
  }

  showGame() {
    this.showScreen('game-screen');
    this._applyI18n();
    this._startRenderLoop();
    this.renderHUD();
  }

  showSettings() {
    const panel = Utils.el('settings-panel');
    if (panel) {
      panel.style.display = 'flex';
      this._renderSettings(panel);
    }
  }

  showHistory(civ) {
    const panel = Utils.el('history-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    this._renderHistory(panel, civ || this.game.civilizations.find(c => c.isPlayerCiv) || this.game.civilizations[0]);
  }

  showWorldState() {
    const panel = Utils.el('world-state-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    this._renderWorldState(panel);
  }

  // ── Notification type detection ───────────────────────────────
  _detectNotifType(msg) {
    if (/⚔️|War |Revolution|Coup|Conquest|Invaded|declared war/u.test(msg))           return 'war';
    if (/🛸|[Aa]lien [Cc]ontact|[Aa]lien [Ss]ignal/u.test(msg))                       return 'alien';
    if (/☠️|[Pp]lague/u.test(msg))                                                     return 'plague';
    if (/☄️|[Ee]xtinction/u.test(msg))                                                 return 'extinction';
    if (/🤝|📜|🕊️|[Tt]reaty|[Pp]act|[Aa]lliance|Non-Aggression/u.test(msg))           return 'diplomacy';
    if (/⚙️|[Tt]echnology|[Tt]ech discovery/u.test(msg))                               return 'tech';
    if (/✨|[Rr]eligion/u.test(msg))                                                    return 'religion';
    if (/🏗️|[Ww]orks|construction begun|[Pp]roject/u.test(msg))                       return 'works';
    if (/🌡️|[Ww]arming index/u.test(msg))                                              return 'climate';
    if (/🌅|Era transition/u.test(msg))                                                 return 'era';
    if (/^❌/u.test(msg))                                                               return 'error';
    if (/^✅/u.test(msg))                                                               return 'success';
    return 'info';
  }

  showNotification(msg, duration = 3000, type = null) {
    const container = Utils.el('notifications');
    if (!container) return;
    const resolvedType = type || this._detectNotifType(msg);
    const note = Utils.createEl('div', `notification notification-${resolvedType}`);
    note.textContent = msg;
    container.appendChild(note);
    setTimeout(() => { note.classList.add('fade-out'); setTimeout(() => note.remove(), 400); }, duration);

    // ── Store in log ──────────────────────────────────────────────
    this.notificationQueue.push({ msg, type: resolvedType, year: this.game?.currentYear ?? null });
    if (this.notificationQueue.length > 200) this.notificationQueue.shift();
    this.unreadNotifCount++;
    this._updateNotifBadge();
  }

  _updateNotifBadge() {
    const badge = Utils.el('notif-badge');
    if (!badge) return;
    if (this.unreadNotifCount > 0) {
      badge.textContent = this.unreadNotifCount > 99 ? '99+' : String(this.unreadNotifCount);
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Notification Log Panel ────────────────────────────────────
  showNotifLog() {
    const panel = Utils.el('notification-log-panel');
    if (!panel) return;
    // Reset unread count when opening
    this.unreadNotifCount = 0;
    this._updateNotifBadge();
    panel.style.display = 'flex';
    this._renderNotifLog(panel);
  }

  hideNotifLog() {
    const panel = Utils.el('notification-log-panel');
    if (panel) panel.style.display = 'none';
  }

  _renderNotifLog(panel) {
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.appendChild(Utils.createEl('h2', '', '🔔 Notification Log'));
    const clearBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', 'Clear');
    clearBtn.style.cssText = 'margin-top:6px;font-size:0.8rem;';
    clearBtn.onclick = () => {
      this.notificationQueue = [];
      this.unreadNotifCount = 0;
      this._updateNotifBadge();
      this._renderNotifLog(panel);
    };
    titleWrap.appendChild(clearBtn);
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => this.hideNotifLog();
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tab filters
    const TAB_DEFS = [
      { id: 'all',       label: 'All' },
      { id: 'war',       label: '⚔️ War' },
      { id: 'alien',     label: '🛸 Alien' },
      { id: 'plague',    label: '☠️ Plague' },
      { id: 'extinction',label: '☄️ Extinction' },
      { id: 'diplomacy', label: '🤝 Diplomacy' },
      { id: 'tech',      label: '⚙️ Tech' },
      { id: 'works',     label: '🏗️ Works' },
      { id: 'climate',   label: '🌡️ Climate' },
      { id: 'other',     label: 'Other' },
    ];
    const tabs = Utils.createEl('div', 'panel-tabs');
    for (const tab of TAB_DEFS) {
      const btn = Utils.createEl('button', `tab-btn ${this._notifLogTab === tab.id ? 'active' : ''}`, tab.label);
      btn.onclick = () => { this._notifLogTab = tab.id; this._renderNotifLog(panel); };
      tabs.appendChild(btn);
    }
    panel.appendChild(tabs);

    // Content
    const content = Utils.createEl('div', 'panel-content');
    const activeTab = this._notifLogTab;
    const OTHER_TYPES = new Set(['religion', 'era', 'error', 'success', 'info']);

    const filtered = [...this.notificationQueue].reverse().filter(n => {
      if (activeTab === 'all') return true;
      if (activeTab === 'other') return OTHER_TYPES.has(n.type);
      return n.type === activeTab;
    });

    if (filtered.length === 0) {
      const empty = Utils.createEl('div', '', activeTab === 'all' ? 'No notifications yet.' : 'No notifications of this type.');
      empty.style.cssText = 'color:var(--text-dim);text-align:center;padding:40px 0;font-size:0.9rem;';
      content.appendChild(empty);
    } else {
      for (const entry of filtered) {
        const row = Utils.createEl('div', `notif-log-entry notif-log-${entry.type}`);
        const msgSpan = Utils.createEl('span', 'notif-log-msg', entry.msg);
        const yearSpan = Utils.createEl('span', 'notif-log-year',
          entry.year !== null ? Utils.formatYear(entry.year) : '');
        row.appendChild(msgSpan);
        row.appendChild(yearSpan);
        content.appendChild(row);
      }
    }

    panel.appendChild(content);
  }

  // ── Setup Wizard ──────────────────────────────────────────────
  _defaultSetupData() {
    return {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'New Civilization',
      civColor: CIV_COLORS[0],
      economic: { model: 'gift', scarcityOrientation: 20, accumulationAllowed: false },
      governance: { model: 'flat_consensus', hierarchyLevel: 5, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 70, collectivismLevel: 65, participationVoluntary: 80,
        outsiderRelationship: 'trading', coreValues: ['mutual respect', 'sustainability'],
        constitutionText: '', innovationTolerance: 60,
      },
      religion: { presence: 'none', stateRelationship: 'separate', religions: [] },
      aiCivCount: 3,
      customMode: false,
      // ── Geography & Climate ──────────────────────────────────
      worldClimate: { warmth: 0, moisture: 0 },  // −2 to +2
      geography: {
        oceanAccess: true,
        placement: 'continent',
        terrainMix: [],
        climateZone: 'temperate',
      },
      // ── Society & Economy ─────────────────────────────────────
      // Empty: derivation runs in _renderSetupSociety and _computeSocietyInitials
      society:          {},
      // ── Family, Identity & Reproductive Health ─────────────────
      societyFamily:    {},
      // ── Science & Arts ────────────────────────────────────────────
      societyCulture:   {},
      // ── Healthcare ───────────────────────────────────────────────
      societyHealth:    {},
      // ── Resource Management ────────────────────────────────────────
      societyResources: {},
      // ── Information Ecosystem ──────────────────────────────────────
      societyInfo:      {},
      // ── Scenario ─────────────────────────────────────────────
      scenarioName: '',    // if non-empty, saved as a scenario on game start
      _scenarioId: null,   // set when loading a scenario to run again
      _scenarioRunLabel: '', // label for this run
      // ── Research (Pass 9) ─────────────────────────────────────
      researchSeed: null,  // null = auto-generate; integer = use as run seed
    };
  }

  // ── i18n helper ───────────────────────────────────────────
  _t(key) {
    return (typeof I18N !== 'undefined') ? I18N.t(key) : key;
  }

  // Apply i18n translations to all [data-i18n] elements in the DOM
  _applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = this._t(key);
      if (text && text !== key) el.textContent = text;
    });
  }

  renderSetupStep() {
    const container = Utils.el('setup-content');
    if (!container) return;
    container.innerHTML = '';

    // Also update setup header text on each render
    const headerH1 = document.querySelector('.setup-header h1');
    const headerP  = document.querySelector('.setup-header p');
    if (headerH1) headerH1.textContent = this._t('setupHeader');
    if (headerP)  headerP.textContent  = this._t('setupHeaderDesc');

    const steps = [
      { id: 'era',        title: this._t('step_era'),        render: (c) => this._renderSetupEra(c) },
      { id: 'role',       title: this._t('step_role'),       render: (c) => this._renderSetupRole(c) },
      { id: 'preset',     title: this._t('step_preset'),     render: (c) => this._renderSetupPreset(c) },
      { id: 'economics',  title: this._t('step_economics'),  render: (c) => this._renderSetupEconomics(c) },
      { id: 'governance', title: this._t('step_governance'), render: (c) => this._renderSetupGovernance(c) },
      { id: 'principles', title: this._t('step_principles'), render: (c) => this._renderSetupPrinciples(c) },
      { id: 'religion',   title: this._t('step_religion'),   render: (c) => this._renderSetupReligion(c) },
      { id: 'world',      title: this._t('step_world'),      render: (c) => this._renderSetupWorld(c) },
      { id: 'geography',  title: 'Geography & Climate',             render: (c) => this._renderSetupGeography(c) },
      { id: 'society',       title: 'Social & Economic Foundations',   render: (c) => this._renderSetupSociety(c) },
      { id: 'family_culture', title: 'Family, Culture & Knowledge',     render: (c) => this._renderSetupFamilyCulture(c) },
      { id: 'scenario',      title: 'Scenario Options',                 render: (c) => this._renderSetupScenario(c) },
    ];

    const step = steps[this.setupWizardStep];
    if (!step) { this.game.startGame(this.setupData); return; }

    // Progress
    const progress = Utils.createEl('div', 'setup-progress');
    for (let i = 0; i < steps.length; i++) {
      const dot = Utils.createEl('div', `progress-dot ${i < this.setupWizardStep ? 'done' : ''} ${i === this.setupWizardStep ? 'active' : ''}`);
      progress.appendChild(dot);
    }
    container.appendChild(progress);

    const stepTitle = Utils.createEl('h2', 'setup-step-title', step.title);
    container.appendChild(stepTitle);

    step.render(container);

    // Navigation
    const nav = Utils.createEl('div', 'setup-nav');
    if (this.setupWizardStep > 0) {
      const back = Utils.createEl('button', 'btn btn-secondary', this._t('setup_back'));
      back.onclick = () => { this.setupWizardStep--; this.renderSetupStep(); };
      nav.appendChild(back);
    }
    const next = Utils.createEl('button', 'btn btn-primary', this.setupWizardStep === steps.length - 1 ? this._t('setup_start') : this._t('setup_next'));
    next.onclick = () => { this.setupWizardStep++; this.renderSetupStep(); };
    nav.appendChild(next);
    container.appendChild(nav);
  }

  _renderSetupEra(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_era_desc'));
    container.appendChild(desc);

    const timelineWrap = Utils.createEl('div', 'timeline-wrap');
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = -4000; slider.max = 2000; slider.step = 100;
    slider.value = this.setupData.startYear;
    slider.className = 'year-slider';

    const label = Utils.createEl('div', 'year-display', Utils.formatYear(this.setupData.startYear));
    const eraLabel = Utils.createEl('div', 'era-label', '');
    const eraDesc = Utils.createEl('div', 'era-desc', '');

    const updateLabel = () => {
      const year = parseInt(slider.value);
      this.setupData.startYear = year;
      label.textContent = Utils.formatYear(year);
      const era = Utils.getEra(year);
      eraLabel.textContent = era.label;
      eraDesc.textContent = this._getEraDescription(era.id);
    };
    slider.oninput = updateLabel;
    updateLabel();

    timelineWrap.appendChild(slider);
    timelineWrap.appendChild(label);
    timelineWrap.appendChild(eraLabel);
    timelineWrap.appendChild(eraDesc);
    container.appendChild(timelineWrap);

    // Quick era buttons
    const quickPick = Utils.createEl('div', 'quick-eras');
    const eraSnaps = [
      { year: -3500, label: this._t('era_btn_Ancient') },
      { year: -1000, label: this._t('era_btn_Iron_Age') },
      { year: 200,   label: this._t('era_btn_Classical') },
      { year: 900,   label: this._t('era_btn_Medieval') },
      { year: 1750,  label: this._t('era_btn_Industrial') },
      { year: 1950,  label: this._t('era_btn_Modern') },
    ];
    for (const snap of eraSnaps) {
      const btn = Utils.createEl('button', 'btn btn-secondary btn-sm', snap.label);
      btn.onclick = () => { slider.value = snap.year; updateLabel(); };
      quickPick.appendChild(btn);
    }
    container.appendChild(quickPick);
  }

  _getEraDescription(eraId) {
    const key = 'era_' + eraId;
    const translated = this._t(key);
    // If no translation found, fall back to English hardcoded
    if (translated === key) {
      const descs = {
        prehistoric:  'Pre-writing, small bands and villages. Agriculture just emerging.',
        early_bronze: 'Early cities, writing systems developing. Bronze tools.',
        bronze:       'City-states, early empires, trade networks, bronze weaponry.',
        iron:         'Iron replaces bronze. Larger states, philosophical traditions emerging.',
        classical:    'Philosophy, organized religion, early democracy. Aristotle, Confucius, Ashoka.',
        medieval:     'Feudal structures, religious authority, guilds, plague, Crusades.',
        renaissance:  'Humanism, exploration, printing press, early scientific method.',
        industrial:   'Steam, coal, factories, capitalism. The beginning of mass extraction and warming.',
        modern:       'World wars, decolonization, nuclear age, civil rights movements.',
        contemporary: 'Digital networks, climate crisis, globalization, AI.',
        future:       'Post-scarcity possible. Ecological recovery or collapse. Long-term futures.',
      };
      return descs[eraId] || '';
    }
    return translated;
  }

  _renderSetupRole(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_role_desc'));
    container.appendChild(desc);

    const grid = Utils.createEl('div', 'role-grid');
    for (const [key, role] of Object.entries(PLAYER_ROLES)) {
      const card = Utils.createEl('div', `role-card ${this.setupData.playerRole === key ? 'selected' : ''}`);
      card.innerHTML = `
        <div class="role-icon">${this._getRoleIcon(key)}</div>
        <div class="role-name">${this._t('role_' + key + '_label') || role.label}</div>
        <div class="role-desc">${this._t('role_' + key + '_desc') || role.description}</div>
        <div class="role-stats">
          <span title="Direct Influence">⚡ ${role.directInfluence}%</span>
          <span title="Empathy Suppression Risk">🫀 -${Math.round(role.empathySuppression * 100)}%</span>
        </div>
      `;
      card.onclick = () => {
        this.setupData.playerRole = key;
        Utils.qsa('.role-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      grid.appendChild(card);
    }
    container.appendChild(grid);

    const note = Utils.createEl('p', 'setup-note', this._t('setup_role_note'));
    container.appendChild(note);
  }

  _getRoleIcon(roleId) {
    const icons = { leader: '👑', founder: '🌟', organizer: '🤝', principles: '📜', influencer: '💭', everyday: '🌱' };
    return icons[roleId] || '🧑';
  }

  _renderSetupPreset(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_preset_desc'));
    container.appendChild(desc);

    const nameWrap = Utils.createEl('div', 'form-group');
    nameWrap.innerHTML = `<label>${this._t('setup_civ_name_label')}</label>`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text'; nameInput.className = 'text-input'; nameInput.value = this.setupData.civName;
    nameInput.oninput = () => { this.setupData.civName = nameInput.value; };
    nameWrap.appendChild(nameInput);
    container.appendChild(nameWrap);

    // Color picker
    const colorWrap = Utils.createEl('div', 'form-group');
    colorWrap.innerHTML = `<label>${this._t('setup_civ_color_label')}</label>`;
    const colorPicker = Utils.createEl('div', 'color-picker');
    for (const col of CIV_COLORS) {
      const swatch = Utils.createEl('div', `color-swatch ${this.setupData.civColor === col ? 'selected' : ''}`);
      swatch.style.background = col;
      swatch.onclick = () => {
        this.setupData.civColor = col;
        Utils.qsa('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      };
      colorPicker.appendChild(swatch);
    }
    colorWrap.appendChild(colorPicker);
    container.appendChild(colorWrap);

    const presetTitle = Utils.createEl('div', 'section-title', this._t('setup_preset_title'));
    container.appendChild(presetTitle);
    const presetNote = Utils.createEl('p', 'setup-note', this._t('setup_preset_note'));
    container.appendChild(presetNote);

    const presetGrid = Utils.createEl('div', 'preset-grid');
    for (const [key, preset] of Object.entries(CIVILIZATION_PRESETS)) {
      const card = Utils.createEl('div', 'preset-card');
      card.innerHTML = `
        <div class="preset-name">${preset.name}</div>
        <div class="preset-desc">${preset.description}</div>
        <div class="preset-tags">
          <span class="tag">${ECONOMIC_MODELS[preset.economic.model]?.label || preset.economic.model}</span>
          <span class="tag">${GOVERNANCE_MODELS[preset.governance.model]?.label || preset.governance.model}</span>
          <span class="tag">${preset.religion.presence}</span>
        </div>
      `;
      card.onclick = () => {
        this.setupData.economic = { ...preset.economic };
        this.setupData.governance = { ...preset.governance };
        this.setupData.operatingPrinciples = { ...preset.operatingPrinciples };
        this.setupData.religion = { ...preset.religion };
        this.showNotification(`Preset "${preset.name}" loaded. Continue to customize below.`);
        Utils.qsa('.preset-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      presetGrid.appendChild(card);
    }
    container.appendChild(presetGrid);

    // ── Advanced: Save / Load Config ──────────────────────────
    const advancedToggle = Utils.createEl('button', 'btn btn-secondary btn-sm advanced-toggle', this._t('setup_save_load_toggle'));
    const advancedBody = Utils.createEl('div', 'advanced-body');
    advancedBody.style.display = 'none';

    advancedToggle.onclick = () => {
      const open = advancedBody.style.display !== 'none';
      advancedBody.style.display = open ? 'none' : 'block';
      advancedToggle.textContent = open ? this._t('setup_save_load_toggle') : this._t('setup_save_load_toggle_open');
    };

    advancedBody.innerHTML = `
      <p class="advanced-desc">
        A <strong>configuration code</strong> is a compact text string that captures your entire civilization setup —
        economic model, governance, operating principles, and religion — so you can save it, share it,
        or reload it later. Think of it like a save code for your civilization's design.
      </p>
      <div class="advanced-row">
        <button class="btn btn-secondary btn-sm" id="btn-export-config">${this._t('setup_export_btn')}</button>
        <span class="advanced-hint" id="export-hint"></span>
      </div>
      <div class="advanced-row" style="margin-top:10px">
        <label style="display:block; margin-bottom:6px; color:var(--text-dim); font-size:0.82rem;">${this._t('setup_load_placeholder')}</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="import-code" placeholder="${this._t('setup_load_placeholder')}" style="flex:1" />
          <button class="btn btn-primary btn-sm" id="btn-import-config">${this._t('setup_load_btn')}</button>
        </div>
      </div>
    `;

    container.appendChild(advancedToggle);
    container.appendChild(advancedBody);

    // Wire up export
    setTimeout(() => {
      const exportBtn = Utils.el('btn-export-config');
      if (exportBtn) exportBtn.onclick = () => {
        const code = Utils.encodeConfig({
          name: this.setupData.civName,
          color: this.setupData.civColor,
          economic: this.setupData.economic,
          governance: this.setupData.governance,
          operatingPrinciples: this.setupData.operatingPrinciples,
          religion: this.setupData.religion,
        });
        if (code) {
          navigator.clipboard?.writeText(code).then(() => {
            const hint = Utils.el('export-hint');
            if (hint) { hint.textContent = '✓ Copied to clipboard'; setTimeout(() => { hint.textContent = ''; }, 3000); }
          }).catch(() => {
            const hint = Utils.el('export-hint');
            if (hint) hint.textContent = code.slice(0, 40) + '…';
          });
        }
      };

      const importBtn = Utils.el('btn-import-config');
      if (importBtn) importBtn.onclick = () => {
        const code = Utils.el('import-code')?.value?.trim();
        if (code) {
          const config = Utils.decodeConfig(code);
          if (config) {
            if (config.name) this.setupData.civName = config.name;
            if (config.color) this.setupData.civColor = config.color;
            if (config.economic) this.setupData.economic = config.economic;
            if (config.governance) this.setupData.governance = config.governance;
            if (config.operatingPrinciples) this.setupData.operatingPrinciples = config.operatingPrinciples;
            if (config.religion) this.setupData.religion = config.religion;
            this.showNotification('✓ Configuration loaded! Continuing with these settings.');
            advancedBody.style.display = 'none';
            advancedToggle.textContent = '▸ Save / Load Configuration Code';
          } else {
            this.showNotification('⚠ Could not read that code — it may be invalid or from an older version.');
          }
        }
      };
    }, 50);
  }

  _renderSetupEconomics(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_economics_desc'));
    container.appendChild(desc);

    for (const [key, model] of Object.entries(ECONOMIC_MODELS)) {
      const card = Utils.createEl('div', `model-card ${this.setupData.economic.model === key ? 'selected' : ''}`);
      const effects = Object.entries(model.behaviorModifiers || {})
        .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
        .join(' · ');
      card.innerHTML = `
        <div class="model-name">${this._t('econ_' + key + '_label') || model.label}</div>
        <div class="model-desc">${this._t('econ_' + key + '_desc') || model.description}</div>
        <div class="model-effects">${effects}</div>
      `;
      card.onclick = () => {
        this.setupData.economic = { ...this.setupData.economic, model: key };
        this.setupData.society          = {};
        this.setupData.societyFamily    = {};
        this.setupData.societyCulture   = {};
        this.setupData.societyHealth    = {};
        this.setupData.societyResources = {};
        this.setupData.societyInfo      = {};
        Utils.qsa('.model-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      container.appendChild(card);
    }

    // Additional sliders
    this._addSlider(container, this._t('setup_scarcity_label'), 0, 100,
      this.setupData.economic.scarcityOrientation || 30,
      'scarcity-slider', this._t('setup_scarcity_hint'),
      v => { this.setupData.economic.scarcityOrientation = v; });

    const accumWrap = Utils.createEl('div', 'form-group checkbox-wrap');
    accumWrap.innerHTML = `
      <label><input type="checkbox" id="accum-check" ${this.setupData.economic.accumulationAllowed ? 'checked' : ''} />
      ${this._t('setup_accumulation_label')}</label>
    `;
    const accumCheck = accumWrap.querySelector('#accum-check');
    if (accumCheck) accumCheck.onchange = () => { this.setupData.economic.accumulationAllowed = accumCheck.checked; };
    container.appendChild(accumWrap);
  }

  _renderSetupGovernance(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_governance_desc'));
    container.appendChild(desc);

    for (const [key, model] of Object.entries(GOVERNANCE_MODELS)) {
      const card = Utils.createEl('div', `model-card ${this.setupData.governance.model === key ? 'selected' : ''}`);
      const effects = Object.entries(model.behaviorModifiers || {})
        .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
        .join(' · ');
      card.innerHTML = `
        <div class="model-name">${this._t('gov_' + key + '_label') || model.label}</div>
        <div class="model-desc">${this._t('gov_' + key + '_desc') || model.description}</div>
        <div class="model-effects">${effects}</div>
        <div class="model-hierarchy">Hierarchy Level: ${model.hierarchyLevel}/100</div>
      `;
      card.onclick = () => {
        this.setupData.governance = {
          ...this.setupData.governance, model: key,
          hierarchyLevel: model.hierarchyLevel,
          powerConcentration: model.powerConcentration,
        };
        this.setupData.society          = {};
        this.setupData.societyFamily    = {};
        this.setupData.societyCulture   = {};
        this.setupData.societyHealth    = {};
        this.setupData.societyResources = {};
        this.setupData.societyInfo      = {};
        Utils.qsa('.model-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };
      container.appendChild(card);
    }

    this._addSlider(container, this._t('setup_hierarchy_label'), 0, 100,
      this.setupData.governance.hierarchyLevel,
      'hierarchy-slider', this._t('setup_hierarchy_hint'),
      v => { this.setupData.governance.hierarchyLevel = v; });

    const note = Utils.createEl('p', 'setup-note', this._t('setup_governance_note'));
    container.appendChild(note);
  }

  _renderSetupPrinciples(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_principles_desc'));
    container.appendChild(desc);

    this._addSlider(container, this._t('setup_freedom_label'), 0, 100,
      this.setupData.operatingPrinciples.freedomLevel,
      'freedom-slider', this._t('setup_freedom_hint'),
      v => { this.setupData.operatingPrinciples.freedomLevel = v; });

    this._addSlider(container, this._t('setup_collectivism_label'), 0, 100,
      this.setupData.operatingPrinciples.collectivismLevel,
      'collectivism-slider', this._t('setup_collectivism_hint'),
      v => { this.setupData.operatingPrinciples.collectivismLevel = v; });

    this._addSlider(container, this._t('setup_participation_label'), 0, 100,
      this.setupData.operatingPrinciples.participationVoluntary,
      'participation-slider', this._t('setup_participation_hint'),
      v => { this.setupData.operatingPrinciples.participationVoluntary = v; });

    this._addSlider(container, this._t('setup_innovation_label'), 0, 100,
      this.setupData.operatingPrinciples.innovationTolerance || 50,
      'innovation-slider', this._t('setup_innovation_hint'),
      v => { this.setupData.operatingPrinciples.innovationTolerance = v; });

    // Outsider relationship
    const outsiderWrap = Utils.createEl('div', 'form-group');
    outsiderWrap.innerHTML = `<label>${this._t('setup_outsider_label')}</label>`;
    const sel = document.createElement('select');
    sel.className = 'select-input';
    [
      ['isolationist', this._t('setup_outsider_isolationist')],
      ['trading',      this._t('setup_outsider_trading')],
      ['welcoming',    this._t('setup_outsider_welcoming')],
      ['expansionist', this._t('setup_outsider_expansionist')],
      ['assimilating', this._t('setup_outsider_assimilating')],
    ].forEach(([v, l]) => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = l;
      if (v === this.setupData.operatingPrinciples.outsiderRelationship) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = () => { this.setupData.operatingPrinciples.outsiderRelationship = sel.value; };
    outsiderWrap.appendChild(sel);
    container.appendChild(outsiderWrap);

    // Constitution
    const constWrap = Utils.createEl('div', 'form-group');
    constWrap.innerHTML = `<label>${this._t('setup_constitution_label')}</label>`;
    const textarea = document.createElement('textarea');
    textarea.className = 'constitution-input';
    textarea.placeholder = this._t('setup_constitution_placeholder');
    textarea.value = this.setupData.operatingPrinciples.constitutionText || '';
    textarea.rows = 6;
    textarea.oninput = () => { this.setupData.operatingPrinciples.constitutionText = textarea.value; };
    constWrap.appendChild(textarea);
    container.appendChild(constWrap);

    const note = Utils.createEl('p', 'setup-note', this._t('setup_principles_note'));
    container.appendChild(note);
  }

  _renderSetupReligion(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_religion_desc'));
    container.appendChild(desc);

    // Presence selector
    const presWrap = Utils.createEl('div', 'form-group');
    presWrap.innerHTML = `<label>${this._t('setup_religion_presence_label')}</label>`;
    const presSel = document.createElement('select');
    presSel.className = 'select-input';
    for (const [k, v] of Object.entries(RELIGION_PRESENCE)) {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = v.label;
      if (k === this.setupData.religion.presence) opt.selected = true;
      presSel.appendChild(opt);
    }
    presSel.onchange = () => {
      this.setupData.religion.presence = presSel.value;
      this._updateReligionFields(container);
    };
    presWrap.appendChild(presSel);
    container.appendChild(presWrap);

    // State relationship
    const relWrap = Utils.createEl('div', 'form-group');
    relWrap.innerHTML = `<label>${this._t('setup_religion_state_label')}</label>`;
    const relSel = document.createElement('select');
    relSel.className = 'select-input';
    [
      ['separate',    this._t('setup_religion_separate')],
      ['influential', this._t('setup_religion_influential')],
      ['intertwined', this._t('setup_religion_intertwined')],
      ['dominant',    this._t('setup_religion_dominant')],
    ].forEach(([v, l]) => {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = l;
      if (v === this.setupData.religion.stateRelationship) opt.selected = true;
      relSel.appendChild(opt);
    });
    relSel.onchange = () => { this.setupData.religion.stateRelationship = relSel.value; };
    relWrap.appendChild(relSel);
    container.appendChild(relWrap);

    // Custom religion definition
    const customRelSection = Utils.createEl('div', 'custom-religion-section');
    customRelSection.innerHTML = `<div class="section-title">${this._t('setup_religion_custom_title')}</div>`;
    const relNameInput = document.createElement('input');
    relNameInput.type = 'text'; relNameInput.className = 'text-input';
    relNameInput.placeholder = this._t('setup_religion_name_placeholder');
    customRelSection.appendChild(relNameInput);

    const propWrap = Utils.createEl('div', 'form-group');
    propWrap.innerHTML = `<label>${this._t('setup_religion_prop_label')}</label>`;
    const propSel = document.createElement('select');
    propSel.className = 'select-input';
    for (const [k, v] of Object.entries(RELIGION_PROPAGATION)) {
      const opt = document.createElement('option'); opt.value = k; opt.textContent = `${v.label} — ${v.description}`;
      propSel.appendChild(opt);
    }
    propWrap.appendChild(propSel);
    customRelSection.appendChild(propWrap);

    const tolWrap = Utils.createEl('div', 'form-group');
    tolWrap.innerHTML = `<label>${this._t('setup_religion_tol_label')}</label>`;
    const tolSel = document.createElement('select');
    tolSel.className = 'select-input';
    for (const [k, v] of Object.entries(RELIGION_TOLERANCE)) {
      const opt = document.createElement('option'); opt.value = k; opt.textContent = `${v.label} — ${v.description}`;
      tolSel.appendChild(opt);
    }
    tolWrap.appendChild(tolSel);
    customRelSection.appendChild(tolWrap);

    const addRelBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', this._t('setup_religion_add_btn'));
    addRelBtn.onclick = () => {
      if (relNameInput.value) {
        this.setupData.religion.religions = this.setupData.religion.religions || [];
        this.setupData.religion.religions.push({
          name: relNameInput.value,
          propagationStyle: propSel.value,
          toleranceLevel: tolSel.value,
        });
        this.showNotification(`Religion "${relNameInput.value}" added.`);
        relNameInput.value = '';
      }
    };
    customRelSection.appendChild(addRelBtn);
    container.appendChild(customRelSection);
  }

  _updateReligionFields(container) {
    // Could re-render specific sections; for now simplified
  }

  _renderSetupWorld(container) {
    const desc = Utils.createEl('p', 'setup-desc', this._t('setup_world_desc'));
    container.appendChild(desc);

    this._addSlider(container, this._t('setup_ai_civs_label'), 0, 6,
      this.setupData.aiCivCount,
      'ai-civ-slider', this._t('setup_ai_civs_hint'),
      v => { this.setupData.aiCivCount = v; });
  }

  _addSlider(container, label, min, max, value, id, hint, onChange) {
    const wrap = Utils.createEl('div', 'form-group slider-wrap');
    const lbl = Utils.createEl('label', '', `${label}: `);
    const valSpan = Utils.createEl('span', 'slider-value', String(value));
    lbl.appendChild(valSpan);
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = min; slider.max = max; slider.value = value; slider.id = id;
    slider.oninput = () => { valSpan.textContent = slider.value; onChange(parseInt(slider.value)); };
    const hintEl = Utils.createEl('div', 'slider-hint', hint);
    wrap.appendChild(lbl);
    wrap.appendChild(slider);
    wrap.appendChild(hintEl);
    container.appendChild(wrap);
  }

  // ── Setup Step: Geography & Climate ───────────────────────────
  _renderSetupGeography(container) {
    const data = this.setupData;

    const desc = Utils.createEl('p', 'setup-desc', 'Define the world\'s climate and your civilization\'s geographic setting. These affect map generation, resource availability, and per-turn stat modifiers.');
    container.appendChild(desc);

    // ── World Climate Bias ────────────────────────────────────
    const climSection = Utils.createEl('div', 'setup-section');
    climSection.innerHTML = '<h3>🌡️ World Climate</h3><p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:12px">Shifts the entire map\'s terrain generation. Default is a balanced Earth-like world.</p>';
    container.appendChild(climSection);

    this._addSlider(climSection, 'Warmth', -2, 2, data.worldClimate?.warmth ?? 0, 'clim-warmth',
      'Cold-dominant (−2) ↔ Temperate (0) ↔ Tropical (+2)',
      v => { if (!data.worldClimate) data.worldClimate = {}; data.worldClimate.warmth = v; });
    this._addSlider(climSection, 'Moisture', -2, 2, data.worldClimate?.moisture ?? 0, 'clim-moisture',
      'Arid/Desert (−2) ↔ Balanced (0) ↔ Humid/Jungle (+2)',
      v => { if (!data.worldClimate) data.worldClimate = {}; data.worldClimate.moisture = v; });

    // ── Civilization Placement ────────────────────────────────
    const geoSection = Utils.createEl('div', 'setup-section');
    geoSection.innerHTML = '<h3>🗺️ Your Civilization\'s Geography</h3>';
    container.appendChild(geoSection);

    // Island vs Continent
    const placeWrap = Utils.createEl('div', 'setup-option-row');
    placeWrap.innerHTML = '<label style="font-weight:700;margin-bottom:8px;display:block">Placement:</label>';
    for (const [id, label, hint] of [['continent','Continent','Larger landmass; default; full expansion potential'],['island','Island','Surrounded by water; limits expansion; trade advantages; no piracy risk']]) {
      const btn = Utils.createEl('button', `btn btn-secondary setup-place-btn${(data.geography?.placement ?? 'continent') === id ? ' active' : ''}`, label);
      btn.title = hint;
      btn.onclick = () => {
        if (!data.geography) data.geography = {};
        data.geography.placement = id;
        data.geography.oceanAccess = id === 'island' ? 'island' : true;
        document.querySelectorAll('.setup-place-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
      placeWrap.appendChild(btn);
    }
    // Landlocked option
    const llBtn = Utils.createEl('button', `btn btn-secondary setup-place-btn${data.geography?.oceanAccess === false ? ' active' : ''}`, 'Landlocked');
    llBtn.title = 'No ocean access; limits trade; no piracy; more defensible';
    llBtn.onclick = () => {
      if (!data.geography) data.geography = {};
      data.geography.placement = 'continent';
      data.geography.oceanAccess = false;
      document.querySelectorAll('.setup-place-btn').forEach(b => b.classList.remove('active'));
      llBtn.classList.add('active');
    };
    placeWrap.appendChild(llBtn);
    geoSection.appendChild(placeWrap);

    // Terrain mix checkboxes
    const terrainWrap = Utils.createEl('div', 'setup-section');
    terrainWrap.innerHTML = '<label style="font-weight:700;margin:12px 0 8px;display:block">Terrain Mix (select all that apply):</label>';
    for (const tag of GEOGRAPHY_TERRAIN_TAGS) {
      const checked = (data.geography?.terrainMix || []).includes(tag.id);
      const row = Utils.createEl('label', 'setup-checkbox-row');
      row.innerHTML = `<input type="checkbox" value="${tag.id}" ${checked ? 'checked' : ''}> ${tag.icon} <strong>${tag.label}</strong> <span style="color:var(--text-dim);font-size:0.8rem">— ${tag.statNote}</span>`;
      row.querySelector('input').onchange = (e) => {
        if (!data.geography) data.geography = {};
        if (!data.geography.terrainMix) data.geography.terrainMix = [];
        if (e.target.checked) { if (!data.geography.terrainMix.includes(tag.id)) data.geography.terrainMix.push(tag.id); }
        else data.geography.terrainMix = data.geography.terrainMix.filter(t => t !== tag.id);
      };
      terrainWrap.appendChild(row);
    }
    geoSection.appendChild(terrainWrap);

    // Climate zone
    const climZoneWrap = Utils.createEl('div', 'setup-section');
    climZoneWrap.innerHTML = '<label style="font-weight:700;margin:12px 0 8px;display:block">Climate Zone:</label>';
    const climSel = document.createElement('select');
    climSel.style.cssText = 'width:100%;margin-bottom:4px';
    for (const zone of CLIMATE_ZONES) {
      const opt = document.createElement('option');
      opt.value = zone.id;
      opt.textContent = `${zone.icon} ${zone.label} — ${zone.statNote}`;
      if ((data.geography?.climateZone ?? 'temperate') === zone.id) opt.selected = true;
      climSel.appendChild(opt);
    }
    climSel.onchange = () => {
      if (!data.geography) data.geography = {};
      data.geography.climateZone = climSel.value;
    };
    climZoneWrap.appendChild(climSel);
    geoSection.appendChild(climZoneWrap);
  }

  // ── Setup Step: Scenario Options ───────────────────────────────
  _renderSetupSociety(container) {
    const data = this.setupData;
    if (!data.society) data.society = {};
    const soc = data.society;

    // Derive smart defaults from prior choices (mirrors _computeSocietyInitials in civilization.js)
    const econModel = data.economic?.model ?? 'gift';
    const govForEd  = data.governance?.model ?? 'flat_consensus';
    if (!soc.educationAccess) {
      if (econModel === 'gift' || econModel === 'commons' || econModel === 'labor_credit')
        soc.educationAccess = 'universal';
      else if (govForEd === 'autocratic' || govForEd === 'theocratic')
        soc.educationAccess = 'limited';
      else if (govForEd === 'oligarchy' || govForEd === 'shadow_government_complicit' || govForEd === 'shadow_government_covert')
        soc.educationAccess = 'free_basic_expensive_higher';
      else if (econModel === 'market')
        soc.educationAccess = 'universal_lower';
      else
        soc.educationAccess = 'free_basic_expensive_higher';
    }
    if (soc.educationQuality == null) {
      const eqGovTable = {
        direct_congress: 65, flat_consensus: 65, rotating: 60,
        representative: 55, none: 35, elder_council: 40,
        oligarchy: 45, tribal_chief: 30, theocratic: 30, autocratic: 35,
        shadow_government_complicit: 40, shadow_government_covert: 40,
      };
      soc.educationQuality = eqGovTable[govForEd] ?? 50;
    }
    if (soc.genderEquity     == null) {
      const govModel = data.governance?.model ?? 'flat_consensus';
      const govTable = {
        direct_congress: 75, flat_consensus: 70, rotating: 65,
        representative: 55, none: 55, elder_council: 35,
        oligarchy: 35, tribal_chief: 30, theocratic: 20, autocratic: 25,
        shadow_government_complicit: 38, shadow_government_covert: 35,
      };
      soc.genderEquity = govTable[govModel] ?? 50;
    }
    if (!soc.debtModel) {
      soc.debtModel = (econModel === 'gift' || econModel === 'commons' || econModel === 'barter' || econModel === 'none') ? 'debtless'
        : econModel === 'market' ? 'market_debt'
        : 'regulated_credit';
    }
    if (soc.tariffLevel == null) soc.tariffLevel = 30;

    const desc = Utils.createEl('p', 'setup-desc',
      'These values are derived from your earlier choices but can be overridden here. '
      + 'They determine the starting state of your education system, gender equity, and financial structures.');
    container.appendChild(desc);

    // ── Education Access ──────────────────────────────────────────
    const eaWrap = Utils.createEl('div', 'form-group');
    eaWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">📚 Education Access Tier</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">Which populations can access education at each level?</p>';
    const eaSel = document.createElement('select');
    eaSel.style.cssText = 'width:100%;margin-bottom:4px';
    EDUCATION_ACCESS_TIERS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.icon} ${t.label}`;
      if (t.id === soc.educationAccess) opt.selected = true;
      eaSel.appendChild(opt);
    });
    eaSel.onchange = () => { soc.educationAccess = eaSel.value; };
    eaWrap.appendChild(eaSel);
    container.appendChild(eaWrap);

    // ── Education Quality ─────────────────────────────────────────
    const eqWrap = Utils.createEl('div', 'form-group');
    eqWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">📖 Education Quality (0–100)</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">Absolute quality of educational institutions, independent of access tier.</p>';
    const eqSlider = document.createElement('input');
    eqSlider.type = 'range'; eqSlider.min = '0'; eqSlider.max = '100';
    eqSlider.value = String(soc.educationQuality ?? 50);
    eqSlider.style.width = '100%';
    const eqVal = Utils.createEl('span', '', ` ${soc.educationQuality ?? 50}`);
    eqSlider.oninput = () => { soc.educationQuality = Number(eqSlider.value); eqVal.textContent = ` ${eqSlider.value}`; };
    eqWrap.appendChild(eqSlider);
    eqWrap.appendChild(eqVal);
    container.appendChild(eqWrap);

    // ── Gender Equity ─────────────────────────────────────────────
    const geWrap = Utils.createEl('div', 'form-group');
    geWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">⚖️ Gender Equity Index (0–100)</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">Degree of gender equality in legal rights, opportunity, and social norms.</p>';
    const geSlider = document.createElement('input');
    geSlider.type = 'range'; geSlider.min = '0'; geSlider.max = '100';
    geSlider.value = String(soc.genderEquity ?? 50);
    geSlider.style.width = '100%';
    const geVal = Utils.createEl('span', '', ` ${soc.genderEquity ?? 50}`);
    geSlider.oninput = () => { soc.genderEquity = Number(geSlider.value); geVal.textContent = ` ${geSlider.value}`; };
    geWrap.appendChild(geSlider);
    geWrap.appendChild(geVal);
    container.appendChild(geWrap);

    // ── Debt Model ────────────────────────────────────────────────
    const dmWrap = Utils.createEl('div', 'form-group');
    dmWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">💰 Debt System</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">How does your civilization handle credit, debt, and obligations?</p>';
    const dmSel = document.createElement('select');
    dmSel.style.cssText = 'width:100%;margin-bottom:4px';
    DEBT_MODEL_TYPES.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.icon} ${m.label}`;
      if (m.id === soc.debtModel) opt.selected = true;
      dmSel.appendChild(opt);
    });
    dmSel.onchange = () => { soc.debtModel = dmSel.value; };
    dmWrap.appendChild(dmSel);
    container.appendChild(dmWrap);

    // ── Tariff Level ──────────────────────────────────────────────
    const tarWrap = Utils.createEl('div', 'form-group');
    tarWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">🛃 Starting Tariff Level (0–100)</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">0 = free trade, 100 = full protectionism. High tariffs protect jobs but risk retaliation and reduced innovation.</p>';
    const tarSlider = document.createElement('input');
    tarSlider.type = 'range'; tarSlider.min = '0'; tarSlider.max = '100';
    tarSlider.value = String(soc.tariffLevel ?? 30);
    tarSlider.style.width = '100%';
    const tarVal = Utils.createEl('span', '', ` ${soc.tariffLevel ?? 30}`);
    tarSlider.oninput = () => { soc.tariffLevel = Number(tarSlider.value); tarVal.textContent = ` ${tarSlider.value}`; };
    tarWrap.appendChild(tarSlider);
    tarWrap.appendChild(tarVal);
    container.appendChild(tarWrap);
  }

  _renderSetupFamilyCulture(container) {
    const data = this.setupData;
    if (!data.societyFamily)  data.societyFamily  = {};
    if (!data.societyCulture) data.societyCulture = {};
    const sf = data.societyFamily;
    const sc = data.societyCulture;

    // Derive smart defaults from prior wizard choices
    const gov  = data.governance?.model  ?? 'flat_consensus';
    const econ = data.economic?.model    ?? 'gift';
    const rel  = data.religion?.stateRelationship ?? 'separate';
    const isFreeGov = econ === 'gift' || econ === 'commons' || econ === 'labor_credit' ||
                      gov === 'direct_congress' || gov === 'flat_consensus' || gov === 'rotating';

    if (!sf.familyStructure)
      sf.familyStructure = (econ === 'commons' || econ === 'labor_credit') ? 'community_clan'
                         : (econ === 'gift' || econ === 'barter') ? 'extended' : 'nuclear';
    if (!sf.reproductiveHealthTier)
      sf.reproductiveHealthTier = (gov === 'theocratic' && (rel === 'state_religion' || rel === 'state'))
        ? 'forbidden' : (rel === 'state_religion' || rel === 'state') ? 'restricted'
        : (gov === 'tribal_chief' || gov === 'elder_council') ? 'restricted'
        : (gov === 'autocratic') ? 'restricted'
        : (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'restricted'
        : isFreeGov ? 'scandinavian' : 'available';
    if (!sf.womensRightsTier)
      sf.womensRightsTier = gov === 'theocratic' ? 'forbidden'
        : (gov === 'tribal_chief' || gov === 'elder_council') ? 'minimal'
        : (gov === 'autocratic' || gov === 'oligarchy') ? 'minimal'
        : (gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'minimal'
        : isFreeGov ? 'full_parity' : 'mostly_full';
    if (!sf.familySizePolicy) sf.familySizePolicy = (gov === 'theocratic' || gov === 'tribal_chief') ? 'large_encouraged' : 'neutral';

    if (sc.scienceSupport == null)
      sc.scienceSupport = gov === 'theocratic' ? 20
        : (gov === 'autocratic') ? 35
        : (gov === 'oligarchy') ? 50
        : econ === 'market' ? 65 : isFreeGov ? 75 : 50;
    if (sc.scienceFreedom == null) {
      if (gov === 'theocratic' || rel === 'state_religion' || rel === 'state') {
        sc.scienceFreedom = 20; sc.scienceFreedomConstraint = 'religion';
      } else if (gov === 'autocratic') {
        sc.scienceFreedom = 30; sc.scienceFreedomConstraint = 'government';
      } else if (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') {
        sc.scienceFreedom = 40; sc.scienceFreedomConstraint = 'capital';
      } else if (econ === 'market') {
        sc.scienceFreedom = 55; sc.scienceFreedomConstraint = 'capital';
      } else {
        sc.scienceFreedom = isFreeGov ? 85 : 55; sc.scienceFreedomConstraint = 'none';
      }
    }
    if (sc.artsSupport == null)
      sc.artsSupport = gov === 'theocratic' ? 45
        : (gov === 'autocratic') ? 30
        : (gov === 'oligarchy') ? 35
        : econ === 'market' ? 40 : isFreeGov ? 75 : 50;
    if (sc.artsFreedom == null) {
      if (gov === 'theocratic' || rel === 'state_religion' || rel === 'state') {
        sc.artsFreedom = 25; sc.artsFreedomConstraint = 'religion';
      } else if (gov === 'autocratic') {
        sc.artsFreedom = 30; sc.artsFreedomConstraint = 'government';
      } else if (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') {
        sc.artsFreedom = 45; sc.artsFreedomConstraint = 'capital';
      } else if (econ === 'market') {
        sc.artsFreedom = 65; sc.artsFreedomConstraint = 'capital';
      } else {
        sc.artsFreedom = isFreeGov ? 90 : 60; sc.artsFreedomConstraint = 'none';
      }
    }

    const desc = Utils.createEl('p', 'setup-desc',
      'Science and arts are modeled separately — civilizations can invest in one while restricting the other. '
      + 'Family structures, reproductive health access, and women\'s rights also shape wellbeing, equity, and demographic trajectory. '
      + 'Values shown are derived from your earlier choices but can be overridden.');
    container.appendChild(desc);

    // ── Family Structure ─────────────────────────────────────────
    const fsWrap = Utils.createEl('div', 'form-group');
    fsWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">👨‍👩‍👧 Family Structure</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">The dominant household unit affecting social cohesion, elderly care, and mobility.</p>';
    const fsSel = document.createElement('select');
    fsSel.style.cssText = 'width:100%;margin-bottom:4px';
    FAMILY_STRUCTURES.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id; opt.textContent = `${f.icon} ${f.label}`;
      if (f.id === sf.familyStructure) opt.selected = true;
      fsSel.appendChild(opt);
    });
    fsSel.onchange = () => { sf.familyStructure = fsSel.value; };
    fsWrap.appendChild(fsSel);
    container.appendChild(fsWrap);

    // ── Reproductive Health ──────────────────────────────────────
    const rhWrap = Utils.createEl('div', 'form-group');
    rhWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">🩺 Reproductive Health Access</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">Availability of sex education, contraception, and reproductive healthcare.</p>';
    const rhSel = document.createElement('select');
    rhSel.style.cssText = 'width:100%;margin-bottom:4px';
    REPRODUCTIVE_HEALTH_TIERS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id; opt.textContent = `${t.icon} ${t.label}`;
      if (t.id === sf.reproductiveHealthTier) opt.selected = true;
      rhSel.appendChild(opt);
    });
    rhSel.onchange = () => { sf.reproductiveHealthTier = rhSel.value; };
    rhWrap.appendChild(rhSel);
    container.appendChild(rhWrap);

    // ── Women's Rights ───────────────────────────────────────────
    const wrWrap = Utils.createEl('div', 'form-group');
    wrWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">⚖️ Women\'s Rights Tier</label>'
      + '<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">Legal and social parity shapes GEI trajectory, innovation, and stratum wellbeing.</p>';
    const wrSel = document.createElement('select');
    wrSel.style.cssText = 'width:100%;margin-bottom:4px';
    WOMENS_RIGHTS_TIERS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id; opt.textContent = `${t.icon} ${t.label}`;
      if (t.id === sf.womensRightsTier) opt.selected = true;
      wrSel.appendChild(opt);
    });
    wrSel.onchange = () => { sf.womensRightsTier = wrSel.value; };
    wrWrap.appendChild(wrSel);
    container.appendChild(wrWrap);

    // ── Science & Arts separator ─────────────────────────────────
    const divHdr = Utils.createEl('h3', 'setup-section-hdr', '🔬 Science & 🎭 Arts (separate parameters)');
    divHdr.style.cssText = 'margin:18px 0 4px;font-size:1rem;border-bottom:1px solid var(--border);padding-bottom:4px';
    container.appendChild(divHdr);
    container.appendChild(Utils.createEl('p', 'setup-desc',
      'Each can be configured independently. A civilization may heavily fund applied science while providing only state-approved art — or lavish arts patronage while scientific inquiry is constrained by doctrine.'));

    const _makeSlider = (label, key, obj, min = 0, max = 100, note = '') => {
      const wrap = Utils.createEl('div', 'form-group');
      wrap.innerHTML = `<label style="display:block;margin-bottom:4px;font-weight:700">${label}</label>`
        + (note ? `<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 4px">${note}</p>` : '');
      const sl = document.createElement('input');
      sl.type = 'range'; sl.min = String(min); sl.max = String(max);
      sl.value = String(obj[key] ?? 50); sl.style.width = '85%';
      const valSpan = Utils.createEl('span', '', ` ${obj[key] ?? 50}`);
      sl.oninput = () => { obj[key] = Number(sl.value); valSpan.textContent = ` ${sl.value}`; };
      wrap.appendChild(sl);
      wrap.appendChild(valSpan);
      container.appendChild(wrap);
    };

    _makeSlider('🔬 Science Support (investment & appreciation)', 'scienceSupport', sc, 0, 100,
      'How much does this civilization fund and value scientific research?');
    _makeSlider('🔓 Science Freedom (researcher autonomy)', 'scienceFreedom', sc, 0, 100,
      'How free are researchers to pursue questions without ideological or commercial constraint?');
    _makeSlider('🎭 Arts Support (investment & appreciation)', 'artsSupport', sc, 0, 100,
      'How much does this civilization fund and value arts and culture?');
    _makeSlider('🔓 Arts Freedom (artistic autonomy)', 'artsFreedom', sc, 0, 100,
      'How free are artists to create without state, religious, or commercial constraint?');

    // ── Shared helper for new dropdown sections ────────────────────
    const _makeDropdown = (label, key, obj, options, noteText = '') => {
      const wrap = Utils.createEl('div', 'form-group');
      wrap.innerHTML = `<label style="display:block;margin-bottom:6px;font-weight:700">${label}</label>`
        + (noteText ? `<p style="font-size:0.82rem;color:var(--text-dim);margin:0 0 6px">${noteText}</p>` : '');
      const sel = document.createElement('select');
      sel.style.cssText = 'width:100%;margin-bottom:4px';
      options.forEach(({ value, label: lbl }) => {
        const opt = document.createElement('option');
        opt.value = value; opt.textContent = lbl;
        if (value === obj[key]) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.onchange = () => { obj[key] = sel.value; };
      wrap.appendChild(sel);
      container.appendChild(wrap);
    };

    // ── Healthcare ────────────────────────────────────────────────
    const hcHdr = Utils.createEl('h3', 'setup-section-hdr', '🏥 Healthcare System');
    hcHdr.style.cssText = 'margin:18px 0 4px;font-size:1rem;border-bottom:1px solid var(--border);padding-bottom:4px';
    container.appendChild(hcHdr);
    container.appendChild(Utils.createEl('p', 'setup-desc',
      'Healthcare shapes life outcomes across all strata. Access tier determines who receives care; emphasis shapes the long-term health profile; incentive model determines what providers optimize for.'));

    const sh = data.societyHealth;

    // Derive healthcare defaults from selected economic + governance model
    if (!sh.healthcareAccess)
      sh.healthcareAccess = gov === 'theocratic'                                                    ? 'minimal_traditional'
        : (gov === 'tribal_chief' || gov === 'elder_council')                                       ? 'minimal_traditional'
        : (econ === 'gift' || econ === 'commons' || econ === 'labor_credit')                        ? 'universal_public'
        : econ === 'planned'                                                                         ? 'universal_public'
        : (gov === 'oligarchy' || gov === 'autocratic') && econ === 'market'                       ? 'private_only'
        : econ === 'market'                                                                          ? 'mixed_public_private'
        : 'universal_insurance';
    if (!sh.healthcareEmphasis)
      sh.healthcareEmphasis = (econ === 'gift' || econ === 'commons' || econ === 'labor_credit')    ? 'prevention'
        : econ === 'market'                                                                          ? 'treatment'
        : 'balanced';
    if (!sh.healthcareIncentive)
      sh.healthcareIncentive = (econ === 'gift' || econ === 'commons' || econ === 'labor_credit' || econ === 'planned') ? 'patient_outcomes'
        : (econ === 'market' && (gov === 'oligarchy' || gov === 'autocratic'))                     ? 'profit_first'
        : econ === 'market'                                                                          ? 'mixed'
        : 'patient_outcomes';

    _makeDropdown('🏥 Healthcare Access Tier', 'healthcareAccess', sh, HEALTHCARE_ACCESS_TIERS.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Universal public equalizes outcomes; private-only creates extreme stratum divergence.');
    _makeDropdown('🛡️ Healthcare Emphasis', 'healthcareEmphasis', sh, HEALTHCARE_EMPHASIS_TYPES.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Prevention reduces long-term disease burden; treatment responds to crises faster.');
    _makeDropdown('❤️ Provider Incentive Model', 'healthcareIncentive', sh, HEALTHCARE_INCENTIVE_MODELS.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Patient-outcomes first rewards health results; profit-first rewards revenue volume.');

    // ── Resource Management ─────────────────────────────────────
    const rsHdr = Utils.createEl('h3', 'setup-section-hdr', '⛏️ Resource Management');
    rsHdr.style.cssText = 'margin:18px 0 4px;font-size:1rem;border-bottom:1px solid var(--border);padding-bottom:4px';
    container.appendChild(rsHdr);
    container.appendChild(Utils.createEl('p', 'setup-desc',
      'Resource strategy determines how aggressively natural resources are extracted. The obsolescence model captures whether products are designed to last or to be replaced frequently — which directly accelerates or moderates resource depletion and waste.'));

    const sr = data.societyResources;

    // Derive resource defaults
    if (!sr.resourceStrategy)
      sr.resourceStrategy = (econ === 'gift' || econ === 'commons' || econ === 'labor_credit')      ? 'conservation'
        : econ === 'planned'                                                                         ? 'government_managed'
        : (econ === 'market' && (gov === 'oligarchy' || gov === 'autocratic'))                     ? 'extraction_growth'
        : 'balanced_stewardship';
    if (!sr.obsolescenceModel)
      sr.obsolescenceModel = (econ === 'gift' || econ === 'commons' || econ === 'labor_credit' || econ === 'barter') ? 'durability_first'
        : econ === 'planned'                                                                         ? 'regulated'
        : econ === 'market'                                                                          ? 'market_driven'
        : 'regulated';

    _makeDropdown('🌿 Resource Strategy', 'resourceStrategy', sr, RESOURCE_STRATEGIES.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Conservation extends resource lifespan; extraction-for-growth maximizes short-term output at long-term cost.');
    _makeDropdown('🔄 Product Obsolescence Model', 'obsolescenceModel', sr, OBSOLESCENCE_MODELS.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Market-driven (planned obsolescence) combined with extraction-for-growth significantly accelerates environmental crises.');

    // Synergy warning note
    const synergyNote = Utils.createEl('div', 'setup-synergy-warning');
    synergyNote.style.cssText = 'background:rgba(240,160,32,0.12);border:1px solid rgba(240,160,32,0.4);border-radius:6px;padding:10px 14px;margin:10px 0 6px;font-size:0.88em;line-height:1.5;color:var(--text)';
    synergyNote.innerHTML = '<strong style="color:#f0a020">Synergy warning:</strong> Combining <em>Extraction for Growth</em> with <em>Market-Driven Obsolescence</em> creates a compounding effect — waste generation multiplies by ~2.5x and resource depletion by ~2.0x compared to balanced defaults. This dramatically accelerates environmental crises and pollution accumulation.';
    container.appendChild(synergyNote);

    // ── Information Ecosystem ────────────────────────────────────
    const infoHdr = Utils.createEl('h3', 'setup-section-hdr', '📺 Information Ecosystem');
    infoHdr.style.cssText = 'margin:18px 0 4px;font-size:1rem;border-bottom:1px solid var(--border);padding-bottom:4px';
    container.appendChild(infoHdr);
    container.appendChild(Utils.createEl('p', 'setup-desc',
      'The information ecosystem acts as a per-turn anchor on Epistemic Health — pulling EH toward the tier\'s equilibrium value over time. It also affects innovation, social cohesion, and equality. A free press sustains high EH; state propaganda collapses it.'));

    const si = data.societyInfo;

    // Derive information ecosystem default
    if (!si.informationEcosystem)
      si.informationEcosystem =
          gov === 'theocratic'                                                                       ? 'total_information_control'
        : (gov === 'autocratic' || gov === 'tribal_chief' || gov === 'elder_council')               ? 'state_guided'
        : (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'captured_commercial'
        : (gov === 'direct_congress' || gov === 'flat_consensus' || gov === 'rotating'
           || econ === 'gift' || econ === 'commons' || econ === 'labor_credit')                     ? 'open_civic'
        : 'free_market_media';

    _makeDropdown('📺 Information Ecosystem', 'informationEcosystem', si, INFORMATION_ECOSYSTEM_TYPES.map(t => ({ value: t.id, label: `${t.icon} ${t.label}` })),
      'Total information control drives EH toward 10 over time regardless of education investment.');
  }

  _renderSetupScenario(container) {
    const data = this.setupData;
    const desc = Utils.createEl('p', 'setup-desc', 'Optionally save these starting parameters as a named scenario. You can run the same scenario multiple times with different parameters to compare outcomes.');
    container.appendChild(desc);

    // Scenario name input
    const nameWrap = Utils.createEl('div', 'form-group');
    nameWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">Scenario Name (optional):</label>';
    const nameInput = document.createElement('input');
    nameInput.type = 'text'; nameInput.placeholder = 'e.g. "Autocracy vs Federation"';
    nameInput.value = data.scenarioName || '';
    nameInput.style.cssText = 'width:100%;margin-bottom:8px';
    nameInput.oninput = () => { data.scenarioName = nameInput.value.trim(); };
    nameWrap.appendChild(nameInput);

    if (data._scenarioId) {
      const runLabelWrap = Utils.createEl('div', 'form-group');
      runLabelWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">Label for this run (what you changed):</label>';
      const runLabelInput = document.createElement('input');
      runLabelInput.type = 'text'; runLabelInput.placeholder = 'e.g. "Higher freedom, representative governance"';
      runLabelInput.value = data._scenarioRunLabel || '';
      runLabelInput.style.cssText = 'width:100%;margin-bottom:8px';
      runLabelInput.oninput = () => { data._scenarioRunLabel = runLabelInput.value.trim(); };
      runLabelWrap.appendChild(runLabelInput);
      container.appendChild(runLabelWrap);

      const loadNote = Utils.createEl('div', 'setup-info-box',
        `ℹ️ You are running scenario "${data._scenarioName || 'saved scenario'}" again. The setup wizard has been pre-filled with the original starting parameters. You can change any values — all changes are tracked automatically.`);
      container.appendChild(loadNote);
    }
    container.appendChild(nameWrap);

    // Saved scenarios list
    const scenarios = this.game.loadScenarios();
    if (scenarios.length > 0) {
      const existingSection = Utils.createEl('div', 'setup-section');
      existingSection.innerHTML = '<h3>📋 Existing Saved Scenarios</h3>';
      for (const sc of scenarios) {
        const row = Utils.createEl('div', 'scenario-list-row');
        row.innerHTML = `<strong>#${sc.number} ${sc.name}</strong> <span style="color:var(--text-dim)">(${sc.runs?.length || 0} runs)</span>`;
        const runAgainBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '▶ Run Again');
        runAgainBtn.onclick = () => this.game.loadScenarioForRerun(sc.id);
        row.appendChild(runAgainBtn);
        existingSection.appendChild(row);
      }
      container.appendChild(existingSection);
    }

    // ── Pass 9: Research Settings ──────────────────────────────
    const resSection = Utils.createEl('div', 'setup-section');
    resSection.innerHTML = '<h3>🔬 Research Settings</h3>';
    const seedWrap = Utils.createEl('div', 'form-group');
    seedWrap.innerHTML = '<label style="display:block;margin-bottom:6px;font-weight:700">Run Seed <span style="font-weight:400;color:var(--text-dim)">(optional)</span>:</label>';
    const seedInput = document.createElement('input');
    seedInput.type = 'number'; seedInput.min = 0; seedInput.max = 9999999999;
    seedInput.placeholder = 'auto-generated';
    seedInput.value = data.researchSeed ?? '';
    seedInput.style.cssText = 'width:200px;margin-bottom:4px';
    seedInput.oninput = () => {
      const v = parseInt(seedInput.value);
      data.researchSeed = isNaN(v) ? null : v;
    };
    const seedHint = Utils.createEl('div', 'setup-hint', 'Leave blank to auto-generate. The seed is stored with all Track 2 exports to identify this run in research.');
    seedWrap.appendChild(seedInput);
    seedWrap.appendChild(seedHint);
    resSection.appendChild(seedWrap);
    container.appendChild(resSection);
  }

  // ── HUD (in-game) ─────────────────────────────────────────────
  renderHUD() {
    this._updateHUD();
  }

  _updateHUD() {
    const game = this.game;
    const yearEl = Utils.el('hud-year');
    const eraEl = Utils.el('hud-era');
    const popEl = Utils.el('hud-pop');
    const wellbeingEl = Utils.el('hud-wellbeing');
    const warmingEl = Utils.el('hud-warming');

    if (yearEl) yearEl.textContent = Utils.formatYear(game.currentYear);
    if (eraEl) eraEl.textContent = game.currentEra?.label || '';

    const playerCiv = game.civilizations.find(c => c.isPlayerCiv) || game.civilizations[0];
    if (playerCiv) {
      if (popEl) popEl.textContent = playerCiv.state.population.toLocaleString();
      if (wellbeingEl) {
        wellbeingEl.textContent = Math.round(playerCiv.state.averageWellbeing);
        wellbeingEl.style.color = playerCiv.state.averageWellbeing > 60 ? '#00d4aa' : playerCiv.state.averageWellbeing > 35 ? '#f0a020' : '#ff6b6b';
      }
    }

    const warming = game.simulation?.globalWarmingIndex || 0;
    if (warmingEl) {
      warmingEl.textContent = Math.round(warming);
      warmingEl.style.color = warming < 20 ? '#00d4aa' : warming < 50 ? '#f0a020' : '#ff6b6b';
      warmingEl.style.display = warming > 5 ? '' : 'none';
    }

    this._updateCivPanel();
  }

  _updateCivPanel() {
    const panel = Utils.el('civ-panel');
    if (!panel) return;

    const civs = this.game.civilizations;
    if (civs.length === 0) return;

    const selectedCivId = panel.dataset.selectedCiv || (civs[0] ? civs[0].id : null);
    const civ = civs.find(c => c.id === selectedCivId) || civs[0];
    if (!civ) return;

    const sum = civ.getSummary();

    panel.innerHTML = `
      <div class="civ-panel-header" style="border-left: 4px solid ${civ.color}">
        <div class="civ-name">${civ.name}</div>
        <div class="civ-meta">${sum.governance} · ${sum.economic}</div>
        ${civ.isPlayerCiv ? '<div class="player-badge">YOU</div>' : ''}
      </div>
      <div class="civ-stats">
        <div class="stat-row"><span>${this._t('stat_population')}</span><strong>${sum.population}</strong></div>
        <div class="stat-row"><span>${this._t('stat_wellbeing')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.wellbeing}%; background:${sum.wellbeing>60?'#00d4aa':sum.wellbeing>35?'#f0a020':'#ff6b6b'}"></div></div>
          <strong>${sum.wellbeing}</strong></div>
        <div class="stat-row"><span>${this._t('stat_equality')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.equality}%; background:#6c63ff"></div></div>
          <strong>${sum.equality}</strong></div>
        <div class="stat-row"><span>${this._t('stat_empathy')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.empathy}%; background:#f06090"></div></div>
          <strong>${sum.empathy}</strong></div>
        <div class="stat-row"><span>${this._t('stat_leader_empathy')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.leaderEmpathy}%; background:${sum.leaderEmpathy>50?'#f06090':'#ff6b6b'}"></div></div>
          <strong>${sum.leaderEmpathy}</strong></div>
        <div class="stat-row"><span>${this._t('stat_corruption')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.corruption}%; background:#888"></div></div>
          <strong>${sum.corruption}</strong></div>
        <div class="stat-row"><span>${this._t('stat_wealth_conc')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.wealthConcentration}%; background:#f0a020"></div></div>
          <strong>${sum.wealthConcentration}</strong></div>
      </div>
      ${(sum.pollutionIndex > 0 || sum.forestHealth < 95 || sum.soilHealth < 95 || sum.waterQuality < 95) ? `
      <div class="section-label" style="margin-top:10px">${this._t('stat_env_health')}</div>
      <div class="civ-stats">
        <div class="stat-row"><span>${this._t('stat_forests')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.forestHealth}%; background:${sum.forestHealth>60?'#27ae60':sum.forestHealth>30?'#f0a020':'#e74c3c'}"></div></div>
          <strong>${sum.forestHealth}%</strong></div>
        <div class="stat-row"><span>${this._t('stat_soil')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.soilHealth}%; background:${sum.soilHealth>60?'#8d6e63':sum.soilHealth>30?'#f0a020':'#e74c3c'}"></div></div>
          <strong>${sum.soilHealth}%</strong></div>
        <div class="stat-row"><span>${this._t('stat_water')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.waterQuality}%; background:${sum.waterQuality>60?'#2980b9':sum.waterQuality>30?'#f0a020':'#e74c3c'}"></div></div>
          <strong>${sum.waterQuality}%</strong></div>
        ${sum.pollutionIndex > 5 ? `<div class="stat-row"><span>${this._t('stat_pollution')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.pollutionIndex}%; background:${sum.pollutionIndex<40?'#888':sum.pollutionIndex<70?'#e67e22':'#e74c3c'}"></div></div>
          <strong>${sum.pollutionIndex}</strong></div>` : ''}
        ${sum.wasteAccumulation > 5 ? `<div class="stat-row"><span>${this._t('stat_waste')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.wasteAccumulation}%; background:#546e7a"></div></div>
          <strong>${sum.wasteAccumulation}</strong></div>` : ''}
      </div>` : ''}
      ${sum.occupiedBy ? `
      <div class="section-label" style="margin-top:10px;color:#e74c3c">${this._t('stat_occupation')}</div>
      <div class="civ-stats">
        <div class="stat-row"><span>${this._t('stat_colonized_by')}</span><strong style="color:#e74c3c">${sum.occupiedBy}</strong></div>
        ${sum.colonizationType ? `<div class="stat-row"><span>${this._t('stat_occ_type')}</span><strong>${sum.colonizationType}</strong></div>` : ''}
        <div class="stat-row"><span>${this._t('stat_independence')}</span>
          <div class="stat-bar-wrap"><div class="stat-bar" style="width:${sum.independenceMovement}%; background:${sum.independenceMovement>75?'#27ae60':sum.independenceMovement>40?'#f0a020':'#2980b9'}"></div></div>
          <strong>${sum.independenceMovement}%</strong></div>
      </div>` : ''}
      ${(() => {
        const acs = civ.state.alienContactState;
        if (!acs || acs.stage === 'none') return '';
        const stageLabels = {
          signal: 'Signal Detected', confirmed: 'Confirmed',
          ongoing: 'Ongoing', ended_hostile: 'Contact Ended',
        };
        const stageLabel = stageLabels[acs.stage] || acs.stage;
        const stageColor = acs.stage === 'ended_hostile' ? '#e74c3c' : '#00d4aa';
        const protocolLabels = {
          alien_response_open: 'Open Contact', alien_response_study: 'Scientific Study',
          alien_response_quarantine: 'Quarantine', alien_response_military: 'Military Posture',
          alien_response_diplomatic: 'Diplomatic Outreach',
        };
        const protocolLabel = acs.protocol ? (protocolLabels[acs.protocol] || acs.protocol) : null;
        const rel = acs.relationshipScore;
        const relLabel = rel >= 75 ? 'Warm' : rel >= 55 ? 'Cautious' : rel >= 35 ? 'Strained' : 'Hostile';
        const relColor = rel >= 75 ? '#00d4aa' : rel >= 55 ? '#f0a020' : rel >= 35 ? '#e67e22' : '#e74c3c';
        const commIcon = acs.lastCommResult === 'success' ? '✅' : acs.lastCommResult === 'failure' ? '❌' : '—';
        const btCount  = acs.breakthroughCount || 0;
        const bdCount  = acs.breakdownCount    || 0;
        return `
        <div class="section-label" style="margin-top:10px;color:${stageColor}">${this._t('section_alien_contact')}</div>
        <div class="civ-stats">
          <div class="stat-row"><span>Stage</span><strong style="color:${stageColor}">${stageLabel}</strong></div>
          ${protocolLabel ? `<div class="stat-row"><span>Protocol</span><strong>${protocolLabel}</strong></div>` : ''}
          ${acs.stage === 'ongoing' ? `
          <div class="stat-row"><span>Relationship</span>
            <div class="stat-bar-wrap"><div class="stat-bar" style="width:${rel}%; background:${relColor}"></div></div>
            <strong style="color:${relColor}">${relLabel} (${rel})</strong></div>
          <div class="stat-row"><span>Turns in contact</span><strong>${acs.turnsInContact}</strong></div>
          <div class="stat-row"><span>Last comm attempt</span><strong>${commIcon}</strong></div>
          ${btCount > 0 ? `<div class="stat-row"><span>Breakthroughs</span><strong style="color:#00d4aa">✨ ${btCount}</strong></div>` : ''}
          ${bdCount > 0 ? `<div class="stat-row"><span>Breakdowns</span><strong style="color:#e74c3c">⚠️ ${bdCount}</strong></div>` : ''}` : ''}
          ${acs.stage === 'ended_hostile' ? `
          <div class="stat-row"><span>Duration</span><strong>${acs.turnsInContact} turns</strong></div>
          <div class="stat-row" style="color:#e74c3c"><span>Status</span><strong style="color:#e74c3c">Hostile withdrawal</strong></div>` : ''}
        </div>`;
      })()}
      ${(civ.state.constructionProjects && civ.state.constructionProjects.length > 0) ? `
      <div class="section-label" style="margin-top:10px;color:#f0a020">${this._t('section_under_construction')}</div>
      <div class="civ-stats">
        ${civ.state.constructionProjects.map(p => `
        <div class="stat-row">
          <span>${p.icon || '🏗️'} ${p.label}</span>
          <strong style="color:#f0a020">${p.turnsRemaining} ${this._t('construction_turns_left')}</strong>
        </div>`).join('')}
      </div>` : ''}
      <div class="dominant-behaviors">
        <div class="section-label">${this._t('section_dominant_behaviors')}</div>
        ${sum.dominantBehaviors.map(b => `<span class="behavior-tag" style="background:${BEHAVIORS[b]?.color || '#666'}">${b}</span>`).join('')}
      </div>
      ${sum.technologies.length > 0 ? `
        <div class="civ-techs">
          <div class="section-label">${this._t('section_technologies')}</div>
          ${sum.technologies.slice(-5).map(t => `<span class="tech-tag">⚙️ ${t}</span>`).join('')}
        </div>` : ''}
      ${sum.movements.length > 0 ? `
        <div class="civ-movements">
          <div class="section-label">${this._t('section_active_movements')}</div>
          ${sum.movements.map(m => `<span class="movement-tag">💡 ${m}</span>`).join('')}
        </div>` : ''}
    `;

    // Civ selector tabs
    if (civs.length > 1) {
      const tabs = Utils.createEl('div', 'civ-tabs');
      for (const c of civs) {
        const tab = Utils.createEl('button', `civ-tab ${c.id === civ.id ? 'active' : ''}`, '');
        tab.style.borderColor = c.color;
        tab.innerHTML = `<span class="civ-tab-dot" style="background:${c.color}"></span>${c.name.slice(0, 10)}`;
        tab.onclick = () => {
          panel.dataset.selectedCiv = c.id;
          this._updateCivPanel();
        };
        tabs.appendChild(tab);
      }
      panel.prepend(tabs);
    }
  }

  // ── History Panel ─────────────────────────────────────────────
  _renderHistory(panel, civ) {
    panel.innerHTML = '';
    const header = Utils.createEl('div', 'panel-header');
    header.innerHTML = `<h2>📜 ${this._t('panel_history')} ${civ.name}</h2>`;
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { panel.style.display = 'none'; };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tab bar
    const tabs = Utils.createEl('div', 'history-tabs');
    const logTab = Utils.createEl('button', 'history-tab active', this._t('panel_event_log'));
    const chronicleTab = Utils.createEl('button', 'history-tab', this._t('panel_chronicle'));
    tabs.appendChild(logTab);
    tabs.appendChild(chronicleTab);
    panel.appendChild(tabs);

    const content = Utils.createEl('div', 'panel-content history-list');
    panel.appendChild(content);

    const renderLog = () => {
      content.className = 'panel-content history-list';
      logTab.classList.add('active');
      chronicleTab.classList.remove('active');
      content.innerHTML = '';
      const sorted = [...civ.history].sort((a, b) => a.year - b.year);
      for (const entry of sorted) {
        const item = Utils.createEl('div', `history-item history-type-${entry.type || 'event'}`);
        const title = entry.title ?? entry.type?.replace(/_/g, ' ') ?? 'Event';
        const desc  = entry.description ?? entry.text ?? '';
        item.innerHTML = `
          <div class="history-year">${Utils.formatYear(entry.year)}</div>
          <div class="history-title">${title}</div>
          <div class="history-desc">${desc}</div>
        `;
        content.appendChild(item);
      }
      if (sorted.length === 0) {
        content.innerHTML = `<p class="empty-state">${this._t('history_no_entries')}</p>`;
      }
    };

    const renderChronicle = () => {
      content.className = 'panel-content chronicle-content';
      chronicleTab.classList.add('active');
      logTab.classList.remove('active');
      content.innerHTML = this._generateChronicle(civ);
    };

    logTab.onclick = renderLog;
    chronicleTab.onclick = renderChronicle;
    renderLog();
  }

  // ── Chronicle Generation ───────────────────────────────────────
  _generateChronicle(civ) {
    const sorted = [...civ.history].sort((a, b) => a.year - b.year);
    const foundingEra = Utils.getEra(civ.foundingYear);

    // Opening paragraph
    const relSentence = {
      animist:    'Animist traditions shaped how the people understood the natural world.',
      dominant:   'A dominant faith permeated both public and private life.',
      theocratic: 'Religious and civic authority were unified from the start.',
      plurality:  'Multiple faith traditions coexisted, each carving out its own space.',
      minor:      'A minor religious tradition influenced some corners of life.',
      none:       '',
    }[civ.religion.presence] || '';

    let html = `<div class="chronicle-intro">
      <p><strong>${civ.name}</strong> came into being in ${Utils.formatYear(civ.foundingYear)}, during the ${foundingEra.label} era.
      Its people organized under <em>${civ.governance.model.label}</em> principles, with an economy grounded in <em>${civ.economic.model.label}</em>.
      ${relSentence}</p></div>`;

    if (sorted.length === 0) {
      html += '<p class="chronicle-para" style="padding:20px">Advance more turns to generate a chronicle.</p>';
      return html;
    }

    // Group entries by era
    const eraGroups = new Map();
    for (const entry of sorted) {
      const era = Utils.getEra(entry.year);
      if (!eraGroups.has(era.id)) eraGroups.set(era.id, { era, entries: [] });
      eraGroups.get(era.id).entries.push(entry);
    }

    for (const { era, entries } of eraGroups.values()) {
      html += `<div class="chronicle-chapter">
        <h3 class="chronicle-era-heading">${era.label}</h3>
        ${this._synthesizeEraChapter(civ, era, entries)}
      </div>`;
    }

    // Current state summary
    html += `<div class="chronicle-chapter chronicle-current">
      <h3 class="chronicle-era-heading">${this._t('history_present_day')} ${Utils.formatYear(this.game.currentYear)}</h3>
      ${this._currentStateNarrative(civ)}
    </div>`;

    return html;
  }

  _synthesizeEraChapter(civ, era, entries) {
    // Group by type
    const byType = {};
    for (const e of entries) {
      const t = e.type || 'event';
      if (!byType[t]) byType[t] = [];
      byType[t].push(e);
    }
    const paras = [];

    // Era transition
    if (byType.era) {
      paras.push(`${civ.name} entered the ${era.label} — a transition that brought new possibilities and pressures in equal measure.`);
    }

    // Technologies
    if (byType.technology && byType.technology.length > 0) {
      const names = byType.technology.map(e => e.title.replace('Technology: ', '')).join(', ');
      const impact = byType.technology.length > 2
        ? `These advances reshaped the landscape of what was possible — economically, socially, and in the organisation of daily labour.`
        : `The knowledge spread through the population over the following years, changing the character of everyday life in ways both visible and subtle.`;
      paras.push(`During this period, ${civ.name} developed <strong>${names}</strong>. ${impact}`);
    }

    // Disasters
    if (byType.disaster) {
      for (const d of byType.disaster) {
        paras.push(`<strong>${d.title}:</strong> ${d.description} The effects rippled through the population long after the immediate crisis passed.`);
      }
    }

    // Social events
    if (byType.social) {
      paras.push(byType.social.map(e => e.description).join(' '));
    }

    // Governance changes
    if (byType.governance) {
      for (const g of byType.governance) paras.push(g.description);
    }

    // Economic events
    if (byType.economic) {
      for (const e of byType.economic) paras.push(e.description);
    }

    // Cultural flourishing / movements
    if (byType.culture) {
      for (const c of byType.culture) paras.push(c.description);
    }

    // Religion events
    if (byType.religion) {
      for (const r of byType.religion) paras.push(r.description);
    }

    // Climate crisis
    if (byType.crisis) {
      for (const c of byType.crisis) paras.push(`<strong>${c.title}:</strong> ${c.description}`);
    }

    // Remaining event types (resources discovered, movements, etc.)
    const handled = new Set(['era','technology','disaster','social','governance','economic','culture','religion','crisis']);
    for (const e of entries) {
      if (!handled.has(e.type || 'event') && e.title && e.description) {
        paras.push(`<strong>${e.title}:</strong> ${e.description}`);
      }
    }

    if (paras.length === 0) {
      paras.push(`This was a period of relative continuity for ${civ.name} — no dramatic disruptions, but the slow, invisible accumulation of change.`);
    }

    return paras.map(p => `<p class="chronicle-para">${p}</p>`).join('');
  }

  _currentStateNarrative(civ) {
    const s = civ.state;
    const wellbeing  = Math.round(s.averageWellbeing);
    const equality   = Math.round(s.equalityIndex);
    const corruption = Math.round(civ.governance.corruptionLevel || 0);
    const dominant   = (s.dominantBehaviors || []).slice(0, 3);
    const paras      = [];

    const behLabels = {
      cooperation:    'collective action and mutual support',
      competition:    'competitive striving and individual achievement',
      acquisitiveness:'accumulation and material ambition',
      conformity:     'social conformity and deference to tradition',
      innovation:     'creativity and openness to change',
      mutualAid:      'mutual aid and direct care for others',
      deference:      'deference to authority and established hierarchy',
      autonomy:       'personal autonomy and self-determination',
    };

    // Overall condition
    if (wellbeing > 70)       paras.push(`${civ.name} is in a period of relative flourishing. Most people's basic needs are met, and a sense of stability — however uneven — prevails.`);
    else if (wellbeing > 50)  paras.push(`Life in ${civ.name} is broadly adequate for most, though conditions vary significantly across the social hierarchy. The middle holds, but not without strain.`);
    else if (wellbeing > 35)  paras.push(`${civ.name} is navigating a period of difficulty. Many people are getting by, but the margin for setbacks is thin. The gap between different social positions is acutely felt.`);
    else                      paras.push(`Conditions in ${civ.name} are hard. Wellbeing is low across much of the population, and for those at the margins, survival itself cannot be taken for granted.`);

    // Structure
    let structure = `The civilization continues under <em>${civ.governance.model.label}</em> governance with an economy based on <em>${civ.economic.model.label}</em>.`;
    if (equality < 35)       structure += ` Wealth and opportunity remain heavily concentrated; the distance between the highest and lowest social positions is wide and growing.`;
    else if (equality > 65)  structure += ` Resources are distributed with relative equity — one of the more unusual aspects of this civilization's character.`;
    if (corruption > 60)     structure += ` Corruption is a significant structural problem, quietly diverting resources and eroding the trust that institutions depend on.`;
    paras.push(structure);

    // Behavioral culture
    if (dominant.length > 0) {
      const readable = dominant.map(b => behLabels[b] || b).join(', ');
      paras.push(`The behaviors most reinforced by this civilization's structures are <strong>${readable}</strong> — shaping not only what people do, but how they understand what a person ought to be.`);
    }

    // Technologies
    if (s.adoptedTechnologies && s.adoptedTechnologies.length > 0) {
      const recent = s.adoptedTechnologies.slice(-4);
      paras.push(`Technologies currently in use include: ${recent.join(', ')}.`);
    }

    // Movements
    if (civ.movements && civ.movements.filter(m => m.active).length > 0) {
      const active = civ.movements.filter(m => m.active).map(m => m.name).join(', ');
      paras.push(`Active social movements currently shaping public discourse: ${active}.`);
    }

    // Warming
    if (s.globalWarmingContribution > 15) {
      paras.push(`The civilization's industrial activity has contributed meaningfully to global atmospheric warming. Whether collective action will address this — and at what cost — remains an open question.`);
    }

    return paras.map(p => `<p class="chronicle-para">${p}</p>`).join('');
  }

  // ── World State Panel ─────────────────────────────────────────
  _renderWorldState(panel) {
    panel.innerHTML = '';
    const header = Utils.createEl('div', 'panel-header');
    header.innerHTML = '<h2>🌍 World State</h2>';
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { panel.style.display = 'none'; };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const world = this.game.simulation?.getWorldState() || {};
    const content = Utils.createEl('div', 'panel-content');
    const tp = world.tippingPoints || {};
    content.innerHTML = `
      <div class="world-stat">🌡️ Global Warming: <strong>${Math.round(world.globalWarmingIndex || 0)}/100</strong>
        <span style="font-size:0.85em;color:#888;margin-left:6px">(+${world.temperatureAnomaly ?? 0}°C, ${world.atmosphericCO2 ?? 280} ppm CO₂)</span></div>
      <div class="world-stat">🌍 Civilizations: <strong>${world.civilizationCount || 0}</strong></div>
      <div class="world-stat">😊 World Wellbeing: <strong>${Math.round(world.worldAverageWellbeing || 50)}/100</strong></div>
      <div class="world-stat">🫀 World Empathy: <strong>${Math.round(world.worldAverageEmpathy || 50)}/100</strong></div>
      ${tp.permafrost ? '<div class="crisis-badge" style="background:#e67e22;color:#fff;border-color:#e67e22">⚠ PERMAFROST THAW</div>' : ''}
      ${tp.iceSheets ? '<div class="crisis-badge" style="background:#e74c3c;color:#fff;border-color:#e74c3c">⚠ ICE SHEETS DESTABILIZED</div>' : ''}
      ${tp.amoc ? '<div class="crisis-badge" style="background:#c0392b;color:#fff;border-color:#c0392b">⚠ ATLANTIC CIRCULATION COLLAPSED</div>' : ''}
      ${tp.hothouse ? '<div class="crisis-badge" style="background:#8e44ad;color:#fff;border-color:#8e44ad">⚠ HOTHOUSE EARTH</div>' : ''}
      ${world.climateTippingPoint && !tp.permafrost ? '<div class="crisis-badge">⚠ CLIMATE TIPPING POINT REACHED</div>' : ''}
    `;

    // Per-civ comparison
    const compTitle = Utils.createEl('div', 'section-title', 'Civilization Comparison');
    content.appendChild(compTitle);
    for (const civ of this.game.civilizations) {
      const sum = civ.getSummary();
      const row = Utils.createEl('div', 'civ-compare-row');
      row.innerHTML = `
        <div class="compare-name" style="color:${civ.color}">${civ.name}</div>
        <div class="compare-stats">
          <span>Pop: ${sum.population}</span>
          <span>WB: ${sum.wellbeing}</span>
          <span>Eq: ${sum.equality}</span>
          <span>Empathy: ${sum.empathy}</span>
          <span>🌡️: ${sum.warmingContrib}</span>
        </div>
        <div class="compare-behavior">
          ${sum.dominantBehaviors.slice(0,2).map(b => `<span class="behavior-tag sm" style="background:${BEHAVIORS[b]?.color||'#666'}">${b}</span>`).join('')}
        </div>
      `;
      content.appendChild(row);
    }
    panel.appendChild(content);
  }

  // ── Scenario Management Helpers ───────────────────────────────

  _renderScenariosSection(container) {
    const scenarios = this.game.loadScenarios();

    if (scenarios.length === 0) {
      const empty = Utils.createEl('p', 'settings-note',
        'No saved scenarios yet. Name a simulation in the setup wizard\'s "Scenario Options" step to save it.');
      container.appendChild(empty);

      // "Save current run" button if a game is active
      if (this.game._activeScenarioId && this.currentScreen === 'game-screen') {
        const saveRunBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '💾 Save current run snapshot');
        saveRunBtn.style.marginTop = '8px';
        saveRunBtn.onclick = () => {
          const ok = this.game.saveScenarioRun();
          this.showNotification(ok ? '✅ Run snapshot saved!' : '⚠️ No active scenario to save.');
          this._renderSettings(container.closest('.panel') || container.parentElement);
        };
        container.appendChild(saveRunBtn);
      }
      return;
    }

    // Save current run button (when in-game)
    if (this.game._activeScenarioId && this.currentScreen === 'game-screen') {
      const saveRunBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '💾 Save current run snapshot');
      saveRunBtn.style.cssText = 'margin-bottom:12px';
      saveRunBtn.onclick = () => {
        const ok = this.game.saveScenarioRun();
        this.showNotification(ok ? '✅ Run snapshot saved!' : '⚠️ No active scenario.');
        this._renderScenariosSection(container);
      };
      container.appendChild(saveRunBtn);
    }

    for (const sc of scenarios) {
      const scBlock = Utils.createEl('div', 'scenario-block');

      // Header row
      const header = Utils.createEl('div', 'scenario-block-header');
      const title  = Utils.createEl('span', 'scenario-block-title',
        `#${sc.number} ${sc.name}`);
      const meta   = Utils.createEl('span', 'scenario-block-meta',
        `${sc.runs?.length || 0} run${(sc.runs?.length || 0) === 1 ? '' : 's'} · ${sc.createdAt ? new Date(sc.createdAt).toLocaleDateString() : ''}`);
      header.appendChild(title);
      header.appendChild(meta);

      // Action buttons
      const btnRow = Utils.createEl('div', 'scenario-btn-row');

      const runAgainBtn = Utils.createEl('button', 'btn btn-primary btn-sm', '▶ Run Again');
      runAgainBtn.onclick = () => this.game.loadScenarioForRerun(sc.id);
      btnRow.appendChild(runAgainBtn);

      if (sc.runs?.some(r => r.finalStats)) {
        const exportBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 Export CSV');
        exportBtn.onclick = () => this.game.exportScenarioCSV(sc.id);
        btnRow.appendChild(exportBtn);
      }

      const deleteBtn = Utils.createEl('button', 'btn btn-danger btn-sm', '🗑 Delete');
      deleteBtn.onclick = () => {
        if (!confirm(`Delete scenario "${sc.name}" and all its runs?`)) return;
        this.game.deleteScenario(sc.id);
        scBlock.remove();
      };
      btnRow.appendChild(deleteBtn);

      scBlock.appendChild(header);
      scBlock.appendChild(btnRow);

      // Comparison table (if 2+ runs or any with stats)
      const runsWithStats = (sc.runs || []).filter(r => r.finalStats);
      if (sc.runs?.length > 0) {
        const tableWrap = Utils.createEl('div', 'scenario-table-wrap');
        tableWrap.appendChild(this._buildComparisonTable(sc));
        scBlock.appendChild(tableWrap);
      }

      container.appendChild(scBlock);
    }
  }

  _buildComparisonTable(sc) {
    const runs  = sc.runs || [];
    const table = Utils.createEl('table', 'scenario-table');

    // Header row
    const thead = table.createTHead();
    const hrow  = thead.insertRow();
    const cols  = ['Metric', ...runs.map((r, i) => r.runLabel || `Run ${i + 1}`)];
    cols.forEach((c, i) => {
      const th = document.createElement('th');
      th.textContent = c;
      if (i === 0) th.className = 'st-metric';
      hrow.appendChild(th);
    });

    const tbody = table.createTBody();

    // Helper: add a row
    const addRow = (label, getter) => {
      const tr = tbody.insertRow();
      const th = document.createElement('td');
      th.className = 'st-metric';
      th.textContent = label;
      tr.appendChild(th);
      runs.forEach(r => {
        const td = tr.insertCell();
        td.textContent = r.finalStats ? getter(r.finalStats) : '—';
      });
    };

    addRow('Turns',       fs => fs.turnCount   || '—');
    addRow('Population',  fs => (fs.population  || 0).toLocaleString());
    addRow('Wellbeing',   fs => fs.wellbeing    ?? '—');
    addRow('Equality',    fs => fs.equality     ?? '—');
    addRow('Stability',   fs => fs.stability    ?? '—');
    addRow('Corruption',  fs => fs.corruption   ?? '—');
    addRow('Wealth Conc', fs => fs.wealthConcentration !== undefined ? fs.wealthConcentration + '%' : '—');
    addRow('Tech Level',  fs => fs.techLevel    ?? '—');
    addRow('Empathy',     fs => fs.empathy      ?? '—');
    addRow('Cooperation', fs => fs.cooperation  ?? '—');

    // Major events row
    const evRow = tbody.insertRow();
    const evTh  = document.createElement('td');
    evTh.className = 'st-metric';
    evTh.textContent = 'Major Events';
    evRow.appendChild(evTh);
    runs.forEach(r => {
      const td = evRow.insertCell();
      if (r.finalStats?.majorEvents?.length) {
        td.innerHTML = r.finalStats.majorEvents
          .slice(0, 5)
          .map(e => `<div class="st-event-tag">${e.title}</div>`)
          .join('');
      } else {
        td.textContent = '—';
      }
    });

    // Changed params row
    const paramRow = tbody.insertRow();
    const paramTh  = document.createElement('td');
    paramTh.className = 'st-metric';
    paramTh.textContent = 'Changed Params';
    paramRow.appendChild(paramTh);
    runs.forEach(r => {
      const td = paramRow.insertCell();
      const keys = Object.keys(r.paramOverrides || {});
      td.textContent = keys.length === 0 ? '(baseline)' : keys.join(', ');
      td.style.fontStyle = keys.length === 0 ? 'italic' : '';
      td.style.color = keys.length === 0 ? 'var(--text-dim)' : '';
    });

    return table;
  }

  // ── Settings Panel ────────────────────────────────────────────
  _renderSettings(panel) {
    panel.innerHTML = '';
    const header = Utils.createEl('div', 'panel-header');
    header.innerHTML = '<h2>⚙️ Settings</h2>';
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { panel.style.display = 'none'; };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const settings = this.game.settings;
    const content = Utils.createEl('div', 'panel-content');

    // ── Provider metadata ─────────────────────────────────────────
    const PROVIDER_INFO = {
      none: {
        label: 'None (rule-based responses)',
        desc: 'NPC responses are generated by built-in rule engine — contextual and grounded in simulation data, no internet required.',
        link: null, linkLabel: null,
        keyLabel: null,
        defaultModel: null,
        modelPlaceholder: '',
      },
      ollama: {
        label: '🦙 Ollama — Free, local (no account)',
        desc: 'Run a language model entirely on your own computer. Free, offline, and private.<br>' +
          '1. Install from <a href="https://ollama.com" target="_blank">ollama.com</a><br>' +
          '2. Pull a model: <code>ollama pull mistral</code><br>' +
          '3. Start Ollama: <code>ollama serve</code> (in a separate Terminal tab)<br>' +
          '4. Make sure the game is running via <code>python3 server.py</code> (not <code>python3 -m http.server</code>)',
        link: 'https://ollama.com', linkLabel: 'Get Ollama →',
        keyLabel: null,
        defaultModel: 'mistral',
        modelPlaceholder: 'mistral (default)',
      },
      groq: {
        label: '⚡ Groq — Free cloud tier (no credit card)',
        desc: 'Very fast cloud inference — free tier gives 14,400 requests/day. Sign up at <a href="https://console.groq.com" target="_blank">console.groq.com</a> (email only, no credit card).',
        link: 'https://console.groq.com', linkLabel: 'Get free Groq key →',
        keyLabel: 'Groq API Key',
        defaultModel: 'llama-3.1-8b-instant',
        modelPlaceholder: 'llama-3.1-8b-instant (default)',
      },
      gemini: {
        label: '✨ Google Gemini — Free tier (no credit card)',
        desc: 'Google\'s Gemini Flash model has a permanent free tier (15 req/min). Get a key at <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a> (no credit card).',
        link: 'https://aistudio.google.com/app/apikey', linkLabel: 'Get free Gemini key →',
        keyLabel: 'Google AI API Key',
        defaultModel: 'gemini-1.5-flash',
        modelPlaceholder: 'gemini-1.5-flash (default)',
      },
      anthropic: {
        label: '🧠 Anthropic Claude — Paid API',
        desc: 'Claude models (Haiku recommended for cost). Requires a paid Anthropic account. Get a key at <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a>. New accounts receive a small one-time credit.',
        link: 'https://console.anthropic.com', linkLabel: 'Anthropic Console →',
        keyLabel: 'Anthropic API Key',
        defaultModel: 'claude-haiku-4-5-20251001',
        modelPlaceholder: 'claude-haiku-4-5-20251001 (default)',
      },
      openai: {
        label: '🟢 OpenAI GPT — Paid API',
        desc: 'GPT models (gpt-4o-mini recommended for cost). Requires a paid OpenAI account. Get a key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>. New accounts receive a small one-time credit.',
        link: 'https://platform.openai.com/api-keys', linkLabel: 'OpenAI Platform →',
        keyLabel: 'OpenAI API Key',
        defaultModel: 'gpt-4o-mini',
        modelPlaceholder: 'gpt-4o-mini (default)',
      },
    };

    const currentProvider = settings.apiProvider || 'none';

    content.innerHTML = `
      <div class="settings-section">
        <h3>🤖 LLM Integration <span style="font-weight:400;font-size:0.8em;color:var(--text-dim)">(Optional)</span></h3>
        <p class="settings-desc">Enable AI-powered NPC responses and full localization. Without LLM, responses use the built-in rule engine — still rich and simulation-aware.</p>

        <div class="form-group">
          <label>LLM Provider</label>
          <select id="settings-provider" class="select-input">
            <option value="none"     ${currentProvider === 'none'      ? 'selected' : ''}>${PROVIDER_INFO.none.label}</option>
            <optgroup label="🆓 Free — Local (no account needed)">
              <option value="ollama"   ${currentProvider === 'ollama'    ? 'selected' : ''}>${PROVIDER_INFO.ollama.label}</option>
            </optgroup>
            <optgroup label="🆓 Free Cloud Tier (free API key, no credit card)">
              <option value="groq"     ${currentProvider === 'groq'      ? 'selected' : ''}>${PROVIDER_INFO.groq.label}</option>
              <option value="gemini"   ${currentProvider === 'gemini'    ? 'selected' : ''}>${PROVIDER_INFO.gemini.label}</option>
            </optgroup>
            <optgroup label="💳 Paid Cloud">
              <option value="anthropic"${currentProvider === 'anthropic' ? 'selected' : ''}>${PROVIDER_INFO.anthropic.label}</option>
              <option value="openai"   ${currentProvider === 'openai'    ? 'selected' : ''}>${PROVIDER_INFO.openai.label}</option>
            </optgroup>
          </select>
        </div>

        <!-- Dynamic description block -->
        <div id="provider-desc" class="settings-note" style="margin-bottom:12px;line-height:1.6"></div>

        <!-- Ollama URL + test (only when ollama selected) -->
        <div id="ollama-fields" style="display:none">
          <div class="form-group">
            <label>Ollama URL</label>
            <div style="display:flex;gap:8px;align-items:center">
              <input type="text" id="settings-ollama-url" class="text-input" style="flex:1"
                value="${settings.ollamaUrl || 'http://localhost:11434'}" placeholder="http://localhost:11434" />
              <button id="btn-test-ollama" class="btn btn-secondary btn-sm">🔍 Test</button>
            </div>
          </div>
          <div id="ollama-status" style="font-size:0.83em;margin-bottom:10px"></div>
        </div>

        <!-- API key (hidden for ollama and none) -->
        <div id="apikey-field" class="form-group" style="display:none">
          <label id="apikey-label">API Key <span style="font-weight:400;color:var(--text-dim)">(stored locally in your browser only)</span></label>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="password" id="settings-apikey" class="text-input" style="flex:1"
              value="${settings.apiKey || ''}" placeholder="Paste your key here…" />
            <button id="btn-test-apikey" class="btn btn-secondary btn-sm">🔍 Test</button>
          </div>
          <div id="apikey-status" style="font-size:0.83em;margin-top:6px"></div>
        </div>

        <!-- Model field (always shown, hidden for none) -->
        <div id="model-field" class="form-group" style="display:none">
          <label>Model <span style="font-weight:400;color:var(--text-dim)">(optional — leave blank for default)</span></label>
          <input type="text" id="settings-model" class="text-input"
            value="${settings.apiModel || ''}" placeholder="Leave blank for default" />
        </div>

        <p class="settings-note">🔒 API keys are stored only in your browser's localStorage and sent only to your chosen provider during NPC interviews.</p>
      </div>

      <div class="settings-section">
        <h3>🎮 Game Settings</h3>
        <div class="form-group">
          <label>Turn Speed (years per turn): <span id="speed-val">${settings.yearsPerTurn || 10}</span></label>
          <input type="range" min="1" max="100" value="${settings.yearsPerTurn || 10}" id="speed-slider" />
        </div>
        <div class="form-group">
          <label>Map Overlay</label>
          <select id="settings-overlay" class="select-input">
            <option value="terrain"      ${settings.overlayMode === 'terrain'      ? 'selected' : ''}>Terrain</option>
            <option value="civilization" ${settings.overlayMode === 'civilization' ? 'selected' : ''}>Civilization</option>
            <option value="fertility"    ${settings.overlayMode === 'fertility'    ? 'selected' : ''}>Fertility</option>
            <option value="wellbeing"    ${settings.overlayMode === 'wellbeing'    ? 'selected' : ''}>Wellbeing</option>
          </select>
        </div>
        <div class="form-group">
          <label>🌐 Interview Language</label>
          <select id="settings-language" class="select-input">
            <option value="en"   ${(settings.language || 'en') === 'en'   ? 'selected' : ''}>English</option>
            <option value="es"   ${settings.language === 'es'   ? 'selected' : ''}>Español</option>
            <option value="de"   ${settings.language === 'de'   ? 'selected' : ''}>Deutsch</option>
            <option value="zh-TW"${settings.language === 'zh-TW'? 'selected' : ''}>繁體中文</option>
            <option value="ru"   ${settings.language === 'ru'   ? 'selected' : ''}>Русский</option>
          </select>
          <p class="settings-note" style="margin-top:4px">In LLM mode, NPCs respond fully in the selected language. In rule-based mode, UI labels and fallback phrases are translated.</p>
        </div>
      </div>
    `;

    // ── Dynamic provider UI updater ───────────────────────────────
    const updateProviderUI = (provider) => {
      const info = PROVIDER_INFO[provider] || PROVIDER_INFO.none;
      const descEl    = content.querySelector('#provider-desc');
      const ollamaDiv = content.querySelector('#ollama-fields');
      const keyDiv    = content.querySelector('#apikey-field');
      const keyLabel  = content.querySelector('#apikey-label');
      const modelDiv  = content.querySelector('#model-field');
      const modelInput= content.querySelector('#settings-model');

      if (descEl) descEl.innerHTML = info.desc || '';
      if (ollamaDiv) ollamaDiv.style.display = provider === 'ollama' ? '' : 'none';
      if (keyDiv)    keyDiv.style.display    = (provider !== 'ollama' && provider !== 'none') ? '' : 'none';
      if (modelDiv)  modelDiv.style.display  = provider !== 'none' ? '' : 'none';
      if (keyLabel && info.keyLabel) keyLabel.firstChild.textContent = info.keyLabel + ' ';
      if (modelInput) modelInput.placeholder = info.modelPlaceholder || 'Leave blank for default';

      // Show Ollama detected status if already probed
      if (provider === 'ollama') {
        const statusEl = content.querySelector('#ollama-status');
        if (statusEl) {
          if (settings.ollamaDetected) {
            const models = (settings.ollamaModels || []);
            statusEl.innerHTML = `✅ Ollama is running${models.length ? ' · Models: <code>' + models.join('</code>, <code>') + '</code>' : ''}.`;
            statusEl.style.color = '#2ecc71';
          } else {
            statusEl.textContent = 'Ollama status unknown — click Test to check.';
            statusEl.style.color = 'var(--text-dim)';
          }
        }
      }
    };

    // File:// protocol warning — LLM fetch() is blocked by browsers from null origin
    if (window.location.protocol === 'file:') {
      const warn = Utils.createEl('div', 'settings-warn');
      const _c = (t) => `<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.9em">${t}</code>`;
      warn.innerHTML =
        '<strong>⚠️ LLM is blocked — app opened as a local file</strong>' +
        '<p style="margin:6px 0 4px">Browsers block API calls from ' + _c('file://') + ' pages. To enable LLM, follow these steps:</p>' +
        '<ol style="margin:4px 0 6px;padding-left:20px;line-height:1.9">' +
        '<li>Open <strong>Terminal</strong> (Mac) or <strong>Command Prompt</strong> (Windows)</li>' +
        '<li>Type: ' + _c('cd ~/civ-sim') + ' and press Enter &nbsp;<span style="color:#9090a8;font-size:0.85em">(adjust path to where you unzipped the app)</span></li>' +
        '<li>Type: ' + _c('python3 server.py') + ' and press Enter &nbsp;<span style="color:#9090a8;font-size:0.85em">(leave this Terminal window open)</span></li>' +
        '<li>In your browser address bar, go to: <strong>http://localhost:8080</strong></li>' +
        '<li>The app loads fresh — open <strong>Settings → LLM Integration</strong> again</li>' +
        '<li>Choose your provider and enter your API key &nbsp;<span style="color:#9090a8;font-size:0.85em">(keys do not carry over from file:// — you must re-enter)</span></li>' +
        '<li>Click <strong>Save Settings</strong>, then try an interview</li>' +
        '</ol>' +
        '<p style="margin:4px 0 0"><strong>Ollama users:</strong> also start Ollama in another Terminal tab: ' + _c('ollama serve') + '</p>';
      const llmSection = content.querySelector('.settings-section');
      if (llmSection) llmSection.insertBefore(warn, llmSection.firstChild);
    }

    // Initial render
    updateProviderUI(currentProvider);

    // Provider dropdown change — live update (no save needed to see fields)
    const providerSel = content.querySelector('#settings-provider');
    if (providerSel) providerSel.onchange = () => updateProviderUI(providerSel.value);

    // Ollama test button
    const testBtn = content.querySelector('#btn-test-ollama');
    if (testBtn) {
      testBtn.onclick = async () => {
        testBtn.disabled = true;
        testBtn.textContent = '⏳ Testing…';
        const urlInput = content.querySelector('#settings-ollama-url');
        if (urlInput) settings.ollamaUrl = urlInput.value.trim() || 'http://localhost:11434';
        const found = await this.game._detectOllama(true);
        const statusEl = content.querySelector('#ollama-status');
        if (statusEl) {
          if (found) {
            const models = (settings.ollamaModels || []);
            statusEl.innerHTML = `✅ Ollama is running${models.length ? ' · Models: <code>' + models.join('</code>, <code>') + '</code>' : ''}.`;
            statusEl.style.color = '#2ecc71';
          } else {
            statusEl.innerHTML = `❌ Could not reach Ollama at <code>${settings.ollamaUrl}</code>.<br>` +
              'Checklist:<br>' +
              '&nbsp;&nbsp;1. Is Ollama installed? (<a href="https://ollama.com" target="_blank">ollama.com</a>)<br>' +
              '&nbsp;&nbsp;2. Did you pull a model? Run: <code>ollama pull mistral</code><br>' +
              '&nbsp;&nbsp;3. Is Ollama running? Start it: <code>ollama serve</code><br>' +
              '&nbsp;&nbsp;4. Is the game served via <code>python3 server.py</code>? (required for LLM proxy)';
            statusEl.style.color = '#ff6b6b';
          }
        }
        testBtn.disabled = false;
        testBtn.textContent = '🔍 Test';
      };
    }

    // API key test button (Groq, Gemini, Anthropic, OpenAI)
    const testKeyBtn = content.querySelector('#btn-test-apikey');
    if (testKeyBtn) {
      testKeyBtn.onclick = async () => {
        const providerSel = content.querySelector('#settings-provider');
        const provider = providerSel?.value || 'none';
        const keyInput = content.querySelector('#settings-apikey');
        const apiKey = keyInput?.value?.trim();
        const statusEl = content.querySelector('#apikey-status');
        if (!apiKey) {
          if (statusEl) { statusEl.textContent = 'Enter an API key first.'; statusEl.style.color = '#ff6b6b'; }
          return;
        }
        testKeyBtn.disabled = true;
        testKeyBtn.textContent = '⏳ Testing…';
        if (statusEl) { statusEl.textContent = ''; statusEl.style.color = ''; }
        try {
          let testUrl, testOpts;
          if (provider === 'groq') {
            testUrl = 'https://api.groq.com/openai/v1/models';
            testOpts = { headers: { 'Authorization': `Bearer ${apiKey}` } };
          } else if (provider === 'gemini') {
            testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            testOpts = {};
          } else if (provider === 'anthropic') {
            testUrl = 'https://api.anthropic.com/v1/messages';
            testOpts = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
              body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
            };
          } else if (provider === 'openai') {
            testUrl = 'https://api.openai.com/v1/models';
            testOpts = { headers: { 'Authorization': `Bearer ${apiKey}` } };
          } else {
            if (statusEl) { statusEl.textContent = 'No test available for this provider.'; statusEl.style.color = 'var(--text-dim)'; }
            testKeyBtn.disabled = false; testKeyBtn.textContent = '🔍 Test'; return;
          }
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const res = await Utils.llmFetch(testUrl, { ...testOpts, signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok || (provider === 'anthropic' && res.status < 500)) {
            if (statusEl) { statusEl.textContent = '✅ API key is valid!'; statusEl.style.color = '#2ecc71'; }
          } else {
            const body = await res.text().catch(() => '');
            const hint = res.status === 401 ? 'Invalid API key.'
              : res.status === 403 ? 'Access denied (Cloudflare IP block).'
              : `HTTP ${res.status}`;
            let extra = '';
            if (res.status === 403) {
              extra = ' This is usually caused by a VPN — try disconnecting your VPN and retrying. '
                + 'Some ISPs and geographic regions are also blocked by Groq\'s Cloudflare protection.';
            }
            if (statusEl) {
              statusEl.innerHTML = `❌ ${hint}${extra}`;
              statusEl.style.color = '#ff6b6b';
            }
          }
        } catch (err) {
          if (statusEl) {
            statusEl.innerHTML = `❌ Connection failed: ${err.message}.<br>` +
              '<span style="color:var(--text-dim)">Make sure the game is served via <code>python3 server.py</code> (not <code>python3 -m http.server</code>). The server.py includes an LLM proxy that avoids browser CORS restrictions.</span>';
            statusEl.style.color = '#ff6b6b';
          }
        }
        testKeyBtn.disabled = false;
        testKeyBtn.textContent = '🔍 Test';
      };
    }

    const speedSlider = content.querySelector('#speed-slider');
    if (speedSlider) speedSlider.oninput = () => {
      const val = parseInt(speedSlider.value);
      settings.yearsPerTurn = val;
      this.game.yearsDelta = val; // Apply immediately to running game
      const el = content.querySelector('#speed-val');
      if (el) el.textContent = val;
    };

    const overlaySelect = content.querySelector('#settings-overlay');
    if (overlaySelect) overlaySelect.onchange = () => {
      this.game.map.setOverlayMode(overlaySelect.value);
    };

    // ── Scenarios Section ──────────────────────────────────────
    const scenSection = Utils.createEl('div', 'settings-section');
    scenSection.innerHTML = '<h3>📋 Saved Scenarios</h3>' +
      '<p class="settings-desc">Scenarios let you save starting parameters and compare multiple runs with different variables.</p>';
    this._renderScenariosSection(scenSection);
    content.appendChild(scenSection);

    const saveBtn = Utils.createEl('button', 'btn btn-primary', 'Save Settings');
    saveBtn.onclick = () => {
      // Provider — can be changed at any time
      const provSel = content.querySelector('#settings-provider');
      if (provSel) settings.apiProvider = provSel.value;
      // API key (cleared if switching to none/ollama)
      const keyInp = content.querySelector('#settings-apikey');
      if (keyInp) settings.apiKey = keyInp.value.trim();
      // Model
      const modelInp = content.querySelector('#settings-model');
      if (modelInp) settings.apiModel = modelInp.value.trim();
      // Ollama URL
      const ollamaUrl = content.querySelector('#settings-ollama-url');
      if (ollamaUrl) settings.ollamaUrl = ollamaUrl.value.trim() || 'http://localhost:11434';
      // Language
      const langSel = content.querySelector('#settings-language');
      if (langSel) {
        settings.language = langSel.value;
        if (typeof I18N !== 'undefined') I18N.setLanguage(langSel.value);
        const ip = Utils.el('interview-panel');
        if (ip && ip.style.display !== 'none' && this.game.interviewPanel) {
          this.game.interviewPanel.show();
        }
      }
      // Don't persist runtime-only fields
      const toSave = { ...settings };
      delete toSave.ollamaDetected;
      delete toSave.ollamaModels;
      localStorage.setItem('civSimSettings', JSON.stringify(toSave));
      this.showNotification('✅ Settings saved!');
      panel.style.display = 'none';
    };
    content.appendChild(saveBtn);
    panel.appendChild(content);
  }

  // ══════════════════════════════════════════════════════════════
  //  Social Stratification Panel
  // ══════════════════════════════════════════════════════════════

  showStratificationPanel() {
    const panel = Utils.el('stratification-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    const civ = this.game.civilizations.find(c => c.isPlayerCiv) || this.game.civilizations[0];
    this._renderStratificationPanel(panel, civ);
  }

  hideStratificationPanel() {
    const panel = Utils.el('stratification-panel');
    if (panel) panel.style.display = 'none';
  }

  // ── Data derivation ───────────────────────────────────────────
  _deriveStrata(civ) {
    const hierLevel   = Utils.clamp(civ.governance?.model?.hierarchyLevel   ?? 50, 0, 100);
    const powerConc   = Utils.clamp(civ.governance?.powerConcentration      ?? 50, 0, 100);
    const equality    = Utils.clamp(civ.state?.equalityIndex                ?? 50, 0, 100);
    const wealthConc  = Utils.clamp(civ.economic?.wealthConcentration       ?? 50, 0, 100);
    const corruption  = Utils.clamp(civ.governance?.corruptionLevel         ?? 20, 0, 100);
    const freedom     = Utils.clamp(civ.operatingPrinciples?.freedomLevel   ?? 60, 0, 100);

    // Flat threshold: essentially classless
    const isFlat = hierLevel < 15 && equality > 72;

    // Number of tiers based on hierarchy depth
    const tierCount = isFlat ? 0 : (hierLevel < 30 ? 2 : hierLevel < 60 ? 3 : 4);

    const privilegeLabel = (val) => {
      if (val >= 81) return { text: 'VERY HIGH', cls: 'priv-very-high' };
      if (val >= 61) return { text: 'HIGH',      cls: 'priv-high'      };
      if (val >= 41) return { text: 'MODERATE',  cls: 'priv-moderate'  };
      if (val >= 21) return { text: 'LOW',       cls: 'priv-low'       };
      return             { text: 'MINIMAL',   cls: 'priv-minimal'   };
    };

    // Disenfranchised tier — always present but suppressed in display for flat societies
    const disPop     = Math.max(1, Math.round((100 - equality) / 8));
    const disFreedom = Math.max(0, freedom - 40);
    const disenfranchised = {
      name:      'Disenfranchised',
      pop:       disPop,
      wealth:    Math.max(0, 100 - Math.min(97, wealthConc) - 3),  // tiny residual
      power:     0,
      freedom:   disFreedom,
      privilege: privilegeLabel(0),
      note:      'Systemic barriers to upward mobility',
      special:   true,
    };

    if (isFlat) {
      return {
        flat: true,
        freedom,
        corruption,
        wealthConc,
        equality,
        disenfranchised: disPop > 2 ? disenfranchised : null,  // only show if non-trivial
      };
    }

    // Tier 0 — Elite
    const elitePop     = Math.max(2, Math.round(wealthConc / 10));
    const eliteWealth  = Math.round(wealthConc * 0.80);
    const elitePower   = Math.round(powerConc  * 0.75);
    const eliteFreedom = Math.min(100, freedom + 30);
    const elitePrivVal = Utils.clamp(eliteWealth * 0.5 + corruption * 0.3, 0, 100);

    const tiers = [{
      name:      'Elite',
      pop:       elitePop,
      wealth:    eliteWealth,
      power:     elitePower,
      freedom:   eliteFreedom,
      privilege: privilegeLabel(elitePrivVal),
      colorClass: 'tier-elite',
    }];

    if (tierCount >= 2) {
      // Upper Middle
      const umPop    = Math.min(25, Math.round(15 + (100 - wealthConc) / 10));
      const umWealth = Math.min(20, Math.round(wealthConc * 0.15));
      const umPower  = Math.round(powerConc * 0.18);
      const umFree   = Math.min(100, freedom + 12);
      const umPriv   = Utils.clamp((umWealth - disenfranchised.wealth) * 0.3 + corruption * 0.2, 0, 100);
      tiers.push({
        name: 'Upper Middle',
        pop: umPop, wealth: umWealth, power: umPower, freedom: umFree,
        privilege: privilegeLabel(umPriv), colorClass: 'tier-upper-mid',
      });
    }

    if (tierCount >= 3) {
      // Lower Middle
      const lmPop    = Math.round(30 - hierLevel * 0.1);
      const lmWealth = Math.max(5,  Math.round(40 - wealthConc * 0.4));
      const lmPower  = Math.round(powerConc * 0.06);
      const lmFree   = freedom;
      const lmPriv   = Utils.clamp(lmWealth * 0.3 + corruption * 0.1, 0, 100);
      tiers.push({
        name: 'Lower Middle',
        pop: lmPop, wealth: lmWealth, power: lmPower, freedom: lmFree,
        privilege: privilegeLabel(lmPriv), colorClass: 'tier-lower-mid',
      });
    }

    if (tierCount >= 4) {
      // Working Class
      const wcPop    = Math.max(10, Math.round(100 - elitePop - tiers[1].pop - tiers[2].pop - disPop - 5));
      const wcWealth = Math.max(3,  Math.round(20 - wealthConc * 0.18));
      const wcPower  = Math.max(1,  Math.round(10 - powerConc / 10));
      const wcFree   = Math.max(10, freedom - 20);
      const wcPriv   = Utils.clamp(wcWealth * 0.2, 0, 100);
      tiers.push({
        name: 'Working Class',
        pop: wcPop, wealth: wcWealth, power: wcPower, freedom: wcFree,
        privilege: privilegeLabel(wcPriv), colorClass: 'tier-working',
      });
    } else if (tierCount === 2) {
      // With only 2 tiers, collapse everything below Elite into a broad lower tier
      const lPop    = Math.max(10, 100 - elitePop - disPop);
      const lWealth = Math.max(3, 100 - eliteWealth - 2);
      const lPower  = Math.max(1, 100 - elitePower);
      const lFree   = Math.max(10, freedom - 15);
      tiers.push({
        name: 'Common People',
        pop: lPop, wealth: lWealth, power: lPower, freedom: lFree,
        privilege: privilegeLabel(10), colorClass: 'tier-working',
      });
    }

    // Wealth → govt influence: high wealth concentration + corruption = plutocratic capture
    const wealthGovtInfluence = Math.round(Utils.clamp(wealthConc * 0.6 + corruption * 0.4, 0, 100));

    // Religion → govt influence
    const civRel    = civ.religionManager?.religions?.[0] || civ.religion || {};
    const theoLevel = Utils.clamp(civRel.theocraticLevel ?? civRel.influence ?? 0, 0, 100);
    const stateRel  = civRel.stateRelationship ?? civ.religion?.stateRelationship ?? 'secular';
    const stateBonus = stateRel === 'theocratic' ? 30 : stateRel === 'aligned' ? 15 : stateRel === 'state' ? 20 : 0;
    const religionGovtInfluence = Math.round(Utils.clamp(theoLevel * 0.7 + stateBonus, 0, 100));

    return {
      flat: false,
      tiers,
      tierCount,
      disenfranchised,
      wealthGovtInfluence,
      religionGovtInfluence,
      wealthConc,
      corruption,
      equality,
      freedom,
    };
  }

  // ── Narrative ─────────────────────────────────────────────────
  _stratanarrative(strata, civ) {
    const gov = civ.governance?.model?.label || civ.governance?.modelId || 'unknown governance';
    if (strata.flat) {
      const parts = [`${civ.name} operates with a largely flat social structure under ${gov}.`];
      if (strata.equality > 85) parts.push(`Resources and influence are distributed with unusual equality — structural class divisions are minimal.`);
      else parts.push(`Minor asymmetries exist but the hierarchy is too shallow to produce distinct stratified classes.`);
      if (strata.disenfranchised) parts.push(`Even here, a small fraction (~${strata.disenfranchised.pop}%) faces systemic barriers that participation alone cannot overcome.`);
      return parts.join(' ');
    }
    const topTier = strata.tiers[0];
    const parts = [];
    const structLabel = strata.tierCount >= 4 ? 'a deeply stratified' : strata.tierCount === 3 ? 'a three-tier' : 'a two-tier';
    parts.push(`${civ.name} exhibits ${structLabel} social structure under ${gov}.`);
    if (topTier.wealth >= 70) {
      parts.push(`An elite comprising ${topTier.pop}% of the population controls ${topTier.wealth}% of wealth — extreme concentration that insulates the top tier from the conditions facing everyone below.`);
    } else if (topTier.wealth >= 45) {
      parts.push(`The top ${topTier.pop}% commands ${topTier.wealth}% of wealth, a significant concentration that shapes access to opportunity, law, and political voice.`);
    } else {
      parts.push(`The wealth gap is present but moderate — the elite controls ${topTier.wealth}% of resources, leaving a meaningful share distributed across other strata.`);
    }
    const dis = strata.disenfranchised;
    if (dis.pop >= 10) {
      parts.push(`Roughly ${dis.pop}% of the population is structurally excluded — unable to improve their position through ordinary participation. This is not poverty alone, but systemic removal from the pathways of mobility.`);
    } else if (dis.pop >= 4) {
      parts.push(`A disenfranchised underclass of ${dis.pop}% faces barriers that formal civic processes cannot address without structural reform.`);
    }
    if (strata.wealthGovtInfluence >= 70) {
      parts.push(`Governance is heavily shaped by wealth: corporate and financial interests exercise outsized influence over policy outcomes, regardless of nominal political structures.`);
    }
    if (strata.religionGovtInfluence >= 50) {
      parts.push(`Religious authority holds significant sway over governance — institutional, cultural, or both.`);
    }
    return parts.join(' ');
  }

  // ── Main render ───────────────────────────────────────────────
  _renderStratificationPanel(panel, civ) {
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    header.innerHTML = `<h2>⚖️ Social Stratification — <span style="color:${civ.color}">${civ.name}</span></h2>`;
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { panel.style.display = 'none'; };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const content = Utils.createEl('div', 'panel-content');

    // Civ switcher (if multiple civs)
    if (this.game.civilizations.length > 1) {
      const switcherWrap = Utils.createEl('div', 'strata-switcher');
      this.game.civilizations.forEach(c => {
        const btn = Utils.createEl('button', `btn btn-secondary btn-sm strata-civ-btn${c.id === civ.id ? ' active' : ''}`, c.name);
        btn.style.borderColor = c.color;
        if (c.id === civ.id) btn.style.background = c.color + '33';
        btn.onclick = () => this._renderStratificationPanel(panel, c);
        switcherWrap.appendChild(btn);
      });
      content.appendChild(switcherWrap);
    }

    const strata = this._deriveStrata(civ);

    // Structure label
    const structLabel = strata.flat ? 'No structural hierarchy (egalitarian)'
      : strata.tierCount === 4 ? 'Highly Stratified (5 tiers)'
      : strata.tierCount === 3 ? 'Moderately Stratified (4 tiers)'
      : 'Lightly Stratified (3 tiers)';
    const structDiv = Utils.createEl('div', 'strata-structure-label');
    structDiv.innerHTML = `<strong>SOCIAL STRUCTURE:</strong> ${structLabel}`;
    content.appendChild(structDiv);

    if (strata.flat) {
      // Flat/egalitarian display
      const flatBlock = Utils.createEl('div', 'strata-flat-block');
      flatBlock.innerHTML = `
        <div class="strata-flat-row">No structural hierarchy detected.</div>
        <div class="strata-flat-row">
          <span>Wealth distribution: <strong>${strata.equality > 80 ? 'Near-equal' : 'Fairly equal'}</strong></span>
          <span>Freedom: <strong>${Math.round(strata.freedom)}</strong>/100</span>
          <span>Corruption: <strong>${Math.round(strata.corruption)}</strong>/100</span>
        </div>
      `;
      content.appendChild(flatBlock);
      if (strata.disenfranchised) {
        content.appendChild(this._renderStrataDisenfranchised(strata.disenfranchised));
      }
    } else {
      // Column headers
      const colHeader = Utils.createEl('div', 'strata-col-header');
      colHeader.innerHTML = `
        <span class="sh-tier">TIER</span>
        <span class="sh-pop">POP%</span>
        <span class="sh-wealth">WEALTH%</span>
        <span class="sh-power">POWER%</span>
        <span class="sh-freedom">FREEDOM</span>
        <span class="sh-priv">PRIVILEGE</span>
      `;
      content.appendChild(colHeader);

      // Render each tier
      for (const tier of strata.tiers) {
        content.appendChild(this._renderStrataTier(tier));
      }

      // Disenfranchised always last
      content.appendChild(this._renderStrataDisenfranchised(strata.disenfranchised));

      // Influence section
      const infSection = Utils.createEl('div', 'strata-influence-section');
      infSection.innerHTML = `<div class="strata-section-title">INFLUENCE ON GOVERNANCE</div>`;
      infSection.appendChild(this._renderInfluenceRow('💰 Wealth / Corporate → Govt', strata.wealthGovtInfluence));
      infSection.appendChild(this._renderInfluenceRow('✝️ Religious → Govt', strata.religionGovtInfluence));
      content.appendChild(infSection);
    }

    // Active Factor Impact Readout
    const impactWrap = Utils.createEl('div', '');
    this._renderStrataImpacts(civ, strata, impactWrap);
    content.appendChild(impactWrap);

    // Narrative
    const narrativeEl = Utils.createEl('div', 'strata-narrative');
    narrativeEl.textContent = this._stratanarrative(strata, civ);
    content.appendChild(narrativeEl);

    panel.appendChild(content);
  }

  // ── Strata Factor Impact Readout ──────────────────────────────

  /** Returns an array of active STRATA_IMPACT_PROFILES entries for the given civ. */
  _getActiveStrataFactors(civ) {
    const sim = this.game?.simulation;
    const ids  = [];
    const crime = civ.organizedCrime;
    if (crime?.level > 10 && crime.type) ids.push(crime.type);
    if (civ.slavery?.active)                                           ids.push('slavery_active');
    if ((sim?.globalWarmingIndex ?? 0) > 30)                           ids.push('climate_warming');
    if ((civ.state?.equalityIndex   ?? 50) < 30)                       ids.push('high_inequality');
    if ((civ.state?.stabilityIndex  ?? 50) < 30)                       ids.push('civil_conflict');
    if ((civ.governance?.corruptionLevel ?? 0) > 65)                   ids.push('systemic_corruption');
    return ids
      .map(id => (typeof STRATA_IMPACT_PROFILES !== 'undefined' ? STRATA_IMPACT_PROFILES[id] : null))
      .filter(Boolean);
  }

  /**
   * Render the "⚡ Active Pressures" section into `container`.
   * `strata` is the derived strata object from _deriveStrata(civ).
   */
  _renderStrataImpacts(civ, strata, container) {
    const factors = this._getActiveStrataFactors(civ);

    // Section wrapper
    const section = Utils.createEl('div', 'strata-impacts-section');

    // Header row with Notes toggle
    const headerRow = Utils.createEl('div', 'strata-impacts-header');
    headerRow.innerHTML = '<span class="strata-section-title" style="margin-bottom:0;border-top:none;padding-top:0">⚡ ACTIVE PRESSURES ON EACH STRATUM</span>';
    const toggleBtn = Utils.createEl('button', 'btn btn-secondary btn-sm impact-notes-toggle',
      this._strataImpactVerbose ? '🔲 Compact' : '📝 Notes');
    toggleBtn.onclick = () => {
      this._strataImpactVerbose = !this._strataImpactVerbose;
      // Re-render the full stratification panel to reflect the toggle
      const panel = Utils.el('stratification-panel');
      if (panel) this._renderStratificationPanel(panel, civ);
    };
    headerRow.appendChild(toggleBtn);
    section.appendChild(headerRow);

    if (factors.length === 0) {
      const empty = Utils.createEl('p', 'strata-impacts-empty',
        'No major active pressures detected.');
      section.appendChild(empty);
      container.appendChild(section);
      return;
    }

    // Build list of tier names that actually exist in this civ's strata
    const TIER_KEYS = {
      'Elite':           'elite',
      'Upper Middle':    'upper_middle',
      'Lower Middle':    'lower_middle',
      'Working Class':   'working_class',
      'Common People':   'working_class',
      'Disenfranchised': 'disenfranchised',
    };
    const activeTiers = [];
    if (strata.tiers) {
      strata.tiers.forEach(t => {
        if (TIER_KEYS[t.name]) activeTiers.push({ name: t.name, key: TIER_KEYS[t.name] });
      });
    }
    if (strata.disenfranchised && !strata.flat) {
      activeTiers.push({ name: 'Disenfranchised', key: 'disenfranchised' });
    }

    // Render one card per active factor
    for (const profile of factors) {
      const card = Utils.createEl('div', 'impact-factor-card');
      // Title row
      const titleRow = Utils.createEl('div', 'impact-factor-title');
      titleRow.textContent = `${profile.icon || '⚡'} ${profile.label}`;
      card.appendChild(titleRow);

      // Tier rows
      for (const { name, key } of activeTiers) {
        const severity = profile.tiers?.[key] ?? 0;
        const note     = profile.tierNotes?.[key] || '';
        const row      = Utils.createEl('div', 'impact-tier-row');

        const tierLabel = Utils.createEl('span', 'impact-tier-label', name);
        row.appendChild(tierLabel);

        if (severity === -1) {
          // Benefit
          const badge = Utils.createEl('span', 'impact-benefit', '▲ BENEFIT');
          row.appendChild(badge);
        } else {
          // 5-segment severity bar
          const barWrap = Utils.createEl('div', 'impact-bar-wrap');
          for (let seg = 1; seg <= 5; seg++) {
            const s = Utils.createEl('span', `impact-bar-seg${seg <= severity ? ' filled' : ''}`);
            // Color gradient: 1=yellow, 3=orange, 5=red
            if (seg <= severity) {
              const colors = ['#f0c040','#f0a020','#e07020','#e04020','#cc2020'];
              s.style.background = colors[Math.min(seg - 1, 4)];
            }
            barWrap.appendChild(s);
          }
          row.appendChild(barWrap);
        }

        if (this._strataImpactVerbose && note) {
          const noteEl = Utils.createEl('span', 'impact-tier-note', note);
          row.appendChild(noteEl);
        }

        card.appendChild(row);
      }

      section.appendChild(card);
    }

    container.appendChild(section);
  }

  _renderStrataTier(tier) {
    const card = Utils.createEl('div', `strata-tier ${tier.colorClass}`);
    const barPct = Math.min(100, Math.max(2, tier.wealth));
    card.innerHTML = `
      <div class="strata-row">
        <span class="sh-tier strata-tier-label">${tier.name}</span>
        <span class="sh-pop">${tier.pop}%</span>
        <span class="sh-wealth">${tier.wealth}%</span>
        <span class="sh-power">${tier.power}%</span>
        <span class="sh-freedom">${Math.round(tier.freedom)}</span>
        <span class="sh-priv"><span class="privilege-badge ${tier.privilege.cls}">${tier.privilege.text}</span></span>
      </div>
      <div class="stat-bar-wrap strata-bar">
        <div class="stat-bar" style="width:${barPct}%; background:var(--tier-bar-color, #888)"></div>
      </div>
    `;
    return card;
  }

  _renderStrataDisenfranchised(dis) {
    const card = Utils.createEl('div', 'strata-tier tier-disenfranchised');
    card.innerHTML = `
      <div class="strata-row">
        <span class="sh-tier strata-tier-label">▓ Disenfranchised</span>
        <span class="sh-pop">${dis.pop}%</span>
        <span class="sh-wealth">~${dis.wealth > 0 ? dis.wealth : 0}%</span>
        <span class="sh-power">0%</span>
        <span class="sh-freedom">${Math.round(dis.freedom)}</span>
        <span class="sh-priv"><span class="privilege-badge priv-none">NONE</span></span>
      </div>
      <div class="strata-dis-note">${dis.note}</div>
    `;
    return card;
  }

  _renderInfluenceRow(label, pct) {
    const row = Utils.createEl('div', 'influence-row');
    const clampedPct = Math.round(Utils.clamp(pct, 0, 100));
    row.innerHTML = `
      <span class="influence-label">${label}</span>
      <div class="stat-bar-wrap influence-bar-wrap">
        <div class="stat-bar" style="width:${clampedPct}%; background:${clampedPct > 70 ? '#e74c3c' : clampedPct > 40 ? '#f0a020' : '#6c63ff'}"></div>
      </div>
      <span class="influence-pct">${clampedPct}%</span>
    `;
    return row;
  }

  // ── Render Loop ───────────────────────────────────────────────
  _startRenderLoop() {
    const loop = () => {
      if (this.currentScreen === 'game-screen') {
        this.game.map.render(this.game.civilizations, this.game.currentYear);
        this._updateHUD();
      }
      this._animFrame = requestAnimationFrame(loop);
    };
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    this._animFrame = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
  }
}
