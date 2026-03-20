# Quick Start Guide — Casual Players

**civ-sim** | Get playing in 5 minutes

---

## What Is This?

You're the founder of a civilization. You pick its government, economy, values, and policies, then watch what happens over centuries. Make good choices and your people thrive. Make extractive, short-sighted choices and watch inequality spiral, trust collapse, and your institutions rot from within.

This isn't a typical strategy game. There's no "build 3 farms to unlock knights." Instead, the simulation models real dynamics: sanitation improvements reduce infant mortality, which eventually reduces birth rates. Concentrating wealth erodes trust, which weakens institutions, which makes wealth concentrate faster. These aren't scripted events — they emerge from how the systems interact.

---

## Step 1: Start the Game

### Option A: Desktop App (recommended)
Open `Civilization Simulator.app` (macOS) or run the installer (Windows). The app includes everything — no setup needed. On first launch, a setup wizard will offer to install Ollama + tinyllama for AI-powered NPC interviews and optionally configure a cloud LLM (Groq or Gemini) for multilingual support.

### Option B: From Source (developers)
1. Open Terminal
2. `cd ~/civ-sim && node server.js`
3. Open `http://localhost:8080` in your browser
4. (Alternative: `python3 server.py` also works)

### Option C: Open Directly (no AI interviews)
Double-click `index.html` in your browser. Everything works except AI-powered NPC interviews.

For AI interview setup details (Ollama, Groq, Gemini), see the LLM Integration section in `USER_MANUAL.md`.

---

## Step 2: The Setup Wizard

The wizard has 11 steps. Don't overthink it — every choice has smart defaults based on your earlier picks. You can always change policies later during the game.

**The choices that matter most:**

| Step | What you're deciding | Why it matters |
|------|---------------------|---------------|
| 3 | Governance | Autocratic governments concentrate power. Democracies are messy but distribute it. Theocracies suppress dissent. Each has trade-offs. |
| 4 | Economy | Market economies generate wealth but concentrate it. Gift economies distribute but grow slowly. |
| 6 | Religion | Theocratic state religion boosts early cohesion but suppresses science and gender equity long-term. |
| 9 | Education & equity | These are your strongest long-term levers. High education + gender equity drives almost everything good. |
| 10 | Healthcare & information | Universal healthcare keeps people alive. Open media keeps them informed. Both matter more than you'd expect. |

**First game suggestion:** Try Market / Representative with default settings. It's the most familiar starting point and lets you see how systems interact before experimenting with more unusual configurations.

---

## Step 3: Playing the Game

### The Screen
- **Top bar**: Year, population, key metrics (wellbeing, stability, epistemic health, equality)
- **Map**: Your civilization's territory on a hex grid
- **Toolbar buttons**: Open different information panels
- **Space bar**: Advance one turn (= one period of historical time)

### What to Watch

**The Big Five metrics** (top bar):
- **Wellbeing** — Are your people doing well? Below 30 = misery
- **Stability** — Is your society holding together? Below 25 = crisis territory
- **Epistemic Health (EH)** — Can your people tell truth from lies? Below 20 = propaganda state
- **Equality** — How evenly are resources distributed? Below 20 = oligarchy
- **GEI** — Gender equity. Below 20 = half your population is sidelined

### What to Do Each Turn

1. **Advance a turn** (Space bar or click the turn button)
2. **Check notifications** — Yellow/red alerts mean something needs attention
3. **Read the history entry** — What happened this turn?
4. **Open panels** to investigate if something looks wrong

You don't need to micromanage. The simulation runs itself. Your job is to make structural decisions (change healthcare policy, invest in sanitation, trigger a paradigm shift) and observe the consequences.

---

## Step 4: The Panels

### Society (S key)
The big one. Economy, demographics, institutions, psychology — everything about how your society works. Key tabs:

- **Economy** — Wealth distribution, land ownership, caste system, tech unemployment
- **Demographics** — Population, age structure, demographic transition (the 5-stage model that drives birth/death rates), ethnic diversity
- **Institutions** — Infrastructure, military-civilian balance, legitimacy, corruption, institutional lock-in
- **Healthcare** — Access tiers, emphasis, incentive model. Universal public healthcare is expensive but dramatically improves outcomes
- **Social Psychology** — Anomie (social disconnection), collective trauma, paradigm shift readiness

