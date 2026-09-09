# Pass 9 Specification — Cultural Homogeneity, Cross-Civilization Behavioral Contagion, Track 2 Infrastructure

**Status:** Approved by user — implement in full.
**Design principle:** Model the real world as closely as possible.
**Context:** Continuing from Pass 8 (all Pass 8 systems complete and verified).

---

## Overview

Pass 9 adds three interconnected systems that extend the simulation into inter-civilization dynamics and researcher tooling:

1. **Cultural Homogeneity/Heterogeneity** — a derived background state variable (0–100) modifying inertia, facilitation effectiveness, and contagion reception
2. **Cross-Civilization Behavioral Contagion** — cooperation norms, cynicism, and epistemic health drift between neighboring civilizations, modulated by trade dependency, diplomatic attitude, and cultural homogeneity
3. **Track 2 Research Infrastructure** — random seed for run identification, full ring-buffer CSV export, and a read-only parameter documentation panel (architecture reserved for editability)

**UI philosophy:** These systems are hidden from casual gameplay by default. An "Advanced / Research View" toggle (per-section button, not a global mode switch) reveals deeper charts, raw export controls, and contagion visualization. The parameter documentation panel is a new `research_panel.js` accessible from a "Research" button in the main toolbar.

---

## System 1 — Cultural Homogeneity/Heterogeneity

### Concept

Every civilization has an internal cultural composition. A homogeneous civ has one dominant shared culture — norms spread rapidly within it, external influences are resisted, and when change does come it arrives suddenly (all-or-nothing). A heterogeneous civ has many competing subcultures — norms diffuse more gradually, external influences enter through the most-receptive subculture first, and change is incremental.

`culturalHomogeneity` (0–100) is a **derived background variable**: it is never set directly by the player. It begins from founding conditions and drifts slowly each turn. No new panel tab is created for it; it is visible only through its effects on existing systems, and through the "Advanced / Research View" toggle.

### State Field (add to `this.state` in `civilization.js`)

Add before the `alienContactState` block (or after `behaviorInertia`, near the end of the Pass 8 state additions):

```js
// ── Pass 9: Cultural Homogeneity ─────────────────────────────────────────────
// 0 = highly pluralistic (many competing subcultures)
// 100 = culturally monolithic (one dominant culture, minimal subculture diversity)
// Derived from founding conditions. Drifts slowly. NOT player-settable.
culturalHomogeneity: {
  value: 50,             // 0–100
  history: [],           // ring buffer, last 50 turns: {turn, value}
},
```

### Founding Derivation (`_initCulturalHomogeneity(civ)` — called once from `civilization.js` `_computeSocietyInitials` or from `simulation.js` at game start)

```
base = governance model contribution:
  theocratic                          → 72
  absolute_monarchy, chiefdom         → 65
  monarchy, oligarchy, plutocracy     → 58
  technocracy                         → 52
  representative_democracy            → 42
  direct_democracy, council_consensus,
    flat_consensus                    → 32
  shadow_government_covert,
    shadow_government_complicit       → 62
  (all others)                        → 50

religion modifier:
  if religion.dominance > 70: +10
  if religion.dominance < 30: -5

economic model modifier:
  gift, commons                       → -10
  command                             → +15
  laissez_faire, market_competitive   → +5
  (all others)                        → 0

clamp(base + religion_mod + econ_mod, 10, 90)
```

Note: initial value is clamped to 10–90; the extremes (0 and 100) are only reachable through long drift, not at founding.

Store the result in `civ.state.culturalHomogeneity.value`.

### Per-Turn Drift (`_processCulturalHomogeneity(civ)` — called in per-civ loop in `simulation.js`)

```
driftSources = []

// Toward heterogeneity:
if (s.tradeDependency > 50):         drift -= 0.06 * ((s.tradeDependency - 50) / 50)
if (migration.lastEvent === 'influx'): drift -= 0.12  (one-time this turn)
if (govModelId === 'direct_democracy'): drift -= 0.05
if (govModelId === 'council_consensus' || 'flat_consensus'): drift -= 0.07
if (s.artsSupport > 70 && s.artsFreedom > 70): drift -= 0.05
if (s.scienceFreedom > 70): drift -= 0.03

// Toward homogeneity:
if (govModelId === 'theocratic'): drift += 0.10
if (govModelId === 'shadow_government_covert' || '_complicit'): drift += 0.07
if (govModelId === 'command' || 'absolute_monarchy'): drift += 0.08
if (s.wealthCapture.degree > 60): drift += 0.04  // monoculture of the wealthy
if (s.epistemicHealth < 30): drift += 0.06        // low EH → limited exposure to alternatives
if (s.informationEcosystem === 'state_controlled'): drift += 0.05

net drift: clamp to ±0.20/turn maximum
civ.state.culturalHomogeneity.value = clamp(value + net, 0, 100)
```

Push ring buffer entry: `{turn: game.turnCount, value: Math.round(value)}`. Cap at 50 entries with `.shift()`.

### Effects on Other Systems (background modifiers — integrated into existing `_process*` methods)

