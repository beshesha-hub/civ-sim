/**
 * paradigm_panel.js — Paradigm Shifts Panel (Pass 7 + Pass 8)
 * Keyboard shortcut: P  |  Button: 🔄 Paradigm
 * Tabs: Current State | Trigger Shift | History | Analysis | Facilitation | Thresholds
 */

class ParadigmShiftsPanel {
  constructor(game) {
    this.game           = game;
    this.visible        = false;
    this.activeTab      = 'current';   // 'current'|'trigger'|'history'|'analysis'|'facilitation'|'thresholds'
    // Trigger tab state (preserved across renders)
    this._selectedShiftId    = null;
    this._selectedTargetModel = null;
    this._selectedStrategies = [];
  }

  // ── Visibility ───────────────────────────────────────────────
  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('paradigm-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('paradigm-panel'));
  }

  toggle() { this.visible ? this.hide() : this.show(); }

  // ── Helpers ──────────────────────────────────────────────────
  _civ() {
    return this.game?.civilizations?.find(c => c.isPlayerCiv) ?? this.game?.civilizations?.[0] ?? null;
  }

  _bar(label, value, maxVal = 100, colorClass = '') {
    const wrap  = Utils.createEl('div', 'society-stat-bar-wrap');
    const lbl   = Utils.createEl('span', 'society-stat-label', label);
    const track = Utils.createEl('div', 'society-stat-track');
    const fill  = Utils.createEl('div', `society-stat-bar ${colorClass}`);
    fill.style.width = Math.max(0, Math.min(100, (value / maxVal) * 100)).toFixed(1) + '%';
    const val   = Utils.createEl('span', 'society-stat-val', `${Math.round(value)}`);
    track.appendChild(fill);
    wrap.appendChild(lbl);
    wrap.appendChild(track);
    wrap.appendChild(val);
    return wrap;
  }

  _section(title) { return Utils.createEl('h3', 'society-section-title', title); }

  _colorFor(v, lo = 30, hi = 60) {
    if (v < lo) return 'bar-red';
    if (v < hi) return 'bar-amber';
    return 'bar-green';
  }

  _exportTXT(text, filename) {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = (filename ?? 'export') + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { console.warn('[ParadigmShiftsPanel._exportTXT]', err); }
  }

