# Governance & Institutional Dynamics Research
## What the Simulation Should Model (Beyond Current Implementation)

Research compiled 2026-03-14. Sources: peer-reviewed literature, empirical studies, historical case analyses.

---

## Executive Summary: Recommended Additions by Priority

### TIER 1 — Large effect, well-established, adds major missing dynamics
1. **State Capacity** (3 sub-dimensions) — distinct from institutional quality
2. **Legitimacy Type** (traditional/charismatic/rational-legal) — drives regime resilience
3. **Legal System Tradition** — shapes property rights, regulation, financial development
4. **Urbanization Rate** — affects inequality, governance capacity, political cleavage
5. **Military-Civilian Power Balance** — determines coup risk, regime stability

### TIER 2 — Significant effect, well-documented, adds meaningful dynamics
6. **Civil Society Strength** — mediates state-individual relationship
7. **Judicial Independence** (de facto) — affects corruption, property rights
8. **Centralization Degree** — fiscal federalism vs. central control
9. **Age Structure Effects** (expand existing demographic model)

### TIER 3 — Real effects but more conditional or already partially covered
10. **Term Limits / Power Rotation** — smaller, mixed effects
11. **Trade Dependency / Resource Curse** (partially covered by resources)
12. **Information Control** (largely covered by existing Information Ecosystem)

---

## 1. STATE CAPACITY / BUREAUCRATIC CAPACITY

### Why it's different from "Institutional Quality"
The simulation currently tracks `institutionalQuality` (0-100). This is a composite measure. State capacity is a distinct concept describing the government's **ability to implement policy**, not the quality of its institutions' design. A country can have well-designed institutions (high institutional quality) but lack the bureaucratic apparatus to enforce them (low state capacity), or vice versa (efficient authoritarianism).

### Empirical basis

**Hanson & Sigman (2021, *Journal of Politics*)** identify three core dimensions:

1. **Extractive/Fiscal Capacity**: Ability to raise tax revenue. Requires reaching the population, maintaining information (census), trustworthy agents, enforcement. Measured by: tax-to-GDP ratio, income tax collection, tax evasion rates.

2. **Administrative Capacity**: Ability to develop policy, deliver public services, regulate commerce. Requires: professional bureaucracy, technical competence, data collection, monitoring. Weber's "bureaucratic rationalization."

3. **Coercive Capacity**: Monopoly on legitimate violence. Ability to maintain internal order, enforce policy, protect borders. Measured by: military expenditures per capita, security force presence.

**Key finding**: These three dimensions are empirically interrelated but conceptually distinct. A state strong in one dimension tends to be strong in others, but the correlation is imperfect — states can be coercively strong but administratively weak (many post-colonial military regimes).

### Effect magnitude

**Vu (2025, *Oxford Bulletin of Economics and Statistics*)**: One standard deviation increase in state capacity index predicts 6-7% rise in income per person. This is a large effect, though roughly half of earlier estimates that used less rigorous methods.

**Evans & Rauch (1999)**: The "Weberianness Scale" — measuring meritocratic recruitment and predictable career structures in bureaucracies — significantly predicts economic growth across 35 developing countries (1970-1990), even controlling for initial GDP and human capital.

**IMF (2025)**: High state capacity helps sustain growth regimes and limits output collapses in 108 developing countries. Effect is conditional on political institutions.

**Knutsen (2013)**: Critical interaction effect — democracy boosts growth in LOW-capacity states but not high-capacity states; state capacity boosts growth only in DICTATORSHIPS. This means the combination matters enormously.

### State capacity development and decay

**NBER Working Paper (Xu, 2023)**: The U.S. federal state grew its capacity through innovations in monitoring technology (telegraph, railroads) that reduced agency problems between government and agents. State capacity development is path-dependent and tied to information infrastructure.

**Cambridge historical study**: The lesson of history is not to build a capacious state per se, but a state that uses its capacity to support (or not hinder) market activity. State capacity spent on war vs. infrastructure produces very different growth outcomes.

**Ibn Khaldun's cyclical model**: Dynasties last ~120 years (3-4 generations) before collapsing due to erosion of group solidarity (*asabiyyah*). Conquerors urbanize, accumulate wealth, foster elite parasitism, lose cohesion, get overthrown. This maps well to state capacity decay cycles.

**Failed state research**: State collapse typically results from prolonged institutional decay driven by corruption, elite predation, loss of legitimacy, patronage exhaustion, ethnic exclusion, and weak fiscal capacity — compounded by external shocks.

### Recommendation for simulation