**Effect 1 — Behavioral Inertia coefficient (`_processInertia`):**
Add a homogeneity contribution to the existing coefficient formula:
```
homogeneity_contribution = s.culturalHomogeneity.value × 0.12
```
This adds up to +12 points to the inertia coefficient at maximum homogeneity. The existing formula already computes a coefficient from time-in-model, hierarchyEntrenched, wealthCapture, and educationQuality; simply add this term before the final clamp.

**Effect 2 — Facilitation effectiveness ceiling (`_processFacilitation`):**
Heterogeneous civs are more responsive to facilitation (diverse subcultures → some are already receptive):
```
facilitation_ceiling_modifier = 1.0 + (50 - s.culturalHomogeneity.value) / 500
// range: +10% at homo=0 → no change at homo=50 → -10% at homo=100
// Applied as a multiplier on the facilitation ehAmplifier before applying to deferredShift
```

**Effect 3 — Cross-civilization contagion receptivity:**
See System 2 — receptivity is derived from `culturalHomogeneity.value`.

**Effect 4 — Cultural gap stratum variation (documentary — no code change required):**
The existing `culturalGap.byStratum` already varies by stratum. In a future pass, stratum-level variation could be scaled by homogeneity. For now, document this as a design note but do not implement.

### Track 2 / Visualization

- History ring buffer feeds `drawHomogeneityChart` in `chart_utils.js`
- Displayed in the "Advanced / Research View" section of `society_panel.js` (Behavioral Inertia tab — add a homogeneity sub-section beneath the inertia chart)
- Exported in Track 2 full CSV (see System 3)

---

## System 2 — Cross-Civilization Behavioral Contagion

### Concept

