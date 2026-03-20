// ============================================================
// events.js - World events panel and event management
// ============================================================

const ALIEN_RESPONSE_PROTOCOLS = [
  {
    id: 'alien_response_open',
    icon: '🤝',
    label: 'Open Contact',
    description: 'Full public disclosure and active attempts to establish two-way communication. Treats contact as belonging to all people, not institutions.',
    effects: 'Innovation +15 | Cooperation +12 | Stability −8 | Wellbeing +6',
  },
  {
    id: 'alien_response_study',
    icon: '🔬',
    label: 'Scientific Study Protocol',
    description: 'Contact data centralized within research institutions. Communication attempted through mathematical and physical frameworks.',
    effects: 'Innovation +20 | Cooperation +5 | Stability −3 | Wellbeing +2',
  },
  {
    id: 'alien_response_quarantine',
    icon: '🔒',
    label: 'Information Quarantine',
    description: 'Contact classified. Public knowledge actively restricted. The governing authority manages the response internally.',
    effects: 'Innovation +5 | Cooperation −8 | Stability +5 | Wellbeing −4',
  },
  {
    id: 'alien_response_military',
    icon: '⚔️',
    label: 'Military Response Posture',
    description: 'Contact treated as a potential existential threat. Resources directed toward defense, detection, and contingency.',
    effects: 'Innovation +8 | Cooperation −12 | Stability +4 | Wellbeing −8',
  },
  {
    id: 'alien_response_diplomatic',
    icon: '📜',
    label: 'Diplomatic Outreach',
    description: 'Formal diplomatic protocols established. Structured, deliberate communication attempts through carefully designed neutral frameworks.',
    effects: 'Innovation +10 | Cooperation +8 | Stability −2 | Wellbeing +4',
  },
];

const EXTINCTION_EVENT_TYPES = [
  {
    id: 'extinction_meteor',
    icon: '☄️',
    label: 'Asteroid / Meteor Impact',
    description: 'A large extraterrestrial body strikes, triggering widespread destruction, fires, and atmospheric debris across a vast region.',
    minTech: 1, maxTech: 11,
    effects: { stabilityDelta: -35, wellbeingDelta: -40, innovationDelta: -20, cooperationDelta: -15 },
  },
  {
    id: 'extinction_plague',
    icon: '☠️',
    label: 'Catastrophic Pandemic',
    description: 'A highly lethal, rapidly spreading pathogen overwhelms all health systems and tears through the social fabric.',
    minTech: 1, maxTech: 11,
    effects: { stabilityDelta: -25, wellbeingDelta: -35, cooperationDelta: -20, innovationDelta: -10 },
  },
  {
    id: 'extinction_supervolcano',
    icon: '🌋',
    label: 'Supervolcano Eruption',
    description: 'A supervolcanic event drives a volcanic winter, collapsing agriculture and forcing mass displacement across entire regions.',
    minTech: 1, maxTech: 11,
    effects: { stabilityDelta: -25, wellbeingDelta: -30, fertilityDelta: -30, innovationDelta: -15 },
  },
  {
    id: 'extinction_ice_age',
    icon: '🧊',
    label: 'Glacial Advance / Rapid Cooling',
    description: 'A sharp and sustained drop in temperatures shortens growing seasons, fails harvests, and forces displacement of settled populations.',
    minTech: 1, maxTech: 11,
    effects: { stabilityDelta: -18, wellbeingDelta: -25, fertilityDelta: -35, cooperationDelta: -8 },
  },
  {
    id: 'extinction_climate',
    icon: '🌊',
    label: 'Climate Collapse',
    description: 'Runaway environmental change crosses irreversible thresholds — rising seas, mass crop failure, and civilizational displacement.',
    minTech: 8, maxTech: 11,
    effects: { stabilityDelta: -20, wellbeingDelta: -30, fertilityDelta: -25, cooperationDelta: -10 },
  },
  {
    id: 'extinction_nuclear',
    icon: '☢️',
    label: 'Nuclear Winter',
    description: 'Catastrophic nuclear exchange or reactor failure drives atmospheric soot that blocks sunlight globally for years.',
    minTech: 9, maxTech: 11,
    effects: { stabilityDelta: -40, wellbeingDelta: -45, fertilityDelta: -35, innovationDelta: -25, cooperationDelta: -20 },
  },
];

const PUBLIC_WORKS_TYPES = [
  {
    id: 'works_granary',
    icon: '🌾',
    label: 'Granary Network',
    description: 'A distributed system of public granaries insulates the population against famine and harvest failure.',
    minTech: 2, maxTech: 7,
    buildTurns: 3,
    effects: { stabilityDelta: 12, wellbeingDelta: 8 },
  },
  {
    id: 'works_irrigation',
    icon: '💧',
    label: 'Great Irrigation Project',
    description: 'Engineered irrigation channels extend arable land and increase agricultural resilience across the civilization.',
    minTech: 2, maxTech: 8,
    buildTurns: 4,
    effects: { fertilityDelta: 15, wellbeingDelta: 10 },
  },
  {
    id: 'works_aqueduct',
    icon: '🏛️',
    label: 'Aqueduct & Water System',
    description: 'A large-scale public water infrastructure project ensures clean water access across all settlements.',
    minTech: 3, maxTech: 8,
    buildTurns: 5,
    effects: { wellbeingDelta: 15, stabilityDelta: 10 },
  },
  {
    id: 'works_roads',
    icon: '🛣️',
    label: 'Road Network',
    description: 'A comprehensive road system connects communities, accelerating trade, communication, and cultural exchange.',
    minTech: 3, maxTech: 9,
    buildTurns: 4,
    effects: { cooperationBoost: 12, innovationBoost: 5 },
  },
  {
    id: 'works_library',
    icon: '📚',
    label: 'Great Library / Archive',
    description: 'A centralized repository of knowledge accelerates learning and ensures cultural continuity across generations.',
    minTech: 4, maxTech: 9,
    buildTurns: 5,
    effects: { innovationBoost: 18, cooperationBoost: 8 },
  },
  {
    id: 'works_hospital',
    icon: '🏥',
    label: 'Public Hospital System',
    description: 'A network of public medical facilities extends healthcare broadly, transforming population wellbeing and social trust.',
    minTech: 6, maxTech: 11,
    buildTurns: 6,
    effects: { wellbeingDelta: 20, stabilityDelta: 8 },
  },
  {
    id: 'works_energy',
    icon: '⚡',
    label: 'Renewable Energy Grid',
    description: 'A large-scale shift to renewable infrastructure reduces resource dependence and drives technical innovation.',
    minTech: 9, maxTech: 11,
    buildTurns: 6,
    effects: { innovationBoost: 15, wellbeingDelta: 12, stabilityDelta: 5 },
  },
  {
    id: 'works_space',
    icon: '🚀',
    label: 'Space Program',
    description: 'A coordinated civilizational effort to extend habitation and exploration beyond the home world.',
    minTech: 10, maxTech: 11,
    buildTurns: 8,
    effects: { innovationBoost: 22, cooperationBoost: 10, wellbeingDelta: 8 },
  },
];

const HORIZON_EVENT_TYPES = [
  {
    id: 'new_land',
    icon: '🗺️',
    label: 'New Land Discovered',
    description: 'Explorers return with accounts of unknown lands beyond the frontier. Expands the known world and boosts innovation.',
    minTech: 2, maxTech: 7,
    effects: { innovationBoost: 8, wellbeingBoost: 5 },
    historyType: 'new_horizons',
  },
  {
    id: 'frontier_opened',
    icon: '🏕️',
    label: 'Frontier Lands Opened',
    description: 'Previously inaccessible territories are incorporated, expanding productive and agricultural capacity.',
    minTech: 8, maxTech: 8,
    effects: { populationBoost: 5, fertilityBoost: 3 },
    historyType: 'frontier_expansion',
  },
  {
    id: 'land_reclamation',
    icon: '🏗️',
    label: 'Land Reclamation Project',
    description: 'Large-scale engineering recovers usable terrain from coastlines, wetlands, or degraded zones.',
    minTech: 9, maxTech: 9,
    effects: { fertilityBoost: 5, innovationBoost: 5 },
    historyType: 'land_reclamation',
  },
  {
    id: 'underwater_habitat',
    icon: '🌊',
    label: 'Underwater Habitat Established',
    description: 'A pressurized undersea habitat opens the ocean floor to research and habitation.',
    minTech: 10, maxTech: 10,
    effects: { innovationBoost: 12 },
    historyType: 'underwater_habitat',
  },
  {
    id: 'planetary_colony',
    icon: '🪐',
    label: 'Planetary Colonization Begins',
    description: 'An uninhabited world is opened for permanent human settlement.',
    minTech: 11, maxTech: 11,
    effects: { innovationBoost: 15, wellbeingBoost: 8 },
    historyType: 'planetary_colonization',
  },
];

