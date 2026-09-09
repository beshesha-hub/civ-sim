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
      ['Companion: Demographics',    (s?.companion?.demographicHistory ?? []).length],
      ['Companion: Temporal Dampen', (s?.companion?.temporalDampenHistory ?? []).length],
      ['Companion: Micro-foundations',(s?.companion?.microFoundationsHistory ?? []).length],
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

    // ── Pass 10: Production Decentralization ──────────────────
    // Every coefficient carries a confidence tier:
    //   M = measured empirical anchor
    //   I = interpolated strictly between >=2 measured anchors
    //   T = mechanism supported, magnitude assumed
    wrap.appendChild(this._paramSection('Pass 10 — Evidence Tiers'));
    wrap.appendChild(this._paramRow('M — Measured', 'direct empirical anchor', 'coefficient traces to a published measurement'));
    wrap.appendChild(this._paramRow('I — Interpolated', 'bounded between ≥2 anchors', 'never extrapolated past the outermost anchor'));
    wrap.appendChild(this._paramRow('T — Theoretical', 'mechanism supported, magnitude assumed', 'treat as a structural hypothesis'));

    wrap.appendChild(this._paramSection('Pass 10 — Land Equivalent Ratio'));
    wrap.appendChild(this._paramRow('Monoculture', 'LER 1.00', 'M • definitional'));
    wrap.appendChild(this._paramRow('Diversification 50', 'LER 1.27', 'M • intercropping meta-analyses 1.22–1.32; maize/soy 1.32±0.02'));
    wrap.appendChild(this._paramRow('Diversification 100', 'LER 1.70', 'I • below measured silvoarable ceiling'));
    wrap.appendChild(this._paramRow('Hard cap', `LER ${typeof LER_HARD_CAP !== 'undefined' ? LER_HARD_CAP.toFixed(2) : '2.00'}`, 'M • measured silvoarable maximum; never exceeded'));
    wrap.appendChild(this._paramRow('Soil gate', 'poorer soil → larger benefit', 'M • advantage strongest in poor/arid/tropical, variable in temperate'));

    wrap.appendChild(this._paramSection('Pass 10 — Ecosystem Function'));
    wrap.appendChild(this._paramRow('Max yield gain', `${(ECOSYSTEM_FUNCTION.maxYieldGain*100).toFixed(0)}%`, 'I • conservative vs push-pull (1→3.5 t/ha, 122,650+ farms)'));
    wrap.appendChild(this._paramRow('Input-scarcity weighting', `${ECOSYSTEM_FUNCTION.baseWeight} + ${ECOSYSTEM_FUNCTION.lowInputWeight}×(1−tech/6)`, 'M • substitutes for inputs that are missing'));
    wrap.appendChild(this._paramRow('Knowledge decay/turn', `${ECOSYSTEM_FUNCTION.knowledgeDecay}`, 'M • lapses without follow-up training'));
    wrap.appendChild(this._paramRow('Knowledge gate', 'edu×0.55 + stateCap×0.25 + trust×0.20 + extension', 'M • knowledge-intensive, needs local adaptation'));

    wrap.appendChild(this._paramSection('Pass 10 — Coercion'));
    wrap.appendChild(this._paramRow('Productivity penalty', `1 − ${COERCION_PRODUCTIVITY.maxPenalty} × (coercion/100)^${COERCION_PRODUCTIVITY.exponent}`, 'M • Soviet private plots: 1–3% of land → 25–27% of output'));
    wrap.appendChild(this._paramRow('Applied to', 'structural gain only, not baseline', 'forcing a better design destroys that design\u2019s advantage'));
    wrap.appendChild(this._paramRow('Negative threshold', `coercion > ${PARTICIPATION_EFFECTS.coercionNegativeThreshold}`, 'M • does NOT require weak institutions'));
    wrap.appendChild(this._paramRow('Institutional role', 'modulator, not gate', 'M • USSR / Great Leap / Romania were high-capacity states'));
    wrap.appendChild(this._paramRow('Anomie floor', 'up to 28 under sustained compulsion', 'T/M • Scott: destroyed reciprocity networks persist'));

    wrap.appendChild(this._paramSection('Pass 10 — Participation Effects (caps)'));
    wrap.appendChild(this._paramRow('Wellbeing', `+${PARTICIPATION_EFFECTS.wellbeingCap}`, 'M • gardening meta ES ≈0.55; SDT autonomy g=0.81'));
    wrap.appendChild(this._paramRow('Anomie', `−${PARTICIPATION_EFFECTS.anomieCap}`, 'M • Karasek / Whitehall II decision latitude'));
    wrap.appendChild(this._paramRow('Social trust', `+${PARTICIPATION_EFFECTS.trustCap}`, 'M • CSA / cooperative participation'));
    wrap.appendChild(this._paramRow('Legitimacy', `+${PARTICIPATION_EFFECTS.legitimacyCap}`, 'M • procedural > distributional justice'));
    wrap.appendChild(this._paramRow('Coercion discount', `(1 − coercion/100)^${PARTICIPATION_EFFECTS.coercionExponent}`, 'M • participation studies are self-selected'));
    wrap.appendChild(this._paramRow('Domain weighting', `energy ${PARTICIPATION_EFFECTS.energyWeight} / agriculture ${PARTICIPATION_EFFECTS.agricultureWeight}`, 'food production is more hands-on and daily'));

    wrap.appendChild(this._paramSection('Pass 10 — Diffusion Limits (pts/decade)'));
    wrap.appendChild(this._paramRow('Baseline', `${DIFFUSION_LIMITS.baseline}`, 'M • Grübler ~95yr invention→80% share'));
    wrap.appendChild(this._paramRow('Crisis + capital', `${DIFFUSION_LIMITS.crisis}`, 'M • Puerto Rico: 81% of all new capacity 2016–25'));
    wrap.appendChild(this._paramRow('Short burst', `${DIFFUSION_LIMITS.burst}`, 'M • South Africa +349%/15mo; Cuba 3.6→10%/yr'));

    wrap.appendChild(this._paramSection('Pass 10 — Pathways'));
    for (const pw of Object.values(DECENTRALIZATION_PATHWAYS)) {
      if (pw.id === 'none') continue;
      wrap.appendChild(this._paramRow(pw.label,
        `base ${pw.baseRate} • crisis ×${pw.crisisMultiplier} • ownership ${pw.ownershipBreadth} • coercion ${pw.coercion}`,
        `${pw.tier} • ${pw.stateDependent ? 'state-dependent' : 'capital-dependent'} • capSens ${pw.capitalSensitivity}`));
    }

    wrap.appendChild(this._paramSection('Pass 10 — Enabling Support'));
    wrap.appendChild(this._paramRow('Adoption elasticity', `${ENABLING_SUPPORT.adoptionElasticity}`, 'M • PV price elasticity; halving incentives → −9% installs'));
    wrap.appendChild(this._paramRow('Max adoption boost', `×${(1+ENABLING_SUPPORT.maxAdoptionBoost).toFixed(2)}`, 'M'));
    wrap.appendChild(this._paramRow('Progressive', `${ENABLING_SUPPORT.progressive}`, 'M • refundable credits lift low-income adoption only'));
    wrap.appendChild(this._paramRow('Knowledge boost', `${ENABLING_SUPPORT.knowledgeBoost}`, 'I • FFS reviews: no low-risk-of-bias study; effects likely overstated'));
    wrap.appendChild(this._paramRow('Spillover', `${ENABLING_SUPPORT.spillover}`, 'M • no evidence non-participant neighbours benefit'));
    wrap.appendChild(this._paramRow('Elite capture weight', `${ENABLING_SUPPORT.eliteCaptureWeight}`, 'M • Malawi FISP: benefits skewed to larger/connected farmers'));
    wrap.appendChild(this._paramRow('Fiscal drain / decay', `${ENABLING_SUPPORT.fiscalDrain} / ${ENABLING_SUPPORT.decayRate}`, 'M • lapses without long-term follow-up'));

    wrap.appendChild(this._paramSection('Pass 10 — Distribution & Loss Chain'));
    wrap.appendChild(this._paramRow('Base chain loss', `${DISTRIBUTION.baseChainLoss}%`, 'M • FAO post-harvest loss 2021'));
    wrap.appendChild(this._paramRow('Perishable chain loss', `${DISTRIBUTION.perishableChainLoss}%`, 'M • FAO fruit & vegetables 2023'));
    wrap.appendChild(this._paramRow('Cosmetic rejection max', `${DISTRIBUTION.cosmeticRejectionMax}%`, 'M • 17.1% China apples; 41% NC field study'));
    wrap.appendChild(this._paramRow('Cosmetic recovery', `${(DISTRIBUTION.cosmeticRecoveryFraction*100).toFixed(0)}%`, 'M • diverted to processing/feed, not destroyed'));
    wrap.appendChild(this._paramRow('Applied as', 'multiplicative on production', 'loss is a proportion of what was grown'));
    wrap.appendChild(this._paramRow('Distribution energy share', `${(DISTRIBUTION.distributionEnergyShare*100).toFixed(0)}%`, 'M • production remains 83% of food-system emissions'));
    wrap.appendChild(this._paramRow('Cold chain share', `${(DISTRIBUTION.coldChainShare*100).toFixed(0)}%`, 'M • ~40% of foods require refrigeration'));
    wrap.appendChild(this._paramRow('Urbanization cap', `locality ≤ 100 − urban×${DISTRIBUTION.urbanizationPenalty}`, 'M • a city cannot be fed within cart range'));
    wrap.appendChild(this._paramRow('Nutritional quality', 'health only, never calories', 'M • vitamins rise during ripening; mature-green for long haul'));

    wrap.appendChild(this._paramSection('Pass 10 — Energy'));
    wrap.appendChild(this._paramRow('Wellbeing ceiling', `${ENERGY_WELLBEING.floor} + ${ENERGY_WELLBEING.span}(1 − e^(−GJ/${ENERGY_WELLBEING.scale}))`, 'M • HDI>0.7 at 50 GJ/cap; saturates 100–150'));
    wrap.appendChild(this._paramRow('Ceiling behaviour', 'soft ceiling only, never a bonus', 'constrains low-energy, rewards nothing above'));
    wrap.appendChild(this._paramRow('Power density (W/m²)', `biomass ${POWER_DENSITY.biomass} • wind ${POWER_DENSITY.wind} • dist. solar ${POWER_DENSITY.distributedSolar} • hydro/nuclear ${POWER_DENSITY.hydroNuclear} • fossil ${POWER_DENSITY.fossilExtraction}`, 'M • Smil'));
    wrap.appendChild(this._paramRow('T&D loss avoided', '2%–19% by infrastructure quality', 'M • global mean ~5%, India ~19%, Singapore ~2%'));
    wrap.appendChild(this._paramRow('Scale cost penalty', 'up to −30% EROI at full distribution', 'M • Lazard: rooftop $122–284/MWh vs utility $38–78'));
    wrap.appendChild(this._paramRow('Islanding resilience', '−35% deficit severity', 'M • variance reduction, not mean gain'));

    // ── Pass 11: Active Travel Networks ───────────────────────
    wrap.appendChild(this._paramSection('Pass 11 — Active Travel: Mode Shift'));
    wrap.appendChild(this._paramRow('Seville baseline → achieved', `${ACTIVE_TRAVEL.sevilleBaseShare}% → ${ACTIVE_TRAVEL.sevilleAchievedShare}%`, 'M • 80km continuous protected network, 2006-2010, EUR 32M'));
    wrap.appendChild(this._paramRow('Continuity vs coverage weight', `${ACTIVE_TRAVEL.continuityWeight} / ${ACTIVE_TRAVEL.coverageWeight}`, 'M • gaps kill a network; length alone does not deliver'));
    wrap.appendChild(this._paramRow('Polycentric non-motorized ceiling', `${ACTIVE_TRAVEL.polycentricNonMotorizedCeiling}%`, 'M • Wuhan subcenters; 91.3% of commutes internal'));

    wrap.appendChild(this._paramSection('Pass 11 — Distance Decay'));
    wrap.appendChild(this._paramRow('Median cycling trip', `${ACTIVE_TRAVEL.medianTripKm} km`, 'M'));
    wrap.appendChild(this._paramRow('Mode share falls off beyond', `${ACTIVE_TRAVEL.falloffKm} km`, 'M • the binding metropolitan constraint'));
    wrap.appendChild(this._paramRow('Comfortable / hard limit', `${ACTIVE_TRAVEL.comfortMaxKm} / ${ACTIVE_TRAVEL.hardLimitKm} km`, 'M'));
    wrap.appendChild(this._paramRow('Walking reach', `${ACTIVE_TRAVEL.walkingReachKm} km`, 'M'));

    wrap.appendChild(this._paramSection('Pass 11 — Transit Integration (the solution)'));
    wrap.appendChild(this._paramRow('Bicycle as rail access mode', `${(ACTIVE_TRAVEL.transitAccessShare*100).toFixed(0)}%`, 'M • Netherlands; up to 70% at some stations'));
    wrap.appendChild(this._paramRow('Rail access cycling distance', `${ACTIVE_TRAVEL.transitAccessKm} km`, 'M'));
    wrap.appendChild(this._paramRow('Reach multiplier', `×${ACTIVE_TRAVEL.transitReachMultiplier}`, 'I • bounded by the measured access share'));
    wrap.appendChild(this._paramRow('Jobs–housing gate floor', `${ACTIVE_TRAVEL.jobsHousingGateFloor}`, 'M • polycentricity does NOT automatically reduce travel'));

    wrap.appendChild(this._paramSection('Pass 11 — Health & Environment'));
    wrap.appendChild(this._paramRow('Cycle commuting mortality', `HR ${ACTIVE_TRAVEL.mortalityHR}`, 'M • Celis-Morales BMJ 2017 (95% CI 0.42-0.83)'));
    wrap.appendChild(this._paramRow('Max disease burden reduction', `−${ACTIVE_TRAVEL.maxDiseaseBurdenReduction}`, 'I • bounded by the HR at full uptake'));
    wrap.appendChild(this._paramRow('Barcelona decomposition', 'air 291 / noise 163 / heat 117 / green 60', 'M(modelled) • 667 deaths/yr, +200 days life expectancy'));
    wrap.appendChild(this._paramRow('Noise channel', 'no noise variable → wellbeing', 'M→T'));
    wrap.appendChild(this._paramRow('Addressable energy', `${(ACTIVE_TRAVEL.transportEnergyShare*ACTIVE_TRAVEL.passengerShareOfTransport*ACTIVE_TRAVEL.urbanShareOfPassenger*100).toFixed(1)}% of total`, 'M • transport 1/3, passenger 65%, urban 55%'));
    wrap.appendChild(this._paramRow('Scale check', '10pt mode shift ≈ 2% of total energy', 'M • real, not transformational'));

    wrap.appendChild(this._paramSection('Pass 11 — Safety & Gendered Access'));
    wrap.appendChild(this._paramRow('Lighting → crime', `−${(ACTIVE_TRAVEL.lightingCrimeReduction*100).toFixed(0)}%`, 'M • Welsh & Farrington 2022 (down from 20-21%)'));
    wrap.appendChild(this._paramRow('Composite weights', `patrol ${ACTIVE_TRAVEL.patrolWeight} / lighting ${ACTIVE_TRAVEL.lightingWeight} / amenity ${ACTIVE_TRAVEL.amenityWeight}`, 'M/M/T'));
    wrap.appendChild(this._paramRow('Patrol evidence', 'Braga: significant, DIFFUSION not displacement', 'M • benefits spread to surrounding areas'));
    wrap.appendChild(this._paramRow('Female / male safety elasticity', `${ACTIVE_TRAVEL.femaleSafetyElasticity} / ${ACTIVE_TRAVEL.maleSafetyElasticity}`, 'M • women 29% vs men 20% fearful; 30% vs 49% feel safe'));
    wrap.appendChild(this._paramRow('Fear of collision', 'no gendered difference', 'M • protected paths alone do NOT close the gap'));
    wrap.appendChild(this._paramRow('Drone patrol', 'NOT MODELLED', 'the one rigorous aerial-patrol trial found no effect'));

    wrap.appendChild(this._paramSection('Pass 11 — Animal Power (density-conditional)'));
    wrap.appendChild(this._paramRow('Viable urbanization ceiling', `${ANIMAL_TRANSPORT.viableUrbanizationCeiling}%`, 'M • above this, costs dominate'));
    wrap.appendChild(this._paramRow('Manure', `${ANIMAL_TRANSPORT.manureLbPerDay} lb/horse/day`, 'M • ~1,000 tons/day in 1890s London'));
    wrap.appendChild(this._paramRow('Sanitation penalty max', `${ANIMAL_TRANSPORT.sanitationPenaltyMax}`, 'M • flies, water contamination, typhoid and cholera'));
    wrap.appendChild(this._paramRow('Land competition max', `${ANIMAL_TRANSPORT.landCompetitionMax}`, 'M • hay acreage vs human food; couples to agriculture emergently'));
    wrap.appendChild(this._paramRow('Freight benefit max', `${ANIMAL_TRANSPORT.freightBenefitMax}`, 'M • genuinely useful at low density'));

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
