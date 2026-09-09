# IQ Dynamics Interaction Map

Reference document for calibration troubleshooting. Maps the key variables, feedback loops, attractor basins, and coefficient values that drive institutional quality (IQ) dynamics in the simulation.

## Core State Variables

| Variable | Range | WGI Proxy | Role |
|----------|-------|-----------|------|
| **IQ** (Institutional Quality) | 0-100 | 50 + 20*GovEff | Primary calibration target |
| **Cap** (State Capacity) | 0-100 | ~GovEff-derived | Bureaucratic infrastructure |
| **Corruption** (corruptionLevel) | 0-100 | 50 - 20*CoC | Institutional rent extraction |
| **Stability** | 0-100 | Stochastic | Crisis/recovery cycles |
| **WC** (Wealth Concentration) | 0-100 | ~Gini proxy | Elite capture potential |
| **Hierarchy** | 0-100 | Power concentration | Authoritarian vs distributed |
| **Freedom** | 0-100 | Civil liberties | Accountability mechanisms |

## BUG STATUS: Acquisitiveness vs corruptionLevel — FIXED

**Previously**: Line 4819 used `acquisitiveness` (behavioral metric, rarely updated) instead of `corruptionLevel`, making corruption-differentiated IQ channels inert.

**Current state (September 2026)**: Line 4977 now correctly uses `civ.state.corruptionLevel ?? 50`. All corruption-threshold channels (extractive at line 5105, trust-corruption inclusive at line 5201) use the actual corruption value. Denmark (corr=7) and Nigeria (corr=68) now receive properly differentiated corruption channel contributions.

## IQ Inclusive Channels (what actually fires)

| Channel | Condition | Magnitude | Countries affected |
|---------|-----------|-----------|-------------------|
| Distributed power | effectivePowerConc < 50 | +0.4 * (50-ePC)/50 * maturity | Denmark, USA |
| Civilian control | civControl > 60 | +0.3 | Denmark, USA, Singapore |
| Education | education > 60 | +0.4 | Denmark, USA, Singapore |
| Social trust | trust > 60 | +0.3 | Denmark, maybe Singapore |
| Epistemic health | EP > 60 | +0.2 | Denmark, USA |
| Legitimacy | legitimacy > 65 | +0.2 | Most countries at high leg |
| Auth state-building | powerConc > 50 AND cap > 40 | +0.6 * hier * cap * corrBuild | Singapore, China |
| WC reform pressure | wc > 70 | +0.5 * (wc-70)/30 | Extreme inequality only |

**Typical inclusive totals**: Denmark ~1.56, USA ~1.51, Singapore ~1.37, China ~0.6

## IQ Extractive Channels

| Channel | Condition | Magnitude | Notes |
|---------|-----------|-----------|-------|
| Corruption extractive | corruptionLevel > 30 | +0.5 * min((corr-30)/30, 1) | Properly differentiated (bug fixed) |
| Power concentration | effectivePowerConc > 50 | +0.4 * (ePC-50)/50 | Singapore, China, Russia, Saudi |
| Freedom < 30 | freedom < 30 | +0.5 * corrLevel/60 | Russia, Saudi, China, Nigeria |
| WC > 55 extractive | wc > 55 | +0.7-1.3 * powerOverlap | High-WC democracies |
| War | atWar | +1.5 | Intermittent |
| Religious dominance | relDom > 50 | +0.15 * (relDom-50)/50 | Saudi, some others |

## IQ Dampening Mechanisms

| Mechanism | Condition | Magnitude | Purpose |
|-----------|-----------|-----------|---------|
| Persistence drag | IQ > 75 | -0.1/turn | Mean reversion |
| Olson sclerosis | IQ > 80 | -(IQ-80)² * 0.008/turn | Diminishing returns |
| Democratic capture | WC > 40 AND IQ > 60 | -4.5 * partOpen * sqrt(wcFrac) * iqExcess | Elite capture (Gilens & Page) |
| Lock-in drag | lockIn > 50 | Variable | Institutional ossification |
| IQ floor pull | IQ < floor | +0.5*(floor-IQ) | Minimum viable institutions |

## Feedback Loops

### Loop 1: Corruption-IQ Bistability (THE core structural issue)
```
Low corruption → weak iqDamp on corr generation → corruption stays low → IQ rises
  → more enforcement → even lower corruption → RUNAWAY TO HIGH ATTRACTOR

High corruption → extractive pressure → IQ declines → less enforcement
  → higher corruption → RUNAWAY TO LOW ATTRACTOR
```
**No stable equilibrium at moderate IQ (60-70).** China's target sits in the unstable zone.

### Loop 2: Stability-IQ Virtuous Cycle
```
High stability → trust-corruption inclusive channel (trust > 45 AND corruption < 50 AND iq > 40)
  → IQ rises → more enforcement → lower corruption → reinforces stability
```
**Active** since the acquisitiveness bug fix. The trust-corruption channel at line 5201 now fires properly for low-corruption states.

### Loop 3: Cap-IQ Positive Feedback
```
IQ > 65 → cap builds at +0.3/turn → higher cap → more cap-based inclusive → more IQ
```
Amplifies the high attractor for all developmental states.