When civilizations trade and maintain diplomatic relations, behavioral norms diffuse across their borders. Cooperation, cynicism, and epistemic health all spread — at different rates, through different channels. The size of the effect depends on trade dependency (frequency of contact), diplomatic attitude (openness to influence), and cultural homogeneity (receptivity of the receiving civ's subcultures).

Key design constraint: contagion is **asymmetric in direction** (source's level minus target's level determines direction and magnitude) and **asymmetric in speed** (cooperation is fastest; EH is slowest). All contagion that affects behavioral reinforcement goes through the **deferred shift queue** (System 1 from Pass 8), so inertia naturally limits its application rate.

The "all-or-nothing" behavior of homogeneous civs emerges naturally: they have higher inertia AND lower receptivity, so deferred shift accumulates slowly. When a paradigm shift finally occurs in that civ, inertia temporarily drops and accumulated deltas flush through more quickly — producing a sudden apparent change from external influence that was actually building for many turns.

### New Config Constant (add to `config.js` after `THRESHOLD_DEFINITIONS`)

```js
// ── Pass 9: Cross-Civilization Behavioral Contagion ───────────────────────────
const CONTAGION_CONFIG = {
  baseRateScaling:      0.025,  // per-turn rate at tradeDep=100, attitude=+100, receptivity=1.0
  cynicismSpeedFactor:  0.55,   // cynicism spreads more slowly than cooperation
  ehSpeedFactor:        0.35,   // epistemic health is most structural — slowest
  minAttitudeFactor:    0.08,   // even hostile civs have minimal cultural bleed
  warDampeningFactor:   0.04,   // war almost halts cultural exchange
  contagionBurstThreshold: 30,  // when source-target delta exceeds this AND attitude > 60, log a 'contagion_surge' event
};
```

### State Fields (add to `this.state` in `civilization.js`)

```js
// ── Pass 9: Behavioral Contagion ─────────────────────────────────────────────
// Tracks cross-civilization norm diffusion — what this civ emits and absorbs.
contagionState: {
  // Received influences (last 10 entries):
  receivedInfluences: [], // [{turn, sourceCivId, sourceCivName, vector, delta, absorbed}]
  // Emitted influences (last 10 entries):
  emittedInfluences: [],  // [{turn, targetCivId, targetCivName, vector, delta}]
  // Per-turn ring buffer (last 50 turns):
  contagionHistory: [],   // [{turn, netCoopDelta, netCynicismDelta, netEHDelta}]
},
```

### Per-Turn Processing (`_processBehavioralContagion()` — called on the `SimulationEngine` instance)

This is a **global method** (not per-civ), called after `_processInteractions` in `processTurn`. It uses the same nested pair loop as `_processInteractions`.

**Placement in `processTurn`:**
```js
// 4. Inter-civilization interactions
this._processInteractions(yearsDelta);

// 4b. Cross-civilization behavioral contagion
this._processBehavioralContagion();
```

**Method skeleton:**
```js
_processBehavioralContagion() {
  const civs = this.game.civilizations;
  if (civs.length < 2) return;

  for (let i = 0; i < civs.length; i++) {
    for (let j = i + 1; j < civs.length; j++) {
      const a = civs[i], b = civs[j];
      this._applyContagionPair(a, b);
      this._applyContagionPair(b, a);
    }
  }

  // Record per-turn ring buffer entry for each civ
  for (const civ of civs) {
    const h = civ.state.contagionState?.contagionHistory;
    if (h) {
      h.push({ turn: this.game.turnCount, netCoopDelta: civ._p9CoopDelta ?? 0, netCynicismDelta: civ._p9CynicismDelta ?? 0, netEHDelta: civ._p9EHDelta ?? 0 });
      if (h.length > 50) h.shift();
      civ._p9CoopDelta = 0;
      civ._p9CynicismDelta = 0;
      civ._p9EHDelta = 0;
    }
  }
}
```

**`_applyContagionPair(source, target)`:**

```js
_applyContagionPair(source, target) {
  const s = source.state, t = target.state;
  if (!s || !t) return;

  // ── Contact rate factors ─────────────────────────────────────────────────
  const tradeDep = Utils.clamp(((s.tradeDependency ?? 20) + (t.tradeDependency ?? 20)) / 2, 0, 100);

  const rel = target.relations.get(source.id);
  const attitude = rel?.attitude ?? 0;  // -100 to +100
  const atWar = rel?.war === true;

  const attitudeFactor = atWar
    ? CONTAGION_CONFIG.warDampeningFactor
    : Utils.clamp((attitude + 100) / 200, CONTAGION_CONFIG.minAttitudeFactor, 1.0);

  // ── Receiver receptivity (from cultural homogeneity) ─────────────────────
  const homo = t.culturalHomogeneity?.value ?? 50;
  const receptivity = Utils.clamp(1.0 - homo / 150, 0.33, 1.0);
  // homo=0  → receptivity=1.00 (fully open)
  // homo=50 → receptivity=0.67
  // homo=100→ receptivity=0.33

  // ── Base rate ────────────────────────────────────────────────────────────
  const baseRate = (tradeDep / 100) * attitudeFactor * receptivity * CONTAGION_CONFIG.baseRateScaling;
  if (baseRate < 0.0001) return; // negligible — skip

  const turn = this.game.turnCount;

  // ── Vector 1: Cooperation (behavioral reinforcement) ─────────────────────
  const sourceCoop = s.behaviorReinforcement?.cooperation ?? 50;
  const targetCoop = t.behaviorReinforcement?.cooperation ?? 50;
  const coopDelta = (sourceCoop - targetCoop) * baseRate;
  if (Math.abs(coopDelta) > 0.001) {
    // Goes through deferred shift — subject to inertia
    t.behaviorInertia.deferredShift.cooperation = Utils.clamp(
      (t.behaviorInertia.deferredShift.cooperation ?? 0) + coopDelta, -50, 50
    );
    // Track for ring buffer
    target._p9CoopDelta = (target._p9CoopDelta ?? 0) + coopDelta;

    // Log surge event if delta is large
    const absDelta = Math.abs(sourceCoop - targetCoop);
    if (absDelta > CONTAGION_CONFIG.contagionBurstThreshold && attitude > 60) {
      this._logContagionEvent(source, target, 'cooperation', coopDelta);
    }

    // Record received influence
    const ri = t.contagionState?.receivedInfluences;
    if (ri) {
      ri.push({ turn, sourceCivId: source.id, sourceCivName: source.name, vector: 'cooperation', delta: coopDelta, absorbed: coopDelta });
      if (ri.length > 10) ri.shift();
    }
  }

  // ── Vector 2: Cynicism ────────────────────────────────────────────────────
  const sourceCynicism = s.culturalGap?.cynicismLevel ?? 0;
  const targetCynicism = t.culturalGap?.cynicismLevel ?? 0;
  const cynicismDelta = (sourceCynicism - targetCynicism) * baseRate * CONTAGION_CONFIG.cynicismSpeedFactor;
  if (Math.abs(cynicismDelta) > 0.001 && t.culturalGap) {
    t.culturalGap.cynicismLevel = Utils.clamp(targetCynicism + cynicismDelta, 0, 100);
    target._p9CynicismDelta = (target._p9CynicismDelta ?? 0) + cynicismDelta;
  }

  // ── Vector 3: Epistemic Health ────────────────────────────────────────────
  const sourceEH = s.epistemicHealth ?? 50;
  const targetEH = t.epistemicHealth ?? 50;
  const ehDelta = (sourceEH - targetEH) * baseRate * CONTAGION_CONFIG.ehSpeedFactor;
  if (Math.abs(ehDelta) > 0.001) {
    t.epistemicHealth = Utils.clamp(targetEH + ehDelta, 0, 100);
    target._p9EHDelta = (target._p9EHDelta ?? 0) + ehDelta;
  }

  // Record emitted influence on source
  const ei = s.contagionState?.emittedInfluences;
  if (ei && Math.abs(coopDelta) + Math.abs(cynicismDelta) + Math.abs(ehDelta) > 0.001) {
    ei.push({ turn, targetCivId: target.id, targetCivName: target.name, vector: 'multi', delta: coopDelta });
    if (ei.length > 10) ei.shift();
  }
}
```

**`_logContagionEvent(source, target, vector, delta)`:**
```js
_logContagionEvent(source, target, vector, delta) {
  const label = delta > 0 ? 'Cooperation Surge' : 'Cynicism Spread';
  const text = delta > 0
    ? `${source.name}'s cooperative norms are significantly influencing ${target.name}. Cultural diffusion is accelerating.`
    : `Cynicism from ${source.name} is spreading to ${target.name} through sustained contact.`;
  target.addHistoryEntry(this.game.currentYear, label, text, 'info');
}
```

**Note on per-civ scratch variables:** `target._p9CoopDelta`, `target._p9CynicismDelta`, `target._p9EHDelta` are temporary accumulators reset each turn at the end of `_processBehavioralContagion`. They are NOT added to `civ.state` — they are transient properties on the civ object, similar to other per-turn scratch usage in the codebase.

### Theocratic Empathy Bias + Contagion Interaction

When `s.theocraticEmpathyBias.active === true`, the civ's cooperation contagion emission uses `s.theocraticEmpathyBias.inGroupEmpathy` as a proxy for the cooperative norm it projects outward (rather than raw `behaviorReinforcement.cooperation`). This ensures theocratic civs project in-group cooperation to allies but not out-group.

Implementation: in `_applyContagionPair`, before computing `sourceCoop`:
```js
const sourceCoop = (s.theocraticEmpathyBias?.active && attitude < 0)
  ? Math.min(s.behaviorReinforcement?.cooperation ?? 50, s.theocraticEmpathyBias.outGroupEmpathy ?? 50)
  : s.behaviorReinforcement?.cooperation ?? 50;
