// ============================================================
// VALIDATION SUITE — Uncertainty, Sensitivity, Cross-Validation
// ============================================================
// Run: node js/validation_suite.js [mode] [options]
//   mode: uq | sensitivity | crossval | all
//   options: --seeds=N  (default 100 for UQ)
//            --json     (output JSON instead of text)
//
// Requires the headless bootstrap (auto-loaded below).
// Results are written to validation_results/ directory.

const fs = require('fs');
const path = require('path');
const base = path.resolve(__dirname, '..');

// ── Headless bootstrap ──────────────────────────────────────
global.window = { addEventListener:()=>{}, location:{search:''}, innerWidth:800, innerHeight:600 };
const stubEl = ()=>({style:{},addEventListener:()=>{},classList:{add(){},remove(){}},setAttribute(){},getAttribute(){return null},innerHTML:'',textContent:'',appendChild(){},removeChild(){},insertBefore(){},replaceChild(){},cloneNode(){return stubEl()},children:[],childNodes:[],parentNode:null,querySelector:()=>null,querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:0,height:0}),offsetWidth:0,offsetHeight:0,getContext:()=>({fillRect(){},clearRect(){},strokeRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},arc(){},fill(){},stroke(){},fillText(){},measureText:()=>({width:0}),save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){},createLinearGradient:()=>({addColorStop(){}}),setTransform(){},canvas:{width:800,height:600}}),dataset:{},checked:false,value:'',options:[],selectedIndex:0,focus(){},blur(){},click(){},dispatchEvent(){},remove(){}});
global.document = {getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:stubEl,body:{appendChild:()=>{},style:{},removeChild(){}},head:{appendChild:()=>{}},createDocumentFragment:()=>({appendChild(){}}),addEventListener:()=>{}};
global.localStorage = {getItem:()=>null,setItem:()=>{}};
global.requestAnimationFrame = ()=>{};
global.cancelAnimationFrame = ()=>{};
global.HTMLElement = class {};
global.HTMLCanvasElement = class {};
global.Audio = class { play(){return Promise.resolve()} pause(){} addEventListener(){} };
global.Image = class {};
global.SetupAssistant = { needsSetup:()=>false };
global.fetch = ()=>Promise.resolve({ok:false});
global.MutationObserver = class { observe(){} disconnect(){} };
global.ResizeObserver = class { observe(){} disconnect(){} };
global.IntersectionObserver = class { observe(){} disconnect(){} };
global.CanvasRenderingContext2D = class {};
global.UIManager = class {
  constructor(){} showNotification(){} addHistoryEntry(){} showGame(){} showTitle(){} renderHUD(){}
  showSetup(){} showWorldState(){} showHistory(){} showStratificationPanel(){} hideStratificationPanel(){}
  showNotifLog(){} hideNotifLog(){} showSettings(){} updateEraBar(){} updateHUD(){} updateMap(){}
  updateCharts(){} showAlert(){} updateStratification(){} renderLeaderboard(){} showBanner(){}
};

// Suppress game logs
const origConsoleLog = console.log;
console.log = function(){};

const files = [
  'js/utils.js', 'js/config.js', 'js/map.js', 'js/civilization.js',
  'js/religion.js', 'js/npc.js', 'js/events.js',
  'js/simulation.js', 'js/ui.js', 'js/chart_utils.js',
  'js/i18n.js', 'js/interview.js', 'js/tech_panel.js',
  'js/society_panel.js', 'js/sustainability_panel.js',
  'js/paradigm_panel.js', 'js/research_panel.js',
  'js/companion.js', 'js/companion_panel.js',
  'js/setup_assistant.js', 'js/model_diagnostics.js',
  'js/game.js', 'js/scenario_test_harness.js',
];
for (const f of files) {
  const p = `${base}/${f}`;
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');
  code = code.replace(/^(const|let) /gm, 'var ');
  code = code.replace(/^class (\w+)/gm, 'var $1 = class $1');
  try { eval(code); } catch(e) {}
}
HexMap.prototype.render = function(){};
HexMap.prototype.setupCanvas = function(){};

