# Civ-Sim — Project Roadmap

*Last updated: 2026-03-08*

---

## Vision

Civ-Sim is both a playable civilization simulation game and a serious research tool for socioeconomic systems study. It is designed to be free of the cultural assumptions and biases of existing similar games. When complete, it will be shared publicly, hosted online, and packaged as executables for Mac and Windows — for anyone who wants to play it or use it for research.

---

## Track 1 — Gameplay Features

1. ✅ **Alien Contact Part 4** — communication attempts, protocol switching, breakthrough and breakdown events
2. ✅ **Inter-civilization plague spread and response** — when plague strikes one civ, neighboring civs face spread risk (tech-era scaled: near-zero at tech 1–2, rising through trade-route era, near-certain at modern); player and AI civs choose responses: quarantine borders, send aid, accept refugees; each choice has trade-offs for stability, cooperation, and inter-civ relationships
3. ✅ **Diplomacy between civilizations** — three treaty types (Non-Aggression Pact, Trade Agreement, Alliance) with per-turn attitude bonuses, war suppression, expiry, AI auto-proposals, player offer/accept/break UI in 🤝 Diplomacy tab, NPC commentary on inter-civ relations
4. ✅ **Tech tree improvements** — 38-technology branching prerequisite tree across 7 categories (Materials, Agriculture, Energy, Science, Communication, Medicine, Maritime); cross-category prerequisites; pressure-based discovery with innovation/education/trade multipliers; value resistance (theocratic, power-concentration, ecological); visual tree tab with era columns, prerequisite connection lines, node detail popups, discovery progress bars; Introduce/Discontinue catalog techs gated by tree prerequisites; discovery event notifications with contextual narratives
5. ✅ **Notifications polish** — color-coded toasts by event type (12 types: war, alien, plague, extinction, diplomacy, tech, religion, works, climate, era, error, success); 🔔 notification log panel with tab filters, unread badge, keyboard shortcut N
6. ✅ **Public Works Phase 3** — cancel button for in-progress projects; cancellation adds a history entry noting the abandonment
7. ✅ **Leader death / incapacitation / assassination** — named leader object on governance (generated for powerConc ≥ 40 civs); leader ages/health declines each turn; auto-triggers for natural death (age+health), assassination (instability+power), incapacitation (low health); player triggers via 👑 Leadership tab in Events panel; succession generates new leader; consequences scaled by governance type; NPC commentary via `leader_event` intent
8. ✅ **Dangerous cult emergence** — two types: Religious Cult (fervor+evangelical+inequality trigger) and Personality Cult (high powerConc+instability trigger); both available as player-triggered presets in Movements tab (🔮 / 👁️ with danger styling); auto-triggers from social stress conditions; cult suppression auto-follows when stability recovers; NPC commentary via `cult_presence` intent
9. ✅ **New governance models** — four additions: **Shadow Government (Complicit)** (visible leaders knowingly serve a hidden network: +wealth conc, +corruption, 60% revolution suppression, cross-civ corruption bleed); **Shadow Government (Covert)** (leaders sincerely believe they govern freely; manipulation via information shaping: +wealth conc, +corruption capped, 40% suppression, cross-civ conformity bleed); **World Federation** (voluntary global union; cultural autonomy preserved; war suppressed; federated attitude-drift radiates to all civs; formation trigger when all civs cooperative + tech ≥ 9); **Failed State** (post-collapse; −0.5 stability/turn, unchecked corruption, population bleed, auto-triggers after 3 consecutive turns at stability < 10; no central leader generated). All four have governance-type-aware leader titles, stability-hit tables, and NPC commentary.
10. ✅ **Social Stratification panel (⚖️ Strata)** — 5-tier visualization derived analytically from existing stats (no new data fields): Elite, Upper Middle, Lower Middle, Working Class, Disenfranchised. Per-tier breakdown: population %, wealth %, power %, personal freedom, privilege level (MINIMAL / LOW / MODERATE / HIGH / VERY HIGH / NONE). External influence meters: Wealth/Corporate → Govt and Religion → Govt. Auto-generated interpretive narrative. Flat/egalitarian societies show "Equal Distribution" with minimal Disenfranchised note. Civilization switcher if multiple civs. Keyboard shortcut **P**, button **⚖️ Strata** in bottom bar.
11. ✅ **Migration events** — Immigration Influx (6 presets: war refugees, disaster displaced, fleeing oppression, economic migrants, open borders policy, opportunity seekers) and Emigration Outflow (5 presets: brain drain, economic emigration, forced expulsion, environmental displacement, war flight). Per-turn auto-triggers from simulation conditions. Open borders policy toggle. `migration.netBalance` tracking. NPC commentary (position-aware: elite vs. laborer vs. scholar vs. recent arrival).
12. ✅ **Slavery as an institution** — Setup option (chattel, debt bondage, forced labor, penal labor). Per-turn effects: wealth concentration ↑, equality ↓, empathy ↓, corruption ↑, stability ↓; chattel adds wellbeing ↓ + population bleed. Abolitionist movement accumulation (fires notification at 100). Emancipation event. Expanded conquest enslavement mechanics with slave rebellion trigger. Diplomatic pressure from high-empathy civs. NPC commentary (colonized-position, complicit laborer, rationalizing elite, structural scholar analysis).
13. ✅ **Organized Crime — mechanically distinct types** — Four types with different stat targets: Street Gangs (stability/wellbeing/cooperation), Cartels (corruption/wealth/freedom), Mafias (governance capture/corruption), Pirate Networks (trade disruption/diplomacy — ocean-access gated). Auto-emergence from social conditions each turn. 3–4 real-world countermeasures per type (community investment, police crackdown, gang truce; interdiction, prosecution, legalization; anti-corruption drive, judicial independence, whistleblower protection; naval patrols, economic development, privateering) with multi-turn resolution. Crime level bar in Events Panel. NPC commentary (type-aware, position-aware).
14. ✅ **Geography & Climate** — World-level warmth/moisture bias sliders (−2 to +2) applied to map terrain generation thresholds. Per-civ geography tags: ocean access (yes/island/no), continent vs. island placement, terrain mix checkboxes (mountainous, forested, grasslands, marshy, steppes, arid), climate zone (arctic, temperate, subtropical, tropical, mixed). Per-turn stat modifiers from terrain (mountainous → innovation; forested → fertility + warming reduction; marshy → pop growth reduction; grasslands → expansion; island → trade bonus; arctic → wellbeing −). Setup wizard step with climate sliders and geography selectors.
15. ✅ **Named Scenarios & Comparative Analysis** — Save starting parameters as named scenarios in `localStorage`. "Run Again" pre-fills setup wizard — player can freely vary any subset of parameters. System auto-diffs new params against baseline and stores as `paramOverrides`. Settings → 📋 Saved Scenarios: list all scenarios, per-scenario runs comparison table (population, wellbeing, equality, stability, corruption, wealth conc, tech level, empathy, cooperation, major events, changed params). CSV export via browser download. "Save current run snapshot" button captures live finalStats.
16. ✅ **Technology Introduction & Discontinuation Engine** — 🔬 Tech panel (keyboard shortcut T) with three tabs: **Introduce** (10 predefined technologies: Longevity Treatment, Cancer Vaccine, Clean Energy, Brain-Computer Interface, Landfill Resource Recovery, CRISPR Disease Elimination, Vertical Farming, Quantum Computing, Universal Internet, Autonomous Transport), **Discontinue** (5 predefined discontinuations: End Combustion Engines, End Factory Farming, End Fossil Fuels, Ban Chemical Pesticides, Nuclear Disarmament), **Custom** (user-defined technology with keyword matching against ~33 concept categories). Analysis view shows: immediate stat effects, rollout profile, stratum-by-stratum wellbeing impact with visual bars, and multi-turn consequence chain timeline. Custom input performs out-of-scope detection in two categories: *"violates current understanding of physical law"* (FTL, perpetual motion, time travel) and *"effects too transformative or unknowable to model"* (singularity, consciousness upload, teleportation). Applied technologies queue consequence chain entries that fire at specified turn delays. Text analysis export as downloadable `.txt` file.
17. ✅ **AI & Robotics Automation System** — Fourth tab (🤖 Automation) in the Tech panel modeling six discrete automation penetration levels (0 = Pre-Automation → 5 = Pervasive Automation). Each level specifies: immediate stat effects on introduction, ongoing per-turn wellbeing/equality/innovation deltas while maintained, a skills-transformation table (skills made obsolete vs. new capabilities unlocked), per-stratum wellbeing impacts showing sharply divergent outcomes (elite capital gains vs. working-class displacement), and a multi-turn consequence chain. Level cards are visually selectable with a "CURRENT" badge on the active level. Analysis view reuses the shared stratum bar, effects grid, and consequence chain renderers. Applying a level fires through `applyExternalEvent({ type: 'set_automation_level', level })` → `_applyAutomationLevelChange` which applies immediate effects and queues consequences; per-turn `_applyAutomationEffects` applies ongoing deltas each turn. Automation level stored as `civ.state.automationLevel`. Text analysis export as downloadable `.txt`. History entries in purple (`#a855f7`). Nuanced design principle: automation simultaneously empowers (democratizes high-quality production, expands individual capability) and displaces (makes skills obsolete, concentrates returns with capital owners) — with differential impact by stratum modeled at every level.

