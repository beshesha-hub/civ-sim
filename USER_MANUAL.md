# Civilization Simulation — User Manual

*Version: Evidence-Based Upgrade Pass (15 empirical models)*
*Last updated: March 2026*

---

## Overview

This is a browser-based civilization simulation and research tool. You design a civilization from the ground up — choosing its governance model, economic structure, cultural values, and policies — and then observe how those choices interact over turns of simulated history. The simulation tracks roughly 120 distinct state variables per civilization across 12 interacting domains: economy, governance, social structure, culture, ecology, demographics, technology, infrastructure, psychology, organized crime, inter-civilization relations, and public health. These systems are connected by approximately 200 cross-system feedback loops that produce emergent behavior.

The tool has three modes of use:

- **Game mode** — Play as the founder of a civilization, making decisions turn by turn
- **Research mode** — Configure civilizations with specific parameter sets and observe outcomes over time (Track 2 export with reproducible seeds allows data extraction for analysis)
- **Classroom mode** — Use as an interactive teaching tool for world history, sociology, political science, economics, or environmental science courses (high school and above). Students configure societies, change variables, and observe consequences propagating through interconnected systems. See `MODELING_ASSUMPTIONS.md` Section 10 for suggested classroom exercises and pedagogical notes

For details on what the simulation models, what it omits, and its empirical grounding, see `MODELING_ASSUMPTIONS.md`.

---

## Installation

### Desktop App (macOS / Windows)
Download and run the installer:
- **macOS**: Open `Civilization Simulator-1.0.0-arm64.dmg`, drag to Applications. macOS 10.13 (High Sierra) or later required. Since the app is unsigned, right-click > Open on first launch (or allow in System Settings > Privacy & Security).
- **Windows**: Run `Civilization Simulator Setup.exe`. Windows 10 or later required. NSIS installer with optional custom install directory.

On first launch, a **setup wizard** will:
1. Detect or install **Ollama + tinyllama** (637 MB) for local, private AI-powered NPC interviews
2. Optionally configure **Groq** or **Gemini** cloud LLM for richer, multilingual AI interviews (free tiers available)
3. Skip any component already installed

### From Source (developers)
```bash
cd ~/civ-sim
node server.js        # Node.js HTTP server (recommended)
# or: python3 server.py  # Python alternative
# Open http://localhost:8080
```

### Browser Only (no AI interviews)
Open `index.html` directly in Chrome or Firefox. All simulation features work; AI-powered NPC interviews require the server.

---

## Getting Started: The Setup Wizard

When you start a new game, the setup wizard walks you through 11 configuration steps:

| Step | Topic |
|------|-------|
| 1 | Civilization name, color, starting year |
| 2 | Player role (founder / advisor / observer) |
| 3 | Governance model |
| 4 | Economic model |
| 5 | Operating principles (freedom, collectivism, innovation) |
| 6 | Religion |
| 7 | World climate & geography |
| 8 | AI civilization count & scenario |
| 9 | Social & Economic foundations (education, equity, debt, tariffs) |
| 10 | **Family, Culture & Knowledge** (see detailed section below) |
| 11 | Scenario options |

All parameters in Step 10 are derived from your earlier choices using smart defaults, but every value can be overridden.

### Step 10: Family, Culture & Knowledge

This step configures nine parameter groups:

**Family & Society**
- Family Structure (nuclear / extended / community-clan)
- Reproductive Health Access (universal free → absent/forbidden)
- Women's Rights Tier (full parity → no legal rights)
- Family Size Policy (large encouraged / neutral / small encouraged / state-mandated)
- Sexual Orientation Policy (full support → criminalized)
- Childcare Norm (mother-primary / father-primary / shared / extended family / institutional)

**Science & Arts** *(independent parameters)*
- Science Support (0–100 slider)
- Science Freedom (0–100 slider)
- Arts Support (0–100 slider)
- Arts Freedom (0–100 slider)

**Healthcare**
- Healthcare Access Tier
- Healthcare Emphasis (prevention / treatment / balanced)
- Provider Incentive Model (patient outcomes / profit-first / mixed)

**Resource Management**
- Resource Strategy (conservation / balanced stewardship / extraction for growth / government-managed)
- Product Obsolescence Model (durability-first / regulated / market-driven)

**Information Ecosystem**
- Information ecosystem tier (open civic → total information control)

---

## Main Interface

After setup, the main game screen shows:

- **Turn controls** — Advance one turn or multiple turns
- **Status bar** — Year, population, key metrics (wellbeing, stability, EH, equality, GEI)
- **Main toolbar buttons** (top row):
  - 📊 Society — Economy & Society panel (15+ tabs)
  - 🌿 Sustainability — Resource management panel (5 tabs including Energy)
  - 🔄 Paradigm — Paradigm shifts, facilitation, and thresholds (4 tabs)
  - 🔬 Research — Track 2 data export, parameters, contagion analysis
  - 🗺️ Map — Hex or world map view
  - 🔬 Tech — Technology tree (5 tabs: Tree, Introduce, Discontinue, Custom, Automation)
  - ⚡ Events — Crisis and event log
  - 📜 Chronicle — NPC interviews and civilization history
  - 💾 Save / ⚙️ Settings / 🔔 Notifications

---

## Society Panel (📊)

The Society panel has tabs spanning economy, governance, demographics, psychology, and policy:

### 📚 Education
- Shows current education access tier and quality
- Tier selector: 5 options from minimal/traditional to universal+free
- Education quality slider (0–100)
- Per-stratum human capital multipliers displayed as color-coded bars

### ⚖️ Equity
- Gender Equity Index (0–100) bar and history
- Sexual Orientation Policy card selector (4 tiers: full support → criminalized)
- **Women's Rights Tier** card selector (4 tiers):
  - *Full Parity*: GEI anchors toward 80; strong innovation and equality bonuses
  - *Mostly Full*: GEI anchors toward 55; minor barriers persist
  - *Minimal*: GEI anchors toward 25; major innovation and equality penalties
  - *No Legal Rights*: GEI anchors toward 5; severe penalties across all strata

### 🏛️ Institutions
- Institutional quality, corruption level, public trust
- Policy options to reform institutions or crack down on corruption
- **Infrastructure Level** (0-100) — Physical infrastructure (roads, bridges, water systems). Grows with investment and tech; decays with neglect and war. Policy button: Infrastructure Investment (+4 level, -5 debt)
- **Maintenance Debt** (0-100) — Accumulated deferred maintenance. When debt exceeds 30, infrastructure decay accelerates. Grows when spending is insufficient; shrinks with investment
- **Military-Civilian Power Balance** — Two bars showing Military Power and Civilian Control with a balance indicator (civilian-led / balanced / military-dominant). War boosts military power and erodes civilian control. Democratic governance slowly builds civilian oversight. Policy buttons: Military Modernization (+8 power), Civilian Oversight Reform (+8 control). When military power is high, civilian control is low, and stability is low, a coup risk alert appears; coups can trigger governance change to autocratic
- **Legitimacy** — Type badge (Traditional / Charismatic / Rational-Legal) with level bar (0-100). Traditional legitimacy rests on custom and inheritance; charismatic on a specific leader; rational-legal on institutions and law. Type can evolve over time. Low legitimacy triggers revolution risk alerts. Succession crises occur with charismatic legitimacy on leader change
- **Institutional Lock-in** (0-100) — Path dependency that makes institutional reform harder over time. Increases gradually with time in the same governance model; drops sharply after paradigm shifts. High lock-in boosts behavioral inertia and penalizes innovation

