# Historical Scenario Configuration Guide

**civ-sim** | Structural analogs of documented civilizations

---

## How to Use This Guide

These scenarios are **structural analogs**, not literal recreations. civ-sim models aggregate dynamics, not specific historical events. The goal is to configure starting conditions that approximate the structural features of a historical period, run the simulation, and observe whether the model produces trajectories that are **structurally plausible** — meaning the causal chains and outcome patterns match what researchers observe in the historical record, even if specific magnitudes differ.

### Setup Process
1. Start civ-sim and begin the setup wizard
2. At each wizard step, select the values listed for the scenario
3. At Step 10 (Policy Configuration), override any auto-derived defaults with the values specified
4. Note the research seed (Research Panel > Export tab) for reproducibility
5. Run for the specified number of turns
6. Compare outcomes against the "What to Look For" criteria

### Important Caveats
- civ-sim starts all civilizations in a Bronze Age equivalent. Scenarios set for later periods should be understood as "if a civilization with these structural features existed from early development, where would it end up?"
- The simulation does not model specific historical events (the assassination of Caesar, the Black Death). It models the structural conditions that make such events likely or unlikely.
- Turn count is approximate. Each turn represents a variable historical period; 200-300 turns covers roughly the full arc from early development through industrialization.
- All scenarios start at Demographic Transition Stage 1 by default. The transition should emerge from the configured conditions.

---

## Scenario 1: Late Roman Republic / Early Empire

**Historical analog**: Rome, ~200 BCE - 200 CE
**Structural theme**: Oligarchic capture, military expansion, institutional erosion, wealth concentration spiral

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Oligarchic |
| Economy | Market Capitalist |
| Religion Presence | Plurality of Religions |
| Religion Propagation | Communal |
| Religion Tolerance | Indifferent |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Mixed Public-Private | Public baths/aqueducts for elites, minimal for poor |
| Healthcare Emphasis | Treatment | Roman medicine was curative, not preventive |
| Resource Strategy | Extraction for Growth | Conquest-driven resource extraction |
| Information Ecosystem | Free Market Media | Public forums, competing rhetoric, no state monopoly on information (early Republic) |
| Education Access | Free Basic, Expensive Higher | Basic literacy widespread; rhetoric/philosophy for elites |
| Education Quality | 45 | Practical education, limited scientific method |
| Women's Rights | Minimal | Legal subordination with some property rights |
| Family Structure | Extended Family | Paterfamilias, multi-generational households |
| Reproductive Health | Restricted | Limited contraception, high infant mortality |
| Family Size Policy | Large Encouraged | Pro-natalist (lex Iulia) |
| Science Freedom | 40 | Practical engineering valued; pure science less so |
| Trade Openness | 25 (moderate tariffs) | Mediterranean trade but with tribute systems |

### Run Parameters
- **Duration**: 250 turns
- **Events to trigger manually**: None required — the oligarchic spiral, military expansion, and institutional erosion should emerge from structural conditions

### What to Look For (Structurally Plausible Results)

**By turn 50-80:**
- Wealth concentration rising steadily (should exceed 60)
- Wealth capture degree climbing (institutional + electoral channels)
- Military power high (60+), civilian control declining
- Social trust eroding (should drop below 50)
- Inequality widening despite economic growth

**By turn 100-150:**
- Consequence deficit acceleration visible
- Institutional quality declining despite high state capacity
- Legitimacy type shifting (traditional → charismatic or failing)
- Youth bulge instability if population growth outpaces mobility
- Possible coup event or governance crisis

**By turn 150-250:**
- Feudal dynamic risk (wealth capture > 80 + wealth concentration > 75)
- Institutional lock-in at high levels
- Epistemic health declining under captured media
- Demographic transition may begin (Stage 1 → 2) if sanitation/infrastructure develops
- Possible civilization collapse or governance transition

**Red flags (model not working well):**
- Wealth concentration stays flat or declines without active reform
- Military never grows despite oligarchic/market configuration
- No institutional quality erosion despite high wealth capture

---

## Scenario 2: Song Dynasty China (960-1279 CE)

