# Pass 10 — Production Decentralization (Energy & Agriculture)

Status: SPEC → IMPLEMENTATION
Date: 2026-08-29

Two independent configurable parameters plus three supporting subsystems.
Design constraint: **no directional bias**. Every mechanism must be able to
help or harm depending on conditions, and every coefficient must trace to a
measured anchor or be explicitly labelled as interpolated.

---

## 0. Confidence Tiers

Every coefficient carries a tier, surfaced in the Research panel:

- **M (Measured)** — direct empirical anchor
- **I (Interpolated)** — bounded between ≥2 measured anchors, never extrapolated past them
- **T (Theoretical)** — mechanism supported, magnitude assumed

---

## 1. Interpolation Analysis — What Moved From "Not Simulable"

Framework: **anchored bracketing**. A parameter is simulable if we hold ≥2
measured points on the same axis and the model interpolates strictly between
them. Extrapolation past the outermost anchor is prohibited.

### 1.1 Permaculture → SIMULABLE (I)

Not as a named system (no peer-reviewed yield data exists), but as the upper
region of a continuous `diversificationIntensity` axis bounded by measured
Land Equivalent Ratio:

| Intensity | LER  | Tier | Anchor |
|-----------|------|------|--------|
| 0         | 1.00 | M    | monoculture, definitional |
| 50        | 1.27 | M    | intercropping meta-analyses 1.22–1.32; maize/soy 1.32±0.02 |
| 100       | 1.70 | I    | below measured silvoarable ceiling of 2.0 |

Hard cap 2.0. Never exceeded. The user's intuition ("highest yield per land
area") enters as the top of a *measured, bounded* range rather than an
assumption.

Climate gate (M): advantage strongest in poor soils / arid / tropical,
"variable in temperate". Gated on `resourceDepletion.soil` — poorer soil
yields larger benefit, matching the evidence direction.

### 1.2 Grassroots pathway → SIMULABLE (I)

Previously unquantified. Resolved by recognising **South Africa's rooftop boom
as a grassroots/market pathway with no feed-in tariff** — a pure private
response to centralized failure. 983 MW → 4,412 MW in 15 months (+349%),
private installs exceeding 2× Eskom's four bid windows.

Three anchored pathway points now exist (Germany incentive, Denmark decree,
South Africa grassroots), so the pathway parameter interpolates across all
arms. Caveat retained: the grassroots anchor is **conditional on crisis +
capital access**, not a free-standing rate.

### 1.3 Hybrid pathway → PARTIALLY SIMULABLE (I, low confidence)

Two quantified hybrids: Bangladesh IDCOL (50% grant / 30% concessional loan /
20% sponsor equity → 4.1M units) and Cuba 2024–25 (state-brokered + household,
renewables 3.6% → 10% in one year). Both among the fastest observed.

Interpolated as `max(component pathways) × 0.9`. The 0.9 coordination penalty
is bounded by the observation that neither hybrid *underperformed* its
components. Flagged low confidence.

### 1.4 Energy × agriculture coupling → DELIBERATELY UNCODED

Emerges through shared land (power density), shared labor (diversification
intensity), and shared state capacity (crisis response). An invented
coefficient would be less defensible than the emergent path.

### 1.5 Pre-industrial energy centralization → BOUNDARY CONDITION, not interpolation

