// ============================================================
// research_panel.js — Track 2 Research Panel (Pass 9)
// Keyboard shortcut: (none — via 🔬 Research button)
// Tabs: Export | Parameters | Contagion
// ============================================================

class ResearchPanel {
  constructor(game) {
    this.game      = game;
    this.visible   = false;
    this.activeTab = 'export'; // 'export' | 'parameters' | 'contagion'
  }

  // ── Visibility ──────────────────────────────────────────────
  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('research-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('research-panel'));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  // ── Helpers ──────────────────────────────────────────────────
  _civ() {
    const civs = this.game?.civilizations;
    if (!civs || civs.length === 0) return null;
    return civs.find(c => c.isPlayerCiv) || civs[0];
  }

  _paramRow(label, value, note = '') {
    const row = Utils.createEl('div', 'param-row');
    const lbl = Utils.createEl('span', 'param-label', label);
    const val = Utils.createEl('span', 'param-value', String(value ?? '—'));
    row.appendChild(lbl);
    row.appendChild(val);
    if (note) {
      const n = Utils.createEl('span', 'param-note', note);
      row.appendChild(n);
    }
    return row;
  }

  _paramSection(title) {
    const h = Utils.createEl('h4', 'param-section-title', title);
    return h;
  }

  // ── Root Render ──────────────────────────────────────────────
  render() {
    const panel = Utils.el('research-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', '', '🔬 Research');
    title.style.margin = '0';
    const seedSpan = Utils.createEl('span', 'research-seed-badge', `SEED: ${this.game?.researchSeed ?? 'unknown'}`);
    titleWrap.appendChild(title);
    titleWrap.appendChild(seedSpan);
    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => {
      this.hide();
      Utils.el('btn-research')?.classList.remove('btn-map-active');
    };
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', 'panel-tabs');
    const tabDefs = [
      { id: 'export',     label: '📦 Export' },
      { id: 'parameters', label: '⚙️ Parameters' },
      { id: 'contagion',  label: '🌐 Contagion' },
    ];
    for (const td of tabDefs) {
      const btn = Utils.createEl('button', `panel-tab-btn ${this.activeTab === td.id ? 'active' : ''}`, td.label);
      btn.onclick = () => { this.activeTab = td.id; this.render(); };
      tabs.appendChild(btn);
    }
    panel.appendChild(tabs);

    // Content
    const content = Utils.createEl('div', 'panel-content');
    panel.appendChild(content);

    if (this.activeTab === 'export')     this._renderExport(content);
    else if (this.activeTab === 'parameters') this._renderParameters(content);
    else if (this.activeTab === 'contagion')  this._renderContagion(content);
  }

  // ── Tab: Export ──────────────────────────────────────────────
  _renderExport(content) {
    const civ = this._civ();
    const s = civ?.state;

    // Run info card
    const infoCard = Utils.createEl('div', 'research-info-card');
    infoCard.innerHTML = `
      <div class="research-info-row"><span>Run Seed</span><strong class="research-seed-val">${this.game?.researchSeed ?? 'unknown'}</strong></div>
      <div class="research-info-row"><span>Turn</span><strong>${this.game?.turnCount ?? 0}</strong></div>
      <div class="research-info-row"><span>Year</span><strong>${this.game?.currentYear ?? '?'}</strong></div>
      <div class="research-info-row"><span>Civilization</span><strong>${civ?.name ?? '—'}</strong></div>
      <div class="research-info-row"><span>Economic Model</span><strong>${civ?.economic?.modelId ?? '—'}</strong></div>
      <div class="research-info-row"><span>Governance Model</span><strong>${civ?.governance?.modelId ?? '—'}</strong></div>
    `;
    content.appendChild(infoCard);

    const desc = Utils.createEl('p', 'research-desc',
      'Download a full multi-section CSV containing all 50-turn ring buffers, threshold events, and history events for this civilization. Reference the Run Seed in published work to identify this exact run.');
    content.appendChild(desc);

    const dlBtn = Utils.createEl('button', 'btn btn-primary', '⬇ Download Full CSV');
    dlBtn.onclick = () => {
      if (!civ) { alert('No civilization found.'); return; }
      this.game?.simulation?._exportTrack2CSV(civ);
    };
    content.appendChild(dlBtn);

    // Data availability summary
    const avail = Utils.createEl('div', 'research-avail');
    avail.innerHTML = '<h4 style="margin:16px 0 8px">Data Available for Export</h4>';
    const sections = [
      ['Economic History',           (s?.economicHistory ?? []).length],
      ['Empathy History',            (s?.empathyHistory ?? []).length],
      ['Cultural Gap History',       (s?.culturalGap?.history ?? []).length],
      ['Wealth Capture History',     (s?.wealthCapture?.history ?? []).length],
      ['Behavioral Inertia History', (s?.behaviorInertia?.inertiaHistory ?? []).length],
      ['Facilitation History',       (s?.facilitationState?.facilitationHistory ?? []).length],
      ['Coop Outcomes History',      (s?.cooperativeOutcomes?.history ?? []).length],
      ['Deficit History',            (s?.consequenceDeficit?.deficitHistory ?? []).length],
      ['Homogeneity History',        (s?.culturalHomogeneity?.history ?? []).length],
      ['Contagion History',          (s?.contagionState?.contagionHistory ?? []).length],
      ['Threshold Events',           (s?.thresholdEvents?.fired ?? []).length],
      ['History Events',             (civ?.history ?? []).length],
    ];
    for (const [name, count] of sections) {
      const row = Utils.createEl('div', 'research-avail-row');
      row.innerHTML = `<span>${name}</span><span class="${count > 0 ? 'avail-yes' : 'avail-no'}">${count} entries</span>`;
      avail.appendChild(row);
    }
    content.appendChild(avail);
  }

  // ── Tab: Parameters ──────────────────────────────────────────
  _renderParameters(content) {
    const civ = this._civ();

    // ── Research Controls (interactive) ──────────────────────
    const controlsCard = Utils.createEl('div', 'research-controls-card');
    controlsCard.style.cssText = 'background:#1a2233;border:1px solid #334;border-radius:8px;padding:14px 18px;margin-bottom:16px;';

    const controlsTitle = Utils.createEl('h4', '', 'Research Controls');
    controlsTitle.style.cssText = 'margin:0 0 10px;color:#8cf;';
    controlsCard.appendChild(controlsTitle);

    // Suppress Random Events toggle
    const toggleRow = Utils.createEl('div', '');
    toggleRow.style.cssText = 'display:flex;align-items:center;gap:12px;';

    const toggleLabel = Utils.createEl('span', '', 'Suppress Random Events');
    toggleLabel.style.cssText = 'color:#cde;font-size:14px;';

    const toggleBtn = Utils.createEl('button', 'btn btn-sm', civ?.suppressRandomEvents ? 'ON' : 'OFF');
    toggleBtn.style.cssText = civ?.suppressRandomEvents
      ? 'background:#e8a735;color:#111;font-weight:bold;min-width:50px;'
      : 'background:#334;color:#889;min-width:50px;';
    toggleBtn.onclick = () => {
      if (civ) {
        civ.suppressRandomEvents = !civ.suppressRandomEvents;
        this.render();
        const status = civ.suppressRandomEvents ? 'ON — random events suppressed' : 'OFF — random events enabled';
        this.game.ui?.showNotification(`Suppress Random Events: ${status}`);
      }
    };

    const toggleNote = Utils.createEl('span', '', civ?.suppressRandomEvents
      ? 'Only deterministic threshold events will fire. Stochastic probability gates are bypassed. Session-scoped: resets on new simulation.'
      : 'When enabled, suppresses all events that use a random probability gate. Threshold-driven state changes and continuous drift still apply.');
    toggleNote.style.cssText = 'color:#778;font-size:12px;flex:1;';

    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggleBtn);
    toggleRow.appendChild(toggleNote);
    controlsCard.appendChild(toggleRow);
    content.appendChild(controlsCard);

    // ── Read-only parameters ─────────────────────────────────
    const desc = Utils.createEl('p', 'research-desc',
      'Read-only display of simulation constants. These values are baked into the model and documented here for research transparency.');
    content.appendChild(desc);

    const wrap = Utils.createEl('div', 'param-list');

    // ── Behavioral Inertia ────────────────────────────────────
    wrap.appendChild(this._paramSection('Behavioral Inertia'));
    wrap.appendChild(this._paramRow('Time in model × per year (cap 60)', '×0.5/yr', 'older model → more ingrained'));
    wrap.appendChild(this._paramRow('Hierarchy entrenchment contribution', '×0.3'));
    wrap.appendChild(this._paramRow('Wealth capture degree contribution', '×0.2'));
    wrap.appendChild(this._paramRow('Low education quality contribution', '×0.1', '(100−quality)×0.1'));
    wrap.appendChild(this._paramRow('Epistemic health reduction', '−×0.1'));
    wrap.appendChild(this._paramRow('Cultural homogeneity contribution (Pass 9)', '×0.12', 'monolithic culture = harder to shift'));
    wrap.appendChild(this._paramRow('Fraction of deferred shift per turn', '(1−inertia/100)×0.25', 'range 1%–30%/turn'));

    // ── Facilitation Measures ─────────────────────────────────
    wrap.appendChild(this._paramSection('Facilitation Measures'));
    const fMeasures = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];
    for (const m of fMeasures) {
      const dur = m.durationTurns > 0 ? `${m.durationTurns} turns` : 'indefinite';
      wrap.appendChild(this._paramRow(m.label, `cost ${m.cost} • ${dur}`, m.propagandaRisk > 0 ? 'propaganda risk if EH<30' : ''));
    }
    wrap.appendChild(this._paramRow('EH amplifier range', '0.05–1.5', 'at EH/60; heterogeneous civ modifier ×(1+(50−homo)/500)'));
    wrap.appendChild(this._paramRow('Propaganda backfire threshold EH', '< 30', 'media campaigns generate cynicism'));