**ADD: `stateCapacity` (0-100)** — distinct from `institutionalQuality`

Sub-components to track:
- `fiscalCapacity` (0-100): Tax collection efficiency. Driven by: administrative tech level, corruption (inverse), population census capability, urbanization (easier to tax urban populations).
- `administrativeCapacity` (0-100): Policy implementation ability. Driven by: education level, meritocratic hiring vs. patronage, bureaucratic professionalism.
- `coerciveCapacity` (0-100): Internal order enforcement. Driven by: military spending, police/security apparatus, territorial control.

**Key dynamics to model:**
- State capacity develops SLOWLY (generational timescale)
- Corruption erodes administrative capacity
- War can build coercive capacity but drain fiscal/administrative
- Democracy + low state capacity = growth; autocracy + high state capacity = growth; democracy + high state capacity = neutral; autocracy + low state capacity = stagnation (Knutsen interaction)
- State capacity decay accelerates once corruption passes threshold (positive feedback loop)
- Technology improvements (census, communications) boost fiscal capacity

**Significance: VERY HIGH.** This is the single most important missing factor. It explains why some authoritarian states grow fast (high capacity) while some democracies stagnate (low capacity). Without it, the simulation conflates institutional design with implementation capability.

---

## 2. LEGITIMACY TYPE

### Empirical basis

**Weber's tripartite framework** remains foundational after 100+ years:

1. **Traditional legitimacy**: Authority from custom, heredity, religious sanction. Characteristic of monarchies, tribal systems, theocracies. Stable but brittle — cannot adapt to rapid modernization.

2. **Charismatic legitimacy**: Authority from exceptional personal qualities of leader. Inherently unstable — depends on individual. Subject to "routinization of charisma" (Weber) — must eventually transform into traditional or rational-legal forms or collapse.

3. **Rational-legal legitimacy**: Authority from legal rules and procedures. Most stable long-term form. Characteristic of modern bureaucratic states. Enables impersonal governance.

**Lipset's extension**: Legitimacy = "the capacity of the system to engender and maintain the belief that existing political institutions are the most appropriate ones for the society." Legitimacy is linked to system EFFECTIVENESS — legitimacy erodes when government fails to deliver.

### What the simulation is missing

The simulation models governance types and has implicit legitimacy (via stability), but does not track the TYPE of legitimacy. This matters because:

- **Charismatic legitimacy creates succession crises**: When a charismatic leader dies, the system faces existential threat. The simulation handles leader death but not the mechanism by which legitimacy transfers (or fails to transfer).

- **Traditional legitimacy resists modernization**: Societies with traditional legitimacy face legitimacy crises during rapid technological/economic change. This would create interesting tension with the tech system.

- **Rational-legal legitimacy enables institutional resilience**: States with rational-legal legitimacy survive leader changes because authority inheres in the office, not the person.

- **Mixed legitimacy is normal**: Most real systems blend types. U.S. presidency = rational-legal + charismatic elements + traditional rituals.

### Recommendation

**ADD: `legitimacyBasis` — categorical with weights**

Track as a distribution: e.g., `{ traditional: 40, charismatic: 30, rationalLegal: 30 }`

Dynamics:
- Governance model influences default mix (theocratic = high traditional; autocratic with cult = high charismatic; representative = high rational-legal)
- High charismatic component + leader death = legitimacy crisis (large stability drop)
- High traditional component + rapid tech change = legitimacy crisis
- Rational-legal component grows with institutional quality and education
- Modernization shifts traditional -> rational-legal over time
- Populist movements temporarily boost charismatic at expense of rational-legal
- Overall legitimacy level (sum effectiveness) already affects stability; this adds the TYPE dimension

**Significance: HIGH.** Adds a rich dynamic that explains why succession crises occur in some systems but not others, and why modernization destabilizes some regimes.

---

## 3. LEGAL SYSTEM TRADITION

### Empirical basis

**La Porta, Lopez-de-Silanes, Shleifer & Vishny (1997, 1998, 2008)**: Pioneered the "legal origins" research program — one of the most influential in institutional economics.

Key findings across dozens of countries:
- **Common law** countries have stronger investor protections, more independent judiciaries, less formalized judicial procedures, lighter regulation, lower government ownership of banks and media
- **Civil law** (especially French civil law) countries have heavier regulation, weaker investor protections, more government ownership, more formalized courts
- **German and Scandinavian** civil law falls in between
- **Religious law** and **customary law** systems have distinct institutional properties