### 💰 Finance & Trade
- Financial depth, debt load, trade dependency, tariff level
- Debt model selector (5 types: debtless / community / regulated / market-rate / predatory)
- **Financial Cycle (Minsky)** — The economy follows a Kindleberger-Minsky endogenous cycle through five phases: Recovery, Hedge Stability, Boom, Euphoria, and Distress/Panic. Displayed as a color-coded phase badge (green through red), a Cycle Position bar (0-100), and a Financial Stability bar. Crisis memory indicator shows how recently a financial crisis occurred. Alerts appear when the cycle enters the distress zone (phase > 70) or when euphoria coincides with high debt. Crises are not random — they emerge from the internal dynamics of credit expansion
- Economic divergence chart: GDP health vs. lower-strata actual wellbeing
- **Land Ownership Concentration** (0-100) — How concentrated land ownership is. Drifts upward under oligarchic/autocratic governance, downward under democratic/cooperative. High concentration erodes social mobility, food security, and trust. Policy button: Land Reform (-15 concentration, effectiveness scaled by state capacity)
- **Caste / Rigid Stratification** (0-100) — Degree of hereditary social stratification. Reinforced by theocratic governance and religious dominance; reduced by education and democratic reform. When high, imposes a hard ceiling on social mobility. Policy button: Caste Abolition (-15 rigidity)
- **Technological Unemployment** (0-100) — Displacement from automation. Starts at 0; grows when automation level reaches 2+. High tech unemployment erodes stability, increases anomie, and reduces lower-stratum wellbeing. Retraining Capacity bar shows society's ability to absorb displaced workers. Policy button: Worker Retraining Program (boosts retraining capacity, reduces unemployment)

### 👥 Demographics
- Population by stratum (5 strata: elite → disenfranchised)
- Demographic profile (youth / mature / aging) — now driven by age cohort data from the transition system
- Stratum wellbeing bars
- **Urbanization Rate** (0-100) — Percentage of population in urban areas. Grows with infrastructure and technology; penalized by war. High urbanization boosts state capacity and innovation (agglomeration effects) but reduces food security and can cause slum formation if infrastructure cannot keep up
- **Ethnic/Linguistic Fractionalization** (0-100) — Diversity of ethnic and linguistic groups. Combined with a **Political Inclusion** bar (0-95) to compute exclusion risk (Wimmer framework). High fractionalization with low inclusion causes stability erosion; high fractionalization with high inclusion is manageable. Policy button: Inclusion Reform (+10 inclusion)
- **Demographic Transition** (5-stage model) — Stage badge with icon, label, and description:

| Stage | Label | Fertility | Mortality | Life Exp | Disease Profile |
|-------|-------|-----------|-----------|----------|-----------------|
| 1 | Pre-Transition | ~45 | ~40 | ~32 | Infectious dominant |
| 2 | Early Transition | ~42 | ~25 | ~50 | Receding pandemics |
| 3 | Late Transition | ~25 | ~12 | ~65 | Degenerative emerging |
| 4 | Post-Transition | ~13 | ~10 | ~76 | Chronic dominant |
| 5 | Second Transition | ~8 | ~11 | ~83 | Aging dominant |

The stage is **derived** from current fertility and mortality rates, not set directly. The transition unfolds through causal chains: sanitation improvements drive mortality decline (Stage 1 to 2), then child survival improvements eventually drive fertility decline (Stage 2 to 3), following Caldwell's child-survival hypothesis and Omran's epidemiological transition theory.

- **Vital Rates**: Fertility rate, mortality rate, life expectancy, and infant mortality bars with a net population growth indicator
- **Population Age Structure**: Youth cohort, working age, and elderly cohort bars with dependency ratio. These cohort values drive the demographic profile system (young/balanced/aging/stress)
- **Epidemiological Profile**: Disease burden and sanitation level bars with a profile description (infectious dominant through aging dominant)
- **Fertility Rate Drivers**: Shows contributions from child survival, gender equity, education, urbanization, and contraception access
- **Mortality Rate Drivers**: Shows contributions from sanitation, healthcare, food security, war, and aging population
- **Demographic Policy**: Three policy buttons:
  - Public Health Campaign — boosts sanitation (scaled by state capacity), reduces disease burden and infant mortality
  - Sanitation Investment — +12 sanitation, +3 infrastructure, -3 disease burden
  - Vaccination Program — tech-dependent: pre-modern reduces disease by 3; with modern tech, reduces disease by 8, infant mortality by 10, and boosts plague mitigation
- **Alerts**: Population explosion warning (Stage 2 with high fertility), population decline warning (Stage 5), youth bulge alert (high youth cohort + low social mobility)

### 👨‍👩‍👧 Family
- Family Structure card selector (3 types)
- Family Size Policy card selector (4 types)
- Reproductive Health Tier card selector (4 tiers)
- Combined birth rate signal and demographic drift preview

### 🎭 Culture & Knowledge
- Science: support bar, freedom bar, constraint-source label, per-turn effects
- Arts: support bar, freedom bar, constraint-source label, per-turn effects
- Divergence alert when science and arts support differ by ≥ 20 points
- Adjustment buttons (±15 support, ±20 freedom)

### 🏥 Healthcare
**Access Tier** (5 cards, color-coded):
| Tier | Description |
|------|-------------|
| 🏥 Universal Public | Free at point of use; equal access all strata |
| 📋 Universal Insurance | Mandatory coverage; minor stratification |
| ⚖️ Mixed Public/Private | Safety net + private market; strong stratum divergence |
| 💰 Private Market Only | Market good; catastrophic for lower strata |
| 🌿 Minimal/Traditional | Little formal care; high mortality risk |

Each card shows per-stratum access bars and per-turn wellbeing/equality effects.

**Healthcare Emphasis** (3 cards):
- 🛡️ *Prevention-First*: highest long-term wellbeing drift; 50% plague damage reduction
- 💊 *Diagnosis & Treatment*: faster crisis response; higher cost
- 🔄 *Balanced*: moderate on all axes

**Provider Incentive Model** (3 cards):
- ❤️ *Patient Outcomes First*: rewards health results; equality bonus, EH bonus
- 📈 *Profit-First*: rewards volume; equality penalty, EH penalty
- 🔀 *Mixed/Hybrid*: intermediate effects

**Cross-system summary**: shows combined wellbeing effect/turn, plague mitigation factor, per-stratum access percentages, and birth rate pressure direction.

### 📺 Information
**Information Ecosystem** (5 cards):
| Tier | EH Anchor | Per-turn EH effect |
|------|-----------|-------------------|
| 🗞️ Open Civic Media | 90 | +0.04 |
| 📺 Commercial Free Press | 60 | +0.01 |
| 🏢 Oligarch-Captured Media | 40 | −0.02 |
| 📡 State-Guided Narrative | 25 | −0.05 |
| 🔒 Total Information Control | 10 | −0.10 |

The *truth anchor* pulls Epistemic Health toward the tier's equilibrium value each turn at 0.6% per turn — slow and realistic. Combined with the per-turn drift, this means the full effect takes ~20 turns to substantially materialize.

Cross-system warnings appear when:
- Autocratic government + total information control → EH collapse risk
- Market economy + commercial free press → EH ceiling ~60

### 🧠 Social Psychology
- **Paradigm Shift Readiness** bar (0-100) — How close the population is to demanding systemic change
- **Anomie** (0-100) — Durkheimian normlessness. Starts at 0; grows from paradigm shifts, rapid social change, energy transitions, and food insecurity. Strong family networks and community resilience slow anomie growth. When anomie exceeds 50, lower-stratum tension rises and social trust erodes. When anomie exceeds 70, "Deaths of Despair" events may fire. Policy button: Community Resilience Program (-10 anomie)
- **Collective Trauma** (0-100) — Intergenerational trauma from catastrophic events (war, famine, slavery, coups). Decays very slowly (~0.1%/turn). While high, imposes a ceiling on social trust and a floor on anomie. Sources include active war, slavery (scales with prevalence), famine, and military coups. Policy button: Truth & Reconciliation Commission (-8 trauma; effectiveness scaled by state capacity)

### 🧬 Empathy Cascade
- **Susceptibility Distribution** — Canvas chart showing the population's empathy susceptibility curve with per-stratum mean lines
- **Cascade Flow** — Vertical flow diagram showing empathy suppression cascading through 5 strata (Leader → Elite → Professional → Laborer → Marginalized). Power-induced empathy suppression is proportional to power base; the disenfranchised box shows a split bar of cooperation pressure vs. competition pressure
- **Theocratic Bias** — Additional section for civilizations with theocratic governance, showing in-group/out-group empathy asymmetry
- Export buttons: PNG, CSV, TXT

