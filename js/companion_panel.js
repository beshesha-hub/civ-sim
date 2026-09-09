/**
 * companion_panel.js — UI for the Companion Module
 * Keyboard shortcut: shift+c   |   Button: 🔬 Companion
 *
 * Tabs: Demographics | Temporal | Micro-foundations | Diffusion
 */

class CompanionPanel {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.activeTab = 'demographics';
  }

  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('companion-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('companion-panel'));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  _civ() {
    return this.game?.civilizations?.find(c => c.isPlayerCiv) ??
           this.game?.civilizations?.[0] ?? null;
  }

  // ── Root Render ─────────────────────────────────────────────
  render() {
    const panel = Utils.el('companion-panel');
    if (!panel) return;
    panel.innerHTML = '';

    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', 'panel-title', '🔬 Companion Module');
    titleWrap.appendChild(title);
    header.appendChild(titleWrap);

    const closeBtn = Utils.createEl('button', 'panel-close-btn', '✕ Close');
    closeBtn.addEventListener('click', () => this.hide());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', 'society-tabs');
    const tabDefs = [
      { id: 'demographics', icon: '👥', label: 'Demographics' },
      { id: 'temporal',     icon: '⏱️', label: 'Temporal' },
      { id: 'micro',        icon: '🏛️', label: 'Micro-foundations' },
      { id: 'diffusion',    icon: '📡', label: 'Diffusion' },
    ];
    for (const t of tabDefs) {
      const btn = Utils.createEl('button', 'society-tab-btn' +
        (this.activeTab === t.id ? ' active' : ''), `${t.icon} ${t.label}`);
      btn.addEventListener('click', () => { this.activeTab = t.id; this.render(); });
      tabs.appendChild(btn);
    }
    panel.appendChild(tabs);

    const body = Utils.createEl('div', 'panel-body companion-body');
    body.style.padding = '15px';

    const companion = this.game.companion;
    const civ = this._civ();
    if (!companion || !civ) {
      body.appendChild(Utils.createEl('p', '', 'Companion module not active.'));
      panel.appendChild(body);
      return;
    }

    switch (this.activeTab) {
      case 'demographics': this._renderDemographics(body, civ, companion); break;
      case 'temporal':     this._renderTemporal(body, civ, companion); break;
      case 'micro':        this._renderMicro(body, civ, companion); break;
      case 'diffusion':    this._renderDiffusion(body, civ, companion); break;
    }
    panel.appendChild(body);
  }

  // ── Demographics Tab ────────────────────────────────────────
  _renderDemographics(container, civ, companion) {
    const demo = companion.getDemographics(civ.id);
    if (!demo) {
      container.appendChild(Utils.createEl('p', '', 'No demographic data yet. Run a turn.'));
      return;
    }

    container.appendChild(this._sectionHeader('POPULATION OVERVIEW'));

    const grid = Utils.createEl('div', 'companion-metrics-grid');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:16px;';

    grid.appendChild(this._metricCard('Population', this._formatPop(demo.totalPopulation)));
    grid.appendChild(this._metricCard('Male / Female',
      `${this._formatPop(demo.malePop ?? 0)} / ${this._formatPop(demo.femalePop ?? 0)}`));
    grid.appendChild(this._metricCard('Sex Ratio (M:F)', (demo.sexRatio ?? 1).toFixed(3)));
    grid.appendChild(this._metricCard('Median Age', demo.medianAge.toFixed(1)));
    grid.appendChild(this._metricCard('Growth Rate', (demo.growthRate * 100).toFixed(2) + '%'));
    grid.appendChild(this._metricCard('Dep. Ratio', demo.dependencyRatio.toFixed(2)));
    grid.appendChild(this._metricCard('Youth Bulge', demo.youthBulgeIndex.toFixed(1) + '%'));
    grid.appendChild(this._metricCard('Labor Force', demo.laborForceShare.toFixed(1) + '%'));
    grid.appendChild(this._metricCard('Births', this._formatPop(demo.births)));
    grid.appendChild(this._metricCard('Deaths', this._formatPop(demo.deaths)));

    const stageLabels = {1:'Pre-transition',2:'Early transition',3:'Late transition',4:'Post-transition',5:'Second transition'};
    const detStage = demo.detectedStage ?? demo.detectedTransitionStage ?? null;
    if (detStage) {
      grid.appendChild(this._metricCard('Demo. Stage', `${detStage} — ${stageLabels[detStage] ?? '?'}`));
    }
    container.appendChild(grid);

    if (demo.demographicDividend > 0) {
      const div = Utils.createEl('div', 'companion-dividend');
      div.style.cssText = 'background:rgba(45,138,78,0.15);border:1px solid rgba(45,138,78,0.3);border-radius:6px;padding:8px 12px;margin-bottom:16px;font-size:13px;';
      div.textContent = `Demographic Dividend active (${(demo.demographicDividend * 100).toFixed(0)}%) — ` +
        'high labor force share with low dependency enables accelerated growth.';
      container.appendChild(div);
    }

    if ((demo.sexRatio ?? 1) > 1.08) {
      const warn = Utils.createEl('div', '');
      warn.style.cssText = 'background:rgba(196,56,42,0.12);border:1px solid rgba(196,56,42,0.3);border-radius:6px;padding:8px 12px;margin-bottom:16px;font-size:13px;';
      warn.textContent = `Sex ratio imbalance detected (${demo.sexRatio.toFixed(3)} M:F). ` +
        'Surplus males increase competition and instability risk.';
      container.appendChild(warn);
    }

    // Population Pyramid (sex-disaggregated)
    container.appendChild(this._sectionHeader('AGE STRUCTURE'));

    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 360;
    canvas.style.cssText = 'width:100%;max-width:520px;display:block;margin:0 auto;';
    container.appendChild(canvas);
    this._drawPyramidSex(canvas, demo.maleCohorts, demo.femaleCohorts, companion.getCohortLabels());

    // Demographic stage info
    const stage = civ.state.demographicTransitionStage ?? 1;
    const stageNames = ['', 'Pre-Transition', 'Early Transition', 'Late Transition', 'Post-Transition', 'Sub-Replacement'];
    container.appendChild(this._sectionHeader('DEMOGRAPHIC TRANSITION'));
    const stageEl = Utils.createEl('div', '');
    stageEl.style.cssText = 'font-size:13px;line-height:1.6;';
    stageEl.innerHTML = `<strong>Stage ${stage}: ${stageNames[stage] || 'Unknown'}</strong><br>` +
      `Fertility Rate: ${(civ.state.fertilityRate ?? 40).toFixed(1)}/1000 &nbsp;&nbsp; ` +
      `Mortality Rate: ${(civ.state.mortalityRate ?? 30).toFixed(1)}/1000 &nbsp;&nbsp; ` +
      `Life Expectancy: ${(civ.state.lifeExpectancy ?? 50).toFixed(1)} years`;
    container.appendChild(stageEl);
  }

  // ── Temporal Tab ────────────────────────────────────────────
  _renderTemporal(container, civ, companion) {
    container.appendChild(this._sectionHeader('TEMPORAL CALIBRATION'));

    const yearEl = Utils.createEl('div', '');
    yearEl.style.cssText = 'font-size:14px;margin-bottom:16px;';
    yearEl.innerHTML = `<strong>Year:</strong> ${this.game.currentYear ?? 'N/A'} &nbsp;&nbsp; ` +
      `<strong>Turn:</strong> ${this.game.turnCount ?? 0} &nbsp;&nbsp; ` +
      `<strong>Years/Turn:</strong> ${this.game.yearsDelta ?? 10}`;
    container.appendChild(yearEl);

    // Process speed legend
    container.appendChild(this._sectionHeader('PROCESS SPEEDS'));
    const speeds = Utils.createEl('div', '');
    speeds.style.cssText = 'font-size:12px;line-height:1.8;margin-bottom:16px;';
    speeds.innerHTML =
      '<span style="color:#4ade80;">■</span> <strong>Fast</strong> (1-5yr): military, resource allocation<br>' +
      '<span style="color:#fbbf24;">■</span> <strong>Medium</strong> (5-20yr): institutions, economy, education<br>' +
      '<span style="color:#f87171;">■</span> <strong>Slow</strong> (20-50yr): trust, culture, norms';
    container.appendChild(speeds);

    // Rate dampening log
    container.appendChild(this._sectionHeader('RATE-OF-CHANGE MONITOR'));
    const log = companion.getTemporalDampenLog();
    if (log && log.length > 0) {
      const dampenInfo = Utils.createEl('div', '');
      dampenInfo.style.cssText = 'background:rgba(196,56,42,0.12);border:1px solid rgba(196,56,42,0.3);border-radius:6px;padding:10px 12px;margin-bottom:12px;font-size:12px;';
      dampenInfo.innerHTML = `<strong>${log.length} variable(s) dampened this turn</strong> — ` +
        'rate of change exceeded empirical maximum.';
      container.appendChild(dampenInfo);

      const table = Utils.createEl('table', '');
      table.style.cssText = 'width:100%;font-size:12px;border-collapse:collapse;';
      const thead = Utils.createEl('thead', '');
      thead.innerHTML = '<tr style="text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);">' +
        '<th style="padding:4px 8px;">Variable</th>' +
        '<th style="padding:4px 8px;">Speed</th>' +
        '<th style="padding:4px 8px;">Attempted</th>' +
        '<th style="padding:4px 8px;">Allowed</th>' +
        '<th style="padding:4px 8px;">Max/yr</th></tr>';
      table.appendChild(thead);
      const tbody = Utils.createEl('tbody', '');
      for (const entry of log) {
        const tr = Utils.createEl('tr', '');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        const speedColor = entry.processSpeed === 'fast' ? '#4ade80' :
          entry.processSpeed === 'slow' ? '#f87171' : '#fbbf24';
        tr.innerHTML = `<td style="padding:4px 8px;">${entry.variable}</td>` +
          `<td style="padding:4px 8px;color:${speedColor};">${entry.processSpeed ?? 'medium'}</td>` +
          `<td style="padding:4px 8px;color:${Math.abs(entry.attempted) > Math.abs(entry.allowed) ? '#f87171' : 'inherit'};">${entry.attempted.toFixed(2)}</td>` +
          `<td style="padding:4px 8px;">${entry.allowed.toFixed(2)}</td>` +
          `<td style="padding:4px 8px;">${entry.maxRate.toFixed(2)}${entry.isCrisis ? ' (crisis)' : ''}</td>`;
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      container.appendChild(table);
    } else {
      const ok = Utils.createEl('div', '');
      ok.style.cssText = 'color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:12px;';
      ok.textContent = 'All rates of change within empirical bounds this turn.';
      container.appendChild(ok);
    }

    // Rate limit reference
    container.appendChild(this._sectionHeader('EMPIRICAL RATE LIMITS'));
    const refTable = Utils.createEl('table', '');
    refTable.style.cssText = 'width:100%;font-size:12px;border-collapse:collapse;';
    const refHead = Utils.createEl('thead', '');
    refHead.innerHTML = '<tr style="text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);">' +
      '<th style="padding:4px 8px;">Variable</th>' +
      '<th style="padding:4px 8px;">Normal max/yr</th>' +
      '<th style="padding:4px 8px;">Crisis max/yr</th></tr>';
    refTable.appendChild(refHead);
    const refBody = Utils.createEl('tbody', '');
    for (const [key, limits] of Object.entries(COMPANION_RATE_LIMITS)) {
      const tr = Utils.createEl('tr', '');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `<td style="padding:4px 8px;">${key}</td>` +
        `<td style="padding:4px 8px;">${limits.normal}</td>` +
        `<td style="padding:4px 8px;">${limits.crisis}</td>`;
      refBody.appendChild(tr);
    }
    refTable.appendChild(refBody);
    container.appendChild(refTable);
  }

  // ── Micro-foundations Tab ───────────────────────────────────
  _renderMicro(container, civ, companion) {
    const micro = companion.getMicroFoundations(civ.id);
    if (!micro) {
      container.appendChild(Utils.createEl('p', '', 'No micro-foundation data yet. Run a turn.'));
      return;
    }

    container.appendChild(this._sectionHeader('REGIME STABILITY'));

    // Regime transition pressure gauge
    const pressure = micro.regimeTransitionPressure;
    const gaugeWrap = Utils.createEl('div', '');
    gaugeWrap.style.cssText = 'margin-bottom:20px;';

    const gaugeLabel = Utils.createEl('div', '');
    gaugeLabel.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;';
    gaugeLabel.innerHTML = `<span>Regime Transition Pressure</span><span style="font-weight:600;">${pressure.toFixed(1)}/100</span>`;
    gaugeWrap.appendChild(gaugeLabel);

    const gaugeTrack = Utils.createEl('div', '');
    gaugeTrack.style.cssText = 'height:12px;background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;';
    const gaugeFill = Utils.createEl('div', '');
    const pctPressure = Math.min(100, pressure);
    const gaugeColor = pctPressure < 25 ? '#4ade80' : pctPressure < 50 ? '#fbbf24' : pctPressure < 75 ? '#f97316' : '#ef4444';
    gaugeFill.style.cssText = `height:100%;width:${pctPressure}%;background:${gaugeColor};border-radius:6px;transition:width 0.3s;`;
    gaugeTrack.appendChild(gaugeFill);
    gaugeWrap.appendChild(gaugeTrack);
    container.appendChild(gaugeWrap);

    // Component bars
    container.appendChild(this._bar('Elite Cohesion', micro.eliteCohesion, 100,
      micro.eliteCohesion > 60 ? 'bar-green' : micro.eliteCohesion > 35 ? 'bar-amber' : 'bar-red'));
    container.appendChild(this._bar('Mass Grievance', micro.massGrievance, 100,
      micro.massGrievance < 30 ? 'bar-green' : micro.massGrievance < 55 ? 'bar-amber' : 'bar-red'));
    container.appendChild(this._bar('Collective Action Potential', micro.collectiveActionPotential, 100,
      micro.collectiveActionPotential < 30 ? 'bar-green' : micro.collectiveActionPotential < 55 ? 'bar-amber' : 'bar-red'));
    container.appendChild(this._bar('Rent-Seeking Intensity', (micro.rentSeekingIntensity ?? 0.2) * 100, 100,
      micro.rentSeekingIntensity < 0.3 ? 'bar-green' : micro.rentSeekingIntensity < 0.6 ? 'bar-amber' : 'bar-red'));

    // Strata satisfaction with population shares
    container.appendChild(this._sectionHeader('STRATA SATISFACTION'));

    const strata = micro.strataSatisfaction;
    const shares = micro.strataPopShares || {};
    const strataOrder = [
      ['elite', 'Elite'],
      ['upperMiddle', 'Upper Middle'],
      ['lowerMiddle', 'Lower Middle'],
      ['working', 'Working'],
      ['disenfranchised', 'Disenfranchised'],
    ];
    for (const [key, label] of strataOrder) {
      const val = strata[key] ?? 50;
      const share = shares[key] ?? 0;
      const shareLabel = `${label} (${(share * 100).toFixed(0)}%)`;
      container.appendChild(this._bar(shareLabel, val, 100,
        val > 55 ? 'bar-green' : val > 35 ? 'bar-amber' : 'bar-red'));
    }

    // Inter-stratum mobility
    container.appendChild(this._sectionHeader('SOCIAL MOBILITY'));
    const mob = micro.interStrataMobility || {};
    const mobGrid = Utils.createEl('div', '');
    mobGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;';
    mobGrid.appendChild(this._metricCard('Upward', ((mob.upward ?? 0) * 100).toFixed(1) + '%/gen'));
    mobGrid.appendChild(this._metricCard('Downward', ((mob.downward ?? 0) * 100).toFixed(1) + '%/gen'));
    container.appendChild(mobGrid);

    // Transition types note
    container.appendChild(this._sectionHeader('TRANSITION PATHWAYS'));
    const paths = Utils.createEl('div', '');
    paths.style.cssText = 'font-size:12px;line-height:1.7;color:rgba(255,255,255,0.6);';
    const T = COMPANION_TRANSITION_THRESHOLDS;
    paths.innerHTML =
      `<strong>Popular Revolution:</strong> pressure>${T.popularRevolution.pressureMin}, CAP>${T.popularRevolution.collectiveActionMin}, grievance>${T.popularRevolution.massGrievanceMin}<br>` +
      `<strong>Democratization:</strong> pressure>${T.democratization.pressureMin}, elite cohesion<${T.democratization.eliteCohesionMax}, CAP>${T.democratization.collectiveActionMin}<br>` +
      `<strong>Military Coup:</strong> elite<${T.militaryCoup.eliteCohesionMax}, CAP<${T.militaryCoup.collectiveActionMax}, mil>${T.militaryCoup.militaryMin}<br>` +
      `<strong>Auth. Consolidation:</strong> elite>${T.authoritarianConsolidation.eliteCohesionMin}, grievance>${T.authoritarianConsolidation.massGrievanceMin}<br>` +
      `<strong>Gradual Liberalization:</strong> pressure ${T.gradualLiberalization.pressureMin}-${T.gradualLiberalization.pressureMax}, elite>${T.gradualLiberalization.eliteCohesionMin}`;
    container.appendChild(paths);

    // Transition history
    const history = companion.getTransitionHistory(civ.id);
    if (history.length > 0) {
      container.appendChild(this._sectionHeader('TRANSITION HISTORY'));
      const histTable = Utils.createEl('table', '');
      histTable.style.cssText = 'width:100%;font-size:12px;border-collapse:collapse;';
      const histHead = Utils.createEl('thead', '');
      histHead.innerHTML = '<tr style="text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);">' +
        '<th style="padding:4px 8px;">Year</th>' +
        '<th style="padding:4px 8px;">Type</th>' +
        '<th style="padding:4px 8px;">Pressure</th>' +
        '<th style="padding:4px 8px;">Grievance</th></tr>';
      histTable.appendChild(histHead);
      const histBody = Utils.createEl('tbody', '');
      for (const entry of history.slice(-10)) {
        const tr = Utils.createEl('tr', '');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        const typeLabel = entry.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        tr.innerHTML = `<td style="padding:4px 8px;">${entry.year}</td>` +
          `<td style="padding:4px 8px;">${typeLabel}</td>` +
          `<td style="padding:4px 8px;">${entry.pressure}</td>` +
          `<td style="padding:4px 8px;">${entry.grievance}</td>`;
        histBody.appendChild(tr);
      }
      histTable.appendChild(histBody);
      container.appendChild(histTable);
    }
  }

  // ── Diffusion Tab ──────────────────────────────────────────
  _renderDiffusion(container, civ, companion) {
    const diff = companion.getDiffusion(civ.id);
    if (!diff) {
      container.appendChild(Utils.createEl('p', '', 'No diffusion data yet. Run a turn.'));
      return;
    }

    container.appendChild(this._sectionHeader('INFORMATION ENVIRONMENT'));

    const grid = Utils.createEl('div', 'companion-metrics-grid');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:16px;';

    grid.appendChild(this._metricCard('Info Spread Rate', (diff.informationSpreadRate * 100).toFixed(0) + '%'));
    grid.appendChild(this._metricCard('Action Threshold', (diff.collectiveActionThreshold * 100).toFixed(0) + '%'));
    grid.appendChild(this._metricCard('Grievance Visibility', (diff.grievanceVisibility * 100).toFixed(0) + '%'));
    grid.appendChild(this._metricCard('Norm Change Velocity', (diff.normChangeVelocity * 100).toFixed(0) + '%'));
    container.appendChild(grid);

    container.appendChild(this._sectionHeader('NETWORK TOPOLOGY'));

    const netGrid = Utils.createEl('div', 'companion-metrics-grid');
    netGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:16px;';

    netGrid.appendChild(this._metricCard('Network Density', ((diff.networkDensity ?? 0) * 100).toFixed(0) + '%'));
    netGrid.appendChild(this._metricCard('Bridge Fraction', ((diff.bridgeFraction ?? 0) * 100).toFixed(0) + '%'));
    netGrid.appendChild(this._metricCard('Misinfo Vulnerability', ((diff.misinformationVulnerability ?? 0) * 100).toFixed(0) + '%'));
    container.appendChild(netGrid);

    container.appendChild(this._sectionHeader('HOW THESE WORK'));
    const explain = Utils.createEl('div', '');
    explain.style.cssText = 'font-size:12px;line-height:1.7;color:rgba(255,255,255,0.55);';
    explain.innerHTML =
      '<strong>Information Spread Rate:</strong> How quickly knowledge (grievances, coordination signals, ideas) ' +
      'propagates through the population. Driven by network structure, literacy, media ecosystem, and trust.<br><br>' +
      '<strong>Collective Action Threshold:</strong> The fraction of the population that must be willing to act ' +
      'before an individual joins (Granovetter 1978). Lower = easier mobilization. Dense bridged networks lower it.<br><br>' +
      '<strong>Network Density:</strong> How interconnected the population is. Driven by urbanization, literacy, and youth bulge. ' +
      'Dense networks spread everything faster — including misinformation. (Watts & Strogatz 1998)<br><br>' +
      '<strong>Bridge Fraction:</strong> Share of social ties connecting different groups. High bridges enable ideas to cross group ' +
      'boundaries; low bridges create echo chambers. (Granovetter 1973 — weak ties)<br><br>' +
      '<strong>Misinfo Vulnerability:</strong> Susceptibility to false belief cascades. High when networks are dense ' +
      'but epistemic health is low and bridging ties are scarce. (Vosoughi, Roy & Aral 2018)';
    container.appendChild(explain);
  }

  // ── Drawing: Sex-disaggregated Population Pyramid ────────────
  _drawPyramidSex(canvas, maleCohorts, femaleCohorts, labels) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const numCohorts = COMPANION_NUM_COHORTS;

    // Handle legacy single-array data
    if (!maleCohorts || !femaleCohorts) {
      const combined = maleCohorts || femaleCohorts || new Array(numCohorts).fill(0);
      maleCohorts = combined.map(c => c * 0.5);
      femaleCohorts = combined.map(c => c * 0.5);
    }

    const isDark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    const bgColor = isDark ? '#1a1d23' : '#f7f8fa';
    const textColor = isDark ? '#e4e6eb' : '#1a1d23';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const maleColor = isDark ? '#5b9ae8' : '#2b5ea7';
    const femaleColor = isDark ? '#e88ab3' : '#b84c7a';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const margin = { top: 20, bottom: 35, left: 50, right: 10 };
    const chartW = W - margin.left - margin.right;
    const chartH = H - margin.top - margin.bottom;
    const barH = chartH / numCohorts - 2;
    const midX = margin.left + chartW / 2;

    const totalPop = maleCohorts.reduce((a, b) => a + b, 0) + femaleCohorts.reduce((a, b) => a + b, 0);
    if (totalPop <= 0) return;

    const malePcts = maleCohorts.map(c => (c / totalPop) * 100);
    const femalePcts = femaleCohorts.map(c => (c / totalPop) * 100);
    const maxPct = Math.max(...malePcts, ...femalePcts, 0.5);
    const halfW = (chartW / 2) - 5;

    ctx.font = '9px system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numCohorts; i++) {
      const y = margin.top + (numCohorts - 1 - i) * (chartH / numCohorts);

      // Male bar (left, extending leftward from center)
      const mBarW = (malePcts[i] / maxPct) * halfW;
      ctx.fillStyle = maleColor;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(midX - mBarW, y + 1, mBarW, barH);

      // Female bar (right, extending rightward from center)
      const fBarW = (femalePcts[i] / maxPct) * halfW;
      ctx.fillStyle = femaleColor;
      ctx.fillRect(midX + 1, y + 1, fBarW, barH);

      ctx.globalAlpha = 1.0;

      // Label (left edge)
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText(labels[i], margin.left - 4, y + barH / 2 + 1);
    }

    // Center line
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, margin.top);
    ctx.lineTo(midX, H - margin.bottom);
    ctx.stroke();

    // Legend
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    const legendY = H - 14;
    ctx.fillStyle = maleColor;
    ctx.fillRect(midX - 90, legendY - 4, 10, 10);
    ctx.fillStyle = textColor;
    ctx.fillText('Male', midX - 76, legendY + 1);

    ctx.fillStyle = femaleColor;
    ctx.fillRect(midX + 10, legendY - 4, 10, 10);
    ctx.fillStyle = textColor;
    ctx.fillText('Female', midX + 24, legendY + 1);
  }

  // ── Helpers ─────────────────────────────────────────────────
  _sectionHeader(text) {
    const h = Utils.createEl('h3', 'society-section-title', text);
    h.style.cssText = 'font-size:11px;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08);';
    return h;
  }

  _metricCard(label, value) {
    const card = Utils.createEl('div', '');
    card.style.cssText = 'background:rgba(255,255,255,0.05);border-radius:6px;padding:8px 10px;text-align:center;';
    const labelEl = Utils.createEl('div', '');
    labelEl.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;';
    labelEl.textContent = label;
    const valEl = Utils.createEl('div', '');
    valEl.style.cssText = 'font-size:16px;font-weight:600;';
    valEl.textContent = value;
    card.appendChild(labelEl);
    card.appendChild(valEl);
    return card;
  }

  _bar(labelText, value, maxVal, colorClass) {
    const wrap = Utils.createEl('div', 'society-stat-bar-wrap');
    const label = Utils.createEl('span', 'society-stat-label', labelText);
    const track = Utils.createEl('div', 'society-stat-track');
    const fill = Utils.createEl('div', `society-stat-bar ${colorClass || ''}`);
    fill.style.width = Math.max(0, Math.min(100, (value / maxVal) * 100)).toFixed(1) + '%';
    const val = Utils.createEl('span', 'society-stat-val', `${Math.round(value)}`);
    track.appendChild(fill);
    wrap.appendChild(label);
    wrap.appendChild(track);
    wrap.appendChild(val);
    return wrap;
  }

  _formatPop(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  }
}
