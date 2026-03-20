# Wealth & Power Accumulation Research
## For civ-sim — Gathered March 14, 2026

---

## PART 1: WHAT WE CURRENTLY MODEL

### Wealth Concentration (0-98 scalar)
- **Base drift** (civilization.js line 700-708):
  - If `accumulationAllowed` AND `hierarchyLevel > 40`: +0.05/turn (ADDITIVE)
  - If `!accumulationAllowed`: -0.1/turn, clamped to [5, 50]
  - If accumulation allowed but hierarchy <= 40: no drift
- **Governance accelerators** (simulation.js 507-514):
  - Shadow gov complicit: +0.15/turn
  - Shadow gov covert: +0.10/turn
- **Condition accelerators**:
  - Slavery: +0.15/turn
  - Organized crime: +0.1 to +0.2/turn * intensity
- **Wealth Capture feedback** (_processWealthCapture, line 4795):
  - degree = wealthConc * econPowerPotential * (1 - IQ/100) * 1.2
  - Converges via lerp at 0.06/turn (accelerated by consequence deficit)
  - When degree > 40: erodes IQ and EH (self-reinforcing)
- **Feudal detection**: degree >= 80 AND wealthConc > 75
- **Counterforces**: emancipation (-10), non-accumulation economies (decay to floor), crime suppression policies

### What's NOT Modeled
- Inflation / price levels / money supply
- Actual wages per stratum (only wellbeing deltas)
- CEO/executive compensation
- Labor share vs capital share
- Actual Gini / Lorenz curve / Palma ratio
- r > g dynamics / heterogeneous returns
- Pareto distribution / power law tails
- Inheritance mechanics
- Tax policy as a wealth lever

---

## PART 2: RESEARCH FINDINGS — WEALTH ACCUMULATION

### 2.1 Pareto Tails / Power Law Distributions
- **Empirically very well-established**
- Wealth distribution upper tail follows power law with Pareto exponent alpha = 1.2-2.5
- Lower alpha = fatter tail = more concentration
- **Capital income risk drives the right tail** (Benhabib/Bisin/Zhu 2011, Econometrica)
- Three mechanisms produce power laws: random growth, optimization, superstar economics (Gabaix 2009)
- **Key insight**: The distribution emerges NATURALLY from multiplicative dynamics — no need to force it

### 2.2 r > g Dynamics (Piketty)
- **Well-established, contested in magnitude**
- r-g gap averaged 3.3 percentage points over 1870-2015 (Jorda/Schularick/Taylor 2019, QJE)
- Widened to 4.3pp post-1970s, ~5pp post-1980s
- Only went negative during wartime
- **Critical**: Returns are positively correlated with wealth level — the rich literally earn higher r (Norwegian micro-data)
- 1pp increase in r-g associated with 3.7% increase in top 1% wealth share, especially when combined with elite political power concentration (2025 panel study)

### 2.3 Multiplicative vs Additive Wealth Dynamics
- **Theoretically rigorous, empirically supported**
- Wealth dynamics are fundamentally multiplicative, making them non-ergodic (Ole Peters, ergodicity economics)
- Ensemble average can show growth while individual time-averages show decline
- Under geometric Brownian motion: expected growth = mu + sigma^2/2, but time-average growth = mu (always lower)
- US income data consistently in non-ergodic regime where inequality grows inherently
- **THIS IS THE MOST IMPORTANT DESIGN CHOICE: wealth must grow multiplicatively, not additively**

### 2.4 Matthew Effect / Preferential Attachment
- **Empirically well-established** (Perc 2014, J Royal Society Interface)
- Linear attachment kernel (gamma=1) → power laws
- Sublinear (gamma<1) → stretched exponentials (more equal)
- Superlinear (gamma>1) → winner-take-all monopoly
- Small initial differences compound explosively: 5,4,3 → 25,16,9 → 625,256,81