### ⚡ E×R Interaction (Empathy × Reinforcement)
- **Interaction Type Badge** — Virtuous (green), Vicious (red), Conflicted (amber), or Neutral (gray)
- **Aggregate Bars** — Empathy component, reinforcement component, combined score
- **Dual-Axis Line Chart** — Empathy (blue, left axis) vs. reinforcement (orange, right axis) over time, with dashed combined line
- **Stratum Comparison Chart** — Grouped bars showing empathy vs. reinforcement per stratum
- Export buttons: PNG, CSV, TXT

### 🔍 Cultural Gap
- **Gap Badge** — Severity level (Low / Moderate / High / Critical)
- **Metric Bars** — Gap score, cynicism level, paradigm shift readiness
- **Stated vs. Reinforced Values Chart** — Grouped bars for 5 value domains showing the gap between what the civilization says it values and what its behavioral incentives actually reward
- **Per-Stratum Gap Perception Chart** — How each stratum perceives the hypocrisy gap
- **History Chart** — Time-series of gap score, cynicism, and readiness
- When cynicism is high and readiness is elevated, the narrative shifts toward revolutionary consciousness language
- Export buttons: PNG, CSV, TXT

### 💰 Wealth Capture
- **Degree Badge** — Overall wealth capture degree (0-100)
- **Feudal Dynamic Alert** — Appears when capture degree exceeds 80 AND wealth concentration exceeds 75. Indicates that formal institutions have been effectively captured by concentrated wealth
- **Four-Dimension Bar Chart** — Institutional capture, electoral capture, media capture, cultural capture
- **History Chart** — Time-series of capture degree and reinforcement control
- Export buttons: PNG, CSV, TXT

### 🧲 Behavioral Inertia
- **Inertia Coefficient** bar (0-100) — How resistant the civilization's behavioral norms are to change. Higher with hierarchy, wealth capture, cultural homogeneity, and institutional lock-in. Lower with education and epistemic health
- **Inertia Drivers** — Shows the 5 key factors contributing to current inertia
- **Queued Behavioral Shifts** — Lists pending shifts from paradigm transitions (shifts are deferred and applied gradually, not instantly)
- **Cooperative Outcomes Feedback** — Shows whether cooperative behavior is being reinforced or weakened by current conditions. Under extractive conditions (high inequality, high wealth capture), cooperation erodes; under equitable conditions, cooperation strengthens
- History chart and export buttons

### ⚖ Power Concentration
- **Consequence Deficit** gauge (0-100) — Measures how long powerful actors have avoided accountability. Grows when institutional quality is low, corruption is high, and wealth capture is high. When elevated, the acceleration multiplier increases, making wealth capture grow even faster (runaway feedback). Recovers when accountability improves (high IQ + high EH)
- **Stats Row** — Deficit level, acceleration multiplier, turns without accountability, wealth capture degree
- History chart and export buttons

---

## Sustainability Panel (🌿)

Accessed via the **🌿 Sustainability** button in the main toolbar.

### ⛏️ Resources Tab
- Six stat bars: Forests, Soil, Minerals, Water, Pollution, Waste
- Active multiplier display: current depletion ×N, pollution ×N, waste ×N
- Time-series line chart of last 50 turns (all 6 metrics)
- Synergy warning if extraction-for-growth + planned obsolescence are both active
- **Ecological Capacity & Overshoot** — Ecological capacity bar (derived from resource health) and demand/capacity ratio bar. When the ratio exceeds 1.0 for sustained periods, overshoot warnings appear. Severe overshoot (ratio > 1.5 for 20+ turns) triggers simplification pressure, which erodes infrastructure and social complexity
- **Food Security** (0-100) — Composite of soil health, water access, agricultural technology, trade dependency, urbanization, and war effects. When food security drops below 30, stability erodes. Extended periods below 15 trigger famine events (population drops, wellbeing crashes, collective trauma +15). Driver list shows contributing factors

### 🌿 Strategy Tab
**Resource Strategy** (4 cards):
| Strategy | Depletion | Pollution | Waste | Crisis offset |
|----------|-----------|-----------|-------|--------------|
| 🌱 Conservation | ×0.4 | ×0.35 | ×0.3 | +15 |
| ⚖️ Balanced Stewardship | ×0.8 | ×0.75 | ×0.7 | +5 |
| ⛏️ Extraction for Growth | ×1.5 | ×1.6 | ×1.8 | −10 |
| 🏛️ Government-Managed | IQ-scaled | IQ-scaled | IQ-scaled | 0 |

*Government-managed* scales with institutional quality: at IQ 100 → near conservation (×0.5); at IQ 0 → near extraction (×1.2).

### 🔄 Obsolescence Tab
**Obsolescence Model** (3 cards):
| Model | Waste mod | Depletion mod | Growth | Wellbeing |
|-------|-----------|---------------|--------|-----------|
| 🔩 Durability-First | −30% | −20% | −0.01 | +0.01 |
| 📝 Regulated | −10% | −5% | 0 | 0 |
| 🔄 Market-Driven (Planned) | +40% | +30% | +0.015 | −0.01 |

**⚠️ Synergy warning**: Extraction-for-growth + market-driven planned obsolescence produces combined waste ×2.5, depletion ×2.0. Environmental crises trigger 30–40% faster.

**Mechanism explanation**: Planned obsolescence intentionally shortens product lifespans (software lock-out, unavailable spare parts, fashion cycles) to drive repeat purchases. Combined with extraction-growth resource strategy, both accelerate simultaneously because higher output → more product → faster replacement → more waste → more extraction.

### 📊 Export Tab
- Full 50-row resource history table (all 6 metrics + strategy/obsolescence labels)
- 📥 Download Resource CSV button
- 📥 Download Chart PNG button
- Line chart preview of all 6 metrics over last 50 turns

### ⚡ Energy Tab
- **Current Energy Source** — Wood (starting), Coal, Oil/Gas, Nuclear, Renewable, Fusion. Advances automatically with technology adoption
- **EROI Bar** (Energy Return on Energy Invested) — Color-coded: green (>20), amber (5-20), red (<5). Reference table shows EROI values for all energy sources:

| Source | EROI | Notes |
|--------|------|-------|
| Wood | 3 | Pre-industrial baseline |
| Coal | 35 | First major energy transition |
| Oil/Gas | 60 | Peak fossil fuels |
| Nuclear | 75 | Highest EROI |
| Renewable | 15 | Lower but sustainable |
| Fusion | 50 | Theoretical future source |

- **Energy Surplus** — EROI minus societal overhead (5). Negative surplus constrains innovation and economic growth
- **Cross-effects** — Energy transitions cause anomie (+5 per transition). EROI decline with mineral depletion. Low surplus penalizes innovation rate
- **EROI History Chart** — Time-series of EROI over last 50 turns

---

## Paradigm Shifts Panel (🔄)

Accessed via the **🔄 Paradigm** button or **Shift+P**.

### Current State Tab
- Paradigm shift readiness badge (0-100)
- Current governance and economic model display
- Active shifts in progress with progress indicator
- Completed shifts count

### Trigger Shift Tab
- Catalog of eligible paradigm shifts filtered by current governance/economic model
- Each shift card shows name, description, direction, resistance factors, and enhancement factors
- Target model selector and implementation strategy checkboxes (with recommended strategies highlighted)
- Confirm button to initiate the shift

### History Tab
- Readiness history chart (time-series)
- Completed shifts list with turn numbers and from/to model pairs
- CSV export of readiness history

### Analysis Tab
- Readiness driver list showing factors pushing toward or against systemic change
- Narrative text describing current state and key drivers
- TXT export

### 🎓 Facilitation Tab
- **Behavioral Inertia** — Coefficient bar showing resistance to change
- **Structural Ceiling vs. Current Behavior** — Chart showing the maximum behavior change possible given current structural constraints (wealth capture lowers the ceiling)
- **Available Facilitation Measures** — 5 policy cards:
  - Civic Education Workshops — slow, steady cooperation boost
  - Community Deliberation Forums — builds trust and cooperation
  - Peer Demonstration Networks — leverages social proof
  - Media Messaging Campaign — fast but risky: backfires at low epistemic health (propaganda effect increases cynicism instead)
  - Economic Incentive Alignment — bypasses structural ceiling by changing material incentives