These differences affect:
- Financial market development (large effect)
- Regulatory burden on business entry
- Labor market regulation
- Corruption levels
- Size of informal economy
- Unemployment rates

**Important caveat from La Porta et al. themselves**: Legal traditions do NOT consistently predict long-run GDP GROWTH — the only consistent determinant of that is human capital. But legal traditions strongly predict intermediate outcomes (financial development, regulation, formal sector size, unemployment).

**Property rights**: Common law is associated with greater judicial independence, better contract enforcement, and greater security of property rights (La Porta et al. 2004). Constitutional property rights lead to higher growth ONLY when there is an independent judiciary to enforce them.

### Recommendation

**ADD: `legalTradition` — categorical**

Options: `'customary'`, `'religious'`, `'civil'`, `'common'`, `'hybrid'`

Effects:
- `customary`: Low regulatory burden, weak property rights formalization, high reliance on social norms. Works well in small populations, poorly at scale.
- `religious`: Strong traditional legitimacy, rigid adaptation to economic change, high social cohesion but low innovation incentive.
- `civil`: Higher regulatory capacity, more government intervention, potentially better public goods but higher entry barriers for business.
- `common`: Stronger property rights, better financial development, lower regulation, potentially higher inequality.
- `hybrid`: Intermediate effects. Most realistic for many civilizations.

Dynamics:
- Legal tradition should emerge based on governance model and era
- Can shift slowly (generational) with paradigm changes
- Interacts with judicial independence, institutional quality, and economic model
- Affects: innovation rate, financial development (trade/debt system), corruption susceptibility, regulatory environment

**Significance: MODERATE-HIGH.** Well-established empirical effects on financial development, regulation, and property rights. Adds meaningful differentiation between civilizations with similar governance models but different legal cultures.

---

## 4. URBANIZATION RATE

### Empirical basis

Urbanization is one of the most consequential structural transformations any society undergoes. The simulation currently has NO urbanization parameter despite tracking population, economy, and technology.

**Key empirical findings:**

**Inequality effects**:
- UN World Social Report 2020: Gini coefficient is higher in urban areas in 36 of 42 countries studied. Larger cities = richer but more unequal.
- BUT: Urbanization reduces NATIONAL inequality by narrowing the urban-rural gap once GDP/capita exceeds ~$2,000 (true for 78 of 90 economies as of 2017).
- Spatial inequalities within countries often exceed those BETWEEN countries. In Angola and Madagascar, spatial inequality explains 60%+ of total income inequality.

**Governance effects**:
- Urban populations are easier to tax (higher fiscal capacity)
- Urban populations demand more public services (higher administrative burden)
- Urban populations are easier to mobilize for protest (lower collective action costs)
- Urban-rural political cleavage deepens with economic divergence (documented in U.S., Europe, developing countries)

**Historical pattern**:
- City-states vs. rural governance is one of the oldest political divisions
- Urbanization historically correlated with state capacity development
- Rural elite capture is stronger in less urbanized societies (Faguet 2004)

**China evidence**: Economic growth targets significantly widen the urban-rural income gap through fiscal expenditure allocation bias, fixed asset investment concentration, and labor mismatch.

### Recommendation

**ADD: `urbanizationRate` (0-100)** — percentage of population in urban areas

Dynamics:
- Starts low (era-dependent: tribal = 0-10, ancient = 10-25, medieval = 15-30, industrial = 40-60, modern = 50-90)
- Rises with: industrialization, technology level, economic development
- Effects on:
  - `fiscalCapacity`: positive (easier tax collection)
  - `inequality`: complex (reduces national inequality via urban-rural convergence, but increases within-city inequality)
  - `stability`: complex (easier protest mobilization, but also better public services)
  - Political cleavage: creates urban-rural tension that affects governance changes
  - `innovation`: positive (agglomeration effects, knowledge spillovers)
  - Environmental pressure: increases resource consumption, pollution
  - Disease transmission: higher in dense urban populations (interacts with plague/pandemic events)

**Significance: HIGH.** Urbanization is a fundamental structural variable that affects nearly every other system in the simulation. Its absence is a notable gap.

---

## 5. MILITARY-CIVILIAN POWER BALANCE

### Empirical basis

This is partially covered by the simulation's coup mechanics, but lacks the structural dimension.

**Scale of the phenomenon**: Military coups accounted for ~200 regime changes in the developing world. Over 61% of democracies that died between 1789-2008 did so via military coup — making it the most common form of democratic collapse.

