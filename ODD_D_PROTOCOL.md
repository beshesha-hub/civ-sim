# ODD+D Protocol: civ-sim Civilization Simulation Model

**Version:** September 2026
**Authors:** Barak Water
**Contact:** beshesha@gmail.com

*Prepared following the ODD+D protocol (Müller et al. 2013), extending the ODD protocol (Grimm et al. 2006, 2010) for models with explicit human decision-making representation. Adapted for macro-level simulation where civilizations, not individuals, are the primary entities.*

---

## 1. Overview

### 1.1 Purpose and Patterns

**Purpose.** civ-sim models the co-evolution of economic, social, cultural, ecological, demographic, and governance systems within and between civilizations over historical timescales (-4000 to 3000 CE). The model is designed for three purposes:

1. **Structural analysis:** Reproducing known causal relationships between societal systems (e.g., wealth concentration erodes trust, child survival drives fertility decline) to study how feedback loops create development trajectories, stagnation, and collapse.
2. **Counterfactual exploration:** Modeling novel or proposed societal configurations (e.g., currencyless economies, polycentric governance) that have no historical precedent, to approximate their structural dynamics under varying conditions.
3. **Policy impact approximation:** Estimating the direction and relative magnitude of policy interventions by tracing their propagation through interconnected systems, for use by researchers, educators, and policymakers.

The model targets *structural plausibility* rather than point prediction: the causal chains connecting variables should match the empirical and theoretical literature, even when specific numerical outputs are simplified.

**Patterns.** The model is validated against the following empirically observed patterns:

- **Demographic transition:** Mortality decline precedes fertility decline by 1-3 generations, producing a population bulge before stabilization (Notestein 1945, Caldwell 1982, Omran 1971).
- **Institutional persistence:** Extractive institutions persist for centuries because elites resist inclusive reform (Acemoglu & Robinson 2012). Critical junctures (crises) create windows for institutional change.
- **Trust-corruption feedback:** High corruption erodes social trust, which weakens the institutions that fight corruption, creating self-reinforcing low-trust equilibria (Knack & Keefer 1997, Rothstein & Stolle 2008).
- **Inequality-immobility trap:** Higher inequality predicts lower intergenerational mobility (Corak 2013, Great Gatsby Curve), and entrenched immobility reinforces inequality through political capture (Gilens & Page 2014).
- **Financial cycle endogeneity:** Stability breeds risk-taking and credit expansion that systematically creates crisis conditions (Minsky 1992, Kindleberger & Aliber 2011).
- **Developmental state pathway:** High state capacity with organized (predictable) corruption can drive rapid industrialization, as in East Asian economies (Johnson 1982, Amsden 1989, Wade 1990).
- **Democratic peace:** Democratic dyads fight each other at much lower rates, through shared norms, trade interdependence, and institutional constraints (Russett & Oneal 2001).
- **Power-empathy suppression:** Hierarchical power systematically reduces empathy in those who hold it (Keltner et al. 2003, Piff et al. 2012).
- **Climate tipping cascades:** Warming triggers irreversible state changes (permafrost methane, ice sheet destabilization) at specific thresholds (Lenton et al. 2019).

These patterns are not coded as outcomes. They emerge from the interaction of mechanistic subsystems, which serves as validation that the feedback structure is empirically grounded.

### 1.2 Entities, State Variables, and Scales

**Primary entity:** The civilization. civ-sim is a macro-level simulation; it does not model individual agents. Each civilization is characterized by approximately 130 state variables across 13 interacting domains. Within each civilization, five social strata are tracked (Elite, Upper Middle, Lower Middle, Working Class, Disenfranchised) with per-stratum empathy, prosocial behavior, power base, and wellbeing. A companion module extends the primary entity with sex-disaggregated demographics across 17 age cohorts per sex per stratum.

**Secondary entities:** Technologies (38 advances in a branching prerequisite tree), inter-civilization relations (bilateral trade, diplomacy, alliances, wars), organized crime networks (4 types), and religious institutions.

**State variables by domain:**

| Domain | Key Variables (0-100 scale unless noted) |
|--------|----------------------------------------|
| Economy | Wealth concentration, financial depth, debt load, labor share, trade dependency, Minsky cycle position, tariff level, land ownership concentration |
| Governance | Institutional quality, corruption level, state capacity (fiscal/administrative/coercive), legitimacy (level and type: traditional/charismatic/rational-legal), institutional lock-in, power concentration, military-civilian balance |
| Social | Social trust, social mobility (IGE), caste rigidity, ethnic fractionalization, political inclusion, cultural cohesion, anomie |
| Demographics | Population, fertility rate, mortality rate, life expectancy, infant mortality, demographic transition stage (1-5), urbanization, dependency ratio, age cohorts (youth/working/elderly) |
| Ecology | Forest cover, soil health, mineral reserves, water availability, pollution, waste, biodiversity, ocean health, EROI, carrying capacity, overshoot ratio |
| Climate | Atmospheric CO2 (ppm above 280 baseline), surface temperature anomaly (°C), deep ocean temperature, tipping point flags |
| Psychology | 10 behavioral axes (cooperation, competition, mutual aid, acquisitiveness, conformity, innovation, empathy, deference, individualism, collectivism), per-stratum empathy, cultural gap, consequence deficit |
| Technology | 38-advance tech tree (7 categories), automation level (0-5), tech unemployment |
| Infrastructure | Infrastructure level, maintenance debt, urbanization rate, energy system mix |
| Health | Disease burden, sanitation, healthcare access, food security, addiction epidemic level |
| Energy | Primary energy sources, EROI, decentralization level, renewable fraction |
| Information | Epistemic health, information ecosystem type, press freedom, media literacy, disinformation level |
| Military | Military power, military-civilian gap, coup risk |

**Spatial scale:** Each civilization occupies a set of terrain tiles on a hexagonal map. Terrain tiles have attributes (geology, biome, ocean access) that affect resource availability, disease burden, and natural disaster risk. Spatial resolution is at the civilization level; within-civilization regional variation is not modeled.

**Temporal scale:** Each simulation turn represents a variable time increment, typically 5-50 years depending on era (shorter for modern eras). The default resolution is 10 years per turn. The simulation spans from -4000 CE to 3000 CE (up to 700 turns at 10-year resolution).

### 1.3 Process Overview and Scheduling

Each turn, the model executes the following steps in fixed sequential order:

**Per-civilization processes** (83 methods, grouped by domain):

