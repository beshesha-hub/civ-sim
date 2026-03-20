/**
 * society_panel.js — Economy & Society Systems Panel
 * Keyboard shortcut: s   |   Button: 📊 Society
 * Five tabs: Education | Equity | Institutions | Finance & Trade | Demographics
 */

class SocietyPanel {
  constructor(game) {
    this.game      = game;
    this.visible   = false;
    this.activeTab = 'education'; // 'education'|'equity'|'institutions'|'finance'|'demographics'|'family'|'culture'
  }

  // ── Visibility ──────────────────────────────────────────────
  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('society-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('society-panel'));
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

  _bar(labelText, value, maxVal = 100, colorClass = '', noteText = '') {
    const wrap  = Utils.createEl('div', 'society-stat-bar-wrap');
    const label = Utils.createEl('span', 'society-stat-label', labelText);
    const track = Utils.createEl('div', 'society-stat-track');
    const fill  = Utils.createEl('div', `society-stat-bar ${colorClass}`);
    fill.style.width = Math.max(0, Math.min(100, (value / maxVal) * 100)).toFixed(1) + '%';
    const val   = Utils.createEl('span', 'society-stat-val', `${Math.round(value)}`);
    track.appendChild(fill);
    wrap.appendChild(label);
    wrap.appendChild(track);
    wrap.appendChild(val);
    if (noteText) {
      const note = Utils.createEl('span', 'society-stat-note', noteText);
      wrap.appendChild(note);
    }
    return wrap;
  }

  _section(title) {
    const h = Utils.createEl('h3', 'society-section-title', title);
    return h;
  }

  _colorForIndex(v, lo = 30, hi = 60) {
    if (v < lo) return 'bar-red';
    if (v < hi) return 'bar-amber';
    return 'bar-green';
  }

  // ── Root Render ──────────────────────────────────────────────
  render() {
    const panel = Utils.el('society-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', '', '📊 Economy & Society');
    title.style.margin = '0';
    titleWrap.appendChild(title);
    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => {
      this.hide();
      Utils.el('btn-society')?.classList.remove('btn-map-active');
    };
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabs = Utils.createEl('div', 'panel-tabs');
    [
      { id: 'education',    label: '📚 Education' },
      { id: 'equity',       label: '⚖️ Equity' },
      { id: 'institutions', label: '🏛️ Institutions' },
      { id: 'finance',      label: '💰 Finance & Trade' },
      { id: 'demographics', label: '👥 Demographics' },
      { id: 'family',       label: '👨‍👩‍👧 Family' },
      { id: 'culture',      label: '🎭 Culture & Knowledge' },
      { id: 'healthcare',   label: '🏥 Healthcare' },
      { id: 'information',  label: '📺 Information' },
      { id: 'social_psychology', label: '🧠 Social Psychology' },
      { id: 'empathy_cascade',   label: '🧬 Empathy' },
      { id: 'interaction',       label: '⚡ E×R' },
      { id: 'cultural_gap',        label: '🔍 Cultural Gap' },
      { id: 'wealth_capture',      label: '💰 Wealth Capture' },
      { id: 'power_concentration', label: '⚖ Power' },
      { id: 'inertia',             label: '🧲 Inertia' },
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

    if      (this.activeTab === 'education')    this._renderEducation(content, civ);
    else if (this.activeTab === 'equity')       this._renderEquity(content, civ);
    else if (this.activeTab === 'institutions') this._renderInstitutions(content, civ);
    else if (this.activeTab === 'finance')      this._renderFinance(content, civ);
    else if (this.activeTab === 'demographics') this._renderDemographics(content, civ);
    else if (this.activeTab === 'family')       this._renderFamily(content, civ);
    else if (this.activeTab === 'culture')      this._renderCulture(content, civ);
    else if (this.activeTab === 'healthcare')   this._renderHealthcare(content, civ);
    else if (this.activeTab === 'information')  this._renderInformation(content, civ);
    else if (this.activeTab === 'social_psychology') this._renderSocialPsychology(content, civ);
    else if (this.activeTab === 'empathy_cascade')   this._renderEmpathyCascade(content, civ);
    else if (this.activeTab === 'interaction')        this._renderInteraction(content, civ);
    else if (this.activeTab === 'cultural_gap')         this._renderCulturalGap(content, civ);
    else if (this.activeTab === 'wealth_capture')       this._renderWealthCapture(content, civ);
    else if (this.activeTab === 'power_concentration')  this._renderPowerConcentration(content, civ);
    else if (this.activeTab === 'inertia')              this._renderBehavioralInertia(content, civ);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: EDUCATION
  // ═══════════════════════════════════════════════════════════
  _renderEducation(c, civ) {
    const s = civ.state;
    const currentTier = EDUCATION_ACCESS_TIERS.find(t => t.id === s.educationAccess)
                        ?? EDUCATION_ACCESS_TIERS[1];

    // ── Summary bars ────────────────────────────────────────
    const summaryWrap = Utils.createEl('div', 'society-summary-bars');
    summaryWrap.appendChild(this._bar('Education Quality', s.educationQuality ?? 50, 100,
      this._colorForIndex(s.educationQuality ?? 50)));
    summaryWrap.appendChild(Utils.createEl('div', 'society-tier-badge',
      `${currentTier.icon} ${currentTier.label}`));
    c.appendChild(summaryWrap);

    // ── Access tier selector ─────────────────────────────────
    c.appendChild(this._section('Access Tier'));

    const tierDesc = Utils.createEl('p', 'society-help-text',
      'Education access determines which strata can develop human capital. Select a tier to preview effects — or apply it to your civilization.');
    c.appendChild(tierDesc);

    const tierGrid = Utils.createEl('div', 'society-tier-grid');
    EDUCATION_ACCESS_TIERS.forEach(tier => {
      const card = Utils.createEl('div',
        'society-tier-card' + (tier.id === s.educationAccess ? ' current' : ''), '');
      const cardTitle = Utils.createEl('div', 'society-tier-card-title',
        `${tier.icon} ${tier.label}`);
      const cardDesc  = Utils.createEl('div', 'society-tier-card-desc', tier.description);

      // Stratum access preview
      const strataPreview = Utils.createEl('div', 'society-strata-preview');
      const STRATA_LABELS = {
        elite: 'Elite', upper_middle: 'Upper Mid', lower_middle: 'Lower Mid',
        working_class: 'Working', disenfranchised: 'Disenfr.',
      };
      Object.entries(tier.strataMultipliers).forEach(([k, v]) => {
        const row = Utils.createEl('div', 'society-strata-row');
        const lbl = Utils.createEl('span', 'society-strata-key', STRATA_LABELS[k] ?? k);
        const pct = Utils.createEl('span', 'society-strata-pct ' +
          (v >= 0.7 ? 'pct-green' : v >= 0.3 ? 'pct-amber' : 'pct-red'),
          `${Math.round(v * 100)}%`);
        row.appendChild(lbl);
        row.appendChild(pct);
        strataPreview.appendChild(row);
      });

      const bonuses = Utils.createEl('div', 'society-tier-bonuses',
        `Equality ${tier.equalityBonus >= 0 ? '+' : ''}${tier.equalityBonus} · `
        + `Innovation ${tier.innovationBonus >= 0 ? '+' : ''}${tier.innovationBonus} · `
        + `Mobility ${tier.mobilityBonus >= 0 ? '+' : ''}${tier.mobilityBonus}`);

      card.appendChild(cardTitle);
      card.appendChild(cardDesc);
      card.appendChild(strataPreview);
      card.appendChild(bonuses);

      if (tier.id !== s.educationAccess) {
        const applyBtn = Utils.createEl('button', 'btn btn-secondary btn-sm society-tier-apply',
          'Apply Tier');
        applyBtn.onclick = () => this._applyEvent('set_education_access', { tier: tier.id });
        card.appendChild(applyBtn);
      } else {
        const badge = Utils.createEl('span', 'society-current-badge', '✓ Current');
        card.appendChild(badge);
      }

      tierGrid.appendChild(card);
    });
    c.appendChild(tierGrid);

    // ── Quality slider ───────────────────────────────────────
    c.appendChild(this._section('Education Quality'));

    const qualWrap = Utils.createEl('div', 'society-slider-row');
    const qualSlider = Utils.createEl('input', '');
    qualSlider.type  = 'range';
    qualSlider.min   = '0';
    qualSlider.max   = '100';
    qualSlider.value = String(Math.round(s.educationQuality ?? 50));
    qualSlider.className = 'society-slider';
    const qualVal  = Utils.createEl('span', 'society-slider-val',
      String(Math.round(s.educationQuality ?? 50)));
    qualSlider.oninput = () => { qualVal.textContent = qualSlider.value; };
    const qualApply = Utils.createEl('button', 'btn btn-secondary btn-sm', 'Apply');
    qualApply.onclick = () =>
      this._applyEvent('set_education_quality', { quality: Number(qualSlider.value) });
    qualWrap.appendChild(qualSlider);
    qualWrap.appendChild(qualVal);
    qualWrap.appendChild(qualApply);
    c.appendChild(qualWrap);

    // ── Effects summary ──────────────────────────────────────
    c.appendChild(this._section('Per-Turn Effects'));
    const fx = Utils.createEl('div', 'society-effects-list');
    const hcm = ((s.educationQuality ?? 50) / 100) *
      Object.values(currentTier.strataMultipliers).reduce((a, v) => a + v, 0) / 5;
    const innBoost = (hcm * 0.08).toFixed(3);
    [
      `🎓 Human capital multiplier: ${hcm.toFixed(2)}`,
      `💡 Innovation boost: +${innBoost}/turn`,
      `⚖️ Equality drift: ${currentTier.equalityBonus >= 0 ? '+' : ''}${(currentTier.equalityBonus * 0.02).toFixed(3)}/turn`,
      `📰 Epistemic health cross-boost: +0.01/turn (education → press freedom)`,
    ].forEach(txt => {
      const li = Utils.createEl('div', 'society-effect-item', txt);
      fx.appendChild(li);
    });
    c.appendChild(fx);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: EQUITY
  // ═══════════════════════════════════════════════════════════
  _renderEquity(c, civ) {
    const s   = civ.state;
    const gei = s.genderEquity ?? 50;
    const trend = this._equityTrend(civ);

    // GEI bar
    c.appendChild(this._section('Gender Equity Index'));
    const geiColor = gei < 30 ? 'bar-red' : gei < 60 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Gender Equity', gei, 100, `gei-bar ${geiColor}`));

    const trendEl = Utils.createEl('div', 'society-trend', `Trend: ${trend.label} ${trend.arrow}`);
    trendEl.style.color = trend.color;
    c.appendChild(trendEl);

    // Stratum wellbeing impact
    c.appendChild(this._section('Stratum Wellbeing Impact'));
    const impactNote = Utils.createEl('p', 'society-help-text',
      'Gender equity affects lower strata most directly. Low GEI suppresses wellbeing for working-class and disenfranchised populations; high GEI correlates with innovation and social stability.');
    c.appendChild(impactNote);

    const impactWrap = Utils.createEl('div', 'society-effects-list');
    const geiEffect = (gei - 50) / 50; // −1…+1
    [
      { label: 'Elite',           base: 0,    weight: 0.3 },
      { label: 'Upper Middle',    base: 0,    weight: 0.5 },
      { label: 'Lower Middle',    base: 0.02, weight: 0.7 },
      { label: 'Working Class',   base: 0.05, weight: 1.0 },
      { label: 'Disenfranchised', base: 0.05, weight: 1.0 },
    ].forEach(({ label, base, weight }) => {
      const delta = geiEffect * base * weight;
      const sign  = delta >= 0 ? '+' : '';
      const row   = Utils.createEl('div', 'society-strata-row');
      const lbl   = Utils.createEl('span', 'society-strata-key', label);
      const val   = Utils.createEl('span',
        'society-strata-pct ' + (delta > 0 ? 'pct-green' : delta < 0 ? 'pct-red' : ''),
        `${sign}${delta.toFixed(2)}/turn`);
      row.appendChild(lbl);
      row.appendChild(val);
      impactWrap.appendChild(row);
    });
    c.appendChild(impactWrap);

    // Culture axes (derived, read-only)
    c.appendChild(this._section('Culture Axes (Derived)'));
    const cultureHelp = Utils.createEl('p', 'society-help-text',
      'Authority and risk orientations are derived from your founding configuration. They act as quiet background multipliers and are not directly settable after founding.');
    c.appendChild(cultureHelp);
    c.appendChild(this._bar('Authority Orientation (egalitarian → hierarchical)',
      100 - (s.authorityOrientation ?? 50), 100, ''));
    c.appendChild(this._bar('Risk Orientation (cautious → innovative)',
      s.riskOrientation ?? 50, 100, ''));

    // ── Social Mobility ─────────────────────────────────────
    c.appendChild(this._section('Social Mobility'));
    const mobHelp = Utils.createEl('p', 'society-help-text',
      'Social mobility measures the ability of individuals to move between strata. The Great Gatsby Curve: high inequality kills mobility. Perception gap drives cynicism when people discover mobility is lower than they believed.');
    c.appendChild(mobHelp);
    const mob = Math.round(s.socialMobility ?? 50);
    const pmob = Math.round(s.perceivedMobility ?? 50);
    const mgap = s.mobilityGap ?? 0;
    c.appendChild(this._bar('Actual Mobility', mob, 100, this._colorForIndex(mob)));
    c.appendChild(this._bar('Perceived Mobility', pmob, 100, this._colorForIndex(pmob)));
    if (Math.abs(mgap) > 10) {
      const gapNote = mgap < 0
        ? `Cynicism building: citizens believe mobility is ${Math.abs(mgap)} points higher than reality`
        : `Under-appreciated mobility: actual exceeds perceived by ${mgap} points`;
      c.appendChild(Utils.createEl('div', 'society-stat-note', gapNote));
    }
    if (pmob < 30) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        'Revolutionary pressure: perceived mobility below 30. Stability eroding.'));
    }

    // ── Land Ownership Concentration ──────────────────────────
    c.appendChild(this._section('Land Ownership Concentration'));
    const landHelp = Utils.createEl('p', 'society-help-text',
      'Fixed-supply resource with strong path dependency. Colonial grants, conquest, and market forces concentrate land ownership. High concentration suppresses food security, social mobility, and stability. Land reform is politically destabilizing but can break feudal traps.');
    c.appendChild(landHelp);
    const landConc = Math.round(s.landConcentration ?? 40);
    const landColor = landConc > 65 ? 'bar-red' : landConc > 45 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Land Concentration', landConc, 100, landColor,
      landConc > 75 ? 'Latifundia trap: landless majority, revolution risk' :
      landConc > 60 ? 'High concentration: food security and mobility suppressed' :
      landConc < 20 ? 'Egalitarian land distribution' : ''));

