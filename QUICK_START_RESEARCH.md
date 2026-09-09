# Quick Start Guide — Researchers and Policymakers

**civ-sim** | Structural plausibility simulation for comparative analysis

---

## What civ-sim Is (and Isn't)

civ-sim is a browser-based civilization simulator that models the co-evolution of 12 interacting domains (economy, governance, demographics, ecology, psychology, and 7 others) across historical timescales. It tracks ~130 state variables connected by ~250 explicit cross-system feedback loops.

**It is:**
- A structural plausibility tool — causal chains match empirical findings (Caldwell, Omran, Bouchaud & Mezard, Knack & Keefer, Wimmer, Urdal/Goldstone, Weber, Durkheim)
- A counterfactual exploration environment — "what if sanitation investment had preceded urbanization?" or "what conditions produce stable democratic transitions?"
- Reproducible — deterministic with seeded randomness; identical parameters + seed = identical trajectory

**It is not:**
- A predictive model — no simulation can predict specific civilizational trajectories
- An agent-based model — it uses aggregate state variables, not individual agents
- A calibrated econometric model — magnitudes are plausible, not fitted to specific historical datasets

For full epistemological positioning, see `MODELING_ASSUMPTIONS.md`, particularly Sections 1-2 (what it is), Section 8 (how to interpret results), and Section 9 (design philosophy, including no-teleology commitment).

---

## Setup

### Desktop App (recommended)
Open `Civilization Simulator.app` (macOS) or run the installer (Windows). On first launch, a setup wizard handles Ollama + tinyllama installation and optional cloud LLM configuration.

### From Source
```bash
cd ~/civ-sim
node server.js        # or: python3 server.py
# Open http://localhost:8080
```

### Basic (no server)
Open `index.html` in Chrome or Firefox. All simulation features work without a server (AI NPC interviews require the server).

### LLM Configuration (optional)
NPC interviews can be driven by a language model for contextually rich responses. The first-run setup wizard handles this automatically. For manual configuration, see `USER_MANUAL.md` > LLM Integration (Ollama for local/private, Groq or Gemini for cloud).

---

## Configuration Space

### Governance Models (15 available)
Representative, Parliamentary, Council Consensus, Direct Democracy, Autocratic, Constitutional Monarchy, Theocratic, Oligarchic, Military Junta, Technocratic, Federal, Communist Party State, Anarcho-Syndicalist, Tribal Confederation, Authoritarian World Government.

### Economic Models (9 available)
Market Capitalist, Mixed Economy, Command/Planned, Gift Economy, Barter, Labor Credit/Cooperative, Commons-Based, Feudal, Mercantilist.

### Key Configuration Parameters (Step 10)

| Parameter | Effect Domain | Research Relevance |
|-----------|--------------|-------------------|
| Healthcare Access Tier | Mortality, wellbeing inequality, plague mitigation | Universal vs. privatized health systems |
| Healthcare Emphasis | Plague response, long-term burden | Prevention vs. treatment policy |
| Resource Strategy | Environmental depletion rates | Sustainability policy |
| Information Ecosystem | Epistemic health trajectory | Media freedom and democratic resilience |
| Education Access/Quality | Human capital, innovation, fertility decline | Development economics |
| Women's Rights Tier | GEI, fertility, innovation, EH | Gender equity and development |
| Family Structure | Anomie buffering, birth rate | Social structure effects |
| Religion | Science freedom, caste reinforcement, empathy bias | Secularization dynamics |

### Preset Configurations (6 starting points)

| Preset | Governance | Economy | Notable Initial Conditions |
|--------|-----------|---------|---------------------------|
| Gift / Flat | Flat consensus | Gift | Low hierarchy, high trust, low infrastructure |
| Market / Representative | Representative | Market | Moderate everything; closest to OECD starting profile |
| Commons / Elder Council | Elder council | Commons | High trust, moderate mobility, traditional legitimacy |
| Theocratic Autocracy | Theocratic | Mixed | High caste (55), high religion dominance, low gender equity |
| Barter / Tribal | Tribal | Barter | Low infrastructure (15), low sanitation (8), high disease (70) |
| Labor / Cooperative | Cooperative | Labor credit | High mobility (65), low military (15), high retraining (60) |

---

## Key Systems for Research

### Demographic-Epidemiological Transition (Round 15)
Five-stage model following Omran's epidemiological transition theory and Caldwell's child-survival hypothesis.

- **Stage determination is derived**, not set — fertility and mortality rates are computed from 12 interacting factors each turn, and the stage label is applied based on where rates fall
- **Causal chain**: Infrastructure/tech → sanitation → disease burden ↓ → infant mortality ↓ → (with lag) fertility ↓
- **Fertility drivers**: Child survival effect, female education, gender equity, urbanization, contraception access, automation
- **Mortality drivers**: Sanitation, healthcare tier, food security, war, aging population burden
- **Cross-effects**: Youth bulge instability (Urdal/Goldstone), Stage transition anomie (Durkheim), aging fiscal strain on state capacity, disease burden → collective trauma

