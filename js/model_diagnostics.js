/**
 * model_diagnostics.js — Automated defect detection for civ-sim
 *
 * Two tools, both built from defects actually found by hand:
 *
 *   scanStateVariables()  — finds variables that are stuck, dead, pinned,
 *                           or moving impossibly fast. Would have caught the
 *                           military-power bug (max exactly 60 in every run)
 *                           and the EROI discontinuity (3.3 -> 38.9 in one turn)
 *                           without anyone reading the code.
 *
 *   runInvariantSuite()   — every defect found this session, promoted to a
 *                           permanent regression check.
 *
 * Not loaded by index.html. Inject via fetch when testing.
 */

// ── Fields to scan. Nested paths use dots. ──────────────────
const DIAG_FIELDS = [
  'population','averageWellbeing','stabilityIndex','equalityIndex','socialTrust',
  'epistemicHealth','urbanizationRate','stateCapacity','institutionalQuality',
  'militaryPower','civilianControl','anomieLevel','genderEquity','foodSecurity',
  'technologyLevel','institutionalLockin','casteRigidity','legitimacyLevel',
  'socialMobility','infrastructureLevel','ethnicFractionalization','schismRisk',
  'culturalHomogeneity.value','energyEROI','energySurplus','energyPerCapita',
  'pollutionIndex','globalWarmingContribution','diseaseBurden','infantMortality',
  'lifeExpectancy','sanitationLevel','maintenanceDebt','tradeDependency',
  'participationDepth','wellbeingEnergyCeiling',
  'energySystem.distributedShare','energySystem.structuralBaseline',
  'energySystem.pathwayOffset','energySystem.ownershipBreadth',
  'agricultureSystem.localShare','agricultureSystem.landEquivalentRatio',
  'agricultureSystem.ecosystemFunction','agricultureSystem.chainLoss',
  'agricultureSystem.nutritionalQuality','agricultureSystem.coercionYieldFactor',
  'activeTravel.modeShare','activeTravel.structuralBaseline',
  'activeTravel.perceivedSafety','activeTravel.effectiveReach',
  'activeTravel.animalPowerShare','activeTravel.marginalShift',
];

// Plausible maximum single-turn change, as a fraction of the field's own
// observed range. A jump above this is a discontinuity worth explaining.
const DIAG_MAX_STEP_FRACTION = 0.45;

