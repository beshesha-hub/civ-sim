# Minsky Financial Instability Hypothesis: Research for Civ-Sim Implementation

## 1. The Three-Stage Financing Framework

Minsky classifies economic units into three categories based on the relationship between their income cash flows and their debt service obligations.

### 1.1 Hedge Finance

**Definition**: Cash flows from operations are sufficient to meet ALL contractual payment obligations -- both interest AND principal repayment.

**Income vs Debt Service**: Revenue > Interest + Principal. The unit is fully self-financing with respect to its debt.

**Indicators**:
- Low debt-to-income ratios (typically < 3x annual income)
- Debt service coverage ratio > 1.5
- No need to refinance or roll over debt
- Conservative lending standards prevailing
- Low leverage across the economy

**Effects on Economy**:
- System tends toward equilibrium-seeking behavior
- Stable asset prices
- Low default rates
- Credit growth roughly matches income growth
- Economy is resilient to interest rate shocks

**Conditions that Trigger Transition to Speculative**:
- Prolonged period of stability and rising asset prices
- Declining risk premiums ("stability breeds overconfidence")
- Rising profit rates that encourage borrowing for expansion
- Financial innovation that creates new lending instruments
- Regulatory loosening or deregulation
- Competitive pressure among lenders leading to easier terms

### 1.2 Speculative Finance

**Definition**: Cash flows from operations cover interest payments but NOT principal repayment. The unit must regularly refinance (roll over) maturing debt.

**Income vs Debt Service**: Revenue > Interest, but Revenue < Interest + Principal. The firm is solvent but depends on continuous access to credit markets.

**Indicators**:
- Debt-to-income ratios rising (3x-6x annual income)
- Debt service coverage ratio between 1.0 and 1.5
- Increasing reliance on short-term funding for long-term assets
- Interest-only loans becoming common
- Maturity mismatch: short-term borrowing funding long-term assets
- Rising asset prices used to justify debt levels

**Effects on Economy**:
- Increased sensitivity to interest rate changes
- Asset prices increasingly driven by credit availability rather than fundamentals
- Financial system becomes vulnerable to refinancing risk
- Credit growth exceeds income growth
- Rising leverage amplifies both upswings and downswings

**Conditions that Trigger Transition to Ponzi**:
- Further rises in asset prices encourage borrowing against appreciation
- Interest rates rise or credit conditions tighten unexpectedly
- Income growth slows while debt continues to accumulate
- Lenders extend credit based on collateral values rather than income
- Growing gap between asset prices and underlying cash flows

### 1.3 Ponzi Finance

**Definition**: Cash flows from operations are insufficient to cover even the interest payments. The unit must either borrow additional funds to pay interest, or sell assets. Only rising asset values keep the unit solvent.

**Income vs Debt Service**: Revenue < Interest. The unit's equity is declining even as its liabilities grow.

**Indicators**:
- Debt-to-income ratios extreme (> 6x annual income)
- Debt service coverage ratio < 1.0
- Borrowing to pay interest (capitalizing interest)
- Asset prices far above fundamental valuations
- Rapid credit growth disconnected from income growth
- Widespread "extend and pretend" behavior
- Rising share of income devoted to debt service across economy

**Effects on Economy**:
- Any disruption to credit availability triggers forced asset sales
- Asset prices become entirely dependent on continued credit expansion
- Margins of safety are minimal
- Default cascades become possible
- System is "deviation-amplifying" -- small shocks produce large effects

**What Happens When Ponzi Collapses**:
- Units forced to sell assets to service debt
- Asset sales depress prices further (Fisher debt-deflation spiral)
- Falling collateral values trigger more forced sales
- Credit contracts sharply
- Defaults cascade through interconnected balance sheets
- "Minsky Moment" -- sudden collective realization of overvaluation

### 1.4 System-Level Dynamics

The key Minsky insight is that **the proportions matter**: if hedge financing dominates, the economy is stable. As the weight shifts toward speculative and Ponzi finance, the economy becomes a deviation-amplifying system. The transition happens endogenously during periods of prolonged prosperity -- "stability is destabilizing."

**Approximate thresholds for system behavior** (synthesized from empirical literature):
- Economy > 70% hedge units: stable, self-correcting
- Economy 50-70% hedge units: moderately fragile, cyclical
- Economy < 50% hedge units: fragile, crisis-prone
- Economy with significant Ponzi share (> 15-20%): crisis imminent