### Power-Empathy Suppression Cascade
Empathy suppression is modeled as a gradient through 5 strata proportional to power base (governance hierarchy or economic hierarchy, whichever is higher). The cascade is asymmetric: suppression builds at 2x the rate of recovery. At the bottom stratum, the model captures the tension between cooperation pressure (empathy × mutual aid × resource slack × stability) and competition pressure (scarcity + low wellbeing + instability + opportunity competition).

### Wealth Capture and Consequence Deficit
Four capture channels (institutional, electoral, media, cultural) computed from wealth concentration, governance type, and institutional quality. The consequence deficit tracks accumulated unaccountability and produces an acceleration multiplier that makes capture self-reinforcing — a formalization of the "oligarchic spiral" observed in political economy literature.

### Behavioral Inertia and Facilitation
Paradigm shifts do not produce instant behavioral change. All behavioral shifts pass through a deferred-shift queue and are applied gradually, modulated by an inertia coefficient (driven by hierarchy, wealth capture, cultural homogeneity, institutional lock-in, and inversely by education and epistemic health). Facilitation measures (civic workshops, community forums, media campaigns, economic incentive alignment) can accelerate change but are bounded by structural ceilings — wealth capture sets a hard limit on achievable cooperation.

### Cross-Civilization Contagion
In multi-civilization runs, cooperation norms, cynicism, and epistemic health spread through trade contact at different speeds (cooperation fastest, EH slowest). Theocratic civilizations suppress incoming out-group influences proportional to out-group empathy deficit.

### Bottom-Up Economic Restructuring (Dual Economy)
Structural movements allow populations to bypass governance and restructure the economy directly. A dual economy emerges with S-curve adoption dynamics. Five scaling models (polycentric, confederal, delegative, congress, participatory planning) reduce coordination costs at scale. Autocratic governance cracks down but abandons enforcement when state capacity is drained. Financial metrics (Minsky, debt, financial depth) scale to zero in currencyless transitions. Post-transition, coordination instability replaces financial instability as the primary risk. Taxation ceases in currencyless economies. Access: Events → Movements → Structural Movements. Monitor: Society → Finance & Trade.

---

## Validation Tools

civ-sim includes a validation framework for systematic assessment of simulation behavior. All commands run from the project root and save results as JSON to the `validation_results/` directory.

### Uncertainty Quantification (UQ)
```bash
node js/validation_suite.js uq --seeds=20
```
Runs 12 countries across 3 target metrics with seed-averaged uncertainty bands. Tests whether the simulation produces appropriately bounded variance — too tight means the model is overfit; too wide means it lacks structural constraint. Current score: 11-14/36 (see Coverage and Limitations for interpretation).

### Hindcast Scenarios
```bash
node js/hindcast_runner.js --seeds=10
```
Four historical trajectories used as structural plausibility checks:
- **South Korea 1960-2010** — rapid industrialization, demographic transition, democratization
- **Chile 1970-2000** — coup, authoritarian rule, neoliberal restructuring, re-democratization
- **Russia 1985-2015** — Soviet collapse, institutional decay, partial recovery
- **Rwanda 1990-2020** — genocide, post-conflict state-building, authoritarian development

Current score: 30/38 across all scenarios.

### Calibration Scenarios
```bash
node js/scenario_test_harness.js
```
12 scenarios testing specific causal chains (e.g., youth bulge instability, wealth capture spirals, demographic transition timing). Each scenario asserts that a known structural mechanism produces the expected directional effect.

### Cross-Validation
```bash
node js/validation_suite.js crossval
```
Holds out parameter combinations and tests generalization — does the simulation produce plausible results for configurations it was not tuned against?

### Sensitivity Analysis
```bash
node js/validation_suite.js sensitivity
```
Sweeps individual parameters to confirm monotonic relationships where theory demands them and to identify unexpected nonlinearities.

### Current Validation Summary (September 2026)

| Metric | Score | Notes |
|--------|-------|-------|
| UQ coverage | 11-14/36 | Deliberately conservative; many corridors are structurally wide |
| Hindcast plausibility | 30/38 | Strongest on Korea and Rwanda; Chile transition timing is loose |
| Robustness | ~77% | Fraction of random parameter sweeps that remain structurally plausible |

---

## Companion Module (Demographics)

A demographic companion module (`companion.js`) provides sex-disaggregated population cohorts, social strata dynamics, information diffusion networks, and collective action modeling. It integrates bidirectionally with the main simulation:

- **Population cohorts**: Age-sex pyramids with cohort-specific mortality, fertility, and migration rates that feed back into the main demographic transition model
- **Social strata dynamics**: Mobility between strata, differential access to resources and information, strata-specific behavioral norms
- **Information diffusion networks**: Models how information (and disinformation) propagates through social networks with strata-dependent transmission rates
- **Collective action modeling**: Threshold-based mobilization (Granovetter 1978), free-rider dynamics, and movement sustainability as functions of grievance, network density, and state repression

