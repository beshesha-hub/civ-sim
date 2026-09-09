# Pass 11 — Active Travel Networks

Government-initiated networks of paths for human-powered (and, at low density,
animal-powered) transport, built as **interlocking local networks** rather than
one metro-spanning system, with supportive infrastructure and transit
integration.

Same confidence tiers as Pass 10: **M** measured, **I** interpolated between
≥2 measured anchors, **T** mechanism supported / magnitude assumed.

---

## 1. Core structure

Reuses the Pass 10 architecture deliberately: **structural baseline** (physics)
+ **programme contribution** (policy) + **enabling support** + crisis-driven
adoption. Like energy, this is a *return*, not a novelty — pre-automobile
cities were entirely walking and animal powered, and motorization collapsed
that baseline.

## 2. Anchors

| Quantity | Value | Tier | Source |
|---|---|---|---|
| Mode shift from a continuous protected network | 0.5% → 6–7% | M | Seville 2006–2010, 80 km, €32M |
| Network design factors | segregation, connectivity, **continuity** | M | Seville |
| Median cycling trip | ~2 km | M | distance-decay literature |
| Cycling falls off beyond | 5 km | M | " |
| Comfortable max / practical limit | 7.5 km / 15 km | M | " |
| Walking trips extend to | ~3.5 km | M | " |
| Bicycle as rail access mode | **47%** of passengers (70% at some stations) | M | Netherlands |
| Rail access cycling distance | 4 km | M | Netherlands |
| Multimodal share of rail journeys | 83% | M | Netherlands |
| Polycentric subcenter commute | 3.9 km, 16.6% car, **36.8% non-motorized** | M | Wuhan |
| Commutes internal to subcenter | 91.3% | M | Wuhan |
| Cycle commuting all-cause mortality | **HR 0.59** (0.42–0.83) | M | Celis-Morales, BMJ 2017 |
| Car-lite health impact | 667 deaths/yr, +200 days life expectancy | M(modelled) | Barcelona superblocks |
| — air pollution / noise / heat / green | 291 / 163 / 117 / 60 | M(modelled) | " |
| Transport share of energy demand | ~1/3; passenger 60–70% of that | M | — |
| Car energy intensity | 1.9–3.5 MJ/passenger-km | M | — |
| Street lighting → crime | **−14%** | M | Welsh & Farrington 2022 |
| Hot-spots policing | significant reduction, **diffusion not displacement** | M | Braga, Campbell review |
| Women vs men fearful walking evenings | 29% vs 20% | M | — |
| Women vs men perceiving area very safe | 30% vs 49% | M | — |
| Gendered fear of *collision* | **no difference** | M | — |
| Retail on protected lane | +49% sales, −49% vacancies, −56% injuries | M(weak) | NYC DOT before/after — agency study, direction solid, magnitude uncertain |
| Trail-adjacent property premium | +3–5% | M | — |

## 3. The distance-decay problem and its solution

A single network cannot serve a large metropolis: median cycling trip is ~2 km
and mode share collapses past 5 km. **Interlocking local networks plus transit
integration** resolve this — each local network serves its own ~4 km catchment
and transit carries the inter-network leg. The Dutch bicycle-rail data is the
proof this works at scale.

`effectiveReach` therefore depends on transit integration, not path kilometres.

## 4. Jobs-housing balance is the gate (M)

Polycentricity does **not** automatically reduce travel. The empirical
literature is mixed, and decentralizing population while centralizing
employment produces jobs–housing imbalance and worse outcomes. The parameter is
therefore balance, **not subcenter count**.

## 5. Security: one composite, two measured drivers

Personal safety is a real barrier and it is **gendered and specific**: women
report substantially more fear, shaped by harassment rather than traffic — and
there is *no* gendered difference in fear of collision. Protected lanes do not
address it.

`perceivedSafety` composite from:
- **Lighting** — 14% crime reduction (M)
- **Patrol intensity** — Braga, with diffusion of benefits to surrounding
  areas rather than displacement (M)