function _dget(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Run several seeded configurations and report variables that look wrong
 * by shape rather than by value.
 */
function scanStateVariables(opts) {
  opts = opts || {};
  const turns = opts.turns || 250;
  const seeds = opts.seeds || [1001, 2002, 3003];
  const configs = opts.configs || _diagDefaultConfigs();

  // field -> aggregated observations across every run
  const agg = {};
  for (const f of DIAG_FIELDS) {
    agg[f] = { series: [], allValues: [], maxStep: 0, maxStepCtx: null, nan: 0 };
  }

  for (const cfg of configs) {
    for (const seed of seeds) {
      const c = Object.assign({}, cfg.config, { researchSeed: seed });
      game.startGame(c);
      const s = game.civilizations[0].state;
      const local = {};
      for (const f of DIAG_FIELDS) local[f] = [];
      for (let t = 0; t < turns; t++) {
        game.nextTurn();
        for (const f of DIAG_FIELDS) {
          const v = _dget(s, f);
          if (v === undefined) continue;
          if (!Number.isFinite(v)) { agg[f].nan++; continue; }
          local[f].push(v);
        }
      }
      for (const f of DIAG_FIELDS) {
        const arr = local[f];
        if (!arr.length) continue;
        agg[f].series.push({ label: cfg.label, seed, arr });
        agg[f].allValues.push(...arr);
        for (let i = 1; i < arr.length; i++) {
          const step = Math.abs(arr[i] - arr[i - 1]);
          if (step > agg[f].maxStep) {
            agg[f].maxStep = step;
            agg[f].maxStepCtx = `${cfg.label}/seed${seed} turn${i}: ${arr[i-1].toFixed(2)} -> ${arr[i].toFixed(2)}`;
          }
        }
      }
    }
  }

  const findings = [];
  for (const f of DIAG_FIELDS) {
    const a = agg[f];
    if (!a.allValues.length) { findings.push({ field: f, issue: 'NO_DATA', severity: 'info' }); continue; }
    if (a.nan) findings.push({ field: f, issue: 'NON_FINITE', count: a.nan, severity: 'high' });

    const vals = a.allValues;
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min;

    // DEAD: never changes anywhere
    if (range === 0) {
      findings.push({ field: f, issue: 'DEAD', detail: `always ${min}`, severity: 'high' });
      continue;
    }

    // PINNED: one value dominates the distribution
    const counts = new Map();
    for (const v of vals) { const k = Math.round(v * 100) / 100; counts.set(k, (counts.get(k) || 0) + 1); }
    let modeVal = null, modeCount = 0;
    for (const [k, c] of counts) if (c > modeCount) { modeCount = c; modeVal = k; }
    const modeFrac = modeCount / vals.length;
    if (modeFrac > 0.55 && modeVal !== 0) {
      findings.push({ field: f, issue: 'PINNED',
        detail: `${(modeFrac*100).toFixed(0)}% of samples sit at exactly ${modeVal}`,
        severity: modeFrac > 0.8 ? 'high' : 'medium' });
    }

    // CEILING_SUSPECT: max identical across every run AND round
    const perRunMax = a.series.map(s => Math.max(...s.arr));
    const allSameMax = perRunMax.every(m => m === perRunMax[0]);
    if (allSameMax && a.series.length > 2 && perRunMax[0] % 5 === 0 && perRunMax[0] !== 100 && perRunMax[0] !== 0) {
      findings.push({ field: f, issue: 'IDENTICAL_MAX',
        detail: `max is exactly ${perRunMax[0]} in all ${a.series.length} runs`, severity: 'medium' });
    }

    // NEVER_MOVES_IN_A_RUN: static within runs but differs between them
    const staticRuns = a.series.filter(s => Math.max(...s.arr) === Math.min(...s.arr)).length;
    if (staticRuns > 0 && staticRuns === a.series.length) {
      findings.push({ field: f, issue: 'STATIC_WITHIN_RUNS',
        detail: `constant inside every run (${staticRuns} runs)`, severity: 'medium' });
    }

    // DISCONTINUITY: one-turn jump large relative to the field's own range
    if (range > 0 && a.maxStep / range > DIAG_MAX_STEP_FRACTION) {
      findings.push({ field: f, issue: 'DISCONTINUITY',
        detail: `single-turn step ${a.maxStep.toFixed(2)} vs range ${range.toFixed(2)} — ${a.maxStepCtx}`,
        severity: 'medium' });
    }

    // NEVER_EXCEEDS: field never gets above a low fraction of its clamp
    if (max <= 1 && f.indexOf('Ratio') === -1 && f.indexOf('ownershipBreadth') === -1
        && f.indexOf('coercionYieldFactor') === -1) {
      findings.push({ field: f, issue: 'NEVER_RISES', detail: `max ${max}`, severity: 'medium' });
    }
  }

  const bySeverity = { high: [], medium: [], info: [] };
  for (const f of findings) (bySeverity[f.severity] || bySeverity.info).push(f);
  return { scanned: DIAG_FIELDS.length, runs: configs.length * seeds.length, turns,
           findings, bySeverity,
           summary: { high: bySeverity.high.length, medium: bySeverity.medium.length } };
}

function _diagBase(label, over) {
  return { label, config: Object.assign({
    startYear: -3000, playerRole: 'founder', civName: label, civColor: '#3498db', aiCivCount: 2,
    economic: { model: 'market', scarcityOrientation: 50, accumulationAllowed: true },
    governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'universal' },
    operatingPrinciples: { freedomLevel: 70, collectivismLevel: 45, participationVoluntary: 70,
      outsiderRelationship: 'trading', coreValues: ['liberty'], innovationTolerance: 70 },
    religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'personal', tolerance: 'tolerant' },
    worldClimate: { warmth: 0, moisture: 0 }, geography: { oceanAccess: true, placement: 'coastal' },
    society: { educationAccess: 'universal_lower', educationQuality: 60, genderEquity: 60,
      debtModel: 'regulated_credit', tariffLevel: 30 },
  }, over || {}) };
}

function _diagDefaultConfigs() {
  return [
    _diagBase('democratic_trading'),
    _diagBase('militarist_autocracy', {
      governance: { model: 'autocratic', hierarchyLevel: 90, participationModel: 'restricted' },
      operatingPrinciples: { freedomLevel: 20, collectivismLevel: 60, participationVoluntary: 20,
        outsiderRelationship: 'aggressive', coreValues: ['military strength'], innovationTolerance: 40 },
    }),
    _diagBase('isolationist_commune', {
      economic: { model: 'gift', scarcityOrientation: 30, accumulationAllowed: false },
      governance: { model: 'flat_consensus', hierarchyLevel: 5, participationModel: 'universal' },
      operatingPrinciples: { freedomLevel: 80, collectivismLevel: 85, participationVoluntary: 90,
        outsiderRelationship: 'isolationist', coreValues: ['mutual aid'], innovationTolerance: 40 },
    }),
  ];
}

if (typeof window !== 'undefined') {
  window.scanStateVariables = scanStateVariables;
  window.DIAG_FIELDS = DIAG_FIELDS;
}

