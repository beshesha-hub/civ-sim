/**
 * sustainability_panel.js — Resource Management & Sustainability Panel
 * Keyboard shortcut: r   |   Button: 🌿 Sustainability
 * Four tabs: Resources | Strategy | Obsolescence | Export
 */

class SustainabilityPanel {
  constructor(game) {
    this.game      = game;
    this.visible   = false;
    this.activeTab = 'resources'; // 'resources'|'strategy'|'obsolescence'|'export'
  }

  // ── Visibility ──────────────────────────────────────────────
  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('sustainability-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('sustainability-panel'));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  // ── Helpers ──────────────────────────────────────────────────
  _civ() {
    return this.game?.civilizations?.find(c => c.isPlayerCiv) ?? this.game?.civilizations?.[0] ?? null;
  }

  _applyEvent(type, extra = {}) {
    const civ = this._civ();
    if (!civ) return;
    this.game.simulation?.applyExternalEvent({ type, ...extra }, [civ.id]);
    this.render();
  }

  _bar(labelText, value, maxVal = 100, colorClass = '') {
    const wrap  = Utils.createEl('div', 'society-stat-bar-wrap');
    const label = Utils.createEl('span', 'society-stat-label', labelText);
    const track = Utils.createEl('div', 'society-stat-track');
    const fill  = Utils.createEl('div', `society-stat-bar ${colorClass}`);
    fill.style.width = Math.max(0, Math.min(100, (value / maxVal) * 100)).toFixed(1) + '%';
    const val = Utils.createEl('span', 'society-stat-val', `${Math.round(value)}`);
    track.appendChild(fill);
    wrap.appendChild(label);
    wrap.appendChild(track);
    wrap.appendChild(val);
    return wrap;
  }

  _resourceColor(v, isHighBad = false) {
    // For resources (forests/soil/minerals/water): low = bad
    // For pollution/waste: high = bad
    if (isHighBad) {
      if (v > 65) return 'bar-red';
      if (v > 35) return 'bar-amber';
      return 'bar-green';
    } else {
      if (v < 30) return 'bar-red';
      if (v < 60) return 'bar-amber';
      return 'bar-green';
    }
  }

  // ── Root Render ──────────────────────────────────────────────
  render() {
    const panel = Utils.el('sustainability-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', '', '🌿 Sustainability');
    title.style.margin = '0';
    titleWrap.appendChild(title);
    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => {
      this.hide();
      Utils.el('btn-sustainability')?.classList.remove('btn-map-active');
    };
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', 'panel-tabs');
    [
      { id: 'resources',    label: '⛏️ Resources' },
      { id: 'energy',       label: '⚡ Energy' },
      { id: 'strategy',     label: '🌿 Strategy' },
      { id: 'obsolescence', label: '🔄 Obsolescence' },
      { id: 'export',       label: '📊 Export' },
    ].forEach(({ id, label }) => {
      const btn = Utils.createEl('button', 'tab-btn' + (this.activeTab === id ? ' active' : ''), label);
      btn.onclick = () => { this.activeTab = id; this.render(); };
      tabs.appendChild(btn);
    });
    panel.appendChild(tabs);

    // Content
    const content = Utils.createEl('div', 'panel-content');
    panel.appendChild(content);

    const civ = this._civ();
    if (!civ) {
      content.textContent = 'No civilization active.';
      return;
    }

    if      (this.activeTab === 'resources')    this._renderResources(content, civ);
    else if (this.activeTab === 'energy')       this._renderEnergy(content, civ);
    else if (this.activeTab === 'strategy')     this._renderStrategy(content, civ);
    else if (this.activeTab === 'obsolescence') this._renderObsolescence(content, civ);
    else if (this.activeTab === 'export')       this._renderExport(content, civ);
  }

  // ═══════════════════════════════════════════════════════════
  // ⛏️ Resources Tab
  // ═══════════════════════════════════════════════════════════
  _renderResources(c, civ) {
    const s   = civ.state;
    const dep = s.resourceDepletion ?? {};

    // ── Current Resource Bars ──
    const hdr1 = Utils.createEl('div', 'society-section-hdr', 'Current Resource Status');
    c.appendChild(hdr1);

    const barsNote = Utils.createEl('p', 'society-help-text');
    barsNote.textContent = 'Natural resources, pollution, and waste levels. Resources below 30 or pollution/waste above 65 risk triggering crisis events.';
    c.appendChild(barsNote);

    const forests   = dep.forests      ?? 100;
    const soil      = dep.soil         ?? 100;
    const minerals  = dep.minerals     ?? 100;
    const water     = dep.water        ?? 100;
    const pollution = s.pollutionIndex    ?? 0;
    const waste     = s.wasteAccumulation ?? 0;

    c.appendChild(this._bar('🌲 Forests',   forests,   100, this._resourceColor(forests)));
    c.appendChild(this._bar('🌾 Soil',      soil,      100, this._resourceColor(soil)));
    c.appendChild(this._bar('⛏️ Minerals',  minerals,  100, this._resourceColor(minerals)));
    c.appendChild(this._bar('💧 Water',     water,     100, this._resourceColor(water)));
    c.appendChild(this._bar('🏭 Pollution', pollution, 100, this._resourceColor(pollution, true)));
    c.appendChild(this._bar('🗑️ Waste',    waste,     100, this._resourceColor(waste, true)));

    // Crisis threshold offset note
    const offset = s._resourceCrisisOffset ?? 0;
    if (offset !== 0) {
      const offsetNote = Utils.createEl('p', 'society-help-text');
      offsetNote.textContent = `Resource strategy shifts crisis thresholds by ${offset > 0 ? '+' : ''}${offset} points (${offset > 0 ? 'more resilient — crises trigger later' : 'more vulnerable — crises trigger sooner'}).`;
      c.appendChild(offsetNote);
    }

    // Active multipliers
    const hdr2 = Utils.createEl('div', 'society-section-hdr', 'Active Multipliers');
    c.appendChild(hdr2);

    const depMod = s._resourceDepletionMod ?? 1.0;
    const polMod = s._pollutionMod         ?? 1.0;
    const wstMod = s._wasteMod             ?? 1.0;

    const mults = Utils.createEl('div', 'resource-multipliers-box');
    mults.innerHTML = `
      <span class="${depMod < 1 ? 'pct-green' : depMod > 1 ? 'pct-red' : ''}">Depletion ×${depMod.toFixed(2)}</span>&nbsp;&nbsp;
      <span class="${polMod < 1 ? 'pct-green' : polMod > 1 ? 'pct-red' : ''}">Pollution ×${polMod.toFixed(2)}</span>&nbsp;&nbsp;
      <span class="${wstMod < 1 ? 'pct-green' : wstMod > 1 ? 'pct-red' : ''}">Waste ×${wstMod.toFixed(2)}</span>
    `;
    c.appendChild(mults);

    // ── Ecological Capacity / Overshoot ──
    const capacity = Math.round(s.ecologicalCapacity ?? 100);
    const overshootRatio = s.overshootRatio ?? 0.5;
    const overshootTurns = s.overshootTurns ?? 0;

    const capHdr = Utils.createEl('div', 'society-section-hdr', 'Ecological Capacity & Overshoot');
    c.appendChild(capHdr);

    const capHelp = Utils.createEl('p', 'society-help-text');
    capHelp.textContent = 'Ecological capacity is derived from resource health, pollution, technology, and infrastructure. When demand exceeds capacity (ratio > 1.0), the civilization is in overshoot — resource depletion accelerates and cascading failures begin.';
    c.appendChild(capHelp);

    const capColor = capacity > 60 ? 'bar-green' : capacity > 30 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Ecological Capacity', capacity, 120, capColor));

    const overshootPct = Math.round(overshootRatio * 100);
    const overshootColor = overshootRatio <= 0.8 ? 'bar-green' : overshootRatio <= 1.0 ? 'bar-amber' : 'bar-red';
    const overshootNote = overshootRatio > 1.0 ? `OVERSHOOT: ${overshootRatio.toFixed(2)}x capacity` : `${overshootRatio.toFixed(2)}x capacity — within limits`;
    c.appendChild(this._bar('Demand / Capacity', overshootPct, 200, overshootColor));
    const overshootLabel = Utils.createEl('div', 'resource-multipliers-box');
    overshootLabel.textContent = overshootNote;
    overshootLabel.style.color = overshootRatio > 1 ? '#ef4444' : '#22c55e';
    c.appendChild(overshootLabel);

    // Infrastructure cross-reference (infrastructure affects ecological capacity)
    const infra = Math.round(s.infrastructureLevel ?? 35);
    const mdebt = Math.round(s.maintenanceDebt ?? 0);
    const infraColor = infra > 60 ? 'bar-green' : infra > 30 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Infrastructure Level', infra, 100, infraColor));
    const debtColor = mdebt > 50 ? 'bar-red' : mdebt > 20 ? 'bar-amber' : mdebt > 0 ? '' : 'bar-green';
    c.appendChild(this._bar('Maintenance Debt', mdebt, 100, debtColor));
    const infraNote = Utils.createEl('p', 'society-help-text');
    infraNote.textContent = 'Infrastructure boosts ecological capacity (up to +15) and trade. Maintenance debt compounds nonlinearly. Full controls are in Society > Institutions.';
    c.appendChild(infraNote);

    if (overshootTurns > 10) {
      const overshootAlert = Utils.createEl('div', 'society-alert',
        `In overshoot for ${overshootTurns} consecutive turns. Cascading resource failure risk increasing.`);
      c.appendChild(overshootAlert);
    }
    if (overshootTurns > 20 && overshootRatio > 1.5) {
      const collapseAlert = Utils.createEl('div', 'society-alert',
        'Severe overshoot — civilizational simplification pressure active. Technology loss and population decline possible.');
      c.appendChild(collapseAlert);
    }

    // ── Food Security ──────────────────────────────────────────
    const foodSecHdr = Utils.createEl('div', 'society-section-hdr', 'Food Security');
    c.appendChild(foodSecHdr);
    const foodSecHelp = Utils.createEl('p', 'society-help-text');
    foodSecHelp.textContent = 'Ability to feed the population. Derived from soil health, water access, agricultural technology, trade, and climate. Low food security triggers instability, migration, and famine risk. Food price spikes are empirically correlated with revolution (e.g. Arab Spring).';
    c.appendChild(foodSecHelp);

    const foodSec = Math.round(s.foodSecurity ?? 60);
    const foodColor = foodSec > 60 ? 'bar-green' : foodSec > 30 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Food Security', foodSec, 100, foodColor,
      foodSec < 15 ? 'FAMINE RISK — population decline and trauma accumulating' :
      foodSec < 30 ? 'Food crisis — stability eroding, unrest rising' :
      foodSec > 70 ? 'Food secure — population growth and wellbeing boosted' : ''));

