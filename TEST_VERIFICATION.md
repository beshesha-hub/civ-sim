# Test Verification Guide — Pass 6
## Healthcare · Resource Management · Information Ecosystem

**Version:** Pass 6 (March 2026)
**Scope:** All new functionality added in this development pass
**Format:** Step-by-step manual test cases; each has a clear Expected Result so a tester can confirm pass/fail without source-code access.

---

## How to Use This Document

1. Open the simulation in a browser: `file:///Users/barakwater/civ-sim/index.html` (or your local server)
2. Open the browser's developer console (F12 → Console tab) — several tests use console commands
3. Work through each section in order; earlier sections set up state that later sections depend on
4. Mark each test **PASS**, **FAIL**, or **SKIP** as you go
5. If a test fails, note the observed behaviour and console errors

> **Note for testers:** The `node --check <filename>` commands in this document are optional developer
> syntax checks that require Node.js to be installed. If you don't have Node.js, skip any step labelled
> "Syntax check" — they are not required for browser-based testing. To check for JavaScript errors,
> open the app in a browser and inspect the browser console (F12 → Console tab).

---

## Section 1 — Syntax / Static Checks
**SKIP** because 'node --check' command doesn't work'
These tests do not require the browser.

| # | Test | Command | Expected Result |**SKIP** 
|---|------|---------|-----------------|
| 1.1 | config.js passes syntax check | `node --check js/config.js` | No output (exit 0) |
| 1.2 | civilization.js passes syntax check | `node --check js/civilization.js` | No output (exit 0) | **SKIP** 
| 1.3 | simulation.js passes syntax check | `node --check js/simulation.js` | No output (exit 0) | **SKIP** 
| 1.4 | society_panel.js passes syntax check | `node --check **SKIP** js/society_panel.js` | No output (exit 0) | **SKIP**
| 1.5 | sustainability_panel.js passes syntax check | `node --check js/sustainability_panel.js` | No output (exit 0) | **SKIP**
| 1.6 | ui.js passes syntax check | `node --check js/ui.js` | No output (exit 0) | **SKIP**
| 1.7 | game.js passes syntax check | `node --check js/game.js` | No output (exit 0) | **SKIP**

---

## Section 2 — Page Load & Button Presence

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 2.1 | Page loads without errors | Open index.html; check console | No red errors in console | **PASS**
| 2.2 | Society button present | Look at top toolbar | 🏛️ Society button visible |
| 2.3 | Sustainability button present | Look at top toolbar | 🌿 Sustainability button visible, positioned after Society button |
| 2.4 | Sustainability panel hidden at startup | Inspect DOM / look at screen | No sustainability panel visible on load |
| 2.5 | Sustainability button opens panel | Click 🌿 Sustainability | Panel slides in / becomes visible |
| 2.6 | Sustainability button closes panel | Click 🌿 Sustainability again | Panel hides |
| 2.7 | Society button still works | Click 🏛️ Society | Society panel opens normally |

---

## Section 3 — Setup Wizard: Step 10 (New Sections)

Start a new game to reach the Setup Wizard.

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 3.1 | Wizard Step 10 exists | Navigate wizard to step 10 | Step titled "Society & Culture" (or similar) with new sections visible | **PASS**
| 3.2 | Healthcare section present | Scroll step 10 | Section heading "Healthcare" with 3 dropdowns: Access Tier, Emphasis, Incentive Model | **PASS**
| 3.3 | Healthcare defaults match econ | In wizard, set Economy = Market Capitalist; go to step 10 | Healthcare Access default is "Mixed Public/Private" or "Private-Led"; confirm it matches the expected default for market economy | **PASS**
| 3.4 | Healthcare defaults match gov | In wizard, set Government = Authoritarian; go to step 10 | Healthcare Incentive default shifts toward "Profit-First" or retains mixed — confirm non-blank default | **PASS**
| 3.5 | Resource Management section present | Scroll step 10 | Section "Resource Management" with 2 dropdowns: Resource Strategy, Obsolescence Model | **PASS**
| 3.6 | Resource alert note present | Scroll step 10 | Yellow/orange note warning about extraction + market-driven synergy (or similar advisory note) | **PASS**
| 3.7 | Information Ecosystem section present | Scroll step 10 | Section "Information Ecosystem" with 1 dropdown: Information Ecosystem Type | **PASS**
| 3.8 | All dropdowns functional | Change each dropdown | Selection updates without errors in console | **PASS**
| 3.9 | Defaults populated in all dropdowns | Load step 10 fresh | No dropdown shows blank/undefined; all have a pre-selected value | **PASS**
| 3.10 | Wizard completes with new values | Finish wizard normally | Game starts; new values are active (verify via Society panel tabs — see Section 4) | **FAIL** (partially)

---

## Section 4 — Society Panel: Healthcare Tab

Start a game (any settings) then open Society panel.

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 4.1 | Healthcare tab present | Open 🏛️ Society panel | Tab labelled "🏥 Healthcare" visible in tab bar | **PASS*
| 4.2 | Tab renders without error | Click 🏥 Healthcare tab | Content area renders; no JS errors in console | **PASS**
| 4.3 | Access Tier cards displayed | Look at Healthcare tab | Five cards displayed for the 5 access tiers (Universal Public, Universal Insurance, Mixed, Private-Led, Minimal/Traditional) | **PASS**
| 4.4 | Active tier card highlighted | Observe cards | Current tier card has distinct highlight / active state | **PASS**
| 4.5 | Stratum access bars present | Look at a tier card or summary section | Per-stratum horizontal bars visible (Upper, Upper-Middle, Middle, Lower-Middle, Lower) | **PASS**
| 4.6 | Stratum bar widths differ by tier | Click Universal Public tier → observe bars vs. Minimal/Traditional | Universal Public bars all ~100%; Minimal/Traditional upper stratum high, lower stratum low | **PASS**
| 4.7 | Apply button changes tier | Click a non-active tier card's Apply button | Card becomes active; stratum bars update; no JS errors |
| 4.8 | Emphasis cards displayed | Scroll down in Healthcare tab | Three emphasis cards: Prevention-Focused, Balanced, Treatment-Focused |
| 4.9 | Apply emphasis change | Click a different emphasis and Apply | Active emphasis card updates | **FAIL**
| 4.10 | Incentive Model cards displayed | Continue scrolling | Three incentive model cards: Patient Outcomes, Mixed, Profit-First | **PASS**
| 4.11 | Apply incentive change | Click Profit-First → Apply | Active card updates | **FAIL**
| 4.12 | Summary box present | Look for summary / cross-system box | Box showing plague mitigation factor and per-stratum access % displayed | **PASS**
| 4.13 | Plague mitigation value > 0 | Observe summary box | Plague Mitigation shows a non-zero decimal (e.g., 0.3 – 0.8 depending on tier) |
| 4.14 | Universal Public shows high mitigation | Set Universal Public; check summary | Plague mitigation near maximum (0.7–0.9 range) |
| 4.15 | Minimal/Traditional shows low mitigation | Set Minimal/Traditional; check summary | Plague mitigation near minimum (0.1–0.2 range) |

---

## Section 5 — Society Panel: Information Ecosystem Tab

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 5.1 | Information tab present | Open 🏛️ Society panel | Tab labelled "📺 Information" visible |
| 5.2 | Tab renders without error | Click 📺 Information tab | Content renders; no JS errors |
| 5.3 | Five ecosystem cards displayed | Observe tab content | Cards for: Open Civic Media, Free Market Media, Captured/Partisan Media, State-Guided Media, Total Information Control |
| 5.4 | Active card highlighted | Observe cards | Current ecosystem card is visually distinguished |
| 5.5 | Truth anchor display present | Look for EH anchor box | Monospace box showing current EH, anchor target, and estimated drift per turn |
| 5.6 | Drift direction correct for Open Civic | Set Open Civic; observe anchor box | Anchor value high (e.g., 70+); if current EH < anchor, drift should be positive (pulling up) |
| 5.7 | Drift direction correct for Total Control | Set Total Information Control; observe anchor box | Anchor value low (e.g., 15–25); if current EH > anchor, drift should be negative (pulling down) |
| 5.8 | Apply changes ecosystem | Click a different card → Apply | Active card updates; truth anchor display refreshes |
| 5.9 | Autocratic + Total Control warning | Set Government = Authoritarian AND Information = Total Control | Warning box appears noting the dangerous combination |
| 5.10 | Market + Commercial-Free warning | Set Economy = Market Capitalist AND Information = Free Market Media | Cross-system advisory note visible (if implemented) |

---

## Section 6 — Sustainability Panel: Layout & Navigation

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 6.1 | Panel opens | Click 🌿 Sustainability | Panel appears |
| 6.2 | Four tabs present | Observe tab bar | Tabs: Resources, Strategy, Obsolescence, Export |
| 6.3 | Resources tab is default | Open panel fresh | Resources tab active and rendered |
| 6.4 | Tab navigation works | Click each tab in sequence | Each tab renders its content without errors |
| 6.5 | Panel closes cleanly | Click 🌿 again or close button | Panel hides; reopening works correctly |

---

## Section 7 — Sustainability Panel: Resources Tab

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 7.1 | Six resource stat bars present | Open Resources tab | Bars for: Forests, Soil, Minerals, Water, Pollution, Waste |
| 7.2 | Bar values within 0–100 range | Observe bars | All bars show 0–100% fill; no overflow or negative values |
| 7.3 | Active multipliers box present | Scroll Resources tab | Box showing current depletion/pollution/waste multipliers with values |
| 7.4 | Multiplier box updates on strategy change | Change strategy in Strategy tab; return to Resources | Multiplier values reflect the new strategy |
| 7.5 | Time-series chart renders | Scroll to bottom of Resources tab | Line chart visible with resource history lines |
| 7.6 | Chart requires turn history | Advance several turns; reopen Resources tab | Chart shows multiple data points / lines trending |
| 7.7 | Chart has legend | Observe chart | Legend identifying each resource line (Forests, Soil, etc.) |
| 7.8 | Synergy warning absent by default | With default balanced stewardship + regulated obsolescence | No synergy warning displayed |
| 7.9 | Synergy warning appears | Set Strategy = Extraction for Growth AND Obsolescence = Market-Driven | Warning box appears noting combined waste ×2.5, depletion ×2.0 |

---

## Section 8 — Sustainability Panel: Strategy Tab

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 8.1 | Four strategy cards displayed | Open Strategy tab | Cards for: Conservation, Balanced Stewardship, Extraction for Growth, Government-Managed |
| 8.2 | Active strategy card highlighted | Observe tab | Current strategy card visually distinguished |
| 8.3 | Conservation card shows low multipliers | Hover/read Conservation card | Depletion multiplier < 1.0, pollution multiplier < 1.0 |
| 8.4 | Extraction card shows high multipliers | Read Extraction for Growth card | Depletion multiplier ≥ 1.4, pollution multiplier elevated |
| 8.5 | Government-Managed shows IQ scaling text | Read Government-Managed card | Notes that effectiveness scales with Institutional Quality |
| 8.6 | Government-Managed IQ-scaled multiplier | Set Government-Managed; check Resources tab multipliers | Multiplier varies based on civ's IQ (weak gov ≈ 1.2 depletion; strong gov ≈ 0.5) |
| 8.7 | Apply strategy button works | Click a different strategy → Apply | Active card updates; Resources tab multipliers update |

---

## Section 9 — Sustainability Panel: Obsolescence Tab

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 9.1 | Three obsolescence cards displayed | Open Obsolescence tab | Cards: Durability-First, Regulated Lifecycle, Market-Driven Obsolescence |
| 9.2 | Active model highlighted | Observe cards | Current model visually distinguished |
| 9.3 | Apply changes model | Click a different card → Apply | Active card updates |
| 9.4 | Mechanism explanation present | Read tab content | Text explaining what each model does to waste rate and resource consumption |
| 9.5 | Synergy warning in Obsolescence tab | Set Strategy = Extraction for Growth AND Market-Driven Obsolescence | Warning box appears in this tab as well as Resources tab |
| 9.6 | Durability-First reduces waste | Set Durability-First; observe waste multiplier in Resources | Waste multiplier < 1.0 |
| 9.7 | Market-Driven increases waste | Set Market-Driven; observe waste multiplier | Waste multiplier > 1.0 |

---

## Section 10 — Sustainability Panel: Export Tab

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 10.1 | Export tab renders | Click Export tab | Tab content visible; no JS errors |
| 10.2 | Data table present | Observe tab | Table showing resource history rows (Turn, Forests, Soil, Minerals, Water, Pollution, Waste, Strategy, Obsolescence) |
| 10.3 | Table has correct columns | Check table header | At least: Turn, Forests, Soil, Minerals, Water, Pollution, Waste + strategy/obsolescence labels |
| 10.4 | Table populates after turns | Advance 5 turns; open Export | Table shows 5 rows of data |
| 10.5 | Table has max 50 rows | Advance 55 turns; open Export | Table shows 50 rows (ring buffer capped) |
| 10.6 | CSV download button present | Observe tab | Button labelled "Download CSV" (or similar) visible |
| 10.7 | CSV download triggers file | Click Download CSV | Browser downloads a .csv file |
| 10.8 | CSV content is valid | Open downloaded .csv in Excel / text editor | File has header row + data rows matching table; values are numeric |
| 10.9 | PNG export button present | Observe tab | Button labelled "Export PNG" or "Download Chart" visible |
| 10.10 | PNG export produces image | Click PNG export | Browser downloads a .png file of the resource chart |

---

## Section 11 — Per-Turn Effects: Healthcare

Run a game for 10–20 turns between tests. Use browser console to inspect state:
```js
// Access civilization state in console
game.civs[0].state
```

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 11.1 | healthcareAccess set correctly | `game.civs[0].state.healthcareAccess` in console | Returns the string matching wizard selection |
| 11.2 | Universal Public improves wellbeing | Start game with Universal Public; run 20 turns; check wellbeing | Average wellbeing higher than comparable run with Minimal/Traditional (run both; compare) |
| 11.3 | Minimal/Traditional lowers lower stratum wellbeing | With Minimal/Traditional; inspect wellbeingByStratum | Lower stratum wellbeing significantly below upper stratum |
| 11.4 | Plague mitigation active | Trigger a plague event (or check `_healthcarePlagueMitigation` on state) | `game.civs[0].state._healthcarePlagueMitigation` is a value 0–1; higher for Universal Public |
| 11.5 | _demographicBirthMod exists | `game.civs[0].state._demographicBirthMod` in console | Returns a numeric value (non-undefined) |
| 11.6 | Profit-First incentive reduces equality | Set Profit-First; run 10 turns; check equalityIndex | equalityIndex trends downward relative to Patient Outcomes setting |
| 11.7 | Prevention emphasis reduces long-term disease burden | Run parallel games with Prevention vs. Treatment over 30 turns | Prevention game shows slower wellbeing decline during non-plague turns |

---

## Section 12 — Per-Turn Effects: Resource Strategy

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 12.1 | resourceStrategy state variable set | `game.civs[0].state.resourceStrategy` in console | Returns correct string ID |
| 12.2 | _resourceDepletionMod exists | `game.civs[0].state._resourceDepletionMod` in console | Returns a numeric multiplier (not undefined) |
| 12.3 | _pollutionMod exists | `game.civs[0].state._pollutionMod` in console | Returns a numeric multiplier |
| 12.4 | _wasteMod exists | `game.civs[0].state._wasteMod` in console | Returns a numeric multiplier |
| 12.5 | Conservation slows depletion | Run 20 turns with Conservation; check forests/soil/minerals | Resources deplete slower than with Extraction for Growth |
| 12.6 | Extraction for Growth accelerates depletion | Run 20 turns with Extraction; check resources | Forests, soil, minerals decline faster than with Balanced Stewardship |
| 12.7 | _resourceCrisisOffset set | `game.civs[0].state._resourceCrisisOffset` in console | Returns a numeric value (positive for conservation, negative for extraction) |
| 12.8 | Crisis threshold shift active | With Extraction for Growth; resources near crisis | Environmental crisis event triggers earlier than with Conservation |
| 12.9 | Strategy change takes effect next turn | Change strategy in Sustainability Panel; advance 1 turn | `_resourceDepletionMod` on state reflects the new strategy's multiplier |

---

## Section 13 — Per-Turn Effects: Resource History

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 13.1 | resourceHistory is an array | `game.civs[0].state.resourceHistory` in console | Returns an array |
| 13.2 | History grows each turn | After 5 turns, check `.resourceHistory.length` | Returns 5 |
| 13.3 | History caps at 50 | After 55 turns, check `.resourceHistory.length` | Returns 50 (not 55) |
| 13.4 | History entry has correct fields | `game.civs[0].state.resourceHistory[0]` | Object with fields: turn, forests, soil, minerals, water, pollution, waste, strategy, obsolescence |
| 13.5 | History values are numeric | Check several field values | forests/soil/etc. are numbers 0–100; strategy is a string |

---

## Section 14 — Per-Turn Effects: Information Ecosystem

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 14.1 | informationEcosystem state variable set | `game.civs[0].state.informationEcosystem` in console | Returns correct string ID matching wizard/panel selection |
| 14.2 | Truth anchor pull toward high EH | Set Open Civic Media; run 10 turns starting from low EH | epistemicHealth trends upward |
| 14.3 | Truth anchor pull toward low EH | Set Total Information Control; run 10 turns starting from high EH | epistemicHealth trends downward |
| 14.4 | Anchor pull magnitude is gradual | Observe EH change per turn | Change per turn is small (approx 0.3–1.5 pts/turn), not a sudden jump |
| 14.5 | Innovation cross-effect | Compare Open Civic vs. Total Control over 30 turns; check innovationIndex or research rate | Open Civic produces higher innovation over time |
| 14.6 | Stability cross-effect | Compare State-Guided vs. Open Civic; check stabilityIndex | State-Guided may show short-term stability boost vs. Open Civic |
| 14.7 | Equality cross-effect | Compare Open Civic vs. Total Control; check equalityIndex | Open Civic produces more equitable outcomes over time |
| 14.8 | Change via panel triggers event | Change ecosystem in Society Panel → Information tab | Event fires; `_processInformationEcosystem` picks up new setting next turn |