**Historical analog**: Northern/Southern Song, ~960-1279 CE
**Structural theme**: Near-industrialization, high urbanization, technological sophistication, bureaucratic governance, eventual external conquest vulnerability

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Autocratic |
| Economy | Mixed Economy |
| Religion Presence | Plurality of Religions |
| Religion Propagation | Passive |
| Religion Tolerance | Accepting |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Mixed Public-Private | State physicians + private practice |
| Healthcare Emphasis | Balanced | Both preventive (hygiene texts) and curative |
| Resource Strategy | Balanced Stewardship | Irrigation systems, managed agriculture |
| Information Ecosystem | State-Guided | Imperial examination system, controlled printing |
| Education Access | Universal Lower | Examination system open in theory; expensive in practice |
| Education Quality | 60 | High literary/bureaucratic; strong engineering |
| Women's Rights | Minimal | Foot binding era; declining from Tang-era openness |
| Family Structure | Extended Family | Confucian multigenerational households |
| Reproductive Health | Restricted | Limited formal reproductive health |
| Family Size Policy | Large Encouraged | Confucian filial piety, ancestral continuity |
| Science Freedom | 55 | Printing, gunpowder, compass — but state-directed |
| Science Freedom Constraint | Government | Imperial direction of research priorities |
| Trade Openness | 20 (moderate) | Maritime trade but with state control |

### Run Parameters
- **Duration**: 200 turns
- **Watch for**: Whether urbanization, technology, and economic growth advance significantly despite autocratic governance

### What to Look For (Structurally Plausible Results)

**By turn 50-80:**
- Urbanization rising (should reach 40-50)
- Infrastructure developing (state investment)
- State capacity high (60+) due to bureaucratic governance
- Economic output growing but wealth moderately concentrated
- Science advancing despite government constraint

**By turn 100-150:**
- High urbanization (potentially 50-60) but demographic pressure
- Technology advancing but innovation constrained by government direction
- Social mobility moderate (examination system provides some upward path)
- Institutional lock-in growing (bureaucratic rigidity)
- Military power moderate — civilian control moderate to high

**By turn 150-200:**
- Test whether the model produces a "high development ceiling" — advancement that plateaus
- State capacity potentially declining under bureaucratic lock-in
- Possible demographic transition beginning (Stage 1 → 2) from sanitation/food improvements
- Key question: does the model show how autocratic governance + state-directed science can produce high development that stalls?

**Red flags:**
- No urbanization growth despite mixed economy
- State capacity collapses early (should be sustained by bureaucratic governance)
- Science freedom remains stuck at low levels despite high education quality

---

## Scenario 3: Haudenosaunee (Iroquois) Confederacy

**Historical analog**: Haudenosaunee, ~1450-1750 CE
**Structural theme**: Consensus governance, gender-balanced power, sustainable resource use, high social cohesion, resistance to hierarchy

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Flat Consensus |
| Economy | Gift Economy |
| Religion Presence | Animist / Folk Traditions |
| Religion Propagation | Communal |
| Religion Tolerance | Accepting |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Minimal / Traditional | Herbal medicine, spiritual healing |
| Healthcare Emphasis | Prevention | Preventive practices, sweat lodges, dietary knowledge |
| Resource Strategy | Conservation | Sustainable forestry, rotation farming |
| Information Ecosystem | Open Civic | Oral tradition, open council debate |
| Education Access | Universal | Oral tradition transmitted to all |
| Education Quality | 35 | Practical/ecological knowledge; no written tradition |
| Women's Rights | Full Parity | Clan mothers selected chiefs, controlled property |
| Family Structure | Community / Clan | Longhouse communal living, matrilineal clans |
| Reproductive Health | Available | Herbal contraception, midwifery traditions |
| Family Size Policy | Neutral | Individual/clan choice |
| Science Freedom | 50 | Free inquiry within oral tradition |
| Trade Openness | 15 (low tariffs) | Inter-tribal trade, wampum exchange |

### Run Parameters
- **Duration**: 200 turns
- **Events to trigger**: None — structural conditions should produce stability

### What to Look For (Structurally Plausible Results)

**By turn 50-100:**
- High social trust (should stay above 60)
- Low wealth concentration (should stay below 30)
- High gender equity (should reach 65+)
- Low institutional lock-in (consensus governance resists rigidity)
- Slow economic growth but high wellbeing
- Low anomie (community/clan structure buffers)
- Equality index high (60+)

