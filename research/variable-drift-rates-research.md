# Empirical Rates of Change for Simulation Variables

Research compiled for civ-sim calibration. All rates expressed on 0-100 scales where applicable.
1 turn = 10 years default.

---

## 1. Institutional Quality

**Source:** V-Dem Liberal Democracy Index (0-1 scale, multiply by 100 for 0-100); World Governance Indicators

**Empirical findings:**
- V-Dem measures autocratization/democratization as a change of >0.05 on the LDI (0-1 scale) over 10 years = 5 points on 0-100 scale
- Third-wave democratizers show dramatic gains: Chile went from 0.033 (1974) to ~0.55 (1995) = ~52 points in 2 decades, or ~26 pts/decade during rapid transition. Taiwan went from 0.061 (1960) to 0.734 (2018) = ~67 points over ~3 decades of transition = ~22 pts/decade during active transition
- Typical gradual improvement (non-crisis): ~2-5 points/decade on 0-100 scale
- Typical autocratization: India dropped from 0.57 to 0.34 (2013-2020) = ~23 points in 7 years = ~33 pts/decade (fast). USA declined ~10 points over 10 years (slow). Hungary/Turkey: ~10-20 pts/decade
- Global average LDI was roughly stable 2000-2013 then declined
- WGI Government Effectiveness showed statistically significant improvement through ~2016, softening post-2020

**Recommended per-turn drift (10 years):**
- Normal drift: +/- 2 to 5 points (0-100 scale)
- Active democratization episode: +10 to +25 points
- Active autocratization episode: -5 to -15 points
- Revolutionary/collapse transition: +/- 20-50 points (rare)

---

## 2. Corruption (inverse: higher = less corrupt)

**Source:** Transparency International Corruption Perceptions Index (0-100 scale, 100 = clean)

**Empirical findings:**
- Global average CPI stuck at 43/100 for over a decade (2012-2024), dropping to 42 in 2025
- 32 countries significantly reduced corruption since 2012; 148 stagnated or worsened
- Countries scoring above 80 shrank from 12 (2015) to 5 (2025)
- Western Europe declining faster than any other region recently
- Sustained decliners (Venezuela, Hungary, South Sudan): ~5-15 point drops over a decade
- Successful improvers are rare and slow: typical improvement is ~3-5 points/decade
- CPI methodology changed in 2012, making pre-2012 comparisons unreliable

**Recommended per-turn drift (10 years):**
- Normal drift: +/- 1 to 3 points (strong inertia)
- With active reform: +3 to +8 points
- With institutional decay/state capture: -3 to -10 points
- Corruption is notably sticky -- one of the slowest-changing variables

---

## 3. Social Trust

**Source:** World Values Survey; General Social Survey (US); American National Election Survey

**Empirical findings:**
- US trust declined ~23 percentage points from 1964 (~55%) to recent surveys (~32%) over ~60 years = ~3.8 pts/decade
- GSS data: 46% (1972) to 31.5% (2018) = ~14.5 point drop over 46 years = ~3.2 pts/decade
- Trust in US government: ~70% (late 1950s) to ~20% (2020) = ~50 point drop over 6 decades = ~8 pts/decade (but this is institutional trust, not generalized)
- Cross-country variation is enormous: Norway/Sweden >60%, Colombia/Peru ~5%
- A 2024 study of 142 countries (1980-2020) found that trust is NOT stable -- significant variation observed in many countries, supporting "experiential" model
- China: high social trust (~60%) remained stable over 3 decades
- Nordic countries: stable at 60%+ for decades
- Trust correlates strongly (negatively) with inequality

**Recommended per-turn drift (10 years):**
- Normal drift: +/- 1 to 4 points (slow-moving in most countries)
- Under rising inequality/institutional failure: -3 to -8 points
- Post-crisis/anomie: -5 to -15 points (acute shock)
- Recovery is slower than decline

---

## 4. Gender Equity

**Source:** World Economic Forum Global Gender Gap Index (0-100 scale, 100 = parity)