**Huntington's framework (*The Soldier and the State*, 1957)**:
- "Objective civilian control" via military professionalism — the military serves but doesn't dominate
- "Praetorian societies" — where weak civilian institutions invite military intervention
- Professionalization thesis: as societies industrialize, militaries become more professional and accept civilian supremacy. BUT: contradicted by Latin American coups of 1970s (professional militaries in Argentina, Chile overthrew democracies).

**Empirical predictors of coups**:
- Military spending < typical threshold as share of GDP correlates with 18% coup probability
- Transitions inheriting empowered militaries (dictator spending >30% of budget on military) are ~4x more likely to fall to coups
- Economic crises (GDP growth shocks from weather) significantly increase coup probability
- Previous coups predict future coups (path dependence)

**Consequences of military rule**: Nigeria and Mali show ~3 percentage points lower annual GDP growth during military vs. civilian rule. Democracy's positive growth effect only operates at low-to-intermediate levels of military political power.

**Coup-proofing paradox**: Leaders become LESS likely to coup-proof as coup risk INCREASES, because coup-proofing itself can trigger coups.

**Finer's framework**: Military intervention stems from (a) disposition (manifest destiny, corporate interests) and (b) opportunity (weak civilian leadership, institutional gaps).

### Recommendation

**ADD: `militaryPoliticalPower` (0-100)**

Meaning: How much political influence the military has, independent of governance model.

Dynamics:
- High values: military is a political actor (veto player, kingmaker, or direct ruler)
- Low values: military is subordinate to civilian authority
- Driven by: military spending share, regime history (post-coup states inherit high values), governance model, external threats
- High militaryPoliticalPower + economic crisis = high coup risk (amplifies existing coup mechanics)
- High militaryPoliticalPower + regime change = military likely to intervene
- militaryPoliticalPower declines with: sustained democracy, high institutional quality, high rational-legal legitimacy, high education
- militaryPoliticalPower rises with: coups (successful or attempted), war, economic crisis, state failure

Also consider:
- `militarySpendingShare` (0-100, % of budget): Feeding into both militaryPoliticalPower and coerciveCapacity. Low spending = higher coup risk but lower military capability. High spending = lower coup risk but fiscal drain.

**Significance: HIGH.** The simulation already has coups and regime change, but without modeling the STRUCTURAL power of the military, coup probability is essentially random. This gives it causal grounding.

---

## 6. CIVIL SOCIETY STRENGTH

### Empirical basis

**Putnam (*Making Democracy Work*, 1993)**: Northern Italian regions with denser networks of voluntary associations had dramatically better governance outcomes than southern regions, even controlling for economic development. The connection between social capital (measured by associational density) and institutional performance is the central empirical finding.

**Putnam (*Bowling Alone*, 2000)**: Declining social capital in the U.S. since the 1960s associated with lower political participation, lower trust in government, lower confidence in institutions, and lower political efficacy.

**Mechanisms**: Voluntary associations and civic networks:
- Build generalized trust (spillover from face-to-face interaction)
- Reduce incentives for opportunism
- Facilitate collective action
- Create norms of reciprocity
- Provide models for cooperation

**When civil society is suppressed (authoritarian contexts)**:
- Service delivery gaps emerge (in Zambia, NGOs outperformed government at providing infrastructure; in Haiti, NGOs provide 80-90% of health/education)
- Election quality degrades (monitoring NGOs improve election integrity)
- State loses legitimacy feedback mechanisms
- But: "NGO-ization" can depoliticize civil society and maintain power structures

**Civil society resilience**: State dependency on nonprofit welfare provision can explain CSO capacity to resist authoritarian pressure (demonstrated during COVID-19 in Southeast Asia).

**Critique**: Putnam's framework oversimplifies by reducing civil society to sports clubs and cultural associations. Politics also shapes social capital (not just the reverse). Logical circularity problems.

### Recommendation

**ADD: `civilSocietyStrength` (0-100)**

Meaning: Density and independence of voluntary associations, unions, NGOs, civic organizations, independent media, religious organizations (as civil actors).

Dynamics:
- Grows with: education, urbanization, economic development, freedom level, democratic governance
- Suppressed by: authoritarian governance, high power concentration, NGO restrictions
- Effects on:
  - Corruption: reduces it (monitoring function)
  - Institutional quality: improves it (feedback mechanism)
  - Stability: complex — high civil society = more peaceful reform but also more organized protest
  - Government legitimacy: civil society acts as a legitimacy check
  - Governance transitions: high civil society makes democratic transitions smoother
  - Public goods provision: supplements weak state capacity

**Significance: MODERATE-HIGH.** Adds the missing mediating layer between state and individual that explains why some societies self-correct and others don't.

