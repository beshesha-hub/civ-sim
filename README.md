# civ-sim

A civilization simulation that models the co-evolution of economic, social, cultural, ecological, demographic, and governance systems over historical timescales. Designed both as an interactive tool and as a research platform for studying how civilizations develop, stagnate, and collapse.

## What It Does

civ-sim tracks ~130 state variables per civilization across 12 interacting domains — economy, governance, social structure, culture, ecology, demographics, technology, infrastructure, psychology, organized crime, inter-civilization relations, and public health. These systems are connected by ~250 explicit cross-system feedback loops that produce emergent behavior not programmed into any single subsystem.

The goal is **structural plausibility**: when you invest in sanitation, infant mortality falls, and decades later fertility follows. When wealth concentrates unchecked, trust erodes and institutions weaken. The causal chains match what researchers observe in the empirical record, even when the specific numbers are simplified.

Each mechanism is calibrated against specific research — the demographic transition follows Omran's epidemiological transition and Caldwell's child-survival hypothesis, wealth dynamics use multiplicative models (Bouchaud & Mezard), trust erosion follows Knack & Keefer's corruption findings, ethnic conflict uses Wimmer's political exclusion framework.

### What It Is Not

civ-sim does not predict the trajectory of specific civilizations. It models structural relationships between systems. It is not tuned for entertainment (unlike Civilization VI or Victoria 3), nor does it isolate single mechanisms (unlike academic ABMs such as Sugarscape). It occupies the space between: broad enough to capture cross-system feedback, empirically grounded enough that each mechanism reflects real findings.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

### Installation

```bash
git clone <repository-url>
cd civ-sim
npm install
```

### Running

**Browser (development):**
```bash
node server.js
```
Then open `http://localhost:3000` in your browser.

**Desktop app (Electron):**
```bash
npm start
```

### Building Executables

```bash
npm run build:mac    # macOS .dmg
npm run build:win    # Windows installer
npm run build:all    # Both platforms
```

## Running Validation

civ-sim includes a multi-level validation framework for verifying empirical grounding.

**Uncertainty Quantification (UQ)** — tests whether real-world values fall within the model's p10-p90 interval across 12 countries and 3 targets each:
```bash
node js/validation_suite.js uq --seeds=20
```

**Hindcast scenarios** — tests whether the model reproduces known historical trajectories (S. Korea 1960-2010, Chile 1970-2000, Russia 1985-2015, Rwanda 1990-2020):
```bash
node js/hindcast_runner.js --seeds=10
```

**Calibration scenarios** — 12 country configurations with benchmark expectations:
```bash
node js/scenario_test_harness.js
```

**Cross-validation and sensitivity analysis:**
```bash
node js/validation_suite.js crossval
node js/validation_suite.js sensitivity
```

### Current Validation Scores (September 2026)

| Metric | Score | Notes |
|--------|-------|-------|
| UQ Coverage | ~10-13/36 (28-36%) | 20 seeds, significant seed variance |
| Hindcast | ~27-29/38 (71-76%) | Structural plausibility checks against 4 historical trajectories |
| Robustness | ~77% | 92/120 outputs CV < 15% |

**Counterfactual diagnostics (7-country analysis):** China err=4.9 (near-perfect), Russia err=12.7 (good), Germany err=39.8 reduced to 6.1 with event injection (configurable), USA err=34.5 (structural), India err=25.4 (structural), Nigeria err=18.4 (structural), Singapore err=52.3 (structural, events help 19%).

See [MODEL_DIAGNOSTICS.md](MODEL_DIAGNOSTICS.md) for detailed findings.

### Key Features

- **Lab Mode (Counterfactual Analysis):** Snapshot, fork, and compare civilization trajectories to test "what if?" scenarios and isolate the effect of specific interventions
- **Custom Events System:** 12 presets, 20 fine-grained sliders, and structural modifiers for designing specific historical shocks and policy interventions
- **Seeded Reproducibility:** Deterministic PRNG ensures identical trajectories from identical seeds and parameters
- **Multi-level Validation:** UQ, hindcast, cross-validation, sensitivity analysis, and 7-country counterfactual diagnostics

## Project Structure