**Empirical findings:**
- Global: improved +4.8 percentage points from 64.1% (2006) to 69.0% (2025) over 19 years = ~2.5 pts/decade
- Yearly average progress: 0.25 percentage points/year
- Latin America & Caribbean (fastest region): +8.6 pts since 2006 = ~4.5 pts/decade
- Fastest individual countries: Bangladesh, Ecuador, Ethiopia, Mexico, Saudi Arabia
- Political Empowerment dimension: +8.3 pts since 2006 = ~4.4 pts/decade
- Economic Participation: +4.8 pts since 2006 = ~2.5 pts/decade
- Educational Attainment: +4.2 pts since 2006 = ~2.2 pts/decade
- Nordic countries were already at ~80% parity by 2006, now ~85%+, suggesting ~2.5 pts/decade even at high levels
- At current rates, full parity projected in 123 years
- Health & Survival: slight decline (-0.2 pts since 2006)

**Recommended per-turn drift (10 years):**
- Normal drift: +1 to +3 points (slow, steady improvement is the norm)
- Fast reformers: +4 to +8 points
- Near-parity countries (diminishing returns): +1 to +2 points
- Regression (conflict, theocratic turn): -2 to -10 points
- Gender equity almost never regresses absent major political upheaval

---

## 5. Urbanization

**Source:** UN World Urbanization Prospects

**Empirical findings (global % urban):**
- 1950: ~30% -> 1960: ~34% -> 1970: ~37% -> 1980: ~39% -> 1990: ~43% -> 2000: ~47% -> 2010: ~52% -> 2020: ~56%
- Average global rate: ~3-5 percentage points per decade
- Already-urbanized regions (N. America 82%, Europe 74%): ~1-2 pts/decade
- Rapidly urbanizing regions (Africa, Asia): ~5-8 pts/decade
- Africa and Asia urbanizing at 1.1-1.3% annually = ~11-13 pts/decade at fastest
- Historical peak rates: China went from ~20% (1980) to ~65% (2020) = ~11 pts/decade
- Urbanization is essentially monotonic -- it almost never reverses

**Recommended per-turn drift (10 years):**
- Low urbanization (<30%): +3 to +8 points
- Medium urbanization (30-60%): +4 to +6 points
- High urbanization (60-80%): +2 to +3 points
- Very high urbanization (>80%): +0.5 to +1.5 points
- Urbanization should be essentially one-directional with diminishing rate as ceiling approaches

---

## 6. State Capacity

**Source:** V-Dem state capacity measures; World Governance Indicators Government Effectiveness (-2.5 to +2.5, rescale to 0-100)

**Empirical findings:**
- Large majority of countries improved state capacity scores over recent decades, especially those starting low
- WGI Government Effectiveness showed statistically significant improvement through ~2016
- Post-COVID softening globally
- A 1-standard-deviation increase in V-Dem state capacity index predicts ~6-7% higher income per person
- State capacity correlates with accumulated democratic experience, not just current democracy level
- State capacity is built slowly through institutional development, tax systems, bureaucratic professionalization
- Fragile/failed states can lose state capacity rapidly (e.g., Libya, Syria, Somalia)
- State capacity building from low baseline (Uganda, Vietnam): ~5-10 points/decade
- Collapse scenarios: can lose 20-40 points in a single decade

**Recommended per-turn drift (10 years):**
- Normal improvement from low base: +3 to +8 points
- Mature state maintaining: +1 to +2 points
- Active state-building program: +5 to +12 points
- State failure/collapse: -15 to -40 points
- State capacity is asymmetric: slow to build, fast to lose

---

## 7. Labor Share of Income

**Source:** Penn World Tables (Feenstra, Inklaar, Timmer 2015); ILO; FRED/BLS

**Empirical findings:**
- Global labor share fell ~5 percentage points since 1975 (Karabarbounis & Neiman 2014)
- US: labor share fell 6-7 percentage points between 1929 and 2022
- US labor share roughly constant 1947-1983, declining since
- ILO: global labour income share fell from 53% to 52.4% of GDP (2014-2024) = ~0.6 pts/decade
- OECD countries: decline of 6-7 pts from 1980s to 2010s = ~2 pts/decade
- China: labor share fell ~3 pts over ~2 decades
- Net labor share (BLS measure): 69.9% average since 1929, with 69.0% in 2022 -- a more modest decline
- Drivers: technology (~50% of decline in advanced economies), globalization, financialization
- Rescaled to 0-100 where labor share conceptually ranges from ~40 to ~75 in practice