```

### NPC Commentary (npc.js — 2 new intents)

**Intent: `civ_contagion`**
Trigger keywords: `"spreading from"`, `"neighbor influence"`, `"cultural contagion"`, `"copying other"`, `"contagion"`, `"norm diffusion"`

Response branches:
- Leader/elite: Concerns about cultural sovereignty vs. openness; whether to accelerate trade (more influence) or pull back
- Scholar/middle: Academic framing — "When trade routes carry goods, they carry ideas. This is well-documented historically."
- Working class / disenfranchised: Skeptical or hopeful depending on direction of contagion — if cynicism is spreading in, negative; if cooperation is flowing in, positive

**Intent: `cultural_homogeneity`**
Trigger keywords: `"monoculture"`, `"cultural diversity"`, `"pluralism"`, `"homogeneous"`, `"heterogeneous"`, `"one culture"`, `"many subcultures"`

Response branches:
- If `culturalHomogeneity.value > 70`: NPC reflects on conformity pressures, loss of dissenting perspectives, resilience vs. brittleness
- If `culturalHomogeneity.value < 30`: NPC reflects on creative tension between subcultures, difficulty building shared consensus, innovation and resilience from diversity
- Neutral (30–70): Balanced observation about the current cultural makeup

### UI — Contagion Visualization (hidden by default)

**Location:** `society_panel.js` — add a new "Contagion" tab (tab 7, after Behavioral Inertia)

Wait — society_panel already has several tabs. Let me reconsider. Per the user's approval, contagion visualization goes through the Research Panel (new file), not society_panel. The contagion tab in society_panel would be excessive.

**Revised placement:**
- `research_panel.js` (new file) — tab: "Contagion" — shows:
  - Per-civ contagion history chart (dual line: netCoopDelta, netCynicismDelta over 50 turns)
  - Received influences log (which civs are influencing this one and how much)
  - Emitted influences log (which civs this one is influencing)
- `society_panel.js` Behavioral Inertia tab — add a "Research View" toggle at bottom revealing:
  - A compact contagion summary: "Currently receiving influence from [civs]" and "Currently emitting influence to [civs]"

### Chart (`chart_utils.js` — `drawContagionChart`)

```js
static drawContagionChart(canvas, contagionHistory, options = {}) {
  // Two lines: netCoopDelta (green) and netCynicismDelta (amber)
  // Zero line centered, positive = receiving cooperation / shedding cynicism
  // Negative = losing cooperation / receiving cynicism
  // Similar structure to existing dual-line charts
}
```

---

## System 3 — Track 2 Research Infrastructure

### 3a — Random Seed / Run ID

#### Purpose
Allows researchers to identify and reference specific simulation runs in published work. Not a full reproducibility seed (true Math.random reproducibility requires a seeded PRNG replacement — deferred to a future pass). Instead: a unique run identifier stored with all exports.

#### Implementation

**In `game.js`, `startGame(setupData)` — generate run seed:**
```js
// Generate research seed for run identification
const providedSeed = setupData.researchSeed || null;
this.researchSeed = providedSeed ?? (Date.now() ^ (Math.random() * 0xFFFFFFFF | 0)) >>> 0;
this.researchSeed = String(this.researchSeed).padStart(10, '0');
```

**In `game.js`, `_loadSettings()` / `_defaultSetupData` (or wherever setup wizard defaults live):**
Add `researchSeed: null` to `setupData` defaults.

**In `ui.js`, setup wizard (last step or a Research step):**
Add an optional numeric input: "Research Seed (optional, for run identification)". If blank, left null — auto-generated at game start.

The seed is displayed prominently in the Track 2 export header and in the Research Panel.

#### Setup Wizard Integration

Add to the final setup wizard step (step that contains "Advanced" or "World Climate" options, or create a "Research" mini-section at the end of any existing final step):

```html
<div class="setup-section">
  <h3>Research Settings</h3>
  <label>Run Seed (optional)
    <input type="number" id="setup-research-seed" placeholder="auto-generated" min="0" max="9999999999">
    <span class="setup-hint">Leave blank to auto-generate. Records alongside all Track 2 exports for run identification.</span>
  </label>