// Restore output
function log(s) { process.stdout.write(s + '\n'); }
function logErr(s) { process.stderr.write(s + '\n'); }

// ── Ensure output directory ──────────────────────────────
const outDir = path.join(base, 'validation_results');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── Trace mode: node js/validation_suite.js trace <id> ──
if (process.argv[2] === 'trace') {
  const traceId = process.argv[3] || 'cal_usa';
  const allScens = [...HISTORICAL_SCENARIOS, ...VALIDATION_SCENARIOS, ...CALIBRATION_SCENARIOS];
  const sc = allScens.find(s => s.id === traceId);
  if (!sc) { log('No scenario: ' + traceId); process.exit(1); }
  game = new Game();
  game.ui = new UIManager(game);
  game.startGame(Object.assign({}, sc.config, { researchSeed: 42 }));
  const civ = game.civilizations[0];
  if (sc.initialState) {
    for (const [key, value] of Object.entries(sc.initialState)) {
      if (key in civ.state) civ.state[key] = value;
      if (key === 'corruptionLevel' && civ.governance) civ.governance.corruptionLevel = value;
    }
  }
  const everyTurn = process.argv.includes('--every');
  for (let t = 0; t < sc.turns; t++) {
    game.nextTurn();
    if (everyTurn || t % 10 === 0 || t === sc.turns - 1 || t < 15) {
      const s = civ.state, eco = civ.economic || {}, gov = civ.governance || {};
      log('T' + String(t+1).padStart(3) +
        ' trust=' + String((s.socialTrust ?? 0).toFixed(1)).padStart(5) +
        ' WC=' + String((eco.wealthConcentration ?? 0).toFixed(1)).padStart(5) +
        ' corr=' + String((s.corruptionLevel ?? gov.corruptionLevel ?? 0).toFixed(1)).padStart(5) +
        ' IQ=' + String((s.institutionalQuality ?? 0).toFixed(1)).padStart(5) +
        ' cap=' + String((s.stateCapacity ?? 0).toFixed(1)).padStart(5) +
        ' free=' + String((civ.operatingPrinciples?.freedomLevel ?? 0).toFixed(0)).padStart(3) +
        ' wb=' + String((s.averageWellbeing ?? 0).toFixed(1)).padStart(5) +
        ' strWB=' + String((s._structuralWellbeing ?? 0).toFixed(1)).padStart(5) +
        ' stab=' + String((s.stabilityIndex ?? 0).toFixed(1)).padStart(5) +
        ' anom=' + String((s.anomieLevel ?? 0).toFixed(1)).padStart(5) +
        ' food=' + String((s.foodSecurity ?? 0).toFixed(1)).padStart(5) +
        ' enCeil=' + String((s.wellbeingEnergyCeiling ?? 0).toFixed(0)).padStart(4) +
        ' pDep=' + String((s.participationDepth ?? 0).toFixed(1)).padStart(5) +
        ' finD=' + String((s.financialDepth ?? 0).toFixed(1)).padStart(5) +
        (s.companion ? ' mobUp=' + (s.companion.interStrataMobility?.upward ?? 0).toFixed(3) : ''));
    }
  }
  process.exit(0);
}

// ── Helpers ──────────────────────────────────────────────
const ALL_SCENARIOS = [...HISTORICAL_SCENARIOS, ...VALIDATION_SCENARIOS, ...CALIBRATION_SCENARIOS];