**Recommended per-turn drift (10 years):**
- Normal drift in industrialized economy: -1 to -2 points (structural decline trend)
- With strong labor protections: +/- 0.5 points (near-stable)
- Under rapid automation/globalization: -2 to -4 points
- Under pro-labor policy reform: +1 to +3 points
- Very slow-moving variable; major shifts require structural economic transformation

---

## 8. Land Concentration (Gini)

**Source:** FAO World Census of Agriculture; International Land Coalition; World Inequality Lab

**Empirical findings:**
- Land Gini tends to be very stable over time (IMF finding)
- Since 1980, land inequality has been increasing in ALL regions
- Asia: Gini rose from 0.56 (1980) to 0.62 (present) = +6 pts on 0-100 Gini over ~4 decades = ~1.5 pts/decade
- Europe (EU): Gini increased ~10% since 1980, reaching 0.58 = ~1.5 pts/decade increase
- Africa: stabilized at Gini ~0.54
- Latin America: historically highest land inequality, Gini >0.75 in many countries
- Top 1% of farms operate >70% of world's farmland
- EU average farm size nearly doubled since 1960s (12 ha to 21 ha)
- Land reform can produce sudden shifts (e.g., post-revolution redistributions)
- Without policy intervention, consolidation will continue

**Recommended per-turn drift (10 years):**
- Normal drift (market forces): +1 to +2 points toward concentration
- With active land reform: -5 to -15 points (radical reform like post-revolution)
- Gradual redistribution policy: -2 to -5 points
- Very sticky variable -- changes slowly absent deliberate policy or revolution

---

## 9. Caste Rigidity / Social Stratification

**Source:** Intergenerational elasticity (IGE) data; Asher, Novosad, Rafkin (2024); Corak (2013)

**Empirical findings:**
- India average child from bottom half reaches education percentile 41.7 (vs. 50 = perfect mobility)
- India's intergenerational mobility has been "constant and low" since before liberalization
- India IGE ~0.49 (South Asia average), vs. US ~0.40, OECD average ~0.38, Nordic countries ~0.15-0.25
- Scheduled Castes closed ~50% of mobility gap with upper castes over recent decades
- Scheduled Tribes closed ~30% of gap
- Muslim mobility DECLINED from rank 31-34 to 29 over ~20 years
- Affirmative action has measurable positive effects for targeted groups
- Occupational mobility (controlling for structural change): DECLINED in India 1983-2012
- Caste identity remains a salient social marker despite legal abolition since 1950
- On 0-100 scale where 100 = maximum rigidity: caste rigidity erodes ~2-5 pts/decade with active policy, near-stable without intervention

**Recommended per-turn drift (10 years):**
- Without policy intervention: +/- 0 to -1 points (near-stable or slight erosion)
- With affirmative action/education investment: -2 to -5 points (slow erosion of rigidity)
- With urbanization + economic growth: -1 to -3 points
- Caste/stratification is among the most inertial social variables
- Revolutionary upheaval can produce -10 to -30 point shocks (e.g., Communist revolutions)

---

## 10. Social Mobility

**Source:** Chetty et al. (2014); Corak (2013) Great Gatsby Curve; OECD intergenerational mobility reports

**Empirical findings:**
- US rank-rank slope rose from 0.25 to 0.36 for cohorts born ~1950 vs. ~1960 (entering labor market pre/post 1980)
- US IGE increased from 0.28 to 0.45 for same cohorts = substantial decline in mobility
- Strong cross-country variation: Nordic IGE ~0.15-0.25 (high mobility) vs. US/UK ~0.40-0.50 (low mobility)
- Great Gatsby Curve: higher inequality correlates with lower mobility
- Father-son IGE increased 24 points between 1870 and 1940 in the US (historical long run)
- Canada: going "up" the Great Gatsby Curve -- increasing inequality, decreasing mobility
- Geographic variation within US is large (Chetty et al. 2014)
- On 0-100 scale (100 = perfect mobility): changes of ~3-8 points per decade are typical