</div>
```

On "Start Game", capture: `setupData.researchSeed = parseInt(Utils.el('setup-research-seed')?.value) || null;`

### 3b — Full History / Stats CSV Export

#### Design

A single-file multi-section CSV. Each section begins with a `## SECTION_NAME` header row. Sections are separated by a blank row.

**File name:** `[CivName]_turn[N]_seed[SEED].csv`

**Sections and columns:**

| Section | Columns |
|---|---|
| RUN_METADATA | key, value (seed, civ_name, game_year, turn, economic_model, governance_model, export_timestamp) |
| ECONOMIC_HISTORY | turn, year, gdp_proxy, wellbeing, equality, trade_dependency, debt_load |
| EMPATHY_HISTORY | turn, year, empathy_level, leader_empathy, empathy_elite, empathy_disenfranchised, empathy_ri_combined |
| CULTURAL_GAP_HISTORY | turn, year, gap_score, dissonance, cynicism, rev_consciousness, shift_readiness |
| WEALTH_CAPTURE_HISTORY | turn, year, degree, institutional_capture, electoral_capture, media_capture, feudal_dynamic |
| BEHAVIORAL_INERTIA_HISTORY | turn, year, coefficient, pending_magnitude |
| FACILITATION_HISTORY | turn, year, measures_active, cynicism_reduction, coop_boost |
| COOP_OUTCOMES_HISTORY | turn, year, coop_outcome_score, feedback, magnitude, cumulative_reinforcement |
| DEFICIT_HISTORY | turn, year, deficit_level, acceleration_multiplier |
| HOMOGENEITY_HISTORY | turn, year, cultural_homogeneity |
| CONTAGION_HISTORY | turn, year, net_coop_delta, net_cynicism_delta, net_eh_delta |
| THRESHOLD_EVENTS | turn, year, threshold_id, label, severity |
| HISTORY_EVENTS | turn, year, title, type |

#### Implementation

Add method `_exportTrack2CSV(civ)` to `SimulationEngine` (or to chart_utils.js as a static method — either location is acceptable; `SimulationEngine` is preferred since it has access to game state including the seed):

```js
_exportTrack2CSV(civ) {
  const s = civ.state;
  const seed = this.game.researchSeed ?? 'unknown';
  const lines = [];

  const section = (name) => { lines.push(''); lines.push(`## ${name}`); };
  const row = (...cells) => lines.push(cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));

  // RUN_METADATA
  section('RUN_METADATA');
  row('key', 'value');
  row('seed', seed);
  row('civ_name', civ.name);
  row('game_year', this.game.currentYear);
  row('turn', this.game.turnCount);
  row('economic_model', civ.economic?.modelId ?? '');
  row('governance_model', civ.governance?.modelId ?? '');
  row('export_timestamp', new Date().toISOString());

  // ECONOMIC_HISTORY
  section('ECONOMIC_HISTORY');
  row('turn','year','gdp_proxy','wellbeing','equality','trade_dependency','debt_load');
  for (const e of (s.economicHistory ?? [])) {
    row(e.turn??'', e.year??'', e.gdpProxy??'', e.wellbeing??'', e.equality??'', e.tradeDependency??'', e.debtLoad??'');
  }

  // EMPATHY_HISTORY
  section('EMPATHY_HISTORY');
  row('turn','year','empathy','leader_empathy','elite','disenfranchised','ri_combined');
  for (const e of (s.empathyHistory ?? [])) {
    row(e.turn??'', e.year??'', e.empathy??'', e.leaderEmpathy??'', e.elite??'', e.disenfranchised??'', e.combined??'');
  }

  // CULTURAL_GAP_HISTORY
  section('CULTURAL_GAP_HISTORY');
  row('turn','year','gap_score','dissonance','cynicism','rev_consciousness','shift_readiness');
  for (const e of (s.culturalGap?.history ?? [])) {
    row(e.turn??'', e.year??'', e.gapScore??'', e.dissonance??'', e.cynicism??'', e.revConsciousness??'', e.readiness??'');
  }

  // WEALTH_CAPTURE_HISTORY
  section('WEALTH_CAPTURE_HISTORY');
  row('turn','year','degree','institutional','electoral','media','feudal_dynamic');
  for (const e of (s.wealthCapture?.history ?? [])) {
    row(e.turn??'', e.year??'', e.degree??'', e.institutionalCapture??'', e.electoralCapture??'', e.mediaCapture??'', e.feudalDynamic??'');
  }

  // BEHAVIORAL_INERTIA_HISTORY
  section('BEHAVIORAL_INERTIA_HISTORY');
  row('turn','year','coefficient','pending_magnitude');
  for (const e of (s.behaviorInertia?.inertiaHistory ?? [])) {
    row(e.turn??'', e.year??'', e.coefficient??'', e.pendingMagnitude??'');
  }

  // FACILITATION_HISTORY
  section('FACILITATION_HISTORY');
  row('turn','year','measures_active','cynicism_reduction','coop_boost');
  for (const e of (s.facilitationState?.facilitationHistory ?? [])) {
    row(e.turn??'', e.year??'', e.measuresActive??'', e.totalCynicismReduction??'', e.totalCoopBoost??'');
  }

  // COOP_OUTCOMES_HISTORY
  section('COOP_OUTCOMES_HISTORY');
  row('turn','year','coop_outcome_score','feedback','magnitude','cumulative_reinforcement');
  for (const e of (s.cooperativeOutcomes?.history ?? [])) {
    row(e.turn??'', e.year??'', e.score??'', e.feedback??'', e.magnitude??'', e.cumulativeReinforcement??'');
  }

  // DEFICIT_HISTORY
  section('DEFICIT_HISTORY');
  row('turn','year','deficit_level','acceleration_multiplier');
  for (const e of (s.consequenceDeficit?.deficitHistory ?? [])) {
    row(e.turn??'', e.year??'', e.level??'', e.multiplier??'');
  }

  // HOMOGENEITY_HISTORY
  section('HOMOGENEITY_HISTORY');
  row('turn','year','cultural_homogeneity');
  for (const e of (s.culturalHomogeneity?.history ?? [])) {
    row(e.turn??'', e.year??'', e.value??'');
  }

  // CONTAGION_HISTORY
  section('CONTAGION_HISTORY');
  row('turn','year','net_coop_delta','net_cynicism_delta','net_eh_delta');
  for (const e of (s.contagionState?.contagionHistory ?? [])) {
    row(e.turn??'', e.year??'', e.netCoopDelta?.toFixed(4)??'', e.netCynicismDelta?.toFixed(4)??'', e.netEHDelta?.toFixed(4)??'');
  }

  // THRESHOLD_EVENTS
  section('THRESHOLD_EVENTS');
  row('turn','year','threshold_id','label','severity');
  for (const e of (s.thresholdEvents?.fired ?? [])) {
    row(e.turn??'', e.year??'', e.thresholdId??'', e.label??'', e.severity??'');
  }

  // HISTORY_EVENTS
  section('HISTORY_EVENTS');
  row('turn','year','title','type');
  for (const e of (civ.history ?? [])) {
    row(e.turn??'', e.year??'', e.title??'', e.type??'');
  }

  // Download
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${civ.name.replace(/\s+/g,'_')}_turn${this.game.turnCount}_seed${seed}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Export is triggered from a button in the Research Panel.

