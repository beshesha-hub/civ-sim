// ============================================================
// civilization.js - Civilization model
// ============================================================

class Civilization {
  constructor(options = {}) {
    this.id = Utils.uid();
    this.name = options.name || 'Unnamed Civilization';
    this.color = options.color || Utils.randChoice(CIV_COLORS);
    this.isPlayerCiv = options.isPlayerCiv || false;
    this.playerRole = options.playerRole || null;
    this.foundingYear = options.foundingYear || -3000;

    // ── The Three Independent Axes ────────────────────────────
    this.economic = this._initEconomic(options.economic || {});
    this.governance = this._initGovernance(options.governance || {});
    this.operatingPrinciples = this._initPrinciples(options.operatingPrinciples || {});
    this.religion = this._initReligion(options.religion || {});

    // Economy-based inheritance override: labor_credit defaults to meritocratic
    if (this.economic.modelId === 'labor_credit' && !options.governance?.inheritanceSystem) {
      this.governance.inheritanceSystem = 'meritocratic';
    }

    // ── Session-Scoped Research Flags ─────────────────────────
    // Not saved/loaded — always defaults to false on new simulation.
    this.suppressRandomEvents = false;

    // ── Computed State (updated each turn) ────────────────────
    this.state = {
      population: options.startPopulation || Utils.rand(500, 3000),
      behaviorReinforcement: this._computeInitialBehaviors(),
      dominantBehaviors: [],
      averageWellbeing: 50,
      equalityIndex: this._computeInitialEquality(),
      socialCohesion: 50,
      resourceStores: this._initResources(),
      technologyLevel: 1,
      adoptedTechnologies: [],
      globalWarmingContribution: 0,
      empathyLevel: this._computeInitialEmpathy(),
      leaderEmpathy: this._computeLeaderEmpathy(),
      stabilityIndex: 70,
      expansionPressure: 0,
      // ── Resource depletion & pollution ──────────────────────
      resourceDepletion: { forests: 100, minerals: 100, water: 100, soil: 100 },
      pollutionIndex: 0,       // 0–100; builds in industrial/market economies
      wasteAccumulation: 0,    // 0–100; population & luxury goods driven
      constructionProjects: [], // active multi-turn public works projects
      automationLevel: 0,       // 0–5; AI & robotics penetration level (see AUTOMATION_LEVELS)
      // ── Energy & Ecology ────────────────────────────────────────
      energySource: 'wood',      // 'wood'|'coal'|'oil'|'nuclear'|'renewable'|'fusion'
      energyEROI: 3,             // computed each turn from source + tech
      energySurplus: 0,          // eroi - complexity threshold; constrains innovation
      ecologicalCapacity: 100,   // computed from resource health + tech + infrastructure
      overshootRatio: 0.3,       // demand / capacity; >1 = overshoot
      overshootTurns: 0,         // consecutive turns in overshoot
      // ── Economy & Society Systems ─────────────────────────────
      educationQuality: 50,     // 0–100; absolute quality of education available
      educationAccess: 'universal_lower', // tier id; see EDUCATION_ACCESS_TIERS
      genderEquity: 50,         // 0–100; gender equity index
      institutionalQuality: 50, // 0–100; rule of law / institutional integrity
      epistemicHealth: 50,      // 0–100; press freedom / information environment quality
      demographicProfile: 'balanced', // 'young'|'balanced'|'aging'|'demographic_stress'
      financialDepth: 30,       // 0–100; sophistication of financial system
      debtLoad: 20,             // 0–100; aggregate debt burden
      debtModel: 'regulated_credit', // debt system type id; see DEBT_MODEL_TYPES
      minskyPhase: 25,          // 0–100; Kindleberger-Minsky cycle position (0=revulsion, 35=boom, 55=euphoria, 75=distress, 90=panic)
      yearsSinceFinancialCrisis: 50, // years since last financial crisis (high = fading memory)
      financialStability: 70,   // 0–100; overall health/resilience of financial system
      tradeDependency: 20,      // 0–100; share of prosperity from inter-civ trade
      tariffLevel: 30,          // 0–100; 0=free trade, 100=full protectionism
      authorityOrientation: 50, // 0–100; derived from governance hierarchy (0=hierarchical, 100=egalitarian)
      riskOrientation: 50,      // 0–100; derived from operatingPrinciples.innovationTolerance
      economicHistory: [],      // ring buffer, last 50 turns; for in-panel charts + Track 2 export
      // ── Family, Identity & Reproductive Health ───────────────
      familyStructure:             'nuclear',        // 'nuclear'|'extended'|'community_clan'
      sexualOrientationPolicy:     'tolerant',       // 'full_support'|'tolerant'|'grudging'|'suppressive'
      childcareNorm:               'mother_primary', // 'mother_primary'|'father_primary'|'shared'|'extended_family'|'institutional'
      reproductiveHealthTier:      'available',      // 'scandinavian'|'available'|'restricted'|'forbidden'
      familySizePolicy:            'neutral',        // 'large_encouraged'|'neutral'|'small_encouraged'|'strictly_controlled'
      // ── Women's Rights ───────────────────────────────────────
      womensRightsTier:            'mostly_full',    // 'full_parity'|'mostly_full'|'minimal'|'forbidden'
      // ── Science (separate from arts) ─────────────────────────
      scienceSupport:              50,               // 0–100; investment + appreciation for research
      scienceFreedom:              50,               // 0–100; autonomy of researchers / free inquiry
      scienceFreedomConstraint:    'none',           // 'none'|'government'|'capital'|'religion'|'mixed'
      // ── Arts & Culture (separate from science) ───────────────
      artsSupport:                 50,               // 0–100; investment + appreciation for arts/culture
      artsFreedom:                 50,               // 0–100; autonomy of artists / free expression
      artsFreedomConstraint:       'none',           // 'none'|'government'|'capital'|'religion'|'mixed'
      // ── Healthcare ───────────────────────────────────────────
      healthcareAccess:            'mixed_public_private', // see HEALTHCARE_ACCESS_TIERS
      healthcareEmphasis:          'balanced',             // 'prevention'|'treatment'|'balanced'
      healthcareIncentive:         'mixed',                // 'patient_outcomes'|'profit_first'|'mixed'
      // ── Resource Management ───────────────────────────────────
      resourceStrategy:            'balanced_stewardship', // see RESOURCE_STRATEGIES
      obsolescenceModel:           'regulated',            // 'durability_first'|'regulated'|'market_driven'
      resourceHistory:             [],                     // ring buffer, max 50 turns
      // ── Information Ecosystem ─────────────────────────────────
      informationEcosystem:        'free_market_media',    // see INFORMATION_ECOSYSTEM_TYPES
      // ── Social Psychology (Pass 7) ────────────────────────────
      susceptibilityModel:         'moderate_variation',   // fixed at init; log-normal sigma preset
      _susceptibilitySigma:        0.6,                    // derived from model at init
      empathyByStratum: { elite: 45, upper_middle: 58, lower_middle: 68, working_class: 75, disenfranchised: 80 },
      prosocialByStratum: { elite: 45, upper_middle: 58, lower_middle: 68, working_class: 75, disenfranchised: 55 },
      mutualAidCapacity:           50,   // 0–100; structural practicality of mutual aid
      opportunityCompetition:      50,   // 0–100; zero-sum-ness of upward mobility
      culturalEmpathyNorm:         65,   // 0–100; slow path-dependent drift
      hierarchyEntrenched:          0,   // 0–100; cohort resistance to elite empathy recovery
      brCoopScore:                 50,   // synthesized from behaviorReinforcement each turn
      prosocialBehavioralIndex:    50,   // combined PBI (empathy × BR interaction)
      effectiveHierarchyLevel:     50,   // max(govHierarchy, economicPowerHierarchy)
      economicPowerHierarchy:       0,   // wealth-concentration-derived power hierarchy
      govContributes:            true,   // false when economic power subsumes governance
      empathyHistory:              [],   // ring buffer max 50; for trend chart
      // ── Paradigm Shift Tracking ───────────────────────────────
      _prevGovModel:             null,
      _prevHierarchyLevel:       null,
      _prevEconModel:            null,
      _govShiftTurn:             null,
      _governanceDuration:          0,
      _prevGovernanceType:       null,
      _govShiftAge:                 0,
      _govShiftBaseline:         null,
      _govShiftDirection:        null,
      _econShiftTurn:            null,
      _econShiftAge:                0,
      _econShiftBaseline:        null,
      _econShiftDirection:       null,
      _shiftLog:                  [],    // last 5 shifts: [{type,turn,from,to,direction}]
      // ── Pass 7: Susceptibility Distribution (bimodal+gamma) ──────────────
      // Initialized in _computeSocietyInitials from SUSCEPTIBILITY_MODELS.
      // NOT altered by policy; only generational drift applies.
      susceptibilityDistribution: null, // set in _computeSocietyInitials
      // ── Pass 7: Lowest-Strata Cooperation/Competition Tension ────────────
      // Disenfranchised have no power → no empathy suppression.
      // Instead: tension between cooperation (empathy-driven mutual aid) and
      // cutthroat competition (scarcity-driven survival).
      lowestStrataTension: {
        cooperationPressure: 50,    // 0-100: pull toward mutual aid
        competitionPressure: 50,    // 0-100: pull toward cutthroat competition
        tensionScore: 0,            // abs(coop - comp): 0=resolved, 100=maximally torn
        dominantStrategy: 'neither',// 'cooperation'|'competition'|'neither'
        survivalMode: false,        // true when tensionScore > 70 AND stability < 30
      },
      // ── Pass 7: Empathy × Reinforcement Interaction ──────────────────────
      // Tracks combined effect of empathy suppression and behavioral reinforcement.
      // Interaction type reflects whether they compound or conflict.
      empathyReinforcementInteraction: {
        empathyComponent: 50,         // population-weighted empathy (0-100)
        reinforcementComponent: 50,   // brCoopScore (0-100)
        interactionType: 'neutral',   // 'virtuous'|'vicious'|'conflicted'|'neutral'
        combinedScore: 50,            // combined effect (0-100)
        synergyBonus: 0,              // modifier from interaction type (±15 max)
        byStratum: {
          elite:          { empathy: 50, reinforcement: 50, combined: 50, type: 'neutral' },
          upper_middle:   { empathy: 50, reinforcement: 50, combined: 50, type: 'neutral' },
          lower_middle:   { empathy: 50, reinforcement: 50, combined: 50, type: 'neutral' },
          working_class:  { empathy: 50, reinforcement: 50, combined: 50, type: 'neutral' },
          disenfranchised:{ empathy: 50, reinforcement: 50, combined: 50, type: 'neutral' },
        },
        history: [],  // ring buffer, last 50 turns: {turn, empathy, reinforcement, combined, type}
      },
      // ── Pass 7: Cultural Gap — Stated vs. Reinforced Values ──────────────
      // Gap between what education/culture teaches and what the economic/social
      // system actually rewards. Economic model is the PRIMARY driver of reinforced values.
      // Gap → cognitive dissonance → cynicism → revolutionary consciousness → paradigm shift readiness.
      culturalGap: {
        statedValues:    { cooperation: 65, empathy: 62, fairness: 60, civicDuty: 58, honesty: 62 },
        reinforcedValues:{ cooperation: 50, empathy: 45, fairness: 50, civicDuty: 50, honesty: 50 },
        gapScore: 0,                    // 0-100 aggregate gap
        cognitiveDissonanceLevel: 0,    // rises with gap
        cynicismLevel: 0,               // converted from dissonance (more stable, harder to reverse)
        revolutionaryConsciousness: 0,  // cynicism × epistemic health × gap
        paradigmShiftReadiness: 0,      // derived: rev consciousness normalized 0-100
        byStratum: {
          elite:          { gapPerception: 0, benefitFromGap: true,  psychologicalCost: 0 },
          upper_middle:   { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
          lower_middle:   { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
          working_class:  { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
          disenfranchised:{ gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
        },
        history: [],  // ring buffer, last 50 turns: {turn, gapScore, dissonance, cynicism, readiness}
      },
      // ── Pass 7: Wealth Capture ────────────────────────────────────────────
      // How much concentrated wealth has captured governance institutions.
      // Economic model is PRIMARY driver; wealth determines what IS and IS NOT reinforced.
      wealthCapture: {
        degree: 0,               // 0-100: overall capture of governance by wealth
        institutionalCapture: 0, // courts, regulatory agencies
        electoralCapture: 0,     // campaign finance, candidate selection
        mediaCapture: 0,         // information ecosystem
        culturalCapture: 0,      // what is normalized as desirable
        reinforcementControl: 0, // 0-100: % of behavioral reinforcement set by wealthy
        feudalDynamic: false,    // true when degree > 80 AND wealthConc > 75
        feudalIntensity: 0,      // 0-100
        history: [],             // ring buffer, last 50 turns: {turn, degree, reinforcementControl, feudalDynamic}
      },
      // ── Pass 7: Theocratic Empathy Bias ──────────────────────────────────
      // Active when governance === 'theocratic' OR religion dominance > 70.
      // Splits empathy into in-group (elevated) and out-group (suppressed) components.
      theocraticEmpathyBias: {
        active: false,
        inGroupEmpathy: 0,   // used for internal wellbeing calculations
        outGroupEmpathy: 0,  // used for cross-civ interactions
      },
      // ── Inter-civ Plague Responses ───────────────────────────
      // Keyed by affectedCivId: { response, turnsWaited, affectedCivName }
      // response: null (undecided) | 'quarantine' | 'aid' | 'refugees' | 'ignore' | 'resolved'
      plagueResponses: {},
      // ── Alien Contact State ──────────────────────────────────
      alienContactState: {
        stage: 'none',            // 'none' | 'signal' | 'confirmed' | 'ongoing' | 'ended_hostile'
        protocol: null,           // chosen response protocol id, or null
        relationshipScore: 50,    // 0–100; drifts each turn based on protocol
        turnsInContact: 0,        // turns elapsed since protocol adopted
        lastCommResult: null,     // 'success' | 'failure' | null — result of last communication attempt
        lastCommTurn: 0,          // turnsInContact value when last attempt was made
        breakthroughCount: 0,     // number of breakthrough events received
        breakdownCount: 0,        // number of breakdown events received
      },
      // ── Pass 8: Behavioral Inertia ────────────────────────────────────────
      // Explicit coefficient that slows behavioral change after paradigm shifts.
      // Old behavioral patterns resist replacement (Bourdieu's habitus).
      // behaviorShift from paradigm shifts is loaded here as deferred, not applied immediately.
      behaviorInertia: {
        coefficient: 0,      // 0–100; computed each turn from time-in-model + hierarchyEntrenched + wealthCapture + education
        deferredShift: {     // remaining behavioral delta still to trickle through from active/past shifts
          cooperation: 0, competition: 0, mutualAid: 0, acquisitiveness: 0,
          conformity: 0, innovation: 0, empathy: 0, deference: 0,
          individualism: 0, collectivism: 0,
        },
        inertiaHistory: [],  // ring buffer, last 50 turns: {turn, coefficient, pendingMagnitude}
      },
      // ── Pass 8: Facilitation Measures ────────────────────────────────────
      // Deliberate interventions to accelerate behavioral realignment after paradigm change.
      // Bounded by epistemic health (amplifier) and structural conditions (ceiling).
      facilitationState: {
        activeMeasures: [],  // [{measureId, turnsActive, turnsRemaining, totalEffect}]
        structuralCeiling: { // per-behavior ceiling computed from economic model + wealth capture
          cooperation: 100, competition: 100, mutualAid: 100, acquisitiveness: 100,
          conformity: 100, innovation: 100, empathy: 100, deference: 100,
          individualism: 100, collectivism: 100,
        },
        facilitationHistory: [], // ring buffer 50 turns: {turn, measuresActive, totalCynicismReduction, totalCoopBoost}
      },
      // ── Pass 8: Cooperative Outcomes ─────────────────────────────────────
      // Tracks whether cooperative behavior is materially rewarded under current conditions.
      // Positive feedback → reinforce cooperation; negative → weaken cooperation + raise cynicism.
      cooperativeOutcomes: {
        coopOutcomeScore: 50,       // 0–100: how much cooperation is materially rewarded
        feedback: 'neutral',        // 'reinforcing' | 'neutral' | 'weakening'
        feedbackMagnitude: 0,       // 0–1: strength of this turn's feedback
        cumulativeReinforcement: 0, // net accumulated reinforcement (+ = net positive over time)
        history: [],                // ring buffer 50 turns: {turn, score, feedback, magnitude}
      },
      // ── Pass 8: Threshold Events ─────────────────────────────────────────
      // Named turning-point events logged when state crosses defined thresholds.
      // Cooldowns prevent repeated firing during sustained threshold conditions.
      thresholdEvents: {
        fired: [],      // last 50: {thresholdId, turn, year, label, text, severity, color}
        _cooldowns: {}, // {thresholdId: turnsRemainingUntilNextFire}
      },
      // ── Pass 8: Consequence Deficit ──────────────────────────────────────
      // Accumulated impunity from unchecked abuse of power.
      // Each turn without accountability → deficit grows → future capture/corruption accelerates.
      // Recovery is slower than accumulation (asymmetric by design — mirrors real world).
      consequenceDeficit: {
        level: 0,                        // 0–100: accumulated impunity
        accelerationMultiplier: 1.0,     // ≥1.0; multiplies rate of corruption+capture growth
        turnsWithoutAccountability: 0,   // consecutive turns with low accountability
        lastAccountabilityEvent: null,   // turn of last meaningful accountability interruption
        accountabilityHistory: [],       // [{turn, type, deficitBefore, deficitAfter}] max 20
        deficitHistory: [],              // ring buffer 50 turns: {turn, level, multiplier}
      },
      // ── Pass 9: Cultural Homogeneity ─────────────────────────────────────────
      // 0 = highly pluralistic (many competing subcultures)
      // 100 = culturally monolithic (one dominant culture, minimal subculture diversity)
      // Derived from founding conditions. Drifts slowly each turn. NOT player-settable.
      culturalHomogeneity: {
        value: 50,       // 0–100; initialized by _initCulturalHomogeneity in simulation.js
        history: [],     // ring buffer, last 50 turns: {turn, year, value}
      },
      // ── Pass 9: Behavioral Contagion ─────────────────────────────────────────
      // Tracks cross-civilization norm diffusion — what this civ emits and absorbs.
      // Cooperation norms, cynicism, and epistemic health all drift toward neighbors
      // proportional to trade dependency, diplomatic attitude, and cultural receptivity.
      contagionState: {
        receivedInfluences: [], // last 10: {turn, sourceCivId, sourceCivName, vector, delta, absorbed}
        emittedInfluences:  [], // last 10: {turn, targetCivId, targetCivName, vector, delta}
        contagionHistory:   [], // ring buffer 50 turns: {turn, year, netCoopDelta, netCynicismDelta, netEHDelta}
      },
      // ── Feature 1: Natural Disaster Resilience ────────────────────
      naturalDisasterPreparedness: 20, // 0-100; from stateCapacity + tech + infrastructure
      lastNaturalDisasterYear: null,
      buildingCodeQuality: 10,         // 0-100; improves with tech + state capacity
      // ── Feature 2: Sovereign Debt / Fiscal Crisis ─────────────────
      sovereignDebtRatio: 20,          // 0-200; debt/GDP proxy (can exceed 100)
      debtServicingCost: 0,            // 0-50; portion of output spent on interest
      austerityLevel: 0,               // 0-100; current austerity measures
      fiscalCrisisActive: false,
      fiscalCrisisTurns: 0,
      capitalFlight: 0,                // 0-100; capital leaving the country
      lastDefaultYear: null,
      // ── Feature 3: Media/Information Ecosystem Enhancement ────────
      pressFreedom: 50,                // 0-100; RSF-style index
      mediaLiteracy: 30,               // 0-100; Finland model
      mediaOligarchCapture: 0,         // 0-100; Berlusconi/Murdoch capture
      publicBroadcasting: 0,           // 0-100; BBC/NHK model
      lastInvestigationYear: null,
      // ── Feature 4: Drug/Addiction Epidemics ───────────────────────
      addictionPrevalence: 0,          // 0-100; population affected
      addictionVulnerability: 0,       // 0-100; composite risk
      addictionResponse: 'none',       // 'none'|'prohibition'|'war_on_drugs'|'harm_reduction'|'decriminalization'
      addictionSubstance: null,        // 'alcohol'|'opium'|'opioids'|'synthetic'|null
      addictionForeignOrigin: false,   // true if weaponized by adversary (Opium Wars)
      // ── Feature 5: Generational Value Shifts (Inglehart) ──────────
      formativeConditions: [],         // ring buffer of 5: {turn, wb, stability, warActive, food}
      postMaterialistOrientation: 30,  // 0-100; 0=pure materialist, 100=pure post-materialist
      generationalConflict: 0,         // 0-100; tension between cohorts
      // ── Feature 6: Space Program ──────────────────────────────────
      spaceProgram: {
        active: false,
        prestige: 0,                   // 0-100
        achievements: [],              // ['satellite','crewed_orbit','moon_landing','space_station','mars_mission']
        stemBoost: 0,                  // 0-30; education quality bonus
        investmentLevel: 0,            // 0-100
        lastAchievementYear: null,
        lastFailureYear: null,
        history: [],                   // ring buffer 50
      },
      // ── Feature 7: Religious/Ideological Schism ───────────────────
      schismRisk: 0,                   // 0-100; accumulated fault line pressure
      schismActive: false,
      schismType: null,                // 'religious'|'ideological'|'ethnic_political'|null
      schismSeverity: 0,               // 0-100
      schismResolution: null,          // 'suppression'|'accommodation'|'reformation'|null
      schismResolutionProgress: 0,     // 0-100
      lastSchismYear: null,
      // ── Feature 8: Diaspora Networks ──────────────────────────────
      diasporaCommunities: {},         // { civId: { size, established, culturalMaintenance } }
      remittanceInflow: 0,             // 0-100; economic boost from abroad
      diasporaTradeBonus: 0,           // 0-50; trade facilitation bonus
      // ── Feature 9: Water/Resource Conflict Escalation ──────────────
      waterConflictStages: {},         // { civId: 'cooperation'|'tension'|'dispute'|'confrontation'|'conflict' }
      waterTreatyStatus: {},           // { civId: 'none'|'negotiating'|'signed'|'violated' }
      waterDiplomacyScore: 50,         // 0-100
    };

    // Apply society initial values derived from founding configuration
    this._computeSocietyInitials(options);

    // ── NPC Pool ──────────────────────────────────────────────
    this.npcs = [];

    // ── Active Events ─────────────────────────────────────────
    this.activeEvents = [];

    // ── History ───────────────────────────────────────────────
    this.history = [];

    // ── Relationships with other civs ─────────────────────────
    this.relations = new Map(); // civId -> { attitude: -100..100, trade: bool, war: bool }

    // ── Player-defined constitution text ─────────────────────
    this.constitutionText = options.constitutionText || '';

    // ── Movements / new philosophies that emerged ─────────────
    this.movements = [];

    // ── Colonization state ────────────────────────────────────
    // _colonizationType: null | 'enslavement' | 'extermination' | 'displacement' | 'subdued' | 'integrated'
    this._colonizationType     = null;
    this._independenceMovement = 0;   // 0–100; when it reaches 100, independence triggers
    this._colonizedSince       = null; // game year when colonization began

    // ── Migration state ───────────────────────────────────────
    this.migration = {
      netBalance:       options.migration?.netBalance      ?? 0,   // cumulative net (+ = net in)
      lastEvent:        options.migration?.lastEvent       ?? null, // 'influx' | 'outflow' | null
      lastEventTurn:    options.migration?.lastEventTurn   ?? 0,
      openBorderPolicy: options.migration?.openBorderPolicy ?? false,
    };

    // ── Slavery / forced labor ────────────────────────────────
    this.slavery = {
      active:               options.slavery?.active               ?? false,
      prevalence:           options.slavery?.prevalence           ?? 0,    // 0–100
      type:                 options.slavery?.type                 ?? null, // 'chattel'|'debt_bondage'|'forced_labor'|'penal'
      abolitionistMovement: options.slavery?.abolitionistMovement ?? 0,    // 0–100
      emancipatedYear:      options.slavery?.emancipatedYear      ?? null,
    };

    // ── Organized crime ───────────────────────────────────────
    this.organizedCrime = {
      type:                   options.organizedCrime?.type                   ?? null,  // 'street_gang'|'cartel'|'mafia'|'pirate_network'
      level:                  options.organizedCrime?.level                  ?? 0,     // 0–100
      turnsActive:            options.organizedCrime?.turnsActive            ?? 0,
      suppressionPolicy:      options.organizedCrime?.suppressionPolicy      ?? null,
      policyTurnsRemaining:   options.organizedCrime?.policyTurnsRemaining   ?? 0,
    };

    // ── Geography ─────────────────────────────────────────────
    this.geography = {
      oceanAccess:  options.geography?.oceanAccess  ?? true,        // true | false | 'island'
      placement:    options.geography?.placement    ?? 'continent', // 'continent' | 'island'
      terrainMix:   options.geography?.terrainMix   ?? [],          // array of terrain tag ids
      climateZone:  options.geography?.climateZone  ?? 'temperate', // 'arctic'|'temperate'|'subtropical'|'tropical'|'mixed'
    };

    this._updateDominantBehaviors();
  }

  // ── Initialisation Helpers ────────────────────────────────────
  _initEconomic(opts) {
    const model = ECONOMIC_MODELS[opts.model] || ECONOMIC_MODELS.gift;
    return {
      modelId: model.id,
      model,
      scarcityOrientation: opts.scarcityOrientation !== undefined ? opts.scarcityOrientation : model.scarcityOrientation,
      accumulationAllowed: opts.accumulationAllowed !== undefined ? opts.accumulationAllowed : model.accumulationAllowed,
      currencyType: opts.currencyType || model.currencyType,
      customDescription: opts.customDescription || '',
      wealthConcentration: { gift: 5, commons: 8, mixed: 20, labor_credit: 10, hierarchical: 40, market: 45 }[model.id] ?? 20,
      laborShare: opts.laborShare !== undefined ? opts.laborShare
        : { gift: 82, commons: 80, labor_credit: 75, barter: 65, mixed: 62,
            planned: 55, market: 57, commodity: 58, hierarchical: 45, none: 70 }[model.id] ?? 60,
    };
  }

  _initGovernance(opts) {
    const model = GOVERNANCE_MODELS[opts.model] || GOVERNANCE_MODELS.flat_consensus;
    const gov = {
      modelId: model.id,
      model,
      hierarchyLevel: opts.hierarchyLevel !== undefined ? opts.hierarchyLevel : model.hierarchyLevel,
      powerConcentration: opts.powerConcentration !== undefined ? opts.powerConcentration : model.powerConcentration,
      participationModel: opts.participationModel || 'voluntary',
      leadershipSelection: opts.leadershipSelection || 'consensus',
      conflictResolution: opts.conflictResolution || 'dialogue',
      corruptionLevel: 0,
      inheritanceSystem: opts.inheritanceSystem
        || { flat_consensus:'communal', direct_congress:'communal', rotating:'communal',
             representative:'partible', elder_council:'partible',
             autocratic:'primogeniture', oligarchy:'primogeniture',
             theocratic:'primogeniture', tribal_chief:'primogeniture',
             shadow_government_complicit:'primogeniture', shadow_government_covert:'primogeniture',
             none:'communal' }[model.id] || 'partible',
    };
    gov.leader = this._generateLeader(gov);
    return gov;
  }

  // Generate a named leader for high-power-concentration governance models.
  // Returns null for flat/leaderless structures.
  _generateLeader(gov) {
    if ((gov.powerConcentration || 0) < 40) return null;
    const FIRST = ['Aral','Berin','Cova','Dalis','Emon','Farev','Gura','Holis','Ivar','Joris',
                   'Kalen','Lyra','Moru','Nessa','Othar','Pira','Quelm','Ravan','Sovi','Telin',
                   'Uran','Vasha','Welo','Xira','Yoven','Zara'];
    const LAST  = ['the Bold','the Elder','the Just','the Strong','of the Valley','of the Coast',
                   'the Lawgiver','of the Mountain','the Cunning','the Pious','the Wise','the Firm'];
    const TITLES = {
      autocratic:                    'Supreme Leader',
      theocratic:                    'High Priest',
      oligarchy:                     'First Among Peers',
      tribal_chief:                  'Chieftain',
      representative:                'Prime Minister',
      elder_council:                 'Elder Speaker',
      rotating:                      'Acting Head',
      shadow_government_complicit:   'Director-General',
      shadow_government_covert:      'Prime Minister',   // appears normal; leader sincerely believes they hold real power
      world_federation:              'Federal Chair',
      // failed_state: powerConcentration < 40 → returns null above; no title needed
    };
    return {
      name:         Utils.randChoice(FIRST) + ' ' + Utils.randChoice(LAST),
      title:        TITLES[gov.modelId] || 'Leader',
      age:          35 + Math.floor(Utils.random() * 28),   // 35–62
      healthIndex:  75 + Math.floor(Utils.random() * 26),   // 75–100
      yearsInPower: 0,
    };
  }

  _initPrinciples(opts) {
    return {
      freedomLevel: opts.freedomLevel !== undefined ? opts.freedomLevel : 60,
      collectivismLevel: opts.collectivismLevel !== undefined ? opts.collectivismLevel : 50,
      participationVoluntary: opts.participationVoluntary !== undefined ? opts.participationVoluntary : 70,
      outsiderRelationship: opts.outsiderRelationship || 'trading',
      coreValues: opts.coreValues || ['mutual respect', 'sustainability'],
      constitutionText: opts.constitutionText || '',
      innovationTolerance: opts.innovationTolerance !== undefined ? opts.innovationTolerance : 50,
      conflictNorm: opts.conflictNorm || 'dialogue',
    };
  }

  _initReligion(opts) {
    return {
      presence: opts.presence || 'none',
      stateRelationship: opts.stateRelationship || 'separate',
      religions: opts.religions || [],
      theocraticLevel: opts.presence === 'theocratic' ? 90 : 0,
    };
  }

  _initResources() {
    return {
      food: 1000,
      materials: 500,
      knowledge: 100,
      labor: 1000,
      luxury: 0,
    };
  }

  // ── Behavior Computation ──────────────────────────────────────
  _computeInitialBehaviors() {
    const behaviors = {
      cooperation:      50,
      competition:      50,
      mutualAid:        50,
      acquisitiveness:  50,
      conformity:       50,
      innovation:       50,
      empathy:          50,
      deference:        50,
      individualism:    50,
      collectivism:     50,
    };

    // Apply economic model modifiers
    this._applyBehaviorModifiers(behaviors, this.economic.model.behaviorModifiers || {});

    // Apply governance model modifiers
    this._applyBehaviorModifiers(behaviors, this.governance.model.behaviorModifiers || {});

    // Apply operating principles
    const p = this.operatingPrinciples;
    behaviors.individualism  += (100 - p.collectivismLevel) * 0.2;
    behaviors.collectivism   += p.collectivismLevel * 0.2;
    behaviors.deference      += (100 - p.freedomLevel) * 0.2;
    behaviors.innovation     += p.innovationTolerance * 0.15;
    behaviors.conformity     += (100 - p.participationVoluntary) * 0.1;

    // Apply religion
    if (this.religion.presence === 'theocratic') {
      behaviors.conformity += 20;
      behaviors.deference  += 25;
      behaviors.innovation -= 10;
    }

    // Clamp all
    for (const k of Object.keys(behaviors)) {
      behaviors[k] = Utils.clamp(behaviors[k], 0, 100);
    }

    return behaviors;
  }

  _applyBehaviorModifiers(behaviors, modifiers) {
    for (const [key, delta] of Object.entries(modifiers)) {
      if (key in behaviors) behaviors[key] = Utils.clamp(behaviors[key] + delta, 0, 100);
    }
  }

  _computeInitialEquality() {
    const gov = this.governance;
    const econ = this.economic;
    // High hierarchy & accumulation → low equality
    let equality = 80;
    equality -= gov.hierarchyLevel * 0.5;
    equality -= gov.powerConcentration * 0.3;
    if (econ.accumulationAllowed) equality -= 15;
    equality -= econ.scarcityOrientation * 0.2;
    return Utils.clamp(equality, 5, 95);
  }

  _computeInitialEmpathy() {
    let empathy = 60;
    empathy += (100 - this.governance.hierarchyLevel) * 0.15;
    empathy += this.operatingPrinciples.collectivismLevel * 0.1;
    return Utils.clamp(empathy, 20, 90);
  }

  _computeLeaderEmpathy() {
    // Leaders start with some empathy but power suppresses it over time
    const baseEmpathy = this._computeInitialEmpathy();
    const suppressionRate = this.governance.powerConcentration / 100;
    return Utils.clamp(baseEmpathy * (1 - suppressionRate * 0.5), 10, 95);
  }

  _updateDominantBehaviors() {
    const b = this.state.behaviorReinforcement;
    const sorted = Object.entries(b).sort((a, b) => b[1] - a[1]);
    this.state.dominantBehaviors = sorted.slice(0, 3).map(([k]) => k);
  }

  // ── Turn Update ───────────────────────────────────────────────
  processTurn(yearsDelta, mapTiles, allCivs) {
    this._updateBehaviorReinforcement(yearsDelta);
    this._updateEmpathyAndPower(yearsDelta);
    this._updatePopulation(yearsDelta, mapTiles);
    this._updateResources(mapTiles);
    this._updateResourceDepletion(yearsDelta);
    this._updatePollution(yearsDelta);
    this._updateWellbeing();
    this._updateRelations(allCivs);
    this._processActiveEvents(yearsDelta);
    this._updateWarmingContribution();
    this._updateDominantBehaviors();
    this._decayCorruption();
    if (this._occupiedBy) this._updateIndependenceMovement(yearsDelta);
  }

  _updateBehaviorReinforcement(yearsDelta) {
    const b = this.state.behaviorReinforcement;
    const target = this._computeInitialBehaviors(); // recalculate target based on current params

    // Each turn, actual behaviors drift toward what the paradigm reinforces
    const driftRate = 0.04 * (yearsDelta / 10);
    for (const key of Object.keys(b)) {
      b[key] = Utils.lerp(b[key], target[key], driftRate);
      // Random social variation
      b[key] += Utils.randFloat(-1.5, 1.5);
      b[key] = Utils.clamp(b[key], 0, 100);
    }

    // Movements shift behavior
    for (const movement of this.movements) {
      if (movement.active) {
        const influence = movement.strength * 0.02 * driftRate;
        this._applyBehaviorModifiers(b, movement.behaviorModifiers);
      }
    }
  }

  _updateEmpathyAndPower(yearsDelta) {
    const suppression = this.governance.powerConcentration / 100;
    const role = this.playerRole ? PLAYER_ROLES[this.playerRole] : null;
    const playerSuppression = role ? role.empathySuppression : 0;

    // NOTE: empathyLevel and leaderEmpathy are now driven by _processEmpathyCascade
    // in simulation.js (Pass 7). The old per-stratum lerp has been replaced.
    // This method now only handles the power-concentration → corruption pathway.

    // High power concentration → corruption grows over time
    if (this.governance.powerConcentration > 60) {
      this.governance.corruptionLevel = Utils.clamp(
        this.governance.corruptionLevel + 0.1 * (yearsDelta / 10), 0, 80
      );
    }
  }

  _updatePopulation(yearsDelta, mapTiles) {
    let growthRate;

    if (this.state.demographicTransitionStage !== undefined && this.state._populationGrowthRate !== undefined) {
      // Demographic transition system active — use computed growth rate
      growthRate = this.state._populationGrowthRate * (yearsDelta / 10);
    } else {
      // Fallback: original base growth calculation
      const fertility = this._getAverageFertility(mapTiles);
      const wellbeing = this.state.averageWellbeing;
      growthRate = 0.005 * (yearsDelta / 10);
      growthRate *= (fertility / 8);
      growthRate *= (wellbeing / 70);
      growthRate -= this.governance.corruptionLevel * 0.0002;
    }

    // Event effects (always applied)
    for (const ev of this.activeEvents) {
      if (ev.populationRisk) growthRate -= ev.populationRisk * 0.5;
    }

    // Starvation penalty (always applied — direct feedback)
    const food = this.state.resourceStores.food;
    if (food < 100) growthRate -= 0.02;

    let delta = Math.floor(this.state.population * growthRate);

    // Population inertia: large populations decline more slowly (Fix 5)
    // Demographic momentum — large populations have built-in growth inertia
    // from age structure (young populations keep growing even after fertility drops)
    if (delta < 0 && this.state.population > 500) {
      const inertiaFactor = 1 / (1 + Math.log(this.state.population / 500) * 0.3);
      delta = Math.floor(delta * inertiaFactor);
    }

    // R4b-3: Low-population recovery — when population is far below carrying capacity,
    // resources per capita are abundant, empty land attracts settlers and refugees,
    // and birth rates rise (Malthusian logic). This prevents the 200 floor from
    // binding for most scenarios. Historical: post-plague Europe saw rapid recovery;
    // frontier societies grew fast due to available land.
    const carryingCap = this.state.carryingCapacity ?? 5000;
    if (this.state.population < carryingCap * 0.1 && delta <= 0) {
      // At very low population relative to capacity, add recovery growth
      const recoveryRate = Math.min(0.01, (1 - this.state.population / (carryingCap * 0.1)) * 0.02);
      delta = Math.max(delta, Math.floor(this.state.population * recoveryRate));
      if (delta < 1 && this.state.population < carryingCap * 0.05) delta = Math.max(delta, 1);
    }

    this.state.population = Math.max(50, this.state.population + delta);
  }

  _getAverageFertility(mapTiles) {
    if (!mapTiles || mapTiles.length === 0) return 5;
    const sum = mapTiles.reduce((s, t) => s + (t.fertility || 5), 0);
    return sum / mapTiles.length;
  }

  _updateResources(mapTiles) {
    const tiles = mapTiles || [];
    const tileCount = Math.max(1, tiles.length);

    // Food production
    const fertility = this._getAverageFertility(tiles);
    let foodProd = fertility * tileCount * 2 + this.state.population * 0.1;

    // Economic model effects
    if (this.economic.modelId === 'gift' || this.economic.modelId === 'commons') {
      foodProd *= 1.1; // cooperative bonus
    }
    if (this.economic.modelId === 'market') {
      foodProd *= 1.2; // efficiency bonus
    }

    // Active event effects
    for (const ev of this.activeEvents) {
      if (ev.fertilityCost) foodProd *= (1 + ev.fertilityCost / 100);
    }

    // Consumption
    const foodCons = this.state.population * 0.8;
    const netFood = foodProd - foodCons;
    this.state.resourceStores.food = Utils.clamp(
      this.state.resourceStores.food + netFood * 0.1, 0, 999999
    );

    // Knowledge / innovation
    const innovationRate = this.state.behaviorReinforcement.innovation / 100;
    this.state.resourceStores.knowledge += innovationRate * 2 + Utils.randFloat(0, 0.5);
  }

  _updateWellbeing() {
    const b = this.state.behaviorReinforcement;
    const gov = this.governance;
    const p = this.operatingPrinciples;

    let wellbeing = 50;

    // High cooperation and mutual aid → wellbeing
    wellbeing += (b.cooperation - 50) * 0.2;
    wellbeing += (b.mutualAid - 50) * 0.2;

    // High empathy → wellbeing
    wellbeing += (this.state.empathyLevel - 50) * 0.15;

    // Equality → wellbeing
    wellbeing += (this.state.equalityIndex - 50) * 0.2;

    // Freedom → wellbeing
    wellbeing += (p.freedomLevel - 50) * 0.1;

    // Corruption → wellbeing loss
    wellbeing -= gov.corruptionLevel * 0.3;

    // High acquisitiveness without adequate distribution → wellbeing loss
    if (b.acquisitiveness > 60 && this.state.equalityIndex < 40) {
      wellbeing -= (b.acquisitiveness - 60) * 0.2;
    }

    // Resources
    if (this.state.resourceStores.food < 100) wellbeing -= 20;

    // Pollution erodes wellbeing — health, air quality, contaminated water
    const pollution = this.state.pollutionIndex || 0;
    if (pollution > 20) wellbeing -= (pollution - 20) * 0.25;

    // Severe soil/water depletion hits food security and quality of life
    const dep = this.state.resourceDepletion;
    if (dep) {
      if (dep.soil < 40)  wellbeing -= (40 - dep.soil)  * 0.1;
      if (dep.water < 40) wellbeing -= (40 - dep.water) * 0.15;
      if (dep.forests < 20) wellbeing -= (20 - dep.forests) * 0.05;
    }

    // Colonization penalty — living under occupation suppresses wellbeing
    if (this._occupiedBy) {
      const penaltyByType = {
        extermination: 30, enslavement: 25, displacement: 20,
        subdued: 12, integrated: 5,
      };
      wellbeing -= (penaltyByType[this._colonizationType] || 15);
    }

    // Active disasters
    for (const ev of this.activeEvents) {
      if (ev.type === 'disaster') wellbeing -= 10;
    }

    this.state.averageWellbeing = Utils.clamp(
      Utils.lerp(this.state.averageWellbeing, wellbeing, 0.15),
      0, 100
    );

    // Update equality: drifts based on economic & governance structure
    const targetEquality = this._computeInitialEquality();
    this.state.equalityIndex = Utils.clamp(
      Utils.lerp(this.state.equalityIndex, targetEquality, 0.03),
      0, 100
    );

    // Wealth concentration — multiplicative drift (Kesten/Pareto dynamics)
    // Concentration accelerates as it grows, matching empirical wealth distributions
    const _wc = this.economic.wealthConcentration;
    const _inheritMult = { communal: 0.7, partible: 0.85, meritocratic: 1.0, primogeniture: 1.3 }
      [this.governance.inheritanceSystem] ?? 1.0;
    if (this.economic.accumulationAllowed && this.governance.hierarchyLevel > 40) {
      // Base rate calibrated so delta ≈ old +0.05 at wc=20, accelerating at higher wc
      const hierarchyFactor = (this.governance.hierarchyLevel - 40) / 60; // 0..1
      const baseRate = 0.003 * (0.5 + hierarchyFactor) * _inheritMult;
      this.economic.wealthConcentration = Utils.clamp(_wc * (1 + baseRate), 0, 95);
    } else if (!this.economic.accumulationAllowed) {
      // Exponential decay toward model-specific floor
      const floor = { gift: 3, commons: 5, planned: 8, none: 5 }[this.economic.modelId] ?? 5;
      this.economic.wealthConcentration = Utils.clamp(
        floor + (_wc - floor) * 0.99, floor, 50
      );
    }
  }

  _updateRelations(allCivs) {
    for (const other of allCivs) {
      if (other.id === this.id) continue;
      if (!this.relations.has(other.id)) {
        this.relations.set(other.id, { attitude: Utils.rand(20, 60), trade: false, war: false });
      }
      const rel = this.relations.get(other.id);
      // Keep the neighbor's current name fresh (names can change via regime events)
      rel.name = other.name;

      // Compatible operating principles → better relations
      // Rate 0.005: gentle pull toward compatible values, allows structural
      // friction (governance clash, military rivalry, food crisis) to dominate
      // when real grievances exist. At 0.02, the pull was so strong that
      // attitudes could never go negative enough for wars to occur.
      const valuesCompatibility = this._compatibilityWith(other);
      rel.attitude = Utils.clamp(
        Utils.lerp(rel.attitude, valuesCompatibility * 100, 0.005) + Utils.randFloat(-1.5, 1.5),
        -100, 100
      );

      // Expansionist → more tension
      if (this.operatingPrinciples.outsiderRelationship === 'expansionist') {
        rel.attitude -= 0.5;
      }
    }
  }

  _compatibilityWith(other) {
    const p1 = this.operatingPrinciples;
    const p2 = other.operatingPrinciples;
    const diff = Math.abs(p1.collectivismLevel - p2.collectivismLevel) +
                 Math.abs(p1.freedomLevel - p2.freedomLevel);
    return 1 - (diff / 200);
  }

  _processActiveEvents(yearsDelta) {
    this.activeEvents = this.activeEvents.filter(ev => {
      ev.turnsRemaining -= 1;
      return ev.turnsRemaining > 0;
    });
  }

  _updateWarmingContribution() {
    const techLevel = this.state.technologyLevel;
    const econ = this.economic;

    let contrib = 0;
    // Industrial+ tech contributes to warming
    if (techLevel >= 8) {
      contrib = (techLevel - 7) * 2;
      // Market economy amplifies
      if (econ.modelId === 'market') contrib *= 1.4;
      if (econ.modelId === 'gift' || econ.modelId === 'commons') contrib *= 0.5;
    }

    // Adopted renewables reduce contribution
    if (this.state.adoptedTechnologies.includes('Renewable Energy')) contrib -= 5;
    if (this.state.adoptedTechnologies.includes('Fusion Power')) contrib -= 15;

    this.state.globalWarmingContribution = Math.max(0, contrib);
  }

  _decayCorruption() {
    // Strong participation and transparency reduce corruption
    if (this.governance.participationModel === 'voluntary' &&
        this.governance.powerConcentration < 50) {
      this.governance.corruptionLevel = Math.max(0, this.governance.corruptionLevel - 0.05);
    }
  }

  // ── Resource Depletion ────────────────────────────────────────
  _updateResourceDepletion(yearsDelta) {
    const dep    = this.state.resourceDepletion;
    const techLv = this.state.technologyLevel;
    const econId = this.economic.modelId;
    const pop    = this.state.population;
    const scale  = yearsDelta / 10;
    const isGift = econId === 'gift' || econId === 'commons';

    // Deforestation — scales with population and industrial activity
    // Market/commodity economies over-extract; gift/commons preserve
    let forestRate = (pop / 5000) * scale;
    if (techLv >= 7) forestRate += (techLv - 6) * 0.3 * scale; // industrial logging
    // Moderated: was 1.5/0.4 (3.75x gap). Now 1.3/0.6 (2.2x gap).
    // Real difference should emerge from resource strategy choices, not hardcoded.
    if (econId === 'market' || econId === 'commodity') forestRate *= 1.3;
    if (isGift) forestRate *= 0.6;
    if (this.state.adoptedTechnologies.includes('Sustainable Agriculture')) forestRate *= 0.5;
    // Resource strategy multiplier (set each turn by _processResourceStrategy in simulation.js)
    const resMod = this.state._resourceDepletionMod ?? 1.0;
    dep.forests = Utils.clamp(dep.forests - forestRate * resMod, 0, 100);

    // Soil quality — intensive farming degrades it; sustainable practices help
    let soilRate = (pop / 8000) * scale;
    if (econId === 'market') soilRate *= 1.2; // was 1.3 — moderate monoculture pressure
    if (isGift) soilRate *= 0.7; // was 0.5
    // Forests act as a soil buffer
    if (dep.forests > 60) soilRate *= 0.6;
    if (this.state.adoptedTechnologies.includes('Sustainable Agriculture')) soilRate *= 0.4;
    dep.soil = Utils.clamp(dep.soil - soilRate * resMod, 0, 100);

    // Mineral depletion — industrial extraction
    let mineralRate = 0;
    if (techLv >= 8) {
      mineralRate = ((techLv - 7) * 0.4 + (pop / 10000)) * scale;
      if (econId === 'market' || econId === 'commodity') mineralRate *= 1.3; // was 1.6
      if (isGift) mineralRate *= 0.6; // was 0.5
    } else if (techLv >= 5) {
      mineralRate = 0.05 * scale; // slow pre-industrial extraction
    }
    dep.minerals = Utils.clamp(dep.minerals - mineralRate * resMod, 0, 100);

    // Water quality — degrades with pollution and population; forests help
    // Deforestation → rainfall disruption feedback (Amazon tipping point model):
    // Forests generate ~30% of their own rainfall through transpiration.
    // Below 40% forest cover, regional rainfall declines sharply (Nobre et al. 2016).
    // Below 20%, hydrological collapse — aquifers don't recharge, rivers shrink.
    const pollutionPressure = (this.state.pollutionIndex || 0) / 100;
    let waterRate = (pop / 10000 + pollutionPressure * 0.5) * scale;
    if (dep.forests > 50) waterRate *= 0.6; // forests filter water and maintain rainfall
    else if (dep.forests < 40) {
      // Deforestation → water crisis: rainfall disruption, aquifer depletion
      // Accelerating water loss as forests decline below critical threshold
      waterRate *= 1.0 + (40 - dep.forests) / 40 * 1.5; // up to 2.5x at forests=0
    }
    if (this.state.adoptedTechnologies.includes('Sanitation Systems')) waterRate *= 0.5;
    dep.water = Utils.clamp(dep.water - waterRate * resMod, 0, 100);

    // Soil slowly recovers if population is low and forests are healthy
    if (pop < 1000 && dep.forests > 60 && dep.soil < 80) {
      dep.soil = Math.min(80, dep.soil + 0.1 * scale);
    }
    // Forests recover slightly in low-tech, low-pop eras
    if (techLv <= 3 && pop < 2000 && dep.forests < 90) {
      dep.forests = Math.min(90, dep.forests + 0.2 * scale);
    }
  }

  // ── Pollution ─────────────────────────────────────────────────
  _updatePollution(yearsDelta) {
    const techLv = this.state.technologyLevel;
    const econId = this.economic.modelId;
    const pop    = this.state.population;
    const scale  = yearsDelta / 10;
    const isGift = econId === 'gift' || econId === 'commons';

    // Pollution only meaningful from industrial era onward
    if (techLv < 7) {
      // Pre-industrial: very slow organic accumulation; natural systems handle it
      this.state.pollutionIndex = Math.max(0, this.state.pollutionIndex - 0.1 * scale);
      this.state.wasteAccumulation = Math.max(0, this.state.wasteAccumulation - 0.05 * scale);
      return;
    }

    // Industrial era pollution accumulation
    let pollutionRate = ((techLv - 6) * 1.5 + pop / 5000) * scale;
    // Economic model multipliers moderated to avoid built-in bias.
    // Real-world data: market economies have higher per-capita pollution than
    // subsistence/commons economies, but the gap is ~1.5-2x, not 6x.
    // The difference should emerge primarily from BEHAVIOR (resource strategy,
    // tech adoption, institutional quality) not from hardcoded multipliers.
    if (econId === 'market')    pollutionRate *= 1.4; // was 1.8 — externalities exist but moderate
    if (econId === 'commodity') pollutionRate *= 1.3; // was 1.5
    if (isGift)                  pollutionRate *= 0.5; // was 0.3 — still lower but less extreme
    if (econId === 'planned')    pollutionRate *= 1.2; // unchanged — no price signal issues real

    // Technologies that reduce pollution
    if (this.state.adoptedTechnologies.includes('Renewable Energy'))  pollutionRate *= 0.5;
    if (this.state.adoptedTechnologies.includes('Fusion Power'))       pollutionRate *= 0.1;
    if (this.state.adoptedTechnologies.includes('Sanitation Systems')) pollutionRate *= 0.8;

    // Forests absorb some pollution
    const forestBuffer = (this.state.resourceDepletion.forests / 100) * 0.4;
    pollutionRate *= (1 - forestBuffer);

    // Resource/obsolescence strategy multipliers (set each turn by _processResourceStrategy)
    const polMod = this.state._pollutionMod ?? 1.0;
    this.state.pollutionIndex = Utils.clamp(
      this.state.pollutionIndex + pollutionRate * polMod, 0, 100
    );

    // Persistent pollutants: at high pollution levels, natural decay slows dramatically.
    // PFAS, microplastics, heavy metals, PCBs persist in soil/water for decades-centuries.
    // Below 30: natural systems can handle it (biodegradation, dilution)
    // 30-60: some persistence but manageable
    // Above 60: persistent pollutants accumulate — natural decay almost stops
    // Above 80: bioaccumulation — pollution becomes self-reinforcing as toxins
    // concentrate up the food chain (DDT, mercury in fish)
    const currentPol = this.state.pollutionIndex;
    if (currentPol > 60) {
      // Reduce natural cleanup rate — pollutants persist
      // At pollution=80, natural decay is only 20% effective
      // At pollution=100, natural decay is only 10% effective
      const persistenceFactor = Math.max(0.1, 1.0 - (currentPol - 60) / 50);
      // Apply persistence by adding back some of what would naturally decay
      // (simulates pollutants that resist breakdown)
      const resistedDecay = pollutionRate * polMod * (1 - persistenceFactor) * 0.3;
      this.state.pollutionIndex = Utils.clamp(
        this.state.pollutionIndex + resistedDecay, 0, 100);
    }

    // Waste accumulation — population and luxury goods driven
    let wasteRate = (pop / 8000 + (this.state.resourceStores.luxury || 0) / 500) * scale;
    if (econId === 'market' || econId === 'commodity') wasteRate *= 1.3; // was 1.5
    if (isGift) wasteRate *= 0.6; // was 0.4
    if (this.state.adoptedTechnologies.includes('Sanitation Systems')) wasteRate *= 0.5;
    const wstMod = this.state._wasteMod ?? 1.0;
    this.state.wasteAccumulation = Utils.clamp(
      this.state.wasteAccumulation + wasteRate * wstMod, 0, 100
    );

    // Persistent waste: microplastics, nuclear waste, non-degradable materials
    // Above waste=50, natural decomposition slows (half-life increases)
    if (this.state.wasteAccumulation > 50) {
      const wastePersist = (this.state.wasteAccumulation - 50) / 100 * 0.2 * scale;
      this.state.wasteAccumulation = Utils.clamp(
        this.state.wasteAccumulation + wastePersist, 0, 100);
    }

    // High waste accelerates disease → population penalty applied via wellbeing
    if (this.state.wasteAccumulation > 60 && Utils.random() < 0.05 * scale) {
      this.state.population = Math.max(50, Math.floor(this.state.population * 0.99));
    }
  }

  // ── Independence Movement ─────────────────────────────────────
  _updateIndependenceMovement(yearsDelta) {
    if (!this._occupiedBy) return;
    const scale       = yearsDelta / 10;
    const wellbeing   = this.state.averageWellbeing;
    const equality    = this.state.equalityIndex;
    const cooperation = this.state.behaviorReinforcement.cooperation || 50;

    // Each turn of occupation slowly builds independence pressure
    let buildRate = 0.5 * scale;

    // Low wellbeing accelerates the movement
    if (wellbeing < 30) buildRate += 1.5 * scale;
    else if (wellbeing < 45) buildRate += 0.8 * scale;

    // Low equality under occupation fuels resentment
    if (equality < 35) buildRate += 0.8 * scale;

    // High cooperation within the occupied civ enables collective action
    if (cooperation > 65) buildRate += 0.5 * scale;

    // Harsh colonization types accelerate resistance
    if (this._colonizationType === 'enslavement' || this._colonizationType === 'extermination') {
      buildRate += 1.5 * scale;
    }
    if (this._colonizationType === 'displacement') buildRate += 0.8 * scale;
    if (this._colonizationType === 'integrated')   buildRate *= 0.3; // integrated → slower

    this._independenceMovement = Utils.clamp(
      this._independenceMovement + buildRate + Utils.randFloat(-0.3, 0.3), 0, 100
    );
  }

  // ── Event Application ─────────────────────────────────────────
  applyEvent(event) {
    this.activeEvents.push({ ...event, turnsRemaining: event.duration || 3 });
    this.addHistoryEntry(event.year || this.state?.turn || 0, `Event: ${event.label ?? event.id ?? 'Unknown'}`, event.description ?? '');
  }

  applyTechnology(tech) {
    if (this.state.adoptedTechnologies.includes(tech.name)) return false;
    this.state.adoptedTechnologies.push(tech.name);

    // Also store the tech id for prerequisite tracking
    if (tech.id) {
      if (!this.state.adoptedTechIds) this.state.adoptedTechIds = [];
      if (!this.state.adoptedTechIds.includes(tech.id)) {
        this.state.adoptedTechIds.push(tech.id);
      }
    }

    // Apply tech effects
    if (tech.effect) {
      if (tech.effect.fertility) {
        // Applied to tiles externally
      }
      if (tech.effect.innovation) {
        this.state.behaviorReinforcement.innovation = Utils.clamp(
          this.state.behaviorReinforcement.innovation + tech.effect.innovation, 0, 100
        );
      }
      if (tech.effect.populationGrowth) {
        this.state.population = Math.floor(this.state.population * (1 + tech.effect.populationGrowth / 100));
      }
      if (tech.effect.warmingContrib) {
        this.state.globalWarmingContribution += tech.effect.warmingContrib;
      }
      if (tech.effect.cooperation) {
        this.state.behaviorReinforcement.cooperation = Utils.clamp(
          this.state.behaviorReinforcement.cooperation + tech.effect.cooperation, 0, 100
        );
      }
      if (tech.effect.production) {
        // Production boosts applied as innovation proxy
        this.state.behaviorReinforcement.innovation = Utils.clamp(
          (this.state.behaviorReinforcement.innovation || 50) + (tech.effect.production * 0.1), 0, 100
        );
      }
      if (tech.effect.cohesion) {
        this.state.socialCohesion = Utils.clamp(
          (this.state.socialCohesion ?? 50) + tech.effect.cohesion, 0, 100
        );
      }
    }

    return true;
  }

  applyMovement(movement) {
    this.movements.push({ ...movement, active: true, strength: 50, turnActive: 0 });
    this.addHistoryEntry(movement.year || this.state?.turn || 0, `New Movement: ${movement.name ?? 'Unknown'}`, movement.description ?? '');
  }

  // ── Regime Change ─────────────────────────────────────────────
  // type: 'conquered' | 'liberated' | 'revolution_democratic' | 'revolution_authoritarian'
  applyRegimeChange(type, source, gameYear) {
    const sourceName = source ? source.name : 'internal forces';

    if (type === 'conquered') {
      // Determine colonization type from attacker's values & behaviors
      let colType = 'subdued'; // default
      if (source) {
        const srcEmpathy = source.state ? (source.state.empathyLevel || 50) : 50;
        const srcAcquis  = source.state ? (source.state.behaviorReinforcement.acquisitiveness || 50) : 50;
        const srcCoop    = source.state ? (source.state.behaviorReinforcement.cooperation || 50) : 50;
        const srcOutsider = source.operatingPrinciples ? source.operatingPrinciples.outsiderRelationship : 'trading';
        const compatibility = source._compatibilityWith ? source._compatibilityWith(this) : 0.4;

        if (srcEmpathy < 20 && srcAcquis > 75) {
          colType = 'extermination'; // extreme aggression, very low empathy
        } else if (srcAcquis > 70 && srcEmpathy < 40) {
          colType = 'enslavement';   // extraction-focused, low empathy
        } else if (srcOutsider === 'assimilating' && srcEmpathy < 50) {
          colType = 'displacement';  // drive them out, take the land
        } else if (compatibility > 0.7 && srcCoop > 60 && srcEmpathy > 55) {
          colType = 'integrated';    // attacker's values align closely; gentler absorption
        } else {
          colType = 'subdued';       // default: governed but not eliminated
        }
      }
      this._colonizationType     = colType;
      this._colonizedSince       = gameYear;
      this._independenceMovement = 0;

      // Governance shifts toward conqueror's model
      if (source) {
        this.governance.powerConcentration = Utils.clamp(
          Math.round((this.governance.powerConcentration + source.governance.powerConcentration) / 2) + 15, 0, 100);
        this.governance.hierarchyLevel = Utils.clamp(
          Math.round((this.governance.hierarchyLevel + source.governance.hierarchyLevel) / 2) + 10, 0, 100);
        this.governance.modelId = source.governance.modelId;
        if (source.governance.model) {
          this.governance.model = source.governance.model;
        } else if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[source.governance.modelId]) {
          this.governance.model = GOVERNANCE_MODELS[source.governance.modelId];
        }
        this.governance.corruptionLevel = Utils.clamp(this.governance.corruptionLevel + 20, 0, 100);
      }

      // Severity of immediate wellbeing/stability loss varies by colonization type
      const wellbeingHit  = { extermination: 40, enslavement: 30, displacement: 25, subdued: 18, integrated: 8 }[colType] || 20;
      const stabilityHit  = { extermination: 40, enslavement: 35, displacement: 28, subdued: 22, integrated: 10 }[colType] || 25;
      const popMultiplier = { extermination: 0.50, enslavement: 0.85, displacement: 0.70, subdued: 0.92, integrated: 0.97 }[colType] || 0.90;

      this.state.averageWellbeing = Utils.clamp(this.state.averageWellbeing - wellbeingHit, 0, 100);
      this.state.stabilityIndex   = Utils.clamp(this.state.stabilityIndex   - stabilityHit, 0, 100);
      this.state.socialCohesion   = Utils.clamp(this.state.socialCohesion   - 15, 0, 100);
      this.state.population       = Math.max(50, Math.floor(this.state.population * popMultiplier));

      // Mark as occupied — NPCs will reflect this
      this._occupiedBy = sourceName;

      // Colonization-type-specific history narrative
      const colNarratives = {
        extermination: `${sourceName}'s conquest of ${this.name} has been conducted with extreme brutality. The native population has been subjected to mass killing — the territory is being cleared and resettled. What existed here before is being systematically destroyed. The human cost is catastrophic; the survivors live in terror.`,
        enslavement:   `Following conquest by ${sourceName}, the population of ${this.name} has been subjected to coerced labor. The colonizer extracts economic value from the people they have conquered: their work, their land, their productive capacity. The governing structure has been reorganized entirely around extraction. People are property in all but name.`,
        displacement:  `${sourceName}'s conquest of ${this.name} has driven significant portions of the population from their land. Territory is being absorbed and repopulated; the original inhabitants are being forced to the margins — displaced from their homes, their communities fractured, their connection to place severed.`,
        subdued:       `Following conquest by ${sourceName}, the governing structure of ${this.name} has been reorganized to align with the occupier's model. Power has concentrated further, corruption has risen, and the population lives under foreign authority. Life continues — but the terms of it are no longer set by the people who live here.`,
        integrated:    `${sourceName}'s absorption of ${this.name} has been relatively measured — the occupier's values are close enough that outright destruction has been avoided. The governance has shifted, and the people are not free, but the worst forms of colonial violence have not occurred. Whether this becomes genuine integration or slow assimilation remains to be seen.`,
      };

      this.addHistoryEntry(gameYear,
        `Colonized by ${sourceName}`,
        colNarratives[colType] || colNarratives.subdued,
        'colonization');

    } else if (type === 'liberated') {
      const formerOccupier   = this._occupiedBy || 'the occupying power';
      const formerColType    = this._colonizationType;
      const yearsOccupied    = (gameYear && this._colonizedSince) ? Math.abs(gameYear - this._colonizedSince) : 0;
      const path             = this._independenceMovement >= 100 ? 'movement' : 'war';

      // Governance opens up after liberation
      this.governance.powerConcentration = Utils.clamp(this.governance.powerConcentration - 20, 0, 100);
      this.governance.hierarchyLevel     = Utils.clamp(this.governance.hierarchyLevel     - 15, 0, 100);
      this.governance.corruptionLevel    = Utils.clamp(this.governance.corruptionLevel    - 10, 0, 100);
      this.state.averageWellbeing        = Utils.clamp(this.state.averageWellbeing        + 10, 0, 100);
      this.state.stabilityIndex          = Utils.clamp(this.state.stabilityIndex          +  5, 0, 100);
      // Boost cooperation and agency after successful independence
      this.state.behaviorReinforcement.cooperation = Utils.clamp(
        (this.state.behaviorReinforcement.cooperation || 50) + 10, 0, 100);

      this._occupiedBy           = null;
      this._colonizationType     = null;
      this._independenceMovement = 0;
      this._colonizedSince       = null;

      const durationText = yearsOccupied > 0 ? ` after ${yearsOccupied} years of occupation` : '';
      const pathNarrative = path === 'movement'
        ? `The independence movement built its pressure through collective action, refusal, and sustained resistance, until the occupier's position became untenable.`
        : `Independence was won through armed uprising — a war of liberation that extracted a heavy cost in lives but ended foreign rule.`;
      const colTypeContext = {
        extermination: `What ${formerOccupier} did here during the occupation will not be easily forgotten or forgiven. The liberation is real; the wounds are also real and deep.`,
        enslavement:   `For those who lived through the enforced labor of occupation, liberation means more than political change — it means the possibility of reclaiming one's own time and body. That is not a small thing.`,
        displacement:  `Many of those displaced during the occupation will never return to what they left. Liberation restores sovereignty; it cannot restore all that was lost.`,
        subdued:       `The occupation reorganized this society's governance and extracted what it could. Liberation begins the longer work of deciding what to rebuild — and on whose terms.`,
        integrated:    `The occupation was softer than others, but it was still occupation — an external authority over people who did not choose it. Independence returns that choice.`,
      }[formerColType] || '';

      this.addHistoryEntry(gameYear,
        `Independence from ${formerOccupier}`,
        `${this.name} has achieved independence from ${formerOccupier}${durationText}. ${pathNarrative} ${colTypeContext} The governing structure is being rebuilt — power is diffusing, old hierarchies weakened. What kind of society emerges from this moment will depend on what the people who lived through it choose to build.`,
        'independence');

    } else if (type === 'revolution_democratic') {
      const oldModel = this.governance.modelId;
      this.governance.powerConcentration = Utils.clamp(this.governance.powerConcentration - 28, 0, 100);
      this.governance.hierarchyLevel = Utils.clamp(this.governance.hierarchyLevel - 22, 0, 100);
      this.governance.modelId = 'representative';
      if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS.representative) {
        this.governance.model = GOVERNANCE_MODELS.representative;
      }
      this.governance.participationModel = 'voluntary';
      this.governance.corruptionLevel = Utils.clamp(this.governance.corruptionLevel - 15, 0, 100);
      this.operatingPrinciples.freedomLevel = Utils.clamp(this.operatingPrinciples.freedomLevel + 15, 0, 100);
      this.state.stabilityIndex = Utils.clamp(this.state.stabilityIndex - 15, 0, 100);
      this.state.behaviorReinforcement.cooperation = Utils.clamp(
        this.state.behaviorReinforcement.cooperation + 5, 0, 100);
      this.addHistoryEntry(gameYear,
        `Democratic Revolution`,
        `The people of ${this.name} have overthrown the ${oldModel} order that governed them. The revolution was driven by accumulated grievances — inequality, restricted participation, corruption — reaching a breaking point. A new representative structure is being built in the ruins of the old one. Whether it holds will depend on what the revolution's participants can agree to build together.`,
        'revolution');

    } else if (type === 'revolution_authoritarian') {
      const oldModel2 = this.governance.modelId;
      this.governance.powerConcentration = Utils.clamp(this.governance.powerConcentration + 28, 0, 100);
      this.governance.hierarchyLevel = Utils.clamp(this.governance.hierarchyLevel + 22, 0, 100);
      this.governance.modelId = 'autocratic';
      if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS.autocratic) {
        this.governance.model = GOVERNANCE_MODELS.autocratic;
      }
      this.governance.corruptionLevel = Utils.clamp(this.governance.corruptionLevel + 20, 0, 100);
      this.operatingPrinciples.freedomLevel = Utils.clamp(this.operatingPrinciples.freedomLevel - 20, 0, 100);
      this.state.stabilityIndex = Utils.clamp(this.state.stabilityIndex - 10, 0, 100);
      this.state.behaviorReinforcement.deference = Utils.clamp(
        (this.state.behaviorReinforcement.deference || 50) + 15, 0, 100);
      this.addHistoryEntry(gameYear,
        `Authoritarian Seizure of Power`,
        `${this.name} has undergone a seizure of power. The ${oldModel2} system has been dismantled and replaced with concentrated authority. The stated justification — stability, security, the need for decisive leadership — may or may not reflect the actual motivations of those who now hold power. What is certain is that the space for dissent has narrowed sharply.`,
        'revolution');
    }

    // Refresh NPC pool to reflect new conditions
    if (typeof generateNPCPool === 'function') {
      this.npcs = generateNPCPool(this);
    }
    // Regenerate leader after major governance change
    this.governance.leader = this._generateLeader(this.governance);
  }

  // ── Leadership Events ──────────────────────────────────────────
  // type: 'natural_death' | 'assassination' | 'incapacitation'
  // Returns { leaderName, title, eventTitle, description } for notification / history use.
  applyLeadershipEvent(type, currentYear) {
    const leader    = this.governance.leader;
    const leaderName = leader ? `${leader.title} ${leader.name}` : 'the leader';
    const powerConc  = this.governance.powerConcentration;
    const govId      = this.governance.modelId;
    const stability  = Math.round(this.state.stabilityIndex);

    // Stability / corruption deltas scaled by how concentrated power is
    const STABILITY_HITS = {
      natural_death:    { autocratic:20, theocratic:20, oligarchy:10, tribal_chief:18, representative:5,  elder_council:5,  rotating:5,  shadow_government_complicit:5,  shadow_government_covert:8,  world_federation:3,  default:10 },
      assassination:    { autocratic:30, theocratic:30, oligarchy:20, tribal_chief:25, representative:15, elder_council:12, rotating:12, shadow_government_complicit:10, shadow_government_covert:18, world_federation:8,  default:18 },
      incapacitation:   { autocratic:15, theocratic:15, oligarchy:8,  tribal_chief:12, representative:5,  elder_council:3,  rotating:3,  shadow_government_complicit:3,  shadow_government_covert:6,  world_federation:2,  default:8  },
    };
    // Note: shadow_government_complicit has low stability hit on leader death — the shadow network
    // has already prepared a successor. Covert is higher because the visible leader genuinely led.
    // World federation is very low — power is distributed; no single leader is irreplaceable.
    const stabilityHit = (STABILITY_HITS[type]?.[govId] ?? STABILITY_HITS[type]?.default ?? 10);
    this.state.stabilityIndex = Utils.clamp(this.state.stabilityIndex - stabilityHit, 0, 100);

    const corruptionBoost = type === 'assassination' ? 20 : type === 'natural_death' ? 5 : 3;
    this.governance.corruptionLevel = Utils.clamp(this.governance.corruptionLevel + corruptionBoost, 0, 100);

    if (type === 'assassination') {
      this.state.behaviorReinforcement.cooperation = Utils.clamp(
        (this.state.behaviorReinforcement.cooperation || 50) - 10, 0, 100);
    }

    let eventTitle, description;
    if (type === 'natural_death') {
      eventTitle = `Death of ${leaderName}`;
      description = `${leaderName} of ${this.name} has died after ${leader?.yearsInPower ?? 0} years in power. ` +
        `The transition of leadership has created a period of uncertainty. ` +
        (powerConc > 70
          ? `The concentration of power in a single office means the succession process carries significant risk — factions are already maneuvering for position.`
          : `The governing structure has begun the process of selecting a successor. The period of transition will test institutional resilience.`);
      // Generate successor
      this.governance.leader = this._generateLeader(this.governance);
      if (this.governance.leader) this.governance.leader.yearsInPower = 0;
    } else if (type === 'assassination') {
      eventTitle = `Assassination of ${leaderName}`;
      description = `${leaderName} of ${this.name} has been assassinated. ` +
        `The killing has shocked the governing structure and triggered an acute crisis. ` +
        (stability < 30
          ? `In the context of existing instability, the assassination risks triggering broader violence or a power struggle.`
          : `Security forces are on high alert. The question of who ordered the killing — and who benefits — is already shaping the succession crisis.`);
      // Generate successor
      this.governance.leader = this._generateLeader(this.governance);
      if (this.governance.leader) this.governance.leader.yearsInPower = 0;
    } else {
      // incapacitation — leader may recover
      const recovers = Utils.random() < 0.5;
      eventTitle = `${leaderName} Incapacitated`;
      description = `${leaderName} of ${this.name} has suffered a serious health crisis and is no longer able to govern. ` +
        (recovers
          ? `After a period of medical intervention, recovery appears likely — but the governing structure has been left in a state of ambiguity in the interim.`
          : `The condition is not expected to improve. A succession process has begun under difficult circumstances.`);
      if (!recovers) {
        this.governance.leader = this._generateLeader(this.governance);
        if (this.governance.leader) this.governance.leader.yearsInPower = 0;
      } else if (leader) {
        // Partial health recovery
        leader.healthIndex = Utils.clamp(leader.healthIndex + 20, 0, 60);
      }
    }

    this.addHistoryEntry(currentYear, eventTitle, description, 'leadership');

    // Refresh NPC pool
    if (typeof generateNPCPool === 'function') {
      this.npcs = generateNPCPool(this);
    }

    return { leaderName, eventTitle };
  }

  // ── History ───────────────────────────────────────────────────
  addHistoryEntry(year, title, description, type = 'event') {
    const safeTitle = (!title || String(title) === 'undefined') ? 'Unknown Event' : String(title);
    const safeDesc  = (!description || String(description) === 'undefined') ? '' : String(description);
    this.history.push({
      year:        year ?? 0,
      title:       safeTitle,
      description: safeDesc,
      type,
      id: Utils.uid(),
    });
    if (this.history.length > CONFIG.MAX_HISTORY_EVENTS) {
      this.history.shift();
    }
  }

  // ── Summary for UI ────────────────────────────────────────────
  getSummary() {
    const b = this.state.behaviorReinforcement;
    return {
      name: this.name,
      color: this.color,
      population: this.state.population.toLocaleString(),
      wellbeing: Math.round(this.state.averageWellbeing),
      equality: Math.round(this.state.equalityIndex),
      empathy: Math.round(this.state.empathyLevel),
      leaderEmpathy: Math.round(this.state.leaderEmpathy),
      dominantBehaviors: this.state.dominantBehaviors,
      economic: this.economic.model.label,
      governance: this.governance.model.label,
      religion: this.religion.presence,
      corruption: Math.round(this.governance.corruptionLevel),
      wealthConcentration: Math.round(this.economic.wealthConcentration),
      food: Math.round(this.state.resourceStores.food),
      knowledge: Math.round(this.state.resourceStores.knowledge),
      topBehavior: this.state.dominantBehaviors[0] || 'cooperation',
      warmingContrib: Math.round(this.state.globalWarmingContribution),
      technologies: this.state.adoptedTechnologies,
      movements: this.movements.filter(m => m.active).map(m => m.name),
      // Depletion & pollution
      pollutionIndex:       Math.round(this.state.pollutionIndex || 0),
      wasteAccumulation:    Math.round(this.state.wasteAccumulation || 0),
      forestHealth:         Math.round((this.state.resourceDepletion || {}).forests ?? 100),
      soilHealth:           Math.round((this.state.resourceDepletion || {}).soil    ?? 100),
      waterQuality:         Math.round((this.state.resourceDepletion || {}).water   ?? 100),
      mineralReserves:      Math.round((this.state.resourceDepletion || {}).minerals ?? 100),
      // Colonization
      occupiedBy:           this._occupiedBy || null,
      colonizationType:     this._colonizationType || null,
      independenceMovement: Math.round(this._independenceMovement || 0),
    };
  }

  // ── Config Export / Import ────────────────────────────────────
  exportConfig() {
    return Utils.encodeConfig({
      name: this.name,
      color: this.color,
      economic: { model: this.economic.modelId, scarcityOrientation: this.economic.scarcityOrientation,
                  accumulationAllowed: this.economic.accumulationAllowed },
      governance: { model: this.governance.modelId, hierarchyLevel: this.governance.hierarchyLevel,
                    participationModel: this.governance.participationModel },
      operatingPrinciples: this.operatingPrinciples,
      religion: { presence: this.religion.presence, stateRelationship: this.religion.stateRelationship,
                  religions: this.religion.religions },
    });
  }

  static fromPreset(presetId, options = {}) {
    const preset = CIVILIZATION_PRESETS[presetId];
    if (!preset) return new Civilization(options);
    return new Civilization({ ...preset, ...options });
  }

  // ── Society Initials: derive from founding config ─────────────
  _computeSocietyInitials(options) {
   try {
    const econ     = this.economic?.modelId  || options.economic?.model  || 'market';
    const gov      = this.governance?.modelId|| options.governance?.model|| 'representative';
    const freedom  = this.operatingPrinciples?.freedomLevel ?? 60;
    const collectv = this.operatingPrinciples?.collectivismLevel ?? 50;
    const innov    = this.operatingPrinciples?.innovationTolerance ?? 60;
    const hierarch = this.governance?.hierarchyLevel ?? 5;
    const religion = this.religion?.stateRelationship || options.religion?.stateRelationship || 'separate';

    // If setup wizard provided explicit overrides, use those
    const soc = options.society || {};

    // Diagnostic: log what the wizard provided vs what the constructor is using
    if (this.isPlayerCiv) {
      console.log('[CivSim] Player civ init — econ:', econ, '| gov:', gov, '| freedom:', freedom);
      console.log('[CivSim] Wizard society data:', JSON.stringify(soc));
      console.log('[CivSim] Wizard societyFamily:', JSON.stringify(options.societyFamily || {}));
      console.log('[CivSim] Wizard societyHealth:', JSON.stringify(options.societyHealth || {}));
      console.log('[CivSim] Wizard societyResources:', JSON.stringify(options.societyResources || {}));
      console.log('[CivSim] Wizard societyInfo:', JSON.stringify(options.societyInfo || {}));
    }

    // Education access — derived from economic + governance models unless overridden
    if (!soc.educationAccess) {
      if (econ === 'gift' || econ === 'commons' || econ === 'labor_credit')
        this.state.educationAccess = 'universal';
      else if (gov === 'autocratic' || gov === 'theocratic')
        this.state.educationAccess = 'limited';
      else if (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert')
        this.state.educationAccess = 'free_basic_expensive_higher';
      else if (econ === 'market')
        this.state.educationAccess = 'universal_lower';
      else
        this.state.educationAccess = 'free_basic_expensive_higher';
    } else {
      this.state.educationAccess = soc.educationAccess;
    }

    // Education quality — derived from freedom level unless overridden
    this.state.educationQuality = soc.educationQuality !== undefined
      ? soc.educationQuality
      : Utils.clamp(Math.round(freedom * 0.7 + 15), 10, 90);

    // Gender equity — derived from governance + collectivism
    if (soc.genderEquity !== undefined) {
      this.state.genderEquity = soc.genderEquity;
    } else {
      const govGEI = {
        direct_congress: 75, flat_consensus: 70, rotating: 65,
        representative: 55, none: 55, elder_council: 35,
        oligarchy: 35, tribal_chief: 30, autocratic: 25, theocratic: 20,
        shadow_government_complicit: 38, shadow_government_covert: 35,
      }[gov] ?? 50;
      this.state.genderEquity = Utils.clamp(
        Math.round(govGEI + (collectv - 50) * 0.3), 0, 100
      );
    }

    // Institutional quality — derived from governance
    this.state.institutionalQuality = Utils.clamp(({
      direct_congress: 72, flat_consensus: 65, representative: 60,
      rotating: 55, elder_council: 45, theocratic: 40,
      tribal_chief: 35, autocratic: 32, oligarchy: 28,
      shadow_government_complicit: 25, shadow_government_covert: 20, none: 15,
    }[gov] ?? 50), 0, 100);

    // Epistemic health — governance + state religion penalty
    let baseEH = ({
      direct_congress: 78, flat_consensus: 70, rotating: 65,
      representative: 62, none: 50, elder_council: 42,
      oligarchy: 38, tribal_chief: 38, autocratic: 28,
      shadow_government_complicit: 30, shadow_government_covert: 25, theocratic: 22,
    }[gov] ?? 50);
    if (religion === 'state') baseEH -= 18;
    this.state.epistemicHealth = Utils.clamp(Math.round(baseEH), 0, 100);

    // Social Trust — willingness to trust strangers and institutions
    // Governance type sets the baseline; corruption and inequality erode it
    const govTrust = {
      direct_congress: 72, flat_consensus: 75, rotating: 65,
      representative: 58, elder_council: 50, none: 45,
      oligarchy: 35, tribal_chief: 40, autocratic: 30,
      shadow_government_complicit: 20, shadow_government_covert: 15, theocratic: 38,
    }[gov] ?? 45;
    const corrPenalty = (this.state.corruptionLevel ?? 0) * 0.2;
    this.state.socialTrust = soc.socialTrust !== undefined
      ? soc.socialTrust
      : Utils.clamp(Math.round(govTrust - corrPenalty), 0, 100);

    // State Capacity — ability to implement policy (distinct from institutional design quality)
    // Autocracies can have HIGH capacity; democracies may have LOW capacity
    const govCapacity = {
      direct_congress: 55, flat_consensus: 50, rotating: 45,
      representative: 60, elder_council: 40, none: 15,
      oligarchy: 50, tribal_chief: 30, autocratic: 65,
      shadow_government_complicit: 55, shadow_government_covert: 45, theocratic: 55,
    }[gov] ?? 40;
    this.state.stateCapacity = soc.stateCapacity !== undefined
      ? soc.stateCapacity
      : Utils.clamp(Math.round(govCapacity), 0, 100);

    // Social Mobility — ability to move between strata
    const mobBase = {
      direct_congress: 70, flat_consensus: 72, rotating: 65,
      representative: 55, elder_council: 35, none: 50,
      oligarchy: 25, tribal_chief: 30, autocratic: 30,
      shadow_government_complicit: 20, shadow_government_covert: 20, theocratic: 28,
    }[gov] ?? 45;
    const edBonus = (this.state.educationQuality ?? 50) > 50 ? 5 : 0;
    this.state.socialMobility = soc.socialMobility !== undefined
      ? soc.socialMobility
      : Utils.clamp(Math.round(mobBase + edBonus), 0, 100);
    this.state.perceivedMobility = soc.perceivedMobility !== undefined
      ? soc.perceivedMobility
      : this.state.socialMobility; // starts aligned with actual
    this.state.mobilityGap = 0; // actual - perceived, computed per turn

    // Infrastructure — built up slowly, decays without maintenance investment
    // Roman road effects measurable 2000+ years later (De Benedictis et al., 2023)
    this.state.infrastructureLevel = soc.infrastructureLevel !== undefined
      ? soc.infrastructureLevel
      : Utils.clamp(({
          direct_congress: 45, flat_consensus: 40, rotating: 35,
          representative: 55, elder_council: 30, none: 10,
          oligarchy: 50, tribal_chief: 20, autocratic: 55,
          shadow_government_complicit: 45, shadow_government_covert: 40, theocratic: 45,
        }[gov] ?? 35) + ({ market: 10, planned: 5, mixed: 8 }[econ] ?? 0), 0, 100);
    this.state.maintenanceDebt = soc.maintenanceDebt ?? 0;

    // Anomie — rises with rapid change, falls with community stability
    // Durkheim: breakdown of social norms during periods of rapid transition
    this.state.anomieLevel = soc.anomieLevel ?? 0;

    // ── Round 13 / Tier 2 Metrics ──────────────────────────────────────

    // Urbanization Rate — fraction of population in cities
    this.state.urbanizationRate = soc.urbanizationRate ?? Utils.clamp(({
        flat_consensus: 10, rotating: 15, direct_congress: 25,
        representative: 40, elder_council: 10, none: 5,
        oligarchy: 35, tribal_chief: 5, autocratic: 30,
        shadow_government_complicit: 35, shadow_government_covert: 30, theocratic: 20,
      }[gov] ?? 15) + ({ market: 15, planned: 10, mixed: 12, gift: 0, barter: 0, commons: 5 }[econ] ?? 5), 0, 100);

    // Military Power — strength and influence of the military apparatus
    this.state.militaryPower = soc.militaryPower ?? Utils.clamp(({
        autocratic: 60, theocratic: 50, oligarchy: 45, tribal_chief: 55,
        representative: 35, elder_council: 25, rotating: 20,
        direct_congress: 30, flat_consensus: 10, none: 5,
        shadow_government_complicit: 55, shadow_government_covert: 50,
      }[gov] ?? 30), 0, 100);

    // Civilian Control — effectiveness of civilian oversight over military
    this.state.civilianControl = soc.civilianControl ?? Utils.clamp(({
        representative: 70, direct_congress: 65, flat_consensus: 75,
        rotating: 70, elder_council: 55, none: 30,
        oligarchy: 50, autocratic: 40, theocratic: 45,
        tribal_chief: 35, shadow_government_complicit: 30, shadow_government_covert: 25,
      }[gov] ?? 50), 0, 100);

    // Legitimacy Type — Weber's tripartite: traditional, charismatic, rational-legal
    this.state.legitimacyType = soc.legitimacyType ?? ({
        autocratic: 'traditional', theocratic: 'traditional',
        oligarchy: 'traditional', tribal_chief: 'traditional',
        representative: 'rational-legal', direct_congress: 'rational-legal',
        flat_consensus: 'rational-legal', rotating: 'rational-legal',
        elder_council: 'traditional', none: 'charismatic',
        shadow_government_complicit: 'rational-legal', shadow_government_covert: 'rational-legal',
      }[gov] ?? 'traditional');

    // Legitimacy Level — how legitimate the current government is perceived
    this.state.legitimacyLevel = soc.legitimacyLevel ?? Utils.clamp(({
        representative: 65, direct_congress: 60, flat_consensus: 70,
        rotating: 55, elder_council: 60, autocratic: 50,
        oligarchy: 45, theocratic: 70, tribal_chief: 55,
        none: 20, shadow_government_complicit: 35, shadow_government_covert: 40,
      }[gov] ?? 50), 0, 100);

    // Food Security — ability to feed the population
    this.state.foodSecurity = soc.foodSecurity ?? 60;

    // Collective Trauma — intergenerational trauma from catastrophic events
    // Extremely slow decay (~500-year half-life). Set by war, famine, slavery, genocide.
    this.state.collectiveTrauma = soc.collectiveTrauma ?? 0;

    // Land Ownership Concentration — Gini-like measure of land distribution (0=equal, 100=total concentration)
    // Latin America: ~84 from colonial grants; Nordic: ~50; post-reform: lower.
    // Fixed-supply resource creating strong path dependency.
    this.state.landConcentration = soc.landConcentration ?? Utils.clamp(({
        flat_consensus: 10, rotating: 15, direct_congress: 20,
        elder_council: 30, tribal_chief: 35, representative: 40,
        shadow_government_covert: 55, theocratic: 60, autocratic: 65,
        shadow_government_complicit: 70, oligarchy: 75, none: 25,
      }[gov] ?? 40), 0, 100);

    // Caste / Rigid Stratification — hereditary barriers to social mobility (0=none, 100=absolute)
    // Not just economic inequality; social/hereditary barriers that cap mobility regardless of other factors.
    this.state.casteRigidity = soc.casteRigidity ?? Utils.clamp(({
        flat_consensus: 0, direct_congress: 5, rotating: 5,
        representative: 10, shadow_government_covert: 20,
        shadow_government_complicit: 30, elder_council: 35,
        tribal_chief: 40, autocratic: 50, theocratic: 55,
        oligarchy: 60, none: 0,
      }[gov] ?? 15), 0, 100);

    // Institutional Lock-in — self-reinforcing feedback where institutions create constituencies
    // that actively prevent reform (distinct from behavioral inertia which is passive resistance)
    this.state.institutionalLockin = soc.institutionalLockin ?? Utils.clamp(({
        none: 5, flat_consensus: 10, rotating: 10,
        direct_congress: 15, tribal_chief: 35, representative: 30,
        elder_council: 40, shadow_government_covert: 50,
        autocratic: 55, theocratic: 60, oligarchy: 65,
        shadow_government_complicit: 70,
      }[gov] ?? 30), 0, 100);

    // Technological Unemployment — structural labor displacement from automation/tech change
    // Beyond automationLevel effects; models displacement rate, retraining capacity, new sector creation
    this.state.techUnemployment = soc.techUnemployment ?? 0;
    this.state.retrainingCapacity = soc.retrainingCapacity ?? Utils.clamp(({
        tribal_chief: 20, theocratic: 25, elder_council: 30,
        shadow_government_complicit: 30, oligarchy: 35,
        shadow_government_covert: 35, autocratic: 40,
        representative: 50, direct_congress: 55,
        rotating: 55, flat_consensus: 60, none: 15,
      }[gov] ?? 40), 0, 100);

    // Ethnic/Linguistic Fractionalization — structural diversity (0=homogeneous, 100=maximally fragmented)
    // Wimmer's correction: diversity itself doesn't cause conflict — political EXCLUSION does.
    this.state.ethnicFractionalization = soc.ethnicFractionalization ?? Utils.clamp(({
        tribal_chief: 15, elder_council: 25, flat_consensus: 30,
        none: 30, rotating: 35, theocratic: 35,
        direct_congress: 40, autocratic: 45, shadow_government_covert: 45,
        representative: 50, oligarchy: 50, shadow_government_complicit: 55,
      }[gov] ?? 35), 0, 100);

    // Political Inclusion — how well all ethnic/linguistic groups are represented (0=exclusion, 100=full inclusion)
    this.state.politicalInclusion = soc.politicalInclusion ?? Utils.clamp(({
        shadow_government_complicit: 15, oligarchy: 20, autocratic: 25,
        theocratic: 30, tribal_chief: 30, shadow_government_covert: 30,
        elder_council: 40, none: 50, representative: 65,
        rotating: 70, direct_congress: 75, flat_consensus: 80,
      }[gov] ?? 50), 0, 100);

    // ── Demographic Transition (Round 15) ──────────────────────────────────────
    // Stage 1-5 (all civilizations start pre-transition)
    this.state.demographicTransitionStage = soc.demographicTransitionStage ?? 1;

    // Vital rates (per 1000 population)
    this.state.fertilityRate = soc.fertilityRate ?? Utils.clamp(({
        flat_consensus: 43, rotating: 44, direct_congress: 44,
        elder_council: 44, tribal_chief: 46, representative: 44,
        shadow_government_covert: 45, theocratic: 46, autocratic: 46,
        shadow_government_complicit: 45, oligarchy: 44, none: 48,
      }[gov] ?? 45), 3, 55);
    this.state.mortalityRate = soc.mortalityRate ?? Utils.clamp(({
        flat_consensus: 38, rotating: 39, direct_congress: 39,
        elder_council: 39, tribal_chief: 42, representative: 40,
        shadow_government_covert: 40, theocratic: 42, autocratic: 42,
        shadow_government_complicit: 41, oligarchy: 40, none: 43,
      }[gov] ?? 40), 3, 55);

    // Life expectancy (years) — computed each turn but needs initial value
    this.state.lifeExpectancy = soc.lifeExpectancy ?? Utils.clamp(({
        flat_consensus: 34, rotating: 34, direct_congress: 33,
        elder_council: 33, tribal_chief: 31, representative: 33,
        shadow_government_covert: 32, theocratic: 31, autocratic: 30,
        shadow_government_complicit: 31, oligarchy: 32, none: 30,
      }[gov] ?? 32), 25, 95);

    // Infant mortality (per 1000 live births, stored as 0-100 scale)
    this.state.infantMortality = soc.infantMortality ?? Utils.clamp(({
        flat_consensus: 70, rotating: 72, direct_congress: 72,
        elder_council: 72, tribal_chief: 78, representative: 72,
        shadow_government_covert: 74, theocratic: 78, autocratic: 78,
        shadow_government_complicit: 76, oligarchy: 74, none: 80,
      }[gov] ?? 75), 0, 100);

    // Disease burden (0-100, aggregate prevalence)
    this.state.diseaseBurden = soc.diseaseBurden ?? Utils.clamp(({
        flat_consensus: 55, rotating: 56, direct_congress: 57,
        elder_council: 58, tribal_chief: 65, representative: 58,
        shadow_government_covert: 60, theocratic: 65, autocratic: 63,
        shadow_government_complicit: 62, oligarchy: 60, none: 70,
      }[gov] ?? 60), 0, 100);

    // Sanitation level (0-100, key Stage 1->2 driver)
    this.state.sanitationLevel = soc.sanitationLevel ?? Utils.clamp(({
        flat_consensus: 25, rotating: 22, direct_congress: 22,
        elder_council: 20, tribal_chief: 12, representative: 20,
        shadow_government_covert: 18, theocratic: 12, autocratic: 15,
        shadow_government_complicit: 15, oligarchy: 18, none: 8,
      }[gov] ?? 18), 0, 100);

    // Age cohorts (percentage of population)
    this.state.youthCohort = soc.youthCohort ?? Utils.clamp(({
        flat_consensus: 38, rotating: 39, direct_congress: 39,
        elder_council: 39, tribal_chief: 42, representative: 40,
        shadow_government_covert: 40, theocratic: 42, autocratic: 42,
        shadow_government_complicit: 41, oligarchy: 40, none: 43,
      }[gov] ?? 40), 5, 55);
    this.state.elderlyCohort = soc.elderlyCohort ?? Utils.clamp(({
        flat_consensus: 6, rotating: 6, direct_congress: 5,
        elder_council: 6, tribal_chief: 4, representative: 5,
        shadow_government_covert: 5, theocratic: 4, autocratic: 4,
        shadow_government_complicit: 5, oligarchy: 5, none: 4,
      }[gov] ?? 5), 2, 40);

    // Debt model — derived from economic model unless overridden
    if (soc.debtModel) {
      this.state.debtModel = soc.debtModel;
    } else {
      this.state.debtModel = {
        gift: 'debtless', commons: 'debtless', barter: 'debtless', none: 'debtless',
        labor_credit: 'regulated_credit', planned: 'regulated_credit',
        mixed: 'regulated_credit', commodity: 'regulated_credit',
        market: 'market_debt',
      }[econ] ?? 'regulated_credit';
    }

    // Tariff level override
    if (soc.tariffLevel !== undefined) {
      this.state.tariffLevel = Utils.clamp(soc.tariffLevel, 0, 100);
    }

    // Culture axes — derived from existing founding data
    this.state.authorityOrientation = Utils.clamp(
      Math.round((10 - hierarch) * 10), 0, 100  // low hierarchy = high egalitarian
    );
    this.state.riskOrientation = Utils.clamp(Math.round(innov), 0, 100);

    // Financial depth baseline — market economies start more developed
    this.state.financialDepth = Utils.clamp({
      gift: 5, barter: 8, commons: 8, none: 5,
      labor_credit: 15, planned: 25, mixed: 30,
      commodity: 30, market: 40,
    }[econ] ?? 25, 0, 100);

    // Debtless societies start with zero debt
    if (this.state.debtModel === 'debtless') this.state.debtLoad = 0;

    // ── Family, Identity & Reproductive Health ────────────────
    const sf = options.societyFamily || {};

    this.state.familyStructure = sf.familyStructure
      ?? ((econ === 'commons' || econ === 'labor_credit') ? 'community_clan'
        : (econ === 'gift' || econ === 'barter') ? 'extended'
        : 'nuclear');

    this.state.sexualOrientationPolicy = sf.sexualOrientationPolicy
      ?? (gov === 'theocratic'                              ? 'suppressive'
        : (gov === 'tribal_chief' || gov === 'elder_council') ? 'suppressive'
        : (religion === 'state_religion' || religion === 'state') ? 'grudging'
        : (gov === 'autocratic' || gov === 'oligarchy')     ? 'grudging'
        : (gov === 'direct_congress' || gov === 'flat_consensus') ? 'full_support'
        : (gov === 'rotating' || gov === 'representative')  ? 'tolerant'
        : 'grudging');

    this.state.childcareNorm = sf.childcareNorm
      ?? ((econ === 'gift' || econ === 'barter')             ? 'extended_family'
        : (econ === 'commons' || econ === 'labor_credit')   ? 'institutional'
        : (gov === 'direct_congress' || gov === 'flat_consensus' || gov === 'rotating') ? 'shared'
        : 'mother_primary');

    this.state.reproductiveHealthTier = sf.reproductiveHealthTier
      ?? ((gov === 'theocratic' && (religion === 'state_religion' || religion === 'state')) ? 'forbidden'
        : (religion === 'state_religion' || religion === 'state')                           ? 'restricted'
        : (gov === 'tribal_chief' || gov === 'elder_council')                               ? 'restricted'
        : (gov === 'autocratic')                                                            ? 'restricted'
        : (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'restricted'
        : (econ === 'gift' || econ === 'commons' || econ === 'labor_credit' || gov === 'direct_congress' || gov === 'rotating') ? 'scandinavian'
        : 'available');

    this.state.familySizePolicy = sf.familySizePolicy
      ?? ((gov === 'theocratic' || gov === 'tribal_chief') ? 'large_encouraged' : 'neutral');

    this.state.womensRightsTier = sf.womensRightsTier
      ?? (gov === 'theocratic'                              ? 'forbidden'
        : (gov === 'tribal_chief' || gov === 'elder_council') ? 'minimal'
        : (gov === 'autocratic' || gov === 'oligarchy')   ? 'minimal'
        : (gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'minimal'
        : (gov === 'direct_congress' || gov === 'flat_consensus') ? 'full_parity'
        : (gov === 'rotating')                              ? 'full_parity'
        : 'mostly_full');

    // ── Science (separate from arts) ──────────────────────────
    // Science and arts may diverge: a theocracy might fund devotional art but suppress empirical
    // science; a market economy might fund applied science but only commercially viable art.
    // societyCulture (from wizard step 10) takes priority over societyFamily for science/arts.
    const sc = options.societyCulture || {};
    const isFreeGov = econ === 'gift' || econ === 'commons' || econ === 'labor_credit' ||
                      gov === 'direct_congress' || gov === 'flat_consensus' || gov === 'rotating';

    this.state.scienceSupport = sc.scienceSupport !== undefined ? sc.scienceSupport
      : sf.scienceSupport !== undefined
      ? sf.scienceSupport
      : (gov === 'theocratic' ? 20
        : gov === 'autocratic' ? 35
        : gov === 'oligarchy'  ? 50   // elite-directed research
        : econ === 'market'    ? 65   // applied R&D driven
        : isFreeGov            ? 75
        : Utils.clamp(Math.round(freedom * 0.75 + 12), 15, 85));

    if (sc.scienceFreedom !== undefined) {
      this.state.scienceFreedom           = sc.scienceFreedom;
      this.state.scienceFreedomConstraint = sc.scienceFreedomConstraint ?? 'none';
    } else if (sf.scienceFreedom !== undefined) {
      this.state.scienceFreedom           = sf.scienceFreedom;
      this.state.scienceFreedomConstraint = sf.scienceFreedomConstraint ?? 'none';
    } else if (gov === 'theocratic' || religion === 'state_religion' || religion === 'state') {
      this.state.scienceFreedom           = 20;  // dogma constrains empirical inquiry
      this.state.scienceFreedomConstraint = 'religion';
    } else if (gov === 'autocratic') {
      this.state.scienceFreedom           = 30;  // directed research, not free inquiry
      this.state.scienceFreedomConstraint = 'government';
    } else if (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') {
      this.state.scienceFreedom           = 40;  // elite-directed, profit-driven research
      this.state.scienceFreedomConstraint = 'capital';
    } else if (econ === 'market' && gov !== 'direct_congress') {
      this.state.scienceFreedom           = 55;  // profit motive shapes research direction
      this.state.scienceFreedomConstraint = 'capital';
    } else if (isFreeGov) {
      this.state.scienceFreedom           = 85;
      this.state.scienceFreedomConstraint = 'none';
    } else {
      this.state.scienceFreedom           = Utils.clamp(Math.round(freedom * 0.7 + 15), 20, 85);
      this.state.scienceFreedomConstraint = 'none';
    }

    // ── Arts & Culture (separate from science) ─────────────────
    // Arts diverges from science: theocracies may support devotional art; market economies
    // allow commercially successful art more freely than basic research.
    this.state.artsSupport = sc.artsSupport !== undefined ? sc.artsSupport
      : sf.artsSupport !== undefined
      ? sf.artsSupport
      : (gov === 'theocratic' ? 45   // devotional/religious art encouraged
        : gov === 'autocratic' ? 30  // only patriotic art
        : gov === 'oligarchy'  ? 35  // elite patron-class art
        : econ === 'market'    ? 40  // arts only if commercially viable
        : isFreeGov            ? 75
        : Utils.clamp(Math.round(freedom * 0.7 + 15), 15, 85));

    if (sc.artsFreedom !== undefined) {
      this.state.artsFreedom           = sc.artsFreedom;
      this.state.artsFreedomConstraint = sc.artsFreedomConstraint ?? 'none';
    } else if (sf.artsFreedom !== undefined) {
      this.state.artsFreedom           = sf.artsFreedom;
      this.state.artsFreedomConstraint = sf.artsFreedomConstraint ?? 'none';
    } else if (gov === 'theocratic' || religion === 'state_religion' || religion === 'state') {
      this.state.artsFreedom           = 25;  // devotional art yes; critical/secular art no
      this.state.artsFreedomConstraint = 'religion';
    } else if (gov === 'autocratic') {
      this.state.artsFreedom           = 30;  // patriotic art tolerated; dissent suppressed
      this.state.artsFreedomConstraint = 'government';
    } else if (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') {
      this.state.artsFreedom           = 45;  // elite-patronized art; critical art constrained
      this.state.artsFreedomConstraint = 'capital';
    } else if (econ === 'market' && gov !== 'direct_congress') {
      this.state.artsFreedom           = 65;  // commercially viable art relatively free
      this.state.artsFreedomConstraint = 'capital';
    } else if (isFreeGov) {
      this.state.artsFreedom           = 90;
      this.state.artsFreedomConstraint = 'none';
    } else {
      this.state.artsFreedom           = Utils.clamp(Math.round(freedom * 0.75 + 20), 25, 90);
      this.state.artsFreedomConstraint = 'none';
    }

    // ── Healthcare Defaults ──────────────────────────────────────────────────
    const sh = options.societyHealth || {};
    this.state.healthcareAccess = sh.healthcareAccess
      ?? (gov === 'theocratic'                            ? 'minimal_traditional'
        : (gov === 'tribal_chief' || gov === 'elder_council') ? 'minimal_traditional'
        : (econ === 'gift' || econ === 'commons' || econ === 'labor_credit') ? 'universal_public'
        : econ === 'market'                               ? 'mixed_public_private'
        : econ === 'planned'                              ? 'universal_public'
        : 'universal_insurance');

    this.state.healthcareEmphasis = sh.healthcareEmphasis
      ?? ((econ === 'gift' || econ === 'commons' || econ === 'labor_credit') ? 'prevention'
        : econ === 'market' ? 'treatment'
        : 'balanced');

    this.state.healthcareIncentive = sh.healthcareIncentive
      ?? ((econ === 'gift' || econ === 'commons' || econ === 'labor_credit' || econ === 'planned') ? 'patient_outcomes'
        : econ === 'market'                        ? 'profit_first'
        : 'mixed');

    // ── Resource Management Defaults ─────────────────────────────────────────
    const sr = options.societyResources || {};
    this.state.resourceStrategy = sr.resourceStrategy
      ?? ((econ === 'gift' || econ === 'commons' || econ === 'labor_credit') ? 'conservation'
        : econ === 'market'                         ? 'extraction_growth'
        : econ === 'planned'                        ? 'government_managed'
        : 'balanced_stewardship');

    this.state.obsolescenceModel = sr.obsolescenceModel
      ?? (econ === 'market'                          ? 'market_driven'
        : (econ === 'gift' || econ === 'commons' || econ === 'labor_credit' || econ === 'barter') ? 'durability_first'
        : 'regulated');

    // ── Information Ecosystem Defaults ────────────────────────────────────────
    const si = options.societyInfo || {};
    this.state.informationEcosystem = si.informationEcosystem
      ?? (gov === 'theocratic'                            ? 'total_information_control'
        : (gov === 'autocratic' || gov === 'tribal_chief') ? 'state_guided'
        : (gov === 'oligarchy' || gov === 'shadow_government_complicit' || gov === 'shadow_government_covert') ? 'captured_commercial'
        : gov === 'elder_council'                         ? 'state_guided'
        : (gov === 'direct_congress' || gov === 'flat_consensus' || gov === 'rotating') ? 'open_civic'
        : (econ === 'gift' || econ === 'commons' || econ === 'labor_credit') ? 'open_civic'
        : 'free_market_media');

    // ── Social Psychology Defaults (Pass 7) ───────────────────────────────────
    const sp = options.societyPsychology || {};
    const susModel = (typeof SUSCEPTIBILITY_MODELS !== 'undefined')
      ? SUSCEPTIBILITY_MODELS.find(m => m.id === (sp.susceptibilityModel ?? 'moderate_variation'))
      : null;
    this.state.susceptibilityModel  = sp.susceptibilityModel ?? 'moderate_variation';
    this.state._susceptibilitySigma = susModel?.sigma ?? 0.6;

    // Empathy initialisation scaled by governance hierarchy level
    const govHierarchyFrac = { autocratic: 0.9, theocratic: 0.85, oligarchy: 0.75,
      tribal_chief: 0.7, shadow_government_complicit: 0.75, shadow_government_covert: 0.8,
      elder_council: 0.6, representative: 0.5, rotating: 0.3,
      direct_congress: 0.35, flat_consensus: 0.25, none: 0.4 }[gov] ?? 0.5;
    const bs = 0.7 + (1 - govHierarchyFrac) * 0.3;   // 0.70–1.00
    this.state.empathyByStratum = {
      elite:          Math.round(Utils.clamp(45 * bs, 15, 75)),
      upper_middle:   Math.round(Utils.clamp(58 * bs, 25, 80)),
      lower_middle:   Math.round(Utils.clamp(68 * bs, 35, 85)),
      working_class:  Math.round(Utils.clamp(75 * bs, 45, 88)),
      disenfranchised: 80,
    };
    this.state.prosocialByStratum = {
      elite:          this.state.empathyByStratum.elite,
      upper_middle:   this.state.empathyByStratum.upper_middle,
      lower_middle:   this.state.empathyByStratum.lower_middle,
      working_class:  this.state.empathyByStratum.working_class,
      disenfranchised: Math.round(this.state.empathyByStratum.disenfranchised * 0.70),
    };
    this.state.hierarchyEntrenched    = Math.round(govHierarchyFrac * 50);
    this.state.opportunityCompetition = Math.round(
      Utils.clamp((100 - (this.state.equalityIndex ?? 50)) * 0.8, 0, 100));
    this.state.culturalEmpathyNorm    = Math.round(
      this.state.empathyByStratum.elite        * 0.05 +
      this.state.empathyByStratum.upper_middle * 0.15 +
      this.state.empathyByStratum.lower_middle * 0.25 +
      this.state.empathyByStratum.working_class* 0.35 +
      this.state.prosocialByStratum.disenfranchised * 0.20);
    this.state._prevGovModel      = gov;
    this.state._prevHierarchyLevel= this.governance.hierarchyLevel ?? 50;
    this.state._prevEconModel     = econ;   // econ is already resolved above

    // ── Pass 7 Init: Susceptibility Distribution ──────────────────────────
    const susM = (typeof SUSCEPTIBILITY_MODELS !== 'undefined')
      ? (SUSCEPTIBILITY_MODELS.find(m => m.id === this.state.susceptibilityModel) || SUSCEPTIBILITY_MODELS[1])
      : null;
    if (susM) {
      this.state.susceptibilityDistribution = {
        modelId:          susM.id,
        resistantFraction:susM.resistantFraction ?? 0.20,
        alpha:            susM.alpha ?? 2.0,
        beta:             susM.beta  ?? 2.5,
        stratumOffset:    { ...susM.stratumOffset },
        // Generational drift accumulator
        _generationDriftAccum: 0,
        _lastAlphaDrift:       0,
        _lastBetaDrift:        0,
      };
    }

    // ── Pass 7 Init: Cultural Gap ─────────────────────────────────────────
    // Compute initial stated and reinforced values from founding configuration.
    const eduTier = this.state.educationAccess ?? 'free_secondary_affordable_higher';
    const statedBase = (typeof CULTURAL_STATED_VALUES_BY_EDUCATION !== 'undefined')
      ? { ...CULTURAL_STATED_VALUES_BY_EDUCATION[eduTier] || CULTURAL_STATED_VALUES_BY_EDUCATION['free_secondary_affordable_higher'] }
      : { cooperation: 60, empathy: 60, fairness: 58, civicDuty: 55, honesty: 60 };
    const statedGovMod = (typeof CULTURAL_STATED_VALUES_GOV_MODIFIER !== 'undefined')
      ? (CULTURAL_STATED_VALUES_GOV_MODIFIER[gov] || {})
      : {};
    for (const k of Object.keys(statedGovMod)) {
      if (statedBase[k] !== undefined) statedBase[k] = Utils.clamp(statedBase[k] + statedGovMod[k], 0, 100);
    }
    const reinforcedBase = (typeof CULTURAL_REINFORCED_VALUES_BY_ECON !== 'undefined')
      ? { ...CULTURAL_REINFORCED_VALUES_BY_ECON[econ] || CULTURAL_REINFORCED_VALUES_BY_ECON['mixed'] }
      : { cooperation: 50, empathy: 50, fairness: 50, civicDuty: 50, honesty: 50 };
    const reinforcedGovMod = (typeof CULTURAL_REINFORCED_VALUES_GOV_MODIFIER !== 'undefined')
      ? (CULTURAL_REINFORCED_VALUES_GOV_MODIFIER[gov] || {})
      : {};
    for (const k of Object.keys(reinforcedGovMod)) {
      if (reinforcedBase[k] !== undefined) reinforcedBase[k] = Utils.clamp(reinforcedBase[k] + reinforcedGovMod[k], 0, 100);
    }
    const initGap = Object.keys(statedBase).reduce((sum, k) => sum + Math.abs((statedBase[k] || 0) - (reinforcedBase[k] || 0)), 0)
      / (Object.keys(statedBase).length * 100) * 100;
    this.state.culturalGap = {
      statedValues:              statedBase,
      reinforcedValues:          reinforcedBase,
      gapScore:                  Math.round(initGap),
      cognitiveDissonanceLevel:  Math.max(0, initGap - 10),
      cynicismLevel:             0,
      revolutionaryConsciousness:0,
      paradigmShiftReadiness:    0,
      byStratum: {
        elite:          { gapPerception: 0, benefitFromGap: true,  psychologicalCost: 0 },
        upper_middle:   { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
        lower_middle:   { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
        working_class:  { gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
        disenfranchised:{ gapPerception: 0, benefitFromGap: false, psychologicalCost: 0 },
      },
      history: [],
    };

    // ── Pass 7 Init: Wealth Capture ───────────────────────────────────────
    const econPowerPot = (typeof ECON_POWER_POTENTIAL !== 'undefined')
      ? (ECON_POWER_POTENTIAL[econ] ?? 0.30)
      : 0.30;
    const wealthConc = this.economic.wealthConcentration ?? 20;
    const initCaptureDegree = Utils.clamp(
      wealthConc * econPowerPot * (1 - (this.state.institutionalQuality ?? 50) / 100), 0, 100);
    this.state.wealthCapture = {
      degree:               Math.round(initCaptureDegree),
      institutionalCapture: Math.round(initCaptureDegree * 0.8 * (1 - (this.state.institutionalQuality ?? 50) / 100)),
      electoralCapture:     Math.round(initCaptureDegree * 0.7 * (1 - (this.state.epistemicHealth ?? 50) / 100)),
      mediaCapture:         Math.round(initCaptureDegree * 0.5),
      culturalCapture:      Math.round(initCaptureDegree * 0.6),
      reinforcementControl: Math.round(initCaptureDegree * 0.65),
      feudalDynamic:        initCaptureDegree > 80 && wealthConc > 75,
      feudalIntensity:      Math.max(0, Math.round((initCaptureDegree - 80) / 20 * 100)),
      history: [],
    };

    // ── Pass 7 Init: Theocratic Empathy Bias ─────────────────────────────
    const isTheocratic = gov === 'theocratic';
    const religionDom  = this.religion?.dominance ?? 0;
    const biasActive   = isTheocratic || (religionDom > ((typeof THEOCRATIC_EMPATHY_BIAS !== 'undefined') ? THEOCRATIC_EMPATHY_BIAS.triggerReligionDominance : 70));
    const baseEmpathy  = this.state.empathyLevel ?? 50;
    this.state.theocraticEmpathyBias = {
      active:         biasActive,
      inGroupEmpathy: biasActive ? Utils.clamp(baseEmpathy * 1.15, 0, 95) : baseEmpathy,
      outGroupEmpathy:biasActive ? Utils.clamp(baseEmpathy * 0.75, 0, 100) : baseEmpathy,
    };

    // ── Pass 7 Init: Paradigm Shift State ────────────────────────────────
    this.state.paradigmShiftState = {
      activeShifts:         [],   // [{shiftId, type, startTurn, targetModel, strategiesActive, turnsRemaining}]
      completedShifts:      [],   // [{shiftId, type, from, to, completedTurn, strategiesUsed, outcomes}]
      resistanceScore:      50,   // 0-100: current resistance to paradigm change
      enhancementScore:     50,   // 0-100: current enhancement toward paradigm change
      shiftReadinessDetail: {},   // per-factor breakdown for display
      history:              [],   // ring buffer, last 20 shifts
    };

    // Diagnostic: log final state values for key settings
    if (this.isPlayerCiv) {
      console.log('[CivSim] Final state — educationAccess:', this.state.educationAccess,
        '| healthcareAccess:', this.state.healthcareAccess,
        '| womensRightsTier:', this.state.womensRightsTier,
        '| informationEcosystem:', this.state.informationEcosystem,
        '| genderEquity:', this.state.genderEquity,
        '| resourceStrategy:', this.state.resourceStrategy);
    }
   } catch (err) {
    console.error('[CivSim] ERROR in _computeSocietyInitials:', err);
   }
  }
}