    // Food security driver list
    const foodDrivers = [];
    const soilFs = Math.round(dep.soil ?? 100);
    const waterFs = Math.round(dep.water ?? 100);
    const techFs = s.technologyLevel ?? 1;
    const tradeFs = s.tradeDependency ?? 20;
    const urbanFs = s.urbanizationRate ?? 15;
    foodDrivers.push(`Soil health (${soilFs}): contributes ${(soilFs * 0.35).toFixed(0)} pts`);
    foodDrivers.push(`Water access (${waterFs}): contributes ${(waterFs * 0.25).toFixed(0)} pts`);
    foodDrivers.push(`Agricultural tech (level ${techFs}): +${Math.min(techFs * 8, 40)} pts`);
    if (tradeFs > 40) foodDrivers.push(`Trade imports (dep ${Math.round(tradeFs)}): +10 pts`);
    if (urbanFs > 60) foodDrivers.push(`High urbanization (${Math.round(urbanFs)}): -${((urbanFs - 60) * 0.3).toFixed(1)} pts`);
    if ((s.atWar ?? false) || (s.warTurns ?? 0) > 0) foodDrivers.push('War disruption: -15 pts');
    const foodDrvList = Utils.createEl('div', 'society-effects-list');
    foodDrivers.forEach(d => foodDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
    c.appendChild(foodDrvList);

    if (foodSec < 15) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        `Famine conditions active for ${s._lowFoodTurns ?? 0} turns. Population decline, wellbeing collapse, and intergenerational trauma accumulating.`));
    }

    // Synergy warning
    if ((s.resourceStrategy === 'extraction_growth') && (s.obsolescenceModel === 'market_driven')) {
      const synWarn = Utils.createEl('div', 'obsolescence-synergy-warn');
      synWarn.textContent = '⚠️ Extraction-for-growth + planned obsolescence: combined depletion ×2.0, waste ×2.5. Environmental crises will trigger significantly faster than with either setting alone.';
      c.appendChild(synWarn);
    }

    // ── Environmental Policy Actions ──
    c.appendChild(Utils.createEl('h3', 'society-section-title', 'Environmental Policy'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Active measures to address ecological damage. Effectiveness scales with institutional quality and state capacity. Economic costs apply.'));

    const envBtnWrap = Utils.createEl('div', 'society-btn-row');

    // Reforestation Program button
    const reforestBtn = Utils.createEl('button', 'btn btn-secondary',
      '🌲 Reforestation Program (+8 Forests)');
    reforestBtn.title = 'Launch national reforestation initiative. Requires state capacity > 25. Scales with institutional quality.';
    reforestBtn.onclick = () => this._applyEvent('reforestation_program');
    envBtnWrap.appendChild(reforestBtn);

    // Pollution Control Act button
    const pollCtrlBtn = Utils.createEl('button', 'btn btn-secondary',
      '🏭 Pollution Controls (-10 Pollution)');
    pollCtrlBtn.title = 'Enact pollution standards and emissions controls. Requires tech level ≥ 3.';
    pollCtrlBtn.onclick = () => this._applyEvent('pollution_control_act');
    envBtnWrap.appendChild(pollCtrlBtn);

    // Soil Conservation button
    const soilBtn = Utils.createEl('button', 'btn btn-secondary',
      '🌾 Soil Conservation (+6 Soil)');
    soilBtn.title = 'Implement soil conservation and sustainable agriculture practices. US Dust Bowl response: Soil Conservation Service (1935).';
    soilBtn.onclick = () => this._applyEvent('soil_conservation');
    envBtnWrap.appendChild(soilBtn);

    // Water Management button
    const waterBtn = Utils.createEl('button', 'btn btn-secondary',
      '💧 Water Management (+6 Water)');
    waterBtn.title = 'Invest in watershed protection, aquifer management, and water recycling infrastructure.';
    waterBtn.onclick = () => this._applyEvent('water_management');
    envBtnWrap.appendChild(waterBtn);

    // Green Transition: Voluntary Subsidies (incentive-based, lower risk)
    const greenVolBtn = Utils.createEl('button', 'btn btn-secondary',
      '⚡ Green Subsidies — Voluntary (-5 Poll, +2 WB)');
    greenVolBtn.title = 'Tax credits and subsidies for voluntary adoption of clean energy. Lower impact but no stability risk. Like US Inflation Reduction Act tax credits.';
    greenVolBtn.onclick = () => this._applyEvent('green_subsidies_voluntary');
    envBtnWrap.appendChild(greenVolBtn);

    // Green Transition: Mandate (regulatory, stronger but causes pushback)
    const greenMandBtn = Utils.createEl('button', 'btn btn-secondary',
      '⚖️ Green Mandate (-12 Poll, -2 Stab)');
    greenMandBtn.title = 'Mandatory emissions standards and fossil fuel phase-out deadlines. Stronger effect but causes economic disruption and political pushback. Like EU Green Deal mandates, California ICE ban.';
    greenMandBtn.onclick = () => this._applyEvent('green_mandate');
    envBtnWrap.appendChild(greenMandBtn);

    // Recycling Program
    const recycleBtn = Utils.createEl('button', 'btn btn-secondary',
      '♻️ Recycling Program (-4 Waste, -2 Poll)');
    recycleBtn.title = 'National recycling infrastructure. Saves 700M tonnes CO₂/year globally. Aluminum recycling saves 94% of energy vs virgin. Effect scales with state capacity and tech level.';
    recycleBtn.onclick = () => this._applyEvent('recycling_program');
    envBtnWrap.appendChild(recycleBtn);

    c.appendChild(envBtnWrap);

    // ── New Systems Policy Buttons ──
    const newBtnHdr = Utils.createEl('div', 'society-section-hdr', Utils.createEl('span', '',
      'Additional Policy Actions'));
    c.appendChild(newBtnHdr);
    const newBtnWrap = Utils.createEl('div', 'society-btn-row');

    // Building Code Reform (Feature 1: disaster resilience)
    const buildCodeBtn = Utils.createEl('button', 'btn btn-secondary',
      '🏗️ Building Code Reform (+10 Preparedness)');
    buildCodeBtn.title = 'Modernize building codes and disaster preparedness. Reduces earthquake/tsunami damage. Japan model: strict codes save thousands of lives.';
    buildCodeBtn.onclick = () => this._applyEvent('building_code_reform');
    newBtnWrap.appendChild(buildCodeBtn);

    // Desalination Infrastructure (Feature 9: water conflict)
    const desalBtn = Utils.createEl('button', 'btn btn-secondary',
      '🚰 Desalination Plant (+8 Water)');
    desalBtn.title = 'Build desalination infrastructure. Reduces water scarcity and water conflict risk. Requires tech ≥ 5. Israel/Saudi Arabia model.';
    desalBtn.onclick = () => this._applyEvent('desalination_plant');
    newBtnWrap.appendChild(desalBtn);

    c.appendChild(newBtnWrap);

    // ── Time-Series Chart ──
    const history = s.resourceHistory ?? [];
    if (history.length >= 2) {
      const hdr3 = Utils.createEl('div', 'society-section-hdr', 'Resource History (last 50 turns)');
      c.appendChild(hdr3);

      const chartWrap = Utils.createEl('div', 'sustainability-chart-wrap');
      const canvas = document.createElement('canvas');
      canvas.width  = 560;
      canvas.height = 220;
      chartWrap.appendChild(canvas);
      c.appendChild(chartWrap);

      const series = [
        { label: 'Forests',   color: '#4ade80', points: history.map(h => ({ x: h.turn, y: h.forests   ?? 100 })) },
        { label: 'Soil',      color: '#fbbf24', points: history.map(h => ({ x: h.turn, y: h.soil       ?? 100 })) },
        { label: 'Minerals',  color: '#94a3b8', points: history.map(h => ({ x: h.turn, y: h.minerals   ?? 100 })) },
        { label: 'Water',     color: '#60a5fa', points: history.map(h => ({ x: h.turn, y: h.water      ?? 100 })) },
        { label: 'Pollution', color: '#f87171', points: history.map(h => ({ x: h.turn, y: h.pollution  ?? 0   })) },
        { label: 'Waste',     color: '#fb923c', points: history.map(h => ({ x: h.turn, y: h.waste      ?? 0   })) },
      ];

      requestAnimationFrame(() => {
        ChartUtils.drawLineChart(canvas, series, {
          title: 'Resources & Pollution',
          minY: 0,
          maxY: 100,
          showLegend: true,
          xLabel: 'Turn',
          yLabel: 'Level',
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ⚡ Energy Tab
  // ═══════════════════════════════════════════════════════════
  _renderEnergy(c, civ) {
    const s = civ.state;
    const source = s.energySource ?? 'wood';
    const eroi = s.energyEROI ?? 3;
    const surplus = s.energySurplus ?? (eroi - 5);

    const SOURCE_LABELS = {
      wood: 'Wood / Biomass', coal: 'Coal', oil: 'Oil / Petroleum',
      nuclear: 'Nuclear', renewable: 'Renewable', fusion: 'Fusion',
    };

    // Current energy source
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Energy System'));

    const srcHelp = Utils.createEl('p', 'society-help-text');
    srcHelp.textContent = 'Energy source advances automatically as energy technologies are adopted. EROI (Energy Return on Investment) measures how much useful energy is gained per unit of energy invested in extraction. Higher EROI supports greater civilizational complexity.';
    c.appendChild(srcHelp);

    const srcLabel = Utils.createEl('div', 'resource-multipliers-box');
    srcLabel.innerHTML = `Current source: <strong>${SOURCE_LABELS[source] ?? source}</strong>`;
    c.appendChild(srcLabel);

    // EROI bar
    const eroiColor = eroi > 20 ? 'bar-green' : eroi > 5 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('EROI', eroi, 80, eroiColor));

    // Energy surplus bar (can be negative)
    const surplusDisplay = Math.max(0, surplus);
    const surplusColor = surplus > 10 ? 'bar-green' : surplus > 0 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Energy Surplus', surplusDisplay, 70, surplusColor));

    if (surplus < -5) {
      const deficitNote = Utils.createEl('div', 'society-alert',
        `⚠️ Severe energy deficit: EROI (${eroi.toFixed(1)}) is far below the complexity threshold of 5. Stability and wellbeing are eroding — simplification pressure building.`);
      c.appendChild(deficitNote);
    } else if (surplus < 0) {
      const mildNote = Utils.createEl('div', 'resource-multipliers-box');
      mildNote.textContent = `Energy surplus is marginally negative (${surplus.toFixed(1)}). Pre-industrial civilizations typically operate near this threshold — minor wellbeing pressure but not destabilizing.`;
      mildNote.style.color = '#f59e0b';
      c.appendChild(mildNote);
    } else if (surplus < 5) {
      const lowNote = Utils.createEl('div', 'resource-multipliers-box');
      lowNote.textContent = `Low energy surplus (${surplus.toFixed(1)}). Innovation rate reduced — insufficient energy to support rapid technological advancement.`;
      lowNote.style.color = '#f59e0b';
      c.appendChild(lowNote);
    }

    // EROI reference table
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'EROI by Energy Source'));

    const refHelp = Utils.createEl('p', 'society-help-text');
    refHelp.textContent = 'Base EROI values before technology bonuses and resource depletion. Fossil fuels decline as minerals deplete (down to 30% at full depletion). A minimum EROI of ~5:1 is needed to sustain industrial civilization.';
    c.appendChild(refHelp);

    const refTable = document.createElement('table');
    refTable.className = 'resource-export-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Source</th><th>Base EROI</th><th>Depletes?</th><th>Notes</th></tr>';
    refTable.appendChild(thead);
    const tbody = document.createElement('tbody');
    [
      { src: 'Wood / Biomass', eroi: 3, depletes: 'N/A', notes: 'Pre-industrial baseline' },
      { src: 'Coal', eroi: 35, depletes: 'Yes', notes: 'Declines with mineral depletion' },
      { src: 'Oil / Petroleum', eroi: 60, depletes: 'Yes', notes: 'Highest base EROI, but finite' },
      { src: 'Nuclear', eroi: 75, depletes: 'No', notes: 'Stable long-term source' },
      { src: 'Renewable', eroi: 15, depletes: 'No', notes: 'Lower but sustainable' },
      { src: 'Fusion', eroi: 50, depletes: 'No', notes: 'Future technology' },
    ].forEach(row => {
      const tr = document.createElement('tr');
      const isCurrent = (row.src === (SOURCE_LABELS[source] ?? source));
      if (isCurrent) tr.style.fontWeight = 'bold';
      tr.innerHTML = `<td>${isCurrent ? '→ ' : ''}${row.src}</td><td>${row.eroi}</td><td>${row.depletes}</td><td>${row.notes}</td>`;
      tbody.appendChild(tr);
    });
    refTable.appendChild(tbody);
    c.appendChild(refTable);

    // Cross-effects summary
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Energy Cross-Effects'));
    const crossList = Utils.createEl('div', 'society-effects-list');
    const crossEffects = [
      'Low energy surplus (<5) reduces technology adoption rate proportionally.',
      'Energy deficit (EROI < 5) erodes stability (-0.05/turn) and wellbeing (-0.03/turn).',
      'Energy transitions trigger anomie spikes (+5) as society adapts to new energy paradigm.',
      'Fossil fuel EROI declines as mineral resources deplete (coal, oil).',
      'Technology level provides up to +30% EROI efficiency bonus.',
    ];
    crossEffects.forEach(txt => crossList.appendChild(Utils.createEl('div', 'society-effect-item', txt)));
    c.appendChild(crossList);

    // Energy history from resource snapshots
    const history = s.resourceHistory ?? [];
    if (history.length >= 2 && history[0].energyEROI !== undefined) {
      c.appendChild(Utils.createEl('div', 'society-section-hdr', 'EROI History'));
      const chartWrap = Utils.createEl('div', 'sustainability-chart-wrap');
      const canvas = document.createElement('canvas');
      canvas.width = 560;
      canvas.height = 180;
      chartWrap.appendChild(canvas);
      c.appendChild(chartWrap);

      const series = [
        { label: 'EROI', color: '#fbbf24', points: history.filter(h => h.energyEROI != null).map(h => ({ x: h.turn, y: h.energyEROI })) },
        { label: 'Surplus', color: '#4ade80', points: history.filter(h => h.energySurplus != null).map(h => ({ x: h.turn, y: Math.max(0, h.energySurplus) })) },
      ];

      requestAnimationFrame(() => {
        ChartUtils.drawLineChart(canvas, series, {
          title: 'Energy Return on Investment',
          minY: 0,
          maxY: 80,
          showLegend: true,
          xLabel: 'Turn',
          yLabel: 'EROI',
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🌿 Strategy Tab
  // ═══════════════════════════════════════════════════════════
  _renderStrategy(c, civ) {
    const s = civ.state;
    const iq = s.institutionalQuality ?? 50;

    const hdr = Utils.createEl('div', 'society-section-hdr', 'Resource Extraction Strategy');
    c.appendChild(hdr);

    const note = Utils.createEl('p', 'society-help-text');
    note.textContent = 'How aggressively resources are extracted and at what cost. Multipliers apply to the base depletion/pollution rates that already scale with population, technology, and economic model. Government-managed strategy scales with institutional quality.';
    c.appendChild(note);

    const grid = Utils.createEl('div', 'society-tier-grid');
    for (const strat of RESOURCE_STRATEGIES) {
      const isCurrent = s.resourceStrategy === strat.id;
      const colorClass = {
        conservation:        'strat-conservation',
        balanced_stewardship:'strat-balanced',
        extraction_growth:   'strat-extraction',
        government_managed:  'strat-government',
      }[strat.id] ?? '';
      const card = Utils.createEl('div', `society-tier-card strategy-card ${colorClass}${isCurrent ? ' current' : ''}`);

      card.appendChild(Object.assign(Utils.createEl('div', 'society-tier-card-hdr'), { textContent: `${strat.icon} ${strat.label}` }));
      card.appendChild(Object.assign(Utils.createEl('p', 'society-tier-card-desc'), { textContent: strat.description }));

      const fx = Utils.createEl('div', 'society-tier-card-fx');
      if (strat.id === 'government_managed') {
        // Show IQ-scaled range
        const iqFrac = iq / 100;
        const effDep = (1.2 - iqFrac * 0.7).toFixed(2);
        const effPol = (1.3 - iqFrac * 0.9).toFixed(2);
        fx.textContent = `Depletion ×${effDep} | Pollution ×${effPol} (at IQ ${Math.round(iq)}) | Crisis offset: ±IQ-scaled`;
      } else {
        const depS = strat.depletionMultiplier;
        const polS = strat.pollutionMultiplier;
        const wstS = strat.wasteMultiplier;
        const gS   = strat.growthPenalty >= 0 ? '+' : '';
        fx.textContent = `Depletion ×${depS} | Pollution ×${polS} | Waste ×${wstS} | Growth: ${gS}${strat.growthPenalty}/turn | Crisis offset: ${strat.crisisThresholdBonus > 0 ? '+' : ''}${strat.crisisThresholdBonus}`;
      }
      card.appendChild(fx);

      if (!isCurrent) {
        const btn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Apply');
        btn.onclick = () => {
          this.game.simulation?.applyExternalEvent({ type: 'set_resource_strategy', strategy: strat.id }, [civ.id]);
          this.render();
        };
        card.appendChild(btn);
      } else {
        card.appendChild(Object.assign(Utils.createEl('span', 'society-current-badge'), { textContent: '✓ Current' }));
      }
      grid.appendChild(card);
    }
    c.appendChild(grid);
  }

  // ═══════════════════════════════════════════════════════════
  // 🔄 Obsolescence Tab
  // ═══════════════════════════════════════════════════════════
  _renderObsolescence(c, civ) {
    const s = civ.state;

    const hdr = Utils.createEl('div', 'society-section-hdr', 'Product Obsolescence Model');
    c.appendChild(hdr);

    const note = Utils.createEl('p', 'society-help-text');
    note.textContent = 'Planned obsolescence shortens product lifespans to drive repeat sales, accelerating resource consumption and waste. Durability-first design reduces replacement rates and long-term depletion.';
    c.appendChild(note);

    const row = Utils.createEl('div', 'society-horizontal-cards');
    for (const obs of OBSOLESCENCE_MODELS) {
      const isCurrent = s.obsolescenceModel === obs.id;
      const colorClass = obs.id === 'durability_first' ? 'obs-durable' : obs.id === 'market_driven' ? 'obs-market' : '';
      const card = Utils.createEl('div', `society-tier-card ${colorClass}${isCurrent ? ' current' : ''}`);

      card.appendChild(Object.assign(Utils.createEl('div', 'society-tier-card-hdr'), { textContent: `${obs.icon} ${obs.label}` }));
      card.appendChild(Object.assign(Utils.createEl('p', 'society-tier-card-desc'), { textContent: obs.description }));

      const fx = Utils.createEl('div', 'society-tier-card-fx');
      const wS  = obs.wasteMultiplierMod >= 0 ? '+' : '';
      const dS  = obs.resourceDepletionMod >= 0 ? '+' : '';
      const gS  = obs.growthMod >= 0 ? '+' : '';
      const wbS = obs.wellbeingMod >= 0 ? '+' : '';
      fx.textContent = `Waste mod: ${wS}${(obs.wasteMultiplierMod * 100).toFixed(0)}% | Depletion mod: ${dS}${(obs.resourceDepletionMod * 100).toFixed(0)}% | Growth: ${gS}${obs.growthMod}/turn | Wellbeing: ${wbS}${obs.wellbeingMod}`;
      card.appendChild(fx);

      if (!isCurrent) {
        const btn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Apply');
        btn.onclick = () => {
          this.game.simulation?.applyExternalEvent({ type: 'set_obsolescence_model', model: obs.id }, [civ.id]);
          this.render();
        };
        card.appendChild(btn);
      } else {
        card.appendChild(Object.assign(Utils.createEl('span', 'society-current-badge'), { textContent: '✓ Current' }));
      }
      row.appendChild(card);
    }
    c.appendChild(row);

    // Synergy warning
    if (s.resourceStrategy === 'extraction_growth' && s.obsolescenceModel === 'market_driven') {
      const synWarn = Utils.createEl('div', 'obsolescence-synergy-warn');
      synWarn.textContent = '⚠️ Extraction-for-growth + planned obsolescence: combined depletion ×2.0, waste ×2.5. Environmental crises will trigger 30–40% faster than baseline. Consider switching at least one dimension to reduce long-term risk.';
      c.appendChild(synWarn);
    }

    // Explanation of planned obsolescence mechanism
    const mechHdr = Utils.createEl('div', 'society-section-hdr', 'Mechanism: How Planned Obsolescence Works');
    c.appendChild(mechHdr);
    const mechText = Utils.createEl('p', 'society-help-text');
    mechText.textContent = 'Market-driven obsolescence multiplies the base waste accumulation rate by 1.4× and depletion by 1.3×. When combined with the extraction-growth resource strategy, these multiply together: effective waste rate = strategy_waste × (1 + 0.4) = 1.8 × 1.4 ≈ 2.5×. This mirrors real-world dynamics where short product lifespans, high replacement frequency, and throwaway culture accelerate resource depletion and pollution simultaneously.';
    c.appendChild(mechText);
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 Export Tab
  // ═══════════════════════════════════════════════════════════
  _renderExport(c, civ) {
    const s = civ.state;
    const history = s.resourceHistory ?? [];

    const hdr = Utils.createEl('div', 'society-section-hdr', 'Resource History Export');
    c.appendChild(hdr);

    const note = Utils.createEl('p', 'society-help-text');
    note.textContent = `${history.length} turn snapshots available (max 50). Download as CSV for spreadsheet analysis or as PNG chart image.`;
    c.appendChild(note);

    // Download CSV
    const csvBtn = Utils.createEl('button', 'btn btn-primary', '📥 Download Resource CSV');
    csvBtn.onclick = () => this._downloadCSV(history, civ.name);
    c.appendChild(csvBtn);

    // Chart for PNG export
    if (history.length >= 2) {
      const chartWrap = Utils.createEl('div', 'sustainability-chart-wrap');
      const canvas = document.createElement('canvas');
      canvas.id     = 'sustainability-export-canvas';
      canvas.width  = 560;
      canvas.height = 220;
      chartWrap.appendChild(canvas);
      c.appendChild(chartWrap);

      const pngBtn = Utils.createEl('button', 'btn btn-secondary', '📥 Download Chart PNG');
      pngBtn.style.marginTop = '6px';
      pngBtn.onclick = () => ChartUtils.exportPNG(canvas, `${civ.name}_resources`);
      c.appendChild(pngBtn);

      const series = [
        { label: 'Forests',   color: '#4ade80', points: history.map(h => ({ x: h.turn, y: h.forests   ?? 100 })) },
        { label: 'Soil',      color: '#fbbf24', points: history.map(h => ({ x: h.turn, y: h.soil       ?? 100 })) },
        { label: 'Minerals',  color: '#94a3b8', points: history.map(h => ({ x: h.turn, y: h.minerals   ?? 100 })) },
        { label: 'Water',     color: '#60a5fa', points: history.map(h => ({ x: h.turn, y: h.water      ?? 100 })) },
        { label: 'Pollution', color: '#f87171', points: history.map(h => ({ x: h.turn, y: h.pollution  ?? 0   })) },
        { label: 'Waste',     color: '#fb923c', points: history.map(h => ({ x: h.turn, y: h.waste      ?? 0   })) },
      ];

      requestAnimationFrame(() => {
        ChartUtils.drawLineChart(canvas, series, {
          title: `${civ.name} — Resource History`,
          minY: 0,
          maxY: 100,
          showLegend: true,
          xLabel: 'Turn',
          yLabel: 'Level',
        });
      });
    }

    // Data table
    if (history.length > 0) {
      const tableHdr = Utils.createEl('div', 'society-section-hdr', 'Raw Data Table');
      c.appendChild(tableHdr);

      const tbl = document.createElement('table');
      tbl.className = 'resource-export-table';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Turn</th><th>Year</th><th>Forests</th><th>Soil</th><th>Minerals</th><th>Water</th><th>Pollution</th><th>Waste</th><th>Strategy</th><th>Obsolescence</th></tr>';
      tbl.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (const row of history) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.turn}</td>
          <td>${row.year}</td>
          <td>${Math.round(row.forests   ?? 100)}</td>
          <td>${Math.round(row.soil      ?? 100)}</td>
          <td>${Math.round(row.minerals  ?? 100)}</td>
          <td>${Math.round(row.water     ?? 100)}</td>
          <td>${Math.round(row.pollution ?? 0)}</td>
          <td>${Math.round(row.waste     ?? 0)}</td>
          <td>${row.resourceStrategy ?? ''}</td>
          <td>${row.obsolescenceModel ?? ''}</td>
        `;
        tbody.appendChild(tr);
      }
      tbl.appendChild(tbody);

      const tableWrap = Utils.createEl('div', 'resource-table-wrap');
      tableWrap.appendChild(tbl);
      c.appendChild(tableWrap);
    }
  }

  // ── CSV Generator ────────────────────────────────────────────
  _downloadCSV(history, civName) {
    const headers = ['Turn', 'Year', 'Forests', 'Soil', 'Minerals', 'Water', 'Pollution', 'Waste', 'ResourceStrategy', 'ObsolescenceModel'];
    const rows = history.map(h => [
      h.turn, h.year,
      Math.round(h.forests   ?? 100),
      Math.round(h.soil      ?? 100),
      Math.round(h.minerals  ?? 100),
      Math.round(h.water     ?? 100),
      Math.round(h.pollution ?? 0),
      Math.round(h.waste     ?? 0),
      h.resourceStrategy ?? '',
      h.obsolescenceModel ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${civName.replace(/\s+/g, '_')}_resource_history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
