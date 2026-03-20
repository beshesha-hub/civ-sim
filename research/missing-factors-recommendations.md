# Missing Simulation Factors — Consolidated Recommendations
## Researched March 14, 2026

Full research details in companion files:
- `governance-dynamics-research.md`
- `social-cultural-dynamics-research.md`
- `economic-ecological-dynamics-research.md`

---

## TIER 1 — Highest Impact, Should Implement

### 1. State Capacity (distinct from Institutional Quality)
**Gap**: We conflate institutional design quality with implementation capability. A state can have good institutions on paper but no ability to enforce them.
**Evidence**: Hanson & Sigman (2021) identify three dimensions: fiscal (tax collection), administrative (policy implementation), coercive (territorial control). 1-SD increase predicts 6-7% higher income per person (Vu 2025). Critical interaction: democracy + low state capacity = growth, autocracy + high state capacity = growth, but autocracy + low state capacity = stagnation (Knutsen 2013).
**Parameters**: `stateCapacity` (0-100) with sub-dimensions (fiscal, administrative, coercive). Develops slowly through bureaucratic professionalization; decays through corruption feedback loops matching Ibn Khaldun's ~120-year dynastic cycle.
**Why it matters**: Without this, the simulation cannot explain why some autocracies outperform some democracies, or why some democracies fail to deliver basic services.

### 2. Social Trust
**Gap**: We model cooperation but not generalized trust — the willingness to trust strangers and institutions.
**Evidence**: Knack & Keefer (1997): 10-point rise in interpersonal trust = 0.8pp higher growth. Trust is self-reinforcing in both directions. Corruption is the strongest trust destroyer. Trust interacts with nearly every other system. World Values Survey provides cross-national data across decades.
**Parameters**: `socialTrust` (0-100), split into interpersonal trust and institutional trust. Erodes through corruption, inequality, broken promises; builds through consistent institutional performance, civil society activity.
**Why it matters**: Trust is the hidden variable that determines whether institutions actually function. Low trust + good institutions = institutions ignored. High trust + mediocre institutions = society self-corrects.

### 3. Energy Systems / EROI
**Gap**: No energy source tracking. Technology advances without energy constraints.
**Evidence**: Hall's research: minimum EROI of ~10-15:1 needed for industrial societies. Below ~5:1, the "energy cliff" creates nonlinear collapse in surplus energy. Historical EROIs: ~1.1 (medieval agriculture) to ~100:1 (peak oil). Current fossil fuels at finished-fuel stage ~6:1 and declining (Brockway et al., 2019, Nature Energy).
**Parameters**: `energySource` (wood/animal/coal/oil/nuclear/renewable), `eroi` (computed from source + tech level), `energySurplus` (determines complexity ceiling). Energy transitions cause social disruption.
**Why it matters**: Energy is the fundamental ceiling on civilizational complexity. Without it, societies can advance indefinitely with no resource constraint — unrealistic.

### 4. Carrying Capacity and Ecological Overshoot
**Gap**: We track sustainability metrics but don't model the overshoot-and-collapse dynamic.
**Evidence**: HANDY model (Motesharrei et al., 2014): collapse depends on ecological strain AND economic stratification. Tainter (1988): societies add complexity with declining marginal returns until maintenance costs exceed benefits. Historical collapses: Easter Island, Maya, Mesopotamia.
**Parameters**: `ecologicalCapacity` (can be temporarily exceeded), `complexityCost` (rising with civilization size/tech), `overshootRatio` (current demand / sustainable capacity). When overshootRatio > 1 for extended period, cascading failures begin.
**Why it matters**: Creates the most important macro-dynamic missing from the simulation — the possibility of civilizational decline and collapse through internal overextension, not just external shock.

### 5. Social Mobility (perceived vs actual)
**Gap**: We track equality but not mobility — whether individuals can move between strata.
**Evidence**: Great Gatsby Curve (Corak 2006, Krueger 2012): tight link between inequality and intergenerational persistence. Chetty's research identifies key drivers: segregation, schools, social capital, family stability. Americans consistently overestimate mobility — the perception gap delays unrest but builds cynicism when exposed.
**Parameters**: `actualMobility` (0-100, computed from education, equality, institutional quality), `perceivedMobility` (can diverge from actual). High perceived + low actual = cynicism buildup. Low perceived = revolutionary pressure even if actual mobility is moderate.
**Why it matters**: Mobility is what makes inequality tolerable or intolerable. Two societies with identical Gini coefficients can have completely different stability profiles depending on mobility.