---

## Section 15 — Event System: New Event Types

Use browser console to fire events manually:
```js
game.handleEvent({ type: 'set_healthcare_access', value: 'universal_public' });
```

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 15.1 | set_healthcare_access event | Fire event with `value: 'universal_public'` | `game.civs[0].state.healthcareAccess` === `'universal_public'`; no console errors |
| 15.2 | set_healthcare_emphasis event | Fire event with `value: 'prevention'` | `healthcareEmphasis` state updated |
| 15.3 | set_healthcare_incentive event | Fire event with `value: 'profit_first'` | `healthcareIncentive` state updated |
| 15.4 | set_resource_strategy event | Fire event with `value: 'conservation'` | `resourceStrategy` state updated |
| 15.5 | set_obsolescence_model event | Fire event with `value: 'market_driven'` | `obsolescenceModel` state updated |
| 15.6 | set_information_ecosystem event | Fire event with `value: 'total_information_control'` | `informationEcosystem` state updated |
| 15.7 | Panel UI syncs after event | Fire event manually; open affected panel tab | Tab displays the newly set value as active |
| 15.8 | Invalid value handled gracefully | Fire `set_resource_strategy` with `value: 'nonexistent_strategy'` | No crash; state either unchanged or defaults to a safe value |

---

## Section 16 — Cross-System Interactions

These tests verify that the new systems interact correctly with each other and with pre-existing systems.

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 16.1 | Healthcare → Plague interaction | Set Universal Public; trigger a Plague event (advance turns until one fires or use console injection) | Plague duration/mortality reduced vs. Minimal/Traditional |
| 16.2 | Healthcare → Birth rate | Set Universal Public + Prevention emphasis; run 20 turns | Population growth rate slightly higher due to `_demographicBirthMod` |
| 16.3 | Resource strategy → Pollution | Set Extraction for Growth; run 20 turns | Pollution level climbs faster than with Conservation |
| 16.4 | Obsolescence → Waste | Set Market-Driven Obsolescence; run 20 turns | Waste increases faster; Pollution increases faster (waste contributes to pollution) |
| 16.5 | Synergy: Extraction + Market-Driven | Set both; run 20 turns | Waste × ~2.5 and depletion × ~2.0 vs. balanced defaults; environmental crisis risk higher |
| 16.6 | Information → EH + Innovation loop | Set Open Civic; run 30 turns | EH rises → innovation rises → potentially reinforcing positive cycle |
| 16.7 | Information → Authoritarian destabilization | Set Total Control + Autocratic government; run 30 turns | EH depresses; may trigger events related to suppression or unrest |
| 16.8 | IQ + Government-Managed strategy | Set very low Institutional Quality (if configurable) + Government-Managed | Depletion multiplier closer to 1.2 (ineffective governance) |
| 16.9 | IQ + Government-Managed (strong) | Set high IQ + Government-Managed | Depletion multiplier closer to 0.5 (effective governance) |
| 16.10 | Profit-First healthcare + Inequality | Run 20 turns with Profit-First; check Gini coefficient equivalent | Equality index declines |
| 16.11 | No NaN values after 20 turns | Advance 20 turns; inspect key state fields | `epistemicHealth`, `equalityIndex`, `stabilityIndex`, `wellbeingIndex`, `forests`, `soil`, `minerals`, `water`, `pollution`, `waste` are all finite numbers |
| 16.12 | No undefined state fields | After game start, check state object | `healthcareAccess`, `healthcareEmphasis`, `healthcareIncentive`, `resourceStrategy`, `obsolescenceModel`, `informationEcosystem`, `resourceHistory` all defined |

---

## Section 17 — UI/UX Polish Checks

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 17.1 | Healthcare cards styled correctly | Observe Healthcare tab | Cards have distinct background colors per tier (green for universal, red for minimal, etc.) |
| 17.2 | Information ecosystem cards styled | Observe Information tab | Each ecosystem type has distinct visual styling |
| 17.3 | Sustainability panel doesn't overlap Society panel | Open both panels | Panels either stack or the second replaces the first; no overlap causing unreadable UI |
| 17.4 | Panel is scrollable if content overflows | Open Healthcare tab on small viewport | Vertical scrollbar appears; content accessible |
| 17.5 | Card Apply buttons clearly labelled | Observe any card selector | Each card has an "Apply" or equivalent button distinct from card body |
| 17.6 | Synergy warning is visually distinct | Trigger synergy (Extraction + Market-Driven) | Warning box uses orange/red color distinguishing it from normal content |
| 17.7 | Truth anchor box uses monospace font | Observe Information tab anchor display | Values displayed in monospace font for alignment |
| 17.8 | Resource bars have color coding | Observe Resources tab | Pollution/Waste bars use different color from Forests/Soil/Minerals/Water |

---

## Section 18 — Regression Tests (Pre-Existing Systems)

Verify new code has not broken previously working functionality.

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 18.1 | Women's Rights tab still works | Open Society panel → 👩 Women's Rights | Tab renders normally; GEI anchor display works |
| 18.2 | Education tab still works | Open Society panel → 📚 Education | Tab renders; education tier cards visible |
| 18.3 | Economy tab still works | Open Society panel → 💰 Economy | Tab renders normally |
| 18.4 | Arts tab still works | Open Society panel → 🎨 Arts | Tab renders normally |
| 18.5 | Resource depletion still runs | Advance 10 turns; check forests value | Forests deplete (slightly) per turn — not frozen at initial value |
| 18.6 | Pollution still accumulates | Advance 10 turns; check pollution | Pollution increases (especially with high industry) |
| 18.7 | Events panel still shows events | Advance turns until an event fires | Events appear in Events panel as before |
| 18.8 | History panel still works | Advance 10 turns; open History | Turn history visible |
| 18.9 | All prior wizard steps work | Start new wizard; complete all steps 1–9 | Steps 1–9 behave as before; no regressions |
| 18.10 | Game saves/loads correctly | If save/load is implemented: save game; reload; check state | `healthcareAccess`, `resourceStrategy`, `informationEcosystem` survive save/load cycle |

---

## Section 19 — Edge Cases & Boundary Conditions

| # | Test | Steps | Expected Result |
|---|------|-------|-----------------|
| 19.1 | Export with zero history | Open Export tab immediately after game start (0 turns) | Table shows 0 rows or a "no data yet" message; CSV download produces header-only file; no crash |
| 19.2 | CSV with special characters | If civilization name includes commas or quotes | CSV file escapes them correctly; opens in Excel without corruption |
| 19.3 | Government-Managed with IQ = 0 | Set IQ to minimum; use Government-Managed strategy | No division-by-zero; depletion multiplier clamps to maximum allowed value (≈1.2) |
| 19.4 | Government-Managed with IQ = 100 | Set IQ to maximum; use Government-Managed strategy | Depletion multiplier clamps to minimum allowed value (≈0.5) |
| 19.5 | Rapid strategy changes | Change resource strategy 5 times in quick succession | No cumulative multiplier drift; multiplier always reflects only the current setting |
| 19.6 | EH already at anchor | Information ecosystem where current EH equals the anchor value | Drift per turn shown as 0 or near-0; no oscillation |
| 19.7 | Resources at 0% | Manually deplete a resource to 0 (or find a game state where this occurs) | Resource bar shows 0%; no negative values; crisis events fire appropriately |
| 19.8 | Resources at 100% | With Conservation + Durability-First over many turns in a low-population game | Resources stay at 100%; no overflow past cap |
| 19.9 | All healthcare + info set to extremes simultaneously | Set Universal Public + Prevention + Patient Outcomes + Open Civic + Conservation + Durable | No NaN; game continues; effects reinforce in expected direction (very healthy, low pollution, high EH) |
| 19.10 | All set to worst extremes | Set Minimal/Traditional + Profit-First + Total Control + Extraction + Market-Driven | No crash; game degrades predictably (high pollution, low EH, poor wellbeing) |

---

## Section 20 — Console-Assisted Spot Checks

Quick state inspection tests using the browser console.

```js
// Shorthand helpers for tests below
const s = game.civs[0].state;
const checks = {
  healthcareAccess: s.healthcareAccess,
  healthcareEmphasis: s.healthcareEmphasis,
  healthcareIncentive: s.healthcareIncentive,
  resourceStrategy: s.resourceStrategy,
  obsolescenceModel: s.obsolescenceModel,
  informationEcosystem: s.informationEcosystem,
  resourceHistoryLength: s.resourceHistory?.length,
  depletionMod: s._resourceDepletionMod,
  pollutionMod: s._pollutionMod,
  wasteMod: s._wasteMod,
  crisisOffset: s._resourceCrisisOffset,
  plagueMitigation: s._healthcarePlagueMitigation,
  birthMod: s._demographicBirthMod,
};
console.table(checks);
```

| # | Expected Console Output |
|---|------------------------|
| 20.1 | All 6 string state variables are non-null strings |
| 20.2 | `resourceHistoryLength` increases by 1 each turn |
| 20.3 | `depletionMod` is a finite number (not NaN, not Infinity) |
| 20.4 | `pollutionMod` is a finite number |
| 20.5 | `wasteMod` is a finite number |
| 20.6 | `crisisOffset` is a finite number (positive or negative) |
| 20.7 | `plagueMitigation` is a number between 0 and 1 |
| 20.8 | `birthMod` is a finite number close to 1.0 (±0.3 typical range) |

---

## Appendix A — Quick Smoke Test (5-minute version)

If time is limited, run only these tests for a basic pass/fail signal:

1. **2.1** — Page loads without console errors
2. **2.3** — 🌿 Sustainability button present
3. **2.5** — Sustainability panel opens on click
4. **4.1** — Healthcare tab present in Society panel
5. **4.2** — Healthcare tab renders without error
6. **5.1** — Information tab present
7. **6.3** — Resources tab is default in Sustainability Panel
8. **7.1** — Six resource bars visible
9. **10.7** — CSV download works
10. **11.1** — `healthcareAccess` state set correctly (console check)
11. **16.11** — No NaN values after 20 turns
12. **18.5** — Resource depletion still runs (regression)

---

## Appendix B — Test Environment Notes

- **Browser:** Chrome or Firefox recommended; Safari may have minor canvas rendering differences (PNG export)
- **Console access:** F12 → Console; must be open for Section 15 (event firing) and Section 20 (state inspection)
- **Turn advancement:** Use the simulation's normal turn button; do not use browser refresh between tests in the same section
- **Parallel run comparison tests:** Open two browser tabs with the same `index.html`, configure each differently, advance turns simultaneously
- **File downloads:** Browser download folder must be accessible; some tests (Section 10) require opening downloaded files in a spreadsheet application

---

## Appendix C — Known Limitations (Not Bugs)

- The Government-Managed strategy multiplier is computed dynamically and will not show a fixed value in the UI card — this is by design (IQ-scaling)
- The truth anchor EH pull is gradual (0.6%/turn) — EH changes will be subtle over short runs (10 turns); use 30+ turn runs for observable trends
- Resource history chart requires at least 2 data points to draw lines — the chart area will be blank on turn 0
- CSV download requires the browser to permit file downloads from local `file://` URLs — if blocked, serve the simulation from a local web server

---

*Document generated: March 2026 | Civilization Simulation Pass 6*

---
---

# Test Verification Guide — Pass 7 Supplement
## Empathy Cascade · Cultural Gap · Wealth Capture · Paradigm Shifts · NPC Commentary

**Version:** Pass 7 (March 2026)
**Scope:** All new functionality added in Pass 7 — new chart types, four new Society Panel tabs, Paradigm Shifts panel, and NPC commentary intents.
**Prerequisite:** Pass 6 tests should have been run first. Pass 7 tests assume a working Pass 6 baseline.

---

## Section 21 — Syntax / Static Checks (Pass 7)

Run from the `civ-sim/` directory.

| #    | Test | Command | Expected Result |
|------|------|---------|-----------------|
| 21.1 | config.js | `node --check js/config.js` | No output (exit 0) |
| 21.2 | civilization.js | `node --check js/civilization.js` | No output (exit 0) |
| 21.3 | simulation.js | `node --check js/simulation.js` | No output (exit 0) |
| 21.4 | chart_utils.js | `node --check js/chart_utils.js` | No output (exit 0) |
| 21.5 | society_panel.js | `node --check js/society_panel.js` | No output (exit 0) |
| 21.6 | paradigm_panel.js | `node --check js/paradigm_panel.js` | No output (exit 0) |
| 21.7 | game.js | `node --check js/game.js` | No output (exit 0) |
| 21.8 | npc.js | `node --check js/npc.js` | No output (exit 0) |

---

## Section 22 — Page Load & Button Presence (Pass 7)

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 22.1 | Page loads without errors | Open index.html; check console | No red errors |
| 22.2 | Paradigm button present in toolbar | Look at bottom toolbar | 🔄 Paradigm button visible after 🌿 Sustainability |
| 22.3 | Paradigm panel hidden at startup | Observe screen | No paradigm panel visible on load |
| 22.4 | Paradigm button opens panel | Click 🔄 Paradigm | Panel appears |
| 22.5 | Paradigm button closes panel | Click 🔄 Paradigm again | Panel hides |
| 22.6 | Shift+P opens paradigm panel | Press Shift+P | Paradigm panel toggles open |
| 22.7 | Shift+P closes paradigm panel | Press Shift+P again | Panel hides |
| 22.8 | Lowercase p still opens stratification panel | Press p (no shift) | Stratification panel opens — not paradigm panel |
| 22.9 | Four new Society tabs present | Open Society panel; scan tab bar | Tabs visible: 🧬 Empathy, ⚡ E×R, 🔍 Cultural Gap, 💰 Wealth Capture |
| 22.10 | Pre-existing Society tabs still present | Open Society panel | All original tabs still visible and functional |

---

## Section 23 — Society Panel: Empathy Cascade Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 23.1 | Tab renders without error | Click 🧬 Empathy tab | Content renders; no JS errors in console |
| 23.2 | Susceptibility distribution canvas visible | Observe tab | Canvas element present with drawn curve |
| 23.3 | Distribution curve has spike at left | Observe curve | Sharp spike on left side of curve (resistant fraction bar) |
| 23.4 | Distribution curve has smooth gamma region | Observe curve | Smooth hill-shaped fill to the right of the spike |
| 23.5 | Stratum mean lines present | Observe curve | 5 dashed vertical lines (one per stratum) labeled by position |
| 23.6 | Cascade flow canvas visible | Scroll down | Second canvas shows a vertical cascade diagram |
| 23.7 | Cascade boxes labeled with stratum names | Observe flow | Boxes show Leader → Elite → Professional → Laborer → Marginalized |
| 23.8 | Arrows connect boxes | Observe flow | Downward arrows between each level |
| 23.9 | Marginalized box shows split bar | Observe bottom box | Disenfranchised box has green (cooperation) and red (competition) bar side by side, not a standard empathy bar |
| 23.10 | Tension bars visible below cascade | Observe below canvas | Horizontal bars labeled with tension/stress metrics |
| 23.11 | Theocratic bias section shown when active | Use a civilization with theocratic religion; open Empathy tab | Additional theocratic bias section visible; hidden for non-theocratic civs |
| 23.12 | Export PNG button present | Observe tab | "Export PNG" or download button visible for the chart |
| 23.13 | Export PNG triggers download | Click export PNG | Browser downloads a .png file |
| 23.14 | Export CSV button present | Observe tab | "Export CSV" button visible |
| 23.15 | Export CSV triggers download | Click Export CSV | Browser downloads a .csv file |
| 23.16 | Export TXT button present | Observe tab | "Export TXT" button visible |
| 23.17 | Export TXT triggers download | Click Export TXT | Browser downloads a .txt file |
| 23.18 | TXT content is readable | Open downloaded .txt | Narrative text describing empathy cascade state; no raw object notation |

---

## Section 24 — Society Panel: E×R Interaction Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 24.1 | Tab renders without error | Click ⚡ E×R tab | Content renders; no JS errors |
| 24.2 | Interaction type badge present | Observe top of tab | Badge labeled Virtuous / Vicious / Conflicted / Neutral (one of the four) |
| 24.3 | Badge color matches type | Observe badge color | Green for Virtuous, Red for Vicious, Amber for Conflicted, Gray for Neutral |
| 24.4 | Aggregate bars present | Observe below badge | Horizontal bars for empathy component, reinforcement component, combined score |
| 24.5 | Dual-axis line chart renders | Observe canvas | Canvas with two Y-axes (left: empathy, right: reinforcement) and dashed combined line |
| 24.6 | Chart has turn history lines | Advance several turns; revisit tab | Chart shows multi-point lines; not just a single data point |
| 24.7 | Left Y-axis labeled empathy | Observe chart | Left axis label or color indicator for empathy (blue) |
| 24.8 | Right Y-axis labeled reinforcement | Observe chart | Right axis label or indicator for reinforcement (orange) |
| 24.9 | Stratum comparison chart renders | Scroll down | Grouped bar chart showing empathy vs reinforcement per stratum |
| 24.10 | Per-stratum bars grouped | Observe chart | Two bars side by side per stratum (primary = empathy, secondary = reinforcement) |
| 24.11 | Export PNG/CSV/TXT present and functional | Click each export button | Each triggers a download |
| 24.12 | Narrative text describes correct type | Read narrative below charts | Description matches badge type (e.g., virtuous describes reinforcing positive loop) |

---