class EventsPanel {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.activeTab = 'disasters';
    this.onClose = null;
  }

  show() { this.visible = true; this.render(); }
  hide() { this.visible = false; }

  render() {
    const container = Utils.el('events-panel');
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'flex';

    // ── Header ─────────────────────────────────────────────────
    const header = Utils.createEl('div', 'panel-header');
    header.innerHTML = `
      <h2>⚡ World Events</h2>
      <p class="panel-subtitle">Introduce external factors to test your civilization's resilience</p>
    `;
    const closeBtn = Utils.createEl('button', 'close-btn', '✕');
    closeBtn.onclick = () => { this.hide(); container.style.display = 'none'; if (this.onClose) this.onClose(); };
    header.appendChild(closeBtn);
    container.appendChild(header);

    // ── Tabs ───────────────────────────────────────────────────
    const tabs = Utils.createEl('div', 'panel-tabs');
    const tabDefs = [
      { id: 'disasters',   label: '🌊 Disasters' },
      { id: 'technology',  label: '⚙️ Technology' },
      { id: 'movements',   label: '💡 Movements' },
      { id: 'resources',   label: '💎 Resources' },
      { id: 'warming',     label: '🌡️ Climate' },
      { id: 'religion',    label: '✨ Religion' },
      { id: 'horizons',    label: '🌍 Horizons' },
      { id: 'alien',       label: '🛸 Alien Contact' },
      { id: 'extinction',  label: '☄️ Extinction' },
      { id: 'works',       label: '🏗️ Works' },
      { id: 'diplomacy',   label: '🤝 Diplomacy' },
      { id: 'leadership',  label: '👑 Leadership' },
      { id: 'migration',   label: '🧳 Migration' },
      { id: 'slavery',     label: '⛓️ Slavery' },
      { id: 'crime',       label: '🔪 Crime' },
      { id: 'economy',     label: '💰 Economy' },
      { id: 'policy',      label: '📋 Policy' },
      { id: 'custom',      label: '✏️ Custom' },
    ];
    for (const tab of tabDefs) {
      const btn = Utils.createEl('button', `tab-btn ${this.activeTab === tab.id ? 'active' : ''}`, tab.label);
      btn.onclick = () => { this.activeTab = tab.id; this.render(); };
      tabs.appendChild(btn);
    }
    container.appendChild(tabs);

    // ── Content ────────────────────────────────────────────────
    const content = Utils.createEl('div', 'panel-content');
    if (this.activeTab === 'disasters') this._renderDisasters(content);
    else if (this.activeTab === 'technology') this._renderTechnology(content);
    else if (this.activeTab === 'movements') this._renderMovements(content);
    else if (this.activeTab === 'resources') this._renderResources(content);
    else if (this.activeTab === 'warming') this._renderWarming(content);
    else if (this.activeTab === 'religion') this._renderReligion(content);
    else if (this.activeTab === 'horizons')   this._renderHorizons(content);
    else if (this.activeTab === 'alien')      this._renderAlienContact(content);
    else if (this.activeTab === 'extinction') this._renderExtinction(content);
    else if (this.activeTab === 'works')      this._renderPublicWorks(content);
    else if (this.activeTab === 'diplomacy')  this._renderDiplomacy(content);
    else if (this.activeTab === 'leadership') this._renderLeadership(content);
    else if (this.activeTab === 'migration')  this._renderMigration(content);
    else if (this.activeTab === 'slavery')    this._renderSlavery(content);
    else if (this.activeTab === 'crime')      this._renderCrime(content);
    else if (this.activeTab === 'policy')     this._renderPolicyActions(content);
    else if (this.activeTab === 'economy')    this._renderEconomy(content);
    else if (this.activeTab === 'custom')     this._renderCustomEvent(content);
    container.appendChild(content);
  }

  _renderDisasters(content) {
    const era = Utils.getEra(this.game.currentYear);

    const title = Utils.createEl('div', 'section-title', '🌊 Natural Disasters');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Disasters test how your civilization\'s structure responds to external shocks. Different paradigms produce very different outcomes.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');

    for (const [key, disaster] of Object.entries(DISASTER_TYPES)) {
      // Filter era-relevant disasters
      if (disaster.eraRelevance !== 'all' && disaster.eraRelevance !== 'ancient' && era.techLevel > 5) continue;

      const card = this._createEventCard(
        disaster.icon + ' ' + disaster.label,
        disaster.description,
        [{
          label: 'Introduce',
          action: () => this._applyDisaster(key),
          cls: 'btn-danger',
        }]
      );

      // Severity selector
      const severityWrap = Utils.createEl('div', 'severity-wrap');
      severityWrap.innerHTML = `
        <label>Severity:</label>
        <select id="sev-${key}">
          <option value="mild">Mild</option>
          <option value="moderate" selected>Moderate</option>
          <option value="severe">Severe</option>
        </select>
      `;
      card.appendChild(severityWrap);
      grid.appendChild(card);
    }
    content.appendChild(grid);

    // ── Neighboring Plague Response ──────────────────────────────
    // If any targeted civ has pending plague responses, show response panel.
    const targetCivIds = this._getTargetCivs() || this.game.civilizations.map(c => c.id);
    const targetCivs   = this.game.civilizations.filter(c => targetCivIds.includes(c.id));

    const pendingResponses = [];
    for (const civ of targetCivs) {
      if (!civ.state.plagueResponses) continue;
      for (const [otherId, prs] of Object.entries(civ.state.plagueResponses)) {
        if (prs.response !== 'resolved') pendingResponses.push({ civ, otherId, prs });
      }
    }

    if (pendingResponses.length > 0) {
      const plagueTitle = Utils.createEl('div', 'section-title', '☠️ Neighboring Plague — Choose Response');
      plagueTitle.style.marginTop = '24px';
      content.appendChild(plagueTitle);
      const plagueDesc = Utils.createEl('p', 'section-desc',
        'A plague is active in a neighboring civilization. Your response will be applied within 3 turns and affects both your civilization\'s stats and your risk of the disease spreading to you.');
      content.appendChild(plagueDesc);

      const RESPONSE_OPTIONS = [
        { id: 'quarantine', label: '🔒 Quarantine Borders', desc: 'Stability +6, Cooperation −8. Spread risk ×0.22 — strong protection.' },
        { id: 'aid',        label: '🏥 Send Aid',           desc: 'Cooperation +6, Stability −3, Wellbeing −2. Spread risk ×0.82 — awareness helps slightly.' },
        { id: 'refugees',   label: '🚪 Accept Refugees',    desc: 'Cooperation +10, Wellbeing −4. Spread risk ×1.60 — humanitarian but risky.' },
        { id: 'ignore',     label: '🙈 Ignore',             desc: 'No stat effects. Spread risk ×1.00 — baseline risk.' },
      ];

      for (const { civ, otherId, prs } of pendingResponses) {
        const turnsLeft = Math.max(0, 3 - (prs.turnsWaited || 0));
        const chosen    = prs.response || null;

        const block = Utils.createEl('div', '');
        block.style.cssText = 'border:1px solid #e74c3c33;padding:12px;margin-bottom:12px;border-radius:6px;background:#1a0a0a;';

        const blockTitle = Utils.createEl('div', '');
        blockTitle.style.cssText = 'font-weight:bold;color:#e74c3c;margin-bottom:4px;';
        blockTitle.textContent = `☠️ Plague in ${prs.affectedCivName} — ${civ.name}'s Response`;
        block.appendChild(blockTitle);

        const blockMeta = Utils.createEl('div', '');
        blockMeta.style.cssText = 'color:#888;font-size:0.82em;margin-bottom:10px;';
        blockMeta.textContent = chosen
          ? `Current: ${chosen.charAt(0).toUpperCase() + chosen.slice(1)} · ${turnsLeft} turn${turnsLeft === 1 ? '' : 's'} until resolution`
          : `No response chosen yet · ${turnsLeft} turn${turnsLeft === 1 ? '' : 's'} until resolution (default: Ignore)`;
        block.appendChild(blockMeta);

        const btnRow = Utils.createEl('div', '');
        btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;';
        for (const opt of RESPONSE_OPTIONS) {
          const isChosen = chosen === opt.id;
          const btn = document.createElement('button');
          btn.className = isChosen ? 'btn btn-success' : 'btn btn-secondary';
          btn.textContent = opt.label;
          btn.title = opt.desc;
          btn.style.cssText = 'font-size:0.82em;padding:5px 12px;';
          btn.onclick = () => this._setPlagueResponse(civ.id, otherId, opt.id);
          btnRow.appendChild(btn);
        }
        block.appendChild(btnRow);

        const descNote = Utils.createEl('div', '');
        descNote.style.cssText = 'color:#777;font-size:0.79em;';
        descNote.textContent = RESPONSE_OPTIONS.find(o => o.id === (chosen || 'ignore'))?.desc || '';
        block.appendChild(descNote);

        content.appendChild(block);
      }
    }
  }

  _setPlagueResponse(civId, affectedCivId, response) {
    const civ = this.game.civilizations.find(c => c.id === civId);
    if (!civ?.state?.plagueResponses?.[affectedCivId]) return;
    civ.state.plagueResponses[affectedCivId].response = response;
    this.render();
  }

  _applyDisaster(disasterKey) {
    const disaster = DISASTER_TYPES[disasterKey];
    const sevEl = Utils.el(`sev-${disasterKey}`);
    const severity = sevEl ? sevEl.value : 'moderate';
    const severityMultipliers = { mild: 0.5, moderate: 1.0, severe: 2.0 };
    const mult = severityMultipliers[severity] || 1.0;

    const duration = Utils.rand(...disaster.duration);
    const targetCivs = this._getTargetCivs();

    this.game.simulation.applyExternalEvent({
      type: 'disaster',
      label: disaster.label,
      description: `A ${severity} ${disaster.label.toLowerCase()} has struck.`,
      fertilityCost: disaster.fertilityCost * mult,
      populationRisk: disaster.populationRisk * mult,
      duration,
    }, targetCivs);

    this._showNotification(`${disaster.icon} ${disaster.label} (${severity}) has begun!`);
    this.render();
  }

  _renderTechnology(content) {
    const era = Utils.getEra(this.game.currentYear);
    const title = Utils.createEl('div', 'section-title', '⚙️ Technological Advances');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Introduce a technology. Note: whether a civilization adopts it depends on its values — a high-warming technology may be rejected by eco-conscious civilizations.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');

    for (const [catKey, cat] of Object.entries(TECH_CATEGORIES)) {
      const catTitle = Utils.createEl('div', 'category-title', cat.label);
      grid.appendChild(catTitle);

      for (const advance of cat.advances) {
        const techEra = ERAS.find(e => e.id === advance.era);
        const available = techEra && techEra.techLevel <= era.techLevel + 2;

        const effects = Object.entries(advance.effect || {})
          .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
          .join(' | ');

        const card = this._createEventCard(
          '⚙️ ' + advance.name,
          effects,
          [{
            label: available ? 'Introduce' : `Requires ${advance.era} era`,
            action: available ? () => this._applyTechnology(advance) : null,
            cls: available ? 'btn-primary' : 'btn-disabled',
          }]
        );
        grid.appendChild(card);
      }
    }
    content.appendChild(grid);
  }

  _applyTechnology(tech) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'technology',
      techName: tech.name,
      label: `Technology: ${tech.name}`,
      description: `${tech.name} has been introduced.`,
    }, targetCivs);
    this._showNotification(`⚙️ ${tech.name} introduced!`);
    this.render();
  }

  _renderMovements(content) {
    const title = Utils.createEl('div', 'section-title', '💡 Movements & Philosophies');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Introduce a new idea, philosophy, or social movement. Its success depends on whether the civilization\'s current reinforcement structure allows it to spread.');
    content.appendChild(desc);

    const PRESET_MOVEMENTS = [
      {
        name: 'Cooperative Movement',
        description: 'A grassroots movement advocating voluntary cooperation and mutual aid.',
        behaviorModifiers: { cooperation: +20, mutualAid: +15, acquisitiveness: -10 },
        icon: '🤝',
      },
      {
        name: 'Liberation Philosophy',
        description: 'A philosophy emphasizing individual freedom, dignity, and resistance to oppression.',
        behaviorModifiers: { deference: -20, individualism: +15, innovation: +10 },
        icon: '✊',
      },
      {
        name: 'Ecological Movement',
        description: 'A movement advocating harmony with nature and sustainable practices.',
        behaviorModifiers: { acquisitiveness: -15, cooperation: +10, conformity: -5 },
        icon: '🌿',
      },
      {
        name: 'Enlightenment Philosophy',
        description: 'Reason, skepticism, and questioning of traditional authority.',
        behaviorModifiers: { innovation: +25, deference: -15, conformity: -10 },
        icon: '💡',
      },
      {
        name: 'Collectivist Ideal',
        description: 'A vision of society organized around collective ownership and shared responsibility.',
        behaviorModifiers: { collectivism: +20, mutualAid: +15, acquisitiveness: -15 },
        icon: '🌐',
      },
      {
        name: 'Rights Movement',
        description: 'A movement advocating for the rights of a marginalized group.',
        behaviorModifiers: { empathy: +20, cooperation: +10, deference: -10 },
        icon: '⚖️',
      },
      {
        name: 'Authoritarian Ideology',
        description: 'A philosophy that order, strength, and centralized control are paramount.',
        behaviorModifiers: { deference: +25, conformity: +20, innovation: -15, empathy: -10 },
        icon: '🏛️',
      },
      {
        name: 'Prosperity Doctrine',
        description: 'A belief that individual accumulation is a virtue and a mark of worth.',
        behaviorModifiers: { acquisitiveness: +20, competition: +15, mutualAid: -10 },
        icon: '💰',
      },
      {
        name: 'Religious Cult',
        description: '⚠️ A high-control religious group emerges — demanding total devotion, enforcing conformity, punishing dissent. Spreads through fear and certainty.',
        behaviorModifiers: { conformity: +25, deference: +20, innovation: -20, empathy: -15, mutualAid: -10 },
        icon: '🔮',
        type: 'cult_rise',
        warning: true,
      },
      {
        name: 'Personality Cult',
        description: '⚠️ A political or ideological cult forms around a single leader figure. Absolute loyalty is demanded; independent thought is treated as betrayal.',
        behaviorModifiers: { conformity: +25, deference: +25, innovation: -15, empathy: -10, acquisitiveness: +10 },
        icon: '👁️',
        type: 'cult_rise',
        warning: true,
      },
    ];

    const grid = Utils.createEl('div', 'event-grid');
    for (const movement of PRESET_MOVEMENTS) {
      const effects = Object.entries(movement.behaviorModifiers)
        .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
        .join(' | ');
      const card = this._createEventCard(
        movement.icon + ' ' + movement.name,
        movement.description + '\n' + effects,
        [{
          label: 'Introduce',
          action: () => this._applyMovement(movement),
          cls: movement.warning ? 'btn-danger' : 'btn-primary',
        }]
      );
      if (movement.warning) card.style.borderColor = 'var(--danger, #c0392b)';
      grid.appendChild(card);
    }

    // Custom movement
    const customSection = Utils.createEl('div', 'custom-section');
    customSection.innerHTML = `
      <h4>Custom Movement</h4>
      <input type="text" id="movement-name" placeholder="Movement name" />
      <textarea id="movement-desc" placeholder="Description"></textarea>
      <div class="behavior-sliders" id="movement-behavior-sliders"></div>
    `;
    const applyBtn = Utils.createEl('button', 'btn btn-primary', 'Introduce Custom Movement');
    applyBtn.onclick = () => this._applyCustomMovement();
    customSection.appendChild(applyBtn);
    grid.appendChild(customSection);

    content.appendChild(grid);
  }

  _applyMovement(movement) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'movement',
      historyType: movement.type || 'movement',   // cult_rise overrides history type for filtering
      name: movement.name,
      description: movement.description,
      label: `New Movement: ${movement.name}`,
      behaviorModifiers: movement.behaviorModifiers,
    }, targetCivs);
    this._showNotification(`${movement.icon} ${movement.name} has emerged!`);
    this.render();
  }

  _applyCustomMovement() {
    const name = Utils.el('movement-name')?.value || 'New Movement';
    const desc = Utils.el('movement-desc')?.value || '';
    this.game.simulation.applyExternalEvent({
      type: 'movement',
      name,
      description: desc,
      label: `New Movement: ${name}`,
      behaviorModifiers: {},
    }, this._getTargetCivs());
    this._showNotification(`💡 ${name} has emerged!`);
    this.render();
  }

  _renderResources(content) {
    const title = Utils.createEl('div', 'section-title', '💎 New Resource Discovery');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Introduce a previously unknown resource. How the civilization responds depends entirely on its values — a market economy may exploit it very differently from a gift economy.');
    content.appendChild(desc);

    const RESOURCES = [
      { id: 'fertile_land', name: 'Fertile Valley Discovered', icon: '🌾', fertilityBonus: 4, description: 'A previously unknown fertile valley has been found.' },
      { id: 'iron_ore', name: 'Iron Ore Vein', icon: '⛏️', fertilityBonus: 0, description: 'A rich vein of iron ore has been discovered.' },
      { id: 'freshwater', name: 'Freshwater Spring', icon: '💧', fertilityBonus: 3, description: 'A reliable freshwater spring has been found in an arid region.' },
      { id: 'medicinal', name: 'Medicinal Plants', icon: '🌿', fertilityBonus: 1, description: 'A cache of powerful medicinal plants has been discovered.' },
      { id: 'oil_deposit', name: 'Oil Deposit', icon: '🛢️', fertilityBonus: 0, description: 'A large oil deposit has been found beneath the surface.' },
      { id: 'rare_minerals', name: 'Rare Minerals', icon: '💎', fertilityBonus: 0, description: 'Deposits of rare and valuable minerals have been discovered.' },
      { id: 'ancient_site', name: 'Ancient Knowledge Site', icon: '📜', fertilityBonus: 0, description: 'An ancient site containing knowledge and artifacts has been uncovered.' },
      { id: 'coastal_fish', name: 'Rich Fishing Grounds', icon: '🐟', fertilityBonus: 2, description: 'Exceptionally rich fishing grounds have been discovered offshore.' },
    ];

    const grid = Utils.createEl('div', 'event-grid');
    for (const res of RESOURCES) {
      const card = this._createEventCard(
        res.icon + ' ' + res.name,
        res.description,
        [{
          label: 'Discover',
          action: () => {
            this.game.simulation.applyExternalEvent({
              type: 'resource',
              resourceId: res.id,
              resourceName: res.name,
              resourceIcon: res.icon,
              fertilityBonus: res.fertilityBonus,
              label: `Resource: ${res.name}`,
              description: res.description,
            }, this._getTargetCivs());
            this._showNotification(`${res.icon} ${res.name} discovered!`);
          },
          cls: 'btn-secondary',
        }]
      );
      grid.appendChild(card);
    }
    content.appendChild(grid);
  }

  _renderWarming(content) {
    const warmingIndex = this.game.simulation.globalWarmingIndex;
    const title = Utils.createEl('div', 'section-title', '🌡️ Climate & Global Warming');
    content.appendChild(title);

    const sim = this.game.simulation;
    const tempAnomaly = Math.round((sim.surfaceTemp ?? 0) * 100) / 100;
    const co2ppm = Math.round(280 + (sim.atmosphericCO2 ?? 0));

    const statusSection = Utils.createEl('div', 'warming-status');
    statusSection.innerHTML = `
      <div class="warming-meter">
        <div class="warming-label">Global Warming Index</div>
        <div class="warming-bar-wrap">
          <div class="warming-bar" style="width:${warmingIndex}%; background: ${this._warmingColor(warmingIndex)}"></div>
        </div>
        <div class="warming-value">${Math.round(warmingIndex)}/100</div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.85em;margin:6px 0;">
        <span>Temperature: <strong>+${tempAnomaly}°C</strong></span>
        <span>CO₂: <strong>${co2ppm} ppm</strong> ${co2ppm > 280 ? `(+${co2ppm - 280})` : ''}</span>
      </div>
      <div class="warming-status-text">${this._warmingStatusText(warmingIndex)}</div>
      ${sim._tippingPermafrost ? '<div class="crisis-badge" style="background:#e67e22;color:#fff;border-color:#e67e22">⚠ PERMAFROST THAW</div>' : ''}
      ${sim._tippingIceSheets ? '<div class="crisis-badge" style="background:#e74c3c;color:#fff;border-color:#e74c3c">⚠ ICE SHEETS DESTABILIZED</div>' : ''}
      ${sim._tippingAMOC ? '<div class="crisis-badge" style="background:#c0392b;color:#fff;border-color:#c0392b">⚠ ATLANTIC CIRCULATION COLLAPSED</div>' : ''}
      ${sim._tippingHothouse ? '<div class="crisis-badge" style="background:#8e44ad;color:#fff;border-color:#8e44ad">⚠ HOTHOUSE EARTH</div>' : ''}
      ${sim.climateTippingPoint && !sim._tippingPermafrost ? '<div class="crisis-badge">⚠ TIPPING POINT REACHED</div>' : ''}
    `;
    content.appendChild(statusSection);

    const desc = Utils.createEl('p', 'section-desc',
      'Climate model based on Nordhaus DICE (2017). Emissions accumulate as atmospheric CO₂, driving radiative forcing and temperature rise with ocean thermal lag. Tipping points trigger at 1.5°C (permafrost), 2°C (ice sheets), 3.5°C (AMOC), 5°C (hothouse). Damages follow quadratic function.');
    content.appendChild(desc);

    const actions = Utils.createEl('div', 'event-grid');

    // Industrial revolution trigger
    const indCard = this._createEventCard(
      '🏭 Trigger Industrial Revolution',
      'Introduce industrial technology across civilizations. Dramatically boosts production but begins warming accumulation.',
      [{
        label: 'Trigger',
        action: () => {
          for (const civ of this.game.civilizations) {
            civ.state.technologyLevel = Math.max(civ.state.technologyLevel, 8);
          }
          this.game.simulation.globalWarmingIndex = Math.max(this.game.simulation.globalWarmingIndex, 10);
          this.game.map.applyGlobalWarming(this.game.simulation.globalWarmingIndex);
          this._showNotification('🏭 Industrial Revolution triggered! Warming has begun.');
          this.render();
        },
        cls: 'btn-warning',
      }]
    );
    actions.appendChild(indCard);

    // Climate accord
    const accordCard = this._createEventCard(
      '🌿 Introduce Climate Accord',
      'A cooperative agreement to reduce emissions. Success depends heavily on whether civilization values support collective action.',
      [{
        label: 'Introduce',
        action: () => {
          this.game.simulation.applyExternalEvent({
            type: 'movement',
            name: 'Climate Accord',
            description: 'A civilization-wide commitment to reduce warming contributions.',
            label: 'Climate Accord',
            behaviorModifiers: { cooperation: +10, acquisitiveness: -5 },
          });
          this.game.simulation.globalWarmingIndex = Math.max(0, this.game.simulation.globalWarmingIndex - 5);
          this._showNotification('🌿 Climate Accord introduced!');
          this.render();
        },
        cls: 'btn-success',
      }]
    );
    actions.appendChild(accordCard);

    // Manual warming slider
    const manualCard = Utils.createEl('div', 'event-card');
    manualCard.innerHTML = `
      <div class="event-card-title">🌡️ Adjust Warming Index Directly</div>
      <input type="range" id="warming-slider" min="0" max="100" value="${Math.round(warmingIndex)}" />
      <span id="warming-slider-val">${Math.round(warmingIndex)}</span>
    `;
    const applyBtn = Utils.createEl('button', 'btn btn-warning', 'Apply');
    applyBtn.onclick = () => {
      const val = parseInt(Utils.el('warming-slider').value);
      this.game.simulation.globalWarmingIndex = val;
      this.game.map.applyGlobalWarming(val);
      this._showNotification(`🌡️ Warming index set to ${val}`);
      this.render();
    };
    manualCard.appendChild(applyBtn);

    const slider = manualCard.querySelector('#warming-slider');
    if (slider) slider.oninput = () => {
      const valEl = Utils.el('warming-slider-val');
      if (valEl) valEl.textContent = slider.value;
    };

    actions.appendChild(manualCard);
    content.appendChild(actions);
  }

  _warmingColor(index) {
    if (index < 20) return '#00d4aa';
    if (index < 40) return '#a8d800';
    if (index < 60) return '#f0a020';
    if (index < 80) return '#f06020';
    return '#cc2020';
  }

  _warmingStatusText(index) {
    if (index < 10) return 'Pre-industrial. Climate is stable.';
    if (index < 25) return 'Early industrial warming. Effects are beginning.';
    if (index < 50) return 'Significant warming. Agricultural impacts in vulnerable regions.';
    if (index < 70) return 'Severe warming. Coastal flooding, droughts, migration pressures.';
    if (index < 85) return 'Critical levels. Ecosystem collapse in many regions.';
    return 'Catastrophic. Civilization viability is threatened in many areas.';
  }

  _renderReligion(content) {
    const title = Utils.createEl('div', 'section-title', '✨ Introduce New Religion');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Introduce a new religion or spiritual movement. Whether it spreads depends on the civilization\'s values, governance, and existing religious landscape.');
    content.appendChild(desc);

    const form = Utils.createEl('div', 'religion-form');
    form.innerHTML = `
      <div class="form-group">
        <label>Religion Name</label>
        <input type="text" id="new-rel-name" placeholder="e.g., The Path of Harmony" />
      </div>
      <div class="form-group">
        <label>Core Description</label>
        <textarea id="new-rel-desc" placeholder="What does this faith teach?"></textarea>
      </div>
      <div class="form-group">
        <label>Propagation Style</label>
        <select id="new-rel-prop">
          ${Object.entries(RELIGION_PROPAGATION).map(([k, v]) => `<option value="${k}">${v.label} — ${v.description}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Tolerance of Other Faiths</label>
        <select id="new-rel-tol">
          ${Object.entries(RELIGION_TOLERANCE).map(([k, v]) => `<option value="${k}">${v.label} — ${v.description}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Attitude Toward Accumulation/Wealth</label>
        <select id="new-rel-econ">
          <option value="neutral">Neutral</option>
          <option value="critical">Critical (encourages sharing, discourages hoarding)</option>
          <option value="endorsing">Endorsing (wealth as sign of virtue)</option>
        </select>
      </div>
    `;
    const applyBtn = Utils.createEl('button', 'btn btn-primary', '✨ Introduce This Religion');
    applyBtn.onclick = () => this._applyNewReligion();
    form.appendChild(applyBtn);
    content.appendChild(form);
  }

  _applyNewReligion() {
    const name = Utils.el('new-rel-name')?.value || 'New Faith';
    const desc = Utils.el('new-rel-desc')?.value || '';
    const propagation = Utils.el('new-rel-prop')?.value || 'passive';
    const tolerance = Utils.el('new-rel-tol')?.value || 'indifferent';
    const econ = Utils.el('new-rel-econ')?.value || 'neutral';

    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'new_religion',
      label: `New Religion: ${name}`,
      description: desc || `${name} has emerged.`,
      religionConfig: { name, description: desc, propagationStyle: propagation, toleranceLevel: tolerance, economicAttitude: econ, adherentPercentage: 8, fervorLevel: 60 },
    }, targetCivs);
    this._showNotification(`✨ ${name} has emerged!`);
    this.render();
  }

  // ── Alien Contact ─────────────────────────────────────────────
  _renderAlienContact(content) {
    const era    = Utils.getEra(this.game.currentYear);
    const techLvl = era ? era.techLevel : 1;
    const available = techLvl >= 10;

    const title = Utils.createEl('div', 'section-title', '🛸 Alien Contact');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Introduce evidence of extraterrestrial intelligence. Contact unfolds in phases — a signal is detected before it can be confirmed, and confirmation reshapes everything. Each phase has significant effects on stability, innovation, and social cohesion. These events can also emerge naturally in the Contemporary and Future eras.');
    content.appendChild(desc);

    if (!available) {
      const notice = Utils.createEl('p', 'section-desc',
        `⚠ Alien contact events require the Contemporary era (tech level 10+). Current tech level: ${techLvl}.`);
      notice.style.color = 'var(--accent)';
      content.appendChild(notice);
      return;
    }

    const targetCivs = this._getTargetCivs;

    // Check current state of targeted civs
    const civs = this.game.civilizations;
    const checkCivs = targetCivs ? civs.filter(c => (this._getTargetCivs() || [c.id]).includes(c.id)) : civs;
    const anyHasSignal    = checkCivs.some(c => c.history.some(h => h.type === 'alien_signal'));
    const anyHasConfirmed = checkCivs.some(c => c.history.some(h => h.type === 'alien_contact'));

    const grid = Utils.createEl('div', 'event-grid');

    // Phase 1a: Anomalous signal
    const signalCard = this._createEventCard(
      '📡 Anomalous Signal Detected',
      'A structured signal of unknown origin is detected — ambiguous enough to be dismissed as instrument error, significant enough that it cannot be. Boosts innovation; slight stability dip from uncertainty.',
      [{
        label: anyHasSignal ? 'Already detected' : 'Introduce Signal',
        action: anyHasSignal ? null : () => this._applyAlienEvent('signal'),
        cls: anyHasSignal ? 'btn-disabled' : 'btn-primary',
      }]
    );
    grid.appendChild(signalCard);

    // Phase 1b: Confirmed contact
    const confirmCard = this._createEventCard(
      '🛸 Signal Confirmed — First Contact',
      'Independent verification confirms the signal is of non-natural, non-human origin. The most significant event in the civilization\'s history. Major innovation boost; destabilizes social cohesion. Requires a prior signal event.',
      [{
        label: anyHasConfirmed
          ? 'Already confirmed'
          : !anyHasSignal
            ? 'Detect signal first'
            : 'Confirm Contact',
        action: (anyHasSignal && !anyHasConfirmed) ? () => this._applyAlienEvent('contact') : null,
        cls: (anyHasSignal && !anyHasConfirmed) ? 'btn-warning' : 'btn-disabled',
      }]
    );
    grid.appendChild(confirmCard);

    content.appendChild(grid);

    // ── Phase 2: Response Protocol ────────────────────────────
    if (anyHasConfirmed) {
      const RESPONSE_TYPES = ALIEN_RESPONSE_PROTOCOLS.map(p => p.id);
      const chosenProtocol = checkCivs.reduce((found, c) => {
        if (found) return found;
        return c.history.find(h => RESPONSE_TYPES.includes(h.type)) || null;
      }, null);
      const chosenType = chosenProtocol ? chosenProtocol.type : null;

      // Check live alienContactState for current protocol (may have been switched)
      const liveAcs = checkCivs[0]?.state?.alienContactState;
      const activeProtocol = liveAcs?.protocol || chosenType;
      const contactStage   = liveAcs?.stage || 'confirmed';
      const contactEnded   = contactStage === 'ended_hostile';

      // ── Contact Ended ───────────────────────────────────────
      if (contactEnded) {
        const endedTitle = Utils.createEl('div', 'section-title', '🛸 Contact Status');
        endedTitle.style.marginTop = '20px';
        content.appendChild(endedTitle);
        const endedMsg = Utils.createEl('p', 'section-desc',
          '⚠️ Contact has ended in hostile withdrawal. The alien intelligence has ceased communication. No further protocol changes are possible.');
        endedMsg.style.color = '#e74c3c';
        content.appendChild(endedMsg);
        return;
      }

      const responseTitle = Utils.createEl('div', 'section-title', '📋 Response Protocol');
      responseTitle.style.marginTop = '20px';
      content.appendChild(responseTitle);

      // ── Ongoing: show active protocol + switch options ──────
      const isOngoing = contactStage === 'ongoing';
      const responseDesc = Utils.createEl('p', 'section-desc',
        activeProtocol && !isOngoing
          ? `A response protocol has been adopted. You can see its effects in the History panel.`
          : activeProtocol && isOngoing
            ? `Contact is ongoing. Your current protocol shapes the relationship trajectory each turn. You may switch protocols — but rapid changes carry relationship costs.`
            : `Contact is confirmed. Choose how your civilization responds. This decision shapes innovation, cooperation, stability, and wellbeing.`);
      content.appendChild(responseDesc);

      // Aggression index for switch-cost preview
      const AGGRESSION = { alien_response_open: 4, alien_response_diplomatic: 3, alien_response_study: 2, alien_response_quarantine: 1, alien_response_military: 0 };

      const protocolGrid = Utils.createEl('div', 'event-grid');
      for (const protocol of ALIEN_RESPONSE_PROTOCOLS) {
        const isActive  = activeProtocol === protocol.id;
        const canSwitch = isOngoing && activeProtocol && !isActive;
        const isBlocked = !!activeProtocol && !isActive && !isOngoing;

        let switchNote = '';
        if (canSwitch && activeProtocol) {
          const curAgg = AGGRESSION[activeProtocol] ?? 2;
          const newAgg = AGGRESSION[protocol.id]    ?? 2;
          const delta  = (newAgg - curAgg) * 4;
          switchNote = delta > 0 ? `\n↑ Relationship +${delta} on switch`
                     : delta < 0 ? `\n↓ Relationship ${delta} on switch`
                     : '\n→ Neutral relationship impact';
        }

        const card = this._createEventCard(
          protocol.icon + ' ' + protocol.label,
          protocol.description + '\n' + protocol.effects
            + (isActive ? '\n✅ Currently active' : '')
            + switchNote,
          [{
            label: isActive
              ? (isOngoing ? 'Active Protocol' : 'Adopted')
              : isBlocked ? 'Protocol locked'
              : canSwitch ? 'Switch to This Protocol'
              : 'Adopt Protocol',
            action: canSwitch
              ? () => this._applyAlienEvent('switch', protocol.id)
              : (!activeProtocol ? () => this._applyAlienEvent('response', protocol.id) : null),
            cls: isActive ? 'btn-success' : (isBlocked ? 'btn-disabled' : 'btn-primary'),
          }]
        );
        protocolGrid.appendChild(card);
      }
      content.appendChild(protocolGrid);
    } else {
      const status = Utils.createEl('p', 'section-desc');
      status.style.marginTop = '12px';
      status.innerHTML = anyHasSignal
        ? '📡 <strong>Status:</strong> Signal detected. Confirm contact to unlock response protocols.'
        : '';
      if (anyHasSignal) content.appendChild(status);
    }
  }

  _applyAlienEvent(phase, protocolId) {
    const targetCivs = this._getTargetCivs();
    if (phase === 'signal') {
      this.game.simulation.applyExternalEvent({
        type: 'alien_signal',
        label: 'Anomalous Signal Detected',
        description: 'Sensors have detected a structured signal of unknown origin that cannot be explained by any known natural phenomenon. Preliminary analysis is underway.',
        historyType: 'alien_signal',
      }, targetCivs);
      this._showNotification('📡 Anomalous signal detected! Investigation underway.');
    } else if (phase === 'contact') {
      this.game.simulation.applyExternalEvent({
        type: 'alien_contact',
        label: 'Alien Signal Confirmed',
        description: 'Multiple independent verification systems have confirmed that the detected signal is of non-natural, non-human origin. First contact has been established. The nature, location, and intent of the senders remain unknown.',
        historyType: 'alien_contact',
      }, targetCivs);
      this._showNotification('🛸 First contact confirmed! Everything has changed.');
    } else if (phase === 'response' && protocolId) {
      const proto = ALIEN_RESPONSE_PROTOCOLS.find(p => p.id === protocolId);
      if (!proto) return;
      const PROTOCOL_TITLES = {
        alien_response_open:       'Open Contact Protocol Adopted',
        alien_response_study:      'Scientific Study Protocol Adopted',
        alien_response_quarantine: 'Information Quarantine Implemented',
        alien_response_military:   'Military Response Posture Adopted',
        alien_response_diplomatic: 'Diplomatic Outreach Protocol Adopted',
      };
      const PROTOCOL_DESCS = {
        alien_response_open:       'The civilization has adopted full public disclosure and active two-way communication attempts with the alien intelligence.',
        alien_response_study:      'Contact data has been centralized within scientific institutions. Communication is being attempted through mathematical and physical frameworks.',
        alien_response_quarantine: 'The governing authority has classified the contact event. Public knowledge is restricted and the response is managed internally.',
        alien_response_military:   'The civilization has adopted a military posture — treating contact as a potential existential threat and directing resources toward defense and contingency.',
        alien_response_diplomatic: 'Formal diplomatic protocols have been established. Structured, deliberate communication is being attempted through carefully designed neutral frameworks.',
      };
      this.game.simulation.applyExternalEvent({
        type: 'alien_response',
        protocol: protocolId,
        label: PROTOCOL_TITLES[protocolId] || 'Response Protocol Adopted',
        description: PROTOCOL_DESCS[protocolId] || '',
        historyType: protocolId,
      }, targetCivs);
      this._showNotification(`${proto.icon} ${proto.label} adopted!`);
    } else if (phase === 'switch' && protocolId) {
      // Protocol switch during ongoing contact — routed directly to simulation
      const civIds = targetCivs || this.game.civilizations.map(c => c.id);
      for (const civ of this.game.civilizations.filter(c => civIds.includes(c.id))) {
        this.game.simulation._applyProtocolSwitch(civ, protocolId);
      }
      const proto = ALIEN_RESPONSE_PROTOCOLS.find(p => p.id === protocolId);
      this._showNotification(`📋 Protocol switched to ${proto ? proto.label : protocolId}.`);
    }
    this.render();
  }

  // ── Extinction-Level Events ───────────────────────────────────
  _renderExtinction(content) {
    const era     = Utils.getEra(this.game.currentYear);
    const techLvl = era ? era.techLevel : 1;

    const title = Utils.createEl('div', 'section-title', '☄️ Extinction-Level Events');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Catastrophic events that reshape or devastate a civilization. Effects are severe and immediate. Use to stress-test a civilization or simulate historical catastrophes.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');
    for (const evt of EXTINCTION_EVENT_TYPES) {
      const available = techLvl >= evt.minTech && techLvl <= evt.maxTech;
      const unavailableReason = !available
        ? (techLvl < evt.minTech ? `Requires Tech Level ${evt.minTech}` : `Not applicable beyond Tech Level ${evt.maxTech}`)
        : null;

      const effParts = [];
      if (evt.effects.stabilityDelta)   effParts.push(`Stability ${evt.effects.stabilityDelta > 0 ? '+' : ''}${evt.effects.stabilityDelta}`);
      if (evt.effects.wellbeingDelta)   effParts.push(`Wellbeing ${evt.effects.wellbeingDelta > 0 ? '+' : ''}${evt.effects.wellbeingDelta}`);
      if (evt.effects.fertilityDelta)   effParts.push(`Fertility ${evt.effects.fertilityDelta > 0 ? '+' : ''}${evt.effects.fertilityDelta}`);
      if (evt.effects.innovationDelta)  effParts.push(`Innovation ${evt.effects.innovationDelta > 0 ? '+' : ''}${evt.effects.innovationDelta}`);
      if (evt.effects.cooperationDelta) effParts.push(`Cooperation ${evt.effects.cooperationDelta > 0 ? '+' : ''}${evt.effects.cooperationDelta}`);

      const cardDesc = evt.description
        + (effParts.length ? '\n' + effParts.join(' | ') : '')
        + (unavailableReason ? `\n⚠ ${unavailableReason}` : '');

      grid.appendChild(this._createEventCard(
        `${evt.icon} ${evt.label}`,
        cardDesc,
        [{
          label: available ? 'Trigger Event' : 'Not available',
          action: available ? () => this._applyExtinction(evt) : null,
          cls: available ? 'btn-danger' : 'btn-disabled',
        }]
      ));
    }
    content.appendChild(grid);
  }

  _applyExtinction(evt) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'extinction',
      extinctionId: evt.id,
      label: evt.label,
      description: evt.description,
      effects: evt.effects,
      historyType: evt.id,
    }, targetCivs);
    this._showNotification(`${evt.icon} ${evt.label}!`);
    this.render();
  }

  // ── Diplomacy ─────────────────────────────────────────────────
  _renderDiplomacy(content) {
    const civs = this.game.civilizations;
    const playerCiv = civs.find(c => c.isPlayerCiv);

    const title = Utils.createEl('div', 'section-title', '🤝 Diplomacy');
    content.appendChild(title);

    if (!playerCiv) {
      content.appendChild(Utils.createEl('p', 'section-desc', 'No player civilization found.'));
      return;
    }

    if (civs.length < 2) {
      content.appendChild(Utils.createEl('p', 'section-desc', 'Diplomacy requires at least two civilizations.'));
      return;
    }

    const desc = Utils.createEl('p', 'section-desc',
      'Manage your relationships with other civilizations. Propose treaties, respond to offers, or break existing agreements. ' +
      'Treaties modify attitude drift each turn and constrain war declarations.');
    content.appendChild(desc);

    const TREATY_LABELS = {
      non_aggression:  '🕊️ Non-Aggression Pact',
      trade_agreement: '📦 Trade Agreement',
      alliance:        '⚔️ Alliance',
    };
    const TREATY_MIN = { non_aggression: 5, trade_agreement: 35, alliance: 60 };
    const TREATY_BONUS = {
      non_aggression:  '+0.3 attitude/turn · prevents war · 15 turns',
      trade_agreement: '+0.4 attitude/turn · +0.3 knowledge/turn · 20 turns',
      alliance:        '+0.8 attitude/turn · +0.3 knowledge/turn · permanent',
    };

    for (const other of civs) {
      if (other.id === playerCiv.id) continue;

      const rel1 = playerCiv.relations.get(other.id) || { attitude: 40, trade: false, war: false, treaty: null };
      const rel2 = other.relations.get(playerCiv.id)  || { attitude: 40, trade: false, war: false, treaty: null };
      const avgAtt = Math.round((rel1.attitude + rel2.attitude) / 2);

      const card = Utils.createEl('div', 'event-card diplomacy-card');
      card.style.cssText = 'margin-bottom:14px;padding:12px 14px;background:#1c2233;border-radius:8px;border:1px solid #2a3a55;';

      // Header row: civ name + status badges
      const header = Utils.createEl('div', '', '');
      header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';

      const civName = Utils.createEl('strong', '', other.name);
      header.appendChild(civName);

      if (rel1.war) {
        const badge = Utils.createEl('span', '', '⚔️ At War');
        badge.style.cssText = 'background:#6b1a1a;color:#ff8080;padding:2px 8px;border-radius:12px;font-size:0.78em;';
        header.appendChild(badge);
      } else if (rel1.treaty) {
        const badge = Utils.createEl('span', '', TREATY_LABELS[rel1.treaty.type] || rel1.treaty.type);
        badge.style.cssText = 'background:#1a3a28;color:#60d080;padding:2px 8px;border-radius:12px;font-size:0.78em;';
        if (rel1.treaty.turnsRemaining !== null) {
          badge.textContent += ` · ${rel1.treaty.turnsRemaining} turns left`;
        }
        header.appendChild(badge);
      } else if (rel1.trade) {
        const badge = Utils.createEl('span', '', '📦 Trading');
        badge.style.cssText = 'background:#1a2a3a;color:#60a0d0;padding:2px 8px;border-radius:12px;font-size:0.78em;';
        header.appendChild(badge);
      }

      card.appendChild(header);

      // Attitude bar
      const attRow = Utils.createEl('div', '', '');
      attRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
      const attLabel = Utils.createEl('span', '', 'Attitude:');
      attLabel.style.cssText = 'font-size:0.82em;color:#8899aa;min-width:60px;';
      attRow.appendChild(attLabel);
      const barWrap = Utils.createEl('div', '', '');
      barWrap.style.cssText = 'flex:1;height:7px;background:#0d1520;border-radius:4px;overflow:hidden;';
      const barFill = Utils.createEl('div', '', '');
      const pct = ((avgAtt + 100) / 200 * 100).toFixed(1);
      const barColor = avgAtt >= 60 ? '#3db86e' : avgAtt >= 20 ? '#c8a030' : '#c03030';
      barFill.style.cssText = `width:${pct}%;height:100%;background:${barColor};`;
      barWrap.appendChild(barFill);
      attRow.appendChild(barWrap);
      const attVal = Utils.createEl('span', '', `${avgAtt > 0 ? '+' : ''}${avgAtt}`);
      attVal.style.cssText = `font-size:0.82em;font-weight:bold;color:${barColor};min-width:36px;text-align:right;`;
      attRow.appendChild(attVal);
      card.appendChild(attRow);

      // Pending AI offer
      if (rel1.pendingOffer && rel1.pendingOffer.type) {
        const offer = rel1.pendingOffer;
        const offerBox = Utils.createEl('div', '', '');
        offerBox.style.cssText = 'background:#1a2e1a;border:1px solid #2a5a2a;border-radius:6px;padding:8px 10px;margin-bottom:10px;';
        const offerLabel = Utils.createEl('div', '', `📬 ${other.name} proposes: ${TREATY_LABELS[offer.type] || offer.type}`);
        offerLabel.style.cssText = 'font-size:0.85em;color:#80d080;margin-bottom:6px;';
        offerBox.appendChild(offerLabel);
        const offerBtns = Utils.createEl('div', '', '');
        offerBtns.style.cssText = 'display:flex;gap:6px;';
        const acceptBtn = Utils.createEl('button', 'event-btn', '✅ Accept');
        acceptBtn.onclick = () => {
          const result = this.game.simulation.proposeTreaty(playerCiv.id, other.id, offer.type);
          rel1.pendingOffer = null;
          if (rel2) rel2.pendingOffer = null;
          if (!result.ok) this._showNotification(`❌ ${result.reason}`);
          this.render();
        };
        const declineBtn = Utils.createEl('button', 'event-btn', '❌ Decline');
        declineBtn.style.cssText = 'opacity:0.7;';
        declineBtn.onclick = () => {
          rel1.pendingOffer = null;
          if (rel2) rel2.pendingOffer = null;
          this._showNotification(`Declined ${other.name}'s proposal.`);
          this.render();
        };
        offerBtns.appendChild(acceptBtn);
        offerBtns.appendChild(declineBtn);
        offerBox.appendChild(offerBtns);
        card.appendChild(offerBox);
      }

      // Actions
      const actionsRow = Utils.createEl('div', '', '');
      actionsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

      if (rel1.treaty) {
        // Break treaty button
        const breakBtn = Utils.createEl('button', 'event-btn', '💔 Break Treaty');
        breakBtn.style.cssText = 'background:#5a1a1a;color:#ff8080;';
        breakBtn.onclick = () => {
          if (!confirm(`Break your ${TREATY_LABELS[rel1.treaty.type] || 'treaty'} with ${other.name}? This will damage relations.`)) return;
          this.game.simulation.breakTreaty(playerCiv.id, other.id);
          this.render();
        };
        actionsRow.appendChild(breakBtn);
      } else if (!rel1.war) {
        // Propose treaty buttons for each eligible type
        for (const [type, label] of Object.entries(TREATY_LABELS)) {
          const minAtt = TREATY_MIN[type];
          const eligible = avgAtt >= minAtt;
          const btn = Utils.createEl('button', 'event-btn', label);
          btn.title = TREATY_BONUS[type];
          if (!eligible) {
            btn.disabled = true;
            btn.style.cssText = 'opacity:0.4;cursor:not-allowed;';
            btn.title += ` · Need attitude ≥ ${minAtt}`;
          }
          btn.onclick = () => {
            const result = this.game.simulation.proposeTreaty(playerCiv.id, other.id, type);
            if (!result.ok) {
              this._showNotification(`❌ ${result.reason}`);
            }
            this.render();
          };
          actionsRow.appendChild(btn);
        }
        // Declare War button
        const warBtn = Utils.createEl('button', 'event-btn', '⚔️ Declare War');
        warBtn.style.cssText = 'background:#5a1a1a;color:#ff8080;';
        warBtn.title = 'Declare war on this civilization. Breaks any existing treaties.';
        warBtn.onclick = () => {
          if (!confirm(`Declare war on ${other.name}? This will break any treaties and cause instability.`)) return;
          // Break treaty if one exists
          if (rel1.treaty) this.game.simulation.breakTreaty(playerCiv.id, other.id);
          // Start war
          this.game.simulation.activeWars.push({
            attacker: playerCiv.id,
            defender: other.id,
            reason: 'player declaration',
            year: this.game.currentYear,
            turns: 0,
          });
          rel1.war = true;
          if (rel2) rel2.war = true;
          rel1.attitude = Math.min(rel1.attitude, -60);
          if (rel2) rel2.attitude = Math.min(rel2.attitude, -60);
          playerCiv.state.atWar = true;
          playerCiv.state.warTurns = 0;
          other.state.atWar = true;
          other.state.warTurns = 0;
          const yr = this.game.currentYear;
          playerCiv.addHistoryEntry(yr, `War Declared on ${other.name}`,
            `${playerCiv.name} has declared war on ${other.name}. Military forces are mobilizing.`, 'war_declared');
          other.addHistoryEntry(yr, `War Declared by ${playerCiv.name}`,
            `${playerCiv.name} has declared war on ${other.name}. The nation prepares to defend itself.`, 'war_declared');
          this.game.ui?.showNotification(`⚔️ War declared on ${other.name}!`, 'danger');
          this.render();
        };
        actionsRow.appendChild(warBtn);
      }

      card.appendChild(actionsRow);

      // Treaty bonus hint
      if (!rel1.treaty && !rel1.war && !rel1.pendingOffer) {
        const hint = Utils.createEl('div', '', 'Hover treaty buttons to see effects.');
        hint.style.cssText = 'font-size:0.75em;color:#445566;margin-top:6px;';
        card.appendChild(hint);
      }

      content.appendChild(card);
    }
  }

  // ── Leadership Panel ──────────────────────────────────────────
  _renderLeadership(content) {
    const civs = this.game.civilizations;
    const civ  = civs.find(c => c.isPlayerCiv) || civs[0];
    const year = this.game.currentYear;

    content.appendChild(Utils.createEl('div', 'section-title', '👑 Leadership & Succession'));
    content.appendChild(Utils.createEl('p', 'section-desc',
      'Monitor the health and stability of leadership. Leadership crises can also arise naturally through the simulation.'));

    if (!civ) {
      content.appendChild(Utils.createEl('p', 'section-desc', 'No civilization found.'));
      return;
    }

    const powerConc = Math.round(civ.governance.powerConcentration);
    const leader    = civ.governance.leader;

    if (!leader || powerConc < 40) {
      const note = Utils.createEl('div', 'settings-note');
      note.style.cssText = 'margin:12px 0;padding:12px;background:var(--surface2,#1a2233);border-radius:6px;';
      note.textContent = `${civ.name} operates under a ${civ.governance.model.label} model with distributed authority. There is no single leader whose death or removal would trigger a succession crisis.`;
      content.appendChild(note);
      return;
    }

    // Leader status card
    const card = Utils.createEl('div', 'event-card');
    card.style.cssText = 'margin-bottom:16px;';

    const healthPct = Math.round(leader.healthIndex);
    const healthColor = healthPct > 60 ? '#4caf50' : healthPct > 30 ? '#ff9800' : '#e53935';

    card.innerHTML = `
      <div style="font-size:1.1em;font-weight:bold;margin-bottom:8px;">
        ${leader.title}: <span style="color:var(--accent,#88aacc)">${leader.name}</span>
      </div>
      <div style="margin-bottom:6px;">
        Age: <strong>${leader.age}</strong> &nbsp;|&nbsp;
        Years in power: <strong>${leader.yearsInPower}</strong>
      </div>
      <div style="margin-bottom:4px;">Health:</div>
      <div style="background:var(--surface2,#1a2233);border-radius:4px;height:10px;overflow:hidden;">
        <div style="width:${healthPct}%;height:100%;background:${healthColor};transition:width 0.3s;"></div>
      </div>
      <div style="font-size:0.8em;color:#778899;margin-top:4px;">${healthPct}%</div>
    `;
    content.appendChild(card);

    // Recent leadership history
    const recent = civ.history.filter(h => h.type === 'leadership').slice(-3).reverse();
    if (recent.length > 0) {
      const histTitle = Utils.createEl('div', '', '📜 Recent leadership events:');
      histTitle.style.cssText = 'font-weight:bold;margin-bottom:6px;font-size:0.9em;color:#aabbcc;';
      content.appendChild(histTitle);
      for (const h of recent) {
        const entry = Utils.createEl('div', '');
        entry.style.cssText = 'background:var(--surface2,#1a2233);border-left:3px solid #667788;padding:6px 10px;margin-bottom:6px;font-size:0.85em;border-radius:0 4px 4px 0;';
        entry.textContent = `Year ${h.year}: ${h.title}`;
        content.appendChild(entry);
      }
    }

    // Trigger buttons
    const stability = Math.round(civ.state.stabilityIndex);
    const btnGrid = Utils.createEl('div', 'event-grid');

    const triggers = [
      {
        icon: '☠️', label: 'Natural Death',
        desc: `${leader.name} dies of natural causes. Succession crisis follows — severity depends on governance type.`,
        type: 'natural_death', enabled: true,
      },
      {
        icon: '🗡️', label: 'Assassination',
        desc: `${leader.name} is assassinated. Triggers acute instability and a power struggle.`,
        type: 'assassination', enabled: stability < 50 || powerConc > 65,
        disabledReason: 'Requires instability (stability < 50) or concentrated power (> 65).',
      },
      {
        icon: '🤒', label: 'Sudden Incapacitation',
        desc: `${leader.name} suffers a health crisis. Governing authority becomes uncertain; may or may not recover.`,
        type: 'incapacitation', enabled: true,
      },
    ];

    for (const t of triggers) {
      const trigCard = this._createEventCard(
        `${t.icon} ${t.label}`,
        t.desc + (t.enabled ? '' : `\n⚠ ${t.disabledReason}`),
        [{
          label: t.enabled ? 'Trigger' : 'Not available',
          action: t.enabled ? () => this._applyLeadershipTrigger(t.type, civ) : null,
          cls: t.enabled ? (t.type === 'assassination' ? 'btn-danger' : 'btn-warning') : 'btn-disabled',
        }]
      );
      btnGrid.appendChild(trigCard);
    }
    content.appendChild(btnGrid);
  }

  _applyLeadershipTrigger(type, civ) {
    const year = this.game.currentYear;
    const { leaderName, eventTitle } = civ.applyLeadershipEvent(type, year);
    const emojis = { natural_death: '☠️', assassination: '🗡️', incapacitation: '🤒' };
    this._showNotification(`${emojis[type] || '👑'} ${eventTitle} in ${civ.name}.`);
    this.render();
  }

  // ── Public Works Projects ─────────────────────────────────────
  _renderPublicWorks(content) {
    const era     = Utils.getEra(this.game.currentYear);
    const techLvl = era ? era.techLevel : 1;

    // Get active construction projects on the primary target civ
    const targetCivIds = this._getTargetCivs();
    const primaryCiv = targetCivIds
      ? this.game.civilizations.find(c => targetCivIds.includes(c.id))
      : this.game.civilizations.find(c => c.isPlayerCiv) || this.game.civilizations[0];
    const activeProjects = (primaryCiv?.state?.constructionProjects) || [];

    const title = Utils.createEl('div', 'section-title', '🏗️ Public Works Projects');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Large-scale infrastructure projects that benefit the whole civilization. Each takes several turns to complete before bonuses are applied.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');
    for (const work of PUBLIC_WORKS_TYPES) {
      const available = techLvl >= work.minTech && techLvl <= work.maxTech;
      const buildingProject = activeProjects.find(p => p.workId === work.id);
      const isBuilding = !!buildingProject;

      const unavailableReason = !available
        ? (techLvl < work.minTech ? `Requires Tech Level ${work.minTech}` : `Not applicable beyond Tech Level ${work.maxTech}`)
        : null;

      const effParts = [];
      if (work.effects.wellbeingDelta)   effParts.push(`Wellbeing +${work.effects.wellbeingDelta}`);
      if (work.effects.stabilityDelta)   effParts.push(`Stability +${work.effects.stabilityDelta}`);
      if (work.effects.fertilityDelta)   effParts.push(`Fertility +${work.effects.fertilityDelta}`);
      if (work.effects.innovationBoost)  effParts.push(`Innovation +${work.effects.innovationBoost}`);
      if (work.effects.cooperationBoost) effParts.push(`Cooperation +${work.effects.cooperationBoost}`);

      const buildNote = isBuilding
        ? `\n🏗️ Under construction — ${buildingProject.turnsRemaining} turn(s) remaining`
        : `\n⏱ Build time: ${work.buildTurns} turns`;

      const cardDesc = work.description
        + (effParts.length ? '\n' + effParts.join(' | ') : '')
        + buildNote
        + (unavailableReason ? `\n⚠ ${unavailableReason}` : '');

      const cardButtons = isBuilding
        ? [
            {
              label: `🏗️ Building (${buildingProject.turnsRemaining} turn${buildingProject.turnsRemaining !== 1 ? 's' : ''} left)`,
              action: null,
              cls: 'btn-warning',
            },
            {
              label: '❌ Cancel',
              action: () => this._cancelPublicWork(work.id, primaryCiv),
              cls: 'btn-danger',
            },
          ]
        : [{
            label: available ? 'Commission' : 'Not available',
            action: available ? () => this._applyPublicWork(work) : null,
            cls: available ? 'btn-secondary' : 'btn-disabled',
          }];

      grid.appendChild(this._createEventCard(
        `${work.icon} ${work.label}`,
        cardDesc,
        cardButtons
      ));
    }
    content.appendChild(grid);
  }

  _applyPublicWork(work) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'public_works',
      workId: work.id,
      icon: work.icon,
      label: work.label,
      description: work.description,
      effects: work.effects,
      buildTurns: work.buildTurns || 4,
      historyType: work.id,
    }, targetCivs);
    this._showNotification(`${work.icon} ${work.label} — construction begun! (${work.buildTurns || 4} turns)`);
    this.render();
  }

  _cancelPublicWork(workId, civ) {
    if (!civ?.state?.constructionProjects) return;
    const project = civ.state.constructionProjects.find(p => p.workId === workId);
    if (!project) return;

    // Remove from active projects
    civ.state.constructionProjects = civ.state.constructionProjects.filter(p => p.workId !== workId);

    // History entry noting the abandonment
    const yr = this.game.currentYear;
    civ.addHistoryEntry(yr,
      `${project.icon} ${project.label} Abandoned`,
      `Construction of the ${project.label} was halted before completion. The project is cancelled and the resources invested are lost.`,
      'works');

    this._showNotification(`🚫 ${project.label} construction cancelled.`);
    this.render();
  }

  // ── Policy Actions (Features 1-9) ─────────────────────────────
  _renderPolicyActions(content) {
    const civ = this._getPlayerCiv();
    const s = civ?.state ?? {};
    const tech = s.technologyLevel ?? 1;

    const title = Utils.createEl('div', 'section-title', '📋 Policy Actions');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Strategic policy decisions affecting debt, media, addiction, space, and internal divisions. Effects depend on institutional quality and state capacity.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');

    // Sovereign Debt
    grid.appendChild(this._createEventCard('📊 Implement Austerity',
      `Cut government spending to reduce sovereign debt (current: ${Math.round(s.sovereignDebtRatio ?? 20)}% GDP). Reduces debt but hurts wellbeing and increases anomie.`,
      [{ label: 'Impose Austerity', action: () => { this._applyPolicyEvent('implement_austerity'); }, cls: 'btn-secondary' }]));

    grid.appendChild(this._createEventCard('📉 Declare Sovereign Default',
      `Default on sovereign debt. Halves debt but devastates trust and trade relationships. Argentina 2001 model.`,
      [{ label: 'Declare Default', action: () => { this._applyPolicyEvent('declare_default'); }, cls: 'btn-secondary' }]));

    // Media
    grid.appendChild(this._createEventCard('📺 Fund Public Broadcasting',
      `Establish national broadcasting service for social cohesion. BBC/NHK/PBS model. Requires state capacity.`,
      [{ label: 'Fund Broadcasting', action: () => { this._applyPolicyEvent('fund_public_broadcasting'); }, cls: 'btn-secondary' }]));

    grid.appendChild(this._createEventCard('📖 Media Literacy Curriculum',
      `Add critical thinking and media analysis to schools. Finland model — strongest defense against disinformation. Requires education ≥ 40.`,
      [{ label: 'Add Curriculum', action: () => { this._applyPolicyEvent('media_literacy_curriculum'); }, cls: 'btn-secondary' }]));

    grid.appendChild(this._createEventCard('📰 Press Freedom Protections',
      `Constitutional protections for journalists. Reduces corruption through accountability. Requires institutional quality ≥ 40.`,
      [{ label: 'Enact Protections', action: () => { this._applyPolicyEvent('press_freedom_protections'); }, cls: 'btn-secondary' }]));

    // Drug Policy
    if ((s.addictionPrevalence ?? 0) > 5) {
      grid.appendChild(this._createEventCard('🚔 War on Drugs',
        `Prohibition approach. High enforcement cost, mixed results. Increases incarceration and anomie. US model.`,
        [{ label: 'Declare War on Drugs', action: () => { this._applyPolicyEvent('war_on_drugs'); }, cls: 'btn-secondary' }]));

      grid.appendChild(this._createEventCard('💊 Decriminalize & Treat',
        `Drug use decriminalized, healthcare-based treatment. Most effective long-term. Portugal model (since 2001).`,
        [{ label: 'Decriminalize', action: () => { this._applyPolicyEvent('decriminalize_treat'); }, cls: 'btn-secondary' }]));

      grid.appendChild(this._createEventCard('🏥 Harm Reduction',
        `Safe injection sites, needle exchanges, naloxone. Reduces deaths without solving root causes. Switzerland/Netherlands model.`,
        [{ label: 'Fund Programs', action: () => { this._applyPolicyEvent('harm_reduction'); }, cls: 'btn-secondary' }]));
    }

    // Space Program
    if (tech >= 6) {
      const sp = s.spaceProgram ?? {};
      if (!sp.active) {
        grid.appendChild(this._createEventCard('🚀 Launch Space Program',
          `Establish national space program. Boosts STEM education (Apollo: +50% PhDs), national prestige, and innovation. Expensive but high ROI.`,
          [{ label: 'Launch Program', action: () => { this._applyPolicyEvent('launch_space_program'); }, cls: 'btn-secondary' }]));
      } else {
        grid.appendChild(this._createEventCard('🚀 Increase Space Investment',
          `Boost space program funding. Current investment: ${sp.investmentLevel ?? 0}%. Prestige: ${Math.round(sp.prestige ?? 0)}. Achievements: ${(sp.achievements || []).length}/5.`,
          [{ label: 'Increase Funding', action: () => { this._applyPolicyEvent('increase_space_investment'); }, cls: 'btn-secondary' }]));
      }
    }

    // Schism Resolution (only when active)
    if (s.schismActive) {
      grid.appendChild(this._createEventCard('⚔️ Suppress Dissent',
        `Use state power to crush internal divisions. Fast but causes collective trauma and erodes trust. Tiananmen/Albigensian model.`,
        [{ label: 'Suppress', action: () => { this._applyPolicyEvent('suppress_schism'); }, cls: 'btn-secondary' }]));

      grid.appendChild(this._createEventCard('🤝 Accommodate Dissenters',
        `Accept diversity of views. Moderate speed. Increases ethnic fractionalization but stabilizes society. Ottoman millet model.`,
        [{ label: 'Accommodate', action: () => { this._applyPolicyEvent('accommodate_schism'); }, cls: 'btn-secondary' }]));

      grid.appendChild(this._createEventCard('🔄 Allow Reformation',
        `Let reform movement proceed. Slow and chaotic but leads to innovation and institutional renewal. Protestant Reformation model.`,
        [{ label: 'Allow Reform', action: () => { this._applyPolicyEvent('allow_reformation'); }, cls: 'btn-secondary' }]));
    }

    // Diaspora
    const diaspora = s.diasporaCommunities ?? {};
    if (Object.keys(diaspora).length > 0) {
      grid.appendChild(this._createEventCard('🌍 Engage Diaspora',
        `Outreach program for overseas communities. Boosts remittances, knowledge transfer, and trade networks.`,
        [{ label: 'Engage', action: () => { this._applyPolicyEvent('engage_diaspora'); }, cls: 'btn-secondary' }]));
    }

    // Water Treaty
    grid.appendChild(this._createEventCard('💧 Propose Water Treaty',
      `Initiate water-sharing negotiations with neighboring civilizations. Reduces water conflict risk. Indus Waters Treaty model.`,
      [{ label: 'Propose Treaty', action: () => { this._applyPolicyEvent('propose_water_treaty'); }, cls: 'btn-secondary' }]));

    content.appendChild(grid);
  }

  _applyPolicyEvent(type) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({ type }, targetCivs);
    this.render();
  }

  // ── New Horizons ──────────────────────────────────────────────
  _renderHorizons(content) {
    const era    = Utils.getEra(this.game.currentYear);
    const techLvl = era ? era.techLevel : 1;

    const title = Utils.createEl('div', 'section-title', '🌍 New Horizons');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Open new territories and frontiers for your civilization. Available options are era-dependent — early civilizations discover new lands, industrial ones expand frontiers, modern ones reclaim coastlines, and future civilizations reach other worlds. These events can also occur naturally as the simulation advances.');
    content.appendChild(desc);

    const grid = Utils.createEl('div', 'event-grid');
    for (const horizon of HORIZON_EVENT_TYPES) {
      const available = techLvl >= horizon.minTech && techLvl <= horizon.maxTech;
      const unavailableReason = !available
        ? (techLvl < horizon.minTech ? `Requires tech level ${horizon.minTech} (current: ${techLvl})` : `Not available in this era`)
        : null;

      const effectParts = [];
      if (horizon.effects.innovationBoost) effectParts.push(`Innovation +${horizon.effects.innovationBoost}`);
      if (horizon.effects.wellbeingBoost)  effectParts.push(`Wellbeing +${horizon.effects.wellbeingBoost}`);
      if (horizon.effects.fertilityBoost)  effectParts.push(`Fertility +${horizon.effects.fertilityBoost}`);
      if (horizon.effects.populationBoost) effectParts.push(`Population +${horizon.effects.populationBoost}%`);
      const effectStr = effectParts.length ? `Effects: ${effectParts.join(' | ')}` : '';

      const card = this._createEventCard(
        horizon.icon + ' ' + horizon.label,
        horizon.description + (effectStr ? '\n' + effectStr : '') + (unavailableReason ? `\n⚠ ${unavailableReason}` : ''),
        [{
          label: available ? 'Introduce' : 'Not available',
          action: available ? () => this._applyHorizon(horizon) : null,
          cls: available ? 'btn-secondary' : 'btn-disabled',
        }]
      );
      grid.appendChild(card);
    }
    content.appendChild(grid);
  }

  _applyHorizon(horizon) {
    const targetCivs = this._getTargetCivs();
    this.game.simulation.applyExternalEvent({
      type: 'new_horizons',
      horizonId: horizon.id,
      label: horizon.label,
      description: horizon.description,
      effects: horizon.effects,
      historyType: horizon.historyType,
    }, targetCivs);
    this._showNotification(`${horizon.icon} ${horizon.label}!`);
    this.render();
  }

  // ── Custom User-Defined Event ─────────────────────────────────
  _renderCustomEvent(content) {
    const title = Utils.createEl('div', 'section-title', '✏️ Define a Custom Event');
    content.appendChild(title);
    const desc = Utils.createEl('p', 'section-desc',
      'Create your own event with any combination of effects. Give it a name, describe what happened, then set the impacts. Changes are applied immediately to the targeted civilization(s).');
    content.appendChild(desc);

    const form = Utils.createEl('div', 'custom-event-form');

    // Name + description
    form.innerHTML = `
      <div class="form-group">
        <label>Event Name <span class="required">*</span></label>
        <input type="text" id="custom-evt-name" placeholder="e.g., Golden Age of Trade, Famine, Plague of Rats…" />
      </div>
      <div class="form-group">
        <label>Description (appears in History)</label>
        <textarea id="custom-evt-desc" rows="3" placeholder="Describe what happened and why it matters…"></textarea>
      </div>

      <div class="section-label" style="margin:14px 0 6px">Numeric Effects <span class="form-hint">(0 = no change)</span></div>

      <div class="custom-slider-row">
        <label>Wellbeing</label>
        <input type="range" id="cs-wellbeing" min="-30" max="30" value="0" />
        <span id="cs-wellbeing-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Equality</label>
        <input type="range" id="cs-equality" min="-20" max="20" value="0" />
        <span id="cs-equality-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Population %</label>
        <input type="range" id="cs-population" min="-25" max="25" value="0" />
        <span id="cs-population-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Fertility</label>
        <input type="range" id="cs-fertility" min="-40" max="40" value="0" />
        <span id="cs-fertility-val" class="slider-val">0</span>
      </div>

      <div class="section-label" style="margin:14px 0 6px">Behavior Shifts <span class="form-hint">(optional)</span></div>

      <div class="custom-slider-row">
        <label>Cooperation</label>
        <input type="range" id="cs-cooperation" min="-20" max="20" value="0" />
        <span id="cs-cooperation-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Acquisitiveness</label>
        <input type="range" id="cs-acquisitiveness" min="-20" max="20" value="0" />
        <span id="cs-acquisitiveness-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Conformity</label>
        <input type="range" id="cs-conformity" min="-20" max="20" value="0" />
        <span id="cs-conformity-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Innovation</label>
        <input type="range" id="cs-innovation" min="-20" max="20" value="0" />
        <span id="cs-innovation-val" class="slider-val">0</span>
      </div>
      <div class="custom-slider-row">
        <label>Empathy</label>
        <input type="range" id="cs-empathy" min="-20" max="20" value="0" />
        <span id="cs-empathy-val" class="slider-val">0</span>
      </div>
    `;

    // Wire slider live-update labels
    const sliderIds = ['wellbeing','equality','population','fertility','cooperation','acquisitiveness','conformity','innovation','empathy'];
    for (const id of sliderIds) {
      const slider = form.querySelector(`#cs-${id}`);
      const valEl  = form.querySelector(`#cs-${id}-val`);
      if (slider && valEl) {
        slider.oninput = () => {
          valEl.textContent = (slider.value > 0 ? '+' : '') + slider.value;
          valEl.style.color = slider.value > 0 ? '#00d4aa' : slider.value < 0 ? '#ff6b6b' : '';
        };
      }
    }

    const applyBtn = Utils.createEl('button', 'btn btn-primary', '✏️ Apply Custom Event');
    applyBtn.style.marginTop = '16px';
    applyBtn.onclick = () => this._applyCustomEvent(form);
    form.appendChild(applyBtn);

    content.appendChild(form);
  }

  _applyCustomEvent(form) {
    const name = Utils.el('custom-evt-name')?.value.trim();
    if (!name) {
      alert('Please give your event a name.');
      return;
    }
    const description  = Utils.el('custom-evt-desc')?.value.trim() || name;
    const getVal = (id) => parseInt(form.querySelector(`#cs-${id}`)?.value || '0', 10);

    const wellbeingChange  = getVal('wellbeing');
    const equalityChange   = getVal('equality');
    const populationChange = getVal('population');
    const fertilityChange  = getVal('fertility');

    const behaviorModifiers = {};
    for (const beh of ['cooperation','acquisitiveness','conformity','innovation','empathy']) {
      const v = getVal(beh);
      if (v !== 0) behaviorModifiers[beh] = v;
    }

    this.game.simulation.applyExternalEvent({
      type: 'custom',
      label: name,
      description,
      wellbeingChange,
      equalityChange,
      populationChange,
      fertilityChange,
      behaviorModifiers,
    }, this._getTargetCivs());

    this._showNotification(`✏️ "${name}" applied!`);

    // Reset sliders to 0
    for (const id of ['wellbeing','equality','population','fertility','cooperation','acquisitiveness','conformity','innovation','empathy']) {
      const slider = form.querySelector(`#cs-${id}`);
      const valEl  = form.querySelector(`#cs-${id}-val`);
      if (slider) slider.value = 0;
      if (valEl)  { valEl.textContent = '0'; valEl.style.color = ''; }
    }
    const nameEl = Utils.el('custom-evt-name');
    const descEl = Utils.el('custom-evt-desc');
    if (nameEl) nameEl.value = '';
    if (descEl) descEl.value = '';
  }

  // ── Helpers ───────────────────────────────────────────────────
  _createEventCard(title, description, buttons = []) {
    const card = Utils.createEl('div', 'event-card');
    const cardTitle = Utils.createEl('div', 'event-card-title', title);
    const cardDesc = Utils.createEl('div', 'event-card-desc', description);
    card.appendChild(cardTitle);
    card.appendChild(cardDesc);
    for (const btn of buttons) {
      const b = Utils.createEl('button', `btn ${btn.cls || 'btn-primary'}`, btn.label);
      if (btn.action) b.onclick = btn.action;
      else b.disabled = true;
      card.appendChild(b);
    }
    return card;
  }

  // ══════════════════════════════════════════════════════════════
  //  MIGRATION TAB
  // ══════════════════════════════════════════════════════════════
  _renderMigration(content) {
    const civ = this._getPlayerCiv();

    // Open border policy toggle
    const policyWrap = Utils.createEl('div', 'event-card');
    const isOpen = civ?.migration?.openBorderPolicy ?? false;
    policyWrap.innerHTML = `
      <div class="event-card-title">🌐 Open Borders Policy</div>
      <p class="event-card-desc">When active, doubles the probability of opportunity-seeker migration arriving automatically each turn. Signals a welcoming stance to all arrivals.</p>
      <div style="margin-top:10px">Status: <strong>${isOpen ? '✅ Open' : '❌ Closed'}</strong></div>
    `;
    const toggleBtn = Utils.createEl('button', `btn ${isOpen ? 'btn-secondary' : 'btn-primary'}`, isOpen ? 'Close Borders' : 'Open Borders');
    toggleBtn.onclick = () => {
      if (civ) { civ.migration.openBorderPolicy = !civ.migration.openBorderPolicy; this.render(); }
    };
    policyWrap.appendChild(toggleBtn);
    content.appendChild(policyWrap);

    // Migration balance display
    if (civ) {
      const balance = civ.migration.netBalance || 0;
      const balanceEl = Utils.createEl('div', 'event-card');
      balanceEl.innerHTML = `<div class="event-card-title">📊 Net Migration Balance</div>
        <div style="color:${balance >= 0 ? '#00d4aa' : '#ff6b6b'}; font-size:1.1em; font-weight:700">
          ${balance >= 0 ? '+' : ''}${balance.toLocaleString()} people (lifetime net)</div>`;
      content.appendChild(balanceEl);
    }

    // Influx events
    content.appendChild(Utils.createEl('div', 'section-title', '📥 Immigration & Refugee Influx'));
    const influxNote = Utils.createEl('div', 'event-note', 'These events simulate large influxes of people arriving. Effects apply immediately to the target civilization.');
    content.appendChild(influxNote);
    for (const preset of MIGRATION_INFLUX_PRESETS) {
      const card = this._createEventCard(
        `${preset.icon} ${preset.label}`,
        preset.description,
        [{ label: 'Apply Influx', cls: 'btn-primary',
           action: () => this._applyMigrationEvent(preset, 'influx') }]
      );
      content.appendChild(card);
    }

    // Outflow events
    content.appendChild(Utils.createEl('div', 'section-title', '📤 Emigration & Population Outflow'));
    const outflowNote = Utils.createEl('div', 'event-note', 'These events simulate large outflows of people leaving. Some are voluntary; some are not.');
    content.appendChild(outflowNote);
    for (const preset of MIGRATION_OUTFLOW_PRESETS) {
      const card = this._createEventCard(
        `${preset.icon} ${preset.label}`,
        preset.description,
        [{ label: preset.id === 'emigration_expulsion' ? '⚠️ Execute Expulsion' : 'Apply Outflow',
           cls: preset.id === 'emigration_expulsion' ? 'btn-danger' : 'btn-secondary',
           action: () => this._applyMigrationEvent(preset, 'outflow') }]
      );
      content.appendChild(card);
    }
  }

  _applyMigrationEvent(preset, direction) {
    const targets = this._getTargetCivs();
    const civs = targets
      ? this.game.civilizations.filter(c => targets.includes(c.id))
      : this.game.civilizations.filter(c => c.isPlayerCiv);

    for (const civ of civs) {
      const [minPct, maxPct] = preset.populationChangePct;
      const pct = minPct + Utils.random() * (maxPct - minPct);
      const delta = Math.floor(civ.state.population * Math.abs(pct) / 100);
      const signed = direction === 'influx' ? delta : -delta;

      civ.state.population = Math.max(50, civ.state.population + signed);
      civ.migration.netBalance = (civ.migration.netBalance || 0) + signed;
      civ.migration.lastEvent = direction;
      civ.migration.lastEventTurn = this.game.currentYear;

      const eff = preset.effects || {};
      if (eff.stabilityDelta)    civ.state.stabilityIndex             = Utils.clamp(civ.state.stabilityIndex             + eff.stabilityDelta,    0, 100);
      if (eff.wellbeingDelta)    civ.state.averageWellbeing           = Utils.clamp(civ.state.averageWellbeing           + eff.wellbeingDelta,    0, 100);
      if (eff.empathyDelta)      civ.state.empathyLevel               = Utils.clamp(civ.state.empathyLevel               + eff.empathyDelta,      0, 100);
      if (eff.cooperationDelta)  civ.state.behaviorReinforcement.cooperation = Utils.clamp(civ.state.behaviorReinforcement.cooperation + eff.cooperationDelta, 0, 100);
      if (eff.innovationDelta)   civ.state.behaviorReinforcement.innovation  = Utils.clamp(civ.state.behaviorReinforcement.innovation  + eff.innovationDelta,  0, 100);
      if (eff.freedomDelta)      civ.operatingPrinciples.freedomLevel = Utils.clamp(civ.operatingPrinciples.freedomLevel + eff.freedomDelta,      0, 100);
      if (eff.wealthConcDelta)   civ.economic.wealthConcentration     = Utils.clamp(civ.economic.wealthConcentration     + eff.wealthConcDelta,   0, 93);
      if (eff.corruptionDelta)   civ.governance.corruptionLevel       = Utils.clamp(civ.governance.corruptionLevel       + eff.corruptionDelta,   0, 100);

      const popWord = direction === 'influx' ? `+${delta.toLocaleString()} arrivals` : `−${delta.toLocaleString()} departures`;
      const histDesc = direction === 'influx'
        ? `A wave of ${preset.label.toLowerCase()} has arrived in ${civ.name} (${popWord}). ${preset.description}`
        : `${preset.label} in ${civ.name} (${popWord}). ${preset.description}`;
      civ.addHistoryEntry(this.game.currentYear, preset.label, histDesc, 'migration');
      this.game.ui?.showNotification(`🧳 ${preset.icon} ${preset.label} — ${popWord} in ${civ.name}.`);
    }
    this.render();
  }

  // ══════════════════════════════════════════════════════════════
  //  SLAVERY & LABOR TAB
  // ══════════════════════════════════════════════════════════════
  _renderSlavery(content) {
    const civ = this._getPlayerCiv();
    const slavery = civ?.slavery;

    // Current status
    const statusCard = Utils.createEl('div', 'event-card');
    if (slavery?.active) {
      statusCard.innerHTML = `
        <div class="event-card-title">⛓️ Slavery Status: <span style="color:#e74c3c">ACTIVE</span></div>
        <div>Type: <strong>${(slavery.type || 'unknown').replace(/_/g, ' ')}</strong></div>
        <div>Prevalence: <strong>${Math.round(slavery.prevalence)}/100</strong></div>
        <div>Abolitionist Movement Strength: <strong>${Math.round(slavery.abolitionistMovement)}/100</strong></div>
        <div style="margin-top:8px; font-size:0.82rem; color:var(--text-dim)">
          Active effects per turn: +wealth concentration, −equality, −empathy, −stability. Chattel slavery also bleeds population slowly.
        </div>
      `;
    } else if (slavery?.emancipatedYear) {
      statusCard.innerHTML = `<div class="event-card-title">✊ Emancipated (Year ${slavery.emancipatedYear})</div>
        <p>Forced labor has been formally abolished in this civilization.</p>`;
    } else {
      statusCard.innerHTML = `<div class="event-card-title">⛓️ Slavery: <span style="color:#00d4aa">Not Active</span></div>
        <p style="color:var(--text-dim)">No institutionalized forced labor is currently active.</p>`;
    }
    content.appendChild(statusCard);

    content.appendChild(Utils.createEl('div', 'section-title', '⛓️ Institutionalize Forced Labor'));

    // Type selector
    const typeWrap = Utils.createEl('div', 'event-card');
    typeWrap.innerHTML = `<div class="event-card-title">Establish Forced Labor Institution</div>
      <p class="event-card-desc">Institutionalize forced labor as a structural feature of the economy. This generates long-term wealth for those at the top while producing cascading effects on equality, empathy, and stability. Requires accumulation-based economy and concentrated power.</p>
      <label style="display:block; margin:10px 0 4px">Labor Type:</label>
      <select id="slavery-type-sel" style="width:100%; margin-bottom:10px">
        <option value="chattel">Chattel Slavery (people as property; worst effects)</option>
        <option value="debt_bondage">Debt Bondage (legal obligation binding labor)</option>
        <option value="forced_labor">Forced Labor (state-directed coerced work)</option>
        <option value="penal">Penal Labor (prisoners forced to work for private/state benefit)</option>
      </select>`;
    const canInstitute = civ && civ.economic.accumulationAllowed && civ.governance.powerConcentration > 50 && !slavery?.active;
    const instituteBtn = Utils.createEl('button', `btn btn-danger`, canInstitute ? '⚠️ Institutionalize' : 'Requirements not met');
    if (!canInstitute) { instituteBtn.disabled = true; instituteBtn.title = 'Requires: accumulation-based economy + power concentration > 50 + slavery not already active'; }
    instituteBtn.onclick = () => this._applySlaveryInstitution(civ);
    typeWrap.appendChild(instituteBtn);
    content.appendChild(typeWrap);

    content.appendChild(Utils.createEl('div', 'section-title', '✊ Abolition & Reform'));
    const emancCard = this._createEventCard(
      '✊ Issue Emancipation Decree',
      'Formally abolish forced labor across the civilization. The long-term effects are significant: empathy rises, equality improves, wealth concentration falls as coerced labor surplus disappears. The immediate period of transition is destabilizing.',
      [{ label: slavery?.active ? '✊ Issue Emancipation Decree' : 'Not applicable', cls: 'btn-primary',
         action: slavery?.active ? () => this._applyEmancipation(civ) : null }]
    );
    if (!slavery?.active) emancCard.querySelector('button').disabled = true;
    content.appendChild(emancCard);
  }

  _applySlaveryInstitution(civ) {
    if (!civ) return;
    const typeEl = Utils.el('slavery-type-sel');
    const type = typeEl?.value || 'chattel';
    civ.slavery.active = true;
    civ.slavery.type = type;
    civ.slavery.prevalence = 60;
    civ.slavery.abolitionistMovement = 0;
    const desc = `The governing authority of ${civ.name} has institutionalized ${type.replace(/_/g,' ')} as a structural feature of the economy. Those with power will benefit materially. Those without will bear the full cost. The long-term consequences — to equality, empathy, and social cohesion — are already beginning.`;
    civ.addHistoryEntry(this.game.currentYear, `Slavery Institutionalized: ${type.replace(/_/g,' ')}`, desc, 'slavery');
    this.game.ui?.showNotification(`⚠️ ${type.replace(/_/g,' ')} institutionalized in ${civ.name}.`);
    this.render();
  }

  _applyEmancipation(civ) {
    if (!civ || !civ.slavery?.active) return;
    civ.slavery.active = false;
    civ.slavery.emancipatedYear = this.game.currentYear;
    civ.state.empathyLevel = Utils.clamp(civ.state.empathyLevel + 15, 0, 100);
    civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration - 10, 0, 93);
    civ.state.stabilityIndex = Utils.clamp(civ.state.stabilityIndex - 8, 0, 100); // transition period
    const desc = `${civ.name} has issued an emancipation decree, formally abolishing ${civ.slavery.type?.replace(/_/g,' ') || 'forced labor'}. The transition is real but destabilizing. Those who were enslaved begin the long process of rebuilding lives. The economic and social consequences of the institution will take generations to fully address.`;
    civ.addHistoryEntry(this.game.currentYear, 'Emancipation Decree', desc, 'slavery');
    this.game.ui?.showNotification(`✊ Emancipation decree issued in ${civ.name}! Slavery abolished.`);
    this.render();
  }

  // ══════════════════════════════════════════════════════════════
  //  CRIME TAB
  // ══════════════════════════════════════════════════════════════
  _renderCrime(content) {
    const civ = this._getPlayerCiv();
    const crime = civ?.organizedCrime;
    const activeCrimeType = crime?.type;
    const crimeLevel = crime?.level || 0;

    // Status header
    const statusCard = Utils.createEl('div', 'event-card');
    if (activeCrimeType) {
      const conf = CRIME_TYPES[activeCrimeType];
      const barColor = crimeLevel > 65 ? '#e74c3c' : crimeLevel > 35 ? '#f0a020' : '#f0c030';
      statusCard.innerHTML = `
        <div class="event-card-title">${conf.icon} Active: ${conf.label}</div>
        <div style="margin-bottom:8px">Level: <strong>${Math.round(crimeLevel)}/100</strong></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${crimeLevel}%; background:${barColor}"></div></div>
        <div style="margin-top:8px; font-size:0.82rem; color:var(--text-dim)">${conf.primaryEffects ? 'Per-turn effects active. Apply a countermeasure below to begin suppression.' : ''}</div>
        ${crime.suppressionPolicy ? `<div style="color:#00d4aa; margin-top:6px">🔄 Policy active: <strong>${crime.suppressionPolicy.replace(/_/g,' ')}</strong> — ${crime.policyTurnsRemaining} turn(s) remaining</div>` : ''}
      `;
    } else {
      statusCard.innerHTML = `<div class="event-card-title">🔪 Organized Crime: <span style="color:#00d4aa">None Active</span></div>
        <p style="color:var(--text-dim)">No organized criminal networks are currently active. Crime can emerge automatically from social conditions or be seeded below for research.</p>`;
    }
    content.appendChild(statusCard);

    // Countermeasures (only if crime active)
    if (activeCrimeType && !crime.suppressionPolicy) {
      content.appendChild(Utils.createEl('div', 'section-title', '🛡️ Countermeasures'));
      const conf = CRIME_TYPES[activeCrimeType];
      for (const cm of (conf.countermeasures || [])) {
        const card = this._createEventCard(
          `${cm.icon} ${cm.label}`,
          `${cm.description}\n\n⏱️ Duration: ${cm.turns} turns | Crime level: ${cm.crimeLevelDelta} | ${Object.entries(cm.effects || {}).map(([k,v]) => `${k.replace('Delta','')}: ${v > 0 ? '+' : ''}${v}`).join(', ')}`,
          [{ label: 'Apply Countermeasure', cls: 'btn-primary',
             action: () => this._applyCountermeasure(civ, activeCrimeType, cm) }]
        );
        content.appendChild(card);
      }
    }

    // Seed crime for research
    content.appendChild(Utils.createEl('div', 'section-title', '🔬 Seed Organized Crime (Research / Scenario)'));
    content.appendChild(Utils.createEl('div', 'event-note', 'Manually introduce a specific crime type for research purposes. Only available when no crime is currently active.'));
    for (const [typeId, conf] of Object.entries(CRIME_TYPES)) {
      const isDisabled = !!activeCrimeType;
      const card = this._createEventCard(
        `${conf.icon} ${conf.label}`,
        conf.description + '\n\n' + conf.emergenceConditions,
        [{ label: isDisabled ? 'Crime already active' : `Seed ${conf.label}`, cls: 'btn-secondary',
           action: isDisabled ? null : () => this._seedCrime(civ, typeId) }]
      );
      if (isDisabled) card.querySelector('button').disabled = true;
      content.appendChild(card);
    }
  }

  _applyCountermeasure(civ, crimeTypeId, policy) {
    if (!civ || !civ.organizedCrime) return;
    civ.organizedCrime.suppressionPolicy = policy.id;
    civ.organizedCrime.policyTurnsRemaining = policy.turns;
    const desc = `${civ.name} has initiated the "${policy.label}" countermeasure against its ${crimeTypeId.replace(/_/g,' ')} network. Resolution expected in ${policy.turns} turns.`;
    civ.addHistoryEntry(this.game.currentYear, `Crime Countermeasure: ${policy.label}`, desc, 'organized_crime');
    this.game.ui?.showNotification(`🛡️ "${policy.label}" countermeasure initiated. Results in ${policy.turns} turns.`);
    this.render();
  }

  _seedCrime(civ, typeId) {
    if (!civ) return;
    civ.organizedCrime.type = typeId;
    civ.organizedCrime.level = 15;
    civ.organizedCrime.turnsActive = 0;
    const conf = CRIME_TYPES[typeId];
    const desc = `${conf.label} has been introduced into ${civ.name} for research/scenario purposes.`;
    civ.addHistoryEntry(this.game.currentYear, `Crime Introduced: ${conf.label}`, desc, 'organized_crime');
    this.game.ui?.showNotification(`🔪 ${conf.icon} ${conf.label} seeded in ${civ.name}.`);
    this.render();
  }

  // ── Economy Tab ───────────────────────────────────────────────
  _renderEconomy(container) {
    const desc = Utils.createEl('p', 'setup-desc',
      'Trigger economy-wide shocks and transitions. These affect civilizational health and per-stratum wellbeing immediately.');
    container.appendChild(desc);

    const events = [
      {
        id:    'financial_crisis',
        icon:  '📉',
        title: 'Financial Crisis',
        desc:  'A systemic financial collapse: wellbeing −15 overall (working class −20, disenfranchised −25), '
               + 'stability −10, debt load +20. Triggers when debt is high and stability is low.',
        danger: true,
        apply:  () => this._applyEconomyEvent('financial_crisis'),
      },
      {
        id:    'debt_jubilee',
        icon:  '🎉',
        title: 'Debt Jubilee',
        desc:  'Mass debt cancellation (requires community_debt model or can be forced as emergency measure). '
               + 'Clears 50% of debt load, equality +8, elite wellbeing −5.',
        danger: false,
        apply:  () => this._applyEconomyEvent('debt_jubilee', { flavor: 'jubilee' }),
      },
      {
        id:    'trade_disruption',
        icon:  '🚢',
        title: 'Trade Disruption',
        desc:  'Global supply chain shock or trade war. Cuts all trade partner intensities by 50%. '
               + 'Civs with high trade dependency take a sharp wellbeing hit.',
        danger: true,
        apply:  () => this._applyEconomyEvent('trade_disruption'),
      },
      {
        id:    'economic_boom',
        icon:  '📈',
        title: 'Economic Boom',
        desc:  'A period of strong aggregate growth. Wellbeing +5–12 by stratum (upper strata gain more), '
               + 'financial depth +10, debt load +5.',
        danger: false,
        apply:  () => this._applyEconomyEvent('economic_boom'),
      },
    ];

    events.forEach(ev => {
      const card = Utils.createEl('div', 'event-card');
      const titleEl = Utils.createEl('div', 'event-card-title', `${ev.icon} ${ev.title}`);
      const descEl  = Utils.createEl('p', 'event-card-desc', ev.desc);
      const btn     = Utils.createEl('button',
        ev.danger ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm',
        `${ev.icon} Apply`);
      btn.onclick = () => ev.apply();
      card.appendChild(titleEl);
      card.appendChild(descEl);
      card.appendChild(btn);
      container.appendChild(card);
    });
  }

  _applyEconomyEvent(type, extra = {}) {
    const targetIds = this._getTargetCivs();
    const targets   = targetIds
      ? this.game.civilizations.filter(c => targetIds.includes(c.id))
      : this.game.civilizations;
    for (const civ of targets) {
      this.game.simulation?.applyExternalEvent(civ, { type, ...extra });
    }
    this._showNotification(`💰 Economy event: ${type.replace(/_/g, ' ')}`);
    this.render();
  }

  _getPlayerCiv() {
    return this.game.civilizations.find(c => c.isPlayerCiv) || this.game.civilizations[0];
  }

  _getTargetCivs() {
    const selector = Utils.el('target-civ-selector');
    if (!selector || selector.value === 'all') return null;
    if (selector.value === 'player') {
      const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
      return playerCiv ? [playerCiv.id] : null;
    }
    return [selector.value];
  }

  _showNotification(msg) {
    if (this.game.ui) this.game.ui.showNotification(msg);
  }
}