    // ── Cooperative Outcomes ──────────────────────────────────
    wrap.appendChild(this._paramSection('Cooperative Outcomes Feedback'));
    wrap.appendChild(this._paramRow('Score formula', 'econCoop×0.35 + equality×0.25 + wellbeing×0.20 + (100−wcd)×0.20'));
    wrap.appendChild(this._paramRow('Reinforcement threshold (score >)', '60 → +0.8/turn max to coop'));
    wrap.appendChild(this._paramRow('Weakening threshold (score <)', '40 → −0.6/turn + cynicism +0.5'));

    // ── Consequence Deficit ───────────────────────────────────
    wrap.appendChild(this._paramSection('Consequence Deficit'));
    wrap.appendChild(this._paramRow('Deficit gain per turn', 'abusePressure × (1−accountability) × 3.0'));
    wrap.appendChild(this._paramRow('Deficit recovery per turn', 'accountability × 2.0', 'asymmetric: accumulates faster than it heals'));
    wrap.appendChild(this._paramRow('Acceleration multiplier', '1.0 + (level/100) × 1.5', 'applied to wealth capture lerp rate'));

    // ── Thresholds ────────────────────────────────────────────
    wrap.appendChild(this._paramSection('Threshold Definitions'));
    const thresholds = (typeof THRESHOLD_DEFINITIONS !== 'undefined') ? THRESHOLD_DEFINITIONS : [];
    for (const td of thresholds) {
      const field = td.field ?? 'custom';
      const cond  = td.trigger ? `${field} ${td.trigger} ${td.value}` : 'custom check';
      wrap.appendChild(this._paramRow(td.label, `${td.severity}`, `${cond} • cooldown ${td.cooldown}t`));
    }

