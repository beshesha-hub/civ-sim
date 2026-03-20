// ============================================================
// game.js - Main game controller
// ============================================================

class Game {
  constructor() {
    // ── State ─────────────────────────────────────────────────
    this.currentYear = -3000;
    this.yearsDelta = 10;
    this.currentEra = null;
    this.isRunning = false;
    this.autoPlayInterval = null;
    this.turnCount = 0;

    // ── Core Systems ──────────────────────────────────────────
    this.map = null;
    this.simulation = null;
    this.ui = null;
    this.eventsPanel = null;
    this.interviewPanel = null;
    this.techPanel    = null;
    this.societyPanel        = null;
    this.sustainabilityPanel = null;
    this.paradigmShiftsPanel = null;
    this.researchPanel       = null;  // Pass 9: lazy-initialized on first open

    // ── Civilizations ─────────────────────────────────────────
    this.civilizations = [];

    // ── Settings ──────────────────────────────────────────────
    this.settings = this._loadSettings();

    // ── Callbacks ─────────────────────────────────────────────
    this.onEraTransition = null;
    this.onWorldEvent = null;
  }

  // ── Initialization ────────────────────────────────────────────
  init() {
    // Initialize UI
    this.ui = new UIManager(this);
    this.ui.showTitle();
    this._bindTitleButtons();
    this._bindTitleLanguage();
  }

  _bindTitleLanguage() {
    const sel = Utils.el('title-language-select');
    if (!sel) return;
    // Reflect saved language and apply on load
    sel.value = this.settings.language || 'en';
    if (typeof I18N !== 'undefined') {
      I18N.setLanguage(sel.value);
      this._applyTitleLanguage();
    }
    sel.onchange = () => {
      this.settings.language = sel.value;
      if (typeof I18N !== 'undefined') {
        I18N.setLanguage(sel.value);
        this._applyTitleLanguage();
      }
      localStorage.setItem('civSimSettings', JSON.stringify(this.settings));
    };
  }

  _applyTitleLanguage() {
    if (typeof I18N === 'undefined') return;
    const subtitle = Utils.el('title-subtitle');
    const note     = Utils.el('title-note');
    const newGame  = Utils.el('btn-new-game');
    const cont     = Utils.el('btn-continue');
    if (subtitle) subtitle.textContent = I18N.t('titleSubtitle');
    if (note)     note.textContent     = I18N.t('titleNote');
    if (newGame)  newGame.textContent  = I18N.t('btnNewGame');
    if (cont && cont.style.display !== 'none') cont.textContent = I18N.t('btnContinue');
  }

  _bindTitleButtons() {
    const newGameBtn = Utils.el('btn-new-game');
    if (newGameBtn) newGameBtn.onclick = () => this.ui.showSetup();

    const continueBtn = Utils.el('btn-continue');
    if (continueBtn) {
      const hasSave = localStorage.getItem('civSimSave');
      if (hasSave) {
        continueBtn.style.display = '';
        continueBtn.onclick = () => this.loadGame();
      } else {
        continueBtn.style.display = 'none';
      }
    }
  }

  // ── Game Start ────────────────────────────────────────────────
  startGame(setupData) {
    this.currentYear = setupData.startYear || -3000;
    this.yearsDelta = this.settings.yearsPerTurn || 10;
    this.currentEra = Utils.getEra(this.currentYear);
    this.civilizations = [];
    this.turnCount = 0;

    // ── Research Seed + Seeded PRNG ─────────────────────────
    // Seeds the deterministic PRNG for full run reproducibility.
    // Same seed + same parameters = identical trajectory.
    const providedSeed = setupData.researchSeed ? parseInt(setupData.researchSeed) : null;
    const rawSeed = providedSeed ?? ((Date.now() ^ (Math.random() * 0xFFFFFFFF | 0)) >>> 0);
    this.researchSeed = String(rawSeed).padStart(10, '0');
    Utils.seedRNG(rawSeed);

    // ── Create Map ───────────────────────────────────────────
    this.map = new HexMap(CONFIG.MAP_COLS, CONFIG.MAP_ROWS, CONFIG.HEX_SIZE);
    // Apply world climate bias from setup wizard
    if (setupData.worldClimate) {
      this.map.climateBias = {
        warmth:   setupData.worldClimate.warmth   ?? 0,
        moisture: setupData.worldClimate.moisture ?? 0,
      };
    }
    this.map.generate();

    // Attach canvas
    const canvas = Utils.el('map-canvas');
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth - 320;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight - 120;
      this.map.attachCanvas(canvas);

      // Tile click → select civ
      this.map.onTileSelect = (tile) => {
        if (tile && tile.civId) {
          const civ = this.civilizations.find(c => c.id === tile.civId);
          if (civ) {
            const panel = Utils.el('civ-panel');
            if (panel) panel.dataset.selectedCiv = civ.id;
          }
        }
        this._updateTileInfoPanel(tile);
      };
    }