### 6. Infrastructure
**Gap**: No infrastructure tracking despite massive empirical effects.
**Evidence**: Output elasticity of public capital 0.07-0.20 (meta-analyses). The maintenance trap (deferred maintenance accumulating as infrastructure debt) creates fiscal feedback loops documented from Roman Empire to modern America. Roman road effects measurable 2000+ years later (De Benedictis et al., 2023).
**Parameters**: `infrastructureLevel` (0-100), `maintenanceDebt` (accumulates when investment < depreciation). Infrastructure boosts trade, tax collection (state capacity), urbanization, and innovation. Decay accelerates nonlinearly.
**Why it matters**: Infrastructure creates extreme path dependency and the maintenance trap is a realistic mechanism for gradual decline.

---

## TIER 2 — Significant Impact, Strong Candidates

### 7. Urbanization Rate
**Evidence**: Urban populations are easier to tax (boosts fiscal capacity), easier to mobilize for protest (affects stability), generate agglomeration effects for innovation. Urban-rural political cleavage is one of the deepest documented divisions.
**Parameters**: `urbanizationRate` (0-100). Driven by economic development, infrastructure, agricultural productivity. High urbanization + low services = slum formation and instability.

### 8. Military-Civilian Power Balance
**Evidence**: 61% of democracies that died 1789-2008 fell to military coups. Dictator spending >30% on military → 4x more likely to experience coups. Military rule produces ~3pp lower annual GDP growth.
**Parameters**: `militaryPower` (0-100), `civilianControl` (0-100). Military intervention triggered by: economic crisis + weak institutions + high military power + low civilian control.

### 9. Legitimacy Type
**Evidence**: Weber's tripartite framework (traditional / charismatic / rational-legal) has held for 100+ years. Legitimacy type determines succession dynamics: charismatic + leader death = existential crisis; rational-legal + leader death = smooth transition.
**Parameters**: `legitimacyType` (traditional/charismatic/rational-legal/hybrid), `legitimacyLevel` (0-100). Interacts with existing leader succession mechanics.

### 10. Anomie / Deaths of Despair
**Evidence**: Case & Deaton: economic decline → family breakdown → loss of meaning → addiction → death. WHO: 1 in 6 people affected by loneliness, linked to ~871,000 deaths annually. Rapid social change is primary driver.
**Parameters**: `anomieLevel` (0-100). Rises with rapid change (paradigm shifts, automation), inequality, low social trust. Falls with community institutions, stable employment, social cohesion. Creates the "cost of modernization" mechanic — without it, rapid change has no downside.

### 11. Collective Memory / Historical Trauma
**Evidence**: Holodomor effects persist 3+ generations. Dutch Hunger Winter shows epigenetic evidence. Decay rate very slow (0.5-2% per generation without active healing).
**Parameters**: `collectiveTrauma` (0-100, decays very slowly). Major events (genocide, famine, conquest) set high values that persist for centuries. Affects trust, cooperation, risk-taking, institutional design preferences.

### 12. Food Security / Agricultural Capacity
**Evidence**: Food price spikes correlated with political instability (Arab Spring). Childhood stunting: 1% loss in height = 1.4% loss in economic productivity. Agricultural surplus enables civilizational complexity (Diamond, Scott).
**Parameters**: `foodSecurity` (0-100, derived from agricultural tech, land quality, climate, trade). Low food security → instability, migration, conflict.

---

## TIER 3 — Real but Lower Priority

### 13. Ethnic/Linguistic Fractionalization
Alesina's indices show diversity affects public goods provision, but Wimmer's correction shows political exclusion (not diversity itself) drives conflict. Adding an inclusion index would improve the cultural model.

### 14. Legal System Tradition
La Porta et al.: common law produces stronger investor protections and financial development than civil law. Strong intermediate effects but doesn't reliably predict GDP growth.

### 15. Judicial Independence
De facto independence (not de jure) has robust positive growth effect. China's reform showed 7% reduction in local protectionism.

### 16. Land Ownership Concentration
Latin America land Gini averages 0.84. Extreme path dependency from colonial land grants. Could be modeled as a modifier on existing equality/wealth concentration.

### 17. Substance Abuse Dynamics
75% of US employers report direct opioid impact. Feedback loop: economic decline → despair → addiction → labor force reduction → more decline. Could be modeled as consequence of high anomie + low wellbeing.