// ═══════════════════════════════════════════════════════════════
// Invariant suite — every defect found by hand, promoted to a
// permanent regression check. Each entry names the defect it guards.
// ═══════════════════════════════════════════════════════════════

function _invRun(cfgOver, turns, seed, perTurn) {
  const c = Object.assign({}, _diagBase('inv', cfgOver).config, { researchSeed: seed });
  game.startGame(c);
  const s = game.civilizations[0].state;
  for (let t = 0; t < turns; t++) { if (perTurn) perTurn(s, t); game.nextTurn(); }
  return s;
}
const _mean = a => a.reduce((x, y) => x + y, 0) / a.length;

const INVARIANTS = [
  { id: 'reproducible', guards: 'seeded RNG bypassed by map/NPC generation',
    run() { const sig = () => { const s = _invRun({}, 120, 31337);
        return `${s.population.toFixed(4)}|${s.averageWellbeing.toFixed(4)}|${s.militaryPower.toFixed(4)}`; };
      const a = sig(), b = sig(); return { pass: a === b, detail: a === b ? 'identical' : `${a} vs ${b}` }; } },

  { id: 'no_nan', guards: 'unguarded NaN in power-density blend',
    run() { let bad = [];
      for (const over of [{}, { governance: { model: 'autocratic', hierarchyLevel: 90, participationModel: 'restricted' } }]) {
        const s = _invRun(over, 200, 777, (st) => { st.pollutionIndex = 100; st.maintenanceDebt = 100; });
        for (const f of DIAG_FIELDS) { const v = _dget(s, f);
          if (v !== undefined && !Number.isFinite(v)) bad.push(f); } }
      return { pass: !bad.length, detail: bad.length ? bad.join(',') : 'all finite' }; } },

  { id: 'ler_cap', guards: 'LER extrapolated past the measured 2.0 ceiling',
    run() { const s = _invRun({}, 300, 1001, (st) => { st.agricultureSystem.diversificationIntensity = 100; });
      const v = s.agricultureSystem.landEquivalentRatio;
      return { pass: v <= 2.0 && v >= 1.0, detail: `LER ${v}` }; } },

  { id: 'coercion_reduces_gain', guards: 'coercion only hit morale, not output',
    run() { const g = _invRun({}, 120, 6161, (st) => { st.agricultureSystem.pathway = 'grassroots'; });
      const c = _invRun({}, 120, 6161, (st) => { st.agricultureSystem.pathway = 'decree_participation'; });
      const gv = g.agricultureSystem.coercionYieldFactor, cv = c.agricultureSystem.coercionYieldFactor;
      return { pass: cv < gv * 0.75, detail: `grassroots ${gv} vs compelled ${cv}` }; } },

  { id: 'coercion_no_institutional_rescue', guards: 'strong institutions wrongly rescuing compulsion',
    run() { const s = _invRun({}, 150, 6161, (st) => {
        st.agricultureSystem.pathway = 'decree_participation'; st.institutionalQuality = 95; st.stateCapacity = 95; });
      return { pass: s.agricultureSystem.coercionYieldFactor < 0.7,
        detail: `retained ${s.agricultureSystem.coercionYieldFactor} with IQ 95` }; } },

  { id: 'active_travel_baseline_is_floor', guards: 'baseline*0.35 floor gave 29% for a neolithic civ',
    run() { const s = _invRun({}, 60, 2024, (st) => { st.technologyLevel = 1; st.adoptedTechnologies = []; });
      const at = s.activeTravel;
      return { pass: at.modeShare >= at.structuralBaseline - 3,
        detail: `mode ${Math.round(at.modeShare)} vs baseline ${at.structuralBaseline}` }; } },

  { id: 'benefit_scales_with_motorization', guards: 'neolithic health benefit exceeded modern',
    run() { const P = Object.getPrototypeOf(game.simulation), orig = P._processActiveTravel;
      const meas = (tech, techs, infra, urban) => {
        const build = (st) => { st.technologyLevel = tech; st.adoptedTechnologies = techs.slice();
          st.infrastructureLevel = infra; st.urbanizationRate = urban;
          const a = st.activeTravel; a.networkCoverage = 80; a.networkContinuity = 80;
          a.transitIntegration = 80; a.jobsHousingBalance = 85;
          a.lightingLevel = 80; a.patrolIntensity = 80; a.amenityLevel = 80; };
        P._processActiveTravel = orig; const on = _invRun({}, 60, 2024, build).diseaseBurden;
        P._processActiveTravel = function () {}; const off = _invRun({}, 60, 2024, build).diseaseBurden;
        P._processActiveTravel = orig; return off - on; };
      const neo = meas(1, [], 15, 5), mod = meas(8, ['Oil / Petroleum'], 80, 75);
      return { pass: mod > neo, detail: `neolithic ${neo.toFixed(1)} vs modern ${mod.toFixed(1)}` }; } },

  { id: 'animal_power_net_negative_at_density', guards: 'dense animal power read as a wellbeing GAIN',
    // 7 seeds, not 5. At 5 seeds the wellbeing channel is noisy enough to
    // flip sign (+3.6 on one sample vs -1.6 on seven) — the same
    // under-powered-comparison error this suite exists to catch.
    // Asserts the robust channels too, not wellbeing alone.
    run() { const seeds = [101, 202, 303, 404, 505, 606, 707];
      const grab = (an, urb) => seeds.map(sd => _invRun({}, 60, sd, (st) => {
        st.technologyLevel = 8; st.adoptedTechnologies = ['Renewable Energy'];
        st.urbanizationRate = urb; st.activeTravel.animalPowerShare = an ? 60 : 0; }));
      const yes = grab(true, 70), no = grab(false, 70);
      const d = (f) => _mean(yes.map(x => f(x))) - _mean(no.map(x => f(x)));
      const wb = d(s => s.averageWellbeing), poll = d(s => s.pollutionIndex),
            dis = d(s => s.diseaseBurden), san = d(s => s.sanitationLevel ?? 0);
      const ok = wb < 0 && poll > 0 && dis > 0 && san < 0;
      return { pass: ok,
        detail: `wellbeing ${wb.toFixed(1)}, pollution +${poll.toFixed(1)}, disease +${dis.toFixed(1)}, sanitation ${san.toFixed(1)}` }; } },

  { id: 'no_energy_transition_discontinuity', guards: 'EROI snapped 3.3 -> 38.9 in one turn',
    run() { let maxStep = 0, prev = null;
      const c = Object.assign({}, _diagBase('t').config, { researchSeed: 1001 });
      game.startGame(c); const s = game.civilizations[0].state;
      for (let t = 0; t < 600; t++) { game.nextTurn();
        if (prev !== null) maxStep = Math.max(maxStep, Math.abs(s.energyEROI - prev)); prev = s.energyEROI; }
      return { pass: maxStep < 20, detail: `largest single-turn EROI step ${maxStep.toFixed(2)}` }; } },

  { id: 'no_baseline_discontinuity', guards: 'structuralBaseline dropped 88 -> 4 at industrialization',
    run() { let maxStep = 0, prev = null;
      const c = Object.assign({}, _diagBase('t').config, { researchSeed: 1001 });
      game.startGame(c); const s = game.civilizations[0].state;
      for (let t = 0; t < 600; t++) { game.nextTurn();
        const v = s.energySystem.structuralBaseline;
        if (prev !== null) maxStep = Math.max(maxStep, Math.abs(v - prev)); prev = v; }
      return { pass: maxStep < 25, detail: `largest single-turn baseline step ${maxStep}` }; } },

  { id: 'military_doctrine_monotonic', guards: 'military had no growth path; pinned at exactly 60',
    run() { const m = (out, vals, gov) => _invRun({
        governance: { model: gov, hierarchyLevel: 50, participationModel: 'universal' },
        operatingPrinciples: { freedomLevel: 60, collectivismLevel: 50, participationVoluntary: 60,
          outsiderRelationship: out, coreValues: vals, innovationTolerance: 60 } }, 120, 4242).militaryPower;
      const pac = m('welcoming', ['peace'], 'representative'),
            trd = m('trading', ['liberty'], 'representative'),
            mil = m('aggressive', ['military strength'], 'autocratic');
      return { pass: pac < trd && trd < mil,
        detail: `pacifist ${Math.round(pac)} < trading ${Math.round(trd)} < militarist ${Math.round(mil)}` }; } },

  { id: 'support_decays_without_pathway', guards: 'support bookkeeping unreachable behind an early return',
    run() { const s = _invRun({}, 40, 4242, (st) => {
        if (st.energySystem.enablingSupport === 0 && !st._seeded) { st.energySystem.enablingSupport = 80; st._seeded = 1; }
        st.maintenanceDebt = 0; st.infrastructureLevel = 90; });
      return { pass: s.energySystem.enablingSupport < 80,
        detail: `support ${Math.round(s.energySystem.enablingSupport)} after 40 turns` }; } },

  { id: 'energy_saved_stays_plausible', guards: 'pollution channel overstated by >1 order of magnitude',
    run() { const s = _invRun({}, 80, 4321, (st) => {
        st.technologyLevel = 8; st.adoptedTechnologies = ['Oil / Petroleum']; st.urbanizationRate = 80;
        const a = st.activeTravel; a.networkCoverage = 90; a.networkContinuity = 90;
        a.transitIntegration = 90; a.jobsHousingBalance = 90;
        a.lightingLevel = 90; a.patrolIntensity = 90; a.amenityLevel = 90; });
      const v = s.activeTravel.energySavedShare;
      return { pass: v >= 0 && v < 6, detail: `${v}% of total energy displaced` }; } },
];