Pre-industrial energy was distributed by default (Domesday 1086: 5,624
watermills; ~15,000 by c.1300; Wrigley's organic economy). The parameter is
pinned near-fully-distributed before industrialization and only becomes free
afterward. No interpolation required.

**Result: 3 of 5 previously "not simulable" items become simulable with bounded
interpolation; 1 stays deliberately uncoded; 1 becomes a boundary condition.**

---

## 2. Grübler Diffusion Speed Limit (M)

Characteristic time constants for large energy systems: 5–10 decades.
Invention → 80% share averages ~95 years ⇒ 8.4 pts/decade sustained.

| Regime | Cap (pts/decade) | Anchor |
|--------|------------------|--------|
| Baseline | 8  | Grübler ~95yr to 80% share |
| Crisis + capital | 25 | Puerto Rico: 20% of mix over 9 yrs, 81% of all new capacity |
| Short burst | 40 | South Africa +349%/15mo; Cuba 3.6→10%/1yr |

Burst regime requires `crisisPressure > 80 AND capitalAccess > 60` and decays.

---

## 3. Crisis-Driven Adoption (M — strongest finding in the investigation)

Scarcity drives decentralization harder than subsidy. Four independent cases.

```
crisisPressure = f(maintenanceDebt, 100-infrastructureLevel, 100-stateCapacity,
                   atWar, energy deficit, food deficit)
capitalAccess  = f(gdpProxy, financialDepth, institutionalQuality,
                   external finance via tradeDependency)
adoption ∝ pathwayBase × (1 + crisisPressure/100 × crisisMultiplier) × capitalAccess
```

**Capital gate is mandatory.** Every case had a funding channel (South African
middle-class purchasing power, Chinese finance for Cuba, IDCOL grants, M-KOPA
pay-as-you-go). Crisis without capital produces suffering, not solar.

**Bias guard:** Cuba's Special Period adaptation was real *and* Cubans lost
~⅓ of daily calories. Adaptation raises the floor; it does not make the crisis
good. Crisis must always cost more wellbeing than the adaptation returns.

---

## 4. Energy–Wellbeing Saturation Curve (M — fills an existing gap)

civ-sim currently has no energy→wellbeing link at all (only EROI→innovation
and EROI-deficit→stability).

```
wellbeingCeiling = 30 + 55 × (1 − exp(−E/35))     // E = GJ/capita/year
```

| E (GJ/cap) | Ceiling | Anchor check |
|------------|---------|--------------|
| 10  | 43.8 | bottom of the 10–75 steep range |
| 50  | 71.8 | HDI>0.7 attainable at 50 GJ ✓ |
| 75  | 78.4 | top of steep range ✓ |
| 100 | 81.7 | entering saturation ✓ |
| 150 | 84.2 | saturated ✓ |
| 300 | 84.9 | flat ✓ |

Implemented as a **soft ceiling** (gentle decay toward it when above), never an
additive bonus. Low-energy civilizations are constrained; high-energy ones gain
nothing extra. Neutral in both directions.

---

## 5. Participation → Wellbeing (M, bounded)

Derived quantity: the share of population who are *stakeholders/producers*
rather than remote consumers.

```
participationShare  = distributedShare × ownershipBreadth
participationDepth  = energy.participationShare × 0.4
                    + agri.participationShare  × 0.6   // food is more hands-on/daily
```

Bounded effects (caps at full participation):

| Effect | Cap | Anchor |
|--------|-----|--------|
| averageWellbeing | +8  | Soga et al. gardening meta wellbeing ES ≈ 0.55; SDT autonomy satisfaction g=0.81 |
| anomieLevel      | −10 | Karasek decision latitude; Whitehall II low control → CHD, psychiatric disorder |
| socialTrust      | +6  | CSA civic engagement; co-op participation→satisfaction (5,907 employees / 99 sites) |
| legitimacyLevel  | +5  | procedural justice > distributional justice for acceptance |

### 5.1 Coercion Discount — the critical bias guard

Observational participation studies are self-selected. *Assigning* people to
participate is not the same as *choosing* to.

```
effectiveBenefit = benefit × (1 − coercion/100)^1.5
if coercion > 60 AND institutionalQuality < 40 → benefit goes NEGATIVE
```

This operationalizes the Scott / Tanzanian-villagization finding as a
**conditional risk**, not a deterministic penalty (the 1974 drought
independently halved the harvest; the confounding is real).

It also produces the historically correct asymmetry: Denmark's mandate worked
because it mandated *offers of ownership*; Tanzania's mandate forced
participation itself and failed.

### 5.2 Labor Cost — the counterweight

Participation consumes time. `participationDepth` and `diversificationIntensity`
both absorb labor, suppressing urbanization and reducing labor available for
other output (Boserup). Diversified systems are land-efficient and
labor-intensive; monoculture is labor-efficient and land-hungry.

---

## 6. Pathway Parameters

| Pathway | base | crisisMult | ownershipBreadth | coercion | Tier | Anchor |
|---------|------|-----------|------------------|----------|------|--------|
| grassroots | 0.6 | 3.0 | 0.85 | 0  | I | South Africa (no FIT, crisis-driven) |
| incentive  | 1.0 | 1.5 | 0.70 | 10 | M | Germany EEG: citizens+farmers >40% capacity, utilities 5% |
| decree     | 1.3 | 1.2 | 0.55 | 55 | M | Denmark 2008: 20% mandate → >50% citizen-owned |
| hybrid     | 1.2 | 2.0 | 0.60 | 30 | I | Bangladesh IDCOL; Cuba 2024–25 |

**Incentive degradation (M):** at high `distributedShare` without small-producer
protection, `ownershipBreadth` decays 0.70 → 0.35 — Germany's citizen share
falling from >50% (2014) to ~⅓ (2021) after the 2017 auction switch.

**Decree failure risk (T/M):** `decree` with low `institutionalQuality` and low
`epistemicHealth` raises a legibility-failure event (Scott).

---

## 7. Land Intensity — Smil Power Density (M)

| Source | W/m² |
|--------|------|
| biomass / biofuel | 0.6–1 |
| wind | 1–2 |
| utility solar | 5–20 |
| hydro / nuclear | ~200 |
| fossil extraction | 1,000–10,000 |

Distributed renewables carry a land burden that competes with agriculture.
This is the mechanism through which the two parameters couple *emergently*.

---

## 8. Agriculture — Trade Variance Reallocation (M)

Local self-reliance and import dependence are a **variance swap**, not a
mean improvement:

- High `localShare` → reduced exposure to blockade/export-ban/global price shock,
  **increased** exposure to local drought/weather/pest.
- High `tradeDependency` → the inverse.

Anchors: ~50 economies depend on Russia/Ukraine for ≥30% of wheat; network
research finds modularity isolates shocks but "can result in access to food
being cut off during local food scarcity"; supply-chain diversity boosts
resilience.

**Explicitly rejected (M):** local food does *not* get an emissions bonus.
Production is 83% of food GHG; all transport 11%; final delivery 4%. A
>6.7 km round trip to a farm shop exceeds industrial box-scheme emissions.

**Waste relocation (M):** short chains relocate rather than eliminate waste.
Developed economies lose most at consumption (22.5%) vs developing (6.8%);
developing lose more upstream on-farm. Sign flips by demographic transition
stage.

---

## 9. Files Touched

- `js/config.js` — DECENTRALIZATION_PATHWAYS, LER_ANCHORS, ENERGY_WELLBEING,
  POWER_DENSITY, DIFFUSION_LIMITS
- `js/civilization.js` — `energySystem`, `agricultureSystem`,
  `energyPerCapita`, `participationDepth` state
- `js/simulation.js` — `_processEnergyDecentralization`,
  `_processAgricultureDecentralization`, `_processParticipation`,
  `_processEnergyWellbeing`; modify `_processEnergy`, `_processFoodSecurity`
- `js/sustainability_panel.js` — Energy tab extension, new Agriculture tab,
  Participation section, pathway buttons
- `MODELING_ASSUMPTIONS.md` — §12


---

## 10. Revision 1 — Post-Implementation Refinements

Added after review, driven by three findings.

### 10.1 State-capacity gate (M)

Subsidies and mandates are state programmes; grassroots adoption needs only
capital. Without this gate the model wrongly predicted mandates beat
self-organization during state collapse — the opposite of South Africa, where
private rooftop installs exceeded the utility's four bid windows by >2× while
the utility was failing. `stateDependent: true` on incentive, both decrees, and
hybrid.

### 10.2 The decree split (M)

`decree` divided into `decree_ownership` (coercion 25) and
`decree_participation` (coercion 85). Mandating an *offer of ownership* and
mandating *participation itself* are both legislation and produce opposite
outcomes. Collapsing them erases the finding.

### 10.3 Coercion → productivity penalty (M)

Previously coercion only discounted the participation wellbeing bonus. It now
also destroys the **structural gain** itself:

`retained = 1 − 0.55 × (coercion/100)^1.2`

Anchors: Soviet private plots (1–3% of land → 25–27% of output, same farmers
and soil); Great Leap Forward (26,000 communes, 61% of output decline
attributable to policy not weather); Romanian systematization (private plots
banned while villages required to be self-sufficient).

The negative-participation threshold dropped from 60 to 45 and the
institutional-quality *gate* became a *modulator*: high coercion is damaging
regardless of state strength. All three historical cases were high-capacity
states.

### 10.4 Ecosystem function (M)

Split from raw diversification. Designed species interactions —
nitrogen fixation, allelopathic pest repellence, trap cropping, biological weed
control — that substitute for external inputs.

Anchors: push-pull (maize ~1 → 3.5 t/ha with minimal inputs, 122,650+
smallholders); rice–duck–fish integration (lower weed counts, reduced
fertilizer-N and pesticide).

Two constraints keep it honest: the gain scales *inversely* with input
availability (`0.15 + 0.85 × (1 − techLevel/6)`, capped +35%), and knowledge is
the binding constraint — it accrues slowly, is gated on education/state
capacity/trust, and **decays** when support lapses.

### 10.5 Turn-order fix

`_processParticipation` and `_processEnergyWellbeing` must both run at the END
of the per-turn chain. Run mid-chain, their effects were silently overwritten
by `_processWellbeingRecovery` and `_applyResilienceDampening`, which inverted
the coercion result (compelled civilizations showed the *highest* wellbeing).

### 10.6 Verification

Identical production structure, strong state throughout (IQ 78, capacity 80):

| Pathway | Coercion | Retained | Food | Wellbeing | Legitimacy |
|---------|----------|----------|------|-----------|------------|
| grassroots | 0 | 100% | 83 | 70 | 100 |
| incentive | 10 | 97% | 90 | 71 | 100 |
| decree_ownership | 25 | 90% | 82 | 65 | 100 |
| decree_participation | 85 | 55% | 77 | 59 | 82 |

Preset regression: 5/6 survive 3000 BC → 3000 AD. `theocratic_autocracy`
collapse confirmed pre-existing against a stashed baseline.

---

## 11. Revision 2 — Audit Pass

A deliberate re-examination for gaps, regressions and unrealistic behaviour.
Five defects found and fixed; one calibration error corrected.

### 11.1 Defect: `capitalSensitivity` had inverted semantics

The capital gate was
`0.15 + 0.85·(e/100)·cs + 0.85·(e/100)·(1−cs)·0.6`.

Measured behaviour: **all pathways shared an identical floor (0.15) at zero
capital**, so the parameter did nothing where it was supposed to matter most —
and **capital-dependent pathways received a *higher* ceiling** at high capital,
i.e. grassroots was rewarded for being capital-dependent. The parameter was
doing close to the opposite of its documented meaning.

Replaced with `(1 − cs)·0.75 + cs·(e/100) + 0.10`:

| capitalSensitivity | at 0 capital | at 100 capital |
|--------------------|--------------|----------------|
| 1.0 (grassroots)   | 0.10         | 1.00           |
| 0.5 (incentive)    | 0.48         | 0.98           |
| 0.2 (state-funded) | 0.70         | 0.90           |

Capital-dependent routes now collapse without capital; state-funded routes do
not, because the treasury rather than the household is paying.

### 11.2 Defect: enabling-support bookkeeping was unreachable

Support decay and fiscal drain sat *after* the early return in
`_decentralizationAdoption`. With no active pathway and no crisis — the common
case — support never decayed and never cost the treasury anything. Extracted
into `_processEnablingSupport()`, now called unconditionally from both
processors ahead of any early return.

### 11.3 Defect: pre-industrial energy left ownership at zero

The pre-industrial early return set `participationShare` from a hardcoded 0.80
but never set `ownershipBreadth`, so the panel displayed high participation
alongside zero ownership. Ownership is now derived from land and wealth
concentration: pre-industrial energy is mills, hearths and draft animals, so
ownership follows land tenure. A civilization with concentrated landholding has
concentrated energy ownership even at full physical decentralization.

### 11.4 Defect: unguarded NaN in the power-density blend

`1 / ((a) + (b) || 1)` would silently resolve a NaN to maximum land intensity.
Replaced with an explicit finite/positive guard.

### 11.5 Calibration error: loss chain was subtractive

The post-harvest loss chain was subtracted as a flat penalty from the food
security index. That double-penalized weak producers and pushed developed
market economies to implausibly low food security — contradicting the
real-world pattern in which ~13% post-harvest loss coexists with high food
security, because production exceeds need.

Now applied **multiplicatively to production**: loss is a proportion of what
was grown, so a low-output society loses less in absolute terms. Isolated
measurement across presets attributes **8–16 points** of food security to the
loss chain, roughly proportionate to the measured 13–25% physical loss.

### 11.6 Verification after fixes

- 30 edge-case scenarios (all-zero state, all-max state, max crisis with zero
  capital, shares pinned at 100, fully depleted resources) × 6 pathways: **no
  NaN, no range breaches, no implausible values**.
- Era realism sweep, all five archetypes within real-world reference ranges:
  neolithic 11 GJ/cap, classical 17, industrial 83, modern 193, post-carbon 230.
- Chain loss gradient 7.7% → 16.0%, bracketing the FAO 13.2% anchor; cosmetic
  rejection 0.3% → 10.1%; LER 1.34 → 1.04, never exceeding the 2.0 cap.
- Pathway ordering holds in both regimes after all fixes.
- Preset regression improved to **11/12** seeded runs surviving.

### 11.7 Honest limitation

The crisis crossover is **1.71×**, against a South Africa anchor of >2×. Left
uncorrected: tuning further would fit one country's ratio rather than the
mechanism. The robust, transferable finding — grassroots leads under state
collapse, state programmes lead when the state functions — holds in both
regimes.

### 11.8 Not a defect

`market_representative` ends with food security ~30. Isolation shows only 8
points are attributable to the loss chain; the remainder is driven by **water
depletion reaching zero**, a pre-existing resource death spiral in that preset
unrelated to Pass 10.

---

## 12. Revision 3 — Gap Closure and Second Audit

### 12.1 Research panel exposure (requested)
All Pass 10 coefficients now surfaced read-only in Research → Parameters across
ten tier-tagged sections. Pathway rows are generated from
`DECENTRALIZATION_PATHWAYS`, so they cannot drift from the model.

### 12.2 Nutritional quality channel repaired and re-tiered
Was placed mid-chain and erased by `_processHealthcare`. Moved to
`_processNutritionalHealth()` at end of chain. Isolated spans: disease burden
**8 points (M)**, infant mortality **9 points (I)** — the latter halved after a
first pass gave 18, because extending produce-ripeness vitamin content to
population child mortality is an extrapolation, not a measured link.

### 12.3 Localization: earlier claim retracted
No panel in civ-sim uses i18n. Pass 10 being English-only is consistent with
the codebase, not a regression. Panel localization is a project-wide item.

### 12.4 Defect: ratchet-only distributed share (significant)
Distributed share could only rise, so it never reproduced the historical
collapse of distributed generation during electrification. Added a structural
baseline plus a persistent `pathwayOffset`. See MODELING_ASSUMPTIONS §12.6f.

### 12.5 Defect: stale `energySource` read
`preIndustrial` read state written later in the same turn, letting the
pre-industrial branch slam distributed share upward on the industrialization
turn. Now derived from `adoptedTechnologies`.

### 12.6 Verification
- Reproducibility bit-identical across 3 runs × 120 turns
- 24 edge-case scenarios (6 pathways × 4 extremes): zero NaN, zero range breaches
- Coercion result intact: retained 100/90/55, wellbeing 69/67/57, legitimacy 100/99/83, anomie 0/0/15
- Preset regression 10/12; `theocratic_autocracy` is the persistently fragile
  pre-existing case
- Distributed shares now physically sensible: 4% with strong infrastructure,
  66% in a failing state