---

## 2. Keen's Mathematical Formalization

### 2.1 Foundation: Goodwin Growth Cycle (1967)

The base model is a Lotka-Volterra predator-prey system with two state variables:
- omega (wage share of output)
- lambda (employment rate)

Workers consume all wages; capitalists invest all profits. Output Y = K/v where K is capital and v is the capital-to-output ratio.

### 2.2 The Keen Extension: Three-Dimensional System

Keen (1995) adds debt by allowing firms to borrow to invest beyond profits. The system becomes three coupled ordinary differential equations in:

- **x1 = omega** (wage share of output = wL/Y)
- **x2 = lambda** (employment rate = L/N)
- **x3 = d** (debt-to-output ratio = D/Y)

#### The Three Differential Equations

**(Eq 1) Wage share dynamics:**
```
dx1/dt = x1 * [Phi(x2) - alpha]
```

**(Eq 2) Employment rate dynamics:**
```
dx2/dt = x2 * [kappa(pi)/v - alpha - beta - delta]
```

**(Eq 3) Debt ratio dynamics:**
```
dx3/dt = x3 * [r - kappa(pi)/v + delta] + [kappa(pi) - (1 - x1)]
```

Where:
- alpha = labor productivity growth rate
- beta = population (labor force) growth rate
- delta = capital depreciation rate
- v = capital-to-output ratio (accelerator)
- r = real interest rate on debt
- pi = profit rate = 1 - x1 - r*x3 (output minus wages minus interest payments)

#### The Profit Rate

```
pi = 1 - omega - r * d
```

Profit equals output (normalized to 1) minus the wage share minus interest payments on debt.

#### The Phillips Curve Function (Wage Bargaining)

Keen uses a nonlinear Phillips curve relating wage changes to employment:

```
Phi(lambda) = phi1 / (1 - lambda)^2 - phi0
```

Typical parameter values:
- phi0 = 0.04340277
- phi1 = 0.00006944

This function is nearly flat at low employment, rises steeply as employment approaches 1 (full employment), and equals alpha at equilibrium employment.

#### The Investment Function

Keen (1995) uses a generalized exponential; later versions use arctangent:

**Exponential form (Keen 1995/2013):**
```
kappa(pi) = kappa0 + exp(kappa1 + kappa2 * pi)
```
Parameters: kappa0 = -0.0065, kappa1 = -5, kappa2 = 20

**Arctangent form (Grasselli & Costa Lima 2012; Perez Avellaneda et al. 2024):**
```
kappa(x1, x3) = kappa0 + kappa1 * arctan(kappa2 * (1 - x1 - r*x3) + kappa3)
```
Parameters: kappa0 = 0.5, kappa1 = -0.31831, kappa2 = -63.989, kappa3 = 11.9914

Both forms capture the same insight: investment exceeds profits when profit rates are high (firms borrow to invest), and falls below profits when rates are low (firms retrench).

### 2.3 Standard Parameter Values

| Parameter | Symbol | Value | Description |
|-----------|--------|-------|-------------|
| Productivity growth | alpha | 0.025 | 2.5% per year |
| Population growth | beta | 0.02 | 2.0% per year |
| Depreciation rate | delta | 0.01 | 1.0% per year |
| Capital-output ratio | v | 3.0 | $3 of capital per $1 of annual output |
| Real interest rate | r | 0.03 | 3.0% per year |

### 2.4 Equilibria and Dynamics

The system has two equilibria:

**"Good" equilibrium**: Finite debt, positive employment, positive wage share. The economy grows at the natural rate (alpha + beta). The system converges here if initial debt is low enough.

**"Bad" equilibrium**: Infinite debt ratio, zero employment, zero wage share. This is the debt-deflation collapse -- a Great Depression outcome.

**Key dynamic behavior**:
1. Short run: Debt servicing costs reduce profits, dampen investment, cycles contract
2. Long run: Debt accumulates across cycles, each recovery adds more debt
3. Eventually: Debt crosses a threshold where servicing costs permanently suppress profits
4. Collapse: Wages and employment crash to zero; debt ratio explodes

This matches Minsky's verbal description: short-run dampening (the "Great Moderation") followed by long-run crisis (the "Great Recession").

### 2.5 Key Relationships for Simulation

**Debt drives the cycle**: The debt ratio is the slow-moving variable that transforms short-run stability into long-run fragility.