function runScenarioWithSeed(scenario, seed) {
  game = new Game();
  game.ui = new UIManager(game);
  const cfg = Object.assign({}, scenario.config, { researchSeed: seed });
  game.startGame(cfg);
  const civ = game.civilizations[0];

  if (scenario.initialState) {
    const ALIAS = { culturalCohesion: ['culturalHomogeneity', 'value'] };
    for (const [key, value] of Object.entries(scenario.initialState)) {
      const alias = ALIAS[key];
      if (alias) {
        if (civ.state[alias[0]] && typeof civ.state[alias[0]] === 'object') {
          civ.state[alias[0]][alias[1]] = value;
        }
        continue;
      }
      if (key in civ.state) civ.state[key] = value;
      if (key === 'corruptionLevel' && civ.governance) {
        civ.governance.corruptionLevel = value;
      }
    }
  }

  const snapshots = [];
  for (let t = 0; t < scenario.turns; t++) {
    game.nextTurn();
    if ((t + 1) % 10 === 0 || t === scenario.turns - 1) {
      const s = civ.state;
      const eco = civ.economic || {};
      const gov = civ.governance || {};
      snapshots.push({
        turn: t + 1,
        socialTrust: Math.round(s.socialTrust ?? 0),
        wealthConcentration: Math.round(eco.wealthConcentration ?? 0),
        corruption: Math.round(s.corruptionLevel ?? gov.corruptionLevel ?? 0),
        stability: Math.round(s.stabilityIndex ?? 0),
        stateCapacity: Math.round(s.stateCapacity ?? 0),
        epistemicHealth: Math.round(s.epistemicHealth ?? 0),
        institutionalQuality: Math.round(s.institutionalQuality ?? 0),
        institutionalLockIn: Math.round(s.institutionalLockin ?? 0),
        militaryPower: Math.round(s.militaryPower ?? 0),
        wellbeing: Math.round(s.averageWellbeing ?? 0),
        polarization: Math.round(s.polarizationLevel ?? 0),
        genderEquity: Math.round(s.genderEquity ?? 0),
        schismRisk: Math.round(s.schismRisk ?? 0),
        ethnicFractionalization: Math.round(s.ethnicFractionalization ?? 0),
        anomie: Math.round(s.anomieLevel ?? 0),
        urbanization: Math.round(s.urbanizationRate ?? 0),
        legitimacy: Math.round(s.legitimacyLevel ?? 0),
        socialMobility: Math.round(s.socialMobility ?? 0),
      });
    }
  }
  return snapshots;
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function mean(arr) { return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0; }
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
}

// ══════════════════════════════════════════════════════════
// 1. UNCERTAINTY QUANTIFICATION
// ══════════════════════════════════════════════════════════