```
civ-sim/
  index.html              # Main application entry point
  main.js                 # Electron main process
  server.js               # Development server (static files + API proxy)
  js/
    simulation.js          # Core simulation engine (~17,600 lines)
    civilization.js        # Civilization state management
    config.js              # System configurations and parameters
    companion.js           # Companion demographic module
    companion_panel.js     # Companion module UI
    game.js                # Game loop and turn processing
    npc.js                 # NPC civilization behavior
    events.js              # Historical event system
    ui.js                  # Main UI framework
    setup_assistant.js     # Configuration wizard
    map.js                 # World map rendering
    research_panel.js      # Research tools (hindcast, UQ)
    society_panel.js       # Society detail panel
    paradigm_panel.js      # Economic paradigm panel
    sustainability_panel.js # Environmental tracking
    tech_panel.js          # Technology panel
    chart_utils.js         # Chart rendering utilities
    i18n.js                # Internationalization
    interview.js           # Leader interview system
    religion.js            # Religion subsystem
    utils.js               # Shared utilities
    validation_suite.js    # UQ + cross-validation + sensitivity
    hindcast_runner.js     # Hindcast scenario runner
    hindcast_scenarios.js  # Hindcast scenario definitions
    scenario_test_harness.js # Calibration scenario runner
    model_diagnostics.js   # Diagnostic analysis tools
  css/
    main.css               # Application styles
  research/                # Research source documents
  validation_results/      # Saved validation outputs (JSON)
```

## Documentation

| Document | Description |
|----------|-------------|
| [MODELING_ASSUMPTIONS.md](MODELING_ASSUMPTIONS.md) | Core assumptions, scope, and empirical grounding |
| [USER_MANUAL.md](USER_MANUAL.md) | Full reference manual |
| [QUICK_START_CASUAL.md](QUICK_START_CASUAL.md) | Getting started (game players) |
| [QUICK_START_RESEARCH.md](QUICK_START_RESEARCH.md) | Getting started (researchers) |
| [IQ_DYNAMICS_MAP.md](IQ_DYNAMICS_MAP.md) | Variable interaction schematic |
| [MODEL_DIAGNOSTICS.md](MODEL_DIAGNOSTICS.md) | Validation findings and diagnostic log |
| [HISTORICAL_SCENARIOS.md](HISTORICAL_SCENARIOS.md) | Historical scenario configurations |
| [ROADMAP.md](ROADMAP.md) | Development roadmap and status |
| [TEST_VERIFICATION.md](TEST_VERIFICATION.md) | Test verification records |

## Design Principles

1. **Follow evidence, not assumptions.** Every mechanism must have empirical or mathematical grounding. Cultural and ideological assumptions are filtered out, including those embedded in mainstream simulators.

2. **Structural plausibility over prediction.** The model should reproduce known structural relationships between systems, not predict specific outcomes for specific countries.

3. **Transparency.** All mechanisms, drift rates, and cross-effects are visible and documented. No hidden calculations.

4. **Novel paradigm support.** The simulator must be able to model novel civilizations and societies — proposed and future — not just variations on existing ones. This means no hard-coding of specific economic models, governance structures, or cultural assumptions as universal requirements.

5. **Empirically grounded relationships only.** GDP/growth is not assumed to equal wellbeing. Only relationships with empirical and mathematical support are modeled. Metrics like the Genuine Progress Indicator, inequality-adjusted measures, and direct wellbeing indicators are preferred over GDP as welfare proxies.

## Contributing

This project is in active development. If you would like to contribute, please open an issue to discuss your proposed changes before submitting a pull request.

## License

TBD — see project maintainer for licensing terms.

## Acknowledgments

Built on research from: Omran (epidemiological transition), Caldwell (child-survival hypothesis), Bouchaud & Mezard (wealth dynamics), Knack & Keefer (trust-corruption nexus), Wimmer (ethnic exclusion), Johnson/Amsden/Wade (developmental state theory), Evans & Rauch (institutional quality), Schleifer & Vishny (organized corruption), Acemoglu et al. (institutional persistence), and many others. See [MODELING_ASSUMPTIONS.md](MODELING_ASSUMPTIONS.md) for full citations.