**Profit rate is the key intermediary**: Investment depends on profit. Profit depends on wages and debt service. Rising debt erodes profit, which reduces investment, which reduces employment and wages.

**The crisis threshold**: When r * d > (1 - omega), interest payments exceed the entire profit share. This is the Ponzi condition at the macro level.

---

## 3. Kindleberger-Minsky Cycle Stages

### 3.1 Stage 1: Displacement

**What**: An exogenous shock creates new profit opportunities. This can be a technological innovation, policy change, war, discovery of resources, financial deregulation, or sharp interest rate reduction.

**Duration**: The displacement itself is a discrete event. The initial investment response unfolds over 1-3 years.

**Triggers transition to Boom**: When early investors earn above-normal returns, attracting attention and imitation.

**Historical examples**:
- Canal mania (1790s): canal construction in England
- Railway mania (1840s): railroad expansion
- Dot-com (1993-95): commercialization of the internet
- Housing bubble (2001-03): Fed rate cuts to 1%, securitization innovation

### 3.2 Stage 2: Boom / Credit Expansion

**What**: Rising prices create positive feedback. New investment increases income, which stimulates further investment. Credit expands as banks lend against rising collateral values. Rational investment for production coexists with early speculation.

**Duration**: Typically 3-7 years. Credit booms average about 2 years (8 quarters) in duration but can extend to 5+ years.

**Indicators**:
- Credit growth exceeding GDP growth by 2-5 percentage points annually
- Rising asset prices (real estate, equities)
- Declining credit spreads
- New financial instruments appearing
- Growing media coverage of profit opportunities

**Triggers transition to Euphoria**: When price appreciation itself becomes the primary motive for investment, and credit standards begin to erode.

**Historical examples**:
- Railway mania (1843-45): 2 years of accelerating investment
- Dot-com (1996-98): broadening of tech investment
- Housing (2003-05): credit expansion, subprime lending growth

### 3.3 Stage 3: Euphoria / Overtrading

**What**: Speculation for capital gains dominates. "Irrational exuberance" takes hold. Credit standards collapse. Leverage increases dramatically. Novel financial instruments proliferate. The public joins in. As Kindleberger noted, "there is nothing so disturbing to one's well-being and judgment as to see a friend get rich."

**Duration**: Typically 1-3 years. This is the terminal phase of the boom.

**Indicators**:
- Credit growth exceeding GDP growth by 5+ percentage points
- Asset prices far above historical norms relative to income/rents/earnings
- Leverage at extreme levels
- Widespread belief that "this time is different"
- Sharp decline in lending standards
- Proliferation of fraud and accounting irregularities
- Credit spreads at historic lows (risk underpriced)

**Triggers transition to Distress**: Any event that reveals the gap between asset prices and fundamentals -- a major default, fraud revelation, interest rate increase, or simply the exhaustion of new buyers.

**Historical examples**:
- South Sea (1720): shares rose 10x in months before collapse
- Tulipmania (1636-37): terminal frenzy lasted months
- Dot-com (1999-2000): NASDAQ doubled in final year
- Housing (2006-07): subprime originations peaked

### 3.4 Stage 4: Financial Distress / Profit-Taking

**What**: Insiders recognize overvaluation and begin selling. The "smart money" exits. Asset prices plateau or begin declining. Some firms begin experiencing cash flow difficulties. A triggering event -- bank failure, fraud revelation, or price decline -- signals the turn.

**Duration**: Typically 6-18 months. Often compressed.

**Indicators**:
- Insider selling accelerating
- First defaults on speculative positions
- Rising credit spreads
- Some assets beginning to decline while others still rise
- "Greater fool" psychology still present but weakening
- First revelations of fraud or accounting problems

**Triggers transition to Panic**: When the decline becomes self-reinforcing through forced selling, margin calls, and credit contraction.

**Historical examples**:
- Housing (mid-2007): subprime mortgage defaults rising, Bear Stearns hedge funds collapse
- Dot-com (March 2000): NASDAQ peaks, early tech failures
- 1929 (September-October): market begins declining

### 3.5 Stage 5: Panic / Revulsion

**What**: Flight to liquidity. Assets are dumped at fire-sale prices. Credit contracts sharply. Banks call in loans and refuse new lending. Defaults cascade. Asset prices overshoot to the downside. Revulsion -- the complete rejection of the previously favored asset class -- can persist long after prices have bottomed.