## Section 25 — Society Panel: Cultural Gap Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 25.1 | Tab renders without error | Click 🔍 Cultural Gap tab | Content renders; no JS errors |
| 25.2 | Gap badge present | Observe top | Badge showing gap severity level (e.g., Low / Moderate / High / Critical) |
| 25.3 | Gap score metric bar visible | Observe | Horizontal bar for gapScore |
| 25.4 | Cynicism level bar visible | Observe | Horizontal bar for cynicismLevel |
| 25.5 | Paradigm shift readiness bar visible | Observe | Horizontal bar for paradigmShiftReadiness |
| 25.6 | Stated vs reinforced values chart renders | Observe canvas | Grouped bar chart: 5 value domains, two bars each (stated vs reinforced) |
| 25.7 | Stated bars differ from reinforced bars | Observe chart | Bars are not identical (unless gap is literally 0) |
| 25.8 | Per-stratum gap perception chart renders | Scroll down | Second canvas showing how each stratum perceives the gap |
| 25.9 | History line chart renders | Scroll further | Time-series chart of gapScore, cynicismLevel, readiness |
| 25.10 | History chart needs turns | Advance 5 turns; revisit | Chart shows 5 data points |
| 25.11 | Narrative describes cynicism correctly | Read narrative | References cynicism level; mentions revolutionary consciousness if readiness is high |
| 25.12 | Export PNG/CSV/TXT present and functional | Click each | Each downloads correctly |
| 25.13 | Alert badge shows red when gap critical | In a civilization with high gap + cynicism | Badge is red (not amber or blue) |

---

## Section 26 — Society Panel: Wealth Capture Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 26.1 | Tab renders without error | Click 💰 Wealth Capture tab | Content renders; no JS errors |
| 26.2 | Degree badge present | Observe top | Badge showing wealth capture degree (numeric or label) |
| 26.3 | Feudal alert badge hidden by default | In a new game with moderate settings | No feudal alert badge visible |
| 26.4 | Feudal alert badge appears when active | In a civilization where degree > 80 AND wealthConc > 75 | Red/orange "Feudal Dynamic Active" badge or similar alert visible |
| 26.5 | 4-dimension bar chart renders | Observe canvas | Bar chart with four bars: institutional, electoral, media, cultural capture dimensions |
| 26.6 | Bars use consistent color scheme | Observe chart | Bars visually distinct; colors match the dark theme |
| 26.7 | History line chart renders | Scroll down | Time-series of degree + reinforcement control (or similar metrics) |
| 26.8 | History chart populates after turns | Advance 5 turns; revisit | Lines show multiple points |
| 26.9 | Narrative describes degree accurately | Read narrative | High degree → captures describes systematic control; low degree → describes different state |
| 26.10 | Export PNG/CSV/TXT present and functional | Click each | Each downloads correctly |
| 26.11 | Reinforcement control metric present | Observe tab | Metric or bar for "reinforcement control" (% of behavioral incentives set by extreme wealth) visible |

---

## Section 27 — Paradigm Shifts Panel: Layout & Navigation

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 27.1 | Panel opens | Click 🔄 Paradigm | Panel appears |
| 27.2 | Four tabs present | Observe tab bar | Tabs: Current State, Trigger Shift, History, Analysis |
| 27.3 | Current State is default tab | Open panel fresh | Current State tab active and rendered |
| 27.4 | Tab navigation works | Click each tab | Each renders without errors |
| 27.5 | Panel closes cleanly | Click 🔄 again or close button | Panel hides; reopening works |

---

## Section 28 — Paradigm Shifts Panel: Current State Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 28.1 | Readiness badge present | Open Current State tab | Badge showing readiness level (0–100 or label) |
| 28.2 | 6 metric bars visible | Observe tab | Bars for: readiness, cynicism, cultural gap, wealth capture degree, social pressure, or similar |
| 28.3 | Current governance model displayed | Observe | Text or card showing the current governance model name |
| 28.4 | Current economic model displayed | Observe | Text or card showing the current economic model name |
| 28.5 | Active shifts list visible | If a shift is in progress | Active shifts shown with progress indicator |
| 28.6 | Active shifts list empty initially | New game, no shift triggered | Section shows "no active shifts" or empty list gracefully |
| 28.7 | Completed shifts count shown | Observe | Counter or label for number of completed paradigm shifts (0 initially) |

---

## Section 29 — Paradigm Shifts Panel: Trigger Shift Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 29.1 | Shift cards displayed | Click Trigger Shift tab | At least some shift catalog entries visible as cards |
| 29.2 | Ineligible shifts filtered | Observe | Only shifts eligible from the current governance/economic model are shown |
| 29.3 | Cards show shift name and description | Read a card | Each card has a title and a short description |
| 29.4 | Cards show direction | Read cards | Each card indicates direction (e.g., more democratic, more market, etc.) |
| 29.5 | Selecting a card opens detail panel | Click a shift card | Inline detail panel appears below/beside the card |
| 29.6 | Detail panel shows resistance factors | Observe detail panel | Resistance factor list visible (factors that slow the shift) |
| 29.7 | Detail panel shows enhancement factors | Observe detail panel | Enhancement factor list visible (factors that speed the shift) |
| 29.8 | Target model selector shown | Observe detail panel | Dropdown or list of possible target governance/economic models |
| 29.9 | Strategy checkboxes shown | Observe detail panel | List of implementation strategies; each is selectable |
| 29.10 | Recommended strategies highlighted | Observe strategies | One or more strategies have a visual "recommended" indicator |
| 29.11 | Confirm button present | Observe bottom of detail panel | "Trigger Shift" or "Confirm" button visible |
| 29.12 | Confirm button triggers shift | Select a shift + target + strategy; click confirm | Shift appears in Current State tab active shifts; no console error |
| 29.13 | No eligible shifts shows message | In a game where all catalog shifts are ineligible | "No eligible shifts" message rather than empty list or crash |

---

## Section 30 — Paradigm Shifts Panel: History Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 30.1 | History tab renders | Click History tab | Content visible; no errors |
| 30.2 | Readiness history chart renders | Observe | Line chart of paradigmShiftReadiness over time |
| 30.3 | Chart needs turn data | Open tab on turn 0 | Chart blank or shows single point gracefully; no crash |
| 30.4 | Chart populates after turns | Advance 10 turns; revisit | 10 data points on readiness line |
| 30.5 | Completed shifts list visible | Observe below chart | List of completed shifts or "No completed shifts yet" |
| 30.6 | Completed shift entry appears after trigger | Trigger a shift; advance until completed | Shift entry in list with turn number and from/to models |
| 30.7 | Completed shifts sorted newest-first | Trigger two shifts in sequence | Most recent shift appears at top of list |
| 30.8 | CSV export button present | Observe tab | Export CSV button visible |
| 30.9 | CSV export downloads | Click export | Browser downloads .csv with readiness history data |

---

## Section 31 — Paradigm Shifts Panel: Analysis Tab

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 31.1 | Analysis tab renders | Click Analysis tab | Content visible; no errors |
| 31.2 | Readiness drivers list present | Observe | List of 8 factors (or similar count) contributing to shift readiness |
| 31.3 | Driver values are numeric | Read driver list | Each factor shows a numeric contribution (positive = pushing toward shift) |
| 31.4 | Narrative text present | Observe below drivers | Paragraph(s) describing current readiness state and key drivers |
| 31.5 | Narrative references current models | Read narrative | Mentions current governance and/or economic model names |
| 31.6 | TXT export button present | Observe | "Export TXT" or download button visible |
| 31.7 | TXT export downloads | Click export | Browser downloads .txt file with narrative content |
| 31.8 | TXT content matches displayed narrative | Open downloaded file | Text matches what was shown in the panel |

---

## Section 32 — Paradigm Shift Mechanics (State Verification)

Use browser console for these checks.

```js
const s = game.civs[0].state;
```

| #    | Test | Steps / Console Check | Expected Result |
|------|------|----------------------|-----------------|
| 32.1 | paradigmShiftReadiness field exists | `s.paradigmShiftReadiness` | Returns a number 0–100 (not undefined) |
| 32.2 | culturalGap object exists | `s.culturalGap` | Returns an object (not undefined) |
| 32.3 | culturalGap.gapScore is numeric | `s.culturalGap.gapScore` | Returns a finite number |
| 32.4 | culturalGap.cynicismLevel is numeric | `s.culturalGap.cynicismLevel` | Returns a finite number |
| 32.5 | culturalGap.paradigmShiftReadiness is numeric | `s.culturalGap.paradigmShiftReadiness` | Returns a finite number |
| 32.6 | wealthCapture object exists | `s.wealthCapture` | Returns an object (not undefined) |
| 32.7 | wealthCapture.degree is numeric | `s.wealthCapture.degree` | Returns a finite number 0–100 |
| 32.8 | wealthCapture.feudalDynamic is boolean | `s.wealthCapture.feudalDynamic` | Returns true or false (not undefined) |
| 32.9 | wealthCapture.dimensions is an object | `s.wealthCapture.dimensions` | Returns object with institutional, electoral, media, cultural keys |
| 32.10 | Feudal dynamic triggers when expected | Set wealthConc to 76+; ensure degree > 80 via turns | `s.wealthCapture.feudalDynamic === true`; feudal alert visible in Wealth Capture tab |
| 32.11 | Paradigm shift history recorded | Trigger a shift; let it complete | `s.completedParadigmShifts` (or similar) is an array with one entry |
| 32.12 | Active shifts cleared on completion | After shift completes | `s.activeParadigmShifts` array is empty (or shift shows completed state) |
| 32.13 | No NaN in Pass 7 state fields | After 20 turns | All fields in 32.1–32.9 are finite; no NaN or Infinity |

---

## Section 33 — NPC Commentary: Pass 7 Intents

Start a game, click 🗣️ Interview, then ask the questions below. The NPC should detect the intent and give a contextually appropriate response.

| #    | Test | Question to Ask | Expected Result |
|------|------|-----------------|-----------------|
| 33.1 | paradigm_shift intent detected | "Do you think a paradigm shift is possible?" | NPC does not give a generic 'future' response; uses structurally-aware language about systemic change or transition |
| 33.2 | paradigm_shift — leader/elite NPC | Interview a leader or elite NPC; ask about "system change" | Response defends the existing structure or expresses concern about instability |
| 33.3 | paradigm_shift — high readiness state | In a game with paradigmShiftReadiness > 65; ask about "systemic transformation" | Response references collective energy, building pressure, or imminent change |
| 33.4 | wealth_capture intent detected | "Do the wealthy control everything?" | NPC uses wealth capture / structural power language |
| 33.5 | wealth_capture — leader/elite NPC | Interview elite; ask "do the rich run things?" | Response normalizes or defends wealth influence |
| 33.6 | wealth_capture — feudal dynamic active | In a game with feudalDynamic active; ask a marginalized NPC about "who really runs things" | Response references formal vs. actual power structures |
| 33.7 | cultural_gap intent detected | "Why is there such hypocrisy in our society?" | NPC gives cultural gap response about stated vs. reinforced values |
| 33.8 | cultural_gap — high gap + cynicism | In a game with gapScore > 60 AND cynicismLevel > 70; ask about "hypocrisy" | Response is more direct and disillusioned than baseline |
| 33.9 | cynicism_consciousness intent detected | "Have people just given up?" | NPC responds with cynicism/consciousness framing |
| 33.10 | cynicism_consciousness — high RC | In a game with paradigmShiftReadiness > 65; ask about "people losing faith" | Response notes collective awakening rather than pure despair |
| 33.11 | _perceptionChange: high cynicism + gap | Interview any NPC in a high cynicism (>70) + high gap (>60) game; ask "What would you change?" | Response uses structural change language (not just personal wishes) |
| 33.12 | _perceptionChange: moderate cynicism | In a game with moderate cynicism (45–70) and gap (40–60); ask "what would you change?" | Response acknowledges systemic barriers without full disillusionment |
| 33.13 | _perceptionChange: elite NPC + cynicism | Interview an elite NPC in high cynicism state; ask "what would you change?" | Response reflects awareness that cynicism serves elite interests |
| 33.14 | _perceptionPower: feudal dynamic | Interview marginalized NPC in feudal dynamic state; ask "who has power?" | Response distinguishes between formal and actual power structures |
| 33.15 | _perceptionPower: high capture degree | Interview marginalized NPC with capture degree > 60; ask "who really decides things?" | Response references wealth accountability gap |

---

## Section 34 — Cross-System Interactions (Pass 7)

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 34.1 | High wealthConc + high capture → feudal | Run 30 turns with high wealth concentration settings | wealthCapture.feudalDynamic becomes true; alert badge appears in Wealth Capture tab |
| 34.2 | Cultural gap grows when stated ≠ reinforced | Use governance/economy with strong rhetorical values but behavior reinforcing opposite | culturalGap.gapScore increases over turns |
| 34.3 | Cynicism rises with persistent gap | Let gapScore stay high for 20+ turns | cynicismLevel increases |
| 34.4 | Cynicism feeds paradigmShiftReadiness | Let cynicismLevel climb; check readiness | paradigmShiftReadiness increases as cynicism rises |
| 34.5 | Paradigm shift reduces readiness | Trigger and complete a paradigm shift | paradigmShiftReadiness drops after completion |
| 34.6 | Paradigm shift changes governance | Trigger a governance shift | civ.governance model changes to target; "current governance" in paradigm panel updates |
| 34.7 | Paradigm shift changes economy | Trigger an economic shift | civ.economics model changes to target |
| 34.8 | Wealth capture affects reinforcement | High wealthCapture.degree | behaviorReinforcement values shift toward patterns that favor capital accumulation |
| 34.9 | Legacy save loads without crash | Load a save from before Pass 7 (no culturalGap/wealthCapture fields) | All four new Society tabs render without crash; values default to 0 or neutral |
| 34.10 | Legacy save: paradigm panel loads | Open paradigm panel on legacy save | Panel renders without crash; readiness shows 0 or similar safe default |
| 34.11 | No NaN after 30 turns | Advance 30 turns in any configuration | All Pass 7 state fields finite; no NaN or undefined in `s.culturalGap`, `s.wealthCapture`, `s.paradigmShiftReadiness` |

---

## Section 35 — Chart Utils: New Methods (Visual Verification)

These tests verify the four new chart drawing methods introduced in Pass 7.

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 35.1 | drawDistributionCurve renders | Open 🧬 Empathy tab | Canvas present with visible content (not blank) |
| 35.2 | Spike distinguishable from curve | Observe left side of distribution canvas | Clear visual distinction between resistant-fraction spike and gamma curve region |
| 35.3 | drawDualAxisLine renders | Open ⚡ E×R tab | Canvas with two color-coded lines and dashed combined line |
| 35.4 | Dual axis: both Y-axes labeled | Observe axes | Left side labeled / colored blue; right side labeled / colored orange |
| 35.5 | drawStratumComparison renders | Observe E×R tab stratum chart or Cultural Gap stratum chart | Grouped bars clearly separated per stratum |
| 35.6 | Secondary bars visually distinct | Observe stratum comparison | Secondary bars use different color or transparency from primary |
| 35.7 | drawCascadeFlow renders | Open 🧬 Empathy tab cascade | Vertical flow diagram with boxes and connecting arrows |
| 35.8 | Cascade color-codes by empathy level | Observe cascade boxes | Boxes change color as empathy level varies (lower empathy = warmer/redder) |
| 35.9 | No canvas blank on zero state | Open Society panel with all Pass 7 values at 0 | Canvases render skeleton (axes, empty bars) rather than going completely blank |

---

## Section 36 — UI/UX Polish Checks (Pass 7)

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 36.1 | Paradigm panel styled consistently | Open paradigm panel | Dark theme consistent with other panels; no unstyled/white regions |
| 36.2 | Shift cards selectable state | Click a shift card in Trigger Shift tab | Card gets selected visual state (border highlight, or background change) |
| 36.3 | Active shift card different from completed | If both active and completed shifts exist | Visual distinction between in-progress and completed shift cards |
| 36.4 | Readiness badge colors appropriate | Observe readiness badge in Current State | Low readiness = muted color; high readiness = bright green or alert color |
| 36.5 | Feudal alert badge is visually alarming | With feudal dynamic active | Badge uses red or strong orange — not neutral gray |
| 36.6 | Cultural gap badge scales with severity | Compare low gap vs. high gap civilizations | Badge color/label escalates with severity |
| 36.7 | New tabs don't shift existing tab bar | Open Society panel | Existing tabs still fully visible and clickable; no overflow/wrapping that hides content |
| 36.8 | Export buttons don't overlap charts | Observe export rows | Buttons sit below/above canvases without covering chart content |
| 36.9 | Panel scrollable on small viewport | Reduce browser window height; open paradigm panel | Vertical scrollbar appears; all tabs accessible |

---

## Section 37 — Regression Tests (Pass 7 changes must not break Pass 6)

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 37.1 | Society panel original tabs intact | Open Society panel | All pre-Pass 7 tabs still present and rendering correctly |
| 37.2 | Healthcare tab still functions | Click 🏥 Healthcare | Renders without error; Apply buttons work |
| 37.3 | Information tab still functions | Click 📺 Information | Renders without error; ecosystem cards present |
| 37.4 | Social Psychology tab still functions | Click existing Social Psychology tab (if present) | Renders without error |
| 37.5 | Sustainability panel unaffected | Open 🌿 Sustainability | All 4 tabs still function normally |
| 37.6 | Tech panel unaffected | Open 🔬 Tech | Renders normally; no console errors |
| 37.7 | History panel unaffected | Open 📜 History | Turn history visible |
| 37.8 | Events panel unaffected | Open ⚡ Events | Events displayed normally |
| 37.9 | Interview panel unaffected | Open 🗣️ Interview | NPC interview works; existing intents still trigger |
| 37.10 | p key still opens stratification panel | Press p | Stratification panel opens (not paradigm panel) |
| 37.11 | Shift+S still works (if previously bound) | Check any pre-existing shortcuts | Not broken by new Shift+P binding |
| 37.12 | No NaN after 20 turns | Run for 20 turns | All Pass 6 state fields still finite and valid |

---

## Section 38 — Edge Cases & Boundary Conditions (Pass 7)