- Each measure can be activated/deactivated; effects go through the behavioral inertia system (deferred, not instant)

### 🚨 Thresholds Tab
- 13 defined threshold conditions displayed as cards with color-coded borders
- Each card shows whether the threshold is currently met or safe
- When a threshold is exceeded, events fire (with cooldown to prevent spamming)
- Event log shows all threshold events with turn numbers
- CSV and TXT export

---

## Research Panel (🔬)

Accessed via the **🔬 Research** button. Designed for Track 2 (research mode) users.

### Export Tab
- Displays the game's **research seed** (10-character string for reproducibility)
- **Download Full CSV** — Exports all 13 data sections: run metadata, economic history, empathy history, cultural gap history, wealth capture history, behavioral inertia history, facilitation history, cooperative outcomes history, consequence deficit history, cultural homogeneity history, contagion history, threshold events, and history events

### Parameters Tab
- **Suppress Random Events** toggle — When enabled (ON), suppresses all events that use a random probability gate. Threshold-driven state changes, continuous drift, and deterministic events still apply. Use this when you want to hold conditions steady and study the effect of changing specific parameters without stochastic event noise. Session-scoped: resets to OFF on new simulation, and can be toggled on or off at any time during the session
- Lists all simulation constants that can be examined: facilitation measures, threshold definitions, contagion configuration parameters
- Allows researchers to see exactly what values drive each system

### Contagion Tab
- **Cross-civilization behavioral contagion** — Shows how cooperation, cynicism, and epistemic health spread between civilizations through trade and cultural contact
- Influence logs showing received and emitted influences
- Contagion history chart (requires multi-civilization game with 10+ turns)
- Speed factors: cooperation spreads fastest, cynicism at 55% speed, epistemic health at 35% speed
- Theocratic civilizations suppress out-group contagion based on out-group empathy

---

## Technology Panel (🔬)

Accessed via the **🔬 Tech** button or keyboard shortcut **T**. Manages the civilization's technology tree, technology introduction/discontinuation, custom tech analysis, and automation levels.

### 🌳 Tree Tab
Visual representation of the **38-technology tree** spanning all eras from Prehistoric to Future. Technologies are organized in columns by era, with colored connection lines showing prerequisite relationships.

- **7 categories:** Materials & Metallurgy (⚒️), Agriculture (🌾), Energy (⚡), Science & Knowledge (🔬), Communication (📡), Medicine (🏥), Maritime & Trade (⚓)
- **Node colors:** Green = Discovered, Blue = Available (prerequisites met), Gray = Locked (prerequisites not met), Dark = Future era (not yet reachable)
- **Prerequisite display:** Each locked node shows which prerequisites are met (✓) and missing (✗)
- **Discovery progress:** Available techs show a progress bar indicating how close they are to adoption
- **Click any node** for a detail popup showing effects, prerequisites, and what technologies this node enables

Technologies are discovered automatically through a **pressure-based adoption system**:
- **Base pressure** accumulates each turn: 12/turn for techs 2+ eras behind, 8/turn for 1 era behind, 3/turn for current era
- **Multipliers:** Innovation culture, education quality, science freedom, energy surplus, and trade openness all accelerate discovery
- **Trade imitation:** If a trading partner has already adopted a tech, discovery pressure increases (Bass diffusion model)
- **Value resistance:** Theocratic civilizations resist innovation-boosting techs; concentrated-power structures resist printing press/internet; ecological economies resist high-warming techs
- **Cross-category prerequisites:** Many techs require discoveries from other categories (e.g., Germ Theory requires both Scientific Method from Science and Surgical Techniques from Medicine)
- At threshold 100, the tech is adopted with a discovery event notification and history entry

### 🔬 Introduce Tab
10 predefined modern/future technologies available for player introduction. Each now has **tree prerequisites** — the required foundational technologies must be discovered in the Tree tab before the catalog tech can be applied:
- Locked techs are dimmed with "🔒 Requires: [missing techs]" displayed
- Once prerequisites are met, the full analysis view is available (immediate effects, stratum impacts, consequence chains)

### 🚫 Discontinue Tab
5 predefined technology phase-outs, also gated by tree prerequisites. For example, End Fossil Fuels requires both Renewable Energy and Nuclear Power to be discovered first.

### ✏️ Custom Tab
User-defined technology analysis using keyword matching against ~33 concept categories. Includes out-of-scope detection for physically impossible (FTL, perpetual motion) and unmodelable technologies (singularity, consciousness upload).

### 🤖 Automation Tab
Six discrete AI/robotics automation levels (0-5) with immediate effects, per-turn ongoing effects, stratum-differentiated impacts, skills transformation tables, and multi-turn consequence chains.

---

## Key Metrics

| Metric | Range | What it measures |
|--------|-------|-----------------|
| Average Wellbeing | 0–100 | Population-weighted quality of life |
| Stability Index | 0–100 | Political and social stability |
| Epistemic Health (EH) | 0–100 | Quality of collective reasoning, truth-seeking |
| Equality Index | 0–100 | Distribution of resources/opportunity across strata |
| Gender Equity Index (GEI) | 0–100 | Women's relative participation and rights |
| Education Quality | 0–100 | Human capital and learning infrastructure |
| Institutional Quality | 0–100 | State capacity and rule of law |
| Financial Depth | 0–100 | Economic development and sophistication |
| Innovation (Behavior) | 0–100 | Rate of new ideas and technological change |
| Social Trust | 0–100 | Interpersonal and institutional trust |
| State Capacity | 0–100 | Government's ability to implement policy |
| Social Mobility | 0–100 | Ability to move between strata (capped by caste rigidity) |
| Anomie | 0–100 | Normlessness and social disconnection (Durkheim) |
| Collective Trauma | 0–100 | Intergenerational trauma from catastrophic events |
| Infrastructure Level | 0–100 | Physical infrastructure quality |
| Urbanization Rate | 0–100 | Urban population percentage |
| Food Security | 0–100 | Access to adequate nutrition |
| Land Concentration | 0–100 | How concentrated land ownership is |
| Caste Rigidity | 0–100 | Hereditary social stratification |
| Institutional Lock-in | 0–100 | Resistance to institutional reform |
| Tech Unemployment | 0–100 | Displacement from automation |
| Ethnic Fractionalization | 0–100 | Ethnic/linguistic diversity |
| Political Inclusion | 0–95 | How inclusive institutions are of ethnic groups |
| Cultural Homogeneity | 0–100 | Cultural uniformity vs. pluralism |
| Consequence Deficit | 0–100 | Accumulated unaccountability of powerful actors |

**Demographic metrics** (Round 15):
- Fertility Rate (3–55 per 1000), Mortality Rate (3–55 per 1000)
- Life Expectancy (25–95 years), Infant Mortality (0–100 per 1000 live births)
- Disease Burden (0–100), Sanitation Level (0–100)
- Youth Cohort (5–55%), Elderly Cohort (2–40%), Dependency Ratio

**Resource metrics** (all start at 100, deplete over time):
- Forests, Soil Fertility, Mineral Resources, Fresh Water
- Pollution Index (0 = clean, 100 = catastrophic)
- Waste Accumulation (0 = minimal, 100 = crisis)
- Energy EROI (varies by source: wood=3 to nuclear=75)

---

## Systems and Their Interactions

### Healthcare → Demographics
Healthcare access tier's `birthRateMod` feeds into the demographic system:
- Universal public / universal insurance → aging pressure (lower birth rates)
- Minimal/traditional → youth pressure (higher birth rates, higher mortality)

### Healthcare → Plague Events
When a plague or epidemic crisis fires, the `_healthcarePlagueMitigation` factor (set by healthcare emphasis) reduces damage:
- Prevention-first: 50% damage reduction
- Balanced: 40% reduction
- Treatment-focused: 30% reduction