---

## 7. JUDICIAL INDEPENDENCE

### Empirical basis

**Feld & Voigt (2003, updated 2015)**: Distinguished de jure (constitutional) from de facto (actual) judicial independence. Critical finding: **De jure JI has NO significant effect on growth. De facto JI has a robust, statistically significant positive effect.** This means merely writing judicial independence into a constitution accomplishes nothing without actual enforcement.

**Property rights mechanism**: Constitutional property rights lead to higher growth rates ONLY when there is an independent judiciary to enforce them. Without JI, property rights are "cheap talk."

**China natural experiment**: Judicial independence reform reduced local protectionism in court decisions — the win rate of local defendants against external plaintiffs dropped 3.1 percentage points (7% from baseline). Enhanced judicial independence boosted entrepreneurial activity by reducing institutional uncertainty, with stronger effects in corruption-prone regions.

**World Bank (2023)**: Four ingredients for judicial effectiveness — independence, access, efficiency, quality — but no robust evidence that independence alone correlates with effectiveness. Mixed evidence on access (more courts/judges). Quality research still nascent.

**Key caveat**: In failed states, judicial independence is irrelevant — the fundamental barrier is basic order. JI matters most at intermediate institutional development levels.

### Recommendation

**ADD: `judicialIndependence` (0-100)**

Meaning: De facto independence of courts from political interference.

Dynamics:
- Driven by: governance model, institutional quality, legal tradition (common law = higher baseline), rational-legal legitimacy
- Grows slowly with: sustained democracy, education, civil society pressure
- Eroded by: power concentration, authoritarian governance, corruption
- Effects on:
  - Property rights enforcement (interacts with legal tradition)
  - Corruption reduction (judiciary as watchdog)
  - Innovation/entrepreneurship (reduces institutional uncertainty)
  - Foreign investment attraction
  - Power concentration check (limits executive overreach)
- Requires minimum state capacity to function — irrelevant in failed states

**Significance: MODERATE.** Well-established effects but somewhat overlaps with institutional quality. The key distinct value is the interaction with property rights and the de jure vs de facto distinction.

---

## 8. CENTRALIZATION DEGREE

### Empirical basis

**Tiebout (1956)**: Citizens "vote with their feet" — choosing jurisdictions matching their preferences. Implies decentralization produces more efficient public goods provision. But empirical support is mixed and context-dependent.

**Oates (1993)**: Fiscal federalism brings government closer to citizens, enabling better-informed spending. Counterpoint: decentralization may increase corruption if local politics are captured by elites.

**Meta-analysis findings**: Fiscal decentralization's effects on economic growth are INCONCLUSIVE — roughly split between positive, negative, and null findings.

**China**: Higher correlation between provincial revenue and expenditure after decentralization reform, associated with faster non-state sector development.

**Switzerland**: Tax decentralization reduces income inequality IF jurisdictional fragmentation is limited. Above a threshold of fragmentation, it increases inequality.

**Bolivia (Faguet 2004)**: After decentralization, investment better reflected local demand. But programs became less well-targeted to neediest regions due to local elite capture.

**Key insight**: Decentralization interacts critically with institutional quality and state capacity. In high-capacity states, decentralization improves efficiency. In low-capacity states, it enables elite capture and corruption.

### Recommendation

**ADD: `centralizationLevel` (0-100)**

Meaning: 0 = fully decentralized/federal, 100 = fully centralized.

Dynamics:
- Influenced by: governance model, territory size, ethnic/cultural diversity, state capacity
- Effects:
  - High centralization + high state capacity = efficient but rigid
  - High centralization + low state capacity = policy implementation failures in periphery
  - Low centralization + high institutional quality = responsive governance
  - Low centralization + low institutional quality = local elite capture, corruption, inequality
  - Low centralization + high ethnic diversity = possible separatism risk
  - Centralization affects public goods provision efficiency, tax collection, military coordination

**Significance: MODERATE.** Mixed empirical evidence makes the growth effects uncertain, but the INTERACTION with other variables (state capacity, institutional quality, diversity) creates rich dynamics. Already partially reflected in governance model defaults but deserves explicit tracking.

---

## 9. DEMOGRAPHIC AGE STRUCTURE (Expand Existing System)

### Current implementation
The simulation already tracks `demographicProfile` with 4 states: `young`, `balanced`, `aging`, `demographic_stress`. This is good but too coarse to capture the empirical dynamics.

### What the research adds