### 3c — Read-Only Parameter Documentation Panel

#### Purpose
Exposes the assumptions embedded in the simulation — drift rates, threshold values, facilitation costs, contagion rates — as readable documentation for researchers. Architecture is deliberately designed so individual values can become editable fields later without structural redesign (each value is rendered as a `<div class="param-row">` that can be replaced with an `<input>` when editability is enabled).

#### New File: `research_panel.js`

**Class:** `ResearchPanel`

**Constructor:**
```js
constructor(game) {
  this.game = game;
  this.activeTab = 'export';   // 'export' | 'parameters' | 'contagion'
}
```

**Tabs:**
1. **Export** — Run metadata display + download button + seed display
2. **Parameters** — Read-only simulation constants (organized by category)
3. **Contagion** — Cross-civ contagion visualization for player's civ

**Render entry point:** `render(container)` — standard pattern matching other panels.

**Export tab (`_renderExport`):**
- Shows current run seed prominently: `SEED: [value]`
- Shows turn and year
- "Download Full CSV" button → calls `this.game.simulation._exportTrack2CSV(playerCiv)`
- Explanation paragraph: "This CSV contains all 50-turn ring buffers, threshold events, and history events for this civilization. Use the seed to reference this run in research."

**Parameters tab (`_renderParameters`):**
Sections and entries (read-only display):

```
─ Behavioral Inertia ─────────────────────────────────────────
inertia from time in model (per year, cap 60)   ×0.5 /yr
inertia from hierarchy entrenchment              ×0.3
inertia from wealth capture degree               ×0.2
inertia from low education quality               ×0.1
inertia reduction from epistemic health          −×0.1
inertia from cultural homogeneity                ×0.12
fraction of deferred shift applied per turn      (1−inertia/100)×0.25

─ Facilitation Measures ──────────────────────────────────────
[for each measure in FACILITATION_MEASURES]:
  [measure.label]: cost [measure.cost], duration [measure.duration ?? 'indefinite']
EH amplifier range                               0.05 – 1.5 (at EH/60)
Propaganda risk threshold EH                     < 30

─ Cooperative Outcomes ───────────────────────────────────────
coop outcome score: econ coop ×0.35 + equality ×0.25 + wellbeing ×0.20 + (100−wcd) ×0.20
reinforcement threshold (score >)                60 → +0.8/turn max
weakening threshold (score <)                    40 → −0.6/turn max + cynicism +0.5

─ Consequence Deficit ────────────────────────────────────────
deficit gain = abusePressure × (1−accountability) × 3.0/turn
deficit recovery = accountability × 2.0/turn
acceleration multiplier = 1.0 + (level/100) × 1.5

─ Thresholds ─────────────────────────────────────────────────
[for each entry in THRESHOLD_DEFINITIONS]:
  [label]: fires when [field] [trigger] [value], cooldown [cooldown] turns

─ Cultural Homogeneity ───────────────────────────────────────
trade dependency drift                           −0.06/turn per 50% above 50%
theocratic governance drift                      +0.10/turn
command/absolute monarchy drift                  +0.08/turn
arts + science freedom drift                     −0.08/turn
homogeneity → inertia contribution               ×0.12
receptivity formula                              1.0 − homogeneity/150 (range 0.33–1.0)

─ Cross-Civilization Contagion ───────────────────────────────
base rate scaling                                CONTAGION_CONFIG.baseRateScaling
cynicism speed factor                            CONTAGION_CONFIG.cynicismSpeedFactor
epistemic health speed factor                    CONTAGION_CONFIG.ehSpeedFactor
min attitude factor                              CONTAGION_CONFIG.minAttitudeFactor
war dampening factor                             CONTAGION_CONFIG.warDampeningFactor
```