### Information Ecosystem → Epistemic Health
The truth anchor mechanism pulls EH toward the tier's equilibrium over time. This interacts with:
- Science freedom (science freedom also pushes EH up)
- Arts freedom (arts freedom boosts EH slightly)
- Women's rights (lower rights → EH drag via suppressed voices)
- Education access (education quality provides EH floor)

The combined effect means a civilization with open civic press, high science freedom, full women's rights, and good education can sustain EH near 85–90. A civilization with total information control, suppressed science, and minimal women's rights will collapse toward 5–15 regardless of education investment.

### Resource Strategy → Environmental Crises
Crisis events fire when resources cross thresholds (forests < 30, soil < 30, water < 25, pollution > 50, waste > 65). The `_resourceCrisisOffset` from resource strategy shifts these thresholds:
- Conservation: offset +15 (crises fire at forests < 15, pollution > 65)
- Extraction for growth: offset −10 (crises fire at forests < 40, pollution > 55)

### Women's Rights → Gender Equity Index
Women's rights tier provides a per-turn GEI anchor — a slow pull toward the tier's equilibrium:
- Full parity: pulls toward 80
- Mostly full: pulls toward 55
- Minimal: pulls toward 25
- No rights: pulls toward 5

This interacts with childcare norms, reproductive health access, and educational access, all of which also drift GEI each turn.

### Planned Obsolescence + Extraction → Crisis Acceleration
When both `resourceStrategy = 'extraction_growth'` AND `obsolescenceModel = 'market_driven'`:
- Depletion multiplier: 1.5 × 1.3 = **1.95×**
- Waste multiplier: 1.8 × 1.4 = **2.52×**
- Pollution multiplier: 1.6 × 1.2 = **1.92×**

This mirrors real-world dynamics where profit-maximizing economies that price externalities out of production costs and build obsolescence into products consume natural capital at rates far exceeding what any political or governance structure can easily reverse.

### Demographic Transition → Population Growth
Population growth is computed from the fertility-mortality gap. In Stage 1, both are high and roughly balanced (slow growth). In Stage 2, mortality drops before fertility, creating a population explosion. In Stages 4-5, fertility drops below mortality, causing population decline. This drives the existing demographic profile system: age cohort data replaces the old stochastic drift with data-driven transitions.

### Sanitation → Disease Burden → Infant Mortality → Fertility
The core causal chain of the demographic transition: infrastructure and technology improvements drive sanitation up, which drives disease burden down, which drives infant mortality down, which (with a lag) drives fertility down. This is not programmed as a single formula — each step has its own drift logic and interacting factors, so the chain can be broken or accelerated by war, policy, or environmental stress.

### Wealth Capture → Consequence Deficit → Acceleration Loop
High wealth capture combined with low institutional quality and low epistemic health allows powerful actors to avoid accountability, growing the consequence deficit. The deficit's acceleration multiplier makes wealth capture grow even faster, creating a runaway feedback loop. Breaking the loop requires simultaneously improving institutional quality AND epistemic health — either alone is insufficient.

### Youth Bulge + Low Mobility → Instability
When youth cohort exceeds 42% and social mobility is below 30, stability erodes at -0.04/turn (following Urdal/Goldstone research on youth bulge dynamics). This interacts with caste rigidity (which caps mobility) and land concentration (which limits opportunity).

### Cultural Gap + Cynicism → Paradigm Shift Readiness
When stated values diverge from behaviorally reinforced values, cynicism grows. Sustained cynicism builds paradigm shift readiness, which can lead to revolutionary pressure. The gap is computed from 5 value domains; the per-stratum perception varies (marginalized strata perceive the gap more acutely).

### Energy EROI → Economic Constraint
When energy surplus (EROI minus 5) is negative, innovation rate is penalized. Energy transitions cause anomie spikes (+5 per transition). Fossil fuel EROI declines as mineral resources deplete.

### Collective Trauma → Trust Ceiling + Anomie Floor
High collective trauma (from war, slavery, famine, coups) caps social trust at 100 - trauma/5. When trauma exceeds 85, anomie cannot drop below 20 regardless of other conditions.

### Cross-Civilization Contagion
In multi-civilization games, cooperation, cynicism, and epistemic health spread between civilizations through trade contact. Contagion rate scales with trade dependency and attitude. Theocratic civilizations suppress incoming out-group influences.

---

## Advanced Systems (Added March 2026)

This section documents systems added during the balance and realism update session. All are calibrated to real-world academic research and produce emergent, governance-neutral outcomes.

### Ecological Systems

**Biodiversity Index (0-100):** Derived from forest health, pollution, and ecological overshoot. When biodiversity drops below 50, pollination services decline (food security loss). Below 40, disease regulation fails (disease burden increases). Below 30, ecological capacity erodes. Recovery is much slower than decline — extinction is fast, speciation takes millions of years. Based on IPBES (2019) planetary boundaries framework.

**Ocean Health Index (0-100):** Affected by CO₂ (acidification), pollution runoff, waste (plastic), and industrial overfishing (tech ≥ 7). When ocean health drops below 60, fisheries collapse affects food security. Below 20, mass marine extinction and coastal flooding. Below 40, reduced CO₂ absorption creates a positive climate feedback loop. Based on IPCC Ocean/Cryosphere report (2019).

**Deforestation → Water Feedback:** When forest cover drops below 40%, water degradation accelerates up to 2.5×. Models the Amazon tipping point (Nobre et al. 2016) where forests generate ~30% of their own rainfall through transpiration.

**Pollution Persistence:** Above pollution level 60, natural cleanup slows dramatically (persistent pollutants: PFAS, microplastics, heavy metals). Above 80, bioaccumulation makes pollution self-reinforcing. Waste also persists above level 50.

**Fossil Fuel → Pollution Link:** Coal and oil energy sources directly increase pollution and global warming contribution per turn, scaled by population. Renewable, nuclear, and fusion energy actively reduce pollution.

### Climate Extreme Events

**Extreme Weather Events:** Catastrophic flooding, extreme heat waves, severe drought, and mega-hurricanes. Probability scales with temperature anomaly² (IPCC AR6: non-linear increase). At 2°C: ~8% per decade; at 4°C: ~25%. Each causes food, infrastructure, population, and wellbeing damage plus collective trauma.

**Megafire Events:** Probability increases with temperature × drought (low water) × forest presence. Destroys up to 15% of remaining forest cover, creates pollution spikes, biodiversity loss. Models Australia Black Summer 2019-20, California megafires, Amazon fires. Creates fire → drought → fire feedback loop.

**Ongoing Sea Level Rise:** After ice sheet tipping point, coastal civilizations suffer continuous food security loss (salt intrusion) and infrastructure damage, scaled by coastal tile ratio.

**Glacial Melt → Water Supply:** Above 3.5°C, glaciers mostly gone → seasonal water supply declines. 2 billion people depend on glacial meltwater in reality (Hindu Kush-Himalaya, Andes, Alps).

### Environmental Policy

**Stochastic Events (fire automatically when conditions are met):**
- **Environmental Awakening:** Shifts resource strategy toward conservation when ecological damage is visible. More likely with education, institutional quality, and visible damage.
- **Environmental Protection Act:** Triggers in any governance with institutional quality > 40 and state capacity > 35, when pollution > 30 and tech ≥ 4. Models US EPA (1970), China's Air Pollution Action Plan (2013), Singapore's environmental regulation.
- **Reforestation Program:** Restores forest cover when forests critically low and state capacity > 30. Models South Korea's reforestation (1960s-80s), Costa Rica's payments for ecosystem services.
- **Ecological Emergency Declaration:** Wartime-level mobilization when ecological damage > 3.0 and tech ≥ 5.
- **Clean Energy Transition:** Accelerates shift from fossil fuels to renewables when cleaner tech is available. Models green subsidies making clean technology affordable for households and small businesses.

**Player Policy Buttons (Sustainability → Resources tab):**
- 🌲 Reforestation Program (+8 Forests, scales with state capacity)
- 🏭 Pollution Controls (-10 Pollution)
- 🌾 Soil Conservation (+6 Soil)
- 💧 Water Management (+6 Water)
- ⚡ Green Subsidies — Voluntary (-5 Pollution, +2 Wellbeing, no stability cost)
- ⚖️ Green Mandate (-12 Pollution, -3 Global Warming, -2 Stability)
- ♻️ Recycling Program (-4 Waste, -2 Pollution, +2 Mineral Recovery)