1. Human development: Education quality, gender equity, institutional quality, epistemic health
2. Demographics and economics: Demographics, financial system, sovereign debt, labor share, dual economy dynamics
3. Social fabric: Social trust, state capacity
4. Energy and environment: Energy production, environmental impact, carrying capacity
5. Infrastructure: Infrastructure, anomie, urbanization
6. Military and legitimacy: Military-civilian balance, legitimacy dynamics
7. Agriculture and food: Agriculture, food security, collective trauma
8. Social structure: Land ownership, caste, institutional lock-in, tech unemployment
9. Diversity and mobility: Ethnic fractionalization, social mobility, trade
10. Gender and family: Family structure, reproductive health, women's rights
11. Knowledge and culture: Science, innovation, space program, arts
12. Health: Healthcare, resource mediation
13. Information: Information ecosystem, media ecosystem
14. Demographic dynamics: Demographic transition, empathy cascade
15. Values: Generational drift, Inglehart post-materialism values
16. Social dynamics: Lowest-strata tension, empathy-reinforcement interaction, cultural gap, wealth capture
17. Paradigm dynamics: Paradigm shifts, consequence deficit, behavioral inertia, facilitation
18. Cooperation: Cooperative outcomes, threshold dynamics, cultural homogeneity, schism risk
19. Economic dynamics: Planned economy dynamics, developmental state dynamics
20. Risks: Pandemic, disinformation, AI disruption, natural disaster, addiction epidemic
21. Environment: Biodiversity, ocean health, environmental-society feedbacks
22. Economic forces: Natural economic forces, authoritarian anti-corruption
23. Recovery: Stability recovery, wellbeing recovery, resilience dampening
24. Participation: Participation dynamics, active travel, nutritional health
25. Attractors: Attractor dynamics, economic-governance pressure, governance evolution
26. Enforcement: Hierarchy caps/floors, education ceiling, IQ floor, trust bounds

**Global processes** (executed after all civilizations):