    // ── Cultural Homogeneity ──────────────────────────────────
    wrap.appendChild(this._paramSection('Cultural Homogeneity (Pass 9)'));
    wrap.appendChild(this._paramRow('Trade dependency drift (per 50% above 50%)', '−0.06/turn'));
    wrap.appendChild(this._paramRow('Theocratic governance drift', '+0.10/turn'));
    wrap.appendChild(this._paramRow('Command / absolute monarchy drift', '+0.08/turn'));
    wrap.appendChild(this._paramRow('Shadow government drift', '+0.07/turn'));
    wrap.appendChild(this._paramRow('Arts & science freedom drift', '−0.05 to −0.08/turn'));
    wrap.appendChild(this._paramRow('Low EH (<30) drift', '+0.06/turn'));
    wrap.appendChild(this._paramRow('Migration influx one-time drift', '−0.12'));
    wrap.appendChild(this._paramRow('Max net drift per turn', '±0.20'));
    wrap.appendChild(this._paramRow('Inertia contribution', '×0.12', 'homogeneity/100 × 0.12 added to inertia coefficient'));
    wrap.appendChild(this._paramRow('Receptivity formula', '1.0 − homogeneity/150', 'range 0.33–1.0'));

    // ── Cross-Civilization Contagion ──────────────────────────
    wrap.appendChild(this._paramSection('Cross-Civilization Behavioral Contagion (Pass 9)'));
    const cfg = (typeof CONTAGION_CONFIG !== 'undefined') ? CONTAGION_CONFIG : {};
    wrap.appendChild(this._paramRow('Base rate scaling', cfg.baseRateScaling ?? '—', 'per-turn at tradeDep=100, attitude=+100, receptivity=1.0'));
    wrap.appendChild(this._paramRow('Cynicism speed factor', cfg.cynicismSpeedFactor ?? '—', 'relative to cooperation'));
    wrap.appendChild(this._paramRow('Epistemic health speed factor', cfg.ehSpeedFactor ?? '—', 'slowest — most structural'));
    wrap.appendChild(this._paramRow('Min attitude factor (hostile)', cfg.minAttitudeFactor ?? '—', 'cultural bleed even at war'));
    wrap.appendChild(this._paramRow('War dampening factor', cfg.warDampeningFactor ?? '—', 'near-zero contact during war'));
    wrap.appendChild(this._paramRow('Contagion surge log threshold', cfg.contagionBurstThreshold ?? '—', 'source-target gap >N AND attitude >60'));