### Nuclear War

Three severity levels, triggered stochastically (extremely rare: ~0.1% per decade base) or by player. Requires Nuclear Power technology adopted.

| Level | Pop Loss | Wellbeing | Stability | Trauma | Other Effects |
|-------|----------|-----------|-----------|--------|---------------|
| Limited/Tactical | 15% | -20 | -15 | +20 | +10 pollution |
| Large-Scale | 50% | -40 | -30 | +50 | -30 food, nuclear winter |
| All-Out (MAD) | 90% | → 10 | → 0 | → 100 | Infrastructure destroyed, governance collapses, -40 biodiversity, -20 ocean |

Probability increases during active war, low stability, or authoritarian governance.

### Civil War

Based on Fearon & Laitin (2003), Collier & Hoeffler (2004), Cederman et al. (2010). Eight risk factors: weak state capacity, political exclusion + ethnic fractionalization, high inequality + low mobility, anocracy, low legitimacy, low wellbeing, high anomie, and previous civil war (conflict trap). Three dampeners: strong state capacity, high trust, high legitimacy. Minimum 150 years between civil wars per civilization.

| Severity | Trigger | Pop Loss | Wellbeing | Stability | Trauma |
|----------|---------|----------|-----------|-----------|--------|
| Severe (Ethnic/Sectarian) | High fractionalization + low inclusion | 20% | -25 | -30 | +30 |
| Major (Ideological) | High inequality or high anomie | 12% | -18 | -25 | +20 |
| Limited (Insurgency) | Moderate risk factors | 5% | -10 | -15 | +10 |

### Failed State Mechanics

**Invasion:** Failed states can be invaded by neighboring civilizations with military > 30 and state capacity > 30. The failed state cannot declare war but can be attacked. Models US → Afghanistan (2001), NATO → Libya (2011), Ethiopia → Somalia (2006).

**Reconstitution:** After 50+ years in failed state, probability of reconstituting to tribal chief or elder council governance increases each decade. On reconstitution: 60% corruption cut, 30% wealth cut, +25 stability, +20 anomie reduction, +15 wellbeing, +10 trust, plus a 10-turn institutional momentum period.

**Extinction:** If population stays at minimum for 200+ years with food < 10 and water < 5, civilization ceases to exist (Easter Island endgame).

**Survivor Rebuild:** Small populations (50-200) with survivable conditions get Black Death-style recovery: wellbeing slowly improves, wealth concentration decreases as old elites are gone.

### Inter-Civilization Systems

**Immigration:** Push-pull model (Lee 1966). People migrate from low-opportunity to high-opportunity civilizations. Failed states generate refugee flows (3% per decade). Stage 5 civilizations with declining populations attract economic migrants. Destination gains innovation but may face anti-immigrant stability pressure if political inclusion is low. Source loses population and education quality (brain drain).

**Pandemic Modeling:** COVID-style systemic effects. Risk scales with urbanization (density), trade dependency (connectivity), and low biodiversity (zoonotic spillover). Response quality depends on state capacity + social trust + epistemic health. Good response increases trust (rallying effect); poor response decreases trust and spikes anomie. ~1-7 pandemics per 6000-year game.

**Trade Networks:** Globalization creates prosperity (trade-connected civs get wellbeing bonus) but also vulnerability (supply chain contagion when partner civs collapse). Models 2008 financial crisis spread, COVID supply chain disruption.

**Disinformation:** Activates at tech level ≥ 7 (information technology era). Pressure from social media penetration and wealth concentration (media capture). Erodes epistemic health, trust, and increases anomie. Defended by education (strongest defense — Finland model), institutional quality, and existing epistemic health. Tech scaling caps with diminishing returns (societies develop antibodies).

**AI/Automation Disruption:** Activates at automation level ≥ 3. Dual nature: boosts productivity (scaled by institutional quality) AND creates labor displacement (if retraining capacity is weak). At automation level ≥ 5, deepfake epistemic disruption. Good institutions + education channel AI into innovation acceleration.

**Urban-Rural Divide:** When urbanization > 50% and inequality is high, stability pressure increases, social cohesion decreases, and anomie rises. Models Trump's rural base, Brexit London vs rest of UK, France's gilets jaunes.

**Cultural Soft Power:** Civilizations with high education, freedom, wellbeing, and artistic freedom project cultural influence (Nye 2004). Improves attitudes toward the projecting civilization and pulls target education quality upward. Models Hollywood, K-pop, BBC World Service.

### Round 5 Systems (March 2026)

**Natural Disaster Resilience:** Earthquakes, tsunamis, and volcanic eruptions occur stochastically based on geological risk (terrain tiles). Severity is moderated by state capacity, technology, and building code quality — the same earthquake kills 200,000 in Haiti but 20,000 in Japan. Volcanic eruptions cause temporary global cooling (Pinatubo/Tambora effect). Post-disaster cohesion boost models real rally-around-the-flag effect. Player action: Building Code Reform button in Sustainability panel.

**Sovereign Debt / Fiscal Crisis:** Debt ratio tracks cumulative spending vs tax capacity. Military spending, social programs beyond capacity, and war costs accumulate debt. Crisis triggers at debt/GDP > 90% (Reinhart & Rogoff threshold). Three response paths: implement austerity (stability cost), declare default (trust penalty, capital flight), or seek bailout from stronger civs (conditionality). Interacts with existing Minsky financial cycle.

**Media/Information Ecosystem:** Press freedom reduces corruption through investigative journalism (Brunetti & Weder 2003). Public broadcasting boosts cohesion (BBC/NHK model). Media literacy defends against disinformation (Finland model). Oligarch media capture emerges when wealth concentration is high (Berlusconi/Murdoch dynamic). Player actions: Fund Public Broadcasting, Media Literacy Curriculum, Press Freedom Protections.

**Drug/Addiction Epidemics:** Vulnerability driven by anomie, low wellbeing, inequality, and rapid social change. Era-gated substances (alcohol → opium → opioids → synthetic). Effects: productivity loss, healthcare burden, cohesion erosion. State response matters enormously — Portugal's decriminalization vs America's war-on-drugs produce very different outcomes. Can be weaponized by adversary civilizations (Opium Wars model). Player actions: War on Drugs, Decriminalize & Treat, Harm Reduction.

**Generational Value Shifts:** Implements Inglehart's post-materialist thesis (World Values Survey). Tracks formative conditions from 2-3 turns prior. Generations raised in security develop post-materialist values (environment, equality, self-expression). Scarcity generations develop materialist values (order, defense, extraction). Generational conflict between cohorts feeds anomie.

**Space Program:** Activates at tech level ≥ 6. Five milestone achievements: satellite, crewed orbit, moon landing, space station, Mars mission. STEM education boost models Apollo effect (50% increase in STEM PhDs). National cohesion/prestige boost. Failure events possible (Challenger model). Prestige decays without new achievements. Cost adds to sovereign debt. Player action: Launch Space Program, Increase Space Investment.

**Religious/Ideological Schism:** Triggered by high institutional lock-in + low legitimacy + reform pressure + educated population. Three types: religious (Reformation, Great Schism), ideological (Communist factions), ethnic-political. Three resolution paths: suppression (short-term stability, long-term trauma), accommodation (fractionalization but peace), reformation (chaos followed by renewal and innovation boost). Player actions: Suppress Dissent, Reform Council, Allow Reformation.

**Diaspora Networks:** Created automatically by emigration from the existing migration system. Effects: remittances (economic boost to origin country), knowledge transfer, trade facilitation between origin and host, political lobbying in host country. Return migration occurs when origin conditions improve. Based on Jewish, Chinese, Indian, Armenian, and Irish diaspora patterns. Player actions: Engage Diaspora, Diaspora Investment Program.

