// ── TechPanel — Technology Introduction & Discontinuation Engine ───────────────
// Follows the same pattern as EventsPanel in events.js.

class TechPanel {
  constructor(game) {
    this.game                 = game;
    this.visible              = false;
    this.activeTab            = 'introduce';  // 'introduce' | 'discontinue' | 'custom' | 'automation'
    this.selectedTech         = null;         // tech object currently in analysis view
    this.selectedType         = 'introduce';  // 'introduce' | 'discontinue'
    this.analysisMode         = false;
    this.customAnalysisResult = null;
    this.automationAnalysisLevel = null;      // which automation level is selected for preview (0–5)
  }

  // ── Visibility ───────────────────────────────────────────────
  show() {
    this.visible = true;
    this.render();
    Utils.show(Utils.el('tech-panel'));
  }

  hide() {
    this.visible = false;
    Utils.hide(Utils.el('tech-panel'));
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  // ── Root Render ──────────────────────────────────────────────
  render() {
    const panel = Utils.el('tech-panel');
    if (!panel) return;
    panel.innerHTML = '';

    // Header
    const header = Utils.createEl('div', 'panel-header');
    const titleWrap = Utils.createEl('div', '');
    titleWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const title = Utils.createEl('h2', '', '🔬 Technology');
    title.style.margin = '0';
    titleWrap.appendChild(title);

    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕ Close');
    closeBtn.style.marginLeft = 'auto';
    closeBtn.onclick = () => { this.hide(); };

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs (hidden in analysis mode)
    if (!this.analysisMode) {
      const tabs = Utils.createEl('div', 'panel-tabs');
      [
        { id: 'tree',        label: '🌳 Tree' },
        { id: 'introduce',   label: '🔬 Introduce' },
        { id: 'discontinue', label: '🚫 Discontinue' },
        { id: 'custom',      label: '✏️ Custom' },
        { id: 'automation',  label: '🤖 Automation' },
      ].forEach(({ id, label }) => {
        const btn = Utils.createEl('button', 'tab-btn' + (this.activeTab === id ? ' active' : ''), label);
        btn.onclick = () => { this.activeTab = id; this.analysisMode = false; this.render(); };
        tabs.appendChild(btn);
      });
      panel.appendChild(tabs);
    }

    // Content
    const content = Utils.createEl('div', 'panel-content');
    panel.appendChild(content);

    if (this.analysisMode && this.selectedTech) {
      this._renderAnalysis(content);
    } else if (this.activeTab === 'tree') {
      this._renderTreeTab(content);
    } else if (this.activeTab === 'introduce') {
      this._renderIntroduceTab(content);
    } else if (this.activeTab === 'discontinue') {
      this._renderDiscontinueTab(content);
    } else if (this.activeTab === 'custom') {
      this._renderCustomTab(content);
    } else if (this.activeTab === 'automation') {
      this._renderAutomationTab(content);
    }
  }

  // ── Introduce Tab ────────────────────────────────────────────
  _renderIntroduceTab(container) {
    const intro = Utils.createEl('p', '');
    intro.style.cssText = 'padding:12px 16px 0;margin:0;font-size:0.82rem;color:var(--text-dim);';
    intro.textContent = 'Select a technology to analyze its effects on your civilization — including immediate impacts, stratum-differentiated outcomes, and long-term consequence chains.';
    container.appendChild(intro);

    // Group by category
    const categories = {};
    for (const tech of TECHNOLOGY_CATALOG) {
      if (!categories[tech.category]) categories[tech.category] = [];
      categories[tech.category].push(tech);
    }

    const CATEGORY_LABELS = {
      biotech:     '🧫 Biotechnology',
      energy:      '⚡ Energy',
      computing:   '💻 Computing',
      agriculture: '🌾 Agriculture',
      environment: '🌍 Environment',
      information: '📡 Information',
      transport:   '🚙 Transport',
    };

    for (const [cat, techs] of Object.entries(categories)) {
      const catHeader = Utils.createEl('div', 'tech-category-header', CATEGORY_LABELS[cat] || cat);
      container.appendChild(catHeader);

      const grid = Utils.createEl('div', 'tech-catalog-grid');
      for (const tech of techs) {
        this._renderTechCard(tech, grid, 'introduce');
      }
      container.appendChild(grid);
    }
  }

  // ── Discontinue Tab ──────────────────────────────────────────
  _renderDiscontinueTab(container) {
    const intro = Utils.createEl('p', '');
    intro.style.cssText = 'padding:12px 16px 0;margin:0;font-size:0.82rem;color:var(--text-dim);';
    intro.textContent = 'Analyze the civilizational effects of phasing out or banning an existing technology — including economic disruption, stratum impacts, and eventual benefits.';
    container.appendChild(intro);

    const grid = Utils.createEl('div', 'tech-catalog-grid');
    grid.style.padding = '12px 16px';
    for (const tech of TECH_DISCONTINUATION_CATALOG) {
      this._renderTechCard(tech, grid, 'discontinue');
    }
    container.appendChild(grid);
  }

  // ── Tech Card ────────────────────────────────────────────────
  _renderTechCard(tech, container, type) {
    const card = Utils.createEl('div', 'tech-card');

    // Check tree prerequisites for this catalog tech
    const prereqMap = type === 'introduce' ? TECH_CATALOG_PREREQUISITES : TECH_DISCONTINUATION_PREREQUISITES;
    const requiredTreeTechs = prereqMap?.[tech.id] || [];
    let prereqsMet = true;
    let missingPrereqs = [];

    if (requiredTreeTechs.length > 0) {
      const civIds = this._getTargetCivs();
      const civ = this.game.civilizations.find(c => c.id === civIds[0]);
      if (civ) {
        const adoptedIdSet = buildAdoptedTechIdSet(civ.state.adoptedTechnologies);
        for (const reqId of requiredTreeTechs) {
          if (!adoptedIdSet.has(reqId)) {
            prereqsMet = false;
            missingPrereqs.push(TECH_TREE_INDEX[reqId]?.name || reqId);
          }
        }
      }
    }

    if (!prereqsMet) {
      card.style.opacity = '0.55';
      card.style.borderColor = '#555';
    }

    const icon = Utils.createEl('span', 'tech-card-icon', tech.icon);
    const title = Utils.createEl('div', 'tech-card-title', tech.name);
    const catBadge = Utils.createEl('span', 'tech-card-category', tech.category);
    const desc = Utils.createEl('p', 'tech-card-desc', tech.description);

    // Show prerequisite status
    if (requiredTreeTechs.length > 0) {
      const prereqEl = Utils.createEl('div', '');
      prereqEl.style.cssText = `font-size:0.7rem;padding:4px 0;color:${prereqsMet ? '#8fbc8f' : '#e08080'};`;
      if (prereqsMet) {
        prereqEl.textContent = '✅ All prerequisites met';
      } else {
        prereqEl.textContent = `🔒 Requires: ${missingPrereqs.join(', ')}`;
      }
      card.appendChild(prereqEl);
    }

    const btn = Utils.createEl('button', 'tech-card-btn', prereqsMet ? 'Analyze Impact →' : '🔒 Locked');
    if (prereqsMet) {
      btn.onclick = () => {
        this.selectedTech = tech;
        this.selectedType = type;
        this.analysisMode = true;
        this.render();
      };
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(catBadge);
    card.appendChild(desc);
    card.appendChild(btn);
    container.appendChild(card);
  }

  // ── Analysis View ────────────────────────────────────────────
  _renderAnalysis(container) {
    const tech = this.selectedTech;
    const type = this.selectedType;
    const wrap = Utils.createEl('div', 'tech-analysis');

    // Back button + action buttons row
    const actionsRow = Utils.createEl('div', '');
    actionsRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;';

    const backBtn = Utils.createEl('button', 'tech-analysis-back btn btn-secondary btn-sm', '← Back');
    backBtn.onclick = () => { this.analysisMode = false; this.render(); };

    // Check if already applied
    const civs    = this._getTargetCivs().map(id => this.game.civilizations.find(c => c.id === id)).filter(Boolean);
    const firstCiv = civs[0];
    const alreadyApplied = type === 'introduce'
      ? firstCiv?.state?.activeTechnologies?.some(t => t.techId === tech.id)
      : firstCiv?.state?.activeDiscontinuations?.some(t => t.techId === tech.id);

    // Check tree prerequisites for catalog techs
    const prereqMap = type === 'introduce' ? TECH_CATALOG_PREREQUISITES : TECH_DISCONTINUATION_PREREQUISITES;
    const requiredTreeTechs = prereqMap?.[tech.id] || [];
    let catalogPrereqsMet = true;
    if (requiredTreeTechs.length > 0 && firstCiv) {
      const adoptedIdSet = buildAdoptedTechIdSet(firstCiv.state.adoptedTechnologies);
      catalogPrereqsMet = requiredTreeTechs.every(rid => adoptedIdSet.has(rid));
    }

    const applyLabel = alreadyApplied ? '✓ Already Applied'
      : !catalogPrereqsMet ? '🔒 Prerequisites Not Met'
      : (type === 'introduce' ? '▶ Apply Introduction' : '▶ Apply Discontinuation');
    const applyBtn = Utils.createEl('button', 'btn btn-primary btn-sm', applyLabel);
    if (!alreadyApplied && catalogPrereqsMet) {
      applyBtn.onclick = () => { this._applyTech(tech, type); };
    } else {
      applyBtn.disabled = true;
      applyBtn.style.opacity = '0.5';
    }

    const exportBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📋 Export Analysis');
    exportBtn.onclick = () => { this._exportAnalysis(tech, type); };

    actionsRow.appendChild(backBtn);
    actionsRow.appendChild(applyBtn);
    actionsRow.appendChild(exportBtn);
    wrap.appendChild(actionsRow);

    // Title
    const title = Utils.createEl('div', 'tech-analysis-title', `${tech.icon} ${tech.name}`);
    const typeBadge = Utils.createEl('span', '', type === 'introduce' ? 'Introduction' : 'Discontinuation');
    typeBadge.style.cssText = 'font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:8px;vertical-align:middle;' +
      (type === 'introduce' ? 'background:rgba(0,212,170,0.15);color:#00d4aa;' : 'background:rgba(240,160,32,0.15);color:#f0a020;');
    title.appendChild(typeBadge);
    wrap.appendChild(title);

    // Rollout profile
    const ROLLOUT_LABELS = {
      elite_first:    '👑 Elite First',
      universal:      '🌐 Universal',
      market_driven:  '💰 Market-Driven',
      equity_focused: '⚖️ Equity-Focused',
    };
    const rollout = Utils.createEl('div', 'tech-analysis-rollout',
      `${ROLLOUT_LABELS[tech.rolloutProfile] || tech.rolloutProfile} — ${tech.rolloutTurns} turn${tech.rolloutTurns !== 1 ? 's' : ''} to full access`);
    wrap.appendChild(rollout);

    // Description
    const desc = Utils.createEl('p', 'tech-analysis-desc', tech.description);
    wrap.appendChild(desc);

    // Immediate Effects
    this._renderEffectsSection(wrap, tech.immediateEffects);

    // Stratum Impact
    this._renderStrataSection(wrap, tech.strataEffects, tech.rolloutProfile);

    // Consequence Chain
    if (tech.consequenceChain?.length) {
      this._renderConsequenceSection(wrap, tech.consequenceChain);
    }

    container.appendChild(wrap);
  }

  // Immediate effects grid
  _renderEffectsSection(container, fx) {
    if (!fx) return;
    const section = Utils.createEl('div', 'tech-analysis-section');
    section.appendChild(Utils.createEl('div', 'tech-analysis-section-title', 'Immediate Effects'));

    const grid = Utils.createEl('div', 'tech-effects-grid');
    const fields = [
      { key: 'wellbeing',    label: 'Wellbeing',    suffix: '' },
      { key: 'equality',     label: 'Equality',     suffix: '' },
      { key: 'innovation',   label: 'Innovation',   suffix: '' },
      { key: 'warmingImpact',label: 'Climate Index', suffix: '' },
    ];
    for (const { key, label } of fields) {
      const val = fx[key];
      if (val === undefined || val === null || val === 0) continue;
      const item = Utils.createEl('div', 'tech-effect-item');
      const lbl  = Utils.createEl('span', 'tech-effect-label', label);
      const cls  = val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
      // Warming: positive is bad for climate (negative display meaning), negative is good
      const displayVal = (key === 'warmingImpact' && val !== 0) ? (val > 0 ? `+${val} ⚠️` : `${val} ✓`) : (val > 0 ? `+${val}` : `${val}`);
      const valEl = Utils.createEl('span', `tech-effect-value ${key === 'warmingImpact' ? (val > 0 ? 'negative' : 'positive') : cls}`, displayVal);
      item.appendChild(lbl);
      item.appendChild(valEl);
      grid.appendChild(item);
    }
    if (!grid.children.length) {
      grid.appendChild(Utils.createEl('span', '', 'No immediate stat changes.'));
      grid.style.color = 'var(--text-dim)';
      grid.style.fontSize = '0.82rem';
    }
    section.appendChild(grid);
    container.appendChild(section);
  }

  // Stratum impact grid
  _renderStrataSection(container, strataEffects, rolloutProfile) {
    if (!strataEffects) return;
    const section = Utils.createEl('div', 'tech-analysis-section');
    section.appendChild(Utils.createEl('div', 'tech-analysis-section-title', 'Stratum Impact at Introduction'));

    const ROLLOUT_WEIGHTS = {
      elite_first:    { elite: 1.0, upper_middle: 0.6, lower_middle: 0.2, working_class: 0.1,  disenfranchised: 0.0  },
      market_driven:  { elite: 0.9, upper_middle: 0.7, lower_middle: 0.4, working_class: 0.2,  disenfranchised: 0.05 },
      universal:      { elite: 0.9, upper_middle: 0.85,lower_middle: 0.8, working_class: 0.75, disenfranchised: 0.65 },
      equity_focused: { elite: 0.7, upper_middle: 0.8, lower_middle: 0.9, working_class: 0.95, disenfranchised: 1.0  },
    };
    const weights = ROLLOUT_WEIGHTS[rolloutProfile] || ROLLOUT_WEIGHTS.universal;

    const STRATA_ORDER = [
      { key: 'elite',           label: 'Elite' },
      { key: 'upper_middle',    label: 'Upper Middle' },
      { key: 'lower_middle',    label: 'Lower Middle' },
      { key: 'working_class',   label: 'Working Class' },
      { key: 'disenfranchised', label: 'Disenfranchised' },
    ];

    const grid = Utils.createEl('div', 'tech-strata-grid');
    const maxVal = 20; // max bar scale

    for (const { key, label } of STRATA_ORDER) {
      const fx = strataEffects[key];
      if (!fx) continue;
      const weight   = weights[key] ?? 0.5;
      const effectiveWb = Math.round((fx.wellbeing || 0) * weight);

      const row = Utils.createEl('div', 'tech-strata-row');

      const nameEl = Utils.createEl('span', 'tech-strata-name', label);

      const barWrap = Utils.createEl('div', 'tech-strata-bar-wrap');
      const bar     = Utils.createEl('div', `tech-strata-bar ${effectiveWb >= 0 ? 'benefit' : 'harm'}`);
      const pct     = Math.min(100, Math.abs(effectiveWb) / maxVal * 100);
      bar.style.width = pct + '%';
      barWrap.appendChild(bar);

      const valLabel = Utils.createEl('span', '', effectiveWb === 0 ? '±0' : (effectiveWb > 0 ? `+${effectiveWb}` : `${effectiveWb}`));
      valLabel.style.cssText = `font-size:0.72rem;font-weight:700;min-width:28px;text-align:right;color:${effectiveWb > 0 ? '#2ecc71' : effectiveWb < 0 ? '#e74c3c' : 'var(--text-dim)'};`;

      const noteEl = Utils.createEl('span', 'tech-strata-note', fx.note || '');

      row.appendChild(nameEl);
      row.appendChild(barWrap);
      row.appendChild(valLabel);
      row.appendChild(noteEl);
      grid.appendChild(row);
    }

    // Access note
    const accessNote = Utils.createEl('p', '');
    accessNote.style.cssText = 'font-size:0.72rem;color:var(--text-dim);margin:8px 0 0;';
    accessNote.textContent = 'Values show effective wellbeing impact at introduction, weighted by rollout profile. Reaches full access after rollout period.';
    section.appendChild(grid);
    section.appendChild(accessNote);
    container.appendChild(section);
  }

  // Consequence chain timeline
  _renderConsequenceSection(container, chain) {
    const section = Utils.createEl('div', 'tech-analysis-section');
    section.appendChild(Utils.createEl('div', 'tech-analysis-section-title', 'Consequence Chain'));

    const chainEl = Utils.createEl('div', 'tech-consequence-chain');
    for (const c of chain) {
      const entry = Utils.createEl('div', 'tech-consequence-entry');

      const turnEl = Utils.createEl('span', 'tech-consequence-turn', `+${c.turnDelay} turn${c.turnDelay !== 1 ? 's' : ''}`);
      const iconEl = Utils.createEl('span', 'tech-consequence-icon', c.icon);
      const contentEl = Utils.createEl('div', 'tech-consequence-content');
      const labelEl = Utils.createEl('div', 'tech-consequence-label', c.label);
      const descEl  = Utils.createEl('div', 'tech-consequence-desc', c.description);

      // Severity indicator
      const sevColor = c.magnitude < 0
        ? '#2ecc71'
        : c.magnitude >= 4 ? '#cc2020'
        : c.magnitude >= 3 ? '#e74c3c'
        : c.magnitude >= 2 ? '#f0a020'
        : '#f0c040';
      const sevBadge = Utils.createEl('span', '');
      sevBadge.style.cssText = `font-size:0.67rem;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px;vertical-align:middle;background:${sevColor}22;color:${sevColor};`;
      sevBadge.textContent = c.magnitude < 0 ? 'BENEFIT' : `×${Math.abs(c.magnitude)}`;
      labelEl.appendChild(sevBadge);

      contentEl.appendChild(labelEl);
      contentEl.appendChild(descEl);
      entry.appendChild(turnEl);
      entry.appendChild(iconEl);
      entry.appendChild(contentEl);
      chainEl.appendChild(entry);
    }
    section.appendChild(chainEl);
    container.appendChild(section);
  }

  // ── Custom Tab ───────────────────────────────────────────────
  _renderCustomTab(container) {
    const form = Utils.createEl('div', 'tech-custom-form');

    const introText = Utils.createEl('p', '');
    introText.style.cssText = 'margin:0 0 14px;font-size:0.82rem;color:var(--text-dim);';
    introText.textContent = 'Describe a technology to analyze its civilizational effects. The system will match recognized concepts and estimate impacts. Technologies violating physical law or too complex to model will be flagged.';
    form.appendChild(introText);

    // Name input
    const nameLbl = Utils.createEl('label', '', 'Technology Name');
    nameLbl.style.cssText = 'font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px;';
    form.appendChild(nameLbl);
    const nameInput = Utils.createEl('input', 'tech-custom-input');
    nameInput.placeholder = 'e.g. Anti-aging treatment, Clean fusion energy…';
    form.appendChild(nameInput);

    // Description textarea
    const descLbl = Utils.createEl('label', '', 'Description (optional — more detail improves analysis)');
    descLbl.style.cssText = 'font-size:0.8rem;font-weight:700;display:block;margin-bottom:4px;';
    form.appendChild(descLbl);
    const descInput = Utils.createEl('textarea', 'tech-custom-textarea');
    descInput.placeholder = 'Describe what the technology does, how it works, and who it affects…';
    form.appendChild(descInput);

    // Analyze button
    const analyzeBtn = Utils.createEl('button', 'btn btn-primary btn-sm', '🔍 Analyze Technology');
    analyzeBtn.style.marginBottom = '16px';
    analyzeBtn.onclick = () => {
      const name = nameInput.value.trim();
      const desc = descInput.value.trim();
      if (!name) { nameInput.focus(); return; }
      this.customAnalysisResult = this._analyzeCustomTech(name, desc);
      this.render();
    };
    form.appendChild(analyzeBtn);

    // Result area
    if (this.customAnalysisResult) {
      this._renderCustomResult(form, this.customAnalysisResult);
    }

    container.appendChild(form);
  }

  // ── Custom Analysis Engine ───────────────────────────────────
  _analyzeCustomTech(name, description) {
    const combined = (name + ' ' + description).toLowerCase();

    // Check impossible keywords
    for (const kw of TECH_IMPOSSIBLE_KEYWORDS) {
      if (combined.includes(kw)) {
        return {
          outOfScope: true,
          scopeType: 'impossible',
          matchedKeyword: kw,
        };
      }
    }

    // Check unmodelable keywords
    for (const kw of TECH_UNMODELABLE_KEYWORDS) {
      if (combined.includes(kw)) {
        return {
          outOfScope: true,
          scopeType: 'unmodelable',
          matchedKeyword: kw,
        };
      }
    }

    // Keyword matching
    const tokens = combined.split(/[\s,.\-;:!?()]+/).filter(t => t.length > 2);
    const matchedKeywords = [];
    const aggregated = { wellbeing: 0, equality: 0, innovation: 0, warmingImpact: 0 };
    const categoryCounts = {};

    for (const token of tokens) {
      const entry = TECH_KEYWORD_MAP[token];
      if (entry) {
        matchedKeywords.push({ keyword: token, label: entry.label, category: entry.category });
        for (const [k, v] of Object.entries(entry.effects)) {
          aggregated[k] = (aggregated[k] || 0) + v;
        }
        categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
      }
    }

    // Deduplicate matched keywords by keyword string
    const seen = new Set();
    const uniqueMatched = matchedKeywords.filter(m => {
      if (seen.has(m.keyword)) return false;
      seen.add(m.keyword);
      return true;
    });

    if (uniqueMatched.length === 0) {
      return {
        outOfScope: true,
        scopeType: 'unrecognized',
        matchedKeyword: null,
      };
    }

    // Average the aggregated effects
    const count = uniqueMatched.length;
    const avgEffects = {
      wellbeing:    Math.round(aggregated.wellbeing    / count),
      equality:     Math.round(aggregated.equality     / count),
      innovation:   Math.round(aggregated.innovation   / count),
      warmingImpact:Math.round(aggregated.warmingImpact/ count),
    };

    // Dominant category
    const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'computing';

    // Confidence level
    const meaningfulWords = tokens.filter(t => t.length > 3);
    const confidence = Math.min(1, uniqueMatched.length / Math.max(1, meaningfulWords.length));
    const confidenceLabel = confidence >= 0.4 ? 'high' : confidence >= 0.2 ? 'medium' : 'low';

    // Build generic consequence chain from dominant category
    const CATEGORY_CONSEQUENCES = {
      biotech:     [{ turnDelay:3, type:'population_surge', magnitude:1, label:'Health Improvement Wave', icon:'👥', description:'Improved health outcomes gradually affect population dynamics.' }],
      energy:      [{ turnDelay:3, type:'employment_shock', magnitude:2, label:'Energy Sector Disruption', icon:'⚙️', description:'Existing energy industry workers face displacement.' },
                    { turnDelay:5, type:'environmental_improvement', magnitude:2, label:'Emission Reduction', icon:'🌿', description:'New energy model reduces environmental impact.' }],
      computing:   [{ turnDelay:3, type:'inequality_surge', magnitude:2, label:'Technology Access Gap', icon:'📊', description:'Early adopters gain significant advantages over others.' }],
      transport:   [{ turnDelay:2, type:'employment_shock', magnitude:2, label:'Transport Sector Shift', icon:'⚙️', description:'Transportation workers face automation or disruption.' }],
      agriculture: [{ turnDelay:3, type:'food_security_crisis', magnitude:1, label:'Agricultural Transition', icon:'🌾', description:'Transition period may cause temporary supply disruptions.' },
                    { turnDelay:5, type:'environmental_improvement', magnitude:2, label:'Land Use Change', icon:'🌿', description:'New agricultural methods may improve land and resource use.' }],
      environment: [{ turnDelay:4, type:'environmental_improvement', magnitude:2, label:'Environmental Recovery', icon:'🌿', description:'Environmental technology begins to show systemic benefits.' }],
      information: [{ turnDelay:3, type:'economic_disruption', magnitude:1, label:'Market Disruption', icon:'💱', description:'Improved information access disrupts existing market structures.' }],
    };

    const consequenceChain = CATEGORY_CONSEQUENCES[dominantCategory] || [];

    // Generic strata effects (slightly favoring upper strata unless energy/information/environment)
    const equalityFriendly = ['information', 'environment', 'agriculture'].includes(dominantCategory);
    const strataEffects = {
      elite:           { wellbeing: Math.round(avgEffects.wellbeing * 1.2), note: 'Typically gains early access' },
      upper_middle:    { wellbeing: Math.round(avgEffects.wellbeing * 1.1), note: 'Early adopter advantage' },
      lower_middle:    { wellbeing: Math.round(avgEffects.wellbeing * 0.9), note: 'Access after initial rollout' },
      working_class:   { wellbeing: Math.round(avgEffects.wellbeing * (equalityFriendly ? 0.9 : 0.7)), note: 'Later access; displacement risk' },
      disenfranchised: { wellbeing: Math.round(avgEffects.wellbeing * (equalityFriendly ? 1.0 : 0.4)), note: equalityFriendly ? 'May see relatively strong benefit' : 'Often last to receive access' },
    };

    // Build synthetic tech object
    const syntheticTech = {
      id:             'custom_' + Utils.uid(),
      name,
      category:       dominantCategory,
      icon:           '🔧',
      description:    description || `A user-defined technology: ${name}.`,
      rolloutProfile: 'market_driven',
      rolloutTurns:   3,
      immediateEffects: avgEffects,
      strataEffects,
      consequenceChain,
      isCustom:       true,
    };

    return {
      outOfScope:       false,
      tech:             syntheticTech,
      confidence,
      confidenceLabel,
      matchedKeywords:  uniqueMatched,
      dominantCategory,
    };
  }

  // Render custom analysis result
  _renderCustomResult(container, result) {
    if (result.outOfScope) {
      const box = Utils.createEl('div', 'tech-out-of-scope');
      let title, message;

      if (result.scopeType === 'impossible') {
        title = '⚠️ Violates Current Understanding of Physical Law';
        message = `"${result.matchedKeyword}" describes something that violates current understanding of physical law and cannot be modeled as a civilizational technology in this simulation.`;
      } else if (result.scopeType === 'unmodelable') {
        title = '⚠️ Beyond Simulation Scope';
        message = `"${result.matchedKeyword}" describes a concept whose civilizational effects would be too transformative or unknowable for this simulation to evaluate meaningfully.`;
      } else {
        title = '⚠️ No Recognizable Concepts Found';
        message = 'No recognizable technology concepts were found in your description. Try using terms like "aging", "cancer", "clean energy", "quantum computing", "autonomous transport", or similar. Alternatively, use the Introduce or Discontinue tabs to select from the predefined catalog.';
      }

      const titleEl = Utils.createEl('div', 'tech-out-of-scope-title', title);
      const msgEl   = Utils.createEl('p', '', message);
      msgEl.style.cssText = 'margin:6px 0 0;font-size:0.82rem;';
      box.appendChild(titleEl);
      box.appendChild(msgEl);
      container.appendChild(box);
      return;
    }

    // Confidence badge
    const badgeClass = `tech-confidence-badge tech-confidence-${result.confidenceLabel}`;
    const badge = Utils.createEl('span', badgeClass,
      `${result.confidenceLabel.toUpperCase()} CONFIDENCE (${Math.round(result.confidence * 100)}%) — ${result.matchedKeywords.length} keyword${result.matchedKeywords.length !== 1 ? 's' : ''} matched`);
    container.appendChild(badge);

    // Matched keywords
    const kwWrap = Utils.createEl('div', 'tech-matched-keywords');
    kwWrap.appendChild(Utils.createEl('span', '', 'Matched concepts: '));
    for (const kw of result.matchedKeywords) {
      const tag = Utils.createEl('span', 'tech-matched-kw', kw.label);
      kwWrap.appendChild(tag);
    }
    container.appendChild(kwWrap);

    // Apply + Export buttons
    const btnRow = Utils.createEl('div', '');
    btnRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;';

    const applyBtn = Utils.createEl('button', 'btn btn-primary btn-sm', '▶ Apply to Civilization');
    applyBtn.onclick = () => { this._applyTech(result.tech, 'introduce'); };

    const exportBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📋 Export Analysis');
    exportBtn.onclick = () => { this._exportAnalysis(result.tech, 'introduce', result); };

    btnRow.appendChild(applyBtn);
    btnRow.appendChild(exportBtn);
    container.appendChild(btnRow);

    // Show mini analysis inline
    const previewWrap = Utils.createEl('div', '');
    previewWrap.style.cssText = 'border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;';
    this._renderEffectsSection(previewWrap, result.tech.immediateEffects);
    this._renderStrataSection(previewWrap, result.tech.strataEffects, result.tech.rolloutProfile);
    if (result.tech.consequenceChain?.length) {
      this._renderConsequenceSection(previewWrap, result.tech.consequenceChain);
    }
    container.appendChild(previewWrap);
  }

  // ── Apply Tech ───────────────────────────────────────────────
  _applyTech(tech, type) {
    const civIds = this._getTargetCivs();
    const eventType = type === 'introduce' ? 'introduce_technology' : 'discontinue_technology';
    this.game.simulation.applyExternalEvent({ type: eventType, tech }, civIds);
    // Return to catalog after applying
    this.analysisMode = false;
    this.customAnalysisResult = null;
    this.render();
  }

  // ── Export Analysis ──────────────────────────────────────────
  _exportAnalysis(tech, type, customResult = null) {
    const typeLabel = type === 'introduce' ? 'Introduction' : 'Discontinuation';
    const year      = this.game.currentYear;
    const lines     = [];

    lines.push(`TECHNOLOGY ${typeLabel.toUpperCase()} ANALYSIS`);
    lines.push(`${'='.repeat(60)}`);
    lines.push(`Technology:   ${tech.name}`);
    lines.push(`Category:     ${tech.category}`);
    lines.push(`Type:         ${typeLabel}`);
    lines.push(`Game Year:    ${Utils.formatYear(year)}`);
    lines.push(`Rollout:      ${tech.rolloutProfile} (${tech.rolloutTurns} turns to full access)`);
    lines.push('');

    if (tech.description) {
      lines.push('DESCRIPTION');
      lines.push('-'.repeat(40));
      lines.push(tech.description);
      lines.push('');
    }

    lines.push('IMMEDIATE EFFECTS');
    lines.push('-'.repeat(40));
    const fx = tech.immediateEffects || {};
    if (fx.wellbeing)     lines.push(`  Wellbeing:     ${fx.wellbeing >= 0 ? '+' : ''}${fx.wellbeing}`);
    if (fx.equality)      lines.push(`  Equality:      ${fx.equality >= 0 ? '+' : ''}${fx.equality}`);
    if (fx.innovation)    lines.push(`  Innovation:    ${fx.innovation >= 0 ? '+' : ''}${fx.innovation}`);
    if (fx.warmingImpact) lines.push(`  Climate Index: ${fx.warmingImpact >= 0 ? '+' : ''}${fx.warmingImpact}`);
    lines.push('');

    lines.push('STRATUM IMPACT AT INTRODUCTION');
    lines.push('-'.repeat(40));
    const ROLLOUT_WEIGHTS = {
      elite_first:    { elite:1.0, upper_middle:0.6, lower_middle:0.2, working_class:0.1,  disenfranchised:0.0  },
      market_driven:  { elite:0.9, upper_middle:0.7, lower_middle:0.4, working_class:0.2,  disenfranchised:0.05 },
      universal:      { elite:0.9, upper_middle:0.85,lower_middle:0.8, working_class:0.75, disenfranchised:0.65 },
      equity_focused: { elite:0.7, upper_middle:0.8, lower_middle:0.9, working_class:0.95, disenfranchised:1.0  },
    };
    const weights = ROLLOUT_WEIGHTS[tech.rolloutProfile] || ROLLOUT_WEIGHTS.universal;
    const STRATA_ORDER = [
      { key:'elite',           label:'Elite' },
      { key:'upper_middle',    label:'Upper Middle' },
      { key:'lower_middle',    label:'Lower Middle' },
      { key:'working_class',   label:'Working Class' },
      { key:'disenfranchised', label:'Disenfranchised' },
    ];
    for (const { key, label } of STRATA_ORDER) {
      const sfx = tech.strataEffects?.[key];
      if (!sfx) continue;
      const eff = Math.round((sfx.wellbeing || 0) * (weights[key] ?? 0.5));
      const sign = eff >= 0 ? '+' : '';
      lines.push(`  ${label.padEnd(18)} ${sign}${eff} wellbeing    ${sfx.note || ''}`);
    }
    lines.push('');

    if (tech.consequenceChain?.length) {
      lines.push('CONSEQUENCE CHAIN');
      lines.push('-'.repeat(40));
      for (const c of tech.consequenceChain) {
        lines.push(`  +${c.turnDelay} turn${c.turnDelay !== 1 ? 's' : ''}  ${c.icon} ${c.label} (magnitude: ${c.magnitude >= 0 ? '+' : ''}${c.magnitude})`);
        lines.push(`           ${c.description}`);
      }
      lines.push('');
    }

    if (customResult) {
      lines.push('CUSTOM TECHNOLOGY ANALYSIS');
      lines.push('-'.repeat(40));
      lines.push(`  Confidence:       ${customResult.confidenceLabel.toUpperCase()} (${Math.round(customResult.confidence * 100)}%)`);
      lines.push(`  Dominant Category: ${customResult.dominantCategory}`);
      lines.push(`  Matched Keywords:  ${customResult.matchedKeywords.map(k => k.label).join(', ')}`);
      lines.push('');
    }

    lines.push('─'.repeat(60));
    lines.push('Generated by Civ-Sim Technology Analysis Engine');

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `${tech.id || 'tech'}_${type}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Automation Tab ───────────────────────────────────────────
  _renderAutomationTab(container) {
    // Determine current automation level for the representative target civ
    const civIds = this._getTargetCivs();
    const civs   = this.game.civilizations.filter(c => civIds.includes(c.id));
    const repCiv = civs[0] || null;
    const currentLevel     = repCiv?.state?.automationLevel ?? 0;
    const currentLevelData = AUTOMATION_LEVELS[currentLevel] || AUTOMATION_LEVELS[0];

    // Intro paragraph
    const intro = Utils.createEl('p', '');
    intro.style.cssText = 'margin:0 0 14px;font-size:0.83rem;color:var(--text-dim);line-height:1.5;';
    intro.textContent   = 'Set the penetration level of AI and robotics automation in this civilization. Each level has immediate effects on introduction, ongoing per-turn effects, and consequence chains — with strongly differentiated impacts across social strata.';
    container.appendChild(intro);

    // Current level status card
    const statusDiv = Utils.createEl('div', 'tech-automation-status');
    const statusIconEl = Utils.createEl('span', 'tech-automation-status-icon', currentLevelData.icon);
    const statusTextEl = Utils.createEl('div', '');
    statusTextEl.style.flex = '1';
    const statusLabel = Utils.createEl('div', 'tech-automation-status-label',
      `Level ${currentLevel}: ${currentLevelData.label}`);
    const statusSub = Utils.createEl('div', 'tech-automation-status-sub',
      currentLevel === 0
        ? 'No automation effects active. Select a level below to preview and apply.'
        : 'Ongoing per-turn effects are active. Select any level to preview and compare.');
    statusTextEl.appendChild(statusLabel);
    statusTextEl.appendChild(statusSub);
    statusDiv.appendChild(statusIconEl);
    statusDiv.appendChild(statusTextEl);
    container.appendChild(statusDiv);

    // Section header
    const gridHeader = Utils.createEl('div', 'tech-analysis-section-title');
    gridHeader.style.marginTop = '16px';
    gridHeader.textContent = 'Select Level to Analyze';
    container.appendChild(gridHeader);

    // Level selector grid (0–5)
    const grid = Utils.createEl('div', 'tech-automation-grid');
    for (let i = 0; i < AUTOMATION_LEVELS.length; i++) {
      const ld       = AUTOMATION_LEVELS[i];
      const isCurrent  = (i === currentLevel);
      const isSelected = (i === this.automationAnalysisLevel);
      let cls = 'tech-automation-card';
      if (isCurrent)  cls += ' current';
      if (isSelected) cls += ' selected';

      const card = Utils.createEl('div', cls);
      if (isCurrent) {
        const badge = Utils.createEl('div', 'tech-automation-current-badge', 'CURRENT');
        card.appendChild(badge);
      }
      card.appendChild(Utils.createEl('div', 'tech-automation-card-icon',  ld.icon));
      card.appendChild(Utils.createEl('div', 'tech-automation-card-level', `Level ${i}`));
      card.appendChild(Utils.createEl('div', 'tech-automation-card-name',  ld.label));
      card.onclick = () => {
        this.automationAnalysisLevel = (this.automationAnalysisLevel === i) ? null : i;
        this.render();
      };
      grid.appendChild(card);
    }
    container.appendChild(grid);

    // Analysis panel for selected level
    if (this.automationAnalysisLevel !== null) {
      const ld = AUTOMATION_LEVELS[this.automationAnalysisLevel];

      const wrap = Utils.createEl('div', 'tech-automation-analysis');

      // Title row
      const titleRow = Utils.createEl('div', '');
      titleRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px;';
      const titleIcon = Utils.createEl('span', '', ld.icon);
      titleIcon.style.fontSize = '1.4rem';
      const titleEl = Utils.createEl('div', 'tech-analysis-title',
        `Level ${this.automationAnalysisLevel}: ${ld.label}`);
      titleEl.style.margin = '0';
      titleRow.appendChild(titleIcon);
      titleRow.appendChild(titleEl);
      wrap.appendChild(titleRow);

      const descEl = Utils.createEl('p', 'tech-analysis-desc', ld.description);
      wrap.appendChild(descEl);

      // Immediate Effects on Introduction
      this._renderEffectsSection(wrap, ld.immediateEffects);

      // Per-Turn Ongoing Effects
      this._renderPerTurnSection(wrap, ld.perTurnEffects);

      // Skills obsolete / new capabilities
      if (ld.obsoleteSkills?.length || ld.newCapabilities?.length) {
        this._renderSkillsSection(wrap, ld.obsoleteSkills, ld.newCapabilities);
      }

      // Stratum Impact (universal rollout — no differential access weighting)
      this._renderStrataSection(wrap, ld.strataEffects, 'universal');

      // Consequence Chain
      if (ld.consequenceChain?.length) {
        this._renderConsequenceSection(wrap, ld.consequenceChain);
      }

      // Actions row
      const actionsRow = Utils.createEl('div', '');
      actionsRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap;';

      const applyBtn  = Utils.createEl('button', 'btn btn-primary btn-sm', '');
      const exportBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '📋 Export Analysis');
      exportBtn.onclick = () => this._exportAutomationAnalysis(this.automationAnalysisLevel);

      if (this.automationAnalysisLevel === currentLevel) {
        applyBtn.textContent = `✓ Already at Level ${this.automationAnalysisLevel}`;
        applyBtn.disabled    = true;
        applyBtn.style.opacity = '0.5';
      } else {
        applyBtn.textContent = `⚙️ Apply Level ${this.automationAnalysisLevel} to Civilization`;
        applyBtn.onclick = () => this._applyAutomationLevel(this.automationAnalysisLevel);
      }

      actionsRow.appendChild(applyBtn);
      actionsRow.appendChild(exportBtn);

      // Downgrade notice
      if (this.automationAnalysisLevel < currentLevel) {
        const note = Utils.createEl('span', '');
        note.style.cssText = 'font-size:0.72rem;color:#f0a020;font-style:italic;flex:1 1 100%;margin-top:4px;';
        note.textContent   = `Note: Reducing from Level ${currentLevel} to Level ${this.automationAnalysisLevel} models a deliberate policy intervention such as automation restrictions or job guarantee programs.`;
        actionsRow.appendChild(note);
      }

      wrap.appendChild(actionsRow);
      container.appendChild(wrap);
    }
  }

  // Per-turn ongoing effects display
  _renderPerTurnSection(container, perTurnEffects) {
    if (!perTurnEffects) return;
    const hasEffects = Object.values(perTurnEffects).some(v => v !== 0);
    if (!hasEffects) return;

    const section = Utils.createEl('div', 'tech-analysis-section');
    section.appendChild(Utils.createEl('div', 'tech-analysis-section-title', 'Ongoing Effects Per Turn'));

    const grid = Utils.createEl('div', 'tech-effects-grid');
    const fields = [
      { key: 'wellbeing',  label: 'Wellbeing/turn' },
      { key: 'equality',   label: 'Equality/turn' },
      { key: 'innovation', label: 'Innovation/turn' },
    ];
    for (const { key, label } of fields) {
      const val = perTurnEffects[key];
      if (!val) continue;
      const item  = Utils.createEl('div', 'tech-effect-item');
      const lbl   = Utils.createEl('span', 'tech-effect-label', label);
      const cls   = val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
      const disp  = val > 0 ? `+${val}` : `${val}`;
      const valEl = Utils.createEl('span', `tech-effect-value ${cls}`, disp);
      item.appendChild(lbl);
      item.appendChild(valEl);
      grid.appendChild(item);
    }

    const note = Utils.createEl('p', '');
    note.style.cssText = 'font-size:0.72rem;color:var(--text-dim);margin:8px 0 0;';
    note.textContent   = 'These effects accumulate each turn while this automation level is maintained.';
    section.appendChild(grid);
    section.appendChild(note);
    container.appendChild(section);
  }

  // Skills obsolete / new capabilities two-column section
  _renderSkillsSection(container, obsolete, newCaps) {
    const section = Utils.createEl('div', 'tech-analysis-section');
    section.appendChild(Utils.createEl('div', 'tech-analysis-section-title', 'Skills & Capabilities Transformation'));

    const cols = Utils.createEl('div', 'tech-skills-cols');

    if (obsolete?.length) {
      const col      = Utils.createEl('div', 'tech-skills-col');
      const colTitle = Utils.createEl('div', 'tech-skills-col-title obsolete', '⬇ Skills Made Obsolete');
      col.appendChild(colTitle);
      for (const s of obsolete) {
        col.appendChild(Utils.createEl('div', 'tech-skill-item obsolete', `• ${s}`));
      }
      cols.appendChild(col);
    }

    if (newCaps?.length) {
      const col      = Utils.createEl('div', 'tech-skills-col');
      const colTitle = Utils.createEl('div', 'tech-skills-col-title new-cap', '⬆ New Capabilities Unlocked');
      col.appendChild(colTitle);
      for (const s of newCaps) {
        col.appendChild(Utils.createEl('div', 'tech-skill-item new-cap', `• ${s}`));
      }
      cols.appendChild(col);
    }

    section.appendChild(cols);
    container.appendChild(section);
  }

  // Apply automation level to target civs
  _applyAutomationLevel(level) {
    const civIds = this._getTargetCivs();
    this.game.simulation.applyExternalEvent(
      { type: 'set_automation_level', level },
      civIds.length ? civIds : null
    );
    this.render();
  }

  // Export automation analysis as .txt
  _exportAutomationAnalysis(level) {
    const ld   = AUTOMATION_LEVELS[level];
    if (!ld) return;
    const year = this.game.currentYear;

    const sign = v => (v > 0 ? `+${v}` : `${v}`);

    const lines = [
      `AI & ROBOTICS AUTOMATION ANALYSIS`,
      `${'='.repeat(60)}`,
      `Level:        ${level} — ${ld.label}  ${ld.icon}`,
      `Game Year:    ${Utils.formatYear ? Utils.formatYear(year) : year}`,
      '',
      'DESCRIPTION',
      '-'.repeat(40),
      ld.description,
      '',
      'IMMEDIATE EFFECTS ON INTRODUCTION',
      '-'.repeat(40),
      `  Wellbeing:    ${sign(ld.immediateEffects.wellbeing)}`,
      `  Equality:     ${sign(ld.immediateEffects.equality)}`,
      `  Innovation:   ${sign(ld.immediateEffects.innovation)}`,
      '',
      'ONGOING EFFECTS PER TURN',
      '-'.repeat(40),
      ...[
        ['Wellbeing',  ld.perTurnEffects.wellbeing],
        ['Equality',   ld.perTurnEffects.equality],
        ['Innovation', ld.perTurnEffects.innovation],
      ].filter(([, v]) => v !== 0).map(([k, v]) => `  ${k}: ${sign(v)}/turn`),
      '',
      'SKILLS MADE OBSOLETE',
      '-'.repeat(40),
      ...(ld.obsoleteSkills?.length ? ld.obsoleteSkills.map(s => `  • ${s}`) : ['  (none at this level)']),
      '',
      'NEW CAPABILITIES UNLOCKED',
      '-'.repeat(40),
      ...(ld.newCapabilities?.length ? ld.newCapabilities.map(s => `  • ${s}`) : ['  (none at this level)']),
      '',
      'STRATUM IMPACT',
      '-'.repeat(40),
      ...([
        ['Elite',            'elite'],
        ['Upper Middle',     'upper_middle'],
        ['Lower Middle',     'lower_middle'],
        ['Working Class',    'working_class'],
        ['Disenfranchised',  'disenfranchised'],
      ].map(([label, key]) => {
        const sfx = ld.strataEffects[key];
        if (!sfx) return null;
        return `  ${label.padEnd(18)} ${sign(sfx.wellbeing)} wb    ${sfx.note || ''}`;
      }).filter(Boolean)),
      '',
      'CONSEQUENCE CHAIN',
      '-'.repeat(40),
      ...(ld.consequenceChain?.length
        ? ld.consequenceChain.map(c =>
            `  +${c.turnDelay} turn${c.turnDelay !== 1 ? 's' : ''}: ${c.icon} ${c.label} (×${Math.abs(c.magnitude)}) — ${c.description}`)
        : ['  (no consequence chain at this level)']),
      '',
      '─'.repeat(60),
      'Generated by Civ-Sim Automation Analysis Engine',
    ];

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `automation_level_${level}_${ld.id}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Tech Tree Tab ────────────────────────────────────────────
  _renderTreeTab(container) {
    const civIds = this._getTargetCivs();
    const civ = this.game.civilizations.find(c => c.id === civIds[0]);
    if (!civ) return;

    const adoptedIdSet = buildAdoptedTechIdSet(civ.state.adoptedTechnologies);
    const currentEra = Utils.getEra(this.game.currentYear);

    // Header info
    const info = Utils.createEl('div', '');
    info.style.cssText = 'padding:12px 16px 0;margin:0;font-size:0.82rem;color:var(--text-dim);display:flex;justify-content:space-between;align-items:center;';
    const infoText = Utils.createEl('span', '', `${civ.name} — ${adoptedIdSet.size} / ${Object.keys(TECH_TREE_INDEX).length} technologies discovered`);
    info.appendChild(infoText);

    // Legend
    const legend = Utils.createEl('div', '');
    legend.style.cssText = 'display:flex;gap:12px;font-size:0.75rem;';
    [['#2d5a2d', 'Discovered'], ['#4a6fa5', 'Available'], ['#555', 'Locked'], ['#333', 'Future Era']].forEach(([c, l]) => {
      const item = Utils.createEl('span', '');
      item.style.cssText = `display:flex;align-items:center;gap:4px;`;
      const dot = Utils.createEl('span', '');
      dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${c};display:inline-block;`;
      item.appendChild(dot);
      item.appendChild(document.createTextNode(l));
      legend.appendChild(item);
    });
    info.appendChild(legend);
    container.appendChild(info);

    // Tree container with horizontal scroll
    const treeWrap = Utils.createEl('div', '');
    treeWrap.style.cssText = 'overflow-x:auto;overflow-y:auto;padding:12px 16px;max-height:calc(100vh - 200px);';

    // SVG for connection lines (positioned absolutely over the tree)
    const treeContainer = Utils.createEl('div', '');
    treeContainer.style.cssText = 'position:relative;display:flex;gap:4px;min-width:fit-content;';

    // Organize techs by era
    const eraOrder = ['prehistoric', 'early_bronze', 'bronze', 'iron', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'contemporary', 'future'];
    const techsByEra = {};
    for (const eraId of eraOrder) techsByEra[eraId] = [];
    for (const [id, tech] of Object.entries(TECH_TREE_INDEX)) {
      if (techsByEra[tech.era]) techsByEra[tech.era].push({ ...tech, id });
    }

    // Category colors
    const catColors = {
      materials: '#b87333', agriculture: '#6aaa64', energy: '#e6a817',
      science: '#5b9bd5', communication: '#9b59b6', medicine: '#e74c3c', maritime: '#3498db',
    };

    // Render era columns
    const nodeElements = {}; // id → DOM element for SVG line drawing

    for (const eraId of eraOrder) {
      const era = ERAS.find(e => e.id === eraId);
      if (!era) continue;
      const techs = techsByEra[eraId];
      if (techs.length === 0) continue;

      const col = Utils.createEl('div', '');
      col.style.cssText = 'display:flex;flex-direction:column;gap:6px;min-width:140px;max-width:160px;flex-shrink:0;';

      // Era header
      const eraHeader = Utils.createEl('div', '');
      eraHeader.style.cssText = `font-size:0.7rem;font-weight:600;color:${era.color};text-align:center;padding:4px 0;border-bottom:2px solid ${era.color}40;margin-bottom:4px;white-space:nowrap;`;
      eraHeader.textContent = era.label;
      col.appendChild(eraHeader);

      for (const tech of techs) {
        const isAdopted = adoptedIdSet.has(tech.id);
        const prereqsMet = techPrerequisitesMet(tech.id, adoptedIdSet);
        const inCurrentOrPastEra = era.techLevel <= currentEra.techLevel;
        const isAvailable = !isAdopted && prereqsMet && inCurrentOrPastEra;
        const isFutureEra = era.techLevel > currentEra.techLevel;
        const isLocked = !isAdopted && !isAvailable;

        let bgColor, borderColor, textColor, opacity;
        if (isAdopted) {
          bgColor = '#1a3a1a'; borderColor = '#2d5a2d'; textColor = '#8fbc8f'; opacity = '1';
        } else if (isAvailable) {
          bgColor = '#1a2a3a'; borderColor = '#4a6fa5'; textColor = '#a0c4e8'; opacity = '1';
        } else if (isFutureEra) {
          bgColor = '#1a1a1a'; borderColor = '#333'; textColor = '#666'; opacity = '0.6';
        } else {
          bgColor = '#2a2a2a'; borderColor = '#555'; textColor = '#888'; opacity = '0.75';
        }

        const node = Utils.createEl('div', '');
        node.style.cssText = `background:${bgColor};border:2px solid ${borderColor};border-radius:8px;padding:6px 8px;cursor:pointer;opacity:${opacity};transition:all 0.2s;position:relative;`;
        node.dataset.techId = tech.id;

        // Category color bar
        const catBar = Utils.createEl('div', '');
        catBar.style.cssText = `position:absolute;top:0;left:0;right:0;height:3px;background:${catColors[tech.category] || '#666'};border-radius:6px 6px 0 0;`;
        node.appendChild(catBar);

        // Status icon
        const statusIcon = isAdopted ? '✅' : isAvailable ? '🔓' : isFutureEra ? '⏳' : '🔒';
        const statusEl = Utils.createEl('div', '', `${statusIcon} ${tech.name}`);
        statusEl.style.cssText = `font-size:0.72rem;font-weight:600;color:${textColor};line-height:1.2;margin-top:2px;`;
        node.appendChild(statusEl);

        // Category label
        const catLabel = Utils.createEl('div', '');
        catLabel.style.cssText = `font-size:0.6rem;color:${catColors[tech.category] || '#666'};margin-top:2px;`;
        catLabel.textContent = TECH_CATEGORIES[tech.category]?.label || tech.category;
        node.appendChild(catLabel);

        // Prerequisites info
        if (tech.prerequisites && tech.prerequisites.length > 0 && !isAdopted) {
          const prereqEl = Utils.createEl('div', '');
          prereqEl.style.cssText = 'font-size:0.58rem;color:#888;margin-top:3px;';
          const prereqNames = tech.prerequisites.map(pid => {
            const pt = TECH_TREE_INDEX[pid];
            const met = adoptedIdSet.has(pid);
            return `${met ? '✓' : '✗'} ${pt?.name || pid}`;
          });
          prereqEl.textContent = prereqNames.join(', ');
          node.appendChild(prereqEl);
        }

        // Tooltip on hover
        node.title = `${tech.name}\n${TECH_CATEGORIES[tech.category]?.label || ''}\nEra: ${era.label}\n${isAdopted ? 'Discovered' : isAvailable ? 'Available for discovery' : isFutureEra ? 'Future era' : 'Prerequisites not met'}`;

        // Click handler: show effects
        node.onclick = () => this._showTreeTechDetail(tech, civ, isAdopted, isAvailable);

        // Hover effect
        node.onmouseenter = () => { node.style.transform = 'scale(1.03)'; node.style.boxShadow = `0 0 8px ${borderColor}60`; };
        node.onmouseleave = () => { node.style.transform = ''; node.style.boxShadow = ''; };

        col.appendChild(node);
        nodeElements[tech.id] = node;
      }

      treeContainer.appendChild(col);
    }

    treeWrap.appendChild(treeContainer);
    container.appendChild(treeWrap);

    // Draw prerequisite connection lines using SVG overlay
    requestAnimationFrame(() => {
      this._drawTreeConnections(treeContainer, nodeElements);
    });
  }

  _drawTreeConnections(treeContainer, nodeElements) {
    // Create SVG overlay
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    svg.setAttribute('width', treeContainer.scrollWidth);
    svg.setAttribute('height', treeContainer.scrollHeight);

    const containerRect = treeContainer.getBoundingClientRect();

    for (const [id, tech] of Object.entries(TECH_TREE_INDEX)) {
      if (!tech.prerequisites || tech.prerequisites.length === 0) continue;
      const targetNode = nodeElements[id];
      if (!targetNode) continue;

      for (const prereqId of tech.prerequisites) {
        const sourceNode = nodeElements[prereqId];
        if (!sourceNode) continue;

        const sRect = sourceNode.getBoundingClientRect();
        const tRect = targetNode.getBoundingClientRect();

        const x1 = sRect.right - containerRect.left;
        const y1 = sRect.top + sRect.height / 2 - containerRect.top;
        const x2 = tRect.left - containerRect.left;
        const y2 = tRect.top + tRect.height / 2 - containerRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Curved path for cleaner lines
        const midX = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
        line.setAttribute('d', d);
        line.setAttribute('stroke', '#444');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('fill', 'none');
        line.setAttribute('opacity', '0.5');
        svg.appendChild(line);
      }
    }

    treeContainer.insertBefore(svg, treeContainer.firstChild);
  }

  _showTreeTechDetail(tech, civ, isAdopted, isAvailable) {
    // Show a small detail popup for the selected tree tech
    let existing = document.getElementById('tech-tree-detail');
    if (existing) existing.remove();

    const panel = Utils.el('tech-panel');
    if (!panel) return;

    const overlay = Utils.createEl('div', '');
    overlay.id = 'tech-tree-detail';
    overlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--card-bg,#1a1a2e);border:1px solid var(--border,#333);border-radius:12px;padding:20px;z-index:1000;max-width:400px;width:90%;box-shadow:0 8px 24px rgba(0,0,0,0.5);';

    const closeBtn = Utils.createEl('button', 'btn btn-secondary btn-sm', '✕');
    closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;';
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const title = Utils.createEl('h3', '', `${tech.name}`);
    title.style.cssText = 'margin:0 0 8px;font-size:1rem;color:var(--text);';
    overlay.appendChild(title);

    const catEl = Utils.createEl('div', '', `${TECH_CATEGORIES[tech.category]?.icon || ''} ${TECH_CATEGORIES[tech.category]?.label || tech.category}`);
    catEl.style.cssText = 'font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;';
    overlay.appendChild(catEl);

    const eraInfo = ERAS.find(e => e.id === tech.era);
    const eraEl = Utils.createEl('div', '', `Era: ${eraInfo?.label || tech.era}`);
    eraEl.style.cssText = 'font-size:0.78rem;color:var(--text-dim);margin-bottom:8px;';
    overlay.appendChild(eraEl);

    // Status
    const status = isAdopted ? '✅ Discovered' : isAvailable ? '🔓 Available — prerequisites met' : '🔒 Locked';
    const statusEl = Utils.createEl('div', '', status);
    statusEl.style.cssText = `font-size:0.82rem;font-weight:600;color:${isAdopted ? '#8fbc8f' : isAvailable ? '#a0c4e8' : '#e08080'};margin-bottom:10px;`;
    overlay.appendChild(statusEl);

    // Effects
    if (tech.effect) {
      const effTitle = Utils.createEl('div', '', 'Effects:');
      effTitle.style.cssText = 'font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:4px;';
      overlay.appendChild(effTitle);

      const effList = Utils.createEl('div', '');
      effList.style.cssText = 'font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;';
      for (const [key, val] of Object.entries(tech.effect)) {
        const sign = val > 0 ? '+' : '';
        const effItem = Utils.createEl('div', '', `${key}: ${sign}${val}`);
        effItem.style.cssText = `color:${val > 0 ? '#8fbc8f' : '#e08080'};`;
        effList.appendChild(effItem);
      }
      overlay.appendChild(effList);
    }

    // Prerequisites
    if (tech.prerequisites && tech.prerequisites.length > 0) {
      const adoptedIdSet = buildAdoptedTechIdSet(civ.state.adoptedTechnologies);
      const prereqTitle = Utils.createEl('div', '', 'Prerequisites:');
      prereqTitle.style.cssText = 'font-size:0.78rem;font-weight:600;color:var(--text);margin-bottom:4px;';
      overlay.appendChild(prereqTitle);

      for (const pid of tech.prerequisites) {
        const pt = TECH_TREE_INDEX[pid];
        const met = adoptedIdSet.has(pid);
        const pEl = Utils.createEl('div', '', `${met ? '✅' : '❌'} ${pt?.name || pid}`);
        pEl.style.cssText = `font-size:0.75rem;color:${met ? '#8fbc8f' : '#e08080'};`;
        overlay.appendChild(pEl);
      }
    }

    // Unlocks (what techs does this enable?)
    const unlocks = Object.values(TECH_TREE_INDEX).filter(t => t.prerequisites && t.prerequisites.includes(tech.id));
    if (unlocks.length > 0) {
      const unlockTitle = Utils.createEl('div', '', 'Enables:');
      unlockTitle.style.cssText = 'font-size:0.78rem;font-weight:600;color:var(--text);margin-top:8px;margin-bottom:4px;';
      overlay.appendChild(unlockTitle);

      for (const u of unlocks) {
        const uEl = Utils.createEl('div', '', `→ ${u.name} (${ERAS.find(e => e.id === u.era)?.label || u.era})`);
        uEl.style.cssText = 'font-size:0.75rem;color:#a0c4e8;';
        overlay.appendChild(uEl);
      }
    }

    // Adoption progress bar (if available but not yet adopted)
    if (isAvailable && !isAdopted) {
      const pressure = civ.state._techAdoptionPressure?.[tech.name] || 0;
      if (pressure > 0) {
        const progTitle = Utils.createEl('div', '', 'Discovery Progress:');
        progTitle.style.cssText = 'font-size:0.78rem;font-weight:600;color:var(--text);margin-top:8px;margin-bottom:4px;';
        overlay.appendChild(progTitle);

        const progBar = Utils.createEl('div', '');
        progBar.style.cssText = 'background:#333;border-radius:4px;height:12px;overflow:hidden;';
        const fill = Utils.createEl('div', '');
        fill.style.cssText = `background:linear-gradient(90deg,#4a6fa5,#5b9bd5);height:100%;width:${Math.min(pressure, 100)}%;border-radius:4px;transition:width 0.3s;`;
        progBar.appendChild(fill);
        overlay.appendChild(progBar);

        const progLabel = Utils.createEl('div', '', `${Math.round(pressure)}%`);
        progLabel.style.cssText = 'font-size:0.7rem;color:var(--text-dim);text-align:center;margin-top:2px;';
        overlay.appendChild(progLabel);
      }
    }

    panel.style.position = 'relative';
    panel.appendChild(overlay);
  }

  // ── Helpers ──────────────────────────────────────────────────
  _getTargetCivs() {
    const sel = Utils.el('target-civ-selector');
    const val = sel?.value;
    if (!val || val === 'all') return this.game.civilizations.map(c => c.id);
    return [val];
  }
}
