# Research: Inflation, Wage Stratification, Executive Compensation & Inequality Metrics

Compiled for civ-sim economic modeling. Each section notes data sources and empirical confidence levels.

---

## 1. INFLATION DYNAMICS IN CIVILIZATIONS

### 1.1 What Drives Inflation Historically

**Monetary/Money Supply (Well-established)**
- The Quantity Theory of Money (MV = PQ) is the classical framework. Friedman: "inflation is always and everywhere a monetary phenomenon."
- Currency debasement drove Roman inflation. The denarius went from high silver content to ~5% silver by the 3rd century AD. Estimated inflation: 4-5% per annum under Diocletian (284-305 AD).
- Wheat in Roman Egypt: 6 drachmas in 1st century AD -> 200 drachmas by AD 276 (~33x over 275 years).
- Post-2008 QE showed the limits: massive money supply expansion WITHOUT corresponding inflation, because velocity collapsed. Fed chair Powell (2021): the link between money supply and inflation "ended about 40 years ago."

**Velocity of Money (Empirically complex)**
- Velocity is the critical but unstable variable. In recessions, money supply can rise 5% but velocity falls, so prices don't rise.
- Post-2008: M2 increased ~45% from 2010-2015, far faster than GDP growth, yet inflation DECLINED. Velocity collapsed as banks/consumers hoarded.
- Key insight for simulation: money supply increases only cause inflation when velocity is maintained.

**Demand-Pull (Well-established)**
- Arises when aggregate demand exceeds sustainable aggregate supply.
- Keynesian framework: expansionary fiscal/monetary policy, consumer confidence surges.
- Post-COVID 2021: classic demand-pull as reopening unleashed pent-up spending against constrained supply.

**Cost-Push (Well-established)**
- Supply shocks (oil embargoes, pandemics, wars) raise production costs.
- 1970s OPEC embargo: textbook case. Combined with demand-pull = stagflation.
- 2022 Ukraine invasion: energy + agricultural supply disruption compounded existing inflation.
- IMF finding: monetary policy tightening significantly reduces demand-driven inflation but has LIMITED effect on supply-driven inflation.

**Asset Price Inflation (Increasingly documented)**
- Distinct from consumer price inflation (CPI). CPI excludes financial/capital assets.
- S&P 500 increased ~400% in a period where CPI rose far less. Housing prices outpaced CPI by multiples.
- NBER: excluding asset prices introduces ~0.25 percentage point annual downward bias in CPI.
- Driven by low interest rates: investors pushed into equities/real estate when safe returns vanish.
- Key inequality mechanism: asset owners benefit enormously while non-owners face rising housing costs.

**Sources:** Doepke & Schneider (JPE 2006), IMF WEO 2017, NBER Working Papers, Reserve Bank of Australia, Federal Reserve Bank of St. Louis, Peter Temin (MIT/AEA), Constantina Katsari (Roman inflation research).

### 1.2 Inflation Across Economic Systems

**Market Economies**
- Inflation driven by money supply, velocity, demand/supply dynamics.
- Central banks use interest rate tools (monetary policy) and governments use fiscal policy.
- Historical range: 1-3% "target" inflation in modern developed economies; much higher during crises (1970s: 10-14% in US/UK).

**Planned Economies (Soviet Example)**
- Official position: "inflation cannot exist in a socialist planned economy."
- Reality: "repressed inflation" -- government controls prices, creating shortages instead of visible price increases.
- Dual monetary system: household cash vs. industrial accounting money (non-convertible).
- When controls lifted (1992): 2,300-2,500% inflation in one year. The repressed inflation was real all along.
- Early Soviet hyperinflation (1917-1924): three redenominations (10,000:1, 100:1, 50,000:1). Monthly inflation averaged ~50%.

**Barter/Commodity Systems**
- Roman crisis: as money lost value, people reverted to barter and hoarded precious metals.
- Post-Soviet Russia (1990s): barter economy re-emerged when rubles became worthless ("you'd take bricks as payment over rubles").
- War Communism (1919-1920): wages paid in kind, virtual abolition of banking. Gresham's Law observed (bad money drives out good).

**Commodity-Backed Systems**
- Gold standard constrains money supply growth, limiting inflation.
- Eastern Roman Empire's stable gold solidus preserved economic stability vs. Western collapse.
- Constraint: limits government spending flexibility, can cause deflation during downturns.