The companion module runs alongside the main simulation and exchanges state each turn. It is optional — the main simulation functions without it, but research questions involving within-population heterogeneity benefit from enabling it.

---

## Research Panel

The UI includes a research panel (`research_panel.js`, toggle with the Research button or keyboard shortcut) that provides diagnostic and analysis tools for researchers:

- **Parameters tab**: Read-only inspection of all model coefficients with confidence tier tags (M/I/T). Includes `Suppress Random Events` toggle for fully deterministic runs.
- **Export tab**: Full Track 2 CSV download, research seed display, and run metadata
- **Diagnostics tab**: Real-time feedback loop tracing, state variable inspection, and cross-system effect decomposition
- **Analysis tools**: Comparative run overlays, parameter sensitivity sweeps, and structural plausibility scoring

---

## Research Workflow

### 1. Configure
Use the setup wizard. For controlled experiments, vary one parameter while holding others at a preset baseline.

### 2. Run
Advance turns with the Space bar or turn button. For systematic analysis, run 200-500 turns to observe full demographic transitions and institutional evolution.

### 3. Monitor
- **Society Panel** (S key) — 15+ tabs covering all modeled domains
- **Sustainability Panel** (R key) — Resources, energy, food security, ecological overshoot
- **Paradigm Panel** (Shift+P) — Systemic change readiness, facilitation, threshold events

### 4. Export

**Quick inspection** (browser console):
```js
const s = game.civs[0].state;
console.table({
  wellbeing: s.wellbeingIndex,
  stability: s.stabilityIndex,
  EH: s.epistemicHealth,
  equality: s.equalityIndex,
  GEI: s.genderEquityIndex,
  fertility: s.fertilityRate,
  mortality: s.mortalityRate,
  lifeExpectancy: s.lifeExpectancy,
  urbanization: s.urbanizationRate,
  wealthCapture: s.wealthCapture?.degree,
  anomie: s.anomieLevel,
  trauma: s.collectiveTrauma,
  demogStage: s.demographicTransitionStage,
});
```

**Full Track 2 CSV** (Research Panel > Export tab):
- Click "Download Full CSV" for all 13 data sections
- Includes research seed for reproducibility
- Sections: run metadata, economic history, empathy history, cultural gap history, wealth capture history, behavioral inertia history, facilitation history, cooperative outcomes history, consequence deficit history, cultural homogeneity history, contagion history, threshold events, history events

**Panel-level exports:**
- Most Society Panel tabs have PNG, CSV, and TXT export buttons
- Sustainability Panel has CSV and PNG export for resource history

### 5. Reproduce
The simulation uses a seeded PRNG (Mulberry32) initialized from the research seed. Same seed + same parameters = identical run, guaranteed. All simulation-relevant randomness (events, stochastic processes, probability checks) flows through the seeded generator. Non-simulation randomness (NPC flavor text, map noise, UI timing) uses standard Math.random() and does not affect trajectory reproducibility.

Record the research seed (visible in Research Panel > Export tab) and all wizard parameters. To reproduce a run exactly, enter the same seed in the setup wizard and use identical configuration.

---

## Analytical Considerations

### What You Can Study
- Structural conditions for democratic transition
- Feedback loops between inequality and institutional capture
- Demographic transition timing under different policy mixes
- Effects of information ecosystem on institutional resilience
- Interaction between ethnic fractionalization and political inclusion (Wimmer framework)
- Conditions that produce or prevent military coups
- Environmental overshoot dynamics under different resource strategies
- Cross-civilization norm contagion via trade
- How collective trauma constrains post-conflict recovery

### What You Cannot Study
- Individual-level behavior or decision-making (aggregate model, not ABM)
- Specific historical predictions (structurally plausible, not calibrated)
- Spatial dynamics within a civilization (single-unit per civ)
- Cultural content (religion modeled as structural force, not doctrine)
- Diplomatic negotiation (inter-civ relations are parametric, not strategic)

### Known Simplifications
1. Single stratum per class — no intra-stratum variation
2. ~~Technology as a ladder~~ — **Resolved:** Technology now uses a branching prerequisite tree (38 techs, 7 categories, cross-category dependencies)
3. Geography as terrain type — no distance, logistics, or spatial economy
4. Deterministic core with stochastic events — no true agent heterogeneity
5. Linear interpolation between extremes for most drift functions

See `MODELING_ASSUMPTIONS.md` Section 5 for the full list and rationale.

---

## Empirical Grounding

Each subsystem is calibrated against specific research. Key citations:

| System | Source | Implementation |
|--------|--------|---------------|
| Wealth dynamics | Bouchaud & Mezard (2000) | Multiplicative drift, Pareto tails |
| Demographic transition | Omran (1971), Caldwell (1976) | 5-stage model, child-survival hypothesis |
| Trust erosion | Knack & Keefer (1997) | Corruption → trust decay feedback |
| Ethnic conflict | Wimmer (2013) | Political exclusion risk, not "ancient hatreds" |
| Youth bulge instability | Urdal (2006), Goldstone (2010) | Youth cohort > 42% + low mobility → stability erosion |
| Legitimacy types | Weber (1922) | Traditional / charismatic / rational-legal |
| Anomie | Durkheim (1897) | Rapid social change → normlessness |
| EROI | Hall et al. (2014) | Energy return on investment by source |
| Power-empathy suppression | Keltner (2016), van Kleef (2008) | Empathy gradient proportional to power |
| Behavioral reinforcement | Bandura (1977) | Environmental shaping of norms |

Full table with 18 systems in `MODELING_ASSUMPTIONS.md` Section 7.

---

## Coverage and Limitations

civ-sim models approximately 71-73% of the practical ceiling for civilization dynamics (~50% absolute coverage of real-world complexity). The identified sweet spot is 72-75%, beyond which added complexity produces diminishing returns.

**Validation status (September 2026):** The project now has a formal validation framework (see Validation Tools above). Current scores: hindcast plausibility 30/38, UQ coverage 11-14/36, robustness ~77%. Earlier qualitative validation (10 historical scenarios, 7.8/10 average structural plausibility across 6 rounds of development) and out-of-sample validation (8 untested scenarios) confirmed robustness for novel parameter combinations but revealed convergence in untested authoritarian subtypes. See `HISTORICAL_SCENARIO_RESULTS.md` for historical data and `validation_results/` for current quantitative results.

**Not modeled (with rationale):**
- Individual psychology / personality differences
- Specific cultural content (art, language, cuisine)
- Judicial independence (captured by institutional quality proxy)
- Detailed trade goods or comparative advantage
- Diplomatic negotiation strategies
- Intra-urban spatial dynamics
- Space colonization (deliberately excluded — too speculative for structural plausibility)

---

## Comparison with Other Tools

| Dimension | Academic ABMs (Sugarscape, etc.) | Commercial Games (Civ VI, Victoria 3) | civ-sim |
|-----------|--------------------------------|---------------------------------------|---------|
| Domains modeled | 1-2 (deep) | 4-6 (balanced for play) | 12 (broad) |
| Mechanism source | Formal theory | Game balance | Empirical research |
| Emergent behavior | Strong (single domain) | Moderate (scripted interactions) | Strong (cross-domain) |
| Transparency | Full (publishable) | Hidden (proprietary) | Full (open source) |
| Reproducibility | High | Low (player agency) | High (seeded) |
| Mathematical rigor | High (provable) | N/A | Moderate (plausible, not provable) |
| Accessibility | Specialist only | Mass market | Dual audience |

---

## New Research-Relevant Systems (March 2026 Update)

The following systems were added to close identified gaps in real-world modeling. All are calibrated to published research and produce governance-neutral outcomes.

### Ecological Feedback Loops
- **Biodiversity index** (IPBES 2019): pollination → food security, disease regulation, ecological capacity
- **Ocean health** (IPCC 2019): acidification, fisheries collapse, CO₂ absorption feedback
- **Deforestation → water** (Nobre 2016): Amazon-style tipping point at 40% forest loss
- **Pollution persistence**: PFAS/microplastic bioaccumulation above critical thresholds
- **Climate extremes**: temperature²-scaled extreme weather, megafires, sea level rise, glacial melt

### Catastrophic Events
- **Nuclear war** (3 levels, Bulletin of Atomic Scientists): tactical → large-scale → MAD, with nuclear winter dynamics
- **Civil war** (Fearon & Laitin 2003, Collier & Hoeffler 2004, Cederman et al. 2010): 8 risk factors, 3 severity levels. Key finding: political EXCLUSION of ethnic groups, not diversity itself, drives conflict.
- **Post-catastrophe**: extinction pathway (Easter Island model) and survivor rebuild (Black Death model)

### Modern-Era Dynamics
- **Disinformation** (tech ≥ 7): social media epistemic erosion, defended by education (Finland model). Tech-scaling caps with diminishing returns.
- **AI disruption** (automation ≥ 3): dual-use — productivity boost + labor displacement + deepfake threats. Net effect depends on institutional capacity to manage transition.
- **Immigration** (Lee 1966 push-pull): brain drain, refugee flows, Stage 5 population sustainability
- **Pandemic modeling** (COVID reference): systemic effects on economics, trust, stability. Response quality = f(state capacity, trust, epistemic health).
- **Urban-rural divide**: high urbanization + inequality → populist backlash (Trump/Brexit/gilets jaunes dynamic)
- **Trade network contagion**: globalization prosperity + supply chain vulnerability