| #    | Test | Steps | Expected Result |
|------|------|-------|-----------------|
| 38.1 | Empathy tab with all strata at 0 | Start a game where empathyByStratum are all 0 | Distribution canvas renders minimal curve; cascade boxes show 0 values; no crash |
| 38.2 | Cultural gap at exactly 0 | All stated values equal reinforced values | gapScore = 0; gap badge shows Low; cynicism flat at 0; no crash |
| 38.3 | Cultural gap at 100 | Maximum possible divergence | All metrics at maximum; narrative describes critical state; no overflow |
| 38.4 | Wealth capture degree at 0 | New game, low wealth concentration | No feudal alert; degree badge shows minimal; no crash |
| 38.5 | Wealth capture degree at 100 | Maximum capture over many turns | Feudal dynamic true; all four dimension bars at maximum; no crash |
| 38.6 | Paradigm shift with no strategies selected | In Trigger Shift tab: select shift + target but no strategy checkboxes; click Confirm | Either defaults to baseline, prompts for strategy, or handles gracefully without crash |
| 38.7 | Paradigm shift catalog: all ineligible | In a novel game configuration with no eligible shifts | Trigger Shift tab shows message rather than empty list or crash |
| 38.8 | History tab with 0 turns | Open History tab immediately | No crash; readiness chart blank or empty; "no completed shifts" message |
| 38.9 | Rapid tab switching | Click all 4 Society new tabs in rapid succession multiple times | No double-render errors; no memory leak evident in console |
| 38.10 | NPC interview with all 4 new intents in one session | Interview same NPC, ask about paradigm shift, wealth, hypocrisy, and cynicism | Each question routes to correct intent; no fallthrough to generic response |
| 38.11 | NPC in flat society | Interview NPC in a civ with very low hierarchy | Cascade flow in Empathy tab has fewer visible levels; NPC responses still make societal sense |

---

## Section 39 — Console-Assisted Spot Checks (Pass 7)

```js
// Pass 7 state inspection helper
const s = game.civs[0].state;
const p7 = {
  paradigmShiftReadiness:  s.paradigmShiftReadiness,
  gapScore:                s.culturalGap?.gapScore,
  cynicismLevel:           s.culturalGap?.cynicismLevel,
  captureReadiness:        s.culturalGap?.paradigmShiftReadiness,
  wealthCaptureDegree:     s.wealthCapture?.degree,
  feudalDynamic:           s.wealthCapture?.feudalDynamic,
  captureInstitutional:    s.wealthCapture?.dimensions?.institutional,
  captureElectoral:        s.wealthCapture?.dimensions?.electoral,
  captureMedia:            s.wealthCapture?.dimensions?.media,
  captureCultural:         s.wealthCapture?.dimensions?.cultural,
};
console.table(p7);
```

| #    | Expected Console Output |
|------|------------------------|
| 39.1 | `paradigmShiftReadiness` is a finite number 0–100 |
| 39.2 | `gapScore` is a finite number 0–100 |
| 39.3 | `cynicismLevel` is a finite number 0–100 |
| 39.4 | `captureReadiness` is a finite number 0–100 |
| 39.5 | `wealthCaptureDegree` is a finite number 0–100 |
| 39.6 | `feudalDynamic` is true or false (not undefined) |
| 39.7 | `captureInstitutional`, `captureElectoral`, `captureMedia`, `captureCultural` are all finite numbers |
| 39.8 | None of the above values are NaN or Infinity |

---

## Appendix D — Quick Smoke Test (Pass 7, 10-minute version)

If time is limited, run these tests for a basic Pass 7 pass/fail signal:

1. **21.6** — paradigm_panel.js syntax check passes
2. **21.8** — npc.js syntax check passes
3. **22.2** — 🔄 Paradigm button visible in toolbar
4. **22.4** — Paradigm panel opens on click
5. **22.6** — Shift+P toggles paradigm panel
6. **22.9** — Four new Society tabs present (Empathy, E×R, Cultural Gap, Wealth Capture)
7. **23.1** — 🧬 Empathy tab renders without console error
8. **25.1** — 🔍 Cultural Gap tab renders without console error
9. **26.1** — 💰 Wealth Capture tab renders without console error
10. **27.3** — Paradigm panel opens on Current State tab by default
11. **29.1** — Trigger Shift tab shows catalog entries
12. **33.1** — NPC detects "paradigm shift" question with structural response
13. **32.1** — `paradigmShiftReadiness` state field is a finite number (console check)
14. **34.9** — Legacy save loads without crash (if a pre-Pass 7 save is available)
15. **37.1** — Society panel original tabs still intact (regression)

---

*Document updated: March 2026 | Civilization Simulation Pass 7 supplement appended*

---

# PASS 8 TEST VERIFICATION SUPPLEMENT
## Behavioral Dynamics & Systemic Accountability

---

## Section 40 — Syntax & Load Check (Pass 8 Files)

**Purpose:** Confirm all Pass 8 files parse without errors.

```
node --check js/config.js         → PASS
node --check js/civilization.js   → PASS
node --check js/simulation.js     → PASS
node --check js/chart_utils.js    → PASS
node --check js/paradigm_panel.js → PASS
node --check js/society_panel.js  → PASS
node --check js/npc.js            → PASS
```

Expected: all 7 files report no syntax errors.

---

## Section 41 — Civilization State Initialization (Pass 8 Fields)

**Purpose:** Confirm all 5 new state objects exist at initialization.

**Method:** Open browser console after loading a new game. Run:
```js
const civ = game.civilizations[0];
console.log(JSON.stringify({
  behaviorInertia: civ.state.behaviorInertia,
  facilitationState: civ.state.facilitationState,
  cooperativeOutcomes: civ.state.cooperativeOutcomes,
  thresholdEvents: civ.state.thresholdEvents,
  consequenceDeficit: civ.state.consequenceDeficit,
}, null, 2));
```

Expected:
- `behaviorInertia.coefficient` = 0; `deferredShift` = all zeros; `inertiaHistory` = []
- `facilitationState.activeMeasures` = []; `structuralCeiling` = all 100; `facilitationHistory` = []
- `cooperativeOutcomes.feedback` = 'neutral'; `coopOutcomeScore` = 50; `history` = []
- `thresholdEvents.fired` = []; `_cooldowns` = {}
- `consequenceDeficit.level` = 0; `accelerationMultiplier` = 1.0; `deficitHistory` = []

---

## Section 42 — Behavioral Inertia: Deferred Shift Mechanism

**Purpose:** Confirm that paradigm shift behaviorShift is loaded into deferredShift (not applied immediately).

**Setup:** Start a game. Open console.
```js
const civ = game.civilizations[0];
const beforeCoop = civ.state.behaviorReinforcement.cooperation;
// Trigger a governance paradigm shift manually (if available via triggerParadigmShift)
// Or note cooperation value, then advance 1 turn
console.log('Before:', beforeCoop);
console.log('Deferred shift cooperation:', civ.state.behaviorInertia.deferredShift.cooperation);
```

After a paradigm shift is triggered:
- `behaviorReinforcement.cooperation` should NOT jump by the full behaviorShift delta immediately
- `behaviorInertia.deferredShift.cooperation` should hold the pending delta

After several turns without any other shift:
- `behaviorReinforcement.cooperation` should approach the target gradually
- `deferredShift.cooperation` should trend toward 0

---

## Section 43 — Behavioral Inertia: Coefficient Computation

**Purpose:** Confirm inertia coefficient is computed and logged each turn.

**Method:** Advance 5+ turns, then in console:
```js
const bi = game.civilizations[0].state.behaviorInertia;
console.log('coefficient:', bi.coefficient);
console.log('inertiaHistory (last 3):', bi.inertiaHistory.slice(-3));
```

Expected:
- `coefficient` is between 0 and 100
- `inertiaHistory` has entries with `{turn, coefficient, pendingMagnitude}` for each turn
- Coefficient increases with higher `hierarchyEntrenched` and `wealthCapture.degree`
- Coefficient decreases with higher `educationQuality` and `epistemicHealth`

---

## Section 44 — Society Panel: Behavioral Inertia Tab

**Purpose:** Confirm the Inertia tab renders correctly in Society panel.

1. Open Society panel → click "🧲 Inertia" tab
2. Verify:
   - **Behavioral Inertia** section: bar showing coefficient 0–100
   - Narrative explaining pending shift magnitude and arrival rate
   - **Inertia Drivers** section: 5 stats (time in model, hierarchy entrenched, wealth capture, education quality, EH)
   - **Queued Behavioral Shifts** section: "No shifts queued" message initially
   - **Cooperative Outcomes Feedback** section: shows coopOutcomeScore, feedback type, cumulative reinforcement
3. After advancing 10+ turns: chart canvas appears in Inertia History section
4. PNG and CSV export buttons functional

---

## Section 45 — Society Panel: Power Concentration Tab

**Purpose:** Confirm the Power Concentration tab renders correctly.

1. Open Society panel → click "⚖ Power" tab
2. Verify:
   - **Consequence Deficit** section header
   - Gauge bar visible (green at start, expected to rise with high corruption/wealth capture)
   - Deficit level and Acceleration Multiplier shown in gauge labels
   - Narrative text references `turnsWithoutAccountability`
   - Stats row: Deficit Level, Acceleration Mult., Turns w/o Accountability, Wealth Capture
3. After 20+ turns with high corruption: chart canvas appears
4. PNG and CSV export buttons functional

---

## Section 46 — Paradigm Panel: Facilitation Tab

**Purpose:** Confirm the Facilitation tab renders and activation works.

1. Open Paradigm panel → click "🎓 Facilitation" tab
2. Verify:
   - **Behavioral Inertia** section: coefficient bar
   - **Structural Ceiling vs. Current Behavior**: canvas chart appears after initial turns
   - **Active Measures**: shows "No facilitation measures currently active" initially
   - **Available Measures**: 5 cards visible (Civic Workshops, Forums, Peer Demo, Media Campaign, Economic Alignment)
3. Click "▶ Activate" on "Community Deliberation Forums"
4. Verify:
   - Active Measures section now shows the forum entry with "Indefinite" duration
   - Deactivate button visible
5. Advance 1 turn; re-open Facilitation tab
6. Verify `turnsActive` has incremented for the active measure
7. Click "⏹ Deactivate"; verify measure disappears from active list

---

## Section 47 — Paradigm Panel: Thresholds Tab

**Purpose:** Confirm the Thresholds tab renders, evaluates, and logs events.

1. Open Paradigm panel → click "🚨 Thresholds" tab
2. Verify:
   - **Current Threshold Status** section: cards for all 13 defined thresholds
   - Each card shows threshold name, color-coded border, ✓ or ⚠ EXCEEDED status
   - **Threshold Events** section: "No threshold events" initially
3. Artificially trigger a threshold via console:
   ```js
   const civ = game.civilizations[0];
   civ.state.culturalGap.cynicismLevel = 75;  // triggers 'cynicism_critical'
   ```
4. Advance 1 turn; re-open Thresholds tab
5. Verify `cynicism_critical` threshold card shows ⚠ EXCEEDED
6. Verify event log has entry with turn number, label, and text
7. CSV and TXT export buttons functional

---

## Section 48 — Facilitation Measure: EH Amplifier and Propaganda Risk

**Purpose:** Confirm facilitation effectiveness scales with epistemic health, and media campaign backfires at low EH.

**Setup:** Via console, set low EH:
```js
const civ = game.civilizations[0];
civ.state.epistemicHealth = 25;
// Activate media messaging campaign
civ.queueEvent({ type: 'activate_facilitation_measure', measureId: 'media_messaging_campaign' });
```

Advance 1 turn. Check:
```js
const cg = civ.state.culturalGap;
console.log('cynicismLevel after 1 turn:', cg.cynicismLevel);
```

Expected: cynicismLevel has **increased** (not decreased) — propaganda backfire in effect.

**Contrast:** Set EH = 70, advance 1 turn — cynicismLevel should decrease.

---

## Section 49 — Cooperative Outcomes: Feedback Loop

**Purpose:** Confirm cooperative behavior weakens under extractive conditions and strengthens under cooperative conditions.

**Extractive condition setup:**
```js
const civ = game.civilizations[0];
civ.state.equalityIndex = 15;
civ.state.wealthCapture.degree = 85;
```
Advance 5 turns. Check:
```js
const co = civ.state.cooperativeOutcomes;
console.log('coopOutcomeScore:', co.coopOutcomeScore);
console.log('feedback:', co.feedback);
console.log('cumulativeReinforcement:', co.cumulativeReinforcement);
```
Expected: `feedback = 'weakening'`, cumulative reinforcement declining, cynicism rising slightly each turn.

**Cooperative condition setup:**
```js
civ.state.equalityIndex = 80;
civ.state.wealthCapture.degree = 5;
```
Expected: `feedback = 'reinforcing'`, cumulative reinforcement rising.

---

## Section 50 — Consequence Deficit: Acceleration Multiplier

**Purpose:** Confirm deficit accumulates with unchecked abuse and multiplier increases.

**Setup:** Corrupt, low-accountability state:
```js
const civ = game.civilizations[0];
civ.state.institutionalQuality = 20;
civ.state.epistemicHealth = 20;
civ.state.corruptionIndex = 80;
civ.state.wealthCapture.degree = 80;
```

Advance 10 turns. Check:
```js
const cd = civ.state.consequenceDeficit;
console.log('deficit level:', cd.level);
console.log('accelerationMultiplier:', cd.accelerationMultiplier);
console.log('turnsWithoutAccountability:', cd.turnsWithoutAccountability);
```

Expected:
- `level` rising above 30
- `accelerationMultiplier` > 1.0 (e.g., 1.45–1.7× after 10 turns)
- `turnsWithoutAccountability` = 10

**Recovery test:** Set IQ = 80, EH = 75, advance 5 turns. Expected: deficit falls, multiplier decreases toward 1.0.

---

## Section 51 — NPC Commentary: Pass 8 Intents

**Purpose:** Confirm all 4 new NPC intent categories trigger and produce coherent responses.

**Setup:** For each intent, adjust state then ask the relevant question.

| Intent | State trigger | Test question |
|---|---|---|
| `behavioral_inertia` | `behaviorInertia.coefficient > 65` | "Why do old habits persist even after things have changed?" |
| `power_impunity` | `consequenceDeficit.level > 60` | "Why does no one ever face consequences here?" |
| `facilitation` | active facilitation measure | "What do you think of the civic workshops?" |
| `coop_outcomes` | `cooperativeOutcomes.feedback = 'weakening'` | "Does cooperation actually pay off here?" |

Expected: NPC produces a relevant, position-aware response for each.

Verify elite vs. working-class positions give different responses for `behavioral_inertia` and `power_impunity`.

---

## Section 52 — Threshold Cooldown System

**Purpose:** Confirm thresholds don't fire every turn when condition persists.

**Setup:**
```js
const civ = game.civilizations[0];
civ.state.culturalGap.cynicismLevel = 95;  // above all cynicism thresholds
```

Advance 3 turns. Check:
```js
const fired = civ.state.thresholdEvents.fired;
const cooldowns = civ.state.thresholdEvents._cooldowns;
console.log('fired count:', fired.length);
console.log('cooldowns:', cooldowns);
```

Expected:
- `cynicism_rising` and `cynicism_critical` and `cynicism_collapse` each fired exactly ONCE (not 3 times each)
- `_cooldowns` shows remaining cooldown for each threshold

Advance cooldown turns + 1 more turn — each threshold should fire once more.

---

## Section 53 — Chart Rendering (Pass 8 Chart Types)

**Purpose:** Visual check of all 4 new chart methods.

| Chart | Location | Trigger |
|---|---|---|
| `drawInertiaChart` | Paradigm panel → Facilitation tab OR Society → Inertia tab | 2+ turns of history |
| `drawFacilitationCeilingChart` | Paradigm panel → Facilitation tab | After first turn |
| `drawDeficitChart` | Society → Power Concentration tab | 2+ turns of history |
| `drawCoopOutcomesChart` | Society → Inertia tab (bottom) | 2+ turns of history |

For each chart:
1. Verify canvas renders without blank/white rectangle
2. Verify title text visible
3. Verify color coding correct (inertia: blue + orange; deficit: red fill; outcomes: green + blue)
4. PNG export produces downloadable image

---

## Section 54 — Structural Ceiling Enforcement

**Purpose:** Confirm facilitation cannot push behavior above the structural ceiling.

**Setup:**
```js
const civ = game.civilizations[0];
// Set extreme wealth capture (kills cooperation ceiling)
civ.state.wealthCapture.degree = 95;
// Manually set cooperation behavior at ceiling
civ.state.behaviorReinforcement.cooperation = 80;
// Activate economic incentive alignment (which bypasses ceiling)
civ.queueEvent({ type: 'activate_facilitation_measure', measureId: 'community_forums' });
```

Advance 10 turns. Check cooperation doesn't exceed structural ceiling:
```js
const ceiling = civ.state.facilitationState.structuralCeiling.cooperation;
const actual = civ.state.behaviorReinforcement.cooperation;
console.log('Ceiling:', ceiling, 'Actual:', actual, 'Valid:', actual <= ceiling + 1);
```

Expected: `actual <= ceiling + 1` (ceiling respected; 1-point tolerance for rounding).

---

## Section 55 — Regression Tests (Pass 8 must not break Pass 7)

**Purpose:** Confirm all Pass 7 panel tabs and systems still function after Pass 8 changes.

1. Society Panel: all Pass 7 tabs load correctly (Education, Equity, Institutions, Finance, Demographics, Family, Culture, Healthcare, Information, Social Psychology, Empathy, E×R, Cultural Gap, Wealth Capture)
2. Paradigm Panel: Current State, Trigger Shift, History, and Analysis tabs still load correctly
3. `_processEmpathyCascade`, `_processCulturalGap`, `_processWealthCapture` still run each turn (verify via history entries)
4. NPC Pass 7 intents still trigger: `paradigm_shift`, `wealth_capture`, `cultural_gap`, `cynicism_consciousness`
5. Paradigm shift trigger flow still works end-to-end (select → confirm → shift appears in History)

---

## Section 56 — Cross-System Interactions (Pass 8)

**Purpose:** Confirm the 5 new systems interact correctly with each other.