### Technology (T key)
Your civilization's technology tree — 38 advances across 7 categories, from Stone Tools to Neural Networks. The **Tree tab** shows a visual map of all technologies organized by era, with prerequisite connections. Technologies are discovered automatically as your civilization develops (driven by innovation, education, and trade networks), but some governance types resist certain technologies. The **Introduce** and **Discontinue** tabs let you deploy modern technologies (like Clean Energy or Gene Therapy) once their tree prerequisites are met. The **Automation** tab models AI/robotics impact across 6 levels.

### Sustainability (R key)
Resources, energy, food security, ecological overshoot. If you're extracting resources faster than they regenerate, you'll hit a wall.

### Paradigm (Shift+P)
When your civilization is ready for systemic change — switching from autocracy to democracy, or from market capitalism to cooperative economics. Also where you activate facilitation measures (civic workshops, community forums) and monitor threshold events.

### Chronicle (C key)
Interview NPCs from different social strata. Ask a marginalized citizen about inequality and you'll get a very different answer than asking an elite. If you have an LLM configured, these interviews are generated by AI and respond to your civilization's actual conditions.

---

## Tips for Your First Game

1. **Don't panic at turn 1 values.** Many metrics start at 0 or low values by design (anomie, collective trauma, tech unemployment). They're not broken — they grow from specific conditions.

2. **Invest in sanitation early.** It's the key that unlocks the demographic transition. Click the Sanitation Investment button in the Demographics tab.

3. **Watch the demographic transition.** Your civilization starts at Stage 1 (high birth rate, high death rate, short lives). As sanitation and healthcare improve, mortality drops first, then fertility follows decades later. The gap between the two creates a population explosion (Stage 2).

4. **Education + gender equity = everything.** These two factors drive fertility decline, innovation, epistemic health, social mobility, and institutional quality. Neglect them and your civilization stagnates.

5. **Extraction is tempting but toxic.** Extraction-for-growth + market-driven obsolescence gives you short-term economic boost but accelerates environmental crisis. The synergy warning exists for a reason.

6. **Wealth concentrates by default.** In most configurations, wealth slowly concentrates unless actively counteracted by policy (land reform, progressive taxation, strong institutions). This is by design — it mirrors how real economies work.

7. **Paradigm shifts take time.** You can't jump from autocracy to democracy in one turn. Build readiness through education, civic media, and growing cultural gap awareness, then trigger the shift and wait for it to complete.

8. **Run 50+ turns before judging.** Many dynamics take 20-50 turns to materialize. A 10-turn game won't show you much.

---

## Interesting Experiments to Try

- **The Extractive Spiral**: Market economy + autocratic government + profit-first healthcare + total information control + extraction for growth. Watch how fast everything collapses.

- **The Egalitarian Experiment**: Gift economy + council consensus + universal healthcare + open civic media + conservation. See how far you can push wellbeing and equality.

- **The Theocratic Trap**: Theocratic autocracy with high religion dominance. Notice how early cohesion eventually turns into a ceiling on science, gender equity, and innovation.

- **The Development Race**: Start two civilizations (one market/representative, one barter/tribal) and run 200 turns. Compare their demographic transitions and institutional development.

- **The Late-Stage Capture**: Any economy running 100+ turns without accountability reforms. Watch the wealth capture degree climb and the consequence deficit acceleration loop kick in.

---

## New Systems You'll Encounter

**Environmental crises:** As your civilization industrializes, you'll see pollution rise, forests burn, and extreme weather events increase. Use the policy buttons in the Sustainability → Resources tab: Reforestation, Pollution Controls, Soil Conservation, Water Management, Green Subsidies, Green Mandate, and Recycling. Strong institutions act earlier; weak ones wait too long.

**Ecological feedback loops:** If forests drop below 40%, water supply collapses (Amazon tipping point). If pollution stays high, persistent chemicals accumulate. Biodiversity loss reduces food production. Ocean acidification collapses fisheries. These are all interconnected — neglect one, and the others cascade.

**Pandemics:** Roughly once per millennium, a major pandemic will strike. How badly it hurts depends on your healthcare, state capacity, and social trust. Well-prepared societies rally; poorly prepared ones collapse into mistrust.

**Disinformation:** Once your civilization reaches the information technology era (tech level 7+), social media and algorithmic amplification begin eroding epistemic health. Education is your strongest defense.

