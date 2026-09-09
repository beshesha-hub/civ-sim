// ============================================================
// HINDCAST RUNNER
// ============================================================
// Run: node js/hindcast_runner.js [--seeds=N] [--scenario=id]
//
// Runs hindcasting scenarios with multiple seeds, evaluates both
// standard expectations and waypoint checks, produces trajectory
// traces for comparison with historical data.

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
  'js/hindcast_scenarios.js',
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

function log(s) { process.stdout.write(s + '\n'); }
function logErr(s) { process.stderr.write(s + '\n'); }

const outDir = path.join(base, 'validation_results');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── Helpers ──────────────────────────────────────────────
function hindcastRunScenario(scenario, seed) {
  game = new Game();
  game.ui = new UIManager(game);
  const cfg = Object.assign({}, scenario.config, { researchSeed: seed });
  game.startGame(cfg);
  const civ = game.civilizations[0];

  const ALIAS = { culturalCohesion: ['culturalHomogeneity', 'value'] };
  const GOVERNANCE_MIRROR = ['corruptionLevel'];
  const ECONOMIC_MIRROR = ['wealthConcentration'];
  if (scenario.initialState) {
    for (const [key, value] of Object.entries(scenario.initialState)) {
      const alias = ALIAS[key];
      if (alias) {
        if (civ.state[alias[0]] && typeof civ.state[alias[0]] === 'object') {
          civ.state[alias[0]][alias[1]] = value;
        }
        continue;
      }
      if (key in civ.state) civ.state[key] = value;
      if (GOVERNANCE_MIRROR.includes(key) && civ.governance) civ.governance[key] = value;
      if (ECONOMIC_MIRROR.includes(key) && civ.economic) civ.economic[key] = value;
    }
  }

  const snapshots = [];
  for (let t = 0; t < scenario.turns; t++) {
    game.nextTurn();
    const s = civ.state;
    const eco = civ.economic || {};
    const gov = civ.governance || {};
    snapshots.push({
      turn: t + 1,
      socialTrust: Math.round(s.socialTrust ?? 0),
      wealthConcentration: Math.round(eco.wealthConcentration ?? 0),
      corruption: Math.round(gov.corruptionLevel ?? 0),
      stability: Math.round(s.stabilityIndex ?? 0),
      stateCapacity: Math.round(s.stateCapacity ?? 0),
      epistemicHealth: Math.round(s.epistemicHealth ?? 0),
      institutionalQuality: Math.round(s.institutionalQuality ?? 0),
      institutionalLockIn: Math.round(s.institutionalLockin ?? 0),
      militaryPower: Math.round(s.militaryPower ?? 0),
      wellbeing: Math.round(s.averageWellbeing ?? 0),
      polarization: Math.round(s.polarizationLevel ?? 0),
      genderEquity: Math.round(s.genderEquity ?? 0),
      urbanization: Math.round(s.urbanizationRate ?? 0),
      legitimacy: Math.round(s.legitimacyLevel ?? 0),
      socialMobility: Math.round(s.socialMobility ?? 0),
      equality: Math.round(s.equalityIndex ?? 0),
    });
  }
  return snapshots;
}

function mean(arr) { return arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0; }
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
}

// ── Waypoint evaluator ──────────────────────────────────
function evaluateWaypoints(scenario, allRuns) {
  if (!scenario.waypoints) return [];
  const results = [];

  for (const wp of scenario.waypoints) {
    const wpResult = { turn: wp.turn, label: wp.label, checks: [] };

    for (const [metric, check] of Object.entries(wp.checks)) {
      const seedVals = [];
      for (const snaps of allRuns) {
        const snap = snaps.find(s => s.turn === wp.turn) || snaps[snaps.length - 1];
        if (snap && snap[metric] !== undefined) seedVals.push(snap[metric]);
      }

      const avg = mean(seedVals);
      const sd = stddev(seedVals);
      const pass = check.op === '>' ? avg > check.val : avg < check.val;
      const passRate = seedVals.filter(v => check.op === '>' ? v > check.val : v < check.val).length / seedVals.length;

      wpResult.checks.push({
        metric,
        expected: `${check.op} ${check.val}`,
        note: check.note,
        mean: +avg.toFixed(1),
        stddev: +sd.toFixed(1),
        pass,
        passRate: +(passRate * 100).toFixed(0),
      });
    }
    results.push(wpResult);
  }
  return results;
}

// ── Standard expectation evaluator (reuse harness logic) ──
function hindcastEvalExpectation(key, phrase, snaps) {
  if (typeof evaluateExpectation === 'function') {
    return evaluateExpectation(key, phrase, snaps);
  }
  return { key, phrase, verdict: 'UNSCOREABLE', score: null, reason: 'evaluator not loaded' };
}

// ── Main ────────────────────────────────────────────────
const cliArgs = process.argv.slice(2);
const seedsArg = cliArgs.find(a => a.startsWith('--seeds='));
const scenarioArg = cliArgs.find(a => a.startsWith('--scenario='));
const numSeeds = seedsArg ? parseInt(seedsArg.split('=')[1]) : 20;
const filterScenario = scenarioArg ? scenarioArg.split('=')[1] : null;

const scenarios = filterScenario
  ? HINDCAST_SCENARIOS.filter(s => s.id === filterScenario)
  : HINDCAST_SCENARIOS;

log(`\n${'═'.repeat(70)}`);
log(`HINDCASTING VALIDATION — ${numSeeds} seeds per scenario`);
log('═'.repeat(70));