**Confidence level:** Well-established historical patterns. Soviet repressed inflation is well-documented in academic literature (Kornai, Harrison).

### 1.3 Historical Inflation Rates by Era (Approximate)

| Era/System | Annual Rate | Notes |
|---|---|---|
| Roman Pax Romana (1st-2nd c. AD) | 0.5-1% | Manageable, trade-driven |
| Roman Crisis (3rd c. AD) | 4-5%+ | Debasement-driven, likely higher |
| Medieval Europe (gold/silver) | ~0-1% | Commodity money constrained inflation |
| Early modern Spain (16th c.) | 1-2% | New World silver inflows |
| Industrial revolution | 1-3% | Variable, tied to gold standard |
| WWI/WWII periods | 10-30%+ | War financing |
| Post-WWII stable era (1950s-60s) | 2-4% | Bretton Woods constraint |
| 1970s stagflation | 8-14% | Oil shock + demand |
| Great Moderation (1985-2007) | 2-3% | Central bank targeting |
| Post-COVID (2021-2023) | 5-9% | Supply chain + demand + fiscal |
| Soviet repressed (1930s-1980s) | Official: 0%, Real: unknown but significant | Manifested as shortages |
| Soviet collapse (1992) | 2,300-2,500% | Price controls lifted |

### 1.4 Inflation and Wealth Concentration

**Key Finding: Inflation is NOT neutral -- it redistributes wealth, but the direction is complex.**

**Debtors win, creditors lose (Well-established)**
- Doepke & Schneider (JPE 2006): Main losers = rich, old households (bondholders). Main winners = young, middle-class households with fixed-rate mortgage debt.
- Government (biggest debtor) also benefits: inflation erodes real value of national debt.
- Federal Reserve Bank of St. Louis confirms this mechanism.

**But the poor are hardest hit (Empirically supported)**
- NY Fed HANK model: inverted U-shape. Poor and very rich hurt most; bottom 1% nearly TWICE as badly affected as top 1%.
- Poor have: no assets to appreciate, no debt to erode, wages that lag prices (the "wage-lag hypothesis").
- Food and energy (necessities) often inflate faster than luxury goods, disproportionately hitting the poor.

**Conflicting evidence on net effect on inequality:**
- Berisha & Meszaros (2020): inflation REDUCES US wealth inequality (bottom 50% and middle 40% benefit through debt erosion).
- 2024 cross-country study: inflation INCREASES wealth inequality by boosting top wealth shares.
- Hasan et al. (2020): NO significant effect found across countries.
- Resolution: effects depend heavily on asset/liability composition, financial development, and type of inflation.

**CEPR/VoxEU finding:** Net impact of inflation on median wealth was POSITIVE in US over 1983-2019, also decreasing wealth inequality vs. top 1%. The debt-erosion channel dominates for the mortgage-holding middle class.

**For simulation:** Model inflation effects differently by tier. Debtors benefit, asset-poor suffer from purchasing power loss, asset-rich can be insulated through asset price inflation.

### 1.5 Asset Price vs. Consumer Price Inflation

**The Great Divergence:**
- Since 2010, central bank policies created massive asset price inflation while consumer prices remained relatively stable.
- Mechanism: QE money enters financial system -> banks/investors buy assets -> prices rise -> money only slowly reaches consumer economy.
- "As central banks inject 'fresh' money through private banks, it drives up asset prices. By the time this money reaches the broader population, prices have risen so much that ordinary citizens not only fail to benefit but often struggle to meet housing costs."
- This is a PRIMARY driver of modern wealth inequality.

**For simulation:** Track asset prices and consumer prices separately. The gap between them directly drives wealth concentration.

---

## 2. WAGE/SALARY STRATIFICATION BY SOCIAL TIER

### 2.1 Income Ratios Between Strata (Historical Data)

**Top 1% Income Share (Piketty & Saez, WID - Well-established):**
- 1920s: 15-20% of national income
- Post-WWII (1950s-1970s): dropped to ~8-9% (progressive taxation, unions, social programs)
- 1976: 9% (the modern low point)
- 2000: ~20% (back to 1920s levels)
- 2011-2021: 14-20% depending on methodology
- Key dynamic: U-shaped curve over the 20th century