| Interaction | Expected behavior |
|---|---|
| High consequenceDeficit → faster wealthCapture.degree growth | Verify via console: high deficit → accelerationMultiplier > 1 → wealthCapture.degree lerp rate × multiplier |
| High wealthCapture.degree → lower structural ceiling | Facilitation ceiling for cooperation should decrease as wealthCapture rises |
| Low EH → propaganda backfire in media campaign | Verified in Section 48 |
| Facilitation boost → goes through deferredShift → slowed by inertia | Verify that facilitation cooperation boost appears in deferredShift, not directly in behaviorReinforcement.cooperation |
| Threshold 'deficit_critical' fires when consequenceDeficit > 75 | Set deficit artificially; verify threshold fires in Thresholds tab |
| Weakening cooperative outcomes → cynicism rise | Verified in Section 49 |

---

## Appendix E — Quick Smoke Test (Pass 8, 10-minute version)

Run these checks in order. Each should take < 1 minute.

1. **Load game** — confirm no JS errors in console  
2. **Society → Inertia tab** — renders without error; coefficient shows 0 at start  
3. **Society → Power Concentration tab** — renders; deficit = 0; multiplier = 1.00×  
4. **Paradigm → Facilitation tab** — renders; 5 measure cards visible; no measures active  
5. **Paradigm → Thresholds tab** — renders; 13 threshold cards visible; event log empty  
6. **Activate a measure** — Community Forums → Activate → appears in Active Measures  
7. **Advance 5 turns** — no console errors; check that `facilitationHistory.length >= 1`  
8. **NPC question** — ask NPC "Do old habits persist?" → verify behavioral_inertia response  
9. **Set cynicism to 75** via console → advance 1 turn → verify threshold event fires in Thresholds tab  
10. **Set consequenceDeficit.level to 80 manually** → verify multiplier > 2.0× in Power tab  
11. **PNG export** — in any tab with a chart, click PNG export; verify download  
12. **CSV export** — in Thresholds tab event log, click CSV export; verify download  

---

## Pass 9 — Cultural Homogeneity, Cross-Civilization Contagion, Track 2 Infrastructure

### Section 57 — Syntax check: all 14 modified/new files

| File | Check |
|---|---|
| config.js | `node --check` → OK |
| civilization.js | `node --check` → OK |
| game.js | `node --check` → OK |
| ui.js | `node --check` → OK |
| simulation.js | `node --check` → OK |
| chart_utils.js | `node --check` → OK |
| research_panel.js | `node --check` → OK |
| society_panel.js | `node --check` → OK |
| paradigm_panel.js | `node --check` → OK |
| npc.js | `node --check` → OK |
| main.css | Appended, no parse errors expected |
| TEST_VERIFICATION.md | This file |

### Section 58 — culturalHomogeneity founding derivation

1. Create a Theocratic civ with religion dominance > 70 → verify `civ.state.culturalHomogeneity.value` > 65
2. Create a Council Consensus + Gift Economy + low religion dominance civ → verify value < 35
3. Create any civ → verify value is between 10 and 90 (never 0 or 100 at founding)

### Section 59 — culturalHomogeneity per-turn drift

1. Set `tradeDependency = 80` on a civ → verify `culturalHomogeneity.value` decreases each turn
2. Set `governance.modelId = 'theocratic'` → verify value increases each turn
3. Force both extreme drift sources simultaneously → verify net drift never exceeds ±0.20/turn in one call
4. After 5 turns, verify `culturalHomogeneity.history` has 5 entries with correct `{turn, year, value}` shape

### Section 60 — Homogeneity effect on inertia coefficient

1. Create two otherwise-identical civs: one with `culturalHomogeneity.value = 0`, one with `value = 100`
2. Call `_processInertia` on both
3. Verify: high-homogeneity civ has inertia coefficient ~12 points higher than low-homogeneity civ

### Section 61 — Homogeneity effect on facilitation

1. Set civ `culturalHomogeneity.value = 0` (heterogeneous)
2. Compute `homoFacMod = 1.0 + (50 - 0) / 500 = 1.10` → verify `ehAmp` is multiplied by ~1.10
3. Set `culturalHomogeneity.value = 100` → homoFacMod = 0.90 → verify slightly lower ehAmp

### Section 62 — contagionState initialization

1. New civ → verify `civ.state.contagionState` exists
2. Verify `receivedInfluences: []`, `emittedInfluences: []`, `contagionHistory: []`
3. Verify `_p9CoopDelta` is NOT present on the state object (scratch prop, not in state)

### Section 63 — _processBehavioralContagion pair processing

1. Set up two civs: source `cooperation = 80`, target `cooperation = 30`
2. Set `tradeDependency = 60` on both, `attitude = +80`
3. Call `_processBehavioralContagion()` → verify positive `coopDelta` applied to target's `deferredShift.cooperation`
4. Single-civ game: verify method returns early (length < 2 guard)
5. Set `rel.war = true` → verify contagion delta is near-zero even with high trade

### Section 64 — Contagion speed factors

For identical source-target gap and identical contact rate:
1. Cooperation delta should be larger than cynicism delta (cynicismSpeedFactor = 0.55)
2. Cynicism delta should be larger than EH delta (ehSpeedFactor = 0.35)

### Section 65 — Contagion ring buffer capping

1. Run 55 turns → verify `contagionState.contagionHistory.length === 50` (capped at 50)
2. Verify `receivedInfluences.length <= 10` at all times

### Section 66 — Theocratic out-group contagion suppression

1. Civ with `theocraticEmpathyBias.active = true` and `outGroupEmpathy = 20`
2. Set attitude toward neighbor = -50
3. Call `_applyContagionPair` → verify `sourceCoop` used for contagion = `min(cooperation, 20)`, not raw cooperation

### Section 67 — researchSeed generation

1. Start a new game without providing a seed → verify `game.researchSeed` is a 10-character string
2. Start a new game with `setupData.researchSeed = 12345` → verify `game.researchSeed === '0000012345'`
3. Verify seed is stable across turns (does not change mid-game)

### Section 68 — _exportTrack2CSV structure

1. Call `simulation._exportTrack2CSV(playerCiv)` → verify download triggered (in browser)
2. Open resulting CSV → verify `## RUN_METADATA` section exists with `seed` row
3. Verify all 13 sections present: RUN_METADATA, ECONOMIC_HISTORY, EMPATHY_HISTORY, CULTURAL_GAP_HISTORY, WEALTH_CAPTURE_HISTORY, BEHAVIORAL_INERTIA_HISTORY, FACILITATION_HISTORY, COOP_OUTCOMES_HISTORY, DEFICIT_HISTORY, HOMOGENEITY_HISTORY, CONTAGION_HISTORY, THRESHOLD_EVENTS, HISTORY_EVENTS
4. Call with empty ring buffers (turn 0) → verify no crash; empty sections present

### Section 69 — Research Panel render

1. Click 🔬 Research button → verify panel opens
2. Verify Export tab displays seed and "Download Full CSV" button
3. Verify Parameters tab renders at least 20 `param-row` entries
4. Verify Contagion tab renders with "No data yet" before any turns, and chart after 10+ turns

### Section 70 — Parameters tab completeness

1. Open Parameters tab → verify all 5 FACILITATION_MEASURES appear by label
2. Verify all 13 THRESHOLD_DEFINITIONS appear (check first and last threshold labels)
3. Verify CONTAGION_CONFIG.baseRateScaling = `0.025` appears

### Section 71 — NPC intent: civ_contagion

1. Ask NPC: "What do you think about cultural contagion?" → verify intent = `civ_contagion`
2. Ask NPC: "How do spreading norms from our neighbor affect us?" → verify `civ_contagion` triggered
3. Leader NPC response should reference trade routes, cultural sovereignty, or deliberate exchange
4. Working class / disenfranchised response should differ from leader response

### Section 72 — NPC intent: cultural_homogeneity

1. Ask NPC: "How do you feel about the monoculture here?" → verify intent = `cultural_homogeneity`
2. Ask NPC: "Is there cultural diversity or just one dominant culture?" → verify `cultural_homogeneity`
3. With `culturalHomogeneity.value = 85` → response should mention conformity, uniformity, or monoculture risks
4. With `culturalHomogeneity.value = 15` → response should mention diversity, pluralism, or cultural friction

---

### Section 73 — Governance: Authoritarian World Government

1. Open setup wizard → Governance screen → verify "Authoritarian World Government" appears with correct label and description (not raw key string `gov_authoritarian_world_government_label`)
2. Select it → advance to screen 10 → verify society parameters re-derive (high inertia drivers expected from hierarchyLevel 98, powerConcentration 98)
3. Start game → open Civilization Dashboard → confirm governance model shows "Authoritarian World Government"
4. Ask NPC (leader/elite): "How did the world come under one government?" → verify `auth_world_govt` intent; response should reference order, scale, no outside, or the logic of consolidation
5. Ask NPC (marginalized): "What happened to other countries?" → verify response references loss of alternatives or absence of outside comparison
6. Ask NPC (low cooperation civ): "What do you think about living under world rule?" → verify resigned-compliance response branch fires when `b.cooperation < 35`
7. Ask NPC: "Tell me about the world empire" → verify `auth_world_govt` triggered (not `identity` or `general`)

---

## Appendix F — Pass 9 Smoke Test

Start a 3-civ game with high trade dependency (set all civs to `tradeDependency = 70`).
Advance 20 turns. Verify:

1. Each civ's `culturalHomogeneity.value` is present and has changed from initial value
2. Each civ's `culturalHomogeneity.history` has ~20 entries
3. Each civ's `contagionState.contagionHistory` has ~20 entries
4. At least one civ shows non-zero `netCoopDelta` in recent contagionHistory entries
5. Society Panel → Behavioral Inertia tab shows "Cultural Homogeneity" in the drivers table
6. Click "Research View" toggle in Behavioral Inertia tab → homogeneity chart canvas appears
7. Click 🔬 Research button → Research panel opens; Export tab shows seed; Parameters tab shows CONTAGION_CONFIG
8. Click "Download Full CSV" → file downloads with all 13 sections
9. Open Parameters tab → all 5 facilitation measures and all 13 thresholds listed
10. Open Contagion tab → chart renders; influence logs show entries after 20 turns
11. Paradigm Panel → Facilitation tab → click "Research View" → structural ceiling chart appears
12. Ask NPC "Tell me about cultural contagion" → receives contagion-themed response
13. Ask NPC "What do you think about cultural diversity here?" → receives homogeneity-themed response

---

# Appendix G — Round 12: Energy/EROI, Carrying Capacity, Infrastructure, Anomie

**Scope:** Energy systems with EROI, ecological carrying capacity/overshoot, infrastructure/maintenance debt, anomie/deaths of despair, and cross-system integration.

---

## Section 74 — Syntax Checks (Round 12)

| # | Test | Command | Expected Result | Status |
|---|------|---------|-----------------|--------|
| 74.1 | simulation.js syntax | `node --check js/simulation.js` | No output (exit 0) | |
| 74.2 | civilization.js syntax | `node --check js/civilization.js` | No output (exit 0) | |
| 74.3 | sustainability_panel.js syntax | `node --check js/sustainability_panel.js` | No output (exit 0) | |
| 74.4 | society_panel.js syntax | `node --check js/society_panel.js` | No output (exit 0) | |
| 74.5 | config.js syntax | `node --check js/config.js` | No output (exit 0) | |

---

## Section 75 — Page Load & State Initialization (Round 12)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 75.1 | Clean load | Open app, browser console (F12) | No errors in console | |
| 75.2 | Energy fields initialized | Console: `game.civs[0].state.energySource` | Returns `'wood'` | |
| 75.3 | EROI baseline | Console: `game.civs[0].state.energyEROI` | Returns `3` (wood baseline) | |
| 75.4 | Energy surplus | Console: `game.civs[0].state.energySurplus` | Returns a number (EROI - 5) | |
| 75.5 | Infrastructure init | Console: `game.civs[0].state.infrastructureLevel` | Returns number matching governance preset (e.g. ~55 for Market/Representative) | |
| 75.6 | Maintenance debt init | Console: `game.civs[0].state.maintenanceDebt` | Returns `0` | |
| 75.7 | Anomie init | Console: `game.civs[0].state.anomieLevel` | Returns `0` | |
| 75.8 | Ecological capacity | Console: `game.civs[0].state.ecologicalCapacity` | Returns a number (derived from resources) | |
| 75.9 | Overshoot ratio | Console: `game.civs[0].state.overshootRatio` | Returns a number < 1 at start | |

---

## Section 76 — Energy Tab (Sustainability Panel)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 76.1 | Energy tab exists | Open Sustainability panel | 5th tab labeled "Energy" appears | |
| 76.2 | Energy source display | Click Energy tab | Shows current energy source (e.g., "Wood") | |
| 76.3 | EROI bar | Energy tab | EROI bar visible, colored green (>20), amber (5-20), or red (<5) | |
| 76.4 | Energy surplus bar | Energy tab | Surplus bar visible; negative values shown in red | |
| 76.5 | Reference table | Energy tab | EROI reference table shows all energy sources with their EROI values | |
| 76.6 | Cross-effects list | Energy tab | List shows energy surplus constraints and transition effects | |
| 76.7 | EROI history chart | Advance 10+ turns, open Energy tab | EROI history chart renders with data points | |
| 76.8 | Energy source advances | Advance 100+ turns until Coal Power adopted | `game.civs[0].state.energySource` changes from `'wood'` to `'coal'` | |
| 76.9 | EROI increases with coal | After coal adoption | EROI jumps to ~35 range | |

---

## Section 77 — Carrying Capacity & Overshoot (Sustainability Panel)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 77.1 | Capacity section exists | Open Sustainability > Resources tab | "Ecological Capacity & Overshoot" section visible | |
| 77.2 | Capacity bar | Resources tab | Ecological Capacity bar (0-120 range) with color coding | |
| 77.3 | Demand/Capacity bar | Resources tab | Demand/Capacity ratio bar with overshoot label | |
| 77.4 | Infrastructure cross-reference | Resources tab, below overshoot | Infrastructure Level and Maintenance Debt bars visible with help text | |
| 77.5 | Overshoot warning | Set resource strategy to extraction_growth, advance 20+ turns | If overshootRatio > 1 for 10+ turns, alert message appears | |
| 77.6 | Severe overshoot alert | Continue extraction until overshootTurns > 20 && ratio > 1.5 | "Severe overshoot" alert with simplification pressure warning | |

---

## Section 78 — Infrastructure & Maintenance Debt (Society Panel)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 78.1 | Infrastructure bar | Open Society > Institutions tab | Infrastructure bar visible with value matching preset | |
| 78.2 | Maintenance debt bar | Institutions tab | Maintenance Debt bar visible (starts at 0, shows green) | |
| 78.3 | Debt annotation | Advance until debt > 30 | Infrastructure bar shows annotation "Maintenance debt: X — accelerating decay" | |
| 78.4 | Investment button | Institutions tab > Policy Actions | "Infrastructure Investment (+4 Infra, -5 Debt)" button present | |
| 78.5 | Investment effect | Click Infrastructure Investment button | Infrastructure increases, debt decreases; notification shown | |
| 78.6 | War damage | Start a war (via Events), advance turns | Infrastructure decreases, debt increases during war | |
| 78.7 | Cross-system effects | Institutions tab > Cross-System Effects | Lists infrastructure > 60 trade boost and < 25 stability erosion | |

---

## Section 79 — Anomie & Social Cohesion (Society Panel)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 79.1 | Anomie section exists | Open Society > Social Psychology tab | "Anomie & Social Cohesion" section visible (scroll down past paradigm shift controls) | |
| 79.2 | Anomie bar | Social Psychology tab | Anomie Level bar (starts at 0, green) | |
| 79.3 | Anomie help text | Social Psychology tab | Help text explains anomie, Durkheim, and drivers | |
| 79.4 | Driver list | Social Psychology tab | Anomie drivers list shows active drivers and natural recovery | |
| 79.5 | Anomie rises with paradigm shift | Trigger a governance paradigm shift | Anomie driver list shows "Active paradigm shift: +0.08/turn"; anomie climbs | |
| 79.6 | Community Resilience button | Social Psychology tab | "Community Resilience Program (-10 Anomie)" button present | |
| 79.7 | Resilience effect | Click Community Resilience button | Anomie decreases; notification shown | |
| 79.8 | Family buffer | Set family structure to 'extended' or 'community_clan' | Driver list shows "Strong family networks: -0.01/turn" | |
| 79.9 | High anomie alerts | Advance until anomie > 50 | Alert: "High anomie: lower stratum tension rising, social trust eroding" | |
| 79.10 | Severe anomie events | Advance until anomie > 70 | Occasional "Deaths of Despair Rising" history entries appear | |

---

## Section 80 — Energy Cross-Effects

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 80.1 | Innovation penalty | Console: `game.civs[0].state._energyInnovationPenalty` when surplus < 5 | Returns value < 1.0 (penalty active) | |
| 80.2 | Energy transition anomie | Console: watch `anomieLevel` before/after energy source change | Anomie spikes by +5 when source changes (e.g., wood→coal) | |
| 80.3 | EROI decline with depletion | Deplete minerals (extraction strategy) with fossil fuel source | EROI drops as mineral health declines | |

---

## Section 81 — Config Presets (Round 12)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 81.1 | Market/Representative preset | Start new game with Market/Representative | `infrastructureLevel` ≈ 55, EROI = 3 (wood) | |
| 81.2 | Barter/Tribal preset | Start new game with Barter/Tribal | `infrastructureLevel` ≈ 15 | |
| 81.3 | Gift/Flat preset | Start new game with Gift/Flat | `infrastructureLevel` ≈ 30 | |
| 81.4 | EROI in tech table | Open config.js or Energy tab reference table | Coal: 35, Oil: 60, Nuclear: 75, Renewable: 15, Fusion: 50 | |

---