const allResults = {};

for (const sc of scenarios) {
  logErr(`  Running ${sc.name}...`);
  log(`\n${'─'.repeat(70)}`);
  log(`${sc.name} (${sc.turns} turns, ${numSeeds} seeds)`);
  log(`Source: ${sc.benchmarks.source}`);
  log('─'.repeat(70));

  const allRuns = [];
  for (let seed = 1; seed <= numSeeds; seed++) {
    const snaps = hindcastRunScenario(sc, seed * 1000 + 13);
    allRuns.push(snaps);
  }

  // Compute mean trajectory
  const meanTrajectory = [];
  const numTurns = allRuns[0].length;
  const metrics = ['socialTrust', 'wealthConcentration', 'corruption', 'stability',
                   'stateCapacity', 'epistemicHealth', 'wellbeing', 'militaryPower',
                   'polarization', 'institutionalLockIn', 'genderEquity', 'institutionalQuality'];

  for (let t = 0; t < numTurns; t++) {
    const row = { turn: allRuns[0][t].turn };
    for (const m of metrics) {
      const vals = allRuns.map(r => r[t][m]).filter(v => v !== undefined);
      row[m] = { mean: +mean(vals).toFixed(1), sd: +stddev(vals).toFixed(1) };
    }
    meanTrajectory.push(row);
  }

  // Display trajectory summary (every 5 turns)
  const showMetrics = ['socialTrust', 'wealthConcentration', 'corruption', 'stability', 'stateCapacity', 'wellbeing'];
  log(`\n  Mean trajectory (every 5 turns):`);
  log(`  ${'Turn'.padStart(5)}  ${showMetrics.map(m => m.substring(0,8).padStart(9)).join('')}`);
  log(`  ${'─'.repeat(5)}  ${showMetrics.map(() => '─'.repeat(9)).join('')}`);
  for (const row of meanTrajectory) {
    if (row.turn % 5 === 0 || row.turn === 1 || row.turn === numTurns) {
      log(`  ${String(row.turn).padStart(5)}  ${showMetrics.map(m => String(row[m].mean).padStart(9)).join('')}`);
    }
  }

  // Evaluate standard expectations
  log(`\n  Standard expectations:`);
  const expectResults = [];
  if (sc.expectations) {
    for (const [key, phrase] of Object.entries(sc.expectations)) {
      // Use majority-vote across seeds
      let passCount = 0;
      let totalScore = 0;
      for (const snaps of allRuns) {
        const r = hindcastEvalExpectation(key, phrase, snaps);
        if (r.verdict === 'PASS') passCount++;
        if (r.score != null) totalScore += r.score;
      }
      const passRate = passCount / allRuns.length;
      const avgScore = totalScore / allRuns.length;
      const verdict = passRate >= 0.5 ? 'PASS' : 'FAIL';
      expectResults.push({ key, phrase, verdict, passRate: +(passRate * 100).toFixed(0), avgScore: +avgScore.toFixed(3) });
      log(`    ${verdict.padEnd(5)} ${key.padEnd(22)} "${phrase}" (${(passRate * 100).toFixed(0)}% seeds pass, avg score ${avgScore.toFixed(2)})`);
    }
  }

  // Evaluate waypoints
  log(`\n  Waypoint checks:`);
  const wpResults = evaluateWaypoints(sc, allRuns);
  for (const wp of wpResults) {
    log(`\n    Turn ${wp.turn} — ${wp.label}:`);
    for (const c of wp.checks) {
      const icon = c.pass ? 'PASS' : 'FAIL';
      log(`      ${icon.padEnd(5)} ${c.metric.padEnd(20)} expected ${c.expected.padEnd(6)}  actual=${String(c.mean).padStart(5)} ± ${String(c.stddev).padStart(4)}  (${c.passRate}% seeds)  ${c.note}`);
    }
  }

  // Overall score
  const allChecks = [];
  for (const wp of wpResults) {
    for (const c of wp.checks) allChecks.push(c.pass ? 1 : 0);
  }
  for (const e of expectResults) allChecks.push(e.verdict === 'PASS' ? 1 : 0);

  const overallPass = allChecks.filter(x => x).length;
  const overallTotal = allChecks.length;
  log(`\n  Overall: ${overallPass}/${overallTotal} checks pass (${(overallPass/overallTotal*100).toFixed(0)}%)`);

  allResults[sc.id] = {
    name: sc.name,
    period: sc.benchmarks.historicalPeriod,
    trajectory: meanTrajectory,
    expectations: expectResults,
    waypoints: wpResults,
    overallPass,
    overallTotal,
  };
}

// Summary
log(`\n${'═'.repeat(70)}`);
log('HINDCASTING SUMMARY');
log('═'.repeat(70));

let grandPass = 0, grandTotal = 0;
for (const [id, res] of Object.entries(allResults)) {
  grandPass += res.overallPass;
  grandTotal += res.overallTotal;
  const pct = (res.overallPass / res.overallTotal * 100).toFixed(0);
  log(`  ${res.name.padEnd(40)} ${res.overallPass}/${res.overallTotal} (${pct}%)`);
}
log(`\n  TOTAL: ${grandPass}/${grandTotal} (${(grandPass/grandTotal*100).toFixed(0)}%)`);

const outFile = path.join(outDir, 'hindcast_results.json');
fs.writeFileSync(outFile, JSON.stringify({ numSeeds, results: allResults }, null, 2));
log(`\nResults saved to ${outFile}`);