function runInvariantSuite() {
  const results = [];
  for (const inv of INVARIANTS) {
    let r;
    try { r = inv.run(); } catch (e) { r = { pass: false, detail: 'THREW: ' + e.message }; }
    results.push({ id: inv.id, guards: inv.guards, pass: !!r.pass, detail: r.detail });
  }
  const passed = results.filter(r => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed,
           results, failures: results.filter(r => !r.pass) };
}

if (typeof window !== 'undefined') {
  window.runInvariantSuite = runInvariantSuite;
  window.INVARIANTS = INVARIANTS;
}

// ═══════════════════════════════════════════════════════════════
// Item 2 — Turn-order / effect-survival audit
//
// The recurring defect class: system A writes to a shared field, a
// later system recomputes that field from scratch, and A's
// contribution vanishes silently. It bit three times (participation,
// energy ceiling, nutritional health) and once INVERTED a result —
// compelled civilizations showed the highest wellbeing.
//
// A contribution ledger (systems return deltas, engine applies them)
// would prevent it, but refactoring 83 process methods is high-risk
// and — more importantly — would not FIND anything.
//
// This does. It stubs each _process* method in turn and measures what
// actually changes at end-of-turn. A system whose removal changes
// nothing is either inert or fully overwritten downstream. That is
// exactly the signature of the bug, and it generalizes to systems
// nobody has thought to check.
// ═══════════════════════════════════════════════════════════════