**By turn 100-200:**
- Sustained stability without military expansion
- Wealth concentration remains low — gift economy + flat consensus resist accumulation
- Population growth slow but steady
- No wealth capture spiral (no institutional channels for capture)
- Social mobility high (no caste, no rigid stratification)
- Key question: does the model show how egalitarian governance trades growth speed for stability and wellbeing?

**Structural contrast with Scenario 1:**
- Rome: high growth, high capture, eventual collapse risk
- Haudenosaunee: lower growth, sustained wellbeing, structural resilience

**Red flags:**
- Wealth concentrates despite gift economy + flat consensus
- Social trust collapses without structural cause
- Military power grows significantly (should stay low)

---

## Scenario 4: British Industrial Revolution

**Historical analog**: Britain, ~1760-1900 CE
**Structural theme**: Demographic transition, energy transition, urbanization surge, wealth concentration with partial democratization, environmental degradation

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Representative |
| Economy | Market Capitalist |
| Religion Presence | Dominant Religion (with minorities) |
| Religion Propagation | Missionary |
| Religion Tolerance | Restrictive |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Mixed Public-Private | Charity hospitals + private physicians; Poor Law provisions |
| Healthcare Emphasis | Treatment | Curative medicine dominated until late 19th century |
| Resource Strategy | Extraction for Growth | Coal-driven industrialization |
| Information Ecosystem | Free Market Media | Relatively free press but profit-driven |
| Education Access | Free Basic, Expensive Higher | Elementary education expanding; universities for elites |
| Education Quality | 55 | Rising scientific literacy, Royal Society tradition |
| Women's Rights | Minimal | Coverture laws; slow reform through the period |
| Family Structure | Nuclear Family | Industrial nuclear family replacing agrarian extended |
| Reproductive Health | Restricted | Victorian era reproductive health taboos |
| Family Size Policy | Large Encouraged | Pre-transition; large families economically useful |
| Science Freedom | 65 | Strong tradition of independent inquiry |
| Science Freedom Constraint | Capital | Market-shaped research (profitable applications valued) |
| Trade Openness | 15 (low tariffs) | Free trade ideology (post-Corn Laws) |

### Run Parameters
- **Duration**: 300 turns (long run to observe full demographic transition)
- **Key milestone**: Watch for the energy transition from wood to coal (EROI shift)

### What to Look For (Structurally Plausible Results)

**By turn 50-80 (proto-industrial):**
- Urbanization beginning to climb (20-30)
- Infrastructure developing
- Wealth concentration rising
- Sanitation lagging behind urbanization (this gap is historically critical)

**By turn 80-150 (industrial takeoff):**
- Energy source advancing (wood → coal equivalent)
- EROI increasing with new energy source
- Urbanization accelerating (40-60)
- Demographic transition Stage 1 → Stage 2: mortality dropping while fertility stays high
- Population explosion (rapid growth)
- Disease burden initially worsening (urbanization without adequate sanitation — "urban penalty")
- Wealth concentration spiking (Gilded Age equivalent)
- Environmental degradation visible (resource depletion climbing)

**By turn 150-250 (mature industrial):**
- Sanitation catching up (public health movement)
- Disease burden declining
- Demographic transition Stage 2 → Stage 3: fertility beginning to fall
- Infant mortality declining
- Life expectancy rising
- Wealth capture active but partially constrained by representative governance
- Epistemic health moderate (free press counterbalances capture)

**By turn 250-300 (post-industrial trajectory):**
- Demographic transition approaching Stage 4
- Urbanization high (60+)
- Elderly cohort growing
- Key question: does the model produce the characteristic industrial-era pattern of "things get worse before they get better" (urbanization → disease → sanitation investment → health improvement)?

**Red flags:**
- No urbanization growth despite market economy
- Disease burden never worsens during rapid urbanization (the "urban penalty" should be visible)
- Demographic transition happens too fast (should take 100+ turns)
- Wealth concentration stays flat during industrial takeoff

---

## Scenario 5: Scandinavian Social Democracy