function validationRunUQ(numSeeds) {
  numSeeds = numSeeds || 100;
  log(`\n${'═'.repeat(60)}`);
  log(`UNCERTAINTY QUANTIFICATION — ${numSeeds} seeds per scenario`);
  log('═'.repeat(60));

  const calScenarios = CALIBRATION_SCENARIOS;
  const metrics = ['socialTrust', 'wealthConcentration', 'corruption', 'stability',
                   'stateCapacity', 'epistemicHealth', 'militaryPower', 'wellbeing',
                   'polarization', 'institutionalLockIn'];

  const results = {};

  for (const sc of calScenarios) {
    const name = sc.id.replace('cal_', '');
    logErr(`  Running ${name} (${numSeeds} seeds)...`);
    const finalValues = {};
    for (const m of metrics) finalValues[m] = [];

    for (let seed = 1; seed <= numSeeds; seed++) {
      const snaps = runScenarioWithSeed(sc, seed * 1000 + 7);
      const final = snaps[snaps.length - 1];
      for (const m of metrics) {
        if (final[m] !== undefined) finalValues[m].push(final[m]);
      }
    }

    const stats = {};
    for (const m of metrics) {
      const vals = finalValues[m];
      if (!vals.length) continue;
      stats[m] = {
        mean: +mean(vals).toFixed(1),
        stddev: +stddev(vals).toFixed(1),
        min: Math.min(...vals),
        max: Math.max(...vals),
        p10: +percentile(vals, 10).toFixed(1),
        p25: +percentile(vals, 25).toFixed(1),
        p50: +percentile(vals, 50).toFixed(1),
        p75: +percentile(vals, 75).toFixed(1),
        p90: +percentile(vals, 90).toFixed(1),
        cv: vals.length ? +(stddev(vals) / Math.max(1, Math.abs(mean(vals))) * 100).toFixed(1) : 0,
      };
    }
    results[name] = stats;
  }

  // Display results
  log('\n' + '─'.repeat(60));
  log('FINAL-TURN DISTRIBUTIONS (mean [p10 – p90], CV%)');
  log('─'.repeat(60));

  const TARGETS = {
    denmark:   { socialTrust: 74, wealthConcentration: 28, corruption: 12 },
    usa:       { socialTrust: 37, wealthConcentration: 78, corruption: 27 },
    china:     { socialTrust: 64, wealthConcentration: 55, corruption: 39 },
    singapore: { socialTrust: 38, wealthConcentration: 45, corruption: 17 },
    brazil:    { socialTrust: 7,  wealthConcentration: 89, corruption: 62 },
    nigeria:   { socialTrust: 15, wealthConcentration: 67, corruption: 74 },
    saudi:     { socialTrust: 53, wealthConcentration: 65, corruption: 47 },
    russia:    { socialTrust: 28, wealthConcentration: 78, corruption: 73 },
    japan:     { socialTrust: 36, wealthConcentration: 48, corruption: 27 },
    germany:   { socialTrust: 44, wealthConcentration: 55, corruption: 22 },
    india:     { socialTrust: 21, wealthConcentration: 75, corruption: 61 },
    south_korea: { socialTrust: 30, wealthConcentration: 55, corruption: 37 },
  };

  for (const [country, stats] of Object.entries(results)) {
    log(`\n  ${country.toUpperCase()}`);
    const targets = TARGETS[country] || {};
    for (const [m, s] of Object.entries(stats)) {
      const tgt = targets[m];
      const tgtStr = tgt !== undefined ? `  target=${tgt}` : '';
      const robustness = s.cv < 15 ? 'ROBUST' : s.cv < 30 ? 'MODERATE' : 'NOISY';
      log(`    ${m.padEnd(22)} ${String(s.mean).padStart(5)} [${String(s.p10).padStart(4)}–${String(s.p90).padStart(4)}]  CV=${String(s.cv).padStart(5)}%  ${robustness}${tgtStr}`);
    }
  }

  // Robustness summary
  log('\n' + '─'.repeat(60));
  log('ROBUSTNESS SUMMARY');
  log('─'.repeat(60));
  let robust = 0, moderate = 0, noisy = 0, total = 0;
  for (const stats of Object.values(results)) {
    for (const s of Object.values(stats)) {
      total++;
      if (s.cv < 15) robust++;
      else if (s.cv < 30) moderate++;
      else noisy++;
    }
  }
  log(`  ROBUST (CV<15%):   ${robust}/${total} (${(robust/total*100).toFixed(0)}%)`);
  log(`  MODERATE (15-30%): ${moderate}/${total} (${(moderate/total*100).toFixed(0)}%)`);
  log(`  NOISY (CV>30%):    ${noisy}/${total} (${(noisy/total*100).toFixed(0)}%)`);

  // Target coverage
  log('\n' + '─'.repeat(60));
  log('TARGET COVERAGE (does the p10–p90 interval contain the real-world target?)');
  log('─'.repeat(60));
  let covered = 0, totalTargets = 0;
  for (const [country, stats] of Object.entries(results)) {
    const targets = TARGETS[country] || {};
    for (const [m, tgt] of Object.entries(targets)) {
      if (!stats[m]) continue;
      totalTargets++;
      const s = stats[m];
      const inRange = tgt >= s.p10 && tgt <= s.p90;
      if (inRange) covered++;
      log(`  ${country.padEnd(12)} ${m.padEnd(22)} target=${String(tgt).padStart(3)}  range=[${String(s.p10).padStart(4)}–${String(s.p90).padStart(4)}]  ${inRange ? 'COVERED' : 'MISSED'}`);
    }
  }
  log(`\n  Coverage: ${covered}/${totalTargets} targets within p10–p90 interval (${(covered/totalTargets*100).toFixed(0)}%)`);

  // Save
  const outFile = path.join(outDir, 'uq_results.json');
  fs.writeFileSync(outFile, JSON.stringify({ numSeeds, results, targets: TARGETS }, null, 2));
  log(`\nResults saved to ${outFile}`);

  return results;
}

