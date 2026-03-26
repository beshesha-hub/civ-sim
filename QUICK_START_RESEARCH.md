# Quick Start Guide — Researchers and Policymakers

**civ-sim** | Structural plausibility simulation for comparative analysis

---

## What civ-sim Is (and Isn't)

civ-sim is a browser-based civilization simulator that models the co-evolution of 12 interacting domains (economy, governance, demographics, ecology, psychology, and 7 others) across historical timescales. It tracks ~120 state variables connected by ~200 explicit cross-system feedback loops.

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

**Validation status:** 10 historical scenarios scored 7.8/10 average structural plausibility across 6 rounds of development. Out-of-sample validation (8 untested scenarios) confirmed robustness for novel parameter combinations but revealed convergence in untested authoritarian subtypes. See `HISTORICAL_SCENARIO_RESULTS.md` for full data.

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

## File Reference

| File | Contents |
|------|----------|
| `MODELING_ASSUMPTIONS.md` | Full epistemological positioning, coverage map, empirical grounding, design philosophy |
| `USER_MANUAL.md` | Complete documentation of all panels, metrics, systems, and interactions |
| `TEST_VERIFICATION.md` | Technical test cases; useful for understanding exact mechanics and expected values |
| `QUICK_START_CASUAL.md` | Companion guide for non-specialist users |
| `js/config.js` | All constants, preset values, stage definitions, threshold definitions |
| `js/simulation.js` | All processing methods with explicit drift rates and cross-effects |

---

*civ-sim occupies the space between academic rigor and practical accessibility. It sacrifices mathematical elegance for systemic breadth, and visual polish for informational transparency. The goal is structural plausibility: when you see inequality spiral, trust collapse, and institutions weaken in the simulation, the causal chain should match what researchers observe in the historical record — even if the specific numbers are simplified.*