const AUDIT_WATCH = [
  'averageWellbeing','stabilityIndex','socialTrust','equalityIndex','population',
  'foodSecurity','diseaseBurden','anomieLevel','legitimacyLevel','stateCapacity',
  'institutionalQuality','pollutionIndex','militaryPower','urbanizationRate',
  'technologyLevel','energyEROI','energyPerCapita','epistemicHealth',
  'schismRisk','ethnicFractionalization','infantMortality','lifeExpectancy',
  'sanitationLevel','institutionalLockin','casteRigidity','socialMobility',
  'infrastructureLevel','maintenanceDebt','tradeDependency','genderEquity',
  'participationDepth','wellbeingEnergyCeiling','globalWarmingContribution',
  // Added after the first audit: these fields were written by systems the
  // audit then wrongly reported as inert.
  'ecologicalCapacity','overshootRatio','laborShare','consequenceDeficit',
  'biodiversityIndex','oceanHealth','collectiveTrauma','techUnemployment',
  'wasteAccumulation','financialDepth','debtLoad','minskyPhase',
  'culturalHomogeneity.value','wealthCapture.degree','empathyLevel',
  'corruptionLevel','cynicismLevel','educationQuality',
];

function _auditSnapshot(s) {
  const o = {};
  for (const f of AUDIT_WATCH) { const v = _dget(s, f); if (Number.isFinite(v)) o[f] = v; }
  o['energySystem.distributedShare'] = s.energySystem?.distributedShare ?? 0;
  o['agricultureSystem.localShare']  = s.agricultureSystem?.localShare ?? 0;
  o['agricultureSystem.landEquivalentRatio'] = s.agricultureSystem?.landEquivalentRatio ?? 0;
  o['activeTravel.modeShare']        = s.activeTravel?.modeShare ?? 0;
  o['economic.wealthConcentration']  = 0; // filled by caller
  return o;
}

function auditSystemEffects(opts) {
  opts = opts || {};
  const turns = opts.turns || 120;
  const seeds = opts.seeds || [1001, 2002];
  const proto = Object.getPrototypeOf(game.simulation);
  const methods = [];
  for (const n of Object.getOwnPropertyNames(proto)) {
    if (n.indexOf('_process') === 0 && typeof proto[n] === 'function') methods.push(n);
  }

  const runOnce = (stubName, seed) => {
    let orig = null;
    if (stubName) { orig = proto[stubName]; proto[stubName] = function () {}; }
    let snap = null, err = null;
    try {
      const cfg = Object.assign({}, _diagBase('audit').config, { researchSeed: seed });
      game.startGame(cfg);
      const s = game.civilizations[0].state;
      for (let t = 0; t < turns; t++) game.nextTurn();
      snap = _auditSnapshot(s);
      snap['economic.wealthConcentration'] = game.civilizations[0].economic?.wealthConcentration ?? 0;
    } catch (e) { err = e.message; }
    if (stubName) proto[stubName] = orig;
    return { snap, err };
  };

  // Baseline per seed
  const base = {};
  for (const seed of seeds) base[seed] = runOnce(null, seed).snap;

  const results = [];
  for (const m of methods) {
    let totalDelta = 0, fieldsChanged = new Set(), threw = null;
    const perField = {};
    for (const seed of seeds) {
      const r = runOnce(m, seed);
      if (r.err) { threw = r.err; continue; }
      if (!r.snap || !base[seed]) continue;
      for (const f of Object.keys(base[seed])) {
        const a = base[seed][f], b = r.snap[f];
        if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
        const d = Math.abs(b - a);
        if (d > 0.01) { fieldsChanged.add(f); perField[f] = Math.max(perField[f] || 0, d); }
        totalDelta += d;
      }
    }
    const top = Object.entries(perField).sort((x, y) => y[1] - x[1]).slice(0, 4)
      .map(([f, d]) => `${f}:${d.toFixed(1)}`);
    results.push({ system: m, fieldsChanged: fieldsChanged.size,
      totalDelta: +(totalDelta / seeds.length).toFixed(2), top, threw });
  }

  results.sort((a, b) => a.totalDelta - b.totalDelta);
  const inert = results.filter(r => r.fieldsChanged === 0 && !r.threw);
  return { turns, seeds, systemsAudited: methods.length,
    inertOrOverwritten: inert.map(r => r.system),
    threw: results.filter(r => r.threw).map(r => `${r.system}: ${r.threw}`),
    ranked: results };
}