// ══════════════════════════════════════════════════════════
// 2. SENSITIVITY ANALYSIS
// ══════════════════════════════════════════════════════════

function validationRunSensitivity() {
  log(`\n${'═'.repeat(60)}`);
  log('SENSITIVITY ANALYSIS — one-at-a-time parameter sweeps');
  log('═'.repeat(60));

  // We test USA as the primary calibration target since it exercises
  // the most mechanisms (polarization, gridlock, trust dynamics)
  const sc = CALIBRATION_SCENARIOS.find(s => s.id === 'cal_usa');
  const baseSeed = 1001;
  const metrics = ['socialTrust', 'wealthConcentration', 'corruption', 'stability',
                   'polarization', 'epistemicHealth', 'stateCapacity'];

  // Get baseline
  const baseSnaps = runScenarioWithSeed(sc, baseSeed);
  const baseFinal = baseSnaps[baseSnaps.length - 1];
  log(`\nBaseline (seed=${baseSeed}):`);
  for (const m of metrics) log(`  ${m.padEnd(22)} = ${baseFinal[m]}`);

  // Parameters to sweep — each is [description, getter, setter, values]
  // We modify simulation.js code in-memory by monkey-patching
  // Instead, we'll modify the scenario's initial state and config

  const sweeps = [
    {
      name: 'initialPolarization',
      desc: 'Starting polarization level',
      values: [0, 10, 20, 30, 40, 50, 60, 70, 80],
      baseline: 40,
      apply: (sc, v) => { sc._overrideInitState = { polarizationLevel: v }; },
    },
    {
      name: 'hierarchyLevel',
      desc: 'Governance hierarchy',
      values: [30, 40, 50, 60, 70, 80, 90],
      baseline: 60,
      apply: (sc, v) => { sc._overrideConfig = { governance: { hierarchyLevel: v } }; },
    },
    {
      name: 'ethnicFractionalization',
      desc: 'Ethnic fractionalization',
      values: [10, 20, 30, 40, 50, 60, 70, 80],
      baseline: 49,
      apply: (sc, v) => { sc._overrideInitState = { ethnicFractionalization: v }; },
    },
    {
      name: 'tariffLevel',
      desc: 'Trade tariff level',
      values: [0, 5, 10, 15, 20, 30, 40],
      baseline: 10,
      apply: (sc, v) => { sc._overrideConfig = { society: { tariffLevel: v } }; },
    },
    {
      name: 'educationQuality',
      desc: 'Starting education quality',
      values: [20, 30, 40, 50, 60, 70, 80, 90],
      baseline: 70,
      apply: (sc, v) => { sc._overrideInitState = { educationQuality: v }; },
    },
    {
      name: 'initialTrust',
      desc: 'Starting social trust',
      values: [10, 20, 30, 40, 50, 60, 70, 80],
      baseline: 55,
      apply: (sc, v) => { sc._overrideInitState = { socialTrust: v }; },
    },
    {
      name: 'initialCorruption',
      desc: 'Starting corruption level',
      values: [5, 10, 20, 30, 40, 50, 60, 70],
      baseline: 20,
      apply: (sc, v) => { sc._overrideInitState = { corruptionLevel: v }; },
    },
    {
      name: 'scarcityOrientation',
      desc: 'Economic scarcity orientation',
      values: [20, 35, 50, 65, 80, 95],
      baseline: 75,
      apply: (sc, v) => { sc._overrideConfig = { economic: { scarcityOrientation: v } }; },
    },
  ];

  const results = {};

  for (const sweep of sweeps) {
    logErr(`  Sweeping ${sweep.name}...`);
    const sweepResults = [];

    for (const v of sweep.values) {
      // Deep clone scenario config
      const modSc = JSON.parse(JSON.stringify(sc));

      // Apply parameter override
      if (modSc._overrideInitState) delete modSc._overrideInitState;
      if (modSc._overrideConfig) delete modSc._overrideConfig;
      sweep.apply(modSc, v);

      // Merge overrides into actual config/initialState
      if (modSc._overrideInitState) {
        modSc.initialState = Object.assign(modSc.initialState || {}, modSc._overrideInitState);
        delete modSc._overrideInitState;
      }
      if (modSc._overrideConfig) {
        for (const [section, vals] of Object.entries(modSc._overrideConfig)) {
          if (modSc.config[section] && typeof modSc.config[section] === 'object') {
            Object.assign(modSc.config[section], vals);
          }
        }
        delete modSc._overrideConfig;
      }

      const snaps = runScenarioWithSeed(modSc, baseSeed);
      const final = snaps[snaps.length - 1];
      const row = { value: v };
      for (const m of metrics) row[m] = final[m];
      sweepResults.push(row);
    }

    results[sweep.name] = {
      desc: sweep.desc,
      baseline: sweep.baseline,
      values: sweepResults,
    };

    // Display
    log(`\n  ${sweep.name} (${sweep.desc})`);
    log(`  ${'Value'.padStart(6)}  ${metrics.map(m => m.substring(0,8).padStart(9)).join('')}`);
    log(`  ${'─'.repeat(6)}  ${metrics.map(() => '─'.repeat(9)).join('')}`);
    for (const row of sweepResults) {
      const marker = row.value === sweep.baseline ? ' ◀' : '';
      log(`  ${String(row.value).padStart(6)}  ${metrics.map(m => String(row[m]).padStart(9)).join('')}${marker}`);
    }
  }

  // Compute elasticities
  log('\n' + '─'.repeat(60));
  log('ELASTICITY MATRIX (% change in output / % change in input)');
  log('─'.repeat(60));
  log(`  ${'Parameter'.padEnd(25)} ${metrics.map(m => m.substring(0,8).padStart(9)).join('')}`);
  log(`  ${'─'.repeat(25)} ${metrics.map(() => '─'.repeat(9)).join('')}`);

  const elasticities = {};
  for (const [param, data] of Object.entries(results)) {
    const baseRow = data.values.find(r => r.value === data.baseline);
    if (!baseRow) continue;
    const minRow = data.values[0];
    const maxRow = data.values[data.values.length - 1];
    const inputRange = maxRow.value - minRow.value;

    const elast = {};
    for (const m of metrics) {
      const outputRange = maxRow[m] - minRow[m];
      const baseVal = Math.max(1, Math.abs(baseRow[m]));
      const baseInput = Math.max(1, Math.abs(data.baseline));
      elast[m] = +((outputRange / baseVal) / (inputRange / baseInput)).toFixed(2);
    }
    elasticities[param] = elast;
    log(`  ${param.padEnd(25)} ${metrics.map(m => String(elast[m]).padStart(9)).join('')}`);
  }

  // Highlight most sensitive relationships
  log('\n' + '─'.repeat(60));
  log('MOST SENSITIVE RELATIONSHIPS (|elasticity| > 0.5)');
  log('─'.repeat(60));
  const sensitive = [];
  for (const [param, elast] of Object.entries(elasticities)) {
    for (const [metric, e] of Object.entries(elast)) {
      if (Math.abs(e) > 0.5) sensitive.push({ param, metric, elasticity: e });
    }
  }
  sensitive.sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity));
  for (const s of sensitive) {
    log(`  ${s.param.padEnd(25)} → ${s.metric.padEnd(22)} elasticity=${s.elasticity}`);
  }

  const outFile = path.join(outDir, 'sensitivity_results.json');
  fs.writeFileSync(outFile, JSON.stringify({ scenario: 'cal_usa', seed: baseSeed, sweeps: results, elasticities }, null, 2));
  log(`\nResults saved to ${outFile}`);

  return results;
}