### Technology Tree (Branching Prerequisites)
- **38 technologies** across 7 categories (Materials, Agriculture, Energy, Science, Communication, Medicine, Maritime), spanning all 11 historical eras
- **Cross-category prerequisites**: e.g., Germ Theory requires Scientific Method (science) + Surgical Techniques (medicine); Computing requires Modern Physics + Mathematics
- **Pressure-based adoption**: Innovation culture, education, science freedom, energy surplus, and trade-network imitation (Bass diffusion model) drive adoption pressure
- **Value resistance**: Governance-type and power-structure resistance to specific technologies (Rogers' adoption barriers)
- **Non-linear progression**: Multiple valid development paths — maritime civilizations can advance trade networks independently of metallurgy; theocracies resist innovation-boosting techs
- **Catalog prerequisites**: Modern player-deployable technologies (Introduce/Discontinue tabs) now require foundational tree techs

### Bias Removal
All prosperity, wealth dispersion, corruption decay, climate resilience, and environmental regulation mechanisms are now institution-based (institutional quality, state capacity, epistemic health), NOT governance-type-based. Singapore, China, and Nordic countries can all achieve high wellbeing IF their institutions are strong. The simulation has no built-in preference for any governance or economic model.

### Environmental Policy Buttons
7 new player-triggered policy buttons in Sustainability → Resources tab, all scaling with state capacity. Includes voluntary green subsidies (IRA model) vs mandatory green transition (EU Green Deal model), recycling program (saves 700M tonnes CO₂/year per 2024 data).

### Round 5: Nine New Subsystems
- **Natural disaster resilience** — stochastic earthquakes/tsunamis/volcanoes, severity moderated by state capacity + building codes (Haiti vs Japan)
- **Sovereign debt / fiscal crisis** — debt accumulation, Reinhart-Rogoff threshold, austerity/default/bailout paths
- **Media/information ecosystem** — press freedom → corruption reduction (Brunetti & Weder), media literacy, oligarch capture
- **Drug/addiction epidemics** — vulnerability from anomie + inequality, era-gated substances, policy response comparison (Portugal vs US)
- **Generational value shifts** — Inglehart post-materialism thesis, formative conditions → cohort values
- **Space program** — tech ≥ 6, milestone achievements, STEM boost (Apollo effect), prestige dynamics
- **Religious/ideological schism** — lock-in + low legitimacy → schism risk, 3 resolution paths (suppression/accommodation/reformation)
- **Diaspora networks** — remittances, knowledge transfer, trade facilitation, return migration
- **Water/resource conflict** — 5-stage escalation, upstream leverage, treaty mechanisms, climate amplification

### Research Questions Enabled by New Systems
- Does institutional quality or governance type better predict long-term wellbeing? (bias removal enables this comparison)
- What conditions allow market economies to manage ecological limits? (environmental regulation events)
- How do disinformation and AI interact with institutional resilience? (disinformation + AI systems)
- What determines civil war risk vs peaceful transition? (Fearon & Laitin framework)
- Can civilizations recover from all-out nuclear war? (post-catastrophe mechanics)
- How does sovereign debt interact with military spending and social programs? (fiscal crisis system)
- Does press freedom causally reduce corruption, or is it merely correlated? (media ecosystem)
- Under what conditions do religious/ideological schisms produce innovation vs destruction? (schism system)
- How do diaspora remittances affect origin-country development trajectories? (diaspora networks)
- What role do generational value shifts play in environmental policy adoption? (Inglehart + ecological systems)
- Can a population restructure its economy from the bottom up without governance support? Under what conditions does it succeed vs stall? (structural movements + dual economy)
- How does governance type affect bottom-up economic transitions? Do autocracies successfully suppress them or just delay them? (crackdown dynamics)
- What scaling model (polycentric, confederal, liquid democracy, congress system, participatory planning) is most effective for coordinating national-scale economic restructuring? (scaling model comparison)
- At what behavioral alignment threshold does a currency-refusal movement reach critical mass? (S-curve adoption dynamics)
- How does a currencyless post-transition economy compare in stability to a market economy? (coordination instability vs Minsky cycle)

### Bottom-Up Economic Restructuring
Structural movements bypass governance to directly restructure the economy. A dual economy emerges during transition with S-curve adoption (Rogers), coordination costs (Ostrom), supply chain disruption (Leontief), and governance adaptation (selectorate theory). Five scaling models provide national-scale coordination: Polycentric (Ostrom), Confederal (Rojava), Liquid Democracy, People's Congress (adapted Jamahiriya with Ostrom safeguards), and Participatory Planning (Parecon). Financial system metrics (Minsky, debt, financial depth) scale to zero in currencyless transitions; coordination instability replaces them. Taxation ceases post-transition. Grounded in: ILO informal economy data, currency crisis literature, Ostrom's commons governance (Nobel 2009), Rojava cooperative experiment, Parecon (Albert 2003). Access via Events → Movements → Structural Movements; monitor via Society → Finance & Trade.

### Out-of-Sample Validation
8 untested scenarios (Tokugawa Japan, Mughal India, Venetian Republic, Ptolemaic Egypt + 4 novel configurations) were run without tuning. Novel scenarios produced plausible, differentiated results. Historical authoritarian scenarios showed convergence toward similar endpoints — a documented limitation. See `HISTORICAL_SCENARIO_RESULTS.md`.

---

## Production Decentralization (Pass 10)

Two **independent** parameters — energy and agriculture production scale — plus
three supporting subsystems. Full derivation in `pass10-spec.md`; assumptions
and anchors in `MODELING_ASSUMPTIONS.md` §12.

### Confidence tiers

Every coefficient is tagged **M** (measured anchor), **I** (interpolated
strictly between ≥2 measured anchors, never extrapolated past them), or **T**
(mechanism supported, magnitude assumed). Pathway tiers are exposed in the UI
tooltips.

### Independent variables

| Variable | Range | Notes |
|----------|-------|-------|
| `energySystem.pathway` | 5 pathways + none | see below |
| `energySystem.distributedShare` | 0–100 | pinned near 100 pre-industrialization (boundary condition) |
| `agricultureSystem.pathway` | 5 pathways + none | independent of energy |
| `agricultureSystem.localShare` | 0–100 | relaxes toward a structural baseline from trade/urbanization/tech |
| `agricultureSystem.diversificationIntensity` | 0–100 | player-steerable via two policy buttons |

### Derived / dependent variables (in Track 2 export)

`energyDistributedShare`, `energyPathway`, `energyPerCapita`,
`wellbeingEnergyCeiling`, `agLocalShare`, `agDiversification`, `agPathway`,
`landEquivalentRatio`, `agEcosystemFunction`, `agInputSubstitution`,
`agCoercionYieldFactor`, `participationDepth`, `participationCoercion`.

### The five pathways

| Pathway | Coercion | State-dependent | Ownership breadth | Tier |
|---------|----------|-----------------|-------------------|------|
| grassroots | 0 | No | 0.85 | I |
| incentive | 10 | Yes | 0.70 → 0.35 at scale | M |
| decree_ownership | 25 | Yes | 0.55 | M |
| decree_participation | 85 | Yes | 0.30 | M |
| hybrid | 30 | Yes | 0.60 | I |

The `decree_ownership` / `decree_participation` split is the most important
design decision in Pass 10. Mandating an *offer of ownership* and mandating
*participation itself* are both legislation and produce opposite outcomes;
collapsing them into one pathway would erase the finding.

### Experiments this supports

1. **Crisis vs subsidy as adoption drivers.** Hold pathway fixed, vary
   `maintenanceDebt` / `infrastructureLevel` / `stateCapacity`. Expect
   grassroots to overtake state programmes by ~2× under state collapse, and to
   lose to them under a functioning state.
2. **The capital gate.** Impose crisis with `financialDepth` and
   `averageWellbeing` low. Adoption should stall and wellbeing fall — scarcity
   without a funding channel produces hardship, not capacity.
3. **Coercion isolation.** Hold LER and ecosystem function identical, vary only
   pathway. `agCoercionYieldFactor` should fall to ~0.55 under compulsory
   reorganization while structural inputs stay constant. This isolates the
   coercion effect from the design effect.
4. **Does state strength rescue compulsion?** Set institutional quality and
   state capacity high, then compel. It should not help. This is deliberate —
   the USSR, Great Leap Forward and Romanian systematization were all
   high-capacity states.
5. **Knowledge dependence of ecosystem function.** Build `agEcosystemFunction`
   up, then degrade `educationQuality` / `stateCapacity` / `socialTrust`. The
   function should decay, reproducing the documented "lack of long-term
   follow-up to training" failure mode.
6. **Input-substitution gradient.** Vary `technologyLevel`. Ecosystem-function
   yield gains should be large at low tech and small at high tech — these
   systems replace inputs that are missing.
7. **Trade variance swap.** Vary `localShare` against `tradeDependency` under
   alternating global shocks and local droughts. Neither should dominate.
8. **Energy–wellbeing saturation.** Sweep `energyPerCapita` and confirm the
   ceiling `30 + 55(1 − e^(−GJ/35))` binds below ~75 GJ/cap and is inert above
   ~150.

### Seeded reproducibility — FIXED, and it changes how you should work

Set `researchSeed` in the setup wizard (or `config.researchSeed`
programmatically) and runs are now **bit-identical**. Verified: three runs on
one seed produce identical population, wellbeing, stability and food security
to three decimal places over 150 turns; different seeds diverge.

This was broken until the Pass 10 tightening pass. `researchSeed` was being
set and `Utils.seedRNG()` existed, but map terrain generation, resource
placement and NPC generation all called `Math.random()` directly, and the
value-noise permutation table was shuffled at module load before any seed could
apply. Three runs on the same seed gave three different worlds.

**Implication for prior results:** every balance and historical-scenario
finding recorded before this fix was produced by a simulation that could not
reproduce its own runs. Treat those numbers as indicative, not replicable, and
re-run anything load-bearing.

**Practical guidance:** always set a seed. Report it. For a distribution rather
than a point estimate, sweep seeds (`for (const s of [1001, 1002, ...])`) —
that gives you controlled variance instead of uncontrolled noise. Presets
remain genuinely variable across seeds: `barter_tribal` survives on seed 1001
and collapses on 2002, which is a real property of that configuration rather
than a defect.

### Enabling support (independent of pathway)

`energySystem.enablingSupport` and `agricultureSystem.enablingSupport`, 0–100.
Capability provision — material access, training, expert consultation, tax
relief, expenditure reimbursement — orthogonal to pathway coercion. Events:
`fund_enabling_support` / `reduce_enabling_support` with `{domain}`.

| Property | Behaviour | Tier |
|----------|-----------|------|
| Adoption boost | bounded by measured subsidy elasticity (~0.65 for PV) | M |
| Progressivity | substitutes for capital; large effect at low capital access, small at high | M |
| Knowledge boost | raises the ecosystem-function ceiling; **no spillover to non-participants** | I |
| Elite capture | effectiveness falls with land concentration and weak institutions | M |
| Fiscal drain / decay | costs state capacity while active; lapses without renewal | M |

The knowledge boost is tiered **I** deliberately: the Farmer Field School
evidence base contains no study at low risk of bias and likely overstates
effects.

### Distribution and post-harvest loss

`agricultureSystem.distributionLocality`, plus derived `chainLoss`,
`cosmeticRejection`, `harvestMaturity`, `nutritionalQuality`. Capped at
`100 − urbanization × 0.7`.

Nutritional quality feeds **disease burden and infant mortality only** — never
calorie supply. Keep that separation when interpreting output; conflating them
is the most likely misreading.

Additional experiments:

9.  **Support vs compulsion at matched adoption.** Tune `enablingSupport` and
    `decree_participation` to reach the same `agLocalShare`, then compare
    wellbeing, legitimacy and `agCoercionYieldFactor`. This isolates *how* a
    structure was achieved from *what* was achieved.
10. **Elite capture gradient.** Sweep `landConcentration` at fixed support.
    `agSupportEffectiveness` should fall away from `agEnablingSupport`.
11. **Support decay.** Fund support, then stop. Both support and
    `agEcosystemFunction` should decay — the documented follow-up failure.
12. **Loss chain decomposition.** Sweep urbanization and trade dependency;
    `distributionLocality` falls and `agChainLoss` / `agCosmeticRejection`
    rise. Expect roughly 8.5% → 16% chain loss and 1.4% → 10% net cosmetic
    rejection across the range.
13. **Nutrition vs calories.** Confirm `agNutritionalQuality` moves disease
    burden without moving `foodSecurity` directly.

### Measure policy effects with `pathwayOffset`, not total share

`energyDistributedShare` and `agLocalShare` are the sum of two very different
things: a **structural baseline** set by infrastructure, urbanization and state
capacity (physics), and a **programme contribution** earned by the chosen
pathway (policy). Exported separately as `energyStructuralBaseline` /
`energyPathwayOffset` and `agStructuralBaseline` / `agPathwayOffset`.

For any experiment about *policy*, use the offset. Total share will otherwise
be dominated by the baseline and your policy signal will look far weaker than
it is — a mistake made and corrected during development.

### Inspecting the coefficients

Every Pass 10 constant is exposed read-only in the **Research panel →
Parameters** tab, tagged with its confidence tier, across ten sections. You do
not need to read source to audit the model. `Suppress Random Events` on the
same tab, combined with a fixed `researchSeed`, gives fully deterministic runs
with stochastic gates bypassed.

### Tiering note on nutritional quality

`agNutritionalQuality` drives two outcomes with **different** confidence:

- **Disease burden** — tier M, span ~8 points across the realistic quality range.
- **Infant mortality** — tier **I**, span ~9 points, coefficient deliberately
  halved. The measured evidence concerns vitamin content in ripe versus
  mature-green produce; extending that to population child mortality is an
  extrapolation via micronutrient status, not an established link. Treat any
  result that leans on this channel as suggestive.

Both are suppressed below food security 25, where calorie shortfall dominates.

### Localization

No panel in civ-sim is localized — this is project-wide, not specific to Pass
10. `I18N` covers NPC and interview content plus a few top-level buttons.
Research output and panel labels are English only.

## Active Travel Networks (Pass 11)

Independent variables: `activeTravel.networkCoverage`, `.networkContinuity`,
`.transitIntegration`, `.jobsHousingBalance`, `.lightingLevel`,
`.patrolIntensity`, `.amenityLevel`, `.pathway`, `.enablingSupport`.
Events: `build_active_network`, `integrate_transit`, `improve_path_safety`,
`balance_jobs_housing`, `set_mobility_pathway`.

Exported: `atModeShare`, `atModeShareMale`, `atModeShareFemale`,
`atNetworkCoverage`, `atNetworkContinuity`, `atTransitIntegration`,
`atEffectiveReach`, `atPerceivedSafety`, `atJobsHousingBalance`,
`atEnergySavedShare`, `atAnimalPowerShare`, `atStructuralBaseline`.

### Experiments this supports

14. **Transit integration as the dominant lever.** Hold network quality fixed,
    sweep `transitIntegration`. Expect mode share roughly to double and
    `atEffectiveReach` to rise from ~26 to ~59. Paths without transit should
    produce almost nothing in a high-urbanization civ — this is the
    distance-decay constraint, not a bug.
15. **Continuity vs coverage.** Equal-length networks at continuity 80 vs 20
    should differ by ~40% in mode share.
16. **Gendered access.** Sweep `lightingLevel` / `patrolIntensity` and compare
    `atModeShareFemale` against `atModeShareMale`. Without the safety layer the
    ratio is ~0.5; with it ~0.7. This is the model's most policy-relevant
    asymmetry and it is anchored on measured fear differentials.
17. **Jobs–housing gate.** Sweep `jobsHousingBalance` at fixed network quality.
    Low balance should suppress everything else.
18. **Environmental scale check.** Confirm `atEnergySavedShare` stays in low
    single digits. A 10-point mode shift should be ~2% of total energy. If it
    exceeds ~5% something is miscalibrated — an early implementation overstated
    the pollution channel by more than an order of magnitude.
19. **Animal power density inversion.** Sweep `urbanizationRate` at fixed
    `animalPowerShare`. Below 45% expect a small benefit; above it, rising
    pollution, disease burden and sanitation loss, plus a food-security hit from
    hay-versus-food land competition.

### Averaging: single seeds lie about interactions

Seeded runs are reproducible, but **changing a configuration changes RNG
consumption**, so two configs on the same seed are not a controlled comparison
once their random draws diverge. During development an animal-power test read
+9 wellbeing on one seed where the true 5-seed average was −1.4 — opposite
sign.

**Average at least five seeds for any cross-system claim.** Single seeds are
fine only for exact-reproducibility checks and for stub-based isolation where
the RNG stream is unchanged.

### Benefits scale with what is displaced

`atMarginalShift` (mode share above `atStructuralBaseline`) times motorization
context drives every Pass 11 benefit. This is deliberate: the HR 0.59 anchor is
measured against a sedentary car-using counterfactual, so a society without
motorized transport gains nothing from "adopting" active travel — everyone
already walks and the baseline health reflects it. Verified monotonic:
−0.4 / −2 / −6 / −10.2 disease burden across neolithic → modern.

If you are comparing eras, compare marginal gains, not total mode share.

### Isolating Pass 11 effects

Stub `_processActiveTravel` on the simulation prototype to get a clean
counterfactual on the same seed. At full build the isolated effects are
pollution −4, disease burden −5, life expectancy +1, wellbeing +1.

### Not modelled, deliberately

- **Drone patrol.** The one rigorous aerial-patrol trial found no significant
  effect. No coefficient was invented.
- **Emergency call boxes as a use channel.** Documented as rarely used for
  their intended purpose; they enter only through perception, at low weight.
- **Noise as its own variable.** civ-sim has none; routed to wellbeing.

### What is deliberately absent

- No coded energy×agriculture coupling. They interact emergently through shared
  land (power density), labour (diversification intensity) and state capacity.
- No per-technology energy breakdown. Aggregate only.
- No "permaculture" parameter. The peer-reviewed yield evidence for
  permaculture-as-a-system does not exist; its component mechanisms are
  modelled instead via `diversificationIntensity` and `ecosystemFunction`.
- No emissions bonus for local food.

## File Reference

| File | Contents |
|------|----------|
| `MODELING_ASSUMPTIONS.md` | Full epistemological positioning, coverage map, empirical grounding, design philosophy |
| `USER_MANUAL.md` | Complete documentation of all panels, metrics, systems, and interactions |
| `TEST_VERIFICATION.md` | Technical test cases; useful for understanding exact mechanics and expected values |
| `QUICK_START_CASUAL.md` | Companion guide for non-specialist users |
| `js/config.js` | All constants, preset values, stage definitions, threshold definitions |
| `js/simulation.js` | All processing methods with explicit drift rates and cross-effects |
| `js/companion.js` | Demographic companion module — population cohorts, strata dynamics, diffusion networks |
| `js/research_panel.js` | Research panel UI — parameter inspection, diagnostics, analysis tools |
| `js/validation_suite.js` | Validation framework — UQ, cross-validation, sensitivity analysis |
| `js/hindcast_runner.js` | Hindcast scenario runner — historical trajectory plausibility tests |
| `js/scenario_test_harness.js` | Calibration scenario harness — 12 directional-effect assertions |
| `validation_results/` | JSON output from validation runs |

---

*civ-sim occupies the space between academic rigor and practical accessibility. It sacrifices mathematical elegance for systemic breadth, and visual polish for informational transparency. The goal is structural plausibility: when you see inequality spiral, trust collapse, and institutions weaken in the simulation, the causal chain should match what researchers observe in the historical record — even if the specific numbers are simplified.*