**Top 10% vs Bottom 50% (World Inequality Report 2022):**
- Global top 10% share: ~50-60% of total income (1820-2020)
- Global bottom 50% share: ~5-14% of total income
- 1820: T10 = 50%, B50 = 14%
- 1910: T10 = 60%, B50 = 7%
- 1980: T10 = 56%, B50 = 5%
- 2020: T10 = 55%, B50 = 7%

**Global T10/B50 ratio (Chancel & Piketty):**
- 1820: <20x
- 1910: ~40x
- Stabilized around 40x from 1910-2020
- Post-2008: slight decline (driven by between-country convergence, especially China/India growth)

**Income recovery capture (EPI):**
- 2002-2007 recovery: Top 1% captured ~66% of all income growth
- 2009-2014 recovery: Top 1% captured ~58% of all income growth
- Post-WWII (1940s-1970s): income grew at nearly the same pace across ALL percentiles (roughly doubled)

**Sources:** Piketty & Saez (2003, updated), World Inequality Database (wid.world), Congressional Budget Office, EPI.

### 2.2 Wage Stagnation vs. Upper-Tier Growth

**The Productivity-Pay Divergence (EPI - Well-established):**
- 1948-1973: productivity +97%, typical worker compensation +91% (near-lockstep)
- 1973-2013: productivity +74%, typical worker compensation +9% (massive divergence)
- 1979-2019: net productivity +59.7%, median worker compensation +15.8% (43.9 pp gap)
- 2000-2014: net productivity +21.6%, median worker compensation +1.8% (only 8% of productivity growth translated to pay)

**Where the gains went:**
- Top 10% salaries (especially top 1% and 0.1%)
- Capital returns (profits, dividends, capital gains)
- CEO compensation grew 1,094% since 1978 vs. 26% for typical workers

**Policy drivers behind the divergence:**
- Declining unionization
- Stagnant minimum wage (real value declined)
- Excess unemployment tolerated to control inflation
- Trade liberalization / offshoring
- Noncompete clauses and monopsony power
- Tax rate reductions on top incomes

**The benefits myth debunked:**
- Common claim: wages stagnated but total compensation (including benefits) grew.
- Reality: Benefits share went from 18.3% to 19.7% of compensation between 1979-2014. The real benefits expansion was 1947-1979 (7.2% -> 18.3%). Benefits growth does NOT explain post-1970s divergence.

**Methodological note:** Results vary by deflator. CPI-U-RS shows +3% median hourly earnings since 1979; PCE deflator shows +15%. The divergence from productivity is clear under any methodology.

### 2.3 Labor Share of GDP/National Income

**Historical "Fact" Overturned:**
- Keynes called the stability of labor share "one of the most surprising, yet best-established facts in the whole range of economic statistics."
- Since the 1980s, this "fact" no longer holds. Labor share has declined across most developed countries.

**Empirical Data:**
- IMF (2017 WEO): labor income shares in advanced economies nearly 4 pp lower than 1970
- ADB dataset (151 economies, 1970-2015): average labor share declined from 0.547 (1971) to 0.422 (2012)
- OECD: statistically significant but small decline under production perspective; less clear under income perspective (net of depreciation)

**Drivers (IMF):**
- Technology: ~50% of the decline in advanced economies (automation, ICT)
- Globalization: ~25% (trade, GVCs, FDI)
- Skill polarization: middle-skilled workers hit hardest (routine-biased technological change)
- "Superstar firms" (Autor et al.): winner-take-most dynamics -> dominant firms have low labor shares

**For simulation:** Labor share should decline as technology/automation increases, moderated by governance choices (unions, minimum wage, employment protection).

### 2.4 Skill Premium and Education-Wage Gap

**Historical U.S. College Premium:**
- 1910-1950: College premium DECLINED from >60% to ~30%
- 1950-1970: Rose modestly
- 1970-1980: Narrowed
- 1980-2000: Rose RAPIDLY (major contributor to inequality)
- Post-2000: Plateaued (technical change may no longer favor college graduates)

**OECD Cross-Country Data:**
- Tertiary-educated workers earn ~54% more than upper-secondary-educated workers (OECD average)
- Full premium varies dramatically: from modest in Nordic countries to large in the US and UK
- Employment protection explains ~40% of the US-Germany college premium gap (Doepke & Gaetani)