Each row is rendered as:
```html
<div class="param-row">
  <span class="param-label">[label]</span>
  <span class="param-value">[value]</span>
  <span class="param-note">[note if any]</span>
</div>
```

The `param-value` span is formatted for future editability: when editability mode is later enabled, this span is replaced with `<input class="param-input" value="[value]" data-param-key="[key]">` and a save handler wires it to the relevant config constant. For now, it is read-only.

**Contagion tab (`_renderContagion`):**
- Dropdown to select which AI civilization to examine (or "All civs overview")
- When a civ is selected: shows `drawContagionChart` for that civ's `contagionHistory`
- Below chart: received influences log (last 10 entries) and emitted influences log
- Note panel: "Contagion values are small per-turn but compound over many turns. Watch the deferred shift queue in the Society → Inertia tab to see when absorbed norms are actually applied."

#### Registration in `game.js`

```js
// After other panel registrations (paradigmShiftsPanel, etc.):
this.researchPanel = null; // initialized lazily on first open
```

**Research button in main HUD (in `ui.js` `renderHUD` or the toolbar section):**
```html
<button id="btn-research-panel" title="Research Mode">🔬 Research</button>
```

On click: lazy-initialize `this.game.researchPanel = new ResearchPanel(this.game)` if null; toggle visibility of a `<div id="research-panel">` overlay panel.

### 3d — "Advanced / Research View" Toggle (inline, per-section)

Rather than a global mode switch, each panel section that has advanced data adds a small button:

```html
<button class="research-view-toggle" data-target="[section-id]">+ Research View</button>
```

When clicked, `classList.toggle('research-view-open')` on the target section div. CSS:
```css
.research-view-section { display: none; }
.research-view-open .research-view-section { display: block; }
```

**Locations to add toggle:**
- `society_panel.js` — Behavioral Inertia tab: reveals homogeneity chart, full inertia chart, contagion summary
- `paradigm_panel.js` — Facilitation tab: reveals structural ceiling chart at full detail + raw facilitation history CSV export
- `society_panel.js` — Power Concentration tab: reveals full deficit chart + accountability event log CSV export

---

## Implementation Order

Execute in this order to minimize dependency issues:

1. `pass9-spec.md` — this file (DONE)
2. `config.js` — append `CONTAGION_CONFIG` after `THRESHOLD_DEFINITIONS`
3. `civilization.js` — add `culturalHomogeneity` and `contagionState` state fields
4. `game.js` — add `researchSeed` generation in `startGame`; register `researchPanel = null`
5. `ui.js` — add Research Seed input to setup wizard final step; add "Research" button to HUD
6. `simulation.js` — add `_initCulturalHomogeneity`, `_processCulturalHomogeneity`, `_processBehavioralContagion`, `_applyContagionPair`, `_logContagionEvent`, `_exportTrack2CSV`; modify `_processInertia` to include homogeneity term; modify `_processFacilitation` to include homogeneity ceiling modifier; call `_processCulturalHomogeneity` in per-civ loop; call `_processBehavioralContagion` after `_processInteractions`
7. `chart_utils.js` — add `drawHomogeneityChart`, `drawContagionChart`
8. `research_panel.js` (NEW FILE) — full ResearchPanel class: Export tab, Parameters tab, Contagion tab
9. `society_panel.js` — add "Advanced / Research View" toggle to Behavioral Inertia tab; add homogeneity sub-section; add contagion summary
10. `paradigm_panel.js` — add "Advanced / Research View" toggle to Facilitation tab
11. `npc.js` — add `civ_contagion` and `cultural_homogeneity` intents
12. `main.css` — contagion styles, research panel styles, param-row, research-view-toggle
13. `TEST_VERIFICATION.md` — Sections 57–72 + Appendix F
14. `current-session.md` — update at each milestone

---

## Files Modified / Created

| File | Change |
|---|---|
| `pass9-spec.md` | NEW — this file |
| `config.js` | Append CONTAGION_CONFIG |
| `civilization.js` | Add culturalHomogeneity, contagionState to this.state |
| `game.js` | researchSeed generation; researchPanel = null |
| `ui.js` | Setup wizard seed input; HUD research button; research panel toggle |
| `simulation.js` | _initCulturalHomogeneity, _processCulturalHomogeneity, _processBehavioralContagion, _applyContagionPair, _logContagionEvent, _exportTrack2CSV; modify _processInertia, _processFacilitation; add to processTurn |
| `chart_utils.js` | drawHomogeneityChart, drawContagionChart |
| `research_panel.js` | NEW — ResearchPanel class (Export + Parameters + Contagion tabs) |
| `society_panel.js` | Research View toggle; homogeneity sub-section; contagion summary |
| `paradigm_panel.js` | Research View toggle in Facilitation tab |
| `npc.js` | 2 new intents: civ_contagion, cultural_homogeneity |
| `main.css` | Contagion, research panel, param-row, research-view-toggle styles |
| `TEST_VERIFICATION.md` | Sections 57–72 + Appendix F |