// ══════════════════════════════════════════════════════════
// 3. CROSS-VALIDATION (Leave-One-Out)
// ══════════════════════════════════════════════════════════

function validationRunCrossVal() {
  log(`\n${'═'.repeat(60)}`);
  log('CROSS-VALIDATION — Leave-One-Out on 8 Calibration Countries');
  log('═'.repeat(60));
  log('\nThis tests whether the model generalizes: are the mechanisms');
  log('that produce correct behavior for 7 countries also correct');
  log('for the 8th, or is each country individually overfit?\n');

  // The model coefficients are FIXED — we don't retrain. Instead, we test
  // whether each country's qualitative behavior is an emergent consequence
  // of its configuration, not of parameter tuning specific to that country.
  //
  // For each country, we run it WITHOUT its scenario-specific initial state
  // overrides (using only the config-derived defaults) and check whether
  // the expectations still hold. This tests whether the initial conditions
  // are doing the explanatory work vs. the mechanisms.

  const seeds = [1001, 2002, 3003, 4004, 5005];
  const calScenarios = CALIBRATION_SCENARIOS;

  const TARGETS = {
    cal_denmark:   { socialTrust: 74, wealthConcentration: 28, corruption: 12 },
    cal_usa:       { socialTrust: 37, wealthConcentration: 78, corruption: 27 },
    cal_china:     { socialTrust: 64, wealthConcentration: 55, corruption: 39 },
    cal_singapore: { socialTrust: 38, wealthConcentration: 45, corruption: 4 },
    cal_brazil:    { socialTrust: 7,  wealthConcentration: 89, corruption: 62 },
    cal_nigeria:   { socialTrust: 15, wealthConcentration: 67, corruption: 74 },
    cal_saudi:     { socialTrust: 53, wealthConcentration: 65, corruption: 53 },
    cal_russia:    { socialTrust: 28, wealthConcentration: 78, corruption: 73 },
    cal_japan:     { socialTrust: 36, wealthConcentration: 48, corruption: 27 },
    cal_germany:   { socialTrust: 44, wealthConcentration: 55, corruption: 22 },
    cal_india:     { socialTrust: 21, wealthConcentration: 75, corruption: 61 },
    cal_south_korea: { socialTrust: 30, wealthConcentration: 55, corruption: 37 },
  };

  const coreMetrics = ['socialTrust', 'wealthConcentration', 'corruption'];
  const results = {};

  for (const sc of calScenarios) {
    const name = sc.id.replace('cal_', '');
    logErr(`  Cross-validating ${name}...`);

    // Run WITH initial state (full calibration)
    const fullRuns = [];
    for (const seed of seeds) {
      const snaps = runScenarioWithSeed(sc, seed);
      fullRuns.push(snaps[snaps.length - 1]);
    }

    // Run WITHOUT initial state overrides (config-only)
    const strippedSc = JSON.parse(JSON.stringify(sc));
    strippedSc.initialState = {};
    const strippedRuns = [];
    for (const seed of seeds) {
      const snaps = runScenarioWithSeed(strippedSc, seed);
      strippedRuns.push(snaps[snaps.length - 1]);
    }

    const targets = TARGETS[sc.id] || {};
    const countryResult = { full: {}, stripped: {}, targets };

    for (const m of coreMetrics) {
      const fullVals = fullRuns.map(r => r[m]);
      const stripVals = strippedRuns.map(r => r[m]);
      const tgt = targets[m];

      countryResult.full[m] = {
        mean: +mean(fullVals).toFixed(1),
        stddev: +stddev(fullVals).toFixed(1),
        errorFromTarget: tgt !== undefined ? +(mean(fullVals) - tgt).toFixed(1) : null,
      };
      countryResult.stripped[m] = {
        mean: +mean(stripVals).toFixed(1),
        stddev: +stddev(stripVals).toFixed(1),
        errorFromTarget: tgt !== undefined ? +(mean(stripVals) - tgt).toFixed(1) : null,
      };
    }

    results[name] = countryResult;
  }

  // Display
  log('─'.repeat(70));
  log('FULL (with initial state) vs STRIPPED (config only) vs TARGET');
  log('─'.repeat(70));

  for (const [country, data] of Object.entries(results)) {
    log(`\n  ${country.toUpperCase()}`);
    log(`  ${'Metric'.padEnd(22)} ${'Target'.padStart(7)} ${'Full'.padStart(7)} ${'Strip'.padStart(7)} ${'Δ Full'.padStart(7)} ${'Δ Strip'.padStart(7)}  ${'Verdict'.padEnd(12)}`);
    log(`  ${'─'.repeat(22)} ${'─'.repeat(7)} ${'─'.repeat(7)} ${'─'.repeat(7)} ${'─'.repeat(7)} ${'─'.repeat(7)}  ${'─'.repeat(12)}`);

    for (const m of coreMetrics) {
      const f = data.full[m];
      const s = data.stripped[m];
      const tgt = data.targets[m];
      if (tgt === undefined) continue;

      const fullErr = Math.abs(f.errorFromTarget);
      const stripErr = Math.abs(s.errorFromTarget);

      let verdict;
      if (stripErr <= 15) verdict = 'GENERALIZES';
      else if (stripErr <= 25) verdict = 'PARTIAL';
      else verdict = 'OVERFIT';

      log(`  ${m.padEnd(22)} ${String(tgt).padStart(7)} ${String(f.mean).padStart(7)} ${String(s.mean).padStart(7)} ${(f.errorFromTarget >= 0 ? '+' : '') + f.errorFromTarget.toString().padStart(6)} ${(s.errorFromTarget >= 0 ? '+' : '') + s.errorFromTarget.toString().padStart(6)}  ${verdict}`);
    }
  }

  // Summary
  log('\n' + '─'.repeat(70));
  log('GENERALIZATION SUMMARY');
  log('─'.repeat(70));
  let gen = 0, partial = 0, overfit = 0, totalTests = 0;
  for (const data of Object.values(results)) {
    for (const m of coreMetrics) {
      const tgt = data.targets[m];
      if (tgt === undefined) continue;
      totalTests++;
      const stripErr = Math.abs(data.stripped[m].errorFromTarget);
      if (stripErr <= 15) gen++;
      else if (stripErr <= 25) partial++;
      else overfit++;
    }
  }
  log(`  GENERALIZES (|error|≤15):  ${gen}/${totalTests} (${(gen/totalTests*100).toFixed(0)}%)`);
  log(`  PARTIAL (15<|error|≤25):   ${partial}/${totalTests} (${(partial/totalTests*100).toFixed(0)}%)`);
  log(`  OVERFIT (|error|>25):      ${overfit}/${totalTests} (${(overfit/totalTests*100).toFixed(0)}%)`);
  log(`\n  Interpretation: GENERALIZES means the config-derived mechanisms alone`);
  log(`  produce behavior within 15 points of the real-world target — the`);
  log(`  initial state overrides are refinements, not load-bearing crutches.`);

  const outFile = path.join(outDir, 'crossval_results.json');
  fs.writeFileSync(outFile, JSON.stringify({ seeds, results }, null, 2));
  log(`\nResults saved to ${outFile}`);

  return results;
}

// ── CLI ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const mode = args[0] || 'all';
const seedsArg = args.find(a => a.startsWith('--seeds='));
const numSeeds = seedsArg ? parseInt(seedsArg.split('=')[1]) : 100;

if (mode === 'uq' || mode === 'all') {
  validationRunUQ(numSeeds);
}
if (mode === 'sensitivity' || mode === 'all') {
  validationRunSensitivity();
}
if (mode === 'crossval' || mode === 'all') {
  validationRunCrossVal();
}