- **Amenities / call boxes / cellular coverage** — folded in at low weight,
  tier **T**. Call boxes are documented as largely symbolic (rarely used for
  their intended purpose; UC Davis cut 107→18; Nebraska removed ~100 costing
  $1.7M/15yr) but the barrier *is* perception, so a small perception-channel
  effect is defensible while a use-channel effect is not.

**Drones are NOT modelled.** The one rigorous test — a Swedish aerial patrol
trial — found no significant effect of intention-to-treat or actual presence.
Assigning a coefficient would be invention.

Consequence: a civilization that builds paths but skips the security layer
captures roughly half the available mode shift, because women's effective
access is gated by `perceivedSafety` in a way men's is not.

## 6. Animal power (M, density-conditional)

Viable at low density and for freight; actively harmful as density rises.
Anchors: 15–35 lb manure per horse per day; ~1,000 tons/day in 1890s London
with 50,000+ horses; stabling consumed valuable urban land; hay acreage
**competed directly with human food production**; manure and carcasses bred
flies and contaminated water, spreading typhoid and cholera.

Modelled with an inverted density response and a land/food competition term —
which couples to the Pass 10 agriculture parameter *emergently*, through shared
land, not by a coded link.

## 7. Environmental impact at scale

| Channel | Mechanism | Tier |
|---|---|---|
| Energy | Mode shift off 1.9–3.5 MJ/pkm car travel; transport ~1/3 of energy, passenger 60–70% of that | M |
| Air pollution | Largest single health channel in the Barcelona decomposition (291 of 667) | M |
| Urban heat | Reclaimed paving + vegetation (117 of 667) | M |
| Green space | Vegetation increase (60 of 667) | M |
| Land | Roadway and parking reclaimed | M |
| Noise | 163 of 667 — **no noise variable in civ-sim**; folded into wellbeing | M→T |
| Animal power (dense) | Manure → pollution and disease; hay → farmland competition | M |

Scale realism: a full active-travel build-out should move total energy by a few
percent, not transform it. Urban passenger car travel is roughly 15–20% of
total energy demand, so a 10-point mode shift is ~2% of total. The model must
not overstate this.

## 8. Files touched

`js/config.js`, `js/civilization.js`, `js/simulation.js`,
`js/sustainability_panel.js`, `js/research_panel.js`, plus docs.


---

## 9. Revision 1 — Audit Pass

Three defects found by re-examining the code and its interactions.

### 9.1 Structural baseline was not used as a floor
`target = max(baseline * 0.35, gain)`. The 0.35 was arbitrary and reported
**29% active travel for a neolithic civilization whose own baseline said 83%**.
Corrected to `baseline + gain`.

### 9.2 Benefits were granted with nothing to displace
The HR 0.59 anchor is measured against a sedentary, car-using counterfactual.
The first implementation produced a **larger health benefit in the neolithic
(−14.7) than in a modern motorized city (−5.8)** — backwards. Benefits now
scale by `marginalShift × motorizationContext`, giving −0.4 / −2 / −6 / −10.2
across neolithic → modern. Monotonic in motorization, as it must be.

### 9.3 Animal power at density read as a wellbeing gain
Above the density ceiling it produced +23.4 disease and −15 sanitation yet
**+2.4 wellbeing** (5-seed average), because higher mortality shrank the
population and other systems rewarded the smaller denominator. A direct
wellbeing penalty was added. Now −1.4 at density, +0.7 in a town.

### 9.4 Methodological finding
Single-seed comparison is unsafe once a configuration change alters RNG
consumption — the animal-power test showed +9 on one seed versus +2.4 averaged
over five. Average at least five seeds for any cross-system claim. Recorded in
the research guide.

### 9.5 Verification after fixes
Reproducibility bit-identical ×3 · 24 edge cases, zero NaN and zero range
breaches · preset regression **11/12** · cross-system interaction sub-additive
with no double-counting · 7 tabs render · 11 buttons fire · zero console errors.