---

## Design Constraints

- `culturalHomogeneity` is NEVER player-settable. No UI control maps to it directly. Effects are visible only through the systems it modifies and through the Research View.
- Parameter documentation is **read-only** at launch. The `param-row` / `param-value` structure is architecturally ready for editability — when enabled, swap `param-value` spans for `param-input` inputs with a save handler.
- The Research Panel is not counted as a new gameplay panel — it serves researchers only and does not affect game balance.
- All contagion deltas are small per-turn. The simulation should run 30+ turns before contagion produces noticeable effects under typical conditions (tradeDep ~30, attitude neutral). Under high-trade, high-goodwill conditions it may be visible within 10 turns.
- `_exportTrack2CSV` reads from ring buffers, not recomputed data — the export reflects exactly what the ring buffers contain at the moment of export.
- Homogeneity history ring buffer entries include `year` (use `this.game.currentYear`) in addition to `turn`, consistent with all other history ring buffers in the codebase.

---

## Test Coverage (Sections 57–72 + Appendix F)

### Section 57 — Syntax check: all 14 modified/new files
### Section 58 — culturalHomogeneity founding derivation
- Verify theocratic + high religion dominance civ initializes at value > 65
- Verify council_consensus + gift economy + low religion dominance initializes at value < 35
- Verify clamp to 10–90 enforced

### Section 59 — culturalHomogeneity drift mechanics
- Trade dependency > 50: verify value decreases each turn
- Theocratic governance: verify value increases each turn
- Net drift never exceeds ±0.20/turn (verify with extreme case)

### Section 60 — Homogeneity effect on inertia coefficient
- Civ with homogeneity=100 has higher inertia than identical civ with homogeneity=0
- Inertia coefficient difference = approximately 12 points (homogeneity × 0.12)

### Section 61 — Homogeneity effect on facilitation
- Heterogeneous civ (homo=10) shows slightly higher effective ceiling modifier than homo=90 civ

### Section 62 — contagionState initialization
- All fields present: receivedInfluences=[], emittedInfluences=[], contagionHistory=[]
- _p9CoopDelta, _p9CynicismDelta, _p9EHDelta absent at start (they are per-turn scratch — not in state)

### Section 63 — _processBehavioralContagion pair processing
- Two civs with coop=80 and coop=30, attitude=+80, tradeDep=60: verify coop delta applied to deferredShift of low-coop civ
- Single-civ game: verify method returns early (length < 2)
- War relationship: verify near-zero contagion even with high trade

### Section 64 — Contagion speed factors
- Cynicism delta < cooperation delta for identical gap and contact rate
- EH delta < cynicism delta for identical gap and contact rate

### Section 65 — Contagion ring buffer
- After 55 turns, contagionHistory length === 50 (capped correctly)
- receivedInfluences capped at 10

### Section 66 — Theocratic out-group contagion suppression
- Theocratic civ with hostile attitude to neighbor emits lower sourceCoop than its actual cooperation level

### Section 67 — researchSeed generation
- Game.researchSeed is a 10-character string after startGame
- When setupData.researchSeed is provided, game.researchSeed === providedSeed.padStart(10,'0')

### Section 68 — _exportTrack2CSV structure
- Returned CSV contains ## RUN_METADATA section with seed row
- Contains all 13 sections
- File name includes civ name, turn, and seed
- No crash if any ring buffer is empty

### Section 69 — Research Panel render
- ResearchPanel renders without error when game and playerCiv exist
- Export tab renders seed and download button
- Parameters tab renders at least 20 param-row entries

### Section 70 — Parameters tab completeness
- All 5 FACILITATION_MEASURES appear in parameters tab
- All 13 THRESHOLD_DEFINITIONS appear in parameters tab
- CONTAGION_CONFIG values appear in parameters tab

### Section 71 — NPC intent: civ_contagion
- Keyword "cultural contagion" triggers civ_contagion intent
- Leader NPC response references trade routes or sovereignty
- Working class NPC response differs from leader response

### Section 72 — NPC intent: cultural_homogeneity
- Keyword "monoculture" triggers cultural_homogeneity intent
- High-homogeneity civ (>70) triggers conformity-themed response
- Low-homogeneity civ (<30) triggers diversity-themed response

### Appendix F — Smoke Test

Start a 3-civ game with high trade dependency between civs. Advance 20 turns. Verify:
1. Each civ's culturalHomogeneity.value is present and has drifted from initial value
2. Each civ's contagionState.contagionHistory has at least 10 entries
3. At least one civ shows non-zero netCoopDelta in contagionHistory
4. Research Panel opens without error; Export tab shows seed
5. "Download Full CSV" click produces a download with all 13 sections
6. Parameters tab shows CONTAGION_CONFIG.baseRateScaling value
7. Behavioral Inertia tab in Society Panel shows "Research View" toggle
8. toggling Research View reveals homogeneity chart canvas