if (typeof window !== 'undefined') window.auditSystemEffects = auditSystemEffects;

// ═══════════════════════════════════════════════════════════════
// Item 6 — One-at-a-time sensitivity analysis
//
// Perturbs each Pass 10/11 constant and measures the effect on
// outcomes. Answers three questions at once:
//   which coefficients actually drive results (spend evidence effort there),
//   which are inert (candidates for deletion — a simpler model is better),
//   whether any outcome is unstable to a small parameter change (a red flag).
// ═══════════════════════════════════════════════════════════════

const SENS_OUTCOMES = ['averageWellbeing','foodSecurity','stabilityIndex','population',
  'diseaseBurden','pollutionIndex','energyPerCapita'];

function _sensGetTargets() {
  const t = [];
  const add = (objName, obj, keys) => {
    for (const k of keys) if (typeof obj[k] === 'number') t.push({ objName, obj, key: k, base: obj[k] });
  };
  add('ACTIVE_TRAVEL', ACTIVE_TRAVEL, ['continuityWeight','coverageWeight','transitReachMultiplier',
    'polycentricNonMotorizedCeiling','jobsHousingGateFloor','maxDiseaseBurdenReduction',
    'maxLifeExpectancyGain','addressableEnergyShare',
    'airPollutionWeight','noiseWeight','lightingCrimeReduction','patrolWeight','lightingWeight',
    'amenityWeight','femaleSafetyElasticity','maleSafetyElasticity','localEconomyMax']);
  add('ANIMAL_TRANSPORT', ANIMAL_TRANSPORT, ['viableUrbanizationCeiling','sanitationPenaltyMax',
    'landCompetitionMax','freightBenefitMax']);
  add('ENABLING_SUPPORT', ENABLING_SUPPORT, ['adoptionElasticity','maxAdoptionBoost','knowledgeBoost',
    'eliteCaptureWeight','fiscalDrain','decayRate']);
  add('DISTRIBUTION', DISTRIBUTION, ['baseChainLoss','perishableChainLoss','cosmeticRejectionMax',
    'cosmeticRecoveryFraction','maturityQualityGap','distributionEnergyShare','coldChainShare',
    'urbanizationPenalty']);
  add('ECOSYSTEM_FUNCTION', ECOSYSTEM_FUNCTION, ['maxYieldGain','lowInputWeight','baseWeight','knowledgeDecay']);
  add('COERCION_PRODUCTIVITY', COERCION_PRODUCTIVITY, ['maxPenalty','exponent']);
  add('PARTICIPATION_EFFECTS', PARTICIPATION_EFFECTS, ['wellbeingCap','anomieCap','trustCap',
    'legitimacyCap','coercionExponent','coercionNegativeThreshold','energyWeight','agricultureWeight']);
  add('DIFFUSION_LIMITS', DIFFUSION_LIMITS, ['baseline','crisis','burst']);
  add('ENERGY_WELLBEING', ENERGY_WELLBEING, ['floor','span','scale']);
  return t;
}