**Recommended per-turn drift (10 years):**
- Under rising inequality: -2 to -5 points
- Under stable/declining inequality with strong education: +1 to +3 points
- Mobility is strongly coupled to inequality, education access, and residential segregation
- Changes are slow but cumulative

---

## 11. Epistemic Health / Press Freedom

**Source:** RSF World Press Freedom Index (0-100); V-Dem Freedom of Expression and Media Index (0-1)

**Empirical findings:**
- RSF: countries in "good situation" dropped from 25 (2013) to 7 (2025) over ~12 years
- RSF 2025 global average: 54.7 (entered "difficult" territory for first time)
- RSF economic indicator fell >2 pts in single year to 44.1 (2025)
- V-Dem: freedom of expression deteriorating in 44 countries (2024), improving in only 8
- V-Dem: Freedom of Expression is the worst affected aspect of democracy, consistently attacked first during autocratization
- 44 countries substantially increased media censorship over past 10 years
- Share of countries with high Media Integrity: 40% (2006) to 32% (2017) = ~8 pts/decade decline
- Press freedom has been in sustained global decline since ~2013
- Decline accelerates under autocratization

**Recommended per-turn drift (10 years):**
- Normal/stable democracy: +/- 1 to 2 points
- Under autocratization: -5 to -15 points
- During democratization: +5 to +15 points
- Post-revolution media opening: +10 to +20 points
- Press freedom is highly sensitive to political regime type and changes rapidly with regime change

---

## 12. Political Inclusion

**Source:** V-Dem Electoral Democracy Index (Polyarchy, 0-1 scale -> 0-100); Polity IV/V (-10 to +10 -> 0-100)

**Empirical findings:**
- Third-wave democratization (1970s-1990s): many countries gained +20 to +50 points on 0-100 scale over 1-2 decades
- Current autocratization wave: 45 countries autocratizing (2024), vs. 12 twenty years ago
- Autocracies now outnumber democracies (88 vs 91)
- Typical autocratization rate: 1-3 pts/year on 0-100 scale (0.01-0.03 on V-Dem LDI)
- Typical democratization episode: accumulates >10 points on EDI (0-100) to qualify
- Anocratic regimes (mixed authority traits) are least durable
- Full democracies and full autocracies are more stable than hybrid regimes
- V-Dem detection threshold for regime change: >1 pt/year on 0-100 EDI, accumulating to >10 pts

**Recommended per-turn drift (10 years):**
- Stable regime (democratic or autocratic): +/- 1 to 3 points
- Active democratization: +10 to +30 points
- Active autocratization: -5 to -15 points
- Regime collapse/revolution: +/- 20 to 50 points (sudden)
- Anocratic regimes should have higher variance than consolidated ones

---

## 13. Infrastructure

**Source:** World Bank (electrification, roads, PPI database); African Development Bank AIDI

**Empirical findings:**
- Global electricity access: ~76% (2000) to ~92% (2024) = ~6-7 pts/decade
- Sub-Saharan Africa electricity access: ~43%, vs 77% developing world average, 82% global
- Africa rural road access: 43% vs 67% developing country average
- EU average farm/infrastructure size roughly doubled since 1960s
- World Bank PPI: $100.7B in 2024 investment, up 16% from 2023
- Ethiopia: average distance to all-weather road halved from 21km (1997) to 12.4km (2012)
- Low-carbon infrastructure surge post-2010: share doubled
- Infrastructure improvements have long time lags; short-run effect is ~25% of long-run effect
- Progress is very uneven across regions

**Recommended per-turn drift (10 years):**
- Low-infrastructure country with investment: +5 to +12 points
- Middle-income country: +3 to +7 points
- High-infrastructure country (maintenance/upgrade): +1 to +3 points
- Under conflict/state failure: -5 to -20 points (destruction)
- Infrastructure is slow to build, fast to destroy in conflict
- Near-ceiling (>90): +0.5 to +1 point

