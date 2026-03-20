# Economic & Ecological Dynamics Research
## For civ-sim Civilization Simulation
### Research Date: 2026-03-14

---

## Overview

This document covers 14 factors that create meaningful dynamics -- feedback loops, tipping points, collapse risks, and path dependencies -- that the simulation should consider modeling. Each factor is assessed for empirical strength, effect significance, simulation value, and required parameters.

**Existing simulation coverage:** economic models, wealth concentration, labor share, financial depth/debt, trade dependency, automation, technology, resource stores, sustainability metrics, population/demographics, wellbeing, equality, wealth capture, organized crime, CEO-worker ratio, inheritance, scarcity orientation.

---

## 1. Infrastructure and Public Goods

### Empirical Foundation: STRONG

**Key findings:**
- Output elasticity of public capital: 0.07-0.20 (meta-analyses correcting for publication bias). Aschauer's original 1989 estimates of 0.39-0.56 were revised downward but the positive relationship is robust across hundreds of studies.
- World Bank meta-analysis (2024): 221 papers, 1000+ estimates. Positive effect confirmed but heterogeneous across infrastructure types (transport, energy, digital).
- Roman road network: Areas near ancient Roman roads show higher economic activity *today* (De Benedictis et al., 2023, Journal of Regional Science). Road density in Italy persists from Roman-era investment. This is one of the strongest demonstrations of infrastructure path dependency in the empirical record.
- Infrastructure maintenance is as important as construction. Roman roads lasted millennia due to systematic maintenance; where maintenance ceased, economic persistence vanished.