function runSensitivity(opts) {
  opts = opts || {};
  const turns = opts.turns || 200;
  const seeds = opts.seeds || [1001, 2002];
  const pct = opts.pct || 0.25;

  // Exercise the systems being measured, otherwise every coefficient reads inert.
  // `stress: true` additionally drives the conditions schism needs, so a
  // compensation test against the schism subsystem is not vacuous.
  const stress = !!opts.stress;
  const drive = (st) => {
    if (stress) {
      st.institutionalLockin = Math.max(st.institutionalLockin ?? 0, 60);
      st.educationQuality = 60; st.tradeDependency = 50;
      st.legitimacyLevel = Math.min(st.legitimacyLevel ?? 50, 35);
    }
    st.technologyLevel = 8; st.adoptedTechnologies = ['Oil / Petroleum'];
    st.urbanizationRate = 70; st.infrastructureLevel = 70;
    const a = st.activeTravel;
    a.networkCoverage = 70; a.networkContinuity = 70; a.transitIntegration = 70;
    a.jobsHousingBalance = 70; a.lightingLevel = 70; a.patrolIntensity = 70;
    a.amenityLevel = 70; a.animalPowerShare = 30; a.enablingSupport = 60;
    st.agricultureSystem.pathway = 'incentive';
    st.agricultureSystem.diversificationIntensity = 60;
    st.agricultureSystem.enablingSupport = 60;
    st.energySystem.pathway = 'incentive';
    st.energySystem.enablingSupport = 60;
  };

  const measure = () => {
    const acc = {};
    for (const seed of seeds) {
      const baseCfg = stress ? _diagBase('sens', {
        operatingPrinciples: { freedomLevel: 25, collectivismLevel: 60, participationVoluntary: 25,
          outsiderRelationship: 'trading', coreValues: ['order'], innovationTolerance: 40 },
        governance: { model: 'autocratic', hierarchyLevel: 85, participationModel: 'restricted' },
        religion: { presence: 'dominant', stateRelationship: 'state_religion',
          propagation: 'communal', tolerance: 'restrictive' } }).config
      : _diagBase('sens').config;
      const cfg = Object.assign({}, baseCfg, { researchSeed: seed });
      game.startGame(cfg);
      const s = game.civilizations[0].state;
      for (let t = 0; t < turns; t++) { drive(s); game.nextTurn(); }
      for (const f of SENS_OUTCOMES) acc[f] = (acc[f] || 0) + (Number.isFinite(s[f]) ? s[f] : 0);
    }
    for (const f of SENS_OUTCOMES) acc[f] /= seeds.length;
    return acc;
  };

  const base = measure();
  const targets = _sensGetTargets();
  const rows = [];
  for (const t of targets) {
    const orig = t.obj[t.key];
    t.obj[t.key] = orig * (1 + pct);
    const hi = measure();
    t.obj[t.key] = orig * (1 - pct);
    const lo = measure();
    t.obj[t.key] = orig;
    let sens = 0; const per = {};
    for (const f of SENS_OUTCOMES) {
      const denom = Math.abs(base[f]) > 1e-6 ? Math.abs(base[f]) : 1;
      const d = Math.abs(hi[f] - lo[f]) / denom;   // normalised swing
      per[f] = +(d * 100).toFixed(2);
      sens += d;
    }
    rows.push({ param: `${t.objName}.${t.key}`, base: orig,
      sensitivity: +(sens * 100).toFixed(2), per });
  }
  rows.sort((a, b) => b.sensitivity - a.sensitivity);
  return { turns, seeds, pct, baseline: base, ranked: rows,
    inert: rows.filter(r => r.sensitivity < 0.5).map(r => r.param),
    dominant: rows.slice(0, 10).map(r => `${r.sensitivity}  ${r.param}`) };
}

if (typeof window !== 'undefined') window.runSensitivity = runSensitivity;

// ═══════════════════════════════════════════════════════════════
// Per-field write attribution
//
// Proxies a state object and records every write to a chosen field
// with its call site, then ranks call sites by net contribution.
// Answers "what is actually moving this number, and in which
// direction" without reading ten call sites by hand.
// ═══════════════════════════════════════════════════════════════