---

## 14. Financial Depth

**Source:** World Bank Domestic Credit to Private Sector (% of GDP); IMF IFS; Global Financial Development Database

**Empirical findings:**
- Private credit/GDP in high-income countries: ~103%, vs. ~25% in low-income countries
- Global average domestic credit by banks: 91.19% of GDP (2024)
- East Asia & Pacific (developing): highest at 141% of GDP
- Financial deepening "episode" defined as credit/GDP increasing by 20+ percentage points in 10 years
- Optimal range: financial deepening promotes growth up to ~90-100% of GDP, then becomes destabilizing
- Countries like Thailand went from low to 170% over several decades
- Average developing country deepening: ~5-15 percentage points per decade
- Rescaled to 0-100 where 0 = no formal credit and 100 = ~200% credit/GDP ratio

**Recommended per-turn drift (10 years):**
- Low-income country with financial development: +5 to +10 points
- Middle-income country: +3 to +8 points
- High-income country (mature): +1 to +3 points
- Financial crisis/credit bust: -5 to -20 points (sudden)
- Over-deepening (>70 on scale) increases crisis risk
- Financial depth almost never regresses absent crisis

---

## 15. Anomie Recovery

**Source:** Case & Deaton deaths of despair research; post-Soviet mortality crisis; Durkheim's anomic suicide framework

**Empirical findings:**
- US deaths of despair: rose continuously from 1998 to present, ~158,000/year (2018) vs 65,000 (1995)
- Deaths of despair did NOT track with economic cycle -- continued rising through Great Recession AND recovery
- Post-Soviet Russia: male life expectancy fell 6 years in 3 years (1991-1994), from 63.4 to 57.4
- Russia partial recovery: 1994-1998 (4 years), then interrupted by 1998 crisis
- Russia sustained recovery only began after 2005-2006 -- roughly 15 years after initial collapse
- Russia still had not fully recovered to late-1980s levels by 2019 (~28 years later)
- COVID worsened deaths of despair by 10-60% above pre-pandemic levels
- Case & Deaton: solving the crisis will require "patience and perseverance for many years"
- The crisis reflects cumulative disadvantage built over decades, not acute shock
- Other wealthy nations facing similar economic pressures did NOT experience deaths of despair at US scale (strong safety nets protected them)

**Recommended per-turn drift (10 years):**
- Onset of anomie (rapid dislocation): -10 to -25 points on a 0-100 "social cohesion" scale
- Natural recovery WITHOUT policy intervention: +3 to +5 points/decade (very slow)
- Recovery WITH strong social safety net + alcohol/drug policy: +5 to +10 points/decade
- Full recovery from major anomie crisis: 2-4 turns (20-40 years)
- Anomie onset is fast; recovery is slow and asymmetric

---

## 16. Collective Trauma Decay

**Source:** Intergenerational trauma research: Holocaust (Yehuda, Sagi-Schwartz); Holodomor (Bezo & Maggi 2015); post-traumatic slave syndrome; epigenetics research

**Empirical findings:**
- Holocaust: effects clearly measurable in 2nd generation (children of survivors), with grandchildren overrepresented 300% in psychiatric referrals
- Holodomor (1932-33): effects still substantial in 3rd generation (grandchildren) as of 2015 study -- "survival mode" behaviors persist
- Word-association studies show trauma significance diminishes with each generation (Holodomor)
- Animal models: trauma-related changes decrease across generations "in a gradient fashion" when no new trauma introduced
- Slavery: compounding multi-generational trauma may prevent normal decay; no valid control group exists
- Societal response matters: Rwanda (timely justice/reconciliation) reduced transmission; Cambodia (delayed response) intensified it
- Protective factors (community, nation-building, collective memory) can accelerate decay
- Disconfirming studies exist: some Holocaust survivor communities showed no measurable transmission
- Epigenetic transmission in humans remains contested/unproven
- Rough consensus: effects halve approximately every generation (25-30 years) when no new trauma introduced