**Youth bulge effects (Urdal 2004, 2006)**:
- Youth bulges robustly increase risk of domestic armed conflict. Finding is "extremely robust" across all model specifications.
- Effect is especially strong under economic stagnation
- Countries with youth cohort sizes >= 35% are 3x more likely to experience conflict
- Education (especially male secondary) has a clearly pacifying effect on youth bulges
- Emigration acts as a "safety valve"

**Aging population effects**:
- 10% increase in 60+ population fraction decreases GDP/capita growth by 5.5% (U.S. data)
- 2/3 from slower worker productivity, 1/3 from slower labor force growth
- Government spending pressures: healthcare spending rises ~30% with aging
- Pension system strain: shrinking tax base + growing benefit expenditure
- BUT: functional capacity improvements can offset ~50% of demographic drag (OECD)

**Demographic transition and governance**:
- States that drop below TFR of ~2.8 enter intermediate phase with substantially reduced conflict risk
- Aging populations create fiscal pressure that strains state capacity
- Youth bulges + unemployment + weak democracy = highest instability risk

### Recommendation

**EXPAND existing `demographicProfile` to include numerical parameters:**

- `youthBulgeRatio` (0-100): Percentage of population aged 15-29 relative to adult population
- `dependencyRatio` (0-100): Non-working-age / working-age population ratio
- `fertilitRate` (0.5-8.0): Total fertility rate — drives demographic transitions

Current categorical system can derive from these numbers:
- `young`: youthBulgeRatio > 35, fertilitRate > 4
- `balanced`: youthBulgeRatio 20-35, fertilitRate 1.8-3.5
- `aging`: youthBulgeRatio < 20, dependencyRatio > 50
- `demographic_stress`: extreme values of any parameter