**Civil wars:** If your institutions are weak, inequality is extreme, and ethnic groups are politically excluded, civil war can erupt. Three severity levels — from limited insurgency to devastating ethnic/sectarian conflict.

**Nuclear war:** Extremely rare but devastating. Requires nuclear technology. Three levels from tactical to all-out MAD. The consequences include nuclear winter and civilizational collapse.

**Immigration:** People migrate from struggling civilizations to prosperous ones. This helps sustain your population in the late game but can cause social friction if political inclusion is low.

**Sovereign debt:** If your government spends more than it collects (big military, generous programs, wars), debt piles up. Above 90% of GDP, you'll face a fiscal crisis. You can implement austerity (painful but stable), default (destroys trust), or seek a bailout from a stronger neighbor. Check the Policy tab in Events for options.

**Media & press freedom:** A free press fights corruption. Public broadcasting builds social cohesion. Media literacy protects against disinformation. But if wealth concentrates too much, oligarchs capture the media. You can fund public broadcasting, invest in media literacy, or protect press freedom from the Policy tab.

**Addiction epidemics:** When anomie is high and wellbeing is low, your population becomes vulnerable to substance abuse. Your response matters: "war on drugs" is expensive and ineffective, while decriminalization + treatment (Portugal model) produces better outcomes. Check the Policy tab when addiction prevalence rises.

**Generational conflict:** Generations raised in security care about the environment and equality. Generations raised in crisis care about order and survival. When these cohorts clash, anomie rises. This is based on real World Values Survey data.

**Space program:** Once your tech reaches level 6, you can launch a space program. Milestones (satellite → moon landing → Mars) boost STEM education, national pride, and prestige — but they cost money and add to sovereign debt.

**Religious/ideological schisms:** If your institutions are rigid and legitimacy is low, a schism can erupt. You choose how to respond: suppress it (short-term fix, long-term trauma), accommodate it (messy but peaceful), or allow reformation (chaotic but can spark innovation).

**Water conflicts:** Adjacent civilizations sharing water resources can escalate from cooperation through tension to outright conflict. Build desalination plants or propose water treaties to manage this.

---

## When Things Go Wrong

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Population declining | Stage 5 (below-replacement fertility) or famine | Check fertility rate; invest in food security |
| Stability cratering | Youth bulge + low mobility, or food crisis, or coup risk | Check Demographics for youth bulge; check food security; check military-civilian balance |
| EH collapsing | State-controlled media + suppressed science | Change information ecosystem; increase science freedom |
| Anomie spiking | Recent paradigm shift or energy transition | Use Community Resilience Program; wait for it to subside |
| "Feudal Dynamic Active" | Wealth capture > 80 + wealth concentration > 75 | This is very hard to reverse. Requires simultaneous improvement in institutional quality AND epistemic health |
| Coup event | High military power + low civilian control + low stability | Civilian Oversight Reform button; improve food security and stability |
| Forests gone + water crashing | Deforestation triggered water tipping point | Reforestation Program button; switch to conservation strategy |
| Pollution won't go down | Persistent pollutants at high levels | Green Mandate; switch energy to renewables; Recycling Program |
| Civil war erupted | Weak institutions + political exclusion + inequality | Improve political inclusion, reduce inequality, build state capacity |
| Biodiversity collapsing | Forests gone + pollution high | Reforestation + Pollution Controls; takes centuries to recover |
| Failed state | Multiple cascading crises | Wait for reconstitution (happens automatically after ~50 years) or other civs may intervene |
| Debt crisis | Spending exceeded tax capacity | Policy tab: Implement Austerity, Declare Default, or Seek Bailout |
| Addiction epidemic | High anomie + low wellbeing | Policy tab: Decriminalize & Treat is most effective long-term |
| Schism erupted | High lock-in + low legitimacy | Policy tab: Allow Reformation for long-term benefit (short-term pain) |
| Water conflict | Shared resources + climate stress | Policy tab: Propose Water Treaty or build Desalination |

---

## Want to Go Deeper?

- `USER_MANUAL.md` — Full documentation of every panel, metric, and system
- `MODELING_ASSUMPTIONS.md` — What the simulation models, what it doesn't, and why
- `TEST_VERIFICATION.md` — Technical test cases (useful for understanding exact mechanics)

---

*civ-sim is a research tool disguised as a game. The numbers are simplified, but the causal chains are real. If something surprises you, that's the point.*