**Historical analog**: Sweden/Norway/Denmark, ~1900-2000 CE
**Structural theme**: High equality, universal services, completed demographic transition, strong institutions, late-stage sustainability challenges

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Representative |
| Economy | Mixed Economy |
| Religion Presence | Plurality of Religions |
| Religion Propagation | Passive |
| Religion Tolerance | Accepting |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Universal Public | Tax-funded universal healthcare |
| Healthcare Emphasis | Prevention | Strong public health tradition |
| Healthcare Incentive | Patient Outcomes | Outcome-based, not profit-driven |
| Resource Strategy | Balanced Stewardship | Environmental awareness, managed forestry/fisheries |
| Information Ecosystem | Open Civic | Free press, public broadcasting, high media literacy |
| Education Access | Universal | Free at all levels including university |
| Education Quality | 80 | High-quality education system |
| Women's Rights | Full Parity | Early suffrage, gender mainstreaming |
| Family Structure | Nuclear Family | Modern nuclear with strong state support |
| Reproductive Health | Scandinavian | Universal, free, fact-based reproductive healthcare |
| Family Size Policy | Neutral | Individual choice with family support policies |
| Sexual Orientation Policy | Full Support | Early LGBTQ+ rights adoption |
| Science Freedom | 80 | Strong research tradition, academic freedom |
| Science Freedom Constraint | None | Free inquiry |
| Trade Openness | 15 (open) | Export-oriented small economies |
| Childcare Norm | Institutional | State-funded daycare |

### Run Parameters
- **Duration**: 250 turns
- **Watch for**: Whether the model can sustain high equality + high wellbeing + economic productivity simultaneously

### What to Look For (Structurally Plausible Results)

**By turn 50-100:**
- Equality index high and rising (should exceed 65)
- Gender equity high (75+)
- Social trust high (70+)
- Epistemic health high (70+)
- Wellbeing rising
- Demographic transition progressing (should reach Stage 2-3)

**By turn 100-200:**
- Demographic transition reaching Stage 3-4
- Life expectancy rising significantly (70+)
- Infant mortality dropping to single digits
- Social mobility high (60+)
- Institutional quality high (65+)
- Wealth concentration moderate (exists but constrained)
- Wealth capture low (strong institutions resist it)

**By turn 200-250 (late-stage challenges):**
- Demographic transition Stage 4-5
- Aging population pressure (elderly cohort rising, dependency ratio climbing)
- State capacity strain from aging (fiscal pressure)
- Below-replacement fertility possible
- Key question: does the model show the "Scandinavian dilemma" — high wellbeing + aging population + fiscal strain?

**Structural contrast with Scenario 4:**
- Britain: rapid industrialization with high inequality, slow welfare development
- Scandinavia: moderated growth with high equality, early welfare, late aging challenge

**Red flags:**
- Equality collapses without structural cause
- Social trust declines despite strong institutions and open media
- Demographic transition never completes (should reach Stage 4-5)
- No aging pressure in late game (below-replacement fertility should cause it)

---

## Scenario 6: Khmer Empire (Angkor)

**Historical analog**: Khmer Empire, ~800-1400 CE
**Structural theme**: Theocratic legitimacy, massive infrastructure (hydraulic civilization), ecological overshoot, population pressure, collapse

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Theocratic |
| Economy | Command / Planned |
| Religion Presence | Theocratic (religion = governance) |
| Religion Propagation | Aggressive |
| Religion Tolerance | Restrictive |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Minimal / Traditional | Temple medicine, herbal traditions |
| Healthcare Emphasis | Treatment | Curative practices at temples |
| Resource Strategy | Government Managed | State-controlled hydraulic infrastructure |
| Information Ecosystem | State-Guided | Temple-controlled information, religious texts |
| Education Access | Limited | Monastic education for elites; oral tradition for masses |
| Education Quality | 35 | High artistic/architectural skill; limited scientific method |
| Women's Rights | Minimal | Patriarchal but with some property rights |
| Family Structure | Extended Family | Agricultural extended families |
| Reproductive Health | Restricted | Limited formal reproductive health |
| Family Size Policy | Large Encouraged | Agricultural labor demand |
| Science Freedom | 25 | Religious constraints on inquiry |
| Science Freedom Constraint | Religion | Temple authority over knowledge |
| Trade Openness | 30 (moderate) | Regional maritime trade |

### Run Parameters
- **Duration**: 300 turns
- **Critical dynamic**: Watch for the infrastructure-ecological overshoot pattern

### What to Look For (Structurally Plausible Results)

**By turn 50-100 (expansion phase):**
- Infrastructure building (state-managed hydraulic system)
- Food security initially improving (irrigation)
- Urbanization moderate (temple cities)
- High caste rigidity (theocratic governance reinforces stratification)
- Institutional lock-in growing
- Legitimacy high (traditional/religious)