### 18. Caste / Rigid Stratification
Adds qualitative dimension to existing stratification: rigidity as a parameter that can lock mobility regardless of other factors. Could modify social mobility calculations.

---

## CROSS-CUTTING INSIGHT: Common Mathematical Pattern

Many Tier 1-2 factors share a common structure: **a stock that can be temporarily overdrawn with delayed nonlinear consequences**:
- Carrying capacity (ecological overshoot)
- Infrastructure (maintenance debt)
- Fiscal space (sovereign debt)
- Social trust (erosion)
- Energy surplus (EROI decline)
- Food security (soil depletion)

A generic "stock-and-flow with depletion threshold" mechanic could handle many of these efficiently. When the stock drops below a threshold, consequences cascade nonlinearly rather than proportionally.

---

## MOST IMPORTANT FEEDBACK LOOPS IDENTIFIED

1. **Trust → Growth → Equality → Trust** (virtuous or vicious cycle)
2. **Inequality → Low Mobility → Entrenched Inequality** (Great Gatsby trap)
3. **Energy decline → Complexity costs → Simplification pressure** (Tainter collapse)
4. **Infrastructure decay → Fiscal pressure → Deferred maintenance → More decay** (maintenance trap)
5. **Economic decline → Anomie → Addiction → Labor loss → More decline** (deaths of despair)
6. **Corruption → Low state capacity → Patronage → More corruption** (Ibn Khaldun cycle)
7. **Rapid change → Anomie → Instability → Regime change → More change** (modernization shock)
8. **Food shock → Instability → Conflict → Food disruption → More shock** (famine-conflict cascade)
9. **Overshoot → Resource depletion → Complexity reduction → Collapse** (ecological trap)
10. **Trauma → Low trust → Poor institutions → Vulnerability → More trauma** (conflict trap)

---

## RECOMMENDED IMPLEMENTATION ORDER

If implementing, the order that maximizes simulation realism per unit of code:

1. **Social Trust** — interacts with everything, small code footprint (single 0-100 value with drift logic)
2. **State Capacity** — explains the democracy-development puzzle, complements existing institutional quality
3. **Social Mobility** — makes inequality dynamics much richer, small addition
4. **Anomie** — provides the "cost of rapid change" mechanic, prevents unrealistically smooth transitions
5. **Infrastructure** — path dependency and maintenance trap, creates realistic decline dynamics
6. **Energy/EROI** — complexity ceiling, would need more design work
7. **Carrying Capacity** — overshoot-collapse dynamic, requires integration with sustainability systems
8. **Urbanization** — affects many systems, relatively simple to add
9. **Military balance** — grounds existing coup mechanics in structural variables
10. **Legitimacy type** — enriches existing leader/succession system
11. **Food security** — instability trigger, connects to existing resource stores
12. **Collective trauma** — long-term path dependency, very slow decay

## SOURCES

### Governance & Institutional
- Hanson & Sigman (2021) — State capacity dimensions
- Vu (2025) — State capacity and income
- Knutsen (2013) — Democracy-capacity interaction
- Weber (1922) — Legitimacy types
- Putnam (1993) — Civil society and governance quality
- Huntington (1957) — Civil-military relations
- La Porta et al. (1998, 2008) — Legal origins and economic outcomes
- Feld & Voigt — De facto judicial independence
- Urdal — Youth bulges and conflict risk

### Social & Cultural
- Knack & Keefer (1997) — Trust and growth
- Corak (2006), Krueger (2012) — Great Gatsby Curve
- Chetty et al. — Opportunity Atlas, social capital
- Case & Deaton — Deaths of despair
- Durkheim — Anomie
- WHO — Loneliness epidemic data
- Alesina & La Ferrara — Fractionalization indices
- Wimmer — Political exclusion vs diversity
- Dutch Hunger Winter studies — Epigenetic trauma transmission
- Frey & Osborne (2013) — Technological unemployment

### Economic & Ecological
- Hall — EROI framework
- Brockway et al. (2019, Nature Energy) — Declining fossil fuel EROI
- Motesharrei et al. (2014) — HANDY model
- Tainter (1988) — Collapse of Complex Societies
- De Benedictis et al. (2023) — Roman road persistence
- Reinhart & Rogoff — 800 years of financial crises
- Diamond (1997) — Agricultural surplus and complexity
- Scott (2017) — Against the Grain
- Wittfogel — Hydraulic civilizations
- Sachs & Warner — Resource curse
