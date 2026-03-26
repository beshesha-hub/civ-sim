# Modeling Assumptions and Scope

**civ-sim** | Version: March 2026

---

## 1. What civ-sim Is

civ-sim is a browser-based civilization simulator that models the co-evolution of economic, social, cultural, ecological, demographic, and governance systems over historical timescales. It is designed to be explored both as a game and as a tool for thinking about how civilizations develop, stagnate, and collapse.

The simulation tracks roughly 120 distinct state variables per civilization across 12 interacting domains: economy, governance, social structure, culture, ecology, demographics, technology, infrastructure, psychology, organized crime, inter-civilization relations, and public health. These systems are connected by approximately 200 explicit cross-system feedback loops that produce emergent behavior not programmed into any single subsystem.

The goal is not prediction. No simulation can predict the trajectory of a specific civilization. The goal is *structural plausibility*: when you invest in sanitation, infant mortality should fall, and decades later fertility should follow. When wealth concentrates unchecked, trust should erode and institutions should weaken. The causal chains should match what researchers observe in the historical and empirical record, even if the specific numbers are simplified.

civ-sim is designed for three audiences: casual players who want to explore civilizational dynamics as a game, researchers and policymakers who want to study structural relationships between systems, and educators who want to make abstract social-science concepts tangible for students. For high school and undergraduate courses in world history, sociology, political science, economics, and environmental science, civ-sim offers something textbooks cannot: the ability to configure a society, change one variable, and watch the consequences propagate through interconnected systems. Students can see why the demographic transition follows a specific sequence, why wealth concentration is self-reinforcing, why institutional quality matters for development, and why there is no single "correct" form of social organization — all through direct interaction rather than memorization.

---

## 2. Where civ-sim Sits: The Simulation Landscape

Civilization simulators exist on a spectrum. At one end are academic agent-based models (ABMs). At the other are commercial strategy games. civ-sim occupies a deliberate middle position.

### Academic Agent-Based Models