    content.appendChild(wrap);
  }

  // ── Tab: Contagion ───────────────────────────────────────────
  _renderContagion(content) {
    const civ = this._civ();
    const cs = civ?.state?.contagionState;

    if (!cs) {
      content.appendChild(Utils.createEl('p', 'research-desc', 'No contagion data. Play some turns first.'));
      return;
    }

    content.appendChild(Utils.createEl('p', 'research-desc',
      'Cross-civilization norm diffusion for this civilization. Positive values = receiving influence from neighbors. Negative = emitting influence outward.'));

    // Contagion history chart
    const chartWrap = Utils.createEl('div', 'research-chart-wrap');
    const canvas = document.createElement('canvas');
    canvas.width = 560; canvas.height = 180;
    canvas.style.width = '100%';
    chartWrap.appendChild(canvas);
    content.appendChild(chartWrap);

    if (typeof ChartUtils !== 'undefined') {
      ChartUtils.drawContagionChart(canvas, cs.contagionHistory ?? []);
    }

    // Received influences log
    const recvSec = Utils.createEl('div', 'research-influences-section');
    recvSec.innerHTML = '<h4 style="margin:16px 0 6px">Received Influences (last 10)</h4>';
    const recv = cs.receivedInfluences ?? [];
    if (recv.length === 0) {
      recvSec.appendChild(Utils.createEl('p', 'research-desc', 'No received influences yet.'));
    } else {
      const table = Utils.createEl('table', 'research-table');
      table.innerHTML = '<thead><tr><th>Turn</th><th>Source</th><th>Vector</th><th>Delta</th></tr></thead>';
      const tbody = document.createElement('tbody');
      for (const r of [...recv].reverse()) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.turn??''}</td><td>${r.sourceCivName??''}</td><td>${r.vector??''}</td><td class="${(r.delta??0) > 0 ? 'delta-pos' : 'delta-neg'}">${((r.delta??0) > 0 ? '+' : '') + (r.delta??0).toFixed(4)}</td>`;
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      recvSec.appendChild(table);
    }
    content.appendChild(recvSec);

    // Emitted influences log
    const emitSec = Utils.createEl('div', 'research-influences-section');
    emitSec.innerHTML = '<h4 style="margin:16px 0 6px">Emitted Influences (last 10)</h4>';
    const emit = cs.emittedInfluences ?? [];
    if (emit.length === 0) {
      emitSec.appendChild(Utils.createEl('p', 'research-desc', 'No emitted influences yet.'));
    } else {
      const table2 = Utils.createEl('table', 'research-table');
      table2.innerHTML = '<thead><tr><th>Turn</th><th>Target</th><th>Vector</th><th>Delta</th></tr></thead>';
      const tbody2 = document.createElement('tbody');
      for (const e of [...emit].reverse()) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.turn??''}</td><td>${e.targetCivName??''}</td><td>${e.vector??''}</td><td class="${(e.delta??0) > 0 ? 'delta-pos' : 'delta-neg'}">${((e.delta??0) > 0 ? '+' : '') + (e.delta??0).toFixed(4)}</td>`;
        tbody2.appendChild(tr);
      }
      table2.appendChild(tbody2);
      emitSec.appendChild(table2);
    }
    content.appendChild(emitSec);

    // Note about deferred shift
    const note = Utils.createEl('div', 'research-note',
      'Cooperation contagion enters the deferred shift queue (Society → Inertia tab) and is applied gradually based on the inertia coefficient. Cynicism and epistemic health effects are applied directly each turn.');
    content.appendChild(note);
  }
}