**Life-Cycle Dynamics:**
- College premium starts at ~43% at career start, grows to 75% by year 1, then +3-5 pp per year
- By age 55, premium has more than doubled from age 25

**For simulation:** Skill premium should vary by education system tier, technology level, and employment protection laws. Higher automation initially increases skill premium, but may plateau or reverse with AI.

---

## 3. CEO/EXECUTIVE COMPENSATION

### 3.1 CEO-to-Worker Pay Ratio Over Time (US Data)

**EPI Data (Top 350 US firms by revenue - Well-established):**

| Year | Ratio (Realized) | Notes |
|---|---|---|
| 1965 | 21:1 | Post-war era |
| 1978 | 31:1 | Pre-Reagan |
| 1989 | 60:1 | Deregulation era |
| 1995 | ~130:1 | Stock option explosion begins |
| 2000 | 380:1 | Dot-com bubble peak |
| 2007 | 346:1 | Pre-financial crisis |
| 2009 | ~200:1 | Crisis dip |
| 2020 | 351:1 | Pandemic stock surge |
| 2021 | 399-405:1 | Historic high |
| 2023 | 290:1 | Stock market correction |
| 2024 | 281:1 | S&P 500 average: 285:1 (AFL-CIO) |

**Key growth stat:** CEO pay rose 1,094% since 1978 vs. 26% for typical workers.

**Low-wage employers:** The ratio at America's 100 largest low-wage employers was 632:1 in 2024 (up from 560:1 in 2019).

**CEOs vs. even the top 0.1%:** In 2023, CEOs were paid 7.5x as much as the top 0.1% of workers (up from 2.6x average in 1965-1978).

### 3.2 Components of Executive Compensation

**Modern breakdown (2024 data):**
- Stock-related pay: 79% of average realized CEO compensation (~$18.2M average)
- Base salary: relatively small portion
- Cash bonuses: performance-linked but often weakly tied to real performance
- Golden parachutes: severance guarantees regardless of performance
- Deferred compensation: tax-advantaged wealth accumulation

**Historical shift:** Pre-1970, large firms' real value grew 6.1%/yr but CEO pay growth was 0.1%/yr. Post-1970: firm value growth declined to 5.2%/yr but CEO pay growth surged to 4.6%/yr.

### 3.3 Compensation vs. Performance (Weak Correlation)

**Key findings:**
- EPI: "Rising CEO pay does not reflect a rising value of skills or contributions to firms' productivity." CEO compensation reflects substantial "rents" (income in excess of actual productivity).
- CEO pay grew 3x faster than top 0.1% wages and 2x faster than corporate profits.
- Asymmetric benchmarking (Garvey & Milbourn): executives lose 25-45% LESS pay from bad luck than they gain from good luck.
- Research shows companies with larger CEO-employee pay ratios exhibit WORSE corporate social responsibility performance.

### 3.4 International Comparison

| Country | Median CEO Pay | CEO-to-Worker Ratio | Key Features |
|---|---|---|---|
| US | ~$15M | 200-400:1 | Equity-heavy (60%+ stock/options) |
| UK | ~$10.5M | 80-120:1 | Trending toward US model |
| Germany | ~$5.6M | 50-70:1 | Codetermination (worker board seats) |
| France | ~$4.0M | 40-60:1 | Moderate regulation |
| Japan | ~$1.5M | 15-50:1 | Cultural norms + domestic ownership |
| Sweden | -- | ~40:1 | Strong labor protections |

**Trend:** European/Japanese companies increasingly adopting US-style equity compensation to "compete for global talent." Convergence toward higher ratios.

**Source:** WTW Global Executive Compensation Analysis, Equilar, EPI, AFL-CIO Executive Paywatch.

### 3.5 The Ratchet Effect in Executive Compensation

**Mechanism (Bebchuk & Fried, 2004 - Well-documented):**
1. Compensation committees benchmark CEO pay against "peer group"
2. Peers are often strategically chosen (firms with HIGHER-paid CEOs)
3. Boards target median or above-median of peer group
4. Since most firms target above-median, the median ratchets up each year
5. Process repeats: upward spiral with no natural ceiling