**By turn 100-200 (peak and strain):**
- Infrastructure high but maintenance debt growing
- Carrying capacity pressure if population growth continues
- Resource depletion from agricultural intensification
- Ecological overshoot indicators (resource base declining)
- Science constrained by religious authority → limited adaptive capacity
- Gender equity suppressed → fertility stays high longer → population pressure

**By turn 200-300 (decline):**
- Infrastructure maintenance debt exceeds capacity to maintain
- Food security declining (ecological base degraded)
- Possible famine events
- Legitimacy erosion (if material conditions deteriorate, religious legitimacy weakens)
- State capacity declining
- Key question: does the model produce a "hydraulic civilization" trajectory — high infrastructure investment → ecological dependence → environmental change → collapse?

**Red flags:**
- No infrastructure growth despite planned economy + government resource management
- Ecological overshoot never develops (it should under extraction/growth pressures)
- Caste rigidity stays low despite theocratic governance

---

## Scenario 7: Ottoman Empire (Classical Period)

**Historical analog**: Ottoman Empire, ~1453-1700 CE
**Structural theme**: Multi-ethnic imperial governance, military-state complex, religious tolerance (millet system), institutional rigidity, slow reform

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Autocratic |
| Economy | Mixed Economy |
| Religion Presence | Dominant Religion (with minorities) |
| Religion Propagation | Communal |
| Religion Tolerance | Indifferent |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Minimal / Traditional | Bimaristan hospitals for cities; traditional elsewhere |
| Healthcare Emphasis | Balanced | Both curative and preventive traditions |
| Resource Strategy | Balanced Stewardship | State land management (timar system) |
| Information Ecosystem | State-Guided | Imperial control of major narratives; scholars tolerated |
| Education Access | Free Basic, Expensive Higher | Medrese system for religious/legal education |
| Education Quality | 50 | High scholarship tradition but narrow scope |
| Women's Rights | Minimal | Legal subordination with some economic participation |
| Family Structure | Extended Family | Patriarchal extended households |
| Reproductive Health | Restricted | Limited by religious norms |
| Family Size Policy | Large Encouraged | Pro-natalist cultural norms |
| Science Freedom | 45 | Periods of scientific flourishing within religious framework |
| Science Freedom Constraint | Religion | Religious authority over acceptable inquiry |
| Trade Openness | 20 (moderate) | Major trade routes but with guild/state control |

### Run Parameters
- **Duration**: 250 turns
- **Key dynamic**: Multi-ethnic governance stability, military-civilian balance

### What to Look For (Structurally Plausible Results)

**By turn 50-100 (classical peak):**
- State capacity high (centralized bureaucracy)
- Military power high (60+)
- Moderate ethnic fractionalization with stable political inclusion
- Institutional quality moderate to high
- Wealth concentration moderate (state redistributes through land grants)
- Legitimacy high (traditional + charismatic)

**By turn 100-180 (stagnation onset):**
- Institutional lock-in rising (bureaucratic rigidity, timar system ossification)
- Military power potentially declining as military-state complex loses flexibility
- Science constrained by religious framework → limited innovation
- Reform resistance growing (lock-in coefficient increasing)
- Civilian control declining as military factions gain autonomy
- Social mobility decreasing (caste rigidity creeping up)

**By turn 180-250 (reform crisis):**
- Institutional lock-in high (60+)
- State capacity declining
- Military-civilian balance shifting toward military dominance
- Possible coup risk
- Key question: does the model show how strong initial institutions + autocratic governance + religious constraint on science produces peak → stagnation → reform resistance?

**Red flags:**
- Immediate institutional collapse (should be sustained for 100+ turns)
- No institutional lock-in development
- Military never grows to significant levels

---

## Scenario 8: Post-Colonial Sub-Saharan State