**Key dynamics for simulation:**
- **Maintenance trap**: Infrastructure requires ongoing investment. Deferred maintenance accumulates as "infrastructure debt" that eventually costs far more to fix than ongoing maintenance would have. This creates a fiscal feedback loop: tight budgets -> deferred maintenance -> accelerating decay -> higher repair costs -> tighter budgets.
- **Growth multiplier with diminishing returns**: Initial infrastructure investment has high returns; additional investment shows diminishing returns (consistent with Tainter's complexity thesis).
- **Path dependency**: Early infrastructure choices lock in development patterns for centuries.

**Simulation value: HIGH**
Creates feedback loops between fiscal capacity, economic growth, and maintenance burden. Generates interesting collapse dynamics when maintenance is neglected.

**Suggested parameters:**
- `infrastructureLevel` (0-100): Current stock quality
- `infrastructureInvestment` (% of GDP): Annual spending
- `maintenanceBacklog` (0-100): Accumulated deferred maintenance
- `infrastructureType`: Transport-heavy, digital, water/sanitation, mixed

**Sources:** Aschauer (1989); Bom & Ligthart (2008) meta-analysis; World Bank meta-analysis (2024, Oxford Academic); De Benedictis et al. (2023, JORS); BBVA Research (2017).

---

## 2. Energy Systems and Transitions

### Empirical Foundation: STRONG

**Key findings:**
- EROI (Energy Return on Investment) is a fundamental constraint on civilizational complexity. Charles Hall's research: minimum EROI of ~10-15:1 needed to sustain industrial societies with healthcare, education, arts. Below ~5:1, only basic needs can be met. Below ~3:1, even transportation becomes marginal.
- Historical EROIs: Medieval agriculture ~1.1-4:1. Coal at peak ~80:1. Oil at peak ~100:1. Current fossil fuels at finished-fuel stage ~6:1 and declining (Brockway et al., 2019, Nature Energy).
- "Energy cliff": Below EROI ~5:1, net energy available to society drops precipitously (nonlinear). This is a genuine tipping point.
- Energy transitions cause severe social disruption: UK coal collapse saw 40% wage drops, effects persisting 15+ years. US coal communities lost population, tax base, and college-educated workers (Belfer Center research). German managed transition (early retirement, retraining) was significantly less disruptive.
- Wind turbine EROI now reaching 32-41:1 (Vestas data), potentially exceeding fossil fuels.

**Key dynamics for simulation:**
- **EROI as complexity ceiling**: The energy system's EROI determines what level of societal complexity can be sustained. As EROI declines, society must either find new energy sources or shed complexity.
- **Energy cliff tipping point**: Nonlinear relationship between EROI and available surplus energy.
- **Transition disruption**: Switching energy sources causes regional economic disruption, brain drain, political radicalization (empirically observed in coal regions globally).
- **Lock-in effects**: Energy infrastructure has 30-50 year lifespans, creating path dependency.

**Simulation value: VERY HIGH**
EROI creates the most important constraint on civilizational complexity that the simulation currently lacks. It generates the fundamental carrying capacity for societal overhead.

**Suggested parameters:**
- `energySource`: Wood, coal, oil, gas, nuclear, renewables, mixed
- `energyEROI` (derived from source mix): Net energy available
- `energyTransitionProgress` (0-100): How far along in a transition
- `energyInfrastructureAge`: Average age of energy infrastructure
- `transitionDisruption` (0-100): Social disruption from energy transition

**Sources:** Hall et al. on minimum EROI (ResearchGate); Court & Fizaine (2017, Ecological Economics); Brockway et al. (2019, Nature Energy); Belfer Center (Harvard) on coal transition; Tandfonline on German coal phase-out.

---

## 3. Monetary Systems and Currency

### Empirical Foundation: STRONG

**Key findings:**
- Gold standard delivered remarkable *long-run* price stability but significant *short-run* volatility (Philadelphia Fed research by Sanches & Fernandez-Villaverde). Fiat money allows crisis response but risks chronic inflation.
- Average inflation under gold standard for 13 countries: ~2.8%/year peak. Under fiat (1968-2001): 3.8% best case (Germany/Switzerland) to 8.2% worst case (Italy).
- Currency crises spread through trade networks (Eichengreen, Rose & Wyplosz, 1996, NBER). Using 30 years of data from 20 countries: contagion spreads more through trade linkages than through similar macroeconomic conditions.
- Gresham's Law ("bad money drives out good") operates when legal tender laws fix exchange rates between currencies of differing intrinsic value. In free markets, Thiers' Law (good money drives out bad) tends to hold instead.
- Seigniorage: During England's Great Debasement (1544-1551), seigniorage rose from typical <2% to 57%. Currency debasement is a historically recurring revenue extraction mechanism.
- Currency crises are preceded by: real exchange rate overvaluation, low reserves, banking crises, terms-of-trade deterioration (IMF research).

**Key dynamics for simulation:**
- **Monetary stability-flexibility tradeoff**: Commodity-backed currencies resist inflation but can't respond to crises. Fiat currencies allow crisis response but enable inflationary abuse.
- **Debasement temptation**: Governments under fiscal pressure face strong incentives to debase currency, extracting short-term revenue at the cost of long-term trust.
- **Currency crisis contagion**: Crises spread through trade networks, not just domestic fundamentals.
- **Gresham dynamics**: When trust in currency erodes, hoarding of stable alternatives begins.

**Simulation value: HIGH**
The sim already has debt models and financial depth. Currency system type would interact meaningfully with these, creating new collapse pathways (hyperinflation, currency crisis contagion) and tradeoffs.

**Suggested parameters:**
- `monetarySystem`: Commodity-backed, fiat, mixed, barter-based
- `currencyStability` (0-100): Trust in currency
- `inflationRate` (derived): From monetary policy and fiscal pressure
- `seigniorageExtraction` (0-100): Government revenue via money creation
- `currencyCrisisRisk` (derived): From overvaluation, reserves, trade exposure

**Sources:** Philadelphia Fed working papers; NBER WP 5681 (Eichengreen/Rose/Wyplosz); St. Louis Fed WP 2003-014; EH.net Gresham's Law encyclopedia entry; Mundell on Gresham's Law (USAGOLD).

---

## 4. Agricultural Productivity and Food Security

### Empirical Foundation: VERY STRONG

**Key findings:**
- James Scott (*Against the Grain*, 2017): Grain specifically enabled state formation because it is taxable -- visible, storable, transportable, calorie-dense. Many "civilizational achievements" preceded state formation. The transition to agriculture was not linear or voluntary; it was "patchier, more tenuous, and more bidirectional" than assumed.
- Green Revolution: Cereal production tripled 1960-2010 with only 30% more land. A 10-percentage-point increase in high-yielding variety coverage is associated with 10-15% higher per-capita GDP (Gollin, Hansen & Wingender, 2018, NBER).
- Green Revolution inequality: Benefits concentrated in irrigated areas. Wealthier farmers adopted first. Regional disparities widened. Sub-Saharan Africa was largely bypassed.
- Green Revolution environmental costs: Groundwater depletion, soil salinization, pesticide contamination, biodiversity loss. But also significant land-sparing: cereal area in Asia grew only 4% while production doubled.
- Food price-instability link: IMF research (Arezki & Bruckner, 2011) on 120 countries, 1970-2007: international food price increases significantly deteriorate democratic institutions in low-income countries.
- Arab Spring: Global food price spike 2010-2011 was a trigger/accelerant, not root cause. Countries with fiscal capacity to maintain subsidies (oil-rich monarchies) avoided instability. Egypt, highly dependent on food imports with weak finances, was vulnerable.
- Bidirectional causality: Revolution also causes food inflation (Yemen post-Arab Spring: supply chain disruption -> food price spiral).

**Key dynamics for simulation:**
- **Agricultural surplus as state enabler**: The type and quantity of agricultural surplus determines what kind of state can emerge.
- **Food security as stability prerequisite**: Food price shocks are empirically linked to political instability, especially in import-dependent, low-income societies.
- **Green Revolution tradeoffs**: Productivity gains come with inequality amplification and environmental degradation.
- **Subsidy trap**: Food subsidies maintain stability but create fiscal burden and dependency.

**Simulation value: HIGH**
The sim has food as a resource store. Adding agricultural productivity dynamics, food import dependency, and the food price-stability link would create important feedback loops.

**Suggested parameters:**
- `agriculturalProductivity` (0-100): Yield per unit land
- `foodImportDependency` (0-100): Reliance on external food
- `foodSubsidyBurden` (0-100): Fiscal cost of food subsidies
- `agriculturalMethod`: Subsistence, irrigated, industrial, mixed
- `foodPriceVolatility` (derived): From import dependency and global conditions

**Sources:** Scott, *Against the Grain* (Yale, 2017); Gollin et al. (2018, NBER WP 24744); Pingali (2012, PNAS); Arezki & Bruckner (2011, IMF WP/11/62); Lybbert & Morgan (2013) on Arab Spring food lessons.

---

## 5. Water Scarcity and Hydraulic Civilizations

### Empirical Foundation: MODERATE-STRONG

**Key findings:**
- Wittfogel's hydraulic hypothesis (strong form -- irrigation necessitates despotism) is largely rejected empirically. Counter-examples abound: Chinese irrigation predated state formation in some cases; Ceylon had large hydraulic works without despotic rule; causal direction often reversed (states enabled irrigation, not vice versa). Archaeological evidence (Adams, Gernet, Needham) contradicts the deterministic version.
- However, the weaker claim -- that water management and political power are deeply intertwined -- remains well-supported and continues to inform water governance research.
- Modern water stress: 2+ billion people in high-water-stress countries. By 2030, projections suggest nearly half the world's population will face high water stress.
- Nature Communications (2025): Framework explains >80% of transboundary river basins experiencing water-scarcity conflicts (2005-2014). Projects ~40% of global transboundary basins could face conflict by 2050 without mitigation, reducible to <10% with cooperation.
- Water conflict is primarily *intrastate*, not interstate. The risk of conflicts *within* countries from institutional adaptation pressures may be larger than inter-state water wars.
- Euphrates-Tigris basin: Turkey's dam projects reduced water flow to Syria/Iraq, a major geopolitical flashpoint.

**Key dynamics for simulation:**
- **Water as governance shaper**: Water management needs can drive centralization or cooperation.
- **Scarcity-conflict pathway**: Mediated by governance quality, institutional capacity, and economic inequality -- not a direct causal link.
- **Upstream-downstream power dynamics**: Control of water sources creates geopolitical leverage.
- **Agricultural-urban competition**: Growing cities compete with agriculture for water.

**Simulation value: MODERATE-HIGH**
Water scarcity interacts with food security, urbanization, and inter-civ conflict. Would add meaningful dynamics especially for arid-climate civilizations.

**Suggested parameters:**
- `waterStress` (0-100): Ratio of use to renewable supply
- `waterInfrastructure` (0-100): Dams, irrigation, treatment capacity
- `waterGovernance`: Centralized, cooperative, contested, absent
- `transboundaryWaterDependency` (0-100): Reliance on water from other civs

**Sources:** Wittfogel, *Oriental Despotism* (1957) and extensive critical literature; Water-Alternatives journal (2016); Nature Communications (2025) on transboundary conflict; CSIS analysis on water conflict causes; UN World Water Development Report 2024.

---

## 6. Carrying Capacity and Ecological Overshoot

### Empirical Foundation: MODERATE (contested for historical cases)

**Key findings:**
- Catton (*Overshoot*, 1982): Industrial civilization lives on "phantom carrying capacity" -- drawing down non-renewable resources and degrading ecosystems to temporarily support population beyond sustainable levels.
- HANDY model (Motesharrei et al., 2014, Ecological Economics): Models collapse dynamics with two key variables: (1) ecological strain on carrying capacity and (2) economic stratification (Elites vs. Masses). Slower-growing resource bases produce overshoot-and-collapse; faster-growing ones allow equilibrium adjustment.
- Easter Island narrative challenged: Recent archaeology (Science Advances, 2024) shows Rapa Nui had sustainable agricultural systems, contradicting the classic overshoot-collapse story. The evidence now suggests contact-era European disease and slave raids caused population decline, not resource overshoot.
- Maya collapse: Drought contributed but was not sole cause. Multi-causal: drought + warfare + political fragmentation + trade disruption.
- Mesopotamian salinization: Well-documented case of agricultural overshoot through irrigation-induced soil salinization leading to declining yields.
- Modern overshoot: Global ecological footprint exceeded biocapacity around 1970. Currently at ~170% of Earth's regenerative capacity (Global Footprint Network data).
- Tainter's complexity theory: Collapse results from diminishing returns on investments in societal complexity, not simple resource overshoot. Societies add layers of bureaucracy, infrastructure, and specialization that eventually cost more than they return.

**Key dynamics for simulation:**
- **Overshoot-and-collapse**: Population/consumption can temporarily exceed carrying capacity by drawing down resource stocks, but this creates delayed collapse risk.
- **Phantom carrying capacity**: Technology can extend apparent carrying capacity but may create fragility if dependent on non-renewable inputs.
- **Stratification amplifier**: HANDY model shows that inequality accelerates collapse dynamics because elites continue consuming while masses face deprivation.
- **Complexity trap (Tainter)**: Each new layer of complexity has diminishing returns. Eventually maintenance costs exceed benefits.

**Simulation value: HIGH**
The sim already tracks sustainability metrics. Adding explicit carrying capacity dynamics with overshoot potential would create the most important long-term collapse pathway.

**Suggested parameters:**
- `carryingCapacity` (derived): From land, water, agricultural productivity, energy
- `overshootRatio` (derived): Population*consumption / carrying capacity
- `complexityLevel` (0-100): Bureaucratic/institutional overhead
- `complexityReturns` (derived): Diminishing returns on complexity investment
- `resourceDrawdownRate` (derived): Rate of non-renewable resource depletion

**Sources:** Catton, *Overshoot* (1982); Motesharrei et al. (2014, Ecological Economics) HANDY model; Tainter, *The Collapse of Complex Societies* (1988); Bardi et al. (arXiv, 2018) biophysical model of Tainter; Science Advances (2024) on Easter Island.

---

## 7. Trade Network Position and Effects

### Empirical Foundation: STRONG

**Key findings:**
- Wallerstein's world-systems theory: Core-periphery-semi-periphery structure redistributes surplus from periphery to core. Empirical network analyses of international trade data confirm this hierarchical structure, showing remarkable stability even through the 2008 crisis (Journal of World-Systems Research).
- All historical hegemonic core states (Netherlands, Britain, US) were formerly semi-peripheral. Semi-peripheral development is the primary pathway to core status -- a key finding for simulation dynamics.
- Silk Road empirical research: Political fragmentation along trade routes damaged city growth (Stanford University study). Political stability associated with large empires created security zones enabling trade.
- Maritime vs. land trade: Maritime transport cost ~1/5 of overland in pre-modern times. The shift from land to sea trade routes fundamentally redistributed power. Song Dynasty's loss of overland Silk Road access forced maritime development, which ultimately proved more efficient.
- Roman road network persistence: Trade infrastructure effects measurable 2000+ years later (Dalgaard et al., 2018).
- Hub cities at network intersections grew disproportionately; loss of hub position could devastate previously prosperous cities.

**Key dynamics for simulation:**
- **Core-periphery extraction**: Trade network position determines whether a civ captures or loses surplus. This is a self-reinforcing dynamic.
- **Semi-peripheral mobility**: The semi-periphery is where upward mobility happens -- the most dynamic position.
- **Network vulnerability**: Dependence on specific trade routes creates vulnerability to disruption (political fragmentation, piracy, alternative routes).
- **Maritime vs. land trade mode**: Affects volume, cost, and which civs benefit.
- **Hub advantage**: Controlling trade intersections creates disproportionate economic and political power.

**Simulation value: HIGH**
The sim already has trade dependency and trade agreements. Adding explicit network position dynamics (core/periphery/semi-periphery) and route vulnerability would create richer inter-civ dynamics.

**Suggested parameters:**
- `tradeNetworkPosition`: Core, semi-periphery, periphery, isolated
- `tradeRouteControl` (0-100): Control over key trade routes/hubs
- `tradeModality`: Land-based, maritime, mixed
- `networkCentrality` (derived): How many trade connections pass through this civ

**Sources:** Wallerstein, *The Modern World-System* (1974+); Smith & White (1992, Social Forces); Snyder & Kick (1979, AJS); Blaydes (Stanford) on Silk Road political fragmentation; Dalgaard et al. (2018) on Roman roads persistence.

---

## 8. Innovation Ecosystems

### Empirical Foundation: STRONG

**Key findings:**
- Moretti (2021, American Economic Review): Study of 109,846 inventors. Larger tech clusters make inventors more productive -- not just selection of better inventors into clusters, but genuine agglomeration effects.
- Knowledge spillovers are highly localized: Patent citations are geographically concentrated (Jaffe, Trajtenberg & Henderson, 1993). Face-to-face meetings between workers of different firms in Silicon Valley result in significantly higher subsequent patent citations (Atkin, Chen & Popov, 2022, using smartphone geolocation data).
- Three key clustering rationales: (1) localized knowledge spillovers, (2) low commuting costs, (3) abundant specialized workers.
- Spin-off dynamics: Fairchild Semiconductor spawned Silicon Valley through employee departures starting new firms. The spin-off process creates self-reinforcing cluster growth.
- Cross-cluster spillovers: Silicon Valley's high innovation is not just local -- it is highly connected to other clusters through firm networks. Plants whose connected clusters are at the 75th percentile see 8.2% higher inventor productivity.
- University-industry linkage: Stanford/Berkeley proximity was crucial for Silicon Valley. The "Triple Helix" model (university-industry-government) describes successful innovation ecosystems.
- Cluster fragility: High land rents and commuting costs can fragment clusters. Success creates affordability crises that threaten the cluster itself.
- Historical clustering: Renaissance Florence, Song Dynasty Kaifeng, Abbasid Baghdad -- innovation clustering is not a modern phenomenon.

**Key dynamics for simulation:**
- **Clustering returns**: Innovation output is nonlinear in concentration. Scattered inventors produce less than clustered ones.
- **Spin-off cascades**: One breakthrough institution can seed an entire innovation ecosystem.
- **University-industry linkage**: Education system quality affects innovation output multiplicatively, not additively.
- **Success trap**: Innovation clusters can price themselves out through rising costs.
- **Cross-civ spillovers**: Connected civs benefit from each other's innovation clusters.

**Simulation value: MODERATE-HIGH**
The sim has technology levels. Adding innovation ecosystem dynamics would explain *why* some civs innovate faster -- creating path dependency and divergence that isn't purely random.

**Suggested parameters:**
- `innovationClusterStrength` (0-100): Agglomeration of knowledge workers
- `universityIndustryLinkage` (0-100): Connection between education and production
- `knowledgeSpilloverRate` (derived): From cluster strength, openness, connectivity
- `innovationCostPressure` (derived): Rising costs threatening cluster viability

**Sources:** Moretti (2021, AER); Jaffe et al. (1993); Atkin et al. (2022); Klepper on Silicon Valley/Detroit; Arthur (1990) on increasing returns and clustering; NBER WP 19013 on entrepreneurship clusters.

---

## 9. Natural Disasters and Climate Variability

### Empirical Foundation: STRONG

**Key findings:**
- Meta-analysis (Scielo, 2022): Synthesizing 650+ estimates, natural disasters have a significant negative combined effect on economic growth (-0.015), with 11 of 19 studies finding significant negative effects.
- Hsiang & Jina (2014): Cyclones have persistent negative effects on GDP growth, using data from nearly every country over 1950-2008. No evidence of "creative destruction" recovery.
- Developing countries suffer more: Negative impact is greater in developing countries and has increased in recent decades.
- Climate-civilization correlation: 4.2 kiloyear event (increased aridity) coincided with Akkadian Empire collapse and Old Kingdom Egypt decline. Chinese dynastic cycles correlate with monsoon strength (2,000-year stalagmite record, 2008). Little Ice Age coincided with European General Crisis of the 17th century.
- Climate periods were regional, not global: 2019 analysis showed Roman Warm Period, Medieval Warm Period, and Little Ice Age were not globally synchronous -- peak warmth/cold occurred at different times in different regions. This complicates simple climate-collapse narratives.
- Drought-conflict nexus: Von Uexkull et al. (2016, PNAS) -- growing-season drought increases conflict risk for agriculturally dependent groups in least-developed countries. The effect is context-dependent, not universal.
- 2015 meta-analysis of 55 studies: 1 standard deviation temperature change increases intergroup conflict risk by 14%.

**Key dynamics for simulation:**
- **Climate as amplifier**: Climate shocks don't cause collapse alone but amplify existing vulnerabilities (inequality, fiscal weakness, food dependency).
- **Disaster recovery asymmetry**: Developed civs recover; developing civs can be permanently set back.
- **Climate-agriculture-stability cascade**: Climate shift -> agricultural disruption -> food insecurity -> political instability.
- **Regional differentiation**: Climate effects are geographically variable, creating winners and losers simultaneously.

**Simulation value: MODERATE-HIGH**
The sim already has geography/climate tags and disaster events. Adding climate variability's interaction with food security and stability would strengthen existing systems rather than requiring entirely new ones.

**Suggested parameters:**
- `climateStability` (0-100): Variability of climate conditions
- `climateTrend`: Warming, cooling, drying, stable
- `disasterExposure` (derived): From geography and climate
- `disasterResilience` (derived): From infrastructure, fiscal capacity, development level

**Sources:** Botzen et al. (2019, Review of Environmental Economics and Policy); Hsiang & Jina (2014); von Uexkull et al. (2016, PNAS); Zhang et al. (2011) on climate-crisis causation; Lawrence et al. (2019, Journal of Archaeological Science) on Akkadian collapse.

---

## 10. Externalities and Commons Problems

### Empirical Foundation: STRONG

**Key findings:**
- Ostrom's design principles for successful commons management (Nobel Prize 2009): Clear boundaries, graduated sanctions, collective decision-making, monitoring, conflict resolution. Empirically validated across forests, fisheries, irrigation systems worldwide.
- Ostrom's key insight: "Institutional diversity may be as important as biological diversity for our long-term survival."
- Agrawal's forest study: At 84 sites in East Africa and South Asia, local user involvement in rulemaking correlates with both better livelihoods and healthier forests.
- Fisheries: Despite understanding the problem, global fisheries remain depleted. The issue is a "nested set of diverse and interconnected collective action problems at different levels" (Ostrom framework applied to fisheries, 2024).
- Antibiotic resistance: Classic commons problem. Over 30% of antibiotics are overprescribed. Livestock antibiotic use in China alone projected to reach 33,000 tons by 2030. Discovery rate cannot keep up with resistance emergence.
- Soil depletion: Agricultural land degradation from overuse is another commons problem, particularly where property rights are unclear or enforcement is weak.
- Institutional innovation: Commons problems can trigger new institutions -- but only when the costs of non-cooperation become visible and a cooperation mechanism is feasible. This is a threshold dynamic.

**Key dynamics for simulation:**
- **Accumulating externalities**: Unpriced costs (pollution, resistance, soil degradation) accumulate invisibly until they cross thresholds.
- **Commons governance spectrum**: From open-access (tragedy guaranteed) through Ostrom-style community management to full privatization, each with different failure modes.
- **Institutional innovation trigger**: When commons degradation becomes severe enough, it can trigger institutional change -- but there's a race between degradation speed and institutional adaptation speed.
- **Cross-civ commons**: Some resources (atmosphere, oceans, migratory fish) are inherently inter-civilizational commons problems.

**Simulation value: HIGH**
The sim already tracks pollution and resource depletion. Adding explicit commons dynamics with institutional response thresholds would create important governance-environment feedback loops.

**Suggested parameters:**
- `commonsGovernance`: Open-access, community-managed, privatized, state-managed
- `externalityAccumulation` (0-100): Unpriced environmental costs building up
- `institutionalAdaptationSpeed` (0-100): How quickly institutions respond to commons degradation
- `crossBorderCommons` (0-100): Degree of shared resources with other civs

**Sources:** Hardin (1968, Science); Ostrom, *Governing the Commons* (1990) and Nobel lecture; Ostrom et al. (1999, Science); PubMed (2015) on antibiotic resistance as commons problem; ScienceDirect (2024) on global fisheries governance.

---

## 11. Supply Chain Complexity and Fragility

### Empirical Foundation: STRONG (especially post-COVID)

**Key findings:**
- The efficiency-resilience tradeoff is nonlinear: Research found a 3.2x "fragility multiplier" -- companies with high inventory leanness see marginal efficiency improvements in calm times become catastrophic losses during shocks. This is a genuine tipping point.
- Disruption cascades through networks: For every $1 in sales a disrupted firm loses, customer firms lose $2.40 on average (US natural disaster study). The 2011 Japan earthquake: half of total economic impact came from propagation to firms four degrees separated from those directly hit.
- Hendricks & Singhal (2005): Supply chain disruptions negatively affect firm performance for up to 2 years after announcement.
- Dual-sourcing reduces losses by 72%. Supplier relationship depth (not just diversification) matters for recovery speed.
- Resilience costs are modest: 1.2-1.8% of cost of goods sold, with only 4.3% median decrease in inventory turnover. The cost of *not* being resilient is far higher.
- Historical parallel: The Silk Road's vulnerability to political fragmentation along routes is an ancient version of supply chain fragility.

**Key dynamics for simulation:**
- **Specialization-fragility tradeoff**: Economic specialization increases efficiency but creates single points of failure.
- **Cascade amplification**: Disruptions propagate and amplify through trade networks.
- **Just-in-time vulnerability**: Lean systems are efficient in stable conditions but collapse faster under stress.
- **Resilience investment dilemma**: Resilience costs money during good times but pays off massively during crises. Civs under-invest because the payoff is probabilistic.

**Simulation value: MODERATE-HIGH**
Would interact well with existing trade dependency and disaster systems. Creates interesting strategic choices about efficiency vs. resilience.

**Suggested parameters:**
- `supplyChainComplexity` (0-100): Degree of specialization and interdependence
- `inventoryResilience` (0-100): Buffer stocks and redundancy
- `sourceDiversification` (0-100): Single-source vs. multi-source supply
- `cascadeVulnerability` (derived): From complexity, resilience, and network position

**Sources:** PMC (2021) major supply chain resilience review; Hendricks & Singhal (2005); Sage Journals (2025) on resilience-efficiency balancing; Richmond Fed (2025); FIR Journal on lean inventory fragility multiplier.

---

## 12. Urbanization Dynamics

### Empirical Foundation: STRONG

**Key findings:**
- Zipf's Law: City sizes follow a power-law distribution (rank inversely proportional to population). Holds remarkably well globally for 3,646 cities (Angel). The Zipf exponent acts as a "control parameter" for urbanization: exponent=1 caps urbanization at ~50%; exponent<1 allows urbanization above 80%.
- Primate city dominance: Many developing nations have a single dominant city far larger than Zipf's Law predicts. This represents extreme concentration of economic and political power.
- Agglomeration economies are stronger in developing countries: Productivity gains from density are higher in China and India than in the US or Brazil (Glaeser et al., Harvard).
- Slum formation: 1.1 billion people live in slums, projected to rise by 2 billion over 30 years. Primary causes: rural-to-urban migration outpacing infrastructure capacity, inability to provide affordable housing, urban bias in government spending.
- Infrastructure cost scaling: Moving from small city to mega-city raises per capita infrastructure costs by 3x (Richardson, 1987).
- Urbanization-growth relationship: Positive when accompanied by infrastructure investment (transport, ICT). Negative ("diseconomies of scale") when infrastructure lags -- congestion, slums, pollution.
- Sub-Saharan Africa: ~50% of urban population lives in slums. Urbanization without industrialization is a distinctive pattern.

**Key dynamics for simulation:**
- **Urban-rural ratio as development proxy**: Urbanization tracks development level but can outpace it.
- **Primate city vs. distributed urbanism**: Different configurations produce different governance challenges and economic dynamics.
- **Slum formation threshold**: When migration exceeds infrastructure capacity, slums form. Once formed, they are extremely difficult to reverse.
- **Agglomeration vs. congestion**: Cities produce both positive (productivity, innovation) and negative (congestion, disease, inequality) externalities. The balance shifts with size and infrastructure.

**Simulation value: MODERATE-HIGH**
The sim has population but no urbanization dynamics. Adding urban-rural ratio and urbanization-infrastructure interaction would create important development path dynamics.

**Suggested parameters:**
- `urbanizationRate` (0-100): Share of population in cities
- `urbanConcentration`: Primate, polycentric, distributed
- `slumPrevalence` (0-100): Share of urban population in informal settlements
- `urbanInfrastructureGap` (derived): Difference between urbanization rate and infrastructure capacity

**Sources:** Angel on Zipf's Law (global sample); Glaeser et al. (Harvard CID); Agarwal (2007, Journal of Urban Health) on slum formation; Nature (2025) on infrastructure deficits in sub-Saharan Africa; ScienceDirect on Zipf exponent and urbanization control.

---

## 13. Sovereign Debt and Fiscal Capacity

### Empirical Foundation: STRONG (but contested on thresholds)

**Key findings:**
- Reinhart & Rogoff's 90% debt/GDP threshold: Original finding that growth drops sharply above 90% debt/GDP was partially invalidated by Herndon, Ash & Pollin (2013) -- coding errors and selective data exclusion. Corrected average growth at >90% debt/GDP is 2.2%, not -0.1%. However, a decade of follow-up studies: half find *some* threshold between 75-100%, and the broader negative relationship between high debt and growth is widely supported.
- Reinhart & Rogoff historical database (66 countries, 800 years): Sovereign default is a recurring feature, not an anomaly. Five major default cycles since 1800. At peak, nearly half of all countries have been in default simultaneously.
- Causal mechanism: Banking crises often precede sovereign defaults. Private debt surges -> banking crises -> sovereign debt crises is a recurring sequence. Central government debt increases ~86% in the 3 years following a financial crisis.
- Default recidivism: 2/3 of external default recurrences happen within 20 years. It takes 50-100 years to meaningfully "graduate" from default-prone status.
- Fiscal capacity determines crisis response: Advanced economies have longer runway for debt management. Emerging markets face default risk that constrains their crisis response options.
- Debt overhang: Episodes average 1.2% lower growth and last an average of 23 years.

**Key dynamics for simulation:**
- **Fiscal space as crisis buffer**: High debt constrains crisis response capacity, creating a vulnerability feedback loop.
- **Default cycles**: Sovereign default is cyclical, not exceptional. Commodity price crashes trigger default waves.
- **Banking-sovereign doom loop**: Banking crises and sovereign crises reinforce each other.
- **Debt overhang persistence**: High debt episodes last decades and compound through lower growth.

**Simulation value: HIGH**
The sim has debt models. Adding sovereign debt dynamics with fiscal capacity interaction would create the government-finance feedback loop that is one of the most well-documented drivers of state crisis.

**Suggested parameters:**
- `sovereignDebtLevel` (% of GDP): Government debt burden
- `fiscalCapacity` (0-100): Tax collection effectiveness and base
- `defaultHistory` (count): Number of past defaults (affects borrowing costs)
- `fiscalSpace` (derived): Capacity to respond to crises
- `debtCrisisRisk` (derived): From debt level, growth rate, commodity exposure

**Sources:** Reinhart & Rogoff, *This Time Is Different* (2009); Herndon, Ash & Pollin (2013, Cambridge Journal of Economics); Mercatus Center (2020) decade-of-studies review; IMF WP/13/266 on financial and sovereign debt crises; NBER Working Papers 13882, 15795.

---

## 14. Knowledge Diffusion and Intellectual Property

### Empirical Foundation: STRONG

**Key findings:**
- Brain drain is quantitatively significant: ~1/3 of scientists/engineers trained in developing countries work in developed countries. More African scientists work in the US than in all of Africa.
- Brain drain has complex effects: Migrants increase their own patenting by 33% after moving to the US (Prato, 2025, Quarterly Journal of Economics). But they also benefit their origin country: co-inventors at origin increase patenting by 16% when a collaborator emigrates. This "brain circulation" partially offsets brain drain.
- Diaspora knowledge networks: ICT enables knowledge transfer without physical return. China, Taiwan, Israel, and India have successfully leveraged diasporas.
- FDI as knowledge transfer: Workers with multinational enterprise experience contribute 20% more to plant productivity than comparable workers without MNE experience (Balsvik, 2011, Norway data).
- Patent/IP effects are nonlinear with development: Inverted U-shape for emerging countries (too little IP protection discourages innovation; too much blocks catching up). Utility models ("petty patents") are more effective for technologically lagging countries than full patents (Korea firm-level data).
- Historical IP was not always necessary: Significant industrialization occurred in 19th century countries with imperfect or absent patent systems.
- Developing countries' patent systems were often imposed externally (colonial legacy), not evolved from domestic needs.
- IP effects concentrated in specific sectors: Pharma, biotech, medical instruments, specialty chemicals -- not broadly across the economy.

**Key dynamics for simulation:**
- **Brain drain-circulation spectrum**: Talented individuals leave for opportunities, but maintain connections that transfer knowledge back. The net effect depends on diaspora policy and institutional quality.
- **IP regime as development-stage-dependent**: Optimal IP protection changes with development level. What works for advanced economies can hinder catching-up economies.
- **Knowledge diffusion channels**: Trade, FDI, migration, diaspora networks, patent citations -- multiple parallel channels.
- **Technology gap dynamics**: Lagging civs can catch up through imitation (easier with weak IP), but eventually need own innovation capacity (requires stronger IP).

**Simulation value: MODERATE-HIGH**
The sim has technology levels and knowledge as a resource. Adding explicit knowledge diffusion mechanics between civs would create convergence/divergence dynamics that explain technology gaps.

**Suggested parameters:**
- `knowledgeOpenness` (0-100): Ease of knowledge flow in and out
- `brainDrainRate` (derived): From development gap, opportunity differential
- `diasporaStrength` (0-100): Size and engagement of diaspora networks
- `ipRegime`: Weak, moderate, strong, adaptive
- `technologyAbsorptionCapacity` (0-100): Ability to adopt external knowledge

**Sources:** Prato (2025, QJE); Keller (2021, NBER WP 28739) on knowledge spillovers via trade/FDI; Chen & Puttitanum (2005, JDE) on IP and developing countries; Kim et al. (2012, Research Policy) on patents vs. utility models; WIPO on diaspora knowledge networks.

---

## Synthesis: Priority Ranking for Implementation

### Tier 1: Highest simulation value (new dynamics the sim lacks entirely)

1. **Energy Systems and EROI** -- Creates the fundamental constraint on civilizational complexity. Interacts with everything. Produces the most important tipping point (energy cliff) and path dependency (energy infrastructure lock-in).

2. **Carrying Capacity and Overshoot** -- The sim needs an explicit carrying capacity ceiling that can be temporarily exceeded. Combined with Tainter's complexity-cost dynamics, this creates the primary long-term collapse mechanism.

3. **Infrastructure** -- Maintenance trap creates the most realistic fiscal feedback loop. Path dependency is empirically very strong. Interacts with urbanization, energy, and trade.

### Tier 2: High value (enriches existing systems significantly)

4. **Sovereign Debt and Fiscal Capacity** -- Banking-sovereign doom loop is well-documented. Interacts with existing debt models. Default cycles create historically accurate crisis patterns.

5. **Monetary Systems** -- Interacts with existing debt/financial systems. Currency crisis contagion creates inter-civ dynamics. Debasement temptation creates governance-economy feedback.

6. **Agricultural Productivity and Food Security** -- Food price-stability link is empirically robust. Interacts with existing food stores and stability systems.

7. **Trade Network Position** -- Core-periphery dynamics explain persistent inequality between civs. Semi-peripheral development path is the key to upward mobility.

8. **Externalities and Commons** -- Institutional innovation triggers from commons degradation. Extends existing pollution/sustainability tracking.

### Tier 3: Meaningful additions (valuable but narrower scope)

9. **Innovation Ecosystems** -- Explains technology divergence between civs. Clustering dynamics create interesting path dependency.

10. **Urbanization** -- Urban-rural ratio and slum dynamics create development path variations. Infrastructure strain feedback loop.

11. **Supply Chain Fragility** -- Efficiency-resilience tradeoff creates strategic choices. Cascade amplification interacts with trade system.

12. **Knowledge Diffusion** -- Brain drain/circulation dynamics explain technology convergence/divergence. Interacts with education and trade systems.

13. **Water Scarcity** -- Important for arid-climate civs. Interacts with agriculture and inter-civ conflict.

14. **Natural Disasters and Climate** -- Amplifies existing vulnerabilities rather than creating new dynamics. The sim already has disaster events; climate variability would enrich them.

---

## Key Feedback Loops Identified

These are the most important feedback loops that emerge from the research, roughly ordered by empirical support and simulation impact:

1. **Energy-complexity loop**: Higher complexity requires more energy -> declining EROI reduces surplus -> forced simplification or collapse (Tainter + Hall)

2. **Infrastructure maintenance trap**: Tight budgets -> deferred maintenance -> accelerating decay -> higher costs -> tighter budgets (Roman Empire, modern US)

3. **Banking-sovereign doom loop**: Private debt surge -> banking crisis -> sovereign bailout -> sovereign debt crisis -> fiscal austerity -> economic contraction (Reinhart & Rogoff, empirically recurring)

4. **Food-stability cascade**: Climate/trade shock -> food price spike -> political instability -> conflict -> further food supply disruption (Arab Spring, Somalia)

5. **Core-periphery self-reinforcement**: Core captures surplus -> invests in productivity/military -> extends control -> captures more surplus (Wallerstein)

6. **Innovation agglomeration**: Talent cluster -> more innovation -> more opportunity -> more talent arrives -> higher costs -> potential fragmentation (Silicon Valley)

7. **Overshoot-and-collapse**: Population exceeds carrying capacity -> resource drawdown -> delayed signals -> sudden collapse when stocks exhausted (HANDY model)

8. **Urbanization-infrastructure race**: Migration to cities -> infrastructure strain -> slum formation -> poverty trap -> more migration from declining rural areas (developing country pattern)

9. **Commons degradation race**: Individual incentives to exploit -> collective degradation -> institutional innovation attempt vs. collapse threshold (Ostrom vs. Hardin)

10. **Currency trust spiral**: Fiscal pressure -> currency debasement -> inflation -> capital flight -> reduced fiscal capacity -> more debasement (historical recurring pattern)

---

## Implementation Notes

- Many of these factors interact multiplicatively, not additively. Energy EROI constrains complexity, which constrains infrastructure, which constrains urbanization, which constrains innovation capacity. The simulation should model these as nested constraints rather than independent variables.

- Several factors share a common mathematical structure: a resource/capacity that can be temporarily overdrawn (carrying capacity, infrastructure maintenance, fiscal space, commons stocks) with delayed consequences. A generic "stock and flow with depletion threshold" mechanic could handle many of these.

- The most important *missing* mechanic in the current sim appears to be the distinction between stocks that can be temporarily exceeded (creating fragility) and hard constraints that cannot. Currently the sim appears to treat resource levels as constraints; adding the overshoot possibility would create the most significant new dynamic.

- Path dependency is a recurring theme: infrastructure choices, energy system choices, trade network position, innovation cluster location, IP regime -- all show strong persistence effects. The simulation should consider initial-condition sensitivity for these parameters.