1. Climate: Global warming (DICE model aggregating all civilizations' emissions)
2. Expansion: Territorial expansion (Turchin meta-ethnic frontier)
3. Interaction: Inter-civilization interactions (trade, diplomacy, contagion)
4. Migration: Inter-civilization migration, diaspora networks
5. Trade: Trade network dynamics
6. Conflict: Water conflict escalation, war declarations (Kantian tripod), active wars (Lanchester)
7. History: Era transitions, historical events
8. Disease: Plague spread between connected civilizations

The processing order is designed to minimize order-dependency artifacts. For example, healthcare is processed before demographics so that improvements in healthcare quality affect mortality within the same turn.

---

## 2. Design Concepts

### 2.1 Theoretical and Empirical Background

civ-sim integrates findings from multiple disciplines. Unlike models that draw from a single theoretical tradition, civ-sim attempts to represent the empirically established relationships across economics, political science, sociology, psychology, neuroscience, demography, ecology, and climate science. Each subsystem is calibrated against specific research traditions:

| Subsystem | Primary Research Basis |
|-----------|----------------------|
| Wealth dynamics | Piketty 2014 (r > g); Bouchaud & Mezard 2000 (multiplicative models); Saez & Zucman (top shares) |
| Financial cycles | Minsky 1992; Keen 1995/2013; Kindleberger & Aliber 2011; Reinhart & Rogoff 2009; Schularick & Taylor 2012 |
| Trade | Tinbergen 1962 (gravity model); Stolper-Samuelson 1941 (distributional effects) |
| Institutions | Acemoglu, Johnson & Robinson 2001/2005/2012; North 1990; Evans & Rauch 1999 |
| State capacity | Besley & Persson 2011; Fukuyama 2011; Mann 1986 |
| Developmental states | Johnson 1982; Amsden 1989; Wade 1990; Shleifer & Vishny 1993 |
| Demographics | Notestein 1945; Caldwell 1982; Omran 1971 |
| Gender equity | Duflo 2012; Hsieh et al. 2019; Chattopadhyay & Duflo 2004 |
| Education | Hanushek & Woessmann 2012/2015; Pritchett 2001 |
| Social trust | Knack & Keefer 1997; Putnam 2000; Rothstein & Stolle 2008; Uslaner 2002 |
| Social mobility | Corak 2013; Chetty et al. 2014 |
| Ethnic conflict | Wimmer, Cederman & Min 2009; Horowitz 1985 |
| Generational values | Inglehart & Welzel 2005; World Values Survey |
| Behavioral dynamics | Keltner et al. 2003; Piff et al. 2012; Festinger 1957; Bourdieu 1977 |
| Climate | Nordhaus 2017 (DICE); IPCC AR6; Lenton et al. 2019 |
| Food security | FAO FIES 2023; Lagi et al. 2011/2015; Sen 1981 |
| Energy | Hall et al. (EROI); Smil 2017 |
| War and peace | Russett & Oneal 2001; Fearon 1995; Lanchester 1916; Turchin 2003/2006 |
| Military-civilian | Powell & Thyne 2011; Huntington 1957; Geddes 2003 |
| Collapse | Tainter 1988; Diamond 2005; Turchin 2003 |

Beginning with development pass 10, every coefficient carries a confidence tier: **M** (Measured — empirically grounded with direct measurement anchors), **I** (Inferred — interpolated between measured anchors), **T** (Theoretical — mechanism supported by research but magnitude assumed).

**Key design principle: absence of arbitrary assumptions.** The model is designed to exclude cultural, ideological, and teleological assumptions. Governance models are not ranked on a linear scale; GDP growth is not equated with wellbeing; there is no assumed endpoint toward which civilizations "should" progress. Only relationships with empirical and mathematical support are modeled. This principle extends to filtering assumptions embedded in mainstream simulators and conventional social science (e.g., the assumption that market economies are the natural or optimal economic form).

### 2.2 Individual Decision-Making

civ-sim does not model individual decision-making. Civilizations are aggregate entities, not collections of individual agents. Behavioral change at the civilization level is driven by structural incentives rather than individual cognition.

However, aggregate decision-like dynamics are modeled:

- **Governance response to pressure:** When economic or social pressure exceeds thresholds, governance evolves through reform (gradual) or revolution (discontinuous). The direction of change depends on the distribution of power, not on any optimization algorithm.
- **Technology adoption:** Follows a pressure-based system with Bass diffusion dynamics. Adoption pressure accumulates based on innovation culture, education, energy surplus, and trade-network imitation. Value resistance modulates adoption (e.g., theocratic societies resist information technologies).
- **Paradigm shifts:** Economic and governance transitions occur when cumulative pressure exceeds system resilience. These are not "decisions" but threshold-crossing events triggered by structural conditions.
- **War declarations:** Follow the Kantian tripod (democratic peace), Fearon bargaining model (power asymmetry), and Organski power transition theory. War probability is computed from structural dyadic variables, not from a decision-making algorithm.

**Rationale for no individual decision model:** The model operates at civilizational timescales (decades to millennia). At these scales, individual decisions average out and structural forces dominate. The relevant "decisions" are institutional responses to structural pressure, which are better modeled as threshold dynamics than as optimizing agents.

### 2.3 Learning

Civilizations do not "learn" in the reinforcement-learning sense. However, several mechanisms represent institutional and cultural memory:

- **Crisis memory:** Financial crises generate a "memory" that dampens risk-taking for 2-3 decades (Reinhart & Rogoff 2009), modeled as Minsky cycle cooling.
- **Collective trauma:** Wars, famines, and genocides generate trauma that persists for 3-5 generations, affecting trust, stability, and behavioral values.
- **Institutional lock-in:** Path dependency (North 1990) means past institutional choices constrain future options. High lock-in makes reform difficult regardless of pressure.
- **Generational value drift:** Values shift in response to formative conditions with a 2-3 turn (20-30 year) lag (Inglehart & Welzel 2005), representing intergenerational cultural learning.
- **Behavioral inertia:** After structural change, old behaviors persist for years or decades (Bourdieu 1977 habitus), with adaptation rate dependent on education and institutional quality.

### 2.4 Individual Sensing

Not applicable. Civilizations are not sensing agents. The closest analogue is **epistemic health** — the quality of a civilization's information environment, which determines how accurately the aggregate population perceives its own conditions. Low epistemic health (state-controlled media, high disinformation) means corruption and inequality erode trust less because populations are less aware of them (modulated by `corrAwareness` and `wcAwareness` variables).

### 2.5 Individual Prediction

Not applicable. Civilizations do not make predictions. The model is entirely reactive: systems respond to current state, not to forecasted future state.

### 2.6 Interaction

**Between civilizations:**
- **Trade:** Bilateral trade intensity follows the Tinbergen gravity model. Trade dependency creates economic interconnection and behavioral contagion (norms flow between trading partners). Stolper-Samuelson distributional effects mean trade's inequality impact depends on factor abundance.
- **War:** Follows Kantian tripod (democratic peace), Fearon bargaining (power asymmetry reduces conflict), Organski power transition (near-parity between hostile states increases conflict). Combat follows Lanchester's square law.
- **Contagion:** Behavioral norms (cooperation, cynicism, epistemic health) drift toward the values of trading partners, weighted by trade intensity.
- **Migration:** Labor and refugee flows between civilizations based on push (instability, poverty) and pull (opportunity, safety) factors.
- **Territorial expansion:** Follows Turchin's meta-ethnic frontier theory, with group cohesion (asabiya) building from stability and legitimacy.

**Within civilizations (between strata):**
- Power-empathy cascade: Higher strata suppress empathy in proportion to their power over lower strata.
- Wealth capture: Concentrated wealth captures institutional, electoral, media, and cultural channels.
- Social mobility: Intergenerational mobility flows between strata, governed by the Great Gatsby Curve.

### 2.7 Collectives

The five social strata function as collectives with emergent group properties:

- **Elite** (power base 0.90): Heaviest empathy suppression. Drives institutional capture when empathy is low.
- **Upper Middle** (power base 0.58): Substantial suppression. Professional/managerial class.
- **Lower Middle** (power base 0.32): Moderate suppression. Small business owners, petty officials.
- **Working Class** (power base 0.10): Minimal suppression. Limited institutional power.
- **Disenfranchised** (power base 0.00): No power-based suppression. Highest empathy capacity, but lowest material capacity to act on it. Subject to cooperation-vs-competition tension driven by resource scarcity.

The companion module adds collective action dynamics: when shared grievances exceed a threshold and network density is sufficient, coordinated social movements can emerge (following Olson's logic of collective action and Granovetter's threshold models).

### 2.8 Heterogeneity

**Between civilizations:** Civilizations differ in governance model (15 types), economic model (9 types + custom), operating principles (freedom, collectivism, innovation tolerance), religion, geography (terrain, ocean access, resources), and all state variables. No two civilizations share the same trajectory.

**Within civilizations:** The five social strata represent vertical heterogeneity. The companion module adds sex-disaggregation (differential access to education, labor, healthcare by sex) and 17 age cohorts. Population susceptibility to behavioral influence follows a bimodal-plus-gamma distribution with a 14-28% resistant fraction, representing neurobiological heterogeneity in response to power and propaganda.

**Between economic models:** Each economic model generates distinct behavioral incentive patterns (what behaviors are rewarded vs. stated), creating qualitatively different development trajectories rather than parametric variants of a single model.

### 2.9 Stochasticity

All simulation-relevant randomness flows through a seeded pseudo-random number generator (Mulberry32 algorithm). Given the same seed and parameters, the simulation produces identical trajectories, enabling reproducibility and sensitivity analysis.

Stochastic elements include:
- **Financial crises:** Probability escalates above Minsky cycle phase 70, following Schularick & Taylor 2012 credit-boom frequency data.
- **Coups:** Probability computed from 7 multiplicative factors (Powell & Thyne 2011). Base 50% success rate modified by trust and capacity.
- **Natural disasters:** Geological risk from terrain attributes. Extreme weather probability scales as temperature-anomaly squared.
- **Pandemics:** Probability computed from urbanization, trade links, sanitation, and healthcare.
- **Civil wars:** Triggered by exclusion risk (Wimmer et al. 2009) exceeding stability-dependent thresholds.

Non-simulation randomness (NPC dialogue, visual effects) uses `Math.random()` and does not affect reproducibility.

### 2.10 Observation

Per-turn state snapshots are recorded for all variables. The model provides:
- **Research CSV export:** Complete trajectory data for all variables.
- **In-panel charts:** 50-turn ring buffers for economic and resource history.
- **Validation framework:** Uncertainty quantification across 12 countries, hindcast validation against 4 historical trajectories, and robustness analysis.
- **Lab Mode (counterfactual analysis):** Snapshot, fork, and trajectory comparison tools for controlled counterfactual experiments and diagnostic decomposition.
- **Custom Events:** 12 presets with 20 sliders and structural modifiers for injecting specific historical shocks and policy interventions.
- **Trace mode:** Per-turn variable logs for diagnostic analysis.

---

## 3. Details

### 3.1 Implementation Details

civ-sim is implemented in JavaScript (ES6+) for browser execution. The core simulation engine is a single file (`simulation.js`, approximately 17,700 lines) containing 83+ process methods. The companion module (`companion.js`) provides disaggregated demographics. The model runs in a web browser without server-side computation, enabling deployment as a static web application or Electron desktop application.

**Software requirements:** Node.js v18+ for development server; any modern web browser for execution.

**Source availability:** The complete source code, including all validation infrastructure, is available at the project repository.

**Computational requirements:** A single 250-turn simulation with 4 civilizations completes in under 2 seconds on a 2020-era consumer laptop. The 20-seed UQ validation suite (12 countries x 20 seeds = 240 runs) completes in approximately 60 seconds.

### 3.2 Initialization

Civilizations are initialized through an 11-step configuration wizard that sets:

1. **Identity:** Name, color, start year.
2. **Role:** Player role (founder, advisor, observer).
3. **Governance:** Model type (15 options), determining hierarchy level, power concentration, and behavioral modifiers.
4. **Economy:** Model type (9 options + custom), determining incentive structures, wealth accumulation patterns, and financial system properties.
5. **Operating principles:** Freedom level (0-100), collectivism level (0-100), innovation tolerance, outsider relationship policy.
6. **Religion:** Type, state relationship, fundamentalism level.
7. **Geography:** World climate, terrain tags, ocean access.
8. **Initial conditions:** Education tier and quality, gender equity, debt model, tariff level.
9. **Family and culture:** Family structure, reproductive health, women's rights, science and arts support/freedom.
10. **Healthcare and resources:** Healthcare access/emphasis/incentive, resource strategy, obsolescence type.
11. **Information:** Information ecosystem type.

State variables not explicitly set receive smart defaults derived from the civilization's configuration. For example, a theocratic autocracy with low education receives default institutional quality of ~30, while a democratic society with universal education receives ~65.

**Calibration scenarios** use explicit initial state overrides to match real-world country profiles (e.g., Brazil: corruption 55, institutional quality 38, state capacity 42, social trust 7, ethnic fractionalization 54).

### 3.3 Input Data

**No external time-series data drives the model during a run.** All dynamics are endogenous — state at turn T+1 is computed entirely from state at turn T plus stochastic events. This is a deliberate design choice: the model should reproduce patterns from internal structure, not from external data injection.

**Calibration data (used for validation only, not as model input):**
- World Bank World Development Indicators (GDP, Gini, life expectancy)
- V-Dem v14 (institutional quality, political participation, press freedom)
- UNDP Human Development Report (education, gender equity)
- World Governance Indicators (state capacity, corruption)
- World Values Survey (social trust, generational values)
- Transparency International Corruption Perceptions Index
- WIDER World Income Inequality Database (wealth concentration)
- UN World Population Prospects (demographic structure)

### 3.4 Submodels

Selected key submodels are described below. For the complete specification of all 83+ process methods, see the source code (`simulation.js`) with inline documentation.

#### 3.4.1 Institutional Quality (Inclusive vs. Extractive Dynamics)

Following Acemoglu & Robinson (2012), institutional quality (IQ, 0-100) evolves as the balance between inclusive and extractive pressures.

**Inclusive pressures** (promote institutional improvement):
- Distributed power (low power concentration)
- Civilian control of military (low military-civilian gap)
- Education quality (Hanushek & Woessmann)
- Social trust (Rothstein & Stolle 2008)
- Epistemic health (quality of information environment)
- Legitimacy (rational-legal > traditional/charismatic)
- Authoritarian state-building (developmental state pathway, Johnson 1982)

**Extractive pressures** (promote institutional degradation):
- Wealth concentration (Gilens & Page 2014 elite capture)
- Corruption (self-reinforcing below IQ threshold, North 1990)
- War and instability
- Autocratic governance (concentrated decision-making)
- Low freedom (suppressed civic engagement)
- Extreme inequality + corruption trap (North, Wallis & Weingast 2009 limited access orders)

**Key mechanism — corruption-IQ feedback:** A sigmoid function gates the effect of corruption on inclusive dynamics: `corrFactor = 1 / (1 + exp((corruption - 25) / 8))`. This creates an inflection point at corruption ~25, below which institutions improve freely and above which corruption increasingly blocks improvement. This produces bistability: the system tends toward either a high-IQ/low-corruption attractor or a low-IQ/high-corruption attractor, with no stable equilibrium at moderate levels — matching the empirical pattern where middle-income countries tend toward one attractor or the other over time.

**Dampening mechanisms:** Olson (1982) institutional sclerosis reduces improvement rate above IQ 80. Elite capture of enforcement (Gilens & Page 2014, Winters 2011) reduces anti-corruption effectiveness when wealth is concentrated. Concentrated wealth dampens positive institutional drift through lobbying and regulatory capture (Acemoglu & Robinson 2012).

#### 3.4.2 Social Trust

Social trust (0-100) evolves through multiple building and erosion channels:

**Building channels:**
- Baseline human social instinct recovery (+0.15/decade, Henrich 2016)
- Institutional trust-building: accountable institutions that deliver fair outcomes (Rothstein & Stolle 2008), gated by accountability score and modulated by corruption
- Performance legitimacy: states that deliver outcomes regardless of governance form (Lipset 1959, Zhao 2009), gated by state capacity discounted for corruption
- Petrostate social contract: resource-rich autocracies generate trust through direct material provision (Ross 2012, Hertog 2010, Beblawi 1987)
- Procedural legitimacy: broad participation creates perceived fairness (Rothstein & Stolle 2008)
- Low-corruption, high-stability bonus

**Erosion channels:**
- Corruption (Knack & Keefer 1997), modulated by information access (corrAwareness)
- Inequality (Uslaner 2002, Rothstein & Uslaner 2005), modulated by information access (wcAwareness) and buffered by strong redistributive institutions (Kenworthy 2004)
- Ethnic fractionalization (Alesina & La Ferrara 2002), partially bridged by inclusive institutions (Varshney 2002)
- Polarization (Haidt 2012, Putnam 2000)
- War
- Strata dissatisfaction (Wilkinson & Pickett 2009)

**Structural bounds:**
- **Trust ceiling:** Base 78 minus drags from inequality, fractionalization, corruption, and polarization. No WVS-surveyed country sustains trust above ~76%.
- **Trust floor:** Base 5 plus components from ethnic homogeneity (Fukuyama 1995), institutional quality, community bonds (collectivism), economic function (Greif 2006), voluntary association (freedom), and petrostate welfare (Ross 2012). Even the most challenging environments sustain minimum trust through informal networks.

**Information modulation:** Citizens can only lose trust over problems they perceive. In information-controlled environments, corruption and inequality exist but produce less trust erosion (Huang 2015, Zhu et al. 2019). `corrAwareness = 0.4 + 0.6 * (epistemicHealth / 100)` ensures a floor of 0.4 from direct personal experience.

#### 3.4.3 Financial Cycles (Minsky-Kindleberger)

Financial dynamics follow the Minsky Financial Instability Hypothesis with Kindleberger historical calibration:

**Five phases:** Recovery (0-20) → Hedge stability (20-40) → Boom (40-60) → Euphoria (60-80) → Distress/Panic (80-100).

**Endogenous dynamics:** During stability, credit expands and risk appetite increases (the Minsky mechanism: "stability is destabilizing"). Crisis probability escalates nonlinearly above phase 70, following Schularick & Taylor 2012 empirical credit-boom data. Crisis severity is calibrated to Reinhart & Rogoff 2009 historical databases.

**Cross-system effects:** Crises reduce wellbeing, increase inequality (differential asset recovery), erode institutional quality, and trigger demographic effects (reduced fertility, increased mortality). Crisis memory dampens the cycle for 2-3 decades. Institutional quality provides resilience (Evans & Rauch 1999).

#### 3.4.4 Demographic Transition

A five-stage model (Notestein 1945, Caldwell 1982, Omran 1971):

1. **Pre-transition:** High fertility, high mortality. Population stable.
2. **Early transition:** Mortality declining (sanitation, food security). Fertility still high. Population growing rapidly.
3. **Mid-transition:** Fertility declining (child survival, female education, urbanization). Population growth slowing.
4. **Late transition:** Low fertility, low mortality. Population stabilizing. Aging begins.
5. **Second transition:** Below-replacement fertility. Population aging and potentially declining.

Stage is **derived from actual fertility and mortality rates** rather than set exogenously, following the Caldwell child-survival hypothesis: when infant mortality drops below ~50 per 1000, parents begin reducing family size. Education and gender equity accelerate the transition. The companion module extends this with 17 age cohorts per sex, enabling precise tracking of demographic momentum, dependency ratios, and age-specific effects.

#### 3.4.5 Climate (DICE Integrated Assessment)

Following Nordhaus 2017:

1. **Emissions:** Computed from fossil fuel energy sources, scaled by civilization count and technology level.
2. **CO2 concentration:** Atmospheric accumulation with natural sinks.
3. **Radiative forcing:** `F = 5.35 * ln(CO2/280)` W/m² (logarithmic, following climate physics).
4. **Temperature response:** Two-box thermal model with surface lag (0.25/turn), ocean coupling (0.05/turn), and deep ocean lag (0.02/turn). Climate sensitivity = 3.0°C per CO2 doubling.
5. **Damage:** `D(T) = 0.00236 * T²` (Nordhaus quadratic).
6. **Tipping points:** Four thresholds following Lenton et al. 2019: permafrost methane (1.5°C), ice sheet destabilization (2°C), AMOC weakening (3.5°C), hothouse Earth (5°C).

#### 3.4.6 Power-Empathy Suppression

A distinctive mechanism based on Keltner et al. 2003, Piff et al. 2012, and Guinote 2017:

Power over others systematically suppresses empathy through neuropsychological mechanisms analogous to behavioral addiction (variable-ratio reinforcement downregulating prosocial responses). Suppression operates as a gradient through all five strata, proportional to each stratum's power base. The effective hierarchy is the maximum of governance hierarchy and economic power hierarchy (the "dual power source"), meaning a flat-governance society with extreme wealth concentration exhibits plutocratic empathy suppression.

**Key asymmetry:** Suppression rate is 2x recovery rate, reflecting the empirical observation that power's psychological effects are acquired more quickly than reversed.

#### 3.4.7 War and Territorial Expansion

**War declaration** follows three complementary frameworks:
- **Kantian tripod** (Russett & Oneal 2001): Democratic dyads have 85% lower war probability. Trade interdependence further reduces conflict. High institutional quality on both sides adds braking.
- **Fearon bargaining** (1995): Highly asymmetric power makes outcomes predictable, reducing conflict.
- **Organski power transition** (1958): Near-parity between hostile civilizations increases war risk.

**Combat** follows Lanchester's square law: a 2:1 power advantage yields a 4:1 casualty advantage.

**Territorial expansion** follows Turchin's meta-ethnic frontier theory (2003/2006): group cohesion (asabiya) builds from stability, legitimacy, and trust. Frontier effects amplify cohesion. Imperial overstretch works against expansion.

---

## 4. Validation

### 4.1 Validation Framework

civ-sim employs a multi-level validation strategy:

**Level 1: Uncertainty Quantification (UQ).** 12 calibration country scenarios (Denmark, USA, China, Nigeria, Saudi Arabia, Singapore, Brazil, Russia, Japan, Germany, India, South Korea), each configured with real-world institutional, economic, and social parameters from World Bank/V-Dem/UNDP/WVS data. For each country, N seeds are run (default 20) and the p10-p90 interval is computed for three target variables (social trust, wealth concentration, corruption). Real-world targets are tested for coverage within the p10-p90 interval.

**Current score: ~10-13/36 targets covered (28-36%).**

**Level 2: Hindcast.** Four historical trajectories are reproduced from initial conditions without external forcing: South Korea 1960-2010 (developmental state to democracy), Chile 1970-2000 (democracy → coup → neoliberalism → re-democratization), Russia 1985-2015 (Soviet collapse → oligarchy → re-centralization), Rwanda 1990-2020 (genocide → recovery → developmental state). Each trajectory tests 7-11 waypoint expectations.

**Current score: ~27-29/38 checks pass (71-76%).**

**Level 3: Historical Scenarios (Tuning Set).** 10 historical civilizations (Rome, Song Dynasty, Haudenosaunee, British Industrial Revolution, Scandinavian Social Democracy, Khmer Empire, Ottoman Empire, Post-Colonial Sub-Saharan State, Classical Athens, Soviet Union) with quantified expectations.

**Current score: 86.2% pass rate.**

**Level 4: Held-Out Validation.** 8 scenarios (Tokugawa Japan, Mughal India, Venetian Republic, Ptolemaic Egypt + 4 novel configurations) never used for parameter tuning.

**Current score: 68.2% pass rate.**

**Level 5: Robustness.** Coefficient of variation across 20 seeds for 120 output variables across 12 countries. Target: CV < 15% (robust), 15-30% (moderate), >30% (noisy).

**Current score: ~92/120 outputs robust (~77%).**

**Level 6: Invariant Suite.** 13 regression checks including reproducibility (identical seed → identical output), NaN guards, discontinuity prevention, and cap enforcement. **All 13 pass.**

### 4.1a Counterfactual Analysis (Lab Mode)

The model includes a counterfactual analysis framework (Lab Mode) that enables snapshot, fork, and trajectory comparison for controlled diagnostic experiments. This capability was used to conduct a 7-country diagnostic classifying UQ deviations as **structural** (inherent to general mechanisms) versus **configurable** (addressable through initial configuration or event injection):

| Country | Error | Classification | Notes |
|---------|-------|---------------|-------|
| China | 4.9 | Near-perfect | General mechanisms sufficient |
| Russia | 12.7 | Good | No country-specific tuning needed |
| Germany | 39.8 → 6.1 | Configurable | Reunification-era event injection reduces error to 6.1 |
| USA | 34.5 | Structural | Polarization-media feedback not captured by general mechanisms |
| India | 25.4 | Structural | Corruption-IQ bistability; informal economy effects |
| Nigeria | 18.4 | Structural | Resource-curse governance; informal economy |
| Singapore | 52.3 | Structural | City-state architecture incompatible with nation-state model (events help 19%) |

This diagnostic capability also serves as a validation tool: by decomposing sources of model-reality deviation, it distinguishes calibration failures from genuine coverage limits.

### 4.1b Bug Fix: Freedom Tracking

A bug was identified where freedom level was read from the `state` object rather than from `operatingPrinciples`, where it is actually stored. Freedom is a configuration parameter set during setup (Step 5) and tracked in `operatingPrinciples.freedom`. This affected downstream calculations in epistemic health, institutional dynamics, and behavioral values. The fix ensures consistent reference to `operatingPrinciples.freedom` throughout the codebase.

### 4.2 Known Limitations

1. **Corruption-IQ bistability:** The sigmoid feedback between corruption and institutional quality creates an attractor landscape with no stable equilibrium at moderate IQ (60-70). Countries like Brazil and India are drawn to the wrong attractor in UQ scenarios.

2. **City-state dynamics:** Singapore's governance model (high state capacity, low corruption, high inequality) is not well-represented by the nation-state architecture.

3. **Germany systematic overshoot:** All three German targets (trust, WC, corruption) deviate in the same direction, suggesting a configuration or structural issue possibly related to reunification effects.

4. **No individual agents:** Phenomena arising specifically from individual-level heterogeneity within strata cannot be captured.

5. **Single-turn resolution:** No sub-turn dynamics; interactions within a turn are order-dependent.

6. **Spatial homogeneity within civilizations:** Regional inequality, urban-rural divides, and geographic economic specialization are not modeled.

### 4.3 UQ Coverage: Design Rationale

The 28-36% UQ coverage reflects a deliberate architectural choice. civ-sim models the interoperation of complex systems and general mechanisms — it does not code to specific countries. The remaining gap is driven by:

**Country-specific factors absent by design.** Germany's trust overshoot (model ~63, real 44) stems from the East-West reunification deficit, immigration tensions, and historically specific institutional relationships that are not generalizable mechanisms. Singapore's city-state governance cannot be represented by a nation-state architecture. The USA's corruption gap reflects a uniquely polarized media-institutional feedback loop. Encoding these as country-specific parameters would improve UQ scores at the cost of the model's core purpose: representing general dynamics that apply to any societal configuration, including novel ones.

**Structural ceiling for global parameters.** Extensive iteration (5+ rounds of coefficient adjustment across corruption generation, trust saturation, and decay mechanisms) confirmed that every global change that improves coverage for some countries causes equivalent regressions for others. This is not a tuning failure — it reflects the irreducible heterogeneity among 12 countries with fundamentally different institutional histories operating under shared general mechanisms.

**Deliberate avoidance of overfitting.** Higher UQ scores are achievable through country-specific calibration, but this would (a) sacrifice the model's ability to simulate novel paradigms (currencyless economies, polycentric governance, post-scarcity configurations), (b) embed the assumption that existing societies are the reference frame, and (c) violate the core design principle that no form of social organization is treated as inevitable or normative.

The 28-36% should be read as: when general mechanisms are applied to 12 diverse real-world societies without country-specific tuning, about one-third of target variables fall within the model's uncertainty range. The hindcast score (71-76% across 4 historical trajectories) provides stronger validation that the dynamic mechanisms are structurally sound. The 7-country counterfactual diagnostic (see Section 4.1a) further clarifies this: countries where general mechanisms suffice (China, Russia) achieve low error, countries with historically specific shocks (Germany) become configurable through event injection, and countries with fundamental architectural mismatches (Singapore, USA) show irreducible structural error.

### 4.4 Characterization of UQ Misses

The 25 missed UQ targets are not uniformly distributed in severity. Analysis of the gap between target values and the nearest edge of the p10-p90 interval reveals three tiers:

**Near misses (within 5 points): ~7 targets.** These would be covered under a p5-p95 interval (a standard alternative). Examples: Denmark trust (range 68-72, target 74), China corruption (range 36, target 39), Saudi corruption (range 49-50, target 47), Russia WC (range 80-85, target 78). The model captures the correct dynamics; the gap is within measurement uncertainty of the real-world benchmarks themselves.

**Moderate misses (5-15 points): ~12 targets.** The model tracks the correct direction and relative ordering but over- or undershoots the equilibrium. Examples: USA corruption (range 34-38, target 27), Russia trust (range 18-21, target 28), Singapore WC (range 58-59, target 45), Germany corruption (range 12, target 22). These reflect the expected precision limit of general mechanisms applied without country-specific calibration.

**Large misses (>15 points): ~6 targets.** These represent structural limitations where country-specific factors dominate: USA trust (range 19-20, target 37 — uniquely polarized media-institutional dynamics), Germany trust (range 62-64, target 44 — East-West reunification deficit), Brazil corruption (range 37-42, target 62 — corruption-IQ bistability), India corruption (range 37-44, target 61 — same bistability), Nigeria WC (range 81-86, target 67 — informal economy effects), Saudi trust (range 37-38, target 53 — rentier-state social contract).

**Critically, the model preserves correct relative ordering across countries.** High-corruption countries (Nigeria, Russia, Brazil) score high; low-corruption countries (Denmark, Singapore) score low. High-trust societies (Denmark, China) outrank low-trust ones (Brazil, Nigeria). High-inequality countries (Brazil, USA) separate from egalitarian ones (Denmark, Japan). Only Germany exhibits a systematically wrong-direction result across multiple targets, attributable to the reunification effect — a historically specific phenomenon that no general mechanism can capture without encoding Germany-specific parameters.

In summary: the model approximates the structural contours of real-world behavior across 12 diverse societies. The gap is in equilibrium precision, not in the direction or character of the dynamics. This is the expected signature of a general-mechanism model that deliberately avoids country-specific fitting.

**An analogy to climate modeling.** The relationship between civ-sim's general mechanisms and specific country outcomes parallels the relationship between climate models and specific weather events. Climate models correctly predict that certain regions will be tornado-prone, that warmer oceans will intensify hurricanes, that the Arctic will warm faster than the tropics — the structural patterns and statistical distributions. But they do not predict that a specific Category 3 hurricane will make landfall at a particular city on a particular date. That depends on initial conditions below the model's spatial and temporal resolution.

civ-sim operates analogously: it correctly predicts that high-corruption, low-institution societies will exhibit low social trust and high wealth concentration; that extractive governance produces inequality; that ethnic fractionalization interacts with corruption to erode social cohesion. The relative ordering of countries across these dimensions is preserved. But it cannot predict that Germany's social trust will be exactly 44 rather than 63, because that depends on historically specific factors (the East-West reunification deficit, immigration-driven institutional strain) that sit below the model's mechanism resolution — the same way individual convective cells sit below a climate model's grid spacing.

There is one important distinction: climate models face a *physical* resolution limit rooted in chaotic sensitivity to initial conditions (Lorenz 1963). civ-sim faces a *design* resolution limit — country-specific parameters could be added to improve precision for known societies, but doing so would sacrifice the model's ability to simulate novel configurations that do not map to any existing country. The resolution limit is a principled trade-off, not an inability. The general mechanisms are analogous to physical equations: F = ma does not specify where a particular ball will land until the initial conditions are supplied, but this is not a failure of Newtonian mechanics. The UQ coverage measures how well general mechanisms approximate 12 specific sets of societal "initial conditions." The targets that fall within the uncertainty interval are cases where general mechanisms are sufficient; the targets that miss are cases where country-specific conditions dominate — and the miss characterization above shows that even those cases typically preserve the correct direction and approximate magnitude.

### 4.5 Sensitivity Analysis

One-at-a-time parameter sweeps on the USA calibration scenario identify the most influential parameters. Key findings:
- Social trust is most sensitive to corruption level, wealth concentration, and institutional quality — matching the empirical literature.
- Institutional quality is most sensitive to corruption, power concentration, and education quality.
- Stability is most sensitive to food security, legitimacy, and social trust.

---

## 5. Submission Information

### 5.1 Target Venues

This model description is prepared for submission to:

1. **Journal of Artificial Societies and Social Simulation (JASSS):** The primary venue for simulation model descriptions, requiring ODD protocol format. JASSS publishes peer-reviewed descriptions of social simulation models.

2. **SocArXiv:** Open-access preprint server for social sciences. The ODD+D protocol document and model source code will be deposited as a preprint for immediate availability while peer review proceeds.

3. **Ronin Institute:** Independent scholarship platform. civ-sim is developed as independent research outside traditional academic institutions. The Ronin Institute provides affiliation for independent scholars.

4. **SESMO (Society for the Empirical Study of Macro-level Organization):** Professional society focused on macro-level social simulation. Conference presentation and proceedings publication.

### 5.2 Reproducibility

The complete source code, validation scripts, calibration data, and this ODD+D protocol are available at the project repository. All simulation results can be reproduced by running the validation suite with specified seeds. The seeded PRNG ensures exact reproducibility: given the same seed and parameters, the simulation produces identical trajectories across platforms and sessions.

### 5.3 Recommended Review Criteria

Following JASSS editorial guidelines, we suggest reviewers evaluate:

1. **Structural plausibility:** Do the causal chains match the empirical literature? Are feedback loops grounded in specific research traditions?
2. **Empirical grounding:** Are coefficient choices justified? Do confidence tiers (M/I/T) accurately reflect the evidence base?
3. **Validation rigor:** Are the UQ, hindcast, and held-out validation procedures appropriate? Are the scores interpretable?
4. **Transparency:** Are all mechanisms documented and inspectable?
5. **Novel paradigm flexibility:** Can the model meaningfully represent societies that differ fundamentally from existing ones?

---

## References

Acemoglu, D., & Restrepo, P. (2018/2020). Automation and new tasks: How technology displaces and reinstates labor. *Journal of Economic Perspectives, 33*(2), 3-30.

Acemoglu, D., & Robinson, J. A. (2012). *Why Nations Fail.* Crown Business.

Acemoglu, D., Johnson, S., & Robinson, J. A. (2001). The colonial origins of comparative development. *American Economic Review, 91*(5), 1369-1401.

Alesina, A., & La Ferrara, E. (2002). Who trusts others? *Journal of Public Economics, 85*(2), 207-234.

Amsden, A. H. (1989). *Asia's Next Giant: South Korea and Late Industrialization.* Oxford University Press.

Bartels, L. M. (2008). *Unequal Democracy.* Princeton University Press.

Beblawi, H. (1987). The rentier state in the Arab world. *Arab Studies Quarterly, 9*(4), 383-398.

Besley, T., & Persson, T. (2011). *Pillars of Prosperity.* Princeton University Press.

Bouchaud, J. P., & Mezard, M. (2000). Wealth condensation in a simple model of economy. *Physica A, 282*, 536-545.

Bourdieu, P. (1977). *Outline of a Theory of Practice.* Cambridge University Press.

Caldwell, J. C. (1982). *Theory of Fertility Decline.* Academic Press.

Chattopadhyay, R., & Duflo, E. (2004). Women as policy makers. *Econometrica, 72*(5), 1409-1443.

Chetty, R., et al. (2014). Where is the land of opportunity? *Quarterly Journal of Economics, 129*(4), 1553-1623.

Corak, M. (2013). Income inequality, equality of opportunity, and intergenerational mobility. *Journal of Economic Perspectives, 27*(3), 79-102.

Diamond, J. (2005). *Collapse.* Viking Press.

Duflo, E. (2012). Women empowerment and economic development. *Journal of Economic Literature, 50*(4), 1051-1079.

Evans, P., & Rauch, J. E. (1999). Bureaucracy and growth. *American Sociological Review, 64*(5), 748-765.

Fearon, J. D. (1995). Rationalist explanations for war. *International Organization, 49*(3), 379-414.

Festinger, L. (1957). *A Theory of Cognitive Dissonance.* Stanford University Press.

Fukuyama, F. (2011). *The Origins of Political Order.* Farrar, Straus and Giroux.

Gilens, M., & Page, B. I. (2014). Testing theories of American politics. *Perspectives on Politics, 12*(3), 564-581.

Grimm, V., et al. (2006). A standard protocol for describing individual-based and agent-based models. *Ecological Modelling, 198*(1-2), 115-126.

Grimm, V., et al. (2010). The ODD protocol: A review and first update. *Ecological Modelling, 221*(23), 2760-2768.

Guinote, A. (2017). How power affects people. *Current Directions in Psychological Science, 26*(2), 110-115.

Hanushek, E. A., & Woessmann, L. (2012). Do better schools lead to more growth? *Journal of Economic Growth, 17*(4), 267-321.

Henrich, J. (2016). *The Secret of Our Success.* Princeton University Press.

Hertog, S. (2010). *Princes, Brokers, and Bureaucrats.* Cornell University Press.

Horowitz, D. L. (1985). *Ethnic Groups in Conflict.* University of California Press.

Hsieh, C. T., et al. (2019). The allocation of talent and US economic growth. *Econometrica, 87*(5), 1439-1474.

Huang, H. (2015). International knowledge and domestic evaluations in a changing society. *American Political Science Review, 109*(3), 613-634.

Huntington, S. P. (1957). *The Soldier and the State.* Harvard University Press.

Inglehart, R., & Welzel, C. (2005). *Modernization, Cultural Change, and Democracy.* Cambridge University Press.

Johnson, C. (1982). *MITI and the Japanese Miracle.* Stanford University Press.

Keen, S. (1995). Finance and economic breakdown. *Journal of Post Keynesian Economics, 17*(4), 607-635.

Keltner, D., Gruenfeld, D. H., & Anderson, C. (2003). Power, approach, and inhibition. *Psychological Review, 110*(2), 265-284.

Kenworthy, L. (2004). *Egalitarian Capitalism.* Russell Sage Foundation.

Kindleberger, C. P., & Aliber, R. Z. (2011). *Manias, Panics, and Crashes* (6th ed.). Palgrave Macmillan.

Knack, S., & Keefer, P. (1997). Does social capital have an economic payoff? *Quarterly Journal of Economics, 112*(4), 1251-1288.

Lagi, M., et al. (2011). The food crises and political instability in North Africa and the Middle East. *NECSI Working Paper.*

Lanchester, F. W. (1916). *Aircraft in Warfare.* Constable and Company.

Lenton, T. M., et al. (2019). Climate tipping points — too risky to bet against. *Nature, 575*, 592-595.

Mann, M. (1986). *The Sources of Social Power, Vol. 1.* Cambridge University Press.

Minsky, H. P. (1992). The financial instability hypothesis. *Levy Economics Institute Working Paper No. 74.*

Moene, K. O., & Wallerstein, M. (2001). Inequality, social insurance, and redistribution. *American Political Science Review, 95*(4), 859-874.

Müller, B., et al. (2013). Describing human decisions in agent-based models — ODD+D, an extension of the ODD protocol. *Environmental Modelling & Software, 48*, 37-48.

Nordhaus, W. D. (2017). Revisiting the social cost of carbon. *PNAS, 114*(7), 1518-1523.

North, D. C. (1990). *Institutions, Institutional Change and Economic Performance.* Cambridge University Press.

North, D. C., Wallis, J. J., & Weingast, B. R. (2009). *Violence and Social Orders.* Cambridge University Press.

Notestein, F. W. (1945). Population: The long view. In T. W. Schultz (Ed.), *Food for the World.* University of Chicago Press.

Olson, M. (1982). *The Rise and Decline of Nations.* Yale University Press.

Omran, A. R. (1971). The epidemiological transition. *Milbank Memorial Fund Quarterly, 49*(4), 509-538.

Organski, A. F. K. (1958). *World Politics.* Knopf.

Piketty, T. (2014). *Capital in the Twenty-First Century.* Harvard University Press.

Piff, P. K., et al. (2012). Higher social class predicts increased unethical behavior. *PNAS, 109*(11), 4086-4091.

Powell, J. M., & Thyne, C. L. (2011). Global instances of coups from 1950 to 2010. *Journal of Peace Research, 48*(2), 249-259.

Putnam, R. D. (2000). *Bowling Alone.* Simon & Schuster.

Reinhart, C. M., & Rogoff, K. S. (2009). *This Time Is Different.* Princeton University Press.

Ross, M. L. (2012). *The Oil Curse.* Princeton University Press.

Rothstein, B., & Stolle, D. (2008). The state and social capital. *Comparative Politics, 40*(4), 441-459.

Rothstein, B., & Uslaner, E. M. (2005). All for all: Equality, corruption, and social trust. *World Politics, 58*(1), 41-72.

Russett, B., & Oneal, J. R. (2001). *Triangulating Peace.* Norton.

Schularick, M., & Taylor, A. M. (2012). Credit booms gone bust. *American Economic Review, 102*(2), 1029-1061.

Sen, A. (1981). *Poverty and Famines.* Oxford University Press.

Shleifer, A., & Vishny, R. W. (1993). Corruption. *Quarterly Journal of Economics, 108*(3), 599-617.

Smil, V. (2017). *Energy and Civilization.* MIT Press.

Tainter, J. A. (1988). *The Collapse of Complex Societies.* Cambridge University Press.

Turchin, P. (2003). *Historical Dynamics.* Princeton University Press.

Turchin, P. (2006). *War and Peace and War.* Pi Press.

Uslaner, E. M. (2002). *The Moral Foundations of Trust.* Cambridge University Press.

Wade, R. (1990). *Governing the Market.* Princeton University Press.

Wimmer, A., Cederman, L. E., & Min, B. (2009). Ethnic politics and armed conflict. *American Sociological Review, 74*(2), 316-337.

Winters, J. A. (2011). *Oligarchy.* Cambridge University Press.