## Section 82 — Snapshot Persistence (Round 12)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 82.1 | Economic snapshot fields | Console: `game.civs[0].state.economicHistory.slice(-1)[0]` | Contains `infrastructureLevel`, `maintenanceDebt`, `anomieLevel` | |
| 82.2 | Resource snapshot fields | Console: `game.civs[0].state.resourceHistory.slice(-1)[0]` | Contains `energySource`, `energyEROI`, `energySurplus`, `ecologicalCapacity`, `overshootRatio` | |
| 82.3 | Save/Load persistence | Save game, reload, load saved game | All Round 12 fields (energy, infrastructure, anomie, overshoot) retained | |

---

# Appendix H — Round 13: Tier 2 Metrics + Terrain Icon Fixes

**Scope:** Urbanization Rate, Military-Civilian Power Balance, Legitimacy Type, Food Security, Collective Trauma (with slavery integration), terrain icon fixes (mountains, wetlands).

---

## Section 83 — Syntax Checks (Round 13)

| # | Test | Command | Expected Result | Status |
|---|------|---------|-----------------|--------|
| 83.1 | simulation.js syntax | `node --check js/simulation.js` | No output (exit 0) | |
| 83.2 | civilization.js syntax | `node --check js/civilization.js` | No output (exit 0) | |
| 83.3 | society_panel.js syntax | `node --check js/society_panel.js` | No output (exit 0) | |
| 83.4 | sustainability_panel.js syntax | `node --check js/sustainability_panel.js` | No output (exit 0) | |
| 83.5 | config.js syntax | `node --check js/config.js` | No output (exit 0) | |
| 83.6 | map.js syntax | `node --check js/map.js` | No output (exit 0) | |

---

## Section 84 — State Initialization (Round 13)

Start a new game with **Market/Representative** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 84.1 | Urbanization rate | `game.civs[0].state.urbanizationRate` | ≈ 45 | |
| 84.2 | Military power | `game.civs[0].state.militaryPower` | ≈ 40 | |
| 84.3 | Civilian control | `game.civs[0].state.civilianControl` | ≈ 65 | |
| 84.4 | Legitimacy type | `game.civs[0].state.legitimacyType` | `'rational-legal'` | |
| 84.5 | Legitimacy level | `game.civs[0].state.legitimacyLevel` | ≈ 65 | |
| 84.6 | Food security | `game.civs[0].state.foodSecurity` | ≈ 70 | |
| 84.7 | Collective trauma | `game.civs[0].state.collectiveTrauma` | `0` | |

Start a new game with **Barter/Tribal** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 84.8 | Urbanization rate | `game.civs[0].state.urbanizationRate` | ≈ 5 | |
| 84.9 | Military power | `game.civs[0].state.militaryPower` | ≈ 50 | |
| 84.10 | Civilian control | `game.civs[0].state.civilianControl` | ≈ 35 | |
| 84.11 | Legitimacy type | `game.civs[0].state.legitimacyType` | `'traditional'` | |
| 84.12 | Legitimacy level | `game.civs[0].state.legitimacyLevel` | ≈ 55 | |
| 84.13 | Food security | `game.civs[0].state.foodSecurity` | ≈ 50 | |
| 84.14 | Collective trauma | `game.civs[0].state.collectiveTrauma` | `5` | |

Start a new game with **Theocratic Autocracy** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 84.15 | Urbanization rate | `game.civs[0].state.urbanizationRate` | ≈ 25 | |
| 84.16 | Military power | `game.civs[0].state.militaryPower` | ≈ 55 | |
| 84.17 | Civilian control | `game.civs[0].state.civilianControl` | ≈ 40 | |
| 84.18 | Legitimacy type | `game.civs[0].state.legitimacyType` | `'traditional'` | |
| 84.19 | Legitimacy level | `game.civs[0].state.legitimacyLevel` | ≈ 70 | |
| 84.20 | Food security | `game.civs[0].state.foodSecurity` | ≈ 55 | |
| 84.21 | Collective trauma | `game.civs[0].state.collectiveTrauma` | `10` | |

---

## Section 85 — Terrain Icon Fixes (Map)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 85.1 | Mountains visible | Start a game, zoom to map area with mountains | Brown filled triangles with dark outline visible; snow cap on mountains only | |
| 85.2 | Hills visible | Find hills terrain on map | Lighter brown triangles with dark outline, no snow cap | |
| 85.3 | Wetlands visible | Find wetlands terrain on map | Cattails icon: two green stems with brown oval heads + water ripple at base | |
| 85.4 | Zoom behavior | Zoom in and out across terrain icons | Icons scale smoothly, no erratic shadow artifacts at small zoom | |
| 85.5 | Other terrain intact | Check forests, desert, savanna, snow, ocean | All previously working terrain icons still render correctly | |

---

## Section 86 — Urbanization Rate (Demographics Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 86.1 | Section exists | Open Society > Demographics tab | "Urbanization" section visible with bar and help text | |
| 86.2 | Urbanization bar | Demographics tab | Bar shows current urbanization rate with color coding (green >50, amber 20-50, red <20) | |
| 86.3 | Driver list | Demographics tab | Lists infrastructure, technology, and economic model contributions | |
| 86.4 | Growth over time | Advance 50+ turns (Market economy) | Urbanization slowly increases with infrastructure and tech | |
| 86.5 | War decay | Start a war, advance 5 turns | Urbanization growth slows or reverses (war: -0.02/turn) | |
| 86.6 | Cross-effect: state capacity | Console: watch `stateCapacity` when urban > 50 | State capacity gains +0.005/turn boost | |
| 86.7 | Cross-effect: innovation | Console: watch innovation when urban > 60 | Innovation gains +0.01/turn agglomeration boost | |
| 86.8 | Slum alert | Force `game.civs[0].state.urbanizationRate = 85; game.civs[0].state.infrastructureLevel = 20` then advance 1 turn | Wellbeing declines (-0.02/turn from slum formation) | |

---

## Section 87 — Military-Civilian Power Balance (Institutions Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 87.1 | Bars exist | Open Society > Institutions tab | "Military-Civilian Balance" section with Military Power and Civilian Control bars | |
| 87.2 | Balance indicator | Institutions tab | Shows "Civilian-led" (green) or "Military-dominant" (red) or "Balanced" (amber) | |
| 87.3 | Military Modernization button | Institutions > Policy Actions | "Military Modernization (+8 Mil Power)" button present | |
| 87.4 | Modernization effect | Click Military Modernization | Military power increases by 8; notification shown; history entry added | |
| 87.5 | Civilian Oversight button | Policy Actions | "Civilian Oversight Reform (+8 Control)" button present | |
| 87.6 | Oversight effect | Click Civilian Oversight Reform | Civilian control increases (by 8, or 4 if state capacity < 25); notification shown | |
| 87.7 | War increases military | Start a war, advance 10 turns | `militaryPower` increases (+0.03/turn); `civilianControl` decreases (-0.005/turn) | |
| 87.8 | Democracy boosts civilian | Market/Representative, no war, advance 20 turns | `civilianControl` slowly increases (+0.005/turn from democracy) | |
| 87.9 | Cross-system effects list | Institutions > Cross-System Effects | Lists military spending fiscal pressure and civilian control IQ boost | |

---

## Section 88 — Military Coup Mechanic

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 88.1 | Coup risk alert | Force: `game.civs[0].state.militaryPower = 80; game.civs[0].state.civilianControl = 30; game.civs[0].state.stabilityIndex = 25; game.civs[0].state.foodSecurity = 20` | "COUP RISK" alert appears in Institutions tab | |
| 88.2 | Coup event fires | With above conditions, advance many turns (may take 10-30 due to 8% probability) | "Military Coup" history entry; governance shifts to autocratic; notification shown | |
| 88.3 | Post-coup state | After coup | `governance.modelId` = 'autocratic'; `civilianControl` drops to 20; `legitimacyLevel` reduced by 15; `legitimacyType` = 'charismatic'; leader name contains 'the Usurper' | |
| 88.4 | Post-coup stability | After coup | Stability temporarily increases (+10 from martial law) | |
| 88.5 | Coup trauma | After coup | `collectiveTrauma` increases by +5; `anomieLevel` increases by +5 | |

---

## Section 89 — Legitimacy Type (Institutions Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 89.1 | Legitimacy section | Institutions tab | "Legitimacy" section with type badge and level bar | |
| 89.2 | Type badge | Institutions tab | Shows "Traditional", "Charismatic", or "Rational-Legal" with color coding | |
| 89.3 | Level bar | Institutions tab | Legitimacy Level bar (0-100) with color coding | |
| 89.4 | Type description | Institutions tab | Help text describes succession dynamics for current type | |
| 89.5 | Rational-legal init | Market/Representative preset | Type = 'rational-legal', level ≈ 65 | |
| 89.6 | Traditional init | Barter/Tribal preset | Type = 'traditional', level ≈ 55 | |
| 89.7 | Legitimacy drift | Advance 50+ turns with high IQ | Legitimacy level slowly increases (+0.01/turn from IQ > 60) | |
| 89.8 | Corruption erodes | Force `game.civs[0].state.corruptionLevel = 70`, advance turns | Legitimacy level declines (-0.02/turn) | |
| 89.9 | Type evolution | Representative governance with IQ > 60, advance many turns | Type may evolve to 'rational-legal' (check history for "Legitimacy Transition" entry) | |
| 89.10 | Low legitimacy alert | Force `game.civs[0].state.legitimacyLevel = 20` | Alert: revolution risk elevated | |
| 89.11 | Succession crisis | With charismatic legitimacy, force leader change | History entry "Succession Crisis"; legitimacy drops by 20; stability drops by 10 | |

---

## Section 90 — Food Security (Sustainability Panel)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 90.1 | Section exists | Open Sustainability > Resources tab | "Food Security" section visible after overshoot section | |
| 90.2 | Food security bar | Resources tab | Bar with value and color coding (green >60, amber 30-60, red <30) | |
| 90.3 | Driver list | Resources tab | Lists soil health, water access, ag tech, trade, urbanization, and war contributions | |
| 90.4 | Healthy food security | Market/Representative, no war | Food security ≈ 70, bar is green | |
| 90.5 | War penalty | Start a war | Food security drops by ~15 points; driver list shows "War disruption: -15 pts" | |
| 90.6 | Soil depletion | Use extraction_growth strategy, advance 30+ turns | Food security declines as soil health drops | |
| 90.7 | High urbanization penalty | Force `game.civs[0].state.urbanizationRate = 80` | Food security drops; driver shows urbanization penalty | |
| 90.8 | Stability erosion | Force `game.civs[0].state.foodSecurity = 25`, advance 1 turn | `stabilityIndex` declines by 0.05 | |
| 90.9 | Famine conditions | Force `game.civs[0].state.foodSecurity = 10; game.civs[0].state._lowFoodTurns = 6`, advance turns | "Famine" history entry appears; population drops; wellbeing drops; collective trauma +15 | |
| 90.10 | Famine alert | With foodSecurity < 15 | Alert shows famine conditions active with turn count | |

---

## Section 91 — Collective Trauma (Social Psychology Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 91.1 | Section exists | Open Society > Social Psychology tab, scroll past anomie | "Collective Trauma" section visible | |
| 91.2 | Trauma bar | Social Psychology tab | Collective Trauma bar (starts at 0 for most presets, green) | |
| 91.3 | Help text | Social Psychology tab | Text explains intergenerational trauma, slow decay, sources | |
| 91.4 | Source list | Social Psychology tab | Lists active trauma sources and recovery factors | |
| 91.5 | Natural decay display | With some trauma present | Driver list shows "Natural decay: -X.XXX/turn" | |
| 91.6 | War trauma | Start a war, advance 10 turns | Trauma increases; source list shows "Active war: +0.5/turn" | |
| 91.7 | Trust ceiling alert | Force `game.civs[0].state.collectiveTrauma = 40` | Alert: "Trust ceiling: 92 (trauma limits how high social trust can grow)" | |
| 91.8 | Anomie floor alert | Force `game.civs[0].state.collectiveTrauma = 85` | Alert: "Generational despair: anomie cannot drop below 20 while trauma remains this high" | |
| 91.9 | Truth & Reconciliation button | Social Psychology tab | "Truth & Reconciliation Commission (-8 Trauma)" button present | |
| 91.10 | T&R effect | Click Truth & Reconciliation button | Trauma decreases; notification shown; if state capacity > 50, trust also increases by 2 | |
| 91.11 | T&R reduced effectiveness | With `stateCapacity < 25`, click T&R | Trauma decreases by only 4 instead of 8 | |

---

## Section 92 — Slavery → Collective Trauma Integration

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 92.1 | Slavery trauma source | Institute chattel slavery (Events > Slavery tab), advance 5 turns | `collectiveTrauma` increases; source list shows "Active slavery (prevalence X): +Y/turn" | |
| 92.2 | Slavery prevalence scaling | Compare trauma rate at prevalence 30 vs 80 | Higher prevalence → higher trauma accumulation rate | |
| 92.3 | Emancipation stops accrual | Issue emancipation decree, advance turns | Slavery source disappears from driver list; trauma stops growing from slavery | |
| 92.4 | Post-emancipation persistence | After emancipation, advance 20+ turns | Trauma decays very slowly (−0.1%/turn); effects persist for many turns | |
| 92.5 | Colonial enslavement | Start game, get colonized with enslavement type | Source list shows "Colonial enslavement: +0.8/turn"; trauma accumulates faster than voluntary slavery | |
| 92.6 | Trust ceiling from slavery trauma | After extended slavery, check trust dynamics | Trust growth capped at `100 - trauma/5`; visible in alert | |

---

## Section 93 — Cross-System Integration (Round 13)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 93.1 | Urbanization → state capacity | Console: track `stateCapacity` with urbanization > 50, advance 10 turns | State capacity increases by ~0.05 over 10 turns | |
| 93.2 | Food insecurity → anomie | Force `foodSecurity = 20`, advance turns | Anomie driver list shows "Food insecurity" if added to driver display; anomie grows faster | |
| 93.3 | Military coup → legitimacy | After coup event | Legitimacy type changes to 'charismatic'; level drops by 15 | |
| 93.4 | Collective trauma → trust ceiling | Force `collectiveTrauma = 50`, advance turns with trust near 90 | Trust cannot grow above `100 - 50/5 = 90` | |
| 93.5 | Collective trauma → innovation | Force `collectiveTrauma = 50`, track innovation | Innovation rate decreases by -0.01/turn (risk aversion) | |
| 93.6 | Collective trauma → anomie floor | Force `collectiveTrauma = 85`, force `anomieLevel = 5`, advance 1 turn | Anomie snaps to 20 (floor enforced) | |
| 93.7 | Famine → trauma | Extended food security < 15 (5+ turns) → famine event fires | Trauma increases by +15 from famine event | |

---

## Section 94 — Snapshot Persistence (Round 13)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 94.1 | Economic snapshot | Console: `game.civs[0].state.economicHistory.slice(-1)[0]` | Contains `urbanizationRate`, `militaryPower`, `civilianControl`, `legitimacyLevel`, `collectiveTrauma` | |
| 94.2 | Resource snapshot | Console: `game.civs[0].state.resourceHistory.slice(-1)[0]` | Contains `foodSecurity` | |
| 94.3 | Save/Load persistence | Save game, reload, load saved game | All Round 13 fields retained with correct values | |

---

## Section 95 — All Presets (Round 13)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 95.1 | Gift/Flat | Start new game | urban=10, milPower=10, civControl=75, legType='rational-legal', legLevel=65, food=65, trauma=0 | |
| 95.2 | Market/Representative | Start new game | urban=45, milPower=40, civControl=65, legType='rational-legal', legLevel=65, food=70, trauma=0 | |
| 95.3 | Commons/Elder Council | Start new game | urban=15, milPower=20, civControl=55, legType='traditional', legLevel=60, food=60, trauma=0 | |
| 95.4 | Theocratic Autocracy | Start new game | urban=25, milPower=55, civControl=40, legType='traditional', legLevel=70, food=55, trauma=10 | |
| 95.5 | Barter/Tribal | Start new game | urban=5, milPower=50, civControl=35, legType='traditional', legLevel=55, food=50, trauma=5 | |
| 95.6 | Labor/Cooperative | Start new game | urban=30, milPower=15, civControl=70, legType='rational-legal', legLevel=60, food=65, trauma=0 | |

---

## Appendix H Smoke Test

Start a Market/Representative game. Advance 50 turns. Verify:

1. Urbanization has slowly increased from ~45
2. Military power and civilian control have drifted based on conditions (war/peace)
3. Legitimacy level has drifted (corruption lowers, IQ raises)
4. Food security reflects current soil/water/tech conditions
5. Collective trauma is 0 or very low (no catastrophic events in peaceful sim)
6. Demographics tab shows urbanization section with bar and drivers
7. Institutions tab shows military-civilian balance bars + legitimacy badge + level bar
8. Resources tab shows food security section with bar and drivers
9. Social Psychology tab shows collective trauma section (at bottom, near 0)
10. Map shows brown mountain/hill triangles and cattails wetlands icons
11. All other existing panels and features still render correctly (no regressions)

---

# Appendix I — Round 14: Land Ownership, Caste, Lock-in, Tech Unemployment, Ethnic Fractionalization

**Scope:** Land ownership concentration, caste/rigid stratification, institutional lock-in, technological unemployment with retraining, ethnic/linguistic fractionalization with political inclusion. All with policy buttons, cross-system effects, and preset initialization.

---

## Section 96 — Syntax Checks (Round 14)

| # | Test | Command | Expected Result | Status |
|---|------|---------|-----------------|--------|
| 96.1 | simulation.js syntax | `node --check js/simulation.js` | No output (exit 0) | |
| 96.2 | civilization.js syntax | `node --check js/civilization.js` | No output (exit 0) | |
| 96.3 | society_panel.js syntax | `node --check js/society_panel.js` | No output (exit 0) | |
| 96.4 | config.js syntax | `node --check js/config.js` | No output (exit 0) | |

---

## Section 97 — State Initialization (Round 14)

