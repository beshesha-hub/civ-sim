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
      { id: 'agriculture',  label: '🌾 Agriculture' },
      { id: 'mobility',     label: '🚶 Mobility' },
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
    else if (this.activeTab === 'agriculture')  this._renderAgriculture(content, civ);
    else if (this.activeTab === 'mobility')     this._renderMobility(content, civ);
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

    // ── Pass 10: Production Structure ──────────────────────────
    this._renderDecentralization(c, civ, 'energy');
  }

  // ═══════════════════════════════════════════════════════════
  // 🌾 Agriculture Tab (Pass 10)
  // ═══════════════════════════════════════════════════════════
  _renderAgriculture(c, civ) {
    const s  = civ.state;
    const ag = s.agricultureSystem;
    if (!ag) { c.textContent = 'Agricultural system not initialized.'; return; }

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Food Production'));
    const foodSec = s.foodSecurity ?? 60;
    c.appendChild(this._bar('Food Security', foodSec, 100, this._resourceColor(foodSec)));

    // Land Equivalent Ratio
    const ler = ag.landEquivalentRatio ?? 1.0;
    c.appendChild(this._bar('Land Efficiency Gain (%)', (ler - 1) * 100, 100,
      ler > 1.3 ? 'bar-green' : (ler > 1.1 ? 'bar-yellow' : '')));
    const lerNote = Utils.createEl('div', 'society-help-text');
    lerNote.textContent = `Land Equivalent Ratio ${ler.toFixed(2)} — output per unit land relative to monoculture (1.00). `
      + `Measured anchors: monoculture 1.00, intercropping meta-analyses 1.22–1.32, silvoarable ceiling 2.00. `
      + `Values are interpolated strictly between these and never exceed 2.00.`;
    c.appendChild(lerNote);

    // Ecosystem function
    c.appendChild(this._bar('Ecosystem Function', ag.ecosystemFunction ?? 0, 100,
      (ag.ecosystemFunction ?? 0) > 50 ? 'bar-green' : ''));
    c.appendChild(this._bar('External Inputs Displaced', ag.inputSubstitution ?? 0, 100,
      (ag.inputSubstitution ?? 0) > 40 ? 'bar-green' : ''));
    const ecoNote = Utils.createEl('div', 'society-help-text');
    ecoNote.textContent = 'Ecosystem function is the designed interaction between species — nitrogen-fixing '
      + 'companions, plants whose exudates repel insect pests, trap crops that draw pests away, and animals '
      + 'used as weeders. It substitutes for fertilizer and pesticide rather than adding to yield directly, '
      + 'so the benefit is largest where external inputs are scarce. Anchor: push-pull cropping raised maize '
      + 'from about 1 t/ha to 3.5 t/ha with minimal inputs across 122,650+ smallholder farms. '
      + 'Knowledge is the binding constraint — these systems are knowledge-intensive and lapse without '
      + 'sustained extension support, so this bar falls when education, state capacity or trust decline.';
    c.appendChild(ecoNote);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Production Structure'));
    c.appendChild(this._bar('Local / Small-Scale Share', ag.localShare, 100,
      ag.localShare > 60 ? 'bar-green' : ''));
    c.appendChild(this._bar('Structural Baseline', ag.structuralBaseline ?? 0, 100, ''));
    c.appendChild(this._bar('Programme Contribution', ag.pathwayOffset ?? 0, 70,
      (ag.pathwayOffset ?? 0) > 20 ? 'bar-green' : ''));
    c.appendChild(this._bar('Diversification Intensity', ag.diversificationIntensity, 100,
      ag.diversificationIntensity > 50 ? 'bar-green' : ''));
    c.appendChild(this._bar('Labor Intensity', ag.laborIntensity, 100,
      ag.laborIntensity > 60 ? 'bar-yellow' : ''));

    // Coercion penalty on structural gain
    const cyf = ag.coercionYieldFactor ?? 1.0;
    if (cyf < 0.99) {
      c.appendChild(this._bar('Structural Gain Retained (%)', cyf * 100, 100,
        cyf < 0.6 ? 'bar-red' : 'bar-yellow'));
      const coNote = Utils.createEl('div', 'society-help-text');
      coNote.textContent = `Compulsion is destroying ${Math.round((1 - cyf) * 100)}% of the advantage this `
        + `production structure would otherwise deliver. A well-designed system imposed by force `
        + `underperforms a mediocre one freely chosen — Soviet private plots on 1–3% of sown land produced `
        + `25–27% of agricultural output, with the same farmers on the same soil. This penalty does not `
        + `require a weak state: the USSR, China under the Great Leap Forward, and Romania under `
        + `systematization all had formidable capacity.`;
      c.appendChild(coNote);
    }

    const tradeoff = Utils.createEl('div', 'society-help-text');
    tradeoff.textContent = 'Diversified systems are land-efficient and labor-intensive — they absorb workers '
      + 'and suppress urbanization. Monoculture is labor-efficient and land-hungry — it releases workers to cities '
      + 'at the cost of higher yield variance. Neither is strictly better (Boserup).';
    c.appendChild(tradeoff);

    // ── Distribution & post-harvest loss ──
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Distribution & Loss'));
    c.appendChild(this._bar('Local Distribution', ag.distributionLocality ?? 0, 100,
      (ag.distributionLocality ?? 0) > 55 ? 'bar-green' : ''));
    c.appendChild(this._bar('Handling / Transit Loss (%)', ag.chainLoss ?? 0, 30,
      (ag.chainLoss ?? 0) > 18 ? 'bar-red' : ((ag.chainLoss ?? 0) > 10 ? 'bar-amber' : 'bar-green')));
    c.appendChild(this._bar('Cosmetic Rejection (%)', ag.cosmeticRejection ?? 0, 30,
      (ag.cosmeticRejection ?? 0) > 12 ? 'bar-red' : ''));
    c.appendChild(this._bar('Harvest Maturity', ag.harvestMaturity ?? 50, 100,
      (ag.harvestMaturity ?? 50) > 65 ? 'bar-green' : ''));
    c.appendChild(this._bar('Nutritional Quality', ag.nutritionalQuality ?? 50, 100,
      (ag.nutritionalQuality ?? 50) > 65 ? 'bar-green' : ''));

    const distNote = Utils.createEl('div', 'society-help-text');
    distNote.textContent = 'Local distribution means food reaching people without trucks, trains, ships or '
      + 'aircraft — which is a separate question from where it was grown. Three distinct losses shrink with it. '
      + 'Handling, sorting, packaging and transit: about 13% of production is lost post-harvest, rising to 25% '
      + 'for fruit and vegetables. Cosmetic rejection: graded markets discard produce on appearance — 17% of '
      + 'harvest volume in one apple supply chain, 16% of edible persimmon production in another study, and over '
      + 'a third of farm production in Europe and the UK by some estimates. Most of it is diverted to processing '
      + 'or animal feed rather than destroyed, so it counts as a partial loss.';
    c.appendChild(distNote);

    const matNote = Utils.createEl('div', 'society-help-text');
    matNote.textContent = 'Harvest maturity is the third loss and the least visible. Produce for long-distance '
      + 'marketing is picked mature-green; produce for local fresh consumption is picked ripe. Vitamin C, '
      + 'flavonoids and total phenolics rise significantly during ripening, and antioxidant vitamins A, E and C '
      + 'are higher at full ripeness — transit damage reduces vitamin C further. This affects health and disease '
      + 'burden, never calorie supply: a well-fed population eating nutrient-poor produce is still well-fed.';
    c.appendChild(matNote);

    const energyDistNote = Utils.createEl('div', 'society-help-text');
    energyDistNote.textContent = 'Short chains also avoid long-haul transport and the cold chain — real energy, '
      + 'since distribution is about 15% of the supply-chain footprint, postharvest handling and storage another '
      + '17%, and roughly 40% of foods need refrigeration. The saving is scoped to the distribution segment only. '
      + 'Production remains 83% of food-system emissions, so this never transforms the total.';
    c.appendChild(energyDistNote);

    const cityNote = Utils.createEl('div', 'society-help-text');
    const capNow = Math.round(100 - (s.urbanizationRate ?? 15) * 0.70);
    cityNote.textContent = `Urbanization is the hard limit: a large city cannot be fed within cart range, which `
      + `is exactly why dense populations need a cold chain. At ${Math.round(s.urbanizationRate ?? 15)}% `
      + `urbanization your local-distribution ceiling is about ${capNow}%.`;
    c.appendChild(cityNote);

    // Variance swap explanation
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Trade Exposure'));
    const tradeDep = s.tradeDependency ?? 20;
    c.appendChild(this._bar('Trade Dependency', tradeDep, 100, tradeDep > 60 ? 'bar-yellow' : ''));
    const varNote = Utils.createEl('div', 'society-help-text');
    varNote.textContent = 'Local self-reliance and import dependence are a variance swap, not a mean improvement. '
      + 'High local share shields against blockade, export bans and global price shocks, but increases exposure to '
      + 'local drought and weather. High trade dependency does the inverse. Local food receives no emissions bonus — '
      + 'production is 83% of food-system emissions; all transport is 11%.';
    c.appendChild(varNote);

    // Diversification controls
    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Agricultural Policy'));
    const divRow = Utils.createEl('div', 'society-btn-row');
    const divBtn = Utils.createEl('button', 'btn btn-secondary', '🌱 Promote Diversification');
    divBtn.title = 'Extension services for intercropping, rotation and agroforestry. Raises Land Equivalent Ratio and soil health; raises labor demand. Effectiveness scales with education quality.';
    divBtn.onclick = () => this._applyEvent('promote_diversification');
    divRow.appendChild(divBtn);

    const monoBtn = Utils.createEl('button', 'btn btn-secondary', '🚜 Promote Specialization');
    monoBtn.title = 'Consolidate around fewer high-output crops. Frees labor for cities; raises yield variance and input dependence.';
    monoBtn.onclick = () => this._applyEvent('promote_monoculture');
    divRow.appendChild(monoBtn);
    c.appendChild(divRow);

    this._renderDecentralization(c, civ, 'agriculture');
  }

  // ═══════════════════════════════════════════════════════════
  // 🚶 Mobility Tab (Pass 11)
  // ═══════════════════════════════════════════════════════════
  _renderMobility(c, civ) {
    const s = civ.state;
    const at = s.activeTravel;
    if (!at) { c.textContent = 'Active travel system not initialized.'; return; }

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Active Travel'));
    c.appendChild(this._bar('Mode Share', at.modeShare, 100, at.modeShare > 25 ? 'bar-green' : ''));
    c.appendChild(this._bar('Structural Baseline', at.structuralBaseline, 100, ''));
    c.appendChild(this._bar('Programme Contribution', at.pathwayOffset ?? 0, 70,
      (at.pathwayOffset ?? 0) > 20 ? 'bar-green' : ''));
    const bn = Utils.createEl('div', 'society-help-text');
    bn.textContent = 'Before the automobile, cities were entirely walking and animal powered — the baseline was '
      + 'near total, and motorization collapsed it. What you build is the contribution above that baseline. '
      + 'Seville raised cycling from 0.5% to about 6.5% by building a continuous 80km protected network, and the '
      + 'decisive factors were segregation from traffic, connectivity to real destinations, and continuity '
      + 'without gaps. Length alone does not do it.';
    c.appendChild(bn);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Network'));
    c.appendChild(this._bar('Coverage', at.networkCoverage, 100, at.networkCoverage > 55 ? 'bar-green' : ''));
    c.appendChild(this._bar('Continuity', at.networkContinuity, 100, at.networkContinuity > 55 ? 'bar-green' : ''));
    c.appendChild(this._bar('Transit Integration', at.transitIntegration, 100,
      at.transitIntegration > 50 ? 'bar-green' : ''));
    c.appendChild(this._bar('Effective Reach', at.effectiveReach, 100,
      at.effectiveReach < 30 ? 'bar-red' : (at.effectiveReach < 55 ? 'bar-amber' : 'bar-green')));

    const reachNote = Utils.createEl('div', 'society-help-text');
    reachNote.textContent = 'A single network cannot serve a large metropolis. The median cycling trip is about '
      + '2km and mode share collapses beyond 5km; 7.5km is the comfortable maximum. The answer is interlocking '
      + 'local networks plus transit: each network serves its own catchment and transit carries the leg between '
      + 'them. In the Netherlands the bicycle is the access mode for roughly 47% of rail passengers, cycling an '
      + 'average of 4km to the station. Transit integration is what makes this viable at metropolitan scale — '
      + 'watch Effective Reach rise as you build it.';
    c.appendChild(reachNote);

    c.appendChild(this._bar('Jobs–Housing Balance', at.jobsHousingBalance, 100,
      at.jobsHousingBalance < 40 ? 'bar-red' : (at.jobsHousingBalance > 65 ? 'bar-green' : '')));
    const jh = Utils.createEl('div', 'society-help-text');
    jh.textContent = 'Polycentric form does not reduce travel by itself — the research is genuinely mixed. '
      + 'Spreading people out while keeping jobs concentrated makes things worse. Balance within each local '
      + 'centre is the gate on everything else here.';
    c.appendChild(jh);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Safety & Access'));
    c.appendChild(this._bar('Perceived Safety', at.perceivedSafety, 100,
      at.perceivedSafety > 60 ? 'bar-green' : (at.perceivedSafety < 40 ? 'bar-red' : '')));
    c.appendChild(this._bar('Lighting', at.lightingLevel, 100, ''));
    c.appendChild(this._bar('Patrols', at.patrolIntensity, 100, ''));
    c.appendChild(this._bar('Rest Areas & Facilities', at.amenityLevel, 100, ''));
    c.appendChild(this._bar("Men's Mode Share", at.modeShareMale, 100, ''));
    c.appendChild(this._bar("Women's Mode Share", at.modeShareFemale, 100,
      at.modeShareFemale < at.modeShareMale * 0.7 ? 'bar-red' : 'bar-green'));

    const gap = at.modeShareMale - at.modeShareFemale;
    const safetyNote = Utils.createEl('div', 'society-help-text');
    safetyNote.textContent = gap > 3
      ? `Women's use of the network trails men's by ${Math.round(gap)} points. Personal safety is a real and `
        + `specific barrier: women report more fear walking in the evening (29% vs 20%) and are far less likely `
        + `to perceive an area as very safe (30% vs 49%) — and it is shaped by harassment, not traffic. There is `
        + `no gendered difference in fear of collision, so protected paths alone do not close this gap. Lighting `
        + `and patrols do. Build paths without the safety layer and you capture roughly half the available shift.`
      : 'Women and men use the network at similar rates — the safety layer is doing its job. Lighting cuts crime '
        + 'about 14%, and focused patrols reduce it further with the benefit diffusing into surrounding '
        + 'neighbourhoods rather than displacing crime into them.';
    c.appendChild(safetyNote);

    const droneNote = Utils.createEl('div', 'society-help-text');
    droneNote.textContent = 'Rest areas, restrooms, emergency phones and signal coverage are grouped as '
      + 'facilities and carry a deliberately small weight: emergency call boxes are documented as rarely used '
      + 'for their intended purpose and largely symbolic, though symbolism may still matter when the barrier is '
      + 'perception. Aerial drone patrol is not modelled at all — the one rigorous trial found no significant '
      + 'deterrent effect, and inventing a coefficient would be worse than omitting it.';
    c.appendChild(droneNote);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Environmental Effect'));
    c.appendChild(this._bar('Total Energy Displaced (%)', at.energySavedShare, 12,
      at.energySavedShare > 4 ? 'bar-green' : ''));
    const envNote = Utils.createEl('div', 'society-help-text');
    envNote.textContent = `${at.energySavedShare.toFixed(1)}% of total energy demand avoided. Keep this in `
      + 'proportion: transport is about a third of energy demand, passenger travel 60–70% of that, and urban '
      + 'passenger car travel therefore roughly 15–20% of the total. A ten-point mode shift is around 2% of all '
      + 'energy — real and worth having, not transformational. The larger effects are health and air quality: '
      + 'cycle commuting carries an all-cause mortality hazard ratio of 0.59, and in the Barcelona superblocks '
      + 'assessment air pollution was the single largest health channel.';
    c.appendChild(envNote);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Animal-Powered Transport'));
    c.appendChild(this._bar('Animal Power Share', at.animalPowerShare, 100, ''));
    const animalNote = Utils.createEl('div', 'society-help-text');
    const urb = Math.round(s.urbanizationRate ?? 15);
    animalNote.textContent = urb > 45
      ? `At ${urb}% urbanization animal power is actively harmful. A horse produces 15–35 lb of manure a day; `
        + `1890s London with over 50,000 working horses saw roughly 1,000 tons a day on the streets. Flies bred `
        + `in it and contaminated water, spreading typhoid and cholera; stabling consumed valuable land; and hay `
        + `acreage competed directly with growing food for people. Cities abandoned animal power because it `
        + `failed at density, and this model reproduces that rather than assuming otherwise.`
      : `At ${urb}% urbanization animal power remains practical and useful, particularly for freight. Its costs `
        + `— sanitation, land for stabling, and hay acreage competing with human food — scale with density and `
        + `become prohibitive above roughly 45% urbanization.`;
    c.appendChild(animalNote);

    c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Mobility Policy'));
    const row1 = Utils.createEl('div', 'society-btn-row');
    const b1 = Utils.createEl('button', 'btn btn-secondary', '🚶 Build Path Network');
    b1.title = 'Segregated paths connecting residences to local destinations. Continuity matters more than length.';
    b1.onclick = () => this._applyEvent('build_active_network');
    row1.appendChild(b1);
    const b2 = Utils.createEl('button', 'btn btn-secondary', '🚉 Integrate Transit');
    b2.title = 'Secure cycle parking and direct path links at transit nodes. This is what defeats the ~5km distance limit.';
    b2.onclick = () => this._applyEvent('integrate_transit');
    row1.appendChild(b2);
    c.appendChild(row1);

    const row2 = Utils.createEl('div', 'society-btn-row');
    const b3 = Utils.createEl('button', 'btn btn-secondary', '💡 Path Safety Programme');
    b3.title = 'Lighting, patrols, rest areas and facilities. Addresses the barrier that keeps women off the network.';
    b3.onclick = () => this._applyEvent('improve_path_safety');
    row2.appendChild(b3);
    const b4 = Utils.createEl('button', 'btn btn-secondary', '🏘️ Rebalance Jobs & Housing');
    b4.title = 'Bring employment closer to housing within each local centre. Gates the benefit of everything else.';
    b4.onclick = () => this._applyEvent('balance_jobs_housing');
    row2.appendChild(b4);
    c.appendChild(row2);

    this._renderDecentralization(c, civ, 'mobility');
  }

  // ═══════════════════════════════════════════════════════════
  // Shared: Decentralization pathway + participation (Pass 10)
  // ═══════════════════════════════════════════════════════════
  _renderDecentralization(c, civ, domain) {
    const s = civ.state;
    const sys = domain === 'energy' ? s.energySystem
              : domain === 'mobility' ? s.activeTravel : s.agricultureSystem;
    if (!sys) return;
    const shareLabel = domain === 'energy' ? 'Distributed Share'
                     : domain === 'mobility' ? 'Mode Share' : 'Local Share';
    const share = domain === 'energy' ? sys.distributedShare
                : domain === 'mobility' ? sys.modeShare : sys.localShare;

    c.appendChild(Utils.createEl('div', 'society-section-hdr',
      domain === 'energy' ? 'Production Structure' : 'Initiation Pathway'));

    if (domain === 'energy') {
      c.appendChild(this._bar(shareLabel, share, 100, share > 60 ? 'bar-green' : ''));
      c.appendChild(this._bar('Structural Baseline', sys.structuralBaseline ?? 0, 100, ''));
      c.appendChild(this._bar('Programme Contribution', sys.pathwayOffset ?? 0, 70,
        (sys.pathwayOffset ?? 0) > 20 ? 'bar-green' : ''));
      const baseNote = Utils.createEl('div', 'society-help-text');
      baseNote.textContent = 'The structural baseline is what your infrastructure, urbanization and state '
        + 'capacity make the default. A working grid centralizes production; a failing one forces it local — '
        + 'this is why distributed generation collapsed during electrification and returns when grids fail. '
        + 'Programme contribution is the part your chosen pathway actually earned on top of that baseline, and '
        + 'it is the honest measure of whether a policy worked. It persists while the programme runs and decays '
        + 'if you abandon it.';
      c.appendChild(baseNote);
      c.appendChild(this._bar('Land Intensity', sys.landIntensity, 100,
        sys.landIntensity > 60 ? 'bar-yellow' : ''));
      const pdNote = Utils.createEl('div', 'society-help-text');
      pdNote.textContent = 'Land intensity reflects power density (Smil): biomass ~0.6 W/m², wind 1–2, '
        + 'distributed solar 5–20, hydro/nuclear ~200, fossil extraction 1,000–10,000. Distributed renewables '
        + 'compete with agriculture and forest for land — the two production parameters interact through this '
        + 'shared constraint rather than through any direct coupling.';
      c.appendChild(pdNote);
    }

    // Crisis + capital
    c.appendChild(this._bar('Crisis Pressure', sys.crisisPressure, 100,
      sys.crisisPressure > 60 ? 'bar-red' : (sys.crisisPressure > 30 ? 'bar-yellow' : '')));
    c.appendChild(this._bar('Capital Access', sys.capitalAccess, 100,
      sys.capitalAccess < 30 ? 'bar-red' : ''));
    if (sys.crisisPressure > 45 && sys.capitalAccess < 30) {
      const warn = Utils.createEl('div', 'society-help-text');
      warn.textContent = '⚠️ Crisis pressure is high but capital access is low. Scarcity without a funding '
        + 'channel produces hardship, not new capacity. Every historical case of rapid decentralization had one: '
        + 'household purchasing power, concessional finance, grants, or pay-as-you-go credit.';
      c.appendChild(warn);
    }

    // Ownership breadth
    c.appendChild(this._bar('Ownership Breadth', (sys.ownershipBreadth ?? 0) * 100, 100,
      (sys.ownershipBreadth ?? 0) > 0.6 ? 'bar-green' : ''));

    // ── Enabling support (capability, not compulsion) ──
    c.appendChild(this._bar('Enabling Support', sys.enablingSupport ?? 0, 100,
      (sys.enablingSupport ?? 0) > 50 ? 'bar-green' : ''));
    c.appendChild(this._bar('Support Reaching Intended (%)', sys.supportEffectiveness ?? 0, 100,
      (sys.supportEffectiveness ?? 0) < (sys.enablingSupport ?? 0) * 0.6 ? 'bar-amber' : 'bar-green'));

    const supNote = Utils.createEl('div', 'society-help-text');
    supNote.textContent = 'Enabling support is equipment and material access, training, expert specialists '
      + 'available for consultation, tax relief and reimbursement of household costs. It is the opposite of '
      + 'compulsion — the state supplying capability rather than compelling behaviour — and it carries no '
      + 'coercion penalty. It works best where capital access is worst: making tax credits refundable '
      + 'substantially raises adoption among low-income households while barely moving high-income adoption.';
    c.appendChild(supNote);

    const capNote = Utils.createEl('div', 'society-help-text');
    const leak = (sys.enablingSupport ?? 0) - (sys.supportEffectiveness ?? 0);
    capNote.textContent = leak > 5
      ? `About ${Math.round(leak)} points of this support is captured by those who least need it. Malawi's `
        + `input subsidy programme reached ~1.5 million smallholders and more than doubled fertilizer use, but `
        + `a significant share of the benefit went to better-connected and larger farmers already using inputs. `
        + `Land concentration and weak institutions widen this gap. Support also drains the treasury while active `
        + `and lapses without renewal.`
      : 'Support is reaching its intended recipients reasonably well. It still drains the treasury while active '
        + 'and decays without renewal — the most commonly documented failure is simply the absence of long-term '
        + 'follow-up to training.';
    c.appendChild(capNote);

    const supRow = Utils.createEl('div', 'society-btn-row');
    const domLabel = domain === 'energy' ? 'energy'
                   : domain === 'mobility' ? 'mobility' : 'agriculture';
    const fundBtn = Utils.createEl('button', 'btn btn-secondary', '🎓 Fund Support Programme');
    fundBtn.title = 'Seeds and equipment, technology access, training, expert consultation, tax relief and '
      + 'reimbursement of household expenditure. Raises adoption and (for agriculture) the knowledge ceiling on '
      + 'ecosystem function. No coercion cost. Ongoing fiscal drain; partly captured where land is concentrated.';
    fundBtn.onclick = () => this._applyEvent('fund_enabling_support', { domain: domLabel });
    supRow.appendChild(fundBtn);
    const cutBtn = Utils.createEl('button', 'btn btn-secondary', '✂️ Cut Support');
    cutBtn.title = 'Scale back training, material access and reimbursement. Immediate fiscal relief; '
      + 'knowledge-dependent practices decay without follow-up.';
    cutBtn.onclick = () => this._applyEvent('reduce_enabling_support', { domain: domLabel });
    supRow.appendChild(cutBtn);
    c.appendChild(supRow);

    // Pathway buttons
    const pathRow = Utils.createEl('div', 'society-btn-row');
    const evtType = domain === 'energy' ? 'set_energy_pathway'
                  : domain === 'mobility' ? 'set_mobility_pathway' : 'set_agriculture_pathway';
    Object.values(DECENTRALIZATION_PATHWAYS).forEach(pw => {
      const active = sys.pathway === pw.id;
      const btn = Utils.createEl('button',
        'btn ' + (active ? 'btn-primary' : 'btn-secondary'),
        `${pw.icon} ${pw.label}`);
      btn.title = `${pw.description}\n\nEvidence tier: ${pw.tier}`
        + (pw.anchor ? `\nAnchor: ${pw.anchor}` : '');
      btn.onclick = () => this._applyEvent(evtType, { pathway: pw.id });
      pathRow.appendChild(btn);
    });
    c.appendChild(pathRow);

    const active = DECENTRALIZATION_PATHWAYS[sys.pathway];
    if (active && active.id !== 'none') {
      const info = Utils.createEl('div', 'society-help-text');
      info.textContent = `${active.icon} ${active.label} — ${active.description} `
        + `[tier ${active.tier}]${active.anchor ? ` Anchor: ${active.anchor}` : ''}`;
      c.appendChild(info);
    }

    // ── Participation (shown once, on the energy tab) ──
    if (domain === 'energy') {
      c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Participation & Stakeholding'));
      c.appendChild(this._bar('Participation Depth', s.participationDepth ?? 0, 100,
        (s.participationDepth ?? 0) > 50 ? 'bar-green' : ''));
      c.appendChild(this._bar('Coercion Level', s.participationCoercion ?? 0, 100,
        (s.participationCoercion ?? 0) > 50 ? 'bar-red' : ''));

      const pNote = Utils.createEl('div', 'society-help-text');
      pNote.textContent = 'Participation depth is the share of people who are producers and stakeholders rather '
        + 'than remote consumers. Bounded effects: wellbeing up to +8, anomie up to −10, trust up to +6, '
        + 'legitimacy up to +5 (gardening and self-determination meta-analyses; Karasek/Whitehall II decision '
        + 'latitude; procedural-justice research). Caps are deliberately modest — intervention-scale effect sizes '
        + 'are not civilizational transformations.';
      c.appendChild(pNote);

      const cNote = Utils.createEl('div', 'society-help-text');
      cNote.textContent = 'Coercion discounts every one of those benefits. Participation studies are self-selected: '
        + 'assigning participation is not the same as choosing it. Under high coercion and weak institutions the '
        + 'effect turns negative. This is why mandating offers of ownership succeeds where mandating participation '
        + 'itself fails.';
      c.appendChild(cNote);

      // Energy → wellbeing saturation
      c.appendChild(Utils.createEl('div', 'society-section-hdr', 'Energy & Wellbeing'));
      const gj = s.energyPerCapita ?? 5;
      const ceil = s.wellbeingEnergyCeiling ?? 100;
      c.appendChild(this._bar('Energy per Capita (GJ/yr)', Math.min(gj, 200), 200,
        gj < 20 ? 'bar-red' : (gj < 50 ? 'bar-yellow' : 'bar-green')));
      c.appendChild(this._bar('Wellbeing Ceiling', ceil, 100, ''));
      const eNote = Utils.createEl('div', 'society-help-text');
      eNote.textContent = `At ${gj.toFixed(0)} GJ/capita/year the energy-imposed wellbeing ceiling is `
        + `${ceil.toFixed(0)}. Social outcomes rise steeply between roughly 10 and 75 GJ/capita and saturate above `
        + `100–150. This is a ceiling only — it constrains low-energy societies but grants no bonus to high-energy `
        + `ones, so neither direction is rewarded.`;
      c.appendChild(eNote);
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