**Water/Resource Conflict Escalation:** Five-stage escalation between adjacent civilizations sharing water resources: Cooperation → Tension → Dispute → Confrontation → Conflict. Upstream civilizations have leverage. Treaty mechanisms can de-escalate. Climate warming amplifies all stages. Based on Nile, Indus, Colorado, and Aral Sea disputes. Player actions: Propose Water Treaty, Build Desalination (requires tech ≥ 5).

### Balance and Recovery Mechanisms

**Prosperity:** Wellbeing growth driven by food security, institutional quality, stability, trust, state capacity, and accountability (average of IQ + capacity + legitimacy). NOT governance-type dependent — outcomes emerge from institutional quality.

**Stability Recovery:** +1.0/decade baseline, amplified by institutional quality, trust, and state capacity. 1.5× boost when stability very low. Failed states recover at 0.3×.

**Wellbeing Recovery:** Hard floor at 10 (enforced after all events). Recovery toward 15 at 20%/decade. Soft floor at 35 (subsistence baseline). Prosperity mechanism pushes above 50.

**Anomie Self-Limiting:** Natural recovery of 1.5/decade (increased from 0.8). Diminishing returns on stacking growth sources (sqrt dampening). Self-limiting above 70 (accelerating recovery at extremes).

**Corruption and Wealth Decay:** Natural corruption decay based on epistemic health, institutional quality, and state capacity (not governance type). Wealth dispersion based on institutional quality and state capacity. Extreme levels (wealth > 75, corruption > 60) face accelerating decay.

**Resilience Dampening:** When 2+ metrics are simultaneously in crisis, a recovery nudge activates. Prevents permanent multi-metric floor states.