18. ✅ **Education System (4 Accessibility Tiers)** — Four-tier `EDUCATION_ACCESS_TIERS` constant (universal free → free through secondary + affordable → free through secondary + prohibitively expensive → out of reach for most), each with per-stratum `strataMultipliers` (human capital access weight per stratum) and equality/innovation/mobility bonuses/penalties. Per-turn `_processEducation(civ)` computes a population-weighted human capital multiplier, applies innovation boost, equality drift (scaled by tier), and a cross-system epistemic health drift bonus. Education access is player-settable via the Society Panel's Education tab (4-card tier selector + quality slider). Setup wizard Step 9 ("Social & Economic Foundations") derives smart defaults from economic model and allows player override. History entries in sky blue (`#38bdf8`).

19. ✅ **Gender Equity, Institutional Quality, Epistemic Health, Culture Axes & Demographic Structure** — Five new civilization state dimensions, each with per-turn drift logic and cross-system interactions: **Gender Equity Index** (0–100): rises with high tech + press freedom, falls under state religion + authority orientation > 60; affects innovation, lower-stratum wellbeing, birth rate proxy; **Institutional Quality / Rule of Law** (0–100): drifts with corruption and stability; determines policy effectiveness multiplier; **Epistemic Health / Press Freedom** (0–100): drifts by governance + religion; at < 25 triggers probabilistic populist destabilization events; **Culture Axes** (authority orientation + risk orientation): derived from founding config (governance hierarchy level and innovation tolerance), never player-settable after founding, act as quiet background multipliers; **Demographic Profile**: 4-state categorical (young / balanced / aging / demographic_stress) with probabilistic drift driven by composite aging/youth/stress pressure scores computed from GEI, education access, automation level, longevity tech, wellbeing, and stability — applies `perTurnEffects` each turn. All editable in Society Panel (⚖️ Equity, 🏛️ Institutions, 👥 Demographics tabs). History entries: press freedom act green (`#4ade80`), censorship law red (`#f87171`), judicial reform blue (`#60a5fa`), gender equity initiative pink (`#f472b6`).