### Loop 4: Coup Cascade (hierarchical states)
```
Stab < 30 → coup risk → coup fires → hier increases (60→80)
  → more extractive from power concentration → IQ declines
  → less stability recovery → more time at low stab → more coup risk
```
**Primary mechanism suppressing Singapore IQ.** Addressed by corruption-gated coup resistance (IQ>70 AND corr<30).

### Loop 5: Democratic Capture (open democracies)
```
High IQ → growth → WC increases → elite capture → IQ dragged down
```
Calibrated with coefficient 4.5, sqrt scaling, threshold WC>40. Voluntary participation only (restricted=0.0).

## Attractor Basins

### HIGH (IQ ~90+, Corr ~5, Cap ~90)
- Denmark, Singapore target
- Self-reinforcing through Loop 1 and Loop 3
- Stable: small perturbations return to basin
- **Risk**: coup cascade can eject (Singapore issue)

### LOW (IQ ~25, Corr ~70, Cap ~30)
- Nigeria
- Self-reinforcing: high corruption prevents institutional development
- Stable: IQ floor prevents further decline

### UNSTABLE MIDDLE (IQ ~60-75, Corr ~40-55)
- China's target (IQ=68) sits here
- **No stable equilibrium**: tips to high or low attractor
- China StdDev=16 for IQ reflects bimodal distribution across seeds
- Friction mechanisms (structural corruption minimum, accountability-gated enforcement) slow transitions but don't create stability

### AUTHORITARIAN STASIS (IQ ~45-55, Corr ~55-65)
- Russia, Saudi Arabia
- Structural corruption minimum from information control creates floor
- IQ floor from cap/education provides ceiling on decay
- Quasi-stable but at wrong level for Saudi (target 53 vs model ~41)

## Equilibrium Calculations

### Denmark (GT=10, well-calibrated)
- Inclusive: ~1.56/turn | Extractive: ~0.333/turn | Net: ~1.23/turn
- Olson ceiling at IQ=93: (13)²*0.008 = 1.35 → net ≈ 0
- **Equilibrium: IQ ~93** (target 90, overshoot +3)

### USA (GT=14, improved)
- Inclusive: ~1.18/turn (net of extractive 0.333)
- Democratic capture at WC=50, IQ=77: 4.5 * 1.0 * sqrt(10/40) * 0.425 = ~0.96/turn
- **Equilibrium: IQ ~77-79** depending on WC trajectory (target 77)
- 50-seed actual: IQ=73.8 (slight undershoot, -3)

### Singapore (GT=13, improved)
- Inclusive: ~0.96/turn (net of extractive 0.413)
- Olson ceiling at IQ=91: net ≈ 0
- Coup resistance (iq>70, corr<30) + clean governance recovery active
- 50-seed actual: IQ=86.7 (gap -8, down from -10). StdDev=3.7 (down from 7.1)

### China (GT=19, bimodal)
- Net inclusive depends on which attractor seed reaches
- High-attractor seeds: IQ ~85+ (corr drops, inclusive increases)
- Low-attractor seeds: IQ ~55 (corr stays high, extractive dominates)
- **No stable equilibrium at target IQ=68**

## Active Changes from Baseline (GT=128)

1. **Continuous lowCorr scaling** (line ~4865): INERT — channel uses acquisitiveness=50
2. **Corruption-gated coup resistance** (line ~7910): `if (iq > 70 && corruption < 30)` — targets Singapore
3. **Clean governance stability recovery** (line ~15228): `if (corruption < 20 && iq > 60)` — targets Singapore/Denmark
4. **Democratic capture** (line ~5089): coeff 4.5, sqrt scaling, restricted=0.0 — targets USA only
5. **NPC coupling discovered**: aiCivCount=3 per scenario means democratic capture affects NPC democracies, creating second-order effects on calibration countries through trade/war

## Calibration Status (GT=135, was 128 baseline)

```
Country      | GT=128 | GT=135 | Key gap                          | Fix strategy
─────────────┼────────┼────────┼──────────────────────────────────┼──────────────
Saudi Arabia |  25    |  27    | Corr +13, IQ -13                 | Structural: rent IQ contrib
Russia       |  17    |  26    | Cap +13 (NPC coupling)           | Investigate NPC interaction
China        |  19    |  22    | IQ -12, bimodal                  | Structural: Loop 1 fix
USA          |  20    |  14    | IQ -3 (IMPROVED, was +9)         | Democratic capture working
Singapore    |  16    |  13    | IQ -8 (IMPROVED, was -10)        | Coup resistance working
Brazil       |  10    |  12    | IQ -7                            | Acceptable
Nigeria      |  11    |  11    | IQ -6                            | Well calibrated
Denmark      |  10    |  10    | IQ +2                            | Well calibrated
```

## Key Insight: NPC Coupling

Each calibration scenario runs with `aiCivCount: 3` NPC civilizations. Code changes
that affect NPC behavior (e.g., stronger democratic capture weakening NPC democracies)
create second-order effects on the target country through trade, war, and diplomacy.
Russia's GT regression (17→26) is primarily from this coupling, not from direct
changes to Russia's dynamics. Future calibration work should either:
1. Account for NPC coupling in analysis
2. Test with aiCivCount: 0 to isolate direct effects
3. Accept NPC interaction as a feature (real countries interact)
