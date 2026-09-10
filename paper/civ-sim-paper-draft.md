# civ-sim: A Bias-Aware Macro-Level Civilization Simulation with Multi-Level Validation

**Author:** Barak Water

**Abstract**

We present civ-sim, an open-source simulation framework for modeling the co-evolution of civilizational subsystems across economic, governance, social, demographic, environmental, and cultural domains. The framework tracks approximately 130 state variables per civilization connected by approximately 250 empirically grounded feedback loops, with 9 non-hierarchical economic models and 15 governance models. A central design principle is the explicit avoidance of teleological assumptions: no governance or economic form is coded as inherently superior, and emergent outcomes arise from mechanism interaction rather than embedded value judgments. We validate the framework through a six-level protocol comprising uncertainty quantification across 12 country profiles (28-36% interval coverage), hindcasting against four 30-70 year historical trajectories (71-76% waypoint accuracy), cross-validation with stripped initial conditions (75% generalization), sensitivity analysis, robustness testing, and regression invariants. A counterfactual analysis engine enables controlled comparison of divergent trajectories from common starting points. We discuss the framework's structural limitations, including conservation-of-error dynamics in tightly coupled systems and a practical ceiling of approximately 55-60% of real-world dynamics at the macro level. The complete source code, validation suite, and documentation following the ODD+D protocol are publicly available.

**Keywords:** agent-based modeling, civilization simulation, computational social science, bias-aware modeling, validation, counterfactual analysis, ODD protocol

---

## 1. Introduction

Computational models of societal dynamics serve two distinct purposes: prediction and structured reasoning about complex interactions. While the first demands quantitative precision that remains largely beyond the state of the art for civilizational-scale systems (Epstein 2008), the second offers immediate value as a tool for exploring how interconnected mechanisms produce emergent outcomes (Axelrod 1997; Gilbert and Troitzsch 2005).

Most existing models of societal dynamics focus on individual domains: the DICE model captures climate-economy interactions (Nordhaus 2017), Minsky-type models address financial instability (Keen 2011), and Acemoglu and Robinson's (2012) framework explains institutional divergence. Integrative models that span multiple domains exist (Turchin et al. 2018; Cederman 1997) but typically embed assumptions about civilizational trajectories that reflect the cultural context of their creators rather than empirical universals.

A persistent challenge in this space is what we term *implicit teleology*: the assumption that societal development follows a directional path, typically toward Western liberal-democratic market economies. This assumption appears not as an explicit axiom but as asymmetric modeling choices: democratic transitions coded with lower barriers than reversals, market economies given inherent efficiency advantages, or corruption operationalized as deviation from a governance ideal rather than as a structural feature of power concentration (Rothstein 2011; Mungiu-Pippidi 2015).