**Duration**: The acute panic phase typically lasts weeks to months. The broader revulsion and recovery period extends 2-5 years for output and 4-6 years for asset prices.

**Indicators**:
- Sharp asset price declines (equities fall ~55% peak-to-trough; housing ~35%)
- Credit contraction
- Rising defaults and bankruptcies
- Bank failures or bailouts
- Spike in volatility and risk premiums
- Flight to safe assets (government bonds, cash, gold)

**Resolution mechanisms** (from Kindleberger):
1. Asset prices fall far enough to attract buyers
2. Trading halts / circuit breakers reduce panic selling
3. Lender of last resort provides liquidity (central bank intervention)
4. Government fiscal stimulus / bailouts

**Historical examples**:
- Tulipmania (Feb 1637): prices collapsed in days
- South Sea (1720): crash over several months
- 1929-1933: prolonged collapse over 3 years
- 2008 (Sep-Oct): Lehman failure triggered global panic
- Dot-com (2000-2002): 2.5-year decline

### 3.6 Historical Timeline Summary

| Crisis | Displacement | Boom Duration | Euphoria | Total Displacement-to-Panic | Recovery to Pre-Crisis GDP |
|--------|-------------|---------------|----------|---------------------------|--------------------------|
| Dutch Tulipmania (1636-37) | Tulip introduction | ~2 years | ~3 months | ~2 years | ~1 year (limited macro impact) |
| South Sea Bubble (1720) | Government debt conversion | ~1 year | ~6 months | ~18 months | ~2 years |
| Railway Mania (1845-47) | Rail technology | ~4 years | ~2 years | ~6 years | ~3 years |
| US Panic of 1873 | Post-Civil War expansion | ~5 years | ~2 years | ~7 years | 5 years |
| US Panic of 1893 | Railroad overbuilding | ~5 years | ~2 years | ~7 years | 5 years |
| US Panic of 1907 | Trust company expansion | ~4 years | ~1 year | ~5 years | 6 years |
| 1929 Crash / Great Depression | Post-WWI prosperity | ~7 years | ~2 years | ~9 years | 11 years |
| Japan (1985-92) | Plaza Accord, deregulation | ~5 years | ~2 years | ~7 years | 12+ years |
| Dot-com (1995-2001) | Internet commercialization | ~4 years | ~2 years | ~6 years | ~3 years |
| US Housing (2003-2008) | Low rates, securitization | ~3 years | ~2 years | ~5 years | 6-8 years |

**Pattern**: The displacement-to-panic arc typically spans 5-9 years. The boom/credit expansion is the longest phase (3-7 years). Euphoria is compressed (1-3 years). Panic onset is sudden (weeks to months). Recovery varies enormously (1-12+ years depending on severity).

---

## 4. Implementation Specification for Civ-Sim

### 4.1 State Variables (0-100 scale)

| Variable | Name | Description | What 0 Means | What 100 Means |
|----------|------|-------------|--------------|----------------|
| financial_stability | Financial Stability | Overall health of financial system | Total collapse, debt crisis | Rock-solid, all hedge finance |
| credit_expansion | Credit Expansion | Rate of credit growth relative to GDP | Credit contracting sharply | Credit growing at unsustainable rates |
| debt_ratio | Debt-to-Income Ratio | Economy-wide leverage | No debt | Extreme leverage (Ponzi territory) |
| asset_inflation | Asset Price Inflation | Deviation of asset prices from fundamentals | Assets deeply undervalued | Extreme bubble |
| minsky_phase | Minsky Cycle Phase | Position in the Kindleberger-Minsky cycle | Deep crisis/revulsion | Peak euphoria |

### 4.2 Input Variables (What Drives the Cycle)

These existing or new civ-sim variables feed into the Minsky cycle:

| Input | How It Drives the Cycle |
|-------|------------------------|
| GDP growth rate | High growth encourages borrowing, shifts units from hedge to speculative |
| Interest rate (derived from monetary policy) | Low rates enable leverage; rate rises trigger distress |
| Financial depth / sophistication | Higher financial development enables more complex and risky instruments |
| Profit/GDP ratio | High profits encourage investment borrowing (Keen's investment function) |
| Inequality (wealth concentration) | High inequality can fuel credit-driven demand and asset speculation |
| Regulatory strength | Strong regulation acts as "thwarting mechanism"; weak regulation accelerates the cycle |
| Recent crisis memory | Time since last crisis; longer = more complacency |

### 4.3 Core Cycle Mechanics

#### 4.3.1 The Minsky Phase Variable

Map the Kindleberger-Minsky cycle to a continuous phase variable on 0-100:

| Phase | Range | Name |
|-------|-------|------|
| 0-15 | Revulsion / Recovery | Post-crisis, deleveraging, risk aversion |
| 15-35 | Hedge-Dominant Stability | Conservative lending, low leverage |
| 35-55 | Boom / Credit Expansion | Rising leverage, speculative finance growing |
| 55-75 | Euphoria / Late Boom | Ponzi finance emerging, credit standards collapsing |
| 75-90 | Distress / Peak | Insider selling, first defaults, system at maximum fragility |
| 90-100 | Panic / Crisis | Crash, deleveraging, defaults cascading |

After reaching 90-100, the phase resets toward 0-15 (revulsion/recovery).

#### 4.3.2 Phase Advancement Rate (Per 10-Year Turn)

The Minsky phase advances each turn based on conditions. The BIS financial cycle is 15-20 years, so a full cycle spans roughly 2 turns on average, but can be faster or slower.

```
phase_advance = base_drift + acceleration_factors - braking_factors

base_drift = 8 per turn (baseline: full cycle in ~12-13 turns = 120-130 years without acceleration)

acceleration_factors:
  + (GDP_growth - 30) * 0.15       // High growth accelerates the cycle
  + (financial_depth - 50) * 0.10  // More sophisticated finance = faster cycle
  + (profit_rate - 50) * 0.12     // High profits encourage borrowing
  + max(0, years_since_crisis - 20) * 0.3  // Fading memory of crisis
  + (100 - regulation) * 0.08     // Weak regulation accelerates
  + (inequality - 50) * 0.05      // High inequality drives speculation

braking_factors:
  - regulation * 0.06              // Strong regulation slows the cycle
  - (100 - financial_depth) * 0.03 // Low financial depth = less scope for speculation
  - min(20, years_since_crisis) * 0.2  // Recent crisis memory (fades after 20 years)
```

Typical result: phase advances 15-25 points per turn during expansions, meaning a full cycle takes 4-7 turns (40-70 years), which matches the empirical range for major financial cycles.

#### 4.3.3 Crisis Trigger Probability

When minsky_phase > 70, calculate crisis probability each turn:

```
crisis_probability = 0

if minsky_phase <= 70:
    crisis_probability = 0

if 70 < minsky_phase <= 80:
    crisis_probability = 0.15 + (debt_ratio - 50) * 0.005

if 80 < minsky_phase <= 90:
    crisis_probability = 0.35 + (debt_ratio - 50) * 0.008

if minsky_phase > 90:
    crisis_probability = 0.70 + (debt_ratio - 50) * 0.005

// Modifiers
crisis_probability += (100 - regulation) * 0.002
crisis_probability += max(0, interest_rate_change) * 0.03  // Rate hikes trigger crises
crisis_probability = clamp(crisis_probability, 0, 0.95)
```

#### 4.3.4 Debt Ratio Evolution

The debt ratio evolves based on the Minsky phase:

```
debt_change_per_turn:

if minsky_phase in [0, 15]:    // Revulsion: deleveraging
    debt_change = -8 to -15 (debt ratio falls)

if minsky_phase in [15, 35]:   // Hedge stability
    debt_change = -2 to +3 (roughly stable)

if minsky_phase in [35, 55]:   // Boom
    debt_change = +5 to +12

if minsky_phase in [55, 75]:   // Euphoria
    debt_change = +10 to +20

if minsky_phase in [75, 90]:   // Distress
    debt_change = +5 to +15 (debt still rising from distressed borrowing)

if minsky_phase in [90, 100]:  // Crisis
    debt_change = -5 to +5 (defaults reduce debt, but bailouts add government debt)
```

#### 4.3.5 Crisis Effects (When Crisis Fires)

When crisis_probability triggers a crisis event:

```
// Immediate effects (applied in the turn the crisis fires)
financial_stability -= 25 to 45
asset_inflation -= 30 to 55       // Asset prices collapse (avg 35% housing, 55% equity)
GDP_growth -= 9 to 15             // Output falls 9%+ on average
employment -= 7 to 12             // Unemployment rises ~7pp on average
government_debt += 15 to 30       // Government debt rises ~85% in real terms

// Phase reset
minsky_phase = random(0, 15)      // Reset to revulsion
years_since_crisis = 0

// Severity modifier based on debt_ratio at time of crisis
severity_multiplier = 0.7 + (debt_ratio / 100) * 0.6
// Apply severity_multiplier to all the above effects
```

#### 4.3.6 Recovery Dynamics

Recovery from crisis follows Reinhart-Rogoff empirical timescales:

```
// Per-turn recovery rates after crisis (turn = 10 years)
// GDP recovery: average 6.5-8 years to pre-crisis level
GDP_recovery_per_turn = 8 to 12 points (0.7-1.2 turns to recover)

// Housing recovery: average 6 years peak-to-trough
// But full recovery from trough takes additional years
asset_recovery_per_turn = 6 to 10 points

// Employment recovery: average 4+ years
employment_recovery_per_turn = 10 to 15 points

// Financial stability recovery: gradual
stability_recovery_per_turn = 5 to 8 points

// CRITICAL: debt overhang slows recovery
recovery_modifier = 1.0 - max(0, (debt_ratio - 60)) * 0.01
// High debt ratio slows all recovery rates by up to 40%
```

### 4.4 Decision Rules Summary

For each 10-year turn, the Minsky module executes in this order:

1. **Calculate phase advancement** using acceleration and braking factors
2. **Update debt_ratio** based on current minsky_phase
3. **Check crisis probability** if minsky_phase > 70
4. **If crisis fires**: apply crisis effects, reset phase
5. **If no crisis**: update financial_stability and asset_inflation based on phase
6. **Apply recovery dynamics** if in post-crisis phase (minsky_phase < 20)

### 4.5 Interaction with Other Systems

The Minsky cycle should interact with:

| System | Interaction |
|--------|-------------|
| Trade | Financial crises trigger trade contraction; trade openness can transmit crises |
| Governance | Crises can destabilize governments; strong institutions provide "thwarting mechanisms" |
| Technology | Technological revolutions serve as "displacements" that initiate new cycles |
| Inequality | Crises can reduce inequality (asset destruction) or increase it (bailouts favor wealthy) |
| Social stability | Financial crises increase social unrest, especially when combined with inequality |

---

## 5. Empirical Timing Data

### 5.1 Financial Cycle Duration (BIS Data)

From Borio, Drehmann, and Tsatsaronis (BIS Working Paper 380, 2012):

- **Full financial cycle**: 15-20 years since the early 1980s (compared to 8-year business cycles)
- **Pre-1985**: Financial and business cycles were similar in length
- **Post-1985**: Financial liberalization lengthened and amplified the financial cycle
- **Credit cycles associated with crises**: Average 15 years (vs 11 years for non-crisis cycles)
- **Household credit cycles**: 15-25 years with ~20% amplitude

### 5.2 Expansion Duration Before Crisis

From multiple empirical sources:

- **Credit booms (average)**: ~8 quarters (2 years), but crisis-producing booms are longer
- **Credit booms ending in crisis (9-12 years)**: ~40% end in crisis
- **Credit booms lasting 13+ years**: Nearly all end in crisis
- **Household credit above trend before crisis**: ~5 years
- **Pre-crisis credit buildup (private debt/GDP increase)**: ~38 percentage points in 2 years before crisis
- **Total displacement-to-panic arc**: Typically 5-9 years (historical range)

### 5.3 Crisis Depth (Reinhart & Rogoff, "The Aftermath of Financial Crises," 2009)

Average impacts across 18 major postwar banking crises in developed economies:

| Indicator | Average Decline | Duration of Decline |
|-----------|----------------|-------------------|
| Real housing prices | -35% (peak to trough) | 6 years |
| Real equity prices | -56% (peak to trough) | 3.4 years |
| Unemployment | +7 percentage points | 4+ years (down phase) |
| Real GDP per capita | -9.3% | 2 years (output decline phase) |
| Real government debt | +86% | 3 years post-crisis |

Severe individual cases:
- Finland (1990): housing -50%, equity -60%
- Japan (1992): 12+ year recovery
- US Great Depression: 11 years to recover per-capita GDP
- Philippines, Colombia, Hong Kong: housing declines of 50-60%

### 5.4 Recovery Duration (Reinhart & Rogoff, 2014)

From "Recovery from Financial Crises: Evidence from 100 Episodes":

- **Average time to reach pre-crisis GDP per capita**: 8 years
- **Median time to reach pre-crisis GDP per capita**: 6.5 years
- **US historical**: 1873 crisis: 5 years; 1893: 5 years; 1907: 6 years; Great Depression: 11 years
- **International "Big Five"**: Denmark (1989): 7.25 years; Australia (1990): 7.75 years; Finland (1990): 8.5 years; Sweden (1990): 9.5 years; US (Great Depression): 11 years

### 5.5 Debt Overhang Effects

- **Episodes where debt exceeds 90% of GDP**: Growth averages 1.2 percentage points lower than normal
- **Average duration of debt overhang episodes**: 23 years
- **Implication**: High debt suppresses growth for decades, not just the crisis period

### 5.6 Crisis Frequency

- **Major banking crises in developed economies**: Roughly every 25 years on average
- **Including emerging markets**: More frequent, but each country's interval is still measured in decades
- **Historical pattern**: Crises cluster in waves (1890s, 1930s, 1990s-2000s) with long quiet periods between

### 5.7 Mapping to 10-Year Turns

Given 10-year turns and the above data:

| Phase | Real-World Duration | Turns | Notes |
|-------|-------------------|-------|-------|
| Full financial cycle | 15-20 years | 1.5-2 turns | Post-1985; longer historically |
| Pre-crisis credit buildup | 5-9 years | 0.5-1 turn | The boom + euphoria phases |
| Acute crisis | Weeks to months | < 0.1 turns | Collapsed into the turn it occurs |
| GDP recovery | 6.5-8 years | ~0.7-0.8 turns | Within 1 turn usually |
| Full asset price recovery | 6-12 years | 0.6-1.2 turns | Housing takes longest |
| Debt overhang suppression | 23 years average | ~2.3 turns | Long-lasting drag on growth |
| Time between major crises | 25+ years | 2.5+ turns | But can cluster |

---

## 6. Sources

### Primary Academic Sources
- Minsky, H.P. (1992). "The Financial Instability Hypothesis." Levy Economics Institute Working Paper No. 74.
- Keen, S. (1995). "Finance and Economic Breakdown: Modeling Minsky's 'Financial Instability Hypothesis'." Journal of Post Keynesian Economics, 17(4), 607-635.
- Keen, S. (2013). "A Monetary Minsky Model of the Great Moderation and the Great Recession." Journal of Economic Behavior & Organization, 86, 221-235.
- Grasselli, M. & Costa Lima, B. (2012). "An Analysis of the Keen Model for Credit Expansion, Asset Price Bubbles and Financial Fragility." Mathematics and Financial Economics, 6, 191-210.
- Kindleberger, C.P. & Aliber, R.Z. (2011). Manias, Panics, and Crashes: A History of Financial Crises. 6th Edition. Palgrave Macmillan.
- Reinhart, C.M. & Rogoff, K.S. (2009). This Time Is Different: Eight Centuries of Financial Folly. Princeton University Press.
- Reinhart, C.M. & Rogoff, K.S. (2009). "The Aftermath of Financial Crises." American Economic Review, 99(2), 466-472.
- Reinhart, C.M. & Rogoff, K.S. (2014). "Recovery from Financial Crises: Evidence from 100 Episodes." American Economic Review, 104(5), 50-55.
- Drehmann, M., Borio, C. & Tsatsaronis, K. (2012). "Characterising the Financial Cycle: Don't Lose Sight of the Medium Term!" BIS Working Paper No. 380.
- Borio, C. (2014). "The Financial Cycle and Macroeconomics: What Have We Learnt?" Journal of Banking & Finance, 45, 182-198.
- Rammelt, C. (2019). "The Dynamics of Financial Instability: Simplifying Keen's Goodwin-Minsky Model." System Dynamics Review, 35(1), 3-34.
- Schularick, M. & Taylor, A.M. (2012). "Credit Booms Gone Bust: Monetary Policy, Leverage Cycles, and Financial Crises, 1870-2008." American Economic Review, 102(2), 1029-1061.
- Perez Avellaneda, J.F. et al. (2024). "Feedback Dynamic Control for Exiting a Debt-Induced Spiral in a Deterministic Keen Model." PLOS ONE.
- Nikolaidi, M. & Stockhammer, E. (2017). "Minsky Models: A Structured Survey." Post Keynesian Economics Study Group Working Paper 1706.
