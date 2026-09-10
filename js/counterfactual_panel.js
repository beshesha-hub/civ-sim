// ═══════════════════════════════════════════════════════════════
//  COUNTERFACTUAL LAB PANEL — UI for snapshot, fork, compare
//  Keyboard shortcut: shift+l   |   Button: 🔬 Lab
// ═══════════════════════════════════════════════════════════════

class CounterfactualPanel {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.activeTab = 'snapshots';
    this.selectedForkId = null;
    this.selectedMetrics = ['averageWellbeing', 'socialTrust', 'wealthConcentration', 'freedomLevel'];
    this.selectedCivId = null; // null = player civ
  }

  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('counterfactual-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('counterfactual-panel'));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  _civ() {
    if (this.selectedCivId) {
      return this.game?.civilizations?.find(c => c.id === this.selectedCivId) ?? null;
    }
    return this.game?.civilizations?.find(c => c.isPlayerCiv) ??
           this.game?.civilizations?.[0] ?? null;
  }

  _engine() {
    return this.game?.counterfactual;
  }

  // ── Root Render ─────────────────────────────────────────────
  render() {
    const panel = Utils.el('counterfactual-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', 'panel-title', '🧪 Counterfactual Lab');
    titleWrap.appendChild(title);
    header.appendChild(titleWrap);

    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.addEventListener('click', () => this.hide());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', '');
    tabs.style.cssText = 'display:flex;gap:2px;padding:0 16px;border-bottom:1px solid var(--border);overflow-x:auto;';
    const tabDefs = [
      { id: 'snapshots',    icon: '📸', label: 'Snapshots' },
      { id: 'fork',         icon: '🔀', label: 'Fork & Run' },
      { id: 'trajectories', icon: '📈', label: 'Trajectories' },
      { id: 'divergence',   icon: '🔍', label: 'Divergence' },
    ];
    for (const t of tabDefs) {
      const btn = Utils.createEl('button', 'tab-btn' +
        (this.activeTab === t.id ? ' active' : ''), `${t.icon} ${t.label}`);
      btn.addEventListener('click', () => { this.activeTab = t.id; this.render(); });
      tabs.appendChild(btn);
    }
    panel.appendChild(tabs);

    const body = Utils.createEl('div', '');
    body.style.cssText = 'padding:16px;overflow-y:auto;flex:1;';

    const engine = this._engine();
    if (!engine) {
      body.appendChild(Utils.createEl('p', '', 'Counterfactual engine not active. Start a game first.'));
      panel.appendChild(body);
      return;
    }

    switch (this.activeTab) {
      case 'snapshots':    this._renderSnapshots(body, engine); break;
      case 'fork':         this._renderFork(body, engine); break;
      case 'trajectories': this._renderTrajectories(body, engine); break;
      case 'divergence':   this._renderDivergence(body, engine); break;
    }

    panel.appendChild(body);
  }

  // ── Snapshots Tab ───────────────────────────────────────────
  _renderSnapshots(body, engine) {
    const desc = Utils.createEl('p', '', '');
    desc.style.cssText = 'color:var(--text-dim);margin:0 0 16px;font-size:0.85rem;';
    desc.textContent = 'Save the current simulation state. You can fork from any snapshot to explore "what if" scenarios.';
    body.appendChild(desc);

    // Snapshot label input + take button
    const snapRow = Utils.createEl('div', '');
    snapRow.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:20px;';
    const snapInput = document.createElement('input');
    snapInput.type = 'text';
    snapInput.placeholder = `Label (default: Turn ${this.game.turnCount})`;
    snapInput.style.cssText = 'flex:1;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-size:0.85rem;';
    snapRow.appendChild(snapInput);
    const takeBtn = Utils.createEl('button', 'btn btn-primary', '📸 Take Snapshot');
    takeBtn.addEventListener('click', () => {
      engine.takeSnapshot(snapInput.value || undefined);
      this._updateLabButton();
      this.render();
    });
    snapRow.appendChild(takeBtn);
    body.appendChild(snapRow);

    // List existing snapshots
    if (engine.snapshots.length === 0) {
      body.appendChild(Utils.createEl('p', '', 'No snapshots yet. Take one to start exploring counterfactuals.'));
      return;
    }

    const heading = Utils.createEl('h3', '', `Saved Snapshots (${engine.snapshots.length})`);
    heading.style.cssText = 'margin:0 0 10px;font-size:0.95rem;';
    body.appendChild(heading);

    for (const snap of [...engine.snapshots].reverse()) {
      const card = Utils.createEl('div', '');
      card.style.cssText = 'background:var(--elevated);border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:8px;';

      const top = Utils.createEl('div', '');
      top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
      const nameEl = Utils.createEl('strong', '', snap.label);
      nameEl.style.fontSize = '0.9rem';
      top.appendChild(nameEl);

      const meta = Utils.createEl('span', '', `Year ${snap.year} · Turn ${snap.turn}`);
      meta.style.cssText = 'color:var(--text-dim);font-size:0.78rem;';
      top.appendChild(meta);
      card.appendChild(top);

      // Civ count
      const info = Utils.createEl('div', '', `${snap.civilizations.length} civilization(s) saved`);
      info.style.cssText = 'color:var(--text-dim);font-size:0.78rem;margin-top:4px;';
      card.appendChild(info);

      // Fork count for this snapshot
      const forkCount = engine.forks.filter(f => f.snapshotId === snap.id).length;
      if (forkCount > 0) {
        const forkInfo = Utils.createEl('div', '', `${forkCount} fork(s) created`);
        forkInfo.style.cssText = 'color:var(--primary);font-size:0.78rem;margin-top:2px;';
        card.appendChild(forkInfo);
      }

      const btnRow = Utils.createEl('div', '');
      btnRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';

      const forkBtn = Utils.createEl('button', 'btn btn-primary btn-sm', '🔀 Fork');
      forkBtn.addEventListener('click', () => {
        this._pendingSnapshotId = snap.id;
        this.activeTab = 'fork';
        this.render();
      });
      btnRow.appendChild(forkBtn);

      const delBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '🗑️ Delete');
      delBtn.addEventListener('click', () => {
        if (confirm(`Delete snapshot "${snap.label}" and its forks?`)) {
          engine.deleteSnapshot(snap.id);
          this._updateLabButton();
          this.render();
        }
      });
      btnRow.appendChild(delBtn);

      card.appendChild(btnRow);
      body.appendChild(card);
    }
  }

  // ── Fork & Run Tab ──────────────────────────────────────────
  _renderFork(body, engine) {
    if (engine.snapshots.length === 0) {
      body.appendChild(Utils.createEl('p', '', 'Take a snapshot first (Snapshots tab).'));
      return;
    }

    const desc = Utils.createEl('p', '', '');
    desc.style.cssText = 'color:var(--text-dim);margin:0 0 16px;font-size:0.85rem;';
    desc.textContent = 'Fork from a snapshot with modified conditions. The simulation runs forward silently from the snapshot point, then you can compare the forked trajectory against the original.';
    body.appendChild(desc);

    // Snapshot selector
    const selectWrap = Utils.createEl('div', '');
    selectWrap.style.cssText = 'margin-bottom:12px;';
    selectWrap.innerHTML = '<label style="font-weight:600;display:block;margin-bottom:4px;">Fork from snapshot:</label>';
    const snapSelect = document.createElement('select');
    snapSelect.id = 'cf-snap-select';
    snapSelect.style.cssText = 'width:100%;padding:6px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const snap of engine.snapshots) {
      const opt = document.createElement('option');
      opt.value = snap.id;
      opt.textContent = `${snap.label} (Year ${snap.year})`;
      if (snap.id === this._pendingSnapshotId) opt.selected = true;
      snapSelect.appendChild(opt);
    }
    selectWrap.appendChild(snapSelect);
    body.appendChild(selectWrap);

    // Turns to run
    const turnsWrap = Utils.createEl('div', '');
    turnsWrap.style.cssText = 'margin-bottom:12px;';
    turnsWrap.innerHTML = `
      <label style="font-weight:600;display:block;margin-bottom:4px;">Turns to simulate:</label>
      <input type="number" id="cf-turns" min="5" max="500" value="50"
        style="width:80px;padding:6px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);" />
      <span style="color:var(--text-dim);font-size:0.78rem;margin-left:8px;">
        (~<span id="cf-turns-years">—</span> years at current pace)
      </span>`;
    body.appendChild(turnsWrap);

    // Update year estimate
    const turnsInput = turnsWrap.querySelector('#cf-turns');
    const yearsSpan = turnsWrap.querySelector('#cf-turns-years');
    const updateYears = () => {
      const t = parseInt(turnsInput.value) || 50;
      yearsSpan.textContent = t * (this.game.yearsDelta || 25);
    };
    turnsInput.oninput = updateYears;
    updateYears();

    // Fork label
    const labelWrap = Utils.createEl('div', '');
    labelWrap.style.cssText = 'margin-bottom:16px;';
    labelWrap.innerHTML = `
      <label style="font-weight:600;display:block;margin-bottom:4px;">Fork label (optional):</label>
      <input type="text" id="cf-fork-label" placeholder="e.g., 'Without the civil war' or 'With UBI policy'"
        style="width:100%;padding:6px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);" />`;
    body.appendChild(labelWrap);

    // Condition modifications
    const modHeader = Utils.createEl('h3', '', 'Modify Conditions');
    modHeader.style.cssText = 'margin:0 0 8px;font-size:0.95rem;';
    body.appendChild(modHeader);

    const modDesc = Utils.createEl('p', '', '');
    modDesc.style.cssText = 'color:var(--text-dim);margin:0 0 12px;font-size:0.82rem;';
    modDesc.textContent = 'Adjust parameters before running. Leave at 0 to keep the snapshot value unchanged. These shifts are applied to the snapshot state before the fork runs forward.';
    body.appendChild(modDesc);

    // Civ selector for modifications
    const civSelWrap = Utils.createEl('div', '');
    civSelWrap.style.cssText = 'margin-bottom:12px;';
    civSelWrap.innerHTML = '<label style="font-weight:600;display:block;margin-bottom:4px;">Apply modifications to:</label>';
    const civSel = document.createElement('select');
    civSel.id = 'cf-civ-select';
    civSel.style.cssText = 'width:100%;padding:6px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const civ of this.game.civilizations) {
      const opt = document.createElement('option');
      opt.value = civ.id;
      opt.textContent = civ.name + (civ.isPlayerCiv ? ' (You)' : '');
      civSel.appendChild(opt);
    }
    civSelWrap.appendChild(civSel);
    body.appendChild(civSelWrap);

    // Modification sliders
    const modSliders = [
      { section: 'Core Metrics', sliders: [
        { id: 'mod-wellbeing',     label: 'Wellbeing',            min: -30, max: 30, key: 'averageWellbeing' },
        { id: 'mod-trust',         label: 'Social Trust',         min: -20, max: 20, key: 'socialTrust' },
        { id: 'mod-equality',      label: 'Equality',             min: -20, max: 20, key: 'equalityIndex' },
        { id: 'mod-freedom',       label: 'Freedom',              min: -20, max: 20, key: 'freedomLevel' },
      ]},
      { section: 'Governance', sliders: [
        { id: 'mod-corruption',    label: 'Corruption',           min: -15, max: 15, key: 'corruptionLevel' },
        { id: 'mod-capacity',      label: 'State Capacity',       min: -15, max: 15, key: 'stateCapacity' },
        { id: 'mod-legitimacy',    label: 'Legitimacy',           min: -15, max: 15, key: 'legitimacyLevel' },
      ]},
      { section: 'Economy & Structure', sliders: [
        { id: 'mod-wc',            label: 'Wealth Concentration', min: -20, max: 20, key: 'wealthConcentration', target: 'economic' },
        { id: 'mod-mobility',      label: 'Social Mobility',      min: -15, max: 15, key: 'socialMobility' },
        { id: 'mod-polarization',  label: 'Polarization',         min: -15, max: 15, key: 'politicalPolarization' },
      ]},
      { section: 'Behavioral', sliders: [
        { id: 'mod-cooperation',   label: 'Cooperation',          min: -20, max: 20, key: 'cooperation', target: 'behavior' },
        { id: 'mod-empathy',       label: 'Empathy',              min: -20, max: 20, key: 'empathyLevel' },
        { id: 'mod-innovation',    label: 'Innovation',           min: -20, max: 20, key: 'innovation', target: 'behavior' },
      ]},
    ];

    for (const section of modSliders) {
      const secLabel = Utils.createEl('div', '', section.section);
      secLabel.style.cssText = 'font-weight:600;font-size:0.82rem;color:var(--text-dim);margin:12px 0 6px;text-transform:uppercase;letter-spacing:0.5px;';
      body.appendChild(secLabel);

      for (const s of section.sliders) {
        const row = Utils.createEl('div', 'custom-slider-row');
        row.innerHTML = `
          <label>${s.label}</label>
          <input type="range" id="${s.id}" min="${s.min}" max="${s.max}" value="0" data-key="${s.key}" data-target="${s.target || 'state'}" />
          <span id="${s.id}-val" class="slider-val">0</span>`;
        const slider = row.querySelector('input');
        const valEl = row.querySelector('span');
        slider.oninput = () => {
          valEl.textContent = (slider.value > 0 ? '+' : '') + slider.value;
          valEl.style.color = slider.value > 0 ? '#00d4aa' : slider.value < 0 ? '#ff6b6b' : '';
        };
        body.appendChild(row);
      }
    }

    // Run button
    const runBtn = Utils.createEl('button', 'btn btn-primary', '🚀 Run Fork');
    runBtn.style.cssText = 'margin-top:20px;width:100%;padding:10px;font-size:0.95rem;';
    runBtn.addEventListener('click', () => {
      const snapId = snapSelect.value;
      const turns = parseInt(turnsInput.value) || 50;
      const label = body.querySelector('#cf-fork-label')?.value.trim() || undefined;
      const targetCivId = civSel.value;

      // Gather modifications
      const mods = { civModifications: {} };
      const civMod = { state: {}, economic: {}, behaviorReinforcement: {} };
      let hasAnyMod = false;

      for (const section of modSliders) {
        for (const s of section.sliders) {
          const slider = body.querySelector(`#${s.id}`);
          const val = parseInt(slider?.value || '0');
          if (val === 0) continue;
          hasAnyMod = true;
          if (s.target === 'economic') {
            civMod.economic[s.key] = val; // delta applied during fork
          } else if (s.target === 'behavior') {
            civMod.behaviorReinforcement[s.key] = val;
          } else {
            civMod.state[s.key] = val;
          }
        }
      }

      // Convert deltas to absolute values using snapshot
      const snap = engine.snapshots.find(s => s.id === snapId);
      if (snap) {
        const snapCiv = snap.civilizations.find(c => c.id === targetCivId);
        if (snapCiv) {
          for (const [key, delta] of Object.entries(civMod.state)) {
            const base = snapCiv.state?.[key] ?? 50;
            civMod.state[key] = Utils.clamp(base + delta, 0, 100);
          }
          for (const [key, delta] of Object.entries(civMod.economic)) {
            const base = snapCiv.economic?.[key] ?? 50;
            civMod.economic[key] = Utils.clamp(base + delta, 0, 100);
          }
          for (const [key, delta] of Object.entries(civMod.behaviorReinforcement)) {
            const base = snapCiv.state?.behaviorReinforcement?.[key] ?? 50;
            civMod.behaviorReinforcement[key] = Utils.clamp(base + delta, 0, 100);
          }
        }
      }

      if (hasAnyMod) {
        mods.civModifications[targetCivId] = civMod;
      }

      // Show progress
      runBtn.disabled = true;
      runBtn.textContent = '⏳ Running fork...';

      // Use setTimeout to allow UI update before blocking computation
      setTimeout(() => {
        const fork = engine.forkFromSnapshot(snapId, hasAnyMod ? mods : null, turns, label);
        if (fork.error) {
          alert('Fork failed: ' + fork.error);
          runBtn.disabled = false;
          runBtn.textContent = '🚀 Run Fork';
          return;
        }

        this.selectedForkId = fork.id;
        this.selectedCivId = targetCivId;
        this.activeTab = 'trajectories';
        this._updateLabButton();
        this.render();
      }, 50);
    });
    body.appendChild(runBtn);
  }

  // ── Trajectories Tab ────────────────────────────────────────
  _renderTrajectories(body, engine) {
    if (engine.forks.length === 0) {
      body.appendChild(Utils.createEl('p', '', 'No forks yet. Create one from the Fork & Run tab.'));
      return;
    }

    const desc = Utils.createEl('p', '', '');
    desc.style.cssText = 'color:var(--text-dim);margin:0 0 12px;font-size:0.85rem;';
    desc.textContent = 'Compare the original trajectory (solid) against forked trajectories (dashed) for key metrics.';
    body.appendChild(desc);

    // Fork selector
    const selectRow = Utils.createEl('div', '');
    selectRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;';

    const forkSelWrap = Utils.createEl('div', '');
    forkSelWrap.innerHTML = '<label style="font-weight:600;font-size:0.82rem;margin-right:4px;">Fork:</label>';
    const forkSel = document.createElement('select');
    forkSel.style.cssText = 'padding:4px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const f of engine.forks) {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.label} (${f.startYear}–${f.endYear})`;
      if (f.id === this.selectedForkId) opt.selected = true;
      forkSel.appendChild(opt);
    }
    forkSel.onchange = () => { this.selectedForkId = forkSel.value; this.render(); };
    forkSelWrap.appendChild(forkSel);
    selectRow.appendChild(forkSelWrap);

    // Civ selector
    const civSelWrap = Utils.createEl('div', '');
    civSelWrap.innerHTML = '<label style="font-weight:600;font-size:0.82rem;margin-right:4px;">Civilization:</label>';
    const civSel = document.createElement('select');
    civSel.style.cssText = 'padding:4px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const c of this.game.civilizations) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === (this.selectedCivId || this._civ()?.id)) opt.selected = true;
      civSel.appendChild(opt);
    }
    civSel.onchange = () => { this.selectedCivId = civSel.value; this.render(); };
    civSelWrap.appendChild(civSel);
    selectRow.appendChild(civSelWrap);

    body.appendChild(selectRow);

    const forkId = this.selectedForkId || engine.forks[engine.forks.length - 1]?.id;
    const civId = this.selectedCivId || this._civ()?.id;
    if (!forkId || !civId) return;

    const comparison = engine.compareTrajectories(forkId, civId);
    if (!comparison) {
      body.appendChild(Utils.createEl('p', '', 'No comparison data available for this combination.'));
      return;
    }

    // Metric selector checkboxes
    const metricNames = {
      averageWellbeing: 'Wellbeing',
      socialTrust: 'Social Trust',
      wealthConcentration: 'Wealth Conc.',
      freedomLevel: 'Freedom',
      corruption: 'Corruption',
      polarization: 'Polarization',
      equalityIndex: 'Equality',
      socialMobility: 'Social Mobility',
      institutionalQuality: 'Inst. Quality',
      epistemicHealth: 'Epistemic Health',
      stateCapacity: 'State Capacity',
      legitimacyLevel: 'Legitimacy',
      population: 'Population',
    };

    const metricWrap = Utils.createEl('div', '');
    metricWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;';
    for (const [key, label] of Object.entries(metricNames)) {
      const isSelected = this.selectedMetrics.includes(key);
      const chip = Utils.createEl('button', 'btn btn-sm ' + (isSelected ? 'btn-primary' : 'btn-secondary'), label);
      chip.style.cssText = 'font-size:0.72rem;padding:3px 8px;';
      chip.addEventListener('click', () => {
        if (isSelected) {
          this.selectedMetrics = this.selectedMetrics.filter(m => m !== key);
        } else {
          this.selectedMetrics.push(key);
        }
        this.render();
      });
      metricWrap.appendChild(chip);
    }
    body.appendChild(metricWrap);

    // Draw charts for selected metrics
    const colors = ['#6c63ff', '#00d4aa', '#ff6b6b', '#f59e0b', '#06b6d4', '#ec4899',
                    '#8b5cf6', '#10b981', '#ef4444', '#f97316', '#14b8a6', '#a855f6', '#22c55e'];

    for (let i = 0; i < this.selectedMetrics.length; i++) {
      const metric = this.selectedMetrics[i];
      const data = comparison.metrics[metric];
      if (!data) continue;

      const chartWrap = Utils.createEl('div', '');
      chartWrap.style.cssText = 'margin-bottom:16px;background:var(--elevated);border:1px solid var(--border);border-radius:var(--radius);padding:12px;';

      const chartTitle = Utils.createEl('div', '');
      chartTitle.style.cssText = 'font-weight:600;font-size:0.85rem;margin-bottom:8px;display:flex;justify-content:space-between;';
      chartTitle.innerHTML = `<span>${metricNames[metric] || metric}</span>
        <span style="font-size:0.75rem;color:${data.endDelta >= 0 ? '#00d4aa' : '#ff6b6b'}">
          ${data.endDelta >= 0 ? '+' : ''}${data.endDelta.toFixed(1)} at end
        </span>`;
      chartWrap.appendChild(chartTitle);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 200;
      canvas.style.cssText = 'width:100%;height:auto;';
      chartWrap.appendChild(canvas);

      // Draw using ChartUtils — baseline solid only, fork drawn as dashed overlay
      const baseColor = '#94a3b8';
      const forkColor = colors[i % colors.length];

      const chartOpts = {
        title: '',
        xLabel: 'Year',
        yLabel: metricNames[metric] || metric,
        showLegend: false,
        minY: metric === 'population' ? undefined : 0,
        maxY: metric === 'population' ? undefined : 100,
      };

      if (typeof ChartUtils !== 'undefined') {
        // Draw both series for correct bounds, but fork invisible (drawn as dashed after)
        const allSeries = [
          { label: 'Original', color: baseColor, points: data.baseline },
          { label: 'Forked', color: 'rgba(0,0,0,0)', points: data.forked },
        ];
        ChartUtils.drawLineChart(canvas, allSeries, chartOpts);

        // Draw fork as dashed overlay with correct coordinate mapping
        this._drawDashedOverlay(canvas, data.forked, data.baseline, forkColor, chartOpts);
      }

      // Legend
      const legend = Utils.createEl('div', '');
      legend.style.cssText = 'display:flex;gap:16px;margin-top:6px;font-size:0.75rem;';
      legend.innerHTML = `
        <span><span style="display:inline-block;width:20px;height:2px;background:${baseColor};vertical-align:middle;margin-right:4px;"></span> Original</span>
        <span><span style="display:inline-block;width:20px;height:2px;background:${forkColor};vertical-align:middle;margin-right:4px;border-top:2px dashed ${forkColor};height:0;"></span> Forked</span>
      `;
      chartWrap.appendChild(legend);

      body.appendChild(chartWrap);
    }
  }

  _drawDashedOverlay(canvas, forkedPoints, baselinePoints, color, chartOpts) {
    if (!forkedPoints || forkedPoints.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const allPoints = [...(baselinePoints || []), ...forkedPoints];
    if (allPoints.length === 0) return;

    // Match ChartUtils' coordinate system exactly
    const title = (chartOpts && chartOpts.title) || '';
    const padLeft = 40;
    const padRight = 16;
    const padTop = title ? 28 : 10;
    const padBottom = (chartOpts && chartOpts.xLabel) ? 42 : 28;

    const xMin = Math.min(...allPoints.map(p => p.x));
    const xMax = Math.max(...allPoints.map(p => p.x));
    const yMin = (chartOpts && chartOpts.minY != null) ? chartOpts.minY : Math.min(...allPoints.map(p => p.y));
    const yMax = (chartOpts && chartOpts.maxY != null) ? chartOpts.maxY : Math.max(...allPoints.map(p => p.y));
    const xRange = Math.max(1, xMax - xMin);
    const yRange = Math.max(1, yMax - yMin);

    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toX = x => padLeft + ((x - xMin) / xRange) * plotW;
    const toY = y => padTop + plotH - ((y - yMin) / yRange) * plotH;

    // Draw the dashed fork line
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < forkedPoints.length; i++) {
      const px = toX(forkedPoints[i].x);
      const py = toY(forkedPoints[i].y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── Divergence Tab ──────────────────────────────────────────
  _renderDivergence(body, engine) {
    if (engine.forks.length === 0) {
      body.appendChild(Utils.createEl('p', '', 'No forks yet. Create one from the Fork & Run tab.'));
      return;
    }

    const desc = Utils.createEl('p', '', '');
    desc.style.cssText = 'color:var(--text-dim);margin:0 0 12px;font-size:0.85rem;';
    desc.textContent = 'Which metrics diverged most between the original and forked trajectories? Ranked by average absolute divergence.';
    body.appendChild(desc);

    // Selectors (same as trajectories)
    const selectRow = Utils.createEl('div', '');
    selectRow.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center;';

    const forkSelWrap = Utils.createEl('div', '');
    forkSelWrap.innerHTML = '<label style="font-weight:600;font-size:0.82rem;margin-right:4px;">Fork:</label>';
    const forkSel = document.createElement('select');
    forkSel.style.cssText = 'padding:4px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const f of engine.forks) {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.label} (${f.startYear}–${f.endYear})`;
      if (f.id === this.selectedForkId) opt.selected = true;
      forkSel.appendChild(opt);
    }
    forkSel.onchange = () => { this.selectedForkId = forkSel.value; this.render(); };
    forkSelWrap.appendChild(forkSel);
    selectRow.appendChild(forkSelWrap);

    const civSelWrap = Utils.createEl('div', '');
    civSelWrap.innerHTML = '<label style="font-weight:600;font-size:0.82rem;margin-right:4px;">Civilization:</label>';
    const civSel = document.createElement('select');
    civSel.style.cssText = 'padding:4px 8px;background:var(--elevated);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);';
    for (const c of this.game.civilizations) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === (this.selectedCivId || this._civ()?.id)) opt.selected = true;
      civSel.appendChild(opt);
    }
    civSel.onchange = () => { this.selectedCivId = civSel.value; this.render(); };
    civSelWrap.appendChild(civSel);
    selectRow.appendChild(civSelWrap);

    body.appendChild(selectRow);

    const forkId = this.selectedForkId || engine.forks[engine.forks.length - 1]?.id;
    const civId = this.selectedCivId || this._civ()?.id;
    if (!forkId || !civId) return;

    const ranking = engine.getDivergenceRanking(forkId, civId);
    if (ranking.length === 0) {
      body.appendChild(Utils.createEl('p', '', 'No divergence data available.'));
      return;
    }

    const metricNames = {
      averageWellbeing: 'Wellbeing', socialTrust: 'Social Trust',
      wealthConcentration: 'Wealth Concentration', freedomLevel: 'Freedom',
      corruption: 'Corruption', polarization: 'Polarization',
      equalityIndex: 'Equality', socialMobility: 'Social Mobility',
      institutionalQuality: 'Institutional Quality', epistemicHealth: 'Epistemic Health',
      stateCapacity: 'State Capacity', legitimacyLevel: 'Legitimacy',
      population: 'Population',
    };

    // Divergence bar chart
    const maxDiv = Math.max(...ranking.map(r => r.avgDivergence), 1);

    const fork = engine.forks.find(f => f.id === forkId);
    const heading = Utils.createEl('h3', '', `Divergence: ${fork?.label || forkId}`);
    heading.style.cssText = 'margin:0 0 12px;font-size:0.95rem;';
    body.appendChild(heading);

    for (const item of ranking) {
      const row = Utils.createEl('div', '');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';

      const label = Utils.createEl('div', '', metricNames[item.metric] || item.metric);
      label.style.cssText = 'width:140px;font-size:0.82rem;text-align:right;flex-shrink:0;';
      row.appendChild(label);

      const barWrap = Utils.createEl('div', '');
      barWrap.style.cssText = 'flex:1;height:20px;background:var(--bg);border-radius:3px;overflow:hidden;position:relative;';

      const bar = Utils.createEl('div', '');
      const pct = (item.avgDivergence / maxDiv) * 100;
      const barColor = item.endDelta >= 0 ? '#00d4aa' : '#ff6b6b';
      bar.style.cssText = `width:${pct}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.3s;`;
      barWrap.appendChild(bar);
      row.appendChild(barWrap);

      const val = Utils.createEl('div', '');
      val.style.cssText = `width:80px;font-size:0.78rem;color:${item.endDelta >= 0 ? '#00d4aa' : '#ff6b6b'};`;
      val.textContent = `${item.endDelta >= 0 ? '+' : ''}${item.endDelta.toFixed(1)}`;
      row.appendChild(val);

      body.appendChild(row);
    }

    // Summary
    const totalDiv = ranking.reduce((sum, r) => sum + r.avgDivergence, 0);
    const summary = Utils.createEl('div', '');
    summary.style.cssText = 'margin-top:16px;padding:12px;background:var(--elevated);border:1px solid var(--border);border-radius:var(--radius);font-size:0.85rem;';

    const improved = ranking.filter(r => {
      // For corruption, polarization, wealthConcentration: negative delta = improvement
      const negBetter = ['corruption', 'polarization', 'wealthConcentration'];
      return negBetter.includes(r.metric) ? r.endDelta < -1 : r.endDelta > 1;
    });
    const worsened = ranking.filter(r => {
      const negBetter = ['corruption', 'polarization', 'wealthConcentration'];
      return negBetter.includes(r.metric) ? r.endDelta > 1 : r.endDelta < -1;
    });

    summary.innerHTML = `
      <strong>Summary:</strong> ${improved.length} metric(s) improved, ${worsened.length} worsened, ${ranking.length - improved.length - worsened.length} roughly unchanged.<br/>
      <span style="color:var(--text-dim);">Total divergence score: ${totalDiv.toFixed(1)} (higher = more different from original).</span>
    `;
    body.appendChild(summary);

    // Delete fork button
    const delBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '🗑️ Delete This Fork');
    delBtn.style.marginTop = '12px';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this fork?')) {
        engine.deleteFork(forkId);
        this.selectedForkId = engine.forks[engine.forks.length - 1]?.id || null;
        this._updateLabButton();
        this.render();
      }
    });
    body.appendChild(delBtn);
  }

  // ── Lab button visibility ───────────────────────────────────
  _updateLabButton() {
    const btn = Utils.el('btn-lab');
    if (!btn) return;
    const engine = this._engine();
    if (engine && (engine.snapshots.length > 0 || engine.forks.length > 0)) {
      btn.style.display = '';
    }
  }
}