**Historical analog**: Composite of post-independence African states, ~1960-2020
**Structural theme**: Weak inherited institutions, ethnic fractionalization challenges, resource extraction pressure, external economic dependence, institutional development vs. capture

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Representative |
| Economy | Mixed Economy |
| Religion Presence | Plurality of Religions |
| Religion Propagation | Communal |
| Religion Tolerance | Accepting |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Minimal / Traditional | Inherited minimal infrastructure |
| Healthcare Emphasis | Treatment | Emergency medicine focus, limited preventive |
| Resource Strategy | Extraction for Growth | Export-oriented resource extraction |
| Information Ecosystem | Free Market Media | Emerging independent media, fragile |
| Education Access | Free Basic, Expensive Higher | Universal primary but limited secondary/tertiary |
| Education Quality | 30 | Underfunded education systems |
| Women's Rights | Minimal | Legal frameworks exist but enforcement weak |
| Family Structure | Extended Family | Strong kinship networks |
| Reproductive Health | Restricted | Limited access, cultural constraints |
| Family Size Policy | Large Encouraged | Pro-natalist cultural norms, agricultural economy |
| Science Freedom | 40 | Limited research infrastructure |
| Science Freedom Constraint | Capital | Funding-constrained research |
| Trade Openness | 10 (open trade) | Export-dependent economies |

### Run Parameters
- **Duration**: 200 turns
- **Key dynamic**: Whether institutional development outpaces capture pressure

### What to Look For (Structurally Plausible Results)

**By turn 50-100:**
- Institutional quality struggling (low starting capacity + extraction pressure)
- Ethnic fractionalization requiring political inclusion management
- Youth bulge developing (high fertility, declining mortality)
- Resource extraction driving short-term growth
- Wealth capture risk from weak institutions + resource wealth
- State capacity building slowly

**By turn 100-150:**
- Demographic transition Stage 1 → Stage 2 (mortality declining before fertility)
- Population growth accelerating (youth bulge intensifying)
- Youth bulge instability if mobility stays low
- Infrastructure slowly developing
- Possible divergent paths: institutional development vs. capture/coup

**By turn 150-200:**
- Outcome depends on education/healthcare investment trajectory
- If education quality improves: epistemic health rises, institutional quality stabilizes, demographic transition advances
- If extraction dominates: wealth capture grows, institutional quality erodes, stability threatened
- Key question: does the model produce the "development trap" — where resource extraction + weak institutions + youth bulge create a self-reinforcing cycle that is structurally difficult to escape?

**Red flags:**
- Immediate institutional quality improvement without structural drivers
- No youth bulge despite high fertility + declining mortality
- Wealth capture doesn't develop despite resource extraction + weak institutions

---

## Scenario 9: Classical Athens (Democratic Period)

**Historical analog**: Athens, ~500-322 BCE
**Structural theme**: Direct democracy, intellectual flourishing, slavery-based economy, limited political inclusion (citizens only), vulnerability to military overextension

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Direct Congress |
| Economy | Market Capitalist |
| Religion Presence | Plurality of Religions |
| Religion Propagation | Communal |
| Religion Tolerance | Indifferent |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Minimal / Traditional | Hippocratic medicine for elites, minimal for others |
| Healthcare Emphasis | Treatment | Curative tradition (Hippocrates) |
| Resource Strategy | Extraction for Growth | Silver mines (Laurion), timber extraction |
| Information Ecosystem | Open Civic | Agora debates, public discourse, rhetorical tradition |
| Education Access | Free Basic, Expensive Higher | Gymnasium education for citizens; philosophy schools for elites |
| Education Quality | 55 | High intellectual tradition but narrow access |
| Women's Rights | Forbidden | No political participation, guardian system |
| Family Structure | Extended Family | Oikos (household) system |
| Reproductive Health | Restricted | Herbal methods known but limited |
| Family Size Policy | Neutral | Mixed incentives |
| Science Freedom | 70 | Remarkable intellectual freedom (pre-Socrates through Aristotle) |
| Science Freedom Constraint | None | Free philosophical inquiry |
| Trade Openness | 15 (open) | Mediterranean maritime trade |

### Run Parameters
- **Duration**: 200 turns
- **Key dynamic**: High epistemic health + open media + suppressed gender equity — what does the model predict?

### What to Look For (Structurally Plausible Results)