**Recommended per-turn drift (10 years):**
- Model as exponential decay with half-life of ~25-30 years (roughly 1 generation)
- Per-turn decay: multiply trauma score by ~0.75 per turn (loses ~25% per decade)
- Compounding trauma (ongoing oppression): half-life extends to 50-100+ years or no decay
- With active reconciliation/justice programs: half-life shortens to ~15-20 years
- With continued systemic discrimination: trauma may not decay at all or may compound
- Suggested formula: trauma(t+1) = trauma(t) * decay_factor, where decay_factor = 0.70-0.80 per turn normally, 0.90-1.0 under ongoing oppression

---

## 17. Demographic Transition

**Source:** UN Population Division; World Bank WDI; Our World in Data

**Empirical findings (fertility decline in TFR, children per woman):**
- Global: 5.0 (1950) to 2.7 (2000) to ~2.3 (2025) -- decline began ~1963
- Latin America: fertility fell ~10% per decade since late 1960s
- East Asia: drastic decline, reached 1.3 (2023) -- fastest transition
- Sub-Saharan Africa: still 4.3 (2023), highest globally
- Europe/Central Asia and North America: 1.6 average (2023)
- Once initiated, transition can deliver sub-replacement fertility within 1-2 generations (25-50 years)
- Stage 2 (mortality decline): can happen in 1-3 decades
- Stage 3 (fertility decline): typically 2-4 decades
- Stage 4 (low-low): can persist indefinitely
- 60 countries with 43% of world population now at or below replacement (2.1)
- Key trigger: reduction in infant/child mortality

**Recommended per-turn drift (10 years) -- express as TFR change, map to demographic stage:**
- Stage 1 (pre-transition): TFR stable at 5-7, mortality high
- Stage 2 (mortality declining): TFR still 5-7, death rate drops 5-10 pts/decade
- Stage 3 (fertility declining): TFR drops 0.5-1.0 per decade (= ~7-14 pts on 0-100 fertility scale)
- Rapid transition: TFR drops 1.0-2.0 per decade (China, Iran)
- Stage 4 (low stable): TFR 1.5-2.1, changes <0.2/decade
- Stage 5 (sub-replacement): TFR can drop further to 1.0-1.5
- For 0-100 scale mapping: use fertility rate mapped so TFR 7=0, TFR 1=100 (or similar)

---

## 18. Food Security

**Source:** FAO Prevalence of Undernourishment (PoU); World Bank WDI

**Empirical findings (PoU = % population undernourished):**
- Global: declined from ~15% (2000) to ~8.4% (2019) = ~3.3 pts/decade improvement
- 2019-2020: jumped from 8.0% to 9.3% (COVID shock) = +1.3 pts in 1 year
- 2022-2024: recovery from 8.7% to 8.2% = slow recovery
- Asia: PoU declined from 14.3% (2000) to 6.7% (2024) = ~3 pts/decade
- Latin America: 5.1% (2024), down from ~6.1% peak (2020)
- Sub-Saharan Africa: 17.6% projected by 2030, limited progress over 30+ years
- Historical long-run: massive improvement from 1970s (when >30% in many Asian regions)
- Progress stalled 2014-2019 even before COVID
- Rescaled to 0-100 where 0 = maximum undernourishment, 100 = food secure

**Recommended per-turn drift (10 years):**
- Normal improvement with economic growth: +3 to +7 points
- Rapid development (East/Southeast Asia trajectory): +5 to +10 points
- Stagnation (Sub-Saharan Africa pattern): +0 to +2 points
- Crisis/conflict/pandemic: -5 to -15 points (rapid deterioration)
- Climate shock: -3 to -8 points
- Food security can deteriorate much faster than it improves

---

## 19. Military Power (Military Spending as % GDP)

**Source:** SIPRI Military Expenditure Database; World Bank WDI