    // ── Create Player Civilization ───────────────────────────
    console.log('[CivSim] startGame — setupData.economic.model:', setupData.economic?.model,
      '| governance.model:', setupData.governance?.model);
    console.log('[CivSim] startGame — society:', JSON.stringify(setupData.society));
    console.log('[CivSim] startGame — societyFamily:', JSON.stringify(setupData.societyFamily));
    console.log('[CivSim] startGame — societyHealth:', JSON.stringify(setupData.societyHealth));
    const playerCiv = new Civilization({
      name: setupData.civName || 'Your Civilization',
      color: setupData.civColor || CIV_COLORS[0],
      isPlayerCiv: true,
      playerRole: setupData.playerRole,
      foundingYear: this.currentYear,
      economic: setupData.economic,
      governance: setupData.governance,
      operatingPrinciples: setupData.operatingPrinciples,
      religion: setupData.religion,
      migration:      setupData.migration,
      slavery:        setupData.slavery,
      organizedCrime: setupData.organizedCrime,
      geography:      setupData.geography,
      society:        setupData.society,
      societyFamily:     setupData.societyFamily,
      societyCulture:    setupData.societyCulture,
      societyHealth:     setupData.societyHealth,
      societyResources:  setupData.societyResources,
      societyInfo:       setupData.societyInfo,
    });

    // Religion manager
    playerCiv.religionManager = new ReligionManager(playerCiv);

    // NPC pool
    playerCiv.npcs = generateNPCPool(playerCiv);

    // Place on map (pass ocean access preference if the player configured it)
    const capital = this.map.placeCapital(playerCiv.id, null, { wantOceanAccess: !!playerCiv.geography?.oceanAccess });
    if (capital) {
      playerCiv.addHistoryEntry(this.currentYear, `${playerCiv.name} Founded`, `A new civilization begins at the ${capital.terrain.label ?? 'unknown terrain'}.`, 'founding');
    }

    this.civilizations.push(playerCiv);

    // ── Create AI Civilizations ───────────────────────────────
    const aiCount = setupData.aiCivCount !== undefined ? setupData.aiCivCount : 3;
    const presetKeys = Object.keys(CIVILIZATION_PRESETS);
    const usedPresets = new Set();

    for (let i = 0; i < aiCount; i++) {
      const presetKey = presetKeys.find(k => !usedPresets.has(k)) || Utils.randChoice(presetKeys);
      usedPresets.add(presetKey);
      const preset = CIVILIZATION_PRESETS[presetKey];

      const aiCiv = new Civilization({
        name: this._generateCivName(i),
        color: CIV_COLORS[(i + 1) % CIV_COLORS.length],
        isPlayerCiv: false,
        playerRole: null,
        foundingYear: this.currentYear,
        economic: preset.economic,
        governance: preset.governance,
        operatingPrinciples: preset.operatingPrinciples,
        religion: preset.religion,
      });

      aiCiv.religionManager = new ReligionManager(aiCiv);
      aiCiv.npcs = generateNPCPool(aiCiv);

      const aiCapital = this.map.placeCapital(aiCiv.id);
      if (aiCapital) {
        aiCiv.addHistoryEntry(this.currentYear, `${aiCiv.name} Founded`, `A civilization rises.`, 'founding');
      }

      this.civilizations.push(aiCiv);
    }

