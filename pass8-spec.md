# Pass 8 Specification — Behavioral Dynamics & Systemic Accountability

**Status:** Approved by user — implement in full.
**Design principle:** Model the real world as closely as possible.
**Context:** Continuing from Pass 7 (all Pass 7 systems complete and verified).

---

## Overview

Pass 8 adds six interconnected systems that complete the behavioral and institutional dynamics of the simulation:

1. **Behavioral Inertia Weight** — explicit coefficient resisting behavioral change after paradigm shift
2. **Facilitation Measures** — user/system-deployable interventions to accelerate behavioral realignment
3. **Cooperative Self-Reinforcement from Outcomes** — cooperation strengthens or weakens based on material feedback
4. **Threshold and Turning-Point Detection** — richer multi-threshold event system logged to history
5. **Power Concentration Acceleration** — consequence deficit accumulator with multiplicative acceleration
6. **Track 2 Outputs for All Pass 8 Systems** — ring buffers, charts, CSV/PNG/TXT exports, panel tabs

All six systems interact with each other and with Pass 7 state. Pass 8 introduces no new panels — it extends existing panels (paradigm_panel.js gets a new Facilitation tab; society_panel.js gets two new tabs).

---

## System 1 — Behavioral Inertia Weight

### Concept
Behavioral patterns outlast the structures that produced them (Bourdieu's habitus). When a paradigm shift occurs, the `behaviorShift` delta is currently applied immediately at full strength. In reality, old behaviors resist replacement for years or decades.

Pass 8 introduces `behaviorInertia` — an explicit per-behavior coefficient that scales how much of a shift's `behaviorShift` delta actually lands per turn, and how much is deferred.

### State Fields (add to `civilization.js` `this.state`)

```js
// ── Pass 8: Behavioral Inertia ─────────────────────────────────────────────
behaviorInertia: {
  coefficient: 0,          // 0–100; overall inertia level. Higher = slower behavioral change.
  // Deferred behavior shifts (behaviors the new paradigm "wants" but haven't arrived yet)
  deferredShift: {         // keyed by behavior name; value = remaining delta still to be applied
    cooperation: 0, competition: 0, mutualAid: 0, acquisitiveness: 0,
    conformity: 0, innovation: 0, empathy: 0, deference: 0,
    individualism: 0, collectivism: 0,
  },
  inertiaHistory: [],      // ring buffer, last 50 turns: {turn, coefficient, pendingMagnitude}
},
```

### Coefficient Computation (per turn, in `_processInertia()`)

```
inertia = base(0)
  + timeInCurrentModel × 0.5   (cap 30: older model = more ingrained; use _govShiftAge/_econShiftAge)
  + hierarchyEntrenched × 0.3  (0–100 from empathy cascade)
  + wealthCapture.degree × 0.2 (0–100)
  + (100 - educationQuality) × 0.1  (low quality = harder to shift)
  - epistemicHealth × 0.1      (good information environment reduces inertia)
clamp to 0–100
```

**timeInCurrentModel** = `Math.max(s._govShiftAge ?? 0, s._econShiftAge ?? 0)`, capped at 60.

### Deferred Shift Mechanics

When `triggerParadigmShift` is called:
- The `behaviorShift` from the shift definition is **NOT** applied immediately to `behaviorReinforcement`.
- Instead it is **loaded into `deferredShift`** (accumulated, not replaced, in case of overlapping shifts).
- Each turn, `_processInertia()` applies a fraction of each deferred delta:
  ```
  fractionApplied = (1 - inertia/100) × 0.25   // at inertia=0: 25%/turn → ~4 turns full; at inertia=80: 5%/turn → ~20 turns
  ```
  For each behavior key with a non-zero deferred value:
  ```
  apply = Math.sign(deferred[k]) × Math.min(Math.abs(deferred[k]), Math.abs(deferred[k]) × fractionApplied)
  behaviorReinforcement[k] = clamp(behaviorReinforcement[k] + apply, 0, 100)
  deferred[k] -= apply
  if |deferred[k]| < 0.5: deferred[k] = 0
  ```

**Note:** `_applyShiftConsequence` and `_applyStrategyEffect` continue to apply their own deltas immediately (they represent structural changes, not behavioral habits).

### Implementation Note for `triggerParadigmShift`
Replace the immediate `bShift` application loop with a deferred load:
```js
const bShift = shiftDef.behaviorShift || {};
const def = s.behaviorInertia?.deferredShift;
if (def && b) {
  for (const [key, delta] of Object.entries(bShift)) {
    if (def[key] !== undefined) def[key] = (def[key] ?? 0) + delta;
  }
}
```

### Track 2 Export
- Ring buffer: `inertiaHistory` — 50 turns of `{turn, coefficient, pendingMagnitude}`
- `pendingMagnitude` = sum of `|deferredShift[k]|` across all behaviors
- CSV columns: turn, coefficient, pendingMagnitude
- TXT: "Behavioral Inertia Report" — current coefficient, drivers, pending shifts
- PNG chart: dual-axis line — coefficient (left) and pendingMagnitude (right) over time

---

## System 2 — Facilitation Measures

### Concept
After a paradigm shift, deliberate interventions can accelerate behavioral realignment. These are mechanically distinct from propaganda:

| Feature | Facilitation | Propaganda |
|---|---|---|
| Works through | Epistemic Health as amplifier | Epistemic Health suppression |
| Ceiling | Bounded by structural conditions | Bypasses structural conditions (suppresses EH) |
| Effect on EH | Neutral or slight positive | Negative (suppresses critical thinking) |
| Reversal | Behaviors revert slowly if conditions persist | Cynicism and dissonance spike if discovered |
| Real-world analog | Civic workshops, peer demonstration | State media, manufactured consensus |

**Key design rule:** Facilitation effectiveness is bounded by structural conditions. If the economic model fundamentally punishes cooperation, facilitation alone cannot make cooperation dominant — it can only accelerate convergence toward what structural conditions support. The structural ceiling is computed from the economic model's `behaviorModifiers` + current `wealthCapture.degree`.

### New Config Data — `FACILITATION_MEASURES` (add to `config.js`)

```js
const FACILITATION_MEASURES = [
  {
    id: 'civic_education_workshops',
    label: 'Civic Education Workshops',
    description: 'Structured educational programs teaching civic participation, rights, and social responsibilities.',
    category: 'education',
    cost: 15,                   // resource cost per turn active
    durationTurns: 10,          // turns to run; 0 = indefinite
    effects: {
      cynicismReduction: 3,       // per turn, subject to EH amplifier
      gapNarrowingRate: 0.04,     // fraction of gap narrowed per turn
      cooperationBoost: 0.5,      // per turn to deferred cooperation shift
      ehRequirement: 35,          // minimum epistemicHealth for any effect
      structuralCeiling: true,    // respect structural behavior ceiling
    },
    propagandaRisk: 0,            // 0 = clean; 1 = increases cynicism if EH < 25
    unavailableWhen: ['feudalDynamic'],  // blocked if feudalDynamic is true
  },
  {
    id: 'community_forums',
    label: 'Community Deliberation Forums',
    description: 'Facilitated public spaces for collective problem-solving and shared sense-making.',
    category: 'civic',
    cost: 8,
    durationTurns: 0,
    effects: {
      cynicismReduction: 1.5,
      gapNarrowingRate: 0.025,
      cooperationBoost: 0.8,
      mutualAidBoost: 0.5,
      ehRequirement: 25,
      structuralCeiling: true,
    },
    propagandaRisk: 0,
    unavailableWhen: [],
  },
  {
    id: 'peer_demonstration',
    label: 'Peer Demonstration Programs',
    description: 'Visible, replicable examples of cooperative behavior generating better outcomes.',
    category: 'civic',
    cost: 5,
    durationTurns: 0,
    effects: {
      cynicismReduction: 2,
      cooperationBoost: 1.2,
      mutualAidBoost: 0.8,
      ehRequirement: 20,
      structuralCeiling: true,
    },
    propagandaRisk: 0,
    unavailableWhen: [],
  },
  {
    id: 'media_messaging_campaign',
    label: 'Media Messaging Campaign',
    description: 'Information campaigns through public media reinforcing new paradigm values. Effectiveness depends heavily on epistemic health.',
    category: 'media',
    cost: 20,
    durationTurns: 5,
    effects: {
      cynicismReduction: 2,
      gapNarrowingRate: 0.05,
      cooperationBoost: 0.3,
      ehRequirement: 40,          // higher requirement — low EH → propaganda risk
      structuralCeiling: true,
    },
    propagandaRisk: 1,            // if EH < 30, generates +cynicism instead
    unavailableWhen: [],
  },
  {
    id: 'economic_incentive_alignment',
    label: 'Economic Incentive Realignment',
    description: 'Policy changes that make cooperative behaviors economically rewarding under the new model.',
    category: 'economic',
    cost: 30,
    durationTurns: 0,
    effects: {
      cooperationBoost: 2.0,
      acquisitivenessReduction: 1.0,
      cynicismReduction: 1.0,
      ehRequirement: 0,           // structural, not epistemic — always works
      structuralCeiling: false,   // this IS a structural change; doesn't respect structural ceiling
    },
    propagandaRisk: 0,
    unavailableWhen: ['feudalDynamic'],
  },
];
```

### State Fields (add to `civilization.js` `this.state`)

```js
// ── Pass 8: Facilitation Measures ─────────────────────────────────────────
facilitationState: {
  activeMeasures: [],   // [{measureId, turnsActive, turnsRemaining, totalEffect}]
  structuralCeiling: {  // computed per turn; behavior-level ceiling from structural conditions
    cooperation: 100, competition: 100, mutualAid: 100, acquisitiveness: 100,
    conformity: 100, innovation: 100, empathy: 100, deference: 100,
    individualism: 100, collectivism: 100,
  },
  facilitationHistory: [], // ring buffer 50 turns: {turn, measuresActive, totalCynicismReduction, totalCoopBoost}
},
```

### Per-Turn Processing (`_processFacilitation()`)

1. **Compute structural ceiling** per behavior key:
   - Start from economic model's `behaviorModifiers` max (scaled to 0–100)
   - Reduce by `wealthCapture.degree`: ceiling = max * (1 - wealthCapture.degree/100 * 0.6)
   - This prevents facilitation from creating behaviors the economic model actively punishes

2. **For each active measure:**
   - Check `unavailableWhen` conditions; deactivate if triggered
   - Compute EH amplifier: `ehAmp = clamp(epistemicHealth / 60, 0, 1.5)` (EH=60 → 1.0x; EH=90 → 1.5x; EH=30 → 0.5x)
   - Check `ehRequirement`; if not met, skip behavioral effects (cynicismReduction still 50%)
   - Check `propagandaRisk`: if EH < 30 and `propagandaRisk > 0`, apply +cynicismLevel instead of -
   - Apply `cynicismReduction × ehAmp / durationTurns` to `culturalGap.cynicismLevel`
   - Apply `gapNarrowingRate × ehAmp` to reinforced values (pull toward stated values)
   - Apply `cooperationBoost × ehAmp` to `deferredShift.cooperation` (not direct — still subject to inertia)
   - If `structuralCeiling: false`: apply cooperation boost directly to `behaviorReinforcement`
   - If `structuralCeiling: true`: cap result at `facilitationState.structuralCeiling.cooperation`
   - Decrement `turnsRemaining`; remove if `durationTurns > 0` and `turnsRemaining <= 0`

3. **Log to ring buffer** `facilitationHistory`; cap at 50 entries.

### UI — Facilitation Tab in `paradigm_panel.js`

New 5th tab: "Facilitation"
- **Left column:** Available measures list with status (available/active/blocked), cost, description, "Activate" button
- **Right column:** Active measures with progress bar, turns remaining, real-time effect display
- **Bottom:** Structural ceiling bar chart (per-behavior ceiling vs. current value)
- **Exports:** CSV (facilitationHistory), TXT (active measures summary), PNG (structural ceiling chart)

---

## System 3 — Cooperative Self-Reinforcement from Outcomes

### Concept
The E×R system (Pass 7) classifies virtuous/vicious/conflicted/neutral loops but doesn't close the feedback through material outcomes. Real-world cooperation strengthens when it produces material gains for cooperators; it weakens when gains flow only to elites despite cooperative effort.

This system adds an outcomes-feedback mechanism that modifies `deferredShift.cooperation` based on whether cooperative behavior is materially rewarded under the current economic model.

### Cooperation Outcomes Index

Computed each turn in `_processCooperativeOutcomes()`:

```
coopOutcomeScore = 0
  + (economic model's cooperation modifier, normalized 0-100) × 0.35
  + (equalityIndex) × 0.25
  + (averageWellbeing) × 0.20
  + (100 - wealthCapture.degree) × 0.20
clamp to 0–100
```

Interpretation:
- `coopOutcomeScore > 60` → cooperative behavior is materially rewarded → reinforce
- `coopOutcomeScore 40–60` → neutral; no feedback
- `coopOutcomeScore < 40` → cooperative effort flows to elite captures → weaken

### Reinforcement/Weakening Logic

```js
const currentCoop = s.behaviorReinforcement.cooperation ?? 50;
const baseline = 50; // neutral reference

if (coopOutcomeScore > 60) {
  const boost = (coopOutcomeScore - 60) / 40 × 0.8;   // max +0.8/turn
  s.behaviorInertia.deferredShift.cooperation += boost;
} else if (coopOutcomeScore < 40) {
  const drain = (40 - coopOutcomeScore) / 40 × 0.6;   // max -0.6/turn
  s.behaviorInertia.deferredShift.cooperation -= drain;
  // Also apply direct cynicism pressure
  s.culturalGap.cynicismLevel = clamp(cynicism + (40 - coopOutcomeScore) / 100 × 0.5, 0, 100);
}
```

The deferred shift mechanism (System 1) then applies this at the inertia-modulated rate.

### State Fields (add to `this.state`)

```js
// ── Pass 8: Cooperative Outcomes ───────────────────────────────────────────
cooperativeOutcomes: {
  coopOutcomeScore: 50,      // 0–100: how much cooperation is materially rewarded
  feedback: 'neutral',       // 'reinforcing'|'neutral'|'weakening'
  feedbackMagnitude: 0,      // 0–1: strength of this turn's feedback
  cumulativeReinforcement: 0,// net accumulated reinforcement (+ = net positive over time)
  history: [],               // ring buffer 50 turns: {turn, score, feedback, magnitude}
},
```

### Track 2 Export
- CSV: turn, coopOutcomeScore, feedback, magnitude, cumulativeReinforcement
- TXT: summary of current feedback state and dominant driver
- PNG: line chart — coopOutcomeScore vs. behaviorReinforcement.cooperation over time (dual line)

---

## System 4 — Threshold and Turning-Point Detection

### Concept
Currently only one threshold fires an event: `readiness > 85 + stability < 20`. Pass 8 adds a rich multi-threshold detection system across all major state dimensions. Thresholds are named, logged to history with type and context, and displayed in a new panel tab. Some thresholds fire once; others are level-based and can fire repeatedly.

### Threshold Definitions (in `config.js` as `THRESHOLD_DEFINITIONS`)

```js
const THRESHOLD_DEFINITIONS = [
  // Cultural Gap / Cynicism thresholds
  { id: 'cynicism_rising',     label: 'Cynicism Rising',          field: 'culturalGap.cynicismLevel',     trigger: '>=', value: 40,  oneShot: false, cooldown: 15, color: '#f59e0b', severity: 'info',    text: (s) => `Cynicism is rising — ${Math.round(s.culturalGap.cynicismLevel)}% of the population has lost confidence in stated values. Cultural dissonance is becoming systemic.` },
  { id: 'cynicism_critical',   label: 'Cynicism Critical',        field: 'culturalGap.cynicismLevel',     trigger: '>=', value: 70,  oneShot: false, cooldown: 20, color: '#ef4444', severity: 'warning', text: (s) => `Critical cynicism level reached (${Math.round(s.culturalGap.cynicismLevel)}%). Revolutionary consciousness is forming. Paradigm change pressure is mounting.` },
  { id: 'cynicism_collapse',   label: 'Social Contract Collapse', field: 'culturalGap.cynicismLevel',     trigger: '>=', value: 90,  oneShot: false, cooldown: 25, color: '#dc2626', severity: 'crisis',  text: (s) => `Social contract collapse: cynicism at ${Math.round(s.culturalGap.cynicismLevel)}%. Collective disillusionment is near-total. Systemic change or failed-state conditions are likely.` },

  // Empathy thresholds
  { id: 'elite_empathy_floor', label: 'Elite Empathy Floor',      field: 'empathyByStratum.elite',        trigger: '<=', value: 20,  oneShot: false, cooldown: 20, color: '#ef4444', severity: 'warning', text: (s) => `Elite empathy has fallen to floor level (${Math.round(s.empathyByStratum?.elite ?? 0)}%). The ruling stratum has functionally decoupled its psychology from mass welfare. Structural abuse is likely.` },
  { id: 'empathy_inversion',   label: 'Empathy Inversion',        field: null, oneShot: false, cooldown: 20, color: '#dc2626', severity: 'crisis',
    customCheck: (s) => (s.empathyByStratum?.elite ?? 50) < (s.empathyByStratum?.disenfranchised ?? 50) - 40,
    text: (s) => `Empathy inversion detected: disenfranchised populations show dramatically higher empathy than elites. Structural inequality is generating moral divergence across strata.` },

  // Wealth capture thresholds
  { id: 'capture_entrenched',  label: 'Wealth Capture Entrenched',field: 'wealthCapture.degree',           trigger: '>=', value: 50,  oneShot: false, cooldown: 20, color: '#f97316', severity: 'warning', text: (s) => `Wealth capture has reached ${Math.round(s.wealthCapture?.degree ?? 0)}% — institutional governance is now significantly compromised. Democratic accountability faces structural barriers.` },
  { id: 'feudal_dynamic',      label: 'Feudal Dynamic Active',    field: 'wealthCapture.feudalDynamic',    trigger: '===', value: true, oneShot: false, cooldown: 30, color: '#dc2626', severity: 'crisis',  text: (s) => `Feudal dynamic has activated: wealth concentration exceeds 75% and capture degree exceeds 80%. Economic and political power have effectively merged into a hereditary hierarchy.` },

  // Cooperation thresholds
  { id: 'coop_tipping_up',     label: 'Cooperation Tipping Point (Rise)',  field: 'behaviorReinforcement.cooperation', trigger: '>=', value: 70, oneShot: false, cooldown: 20, color: '#22c55e', severity: 'info', text: (s) => `Cooperation has crossed a positive tipping point (${Math.round(s.behaviorReinforcement?.cooperation ?? 50)}%). Self-reinforcing cooperative norms are stabilizing. Mutual aid infrastructure is strengthening.` },
  { id: 'coop_tipping_down',   label: 'Cooperation Tipping Point (Fall)', field: 'behaviorReinforcement.cooperation', trigger: '<=', value: 30, oneShot: false, cooldown: 20, color: '#ef4444', severity: 'warning', text: (s) => `Cooperation has collapsed below critical threshold (${Math.round(s.behaviorReinforcement?.cooperation ?? 50)}%). Competitive and acquisitive behaviors are becoming dominant. Social cohesion is at risk.` },

  // Power concentration (consequence deficit — System 5)
  { id: 'deficit_accumulating',label: 'Consequence Deficit Accumulating', field: 'consequenceDeficit.level', trigger: '>=', value: 40, oneShot: false, cooldown: 15, color: '#f59e0b', severity: 'info', text: (s) => `Consequence deficit is accumulating (${Math.round(s.consequenceDeficit?.level ?? 0)}%). Unchecked abuse of power is reducing the expected cost of further abuses. Power concentration is accelerating.` },
  { id: 'deficit_critical',    label: 'Consequence Deficit Critical',     field: 'consequenceDeficit.level', trigger: '>=', value: 75, oneShot: false, cooldown: 20, color: '#dc2626', severity: 'crisis', text: (s) => `Critical consequence deficit (${Math.round(s.consequenceDeficit?.level ?? 0)}%). Accountability mechanisms have failed. Power concentration is entering a self-reinforcing acceleration phase.` },

  // Paradigm shift readiness
  { id: 'shift_readiness_high',label: 'Paradigm Shift Readiness: High',   field: 'culturalGap.paradigmShiftReadiness', trigger: '>=', value: 60, oneShot: false, cooldown: 15, color: '#a855f7', severity: 'info', text: (s) => `Paradigm shift readiness has reached ${Math.round(s.culturalGap?.paradigmShiftReadiness ?? 0)}%. Structural conditions and collective consciousness are aligning. The existing order is increasingly unstable.` },
  { id: 'shift_imminent',      label: 'Paradigm Shift Imminent',          field: 'culturalGap.paradigmShiftReadiness', trigger: '>=', value: 85, oneShot: false, cooldown: 20, color: '#dc2626', severity: 'crisis', text: (s) => `Paradigm shift is imminent. Readiness at ${Math.round(s.culturalGap?.paradigmShiftReadiness ?? 0)}%. The existing political-economic arrangement cannot sustain the weight of accumulated contradictions.` },

  // Behavioral inertia
  { id: 'inertia_extreme',     label: 'Extreme Behavioral Inertia',       field: 'behaviorInertia.coefficient', trigger: '>=', value: 80, oneShot: false, cooldown: 20, color: '#f97316', severity: 'warning', text: (s) => `Behavioral inertia has reached extreme levels (${Math.round(s.behaviorInertia?.coefficient ?? 0)}%). Old behavioral patterns have become deeply entrenched. Paradigm shifts will have minimal immediate effect without facilitation measures.` },

  // Epistemic Health
  { id: 'eh_critical',         label: 'Epistemic Health Critical',        field: 'epistemicHealth', trigger: '<=', value: 25, oneShot: false, cooldown: 20, color: '#ef4444', severity: 'crisis', text: (s) => `Epistemic health is critically low (${Math.round(s.epistemicHealth ?? 50)}%). The information environment is severely compromised. Facilitation measures are largely ineffective. Propaganda dominates public discourse.` },
];
```

### State Fields (add to `this.state`)

```js
// ── Pass 8: Threshold Detection ───────────────────────────────────────────
thresholdEvents: {
  fired: [],     // [{thresholdId, turn, year, label, text, severity, color}] — last 50
  _cooldowns: {}, // {thresholdId: turnsUntilNextFire}
},
```

### Per-Turn Processing (`_processThresholds(civ)`)

For each definition in `THRESHOLD_DEFINITIONS`:
1. Check cooldown — skip if in cooldown
2. Evaluate trigger:
   - If `customCheck`: call `customCheck(s)`
   - Else: resolve field path from dot notation, compare with trigger operator
3. If triggered:
   - Push to `thresholdEvents.fired` (cap at 50)
   - Push to `civ.history` with appropriate color/severity
   - Set cooldown for this threshold
4. Decrement all cooldowns by 1

### UI — Thresholds Tab in `paradigm_panel.js`

New 6th tab: "Thresholds" (comes after Facilitation)
- **Dashboard section:** Current values for all monitored dimensions (small value cards)
- **Event log:** Scrollable list of recent threshold events (severity-colored, turn/year labeled)
- **Active warnings:** Highlighted cards for thresholds currently exceeded
- **Exports:** CSV (thresholdEvents.fired), TXT (current threshold status report)

---

## System 5 — Power Concentration Acceleration

### Concept
Unchecked abuse of power reduces the expected cost of future abuse (empirically: impunity is self-reinforcing). Each turn that corruption, wealth capture, or hierarchy abuse goes without accountability, the future accumulation rate increases multiplicatively. Institutional mechanisms (IQ, EH, opposition) can interrupt the cycle.

### The Consequence Deficit Model

**Consequence deficit** = accumulated impunity. Each turn without accountability, deficit grows. With deficit, power concentration (corruption + wealth capture) accumulates faster.

### State Fields (add to `this.state`)

```js
// ── Pass 8: Consequence Deficit ───────────────────────────────────────────
consequenceDeficit: {
  level: 0,                // 0–100: accumulated impunity level
  accelerationMultiplier: 1.0, // ≥1.0; multiplies rate of corruption+capture growth
  turnsWithoutAccountability: 0, // consecutive turns where accountability failed
  lastAccountabilityEvent: null, // turn of last interruption
  accountabilityHistory: [],     // [{turn, type, deficitBefore, deficitAfter}]
  deficitHistory: [],            // ring buffer 50 turns: {turn, level, multiplier}
},
```

### Per-Turn Processing (`_processConsequenceDeficit(civ)`)

**Step 1: Evaluate accountability conditions**

Accountability occurs when:
- `institutionalQuality > 65` AND `epistemicHealth > 50` → strong accountability; deficit drops
- `institutionalQuality > 45` AND `epistemicHealth > 40` → weak accountability; deficit stable or slight drop
- Otherwise: no accountability; deficit rises

**Step 2: Update deficit**

```js
const iq  = s.institutionalQuality ?? 50;
const eh  = s.epistemicHealth ?? 50;
const wcd = s.wealthCapture?.degree ?? 0;
const corr = s.corruptionIndex ?? 0;

// Accountability strength: 0 = none, 1 = perfect
const accountabilityStrength = clamp((iq - 30) / 70 × 0.6 + (eh - 30) / 70 × 0.4, 0, 1);

// Abuse pressure (how much unchecked abuse is occurring)
const abusePressure = clamp((wcd / 100 × 0.5 + corr / 100 × 0.5), 0, 1);

// Deficit change this turn
const deficitGain = abusePressure × (1 - accountabilityStrength) × 3.0;   // max +3/turn
const deficitLoss = accountabilityStrength × 2.0;                           // max -2/turn (recovery is slower than accumulation)
const deficitDelta = deficitGain - deficitLoss;

s.consequenceDeficit.level = clamp(s.consequenceDeficit.level + deficitDelta, 0, 100);
```

**Step 3: Compute acceleration multiplier**

```js
// Multiplicative: at deficit=0 → 1.0x; at deficit=50 → 1.5x; at deficit=100 → 2.5x
s.consequenceDeficit.accelerationMultiplier = 1.0 + (s.consequenceDeficit.level / 100) × 1.5;
```

**Step 4: Apply multiplier to corruption and wealth capture**

In `_processWealthCapture()` and wherever `corruptionIndex` grows:
- Multiply the per-turn growth rate by `consequenceDeficit.accelerationMultiplier`
- Example: if corruption would rise by 0.5/turn normally → rises by `0.5 × multiplier` instead

**Step 5: Accountability events**

When `accountabilityStrength > 0.7` AND `consequenceDeficit.level > 20`:
- Log accountability event to `accountabilityHistory` and `civ.history`
- Deficit drops by extra 10 this turn (accountability breakthrough)

When deficit drops below 20 after being above 50: log "accountability restored" event.

**Step 6: Track `turnsWithoutAccountability`**

- If `accountabilityStrength < 0.3`: increment `turnsWithoutAccountability`
- Else: reset to 0; update `lastAccountabilityEvent`

### Cross-Effects

- `consequenceDeficit.level > 70`: additional `institutionalQuality −0.5/turn` (institutions erode under persistent impunity)
- `consequenceDeficit.level > 50`: additional `epistemicHealth −0.3/turn` (captured media amplifies impunity)
- `consequenceDeficit.level > 80`: `feudalDynamic` evaluation window expanded (more sensitive to feudal activation)

### UI — New Tab in `society_panel.js`

New 5th tab: "Power Concentration"
- **Accountability meter:** bar showing `accountabilityStrength` (real-time)
- **Deficit gauge:** large bar showing `consequenceDeficit.level` with color (green→amber→red)
- **Multiplier display:** current `accelerationMultiplier` value (e.g., "1.73×")
- **Timeline chart:** deficit level over time (line chart, 50 turns)
- **Event log:** accountability events and deficit milestones
- **Exports:** CSV (deficitHistory), TXT (summary), PNG (deficit timeline chart)

---

## System 6 — Track 2 Outputs for All Pass 8 Systems

Each system above already specifies its own ring buffers and exports. This section defines the unified export infrastructure added to panels.

### Ring Buffers (all 50-turn cap with `.shift()`)

| System | Buffer name | Fields |
|---|---|---|
| Behavioral Inertia | `behaviorInertia.inertiaHistory` | turn, coefficient, pendingMagnitude |
| Facilitation | `facilitationState.facilitationHistory` | turn, measuresActive, totalCynicismReduction, totalCoopBoost |
| Cooperative Outcomes | `cooperativeOutcomes.history` | turn, score, feedback, magnitude |
| Threshold Events | `thresholdEvents.fired` | turn, year, thresholdId, label, severity |
| Consequence Deficit | `consequenceDeficit.deficitHistory` | turn, level, multiplier |

### Export Formats

All exports follow the existing Track 2 pattern:
- **CSV:** `Blob` + `URL.createObjectURL`; mime `text/csv`
- **TXT:** `Blob` + `URL.createObjectURL`; mime `text/plain`
- **PNG:** `ChartUtils.exportPNG(canvas, filename)`

### New Chart Types Needed in `chart_utils.js`

- `drawInertiaChart(ctx, canvas, inertiaHistory)` — dual-axis line: coefficient (left) + pendingMagnitude (right); colors: #38bdf8 / #f97316
- `drawCoopOutcomesChart(ctx, canvas, coopHistory, brCoopHistory)` — dual line: coopOutcomeScore vs. cooperation BR; colors: #22c55e / #38bdf8
- `drawDeficitChart(ctx, canvas, deficitHistory)` — line chart with fill; color: #ef4444 (red fill at high levels, amber at medium, green at low)
- `drawFacilitationCeilingChart(ctx, canvas, ceiling, current)` — horizontal grouped bar chart: ceiling vs. current per behavior

---

## Implementation Plan

### Order of File Changes

1. **config.js** — add `FACILITATION_MEASURES`, `THRESHOLD_DEFINITIONS`; add any new INERTIA constants
2. **civilization.js** — add all Pass 8 state fields to `this.state`; update `triggerParadigmShift` call note (handled in simulation.js)
3. **simulation.js** — add 5 new per-turn methods + modify existing methods:
   - `_processInertia(civ)` — System 1
   - `_processFacilitation(civ)` — System 2
   - `_processCooperativeOutcomes(civ)` — System 3
   - `_processThresholds(civ)` — System 4
   - `_processConsequenceDeficit(civ)` — System 5
   - Modify `triggerParadigmShift` — load bShift into deferred instead of immediate
   - Modify `_processWealthCapture` — apply accelerationMultiplier
   - Add all 5 new methods to the main `processTurn` call chain
4. **chart_utils.js** — 4 new chart methods
5. **paradigm_panel.js** — add Facilitation tab (5th), Thresholds tab (6th)
6. **society_panel.js** — add Power Concentration tab (5th), Behavioral Inertia tab (6th)
7. **npc.js** — new intents: `behavioral_inertia`, `power_impunity`, `facilitation_optimism`, `facilitation_cynicism`
8. **index.html** — no new panels; existing panels extended
9. **game.js** — wire facilitation measure activation (new player action: `activate_facilitation_measure`)
10. **main.css** — styles for new tabs and UI elements
11. **TEST_VERIFICATION.md** — Pass 8 supplement (Sections 40+)

### New Player Actions (game.js event handlers)

```js
'activate_facilitation_measure':  { measureId } → calls simulation.activateFacilitationMeasure(civ, measureId)
'deactivate_facilitation_measure': { measureId } → calls simulation.deactivateFacilitationMeasure(civ, measureId)
```

Public methods on `Simulation`:
```js
activateFacilitationMeasure(civ, measureId)   // validate, check cost, add to activeMeasures
deactivateFacilitationMeasure(civ, measureId) // remove from activeMeasures
```

---

## State Field Summary (for civilization.js)

```js
// Pass 8 — add to this.state:
behaviorInertia: {
  coefficient: 0,
  deferredShift: { cooperation:0, competition:0, mutualAid:0, acquisitiveness:0, conformity:0, innovation:0, empathy:0, deference:0, individualism:0, collectivism:0 },
  inertiaHistory: [],
},
facilitationState: {
  activeMeasures: [],
  structuralCeiling: { cooperation:100, competition:100, mutualAid:100, acquisitiveness:100, conformity:100, innovation:100, empathy:100, deference:100, individualism:100, collectivism:100 },
  facilitationHistory: [],
},
cooperativeOutcomes: {
  coopOutcomeScore: 50,
  feedback: 'neutral',
  feedbackMagnitude: 0,
  cumulativeReinforcement: 0,
  history: [],
},
thresholdEvents: {
  fired: [],
  _cooldowns: {},
},
consequenceDeficit: {
  level: 0,
  accelerationMultiplier: 1.0,
  turnsWithoutAccountability: 0,
  lastAccountabilityEvent: null,
  accountabilityHistory: [],
  deficitHistory: [],
},
```

---

## NPC Commentary — Pass 8 Intents

### Intent: `behavioral_inertia`
Triggered when: `behaviorInertia.coefficient > 60` OR `deferredShift` sum > 15

Social position variants:
- **working_class/disenfranchised:** "The words changed. The habits didn't. You can't switch how people think overnight — they've been this way for years."
- **leader/elite:** "People will adjust in time. Change takes generations, not policy announcements."
- **middle (lower_middle/upper_middle):** "I've noticed the official line is different now. But people still act the same way they always did. Ideas move slower than rules."

### Intent: `power_impunity`
Triggered when: `consequenceDeficit.level > 50` OR `turnsWithoutAccountability > 8`

Variants:
- **disenfranchised:** "Nobody's been held accountable in a long time. After a while, people start to notice that they can do anything. And then they do."
- **leader/elite:** "The system works for those who understand how to use it. That's not injustice — that's how things have always worked."
- **lower_middle/working_class:** "We keep waiting for someone to face consequences. They never do. That's not a coincidence."

### Intent: `facilitation_optimism`
Triggered when: facilitation measure is active AND `cynicismLevel < 50`

Variants:
- "The workshops actually helped me understand what was changing and why. I hadn't thought about it that way before."
- "I was skeptical, but seeing it work in our neighborhood made a difference."
- "It's not just talk — they showed us what it looks like in practice."

### Intent: `facilitation_cynicism`
Triggered when: facilitation measure has `propagandaRisk > 0` AND `epistemicHealth < 35`

Variants:
- "I've seen these 'educational campaigns' before. You can dress it up any way you want. It's still messaging."
- "Who's funding the outreach? Ask that first. Then listen to what they're saying."
- "The message is fine. I'm just less sure who benefits from me believing it."

---

## Design Constraints (Carry Into Implementation)

1. **Facilitation never substitutes for structural conditions** — always check structural ceiling; measures that set `structuralCeiling: false` are explicitly labeled as structural interventions (economic realignment), not epistemic ones.

2. **Inertia is real** — the deferred shift mechanism means no paradigm shift produces instant behavioral change. Even at inertia=0, full shift takes ~4 turns. At inertia=80, 20 turns. This is intentional and realistic.

3. **Consequence deficit is asymmetric** — deficit accumulates faster than it recovers (3.0/turn gain vs. 2.0/turn recovery). This reflects how impunity compounds more easily than accountability is rebuilt.

4. **Threshold cooldowns prevent event spam** — minimum 15-turn cooldown on all thresholds. This is important: thresholds at a sustained level should fire at most every 15–30 turns, not every turn.

5. **Propaganda risk is real** — if media messaging campaign runs when EH < 30, it backfires and increases cynicism. This is not a bug; it is the designed behavior.

6. **All behavior effects go through deferredShift** unless the measure has `structuralCeiling: false` — this ensures inertia is respected by all behavioral change pathways.