**Empirical findings:**
- Global military burden: 2.5% of GDP (2024), up from 2.3% (2023)
- US: ranged from ~15% (Korean War peak, 1952) to 3.5% (2001 low)
- US Cold War typical: 8-10% of GDP; post-Cold War: 3-4%
- US "peace dividend" 1990s: ~3 percentage point drop in one decade
- USSR/Russia: 12.3% (1990) to 3.2% (1998) = ~9 point drop in 8 years
- NATO average: surpassed 2.0% in 2024, with Poland at 4.2%
- Ukraine: 34% of GDP (2024) -- extreme wartime spending
- Israel: 5.4% (2023) to 8.8% (2024) -- wartime surge
- China: consecutive increases for 29 years, but rate of growth slowing
- Post-Cold War global decline: ~one-third reduction in real terms 1989-1996
- Global spending rising every year for past decade (2015-2024, +37%)
- Year-on-year: 9.4% increase in 2024 (steepest since 1988)
- Rescale to 0-100 where the variable represents military capability not just spending

**Recommended per-turn drift (10 years):**
- Peacetime: +/- 0.5 to 2 percentage points of GDP (= ~2-8 points on 0-100 military power scale)
- Arms race / major threat: +3 to +8 points
- Post-war demobilization / peace dividend: -5 to -15 points
- Active major war: +10 to +30 points (can surge rapidly)
- Military spending is responsive to security environment; can change fast in both directions

---

## 20. Legitimacy

**Source:** V-Dem LDI; Polity IV/V DURABLE variable and regime transition codes

**Empirical findings:**
- Polity IV DURABLE: measures years since last substantive regime change (3+ point shift)
- Anocratic regimes: majority experience regime change within first 5 years (high instability)
- Full democracies and full autocracies: more durable than hybrid/anocratic regimes (U-shaped stability curve)
- Of 45 autocratizing countries, 18 of 27 democracies became autocracies = ~70% "fatality rate" once autocratization begins
- V-Dem: almost 80% of democracies break down if autocratization sets in
- Regime transitions tend to cluster: revolutionary waves, contagion effects
- Autocracies: personalist dictatorships increasing as proportion; monarchies stable; military regimes declining
- Average polity duration: varies enormously by regime type and region
- Legitimacy loss often precedes regime change by years/decades (cumulative risk model)
- Quasi-U-shape: initial high failure rate (new regimes), stable middle period, then rising risk as legitimacy erodes

**Recommended per-turn drift (10 years):**
- Stable consolidated regime (democratic or autocratic): +/- 1 to 3 points
- Anocratic/hybrid regime: high variance, +/- 5 to 15 points
- Post-crisis/new regime: starts low (~30-40), can build +5 to +10 pts/decade
- Under corruption/institutional decay: -3 to -8 points
- Regime change event: sudden reset to 20-40 (new regime must build legitimacy)
- Legitimacy should have a U-shaped failure hazard: highest instability early and late in regime life

---

## Summary Table: Recommended Per-Turn Drift Rates (1 turn = 10 years, 0-100 scale)

| # | Variable | Normal Drift | Fast Positive | Fast Negative | Notes |
|---|----------|-------------|---------------|---------------|-------|
| 1 | Institutional Quality | +/- 2-5 | +10 to +25 | -5 to -15 | Asymmetric: faster to lose |
| 2 | Corruption | +/- 1-3 | +3 to +8 | -3 to -10 | Very sticky, slow-changing |
| 3 | Social Trust | +/- 1-4 | +3 to +5 | -5 to -15 | Slow to build, fast to lose |
| 4 | Gender Equity | +1 to +3 | +4 to +8 | -2 to -10 | Rarely regresses |
| 5 | Urbanization | +3 to +6 | +8 to +13 | N/A | Essentially monotonic |
| 6 | State Capacity | +1 to +8 | +5 to +12 | -15 to -40 | Highly asymmetric |
| 7 | Labor Share | -1 to -2 | +1 to +3 | -2 to -4 | Structural decline trend |
| 8 | Land Concentration | +1 to +2 | -5 to -15 (reform) | +2 to +4 | Sticky; reform = rare shock |
| 9 | Caste Rigidity | -0 to -1 | -2 to -5 (w/policy) | N/A | Most inertial variable |
| 10 | Social Mobility | +/- 1-3 | +2 to +5 | -3 to -5 | Coupled to inequality |
| 11 | Press Freedom | +/- 1-2 | +5 to +15 | -5 to -15 | Sensitive to regime type |
| 12 | Political Inclusion | +/- 1-3 | +10 to +30 | -5 to -15 | Can shift suddenly |
| 13 | Infrastructure | +3 to +7 | +5 to +12 | -5 to -20 | Slow build, fast destroy |
| 14 | Financial Depth | +3 to +8 | +10 to +20 | -5 to -20 | Crisis-prone at high levels |
| 15 | Anomie Recovery | +3 to +5 | +5 to +10 (w/policy) | -10 to -25 (onset) | Highly asymmetric |
| 16 | Trauma Decay | x0.75/turn | x0.60 (w/reconcil.) | x0.95 (ongoing) | Exponential decay model |
| 17 | Demographic Trans. | varies by stage | TFR -1 to -2/decade | N/A | Stage-dependent |
| 18 | Food Security | +3 to +7 | +5 to +10 | -5 to -15 | Can crash in crisis |
| 19 | Military Power | +/- 2-5 | +10 to +30 (war) | -5 to -15 (peace) | Responsive to security |
| 20 | Legitimacy | +/- 1-3 | +5 to +10 | -5 to -15 | U-shaped hazard |