civ-sim addresses this by treating the absence of arbitrary assumptions as a binding design constraint rather than an aspiration. Every mechanism requires an empirical or mathematical basis. No governance or economic model is ranked relative to others. Emergent stagnation in theocracies, for example, arises from modeled innovation suppression and reduced epistemic diversity, not from a coded "theocracy penalty." This approach extends to fiscal and monetary policy (not limited to historical precedent or imposed on currencyless models), wealth dynamics (modeled as multiplicative processes following Piketty's r > g rather than additive accumulation), and development pathways (no assumed convergence toward any particular model).

This paper describes the framework's architecture, its empirical grounding, the six-level validation protocol we developed to test it, and the counterfactual analysis tools that make it useful for structured exploration of policy interventions and historical contingencies.

## 2. Related Work

### 2.1 Agent-Based Modeling Platforms

General-purpose ABM platforms including NetLogo (Wilensky 1999), MASON (Luke et al. 2005), and Repast (North et al. 2013) provide infrastructure for building social simulations but leave domain modeling to the user. civ-sim differs in providing an integrated domain model rather than a modeling language.

### 2.2 Civilization-Scale Models

Turchin's (2003; 2006) cliodynamic models formalize historical dynamics through secular cycles and asabiyyah (social cohesion), validated against the Seshat Global History Databank. Cederman's (1997) GeoSim models state formation and conflict through territorial interaction. Epstein and Axtell's (1996) Sugarscape demonstrates how macro-level patterns emerge from micro-level agent rules. These models each capture specific dynamics with depth; civ-sim trades depth in any single domain for breadth of cross-domain interaction, motivated by the observation that civilizational outcomes are frequently driven by interactions between domains (e.g., environmental stress triggering economic crisis triggering governance change) rather than dynamics within any one domain.

### 2.3 Domain-Specific Models

civ-sim draws on established domain models as mechanism sources rather than reimplementing them. Key influences include: the DICE climate model (Nordhaus 2017) for carbon cycle and warming dynamics; Minsky's (1986) financial instability hypothesis for endogenous economic crises; Piketty's (2014) r > g framework for wealth concentration dynamics; Lanchester's (1916) laws for military engagement; the democratic peace theory (Russett 1993) for inter-civilization conflict propensity; Caldwell's (1976) framework for demographic transition; and Acemoglu and Robinson's (2012) inclusive/extractive institutional framework for governance-prosperity feedback loops.

### 2.4 Bias in Computational Models

Oreskes et al. (1994) established that verification of numerical models of natural systems is impossible; validation is necessarily partial. More recently, O'Sullivan et al. (2016) and Saltelli et al. (2020) have drawn attention to how modeler assumptions propagate through complex models, often unrecognized. The modernization theory embedded in many development models (Rostow 1960) has been critiqued as culturally specific rather than universal (Sen 1999; Escobar 2011). civ-sim responds to this literature by making all assumptions explicit, documented, and testable, and by treating GDP growth and similar metrics as outputs to be evaluated rather than proxies for wellbeing.

## 3. Design Principles

Five principles constrain all modeling decisions in civ-sim:

**P1. No teleology.** No governance model, economic system, or cultural configuration is coded as inherently superior or as a developmental endpoint. The framework includes 9 economic models (from subsistence and gift economies through market, planned, and cooperative models) and 15 governance models (from tribal councils through theocracies, democracies, and one-party states). Transitions between models are driven by internal pressures and external conditions, not by a civilizational "development score."

**P2. Mechanisms, not outcomes.** Behavioral outcomes emerge from interaction of modeled mechanisms. If a particular governance type consistently produces stagnation in the simulation, this must arise from the interaction of empirically grounded mechanisms (e.g., suppressed innovation tolerance, reduced epistemic diversity, concentration of decision-making), not from a direct governance-type-to-outcome mapping.

**P3. Empirical grounding.** Every feedback loop and coefficient requires a cited empirical or mathematical basis. Coefficients carry confidence tiers: M (directly measured from data), I (inferred from related empirical findings), or T (theoretically motivated). Approximately 60% of the model's 250+ feedback parameters are tier M or I.

**P4. Multidisciplinary integration.** The model draws on neurological, psychological, sociological, and behavioral science alongside the political science and economics that dominate existing models. This includes power-induced empathy suppression (Keltner 2016), anomie dynamics (Durkheim 1897; Merton 1938), social identity and intergroup conflict (Tajfel and Turner 1979), and collective action thresholds (Granovetter 1978).

**P5. Transparency over precision.** Honest reporting of limitations takes priority over favorable validation scores. The model's coverage estimate of approximately 55-60% of real-world civilizational dynamics is stated explicitly, as is the breakdown of what the remaining gap consists of (individual agency, contingent leadership effects, cultural specifics not capturable at macro scale).

## 4. Model Description

We follow the ODD+D protocol (Muller et al. 2013) for model documentation. The full protocol document accompanies the source code; here we summarize the essential structure.

### 4.1 Entities and State Variables

The primary entity is the *civilization*, a macro-level aggregate representing a politically coherent society occupying contiguous territory. Each civilization maintains approximately 130 state variables organized across 13 domains: economy (production capacity, trade openness, wealth concentration, Gini coefficient, financial stability), governance (model type, hierarchy level, corruption, rule of law, state capacity, legitimacy), social structure (trust, polarization, anomie, equality, mobility), culture (epistemic health, media environment, cultural knowledge), demographics (population, urbanization, age structure via companion module), environment (carbon emissions, deforestation, soil quality, biodiversity), technology (38-advance branching tree), infrastructure, psychology (collective trauma, empathy gradients), organized crime, religion, public health, and energy systems.

Five social strata (elite, upper-middle, lower-middle, working, disenfranchised) are modeled with per-stratum metrics for empathy, prosocial behavior, political power, satisfaction, and wellbeing. The companion demographics module disaggregates each stratum by sex across 17 age cohorts (0-4 through 80+), enabling modeling of demographic transitions, sex-disaggregated education and labor force effects, and age-structure-driven social dynamics.

### 4.2 Process Overview and Scheduling

Each simulation turn represents 5-50 years depending on the historical era. Per-civilization processing comprises 83 methods organized in 26 groups, executed in a fixed sequence designed to respect causal ordering. The sequence begins with economic production and trade, proceeds through governance dynamics, social processes, demographic changes, environmental effects, and technological development, and concludes with recovery mechanisms and enforcement of structural bounds.

Eight global processes follow per-civilization processing: climate change (simplified DICE model), territorial expansion (following Turchin's frontier dynamics), inter-civilization interactions (diplomacy, trade, cultural exchange), migration (brain drain, refugees, economic migration, diaspora networks), trade network effects, conflict (Kantian tripod framework combined with Lanchester attrition), era transitions, and event generation.

### 4.3 Key Mechanisms

We highlight several mechanisms that illustrate the model's approach:

**Wealth concentration** follows multiplicative dynamics: returns on existing wealth compound faster than wage growth (Piketty 2014), creating a self-reinforcing accumulation process that institutional quality and redistributive policy can moderate but not eliminate. The Great Gatsby Curve relationship between inequality and social mobility is modeled empirically.

**Corruption** is treated as a structural feature of power concentration rather than a governance failure. Power concentration naturally generates rent-seeking opportunities; the question is whether institutional structures (accountability, transparency, rule of law) create sufficient counterpressure. An authoritarian anti-corruption pathway models the empirically observed capacity of developmental states (Singapore, South Korea under Park, Rwanda under Kagame) to suppress corruption through state capacity without democratic accountability, subject to the limitation that such suppression depends on regime priorities and is reversible.

**Power-empathy dynamics** operationalize findings from social neuroscience (Keltner 2016; Hogeveen et al. 2014) showing that power reduces empathic accuracy. This gradient operates across the five social strata, with suppression approximately twice as fast as recovery, creating asymmetric dynamics: concentrated power rapidly erodes elite empathy, while power diffusion slowly rebuilds it.

**Financial instability** follows Minsky's (1986) hypothesis: stability breeds complacency, which breeds risk-taking, which breeds instability. Credit expansion during periods of stability endogenously generates the conditions for financial crisis, rather than crises being exogenous random shocks. This mechanism applies only to economic models with financial markets; currencyless and gift economies are not subjected to Minsky cycles.

**Demographic transition** in the companion module detects and models the stages of demographic transition from observed fertility and mortality patterns (Caldwell 1976), including sex-disaggregated effects of female education on fertility reduction and the economic consequences of age structure shifts.

### 4.4 Submodels

The companion module provides micro-founded demographic and social stratification dynamics that interact bidirectionally with the main simulation. Strata mobility feeds into wealth concentration dynamics; strata satisfaction feeds into social trust; information diffusion (modeled as network-approximated contagion through a small-world topology) feeds into media polarization; and collective action potential feeds into stability calculations.

Environmental subsystems model carbon cycle dynamics (atmospheric CO2, surface and deep ocean temperature, four tipping points), biodiversity (species-area relationships), ocean health, soil degradation (with deforestation-carbon and soil-carbon feedbacks), and environmental impact scaled by economic intensity.

## 5. Validation Framework

Following the recommendation that complex models require multiple complementary validation approaches (Windrum et al. 2007; Fagiolo et al. 2019), we employ a six-level validation protocol.

### 5.1 Level 1: Uncertainty Quantification

For each of 12 country profiles (Denmark, USA, China, Singapore, Brazil, Nigeria, Saudi Arabia, Russia, Japan, Germany, India, South Korea), we run N=20 seeds and compute the p10-p90 interval for three target metrics: social trust, wealth concentration, and corruption. A target is "covered" if the real-world value falls within this interval.

**Results:** 10-13 of 36 targets covered (28-36%), with variation across runs due to residual non-deterministic code paths. Corruption is best covered (7/12 countries), wealth concentration moderate (4/12), and social trust worst (2/12). The narrow UQ intervals (reflecting low structural variance in the model) mean that many near-misses exist: 8 additional targets fall within 5 points of the interval boundary.

We characterize this as honest but modest. The narrow intervals indicate that the model's variance is lower than real-world variance, suggesting missing stochastic mechanisms rather than systematic bias. Widening intervals artificially (e.g., by adding noise) would inflate coverage without improving the model.

### 5.2 Level 2: Hindcasting

Four historical trajectories provide temporal validation:
- **South Korea 1960-2010** (developmental state to democracy): 11 waypoints testing industrialization, democratization, education expansion, and crisis recovery. Score: 6-7/11 (55-64%).
- **Chile 1970-2000** (democracy-coup-recovery): 7 waypoints testing democratic collapse, authoritarian consolidation, and democratic restoration. Score: 6/7 (86%).
- **Russia 1985-2015** (Soviet collapse and aftermath): 11 waypoints testing institutional collapse, oligarchic capture, and authoritarian consolidation. Score: 7/11 (64%).
- **Rwanda 1990-2020** (genocide and reconstruction): 9 waypoints testing state collapse, developmental rebuilding, and post-conflict recovery. Score: 7/9 (78%).

**Aggregate:** 26-29 of 38 waypoints (68-76%), with variance across runs. Chile's simpler trajectory (single major shock with recovery) scores highest; South Korea's complex multi-phase transition is most challenging.

### 5.3 Level 3: Cross-Validation

Leave-one-out cross-validation tests whether country-specific behaviors emerge from mechanisms or from initial condition overrides. For each of 8 calibration countries, we run the simulation with scenario-specific initial conditions ("Full") and with only configuration-derived defaults ("Strip"), comparing final-state error against real-world targets.

A metric "generalizes" if the stripped-config error remains within 15 points of the target. **Results:** 27/36 metrics (75%) generalize, 6/36 (17%) partially generalize (error 15-25), and 3/36 (8%) show overfitting (error > 25). This indicates that the model's mechanisms, not its initial conditions, are doing most of the explanatory work.

### 5.4 Levels 4-6: Robustness, Held-Out, and Invariants

**Held-out validation** (8 scenarios never used during development) scores 68.2%. **Robustness testing** shows 92/120 outputs (77%) with coefficient of variation below 15% across seed ensembles. **Regression invariants** (13 structural checks including "democracies never have corruption above 95" and "environmental collapse triggers wellbeing decline") pass at 100%.

### 5.5 Counterfactual Diagnostics

A seven-country counterfactual diagnostic provides additional model characterization. For each country, we run a baseline and six modified variants (adjusting corruption, trust, institutional quality, state capacity, wealth concentration) and measure whether modifications to initial conditions bridge the gap between simulated and real-world outcomes.

Results reveal three categories: *near-perfect fit* (China, error 4.9), *good fit with identifiable gaps* (Russia 12.7, Nigeria 18.4), and *structural mismatch* (USA 34.5, Germany 39.8, Singapore 52.3). Germany's gap reduces 85% with initial condition tuning, indicating a mapping problem rather than a missing mechanism. Singapore's gap reduces only 19% even with mid-simulation event injection, indicating architectural limitations in modeling city-state dynamics.

## 6. Case Study: Counterfactual Analysis

The counterfactual engine implements a "git branching" metaphor for civilization trajectories. Users can:

1. **Snapshot** the complete simulation state at any point
2. **Fork** from a snapshot with specified modifications (per-civilization state changes, climate parameter adjustments, or structural event injections)
3. **Run forward** the modified fork for a specified number of turns
4. **Compare** baseline and forked trajectories across all tracked metrics

This enables controlled experiments that isolate the effect of specific changes. For example, to test whether Singapore's low corruption is primarily driven by state capacity or by anti-corruption enforcement, a researcher can snapshot a Singapore-configured simulation, fork it with reduced state capacity, and observe whether corruption rises — and if so, through which pathway and at what rate.

The custom event system extends this with 12 preset event types and 20 parameter sliders across economic, governance, social, environmental, and structural domains. Events can be applied to individual civilizations at any point during a simulation run, enabling mid-trajectory policy intervention experiments.

## 7. Discussion

### 7.1 Strengths

The framework's primary contribution is demonstrating that a multi-domain civilization simulation can be built without embedding teleological assumptions about civilizational development. The 75% cross-validation generalization rate suggests that emergent behavior arises from mechanism interaction rather than from initial condition programming.

The explicit documentation of all assumptions (following ODD+D), honest reporting of modest validation scores, and public availability of all source code and validation infrastructure lower the barrier for critical evaluation and replication.

### 7.2 Limitations

**Conservation of error.** In a tightly coupled system with approximately 250 feedback loops, improving accuracy on one metric frequently redistributes error to coupled metrics rather than reducing total error. This phenomenon, observed repeatedly during development, suggests a structural ceiling on accuracy achievable through parameter tuning alone.

**Macro-level abstraction.** The model operates at the civilization level without individual agents. This precludes modeling leadership effects, grassroots social movements with specific organizational structure, or distributional dynamics below the five-stratum approximation. The companion module's demographic disaggregation partially addresses this but remains aggregated relative to true agent-based approaches.

**Coverage gap.** Our estimate of approximately 55-60% coverage of real-world civilizational dynamics is based on systematic enumeration of modeled versus unmodeled mechanisms. Major unmodeled factors include: individual leadership and decision-making, detailed military strategy, cultural production and soft power, detailed financial market microstructure, and fine-grained geographic effects beyond the terrain/climate/resource classification.

**Reproducibility.** Residual calls to the non-seeded random number generator in some code paths introduce minor run-to-run variance. A deterministic mode that routes all stochastic calls through the seeded PRNG is in development.

### 7.3 Avoiding Implicit Bias

The principle of bias avoidance requires ongoing vigilance rather than a one-time design decision. During development, we identified and corrected several instances of implicit bias: GDP growth initially used as a wellbeing proxy (corrected to model wellbeing through health, education, social connection, and environmental quality channels), Minsky financial cycles initially applied to all economic models including currencyless systems (corrected to apply only where relevant), and fiscal policy options initially constrained to historically observed policy sets (corrected to allow novel configurations).

We note that the model's creators inevitably bring cultural perspective to modeling choices, and invite scrutiny of assumptions we may have failed to identify. The complete assumption inventory in the accompanying MODELING_ASSUMPTIONS document is intended to facilitate this scrutiny.

## 8. Conclusion

civ-sim demonstrates that multi-domain civilization simulation can be conducted with explicit empirical grounding and without embedded teleological assumptions. The framework's validation scores are modest by the standards of narrow domain models but represent honest performance measurement rather than optimistic self-assessment. The counterfactual analysis tools provide immediate practical value for structured reasoning about policy interventions and historical contingencies.

Future work includes completing the deterministic reproducibility mode, expanding the hindcast scenario library, developing a plugin architecture for community-contributed domain modules, and exploring hybrid approaches that combine macro-level dynamics with selective agent-level modeling for specific domains.

The complete source code, validation suite, ODD+D protocol documentation, and model diagnostics log are available at the project repository under an open-source license.

## References

Acemoglu, D. and Robinson, J.A. (2012). *Why Nations Fail: The Origins of Power, Prosperity, and Poverty*. Crown Business.

Axelrod, R. (1997). *The Complexity of Cooperation: Agent-Based Models of Competition and Collaboration*. Princeton University Press.

Caldwell, J.C. (1976). Toward a restatement of demographic transition theory. *Population and Development Review*, 2(3-4), 321-366.

Cederman, L.E. (1997). *Emergent Actors in World Politics: How States and Nations Develop and Dissolve*. Princeton University Press.

Durkheim, E. (1897). *Le Suicide*. Felix Alcan.

Epstein, J.M. (2008). Why model? *Journal of Artificial Societies and Social Simulation*, 11(4), 12.

Epstein, J.M. and Axtell, R. (1996). *Growing Artificial Societies: Social Science from the Bottom Up*. MIT Press.

Escobar, A. (2011). *Encountering Development: The Making and Unmaking of the Third World*. Princeton University Press.

Fagiolo, G., Guerini, M., Lamperti, F., Moneta, A. and Roventini, A. (2019). Validation of agent-based models in economics and finance. In *Computer Simulation Validation*, pp. 763-787. Springer.

Gilbert, N. and Troitzsch, K.G. (2005). *Simulation for the Social Scientist*. Open University Press.

Granovetter, M. (1978). Threshold models of collective behavior. *American Journal of Sociology*, 83(6), 1420-1443.

Hogeveen, J., Inzlicht, M. and Obhi, S.S. (2014). Power changes how the brain responds to others. *Journal of Experimental Psychology: General*, 143(2), 755-762.

Keltner, D. (2016). *The Power Paradox: How We Gain and Lose Influence*. Penguin.

Keen, S. (2011). *Debunking Economics*. Zed Books.

Lanchester, F.W. (1916). *Aircraft in Warfare: The Dawn of the Fourth Arm*. Constable.

Luke, S., Cioffi-Revilla, C., Panait, L., Sullivan, K. and Balan, G. (2005). MASON: A multiagent simulation environment. *Simulation*, 81(7), 517-527.

Merton, R.K. (1938). Social structure and anomie. *American Sociological Review*, 3(5), 672-682.

Minsky, H.P. (1986). *Stabilizing an Unstable Economy*. Yale University Press.

Muller, B., Bohn, F., Drebler, G., Groeneveld, J., Successive, C., Hohmann, N., Jeltsch, F., Gobel, R., Schmitz, O., and Revised by Grimm, V. (2013). Describing human decisions in agent-based models--ODD+D, an extension of the ODD protocol. *Environmental Modelling & Software*, 48, 37-48.

Mungiu-Pippidi, A. (2015). *The Quest for Good Governance: How Societies Develop Control of Corruption*. Cambridge University Press.

Nordhaus, W.D. (2017). Revisiting the social cost of carbon. *Proceedings of the National Academy of Sciences*, 114(7), 1518-1523.

North, M.J., Collier, N.T., Ozik, J., Tatara, E.R., Macal, C.M., Bragen, M. and Sydelko, P. (2013). Complex adaptive systems modeling with Repast Simphony. *Complex Adaptive Systems Modeling*, 1(1), 3.

Oreskes, N., Shrader-Frechette, K. and Belitz, K. (1994). Verification, validation, and confirmation of numerical models in the earth sciences. *Science*, 263(5147), 641-646.

O'Sullivan, D., Evans, T., Manson, S., Metcalf, S., Ligmann-Zielinska, A. and Bone, C. (2016). Strategic directions for agent-based modeling: avoiding the YAAWN syndrome. *Journal of Land Use Science*, 11(2), 177-187.

Piketty, T. (2014). *Capital in the Twenty-First Century*. Harvard University Press.

Rostow, W.W. (1960). *The Stages of Economic Growth: A Non-Communist Manifesto*. Cambridge University Press.

Rothstein, B. (2011). *The Quality of Government: Corruption, Social Trust, and Inequality in International Perspective*. University of Chicago Press.

Russett, B. (1993). *Grasping the Democratic Peace*. Princeton University Press.

Saltelli, A., Bammer, G., Bruno, I., Charters, E., Di Fiore, M., Didier, E., ... and Vineis, P. (2020). Five ways to ensure that models serve society: a manifesto. *Nature*, 582(7813), 482-484.

Sen, A. (1999). *Development as Freedom*. Knopf.

Tajfel, H. and Turner, J.C. (1979). An integrative theory of intergroup conflict. In *The Social Psychology of Intergroup Relations*, pp. 33-47.

Turchin, P. (2003). *Historical Dynamics: Why States Rise and Fall*. Princeton University Press.

Turchin, P. (2006). *War and Peace and War: The Rise and Fall of Empires*. Plume.

Turchin, P., Currie, T.E., Whitehouse, H., Francois, P., Feeney, K., Mullins, D., ... and Spencer, C. (2018). Quantitative historical analysis uncovers a single dimension of complexity that structures global variation in human social organization. *Proceedings of the National Academy of Sciences*, 115(2), E144-E151.

Wilensky, U. (1999). NetLogo. Center for Connected Learning and Computer-Based Modeling, Northwestern University.

Windrum, P., Fagiolo, G. and Moneta, A. (2007). Empirical validation of agent-based models: Alternatives and prospects. *Journal of Artificial Societies and Social Simulation*, 10(2), 8.