**Empirical evidence:**
- Faulkender & Yang (2013): After enhanced disclosure rules, firms ACTIVELY added higher-paid peers and dropped lower-paid peers. Bias did NOT decrease with transparency.
- Rousseau et al. (Management Science): Average firm uses an upwardly biased peer group. Bias increases when financial targets are not met.
- ISS peer manipulation: Firms expecting high CEO pay influence ISS to revise peer sets upward. These firms underperform, suggesting camouflage of excessive pay.

**Paradox of disclosure:** The 1993 disclosure rules and 162(m) tax cap on non-performance pay were intended to restrain CEO compensation. Instead, they INCREASED it by: (a) providing benchmarking ammunition, (b) shifting pay to stock options (which exploded in value).

### 3.6 Stock Buybacks and Executive Compensation

**The EPS channel:**
- Buybacks reduce outstanding shares -> EPS increases mechanically (no real performance improvement)
- EPS is a key metric in most executive LTI plans
- ROE, ROA, ROIC also improve after buybacks (lower asset base)

**Empirical findings:**
- CEO option incentives causally drive stock repurchases (Bens et al., 2003)
- Strong association between buyback quarters and high insider selling
- Most S&P 500 companies do NOT adjust performance goals to account for buyback effects
- Well-connected CEOs may time buybacks to inflate short-term valuations

---

## 4. KEY METRICS & RATIOS FOR SIMULATION

### 4.1 Gini Coefficient

**Definition:** Ranges from 0 (perfect equality) to 1 (perfect inequality).

**Empirical ranges:**
- Very equal (Nordic): 0.25-0.30
- Moderate (Western Europe): 0.30-0.35
- High (US, China): 0.35-0.45
- Very high (Latin America, sub-Saharan Africa): 0.45-0.55
- Extreme (South Africa): 0.60+
- Pre-industrial/archaeological: highly variable (GINI Project, ~45,000 houses analyzed)

**Historical dynamics (Global Gini - WIR 2022):**
- 1820: 0.60
- 1910: 0.72 (peak)
- 1980: high but declining
- 2000: 0.72 (second peak)
- 2020: 0.67

**Simulation ranges by economic system (suggested based on data):**

| System | Typical Gini Range |
|---|---|
| Hunter-gatherer | 0.15-0.25 |
| Early agricultural | 0.25-0.40 |
| Feudal/aristocratic | 0.45-0.65 |
| Market capitalist (weak regulation) | 0.40-0.55 |
| Market capitalist (strong welfare state) | 0.25-0.35 |
| Social democracy | 0.22-0.30 |
| State socialist/planned | 0.25-0.35 (official; real may be higher due to in-kind privileges) |
| Failed state | 0.55-0.75 |
| Oligarchy/kleptocracy | 0.55-0.70 |

### 4.2 Palma Ratio

**Definition:** Share of income of top 10% / share of bottom 40%.

**Key insight (Gabriel Palma):** The middle 50% (deciles 5-9) ALWAYS captures roughly 50% of national income across countries and time periods. All variation in inequality comes from how the remaining 50% is split between the top 10% and bottom 40%.

**Empirical values:**
- <1.0: Very equal (Nordic, Benelux) -- bottom 40% gets more than top 10%
- ~1.0: France (1996: 1.01)
- 1.0-1.5: Most of Western/Central Europe
- 2.0-3.0: US, UK, most middle-income countries
- 5.0-7.0: South Africa, most unequal societies

**Advantage over Gini:** More sensitive to changes at the tails (top 10%, bottom 40%), which is where inequality actually manifests. Gini is oversensitive to the stable middle.

**For simulation:** The "Palma Proposition" is strong. Model the middle 50% as capturing ~50% of income with moderate variance, and inequality as the split of the other 50% between top 10% and bottom 40%.

### 4.3 S80/S20 Ratio

**Definition:** Total income of top 20% / total income of bottom 20%.

**Empirical values:**
- Nordic: 3.5-4.5
- Western Europe: 4.5-6.0
- US: 8-10
- Latin America: 10-20+
- Most unequal: 20+

### 4.4 Labor Share of National Income

**Definition:** Total labor compensation as % of GDP.

**Historical trend:**
- Pre-1980s: ~54-55% (OECD average), considered stable
- 2012: ~42% (global average from ADB dataset)
- Current OECD: ~50-52% (varies significantly by country)
- Decline: ~4 pp in advanced economies since 1970 (IMF)

**Drivers of decline:** Technology (50%), globalization (25%), superstar firms, declining unionization.