### 2.5 Institutional Factors
- **Well-established with clear magnitudes**
- US top 0.1% wealth share: ~7% (late 1970s) → ~20% (Saez/Zucman 2019, Brookings)
- Bottom 90% share: ~35% → ~25%
- Moving top tax rates from ~25% to ~70% roughly halved top wealth shares historically
- Capital income and estate taxes analytically reduce Pareto tail thickness (Benhabib et al 2011)
- Partible inheritance reduced concentration after Black Death; primogeniture preserved it
- **Tax policy and inheritance rules are the primary human tools affecting concentration**

### 2.6 Power Concentration Feedback Loops
- Mergers → 15-35% increase in lobbying expenditures (2025 Harvard study)
- Top 1% contributed >40% of disclosed campaign contributions (US 2012)
- Regulatory capture confirmed by IMF working paper (2019)
- Michels' Iron Law of Oligarchy (1911): all complex organizations tend toward oligarchy
  - Confirmed as "strong tendency" not absolute law
  - Counterexamples require active structural safeguards
- **We model this well via Wealth Capture — one of our strongest systems**

### 2.7 Historical Patterns (Scheidel "Great Leveler" 2017)
- Wealth concentration increased continuously over 700 years with only two exceptions:
  - Post-Black Death (1347-52)
  - WWI through mid-1970s
- Rome: top fortunes rose ~100x while population grew ~10x (200 BCE - 100 CE)
- 1914 Europe: top 10% owned 90% of total wealth
- Gilded Age US: 2% owned 50% by 1920
- Latin America (no major wars): inequality simply kept rising
- **Critical finding**: Most disasters actually WIDENED gaps because elites captured recovery resources. The Black Death was exceptional because labor became so scarce that structural power shifted.
- **Modeling implication**: Concentration is the default trajectory; shocks only level when they fundamentally shift structural power

### 2.8 Stochastic Models (Kesten Processes)
- **THE canonical mathematical framework** (Kesten 1973)
- W(t+1) = A(t) * W(t) + B(t)
  - A(t) = multiplicative shock, B(t) = additive reinjection
- Produces stationary Pareto tail when E[log A] < 0 but A occasionally exceeds 1
- For lognormal A with parameters (mu, sigma): tail exponent alpha = -2mu/sigma^2
- **This is the model to implement at the stratum level**

### 2.9 Additional Factors
- **Labor share decline**: US 70% (1947) → 53.8% (2025). Market power ~2/3, technology ~1/3
- **Financialization**: Financial sector rents ~4% of GDP
- **Rent-seeking**: Broader estimates much larger than textbook 1-2% of GDP
- **Monopoly/monopsony**: Market concentration increased in most US industries
- **Skill-biased technological change**: Affects wage distribution within labor

---

## PART 3: RESEARCH FINDINGS — INFLATION, WAGES, CEO COMPENSATION

### 3.1 Inflation Dynamics
- Five mechanisms: money supply expansion, velocity, demand-pull, cost-push, asset price inflation
- Market economies: visible, measurable inflation
- Planned economies: "repressed inflation" — prices fixed but shortages manifest
- Barter economies emerge when money loses trust entirely
- **Inflation is NOT neutral**: debtors benefit, creditors and asset-poor lose
- Asset price inflation specifically concentrates wealth among asset owners
- **For simulation**: Would require tracking consumer vs asset inflation separately

### 3.2 Wage Stratification
- **The great divergence**: Productivity and worker pay grew in lockstep 1948-1973 (~97% and ~91%). After 1973: productivity +74%, worker pay +9% by 2013. Gap now 44pp.
- **Labor share**: Declined from ~55% to ~42-50% since 1970s. Driven ~50% by tech/automation, ~25% by globalization, rest by superstar firm dynamics.
- **Skill premium**: College wage premium rose sharply 1980-2000, plateaued since. OECD average: tertiary-educated earn ~54% more.
- **Top 1% share**: U-curve: ~20% (1920s) → ~9% (1976) → ~20% (today)