Academic ABMs (Epstein & Axtell's Sugarscape, Axelrod's cooperation tournaments, Schelling's segregation model, Cederman's geopolitical models, Axtell's firm dynamics) typically model one or two dynamics in extreme depth. Sugarscape, for example, tracks individual agents trading sugar on a grid to study wealth distribution. These models are mathematically rigorous and can be formally analyzed, but they deliberately exclude the vast majority of real-world complexity. A model of wealth inequality that ignores governance, culture, ecology, and demographics cannot capture the feedback loops that make real inequality so persistent.

Academic ABMs excel at isolating mechanisms. They answer questions like "Can cooperation emerge without central authority?" or "Does segregation require active prejudice?" They are not designed to model the full experience of civilizational development, nor to be accessible to non-specialists.

### Commercial Strategy Games

Games like Sid Meier's Civilization, Stellaris, and Victoria 3 model many systems simultaneously, but with entertainment as the primary constraint. This means systems are tuned for player agency and dramatic pacing rather than empirical accuracy. In Civilization VI, for example, building a library directly increases science output by a fixed amount. In reality, the path from literacy to innovation runs through institutional quality, epistemic health, economic incentives, and cultural values, and can be blocked or accelerated by dozens of interacting factors. Commercial games must also be balanced for competitive play, which means systems are often symmetrical in ways the real world is not.

Victoria 3 comes closest to the economic simulation space civ-sim occupies, with its population model and production chains, but its systems are still fundamentally designed around player engagement loops rather than empirical fidelity.

### Where civ-sim Sits

civ-sim attempts to occupy the space between these approaches: broad enough to capture the cross-system feedback loops that academic ABMs ignore, but empirically grounded enough that each individual mechanism reflects real research findings rather than game-balance decisions.

Specifically:

- **Breadth**: civ-sim models 12 interacting domains simultaneously. No academic ABM attempts this scope. Most commercial games model 4-6 domains.
- **Mechanism fidelity**: Each subsystem is calibrated against specific research. The demographic transition model follows Omran's epidemiological transition and Caldwell's child-survival hypothesis. Wealth dynamics use multiplicative models (Bouchaud & Mezard). Trust erosion follows Knack & Keefer's corruption findings. Ethnic conflict uses Wimmer's political exclusion framework rather than the debunked "ancient hatreds" model.
- **Emergent complexity**: Because systems are connected by explicit cross-effects rather than scripted outcomes, civ-sim can produce results the designer did not anticipate. A theocracy that suppresses education may inadvertently maintain high fertility, creating a youth bulge that eventually destabilizes it. This is not programmed as a "theocracy collapse event" -- it emerges from the interaction of education, gender equity, fertility, and stability systems.
- **Transparency**: Every mechanism is visible. Unlike commercial games, which hide calculations behind "fog of game design," civ-sim exposes all driver lists, drift rates, and cross-effects in the UI.

The trade-off is that civ-sim sacrifices the mathematical elegance of academic ABMs (we cannot prove convergence theorems about 120-variable systems) and the polish of commercial games (the UI prioritizes information density over visual spectacle).

---

## 3. What civ-sim Models

### 3.1 Economic Systems

**What is modeled:** Nine economic models (gift, barter, labor credit, commons, commodity, market, planned, mixed, none), each with distinct behavioral incentives and wealth accumulation characteristics. Wealth concentration follows multiplicative dynamics (the rich get richer through compound returns, not just income). Labor share tracks the division between capital and labor returns using the Kaldor-Piketty r>g framework: an explicit return-on-capital proxy (r) is compared to an economic-growth proxy (g), and when r exceeds g, labor's share of income declines at empirically calibrated rates (~0.5-1.5 percentage points per decade). Financial depth, debt load, and trade dependency evolve based on economic structure. Five debt models (debtless through predatory) determine crisis risk and stratum-level impacts.

The financial system follows the Kindleberger-Minsky endogenous cycle: economies progress through five phases (recovery, hedge stability, boom, euphoria, distress/panic) driven by endogenous credit dynamics rather than exogenous shocks. Crisis probability escalates nonlinearly above phase 70 (following Schularick & Taylor 2012 credit-boom data), with severity calibrated to Reinhart & Rogoff 2009 crisis databases. The Minsky cycle interacts with debt models, institutional quality, crisis memory, and inequality.

Trade follows a gravity model (trade volume scales with partner economic size, following Tinbergen 1962) combined with Stolper-Samuelson distributional effects: free trade benefits the abundant factor (labor in labor-abundant societies, capital in capital-abundant ones), meaning trade's inequality effects depend on a civilization's factor endowment. Tariff retaliation dynamics and war-proportional trade disruption are also modeled.

Technological unemployment follows the Acemoglu-Restrepo task-displacement model (2018/2020), with four competing effects: displacement (superlinear with automation level), productivity gains, reinstatement of new tasks (driven by innovation), and composition effects. Education quality determines how quickly displaced workers can be rematched to new tasks.

**What drives it:** Economic model type determines what behavior is actually rewarded (the "reinforced values" that may diverge from what governance claims to promote). Inheritance systems (communal, partible, meritocratic, primogeniture) affect intergenerational wealth transmission. Currency type constrains financial depth. Resource strategy (extraction through conservation) determines depletion rates.

**Key assumption:** Wealth concentration is self-reinforcing absent countervailing institutions. This reflects the empirical finding (Piketty, Bouchaud & Mezard) that when return on capital exceeds economic growth (r > g), concentration increases over time. The simulation implements this as multiplicative drift rather than additive accumulation. The labor share mechanism makes this explicit: r and g proxies are computed each turn from financial depth, wealth concentration, technology, and education, and the gap between them drives labor share decline (Piketty 2014, Autor et al. 2020).

**Key assumption:** Financial crises are endogenous, not exogenous shocks. Following Minsky's Financial Instability Hypothesis ("stability is destabilizing"), periods of economic calm encourage risk-taking and credit expansion that systematically create the conditions for the next crisis. The simulation does not generate crises randomly; it tracks the internal dynamics that make crises inevitable when credit expansion goes unchecked. This reflects Keen's 1995/2013 formalization of Minsky and Kindleberger & Aliber's historical analysis of speculative manias.

**Key assumption (Bottom-Up Economic Restructuring):** Economic systems can be restructured from the bottom up through collective action, bypassing governance entirely. When a structural movement is introduced, a dual economy emerges where the formal and alternative systems coexist. Adoption follows an S-curve (Rogers' diffusion model) modulated by behavioral alignment, network effects (Metcalfe's law analog), coordination costs (Ostrom's commons principles), and supply chain disruption (Leontief input-output derived). Coordination cost peaks when the economy is split ~50/50 — too large for trust-based exchange, too small for formal coordination structures. Scaling models (polycentric governance, democratic confederalism, liquid democracy, adapted Jamahiriya congress system, participatory planning) reduce coordination costs at scale but have their own prerequisites and weaknesses. Governance responds per selectorate theory: democracies accommodate, autocracies crack down (but abandon crackdown when enforcement cost exceeds state capacity). In a fully currencyless post-transition economy, taxation ceases entirely — resources are accessed directly by individuals and organizations including governance. The Minsky financial cycle ceases to apply (no credit instruments exist); it is replaced by coordination instability as the ongoing stability risk. Empirical grounding: informal economy dynamics (ILO/World Bank data on 30-70% informality in developing nations), currency crisis transitions (Weimar, Zimbabwe, Argentina), Ostrom's 8 design principles (Nobel 2009), Rojava cooperative experiment (2012-present, ~2-4M population), Parecon iterative planning (Albert 2003), fiscal sociology (Schumpeter, Tilly).

### 3.2 Governance and Institutions

**What is modeled:** Fifteen governance models ranging from flat consensus to authoritarian world government, each with distinct hierarchy levels, power concentration, and behavioral modifiers. State capacity (fiscal, administrative, coercive dimensions), institutional quality, corruption, legitimacy (traditional, charismatic, or rational-legal following Weber's typology), and military-civilian balance all evolve per turn. Institutional lock-in captures path dependency. Leadership aging, succession crises, military coups, and popular revolutions can all occur when conditions are met.

Institutional quality follows the Acemoglu-Johnson-Robinson (2001/2005/2012) framework of inclusive vs. extractive institutions. Inclusive pressure builds from low corruption, democratic governance, education, social trust, epistemic health, and civilian control. Extractive pressure builds from wealth concentration, corruption, war, autocratic governance, and low freedom. The net balance determines institutional drift. AJR's concept of *critical junctures* is modeled: when a civilization recovers from a crisis, a window of institutional flux opens where reform or elite capture become more likely depending on the power balance. Institutional persistence (the empirical finding that colonial-era institutions persist for centuries) is modeled as strong inertia at both extremes.

Military-civilian balance follows the Powell & Thyne (2011) global coup dataset. Coup risk is computed from seven multiplicative factors: recent coup history (the strongest single predictor — the "coup trap"), the military-civilian gap (Huntington's gap theory), economic crisis, food crisis, regime type (personalist autocracies most vulnerable, per Geddes 2003), political instability, and low legitimacy. Coup attempts have a ~50% base success rate (modified by social trust and state capacity), and failed coups are modeled as destabilizing events that paradoxically tighten civilian control. Military spending crowds out productive investment following the Nordhaus-Oneal burden model.

**Key assumption:** Governance models are not ranked on a linear scale from "bad" to "good." Theocratic governance provides high social cohesion and legitimacy but suppresses innovation and out-group empathy. Flat consensus is egalitarian but scales poorly. Each model has structural strengths and weaknesses that interact with the rest of the system.

**Key assumption:** Corruption is self-reinforcing below a threshold of institutional quality (the "poverty trap" of weak institutions). Recovery requires simultaneous improvement in multiple systems -- institutional quality alone is insufficient if trust is low and capture is high. This reflects North's (1990) transaction costs framework and AJR's empirical finding that extractive institutions persist because elites resist inclusive reform to preserve their rents.

**Key assumption:** Institutions are endogenous. Following AJR 2012, institutional quality is not a matter of good ideas adopted by enlightened leaders; it is shaped by the distribution of power. Inclusive institutions emerge when power is broadly distributed and multiple groups can check each other. Extractive institutions persist when a narrow elite can prevent reform. This means institutional improvement often requires a crisis (critical juncture) that disrupts the existing power balance.

### 3.3 Social Structure

**What is modeled:** Five social strata (elite through disenfranchised) with per-stratum empathy, prosocial behavior, wellbeing, and gap perception. Social trust follows the research consensus that it is primarily eroded by corruption, inequality, and exclusion, and rebuilt through education, institutional quality, and civic engagement. Social mobility follows the Great Gatsby Curve (Corak 2013): intergenerational earnings elasticity (IGE) is computed as IGE = 0.15 + 0.73 x Gini, meaning higher inequality directly predicts lower mobility. Mobility is additionally modified by education quality (Chetty et al. 2014), institutional quality, governance type, inheritance concentration, land concentration, and caste rigidity. Actual mobility drifts toward the target at ~8% per decade, reflecting the slow pace of intergenerational change. Land ownership concentration follows path-dependent dynamics. Ethnic and linguistic fractionalization is modeled with Wimmer's correction: it is political exclusion, not diversity itself, that drives conflict.

Generational value drift follows Inglehart's post-materialism theory (Inglehart & Welzel 2005): societies that achieve sustained material security shift from survival/materialist values toward self-expression/post-materialist values. This is modeled as two axes — survival-to-self-expression (driven by wellbeing and stability) and traditional-to-secular-rational (driven by education and urbanization). The shift affects authority orientation, risk orientation, and cooperation norms. War and economic crisis cause materialist reversion, reflecting the empirical finding that security threats shift values back toward survival priorities.

**Key assumption:** The "exclusion risk" metric (fractionalization multiplied by the complement of political inclusion) is the actual driver of ethnic conflict, not fractionalization alone. Switzerland has high fractionalization but high inclusion and is stable. This reflects the findings of Wimmer, Cederman, and Min (2009) that political exclusion along ethnic lines, rather than ethnic diversity per se, predicts civil war onset.

**Key assumption:** Social mobility is structurally determined by inequality, not by individual effort. The Great Gatsby Curve is one of the most robust findings in intergenerational mobility research: societies with higher inequality consistently produce lower mobility. The simulation makes this explicit rather than treating mobility as an independent parameter.

### 3.4 Psychology and Behavioral Dynamics

**What is modeled:** Ten behavioral axes (cooperation, competition, mutual aid, acquisitiveness, conformity, innovation, empathy, deference, individualism, collectivism) that are reinforced or suppressed by the interaction of economic incentives, governance structures, and social conditions. Population susceptibility to behavioral influence follows a bimodal distribution (most people are moderately susceptible, with tails of highly resistant and highly susceptible individuals). Empathy is tracked per stratum, with suppression mechanisms for in-group/out-group dynamics under theocratic governance. Cultural gap (the distance between stated values and reinforced behavior) drives cognitive dissonance, cynicism, and eventually revolutionary consciousness.

**Key assumption:** What a society says it values (stated values, derived from governance type and education) often diverges from what its economic system actually rewards (reinforced values). This gap is the primary driver of cynicism, and when it becomes large enough, of paradigm shift pressure. This reflects Gramsci's concept of cultural hegemony and Festinger's cognitive dissonance theory.

**Key assumption:** Behavioral change after a paradigm shift (new governance or economic model) is not instant. Behavioral inertia, modeled via Bourdieu's habitus concept, means that old behaviors persist for years or decades after structural change, with the rate of adaptation depending on education, epistemic health, and institutional quality.

### 3.4a Power-Induced Empathy Suppression

This is one of civ-sim's most distinctive modeling assumptions. It deserves extended treatment because it shapes many downstream dynamics.

**The core claim:** Power over others systematically suppresses empathy in those who hold it. This is not a moral judgment -- it is a modeled neuropsychological mechanism. The simulation treats power-induced empathy suppression as analogous to behavioral addiction: both operate through variable-ratio reinforcement schedules that progressively downregulate prosocial responses.

**How it works in the simulation:** Every social stratum has a "power base" -- the degree of institutional power over others that members of that stratum typically hold. The elite stratum has a power base of 0.90; the disenfranchised have 0.00. This power base is scaled by the effective hierarchy level (from governance structure and/or wealth concentration) and by a cascade rate (from the population's susceptibility model). The result is a per-stratum empathy suppression target: in a steep hierarchy, elites trend toward low empathy (high suppression), while the disenfranchised retain full empathy capacity because they hold no power over anyone.

**The cascade through the hierarchy:** Empathy suppression is not a binary elite/non-elite phenomenon. It operates as a gradient through all five strata, proportional to each stratum's power over others. In a steep hierarchy (effective hierarchy level near 100), the simulation produces a characteristic empathy profile:

- **Elite** (power base 0.90): heaviest suppression. Empathy trends toward the lowest target. These are the individuals who make decisions affecting millions but experience the least empathic connection to those affected.
- **Upper middle** (power base 0.58): substantial suppression. Managers, senior professionals, and local officials -- enough power over subordinates and constituents to meaningfully erode empathy, though less than the elite.
- **Lower middle** (power base 0.32): moderate suppression. Supervisors, small business owners, petty officials -- enough positional authority to shift empathy downward, but the effect is noticeably weaker than in upper strata.
- **Working class** (power base 0.10): minimal suppression. Little institutional power over anyone; empathy remains largely intact.
- **Disenfranchised** (power base 0.00): zero suppression from power. Empathy capacity is undiminished -- but whether it translates into prosocial behavior depends on material conditions (see below).

This gradient means that a steep hierarchy does not merely create callous leaders. It creates a society where empathy diminishes progressively as you move up the social ladder, with each stratum slightly less able to understand the experience of those below it. The population-weighted aggregate empathy of such a society is significantly lower than in a flat one, because the strata with the most decision-making influence have the least empathic connection to the consequences of their decisions.

In a flat hierarchy (effective hierarchy level near 0), all strata converge toward high empathy because no one holds enough power over others to trigger suppression. The gradient collapses. This is the structural argument for egalitarian governance: not that it makes people morally better, but that it removes the neuropsychological mechanism that erodes empathy in those who wield power.

**Dual power source:** Empathy suppression comes from whichever is higher: governance hierarchy or economic power hierarchy. A flat-consensus society with extreme wealth concentration will exhibit plutocratic empathy suppression even though its formal governance is egalitarian. The simulation tracks both channels and identifies which one dominates. This means a society cannot escape the empathy effects of concentrated power simply by adopting democratic governance if economic power remains concentrated. When economic hierarchy supersedes governance hierarchy, the simulation flags this as "plutocratic subsumption" -- a state where formal political equality coexists with effective psychological hierarchy driven by wealth.

**Key asymmetry:** Suppression is faster than recovery. When hierarchy increases, empathy declines at twice the rate it recovers when hierarchy decreases. This reflects the empirical observation that power's psychological effects are acquired more quickly than they are reversed. Additionally, "hierarchical entrenchment" accumulates when elite empathy stays low for extended periods, further slowing recovery. This means that even after a flattening reform, the psychological legacy of hierarchy persists -- the empathy damage outlasts the structural cause by years or decades.

**The disenfranchised: empathy vs. survival competition.** The lowest stratum presents a distinct dynamic that the simulation models separately. Because the disenfranchised hold no institutional power over anyone, the power-suppression mechanism does not apply to them. Their empathy capacity remains intact -- typically the highest of any stratum. But empathy alone does not determine behavior. The simulation tracks a dynamic tension between two competing forces at the bottom of the social hierarchy:

- **Cooperation pressure** (empathy-driven mutual aid): The disenfranchised stratum's intact empathy creates a strong pull toward solidarity, resource-sharing, and collective action. This is the basis of mutual aid networks, informal safety nets, and community resilience under adversity. Cooperation pressure rises with empathy, mutual aid capacity (material slack available for helping others), resource availability, and social stability.

- **Competition pressure** (scarcity-driven survival tactics): When resources are scarce, stability is low, wellbeing is poor, and opportunity competition is fierce, the same population is pulled toward zero-sum competition -- scrambling for limited jobs, housing, food, and safety. This is not a moral failing; it is a rational response to structural scarcity. Competition pressure rises with resource depletion, low wellbeing, instability, and high opportunity competition (the degree to which the system forces people to compete for basic needs).

The simulation computes both pressures each turn and identifies which dominates. When cooperation pressure exceeds competition pressure, the dominant strategy is mutual aid: informal networks, shared childcare, collective bargaining, community organizing. When competition pressure dominates, the strategy shifts toward individual survival: distrust of neighbors, hoarding, willingness to undercut others for scarce opportunities.

When the tension between these forces becomes extreme (tension score above 70) and stability is critically low, the simulation enters "survival mode" -- a state where the disenfranchised stratum's energy is entirely consumed by day-to-day survival, degrading education quality and institutional quality as civic participation becomes an unaffordable luxury.

The critical insight this models: the disenfranchised are not "low empathy." They are high empathy, low slack. The simulation's prosocial behavioral index for this stratum is computed as empathy multiplied by mutual aid capacity -- a population can care deeply and still be unable to act on it when material conditions are dire. This distinction matters because policy interventions that increase material slack (food security, housing, basic income) can unlock the existing empathy into prosocial behavior, while interventions that attempt to "teach empathy" to populations that already have it will have no effect.

**Population susceptibility:** Not everyone responds to power the same way. The simulation models susceptibility as a bimodal-plus-gamma distribution: a "resistant fraction" (roughly 14-28% depending on the model) who retain empathy even at high power levels, and a right-skewed susceptible majority. Per-stratum offsets reflect Adverse Childhood Experience (ACE) load: lower strata have higher baseline susceptibility due to chronic stress, but again, the disenfranchised have no power to activate that susceptibility. The distribution shape is treated as neurobiological and heritable; it drifts slowly across generations but is not changed by policy within a generation.

**Research basis:** Keltner, Gruenfeld & Anderson (2003) on power and approach/inhibition systems; Piff et al. (2012) on wealth and prosocial behavior; Guinote (2017) on power and attention; van Kleef et al. (2008) on power and emotional responses to others' suffering. The behavioral addiction parallel draws on Potenza (2006) and Grant et al. (2010) on mesolimbic dopamine circuitry shared across addictive behaviors.

**Cross-system consequences:** Elite empathy deficit drives corruption (low empathy reduces internal constraints on self-dealing), legitimacy erosion (leaders disconnected from population needs), and institutional degradation. Population-weighted empathy feeds into the prosocial behavioral index, which determines whether cooperative policies are socially sustainable or require enforcement from above.

### 3.4b Behavioral Reinforcement and Wealth Capture

**The core claim:** Economic structures are the primary determinant of what behaviors are actually rewarded in a society, and concentrated wealth can capture the mechanisms that shape those rewards.

**How reinforcement works:** Each economic model generates a distinct pattern of behavioral incentives. Market economies strongly reinforce acquisitiveness and competition; commons-based economies reinforce cooperation and mutual aid; gift economies reinforce reciprocity. These reinforced values may differ dramatically from the stated values promoted by governance and education (the "cultural gap"). When the gap is large, populations experience cognitive dissonance, which over time breeds cynicism and, in extreme cases, revolutionary consciousness.

**Wealth capture:** When wealth concentrates sufficiently in an economic system that converts wealth to power (measured by the economic power potential of each model), it begins to capture four channels of social control: institutions (regulatory capture, rule-rigging), electoral systems (campaign finance, lobbying), media (narrative control, manufactured consent), and culture (normalization of inequality as meritocratic). The composite "reinforcement control" metric represents the degree to which wealthy interests control what behaviors are rewarded and punished.

**Feudal dynamics:** When wealth capture exceeds approximately 80% and wealth concentration is above 75%, the simulation flags a "feudal dynamic" -- a state where formal institutions are functionally subordinated to private wealth, economic hierarchy has superseded governance hierarchy, and behavioral reinforcement is controlled by a narrow elite. This can occur under any governance model, including formally democratic ones. The term "feudal" is used structurally (a small class extracts resources from a large class through institutional control) rather than historically.

**Consequence deficit:** The simulation tracks accumulated impunity -- instances where powerful actors face no consequences for harmful behavior. This accumulation is self-reinforcing: the longer consequences are deferred, the faster capture and corruption grow. Recovery is asymmetric: consequences accumulate faster than they are restored. This models the empirical observation that democratic backsliding accelerates once accountability institutions are sufficiently weakened.

**Cross-system consequences:** High reinforcement control means that even if governance changes (e.g., a shift to democracy), the new system may fail to change actual behavioral incentives because the economic structure still rewards the same behaviors. This is why civ-sim models paradigm shifts as requiring both governance and economic reform to produce lasting behavioral change: a governance shift without an economic shift produces structural change without psychological follow-through, and vice versa.

### 3.5 Ecology and Resources

**What is modeled:** Four depletable resources (forests, soil, minerals, water) with extraction rates determined by resource strategy and technology. Pollution and waste accumulate from industrial activity and are modulated by obsolescence model (durability-first through market-driven). Energy systems follow an EROI (Energy Return on Investment) framework: early civilizations use wood (EROI ~3), advanced civilizations may reach nuclear (EROI ~75) or renewable (EROI ~15). Declining EROI triggers complexity reduction pressure (Tainter's collapse theory). Carrying capacity and ecological overshoot are explicitly tracked, with overshoot beyond 1.0 accelerating all resource depletion.

Climate change follows a simplified DICE Integrated Assessment Model (Nordhaus 2017). The full pipeline tracks: emissions (from fossil fuel energy sources, scaled by civilization count and technology level) -> atmospheric CO2 concentration -> radiative forcing (logarithmic, following climate physics) -> temperature response via a two-box thermal model (surface temperature and deep-ocean temperature, with ocean heat uptake lag). Damage follows Nordhaus's quadratic function: D(T) = 0.00236 x T^2, where T is the temperature anomaly in degrees Celsius. Four progressive tipping points are modeled following Lenton et al. 2019: permafrost methane release (1.5C), ice sheet destabilization (2C), Atlantic Meridional Overturning Circulation weakening (3.5C), and hothouse Earth (5C). State capacity modifies a civilization's ability to adapt to climate damage.

Food security follows the FAO Food Insecurity Experience Scale (FIES) composite framework, with the instability threshold calibrated to Lagi et al. (NECSI 2011/2015). The food security index integrates resource base (soil health, water access), agricultural technology, trade access, climate stress (Wheeler & von Braun 2013: -6 points per degree C of warming), war disruption (Messer et al. 1998 conflict-famine nexus), inequality (Sen 1981 entitlement approach: distribution failure, not just production shortfall, causes famine), and state capacity (logistics, reserves, emergency response). When food security drops below the Lagi threshold (~30), instability onset follows a nonlinear curve. Famine probability escalates with duration rather than being fixed, and state capacity modifies famine mortality through relief effectiveness.

**Key assumption:** EROI is a binding constraint on civilizational complexity. When the energy surplus from primary energy sources declines, societies must simplify or find new energy sources. This follows the work of Hall, Cleveland, and Kaufmann on net energy analysis and Tainter's diminishing returns on complexity.

**Key assumption:** Climate change damage is nonlinear and path-dependent. The DICE model's quadratic damage function means that 3C of warming produces approximately four times the economic damage of 1.5C. Tipping points introduce irreversible state changes: once permafrost methane release is triggered, it cannot be reversed by reducing emissions. The ocean thermal lag means that even if emissions stop immediately, temperatures continue rising for decades.

**Key assumption:** Famine is a distribution failure, not a production failure. Following Sen (1981), the simulation models food security as dependent on both production capacity AND distributional equity. A society can have adequate aggregate food production and still experience famine if inequality prevents access. This is why the inequality penalty appears in the food security formula alongside agricultural technology.

### 3.6 Demographics and Public Health

**What is modeled:** A five-stage demographic transition (pre-transition through second transition) driven by the interaction of child survival, female education, gender equity, urbanization, and contraception access. Stage is derived from actual fertility and mortality rates rather than being set exogenously. Infant mortality is the key driver of fertility decline: as children survive more reliably, parents have fewer. Disease burden follows Omran's epidemiological transition from infectious-dominant through chronic-dominant to aging-dominant. Sanitation level is the key driver of the initial mortality decline (Stage 1 to Stage 2). Age cohorts (youth, working, elderly) drive the existing demographic profile system and create fiscal strain (dependency ratio).

Gender equity follows Duflo's 2012 bidirectional framework. Development drives gender equity improvement through technology, urbanization, education, and institutional quality — but gender equity also drives development through expanded talent pools (Hsieh et al. 2019: misallocation of talent by gender reduces productivity by 15-20%), improved governance quality (Chattopadhyay & Duflo 2004: women's political representation changes policy priorities), and reduced inequality. Suppression forces (state religion, theocratic governance, caste systems) can block gender equity improvements even when development levels would otherwise support them. A ceiling dampening effect at high GEI values (above 65 and 80) reflects the empirical observation that progress toward full parity slows as structural barriers become more subtle.

Education quality follows the Hanushek-Woessmann (2012/2015) framework, which finds that cognitive skills (education quality) matter far more for economic growth than years of schooling (education access). The simulation models nonlinear returns to quality: above 70% quality, returns accelerate (reflecting the threshold at which education begins producing genuine innovation capacity). The Pritchett (2001) gap is also modeled: expanding access without quality produces educated-but-unemployable populations, which drives anomie rather than growth.

**Key assumption:** The demographic transition is driven primarily by child survival, not by top-down policy. When infant mortality drops below ~50 per 1000, parents begin reducing family size. Education and gender equity accelerate this process, but child survival is the structural prerequisite. This follows Caldwell's wealth-flow theory and the observed historical sequence in every society that has undergone the transition.

**Key assumption:** Rapid demographic transitions cause anomie (Durkheim). Moving from Stage 1 to Stage 2 (mortality falling, population exploding) or from Stage 4 to Stage 5 (below-replacement fertility, aging population) generates social disruption regardless of whether the transition is positive in the long run.

**Key assumption:** Gender equity and economic development are bidirectionally causal. Following Duflo 2012, the simulation rejects the view that development automatically produces gender equity (the "development solves everything" fallacy) AND the view that gender equity programs alone can drive development. Both channels operate simultaneously, and either can be blocked by structural barriers (caste, theocracy, state religion).

### 3.7 Technology and Infrastructure

**What is modeled:** A branching technology tree of 38 advances across 7 categories (Materials & Metallurgy, Agriculture, Energy, Science & Knowledge, Communication, Medicine, Maritime & Trade), spanning all 11 historical eras from Prehistoric to Future. Technologies have prerequisite dependencies — both within and across categories — creating non-linear progression paths. A civilization can advance along maritime trade without developing metallurgy, or push scientific knowledge while lagging in agriculture. Technology adoption uses a pressure-based system: adoption pressure accumulates per turn based on innovation culture, education quality, science freedom, energy surplus, and trade-network imitation (Bass diffusion model). Value resistance modulates adoption — theocratic societies resist innovation-boosting techs, concentrated-power structures resist information technologies, ecological economies resist high-warming technologies. Six automation levels (0-5) with progressive effects on labor share, unemployment, and fertility. Infrastructure level and maintenance debt with a self-reinforcing decay trap (deferred maintenance compounds). Eight types of public works projects with multi-turn construction. Urbanization driven by infrastructure, technology, and economic model, with cross-effects on state capacity, innovation, food security, and stability.

**Key assumption:** Technology does not follow a single linear path. The prerequisite tree creates branching development trajectories, reflecting the historical reality that civilizations specialize in different technological domains based on geography, culture, and economic incentives. A maritime civilization may develop navigation and trade networks before a landlocked neighbor, while the latter may advance metallurgy faster. This design aligns with the project's anti-teleology principle: there is no single "correct" technology progression.

**Key assumption:** Technology adoption is not purely positive. Every advance creates second-order effects: automation displaces workers, fossil fuels create warming, intensive agriculture depletes soil. The simulation does not treat technology as an unambiguous good, nor as an unambiguous threat. It models the trade-offs.

**Key assumption:** Cross-category prerequisites model real interdependencies. Germ Theory requires both the Scientific Method (science category) and Surgical Techniques (medicine category). Computing requires Modern Physics and Mathematics. This prevents unrealistic technology leaps and ensures that broad civilizational development is needed for advanced discoveries.

### 3.8 Inter-Civilization Dynamics

**What is modeled:** Multi-civilization maps with trade, diplomacy (treaties, alliances), warfare, colonization, and independence movements. Cross-civilization behavioral contagion (cooperation norms, cynicism, and epistemic health drift toward trading partners). Religion spreads between civilizations through trade links. Shadow governments bleed corruption or conformity to other civilizations. Plague spreads between connected civilizations. Diplomatic attitudes shift based on governance similarity, slavery, piracy, and treaty compliance.

War declaration follows the Kantian tripod of democratic peace theory (Russett & Oneal 2001): democratic dyads have an 85% lower probability of war, trade interdependence reduces conflict further, and high institutional quality on both sides acts as an additional brake. The Fearon (1995) bargaining model adds a power-balance dimension: highly asymmetric dyads fight less because the outcome is predictable. Organski's (1958) power transition theory creates the opposite dynamic: near-parity between hostile civilizations increases war risk as the rising power seeks to revise the status quo.

War outcomes follow Lanchester's square law: combat power is computed from military strength, state capacity, technology, and morale, and the power ratio determines casualty distribution. This means a 2:1 power advantage produces a 4:1 casualty advantage (square law), making military investment decisions consequential.

Territorial expansion follows Turchin's (2003/2006) meta-ethnic frontier theory. Group cohesion (asabiya) builds from stability, legitimacy, and social trust. Frontier effects amplify cohesion: civilizations facing hostile neighbors develop stronger collective identity. Imperial overstretch (territory exceeding state capacity) works against expansion. The net of asabiya, frontier bonus, and overstretch penalty determines expansion magnitude.

**Key assumption:** War between democracies is rare not because democracies are peaceful, but because three structural mechanisms — shared norms, trade interdependence, and institutional constraints — multiply to reduce war probability. A single mechanism is insufficient; the Kantian tripod requires all three legs. This explains why individual democracies can still be aggressive toward non-democracies while almost never fighting each other.

### 3.9 Organized Crime and Forced Labor

**What is modeled:** Four types of organized crime (street gang, cartel, mafia, pirate network), each emerging from specific structural conditions and each with distinct suppression options. Four types of slavery (chattel, debt bondage, forced labor, penal), with an abolitionist movement that builds organically from empathy and prevalence. Slavery's economic effects (cheap labor, wealth concentration) are modeled alongside its social effects (empathy erosion, corruption, diplomatic stigma).

---

## 4. What civ-sim Does NOT Model

Every model is a simplification. The following are deliberate omissions, each with a reason.

### 4.1 Individual Agents

civ-sim does not model individual people. It tracks aggregate metrics (wealth concentration, social trust, fertility rate) rather than simulating thousands of individual agents making individual decisions. This is a fundamental architectural choice: individual-level ABMs can model emergent micro-behavior but struggle with the breadth of systems civ-sim covers. The trade-off is that civ-sim cannot capture phenomena that arise specifically from individual-level heterogeneity within strata (e.g., the specific network effects that make one merchant more powerful than another).

### 4.2 Spatial Microeconomics

Trade, production, and resource extraction are modeled at the civilization level, not at the level of individual cities or regions. There are no supply chains, price mechanisms, or market equilibria. The economic model determines aggregate behavioral incentives and wealth distribution, but not the spatial allocation of production. This means civ-sim cannot capture regional inequality within a civilization or the specific dynamics of port cities versus inland areas.

### 4.3 Formal Legal Systems

The simulation models institutional quality, corruption, and governance structure, but does not have a separate legal system with distinct civil, criminal, and commercial law traditions. Judicial independence is implicitly captured through institutional quality rather than modeled as a separate variable. This means the simulation cannot distinguish between, say, common law and civil law traditions, or model the specific effects of constitutional courts.

### 4.4 Individual Psychology and Cognitive Biases

While civ-sim models aggregate behavioral tendencies (susceptibility to influence, empathy, cynicism), it does not model individual cognitive biases (loss aversion, anchoring, availability heuristic). The simulation treats behavioral change as an aggregate phenomenon shaped by structural incentives, not as a result of individual psychological quirks. Prospect theory, for example, would predict that populations react more strongly to losses than to equivalent gains; civ-sim does not capture this asymmetry at the individual level, though some cross-effects (e.g., trauma persisting longer than equivalent positive experiences) approximate it at the system level.

### 4.5 Detailed Military Strategy

Wars in civ-sim are resolved through Lanchester's square law applied to aggregate combat power (military strength x state capacity x technology x morale), not through tactical or strategic military simulation. There are no unit types, battle formations, or logistics chains. This means the simulation cannot capture the specific dynamics that make guerrilla warfare effective or naval power decisive (though the square law does mean that concentrated force advantages produce disproportionate casualty ratios, which is empirically realistic for conventional warfare). Military-civilian balance and civilian control are modeled, but the internal structure of military organizations is not.

### 4.6 Art, Literature, and Specific Cultural Products

The simulation tracks arts support and arts freedom as aggregate metrics, but does not model the creation of specific cultural products. There is no mechanism for a civilization to produce a transformative literary work, musical tradition, or architectural style that specifically influences other systems. Cultural influence is captured through behavioral contagion and cultural homogeneity rather than through specific cultural artifacts.

### 4.7 Language Evolution

While linguistic fractionalization is tracked as a structural variable, the simulation does not model language evolution, creolization, or the specific dynamics of lingua francas. Language is treated as a component of ethnic fractionalization rather than as an independent system with its own dynamics.

### 4.8 Detailed Substance Abuse Dynamics

Substance abuse is captured implicitly through the anomie and deaths-of-despair mechanics (high anomie combined with low wellbeing generates negative demographic effects), but is not modeled as a separate system with its own supply chains, regulatory frameworks, and treatment infrastructure. The opioid epidemic, for example, involved specific pharmaceutical industry dynamics, prescribing patterns, and regulatory failures that civ-sim does not capture at that level of detail.

### 4.9 Demographic Microstructure

The simulation tracks three age cohorts (youth, working, elderly) and a dependency ratio, but does not model a full age pyramid with year-by-year cohorts. This means it cannot capture cohort-specific effects (e.g., the specific political influence of baby boomers) or the precise shape of demographic momentum. The three-cohort model captures the essential dynamics (youth bulge instability, aging fiscal strain, dependency pressure) without the computational overhead of a detailed age pyramid.

### 4.10 Innovation as a Specific Process

Innovation is modeled as a behavioral axis (how much a population values and pursues novelty) and as technology adoption (unlocking specific advances), but not as a detailed process with research institutions, patent systems, venture capital, knowledge networks, and technology transfer. The innovation ecosystem -- the specific institutional arrangements that make Silicon Valley different from a medieval guild -- is not captured. Innovation is treated as an emergent property of education, freedom, incentives, and cultural values rather than as an independent system.

---

## 5. Key Simplifications

### 5.1 Continuous Drift vs. Discrete Events

Most metrics in civ-sim change through continuous per-turn drift (small increments of +0.01 to +0.05 per turn) rather than through discrete events. This means transitions are gradual by default, punctuated by occasional discrete events (crises, paradigm shifts, disasters). Real-world change is more uneven: revolutions, pandemics, and technological breakthroughs can produce rapid discontinuities that the drift model smooths out. The simulation compensates by including threshold events that fire when metrics cross specific boundaries, but the underlying drift is still continuous.

### 5.2 Uniform Populations

Within each stratum, individuals are treated as homogeneous. All elites have the same empathy level; all laborers have the same wellbeing. In reality, within-stratum variation can be as large as between-stratum variation. The susceptibility distribution model (bimodal + gamma) captures population-level heterogeneity in behavioral susceptibility, but other dimensions of within-stratum variation are not modeled.

### 5.3 Symmetric Timescales

Most per-turn drift rates are similar in magnitude for growth and decline. In reality, many systems are asymmetric: trust erodes faster than it builds, infrastructure decays faster than it is constructed, trauma persists longer than the events that caused it. civ-sim approximates some of these asymmetries (trauma healing is slower than trauma accumulation, consequence deficit recovery is slower than accumulation) but does not systematically apply asymmetric rates to all systems.

### 5.4 Single-Turn Resolution

Each turn represents a fixed time increment (variable by era but typically 5-50 years). Events within a turn are processed sequentially in a fixed order. There is no sub-turn resolution, which means interactions within a single turn are order-dependent in ways that would not apply if events were truly simultaneous. The processing order is designed to minimize order-dependency artifacts (e.g., healthcare is processed before demographics so that healthcare improvements affect demographic outcomes within the same turn).

### 5.5 Governance as Monolithic

Each civilization has one governance model at a time. In reality, governance is often layered (federal/local, formal/informal, state/tribal) and contested (multiple factions within a single government). The simulation does model shadow governments and wealth capture as parallel power structures, but the underlying assumption is that a civilization can be characterized by a single primary governance type at any given time.

---

## 6. Feedback Loops and Emergence

The following feedback loops are the structural backbone of the simulation. They are not programmed as single mechanisms but emerge from the interaction of multiple subsystems.

**Virtuous cycles:**
- Trust --> Institutional quality --> Low corruption --> Trust (the Nordic model)
- Education --> Gender equity --> Fertility decline --> Demographic dividend --> Education investment
- Innovation --> Energy surplus --> Infrastructure --> Urbanization --> Innovation
- Inclusion --> Trust --> State capacity --> Inclusion
- Child survival --> Fertility decline --> Lower dependency ratio --> Higher investment per child --> Better child survival
- Inclusive institutions (AJR) --> State capacity --> Education quality --> Inclusive institutions
- Democratic peace: Democracy --> Trade --> Institutional quality --> Lower war risk --> Stability --> Democracy
- Gender equity --> Talent pool expansion (Hsieh) --> Innovation --> Development --> Gender equity (Duflo bidirectional)

**Vicious cycles:**
- Inequality --> Low mobility (Gatsby Curve) --> Entrenched inequality --> Political capture --> More inequality
- Corruption --> Low state capacity --> Patronage dependency --> More corruption (Ibn Khaldun cycle)
- Environmental overshoot --> Resource depletion --> Complexity costs --> Simplification pressure --> Collapse risk
- Trauma --> Low trust --> Weak institutions --> Vulnerability to future shocks --> More trauma
- Anomie --> Low wellbeing --> Deaths of despair --> Labor loss --> Economic decline --> More anomie
- Energy EROI decline --> Rising complexity costs --> Institutional stress --> Simplification
- Minsky cycle: Stability --> Credit expansion --> Euphoria --> Crisis --> Instability (endogenous)
- Coup trap: Military coup --> Weak institutions --> Instability --> Next coup (Powell & Thyne)
- Extractive institutions --> Elite capture --> Resistance to reform --> Extractive persistence (AJR)
- Climate tipping points: Warming --> Permafrost methane --> More warming --> Ice sheet loss --> More warming (irreversible)

**Ambiguous dynamics:**
- Urbanization: boosts innovation and state capacity, but requires food security and infrastructure; without them, creates slums and instability
- Automation: increases productivity and reduces labor demand; creates wealth while displacing workers (Acemoglu-Restrepo: displacement vs. reinstatement race determines net outcome)
- Trade: boosts knowledge exchange and economic growth; creates dependency and imports behavioral norms from partners. Stolper-Samuelson: distributional effects depend on factor abundance
- High fractionalization + high inclusion: cultural richness and innovation; but high fractionalization + low inclusion: conflict and state fragility
- Post-materialism shift (Inglehart): prosperity creates self-expression values that support innovation and freedom, but can erode collective solidarity needed for crisis response
- Imperial expansion (Turchin): frontier threat builds cohesion (asabiya), but successful expansion creates overstretch that erodes the cohesion that enabled it

---

## 7. Empirical Grounding

Each major system is calibrated against specific research traditions rather than being tuned for game balance. Selected examples:

| System | Research Basis |
|--------|---------------|
| Wealth concentration | Piketty (r > g dynamics); Bouchaud & Mezard (multiplicative wealth models); Saez & Zucman (top wealth shares) |
| Labor share / r>g | Piketty 2014 (capital vs. growth); Kaldor 1957 (stylized facts); Autor et al. 2020 (labor share decline) |
| Financial cycles | Minsky 1992 (Financial Instability Hypothesis); Keen 1995/2013 (formal Minsky models); Kindleberger & Aliber 2011 (speculative manias); Reinhart & Rogoff 2009 (crisis database); Schularick & Taylor 2012 (credit booms predict crises) |
| Social trust | Knack & Keefer (corruption as primary erosion factor); Putnam (civic engagement); Rothstein (institutional quality) |
| Demographic transition | Notestein (classic DTM); Caldwell (wealth-flow theory); Omran (epidemiological transition) |
| Gender equity | Duflo 2012 (bidirectional development-equity); Hsieh et al. 2019 (talent misallocation); Chattopadhyay & Duflo 2004 (women's representation and policy) |
| Education quality | Hanushek & Woessmann 2012/2015 (cognitive skills > years of schooling); Pritchett 2001 (access without quality) |
| Ethnic conflict | Wimmer, Cederman & Min (political exclusion, not diversity); Horowitz (ethnic politics) |
| Social mobility | Corak 2013 (Great Gatsby Curve: IGE = 0.15 + 0.73 x Gini); Chetty et al. 2014 (neighborhood effects); Clark (The Son Also Rises) |
| Generational values | Inglehart & Welzel 2005 (post-materialism); World Values Survey (survival vs. self-expression) |
| Collapse dynamics | Tainter (diminishing returns on complexity); Diamond (environmental overshoot); Turchin (secular cycles) |
| Territorial expansion | Turchin 2003/2006 (meta-ethnic frontier theory, asabiya); Organski 1958 (power transition) |
| Behavioral inertia | Bourdieu (habitus); North (institutional path dependency) |
| Institutions | Acemoglu, Johnson & Robinson 2001/2005/2012 (inclusive vs. extractive); North 1990 (transaction costs); Rodrik et al. 2004 (institutions > geography > trade); Fukuyama 2011 (political order) |
| State capacity | Besley & Persson (fiscal capacity); Fukuyama (political order); Mann (infrastructural power) |
| Legitimacy | Weber (traditional, charismatic, rational-legal); Lipset (political legitimacy) |
| Anomie | Durkheim (social disruption); Case & Deaton (deaths of despair) |
| Climate change | Nordhaus 2017 (DICE integrated assessment); IPCC AR6 (climate sensitivity); Lenton et al. 2019 (tipping points) |
| Food security | FAO 2023 (FIES); Lagi et al. (NECSI 2011/2015, food-price instability threshold); Sen 1981 (entitlement approach); Wheeler & von Braun 2013 (climate-food security); Messer et al. 1998 (conflict-famine nexus) |
| Energy transitions | Hall, Cleveland & Kaufmann (EROI); Smil (energy and civilization) |
| Military-civilian balance | Powell & Thyne 2011 (global coup dataset); Huntington 1957/1968 (objective civilian control, praetorianism); Collier & Hoeffler 2007 (economic crisis and coups); Geddes 2003 (authoritarian regime types); Feaver 2003 (civil-military gap) |
| War and peace | Russett & Oneal 2001 (Kantian tripod / democratic peace); Fearon 1995 (bargaining model); Lanchester 1916 (attrition models); Dupuy 1987 (combat power) |
| Trade | Tinbergen 1962 (gravity model); Stolper-Samuelson 1941 (factor abundance and trade); Krugman 1991 (new trade theory) |
| Technological unemployment | Acemoglu & Restrepo 2018/2020 (task displacement vs. reinstatement); Autor et al. (routine-biased technological change) |
| Information ecosystems | Herman & Chomsky (manufacturing consent); Benkler (network propaganda) |
| Power-empathy suppression | Keltner, Gruenfeld & Anderson (power and approach/inhibition); Piff et al. (wealth reduces prosocial behavior); Guinote (power narrows attention); van Kleef et al. (power reduces emotional response to suffering) |
| Susceptibility distribution | Behavioral addiction research (Potenza; Grant et al.); pathogen susceptibility models (Miura et al. bimodal+gamma); ACE studies (Felitti et al.) |
| Wealth capture | Gilens & Page (economic elite domination); Bartels (unequal democracy); Hacker & Pierson (winner-take-all politics) |
| Cultural gap / cognitive dissonance | Festinger (cognitive dissonance theory); Gramsci (cultural hegemony); Scott (hidden transcripts of resistance) |
| Consequence deficit | Acemoglu & Robinson (extractive institutions); Fukuyama (political decay); Olson (institutional sclerosis) |

---

## 8. How to Interpret Results

### What the numbers mean

Most metrics are on a 0-100 scale. These are not percentages in the colloquial sense. They represent relative positions on a continuum. A social trust of 70 means "high trust, comparable to Nordic countries." A corruption level of 30 means "moderate corruption, typical of middle-income democracies." The absolute numbers are less meaningful than their relationships: trust at 70 with corruption at 30 will produce different outcomes than trust at 70 with corruption at 60, because the cross-system effects are nonlinear.

### What you can learn

civ-sim is useful for exploring structural questions: What happens to a society that concentrates wealth without investing in education? How does a theocracy respond to technological change? Can a planned economy maintain legitimacy as it industrializes? The simulation will not give you a precise prediction, but it will show you which feedback loops dominate under which conditions, and where structural vulnerabilities tend to emerge.

### What you cannot learn

civ-sim cannot tell you what will happen to a specific real-world country. The simulation is too abstract (no geography-specific cultural factors, no named leaders, no specific historical events) and too simplified (120 variables for a system that has millions of relevant variables) to serve as a forecasting tool. It is a thinking aid, not an oracle.

### The coverage question

We estimate that civ-sim currently captures approximately 78-82% of the dynamics that any simulation could theoretically model. This is up from approximately 70-75% before the evidence-based model upgrade pass, which replaced 15 ad-hoc or calibration-only subsystems with models grounded in specific research frameworks (Minsky-Kindleberger financial cycles, DICE climate model, Kantian democratic peace, Lanchester attrition, Piketty r>g, Great Gatsby Curve, gravity trade model, Acemoglu-Restrepo task displacement, Duflo bidirectional gender-development, Hanushek-Woessmann education quality, Inglehart post-materialism, Turchin meta-ethnic frontier, FAO FIES food security, Powell & Thyne coup dataset, and Acemoglu-Johnson-Robinson institutional dynamics).

The theoretical ceiling for civilizational modeling is itself roughly 65-75% of actual real-world dynamics, due to irreducible factors: chaotic sensitivity to initial conditions, reflexivity (people change behavior when observed), incomplete social theory, measurement impossibility (some important variables cannot be quantified), genuine emergence (system-level properties that cannot be predicted from component behavior), and unknown unknowns (dynamics we have not yet identified).

This means civ-sim captures roughly 55-60% of real-world civilizational dynamics in absolute terms. The improvement from the evidence-based upgrade pass is significant: not because 15 new variables were added (the variable count was already ~130), but because the *mechanisms* connecting those variables now follow empirically validated functional forms rather than ad-hoc drift rates. A Minsky financial cycle that produces endogenous crises through credit expansion is structurally different from a random crisis probability — even if both produce crises at similar frequencies. The former captures why crises happen; the latter only captures that they happen.

This level of coverage is sufficient for structural insight — you can see how feedback loops work, where vulnerabilities cluster, and why certain policy combinations fail — but insufficient for prediction. The gap between 60% and 100% is not something that can be closed by adding more variables; it reflects fundamental limits on modeling complex adaptive systems.

---

## 9. Design Philosophy

Four principles guide what gets included and what does not:

1. **Include what creates feedback loops.** A factor that influences other factors and is influenced by them (corruption erodes trust; low trust weakens the institutions that fight corruption) is more important than a factor that has only one-directional effects. This is why civ-sim models social trust (which connects to everything) but not specific court procedures (which have narrow effects).

2. **Model mechanisms, not outcomes.** The simulation does not code "theocracies stagnate" or "democracies prosper." It codes the mechanisms (theocratic governance suppresses innovation and out-group empathy; democratic governance distributes power but can be captured by wealth) and lets outcomes emerge from interaction. This means surprising results are possible and meaningful rather than scripted.

3. **Prefer empirical calibration over game balance.** When research says corruption erodes trust more than inequality does, the simulation reflects that, even if it makes the gameplay less balanced. When research says the demographic transition is driven by child survival rather than top-down population policy, the simulation reflects that, even if it means population-control buttons have limited effect. The simulation is biased toward empirical accuracy, not toward making every strategy equally viable.

4. **No cultural assumptions about inevitability.** civ-sim does not assume that any particular form of social organization is natural, inevitable, or superior. This is a deliberate departure from most civilization games and many academic models, and it deserves elaboration.

5. **Reproducibility by design.** All simulation-relevant randomness (stochastic events, probability checks, disease outbreaks, natural disasters, civil war triggers) flows through a seeded PRNG (Mulberry32) initialized from the research seed. Same seed + same parameters = identical trajectory. Non-simulation randomness (NPC interview flavor text, map noise generation, UI timing) uses standard Math.random() and does not affect run reproducibility. This separation ensures that researchers can share seeds and replicate results exactly, while cosmetic variation remains natural.

### No teleology

Most civilization simulators embed a cultural assumption that history progresses along a fixed track: from barter to currency, from tribe to state, from tradition to modernity, from local to global. Sid Meier's Civilization, for example, presents a technology tree that every civilization must climb, converging toward the same endpoint. The implicit message is that markets, nation-states, and representative democracy are the natural destinations of civilizational development, and that societies which organize differently are simply earlier on the same path.

civ-sim rejects this assumption. The simulation offers nine economic models (gift, barter, labor credit, commons, commodity, market, planned, mixed, and none), fifteen governance models (from flat consensus to autocratic to world federation), and no predetermined sequence among them. A gift economy is not a "primitive" version of a market economy waiting to evolve. It is a distinct system with its own behavioral incentives, its own strengths (high cooperation, low wealth concentration, ecological sustainability), and its own limitations (difficulty scaling, low financial depth). A flat-consensus governance is not a failed attempt at representative democracy. It is a different answer to the question of how to organize collective decision-making, with trade-offs that the simulation models without ranking.

Specifically, civ-sim does not assume:

- **That currency is inevitable.** Gift economies, barter systems, labor credit systems, and commons-based economies all function in the simulation without currency. Each has a different ceiling on financial depth (gift economies cap at 15; market economies are unconstrained), but low financial depth is not treated as a deficiency -- it is a structural characteristic with both advantages (no debt crises, no predatory lending) and disadvantages (limited trade scaling, slower infrastructure development). A civilization can prosper without ever developing currency if its other systems support it.

- **That hierarchy is inevitable.** Flat-consensus and rotating governance models function with hierarchy levels near zero. The simulation does not penalize them for lacking hierarchy; instead, it models the specific trade-offs: flat governance distributes power (reducing empathy suppression and corruption) but scales poorly to large populations and makes rapid collective decisions difficult. Whether that trade-off favors flat or hierarchical governance depends on the civilization's size, security environment, and other systems -- not on an assumption that hierarchy is the natural order.

- **That markets are the natural economic endpoint.** Market economies in the simulation have high efficiency and innovation incentives but also the highest wealth-to-power conversion potential (0.85), the strongest acquisitiveness reinforcement, and the greatest vulnerability to plutocratic capture. Commons and labor-credit economies have lower innovation incentives but also lower inequality, lower empathy suppression, and greater ecological sustainability. The simulation does not treat any of these as the "correct" answer.

- **That technological progress follows a single track.** Technology adoption in civ-sim is gated not only by era and innovation level but also by societal values. A theocracy may resist technologies that challenge religious authority. A commons-based society may reject high-warming energy sources. A gift economy may have no incentive to develop financial instruments. These are not failures to progress -- they are coherent responses to different value systems, and the simulation models their consequences without treating them as deficiencies.

- **That Western-style development is the benchmark.** The simulation does not use GDP, democratic elections, or industrialization as implicit measures of success. Wellbeing, equality, stability, ecological capacity, social trust, and empathy are all tracked independently. A pre-industrial commons with high trust, high equality, low ecological damage, and high empathy scores well on most of these metrics. A highly industrialized market democracy with extreme inequality, low trust, ecological overshoot, and low elite empathy scores poorly on most of them. Neither is coded as "better" -- the simulation presents the trade-offs and lets users draw their own conclusions.

This design choice is not relativism. The simulation does model real consequences: concentrated power suppresses empathy, unchecked resource extraction causes ecological collapse, extreme inequality erodes trust and stability. These are empirical findings, not cultural judgments. But the simulation does not assume that any particular combination of governance, economy, and technology is the uniquely correct way to avoid these outcomes. Multiple configurations can sustain high wellbeing, high trust, and ecological balance. Multiple configurations can fail. The point is to explore which structural features matter and why, not to validate a predetermined narrative about civilizational progress.

---

---

## 10. For Educators

civ-sim can serve as a classroom tool for courses in world history, sociology, political science, economics, and environmental science at the high school level and above. Its value lies in making abstract concepts interactive: students configure a society, change variables, and observe consequences propagating through interconnected systems in real time.

### What Students Can Explore

**World History / AP World History:**
- Configure the 10 historical scenarios (see `HISTORICAL_SCENARIOS.md`) and compare simulation trajectories with documented historical patterns
- Examine why the demographic transition follows the sequence mortality-decline-then-fertility-decline rather than the reverse
- Study how ecological overshoot contributed to civilizational collapse (Khmer, Easter Island analogs)

**Sociology / Social Studies:**
- Observe how wealth concentration is self-reinforcing under certain economic systems and self-limiting under others
- Explore the relationship between political exclusion and ethnic conflict (Wimmer framework) — diversity itself is not the driver; exclusion is
- Watch how the cultural gap between stated values and reinforced behavior produces cynicism and, eventually, revolutionary pressure

**Political Science / Government:**
- Compare governance models without a predetermined ranking: flat consensus, representative, autocratic, theocratic — each with structural strengths and weaknesses
- Study how institutional lock-in develops over time and why reform resistance grows
- Observe how wealth can capture institutions even under formally democratic governance

**Economics:**
- Compare nine economic models and their effects on equality, growth, innovation, and ecological sustainability
- Study the trade-off between r > g wealth accumulation and institutional countermeasures
- Examine why planned economies produce rapid initial growth followed by stagnation

**Environmental Science:**
- Track EROI (Energy Return on Investment) across energy transitions
- Observe carrying capacity, overshoot, and ecological collapse dynamics
- Study the relationship between resource strategy (conservation vs. extraction) and long-term sustainability

### Suggested Classroom Use

1. **Comparative exercise**: Split students into groups, each configuring a different governance/economy combination. Run 100 turns. Compare outcomes across groups. Discuss why the results differed.
2. **Single-variable experiment**: All students start with identical configurations. Each group changes one parameter (education access, resource strategy, women's rights). Compare outcomes to isolate the effect of that variable.
3. **Historical analog**: Configure a scenario from `HISTORICAL_SCENARIOS.md`. Run the simulation. Compare the trajectory with the historical record. Discuss what the model captures and what it misses.
4. **Policy debate**: Present students with a civilization in crisis (high inequality, declining trust, ecological pressure). Each group proposes different policy interventions. Run the scenarios. Evaluate which interventions were most effective and why.

### Pedagogical Strengths

- **No teleology**: The simulation does not assume Western-style development is the natural endpoint. Students from all cultural backgrounds can explore their own civilization's structural analogs without encountering a predetermined ranking.
- **Visible causality**: Every metric shows its drivers. Students can trace exactly why trust declined or why fertility dropped, building causal reasoning skills.
- **Safe failure**: Students can crash civilizations without consequence, learning from structural failures in ways that textbook descriptions of collapse cannot convey.
- **Multilingual**: LLM-powered NPC interviews respond in the student's language, making the tool accessible to non-English-speaking classrooms.

### Limitations for Classroom Use

- civ-sim is a structural model, not a historical simulation. It does not reproduce specific events, dates, or figures. Students should understand they are studying causal patterns, not predicting history.
- The simulation requires approximately 30 minutes of setup time on first use (mostly LLM configuration). After initial setup, subsequent sessions start immediately.
- Some concepts (behavioral reinforcement, susceptibility distributions, consequence deficit) may require instructor scaffolding for younger students.

---

---

## 11. Systems Added March 2026 (Balance & Realism Update)

The following systems were added during a comprehensive balance and realism update to close identified gaps between the simulation and real-world dynamics. All are calibrated to academic research and designed to be governance-neutral (outcomes depend on institutional quality, not governance labels).

### 11.1 Ecological Systems
- **Biodiversity Index** (0-100): Derived from forest health, pollution, overshoot. Affects food security via pollination (IPBES 2019), disease regulation, ecological capacity. Extinction-speciation asymmetry: decline is fast, recovery takes centuries-millennia.
- **Ocean Health Index** (0-100): CO₂ acidification, pollution runoff, overfishing. Fisheries collapse below 60, mass marine extinction below 20, CO₂ feedback below 40 (IPCC 2019).
- **Deforestation-Water Feedback**: Amazon tipping point model (Nobre 2016). Below 40% forest, water degradation accelerates 2.5×.
- **Pollution Persistence**: PFAS, microplastics, heavy metals. Above 60, natural decay slows; above 80, bioaccumulation.
- **Fossil Fuel Pollution**: Coal/oil directly increase pollution and global warming per turn; renewables/nuclear/fusion reduce pollution.

### 11.2 Climate Extremes
- Extreme weather events (flooding, heat waves, drought, hurricanes) with frequency scaling as temperature² (IPCC AR6).
- Megafire events driven by temperature × drought × forest (Australia Black Summer, California model).
- Ongoing sea level rise after ice sheet tipping point. Glacial melt water supply loss above 3.5°C.

### 11.3 Environmental Policy
- 5 stochastic events (Environmental Awakening, EPA, Reforestation, Ecological Emergency, Clean Energy Transition) that fire based on institutional quality, tech level, and ecological damage — NOT governance type.
- 7 player policy buttons: Reforestation, Pollution Controls, Soil Conservation, Water Management, Green Subsidies (voluntary), Green Mandate, Recycling Program.
- Green subsidies split: voluntary (lower effect, no stability cost) vs mandate (stronger effect, stability risk from pushback). Models IRA vs EU Green Deal approaches.

### 11.4 Catastrophic Events
- **Nuclear War** (3 levels): Limited/tactical, large-scale, all-out (MAD). Extremely rare stochastically (0.1%/decade base). Based on Bulletin of Atomic Scientists, CGSR/LLNL research.
- **Civil War** (3 severities): Ethnic/sectarian, class/ideological, limited insurgency. Based on Fearon & Laitin (2003), Collier & Hoeffler (2004), Cederman et al. (2010). 8 risk factors, 3 dampeners.
- **Post-Catastrophe**: Extinction (population at minimum 200+ years with no food/water) and survivor rebuild (Black Death effect: wealth redistribution, adaptation).

### 11.5 Failed State Dynamics
- Failed states CAN be invaded (models Afghanistan 2001, Libya 2011, Somalia 2006). Cannot declare war.
- Reconstitution path with corruption purge, institutional momentum. Based on Rotberg (2004).

### 11.6 Inter-Civilization Systems
- **Immigration**: Push-pull model (Lee 1966). Brain drain, refugee flows, Stage 5 demographic sustainability. Innovation differential amplifies skilled migration (Florida 2002, Docquier & Rapoport 2012): high-innovation civs attract talent, creating concentration effects. Source civs lose education quality and innovation capacity proportional to the gap; destination civs gain education quality and amplified innovation.
- **Pandemic Modeling**: COVID-style systemic effects. Response scales with state capacity + trust + epistemic health.
- **Trade Networks**: Globalization prosperity + supply chain vulnerability (2008, COVID models).
- **Disinformation**: Social media era (tech ≥ 7). Erodes epistemic health, trust. Defended by education (Finland model).
- **AI Disruption**: Productivity boost + labor displacement + deepfake epistemic threat. Dual-use depends on institutions.
- **Urbanization-Innovation Clustering**: Agglomeration effects (Glaeser 2011, Moretti 2012). High urbanization × high education produces superlinear innovation bonus — knowledge spillovers, dense labor markets, university-industry proximity. Begins at urbanization >40, with nonlinear scaling (exponent 1.5) when both urbanization and education are high.
- **Urban-Rural Divide**: High urbanization + inequality → stability pressure (Trump/Brexit/gilets jaunes model).
- **Cultural Soft Power**: Nye (2004). High education/freedom/wellbeing projects cultural influence.

### 11.7 Balance Philosophy
All recovery and prosperity mechanisms are institution-based, not governance-type-based. Singapore, China, and Nordic countries can all thrive IF their institutions are strong. The simulation has no built-in bias for or against any governance or economic model — outcomes emerge from the interaction of institutional quality, social trust, state capacity, resource management, and stochastic events.

### 11.8 Theocratic Governance: Benign vs Dystopian
The simulation explicitly models the full spectrum of theocratic outcomes. Epistemic health is driven by freedom level and science freedom, NOT by the "theocratic" governance label. A theocracy that maintains high science freedom (Abbasid Caliphate's House of Wisdom, medieval monastic scholarship, Ottoman bureaucratic meritocracy) will sustain strong epistemic health and achieve genuine golden ages. A theocracy that suppresses science and freedom (Taliban Afghanistan, ISIS caliphate) will see epistemic collapse, institutional degradation, and civilizational decline. The same applies to all governance types — autocracies that fund science (Soviet Union, modern China) maintain moderate EH; democracies with declining media trust see EH erode.

### 11.9 Stage 5 Population Sustainability
Prosperous civilizations (wellbeing > 70, food security > 70) have a higher minimum fertility floor of 8 (≈TFR 1.6) instead of the absolute minimum of 3 (≈TFR 1.0). This models the empirical finding that generous social policy (parental leave, childcare, gender equity) sustains near-replacement fertility in advanced economies (France TFR 1.84, Sweden TFR 1.67, Denmark TFR 1.72). Combined with immigration from less-prosperous civilizations, this prevents the unrealistic total population collapse previously observed in Stage 5 societies.

### 11.10 Round 5 Systems (9 new subsystems)

**Natural Disaster Resilience.** Earthquakes, tsunamis, volcanic eruptions modeled as stochastic events with geological risk derived from terrain tiles. Key insight: same-magnitude disaster produces vastly different outcomes depending on state capacity + technology + building codes (Haiti 2010 vs Japan 2011). Volcanic eruptions produce temporary global cooling (Pinatubo 1991: -0.5°C for 2 years; Tambora 1815: "Year Without a Summer"). Post-disaster social cohesion boost is empirically documented (Fritz 2006).

**Sovereign Debt / Fiscal Crisis.** Debt accumulates from spending exceeding tax capacity (military spending, social programs, war costs). Crisis threshold at debt/GDP > 90% follows Reinhart & Rogoff (2010), though the magnitude of the growth effect is debated (Herndon et al. 2014 critique). Three response paths: austerity (internal devaluation), default (capital flight + trust penalty), bailout (conditionality from stronger civs). Integrates with existing Minsky financial cycle and debtLoad fields.

**Media/Information Ecosystem.** Press freedom inversely correlated with corruption (Brunetti & Weder 2003, r = -0.7 across 125 countries). Investigative journalism stochastically exposes corruption, reducing it step-wise. Public broadcasting boosts social cohesion (BBC/NHK model — Soroka et al. 2013). Media literacy as disinformation defense (Finland's national curriculum, ranked #1 in media literacy). Oligarch media capture when wealth concentration high (Berlusconi, Murdoch, post-Soviet oligarchs). Four state fields: pressFreedom, mediaLiteracy, mediaOligarchCapture, publicBroadcasting.

**Drug/Addiction Epidemics.** Vulnerability model: anomie + low wellbeing + inequality + rapid social change. Era-gated substances prevent anachronism. State response modeled on three empirical approaches: criminalization (US War on Drugs — high incarceration, low efficacy), decriminalization (Portugal 2001 — reduced usage, improved health outcomes), harm reduction (Switzerland, Netherlands — reduced mortality, stable usage). Cross-civ weaponization models Opium Wars (Britain → Qing China). Based on Case & Deaton (2015) "deaths of despair" framework.

**Generational Value Shifts.** Implements Inglehart's (1971, 1997) post-materialism thesis validated across 100+ countries by World Values Survey. Formative conditions from 2-3 turns prior (representing ~20-30 years) shape cohort values. Security → post-materialist orientation (environment, equality, self-expression). Scarcity → materialist orientation (order, defense, resource extraction). Generational conflict between cohorts contributes to anomie (Mannheim 1928 generational theory).

**Space Program.** Tech ≥ 6 gate. Milestone sequence: satellite → crewed orbit → moon landing → space station → Mars. STEM education boost models documented Apollo effect (Freeman 2006: 50% increase in US STEM PhDs 1960-1975). National prestige/cohesion boost. Failure events with probability scaling. Cost contributes to sovereign debt ratio. Prestige decays without new achievements (post-Apollo decline in NASA public support).

**Religious/Ideological Schism.** Risk accumulates from institutional lock-in + low legitimacy + education (educated populations question orthodoxy) + reform pressure. Three types parallel historical categories: religious (Protestant Reformation 1517, Great Schism 1054, Sunni-Shia split), ideological (Sino-Soviet split, Trotskyism vs Stalinism), ethnic-political (multi-ethnic empire fragmentation). Resolution paths: suppression (short-term stability, long-term trauma accumulation — Counter-Reformation), accommodation (institutional fractionalization — Ottoman millet system), reformation (chaos → renewal → innovation — post-Reformation scientific revolution).

**Diaspora Networks.** Created by emigration events in existing migration system. Effects: remittances (World Bank 2023: $656B to LMICs), knowledge transfer (Saxenian 2006: Silicon Valley Indian/Chinese networks), trade facilitation (Rauch & Trindade 2002: ethnic networks reduce trade barriers), political lobbying in host country. Return migration triggered when origin conditions improve. Modeled on Jewish, Chinese, Indian, Armenian, Irish diaspora patterns.

**Water/Resource Conflict Escalation.** Five-stage model: Cooperation → Tension → Dispute → Confrontation → Conflict. Based on Wolf et al. (2003) Transboundary Freshwater Dispute Database. Upstream civilizations have leverage. Climate warming amplifies all stages (Gleick 2014). Treaty mechanisms can de-escalate (Indus Waters Treaty 1960 survived three India-Pakistan wars). Adjacent civilizations sharing water resources assessed each turn.

### 11.11 Validation and Known Limitations

**Historical scenario testing (Round 5):** 10 scenarios × 3 runs = 30 simulations. Overall structural plausibility: 7.8/10. All 10 scenarios score ≥ 7/10. Seven score ≥ 8/10. New systems produce meaningful differentiation: Rome ends with debt=98 (fiscal collapse), Soviet Union with pressFreedom=21 and schismRisk=39 (ideological rigidity), Scandinavia with pressFreedom=88 and postMaterialism=92 (World Values Survey alignment).

**Out-of-sample validation:** 8 additional scenarios (4 untested historical civilizations + 4 novel configurations) run without any tuning. Novel scenarios (high-tech theocracy, egalitarian market, isolationist commune, military autocracy) produced plausible and differentiated results. Historical scenarios (Tokugawa Japan, Mughal India, Venetian Republic, Ptolemaic Egypt) revealed a convergence limitation: authoritarian configurations not represented in the original 10 scenarios tend toward similar collapse trajectories regardless of their distinct starting conditions.

**Interpretation:** The model is strongest within the parameter space represented by its 10 development scenarios and generalizes well to novel *combinations* of known parameters. It is weaker at differentiating subtypes of authoritarian governance that were not explicitly tested. This is a known limitation of rule-based models with finite calibration data.

### 11.12 Remaining Known Simplifications
- Economic model multipliers for resource depletion (market 1.3-1.4× vs gift 0.5-0.7×) still embed structural assumptions. Ideally these would be fully behavior-driven.
- Immigration is inter-civ only; internal migration not modeled separately.
- Pandemics are single events; no modeling of endemic disease evolution or antibiotic resistance.
- Authoritarian subtypes (feudal, theocratic, military, bureaucratic) share decay dynamics that should be more differentiated.
- Space colonization is deliberately excluded — too speculative for structural plausibility tool.
- Bottom-up economic restructuring models the transition as a spectrum (partial adoption) with friction and feedback loops, not a binary switch. The individual components (diffusion curves, coordination costs, governance response, supply chain disruption) are well-studied; their exact combination at national scale in a voluntary currency-abandonment scenario is interpolated from validated sub-models rather than directly observed.

### 11.13 Bottom-Up Economic Restructuring

Models bottom-up economic transitions where populations restructure their economy through collective action, bypassing governance. A dual economy emerges during transition; adoption follows Rogers' S-curve; coordination costs follow Ostrom's commons dynamics; governance adapts per selectorate theory. Five scaling models provide coordination at national scale: Polycentric Governance (Ostrom), Democratic Confederalism (Rojava/Ocalan), Liquid Democracy, adapted People's Congress System (Jamahiriya, with Ostrom safeguards, excluding the historical shadow-state), and Participatory Planning (Parecon). Five structural movement presets: Currency Refusal, Cooperative Production, Commons Reclamation, Direct Exchange Network, and Workers' Self-Management. Financial system (Minsky cycle, financial depth, debt) scales down with the formal economy share and reaches zero in currencyless economies. Taxation ceases post-transition — resources are accessed directly. Coordination instability replaces Minsky as the ongoing stability risk.

*This document describes civ-sim as of March 2026. The simulation models ~130+ state variables across 13 domains connected by ~220 cross-system feedback loops, with 36 cumulative model enhancements across 6 rounds of development plus the bottom-up restructuring feature.*