**Anti-Stagnation:** When wellbeing > 90 and stability > 90, small probability of Institutional Complacency event (Olson's distributional coalitions).

**Epistemic Health:** Driven entirely by behavior (freedom level + science freedom), not governance type. A theocracy with high science freedom (Abbasid House of Wisdom, Islamic Golden Age) maintains strong EH. A theocracy with suppressed science (Taliban) sees EH collapse. The label doesn't determine the outcome; the choices do.

**Stage 5 Fertility Floor:** Prosperous civilizations (wellbeing > 70, food > 70) maintain minimum fertility of 8 (≈TFR 1.6) instead of 3 (≈TFR 1.0). Models France/Sweden pro-natalist policy with generous parental support.

---

## Five Strata

All per-stratum effects reference these five population groups:

| Stratum | Description |
|---------|-------------|
| Elite | Wealthy, politically connected |
| Upper Middle | Professional class, educated, comfortable |
| Lower Middle | Working professionals, small business owners |
| Working Class | Manual labor, service workers, precarious employment |
| Disenfranchised | Marginalized, excluded, no political voice |

Healthcare access divergence is most visible in private-market or minimal-traditional tiers: elite gets 90–100% access quality; disenfranchised gets 5%.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| S | Toggle Society panel |
| R | Toggle Sustainability panel |
| P | Toggle Stratification panel |
| Shift+P | Toggle Paradigm Shifts panel |
| T | Toggle Technology panel |
| E | Toggle Events panel |
| C | Toggle Chronicle panel |
| Space | Advance one turn |

---

## Track 2 Export (Research Mode)

The simulation stores rolling 50-turn snapshots of key metrics:

**Economic history** (`economicHistory`):
- Turn, year, financial depth, debt load, trade dependency, tariff level
- GEI snapshot, EH snapshot, IQ snapshot
- Per-stratum wellbeing (5 strata)
- Aggregate economic health, divergence score
- Infrastructure level, maintenance debt, anomie level
- Urbanization rate, military power, civilian control, legitimacy level, collective trauma
- Land concentration, caste rigidity, institutional lock-in, tech unemployment, ethnic fractionalization, political inclusion
- Demographic transition stage, fertility rate, mortality rate, life expectancy, infant mortality, disease burden, sanitation level, youth cohort, elderly cohort

**Resource history** (`resourceHistory`):
- Turn, year, forests, soil, minerals, water, pollution, waste
- Active resource strategy and obsolescence model labels
- Energy source, EROI, energy surplus, ecological capacity, overshoot ratio
- Food security, disease burden, sanitation level

**Full Track 2 CSV export** (via Research Panel):
- 13 data sections including all of the above plus empathy history, cultural gap history, wealth capture history, behavioral inertia history, facilitation history, cooperative outcomes history, consequence deficit history, cultural homogeneity history, contagion history, threshold events, and history events
- Includes a reproducible research seed for experiment replication

Accessible via Export tabs in the respective panels and the Research Panel's full CSV download.

---

## FAQ

**Q: Why is my Epistemic Health declining even with good education?**
A: Check your information ecosystem tier. Total information control or state-guided narrative will pull EH toward 10–25 regardless of education investment. Science freedom and arts freedom also contribute. All four factors are needed to sustain high EH.

**Q: Why are my lower strata unhappy even though aggregate wellbeing is high?**
A: Check healthcare access (private-only gives disenfranchised 5% access quality), debt model (predatory debt has severe lower-stratum wellbeing effects), and education access (minimal-traditional tiers give lower strata tiny human capital multipliers). The economic divergence chart in the Finance tab shows this gap explicitly.

**Q: My forests and soil are depleting fast. What can I do?**
A: Change resource strategy to conservation or balanced stewardship (Sustainability → Strategy tab). Consider switching from market-driven to regulated or durability-first obsolescence. Sustainable Agriculture technology also reduces depletion rates.

**Q: How do I make the Gender Equity Index rise?**
A: The fastest levers are women's rights tier (full parity anchors toward 80), childcare norm (shared co-parenting gives the strongest GEI drift), and reproductive health (scandinavian/universal tier gives ongoing GEI boost). Science freedom also helps (open information supports equality).

**Q: What is Epistemic Health actually measuring?**
A: EH is a composite representing the civilization's capacity for sound, evidence-based collective reasoning. High EH: citizens have access to independent fact-checking, scientific consensus is respected, policy debates are grounded in evidence, dissent is tolerated. Low EH: state propaganda dominates, science is suppressed by doctrine or commercial interest, truth and falsehood are indistinguishable to most citizens.

**Q: Why is my demographic transition stuck at Stage 1?**
A: The transition from Stage 1 to Stage 2 is driven by **sanitation improvement**, which depends on infrastructure, technology, and state capacity. Invest in Sanitation Investment (Demographics tab policy button) and build infrastructure (Institutions tab). Low state capacity civilizations will transition more slowly. The mortality rate must drop below 30 while fertility stays above 30 to trigger Stage 2.

**Q: Why is fertility still high even after mortality dropped?**
A: This is the demographic transition's core feature — the "demographic lag." Mortality drops first (driven by sanitation and disease reduction), but fertility drops later (driven by child survival, female education, gender equity, urbanization, and contraception). The gap between the two creates Stage 2's population explosion. Invest in education, gender equity, and urbanization to accelerate the fertility decline.

**Q: What is anomie and why does it keep rising?**
A: Anomie (Durkheim) measures social normlessness — the breakdown of social bonds during rapid change. It rises from paradigm shifts, energy transitions, food insecurity, and other disruptive events. Strong family networks (extended or community-clan structures) slow anomie growth. Use the Community Resilience Program button in the Social Psychology tab to reduce it. Very high anomie (>70) can trigger "Deaths of Despair" events.

**Q: What does "Feudal Dynamic Active" mean?**
A: This alert appears when wealth capture degree exceeds 80 AND wealth concentration exceeds 75. It means formal institutions (elections, courts, media) still exist but are effectively controlled by concentrated wealth. Breaking this requires simultaneously improving institutional quality, epistemic health, and reducing wealth concentration — which is extremely difficult because the dynamic reinforces itself through the consequence deficit acceleration loop.

**Q: Why do my reforms have no effect?**
A: Check behavioral inertia (Society → Inertia tab). High inertia means behavioral norms resist change. Contributing factors: long time in the same model, high hierarchy, high wealth capture, low education, low epistemic health. Facilitation measures (Paradigm → Facilitation tab) can help, but effects are deferred through the inertia system and arrive gradually. Also check if caste rigidity or institutional lock-in are blocking specific types of reform.

**Q: How does the military coup mechanic work?**
A: Coup risk follows the Powell & Thyne (2011) empirical model with seven compounding risk factors: recent coup history (the strongest predictor), the gap between military power and civilian control, economic crisis, food crisis, regime type, political instability, and low legitimacy. When a coup attempt triggers, it has roughly a 50% base success rate modified by social trust and state capacity. Successful coups change governance to autocratic and generate collective trauma. Failed coup attempts still destabilize but paradoxically tighten civilian control. Recent coups create a "coup trap" — the strongest single predictor of future coups. The risk is displayed as a COUP RISK alert in the Institutions tab.

**Q: What does the Research Panel seed do?**
A: The research seed initializes a deterministic PRNG (Mulberry32) that drives all simulation-relevant randomness — stochastic events, probability checks, disaster timing, civil war triggers, disease outbreaks, and all other chance-based mechanics. Same seed + same parameters = identical trajectory, guaranteed. Non-simulation randomness (NPC interview flavor text, map noise, UI timing) uses standard Math.random() and does not affect reproducibility. The seed is visible in the Research Panel > Export tab and is included in Track 2 CSV exports.

---

## LLM Integration (AI-Generated Interviews)

CivSim can use a large language model (LLM) to generate in-character NPC interviews instead of the default rules-based responses. This makes interviews more varied, nuanced, and responsive to your civilization's specific situation.

### How It Works

1. Open **Settings** (gear icon)
2. Choose an **LLM Provider**
3. Enter the required **API key** (or leave blank for Ollama)
4. Set the **Model name**
5. Click **Test Connection** to verify
6. Click **Save**

When LLM is configured, the Chronicle panel's NPC interviews will use the LLM to generate dialogue. The LLM responds in whatever language you use — if you address a character in Spanish, French, or another language, the response will come back in that language.

If the LLM call fails for any reason (network issue, VPN interference, API limit), the game silently falls back to rules-based responses — your game is never interrupted, but you won't see an error message. If interviews suddenly seem generic, check that your server and network connection are still working.

### Running the Local Server

LLM calls go through a local proxy server to avoid browser CORS restrictions. You must start this server before using any LLM features.

**Steps:**
1. Open a Terminal window (on Mac: Applications → Utilities → Terminal)
2. Type `cd ~/civ-sim` and press Enter
3. Type `python3 server.py` and press Enter
4. You should see: `CivSim server at http://localhost:8080`
5. Open your browser and go to `http://localhost:8080`

**Important:** Leave this Terminal window open for the entire gaming session. If you close it, LLM features will stop working (the game itself will continue, but interviews will use rules-based responses instead of the LLM).

If you are using **Ollama**, you will need a second Terminal window for `ollama serve` (see Ollama setup below).

---

### Provider Setup

#### Ollama (Local, Free, Recommended for Getting Started)

Ollama runs models locally on your machine — no API key needed, no usage fees, complete privacy.

**Setup:**
1. Install Ollama from [ollama.com](https://ollama.com)
2. Open a second Terminal and run: `ollama pull tinyllama`
3. Start Ollama: `ollama serve`
4. In CivSim Settings: Provider = **Ollama**, Model = **tinyllama**
5. Leave API key blank
6. Click Test Connection

**Recommended models:**
| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| tinyllama | ~640 MB | Basic but functional | Fast |
| llama3.2:1b | ~1.3 GB | Better quality | Fast |
| llama3.2:3b | ~2 GB | Good quality | Moderate |
| mistral | ~4 GB | High quality | Slower |

Start with **tinyllama** to verify everything works, then try larger models if your machine handles it. Models larger than 4 GB require significant RAM and may be slow on older hardware.

**Troubleshooting Ollama:**
- "Connection refused" — Make sure `ollama serve` is running in a separate Terminal
- Slow responses — Try a smaller model. Ollama runs on CPU by default; GPU acceleration requires compatible hardware
- Responses cut off — This is normal for tinyllama; larger models produce longer, more coherent responses

#### Groq (Cloud, Free Tier Available)

Groq provides fast inference with a generous free tier.

**Setup:**
1. Create an account at [console.groq.com](https://console.groq.com)
2. Go to API Keys and create a new key
3. In CivSim Settings: Provider = **Groq**, Model = **llama-3.1-8b-instant**
4. Paste your API key
5. Click Test Connection

**VPN users must read this:** Groq uses Cloudflare for security, which blocks requests from most VPN IP addresses. **Your VPN must be off for the entire session** — not just during the initial test. If you turn your VPN back on while playing, LLM calls will silently fail and the game will fall back to rules-based responses without showing an error.

If you get a **403 "Access denied"** error:
1. Disconnect or pause your VPN
2. **Restart server.py** (Ctrl+C in Terminal, then `python3 server.py` again)
3. Reload the game page in your browser
4. Try Test Connection again

**Geographic restrictions:** Groq is available globally except in US-sanctioned regions (Greater China, Russia, Syria, Iran, North Korea). For the current list, see [Groq geographic availability](https://community.groq.com/t/what-geographic-regions-does-groqcloud-serve/833). Taiwan, Japan, most of Europe, and other non-sanctioned countries work fine without VPN.

**Troubleshooting Groq:**
- HTTP 403 "Access denied" — VPN or network proxy issue. Disable VPN, restart server.py, and retry
- HTTP 401 "Unauthorized" — API key is incorrect or expired. Generate a new one at console.groq.com
- HTTP 429 "Rate limited" — Free tier has rate limits; wait a minute and retry

#### Google Gemini (Cloud, Free Tier Available)

**Setup:**
1. Get an API key from [aistudio.google.com](https://aistudio.google.com)
2. In CivSim Settings: Provider = **Gemini**, Model = **gemini-2.0-flash**
3. Paste your API key
4. Click Test Connection

**VPN and geographic restrictions:** Like Groq, Gemini may block requests from VPN IP addresses. **Your VPN must be off for the entire session.** Gemini API is available in 200+ countries (including Taiwan, Japan, and most of Europe) but excludes mainland China, Hong Kong, and others. For the full list, see [Gemini API available regions](https://ai.google.dev/gemini-api/docs/available-regions).

If you are in a restricted region, use Groq or Ollama instead.

#### Anthropic (Cloud, Paid)

**Setup:**
1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In CivSim Settings: Provider = **Anthropic**, Model = **claude-3-haiku-20240307**
3. Paste your API key
4. Click Test Connection

Anthropic does not offer a free tier. Claude Haiku is recommended for CivSim as it is the fastest and least expensive model.

#### OpenAI (Cloud, Paid)

**Setup:**
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. In CivSim Settings: Provider = **OpenAI**, Model = **gpt-4o-mini**
3. Paste your API key
4. Click Test Connection

OpenAI requires a paid account with billing set up. GPT-4o-mini is recommended as the most cost-effective option for CivSim.

---

### General LLM Troubleshooting

**"Test Connection" button does nothing:**
- Make sure `python3 server.py` is running in a Terminal
- Check that you're accessing the game at `http://localhost:8080` (not by opening the HTML file directly)

**LLM works but responses are poor quality:**
- Try a larger model (e.g., switch from tinyllama to llama3.2:3b)
- Cloud providers (Groq, Gemini) generally produce better quality than small local models

**Game shows rules-based responses even though LLM is configured:**
- Open browser Developer Tools (F12) and check the Console for `[LLM] Decision:` messages
- If you see "rules-based" in the decision log, verify your API key is saved and the provider is correct
- If you see `[LLM] Attempting` followed by an error, check the specific error message

**VPN / Network issues (applies to all cloud providers):**
- Cloud LLM APIs (Groq, Gemini, OpenAI, Anthropic) block requests from most VPN IP addresses
- **Your VPN must be off for the entire gaming session**, not just during setup. If you turn your VPN back on mid-game, the LLM will silently stop working and interviews will revert to rules-based responses
- After disabling your VPN, restart `server.py` and reload the browser page
- Corporate firewalls and proxy servers can also cause connection failures
- Check the Terminal running `server.py` for `[LLM-PROXY]` error messages — these show the exact HTTP error from the upstream API