### 3.3 CEO/Executive Compensation
- CEO-to-worker ratio: 21:1 (1965) → 31:1 (1978) → 380:1 (2000 peak) → 281:1 (2024)
- CEO pay rose 1,094% since 1978 vs 26% for workers
- 79% of modern CEO pay is stock-related
- Weak correlation between CEO pay and company performance
- **International variation**: US 200-400:1, Germany 50-70:1 (codetermination), Japan 15-50:1
- **Ratchet effect**: Peer benchmarking creates one-way escalator. Firms actively add higher-paid peers, drop lower-paid ones (Faulkender & Yang 2013)
- **Buyback channel**: Stock buybacks inflate EPS without improving real performance

### 3.4 Key Metrics Reference Values
- **Gini**: 0.15-0.25 (hunter-gatherer) → 0.55-0.75 (failed state/oligarchy). Global peak 0.72 in 1910 and 2000.
- **Palma ratio**: Middle 50% always captures ~50% of income. All variation is top 10% vs bottom 40%. Range: <1.0 (Nordic) to 7.0 (South Africa).
- **Labor share**: Start ~55%, declining with automation/tech.
- **CEO-to-worker ratio**: Function of economic system, regulation, financialization, union power, culture, wealth concentration.

---

## PART 4: RECOMMENDATIONS

### HIGH VALUE — Worth Implementing

#### 1. Replace Additive Wealth Drift with Multiplicative Dynamics
**Current**: `wealthConc += 0.05` (linear, same speed at any level)
**Proposed**: `wealthConc *= (1 + rate)` where rate depends on conditions

- Going from 20→25 currently takes same time as 80→85 — unrealistic
- Multiplicative: concentration accelerates as it grows
- Small code change, qualitatively different (and more realistic) trajectories
- Rate modifiers: governance type, economic model, institutional quality, tax policy

**Implementation sketch**:
```javascript
// In civilization.js, replace lines 700-708:
if (this.economic.accumulationAllowed && this.governance.hierarchyLevel > 40) {
  // Multiplicative: rate scales with existing concentration
  const baseRate = 0.002; // ~0.2% per turn
  const hierarchyMult = (this.governance.hierarchyLevel - 40) / 60; // 0-1
  const rate = baseRate * (1 + hierarchyMult);
  this.economic.wealthConcentration = Utils.clamp(
    this.economic.wealthConcentration * (1 + rate), 0, 95
  );
} else if (!this.economic.accumulationAllowed) {
  // Decay toward floor (redistributive pressure)
  const decayRate = 0.003;
  const floor = 5;
  this.economic.wealthConcentration = Utils.clamp(
    this.economic.wealthConcentration * (1 - decayRate) + floor * decayRate, floor, 50
  );
}
```

#### 2. Add Labor Share Metric
**New field**: `civ.economic.laborShare` (0-100, initialized per economic model)

Starting values by model:
- Gift/commons/labor_credit: 80-85 (most goes to workers)
- Mixed/barter: 60-65
- Market: 55-60
- Planned: 50-55 (state captures the rest)
- Hierarchical: 45-50

Per-turn drift based on:
- Automation level: -0.1 to -0.5 per turn at levels 3-5
- Wealth capture degree: -0.02 * (degree/100) per turn
- Education quality > 60: +0.01 (skilled workers capture more)
- Governance participation (direct/consensus): +0.02

Effects:
- Feed into per-stratum wellbeing more meaningfully
- Low labor share + high wealth concentration = high pressure for instability

#### 3. Add Computed Compensation Ratio (Display Only)
**Not a separate simulation variable** — derived from existing state:

```javascript
// Approximate elite-to-working-class compensation ratio
const baseRatio = { gift: 3, commons: 5, labor_credit: 4, barter: 8,
                    mixed: 15, commodity: 20, planned: 12, market: 25,
                    hierarchical: 40 }[econModel] ?? 15;
const concentrationMult = 1 + (wealthConcentration / 100) * 10; // 1x at 0, 11x at 100
const institutionalDamper = 1 - (institutionalQuality / 200); // 0.5x at IQ=100, 1x at IQ=0
const ratio = Math.round(baseRatio * concentrationMult * institutionalDamper);
// Produces: ~3:1 (gift economy) to ~300+:1 (market + high concentration + weak institutions)
```

Display in Finance & Trade panel as "Elite-to-Worker Income Ratio: X:1"

#### 4. Add Inheritance Mechanic
**New field**: `civ.governance.inheritanceSystem` — 'partible' | 'primogeniture' | 'meritocratic' | 'communal'

Defaults by governance type:
- flat_consensus, direct_congress, rotating: 'communal'
- representative, elder_council: 'partible'
- autocratic, oligarchy, theocratic, tribal_chief: 'primogeniture'

Effect: Modifier on wealth concentration drift rate:
- communal: -0.003/turn (active redistribution each generation)
- partible: -0.001/turn (dilutes across heirs)
- meritocratic: 0 (neutral)
- primogeniture: +0.002/turn (compounds across generations)

Player-changeable via paradigm panel or events.

### MODERATE VALUE — Consider Later

#### 5. Simple Tax Policy Lever
A taxation level (regressive ↔ progressive) that modifies wealth concentration drift.
Would pair well with the multiplicative dynamics change.

#### 6. Derived Gini Display
Compute approximate Gini from wealthConcentration + laborShare + equalityIndex.
Display-only, no new simulation variable.

### NOT RECOMMENDED (excessive complexity)

- Full inflation/monetary system (needs price system, money supply, velocity)
- Per-agent wealth tracking (we model strata, not individuals)
- Full Kesten process (requires individual agent simulation)
- Actual Lorenz curve computation

---

## SOURCES

### Wealth Accumulation
- Pareto (1896), Benhabib/Bisin/Zhu (2011, Econometrica), Gabaix (2009, Annual Review of Economics)
- Piketty (2014, Capital in the Twenty-First Century)
- Jorda/Schularick/Taylor (2019, QJE) — r > g dataset, 16 countries, 1870-2015
- Goes (2016, IMF Working Paper) — r > g contested in 75% of countries
- Ole Peters — Ergodicity Economics, non-ergodic wealth dynamics
- Perc (2014, J Royal Society Interface) — Matthew Effect comprehensive review
- Petersen et al (2011, PNAS) — Quantitative evidence in career dynamics
- Saez/Zucman (2019, Brookings) — Progressive Wealth Taxation
- Scheidel (2017, Great Leveler) — Historical inequality patterns
- Kesten (1973) — Stochastic processes producing Pareto tails
- Michels (1911) — Iron Law of Oligarchy
- IMF (2019) — Bank Lobbying and Regulatory Capture
- Harvard Corpgov (2025) — Political Power and Market Power feedback

### Inflation, Wages, Compensation
- EPI: CEO Pay in 2023, CEO Pay in 2024, Productivity-Pay Gap
- EPI: Wage Stagnation in Nine Charts, Historic Divergence
- BLS: Estimating the US Labor Share
- Our World in Data: Labor Share of GDP
- World Inequality Report 2022, World Inequality Database
- Doepke/Schneider (JPE) — Inflation and Redistribution of Nominal Wealth
- St. Louis Fed — Impact of Inflation's Wealth Transfer Effect
- CEPR — Why the Middle Class Benefits from Inflation
- Faulkender/Yang (2013) — Compensation Peer Benchmarking
- Garvey/Milbourn — Asymmetric Benchmarking in Executive Pay
- OECD — Earnings by Educational Attainment
- AFL-CIO Executive Paywatch 2025
- WTW (2025) — CEO Pay Landscape in Japan, US, Europe