    // Land drivers
    const landDrivers = [];
    const wcLand = civ.economic?.wealthConcentration ?? 30;
    if (wcLand > 50) landDrivers.push(`Wealth concentration (${Math.round(wcLand)}): +${(0.015 * (wcLand - 50) / 50 * 0.5).toFixed(4)}/turn`);
    const econIdLand = civ.economic?.modelId ?? civ.governance?.economicModelId ?? '';
    if (['gift', 'commons', 'labor_credit'].includes(econIdLand)) landDrivers.push('Communal economy: -0.01/turn');
    else if (econIdLand === 'market') landDrivers.push('Market economy: +0.005/turn');
    const govIdLand = civ.governance?.modelId ?? '';
    if (govIdLand === 'oligarchy' || govIdLand === 'autocratic') landDrivers.push('Oligarchic/autocratic governance: +0.0075/turn');
    if ((s.educationQuality ?? 50) > 60) landDrivers.push('Education > 60: -0.0025/turn (legal literacy)');
    if (landConc > 60) landDrivers.push(`High concentration: food security -${(0.02 * (landConc - 60) / 40).toFixed(3)}/turn`);
    if (landConc > 70) landDrivers.push(`Very high concentration: stability eroding`);
    if (landDrivers.length > 0) {
      const landDrvList = Utils.createEl('div', 'society-effects-list');
      landDrivers.forEach(d => landDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(landDrvList);
    }

    // ── Caste / Rigid Stratification ──────────────────────────
    c.appendChild(this._section('Caste / Rigid Stratification'));
    const casteHelp = Utils.createEl('p', 'society-help-text',
      'Hereditary social barriers (caste, race, religion, guild) that cap mobility regardless of education or economic opportunity. Education and urbanization gradually weaken rigidity. High rigidity imposes a hard ceiling on social mobility and suppresses innovation through brain drain.');
    c.appendChild(casteHelp);
    const caste = Math.round(s.casteRigidity ?? 15);
    const casteColor = caste > 50 ? 'bar-red' : caste > 25 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Caste Rigidity', caste, 100, casteColor,
      caste > 60 ? 'Severe stratification: mobility ceiling active, brain drain' :
      caste > 30 ? 'Moderate barriers: mobility constrained' :
      caste < 5 ? 'Open society: no hereditary barriers' : ''));
    if (caste > 20) {
      const mobCeiling = Math.round(100 - caste * 0.8);
      c.appendChild(Utils.createEl('div', 'society-alert',
        `Mobility ceiling: ${mobCeiling} — social mobility cannot exceed this while caste rigidity persists`));
    }

    // Caste drivers
    const casteDrivers = [];
    if ((s.educationQuality ?? 50) > 50) casteDrivers.push('Education > 50: weakening rigidity');
    else if ((s.educationQuality ?? 50) < 25) casteDrivers.push('Low education: reinforcing hereditary status');
    if ((s.urbanizationRate ?? 15) > 40) casteDrivers.push('Urbanization > 40: breaking caste (anonymity, market labor)');
    if ((s.epistemicHealth ?? 50) > 60) casteDrivers.push('Epistemic health > 60: egalitarian ideas spreading');
    if (caste > 40) casteDrivers.push('Self-reinforcing: constituencies defend the system (+0.003/turn)');
    if (casteDrivers.length > 0) {
      const casteDrvList = Utils.createEl('div', 'society-effects-list');
      casteDrivers.forEach(d => casteDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(casteDrvList);
    }

    // Policy actions
    c.appendChild(this._section('Policy Actions'));
    const btnRow = Utils.createEl('div', 'society-btn-row');
    const geiBtn = Utils.createEl('button', 'btn btn-secondary', 'Gender Equity Initiative (+5 GEI)');
    geiBtn.title = 'Immediate +5 Gender Equity Index boost through targeted policy, education, and legal reform.';
    geiBtn.onclick = () => this._applyEvent('gender_equity_initiative');
    btnRow.appendChild(geiBtn);

    const mobBtn = Utils.createEl('button', 'btn btn-secondary', 'Social Mobility Program (+6 Mobility)');
    mobBtn.title = 'Education access and opportunity programs to increase actual social mobility.';
    mobBtn.onclick = () => this._applyEvent('social_mobility_program');
    btnRow.appendChild(mobBtn);

    const landBtn = Utils.createEl('button', 'btn btn-secondary', 'Land Reform (-12 Concentration)');
    landBtn.title = 'Redistributive land reform. Reduces concentration but causes short-term instability (-5 stability).';
    landBtn.onclick = () => this._applyEvent('land_reform');
    btnRow.appendChild(landBtn);

    const casteBtn = Utils.createEl('button', 'btn btn-secondary', 'Caste Abolition (-15 Rigidity)');
    casteBtn.title = 'Legislative abolition of hereditary stratification. Creates short-term social disruption.';
    casteBtn.onclick = () => this._applyEvent('caste_abolition');
    btnRow.appendChild(casteBtn);
    c.appendChild(btnRow);

    // Drift explanation
    c.appendChild(this._section('Current Drift Drivers'));
    const driftItems = this._geiDriftDrivers(civ);
    const driftList  = Utils.createEl('div', 'society-effects-list');
    driftItems.forEach(d => driftList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
    c.appendChild(driftList);

    // ── Women's Rights ────────────────────────────────────────
    c.appendChild(this._section("Women's Rights Tier"));
    const wrHelp = Utils.createEl('p', 'society-help-text',
      "Women's legal and social rights tier shapes gender equity index trajectory, innovation bonus, equality, and stratum wellbeing — with greatest impact on lower strata.");
    c.appendChild(wrHelp);
    const currentWR = s.womensRightsTier ?? 'mostly_full';
    const wrGrid = Utils.createEl('div', 'society-tier-grid');
    WOMENS_RIGHTS_TIERS.forEach(tier => {
      const card = Utils.createEl('div',
        'society-tier-card' + (tier.id === currentWR ? ' current' : ''), '');
      card.appendChild(Utils.createEl('div', 'society-tier-card-title', `${tier.icon} ${tier.label}`));
      card.appendChild(Utils.createEl('div', 'society-tier-card-desc', tier.description));
      const fx = Utils.createEl('div', 'society-tier-card-fx');
      const bonuses = [
        tier.innovationBonus ? `Innovation ${tier.innovationBonus >= 0 ? '+' : ''}${(tier.innovationBonus * 100).toFixed(0)}%` : null,
        tier.equalityBonus   ? `Equality ${tier.equalityBonus >= 0 ? '+' : ''}${tier.equalityBonus}` : null,
      ].filter(Boolean);
      if (bonuses.length) fx.textContent = bonuses.join(' · ');
      card.appendChild(fx);
      if (tier.id !== currentWR) {
        const applyBtn = Utils.createEl('button', 'btn btn-xs btn-secondary', 'Apply');
        applyBtn.onclick = () => this._applyEvent('set_womens_rights_tier', { tier: tier.id });
        card.appendChild(applyBtn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', '✓ Current'));
      }
      wrGrid.appendChild(card);
    });
    c.appendChild(wrGrid);
  }

  _equityTrend(civ) {
    const s  = civ.state;
    const techLevel = civ.technologies?.length ?? 0;
    const eh = s.epistemicHealth ?? 50;
    const religionControlled = civ.config?.religion?.stateRelationship === 'state_religion';
    const authority = s.authorityOrientation ?? 50;
    let drift = 0;
    if (techLevel > 3 && eh > 50) drift += 0.03;
    if (religionControlled && authority > 60) drift -= 0.03;
    if (drift > 0.01) return { label: 'Rising',  arrow: '↑', color: '#22c55e' };
    if (drift < -0.01) return { label: 'Falling', arrow: '↓', color: '#ef4444' };
    return { label: 'Stable', arrow: '→', color: '#94a3b8' };
  }

  _geiDriftDrivers(civ) {
    const s   = civ.state;
    const items = [];
    const techLevel = civ.technologies?.length ?? 0;
    const eh = s.epistemicHealth ?? 50;
    if (techLevel > 3 && eh > 50)
      items.push(`✅ High tech level (${techLevel}) + epistemic health (${eh}) → +0.03/turn`);
    if (civ.config?.religion?.stateRelationship === 'state_religion')
      items.push(`⚠️ State religion → −0.03/turn suppression`);
    if ((s.authorityOrientation ?? 50) > 60)
      items.push(`⚠️ High authority orientation (${s.authorityOrientation}) amplifies suppression`);
    if (items.length === 0)
      items.push('→ No strong drift drivers active. GEI is stable.');
    return items;
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: INSTITUTIONS
  // ═══════════════════════════════════════════════════════════
  _renderInstitutions(c, civ) {
    const s  = civ.state;
    const iq = s.institutionalQuality ?? 50;
    const eh = s.epistemicHealth ?? 50;

    c.appendChild(this._section('Institutional Quality & Rule of Law'));
    c.appendChild(this._bar('Institutional Quality', iq, 100, this._colorForIndex(iq)));
    c.appendChild(this._bar('Epistemic Health / Press Freedom', eh, 100, this._colorForIndex(eh)));

    // Social Trust — willingness to trust strangers and institutions
    const trust = Math.round(s.socialTrust ?? 50);
    c.appendChild(this._bar('Social Trust', trust, 100, this._colorForIndex(trust),
      trust < 30 ? 'Institutions failing — trust too low' : trust > 70 ? 'High-trust society — self-reinforcing' : ''));

    // State Capacity — ability to implement policy (distinct from quality)
    const cap = Math.round(s.stateCapacity ?? 50);
    c.appendChild(this._bar('State Capacity', cap, 100, this._colorForIndex(cap),
      cap < 25 ? 'Low capacity — policies only 50% effective' : ''));

    // Infrastructure — physical and organizational capacity
    const infra = Math.round(s.infrastructureLevel ?? 35);
    const mdebt = Math.round(s.maintenanceDebt ?? 0);
    c.appendChild(this._bar('Infrastructure', infra, 100, this._colorForIndex(infra),
      mdebt > 30 ? `Maintenance debt: ${mdebt} — accelerating decay` : ''));
    if (mdebt > 0) {
      const debtColor = mdebt > 50 ? 'bar-red' : mdebt > 20 ? 'bar-amber' : '';
      c.appendChild(this._bar('Maintenance Debt', mdebt, 100, debtColor,
        mdebt > 50 ? 'Severe — debt is compounding infrastructure decay' : ''));
    }

    // ── Military-Civilian Power Balance ──────────────────────
    c.appendChild(this._section('Military-Civilian Balance'));
    const milPower = Math.round(s.militaryPower ?? 30);
    const civCtrl = Math.round(s.civilianControl ?? 50);
    c.appendChild(this._bar('Military Power', milPower, 100,
      milPower > 70 ? 'bar-red' : milPower > 50 ? 'bar-amber' : 'bar-green'));
    c.appendChild(this._bar('Civilian Control', civCtrl, 100,
      civCtrl > 60 ? 'bar-green' : civCtrl > 40 ? 'bar-amber' : 'bar-red'));
    const balanceLabel = civCtrl > milPower ? 'Civilian-led' : milPower > civCtrl + 20 ? 'Military-dominant' : 'Balanced';
    const balanceColor = civCtrl > milPower ? '#22c55e' : milPower > civCtrl + 20 ? '#ef4444' : '#f59e0b';
    const balEl = Utils.createEl('div', 'resource-multipliers-box');
    balEl.textContent = `Balance: ${balanceLabel}`;
    balEl.style.color = balanceColor;
    c.appendChild(balEl);
    // Coup risk alert
    const stability = s.stabilityIndex ?? 70;
    const economicCrisis = (s.debtLoad ?? 20) > 70 || (s.financialDepth ?? 30) < 15;
    const foodSecMil = s.foodSecurity ?? 60;
    if (milPower > civCtrl + 20 && stability < 35 && (economicCrisis || foodSecMil < 25)) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        'COUP RISK: Military power exceeds civilian control by >20, stability below 35, and economic/food crisis active. Military intervention possible.'));
    }

    // ── Legitimacy ────────────────────────────────────────────
    c.appendChild(this._section('Legitimacy'));
    const legType = s.legitimacyType ?? 'traditional';
    const legLevel = Math.round(s.legitimacyLevel ?? 50);
    const legLabels = { 'traditional': 'Traditional', 'charismatic': 'Charismatic', 'rational-legal': 'Rational-Legal' };
    const legDescs = {
      'traditional': 'Authority derives from custom, heritage, and established institutions. Succession follows hereditary or prescriptive rules.',
      'charismatic': 'Authority rests on a single leader\'s personal qualities. Succession crises are severe — legitimacy dies with the leader.',
      'rational-legal': 'Authority rests on constitutional law and bureaucratic procedures. Succession is institutionalized and smooth.',
    };
    const legBadge = Utils.createEl('div', 'resource-multipliers-box');
    legBadge.textContent = `Type: ${legLabels[legType] ?? legType}`;
    legBadge.style.color = legType === 'rational-legal' ? '#22c55e' : legType === 'charismatic' ? '#f59e0b' : '#94a3b8';
    c.appendChild(legBadge);
    c.appendChild(this._bar('Legitimacy Level', legLevel, 100, this._colorForIndex(legLevel),
      legLevel < 25 ? 'Legitimacy crisis — revolution risk elevated' : ''));
    const legDesc = Utils.createEl('p', 'society-help-text');
    legDesc.textContent = legDescs[legType] ?? '';
    c.appendChild(legDesc);

    // ── Institutional Lock-in ──────────────────────────────────
    c.appendChild(this._section('Institutional Lock-in'));
    const lockinHelp = Utils.createEl('p', 'society-help-text',
      'Self-reinforcing institutional feedback: bureaucracies, interest groups, and beneficiaries actively defend the status quo. Distinct from behavioral inertia (passive resistance). High lock-in slows paradigm shifts, entrenches corruption, and erodes legitimacy. Constitutional reform can break the cycle.');
    c.appendChild(lockinHelp);
    const lockin = Math.round(s.institutionalLockin ?? 30);
    const lockinColor = lockin > 55 ? 'bar-red' : lockin > 35 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Institutional Lock-in', lockin, 100, lockinColor,
      lockin > 70 ? 'Severe lock-in: reform nearly impossible, legitimacy eroding' :
      lockin > 50 ? 'High lock-in: reforms weakened, paradigm shifts slowed' :
      lockin < 15 ? 'Fluid institutions: reform-ready' : ''));
    if (lockin > 50) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        `Paradigm shift penalty: shifts take ~${Math.round(lockin * 0.5)}% longer to complete`));
    }

    // Lock-in drivers
    const lockinDrivers = [];
    const govAge = s._govShiftAge ?? 0;
    if (govAge > 10) lockinDrivers.push(`Governance age (${govAge} turns): building constituencies`);
    const corrLk = s.corruptionLevel ?? 0;
    const wcLk = civ.economic?.wealthConcentration ?? 30;
    if (corrLk > 30 && wcLk > 40) lockinDrivers.push('Corruption + wealth capture: institutions fight reform');
    if (eh > 60) lockinDrivers.push('Epistemic health > 60: informed citizenry challenges lock-in');
    else if (eh < 25) lockinDrivers.push('Low epistemic health: lock-in deepening unchallenged');
    const activeShiftsLk = s.activeParadigmShifts ?? [];
    if (activeShiftsLk.length > 0) lockinDrivers.push('Active paradigm shift: reform momentum (-0.03/turn)');
    if (lockin > 50) lockinDrivers.push('Self-reinforcing: constituencies actively defend status quo');
    if (lockin > 60) lockinDrivers.push('Anti-corruption campaigns weakened: corruption +0.005/turn');
    if (lockin > 70) lockinDrivers.push('Legitimacy eroding: people see system as rigged');
    if (lockinDrivers.length > 0) {
      const lockinDrvList = Utils.createEl('div', 'society-effects-list');
      lockinDrivers.forEach(d => lockinDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(lockinDrvList);
    }

    // Policy effectiveness multiplier (now uses both IQ and state capacity)
    const effMult = Math.round(iq * 0.5 + cap * 0.5);
    const multEl = Utils.createEl('div', 'society-policy-mult',
      `Policy effectiveness: ${effMult}% — events and decisions have ${effMult}% of their nominal impact.`);
    multEl.style.color = effMult < 40 ? '#ef4444' : effMult < 65 ? '#f59e0b' : '#22c55e';
    c.appendChild(multEl);

    // Demagogy risk
    if (eh < 25) {
      const risk = Utils.createEl('div', 'society-alert',
        'Epistemic collapse risk: Epistemic health below 25. Populist destabilization events may occur at random.');
      c.appendChild(risk);
    }
    // Trust collapse warning
    if (trust < 20) {
      const trustAlert = Utils.createEl('div', 'society-alert',
        'Trust collapse: Social trust below 20. Institutions are ineffective regardless of quality.');
      c.appendChild(trustAlert);
    }

    // Policy buttons
    c.appendChild(this._section('Policy Actions'));
    const btnWrap = Utils.createEl('div', 'society-btn-row');

    const pressFreeBtn = Utils.createEl('button', 'btn btn-secondary',
      'Press Freedom Act (+10 EH)');
    pressFreeBtn.onclick = () => this._applyEvent('press_freedom_act');

    const censorBtn = Utils.createEl('button', 'btn btn-danger',
      'Censorship Law (-15 EH)');
    censorBtn.onclick = () => this._applyEvent('censorship_law');

    const judicialBtn = Utils.createEl('button', 'btn btn-secondary',
      'Judicial Reform (+8 IQ)');
    judicialBtn.onclick = () => this._applyEvent('judicial_reform');

    const trustBtn = Utils.createEl('button', 'btn btn-secondary',
      'Community Trust Initiative (+8 Trust)');
    trustBtn.onclick = () => this._applyEvent('community_trust_initiative');

    const corruptBtn = Utils.createEl('button', 'btn btn-secondary',
      'Anti-Corruption Campaign (-8 Corr, +3 Trust)');
    corruptBtn.onclick = () => this._applyEvent('anti_corruption_campaign');

    const capBtn = Utils.createEl('button', 'btn btn-secondary',
      'Bureaucratic Reform (+6 Capacity)');
    capBtn.onclick = () => this._applyEvent('bureaucratic_reform');

    const infraBtn = Utils.createEl('button', 'btn btn-secondary',
      'Infrastructure Investment (+4 Infra, -5 Debt)');
    infraBtn.onclick = () => this._applyEvent('infrastructure_investment');

    const milBtn = Utils.createEl('button', 'btn btn-secondary',
      'Military Modernization (+8 Mil Power)');
    milBtn.onclick = () => this._applyEvent('military_modernization');

    const civOversightBtn = Utils.createEl('button', 'btn btn-secondary',
      'Civilian Oversight Reform (+8 Control)');
    civOversightBtn.onclick = () => this._applyEvent('civilian_oversight_reform');

    btnWrap.appendChild(pressFreeBtn);
    btnWrap.appendChild(censorBtn);
    btnWrap.appendChild(judicialBtn);
    btnWrap.appendChild(trustBtn);
    btnWrap.appendChild(corruptBtn);
    btnWrap.appendChild(capBtn);
    btnWrap.appendChild(infraBtn);
    btnWrap.appendChild(milBtn);
    btnWrap.appendChild(civOversightBtn);

    const reformBtn = Utils.createEl('button', 'btn btn-secondary',
      'Constitutional Reform (-12 Lock-in)');
    reformBtn.title = 'Major institutional restructuring to reduce lock-in. Requires state capacity. Causes short-term disruption.';
    reformBtn.onclick = () => this._applyEvent('constitutional_reform');
    btnWrap.appendChild(reformBtn);
    c.appendChild(btnWrap);

    // Drift info
    c.appendChild(this._section('Institutional Drift Drivers'));
    const drivers = this._instDriftDrivers(civ);
    const driftList = Utils.createEl('div', 'society-effects-list');
    drivers.forEach(d => driftList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
    c.appendChild(driftList);

    // Cross-system effect: trade attractiveness
    c.appendChild(this._section('Cross-System Effects'));
    const crossFx = Utils.createEl('div', 'society-effects-list');
    [
      'Trade partner attractiveness: Higher IQ makes your civ a more desirable trade partner.',
      'Corruption resistance: IQ < 30 halves corruption decay rate.',
      'Trust-Institution loop: Trust > 70 builds IQ; Trust < 30 erodes IQ.',
      'State Capacity: Low capacity (<25) reduces policy event effectiveness by 50%.',
      'Low social mobility + high perceived mobility = cynicism and trust erosion.',
      'Infrastructure > 60: trade dependency boost; < 25: stability erosion.',
      'Maintenance debt > 30: fiscal pressure — increases debt load.',
      'Military power > state capacity * 50%: fiscal pressure from military spending.',
      'Civilian control > 70: institutional quality slowly improves.',
      'Legitimacy < 25: stability erosion; > 75: stability boost.',
      'Charismatic legitimacy + leader change: severe succession crisis.',
    ].forEach(txt => crossFx.appendChild(Utils.createEl('div', 'society-effect-item', txt)));
    c.appendChild(crossFx);
  }

  _instDriftDrivers(civ) {
    const s    = civ.state;
    const corr = s.corruptionLevel ?? 0;
    const stab = s.stability ?? 50;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;
    const items = [];
    if (corr < 20 && stab > 60) items.push('Low corruption + high stability: +0.02 IQ/turn, +0.01 Trust/turn');
    if (corr > 60)               items.push(`High corruption (${corr}): -0.05 IQ/turn`);
    if (corr > 30)               items.push(`Corruption (${corr}) eroding trust: -${(0.03 * (corr - 30) / 70).toFixed(3)}/turn`);
    if (corr > 40)               items.push(`Corruption (${corr}) eroding state capacity: -${(0.03 * (corr - 40) / 60).toFixed(3)}/turn`);
    if (atWar)                   items.push('At war: -0.1 IQ/turn, -0.03 Trust/turn, -0.02 Capacity/turn');
    const gov = civ.config?.governance?.model ?? civ.governance?.modelId;
    const rel = civ.config?.religion?.stateRelationship;
    if (gov === 'autocratic')    items.push('Autocratic governance: -0.05 EH/turn, -0.02 Trust/turn');
    if (rel === 'state_religion') items.push('State religion: -0.03 EH/turn');
    if (gov === 'representative' || gov === 'direct_congress')
      items.push(`${gov === 'representative' ? 'Representative' : 'Direct'} governance: +0.02 EH/turn, +Trust/turn`);
    if (gov === 'shadow_government_complicit' || gov === 'shadow_government_covert')
      items.push('Shadow government: -0.03 Trust/turn');
    const wc = civ.economic?.wealthConcentration ?? 30;
    if (wc > 60) items.push(`High wealth concentration (${Math.round(wc)}): -Trust, -Mobility`);
    const trust = s.socialTrust ?? 50;
    if (trust < 30) items.push('Low trust: -0.02 IQ/turn (institutions failing)');
    if (trust > 70) items.push('High trust: +0.01 IQ/turn (trust reinforces institutions)');
    const cap = s.stateCapacity ?? 50;
    if (cap < 25) items.push('Low state capacity: policy events at 50% effectiveness');
    if (stab > 70) items.push('High stability: +0.01 Capacity/turn (bureaucracy professionalizing)');
    if (items.length === 0) items.push('No strong institutional pressures active.');
    return items;
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: FINANCE & TRADE
  // ═══════════════════════════════════════════════════════════
  _renderFinance(c, civ) {
    const s    = civ.state;
    const dmt  = DEBT_MODEL_TYPES.find(m => m.id === s.debtModel) ?? DEBT_MODEL_TYPES[2];

    // ── Currency system ─────────────────────────────────────
    const ctLabels = { none: 'Currencyless', labor_time: 'Hours-Based (Labor Time)',
      commodity: 'Commodity Money', fiat_or_commodity: 'Fiat/Commodity', fiat: 'Fiat Currency',
      internal: 'Internal Accounting', custom: 'Custom' };
    const ctVal = civ.economic?.currencyType ?? 'fiat';
    const ctLabel = ctLabels[ctVal] ?? ctVal;
    const depthCeiling = { none: 15, labor_time: 30, commodity: 50,
                           internal: 45, fiat_or_commodity: 80, fiat: 90, custom: 70 }[ctVal] ?? 70;
    c.appendChild(Utils.createEl('div', 'society-stat-note',
      `Currency system: ${ctLabel} (financial depth ceiling: ${depthCeiling})`));

    // ── Debt model display ──────────────────────────────────
    c.appendChild(this._section('Current Debt System'));
    const debtCard = Utils.createEl('div', `society-debt-card debt-${dmt.id.replace(/_/g, '-')}`);
    const debtTitle = Utils.createEl('div', 'society-debt-card-title',
      `${dmt.icon} ${dmt.label}`);
    const debtDesc  = Utils.createEl('div', 'society-debt-card-desc', dmt.description);
    debtCard.appendChild(debtTitle);
    debtCard.appendChild(debtDesc);

    // Predatory features
    if (dmt.predatoryFeatures?.length) {
      const pfHead = Utils.createEl('div', 'society-features-head', '⛓️ Predatory Features:');
      debtCard.appendChild(pfHead);
      const pfList = Utils.createEl('div', 'predatory-features-list');
      dmt.predatoryFeatures.forEach(f => {
        const fi = Utils.createEl('div', 'society-feature-item');
        fi.innerHTML = `<strong>${f.label}</strong> — <span style="color:#94a3b8">${f.description}</span>`;
        pfList.appendChild(fi);
      });
      debtCard.appendChild(pfList);
    }
    c.appendChild(debtCard);

    // Forgiveness mechanisms
    if (dmt.forgivenessMechanisms?.length) {
      c.appendChild(this._section('Forgiveness Mechanisms'));
      const fmList = Utils.createEl('div', 'forgiveness-list');
      dmt.forgivenessMechanisms.forEach(fm => {
        const fi  = Utils.createEl('div', 'society-feature-item forgiveness-item');
        const lbl = Utils.createEl('span', 'society-forgiveness-label',
          `🤝 ${fm.label}`);
        const desc = Utils.createEl('span', 'society-forgiveness-desc',
          ` — ${fm.description}`);
        const applyBtn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Activate');
        applyBtn.onclick = () => this._applyEvent('debt_jubilee', { flavor: fm.id });
        fi.appendChild(lbl);
        fi.appendChild(desc);
        fi.appendChild(applyBtn);
        fmList.appendChild(fi);
      });
      c.appendChild(fmList);
    }

    // ── Debt model selector ─────────────────────────────────
    c.appendChild(this._section('Change Debt System'));
    const modelHelp = Utils.createEl('p', 'society-help-text',
      'Switching debt models applies immediately. Major systemic changes carry transition shocks.');
    c.appendChild(modelHelp);
    const modelGrid = Utils.createEl('div', 'debt-model-grid');
    DEBT_MODEL_TYPES.forEach(model => {
      const card = Utils.createEl('div',
        'debt-model-card debt-model-' + model.id.replace(/_/g, '-') +
        (model.id === s.debtModel ? ' current' : ''));
      const mTitle = Utils.createEl('div', 'debt-model-card-title', `${model.icon} ${model.label}`);
      const mDesc  = Utils.createEl('div', 'debt-model-card-desc', model.description);
      card.appendChild(mTitle);
      card.appendChild(mDesc);
      if (model.id !== s.debtModel) {
        const applyBtn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Switch');
        applyBtn.onclick = () => this._applyEvent('set_debt_model', { model: model.id });
        card.appendChild(applyBtn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', '✓ Current'));
      }
      modelGrid.appendChild(card);
    });
    c.appendChild(modelGrid);

    // ── Financial / Resource metrics ──────────────────────────
    const econIdMetrics = civ.economic?.modelId ?? '';
    const isNonMarketMetrics = ['gift', 'commons', 'labor_credit', 'none', 'barter'].includes(econIdMetrics);
    c.appendChild(this._section(isNonMarketMetrics ? 'Resource Health' : 'Financial Health'));
    const fd  = s.financialDepth ?? 30;
    const dl  = s.debtLoad      ?? 20;
    const td  = s.tradeDependency ?? 20;
    const tar = s.tariffLevel   ?? 30;
    c.appendChild(this._bar(isNonMarketMetrics ? 'Economic Complexity' : 'Financial Depth', fd, 100, this._colorForIndex(fd)));
    c.appendChild(this._bar(isNonMarketMetrics ? 'Obligation Burden' : 'Debt Load', dl, 100,
      dl > 70 ? 'bar-red' : dl > 45 ? 'bar-amber' : 'bar-green'));
    c.appendChild(this._bar(isNonMarketMetrics ? 'External Dependency' : 'Trade Dependency', td, 100, ''));
    c.appendChild(this._bar('Tariff Level',      tar, 100,
      tar > 60 ? 'bar-red' : tar > 30 ? 'bar-amber' : 'bar-green', tar > 60 ? 'Retaliation risk' : ''));

    // ── Minsky Financial Cycle ───────────────────────────────
    const mPhase = s.minskyPhase ?? 25;
    const finStab = s.financialStability ?? 70;
    const yrsCrisis = s.yearsSinceFinancialCrisis ?? 999;
    const econIdFin = civ.economic?.modelId ?? '';
    const isNonMarket = ['gift', 'commons', 'labor_credit', 'none', 'barter'].includes(econIdFin);
    // Phase labels adapt for non-market economies
    const minskyLabel = isNonMarket ? (
      mPhase < 15 ? 'Resource Contraction' :
      mPhase < 35 ? 'Resource Stability' :
      mPhase < 55 ? 'Resource Surplus Growth' :
      mPhase < 75 ? 'Overcommitment' :
      mPhase < 90 ? 'Resource Stress' : 'Resource Crisis'
    ) : (
      mPhase < 15 ? 'Revulsion / Recovery' :
      mPhase < 35 ? 'Hedge Stability' :
      mPhase < 55 ? 'Credit Expansion (Boom)' :
      mPhase < 75 ? 'Euphoria (Late Boom)' :
      mPhase < 90 ? 'Financial Distress' : 'Panic / Crisis'
    );
    const minskyColor =
      mPhase < 15 ? 'bar-blue' :
      mPhase < 35 ? 'bar-green' :
      mPhase < 55 ? 'bar-amber' :
      mPhase < 75 ? 'bar-red' : 'bar-red';
    c.appendChild(this._section(isNonMarket ? 'Resource Cycle' : 'Financial Cycle (Minsky)'));
    // Phase badge
    const phaseBadge = Utils.createEl('div', 'society-badge');
    phaseBadge.innerHTML = `<strong>${minskyLabel}</strong>`;
    phaseBadge.style.cssText = `padding:4px 10px;border-radius:4px;margin-bottom:6px;display:inline-block;` +
      `background:${mPhase < 35 ? '#27ae60' : mPhase < 55 ? '#f39c12' : mPhase < 75 ? '#e67e22' : '#e74c3c'};color:#fff;font-size:0.85em;`;
    c.appendChild(phaseBadge);
    const posLabel = isNonMarket ? (
      mPhase < 15 ? 'Rebuilding reserves' : mPhase < 35 ? 'Sustainable allocation' :
      mPhase < 55 ? 'Expanding commitments' : mPhase < 75 ? 'Overextension risk' :
      mPhase < 90 ? 'Shortages emerging' : 'Crisis'
    ) : (
      mPhase < 15 ? 'Deleveraging' : mPhase < 35 ? 'Conservative lending' :
      mPhase < 55 ? 'Rising leverage' : mPhase < 75 ? 'Ponzi finance emerging' :
      mPhase < 90 ? 'First defaults' : 'Crash'
    );
    c.appendChild(this._bar('Cycle Position', Math.round(mPhase), 100, minskyColor, posLabel));
    c.appendChild(this._bar(isNonMarket ? 'Resource Stability' : 'Financial Stability', Math.round(finStab), 100,
      finStab > 60 ? 'bar-green' : finStab > 35 ? 'bar-amber' : 'bar-red'));
    // Crisis memory
    const hasCrisisHistory = s.yearsSinceFinancialCrisis !== undefined && s.yearsSinceFinancialCrisis !== null;
    const memoryNote = !hasCrisisHistory ? 'No crises on record' :
      yrsCrisis < 15 ? 'Recent crisis — caution prevails' :
      yrsCrisis < 30 ? 'Crisis memory fading' :
      yrsCrisis < 50 ? 'Distant memory — complacency growing' : 'Crisis memory lost — complacency dominates';
    const memEl = Utils.createEl('div', 'society-note',
      hasCrisisHistory ? `Last crisis: ${Math.round(yrsCrisis)} years ago — ${memoryNote}` : memoryNote);
    memEl.style.cssText = 'font-size:0.82em;color:#888;margin:4px 0 8px 0;';
    c.appendChild(memEl);
    // Alerts
    if (mPhase > 70) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        '⚠️ Financial system in distress zone — crisis risk elevated. Strong institutions can act as thwarting mechanisms.'));
    }
    if (mPhase >= 55 && mPhase <= 70 && dl > 50) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        '⚠️ Euphoria with high debt — Ponzi financing units growing. Consider regulation to slow the cycle.'));
    }

    // ── Tariff slider ───────────────────────────────────────
    c.appendChild(this._section('Tariff Policy'));
    if (tar > 60) {
      const retWarn = Utils.createEl('div', 'society-alert',
        '⚠️ Tariff level above 60: Trading partners may retaliate, raising their own tariffs toward your civ.');
      c.appendChild(retWarn);
    }
    const tariffRow = Utils.createEl('div', 'society-slider-row');
    const tariffSlider = Utils.createEl('input', 'society-slider');
    tariffSlider.type  = 'range';
    tariffSlider.min   = '0';
    tariffSlider.max   = '100';
    tariffSlider.value = String(Math.round(tar));
    const tariffVal    = Utils.createEl('span', 'society-slider-val', String(Math.round(tar)));
    tariffSlider.oninput = () => { tariffVal.textContent = tariffSlider.value; };
    const tariffApply  = Utils.createEl('button', 'btn btn-secondary btn-sm', 'Set Tariff');
    tariffApply.onclick = () =>
      this._applyEvent('set_tariff_level', { level: Number(tariffSlider.value) });
    const tariffLabels = Utils.createEl('div', 'society-tariff-labels');
    tariffLabels.innerHTML = '<span>0 — Free Trade</span><span>100 — Full Protectionism</span>';
    tariffRow.appendChild(tariffSlider);
    tariffRow.appendChild(tariffVal);
    tariffRow.appendChild(tariffApply);
    c.appendChild(tariffRow);
    c.appendChild(tariffLabels);

    // ── Income Distribution ────────────────────────────────
    c.appendChild(this._section('Income Distribution'));
    const econModelId = civ.economic?.modelId ?? 'mixed';
    const wealthConc  = civ.economic?.wealthConcentration ?? 20;
    const iqVal       = s.institutionalQuality ?? 50;
    const laborShare  = civ.economic?.laborShare ?? 60;

    // Compensation ratio (derived, not stored)
    const baseRatio = { gift: 3, commons: 5, labor_credit: 4, barter: 8,
                        mixed: 15, commodity: 20, planned: 12, market: 25,
                        hierarchical: 40 }[econModelId] ?? 15;
    const concentrationMult = 1 + (wealthConc / 100) * 10;
    const institutionalDamper = 1 - (iqVal / 200);
    const compRatio = Math.max(1, Math.round(baseRatio * concentrationMult * institutionalDamper));

    const ratioColor = compRatio < 10 ? 'bar-green'
      : compRatio < 50 ? 'bar-blue'
      : compRatio < 150 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar(
      `Elite-to-Worker Ratio: ${compRatio}:1`,
      Math.min(compRatio, 500), 500, ratioColor,
      compRatio >= 150 ? 'Extreme inequality' : ''
    ));

    const lsColor = laborShare > 65 ? 'bar-green'
      : laborShare > 45 ? '' : 'bar-red';
    c.appendChild(this._bar('Labor Share of Income', Math.round(laborShare), 100, lsColor,
      laborShare < 40 ? 'Workers receiving diminishing share' : ''
    ));

    // ── Inheritance System ─────────────────────────────────
    c.appendChild(this._section('Inheritance System'));
    const inhHelp = Utils.createEl('p', 'society-help-text',
      'How wealth transfers across generations. Affects the long-term rate of wealth concentration.');
    c.appendChild(inhHelp);

    const curInh = civ.governance?.inheritanceSystem ?? 'partible';
    const INH_OPTIONS = [
      { id: 'communal',      label: 'Communal',      desc: 'Wealth redistributed each generation', effect: '0.7x conc. rate' },
      { id: 'partible',      label: 'Partible',      desc: 'Divided among heirs',                  effect: '0.85x conc. rate' },
      { id: 'meritocratic',  label: 'Meritocratic',  desc: 'Based on contribution/ability',        effect: '1.0x conc. rate' },
      { id: 'primogeniture', label: 'Primogeniture',  desc: 'Eldest inherits all',                  effect: '1.3x conc. rate' },
    ];

    const inhGrid = Utils.createEl('div', 'debt-model-grid');
    INH_OPTIONS.forEach(opt => {
      const card = Utils.createEl('div',
        'debt-model-card' + (opt.id === curInh ? ' current' : ''));
      card.appendChild(Utils.createEl('div', 'debt-model-card-title', opt.label));
      card.appendChild(Utils.createEl('div', 'debt-model-card-desc', opt.desc));
      card.appendChild(Utils.createEl('div', 'debt-model-card-desc', opt.effect));
      if (opt.id !== curInh) {
        const btn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Switch');
        btn.onclick = () => this._applyEvent('set_inheritance_system', { system: opt.id });
        card.appendChild(btn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', 'Current'));
      }
      inhGrid.appendChild(card);
    });
    c.appendChild(inhGrid);

    // ── Economic Divergence Indicator ───────────────────────
    c.appendChild(this._section('Economic Divergence Indicator'));
    const divHelp = Utils.createEl('p', 'society-help-text',
      'Compares civilizational economic health (financial depth, trade, stability) against the actual wellbeing of the lowest strata. '
      + 'A high divergence score means your nation\'s aggregate economy looks healthy while large portions of the population are suffering.');
    c.appendChild(divHelp);

    // Compute divergence from latest history snapshot or live values
    const history   = s.economicHistory ?? [];
    const lastSnap  = history.length > 0 ? history[history.length - 1] : null;
    const aggHealth = lastSnap?.aggregateEconomicHealth
      ?? Math.round((fd * 0.4 + td * 0.3 + (100 - dl) * 0.3));
    const strataWB  = lastSnap?.strataWellbeing ?? {};
    const wc  = strataWB.working_class     ?? (s.averageWellbeing ?? 50) - 10;
    const dis = strataWB.disenfranchised   ?? (s.averageWellbeing ?? 50) - 20;
    const bottomAvg = (wc + dis) / 2;
    const divScore  = lastSnap?.divergenceScore ?? (aggHealth - bottomAvg);

    // Check if bottom strata are actually declining (compare last two snapshots)
    const prevSnap = history.length > 1 ? history[history.length - 2] : null;
    const prevBottomAvg = prevSnap
      ? ((prevSnap.strataWellbeing?.working_class ?? bottomAvg) + (prevSnap.strataWellbeing?.disenfranchised ?? bottomAvg)) / 2
      : bottomAvg;
    const bottomDeclining = bottomAvg < prevBottomAvg - 0.5;

    const divColor  = divScore > 20 ? '#ef4444' : divScore > 8 ? '#f59e0b' : bottomDeclining ? '#f59e0b' : '#22c55e';
    const divLabel  = divScore > 20
      ? '🔴 Critical — Aggregate growth masking widespread stratum suffering'
      : divScore > 8
        ? '🟡 Elevated — Lower strata lagging behind economic headline'
        : bottomDeclining
          ? '🟡 Narrow gap — but lower strata wellbeing is declining'
          : '🟢 Aligned — Economic gains reaching lower strata';

    const divBadge = Utils.createEl('div', 'society-divergence-badge');
    divBadge.style.borderColor = divColor;
    divBadge.style.color       = divColor;
    divBadge.innerHTML =
      `<span class="divergence-score">${divScore >= 0 ? '+' : ''}${divScore.toFixed(1)}</span>`
      + `<span class="divergence-label">${divLabel}</span>`;
    c.appendChild(divBadge);

    // Canvas divergence chart
    const canvasWrap = Utils.createEl('div', 'society-canvas-wrap');
    const divCanvas  = Utils.createEl('canvas', 'society-canvas');
    divCanvas.width  = 560;
    divCanvas.height = 116;
    canvasWrap.appendChild(divCanvas);
    c.appendChild(canvasWrap);
    // Draw after DOM insertion (requestAnimationFrame for safety)
    requestAnimationFrame(() => {
      ChartUtils.drawDivergenceChart(divCanvas, aggHealth, bottomAvg, divScore);
    });

    // Stratum economic impact bar chart
    c.appendChild(this._section('Per-Stratum Economic Impact (Current Debt Model)'));
    const strataBars = [
      { label: 'Elite',           value: dmt.strataWellbeingEffects?.elite           ?? 0 },
      { label: 'Upper Middle',    value: dmt.strataWellbeingEffects?.upper_middle     ?? 0 },
      { label: 'Lower Middle',    value: dmt.strataWellbeingEffects?.lower_middle     ?? 0 },
      { label: 'Working Class',   value: dmt.strataWellbeingEffects?.working_class    ?? 0 },
      { label: 'Disenfranchised', value: dmt.strataWellbeingEffects?.disenfranchised  ?? 0 },
    ];
    const strataCanvasWrap = Utils.createEl('div', 'society-canvas-wrap');
    const strataCanvas = Utils.createEl('canvas', 'society-canvas');
    strataCanvas.width  = 560;
    strataCanvas.height = 200;
    strataCanvasWrap.appendChild(strataCanvas);
    c.appendChild(strataCanvasWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawStratumBars(strataCanvas, strataBars, {
        title: 'Wellbeing effect per stratum (debt model)',
        minVal: -20, maxVal: 15,
      });
    });

    // Financial overview chart (3-bar: depth, debt, trade)
    c.appendChild(this._section('Economic Overview'));
    const overviewCanvasWrap = Utils.createEl('div', 'society-canvas-wrap');
    const overviewCanvas = Utils.createEl('canvas', 'society-canvas');
    overviewCanvas.width  = 560;
    overviewCanvas.height = 120;
    overviewCanvasWrap.appendChild(overviewCanvas);
    c.appendChild(overviewCanvasWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawBarChart(overviewCanvas, [
        { label: isNonMarketMetrics ? 'Economic Complexity' : 'Financial Depth',  value: fd,  color: '#38bdf8' },
        { label: isNonMarketMetrics ? 'Obligation Burden' : 'Debt Load',        value: dl,  color: dl > 70 ? '#ef4444' : dl > 45 ? '#f59e0b' : '#22c55e' },
        { label: isNonMarketMetrics ? 'External Dependency' : 'Trade Dependency', value: td,  color: '#a78bfa' },
        { label: 'Tariff Level',     value: tar, color: tar > 60 ? '#ef4444' : '#94a3b8' },
      ], { title: isNonMarketMetrics ? 'Aggregate resource indicators (0–100)' : 'Aggregate economic indicators (0–100)' });
    });

    // Historical line chart (if data available)
    if (history.length > 2) {
      c.appendChild(this._section('Economic History (last 50 turns)'));
      const histCanvasWrap = Utils.createEl('div', 'society-canvas-wrap');
      const histCanvas     = Utils.createEl('canvas', 'society-canvas');
      histCanvas.width     = 560;
      histCanvas.height    = 200;
      histCanvasWrap.appendChild(histCanvas);
      c.appendChild(histCanvasWrap);
      requestAnimationFrame(() => {
        const series = [
          {
            label: 'Aggregate Economy',
            color: '#38bdf8',
            points: history.map(h => ({ x: h.turn, y: h.aggregateEconomicHealth ?? 50 })),
          },
          {
            label: 'Lower-Strata Wellbeing',
            color: '#f87171',
            points: history.map(h => {
              const sw = h.strataWellbeing ?? {};
              const avg = ((sw.working_class ?? 50) + (sw.disenfranchised ?? 40)) / 2;
              return { x: h.turn, y: avg };
            }),
          },
          {
            label: isNonMarketMetrics ? 'Obligation Burden' : 'Debt Load',
            color: '#fb923c',
            points: history.map(h => ({ x: h.turn, y: h.debtLoad ?? 20 })),
          },
        ];
        ChartUtils.drawLineChart(histCanvas, series, {
          title: 'Economy vs. lower-strata wellbeing over time',
          minY: 0, maxY: 100,
          xLabel: 'Turn', yLabel: 'Score',
        });
      });
    }

    // Track 2 note
    const t2note = Utils.createEl('div', 'society-t2-note',
      '📥 Data export (CSV / PNG download) will be available in Track 2.');
    c.appendChild(t2note);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: DEMOGRAPHICS
  // ═══════════════════════════════════════════════════════════
  _renderDemographics(c, civ) {
    const s = civ.state;
    const profileId  = s.demographicProfile ?? 'balanced';
    const profile    = DEMOGRAPHIC_PROFILES.find(p => p.id === profileId)
                       ?? DEMOGRAPHIC_PROFILES[1];

    // Profile badge
    c.appendChild(this._section('Current Demographic Profile'));
    const badge = Utils.createEl('div', `demographic-profile-badge demo-${profileId}`);
    badge.innerHTML = `<span class="demo-icon">${profile.icon}</span>`
      + `<span class="demo-label">${profile.label}</span>`
      + `<span class="demo-note">${profile.note}</span>`;
    c.appendChild(badge);
    c.appendChild(Utils.createEl('p', 'society-help-text', profile.description));

    // Per-turn effects
    c.appendChild(this._section('Per-Turn Effects'));
    const fx = profile.perTurnEffects ?? {};
    const fxList = Utils.createEl('div', 'society-effects-list');
    [
      ['Wellbeing',    fx.wellbeing    ?? 0, '/turn'],
      ['Equality',     fx.equalityIndex ?? 0, '/turn'],
      ['Innovation',   fx.innovation   ?? 0, '/turn'],
      ['Stability ±',  fx.stabilityRisk ?? 0, ' risk/turn'],
    ].forEach(([label, val, suffix]) => {
      const sign = val >= 0 ? '+' : '';
      const color = val > 0 ? 'pct-green' : val < 0 ? 'pct-red' : '';
      const row = Utils.createEl('div', 'society-strata-row');
      row.appendChild(Utils.createEl('span', 'society-strata-key', label));
      row.appendChild(Utils.createEl('span', `society-strata-pct ${color}`,
        `${sign}${val.toFixed(3)}${suffix}`));
      fxList.appendChild(row);
    });
    c.appendChild(fxList);

    // Trajectory
    c.appendChild(this._section('Demographic Trajectory'));
    const traj = this._demographicTrajectory(civ);
    const trajEl = Utils.createEl('div', 'society-effects-list');
    traj.forEach(t => trajEl.appendChild(Utils.createEl('div', 'society-effect-item', t)));
    c.appendChild(trajEl);

    // ── Urbanization Rate ──────────────────────────────────────
    c.appendChild(this._section('Urbanization'));
    const urbanRate = Math.round(s.urbanizationRate ?? 15);
    const urbanColor = urbanRate > 50 ? 'bar-green' : urbanRate > 20 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Urbanization Rate', urbanRate, 100, urbanColor,
      urbanRate > 80 ? 'Hyper-urban — slum risk if infrastructure low' : urbanRate < 10 ? 'Pre-urban — largely rural population' : ''));
    const urbanHelp = Utils.createEl('p', 'society-help-text');
    urbanHelp.textContent = 'Fraction of population in cities. Urban populations are easier to tax (boosts state capacity), generate agglomeration effects for innovation, but require infrastructure and food security to avoid slums and instability.';
    c.appendChild(urbanHelp);

    // Urbanization drivers
    const urbanDrivers = [];
    const infraUrb = s.infrastructureLevel ?? 35;
    const techUrb = s.technologyLevel ?? 1;
    urbanDrivers.push(`Infrastructure (${Math.round(infraUrb)}): +${(infraUrb / 100 * 0.015).toFixed(3)}/turn`);
    urbanDrivers.push(`Technology (level ${techUrb}): +${(techUrb * 0.005).toFixed(3)}/turn`);
    const econIdUrb = civ.economic?.modelId ?? civ.governance?.economicModelId ?? '';
    if (econIdUrb === 'market' || econIdUrb === 'mixed') urbanDrivers.push('Market economy: +0.01/turn');
    const foodSecUrb = s.foodSecurity ?? 60;
    if (foodSecUrb < 30) urbanDrivers.push('Food insecurity: -0.01/turn');
    if ((s.atWar ?? false) || (s.warTurns ?? 0) > 0) urbanDrivers.push('War: -0.02/turn');
    if (urbanRate > 50) urbanDrivers.push('Urban tax base: stateCapacity +0.005/turn');
    if (urbanRate > 60) urbanDrivers.push('Agglomeration: innovation +0.01/turn');
    if (urbanRate > 70 && foodSecUrb < 40) urbanDrivers.push('Urban food riots: stability -0.03/turn');
    if (urbanRate > 80 && infraUrb < 40) urbanDrivers.push('Slum formation: wellbeing -0.02/turn');
    const urbDrvList = Utils.createEl('div', 'society-effects-list');
    urbanDrivers.forEach(d => urbDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
    c.appendChild(urbDrvList);

    // ── Technological Unemployment ──────────────────────────────
    c.appendChild(this._section('Technological Unemployment'));
    const tuHelp = Utils.createEl('p', 'society-help-text',
      'Structural labor displacement from automation and technological change. Models the displacement pipeline, retraining absorption, and new sector creation. High tech unemployment drives anomie, inequality, and instability.');
    c.appendChild(tuHelp);
    const techUnemp = Math.round(s.techUnemployment ?? 0);
    const retrain = Math.round(s.retrainingCapacity ?? 40);
    const autoLvl = s.automationLevel ?? 0;
    const tuColor = techUnemp > 25 ? 'bar-red' : techUnemp > 10 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Tech Unemployment', techUnemp, 100, tuColor,
      techUnemp > 30 ? 'Severe displacement — stability threatened, anomie surging' :
      techUnemp > 15 ? 'Significant displacement — inequality and anomie rising' :
      techUnemp < 3 ? 'Minimal displacement' : ''));
    c.appendChild(this._bar('Retraining Capacity', retrain, 100, this._colorForIndex(retrain),
      retrain < 20 ? 'Low retraining: displaced workers have no path to new employment' : ''));
    if (autoLvl >= 3 && techUnemp > 15) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        `Automation level ${autoLvl} displacing workers faster than retraining can absorb. Invest in retraining programs.`));
    }

    // Tech unemployment drivers
    const tuDrivers = [];
    if (autoLvl >= 2) tuDrivers.push(`Automation level ${autoLvl}: displacing +${(0.02 * (autoLvl - 1)).toFixed(2)}/turn`);
    tuDrivers.push(`Retraining absorption: -${(retrain / 100 * 0.03).toFixed(3)}/turn`);
    const innovTu = s.behaviorReinforcement?.innovation ?? 50;
    if (innovTu > 60) tuDrivers.push(`High innovation (${Math.round(innovTu)}): new sectors absorbing displaced workers`);
    tuDrivers.push('Natural recovery: -0.005/turn (informal economy)');
    if ((s.educationQuality ?? 50) > 60) tuDrivers.push('Education > 60: retraining capacity improving');
    const tuDrvList = Utils.createEl('div', 'society-effects-list');
    tuDrivers.forEach(d => tuDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
    c.appendChild(tuDrvList);

    // Retraining program button
    const retrainBtnRow = Utils.createEl('div', 'society-btn-row');
    const retrainBtn = Utils.createEl('button', 'btn btn-secondary',
      'Retraining Program (+10 Capacity, -5 Unemployment)');
    retrainBtn.title = 'Government-sponsored retraining to absorb displaced workers. Effectiveness depends on state capacity and education.';
    retrainBtn.onclick = () => this._applyEvent('retraining_program');
    retrainBtnRow.appendChild(retrainBtn);
    c.appendChild(retrainBtnRow);

    // Birth rate drivers
    c.appendChild(this._section('Birth Rate Drivers'));
    const brd = Utils.createEl('div', 'society-effects-list');
    const gei = s.genderEquity ?? 50;
    const ea  = s.educationAccess ?? 'universal_lower';
    const al  = s.automationLevel ?? 0;
    [
      `⚖️ Gender Equity (${gei}): ${gei > 65 ? 'Moderate birth-rate suppression (−2% proxy)' : gei < 35 ? 'Elevated birth rates (social pressure)' : 'Neutral'}`,
      `📚 Education Access (${ea}): ${ea === 'universal' ? 'Universal education moderates birth rates' : ea === 'limited' ? 'Limited education → higher birth rates, lower human capital' : 'Moderate effect'}`,
      `🤖 Automation Level (${al}): ${al >= 3 ? 'High automation reduces labor demand, easing demographic pressure' : 'Low automation; demographic effects primarily social'}`,
    ].forEach(txt => brd.appendChild(Utils.createEl('div', 'society-effect-item', txt)));
    c.appendChild(brd);

    // ── Demographic Transition (Round 15) ─────────────────────────────
    const dtStage = s.demographicTransitionStage ?? 1;
    const stageData = (typeof DEMOGRAPHIC_TRANSITION_STAGES !== 'undefined')
      ? DEMOGRAPHIC_TRANSITION_STAGES[dtStage - 1] : null;

    if (stageData) {
      // Transition stage badge
      c.appendChild(this._section('Demographic Transition'));
      const dtBadge = Utils.createEl('div', `demographic-profile-badge demo-transition-stage-${dtStage}`);
      dtBadge.innerHTML = `<span class="demo-icon">${stageData.icon}</span>`
        + `<span class="demo-label">Stage ${dtStage}: ${stageData.label}</span>`
        + `<span class="demo-note">${stageData.description}</span>`;
      c.appendChild(dtBadge);

      // Vital rates
      c.appendChild(this._section('Vital Rates'));
      const fertVal = Math.round((s.fertilityRate ?? 45) * 10) / 10;
      const mortVal = Math.round((s.mortalityRate ?? 40) * 10) / 10;
      const lifeExp = Math.round(s.lifeExpectancy ?? 32);
      const infMort = Math.round(s.infantMortality ?? 75);
      const netGrowth = (fertVal - mortVal);

      c.appendChild(this._bar('Fertility Rate', fertVal, 55,
        fertVal > 35 ? 'bar-red' : fertVal > 18 ? 'bar-amber' : 'bar-green',
        `${fertVal.toFixed(1)} per 1000`));
      c.appendChild(this._bar('Mortality Rate', mortVal, 55,
        mortVal > 30 ? 'bar-red' : mortVal > 15 ? 'bar-amber' : 'bar-green',
        `${mortVal.toFixed(1)} per 1000`));
      c.appendChild(this._bar('Life Expectancy', lifeExp, 95,
        lifeExp < 40 ? 'bar-red' : lifeExp < 65 ? 'bar-amber' : 'bar-green',
        `${lifeExp} years`));
      c.appendChild(this._bar('Infant Mortality', infMort, 100,
        infMort > 50 ? 'bar-red' : infMort > 20 ? 'bar-amber' : 'bar-green',
        `${infMort} per 1000 live births`));

      // Net growth indicator
      const growthSign = netGrowth >= 0 ? '+' : '';
      const growthColor = netGrowth > 15 ? 'pct-red' : netGrowth > 5 ? 'pct-amber' : netGrowth < -2 ? 'pct-red' : 'pct-green';
      const growthRow = Utils.createEl('div', 'society-strata-row');
      growthRow.appendChild(Utils.createEl('span', 'society-strata-key', 'Net Population Growth'));
      growthRow.appendChild(Utils.createEl('span', `society-strata-pct ${growthColor}`,
        `${growthSign}${netGrowth.toFixed(1)} per 1000`));
      c.appendChild(growthRow);

      // Age cohorts
      c.appendChild(this._section('Population Age Structure'));
      const youthPct = Math.round((s.youthCohort ?? 40) * 10) / 10;
      const elderPct = Math.round((s.elderlyCohort ?? 5) * 10) / 10;
      const workPct = Math.round((100 - youthPct - elderPct) * 10) / 10;
      const depRatio = s._dependencyRatio ?? ((youthPct + elderPct) / Math.max(workPct, 30));

      c.appendChild(this._bar('Youth (under working age)', youthPct, 55,
        youthPct > 42 ? 'bar-red' : youthPct > 35 ? 'bar-amber' : 'bar-green',
        `${youthPct.toFixed(1)}%`));
      c.appendChild(this._bar('Working Age', workPct, 80,
        workPct < 40 ? 'bar-red' : workPct < 50 ? 'bar-amber' : 'bar-green',
        `${workPct.toFixed(1)}%`));
      c.appendChild(this._bar('Elderly (post working age)', elderPct, 40,
        elderPct > 22 ? 'bar-red' : elderPct > 15 ? 'bar-amber' : 'bar-green',
        `${elderPct.toFixed(1)}%`));

      const depRow = Utils.createEl('div', 'society-strata-row');
      depRow.appendChild(Utils.createEl('span', 'society-strata-key', 'Dependency Ratio'));
      const depColor = depRatio > 1.0 ? 'pct-red' : depRatio > 0.7 ? 'pct-amber' : 'pct-green';
      depRow.appendChild(Utils.createEl('span', `society-strata-pct ${depColor}`,
        `${(typeof depRatio === 'number' ? depRatio : 0).toFixed(2)}`));
      c.appendChild(depRow);

      // Epidemiological profile
      c.appendChild(this._section('Epidemiological Profile'));
      const disVal = Math.round(s.diseaseBurden ?? 60);
      const sanVal = Math.round(s.sanitationLevel ?? 18);
      const epiProfile = s.epidemiologicalProfile ?? stageData.diseaseProfile;

      c.appendChild(this._bar('Disease Burden', disVal, 100,
        disVal > 50 ? 'bar-red' : disVal > 25 ? 'bar-amber' : 'bar-green',
        disVal > 60 ? 'Infectious diseases dominant' : ''));
      c.appendChild(this._bar('Sanitation Level', sanVal, 100,
        sanVal < 25 ? 'bar-red' : sanVal < 50 ? 'bar-amber' : 'bar-green',
        sanVal < 15 ? 'Minimal sanitation infrastructure' : ''));

      const epiLabels = {
        infectious_dominant: 'Infectious Disease Dominant — parasites, waterborne illness, plague risk',
        receding_pandemics: 'Receding Pandemics — improved sanitation reducing infectious disease',
        degenerative_emerging: 'Degenerative Diseases Emerging — chronic conditions replacing infectious',
        chronic_dominant: 'Chronic Diseases Dominant — heart disease, cancer, diabetes',
        aging_dominant: 'Aging-Related Diseases Dominant — dementia, frailty, multi-morbidity',
      };
      c.appendChild(Utils.createEl('p', 'society-help-text', epiLabels[epiProfile] ?? epiProfile));

      // Fertility rate drivers
      c.appendChild(this._section('Fertility Rate Drivers'));
      const fertDrivers = [];
      if (infMort < 50) fertDrivers.push(`Child survival (infant mort ${infMort}): lowering fertility`);
      if (infMort > 50) fertDrivers.push(`High infant mortality (${infMort}): families compensate with more children`);
      const geiDt = s.genderEquityIndex ?? s.genderEquity ?? 30;
      if (geiDt > 60) fertDrivers.push(`Gender equity (${Math.round(geiDt)}): women's agency reducing fertility`);
      if (geiDt < 35) fertDrivers.push(`Low gender equity (${Math.round(geiDt)}): social pressure for large families`);
      const educQDt = s.educationQuality ?? 30;
      if (educQDt > 60) fertDrivers.push(`Education quality (${Math.round(educQDt)}): reducing fertility`);
      if (urbanRate > 40) fertDrivers.push(`Urbanization (${urbanRate}%): children costly in cities`);
      const rhTierDt = s.reproductiveHealthTier ?? 'none';
      if (rhTierDt !== 'none' && rhTierDt !== 'basic') fertDrivers.push(`Reproductive health (${rhTierDt}): contraception access`);
      if (fertDrivers.length === 0) fertDrivers.push('Pre-transition: high fertility is the equilibrium');
      const fertDrvList = Utils.createEl('div', 'society-effects-list');
      fertDrivers.forEach(d => fertDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(fertDrvList);

      // Mortality rate drivers
      c.appendChild(this._section('Mortality Rate Drivers'));
      const mortDrivers = [];
      mortDrivers.push(`Sanitation (${sanVal}): ${sanVal > 50 ? 'strong protective effect' : sanVal > 25 ? 'moderate effect' : 'insufficient — waterborne disease risk'}`);
      mortDrivers.push(`Healthcare (tier ${s.healthcareTier ?? 0}): ${(s.healthcareTier ?? 0) >= 3 ? 'modern medicine available' : 'limited medical capacity'}`);
      mortDrivers.push(`Food security (${Math.round(s.foodSecurity ?? 60)}): ${(s.foodSecurity ?? 60) > 60 ? 'adequate nutrition' : 'malnutrition risk'}`);
      if ((s.atWar ?? false) || (s.warStatus)) mortDrivers.push('War: elevated mortality from combat and disruption');
      if (elderPct > 15) mortDrivers.push(`Aging population (${elderPct.toFixed(1)}% elderly): crude death rate rising`);
      const mortDrvList = Utils.createEl('div', 'society-effects-list');
      mortDrivers.forEach(d => mortDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(mortDrvList);

      // Policy buttons
      c.appendChild(this._section('Demographic Policy'));
      const demBtnRow = Utils.createEl('div', 'society-btn-row');
      const phBtn = Utils.createEl('button', 'btn btn-secondary',
        'Public Health Campaign (+Sanitation, -Disease, -Infant Mort)');
      phBtn.title = 'Organized public health efforts. Effectiveness scales with state capacity.';
      phBtn.onclick = () => this._applyEvent('public_health_campaign');
      demBtnRow.appendChild(phBtn);

      const sanBtn = Utils.createEl('button', 'btn btn-secondary',
        'Sanitation Investment (+12 Sanitation, +3 Infra, -3 Disease)');
      sanBtn.title = 'Major investment in water supply and waste management infrastructure.';
      sanBtn.onclick = () => this._applyEvent('sanitation_investment');
      demBtnRow.appendChild(sanBtn);

      const vacBtn = Utils.createEl('button', 'btn btn-secondary',
        'Vaccination / Disease Prevention (-Disease, -Infant Mort)');
      vacBtn.title = 'Disease prevention program. Effect depends on technology level.';
      vacBtn.onclick = () => this._applyEvent('vaccination_program');
      demBtnRow.appendChild(vacBtn);
      c.appendChild(demBtnRow);

      // Alerts
      if (dtStage === 2 && fertVal > 35) {
        c.appendChild(Utils.createEl('div', 'society-alert',
          'Population explosion: mortality falling but fertility still high. Rapid growth straining resources.'));
      }
      if (dtStage === 5 && fertVal < 10) {
        c.appendChild(Utils.createEl('div', 'society-alert',
          'Population decline: below-replacement fertility. Without immigration, population will shrink and age rapidly.'));
      }
      if (youthPct > 42 && (s.socialMobility ?? 50) < 30) {
        c.appendChild(Utils.createEl('div', 'society-alert',
          'Youth bulge with low social mobility: elevated instability risk (Urdal/Goldstone).'));
      }
    }
  }

  _demographicTrajectory(civ) {
    const s = civ.state;
    const profileId = s.demographicProfile ?? 'balanced';
    const gei   = s.genderEquity   ?? 50;
    const ea    = s.educationAccess ?? 'universal_lower';
    const al    = s.automationLevel ?? 0;
    const wl    = s.averageWellbeing ?? 50;
    const stab  = s.stability ?? 50;
    const hasLongevity = (civ.technologies ?? []).some(t =>
      t.id?.includes('longevity') || t.id?.includes('lifeExtension'));

    const items = [];

    if (profileId === 'balanced') {
      if (gei > 65 && ea === 'universal' && al >= 3)
        items.push('⚠️ Conditions favor drift toward Aging — high equity + universal education + automation');
      else if (wl < 30)
        items.push('⚠️ Low wellbeing + high birth pressure may push toward Young or Demographic Stress');
      else
        items.push('✅ Stable. No strong drift toward another profile currently.');
    } else if (profileId === 'young') {
      if (wl < 30 && stab < 40)
        items.push('⚠️ Youth bulge + low wellbeing + instability → elevated Demographic Stress risk');
      else
        items.push('→ Improving wellbeing and education can gradually shift toward Balanced.');
    } else if (profileId === 'aging') {
      if (stab < 40)
        items.push('⚠️ Aging + low stability → Demographic Stress risk');
      if (al >= 3)
        items.push('✅ Automation Level ' + al + ' is partially compensating for labor shortfall');
      if (hasLongevity)
        items.push('⚠️ Longevity technology is accelerating the aging transition');
      items.push('→ Immigration policy, automation, or natalist incentives can reverse this trend.');
    } else if (profileId === 'demographic_stress') {
      items.push('🔴 Crisis state — urgent policy response needed');
      if (wl > 50 && stab > 50)
        items.push('→ Wellbeing and stability are recovering — profile may normalize within ~5 turns');
    }
    if (items.length === 0) items.push('→ No notable trajectory pressures detected.');
    return items;
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: FAMILY & REPRODUCTION
  // ═══════════════════════════════════════════════════════════
  _renderFamily(c, civ) {
    const s = civ.state;

    // ── Family Structure ──────────────────────────────────────
    c.appendChild(this._section('Family Structure'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'The dominant family unit shapes social cohesion, elderly care, geographic mobility, and child development outcomes.'));
    const curFS = s.familyStructure ?? 'nuclear';
    const fsGrid = Utils.createEl('div', 'society-tier-grid');
    FAMILY_STRUCTURES.forEach(fs => {
      const card = Utils.createEl('div', 'society-tier-card' + (fs.id === curFS ? ' current' : ''), '');
      card.appendChild(Utils.createEl('div', 'society-tier-card-title', `${fs.icon} ${fs.label}`));
      card.appendChild(Utils.createEl('div', 'society-tier-card-desc', fs.description));
      const fxEl = Utils.createEl('div', 'society-tier-card-fx');
      const fxParts = [
        fs.perTurnEffects?.wellbeing ? `Wellbeing ${fs.perTurnEffects.wellbeing >= 0 ? '+' : ''}${fs.perTurnEffects.wellbeing}/t` : null,
        fs.mobilityBonus ? `Mobility ${fs.mobilityBonus >= 0 ? '+' : ''}${(fs.mobilityBonus * 100).toFixed(0)}%` : null,
      ].filter(Boolean);
      if (fxParts.length) fxEl.textContent = fxParts.join(' · ');
      card.appendChild(fxEl);
      if (fs.id !== curFS) {
        const applyBtn = Utils.createEl('button', 'btn btn-xs btn-secondary', 'Apply');
        applyBtn.onclick = () => this._applyEvent('set_family_structure', { structure: fs.id });
        card.appendChild(applyBtn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', '✓ Current'));
      }
      fsGrid.appendChild(card);
    });
    c.appendChild(fsGrid);

    // ── Family Size Policy ────────────────────────────────────
    c.appendChild(this._section('Family Size Policy'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Official stance on family size shapes birth rates, demographic drift, and stratum wellbeing. Lower strata bear the heaviest cost of pronatalist policy.'));
    const curFSP = s.familySizePolicy ?? 'neutral';
    const fspGrid = Utils.createEl('div', 'society-tier-grid');
    FAMILY_SIZE_POLICIES.forEach(pol => {
      const card = Utils.createEl('div', 'society-tier-card' + (pol.id === curFSP ? ' current' : ''), '');
      card.appendChild(Utils.createEl('div', 'society-tier-card-title', `${pol.icon} ${pol.label}`));
      card.appendChild(Utils.createEl('div', 'society-tier-card-desc', pol.description));
      if (pol.note) card.appendChild(Utils.createEl('div', 'society-tier-card-note', pol.note));
      if (pol.id !== curFSP) {
        const applyBtn = Utils.createEl('button', 'btn btn-xs btn-secondary', 'Apply');
        applyBtn.onclick = () => this._applyEvent('set_family_size_policy', { policy: pol.id });
        card.appendChild(applyBtn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', '✓ Current'));
      }
      fspGrid.appendChild(card);
    });
    c.appendChild(fspGrid);

    // ── Reproductive Health ───────────────────────────────────
    c.appendChild(this._section('Reproductive Health Access'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Access to sex education, contraception, and reproductive healthcare. Restrictions fall most heavily on lower strata and women.'));
    const curRH = s.reproductiveHealthTier ?? 'available';
    const rhGrid = Utils.createEl('div', 'society-tier-grid');
    REPRODUCTIVE_HEALTH_TIERS.forEach(tier => {
      const card = Utils.createEl('div', 'society-tier-card' + (tier.id === curRH ? ' current' : ''), '');
      card.appendChild(Utils.createEl('div', 'society-tier-card-title', `${tier.icon} ${tier.label}`));
      card.appendChild(Utils.createEl('div', 'society-tier-card-desc', tier.description));
      const fxEl = Utils.createEl('div', 'society-tier-card-fx');
      const fxParts = [
        `GEI ${tier.geiDriftBonus >= 0 ? '+' : ''}${(tier.geiDriftBonus * 100).toFixed(0)}%/t`,
        `Epistemic ${tier.epistemicHealthBonus >= 0 ? '+' : ''}${tier.epistemicHealthBonus}`,
      ];
      fxEl.textContent = fxParts.join(' · ');
      card.appendChild(fxEl);
      if (tier.id !== curRH) {
        const applyBtn = Utils.createEl('button', 'btn btn-xs btn-secondary', 'Apply');
        applyBtn.onclick = () => this._applyEvent('set_reproductive_health_tier', { tier: tier.id });
        card.appendChild(applyBtn);
      } else {
        card.appendChild(Utils.createEl('span', 'society-current-badge', '✓ Current'));
      }
      rhGrid.appendChild(card);
    });
    c.appendChild(rhGrid);

    // ── Current Summary ───────────────────────────────────────
    c.appendChild(this._section('Current State Summary'));
    const summaryList = Utils.createEl('div', 'society-effects-list');
    const fsObj  = FAMILY_STRUCTURES.find(f => f.id === curFS)         ?? FAMILY_STRUCTURES[0];
    const fspObj = FAMILY_SIZE_POLICIES.find(f => f.id === curFSP)     ?? FAMILY_SIZE_POLICIES[1];
    const rhObj  = REPRODUCTIVE_HEALTH_TIERS.find(f => f.id === curRH) ?? REPRODUCTIVE_HEALTH_TIERS[1];
    const wrObj  = WOMENS_RIGHTS_TIERS.find(f => f.id === (s.womensRightsTier ?? 'mostly_full')) ?? WOMENS_RIGHTS_TIERS[1];
    [
      `${fsObj.icon} Family: ${fsObj.label}`,
      `${fspObj.icon} Size policy: ${fspObj.label}`,
      `${rhObj.icon} Reproductive health: ${rhObj.label}`,
      `${wrObj.icon} Women's rights: ${wrObj.label}`,
    ].forEach(t => summaryList.appendChild(Utils.createEl('div', 'society-effect-item', t)));
    c.appendChild(summaryList);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: CULTURE & KNOWLEDGE
  // (Science and arts are parallel but independent: civilizations may
  //  invest in one while restricting the other.)
  // ═══════════════════════════════════════════════════════════
  _renderCulture(c, civ) {
    const s = civ.state;

    const constraintLabel = {
      none: 'None — free inquiry / expression',
      government: 'Government — state directs content',
      capital: 'Capital — market determines what survives',
      religion: 'Religion — doctrine constrains inquiry/expression',
      mixed: 'Mixed — multiple overlapping constraints',
    };

    // ══ SCIENCE ══════════════════════════════════════════════
    c.appendChild(this._section('🔬 Science & Research'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Science support and freedom track separately from arts. A theocracy may restrict empirical inquiry while funding religious study. A market economy may channel science toward applied R&D while leaving basic research underfunded.'));

    c.appendChild(this._bar('Science Support (investment & appreciation)',
      s.scienceSupport ?? 50, 100, this._colorForIndex(s.scienceSupport ?? 50)));
    c.appendChild(this._bar('Science Freedom (researcher autonomy)',
      s.scienceFreedom ?? 50, 100, this._colorForIndex(s.scienceFreedom ?? 50)));

    const scConstraint = Utils.createEl('div', 'society-strata-row');
    scConstraint.appendChild(Utils.createEl('span', 'society-strata-key', 'Constraint source'));
    scConstraint.appendChild(Utils.createEl('span', 'society-strata-pct',
      constraintLabel[s.scienceFreedomConstraint ?? 'none'] ?? s.scienceFreedomConstraint));
    c.appendChild(scConstraint);

    // Science effects breakdown
    const sciEffects = Utils.createEl('div', 'society-effects-list');
    const sciSuppFrac = (s.scienceSupport ?? 50) / 100;
    const sciFreeFrac = (s.scienceFreedom  ?? 50) / 100;
    [
      [`📚 Education quality drift`, `+${(sciSuppFrac * 0.06 + sciFreeFrac * 0.04).toFixed(3)}/turn`],
      [`🧠 Epistemic health drift`,   `+${(sciFreeFrac * 0.03).toFixed(3)}/turn`],
      [`⚙️ Constraint on education`, s.scienceFreedomConstraint === 'capital' || s.scienceFreedomConstraint === 'mixed'
        ? `−${(s.scienceFreedomConstraint === 'mixed' ? 0.005 : 0.01).toFixed(3)}/turn` : 'None'],
    ].forEach(([lbl, val]) => {
      const row = Utils.createEl('div', 'society-strata-row');
      row.appendChild(Utils.createEl('span', 'society-strata-key', lbl));
      row.appendChild(Utils.createEl('span', 'society-strata-pct', val));
      sciEffects.appendChild(row);
    });
    c.appendChild(sciEffects);

    // Science controls
    c.appendChild(this._section('Adjust Science'));
    const sciRow = Utils.createEl('div', 'society-control-row');
    [
      { label: '🔬 Science Surge (+15 support)', type: 'set_science_support', extra: () => ({ support: Math.min(100, (s.scienceSupport ?? 50) + 15) }) },
      { label: '📉 Cut Science Funding (−15)', type: 'set_science_support', extra: () => ({ support: Math.max(0, (s.scienceSupport ?? 50) - 15) }) },
      { label: '🔓 Free Inquiry Policy (+20 freedom)', type: 'set_science_freedom', extra: () => ({ freedom: Math.min(100, (s.scienceFreedom ?? 50) + 20), constraint: 'none' }) },
      { label: '🔒 Restrict Research (−20 freedom)', type: 'set_science_freedom', extra: () => ({ freedom: Math.max(0, (s.scienceFreedom ?? 50) - 20) }) },
    ].forEach(({ label, type, extra }) => {
      const btn = Utils.createEl('button', 'btn btn-xs btn-secondary', label);
      btn.onclick = () => this._applyEvent(type, extra());
      sciRow.appendChild(btn);
    });
    c.appendChild(sciRow);

    // ── divider ─────────────────────────────────────────────
    const divider = Utils.createEl('hr', 'society-divider');
    c.appendChild(divider);

    // ══ ARTS ══════════════════════════════════════════════════
    c.appendChild(this._section('🎭 Arts & Culture'));
    c.appendChild(Utils.createEl('p', 'society-help-text',
      'Arts support and freedom track separately from science. A state may sponsor devotional or patriotic art while restricting critical/secular expression. Commercial economies allow art that sells while non-commercial art withers without public subsidy.'));

    c.appendChild(this._bar('Arts Support (investment & appreciation)',
      s.artsSupport ?? 50, 100, this._colorForIndex(s.artsSupport ?? 50)));
    c.appendChild(this._bar('Arts Freedom (artistic autonomy)',
      s.artsFreedom ?? 50, 100, this._colorForIndex(s.artsFreedom ?? 50)));

    const artConstraint = Utils.createEl('div', 'society-strata-row');
    artConstraint.appendChild(Utils.createEl('span', 'society-strata-key', 'Constraint source'));
    artConstraint.appendChild(Utils.createEl('span', 'society-strata-pct',
      constraintLabel[s.artsFreedomConstraint ?? 'none'] ?? s.artsFreedomConstraint));
    c.appendChild(artConstraint);

    // Arts effects breakdown
    const artEffects = Utils.createEl('div', 'society-effects-list');
    const artSuppFrac = (s.artsSupport ?? 50) / 100;
    const artFreeFrac = (s.artsFreedom  ?? 50) / 100;
    [
      [`😊 Wellbeing drift`,          `+${(artSuppFrac * 0.03).toFixed(3)}/turn`],
      [`🧠 Epistemic health drift`,   `+${(artFreeFrac * 0.01).toFixed(3)}/turn`],
      [`🏛️ Stability drift`,          `+${(artSuppFrac * 0.005).toFixed(4)}/turn`],
    ].forEach(([lbl, val]) => {
      const row = Utils.createEl('div', 'society-strata-row');
      row.appendChild(Utils.createEl('span', 'society-strata-key', lbl));
      row.appendChild(Utils.createEl('span', 'society-strata-pct', val));
      artEffects.appendChild(row);
    });
    c.appendChild(artEffects);

    // Arts controls
    c.appendChild(this._section('Adjust Arts'));
    const artRow = Utils.createEl('div', 'society-control-row');
    [
      { label: '🎭 Arts Investment (+15 support)', type: 'set_arts_support', extra: () => ({ support: Math.min(100, (s.artsSupport ?? 50) + 15) }) },
      { label: '✂️ Arts Funding Cut (−15)', type: 'set_arts_support', extra: () => ({ support: Math.max(0, (s.artsSupport ?? 50) - 15) }) },
      { label: '🔓 Free Expression Policy (+20 freedom)', type: 'set_arts_freedom', extra: () => ({ freedom: Math.min(100, (s.artsFreedom ?? 50) + 20), constraint: 'none' }) },
      { label: '🔒 Censor Arts (−20 freedom)', type: 'set_arts_freedom', extra: () => ({ freedom: Math.max(0, (s.artsFreedom ?? 50) - 20) }) },
    ].forEach(({ label, type, extra }) => {
      const btn = Utils.createEl('button', 'btn btn-xs btn-secondary', label);
      btn.onclick = () => this._applyEvent(type, extra());
      artRow.appendChild(btn);
    });
    c.appendChild(artRow);

    // ── divergence note ──────────────────────────────────────
    const sciSup = s.scienceSupport ?? 50;
    const artSup = s.artsSupport    ?? 50;
    const diff   = Math.abs(sciSup - artSup);
    if (diff >= 20) {
      const noteEl = Utils.createEl('div', 'society-divergence-note');
      if (sciSup > artSup) {
        noteEl.textContent = `⚠️ Science support (${sciSup}) significantly exceeds arts support (${artSup}). Cultural investment lags behind research capacity.`;
      } else {
        noteEl.textContent = `ℹ️ Arts support (${artSup}) significantly exceeds science support (${sciSup}). Cultural life flourishes; research may lag.`;
      }
      c.appendChild(noteEl);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🏥 Healthcare Tab
  // ═══════════════════════════════════════════════════════════
  _renderHealthcare(c, civ) {
    const s = civ.state;
    const _s = (cls, txt) => { const el = Utils.createEl('div', cls); el.textContent = txt; c.appendChild(el); return el; };
    const _sec = (txt) => _s('society-section-hdr', txt);
    const _applyBtn = (label, events) => {
      const b = Utils.createEl('button', 'btn btn-secondary btn-xs', label);
      b.onclick = () => { events.forEach(ev => this.game.simulation?.applyExternalEvent(ev, [civ.id])); this.render(); };
      return b;
    };

    // ── Access Tier ──
    _sec('Healthcare Access Tier');
    const hcNote = Utils.createEl('p', 'society-help-text');
    hcNote.textContent = 'Who can receive care, and under what conditions. Access determines per-stratum health outcomes and shapes equality, wellbeing, and demographic pressure.';
    c.appendChild(hcNote);

    const accessGrid = Utils.createEl('div', 'society-tier-grid');
    for (const tier of HEALTHCARE_ACCESS_TIERS) {
      const isCurrent = s.healthcareAccess === tier.id;
      const colorClass = {
        universal_public:    'hc-universal-public',
        universal_insurance: 'hc-universal-insurance',
        mixed_public_private:'hc-mixed',
        private_only:        'hc-private',
        minimal_traditional: 'hc-minimal',
      }[tier.id] ?? '';
      const card = Utils.createEl('div', `society-tier-card healthcare-access-card ${colorClass}${isCurrent ? ' current' : ''}`);

      const hdr = Utils.createEl('div', 'society-tier-card-hdr');
      hdr.textContent = `${tier.icon} ${tier.label}`;
      card.appendChild(hdr);

      const desc = Utils.createEl('p', 'society-tier-card-desc');
      desc.textContent = tier.description;
      card.appendChild(desc);

      // Stratum access bars
      const barsWrap = Utils.createEl('div', 'hc-stratum-bars');
      for (const [sk, mul] of Object.entries(tier.strataMultipliers)) {
        const row = Utils.createEl('div', 'hc-stratum-row');
        const lbl = Utils.createEl('span', 'hc-stratum-lbl', sk.replace('_', ' '));
        const barOuter = Utils.createEl('div', 'hc-stratum-bar-outer');
        const barInner = Utils.createEl('div', 'hc-stratum-bar-inner');
        barInner.style.width = `${Math.round(mul * 100)}%`;
        barInner.style.background = mul >= 0.8 ? '#4ade80' : mul >= 0.5 ? '#60a5fa' : mul >= 0.25 ? '#fbbf24' : '#f87171';
        barOuter.appendChild(barInner);
        const pct = Utils.createEl('span', 'hc-stratum-pct', `${Math.round(mul * 100)}%`);
        row.appendChild(lbl); row.appendChild(barOuter); row.appendChild(pct);
        barsWrap.appendChild(row);
      }
      card.appendChild(barsWrap);

      const fx = Utils.createEl('div', 'society-tier-card-fx');
      const eqSign = tier.equalityBonus >= 0 ? '+' : '';
      fx.textContent = `Wellbeing base: ${tier.wellbeingBase > 0 ? '+' : ''}${tier.wellbeingBase} | Equality: ${eqSign}${tier.equalityBonus} | Fin. risk: ${tier.financialRisk > 0 ? '+' : ''}${tier.financialRisk}`;
      card.appendChild(fx);

      if (!isCurrent) {
        card.appendChild(_applyBtn('Apply', [{ type: 'set_healthcare_access', access: tier.id }]));
      } else {
        const badge = Utils.createEl('span', 'society-current-badge', '✓ Current');
        card.appendChild(badge);
      }
      accessGrid.appendChild(card);
    }
    c.appendChild(accessGrid);

    // ── Emphasis ──
    _sec('Healthcare Emphasis');
    const emphNote = Utils.createEl('p', 'society-help-text');
    emphNote.textContent = 'Prevention-first reduces long-term disease burden; treatment-focused responds to crises; balanced covers both. Effects compound over turns.';
    c.appendChild(emphNote);

    const emphRow = Utils.createEl('div', 'society-horizontal-cards');
    for (const emph of HEALTHCARE_EMPHASIS_TYPES) {
      const isCur = s.healthcareEmphasis === emph.id;
      const card = Utils.createEl('div', `society-tier-card${isCur ? ' current' : ''}`);
      card.appendChild(Object.assign(Utils.createEl('div', 'society-tier-card-hdr'), { textContent: `${emph.icon} ${emph.label}` }));
      card.appendChild(Object.assign(Utils.createEl('p', 'society-tier-card-desc'), { textContent: emph.description }));
      const fx = Utils.createEl('div', 'society-tier-card-fx');
      fx.textContent = `Wellbeing drift: +${emph.wellbeingDriftBonus}/turn | Plague mitigation: ${Math.round(emph.plagueMitigationBonus * 100)}%`;
      card.appendChild(fx);
      if (!isCur) card.appendChild(_applyBtn('Apply', [{ type: 'set_healthcare_emphasis', emphasis: emph.id }]));
      else card.appendChild(Object.assign(Utils.createEl('span', 'society-current-badge'), { textContent: '✓ Current' }));
      emphRow.appendChild(card);
    }
    c.appendChild(emphRow);

    // ── Incentive Model ──
    _sec('Provider Incentive Model');
    const incNote = Utils.createEl('p', 'society-help-text');
    incNote.textContent = 'What providers are rewarded for shapes what they deliver. Profit-first optimizes for revenue; patient-outcomes optimizes for health results.';
    c.appendChild(incNote);

    const incRow = Utils.createEl('div', 'society-horizontal-cards');
    for (const inc of HEALTHCARE_INCENTIVE_MODELS) {
      const isCur = s.healthcareIncentive === inc.id;
      const colorCls = inc.id === 'patient_outcomes' ? 'hc-patient-outcomes' : inc.id === 'profit_first' ? 'hc-profit-first' : '';
      const card = Utils.createEl('div', `society-tier-card ${colorCls}${isCur ? ' current' : ''}`);
      card.appendChild(Object.assign(Utils.createEl('div', 'society-tier-card-hdr'), { textContent: `${inc.icon} ${inc.label}` }));
      card.appendChild(Object.assign(Utils.createEl('p', 'society-tier-card-desc'), { textContent: inc.description }));
      const fx = Utils.createEl('div', 'society-tier-card-fx');
      const eqS = inc.equalityBonus >= 0 ? '+' : '';
      fx.textContent = `Equality: ${eqS}${inc.equalityBonus}/turn | EH: ${inc.epistemicHealthBonus >= 0 ? '+' : ''}${inc.epistemicHealthBonus}/turn | Wellbeing mod: ${inc.wellbeingModifier > 0 ? '+' : ''}${inc.wellbeingModifier}`;
      card.appendChild(fx);
      if (!isCur) card.appendChild(_applyBtn('Apply', [{ type: 'set_healthcare_incentive', incentive: inc.id }]));
      else card.appendChild(Object.assign(Utils.createEl('span', 'society-current-badge'), { textContent: '✓ Current' }));
      incRow.appendChild(card);
    }
    c.appendChild(incRow);

    // ── Summary ──
    _sec('System Summary');
    const tierDef  = HEALTHCARE_ACCESS_TIERS.find(t => t.id === s.healthcareAccess) ?? HEALTHCARE_ACCESS_TIERS[2];
    const emphDef  = HEALTHCARE_EMPHASIS_TYPES.find(e => e.id === s.healthcareEmphasis) ?? HEALTHCARE_EMPHASIS_TYPES[2];
    const incntDef = HEALTHCARE_INCENTIVE_MODELS.find(m => m.id === s.healthcareIncentive) ?? HEALTHCARE_INCENTIVE_MODELS[2];
    const sumEl = Utils.createEl('div', 'society-summary-box');
    const strataKeys = ['elite', 'upper_middle', 'lower_middle', 'working_class', 'disenfranchised'];
    const accessPcts = strataKeys.map(sk => `${sk.replace('_', '-')}: ${Math.round((tierDef.strataMultipliers[sk] ?? 0) * 100)}%`).join(' | ');
    sumEl.innerHTML = `<b>Access:</b> ${accessPcts}<br>
      <b>Plague mitigation:</b> ${Math.round(emphDef.plagueMitigationBonus * 100)}% damage reduction during epidemic events<br>
      <b>Birth rate pressure:</b> ${tierDef.birthRateMod > 0.05 ? '↑ Youth pressure' : tierDef.birthRateMod < -0.05 ? '↓ Aging pressure' : 'Neutral'}`;
    c.appendChild(sumEl);
  }

  // ═══════════════════════════════════════════════════════════
  // 📺 Information Ecosystem Tab
  // ═══════════════════════════════════════════════════════════
  _renderInformation(c, civ) {
    const s = civ.state;
    const _s = (cls, txt) => { const el = Utils.createEl('div', cls); el.textContent = txt; c.appendChild(el); return el; };
    const _sec = (txt) => _s('society-section-hdr', txt);

    _sec('Information Ecosystem');
    const note = Utils.createEl('p', 'society-help-text');
    note.textContent = 'The information ecosystem determines the media and information environment your civilization operates in. It acts as a per-turn anchor on Epistemic Health — the ecosystem pulls EH toward its equilibrium value each turn. It also affects innovation, social cohesion, and equality.';
    c.appendChild(note);

    const currentEH = Math.round(s.epistemicHealth ?? 50);
    const grid = Utils.createEl('div', 'society-tier-grid info-eco-grid');
    for (const tier of INFORMATION_ECOSYSTEM_TYPES) {
      const isCurrent = s.informationEcosystem === tier.id;
      const colorClass = {
        open_civic:              'info-open-civic',
        free_market_media:       'info-free-market',
        captured_commercial:     'info-captured',
        state_guided:            'info-state-guided',
        total_information_control:'info-total-control',
      }[tier.id] ?? '';
      const card = Utils.createEl('div', `society-tier-card info-eco-card ${colorClass}${isCurrent ? ' current' : ''}`);

      card.appendChild(Object.assign(Utils.createEl('div', 'society-tier-card-hdr'), { textContent: `${tier.icon} ${tier.label}` }));
      card.appendChild(Object.assign(Utils.createEl('p', 'society-tier-card-desc'), { textContent: tier.description }));

      const anchor = Utils.createEl('div', 'info-eco-anchor');
      const drift = ((tier.truthAnchor - currentEH) * 0.006 + tier.epistemicHealthEffect * 0.01).toFixed(3);
      const driftSign = parseFloat(drift) >= 0 ? '+' : '';
      anchor.textContent = `EH anchor: ${tier.truthAnchor} (current: ${currentEH}) — drift: ${driftSign}${drift}/turn`;
      card.appendChild(anchor);

      const fx = Utils.createEl('div', 'society-tier-card-fx');
      const innS = tier.innovationBonus >= 0 ? '+' : '';
      const cohS = tier.socialCohesionEffect >= 0 ? '+' : '';
      const eqS = tier.equalityEffect >= 0 ? '+' : '';
      fx.textContent = `Innovation: ${innS}${tier.innovationBonus * 0.005}/turn | Social cohesion: ${cohS}${tier.socialCohesionEffect * 0.005}/turn | Equality: ${eqS}${tier.equalityEffect * 0.005}/turn`;
      card.appendChild(fx);

      if (!isCurrent) {
        const btn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Apply');
        btn.onclick = () => { this.game.simulation?.applyExternalEvent({ type: 'set_information_ecosystem', ecosystem: tier.id }, [civ.id]); this.render(); };
        card.appendChild(btn);
      } else {
        card.appendChild(Object.assign(Utils.createEl('span', 'society-current-badge'), { textContent: '✓ Current' }));
      }
      grid.appendChild(card);
    }
    c.appendChild(grid);

    // Cross-system warnings
    const gov = civ.governance?.modelId ?? '';
    const econ = civ.economic?.modelId ?? '';
    const ie = s.informationEcosystem ?? 'free_market_media';

    if (ie === 'total_information_control' && (gov === 'autocratic' || gov === 'theocratic')) {
      const warn = Utils.createEl('div', 'society-warn-box info-eco-warn-danger');
      warn.textContent = '⛔ Authoritarian government + total information control: combined epistemic collapse risk. EH will trend toward 10 and stabilize there, suppressing innovation and equality for all strata.';
      c.appendChild(warn);
    } else if (ie === 'free_market_media' && econ === 'market') {
      const note2 = Utils.createEl('div', 'society-info-box');
      note2.textContent = 'ℹ️ Profit-driven media in a market economy: engagement-maximizing algorithms amplify both truth and misinformation. EH drift ceiling is ~60 — open civic press would break through higher.';
      c.appendChild(note2);
    }
  }

  // ── Pass 7: Social Psychology Tab ─────────────────────────────────────────
  _renderSocialPsychology(c, civ) {
    if (!civ?.state) return;
    const s = civ.state;
    const _s = (cls, txt) => { const el = Utils.createEl('div', cls); el.textContent = txt; c.appendChild(el); return el; };
    const _sec = txt => _s('society-section-hdr', txt);

    // ── SECTION 1: Power source display + Empathy by Stratum ──────────────
    _sec('Empathy Capacity by Stratum');
    const helpEl = Utils.createEl('p', 'society-help-text');
    helpEl.textContent = 'Power suppresses empathy in those who hold it — every stratum except the disenfranchised exercises institutional power over the one below. Power flows from two sources: governance hierarchy and wealth-derived economic power. Either can drive suppression; the stronger source dominates.';
    c.appendChild(helpEl);

    // Power source mini-stats row
    const powerRow = Utils.createEl('div', 'empathy-power-source-row');
    const govHL  = civ.governance?.hierarchyLevel ?? 50;
    const econPH = Math.round(s.economicPowerHierarchy ?? 0);
    const effHL  = Math.round(s.effectiveHierarchyLevel ?? 50);
    const plutocratic = !(s.govContributes ?? true);
    [
      { label: 'Governance Hierarchy', val: govHL, cls: 'empathy-power-box gov' },
      { label: 'Economic Power', val: econPH, cls: 'empathy-power-box econ' + (plutocratic ? ' dominant' : '') },
      { label: 'Effective Hierarchy', val: effHL, cls: 'empathy-power-box eff' + (plutocratic ? ' dominant' : '') },
    ].forEach(({ label, val, cls }) => {
      const box = Utils.createEl('div', cls);
      const lbl = Utils.createEl('div', 'empathy-power-box-lbl'); lbl.textContent = label;
      const num = Utils.createEl('div', 'empathy-power-box-val'); num.textContent = val;
      box.appendChild(lbl); box.appendChild(num); powerRow.appendChild(box);
    });
    c.appendChild(powerRow);

    if (plutocratic) {
      const warn = Utils.createEl('div', 'empathy-plutocratic-warn');
      warn.textContent = `⚠️ Wealth-power dominant (${econPH}) exceeds governance hierarchy (${govHL}) — nominal governance is functionally superseded by economic power concentration.`;
      c.appendChild(warn);
    }

    // Stratum bars — uses the proven _bar() helper with known-working CSS
    const strataOrder = ['elite','upper_middle','lower_middle','working_class','disenfranchised'];
    const strataLabels = { elite:'Elite', upper_middle:'Upper Middle', lower_middle:'Lower Middle', working_class:'Working Class', disenfranchised:'Disenfranchised' };
    const POWER_NOTES = { elite:'0.90 power diff', upper_middle:'0.58 power diff', lower_middle:'0.32 power diff', working_class:'0.10 power diff', disenfranchised:'no institutional power' };
    for (const st of strataOrder) {
      const val = Math.round(s.empathyByStratum?.[st] ?? 50);
      const color = val >= 70 ? 'bar-green' : val >= 55 ? '' : val >= 40 ? 'bar-amber' : 'bar-red';
      let note = POWER_NOTES[st];
      if (st === 'elite') note += ` | Cohort resistance: ${Math.round(s.hierarchyEntrenched ?? 0)}%`;
      c.appendChild(this._bar(strataLabels[st], val, 100, color, note));
    }

    // ── SECTION 1B: Paradigm Shift Controls ───────────────────────────────
    _sec('Introduce a Paradigm Shift');
    const psHelp = Utils.createEl('p', 'society-help-text');
    psHelp.textContent = 'Manually trigger a governance or economic paradigm shift for counterfactual modeling. Effects follow the same asymmetric rates as organic shifts.';
    c.appendChild(psHelp);

    const psControls = Utils.createEl('div', 'paradigm-controls-row');

    // Governance shift control
    const govCtrl = Utils.createEl('div', 'paradigm-control-box');
    const govLabel = Utils.createEl('div', 'paradigm-control-lbl'); govLabel.textContent = '🏛️ Governance Model';
    const govSel = Utils.createEl('select', 'paradigm-select');
    const GOV_MODELS = ['autocratic','oligarchy','theocratic','representative','direct_congress','flat_consensus','rotating','elder_council','tribal_chief','shadow_government_complicit','shadow_government_covert','none'];
    const GOV_LABELS = { autocratic:'Autocratic', oligarchy:'Oligarchic', theocratic:'Theocratic', representative:'Representative', direct_congress:'Direct Congress', flat_consensus:'Flat Consensus', rotating:'Rotating Leadership', elder_council:'Elder Council', tribal_chief:'Tribal Chief', shadow_government_complicit:'Shadow Gov (Complicit)', shadow_government_covert:'Shadow Gov (Covert)', none:'No Formal Governance' };
    const curGovM = civ.governance?.modelId ?? '';
    GOV_MODELS.filter(m => m !== curGovM).forEach(m => {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = GOV_LABELS[m] ?? m; govSel.appendChild(opt);
    });
    const govBtn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Apply Governance Shift →');
    govBtn.onclick = () => { this.game.simulation?.applyExternalEvent({ type:'player_gov_paradigm_shift', value:govSel.value }, [civ.id]); this.render(); };
    govCtrl.appendChild(govLabel); govCtrl.appendChild(govSel); govCtrl.appendChild(govBtn);

    // Economic shift control
    const econCtrl = Utils.createEl('div', 'paradigm-control-box');
    const econLabel = Utils.createEl('div', 'paradigm-control-lbl'); econLabel.textContent = '💰 Economic Model';
    const econSel = Utils.createEl('select', 'paradigm-select');
    const ECON_MODELS = ['gift','commons','mixed','hierarchical','market'];
    const ECON_LABELS = { gift:'Gift Economy', commons:'Commons', mixed:'Mixed', hierarchical:'Hierarchical', market:'Market Capitalism' };
    const curEconM = civ.governance?.economicModelId ?? s.economicModel ?? '';
    ECON_MODELS.filter(m => m !== curEconM).forEach(m => {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = ECON_LABELS[m] ?? m; econSel.appendChild(opt);
    });
    const econBtn = Utils.createEl('button', 'btn btn-secondary btn-xs', 'Apply Economic Shift →');
    econBtn.onclick = () => { this.game.simulation?.applyExternalEvent({ type:'player_econ_paradigm_shift', value:econSel.value }, [civ.id]); this.render(); };
    econCtrl.appendChild(econLabel); econCtrl.appendChild(econSel); econCtrl.appendChild(econBtn);

    psControls.appendChild(govCtrl);
    psControls.appendChild(econCtrl);
    c.appendChild(psControls);

    // Shift history log
    const shiftLog = s._shiftLog ?? [];
    if (shiftLog.length > 0) {
      const logHdr = Utils.createEl('div', 'empathy-shift-log-hdr'); logHdr.textContent = 'Shift History';
      c.appendChild(logHdr);
      const logTable = Utils.createEl('table', 'paradigm-proj-table');
      const hdr = Utils.createEl('tr', '');
      ['Turn','Type','From → To','Direction'].forEach(h => { const th = document.createElement('th'); th.textContent = h; hdr.appendChild(th); });
      logTable.appendChild(hdr);
      shiftLog.forEach(e => {
        const tr = Utils.createEl('tr', '');
        // Look up human-readable labels for raw model IDs
        const fromId = e.from ?? '?';
        const toId   = e.to   ?? '?';
        let fromLabel = fromId, toLabel = toId;
        if (e.type === 'gov') {
          fromLabel = (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[fromId]?.label) || fromId;
          toLabel   = (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[toId]?.label)   || toId;
        } else if (e.type === 'econ') {
          fromLabel = (typeof ECONOMIC_MODELS !== 'undefined' && ECONOMIC_MODELS[fromId]?.label) || fromId;
          toLabel   = (typeof ECONOMIC_MODELS !== 'undefined' && ECONOMIC_MODELS[toId]?.label)   || toId;
        }
        [e.turn, e.type.toUpperCase(), `${fromLabel} → ${toLabel}`, e.direction ?? '—'].forEach(v => {
          const td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
        });
        logTable.appendChild(tr);
      });
      c.appendChild(logTable);
    } else {
      const logHdr = Utils.createEl('div', 'empathy-shift-log-hdr'); logHdr.textContent = 'Shift History';
      c.appendChild(logHdr);
      const noShifts = Utils.createEl('div', 'society-note', '✅ No governance or economic shifts recorded — stable system.');
      noShifts.style.cssText = 'font-size:0.85em;color:#888;margin:4px 0 8px 0;';
      c.appendChild(noShifts);
    }

    // ── SECTION 2: Disenfranchised Empathy vs Prosocial Gap ───────────────
    _sec('Bottom Stratum: Empathy vs. Practical Prosocial Behavior');
    const gapSec = Utils.createEl('div', 'empathy-gap-section');
    const gapHdr = Utils.createEl('div', 'empathy-gap-header');
    gapHdr.textContent = 'The Prosocial Gap — Empathy present but structurally constrained';
    gapSec.appendChild(gapHdr);

    const disEmpathy  = Math.round(s.empathyByStratum?.disenfranchised ?? 80);
    const disProsocial= Math.round(s.prosocialByStratum?.disenfranchised ?? 55);
    [
      { label:'Empathy Capacity', val:disEmpathy,   cls:'capacity' },
      { label:'Prosocial Behavior',val:disProsocial, cls:'prosocial' },
    ].forEach(({ label, val, cls }) => {
      const row = Utils.createEl('div', 'empathy-gap-bar-row');
      const lbl = Utils.createEl('span', 'empathy-gap-lbl'); lbl.textContent = `${label}: ${val}`;
      const outer = Utils.createEl('div', 'empathy-gap-outer');
      const fill  = Utils.createEl('div', `empathy-gap-fill ${cls}`);
      fill.style.width = `${val}%`;
      outer.appendChild(fill);
      row.appendChild(lbl); row.appendChild(outer); gapSec.appendChild(row);
    });

    const gapInd = Utils.createEl('div', 'empathy-gap-indicator');
    gapInd.textContent = `Gap: ${disEmpathy - disProsocial} pts — structural barriers to mutual aid (not a deficit of care)`;
    gapSec.appendChild(gapInd);

    // Sub-metrics — displayed as standard stat bars for clarity
    const subMetrics = [
      { label:'Resource Slack', val:Math.round((s.averageWellbeing ?? 50)), help:'How far above survival floor?', good:true },
      { label:'Opportunity Competition', val:Math.round(s.opportunityCompetition ?? 50), help:'How zero-sum is upward mobility? (higher = worse)', good:false },
      { label:'Social Stability', val:Math.round(s.stabilityIndex ?? 50), help:'Can reciprocal relationships be maintained?', good:true },
    ];
    subMetrics.forEach(({ label, val, help, good }) => {
      const color = good
        ? (val >= 60 ? 'bar-green' : val >= 40 ? 'bar-amber' : 'bar-red')
        : (val <= 40 ? 'bar-green' : val <= 60 ? 'bar-amber' : 'bar-red');
      gapSec.appendChild(this._bar(label, val, 100, color, help));
    });

    const explainP = Utils.createEl('p', 'society-help-text');
    explainP.textContent = 'The disenfranchised retain empathy that power has not suppressed — but survival creates a mixed incentive between mutual aid and zero-sum competition. When opportunities are narrow and resources scarce, helping a peer can mean losing to them. This gap reflects structural constraint, not a deficit of care.';
    gapSec.appendChild(explainP);
    c.appendChild(gapSec);

    // ── SECTION 3: Quadrant Chart ─────────────────────────────────────────
    _sec('Empathy × Behavioral Reinforcement');
    const quadSubHdr = Utils.createEl('p', 'society-help-text');
    quadSubHdr.textContent = `PBI (Prosocial Behavioral Index): ${Math.round(s.prosocialBehavioralIndex ?? 50)} / 100`;
    c.appendChild(quadSubHdr);

    const quadWrap = Utils.createEl('div', 'empathy-quadrant-wrap');
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 300;
    quadWrap.appendChild(canvas);
    c.appendChild(quadWrap);

    // Draw quadrant chart
    requestAnimationFrame(() => { this._drawQuadrantChart(canvas, s); });

    // Narrative text
    const narrative = (typeof civ._simulation !== 'undefined' && civ._simulation?._generateEmpathyNarrative)
      ? civ._simulation._generateEmpathyNarrative(civ)
      : this._generateEmpathyNarrativeLocal(civ);
    if (narrative) {
      const narEl = Utils.createEl('div', 'empathy-narrative');
      narEl.textContent = narrative;
      c.appendChild(narEl);
    }

    // ── SECTION 4: Cultural Norm Trend ────────────────────────────────────
    _sec('Cultural Empathy Norm Over Time');
    const normHelp = Utils.createEl('p', 'society-help-text');
    normHelp.textContent = `Current norm: ${Math.round(s.culturalEmpathyNorm ?? 65)} — changes 2–3× slower than actual behavior. After a paradigm shift, the norm lags significantly.`;
    c.appendChild(normHelp);

    const history = s.empathyHistory ?? [];
    if (history.length >= 2 && typeof ChartUtils !== 'undefined') {
      const chartWrap = Utils.createEl('div', 'empathy-norm-chart-wrap');
      const chartCanvas = document.createElement('canvas');
      chartCanvas.width = 500; chartCanvas.height = 220;
      chartWrap.appendChild(chartCanvas);
      c.appendChild(chartWrap);
      const series = [
        { label:'Cultural Norm',      color:'#e5e7eb', points: history.map(h => ({ x: h.turn, y: h.norm ?? 0 })) },
        { label:'Elite Empathy',      color:'#fbbf24', points: history.map(h => ({ x: h.turn, y: h.elite ?? 0 })) },
        { label:'Disfranchised Pros.',color:'#60a5fa', points: history.map(h => ({ x: h.turn, y: h.prosocialDisfranch ?? 0 })) },
        { label:'PBI',                color:'#4ade80', points: history.map(h => ({ x: h.turn, y: h.PBI ?? 0 })) },
      ];
      requestAnimationFrame(() => { ChartUtils.drawLineChart(chartCanvas, series, { minY:0, maxY:100, showLegend:true, xLabel:'Turn', yLabel:'Score' }); });
      if ((s.culturalEmpathyNorm ?? 65) < 40) {
        const ann = Utils.createEl('div', 'empathy-norm-annotation');
        ann.textContent = '⚠️ Low-empathy culture entrenched — structural changes would require extended time to produce norm realignment.';
        c.appendChild(ann);
      }
    } else if (history.length < 2) {
      const noData = Utils.createEl('p', 'society-help-text'); noData.textContent = 'Trend data will appear after a few turns.';
      c.appendChild(noData);
    }

    // ── SECTION 5: Paradigm Shift Projection ─────────────────────────────
    const govShiftAge  = s._govShiftAge  ?? 0;
    const econShiftAge = s._econShiftAge ?? 0;
    if (govShiftAge > 0 || econShiftAge > 0) {
      _sec('Active Paradigm Shift — Transition Analysis');

      const PHASES = ['Disruption (1–5t)','BR Adaptation (5–20t)','Empathy Lag (15–40t)','Norm Shift (30–70t)','Equilibrium (50t+)'];

      // Gov sub-panel
      if (govShiftAge > 0 && govShiftAge <= 60) {
        const govSub = Utils.createEl('div', 'paradigm-shift-section');
        const govSH = Utils.createEl('div', 'paradigm-shift-header');
        const govFromId = s._govShiftBaseline?.govModelFrom ?? '?';
        const govToId   = s._govShiftBaseline?.govModelTo   ?? '?';
        const govFromLabel = (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[govFromId]?.label) || govFromId;
        const govToLabel   = (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[govToId]?.label)   || govToId;
        govSH.textContent = `🏛️ Governance Shift: ${govFromLabel} → ${govToLabel} | ${govShiftAge} turns elapsed`;
        govSub.appendChild(govSH);
        const dirBadge = Utils.createEl('span', `paradigm-dir-badge ${s._govShiftDirection === 'flattening' ? 'flat' : 'steep'}`);
        dirBadge.textContent = s._govShiftDirection === 'flattening' ? '↓ Flattening hierarchy' : '↑ Steepening hierarchy';
        govSub.appendChild(dirBadge);
        // Timeline
        const tl = Utils.createEl('div', 'paradigm-timeline-bar');
        const phaseIdx = govShiftAge <= 5 ? 0 : govShiftAge <= 20 ? 1 : govShiftAge <= 40 ? 2 : govShiftAge <= 70 ? 3 : 4;
        const phaseColors = ['#7c3aed','#4338ca','#1d4ed8','#0369a1','#047857'];
        PHASES.forEach((ph, i) => {
          const seg = Utils.createEl('div', 'paradigm-phase' + (i === phaseIdx ? ' active' : ''));
          seg.textContent = ph; seg.style.background = phaseColors[i] + (i === phaseIdx ? '' : '88');
          tl.appendChild(seg);
        });
        govSub.appendChild(tl);
        // Projection note
        const projNote = Utils.createEl('p', 'society-help-text');
        const baseline = s._govShiftBaseline?.empathyByStratum?.elite ?? 50;
        const curElite = Math.round(s.empathyByStratum?.elite ?? 50);
        projNote.textContent = `Elite empathy at shift: ${Math.round(baseline)} → now: ${curElite}. Cohort resistance: ${Math.round(s.hierarchyEntrenched ?? 0)}% (slows recovery).`;
        govSub.appendChild(projNote);
        c.appendChild(govSub);
      }

      // Econ sub-panel
      if (econShiftAge > 0 && econShiftAge <= 60) {
        const econSub = Utils.createEl('div', 'paradigm-shift-section');
        const econSH = Utils.createEl('div', 'paradigm-shift-header');
        const econFromId = s._econShiftBaseline?.econModelFrom ?? '?';
        const econToId   = s._econShiftBaseline?.econModelTo   ?? '?';
        const econFromLabel = (typeof ECONOMIC_MODELS !== 'undefined' && ECONOMIC_MODELS[econFromId]?.label) || econFromId;
        const econToLabel   = (typeof ECONOMIC_MODELS !== 'undefined' && ECONOMIC_MODELS[econToId]?.label)   || econToId;
        econSH.textContent = `💰 Economic Shift: ${econFromLabel} → ${econToLabel} | ${econShiftAge} turns elapsed`;
        econSub.appendChild(econSH);
        const econDirBadge = Utils.createEl('span', `paradigm-dir-badge ${s._econShiftDirection === 'cooperative' ? 'flat' : 'steep'}`);
        econDirBadge.textContent = s._econShiftDirection === 'cooperative' ? '→ More Cooperative Economy' : '→ More Competitive Economy';
        econSub.appendChild(econDirBadge);
        const econTL = Utils.createEl('div', 'paradigm-timeline-bar');
        const econPhaseIdx = econShiftAge <= 3 ? 0 : econShiftAge <= 15 ? 1 : econShiftAge <= 30 ? 2 : econShiftAge <= 50 ? 3 : 4;
        const econPhaseNames = ['Signal (1–3t)','Fast Adapt (3–15t)','Slow Adapt (10–30t)','BR Consolidate (25–50t)','PBI Realign (30–60t)'];
        const phaseColors2 = ['#7c3aed','#4338ca','#1d4ed8','#0369a1','#047857'];
        econPhaseNames.forEach((ph, i) => {
          const seg = Utils.createEl('div', 'paradigm-phase' + (i === econPhaseIdx ? ' active' : ''));
          seg.textContent = ph; seg.style.background = phaseColors2[i] + (i === econPhaseIdx ? '' : '88');
          econTL.appendChild(seg);
        });
        econSub.appendChild(econTL);
        const baselineBR = s._econShiftBaseline?.brCoopScore ?? 50;
        const econNote = Utils.createEl('p', 'society-help-text');
        econNote.textContent = `BR Cooperation Score at shift: ${Math.round(baselineBR)} → now: ${Math.round(s.brCoopScore ?? 50)}. Economic shifts move both behavioral reinforcement (Y) AND empathy cascade via wealth-power (X).`;
        econSub.appendChild(econNote);
        c.appendChild(econSub);
      }

      // Combined interaction sub-panel
      const combinedSub = Utils.createEl('div', 'paradigm-shift-section');
      const combinedHdr = Utils.createEl('div', 'paradigm-shift-header');
      combinedHdr.textContent = '⚡ Combined Effect';
      combinedSub.appendChild(combinedHdr);

      const govDir  = s._govShiftDirection;
      const econDir = s._econShiftDirection;
      let interactionClass = '', interactionLabel = '', interactionDesc = '', optSuggestions = [];

      if (govDir === 'flattening' && econDir === 'cooperative') {
        interactionClass = 'interaction-reinforcing'; interactionLabel = '🟢 Reinforcing';
        interactionDesc = 'Both axes moving cooperatively — strongest PBI gains. Alignment bonus amplified.';
        optSuggestions = ['Focus on mutual aid infrastructure for lower strata to translate recovering empathy into visible prosocial outcomes.','Coordinate timing of downstream policy changes to ride the alignment window.'];
      } else if (govDir === 'flattening' && econDir === 'competitive') {
        interactionClass = 'interaction-conflicted'; interactionLabel = '🟡 Partial / Conflicted';
        interactionDesc = 'Empathy recovering but behavioral reinforcement still competitive — Y axis stalls.';
        optSuggestions = ['Economic reform is now the highest-leverage remaining action — governance has done its work.','Competitive economic reinforcement is suppressing expression of the empathy that hierarchy flattening has released.'];
      } else if (govDir === 'steepening' && econDir === 'cooperative') {
        interactionClass = 'interaction-conflicted'; interactionLabel = '🟡 Partial / Conflicted';
        interactionDesc = 'Cooperative economic reinforcement improving but hierarchy steepening suppresses empathy recovery.';
        optSuggestions = ['Governance hierarchy increase is offsetting economic cooperation gains.','Consider slowing hierarchy steepening, or accept a lower PBI equilibrium.'];
      } else if (govDir === 'steepening' && econDir === 'competitive') {
        interactionClass = 'interaction-compounding'; interactionLabel = '🔴 Compounding';
        interactionDesc = 'Both axes degrading — PBI falls faster than either shift alone would produce.';
        optSuggestions = ['Immediate stabilization priority.','Identify which shift can be reversed or slowed first.'];
      } else if (govDir === 'flattening' && !econDir) {
        interactionClass = 'interaction-reinforcing'; interactionLabel = '↓ Governance only';
        interactionDesc = 'Empathy recovering via hierarchy flattening. Economic model unchanged.';
        optSuggestions = ['An economic shift toward cooperative models now would amplify empathy gains via behavioral reinforcement alignment.'];
      } else if (econDir === 'cooperative' && !govDir) {
        interactionClass = 'interaction-reinforcing'; interactionLabel = '→ Economic only';
        interactionDesc = 'Behavioral reinforcement improving. If wealth-power was dominant, empathy cascade also improving.';
        optSuggestions = [plutocratic ? 'Wealth-power was dominant — this economic shift is also recovering empathy on the X axis.' : 'Governance hierarchy unchanged — consider pairing with governance reform for full alignment.'];
      } else {
        interactionClass = ''; interactionLabel = 'Active shift'; interactionDesc = 'Tracking shift trajectory.';
      }

      const badge = Utils.createEl('span', `paradigm-dir-badge ${interactionClass}`);
      badge.textContent = interactionLabel;
      combinedSub.appendChild(badge);
      const descP = Utils.createEl('p', 'society-help-text'); descP.textContent = interactionDesc;
      combinedSub.appendChild(descP);
      if (optSuggestions.length > 0) {
        const optWrap = Utils.createEl('div', 'paradigm-optimizations');
        optSuggestions.forEach(sug => {
          const item = Utils.createEl('div', 'paradigm-opt-item'); item.textContent = '→ ' + sug;
          optWrap.appendChild(item);
        });
        combinedSub.appendChild(optWrap);
      }
      c.appendChild(combinedSub);
    }

    // ── SECTION 6: Anomie & Social Cohesion ────────────────────────────
    _sec('Anomie & Social Cohesion');
    const anomieHelp = Utils.createEl('p', 'society-help-text');
    anomieHelp.textContent = 'Anomie measures the social dislocation caused by rapid change — paradigm shifts, energy transitions, automation, and ecological stress. High anomie erodes wellbeing, stability, and trust. Strong community networks and social mobility buffer against it.';
    c.appendChild(anomieHelp);

    const anomie = Math.round(s.anomieLevel ?? 0);
    const anomieColor = anomie > 70 ? 'bar-red' : anomie > 40 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Anomie Level', anomie, 100, anomieColor,
      anomie > 50 ? 'High anomie: despair spreading, stability eroding' : anomie > 30 ? 'Moderate anomie: social stress accumulating' : ''));

    // Anomie drivers list
    const anomieDrivers = [];
    const activeShifts = s.activeParadigmShifts ?? [];
    if (activeShifts.length > 0) anomieDrivers.push('Active paradigm shift: +0.08/turn');
    const autoLevel = s.automationLevel ?? 0;
    if (autoLevel >= 3) anomieDrivers.push(`Automation level ${autoLevel}: +${(0.02 * (autoLevel - 2)).toFixed(2)}/turn`);
    const wcAnom = civ.economic?.wealthConcentration ?? 30;
    const mobAnom = s.socialMobility ?? 50;
    if (wcAnom > 60 && mobAnom < 40) anomieDrivers.push('High inequality + low mobility: +0.03/turn');
    const trustAnom = s.socialTrust ?? 50;
    if (trustAnom < 30) anomieDrivers.push('Low social trust: +0.02/turn');
    if (trustAnom > 60) anomieDrivers.push('Community trust: -0.01/turn');
    if (mobAnom > 60) anomieDrivers.push('High social mobility: -0.005/turn');
    const wbAnom = s.averageWellbeing ?? 50;
    if (wbAnom < 35) anomieDrivers.push('Low wellbeing: +0.02/turn');
    const infraAnom = s.infrastructureLevel ?? 35;
    if (infraAnom < 20) anomieDrivers.push('Infrastructure collapse: +0.02/turn');
    const overAnom = s.overshootRatio ?? 0.5;
    if (overAnom > 1.2) anomieDrivers.push('Ecological overshoot: +0.03/turn');
    const famStruct = s.familyStructure;
    if (famStruct === 'extended' || famStruct === 'community_clan') anomieDrivers.push('Strong family networks: -0.01/turn');
    anomieDrivers.push('Natural recovery: -0.02/turn');

    if (anomieDrivers.length > 0) {
      const driverList = Utils.createEl('div', 'society-effects-list');
      anomieDrivers.forEach(d => driverList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(driverList);
    }

    // Anomie alerts
    if (anomie > 70) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        'Severe anomie: deaths of despair, social fragmentation, and population decline pressure active.'));
    } else if (anomie > 50) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        'High anomie: lower stratum tension rising, social trust eroding.'));
    }

    // Community Resilience button
    const resilRow = Utils.createEl('div', 'society-btn-row');
    const resilBtn = Utils.createEl('button', 'btn btn-secondary',
      'Community Resilience Program (-10 Anomie)');
    resilBtn.onclick = () => this._applyEvent('community_resilience');
    resilRow.appendChild(resilBtn);
    c.appendChild(resilRow);

    // ── SECTION 7: Collective Trauma ───────────────────────────────────
    _sec('Collective Trauma');
    const traumaHelp = Utils.createEl('p', 'society-help-text');
    traumaHelp.textContent = 'Intergenerational trauma from catastrophic events: war, famine, genocide, slavery, ecological collapse. Decays extremely slowly (~500-year half-life). High trauma limits social trust growth, suppresses innovation through risk aversion, and creates anomie floors. Evidence: Holodomor effects persist 3+ generations.';
    c.appendChild(traumaHelp);

    const trauma = Math.round(s.collectiveTrauma ?? 0);
    const traumaColor = trauma > 40 ? 'bar-red' : trauma > 10 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Collective Trauma', trauma, 100, traumaColor,
      trauma > 60 ? 'Severe intergenerational trauma — institutional distrust, innovation suppression' :
      trauma > 40 ? 'Significant trauma — risk aversion affecting innovation' :
      trauma > 20 ? 'Moderate trauma — trust growth ceiling reduced' : ''));

    // Trauma sources
    const traumaSources = [];
    if ((s.atWar ?? false) || (s.warTurns ?? 0) > 0) traumaSources.push('Active war: +0.5/turn');
    if (civ.slavery?.active) {
      const prev = civ.slavery.prevalence ?? 0;
      traumaSources.push(`Active slavery (prevalence ${Math.round(prev)}): +${(0.5 * prev / 100).toFixed(2)}/turn`);
    }
    if (civ._colonizationType === 'enslavement') traumaSources.push('Colonial enslavement: +0.8/turn');
    if ((s.overshootTurns ?? 0) > 20) traumaSources.push('Ecological collapse: +10 (one-time)');
    if ((s.socialTrust ?? 50) > 60) traumaSources.push('High social trust: -0.005/turn (healing)');
    if ((s.institutionalQuality ?? 50) > 60 && (s.stateCapacity ?? 50) > 50) traumaSources.push('Strong institutions: -0.003/turn (healing)');
    traumaSources.push(`Natural decay: -${(trauma * 0.001).toFixed(3)}/turn`);
    if (traumaSources.length > 0) {
      const traumaDrvList = Utils.createEl('div', 'society-effects-list');
      traumaSources.forEach(d => traumaDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(traumaDrvList);
    }

    // Trauma effects
    if (trauma > 20) {
      const trustCeiling = Math.round(100 - trauma / 5);
      c.appendChild(Utils.createEl('div', 'society-alert',
        `Trust ceiling: ${trustCeiling} (trauma limits how high social trust can grow)`));
    }
    if (trauma > 80) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        'Generational despair: anomie cannot drop below 20 while trauma remains this high.'));
    }

    // Truth & Reconciliation button
    const traumaRow = Utils.createEl('div', 'society-btn-row');
    const traumaBtn = Utils.createEl('button', 'btn btn-secondary',
      'Truth & Reconciliation Commission (-8 Trauma)');
    traumaBtn.onclick = () => this._applyEvent('truth_reconciliation');
    traumaRow.appendChild(traumaBtn);
    c.appendChild(traumaRow);

    // ── SECTION 7b: Ethnic/Linguistic Fractionalization ──────────────────
    _sec('Ethnic/Linguistic Fractionalization');
    const fracHelp = Utils.createEl('p', 'society-help-text');
    fracHelp.textContent = 'Structural diversity of ethnic and linguistic groups. Per Wimmer, diversity itself does not cause conflict — political EXCLUSION of groups does. High fractionalization with high inclusion can be stable (Switzerland model); with low inclusion, it drives conflict, low trust, and weak state capacity.';
    c.appendChild(fracHelp);

    const frac = Math.round(s.ethnicFractionalization ?? 35);
    const incl = Math.round(s.politicalInclusion ?? 50);
    const excRisk = Math.round(s._exclusionRisk ?? 0);

    c.appendChild(this._bar('Fractionalization', frac, 100, '',
      frac > 70 ? 'Highly diverse society' : frac < 15 ? 'Ethnically homogeneous' : ''));
    const inclColor = incl > 60 ? 'bar-green' : incl > 35 ? 'bar-amber' : 'bar-red';
    c.appendChild(this._bar('Political Inclusion', incl, 100, inclColor,
      incl < 30 ? 'Severe exclusion: ethnic conflict risk high' :
      incl > 75 ? 'Inclusive polity: diversity is a strength' : ''));
    const excColor = excRisk > 50 ? 'bar-red' : excRisk > 25 ? 'bar-amber' : 'bar-green';
    c.appendChild(this._bar('Exclusion Risk', excRisk, 100, excColor));

    if (excRisk > 50) {
      c.appendChild(Utils.createEl('div', 'society-alert',
        `High exclusion risk (${excRisk}): ethnic conflict probability elevated. Trust, stability, and state capacity all under pressure. Collective trauma accumulating.`));
    }
    if (frac > 40 && incl > 70) {
      c.appendChild(Utils.createEl('div', 'society-stat-note',
        'Diverse and inclusive: cultural richness boosting innovation (+0.005/turn)'));
    }

    // Fractionalization drivers
    const fracDrivers = [];
    const govIdFrac = civ.governance?.modelId ?? '';
    if (['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govIdFrac)) {
      fracDrivers.push('Democratic governance: inclusion +0.01/turn');
    }
    if (['autocratic', 'theocratic', 'oligarchy'].includes(govIdFrac)) {
      fracDrivers.push('Authoritarian governance: inclusion -0.008/turn');
    }
    if ((s.educationQuality ?? 50) > 60) fracDrivers.push('Education > 60: tolerance increasing');
    if ((s.stabilityIndex ?? 70) < 30) fracDrivers.push('Low stability: scapegoating minorities, inclusion -0.02/turn');
    if ((s.socialTrust ?? 50) > 60) fracDrivers.push('High trust: more inclusive attitudes');
    if (excRisk > 30) fracDrivers.push(`Exclusion risk ${excRisk}: trust eroding`);
    if (excRisk > 40) fracDrivers.push('Exclusion > 40: state capacity weakened, anomie rising');
    if (excRisk > 60) fracDrivers.push('Exclusion > 60: collective trauma accumulating from persecution');
    if (fracDrivers.length > 0) {
      const fracDrvList = Utils.createEl('div', 'society-effects-list');
      fracDrivers.forEach(d => fracDrvList.appendChild(Utils.createEl('div', 'society-effect-item', d)));
      c.appendChild(fracDrvList);
    }

    // Inclusion reform button
    const inclRow = Utils.createEl('div', 'society-btn-row');
    const inclBtn = Utils.createEl('button', 'btn btn-secondary',
      'Political Inclusion Reform (+12 Inclusion)');
    inclBtn.title = 'Expand political rights and representation for marginalized groups. May face backlash from dominant groups.';
    inclBtn.onclick = () => this._applyEvent('inclusion_reform');
    inclRow.appendChild(inclBtn);
    c.appendChild(inclRow);

    // ── SECTION 8: Susceptibility Distribution ────────────────────────────
    _sec('Population Susceptibility to Power Effects');
    const susNote = Utils.createEl('p', 'society-help-text');
    susNote.textContent = 'Set at civilization initialization. Determined by genetics, neurobiology, and early-life experience — NOT responsive to policy changes within the simulation.';
    c.appendChild(susNote);

    const susModel = (typeof SUSCEPTIBILITY_MODELS !== 'undefined')
      ? SUSCEPTIBILITY_MODELS.find(m => m.id === (s.susceptibilityModel ?? 'moderate_variation')) : null;
    if (susModel) {
      const susDisp = Utils.createEl('div', 'susceptibility-display');
      const susName = Utils.createEl('div', 'susceptibility-model-name');
      susName.textContent = `${susModel.icon} ${susModel.label}`;
      const susSigma = Utils.createEl('div', 'susceptibility-sigma');
      susSigma.textContent = `σ = ${susModel.sigma} (log-normal)`;
      susDisp.appendChild(susName); susDisp.appendChild(susSigma);
      const tailStats = Utils.createEl('div', 'susceptibility-tail-stats');
      [
        { pct: `~${Math.round(susModel.abusiveTailFraction * 100)}%`, desc:'become overtly abusive at moderate power levels' },
        { pct: `~${Math.round(susModel.empatheticRetentionFraction * 100)}%`, desc:'retain strong empathy even at the top of a steep hierarchy' },
      ].forEach(({ pct, desc }) => {
        const item = Utils.createEl('div', 'susceptibility-tail-item');
        const pctEl = Utils.createEl('div', 'susceptibility-tail-pct'); pctEl.textContent = pct;
        const descEl = Utils.createEl('div', 'susceptibility-tail-desc'); descEl.textContent = desc;
        item.appendChild(pctEl); item.appendChild(descEl); tailStats.appendChild(item);
      });
      susDisp.appendChild(tailStats);
      const fixedNote = Utils.createEl('div', 'susceptibility-fixed-note');
      fixedNote.textContent = susModel.description;
      susDisp.appendChild(fixedNote);
      c.appendChild(susDisp);
    }
  }

  _drawQuadrantChart(canvas, s) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const pad = { t:20, r:20, b:40, l:50 };
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    const toX = v => pad.l + (v / 100) * cw;
    const toY = v => pad.t + ((100 - v) / 100) * ch;
    ctx.clearRect(0, 0, W, H);

    // Quadrant fills
    const qFills = [
      { x1:50, y1:50, x2:100, y2:100, color:'#14532d33', label:'Prosocial Realized' },
      { x1:0,  y1:50, x2:50,  y2:100, color:'#78350f33', label:'Compliance Cooperation' },
      { x1:50, y1:0,  x2:100, y2:50,  color:'#1e3a5f33', label:'Empathy Suppressed' },
      { x1:0,  y1:0,  x2:50,  y2:50,  color:'#7f1d1d33', label:'Extractive Dynamics' },
    ];
    qFills.forEach(({ x1, y1, x2, y2, color, label }) => {
      ctx.fillStyle = color;
      ctx.fillRect(toX(x1), toY(y2), toX(x2) - toX(x1), toY(y1) - toY(y2));
      ctx.fillStyle = '#ffffff33';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, toX((x1+x2)/2), toY((y1+y2)/2));
    });

    // Grid lines at 50/50
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(toX(50), pad.t); ctx.lineTo(toX(50), H - pad.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, toY(50)); ctx.lineTo(W - pad.r, toY(50)); ctx.stroke();
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = '#9ca3af'; ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empathy Capacity \u2192', pad.l + cw / 2, H - 5);
    ctx.save(); ctx.translate(12, pad.t + ch / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('\u2191 Cooperative Reinforcement', 0, 0); ctx.restore();

    // Axis tick values
    ctx.fillStyle = '#6b7280'; ctx.font = '9px sans-serif';
    [0, 50, 100].forEach(v => {
      ctx.textAlign = 'center'; ctx.fillText(v, toX(v), H - pad.b + 12);
      ctx.textAlign = 'right';  ctx.fillText(v, pad.l - 4, toY(v) + 4);
    });

    // History trail (last 10 points)
    const history = s.empathyHistory ?? [];
    const trailLen = Math.min(10, history.length);
    if (trailLen >= 2) {
      ctx.strokeStyle = '#6b728066'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = history.length - trailLen; i < history.length; i++) {
        const h = history[i];
        const x = toX(h.elite !== undefined ? (h.elite * 0.05 + (h.upper_middle ?? 50) * 0.15 + (h.lower_middle ?? 50) * 0.25 + (h.working_class ?? 50) * 0.35 + (h.disenfranchised ?? 80) * 0.20) : 50);
        const y = toY(h.brCoopScore ?? 50);
        if (i === history.length - trailLen) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Current position dot
    const empathyAgg = s.empathyLevel ?? 50;
    const brCoop     = s.brCoopScore ?? 50;
    const PBI        = s.prosocialBehavioralIndex ?? 50;
    const dotColor   = PBI >= 70 ? '#4ade80' : PBI >= 50 ? '#60a5fa' : PBI >= 30 ? '#fbbf24' : '#f87171';
    ctx.fillStyle = dotColor;
    ctx.beginPath(); ctx.arc(toX(empathyAgg), toY(brCoop), 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    // Paradigm shift arrows
    const govShiftAge  = s._govShiftAge  ?? 0;
    const econShiftAge = s._econShiftAge ?? 0;
    const govShiftActive  = govShiftAge > 0 && govShiftAge <= 60;
    const econShiftActive = econShiftAge > 0 && econShiftAge <= 60;
    const drawArrow = (x1, y1, x2, y2, color, label) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(y2-y1, x2-x1);
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 10*Math.cos(angle-0.4), y2 - 10*Math.sin(angle-0.4));
      ctx.lineTo(x2 - 10*Math.cos(angle+0.4), y2 - 10*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, (x1+x2)/2, (y1+y2)/2 - 6);
    };
    const cx = toX(empathyAgg), cy = toY(brCoop);
    let projEmpathy = empathyAgg, projBR = brCoop;
    if (govShiftActive && (s._govShiftDirection === 'flattening')) {
      projEmpathy = Math.min(100, empathyAgg + 15);
      drawArrow(cx, cy, toX(projEmpathy), cy, '#fbbf24', 'Gov \u2192');
    } else if (govShiftActive) {
      projEmpathy = Math.max(0, empathyAgg - 15);
      drawArrow(cx, cy, toX(projEmpathy), cy, '#f87171', 'Gov \u2192');
    }
    if (econShiftActive && (s._econShiftDirection === 'cooperative')) {
      projBR = Math.min(100, brCoop + 15);
      drawArrow(toX(projEmpathy), toY(brCoop), toX(projEmpathy), toY(projBR), '#60a5fa', '\u2191 Econ');
    } else if (econShiftActive) {
      projBR = Math.max(0, brCoop - 15);
      drawArrow(toX(projEmpathy), toY(brCoop), toX(projEmpathy), toY(projBR), '#f87171', '\u2193 Econ');
    }
    if ((govShiftActive || econShiftActive) && (projEmpathy !== empathyAgg || projBR !== brCoop)) {
      drawArrow(cx, cy, toX(projEmpathy), toY(projBR), '#ffffff', 'Combined');
    }

    // PBI badge (top-right)
    ctx.fillStyle = '#1f2937cc';
    ctx.fillRect(W - pad.r - 52, pad.t, 50, 22);
    ctx.fillStyle = dotColor; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`PBI: ${Math.round(PBI)}`, W - pad.r - 27, pad.t + 15);
  }

  // ─────────────────────────────────────────────────────────────
  // EXPORT HELPERS (Pass 7)
  // ─────────────────────────────────────────────────────────────
  _exportCSV(rows, filename) {
    try {
      const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = (filename ?? 'export') + '.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { console.warn('[SocietyPanel._exportCSV]', err); }
  }

  _exportTXT(text, filename) {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = (filename ?? 'export') + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) { console.warn('[SocietyPanel._exportTXT]', err); }
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: EMPATHY & SUSCEPTIBILITY (Pass 7)
  // ═══════════════════════════════════════════════════════════
  _renderEmpathyCascade(c, civ) {
    const s   = civ.state;
    const sd  = s.susceptibilityDistribution ?? {};
    const lst = s.lowestStrataTension ?? {};
    const teb = s.theocraticEmpathyBias ?? {};
    const ebs = s.empathyByStratum ?? {};

    // ── Susceptibility Distribution ──────────────────────────
    c.appendChild(this._section('Susceptibility Distribution'));
    const helpText = Utils.createEl('p', 'society-help-text',
      `Model: ${sd.modelId ?? '—'}  |  Resistant: ${Math.round((sd.resistantFraction ?? 0.20) * 100)}%  |  α = ${(sd.alpha ?? 2).toFixed(2)}, β = ${(sd.beta ?? 2.5).toFixed(2)}`);
    c.appendChild(helpText);

    const STRATUM_COLORS = { elite:'#a855f7', upper_middle:'#3b82f6', lower_middle:'#22c55e', working_class:'#f59e0b', disenfranchised:'#ef4444' };
    const STRATUM_LABELS = { elite:'Elite', upper_middle:'Up-Mid', lower_middle:'Lo-Mid', working_class:'Working', disenfranchised:'Disenfr.' };
    const baseMean = (sd.alpha ?? 2) * (sd.beta ?? 2.5);
    const offsets  = sd.stratumOffset ?? {};
    const strataMeans = Object.keys(STRATUM_COLORS).map(k => ({
      label: STRATUM_LABELS[k],
      mean:  Math.max(0, baseMean + (offsets[k] ?? 0)),
      color: STRATUM_COLORS[k],
    }));

    const distWrap = Utils.createEl('div', 'society-canvas-wrap');
    const distCanvas = Utils.createEl('canvas', 'society-canvas');
    distCanvas.width = 560; distCanvas.height = 245;
    distWrap.appendChild(distCanvas);
    c.appendChild(distWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawDistributionCurve(distCanvas, {
        resistantFraction: sd.resistantFraction ?? 0.20,
        alpha: sd.alpha ?? 2.0,
        beta:  sd.beta  ?? 2.5,
        strataMeans,
      }, { xMax: 6, showStrata: true, showLegend: true });
    });

    const distExportRow = Utils.createEl('div', 'society-export-row');
    const distPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    distPng.onclick = () => ChartUtils.exportPNG(distCanvas, 'susceptibility-distribution');
    const distCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    distCsv.onclick = () => this._exportCSV([
      ['ModelId','ResistantFraction','Alpha','Beta','EliteOffset','UpperMidOffset','LowerMidOffset','WorkingOffset','DisenfOffset'],
      [sd.modelId??'', sd.resistantFraction??0.20, sd.alpha??2, sd.beta??2.5,
       offsets.elite??0, offsets.upper_middle??0, offsets.lower_middle??0, offsets.working_class??0, offsets.disenfranchised??0],
    ], 'susceptibility-distribution');
    distExportRow.appendChild(distPng);
    distExportRow.appendChild(distCsv);
    c.appendChild(distExportRow);

    if (sd._lastAlphaDrift !== undefined) {
      const driftNote = Utils.createEl('p', 'society-help-text',
        `Generational drift (last): α ${sd._lastAlphaDrift >= 0 ? '+' : ''}${(sd._lastAlphaDrift ?? 0).toFixed(3)}  β ${sd._lastBetaDrift >= 0 ? '+' : ''}${(sd._lastBetaDrift ?? 0).toFixed(3)}`);
      c.appendChild(driftNote);
    }

    // ── Cascade Flow ─────────────────────────────────────────
    c.appendChild(this._section('Empathy Cascade — Hierarchy'));
    const cascadeLevels = [
      { label: 'Elite',          empathy: Math.round(ebs.elite          ?? 45) },
      { label: 'Upper Middle',   empathy: Math.round(ebs.upper_middle   ?? 55) },
      { label: 'Lower Middle',   empathy: Math.round(ebs.lower_middle   ?? 60) },
      { label: 'Working Class',  empathy: Math.round(ebs.working_class  ?? 65) },
      { label: 'Disenfranchised', isDisenfranchised: true,
        cooperationPressure: Math.round(lst.cooperationPressure ?? 50),
        competitionPressure: Math.round(lst.competitionPressure ?? 50) },
    ];
    const cascadeWrap = Utils.createEl('div', 'society-canvas-wrap');
    const cascadeCanvas = Utils.createEl('canvas', 'society-canvas');
    cascadeCanvas.width = 560; cascadeCanvas.height = 240;
    cascadeWrap.appendChild(cascadeCanvas);
    c.appendChild(cascadeWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawCascadeFlow(cascadeCanvas, cascadeLevels, { title: 'Empathy Cascade' });
    });

    const tensionRow = Utils.createEl('div', 'society-stat-row');
    tensionRow.appendChild(this._bar('Cooperation Pressure', lst.cooperationPressure ?? 50, 100, 'bar-green'));
    tensionRow.appendChild(this._bar('Competition Pressure', lst.competitionPressure ?? 50, 100, 'bar-red'));
    c.appendChild(tensionRow);
    if (lst.survivalMode) {
      c.appendChild(Utils.createEl('div', 'society-alert-badge society-alert-red',
        '⚠ SURVIVAL MODE — disenfranchised social fabric destabilized by scarcity competition'));
    }

    const cascadeExportRow = Utils.createEl('div', 'society-export-row');
    const cascadePng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    cascadePng.onclick = () => ChartUtils.exportPNG(cascadeCanvas, 'empathy-cascade');
    const cascadeTxt = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 TXT');
    cascadeTxt.onclick = () => this._exportTXT(this._narrativeEmpathyCascade(s), 'empathy-cascade');
    cascadeExportRow.appendChild(cascadePng);
    cascadeExportRow.appendChild(cascadeTxt);
    c.appendChild(cascadeExportRow);

    // ── Theocratic Empathy Bias ──────────────────────────────
    if (teb.active) {
      c.appendChild(this._section('Theocratic Empathy Bias'));
      c.appendChild(Utils.createEl('p', 'society-help-text',
        'Governance is theocratic (or religion dominance > 70%). Empathy is elevated for in-group and suppressed for out-group.'));
      c.appendChild(this._bar('In-Group Empathy',  teb.inGroupEmpathy  ?? 0, 100, 'bar-green'));
      c.appendChild(this._bar('Out-Group Empathy', teb.outGroupEmpathy ?? 0, 100, 'bar-red'));
    }

    // ── Narrative ────────────────────────────────────────────
    c.appendChild(this._section('Analysis'));
    c.appendChild(Utils.createEl('p', 'society-narrative', this._narrativeEmpathyCascade(s)));
  }

  _narrativeEmpathyCascade(s) {
    const sd  = s.susceptibilityDistribution ?? {};
    const lst = s.lowestStrataTension ?? {};
    const teb = s.theocraticEmpathyBias ?? {};
    const ebs = s.empathyByStratum ?? {};
    const parts = [];
    const rf = Math.round((sd.resistantFraction ?? 0.20) * 100);
    parts.push(`Approximately ${rf}% of the population appears resistant to empathy suppression, with the remaining ${100 - rf}% following a right-skewed gamma distribution (α=${(sd.alpha ?? 2).toFixed(2)}, β=${(sd.beta ?? 2.5).toFixed(2)}).`);
    const eliteEmp = ebs.elite ?? 45;
    if      (eliteEmp < 40) parts.push('Elite empathy is severely suppressed — power-hierarchy dynamics reinforce extractive behavior downward through every stratum.');
    else if (eliteEmp < 60) parts.push('Elite empathy is moderate — cascade suppression is limited but present across lower strata.');
    else                    parts.push('Elite empathy is relatively high — cascade suppression effects are mild.');
    if (lst.survivalMode) parts.push('Survival mode is active among the disenfranchised — scarcity-driven competition is destabilizing collective action and mutual aid.');
    else if ((lst.competitionPressure ?? 50) > (lst.cooperationPressure ?? 50)) parts.push('Competition pressure dominates among the disenfranchised, undermining cooperative solidarity.');
    else parts.push('Cooperative pressure holds among the disenfranchised, supporting mutual aid networks.');
    if (teb.active) parts.push('Theocratic empathy bias creates a two-tier moral community: elevated in-group concern, suppressed out-group empathy.');
    return parts.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: EMPATHY × REINFORCEMENT INTERACTION (Pass 7)
  // ═══════════════════════════════════════════════════════════
  _renderInteraction(c, civ) {
    const s   = civ.state;
    const eri = s.empathyReinforcementInteraction ?? {};
    const history = (eri.history ?? []).map(h => ({
      turn:                  h.turn           ?? 0,
      empathyComponent:      h.empathy        ?? 50,
      reinforcementComponent:h.reinforcement  ?? 50,
      combinedScore:         h.combined       ?? 50,
    }));

    // Type badge
    const typeColors = { virtuous:'#22c55e', vicious:'#ef4444', conflicted:'#f59e0b', neutral:'#64748b' };
    const iType  = eri.interactionType ?? 'neutral';
    const iColor = typeColors[iType] ?? '#64748b';
    const typeBadge = Utils.createEl('div', 'society-badge');
    typeBadge.style.cssText = `padding:4px 10px;border-radius:4px;margin-bottom:8px;display:inline-block;background:${iColor};color:#fff;font-size:0.85em;`;
    typeBadge.textContent = `Interaction Type: ${iType.toUpperCase()}  |  Synergy: ${(eri.synergyBonus ?? 0) >= 0 ? '+' : ''}${(eri.synergyBonus ?? 0).toFixed(1)}  |  Combined Score: ${(eri.combinedScore ?? 50).toFixed(0)}`;
    c.appendChild(typeBadge);

    c.appendChild(this._bar('Empathy Component',       eri.empathyComponent      ?? 50, 100, this._colorForIndex(eri.empathyComponent ?? 50)));
    c.appendChild(this._bar('Reinforcement Component', eri.reinforcementComponent ?? 50, 100, this._colorForIndex(eri.reinforcementComponent ?? 50)));
    c.appendChild(this._bar('Combined Score',          eri.combinedScore         ?? 50, 100, this._colorForIndex(eri.combinedScore ?? 50)));

    // ── History chart ─────────────────────────────────────────
    c.appendChild(this._section('History'));
    const histWrap = Utils.createEl('div', 'society-canvas-wrap');
    const histCanvas = Utils.createEl('canvas', 'society-canvas');
    histCanvas.width = 560; histCanvas.height = 180;
    histWrap.appendChild(histCanvas);
    c.appendChild(histWrap);
    requestAnimationFrame(() => {
      if (history.length >= 2) {
        ChartUtils.drawDualAxisLine(histCanvas, history, { showCombined: true });
      } else {
        const ctx = histCanvas.getContext('2d');
        ctx.clearRect(0, 0, histCanvas.width, histCanvas.height);
        ctx.fillStyle = '#475569'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Accumulating history — run more turns', histCanvas.width / 2, histCanvas.height / 2);
      }
    });

    const histExportRow = Utils.createEl('div', 'society-export-row');
    const histPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    histPng.onclick = () => ChartUtils.exportPNG(histCanvas, 'interaction-history');
    const histCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    histCsv.onclick = () => this._exportCSV(
      [['Turn','Empathy','Reinforcement','Combined'],
       ...history.map(h => [h.turn, h.empathyComponent.toFixed(1), h.reinforcementComponent.toFixed(1), h.combinedScore.toFixed(1)])],
      'interaction-history'
    );
    histExportRow.appendChild(histPng);
    histExportRow.appendChild(histCsv);
    c.appendChild(histExportRow);

    // ── Per-stratum comparison ────────────────────────────────
    c.appendChild(this._section('Per-Stratum Breakdown'));
    const byS  = eri.byStratum ?? {};
    const sKeys = ['elite','upper_middle','lower_middle','working_class','disenfranchised'];
    const sCols = ['#a855f7','#3b82f6','#22c55e','#f59e0b','#ef4444'];
    const stratWrap = Utils.createEl('div', 'society-canvas-wrap');
    const stratCanvas = Utils.createEl('canvas', 'society-canvas');
    stratCanvas.width = 560; stratCanvas.height = 160;
    stratWrap.appendChild(stratCanvas);
    c.appendChild(stratWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawStratumComparison(stratCanvas, {
        primary:   sKeys.map((k, i) => ({ value: byS[k]?.empathy        ?? 50, color: sCols[i] })),
        secondary: sKeys.map((k, i) => ({ value: byS[k]?.reinforcement  ?? 50, color: sCols[i] })),
      }, { minY: 0, maxY: 100, yLabel: 'Score', primaryLabel: 'Empathy', secondaryLabel: 'Reinforcement' });
    });

    const stratExportRow = Utils.createEl('div', 'society-export-row');
    const stratPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    stratPng.onclick = () => ChartUtils.exportPNG(stratCanvas, 'interaction-by-stratum');
    const stratCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    stratCsv.onclick = () => this._exportCSV(
      [['Stratum','Empathy','Reinforcement','Combined','Type'],
       ...sKeys.map(k => { const d = byS[k] ?? {};
         return [k, (d.empathy??50).toFixed(1),(d.reinforcement??50).toFixed(1),(d.combined??50).toFixed(1),d.type??'neutral']; })],
      'interaction-by-stratum'
    );
    stratExportRow.appendChild(stratPng);
    stratExportRow.appendChild(stratCsv);
    c.appendChild(stratExportRow);

    // ── Narrative ────────────────────────────────────────────
    c.appendChild(this._section('Analysis'));
    c.appendChild(Utils.createEl('p', 'society-narrative', this._narrativeInteraction(s)));
    const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 TXT');
    txtBtn.onclick = () => this._exportTXT(this._narrativeInteraction(s), 'interaction-analysis');
    c.appendChild(txtBtn);
  }

  _narrativeInteraction(s) {
    const eri   = s.empathyReinforcementInteraction ?? {};
    const iType = eri.interactionType ?? 'neutral';
    const descMap = {
      virtuous:   'Empathy and cooperative reinforcement align and reinforce each other — prosocial behavior is self-sustaining. Synergy bonus improves wellbeing, stability, and reduces corruption.',
      vicious:    'Suppressed empathy and competitive reinforcement compound each other — a vicious cycle of extractive behavior and social erosion drags down wellbeing and stability.',
      conflicted: 'High empathy coexists with competitive reinforcement, creating tension: prosocial impulses are individually present but structurally discouraged. A fragile and unstable equilibrium.',
      neutral:    'Empathy and reinforcement are neither aligned nor in conflict — the system operates without strong compound effects in either direction.',
    };
    const parts = [descMap[iType] ?? descMap.neutral];
    if (Math.abs(eri.synergyBonus ?? 0) > 4) {
      parts.push(`Current synergy modifier: ${(eri.synergyBonus ?? 0) >= 0 ? '+' : ''}${(eri.synergyBonus ?? 0).toFixed(1)} applied to civilizational wellbeing and stability each turn.`);
    }
    return parts.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: CULTURAL GAP (Pass 7)
  // ═══════════════════════════════════════════════════════════
  _renderCulturalGap(c, civ) {
    const s   = civ.state;
    const cg  = s.culturalGap ?? {};
    const sv  = cg.statedValues     ?? { cooperation:65, empathy:62, fairness:60, civicDuty:58, honesty:62 };
    const rv  = cg.reinforcedValues ?? { cooperation:50, empathy:45, fairness:50, civicDuty:50, honesty:50 };
    const bs  = cg.byStratum ?? {};
    const history = cg.history ?? [];

    // Gap headline badge
    const g       = cg.gapScore ?? 0;
    const gColor  = g > 50 ? '#ef4444' : g > 25 ? '#f59e0b' : '#22c55e';
    const gBadge  = Utils.createEl('div', 'society-tier-badge');
    gBadge.style.cssText = `background:${gColor}22;border:1px solid ${gColor};color:${gColor};margin-bottom:8px;`;
    gBadge.textContent   = `Cultural Gap Score: ${g.toFixed(0)} / 100`;
    c.appendChild(gBadge);

    c.appendChild(this._bar('Gap Score',                  cg.gapScore               ?? 0, 100, this._colorForIndex(100 - (cg.gapScore ?? 0), 40, 70)));
    c.appendChild(this._bar('Cognitive Dissonance',       cg.cognitiveDissonanceLevel ?? 0, 100, this._colorForIndex(100 - (cg.cognitiveDissonanceLevel ?? 0), 40, 70)));
    c.appendChild(this._bar('Cynicism Level',             cg.cynicismLevel           ?? 0, 100, this._colorForIndex(100 - (cg.cynicismLevel ?? 0), 40, 70)));
    c.appendChild(this._bar('Revolutionary Consciousness',cg.revolutionaryConsciousness ?? 0, 100, this._colorForIndex(cg.revolutionaryConsciousness ?? 0, 30, 60)));
    c.appendChild(this._bar('Shift Readiness',            cg.paradigmShiftReadiness  ?? 0, 100, this._colorForIndex(cg.paradigmShiftReadiness ?? 0, 30, 60)));

    // ── Stated vs. Reinforced Values chart ───────────────────
    c.appendChild(this._section('Stated vs. Reinforced Values'));
    const valueKeys   = ['cooperation','empathy','fairness','civicDuty','honesty'];
    const valueColors = ['#38bdf8','#a78bfa','#22c55e','#f59e0b','#fb7185'];
    const valWrap = Utils.createEl('div', 'society-canvas-wrap');
    const valCanvas = Utils.createEl('canvas', 'society-canvas');
    valCanvas.width = 560; valCanvas.height = 200;
    valWrap.appendChild(valCanvas);
    c.appendChild(valWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawStratumComparison(valCanvas, {
        primary:   valueKeys.map((k, i) => ({ value: sv[k] ?? 60, color: valueColors[i] })),
        secondary: valueKeys.map((k, i) => ({ value: rv[k] ?? 50, color: valueColors[i] })),
      }, { minY: 0, maxY: 100, yLabel: 'Score', primaryLabel: 'Stated (taught)', secondaryLabel: 'Reinforced (rewarded)', padBottom: 70 });
      // Erase default stratum labels area and write value names instead
      const ctx2 = valCanvas.getContext('2d');
      const padL = 44, padR = 16, plotH = valCanvas.height - 10 - 70;
      const labelY = 10 + plotH + 16; // where default stratum labels were drawn
      ctx2.fillStyle = '#0f172a'; // match dark background
      ctx2.fillRect(padL - 5, labelY - 6, valCanvas.width - padL - padR + 10, 14);
      const pw = valCanvas.width - padL - padR, nV = valueKeys.length;
      const shortNames = ['Coop','Empathy','Fairness','CivDuty','Honesty'];
      shortNames.forEach((lbl, i) => {
        const cx = padL + (i * pw / nV) + pw / nV / 2;
        ctx2.fillStyle = valueColors[i]; ctx2.font = 'bold 12px sans-serif'; ctx2.textAlign = 'center';
        ctx2.fillText(lbl, cx, labelY + 2);
      });
    });

    const valExportRow = Utils.createEl('div', 'society-export-row');
    const valPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    valPng.onclick = () => ChartUtils.exportPNG(valCanvas, 'cultural-gap-values');
    const valCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    valCsv.onclick = () => this._exportCSV(
      [['Value','Stated','Reinforced','Gap'],
       ...valueKeys.map(k => [k, (sv[k]??60).toFixed(1),(rv[k]??50).toFixed(1),((sv[k]??60)-(rv[k]??50)).toFixed(1)])],
      'cultural-gap-values'
    );
    valExportRow.appendChild(valPng);
    valExportRow.appendChild(valCsv);
    c.appendChild(valExportRow);

    // ── Per-stratum gap perception ────────────────────────────
    c.appendChild(this._section('Per-Stratum Gap Perception'));
    const sKeys = ['elite','upper_middle','lower_middle','working_class','disenfranchised'];
    const sCols = ['#a855f7','#3b82f6','#22c55e','#f59e0b','#ef4444'];
    const percWrap = Utils.createEl('div', 'society-canvas-wrap');
    const percCanvas = Utils.createEl('canvas', 'society-canvas');
    percCanvas.width = 560; percCanvas.height = 155;
    percWrap.appendChild(percCanvas);
    c.appendChild(percWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawStratumComparison(percCanvas, {
        primary:   sKeys.map((k, i) => ({ value: bs[k]?.gapPerception    ?? 0, color: sCols[i] })),
        secondary: sKeys.map((k, i) => ({ value: bs[k]?.psychologicalCost ?? 0, color: sCols[i] })),
      }, { title: 'Gap Perception (solid) vs. Psychological Cost (dashed)', minY: 0, maxY: 100, yLabel: 'Score',
           primaryLabel: 'Gap Perception', secondaryLabel: 'Psych. Cost' });
    });

    const percExportRow = Utils.createEl('div', 'society-export-row');
    const percPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    percPng.onclick = () => ChartUtils.exportPNG(percCanvas, 'cultural-gap-by-stratum');
    const percCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    percCsv.onclick = () => this._exportCSV(
      [['Stratum','GapPerception','BenefitFromGap','PsychCost'],
       ...sKeys.map(k => { const d = bs[k] ?? {};
         return [k,(d.gapPerception??0).toFixed(1),d.benefitFromGap?'yes':'no',(d.psychologicalCost??0).toFixed(1)]; })],
      'cultural-gap-by-stratum'
    );
    percExportRow.appendChild(percPng);
    percExportRow.appendChild(percCsv);
    c.appendChild(percExportRow);

    // ── History line chart ────────────────────────────────────
    if (history.length >= 2) {
      c.appendChild(this._section('Cultural Gap History'));
      const cgHistWrap = Utils.createEl('div', 'society-canvas-wrap');
      const cgHistCanvas = Utils.createEl('canvas', 'society-canvas');
      cgHistCanvas.width = 560; cgHistCanvas.height = 160;
      cgHistWrap.appendChild(cgHistCanvas);
      c.appendChild(cgHistWrap);
      requestAnimationFrame(() => {
        ChartUtils.drawLineChart(cgHistCanvas, [
          { label: 'Gap Score',    color: '#f59e0b', points: history.map(h => ({ x: h.turn, y: h.gapScore    ?? 0 })) },
          { label: 'Cynicism',     color: '#ef4444', points: history.map(h => ({ x: h.turn, y: h.cynicism    ?? 0 })) },
          { label: 'Shift Ready',  color: '#22c55e', points: history.map(h => ({ x: h.turn, y: h.readiness   ?? 0 })) },
        ], { minY: 0, maxY: 100, showLegend: true, xLabel: 'Turn', yLabel: 'Score' });
      });
      const cgHistExportRow = Utils.createEl('div', 'society-export-row');
      const cgHistPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
      cgHistPng.onclick = () => ChartUtils.exportPNG(cgHistCanvas, 'cultural-gap-history');
      const cgHistCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      cgHistCsv.onclick = () => this._exportCSV(
        [['Turn','GapScore','Dissonance','Cynicism','RevConsciousness','Readiness'],
         ...history.map(h => [h.turn,(h.gapScore??0).toFixed(1),(h.dissonance??0).toFixed(1),(h.cynicism??0).toFixed(1),(h.revConsciousness??0).toFixed(1),(h.readiness??0).toFixed(1)])],
        'cultural-gap-history'
      );
      cgHistExportRow.appendChild(cgHistPng);
      cgHistExportRow.appendChild(cgHistCsv);
      c.appendChild(cgHistExportRow);
    }

    // ── Narrative ─────────────────────────────────────────────
    c.appendChild(this._section('Analysis'));
    c.appendChild(Utils.createEl('p', 'society-narrative', this._narrativeCulturalGap(s)));
    const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 TXT');
    txtBtn.onclick = () => this._exportTXT(this._narrativeCulturalGap(s), 'cultural-gap-analysis');
    c.appendChild(txtBtn);
  }

  _narrativeCulturalGap(s) {
    const cg  = s.culturalGap ?? {};
    const g   = cg.gapScore ?? 0;
    const cyn = cg.cynicismLevel ?? 0;
    const rc  = cg.revolutionaryConsciousness ?? 0;
    const rd  = cg.paradigmShiftReadiness ?? 0;
    const parts = [];
    if      (g < 15) parts.push('Cultural values are coherent — what society teaches broadly aligns with what it rewards. Cognitive dissonance is low.');
    else if (g < 35) parts.push('A moderate cultural gap exists. Citizens experience some dissonance between professed values and lived economic reality.');
    else if (g < 60) parts.push('A significant cultural gap is eroding social trust. Citizens increasingly recognize the disparity between official values and behavioral incentives — cynicism is rising.');
    else             parts.push('The cultural gap is severe. The gulf between what the civilization claims to stand for and what it rewards drives delegitimization of institutions and structural instability.');
    if (cyn > 60) parts.push(`Cynicism (${Math.round(cyn)}) is entrenched — institutional credibility is critically damaged and difficult to restore.`);
    if (rc  > 50) parts.push(`Revolutionary consciousness (${Math.round(rc)}) is significant — a critical mass of the population recognizes the structural nature of prevailing inequities.`);
    if (rd  > 70) parts.push(`Paradigm shift readiness (${Math.round(rd)}) is very high — conditions for fundamental systemic change are present.`);
    return parts.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: WEALTH CAPTURE (Pass 7)
  // ═══════════════════════════════════════════════════════════
  _renderWealthCapture(c, civ) {
    const s       = civ.state;
    const wc      = s.wealthCapture ?? {};
    const history = wc.history ?? [];
    const deg     = wc.degree ?? 0;

    // Feudal dynamic alert
    if (wc.feudalDynamic) {
      c.appendChild(Utils.createEl('div', 'society-alert-badge society-alert-red',
        `⚠ FEUDAL DYNAMIC ACTIVE — Capture degree: ${deg.toFixed(0)}  |  Feudal intensity: ${(wc.feudalIntensity ?? 0).toFixed(0)}`));
    }

    // Degree badge
    const degColor  = deg > 70 ? '#ef4444' : deg > 40 ? '#f59e0b' : '#22c55e';
    const capLabel  = deg > 80 ? 'Feudal' : deg > 70 ? 'Severe' : deg > 50 ? 'Moderate' : deg > 25 ? 'Mild' : 'Negligible';
    const degBadge  = Utils.createEl('div', 'society-tier-badge');
    degBadge.style.cssText = `background:${degColor}22;border:1px solid ${degColor};color:${degColor};margin-bottom:8px;font-size:13px;`;
    degBadge.textContent   = `Wealth Capture: ${deg.toFixed(0)} / 100 — ${capLabel}`;
    c.appendChild(degBadge);

    c.appendChild(this._bar('Overall Capture Degree',  wc.degree               ?? 0, 100, this._colorForIndex(100 - (wc.degree ?? 0), 30, 60)));
    c.appendChild(this._bar('Reinforcement Control',   wc.reinforcementControl ?? 0, 100, this._colorForIndex(100 - (wc.reinforcementControl ?? 0), 30, 60)));

    // ── Four dimensions ───────────────────────────────────────
    c.appendChild(this._section('Capture Dimensions'));
    const dimWrap = Utils.createEl('div', 'society-canvas-wrap');
    const dimCanvas = Utils.createEl('canvas', 'society-canvas');
    dimCanvas.width = 560; dimCanvas.height = 145;
    dimWrap.appendChild(dimCanvas);
    c.appendChild(dimWrap);
    requestAnimationFrame(() => {
      ChartUtils.drawBarChart(dimCanvas, [
        { label: 'Institutional', value: wc.institutionalCapture ?? 0, color: '#f97316' },
        { label: 'Electoral',     value: wc.electoralCapture     ?? 0, color: '#f59e0b' },
        { label: 'Media',         value: wc.mediaCapture         ?? 0, color: '#a78bfa' },
        { label: 'Cultural',      value: wc.culturalCapture      ?? 0, color: '#38bdf8' },
      ], { title: 'Capture Dimensions (0–100)' });
    });

    const dimExportRow = Utils.createEl('div', 'society-export-row');
    const dimPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
    dimPng.onclick = () => ChartUtils.exportPNG(dimCanvas, 'wealth-capture-dimensions');
    const dimCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
    dimCsv.onclick = () => this._exportCSV(
      [['Dimension','Value'],
       ['institutional',        (wc.institutionalCapture ??0).toFixed(1)],
       ['electoral',            (wc.electoralCapture     ??0).toFixed(1)],
       ['media',                (wc.mediaCapture         ??0).toFixed(1)],
       ['cultural',             (wc.culturalCapture      ??0).toFixed(1)],
       ['reinforcement_control',(wc.reinforcementControl ??0).toFixed(1)],
       ['overall_degree',       (wc.degree               ??0).toFixed(1)]],
      'wealth-capture-dimensions'
    );
    dimExportRow.appendChild(dimPng);
    dimExportRow.appendChild(dimCsv);
    c.appendChild(dimExportRow);

    // ── History chart ─────────────────────────────────────────
    if (history.length >= 2) {
      c.appendChild(this._section('History'));
      const wcHistWrap = Utils.createEl('div', 'society-canvas-wrap');
      const wcHistCanvas = Utils.createEl('canvas', 'society-canvas');
      wcHistCanvas.width = 560; wcHistCanvas.height = 160;
      wcHistWrap.appendChild(wcHistCanvas);
      c.appendChild(wcHistWrap);
      requestAnimationFrame(() => {
        ChartUtils.drawLineChart(wcHistCanvas, [
          { label: 'Capture Degree',     color: '#f97316', points: history.map(h => ({ x: h.turn, y: h.degree               ?? 0 })) },
          { label: 'Reinf. Control',     color: '#a78bfa', points: history.map(h => ({ x: h.turn, y: h.reinforcementControl ?? 0 })) },
        ], { minY: 0, maxY: 100, showLegend: true });
      });
      const wcHistExportRow = Utils.createEl('div', 'society-export-row');
      const wcHistPng = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 PNG');
      wcHistPng.onclick = () => ChartUtils.exportPNG(wcHistCanvas, 'wealth-capture-history');
      const wcHistCsv = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      wcHistCsv.onclick = () => this._exportCSV(
        [['Turn','Degree','ReinforcementControl','FeudalDynamic'],
         ...history.map(h => [h.turn,(h.degree??0).toFixed(1),(h.reinforcementControl??0).toFixed(1),h.feudalDynamic?'yes':'no'])],
        'wealth-capture-history'
      );
      wcHistExportRow.appendChild(wcHistPng);
      wcHistExportRow.appendChild(wcHistCsv);
      c.appendChild(wcHistExportRow);
    }

    // ── Narrative ─────────────────────────────────────────────
    c.appendChild(this._section('Analysis'));
    c.appendChild(Utils.createEl('p', 'society-narrative', this._narrativeWealthCapture(s)));
    const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 TXT');
    txtBtn.onclick = () => this._exportTXT(this._narrativeWealthCapture(s), 'wealth-capture-analysis');
    c.appendChild(txtBtn);
  }

  _narrativeWealthCapture(s) {
    const wc  = s.wealthCapture ?? {};
    const deg = wc.degree ?? 0;
    const rc  = wc.reinforcementControl ?? 0;
    const parts = [];
    if      (deg < 20) parts.push('Wealth capture of governance institutions is negligible. Economic actors operate within meaningful institutional constraints.');
    else if (deg < 40) parts.push('Mild wealth capture is present — affluent interests have modest influence over institutional decisions, but countervailing power exists.');
    else if (deg < 60) parts.push('Moderate wealth capture is reshaping institutional behavior. Policy increasingly favors concentrated wealth, limiting redistributive mechanisms.');
    else if (deg < 80) parts.push('Severe wealth capture has fundamentally distorted governance. Formal democratic structures persist but routinely serve concentrated wealth over public welfare.');
    else               parts.push('Feudal-level wealth capture: formal governance is effectively an instrument of concentrated wealth. The distinction between political and economic power has largely collapsed.');
    if (rc > 50) parts.push(`Reinforcement control (${Math.round(rc)}%) means that a majority of behavioral incentives in this society are determined by those of extreme wealth — shaping what is rewarded, normalized, and penalized.`);
    if ((wc.mediaCapture ?? 0) > 60) parts.push('High media capture limits the information ecosystem — epistemic health is compromised and public capacity to recognize structural conditions is reduced.');
    return parts.join(' ');
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: POWER CONCENTRATION (Pass 8)
  // ═══════════════════════════════════════════════════════════
  _renderPowerConcentration(c, civ) {
    const s   = civ.state;
    const cd  = s.consequenceDeficit ?? {};
    const wc  = s.wealthCapture ?? {};
    const turn = this.game?.turnCount ?? 0;

    // ── Deficit gauge ──────────────────────────────────────────
    c.appendChild(this._section('Consequence Deficit'));

    const level = cd.level ?? 0;
    const mult  = cd.accelerationMultiplier ?? 1.0;

    const gaugeWrap = Utils.createEl('div', '');
    gaugeWrap.style.cssText = 'position:relative;margin:8px 0;';
    const gaugeTrack = Utils.createEl('div', '');
    gaugeTrack.style.cssText = 'height:18px;background:#1e293b;border-radius:4px;overflow:hidden;';
    const gaugeFill = Utils.createEl('div', '');
    const gaugeColor = level > 75 ? '#dc2626' : level > 50 ? '#ef4444' : level > 25 ? '#f59e0b' : '#22c55e';
    gaugeFill.style.cssText = `height:100%;width:${level}%;background:${gaugeColor};transition:width 0.3s;`;
    gaugeTrack.appendChild(gaugeFill);
    gaugeWrap.appendChild(gaugeTrack);
    const gaugeLabel = Utils.createEl('div', '');
    gaugeLabel.style.cssText = 'display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:3px;';
    gaugeLabel.appendChild(Utils.createEl('span', '', `Deficit: ${Math.round(level)}/100`));
    gaugeLabel.appendChild(Utils.createEl('span', '', `Acceleration: ${mult.toFixed(2)}×`));
    gaugeWrap.appendChild(gaugeLabel);
    c.appendChild(gaugeWrap);

    const multEl = Utils.createEl('p', 'society-narrative', `Consequence deficit at ${Math.round(level)}%. Each turn unchecked corruption or wealth capture goes without accountability, future abuse becomes ${mult.toFixed(2)}× as easy to accumulate. ${cd.turnsWithoutAccountability > 0 ? `This civilization has gone ${cd.turnsWithoutAccountability} consecutive turns without meaningful accountability.` : 'Accountability mechanisms are currently functioning.'}`);
    c.appendChild(multEl);

    // ── Stats row ──────────────────────────────────────────────
    const statsWrap = Utils.createEl('div', 'society-stats');
    [
      { label: 'Deficit Level',             value: Math.round(level),                  unit: '' },
      { label: 'Acceleration Mult.',        value: mult.toFixed(2),                    unit: '×' },
      { label: 'Turns w/o Accountability',  value: cd.turnsWithoutAccountability ?? 0, unit: '' },
      { label: 'Wealth Capture',            value: Math.round(wc.degree ?? 0),         unit: '' },
    ].forEach(row => {
      const stat = Utils.createEl('div', 'society-stat');
      stat.appendChild(Utils.createEl('span', 'society-stat-label', row.label));
      stat.appendChild(Utils.createEl('span', 'society-stat-value', `${row.value}${row.unit}`));
      statsWrap.appendChild(stat);
    });
    c.appendChild(statsWrap);

    // ── Deficit chart ──────────────────────────────────────────
    if (Array.isArray(cd.deficitHistory) && cd.deficitHistory.length > 1) {
      c.appendChild(this._section('Deficit Over Time'));
      const canvas = document.createElement('canvas');
      canvas.width = 460; canvas.height = 140;
      canvas.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
      c.appendChild(canvas);
      ChartUtils.drawDeficitChart(canvas, cd.deficitHistory);

      const exportRow = Utils.createEl('div', 'society-export-row');
      const pngBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '🖼 PNG');
      pngBtn.onclick = () => ChartUtils.exportPNG(canvas, `deficit-${turn}`);
      const csvBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      csvBtn.onclick = () => this._exportCSV(
        cd.deficitHistory.map(d => [d.turn, d.level, d.multiplier]),
        'deficit-history', ['turn','deficitLevel','accelerationMultiplier']
      );
      exportRow.appendChild(pngBtn); exportRow.appendChild(csvBtn);
      c.appendChild(exportRow);
    }

    // ── Accountability events ──────────────────────────────────
    const accHist = cd.accountabilityHistory ?? [];
    if (accHist.length > 0) {
      c.appendChild(this._section(`Accountability Events (${accHist.length})`));
      accHist.slice(0, 10).forEach(ev => {
        const item = Utils.createEl('div', '');
        item.style.cssText = 'border-left:3px solid #22c55e;padding:5px 8px;margin:3px 0;background:#0f172a;border-radius:3px;font-size:12px;';
        item.appendChild(Utils.createEl('span', '', `Turn ${ev.turn} — ${ev.type}: deficit ${ev.deficitBefore} → ${ev.deficitAfter}`));
        c.appendChild(item);
      });
    }

    // ── TXT export ─────────────────────────────────────────────
    const exportRow2 = Utils.createEl('div', 'society-export-row');
    const txtBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📄 TXT');
    txtBtn.onclick = () => {
      const lines = [
        `CONSEQUENCE DEFICIT REPORT — Turn ${turn}`,
        `Deficit Level: ${Math.round(level)}`,
        `Acceleration Multiplier: ${mult.toFixed(2)}×`,
        `Turns Without Accountability: ${cd.turnsWithoutAccountability ?? 0}`,
        `Wealth Capture Degree: ${Math.round(wc.degree ?? 0)}`,
        `Last Accountability Event: Turn ${cd.lastAccountabilityEvent ?? 'none'}`,
      ].join('\n');
      this._exportTXT(lines, `deficit-report-turn-${turn}`);
    };
    exportRow2.appendChild(txtBtn);
    c.appendChild(exportRow2);
  }

  // ═══════════════════════════════════════════════════════════
  // TAB: BEHAVIORAL INERTIA (Pass 8)
  // ═══════════════════════════════════════════════════════════
  _renderBehavioralInertia(c, civ) {
    const s    = civ.state;
    const bi   = s.behaviorInertia ?? {};
    const co   = s.cooperativeOutcomes ?? {};
    const turn = this.game?.turnCount ?? 0;

    // ── Inertia overview ───────────────────────────────────────
    c.appendChild(this._section('Behavioral Inertia'));

    const coeff = bi.coefficient ?? 0;
    const coeff100 = Math.round(coeff);
    c.appendChild(this._bar('Inertia Coefficient', coeff100, 100, coeff > 70 ? 'bar-red' : coeff > 40 ? 'bar-amber' : 'bar-green'));

    const pending = Object.values(bi.deferredShift ?? {}).reduce((sum, v) => sum + Math.abs(v ?? 0), 0);
    const fracPerTurn = Math.round((1 - coeff / 100) * 25);
    c.appendChild(Utils.createEl('p', 'society-narrative', `Behavioral inertia is at ${coeff100}% — old behavioral patterns are resisting replacement at this rate. ${pending.toFixed(1)} total units of behavioral change are queued and arriving at ~${fracPerTurn}%/turn.`));

    // Drivers breakdown — clean grid layout
    c.appendChild(this._section('Inertia Drivers'));
    const statsWrap = Utils.createEl('div', '');
    statsWrap.style.cssText = 'display:grid;grid-template-columns:1fr;gap:4px;margin:6px 16px 10px;';
    const govAge = s._govShiftAge ?? 0;
    const econAge = s._econShiftAge ?? 0;
    const heEntrenched = s.hierarchyEntrenched ?? 0;
    const wcd = s.wealthCapture?.degree ?? 0;
    const eq = s.educationQuality ?? 50;
    const eh = s.epistemicHealth ?? 50;
    const homo = s.culturalHomogeneity?.value ?? 50;
    [
      { label: 'Time in Current Model',    value: Math.max(govAge, econAge),   note: 'Higher = more ingrained', up: true },
      { label: 'Hierarchy Entrenched',     value: Math.round(heEntrenched),    note: 'Increases inertia', up: true },
      { label: 'Wealth Capture',           value: Math.round(wcd),             note: 'Increases inertia', up: true },
      { label: 'Education Quality',        value: Math.round(eq),              note: 'Reduces inertia', up: false },
      { label: 'Epistemic Health',         value: Math.round(eh),              note: 'Reduces inertia', up: false },
      { label: 'Cultural Homogeneity',     value: Math.round(homo),            note: 'Harder to shift', up: true },
    ].forEach(row => {
      const stat = Utils.createEl('div', '');
      stat.style.cssText = 'display:grid;grid-template-columns:180px 50px 1fr;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid #1e293b;';
      const lbl = Utils.createEl('span', '', row.label);
      lbl.style.cssText = 'font-size:0.8rem;color:#94a3b8;';
      const val = Utils.createEl('span', '', `${row.value}`);
      val.style.cssText = `font-size:0.85rem;font-weight:600;text-align:right;color:${row.up ? '#f59e0b' : '#22c55e'};`;
      const note = Utils.createEl('span', '', row.note);
      note.style.cssText = 'font-size:0.72rem;color:#64748b;';
      stat.appendChild(lbl);
      stat.appendChild(val);
      stat.appendChild(note);
      statsWrap.appendChild(stat);
    });
    c.appendChild(statsWrap);

    // Deferred shift table
    c.appendChild(this._section('Queued Behavioral Shifts'));
    const defs = bi.deferredShift ?? {};
    const hasDeferred = Object.values(defs).some(v => Math.abs(v ?? 0) > 0.01);
    if (!hasDeferred) {
      c.appendChild(Utils.createEl('p', 'society-narrative', 'No behavioral shifts currently queued. Shifts are loaded here when paradigm changes are triggered.'));
    } else {
      const table = Utils.createEl('div', '');
      table.style.cssText = 'font-size:12px;';
      Object.entries(defs).forEach(([key, val]) => {
        if (Math.abs(val ?? 0) < 0.01) return;
        const row = Utils.createEl('div', '');
        row.style.cssText = 'display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #1e293b;';
        row.appendChild(Utils.createEl('span', '', key.charAt(0).toUpperCase() + key.slice(1)));
        const valEl = Utils.createEl('span', '', `${val > 0 ? '+' : ''}${val.toFixed(2)}`);
        valEl.style.color = val > 0 ? '#22c55e' : '#ef4444';
        row.appendChild(valEl);
        table.appendChild(row);
      });
      c.appendChild(table);
    }

    // Inertia chart
    if (Array.isArray(bi.inertiaHistory) && bi.inertiaHistory.length > 1) {
      c.appendChild(this._section('Inertia History'));
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

    // ── Cooperative outcomes ───────────────────────────────────
    c.appendChild(this._section('Cooperative Outcomes Feedback'));
    const score = co.coopOutcomeScore ?? 50;
    const fb    = co.feedback ?? 'neutral';
    const mag   = co.feedbackMagnitude ?? 0;
    const cumul = co.cumulativeReinforcement ?? 0;

    const fbColor = fb === 'reinforcing' ? '#22c55e' : fb === 'weakening' ? '#ef4444' : '#64748b';
    const fbEl = Utils.createEl('p', 'society-narrative', '');
    fbEl.innerHTML = `Cooperation outcome score: <strong style="color:${fb === 'reinforcing' ? '#22c55e' : '#f59e0b'}">${Math.round(score)}</strong>. Current feedback: <strong style="color:${fbColor}">${fb}</strong> (magnitude ${mag.toFixed(2)}). ${fb === 'reinforcing' ? 'Cooperative behavior is being materially rewarded — self-reinforcing dynamics are strengthening it.' : fb === 'weakening' ? 'Cooperative effort is not producing material gains for cooperators — cynicism rises and cooperation weakens.' : 'Outcomes are neutral — no current feedback in either direction.'} Cumulative reinforcement: ${cumul > 0 ? '+' : ''}${cumul.toFixed(1)}.`;
    c.appendChild(fbEl);

    if (Array.isArray(co.history) && co.history.length > 1) {
      const canvas2 = document.createElement('canvas');
      canvas2.width = 460; canvas2.height = 120;
      canvas2.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
      c.appendChild(canvas2);
      const brCoopHistory = (bi.inertiaHistory ?? []).map((d, i) => ({
        value: s.behaviorReinforcement?.cooperation ?? 50,
      }));
      ChartUtils.drawCoopOutcomesChart(canvas2, co.history, brCoopHistory);
      const exportRow3 = Utils.createEl('div', 'society-export-row');
      const pngBtn3 = Utils.createEl('button', 'btn btn-secondary btn-sm', '🖼 PNG');
      pngBtn3.onclick = () => ChartUtils.exportPNG(canvas2, `coop-outcomes-${turn}`);
      const csvBtn3 = Utils.createEl('button', 'btn btn-secondary btn-sm', '📥 CSV');
      csvBtn3.onclick = () => this._exportCSV(
        co.history.map(d => [d.turn, d.score, d.feedback, d.magnitude]),
        'coop-outcomes', ['turn','score','feedback','magnitude']
      );
      exportRow3.appendChild(pngBtn3); exportRow3.appendChild(csvBtn3);
      c.appendChild(exportRow3);
    }

    // ── Pass 9: Research View toggle ──────────────────────────
    const researchToggleId = 'inertia-research-view';
    const toggleBtn = Utils.createEl('button', 'research-view-toggle', '+ Research View');
    toggleBtn.onclick = () => {
      const sec = Utils.el(researchToggleId);
      if (!sec) return;
      const isOpen = sec.classList.toggle('research-view-open');
      toggleBtn.textContent = isOpen ? '− Research View' : '+ Research View';
      if (isOpen && !sec._p9rendered) {
        sec._p9rendered = true;
        this._renderInertiaResearchView(sec, s);
      }
    };
    c.appendChild(toggleBtn);
    const researchSec = Utils.createEl('div', 'research-view-section');
    researchSec.id = researchToggleId;
    c.appendChild(researchSec);
  }

  _renderInertiaResearchView(sec, s) {
    // Cultural homogeneity chart
    const homoSec = Utils.createEl('div', '');
    homoSec.appendChild(Utils.createEl('h4', 'param-section-title', 'Cultural Homogeneity History'));
    const homoCanvas = document.createElement('canvas');
    homoCanvas.width = 460; homoCanvas.height = 140;
    homoCanvas.style.cssText = 'display:block;margin:8px 0;border-radius:4px;background:#0f172a;';
    homoSec.appendChild(homoCanvas);
    if (typeof ChartUtils !== 'undefined') {
      ChartUtils.drawHomogeneityChart(homoCanvas, s?.culturalHomogeneity?.history ?? []);
    }
    sec.appendChild(homoSec);

    // Contagion summary
    const cs = s?.contagionState;
    const contagionSec = Utils.createEl('div', '');
    contagionSec.appendChild(Utils.createEl('h4', 'param-section-title', 'Contagion Summary'));
    const recv = cs?.receivedInfluences ?? [];
    const emit = cs?.emittedInfluences ?? [];
    const sources = [...new Set(recv.map(r => r.sourceCivName))].filter(Boolean);
    const targets = [...new Set(emit.map(e => e.targetCivName))].filter(Boolean);
    const summaryTxt = Utils.createEl('p', 'society-narrative',
      (sources.length > 0 ? `Receiving influence from: ${sources.join(', ')}.` : 'Not currently receiving significant influence from neighbors.') + ' ' +
      (targets.length > 0 ? `Emitting influence to: ${targets.join(', ')}.` : '') +
      ' Open the Research panel (🔬) for full contagion charts and influence logs.');
    contagionSec.appendChild(summaryTxt);
    sec.appendChild(contagionSec);
  }

  _generateEmpathyNarrativeLocal(civ) {
    // Fallback narrative generator used by society panel when simulation reference unavailable
    if (!civ?.state) return '';
    const s = civ.state;
    const empathy = s.empathyLevel ?? 50;
    const br      = s.brCoopScore ?? 50;
    const PBI     = s.prosocialBehavioralIndex ?? 50;
    const plutocratic = !(s.govContributes ?? true);
    const parts = [];
    if (empathy >= 65 && br >= 65) parts.push('Prosocial capacity is being realized — both empathy and cooperative reinforcement are aligned.');
    else if (empathy >= 65 && br < 50) parts.push('High empathy is underutilized — competitive behavioral reinforcement suppresses its expression.');
    else if (empathy < 50 && br >= 65) parts.push('Cooperative norms rest on compliance rather than genuine empathy — a fragile equilibrium.');
    else parts.push('Both empathy and behavioral reinforcement point toward competitive and extractive dynamics.');
    if (plutocratic) parts.push(`Economic wealth-power (${Math.round(s.economicPowerHierarchy ?? 0)}) exceeds governance hierarchy — plutocratic suppression in effect.`);
    return parts.join(' ');
  }
}