  _exportCSV(rows, filename) {
    try {
      const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = (filename ?? 'export') + '.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { console.warn('[ParadigmShiftsPanel._exportCSV]', err); }
  }

  // ── Root Render ──────────────────────────────────────────────
  render() {
    const panel = Utils.el('paradigm-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', '', '🔄 Paradigm Shifts');
    title.style.margin = '0';
    titleWrap.appendChild(title);
    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => {
      this.hide();
      Utils.el('btn-paradigm')?.classList.remove('btn-map-active');
    };
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', 'panel-tabs');
    [
      { id: 'current',      label: '📊 Current State' },
      { id: 'trigger',      label: '⚡ Trigger Shift' },
      { id: 'history',      label: '📜 History' },
      { id: 'analysis',     label: '🔍 Analysis' },
      { id: 'facilitation', label: '🎓 Facilitation' },
      { id: 'thresholds',   label: '🚨 Thresholds' },
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
      content.appendChild(Utils.createEl('p', '', 'No civilization active.'));
      return;
    }

    if      (this.activeTab === 'current')      this._renderCurrent(content, civ);
    else if (this.activeTab === 'trigger')      this._renderTrigger(content, civ);
    else if (this.activeTab === 'history')      this._renderHistory(content, civ);
    else if (this.activeTab === 'analysis')     this._renderAnalysis(content, civ);
    else if (this.activeTab === 'facilitation') this._renderFacilitation(content, civ);
    else if (this.activeTab === 'thresholds')   this._renderThresholds(content, civ);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: CURRENT STATE
  // ═══════════════════════════════════════════════════════════
  _renderCurrent(c, civ) {
    const s   = civ.state;
    const pss = s.paradigmShiftState ?? {};
    const cg  = s.culturalGap ?? {};
    const wc  = s.wealthCapture ?? {};

    const readiness = cg.paradigmShiftReadiness ?? 0;
    const res       = pss.resistanceScore   ?? 50;
    const enh       = pss.enhancementScore  ?? 50;
    const active    = pss.activeShifts      ?? [];

    // Readiness headline badge
    const rColor = readiness > 70 ? '#ef4444' : readiness > 40 ? '#f59e0b' : '#22c55e';
    const rBadge = Utils.createEl('div', 'society-tier-badge');
    rBadge.style.cssText = `background:${rColor}22;border:1px solid ${rColor};color:${rColor};margin-bottom:8px;`;
    rBadge.textContent = `Paradigm Shift Readiness: ${readiness.toFixed(0)} / 100`;
    c.appendChild(rBadge);

    c.appendChild(this._bar('Shift Readiness',      readiness, 100, this._colorFor(readiness, 30, 60)));
    c.appendChild(this._bar('Resistance Score',     res,       100, this._colorFor(100 - res, 30, 60)));
    c.appendChild(this._bar('Enhancement Score',    enh,       100, this._colorFor(enh, 30, 60)));
    c.appendChild(this._bar('Cultural Gap',         cg.gapScore ?? 0, 100, this._colorFor(cg.gapScore ?? 0, 25, 50)));
    c.appendChild(this._bar('Cynicism Level',       cg.cynicismLevel ?? 0, 100, this._colorFor(cg.cynicismLevel ?? 0, 30, 60)));
    c.appendChild(this._bar('Wealth Capture',       wc.degree ?? 0, 100, this._colorFor(100 - (wc.degree ?? 0), 30, 60)));

    // Current gov/econ — display human-readable labels
    const govId  = civ.governance?.modelId ?? '—';
    const econId = civ.economic?.modelId ?? '—';
    const govLabel  = civ.governance?.model?.label ?? (typeof GOVERNANCE_MODELS !== 'undefined' ? GOVERNANCE_MODELS[govId]?.label : null) ?? govId;
    const econLabel = civ.economic?.model?.label ?? (typeof ECONOMIC_MODELS !== 'undefined' ? ECONOMIC_MODELS[econId]?.label : null) ?? econId;
    c.appendChild(this._section('Current Models'));
    const modRow = Utils.createEl('div', 'paradigm-model-row');
    const govBox  = Utils.createEl('div', 'paradigm-model-box');
    govBox.innerHTML  = `<span class="paradigm-model-type">Governance</span><span class="paradigm-model-val">${govLabel}</span>`;
    const econBox = Utils.createEl('div', 'paradigm-model-box');
    econBox.innerHTML = `<span class="paradigm-model-type">Economic</span><span class="paradigm-model-val">${econLabel}</span>`;
    modRow.appendChild(govBox);
    modRow.appendChild(econBox);
    c.appendChild(modRow);

    // Active shifts
    c.appendChild(this._section(`Active Shifts (${active.length})`));
    if (active.length === 0) {
      c.appendChild(Utils.createEl('p', 'society-help-text', 'No paradigm shifts currently in progress.'));
    } else {
      active.forEach(as => {
        const card = Utils.createEl('div', 'paradigm-shift-card active');
        const label = this._shiftLabel(as.shiftId, as.type);
        card.innerHTML = `
          <div class="paradigm-card-title">${as.type === 'governance' ? '🏛' : '💰'} ${label}</div>
          <div class="paradigm-card-meta">→ ${as.targetModel ?? '?'} | Turns remaining: ${as.turnsRemaining ?? '?'} | Step: ${(as.consequenceStep ?? 0) + 1}</div>
          <div class="paradigm-card-strat">Strategies: ${(as.strategiesActive ?? []).join(', ') || 'none'}</div>`;
        c.appendChild(card);
      });
    }

    // History summary
    const completed = pss.completedShifts ?? [];
    if (completed.length > 0) {
      c.appendChild(this._section(`Completed Shifts (${completed.length})`));
      const btn = Utils.createEl('button', 'btn btn-secondary btn-sm', 'View in History tab →');
      btn.onclick = () => { this.activeTab = 'history'; this.render(); };
      c.appendChild(btn);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: TRIGGER SHIFT
  // ═══════════════════════════════════════════════════════════
  _renderTrigger(c, civ) {
    const s    = civ.state;
    const pss  = s.paradigmShiftState ?? {};
    const gov  = civ.governance?.modelId ?? '';
    const econ = civ.economic?.modelId ?? '';

    const catalog = (typeof PARADIGM_SHIFT_CATALOG !== 'undefined') ? PARADIGM_SHIFT_CATALOG : { governance: [], economic: [] };
    const strategies = (typeof IMPLEMENTATION_STRATEGIES !== 'undefined') ? IMPLEMENTATION_STRATEGIES : [];

    // Find eligible shifts
    const eligibleGov  = catalog.governance.filter(sh => sh.eligibleFrom?.includes(gov));
    const eligibleEcon = catalog.economic.filter(sh  => sh.eligibleFrom?.includes(econ));
    const allEligible  = [...eligibleGov.map(sh => ({...sh, type:'governance'})), ...eligibleEcon.map(sh => ({...sh, type:'economic'}))];

    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Select a shift to trigger. Only shifts eligible from your current governance and economic models are shown. Choosing strategies enhances the transition, overcoming resistance from behavioral persistence.'));

    if (allEligible.length === 0) {
      c.appendChild(Utils.createEl('div', 'society-alert-badge society-alert-amber',
        '⚠ No eligible paradigm shifts available from current models. Consider moving toward a transitional model first.'));
      return;
    }

    // Shift selection cards
    c.appendChild(this._section('Available Shifts'));
    allEligible.forEach(sh => {
      const isSelected = this._selectedShiftId === sh.id;
      const card = Utils.createEl('div', 'paradigm-shift-card selectable' + (isSelected ? ' selected' : ''));
      const dirIcon = { flattening:'↓ Power', concentrating:'↑ Power', extractive:'← Extractive', redistributive:'→ Redistributive',
                        authoritarian:'⚑ Authoritarian', stabilizing:'⚖ Stabilizing', collapse:'✕ Collapse', none:'— ' }[sh.direction ?? ''] ?? sh.direction ?? '';
      card.innerHTML = `
        <div class="paradigm-card-title">${sh.type === 'governance' ? '🏛' : '💰'} ${sh.label} <span class="paradigm-card-dir">${dirIcon}</span></div>
        <div class="paradigm-card-desc">${sh.description ?? ''}</div>
        <div class="paradigm-card-targets">→ Target: ${(sh.targetModels ?? []).join(' / ')}</div>`;
      card.onclick = () => {
        this._selectedShiftId     = sh.id;
        this._selectedTargetModel = sh.targetModels?.[0] ?? null;
        this._selectedStrategies  = [];
        this.render();
      };
      c.appendChild(card);

      // If this card is selected, show detail panel inline
      if (isSelected) {
        const detail = Utils.createEl('div', 'paradigm-detail-panel');

        // Target model selector (if multiple targets)
        if ((sh.targetModels?.length ?? 0) > 1) {
          const tRow = Utils.createEl('div', 'paradigm-target-row');
          tRow.appendChild(Utils.createEl('span', 'paradigm-detail-label', 'Target model: '));
          const tSel = Utils.createEl('select', 'paradigm-target-select');
          sh.targetModels.forEach(tm => {
            const opt = document.createElement('option');
            opt.value = tm; opt.textContent = tm;
            if (tm === this._selectedTargetModel) opt.selected = true;
            tSel.appendChild(opt);
          });
          tSel.onchange = () => { this._selectedTargetModel = tSel.value; };
          tRow.appendChild(tSel);
          detail.appendChild(tRow);
        }

        // Resistance factors
        if (sh.resistanceFactors?.length > 0) {
          detail.appendChild(Utils.createEl('div', 'paradigm-detail-label', 'Resistance factors:'));
          const rfList = Utils.createEl('ul', 'paradigm-factor-list');
          sh.resistanceFactors.forEach(rf => {
            const li = document.createElement('li');
            li.className = 'paradigm-factor-item';
            li.textContent = `${rf.label} (weight: ${Math.round(rf.weight * 100)}%)`;
            rfList.appendChild(li);
          });
          detail.appendChild(rfList);
        }

        // Enhancement factors
        if (sh.enhancementFactors?.length > 0) {
          detail.appendChild(Utils.createEl('div', 'paradigm-detail-label', 'Enhancement factors:'));
          const efList = Utils.createEl('ul', 'paradigm-factor-list');
          sh.enhancementFactors.forEach(ef => {
            const li = document.createElement('li');
            li.className = 'paradigm-factor-item green';
            li.textContent = `${ef.label} (weight: ${Math.round(ef.weight * 100)}%)`;
            efList.appendChild(li);
          });
          detail.appendChild(efList);
        }

        // Immediate effects
        if (sh.immediateEffects) {
          const effStr = Object.entries(sh.immediateEffects)
            .map(([k, v]) => `${k}: ${v >= 0 ? '+' : ''}${v}`)
            .join('  |  ');
          detail.appendChild(Utils.createEl('div', 'paradigm-detail-label', `Immediate effects: ${effStr}`));
        }

        // Strategy selection
        if (strategies.length > 0) {
          detail.appendChild(Utils.createEl('div', 'paradigm-detail-label', 'Select implementation strategies:'));
          const stratGrid = Utils.createEl('div', 'paradigm-strat-grid');
          strategies.forEach(strat => {
            const isRecommended = sh.recommendedStrategies?.includes(strat.id);
            const isChecked     = this._selectedStrategies.includes(strat.id);
            const sCard = Utils.createEl('div', 'paradigm-strat-card' + (isRecommended ? ' recommended' : '') + (isChecked ? ' checked' : ''));
            const cb    = Utils.createEl('input', '');
            cb.type    = 'checkbox';
            cb.checked = isChecked;
            cb.id      = `strat-cb-${strat.id}`;
            cb.onchange = () => {
              if (cb.checked) { if (!this._selectedStrategies.includes(strat.id)) this._selectedStrategies.push(strat.id); }
              else             { this._selectedStrategies = this._selectedStrategies.filter(x => x !== strat.id); }
            };
            const lbl = Utils.createEl('label', 'paradigm-strat-label');
            lbl.htmlFor    = cb.id;
            lbl.innerHTML  = `<strong>${strat.label}${isRecommended ? ' ★' : ''}</strong><br><span class="paradigm-strat-desc">${strat.description ?? ''}</span>`;
            sCard.appendChild(cb);
            sCard.appendChild(lbl);
            stratGrid.appendChild(sCard);
          });
          detail.appendChild(stratGrid);
        }

        // Confirm button
        const confirmRow = Utils.createEl('div', 'society-export-row');
        const confirmBtn = Utils.createEl('button', 'btn btn-danger', '⚡ Trigger This Shift');
        confirmBtn.style.marginTop = '8px';
        confirmBtn.onclick = () => {
          const targetModel = this._selectedTargetModel ?? sh.targetModels?.[0];
          if (!targetModel) {
            alert('Select a target model first.');
            return;
          }
          const sim = this.game?.simulation;
          if (sim && typeof sim.triggerParadigmShift === 'function') {
            sim.triggerParadigmShift(civ, sh.id, targetModel, [...this._selectedStrategies]);
            this._selectedShiftId     = null;
            this._selectedTargetModel = null;
            this._selectedStrategies  = [];
            this.activeTab = 'current';
            this.render();
          } else {
            console.warn('[ParadigmShiftsPanel] simulation.triggerParadigmShift not available');
          }
        };
        confirmRow.appendChild(confirmBtn);
        detail.appendChild(confirmRow);
        c.appendChild(detail);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: HISTORY
  // ═══════════════════════════════════════════════════════════
  _renderHistory(c, civ) {
    const pss       = civ.state?.paradigmShiftState ?? {};
    const completed = pss.completedShifts ?? [];
    const shiftLog  = pss.history ?? [];
    const active    = pss.activeShifts ?? [];

    if (completed.length === 0 && shiftLog.length === 0 && active.length === 0) {
      c.appendChild(Utils.createEl('p', 'society-help-text', 'No paradigm shifts have been initiated or completed yet.'));
      return;
    }

    // Active shifts in progress
    if (active.length > 0) {
      c.appendChild(this._section(`Active Shifts (${active.length})`));
      active.forEach(as => {
        const card = Utils.createEl('div', 'paradigm-shift-card active');
        const label = this._shiftLabel(as.shiftId, as.type);
        card.innerHTML = `
          <div class="paradigm-card-title">${as.type === 'governance' ? '🏛' : '💰'} ${label}</div>
          <div class="paradigm-card-meta">${as.fromModel ?? '?'} → ${as.targetModel ?? '?'} | Turns remaining: ${as.turnsRemaining ?? '?'} | Step: ${(as.consequenceStep ?? 0) + 1}</div>
          <div class="paradigm-card-strat">Strategies: ${(as.strategiesActive ?? []).join(', ') || 'none'}</div>`;
        c.appendChild(card);
      });
    }

    // Shift initiation log
    if (shiftLog.length > 0) {
      c.appendChild(this._section(`Shift Log (${shiftLog.length})`));
      const logHelp = Utils.createEl('p', 'society-help-text',
        'Record of all paradigm shifts initiated (most recent first).');
      c.appendChild(logHelp);
      shiftLog.forEach(entry => {
        const card = Utils.createEl('div', 'paradigm-shift-card');
        const label = this._shiftLabel(entry.shiftId, '');
        card.innerHTML = `
          <div class="paradigm-card-title">${label}</div>
          <div class="paradigm-card-meta">Turn ${entry.turn ?? '?'} (Year ${entry.year ?? '?'}) → Target: ${entry.targetModelId ?? '?'}</div>
          <div class="paradigm-card-strat">Strategies selected: ${(entry.strategiesSelected ?? []).join(', ') || 'none'}</div>`;
        c.appendChild(card);
      });
    }

    // Completed shifts list
    if (completed.length > 0) {
      c.appendChild(this._section('Completed Shifts'));
      // newest first
      [...completed].reverse().forEach(cs => {
        const card = Utils.createEl('div', 'paradigm-shift-card completed');
        const label = this._shiftLabel(cs.shiftId, cs.type);
        const outcomes = cs.outcomes ? JSON.stringify(cs.outcomes).replace(/[{}\"]/g,'').substring(0, 80) : '—';
        card.innerHTML = `
          <div class="paradigm-card-title">${cs.type === 'governance' ? '🏛' : '💰'} ${label}</div>
          <div class="paradigm-card-meta">${cs.from ?? '?'} → ${cs.to ?? '?'} | Completed turn ${cs.completedTurn ?? '?'}</div>
          <div class="paradigm-card-strat">Strategies used: ${(cs.strategiesUsed ?? []).join(', ') || 'none'}</div>
          <div class="paradigm-card-outcomes">Outcomes: ${outcomes}</div>`;
        c.appendChild(card);
      });

      const histCsvBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 Export CSV');
      histCsvBtn.style.margin = '0 16px 12px';
      histCsvBtn.onclick = () => this._exportCSV(
        [['ShiftId','Type','From','To','CompletedTurn','Strategies'],
         ...completed.map(cs => [cs.shiftId??'', cs.type??'', cs.from??'', cs.to??'', cs.completedTurn??'', (cs.strategiesUsed??[]).join(';')])],
        'paradigm-shift-history'
      );
      c.appendChild(histCsvBtn);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: ANALYSIS
  // ═══════════════════════════════════════════════════════════
  _renderAnalysis(c, civ) {
    const s   = civ.state;
    const pss = s.paradigmShiftState ?? {};
    const cg  = s.culturalGap ?? {};
    const wc  = s.wealthCapture ?? {};
    const eri = s.empathyReinforcementInteraction ?? {};

    c.appendChild(this._section('Readiness Drivers'));

    // Contributing factors
    const factors = [
      { label: 'Paradigm Shift Readiness', value: cg.paradigmShiftReadiness  ?? 0, note: 'From cynicism × epistemic health × cultural gap', color: 'bar-green' },
      { label: 'Revolutionary Consciousness', value: cg.revolutionaryConsciousness ?? 0, color: 'bar-green' },
      { label: 'Cynicism Level',           value: cg.cynicismLevel           ?? 0, note: 'Stable — hard to reverse', color: 'bar-amber' },
      { label: 'Cultural Gap',             value: cg.gapScore                ?? 0, note: 'Stated vs. reinforced values', color: 'bar-amber' },
      { label: 'Wealth Capture (limits)',  value: wc.degree                  ?? 0, note: 'High capture resists democratic shifts', color: 'bar-red' },
      { label: 'Interaction Type',         value: eri.combinedScore          ?? 50, note: `Type: ${eri.interactionType ?? 'neutral'}`, color: 'bar-green' },
      { label: 'Resistance Score',         value: pss.resistanceScore        ?? 50, note: 'Structural resistance to change', color: 'bar-red' },
      { label: 'Enhancement Score',        value: pss.enhancementScore       ?? 50, note: 'Structural conditions favoring change', color: 'bar-green' },
    ];

    factors.forEach(f => {
      const wrap = this._bar(f.label, f.value, 100, f.color);
      if (f.note) {
        const note = Utils.createEl('span', 'society-stat-note', f.note);
        wrap.appendChild(note);
      }
      c.appendChild(wrap);
    });

    // Narrative
    c.appendChild(this._section('Analysis'));
    const narr = this._narrativeAnalysis(s, civ);
    c.appendChild(Utils.createEl('p', 'society-summary-box', narr));

    // Export buttons
    const exportRow = Utils.createEl('div', 'society-export-row');
    const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 TXT');
    txtBtn.onclick = () => this._exportTXT(narr, 'paradigm-analysis');
    exportRow.appendChild(txtBtn);
    c.appendChild(exportRow);
  }

  _narrativeAnalysis(s, civ) {
    const pss  = s.paradigmShiftState ?? {};
    const cg   = s.culturalGap ?? {};
    const wc   = s.wealthCapture ?? {};
    const govId2  = civ?.governance?.modelId ?? '—';
    const econId2 = civ?.economic?.modelId ?? '—';
    const govLbl2  = civ?.governance?.model?.label ?? (typeof GOVERNANCE_MODELS !== 'undefined' ? GOVERNANCE_MODELS[govId2]?.label : null) ?? govId2;
    const econLbl2 = civ?.economic?.model?.label ?? (typeof ECONOMIC_MODELS !== 'undefined' ? ECONOMIC_MODELS[econId2]?.label : null) ?? econId2;
    const rd   = cg.paradigmShiftReadiness  ?? 0;
    const res  = pss.resistanceScore ?? 50;
    const enh  = pss.enhancementScore ?? 50;
    const parts = [];

    parts.push(`Current regime: ${govLbl2} / ${econLbl2}.`);

    if (rd < 25) parts.push('Paradigm shift readiness is low. The population is not yet primed for systemic change — cynicism and revolutionary consciousness remain insufficient.');
    else if (rd < 55) parts.push('Paradigm shift readiness is building. Conditions are not yet critical, but latent pressure is accumulating.');
    else if (rd < 75) parts.push('Paradigm shift readiness is significant. A substantial portion of the population recognizes systemic contradictions — conditions favor the possibility of major change.');
    else parts.push('Paradigm shift readiness is very high — conditions for systemic transformation are present. A triggering event or strategic catalyst could accelerate rapid change.');

    if (res > 65) parts.push(`High structural resistance (${Math.round(res)}) — entrenched interests, wealth capture, and cultural inertia will heavily contest any transition.`);
    else if (res < 35) parts.push(`Low structural resistance (${Math.round(res)}) — the regime is relatively permeable to change; transitions may proceed with less institutional conflict than usual.`);

    if (enh > 65) parts.push(`Strong enhancement conditions (${Math.round(enh)}) — epistemic health, institutional quality, and prosocial dynamics are all aligned to support successful transitions.`);

    if (wc.degree > 70) parts.push('Warning: high wealth capture will resist wealth-redistributive and democratizing shifts particularly strongly. Address wealth capture directly before or during any transition.');

    const completed = (pss.completedShifts ?? []).length;
    if (completed > 0) parts.push(`This civilization has completed ${completed} paradigm shift(s), demonstrating structural plasticity.`);

    return parts.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: FACILITATION (Pass 8)
  // ═══════════════════════════════════════════════════════════
  _renderFacilitation(c, civ) {
    const s  = civ.state;
    const fs = s.facilitationState ?? {};
    const bi = s.behaviorInertia ?? {};
    const catalog = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];
    const turn = this.game?.turnCount ?? 0;

    // ── Inertia summary ────────────────────────────────────────
    c.appendChild(this._section('Behavioral Inertia'));
    const coeff = bi.coefficient ?? 0;
    c.appendChild(this._bar('Inertia Coefficient', coeff, 100, coeff > 70 ? 'bar-red' : coeff > 40 ? 'bar-amber' : 'bar-green'));
    const pending = Object.values(bi.deferredShift ?? {}).reduce((sum, v) => sum + Math.abs(v ?? 0), 0);
    const pendEl = Utils.createEl('p', 'society-narrative', `Pending behavioral shift magnitude: ${pending.toFixed(1)} units across ${Object.keys(bi.deferredShift ?? {}).length} dimensions. At current inertia (${Math.round(coeff)}), shifts arrive at ${Math.round((1 - coeff / 100) * 25)}%/turn.`);
    c.appendChild(pendEl);

    // Inertia chart
    if (Array.isArray(bi.inertiaHistory) && bi.inertiaHistory.length > 1) {
      const canvas = document.createElement('canvas');
      canvas.width = 460; canvas.height = 140;
      canvas.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
      c.appendChild(canvas);
      ChartUtils.drawInertiaChart(canvas, bi.inertiaHistory);

      const exportRow = Utils.createEl('div', 'society-export-row');
      const pngBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '🖼 PNG');
      pngBtn.onclick = () => ChartUtils.exportPNG(canvas, `inertia-${turn}`);
      const csvBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      csvBtn.onclick = () => this._exportCSV(
        bi.inertiaHistory.map(d => [d.turn, d.coefficient, d.pendingMagnitude]),
        'inertia-history', ['turn','coefficient','pendingMagnitude']
      );
      exportRow.appendChild(pngBtn); exportRow.appendChild(csvBtn);
      c.appendChild(exportRow);
    }

    // ── Structural ceiling ─────────────────────────────────────
    c.appendChild(this._section('Structural Ceiling vs. Current Behavior'));
    const ceiling = fs.structuralCeiling ?? {};
    const br = s.behaviorReinforcement ?? {};
    if (Object.keys(ceiling).length > 0) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = 460; canvas2.height = 240;
      canvas2.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
      c.appendChild(canvas2);
      ChartUtils.drawFacilitationCeilingChart(canvas2, ceiling, br);
      const pngBtn2 = Utils.createEl('button', 'btn btn-secondary btn-sm', '🖼 PNG');
      pngBtn2.onclick = () => ChartUtils.exportPNG(canvas2, `facilitation-ceiling-${turn}`);
      c.appendChild(pngBtn2);
    }

    // ── Active measures ────────────────────────────────────────
    c.appendChild(this._section(`Active Measures (${(fs.activeMeasures ?? []).length})`));
    if ((fs.activeMeasures ?? []).length === 0) {
      c.appendChild(Utils.createEl('p', 'society-narrative', 'No facilitation measures currently active. Activate measures below to accelerate behavioral realignment after paradigm shifts.'));
    } else {
      (fs.activeMeasures ?? []).forEach(am => {
        const def = catalog.find(m => m.id === am.measureId);
        if (!def) return;
        const card = Utils.createEl('div', 'paradigm-shift-card');
        const hdr = Utils.createEl('div', 'paradigm-shift-card-header');
        hdr.appendChild(Utils.createEl('strong', '', def.label));
        const info = def.durationTurns > 0 ? `${am.turnsRemaining ?? '?'} turns remaining` : 'Indefinite';
        hdr.appendChild(Utils.createEl('span', 'paradigm-shift-dir', info));
        card.appendChild(hdr);
        card.appendChild(Utils.createEl('p', 'paradigm-shift-desc', `Active for ${am.turnsActive ?? 0} turns. ${def.description}`));
        const deactBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '⏹ Deactivate');
        deactBtn.onclick = () => {
          this.game.simulation?.applyExternalEvent({ type: 'deactivate_facilitation_measure', measureId: am.measureId }, [civ.id]);
          this.render();
        };
        card.appendChild(deactBtn);
        c.appendChild(card);
      });
    }

    // Facilitation history export
    if (Array.isArray(fs.facilitationHistory) && fs.facilitationHistory.length > 0) {
      const exportRow2 = Utils.createEl('div', 'society-export-row');
      const csvBtn2 = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 History CSV');
      csvBtn2.onclick = () => this._exportCSV(
        fs.facilitationHistory.map(d => [d.turn, d.measuresActive, d.totalCynicismReduction, d.totalCoopBoost]),
        'facilitation-history', ['turn','measuresActive','cynicismReduction','coopBoost']
      );
      exportRow2.appendChild(csvBtn2);
      c.appendChild(exportRow2);
    }

    // ── Available measures catalog ─────────────────────────────
    c.appendChild(this._section('Available Measures'));
    const eh = s.epistemicHealth ?? 50;
    const feudal = s.wealthCapture?.feudalDynamic ?? false;

    catalog.forEach(def => {
      const isActive = (fs.activeMeasures ?? []).some(m => m.measureId === def.id);
      const isBlocked = feudal && (def.unavailableWhen ?? []).includes('feudalDynamic');
      const card = Utils.createEl('div', 'paradigm-shift-card' + (isBlocked ? ' shift-card-disabled' : ''));
      const hdr = Utils.createEl('div', 'paradigm-shift-card-header');
      hdr.appendChild(Utils.createEl('strong', '', def.label));
      const catTag = Utils.createEl('span', 'paradigm-shift-dir', def.category);
      hdr.appendChild(catTag);
      card.appendChild(hdr);
      card.appendChild(Utils.createEl('p', 'paradigm-shift-desc', def.description));

      const meta = Utils.createEl('div', 'paradigm-shift-factors');
      meta.appendChild(Utils.createEl('span', '', `Cost: ${def.cost}/turn`));
      meta.appendChild(Utils.createEl('span', '', `Duration: ${def.durationTurns > 0 ? def.durationTurns + ' turns' : 'Indefinite'}`));
      meta.appendChild(Utils.createEl('span', '', `EH required: ${def.effects.ehRequirement}`));
      if (def.propagandaRisk > 0) meta.appendChild(Utils.createEl('span', 'society-stat-note', '⚠ Propaganda risk if EH < 30'));
      if (eh < (def.effects.ehRequirement ?? 0)) meta.appendChild(Utils.createEl('span', 'society-stat-note', '⚠ EH too low — reduced effectiveness'));
      card.appendChild(meta);

      if (!isBlocked && !isActive) {
        const actBtn = Utils.createEl('button', 'btn btn-primary btn-sm', '▶ Activate');
        actBtn.onclick = () => {
          this.game.simulation?.applyExternalEvent({ type: 'activate_facilitation_measure', measureId: def.id }, [civ.id]);
          this.render();
        };
        card.appendChild(actBtn);
      } else if (isActive) {
        card.appendChild(Utils.createEl('span', 'society-stat-note', '✓ Active'));
      } else if (isBlocked) {
        card.appendChild(Utils.createEl('span', 'society-stat-note', '🔒 Blocked — feudal dynamic active'));
      }
      c.appendChild(card);
    });

    // ── Pass 9: Research View toggle ──────────────────────────
    const facilResearchId = 'facilitation-research-view';
    const facToggleBtn = Utils.createEl('button', 'research-view-toggle', '+ Research View');
    facToggleBtn.onclick = () => {
      const sec = Utils.el(facilResearchId);
      if (!sec) return;
      const isOpen = sec.classList.toggle('research-view-open');
      facToggleBtn.textContent = isOpen ? '− Research View' : '+ Research View';
      if (isOpen && !sec._p9rendered) {
        sec._p9rendered = true;
        this._renderFacilitationResearchView(sec, civ);
      }
    };
    c.appendChild(facToggleBtn);
    const facilResearchSec = Utils.createEl('div', 'research-view-section');
    facilResearchSec.id = facilResearchId;
    c.appendChild(facilResearchSec);
  }

  _renderFacilitationResearchView(sec, civ) {
    const s  = civ?.state;
    const fs = s?.facilitationState;

    // Structural ceiling chart
    sec.appendChild(Utils.createEl('h4', 'param-section-title', 'Structural Ceiling vs. Current Behaviors'));
    const ccCanvas = document.createElement('canvas');
    ccCanvas.width = 460; ccCanvas.height = 160;
    ccCanvas.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
    sec.appendChild(ccCanvas);
    if (typeof ChartUtils !== 'undefined') {
      ChartUtils.drawFacilitationCeilingChart(ccCanvas, fs?.structuralCeiling ?? {}, s?.behaviorReinforcement ?? {});
    }

    // Facilitation history CSV export
    sec.appendChild(Utils.createEl('h4', 'param-section-title', 'Facilitation History Export'));
    const csvBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 Download Facilitation CSV');
    csvBtn.onclick = () => {
      const hist = fs?.facilitationHistory ?? [];
      const rows = [['turn','measures_active','cynicism_reduction','coop_boost']];
      for (const e of hist) rows.push([e.turn??'', e.measuresActive??'', e.totalCynicismReduction??'', e.totalCoopBoost??'']);
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'facilitation-history.csv'; a.click();
      URL.revokeObjectURL(url);
    };
    sec.appendChild(csvBtn);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: THRESHOLDS (Pass 8)
  // ═══════════════════════════════════════════════════════════
  _renderThresholds(c, civ) {
    const s  = civ.state;
    const te = s.thresholdEvents ?? {};
    const defs = (typeof THRESHOLD_DEFINITIONS !== 'undefined') ? THRESHOLD_DEFINITIONS : [];

    // ── Current status dashboard ───────────────────────────────
    c.appendChild(this._section('Current Threshold Status'));

    const grid = Utils.createEl('div', 'threshold-grid');
    const evalField = (def) => {
      if (typeof def.customCheck === 'function') {
        try { return def.customCheck(s) ? 'exceeded' : 'ok'; } catch(e) { return 'ok'; }
      }
      if (!def.field) return 'ok';
      const parts = def.field.split('.');
      let val = s;
      for (const p of parts) { val = val?.[p]; if (val === undefined) return 'ok'; }
      if (def.trigger === '>=')  return val >= def.value ? 'exceeded' : 'ok';
      if (def.trigger === '<=')  return val <= def.value ? 'exceeded' : 'ok';
      if (def.trigger === '===') return val === def.value ? 'exceeded' : 'ok';
      if (def.trigger === '>')   return val >  def.value ? 'exceeded' : 'ok';
      if (def.trigger === '<')   return val <  def.value ? 'exceeded' : 'ok';
      return 'ok';
    };

    defs.forEach(def => {
      const status = evalField(def);
      const card = Utils.createEl('div', `threshold-card threshold-${status} threshold-${def.severity ?? 'info'}`);
      card.style.cssText = `border-left:3px solid ${def.color ?? '#f59e0b'};padding:6px 8px;margin:3px 0;border-radius:3px;background:#1e293b;`;
      const label = Utils.createEl('div', '', '');
      label.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
      const nameSpan = Utils.createEl('span', '', def.label);
      nameSpan.style.cssText = `font-size:12px;font-weight:600;color:${def.color ?? '#f59e0b'};`;
      const statusSpan = Utils.createEl('span', '', status === 'exceeded' ? '⚠ EXCEEDED' : '✓');
      statusSpan.style.cssText = `font-size:11px;color:${status === 'exceeded' ? def.color ?? '#f59e0b' : '#22c55e'};`;
      label.appendChild(nameSpan); label.appendChild(statusSpan);
      card.appendChild(label);
      const inCooldown = (te._cooldowns?.[def.id] ?? 0) > 0;
      if (inCooldown) {
        const cd = Utils.createEl('span', 'society-stat-note', `Cooldown: ${te._cooldowns[def.id]} turns`);
        card.appendChild(cd);
      }
      grid.appendChild(card);
    });
    c.appendChild(grid);

    // ── Event log ──────────────────────────────────────────────
    const fired = te.fired ?? [];
    c.appendChild(this._section(`Threshold Events (last ${fired.length})`));

    if (fired.length === 0) {
      c.appendChild(Utils.createEl('p', 'society-narrative', 'No threshold events have fired yet. Thresholds will fire as the civilization crosses key turning points.'));
    } else {
      const logWrap = Utils.createEl('div', '');
      logWrap.style.cssText = 'max-height:300px;overflow-y:auto;';
      fired.forEach(ev => {
        const item = Utils.createEl('div', '');
        item.style.cssText = `border-left:3px solid ${ev.color ?? '#f59e0b'};padding:6px 10px;margin:4px 0;background:#0f172a;border-radius:3px;`;
        const meta = Utils.createEl('div', '');
        meta.style.cssText = 'display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:3px;';
        meta.appendChild(Utils.createEl('span', '', `${ev.label} — Turn ${ev.turn}`));
        meta.appendChild(Utils.createEl('span', '', ev.severity?.toUpperCase() ?? 'INFO'));
        item.appendChild(meta);
        item.appendChild(Utils.createEl('p', '', ev.text));
        logWrap.appendChild(item);
      });
      c.appendChild(logWrap);

      // Export
      const exportRow = Utils.createEl('div', 'society-export-row');
      const csvBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      csvBtn.onclick = () => this._exportCSV(
        fired.map(ev => [ev.turn, ev.year ?? '', ev.thresholdId, ev.label, ev.severity]),
        'threshold-events', ['turn','year','thresholdId','label','severity']
      );
      const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📄 TXT');
      txtBtn.onclick = () => {
        const lines = fired.map(ev => `Turn ${ev.turn}: [${ev.severity?.toUpperCase()}] ${ev.label}\n${ev.text}`).join('\n\n');
        this._exportTXT(lines, 'threshold-events');
      };
      exportRow.appendChild(csvBtn); exportRow.appendChild(txtBtn);
      c.appendChild(exportRow);
    }
  }

  // ── Utility: look up shift label from catalog ─────────────────
  _shiftLabel(shiftId, type) {
    if (typeof PARADIGM_SHIFT_CATALOG === 'undefined') return shiftId ?? '—';
    const arr = type === 'governance' ? PARADIGM_SHIFT_CATALOG.governance : PARADIGM_SHIFT_CATALOG.economic;
    const found = (arr ?? []).find(sh => sh.id === shiftId);
    return found?.label ?? shiftId ?? '—';
  }
}