    // ── Simulation Engine ─────────────────────────────────────
    this.simulation = new SimulationEngine(this);

    // ── Pass 9: Initialize cultural homogeneity for all civs ──
    for (const civ of this.civilizations) {
      this.simulation._initCulturalHomogeneity(civ);
    }

    // ── Sub-panels ────────────────────────────────────────────
    this.eventsPanel   = new EventsPanel(this);
    this.interviewPanel = new InterviewPanel(this);
    this.techPanel     = new TechPanel(this);
    this.societyPanel        = new SocietyPanel(this);
    this.sustainabilityPanel = new SustainabilityPanel(this);
    this.paradigmShiftsPanel = new ParadigmShiftsPanel(this);

    // ── Callbacks ─────────────────────────────────────────────
    this.onEraTransition = (era) => {
      this.ui.showNotification(`🌅 New Era: ${era.label}`);
    };

    this.onWorldEvent = (event) => {
      this.ui.showNotification(`⚡ ${event.title}: ${event.description.slice(0, 60)}...`);
    };

    // ── Scenario tracking ─────────────────────────────────────
    this._activeScenarioId = null;
    if (setupData.scenarioName || setupData._scenarioId) {
      this._activeScenarioId = this.saveScenario(setupData);
    }

    // ── Show Game Screen ──────────────────────────────────────
    this.ui.showGame();
    this._bindGameControls();

    // ── Initial Render ────────────────────────────────────────
    this.map.render(this.civilizations, this.currentYear);
    this.ui.renderHUD();

