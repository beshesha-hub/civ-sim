/**
 * companion.js — Companion Module for Civ-Sim
 *
 * Five engines running alongside civ-sim's main simulation:
 *   1. TemporalEngine       — process-specific rate caps & inertia
 *   2. DemographicEngine    — sex-disaggregated 34-cohort population model
 *   3. MicroFoundationEngine — stratum dynamics, regime transitions, collective action
 *   4. DiffusionEngine      — information spread & collective action thresholds
 *   5. MigrationEngine      — cohort-level migration integration
 *
 * Design principles:
 *   - No cultural or arbitrary assumptions — all mechanisms are universal
 *     empirical relationships
 *   - Reads civ-sim's computed rates, applies them to structural population,
 *     writes back enriched metrics
 *   - Shares civ-sim's RNG seed for reproducibility
 *   - Minimally invasive: hooks after existing processTurn, doesn't replace
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTS — Empirical data tables
// ═══════════════════════════════════════════════════════════════

const COMPANION_COHORT_LABELS = [
  '0-4','5-9','10-14','15-19','20-24','25-29','30-34',
  '35-39','40-44','45-49','50-54','55-59','60-64',
  '65-69','70-74','75-79','80+'
];
const COMPANION_NUM_COHORTS = 17;

// Age-specific mortality (annual deaths per 1000, by cohort index)
// Keyed by life expectancy bracket. Based on UN WPP model life tables.
// Interpolated at runtime for intermediate values.
const COMPANION_MORTALITY_TABLES = {
  30: [200, 30, 12, 10, 12, 12, 14, 16, 20, 28, 40, 55, 75, 110, 160, 230, 350],
  40: [130, 18,  7,  6,  8,  8,  9, 11, 14, 20, 28, 40, 58,  85, 130, 190, 310],
  50: [ 75,  9,  4,  3,  5,  5,  6,  7, 10, 14, 20, 30, 45,  68, 105, 160, 270],
  60: [ 42,  5,  2,  2,  3,  3,  4,  5,  6,  9, 14, 22, 35,  55,  88, 140, 240],
  70: [ 16,  2,  1,  1,  2,  2,  2,  3,  4,  6,  9, 15, 25,  42,  70, 115, 210],
  80: [  5,  1,  1,  1,  1,  1,  1,  2,  2,  4,  6, 10, 18,  30,  55,  95, 180],
  90: [  3,  1,  1,  1,  1,  1,  1,  1,  2,  3,  4,  7, 13,  22,  42,  80, 160],
};

// Male excess mortality multiplier by cohort (UN WPP sex differentials)
// Males have higher mortality at all ages; largest gap in 15-29 (risk behavior)
// and 50+ (cardiovascular, occupational exposure). Neonatal male excess ~1.05.
const COMPANION_MALE_EXCESS_MORTALITY = [
  1.05, 1.03, 1.02, 1.30, 1.35, 1.30, 1.25,
  1.20, 1.18, 1.20, 1.25, 1.30, 1.35,
  1.35, 1.30, 1.25, 1.15
];

// Initial age distribution by demographic stage (% of total, sums to ~100)
const COMPANION_INITIAL_DISTRIBUTIONS = {
  1: [16.0,13.0,11.0, 9.5, 8.0, 7.0, 6.0, 5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.5, 2.0, 1.5, 1.5],
  2: [15.0,13.5,12.0,10.0, 8.5, 7.5, 6.5, 5.5, 4.5, 4.0, 3.0, 2.5, 2.0, 2.0, 1.5, 1.0, 1.0],
  3: [11.0,10.0, 9.5, 9.0, 8.5, 8.0, 7.5, 7.0, 6.0, 5.5, 4.5, 4.0, 3.0, 2.5, 2.0, 1.0, 1.0],
  4: [ 6.0, 6.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 4.5, 3.5, 2.5, 2.0],
  5: [ 4.0, 4.5, 5.0, 5.5, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.0, 7.5, 6.5, 5.5, 5.0, 4.5, 3.5],
};

// Age-specific fertility weights (proportion of total births by mother's age cohort)
const COMPANION_FERTILITY_WEIGHTS = [
  0, 0, 0,     // 0-14: no reproduction
  0.05,        // 15-19
  0.18,        // 20-24
  0.25,        // 25-29: peak fertility
  0.22,        // 30-34
  0.16,        // 35-39
  0.10,        // 40-44
  0.04,        // 45-49
  0, 0, 0, 0, 0, 0, 0  // 50+: no reproduction
];

// ── Process-specific temporal dynamics ──
// Different social processes change at fundamentally different rates.
// Policy can shift in months; institutions change over decades; deep
// culture evolves across generations. (Williamson 2000 — four levels
// of social analysis: embeddedness 100-1000yr, institutional environment
// 10-100yr, governance 1-10yr, resource allocation continuous.)
const COMPANION_PROCESS_RATES = {
  // Fast (1-5 year response): policy levers, military posture
  fast: {
    variables: ['militaryPower', 'resourceAllocation'],
    inertia: 0.15,
    maxChangePerYear: 5.0,
  },
  // Medium (5-20 year response): economic structure, institutions
  medium: {
    variables: [
      'stateCapacity', 'corruptionLevel', 'institutionalQuality',
      'educationQuality', 'genderEquity', 'equalityIndex',
      'averageWellbeing', 'wealthConcentration', 'innovationTolerance',
    ],
    inertia: 0.50,
    maxChangePerYear: 2.0,
  },
  // Slow (20-50 year response): deep culture, social trust, norms
  // (Inglehart & Welzel 2005: value change is generational; WVS
  //  shows trust/cohesion shift at <5 pts/decade even in upheaval)
  slow: {
    variables: [
      'socialTrust', 'culturalCohesion', 'epistemicHealth',
      'culturalEmpathyNorm',
    ],
    inertia: 0.80,
    maxChangePerYear: 1.0,
  },
};

// ── Cross-process interaction rules ──
// Slow processes constrain medium, medium constrain fast. Change at a
// higher level requires prerequisite change at the deeper level.
// (North 1990 — institutions constrained by cultural beliefs;
//  Inglehart & Welzel 2005 — value change enables institutional change;
//  Williamson 2000 — embeddedness constrains institutional environment)
const COMPANION_CROSS_PROCESS = {
  // Cultural preconditions for institutional change
  institutionalQuality: {
    enablers: ['socialTrust', 'epistemicHealth'],
    enablerWeight: 0.4,
  },
  stateCapacity: {
    enablers: ['socialTrust', 'culturalCohesion'],
    enablerWeight: 0.35,
  },
  genderEquity: {
    enablers: ['culturalEmpathyNorm', 'epistemicHealth'],
    enablerWeight: 0.45,
  },
  equalityIndex: {
    enablers: ['socialTrust', 'culturalEmpathyNorm'],
    enablerWeight: 0.3,
  },
  educationQuality: {
    enablers: ['epistemicHealth'],
    enablerWeight: 0.25,
  },
  innovationTolerance: {
    enablers: ['epistemicHealth', 'culturalCohesion'],
    enablerWeight: 0.35,
  },
};

// Empirically calibrated rate-of-change limits (max absolute change per real year)
// Sources: V-Dem v14 longitudinal, WVS waves 1-7, TI CPI 1995-2023,
//   Piketty/WID inequality series, UNDP HDI/GDI, Polity5, Besley & Persson 2011
const COMPANION_RATE_LIMITS = {
  // Deep cultural (generational timescale, WVS: <5 pts/decade typical)
  socialTrust:         { normal: 1.0,  crisis: 3.5  },
  culturalCohesion:    { normal: 0.3,  crisis: 2.5  },
  epistemicHealth:     { normal: 0.6,  crisis: 2.5  },
  // Institutional (V-Dem: 5-15 pts/decade for reformers; collapse faster)
  stateCapacity:       { normal: 1.5,  crisis: 8.0  },
  institutionalQuality:{ normal: 1.5,  crisis: 8.0  },
  corruptionLevel:     { normal: 1.5,  crisis: 5.0  },
  // Social structural (UNDP, Piketty: 3-10 pts/decade)
  genderEquity:        { normal: 1.0,  crisis: 3.5  },
  equalityIndex:       { normal: 0.8,  crisis: 3.0  },
  wealthConcentration: { normal: 0.8,  crisis: 5.0  },
  educationQuality:    { normal: 1.0,  crisis: 2.5  },
  // Economic/political (faster response to shocks)
  stabilityIndex:      { normal: 2.5,  crisis: 25.0 },
  averageWellbeing:    { normal: 1.5,  crisis: 5.0  },
  freedomLevel:        { normal: 2.0,  crisis: 8.0  },
  innovationTolerance: { normal: 0.8,  crisis: 2.5  },
};

// Stratum population share templates by economy type
// (Milanovic 2016, Piketty 2014 — universal distributional patterns)
const COMPANION_STRATUM_SHARES = {
  command:   { elite: 0.03, upperMiddle: 0.07, lowerMiddle: 0.20, working: 0.50, disenfranchised: 0.20 },
  market:    { elite: 0.05, upperMiddle: 0.15, lowerMiddle: 0.25, working: 0.40, disenfranchised: 0.15 },
  mixed:     { elite: 0.04, upperMiddle: 0.12, lowerMiddle: 0.25, working: 0.42, disenfranchised: 0.17 },
  communal:  { elite: 0.02, upperMiddle: 0.08, lowerMiddle: 0.30, working: 0.45, disenfranchised: 0.15 },
  feudal:    { elite: 0.02, upperMiddle: 0.05, lowerMiddle: 0.13, working: 0.45, disenfranchised: 0.35 },
  rentier:   { elite: 0.04, upperMiddle: 0.10, lowerMiddle: 0.20, working: 0.45, disenfranchised: 0.21 },
  default:   { elite: 0.04, upperMiddle: 0.11, lowerMiddle: 0.25, working: 0.42, disenfranchised: 0.18 },
};

// Regime transition type thresholds (Geddes, Wright & Frantz 2014;
// Svolik 2012; Haggard & Kaufman 2016)
const COMPANION_TRANSITION_THRESHOLDS = {
  democratization: {
    pressureMin: 40,
    eliteCohesionMax: 45,
    collectiveActionMin: 35,
    probabilityBase: 0.08,
  },
  militaryCoup: {
    eliteCohesionMax: 30,
    collectiveActionMax: 25,
    militaryMin: 35,
    probabilityBase: 0.06,
  },
  authoritarianConsolidation: {
    eliteCohesionMin: 65,
    massGrievanceMin: 45,
    freedomMin: 25,
    probabilityBase: 0.05,
  },
  gradualLiberalization: {
    pressureMin: 25,
    pressureMax: 55,
    eliteCohesionMin: 40,
    wealthMin: 55,
    probabilityBase: 0.04,
  },
  popularRevolution: {
    pressureMin: 65,
    collectiveActionMin: 50,
    massGrievanceMin: 60,
    probabilityBase: 0.10,
  },
};

// Governance type classification for transition logic.
// Groups governance models by structural similarity — what kind of
// power distribution they represent — not by normative evaluation.
// This avoids baking in assumptions about which types are "better."
const COMPANION_GOV_CLASSES = {
  // Concentrated power: single ruler or very small group
  concentrated: new Set([
    'autocratic', 'theocratic', 'tribal_chief',
    'shadow_government_complicit', 'shadow_government_covert',
    'authoritarian_world_government',
  ]),
  // Oligarchic: small elite group shares power
  oligarchic: new Set(['oligarchy', 'elder_council']),
  // Distributed: power spread across population
  distributed: new Set([
    'representative', 'direct_congress', 'flat_consensus',
    'rotating', 'world_federation',
  ]),
  // Minimal/absent: no effective central authority
  minimal: new Set(['none', 'failed_state']),
};

// Transition susceptibility by governance class.
// Different power structures are vulnerable to different transitions.
// (Geddes 2003 — personalist, military, party, democratic regimes
// each fall through distinct mechanisms)
const COMPANION_GOV_TRANSITION_SUSCEPTIBILITY = {
  concentrated: {
    popularRevolution: 1.0,
    militaryCoup: 1.2,
    democratization: 0.6,
    gradualLiberalization: 0.7,
    authoritarianConsolidation: 1.3,
  },
  oligarchic: {
    popularRevolution: 0.8,
    militaryCoup: 0.9,
    democratization: 1.0,
    gradualLiberalization: 1.2,
    authoritarianConsolidation: 0.8,
  },
  distributed: {
    popularRevolution: 0.3,
    militaryCoup: 0.4,
    democratization: 0.0,    // already democratic
    gradualLiberalization: 0.0,
    authoritarianConsolidation: 0.6,
  },
  minimal: {
    popularRevolution: 0.5,
    militaryCoup: 1.5,       // power vacuums invite military takeover
    democratization: 0.3,
    gradualLiberalization: 0.2,
    authoritarianConsolidation: 1.0,
  },
};


// ═══════════════════════════════════════════════════════════════
// TEMPORAL ENGINE — Process-specific rate caps & inertia
// ═══════════════════════════════════════════════════════════════

class TemporalEngine {
  constructor() {
    this.snapshots = new Map();
    this.dampenLog = [];
    this._processMap = null;
  }

  _getProcessMap() {
    if (this._processMap) return this._processMap;
    this._processMap = new Map();
    for (const [speed, cfg] of Object.entries(COMPANION_PROCESS_RATES)) {
      for (const v of cfg.variables) {
        this._processMap.set(v, { speed, inertia: cfg.inertia, maxRate: cfg.maxChangePerYear });
      }
    }
    return this._processMap;
  }

  captureSnapshot(civId, state, governance) {
    const snap = {};
    for (const key of Object.keys(COMPANION_RATE_LIMITS)) {
      if (key === 'corruptionLevel') {
        snap[key] = governance?.[key] ?? 0;
      } else {
        snap[key] = state?.[key] ?? 50;
      }
    }
    this.snapshots.set(civId, snap);
  }

  applyRateLimits(civId, state, governance, realYears) {
    const snap = this.snapshots.get(civId);
    if (!snap || realYears <= 0) return;

    const isCrisis = (state.stabilityIndex ?? 70) < 30 ||
                     state.atWar || state.warStatus ||
                     (state.stabilityIndex ?? 70) < (snap.stabilityIndex ?? 70) - 15;

    this.dampenLog = [];
    const processMap = this._getProcessMap();

    for (const [key, limits] of Object.entries(COMPANION_RATE_LIMITS)) {
      const maxRate = isCrisis ? limits.crisis : limits.normal;

      // Apply process-specific inertia: high-inertia processes resist change
      const proc = processMap.get(key);
      let effectiveMaxRate = maxRate;
      if (proc && !isCrisis) {
        effectiveMaxRate = maxRate * (1 - proc.inertia * 0.4);
      }

      // Cross-process constraint: deeper processes must have moved
      // before shallower ones can fully change. When enablers are
      // low, the rate ceiling tightens — you can't build strong
      // institutions on weak cultural foundations.
      const crossProc = COMPANION_CROSS_PROCESS[key];
      if (crossProc && !isCrisis) {
        let enablerAvg = 0;
        let count = 0;
        for (const enabler of crossProc.enablers) {
          enablerAvg += (state?.[enabler] ?? 50);
          count++;
        }
        enablerAvg = count > 0 ? enablerAvg / count : 50;
        // Below 40: constraining; 40-60: neutral; above 60: enabling
        // Floor at 0.4: even with weak enablers, some institutional
        // building is possible (Rothstein 2005 — causality is bidirectional)
        const enablerFactor = Utils.clamp(0.4 + (enablerAvg - 40) / 50, 0.4, 1.2);
        effectiveMaxRate *= enablerFactor;
      }

      const maxChange = effectiveMaxRate * realYears;

      let oldVal, newVal;
      if (key === 'corruptionLevel') {
        oldVal = snap[key];
        newVal = governance?.[key] ?? oldVal;
      } else {
        oldVal = snap[key];
        newVal = state?.[key] ?? oldVal;
      }

      const delta = newVal - oldVal;
      if (Math.abs(delta) <= maxChange) continue;

      const clamped = oldVal + Math.sign(delta) * maxChange;
      if (key === 'corruptionLevel') {
        if (governance) governance[key] = clamped;
      } else {
        state[key] = clamped;
      }

      this.dampenLog.push({
        variable: key,
        attempted: delta,
        allowed: Math.sign(delta) * maxChange,
        maxRate: effectiveMaxRate,
        processSpeed: proc?.speed ?? 'medium',
        isCrisis,
        crossProcessConstrained: !!crossProc,
      });
    }
  }

  getDampenLog() { return this.dampenLog; }
}


// ═══════════════════════════════════════════════════════════════
// DEMOGRAPHIC ENGINE — Sex-disaggregated 34-cohort model
// ═══════════════════════════════════════════════════════════════

class DemographicEngine {

  initialize(totalPopulation, stage, config) {
    stage = Utils.clamp(stage || 1, 1, 5);
    const dist = config?.ageDistribution ||
                 COMPANION_INITIAL_DISTRIBUTIONS[stage];

    const sum = dist.reduce((a, b) => a + b, 0);

    // Sex ratio at birth: ~1.05 male:female (universal biological constant)
    // Adjustable for son-preference societies
    const sexRatioAtBirth = config?.sexRatioAtBirth ?? 1.05;
    const maleFracBirth = sexRatioAtBirth / (1 + sexRatioAtBirth);

    const maleCohorts = new Array(COMPANION_NUM_COHORTS);
    const femaleCohorts = new Array(COMPANION_NUM_COHORTS);

    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      const cohortPop = totalPopulation * (dist[i] / sum);
      // Younger cohorts are closer to birth sex ratio; older cohorts
      // shift toward females due to male excess mortality
      const ageFactor = Math.min(1, i / 16);
      const maleFrac = maleFracBirth * (1 - ageFactor * 0.08);
      maleCohorts[i] = cohortPop * maleFrac;
      femaleCohorts[i] = cohortPop * (1 - maleFrac);
    }

    return {
      maleCohorts,
      femaleCohorts,
      totalPopulation,
      sexRatioAtBirth,
      births: 0,
      deaths: 0,
      growthRate: 0,
      medianAge: this._computeMedianAge(maleCohorts, femaleCohorts),
      dependencyRatio: 0,
      youthBulgeIndex: 0,
      laborForceShare: 0,
      demographicDividend: 0,
      sexRatio: 1.0,
      malePop: 0,
      femalePop: 0,
    };
  }

  // Backward compat: combined cohorts view
  getCombinedCohorts(demoData) {
    const combined = new Array(COMPANION_NUM_COHORTS);
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      combined[i] = (demoData.maleCohorts?.[i] ?? 0) + (demoData.femaleCohorts?.[i] ?? 0);
    }
    return combined;
  }

  update(demoData, civState, governance, realYears, activeEvents) {
    if (realYears <= 0) return;

    // Handle legacy data without sex-disaggregated cohorts
    if (!demoData.maleCohorts && demoData.cohorts) {
      demoData.maleCohorts = demoData.cohorts.map(c => c * 0.5);
      demoData.femaleCohorts = demoData.cohorts.map(c => c * 0.5);
    }

    const fertRate = civState.fertilityRate ?? 40;
    const lifeExp  = civState.lifeExpectancy ?? 50;
    const infantMort = civState.infantMortality ?? 50;
    const atWar = !!(civState.atWar || civState.warStatus);
    const genderEq = civState.genderEquity ?? 30;
    const urbanization = civState.urbanization ?? 10;
    const eduQ = civState.educationQuality ?? 20;

    // Urbanization-fertility link (Dyson 2010; Bongaarts 2003)
    // Urban living increases opportunity cost of children, reduces
    // labor value of large families, increases access to contraception.
    // Each 10pp of urbanization reduces CBR by ~2/1000 empirically.
    const urbanFertilityAdj = Math.max(0.5, 1.0 - (urbanization / 100) * 0.4);

    // Female education → fertility transition (Lutz & KC 2011)
    // Educated women delay marriage, use contraception, have fewer children.
    // This is the single strongest empirical predictor of fertility decline.
    const eduFertilityAdj = Math.max(0.6, 1.0 - (eduQ / 100) * 0.35);

    // Economic hardship depresses fertility — people delay or forgo
    // children during severe downturns. (Becker 1960 — economic theory
    // of fertility; Sobotka, Skirbekk & Philipov 2011 — 2008 crisis
    // reduced fertility 5-10% in affected countries)
    const wellbeing = civState.averageWellbeing ?? 50;
    const stability = civState.stabilityIndex ?? 70;
    let econFertilityAdj = 1.0;
    if (wellbeing < 35) {
      econFertilityAdj = Math.max(0.7, 1.0 - (35 - wellbeing) / 100);
    }

    // Stage-dependent fertility floor (per 1000):
    // Pre-transition (stage 1-2): CBR 30+ — no contraception, child labor valuable,
    //   high infant mortality drives compensatory fertility (Dyson & Murphy 1985)
    // Transitional (stage 3): CBR 20+ — fertility decline underway but still high
    // Modern (stage 4-5): CBR 7+ — ultra-low fertility possible
    const demoStage = civState.demographicTransitionStage ?? 1;
    const fertFloor = demoStage <= 2 ? 30 : demoStage === 3 ? 20 : 7;
    const adjFertRate = Math.max(fertFloor, fertRate * urbanFertilityAdj * eduFertilityAdj * econFertilityAdj);

    const baseMortality = this._interpolateMortality(lifeExp);

    // Build sex-specific mortality schedules
    const maleMortality = new Array(COMPANION_NUM_COHORTS);
    const femaleMortality = new Array(COMPANION_NUM_COHORTS);
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      maleMortality[i] = baseMortality[i] * COMPANION_MALE_EXCESS_MORTALITY[i];
      femaleMortality[i] = baseMortality[i] * (2 - COMPANION_MALE_EXCESS_MORTALITY[i]);
    }

    // War: indirect mortality effects — stress, disrupted healthcare,
    // displacement. Direct combat casualties are handled separately via
    // age-selective distribution in _reconcilePopulationDelta.
    if (atWar) {
      for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
        maleMortality[i] *= 1.15;
        femaleMortality[i] *= 1.10;
      }
    }

    // Famine/food insecurity increases mortality across all ages
    // (Sen 1981 — entitlement theory; Devereux 2000)
    const foodSec = civState.foodSecurity ?? 80;
    if (foodSec < 40) {
      const famineMultiplier = 1 + (40 - foodSec) / 40;
      for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
        // Children and elderly most vulnerable (U-shaped)
        const ageVulnerability = (i < 3 || i > 12) ? 1.5 : 1.0;
        maleMortality[i] *= famineMultiplier * ageVulnerability;
        femaleMortality[i] *= famineMultiplier * ageVulnerability;
      }
    }

    // Plague/epidemic mortality spike
    const hasPlague = civState.activePlague || civState.plagueActive;
    if (hasPlague) {
      for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
        const plagueVulnerability = (i < 1 || i > 12) ? 2.0 : 1.4;
        maleMortality[i] *= plagueVulnerability;
        femaleMortality[i] *= plagueVulnerability;
      }
    }

    // Economic crisis mortality — severe downturns increase deaths
    // through stress, substance abuse, reduced healthcare access, and
    // deprivation. Working-age males most affected in acute crises.
    // (Case & Deaton 2015 — deaths of despair; Stuckler et al. 2009 —
    // economic crises and mortality)
    if (wellbeing < 30 && stability < 40) {
      const crisisIntensity = 1 + ((30 - wellbeing) / 30) * ((40 - stability) / 40) * 0.3;
      for (let i = 3; i <= 12; i++) {
        maleMortality[i] *= crisisIntensity;
        femaleMortality[i] *= 1 + (crisisIntensity - 1) * 0.5;
      }
    }

    // Low gender equity increases female mortality (maternal mortality,
    // neglect, violence — Sen 1990 "missing women")
    if (genderEq < 30) {
      const genderMortPenalty = 1 + (30 - genderEq) / 100;
      for (let i = 3; i <= 9; i++) {
        femaleMortality[i] *= genderMortPenalty;
      }
    }

    // Active event mortality — disasters, epidemics, civil wars with
    // populationRisk raise mortality across affected cohorts.
    // populationRisk ~0.1 means ~10% excess mortality per event duration.
    if (activeEvents?.length) {
      let aggRisk = 0;
      for (const ev of activeEvents) {
        if (ev.populationRisk) aggRisk += ev.populationRisk;
      }
      if (aggRisk > 0) {
        const eventMortMult = 1 + aggRisk * 2;
        for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
          maleMortality[i] *= eventMortMult;
          femaleMortality[i] *= eventMortMult;
        }
      }
    }

    // Infant mortality from civ-sim (scale to per-1000 rate)
    maleMortality[0] = infantMort * 1.5 * 1.05;
    femaleMortality[0] = infantMort * 1.5 * 0.95;

    const steps = Math.max(1, Math.ceil(realYears / 5));
    const dt = realYears / steps;
    let totalBirths = 0;
    let totalDeaths = 0;

    for (let s = 0; s < steps; s++) {
      const result = this._stepCohortsSex(
        demoData.maleCohorts, demoData.femaleCohorts,
        adjFertRate, maleMortality, femaleMortality,
        demoData.sexRatioAtBirth ?? 1.05, dt
      );
      totalBirths += result.births;
      totalDeaths += result.deaths;
    }

    // Compute derived metrics from combined cohorts
    const combined = this.getCombinedCohorts(demoData);
    const totalPop = combined.reduce((a, b) => a + b, 0);
    const youth0to14 = combined[0] + combined[1] + combined[2];
    const youth15to24 = combined[3] + combined[4];
    let workingSum = 0;
    for (let i = 3; i <= 12; i++) workingSum += combined[i];
    let elderlySum = 0;
    for (let i = 13; i < COMPANION_NUM_COHORTS; i++) elderlySum += combined[i];

    const malePop = demoData.maleCohorts.reduce((a, b) => a + b, 0);
    const femalePop = demoData.femaleCohorts.reduce((a, b) => a + b, 0);

    demoData.totalPopulation = Math.round(totalPop);
    demoData.malePop = Math.round(malePop);
    demoData.femalePop = Math.round(femalePop);
    demoData.sexRatio = femalePop > 0 ? malePop / femalePop : 1.0;
    demoData.births = Math.round(totalBirths);
    demoData.deaths = Math.round(totalDeaths);
    demoData.growthRate = totalPop > 0 ? (totalBirths - totalDeaths) / totalPop : 0;
    demoData.medianAge = this._computeMedianAge(demoData.maleCohorts, demoData.femaleCohorts);

    const depDenom = Math.max(workingSum, 1);
    demoData.dependencyRatio = (youth0to14 + elderlySum) / depDenom;
    demoData.youthBulgeIndex = totalPop > 0 ? (youth15to24 / totalPop) * 100 : 0;
    demoData.laborForceShare = totalPop > 0 ? (workingSum / totalPop) * 100 : 0;

    // Demographic dividend (Bloom, Canning & Sevilla 2003)
    const lowDep = demoData.dependencyRatio < 0.6;
    const highLabor = demoData.laborForceShare > 60;
    const fallingFert = fertRate < 25;
    demoData.demographicDividend = (lowDep && highLabor && fallingFert) ?
      Math.min(1.0, (65 - demoData.laborForceShare * 0.01) * 0.1 +
                     (0.6 - demoData.dependencyRatio) * 2.0) : 0;

    // Detect demographic transition stage from observed rates
    demoData.detectedStage = this.detectTransitionStage(demoData, civState);

    this._exportToCivState(demoData, civState);
  }

  _stepCohortsSex(maleCohorts, femaleCohorts, fertRate, maleMort, femaleMort, srb, dt) {
    const frac = dt / 5;
    let births = 0;
    let deaths = 0;

    // Births: from female cohorts in reproductive age
    let reproFemales = 0;
    for (let i = 3; i <= 9; i++) {
      reproFemales += femaleCohorts[i] * COMPANION_FERTILITY_WEIGHTS[i];
    }
    const cbr = fertRate / 1000;
    const totalPop = maleCohorts.reduce((a,b) => a+b, 0) + femaleCohorts.reduce((a,b) => a+b, 0);
    births = cbr * totalPop * dt;

    const maleFrac = srb / (1 + srb);
    const maleBirths = births * maleFrac;
    const femaleBirths = births * (1 - maleFrac);

    // Process male cohorts
    const newMale = new Array(COMPANION_NUM_COHORTS).fill(0);
    for (let i = COMPANION_NUM_COHORTS - 1; i >= 0; i--) {
      const mortRate = maleMort[i] / 1000;
      const survivalProb = Math.pow(Math.max(0, 1 - mortRate), dt);
      const survived = maleCohorts[i] * survivalProb;
      deaths += maleCohorts[i] - survived;

      if (i === COMPANION_NUM_COHORTS - 1) {
        newMale[i] += survived;
      } else {
        newMale[i] += survived * (1 - frac);
        newMale[i + 1] += survived * frac;
      }
    }
    newMale[0] += maleBirths;

    // Process female cohorts
    const newFemale = new Array(COMPANION_NUM_COHORTS).fill(0);
    for (let i = COMPANION_NUM_COHORTS - 1; i >= 0; i--) {
      const mortRate = femaleMort[i] / 1000;
      const survivalProb = Math.pow(Math.max(0, 1 - mortRate), dt);
      const survived = femaleCohorts[i] * survivalProb;
      deaths += femaleCohorts[i] - survived;

      if (i === COMPANION_NUM_COHORTS - 1) {
        newFemale[i] += survived;
      } else {
        newFemale[i] += survived * (1 - frac);
        newFemale[i + 1] += survived * frac;
      }
    }
    newFemale[0] += femaleBirths;

    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      maleCohorts[i] = Math.max(0, newMale[i]);
      femaleCohorts[i] = Math.max(0, newFemale[i]);
    }

    return { births, deaths };
  }

  // Cohort-level migration: removes/adds from specific age-sex cohorts
  applyMigration(demoData, netMigrants, isEmigration, selectivity) {
    if (netMigrants <= 0) return;
    const sel = selectivity || 'working_age';

    // Migration selectivity profiles (Docquier & Rapoport 2012)
    // Working-age: 70% cohorts 3-9, 20% cohorts 10-12, 10% rest
    // Refugee: spread across all ages, slight child overweight
    // Brain drain: concentrated in 4-7 (20-39, educated)
    const weights = new Array(COMPANION_NUM_COHORTS).fill(0);
    if (sel === 'working_age') {
      for (let i = 3; i <= 9; i++) weights[i] = 0.10;
      for (let i = 10; i <= 12; i++) weights[i] = 0.067;
      weights[0] = 0.03; weights[1] = 0.03; weights[2] = 0.03;
    } else if (sel === 'brain_drain') {
      for (let i = 4; i <= 7; i++) weights[i] = 0.20;
      weights[3] = 0.10; weights[8] = 0.05; weights[9] = 0.05;
    } else { // refugee
      const flat = 1 / COMPANION_NUM_COHORTS;
      for (let i = 0; i < COMPANION_NUM_COHORTS; i++) weights[i] = flat;
      weights[0] *= 1.3; weights[1] *= 1.3; weights[2] *= 1.2;
    }

    const wSum = weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) weights[i] /= wSum;

    // 52% male in working-age migration, 48% female (UN DESA 2019)
    const maleFrac = sel === 'brain_drain' ? 0.55 : sel === 'refugee' ? 0.49 : 0.52;

    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      const cohortMigrants = netMigrants * weights[i];
      const maleM = cohortMigrants * maleFrac;
      const femaleM = cohortMigrants * (1 - maleFrac);

      if (isEmigration) {
        demoData.maleCohorts[i] = Math.max(0, demoData.maleCohorts[i] - maleM);
        demoData.femaleCohorts[i] = Math.max(0, demoData.femaleCohorts[i] - femaleM);
      } else {
        demoData.maleCohorts[i] += maleM;
        demoData.femaleCohorts[i] += femaleM;
      }
    }
  }

  _interpolateMortality(lifeExp) {
    lifeExp = Utils.clamp(lifeExp, 30, 90);
    const brackets = Object.keys(COMPANION_MORTALITY_TABLES)
      .map(Number).sort((a, b) => a - b);

    let lo = brackets[0], hi = brackets[brackets.length - 1];
    for (let i = 0; i < brackets.length - 1; i++) {
      if (lifeExp >= brackets[i] && lifeExp <= brackets[i + 1]) {
        lo = brackets[i];
        hi = brackets[i + 1];
        break;
      }
    }

    if (lo === hi) return [...COMPANION_MORTALITY_TABLES[lo]];

    const t = (lifeExp - lo) / (hi - lo);
    const loTable = COMPANION_MORTALITY_TABLES[lo];
    const hiTable = COMPANION_MORTALITY_TABLES[hi];
    const result = new Array(COMPANION_NUM_COHORTS);
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      result[i] = loTable[i] * (1 - t) + hiTable[i] * t;
    }
    return result;
  }

  _computeMedianAge(maleCohorts, femaleCohorts) {
    const combined = new Array(COMPANION_NUM_COHORTS);
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      combined[i] = (maleCohorts?.[i] ?? 0) + (femaleCohorts?.[i] ?? 0);
    }
    const total = combined.reduce((a, b) => a + b, 0);
    if (total <= 0) return 25;
    const half = total / 2;
    let cumulative = 0;
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      cumulative += combined[i];
      if (cumulative >= half) {
        const ageStart = i * 5;
        const prevCum = cumulative - combined[i];
        const within = combined[i] > 0 ? (half - prevCum) / combined[i] : 0;
        return ageStart + within * 5;
      }
    }
    return 80;
  }

  _exportToCivState(demoData, civState) {
    if (!civState.companion) civState.companion = {};
    const c = civState.companion;
    c.totalPopulation = demoData.totalPopulation;
    c.malePop = demoData.malePop;
    c.femalePop = demoData.femalePop;
    c.sexRatio = demoData.sexRatio;
    // Provide combined cohorts for backward compatibility
    c.cohorts = this.getCombinedCohorts(demoData);
    c.maleCohorts = [...demoData.maleCohorts];
    c.femaleCohorts = [...demoData.femaleCohorts];
    c.births = demoData.births;
    c.deaths = demoData.deaths;
    c.growthRate = demoData.growthRate;
    c.medianAge = demoData.medianAge;
    c.dependencyRatio = demoData.dependencyRatio;
    c.youthBulgeIndex = demoData.youthBulgeIndex;
    c.laborForceShare = demoData.laborForceShare;
    c.demographicDividend = demoData.demographicDividend;
    c.detectedTransitionStage = demoData.detectedStage;

    const combined = c.cohorts;
    const totalPop = demoData.totalPopulation;
    if (totalPop > 0) {
      const youth0to14 = combined[0] + combined[1] + combined[2];
      let elderlySum = 0;
      for (let i = 13; i < COMPANION_NUM_COHORTS; i++) elderlySum += combined[i];
      civState.youthCohort = Utils.clamp((youth0to14 / totalPop) * 100, 5, 55);
      civState.elderlyCohort = Utils.clamp((elderlySum / totalPop) * 100, 2, 40);
    }
  }

  getCohortPercentages(demoData) {
    const combined = this.getCombinedCohorts(demoData);
    const total = combined.reduce((a, b) => a + b, 0);
    if (total <= 0) return new Array(COMPANION_NUM_COHORTS).fill(0);
    return combined.map(c => (c / total) * 100);
  }

  // Detect demographic transition stage from observed vital rates.
  // This enables proper modeling of novel societies without relying
  // on pre-assigned labels. Based on the classic DTM (Thompson 1929,
  // Notestein 1945) with refinements from Caldwell (1982).
  //
  // Stage 1: High birth, high death → near-zero growth
  // Stage 2: High birth, falling death → rapid growth
  // Stage 3: Falling birth, low death → slowing growth
  // Stage 4: Low birth, low death → near-zero growth
  // Stage 5: Very low birth, low death → potential decline
  detectTransitionStage(demoData, civState) {
    const fertRate = civState.fertilityRate ?? 40;
    const lifeExp = civState.lifeExpectancy ?? 50;
    const infantMort = civState.infantMortality ?? 50;
    const growthRate = demoData.growthRate ?? 0;

    // Use multiple indicators to triangulate stage
    // rather than relying on any single threshold
    let score = 0;

    // Fertility rate indicators (births per 1000)
    if (fertRate > 35) score += 0;
    else if (fertRate > 25) score += 1;
    else if (fertRate > 15) score += 2;
    else if (fertRate > 10) score += 3;
    else score += 4;

    // Life expectancy indicators
    if (lifeExp < 45) score += 0;
    else if (lifeExp < 55) score += 1;
    else if (lifeExp < 65) score += 2;
    else if (lifeExp < 75) score += 3;
    else score += 4;

    // Infant mortality indicators (per 1000 live births)
    if (infantMort > 100) score += 0;
    else if (infantMort > 50) score += 1;
    else if (infantMort > 20) score += 2;
    else if (infantMort > 8) score += 3;
    else score += 4;

    // Map composite score to stage
    if (score <= 2) return 1;
    if (score <= 5) return 2;
    if (score <= 8) return 3;
    if (score <= 10) return 4;
    return 5;
  }
}


// ═══════════════════════════════════════════════════════════════
// DIFFUSION ENGINE — Information spread & collective action
// ═══════════════════════════════════════════════════════════════

class DiffusionEngine {

  initialize() {
    return {
      informationSpreadRate: 0.3,
      collectiveActionThreshold: 0.7,
      normChangeVelocity: 0,
      grievanceVisibility: 0.3,
    };
  }

  update(diffData, civState, governance, demoData, realYears) {
    if (realYears <= 0) return;
    const annualDamp = Math.min(1.0, realYears * 0.1);

    const urbanization = civState.urbanizationRate ?? 30;
    const literacy = civState.literacyRate ?? (civState.educationQuality ?? 30) * 1.2;
    const trust = civState.socialTrust ?? 50;
    const freedom = civState.freedomLevel ?? 50;
    const mediaEco = civState.informationEcosystem?.tier ?? 'state_controlled';
    const youthBulge = demoData?.youthBulgeIndex ?? 15;
    const culturalCohesion = civState.culturalCohesion ?? 50;
    const epistemicHealth = civState.epistemicHealth ?? 50;

    // ── Network topology approximation ──
    // The structure of social networks determines how information flows.
    // (Watts & Strogatz 1998 — small-world networks; Barabási 2003 —
    // scale-free networks; Centola 2018 — complex vs simple contagion)
    //
    // High urbanization → dense, clustered networks (fast spread,
    //   but also echo chambers and misinformation cascades)
    // Low urbanization → sparse, lattice-like networks (slow spread,
    //   but information is more trusted — must pass through known ties)
    // Youth bulge → more connections (young people have larger networks)
    // Cultural cohesion → stronger within-group ties but fewer bridges
    const networkDensity = Utils.clamp(
      (urbanization / 100) * 0.5 +
      (Math.min(youthBulge, 30) / 30) * 0.2 +
      (Math.min(literacy, 100) / 100) * 0.3,
      0.1, 1.0
    );

    // Bridge fraction: proportion of ties that connect different social
    // groups. Critical for diffusion — ideas spread within groups easily
    // but need bridges to jump between them. (Granovetter 1973 weak ties)
    // Low cultural cohesion = more diversity = more bridges
    // High freedom = more cross-group interaction
    const bridgeFraction = Utils.clamp(
      (1 - culturalCohesion / 100) * 0.4 +
      (freedom / 100) * 0.3 +
      (urbanization / 100) * 0.3,
      0.05, 0.8
    );

    const mediaMult = {
      'total_information_control': 0.15,
      'state_controlled': 0.3,
      'state_guided': 0.5,
      'captured_commercial': 0.7,
      'commercial_competitive': 0.85,
      'public_interest': 1.0,
    }[mediaEco] ?? 0.5;

    // Information spread rate incorporates network structure.
    // Dense networks with many bridges spread fastest. Dense networks
    // with few bridges create echo chambers. Sparse networks are slow
    // regardless of bridge fraction.
    const networkSpreadFactor = networkDensity * (0.5 + bridgeFraction * 0.5);
    const targetSpread = Utils.clamp(
      networkSpreadFactor * 0.35 +
      mediaMult * 0.3 +
      (trust / 100) * 0.2 +
      (Math.min(literacy, 100) / 100) * 0.15,
      0.05, 1.0
    );
    diffData.informationSpreadRate += (targetSpread - diffData.informationSpreadRate) * 0.1 * annualDamp;

    // Misinformation vulnerability: dense networks with low epistemic
    // health and few bridges create echo chambers where false beliefs
    // propagate unchecked. (Vosoughi, Roy & Aral 2018 — false news
    // spreads faster than true news on dense networks)
    diffData.misinformationVulnerability = Utils.clamp(
      networkDensity * (1 - epistemicHealth / 100) * (1 - bridgeFraction * 0.5),
      0, 1.0
    );

    // Collective action threshold incorporating network topology
    const repression = Math.max(0, 80 - freedom) / 80;
    // Dense networks with bridges lower the threshold (easier to see
    // that enough others are willing to act); sparse or fragmented
    // networks raise it (you can't tell if you'll be alone)
    const networkThresholdEffect = networkDensity * bridgeFraction * 0.15;
    const targetThreshold = Utils.clamp(
      0.3 + repression * 0.4 -
      (trust / 100) * 0.12 -
      networkThresholdEffect,
      0.15, 0.90
    );
    diffData.collectiveActionThreshold += (targetThreshold - diffData.collectiveActionThreshold) * 0.08 * annualDamp;

    // Grievance visibility: how much of actual grievance is known
    const massGrievance = civState.companion?.massGrievance ?? 20;
    diffData.grievanceVisibility = Utils.clamp(
      (massGrievance / 100) * diffData.informationSpreadRate * (1 - repression * 0.5),
      0, 1.0
    );

    // Norm change velocity (Bicchieri 2006)
    // Networks with high bridge fraction spread norm changes faster
    // because people learn about preferences of out-group members
    const normPressure = Math.abs((civState.averageWellbeing ?? 50) - 50) / 50;
    diffData.normChangeVelocity = Utils.clamp(
      normPressure * diffData.informationSpreadRate * bridgeFraction * 0.8,
      0, 1.0
    );

    // Store topology metrics for panel display
    diffData.networkDensity = networkDensity;
    diffData.bridgeFraction = bridgeFraction;

    // Export
    if (!civState.companion) civState.companion = {};
    civState.companion.diffusion = { ...diffData };
  }
}


// ═══════════════════════════════════════════════════════════════
// MICRO-FOUNDATION ENGINE — Stratum dynamics & regime transitions
// ═══════════════════════════════════════════════════════════════

class MicroFoundationEngine {

  initialize(civState, governance) {
    const econModel = civState.economicModel ?? governance?.economicModel ?? 'market';
    const shares = COMPANION_STRATUM_SHARES[econModel] || COMPANION_STRATUM_SHARES.default;

    return {
      strataSatisfaction: {
        elite: 70,
        upperMiddle: 60,
        lowerMiddle: 50,
        working: 40,
        disenfranchised: 30,
      },
      strataPopShares: { ...shares },
      interStrataMobility: {
        upward: 0.02,
        downward: 0.01,
      },
      eliteCohesion: 80,
      massGrievance: 20,
      regimeTransitionPressure: 0,
      collectiveActionPotential: 10,
      rentSeekingIntensity: 0.2,
      pendingTransition: null,
    };
  }

  update(microData, civState, governance, demoData, diffData, realYears, randFn) {
    if (realYears <= 0) return;

    const wellbeing = civState.averageWellbeing ?? 50;
    const equality = civState.equalityIndex ?? 50;
    const corruption = governance?.corruptionLevel ?? 30;
    const stability = civState.stabilityIndex ?? 70;
    const mobility = civState.socialMobility ?? 40;
    const freedom = civState.freedomLevel ?? 50;
    const wc = civState.wealthConcentration ?? 40;
    const trust = civState.socialTrust ?? 50;
    const youthBulge = demoData?.youthBulgeIndex ?? 15;
    const militaryPower = civState.militaryPower ?? 30;
    const iq = civState.institutionalQuality ?? 50;
    const annualDamp = Math.min(1.0, realYears * 0.1);

    // ── 1. Update stratum population shares ──
    this._updateStrataShares(microData, civState, governance, annualDamp);

    // ── 2. Update stratum satisfaction ──
    this._updateStrataSatisfaction(microData, civState, governance, annualDamp);

    // ── 3. Inter-stratum mobility ──
    this._updateMobility(microData, civState, governance, demoData, annualDamp);

    // ── 4. Elite cohesion ──
    // Governance structure shapes how easily elites coordinate.
    // Concentrated power means fewer decision-makers who need to agree;
    // distributed power means more veto points and coalition fragility.
    // (Bueno de Mesquita et al. 2003 — selectorate theory)
    const govId = governance?.modelId ?? '';
    let govClass = 'minimal';
    for (const [cls, govSet] of Object.entries(COMPANION_GOV_CLASSES)) {
      if (govSet.has(govId)) { govClass = cls; break; }
    }
    const eliteCohesionMod = {
      concentrated: 0.15,  // small winning coalition, easy to coordinate
      oligarchic: 0.05,    // moderate coordination among elite group
      distributed: -0.10,  // many factions, harder to maintain cohesion
      minimal: -0.20,      // no structure to coordinate through
    }[govClass] ?? 0;

    const eliteDissat = Math.max(0, 50 - microData.strataSatisfaction.elite);
    microData.eliteCohesion = Utils.clamp(
      microData.eliteCohesion + (
        (stability - 50) * 0.3 +
        (70 - corruption) * 0.2 -
        eliteDissat * 0.5 -
        (wc > 70 ? (wc - 70) * 0.15 : 0) +
        eliteCohesionMod * 10
      ) * 0.01 * annualDamp, 0, 100
    );

    // ── 5. Rent-seeking intensity ──
    // (Krueger 1974, Tullock 1967 — rent-seeking increases when
    // institutional quality is low and rents are available)
    // Concentrated power enables rent extraction; distributed power
    // with checks creates accountability that constrains it.
    const rentSeekingGovMod = {
      concentrated: 0.15,
      oligarchic: 0.10,
      distributed: -0.10,
      minimal: 0.05,  // failed states have informal rent extraction
    }[govClass] ?? 0;

    const targetRentSeeking = Utils.clamp(
      (corruption / 100) * 0.35 +
      (1 - iq / 100) * 0.25 +
      (wc / 100) * 0.15 +
      (microData.strataPopShares.elite * 2) * 0.1 +
      rentSeekingGovMod,
      0.05, 0.95
    );
    microData.rentSeekingIntensity += (targetRentSeeking - microData.rentSeekingIntensity) * 0.05 * annualDamp;

    // ── 6. Mass grievance ──
    const s = microData.strataSatisfaction;
    const shares = microData.strataPopShares;
    const massDissat = (
      Math.max(0, 50 - s.working) * shares.working +
      Math.max(0, 50 - s.disenfranchised) * shares.disenfranchised +
      Math.max(0, 50 - s.lowerMiddle) * shares.lowerMiddle +
      Math.max(0, 50 - s.upperMiddle) * shares.upperMiddle * 0.5
    ) / (shares.working + shares.disenfranchised + shares.lowerMiddle + shares.upperMiddle * 0.5);

    microData.massGrievance = Utils.clamp(
      microData.massGrievance + (massDissat - 20) * 0.02 * annualDamp,
      0, 100
    );

    // ── 7. Collective action potential ──
    // Now informed by diffusion engine
    const diffusion = diffData ?? {};
    const spreadRate = diffusion.informationSpreadRate ?? 0.3;
    const threshold = diffusion.collectiveActionThreshold ?? 0.7;
    const grievanceVisible = diffusion.grievanceVisibility ?? 0.3;

    const commCapacity = (
      trust * 0.3 +
      freedom * 0.2 +
      (youthBulge - 10) * 0.2 +
      spreadRate * 30
    ) / 100;

    // Threshold effect: collective action surges when grievance
    // visibility exceeds the population's action threshold
    const thresholdExceeded = grievanceVisible > threshold ? 1.5 : 0.7;

    microData.collectiveActionPotential = Utils.clamp(
      microData.collectiveActionPotential + (
        microData.massGrievance * 0.3 * thresholdExceeded +
        commCapacity * 30 - 15
      ) * 0.01 * annualDamp, 0, 100
    );

    // ── 8. Regime transition pressure ──
    const eliteSplits = Math.max(0, 50 - microData.eliteCohesion);
    const mobilization = microData.collectiveActionPotential;
    microData.regimeTransitionPressure = Utils.clamp(
      (eliteSplits * mobilization) / 50, 0, 100
    );

    // ── 9. Check for regime transitions ──
    microData.pendingTransition = this._checkTransitions(
      microData, civState, governance, randFn
    );

    // ── 10. Export ──
    if (!civState.companion) civState.companion = {};
    civState.companion.strataSatisfaction = { ...s };
    civState.companion.strataPopShares = { ...shares };
    civState.companion.interStrataMobility = { ...microData.interStrataMobility };
    civState.companion.eliteCohesion = microData.eliteCohesion;
    civState.companion.massGrievance = microData.massGrievance;
    civState.companion.regimeTransitionPressure = microData.regimeTransitionPressure;
    civState.companion.collectiveActionPotential = microData.collectiveActionPotential;
    civState.companion.rentSeekingIntensity = microData.rentSeekingIntensity;
  }

  _updateStrataShares(microData, civState, governance, annualDamp) {
    const econModel = civState.economicModel ?? governance?.economicModel ?? 'market';
    const baseShares = COMPANION_STRATUM_SHARES[econModel] || COMPANION_STRATUM_SHARES.default;
    const wc = civState.wealthConcentration ?? 40;
    const eduAccess = civState.educationAccessibility ?? 'restricted';
    const equality = civState.equalityIndex ?? 50;

    const shares = microData.strataPopShares;

    // WC shifts population from middle strata to elite + disenfranchised
    // (hollowing out the middle class — Autor 2010, Milanovic 2016)
    const wcEffect = (wc - 40) / 100;
    const targetShares = { ...baseShares };
    targetShares.elite += wcEffect * 0.01;
    targetShares.disenfranchised += wcEffect * 0.08;
    targetShares.upperMiddle -= wcEffect * 0.03;
    targetShares.lowerMiddle -= wcEffect * 0.03;
    targetShares.working -= wcEffect * 0.03;

    // Education access widens middle class
    const eduBonus = {
      'universal': 0.06, 'broad': 0.03,
      'restricted': 0.0, 'elite_only': -0.03,
    }[eduAccess] ?? 0;
    targetShares.upperMiddle += eduBonus * 0.4;
    targetShares.lowerMiddle += eduBonus * 0.6;
    targetShares.disenfranchised -= eduBonus;

    // Normalize
    const tSum = Object.values(targetShares).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(targetShares)) {
      targetShares[k] = Math.max(0.01, targetShares[k] / tSum);
    }

    // Slow convergence toward target
    for (const k of Object.keys(shares)) {
      shares[k] += (targetShares[k] - shares[k]) * 0.03 * annualDamp;
      shares[k] = Math.max(0.01, shares[k]);
    }

    // Re-normalize
    const sSum = Object.values(shares).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(shares)) shares[k] /= sSum;
  }

  _updateStrataSatisfaction(microData, civState, governance, annualDamp) {
    const wellbeing = civState.averageWellbeing ?? 50;
    const equality = civState.equalityIndex ?? 50;
    const corruption = governance?.corruptionLevel ?? 30;
    const stability = civState.stabilityIndex ?? 70;
    const mobility = civState.socialMobility ?? 40;
    const freedom = civState.freedomLevel ?? 50;
    const wc = civState.wealthConcentration ?? 40;
    const econModel = civState.economicModel ?? governance?.economicModel ?? 'market';
    const govId = governance?.modelId ?? '';

    // Economic model shapes how wellbeing gains are distributed across
    // strata. Market economies concentrate gains at the top; commons/gift
    // economies distribute more evenly; planned economies provide floor
    // but cap ceiling. These are structural effects, not value judgments.
    // (Milanovic 2016 — different systems produce different Lorenz curves)
    const econSatMod = {
      gift:         { elite: -0.15, upperMiddle: 0,    lowerMiddle: 0.10, working: 0.15,  disenfranchised: 0.20 },
      commons:      { elite: -0.10, upperMiddle: 0.05, lowerMiddle: 0.10, working: 0.15,  disenfranchised: 0.15 },
      labor_credit: { elite: -0.05, upperMiddle: 0.05, lowerMiddle: 0.10, working: 0.10,  disenfranchised: 0.10 },
      barter:       { elite:  0,    upperMiddle: 0,    lowerMiddle: 0,    working: 0,     disenfranchised: 0    },
      planned:      { elite: -0.10, upperMiddle: 0,    lowerMiddle: 0.05, working: 0.08,  disenfranchised: 0.05 },
      mixed:        { elite:  0.05, upperMiddle: 0.05, lowerMiddle: 0,    working: -0.03, disenfranchised: -0.05},
      market:       { elite:  0.15, upperMiddle: 0.05, lowerMiddle: -0.05,working: -0.10, disenfranchised: -0.15},
      commodity:    { elite:  0.10, upperMiddle: 0,    lowerMiddle: -0.03,working: -0.05, disenfranchised: -0.08},
    }[econModel] ?? { elite: 0, upperMiddle: 0, lowerMiddle: 0, working: 0, disenfranchised: 0 };

    // Governance class shapes which strata feel represented.
    // Concentrated power satisfies elites at expense of masses;
    // distributed power does the reverse. (Bueno de Mesquita et al.
    // 2003 — selectorate theory: leaders satisfy their winning coalition)
    let govClass = 'minimal';
    for (const [cls, govSet] of Object.entries(COMPANION_GOV_CLASSES)) {
      if (govSet.has(govId)) { govClass = cls; break; }
    }
    const govSatMod = {
      concentrated: { elite: 0.15, upperMiddle: -0.05, lowerMiddle: -0.10, working: -0.15, disenfranchised: -0.20 },
      oligarchic:   { elite: 0.10, upperMiddle: 0.05,  lowerMiddle: -0.05, working: -0.10, disenfranchised: -0.10 },
      distributed:  { elite: -0.10, upperMiddle: 0.05, lowerMiddle: 0.08, working: 0.08,  disenfranchised: 0.05 },
      minimal:      { elite: -0.05, upperMiddle: -0.03, lowerMiddle: -0.05, working: -0.03, disenfranchised: -0.05 },
    }[govClass] ?? { elite: 0, upperMiddle: 0, lowerMiddle: 0, working: 0, disenfranchised: 0 };

    const s = microData.strataSatisfaction;

    const wbScale = wellbeing / 50;

    s.elite = Utils.clamp(s.elite + (
      (wellbeing - 50) * 0.3 +
      (100 - corruption) * 0.2 +
      (stability - 50) * 0.3 +
      (wc - 50) * 0.2 +
      (econSatMod.elite + govSatMod.elite) * wbScale * 10
    ) * 0.02 * annualDamp, 0, 100);

    s.upperMiddle = Utils.clamp(s.upperMiddle + (
      (wellbeing - 50) * 0.3 +
      (mobility - 40) * 0.3 +
      (equality - 50) * 0.2 +
      (freedom - 50) * 0.2 +
      (econSatMod.upperMiddle + govSatMod.upperMiddle) * wbScale * 10
    ) * 0.02 * annualDamp, 0, 100);

    s.lowerMiddle = Utils.clamp(s.lowerMiddle + (
      (wellbeing - 40) * 0.25 +
      (mobility - 40) * 0.25 +
      (equality - 50) * 0.25 +
      (50 - corruption) * 0.25 +
      (econSatMod.lowerMiddle + govSatMod.lowerMiddle) * wbScale * 10
    ) * 0.02 * annualDamp, 0, 100);

    s.working = Utils.clamp(s.working + (
      (wellbeing - 35) * 0.3 +
      (equality - 50) * 0.3 +
      (mobility - 30) * 0.2 +
      (50 - wc) * 0.2 +
      (econSatMod.working + govSatMod.working) * wbScale * 10
    ) * 0.02 * annualDamp, 0, 100);

    s.disenfranchised = Utils.clamp(s.disenfranchised + (
      (wellbeing - 30) * 0.3 +
      (equality - 50) * 0.3 +
      (freedom - 50) * 0.2 +
      (50 - corruption) * 0.2 +
      (econSatMod.disenfranchised + govSatMod.disenfranchised) * wbScale * 10
    ) * 0.02 * annualDamp, 0, 100);
  }

  _updateMobility(microData, civState, governance, demoData, annualDamp) {
    const eduQ = civState.educationQuality ?? 30;
    const mobility = civState.socialMobility ?? 40;
    const wc = civState.wealthConcentration ?? 40;
    const iq = civState.institutionalQuality ?? 50;
    const eduAccess = civState.educationAccessibility ?? 'restricted';

    // Education access multiplier — universal access creates wider
    // pathways for upward mobility (Goldin & Katz 2008)
    const eduAccessMult = {
      'universal': 1.4, 'broad': 1.15,
      'restricted': 0.85, 'elite_only': 0.5,
    }[eduAccess] ?? 1.0;

    // Age-structure effect: younger populations with education access
    // have more potential for mobility — they're entering the workforce
    // with new skills. (Lutz et al. 2014 — human capital demographics)
    const youthBulge = demoData?.youthBulgeIndex ?? 15;
    const laborShare = demoData?.laborForceShare ?? 60;
    const ageMobilityBonus = youthBulge > 15 ?
      Math.min(0.02, (youthBulge - 15) / 100 * eduQ / 100) : 0;

    // Upward mobility: education + institutional quality enable it
    // (Chetty et al. 2014 — Opportunity Atlas; Corak 2013 — Great Gatsby Curve)
    const targetUpward = Utils.clamp(
      ((eduQ / 100) * 0.3 + (mobility / 100) * 0.25 +
       (iq / 100) * 0.2 + (1 - wc / 100) * 0.15 +
       ageMobilityBonus) * eduAccessMult,
      0.005, 0.12
    );
    microData.interStrataMobility.upward +=
      (targetUpward - microData.interStrataMobility.upward) * 0.05 * annualDamp;

    // Downward mobility: high WC + economic shocks push people down.
    // Low education traps people — they can't reskill after displacement.
    const eduProtection = Math.max(0.6, eduQ / 100);
    const targetDownward = Utils.clamp(
      ((wc / 100) * 0.3 + (1 - (civState.stabilityIndex ?? 70) / 100) * 0.3 +
       (governance?.corruptionLevel ?? 30) / 200) / eduProtection,
      0.003, 0.08
    );
    microData.interStrataMobility.downward +=
      (targetDownward - microData.interStrataMobility.downward) * 0.05 * annualDamp;
  }

  _checkTransitions(microData, civState, governance, randFn) {
    const pressure = microData.regimeTransitionPressure;
    const elite = microData.eliteCohesion;
    const cap = microData.collectiveActionPotential;
    const grievance = microData.massGrievance;
    const mil = civState.militaryPower ?? 30;
    const freedom = civState.freedomLevel ?? 50;
    const wc = civState.wealthConcentration ?? 40;
    const govId = governance?.modelId ?? '';
    const stability = civState.stabilityIndex ?? 70;
    const wellbeing = civState.averageWellbeing ?? 50;

    // Classify governance type structurally
    let govClass = 'minimal';
    for (const [cls, govSet] of Object.entries(COMPANION_GOV_CLASSES)) {
      if (govSet.has(govId)) { govClass = cls; break; }
    }
    const susceptibility = COMPANION_GOV_TRANSITION_SUSCEPTIBILITY[govClass]
      ?? COMPANION_GOV_TRANSITION_SUSCEPTIBILITY.minimal;

    // Resource rents suppress transitions (Ross 2001)
    const resRent = (civState.resourceRentDependence ?? 0) / 100;
    const rentSuppress = resRent > 0.1 ? Math.max(0.1, 1 - resRent * 1.2) : 1.0;

    // Can't transition from failed state (nothing to transition to —
    // state-building is a separate process, not a regime transition)
    if (govId === 'failed_state') return null;

    // Hidden-control regimes suppress transitions through information
    // manipulation rather than brute force
    const hiddenControl = governance?.hiddenControl === true;
    const hiddenSuppress = hiddenControl ? 0.3 : 1.0;

    // Recent transition check — prevent rapid oscillation
    const recentHistory = civState._companionTransitionTurn ?? -999;
    const currentTurn = civState._currentTurn ?? 0;
    if (currentTurn - recentHistory < 5) return null;

    const rand = randFn ?? ((typeof Utils !== 'undefined') ? Utils.random : Math.random);
    const T = COMPANION_TRANSITION_THRESHOLDS;

    // ── Popular Revolution ──
    // When pressure is extreme, mass mobilization is high, and grievance
    // is deep. Susceptibility varies: distributed systems are resilient,
    // concentrated ones are vulnerable.
    if (pressure >= T.popularRevolution.pressureMin &&
        cap >= T.popularRevolution.collectiveActionMin &&
        grievance >= T.popularRevolution.massGrievanceMin) {
      const sus = susceptibility.popularRevolution;
      const prob = T.popularRevolution.probabilityBase * sus * rentSuppress * hiddenSuppress;
      if (rand() < prob) {
        return { type: 'popular_revolution', pressure, cap, grievance };
      }
    }

    // ── Democratization ──
    // Moderate pressure + elite splits + organized civil society.
    // Requires concentrated or oligarchic power — distributed systems
    // are already democratic. (Huntington 1991; Haggard & Kaufman 2016)
    const canDemocratize = susceptibility.democratization > 0;
    if (canDemocratize &&
        pressure >= T.democratization.pressureMin &&
        elite <= T.democratization.eliteCohesionMax &&
        cap >= T.democratization.collectiveActionMin) {
      const sus = susceptibility.democratization;
      const prob = T.democratization.probabilityBase * sus * rentSuppress * hiddenSuppress;
      if (rand() < prob) {
        return { type: 'democratization', pressure, elite, cap };
      }
    }

    // ── Military Coup ──
    // Elite fragmentation + weak civil society + strong military.
    // Power vacuums (minimal class) are especially susceptible.
    // (Geddes, Wright & Frantz 2014)
    if (elite <= T.militaryCoup.eliteCohesionMax &&
        cap <= T.militaryCoup.collectiveActionMax &&
        mil >= T.militaryCoup.militaryMin &&
        stability < 40) {
      const sus = susceptibility.militaryCoup;
      const prob = T.militaryCoup.probabilityBase * sus * rentSuppress * hiddenSuppress;
      if (rand() < prob) {
        return { type: 'military_coup', elite, mil, stability };
      }
    }

    // ── Authoritarian Consolidation ──
    // Strong elite cohesion + rising grievance + regime has enough
    // space to crack down. Concentrated regimes do this more easily.
    // (Svolik 2012)
    if (elite >= T.authoritarianConsolidation.eliteCohesionMin &&
        grievance >= T.authoritarianConsolidation.massGrievanceMin &&
        freedom >= T.authoritarianConsolidation.freedomMin) {
      const sus = susceptibility.authoritarianConsolidation;
      const prob = T.authoritarianConsolidation.probabilityBase * sus * hiddenSuppress;
      if (rand() < prob) {
        return { type: 'authoritarian_consolidation', elite, grievance, freedom };
      }
    }

    // ── Gradual Liberalization ──
    // Moderate pressure but high elite cohesion + sufficient wealth.
    // Requires non-distributed governance — elites choose to liberalize
    // to prevent revolution. (Acemoglu & Robinson 2006)
    const canLiberalize = susceptibility.gradualLiberalization > 0;
    if (canLiberalize &&
        pressure >= T.gradualLiberalization.pressureMin &&
        pressure <= T.gradualLiberalization.pressureMax &&
        elite >= T.gradualLiberalization.eliteCohesionMin &&
        wellbeing >= T.gradualLiberalization.wealthMin) {
      const sus = susceptibility.gradualLiberalization;
      const prob = T.gradualLiberalization.probabilityBase * sus * rentSuppress;
      if (rand() < prob) {
        return { type: 'gradual_liberalization', pressure, elite, wellbeing };
      }
    }

    return null;
  }
}


// ═══════════════════════════════════════════════════════════════
// COMPANION MODULE — Orchestrator
// ═══════════════════════════════════════════════════════════════

class CompanionModule {
  constructor(game) {
    this.game = game;
    this.temporal = new TemporalEngine();
    this.demographic = new DemographicEngine();
    this.microFoundations = new MicroFoundationEngine();
    this.diffusion = new DiffusionEngine();
    this.civData = new Map();
    this.isActive = true;
    this.realYear = null;
    this.turnHistory = [];
  }

  initializeCiv(civ, config) {
    const st = civ.state;
    const stage = st.demographicTransitionStage ?? 1;
    const pop = st.population ?? 1000;

    const demoData = this.demographic.initialize(pop, stage, config?.companion);
    const microData = this.microFoundations.initialize(st, civ.governance);
    const diffData = this.diffusion.initialize();

    this.civData.set(civ.id, {
      demographic: demoData,
      microFoundations: microData,
      diffusion: diffData,
    });

    if (this.realYear === null) {
      this.realYear = this.game.currentYear ?? 0;
    }
  }

  processTurn(civ, yearsDelta) {
    const data = this.civData.get(civ.id);
    if (!data) {
      this.initializeCiv(civ, {});
      return;
    }

    const realYears = yearsDelta;
    this.realYear = this.game.currentYear ?? (this.realYear + realYears);

    // Track current turn for transition cooldown
    civ.state._currentTurn = this.game?.turnCount ?? 0;

    // 1. Reconcile population delta from post-processing
    // After companion sets population from cohorts, simulation post-processing
    // (inter-civ migration, wars, history events) may modify civ.state.population.
    // Capture that delta and distribute it proportionally across cohorts so the
    // cohort model stays synchronized with the actual population.
    this._reconcilePopulationDelta(civ, data);

    // 2. Temporal rate limits
    this.temporal.applyRateLimits(
      civ.id, civ.state, civ.governance, realYears
    );

    // 3. Demographics (sex-disaggregated)
    this.demographic.update(
      data.demographic, civ.state, civ.governance, realYears, civ.activeEvents
    );

    // 4. Set authoritative population from cohorts
    if (data.demographic.totalPopulation > 0) {
      civ.state.population = data.demographic.totalPopulation;
    }

    // 5. Apply any pending migration at cohort level
    this._applyPendingMigration(civ, data);

    // 6. Diffusion engine
    this.diffusion.update(
      data.diffusion, civ.state, civ.governance, data.demographic, realYears
    );

    // 7. Micro-foundations (with diffusion data)
    const randFn = (typeof Utils !== 'undefined') ? Utils.random : Math.random;
    this.microFoundations.update(
      data.microFoundations, civ.state, civ.governance,
      data.demographic, data.diffusion, realYears, randFn
    );

    // 8. Process regime transition if one was triggered
    const transition = data.microFoundations.pendingTransition;
    if (transition) {
      this._applyRegimeTransition(civ, transition);
      data.microFoundations.pendingTransition = null;
    }

    // 9. Feed companion analysis back into core dynamics
    this._applyFeedback(civ, data, realYears);

    // 10. Rent-seeking → corruption feedback
    this._applyRentSeekingFeedback(civ, data, realYears);

    // 11. Record turn history
    this._recordTurnHistory(civ);
  }

  capturePreTurnSnapshot(civ) {
    this.temporal.captureSnapshot(civ.id, civ.state, civ.governance);
  }

  _reconcilePopulationDelta(civ, data) {
    const demo = data.demographic;
    const cohortTotal = demo.maleCohorts.reduce((a, b) => a + b, 0) +
                        demo.femaleCohorts.reduce((a, b) => a + b, 0);
    if (cohortTotal <= 0) return;

    // Age-selective war casualty distribution: combat deaths fall
    // disproportionately on males 15-44 (cohorts 3-8).
    // (Lacina & Gleditsch 2005; WHO Global Burden of Disease)
    const warRate = civ.state._pendingWarCasualties ?? 0;
    if (warRate > 0) {
      const warDeaths = Math.round(cohortTotal * warRate);
      let remaining = warDeaths;
      // 85% from male combat-age (15-44), 10% male other, 5% female
      const maleCombatShare = 0.85;
      const maleOtherShare = 0.10;

      // Male combat-age cohorts (15-44 = indices 3-8)
      let maleCombatTotal = 0;
      for (let i = 3; i <= 8; i++) maleCombatTotal += demo.maleCohorts[i];
      if (maleCombatTotal > 0) {
        const combatDeaths = Math.min(remaining, Math.round(warDeaths * maleCombatShare));
        for (let i = 3; i <= 8; i++) {
          const share = demo.maleCohorts[i] / maleCombatTotal;
          demo.maleCohorts[i] = Math.max(0, demo.maleCohorts[i] - combatDeaths * share);
        }
        remaining -= combatDeaths;
      }

      // Other male cohorts
      let maleOtherTotal = 0;
      for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
        if (i < 3 || i > 8) maleOtherTotal += demo.maleCohorts[i];
      }
      if (maleOtherTotal > 0 && remaining > 0) {
        const otherMaleDeaths = Math.min(remaining, Math.round(warDeaths * maleOtherShare));
        for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
          if (i < 3 || i > 8) {
            const share = demo.maleCohorts[i] / maleOtherTotal;
            demo.maleCohorts[i] = Math.max(0, demo.maleCohorts[i] - otherMaleDeaths * share);
          }
        }
        remaining -= otherMaleDeaths;
      }

      // Remaining on female cohorts (civilian casualties)
      if (remaining > 0) {
        const femTotal = demo.femaleCohorts.reduce((a, b) => a + b, 0);
        if (femTotal > 0) {
          for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
            const share = demo.femaleCohorts[i] / femTotal;
            demo.femaleCohorts[i] = Math.max(0, demo.femaleCohorts[i] - remaining * share);
          }
        }
      }

      civ.state._pendingWarCasualties = 0;
    }

    // General delta reconciliation for non-war population changes
    // (migration, events, other post-processing)
    const newCohortTotal = demo.maleCohorts.reduce((a, b) => a + b, 0) +
                           demo.femaleCohorts.reduce((a, b) => a + b, 0);
    const civPop = civ.state.population ?? newCohortTotal;
    const delta = civPop - newCohortTotal;

    if (Math.abs(delta) < 1) {
      demo.totalPopulation = Math.round(newCohortTotal);
      return;
    }

    const ratio = civPop / newCohortTotal;
    for (let i = 0; i < COMPANION_NUM_COHORTS; i++) {
      demo.maleCohorts[i] = Math.max(0, demo.maleCohorts[i] * ratio);
      demo.femaleCohorts[i] = Math.max(0, demo.femaleCohorts[i] * ratio);
    }
    demo.totalPopulation = Math.round(civPop);
  }

  _applyPendingMigration(civ, data) {
    const mig = civ.state._pendingMigration;
    if (!mig) return;

    if (mig.emigrants > 0) {
      this.demographic.applyMigration(
        data.demographic, mig.emigrants, true, mig.selectivity ?? 'working_age'
      );
    }
    if (mig.immigrants > 0) {
      this.demographic.applyMigration(
        data.demographic, mig.immigrants, false, mig.selectivity ?? 'working_age'
      );
    }

    civ.state._pendingMigration = null;
  }

  _applyRegimeTransition(civ, transition) {
    const currentYear = this.game?.currentYear ?? 0;
    civ.state._companionTransitionTurn = civ.state._currentTurn ?? 0;

    switch (transition.type) {
      case 'popular_revolution':
        civ.applyRegimeChange('revolution_democratic', null, currentYear);
        this.game.ui?.showNotification(
          `🔥 Popular revolution in ${civ.name}! Mass mobilization has overthrown the regime.`
        );
        break;

      case 'democratization':
        civ.applyRegimeChange('revolution_democratic', null, currentYear);
        this.game.ui?.showNotification(
          `🗳️ Democratic transition in ${civ.name}. Elite divisions and organized civil society have opened the political system.`
        );
        break;

      case 'military_coup':
        civ.applyRegimeChange('revolution_authoritarian', null, currentYear);
        this.game.ui?.showNotification(
          `⚔️ Military coup in ${civ.name}. The armed forces have seized power amid institutional collapse.`
        );
        break;

      case 'authoritarian_consolidation': {
        const hier = civ.governance?.hierarchyLevel ?? 50;
        civ.governance.hierarchyLevel = Utils.clamp(hier + 15, 0, 100);
        civ.governance.powerConcentration = Utils.clamp(
          (civ.governance.powerConcentration ?? 50) + 20, 0, 100);
        civ.operatingPrinciples.freedomLevel = Utils.clamp(
          (civ.operatingPrinciples?.freedomLevel ?? 50) - 15, 0, 100);
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 50) + 10, 0, 100);
        civ.addHistoryEntry(currentYear,
          'Authoritarian Consolidation',
          `The ruling elite of ${civ.name} has consolidated power, restricting political space and tightening control. The stated justification is stability and order in the face of rising grievances. Whether this suppresses or merely defers the underlying tensions remains to be seen.`,
          'regime_consolidation');
        this.game.ui?.showNotification(
          `🔒 Authoritarian consolidation in ${civ.name}. The regime has tightened its grip.`
        );
        break;
      }

      case 'gradual_liberalization': {
        const hier2 = civ.governance?.hierarchyLevel ?? 50;
        civ.governance.hierarchyLevel = Utils.clamp(hier2 - 8, 0, 100);
        civ.governance.powerConcentration = Utils.clamp(
          (civ.governance.powerConcentration ?? 50) - 10, 0, 100);
        civ.operatingPrinciples.freedomLevel = Utils.clamp(
          (civ.operatingPrinciples?.freedomLevel ?? 30) + 8, 0, 100);
        if (civ.governance) {
          civ.governance.corruptionLevel = Utils.clamp(
            (civ.governance.corruptionLevel ?? 50) - 5, 0, 100);
        }
        civ.addHistoryEntry(currentYear,
          'Gradual Liberalization',
          `The ruling elite of ${civ.name} has begun cautiously opening the political system — expanding participation, loosening restrictions, allowing more space for civil society. This is reform from above, calculated to preserve elite interests while relieving pressure. It may be the beginning of genuine democratization, or it may be a strategic concession that stabilizes the existing order.`,
          'liberalization');
        this.game.ui?.showNotification(
          `📜 Gradual liberalization in ${civ.name}. The regime is cautiously opening up.`
        );
        break;
      }
    }

    // Record transition in companion history
    const data = this.civData.get(civ.id);
    if (data) {
      if (!data.transitionHistory) data.transitionHistory = [];
      data.transitionHistory.push({
        type: transition.type,
        year: currentYear,
        turn: this.game?.turnCount ?? 0,
        pressure: transition.pressure?.toFixed(1) ?? 'N/A',
        grievance: transition.grievance?.toFixed(1) ?? 'N/A',
        cap: transition.cap?.toFixed(1) ?? 'N/A',
      });
    }

    // Refresh NPCs after regime change
    if (typeof generateNPCPool === 'function') {
      civ.npcs = generateNPCPool(civ);
    }
  }

  _applyRentSeekingFeedback(civ, data, realYears) {
    const micro = data.microFoundations;
    if (!micro || !civ.governance) return;
    const timeScale = realYears / 10;

    // Rent-seeking intensity feeds back into corruption
    // (Mauro 1995 — corruption and rent-seeking are self-reinforcing)
    const rsi = micro.rentSeekingIntensity ?? 0.2;
    if (rsi > 0.4) {
      const corruptionPush = (rsi - 0.4) * 3.0 * timeScale;
      civ.governance.corruptionLevel = Utils.clamp(
        (civ.governance.corruptionLevel ?? 30) + corruptionPush, 0, 100
      );
    }

    // Low rent-seeking allows anti-corruption progress
    if (rsi < 0.2 && (civ.state.institutionalQuality ?? 50) > 50) {
      const corruptionPull = (0.2 - rsi) * 1.5 * timeScale;
      civ.governance.corruptionLevel = Utils.clamp(
        (civ.governance.corruptionLevel ?? 30) - corruptionPull, 0, 100
      );
    }
  }

  _applyFeedback(civ, data, realYears) {
    const st = civ.state;
    if (!st) return;
    const timeScale = realYears / 10;
    const demo = data.demographic;
    const micro = data.microFoundations;

    // Demographic dividend → wellbeing (Bloom, Canning & Sevilla 2003)
    if (demo.demographicDividend > 0) {
      st.averageWellbeing = Utils.clamp(
        (st.averageWellbeing ?? 50) + demo.demographicDividend * 1.5 * timeScale,
        0, 100
      );
    }

    // Youth bulge → instability (Goldstone 1991, Urdal 2006)
    if (demo.youthBulgeIndex > 25) {
      const resRentDamp = (st.resourceRentDependence ?? 0) / 100;
      const rentDampen = resRentDamp > 0.1 ? (1.0 - resRentDamp * 0.6) : 1.0;
      const bulgeEffect = (demo.youthBulgeIndex - 25) / 75;
      st.stabilityIndex = Utils.clamp(
        (st.stabilityIndex ?? 70) - bulgeEffect * 0.5 * rentDampen * timeScale,
        0, 100
      );
    }

    // Elite cohesion → institutional persistence (Acemoglu & Robinson 2006)
    if (micro.eliteCohesion > 60) {
      const persistence = (micro.eliteCohesion - 60) / 40;
      const iqNow = st.institutionalQuality ?? 50;
      const hierarchy = (civ.governance?.hierarchyLevel ?? 50) / 100;
      const dimFloor = 0.15 + Math.max(0, hierarchy - 0.5) * 0.4;
      const iqDiminish = Math.max(dimFloor, 1 - iqNow / 80);
      st.institutionalQuality = Utils.clamp(
        iqNow + persistence * 2.5 * hierarchy * iqDiminish * timeScale,
        0, 100
      );
    }

    // Labor force → WC dispersion (Kuznets 1955, Goldin & Katz 2008)
    if (demo.laborForceShare > 55 && civ.economic) {
      const laborPressure = (demo.laborForceShare - 55) / 45;
      civ.economic.wealthConcentration = Utils.clamp(
        (civ.economic.wealthConcentration ?? 30) - laborPressure * 0.1 * timeScale,
        0, 93
      );
    }

    // Mass grievance → trust erosion (Rothstein 2011, Putnam 2000)
    if (micro.massGrievance > 40) {
      const trustDrain = (micro.massGrievance - 40) / 60;
      st.socialTrust = Utils.clamp(
        (st.socialTrust ?? 50) - trustDrain * 0.15 * timeScale, 0, 100
      );
    }

    // Mass grievance → stability risk (Gurr 1970)
    if (micro.massGrievance > 50) {
      const resRentGriev = (st.resourceRentDependence ?? 0) / 100;
      const grDampen = resRentGriev > 0.1 ? (1.0 - resRentGriev * 0.5) : 1.0;
      const stabDrain = (micro.massGrievance - 50) / 50;
      st.stabilityIndex = Utils.clamp(
        (st.stabilityIndex ?? 70) - stabDrain * 0.1 * grDampen * timeScale, 0, 100
      );
    }

    // Misinformation vulnerability → epistemic health and trust erosion
    // (Lewandowsky et al. 2012; Vosoughi, Roy & Aral 2018)
    const diff = data.diffusion;
    const misinfoVuln = diff?.misinformationVulnerability ?? 0;
    if (misinfoVuln > 0.4) {
      const misinfoEffect = (misinfoVuln - 0.4) / 0.6;
      st.epistemicHealth = Utils.clamp(
        (st.epistemicHealth ?? 50) - misinfoEffect * 0.15 * timeScale, 0, 100
      );
      st.socialTrust = Utils.clamp(
        (st.socialTrust ?? 50) - misinfoEffect * 0.08 * timeScale, 0, 100
      );
    }

    // Regime transition pressure → legitimacy erosion (Huntington 1991)
    if (micro.regimeTransitionPressure > 25) {
      const legDrain = (micro.regimeTransitionPressure - 25) / 75;
      st.legitimacyLevel = Utils.clamp(
        (st.legitimacyLevel ?? 60) - legDrain * 0.2 * timeScale, 0, 100
      );
    }

    // Sex ratio imbalance → instability (Hudson & den Boer 2004 —
    // surplus males increase competition, violence, and instability)
    if (demo.sexRatio > 1.08) {
      const imbalance = (demo.sexRatio - 1.08) / 0.2;
      st.stabilityIndex = Utils.clamp(
        (st.stabilityIndex ?? 70) - imbalance * 0.2 * timeScale, 0, 100
      );
    }

    this._applyEmpathyDemographicFeedback(civ, data, timeScale);
  }

  _applyEmpathyDemographicFeedback(civ, data, timeScale) {
    const st = civ.state;
    if (!st) return;
    const demo = data.demographic;
    const br = st.behaviorReinforcement;
    if (!br) return;

    const youthBulge = demo.youthBulgeIndex ?? 15;
    const medianAge = demo.medianAge ?? 28;
    const depRatio = demo.dependencyRatio ?? 50;

    if (youthBulge > 20) {
      const youthPressure = (youthBulge - 20) / 60;
      br.competition = Utils.clamp(
        (br.competition ?? 50) + youthPressure * 0.08 * timeScale, 0, 100);
      br.acquisitiveness = Utils.clamp(
        (br.acquisitiveness ?? 50) + youthPressure * 0.05 * timeScale, 0, 100);
    }

    if (medianAge > 35) {
      const agingFactor = Math.min(1, (medianAge - 35) / 20);
      br.cooperation = Utils.clamp(
        (br.cooperation ?? 50) + agingFactor * 0.05 * timeScale, 0, 100);
      br.conformity = Utils.clamp(
        (br.conformity ?? 50) + agingFactor * 0.03 * timeScale, 0, 100);
    }

    if (st.empathyByStratum) {
      if (youthBulge > 25) {
        const cascadeAmp = (youthBulge - 25) / 50;
        const wc = st.empathyByStratum.working_class ?? 75;
        st.empathyByStratum.working_class = Utils.clamp(
          wc - cascadeAmp * 0.1 * timeScale, 0, 100);
      }

      if (depRatio > 60) {
        const strain = (depRatio - 60) / 40;
        const lm = st.empathyByStratum.lower_middle ?? 68;
        st.empathyByStratum.lower_middle = Utils.clamp(
          lm - strain * 0.06 * timeScale, 0, 100);
        br.mutualAid = Utils.clamp(
          (br.mutualAid ?? 50) + strain * 0.04 * timeScale, 0, 100);
      }
    }

    if (st.culturalEmpathyNorm !== undefined) {
      const growthRate = Math.abs(demo.growthRate ?? 0);
      if (growthRate > 2.0) {
        const disruption = Math.min(1, (growthRate - 2.0) / 3.0);
        st.culturalEmpathyNorm = Utils.clamp(
          st.culturalEmpathyNorm - disruption * 0.03 * timeScale, 0, 100);
      }
    }
  }

  _recordTurnHistory(civ) {
    const c = civ.state.companion;
    if (!c) return;
    if (!this.turnHistory) this.turnHistory = [];

    const turn = this.game?.turnCount ?? 0;
    const entry = {
      year: this.realYear,
      turn,
      civId: civ.id,
      population: c.totalPopulation,
      medianAge: c.medianAge,
      growthRate: c.growthRate,
      dependencyRatio: c.dependencyRatio,
      youthBulge: c.youthBulgeIndex,
      laborForceShare: c.laborForceShare,
      demographicDividend: c.demographicDividend,
      births: c.births,
      deaths: c.deaths,
      sexRatio: c.sexRatio,
      regimePressure: c.regimeTransitionPressure ?? 0,
      eliteCohesion: c.eliteCohesion ?? 0,
      massGrievance: c.massGrievance ?? 0,
      collectiveActionPotential: c.collectiveActionPotential ?? 0,
      rentSeekingIntensity: c.rentSeekingIntensity ?? 0,
    };

    this.turnHistory.push(entry);

    const civEntries = this.turnHistory.filter(e => e.civId === civ.id);
    if (civEntries.length > 200) {
      const cutoff = civEntries[civEntries.length - 200].year;
      this.turnHistory = this.turnHistory.filter(
        e => e.civId !== civ.id || e.year >= cutoff
      );
    }

    if (!c.demographicHistory) c.demographicHistory = [];
    c.demographicHistory.push({
      turn, year: this.realYear,
      population: c.totalPopulation, medianAge: c.medianAge,
      growthRate: c.growthRate, dependencyRatio: c.dependencyRatio,
      youthBulge: c.youthBulgeIndex, laborForceShare: c.laborForceShare,
      births: c.births, deaths: c.deaths, demographicDividend: c.demographicDividend,
      sexRatio: c.sexRatio,
    });
    if (c.demographicHistory.length > 50) c.demographicHistory.shift();

    const dampenLog = this.temporal.getDampenLog();
    if (!c.temporalDampenHistory) c.temporalDampenHistory = [];
    if (dampenLog.length > 0) {
      for (const d of dampenLog) {
        c.temporalDampenHistory.push({
          turn, year: this.realYear,
          variable: d.variable, attempted: d.attempted,
          allowed: d.allowed, maxRate: d.maxRate,
          processSpeed: d.processSpeed, isCrisis: d.isCrisis,
        });
      }
    }
    if (c.temporalDampenHistory.length > 100) {
      c.temporalDampenHistory = c.temporalDampenHistory.slice(-100);
    }

    if (!c.microFoundationsHistory) c.microFoundationsHistory = [];
    c.microFoundationsHistory.push({
      turn, year: this.realYear,
      regimePressure: c.regimeTransitionPressure ?? 0,
      eliteCohesion: c.eliteCohesion ?? 0,
      massGrievance: c.massGrievance ?? 0,
      collectiveAction: c.collectiveActionPotential ?? 0,
      rentSeeking: c.rentSeekingIntensity ?? 0,
      eliteSatisfaction: c.strataSatisfaction?.elite ?? 0,
      upperMiddleSatisfaction: c.strataSatisfaction?.upperMiddle ?? 0,
      lowerMiddleSatisfaction: c.strataSatisfaction?.lowerMiddle ?? 0,
      workingSatisfaction: c.strataSatisfaction?.working ?? 0,
      disenfranchisedSatisfaction: c.strataSatisfaction?.disenfranchised ?? 0,
    });
    if (c.microFoundationsHistory.length > 50) c.microFoundationsHistory.shift();
  }

  getCivData(civId) {
    return this.civData.get(civId) ?? null;
  }

  getDemographics(civId) {
    return this.civData.get(civId)?.demographic ?? null;
  }

  getMicroFoundations(civId) {
    return this.civData.get(civId)?.microFoundations ?? null;
  }

  getDiffusion(civId) {
    return this.civData.get(civId)?.diffusion ?? null;
  }

  getTemporalDampenLog() {
    return this.temporal.getDampenLog();
  }

  getTransitionHistory(civId) {
    return this.civData.get(civId)?.transitionHistory ?? [];
  }

  getCohortLabels() {
    return COMPANION_COHORT_LABELS;
  }

  getHistory(civId) {
    return (this.turnHistory || []).filter(e => e.civId === civId);
  }
}