20. ✅ **Finance & Debt System (5 Models) + Trade Networks + Economic Divergence Visualization** — Five `DEBT_MODEL_TYPES` (debtless / community debt with forgiveness / regulated credit / market-rate / predatory), each with per-stratum wellbeing effects, equality effect, growth modifier, crisis risk, forgiveness mechanisms (jubilee, service-based discharge, civic contribution offset, hardship adjudication), and predatory features (punitive interest, wage garnishment, debt reporting blocking employment/housing/assistance, debtors' prisons / indentured servitude). Per-turn `_processFinance(civ)` accumulates debt load by model type, applies stratum wellbeing/equality effects, grows financial depth in market economies, and triggers a financial crisis event when debtLoad > 80 + atWar/instability. Per-turn `_processTrade(civ)` applies tariff effects on equality and innovation (tariff > 60 → equality +0.01/turn, innovation −0.02/turn; tariff < 20 → inverse), applies trade prosperity bonus, and shocks tradeDependency on war. **Economic Divergence Indicator** (Finance & Trade tab): side-by-side canvas chart compares aggregate civilizational economic health (financial depth + trade + stability composite) against actual lower-strata wellbeing (working class + disenfranchised average), with a color-coded divergence score (green/amber/red) explicitly modeling the GDP-healthy/population-suffering disconnect. **economicHistory ring buffer** (last 50 turns) stores `{ turn, year, financialDepth, debtLoad, tradeDependency, strataWellbeing: {5 strata}, aggregateEconomicHealth, divergenceScore }` per turn; powers in-panel line charts and is architected for Track 2 CSV/PNG file export. **chart_utils.js**: standalone canvas 2D utility with `drawStratumBars()`, `drawBarChart()`, `drawLineChart()`, `drawDivergenceChart()`, and `exportPNG()` stub (wired to UI in Track 2). Society panel has 💰 Finance & Trade tab with debt model display, forgiveness mechanism triggers, debt model selector, tariff slider, all four canvas charts, and a Track 2 export note. Events panel gets a new 💰 Economy tab with four triggerable events: Financial Crisis, Debt Jubilee, Trade Disruption, Economic Boom.

21. ✅ **Family & Reproductive Health System** — Four configurable dimensions: **Family Structure** (3 types: nuclear / extended / community-clan), each with per-turn social cohesion, wellbeing, elderly care, child development, and mobility effects; **Family Size Policy** (4 types: large encouraged / neutral / small encouraged / state-mandated), each with birth-rate modifier, stratum-differentiated wellbeing effects with lowest strata bearing heaviest pronatalist costs, and demographic drift pressure; **Reproductive Health Access Tier** (4 tiers: scandinavian/universal → available but uneven → heavily restricted → absent/forbidden), each with birth-rate modifier, stratum wellbeing bonuses, GEI drift bonus, and epistemic health effect; **Women's Rights Tier** (4 tiers: full parity → mostly full → minimal → no rights), each with GEI anchor, innovation bonus/penalty, stratum wellbeing effect, equality and financial depth bonus. Per-turn methods `_processFamilyStructure`, `_processReproductiveHealth`, and `_processWomensRights` apply ongoing drift effects. Setup wizard Step 10 ("Family, Culture & Knowledge") provides player configuration with smart defaults derived from governance and economic model. Society panel 👨‍👩‍👧 Family tab shows card selectors for all four dimensions with apply buttons. Equity tab extended with women's rights tier card selector.

22. ✅ **Science & Arts Independence** — Science and arts are modeled as parallel but not necessarily linked dimensions, reflecting that civilizations may have very different attitudes and funding priorities for each. Separate state variables: `scienceSupport` / `scienceFreedom` / `scienceFreedomConstraint` (science/research) and `artsSupport` / `artsFreedom` / `artsFreedomConstraint` (arts/culture). Default logic reflects structural differences: theocracies fund devotional art (artsSupport ≈ 45) but suppress empirical science (scienceSupport ≈ 20); market economies channel R&D investment (scienceSupport ≈ 65) but allow only commercially viable art (artsSupport ≈ 40); market arts freedom (65) exceeds science freedom (55) because commercial art is more self-sustaining while basic research requires capital constraint. Per-turn `_processScience` and `_processArts` apply separate effects: science drives educationQuality and epistemicHealth; arts drives wellbeing and stability. Each has its own constraint-penalty pathway (religion → epistemic health for science; capital → equality for arts). Four event types: `set_science_support`, `set_science_freedom`, `set_arts_support`, `set_arts_freedom`. Society panel 🎭 Culture & Knowledge tab shows both dimensions side-by-side with divergence indicator alerting when support differs by ≥ 20. Wizard Step 10 provides independent sliders for all four parameters.

23. ✅ **Healthcare System** — Three orthogonal dimensions. **Access Tier** (5 tiers: universal public → universal insurance → mixed public/private → private market only → minimal/traditional): each tier has per-stratum access multipliers (1.0 for universal public down to 0.05 for disenfranchised in private-only), wellbeing base, equality bonus, financial risk, and birth-rate modifier. **Healthcare Emphasis** (3 options: prevention-first / diagnosis & treatment / balanced): prevention maximizes long-term wellbeing drift and plague mitigation (50% damage reduction); treatment responds faster to crises but at higher cost; balanced is the pragmatic default. **Provider Incentive Model** (3 options: patient outcomes first / profit-first / mixed): patient-outcomes incentivizes prevention and reduces unnecessary treatment; profit-first incentivizes volume and over-treatment of insured while under-treating uninsured, producing equality penalties and epistemic health drag. Per-turn `_processHealthcare` applies population-weighted stratum wellbeing, incentive model effects on equality and EH, stores plague mitigation factor in `_healthcarePlagueMitigation`, and feeds birth rate demographic pressure. Six event types. Society panel 🏥 Healthcare tab shows all three dimensions with stratum access bars, plague mitigation preview, and cross-system summary.

24. ✅ **Resource Management & Sustainability Panel** — Two configurable dimensions. **Resource Strategy** (4 options: conservation / balanced stewardship / extraction for growth / government-managed): multipliers applied to existing `_updateResourceDepletion` and `_updatePollution` methods in civilization.js; conservation = 0.4× depletion / 0.35× pollution; extraction-growth = 1.5× / 1.6×; government-managed scales linearly with institutional quality (weak gov → near extraction; strong gov → near conservation). **Obsolescence Model** (3 options: durability-first / regulated / market-driven/planned): applies as a multiplicative modifier on top of the strategy multipliers; market-driven planned obsolescence adds +40% waste and +30% depletion — combined with extraction-growth produces waste ×2.5, depletion ×2.0, crisis trigger acceleration of 30–40%. `_processResourceStrategy` runs per-turn setting `_resourceDepletionMod`, `_pollutionMod`, `_wasteMod`, and `_resourceCrisisOffset` on civ.state; `_recordResourceSnapshot` maintains a 50-turn ring buffer (`resourceHistory`) tracking forests/soil/minerals/water/pollution/waste. **Sustainability Panel** (new dedicated panel 🌿 Sustainability, button in main toolbar): four tabs — Resources (stat bars + time-series line chart), Strategy (4-card selector with IQ-scaled government display), Obsolescence (3-card selector with synergy warning), Export (full 50-row data table + CSV download + PNG chart export). Crisis threshold offset: conservation shifts crisis thresholds +15 points (resilient); extraction-growth shifts −10 (vulnerable).

25. ✅ **Information Ecosystem** — Single `informationEcosystem` state variable with 5 tiers: open civic press / commercial free press / oligarch-captured media / state-guided narrative / total information control. Each tier has a **truth anchor** — a per-turn pull toward an Epistemic Health equilibrium value (open civic → 90; total control → 10), modeled identically to the GEI anchor in women's rights. Additional per-turn effects on innovation (via educationQuality), social cohesion (via stabilityIndex), and equality. Smart defaults: theocratic → total control; autocratic → state-guided; oligarchic → captured commercial; direct congress / gift / commons → open civic; market → commercial free press. Cross-system warnings: autocratic government + total information control → EH collapse risk alert; market economy + commercial free press → "ceiling ~60" note. Rendered as 5-card selector in new 📺 Information tab (tab 9 in Society panel). Wizard Step 10 includes dropdown with smart defaults. History entry type `set_information_ecosystem` logged in violet.

---

## Track 2 — Research Infrastructure

6. **Data export** — export full history log and stat timeseries as CSV/JSON after a run
7. **Reproducibility** — random seed setting so any run can be replayed or shared identically
8. ✅ **Scenario scripting** — named scenarios stored in localStorage; setup wizard pre-fill from saved baseline; free parameter variation; auto-computed param diffs; in-game comparison table; CSV export (see Track 1 item 15)
9. **Parameter documentation and configurability** — expose simulation assumptions (stat deltas, probability thresholds, drift rates, etc.) as readable and editable config rather than hardcoded values; add an advanced settings panel in-game
10. **Technology analysis graphic export** — export technology impact analysis as visual charts: stratum impact bar chart, consequence chain timeline visualization, before/after stat comparison — downloadable as PNG or SVG (see Track 1 item 16 for text export)

---

## Track 3 — Accessibility & Distribution

10. **Online hosting** — GitHub Pages deployment; rethink save game persistence beyond browser localStorage
11. **Executable packaging** — Electron wrapping for Mac and Windows
12. **Onboarding improvements** — more explanatory text for governance and economy options during setup

---

## Track 4 — Localization

13. **Event card pre-translation** — all event panel tabs (Disasters, Alien Contact, Extinction, Public Works), all 4 non-English languages
14. **NPC response translation** — two-phase LLM approach (see notes below)
15. **History and narrative prose translation** — dependent on LLM approach; long-term goal

*Current state: UI chrome fully localized in English, Español, Deutsch, 繁體中文, Русский. Event narratives, NPC dialogue, and history prose remain English — consistent with common practice for this stage.*

---

## Track 5 — Longer-Term / Under Consideration

- Cultural bias review of economy and governance model taxonomies
- Addition of non-Western economic and governance models
- ✅ ~~Rethink of linear tech level progression (levels 1–11 carry implicit assumptions)~~ — resolved via branching prerequisite tree (Track 1 item 4)
- Full narrative and history prose translation (dependent on LLM approach decision)

---

## Notes on NPC Enhancement and LLM Integration

The NPC interview system currently uses rule-based responses covering known question intents (wellbeing, inequality, leadership, religion, etc.). This works well for expected questions but breaks down for anything outside the defined intent categories, and cannot handle anachronistic questions (asking a Neolithic civ about democracy).

### Two-Layer Architecture

The planned approach adds an LLM as a fallback layer while keeping the rule-based engine as the primary layer:

1. **Rule-based layer (current)** — fast, free, works offline, covers the majority of questions
2. **LLM fallback layer (planned)** — activates when no rule-based intent matches; generates a contextually aware, in-character response using civ state, NPC social position, era, and active events as context

This keeps the game fully functional with no LLM, and makes the LLM an enhancement rather than a dependency.

### LLM Integration — Free-First Strategy

To avoid payment friction that would inhibit adoption and research use, LLM integration is planned in two phases, both of which are genuinely free:

**Phase 1 — Ollama (local, zero friction)**
- Auto-detect Ollama at `http://localhost:11434` on game load
- If detected, enable LLM fallback automatically — no configuration required
- User installs Ollama + a small model (e.g., Mistral 7B) once; game uses it indefinitely
- Completely free, offline, no account, no API key
- Suitable for technical users and researchers

**Phase 2 — Groq free tier (cloud, low friction)**
- Groq offers a free API tier: email signup only, no payment required, thousands of requests/day
- Add an optional Groq API key field in settings; if present, use Groq as LLM fallback
- Groq runs Mistral/LLaMA inference extremely fast (much faster than local Ollama on modest hardware)
- Suitable for non-technical users who want enhanced NPC interviews without local model setup

Payment-required APIs (OpenAI, Anthropic, Google) will be supported as additional key fields but are not the recommended path.

---

## Notes on Research Infrastructure and Gameplay

Research infrastructure features are designed to be invisible to casual players and available to researchers:

- **Data export** — a button in settings; players ignore it, researchers use it after runs
- **Random seed** — visible in settings; most players ignore it; researchers use it to reproduce and share runs
- **Scenario scripting** — entirely backend; no player-facing UI
- **Parameter configurability** — an advanced settings panel; casual players never open it; also appealing to players who enjoy tuning the simulation

These features serve the same audience the game already appeals to. Research infrastructure and deep gameplay are not in conflict.

---

## Completed This Far

- ✅ Core simulation engine (population, wellbeing, stability, equality, empathy, corruption, wealth concentration, innovation, cooperation)
- ✅ Governance models (15 types: 11 original + Shadow Gov Complicit, Shadow Gov Covert, World Federation, Failed State)
- ✅ Economy models (10 types)
- ✅ Player roles (6 types)
- ✅ NPC interview system with social-position-aware rule-based responses
- ✅ World events system (Disasters, New Horizons, Custom, Religion, Alien Contact, Extinction, Public Works)
- ✅ Alien Contact Parts 1–3 (signal detection, confirmation, response protocols, persistent relationship state, relationship drift, milestone history entries)
- ✅ Public Works Phase 2 (multi-turn construction, build times, setbacks)
- ✅ Extinction-level events with survivor caps
- ✅ History log and Chronicle
- ✅ War system
- ✅ Independence movements
- ✅ Era transitions
- ✅ Religion system
- ✅ Environmental simulation (forests, soil, water, pollution, waste, global warming)
- ✅ UI localization (all chrome in 5 languages)
- ✅ User manual (User_Manual.docx)
- ✅ Social Stratification panel (⚖️ Strata): 5-tier wealth/power visualization, privilege levels, influence meters, narrative
- ✅ Leader death / assassination / incapacitation events
- ✅ Dangerous cult emergence (religious + personality cult types)
- ✅ New governance models: Shadow Government (Complicit), Shadow Government (Covert), World Federation, Failed State
- ✅ Migration events (influx + outflow, auto-triggers, open borders policy)
- ✅ Slavery as an institution (per-turn effects, abolitionist movement, emancipation, diplomatic pressure)
- ✅ Organized crime (street gangs, cartels, mafias, pirate networks; auto-emergence; countermeasures with multi-turn resolution)
- ✅ Geography & climate (world climate bias on map generation, per-civ terrain/climate tags, per-turn stat modifiers)
- ✅ Named scenarios & comparative analysis (save/rerun/compare/export CSV)