Start a new game with **Market/Representative** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 97.1 | Land concentration | `game.civs[0].state.landConcentration` | ≈ 45 | |
| 97.2 | Caste rigidity | `game.civs[0].state.casteRigidity` | ≈ 12 | |
| 97.3 | Institutional lock-in | `game.civs[0].state.institutionalLockin` | ≈ 35 | |
| 97.4 | Tech unemployment | `game.civs[0].state.techUnemployment` | `0` | |
| 97.5 | Retraining capacity | `game.civs[0].state.retrainingCapacity` | ≈ 50 | |
| 97.6 | Ethnic fractionalization | `game.civs[0].state.ethnicFractionalization` | ≈ 55 | |
| 97.7 | Political inclusion | `game.civs[0].state.politicalInclusion` | ≈ 65 | |

Start a new game with **Theocratic Autocracy** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 97.8 | Land concentration | `game.civs[0].state.landConcentration` | ≈ 65 | |
| 97.9 | Caste rigidity | `game.civs[0].state.casteRigidity` | ≈ 55 | |
| 97.10 | Institutional lock-in | `game.civs[0].state.institutionalLockin` | ≈ 60 | |
| 97.11 | Tech unemployment | `game.civs[0].state.techUnemployment` | `0` | |
| 97.12 | Retraining capacity | `game.civs[0].state.retrainingCapacity` | ≈ 25 | |
| 97.13 | Ethnic fractionalization | `game.civs[0].state.ethnicFractionalization` | ≈ 40 | |
| 97.14 | Political inclusion | `game.civs[0].state.politicalInclusion` | ≈ 25 | |

Start a new game with **Labor/Cooperative** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 97.15 | Land concentration | `game.civs[0].state.landConcentration` | ≈ 15 | |
| 97.16 | Caste rigidity | `game.civs[0].state.casteRigidity` | ≈ 5 | |
| 97.17 | Institutional lock-in | `game.civs[0].state.institutionalLockin` | ≈ 15 | |
| 97.18 | Retraining capacity | `game.civs[0].state.retrainingCapacity` | ≈ 60 | |
| 97.19 | Ethnic fractionalization | `game.civs[0].state.ethnicFractionalization` | ≈ 35 | |
| 97.20 | Political inclusion | `game.civs[0].state.politicalInclusion` | ≈ 75 | |

---

## Section 98 — Land Ownership Concentration (Economy Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 98.1 | Section exists | Open Society > Economy tab | "Land Ownership Concentration" section visible | |
| 98.2 | Land concentration bar | Economy tab | Bar (0-100) with color coding (green <30, amber 30-60, red >60) | |
| 98.3 | Help text | Economy tab | Text explains land concentration, inequality spiral, and reform options | |
| 98.4 | Land Reform button | Economy tab > Policy Actions | "Land Reform (-15 Concentration)" button present | |
| 98.5 | Reform effect (high state cap) | With `stateCapacity > 50`, click Land Reform | Land concentration decreases by 15; notification shown; history entry added | |
| 98.6 | Reform effect (low state cap) | With `stateCapacity < 25`, click Land Reform | Land concentration decreases by only ~8 (reduced effectiveness); notification shown | |
| 98.7 | Concentration drift upward | Oligarchy/autocratic governance, advance 30 turns | Land concentration slowly increases | |
| 98.8 | Democratic reform drift | Representative/council governance, advance 30 turns | Land concentration slowly decreases or stays stable | |
| 98.9 | Cross-effect: mobility | Force `landConcentration = 80` | Social mobility takes a penalty (-0.01 to -0.02/turn) | |
| 98.10 | Cross-effect: food security | Force `landConcentration = 85` | Food security takes a penalty | |
| 98.11 | Cross-effect: trust | Force `landConcentration = 75`, advance turns | Social trust erodes | |

---

## Section 99 — Caste / Rigid Stratification (Economy Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 99.1 | Section exists | Open Society > Economy tab | "Caste / Rigid Stratification" section visible | |
| 99.2 | Caste rigidity bar | Economy tab | Bar (0-100) with color coding | |
| 99.3 | Help text | Economy tab | Text explains caste systems, mobility ceiling, and reform difficulty | |
| 99.4 | Driver list | Economy tab | Lists caste drivers: governance, religion dominance, tradition, and reform factors | |
| 99.5 | Caste Abolition button | Economy tab > Policy Actions | "Caste Abolition (-15 Rigidity)" button present | |
| 99.6 | Abolition effect | Click Caste Abolition | Rigidity decreases; notification shown; history entry added | |
| 99.7 | Theocratic reinforcement | With theocratic governance + high religion dominance | Caste rigidity slowly increases (+0.01 to +0.02/turn) | |
| 99.8 | Mobility ceiling | Force `casteRigidity = 80` | Social mobility capped at ~40 (cannot exceed 100 - rigidity*0.75 or similar ceiling) | |
| 99.9 | Cross-effect: inequality | High caste rigidity, advance turns | Equality index erodes | |
| 99.10 | Low rigidity = no ceiling | With `casteRigidity = 5` | Social mobility not constrained by caste | |

---

## Section 100 — Institutional Lock-in (Institutions Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 100.1 | Section exists | Open Society > Institutions tab | "Institutional Lock-in" section visible | |
| 100.2 | Lock-in bar | Institutions tab | Bar (0-100) with color coding (green <25, amber 25-55, red >55) | |
| 100.3 | Help text | Institutions tab | Text explains path dependency, institutional inertia, and reform resistance | |
| 100.4 | Lock-in increases with age | Advance 100+ turns with same governance model | `institutionalLockin` slowly increases | |
| 100.5 | Lock-in reduces after shift | Trigger governance paradigm shift | `institutionalLockin` drops significantly (by ~20-30 points) | |
| 100.6 | Cross-effect: behavioral inertia | High lock-in (>60) | Behavioral inertia coefficient receives a boost from lock-in | |
| 100.7 | Cross-effect: innovation | High lock-in (>70) | Innovation rate receives a penalty | |
| 100.8 | Cross-effect: paradigm shift resistance | High lock-in | Paradigm shift takes longer to complete (higher resistance) | |

---

## Section 101 — Technological Unemployment (Economy Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 101.1 | Section exists | Open Society > Economy tab (scroll past main economy and land) | "Technological Unemployment" section visible | |
| 101.2 | Tech unemployment bar | Economy tab | Bar (0-100) with color coding | |
| 101.3 | Help text | Economy tab | Text explains automation displacement, retraining, and social safety net | |
| 101.4 | Retraining capacity bar | Economy tab | Separate bar showing retraining capacity level | |
| 101.5 | Zero at start | All presets | `techUnemployment` = 0 at founding (pre-industrial) | |
| 101.6 | Grows with automation | Advance until `automationLevel >= 2` | Tech unemployment slowly increases | |
| 101.7 | Retraining button | Economy tab | "Worker Retraining Program" button present | |
| 101.8 | Retraining effect | Click Retraining Program | `retrainingCapacity` increases; `techUnemployment` decreases; notification shown | |
| 101.9 | Cross-effect: stability | Force `techUnemployment = 60` | Stability index declines (-0.03/turn or similar) | |
| 101.10 | Cross-effect: anomie | High tech unemployment | Anomie driver shows technology displacement contribution | |
| 101.11 | Cross-effect: wellbeing | High tech unemployment | Lower stratum wellbeing declines | |

---

## Section 102 — Ethnic/Linguistic Fractionalization (Demographics Tab)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 102.1 | Section exists | Open Society > Demographics tab | "Ethnic/Linguistic Fractionalization" section visible | |
| 102.2 | Fractionalization bar | Demographics tab | Bar (0-100) with contextual help text | |
| 102.3 | Political inclusion bar | Demographics tab | Separate bar showing political inclusion level | |
| 102.4 | Help text | Demographics tab | Text explains Wimmer framework, exclusion risk, and integration | |
| 102.5 | Inclusion Reform button | Demographics tab | "Inclusion Reform (+10 Inclusion)" button present | |
| 102.6 | Reform effect | Click Inclusion Reform | `politicalInclusion` increases by 10 (capped at 95); notification shown | |
| 102.7 | Exclusion risk | Force `ethnicFractionalization = 70; politicalInclusion = 20` | `_exclusionRisk` computed value is high (>50); stability takes large penalty | |
| 102.8 | Low risk with inclusion | Force `ethnicFractionalization = 70; politicalInclusion = 85` | `_exclusionRisk` is low (<15); stability effect minimal | |
| 102.9 | Homogeneous society | Force `ethnicFractionalization = 10` | Exclusion risk near zero regardless of inclusion level | |
| 102.10 | Cross-effect: trust | High fractionalization + low inclusion | Social trust erodes | |
| 102.11 | Cross-effect: legitimacy | High exclusion risk | Legitimacy level declines | |

---

## Section 103 — Cross-System Integration (Round 14)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 103.1 | Land + caste compound | Force `landConcentration = 75; casteRigidity = 70` | Social mobility severely constrained; equality drops faster than either alone | |
| 103.2 | Lock-in + wealth capture | Force `institutionalLockin = 70; wealthCapture.degree = 70` | Behavioral inertia coefficient very high; reform near impossible | |
| 103.3 | Tech unemployment + ethnic tension | Force `techUnemployment = 50; ethnicFractionalization = 60; politicalInclusion = 30` | Stability erosion from both sources compounds | |
| 103.4 | Land reform + caste abolition together | Click both Land Reform and Caste Abolition buttons | Both take effect; no crash; both history entries appear | |
| 103.5 | All Round 14 fields in snapshot | Console: `game.civs[0].state.economicHistory.slice(-1)[0]` | Contains `landConcentration`, `casteRigidity`, `institutionalLockin`, `techUnemployment`, `ethnicFractionalization`, `politicalInclusion` | |
| 103.6 | No NaN in Round 14 fields | Advance 30 turns | All Round 14 state fields are finite numbers; no NaN or undefined | |

---

## Section 104 — All Presets (Round 14)

| # | Test | Preset | landConc | casteRig | lockin | techUnemp | retrain | ethnicFrac | polIncl | Status |
|---|------|--------|----------|----------|--------|-----------|---------|------------|---------|--------|
| 104.1 | Gift/Flat | gift_flat | 10 | 0 | 5 | 0 | 55 | 25 | 80 | |
| 104.2 | Market/Representative | market_rep | 45 | 12 | 35 | 0 | 50 | 55 | 65 | |
| 104.3 | Commons/Elder Council | commons | 20 | 25 | 30 | 0 | 35 | 20 | 50 | |
| 104.4 | Theocratic Autocracy | theocratic | 65 | 55 | 60 | 0 | 25 | 40 | 25 | |
| 104.5 | Barter/Tribal | barter | 25 | 40 | 20 | 0 | 15 | 15 | 35 | |
| 104.6 | Labor/Cooperative | labor_coop | 15 | 5 | 15 | 0 | 60 | 35 | 75 | |

---

## Appendix I Smoke Test

Start a Theocratic Autocracy game (high caste, high land concentration). Advance 30 turns. Verify:

1. Land concentration has drifted (likely upward in autocratic governance)
2. Caste rigidity has drifted (reinforced by theocratic governance)
3. Institutional lock-in has slowly increased
4. Tech unemployment remains 0 (no automation yet in early game)
5. Ethnic fractionalization is stable (slowly drifts over time)
6. Political inclusion reflects governance model (low for autocratic)
7. Economy tab shows Land Ownership section with bar + Land Reform button
8. Economy tab shows Caste section with bar + Caste Abolition button
9. Institutions tab shows Institutional Lock-in section with bar
10. Economy tab shows Tech Unemployment section (zero at start)
11. Demographics tab shows Ethnic/Linguistic Fractionalization + Political Inclusion bars + Inclusion Reform button
12. All policy buttons work without console errors
13. Social mobility is constrained by caste ceiling (mobility < 40 with rigidity > 55)

---

# Appendix J — Round 15: Integrated Demographic-Epidemiological Transition

**Scope:** Five-stage demographic transition model, vital rates (fertility, mortality, life expectancy, infant mortality), disease burden, sanitation, age cohorts (youth/working/elderly), epidemiological profile, cohort-driven demographic profile drift, policy buttons (public health campaign, sanitation investment, vaccination program), cross-system effects.

---

## Section 105 — Syntax Checks (Round 15)

| # | Test | Command | Expected Result | Status |
|---|------|---------|-----------------|--------|
| 105.1 | config.js syntax | `node --check js/config.js` | No output (exit 0) | |
| 105.2 | civilization.js syntax | `node --check js/civilization.js` | No output (exit 0) | |
| 105.3 | simulation.js syntax | `node --check js/simulation.js` | No output (exit 0) | |
| 105.4 | society_panel.js syntax | `node --check js/society_panel.js` | No output (exit 0) | |

---

## Section 106 — State Initialization (Round 15)

All presets start at demographic transition Stage 1 with high fertility, high mortality, and low life expectancy.

Start a new game with **Market/Representative** preset.

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 106.1 | Transition stage | `game.civs[0].state.demographicTransitionStage` | `1` | |
| 106.2 | Fertility rate | `game.civs[0].state.fertilityRate` | ≈ 44 | |
| 106.3 | Mortality rate | `game.civs[0].state.mortalityRate` | ≈ 40 | |
| 106.4 | Life expectancy | `game.civs[0].state.lifeExpectancy` | ≈ 33 | |
| 106.5 | Infant mortality | `game.civs[0].state.infantMortality` | ≈ 72 | |
| 106.6 | Disease burden | `game.civs[0].state.diseaseBurden` | ≈ 58 | |
| 106.7 | Sanitation level | `game.civs[0].state.sanitationLevel` | ≈ 20 | |
| 106.8 | Youth cohort | `game.civs[0].state.youthCohort` | ≈ 40 | |
| 106.9 | Elderly cohort | `game.civs[0].state.elderlyCohort` | ≈ 5 | |

Start a new game with **Labor/Cooperative** preset (best initial sanitation).

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 106.10 | Transition stage | `game.civs[0].state.demographicTransitionStage` | `1` | |
| 106.11 | Fertility rate | `game.civs[0].state.fertilityRate` | ≈ 42 | |
| 106.12 | Mortality rate | `game.civs[0].state.mortalityRate` | ≈ 36 | |
| 106.13 | Life expectancy | `game.civs[0].state.lifeExpectancy` | ≈ 36 | |
| 106.14 | Infant mortality | `game.civs[0].state.infantMortality` | ≈ 65 | |
| 106.15 | Disease burden | `game.civs[0].state.diseaseBurden` | ≈ 50 | |
| 106.16 | Sanitation level | `game.civs[0].state.sanitationLevel` | ≈ 30 | |

Start a new game with **Barter/Tribal** preset (worst initial conditions).

| # | Test | Console Command | Expected Result | Status |
|---|------|-----------------|-----------------|--------|
| 106.17 | Transition stage | `game.civs[0].state.demographicTransitionStage` | `1` | |
| 106.18 | Fertility rate | `game.civs[0].state.fertilityRate` | ≈ 48 | |
| 106.19 | Mortality rate | `game.civs[0].state.mortalityRate` | ≈ 43 | |
| 106.20 | Life expectancy | `game.civs[0].state.lifeExpectancy` | ≈ 30 | |
| 106.21 | Infant mortality | `game.civs[0].state.infantMortality` | ≈ 80 | |
| 106.22 | Disease burden | `game.civs[0].state.diseaseBurden` | ≈ 70 | |
| 106.23 | Sanitation level | `game.civs[0].state.sanitationLevel` | ≈ 8 | |

---

## Section 107 — Demographics Tab: Demographic Transition UI

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 107.1 | Transition section exists | Open Society > Demographics tab, scroll past birth rate drivers | "Demographic Transition" section visible | |
| 107.2 | Stage badge | Demographics tab | Badge shows stage number (1-5) with icon, label, and description | |
| 107.3 | Stage 1 label | New game | Badge shows "Pre-Transition" with appropriate icon | |
| 107.4 | Vital Rates section | Demographics tab | "Vital Rates" section with 4 bars: fertility, mortality, life expectancy, infant mortality | |
| 107.5 | Fertility bar | Vital Rates | Bar (0-55 range) with value label; green <20, amber 20-35, red >35 | |
| 107.6 | Mortality bar | Vital Rates | Bar (0-55 range) with value label | |
| 107.7 | Life expectancy bar | Vital Rates | Bar (25-95 range) with value label | |
| 107.8 | Infant mortality bar | Vital Rates | Bar (0-100 range) with value label; green <15, amber 15-40, red >40 | |
| 107.9 | Net growth indicator | Vital Rates | Shows net population growth rate (fertility - mortality) with positive/negative indicator | |
| 107.10 | Age Structure section | Demographics tab | "Population Age Structure" section with youth, working age, and elderly cohort bars | |
| 107.11 | Youth cohort bar | Age Structure | Bar showing youth percentage with value | |
| 107.12 | Working age bar | Age Structure | Bar showing computed working age percentage (100 - youth - elderly) | |
| 107.13 | Elderly cohort bar | Age Structure | Bar showing elderly percentage with value | |
| 107.14 | Dependency ratio | Age Structure | Shows computed dependency ratio = (youth + elderly) / working age | |
| 107.15 | Epidemiological section | Demographics tab | "Epidemiological Profile" section with disease burden and sanitation bars | |
| 107.16 | Disease burden bar | Epidemiological | Bar (0-100) with color coding | |
| 107.17 | Sanitation bar | Epidemiological | Bar (0-100) with color coding (green >60, amber 30-60, red <30) | |
| 107.18 | Profile description | Epidemiological | Text describes current epidemiological profile (infectious_dominant, receding_pandemics, etc.) | |

---

## Section 108 — Demographics Tab: Driver Lists and Policy

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 108.1 | Fertility drivers section | Demographics tab | "Fertility Rate Drivers" section lists: infant mortality, gender equity, education, urbanization, contraception | |
| 108.2 | Mortality drivers section | Demographics tab | "Mortality Rate Drivers" section lists: sanitation, healthcare, food security, war, aging | |
| 108.3 | Policy section | Demographics tab | "Demographic Policy" section with 3 buttons | |
| 108.4 | Public Health Campaign button | Policy section | "Public Health Campaign" button present | |
| 108.5 | Sanitation Investment button | Policy section | "Sanitation Investment" button present | |
| 108.6 | Vaccination Program button | Policy section | "Vaccination Program" button present | |