---

## Key Cross-Cutting Findings

1. **Asymmetry is the rule, not the exception.** Most variables decline faster than they improve. State capacity, social trust, institutional quality, and press freedom all follow this pattern. Build slowly, lose fast.

2. **Inertia varies enormously.** Corruption, caste rigidity, land concentration, and labor share are highly inertial (1-3 pts/decade). Press freedom, political inclusion, and military spending can shift 10+ points in a single decade.

3. **Coupling matters.** Social mobility is strongly coupled to inequality (Great Gatsby Curve). Press freedom is coupled to regime type. Anomie is coupled to economic dislocation speed. Gender equity is coupled to education and political inclusion.

4. **Crisis accelerates everything.** War, revolution, state collapse, and pandemics can compress decades of change into years. Post-Soviet Russia lost 6 years of life expectancy in 3 years. Chile's democracy score dropped 80 points in 1 year (1973 coup).

5. **Ceiling/floor effects.** Urbanization slows near 80%+. Gender equity improvement slows near 85%+. Financial depth becomes destabilizing above ~90% credit/GDP. Infrastructure improvement slows near 90%+.

---

## Sources

- V-Dem Institute: https://www.v-dem.net/
- V-Dem Democracy Report 2025
- Transparency International CPI: https://www.transparency.org/en/cpi/2025
- World Values Survey: https://www.worldvaluessurvey.org/
- World Economic Forum Global Gender Gap Report 2025
- UN World Urbanization Prospects 2025: https://population.un.org/wup/
- World Governance Indicators: https://www.worldbank.org/en/publication/worldwide-governance-indicators
- Penn World Tables via FRED: https://fred.stlouisfed.org/series/LABSHPUSA156NRUG
- ILO labor share data
- International Land Coalition, Uneven Ground: https://www.landcoalition.org/en/uneven-ground/
- FAO World Census of Agriculture
- World Inequality Lab: https://wid.world/
- Asher, Novosad, Rafkin (2024), AEJ: Applied Economics (India mobility)
- Corak (2013), Great Gatsby Curve
- Chetty et al. (2014), geographic mobility data
- RSF World Press Freedom Index: https://rsf.org/en/index
- Polity IV/V Project: https://www.systemicpeace.org/
- World Bank Open Data: https://data.worldbank.org/
- SIPRI Military Expenditure Database: https://www.sipri.org/databases/milex
- Case & Deaton, Deaths of Despair (2020)
- FAO State of Food Security and Nutrition reports
- UN Population Division
- Bezo & Maggi (2015), Holodomor intergenerational trauma
- Karabarbounis & Neiman (2014), global labor share decline
- General Social Survey / ANES (US trust data)
- Lührmann & Lindberg (2019), Episodes of Regime Transformation
- Geddes, Wright & Frantz, Autocratic Breakdown dataset