    // ── Ollama auto-detection (silent, only if Ollama is selected provider) ──
    if (this.settings?.apiProvider === 'ollama') {
      this._detectOllama(false);
    }
  }

  _generateCivName(index) {
    const prefixes = ['Northern', 'Southern', 'Eastern', 'Western', 'Inner', 'Free', 'United', 'Ancient'];
    const names = ['Accord', 'Collective', 'Alliance', 'Union', 'Assembly', 'Circle', 'Commonwealth', 'Federation'];
    return `${Utils.randChoice(prefixes)} ${Utils.randChoice(names)}`;
  }

  // ── Game Controls ─────────────────────────────────────────────
  _bindGameControls() {
    // Next Turn
    const nextTurnBtn = Utils.el('btn-next-turn');
    if (nextTurnBtn) nextTurnBtn.onclick = () => this.nextTurn();

    // Auto-play
    const autoBtn = Utils.el('btn-auto-play');
    if (autoBtn) autoBtn.onclick = () => this.toggleAutoPlay();

    // Events
    const eventsBtn = Utils.el('btn-events');
    if (eventsBtn) eventsBtn.onclick = () => {
      const panel = Utils.el('events-panel');
      if (panel) {
        if (panel.style.display === 'none' || !panel.style.display) {
          this.eventsPanel.show();
        } else {
          this.eventsPanel.hide();
          panel.style.display = 'none';
        }
      }
    };

    // Interview
    const interviewBtn = Utils.el('btn-interview');
    if (interviewBtn) interviewBtn.onclick = () => {
      const panel = Utils.el('interview-panel');
      if (panel && (panel.style.display === 'none' || !panel.style.display)) {
        this.interviewPanel.show();
      } else if (panel) {
        this.interviewPanel.hide();
      }
    };

    // World State
    const worldBtn = Utils.el('btn-world-state');
    if (worldBtn) worldBtn.onclick = () => this.ui.showWorldState();

    // History
    const histBtn = Utils.el('btn-history');
    if (histBtn) histBtn.onclick = () => this.ui.showHistory();

    // Social Stratification
    const strataBtn = Utils.el('btn-stratification');
    if (strataBtn) strataBtn.onclick = () => {
      const panel = Utils.el('stratification-panel');
      if (panel && panel.style.display !== 'none') this.ui.hideStratificationPanel();
      else this.ui.showStratificationPanel();
    };

    // Notification log
    const notifLogBtn = Utils.el('btn-notif-log');
    if (notifLogBtn) notifLogBtn.onclick = () => {
      const panel = Utils.el('notification-log-panel');
      if (panel && panel.style.display !== 'none') this.ui.hideNotifLog();
      else this.ui.showNotifLog();
    };

    // Settings
    const settingsBtn = Utils.el('btn-settings');
    if (settingsBtn) settingsBtn.onclick = () => this.ui.showSettings();

    // Save
    const saveBtn = Utils.el('btn-save');
    if (saveBtn) saveBtn.onclick = () => this.saveGame();

    // Map overlay
    const overlaySelect = Utils.el('overlay-select');
    if (overlaySelect) {
      overlaySelect.onchange = () => {
        this.map.setOverlayMode(overlaySelect.value);
      };
    }

    // Technology panel toggle
    const techBtn = Utils.el('btn-technology');
    if (techBtn) {
      techBtn.onclick = () => {
        this.techPanel.toggle();
        techBtn.classList.toggle('btn-map-active', this.techPanel.visible);
      };
    }

    // Society panel toggle
    const societyBtn = Utils.el('btn-society');
    if (societyBtn) {
      societyBtn.onclick = () => {
        this.societyPanel.toggle();
        societyBtn.classList.toggle('btn-map-active', this.societyPanel.visible);
      };
    }

    // Sustainability panel toggle
    const sustainBtn = Utils.el('btn-sustainability');
    if (sustainBtn) {
      sustainBtn.onclick = () => {
        this.sustainabilityPanel.toggle();
        sustainBtn.classList.toggle('btn-map-active', this.sustainabilityPanel.visible);
      };
    }

    // Paradigm Shifts panel toggle (Pass 7)
    const paradigmBtn = Utils.el('btn-paradigm');
    if (paradigmBtn) {
      paradigmBtn.onclick = () => {
        this.paradigmShiftsPanel.toggle();
        paradigmBtn.classList.toggle('btn-map-active', this.paradigmShiftsPanel.visible);
      };
    }

    // ── Pass 9: Research Panel ─────────────────────────────────
    const researchBtn = Utils.el('btn-research');
    if (researchBtn) {
      researchBtn.onclick = () => {
        // Lazy-initialize on first open
        if (!this.researchPanel) {
          this.researchPanel = new ResearchPanel(this);
        }
        this.researchPanel.toggle();
        researchBtn.classList.toggle('btn-map-active', this.researchPanel.visible);
      };
    }

    // Map view toggle (⬡ Hex ↔ 🗺️ Map)
    const mapViewBtn = Utils.el('btn-map-view');
    if (mapViewBtn) {
      mapViewBtn.onclick = () => {
        this.map.toggleViewMode();
        const isMap = this.map.viewMode === 'map';
        mapViewBtn.textContent = isMap ? '⬡ Hex' : '🗺️ Map';
        mapViewBtn.classList.toggle('btn-map-active', isMap);
      };
    }

    // Target civ selector (for events)
    this._buildTargetCivSelector();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.nextTurn(); }
      if (e.key === 'i') this.interviewPanel.show();
      if (e.key === 'e') {
        const panel = Utils.el('events-panel');
        if (panel && panel.style.display !== 'none') { this.eventsPanel.hide(); panel.style.display = 'none'; }
        else this.eventsPanel.show();
      }
      if (e.key === 'h') this.ui.showHistory();
      if (e.key === 'w') this.ui.showWorldState();
      if (e.key === 'p') {
        const panel = Utils.el('stratification-panel');
        if (panel && panel.style.display !== 'none') this.ui.hideStratificationPanel();
        else this.ui.showStratificationPanel();
      }
      if (e.key === 'n') {
        const panel = Utils.el('notification-log-panel');
        if (panel && panel.style.display !== 'none') this.ui.hideNotifLog();
        else this.ui.showNotifLog();
      }
      if (e.key === 'm') {
        const btn = Utils.el('btn-map-view');
        if (btn) btn.click();
      }
      if (e.key === 't') {
        const btn = Utils.el('btn-technology');
        if (btn) btn.click();
      }
      if (e.key === 's') {
        const btn = Utils.el('btn-society');
        if (btn) btn.click();
      }
      if (e.key === 'P') { // Shift+P — Paradigm Shifts panel
        const btn = Utils.el('btn-paradigm');
        if (btn) btn.click();
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      const canvas = Utils.el('map-canvas');
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    });
  }

  _buildTargetCivSelector() {
    const sel = Utils.el('target-civ-selector');
    if (!sel) return;
    const allLabel = (typeof I18N !== 'undefined') ? I18N.t('btn_target_all') : 'All Civs';
    sel.innerHTML = `<option value="all">${allLabel}</option>`;
    const playerOpt = document.createElement('option');
    playerOpt.value = 'player'; playerOpt.textContent = (typeof I18N !== 'undefined') ? I18N.t('btn_your_civ') : 'Your Civilization';
    sel.appendChild(playerOpt);
    for (const civ of this.civilizations) {
      const opt = document.createElement('option');
      opt.value = civ.id;
      opt.textContent = civ.name;
      sel.appendChild(opt);
    }
  }

  // ── Turn Processing ───────────────────────────────────────────
  nextTurn() {
    if (!this.simulation) return;

    this.currentYear += this.yearsDelta;
    this.turnCount++;

    // Clamp
    if (this.currentYear > CONFIG.MAX_YEAR) {
      this.currentYear = CONFIG.MAX_YEAR;
      this.stopAutoPlay();
      this.ui.showNotification(`Maximum year reached: ${CONFIG.MAX_YEAR} AD`);
      return;
    }

    this.simulation.processTurn();

    // Flash notification for notable events
    if (this.turnCount % 10 === 0) this.saveGame();

    this.ui.renderHUD();
  }

  toggleAutoPlay() {
    if (this.autoPlayInterval) {
      this.stopAutoPlay();
    } else {
      this.isRunning = true;
      const btn = Utils.el('btn-auto-play');
      if (btn) { btn.textContent = (typeof I18N !== 'undefined') ? I18N.t('btn_pause') : '⏸ Pause'; btn.classList.add('active'); }
      this.autoPlayInterval = setInterval(() => this.nextTurn(), 800);
    }
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    this.isRunning = false;
    const btn = Utils.el('btn-auto-play');
    if (btn) { btn.textContent = (typeof I18N !== 'undefined') ? I18N.t('btn_auto') : '▶ Auto'; btn.classList.remove('active'); }
  }

  // ── Tile Info ─────────────────────────────────────────────────
  _updateTileInfoPanel(tile) {
    const panel = Utils.el('tile-info');
    if (!panel) return;
    if (!tile) { panel.innerHTML = ''; return; }

    const info = this.map.getTileInfo(tile);
    const civ = tile.civId ? this.civilizations.find(c => c.id === tile.civId) : null;
    panel.innerHTML = `
      <div class="tile-terrain">${info.terrain}${tile.isCapital ? ' ★ Capital' : ''}</div>
      ${info.resource !== 'None' ? `<div class="tile-resource">📦 ${info.resource}</div>` : ''}
      <div class="tile-fertility">🌾 Fertility: ${info.fertility}</div>
      ${civ ? `<div class="tile-civ" style="color:${civ.color}">🏛️ ${civ.name}</div>` : '<div class="tile-civ">Unclaimed</div>'}
    `;
  }

  // ── Save / Load ───────────────────────────────────────────────
  saveGame() {
    try {
      const save = {
        version: 1,
        researchSeed: this.researchSeed,
        currentYear: this.currentYear,
        yearsDelta: this.yearsDelta,
        turnCount: this.turnCount,
        warmingIndex: this.simulation?.globalWarmingIndex || 0,
        atmosphericCO2: this.simulation?.atmosphericCO2 || 0,
        surfaceTemp: this.simulation?.surfaceTemp || 0,
        deepOceanTemp: this.simulation?.deepOceanTemp || 0,
        tippingPermafrost: this.simulation?._tippingPermafrost || false,
        tippingIceSheets: this.simulation?._tippingIceSheets || false,
        tippingAMOC: this.simulation?._tippingAMOC || false,
        tippingHothouse: this.simulation?._tippingHothouse || false,
        civilizations: this.civilizations.map(civ => ({
          id: civ.id,
          name: civ.name,
          color: civ.color,
          isPlayerCiv: civ.isPlayerCiv,
          playerRole: civ.playerRole,
          foundingYear: civ.foundingYear,
          economic: {
            modelId: civ.economic.modelId,
            scarcityOrientation: civ.economic.scarcityOrientation,
            accumulationAllowed: civ.economic.accumulationAllowed,
            wealthConcentration: civ.economic.wealthConcentration,
            laborShare: civ.economic.laborShare,
          },
          governance: {
            modelId: civ.governance.modelId,
            hierarchyLevel: civ.governance.hierarchyLevel,
            powerConcentration: civ.governance.powerConcentration,
            participationModel: civ.governance.participationModel,
            corruptionLevel: civ.governance.corruptionLevel,
            inheritanceSystem: civ.governance.inheritanceSystem,
          },
          operatingPrinciples: civ.operatingPrinciples,
          religion: {
            presence: civ.religion.presence,
            stateRelationship: civ.religion.stateRelationship,
          },
          state: civ.state,
          history: civ.history.slice(-50), // last 50 events
          movements: civ.movements,
          migration: civ.migration,
          slavery: civ.slavery,
          organizedCrime: civ.organizedCrime,
          geography: civ.geography,
        })),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('civSimSave', JSON.stringify(save));
    } catch (e) {
      console.warn('Could not save game:', e);
    }
  }

  loadGame() {
    const saveStr = localStorage.getItem('civSimSave');
    if (!saveStr) return false;

    try {
      const save = JSON.parse(saveStr);
      const playerCivData = save.civilizations.find(c => c.isPlayerCiv);
      if (!playerCivData) return false;

      // Reconstruct setup data from save
      const setupData = {
        startYear: save.currentYear,
        playerRole: playerCivData.playerRole,
        civName: playerCivData.name,
        civColor: playerCivData.color,
        economic: { model: playerCivData.economic.modelId, ...playerCivData.economic },
        governance: { model: playerCivData.governance.modelId, ...playerCivData.governance },
        operatingPrinciples: playerCivData.operatingPrinciples,
        religion: playerCivData.religion,
        aiCivCount: save.civilizations.filter(c => !c.isPlayerCiv).length,
        migration: playerCivData.migration,
        slavery: playerCivData.slavery,
        organizedCrime: playerCivData.organizedCrime,
        geography: playerCivData.geography,
      };

      // Pass saved seed so startGame uses it
      if (save.researchSeed) setupData.researchSeed = save.researchSeed;
      this.startGame(setupData);

      // Re-seed PRNG to deterministic state for this turn count
      if (save.researchSeed) {
        const seedInt = parseInt(save.researchSeed) || 0;
        Utils.seedRNG(seedInt + (save.turnCount || 0));
      }

      // Restore state
      this.currentYear = save.currentYear;
      this.turnCount = save.turnCount || 0;
      if (this.simulation) {
        this.simulation.globalWarmingIndex = save.warmingIndex || 0;
        this.simulation.atmosphericCO2 = save.atmosphericCO2 || 0;
        this.simulation.surfaceTemp = save.surfaceTemp || 0;
        this.simulation.deepOceanTemp = save.deepOceanTemp || 0;
        this.simulation._tippingPermafrost = save.tippingPermafrost || false;
        this.simulation._tippingIceSheets = save.tippingIceSheets || false;
        this.simulation._tippingAMOC = save.tippingAMOC || false;
        this.simulation._tippingHothouse = save.tippingHothouse || false;
      }

      this.ui.showNotification(`Game loaded (${Utils.formatYear(this.currentYear)})`);
      return true;
    } catch (e) {
      console.warn('Could not load game:', e);
      return false;
    }
  }

  // ── Scenario Management ───────────────────────────────────────

  /** Load all saved scenarios from localStorage. */
  loadScenarios() {
    try {
      return JSON.parse(localStorage.getItem('civSimScenarios') || '[]');
    } catch { return []; }
  }

  _saveScenarios(scenarios) {
    localStorage.setItem('civSimScenarios', JSON.stringify(scenarios));
  }

  /**
   * Create a new scenario (if scenarioName is set and _scenarioId is absent)
   * or add a new run to an existing scenario (if _scenarioId is set).
   * Returns the scenario id.
   */
  saveScenario(setupData) {
    const scenarios = this.loadScenarios();
    const isRerun = !!setupData._scenarioId;
    const id = setupData._scenarioId ||
      ('sc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));

    // Strip runtime-only fields from stored params
    const params = { ...setupData };
    delete params._scenarioId;
    delete params._scenarioName;
    delete params._scenarioRunLabel;

    const existing = scenarios.find(s => s.id === id);

    if (isRerun && existing) {
      // Append a new run with auto-computed param diff
      existing.runs = existing.runs || [];
      const runLabel = setupData._scenarioRunLabel ||
        `Run ${existing.runs.length + 1}`;
      const paramOverrides = this._diffParams(existing.startingParams, params);
      existing.runs.push({
        runId:         'run_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        runLabel,
        startedAt:     new Date().toISOString(),
        completedAt:   null,
        turnCount:     0,
        finalStats:    null,
        paramOverrides,
      });
    } else {
      // Create a brand-new scenario
      const number = scenarios.length > 0
        ? Math.max(...scenarios.map(s => s.number || 0)) + 1
        : 1;
      scenarios.push({
        id,
        name:           setupData.scenarioName || 'Unnamed Scenario',
        number,
        createdAt:      new Date().toISOString(),
        startingParams: params,
        runs: [{
          runId:       'run_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
          runLabel:    setupData._scenarioRunLabel || 'Run 1',
          startedAt:   new Date().toISOString(),
          completedAt: null,
          turnCount:   0,
          finalStats:  null,
          paramOverrides: {},
        }],
      });
    }

    this._saveScenarios(scenarios);
    return id;
  }

  /**
   * Re-open the setup wizard pre-filled with an existing scenario's starting params.
   * The player walks through all steps and can change anything they like.
   */
  loadScenarioForRerun(scenarioId) {
    const scenarios = this.loadScenarios();
    const sc = scenarios.find(s => s.id === scenarioId);
    if (!sc) return;
    // Pre-fill UI with saved params + internal tracking fields
    const prefilledData = {
      ...sc.startingParams,
      _scenarioId:      sc.id,
      _scenarioName:    sc.name,
      scenarioName:     sc.name,   // keep name field populated
      _scenarioRunLabel: '',
    };
    this.ui.startSetupFromScenario(prefilledData);
  }

  /**
   * Snapshot the player civ's current stats and save them as the latest run's finalStats.
   * Called manually from Settings → Scenarios or automatically on game over.
   */
  saveScenarioRun() {
    if (!this._activeScenarioId) return false;
    const playerCiv = this.civilizations.find(c => c.isPlayerCiv);
    if (!playerCiv) return false;

    const scenarios = this.loadScenarios();
    const sc = scenarios.find(s => s.id === this._activeScenarioId);
    if (!sc) return false;
    const run = sc.runs[sc.runs.length - 1];
    if (!run) return false;

    run.completedAt = new Date().toISOString();
    run.turnCount   = this.turnCount || 0;
    run.finalStats  = this._captureFinalStats(playerCiv);

    this._saveScenarios(scenarios);
    return true;
  }

  _captureFinalStats(civ) {
    const s = civ.state;
    const recentEvents = (civ.history || [])
      .slice(-10)
      .map(h => ({ year: h.year, title: h.title, type: h.type }));
    return {
      population:        s.population,
      wellbeing:         Math.round(s.averageWellbeing),
      equality:          Math.round(s.equalityIndex),
      stability:         Math.round(s.stabilityIndex),
      corruption:        Math.round(civ.governance?.corruptionLevel   ?? 0),
      wealthConcentration: Math.round(civ.economic?.wealthConcentration ?? 0),
      techLevel:         civ.techLevel || 0,
      empathy:           Math.round(civ.operatingPrinciples?.empathyLevel   ?? 0),
      cooperation:       Math.round(civ.operatingPrinciples?.cooperationLevel ?? 0),
      majorEvents:       recentEvents,
    };
  }

  /** Deep diff of two setupData objects — returns keys whose values changed. */
  _diffParams(base, current) {
    const overrides = {};
    const allKeys = new Set([...Object.keys(base || {}), ...Object.keys(current || {})]);
    for (const key of allKeys) {
      if (key.startsWith('_')) continue;
      if (JSON.stringify(base[key]) !== JSON.stringify(current[key])) {
        overrides[key] = current[key];
      }
    }
    return overrides;
  }

  /** Delete a saved scenario. */
  deleteScenario(scenarioId) {
    this._saveScenarios(this.loadScenarios().filter(s => s.id !== scenarioId));
  }

  /** Generate and trigger a CSV download for one scenario's run comparison. */
  exportScenarioCSV(scenarioId) {
    const sc = this.loadScenarios().find(s => s.id === scenarioId);
    if (!sc || !sc.runs?.length) return;

    const headers = [
      'Scenario', 'Run', 'TurnCount',
      'Population', 'Wellbeing', 'Equality', 'Stability',
      'Corruption', 'WealthConc', 'TechLevel', 'Empathy', 'Cooperation',
      'MajorEvents', 'ParamOverrides',
    ];
    const rows = sc.runs.map(r => {
      const fs = r.finalStats || {};
      const events = (fs.majorEvents || []).map(e => e.title).join('; ');
      const overrides = JSON.stringify(r.paramOverrides || {}).replace(/"/g, '""');
      return [
        `"${sc.name}"`,
        `"${r.runLabel}"`,
        r.turnCount || 0,
        fs.population || '',
        fs.wellbeing  || '',
        fs.equality   || '',
        fs.stability  || '',
        fs.corruption || '',
        fs.wealthConcentration || '',
        fs.techLevel  || '',
        fs.empathy    || '',
        fs.cooperation || '',
        `"${events}"`,
        `"${overrides}"`,
      ].join(',');
    });

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `scenario-${sc.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Settings ──────────────────────────────────────────────────
  _loadSettings() {
    const defaults = {
      apiKey:          '',
      apiProvider:     'none',    // 'none'|'ollama'|'groq'|'gemini'|'anthropic'|'openai'
      apiModel:        '',
      ollamaUrl:       'http://localhost:11434',
      ollamaDetected:  false,     // runtime only — not persisted
      yearsPerTurn:    10,
      overlayMode:     'terrain',
      language:        'en',
    };
    try {
      const stored = localStorage.getItem('civSimSettings');
      const settings = stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
      // ollamaDetected is never persisted — always start false
      settings.ollamaDetected = false;
      // Migrate old saves that used 'anthropic' as the default even with no key
      if (!settings.apiKey && settings.apiProvider === 'anthropic') settings.apiProvider = 'none';
      if (typeof I18N !== 'undefined') I18N.setLanguage(settings.language || 'en');
      return settings;
    } catch {
      return defaults;
    }
  }

  /**
   * Silently probe for a running Ollama instance.
   * Called once after game init and can be re-triggered from Settings.
   * Returns true if detected, false otherwise.
   */
  async _detectOllama(quiet = true) {
    const url = this.settings.ollamaUrl || 'http://localhost:11434';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await Utils.llmFetch(`${url}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        this.settings.ollamaDetected = true;
        // Store available model names for display in settings
        this.settings.ollamaModels = (data.models || []).map(m => m.name || m.model || String(m));
        if (!quiet && (!this.settings.apiKey && this.settings.apiProvider === 'none')) {
          this.ui?.showNotification('🦙 Ollama detected! Enable it in ⚙️ Settings for free local LLM responses.');
        }
        return true;
      }
    } catch {
      // Not running — silent
    }
    this.settings.ollamaDetected = false;
    this.settings.ollamaModels = [];
    return false;
  }
}

// ── Bootstrap ─────────────────────────────────────────────────
let game;
window.addEventListener('DOMContentLoaded', async () => {
  // First-run setup wizard for LLM configuration
  if (SetupAssistant.needsSetup()) {
    await SetupAssistant.show();
  }
  game = new Game();
  game.init();
});