function traceFieldWrites(opts) {
  opts = opts || {};
  const field = opts.field || 'wealthConcentration';
  const on = opts.on || 'economic';           // 'economic' | 'state'
  const turns = opts.turns || 250;
  const seed = opts.seed || 1001;
  const cfgOver = opts.config || {};

  const cfg = Object.assign({}, _diagBase('trace', cfgOver).config, { researchSeed: seed });
  game.startGame(cfg);
  const civ = game.civilizations[0];

  const sites = new Map();   // callsite -> {up, down, netTotal, writes}
  const target = civ[on];
  const proxy = new Proxy(target, {
    set(obj, prop, value) {
      if (prop === field && Number.isFinite(value) && Number.isFinite(obj[prop])) {
        const delta = value - obj[prop];
        if (Math.abs(delta) > 1e-9) {
          const stack = (new Error()).stack.split('\n');
          // first frame outside this proxy handler
          let site = 'unknown';
          for (let i = 2; i < stack.length; i++) {
            const ln = stack[i].trim();
            if (ln.indexOf('model_diagnostics') === -1) { site = ln.replace(/^at\s+/, ''); break; }
          }
          site = site.replace(/https?:\/\/[^\/]+\//, '').replace(/\?[^:]*/, '');
          const rec = sites.get(site) || { up: 0, down: 0, net: 0, writes: 0 };
          if (delta > 0) rec.up += delta; else rec.down += delta;
          rec.net += delta; rec.writes++;
          sites.set(site, rec);
        }
      }
      obj[prop] = value;
      return true;
    }
  });
  civ[on] = proxy;

  const start = target[field];
  for (let t = 0; t < turns; t++) game.nextTurn();
  const end = target[field];
  civ[on] = target;

  const ranked = [...sites.entries()]
    .map(([site, r]) => ({ site, writes: r.writes,
      up: +r.up.toFixed(2), down: +r.down.toFixed(2), net: +r.net.toFixed(2) }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  return { field, turns, seed,
    start: +start.toFixed(2), end: +end.toFixed(2), netChange: +(end - start).toFixed(2),
    ranked };
}

if (typeof window !== 'undefined') window.traceFieldWrites = traceFieldWrites;

// ═══════════════════════════════════════════════════════════════
// Interaction detection (second-order sensitivity)
//
// One-at-a-time sensitivity structurally cannot see interactions: a
// parameter inert alone may matter jointly, and two parameters may
// cancel or amplify each other. This perturbs PAIRS and compares the
// joint effect against the sum of individual effects. A large residual
// is an interaction.
//
// This is the practical core of what Sobol second-order indices give,
// at a fraction of the sample cost.
// ═══════════════════════════════════════════════════════════════

function runInteractions(opts) {
  opts = opts || {};
  const turns = opts.turns || 100;
  const seed = opts.seed || 1001;
  const pct = opts.pct || 0.25;
  const topN = opts.topN || 8;

  const drive = (st) => {
    st.technologyLevel = 8; st.adoptedTechnologies = ['Oil / Petroleum'];
    st.urbanizationRate = 70; st.infrastructureLevel = 70;
    const a = st.activeTravel;
    a.networkCoverage = 70; a.networkContinuity = 70; a.transitIntegration = 70;
    a.jobsHousingBalance = 70; a.lightingLevel = 70; a.patrolIntensity = 70;
    a.amenityLevel = 70; a.animalPowerShare = 30; a.enablingSupport = 60;
    st.agricultureSystem.pathway = 'incentive';
    st.agricultureSystem.diversificationIntensity = 60;
    st.agricultureSystem.enablingSupport = 60;
    st.energySystem.pathway = 'incentive'; st.energySystem.enablingSupport = 60;
  };
  const OUT = ['averageWellbeing', 'foodSecurity', 'stabilityIndex', 'population'];
  const measure = () => {
    const cfg = Object.assign({}, _diagBase('int').config, { researchSeed: seed });
    game.startGame(cfg);
    const s = game.civilizations[0].state;
    for (let t = 0; t < turns; t++) { drive(s); game.nextTurn(); }
    const o = {}; for (const f of OUT) o[f] = Number.isFinite(s[f]) ? s[f] : 0;
    return o;
  };
  const dist = (a, b) => {
    let d = 0;
    for (const f of OUT) { const den = Math.abs(a[f]) > 1e-6 ? Math.abs(a[f]) : 1;
      d += Math.abs(b[f] - a[f]) / den; }
    return d;
  };

  const targets = _sensGetTargets();
  const base = measure();

  // rank individually first
  const single = [];
  for (const t of targets) {
    const o = t.obj[t.key];
    t.obj[t.key] = o * (1 + pct);
    const eff = dist(base, measure());
    t.obj[t.key] = o;
    single.push({ t, eff });
  }
  single.sort((a, b) => b.eff - a.eff);
  const top = single.slice(0, topN);

  const pairs = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const A = top[i], B = top[j];
      const oa = A.t.obj[A.t.key], ob = B.t.obj[B.t.key];
      A.t.obj[A.t.key] = oa * (1 + pct);
      B.t.obj[B.t.key] = ob * (1 + pct);
      const joint = dist(base, measure());
      A.t.obj[A.t.key] = oa; B.t.obj[B.t.key] = ob;
      const additive = A.eff + B.eff;
      const residual = joint - additive;
      pairs.push({
        pair: `${A.t.objName}.${A.t.key} x ${B.t.objName}.${B.t.key}`,
        individualSum: +additive.toFixed(3), joint: +joint.toFixed(3),
        interaction: +residual.toFixed(3),
        relative: additive > 1e-6 ? +(residual / additive).toFixed(2) : 0
      });
    }
  }
  pairs.sort((a, b) => Math.abs(b.interaction) - Math.abs(a.interaction));
  return { turns, seed, pct, topSingles: top.map(x => `${x.eff.toFixed(3)} ${x.t.objName}.${x.t.key}`),
    pairs, strongInteractions: pairs.filter(p => Math.abs(p.relative) > 0.15) };
}

if (typeof window !== 'undefined') window.runInteractions = runInteractions;