---

## Section 109 — Policy Button Effects

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 109.1 | Public Health Campaign | Click Public Health Campaign button | Sanitation increases (scaled by state capacity), disease burden decreases by ~5, infant mortality decreases by ~4; notification shown | |
| 109.2 | PH Campaign low state cap | With `stateCapacity < 25`, click PH Campaign | Sanitation increase is smaller (scaled by state capacity fraction) | |
| 109.3 | Sanitation Investment | Click Sanitation Investment | Sanitation +12, infrastructure +3, disease burden -3; notification shown | |
| 109.4 | Vaccination — pre-modern | With `technologyAdoptions < 5` (no modern tech), click Vaccination | Disease burden -3, infant mortality -3; notification shown | |
| 109.5 | Vaccination — modern | With `technologyAdoptions >= 5` (modern tech), click Vaccination | Disease burden -8, infant mortality -10, mortality -3; plague mitigation +0.15; notification shown | |
| 109.6 | No crash on rapid clicks | Click all 3 buttons in quick succession | All take effect; no console errors; no duplicate notifications | |

---

## Section 110 — Demographic Transition Mechanics (Per-Turn Processing)

Use browser console for state inspection. Advance turns and observe drift.

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 110.1 | Sanitation drift | Start game, advance 50 turns | Sanitation slowly increases (driven by infrastructure, tech, state capacity) | |
| 110.2 | Disease burden drift | Advance 50 turns with improving sanitation | Disease burden slowly decreases as sanitation improves | |
| 110.3 | Infant mortality drift | Advance 50 turns | Infant mortality decreases as sanitation and healthcare improve | |
| 110.4 | Mortality rate drift | Advance 50 turns | Mortality rate decreases (driven by sanitation, healthcare, food security) | |
| 110.5 | Fertility rate lag | Advance 100+ turns | Fertility starts high, then eventually decreases AFTER mortality has already dropped (demographic lag) | |
| 110.6 | Stage 1 → 2 transition | Advance until mortality drops below 30 while fertility stays above 30 | `demographicTransitionStage` changes from 1 to 2; history entry + notification appear | |
| 110.7 | Stage 2 → 3 transition | Continue advancing until fertility drops below 30 and mortality below 20 | Stage changes to 3; history entry appears | |
| 110.8 | Life expectancy computation | Console: compare `lifeExpectancy` with mortality and disease burden | Life expectancy inversely related to mortality and disease burden | |
| 110.9 | Youth cohort drift | As fertility drops (Stage 2-3) | Youth cohort percentage slowly decreases | |
| 110.10 | Elderly cohort drift | As life expectancy rises (Stage 3-4) | Elderly cohort percentage slowly increases | |
| 110.11 | Dependency ratio computation | Console: `const s = game.civs[0].state; (s.youthCohort + s.elderlyCohort) / (100 - s.youthCohort - s.elderlyCohort)` | Matches `s._dependencyRatio` approximately | |
| 110.12 | Population growth rate | Console: `game.civs[0].state._populationGrowthRate` | Returns a number; positive when fertility > mortality, negative when fertility < mortality | |

---

## Section 111 — Stage Determination (Derived from Rates)

The demographic transition stage is DERIVED from fertility and mortality rates, not set directly. This is a core design principle.

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 111.1 | Stage 1 conditions | Force: `fertilityRate = 40; mortalityRate = 35`; advance 1 turn | Stage = 1 (fert > 35 AND mort > 30) | |
| 111.2 | Stage 2 conditions | Force: `fertilityRate = 38; mortalityRate = 25`; advance 1 turn | Stage = 2 (fert > 30 AND mort <= 30) | |
| 111.3 | Stage 3 conditions | Force: `fertilityRate = 22; mortalityRate = 15`; advance 1 turn | Stage = 3 (fert > 18 AND mort <= 20) | |
| 111.4 | Stage 4 conditions | Force: `fertilityRate = 13; mortalityRate = 10`; advance 1 turn | Stage = 4 (fert > 12 AND mort <= 14) | |
| 111.5 | Stage 5 conditions | Force: `fertilityRate = 8; mortalityRate = 11`; advance 1 turn | Stage = 5 (below-replacement fertility) | |
| 111.6 | Stage transition history | After any stage change | History panel shows "Demographic Transition: Stage X" entry | |
| 111.7 | Stage transition notification | After stage change | Notification appears indicating the transition | |

---

## Section 112 — Epidemiological Profile

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 112.1 | Infectious dominant | Force `diseaseBurden = 65`; advance 1 turn | `epidemiologicalProfile` = 'infectious_dominant' | |
| 112.2 | Receding pandemics | Force `diseaseBurden = 45`; advance 1 turn | Profile = 'receding_pandemics' | |
| 112.3 | Degenerative emerging | Force `diseaseBurden = 30`; advance 1 turn | Profile = 'degenerative_emerging' | |
| 112.4 | Chronic dominant | Force `diseaseBurden = 15`; advance 1 turn | Profile = 'chronic_dominant' | |
| 112.5 | Aging dominant | Force `diseaseBurden = 8`; advance 1 turn | Profile = 'aging_dominant' | |
| 112.6 | Profile displayed in UI | Open Demographics tab | Epidemiological Profile section shows current profile label | |

---

## Section 113 — Cohort-Driven Demographic Profile Drift

The age cohort data from the transition system now DRIVES the existing demographic profile system (young/balanced/aging/stress) via `_cohortProfilePressure`, replacing the old stochastic drift.

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 113.1 | Cohort pressure exists | Console: `game.civs[0].state._cohortProfilePressure` | Returns a string ('young', 'balanced', 'aging', or 'stress') | |
| 113.2 | High youth → young profile | Force `youthCohort = 42; elderlyCohort = 4`; advance turns | `_cohortProfilePressure` = 'young'; demographic profile drifts toward 'young' | |
| 113.3 | High elderly → aging profile | Force `youthCohort = 15; elderlyCohort = 22`; advance turns | `_cohortProfilePressure` = 'aging'; demographic profile drifts toward 'aging' | |
| 113.4 | Balanced cohorts → balanced profile | Force `youthCohort = 25; elderlyCohort = 12`; advance turns | `_cohortProfilePressure` = 'balanced' | |
| 113.5 | Extreme → stress profile | Force `youthCohort = 48; elderlyCohort = 2`; advance turns | May trigger 'stress' pressure | |
| 113.6 | Gradual transitions | Profile transitions happen one step at a time | Never skips from 'young' directly to 'aging' — must pass through 'balanced' | |
| 113.7 | Backward compatibility | Load an old save without transition fields | Stochastic demographic drift still operates as fallback | |

---

## Section 114 — Population Growth from Transition System

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 114.1 | Growth rate applied | Console: `game.civs[0].state._populationGrowthRate` | Returns a number; positive in Stage 1-2 (fert > mort) | |
| 114.2 | Population actually grows | Track `game.civs[0].state.population` over 10 turns | Population increases when fertility > mortality | |
| 114.3 | Population declines at Stage 5 | Force Stage 5 conditions (fert=8, mort=11) | Population slowly declines over turns | |
| 114.4 | Stage 2 explosion | With high fertility + declining mortality (Stage 2) | Population grows rapidly; population explosion alert may appear | |
| 114.5 | Event effects preserved | During war or famine | Population still affected by event-based effects (starvation, war casualties) in addition to demographic growth | |
| 114.6 | Old save fallback | Load save without `demographicTransitionStage` | Population growth uses original base calculation | |

---

## Section 115 — Cross-System Effects (Round 15)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 115.1 | Youth bulge instability | Force `youthCohort = 45; socialMobility = 20`; advance turns | `stabilityIndex` declines by ~0.04/turn (Urdal/Goldstone youth bulge effect) | |
| 115.2 | Disease trauma | Force `diseaseBurden = 65`; advance many turns | 10% chance per turn of `collectiveTrauma` +0.3 | |
| 115.3 | Stage transition anomie | When stage changes | `anomieLevel` increases by +3 (Durkheim: rapid social change) | |
| 115.4 | Aging fiscal strain | Force `elderlyCohort = 22`; advance turns | `stateCapacity` declines by -0.005/turn (fiscal strain from aging population) | |
| 115.5 | Population explosion alert | Stage 2 with fertility > 35 | Alert appears in Demographics tab warning of population explosion | |
| 115.6 | Population decline alert | Stage 5 | Alert appears warning of population decline / below-replacement fertility | |
| 115.7 | Youth bulge + low mobility alert | `youthCohort > 42` and `socialMobility < 30` | Alert warns of youth bulge with limited opportunity | |

---

## Section 116 — Snapshot Persistence (Round 15)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| 116.1 | Economic snapshot | Console: `game.civs[0].state.economicHistory.slice(-1)[0]` | Contains `demographicTransitionStage`, `fertilityRate`, `mortalityRate`, `lifeExpectancy`, `infantMortality`, `diseaseBurden`, `sanitationLevel`, `youthCohort`, `elderlyCohort` | |
| 116.2 | Resource snapshot | Console: `game.civs[0].state.resourceHistory.slice(-1)[0]` | Contains `diseaseBurden`, `sanitationLevel` | |
| 116.3 | Save/Load persistence | Save game, reload, load saved game | All Round 15 fields retained with correct values | |

---

## Section 117 — All Presets (Round 15)

All presets start at Stage 1. Key variations in sanitation and disease burden.

| # | Preset | stage | fert | mort | lifeExp | infantMort | disease | sanit | youth | elderly | Status |
|---|--------|-------|------|------|---------|------------|---------|-------|-------|---------|--------|
| 117.1 | Gift/Flat | 1 | 43 | 38 | 34 | 70 | 55 | 25 | 38 | 6 | |
| 117.2 | Market/Representative | 1 | 44 | 40 | 33 | 72 | 58 | 20 | 40 | 5 | |
| 117.3 | Commons/Elder Council | 1 | 42 | 37 | 35 | 68 | 52 | 22 | 37 | 7 | |
| 117.4 | Theocratic Autocracy | 1 | 46 | 42 | 31 | 78 | 65 | 12 | 42 | 4 | |
| 117.5 | Barter/Tribal | 1 | 48 | 43 | 30 | 80 | 70 | 8 | 43 | 4 | |
| 117.6 | Labor/Cooperative | 1 | 42 | 36 | 36 | 65 | 50 | 30 | 36 | 7 | |

---

## Section 118 — Console-Assisted Spot Checks (Round 15)

```js
// Round 15 state inspection helper
const s = game.civs[0].state;
const r15 = {
  demographicTransitionStage: s.demographicTransitionStage,
  fertilityRate:               s.fertilityRate,
  mortalityRate:               s.mortalityRate,
  lifeExpectancy:              s.lifeExpectancy,
  infantMortality:             s.infantMortality,
  diseaseBurden:               s.diseaseBurden,
  sanitationLevel:             s.sanitationLevel,
  youthCohort:                 s.youthCohort,
  elderlyCohort:               s.elderlyCohort,
  workingAge:                  100 - s.youthCohort - s.elderlyCohort,
  dependencyRatio:             s._dependencyRatio,
  populationGrowthRate:        s._populationGrowthRate,
  cohortProfilePressure:       s._cohortProfilePressure,
  epidemiologicalProfile:      s.epidemiologicalProfile,
};
console.table(r15);
```

| # | Expected Console Output | Status |
|---|------------------------|--------|
| 118.1 | `demographicTransitionStage` is 1-5 (integer) | |
| 118.2 | `fertilityRate` is a finite number 3-55 | |
| 118.3 | `mortalityRate` is a finite number 3-55 | |
| 118.4 | `lifeExpectancy` is a finite number 25-95 | |
| 118.5 | `infantMortality` is a finite number 0-100 | |
| 118.6 | `diseaseBurden` is a finite number 0-100 | |
| 118.7 | `sanitationLevel` is a finite number 0-100 | |
| 118.8 | `youthCohort` is a finite number 5-55 | |
| 118.9 | `elderlyCohort` is a finite number 2-40 | |
| 118.10 | `workingAge` is >= 30 | |
| 118.11 | `dependencyRatio` is a finite positive number | |
| 118.12 | `populationGrowthRate` is a finite number (positive or negative) | |
| 118.13 | `cohortProfilePressure` is 'young', 'balanced', 'aging', or 'stress' | |
| 118.14 | `epidemiologicalProfile` is a valid profile string | |
| 118.15 | None of the above values are NaN, Infinity, or undefined | |

---

## Appendix J Smoke Test

Start a Market/Representative game. Advance 50 turns. Verify:

1. Sanitation has slowly increased from ~20
2. Disease burden has slowly decreased from ~58
3. Infant mortality has decreased
4. Mortality rate has begun to decrease
5. Fertility rate still relatively high (demographic lag — fertility drops after mortality)
6. Life expectancy has increased from ~33
7. Youth cohort still high, elderly cohort still low (Stage 1-2)
8. Stage is still 1 or has transitioned to 2 (mortality dropping but fertility still high)
9. Demographics tab shows Demographic Transition badge with stage label
10. Vital Rates section shows 4 bars + net growth indicator
11. Age Structure shows 3 cohort bars + dependency ratio
12. Epidemiological Profile shows disease burden + sanitation bars + profile label
13. Fertility and Mortality driver lists are populated
14. All 3 policy buttons work: Public Health Campaign, Sanitation Investment, Vaccination Program
15. No NaN or undefined in any Round 15 state fields
16. Population is growing (fertility > mortality at Stage 1)

**Extended test (200+ turns):** With investment in education, urbanization, and gender equity:

17. Fertility eventually drops below mortality (Stage 4-5 transition)
18. Life expectancy reaches 70+ years
19. Elderly cohort rises above 15%
20. Dependency ratio shifts from youth-driven to elderly-driven
21. Epidemiological profile shifts from infectious_dominant to chronic_dominant or aging_dominant
22. Demographic profile has transitioned from 'young' to 'balanced' or 'aging' (cohort-driven, not random)

---

# Appendix K — Regression Tests (Rounds 12-15)

| # | Test | Steps | Expected Result | Status |
|---|------|-------|-----------------|--------|
| K.1 | All pre-Round 12 panels functional | Open Society, Sustainability, Paradigm, Research panels | All tabs render without errors | |
| K.2 | Round 12 Energy tab still works | Open Sustainability > Energy | Energy source, EROI bar, history chart render | |
| K.3 | Round 12 Carrying Capacity still works | Open Sustainability > Resources | Overshoot section renders | |
| K.4 | Round 12 Infrastructure still works | Open Society > Institutions | Infrastructure and maintenance debt bars render | |
| K.5 | Round 12 Anomie still works | Open Society > Social Psychology | Anomie section renders | |
| K.6 | Round 13 Urbanization still works | Open Society > Demographics | Urbanization section renders | |
| K.7 | Round 13 Military-Civilian still works | Open Society > Institutions | Military-civilian balance renders | |
| K.8 | Round 13 Legitimacy still works | Open Society > Institutions | Legitimacy badge + level bar render | |
| K.9 | Round 13 Food Security still works | Open Sustainability > Resources | Food security section renders | |
| K.10 | Round 13 Collective Trauma still works | Open Society > Social Psychology | Collective trauma section renders | |
| K.11 | Round 14 Land Ownership still works | Open Society > Economy | Land concentration section renders | |
| K.12 | Round 14 Caste still works | Open Society > Economy | Caste rigidity section renders | |
| K.13 | Round 14 Lock-in still works | Open Society > Institutions | Institutional lock-in section renders | |
| K.14 | Round 14 Tech Unemployment still works | Open Society > Economy | Tech unemployment section renders | |
| K.15 | Round 14 Ethnic Fractionalization still works | Open Society > Demographics | Ethnic/linguistic section renders | |
| K.16 | No NaN after 30 turns | Advance 30 turns, inspect all state fields | All state fields are finite; no NaN, Infinity, or undefined | |
| K.17 | NPC interviews still work | Open Interview panel, ask a question | NPC responds appropriately; no console errors | |
| K.18 | Map terrain icons intact | Inspect map | Forests, desert, savanna, snow, mountains, wetlands all render | |

---

# Appendix L — Decision Log and Future Work

## Innovation Ecosystem Decision (March 2026)

**Status:** Deferred pending historical scenario validation.

**Context:** After completing Rounds 12-15, civ-sim models approximately 71-73% of the practical ceiling for civilization dynamics. The single most visible remaining gap is an Innovation Ecosystem system (R&D feedback, technology clustering, epistemic infrastructure). Judicial Independence was also considered but determined to be adequately captured by existing systems (institutional quality, legitimacy, state capacity, rule of law effects).

**Decision:** Leave innovation ecosystem as a potential future addition. The decision depends on the results of historical scenario testing:

1. **Test first:** Run structural analogs of well-documented historical civilizations (e.g., late Roman Republic, Song Dynasty, Indus Valley, Haudenosaunee Confederacy) to see how closely the model produces structurally plausible trajectories.

2. **If results are structurally plausible:** Consider the model complete at its current scope. Innovation dynamics are partially captured by existing technology adoption, education quality, epistemic health, and urbanization agglomeration effects.

3. **If results lack structural plausibility** (especially in technology-driven transformations like the Industrial Revolution or the Song Dynasty's near-industrialization): Add innovation ecosystem as a Round 16 feature.

**What an Innovation Ecosystem system would include:**
- R&D investment rate and returns
- Technology clustering and spillover effects
- Patent/intellectual property regime effects
- Brain drain and talent migration
- Epistemic infrastructure (universities, libraries, printing/internet)
- Innovation-inequality feedback loop

**Rationale for deferral:** At 71-73% of practical ceiling, we are in the identified sweet spot (72-75%) for a simulation that balances depth with comprehensibility. Adding more systems risks pushing past the point of diminishing returns where complexity hurts more than it helps. Testing with historical scenarios is a more empirical way to determine whether the gap matters.

---

*Document updated: March 2026 | Rounds 12-15 supplements appended*