New dynamics:
- youthBulgeRatio > 35 + low education + economic stagnation = conflict risk multiplier (3x from Urdal)
- High dependencyRatio = fiscal strain on pension/healthcare systems (interacts with state capacity)
- Fertility rate driven by: education (especially women's), urbanization, economic development, family policy
- Automation level 3+ mitigates labor effects of aging

**Significance: MODERATE-HIGH.** The existing system captures the concept but lacks the granularity to model the empirically-documented interactions (youth bulge + education + unemployment). Expanding it adds rich dynamics without new conceptual complexity.

---

## 10. TERM LIMITS / POWER ROTATION

### Empirical basis

**Besley & Case (1995)**: Term-limited U.S. governors increase spending and tax revenue — the "lame duck" effect. They face reduced electoral accountability.

**Dal Bo & Rossi**: Very frequent elections can distract from policy and towards campaigning. Politicians need time horizons to invest in position-specific assets.

**Brazil evidence**: Mayors with reelection prospects performed ~36% better than term-limited mayors, suggesting the incentive effect is larger than the selection effect.

**Negative effects**: Term limits cause legislators to lose influence relative to staff, bureaucrats, and governors. They become less professional, less innovative, less specialized. Power shifts to unelected actors.

**Broader finding**: Term limits reduce economic growth and increase ideological polarization. The costs (reduced accountability, polarization, expertise loss) may outweigh benefits of power rotation.

**Counter-argument (Smart & Sturm)**: Term limits can reduce "pandering" — politicians distorting policy to signal competence rather than doing what's right.

### Recommendation

**SKIP or DEFER.** The effects are real but relatively small compared to other factors. The simulation already handles leader succession and regime change. Term limits would add complexity without proportionate dynamic richness. If added later, it would be a modifier on governance quality in representative/democratic systems:
- Term limits present: slight reduction in governance quality (lame duck effects), slight increase in power rotation (prevents entrenchment), slight reduction in expertise accumulation
- Could be a boolean toggle within democratic governance models

**Significance: LOW.** Mixed and relatively small effects. Not a priority addition.

---

## 11. TRADE DEPENDENCY / RESOURCE CURSE

### Empirical basis

**Sachs & Warner (1995, 2001)**: 10% increase in natural resource exports (% of GDP) associated with 0.4-0.7% lower annual per capita GDP growth. But this finding is contested.

**Contested evidence**: ~40% of studies find adverse effect, ~40% find no effect, ~20% find positive impact. Brunnschweiler & Bulte (2008): resource curse disappears when resource ABUNDANCE (not dependence) is used. Some studies find oil discoveries increase long-run GDP growth.

**Mechanisms that DO hold up**:
- Dutch disease: resource booms appreciate real exchange rate, making non-resource exports uncompetitive
- Political Dutch disease: resource revenues enable rent-seeking, strengthen authoritarian regimes
- Oil wealth tends to strengthen authoritarianism, increase corruption, contribute to violent conflict in low/middle income countries (Annual Review of Political Science, 2015)
- Resource-rich economies are more volatile and vulnerable to shocks

**Conditional nature**: The resource curse depends heavily on institutional quality, policy choices, trade openness, and human capital. Norway vs. Nigeria illustrates this.

### Recommendation

**PARTIALLY COVERED** — The simulation already has resource management and economic systems. What's missing is:

**ADD: `resourceDependence` (0-100)**: How much the economy depends on extracting a single commodity.

Dynamics:
- High resourceDependence + low institutional quality = Dutch disease effects (innovation penalty, manufacturing decline, exchange rate appreciation)
- High resourceDependence + low democracy = authoritarian strengthening (oil curse)
- High resourceDependence = economic volatility amplifier
- Resource booms create fiscal windfalls that can either build state capacity (Norway model) or enable corruption (Nigeria model), depending on institutional quality

**Significance: MODERATE.** Partially covered but the "resource curse" dynamic is distinctive enough to warrant explicit modeling. The interaction with institutional quality makes it interesting.

---

## 12. INFORMATION CONTROL (Beyond Epistemic Health)

### Current coverage
The simulation already has a 5-tier Information Ecosystem with truth anchor and information tab. This covers much of what matters.

### What research adds beyond current model

**Chen & Yang (2019, *American Economic Review*)**: Even with tools to bypass censorship, Chinese students showed little interest in uncensored information. Not from fear — they simply saw no value in it. State propaganda can attenuate DEMAND for uncensored information.

**Crisis disruption**: COVID-19 made Chinese citizens more inclined to circumvent censorship. Anxiety drove both regime supporters and opponents to seek alternative sources.

**Digital authoritarianism (2025 research)**: Moving from reactive to pre-emptive and fine-grained control. Blurring boundaries between autocracies and democracies. AI-powered surveillance enables unprecedented control.

**Media plurality**: Free and pluralistic media consistently identified as essential for democratic governance. Efforts to undermine press freedom are an early indicator of democratic breakdown.

### Recommendation

**MOSTLY COVERED.** The existing Information Ecosystem handles this well. Two small additions could be:

- `propagandaDemandSuppression` effect: When information tier is low AND state capacity is high for extended periods, population's DESIRE for free information decreases (the Chen & Yang finding). This would make information control self-reinforcing rather than just a top-down setting.
- Crisis events temporarily bypass information control (already partially modeled?)

**Significance: LOW.** Marginal improvement to already-covered system.

---

## Implementation Priority Matrix

| Factor | Effect Size | Empirical Strength | Missing from Sim? | Dynamic Interest | Priority |
|--------|------------|--------------------|--------------------|-----------------|----------|
| State Capacity (3D) | Very Large | Very Strong | YES | Very High | 1 |
| Urbanization Rate | Large | Strong | YES | High | 2 |
| Military-Civilian Balance | Large | Strong | Partially | High | 3 |
| Legitimacy Type | Large | Strong | YES | Very High | 4 |
| Civil Society Strength | Moderate-Large | Strong | YES | High | 5 |
| Legal System Tradition | Moderate-Large | Strong | YES | Moderate | 6 |
| Age Structure (expand) | Large | Very Strong | Partially | High | 7 |
| Judicial Independence | Moderate | Strong | YES | Moderate | 8 |
| Centralization Degree | Mixed | Moderate | Partially | High | 9 |
| Resource Dependence | Moderate | Contested | Partially | Moderate | 10 |
| Term Limits | Small-Mixed | Moderate | YES | Low | 11 |
| Info Control (expand) | Small add | Strong | Partially | Low | 12 |

---

## Key Interactions Between New Factors

The most valuable aspect of adding these factors is the INTERACTIONS between them, which create emergent behavior:

1. **State Capacity + Governance Model + Legitimacy** — Explains why the same governance model (e.g., democracy) produces different outcomes in different contexts. High-capacity democracies function well; low-capacity democracies may be worse than high-capacity autocracies.

2. **Urbanization + Fiscal Capacity + Inequality** — Urbanization enables taxation but also concentrates inequality. Creates urban-rural political cleavage that drives regime change dynamics.

3. **Military Power + State Capacity + Economic Crisis** — Economic shocks in states with powerful militaries and weak civilian institutions trigger coups. This grounds the existing coup mechanic in structural causes.

4. **Youth Bulge + Education + Unemployment + Civil Society** — Youth bulges are dangerous only when combined with poor education and economic stagnation. Strong civil society provides channels for grievances short of violence.

5. **Legal Tradition + Judicial Independence + Property Rights + Innovation** — Common law + independent judiciary = strong property rights = higher innovation. Civil law + dependent judiciary = weaker property rights = lower entrepreneurship.

6. **Legitimacy Type + Leader Death + Succession** — Charismatic legitimacy + leader death = crisis. Rational-legal legitimacy + leader death = smooth transition. This gives the existing leader death mechanic much richer consequences.

7. **State Capacity Decay Cycle** — Corruption -> reduced administrative capacity -> reduced fiscal capacity -> patronage to compensate -> more corruption. This positive feedback loop explains state collapse over generational timescales.

---

## Suggested New State Variables Summary

```
// Tier 1 additions
stateCapacity: {
  fiscal: 50,          // 0-100: tax collection, revenue generation
  administrative: 50,  // 0-100: policy implementation, service delivery
  coercive: 50         // 0-100: internal order, territorial control
},
urbanizationRate: 20,   // 0-100: % population urban
militaryPoliticalPower: 30,  // 0-100: military's political influence
militarySpendingShare: 15,   // 0-100: % of budget to military
legitimacyBasis: {
  traditional: 40,
  charismatic: 20,
  rationalLegal: 40
},

// Tier 2 additions
civilSocietyStrength: 40,  // 0-100: density/independence of civic orgs
judicialIndependence: 40,  // 0-100: de facto court independence
legalTradition: 'customary',  // 'customary'|'religious'|'civil'|'common'|'hybrid'
centralizationLevel: 60,  // 0-100: fully decentralized to fully centralized

// Tier 1 expansion of existing
// Replace demographicProfile with:
youthBulgeRatio: 30,    // 0-100: youth share of adult population
dependencyRatio: 40,    // 0-100: dependents / working-age
fertilityRate: 3.0,     // 0.5-8.0: total fertility rate

// Tier 3 (if implemented)
resourceDependence: 20,  // 0-100: economic reliance on single commodity
```

---

## Key Sources

### State Capacity
- Hanson & Sigman (2021), "Leviathan's Latent Dimensions," *Journal of Politics* 83(4)
- Vu (2025), "The Growth Effect of State Capacity Revisited," *Oxford Bulletin of Economics and Statistics*
- Evans & Rauch (1999), "Bureaucracy and Growth," *American Sociological Review*
- IMF Working Paper (2025), "State Capacity and Growth Regimes"
- Knutsen (2013), "Democracy, State Capacity, and Economic Growth"

### Legal Origins
- La Porta et al. (1997, 1998), "Law and Finance," *Journal of Political Economy* / *Journal of Finance*
- La Porta, Lopez-de-Silanes & Shleifer (2008), "The Economic Consequences of Legal Origins," *Journal of Economic Literature*

### Legitimacy
- Weber (1921), *Economy and Society*
- Lipset (1959), "Some Social Requisites of Democracy"

### Fiscal Federalism
- Tiebout (1956), "A Pure Theory of Local Expenditures"
- Oates (1993), "Fiscal Decentralization and Economic Development"
- Faguet (2004), "Does Decentralization Increase Government Responsiveness?"

### Civil Society
- Putnam (1993), *Making Democracy Work*
- Putnam (2000), *Bowling Alone*

### Civil-Military Relations
- Huntington (1957), *The Soldier and the State*
- Finer (1962), *The Man on Horseback*
- Brooks (2008), *Shaping Strategy*

### Youth Bulge / Demography
- Urdal (2004), "The Devil in the Demographics," World Bank
- Urdal (2006), "A Clash of Generations?" *International Studies Quarterly*
- Barakat & Urdal (2009), "Breaking the Waves?"

### Resource Curse
- Sachs & Warner (1995, 2001), "Natural Resource Abundance and Economic Growth"
- Auty (1993), *Sustaining Development in Mineral Economies*

### Judicial Independence
- Feld & Voigt (2003, 2015), "Economic Growth and Judicial Independence"
- La Porta et al. (2004), "Judicial Checks and Balances"

### Aging / Demographics
- Maestas, Mullen & Powell (2023), "The Effect of Population Aging on Economic Growth," RAND
- ECB (2024), "The Macroeconomic and Fiscal Impact of Population Ageing"
- OECD (2025), "Pensions at a Glance"

### State Collapse
- Rotberg (2003), "Failed States, Collapsed States, Weak States," Brookings
- Gros (1996), "Towards a Taxonomy of Failed States"
- Ibn Khaldun (1377), *Muqaddimah*