**For simulation:** Model labor share as function of:
- Technology/automation level (higher = lower labor share)
- Union strength / labor protections
- Market concentration (superstar firms effect)
- Trade openness (globalization pressure)
- Starting point: ~55% pre-industrial, declining with industrialization and automation

### 4.5 CEO-to-Median-Worker Ratio as Function of System Variables

**Suggested simulation parameters based on empirical data:**

| Factor | Effect on CEO-Worker Ratio |
|---|---|
| Market economy, weak regulation | 200-400:1 (US model) |
| Market economy, strong regulation | 40-80:1 (European model) |
| Market economy + codetermination | 50-70:1 (Germany model) |
| Social democracy | 20-40:1 |
| Planned economy | 5-10:1 (officially; real privileges may be equivalent to 20-30:1) |
| Strong unions | Reduces ratio by 30-50% |
| High financialization / stock-based pay | Multiplies ratio 3-5x |
| Transparency / disclosure requirements | Paradoxically can INCREASE ratio (benchmarking ratchet) |
| Cultural norms (collectivist) | Reduces ratio (Japan model) |
| High wealth concentration | Amplifies ratio through stock price appreciation |

### 4.6 Key Dynamic Relationships for Simulation

1. **Inflation -> Wealth redistribution:** Moderate inflation benefits middle-class debtors, hurts asset-poor and bondholders. High inflation hurts everyone, poor most.

2. **Technology -> Labor share:** Higher technology reduces labor share, initially increases skill premium, eventually may plateau.

3. **Financialization -> CEO pay:** More stock-based compensation -> higher CEO ratios -> higher wealth concentration -> more financialization (positive feedback loop).

4. **Union strength -> Wage distribution:** Stronger unions compress wage distribution, maintain labor share, reduce CEO ratios.

5. **Globalization -> Wage pressure:** Offshoring suppresses wages for tradeable-sector workers, increases returns to capital and high-skill workers.

6. **Education access -> Skill premium:** Wider education access initially increases skill premium (productivity rises), then compresses it (supply catches up with demand). Employment protection moderates the premium by ~40%.

7. **Asset price inflation -> Wealth concentration:** When asset prices rise faster than consumer prices, wealth concentrates among asset owners. This is amplified by low interest rates.

8. **Ratchet effect in executive pay:** CEO pay has a built-in upward ratchet through peer benchmarking. Only major economic crises temporarily reduce it, and it recovers faster than worker pay.

9. **Palma stability:** The middle 50% income share is remarkably stable (~50%) across systems. Inequality changes manifest almost entirely in the top 10% vs. bottom 40% split.

---

## SOURCES AND CONFIDENCE LEVELS

### Highly Established (multiple independent confirmations)
- Productivity-pay divergence post-1970s (EPI, BLS, CBO)
- CEO-to-worker ratio trajectory (EPI, AFL-CIO, SEC disclosures)
- Labor share decline (IMF, OECD, Penn World Table)
- Top 1% income share U-curve (Piketty & Saez, WID)
- Gini coefficient ranges by country (World Bank, FRED, SWIID)
- Roman currency debasement -> inflation (numismatic evidence)
- Soviet repressed inflation (Kornai, Harrison)
- Quantity theory basics (Friedman, though modern application debated)

### Well-Supported (strong evidence, some methodological debate)
- Inflation wealth redistribution channels (Doepke & Schneider)
- Ratchet effect in CEO pay (Bebchuk & Fried, Faulkender & Yang)
- Palma Proposition stability (Palma, WID)
- Skill premium dynamics (OECD PIAAC, Katz & Murphy)
- Asset price vs. consumer price divergence (NBER, central bank research)
- Buyback-compensation linkage (Bens et al., Babenko)

### Emerging/Debated
- Net effect of inflation on inequality (conflicting findings)
- Whether skill premium will reverse with AI
- Causal mechanism of superstar firms on labor share
- Whether post-2000 college premium plateau is permanent

### Key Data Repositories
- World Inequality Database (wid.world)
- EPI State of Working America Data Library
- OECD Income Distribution Database
- Penn World Table
- FRED (Federal Reserve Economic Data)
- World Bank (Gini index)
- SWIID (Standardized World Income Inequality Database)
- Chartbook of Economic Inequality
- AFL-CIO Executive Paywatch