**By turn 50-80:**
- Epistemic health high (open civic + high science freedom)
- Social trust moderate to high (democratic participation)
- Gender equity very low (forbidden women's rights)
- Innovation advancing despite limited access (elite-driven)
- Wealth concentration moderate but growing (market economy)

**By turn 80-150:**
- Tension between high epistemic health and low gender equity
- Fertility remaining high (low gender equity + no reproductive health access)
- Economic growth but with inequality
- Military growing (direct democracy historically aggressive in foreign policy)
- Wealth capture channels developing (wealthy citizens influencing assembly)

**By turn 150-200:**
- Key question: does the model show how a civilization can have high intellectual achievement (EH, science) while maintaining structural inequality (gender, class)?
- Does suppressed gender equity eventually constrain innovation and demographic transition?
- Does wealth capture erode democratic institutions even with open media?

**Red flags:**
- Gender equity rises significantly despite "forbidden" setting (it shouldn't)
- Epistemic health collapses without structural cause
- No wealth concentration growth under market economy

---

## Scenario 10: Soviet Union (Command Economy)

**Historical analog**: USSR, ~1920-1991
**Structural theme**: Planned economy, rapid industrialization, state information control, high education but constrained science, institutional rigidity, eventual collapse

### Configuration

| Wizard Step | Setting |
|-------------|---------|
| Governance | Autocratic |
| Economy | Command / Planned |
| Religion Presence | No Religion / Secular |
| Religion Propagation | Passive |
| Religion Tolerance | Persecutory |
| Player Role | Founder |

**Step 10 Overrides:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Healthcare Access | Universal Public | State-funded universal healthcare |
| Healthcare Emphasis | Prevention | Mass vaccination, public health campaigns |
| Resource Strategy | Extraction for Growth | Rapid industrialization, resource mobilization |
| Information Ecosystem | Total Information Control | State propaganda monopoly |
| Education Access | Universal | Free at all levels; ideology-infused |
| Education Quality | 65 | High STEM education; humanities constrained |
| Women's Rights | Mostly Full | Legal equality early; structural barriers remained |
| Family Structure | Nuclear Family | State policy weakened extended family |
| Reproductive Health | Available | Available but politically influenced |
| Family Size Policy | Large Encouraged (early) then Neutral | Pro-natalist after WWII losses |
| Science Freedom | 50 | Strong in physics/math; Lysenko affair shows political constraints |
| Science Freedom Constraint | Government | Party direction of research priorities |
| Trade Openness | 80 (high protectionism) | Near-autarky |
| Childcare Norm | Institutional | State daycare for worker mothers |
| Sexual Orientation Policy | Suppressive | Criminalized |

### Run Parameters
- **Duration**: 250 turns
- **Key dynamic**: Can planned economy + universal education produce sustained development under total information control?

### What to Look For (Structurally Plausible Results)

**By turn 50-80 (rapid industrialization):**
- Infrastructure building rapidly (state investment)
- Urbanization climbing fast (forced/incentivized)
- Education levels high
- Epistemic health declining (total information control)
- Social trust initially stable then eroding
- Gender equity rising (state feminism)

**By turn 80-150 (mature system):**
- High urbanization (60+)
- High education but innovation constrained by government direction
- Institutional lock-in growing (planned economy rigidity)
- Epistemic health low (30 or below)
- Demographic transition advancing (universal healthcare + education driving mortality down, then fertility)
- Anomie potentially rising (rapid social change + suppressed information)
- Wealth concentration low (planned economy prevents it) but institutional capture through political channels

**By turn 150-250 (stagnation and crisis):**
- Institutional lock-in very high
- Reform resistance high
- Innovation stalling (government-directed science hits ceiling)
- State capacity declining under bureaucratic weight
- Epistemic health very low → population cannot accurately assess conditions
- Key question: does the model show how universal education + planned economy + information control produces a "development trap" — initial rapid advancement followed by systemic stagnation?

**Red flags:**
- Institutional lock-in doesn't develop under planned economy
- Epistemic health remains high despite total information control
- Wealth concentration rises significantly under planned economy (shouldn't)

---

## Cross-Scenario Comparison Guide

After running scenarios, compare outcomes across these dimensions:

### Equality vs. Growth Trade-off
| Scenario | Expected Growth | Expected Equality |
|----------|----------------|-------------------|
| Rome (Oligarchic/Market) | High | Very Low |
| Haudenosaunee (Flat/Gift) | Low | Very High |
| Britain (Representative/Market) | Very High | Low→Moderate |
| Scandinavia (Representative/Mixed) | Moderate-High | Very High |
| Soviet (Autocratic/Planned) | High (early) | Moderate (enforced) |

### Demographic Transition Speed
| Scenario | Expected Transition Speed | Key Driver |
|----------|--------------------------|------------|
| Scandinavia | Fastest | Universal healthcare + education + gender equity |
| Britain | Moderate | Industrialization-driven sanitation, delayed by low gender equity |
| Song Dynasty | Slow | Autocratic governance limits information flow |
| Haudenosaunee | Slow | Low disease burden but limited healthcare technology |
| Post-Colonial | Variable | Depends on education/healthcare investment trajectory |
| Khmer | Very Slow | Theocratic constraint on science + gender equity suppression |

### Institutional Resilience
| Scenario | Lock-in Risk | Capture Risk | Reform Capacity |
|----------|-------------|-------------|-----------------|
| Rome | Low→High | Very High | Low (oligarchic spiral) |
| Song Dynasty | High | Moderate | Low (bureaucratic rigidity) |
| Ottoman | High | Moderate | Very Low (religious + bureaucratic) |
| Scandinavia | Low | Low | High (strong institutions) |
| Soviet | Very High | Moderate (political) | Very Low (ideological rigidity) |
| Athens | Low | Moderate | High (democratic but volatile) |

---

## Running Multi-Civilization Comparisons

For the most informative analysis, run scenarios in pairs that test specific contrasts:

1. **Governance effect on equality**: Rome (oligarchic) vs. Haudenosaunee (flat consensus) — same 200 turns
2. **Information ecosystem effect**: Soviet (total control) vs. Scandinavia (open civic) — both with universal education
3. **Religion effect on development ceiling**: Ottoman (dominant, restrictive) vs. Athens (plurality, indifferent) — both with high intellectual traditions
4. **Resource strategy effect**: Britain (extraction) vs. Scandinavia (stewardship) — both representative governance
5. **Demographic transition comparison**: Run all 10 scenarios for 300 turns and compare when/whether they reach Stage 3

### Multi-Civ Contagion Test

Run Scenario 1 (Rome) and Scenario 3 (Haudenosaunee) simultaneously on the same map. After 100+ turns, observe:
- Does cooperation norm contagion flow from Haudenosaunee → Rome via trade?
- Does cynicism flow from Rome → Haudenosaunee?
- Does the theocratic suppression filter work when applicable?

---

## Interpreting Results

### "Structurally Plausible" Means:
1. **Causal direction correct**: If wealth concentrates, institutions should erode (not improve)
2. **Temporal sequence correct**: Mortality should decline before fertility in demographic transition
3. **Cross-system effects present**: Education improvements should eventually affect fertility, innovation, and institutional quality
4. **Feedback loops visible**: Wealth capture should accelerate over time (not stay linear)
5. **Trade-offs genuine**: High equality should come with slower growth; high growth should come with higher inequality

### "Structurally Plausible" Does NOT Mean:
1. Specific numbers match historical data (the model is not calibrated to specific cases)
2. Events happen at historically correct times (turns are abstract)
3. All historical outcomes are reproduced (the model may lack systems needed for some dynamics)
4. Trajectories are deterministic (stochastic events create run-to-run variation)

### When the Model Fails

If a scenario produces structurally implausible results, document:
1. Which causal chain failed (e.g., "wealth capture did not erode institutional quality")
2. Whether the failure is in direction, magnitude, or timing
3. Whether it points to a missing system (e.g., innovation ecosystem, diplomatic dynamics)
4. Whether adjusting initial parameters could fix it (magnitude issue) or whether the processing logic needs modification (direction issue)

These findings feed into the innovation ecosystem decision (see `TEST_VERIFICATION.md` Appendix L).

---

## File Reference

| File | Contents |
|------|----------|
| `MODELING_ASSUMPTIONS.md` | What the model can and cannot represent |
| `TEST_VERIFICATION.md` | Technical test cases for all subsystems |
| `QUICK_START_RESEARCH.md` | Research workflow and analytical framework |
| `USER_MANUAL.md` | Complete documentation of all panels and metrics |
| `js/config.js` | All valid parameter values, preset definitions |
| `js/simulation.js` | All processing logic with drift rates and cross-effects |

---

*These scenarios test whether civ-sim's structural dynamics produce recognizable patterns. If the Roman scenario spirals into oligarchic capture, the Scandinavian scenario sustains high equality, and the Khmer scenario overshoots its ecological base, the model is doing its job — even if the specific numbers are simplified. If any scenario produces outcomes that contradict well-documented historical dynamics, that's a signal to investigate whether the model is missing a critical system or has a parameter calibration issue.*
