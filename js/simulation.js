// ============================================================
// simulation.js - Core simulation engine
// ============================================================

class SimulationEngine {
  constructor(game) {
    this.game = game;
    this.globalWarmingIndex = 0; // 0-100 (derived from temperature anomaly)
    this.globalWarmingContributors = new Map(); // civId -> contribution
    this.climateTippingPoint = false;
    this.worldEvents = []; // active world-wide events

    // DICE climate model state (Nordhaus 2017, simplified)
    this.atmosphericCO2 = 0;       // excess CO2 above pre-industrial baseline (ppm equivalent)
    this.surfaceTemp = 0;          // surface temperature anomaly (degrees C above pre-industrial)
    this.deepOceanTemp = 0;        // deep ocean temperature anomaly (degrees C)
    this._tippingPermafrost = false;
    this._tippingIceSheets = false;
    this._tippingAMOC = false;
    this._tippingHothouse = false;

    // AI civ expansion throttle
    this._expansionCooldowns = new Map();

    // Active wars: [{ attacker, defender, startYear, reason, turnsAtWar }]
    this.activeWars = [];
  }

  // ── Main Turn Processor ───────────────────────────────────────
  processTurn() {
    const { civilizations, map, currentYear, yearsDelta } = this.game;

    // 1. Process each civilization
    for (const civ of civilizations) {
      const tiles = map.getTilesForCiv(civ.id);

      // Core civ turn
      civ.processTurn(yearsDelta, tiles, civilizations);

      // Religion turn
      if (civ.religionManager) {
        civ.religionManager.processTurn(yearsDelta);
      }

      // Refresh NPC pool periodically
      if (Utils.random() < 0.15) {
        this._refreshNPCPool(civ);
      }

      // Progress multi-turn construction projects
      this._progressConstruction(civ);

      // Tick technology consequence chains
      this._techConsequencesTick(civ);

      // Apply ongoing automation effects (per-turn)
      this._applyAutomationEffects(civ);

      // Economy & Society per-turn systems
      this._processEducation(civ);
      this._processGenderEquity(civ);
      this._processInstitutions(civ);
      this._processEpistemicHealth(civ);
      this._processDemographics(civ);
      this._processFinance(civ);
      this._processSovereignDebt(civ);       // Feature 2: sovereign debt/fiscal crisis
      this._processLaborShare(civ);
      this._processDualEconomy(civ);           // Bottom-up economic restructuring
      this._processSocialTrust(civ);
      this._processStateCapacity(civ);
      this._processEnergy(civ);
      this._processCarryingCapacity(civ);
      this._processInfrastructure(civ);
      this._processAnomie(civ);
      // Round 13: Tier 2 per-turn systems
      this._processUrbanization(civ);
      this._processMilitaryCivilianBalance(civ);
      this._processLegitimacy(civ);
      this._processFoodSecurity(civ);
      this._processCollectiveTrauma(civ);
      // Round 14: Tier 3 per-turn systems
      this._processLandOwnership(civ);
      this._processCasteStratification(civ);
      this._processInstitutionalLockin(civ);
      this._processTechUnemployment(civ);
      this._processEthnicFractionalization(civ);
      this._processSocialMobility(civ);
      this._processTrade(civ);
      this._processFamilyStructure(civ);
      this._processReproductiveHealth(civ);
      this._processWomensRights(civ);
      this._processScience(civ);
      this._processSpaceProgram(civ);            // Feature 6: space program prestige
      this._processArts(civ);
      this._processHealthcare(civ);
      this._processResourceStrategy(civ);
      this._processInformationEcosystem(civ);
      this._processMediaEcosystem(civ);          // Feature 3: media/press freedom
      this._processDemographicTransition(civ);
      this._processEmpathyCascade(civ);
      // Pass 7: new processing methods (run after empathy cascade)
      this._processGenerationalDrift(civ);
      this._processGenerationalValues(civ);      // Feature 5: Inglehart post-materialism
      this._processLowestStrataTension(civ);
      this._processEmpathyReinforcementInteraction(civ);
      this._processCulturalGap(civ);
      this._processWealthCapture(civ);
      this._processTheocraticEmpathyBias(civ);
      this._processActiveParadigmShifts(civ);
      // Pass 8: new processing methods (run after paradigm shifts)
      this._processConsequenceDeficit(civ);   // must run before inertia (deficit affects capture growth)
      this._processInertia(civ);              // apply deferred behavioral shifts
      this._processFacilitation(civ);         // facilitation measures accelerate realignment
      this._processCooperativeOutcomes(civ);  // cooperative feedback loop
      this._processThresholds(civ);           // detect turning-point crossings
      // Pass 9: cultural homogeneity drift (per-civ; runs after all other per-civ systems)
      this._processCulturalHomogeneity(civ);
      this._processSchismRisk(civ);              // Feature 7: religious/ideological schism

      // Advanced systems: pandemic risk, disinformation, AI disruption
      this._processPandemicRisk(civ);
      this._processDisinformation(civ);
      this._processAIDisruption(civ);

      // Ecological systems: biodiversity and ocean health
      this._processBiodiversity(civ);
      this._processOceanHealth(civ);
      this._processNaturalDisasterRisk(civ);     // Feature 1: earthquakes, tsunamis, volcanoes
      this._processAddictionEpidemic(civ);       // Feature 4: drug/addiction epidemics

      // Balance: natural economic forces and recovery (runs last, after all degradation)
      this._processNaturalEconomicForces(civ);
      this._processStabilityRecovery(civ);
      this._processWellbeingRecovery(civ);
      this._applyResilienceDampening(civ);

      // Record economic history snapshot (for in-panel charts + Track 2 export)
      this._recordEconomicSnapshot(civ);
      // Record resource history snapshot (for Sustainability Panel)
      this._recordResourceSnapshot(civ);

      // Tick alien contact relationship score
      this._tickAlienRelationship(civ);
    }

    // 2. Global warming
    this._processGlobalWarming(yearsDelta);

    // 3. Territory expansion (AI civs)
    this._processExpansion(currentYear);

    // 4. Inter-civilization interactions
    this._processInteractions(yearsDelta);

    // 4b. Pass 9: Cross-civilization behavioral contagion
    this._processBehavioralContagion();

    // 4c. Inter-civilization migration (brain drain, refugees, economic migration)
    this._processInterCivMigration(yearsDelta);

    // 4c2. Diaspora networks (remittances, knowledge transfer, trade facilitation)
    this._processDiasporaNetworks(yearsDelta);   // Feature 8

    // 4d. Global trade network effects
    this._processTradeNetworks(yearsDelta);

    // 4e. Water/resource conflict escalation
    this._processWaterConflictEscalation(yearsDelta); // Feature 9

    // 5. War system (must run after interactions update attitudes)
    this._processActiveWars(yearsDelta, currentYear);
    this._checkWarDeclarations(currentYear);

    // 6. Era transitions
    this._checkEraTransitions();

    // 7. Generate narrative history events (includes revolution checks)
    this._generateHistoryEvents(currentYear);

    // 7b. Inter-civilization plague spread (runs after history events so
    //     newly triggered plagues are already in history before we check spread)
    for (const civ of civilizations) {
      this._tickPlagueSpread(civ, civilizations);
    }

    // 8. Technology availability check
    this._checkTechnologyUnlocks(currentYear);

    // 9. Independence movements
    this._checkIndependence(currentYear);

    // 10. Final hard floor enforcement (runs AFTER events which can push below floors)
    for (const civ of civilizations) {
      if (civ.state) {
        if (civ.state.averageWellbeing < 10) civ.state.averageWellbeing = 10;
      }
    }

    // 11. Post-catastrophe check: extinction vs survivor rebuild
    // Historical parallels for survivor rebuild:
    // - Black Death (1347-52): killed 30-60% of Europe → survivors rebuilt with higher wages, ended serfdom
    // - Bronze Age Collapse (1200 BC): destroyed all major civilizations → 300-year dark age → Iron Age emergence
    // - Toba supervolcano (74,000 BC): possible human bottleneck to 1000-10000 people → recovered
    // - Hiroshima/Nagasaki: cities rebuilt within 20 years
    // - Post-Roman Western Europe: small communities preserved knowledge, rebuilt over centuries
    for (const civ of civilizations) {
      if (!civ.state) continue;
      const pop = civ.state.population ?? 500;

      // Extinction check: population at absolute minimum for extended period
      // True extinction requires sustained inability to maintain minimum viable population
      if (pop <= 50 && (civ.state._extinctionPressureTurns ?? 0) > 20) {
        // 20+ turns (200 years) at minimum population with no recovery
        // Check if conditions are truly unrecoverable
        const food = civ.state.foodSecurity ?? 0;
        const water = civ.state.resourceDepletion?.water ?? 0;
        if (food < 10 && water < 5) {
          // True extinction: no food, no water, tiny population for 200 years
          // This is the Easter Island scenario — complete ecological collapse
          // with no possibility of recovery
          civ.state._civilizationExtinct = true;
          civ.addHistoryEntry(currentYear, '💀 Civilization Extinct',
            `${civ.name} has ceased to exist. After centuries of ecological collapse, the last survivors have perished. No food, no water, no future. This is the Easter Island endgame — a warning to all civilizations about the consequences of environmental destruction.`,
            'civilization_extinct');
          this.game.ui?.showNotification(`💀 ${civ.name}: EXTINCT — civilization has ceased to exist`, 'warning');
        }
      }

      // Track extinction pressure
      if (pop <= 50) {
        civ.state._extinctionPressureTurns = (civ.state._extinctionPressureTurns ?? 0) + 1;
      } else {
        civ.state._extinctionPressureTurns = 0;
      }

      // Survivor rebuild mechanic: when population drops dramatically from a
      // catastrophe but conditions are survivable, trigger rebuild dynamics
      // This creates the post-Black-Death / post-Bronze-Age-Collapse scenario
      if (pop <= 200 && pop > 50 && !civ.state._civilizationExtinct) {
        const food = civ.state.foodSecurity ?? 60;
        const soil = civ.state.resourceDepletion?.soil ?? 50;
        if (food > 20 && soil > 10) {
          // Conditions are survivable — small groups can rebuild
          // Post-catastrophe bonus: survivors have more resources per capita,
          // less competition, and can learn from the ruins (Black Death effect)
          // Wellbeing slowly recovers as survivors adapt
          if ((civ.state.averageWellbeing ?? 50) < 30) {
            civ.state.averageWellbeing = Utils.clamp(
              (civ.state.averageWellbeing ?? 10) + 0.5, 0, 100);
          }
          // Reduced wealth concentration (old elites gone)
          if (civ.economic && (civ.economic.wealthConcentration ?? 50) > 30) {
            civ.economic.wealthConcentration = Utils.clamp(
              civ.economic.wealthConcentration - 0.3, 0, 93);
          }
        }
      }
    }
  }

  // ── Global Warming — Simplified DICE IAM ──────────────────────
  // Nordhaus 2017 Dynamic Integrated Climate-Economy model, simplified
  // Pipeline: emissions → CO2 concentration → radiative forcing → temperature → damages
  // Two-box thermal model: fast surface response + slow deep ocean lag
  _processGlobalWarming(yearsDelta) {
    const { civilizations, currentYear } = this.game;

    // Only meaningful in industrial era+
    if (currentYear < 1700) return;

    const timeScale = yearsDelta / 10;

    // ── 1. EMISSIONS (from per-civ energy system contributions) ──
    let totalEmissions = 0;
    for (const civ of civilizations) {
      const contrib = civ.state.globalWarmingContribution;
      this.globalWarmingContributors.set(civ.id, contrib);
      totalEmissions += contrib;
    }

    // ── 2. ATMOSPHERIC CO2 CONCENTRATION ─────────────────────────
    // Simplified carbon cycle: ~50% airborne fraction (IPCC AR5 Ch6)
    // Natural sinks absorb ~1.5%/decade of excess CO2 (ocean + biosphere)
    const emissionFlux = totalEmissions * 0.5 * timeScale;
    const naturalSink = this.atmosphericCO2 * 0.015 * timeScale;
    this.atmosphericCO2 = Math.max(0, this.atmosphericCO2 + emissionFlux - naturalSink);

    // Cooperative mitigation: carbon capture analog (post-2000, high cooperation)
    const avgCooperation = this._getWorldAverageCooperation();
    if (avgCooperation > 70 && currentYear > 2000) {
      this.atmosphericCO2 = Math.max(0, this.atmosphericCO2 - 0.5 * timeScale);
    }

    // ── 3. RADIATIVE FORCING (IPCC: F = 5.35 * ln(C/C0)) ────────
    // Pre-industrial baseline: 280 ppm; each unit of atmosphericCO2 ≈ 1 ppm
    const co2Concentration = 280 + this.atmosphericCO2;
    const forcing = 5.35 * Math.log(co2Concentration / 280); // W/m²

    // ── 4. TEMPERATURE RESPONSE — Two-Box Model ─────────────────
    // Surface responds to equilibrium with ~decade lag; deep ocean multi-century
    // ECS = 3.0°C per CO2 doubling (IPCC AR6 central), ΔF₂ₓ = 3.7 W/m²
    const climateSensitivity = 3.0;
    const equilibriumTemp = (forcing / 3.7) * climateSensitivity;

    // Surface: ~25%/decade adjustment toward equilibrium, minus ocean coupling
    const surfaceLag = 0.25 * timeScale;
    const oceanCoupling = 0.05 * timeScale;
    this.surfaceTemp += (equilibriumTemp - this.surfaceTemp) * surfaceLag
                      - (this.surfaceTemp - this.deepOceanTemp) * oceanCoupling;

    // Deep ocean: ~2%/decade toward surface (very slow thermal inertia)
    const deepLag = 0.02 * timeScale;
    this.deepOceanTemp += (this.surfaceTemp - this.deepOceanTemp) * deepLag;

    // Prevent negative temperatures in edge cases
    this.surfaceTemp = Math.max(0, this.surfaceTemp);
    this.deepOceanTemp = Math.max(0, this.deepOceanTemp);

    // ── 5. MAP TO GLOBAL WARMING INDEX (0-100) ──────────────────
    // 0°C anomaly → 0, 8°C anomaly → 100
    const tempAnomaly = this.surfaceTemp;
    this.globalWarmingIndex = Utils.clamp(tempAnomaly * 12.5, 0, 100);

    // Apply to map
    this.game.map.applyGlobalWarming(this.globalWarmingIndex);

    // ── 6. TIPPING POINTS (IPCC AR6 + Lenton et al. 2019) ───────
    // Progressive tipping cascades at different temperature thresholds
    if (tempAnomaly > 1.5 && !this._tippingPermafrost) {
      this._tippingPermafrost = true;
      this.atmosphericCO2 += 5; // methane feedback
      this._triggerTippingPoint('Permafrost Thaw Begins',
        'Permafrost regions begin releasing stored methane and CO2. A self-reinforcing feedback loop accelerates warming beyond human control.',
        currentYear);
    }
    if (tempAnomaly > 2.0 && !this._tippingIceSheets) {
      this._tippingIceSheets = true;
      this.atmosphericCO2 += 3; // albedo feedback
      this._triggerTippingPoint('Ice Sheet Destabilization',
        'Greenland and West Antarctic ice sheets begin irreversible decline. Sea levels committed to multi-meter rise over centuries, threatening all coastal civilization.',
        currentYear);
    }
    if (tempAnomaly > 3.5 && !this._tippingAMOC) {
      this._tippingAMOC = true;
      this._triggerTippingPoint('Atlantic Circulation Collapse',
        'The Atlantic Meridional Overturning Circulation (AMOC) has weakened critically. European and West African climates disrupted; monsoon patterns shifting.',
        currentYear);
    }
    if (tempAnomaly > 5.0 && !this._tippingHothouse) {
      this._tippingHothouse = true;
      this.atmosphericCO2 += 15; // cascading feedbacks (methane clathrates, forest die-off, etc.)
      this._triggerTippingPoint('Hothouse Earth Threshold',
        'Cascading tipping points have pushed the climate into a self-reinforcing hothouse state. Large regions are becoming uninhabitable. Civilization faces existential threat.',
        currentYear);
    }

    // Legacy compatibility: original single tipping point
    if (this.globalWarmingIndex > 70 && !this.climateTippingPoint) {
      this.climateTippingPoint = true;
      this._triggerClimateCrisis();
    }

    // ── 7. DAMAGE FUNCTION — Nordhaus Quadratic ─────────────────
    // D(T) = α·T² where α ≈ 0.00236 (Nordhaus 2017 DICE calibration)
    // At 2°C: ~0.9% GDP loss, 3°C: ~2.1%, 4°C: ~3.8%, 6°C: ~8.5%
    if (tempAnomaly > 0.5) {
      const damageCoeff = 0.00236;
      const damageFrac = damageCoeff * tempAnomaly * tempAnomaly;

      for (const civ of civilizations) {
        // Wellbeing impact: scaled so 2°C≈-0.4/turn, 4°C≈-1.4/turn, 6°C≈-3.4/turn
        let wellbeingImpact = -damageFrac * 40 * timeScale;

        // Coastal vulnerability (sea level rise + storm surge)
        const tiles = this.game.map.getTilesForCiv(civ.id);
        const coastalTiles = tiles.filter(t => t.terrain.id === 'coastal').length;
        const coastalRatio = tiles.length > 0 ? coastalTiles / tiles.length : 0;
        wellbeingImpact *= (1 + coastalRatio * 0.8);

        // Social cohesion enables collective adaptation to climate stress
        // NOT governance-dependent: high-trust societies adapt better regardless of model
        // Real-world: Japan (high trust, rapid disaster response), Cuba (strong community
        // networks, effective hurricane prep despite authoritarian governance)
        const cohesion = civ.state.socialCohesion ?? 50;
        if (cohesion > 60) wellbeingImpact *= 0.7 + (100 - cohesion) / 100 * 0.3;

        // State capacity enables adaptation infrastructure
        const stateCap = civ.state.stateCapacity ?? 50;
        wellbeingImpact *= (1.3 - stateCap / 100 * 0.6); // range: 0.7x to 1.3x

        civ.state.averageWellbeing = Utils.clamp(
          civ.state.averageWellbeing + wellbeingImpact, 0, 100);

        // Food security: agriculture disrupted above 1.5°C (IPCC SRCCL)
        if (tempAnomaly > 1.5) {
          const foodImpact = -damageFrac * 25 * timeScale;
          civ.state.foodSecurity = Utils.clamp(
            (civ.state.foodSecurity ?? 60) + foodImpact, 0, 100);
        }

        // Stability: climate refugees + resource conflicts above 3°C
        if (tempAnomaly > 3.0) {
          civ.state.stabilityIndex = Utils.clamp(
            (civ.state.stabilityIndex ?? 70) - damageFrac * 15 * timeScale, 0, 100);
        }

        // ── Extreme Weather Events (stochastic, frequency increases with warming) ──
        // IPCC AR6: frequency of extreme events increases non-linearly with temperature
        // At 1.5°C: 2x more frequent heat waves; at 2°C: 5.6x; at 4°C: 9.4x
        // Includes: hurricanes/cyclones, heat waves, severe droughts, flooding
        // 2024-2025 reality: LA wildfires, Australian bushfires, European heat domes,
        // Hurricane Helene/Milton, Pakistan floods, East Africa drought
        const extremeProb = Math.min(0.25, 0.02 * tempAnomaly * tempAnomaly);
        const recentExtreme = civ.history?.slice(-5).some(h => h.type === 'extreme_weather');
        if (!recentExtreme && Utils.random() < extremeProb * timeScale) {
          // Random extreme event type
          const eventTypes = [
            { name: 'Catastrophic Flooding', desc: 'Unprecedented rainfall and flooding', foodHit: -4, popHit: 0.998, infraHit: -3 },
            { name: 'Extreme Heat Wave', desc: 'Record-breaking temperatures cause mass casualties, crop failure, and infrastructure strain', foodHit: -5, popHit: 0.997, infraHit: -1 },
            { name: 'Severe Drought', desc: 'Multi-year drought depletes water reserves and devastates agriculture', foodHit: -6, popHit: 0.999, infraHit: 0 },
            { name: 'Mega-Hurricane', desc: 'Category 5+ storm causes catastrophic coastal destruction', foodHit: -3, popHit: 0.996, infraHit: -5 },
          ];
          const evt = eventTypes[Math.floor(Utils.random() * eventTypes.length)];
          civ.state.foodSecurity = Utils.clamp((civ.state.foodSecurity ?? 60) + evt.foodHit, 0, 100);
          civ.state.population = Math.max(50, Math.floor(civ.state.population * evt.popHit));
          civ.state.infrastructureLevel = Utils.clamp(
            (civ.state.infrastructureLevel ?? 50) + evt.infraHit, 0, 100);
          civ.state.averageWellbeing = Utils.clamp(
            (civ.state.averageWellbeing ?? 50) - 3, 0, 100);
          civ.state.collectiveTrauma = Utils.clamp(
            (civ.state.collectiveTrauma ?? 0) + 1, 0, 100);
          civ.addHistoryEntry(currentYear, `🌪️ ${evt.name}`,
            `${evt.desc}. Climate change has made events like this ${tempAnomaly > 2 ? 'dramatically' : 'significantly'} more frequent and severe.`,
            'extreme_weather');
        }

        // ── Wildfires (temperature + drought + forest condition) ──
        // Australia 2019-20 Black Summer: 46M acres burned, 1B animals killed
        // California/Oregon/Washington: annual megafires now routine
        // Amazon: deforestation + drought → fire feedback loop
        // Mediterranean: Greece, Turkey, Spain fires intensifying
        const forests = civ.state.resourceDepletion?.forests ?? 100;
        const waterHealth = civ.state.resourceDepletion?.water ?? 100;
        if (forests > 10 && tempAnomaly > 1.0) {
          // Fire probability increases with temperature AND drought (low water)
          const droughtFactor = Math.max(0.5, (100 - waterHealth) / 100);
          const fireProb = Math.min(0.15, 0.01 * tempAnomaly * droughtFactor * 2);
          const recentFire = civ.history?.slice(-8).some(h => h.type === 'wildfire');
          if (!recentFire && Utils.random() < fireProb * timeScale) {
            // Fire destroys forest cover and creates pollution
            const forestLoss = Math.min(forests * 0.15, 12); // up to 15% of remaining forest
            civ.state.resourceDepletion.forests = Utils.clamp(forests - forestLoss, 0, 100);
            civ.state.pollutionIndex = Utils.clamp(
              (civ.state.pollutionIndex ?? 0) + 5, 0, 100); // smoke pollution
            civ.state.biodiversityIndex = Utils.clamp(
              (civ.state.biodiversityIndex ?? 80) - 3, 5, 100); // habitat destruction
            civ.state.averageWellbeing = Utils.clamp(
              (civ.state.averageWellbeing ?? 50) - 2, 0, 100);
            civ.addHistoryEntry(currentYear, '🔥 Megafire',
              `Massive wildfires burn across ${civ.name}. ${Math.round(forestLoss)} points of forest cover destroyed. Smoke blankets cities. Wildlife displaced. Climate change and ${waterHealth < 50 ? 'severe drought' : 'dry conditions'} fueled the catastrophe.`,
              'wildfire');
          }
        }

        // ── Ongoing Sea Level Rise (after ice sheet tipping point) ──
        // IPCC: 0.3-1.0m by 2100 at current trajectory; 2-5m by 2300 if ice sheets collapse
        // Affects coastal cities, agriculture (salt intrusion), infrastructure
        if (this._tippingIceSheets && coastalRatio > 0) {
          // Ongoing coastal erosion and salt intrusion once ice sheets are in decline
          const slrDamage = coastalRatio * 0.5 * timeScale;
          civ.state.foodSecurity = Utils.clamp(
            (civ.state.foodSecurity ?? 60) - slrDamage, 0, 100);
          civ.state.infrastructureLevel = Utils.clamp(
            (civ.state.infrastructureLevel ?? 50) - slrDamage * 0.5, 0, 100);
        }

        // ── Glacier/Ice Cap Melt → Water Supply (mountain communities) ──
        // 2B people depend on glacial meltwater. Once glaciers gone, rivers dry up seasonally.
        // Hindu Kush-Himalaya, Andes, Alps, Rockies all losing glacial mass.
        if (tempAnomaly > 2.0) {
          // Glacial melt initially INCREASES water (flush), then DECREASES (gone)
          // At 2-3°C: slight water increase from accelerated melt
          // Above 3°C: glaciers mostly gone → seasonal water crisis
          if (tempAnomaly > 3.5 && civ.state.resourceDepletion) {
            const glacialLoss = 0.2 * ((tempAnomaly - 3.5) / 3) * timeScale;
            civ.state.resourceDepletion.water = Utils.clamp(
              (civ.state.resourceDepletion.water ?? 100) - glacialLoss, 0, 100);
          }
        }
      }
    }
  }

  _getWorldAverageCooperation() {
    const civs = this.game.civilizations;
    if (civs.length === 0) return 50;
    const sum = civs.reduce((s, c) => s + (c.state.behaviorReinforcement.cooperation || 50), 0);
    return sum / civs.length;
  }

  _triggerClimateCrisis() {
    for (const civ of this.game.civilizations) {
      civ.addHistoryEntry(
        this.game.currentYear,
        'Climate Tipping Point Reached',
        'The accumulation of greenhouse gases has pushed the climate beyond a critical threshold. Effects are now self-reinforcing.',
        'crisis'
      );
    }
    if (this.game.onWorldEvent) {
      this.game.onWorldEvent({
        type: 'climate_crisis',
        title: 'Climate Tipping Point',
        description: 'Global temperatures have passed a critical threshold. Climate effects are now accelerating regardless of immediate action.',
        year: this.game.currentYear,
      });
    }
  }

  _triggerTippingPoint(title, description, year) {
    // DICE/IPCC tipping point event — affects all civilizations
    for (const civ of this.game.civilizations) {
      civ.addHistoryEntry(year, `🌡️ ${title}`, description, 'crisis');
    }
    if (this.game.onWorldEvent) {
      this.game.onWorldEvent({
        type: 'climate_tipping_point',
        title: title,
        description: description,
        year: year,
      });
    }
    this.game.ui?.showNotification(`🌡️ Climate Tipping Point: ${title}`, 'info');
  }

  // ── Territory Expansion ───────────────────────────────────────
  _processExpansion(currentYear) {
    // ══════════════════════════════════════════════════════════════════════
    // TURCHIN META-ETHNIC FRONTIER THEORY (2003, 2006)
    // Asabiya (group solidarity/cohesion) is highest at meta-ethnic frontiers
    // — where civilizations with very different cultures meet. This solidarity
    // drives military effectiveness and territorial expansion.
    //
    // Key dynamics:
    //   1. Frontier effect: proximity to rival civilizations builds asabiya
    //   2. Imperial overstretch: large empires lose cohesion (Ibn Khaldun)
    //   3. Demographic pressure: population density drives expansion need
    //   4. State capacity: organized states expand more effectively
    // ══════════════════════════════════════════════════════════════════════
    for (const civ of this.game.civilizations) {
      const cooldown = this._expansionCooldowns.get(civ.id) || 0;
      if (cooldown > 0) {
        this._expansionCooldowns.set(civ.id, cooldown - 1);
        continue;
      }

      const territory = this.game.map.getTilesForCiv(civ.id);
      const population = civ.state.population;

      // ── 1. Demographic pressure (population density) ───────────
      const densityThreshold = territory.length * 50;
      const populationPressure = population > densityThreshold;

      // ── 2. Asabiya: group cohesion (Turchin) ──────────────────
      // High stability + legitimacy + social trust = high asabiya
      const stability = civ.state.stabilityIndex ?? 50;
      const legitimacy = civ.state.legitimacyLevel ?? 50;
      const trust = civ.state.socialTrust ?? 50;
      const asabiya = (stability * 0.35 + legitimacy * 0.35 + trust * 0.3);

      // ── 3. Frontier effect (meta-ethnic contact) ──────────────
      // Proximity to rival civilizations with different governance builds solidarity
      let frontierBonus = 0;
      for (const [otherId, rel] of (civ.relations || new Map())) {
        if (rel.attitude < -20) frontierBonus += 0.3; // hostile neighbor
        if (rel.attitude < -50) frontierBonus += 0.2; // very hostile
      }
      frontierBonus = Math.min(frontierBonus, 1.5);

      // ── 4. Imperial overstretch (Ibn Khaldun decay) ───────────
      // Large territory relative to state capacity → harder to hold/expand
      const stateCap = civ.state.stateCapacity ?? 50;
      const overstretch = territory.length > 0 ? territory.length / (stateCap / 5 + 1) : 0;
      const overstetchPenalty = overstretch > 5 ? (overstretch - 5) * 0.2 : 0;

      // ── 5. Expansion decision ─────────────────────────────────
      const shouldExpand = populationPressure && asabiya > 35;
      if (shouldExpand) {
        // Expansion magnitude: asabiya + frontier - overstretch
        const expansionStrength = (asabiya / 100 + frontierBonus - overstetchPenalty);
        const expandBy = Math.max(1, Math.min(5, Math.round(expansionStrength * 2)));

        this.game.map.expandCiv(civ.id, expandBy);

        // Expansionist civilizations get additional expansion
        if (civ.operatingPrinciples.outsiderRelationship === 'expansionist') {
          this.game.map.expandCiv(civ.id, Math.ceil(expandBy * 0.5));
        }

        // Cooldown: high state capacity → faster recovery
        const cooldownTurns = stateCap > 60 ? 1 : 2;
        this._expansionCooldowns.set(civ.id, cooldownTurns);
      }
    }
  }

  // ── Inter-Civilization Interactions ───────────────────────────
  _processInteractions(yearsDelta) {
    const civs = this.game.civilizations;

    for (let i = 0; i < civs.length; i++) {
      for (let j = i + 1; j < civs.length; j++) {
        const c1 = civs[i], c2 = civs[j];
        this._processRelationship(c1, c2, yearsDelta);
        this._maybeProposeTreaty(c1, c2);
      }
    }

    // ── Cross-Civ Shadow Government Influence ─────────────────────────
    // Complicit shadow gov exerts corruption pressure on other civs
    // Covert shadow gov exerts subtle conformity pressure on other civs
    for (const sourceCiv of civs) {
      const srcGovId = sourceCiv.governance?.modelId;
      if (srcGovId !== 'shadow_government_complicit' && srcGovId !== 'shadow_government_covert') continue;

      for (const targetCiv of civs) {
        if (targetCiv.id === sourceCiv.id) continue;

        if (srcGovId === 'shadow_government_complicit') {
          // Complicit: corruption bleeds outward
          targetCiv.governance.corruptionLevel = Utils.clamp(
            (targetCiv.governance.corruptionLevel || 0) + 0.06 * yearsDelta, 0, 100
          );
        } else {
          // Covert: conformity pressure bleeds outward (manufactured culture, shaped information)
          const br = targetCiv.state?.behaviorReinforcement;
          if (br) {
            br.conformity = Utils.clamp((br.conformity || 50) + 0.03 * yearsDelta, 0, 100);
          }
        }
      }
    }

    // ── World Federation Attitude Drift ───────────────────────────────
    // World federation civs radiate goodwill to all other civs
    for (const fedCiv of civs) {
      if (fedCiv.governance?.modelId !== 'world_federation') continue;
      for (const otherCiv of civs) {
        if (otherCiv.id === fedCiv.id) continue;
        const rel = fedCiv.relations.get(otherCiv.id);
        const relOther = otherCiv.relations.get(fedCiv.id);
        if (rel)      rel.attitude      = Utils.clamp(rel.attitude      + 0.5 * yearsDelta, -100, 100);
        if (relOther) relOther.attitude = Utils.clamp(relOther.attitude  + 0.5 * yearsDelta, -100, 100);
      }
    }

    // ── Cultural Soft Power ─────────────────────────────────────────
    // Civs with high education, freedom, wellbeing, and cultural output
    // project cultural influence on others (Hollywood, K-pop, BBC, Bollywood).
    // Nye (2004): soft power = attraction rather than coercion.
    // Effects: improves attitudes, accelerates behavioral contagion rate,
    // spreads cultural values (freedom, education norms).
    for (const sourceCiv of civs) {
      if (!sourceCiv.state) continue;
      const educS = sourceCiv.state.educationQuality ?? 50;
      const freedomS = sourceCiv.operatingPrinciples?.freedomLevel ?? 50;
      const wbS = sourceCiv.state.averageWellbeing ?? 50;
      const artsS = sourceCiv.state.artsFreedom ?? 50;
      // Soft power index: education + freedom + wellbeing + arts freedom
      const softPower = (educS + freedomS + wbS + artsS) / 4;
      if (softPower < 60) continue; // Below threshold: not enough to project

      for (const targetCiv of civs) {
        if (targetCiv.id === sourceCiv.id || !targetCiv.state) continue;
        const rel = targetCiv.relations?.get(sourceCiv.id);
        if (!rel) continue;
        // Soft power improves attitude toward the projecting civ
        const softInfluence = (softPower - 60) / 40 * 0.3 * (yearsDelta / 10);
        rel.attitude = Utils.clamp(rel.attitude + softInfluence, -100, 100);
        // Also: target civ's education and freedom get a small pull toward source
        if (softPower > 70 && (targetCiv.state.educationQuality ?? 50) < educS) {
          targetCiv.state.educationQuality = Utils.clamp(
            (targetCiv.state.educationQuality ?? 50) + 0.05 * (yearsDelta / 10), 0, 100);
        }
      }
    }

    // ── Pirate Network Diplomatic Pressure ────────────────────────────
    // Piracy from one civ erodes attitudes from civs that have trade agreements with it
    for (const pirateCiv of civs) {
      if (pirateCiv.organizedCrime?.type !== 'pirate_network') continue;
      const pirateLevel = pirateCiv.organizedCrime.level;
      for (const otherCiv of civs) {
        if (otherCiv.id === pirateCiv.id) continue;
        const rel = otherCiv.relations.get(pirateCiv.id);
        if (rel?.trade || rel?.treaty?.type === 'trade_agreement' || rel?.treaty?.type === 'alliance') {
          rel.attitude = Utils.clamp(rel.attitude - 0.5 * (pirateLevel / 50) * yearsDelta, -100, 100);
        }
      }
    }

    // ── Slavery Diplomatic Pressure ───────────────────────────────────
    // High-empathy civs react negatively to civs that practice slavery
    for (const slaveryCiv of civs) {
      if (!slaveryCiv.slavery?.active) continue;
      for (const otherCiv of civs) {
        if (otherCiv.id === slaveryCiv.id) continue;
        if (otherCiv.state.empathyLevel > 65) {
          const relToSlaver = otherCiv.relations.get(slaveryCiv.id);
          if (relToSlaver) {
            relToSlaver.attitude = Utils.clamp(relToSlaver.attitude - 0.3 * yearsDelta, -100, 100);
          }
        }
      }
    }
  }

  /**
   * AI-driven treaty proposals: non-player civs may offer or accept treaties
   * when attitude conditions are met and no treaty is already active.
   */
  _maybeProposeTreaty(c1, c2) {
    // Only apply when at least one side is AI-controlled (not the player civ)
    const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
    const c1IsPlayer = c1.id === playerCiv?.id;
    const c2IsPlayer = c2.id === playerCiv?.id;
    // If both are player-controlled or either is in a war, skip
    if (c1IsPlayer && c2IsPlayer) return;

    const rel1 = c1.relations.get(c2.id);
    const rel2 = c2.relations.get(c1.id);
    if (!rel1 || !rel2) return;
    if (rel1.war || rel2.war) return;
    if (rel1.treaty) return; // already have a treaty

    const avgAtt = (rel1.attitude + rel2.attitude) / 2;

    // Determine highest treaty type eligible
    let targetType = null;
    if (avgAtt >= 60 && Utils.random() < 0.02) targetType = 'alliance';
    else if (avgAtt >= 35 && Utils.random() < 0.025) targetType = 'trade_agreement';
    else if (avgAtt >= 5  && Utils.random() < 0.018) targetType = 'non_aggression';

    if (!targetType) return;

    // If the player civ is involved, show a notification and offer a choice rather than auto-signing
    if (c1IsPlayer || c2IsPlayer) {
      const aiCiv   = c1IsPlayer ? c2 : c1;
      const def = SimulationEngine.TREATY_DEFS[targetType];
      // Mark a pending offer on the relation so the UI can show it
      rel1.pendingOffer = { type: targetType, fromId: aiCiv.id };
      rel2.pendingOffer = { type: targetType, fromId: aiCiv.id };
      this.game.ui?.showNotification(`🤝 ${aiCiv.name} is proposing a ${def.label}. Check Diplomacy panel.`);
    } else {
      // Both AI: auto-sign
      this.proposeTreaty(c1.id, c2.id, targetType);
    }
  }

  _processRelationship(c1, c2, yearsDelta) {
    if (!c1.relations.has(c2.id)) {
      c1.relations.set(c2.id, { attitude: 40, trade: false, war: false, treaty: null, name: c2.name });
    }
    if (!c2.relations.has(c1.id)) {
      c2.relations.set(c1.id, { attitude: 40, trade: false, war: false, treaty: null, name: c1.name });
    }

    const rel1 = c1.relations.get(c2.id);
    const rel2 = c2.relations.get(c1.id);

    // Ensure name fields stay current
    rel1.name = c2.name;
    rel2.name = c1.name;

    // Migrate old saves that lack treaty field
    if (rel1.treaty === undefined) rel1.treaty = null;
    if (rel2.treaty === undefined) rel2.treaty = null;

    // ── Treaty effects & expiry ─────────────────────────────────
    if (rel1.treaty) {
      const treaty = rel1.treaty;
      if (treaty.type === 'non_aggression') {
        rel1.attitude = Utils.clamp(rel1.attitude + 0.3, -100, 100);
        rel2.attitude = Utils.clamp(rel2.attitude + 0.3, -100, 100);
      } else if (treaty.type === 'trade_agreement') {
        rel1.attitude = Utils.clamp(rel1.attitude + 0.4, -100, 100);
        rel2.attitude = Utils.clamp(rel2.attitude + 0.4, -100, 100);
        c1.state.resourceStores.knowledge = (c1.state.resourceStores.knowledge || 0) + 0.3;
        c2.state.resourceStores.knowledge = (c2.state.resourceStores.knowledge || 0) + 0.3;
      } else if (treaty.type === 'alliance') {
        rel1.attitude = Utils.clamp(rel1.attitude + 0.8, -100, 100);
        rel2.attitude = Utils.clamp(rel2.attitude + 0.8, -100, 100);
        c1.state.resourceStores.knowledge = (c1.state.resourceStores.knowledge || 0) + 0.3;
        c2.state.resourceStores.knowledge = (c2.state.resourceStores.knowledge || 0) + 0.3;
      }
      // Countdown & expiry (turnsRemaining === null → alliance, permanent)
      if (treaty.turnsRemaining !== null) {
        treaty.turnsRemaining--;
        // Keep rel2 in sync
        if (rel2.treaty) rel2.treaty.turnsRemaining = treaty.turnsRemaining;
        if (treaty.turnsRemaining <= 0) {
          const label = treaty.type === 'non_aggression' ? 'Non-Aggression Pact'
                      : treaty.type === 'trade_agreement' ? 'Trade Agreement' : 'Alliance';
          this.game.ui?.showNotification(`📜 ${c1.name}–${c2.name} ${label} has expired.`);
          rel1.treaty = null;
          rel2.treaty = null;
        }
      }
    }

    // Religious tension
    const c1Tension = c1.religionManager ? c1.religionManager.getReligiousTension() : 0;
    const c2Tension = c2.religionManager ? c2.religionManager.getReligiousTension() : 0;

    // Aggressive religion propagation creates friction
    if (c1.religion.presence !== 'none' && c2.religion.presence !== 'none') {
      const c1Aggressive = c1.religionManager?.religions.some(r => r.propagationStyle === 'coercive' || r.propagationStyle === 'aggressive');
      const c2Aggressive = c2.religionManager?.religions.some(r => r.propagationStyle === 'coercive' || r.propagationStyle === 'aggressive');
      if (c1Aggressive || c2Aggressive) {
        rel1.attitude -= 0.5;
        rel2.attitude -= 0.5;
      }
    }

    // Compatible values improve relations
    const compatibility = c1._compatibilityWith ? c1._compatibilityWith(c2) : 0.5;
    rel1.attitude = Utils.clamp(rel1.attitude + (compatibility - 0.5) * 0.3, -100, 100);
    rel2.attitude = Utils.clamp(rel2.attitude + (compatibility - 0.5) * 0.3, -100, 100);

    // ── Natural friction sources ───────────────────────────────────
    // Without these, attitudes stay ~40-70 permanently and wars never occur.
    // Real inter-state rivalry arises from structural factors even between
    // nations that don't have active disputes.

    // 1. Governance ideology clash (Huntington 1996; Mansfield & Snyder 2005)
    // Democracies and autocracies distrust each other's intentions
    const _DEM_GOVS = new Set(['representative', 'direct_congress', 'flat_consensus', 'rotating']);
    const _AUTO_GOVS = new Set(['autocratic', 'theocratic', 'oligarchy',
      'shadow_government_complicit', 'shadow_government_covert']);
    const c1IsDem = _DEM_GOVS.has(c1.governance?.modelId);
    const c2IsDem = _DEM_GOVS.has(c2.governance?.modelId);
    const c1IsAuto = _AUTO_GOVS.has(c1.governance?.modelId);
    const c2IsAuto = _AUTO_GOVS.has(c2.governance?.modelId);
    if ((c1IsDem && c2IsAuto) || (c2IsDem && c1IsAuto)) {
      rel1.attitude -= 0.4;
      rel2.attitude -= 0.4;
    }

    // 2. Military power rivalry — Thucydides trap (Allison 2017)
    // Near-parity armed powers create mutual suspicion
    const c1Mil = c1.state.militaryPower ?? 30;
    const c2Mil = c2.state.militaryPower ?? 30;
    const milRatio = Math.max(c1Mil, c2Mil) / (Math.min(c1Mil, c2Mil) || 1);
    if (milRatio < 1.8 && c1Mil > 35 && c2Mil > 35) {
      rel1.attitude -= 0.3;
      rel2.attitude -= 0.3;
    }

    // 3. Food insecurity breeds blame and competition (Homer-Dixon 1999)
    const c1FoodSec = c1.state.foodSecurity ?? 60;
    const c2FoodSec = c2.state.foodSecurity ?? 60;
    if (c1FoodSec < 40 || c2FoodSec < 40) {
      const severityPenalty = Math.min(c1FoodSec, c2FoodSec) < 25 ? 0.6 : 0.3;
      rel1.attitude -= severityPenalty;
      rel2.attitude -= severityPenalty;
    }

    // 4. Internal instability → diversionary aggression (Levy & Vakili 1992)
    // Unstable regimes project hostility outward
    const c1Stable = c1.state.stability ?? 50;
    const c2Stable = c2.state.stability ?? 50;
    if (c1Stable < 30 || c2Stable < 30) {
      rel1.attitude -= 0.3;
      rel2.attitude -= 0.3;
    }

    // 5. High acquisitiveness / expansionist behavior at runtime
    // Movements, coups, and behavioral drift can make civs aggressive
    const c1Acq = c1.state?.behaviorReinforcement?.acquisitiveness ?? 50;
    const c2Acq = c2.state?.behaviorReinforcement?.acquisitiveness ?? 50;
    if (c1Acq > 60 || c2Acq > 60) {
      const acqPenalty = (Math.max(c1Acq, c2Acq) - 60) * 0.01;
      rel1.attitude -= acqPenalty;
      rel2.attitude -= acqPenalty;
    }

    // 6. Wealth disparity → resentment (Alesina & Spolaore 2003)
    // Large wealth gaps between neighbors breed grievance
    const c1Wealth = c1.state.wealthConcentration ?? 50;
    const c2Wealth = c2.state.wealthConcentration ?? 50;
    const wealthGap = Math.abs((c1.state.wellbeing ?? 50) - (c2.state.wellbeing ?? 50));
    if (wealthGap > 25) {
      rel1.attitude -= 0.2;
      rel2.attitude -= 0.2;
    }

    // Clamp after all friction
    rel1.attitude = Utils.clamp(rel1.attitude, -100, 100);
    rel2.attitude = Utils.clamp(rel2.attitude, -100, 100);

    // Trade
    const avgAttitude = (rel1.attitude + rel2.attitude) / 2;
    if (avgAttitude > 50 && !rel1.war) {
      rel1.trade = rel2.trade = true;
      // Trade boosts knowledge
      c1.state.resourceStores.knowledge += 0.5;
      c2.state.resourceStores.knowledge += 0.5;
    } else if (avgAttitude < 20) {
      rel1.trade = rel2.trade = false;
    }

    // Religion spread between civs
    if (c1.religion.presence !== 'none' && c2.religion.presence !== 'none') {
      this._processCrossCivReligionSpread(c1, c2);
    }
  }

  _processCrossCivReligionSpread(c1, c2) {
    if (!c1.religionManager || !c2.religionManager) return;
    const rel = c1.relations.get(c2.id);
    if (!rel || rel.attitude < 30) return;

    // Missionary religions can spread to trading partners
    for (const religion of c1.religionManager.religions) {
      if (religion.propagationStyle === 'missionary' || religion.propagationStyle === 'aggressive') {
        const existing = c2.religionManager.religions.find(r => r.name === religion.name);
        if (!existing && Utils.random() < 0.02) {
          c2.religionManager.addReligion({
            name: religion.name,
            description: `Arrived via contact with ${c1.name}.`,
            propagationStyle: 'communal',
            toleranceLevel: religion.toleranceLevel,
            adherentPercentage: 5,
            fervorLevel: 50,
          });
        }
      }
    }
  }

  // ── Era Transitions ───────────────────────────────────────────
  _checkEraTransitions() {
    const currentYear = this.game.currentYear;
    const newEra = Utils.getEra(currentYear);

    if (newEra.id !== this.game.currentEra?.id) {
      const prevEra = this.game.currentEra;
      this.game.currentEra = newEra;

      // Update tech levels for all civs
      for (const civ of this.game.civilizations) {
        civ.state.technologyLevel = Math.max(civ.state.technologyLevel, newEra.techLevel);
        civ.addHistoryEntry(currentYear, `Era of ${newEra.label} Begins`, `The civilization enters a new era.`, 'era');

        // Auto-adopt unadopted techs from all PREVIOUS eras (not the new one).
        // These represent established knowledge that any civilization reaching
        // this point would have organically acquired. Still subject to
        // value-compatibility checks (theocracies may resist some techs)
        // and prerequisite checks (must have foundational tech first).
        // Loop multiple passes so that newly adopted techs unlock dependents.
        const prevEraLevel = newEra.techLevel - 1;
        let adopted = true;
        while (adopted) {
          adopted = false;
          const adoptedIdSet = buildAdoptedTechIdSet(civ.state.adoptedTechnologies);
          for (const category of Object.values(TECH_CATEGORIES)) {
            for (const advance of category.advances) {
              const techEra = ERAS.find(e => e.id === advance.era);
              if (techEra && techEra.techLevel <= prevEraLevel &&
                  !civ.state.adoptedTechnologies.includes(advance.name)) {
                // Check prerequisites
                if (advance.prerequisites && advance.prerequisites.length > 0 &&
                    !techPrerequisitesMet(advance.id, adoptedIdSet)) continue;
                if (this._techResistanceFactor(civ, advance) > 0.1) {
                  civ.applyTechnology(advance);
                  civ.addHistoryEntry(currentYear, `Technology: ${advance.name}`,
                    `${civ.name} has adopted ${advance.name} — established knowledge from earlier eras.`, 'technology');
                  adopted = true;
                }
              }
            }
          }
        }
      }

      if (this.game.onEraTransition) {
        this.game.onEraTransition(newEra);
      }
    }
  }

  // ── History Events ────────────────────────────────────────────
  _generateHistoryEvents(currentYear) {
    for (const civ of this.game.civilizations) {
      const events = [];
      const wellbeing = Math.round(civ.state.averageWellbeing);
      const equality  = Math.round(civ.state.equalityIndex);
      const stability = Math.round(civ.state.stabilityIndex);
      const corruption = Math.round(civ.governance.corruptionLevel);
      const powerConc  = Math.round(civ.governance.powerConcentration);
      const b = civ.state.behaviorReinforcement;
      const coop = Math.round(b.cooperation || 50);
      const econId = civ.economic.modelId;
      const govId  = civ.governance.modelId;
      const isGift = econId === 'gift' || econId === 'commons';

      // When suppressRandomEvents is active, all Utils.random() probability
      // gates are bypassed (return false), so only deterministic threshold
      // events fire. This lets researchers hold conditions steady.
      const suppressRandom = civ.suppressRandomEvents || false;
      const randCheck = (prob) => !suppressRandom && Utils.random() < prob;

      // ── Governance-Specific Per-Turn Effects ─────────────────
      if (govId === 'shadow_government_complicit') {
        // Wealth channels rapidly upward through active cooperation of visible leaders
        civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration * (1 + 0.003), 0, 93);
        // Corruption grows unchecked — leaders participate in graft
        civ.governance.corruptionLevel = Utils.clamp(civ.governance.corruptionLevel + 0.2, 0, 100);
      } else if (govId === 'shadow_government_covert') {
        // Structural extraction — less direct graft, but wealth still flows upward
        civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration * (1 + 0.002), 0, 93);
        // Corruption stays lower — visible leaders are genuine, just manipulated
        civ.governance.corruptionLevel = Utils.clamp(civ.governance.corruptionLevel + 0.08, 0, 65);
      } else if (govId === 'failed_state') {
        // Institutional collapse: warlord territories provide crude stability floor ~10
        // Drain reduced: -0.3 (was -0.5), floor at 10 (Somaliland, post-collapse local governance)
        if (civ.state.stabilityIndex > 10) {
          civ.state.stabilityIndex = Utils.clamp(civ.state.stabilityIndex - 0.3, 10, 100);
        }
        // Corruption capped at 80: with no functioning state, there's less to steal
        // Afghanistan, Somalia: corruption is endemic but resource-limited (Rotberg 2004)
        civ.governance.corruptionLevel = Utils.clamp(civ.governance.corruptionLevel + 0.1, 0, 80);
        // Track failed state duration for reconstitution
        civ.state._failedStateTurns = (civ.state._failedStateTurns ?? 0) + 1;
        // Population bleeds away — emigration, violence, famine
        civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.9995));
        // Wellbeing drifts toward floor of 15 (was 8)
        // WVS data: Afghanistan ~4.1/10, Somalia ~4.3/10 → ~15-20 on 0-100 scale
        civ.state.averageWellbeing = Utils.clamp(
          Utils.lerp(civ.state.averageWellbeing, 15, 0.015), 0, 100);
        // Check if failed state can reconstitute (Fix 4d)
        this._checkFailedStateRecovery(civ, currentYear);
      }

      // ── Slavery Per-Turn Effects ──────────────────────────────
      if (civ.slavery?.active) {
        civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration * (1 + 0.003), 0, 93);
        civ.state.equalityIndex          = Utils.clamp(civ.state.equalityIndex          - 0.3,  0, 100);
        civ.state.empathyLevel           = Utils.clamp(civ.state.empathyLevel           - 0.1,  0, 100);
        civ.governance.corruptionLevel   = Utils.clamp(civ.governance.corruptionLevel   + 0.05, 0, 100);
        civ.state.stabilityIndex         = Utils.clamp(civ.state.stabilityIndex         - 0.1,  0, 100);
        if (civ.slavery.type === 'chattel') {
          civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 0.2, 0, 100);
          civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.9999)); // slow attrition
        }
        // Abolitionist movement builds when empathy is high enough to recognize the contradiction
        if (civ.state.empathyLevel > 60 && civ.slavery.prevalence > 40) {
          civ.slavery.abolitionistMovement = Utils.clamp(civ.slavery.abolitionistMovement + 0.5, 0, 100);
          if (civ.slavery.abolitionistMovement >= 100) {
            events.push({ title: '_ABOLITIONIST_THRESHOLD', type: '_internal_trigger' });
          }
        }
      }

      // ── Organized Crime Per-Turn Effects ─────────────────────
      if (civ.organizedCrime?.type && civ.organizedCrime.level > 0) {
        const crimeType = civ.organizedCrime.type;
        const lvl = civ.organizedCrime.level;
        const intensity = lvl / 50; // 0 at 0, 2.0 at 100

        if (crimeType === 'street_gang') {
          civ.state.stabilityIndex       = Utils.clamp(civ.state.stabilityIndex       - 0.3 * intensity, 0, 100);
          civ.state.averageWellbeing     = Utils.clamp(civ.state.averageWellbeing     - 0.2 * intensity, 0, 100);
          civ.state.behaviorReinforcement.cooperation = Utils.clamp(
            civ.state.behaviorReinforcement.cooperation - 0.15 * intensity, 0, 100);
        } else if (crimeType === 'cartel') {
          civ.governance.corruptionLevel     = Utils.clamp(civ.governance.corruptionLevel     + 0.3 * intensity, 0, 100);
          civ.economic.wealthConcentration   = Utils.clamp(civ.economic.wealthConcentration   * (1 + 0.004 * intensity), 0, 93);
          civ.operatingPrinciples.freedomLevel = Utils.clamp(civ.operatingPrinciples.freedomLevel - 0.15 * intensity, 0, 100);
        } else if (crimeType === 'mafia') {
          civ.governance.corruptionLevel = Utils.clamp(civ.governance.corruptionLevel + 0.4 * intensity, 0, 100);
          civ.state.equalityIndex        = Utils.clamp(civ.state.equalityIndex        - 0.2 * intensity, 0, 100);
          // At high mafia penetration, suppress revolution (mafia and state intertwine)
        } else if (crimeType === 'pirate_network') {
          // Piracy hits other civs' diplomacy attitudes (handled in _processInteractions)
          civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration * (1 + 0.002 * intensity), 0, 93);
        }

        // Crime level grows if no suppression is active
        if (!civ.organizedCrime.suppressionPolicy) {
          civ.organizedCrime.level      = Utils.clamp(civ.organizedCrime.level + 2, 0, 100);
          civ.organizedCrime.turnsActive++;
        } else {
          // Count down policy resolution
          civ.organizedCrime.policyTurnsRemaining--;
          if (civ.organizedCrime.policyTurnsRemaining <= 0) {
            events.push({ title: '_CRIME_POLICY_RESOLVED', type: '_internal_trigger',
                          _policyId: civ.organizedCrime.suppressionPolicy });
            civ.organizedCrime.suppressionPolicy    = null;
            civ.organizedCrime.policyTurnsRemaining = 0;
          }
        }

        // Notify at crime level milestones
        if (civ.organizedCrime.level >= 50 && civ.organizedCrime.turnsActive === 1) {
          this.game.ui?.showNotification(`⚠️ Organized crime (${crimeType.replace('_',' ')}) is deeply entrenched in ${civ.name}.`);
        }
      }

      // ── Organized Crime Auto-Emergence ───────────────────────
      if (!civ.organizedCrime?.type) {
        const stability  = civ.state.stabilityIndex;
        const equality   = civ.state.equalityIndex;
        const wealthConc = civ.economic.wealthConcentration;
        const corruption = civ.governance.corruptionLevel;
        const powerConc  = civ.governance.powerConcentration;
        const hasOcean   = civ.geography?.oceanAccess === true || civ.geography?.oceanAccess === 'island';

        if (stability < 35 && equality < 30 && randCheck(0.03)) {
          civ.organizedCrime.type = 'street_gang'; civ.organizedCrime.level = 10; civ.organizedCrime.turnsActive = 0;
          const isPlayer = civ.isPlayerCiv;
          this.game.ui?.showNotification(`🔫 Street gangs have emerged in ${isPlayer ? 'your civilization' : civ.name} amid poverty and instability.`);
          civ.addHistoryEntry(currentYear, 'Gang Emergence', `Street-level criminal organizations have taken root in ${civ.name}, filling voids left by poverty and institutional neglect.`, 'organized_crime');
        } else if (wealthConc > 70 && corruption > 50 && randCheck(0.03)) {
          civ.organizedCrime.type = 'cartel'; civ.organizedCrime.level = 10; civ.organizedCrime.turnsActive = 0;
          this.game.ui?.showNotification(`💊 A cartel has emerged in ${civ.name}, exploiting wealth concentration and corruption.`);
          civ.addHistoryEntry(currentYear, 'Cartel Emergence', `A criminal cartel has established itself in ${civ.name}, exploiting wealth inequality and institutional corruption.`, 'organized_crime');
        } else if (corruption > 65 && powerConc > 60 && randCheck(0.02)) {
          civ.organizedCrime.type = 'mafia'; civ.organizedCrime.level = 10; civ.organizedCrime.turnsActive = 0;
          this.game.ui?.showNotification(`🎩 A mafia network has embedded itself in ${civ.name}'s governance.`);
          civ.addHistoryEntry(currentYear, 'Mafia Emergence', `A sophisticated criminal organization has infiltrated the governance and economic structures of ${civ.name}.`, 'organized_crime');
        } else if (hasOcean && stability < 45 && equality < 40 && randCheck(0.02)) {
          civ.organizedCrime.type = 'pirate_network'; civ.organizedCrime.level = 10; civ.organizedCrime.turnsActive = 0;
          this.game.ui?.showNotification(`🏴‍☠️ A pirate network has formed in ${civ.name}'s coastal waters.`);
          civ.addHistoryEntry(currentYear, 'Pirate Network Emergence', `Maritime criminal networks have formed along ${civ.name}'s coast, preying on trade routes and exploiting weak governance.`, 'organized_crime');
        }
      }

      // ── Migration Auto-Triggers ───────────────────────────────
      // Pull trigger: high wellbeing + freedom draws opportunity seekers (player notification only)
      if (civ.isPlayerCiv && civ.state.averageWellbeing > 75 && civ.operatingPrinciples.freedomLevel > 70 && randCheck(0.03)) {
        this.game.ui?.showNotification('⭐ Your civilization\'s reputation is attracting opportunity seekers. Consider opening borders (Migration tab).');
      }

      // ── Geography Per-Turn Stat Modifiers ─────────────────────
      const terrainMix = civ.geography?.terrainMix || [];
      const climateZone = civ.geography?.climateZone || 'temperate';
      if (terrainMix.includes('mountainous')) {
        civ.state.behaviorReinforcement.innovation = Utils.clamp(civ.state.behaviorReinforcement.innovation + 0.02, 0, 100);
        civ.state.expansionPressure = Utils.clamp(civ.state.expansionPressure - 0.05, 0, 100);
      }
      if (terrainMix.includes('forested')) {
        // Slight fertility and warming contribution reduction
        civ.state.globalWarmingContribution = Utils.clamp(civ.state.globalWarmingContribution - 0.02, 0, 100);
      }
      if (terrainMix.includes('marshy')) {
        civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.9997)); // slow growth penalty
      }
      if (terrainMix.includes('grasslands')) {
        civ.state.expansionPressure = Utils.clamp(civ.state.expansionPressure + 0.03, 0, 100);
        civ.state.resourceStores.food = (civ.state.resourceStores.food || 0) + 1;
      }
      if (climateZone === 'arctic') {
        civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.9995));
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 0.1, 0, 100);
      }
      if (climateZone === 'tropical') {
        civ.state.resourceStores.food = (civ.state.resourceStores.food || 0) + 2; // fertility bonus
      }
      if (civ.geography?.placement === 'island') {
        // Island caps expansion pressure and gives slight trade bonus
        civ.state.expansionPressure = Utils.clamp(civ.state.expansionPressure, 0, 40);
      }

      // ── Leader Aging (happens every turn) ────────────────────
      const leader = civ.governance.leader;
      if (leader) {
        leader.yearsInPower++;
        leader.age++;
        const ageDecay = leader.age > 60 ? 3 : leader.age > 50 ? 1.5 : 0.5;
        leader.healthIndex = Utils.clamp(leader.healthIndex - Utils.random() * ageDecay, 0, 100);
      }

      // ── Social Unrest ────────────────────────────────────────
      if (wellbeing < 20 && randCheck(0.30)) {
        const affectedGroup = equality < 35
          ? 'those at the bottom of the social hierarchy — the laborers, the marginalized, the people with the fewest options'
          : 'broad sections of the population';
        const trigger = civ.economic.wealthConcentration > 65
          ? `growing wealth concentration that has left ${affectedGroup} with diminishing resources`
          : corruption > 50
            ? `endemic corruption that has eroded confidence in institutions`
            : `persistent scarcity and hardship that shows no signs of reversing`;
        const consequence = stability < 30
          ? `The stability of ${civ.name}'s governing institutions is now seriously at risk.`
          : `The governing structure has so far contained the unrest, but the underlying conditions remain.`;

        events.push({
          title: 'Social Unrest',
          description: `${civ.name} is experiencing significant social unrest driven by ${trigger}. The dissatisfaction is most visible among ${affectedGroup}. Protests, work stoppages, and acts of collective defiance have become regular occurrences. ${consequence} What happens next will depend heavily on whether the governing structure can address root causes or merely suppresses expression of them.`,
          type: 'social',
        });
        civ.state.stabilityIndex = Utils.clamp(stability - 6, 0, 100);
      }

      // ── Corruption Crisis ────────────────────────────────────
      if (corruption > 60 && randCheck(0.20)) {
        const mechanism = govId === 'autocratic' || govId === 'oligarchy'
          ? `concentrated power has created conditions where those in authority extract resources with limited accountability`
          : govId === 'theocratic'
            ? `religious authority has been used to redirect communal resources toward institutional interests`
            : `the gap between formal rules and actual practice has widened as individuals exploit institutional weaknesses`;
        const cost = isGift
          ? `communal trust — the foundation of this society's economic model — is eroding`
          : `public services are underfunded and institutional capacity is declining`;

        events.push({
          title: 'Corruption Crisis',
          description: `Corruption in ${civ.name} has reached a level where it is no longer peripheral — it is structural. The pattern: ${mechanism}. The practical cost is that ${cost}. Those at the top benefit disproportionately; those at the bottom bear the cost of every resource that is diverted. Whether this corrects itself depends on whether those harmed by corruption have the power to demand accountability.`,
          type: 'governance',
        });
      }

      // ── Cultural Flourishing ─────────────────────────────────
      if (b.innovation > 80 && randCheck(0.15)) {
        const domain = econId === 'gift' || econId === 'commons'
          ? 'collaborative craft, communal storytelling, and shared ritual'
          : econId === 'market'
            ? 'new trade techniques, applied arts, and civic architecture'
            : 'philosophical inquiry, artistic production, and practical invention';
        const driver = equality > 60
          ? 'broad access to creative participation has amplified the pool of contributors'
          : 'a concentrated class with resources and leisure has become the primary driver';

        events.push({
          title: 'Cultural Flourishing',
          description: `${civ.name} is experiencing an unusual period of cultural and intellectual vitality. Innovation is producing new work in ${domain}. The driver: ${driver}. The effects are visible in how people talk about the future — with something that resembles genuine optimism. Flourishing of this kind is rarely permanent; what matters is what it produces that outlasts the conditions that enabled it.`,
          type: 'culture',
        });
      }

      // ── Extreme Wealth Inequality ────────────────────────────
      if (civ.economic.wealthConcentration > 75 && randCheck(0.20)) {
        const top = econId === 'market' || econId === 'commodity'
          ? 'property-owning and investing classes'
          : econId === 'planned'
            ? 'administrative and party elite'
            : 'those with inherited position or political access';
        const bottom = equality < 30
          ? 'A majority of the population now has effective access to less than ever before, while the economic system continues to reward those who already have the most.'
          : 'The lower strata of society are being squeezed — not enough to break the surface of daily life, but enough to narrow what is possible for most people.';

        events.push({
          title: 'Extreme Wealth Inequality',
          description: `Wealth in ${civ.name} has concentrated to a degree that now fundamentally shapes how power, opportunity, and security are distributed. The ${top} hold a share of resources that leaves diminishing amounts for everyone else. ${bottom} Social tensions are rising — among those who perceive the gap as unjust, among those who fear instability, and among those with power who are beginning to recognize that extreme concentration becomes self-undermining.`,
          type: 'economic',
        });
      }

      // ── Spirit of Cooperation ────────────────────────────────
      if (coop > 80 && randCheck(0.15)) {
        const form = isGift
          ? 'collective labor, mutual care, and shared decision-making'
          : 'civic mobilization, communal projects, and neighbor-to-neighbor support';
        const origin = wellbeing > 65
          ? 'Built on a foundation of reasonable wellbeing, the cooperative impulse has found space to develop'
          : 'Even against a backdrop of hardship, people in this civilization are showing a remarkable capacity to organize';

        events.push({
          title: 'Spirit of Cooperation',
          description: `${civ.name} is experiencing an unusual period of collective action and mutual support. The cooperation is visible in ${form}. ${origin} and extend beyond what immediate necessity requires. This kind of voluntary collective capacity is fragile — it depends on trust that can erode quickly. But when it holds, it changes what a society is capable of.`,
          type: 'social',
        });
      }

      // ── Resource Depletion Events ─────────────────────────────
      const dep = civ.state.resourceDepletion || {};
      // Deforestation milestone
      if (dep.forests < 30 && dep.forests > 0 && randCheck(0.12)) {
        const recentDefor = civ.history.slice(-12).some(h => h.type === 'deforestation');
        if (!recentDefor) {
          events.push({
            title: 'Severe Deforestation',
            description: `${civ.name}'s forests have been reduced to a fraction of their former extent. The loss of tree cover is accelerating soil erosion, degrading water quality, and reducing the land's ability to support agriculture. What took generations to grow has been stripped away in a much shorter time. The effects are cumulative and not easily reversed.`,
            type: 'deforestation',
          });
        }
      }
      // Soil exhaustion
      if (dep.soil < 30 && randCheck(0.12)) {
        const recentSoil = civ.history.slice(-12).some(h => h.type === 'soil_degradation');
        if (!recentSoil) {
          events.push({
            title: 'Soil Degradation Crisis',
            description: `The agricultural land of ${civ.name} is showing severe signs of exhaustion. Overfarming, lack of rotation, and loss of organic matter have depleted soil fertility to a critical level. Food production is declining even as population pressures remain. Hunger is becoming a realistic near-term threat for people at the bottom of the economic structure — as it always does first.`,
            type: 'soil_degradation',
          });
        }
      }
      // Water contamination
      if (dep.water < 25 && randCheck(0.14)) {
        const recentWater = civ.history.slice(-12).some(h => h.type === 'water_crisis');
        if (!recentWater) {
          const econNote = isGift
            ? ` In a society organized around commons stewardship, the failure to protect shared water is particularly striking — a sign that the collective systems are under strain.`
            : econId === 'market'
              ? ` In a market economy, the cost of water contamination falls on those who cannot afford alternatives — not on those whose activity caused the damage.`
              : '';
          events.push({
            title: 'Water Contamination',
            description: `The quality of available water in ${civ.name} has deteriorated to dangerous levels. Contaminated water sources are causing illness, reducing agricultural productivity, and generating social tension around access to clean water.${econNote} This is a slow-moving crisis that tends to stay invisible until it becomes acute.`,
            type: 'water_crisis',
          });
          civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 5, 0, 100);
        }
      }
      // Mineral exhaustion (industrial+ eras only)
      if (dep.minerals < 15 && civ.state.technologyLevel >= 8 && randCheck(0.10)) {
        const recentMin = civ.history.slice(-15).some(h => h.type === 'resource_exhaustion');
        if (!recentMin) {
          events.push({
            title: 'Mineral Reserves Exhausted',
            description: `${civ.name}'s accessible mineral deposits are approaching exhaustion. The industrial infrastructure that was built on cheap, abundant raw materials must now either find alternatives, import at growing cost, or begin to contract. The distributional effects are not neutral — industries that relied on mineral extraction face collapse, and the communities built around them face sudden economic crisis.`,
            type: 'resource_exhaustion',
          });
        }
      }

      // ── Pollution Events ──────────────────────────────────────
      const polIdx = civ.state.pollutionIndex || 0;
      if (polIdx > 50 && randCheck(0.13)) {
        const recentPol = civ.history.slice(-12).some(h => h.type === 'pollution_crisis');
        if (!recentPol) {
          const pollSource = econId === 'market'
            ? `market-driven industrialization, where the costs of pollution are externalized onto the public while the profits remain private`
            : econId === 'planned'
              ? `centrally planned industrial production, where output targets have been prioritized over environmental health`
              : `rapid industrial development whose pace has outrun any capacity to manage its byproducts`;
          events.push({
            title: 'Pollution Crisis',
            description: `${civ.name} is facing a serious pollution crisis driven by ${pollSource}. Air quality in populated areas is visibly degraded; waterways carry industrial runoff; communities near production centers are experiencing elevated rates of illness. The people most affected are those who live and work closest to the sources of pollution — not those who profit from the production.`,
            type: 'pollution_crisis',
          });
          civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 6, 0, 100);
          civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.99));
        }
      }
      // Waste accumulation crisis
      const wasteIdx = civ.state.wasteAccumulation || 0;
      if (wasteIdx > 65 && randCheck(0.10)) {
        const recentWaste = civ.history.slice(-12).some(h => h.type === 'waste_crisis');
        if (!recentWaste) {
          events.push({
            title: 'Waste Accumulation Crisis',
            description: `The volume of waste being produced in ${civ.name} has exceeded what the land and water can absorb. Disposal infrastructure has failed to keep pace with production and consumption. Disease vectors are expanding; the poorest neighborhoods bear the greatest burden of proximity to waste sites. The problem is structural — it is built into how this economy produces and discards — and therefore cannot be resolved by individual behavior alone.`,
            type: 'waste_crisis',
          });
          civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 4, 0, 100);
        }
      }

      // ── Environmental Awareness & Regulation Events ───────────
      // Historical parallels: Easter Island (Rapa Nui) deforestation → societal collapse;
      // Dust Bowl → Soil Conservation Service (1935); London Great Smog (1952) → Clean Air Act;
      // Cuyahoga River fire (1969) → EPA; Aral Sea → Soviet ecological disaster;
      // Ozone hole → Montreal Protocol; Climate change → Paris Agreement.
      // Pattern: ecological damage triggers awareness, which can lead to policy change.
      // More likely in democracies with high education and institutional quality.
      const forests = civ.state.resourceDepletion?.forests ?? 100;
      const soil    = civ.state.resourceDepletion?.soil ?? 100;
      const water   = civ.state.resourceDepletion?.water ?? 100;
      const pollIdx = civ.state.pollutionIndex ?? 0;
      const currentStrategy = civ.state.resourceStrategy ?? 'balanced_stewardship';
      const isDem   = ['representative','direct_congress','flat_consensus','rotating'].includes(govId);
      const educQ   = civ.state.educationQuality ?? 50;
      const iqEnv   = civ.state.institutionalQuality ?? 50;
      const techEnv = civ.state.technologyLevel ?? 1;

      // Environmental awakening: when resources visibly degrade, societies respond
      // Easter Island had NO response mechanism — but modern societies with education
      // and institutions DO respond. The key is whether the response comes in time.
      const ecoDamage = (100 - forests) / 100 + (100 - soil) / 100 + (100 - water) / 100 + pollIdx / 100;
      // ecoDamage ranges 0 (pristine) to ~4 (total devastation)

      // 1. Environmental awareness movement (shifts strategy toward conservation)
      // More likely with: high education, democratic governance, visible damage, high tech
      if (ecoDamage > 0.8 && currentStrategy !== 'conservation') {
        // Democracies have slightly higher probability (free press, activism)
        // but autocracies can also become aware (China's "ecological civilization" concept,
        // Singapore's environmental planning, Bhutan's GNH). Education and institutions matter more.
        const awarenessProb = 0.03 + (isDem ? 0.03 : 0.01) + (educQ > 50 ? 0.04 : 0)
          + (iqEnv > 50 ? 0.02 : 0) + (techEnv >= 5 ? 0.03 : 0) + (ecoDamage > 2.0 ? 0.05 : 0);
        const recentAwareness = civ.history.slice(-20).some(h => h.type === 'environmental_awareness');
        if (!recentAwareness && randCheck(awarenessProb)) {
          // Shift resource strategy one step toward conservation
          let newStrategy = currentStrategy;
          if (currentStrategy === 'extraction_growth') newStrategy = 'balanced_stewardship';
          else if (currentStrategy === 'balanced_stewardship' || currentStrategy === 'government_managed') newStrategy = 'conservation';

          if (newStrategy !== currentStrategy) {
            civ.state.resourceStrategy = newStrategy;
            const stratLabel = newStrategy === 'conservation' ? 'Conservation & Sustainability'
              : 'Balanced Stewardship';
            events.push({
              title: 'Environmental Awakening',
              description: `Growing awareness of ecological damage in ${civ.name} has triggered a shift in resource policy. ${isDem ? 'Public pressure and democratic activism' : 'Elite concern for long-term stability'} has pushed the government to adopt ${stratLabel}. ${ecoDamage > 2.0 ? 'The damage is severe — whether this comes in time remains to be seen.' : 'Early action may prevent the worst outcomes.'}`,
              type: 'environmental_awareness',
            });
            // Small stability cost (adaptation friction) but trust gain (responsive governance)
            civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 2, 0, 100);
            if (isDem) civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 50) + 3, 0, 100);
          }
        }
      }

      // 2. Environmental Protection Act (any governance with sufficient institutions)
      // US: EPA (1970), China: Air Pollution Action Plan (2013), EU: emissions standards
      // Singapore: strict environmental regulation under PAP (not democratic by Western standards)
      // Key requirement: institutional quality + state capacity, NOT governance type
      // Democracies get slightly higher probability (public pressure) but autocracies can also act
      if (techEnv >= 4 && iqEnv > 40 && (civ.state.stateCapacity ?? 0) > 35 && pollIdx > 30 && currentStrategy !== 'conservation') {
        const epaProb = 0.03 + (isDem ? 0.03 : 0.01) + (pollIdx > 60 ? 0.06 : 0) + (iqEnv > 70 ? 0.03 : 0);
        const recentEPA = civ.history.slice(-25).some(h => h.type === 'environmental_protection_act');
        if (!recentEPA && randCheck(epaProb)) {
          // Direct pollution reduction + strategy shift
          civ.state.pollutionIndex = Utils.clamp(pollIdx - 10, 0, 100);
          civ.state.resourceStrategy = 'conservation';
          events.push({
            title: 'Environmental Protection Act',
            description: `${civ.name} has enacted comprehensive environmental protection legislation. Pollution standards, emissions controls, and resource extraction limits are now enforced by institutional authority. ${iqEnv > 70 ? 'Strong institutions ensure effective enforcement.' : 'Enforcement will depend on institutional capacity.'}`,
            type: 'environmental_protection_act',
          });
          civ.addHistoryEntry(currentYear, 'Environmental Protection Act',
            `Comprehensive environmental regulation enacted. Pollution controls and resource protection standards established.`, 'environmental_protection_act');
          if (civ.isPlayerCiv) this.game.ui?.showNotification(`🌿 ${civ.name}: Environmental Protection Act enacted!`, 'success');
        }
      }

      // 3. Reforestation / Ecosystem Restoration (when forests critically low)
      // Historical: China's Great Green Wall, South Korea's reforestation (1960s-80s),
      // Costa Rica reversed deforestation through payments for ecosystem services
      if (forests < 40 && (civ.state.stateCapacity ?? 0) > 30 && techEnv >= 3) {
        const reforestProb = 0.05 + (isDem ? 0.03 : 0) + (forests < 20 ? 0.05 : 0);
        const recentReforest = civ.history.slice(-30).some(h => h.type === 'reforestation_program');
        if (!recentReforest && randCheck(reforestProb)) {
          // Directly restore some forest health
          const capFactor = Math.min(1.5, (civ.state.stateCapacity ?? 30) / 50);
          const restored = 8 * capFactor;
          civ.state.resourceDepletion.forests = Utils.clamp(forests + restored, 0, 100);
          events.push({
            title: 'Reforestation Program',
            description: `${civ.name} has launched a major reforestation initiative. ${Math.round(restored)} points of forest cover restored. ${forests < 20 ? 'This is a last-ditch effort to prevent ecological collapse.' : 'Proactive conservation may prevent future crises.'}`,
            type: 'reforestation_program',
          });
          civ.addHistoryEntry(currentYear, 'Reforestation Program',
            `National reforestation program launched. Forest cover improving.`, 'reforestation_program');
        }
      }

      // 4. Ecological collapse recognition → emergency measures
      // When multiple resources hit critical levels simultaneously
      // Easter Island: no institutional response → total collapse
      // Modern: emergency environmental summits, wartime-level mobilization
      if (ecoDamage > 3.0 && techEnv >= 5) {
        const emergencyProb = 0.08 + (isDem ? 0.05 : 0) + (iqEnv > 60 ? 0.05 : 0);
        const recentEmergency = civ.history.slice(-15).some(h => h.type === 'ecological_emergency');
        if (!recentEmergency && randCheck(emergencyProb)) {
          // Massive intervention — reduce all depletion, shift to conservation
          civ.state.resourceStrategy = 'conservation';
          civ.state.pollutionIndex = Utils.clamp(pollIdx * 0.8, 0, 100);
          if (civ.state.resourceDepletion) {
            civ.state.resourceDepletion.forests = Utils.clamp(forests + 5, 0, 100);
            civ.state.resourceDepletion.soil = Utils.clamp(soil + 5, 0, 100);
            civ.state.resourceDepletion.water = Utils.clamp(water + 5, 0, 100);
          }
          // Economic cost but existential necessity
          civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 5, 0, 100);
          events.push({
            title: 'Ecological Emergency Declaration',
            description: `Facing environmental catastrophe, ${civ.name} has declared an ecological emergency. Wartime-level resource mobilization is redirecting economic output toward ecosystem restoration. This is costly but the alternative is civilizational collapse. ${isDem ? 'Democratic mandate gives the program legitimacy.' : 'Authoritarian implementation is swift but contentious.'}`,
            type: 'ecological_emergency',
          });
          civ.addHistoryEntry(currentYear, 'Ecological Emergency',
            `Ecological emergency declared. Maximum conservation measures enacted.`, 'ecological_emergency');
          if (civ.isPlayerCiv) this.game.ui?.showNotification(`🚨 ${civ.name}: ECOLOGICAL EMERGENCY — maximum conservation enacted`, 'warning');
        }
      }

      // ── Clean Energy Transition & Green Subsidies ────────────
      // When pollution is high and clean energy tech is available, societies
      // can transition away from fossil fuels. Historical: German Energiewende (2010),
      // US Inflation Reduction Act (2022), China's solar manufacturing scale-up.
      // Green subsidies make clean tech affordable for individuals and small businesses
      // who couldn't otherwise afford the conversion.
      const energySrc = civ.state.energySource ?? 'wood';
      const techsSrc = civ.state.adoptedTechnologies ?? [];
      const hasCleaner = techsSrc.includes('Renewable Energy') || techsSrc.includes('Nuclear Power') || techsSrc.includes('Fusion Power');

      if ((energySrc === 'coal' || energySrc === 'oil') && hasCleaner && pollIdx > 20) {
        // Probability: higher with democracy, education, institutions, visible pollution
        const transitionProb = 0.04 + (isDem ? 0.05 : 0) + (educQ > 60 ? 0.03 : 0)
          + (pollIdx > 50 ? 0.05 : 0) + (iqEnv > 60 ? 0.03 : 0);
        const recentTransition = civ.history.slice(-20).some(h => h.type === 'clean_energy_transition');
        if (!recentTransition && randCheck(transitionProb)) {
          // Green subsidies + regulatory push accelerate adoption
          // The subsidy mechanism: government pays part of conversion cost,
          // making solar panels, heat pumps, EVs affordable for ordinary people
          // and small businesses. Inflation Reduction Act model.
          const cleanSource = techsSrc.includes('Fusion Power') ? 'fusion'
            : techsSrc.includes('Renewable Energy') ? 'renewable' : 'nuclear';
          // Don't force the switch — mark it as "available and subsidized"
          // The energy system will naturally adopt the highest tech, but we can
          // accelerate pollution reduction as if adoption is faster
          civ.state.pollutionIndex = Utils.clamp(pollIdx - 8, 0, 100);
          civ.state.globalWarmingContribution = Utils.clamp(
            (civ.state.globalWarmingContribution ?? 0) - 3, 0, 100);
          // Small economic cost (subsidies aren't free) but wellbeing gain (cleaner air)
          civ.state.averageWellbeing = Utils.clamp(
            (civ.state.averageWellbeing ?? 50) + 2, 0, 100);
          events.push({
            title: 'Clean Energy Transition',
            description: `${civ.name} is transitioning away from ${energySrc} toward ${cleanSource}. ${isDem ? 'Green subsidies and tax credits are making clean technology affordable for households and small businesses — solar panels, heat pumps, electric vehicles. The Inflation Reduction Act model: public investment unlocks private adoption.' : 'State-directed investment is building clean energy infrastructure.'} Pollution is declining. Air quality is improving. ${pollIdx > 50 ? 'After decades of toxic air, people are breathing easier.' : 'Early action is preventing the worst health impacts.'}`,
            type: 'clean_energy_transition',
          });
          civ.addHistoryEntry(currentYear, 'Clean Energy Transition',
            `Green transition underway: subsidies for renewables, pollution declining. ${energySrc} → ${cleanSource}.`, 'clean_energy_transition');
          if (civ.isPlayerCiv) this.game.ui?.showNotification(`⚡ ${civ.name}: Clean energy transition — ${energySrc} → ${cleanSource}`, 'success');
        }
      }

      // ── Anti-Stagnation: Prevent Permanent Utopia ─────────────
      // Even thriving societies face new challenges over centuries:
      // complacency, institutional sclerosis, cultural stagnation,
      // external threats, technological disruption.
      // WVS: No society has maintained >8/10 wellbeing indefinitely.
      if ((civ.state.averageWellbeing ?? 50) > 90 && (civ.state.stabilityIndex ?? 50) > 90) {
        // Very small chance of "complacency crisis" — prosperity breeds institutional decay
        // Olson's "The Rise and Decline of Nations" — distributional coalitions accumulate
        if (randCheck(0.02)) {
          const recentComplacency = civ.history.slice(-30).some(h => h.type === 'complacency_crisis');
          if (!recentComplacency) {
            civ.state.institutionalLockin = Utils.clamp(
              (civ.state.institutionalLockin ?? 0) + 5, 0, 100);
            civ.state.behaviorInertia.coefficient = Utils.clamp(
              (civ.state.behaviorInertia?.coefficient ?? 0) + 3, 0, 100);
            events.push({
              title: 'Institutional Complacency',
              description: `Prolonged prosperity in ${civ.name} has bred complacency. Special interest groups have accumulated influence, institutions have become rigid, and reform energy has dissipated. Mancur Olson's "distributional coalitions" are entrenching.`,
              type: 'complacency_crisis',
            });
          }
        }
      }

      // ── Nuclear War (stochastic — extremely rare) ────────────
      // Requires: Nuclear Power tech adopted (implies fissile material capability)
      // Probability: 0.1% per decade base (1 in 1000 turns), increased by:
      // - Active war (+0.3%), low stability (+0.2%), authoritarian gov (+0.1%)
      // Historical: since 1945, several near-misses (Cuban Missile Crisis, Able Archer,
      // Stanislav Petrov incident, 1995 Norwegian rocket). No actual use beyond Hiroshima/Nagasaki.
      const hasNuclearTech = (civ.state.adoptedTechnologies ?? []).includes('Nuclear Power');
      if (hasNuclearTech) {
        const atWarNW = this.activeWars?.some(w => w.attacker === civ.id || w.defender === civ.id);
        let nuclearProb = 0.001; // 0.1% base per decade — extremely rare
        if (atWarNW) nuclearProb += 0.003; // war dramatically increases risk
        if ((civ.state.stabilityIndex ?? 70) < 20) nuclearProb += 0.002; // desperation
        if (['autocratic', 'theocratic'].includes(govId)) nuclearProb += 0.001;
        // Only trigger if no recent nuclear event in this civ's history
        const recentNuclear = civ.history?.slice(-50).some(h => h.type?.includes('nuclear_war'));
        if (!recentNuclear && randCheck(nuclearProb)) {
          // Determine scale based on conditions
          // Limited: most likely (tactical use in desperation)
          // Large-scale: requires active major war
          // All-out: requires mutual nuclear capability (multiple civs with nuclear tech)
          const otherNuclearCivs = this.game.civilizations.filter(c =>
            c !== civ && (c.state.adoptedTechnologies ?? []).includes('Nuclear Power')
          ).length;
          let scale = 'limited';
          if (atWarNW && otherNuclearCivs > 0 && Utils.random() < 0.3) scale = 'large_scale';
          if (atWarNW && otherNuclearCivs > 1 && Utils.random() < 0.1) scale = 'all_out';

          if (scale === 'limited') {
            // Limited/tactical nuclear war: Hiroshima×10 scale
            // 1-5 cities destroyed, regional devastation, limited fallout
            civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.85));
            civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 20, 0, 100);
            civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 15, 0, 100);
            civ.state.collectiveTrauma = Utils.clamp((civ.state.collectiveTrauma ?? 0) + 20, 0, 100);
            civ.state.infrastructureLevel = Utils.clamp((civ.state.infrastructureLevel ?? 50) - 15, 0, 100);
            civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) + 10, 0, 100);
            events.push({ title: '☢️ Limited Nuclear Exchange',
              description: `A limited nuclear exchange has devastated parts of ${civ.name}. Several cities destroyed by tactical nuclear weapons. Radiation contamination spreading. The world watches in horror — will this escalate?`,
              type: 'nuclear_war_limited' });
            civ.addHistoryEntry(currentYear, '☢️ Limited Nuclear War',
              'Tactical nuclear weapons used. Cities destroyed. Radiation contamination. Collective trauma.', 'nuclear_war_limited');
          } else if (scale === 'large_scale') {
            // Large-scale but not total: major cities destroyed, nuclear winter 2-5 years
            // ~100 warheads, 27M+ direct deaths, 5M tonnes soot (India-Pakistan model)
            civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.5));
            civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 40, 0, 100);
            civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 30, 0, 100);
            civ.state.collectiveTrauma = Utils.clamp((civ.state.collectiveTrauma ?? 0) + 50, 0, 100);
            civ.state.infrastructureLevel = Utils.clamp((civ.state.infrastructureLevel ?? 50) - 40, 0, 100);
            civ.state.foodSecurity = Utils.clamp((civ.state.foodSecurity ?? 60) - 30, 0, 100);
            civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) + 30, 0, 100);
            // Nuclear winter effect on global warming (paradoxically cools temporarily)
            civ.state.globalWarmingContribution = Utils.clamp(
              (civ.state.globalWarmingContribution ?? 0) - 5, 0, 100);
            events.push({ title: '☢️ Large-Scale Nuclear War',
              description: `Major nuclear exchange has devastated ${civ.name}. Dozens of cities destroyed. Nuclear winter setting in — temperatures dropping, crops failing. Civilization severely damaged but not destroyed.`,
              type: 'nuclear_war_large' });
            civ.addHistoryEntry(currentYear, '☢️ Large-Scale Nuclear War',
              'Major nuclear exchange. Cities destroyed. Nuclear winter. Civilization severely damaged.', 'nuclear_war_large');
          } else {
            // All-out nuclear war: MAD scenario
            // 4000+ warheads, 150M+ tonnes soot, 10°C global cooling, 80-90% crop failure
            // Civilization as known ceases to function — but human species likely survives
            civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.1));
            civ.state.averageWellbeing = 10; // hard floor
            civ.state.stabilityIndex = 0;
            civ.state.collectiveTrauma = 100;
            civ.state.infrastructureLevel = 0;
            civ.state.foodSecurity = Utils.clamp((civ.state.foodSecurity ?? 60) - 60, 0, 100);
            civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) + 50, 0, 100);
            if (civ.state.resourceDepletion) {
              civ.state.resourceDepletion.forests = Utils.clamp(
                (civ.state.resourceDepletion.forests ?? 50) - 30, 0, 100);
            }
            civ.state.globalWarmingContribution = Utils.clamp(
              (civ.state.globalWarmingContribution ?? 0) - 15, 0, 100);
            civ.state.biodiversityIndex = Utils.clamp(
              (civ.state.biodiversityIndex ?? 80) - 40, 5, 100);
            civ.state.oceanHealthIndex = Utils.clamp(
              (civ.state.oceanHealthIndex ?? 90) - 20, 5, 100);
            // Governance collapses to failed state
            civ.governance.modelId = 'failed_state';
            if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS.failed_state) {
              civ.governance.model = GOVERNANCE_MODELS.failed_state;
            }
            civ.state._failedStateTurns = 0;
            events.push({ title: '☢️ ALL-OUT NUCLEAR WAR',
              description: `Total nuclear exchange has devastated ${civ.name} and the world. Thousands of warheads detonated. Nuclear winter — global temperatures plummeting 10°C. Crops failing worldwide. 90% of population lost. Infrastructure destroyed. Civilization has collapsed. Small groups of survivors scatter. The question is whether they can rebuild.`,
              type: 'nuclear_war_total' });
            civ.addHistoryEntry(currentYear, '☢️ ALL-OUT NUCLEAR WAR',
              'Total nuclear exchange. Civilization destroyed. Nuclear winter. Survivors attempt to rebuild.', 'nuclear_war_total');
          }
        }
      }

      // ── Civil War ─────────────────────────────────────────────
      // Based on: Fearon & Laitin (2003), Collier & Hoeffler (2004),
      // Cederman et al. (2010), Wimmer et al. (2009).
      //
      // Key risk factors from the academic consensus:
      // 1. Low state capacity / weak institutions (strongest predictor — Fearon & Laitin)
      // 2. Political exclusion of ethnic groups (Wimmer, Cederman)
      // 3. High inequality + low social mobility (Collier & Hoeffler "greed" model)
      // 4. Anocracy: neither fully autocratic nor fully democratic (inverted U — Hegre)
      // 5. Recent regime change or state collapse (instability window)
      // 6. Low per-capita income / wellbeing (poverty trap)
      // 7. Previous civil war (conflict trap — Collier)
      //
      // Historical examples:
      // US Civil War (1861): slavery, states' rights, economic divergence
      // Russian Civil War (1917): post-revolution power vacuum
      // Spanish Civil War (1936): political polarization, class conflict
      // Syrian Civil War (2011): political exclusion, drought, inequality
      // Rwandan genocide/civil war (1994): ethnic exclusion → mass violence
      // Yugoslav Wars (1991): ethnic fractionalization + political exclusion
      // English Civil War (1642): governance legitimacy crisis
      if (govId !== 'failed_state' && !civ._occupiedBy) {
        const civCapCW = civ.state.stateCapacity ?? 50;
        const civStab = civ.state.stabilityIndex ?? 70;
        const civInclusion = civ.state.politicalInclusion ?? 50;
        const civFrac = civ.state.ethnicFractionalization ?? 30;
        const civMobility = civ.state.socialMobility ?? 50;
        const civWC = civ.economic?.wealthConcentration ?? 30;
        const civWB = civ.state.averageWellbeing ?? 50;
        const civAnomie = civ.state.anomieLevel ?? 0;
        const civLockin = civ.state.institutionalLockin ?? 0;
        const civLegitimacy = civ.state.legitimacyLevel ?? 50;

        // Base probability: very low — civil wars are rare events
        let civilWarProb = 0;

        // Factor 1: Weak state capacity (Fearon & Laitin's strongest predictor)
        // "Conditions that favor insurgency" — weak states can't suppress rebels
        if (civCapCW < 30) civilWarProb += 0.02;
        else if (civCapCW < 50) civilWarProb += 0.005;

        // Factor 2: Political exclusion + ethnic fractionalization (Cederman, Wimmer)
        // Not raw diversity — EXCLUSION of diverse groups creates conflict
        if (civFrac > 30 && civInclusion < 40) civilWarProb += 0.03;
        else if (civFrac > 50 && civInclusion < 60) civilWarProb += 0.01;

        // Factor 3: High inequality + low mobility (Collier & Hoeffler "greed" model)
        if (civWC > 70 && civMobility < 30) civilWarProb += 0.015;

        // Factor 4: Anocracy — mid-range governance (Hegre's inverted U)
        // Partial democracy + partial autocracy = worst of both worlds
        // Neither strong enough to repress nor inclusive enough to accommodate
        const isAnocracy = civLegitimacy > 20 && civLegitimacy < 60 && civCapCW > 20 && civCapCW < 60;
        if (isAnocracy) civilWarProb += 0.01;

        // Factor 5: Low legitimacy — governance crisis
        if (civLegitimacy < 20) civilWarProb += 0.015;

        // Factor 6: Low wellbeing (poverty → recruitment of desperate people)
        if (civWB < 25) civilWarProb += 0.01;

        // Factor 7: High anomie (social breakdown → violence becomes normalized)
        if (civAnomie > 70) civilWarProb += 0.01;

        // Factor 8: Previous civil war within 500 years (conflict trap — Collier)
        // Societies that experienced civil war are at higher risk for ~50 years after
        // but the effect fades over centuries
        const prevCivilWar = civ.history?.some(h => h.type === 'civil_war' && (currentYear - (h.year ?? 0)) < 500);
        if (prevCivilWar) civilWarProb += 0.01; // reduced from 0.02 — less aggressive trap

        // Dampeners: strong institutions, high trust, and high legitimacy prevent civil war
        if (civCapCW > 70) civilWarProb *= 0.3; // strong state suppresses insurgency
        if ((civ.state.socialTrust ?? 50) > 70) civilWarProb *= 0.5; // high trust = social cohesion
        if (civLegitimacy > 75) civilWarProb *= 0.3; // legitimate governance accepted

        // Minimum threshold: don't trigger on negligible probability
        if (civilWarProb > 0.005) {
          // Spam prevention: no civil war within 15 turns (150 years) of the last one
          // Average civil war duration: 7 years (Collier), but recovery takes decades
          // 150 years ensures realistic spacing
          const recentCW = civ.history?.some(h => h.type === 'civil_war' && (currentYear - (h.year ?? 0)) < 150);
          if (!recentCW && randCheck(civilWarProb)) {
            // Civil war erupts!
            // Determine severity based on conditions
            const severity = (civFrac > 50 && civInclusion < 30) ? 'severe'
              : (civWC > 80 || civAnomie > 80) ? 'major' : 'limited';

            if (severity === 'severe') {
              // Ethnic/sectarian civil war (Syria, Yugoslavia, Rwanda model)
              // Longest, most destructive, hardest to resolve
              civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.8));
              civ.state.averageWellbeing = Utils.clamp(civWB - 25, 0, 100);
              civ.state.stabilityIndex = Utils.clamp(civStab - 30, 0, 100);
              civ.state.infrastructureLevel = Utils.clamp(
                (civ.state.infrastructureLevel ?? 50) - 20, 0, 100);
              civ.state.collectiveTrauma = Utils.clamp(
                (civ.state.collectiveTrauma ?? 0) + 30, 0, 100);
              civ.state.socialTrust = Utils.clamp(
                (civ.state.socialTrust ?? 50) - 20, 0, 100);
              civ.state.anomieLevel = Utils.clamp(civAnomie + 15, 0, 100);
              events.push({
                title: '⚔️ Civil War (Ethnic/Sectarian)',
                description: `${civ.name} has been torn apart by civil war along ethnic and sectarian lines. Political exclusion of ${Math.round(civFrac)}% minority groups has erupted into open warfare. Cities under siege, mass displacement, atrocities reported. International community watches helplessly. This will leave scars for generations.`,
                type: 'civil_war'
              });
            } else if (severity === 'major') {
              // Class/ideological civil war (US 1861, Spain 1936, Russia 1917 model)
              civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.88));
              civ.state.averageWellbeing = Utils.clamp(civWB - 18, 0, 100);
              civ.state.stabilityIndex = Utils.clamp(civStab - 25, 0, 100);
              civ.state.infrastructureLevel = Utils.clamp(
                (civ.state.infrastructureLevel ?? 50) - 15, 0, 100);
              civ.state.collectiveTrauma = Utils.clamp(
                (civ.state.collectiveTrauma ?? 0) + 20, 0, 100);
              civ.state.anomieLevel = Utils.clamp(civAnomie + 10, 0, 100);
              events.push({
                title: '⚔️ Civil War',
                description: `Civil war has erupted in ${civ.name}. Deep divisions — economic inequality (wealth concentration ${Math.round(civWC)}%), political gridlock, and social despair — have fractured the nation. Armed factions fight for control. The economy is devastated. Recovery will take decades.`,
                type: 'civil_war'
              });
            } else {
              // Limited civil conflict (localized insurgency, separatist movement)
              civ.state.population = Math.max(50, Math.floor(civ.state.population * 0.95));
              civ.state.averageWellbeing = Utils.clamp(civWB - 10, 0, 100);
              civ.state.stabilityIndex = Utils.clamp(civStab - 15, 0, 100);
              civ.state.collectiveTrauma = Utils.clamp(
                (civ.state.collectiveTrauma ?? 0) + 10, 0, 100);
              events.push({
                title: '⚔️ Internal Conflict',
                description: `Armed internal conflict has broken out in ${civ.name}. ${civInclusion < 40 ? 'Excluded groups have taken up arms.' : 'Regional or ideological factions have rebelled.'} The government is struggling to maintain control. Civilian casualties mounting.`,
                type: 'civil_war'
              });
            }

            // Note: history entry is auto-added via the events array (line 2232)
            // Do NOT call addHistoryEntry here to avoid duplicates
            if (civ.isPlayerCiv) {
              this.game.ui?.showNotification(`⚔️ ${civ.name}: CIVIL WAR — ${severity} internal conflict!`, 'warning');
            } else {
              this.game.ui?.showNotification(`⚔️ Civil war in ${civ.name}`, 'info');
            }
          }
        }
      }

      // ── Colonization Milestone Events ─────────────────────────
      if (civ._occupiedBy && civ._independenceMovement > 0) {
        const mvt = Math.round(civ._independenceMovement);
        // Announce when movement reaches notable thresholds
        if (mvt >= 40 && mvt < 55 && randCheck(0.25)) {
          const recentMvt = civ.history.slice(-15).some(h => h.type === 'independence_movement');
          if (!recentMvt) {
            events.push({
              title: `Independence Movement Grows`,
              description: `A significant independence movement is forming within ${civ.name}. The occupation by ${civ._occupiedBy} has generated collective grievance that is beginning to organize into something coherent — strikes, refusals, civil disobedience, and cultural preservation. The occupier has noticed. How it responds will shape what comes next.`,
              type: 'independence_movement',
            });
          }
        }
        if (mvt >= 75 && mvt < 90 && randCheck(0.30)) {
          const recentMvt75 = civ.history.slice(-10).some(h => h.title && h.title.includes('Independence Movement'));
          if (!recentMvt75) {
            const colType = civ._colonizationType || 'subdued';
            const resistanceType = (colType === 'enslavement' || colType === 'extermination')
              ? `forced labor strikes, mass non-compliance, and organized violent resistance in some regions`
              : `civil disobedience, political organizing, and public declaration of the right to self-governance`;
            events.push({
              title: `Independence Movement: Critical Phase`,
              description: `The independence movement in ${civ.name} has reached a critical intensity. The forms of resistance include ${resistanceType}. Both the movement and the occupying power are at an inflection point — the resolution will depend on the occupier's response and the movement's capacity to maintain unity under pressure.`,
              type: 'independence_movement',
            });
          }
        }
      }

      // ── New Horizons Events ──────────────────────────────────
      const techLvl = civ.state.technologyLevel || 1;

      // Pre-modern: new land / continent discovered (Early Bronze Age → Renaissance)
      if (techLvl >= 2 && techLvl <= 7 && randCheck(0.06)) {
        const recentHorizon = civ.history.slice(-20).some(h => h.type === 'new_horizons');
        if (!recentHorizon) {
          let horizonTitle, horizonDesc;
          if (techLvl <= 3) {
            horizonTitle = 'New Lands Discovered';
            horizonDesc = Utils.random() < 0.5
              ? `Travelers from ${civ.name} have returned with reports of unknown lands beyond the known frontier. The territory appears uninhabited or only sparsely settled. The discovery opens the possibility of expansion, new resources, and contact with peoples whose existence was not previously known.`
              : `Traders and wanderers from ${civ.name} have pushed beyond previous limits and returned with accounts of lands no one from this civilization has visited before. Whether these new territories represent opportunity, danger, or both remains to be discovered.`;
          } else if (techLvl <= 5) {
            horizonTitle = 'Distant Lands Reached';
            horizonDesc = `Explorers and traders from ${civ.name} have made contact with lands and peoples far beyond the edges of the previously known world. The geography of what this civilization considers "the world" is expanding. New routes are forming to connect these discoveries with existing networks. First contacts of this kind rarely end simply — new peoples, resources, and unknowns set processes in motion that are difficult to predict and harder to reverse.`;
          } else {
            horizonTitle = 'New World Discovered';
            horizonDesc = `Expeditions from ${civ.name} have reached previously unknown lands beyond the navigable horizon. The known world has expanded significantly. New peoples, ecologies, and resources are now within reach of this civilization. History shows that moments of first contact carry enormous consequences — for those who arrive and for those who are already there.`;
          }
          events.push({ title: horizonTitle, description: horizonDesc, type: 'new_horizons' });
        }
      }

      // Industrial era: frontier lands opened for settlement (techLvl 8)
      if (techLvl === 8 && randCheck(0.05)) {
        const recentFrontier = civ.history.slice(-20).some(h => h.type === 'frontier_expansion');
        if (!recentFrontier) {
          const driver = econId === 'market'
            ? `private enterprise and land speculation, with minimal governance of the process`
            : econId === 'planned'
              ? `state-directed settlement programs designed to extend national reach into previously unincorporated territory`
              : `a mix of economic pressure and political aspiration pushing people outward`;
          events.push({
            title: 'Frontier Expansion',
            description: `${civ.name} is actively incorporating territories at its frontiers that were previously beyond effective reach. The expansion is driven by ${driver}. New settlements are forming; infrastructure is following. The frontier is not empty — how existing inhabitants are accounted for in this process is a question that historical records rarely answer favorably.`,
            type: 'frontier_expansion',
          });
        }
      }

      // Modern era: large-scale land reclamation (techLvl 9)
      if (techLvl === 9 && randCheck(0.06)) {
        const recentReclaim = civ.history.slice(-20).some(h => h.type === 'land_reclamation');
        if (!recentReclaim) {
          events.push({
            title: 'Land Reclamation Project',
            description: `${civ.name} has undertaken a major land reclamation initiative — recovering usable terrain from coastlines, wetlands, or degraded zones through large-scale engineering. The new land expands effective territory available for habitation, agriculture, or industry. These projects are ecologically consequential, reshaping drainage systems and coastlines in ways that will persist for generations.`,
            type: 'land_reclamation',
          });
        }
      }

      // Contemporary era: underwater habitats (techLvl 10)
      if (techLvl === 10 && randCheck(0.05)) {
        const recentUnderwater = civ.history.slice(-25).some(h => h.type === 'underwater_habitat');
        if (!recentUnderwater) {
          events.push({
            title: 'Underwater Habitat Established',
            description: `${civ.name} has established a functional underwater habitat — a pressurized living and working environment beneath the ocean surface. Part research station, part proof of concept for permanent subsea settlement, the facility represents a genuine expansion of habitable space into a previously inaccessible environment. The resources, ecosystems, and strategic significance of the deep ocean floor are only beginning to be understood.`,
            type: 'underwater_habitat',
          });
        }
      }

      // Future era: new uninhabited planets open for colonization (techLvl 11)
      if (techLvl >= 11 && randCheck(0.08)) {
        const recentPlanet = civ.history.slice(-30).some(h => h.type === 'planetary_colonization');
        if (!recentPlanet) {
          const planetDesc = Utils.random() < 0.5
            ? `${civ.name} has opened the first permanent colony on an uninhabited planet. The settlement is small — measured in people and initial infrastructure — but its significance is profound. Humanity now exists on more than one world. Who governs the colony, who owns its resources, and what obligations settlers carry with them from the civilization that sent them are questions only beginning to be answered.`
            : `A newly surveyed uninhabited world has been opened for colonization by ${civ.name}. The process of establishing permanent human presence on another planet is underway. Distance changes everything: communication delays, supply dependencies, and the gradual emergence of a culture with no shared human history to inherit or resist.`;
          events.push({
            title: 'Planetary Colonization Begins',
            description: planetDesc,
            type: 'planetary_colonization',
          });
        }
      }

      // ── Alien Contact Events (Phase 1: Detection) ────────────
      if (techLvl >= 10) {
        const hasSignal    = civ.history.some(h => h.type === 'alien_signal');
        const hasConfirmed = civ.history.some(h => h.type === 'alien_contact');

        // Phase 1a — anomalous signal (first detection, ~4% per turn once contemporary era reached)
        if (!hasSignal && randCheck(0.04)) {
          const source = Utils.randChoice([
            'a region of deep space not previously associated with known stellar phenomena',
            'the outer edge of the solar system, at a bearing inconsistent with any catalogued natural object',
            'a repeating pattern in electromagnetic frequencies long considered background noise',
            'an object moving on a trajectory that cannot be reconciled with any known natural body',
          ]);
          const response = civ.state.behaviorReinforcement.cooperation > 60
            ? `Initial response within ${civ.name} has been cautious but collaborative — scientific bodies are coordinating openly to rule out instrument error before any broader announcement.`
            : `The initial response has been fractured. Different institutions are drawing different conclusions. The question of whether to announce publicly is already becoming political.`;
          events.push({
            title: 'Anomalous Signal Detected',
            description: `Sensors operated by ${civ.name} have detected an anomalous signal originating from ${source}. Preliminary analysis rules out known natural causes, but the findings have not yet been independently confirmed. The signal is structured in ways that warrant serious investigation. ${response}`,
            type: 'alien_signal',
          });
        }

        // Phase 1b — signal confirmed (requires prior detection, ~3% per turn, techLevel 11+)
        if (hasSignal && !hasConfirmed && techLvl >= 11 && randCheck(0.03)) {
          const econNote = econId === 'market' || econId === 'commodity'
            ? ` Questions about who controls contact protocols — governments, corporations, or international bodies — are already generating significant political and commercial tension.`
            : isGift
              ? ` Within ${civ.name}, early discussions have centered on the question of whether contact should belong to any one civilization or to all peoples collectively.`
              : '';
          const stabilityNote = stability < 40
            ? ` The announcement has compounded existing instability — some populations are interpreting it through existing fears, and the governing structure is struggling to manage the response.`
            : stability > 70
              ? ` The governing structure has managed the announcement carefully, emphasizing continued normalcy while scientific and diplomatic bodies begin the unprecedented task of determining how to respond.`
              : ` Public response has been varied — awe, fear, and disbelief in roughly equal measure. ${civ.name}'s institutions are attempting to shape the response before it shapes itself.`;
          events.push({
            title: 'Alien Signal Confirmed',
            description: `Multiple independent verification systems operated by ${civ.name} have confirmed that the previously detected anomalous signal is of non-natural, non-human origin. The signal contains structured, non-random information. Its source, intent, and the nature of its senders remain unknown. This is the most significant event in the history of the civilization.${econNote}${stabilityNote}`,
            type: 'alien_contact',
          });
          civ.state.behaviorReinforcement.innovation = Utils.clamp(
            (civ.state.behaviorReinforcement.innovation || 50) + 20, 0, 100
          );
          civ.state.stabilityIndex = Utils.clamp(stability - 10, 0, 100);
          this.game.ui?.showNotification(`🛸 Alien signal confirmed in ${civ.name}! First contact established.`);
        }

        // Phase 2 — Response protocol (auto-selected ~8% per turn after confirmed contact)
        const RESPONSE_TYPES = ['alien_response_open','alien_response_study','alien_response_quarantine','alien_response_military','alien_response_diplomatic'];
        const hasResponse = civ.history.some(h => RESPONSE_TYPES.includes(h.type));
        if (hasConfirmed && !hasResponse && randCheck(0.08)) {
          const innovScore = Math.round(b.innovation || 50);
          let protocol, protocolTitle, protocolDesc;

          if (coop > 65 && powerConc < 35) {
            if (Utils.random() < 0.5) {
              protocol = 'alien_response_open';
              protocolTitle = 'Open Contact Protocol Adopted';
              protocolDesc = `${civ.name} has formally adopted an Open Contact Protocol — full public disclosure and active attempts to establish two-way communication. The decision reflects the civilization's cooperative orientation: the view that a response of this magnitude belongs to everyone, not to any select group of institutions. The implications are profound and not fully known.`;
            } else {
              protocol = 'alien_response_diplomatic';
              protocolTitle = 'Diplomatic Outreach Protocol Adopted';
              protocolDesc = `${civ.name} has established formal diplomatic protocols for alien contact — structured, carefully crafted communication attempts through neutral frameworks. The approach treats first contact as a diplomatic matter rather than a scientific or military one, prioritizing deliberate engagement over reactive response.`;
            }
          } else if (innovScore > 70) {
            protocol = 'alien_response_study';
            protocolTitle = 'Scientific Study Protocol Adopted';
            protocolDesc = `${civ.name} has adopted a Scientific Study Protocol — contact information is centralized within research institutions, and communication attempts are being conducted through mathematical and physical frameworks considered most likely to be universally interpretable. The approach prioritizes understanding before any broader engagement.`;
          } else if (powerConc > 65 && coop < 40) {
            if (Utils.random() < 0.5) {
              protocol = 'alien_response_quarantine';
              protocolTitle = 'Information Quarantine Implemented';
              protocolDesc = `${civ.name}'s governing authority has classified the contact event and implemented a strict information quarantine. Public knowledge of the signal and its confirmation is being actively suppressed. The rationale given: controlled information produces controlled response. The cost: the population is being excluded from the most significant event in the civilization's history.`;
            } else {
              protocol = 'alien_response_military';
              protocolTitle = 'Military Response Posture Adopted';
              protocolDesc = `${civ.name} has adopted a military response posture toward the confirmed alien contact. The signal is being treated as a potential existential threat until proven otherwise. Significant resources are being directed toward detection, defense, and contingency planning. Whether this reflects genuine strategic caution or institutional reflex toward force is a question being actively debated internally.`;
            }
          } else {
            protocol = 'alien_response_diplomatic';
            protocolTitle = 'Diplomatic Outreach Protocol Adopted';
            protocolDesc = `${civ.name} has established formal diplomatic protocols for alien contact. Structured communication attempts are being made through carefully designed frameworks. The governing bodies are treating this as a diplomatic engagement — slower and more deliberate than a purely scientific or military response, and more likely to convey intent to an intelligence with no shared context with humanity.`;
          }

          events.push({ title: protocolTitle, description: protocolDesc, type: protocol });
          this._applyResponseProtocol(civ, protocol);
          this.game.ui?.showNotification(`📋 ${civ.name} has adopted a response protocol for alien contact.`);
        }
      }

      // ── Extinction-Level Events (very rare auto-trigger) ─────
      // ~0.2% chance per turn — these are catastrophic, civilisation-shaking events
      if (randCheck(0.002)) {
        const recentExtinction = civ.history.slice(-30).some(h => h.type && h.type.startsWith('extinction_'));
        if (!recentExtinction) {
          // Pool available extinction types for this tech level
          // Weights reflect real-world relative frequency on human timescales.
          // Plagues recur every few generations throughout recorded history.
          // Supervolcanic eruptions are geological-scale rare (Toba ~74,000 BP;
          // Tambora 1815 was severe but sub-supervolcano). Civilisation-threatening
          // meteor impacts are extraordinarily rare (Chicxulub ~66M BP; Tunguska 1908
          // was minor). Climate and nuclear are modern-era possibilities.
          const EXTINCTION_POOL = [
            { id: 'extinction_meteor',       minTech: 1, weight:  5, label: 'Catastrophic Meteor Impact',    desc: `A large extraterrestrial body struck near a densely populated region of ${civ.name}. The immediate destruction was enormous — fires, atmospheric debris, and a collapse of normal activity across a wide area. The long-term effects on population, agriculture, and stability will take generations to fully understand.`, fx: { stabilityDelta: -35, wellbeingDelta: -40, innovationDelta: -20, cooperationDelta: -15 } },
            { id: 'extinction_plague',       minTech: 1, weight: 50, label: 'Catastrophic Pandemic',          desc: `A highly lethal pathogen spread through ${civ.name} with devastating speed. Health systems collapsed. Trade and movement ground to near-standstill. The death toll fundamentally reshaped communities, labor structures, and the population's relationship to its institutions.`, fx: { stabilityDelta: -25, wellbeingDelta: -35, cooperationDelta: -20, innovationDelta: -10 } },
            { id: 'extinction_supervolcano', minTech: 1, weight: 15, label: 'Supervolcano Eruption',          desc: `A supervolcanic event produced massive ash fallout that disrupted agricultural cycles across a wide region of ${civ.name}. Crop failure triggered famine. Displacement of populations strained every institutional structure. The climatic effect — a volcanic cooling — is expected to persist for years.`, fx: { stabilityDelta: -25, wellbeingDelta: -30, fertilityDelta: -30, innovationDelta: -15 } },
            { id: 'extinction_ice_age',      minTech: 1, weight: 10, label: 'Glacial Advance / Rapid Cooling', desc: `A sharp and sustained drop in temperatures across the region began disrupting ${civ.name}'s agricultural cycles and patterns of settlement. Growing seasons shortened dramatically. Populations dependent on fixed fields found their harvests failing. Herds and game shifted southward, forcing communities to adapt or follow. The onset has been rapid by geological standards — decades rather than millennia — leaving little time for orderly response.`, fx: { stabilityDelta: -18, wellbeingDelta: -25, fertilityDelta: -35, cooperationDelta: -8 } },
            { id: 'extinction_climate',      minTech: 8, weight: 20, label: 'Climate System Collapse',        desc: `Environmental tipping points accumulated beyond the capacity of ${civ.name}'s institutions to manage. Rising seas, catastrophic weather events, and the collapse of stable growing regions forced displacement at scale. The civilization's infrastructure and food systems face sustained, irreversible disruption.`, fx: { stabilityDelta: -20, wellbeingDelta: -30, fertilityDelta: -25, cooperationDelta: -10 } },
            { id: 'extinction_nuclear',      minTech: 9, weight: 20, label: 'Nuclear Winter',                 desc: `A nuclear exchange or catastrophic reactor failure drove atmospheric particulates that blocked sunlight globally. Agricultural output collapsed almost immediately. The psychological and material consequences of the event — and the awareness that the civilization brought this upon itself — are difficult to overstate.`, fx: { stabilityDelta: -40, wellbeingDelta: -45, fertilityDelta: -35, innovationDelta: -25, cooperationDelta: -20 } },
          ];
          const eligible = EXTINCTION_POOL.filter(e => techLvl >= e.minTech);
          if (eligible.length > 0) {
            // Weighted random selection — plague most frequent, meteor rarest
            const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
            let rand = Utils.random() * totalWeight;
            let chosen = eligible[eligible.length - 1];
            for (const e of eligible) { rand -= e.weight; if (rand <= 0) { chosen = e; break; } }

            // Plague has a tech-era-dependent probability of reaching civilisation-wide
            // extinction scale. In pre-agricultural times, travel limitations kept most
            // outbreaks local — a band or village might be wiped out, but civilisation-wide
            // spread was rare. Trade routes (tech 3–5) created the most dangerous conditions:
            // rapid spread through the same networks that built civilisation, with no medicine
            // or understanding of contagion (cf. Black Death, Plague of Justinian, Antonine
            // Plague). Industrial and modern eras bring faster spread but improving medicine.
            let triggerEvent = true;
            if (chosen.id === 'extinction_plague') {
              const plagueScaleChance = techLvl <= 2 ? 0.15   // isolated bands — outbreaks stay local
                                      : techLvl <= 5 ? 0.90   // trade-route era — most dangerous, no countermeasures
                                      : techLvl <= 8 ? 0.70   // industrial — fast spread, limited medicine
                                                     : 0.45;  // modern — global spread guaranteed, but medicine helps
              triggerEvent = Utils.random() < plagueScaleChance;
            }

            if (triggerEvent) {
              events.push({ title: chosen.label, description: chosen.desc, type: chosen.id });
              this._applyExtinctionEvent(civ, { extinctionId: chosen.id, effects: chosen.fx });
              this.game.ui?.showNotification(`⚠️ ${chosen.label} strikes ${civ.name}!`);
            }
          }
        }
      }

      // ── Public Works Auto-trigger (~3% per turn when stable and mature) ──
      if (stability > 55 && wellbeing > 45 && techLvl >= 2 && randCheck(0.03)) {
        const WORKS_POOL = [
          { id: 'works_granary',    minTech: 2, maxTech: 7,  label: 'Granary Network Established',       desc: `${civ.name} completed a major public granary network, distributing food storage across settlements. The project was commissioned to buffer against harvest failure and reduce the recurring threat of famine. Citizens near the new facilities report meaningful improvements in food security.`, fx: { stabilityDelta: 12, wellbeingDelta: 8 } },
          { id: 'works_irrigation', minTech: 2, maxTech: 8,  label: 'Great Irrigation Project Complete',  desc: `${civ.name} completed a large-scale irrigation system extending arable land into previously marginal territories. The project required coordinated labor across multiple regions and years, and represents one of the largest engineering undertakings in the civilization's history to this point.`, fx: { fertilityDelta: 15, wellbeingDelta: 10 } },
          { id: 'works_aqueduct',   minTech: 3, maxTech: 8,  label: 'Aqueduct System Completed',         desc: `A major aqueduct and public water infrastructure project was completed across the core settlements of ${civ.name}. Access to clean water, previously dependent on proximity to natural sources, has been extended broadly. The health and wellbeing impact is already visible in population surveys.`, fx: { wellbeingDelta: 15, stabilityDelta: 10 } },
          { id: 'works_roads',      minTech: 3, maxTech: 9,  label: 'Road Network Extended',             desc: `${civ.name} completed a major expansion of its road network, connecting previously isolated communities to major centers. The effect on trade, communication, and cultural exchange was immediate. Merchants, officials, and ordinary travelers report dramatically reduced travel times.`, fx: { cooperationBoost: 12, innovationBoost: 5 } },
          { id: 'works_library',    minTech: 4, maxTech: 9,  label: 'Great Archive Established',         desc: `A centralized archive and library was established in ${civ.name}, bringing together records, texts, and accumulated knowledge that had previously been scattered or inaccessible. Scholars, administrators, and craftspeople are already making use of it. The long-term effect on knowledge transmission will compound over generations.`, fx: { innovationBoost: 18, cooperationBoost: 8 } },
          { id: 'works_hospital',   minTech: 6, maxTech: 11, label: 'Public Hospital System Opened',     desc: `${civ.name} opened a network of public hospitals and medical facilities, extending organized health care beyond the reach of those who could previously afford private practitioners. The impact on wellbeing is direct and measurable. The project also accelerated the training of medical practitioners at scale.`, fx: { wellbeingDelta: 20, stabilityDelta: 8 } },
          { id: 'works_energy',     minTech: 9, maxTech: 11, label: 'Renewable Energy Grid Online',      desc: `${civ.name} brought a large-scale renewable energy grid online, shifting a significant portion of its power generation away from fossil and nuclear sources. The economic and environmental effects are already visible, and the project has accelerated related technical innovation in storage, transmission, and efficiency.`, fx: { innovationBoost: 15, wellbeingDelta: 12, stabilityDelta: 5 } },
          { id: 'works_space',      minTech: 10, maxTech: 11, label: 'Space Program Launched',           desc: `${civ.name} launched a coordinated space program — the civilization's first sustained effort to operate beyond the atmosphere. The program represents a convergence of scientific, engineering, and political will at a scale not seen in recent history. Its near-term technical spin-offs are already being felt across multiple industries.`, fx: { innovationBoost: 22, cooperationBoost: 10, wellbeingDelta: 8 } },
        ];
        const eligible = WORKS_POOL.filter(w =>
          techLvl >= w.minTech && techLvl <= w.maxTech &&
          !civ.history.slice(-40).some(h => h.type === w.id)
        );
        if (eligible.length > 0) {
          // Pick a work not already under construction
          const notBuilding = eligible.filter(w =>
            !civ.state.constructionProjects?.some(p => p.workId === w.id)
          );
          if (notBuilding.length > 0) {
            const chosen = Utils.randChoice(notBuilding);
            const BUILD_TIMES = {
              works_granary: 3, works_irrigation: 4, works_aqueduct: 5,
              works_roads: 4,   works_library: 5,    works_hospital: 6,
              works_energy: 6,  works_space: 8,
            };
            const buildTurns = BUILD_TIMES[chosen.id] || 4;
            events.push({
              title: `🏗️ ${chosen.label} — Construction Begun`,
              description: `${civ.name} has commissioned the ${chosen.label}. Construction is underway and will take ${buildTurns} turns to complete.`,
              type: chosen.id,
              historyType: chosen.id,
            });
            this._applyPublicWorkEvent(civ, {
              workId: chosen.id,
              icon: '🏗️',
              label: chosen.label,
              effects: chosen.fx,
              buildTurns,
            });
            this.game.ui?.showNotification(`🏗️ ${civ.name} began construction: ${chosen.label}`);
          }
        }
      }

      // ── Revolution Check ─────────────────────────────────────
      // Failed state: revolution is impossible (nothing to overthrow)
      const isShadowGov = govId === 'shadow_government_complicit' || govId === 'shadow_government_covert';
      const isFailedState = govId === 'failed_state';
      // Shadow govs suppress revolution probability significantly
      const shadowRevSuppression = isShadowGov
        ? (govId === 'shadow_government_complicit' ? 0.4 : 0.6)  // complicit suppresses more
        : 1.0;

      // Democratic revolution: very low wellbeing + high power concentration + low equality + instability
      if (!isFailedState && wellbeing < 16 && powerConc > 68 && equality < 28 && stability < 40 && randCheck(0.08 * shadowRevSuppression)) {
        const recentRevolution = civ.history.slice(-10).some(h => h.type === 'revolution');
        if (!recentRevolution) {
          events.push({ title: '_REVOLUTION_DEMOCRATIC', type: '_internal_trigger' });
        }
      }
      // Authoritarian seizure: instability + weakness + no existing autocracy
      if (!isFailedState && stability < 20 && wellbeing < 25 && govId !== 'autocratic' && randCheck(0.06 * shadowRevSuppression)) {
        const recentRevolution = civ.history.slice(-10).some(h => h.type === 'revolution');
        if (!recentRevolution) {
          events.push({ title: '_REVOLUTION_AUTHORITARIAN', type: '_internal_trigger' });
        }
      }

      // ── Failed State Collapse (auto-trigger from extreme instability) ──
      if (!isFailedState && stability < 10) {
        // Track consecutive low-stability turns using a runtime counter on the civ
        civ._lowStabilityTurns = (civ._lowStabilityTurns || 0) + 1;
        if (civ._lowStabilityTurns >= 3 && randCheck(0.3)) {
          events.push({ title: '_FAILED_STATE_COLLAPSE', type: '_internal_trigger' });
          civ._lowStabilityTurns = 0;
        }
      } else {
        civ._lowStabilityTurns = 0;
      }

      // ── World Federation Formation Suggestion (auto-trigger) ──
      if (govId !== 'world_federation' && !civ.history.slice(-30).some(h => h.type === 'world_federation')) {
        const tecLvl = civ.state.technologyLevel || 1;
        const allCivsCooperative = this.game.civilizations.every(c =>
          (c.state.behaviorReinforcement.cooperation || 50) > 78 &&
          !Array.from(c.relations?.values() || []).some(r => r.war)
        );
        if (allCivsCooperative && (b.cooperation || 50) > 80 && tecLvl >= 9 && randCheck(0.02)) {
          events.push({ title: '_WORLD_FEDERATION_EMERGING', type: '_internal_trigger' });
        }
      }

      // ── Leader Death / Crisis (auto-trigger) ─────────────────
      if (leader && !civ.history.slice(-5).some(h => h.type === 'leadership')) {
        if (leader.age > 65 && leader.healthIndex < 40 && randCheck(0.04)) {
          events.push({ title: '_LEADER_NATURAL_DEATH', type: '_internal_trigger' });
        } else if (powerConc > 70 && stability < 30 && equality < 25 && randCheck(0.025)) {
          events.push({ title: '_LEADER_ASSASSINATED', type: '_internal_trigger' });
        } else if (leader.healthIndex < 20 && randCheck(0.06)) {
          events.push({ title: '_LEADER_INCAPACITATED', type: '_internal_trigger' });
        }
      }

      // ── Cult Emergence (auto-trigger) ────────────────────────
      const recentCult = civ.history.slice(-20).some(h => h.type === 'cult_rise');
      if (!recentCult) {
        const firstRel   = (civ.religion?.religions || [])[0];
        const fervor     = firstRel?.fervorLevel ?? 0;
        const propStyle  = firstRel?.propagationStyle ?? '';
        const religCult  = fervor > 65 && propStyle === 'evangelical' && equality < 35;
        const powerCult  = powerConc > 75 && stability < 30 && leader;
        if ((religCult || powerCult) && randCheck(0.015)) {
          events.push({ title: powerCult ? '_CULT_RISE_PERSONALITY' : '_CULT_RISE_RELIGIOUS', type: '_internal_trigger' });
        }
      }

      // ── Cult Suppression follow-up (auto-trigger) ─────────────
      const hasCult        = civ.history.slice(-25).some(h => h.type === 'cult_rise');
      const hasSuppression = civ.history.slice(-25).some(h => h.type === 'cult_suppression');
      if (hasCult && !hasSuppression && stability > 45 && randCheck(0.08)) {
        events.push({ title: '_CULT_SUPPRESSION', type: '_internal_trigger' });
      }

      // ── Apply events ─────────────────────────────────────────
      for (const event of events) {
        if (event.type === '_internal_trigger') {
          const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
          const isPlayer  = playerCiv === civ;

          // Regime change triggers
          if (event.title === '_REVOLUTION_DEMOCRATIC') {
            civ.applyRegimeChange('revolution_democratic', null, currentYear);
            if (isPlayer) this.game.ui?.showNotification('🔥 Revolution! A democratic uprising has overthrown the old order.');
            else this.game.ui?.showNotification(`🔥 Revolution in ${civ.name}: the old order has been overthrown.`);

          } else if (event.title === '_REVOLUTION_AUTHORITARIAN') {
            civ.applyRegimeChange('revolution_authoritarian', null, currentYear);
            if (isPlayer) this.game.ui?.showNotification('⚠️ Coup! Power has been seized by authoritarian forces.');
            else this.game.ui?.showNotification(`⚠️ Power seized in ${civ.name}: authoritarian takeover.`);

          // Leadership crisis triggers
          } else if (event.title === '_LEADER_NATURAL_DEATH') {
            const { leaderName, eventTitle } = civ.applyLeadershipEvent('natural_death', currentYear);
            const emoji = isPlayer ? '😔' : '📜';
            this.game.ui?.showNotification(`${emoji} ${eventTitle} in ${civ.name}. A succession is underway.`);

          } else if (event.title === '_LEADER_ASSASSINATED') {
            const { leaderName, eventTitle } = civ.applyLeadershipEvent('assassination', currentYear);
            this.game.ui?.showNotification(`🗡️ ${eventTitle} in ${civ.name}! Instability surges.`);

          } else if (event.title === '_LEADER_INCAPACITATED') {
            const { leaderName, eventTitle } = civ.applyLeadershipEvent('incapacitation', currentYear);
            this.game.ui?.showNotification(`🤒 ${eventTitle} in ${civ.name}. Governing authority is uncertain.`);

          // Cult emergence triggers
          } else if (event.title === '_CULT_RISE_RELIGIOUS' || event.title === '_CULT_RISE_PERSONALITY') {
            const isPersonality = event.title === '_CULT_RISE_PERSONALITY';
            const cultName = isPersonality
              ? `Cult of ${civ.governance.leader?.name || 'the Leader'}`
              : 'Circle of the Faithful';
            const cultDesc = isPersonality
              ? `A personality cult has coalesced around ${civ.governance.leader?.name || 'the current leader'} of ${civ.name}. What began as elevated deference has hardened into something more dangerous — absolute loyalty demanded, criticism forbidden, dissent punished. The governing structure now draws authority not from law or tradition, but from the manufactured mystique of a single figure.`
              : `A high-control religious movement has emerged within ${civ.name}. The group — sometimes called "${cultName}" — demands total devotion, enforces strict conformity, and treats questioning as betrayal. The conditions that enabled it — high religious fervor, inequality, and a hunger for certainty — remain fully in place.`;
            civ.state.behaviorReinforcement.conformity = Utils.clamp((b.conformity || 50) + 25, 0, 100);
            civ.state.behaviorReinforcement.deference  = Utils.clamp((b.deference  || 50) + 20, 0, 100);
            civ.state.behaviorReinforcement.innovation = Utils.clamp((b.innovation || 50) - 20, 0, 100);
            civ.state.behaviorReinforcement.empathy    = Utils.clamp((b.empathy    || 50) - 15, 0, 100);
            civ.state.behaviorReinforcement.mutualAid  = Utils.clamp((b.mutualAid  || 50) - 10, 0, 100);
            civ.addHistoryEntry(currentYear, `Cult Emergence: ${cultName}`, cultDesc, 'cult_rise');
            this.game.ui?.showNotification(`🔮 A dangerous ${isPersonality ? 'personality' : 'religious'} cult has emerged in ${civ.name}: ${cultName}`);

          // Cult suppression trigger
          } else if (event.title === '_CULT_SUPPRESSION') {
            civ.state.behaviorReinforcement.conformity = Utils.clamp((b.conformity || 50) - 15, 0, 100);
            civ.state.stabilityIndex = Utils.clamp(stability - 8, 0, 100);
            const supDesc = `The governing authority of ${civ.name} has moved to suppress the cult that emerged recently. The crackdown has been costly — arrests, unrest, and accusations of overreach have all followed. The behavioral conformity the cult enforced has weakened, but the underlying conditions that enabled it remain largely unaddressed.`;
            civ.addHistoryEntry(currentYear, 'Cult Suppression', supDesc, 'cult_suppression');
            this.game.ui?.showNotification(`⚔️ Authorities in ${civ.name} moved to suppress the cult.`);

          // Failed State collapse trigger
          } else if (event.title === '_FAILED_STATE_COLLAPSE') {
            civ.governance.modelId = 'failed_state';
            if (GOVERNANCE_MODELS.failed_state) civ.governance.model = GOVERNANCE_MODELS.failed_state;
            civ.governance.leader = null;
            civ.governance.corruptionLevel = Utils.clamp(civ.governance.corruptionLevel + 25, 0, 100);
            civ._lowStabilityTurns = 0;
            const collapseDesc = `The governing institutions of ${civ.name} have collapsed under sustained pressure. Law enforcement has fragmented, courts are non-functional, and public services have ceased in most areas. Power has passed to whoever can hold it locally — militias, criminal networks, clan structures. The state has failed.`;
            civ.addHistoryEntry(currentYear, 'State Collapse', collapseDesc, 'governance');
            if (isPlayer) this.game.ui?.showNotification('💀 State collapse! Your civilization has entered a failed state. There is no longer a functioning government.');
            else this.game.ui?.showNotification(`💀 State collapse in ${civ.name}: governance has ceased to function.`);

          // World Federation emerging trigger
          } else if (event.title === '_WORLD_FEDERATION_EMERGING') {
            const fedDesc = `Sustained cooperation between ${civ.name} and neighboring civilizations has created the conditions for something unprecedented — a formal proposal for a federated world government. The idea is circulating: a voluntary union in which each civilization retains its culture and local governance, but collectively addresses shared challenges. Whether this becomes reality remains to be decided.`;
            civ.addHistoryEntry(currentYear, 'World Federation Proposed', fedDesc, 'world_federation');
            if (isPlayer) this.game.ui?.showNotification('🌐 A World Federation proposal is emerging from your civilization\'s sustained cooperation!');
            else this.game.ui?.showNotification(`🌐 A World Federation proposal is emerging from ${civ.name}'s sustained cooperation!`);

          // Abolitionist threshold reached
          } else if (event.title === '_ABOLITIONIST_THRESHOLD') {
            const abolDesc = `An abolitionist movement has reached critical mass in ${civ.name}. Decades of moral argument, organized resistance, and escaped testimony have created conditions where the institution of ${civ.slavery?.type?.replace('_',' ') || 'forced labor'} can no longer be defended as natural or inevitable. The question of what happens next is now a live political crisis.`;
            civ.addHistoryEntry(currentYear, 'Abolitionist Movement Peaks', abolDesc, 'slavery');
            civ.slavery.abolitionistMovement = 80; // reset slightly to prevent re-triggering immediately
            if (isPlayer) {
              this.game.ui?.showNotification('✊ An abolitionist movement has peaked in your civilization! Use the Slavery & Labor tab in Events to respond.');
            } else {
              // AI civs: 60% chance to suppress, 40% chance to emancipate
              if (Utils.random() < 0.4) {
                civ.slavery.active = false;
                civ.slavery.emancipatedYear = currentYear;
                civ.state.empathyLevel = Utils.clamp(civ.state.empathyLevel + 15, 0, 100);
                civ.economic.wealthConcentration = Utils.clamp(civ.economic.wealthConcentration - 10, 0, 93);
                civ.addHistoryEntry(currentYear, 'Emancipation', `Under mounting pressure, the governing authority of ${civ.name} has abolished forced labor. The transition begins.`, 'slavery');
                this.game.ui?.showNotification(`✊ Abolitionist movement succeeds in ${civ.name}: slavery abolished.`);
              } else {
                civ.slavery.abolitionistMovement = Utils.clamp(civ.slavery.abolitionistMovement - 20, 0, 100);
                civ.state.empathyLevel = Utils.clamp(civ.state.empathyLevel - 5, 0, 100);
                civ.addHistoryEntry(currentYear, 'Abolitionist Suppression', `The governing authority of ${civ.name} has moved to suppress the abolitionist movement — arrests, censorship, and organized counter-propaganda.`, 'slavery');
                this.game.ui?.showNotification(`⚠️ ${civ.name} suppresses its abolitionist movement.`);
              }
            }

          // Crime countermeasure policy resolved
          } else if (event.title === '_CRIME_POLICY_RESOLVED') {
            const policyId  = event._policyId;
            const crimeType = civ.organizedCrime?.type;
            if (!crimeType) return; // crime already cleared
            const CRIME_TYPES_CFG = (typeof CRIME_TYPES !== 'undefined') ? CRIME_TYPES : {};
            const crimeConf = CRIME_TYPES_CFG[crimeType];
            const policy = crimeConf?.countermeasures?.find(c => c.id === policyId);
            if (policy) {
              civ.organizedCrime.level = Utils.clamp(civ.organizedCrime.level + policy.crimeLevelDelta, 0, 100);
              if (policy.effects.cooperationDelta) civ.state.behaviorReinforcement.cooperation = Utils.clamp(civ.state.behaviorReinforcement.cooperation + policy.effects.cooperationDelta, 0, 100);
              if (policy.effects.stabilityDelta)   civ.state.stabilityIndex             = Utils.clamp(civ.state.stabilityIndex             + policy.effects.stabilityDelta,   0, 100);
              if (policy.effects.corruptionDelta)  civ.governance.corruptionLevel        = Utils.clamp(civ.governance.corruptionLevel        + policy.effects.corruptionDelta,  0, 100);
              if (policy.effects.freedomDelta)     civ.operatingPrinciples.freedomLevel  = Utils.clamp(civ.operatingPrinciples.freedomLevel  + policy.effects.freedomDelta,     0, 100);
              if (policy.effects.wellbeingDelta)   civ.state.averageWellbeing            = Utils.clamp(civ.state.averageWellbeing            + policy.effects.wellbeingDelta,   0, 100);
              if (policy.effects.innovationDelta)  civ.state.behaviorReinforcement.innovation = Utils.clamp(civ.state.behaviorReinforcement.innovation + policy.effects.innovationDelta, 0, 100);
              if (policy.effects.wealthConcDelta)  civ.economic.wealthConcentration      = Utils.clamp(civ.economic.wealthConcentration      + policy.effects.wealthConcDelta,  0, 93);
              if (civ.organizedCrime.level <= 0) {
                civ.organizedCrime.type = null;
                civ.organizedCrime.level = 0;
                civ.addHistoryEntry(currentYear, `Crime Suppressed: ${crimeType.replace(/_/g,' ')}`, `The ${policy.label} countermeasure has resolved the ${crimeType.replace(/_/g,' ')} problem in ${civ.name}.`, 'organized_crime');
                if (isPlayer) this.game.ui?.showNotification(`✅ Organized crime has been eliminated from your civilization.`);
                else this.game.ui?.showNotification(`✅ Organized crime eliminated in ${civ.name}.`);
              } else {
                if (isPlayer) this.game.ui?.showNotification(`📋 Crime countermeasure (${policy.label}) complete. Crime level now: ${Math.round(civ.organizedCrime.level)}/100.`);
              }
            }
          }
        } else {
          civ.addHistoryEntry(currentYear, event.title ?? event.label ?? 'Event', event.description ?? '', event.type ?? 'event');
        }
      }
    }
  }

  // ── Technology Adoption (S-Curve Diffusion Model) ──────────────
  // Based on Rogers' Diffusion of Innovations (1962) and Bass (1969).
  // Each unadopted tech accumulates "adoption pressure" per turn based on
  // structural conditions. When pressure reaches 100, the tech is adopted.
  // Behind-era techs accumulate pressure faster (established knowledge).
  // This replaces the old random-dice approach with deterministic,
  // structurally-driven adoption. Manual introduction via Events panel
  // is unaffected — it bypasses this system entirely.

  _checkTechnologyUnlocks(currentYear) {
    const era = Utils.getEra(currentYear);
    const yearsDelta = this.game.yearsDelta || 10;

    for (const civ of this.game.civilizations) {
      // Initialize adoption pressure map if absent
      if (!civ.state._techAdoptionPressure) civ.state._techAdoptionPressure = {};

      const availableTechs = this._getAvailableTechs(civ, era);
      if (availableTechs.length === 0) continue;

      const currentEraLevel = era.techLevel;
      const innovation     = (civ.state.behaviorReinforcement.innovation ?? 50) / 100;
      const eduQuality     = (civ.state.educationQuality ?? 40) / 100;
      const scienceFreedom = (civ.state.scienceFreedom ?? 50) / 100;
      const energyPenalty  = civ.state._energyInnovationPenalty ?? 1.0;
      const tradeOpenness  = 1 - ((civ.state.tariffLevel ?? 50) / 100); // 0=closed, 1=open

      // Check if any trading partner has adopted each tech (imitation effect)
      const partnerTechs = new Set();
      if (civ.relations) {
        for (const [otherId, rel] of civ.relations) {
          if (rel.trade) {
            const other = this.game.civilizations.find(c => c.id === otherId);
            if (other) {
              for (const t of (other.state.adoptedTechnologies ?? [])) {
                partnerTechs.add(t);
              }
            }
          }
        }
      }

      for (const tech of availableTechs) {
        const techEra = ERAS.find(e => e.id === tech.era);
        const techLevel = techEra ? techEra.techLevel : 1;
        const eraGap = currentEraLevel - techLevel; // how many eras behind

        // ── Compute per-turn adoption pressure ──────────────────
        // Base pressure: higher for behind-era techs (established knowledge)
        // Behind 1 era: base 8/turn. Behind 2+: base 12/turn. Current era: base 3/turn.
        let basePressure;
        if (eraGap >= 2)      basePressure = 12;
        else if (eraGap === 1) basePressure = 8;
        else                   basePressure = 3;

        // Innovation effect (Rogers' "relative advantage" + societal readiness)
        const innovationMult = 0.5 + innovation * 1.0; // range 0.5 – 1.5

        // Education + science freedom (Rogers' "complexity" reduction)
        const knowledgeMult = 0.6 + (eduQuality * 0.5) + (scienceFreedom * 0.4); // range 0.6 – 1.5

        // Energy surplus constraint
        const energyMult = energyPenalty; // 0.2 – 1.0

        // Trade imitation effect (Bass "imitation coefficient")
        // If a trading partner already has this tech, pressure accelerates
        const imitationBonus = partnerTechs.has(tech.name) ? (1.0 + tradeOpenness * 0.5) : 1.0;

        // Value resistance (theocracies, power structures, eco values)
        const resistanceMult = this._techResistanceFactor(civ, tech);

        // Scale by yearsPerTurn (10 years = baseline)
        const timeScale = yearsDelta / 10;

        const pressurePerTurn = basePressure * innovationMult * knowledgeMult *
                                energyMult * imitationBonus * resistanceMult * timeScale;

        // Accumulate
        const prevPressure = civ.state._techAdoptionPressure[tech.name] || 0;
        const newPressure = prevPressure + pressurePerTurn;
        civ.state._techAdoptionPressure[tech.name] = newPressure;

        // Adopt at threshold 100
        if (newPressure >= 100) {
          civ.applyTechnology(tech);
          delete civ.state._techAdoptionPressure[tech.name];
          const verb = eraGap >= 1 ? 'adopted' : 'developed';
          // Discovery event with narrative context
          const discoveryNarrative = this._generateDiscoveryNarrative(civ, tech, verb, eraGap);
          civ.addHistoryEntry(currentYear, `Discovery: ${tech.name}`,
            discoveryNarrative, 'technology');
          // Fire UI notification
          if (this.game.ui) {
            this.game.ui.showNotification(`🔬 ${civ.name} has ${verb} ${tech.name}!`, 'tech');
          }
        }
      }
    }
  }

  _getAvailableTechs(civ, era) {
    const available = [];
    // Build a set of adopted tech IDs for prerequisite checking
    const adoptedIdSet = buildAdoptedTechIdSet(civ.state.adoptedTechnologies);

    for (const category of Object.values(TECH_CATEGORIES)) {
      for (const advance of category.advances) {
        const techEra = ERAS.find(e => e.id === advance.era);
        if (techEra && techEra.techLevel <= era.techLevel &&
            !civ.state.adoptedTechnologies.includes(advance.name)) {
          // Check prerequisites — all prerequisite techs must be adopted
          if (advance.prerequisites && advance.prerequisites.length > 0) {
            if (!techPrerequisitesMet(advance.id, adoptedIdSet)) continue;
          }
          available.push({ ...advance, category: category.id });
        }
      }
    }
    return available;
  }

  // Returns a multiplier 0–1 representing how much a society's values
  // resist adopting this specific technology. 1.0 = no resistance.
  _techResistanceFactor(civ, tech) {
    let factor = 1.0;

    // High-warming techs: gift/commons economies resist (ecological values)
    if (tech.effect?.warmingContrib > 10) {
      if (civ.economic.modelId === 'gift' || civ.economic.modelId === 'commons') {
        factor *= 0.35;
      }
    }

    // Theocratic civilizations resist innovation-boosting tech
    if (civ.governance.modelId === 'theocratic' && tech.effect?.innovation > 0) {
      factor *= 0.45;
    }

    // Printing press / internet threaten concentrated power structures
    if ((tech.name === 'Printing Press' || tech.name === 'Internet' ||
         tech.id === 'printing_press' || tech.id === 'internet') &&
        civ.governance.powerConcentration > 70) {
      factor *= 0.4;
    }

    return factor;
  }

  // ── Discovery Narrative Generator ──────────────────────────────
  // Generates contextual narrative text for technology discovery events.
  _generateDiscoveryNarrative(civ, tech, verb, eraGap) {
    const catLabels = { materials: 'materials science', agriculture: 'agricultural', energy: 'energy',
      science: 'scientific', communication: 'communication', medicine: 'medical', maritime: 'maritime' };
    const catLabel = catLabels[tech.category] || tech.category;
    const civName = civ.name;

    // Pick a discovery context based on conditions
    const contexts = [];
    const innovation = civ.state.behaviorReinforcement?.innovation ?? 50;
    const sciSupport = civ.state.scienceSupport ?? 50;
    const eduQ = civ.state.educationQuality ?? 40;

    if (eraGap >= 2) {
      contexts.push(`building on knowledge that has long been established elsewhere`);
    } else if (eraGap === 1) {
      contexts.push(`catching up with advances already widespread in neighboring civilizations`);
    } else {
      if (innovation > 70) contexts.push(`driven by a culture of innovation and experimentation`);
      if (sciSupport > 65) contexts.push(`supported by strong investment in scientific research`);
      if (eduQ > 60) contexts.push(`enabled by a well-educated population`);
    }

    // Check for trade-based imitation
    if (civ.relations) {
      for (const [, rel] of civ.relations) {
        if (rel.trade) {
          contexts.push(`facilitated by knowledge exchange through trade networks`);
          break;
        }
      }
    }

    const context = contexts.length > 0
      ? contexts[Math.floor(Utils.random() * contexts.length)]
      : 'through gradual experimentation and accumulated knowledge';

    // Prerequisites narrative
    let prereqNote = '';
    if (tech.prerequisites && tech.prerequisites.length > 0) {
      const prereqNames = tech.prerequisites
        .map(pid => TECH_TREE_INDEX[pid]?.name)
        .filter(Boolean);
      if (prereqNames.length > 0) {
        prereqNote = ` Building on ${prereqNames.join(' and ')},`;
      }
    }

    return `${civName} has ${verb} ${tech.name} — a ${catLabel} advancement ${context}.${prereqNote} this discovery will shape the civilization's trajectory.`;
  }

  // ── NPC Pool Refresh ──────────────────────────────────────────
  _refreshNPCPool(civ) {
    // Replace a random NPC with a fresh one reflecting current conditions
    if (civ.npcs.length > 0) {
      const idx = Utils.rand(0, civ.npcs.length - 1);
      civ.npcs[idx] = new NPC(civ);
    }
  }

  // ── Independence Movements ────────────────────────────────────
  _checkIndependence(currentYear) {
    for (const civ of this.game.civilizations) {
      if (!civ._occupiedBy || civ._independenceMovement < 100) continue;

      // Find the occupier civ object (if still alive)
      const occupierName = civ._occupiedBy;
      const occupier = this.game.civilizations.find(c => c.name === occupierName);

      // Determine independence path:
      // Diplomatic if occupier has high empathy/cooperation and movement pressure alone reached 100
      // Confrontational (war of liberation) if occupier is aggressive or has low empathy
      const occupierEmpathy = occupier ? (occupier.state.empathyLevel || 50) : 30;
      const occupierCoop    = occupier ? (occupier.state.behaviorReinforcement.cooperation || 50) : 30;
      const diplomatic      = occupierEmpathy > 55 && occupierCoop > 55;

      if (diplomatic && occupier) {
        // Peaceful independence — occupier concedes
        civ.applyRegimeChange('liberated', null, currentYear);

        occupier.addHistoryEntry(currentYear,
          `${civ.name} Granted Independence`,
          `Facing sustained pressure from a well-organized independence movement and confronting the realities of occupation, ${occupierName} has conceded independence to ${civ.name}. The relationship going forward will be shaped by what both civilizations choose to make of it.`,
          'independence');

        const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
        if (playerCiv === civ)
          this.game.ui?.showNotification(`🕊️ ${civ.name} has achieved independence through diplomacy!`);
        else if (playerCiv === occupier)
          this.game.ui?.showNotification(`🕊️ ${civ.name}'s independence movement has succeeded — you have granted independence.`);
        else
          this.game.ui?.showNotification(`🕊️ ${civ.name} has negotiated independence from ${occupierName}.`);

      } else {
        // Armed uprising — declare a war of liberation
        if (occupier) {
          // Check not already at war
          const relO = occupier.relations.get(civ.id);
          if (!relO || !relO.war) {
            // Trigger war (defender = occupier, attacker = colonized civ rising up)
            this._declareWar(civ, occupier, currentYear, 'war of independence');
          }
        }

        civ.addHistoryEntry(currentYear,
          `War of Independence`,
          `The independence movement in ${civ.name} has reached the point of open armed uprising. The population, having endured occupation under ${occupierName}, has turned to armed resistance. The outcome will depend on relative strength — and on what each side is willing to do.`,
          'independence');

        const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
        if (playerCiv === civ)
          this.game.ui?.showNotification(`⚔️ Your people have risen up! A war of independence has begun against ${occupierName}!`);
        else if (playerCiv === occupier)
          this.game.ui?.showNotification(`⚔️ ${civ.name} has launched a war of independence against you!`);
        else
          this.game.ui?.showNotification(`⚔️ War of Independence: ${civ.name} rises against ${occupierName}!`);
      }
    }
  }

  // ── Apply External Event ──────────────────────────────────────
  applyExternalEvent(event, targetCivIds = null) {
    const targets = targetCivIds
      ? this.game.civilizations.filter(c => targetCivIds.includes(c.id))
      : this.game.civilizations;

    for (const civ of targets) {
      // Ensure technology state arrays exist (defensive for saves created before this feature)
      if (!civ.state.activeTechnologies)     civ.state.activeTechnologies     = [];
      if (!civ.state.activeDiscontinuations) civ.state.activeDiscontinuations = [];
      if (!civ.state.techConsequences)       civ.state.techConsequences       = [];
      if (civ.state.automationLevel === undefined) civ.state.automationLevel  = 0;

      if (event.type === 'introduce_technology') {
        this._applyTechIntroduction(civ, event.tech);
        continue;
      } else if (event.type === 'discontinue_technology') {
        this._applyTechDiscontinuation(civ, event.tech);
        continue;
      } else if (event.type === 'set_automation_level') {
        this._applyAutomationLevelChange(civ, event.level);
        continue;
      } else if (event.type === 'set_education_access') {
        this._applyEducationChange(civ, event);
        continue;
      } else if (event.type === 'set_education_quality') {
        const prev = civ.state.educationQuality;
        civ.state.educationQuality = Utils.clamp(event.quality, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `📚 Education Quality ${event.quality > prev ? 'Raised' : 'Reduced'} to ${event.quality}`,
          `Education quality adjusted from ${prev} to ${event.quality}.`, 'set_education_quality');
        this.game.ui?.showNotification(`📚 ${civ.name}: Education quality set to ${event.quality}`, 'info');
        continue;
      } else if (event.type === 'set_debt_model') {
        this._applyDebtModelChange(civ, event);
        continue;
      } else if (event.type === 'set_tariff_level') {
        const prev = civ.state.tariffLevel;
        civ.state.tariffLevel = Utils.clamp(event.level ?? 30, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🌐 Tariff Level Set to ${civ.state.tariffLevel}%`,
          `Trade tariffs adjusted from ${prev}% to ${civ.state.tariffLevel}%.`, 'set_tariff_level');
        this.game.ui?.showNotification(`🌐 ${civ.name}: Tariff level set to ${civ.state.tariffLevel}%`, 'info');
        continue;
      } else if (event.type === 'set_inheritance_system') {
        const prevInh = civ.governance.inheritanceSystem ?? 'partible';
        const validSystems = ['communal', 'partible', 'meritocratic', 'primogeniture'];
        const newSystem = validSystems.includes(event.system) ? event.system : 'partible';
        civ.governance.inheritanceSystem = newSystem;
        const yr = this.game?.currentYear ?? 0;
        const inhLabels = { communal: 'Communal', partible: 'Partible', meritocratic: 'Meritocratic', primogeniture: 'Primogeniture' };
        civ.addHistoryEntry(yr, `Inheritance System Changed`,
          `Inheritance laws changed from ${inhLabels[prevInh] ?? prevInh} to ${inhLabels[newSystem]}. This will affect the rate of wealth concentration across generations.`, 'set_inheritance_system');
        this.game.ui?.showNotification(`${civ.name}: Inheritance system set to ${inhLabels[newSystem]}`, 'info');
        continue;
      } else if (event.type === 'community_trust_initiative') {
        const cap = civ.state.stateCapacity ?? 50;
        const mag = cap < 25 ? 4 : 8; // state capacity affects policy effectiveness
        civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 50) + mag, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Community Trust Initiative`,
          `Community engagement programs raised social trust to ${Math.round(civ.state.socialTrust)}.${cap < 25 ? ' Low state capacity reduced effectiveness.' : ''}`, 'community_trust_initiative');
        this.game.ui?.showNotification(`${civ.name}: Social trust raised to ${Math.round(civ.state.socialTrust)}`, 'info');
        continue;
      } else if (event.type === 'anti_corruption_campaign') {
        const corr = civ.state.corruptionLevel ?? 0;
        const reduction = Math.min(corr, 8);
        civ.state.corruptionLevel = Math.max(0, corr - reduction);
        civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 50) + 3, 0, 100);
        civ.state.stateCapacity = Utils.clamp((civ.state.stateCapacity ?? 50) + 2, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Anti-Corruption Campaign`,
          `Corruption reduced by ${reduction} to ${civ.state.corruptionLevel}. Trust and state capacity improved.`, 'anti_corruption_campaign');
        this.game.ui?.showNotification(`${civ.name}: Anti-corruption campaign — corruption reduced to ${civ.state.corruptionLevel}`, 'info');
        continue;
      } else if (event.type === 'bureaucratic_reform') {
        civ.state.stateCapacity = Utils.clamp((civ.state.stateCapacity ?? 50) + 6, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Bureaucratic Reform`,
          `Administrative reforms improved state capacity to ${Math.round(civ.state.stateCapacity)}.`, 'bureaucratic_reform');
        this.game.ui?.showNotification(`${civ.name}: State capacity raised to ${Math.round(civ.state.stateCapacity)}`, 'info');
        continue;
      } else if (event.type === 'social_mobility_program') {
        const cap = civ.state.stateCapacity ?? 50;
        const mag = cap < 25 ? 3 : 6;
        civ.state.socialMobility = Utils.clamp((civ.state.socialMobility ?? 50) + mag, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Social Mobility Program`,
          `Education access and opportunity programs raised actual mobility to ${Math.round(civ.state.socialMobility)}.${cap < 25 ? ' Low state capacity reduced effectiveness.' : ''}`, 'social_mobility_program');
        this.game.ui?.showNotification(`${civ.name}: Social mobility raised to ${Math.round(civ.state.socialMobility)}`, 'info');
        continue;
      } else if (event.type === 'infrastructure_investment') {
        const cap = civ.state.stateCapacity ?? 50;
        const infraGain = cap < 25 ? 2 : 4;
        civ.state.infrastructureLevel = Utils.clamp((civ.state.infrastructureLevel ?? 35) + infraGain, 0, 100);
        civ.state.maintenanceDebt = Math.max(0, (civ.state.maintenanceDebt ?? 0) - 5);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Infrastructure Investment`,
          `Public works investment raised infrastructure to ${Math.round(civ.state.infrastructureLevel)} and reduced maintenance debt by 5.${cap < 25 ? ' Low state capacity reduced gains.' : ''}`, 'infrastructure_investment');
        this.game.ui?.showNotification(`${civ.name}: Infrastructure investment — level ${Math.round(civ.state.infrastructureLevel)}, debt reduced`, 'info');
        continue;
      } else if (event.type === 'community_resilience') {
        const cap = civ.state.stateCapacity ?? 50;
        const mag = cap < 25 ? 5 : 10;
        civ.state.anomieLevel = Math.max(0, (civ.state.anomieLevel ?? 0) - mag);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `Community Resilience Program`,
          `Community support programs reduced anomie to ${Math.round(civ.state.anomieLevel)}.${cap < 25 ? ' Low state capacity reduced effectiveness.' : ''}`, 'community_resilience');
        this.game.ui?.showNotification(`${civ.name}: Anomie reduced to ${Math.round(civ.state.anomieLevel)}`, 'info');
        continue;

      // ── Round 13 event handlers ──
      } else if (event.type === 'military_modernization') {
        civ.state.militaryPower = Utils.clamp((civ.state.militaryPower ?? 30) + 8, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Military Modernization',
          `Military power increased to ${Math.round(civ.state.militaryPower)}. Armed forces expanded and equipped.`, 'military');
        this.game.ui?.showNotification(`${civ.name}: Military modernization — power now ${Math.round(civ.state.militaryPower)}`, 'info');
        continue;

      } else if (event.type === 'civilian_oversight_reform') {
        const cap = civ.state.stateCapacity ?? 50;
        const gain = cap < 25 ? 4 : 8;
        civ.state.civilianControl = Utils.clamp((civ.state.civilianControl ?? 50) + gain, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Civilian Oversight Reform',
          `Civilian control over the military strengthened to ${Math.round(civ.state.civilianControl)}.${cap < 25 ? ' Low state capacity reduced effectiveness.' : ''}`, 'civilian_reform');
        this.game.ui?.showNotification(`${civ.name}: Civilian control now ${Math.round(civ.state.civilianControl)}`, 'info');
        continue;

      } else if (event.type === 'truth_reconciliation') {
        const cap = civ.state.stateCapacity ?? 50;
        const trust = civ.state.socialTrust ?? 50;
        const mag = (cap > 50 && trust > 40) ? 8 : 4;
        civ.state.collectiveTrauma = Math.max(0, (civ.state.collectiveTrauma ?? 0) - mag);
        if (cap > 50) civ.state.socialTrust = Utils.clamp(trust + 2, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Truth & Reconciliation Commission',
          `A formal process of acknowledgment and healing has reduced collective trauma to ${Math.round(civ.state.collectiveTrauma)}.${cap > 50 ? ' Social trust also improved.' : ' Low state capacity limited effectiveness.'}`, 'truth_reconciliation');
        this.game.ui?.showNotification(`${civ.name}: Collective trauma reduced to ${Math.round(civ.state.collectiveTrauma)}`, 'info');
        continue;

      // ── Round 14: Tier 3 event handlers ──────────────────────
      } else if (event.type === 'land_reform') {
        const cap = civ.state.stateCapacity ?? 50;
        const mag = cap > 50 ? 12 : 6;
        civ.state.landConcentration = Utils.clamp((civ.state.landConcentration ?? 40) - mag, 0, 100);
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 5, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Land Reform',
          `Redistributive land reform reduced land concentration to ${Math.round(civ.state.landConcentration)}. ${cap > 50 ? 'Strong state capacity enabled effective implementation.' : 'Low state capacity limited reform scope.'} Short-term instability expected.`, 'land_reform');
        this.game.ui?.showNotification(`${civ.name}: Land reform — concentration now ${Math.round(civ.state.landConcentration)}`, 'info');
        continue;

      } else if (event.type === 'caste_abolition') {
        const cap = civ.state.stateCapacity ?? 50;
        const caste = civ.state.casteRigidity ?? 15;
        const mag = cap > 50 ? 15 : 8;
        civ.state.casteRigidity = Utils.clamp(caste - mag, 0, 100);
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 4, 0, 100);
        civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 3, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Caste Abolition Reform',
          `Legislative abolition of rigid stratification reduced caste rigidity to ${Math.round(civ.state.casteRigidity)}. ${caste > 40 ? 'Deep resistance from privileged groups — social disruption expected.' : 'Moderate social adjustment required.'}`, 'caste_abolition');
        this.game.ui?.showNotification(`${civ.name}: Caste reform — rigidity now ${Math.round(civ.state.casteRigidity)}`, 'info');
        continue;

      } else if (event.type === 'constitutional_reform') {
        const cap = civ.state.stateCapacity ?? 50;
        const eh = civ.state.epistemicHealth ?? 50;
        const lockin = civ.state.institutionalLockin ?? 30;
        const mag = (cap > 50 && eh > 40) ? 12 : 6;
        civ.state.institutionalLockin = Utils.clamp(lockin - mag, 0, 100);
        civ.state._govShiftAge = Math.max(0, (civ.state._govShiftAge ?? 0) - 10);
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 3, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Constitutional Reform',
          `Major institutional reform reduced lock-in to ${Math.round(civ.state.institutionalLockin)}. ${cap > 50 ? 'Strong state capacity enabled deep restructuring.' : 'Weak capacity limited reform to surface changes.'} Short-term institutional disruption expected.`, 'constitutional_reform');
        this.game.ui?.showNotification(`${civ.name}: Constitutional reform — lock-in now ${Math.round(civ.state.institutionalLockin)}`, 'info');
        continue;

      } else if (event.type === 'retraining_program') {
        const cap = civ.state.stateCapacity ?? 50;
        const educQ = civ.state.educationQuality ?? 50;
        const mag = (cap > 50 && educQ > 40) ? 10 : 5;
        civ.state.retrainingCapacity = Utils.clamp((civ.state.retrainingCapacity ?? 40) + mag, 0, 100);
        civ.state.techUnemployment = Utils.clamp((civ.state.techUnemployment ?? 0) - 5, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Retraining Program',
          `Government-sponsored retraining boosted retraining capacity to ${Math.round(civ.state.retrainingCapacity)} and reduced tech unemployment to ${Math.round(civ.state.techUnemployment)}.`, 'retraining_program');
        this.game.ui?.showNotification(`${civ.name}: Retraining program — tech unemployment now ${Math.round(civ.state.techUnemployment)}`, 'info');
        continue;

      } else if (event.type === 'inclusion_reform') {
        const cap = civ.state.stateCapacity ?? 50;
        const mag = cap > 50 ? 12 : 6;
        civ.state.politicalInclusion = Utils.clamp((civ.state.politicalInclusion ?? 50) + mag, 0, 100);
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 2, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        const excRisk = civ.state._exclusionRisk ?? 0;
        civ.addHistoryEntry(yr, 'Political Inclusion Reform',
          `Expanded political rights and representation for marginalized ethnic and linguistic groups. Political inclusion rose to ${Math.round(civ.state.politicalInclusion)}. Exclusion risk now ${excRisk}.`, 'inclusion_reform');
        this.game.ui?.showNotification(`${civ.name}: Inclusion reform — political inclusion now ${Math.round(civ.state.politicalInclusion)}`, 'info');
        continue;

      // ── Round 15: Demographic Transition events ──────────────
      } else if (event.type === 'public_health_campaign') {
        const cap = civ.state.stateCapacity ?? 50;
        const sanitBoost = cap > 50 ? 8 : 4;
        civ.state.sanitationLevel = Utils.clamp((civ.state.sanitationLevel ?? 18) + sanitBoost, 0, 100);
        civ.state.diseaseBurden = Utils.clamp((civ.state.diseaseBurden ?? 60) - 5, 0, 100);
        civ.state.infantMortality = Utils.clamp((civ.state.infantMortality ?? 75) - 4, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Public Health Campaign',
          `Organized public health efforts improved sanitation to ${Math.round(civ.state.sanitationLevel)} and reduced disease burden to ${Math.round(civ.state.diseaseBurden)}.`, 'public_health_campaign');
        this.game.ui?.showNotification(`${civ.name}: Public health campaign — disease burden now ${Math.round(civ.state.diseaseBurden)}`, 'info');
        continue;

      } else if (event.type === 'sanitation_investment') {
        civ.state.sanitationLevel = Utils.clamp((civ.state.sanitationLevel ?? 18) + 12, 0, 100);
        civ.state.infrastructureLevel = Utils.clamp((civ.state.infrastructureLevel ?? 20) + 3, 0, 100);
        civ.state.diseaseBurden = Utils.clamp((civ.state.diseaseBurden ?? 60) - 3, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Sanitation Investment',
          `Major investment in water and sanitation infrastructure. Sanitation level rose to ${Math.round(civ.state.sanitationLevel)}.`, 'sanitation_investment');
        this.game.ui?.showNotification(`${civ.name}: Sanitation investment — sanitation now ${Math.round(civ.state.sanitationLevel)}`, 'info');
        continue;

      } else if (event.type === 'vaccination_program') {
        const techLvl = civ.state.technologyAdoption ?? 0;
        let diseaseReduction, infantReduction, mortReduction;
        if (techLvl >= 5) {
          // Modern: dramatic effect
          diseaseReduction = 8; infantReduction = 10; mortReduction = 3;
        } else {
          // Pre-modern: moderate effect (variolation, quarantine)
          diseaseReduction = 3; infantReduction = 3; mortReduction = 0;
        }
        civ.state.diseaseBurden = Utils.clamp((civ.state.diseaseBurden ?? 60) - diseaseReduction, 0, 100);
        civ.state.infantMortality = Utils.clamp((civ.state.infantMortality ?? 75) - infantReduction, 0, 100);
        if (mortReduction > 0) civ.state.mortalityRate = Utils.clamp((civ.state.mortalityRate ?? 40) - mortReduction, 3, 55);
        civ.state.plagueMitigation = Utils.clamp((civ.state.plagueMitigation ?? 0) + 0.15, 0, 1);
        const yr = this.game?.currentYear ?? 0;
        const label = techLvl >= 5 ? 'Vaccination Program' : 'Disease Prevention Program';
        civ.addHistoryEntry(yr, label,
          `${label} reduced disease burden to ${Math.round(civ.state.diseaseBurden)} and infant mortality to ${Math.round(civ.state.infantMortality)}.`, 'vaccination_program');
        this.game.ui?.showNotification(`${civ.name}: ${label} — disease burden now ${Math.round(civ.state.diseaseBurden)}`, 'info');
        continue;

      } else if (event.type === 'financial_crisis') {
        this._applyFinancialCrisis(civ);
        continue;
      } else if (event.type === 'debt_jubilee') {
        this._applyDebtJubilee(civ, event);
        continue;
      } else if (event.type === 'trade_disruption') {
        this._applyTradeDisruption(civ);
        continue;
      } else if (event.type === 'economic_boom') {
        this._applyEconomicBoom(civ);
        continue;
      } else if (event.type === 'gender_equity_initiative') {
        civ.state.genderEquity = Utils.clamp((civ.state.genderEquity ?? 50) + 5, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `⚖️ Gender Equity Initiative`,
          `A gender equity initiative raised the Gender Equity Index to ${civ.state.genderEquity}.`, 'gender_equity_initiative');
        this.game.ui?.showNotification(`⚖️ ${civ.name}: Gender Equity Index raised to ${civ.state.genderEquity}`, 'info');
        continue;
      } else if (event.type === 'judicial_reform') {
        civ.state.institutionalQuality = Utils.clamp((civ.state.institutionalQuality ?? 50) + 8, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🏛️ Judicial Reform`,
          `Judicial reform strengthened institutional quality to ${civ.state.institutionalQuality}.`, 'judicial_reform');
        this.game.ui?.showNotification(`🏛️ ${civ.name}: Institutional quality raised to ${civ.state.institutionalQuality}`, 'info');
        continue;
      } else if (event.type === 'press_freedom_act') {
        civ.state.epistemicHealth = Utils.clamp((civ.state.epistemicHealth ?? 50) + 10, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `📰 Press Freedom Act`,
          `New legislation expanded press freedom; epistemic health rose to ${civ.state.epistemicHealth}.`, 'press_freedom_act');
        this.game.ui?.showNotification(`📰 ${civ.name}: Press freedom improved — epistemic health ${civ.state.epistemicHealth}`, 'info');
        continue;
      } else if (event.type === 'censorship_law') {
        civ.state.epistemicHealth = Utils.clamp((civ.state.epistemicHealth ?? 50) - 15, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🚫 Censorship Law Enacted`,
          `New censorship legislation suppressed epistemic health to ${civ.state.epistemicHealth}.`, 'censorship_law');
        this.game.ui?.showNotification(`🚫 ${civ.name}: Censorship reduced epistemic health to ${civ.state.epistemicHealth}`, 'info');
        continue;
      } else if (event.type === 'set_family_structure') {
        const prev = civ.state.familyStructure;
        civ.state.familyStructure = event.structure ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `👪 Family Structure: ${event.structure}`,
          `Primary family unit shifted from ${prev} to ${event.structure}.`, 'set_family_structure');
        this.game.ui?.showNotification(`👪 ${civ.name}: Family structure → ${event.structure}`, 'info');
        continue;
      } else if (event.type === 'set_sexual_orientation_policy') {
        const prev = civ.state.sexualOrientationPolicy;
        civ.state.sexualOrientationPolicy = event.policy ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🏳️‍🌈 Sexual Orientation Policy: ${event.policy}`,
          `Sexual orientation policy changed from ${prev} to ${event.policy}.`, 'set_sexual_orientation_policy');
        this.game.ui?.showNotification(`🏳️‍🌈 ${civ.name}: Orientation policy → ${event.policy}`, 'info');
        continue;
      } else if (event.type === 'set_childcare_norm') {
        const prev = civ.state.childcareNorm;
        civ.state.childcareNorm = event.norm ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `👶 Childcare Norm: ${event.norm}`,
          `Dominant childcare arrangement changed from ${prev} to ${event.norm}.`, 'set_childcare_norm');
        this.game.ui?.showNotification(`👶 ${civ.name}: Childcare norm → ${event.norm}`, 'info');
        continue;
      } else if (event.type === 'set_reproductive_health_tier') {
        const prev = civ.state.reproductiveHealthTier;
        civ.state.reproductiveHealthTier = event.tier ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🩺 Reproductive Health: ${event.tier}`,
          `Reproductive health access tier changed from ${prev} to ${event.tier}.`, 'set_reproductive_health_tier');
        this.game.ui?.showNotification(`🩺 ${civ.name}: Reproductive health tier → ${event.tier}`, 'info');
        continue;
      } else if (event.type === 'set_family_size_policy') {
        const prev = civ.state.familySizePolicy;
        civ.state.familySizePolicy = event.policy ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `📋 Family Size Policy: ${event.policy}`,
          `Official stance on family size changed from ${prev} to ${event.policy}.`, 'set_family_size_policy');
        this.game.ui?.showNotification(`📋 ${civ.name}: Family size policy → ${event.policy}`, 'info');
        continue;
      } else if (event.type === 'set_womens_rights_tier') {
        const prev = civ.state.womensRightsTier;
        civ.state.womensRightsTier = event.tier ?? prev;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `⚖️ Women's Rights: ${event.tier}`,
          `Women's legal and social rights tier changed from ${prev} to ${event.tier}.`, 'set_womens_rights_tier');
        this.game.ui?.showNotification(`⚖️ ${civ.name}: Women's rights → ${event.tier}`, 'info');
        continue;
      } else if (event.type === 'set_science_support') {
        civ.state.scienceSupport = Utils.clamp(event.support ?? civ.state.scienceSupport, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, `🔬 Science Support: ${civ.state.scienceSupport}`,
          `Investment and appreciation for scientific research set to ${civ.state.scienceSupport}.`, 'set_science_support');
        this.game.ui?.showNotification(`🔬 ${civ.name}: Science support → ${civ.state.scienceSupport}`, 'info');
        continue;
      } else if (event.type === 'set_arts_support') {
        civ.state.artsSupport = Utils.clamp(event.support ?? civ.state.artsSupport, 0, 100);
        const yr2 = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr2, `🎭 Arts Support: ${civ.state.artsSupport}`,
          `Investment and appreciation for arts and culture set to ${civ.state.artsSupport}.`, 'set_arts_support');
        this.game.ui?.showNotification(`🎭 ${civ.name}: Arts support → ${civ.state.artsSupport}`, 'info');
        continue;
      } else if (event.type === 'set_science_freedom') {
        civ.state.scienceFreedom = Utils.clamp(event.freedom ?? civ.state.scienceFreedom, 0, 100);
        if (event.constraint !== undefined) civ.state.scienceFreedomConstraint = event.constraint;
        const yr3 = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr3, `🔬 Science Freedom: ${civ.state.scienceFreedom}`,
          `Research freedom set to ${civ.state.scienceFreedom}; constraint: ${civ.state.scienceFreedomConstraint}.`, 'set_science_freedom');
        this.game.ui?.showNotification(`🔬 ${civ.name}: Science freedom → ${civ.state.scienceFreedom}`, 'info');
        continue;
      } else if (event.type === 'set_arts_freedom') {
        civ.state.artsFreedom = Utils.clamp(event.freedom ?? civ.state.artsFreedom, 0, 100);
        if (event.constraint !== undefined) civ.state.artsFreedomConstraint = event.constraint;
        const yr4 = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr4, `🎭 Arts Freedom: ${civ.state.artsFreedom}`,
          `Artistic expression freedom set to ${civ.state.artsFreedom}; constraint: ${civ.state.artsFreedomConstraint}.`, 'set_arts_freedom');
        this.game.ui?.showNotification(`🎭 ${civ.name}: Arts freedom → ${civ.state.artsFreedom}`, 'info');
        continue;
      } else if (event.type === 'set_healthcare_access') {
        civ.state.healthcareAccess = event.access ?? civ.state.healthcareAccess;
        const hcTier = HEALTHCARE_ACCESS_TIERS.find(t => t.id === civ.state.healthcareAccess);
        const hcYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(hcYr, `🏥 Healthcare: ${hcTier?.label ?? civ.state.healthcareAccess}`,
          `Healthcare access tier set to ${hcTier?.label ?? civ.state.healthcareAccess}.`, 'set_healthcare_access');
        this.game.ui?.showNotification(`🏥 ${civ.name}: Healthcare → ${hcTier?.label ?? civ.state.healthcareAccess}`, 'info');
        continue;
      } else if (event.type === 'set_healthcare_emphasis') {
        civ.state.healthcareEmphasis = event.emphasis ?? civ.state.healthcareEmphasis;
        const hcE = HEALTHCARE_EMPHASIS_TYPES.find(e => e.id === civ.state.healthcareEmphasis);
        const hcEYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(hcEYr, `🛡️ HC Emphasis: ${hcE?.label ?? civ.state.healthcareEmphasis}`,
          `Healthcare emphasis set to ${hcE?.label ?? civ.state.healthcareEmphasis}.`, 'set_healthcare_emphasis');
        this.game.ui?.showNotification(`🛡️ ${civ.name}: HC emphasis → ${hcE?.label ?? civ.state.healthcareEmphasis}`, 'info');
        continue;
      } else if (event.type === 'set_healthcare_incentive') {
        civ.state.healthcareIncentive = event.incentive ?? civ.state.healthcareIncentive;
        const hcI = HEALTHCARE_INCENTIVE_MODELS.find(m => m.id === civ.state.healthcareIncentive);
        const hcIYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(hcIYr, `❤️ HC Incentive: ${hcI?.label ?? civ.state.healthcareIncentive}`,
          `Healthcare incentive model set to ${hcI?.label ?? civ.state.healthcareIncentive}.`, 'set_healthcare_incentive');
        this.game.ui?.showNotification(`❤️ ${civ.name}: HC incentive → ${hcI?.label ?? civ.state.healthcareIncentive}`, 'info');
        continue;
      // ── Environmental Policy Actions (player-triggered) ──────
      } else if (event.type === 'reforestation_program') {
        const cap = civ.state.stateCapacity ?? 50;
        const iqR = civ.state.institutionalQuality ?? 50;
        const capFactor = Math.max(0.5, Math.min(1.5, cap / 50));
        const restored = Math.round(8 * capFactor);
        if (civ.state.resourceDepletion) {
          civ.state.resourceDepletion.forests = Utils.clamp(
            (civ.state.resourceDepletion.forests ?? 50) + restored, 0, 100);
        }
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, '🌲 Reforestation Program',
          `National reforestation launched. +${restored} forest cover. (State capacity: ${Math.round(cap)})`, 'reforestation_program');
        this.game.ui?.showNotification(`🌲 ${civ.name}: Reforestation — +${restored} forest cover`, 'success');
        continue;
      } else if (event.type === 'pollution_control_act') {
        const cap = civ.state.stateCapacity ?? 50;
        const iqR = civ.state.institutionalQuality ?? 50;
        const capFactor = Math.max(0.5, Math.min(1.5, cap / 50));
        const reduction = Math.round(10 * capFactor);
        civ.state.pollutionIndex = Utils.clamp(
          (civ.state.pollutionIndex ?? 0) - reduction, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, '🏭 Pollution Control Act',
          `Emissions standards and pollution controls enacted. -${reduction} pollution. (State capacity: ${Math.round(cap)})`, 'pollution_control_act');
        this.game.ui?.showNotification(`🏭 ${civ.name}: Pollution controls — -${reduction} pollution`, 'success');
        continue;
      } else if (event.type === 'soil_conservation') {
        const cap = civ.state.stateCapacity ?? 50;
        const capFactor = Math.max(0.5, Math.min(1.5, cap / 50));
        const restored = Math.round(6 * capFactor);
        if (civ.state.resourceDepletion) {
          civ.state.resourceDepletion.soil = Utils.clamp(
            (civ.state.resourceDepletion.soil ?? 50) + restored, 0, 100);
        }
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, '🌾 Soil Conservation',
          `Sustainable agriculture and soil conservation practices adopted. +${restored} soil health. Historical parallel: US Soil Conservation Service (1935).`, 'soil_conservation');
        this.game.ui?.showNotification(`🌾 ${civ.name}: Soil conservation — +${restored} soil health`, 'success');
        continue;
      } else if (event.type === 'water_management') {
        const cap = civ.state.stateCapacity ?? 50;
        const capFactor = Math.max(0.5, Math.min(1.5, cap / 50));
        const restored = Math.round(6 * capFactor);
        if (civ.state.resourceDepletion) {
          civ.state.resourceDepletion.water = Utils.clamp(
            (civ.state.resourceDepletion.water ?? 50) + restored, 0, 100);
        }
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, '💧 Water Management',
          `Watershed protection, aquifer management, and water recycling infrastructure built. +${restored} water access.`, 'water_management');
        this.game.ui?.showNotification(`💧 ${civ.name}: Water management — +${restored} water access`, 'success');
        continue;
      } else if (event.type === 'green_subsidies_voluntary' || event.type === 'green_subsidies') {
        // Voluntary Green Subsidies: tax credits, incentives — market-friendly
        // US IRA: $370B in tax credits; German Energiewende feed-in tariffs
        const capG = civ.state.stateCapacity ?? 50;
        const capFactorG = Math.max(0.5, Math.min(1.5, capG / 50));
        const pollRedG = Math.round(5 * capFactorG);
        civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) - pollRedG, 0, 100);
        civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + 2, 0, 100);
        civ.state.globalWarmingContribution = Utils.clamp((civ.state.globalWarmingContribution ?? 0) - 1, 0, 100);
        const yrG = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrG, '⚡ Voluntary Green Subsidies',
          `Tax credits encouraging clean energy adoption. -${pollRedG} pollution, +2 wellbeing.`, 'green_subsidies_voluntary');
        this.game.ui?.showNotification(`⚡ ${civ.name}: Voluntary green subsidies — -${pollRedG} pollution`, 'success');
        continue;
      } else if (event.type === 'green_mandate') {
        // Mandatory Green Transition: regulatory mandates, phase-out deadlines
        // EU Green Deal mandates; California ICE ban 2035; France gilets jaunes pushback
        const capM = civ.state.stateCapacity ?? 50;
        const iqM = civ.state.institutionalQuality ?? 50;
        const capFactorM = Math.max(0.5, Math.min(1.5, capM / 50));
        const pollRedM = Math.round(12 * capFactorM);
        civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) - pollRedM, 0, 100);
        civ.state.globalWarmingContribution = Utils.clamp((civ.state.globalWarmingContribution ?? 0) - 3, 0, 100);
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 2, 0, 100);
        if (iqM > 60) civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 50) + 1, 0, 100);
        const yrM = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrM, '⚖️ Green Transition Mandate',
          `Mandatory emissions standards and fossil fuel phase-out. -${pollRedM} pollution, -3 GW contribution, -2 stability. ${iqM > 60 ? 'Strong institutions absorb pushback.' : 'Political resistance may destabilize.'}`, 'green_mandate');
        this.game.ui?.showNotification(`⚖️ ${civ.name}: Green mandate — -${pollRedM} pollution, -2 stability`, 'success');
        continue;
      } else if (event.type === 'recycling_program') {
        // Large-Scale Recycling: saves 700M tonnes CO₂/year globally
        // Aluminum: 94% energy savings; PET: 79% less carbon than virgin
        // Global circularity only 6.9% — massive room for improvement
        // "Cannot solve the triple crisis by mere recycling" (Circularity Gap 2025)
        const capR = civ.state.stateCapacity ?? 50;
        const techR = civ.state.technologyLevel ?? 1;
        const factorR = Math.max(0.3, Math.min(1.5, capR / 50)) * Math.max(0.5, Math.min(1.5, techR / 6));
        const wasteRed = Math.round(4 * factorR);
        const pollRed = Math.round(2 * factorR);
        const mineralRec = Math.round(2 * factorR);
        civ.state.wasteAccumulation = Utils.clamp((civ.state.wasteAccumulation ?? 0) - wasteRed, 0, 100);
        civ.state.pollutionIndex = Utils.clamp((civ.state.pollutionIndex ?? 0) - pollRed, 0, 100);
        if (civ.state.resourceDepletion) {
          civ.state.resourceDepletion.minerals = Utils.clamp(
            (civ.state.resourceDepletion.minerals ?? 50) + mineralRec, 0, 100);
        }
        const yrR = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrR, '♻️ Recycling Program',
          `National recycling infrastructure. -${wasteRed} waste, -${pollRed} pollution, +${mineralRec} mineral recovery.`, 'recycling_program');
        this.game.ui?.showNotification(`♻️ ${civ.name}: Recycling — -${wasteRed} waste, +${mineralRec} minerals`, 'success');
        continue;
      // ── New Feature Event Handlers ──
      } else if (event.type === 'building_code_reform') {
        // Feature 1: Disaster preparedness
        const capBC = civ.state.stateCapacity ?? 50;
        const gain = Math.round(10 * Math.max(0.3, capBC / 50));
        civ.state.buildingCodeQuality = Utils.clamp((civ.state.buildingCodeQuality ?? 10) + gain, 0, 100);
        civ.state.naturalDisasterPreparedness = Utils.clamp(
          (civ.state.naturalDisasterPreparedness ?? 20) + gain * 0.5, 0, 100);
        const yrBC = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrBC, '🏗️ Building Code Reform',
          `Building codes modernized. Preparedness +${gain}. Japan model: strict codes save lives.`, 'building_code_reform');
        this.game.ui?.showNotification(`🏗️ ${civ.name}: Building codes improved (+${gain})`, 'success');
        continue;
      } else if (event.type === 'desalination_plant') {
        // Feature 9: Water infrastructure
        const techDS = civ.state.technologyLevel ?? 1;
        if (techDS < 5) {
          this.game.ui?.showNotification(`🚰 ${civ.name}: Requires technology level ≥ 5`, 'warning');
          continue;
        }
        const capDS = civ.state.stateCapacity ?? 50;
        const waterGain = Math.round(8 * Math.max(0.3, capDS / 50));
        if (civ.state.resourceDepletion) {
          civ.state.resourceDepletion.water = Utils.clamp(
            (civ.state.resourceDepletion.water ?? 50) + waterGain, 0, 100);
        }
        const yrDS = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrDS, '🚰 Desalination Infrastructure',
          `Desalination plants built. Water supply +${waterGain}. Israel/Saudi model.`, 'desalination');
        this.game.ui?.showNotification(`🚰 ${civ.name}: Water +${waterGain}`, 'success');
        continue;
      } else if (event.type === 'implement_austerity') {
        // Feature 2: Sovereign debt austerity
        civ.state.austerityLevel = Utils.clamp((civ.state.austerityLevel ?? 0) + 30, 0, 100);
        const yrAust = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yrAust, '📊 Austerity Measures Imposed',
          `Government spending cut. Debt reduction accelerated but wellbeing will suffer.`, 'austerity');
        this.game.ui?.showNotification(`📊 ${civ.name}: Austerity imposed (+30)`, 'warning');
        continue;
      } else if (event.type === 'declare_default') {
        // Feature 2: Sovereign default
        civ.state.sovereignDebtRatio = Utils.clamp((civ.state.sovereignDebtRatio ?? 20) * 0.5, 0, 200);
        civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 50) - 15, 0, 100);
        civ.state.tradeDependency = Utils.clamp((civ.state.tradeDependency ?? 20) - 15, 0, 100);
        civ.state.lastDefaultYear = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '📉 Sovereign Default',
          `${civ.name} defaults on sovereign debt. Trust and trade devastated.`, 'default');
        this.game.ui?.showNotification(`📉 ${civ.name}: Sovereign default — debt halved but trust destroyed`, 'warning');
        continue;
      } else if (event.type === 'fund_public_broadcasting') {
        // Feature 3: Public broadcasting
        const capPB = civ.state.stateCapacity ?? 50;
        const pbGain = Math.round(15 * Math.max(0.3, capPB / 50));
        civ.state.publicBroadcasting = Utils.clamp((civ.state.publicBroadcasting ?? 0) + pbGain, 0, 100);
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '📺 Public Broadcasting Funded',
          `National broadcasting service established. Social cohesion boosted. BBC/NHK model.`, 'media');
        this.game.ui?.showNotification(`📺 ${civ.name}: Public broadcasting +${pbGain}`, 'success');
        continue;
      } else if (event.type === 'media_literacy_curriculum') {
        // Feature 3: Media literacy
        const educML = civ.state.educationQuality ?? 50;
        if (educML < 40) {
          this.game.ui?.showNotification(`📖 ${civ.name}: Requires education quality ≥ 40`, 'warning');
          continue;
        }
        const mlGain = Math.round(12 * Math.max(0.3, educML / 50));
        civ.state.mediaLiteracy = Utils.clamp((civ.state.mediaLiteracy ?? 30) + mlGain, 0, 100);
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '📖 Media Literacy Curriculum',
          `Critical thinking and media analysis added to education. Finland model.`, 'media');
        this.game.ui?.showNotification(`📖 ${civ.name}: Media literacy +${mlGain}`, 'success');
        continue;
      } else if (event.type === 'press_freedom_protections') {
        // Feature 3: Press freedom
        const iqPF = civ.state.institutionalQuality ?? 50;
        if (iqPF < 40) {
          this.game.ui?.showNotification(`📰 ${civ.name}: Requires institutional quality ≥ 40`, 'warning');
          continue;
        }
        civ.state.pressFreedom = Utils.clamp((civ.state.pressFreedom ?? 50) + 12, 0, 100);
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '📰 Press Freedom Protections',
          `Constitutional and legal protections for journalists enacted.`, 'media');
        this.game.ui?.showNotification(`📰 ${civ.name}: Press freedom +12`, 'success');
        continue;
      } else if (event.type === 'war_on_drugs') {
        // Feature 4: Drug policy
        civ.state.addictionResponse = 'war_on_drugs';
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '🚔 War on Drugs Declared',
          `Prohibition and enforcement approach to addiction. High cost, mixed results.`, 'drug_policy');
        this.game.ui?.showNotification(`🚔 ${civ.name}: War on drugs declared`, 'info');
        continue;
      } else if (event.type === 'decriminalize_treat') {
        // Feature 4: Portugal model
        civ.state.addictionResponse = 'decriminalization';
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '💊 Decriminalization & Treatment',
          `Drug use decriminalized; healthcare-based treatment. Portugal model.`, 'drug_policy');
        this.game.ui?.showNotification(`💊 ${civ.name}: Decriminalization + treatment adopted`, 'info');
        continue;
      } else if (event.type === 'harm_reduction') {
        // Feature 4: Harm reduction
        civ.state.addictionResponse = 'harm_reduction';
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '🏥 Harm Reduction Programs',
          `Safe injection sites, needle exchanges, and support services. Swiss/Dutch model.`, 'drug_policy');
        this.game.ui?.showNotification(`🏥 ${civ.name}: Harm reduction programs launched`, 'info');
        continue;
      } else if (event.type === 'launch_space_program') {
        // Feature 6: Space program
        if ((civ.state.technologyLevel ?? 1) < 6) {
          this.game.ui?.showNotification(`🚀 ${civ.name}: Requires technology level ≥ 6`, 'warning');
          continue;
        }
        const sp = civ.state.spaceProgram ?? {};
        sp.active = true;
        sp.investmentLevel = 50;
        sp.achievements = sp.achievements || [];
        civ.state.spaceProgram = sp;
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '🚀 Space Program Launched',
          `${civ.name} establishes national space program. STEM education and innovation expected to benefit.`, 'space');
        this.game.ui?.showNotification(`🚀 ${civ.name}: Space program launched!`, 'success');
        continue;
      } else if (event.type === 'increase_space_investment') {
        const spI = civ.state.spaceProgram ?? {};
        spI.investmentLevel = Utils.clamp((spI.investmentLevel ?? 0) + 20, 0, 100);
        civ.state.spaceProgram = spI;
        this.game.ui?.showNotification(`🚀 ${civ.name}: Space investment increased to ${spI.investmentLevel}`, 'info');
        continue;
      } else if (event.type === 'suppress_schism') {
        // Feature 7: Schism resolution
        civ.state.schismResolution = 'suppression';
        this.game.ui?.showNotification(`⚔️ ${civ.name}: Dissent suppression ordered`, 'warning');
        continue;
      } else if (event.type === 'accommodate_schism') {
        civ.state.schismResolution = 'accommodation';
        this.game.ui?.showNotification(`🤝 ${civ.name}: Accommodation of dissenters begun`, 'info');
        continue;
      } else if (event.type === 'allow_reformation') {
        civ.state.schismResolution = 'reformation';
        this.game.ui?.showNotification(`🔄 ${civ.name}: Reformation allowed to proceed`, 'info');
        continue;
      } else if (event.type === 'engage_diaspora') {
        // Feature 8: Diaspora engagement
        civ.state.remittanceInflow = Utils.clamp((civ.state.remittanceInflow ?? 0) + 10, 0, 100);
        civ.addHistoryEntry(this.game?.currentYear ?? 0, '🌍 Diaspora Engagement Program',
          `Outreach to overseas communities. Remittances and knowledge transfer boosted.`, 'diaspora');
        this.game.ui?.showNotification(`🌍 ${civ.name}: Diaspora engagement boosted`, 'success');
        continue;
      } else if (event.type === 'propose_water_treaty') {
        // Feature 9: Water treaty (with all neighbors)
        const civsPWT = this.game.civilizations.filter(c => c.id !== civ.id && c.state);
        const treatyStatus = civ.state.waterTreatyStatus ?? {};
        let treated = 0;
        for (const other of civsPWT) {
          if (!treatyStatus[other.id] || treatyStatus[other.id] === 'none') {
            treatyStatus[other.id] = 'negotiating';
            treated++;
          }
        }
        civ.state.waterTreatyStatus = treatyStatus;
        if (treated > 0) {
          civ.addHistoryEntry(this.game?.currentYear ?? 0, '💧 Water Treaty Proposed',
            `${civ.name} proposes water-sharing agreements with ${treated} neighbors.`, 'water_treaty');
          this.game.ui?.showNotification(`💧 ${civ.name}: Water treaties proposed with ${treated} neighbors`, 'info');
        }
        continue;

      } else if (event.type === 'set_resource_strategy') {
        civ.state.resourceStrategy = event.strategy ?? civ.state.resourceStrategy;
        const rsStrat = RESOURCE_STRATEGIES.find(s => s.id === civ.state.resourceStrategy);
        const rsYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(rsYr, `🌿 Resource Strategy: ${rsStrat?.label ?? civ.state.resourceStrategy}`,
          `Resource extraction strategy set to ${rsStrat?.label ?? civ.state.resourceStrategy}.`, 'set_resource_strategy');
        this.game.ui?.showNotification(`🌿 ${civ.name}: Resources → ${rsStrat?.label ?? civ.state.resourceStrategy}`, 'info');
        continue;
      } else if (event.type === 'set_obsolescence_model') {
        civ.state.obsolescenceModel = event.model ?? civ.state.obsolescenceModel;
        const obsM = OBSOLESCENCE_MODELS.find(o => o.id === civ.state.obsolescenceModel);
        const obsYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(obsYr, `🔄 Obsolescence: ${obsM?.label ?? civ.state.obsolescenceModel}`,
          `Product obsolescence model set to ${obsM?.label ?? civ.state.obsolescenceModel}.`, 'set_obsolescence_model');
        this.game.ui?.showNotification(`🔄 ${civ.name}: Obsolescence → ${obsM?.label ?? civ.state.obsolescenceModel}`, 'info');
        continue;
      } else if (event.type === 'set_information_ecosystem') {
        civ.state.informationEcosystem = event.ecosystem ?? civ.state.informationEcosystem;
        const infoT = INFORMATION_ECOSYSTEM_TYPES.find(t => t.id === civ.state.informationEcosystem);
        const infoYr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(infoYr, `📺 Information: ${infoT?.label ?? civ.state.informationEcosystem}`,
          `Information ecosystem set to ${infoT?.label ?? civ.state.informationEcosystem}.`, 'set_information_ecosystem');
        this.game.ui?.showNotification(`📺 ${civ.name}: Info → ${infoT?.label ?? civ.state.informationEcosystem}`, 'info');
        continue;
      } else if (event.type === 'set_susceptibility_model') {
        const susM = (typeof SUSCEPTIBILITY_MODELS !== 'undefined')
          ? SUSCEPTIBILITY_MODELS.find(m => m.id === event.model) : null;
        if (susM) {
          civ.state.susceptibilityModel  = susM.id;
          civ.state._susceptibilitySigma = susM.sigma;
        }
        continue;
      } else if (event.type === 'player_gov_paradigm_shift') {
        const targetGov = event.value;
        if (targetGov && civ.governance) {
          const prevGov = civ.governance.modelId;
          civ.governance.modelId = targetGov;
          // Adjust hierarchyLevel toward the new model's typical level
          const GOV_HIERARCHY = { autocratic: 85, theocratic: 80, shadow_government_covert: 78,
            oligarchy: 70, shadow_government_complicit: 72, tribal_chief: 65,
            elder_council: 55, representative: 45, none: 40, rotating: 28,
            direct_congress: 30, flat_consensus: 20 };
          if (GOV_HIERARCHY[targetGov] !== undefined) {
            civ.governance.hierarchyLevel = GOV_HIERARCHY[targetGov];
          }
          const yr = this.game?.currentYear ?? 0;
          civ.addHistoryEntry(yr, `🏛️ Governance Shift: ${prevGov} → ${targetGov}`,
            `Governance paradigm shifted from ${prevGov} to ${targetGov}.`, 'player_gov_paradigm_shift');
          this.game.ui?.showNotification(`🏛️ Governance shift: ${prevGov} → ${targetGov}`, 'info');
        }
        continue;
      } else if (event.type === 'player_econ_paradigm_shift') {
        const targetEcon = event.value;
        if (targetEcon && civ.governance) {
          const prevEcon = civ.governance.economicModelId ?? civ.state.economicModel ?? '?';
          // Update economic model — store on governance if that field exists, else on state
          if (civ.governance.economicModelId !== undefined) {
            civ.governance.economicModelId = targetEcon;
          } else {
            civ.state.economicModel = targetEcon;
          }
          const yr = this.game?.currentYear ?? 0;
          civ.addHistoryEntry(yr, `💰 Economic Shift: ${prevEcon} → ${targetEcon}`,
            `Economic paradigm shifted from ${prevEcon} to ${targetEcon}.`, 'player_econ_paradigm_shift');
          this.game.ui?.showNotification(`💰 Economic shift: ${prevEcon} → ${targetEcon}`, 'info');
        }
        continue;
      // Pass 8: Facilitation measure activation / deactivation
      } else if (event.type === 'activate_facilitation_measure') {
        const measureId = event.measureId;
        if (measureId) {
          const ok = this.activateFacilitationMeasure(civ, measureId);
          if (ok) {
            const catalog = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];
            const def = catalog.find(m => m.id === measureId);
            this.game.ui?.showNotification(`🎓 ${def?.label ?? measureId} activated`, 'info');
          }
        }
        continue;
      } else if (event.type === 'deactivate_facilitation_measure') {
        const measureId = event.measureId;
        if (measureId) {
          this.deactivateFacilitationMeasure(civ, measureId);
          const catalog = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];
          const def = catalog.find(m => m.id === measureId);
          this.game.ui?.showNotification(`⏹ ${def?.label ?? measureId} deactivated`, 'info');
        }
        continue;
      }

      if (event.type === 'disaster') {
        civ.applyEvent({
          ...event,
          year: this.game.currentYear,
          type: 'disaster',
        });
      } else if (event.type === 'technology') {
        const techData = this._findTechByName(event.techName);
        if (techData) civ.applyTechnology(techData);
      } else if (event.type === 'structural_movement') {
        civ.applyStructuralMovement({ ...event, year: this.game.currentYear });
      } else if (event.type === 'movement') {
        civ.applyMovement({ ...event, year: this.game.currentYear });
      } else if (event.type === 'resource') {
        this._introduceResource(civ, event);
      } else if (event.type === 'warming') {
        this.globalWarmingIndex = Utils.clamp(this.globalWarmingIndex + event.amount, 0, 100);
        this.game.map.applyGlobalWarming(this.globalWarmingIndex);
      } else if (event.type === 'new_religion') {
        if (civ.religionManager) {
          civ.religionManager.addReligion(event.religionConfig);
        }
      } else if (event.type === 'custom') {
        this._applyCustomEvent(civ, event);
      } else if (event.type === 'new_horizons') {
        this._applyHorizonEvent(civ, event);
      } else if (event.type === 'alien_signal' || event.type === 'alien_contact') {
        this._applyAlienContactEvent(civ, event);
      } else if (event.type === 'alien_response') {
        this._applyResponseProtocol(civ, event.protocol);
      } else if (event.type === 'extinction') {
        this._applyExtinctionEvent(civ, event);
      } else if (event.type === 'public_works') {
        this._applyPublicWorkEvent(civ, event);
      }

      const richDescription = this._generateEventEffectNarrative(event, civ);
      civ.addHistoryEntry(
        this.game.currentYear,
        event.label || event.title,
        richDescription,
        event.historyType || event.type
      );
    }
  }

  // ── Apply Custom User-Defined Event ──────────────────────────
  _applyCustomEvent(civ, event) {
    if (!civ.state) return;
    if (event.wellbeingChange) {
      civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + event.wellbeingChange, 0, 100);
    }
    if (event.equalityChange) {
      civ.state.equalityIndex = Utils.clamp(civ.state.equalityIndex + event.equalityChange, 0, 100);
    }
    if (event.populationChange) {
      civ.state.population = Math.max(10, Math.floor(civ.state.population * (1 + event.populationChange / 100)));
    }
    if (event.fertilityChange && event.fertilityChange !== 0) {
      const tiles = this.game.map ? this.game.map.getTilesForCiv(civ.id) : [];
      for (const tile of tiles) {
        tile.fertility = Utils.clamp(tile.fertility + event.fertilityChange / 10, 0, 12);
      }
    }
    if (event.behaviorModifiers) {
      for (const [key, val] of Object.entries(event.behaviorModifiers)) {
        if (civ.state.behaviorReinforcement[key] !== undefined) {
          civ.state.behaviorReinforcement[key] = Utils.clamp(
            civ.state.behaviorReinforcement[key] + val, 0, 100
          );
        }
      }
    }
  }

  // ── Apply New Horizons Event ──────────────────────────────────
  _applyHorizonEvent(civ, event) {
    const effects = event.effects || {};
    if (effects.innovationBoost) {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + effects.innovationBoost, 0, 100
      );
    }
    if (effects.wellbeingBoost) {
      civ.state.averageWellbeing = Utils.clamp(
        civ.state.averageWellbeing + effects.wellbeingBoost, 0, 100
      );
    }
    if (effects.fertilityBoost) {
      const tiles = this.game.map ? this.game.map.getTilesForCiv(civ.id) : [];
      // Apply fertility boost to a portion of tiles
      for (const tile of tiles.slice(0, Math.ceil(tiles.length * 0.3))) {
        tile.fertility = Utils.clamp(tile.fertility + effects.fertilityBoost / 10, 0, 12);
      }
    }
    if (effects.populationBoost) {
      civ.state.population = Math.max(10, Math.floor(
        civ.state.population * (1 + effects.populationBoost / 100)
      ));
    }
  }

  // ── Apply Alien Contact Event ─────────────────────────────────
  _applyAlienContactEvent(civ, event) {
    // Ensure alienContactState exists (defensive for old save games)
    if (!civ.state.alienContactState) {
      civ.state.alienContactState = { stage: 'none', protocol: null, relationshipScore: 50, turnsInContact: 0 };
    }
    const acs = civ.state.alienContactState;

    // Signal detection: boost innovation, slight stability dip from uncertainty
    if (event.type === 'alien_signal') {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + 8, 0, 100
      );
      civ.state.stabilityIndex = Utils.clamp(civ.state.stabilityIndex - 4, 0, 100);
      if (acs.stage === 'none') acs.stage = 'signal';
    }
    // Confirmed contact: larger innovation boost, wellbeing disruption, stability impact
    if (event.type === 'alien_contact') {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + 20, 0, 100
      );
      civ.state.stabilityIndex = Utils.clamp(civ.state.stabilityIndex - 10, 0, 100);
      // Wellbeing impact varies by cooperation level
      const coop = civ.state.behaviorReinforcement.cooperation || 50;
      const wbDelta = coop > 65 ? +5 : coop < 35 ? -8 : -3;
      civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + wbDelta, 0, 100);
      if (acs.stage === 'signal' || acs.stage === 'none') acs.stage = 'confirmed';
    }
  }

  // ── Apply Response Protocol Effects ──────────────────────────
  _applyResponseProtocol(civ, protocol) {
    const EFFECTS = {
      alien_response_open:       { innovationBoost: 15, cooperationBoost: 12, stabilityDelta: -8,  wellbeingDelta: +6  },
      alien_response_study:      { innovationBoost: 20, cooperationBoost:  5, stabilityDelta: -3,  wellbeingDelta: +2  },
      alien_response_quarantine: { innovationBoost:  5, cooperationBoost: -8, stabilityDelta: +5,  wellbeingDelta: -4  },
      alien_response_military:   { innovationBoost:  8, cooperationBoost:-12, stabilityDelta: +4,  wellbeingDelta: -8  },
      alien_response_diplomatic: { innovationBoost: 10, cooperationBoost:  8, stabilityDelta: -2,  wellbeingDelta: +4  },
    };
    const fx = EFFECTS[protocol] || {};
    const b  = civ.state.behaviorReinforcement;
    if (fx.innovationBoost)  b.innovation  = Utils.clamp((b.innovation  || 50) + fx.innovationBoost,  0, 100);
    if (fx.cooperationBoost) b.cooperation = Utils.clamp((b.cooperation || 50) + fx.cooperationBoost, 0, 100);
    if (fx.stabilityDelta)   civ.state.stabilityIndex    = Utils.clamp(civ.state.stabilityIndex    + fx.stabilityDelta,  0, 100);
    if (fx.wellbeingDelta)   civ.state.averageWellbeing  = Utils.clamp(civ.state.averageWellbeing  + fx.wellbeingDelta,  0, 100);

    // Advance alien contact state to 'ongoing' and record protocol
    if (!civ.state.alienContactState) {
      civ.state.alienContactState = { stage: 'none', protocol: null, relationshipScore: 50, turnsInContact: 0 };
    }
    const acs = civ.state.alienContactState;
    acs.protocol = protocol;
    acs.stage = 'ongoing';
    // Starting relationship score influenced slightly by protocol
    const STARTING_SCORES = {
      alien_response_open:       60,
      alien_response_diplomatic: 58,
      alien_response_study:      55,
      alien_response_quarantine: 45,
      alien_response_military:   40,
    };
    acs.relationshipScore = STARTING_SCORES[protocol] || 50;
    acs.turnsInContact = 0;
  }

  // ── Apply Extinction-Level Event Effects ──────────────────────
  // ── Alien Contact: tick relationship score each turn ─────────
  _tickAlienRelationship(civ) {
    const acs = civ.state?.alienContactState;
    if (!acs || acs.stage !== 'ongoing') return;

    // Drift rates per protocol (positive = improving, negative = deteriorating)
    const DRIFT = {
      alien_response_open:       +2,
      alien_response_diplomatic: +2,
      alien_response_study:      +1,
      alien_response_quarantine: -1,
      alien_response_military:   -3,
    };
    const drift = DRIFT[acs.protocol] || 0;
    const prevScore = acs.relationshipScore;
    acs.relationshipScore = Utils.clamp(acs.relationshipScore + drift, 0, 100);
    acs.turnsInContact++;

    const PROTOCOL_NAMES = {
      alien_response_open:       'Open Contact protocol',
      alien_response_diplomatic: 'Diplomatic Outreach protocol',
      alien_response_study:      'Scientific Study protocol',
      alien_response_quarantine: 'Information Quarantine',
      alien_response_military:   'Military Response Posture',
    };
    const protocolName = PROTOCOL_NAMES[acs.protocol] || 'the current protocol';
    const turns = acs.turnsInContact;
    const yr = this.game.currentYear;

    // ── Milestone: Warm (score crosses 75 upward) ──────────────
    if (acs.relationshipScore >= 75 && prevScore < 75) {
      this.game.ui?.showNotification(`🛸 Alien relationship with ${civ.name} has reached Warm — something like trust may be forming.`);
      civ.addHistoryEntry(yr,
        'Alien Relationship — Warming',
        `After ${turns} turn${turns === 1 ? '' : 's'} of contact under the ${protocolName}, the relationship with the unknown intelligence has entered warmer territory. Communication patterns have shifted — signals received are more frequent, more structured, or otherwise different in character from earlier exchanges. Whether this constitutes what any human framework would call goodwill remains unknowable. But the trajectory is upward.`,
        'alien_contact'
      );
    }

    // ── Milestone: Strained (score crosses 35 downward) ────────
    if (acs.relationshipScore <= 35 && prevScore > 35) {
      this.game.ui?.showNotification(`⚠️ Alien relationship with ${civ.name} has become strained.`);
      civ.addHistoryEntry(yr,
        'Alien Relationship — Strained',
        `After ${turns} turn${turns === 1 ? '' : 's'} of contact, the relationship with the unknown intelligence has entered strained territory. Under the ${protocolName}, the signals received have changed character — less frequent, differently structured, or carrying something that registers, by whatever indirect measure is available, as distance or dissatisfaction. Whether the current approach should be reconsidered is now an active question.`,
        'alien_contact'
      );
    }

    // ── Milestone: Hostile (score crosses 20 downward) ─────────
    if (acs.relationshipScore <= 20 && prevScore > 20) {
      this.game.ui?.showNotification(`⚠️ Alien relationship with ${civ.name} has deteriorated to Hostile territory.`);
      civ.addHistoryEntry(yr,
        'Alien Relationship — Hostile',
        `The relationship with the unknown intelligence has deteriorated to what can only be described as hostile or indifferent territory. ${turns} turn${turns === 1 ? '' : 's'} in, the ${protocolName} appears to have generated a sustained negative response. Whether the intelligence is capable of something analogous to hostility, or whether this reflects a fundamental incompatibility in communication frameworks, is unknown. The consequences of continued deterioration are not.`,
        'alien_contact'
      );
    }

    // ── Milestone: Recovering (score crosses 50 upward from below 35) ─
    if (acs.relationshipScore >= 55 && prevScore < 55 && prevScore <= 35) {
      this.game.ui?.showNotification(`🛸 Alien relationship with ${civ.name} appears to be recovering.`);
      civ.addHistoryEntry(yr,
        'Alien Relationship — Recovering',
        `After a period of strain, the relationship with the unknown intelligence appears to be recovering. ${turns} turn${turns === 1 ? '' : 's'} in, the trajectory under the ${protocolName} has shifted upward. This may reflect something like patience on their part, or a reassessment of what our signals mean. It is, cautiously, a better situation than it was.`,
        'alien_contact'
      );
    }

    // ── Communication Attempts (every 6 turns) ─────────────────
    // Structured attempts to exchange meaning — not just signal but message.
    // Success probability scales with relationship score. Outcomes shift the
    // score modestly and generate history entries.
    if (acs.lastCommTurn === undefined) acs.lastCommTurn = 0;
    if (turns > 0 && turns - acs.lastCommTurn >= 6) {
      acs.lastCommTurn = turns;
      const rel = acs.relationshipScore;
      const successChance = 0.25 + (rel / 143); // ~25% at rel=0, ~95% at rel=100
      if (Utils.random() < successChance) {
        // Successful exchange
        const boost = Math.max(2, Math.round(2 + rel / 25)); // +2 to +6
        acs.relationshipScore = Utils.clamp(acs.relationshipScore + boost, 0, 100);
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          (civ.state.behaviorReinforcement.innovation || 50) + 3, 0, 100
        );
        acs.lastCommResult = 'success';
        const commSuccessTexts = [
          `A structured communication attempt produced what analysts describe as a clear, deliberate response — not random noise, not a repeat of earlier signals, but something new. Interpretation remains speculative, but the exchange registered as meaningful. The relationship appears to have strengthened slightly.`,
          `The exchange lasted longer than any previous attempt. What was received could not be decoded in any conventional sense, but its internal structure was consistent — a kind of grammar, perhaps, or a mathematical regularity that suggests intent. Innovation researchers are already working to extract usable patterns.`,
          `This attempt produced a response that arrived within a timeframe suggesting it was expected — as if they had been waiting for it. The signal architecture was different from anything received before: more layered, more complex. It was not understood. But it was received.`,
        ];
        civ.addHistoryEntry(yr,
          'Communication Attempt — Response Received',
          commSuccessTexts[Math.floor(Utils.random() * commSuccessTexts.length)],
          'alien_contact'
        );
        this.game.ui?.showNotification(`📡 ${civ.name}: Alien communication attempt produced a response.`);
      } else {
        // Failed / no response
        const penalty = Math.max(1, Math.round(1 + (100 - rel) / 40)); // +1 to +3 penalty
        acs.relationshipScore = Utils.clamp(acs.relationshipScore - penalty, 0, 100);
        acs.lastCommResult = 'failure';
        const commFailTexts = [
          `The communication attempt produced no detectable response. Whether the signal was received and ignored, received and incomprehensible, or simply lost, cannot be determined. The silence is harder to interpret than any reply would have been.`,
          `The attempt was sent. Nothing came back within the window analysts had established for expecting a reply. This is not the first silence — but under the current relationship conditions, each one carries more weight than the last.`,
          `Analysts report that the structure of today's outgoing communication may have been malformed — a grammar error in the framework being used to encode intent. If so, they received something that made no sense. If not, the silence is unexplained.`,
        ];
        civ.addHistoryEntry(yr,
          'Communication Attempt — No Response',
          commFailTexts[Math.floor(Utils.random() * commFailTexts.length)],
          'alien_contact'
        );
        this.game.ui?.showNotification(`📡 ${civ.name}: Alien communication attempt received no response.`);
      }
    }

    // ── Breakthrough Events (relationship ≥ 65, ~8% per turn) ──
    // Positive exchanges that transfer something of concrete value —
    // technological, navigational, cultural, or ecological.
    if (acs.breakthroughCount === undefined) acs.breakthroughCount = 0;
    if (acs.relationshipScore >= 65 && Utils.random() < 0.08) {
      acs.breakthroughCount++;
      const b = civ.state.behaviorReinforcement;
      const breakthroughTypes = [
        {
          title: 'Alien Contact — Technology Glimpse',
          text: `Something arrived in the latest exchange that the research teams are calling a technology glimpse — a structured fragment that, while not directly interpretable, appears to encode a physical principle not currently in use. The innovation implications are significant, even if the mechanism remains opaque. This is the first time the contact has produced something that functions, in practical terms, as a gift.`,
          apply: () => { b.innovation = Utils.clamp((b.innovation || 50) + 18, 0, 100); },
          note: '🛸 Alien contact: technology glimpse received by',
        },
        {
          title: 'Alien Contact — Cultural Exchange',
          text: `The exchange this turn carried something that resisted scientific classification — patterns, rhythms, structured sequences that researchers describe as aesthetic or cultural rather than informational. The effect on those studying it has been measurable: something about the encounter has deepened a sense of shared strangeness between people working on the contact problem. Cooperation and social cohesion have improved.`,
          apply: () => {
            b.cooperation = Utils.clamp((b.cooperation || 50) + 12, 0, 100);
            civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + 6, 0, 100);
          },
          note: '🛸 Alien contact: cultural exchange received by',
        },
        {
          title: 'Alien Contact — Resource Indication',
          text: `The signal contained what analysts, after extended study, believe to be navigational or geological data — structured references to locations or conditions in the physical world. Acting on the indicated coordinates has revealed resource concentrations or ecological conditions not previously known. The intended meaning of the communication remains unclear. Its material effect does not.`,
          apply: () => {
            if (civ.state.resourceAbundance !== undefined)
              civ.state.resourceAbundance = Utils.clamp(civ.state.resourceAbundance + 15, 0, 100);
          },
          note: '🛸 Alien contact: resource indication received by',
        },
        {
          title: 'Alien Contact — Stability Signal',
          text: `What arrived in this exchange is being described, cautiously, as reassurance — a structured pattern that appears, by multiple independent readings, to carry something like intent toward de-escalation or clarity. The effect on public stability has been notable: whatever anxieties surrounded the contact have, temporarily, eased. The institutions managing the relationship have gained credibility from the apparent positive signal.`,
          apply: () => { civ.state.stabilityIndex = Utils.clamp(civ.state.stabilityIndex + 10, 0, 100); },
          note: '🛸 Alien contact: stabilising signal received by',
        },
      ];
      const bt = breakthroughTypes[Math.floor(Utils.random() * breakthroughTypes.length)];
      bt.apply();
      civ.addHistoryEntry(yr, bt.title, bt.text, 'alien_contact');
      this.game.ui?.showNotification(`${bt.note} ${civ.name}!`);
    }

    // ── Breakdown Events (relationship ≤ 25, ~12% per turn) ────
    // Alarming developments when the relationship is in dangerous territory.
    if (acs.breakdownCount === undefined) acs.breakdownCount = 0;
    if (acs.relationshipScore <= 25 && acs.relationshipScore > 0 && Utils.random() < 0.12) {
      acs.breakdownCount++;
      const b = civ.state.behaviorReinforcement;
      const breakdownTypes = [
        {
          title: 'Alien Contact — Hostile Signal Received',
          text: `The signal received this period carried a structural character that every analysis team, independently, describes the same way: hostile intent. Not incomprehension. Not noise. Something actively negative in its patterning. The effect on public stability and wellbeing has been immediate. The governing institutions are under pressure to respond differently — or to respond at all.`,
          apply: () => {
            civ.state.stabilityIndex   = Utils.clamp(civ.state.stabilityIndex   - 12, 0, 100);
            civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing  - 8,  0, 100);
          },
          note: '⚠️ Alien contact: hostile signal received by',
        },
        {
          title: 'Alien Contact — Communication Breakdown',
          text: `Contact has gone silent. Not a failed attempt — a cessation. Whatever communication framework had developed over the previous exchanges has, this period, produced nothing. The silence is qualitatively different from the gaps between normal exchanges. Analysts disagree on whether this represents a deliberate withdrawal, a systemic incompatibility, or something stranger. The relationship score has dropped.`,
          apply: () => { acs.relationshipScore = Utils.clamp(acs.relationshipScore - 8, 0, 100); },
          note: '⚠️ Alien contact: communication breakdown with',
        },
        {
          title: 'Alien Contact — Destabilising Transmission',
          text: `The signal received could not be processed through normal channels without significant side effects. Personnel working on decryption reported cognitive and emotional disturbance — not physically measurable, but consistent and disturbing in description. Whether this was intentional — a kind of attack — or an incompatibility between their communication mode and human cognition, is unknown. The effect on social cohesion has been real.`,
          apply: () => {
            b.cooperation = Utils.clamp((b.cooperation || 50) - 10, 0, 100);
            civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - 6, 0, 100);
          },
          note: '⚠️ Alien contact: destabilising transmission received by',
        },
      ];
      const bd = breakdownTypes[Math.floor(Utils.random() * breakdownTypes.length)];
      bd.apply();
      civ.addHistoryEntry(yr, bd.title, bd.text, 'alien_contact');
      this.game.ui?.showNotification(`${bd.note} ${civ.name}.`);
    }

    // ── Contact Ending (relationship reaches 0) ─────────────────
    if (acs.relationshipScore === 0 && prevScore > 0) {
      acs.stage = 'ended_hostile';
      civ.state.stabilityIndex   = Utils.clamp(civ.state.stabilityIndex   - 15, 0, 100);
      civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing  - 10, 0, 100);
      civ.addHistoryEntry(yr,
        'Alien Contact — Hostile Withdrawal',
        `Contact with the unknown intelligence has ended. The final signals received carried unmistakable negative valence — not silence, but something that functioned, in every framework analysts could apply, as a closing. What was communicated in the last exchanges is unknown. What it meant is being debated. What follows is unknown. The ${turns}-turn period of contact — under the ${protocolName}, which ends now — leaves ${civ.name} in the position of having been in the most significant communication in the history of the species, and of having lost it. The civilizational implications will take generations to fully absorb.`,
        'alien_contact'
      );
      this.game.ui?.showNotification(`⚠️ Alien contact with ${civ.name} has ended in hostile withdrawal.`);
    }
  }

  // ── Apply Protocol Switch ──────────────────────────────────────
  // Called when the player changes response protocol during ongoing contact.
  _applyProtocolSwitch(civ, newProtocolId) {
    if (!civ.state.alienContactState) return;
    const acs = civ.state.alienContactState;
    if (acs.stage !== 'ongoing') return;

    const oldProtocolId = acs.protocol;
    if (oldProtocolId === newProtocolId) return;

    // Relationship delta: switching toward more aggressive protocols costs relationship;
    // switching toward openness earns a small bonus. Aggressiveness index (0=most open).
    const AGGRESSION = {
      alien_response_open:       4,
      alien_response_diplomatic: 3,
      alien_response_study:      2,
      alien_response_quarantine: 1,
      alien_response_military:   0,
    };
    const oldAgg = AGGRESSION[oldProtocolId] ?? 2;
    const newAgg = AGGRESSION[newProtocolId] ?? 2;
    const relDelta = (newAgg - oldAgg) * 4; // -16 to +16

    acs.relationshipScore = Utils.clamp(acs.relationshipScore + relDelta, 0, 100);
    acs.protocol = newProtocolId;

    const PROTOCOL_NAMES = {
      alien_response_open:       'Open Contact',
      alien_response_diplomatic: 'Diplomatic Outreach',
      alien_response_study:      'Scientific Study',
      alien_response_quarantine: 'Information Quarantine',
      alien_response_military:   'Military Response Posture',
    };
    const oldName = PROTOCOL_NAMES[oldProtocolId] || oldProtocolId;
    const newName = PROTOCOL_NAMES[newProtocolId] || newProtocolId;
    const yr = this.game.currentYear;
    const turns = acs.turnsInContact;

    const directionNote = relDelta > 0
      ? `The shift toward ${newName} — perceived as less threatening or more reciprocal — appears to have registered positively. Relationship indicators have improved slightly.`
      : relDelta < 0
        ? `The shift toward ${newName} — perceived as more guarded or adversarial — does not appear to have gone unnoticed. Relationship indicators have dipped.`
        : `The shift from ${oldName} to ${newName} has been registered. Its effect on the relationship is, so far, neutral.`;

    civ.addHistoryEntry(yr,
      `Response Protocol Changed — ${newName}`,
      `After ${turns} turn${turns === 1 ? '' : 's'} under the ${oldName} protocol, ${civ.name} has switched to ${newName}. ${directionNote} The drift rate of the relationship will now follow the new protocol's trajectory.`,
      'alien_contact'
    );
    this.game.ui?.showNotification(`📋 ${civ.name} has switched to ${newName} protocol.`);
  }

  // ── Inter-civilization Plague Spread ──────────────────────────
  // Called each turn for each civ. Detects active plagues in neighboring
  // civs, gives 3 turns for a response to be chosen, then resolves spread.
  _tickPlagueSpread(civ, allCivs) {
    if (!civ.state.plagueResponses) civ.state.plagueResponses = {};
    const yr = this.game.currentYear;

    for (const other of allCivs) {
      if (other.id === civ.id) continue;

      // Check if this neighboring civ had a plague in the last 20 history entries
      const recentPlague = other.history.slice(-20).some(h =>
        h.type === 'extinction_plague' || h.historyType === 'extinction_plague'
      );

      // Clean up resolved entries once the plague is no longer recent
      if (!recentPlague) {
        if (civ.state.plagueResponses[other.id]) delete civ.state.plagueResponses[other.id];
        continue;
      }

      // Skip if this civ already had a plague recently (can't spread twice)
      const alreadyPlagued = civ.history.slice(-8).some(h =>
        h.type === 'extinction_plague' || h.historyType === 'extinction_plague'
      );
      if (alreadyPlagued) continue;

      // First detection: create a response entry and notify
      if (!civ.state.plagueResponses[other.id]) {
        civ.state.plagueResponses[other.id] = {
          response: null,          // null = undecided
          turnsWaited: 0,
          affectedCivName: other.name,
        };
        this.game.ui?.showNotification(`☠️ Plague reported in ${other.name}! Choose ${civ.name}'s response.`);
      }

      const prs = civ.state.plagueResponses[other.id];
      if (prs.response === 'resolved') continue;

      prs.turnsWaited = (prs.turnsWaited || 0) + 1;

      // Resolve after 3 turns — whatever response is set (or 'ignore') is used
      if (prs.turnsWaited >= 3) {
        const finalResponse = prs.response || 'ignore';
        this._resolvePlagueSpread(civ, other, finalResponse, yr);
        prs.response = 'resolved';
      }
    }
  }

  // ── Resolve plague spread for one civ pair ────────────────────
  // Applies response stat effects once and rolls for spread.
  _resolvePlagueSpread(civ, affectedCiv, response, yr) {
    const b = civ.state.behaviorReinforcement;
    const techLvl = civ.techLevel || 1;

    // One-time stat effects of the chosen response
    const RESPONSE_FX = {
      quarantine: { stabilityDelta: +6,  cooperationDelta: -8                          },
      aid:        { stabilityDelta: -3,  cooperationDelta: +6,  wellbeingDelta: -2     },
      refugees:   { cooperationDelta: +10, wellbeingDelta: -4,                         },
      ignore:     {},
    };
    const fx = RESPONSE_FX[response] || {};
    if (fx.stabilityDelta)   civ.state.stabilityIndex   = Utils.clamp(civ.state.stabilityIndex   + fx.stabilityDelta,   0, 100);
    if (fx.wellbeingDelta)   civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + fx.wellbeingDelta,   0, 100);
    if (fx.cooperationDelta) b.cooperation = Utils.clamp((b.cooperation || 50) + fx.cooperationDelta, 0, 100);

    // History entry for non-ignore responses
    const RESPONSE_TITLES = {
      quarantine: `Plague Response — Border Quarantine Implemented`,
      aid:        `Plague Response — Aid Dispatched to ${affectedCiv.name}`,
      refugees:   `Plague Response — Refugees Accepted from ${affectedCiv.name}`,
    };
    const RESPONSE_DESCS = {
      quarantine: `${civ.name} has implemented strict border controls and movement restrictions in response to the catastrophic pandemic in ${affectedCiv.name}. Trade and travel have been suspended. The measures impose real costs on economic cohesion, but the population's sense of protection is measurable.`,
      aid:        `${civ.name} has dispatched medical personnel, supplies, and resources to ${affectedCiv.name} in response to its pandemic crisis. The decision carries domestic costs — resources diverted, personnel put at risk — but the civic engagement around the effort has strengthened social cohesion.`,
      refugees:   `${civ.name} has opened its borders to refugees fleeing the devastation in ${affectedCiv.name}. The decision has drawn widespread public support, alongside significant concern about the risk of contagion crossing with the displaced population.`,
    };
    if (response !== 'ignore' && RESPONSE_TITLES[response]) {
      civ.addHistoryEntry(yr, RESPONSE_TITLES[response], RESPONSE_DESCS[response], 'extinction_plague');
    }

    // Spread probability — scaled by tech era and response choice
    const BASE_SPREAD = techLvl <= 2 ? 0.05   // near-zero: limited travel, isolated bands
                      : techLvl <= 5 ? 0.25   // trade routes: significant spread risk
                      : techLvl <= 8 ? 0.45   // industrial: rail, shipping, mass movement
                                     : 0.70;  // modern: air travel, near-certain without intervention
    const SPREAD_MULT = { quarantine: 0.22, aid: 0.82, refugees: 1.60, ignore: 1.0 };
    const spreadChance = Math.min(0.95, BASE_SPREAD * (SPREAD_MULT[response] || 1.0));

    if (Utils.random() < spreadChance) {
      // Spread! Apply slightly mitigated plague effects (secondary wave, not ground zero)
      this._applyExtinctionEvent(civ, {
        extinctionId: 'extinction_plague',
        effects: { stabilityDelta: -20, wellbeingDelta: -25, cooperationDelta: -12, innovationDelta: -6 },
      });
      const spreadRoute = techLvl <= 2 ? 'contact with travelers from the affected region'
                        : techLvl <= 5 ? 'trade networks and caravan routes'
                        : techLvl <= 8 ? 'rail and shipping connections'
                                       : 'air travel links that bypassed border controls';
      civ.addHistoryEntry(yr,
        `Plague Spreads from ${affectedCiv.name}`,
        `Despite ${response === 'quarantine' ? 'border quarantine measures' : response === 'aid' ? 'aid efforts focused on the source of the outbreak' : response === 'refugees' ? 'the arrival of refugees from the affected region' : 'the absence of formal containment measures'}, the pandemic devastating ${affectedCiv.name} has crossed into ${civ.name}. The pathogen arrived via ${spreadRoute} and has begun spreading through the population with the speed characteristic of this era.`,
        'extinction_plague'
      );
      this.game.ui?.showNotification(`☠️ Plague has spread from ${affectedCiv.name} to ${civ.name}!`);
    }
  }

  // ── Apply Extinction-Level Event Effects ──────────────────────
  // Applies both stat penalties AND survivor caps: even if penalties alone
  // don't drag stats below the survivor ceiling, the caps enforce a
  // "small groups of survivors rebuilding" state for the most severe events.
  _applyExtinctionEvent(civ, event) {
    if (!civ.state) return;
    const fx = event.effects || {};
    const b  = civ.state.behaviorReinforcement;

    // Apply raw deltas first
    if (fx.stabilityDelta)   civ.state.stabilityIndex   = Utils.clamp(civ.state.stabilityIndex   + fx.stabilityDelta,   0, 100);
    if (fx.wellbeingDelta)   civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + fx.wellbeingDelta,   0, 100);
    if (fx.innovationDelta)  b.innovation  = Utils.clamp((b.innovation  || 50) + fx.innovationDelta,  0, 100);
    if (fx.cooperationDelta) b.cooperation = Utils.clamp((b.cooperation || 50) + fx.cooperationDelta, 0, 100);
    if (fx.fertilityDelta && civ.state.resourceAbundance !== undefined) {
      civ.state.resourceAbundance = Utils.clamp(civ.state.resourceAbundance + fx.fertilityDelta, 0, 100);
    }

    // Survivor caps — enforce a civilizational floor regardless of prior stat heights.
    // The severity of the cap depends on the event type.
    // Nuclear winter and meteor impacts are the most severe (survivors in rubble);
    // pandemic and supervolcano are very severe; climate collapse is severe.
    const extinctionId = event.extinctionId || event.historyType || '';
    let stabCap, wbCap, innovCap, coopCap;
    if (extinctionId === 'extinction_nuclear' || extinctionId === 'extinction_meteor') {
      stabCap = 12; wbCap = 10; innovCap = 20; coopCap = 25;
    } else if (extinctionId === 'extinction_plague' || extinctionId === 'extinction_supervolcano') {
      stabCap = 18; wbCap = 15; innovCap = 30; coopCap = 30;
    } else if (extinctionId === 'extinction_ice_age') {
      // Ice ages are severe but slow — more a relentless grind than a single blow.
      // Fertility hits hardest; stability and wellbeing fall substantially but not to rubble.
      stabCap = 22; wbCap = 18; innovCap = 35; coopCap = 35;
    } else {
      // extinction_climate or generic
      stabCap = 25; wbCap = 20; innovCap = 35; coopCap = 35;
    }

    // Tech-level modifier: survivability is inversely related to infrastructure dependency.
    // Pre-agricultural survivors already possess all the skills they need day-to-day.
    // Agricultural societies retain practical knowledge but lose settled-life advantages.
    // Industrial and post-modern societies face the worst outcomes: their populations
    // depend on systems — supply chains, energy grids, digital infrastructure — that
    // will no longer exist. Most survivors will lack the knowledge to feed or shelter
    // themselves without rediscovery. Innovation caps fall hardest at high tech because
    // accumulated institutional knowledge (libraries, universities, the internet) is lost.
    //
    // Plague uses a separate tech multiplier because its dynamics differ from other
    // catastrophes. The general modifier rewards low-tech civs for infrastructure
    // independence — but for plague, isolation is the protective factor. Trade-route-era
    // civs (tech 3–5) face the worst plague outcomes: the same networks that built
    // civilisation carry disease everywhere, with no medicine or germ theory.
    // Modern civs (9–11) have guaranteed global spread but real countermeasures.
    const techLvl = civ.techLevel || 1;
    let techMult;
    if (extinctionId === 'extinction_plague') {
      techMult = techLvl <= 2 ? 1.60   // isolated bands — limited spread, practiced survival skills
               : techLvl <= 5 ? 0.70   // Black Death era — trade routes + zero countermeasures
               : techLvl <= 8 ? 0.88   // Spanish Flu era — industrial spread, limited medicine
                              : 0.92;  // Modern — global spread, but vaccines/medicine partially offset
    } else if (extinctionId === 'extinction_ice_age') {
      // Ice age survivability: pre-agricultural peoples are most resilient — they are
      // mobile, follow game southward, and their ancestors survived the last glacial
      // period exactly this way. Settled agricultural civs are hardest hit — fixed
      // fields fail, villages become untenable, and the skills needed to live nomadically
      // have been largely forgotten. Industrial and modern civs have technological buffers
      // (heating, food storage, greenhouse agriculture) but face massive displacement
      // and infrastructure strain as the cold advances.
      techMult = techLvl <= 2 ? 1.60   // mobile hunter-gatherers — climatically adapted, can follow resources
               : techLvl <= 5 ? 0.75   // settled agriculture collapses when fields fail
               : techLvl <= 8 ? 1.00   // industrial technology partially compensates
                              : 1.20;  // modern — heating, stored food, greenhouses buffer the worst
    } else {
      techMult = techLvl <= 2 ? 1.40   // pre-agricultural: skills are current and practiced
               : techLvl <= 5 ? 1.00   // agricultural: baseline
               : techLvl <= 8 ? 0.72   // industrial: deep infrastructure dependency
                              : 0.52;  // modern/post-modern: near-total system dependency
    }

    stabCap  = Math.max(3, Math.round(stabCap  * techMult));
    wbCap    = Math.max(3, Math.round(wbCap    * techMult));
    innovCap = Math.max(5, Math.round(innovCap * techMult));
    coopCap  = Math.max(5, Math.round(coopCap  * techMult));

    civ.state.stabilityIndex   = Math.min(civ.state.stabilityIndex,   stabCap);
    civ.state.averageWellbeing = Math.min(civ.state.averageWellbeing, wbCap);
    b.innovation  = Math.min(b.innovation  || 50, innovCap);
    b.cooperation = Math.min(b.cooperation || 50, coopCap);
  }

  // ── Apply Public Works Event Effects ──────────────────────────
  // ── Public Works: start construction project ──────────────────
  _applyPublicWorkEvent(civ, event) {
    if (!civ.state) return;
    if (!civ.state.constructionProjects) civ.state.constructionProjects = [];

    const workId = event.workId || event.historyType;
    if (!workId) return; // safety: need an id to track

    // Don't allow duplicate concurrent projects of the same type
    if (civ.state.constructionProjects.some(p => p.workId === workId)) return;

    const BUILD_TIMES = {
      works_granary: 3, works_irrigation: 4, works_aqueduct: 5,
      works_roads: 4,   works_library: 5,    works_hospital: 6,
      works_energy: 6,  works_space: 8,
    };
    const turnsTotal = event.buildTurns || BUILD_TIMES[workId] || 4;

    civ.state.constructionProjects.push({
      workId,
      label: event.label || 'Public Works Project',
      icon:  event.icon  || '🏗️',
      effects: event.effects || {},
      turnsRemaining: turnsTotal,
      turnsTotal,
    });
  }

  // ── Technology Introduction ────────────────────────────────────
  _applyTechIntroduction(civ, tech) {
    if (!civ.state || !tech) return;
    if (!civ.state.activeTechnologies)  civ.state.activeTechnologies  = [];
    if (!civ.state.techConsequences)    civ.state.techConsequences    = [];

    // Prevent duplicate introductions
    if (civ.state.activeTechnologies.some(t => t.techId === tech.id)) return;

    const fx = tech.immediateEffects || {};
    const b  = civ.state.behaviorReinforcement || {};

    // Apply immediate global effects
    if (fx.wellbeing) {
      civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + fx.wellbeing, 0, 100);
    }
    if (fx.equality) {
      civ.state.equalityIndex = Utils.clamp(civ.state.equalityIndex + fx.equality, 0, 100);
    }
    if (fx.innovation) {
      b.innovation = Utils.clamp((b.innovation || 50) + fx.innovation, 0, 100);
    }
    if (fx.warmingImpact) {
      this.globalWarmingIndex = Utils.clamp(this.globalWarmingIndex + fx.warmingImpact, 0, 100);
      if (this.game.map?.applyGlobalWarming) this.game.map.applyGlobalWarming(this.globalWarmingIndex);
    }

    // Apply rollout-weighted strata effects
    this._applyTechStrataEffects(civ, tech);

    // Queue consequence chain entries
    for (const c of (tech.consequenceChain || [])) {
      civ.state.techConsequences.push({
        techId:         tech.id,
        techName:       tech.name,
        techIcon:       tech.icon,
        label:          c.label,
        icon:           c.icon,
        description:    c.description,
        type:           c.type,
        magnitude:      c.magnitude,
        turnsRemaining: c.turnDelay,
      });
    }

    // Record active technology
    civ.state.activeTechnologies.push({
      techId:         tech.id,
      name:           tech.name,
      icon:           tech.icon,
      turnIntroduced: this.game.turnCount,
      rolloutProfile: tech.rolloutProfile,
    });

    // Rich history entry
    const rolloutLabels = {
      elite_first:    'Elite-First rollout',
      universal:      'Universal rollout',
      market_driven:  'Market-Driven rollout',
      equity_focused: 'Equity-Focused rollout',
    };
    const rolloutDesc  = rolloutLabels[tech.rolloutProfile] || 'Phased rollout';
    const chainCount   = (tech.consequenceChain || []).length;
    const fxStr = [
      fx.wellbeing  ? `wellbeing ${fx.wellbeing >= 0 ? '+' : ''}${fx.wellbeing}` : null,
      fx.equality   ? `equality ${fx.equality >= 0 ? '+' : ''}${fx.equality}`   : null,
      fx.innovation ? `innovation ${fx.innovation >= 0 ? '+' : ''}${fx.innovation}` : null,
    ].filter(Boolean).join(', ');
    civ.addHistoryEntry(
      this.game.currentYear,
      `${tech.icon} ${tech.name} — Introduced`,
      `${tech.name} has been introduced to ${civ.name} via ${rolloutDesc}. Immediate effects: ${fxStr || 'none'}. ${chainCount} downstream consequence${chainCount !== 1 ? 's' : ''} queued.`,
      'introduce_technology'
    );
    if (this.game.ui?.showNotification) this.game.ui.showNotification(`${tech.icon} ${tech.name} introduced!`);
  }

  // Apply rollout-weighted stratum wellbeing deltas
  _applyTechStrataEffects(civ, tech) {
    const ROLLOUT_WEIGHTS = {
      elite_first:    { elite: 1.0, upper_middle: 0.6, lower_middle: 0.2, working_class: 0.1,  disenfranchised: 0.0  },
      market_driven:  { elite: 0.9, upper_middle: 0.7, lower_middle: 0.4, working_class: 0.2,  disenfranchised: 0.05 },
      universal:      { elite: 0.9, upper_middle: 0.85,lower_middle: 0.8, working_class: 0.75, disenfranchised: 0.65 },
      equity_focused: { elite: 0.7, upper_middle: 0.8, lower_middle: 0.9, working_class: 0.95, disenfranchised: 1.0  },
    };
    const STRATA_POP_WEIGHTS = { elite: 0.05, upper_middle: 0.15, lower_middle: 0.25, working_class: 0.40, disenfranchised: 0.15 };
    const weights  = ROLLOUT_WEIGHTS[tech.rolloutProfile] || ROLLOUT_WEIGHTS.universal;
    const effects  = tech.strataEffects || {};
    let weightedWellbeingDelta = 0;
    for (const [stratum, popWeight] of Object.entries(STRATA_POP_WEIGHTS)) {
      const strataFx      = effects[stratum];
      if (!strataFx) continue;
      const rolloutWeight = weights[stratum] ?? 0.5;
      weightedWellbeingDelta += (strataFx.wellbeing || 0) * rolloutWeight * popWeight;
    }
    // 0.4 multiplier avoids double-counting with immediateEffects.wellbeing
    civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + weightedWellbeingDelta * 0.4, 0, 100);
  }

  // ── Technology Discontinuation ─────────────────────────────────
  _applyTechDiscontinuation(civ, tech) {
    if (!civ.state || !tech) return;
    if (!civ.state.activeDiscontinuations) civ.state.activeDiscontinuations = [];
    if (!civ.state.techConsequences)       civ.state.techConsequences       = [];

    if (civ.state.activeDiscontinuations.some(t => t.techId === tech.id)) return;

    const fx = tech.immediateEffects || {};
    const b  = civ.state.behaviorReinforcement || {};

    if (fx.wellbeing)     civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + fx.wellbeing, 0, 100);
    if (fx.equality)      civ.state.equalityIndex    = Utils.clamp(civ.state.equalityIndex    + fx.equality,  0, 100);
    if (fx.innovation)    b.innovation = Utils.clamp((b.innovation || 50) + fx.innovation, 0, 100);
    if (fx.warmingImpact) {
      this.globalWarmingIndex = Utils.clamp(this.globalWarmingIndex + fx.warmingImpact, 0, 100);
      if (this.game.map?.applyGlobalWarming) this.game.map.applyGlobalWarming(this.globalWarmingIndex);
    }

    for (const c of (tech.consequenceChain || [])) {
      civ.state.techConsequences.push({
        techId:         tech.id,
        techName:       tech.name,
        techIcon:       tech.icon,
        label:          c.label,
        icon:           c.icon,
        description:    c.description,
        type:           c.type,
        magnitude:      c.magnitude,
        turnsRemaining: c.turnDelay,
      });
    }

    civ.state.activeDiscontinuations.push({
      techId:      tech.id,
      name:        tech.name,
      icon:        tech.icon,
      turnApplied: this.game.turnCount,
    });

    const chainCount = (tech.consequenceChain || []).length;
    const fxStr = [
      fx.wellbeing  ? `wellbeing ${fx.wellbeing >= 0 ? '+' : ''}${fx.wellbeing}` : null,
      fx.equality   ? `equality ${fx.equality >= 0 ? '+' : ''}${fx.equality}`   : null,
    ].filter(Boolean).join(', ');
    civ.addHistoryEntry(
      this.game.currentYear,
      `${tech.icon} ${tech.name} — Discontinued`,
      `${tech.name} has been phased out in ${civ.name}. Immediate effects: ${fxStr || 'none'}. ${chainCount} downstream consequence${chainCount !== 1 ? 's' : ''} queued over the coming turns.`,
      'discontinue_technology'
    );
    if (this.game.ui?.showNotification) this.game.ui.showNotification(`${tech.icon} ${tech.name} discontinued!`);
  }

  // ── Tech Consequence Chain: tick each turn ────────────────────
  _techConsequencesTick(civ) {
    if (!civ.state?.techConsequences?.length) return;

    const completed = [];
    for (const c of civ.state.techConsequences) {
      c.turnsRemaining--;
      if (c.turnsRemaining <= 0) completed.push(c);
    }

    for (const c of completed) {
      // Remove from queue
      civ.state.techConsequences = civ.state.techConsequences.filter(
        x => !(x.techId === c.techId && x.label === c.label && x.turnsRemaining <= 0)
      );
      // Apply the effect
      this._applyTechConsequenceEffect(civ, c);
      // Log to history
      civ.addHistoryEntry(
        this.game.currentYear,
        `${c.icon} ${c.label}`,
        `A delayed consequence of ${c.techName} has materialized: ${c.description}`,
        'introduce_technology'
      );
      if (this.game.ui?.showNotification) {
        this.game.ui.showNotification(`${c.icon} ${c.label} (consequence of ${c.techName})`);
      }
    }
  }

  // Apply the mechanical effect of a fired consequence entry
  _applyTechConsequenceEffect(civ, c) {
    const { type, magnitude } = c;
    const b = civ.state.behaviorReinforcement || {};

    switch (type) {
      case 'population_surge':
        civ.state.population = Math.max(10, Math.floor(civ.state.population * (1 + magnitude * 0.02)));
        break;
      case 'resource_strain':
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - magnitude * 2, 0, 100);
        civ.state.equalityIndex    = Utils.clamp(civ.state.equalityIndex    - magnitude * 1, 0, 100);
        break;
      case 'climate_acceleration':
        // Negative magnitude = improvement (warming slowdown)
        this.globalWarmingIndex = Utils.clamp(this.globalWarmingIndex + magnitude * 0.5, 0, 100);
        if (this.game.map?.applyGlobalWarming) this.game.map.applyGlobalWarming(this.globalWarmingIndex);
        break;
      case 'employment_shock':
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - magnitude * 1.5, 0, 100);
        civ.state.equalityIndex    = Utils.clamp(civ.state.equalityIndex    - magnitude * 1,   0, 100);
        break;
      case 'inequality_surge':
        // Negative magnitude = inequality improvement (benefit)
        civ.state.equalityIndex = Utils.clamp(civ.state.equalityIndex - magnitude * 3, 0, 100);
        break;
      case 'environmental_improvement':
        this.globalWarmingIndex    = Utils.clamp(this.globalWarmingIndex    - magnitude * 0.4, 0, 100);
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + magnitude * 0.5, 0, 100);
        if (this.game.map?.applyGlobalWarming) this.game.map.applyGlobalWarming(this.globalWarmingIndex);
        break;
      case 'economic_disruption':
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - magnitude * 1,   0, 100);
        civ.state.equalityIndex    = Utils.clamp(civ.state.equalityIndex    - magnitude * 0.5, 0, 100);
        break;
      case 'food_security_crisis':
        civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing - magnitude * 2, 0, 100);
        civ.state.population       = Math.max(10, Math.floor(civ.state.population * (1 - magnitude * 0.01)));
        break;
      default:
        break;
    }
  }

  // ── Automation: apply level change ────────────────────────────
  _applyAutomationLevelChange(civ, newLevel) {
    if (!civ.state) return;
    if (civ.state.automationLevel === undefined) civ.state.automationLevel = 0;
    if (!civ.state.techConsequences) civ.state.techConsequences = [];

    const oldLevel = civ.state.automationLevel;
    const ld = (typeof AUTOMATION_LEVELS !== 'undefined') ? AUTOMATION_LEVELS[newLevel] : null;
    if (!ld) return;

    civ.state.automationLevel = newLevel;

    // Apply immediate effects
    const fx = ld.immediateEffects || {};
    if (fx.wellbeing)    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing || 50) + fx.wellbeing, 0, 100);
    if (fx.equality)     civ.state.equalityIndex    = Utils.clamp((civ.state.equalityIndex    || 50) + fx.equality,  0, 100);
    if (fx.innovation) {
      if (!civ.state.behaviorReinforcement) civ.state.behaviorReinforcement = {};
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + fx.innovation, 0, 100);
    }
    if (fx.warmingImpact) {
      this.globalWarmingIndex = Utils.clamp(this.globalWarmingIndex + fx.warmingImpact, 0, 100);
      if (this.game?.map?.applyGlobalWarming) this.game.map.applyGlobalWarming(this.globalWarmingIndex);
    }

    // Queue consequence chain into shared techConsequences array
    for (const c of (ld.consequenceChain || [])) {
      civ.state.techConsequences.push({ ...c, turnsRemaining: c.turnDelay, source: 'automation' });
    }

    // History entry
    const year      = this.game?.currentYear ?? 0;
    const direction = newLevel > oldLevel ? 'Advanced' : 'Adjusted';
    const shortDesc = ld.description.length > 120 ? ld.description.slice(0, 120) + '…' : ld.description;
    civ.addHistoryEntry(
      year,
      `🤖 Automation ${direction} — Level ${newLevel}: ${ld.label}`,
      `Automation level set from ${oldLevel} to ${newLevel}. ${shortDesc}`,
      'automation_level'
    );

    // Notification
    this.game.ui?.showNotification(
      `🤖 ${civ.name}: Automation ${direction} to Level ${newLevel} — ${ld.label}`, 'info'
    );
  }

  // ── Automation: apply ongoing per-turn effects ─────────────────
  _applyAutomationEffects(civ) {
    if (!civ.state) return;
    const level = civ.state.automationLevel ?? 0;
    if (level === 0) return;

    const ld = (typeof AUTOMATION_LEVELS !== 'undefined') ? AUTOMATION_LEVELS[level] : null;
    if (!ld?.perTurnEffects) return;

    const { wellbeing = 0, equality = 0, innovation = 0 } = ld.perTurnEffects;

    if (wellbeing)  civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing || 50) + wellbeing, 0, 100);
    if (equality)   civ.state.equalityIndex    = Utils.clamp((civ.state.equalityIndex    || 50) + equality,  0, 100);
    if (innovation) {
      if (!civ.state.behaviorReinforcement) civ.state.behaviorReinforcement = {};
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + innovation, 0, 100);
    }
  }

  // ── Economy & Society: per-turn systems ───────────────────────

  _processEducation(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // HANUSHEK-WOESSMANN QUALITY MODEL (2012, 2015)
    // Key finding: cognitive skills (quality) matter far more than years of
    // schooling (quantity) for economic growth. A 1 SD increase in test scores
    // → ~2% higher annual GDP growth over decades.
    //
    // Quality depends on: teacher quality, curriculum, resources, autonomy
    // Access alone is insufficient without quality (Pritchett 2013)
    // Returns are nonlinear: high quality has accelerating returns
    // ══════════════════════════════════════════════════════════════════════
    if (!civ.state) return;
    const tierId = civ.state.educationAccess ?? 'universal_lower';
    const tier   = (typeof EDUCATION_ACCESS_TIERS !== 'undefined')
      ? EDUCATION_ACCESS_TIERS.find(t => t.id === tierId) : null;
    if (!tier) return;
    const quality = (civ.state.educationQuality ?? 50) / 100;

    // Pop-weighted human capital multiplier across strata
    const STRATA_POPS = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
    let hcm = 0;
    for (const [k, w] of Object.entries(STRATA_POPS)) {
      hcm += (tier.strataMultipliers[k] ?? 0.5) * w;
    }
    const humanCapital = quality * hcm;

    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── Innovation: quality-weighted human capital effect ─────────
    // Hanushek-Woessmann: cognitive skills → innovation → growth
    // Nonlinear: high quality has accelerating returns
    if (!civ.state.behaviorReinforcement) civ.state.behaviorReinforcement = {};
    const qualityBonus = quality > 0.7 ? 2.5 : (quality > 0.5 ? 2.0 : 1.5);
    civ.state.behaviorReinforcement.innovation = Utils.clamp(
      (civ.state.behaviorReinforcement.innovation || 50) + humanCapital * qualityBonus * timeScale, 0, 100);

    // ── Equality: access matters for distribution (Goldin & Katz 2008) ──
    civ.state.equalityIndex = Utils.clamp(
      (civ.state.equalityIndex ?? 50) + tier.equalityBonus * 0.5 * timeScale, 0, 100);

    // ── State capacity: education builds bureaucratic competence ──
    if (quality > 0.6) {
      civ.state.stateCapacity = Utils.clamp(
        (civ.state.stateCapacity ?? 50) + 0.2 * timeScale, 0, 100);
    }

    // ── Epistemic health: critical thinking from quality education ──
    if (quality > 0.6 && (civ.state.epistemicHealth ?? 50) < 100) {
      civ.state.epistemicHealth = Utils.clamp(
        (civ.state.epistemicHealth ?? 50) + 0.4 * timeScale, 0, 100);
    }

    // ── Pritchett gap: access without quality creates credential inflation ──
    // Wide access + low quality → frustration, no growth benefit
    if (hcm > 0.6 && quality < 0.3) {
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + 0.2 * timeScale, 0, 100); // educated unemployment
    }
  }

  _processGenderEquity(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // DUFLO (2012) BIDIRECTIONAL DEVELOPMENT-GENDER FRAMEWORK
    // Key insight: development → gender equity AND gender equity → development
    // Neither is sufficient alone; they reinforce each other but with
    // asymmetric speeds:
    //   - Development → GEI: slow, incomplete (even rich countries ~80%)
    //   - Policy intervention: faster but needs institutional support
    //   - GEI → Development: large (Sen 1999: female education strongest
    //     single predictor of child survival, GDP growth, governance quality)
    //
    // WEF GGGI data: +1-3 pts/decade normal, +4-8 fast, ceiling ~85%
    // Regression rare but possible under authoritarianism
    // ══════════════════════════════════════════════════════════════════════
    if (!civ.state) return;
    let gei = civ.state.genderEquity ?? 50;
    const techLevel  = civ.state.technologyLevel ?? 1;
    const eh         = civ.state.epistemicHealth ?? 50;
    const authOrient = civ.state.authorityOrientation ?? 50;
    const religion   = civ.religion?.stateRelationship || 'separate';
    const educQ      = civ.state.educationQuality ?? 50;
    const urban      = civ.state.urbanizationRate ?? 15;
    const iq         = civ.state.institutionalQuality ?? 50;

    const timeScale = (this.game.yearsDelta || 10) / 10;
    const ceilingDamp = gei > 80 ? 0.4 : (gei > 65 ? 0.7 : 1.0); // WEF: progress slows above 65%

    // ── Development → GEI (Duflo channel 1) ─────────────────────
    // Technology + information access enables women's empowerment
    if (techLevel > 3 && eh > 50) gei += 1.0 * ceilingDamp * timeScale;
    if (techLevel > 6 && eh > 65) gei += 0.6 * ceilingDamp * timeScale;

    // Urbanization: cities provide more opportunities outside household
    if (urban > 40) gei += 0.3 * ceilingDamp * timeScale;

    // Education: female education is transformative (Sen 1999)
    if (educQ > 60) gei += 0.5 * ceilingDamp * timeScale;
    else if (educQ < 25) gei -= 0.3 * timeScale;

    // ── Institutional support (policy channel) ──────────────────
    if (iq > 60) gei += 0.3 * ceilingDamp * timeScale; // Legal frameworks, enforcement

    // ── Suppression forces ──────────────────────────────────────
    // State religion + hierarchical authority: strongest suppressor
    if (religion === 'state' && authOrient < 40) gei -= 1.2 * timeScale;
    // Theocratic governance: institutional patriarchy
    if (civ.governance?.modelId === 'theocratic') gei -= 0.8 * timeScale;
    // Caste rigidity reinforces gender hierarchy
    const caste = civ.state.casteRigidity ?? 15;
    if (caste > 40) gei -= 0.3 * (caste / 100) * timeScale;

    // Patriarchal inertia: restrictive tiers resist equity growth (Fix R3-3b)
    const wrTierGE = civ.state.womensRightsTier ?? 'mostly_full';
    if (wrTierGE === 'forbidden' || wrTierGE === 'minimal') {
      if (gei > 10) gei -= 0.3 * timeScale;
    }

    // Women's rights tier gate: hard ceiling based on configured tier (Fix R3-3a)
    const geTierCeilings = {
      'forbidden': 15,
      'minimal': 35,
      'mostly_full': 80,
      'full_parity': 100
    };
    const geCeiling = geTierCeilings[wrTierGE] ?? 80;
    if (gei > geCeiling) gei = geCeiling;

    civ.state.genderEquity = Utils.clamp(gei, 0, 100);

    // ── GEI → Development (Duflo channel 2) ─────────────────────
    // High GEI has large developmental returns:
    // - Innovation: doubling the talent pool (Hsieh et al. 2019)
    if (gei > 70) {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + 0.5 * timeScale, 0, 100);
    }
    // - Equality: gender equity is intrinsically equalizing
    if (gei < 30) {
      civ.state.equalityIndex = Utils.clamp(
        (civ.state.equalityIndex ?? 50) - 0.8 * timeScale, 0, 100);
    } else if (gei > 60) {
      civ.state.equalityIndex = Utils.clamp(
        (civ.state.equalityIndex ?? 50) + 0.3 * timeScale, 0, 100);
    }
    // - Governance: women's political participation improves governance (Chattopadhyay & Duflo 2004)
    if (gei > 65) {
      civ.state.institutionalQuality = Utils.clamp(
        (civ.state.institutionalQuality ?? 50) + 0.15 * timeScale, 0, 100);
    }
    // - Child health/education: strongest single predictor (Sen 1999)
    // Already handled through demographic transition fertility effects
  }

  // ── Institutional Quality — Acemoglu-Johnson-Robinson ──────────────
  // Evidence-based model:
  //   1. AJR 2001/2005/2012: inclusive vs extractive institutions determine
  //      long-run development. Key insight: institutions are endogenous —
  //      shaped by power distribution, not just good ideas
  //   2. Critical junctures (AJR 2001): moments of institutional flux
  //      (revolution, independence, crisis) → path-dependent outcomes
  //   3. Extractive equilibrium (AJR 2012): elites resist inclusive reform
  //      because it threatens their rents — "iron law of oligarchy"
  //   4. Institutional persistence: colonial-origin institutions persist
  //      for centuries (AJR 2001 settler mortality instrument)
  //   5. North 1990: transaction costs framework — institutions reduce
  //      uncertainty and enable complex exchange
  //   6. Rodrik et al. 2004: institutions > geography > trade for development
  // Sources: Acemoglu, Johnson & Robinson 2001/2005/2012, North 1990,
  //          Rodrik et al. 2004, Mokyr 2016, Fukuyama 2011, V-Dem dataset
  _processInstitutions(civ) {
    if (!civ.state) return;
    let iq = civ.state.institutionalQuality ?? 50;
    const corruption = civ.state.behaviorReinforcement?.acquisitiveness ?? 50;
    const stability  = civ.state.stabilityIndex ?? 70;
    const atWar      = this.activeWars.some(w => w.attacker === civ.id || w.defender === civ.id);
    const govId      = civ.governance?.modelId ?? '';
    const cap        = civ.state.stateCapacity ?? 50;
    const legitimacy = civ.state.legitimacyLevel ?? 50;
    const trust      = civ.state.socialTrust ?? 50;
    const education  = civ.state.educationQuality ?? 50;
    const civControl = civ.state.civilianControl ?? 50;
    const wc         = civ.state.wealthConcentration ?? 40;
    const ep         = civ.state.epistemicHealth ?? 50;
    const freedom    = civ.operatingPrinciples?.freedomLevel ?? 50;

    // Calibrated to V-Dem: +2-5 pts/decade improvement, -5-15 pts/decade decay
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const isDemocratic = ['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId);

    // Track governance duration (Fix R3-1a)
    const prevGov = civ.state._prevGovernanceType ?? civ.state.governanceType ?? govId;
    if (govId !== prevGov) {
      civ.state._governanceDuration = 0;
    }
    civ.state._prevGovernanceType = govId;
    civ.state._governanceDuration = (civ.state._governanceDuration ?? 0) + 1;
    const govAge = civ.state._governanceDuration;
    const maturityScale = govAge < 30 ? 0.3 : (govAge < 100 ? 0.7 : 1.0);

    // ── 1. Inclusive institution building (AJR 2012) ──
    // Inclusive institutions emerge from: broad power distribution, pluralism,
    // rule of law, property rights, low corruption
    let inclusivePressure = 0;

    // Low corruption + stability = space for institutional development (V-Dem)
    if (corruption < 30 && stability > 55) inclusivePressure += 1.5;
    else if (corruption < 50 && stability > 45) inclusivePressure += 0.5;

    // Democratic governance: pluralism enables inclusive reform (scaled by maturity, Fix R3-1b)
    if (isDemocratic) inclusivePressure += 0.2 * maturityScale;
    // Civilian control: professional bureaucracy (Fukuyama 2011)
    if (civControl > 60) inclusivePressure += 0.3;
    // Education: informed citizenry demands accountability (Lipset 1959)
    if (education > 60) inclusivePressure += 0.4;
    // Social trust: enables complex institutions (Putnam 1993)
    if (trust > 60) inclusivePressure += 0.3;
    // Epistemic health: free information → transparency → accountability
    if (ep > 60) inclusivePressure += 0.2;
    // High legitimacy: stable foundation for reform
    if (legitimacy > 65) inclusivePressure += 0.2;

    // R4b: Reform pressure from extreme inequality — even non-democratic
    // societies generate inclusive pressure when WC is extreme. Elites fragment,
    // peasant revolts threaten order, military demands concessions.
    // Historical: Gracchi reforms (Rome), Wang Mang reforms (Han China),
    // Tanzimat (Ottoman), Meiji reforms (Japan), land reform (China, Taiwan).
    if (wc > 70) inclusivePressure += 0.5 * ((wc - 70) / 30);
    if (wc > 80) inclusivePressure += 0.8 * ((wc - 80) / 20);

    // ── 2. Extractive pressure — AJR "iron law of oligarchy" ──
    // Elites resist inclusive reform to preserve rents
    let extractivePressure = 0;

    // High wealth concentration: elite capture (AJR 2012)
    if (wc > 70) extractivePressure += 2.0;
    else if (wc > 55) extractivePressure += 1.0;

    // Corruption erodes institutional quality
    if (corruption > 60) extractivePressure += 2.0 * ((corruption - 60) / 40);
    else if (corruption > 40) extractivePressure += 0.5;

    // War: institutional stress (resources diverted, emergency powers)
    // R4b: Reduced from 2.5 to 1.5. War doesn't always destroy institutions —
    // Tilly (1990): "war makes the state." Total war mobilization often
    // STRENGTHENED bureaucracies (WWI/II France, Britain, US, Ottoman sipahi system).
    // War damages institutions mainly when it causes DEFEAT and occupation.
    if (atWar) extractivePressure += 1.5;

    // Autocratic governance: concentrated power resists checks (reduced from 1.0/0.5)
    if (govId === 'autocratic') extractivePressure += 0.3;
    if (govId === 'theocratic') extractivePressure += 0.15; // doctrine limits reform

    // Low freedom: can't build inclusive institutions without freedoms
    if (freedom < 30) extractivePressure += 0.5;

    // ── 3. Net institutional drift ──
    // R4b: Diminishing extractive returns at low IQ — you can't extract rents
    // from institutions that barely exist. At IQ=5, there's nothing left to
    // capture. This prevents the death spiral where extraction endlessly
    // pushes IQ below its floor. Historical: Ottoman late-period corruption
    // couldn't destroy local kadı courts because those courts were the only
    // remaining governance; Roman latifundia couldn't destroy ALL law because
    // property rights (including theirs) depended on it.
    const extractDamping = iq < 25 ? Math.max(0.2, iq / 25) : 1.0;
    const dampedExtractive = extractivePressure * extractDamping;
    const netDrift = (inclusivePressure - dampedExtractive) * timeScale;
    iq += netDrift;

    // ── 4. AJR critical junctures — institutional flux moments ──
    // After crises (low stability recovery), institutions can reform OR decay
    // depending on power balance. This creates path dependence.
    if (stability > 55 && (civ.state._postCrisisWindow ?? 0) > 0) {
      // Window of opportunity: crisis just ended, reform possible
      if (trust > 45 && corruption < 50 && iq > 40) {
        // Reform window: inclusive path
        iq += 1.5 * timeScale;
      } else if (wc > 65 && corruption > 50) {
        // Elite capture window: extractive path
        iq -= 1.0 * timeScale;
      }
      civ.state._postCrisisWindow = Math.max(0, (civ.state._postCrisisWindow ?? 0) - 1);
    }
    // Detect crisis → recovery transition (creates reform window)
    if (stability < 30 && !civ.state._inInstitutionalCrisis) {
      civ.state._inInstitutionalCrisis = true;
    }
    if (stability > 50 && civ.state._inInstitutionalCrisis) {
      civ.state._inInstitutionalCrisis = false;
      civ.state._postCrisisWindow = 5; // ~50 year window for reform
    }

    // ── 5. Institutional persistence (AJR 2001) ──
    // Institutions have strong inertia — both good and bad persist
    // This is modeled as mean-reversion dampening: harder to move
    // institutions the further they are from their historical equilibrium
    // Proxy: slow natural reversion toward 50 (weak attractor)
    if (iq > 75) iq -= 0.1 * timeScale; // diminishing returns to reform
    if (iq < 25) iq += 0.1 * timeScale; // even extractive states build some order

    // Institutional lock-in drag (Fix R3-4a): high lock-in actively degrades IQ + feeds corruption
    const lockinDrag = civ.state.institutionalLockin ?? 0;
    if (lockinDrag > 50) {
      const lockDragAmt = (lockinDrag - 50) * 0.015 * timeScale;
      iq -= lockDragAmt;
      civ.state.corruptionLevel = Utils.clamp(
        (civ.state.corruptionLevel ?? 0) + lockDragAmt * 0.5, 0, 100);
    }

    // Diminishing returns at very high IQ (Fix R3-1): even the best institutions face bureaucratic
    // rigidity, regulatory capture, interest group politics (Olson 1982 institutional sclerosis)
    if (iq > 80) {
      const excess = iq - 80;
      iq -= excess * excess * 0.008 * timeScale;
    }

    // ── R4-1: State-capacity-maintained IQ floor (entropy-inspired) ──
    // Thermodynamic analog: maintaining institutional order requires ongoing
    // energy input. State capacity IS that energy — tax collection, courts,
    // bureaucracy, military logistics. A society with cap=60 cannot have IQ=0.
    // Song Dynasty civil service exams, Ottoman devshirme, Soviet Gosplan
    // were extractive but constituted real institutional infrastructure.
    const legLvl = civ.state.legitimacyLevel ?? 0;
    // R4b: Added absolute minimum — any surviving society has SOME institutional
    // structure (tribal councils, religious courts, market customs, military hierarchy).
    // Population-scaled: a city of 10,000 has more institutions than a village of 100.
    // A governance system IS an institution — if governance !== 'none', IQ ≥ 10.
    const popIqMin = Math.min(Math.log10(Math.max(civ.state.population ?? 100, 100)) * 5, 15);
    const iqFloor = Math.min(Math.max(cap * 0.4 + legLvl * 0.15, popIqMin), 45);
    if (iq < iqFloor) {
      // Proportional convergence: 25% of gap/decade. Strong enough to counterbalance
      // extractive pressure (~4/decade) when floor is 15-20 points above current IQ.
      // At iq=5, floor=25: recovery = (25-5)*0.25 = 5.0 → balances extractive forces.
      iq += (iqFloor - iq) * 0.25 * timeScale;
    }

    iq = Utils.clamp(iq, 0, 100);
    civ.state.institutionalQuality = iq;

    // ── 6. Cross-effects — North 1990 transaction costs ──
    // Low IQ → corruption self-reinforces (vicious cycle)
    if (iq < 15 && civ.state.behaviorReinforcement?.acquisitiveness) {
      civ.state.behaviorReinforcement.acquisitiveness = Utils.clamp(
        civ.state.behaviorReinforcement.acquisitiveness + 0.8 * timeScale, 0, 100);
    }
    // High IQ → state capacity building (virtuous cycle, Fukuyama 2011)
    if (iq > 65 && cap < 80) {
      civ.state.stateCapacity = Utils.clamp(cap + 0.3 * timeScale, 0, 100);
    }
    // Very low IQ → state capacity decay (R4-1c: raised threshold from 25 to 15)
    if (iq < 15) {
      civ.state.stateCapacity = Utils.clamp(cap - 0.3 * timeScale, 0, 100);
    }
    // AJR 2012: inclusive institutions → innovation (creative destruction allowed)
    if (iq > 70 && freedom > 60) {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement?.innovation ?? 50) + 0.2 * timeScale, 0, 100);
    }
    // Extractive institutions suppress innovation (protect incumbents)
    if (iq < 25 && wc > 70) {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement?.innovation ?? 50) - 0.3 * timeScale, 0, 100);
    }
  }

  _processEpistemicHealth(civ) {
    if (!civ.state) return;
    let eh = civ.state.epistemicHealth ?? 50;
    const govId    = civ.governance?.modelId || 'representative';
    const religion = civ.religion?.stateRelationship || 'separate';
    const edQ      = civ.state.educationQuality ?? 50;

    // Calibrated to RSF/V-Dem: +/-1-2 pts/decade stable, +/-5-15 pts/decade during transitions
    const timeScale = (this.game.yearsDelta || 10) / 10;
    // Epistemic health driven by BEHAVIOR not governance labels.
    // High freedom + education → EH grows (any governance).
    // Low freedom + suppressed science → EH declines (any governance).
    // Islamic Golden Age: theocracy WITH scholarship = EH grew.
    // Soviet Union: autocracy that funded science = EH mixed.
    // Modern US: democracy with declining media trust = EH declining.
    const freedom = civ.operatingPrinciples?.freedomLevel ?? 50;
    const scienceFreedom = civ.state.scienceFreedom ?? 50;
    // Freedom drives EH (free press, open inquiry, academic freedom)
    if (freedom > 60) eh += 0.5 * ((freedom - 60) / 40) * timeScale;
    else if (freedom < 30) eh -= 1.0 * ((30 - freedom) / 30) * timeScale;
    // Science freedom: separate from political freedom
    // Theocracies can have high science freedom (Islamic Golden Age) or low
    if (scienceFreedom > 60) eh += 0.5 * ((scienceFreedom - 60) / 40) * timeScale;
    else if (scienceFreedom < 30) eh -= 0.5 * ((30 - scienceFreedom) / 30) * timeScale;
    // State religion still has some effect (doctrine constrains inquiry)
    // but reduced from -1.0 to -0.3 and only if science freedom is low
    if (religion === 'state' && scienceFreedom < 40) eh -= 0.3 * timeScale;
    if (edQ > 60) eh += 0.5 * timeScale;

    // Information ecosystem truthAnchor ceiling (Fix 2: EH-info coupling)
    // Total information control cannot sustain high EH regardless of education.
    // Soviet Union had excellent STEM education but EH was low due to censorship.
    const infoEcoId = civ.state.informationEcosystem ?? 'free_market_media';
    const infoEco = INFORMATION_ECOSYSTEM_TYPES.find(t => t.id === infoEcoId);
    const truthAnchor = infoEco?.truthAnchor ?? 60;
    const ehCeiling = truthAnchor + 15;
    if (eh > ehCeiling) {
      // Dampen excess by 70% — education can push slightly above ceiling but not far
      eh = ehCeiling + (eh - ehCeiling) * 0.3;
    }

    civ.state.epistemicHealth = Utils.clamp(eh, 0, 100);

    // Low epistemic health → random destabilization
    if (eh < 25 && Utils.random() < 0.018 * timeScale) {
      const shock = Math.round(3 + Utils.random() * 4);
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - shock, 0, 100);
      const yr = this.game?.currentYear ?? 0;
      civ.addHistoryEntry(yr, '📢 Populist Destabilization',
        'Suppressed information environments allowed demagogic movements to gain ground, destabilizing social order.',
        'epistemic_crisis');
      this.game.ui?.showNotification(`📢 ${civ.name}: Epistemic crisis — stability fell by ${shock}`, 'info');
    }
  }

  _processDemographics(civ) {
    if (!civ.state) return;
    const profile = (typeof DEMOGRAPHIC_PROFILES !== 'undefined')
      ? DEMOGRAPHIC_PROFILES.find(p => p.id === (civ.state.demographicProfile || 'balanced'))
      : null;

    // Apply per-turn effects from current profile
    if (profile?.perTurnEffects) {
      const { wellbeing = 0, equalityIndex = 0, innovation = 0, stabilityRisk = 0 } = profile.perTurnEffects;
      if (wellbeing)    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + wellbeing,    0, 100);
      if (equalityIndex)civ.state.equalityIndex    = Utils.clamp((civ.state.equalityIndex    ?? 50) + equalityIndex,0, 100);
      if (innovation)   civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) + innovation, 0, 100);
      if (stabilityRisk > 0 && Utils.random() < stabilityRisk) {
        civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 2, 0, 100);
      }
    }

    // Demographic profile drift — cohort-driven when transition system active, stochastic fallback
    const cohortPressure = civ.state._cohortProfilePressure;
    if (cohortPressure) {
      // Cohort-driven: use age structure data from _processDemographicTransition
      let current = civ.state.demographicProfile || 'balanced';
      let next = current;
      const wellbeing = civ.state.averageWellbeing ?? 50;
      const stability = civ.state.stabilityIndex ?? 70;

      // Gradual transitions: young -> balanced -> aging (no skipping)
      if (cohortPressure === 'stress') {
        next = 'demographic_stress';
      } else if (cohortPressure === 'young') {
        if (current === 'balanced' || current === 'demographic_stress') next = 'young';
        else if (current === 'aging') next = 'balanced';
      } else if (cohortPressure === 'aging') {
        if (current === 'balanced' || current === 'demographic_stress') next = 'aging';
        else if (current === 'young') next = 'balanced';
      } else if (cohortPressure === 'balanced') {
        if (current === 'young' || current === 'aging') next = 'balanced';
        if (current === 'demographic_stress' && wellbeing > 50 && stability > 55) next = 'balanced';
      }

      // Only transition with probability (gradual, not instant)
      if (next !== current && Utils.random() > 0.75) {
        civ.state.demographicProfile = next;
        const profileData = (typeof DEMOGRAPHIC_PROFILES !== 'undefined')
          ? DEMOGRAPHIC_PROFILES.find(p => p.id === next) : null;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr,
          `Demographic Shift — ${profileData?.label || next}`,
          profileData?.description || '', 'demographic_shift');
        this.game.ui?.showNotification(
          `${civ.name}: Demographic profile shifted to ${profileData?.label || next}`, 'info');
      }
    } else if (Utils.random() > 0.8) {
      // Stochastic fallback for backwards compatibility (no transition system)
      const gei       = civ.state.genderEquity ?? 50;
      const edAccess  = civ.state.educationAccess ?? 'universal_lower';
      const automation= civ.state.automationLevel ?? 0;
      const wellbeing = civ.state.averageWellbeing ?? 50;
      const stability = civ.state.stabilityIndex ?? 70;
      const hasLongevity = (civ.state.activeTechnologies || []).some(t => t.id === 'aging_treatment');
      let current = civ.state.demographicProfile || 'balanced';

      const agingPressure = (gei > 65 ? 1 : 0) + (edAccess === 'universal' ? 1 : 0) +
        (automation >= 3 ? 1 : 0) + (hasLongevity ? 2 : 0);
      const youthPressure = (gei < 35 ? 1 : 0) + (wellbeing < 35 ? 1 : 0) +
        (edAccess === 'limited' ? 1 : 0);
      const stressPressure = (current === 'young' && wellbeing < 30 && stability < 45 ? 2 : 0) +
        (current === 'aging'  && stability < 40 ? 2 : 0);

      let next = current;
      if (stressPressure >= 2) {
        next = 'demographic_stress';
      } else if (agingPressure >= 3 && current === 'balanced') {
        next = 'aging';
      } else if (agingPressure >= 2 && current === 'young') {
        next = 'balanced';
      } else if (youthPressure >= 2 && current === 'balanced') {
        next = 'young';
      } else if (current === 'demographic_stress' && wellbeing > 50 && stability > 55) {
        next = (agingPressure > youthPressure) ? 'aging' : 'young';
      }

      if (next !== current) {
        civ.state.demographicProfile = next;
        const profileData = (typeof DEMOGRAPHIC_PROFILES !== 'undefined')
          ? DEMOGRAPHIC_PROFILES.find(p => p.id === next) : null;
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr,
          `Demographic Shift — ${profileData?.label || next}`,
          profileData?.description || '', 'demographic_shift');
        this.game.ui?.showNotification(
          `${civ.name}: Demographic profile shifted to ${profileData?.label || next}`, 'info');
      }
    }
  }

  _processFinance(civ) {
    if (!civ.state) return;
    const model = (typeof DEBT_MODEL_TYPES !== 'undefined')
      ? DEBT_MODEL_TYPES.find(m => m.id === (civ.state.debtModel || 'regulated_credit'))
      : null;
    if (!model) return;

    // ══════════════════════════════════════════════════════════════════════
    // MINSKY FINANCIAL INSTABILITY HYPOTHESIS (Minsky 1992, Keen 1995)
    // Kindleberger-Minsky cycle: displacement → boom → euphoria → distress → panic
    // BIS empirical cycle: 15-20 years (Borio, Drehmann & Tsatsaronis 2012)
    // Crisis calibration: Reinhart & Rogoff 2009 ("Aftermath of Financial Crises")
    //
    // Phase mapping (0-100):
    //   0-15:  Revulsion / Recovery (post-crisis deleveraging, risk aversion)
    //   15-35: Hedge-Dominant Stability (conservative lending, low leverage)
    //   35-55: Boom / Credit Expansion (rising leverage, speculative finance growing)
    //   55-75: Euphoria / Late Boom (Ponzi finance emerging, credit standards collapsing)
    //   75-90: Distress / Peak (insider selling, first defaults, max fragility)
    //   90-100: Panic / Crisis (crash, defaults cascading, forced deleveraging)
    // ══════════════════════════════════════════════════════════════════════
    const timeScale = (this.game.yearsDelta || 10) / 10;

    let phase = civ.state.minskyPhase ?? 25;
    let yearsSinceCrisis = civ.state.yearsSinceFinancialCrisis ?? 50;
    let finStab = civ.state.financialStability ?? 70;
    const debtLoad = civ.state.debtLoad ?? 20;
    const depthLevel = civ.state.financialDepth ?? 30;
    const atWar = this.activeWars.some(w => w.attacker === civ.id || w.defender === civ.id);
    const econId = civ.economic?.modelId || 'market';
    const wc = civ.economic?.wealthConcentration ?? 30;
    const iq = civ.state.institutionalQuality ?? 50;
    const wellbeing = civ.state.averageWellbeing ?? 50;

    // Increment years since crisis
    yearsSinceCrisis += (this.game.yearsDelta || 10);

    // ── 1. PHASE ADVANCEMENT ─────────────────────────────────────────────
    // "Stability is destabilizing" — Minsky's core insight
    // Base drift: ~2 pts/turn → full cycle ~50 turns (500 years) without modifiers
    // Pre-modern gate: financial depth < 30 → cycle nearly dormant
    const techLevel = civ.state?.technologyLevel ?? 3;
    const depthGate = Math.min(1.0, Math.max(0, depthLevel - 20) / 40); // 0 at depth<=20, 1 at depth>=60
    let phaseAdvance = 2.0 * depthGate;

    // Acceleration factors (prosperity + deregulation + complacency)
    phaseAdvance += Math.max(0, wellbeing - 50) * 0.06 * depthGate;    // High growth encourages borrowing
    phaseAdvance += Math.max(0, depthLevel - 40) * 0.05;               // Sophisticated finance enables speculation
    phaseAdvance += Math.max(0, yearsSinceCrisis - 30) * 0.06;         // Fading crisis memory ("this time is different")
    phaseAdvance += Math.max(0, 50 - iq) * 0.03;                       // Weak regulation accelerates
    phaseAdvance += Math.max(0, wc - 50) * 0.03;                       // Inequality drives speculative demand (Rajan 2010)
    if (model.id === 'market_debt') phaseAdvance += 1.0 * depthGate;   // Market credit accelerates cycle
    if (model.id === 'predatory_debt') phaseAdvance += 2.0 * depthGate; // Predatory debt most unstable

    // Braking factors (regulation + caution + structural limits)
    phaseAdvance -= Math.max(0, iq - 60) * 0.05;              // Strong institutions = "thwarting mechanisms" (Kindleberger)
    phaseAdvance -= Math.max(0, 30 - depthLevel) * 0.06;      // Low depth = limited speculation scope
    phaseAdvance -= Math.max(0, 20 - yearsSinceCrisis) * 0.15; // Recent crisis memory
    if (model.id === 'debtless') phaseAdvance -= 15;           // Structurally immune
    if (model.id === 'community_debt') phaseAdvance -= 5;      // Jubilee cycles brake accumulation
    if (model.id === 'regulated_credit') phaseAdvance -= 1.5;  // Regulation slows cycle
    if (atWar) phaseAdvance -= 1;                              // War redirects capital from finance
    // Non-market economies: financial cycles largely irrelevant (no private credit markets)
    // Gift/commons/barter have no speculative lending; cycle should stay near hedge phase
    if (econId === 'gift' || econId === 'commons' || econId === 'none' || econId === 'barter') phaseAdvance *= 0.1;

    // Apply phase advance (scaled by timeScale)
    phase += phaseAdvance * timeScale;

    // ── 2. DEBT RATIO EVOLUTION (phase-dependent, Keen 1995) ─────────────
    // Debt dynamics driven by financial cycle phase
    let debtDelta = 0;
    if (phase < 15) {
      debtDelta = -10;  // Revulsion: deleveraging (Fisher debt-deflation)
    } else if (phase < 35) {
      debtDelta = 0.5;  // Hedge stability: debt roughly stable
    } else if (phase < 55) {
      debtDelta = 6;    // Boom: credit expansion exceeds income growth
    } else if (phase < 75) {
      debtDelta = 14;   // Euphoria: Ponzi finance, rapid debt growth
    } else if (phase < 90) {
      debtDelta = 8;    // Distress: debt still rising from distressed borrowing
    } else {
      debtDelta = -3;   // Panic: defaults reduce debt, bailouts add govt debt (net small decline)
    }
    // Debt model multiplier
    // Non-market economies (barter, gift) have minimal or no debt instruments
    const debtModelMult = { debtless: 0, community_debt: 0.3, regulated_credit: 0.7, market_debt: 1.0, predatory_debt: 1.3, barter: 0.05, gift: 0, commons: 0 };
    debtDelta *= (debtModelMult[model.id] ?? 1.0);
    if (atWar) debtDelta += 5.0;                              // War increases debt regardless of phase
    if (wellbeing > 70 && phase < 55) debtDelta -= 1.5;       // Surplus reduces debt during stable phases
    civ.state.debtLoad = Utils.clamp(debtLoad + debtDelta * timeScale, 0, 100);

    // ── 3. FINANCIAL DEPTH (tech-gated: pre-modern finance grows slowly) ─
    // Pre-industrial (tech < 4): financial markets are rudimentary
    const techDepthMult = techLevel < 2 ? 0.15 : techLevel < 4 ? 0.3 : techLevel < 6 ? 0.6 : 1.0;
    const depthGrowth = { gift: 0, commons: 0, barter: 0, market: 2.0, commodity: 1.2, hierarchical: 0.5 };
    const depthDamp = depthLevel > 70 ? 0.4 : 1.0;
    civ.state.financialDepth = Utils.clamp(
      depthLevel + (depthGrowth[econId] ?? 0) * depthDamp * techDepthMult * timeScale, 0, 100);

    // ── 4. STRATUM WELLBEING EFFECTS (existing, preserved) ───────────────
    const STRATA_WEIGHTS = { elite: 0.05, upper_middle: 0.15, lower_middle: 0.25, working_class: 0.35, disenfranchised: 0.20 };
    let popWeightedWB = 0;
    for (const [k, w] of Object.entries(STRATA_WEIGHTS)) {
      popWeightedWB += (model.strataWellbeingEffects[k] ?? 0) * w;
    }
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + popWeightedWB * 0.5 * timeScale, 0, 100);
    civ.state.equalityIndex = Utils.clamp(
      (civ.state.equalityIndex ?? 50) + model.equalityEffect * 0.3 * timeScale, 0, 100);

    // ── 5. CURRENCY CONSTRAINTS (existing, preserved) ────────────────────
    const ct = civ.economic?.currencyType ?? 'fiat';
    const depthCeiling = { none: 15, labor_time: 30, commodity: 50,
                           internal: 45, fiat_or_commodity: 80, fiat: 90, custom: 70 }[ct] ?? 70;
    if (civ.state.financialDepth > depthCeiling) {
      civ.state.financialDepth = Utils.lerp(civ.state.financialDepth, depthCeiling, 0.05 * timeScale);
    }
    if ((ct === 'none' || ct === 'labor_time') && civ.state.debtModel !== 'debtless') {
      civ.state.debtLoad = Math.max(0, (civ.state.debtLoad ?? 0) * Math.pow(0.85, timeScale));
    }

    // ── 6. FINANCIAL STABILITY (driven by phase + debt) ──────────────────
    if (phase < 15) {
      finStab += 5 * timeScale;      // Recovery: stability slowly rebuilds
    } else if (phase < 35) {
      finStab += 3 * timeScale;      // Hedge: stable, slow improvement
    } else if (phase < 55) {
      finStab -= 2 * timeScale;      // Boom: hidden fragility building
    } else if (phase < 75) {
      finStab -= 6 * timeScale;      // Euphoria: fragility accelerating
    } else {
      finStab -= 10 * timeScale;     // Distress/panic: rapid destabilization
    }
    // Debt overhang: >90% debt/GDP → 1.2pp lower growth (Reinhart & Rogoff 2010)
    if (civ.state.debtLoad > 60) {
      finStab -= (civ.state.debtLoad - 60) / 40 * 2 * timeScale;
    }
    if (iq > 60) finStab += 1 * timeScale;    // Strong institutions support stability
    civ.state.financialStability = Utils.clamp(finStab, 0, 100);

    // ── 7. CRISIS TRIGGER — Minsky Moment ────────────────────────────────
    // Crisis probability rises sharply above phase 70 (Schularick & Taylor 2012)
    // Non-market economies (gift/commons/barter/none) lack credit markets — no financial crises.
    // Resource shortages for these economies are handled by food security, energy, and carrying capacity systems.
    const nonMarketEcon = (econId === 'gift' || econId === 'commons' || econId === 'none' || econId === 'barter');
    let crisisProb = 0;
    if (nonMarketEcon) {
      // Clamp phase to prevent accumulation into crisis territory
      phase = Math.min(phase, 30);
    } else if (phase > 70 && phase <= 80) {
      crisisProb = 0.15 + Math.max(0, civ.state.debtLoad - 50) * 0.005;
    } else if (phase > 80 && phase <= 90) {
      crisisProb = 0.35 + Math.max(0, civ.state.debtLoad - 50) * 0.008;
    } else if (phase > 90) {
      crisisProb = 0.70 + Math.max(0, civ.state.debtLoad - 50) * 0.005;
    }
    crisisProb += Math.max(0, 50 - iq) * 0.003;             // Weak regulation
    if (model.id === 'predatory_debt') crisisProb += 0.10;
    if (model.id === 'market_debt') crisisProb += 0.05;
    if (atWar && phase > 55) crisisProb += 0.10;            // War can trigger crisis
    crisisProb = Utils.clamp(crisisProb, 0, 0.95);

    // Roll for crisis
    const effectiveProb = 1 - Math.pow(1 - crisisProb, timeScale); // Correct for turn length
    if (effectiveProb > 0 && Utils.random() < effectiveProb) {
      const severity = 0.7 + (civ.state.debtLoad / 100) * 0.6;    // R&R: deeper debt → worse crisis
      this._applyFinancialCrisis(civ, severity, phase);
      phase = 5 + Utils.random() * 10;                              // Reset to revulsion (0-15)
      yearsSinceCrisis = 0;
    }

    // Phase overflow: if phase > 100 without crisis firing, auto-crisis
    if (phase > 100) {
      const severity = 0.7 + (civ.state.debtLoad / 100) * 0.6;
      this._applyFinancialCrisis(civ, severity, phase);
      phase = 5 + Utils.random() * 10;
      yearsSinceCrisis = 0;
    }

    phase = Utils.clamp(phase, 0, 100);

    // ── 8. CROSS-EFFECTS ─────────────────────────────────────────────────
    // Late-cycle fragility destabilizes society
    if (phase > 80) {
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - 2 * timeScale, 0, 100);
    }
    // Boom/euphoria: temporary wellbeing boost (wealth effect)
    if (phase >= 35 && phase < 75) {
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) + 0.5 * timeScale, 0, 100);
    }
    // Post-crisis: bailouts favor wealthy → inequality rises (Piketty 2014)
    if (phase < 15 && yearsSinceCrisis < 15) {
      civ.economic.wealthConcentration = Utils.clamp(
        (civ.economic.wealthConcentration ?? 30) + 1.5 * timeScale, 0, 93);
    }

    // Store state
    civ.state.minskyPhase = phase;
    civ.state.yearsSinceFinancialCrisis = yearsSinceCrisis;
  }

  _processLaborShare(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // KALDOR-PIKETTY LABOR SHARE DYNAMICS
    // Kaldor facts: labor share roughly constant at ~60-70% historically
    // Piketty (2014): when r > g, capital share rises, labor share falls
    // Karabarbounis & Neiman (2014): global decline since 1980 driven by
    //   IT capital deepening + globalization
    // Acemoglu-Restrepo: automation displaces labor tasks, new tasks restore
    // ══════════════════════════════════════════════════════════════════════
    if (!civ?.economic) return;
    let ls = civ.economic.laborShare ?? 60;
    const autoLevel = civ.state?.automationLevel ?? 0;
    const wcDegree  = civ.state?.wealthCapture?.degree ?? 0;
    const educQ     = civ.state?.educationQuality ?? 50;
    const govId     = civ.governance?.modelId ?? '';
    const econId    = civ.economic?.modelId ?? 'mixed';
    const wc        = civ.economic?.wealthConcentration ?? 30;
    const hier      = civ.governance?.hierarchyLevel ?? 5;
    const corr      = civ.state?.corruptionLevel ?? 0;
    const finDepth  = civ.state?.financialDepth ?? 30;
    const techLevel = civ.state?.technologyLevel ?? 3;

    // Calibrated to ILO/Penn World Tables: -1-2 pts/decade structural decline,
    // +/-0.5 with strong protections (Karabarbounis & Neiman 2014)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── Piketty r > g dynamics ───────────────────────────────────
    // r (return on capital) ≈ function of financial depth, wealth concentration
    // g (growth) ≈ function of tech level, education, wellbeing trend
    // When r > g: capital share grows at expense of labor
    const r_proxy = (finDepth * 0.3 + wc * 0.4 + (100 - educQ) * 0.3) / 100; // 0-1
    const g_proxy = (techLevel * 6 + educQ * 0.3 + (civ.state?.averageWellbeing ?? 50) * 0.2) / 100; // 0-1
    const r_minus_g = r_proxy - g_proxy; // positive = r > g = labor share falls
    // Piketty: r-g gap drives labor share decline at ~0.5-1.5 pts/decade
    ls -= r_minus_g * 2.0 * timeScale;

    // Automation pressure: levels 3-5 erode labor share (Acemoglu-Restrepo)
    ls += ([0, 0, 0, -0.5, -1.2, -2.5][autoLevel] ?? 0) * timeScale;

    // Wealth capture erosion
    ls -= 0.6 * (wcDegree / 100) * timeScale;

    // Capital deepening from financial sophistication (Karabarbounis & Neiman)
    if (finDepth > 50) ls -= (finDepth - 50) / 100 * 0.8 * timeScale;

    // Hierarchy pressure: highly hierarchical governance suppresses labor share
    // Moderate hierarchies (tribal, chieftain) don't systematically extract — only severe hierarchy does
    if (hier > 60) ls -= 0.008 * (hier - 60) * timeScale;

    // Corruption erosion: corruption channels income to elites
    if (corr > 20) ls -= 0.005 * (corr - 20) * timeScale;

    // Autocratic/oligarchic governance: structural suppression
    // Non-market economies lack the financial instruments for systematic extraction
    const autoExtract = (civ.economic?.currencyType === 'none') ? 0.15 : 0.5;
    if (govId === 'autocratic' || govId === 'oligarchy' ||
        govId === 'shadow_government_complicit' || govId === 'shadow_government_covert') {
      ls -= autoExtract * timeScale;
    }

    // Education quality > 60: skilled workers capture more value (human capital share)
    if (educQ > 60) ls += 0.5 * timeScale;

    // Direct/consensus governance: workers have more institutional voice
    if (govId === 'flat_consensus' || govId === 'direct_congress') ls += 1.0 * timeScale;
    else if (govId === 'rotating' || govId === 'representative') ls += 0.3 * timeScale;

    // Progressive taxation / redistribution (strong institutions + democratic)
    if (civ.state?.institutionalQuality > 65 &&
        (govId === 'representative' || govId === 'direct_congress')) {
      ls += 0.3 * timeScale; // Institutional countervailing power
    }

    // Non-accumulation models drift toward higher labor share
    if (!civ.economic.accumulationAllowed) {
      const target = { gift: 82, commons: 80, planned: 55, none: 70 }[econId] ?? 70;
      ls = Utils.lerp(ls, target, 0.03 * timeScale);
    }
    // Barter/gift economies with no currency lack the financial instruments for massive
    // capital extraction — labor share has a structural floor from direct exchange
    if (civ.economic?.currencyType === 'none') {
      const barterTarget = { barter: 60, gift: 80, commons: 78, none: 65 }[econId] ?? 65;
      if (ls < barterTarget) ls = Utils.lerp(ls, barterTarget, 0.05 * timeScale);
    }

    // Kaldor's stylized fact: labor share has a natural attractor around 60-65%
    // Very extreme values face restoring forces (social pressure, revolution risk)
    if (ls < 30) ls += 0.3 * timeScale;  // Extreme exploitation → pressure builds
    if (ls > 85) ls -= 0.2 * timeScale;  // Very high labor share → investment deficit

    // Cross-effect: low labor share boosts wealth concentration (r > g amplification)
    if (ls < 40 && civ.economic.accumulationAllowed) {
      const laborBoost = (40 - ls) / 40 * 0.015 * timeScale;
      civ.economic.wealthConcentration = Utils.clamp(
        civ.economic.wealthConcentration * (1 + laborBoost), 0, 93);
    }

    // Dual economy effect: labor share in the informal sector trends toward
    // the target model's baseline, weighted by informal share
    const deDat = civ.state?.dualEconomy;
    if (deDat && deDat.informalShare > 5 && deDat.transitionPhase !== 'none') {
      const tgt = STRUCTURAL_TARGETS[deDat.structuralTarget];
      if (tgt) {
        const targetModelId = tgt.targetModels.default;
        const targetModel = ECONOMIC_MODELS[targetModelId];
        if (targetModel) {
          // Blend labor share toward target model's baseline by informal fraction
          const targetLS = { gift: 82, commons: 80, labor_credit: 75, barter: 65, none: 70 }[targetModelId] ?? 65;
          const infFrac = deDat.informalShare / 100;
          ls = ls * (1 - infFrac) + targetLS * infFrac;
        }
      }
    }

    civ.economic.laborShare = Utils.clamp(ls, 5, 95);
  }

  // ── Bottom-Up Economic Restructuring (Dual Economy) ─────────
  // Models bottom-up economic restructuring through structural movements.
  // Adoption follows Rogers' S-curve; coordination cost follows Ostrom's
  // commons principles; governance adapts per selectorate theory.
  // In a fully currencyless economy, taxation is unnecessary — resources
  // are accessed directly. Minsky cycle ceases to apply.
  _processDualEconomy(civ) {
    if (!civ.state?.dualEconomy) return;
    const de = civ.state.dualEconomy;
    if (de.transitionPhase === 'none' || de.transitionPhase === 'complete') return;

    const s = civ.state;
    const b = s.behaviorReinforcement || {};
    const timeScale = (this.game?.timeScale ?? 25) / 25;
    const year = this.game?.currentYear ?? 0;

    // ── 1. Behavioral alignment with structural target ──────
    const target = STRUCTURAL_TARGETS[de.structuralTarget];
    if (!target) return;
    let alignment = 0;
    let alignCount = 0;
    const rb = target.requiredBehaviors || {};
    for (const [key, val] of Object.entries(rb)) {
      if (key.endsWith('_max')) {
        const bKey = key.replace('_max', '');
        alignment += Math.max(0, val - (b[bKey] ?? 50)) / val;
      } else {
        alignment += Math.min(1, (b[key] ?? 50) / val);
      }
      alignCount++;
    }
    alignment = alignCount > 0 ? (alignment / alignCount) : 0.5;

    // ── 2. Scaling model effectiveness ──────────────────────
    const sm = SCALING_MODELS[de.scalingModel];
    let scalingEffectiveness = 0.1; // baseline without a scaling model
    if (sm) {
      scalingEffectiveness = sm.coordinationReduction;
      // Check requirements
      const pop = s.population ?? 1000;
      if (sm.scaleCeiling !== Infinity && pop > sm.scaleCeiling) {
        scalingEffectiveness *= sm.scaleCeiling / pop; // degrades above ceiling
      }
      const reqs = sm.requires || {};
      if (reqs.techLevel && (s.techLevel ?? 1) < reqs.techLevel) {
        scalingEffectiveness *= 0.5;
      }
      if (reqs.institutionalQuality && (s.institutionalQuality ?? 50) < reqs.institutionalQuality) {
        scalingEffectiveness *= 0.6;
      }
      if (reqs.cooperation && (b.cooperation ?? 50) < reqs.cooperation) {
        scalingEffectiveness *= 0.7;
      }
      if (reqs.educationQuality && (s.educationQuality ?? 50) < reqs.educationQuality) {
        scalingEffectiveness *= 0.6;
      }
      if (reqs.conformity_max && (b.conformity ?? 50) > reqs.conformity_max) {
        scalingEffectiveness *= 0.7;
      }
      if (reqs.ethnicFractionalization_max && (s.ethnicFractionalization ?? 30) > reqs.ethnicFractionalization_max) {
        scalingEffectiveness *= 0.6;
      }
    }

    // ── 3. Adoption S-curve (Rogers diffusion) ──────────────
    const infShare = de.informalShare;
    // Logistic growth: fastest at 50%, slow at extremes
    const logisticFactor = 4 * (infShare / 100) * (1 - infShare / 100);
    // Network effect: nonlinear acceleration (Metcalfe analog)
    const networkEffect = Math.pow(infShare / 100, 0.7);
    // Friction brakes
    const coordFriction = de.coordinationCost / 100;
    const disruptionFriction = de.supplyChainDisruption / 100;
    // Adoption threshold: below this, adoption is very slow
    const threshold = (de.activeStructuralMovement && STRUCTURAL_MOVEMENT_PRESETS.find(
      m => m.name === de.activeStructuralMovement
    )?.adoptionThreshold) ?? 25;
    const thresholdMult = infShare < threshold ? 0.3 : 1.0;

    const adoptionDelta = (
      alignment * 2.5 *
      (0.3 + logisticFactor * 0.7) *
      (0.4 + networkEffect * 0.6) *
      (1 - coordFriction * 0.6) *
      (1 - disruptionFriction * 0.4) *
      thresholdMult *
      timeScale
    );

    // Possible reversal if coordination cost is too high
    const reversalPressure = (coordFriction > 0.7 && alignment < 0.5) ? (coordFriction - 0.5) * 1.5 * timeScale : 0;

    de.informalShare = Utils.clamp(de.informalShare + adoptionDelta - reversalPressure, 0, 100);
    de.formalShare = 100 - de.informalShare;
    de.adoptionRate = Utils.clamp(adoptionDelta - reversalPressure, -10, 10);

    // ── 4. Coordination cost (Ostrom-derived) ───────────────
    // Peaks at mid-scale, reduced by scaling model
    const rawCoordCost = 100 * Math.sin(Math.PI * de.informalShare / 100); // peaks at 50%
    de.coordinationCost = Utils.clamp(
      rawCoordCost * (1 - scalingEffectiveness) *
      (1 - (s.educationQuality ?? 50) / 200) * // education helps
      (1 - ((s.techLevel ?? 1) > 4 ? 0.15 : 0)), // high tech helps
      0, 100
    );

    // ── 5. Supply chain disruption (Leontief-derived) ───────
    // Peaks when economy is split 50/50, worse for complex economies
    const splitFactor = 1 - Math.abs(de.formalShare - de.informalShare) / 100;
    const complexityFactor = Math.min(1, (s.techLevel ?? 1) / 5); // high-tech = more disruption
    const learningCurve = Math.max(0.3, 1 - de.turnsInPhase * 0.03); // improves over time
    de.supplyChainDisruption = Utils.clamp(
      splitFactor * 60 * complexityFactor * learningCurve,
      0, 100
    );

    // ── 6. Governance response ──────────────────────────────
    if (de.informalShare > 15 && de.governanceResponse === 'none') {
      const govType = civ.governance?.modelId ?? 'representative';
      const isAutocratic = ['autocratic', 'oligarchy', 'shadow_state'].includes(govType);
      const isFlat = ['flat', 'consensus', 'elder_council'].includes(govType);

      if (isFlat) {
        de.governanceResponse = 'accommodating';
        civ.addHistoryEntry(year, 'Governance Accommodation',
          'The governance structure naturally aligns with the bottom-up economic restructuring.');
      } else if (isAutocratic && (s.stateCapacity ?? 50) > 40) {
        de.governanceResponse = 'cracking_down';
        de.coordinationCost = Utils.clamp(de.coordinationCost + 15, 0, 100);
        civ.addHistoryEntry(year, 'Government Crackdown',
          'Authorities attempt to suppress the alternative economy through enforcement.');
      } else {
        de.governanceResponse = 'accommodating';
        civ.addHistoryEntry(year, 'Government Adaptation',
          'Governance begins adapting to the emerging alternative economy.');
      }
    }

    // Crackdown dynamics: enforcement cost grows, effectiveness diminishes
    if (de.governanceResponse === 'cracking_down') {
      // Enforcement costs drain state capacity
      s.stateCapacity = Utils.clamp((s.stateCapacity ?? 50) - 0.5 * timeScale, 0, 100);
      // Beyond 40% informal, crackdown becomes unsustainable
      if (de.informalShare > 40 || (s.stateCapacity ?? 50) < 25) {
        de.governanceResponse = 'accommodating';
        de.coordinationCost = Utils.clamp(de.coordinationCost - 10, 0, 100);
        civ.addHistoryEntry(year, 'Crackdown Abandoned',
          'Enforcement costs exceed capacity — governance shifts to accommodation.');
      }
    }

    // Tax base erosion during dual phase (only while governance still needs currency)
    if (de.transitionPhase !== 'complete' && de.informalShare > 10) {
      const taxLoss = (de.informalShare / 100) * 0.3;
      s.stateCapacity = Utils.clamp((s.stateCapacity ?? 50) - taxLoss * timeScale, 0, 100);
    }

    // ── 7. Financial system scaling during transition ────────
    // Minsky, financialDepth, debtLoad scale down with formal share
    const formalFraction = de.formalShare / 100;
    if (de.informalShare > 20) {
      // Scale financial metrics by formal economy fraction
      s.minskyPhase = Utils.clamp((s.minskyPhase ?? 25) * (0.3 + formalFraction * 0.7), 0, 100);
      s.financialDepth = Utils.clamp((s.financialDepth ?? 30) * (0.5 + formalFraction * 0.5), 0, 100);
      // Debt cannot accumulate in the informal share
      s.debtLoad = Utils.clamp((s.debtLoad ?? 20) * (0.6 + formalFraction * 0.4), 0, 100);
    }

    // ── 8. Phase transitions ────────────────────────────────
    const prevPhase = de.transitionPhase;
    if (de.informalShare >= 85 && de.coordinationCost < 30) {
      de.transitionPhase = 'complete';
    } else if (de.informalShare >= 60) {
      de.transitionPhase = 'dominant';
    } else if (de.informalShare >= 40) {
      de.transitionPhase = 'tipping';
    } else if (de.informalShare >= 15) {
      de.transitionPhase = 'dual';
    } else {
      de.transitionPhase = 'emerging';
    }

    if (de.transitionPhase !== prevPhase) {
      de.turnsInPhase = 0;
      const phaseNames = {
        emerging: 'Emerging Alternative Economy',
        dual: 'Dual Economy Phase',
        tipping: 'Economic Tipping Point',
        dominant: 'Alternative Economy Dominant',
        complete: 'Economic Transition Complete',
      };
      civ.addHistoryEntry(year,
        phaseNames[de.transitionPhase] || de.transitionPhase,
        `Alternative economy reaches ${Math.round(de.informalShare)}% — ${
          de.transitionPhase === 'complete'
            ? 'the economic restructuring is complete.'
            : 'transition phase: ' + de.transitionPhase + '.'
        }`
      );
    } else {
      de.turnsInPhase++;
    }

    // ── 9. Economic model transition on completion ──────────
    if (de.transitionPhase === 'complete' && target) {
      // Determine target model
      let targetModelId = target.targetModels.default;
      if (target.targetModels.highAccumulation && (b.acquisitiveness ?? 50) > 45) {
        targetModelId = target.targetModels.highAccumulation;
      }
      if (target.targetModels.highMutualAid && (b.mutualAid ?? 50) > 60) {
        targetModelId = target.targetModels.highMutualAid;
      }

      const newModel = ECONOMIC_MODELS[targetModelId];
      if (newModel && civ.economic.modelId !== targetModelId) {
        const oldModelId = civ.economic.modelId;
        civ.economic.modelId = targetModelId;
        civ.economic.model = newModel;
        civ.economic.currencyType = newModel.currencyType;
        civ.economic.accumulationAllowed = newModel.accumulationAllowed;
        civ.economic.scarcityOrientation = newModel.scarcityOrientation;

        // Apply post-transition overrides (zeroing Minsky, financialDepth, etc.)
        if (target.postTransition) {
          for (const [key, val] of Object.entries(target.postTransition)) {
            if (key in s) { s[key] = val; }
            else if (key in civ.economic) { civ.economic[key] = val; }
          }
        }

        // Post-transition governance resource model:
        // Governance no longer collects taxes — accesses resources directly.
        // stateCapacity now driven by institutional quality and participation.
        if (newModel.currencyType === 'none') {
          s.stateCapacity = Utils.clamp(
            (s.institutionalQuality ?? 50) * 0.5 +
            (b.cooperation ?? 50) * 0.3 +
            (s.educationQuality ?? 50) * 0.2,
            10, 90
          );
        }

        // Coordination instability replaces Minsky as the ongoing risk
        de.coordinationInstability = de.coordinationCost;

        civ.addHistoryEntry(year, 'Economic Model Transition',
          `Bottom-up restructuring complete: economy transitions from ${oldModelId} to ${targetModelId}. ${
            newModel.currencyType === 'none'
              ? 'Currency is no longer used — resources are accessed directly. Taxation ceases.'
              : 'The economic structure has fundamentally changed.'
          }`
        );
      }
    }

    // ── 10. Post-completion: coordination instability ────────
    // Replaces Minsky cycle as the ongoing stability risk
    if (de.transitionPhase === 'complete') {
      // Coordination instability drifts based on institutional quality and cooperation
      const instTarget = Math.max(5,
        50 - (s.institutionalQuality ?? 50) * 0.3 -
        (b.cooperation ?? 50) * 0.2 -
        (s.educationQuality ?? 50) * 0.1 +
        (s.ethnicFractionalization ?? 30) * 0.15
      );
      de.coordinationInstability = Utils.lerp(de.coordinationInstability, instTarget, 0.05);
      // High instability reduces wellbeing (replaces financial crisis effects)
      if (de.coordinationInstability > 50) {
        s.averageWellbeing = Utils.clamp(
          (s.averageWellbeing ?? 50) - (de.coordinationInstability - 50) * 0.05 * timeScale,
          0, 100
        );
      }
    }

    // Milestone events
    const milestones = [25, 50, 75];
    for (const m of milestones) {
      if (de.informalShare >= m && de.informalShare - de.adoptionRate < m) {
        civ.addHistoryEntry(year, `${m}% Alternative Economy`,
          `${m}% of economic activity now operates outside the formal system.`);
      }
    }

    // Reversal event
    if (de.adoptionRate < -1 && de.informalShare > 5) {
      civ.addHistoryEntry(year, 'Economic Restructuring Stalling',
        'High coordination costs are causing participants to return to the formal economy.');
    }
  }

  // ── Social Trust ─────────────────────────────────────────────
  // Trust in strangers and institutions. Self-reinforcing in both
  // directions. Corruption is the strongest destroyer.
  _processSocialTrust(civ) {
    if (!civ.state) return;
    let trust = civ.state.socialTrust ?? 50;
    const corr    = civ.state.corruptionLevel ?? 0;
    const iq      = civ.state.institutionalQuality ?? 50;
    const wc      = civ.economic?.wealthConcentration ?? 30;
    const govId   = civ.governance?.modelId ?? '';
    const stab    = civ.state.stabilityIndex ?? 70;
    const atWar   = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;

    // Calibrated to WVS: +/-1-4 pts/decade, asymmetric (erosion 2-3x faster than building)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Baseline trust recovery: human social instinct (Henrich 2016).
    // People naturally cooperate and rebuild trust networks even without
    // institutional support. Post-war Germany, post-apartheid South Africa.
    trust += 0.3 * timeScale;
    // Stronger recovery when very low: regression to mean — societies at trust=5
    // rapidly reorganize around new trust networks (kinship, religious, local).
    // The lower trust goes, the faster people find alternative trust structures.
    // At trust=0, recovery is +1.0/decade; at trust=20, +0.2/decade.
    if (trust < 25) trust += 0.3 * timeScale + 0.7 * ((25 - trust) / 25) * timeScale;

    // Corruption erodes trust (strongest factor — Knack & Keefer 1997)
    if (corr > 30) trust -= 1.5 * ((corr - 30) / 70) * timeScale;

    // Institutional quality builds trust through consistent performance
    // Increased from 0.8 to 1.2 (WVS: strong institutional performance
    // rebuilds trust within a generation — Nordic countries, Singapore)
    if (iq > 60) trust += 1.2 * timeScale;
    else if (iq < 30) trust -= 0.5 * timeScale;

    // Inequality (high wealth concentration) erodes trust
    if (wc > 60) trust -= 1.0 * ((wc - 60) / 40) * timeScale;

    // Governance type (reduced from ±1.0-1.5 to ±0.2-0.4; institution quality does the heavy lifting)
    const isDemTrust = ['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId);
    if (govId === 'flat_consensus' || govId === 'direct_congress') trust += 0.3 * timeScale;
    else if (govId === 'representative' || govId === 'rotating') trust += 0.2 * timeScale;
    else if (govId === 'autocratic') trust -= 0.3 * timeScale;
    else if (govId === 'shadow_government_complicit' || govId === 'shadow_government_covert') trust -= 0.4 * timeScale;

    // Democratic stress factors (Fix R3-1c)
    if (isDemTrust) {
      // Populism pressure: high wealth concentration erodes democratic trust
      if (wc > 55) trust -= (wc - 55) * 0.02 * timeScale;
      // Oligarchic capture: wealth concentration degrades institutions over time
      if (wc > 50) civ.state.institutionalQuality = Math.max(0, iq - (wc - 50) * 0.01 * timeScale);
      // Complacency: very high institutional quality causes stagnation
      if (iq > 90) trust -= 0.1 * timeScale;
    }

    // War erodes trust
    if (atWar) trust -= 1.5 * timeScale;

    // Stable + low-corruption → trust builds (increased from 0.5 to 0.8)
    if (corr < 20 && stab > 60) trust += 0.8 * timeScale;

    // Recent paradigm shift disruption (reduced from -2.0 to -1.2)
    const activeShifts = civ.state.activeParadigmShifts || [];
    if (activeShifts.length > 0) trust -= 1.2 * timeScale;

    // Cross-effects: trust ↔ institutional quality feedback loop
    // IQ drain reduced from -0.3 to -0.15, with floor at 15 (institutions
    // don't disappear just because trust is low — bureaucracies persist)
    if (trust < 30) {
      const iqFloor = 15;
      if ((civ.state.institutionalQuality ?? 50) > iqFloor) {
        civ.state.institutionalQuality = Utils.clamp(
          (civ.state.institutionalQuality ?? 50) - 0.15 * timeScale, iqFloor, 100);
      }
    } else if (trust > 70) {
      civ.state.institutionalQuality = Utils.clamp(
        (civ.state.institutionalQuality ?? 50) + 0.15 * timeScale, 0, 100);
    }

    // Diminishing returns at very high trust (Fix R3-1): no society sustains perfect trust
    // Even high-trust Scandinavian countries score ~65-70 on WVS, not 100.
    // Internal tensions, generational shifts, immigration friction, media polarization.
    if (trust > 80) {
      const excess = trust - 80;
      trust -= excess * excess * 0.01 * timeScale; // Quadratic: steeper pushback at extremes
    }

    civ.state.socialTrust = Utils.clamp(trust, 0, 100);
  }

  // ── State Capacity ──────────────────────────────────────────
  // Ability to implement policy (fiscal, administrative, coercive).
  // Distinct from institutional quality (design vs implementation).
  // An autocracy can have HIGH capacity; a democracy may have LOW.
  _processStateCapacity(civ) {
    if (!civ.state) return;
    let cap = civ.state.stateCapacity ?? 50;
    const corr  = civ.state.corruptionLevel ?? 0;
    const iq    = civ.state.institutionalQuality ?? 50;
    const educQ = civ.state.educationQuality ?? 50;
    const stab  = civ.state.stabilityIndex ?? 70;
    const wc    = civ.economic?.wealthConcentration ?? 30;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;

    // Calibrated to V-Dem/WGI: +1-8 pts/decade build, -15-40 pts/decade collapse (highly asymmetric)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Baseline capacity growth: bureaucracies naturally professionalize over time
    // through institutional learning (March & Olsen 1989). Even without favorable
    // conditions, states slowly accumulate administrative knowledge.
    cap += 0.2 * timeScale;

    // R4b: Diminishing decay at low capacity — when state capacity is already
    // near zero, there's nothing left to erode. You can't dismantle institutions
    // that don't exist. This prevents the death spiral where cap=5 still loses
    // -4/decade from multiple drains. Historical: collapsed states (Somalia, Libya)
    // reach a stable low equilibrium, not zero — some local governance always persists.
    const decayDamping = cap < 25 ? (cap / 25) : 1.0;

    // Corruption directly undermines capacity (Ibn Khaldun cycle)
    if (corr > 40) cap -= 1.5 * ((corr - 40) / 60) * timeScale * decayDamping;

    // Good institutional design helps capacity grow (increased from 0.8 to 1.0)
    if (iq > 60) cap += 1.0 * timeScale;
    else if (iq < 25) cap -= 0.5 * timeScale * decayDamping;

    // Education: skilled bureaucrats improve administration
    if (educQ > 50) cap += 0.3 * timeScale;

    // Stability lets bureaucracy professionalize
    if (stab > 70) cap += 0.5 * timeScale;
    else if (stab < 30) cap -= 1.5 * timeScale * decayDamping;

    // War diverts resources from civilian administration
    if (atWar) cap -= 1.0 * timeScale * decayDamping;

    // Broad tax base (lower wealth concentration) improves fiscal capacity
    if (wc < 40) cap += 0.3 * timeScale;
    else if (wc > 75) cap -= 0.5 * timeScale * decayDamping; // oligarchic capture weakens state

    // Cross-effect: low state capacity reduces policy effectiveness
    // (This is checked by event handlers that multiply magnitudes)

    // ── R4b-2: Legitimacy-maintained cap floor (entropy-inspired) ──
    // A society with strong legitimacy (religious, traditional, ideological)
    // maintains basic administrative capacity even under corruption pressure.
    // Ottoman sultanic legitimacy, Chinese mandate of heaven, Soviet ideology
    // all sustained state capacity beyond what institutions alone would predict.
    // Without this, the WC>75 cap decay creates a vicious cycle:
    // WC↑ → cap↓ → IQ floor↓ → IQ↓ → cap↓ (via iq<25 penalty) → collapse
    const leg = civ.state.legitimacyLevel ?? 0;
    // R4b: Strengthened — add absolute minimum of 8 (any surviving polity
    // collects SOME tax, maintains SOME roads, has SOME administration)
    const capFloor = Math.min(Math.max(leg * 0.4 + (civ.state.educationQuality ?? 0) * 0.15, 8), 35);
    if (cap < capFloor) {
      cap += (capFloor - cap) * 0.3 * timeScale;
    }

    civ.state.stateCapacity = Utils.clamp(cap, 0, 100);
  }

  // ── Energy Systems / EROI ───────────────────────────────────
  // Energy source auto-advances with tech adoption. EROI computed
  // from source + resource health. Surplus constrains innovation.
  _processEnergy(civ) {
    if (!civ.state) return;
    const techs = civ.state.adoptedTechnologies ?? [];
    const prevSource = civ.state.energySource ?? 'wood';

    // Derive energy source from most advanced adopted energy tech
    let source = 'wood';
    if (techs.includes('Fusion Power'))          source = 'fusion';
    else if (techs.includes('Renewable Energy')) source = 'renewable';
    else if (techs.includes('Nuclear Power'))    source = 'nuclear';
    else if (techs.includes('Oil / Petroleum'))  source = 'oil';
    else if (techs.includes('Coal Power') || techs.includes('Steam Engine')) source = 'coal';

    // Compute EROI from source (fossil fuels decline with mineral depletion)
    const baseEROI = { wood: 3, coal: 35, oil: 60, nuclear: 75, renewable: 15, fusion: 50 };
    let eroi = baseEROI[source] ?? 3;
    if (source === 'coal' || source === 'oil') {
      const mineralHealth = (civ.state.resourceDepletion?.minerals ?? 100) / 100;
      eroi = eroi * (0.3 + 0.7 * mineralHealth);
    }
    // Tech level efficiency bonus
    const techBonus = Math.min((civ.state.technologyLevel ?? 1) * 0.03, 0.3);
    eroi *= (1 + techBonus);

    // Energy surplus: EROI minus minimum for civilizational complexity
    const complexityThreshold = 5;
    const surplus = eroi - complexityThreshold;

    civ.state.energyEROI = Math.round(eroi * 10) / 10;
    civ.state.energySurplus = Math.round(surplus * 10) / 10;
    civ.state.energySource = source;

    // ── Fossil fuel → pollution link ──
    // Coal and oil are the PRIMARY drivers of industrial pollution and CO2 emissions.
    // Historical: London Great Smog (1952), acid rain, ozone depletion, climate change.
    // Renewable/nuclear/fusion produce minimal pollution; wood produces some but dispersed.
    const timeScalePol = (this.game.yearsDelta || 10) / 10;
    const pop = civ.state.population ?? 500;
    const popScale = Math.min(2.0, pop / 2000); // larger populations produce more pollution
    if (source === 'coal') {
      // Coal: worst polluter — particulates, SO2, CO2, ash
      civ.state.pollutionIndex = Utils.clamp(
        (civ.state.pollutionIndex ?? 0) + 0.8 * popScale * timeScalePol, 0, 100);
      civ.state.globalWarmingContribution = Utils.clamp(
        (civ.state.globalWarmingContribution ?? 0) + 0.5 * popScale * timeScalePol, 0, 100);
    } else if (source === 'oil') {
      // Oil: significant polluter but cleaner than coal
      civ.state.pollutionIndex = Utils.clamp(
        (civ.state.pollutionIndex ?? 0) + 0.5 * popScale * timeScalePol, 0, 100);
      civ.state.globalWarmingContribution = Utils.clamp(
        (civ.state.globalWarmingContribution ?? 0) + 0.6 * popScale * timeScalePol, 0, 100);
    } else if (source === 'renewable' || source === 'nuclear' || source === 'fusion') {
      // Clean energy: actively reduces pollution (replacing dirty infrastructure)
      // Historical: EU emissions trading, Paris Agreement targets
      civ.state.pollutionIndex = Utils.clamp(
        (civ.state.pollutionIndex ?? 0) - 0.3 * timeScalePol, 0, 100);
      civ.state.globalWarmingContribution = Utils.clamp(
        (civ.state.globalWarmingContribution ?? 0) - 0.1 * timeScalePol, 0, 100);
    }
    // Wood: minimal industrial pollution (dispersed, low-intensity)

    // Cross-effects
    // Low surplus constrains innovation (stored for _checkTechnologyUnlocks)
    civ.state._energyInnovationPenalty = surplus < 5 ? Math.max(0.2, surplus / 5) : 1.0;

    // Negative surplus: simplification pressure (Tainter collapse dynamic)
    // But only when deficit is significant — pre-industrial civs with wood (EROI 3)
    // have always had marginal surpluses; the collapse pressure applies when
    // a society's complexity demands MUCH more energy than available
    const timeScaleE = (this.game.yearsDelta || 10) / 10;
    if (surplus < -5) {
      // Severe deficit: active Tainter collapse pressure
      const deficitSeverity = Math.min(1, Math.abs(surplus + 5) / 20); // scales 0-1 for deficit -5 to -25
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 1.5 * deficitSeverity * timeScaleE, 0, 100);
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 1.0 * deficitSeverity * timeScaleE, 0, 100);
    } else if (surplus < 0) {
      // Mild deficit: marginal stress but not civilizational collapse
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 0.1 * timeScaleE, 0, 100);
    }

    // Energy transition → anomie spike (not from wood, which is the default start)
    if (source !== prevSource && prevSource !== 'wood') {
      civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 5, 0, 100);
      const yr = this.game?.currentYear ?? 0;
      const sourceLabels = { wood: 'Wood/Animal', coal: 'Coal', oil: 'Oil/Petroleum',
        nuclear: 'Nuclear', renewable: 'Renewable', fusion: 'Fusion' };
      civ.addHistoryEntry(yr, `Energy Transition: ${sourceLabels[source]}`,
        `Primary energy shifted from ${sourceLabels[prevSource]} to ${sourceLabels[source]}. EROI: ${civ.state.energyEROI}:1. Social disruption from transition.`, 'energy_transition');
      this.game.ui?.showNotification(`${civ.name}: Energy transition to ${sourceLabels[source]} (EROI ${civ.state.energyEROI}:1)`, 'info');
    }
  }

  // ── Carrying Capacity / Ecological Overshoot ────────────────
  // Derived from resource health. When demand exceeds capacity for
  // extended periods, cascading failures begin (HANDY model).
  _processCarryingCapacity(civ) {
    if (!civ.state) return;
    const dep = civ.state.resourceDepletion ?? {};

    // Ecological capacity from resource health
    const avgResource = ((dep.forests ?? 100) + (dep.soil ?? 100) + (dep.water ?? 100)) / 3;
    const pollPenalty = (civ.state.pollutionIndex ?? 0) / 100 * 30;
    const techBonus = Math.min((civ.state.technologyLevel ?? 1) * 3, 25);
    const infraBonus = (civ.state.infrastructureLevel ?? 35) / 100 * 15;
    const capacity = Utils.clamp(avgResource - pollPenalty + techBonus + infraBonus, 5, 120);

    // Demand from population + complexity (Tainter: complexity has rising costs)
    const popFactor = Math.log10(Math.max(civ.state.population ?? 1000, 100)) * 10;
    const techLevel = civ.state.technologyLevel ?? 1;
    const complexityCost = techLevel * 4;
    const demand = popFactor + complexityCost;

    const overshootRatio = demand / Math.max(capacity, 1);
    civ.state.ecologicalCapacity = Math.round(capacity);
    civ.state.overshootRatio = Math.round(overshootRatio * 100) / 100;

    // Track consecutive overshoot turns
    if (overshootRatio > 1) {
      civ.state.overshootTurns = (civ.state.overshootTurns ?? 0) + 1;
    } else {
      civ.state.overshootTurns = Math.max(0, (civ.state.overshootTurns ?? 0) - 1);
    }

    // Cascading effects when in overshoot
    if (overshootRatio > 1) {
      // Accelerate resource depletion
      const accel = (overshootRatio - 1) * 0.5;
      for (const key of ['forests', 'soil', 'water', 'minerals']) {
        if (dep[key] !== undefined) {
          dep[key] = Math.max(0, dep[key] - accel);
        }
      }
    }

    const timeScaleCC = (this.game.yearsDelta || 10) / 10;
    const oTurns = civ.state.overshootTurns ?? 0;
    if (oTurns > 10 && overshootRatio > 1.2) {
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 1.5 * timeScaleCC, 0, 100);
    }

    // Severe overshoot: civilizational simplification pressure
    if (oTurns > 20 && overshootRatio > 1.5 && Utils.random() < 0.04) {
      const yr = this.game?.currentYear ?? 0;
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 5, 0, 100);
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 3, 0, 100);
      civ.addHistoryEntry(yr, 'Ecological Collapse Pressure',
        `Demand has exceeded ecological capacity for ${oTurns} turns (${overshootRatio.toFixed(1)}x). Civilizational complexity unsustainable — simplification pressure mounting.`, 'ecological_collapse');
      this.game.ui?.showNotification(`${civ.name}: Ecological collapse pressure — overshoot for ${oTurns} turns`, 'danger');
    }
  }

  // ── Infrastructure / Maintenance Debt ───────────────────────
  // Infrastructure built slowly, decays without maintenance.
  // Maintenance debt accumulates nonlinearly (the maintenance trap).
  _processInfrastructure(civ) {
    if (!civ.state) return;
    let infra = civ.state.infrastructureLevel ?? 35;
    let debt = civ.state.maintenanceDebt ?? 0;
    const cap = civ.state.stateCapacity ?? 50;
    const fd = civ.state.financialDepth ?? 30;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;

    // Calibrated to World Bank/ASCE: +3-7 pts/decade with investment, slow to build,
    // fast to destroy in conflict (-5-20 pts/decade). Near-ceiling slows (+0.5-1 >90%)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Natural growth (requires state capacity + financial resources OR communal labor)
    const ceilingDamp = infra > 90 ? 0.3 : 1.0;
    const econId = civ.economic?.modelId ?? civ.governance?.economicModelId ?? '';
    // Commons/gift economies build infrastructure through communal labor, not financial markets
    // Historical: communal societies (Inca mit'a, Egyptian corvée, village commons) built significant
    // infrastructure without financial markets — roads, irrigation, granaries, walls
    const communalLabor = (econId === 'commons' || econId === 'gift' || econId === 'barter') ? 0.5 * (cap / 100) : 0;
    const growth = (0.3 * (cap / 100) * (fd / 100) + communalLabor) * ceilingDamp;
    infra += growth * timeScale;

    // Depreciation (always ticking; higher infra = more maintenance needed)
    // Low-infra societies have less to maintain; depreciation scales with infrastructure
    const depreciation = (0.03 + infra * 0.002) * timeScale;

    // Investment capacity (what society can actually maintain)
    // Commons/gift economies maintain through communal effort
    const communalMaint = (econId === 'commons' || econId === 'gift' || econId === 'barter') ? 0.3 * (cap / 100) * timeScale : 0;
    const investmentCapacity = (cap / 100) * (fd / 100) * 0.15 * timeScale + communalMaint;
    const gap = depreciation - investmentCapacity;
    if (gap > 0) {
      debt += gap * 2; // debt accumulates faster than the gap (nonlinear)
      infra -= gap;
    } else {
      // Surplus capacity reduces debt
      debt = Math.max(0, debt + gap * 0.5);
    }

    // Debt compounds: existing debt increases maintenance cost (reduced from 0.05)
    infra -= debt * 0.03 * timeScale;

    // War destroys infrastructure
    if (atWar) { infra -= 3.0 * timeScale; debt += 1.5 * timeScale; }

    // Urbanization-based infrastructure floor: urbanized societies maintain minimum infra
    const urbanRate = civ.state.urbanizationRate ?? 0;
    const infraFloor = Math.min(urbanRate * 0.3, 25);
    civ.state.infrastructureLevel = Utils.clamp(Math.max(infra, infraFloor), 0, 100);
    civ.state.maintenanceDebt = Utils.clamp(debt, 0, 100);

    // Cross-effects
    if (infra > 60) {
      civ.state.tradeDependency = Utils.clamp((civ.state.tradeDependency ?? 20) + 0.3 * timeScale, 0, 100);
      civ.state.stateCapacity = Utils.clamp((civ.state.stateCapacity ?? 50) + 0.15 * timeScale, 0, 100);
    }
    if (infra < 25) {
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 0.5 * timeScale, 0, 100);
    }
    // Maintenance debt creates fiscal pressure
    if (debt > 30) {
      civ.state.debtLoad = Utils.clamp((civ.state.debtLoad ?? 20) + 0.5 * timeScale, 0, 100);
    }
  }

  // ── Anomie / Deaths of Despair ──────────────────────────────
  // The human cost of rapid change. Without this, paradigm shifts,
  // energy transitions, and automation have no social fallout.
  // Durkheim + Case & Deaton.
  _processAnomie(civ) {
    if (!civ.state) return;
    let anomie = civ.state.anomieLevel ?? 0;
    const trust = civ.state.socialTrust ?? 50;
    const mob = civ.state.socialMobility ?? 50;
    const wb = civ.state.averageWellbeing ?? 50;
    const wc = civ.economic?.wealthConcentration ?? 30;
    const infra = civ.state.infrastructureLevel ?? 35;
    const autoLevel = civ.state.automationLevel ?? 0;

    // Calibrated to Case & Deaton / post-Soviet data: onset fast (-10-25 pts/decade),
    // recovery slow (+3-5 pts/decade without policy, +5-10 with). Highly asymmetric.
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Natural recovery: communities adapt, mutual aid grows organically, religious institutions
    // provide meaning. Increased from 0.8 to 1.5 — Case & Deaton recovery with intervention
    // is +5-10 pts/decade. 1.5 accounts for non-policy community self-organization.
    anomie -= 1.5 * timeScale;

    // Self-limiting at extreme levels: anomie above 70 has accelerating recovery.
    // At 100% anomie, society has fully adapted to dysfunction — the "anomie" itself
    // becomes the new normal. Crime lords provide order, informal economies emerge,
    // religious movements spread. The system can't sustain 100% anomie indefinitely.
    // Historical: post-Soviet Russia, post-collapse societies all find new equilibria.
    if (anomie > 70) {
      anomie -= 0.5 * ((anomie - 70) / 30) * timeScale;
    }

    // Community stability reduces anomie
    if (trust > 60) anomie -= 0.5 * timeScale;
    if (mob > 60) anomie -= 0.3 * timeScale;
    const fam = civ.state.familyStructure ?? 'nuclear';
    if (fam === 'extended' || fam === 'community_clan') anomie -= 0.5 * timeScale;

    // ── Drivers that increase anomie ──
    // Accumulated with diminishing returns: multiple simultaneous crises have
    // less marginal impact per-factor (Boin & 't Hart 2007).
    const ps = civ.state.paradigmShiftState ?? {};
    const activeShifts = ps.activeShifts ?? [];
    let anomieGrowth = 0;
    let growthFactors = 0;

    // Active paradigm shifts (reduced from 3.0 to 2.0)
    if (activeShifts.length > 0) { anomieGrowth += 2.0; growthFactors++; }
    // Automation disruption (levels 3-5)
    if (autoLevel >= 3) { anomieGrowth += 1.0 * (autoLevel - 2); growthFactors++; }
    // High inequality + low mobility = despair (Great Gatsby trap)
    if (wc > 60 && mob < 40) { anomieGrowth += 1.5; growthFactors++; }
    // Low trust deepens anomie
    if (trust < 30) { anomieGrowth += 1.0; growthFactors++; }
    // Low wellbeing
    if (wb < 35) { anomieGrowth += 1.0; growthFactors++; }
    // Infrastructure collapse
    if (infra < 20) { anomieGrowth += 1.0; growthFactors++; }
    // Ecological overshoot stress
    if ((civ.state.overshootRatio ?? 0.5) > 1.2) { anomieGrowth += 1.5; growthFactors++; }
    // Food insecurity drives despair
    if ((civ.state.foodSecurity ?? 60) < 25) { anomieGrowth += 1.5; growthFactors++; }

    // Apply diminishing returns: sqrt(n)/n dampening
    // 1 factor: 100%, 2: 71% each, 4: 50% each, 9: 33% each
    if (growthFactors > 0) {
      const dampening = Math.sqrt(growthFactors) / growthFactors;
      anomie += anomieGrowth * dampening * timeScale;
    }

    anomie = Utils.clamp(anomie, 0, 100);

    // Cross-effects of anomie (magnitudes reduced for balance)
    if (anomie > 30) {
      // Wellbeing drain: reduced from -0.5 to -0.3
      civ.state.averageWellbeing = Utils.clamp(wb - 0.3 * timeScale, 0, 100);
      // Stability drain: reduced from -0.4 to -0.25
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 0.25 * timeScale, 0, 100);
    }
    if (anomie > 50) {
      // Trust drain: reduced from -0.3 to -0.15
      civ.state.socialTrust = Utils.clamp(trust - 0.15 * timeScale, 0, 100);
    }
    // Deaths of despair: high anomie + low wellbeing → population growth penalty
    if (anomie > 60 && wb < 40) {
      civ.state._demographicBirthMod = (civ.state._demographicBirthMod ?? 0) - 0.5 * timeScale;
    }
    // Severe anomie: random despair events
    if (anomie > 70 && Utils.random() < 0.03) {
      const yr = this.game?.currentYear ?? 0;
      civ.addHistoryEntry(yr, 'Deaths of Despair Rising',
        `Anomie at ${Math.round(anomie)}. Substance abuse, social isolation, and loss of meaning spreading through lower strata.`, 'anomie_crisis');
      this.game.ui?.showNotification(`${civ.name}: Deaths of despair rising — anomie at ${Math.round(anomie)}`, 'danger');
    }

    civ.state.anomieLevel = anomie;
  }

  // ── Urbanization Rate ───────────────────────────────────────
  // Fraction of population in cities. Drives tax collection, innovation,
  // and agglomeration — but high urbanization without infrastructure or
  // food security causes slums and instability.
  _processUrbanization(civ) {
    if (!civ.state) return;
    let urban = civ.state.urbanizationRate ?? 15;
    const infra = civ.state.infrastructureLevel ?? 35;
    const techLevel = civ.state.technologyLevel ?? 1;
    const econId = civ.economic?.modelId ?? civ.governance?.economicModelId ?? '';
    const isMarket = econId === 'market' || econId === 'mixed';
    const foodSec = civ.state.foodSecurity ?? 60;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;

    // Calibrated to UN World Urbanization Prospects: +3-8 pts/decade developing,
    // +1-2 pts/decade already-urbanized. Essentially monotonic (Henderson 2003)
    const timeScale = (this.game.yearsDelta || 10) / 10;
    // Era-gating: pre-industrial urbanization was very slow (< 5% before 1800)
    // Ancient cities existed but vast majority of population was rural
    const urbanTechMult = techLevel < 2 ? 0.08 : techLevel < 4 ? 0.2 : techLevel < 6 ? 0.5 : 1.0;
    // Era-appropriate urbanization ceiling (ancient ~15%, medieval ~20%, early modern ~30%, industrial+: 100%)
    const urbanCeiling = techLevel < 2 ? 15 : techLevel < 4 ? 25 : techLevel < 6 ? 50 : 100;
    // Diminishing rate as ceiling approaches (UN data: slows above 80%)
    const ceilingDamp = urban > urbanCeiling * 0.8 ? 0.1 : (urban > urbanCeiling * 0.6 ? 0.4 : 1.0);
    const growthPressure = ((infra / 100) * 1.5 + techLevel * 0.4 + (isMarket ? 0.5 : 0)) * ceilingDamp * urbanTechMult;
    // Decay pressure: food insecurity + war (urbanization almost never reverses)
    const decayPressure = (foodSec < 30 ? 0.3 : 0) + (atWar ? 0.5 : 0);
    urban += (growthPressure - decayPressure) * timeScale;
    urban = Utils.clamp(urban, 0, 100);

    // Cross-effects
    if (urban > 50) {
      civ.state.stateCapacity = Utils.clamp((civ.state.stateCapacity ?? 50) + 0.15 * timeScale, 0, 100);
    }
    // Agglomeration effects: urbanization × education → nonlinear innovation
    // Glaeser 2011: cities are "engines of innovation" via knowledge spillovers
    // Moretti 2012: doubling city size → 2-4% productivity gain (superlinear scaling)
    // Effect strongest when high urbanization meets high education (university cities)
    if (urban > 40) {
      const educQ = civ.state.educationQuality ?? 50;
      const urbanFactor = (urban - 40) / 60; // 0-1 as urban goes 40→100
      const educFactor = educQ / 100; // 0-1
      // Base linear boost + nonlinear clustering bonus when both are high
      const linearBoost = 0.3 * urbanFactor;
      const clusterBonus = 0.5 * Math.pow(urbanFactor * educFactor, 1.5); // superlinear
      civ.state.behaviorReinforcement = civ.state.behaviorReinforcement ?? {};
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation ?? 50) + (linearBoost + clusterBonus) * timeScale, 0, 100);
    }
    if (urban > 70 && foodSec < 40) {
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 0.8 * timeScale, 0, 100);
    }
    if (urban > 80 && infra < 40) {
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 0.5 * timeScale, 0, 100);
    }

    civ.state.urbanizationRate = urban;

    // ── Urban-Rural Divide (Regional Variation) ──────────────
    // High urbanization + high inequality = large urban-rural gap.
    // Rural areas feel left behind → populism, political polarization.
    // US: Trump's rural base, Brexit: London vs rest of UK, France: gilets jaunes.
    // Effect: stability pressure, political polarization, reduced social cohesion.
    if (urban > 50) {
      const inequality = civ.economic?.wealthConcentration ?? 30;
      const divide = (urban - 50) / 50 * (inequality / 100); // 0-1 scale
      if (divide > 0.3) {
        // Significant urban-rural divide
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - divide * 0.3 * timeScale, 0, 100);
        civ.state.socialCohesion = Utils.clamp(
          (civ.state.socialCohesion ?? 50) - divide * 0.2 * timeScale, 0, 100);
        // Increases anomie in rural areas (anomie of being left behind)
        civ.state.anomieLevel = Utils.clamp(
          (civ.state.anomieLevel ?? 0) + divide * 0.15 * timeScale, 0, 100);
      }
    }
  }

  // ── Military-Civilian Power Balance ────────────────────────
  // Models the tension between military and civilian control.
  // High military power + low civilian control + crisis = coup risk.
  // 61% of democracies that died 1789-2008 fell to military coups.
  // ── Military-Civilian Balance — Powell & Thyne coup dataset ────────
  // Evidence-based model:
  //   1. Powell & Thyne 2011: global coup dataset 1950-2010. Key predictors:
  //      - Recent coup history (coup trap): strongest single predictor
  //      - Low GDP/capita (poverty): 2-3x higher risk
  //      - Military spending/GDP ratio: inverse-U (too high = praetorian)
  //      - Regime type: personalist autocracies most vulnerable
  //   2. Huntington 1957/1968: praetorianism from weak civilian institutions
  //      Military intervenes when civilian politics fail, not necessarily
  //      when military is strong — gap theory (mil professionalism vs civ control)
  //   3. Nordhaus-Oneal: military spending crowds out productive investment
  //   4. Feaver 2003: civil-military gap widens under prolonged warfare
  // Sources: Powell & Thyne 2011, Huntington 1957/1968, Nordlinger 1977,
  //          Feaver 2003, Acemoglu et al. 2010, Collier & Hoeffler 2007
  _processMilitaryCivilianBalance(civ) {
    if (!civ.state) return;
    let milPower = civ.state.militaryPower ?? 30;
    let civControl = civ.state.civilianControl ?? 50;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;
    const iq = civ.state.institutionalQuality ?? 50;
    const govId = civ.governance?.modelId ?? '';
    const stability = civ.state.stabilityIndex ?? 70;
    const foodSec = civ.state.foodSecurity ?? 60;
    const cap = civ.state.stateCapacity ?? 50;
    const wellbeing = civ.state.averageWellbeing ?? 50;
    const legitimacy = civ.state.legitimacyLevel ?? 50;
    const trust = civ.state.socialTrust ?? 50;

    // Calibrated to SIPRI: +/-2-5 pts/decade peacetime, +10-30 wartime
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const isDemocratic = ['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId);

    // ── 1. Military power drift ──
    if (atWar) milPower += 3.0 * timeScale; // wartime mobilization
    if (milPower > 60) milPower += 0.5 * timeScale; // institutional momentum (MIC)
    if (!atWar && civControl > 60) milPower -= 1.0 * timeScale; // peace dividend
    // Threat perception: neighbors at war or hostile → mil buildup
    const neighborThreats = this.activeWars.filter(w =>
      w.attacker !== civ.id && w.defender !== civ.id).length;
    if (neighborThreats > 0) milPower += 0.5 * Math.min(neighborThreats, 3) * timeScale;

    // ── 2. Civilian control drift — Huntington professionalism theory ──
    // Strong institutions build professional, apolitical military
    if (iq > 60) civControl += 0.5 * timeScale;
    if (isDemocratic) civControl += 0.4 * timeScale; // democratic norm of civ supremacy
    if (govId === 'autocratic' && milPower > 50) civControl -= 0.6 * timeScale;
    if (atWar) civControl -= 0.4 * timeScale; // Feaver 2003: wartime erosion
    // High legitimacy strengthens civilian authority
    if (legitimacy > 65) civControl += 0.2 * timeScale;
    if (legitimacy < 30) civControl -= 0.3 * timeScale;

    milPower = Utils.clamp(milPower, 0, 100);
    civControl = Utils.clamp(civControl, 0, 100);

    // ── 3. Coup risk — Powell & Thyne 2011 empirical model ──
    // Base rate: ~2% per year globally, ~5% for at-risk states
    // We compute per-decade probability then adjust for timeScale
    let coupRiskBase = 0.02; // 2% per decade baseline

    // (a) Powell & Thyne: strongest predictor is recent coup history (coup trap)
    const yearsSinceCoup = civ.state._yearsSinceCoup ?? 100;
    if (yearsSinceCoup < 10) coupRiskBase *= 3.0;       // recent coup: 3x risk
    else if (yearsSinceCoup < 30) coupRiskBase *= 1.8;   // within generation
    else if (yearsSinceCoup < 50) coupRiskBase *= 1.3;   // fading memory

    // (b) Military-civilian gap: Huntington's gap theory
    const milCivGap = milPower - civControl;
    if (milCivGap > 30) coupRiskBase *= 2.5;
    else if (milCivGap > 20) coupRiskBase *= 1.8;
    else if (milCivGap > 10) coupRiskBase *= 1.3;
    else if (milCivGap < -10) coupRiskBase *= 0.3; // strong civ control = low risk

    // (c) Economic crisis: Collier & Hoeffler 2007
    const debtLoad = civ.state.debtLoad ?? 20;
    const economicCrisis = debtLoad > 70 || (civ.state.financialDepth ?? 30) < 15;
    if (economicCrisis) coupRiskBase *= 2.0;
    if (wellbeing < 30) coupRiskBase *= 1.5;

    // (d) Food crisis: Lagi et al. correlate with military intervention
    if (foodSec < 25) coupRiskBase *= 1.8;

    // (e) Regime type: personalist autocracies most vulnerable (Geddes 2003)
    if (govId === 'autocratic') coupRiskBase *= 1.5;
    if (isDemocratic && iq > 60) coupRiskBase *= 0.3; // consolidated democracy

    // (f) Political instability: low stability = opportunity for plotters
    if (stability < 30) coupRiskBase *= 2.0;
    else if (stability < 50) coupRiskBase *= 1.4;

    // (g) Low legitimacy: Nordlinger 1977 — mil sees itself as savior
    if (legitimacy < 25) coupRiskBase *= 1.6;

    // Cap at ~40% per decade (even worst cases)
    const coupProb = Math.min(coupRiskBase, 0.40);
    const adjustedCoupProb = 1 - Math.pow(1 - coupProb, timeScale);

    if (adjustedCoupProb > 0 && Utils.random() < adjustedCoupProb) {
      // ── Military coup! ──
      const yr = this.game?.currentYear ?? 0;
      const prevGovLabel = civ.governance?.model?.label ?? govId;

      // Coup success depends on state capacity + social trust (resistance)
      // Powell & Thyne: ~50% of attempts succeed
      const successChance = 0.4 + (milCivGap > 20 ? 0.2 : 0) + (stability < 25 ? 0.15 : 0)
                           - (trust > 60 ? 0.15 : 0) - (cap > 60 ? 0.1 : 0);
      if (Utils.random() < successChance) {
        // Successful coup
        if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS.autocratic) {
          civ.governance.modelId = 'autocratic';
          civ.governance.model = GOVERNANCE_MODELS.autocratic;
          civ.governance.hierarchyLevel = 80;
          civ.governance.powerConcentration = 85;
        }
        civ.governance.leader = {
          name: (civ.governance.leader?.name?.split(' ')[0] ?? 'General') + ' the Usurper',
          title: 'Military Commander',
          age: 40 + Math.floor(Utils.random() * 15),
          healthIndex: 80 + Math.floor(Utils.random() * 20),
          yearsInPower: 0,
        };
        civControl = 15;
        civ.state.stabilityIndex = Utils.clamp(stability + 10, 0, 100); // martial order
        civ.state.legitimacyLevel = Utils.clamp(legitimacy - 15, 0, 100);
        civ.state.legitimacyType = 'charismatic';
        civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 8, 0, 100);
        civ.state.collectiveTrauma = Utils.clamp((civ.state.collectiveTrauma ?? 0) + 5, 0, 100);
        civ.state._yearsSinceCoup = 0; // reset coup trap counter

        civ.addHistoryEntry(yr, 'Military Coup',
          `The military has seized power in ${civ.name}, overthrowing the ${prevGovLabel} government. Civilian institutions suspended. Martial law declared.`, 'military_coup');
        this.game.ui?.showNotification(`${civ.name}: Military coup! Government overthrown.`, 'danger');
      } else {
        // Failed coup attempt — still destabilizing
        civ.state.stabilityIndex = Utils.clamp(stability - 8, 0, 100);
        civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 5, 0, 100);
        civControl = Utils.clamp(civControl + 10, 0, 100); // counter-coup: tighten control
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Failed Coup Attempt',
          `A military faction attempted to seize power in ${civ.name} but was repelled. Political tensions remain high.`, 'failed_coup');
        this.game.ui?.showNotification(`${civ.name}: Failed coup attempt! Stability shaken.`, 'warning');
      }
    }

    // Increment coup memory
    civ.state._yearsSinceCoup = (civ.state._yearsSinceCoup ?? 100) + (this.game.yearsDelta || 10);

    // ── 4. Cross-effects — Nordhaus-Oneal military burden ──
    // Military spending crowds out productive investment
    const milBurden = milPower / (cap || 1); // ratio of mil to state capacity
    if (milBurden > 1.0) {
      // Guns vs butter: excessive military drains economy
      civ.state.debtLoad = Utils.clamp((civ.state.debtLoad ?? 20) + 0.4 * milBurden * timeScale, 0, 100);
      // Crowds out education and infrastructure spending
      if (milPower > 70) {
        civ.state.educationQuality = Utils.clamp(
          (civ.state.educationQuality ?? 50) - 0.2 * timeScale, 0, 100);
      }
    }
    // High military + low oversight → freedom erosion
    if (milPower > 70 && civControl < 50) {
      const freedom = civ.operatingPrinciples?.freedomLevel ?? 60;
      if (civ.operatingPrinciples) {
        civ.operatingPrinciples.freedomLevel = Utils.clamp(freedom - 0.4 * timeScale, 0, 100);
      }
    }
    // Strong civilian control builds institutional quality (virtuous cycle)
    if (civControl > 70 && isDemocratic) {
      civ.state.institutionalQuality = Utils.clamp(iq + 0.3 * timeScale, 0, 100);
    }

    civ.state.militaryPower = milPower;
    civ.state.civilianControl = civControl;
  }

  // ── Legitimacy Type ────────────────────────────────────────
  // Weber's tripartite framework: traditional, charismatic, rational-legal.
  // Determines succession stability and crisis response dynamics.
  _processLegitimacy(civ) {
    if (!civ.state) return;
    let legLevel = civ.state.legitimacyLevel ?? 50;
    const legType = civ.state.legitimacyType ?? 'traditional';
    const iq = civ.state.institutionalQuality ?? 50;
    const trust = civ.state.socialTrust ?? 50;
    const corr = civ.state.corruptionLevel ?? 0;
    const stability = civ.state.stabilityIndex ?? 70;
    const govId = civ.governance?.modelId ?? '';
    const leader = civ.governance?.leader;

    // Calibrated to V-Dem/Polity: +/-1-3 pts/decade stable, -5-15 under corruption/decay
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Legitimacy level drift
    if (iq > 60) legLevel += 0.6 * timeScale;
    if (trust > 60) legLevel += 0.3 * timeScale;
    if (corr > 50) legLevel -= 1.0 * ((corr - 50) / 50) * timeScale;
    if (stability < 40) legLevel -= 0.5 * timeScale;

    // Alternative legitimacy sources (Fix R3-5)
    // Theocratic legitimacy: religious authority + cultural cohesion
    if (govId === 'theocratic') {
      const cohesion = civ.state.culturalCohesion ?? 50;
      if (cohesion > 40) legLevel += 0.8 * timeScale;
    }
    // Performance legitimacy: economic wellbeing justifies non-democratic rule
    const wb = civ.state.averageWellbeing ?? 50;
    if (wb > 40 && (govId === 'autocratic' || govId === 'theocratic')) {
      legLevel += 0.6 * timeScale;
    }
    // Ideological legitimacy: effective propaganda (controlled information + education)
    const ehLeg = civ.state.epistemicHealth ?? 50;
    if (ehLeg <= 45 && (civ.state.educationIndex ?? civ.state.educationQuality ?? 0) > 35) {
      legLevel += 0.5 * timeScale;
    }
    // Military legitimacy: stability through force
    if ((civ.state.militaryBurden ?? 0) > 5 && stability > 30) {
      legLevel += 0.3 * timeScale;
    }

    // ── R4b: Legitimacy floor ──
    // Every surviving polity has SOME legitimacy source — tradition, religious
    // authority, military coercion, economic performance, or sheer inertia.
    // A state with truly zero legitimacy doesn't survive (it gets replaced).
    // The Ottoman Sultans maintained legitimacy via Islam + ghazi tradition
    // even when institutions decayed. Rome maintained SPQR civic religion
    // + military prestige even under late-Republic corruption.
    // Floor based on cultural cohesion (tradition), military (coercion),
    // and food security (basic state function).
    const cohesionLeg = civ.state.culturalCohesion ?? 50;
    const milBurden = civ.state.militaryBurden ?? 0;
    const foodSecLeg = civ.state.foodSecurity ?? 50;
    const legFloor = Math.min(
      cohesionLeg * 0.2 + milBurden * 0.4 + (foodSecLeg > 40 ? 5 : 0) + 5,
      35
    );
    if (legLevel < legFloor) {
      legLevel += (legFloor - legLevel) * 0.2 * timeScale;
    }

    legLevel = Utils.clamp(legLevel, 0, 100);

    // Type evolution (checked periodically, every ~10 turns via random)
    if (Utils.random() < 0.1 * timeScale) {
      const isDemocratic = ['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId);
      if (iq > 60 && isDemocratic && legType !== 'rational-legal') {
        civ.state.legitimacyType = 'rational-legal';
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Legitimacy Transition',
          `${civ.name} has transitioned to rational-legal legitimacy. Authority now rests on constitutional law and bureaucratic procedures rather than tradition or personal charisma.`, 'legitimacy');
      } else if (leader && (leader.yearsInPower ?? 0) > 15 && !isDemocratic && legType !== 'charismatic') {
        if (Utils.random() < 0.3) {
          civ.state.legitimacyType = 'charismatic';
          const yr = this.game?.currentYear ?? 0;
          civ.addHistoryEntry(yr, 'Cult of Personality',
            `After ${leader.yearsInPower} years in power, ${leader.name} has cultivated a personal cult. Legitimacy now rests on the leader's personal authority rather than institutional structures.`, 'legitimacy');
        }
      }
    }

    // Succession crisis detection (leader changed this turn)
    if (leader && leader.yearsInPower === 0 && (civ.state._prevLeaderName ?? '') !== '' && civ.state._prevLeaderName !== leader.name) {
      if (legType === 'charismatic') {
        legLevel -= 20;
        civ.state.stabilityIndex = Utils.clamp(stability - 10, 0, 100);
        civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 5, 0, 100);
        const yr = this.game?.currentYear ?? 0;
        civ.addHistoryEntry(yr, 'Succession Crisis',
          `The death or removal of ${civ.state._prevLeaderName} has triggered a legitimacy crisis. Authority was personal, not institutional — and now it is gone.`, 'succession_crisis');
        this.game.ui?.showNotification(`${civ.name}: Succession crisis after charismatic leader change!`, 'danger');
      } else if (legType === 'traditional') {
        legLevel -= 10;
      } else {
        legLevel -= 3; // rational-legal: smooth transition
      }
    }
    civ.state._prevLeaderName = leader?.name ?? '';

    // Cross-effects
    if (legLevel < 25) {
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 0.8 * timeScale, 0, 100);
    }
    if (legLevel > 75) {
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) + 0.3 * timeScale, 0, 100);
    }

    civ.state.legitimacyLevel = Utils.clamp(legLevel, 0, 100);
  }

  // ── Food Security ──────────────────────────────────────────
  // Ability to feed the population. Derived from soil, water, tech, trade,
  // climate, urbanization, and war. Low food security triggers instability,
  // migration pressure, and conflict — food price spikes correlated with
  // Arab Spring (empirical evidence).
  // ── Food Security — FAO FIES + Lagi food-price instability ─────────
  // Evidence-based model:
  //   1. FAO Food Insecurity Experience Scale (FIES): composite index from
  //      resource base (soil, water), agricultural technology, trade access,
  //      climate stress, conflict — calibrated to FAO State of Food Security 2023
  //   2. Lagi et al. 2011/2015: food price spikes → social unrest threshold.
  //      FAO Food Price Index > 210 (normalized) correlates with instability.
  //      Mapped here as foodSec < 30 → instability onset, < 20 → acute
  //   3. Sen 1981 entitlement approach: famine from distribution failure,
  //      not just production shortfall — inequality + trade disruption matter
  //   4. Messer et al. 1998: conflict-famine nexus is bidirectional
  // Sources: FAO 2023, Lagi et al. (NECSI 2011/2015), Sen 1981, Messer et al. 1998,
  //          Wheeler & von Braun 2013 (climate-food security), Headey 2011
  _processFoodSecurity(civ) {
    if (!civ.state) return;
    const dep = civ.state.resourceDepletion ?? {};
    const soilHealth = dep.soil ?? 100;
    const waterAccess = dep.water ?? 100;
    const techLevel = civ.state.technologyLevel ?? 1;
    const tradeDep = civ.state.tradeDependency ?? 20;
    const urban = civ.state.urbanizationRate ?? 15;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;
    const warmingLevel = this.game?.globalWarmingLevel ?? 0;
    const cap = civ.state.stateCapacity ?? 50;
    const inequality = 100 - (civ.state.equalityIndex ?? 50);
    const infraLevel = civ.state.infrastructureLevel ?? 30;
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── 1. FAO FIES composite food security score ──
    // Production capacity: soil + water + agricultural tech (Green Revolution effect)
    // Calibrated: pre-modern ~40-50, post-Green Revolution ~70-85
    const agTech = Math.min(techLevel * 8, 40); // tech 1→8, tech 5→40
    const productionBase = soilHealth * 0.30 + waterAccess * 0.25 + agTech;

    // Trade access: import-dependent nations vulnerable to price shocks (Headey 2011)
    // High trade dep = access to global markets but vulnerability to disruption
    const tradeAccess = tradeDep > 40 ? 12 : (tradeDep > 20 ? 6 : 0);
    const tradeVulnerability = tradeDep > 60 && atWar ? -10 : 0; // blockade effect

    // Wheeler & von Braun 2013: climate change reduces yields 2-6% per °C
    // surfaceTemp is °C anomaly from DICE model
    const tempAnomaly = this.surfaceTemp ?? 0;
    const climateStress = tempAnomaly * 6.0; // 2°C → -12 pts food security

    // Urbanization: increases demand complexity but infrastructure can offset
    const urbanPenalty = urban > 60 ? (urban - 60) * 0.25 * (1 - infraLevel / 200) : 0;

    // War destruction: Messer et al. 1998 conflict-famine nexus
    const warPenalty = atWar ? 18 : 0;

    // Sen 1981 entitlement: inequality impedes food distribution
    // High inequality = food exists but people can't access it
    const inequalityPenalty = inequality > 60 ? (inequality - 60) * 0.2 : 0;

    // State capacity: distribution logistics, food reserves, emergency response
    const capBonus = cap > 60 ? (cap - 60) * 0.1 : 0;

    let foodSec = productionBase + tradeAccess + capBonus
                  - climateStress - urbanPenalty - warPenalty
                  - inequalityPenalty + tradeVulnerability;
    foodSec = Utils.clamp(foodSec, 0, 100);

    // ── 2. Track consecutive low food security turns for famine ──
    if (foodSec < 15) {
      civ.state._lowFoodTurns = (civ.state._lowFoodTurns ?? 0) + 1;
    } else {
      civ.state._lowFoodTurns = Math.max(0, (civ.state._lowFoodTurns ?? 0) - 1);
    }

    // ── 3. Lagi food-price → instability threshold ──
    // Lagi et al. (NECSI 2011): FAO FPI crossing ~210 correlates with unrest onset
    // We map foodSec < 30 as equivalent to the Lagi threshold
    // Instability magnitude scales with how far below threshold
    if (foodSec < 30) {
      // Lagi nonlinear: instability accelerates as food security drops further
      const severity = (30 - foodSec) / 30; // 0 at threshold, 1 at zero
      const instabilityHit = (1.0 + severity * 3.0) * timeScale; // 1-4 pts/decade
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - instabilityHit, 0, 100);

      // Legitimacy erosion: governments that can't feed people lose support
      civ.state.legitimacyLevel = Utils.clamp(
        (civ.state.legitimacyLevel ?? 50) - 0.5 * severity * timeScale, 0, 100);
    }

    // ── 4. Demographic effects: malnutrition → fertility + mortality ──
    if (foodSec < 20) {
      civ.state._demographicBirthMod = (civ.state._demographicBirthMod ?? 0) - 0.5 * timeScale;
      // Child mortality rises with malnutrition (UNICEF/WHO)
      if (civ.state.infantMortality !== undefined) {
        civ.state.infantMortality = Utils.clamp(
          civ.state.infantMortality + 2.0 * timeScale, 0, 100);
      }
    }

    // ── 5. Famine: sustained food crisis ──
    // Sen 1981: famines require sustained entitlement failure, not just one bad year
    // Probability escalates with duration (not fixed 15%)
    if (foodSec < 15 && civ.state._lowFoodTurns >= 3) {
      const famineProb = Math.min(0.05 + (civ.state._lowFoodTurns - 3) * 0.05, 0.30);
      const adjustedProb = 1 - Math.pow(1 - famineProb, timeScale);
      if (Utils.random() < adjustedProb) {
        const yr = this.game?.currentYear ?? 0;
        // Mortality scales with severity and state capacity (capacity = relief ability)
        const severityMult = foodSec < 5 ? 0.10 : (foodSec < 10 ? 0.07 : 0.04);
        const reliefFactor = cap > 60 ? 0.6 : (cap > 40 ? 0.8 : 1.0);
        const popLoss = Math.round((civ.state.population ?? 1000) * severityMult * reliefFactor);
        civ.state.population = Math.max(100, (civ.state.population ?? 1000) - popLoss);
        civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 12, 0, 100);
        civ.state.collectiveTrauma = Utils.clamp((civ.state.collectiveTrauma ?? 0) + 15, 0, 100);
        // Anomie from social fabric breakdown during famine
        civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 5, 0, 100);
        civ.addHistoryEntry(yr, 'Famine',
          `Severe food shortage in ${civ.name}. Approximately ${popLoss.toLocaleString()} people have perished. The scars will last for generations.`, 'famine');
        this.game.ui?.showNotification(`${civ.name}: Famine! Population declining, trauma accumulating.`, 'danger');
      }
    }

    // ── 6. Food abundance effects ──
    if (foodSec > 70) {
      civ.state._demographicBirthMod = (civ.state._demographicBirthMod ?? 0) + 0.1 * timeScale;
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + 0.3 * timeScale, 0, 100);
      // Food surplus enables population growth and urbanization (Boserup 1965)
      if (foodSec > 85 && urban < 40) {
        civ.state.urbanizationRate = Utils.clamp(urban + 0.2 * timeScale, 0, 100);
      }
    }

    civ.state.foodSecurity = foodSec;
  }

  // ── Collective Trauma ──────────────────────────────────────
  // Intergenerational trauma from catastrophic events: war, famine,
  // genocide, ecological collapse, slavery. Extremely slow decay
  // (~500-year half-life). Affects trust, innovation, anomie floors.
  // Evidence: Holodomor effects persist 3+ generations. Dutch Hunger
  // Winter shows epigenetic transmission.
  _processCollectiveTrauma(civ) {
    if (!civ.state) return;
    let trauma = civ.state.collectiveTrauma ?? 0;
    const trust = civ.state.socialTrust ?? 50;
    const iq = civ.state.institutionalQuality ?? 50;
    const cap = civ.state.stateCapacity ?? 50;
    const atWar = (civ.state.atWar ?? false) || (civ.state.warTurns ?? 0) > 0;

    // Calibrated to intergenerational trauma research: exponential decay with
    // half-life ~25-30 years per generation (Bezo & Maggi 2015, Yehuda et al.)
    // Decay factor ~0.75/decade normally, 0.90-1.0 under ongoing oppression
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Exponential decay: effects halve approximately every generation (25-30 years)
    const hasOngoingOppression = civ.slavery?.active || civ._colonizationType === 'enslavement';
    const hasReconciliation = (trust > 60 && iq > 60 && cap > 50);
    // Decay factor per decade: 0.75 normal, 0.60 with reconciliation, 0.95 under oppression
    const decayFactor = hasOngoingOppression ? 0.95 : (hasReconciliation ? 0.60 : 0.75);
    trauma *= Math.pow(decayFactor, timeScale);

    // Trauma-generating events
    // War: each turn at war adds trauma
    if (atWar) trauma += 3.0 * timeScale;

    // Slavery: active forced labor generates trauma (compounds — no normal decay)
    if (civ.slavery?.active) {
      const prevalence = civ.slavery.prevalence ?? 0;
      trauma += 2.0 * (prevalence / 100) * timeScale;
    }
    // Enslavement colonization
    if (civ._colonizationType === 'enslavement') {
      trauma += 3.0 * timeScale; // colonial slavery is particularly traumatic
    }

    // Ecological collapse (extended overshoot)
    if ((civ.state.overshootTurns ?? 0) > 20) {
      if (!civ.state._overshootTraumaApplied) {
        trauma += 10;
        civ.state._overshootTraumaApplied = true;
      }
    } else {
      civ.state._overshootTraumaApplied = false;
    }

    trauma = Utils.clamp(trauma, 0, 100);

    // Cross-effects
    // Trust ceiling: trauma limits how high trust can grow
    if (trauma > 20) {
      const trustCeiling = 100 - trauma / 5; // e.g., trauma 60 → ceiling 88
      if (trust > trustCeiling) {
        civ.state.socialTrust = Utils.clamp(trust - 0.3 * timeScale, trustCeiling, 100);
      }
    }
    // Risk aversion: high trauma suppresses innovation
    if (trauma > 40) {
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement?.innovation ?? 50) - 0.3 * timeScale, 0, 100);
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) + 0.2 * timeScale, 0, 100);
    }
    // Institutional distrust: very high trauma limits institutional quality growth
    if (trauma > 60) {
      const iqCeiling = 100 - (trauma - 60) / 4;
      if (iq > iqCeiling) {
        civ.state.institutionalQuality = Utils.clamp(iq - 0.15 * timeScale, iqCeiling, 100);
      }
    }
    // Generational despair: extreme trauma sets anomie floor
    if (trauma > 80) {
      if ((civ.state.anomieLevel ?? 0) < 20) {
        civ.state.anomieLevel = 20;
      }
    }

    civ.state.collectiveTrauma = trauma;
  }

  // ── Land Ownership Concentration ──────────────────────────────
  // Fixed-supply resource with strong path dependency. Colonial grants,
  // conquest, and market forces drive concentration upward; land reform
  // and communal systems resist it. High concentration → low mobility,
  // food insecurity, political instability, revolution risk.
  _processLandOwnership(civ) {
    if (!civ.state) return;
    let land = civ.state.landConcentration ?? 40;
    const govId  = civ.governance?.modelId ?? '';
    const econId = civ.governance?.economicModelId ?? civ.state.economicModel ?? 'mixed';
    const wc     = civ.economic?.wealthConcentration ?? 30;
    const stab   = civ.state.stabilityIndex ?? 70;
    const educQ  = civ.state.educationQuality ?? 50;
    const prevLand = land;

    // Calibrated to FAO/ILC: +1-2 pts/decade market forces, very sticky (IMF finding)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Market forces: wealth concentration drives land acquisition
    if (wc > 50) land += 0.8 * ((wc - 50) / 50) * timeScale;

    // Economic model effects
    if (['gift', 'commons', 'labor_credit'].includes(econId)) land -= 1.0 * timeScale;
    else if (econId === 'market') land += 0.5 * timeScale;

    // Governance effects
    if (govId === 'oligarchy' || govId === 'autocratic') land += 0.6 * timeScale;
    else if (govId === 'flat_consensus' || govId === 'rotating') land -= 0.5 * timeScale;

    // Education slowly erodes feudal land patterns (legal literacy, advocacy)
    if (educQ > 60) land -= 0.3 * timeScale;

    // Instability can trigger land grabs by elites
    if (stab < 25) land += 1.0 * timeScale;

    // Path dependency: 50% damping on all drift (land changes very slowly — IMF finding)
    const drift = land - prevLand;
    land = prevLand + drift * 0.5;

    land = Utils.clamp(land, 0, 100);

    // Cross-effects
    // High land concentration suppresses food security (cash crops over food)
    if (land > 60) {
      civ.state.foodSecurity = Utils.clamp(
        (civ.state.foodSecurity ?? 60) - 0.5 * ((land - 60) / 40) * timeScale, 0, 100);
    }
    // High concentration → wealth concentration feedback (land IS wealth pre-industrial)
    if (civ.economic && land > 50) {
      civ.economic.wealthConcentration = Utils.clamp(
        (civ.economic.wealthConcentration ?? 30) + 0.15 * timeScale, 0, 100);
    }
    // Very high concentration → stability erosion (landless peasant anger)
    if (land > 70) {
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - 0.5 * ((land - 70) / 30) * timeScale, 0, 100);
    }

    civ.state.landConcentration = land;
  }

  // ── Caste / Rigid Stratification ──────────────────────────────
  // Hereditary social barriers that cap mobility regardless of other factors.
  // Types: hereditary caste, racial, religious, occupational guild.
  // Education and urbanization gradually weaken caste; abolition events
  // can break it. High caste → hard ceiling on social mobility,
  // brain drain (innovation suppression), stability paradox (stable but brittle).
  _processCasteStratification(civ) {
    if (!civ.state) return;
    let caste = civ.state.casteRigidity ?? 15;
    const educQ = civ.state.educationQuality ?? 50;
    const urban = civ.state.urbanizationRate ?? 15;
    const govId = civ.governance?.modelId ?? '';
    const eh    = civ.state.epistemicHealth ?? 50;

    // Calibrated to Asher/Novosad/Rafkin 2024: most inertial variable,
    // -0-1 pt/decade without intervention, -2-5 with policy (Deshpande 2011)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Education weakens caste (literacy → awareness of injustice)
    if (educQ > 50) caste -= 0.5 * ((educQ - 50) / 50) * timeScale;
    else if (educQ < 25) caste += 0.2 * timeScale;

    // Urbanization breaks caste (anonymity, market labor, intermarriage)
    if (urban > 40) caste -= 0.4 * ((urban - 40) / 60) * timeScale;

    // Epistemic health (exposure to egalitarian ideas)
    if (eh > 60) caste -= 0.2 * timeScale;

    // Governance reinforcement
    if (govId === 'theocratic' || govId === 'autocratic') caste += 0.3 * timeScale;
    else if (govId === 'flat_consensus' || govId === 'direct_congress') caste -= 0.4 * timeScale;

    // Strong path dependency: caste systems are self-reinforcing
    if (caste > 40) caste += 0.15 * timeScale;

    caste = Utils.clamp(caste, 0, 100);

    // Cross-effects
    // Hard ceiling on social mobility
    if (caste > 20) {
      const mobCeiling = 100 - caste * 0.8;
      if ((civ.state.socialMobility ?? 50) > mobCeiling) {
        civ.state.socialMobility = Utils.clamp(mobCeiling, 0, 100);
      }
    }
    // Brain drain: talented lower caste cannot contribute → innovation loss
    if (caste > 40) {
      if (civ.state.behaviorReinforcement?.innovation !== undefined) {
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          civ.state.behaviorReinforcement.innovation - 0.3 * timeScale, 0, 100);
      }
    }
    // Anomie from rigid barriers (despair among lower castes)
    if (caste > 50) {
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + 0.3 * ((caste - 50) / 50) * timeScale, 0, 100);
    }

    civ.state.casteRigidity = caste;
  }

  // ── Institutional Lock-in ──────────────────────────────────────
  // Self-reinforcing feedback: institutions create constituencies that
  // actively defend them. Different from inertia (passive resistance):
  // lock-in is when bureaucracies, interest groups, and beneficiaries
  // FIGHT reform. High lock-in → reforms fail, paradigm shifts slower,
  // corruption entrenched, innovation constrained.
  _processInstitutionalLockin(civ) {
    if (!civ.state) return;
    let lockin = civ.state.institutionalLockin ?? 30;
    const govId   = civ.governance?.modelId ?? '';
    const corr    = civ.state.corruptionLevel ?? 0;
    const wc      = civ.economic?.wealthConcentration ?? 30;
    const cap     = civ.state.stateCapacity ?? 50;
    const eh      = civ.state.epistemicHealth ?? 50;
    const govAge  = civ.state._govShiftAge ?? 0;

    // Calibrated to North 1990 institutional path dependency: lock-in builds
    // slowly but is very hard to reverse absent crisis or paradigm shift
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Time in current system builds lock-in (constituencies form around status quo)
    if (govAge > 10) lockin += 0.4 * (Math.min(govAge, 60) / 60) * timeScale;

    // Corruption + wealth concentration: captured institutions fight reform
    if (corr > 30 && wc > 40) lockin += 0.5 * timeScale;

    // High hierarchy entrenches constituencies
    const hierarchy = civ.governance?.hierarchyLevel ?? 50;
    if (hierarchy > 60) lockin += 0.3 * timeScale;

    // Countervailing forces
    // Epistemic health (informed citizenry can challenge lock-in)
    if (eh > 60) lockin -= 0.4 * timeScale;
    else if (eh < 25) lockin += 0.3 * timeScale;

    // Education quality
    if ((civ.state.educationQuality ?? 50) > 60) lockin -= 0.3 * timeScale;

    // Active paradigm shifts temporarily break lock-in
    // (Institutional inertia is deep — shifts chip at it, not demolish it)
    const activeShifts = civ.state.activeParadigmShifts ?? [];
    if (activeShifts.length > 0) lockin -= 0.8 * timeScale;

    // Low state capacity: can't enforce lock-in (weak states are more porous)
    if (cap < 25) lockin -= 0.5 * timeScale;

    // Self-reinforcing above threshold
    if (lockin > 50) lockin += 0.2 * timeScale;

    lockin = Utils.clamp(lockin, 0, 100);

    // Cross-effects
    // Lock-in feeds into inertia coefficient (amplifies passive resistance)
    const bi = civ.state.behaviorInertia;
    if (bi && lockin > 30) {
      bi.coefficient = Utils.clamp(
        (bi.coefficient ?? 0) + lockin * 0.05 * timeScale, 0, 100);
    }

    // High lock-in → corruption harder to reduce
    if (lockin > 60) {
      civ.state.corruptionLevel = Utils.clamp(
        (civ.state.corruptionLevel ?? 0) + 0.2 * timeScale, 0, 100);
    }

    // Very high lock-in → legitimacy erosion (people see system as rigged)
    if (lockin > 70) {
      civ.state.legitimacyLevel = Utils.clamp(
        (civ.state.legitimacyLevel ?? 50) - 0.3 * timeScale, 0, 100);
    }

    civ.state.institutionalLockin = lockin;
  }

  // ── Technological Unemployment ──────────────────────────────
  // Structural labor displacement pipeline beyond automationLevel effects.
  // Models: displacement rate from automation, retraining capacity to absorb
  // displaced workers, and new sector creation to provide alternative employment.
  // High tech unemployment → anomie, inequality, instability, wellbeing loss.
  _processTechUnemployment(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // ACEMOGLU-RESTREPO TASK MODEL (2019)
    // Automation displaces workers from existing tasks, but new tasks
    // create demand for human labor. Net effect depends on:
    //   1. Displacement effect: automation replaces human tasks → unemployment
    //   2. Productivity effect: automation raises output → creates new demand
    //   3. Reinstatement effect: new tasks emerge that require humans
    //   4. Composition effect: automation changes which sectors/skills grow
    //
    // Key insight: the race between displacement and reinstatement
    // determines whether automation raises or lowers employment
    //
    // Frey & Osborne (2017): ~47% of US jobs at risk from automation
    // Acemoglu & Restrepo (2020): 1 robot per 1000 workers → -0.2% employment
    // ══════════════════════════════════════════════════════════════════════
    if (!civ.state) return;
    let techUnemp = civ.state.techUnemployment ?? 0;
    const autoLevel = civ.state.automationLevel ?? 0;
    const educQ     = civ.state.educationQuality ?? 50;
    let   retrain   = civ.state.retrainingCapacity ?? 40;
    const urban     = civ.state.urbanizationRate ?? 15;
    const innovRate = civ.state.behaviorReinforcement?.innovation ?? 50;
    const iq        = civ.state.institutionalQuality ?? 50;

    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── 1. Displacement effect (task automation) ─────────────────
    // Higher automation levels displace more tasks
    // A&R: ~0.2% employment loss per robot per 1000 workers
    // Our scale: autoLevel 0-5, displacement scales superlinearly
    if (autoLevel >= 2) {
      // Quadratic: acceleration of displacement at high automation
      const displacement = 0.6 * Math.pow(autoLevel - 1, 1.5) * timeScale;
      techUnemp += displacement;
    }

    // ── 2. Productivity effect (automation boosts output) ────────
    // Higher productivity → cheaper goods → higher real wages for employed
    // This partially offsets displacement but benefits existing workers, not displaced
    if (autoLevel >= 3 && techUnemp > 5) {
      // Productivity surplus reduces unemployment pressure slightly
      techUnemp -= 0.3 * timeScale;
    }

    // ── 3. Reinstatement effect (new tasks for humans) ──────────
    // Innovation creates genuinely new tasks that didn't exist before
    // A&R: historically, reinstatement has kept pace with displacement
    // High innovation rate → faster new task creation
    const reinstateRate = (innovRate / 100) * 1.2 * timeScale;
    techUnemp -= reinstateRate;

    // Education enables workers to fill new tasks (human capital match)
    if (educQ > 60) techUnemp -= 0.5 * ((educQ - 60) / 40) * timeScale;
    else if (educQ < 30) techUnemp += 0.3 * timeScale; // skills mismatch worsens displacement

    // ── 4. Retraining (institutional absorption of displacement) ─
    const retrainEffect = retrain / 100 * 1.2 * timeScale;
    techUnemp -= retrainEffect;

    // ── 5. Composition effect (sectoral shifts) ─────────────────
    // Urbanization accelerates both displacement AND new sector creation
    // High urban + high auto + low education = worst case
    if (urban > 50 && autoLevel >= 3 && educQ < 40) {
      techUnemp += 0.5 * timeScale; // urban concentration of displaced workers
    }

    // ── 6. Natural recovery (informal economy, gig work, adaptation) ──
    techUnemp -= 0.2 * timeScale;

    // ── 7. Institutional quality enables labor market flexibility ──
    if (iq > 60) retrain += 0.5 * timeScale;
    else if (iq < 30) retrain -= 0.3 * timeScale;
    if (educQ > 60) retrain += 0.5 * timeScale;
    else if (educQ < 30) retrain -= 0.3 * timeScale;
    civ.state.retrainingCapacity = Utils.clamp(retrain, 0, 100);

    techUnemp = Utils.clamp(techUnemp, 0, 100);

    // ── Cross-effects ────────────────────────────────────────────
    // Tech unemployment → anomie (Durkheim: purposelessness from joblessness)
    if (techUnemp > 10) {
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + 0.5 * (techUnemp / 100) * timeScale, 0, 100);
    }
    // Tech unemployment → inequality (A&R: automation benefits capital owners)
    if (techUnemp > 15 && civ.economic) {
      civ.economic.wealthConcentration = Utils.clamp(
        (civ.economic.wealthConcentration ?? 30) + 0.5 * timeScale, 0, 100);
    }
    // High tech unemployment → wellbeing loss (Case & Deaton 2015: deaths of despair)
    if (techUnemp > 20) {
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - 0.5 * ((techUnemp - 20) / 80) * timeScale, 0, 100);
    }
    // Severe tech unemployment → stability risk (populism, extremism)
    if (techUnemp > 30) {
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - 0.8 * ((techUnemp - 30) / 70) * timeScale, 0, 100);
    }

    civ.state.techUnemployment = techUnemp;
  }

  // ── Ethnic/Linguistic Fractionalization ───────────────────────
  // Wimmer's correction: political EXCLUSION (not diversity itself) drives
  // conflict. Fractionalization is structural (slow-moving); inclusion is
  // political (policy-responsive). The interaction determines outcomes.
  // High frac + low inclusion = conflict risk, low trust, weak state capacity.
  // High frac + high inclusion = can be stable (Switzerland model).
  _processEthnicFractionalization(civ) {
    if (!civ.state) return;
    let frac      = civ.state.ethnicFractionalization ?? 35;
    let inclusion = civ.state.politicalInclusion ?? 50;
    const govId   = civ.governance?.modelId ?? '';
    const educQ   = civ.state.educationQuality ?? 50;
    const trust   = civ.state.socialTrust ?? 50;
    const eh      = civ.state.epistemicHealth ?? 50;
    const stab    = civ.state.stabilityIndex ?? 70;

    // Calibrated to V-Dem political exclusion data: inclusion is policy-responsive
    // (+/-5-15 pts/decade during transitions), fractionalization is structural (very slow)
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // Fractionalization: very slow structural drift
    const urban = civ.state.urbanizationRate ?? 15;
    if (urban > 50) frac += 0.1 * timeScale;
    const homo = civ.state.culturalHomogeneity?.value ?? 50;
    if (homo > 70) frac -= 0.1 * timeScale;

    // Political inclusion drift — responds to governance (Wimmer)
    if (['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId)) {
      inclusion += 0.8 * timeScale;
    }
    if (['autocratic', 'theocratic', 'oligarchy'].includes(govId)) {
      inclusion -= 0.6 * timeScale;
    }
    if (educQ > 60) inclusion += 0.3 * timeScale;
    if (eh > 60) inclusion += 0.2 * timeScale;
    if (stab < 30) inclusion -= 1.0 * timeScale;
    if (trust > 60) inclusion += 0.3 * timeScale;

    frac = Utils.clamp(frac, 0, 100);
    inclusion = Utils.clamp(inclusion, 0, 100);

    // Fractionalization institutional friction (Fix R3-4b): diversity + low inclusion drags IQ
    if (frac > 60 && inclusion < 50) {
      const fricDrag = (frac - 60) * (50 - inclusion) / 100 * 0.01 * timeScale;
      civ.state.institutionalQuality = Math.max(0, (civ.state.institutionalQuality ?? 50) - fricDrag);
    }

    // Compute exclusion risk: high fractionalization + low inclusion
    const exclusionRisk = frac * (100 - inclusion) / 100;

    // Cross-effects: driven by exclusion risk, not diversity itself (Wimmer's key insight)
    if (exclusionRisk > 30) {
      civ.state.socialTrust = Utils.clamp(
        (civ.state.socialTrust ?? 50) - 0.3 * ((exclusionRisk - 30) / 70) * timeScale, 0, 100);
    }
    if (exclusionRisk > 40) {
      civ.state.stateCapacity = Utils.clamp(
        (civ.state.stateCapacity ?? 50) - 0.3 * timeScale, 0, 100);
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + 0.3 * ((exclusionRisk - 40) / 60) * timeScale, 0, 100);
    }
    if (exclusionRisk > 50) {
      civ.state.legitimacyLevel = Utils.clamp(
        (civ.state.legitimacyLevel ?? 50) - 0.3 * timeScale, 0, 100);
      if (stab < 50) {
        civ.state.stabilityIndex = Utils.clamp(
          stab - 0.5 * ((exclusionRisk - 50) / 50) * timeScale, 0, 100);
      }
    }
    if (exclusionRisk > 60) {
      civ.state.collectiveTrauma = Utils.clamp(
        (civ.state.collectiveTrauma ?? 0) + 0.3 * timeScale, 0, 100);
    }

    // Positive: high diversity + high inclusion → cultural richness (innovation boost)
    if (frac > 40 && inclusion > 70) {
      if (civ.state.behaviorReinforcement?.innovation !== undefined) {
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          civ.state.behaviorReinforcement.innovation + 0.2 * timeScale, 0, 100);
      }
    }

    civ.state.ethnicFractionalization = frac;
    civ.state.politicalInclusion = inclusion;
    civ.state._exclusionRisk = Math.round(exclusionRisk);
  }

  // ── Demographic-Epidemiological Transition (Round 15) ───────────────────────
  // Integrated 5-stage model: pre-transition through second transition.
  // Stage is DERIVED from fertility + mortality rates, not set directly.
  // Drives existing demographic profile system via cohort pressure.
  _processDemographicTransition(civ) {
    if (!civ.state) return;
    const st = civ.state;

    // Pull current values
    let sanit       = st.sanitationLevel ?? 18;
    let disease     = st.diseaseBurden ?? 60;
    let infantMort  = st.infantMortality ?? 75;
    let mort        = st.mortalityRate ?? 40;
    let fert        = st.fertilityRate ?? 45;
    let youth       = st.youthCohort ?? 40;
    let elderly     = st.elderlyCohort ?? 5;

    const infra     = st.infrastructureLevel ?? 20;
    const tech      = st.technologyAdoption ?? 0;
    const stateCap  = st.stateCapacity ?? 40;
    const urban     = st.urbanizationRate ?? 15;
    const foodSec   = st.foodSecurity ?? 60;
    const educQ     = st.educationQuality ?? 30;
    const gei       = st.genderEquity ?? 30;
    const atWar     = (st.atWar || st.warStatus) ? true : false;
    const healthTier = st.healthcareTier ?? 0;
    const wealthConc = st.wealthConcentration ?? 30;
    const autoLevel  = st.automationLevel ?? 0;
    const mobility   = st.socialMobility ?? 40;

    // Get women's rights tier for fertility effects
    const wrTiers = ['none', 'basic_protections', 'civil_rights', 'broad_equality', 'full_equality'];
    const wrTier  = wrTiers.indexOf(st.womensRightsTier ?? 'none');

    // Reproductive health tier for contraception
    const rhTiers = ['none', 'basic', 'moderate', 'comprehensive', 'universal'];
    const rhTier  = rhTiers.indexOf(st.reproductiveHealthTier ?? 'none');

    // Birth rate policy pressure (from existing family size policy)
    const birthPolicy = st.birthRatePressure ?? 0;

    // Calibrated to UN Population Division historical data
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── 1. Sanitation drift (tech-gated: ancient civs lack germ theory) ────
    // Pre-industrial sanitation improves very slowly (aqueducts, drainage)
    // Modern sanitation requires tech >= 4 (industrial chemistry, water treatment)
    const sanitTechMult = tech < 2 ? 0.15 : tech < 4 ? 0.3 : tech < 6 ? 0.6 : 1.0;
    // Baseline: even ancient civs develop basic sanitation (latrines, drainage, waste pits)
    // Slow drift toward era-appropriate floor (~15 ancient, ~25 medieval, ~40 early modern)
    const sanitFloor = tech < 2 ? 15 : tech < 4 ? 25 : tech < 6 ? 40 : 60;
    if (sanit < sanitFloor) sanit += 0.3 * timeScale;
    if (infra > 30) sanit += 0.5 * sanitTechMult * timeScale;
    if (infra > 60) sanit += 0.5 * sanitTechMult * timeScale;
    if (tech > 2)   sanit += 0.5 * timeScale;
    if (tech > 5)   sanit += 0.8 * timeScale;
    if (stateCap > 50) sanit += 0.3 * sanitTechMult * timeScale;
    // Urban without infrastructure = crowding → sanitation loss
    if (urban > 40 && infra < 30) sanit -= 1.5 * timeScale;
    if (urban > 60 && infra < 50) sanit -= 1.0 * timeScale;
    if (atWar) sanit -= 2.0 * timeScale;
    sanit = Utils.clamp(sanit, 0, 100);

    // ── 2. Disease burden drift ──────────────────────────────────────────────
    // Even basic drainage/waste removal helps (ancient Rome, Indus Valley)
    if (sanit > 10) disease -= 0.3 * timeScale;
    if (sanit > 30) disease -= 0.6 * timeScale;
    if (sanit > 60) disease -= 1.0 * timeScale;
    // Infrastructure provides indirect disease resistance (shelter, drainage, roads)
    if (infra > 30) disease -= 0.2 * timeScale;
    if (infra > 60) disease -= 0.3 * timeScale;
    if (healthTier >= 1) disease -= 0.8 * timeScale;
    if (healthTier >= 3) disease -= 1.0 * timeScale;
    if (healthTier >= 5) disease -= 1.0 * timeScale;
    if (tech > 3) disease -= 0.5 * timeScale;
    if (tech > 6) disease -= 0.5 * timeScale;
    // Food security supports immune health
    if (foodSec > 50) disease -= 0.2 * timeScale;
    // Risk factors
    if (foodSec < 40) disease += 1.0 * timeScale;
    if (atWar) disease += 1.5 * timeScale;
    // Urban overcrowding without sanitation — penalty scales with gap
    if (urban > 50 && sanit < 40) disease += 0.4 * ((urban - 50) / 50) * ((40 - sanit) / 40) * timeScale;
    // Disease floor — endemic diseases cannot be eliminated without appropriate technology
    // Pre-modern: malaria, parasites, waterborne pathogens always present
    // Modern: chronic/lifestyle diseases form a new floor
    const diseaseFloor = tech < 2 ? 25 : tech < 4 ? 18 : tech < 6 ? 10 : 8;
    disease = Math.max(disease, diseaseFloor);
    // Plague mitigation from events
    const plagueMit = st.plagueMitigation ?? 0;
    if (plagueMit > 0) disease -= plagueMit * 0.1;
    disease = Utils.clamp(disease, 0, 100);

    // ── 3. Epidemiological profile ───────────────────────────────────────────
    let epiProfile;
    if (disease > 60) epiProfile = 'infectious_dominant';
    else if (disease > 40) epiProfile = 'receding_pandemics';
    else if (disease > 25) epiProfile = 'degenerative_emerging';
    else if (disease > 12) epiProfile = 'chronic_dominant';
    else epiProfile = 'aging_dominant';

    // ── 4. Infant mortality drift (tech-gated: pre-modern medicine limited) ─
    // UN data: infant mortality fell from ~150/1000 (1950) to ~30/1000 (2020) in many countries
    // But pre-industrial decline was VERY slow (centuries, not decades)
    const mortTechMult = tech < 2 ? 0.15 : tech < 4 ? 0.3 : tech < 6 ? 0.6 : 1.0;
    if (sanit > 25) infantMort -= 0.8 * mortTechMult * timeScale;
    if (sanit > 50) infantMort -= 0.6 * mortTechMult * timeScale;
    if (healthTier >= 1) infantMort -= 0.5 * timeScale;
    if (healthTier >= 3) infantMort -= 1.0 * timeScale;
    if (healthTier >= 5) infantMort -= 1.0 * timeScale;
    if (foodSec > 60) infantMort -= 0.4 * mortTechMult * timeScale;
    if (tech > 3) infantMort -= 0.8 * timeScale;
    if (foodSec < 30) infantMort += 1.5 * timeScale;
    if (atWar) infantMort += 2.0 * timeScale;
    infantMort = Utils.clamp(infantMort, 0, 100);

    // ── 5. Mortality rate drift (tech-gated: pre-modern limited) ──────────
    // UN data: Stage 2 mortality decline = 5-10 pts/decade (post-1800)
    // Pre-industrial: mortality fluctuated but didn't systematically decline
    if (sanit > 25) mort -= 0.5 * mortTechMult * timeScale;
    if (sanit > 50) mort -= 0.5 * mortTechMult * timeScale;
    if (healthTier >= 1) mort -= 0.4 * timeScale;
    if (healthTier >= 3) mort -= 0.8 * timeScale;
    if (healthTier >= 5) mort -= 0.8 * timeScale;
    if (foodSec > 60) mort -= 0.3 * mortTechMult * timeScale;
    if (tech > 3) mort -= 0.5 * timeScale;
    // Disease pressure on mortality — scaled by how far above 50
    if (disease > 50) mort += 0.2 * ((disease - 50) / 50) * timeScale;
    // Good food reduces mortality — but pre-modern nutrition alone doesn't drive systematic decline
    if (foodSec > 50) mort -= 0.2 * mortTechMult * timeScale;
    if (foodSec < 30) mort += 1.5 * timeScale;
    if (atWar) mort += 2.5 * timeScale;
    // Elderly pressure: crude death rate rises with aging population
    // Calibrated to real-world: Japan (28% elderly) has CDR ~11/1000;
    // Italy (23% elderly) ~12/1000. Reduced from 0.3 to 0.15 to match.
    if (elderly > 15) mort += 0.15 * ((elderly - 15) / 25) * timeScale;
    // Mortality floor by era — pre-modern civilizations cannot achieve modern mortality rates
    // Historical: crude death rates were 25-40/1000 in pre-industrial societies (McEvedy & Jones 1978)
    // Even well-fed ancient civilizations with good sanitation had endemic disease and no antibiotics
    const mortFloor = tech < 2 ? 25 : tech < 4 ? 18 : tech < 6 ? 10 : 3;
    mort = Utils.clamp(mort, mortFloor, 55);

    // ── 6. Fertility rate drift — THE key transition driver chain ─────────
    // UN data: Stage 3 fertility decline = TFR drops 0.5-1.0/decade = ~7-14 pts on 0-55 scale
    // Child survival: as infant mortality drops, parents have fewer children
    // But fertility response requires awareness + alternatives (tech-gated)
    const fertTechMult = tech < 2 ? 0.1 : tech < 4 ? 0.25 : tech < 6 ? 0.6 : 1.0;
    if (infantMort < 50) fert -= 0.8 * fertTechMult * timeScale;
    if (infantMort < 25) fert -= 0.8 * fertTechMult * timeScale;
    if (infantMort < 10) fert -= 0.8 * timeScale; // By the time infant mort < 10, tech must be high

    // Female education + gender equity (Duflo 2012: key fertility driver)
    if (gei > 60) fert -= 0.8 * timeScale;
    if (gei > 75) fert -= 0.5 * timeScale;
    if (educQ > 60) fert -= 0.5 * timeScale;

    // Women's rights tier
    if (wrTier >= 3) fert -= 0.8 * timeScale;
    else if (wrTier >= 2) fert -= 0.5 * timeScale;
    else if (wrTier <= 0) fert += 0.3 * timeScale;

    // Urbanization (tech-gated: ancient cities don't reduce fertility — no contraception)
    if (urban > 40) fert -= 0.3 * fertTechMult * timeScale;
    if (urban > 70) fert -= 0.3 * fertTechMult * timeScale;

    // Contraception access (reproductive health tier)
    if (rhTier >= 2) fert -= 0.5 * timeScale;
    if (rhTier >= 4) fert -= 0.8 * timeScale;

    // Existing birth rate policy pressure
    fert += birthPolicy * 0.3 * timeScale;

    // Advanced automation → fewer children (economic uncertainty)
    if (autoLevel >= 4) fert -= 0.5 * timeScale;

    // Stage 5 drivers: extreme urbanization + wealth concentration + gender equity
    if (urban > 70 && wealthConc > 60 && gei > 65) fert -= 0.8 * timeScale;

    // Fertility floor: stage-dependent (Fix R3-2a)
    // Pre-industrial societies have high baseline fertility (no contraception, child labor valuable).
    // Modern societies can reach ultra-low fertility (TFR < 1.3).
    // Prosperous modern societies maintain TFR ~1.6-1.8 (France, Sweden, Denmark).
    const wb4fert = civ.state.averageWellbeing ?? 50;
    const curStage = st.demographicTransitionStage ?? 1;
    let fertFloor;
    if (curStage <= 2) fertFloor = 6;       // Pre-industrial: high baseline (no contraception)
    else if (curStage === 3) fertFloor = 4;  // Transitional: still relatively high
    else fertFloor = (wb4fert > 70 && foodSec > 70) ? 8 : 3; // Modern: low or replacement-level
    fert = Utils.clamp(fert, fertFloor, 55);

    // ── 7. Stage determination — DERIVED from fertility + mortality ────────
    let newStage;
    if (fert > 35 && mort > 30) newStage = 1;
    else if (fert > 30 && mort <= 30) newStage = 2;
    else if (fert > 18 && mort <= 20) newStage = 3;
    else if (fert > 12 && mort <= 14) newStage = 4;
    else newStage = 5;

    const oldStage = st.demographicTransitionStage ?? 1;
    if (newStage !== oldStage) {
      const stageData = DEMOGRAPHIC_TRANSITION_STAGES[newStage - 1];
      if (stageData) {
        civ.addHistoryEntry(this.game?.currentYear ?? 0, `Demographic Transition: ${stageData.label}`,
          `${civ.name} has entered the ${stageData.label} stage of the demographic transition. ${stageData.description}`, 'demographic_transition');
        if (civ.notifications) {
          civ.notifications.push({
            type: 'demographic_transition',
            message: `${stageData.icon} ${stageData.label}: ${stageData.description}`,
            turn: civ.turnNumber,
          });
        }
      }
      // Rapid social change → anomie (Durkheim)
      st.anomieLevel = Utils.clamp((st.anomieLevel ?? 0) + 3, 0, 100);
    }

    // ── 8. Life expectancy (era-scaled base) ──────────────────────────────
    // Base reflects medical knowledge ceiling: ~55 pre-industrial, ~85 modern
    // Coefficients: mort on 0-55 scale, disease on 0-100 scale
    // Bronze Age with mort=33, disease=38: 55 - 33×0.45 - 38×0.12 = 55 - 14.9 - 4.6 = 35.5 (historically accurate)
    const lifeExpBase = tech < 2 ? 55 : tech < 4 ? 62 : tech < 6 ? 72 : 85;
    let lifeExp = lifeExpBase - mort * 0.45 - disease * 0.12;
    if (healthTier >= 1) lifeExp += 2;
    if (healthTier >= 3) lifeExp += 3;
    if (healthTier >= 5) lifeExp += 3;
    if (foodSec > 60) lifeExp += 2;
    if (foodSec < 30) lifeExp -= 5;
    if (atWar) lifeExp -= 5;
    lifeExp = Utils.clamp(lifeExp, 25, 95);

    // ── 9. Age cohort drift ──────────────────────────────────────────────────
    // Youth grows with high fertility, shrinks with aging out
    const naturalAging = 1.0 * timeScale;
    if (fert > 30) youth += 1.0 * timeScale;
    if (fert > 40) youth += 0.5 * timeScale;
    if (fert < 15) youth -= 1.0 * timeScale;
    youth -= naturalAging;
    if (infantMort > 50) youth -= 0.5 * timeScale;

    // Elderly grows with life expectancy
    if (lifeExp > 60) elderly += 0.8 * timeScale;
    if (lifeExp > 75) elderly += 0.5 * timeScale;
    if (mort > 30) elderly -= 0.5 * timeScale;
    elderly += naturalAging * 0.5;

    youth = Utils.clamp(youth, 5, 55);
    elderly = Utils.clamp(elderly, 2, 40);

    // Working age guaranteed >= 30%
    const workingAge = 100 - youth - elderly;
    if (workingAge < 30) {
      const deficit = 30 - workingAge;
      if (youth > elderly) youth -= deficit * 0.7;
      else elderly -= deficit * 0.7;
      youth = Utils.clamp(youth, 5, 55);
      elderly = Utils.clamp(elderly, 2, 40);
    }

    // ── 10. Dependency ratio ─────────────────────────────────────────────────
    const finalWorkingAge = Math.max(100 - youth - elderly, 30);
    const dependencyRatio = (youth + elderly) / finalWorkingAge;

    // ── 11. Population growth rate ───────────────────────────────────────────
    let growthRate = (fert - mort) / 1000;

    // ── R4-3: Broadened immigration ──
    // Multiple attraction channels beyond just institutional quality.
    // Ottoman attracted settlers via religious tolerance + economics.
    // Soviet attracted ideological migrants despite low freedom.
    // Agricultural empires attracted settlers with food security + stability.
    const canAttractImmigrants =
      (newStage >= 5 && (st.institutionalQuality ?? 0) > 60) ||
      (newStage >= 4 && (st.legitimacyLevel ?? 0) > 55) ||
      (newStage >= 4 && (st.foodSecurity ?? 0) > 65 && (st.stabilityIndex ?? 0) > 50);
    if (canAttractImmigrants) {
      growthRate += 0.002 * timeScale; // ~0.2% per decade net immigration
    }

    st._populationGrowthRate = growthRate;

    // ── 12. Cross-effects ────────────────────────────────────────────────────
    // Cohort pressure → drives existing demographic profile system
    let cohortPressure = null;
    if (youth > 42) cohortPressure = 'young';
    else if (youth > 38) cohortPressure = 'young';
    else if (elderly > 22) cohortPressure = 'aging';
    else if (elderly > 18) cohortPressure = 'aging';
    else cohortPressure = 'balanced';
    // Extreme conditions → stress
    if ((youth > 45 && elderly < 5) || (elderly > 25 && youth < 15) ||
        (dependencyRatio > 1.2)) {
      cohortPressure = 'stress';
    }
    st._cohortProfilePressure = cohortPressure;

    // Youth bulge + low opportunity → instability (Urdal/Goldstone)
    if (youth > 38 && mobility < 30) {
      st.stabilityIndex = Utils.clamp(
        (st.stabilityIndex ?? 70) - 1.5 * timeScale, 0, 100);
    }

    // Disease burden > 60 → collective trauma (10% chance per turn)
    if (disease > 60 && Utils.random() < 0.10 * timeScale) {
      st.collectiveTrauma = Utils.clamp(
        (st.collectiveTrauma ?? 0) + 1.5, 0, 100);
    }

    // Elderly > 20% → state capacity drain (fiscal strain)
    if (elderly > 20) {
      st.stateCapacity = Utils.clamp(
        (st.stateCapacity ?? 50) - 0.3 * ((elderly - 20) / 20) * timeScale, 0, 100);
    }

    // ── Store results ────────────────────────────────────────────────────────
    st.sanitationLevel = sanit;
    st.diseaseBurden = disease;
    st.epidemiologicalProfile = epiProfile;
    st.infantMortality = infantMort;
    st.mortalityRate = mort;
    st.fertilityRate = fert;
    st.demographicTransitionStage = newStage;
    st.lifeExpectancy = lifeExp;
    st.youthCohort = youth;
    st.elderlyCohort = elderly;
    st._dependencyRatio = Math.round(dependencyRatio * 100) / 100;
  }

  // ── Social Mobility ─────────────────────────────────────────
  // Actual vs perceived ability to move between strata.
  // The Great Gatsby Curve: inequality kills mobility.
  // Perception gap drives cynicism or revolutionary pressure.
  _processSocialMobility(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // GREAT GATSBY CURVE (Corak 2013) + Chetty et al. (2014)
    // Intergenerational income elasticity (IGE) = β₀ + β₁ × Gini
    // Corak: IGE ≈ 0.15 + 0.73 × Gini (across OECD countries)
    // Higher Gini → higher IGE → lower intergenerational mobility
    // Mobility = 100 × (1 - IGE), scaled to our 0-100 index
    //
    // Key drivers beyond inequality: education access, institutional quality,
    // neighborhood effects (Chetty), inheritance systems, caste rigidity
    // ══════════════════════════════════════════════════════════════════════
    if (!civ.state) return;
    let mob  = civ.state.socialMobility ?? 50;
    let pmob = civ.state.perceivedMobility ?? mob;
    const educQ   = civ.state.educationQuality ?? 50;
    const wc      = civ.economic?.wealthConcentration ?? 30;
    const iq      = civ.state.institutionalQuality ?? 50;
    const govId   = civ.governance?.modelId ?? '';
    const inherit = civ.governance?.inheritanceSystem ?? 'partible';
    const landConc = civ.state.landConcentration ?? 40;
    const caste   = civ.state.casteRigidity ?? 15;

    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── Great Gatsby Curve: compute equilibrium mobility ─────────
    // Gini proxy: wealthConcentration/100 ≈ Gini coefficient
    const gini = wc / 100;
    // IGE = 0.15 + 0.73 × Gini (Corak 2013 regression across 22 countries)
    const ige = 0.15 + 0.73 * gini;
    // Equilibrium mobility target from Great Gatsby Curve
    let mobilityTarget = Utils.clamp(100 * (1 - ige), 5, 95);
    // At wc=20: target≈73, wc=40: target≈56, wc=60: target≈41, wc=80: target≈27

    // ── Education shifts the curve (Chetty et al. 2014) ──────────
    // Education quality is the strongest policy lever for mobility
    if (educQ > 70) mobilityTarget += 8;       // Universal high-quality = strong equalizer
    else if (educQ > 50) mobilityTarget += 3;
    else if (educQ < 25) mobilityTarget -= 8;  // Poor education locks in inequality

    // ── Institutional quality: meritocratic vs. corrupt systems ──
    if (iq > 70) mobilityTarget += 5;
    else if (iq < 30) mobilityTarget -= 5;

    // ── Governance gatekeeping ───────────────────────────────────
    if (govId === 'oligarchy' || govId === 'shadow_government_complicit' ||
        govId === 'shadow_government_covert') mobilityTarget -= 10;
    else if (govId === 'flat_consensus' || govId === 'direct_congress') mobilityTarget += 5;

    // ── Inheritance system (wealth transmission across generations) ──
    if (inherit === 'primogeniture') mobilityTarget -= 6;   // Concentrates wealth in eldest
    else if (inherit === 'communal') mobilityTarget += 6;   // Community ownership
    else if (inherit === 'partible') mobilityTarget += 2;   // Split inheritance = diffusion

    // ── Land concentration (agrarian drag on mobility) ───────────
    if (landConc > 60) mobilityTarget -= (landConc - 60) / 40 * 5;
    else if (landConc < 20) mobilityTarget += 3;

    // ── Caste rigidity (hard ceiling on mobility) ────────────────
    if (caste > 30) mobilityTarget -= (caste - 30) / 70 * 15;

    mobilityTarget = Utils.clamp(mobilityTarget, 5, 95);

    // ── Actual mobility drifts toward target (institutional lag) ─
    // Mobility changes slowly — institutional change takes decades
    const driftRate = 0.08 * timeScale; // ~8%/decade convergence
    mob = Utils.lerp(mob, mobilityTarget, driftRate);

    mob = Utils.clamp(mob, 0, 100);
    civ.state.socialMobility = mob;

    // ── Perceived mobility drifts toward actual (perception lag) ──
    // Perception lags reality by ~10-20 years (generational experience)
    pmob = Utils.lerp(pmob, mob, 0.04 * timeScale);
    civ.state.perceivedMobility = Utils.clamp(pmob, 0, 100);

    // Compute gap (positive = actual > perceived, negative = people overestimate)
    civ.state.mobilityGap = Math.round(mob - pmob);

    // ── Cross-effects ────────────────────────────────────────────
    // Low perceived mobility → revolutionary pressure (Goldstone 2014)
    if (pmob < 30) {
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - 1.0 * timeScale, 0, 100);
    }
    // Large negative gap (perceived >> actual) → trust erosion
    const gap = mob - pmob;
    if (gap < -20) {
      civ.state.socialTrust = Utils.clamp(
        (civ.state.socialTrust ?? 50) - 0.5 * timeScale, 0, 100);
    }
  }

  _processTrade(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // GRAVITY MODEL + STOLPER-SAMUELSON (Tinbergen 1962, Samuelson 1941)
    // Gravity: trade ∝ (GDP₁ × GDP₂) / distance² — larger, closer economies trade more
    // Stolper-Samuelson: free trade benefits abundant factor, hurts scarce factor
    //   → capital-rich economies: free trade increases inequality
    //   → labor-rich economies: free trade can reduce inequality
    // Tariff effects: protect domestic industry but reduce specialization gains
    // ══════════════════════════════════════════════════════════════════════
    if (!civ.state) return;
    let tradeDep = civ.state.tradeDependency ?? 20;
    const tariff = civ.state.tariffLevel ?? 30;
    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── Gravity model: trade potential ───────────────────────────
    // Count active trade agreements (proxy for bilateral gravity)
    let tradePartners = 0;
    let partnerEconSize = 0;
    for (const [civId, rel] of (civ.relations || new Map())) {
      if (rel.trade) {
        tradePartners++;
        const partner = this.game.civilizations.find(c => c.id === civId);
        if (partner) partnerEconSize += (partner.state?.population ?? 1000) / 1000;
      }
    }

    // Gravity-based trade growth: larger partners + more partners = more trade
    const gravityPull = tradePartners * 1.5 + partnerEconSize * 0.3;
    // Tariff resistance: higher tariffs reduce trade growth
    const tariffBrake = tariff / 100; // 0-1
    // Net trade dependency change
    const tradeGrowth = (gravityPull * (1 - tariffBrake * 0.8) - 1.0) * timeScale;
    tradeDep = Utils.clamp(tradeDep + tradeGrowth, 0, 100);
    civ.state.tradeDependency = tradeDep;

    // ── Trade prosperity bonus (comparative advantage gains) ─────
    // Gains from trade: ~0.5-2% GDP boost from openness (Frankel & Romer 1999)
    const tradeGains = tradeDep * 0.008 * timeScale;
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + tradeGains, 0, 100);

    // ── Stolper-Samuelson distributional effects ─────────────────
    // Free trade: benefits the abundant factor, hurts the scarce factor
    const laborAbundant = (civ.economic?.laborShare ?? 60) > 55;
    const ls = civ.economic?.laborShare ?? 60;

    if (tariff < 20 && tradeDep > 30) {
      // Free trade + significant openness
      if (laborAbundant) {
        // Labor-abundant: free trade benefits workers (Stolper-Samuelson)
        civ.state.equalityIndex = Utils.clamp(
          (civ.state.equalityIndex ?? 50) + 0.3 * timeScale, 0, 100);
      } else {
        // Capital-abundant: free trade benefits capital owners → inequality rises
        civ.state.equalityIndex = Utils.clamp(
          (civ.state.equalityIndex ?? 50) - 0.5 * timeScale, 0, 100);
        // But innovation gains from specialization
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          (civ.state.behaviorReinforcement.innovation || 50) + 0.4 * timeScale, 0, 100);
      }
    } else if (tariff > 60) {
      // Protectionism: shelters domestic industry but suppresses specialization
      civ.state.equalityIndex = Utils.clamp(
        (civ.state.equalityIndex ?? 50) + 0.2 * timeScale, 0, 100);
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation || 50) - 0.5 * timeScale, 0, 100);
    }

    // ── Tariff retaliation risk (trade war dynamics) ─────────────
    // High tariffs provoke retaliatory tariffs from partners
    if (tariff > 60 && tradePartners > 0 && Utils.random() < 0.1 * timeScale) {
      tradeDep = Utils.clamp(tradeDep - 5 * timeScale, 0, 100);
      civ.state.tradeDependency = tradeDep;
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - 2 * timeScale, 0, 100);
    }

    // ── War disruption (trade collapse during conflict) ──────────
    const atWar = this.activeWars.some(w => w.attacker === civ.id || w.defender === civ.id);
    if (atWar && tradeDep > 30) {
      // War severs trade routes — proportional to dependency
      const tradeShock = tradeDep * 0.05 * timeScale;
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - tradeShock, 0, 100);
      civ.state.tradeDependency = Utils.clamp(tradeDep - 3 * timeScale, 0, 100);
    }
  }

  _recordEconomicSnapshot(civ) {
    if (!civ.state) return;
    if (!civ.state.economicHistory) civ.state.economicHistory = [];

    const snap = {
      turn:            this.game?.turnCount ?? 0,
      year:            this.game?.currentYear ?? 0,
      financialDepth:  Math.round(civ.state.financialDepth  ?? 30),
      debtLoad:        Math.round(civ.state.debtLoad        ?? 20),
      tradeDependency: Math.round(civ.state.tradeDependency ?? 20),
      tariffLevel:     Math.round(civ.state.tariffLevel     ?? 30),
      geiSnapshot:     Math.round(civ.state.genderEquity    ?? 50),
      iqSnapshot:      Math.round(civ.state.institutionalQuality ?? 50),
      ehSnapshot:      Math.round(civ.state.epistemicHealth  ?? 50),
      laborShare:      Math.round(civ.economic?.laborShare   ?? 60),
      socialTrust:     Math.round(civ.state.socialTrust     ?? 50),
      stateCapacity:   Math.round(civ.state.stateCapacity   ?? 50),
      socialMobility:  Math.round(civ.state.socialMobility  ?? 50),
      perceivedMobility: Math.round(civ.state.perceivedMobility ?? 50),
      infrastructureLevel: Math.round(civ.state.infrastructureLevel ?? 35),
      maintenanceDebt: Math.round(civ.state.maintenanceDebt ?? 0),
      anomieLevel: Math.round(civ.state.anomieLevel ?? 0),
      urbanizationRate: Math.round(civ.state.urbanizationRate ?? 15),
      militaryPower: Math.round(civ.state.militaryPower ?? 30),
      civilianControl: Math.round(civ.state.civilianControl ?? 50),
      legitimacyLevel: Math.round(civ.state.legitimacyLevel ?? 50),
      collectiveTrauma: Math.round(civ.state.collectiveTrauma ?? 0),
      landConcentration: Math.round(civ.state.landConcentration ?? 40),
      casteRigidity: Math.round(civ.state.casteRigidity ?? 15),
      institutionalLockin: Math.round(civ.state.institutionalLockin ?? 30),
      techUnemployment: Math.round(civ.state.techUnemployment ?? 0),
      retrainingCapacity: Math.round(civ.state.retrainingCapacity ?? 40),
      ethnicFractionalization: Math.round(civ.state.ethnicFractionalization ?? 35),
      politicalInclusion: Math.round(civ.state.politicalInclusion ?? 50),
      exclusionRisk: Math.round(civ.state._exclusionRisk ?? 0),
      // Minsky financial cycle
      minskyPhase: Math.round(civ.state.minskyPhase ?? 25),
      financialStability: Math.round(civ.state.financialStability ?? 70),
      yearsSinceFinancialCrisis: Math.round(civ.state.yearsSinceFinancialCrisis ?? 50),
      // Demographic transition (Round 15)
      demographicTransitionStage: civ.state.demographicTransitionStage ?? 1,
      fertilityRate: Math.round((civ.state.fertilityRate ?? 45) * 10) / 10,
      mortalityRate: Math.round((civ.state.mortalityRate ?? 40) * 10) / 10,
      lifeExpectancy: Math.round(civ.state.lifeExpectancy ?? 32),
      infantMortality: Math.round(civ.state.infantMortality ?? 75),
      diseaseBurden: Math.round(civ.state.diseaseBurden ?? 60),
      sanitationLevel: Math.round(civ.state.sanitationLevel ?? 18),
      youthCohort: Math.round((civ.state.youthCohort ?? 40) * 10) / 10,
      elderlyCohort: Math.round((civ.state.elderlyCohort ?? 5) * 10) / 10,
      // Per-stratum wellbeing proxy — use overall wellbeing with debt model adjustment
      strataWellbeing: this._computeStrataWellbeingSnapshot(civ),
      // Aggregate economic health score (0-100): weighted combo of financial depth, low debt, trade
      aggregateEconomicHealth: Math.round(
        (civ.state.financialDepth ?? 30) * 0.4 +
        (100 - (civ.state.debtLoad ?? 20)) * 0.4 +
        (civ.state.tradeDependency ?? 20) * 0.2
      ),
    };

    // Divergence score: aggregate health vs. bottom-stratum reality
    const bottomAvg = Math.round((snap.strataWellbeing.working_class + snap.strataWellbeing.disenfranchised) / 2);
    snap.divergenceScore = Utils.clamp(snap.aggregateEconomicHealth - bottomAvg, -100, 100);

    // Ring buffer: keep last 50 entries
    civ.state.economicHistory.push(snap);
    if (civ.state.economicHistory.length > 50) civ.state.economicHistory.shift();
  }

  _computeStrataWellbeingSnapshot(civ) {
    // Compute per-stratum wellbeing proxy from base wellbeing + debt model + education access deltas
    const base = civ.state.averageWellbeing ?? 50;
    const debtModel = (typeof DEBT_MODEL_TYPES !== 'undefined')
      ? DEBT_MODEL_TYPES.find(m => m.id === (civ.state.debtModel || 'regulated_credit'))
      : null;
    const educTier = (typeof EDUCATION_ACCESS_TIERS !== 'undefined')
      ? EDUCATION_ACCESS_TIERS.find(t => t.id === (civ.state.educationAccess || 'universal_lower'))
      : null;

    const strata = ['elite', 'upper_middle', 'lower_middle', 'working_class', 'disenfranchised'];
    const result = {};
    for (const s of strata) {
      let wb = base;
      if (debtModel?.strataWellbeingEffects?.[s]) wb += debtModel.strataWellbeingEffects[s] * 0.3;
      const edMult = educTier?.strataMultipliers?.[s] ?? 0.5;
      const edQ    = (civ.state.educationQuality ?? 50) / 100;
      wb += (edMult * edQ - 0.5) * 5; // education access delta
      const gei = civ.state.genderEquity ?? 50;
      if ((s === 'working_class' || s === 'disenfranchised') && gei < 40) wb -= (40 - gei) * 0.1;
      // Low labor share penalizes lower strata (capital captures more, workers get less)
      const laborSh = civ.economic?.laborShare ?? 60;
      if ((s === 'working_class' || s === 'disenfranchised') && laborSh < 50) wb -= (50 - laborSh) * 0.15;
      result[s] = Utils.clamp(Math.round(wb), 0, 100);
    }
    return result;
  }

  // ── Society Event Methods ──────────────────────────────────────

  _applyEducationChange(civ, event) {
    if (!civ.state) return;
    const prev = civ.state.educationAccess;
    civ.state.educationAccess = event.tier || event.access || civ.state.educationAccess;
    if (event.quality !== undefined) civ.state.educationQuality = Utils.clamp(event.quality, 0, 100);
    const tier = (typeof EDUCATION_ACCESS_TIERS !== 'undefined')
      ? EDUCATION_ACCESS_TIERS.find(t => t.id === civ.state.educationAccess) : null;
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, `📚 Education Policy Changed`,
      `Education access changed from "${prev}" to "${civ.state.educationAccess}". ${tier?.description || ''}`,
      'set_education_access');
    this.game.ui?.showNotification(`📚 ${civ.name}: Education access set to "${tier?.label || civ.state.educationAccess}"`, 'info');
  }

  _applyDebtModelChange(civ, event) {
    if (!civ.state) return;
    const prev = civ.state.debtModel;
    civ.state.debtModel = event.model || civ.state.debtModel;
    const model = (typeof DEBT_MODEL_TYPES !== 'undefined')
      ? DEBT_MODEL_TYPES.find(m => m.id === civ.state.debtModel) : null;
    if (civ.state.debtModel === 'debtless') civ.state.debtLoad = Math.max(0, (civ.state.debtLoad ?? 20) - 10);
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, `💰 Debt System Changed`,
      `The civilization's debt model changed from "${prev}" to "${civ.state.debtModel}". ${model?.description || ''}`,
      'set_debt_model');
    this.game.ui?.showNotification(`💰 ${civ.name}: Debt model set to "${model?.label || civ.state.debtModel}"`, 'info');
  }

  _applyFinancialCrisis(civ, severity, peakPhase) {
    if (!civ.state) return;
    // Calibrated to Reinhart & Rogoff "Aftermath of Financial Crises" (2009):
    // Avg: GDP -9.3%, equity -56%, housing -35%, unemployment +7pp, gov debt +86%
    const sev = severity ?? 1.0;
    const wbHit = Math.round(12 * sev);
    const stabHit = Math.round(10 * sev);
    const eqHit = Math.round(6 * sev);
    const debtHit = Math.round(15 * sev);

    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - wbHit, 0, 100);
    civ.state.stabilityIndex   = Utils.clamp((civ.state.stabilityIndex   ?? 70) - stabHit, 0, 100);
    civ.state.equalityIndex    = Utils.clamp((civ.state.equalityIndex    ?? 50) - eqHit, 0, 100);
    // Debt paradox: crisis reduces private debt via defaults but increases gov debt
    civ.state.debtLoad         = Utils.clamp((civ.state.debtLoad         ?? 20) + debtHit, 0, 100);
    // Social trust damaged (Stevenson & Wolfers 2011)
    civ.state.socialTrust      = Utils.clamp((civ.state.socialTrust      ?? 50) - Math.round(5 * sev), 0, 100);
    // Anomie spike from economic disruption (Durkheim)
    civ.state.anomieLevel      = Utils.clamp((civ.state.anomieLevel      ?? 0)  + Math.round(8 * sev), 0, 100);
    // Legitimacy damaged (government seen as complicit/incompetent)
    civ.state.legitimacyLevel  = Utils.clamp((civ.state.legitimacyLevel  ?? 50) - Math.round(5 * sev), 0, 100);
    // Financial stability crashes
    civ.state.financialStability = Utils.clamp((civ.state.financialStability ?? 70) - Math.round(25 * sev), 0, 100);
    // Reset Minsky phase to revulsion
    civ.state.minskyPhase = 5 + Utils.random() * 10;
    civ.state.yearsSinceFinancialCrisis = 0;

    const sevLabel = sev > 1.1 ? 'severe' : (sev > 0.9 ? 'major' : 'moderate');
    const phaseLabel = (peakPhase ?? 0) > 80 ? 'Minsky moment' : 'financial crisis';
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, `💥 Financial Crisis (${sevLabel})`,
      `A ${sevLabel} ${phaseLabel} struck after prolonged credit expansion. ` +
      `Wellbeing −${wbHit}, stability −${stabHit}, equality −${eqHit}. ` +
      `Debt burden increased as government absorbed losses. Social trust and legitimacy damaged.`,
      'financial_crisis');
    this.game.ui?.showNotification(
      `💥 ${civ.name}: ${sevLabel.charAt(0).toUpperCase() + sevLabel.slice(1)} ${phaseLabel}!`, 'info');
  }

  _applyDebtJubilee(civ, event) {
    if (!civ.state) return;
    const flavor = event?.flavor || 'jubilee';
    const debtReduction = { jubilee: 50, service: 20, contribution: 15, hardship: 10, bankruptcy: 30 };
    const reduction = debtReduction[flavor] ?? 20;
    civ.state.debtLoad    = Utils.clamp((civ.state.debtLoad    ?? 20) * (1 - reduction / 100), 0, 100);
    civ.state.equalityIndex = Utils.clamp((civ.state.equalityIndex ?? 50) + 8, 0, 100);
    const LABELS = { jubilee: 'Debt Jubilee', service: 'Service-Based Debt Discharge', contribution: 'Civic Contribution Debt Offset', hardship: 'Hardship Debt Adjudication', bankruptcy: 'Bankruptcy Protection Exercise' };
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, `🕊️ ${LABELS[flavor] || 'Debt Forgiveness'}`,
      `${reduction}% of aggregate debt was cancelled through ${flavor} forgiveness. Equality improved.`, 'debt_jubilee');
    this.game.ui?.showNotification(`🕊️ ${civ.name}: ${LABELS[flavor] || 'Debt forgiveness'} — debt reduced by ${reduction}%`, 'info');
  }

  _applyTradeDisruption(civ) {
    if (!civ.state) return;
    civ.state.tradeDependency = Utils.clamp((civ.state.tradeDependency ?? 20) * 0.5, 0, 100);
    // Hurt trade-dependent civs more
    const shock = Math.round((civ.state.tradeDependency ?? 20) > 40 ? 8 : 4);
    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - shock, 0, 100);
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, '⚡ Trade Disruption',
      'A major trade disruption cut trade flows by half, reducing prosperity and weakening trade-dependent sectors.', 'trade_disruption');
    this.game.ui?.showNotification(`⚡ ${civ.name}: Trade disruption — wellbeing −${shock}`, 'info');
  }

  _applyEconomicBoom(civ) {
    if (!civ.state) return;
    // Boom benefits upper strata more
    const BOOM_STRATA = { elite: 12, upper_middle: 8, lower_middle: 5, working_class: 3, disenfranchised: 2 };
    const WEIGHTS     = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
    let wbDelta = 0;
    for (const [k, w] of Object.entries(WEIGHTS)) wbDelta += (BOOM_STRATA[k] ?? 5) * w;
    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + Math.round(wbDelta), 0, 100);
    civ.state.financialDepth   = Utils.clamp((civ.state.financialDepth   ?? 30) + 10, 0, 100);
    civ.state.debtLoad         = Utils.clamp((civ.state.debtLoad         ?? 20) +  5, 0, 100); // growth often financed by debt
    const yr = this.game?.currentYear ?? 0;
    civ.addHistoryEntry(yr, '📈 Economic Boom',
      `An economic boom raised aggregate wellbeing (+${Math.round(wbDelta)}) and expanded financial depth. Note: gains concentrate in upper strata.`, 'economic_boom');
    this.game.ui?.showNotification(`📈 ${civ.name}: Economic boom — aggregate wellbeing +${Math.round(wbDelta)}`, 'info');
  }

  // ── Family Structure, Childcare & Family Size ─────────────────
  _processFamilyStructure(civ) {
    if (!civ.state) return;

    // Family structure effects
    const fsId = civ.state.familyStructure ?? 'nuclear';
    const fs = (typeof FAMILY_STRUCTURES !== 'undefined')
      ? FAMILY_STRUCTURES.find(f => f.id === fsId) : null;
    if (fs) {
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) + fs.perTurnEffects.wellbeing * 0.5, 0, 100);
      // socialCohesion → proxy into stabilityIndex (mild)
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) + fs.perTurnEffects.socialCohesion * 0.3, 0, 100);
      // Elderly care cross-effect: extended/community families reduce aging stability risk
      if ((civ.state.demographicProfile === 'aging' || civ.state.demographicProfile === 'demographic_stress')
          && fs.elderlyCareFactor > 0.7) {
        civ.state._elderlyCareMod = true; // consumed by _processDemographics next turn check
      }
    }

    // Childcare norm effects
    const normId = civ.state.childcareNorm ?? 'mother_primary';
    const norm = (typeof CHILDCARE_NORMS !== 'undefined')
      ? CHILDCARE_NORMS.find(n => n.id === normId) : null;
    if (norm) {
      civ.state.genderEquity = Utils.clamp(
        (civ.state.genderEquity ?? 50) + norm.geiDriftEffect, 0, 100);
      civ.state.financialDepth = Utils.clamp(
        (civ.state.financialDepth ?? 30) + norm.laborParticipationBonus * 0.5, 0, 100);
      const eduBonus = ((fs?.childDevelopmentBonus ?? 0) + norm.childDevelopmentBonus) * 0.1;
      civ.state.educationQuality = Utils.clamp(
        (civ.state.educationQuality ?? 50) + eduBonus, 0, 100);
      // Synergy bonus: extended family childcare + extended family structure
      if (normId === 'extended_family' && fsId === 'extended') {
        civ.state.educationQuality = Utils.clamp(civ.state.educationQuality + 0.005, 0, 100);
      }
    }

    // Family size policy effects
    const fspId = civ.state.familySizePolicy ?? 'neutral';
    const fsp = (typeof FAMILY_SIZE_POLICIES !== 'undefined')
      ? FAMILY_SIZE_POLICIES.find(p => p.id === fspId) : null;
    if (fsp) {
      // Pop-weighted composite wellbeing delta
      const WEIGHTS = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
      let wbDelta = 0;
      for (const [k, w] of Object.entries(WEIGHTS)) {
        wbDelta += (fsp.strataWellbeingBonus?.[k] ?? 0) * w;
      }
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) + wbDelta * 0.02, 0, 100);
      // Strictly controlled: EH + equality penalties
      if (fspId === 'strictly_controlled') {
        civ.state.epistemicHealth = Utils.clamp(
          (civ.state.epistemicHealth ?? 50) - 0.02, 0, 100);
        civ.state.equalityIndex = Utils.clamp(
          (civ.state.equalityIndex ?? 50) - 0.01, 0, 100);
      }
      // Store demographic drift pressure for _processDemographics
      civ.state._familySizePressure = fsp.demographicDriftPressure; // 'young'|'aging'|null
    }
  }

  // ── Reproductive Health ────────────────────────────────────────
  _processReproductiveHealth(civ) {
    if (!civ.state) return;
    const tierId = civ.state.reproductiveHealthTier ?? 'available';
    const tier = (typeof REPRODUCTIVE_HEALTH_TIERS !== 'undefined')
      ? REPRODUCTIVE_HEALTH_TIERS.find(t => t.id === tierId) : null;
    if (!tier) return;

    // Stratum wellbeing bonus (pop-weighted composite, scaled × 0.02)
    const WEIGHTS = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
    let wbDelta = 0;
    for (const [k, w] of Object.entries(WEIGHTS)) {
      wbDelta += (tier.strataWellbeingBonus?.[k] ?? 0) * w;
    }
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + wbDelta * 0.02, 0, 100);

    civ.state.genderEquity = Utils.clamp(
      (civ.state.genderEquity ?? 50) + tier.geiDriftBonus, 0, 100);
    civ.state.epistemicHealth = Utils.clamp(
      (civ.state.epistemicHealth ?? 50) + tier.epistemicHealthBonus * 0.01, 0, 100);

    // Combine birth rate modifier with family size policy for demographic drift
    const fspId  = civ.state.familySizePolicy ?? 'neutral';
    const fsp    = (typeof FAMILY_SIZE_POLICIES !== 'undefined')
      ? FAMILY_SIZE_POLICIES.find(p => p.id === fspId) : null;
    const totalBirthMod = (tier.birthRateModifier ?? 0) + (fsp?.birthRateModifier ?? 0);
    // Store combined signal — consumed by _processDemographics next turn
    civ.state._birthRatePressure = totalBirthMod;
  }

  // ── Women's Rights ─────────────────────────────────────────────
  _processWomensRights(civ) {
    if (!civ.state) return;
    const tierId = civ.state.womensRightsTier ?? 'mostly_full';
    const tier = (typeof WOMENS_RIGHTS_TIERS !== 'undefined')
      ? WOMENS_RIGHTS_TIERS.find(t => t.id === tierId) : null;
    if (!tier) return;

    // GEI soft anchor — drifts 0.5% toward anchor per turn
    const gei = civ.state.genderEquity ?? 50;
    civ.state.genderEquity = Utils.clamp(
      gei + (tier.geiAnchor - gei) * 0.005, 0, 100);

    // Innovation effect (apply via educationQuality as proxy)
    civ.state.educationQuality = Utils.clamp(
      (civ.state.educationQuality ?? 50) + tier.innovationBonus * 0.5, 0, 100);

    // Stratum wellbeing (pop-weighted, scaled × 0.02)
    const WEIGHTS = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
    let wbDelta = 0;
    for (const [k, w] of Object.entries(WEIGHTS)) {
      wbDelta += (tier.strataWellbeingBonus?.[k] ?? 0) * w;
    }
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + wbDelta * 0.02, 0, 100);

    civ.state.equalityIndex = Utils.clamp(
      (civ.state.equalityIndex ?? 50) + tier.equalityBonus * 0.01, 0, 100);
    civ.state.financialDepth = Utils.clamp(
      (civ.state.financialDepth ?? 30) + (tier.financialDepthBonus ?? 0), 0, 100);
  }

  // ── Science ───────────────────────────────────────────────────
  // Science and arts are modeled separately: civilizations may invest heavily in applied
  // research while restricting artistic expression (or vice versa).
  _processScience(civ) {
    if (!civ.state) return;
    const support    = civ.state.scienceSupport    ?? 50;
    const freedom    = civ.state.scienceFreedom    ?? 50;
    const constraint = civ.state.scienceFreedomConstraint ?? 'none';
    const suppFrac   = support  / 100;
    const freeFrac   = freedom  / 100;

    // Innovation boost from scientific investment + free inquiry
    civ.state.educationQuality = Utils.clamp(
      (civ.state.educationQuality ?? 50) + suppFrac * 0.06 + freeFrac * 0.04, 0, 100);

    // Epistemic health boost from free scientific inquiry
    civ.state.epistemicHealth = Utils.clamp(
      (civ.state.epistemicHealth ?? 50) + freeFrac * 0.03, 0, 100);

    // Constraint penalties on science
    if (constraint === 'government' || constraint === 'mixed') {
      civ.state.institutionalQuality = Utils.clamp(
        (civ.state.institutionalQuality ?? 50) - (constraint === 'mixed' ? 0.005 : 0.015), 0, 100);
    }
    if (constraint === 'religion' || constraint === 'mixed') {
      civ.state.epistemicHealth = Utils.clamp(
        (civ.state.epistemicHealth ?? 50) - (constraint === 'mixed' ? 0.01 : 0.02), 0, 100);
    }
    if (constraint === 'capital' || constraint === 'mixed') {
      // Capital constraint suppresses basic/blue-sky research; applied research remains
      civ.state.educationQuality = Utils.clamp(
        (civ.state.educationQuality ?? 50) - (constraint === 'mixed' ? 0.005 : 0.01), 0, 100);
    }
  }

  // ── Arts & Culture ───────────────────────────────────────────
  _processArts(civ) {
    if (!civ.state) return;
    const support    = civ.state.artsSupport    ?? 50;
    const freedom    = civ.state.artsFreedom    ?? 50;
    const constraint = civ.state.artsFreedomConstraint ?? 'none';
    const suppFrac   = support  / 100;
    const freeFrac   = freedom  / 100;

    // Quality-of-life wellbeing boost from cultural investment
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + suppFrac * 0.03, 0, 100);

    // Epistemic health boost from free artistic expression
    civ.state.epistemicHealth = Utils.clamp(
      (civ.state.epistemicHealth ?? 50) + freeFrac * 0.01, 0, 100);

    // Social cohesion: high arts support strengthens cultural identity
    civ.state.stabilityIndex = Utils.clamp(
      (civ.state.stabilityIndex ?? 50) + suppFrac * 0.005, 0, 100);

    // Constraint penalties on arts
    if (constraint === 'government' || constraint === 'mixed') {
      // State control of art reduces epistemic health (propaganda replaces expression)
      civ.state.epistemicHealth = Utils.clamp(
        (civ.state.epistemicHealth ?? 50) - (constraint === 'mixed' ? 0.005 : 0.01), 0, 100);
    }
    if (constraint === 'religion' || constraint === 'mixed') {
      // Religious control of art suppresses equality (non-conforming groups silenced)
      civ.state.equalityIndex = Utils.clamp(
        (civ.state.equalityIndex ?? 50) - (constraint === 'mixed' ? 0.003 : 0.008), 0, 100);
    }
    if (constraint === 'capital' || constraint === 'mixed') {
      // Only commercially viable art survives: cultural inequality rises
      civ.state.equalityIndex = Utils.clamp(
        (civ.state.equalityIndex ?? 50) - (constraint === 'mixed' ? 0.005 : 0.01), 0, 100);
    }
  }

  // ── Healthcare ─────────────────────────────────────────────────────────────
  _processHealthcare(civ) {
    if (!civ.state) return;
    const tierDef  = HEALTHCARE_ACCESS_TIERS.find(t => t.id === (civ.state.healthcareAccess ?? 'mixed_public_private'));
    const emphDef  = HEALTHCARE_EMPHASIS_TYPES.find(e => e.id === (civ.state.healthcareEmphasis ?? 'balanced'));
    const incntDef = HEALTHCARE_INCENTIVE_MODELS.find(m => m.id === (civ.state.healthcareIncentive ?? 'mixed'));
    if (!tierDef || !emphDef || !incntDef) return;

    // Population-weighted wellbeing by stratum
    const strataKeys = ['elite', 'upper_middle', 'lower_middle', 'working_class', 'disenfranchised'];
    let wellbeingDelta = 0, totalPop = 0;
    for (const sk of strataKeys) {
      const pop = civ.state.strata?.[sk]?.population ?? 0;
      const mul = tierDef.strataMultipliers[sk] ?? 0.5;
      wellbeingDelta += pop * mul * tierDef.wellbeingBase;
      totalPop += pop;
    }
    if (totalPop > 0) {
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) + (wellbeingDelta / totalPop) * 0.005, 0, 100);
    }

    // Emphasis drift on wellbeing
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + emphDef.wellbeingDriftBonus * 0.005, 0, 100);

    // Incentive model effects
    civ.state.equalityIndex   = Utils.clamp((civ.state.equalityIndex   ?? 50) + incntDef.equalityBonus       * 0.005, 0, 100);
    civ.state.epistemicHealth = Utils.clamp((civ.state.epistemicHealth ?? 50) + incntDef.epistemicHealthBonus * 0.005, 0, 100);
    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + incntDef.wellbeingModifier  * 0.005, 0, 100);

    // Tier equality bonus
    civ.state.equalityIndex = Utils.clamp((civ.state.equalityIndex ?? 50) + tierDef.equalityBonus * 0.005, 0, 100);

    // Financial depth risk
    civ.state.financialDepth = Utils.clamp((civ.state.financialDepth ?? 50) + tierDef.financialRisk, 0, 100);

    // Store plague mitigation factor for use by _processCrisis
    civ.state._healthcarePlagueMitigation = emphDef.plagueMitigationBonus;

    // Birth rate demographic pressure
    if (tierDef.birthRateMod > 0.05) {
      civ.state._demographicBirthMod = (civ.state._demographicBirthMod ?? 0) + 0.15;
    } else if (tierDef.birthRateMod < -0.05) {
      civ.state._demographicBirthMod = (civ.state._demographicBirthMod ?? 0) - 0.1;
    }
  }

  // ── Resource Strategy ──────────────────────────────────────────────────────
  _processResourceStrategy(civ) {
    if (!civ.state) return;
    const strat = RESOURCE_STRATEGIES.find(s => s.id === (civ.state.resourceStrategy ?? 'balanced_stewardship'));
    const obs   = OBSOLESCENCE_MODELS.find(o => o.id === (civ.state.obsolescenceModel ?? 'regulated'));
    if (!strat || !obs) return;

    // Compute effective depletion/pollution/waste multipliers
    let depMult, polMult, wstMult;
    if (strat.id === 'government_managed') {
      // Scale with institutional quality: low IQ → near extraction; high IQ → near conservation
      const iqFrac = Utils.clamp((civ.state.institutionalQuality ?? 50) / 100, 0, 1);
      depMult = 1.2 - iqFrac * 0.7;   // 1.2 (weak gov) → 0.5 (strong gov)
      polMult = 1.3 - iqFrac * 0.9;
      wstMult = 1.2 - iqFrac * 0.75;
    } else {
      depMult = strat.depletionMultiplier;
      polMult = strat.pollutionMultiplier;
      wstMult = strat.wasteMultiplier;
    }

    // Apply obsolescence modifier (multiplicative)
    depMult *= (1 + obs.resourceDepletionMod);
    polMult *= (1 + obs.wasteMultiplierMod * 0.5);
    wstMult *= (1 + obs.wasteMultiplierMod);

    // Store on state for use by civilization.js _updateResourceDepletion / _updatePollution
    civ.state._resourceDepletionMod = depMult;
    civ.state._pollutionMod         = polMult;
    civ.state._wasteMod             = wstMult;

    // Growth and wellbeing side effects
    civ.state.financialDepth   = Utils.clamp((civ.state.financialDepth   ?? 50) + strat.growthPenalty + obs.growthMod * 0.5, 0, 100);
    civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) + strat.wellbeingBonus * 0.005 + obs.wellbeingMod * 0.005, 0, 100);

    // Crisis threshold resilience offset (positive = crises trigger later)
    civ.state._resourceCrisisOffset = strat.crisisThresholdBonus;
  }

  // ── Resource History Snapshot ──────────────────────────────────────────────
  _recordResourceSnapshot(civ) {
    if (!civ.state) return;
    const dep = civ.state.resourceDepletion ?? {};
    if (!Array.isArray(civ.state.resourceHistory)) civ.state.resourceHistory = [];
    civ.state.resourceHistory.push({
      turn:              this.game?.turnCount ?? 0,
      year:              this.game?.currentYear ?? 0,
      forests:           dep.forests      ?? 100,
      soil:              dep.soil         ?? 100,
      minerals:          dep.minerals     ?? 100,
      water:             dep.water        ?? 100,
      pollution:         civ.state.pollutionIndex    ?? 0,
      waste:             civ.state.wasteAccumulation ?? 0,
      resourceStrategy:  civ.state.resourceStrategy  ?? 'balanced_stewardship',
      obsolescenceModel: civ.state.obsolescenceModel ?? 'regulated',
      energySource:      civ.state.energySource      ?? 'wood',
      energyEROI:        civ.state.energyEROI         ?? 3,
      energySurplus:     civ.state.energySurplus       ?? 0,
      ecologicalCapacity: civ.state.ecologicalCapacity ?? 100,
      overshootRatio:    civ.state.overshootRatio      ?? 0.5,
      foodSecurity:      Math.round(civ.state.foodSecurity ?? 60),
      diseaseBurden:     Math.round(civ.state.diseaseBurden ?? 60),
      sanitationLevel:   Math.round(civ.state.sanitationLevel ?? 18),
    });
    if (civ.state.resourceHistory.length > 50) civ.state.resourceHistory.shift();
  }

  // ── Information Ecosystem ──────────────────────────────────────────────────
  _processInformationEcosystem(civ) {
    if (!civ.state) return;
    const tier = INFORMATION_ECOSYSTEM_TYPES.find(t => t.id === (civ.state.informationEcosystem ?? 'free_market_media'));
    if (!tier) return;

    // EH truth anchor: per-turn pull toward the tier's equilibrium EH value
    const eh = civ.state.epistemicHealth ?? 50;
    civ.state.epistemicHealth = Utils.clamp(
      eh + (tier.truthAnchor - eh) * 0.006 + tier.epistemicHealthEffect * 0.01, 0, 100);

    // Innovation cross-effect via education quality
    civ.state.educationQuality = Utils.clamp(
      (civ.state.educationQuality ?? 50) + tier.innovationBonus * 0.005, 0, 100);

    // Social cohesion → stability
    civ.state.stabilityIndex = Utils.clamp(
      (civ.state.stabilityIndex ?? 50) + tier.socialCohesionEffect * 0.005, 0, 100);

    // Equality drift
    civ.state.equalityIndex = Utils.clamp(
      (civ.state.equalityIndex ?? 50) + tier.equalityEffect * 0.005, 0, 100);
  }

  // ── Pass 7: Empathy Cascade ────────────────────────────────────────────────
  _processEmpathyCascade(civ) {
    if (!civ.state) return;
    const s = civ.state;

    // Susceptibility model
    const susModel = (typeof SUSCEPTIBILITY_MODELS !== 'undefined')
      ? SUSCEPTIBILITY_MODELS.find(m => m.id === (s.susceptibilityModel ?? 'moderate_variation')) : null;
    const cascadeRate = susModel?.cascadeRate ?? 1.0;

    // Dual power source: governance + economic (wealth-as-power)
    const govHL       = civ.governance?.hierarchyLevel ?? 50;
    const econModel   = civ.governance?.economicModelId ?? s.economicModel ?? 'mixed';
    const wealthConc  = Utils.clamp((100 - (s.equalityIndex ?? 50)) / 100, 0, 1);
    const econPow     = (typeof ECON_POWER_POTENTIAL !== 'undefined')
      ? (ECON_POWER_POTENTIAL[econModel] ?? 0.30) : 0.30;
    const econHierarchy = econPow * wealthConc * 100;
    const effectiveHL = Math.max(govHL, econHierarchy);
    s.effectiveHierarchyLevel = Math.round(effectiveHL);
    s.economicPowerHierarchy  = Math.round(econHierarchy);
    s.govContributes          = govHL >= econHierarchy;

    const hierarchyFactor  = Utils.clamp(effectiveHL / 100, 0, 1);
    const inequalityFactor = wealthConc;
    const powerScale = Utils.clamp(0.5 + hierarchyFactor * 0.3 + inequalityFactor * 0.2, 0.5, 1.0);

    // Per-stratum empathy cascade (all except disenfranchised)
    const POWER_BASE = (typeof STRATUM_POWER_BASE !== 'undefined')
      ? STRATUM_POWER_BASE : { elite:0.90, upper_middle:0.58, lower_middle:0.32, working_class:0.10, disenfranchised:0.00 };
    const strata = ['elite', 'upper_middle', 'lower_middle', 'working_class'];
    if (!s.empathyByStratum) s.empathyByStratum = { elite:50, upper_middle:60, lower_middle:68, working_class:75, disenfranchised:80 };
    if (!s.prosocialByStratum) s.prosocialByStratum = { elite:50, upper_middle:60, lower_middle:68, working_class:75, disenfranchised:55 };

    for (const st of strata) {
      const powerDiff   = (POWER_BASE[st] ?? 0) * powerScale;
      const suppression = powerDiff * cascadeRate * 50;
      const target      = Utils.clamp(80 - suppression, 10, 90);
      const current     = s.empathyByStratum[st] ?? 50;
      const isRecovering = target > current;
      let rate = isRecovering ? 0.015 : 0.030;   // 2:1 asymmetry; suppression faster
      if (st === 'elite' && isRecovering) {
        rate *= Math.max(0.4, 1 - (s.hierarchyEntrenched ?? 0) / 200);
      }
      s.empathyByStratum[st]  = Utils.clamp(Utils.lerp(current, target, rate), 0, 100);
      s.prosocialByStratum[st]= s.empathyByStratum[st];
    }

    // Disenfranchised: empathy intact (no power suppression); prosocial constrained
    const disEmpathyCur = s.empathyByStratum.disenfranchised ?? 80;
    s.empathyByStratum.disenfranchised = Utils.clamp(Utils.lerp(disEmpathyCur, 78, 0.015), 0, 100);
    const resourceSlack = Utils.clamp((s.averageWellbeing ?? 50) / 100, 0, 1);
    const stabilityFac  = Utils.clamp((s.stabilityIndex ?? 50) / 100, 0, 1);
    const oppComp       = Utils.clamp((100 - (s.equalityIndex ?? 50)) * (0.5 + hierarchyFactor * 0.5), 0, 100);
    s.opportunityCompetition = oppComp;
    s.mutualAidCapacity      = Utils.clamp(
      (resourceSlack * 0.40 + stabilityFac * 0.30 + (1 - oppComp / 100) * 0.30) * 100, 0, 100);
    s.prosocialByStratum.disenfranchised = Utils.clamp(
      s.empathyByStratum.disenfranchised * (s.mutualAidCapacity / 100), 0, 100);

    // Hierarchical entrenchment counter
    if ((s.empathyByStratum.elite ?? 50) < 40) {
      s.hierarchyEntrenched = Utils.clamp((s.hierarchyEntrenched ?? 0) + 0.5, 0, 100);
    } else {
      s.hierarchyEntrenched = Utils.clamp((s.hierarchyEntrenched ?? 0) - 0.15, 0, 100);
    }

    // Population-weighted aggregates → update existing empathyLevel + leaderEmpathy (backward compat)
    const W = { elite:0.05, upper_middle:0.15, lower_middle:0.25, working_class:0.35, disenfranchised:0.20 };
    const empathyAgg  = Object.entries(W).reduce((sum, [k, w]) => sum + (s.empathyByStratum[k]  ?? 50) * w, 0);
    const prosocialAgg= Object.entries(W).reduce((sum, [k, w]) => sum + (s.prosocialByStratum[k] ?? 50) * w, 0);
    s.empathyLevel  = Utils.clamp(empathyAgg, 0, 100);
    s.leaderEmpathy = Utils.clamp(s.empathyByStratum.elite ?? 50, 0, 100);

    // BR Cooperation Score (synthesised from 10 behaviorReinforcement dimensions)
    const b = s.behaviorReinforcement || {};
    const brCoopScore = Utils.clamp(
      50 + ((b.cooperation ?? 50) + (b.mutualAid ?? 50) + (b.collectivism ?? 50)
          - (b.competition ?? 50) - (b.acquisitiveness ?? 50) - (b.individualism ?? 50)) / 6,
      0, 100);
    s.brCoopScore = brCoopScore;

    // Prosocial Behavioral Index (PBI): empathy × BR interaction
    const ef = empathyAgg / 100;
    const bf = brCoopScore / 100;
    s.prosocialBehavioralIndex = Utils.clamp((ef * 0.55 + bf * 0.45) * 80 + ef * bf * 20, 0, 100);

    // Cultural empathy norm (very slow, asymmetric path-dependent drift)
    const normCur    = s.culturalEmpathyNorm ?? 65;
    const normTarget = prosocialAgg;
    const normRate   = normTarget > normCur ? 0.003 : 0.006;
    s.culturalEmpathyNorm = Utils.clamp(Utils.lerp(normCur, normTarget, normRate), 0, 100);

    // Cross-effects on existing variables
    const eliteDeficit = (80 - (s.empathyByStratum.elite ?? 50)) / 80;
    s.corruptionIndex = Utils.clamp((s.corruptionIndex ?? 0) + eliteDeficit * 0.03, 0, 100);
    const normDeficit = (65 - (s.culturalEmpathyNorm ?? 65)) / 65;
    s.stabilityIndex  = Utils.clamp((s.stabilityIndex ?? 50) - normDeficit * 0.01, 0, 100);
    if (b.mutualAid !== undefined)  b.mutualAid   = Utils.clamp(Utils.lerp(b.mutualAid, s.mutualAidCapacity, 0.01), 0, 100);
    if (b.cooperation !== undefined) b.cooperation = Utils.clamp(Utils.lerp(b.cooperation, prosocialAgg, 0.01), 0, 100);

    // Empathy history ring buffer (max 50)
    if (!Array.isArray(s.empathyHistory)) s.empathyHistory = [];
    s.empathyHistory.push({
      turn: this.game?.turnCount ?? 0,
      norm: Math.round(s.culturalEmpathyNorm),
      elite:         Math.round(s.empathyByStratum.elite ?? 0),
      upper_middle:  Math.round(s.empathyByStratum.upper_middle ?? 0),
      lower_middle:  Math.round(s.empathyByStratum.lower_middle ?? 0),
      working_class: Math.round(s.empathyByStratum.working_class ?? 0),
      disenfranchised: Math.round(s.empathyByStratum.disenfranchised ?? 0),
      prosocialDisfranch: Math.round(s.prosocialByStratum.disenfranchised ?? 0),
      mutualAid:     Math.round(s.mutualAidCapacity ?? 0),
      brCoopScore:   Math.round(brCoopScore),
      PBI:           Math.round(s.prosocialBehavioralIndex ?? 0),
    });
    if (s.empathyHistory.length > 50) s.empathyHistory.shift();

    // Paradigm shift detection (separate gov + econ channels)
    this._detectParadigmShift(civ);
  }

  _detectParadigmShift(civ) {
    if (!civ.state) return;
    const s = civ.state;
    const currentTurn = this.game?.turnCount ?? 0;

    // ── Governance channel ─────────────────────────────────────
    const curGov = civ.governance?.modelId ?? null;
    const curHL  = civ.governance?.hierarchyLevel ?? 50;
    const prevGov = s._prevGovModel;
    const prevHL  = s._prevHierarchyLevel ?? 50;
    const govChanged      = curGov && prevGov && curGov !== prevGov;
    const hierarchyJumped = Math.abs(curHL - prevHL) > 15;

    if (govChanged || hierarchyJumped) {
      s._govShiftTurn      = currentTurn;
      s._govShiftAge       = 1;
      s._govShiftDirection = curHL < prevHL ? 'flattening' : 'steepening';
      s._govShiftBaseline  = {
        empathyByStratum:    {...(s.empathyByStratum || {})},
        hierarchyLevelFrom:  prevHL,
        hierarchyLevelTo:    curHL,
        govModelFrom:        prevGov,
        govModelTo:          curGov,
        hierarchyEntrenched: s.hierarchyEntrenched ?? 0,
      };
      if (!Array.isArray(s._shiftLog)) s._shiftLog = [];
      s._shiftLog.unshift({ type:'gov', turn:currentTurn, from:prevGov, to:curGov,
        hierarchyFrom:prevHL, hierarchyTo:curHL, direction:s._govShiftDirection });
      if (s._shiftLog.length > 5) s._shiftLog.length = 5;
    } else if ((s._govShiftAge ?? 0) > 0) {
      s._govShiftAge++;
      if (s._govShiftAge > 60) { s._govShiftAge = 0; s._govShiftBaseline = null; }
    }

    // ── Economic channel ──────────────────────────────────────
    const curEcon  = civ.governance?.economicModelId ?? s.economicModel ?? null;
    const prevEcon = s._prevEconModel;
    const econChanged = curEcon && prevEcon && curEcon !== prevEcon;
    const ECON_RANK = { gift:5, commons:4, mixed:3, hierarchical:2, market:1 };

    if (econChanged) {
      const prevRank = ECON_RANK[prevEcon] ?? 3;
      const newRank  = ECON_RANK[curEcon]  ?? 3;
      s._econShiftTurn      = currentTurn;
      s._econShiftAge       = 1;
      s._econShiftDirection = newRank > prevRank ? 'cooperative' : 'competitive';
      s._econShiftBaseline  = {
        brCoopScore:   s.brCoopScore ?? 50,
        PBI:           s.prosocialBehavioralIndex ?? 50,
        econModelFrom: prevEcon,
        econModelTo:   curEcon,
        cooperation:   civ.state.behaviorReinforcement?.cooperation ?? 50,
        competition:   civ.state.behaviorReinforcement?.competition ?? 50,
      };
      if (!Array.isArray(s._shiftLog)) s._shiftLog = [];
      s._shiftLog.unshift({ type:'econ', turn:currentTurn, from:prevEcon, to:curEcon,
        direction:s._econShiftDirection });
      if (s._shiftLog.length > 5) s._shiftLog.length = 5;
    } else if ((s._econShiftAge ?? 0) > 0) {
      s._econShiftAge++;
      if (s._econShiftAge > 60) { s._econShiftAge = 0; s._econShiftBaseline = null; }
    }

    // Always update prev values
    s._prevGovModel       = curGov;
    s._prevHierarchyLevel = curHL;
    s._prevEconModel      = curEcon;
  }

  _generateEmpathyNarrative(civ) {
    if (!civ?.state) return '';
    const s = civ.state;
    const empathy = s.empathyLevel ?? 50;
    const br      = s.brCoopScore ?? 50;
    const PBI     = s.prosocialBehavioralIndex ?? 50;
    const norm    = s.culturalEmpathyNorm ?? 65;
    const disFranchGap = ((s.empathyByStratum?.disenfranchised ?? 80) - (s.prosocialByStratum?.disenfranchised ?? 55));
    const govShiftActive = (s._govShiftAge ?? 0) > 0;
    const econShiftActive = (s._econShiftAge ?? 0) > 0;
    const plutocratic = !(s.govContributes ?? true);
    const parts = [];

    // Quadrant characterisation
    if (empathy >= 65 && br >= 65) {
      parts.push('Prosocial capacity is being realized — both empathy and cooperative behavioral reinforcement are aligned, producing the highest-PBI conditions.');
    } else if (empathy >= 65 && br < 50) {
      parts.push('High empathy capacity is being underutilized — competitive behavioral reinforcement is suppressing its expression. The civilization has the psychological resources for cooperation but lacks cultural permission to act on them.');
    } else if (empathy < 50 && br >= 65) {
      parts.push('Cooperative behavioral norms are in place but rest on compliance rather than genuine empathy. This is a fragile equilibrium — cooperative behavior may collapse under sustained stress.');
    } else {
      parts.push('Both empathy capacity and behavioral reinforcement point toward competitive and extractive dynamics. Minimal internal constraints on harmful behavior exist at any level of the hierarchy.');
    }

    // Plutocratic subsumption warning
    if (plutocratic) {
      parts.push(`Nominal governance structure is functionally superseded by wealth-power concentration — economic power hierarchy (${Math.round(s.economicPowerHierarchy ?? 0)}) exceeds governance hierarchy, producing plutocratic suppression of empathy even in a formally flat governance system.`);
    }

    // Disenfranchised gap
    if (disFranchGap > 20) {
      parts.push(`The disenfranchised stratum retains relatively high empathy (${Math.round(s.empathyByStratum?.disenfranchised ?? 80)}) but structural conditions — resource scarcity, high opportunity competition — reduce practical prosocial behavior to ${Math.round(s.prosocialByStratum?.disenfranchised ?? 55)}. The gap reflects constrained mutual aid, not a deficit of care.`);
    }

    // Active paradigm shifts
    if (govShiftActive && econShiftActive) {
      const govDir  = s._govShiftDirection === 'flattening' ? 'flattening' : 'steepening';
      const econDir = s._econShiftDirection;
      if (govDir === 'flattening' && econDir === 'cooperative') {
        parts.push('Both governance flattening and economic cooperative shift are active — a reinforcing combination. Focus on mutual aid infrastructure for lower strata to translate recovering empathy into visible prosocial outcomes.');
      } else if (govDir === 'flattening' && econDir === 'competitive') {
        parts.push('Governance has flattened but economic reinforcement remains competitive — progress stalls on the behavioral axis. Economic reform is now the highest-leverage remaining action.');
      } else if (govDir === 'steepening' && econDir === 'cooperative') {
        parts.push('Cooperative economic reinforcement is improving but hierarchy steepening is suppressing empathy recovery — a conflicted dynamic that risks offsetting the economic gains.');
      } else {
        parts.push('Both governance and economic shifts are compounding negatively. Stabilization is the priority; identify which shift can be reversed first.');
      }
    } else if (govShiftActive) {
      const dir = s._govShiftDirection === 'flattening' ? 'is recovering (governance flattening)' : 'is suppressing further (hierarchy steepening)';
      parts.push(`Governance paradigm shift active — empathy cascade ${dir}. Cultural norm will lag structural change significantly.`);
      if ((s.hierarchyEntrenched ?? 0) > 60) {
        parts.push('High cohort entrenchment is slowing elite empathy recovery despite structural change. New institutional pathways that bypass entrenched leadership cohorts would accelerate recovery.');
      }
    } else if (econShiftActive) {
      const dir = s._econShiftDirection === 'cooperative' ? 'improving on both behavioral and empathy axes' : 'degrading behavioral reinforcement and increasing wealth-power';
      parts.push(`Economic paradigm shift active — ${dir}. Behavioral reinforcement adapts faster than cultural norm.`);
    }

    // Cultural norm lag note
    if (!govShiftActive && !econShiftActive && norm < 45) {
      parts.push('Low-empathy cultural norms are entrenched — structural changes would require extended time to produce norm realignment. The norm changes 2–3× slower than actual behavior.');
    }

    return parts.join(' ');
  }

  // ── Public Works: apply finished effects (extracted helper) ───
  _applyWorksEffects(civ, fx) {
    if (!civ.state || !fx) return;
    const b = civ.state.behaviorReinforcement;
    if (fx.wellbeingDelta)   civ.state.averageWellbeing = Utils.clamp(civ.state.averageWellbeing + fx.wellbeingDelta,   0, 100);
    if (fx.stabilityDelta)   civ.state.stabilityIndex   = Utils.clamp(civ.state.stabilityIndex   + fx.stabilityDelta,   0, 100);
    if (fx.innovationBoost)  b.innovation  = Utils.clamp((b.innovation  || 50) + fx.innovationBoost,  0, 100);
    if (fx.cooperationBoost) b.cooperation = Utils.clamp((b.cooperation || 50) + fx.cooperationBoost, 0, 100);
    if (fx.fertilityDelta && civ.state.resourceAbundance !== undefined) {
      civ.state.resourceAbundance = Utils.clamp(civ.state.resourceAbundance + fx.fertilityDelta, 0, 100);
    }
  }

  // ── Public Works: tick active construction projects each turn ──
  _progressConstruction(civ) {
    if (!civ.state?.constructionProjects?.length) return;

    const completed = [];
    for (const project of civ.state.constructionProjects) {
      project.turnsRemaining--;
      // ~3% chance of a construction setback (only if not already finishing this turn)
      if (project.turnsRemaining > 0 && Utils.random() < 0.03) {
        project.turnsRemaining++;
        this.game.ui?.showNotification(`⚠️ ${civ.name}: setback on ${project.icon || '🏗️'} ${project.label} — delayed 1 turn.`);
        civ.addHistoryEntry(
          this.game.currentYear,
          `${project.icon || '🏗️'} ${project.label} — Construction Setback`,
          `Work on the ${project.label} in ${civ.name} has been delayed by one turn due to a logistical or material setback. ${project.turnsRemaining} turn${project.turnsRemaining === 1 ? '' : 's'} remaining.`,
          project.workId
        );
      }
      if (project.turnsRemaining <= 0) completed.push(project);
    }

    for (const project of completed) {
      // Remove from active list
      civ.state.constructionProjects = civ.state.constructionProjects.filter(p => p.workId !== project.workId);

      // Apply stat effects now that construction is done
      this._applyWorksEffects(civ, project.effects);

      // Build completion narrative based on governance/economy context
      const econId = civ.economic?.modelId || 'market';
      const govId  = civ.governance?.modelId || 'representative';
      const isGift = econId === 'gift' || econId === 'commons';
      const govNote = govId === 'autocratic'
        ? ` The project was driven through by centralized authority; debate over its merits was limited.`
        : govId === 'direct_congress'
          ? ` Citizens were directly involved in commissioning and overseeing the work from start to finish.`
          : ` The project passed through the normal institutional process and received broad support.`;
      const econNote = isGift
        ? ` Workers contributed under the communal resource system.`
        : econId === 'market' || econId === 'commodity'
          ? ` The construction contract was awarded through competitive tender, drawing some political debate.`
          : '';

      const fx = project.effects;
      const effectParts = [];
      if (fx.wellbeingDelta)   effectParts.push(`wellbeing +${fx.wellbeingDelta}`);
      if (fx.stabilityDelta)   effectParts.push(`stability +${fx.stabilityDelta}`);
      if (fx.innovationBoost)  effectParts.push(`innovation +${fx.innovationBoost}`);
      if (fx.cooperationBoost) effectParts.push(`cooperation +${fx.cooperationBoost}`);
      if (fx.fertilityDelta)   effectParts.push(`agricultural capacity +${fx.fertilityDelta}`);
      const effectSummary = effectParts.length
        ? ` Measured outcomes: ${effectParts.join('; ')}.`
        : '';

      const desc = `After ${project.turnsTotal} turns of construction, the ${project.label} in ${civ.name} is now operational.${govNote}${econNote}${effectSummary}`;

      civ.addHistoryEntry(
        this.game.currentYear,
        `${project.icon} ${project.label} — Complete`,
        desc,
        project.workId
      );

      this.game.ui?.showNotification(`✅ ${civ.name}: ${project.label} is complete!`);
    }
  }

  // ── Generate Rich Effect Narrative for History ────────────────
  _generateEventEffectNarrative(event, civ) {
    const econId    = civ.economic    ? civ.economic.modelId    : 'market';
    const govId     = civ.governance  ? civ.governance.modelId  : 'representative';
    const coop      = civ.state ? Math.round(civ.state.behaviorReinforcement.cooperation || 50) : 50;
    const wellbeing = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
    const equality  = civ.state ? Math.round(civ.state.equalityIndex)    : 50;
    const isGift    = econId === 'gift' || econId === 'commons';

    // ── Disaster ────────────────────────────────────────────────
    if (event.type === 'disaster') {
      const fertCost = Math.abs(event.fertilityCost || 0);
      const popRisk  = event.populationRisk || 0;
      const duration = event.duration || 1;

      const fertDesc = fertCost > 0
        ? ` Agricultural fertility ${fertCost > 50 ? 'was severely damaged' : 'declined substantially'}, affecting harvests for ${duration > 1 ? `approximately ${duration} seasons` : 'a season'}.`
        : '';
      const popDesc = popRisk > 0
        ? ` Estimated mortality risk: ~${Math.round(popRisk * 100)}% of the exposed population.`
        : '';

      let responseText;
      if (coop > 65 || isGift) {
        responseText = wellbeing > 55
          ? `${civ.name}'s cooperative culture enabled rapid community mobilization — shared resources and mutual support cushioned the worst effects.`
          : `Despite the cooperative character of this society, the civilization's stretched resources limited the mutual support that might otherwise have buffered the impact.`;
      } else if (coop < 35) {
        responseText = `The fragmented social response left individuals and households to face the crisis largely alone. Those at the margins suffered most.`;
      } else if (govId === 'autocratic' || govId === 'oligarchy') {
        responseText = equality < 45
          ? `Centralized resources were marshaled, but distribution followed existing hierarchies — those at the top were protected first; hardship fell disproportionately on ordinary people.`
          : `Leadership deployed centralized resources to manage the crisis, achieving a reasonably organized response.`;
      } else {
        responseText = `The civilization mobilized its available resources to respond, though losses were significant.`;
      }

      return `${event.description}${fertDesc}${popDesc} ${responseText}`;
    }

    // ── Technology ──────────────────────────────────────────────
    if (event.type === 'technology') {
      const techData = this._findTechByName(event.techName);
      if (!techData || !techData.effect) return event.description;
      const fx = techData.effect;
      const parts = [];

      if (fx.populationGrowth) {
        parts.push(`Health outcomes improved, driving population growth of approximately ${fx.populationGrowth}% over subsequent generations.`);
      }
      if (fx.fertility) {
        parts.push(`Agricultural productivity rose by roughly ${fx.fertility}%, allowing more land to be cultivated and strengthening food security.`);
      }
      if (fx.innovation) {
        parts.push(`The spread of new knowledge raised the innovation index, inspiring further discovery and adaptation.`);
      }
      if (fx.production) {
        parts.push(`Productive capacity rose by an estimated ${fx.production}%, generating material surplus.`);
      }
      if (fx.warmingContrib) {
        parts.push(fx.warmingContrib > 0
          ? `The technology contributes to atmospheric warming — a long-term cost not yet visible in daily life.`
          : `The technology reduced the civilization's environmental footprint, slowing warming accumulation.`);
      }
      if (fx.cooperation) {
        parts.push(`Shared adoption of the technology reinforced social cooperation.`);
      }
      if (fx.conformity !== undefined) {
        parts.push(fx.conformity < 0
          ? `Access to new ideas loosened conformity pressures, as knowledge circulated more freely.`
          : `Standardized practices tended to reinforce conformity across the population.`);
      }

      const adoptNote = isGift
        ? ` Benefits were distributed broadly in keeping with this society's values.`
        : econId === 'market' || econId === 'commodity'
          ? ` Adoption followed market dynamics — those with capital gained first-mover advantages.`
          : '';

      return `${civ.name} adopted ${event.techName}.${adoptNote} ${parts.join(' ')}`.trim();
    }

    // ── Movement / Philosophy ───────────────────────────────────
    if (event.type === 'movement') {
      const mods    = event.behaviorModifiers || {};
      const entries = Object.entries(mods);
      if (entries.length === 0) return event.description;

      const rising  = entries.filter(([, v]) => v > 0).map(([k, v]) => `${k} (+${v})`);
      const falling = entries.filter(([, v]) => v < 0).map(([k])    => k);
      const effectParts = [];
      if (rising.length > 0)  effectParts.push(rising.join(', ') + ' rose');
      if (falling.length > 0) effectParts.push(falling.join(' and ') + ' declined');

      const topKey = entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0]?.[0] || '';
      let reception = '';
      if (topKey === 'cooperation' && coop < 35) {
        reception = ` The movement faces resistance in a society where individualism is strongly entrenched.`;
      } else if (topKey === 'deference' && coop > 65) {
        reception = ` The movement faces headwinds where collective agency is already valued.`;
      } else if (wellbeing < 40) {
        reception = ` In a society under strain, calls for change find ready listeners.`;
      } else if (wellbeing > 65) {
        reception = ` In relatively stable conditions, the movement's spread will depend on whether it resonates with existing values.`;
      }

      return `${event.name || 'A new movement'} took hold in ${civ.name}. As it spread: ${effectParts.join('; ')}.${reception}`;
    }

    // ── Resource Discovery ──────────────────────────────────────
    if (event.type === 'resource') {
      const fertDesc = (event.fertilityBonus || 0) > 0
        ? ` Fertility in the area increased by approximately ${event.fertilityBonus * 10}%, expanding productive capacity.`
        : '';
      const econNote = econId === 'market' || econId === 'commodity'
        ? ` Control of the new resource is likely to become a focus of competition and accumulation.`
        : isGift
          ? ` In keeping with this society's values, the resource is expected to be managed as a shared community asset.`
          : '';
      return `${event.resourceName || 'A new resource'} was discovered within ${civ.name}'s territory.${fertDesc}${econNote}`;
    }

    // ── New Religion ────────────────────────────────────────────
    if (event.type === 'new_religion') {
      const cfg = event.religionConfig || {};
      const tolText = cfg.toleranceLevel === 'exclusive'
        ? ` It claims sole religious truth and may compete aggressively with existing faiths.`
        : cfg.toleranceLevel === 'indifferent'
          ? ` It coexists with other beliefs without active conflict.`
          : ` It takes an actively tolerant stance toward other traditions.`;
      return `A new faith — ${cfg.name || 'unnamed'} — emerged in ${civ.name}. ${cfg.description || ''}${tolText} Whether it spreads depends on the openness of existing social and religious structures.`;
    }

    // ── Alien Response Protocols ─────────────────────────────────
    if (event.type === 'alien_response') {
      const govNote = govId === 'direct_congress'
        ? ` The decision was reached through the people's congresses — an unprecedented application of direct democracy to a question of civilizational scale.`
        : govId === 'autocratic'
          ? ` The decision was made unilaterally by the governing authority, without public consultation.`
          : govId === 'representative'
            ? ` The decision passed through legislative bodies, though the speed of the process left many questioning whether adequate deliberation occurred.`
            : '';
      const protocolNote = {
        alien_response_open:       `Innovation has surged as open access to contact data energizes scientific communities. Social cohesion has been disrupted as the public processes implications without a shared framework. Cooperation has strengthened — the shared unknown is drawing people together as much as it unsettles them.`,
        alien_response_study:      `The innovation index has risen sharply as research institutions redirect capacity toward contact analysis. Stability has been largely maintained by containing public access to raw data. The scientific community is working faster than it ever has.`,
        alien_response_quarantine: `Stability has improved in the short term as controlled information limits public panic. However, cooperation is eroding as people sense they're not being told the full picture. Wellbeing has declined among those who distrust the official silence.`,
        alien_response_military:   `Stability has marginally improved as clear threat framing provides institutional certainty. Wellbeing has declined significantly — living under a military posture toward an unknown and potentially vast intelligence is deeply unsettling. Cooperation is being sacrificed to command clarity.`,
        alien_response_diplomatic: `Wellbeing has improved modestly — the diplomatic framing offers the most interpretable narrative about why humanity is responding thoughtfully rather than reactively. Cooperation and innovation have both grown as resources flow toward communication design.`,
      }[event.protocol] || event.description;
      return `${event.description}${govNote} ${protocolNote}`;
    }

    // ── Alien Contact ────────────────────────────────────────────
    if (event.type === 'alien_signal') {
      const econNote = isGift
        ? ` The discovery is being treated as a shared civilizational concern rather than the property of any institution.`
        : econId === 'market'
          ? ` Competing interests are already forming around who controls the information and what authority governs any response.`
          : '';
      return `${event.description}${econNote} Innovation has spiked as resources are redirected toward understanding the signal.`;
    }
    if (event.type === 'alien_contact') {
      const govNote = govId === 'autocratic'
        ? ` The governing authority has assumed direct control of all contact protocols, restricting independent scientific inquiry.`
        : govId === 'direct_congress'
          ? ` The question of how to respond has been brought directly to the people's congresses — an unprecedented use of direct democracy for a decision of this scale.`
          : govId === 'representative'
            ? ` Elected bodies are struggling to provide meaningful oversight of a situation that moves faster than legislative processes are designed to handle.`
            : '';
      return `${event.description}${govNote}`;
    }

    // ── New Horizons ─────────────────────────────────────────────
    if (event.type === 'new_horizons') {
      const effects = event.effects || {};
      const effectParts = [];
      if (effects.innovationBoost) effectParts.push(`innovation rose by ${effects.innovationBoost} points`);
      if (effects.wellbeingBoost)  effectParts.push(`average wellbeing improved by ${effects.wellbeingBoost} points`);
      if (effects.fertilityBoost)  effectParts.push(`agricultural fertility in affected regions increased`);
      if (effects.populationBoost) effectParts.push(`population grew by approximately ${effects.populationBoost}%`);
      const effectSummary = effectParts.length > 0 ? ` As a result: ${effectParts.join('; ')}.` : '';

      const econNote = econId === 'market' || econId === 'commodity'
        ? ` The opportunity is likely to attract private investment and competitive pressure for control.`
        : isGift
          ? ` In keeping with this civilization's values, access is expected to be managed as a shared community resource.`
          : '';

      return `${event.description}${effectSummary}${econNote}`;
    }

    // ── Extinction-Level Events ──────────────────────────────────
    if (event.type === 'extinction' || (event.historyType && event.historyType.startsWith('extinction_'))) {
      const typeId = event.historyType || event.type;
      const techLvl = civ.techLevel || 1;
      const survivors = civ.state ? Math.round(civ.state.averageWellbeing) : 20;

      // Severity of survival outcome
      const survivalNote = survivors < 15
        ? ` Civilization endures in barely recognizable form. The few survivors are scattered, without organization or supply.`
        : survivors < 25
          ? ` Civilization endures, but in severely reduced form. Survivors are organizing from near-nothing.`
          : survivors < 40
            ? ` The civilization survives in fragmented form. Recovery will take generations.`
            : ` The civilization has been badly damaged but retains enough cohesion to begin recovery.`;

      // Tech-level note — each event type has its own survivability dynamic.
      const isPlagueEvent  = typeId === 'extinction_plague';
      const isIceAgeEvent  = typeId === 'extinction_ice_age';
      let techSurvivalNote;
      if (isPlagueEvent) {
        techSurvivalNote = techLvl <= 2
          ? ` Limited movement patterns and the isolation of small bands contained the outbreak from spreading across the full civilisation. Particular communities may have been devastated, but the pathogen's reach was bounded by geography and the near-absence of long-distance travel.`
          : techLvl <= 5
            ? ` The same trade routes and networks that built this civilisation carried the pathogen to every corner of it. With no understanding of contagion, no medical countermeasures, and no coordinated public health response, the disease spread unchecked through markets, caravans, and ports. Historical analogues — the Black Death, the Plague of Justinian, the Antonine Plague — suggest this era is the most vulnerable to civilisation-scale pandemic devastation.`
            : techLvl <= 8
              ? ` Rail lines, steamships, and the mass movement of people in an industrial age carried the contagion far and fast before its severity was understood. Medical knowledge is advancing but public health infrastructure is uneven — the gaps are exposed sharply under pandemic pressure. Analogues include the 1918 Spanish Flu, which killed more people than the preceding world war.`
              : ` Air travel carried the pathogen globally within days of its emergence — containment at origin was never realistic. But this civilisation's medical infrastructure, vaccine development capacity, and international health coordination provided countermeasures at a scale no earlier era could marshal. The outcome reflects a race between exponential spread and organised scientific response.`;
      } else if (isIceAgeEvent) {
        techSurvivalNote = techLvl <= 2
          ? ` Mobile hunter-gatherer bands are historically the most resilient in the face of glacial advance — this civilization's people already know how to follow game southward, adapt to shifting terrain, and live without fixed infrastructure. Their ancestors survived the last glacial period by doing exactly this.`
          : techLvl <= 5
            ? ` Settled agricultural communities are among the most vulnerable to rapid cooling — their fields are fixed, their harvests calendar-dependent, and the knowledge needed to live nomadically has been largely forgotten over generations of settlement. Displacement is near-certain; reconstituting mobile lifeways will be painful.`
            : techLvl <= 8
              ? ` Industrial technology — fuel heating, food storage and preservation, rail-based resupply — provides meaningful buffers against a cooling climate that earlier eras lacked. But the displacement of populations from northern regions will test infrastructure and social cohesion at scale.`
              : ` Modern technology offers significant insulation from climatic extremes — greenhouse agriculture, advanced heating, global food logistics — but the sustained energy demands of warming an increasingly cold world will strain resources, and the displacement of coastal and northern populations will require massive coordinated response.`;
      } else {
        techSurvivalNote = techLvl <= 2
          ? ` This civilization's reliance on directly practiced skills — hunting, gathering, shelter-building — gives survivors a meaningful foundation. They need no rediscovery; they are already living as the situation demands.`
          : techLvl <= 5
            ? ` Survivors retain enough practical knowledge of agriculture and basic craft to begin rebuilding, though the loss of settled infrastructure will make recovery slow and uncertain.`
            : techLvl <= 8
              ? ` Survivors find themselves dependent on systems that no longer exist — supply chains, energy infrastructure, centralized food distribution. Few possess the practical skills to provide for themselves without them. Recovery requires a painful relearning of knowledge long since delegated to institutions.`
              : ` The civilization's near-total dependence on complex interlocking systems — global supply chains, digital infrastructure, industrial agriculture — has left most survivors without the knowledge or tools to sustain basic life. The coming generations face an extreme challenge: rediscovering how to live directly from the land, without the accumulated institutional knowledge that was lost.`;
      }

      const govNote = govId === 'direct_congress'
        ? ` The people's congresses have been suspended — survival takes priority over deliberation.`
        : govId === 'autocratic'
          ? ` The governing authority has invoked emergency powers, concentrating control to manage the crisis.`
          : govId === 'representative'
            ? ` Normal legislative function has been suspended. Emergency government is coordinating the response.`
            : '';
      const econNote = econId === 'market' || econId === 'commodity'
        ? ` Market functions have effectively collapsed. Barter and mutual aid have re-emerged as primary exchange mechanisms.`
        : isGift
          ? ` The gift economy has proven more resilient than most — mutual aid networks are the backbone of early recovery.`
          : '';
      return `${event.description}${govNote}${econNote}${survivalNote}${techSurvivalNote}`;
    }

    // ── Public Works ─────────────────────────────────────────────
    if (event.type === 'public_works' || (event.historyType && event.historyType.startsWith('works_'))) {
      // Phase 2: this narrative fires when construction STARTS, not when it completes
      const BUILD_TIMES = {
        works_granary: 3, works_irrigation: 4, works_aqueduct: 5,
        works_roads: 4,   works_library: 5,    works_hospital: 6,
        works_energy: 6,  works_space: 8,
      };
      const workId = event.workId || event.historyType;
      const buildTurns = event.buildTurns || BUILD_TIMES[workId] || 4;
      const govNote = govId === 'direct_congress'
        ? ` The project was approved through direct popular vote; the citizenry will oversee construction.`
        : govId === 'autocratic'
          ? ` The order was issued by the governing authority. Labor will be organized centrally.`
          : govId === 'representative'
            ? ` The project received legislative approval and broad institutional support.`
            : '';
      const econNote = isGift
        ? ` Workers will be compensated through the communal resource system.`
        : econId === 'market' || econId === 'commodity'
          ? ` Construction has been contracted to private builders, sparking some public debate.`
          : '';
      return `${event.description} Construction is now underway and will take approximately ${buildTurns} turns to complete.${govNote}${econNote}`;
    }

    // ── Custom Event ────────────────────────────────────────────
    if (event.type === 'custom') {
      const effects = [];
      if (event.wellbeingChange)  effects.push(`wellbeing ${event.wellbeingChange > 0 ? '+' : ''}${event.wellbeingChange}`);
      if (event.equalityChange)   effects.push(`equality ${event.equalityChange   > 0 ? '+' : ''}${event.equalityChange}`);
      if (event.populationChange) effects.push(`population ${event.populationChange > 0 ? '+' : ''}${event.populationChange}%`);
      if (event.fertilityChange && event.fertilityChange !== 0) effects.push(`fertility ${event.fertilityChange > 0 ? '+' : ''}${event.fertilityChange}`);
      if (event.behaviorModifiers) {
        for (const [k, v] of Object.entries(event.behaviorModifiers)) {
          effects.push(`${k} ${v > 0 ? '+' : ''}${v}`);
        }
      }
      const effectSummary = effects.length > 0 ? ` Effects applied: ${effects.join(', ')}.` : '';
      return `${event.description || event.label}${effectSummary}`;
    }

    return event.description || event.label || '';
  }

  _findTechByName(name) {
    for (const cat of Object.values(TECH_CATEGORIES)) {
      for (const tech of cat.advances) {
        if (tech.name === name) return tech;
      }
    }
    return null;
  }

  _introduceResource(civ, event) {
    // Mark tiles near civ territory as having a new resource
    const tiles = this.game.map.getTilesForCiv(civ.id);
    const eligibleTiles = tiles.filter(t => !t.resource && t.terrain.passable);
    if (eligibleTiles.length > 0) {
      const tile = Utils.randChoice(eligibleTiles);
      tile.resource = {
        id: event.resourceId || 'unknown',
        label: event.resourceName || 'Unknown Resource',
        icon: event.resourceIcon || '💫',
        discovered: true,
      };
      tile.fertility = Math.min(12, tile.fertility + (event.fertilityBonus || 0));
    }
  }

  // ── War System ────────────────────────────────────────────────

  _checkWarDeclarations(currentYear) {
    // War requires at least ancient-era technology (techLevel >= 2)
    const era = Utils.getEra(currentYear);
    if (era.techLevel < 2) return;

    const civs = this.game.civilizations;
    for (let i = 0; i < civs.length; i++) {
      for (let j = i + 1; j < civs.length; j++) {
        const c1 = civs[i], c2 = civs[j];
        const rel1 = c1.relations.get(c2.id);
        if (!rel1 || rel1.war) continue; // already at war
        this._maybeDeclareWar(c1, c2, currentYear);
      }
    }
  }

  _maybeDeclareWar(c1, c2, currentYear) {
    // ══════════════════════════════════════════════════════════════════════
    // DEMOCRATIC PEACE THEORY — Kantian Tripod (Russett & Oneal 2001)
    // + Fearon Bargaining Model (Fearon 1995)
    //
    // War probability = baseProbability × democraticPeace × tradeInterdependence
    //                   × institutionalQuality × powerBalance
    //
    // Kantian tripod: democracy + trade + institutions → peace
    // Fearon: wars from incomplete info, commitment problems, indivisible stakes
    // ══════════════════════════════════════════════════════════════════════
    const rel1 = c1.relations.get(c2.id);
    const rel2 = c2.relations.get(c1.id);
    if (!rel1 || !rel2) return;

    // World federation members do not go to war
    if (c1.governance?.modelId === 'world_federation' || c2.governance?.modelId === 'world_federation') return;

    // Failed states cannot DECLARE war (no governing authority to do so)
    // But failed states CAN BE INVADED by other civs — this is realistic:
    // US invaded Afghanistan (2001), NATO intervened in Libya (2011),
    // Ethiopia invaded Somalia (2006), multiple interventions in DRC.
    // If BOTH are failed states, no war (no one can organize an attack).
    const c1Failed = c1.governance?.modelId === 'failed_state';
    const c2Failed = c2.governance?.modelId === 'failed_state';
    if (c1Failed && c2Failed) return; // two failed states can't fight organized war
    if (c1Failed) {
      // c1 is failed — only c2 can attack c1 (intervention/invasion)
      // c1 cannot declare war on anyone
    } else if (c2Failed) {
      // c2 is failed — only c1 can attack c2
    }
    // If one side is failed, the non-failed side may still attack (handled below)

    // Active treaties suppress war declaration
    if (rel1.treaty?.type === 'non_aggression' || rel1.treaty?.type === 'alliance' ||
        rel2.treaty?.type === 'non_aggression' || rel2.treaty?.type === 'alliance') return;

    const attitude = (rel1.attitude + rel2.attitude) / 2;

    // Runtime expansionism: check both founding config AND behavioral drift
    // Movements, coups, and economic pressures can make civs expansionist
    const c1Exp = c1.operatingPrinciples.outsiderRelationship === 'expansionist'
      || (c1.state?.behaviorReinforcement?.acquisitiveness ?? 50) > 70;
    const c2Exp = c2.operatingPrinciples.outsiderRelationship === 'expansionist'
      || (c2.state?.behaviorReinforcement?.acquisitiveness ?? 50) > 70;

    // Food security (0-100 scale) — was incorrectly using resourceStores.food
    const c1Food = c1.state.foodSecurity ?? 60;
    const c2Food = c2.state.foodSecurity ?? 60;

    const c1Aggressive = c1.religionManager?.religions?.some(r =>
      r.propagationStyle === 'coercive' || r.propagationStyle === 'aggressive');
    const c2Aggressive = c2.religionManager?.religions?.some(r =>
      r.propagationStyle === 'coercive' || r.propagationStyle === 'aggressive');

    // Internal instability — diversionary war theory (Levy & Vakili 1992)
    const c1Unstable = (c1.state.stability ?? 50) < 25;
    const c2Unstable = (c2.state.stability ?? 50) < 25;

    // ── 1. BASE WAR PROBABILITY ────────────────────────────────
    let chance = 0;
    let attacker = null, defender = null, reason = '';

    // Failed state intervention: strong neighbors may invade a failed state
    // for resources, strategic position, or "humanitarian intervention"
    // Historical: US→Afghanistan 2001, NATO→Libya 2011, Ethiopia→Somalia 2006,
    // Vietnam→Cambodia 1978, Tanzania→Uganda 1979
    if (c1Failed || c2Failed) {
      const failedCiv = c1Failed ? c1 : c2;
      const strongCiv = c1Failed ? c2 : c1;
      // Strong civ must have functioning governance and military
      const strongMil = strongCiv.state?.militaryPower ?? 0;
      const strongCap = strongCiv.state?.stateCapacity ?? 0;
      if (strongMil > 30 && strongCap > 30) {
        // Intervention probability: based on resources, strategic value, hostility
        const interventionProb = 0.03 + (attitude < -20 ? 0.04 : 0)
          + ((strongCiv.operatingPrinciples?.outsiderRelationship === 'expansionist') ? 0.05 : 0);
        chance = interventionProb;
        attacker = strongCiv;
        defender = failedCiv;
        reason = 'intervention in failed state';
      }
      // If conditions not met, no war possible
      if (!attacker) return;
    } else if (attitude < -70) {
      // Prolonged deep hostility → high war probability
      chance = 0.22;
      attacker = c1Exp ? c1 : c2Exp ? c2 : (Utils.random() < 0.5 ? c1 : c2);
      defender = attacker === c1 ? c2 : c1;
      reason = 'prolonged hostility';
    } else if (attitude < -45 && (c1Exp || c2Exp)) {
      // Expansionist power with hostile relations (lowered from -50)
      chance = 0.14;
      attacker = c1Exp ? c1 : c2;
      defender = attacker === c1 ? c2 : c1;
      reason = 'territorial ambition';
    } else if ((c1Food < 40 || c2Food < 40) && attitude < -15) {
      // Food crisis: desperate states fight over resources
      // Threshold lowered — food crises historically trigger wars at lower hostility
      chance = 0.12;
      attacker = c1Food < c2Food ? c1 : c2;
      defender = attacker === c1 ? c2 : c1;
      reason = 'resource scarcity';
    } else if (attitude < -10) {
      // Water scarcity wars: when water drops below critical threshold, states
      // fight for control of rivers, aquifers, watersheds.
      // Historical: Nile disputes (Egypt-Ethiopia), Jordan River conflicts,
      // Aral Sea crisis, Indus Waters tension (India-Pakistan).
      // Peter Gleick (2014): "water is increasingly a source of conflict."
      const c1Water = c1.state.resourceDepletion?.water ?? 100;
      const c2Water = c2.state.resourceDepletion?.water ?? 100;
      if (c1Water < 30 || c2Water < 30) {
        chance = 0.08;
        attacker = c1Water < c2Water ? c1 : c2;
        defender = attacker === c1 ? c2 : c1;
        reason = 'water scarcity';
      }
    } else if ((c1Aggressive || c2Aggressive) && attitude < -30) {
      // Religious aggression (slightly lowered threshold)
      chance = 0.10;
      attacker = c1Aggressive ? c1 : c2;
      defender = attacker === c1 ? c2 : c1;
      reason = 'religious conflict';
    } else if ((c1Unstable || c2Unstable) && attitude < -20) {
      // Diversionary war: unstable regime attacks neighbor to rally support
      chance = 0.08;
      attacker = c1Unstable ? c1 : c2;
      defender = attacker === c1 ? c2 : c1;
      reason = 'diversionary aggression';
    } else if (attitude < -35) {
      // General border friction — low-probability catch-all
      // Even without specific triggers, sustained hostility can boil over
      chance = 0.04;
      attacker = Utils.random() < 0.5 ? c1 : c2;
      defender = attacker === c1 ? c2 : c1;
      reason = 'border conflict';
    }

    // ── 2. Power transition trigger (Organski 1958) ──────────────
    // Rising power challenging established power → war risk
    if (!attacker) {
      const c1Mil = c1.state.militaryPower ?? 30;
      const c2Mil = c2.state.militaryPower ?? 30;
      const ratio = Math.max(c1Mil, c2Mil) / (Math.min(c1Mil, c2Mil) || 1);
      // Near parity (ratio < 1.8) + hostile attitude → power transition war
      if (ratio < 1.8 && attitude < -30) {
        chance = 0.07;
        attacker = c1Mil > c2Mil ? c1 : c2;
        defender = attacker === c1 ? c2 : c1;
        reason = 'power transition';
      }
    }

    if (!attacker || chance <= 0) return;

    // ── 3. KANTIAN TRIPOD MULTIPLIERS ────────────────────────────

    // Leg 1: Democratic Peace (Russett & Oneal 2001)
    // Democracy-democracy dyads: ~80-90% lower war probability
    // Measured by weakest-link (most autocratic member of dyad)
    const DEMOCRATIC_GOVS = new Set(['representative', 'direct_congress', 'flat_consensus', 'rotating']);
    const AUTOCRATIC_GOVS = new Set(['autocratic', 'theocratic', 'oligarchy',
      'shadow_government_complicit', 'shadow_government_covert']);
    const c1Dem = DEMOCRATIC_GOVS.has(c1.governance?.modelId);
    const c2Dem = DEMOCRATIC_GOVS.has(c2.governance?.modelId);
    const c1Auto = AUTOCRATIC_GOVS.has(c1.governance?.modelId);
    const c2Auto = AUTOCRATIC_GOVS.has(c2.governance?.modelId);

    let democraticPeace = 1.0;
    if (c1Dem && c2Dem) {
      // Both democratic: 85% war reduction (Russett & Oneal central estimate)
      democraticPeace = 0.15;
    } else if ((c1Dem && c2Auto) || (c2Dem && c1Auto)) {
      // Mixed dyad: NOT more peaceful (Mansfield & Snyder 2005)
      // Democratizing states may actually be more war-prone
      democraticPeace = 1.1;
    } else if (c1Dem || c2Dem) {
      // One democratic, other non-autocratic: moderate peace effect
      democraticPeace = 0.6;
    }
    // Audience costs: democratic leaders face domestic costs for wars of choice
    // But also for backing down — net effect captured in the multiplier above

    // Leg 2: Trade Interdependence (Oneal & Russett 1999)
    // Bilateral trade reduces war ~20-40% per doubling
    const c1Trade = c1.state.tradeDependency ?? 20;
    const c2Trade = c2.state.tradeDependency ?? 20;
    const bilateralTrade = (rel1.trade || rel2.trade) ? Math.max(c1Trade, c2Trade) : 0;
    // Higher bilateral trade → lower war probability
    const tradeMultiplier = bilateralTrade > 60 ? 0.4 :
                            bilateralTrade > 40 ? 0.6 :
                            bilateralTrade > 20 ? 0.8 : 1.0;

    // Leg 3: Institutional Quality (Kant's "perpetual peace" through shared institutions)
    // Higher joint institutional quality → better dispute resolution
    const c1IQ = c1.state.institutionalQuality ?? 50;
    const c2IQ = c2.state.institutionalQuality ?? 50;
    const jointIQ = Math.min(c1IQ, c2IQ); // weakest link
    const iqMultiplier = jointIQ > 70 ? 0.6 :
                         jointIQ > 50 ? 0.8 : 1.0;

    // ── 4. FEARON BARGAINING MODEL (1995) ────────────────────────
    // Clear power asymmetry reduces war: the weaker side knows it would lose
    // → wider bargaining range → easier to reach settlement
    const c1Power = (c1.state.militaryPower ?? 30) + (c1.state.stateCapacity ?? 50) * 0.3;
    const c2Power = (c2.state.militaryPower ?? 30) + (c2.state.stateCapacity ?? 50) * 0.3;
    const powerRatio = Math.max(c1Power, c2Power) / (Math.min(c1Power, c2Power) || 1);
    // Power parity (ratio ~1) → highest war risk (Organski: power transition)
    // Clear asymmetry (ratio > 3) → low war risk (weaker side concedes)
    const powerMultiplier = powerRatio > 3.0 ? 0.3 :
                            powerRatio > 2.0 ? 0.5 :
                            powerRatio > 1.5 ? 0.8 : 1.0;

    // ── 5. COMBINED PROBABILITY ──────────────────────────────────
    const finalChance = chance * democraticPeace * tradeMultiplier * iqMultiplier * powerMultiplier;

    if (finalChance > 0 && Utils.random() < finalChance) {
      this._declareWar(attacker, defender, currentYear, reason);
    }
  }

  _declareWar(attacker, defender, currentYear, reason) {
    const relA = attacker.relations.get(defender.id);
    const relD = defender.relations.get(attacker.id);
    if (!relA || !relD) return;

    relA.war = relD.war = true;
    relA.trade = relD.trade = false;

    this.activeWars.push({ attacker, defender, startYear: currentYear, reason, turnsAtWar: 0 });

    // Sharp attitude drop on declaration
    relA.attitude = Utils.clamp(relA.attitude - 30, -100, -30);
    relD.attitude = Utils.clamp(relD.attitude - 30, -100, -30);

    const reasonDesc = {
      'prolonged hostility': 'years of deteriorating relations and mutual suspicion culminated in open war',
      'territorial ambition': 'an expansionist drive for new territory pushed the conflict into the open',
      'resource scarcity': 'mounting resource shortages made war appear the only path to survival',
      'religious conflict': 'irreconcilable religious differences and aggressive propagation ignited the conflict',
    }[reason] || reason;

    attacker.addHistoryEntry(currentYear,
      `War Declared against ${defender.name}`,
      `${attacker.name} has declared war on ${defender.name}. ${Utils.capitalize(reasonDesc)}. Both civilizations now commit resources to armed conflict, with all the costs that entails.`,
      'war');
    defender.addHistoryEntry(currentYear,
      `Invaded by ${attacker.name}`,
      `${attacker.name} has declared war on ${defender.name}. ${Utils.capitalize(reasonDesc)}. The civilization must now mobilize against an armed adversary while its population bears the burden of conflict.`,
      'war');

    // Player notification
    const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
    if (playerCiv === attacker)
      this.game.ui?.showNotification(`⚔️ You have declared war on ${defender.name}!`);
    else if (playerCiv === defender)
      this.game.ui?.showNotification(`⚔️ ${attacker.name} has declared war on your civilization!`);
    else
      this.game.ui?.showNotification(`⚔️ War: ${attacker.name} vs ${defender.name}`);
  }

  // ── Diplomacy ───────────────────────────────────────────────
  // TREATY_DEFS: type → { label, minAttitude, turnsRemaining (null = permanent) }
  static get TREATY_DEFS() {
    return {
      non_aggression:  { label: 'Non-Aggression Pact',  minAttitude:  5, turnsRemaining: 15 },
      trade_agreement: { label: 'Trade Agreement',       minAttitude: 35, turnsRemaining: 20 },
      alliance:        { label: 'Alliance',              minAttitude: 60, turnsRemaining: null },
    };
  }

  /**
   * Propose / accept a treaty between two civs (player-initiated or AI).
   * Returns true if successful, false with a reason string if blocked.
   */
  proposeTreaty(civ1Id, civ2Id, type) {
    const c1 = this.game.civilizations.find(c => c.id === civ1Id);
    const c2 = this.game.civilizations.find(c => c.id === civ2Id);
    if (!c1 || !c2) return { ok: false, reason: 'Civilization not found.' };

    // Ensure relation records exist
    if (!c1.relations.has(civ2Id)) c1.relations.set(civ2Id, { attitude: 40, trade: false, war: false, treaty: null, name: c2.name });
    if (!c2.relations.has(civ1Id)) c2.relations.set(civ1Id, { attitude: 40, trade: false, war: false, treaty: null, name: c1.name });

    const rel1 = c1.relations.get(civ2Id);
    const rel2 = c2.relations.get(civ1Id);
    const def = SimulationEngine.TREATY_DEFS[type];
    if (!def) return { ok: false, reason: 'Unknown treaty type.' };

    if (rel1.war || rel2.war)
      return { ok: false, reason: 'Cannot negotiate while at war.' };
    const avgAtt = (rel1.attitude + rel2.attitude) / 2;
    if (avgAtt < def.minAttitude)
      return { ok: false, reason: `Attitude too low (need ≥ ${def.minAttitude}, currently ${Math.round(avgAtt)}).` };
    if (rel1.treaty?.type === type)
      return { ok: false, reason: `A ${def.label} is already in effect.` };

    const treaty = { type, turnsRemaining: def.turnsRemaining };
    rel1.treaty = { ...treaty };
    rel2.treaty = { ...treaty };

    const yr = this.game.currentYear;
    c1.addHistoryEntry(yr, `${def.label} with ${c2.name}`,
      `${c1.name} and ${c2.name} have formalized a ${def.label}${def.turnsRemaining ? `, valid for ${def.turnsRemaining} turns` : ', a permanent compact'}.`,
      'diplomacy');
    c2.addHistoryEntry(yr, `${def.label} with ${c1.name}`,
      `${c2.name} and ${c1.name} have formalized a ${def.label}${def.turnsRemaining ? `, valid for ${def.turnsRemaining} turns` : ', a permanent compact'}.`,
      'diplomacy');

    const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
    if (playerCiv?.id === c1.id || playerCiv?.id === c2.id) {
      const other = playerCiv.id === c1.id ? c2 : c1;
      this.game.ui?.showNotification(`🤝 ${def.label} signed with ${other.name}.`);
    }
    return { ok: true };
  }

  /**
   * Break a treaty. Causes an attitude penalty for betrayal.
   */
  breakTreaty(civ1Id, civ2Id) {
    const c1 = this.game.civilizations.find(c => c.id === civ1Id);
    const c2 = this.game.civilizations.find(c => c.id === civ2Id);
    if (!c1 || !c2) return;

    const rel1 = c1.relations.get(civ2Id);
    const rel2 = c2.relations.get(civ1Id);
    if (!rel1?.treaty) return;

    const label = SimulationEngine.TREATY_DEFS[rel1.treaty.type]?.label || 'Treaty';
    const yr = this.game.currentYear;

    // Betrayal attitude penalty
    rel1.attitude = Utils.clamp(rel1.attitude - 15, -100, 100);
    rel2.attitude = Utils.clamp(rel2.attitude - 20, -100, 100);
    rel1.treaty = null;
    rel2.treaty = null;

    c1.addHistoryEntry(yr, `${label} Broken with ${c2.name}`,
      `${c1.name} has unilaterally dissolved its ${label} with ${c2.name}, damaging relations and undermining trust.`,
      'diplomacy');

    const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);
    if (playerCiv?.id === c1.id)
      this.game.ui?.showNotification(`⚠️ You broke the ${label} with ${c2.name}. Relations damaged.`);
    else if (playerCiv?.id === c2.id)
      this.game.ui?.showNotification(`⚠️ ${c1.name} broke their ${label} with you.`);
  }

  _processActiveWars(yearsDelta, currentYear) {
    // ══════════════════════════════════════════════════════════════════════
    // LANCHESTER ATTRITION MODEL (Lanchester 1916, modernized)
    // Linear law: attrition ∝ own force size (guerrilla/ancient warfare)
    // Square law: attrition ∝ opponent force size (modern concentrated fire)
    // Combat power = militaryPower × (stateCapacity/100) × techLevel × morale
    // Casualties scale with power differential (weaker side loses more)
    // ══════════════════════════════════════════════════════════════════════
    const toResolve = [];
    const scale = yearsDelta / 10;

    for (const war of this.activeWars) {
      const { attacker, defender } = war;
      war.turnsAtWar++;

      // ── Compute combat power (Lanchester) ──────────────────────
      const aTech = attacker.state.technologyLevel ?? 3;
      const dTech = defender.state.technologyLevel ?? 3;
      const aMorale = ((attacker.state.stabilityIndex ?? 50) + (attacker.state.legitimacyLevel ?? 50)) / 200;
      const dMorale = ((defender.state.stabilityIndex ?? 50) + (defender.state.legitimacyLevel ?? 50)) / 200;
      const aCapacity = (attacker.state.stateCapacity ?? 50) / 100;
      const dCapacity = (defender.state.stateCapacity ?? 50) / 100;

      // Combat power: military strength × logistics capacity × tech × morale
      const aPower = (attacker.state.militaryPower ?? 30) * aCapacity * (1 + aTech * 0.15) * (0.5 + aMorale);
      const dPower = (defender.state.militaryPower ?? 30) * dCapacity * (1 + dTech * 0.15) * (0.5 + dMorale);

      // Power ratio determines casualty distribution
      // Lanchester square law: stronger side takes fewer casualties proportionally
      const totalPower = aPower + dPower || 1;
      const aShare = aPower / totalPower;  // attacker's share of total combat power
      const dShare = dPower / totalPower;

      // ── Attrition (casualties and costs) ───────────────────────
      // Base casualties: ~1-3% population per 10-year turn of war
      // Skewed by power differential (weaker side loses ~2-3x more)
      const baseCasualty = 0.015; // 1.5% baseline per 10-year turn
      const techCasualty = Math.min(3, 1 + aTech * 0.1 + dTech * 0.1); // modern wars more lethal per engagement

      // Attacker casualties: proportional to DEFENDER's power share (stronger enemy = more losses)
      const aCasualties = baseCasualty * dShare * techCasualty * scale;
      const dCasualties = baseCasualty * aShare * techCasualty * scale;

      // Apply population loss
      attacker.state.population = Math.max(100,
        Math.floor(attacker.state.population * (1 - aCasualties)));
      defender.state.population = Math.max(100,
        Math.floor(defender.state.population * (1 - dCasualties)));

      // Wellbeing: defender suffers more (invaded homeland), but power matters
      attacker.state.averageWellbeing = Utils.clamp(
        attacker.state.averageWellbeing - (2 + dShare * 3) * scale, 0, 100);
      defender.state.averageWellbeing = Utils.clamp(
        defender.state.averageWellbeing - (3 + aShare * 4) * scale, 0, 100);

      // Food consumption by military operations
      attacker.state.resourceStores.food = Math.max(0,
        (attacker.state.resourceStores.food || 0) - (10 + aPower * 0.2) * scale);
      defender.state.resourceStores.food = Math.max(0,
        (defender.state.resourceStores.food || 0) - (15 + dPower * 0.15) * scale);

      // Stability: prolonged war erodes stability (more for weaker side)
      attacker.state.stabilityIndex = Utils.clamp(
        attacker.state.stabilityIndex - (1 + dShare) * scale, 0, 100);
      defender.state.stabilityIndex = Utils.clamp(
        defender.state.stabilityIndex - (1.5 + aShare) * scale, 0, 100);

      // ── Territory shifts (Lanchester: stronger side advances) ──
      if (Utils.random() < 0.18) {
        if (aShare > 0.55) {
          this._transferConqueredTiles(attacker, defender, Math.ceil(aShare * 3));
        } else if (dShare > 0.60) {
          // Defender counterattack
          this._transferConqueredTiles(defender, attacker, 1);
        }
      }

      const resolution = this._checkWarResolution(war);
      if (resolution) toResolve.push({ war, resolution });
    }

    for (const { war, resolution } of toResolve) {
      this.activeWars = this.activeWars.filter(w => w !== war);
      this._resolveWar(war, resolution, currentYear);
    }
  }

  _checkWarResolution(war) {
    const { attacker, defender, turnsAtWar } = war;
    const aWell = attacker.state.averageWellbeing;
    const dWell = defender.state.averageWellbeing;

    if (dWell < 10 && turnsAtWar >= 2) return 'conquest_attacker';
    if (aWell < 10 && turnsAtWar >= 2) return 'conquest_defender';
    if (aWell < 20 && dWell < 20 && turnsAtWar >= 5) return 'mutual_peace';
    if (turnsAtWar >= 14 && Utils.random() < 0.15) return 'exhaustion_peace';
    if (turnsAtWar >= 9 && Utils.random() < 0.07) return 'negotiated_peace';
    return null;
  }

  _resolveWar(war, resolution, currentYear) {
    const { attacker, defender, startYear, reason } = war;
    const duration = Math.max(10, Math.round((currentYear - startYear) / 10) * 10);
    const relA = attacker.relations.get(defender.id);
    const relD = defender.relations.get(attacker.id);
    const isIndependenceWar = reason === 'war of independence';

    if (relA) relA.war = false;
    if (relD) relD.war = false;

    const playerCiv = this.game.civilizations.find(c => c.isPlayerCiv);

    if (resolution === 'conquest_attacker') {
      // In a war of independence: attacker = colonized civ, so attacker winning = independence
      if (isIndependenceWar) {
        attacker.applyRegimeChange('liberated', null, currentYear);
        // Defender (former occupier) loses some territory
        this._transferConqueredTiles(attacker, defender, 3);
        defender.state.averageWellbeing = Math.max(0, defender.state.averageWellbeing - 8);

        defender.addHistoryEntry(currentYear,
          `${attacker.name} Wins Independence`,
          `After ${duration} years of war, ${attacker.name} has succeeded in its war of independence. ${defender.name}'s attempt to hold the territory has failed. The loss of a colony — its labor, its resources, its territory — will reshape ${defender.name}'s economy and politics in ways that will take time to fully understand.`,
          'war_defeat');

        if (playerCiv === attacker)      this.game.ui?.showNotification(`🏆 Independence won! Your war of liberation against ${defender.name} has succeeded!`);
        else if (playerCiv === defender) this.game.ui?.showNotification(`⚠️ ${attacker.name} has won its independence from you after ${duration} years of war.`);
        else                              this.game.ui?.showNotification(`🏆 ${attacker.name} has won independence from ${defender.name}!`);

      } else {
        // Standard conquest
        this._transferConqueredTiles(attacker, defender, 5);
        const populationLost = Math.round(defender.state.population * 0.15);
        defender.state.population = Math.max(50, defender.state.population - populationLost);
        defender.state.averageWellbeing = Math.max(0, defender.state.averageWellbeing - 10);

        attacker.addHistoryEntry(currentYear,
          `Victory: ${defender.name} Conquered`,
          `After ${duration} years of war (triggered by ${reason}), ${attacker.name} has achieved decisive victory over ${defender.name}. Significant territory has been absorbed and the defeated civilization faces fundamental reorganization under occupation. The human cost on both sides was severe.`,
          'war_victory');
        defender.addHistoryEntry(currentYear,
          `Conquered by ${attacker.name}`,
          `After ${duration} years of war, ${defender.name} has been defeated by ${attacker.name}. Territory has been seized and the existing governing structure has been dismantled. The population now lives under occupation — a transformation that will reshape every aspect of life here.`,
          'war_defeat');

        if (defender.applyRegimeChange) defender.applyRegimeChange('conquered', attacker, currentYear);

        if (relA) relA.attitude = Math.max(-60, relA.attitude - 10);
        if (relD) relD.attitude = Utils.clamp(relD.attitude - 30, -100, -50);

        if (playerCiv === attacker)      this.game.ui?.showNotification(`🏆 Victory! You have conquered ${defender.name}.`);
        else if (playerCiv === defender) this.game.ui?.showNotification(`💀 Defeat. ${attacker.name} has conquered your civilization.`);
        else                              this.game.ui?.showNotification(`⚔️ ${attacker.name} has conquered ${defender.name}.`);
      }

    } else if (resolution === 'conquest_defender') {
      if (isIndependenceWar) {
        // Occupier (defender in war mechanics) crushes the uprising
        attacker.state.averageWellbeing = Utils.clamp(attacker.state.averageWellbeing - 8, 0, 100);
        attacker._independenceMovement  = Math.max(0, (attacker._independenceMovement || 0) - 40);

        attacker.addHistoryEntry(currentYear,
          `Independence Uprising Crushed`,
          `${attacker.name}'s armed uprising for independence has been suppressed by ${defender.name} after ${duration} years of fighting. The independence movement has suffered a severe setback. Whether it can rebuild depends on what the occupation does next — repression may delay but rarely ends a movement permanently.`,
          'war_defeat');
        defender.addHistoryEntry(currentYear,
          `Uprising in ${attacker.name} Suppressed`,
          `${defender.name} has suppressed the armed independence uprising in ${attacker.name} after ${duration} years of fighting. The occupation has been preserved by force. The independence movement has been weakened but its underlying causes remain.`,
          'war_victory');

        if (playerCiv === attacker)      this.game.ui?.showNotification(`⚠️ The independence uprising has been suppressed. The movement is weakened but the struggle continues.`);
        else if (playerCiv === defender) this.game.ui?.showNotification(`🛡️ You have suppressed the independence uprising in ${attacker.name}.`);

      } else {
        // Defender repels standard attacker
        defender.state.averageWellbeing = Math.min(100, defender.state.averageWellbeing + 8);
        defender.state.stabilityIndex   = Math.min(100, defender.state.stabilityIndex + 12);

        attacker.addHistoryEntry(currentYear,
          `Failed Campaign: ${defender.name}`,
          `The war against ${defender.name} ended in defeat for ${attacker.name}. After ${duration} years of costly fighting, the invading forces were repelled, having sustained unsustainable losses in population and resources. The failed campaign will shape ${attacker.name}'s politics and economics for years to come.`,
          'war_defeat');
        defender.addHistoryEntry(currentYear,
          `Invasion Repelled: ${attacker.name}`,
          `${defender.name} has successfully repelled the invasion by ${attacker.name}. The ${duration}-year conflict exacted a terrible price — in lives, in resources, in stability — but the civilization survives with its territory and independence intact. The experience of resistance may reshape its identity.`,
          'war_victory');

        if (relA) relA.attitude = Utils.clamp(relA.attitude + 5, -100, -15);
        if (relD) relD.attitude = Utils.clamp(relD.attitude - 15, -100, 0);

        if (playerCiv === defender)      this.game.ui?.showNotification(`🛡️ You repelled the invasion by ${attacker.name}!`);
        else if (playerCiv === attacker) this.game.ui?.showNotification(`⚠️ Your campaign against ${defender.name} has failed.`);
      }

    } else {
      // Peace of some kind
      const peaceLabels = {
        mutual_peace: 'Armistice: Mutual Exhaustion',
        exhaustion_peace: 'War Ends: Exhaustion',
        negotiated_peace: 'Negotiated Peace Treaty',
      };
      const peaceLabel = isIndependenceWar
        ? (resolution === 'negotiated_peace' ? 'Negotiated Independence' : 'Ceasefire: Independence War')
        : peaceLabels[resolution] || 'Peace';
      const peaceDesc = isIndependenceWar
        ? `${attacker.name}'s war of independence against ${defender.name} has ended without a decisive military result after ${duration} years. A negotiated arrangement has been reached — neither full independence nor full suppression. The underlying question of sovereignty remains unresolved, though the immediate fighting has stopped.`
        : `${attacker.name} and ${defender.name} have ended ${duration} years of war (originally triggered by ${reason}). Both sides suffered significant losses — in population, wellbeing, and resources. A fragile peace has been established, though the underlying tensions that started the conflict have not necessarily been resolved.`;

      attacker.addHistoryEntry(currentYear, peaceLabel, peaceDesc, 'war_peace');
      defender.addHistoryEntry(currentYear, peaceLabel, peaceDesc, 'war_peace');

      if (relA) relA.attitude = Utils.clamp(relA.attitude + 15, -100, 100);
      if (relD) relD.attitude = Utils.clamp(relD.attitude + 15, -100, 100);

      // If independence war ends in negotiated peace, give partial independence movement gain
      if (isIndependenceWar) {
        attacker._independenceMovement = Utils.clamp(
          (attacker._independenceMovement || 0) - 20, 0, 100
        );
      }

      if (playerCiv === attacker || playerCiv === defender) {
        const other = playerCiv === attacker ? defender : attacker;
        this.game.ui?.showNotification(`🕊️ The war with ${other.name} has ended.`);
      }
    }
  }

  // Transfer tiles from defender to attacker (conquest)
  _transferConqueredTiles(attacker, defender, count) {
    const defenderTiles = this.game.map.getTilesForCiv(defender.id);
    if (defenderTiles.length <= 2) return; // leave at least a couple tiles

    const shuffled = Utils.shuffle([...defenderTiles]);
    let transferred = 0;
    for (const tile of shuffled) {
      if (transferred >= count) break;
      if (tile.isCapital) continue; // never take capital
      tile.civId = attacker.id;
      transferred++;
    }
  }

  // ── Get World State ───────────────────────────────────────────
  getWorldState() {
    return {
      globalWarmingIndex: this.globalWarmingIndex,
      climateTippingPoint: this.climateTippingPoint,
      temperatureAnomaly: Math.round((this.surfaceTemp ?? 0) * 100) / 100,
      atmosphericCO2: Math.round(280 + (this.atmosphericCO2 ?? 0)),
      tippingPoints: {
        permafrost: this._tippingPermafrost,
        iceSheets: this._tippingIceSheets,
        amoc: this._tippingAMOC,
        hothouse: this._tippingHothouse,
      },
      civilizationCount: this.game.civilizations.length,
      worldAverageWellbeing: this._getWorldAverageWellbeing(),
      worldAverageEmpathy: this._getWorldAverageEmpathy(),
      dominantEconomicModel: this._getDominantModel('economic'),
      dominantGovernanceModel: this._getDominantModel('governance'),
    };
  }

  _getWorldAverageWellbeing() {
    const civs = this.game.civilizations;
    if (civs.length === 0) return 50;
    return civs.reduce((s, c) => s + c.state.averageWellbeing, 0) / civs.length;
  }

  _getWorldAverageEmpathy() {
    const civs = this.game.civilizations;
    if (civs.length === 0) return 50;
    return civs.reduce((s, c) => s + c.state.empathyLevel, 0) / civs.length;
  }

  // ── PASS 7: PROCESSING METHODS ───────────────────────────────────────────

  // 1. Generational drift on susceptibility distribution.
  // Applies a slow random walk to alpha/beta of the bimodal+gamma distribution
  // every SUSCEPTIBILITY_GENERATIONAL_DRIFT.generationLengthTurns turns.
  // The underlying genetic susceptibility is stable; drift models epigenetic
  // and cohort-level changes over centuries.
  _processGenerationalDrift(civ) {
    // ══════════════════════════════════════════════════════════════════════
    // INGLEHART POST-MATERIALISM (1971, 1997) + MANNHEIM GENERATIONS (1928)
    // Core theory: material security during formative years (12-18) shapes
    // lifelong values. As societies grow prosperous, new generations shift
    // from survival/materialist values to self-expression/post-materialist.
    //
    // Inglehart dimensions:
    //   Survival ↔ Self-expression (driven by economic security)
    //   Traditional ↔ Secular-rational (driven by industrialization/education)
    //
    // Mannheim: shared formative experiences create generational cohorts
    // with distinct worldviews. Change happens through cohort replacement.
    // ══════════════════════════════════════════════════════════════════════
    const s = civ?.state;
    if (!s) return;

    const timeScale = (this.game.yearsDelta || 10) / 10;

    // ── 1. Susceptibility distribution drift (existing, preserved) ──
    const dist = s.susceptibilityDistribution;
    if (dist) {
      const cfg = (typeof SUSCEPTIBILITY_GENERATIONAL_DRIFT !== 'undefined')
        ? SUSCEPTIBILITY_GENERATIONAL_DRIFT
        : { generationLengthTurns: 25, alphaMaxDrift: 0.02, betaMaxDrift: 0.02, alphaRange: [0.5, 5.0], betaRange: [0.5, 5.0] };
      dist._generationDriftAccum = (dist._generationDriftAccum ?? 0) + 1;
      if (dist._generationDriftAccum >= cfg.generationLengthTurns) {
        dist._generationDriftAccum = 0;
        const aDrift = (Utils.random() * 2 - 1) * cfg.alphaMaxDrift;
        const bDrift = (Utils.random() * 2 - 1) * cfg.betaMaxDrift;
        dist.alpha = Utils.clamp(dist.alpha + aDrift, cfg.alphaRange[0], cfg.alphaRange[1]);
        dist.beta  = Utils.clamp(dist.beta  + bDrift, cfg.betaRange[0],  cfg.betaRange[1]);
        dist._lastAlphaDrift = aDrift;
        dist._lastBetaDrift  = bDrift;
      }
    }

    // ── 2. Inglehart values shift (generational replacement) ─────
    // Material security during formative years shapes values
    // Wellbeing proxy for material security; education for rationalization
    const wellbeing = s.averageWellbeing ?? 50;
    const educQ = s.educationQuality ?? 50;
    const urban = s.urbanizationRate ?? 15;
    const techLevel = s.technologyLevel ?? 3;

    // Survival → Self-expression axis: driven by prosperity + security
    // High wellbeing + stability → post-materialist shift
    // Low wellbeing / war / crisis → materialist reversion
    let selfExpressionDrift = 0;
    if (wellbeing > 60 && (s.stabilityIndex ?? 50) > 50) {
      selfExpressionDrift += 0.3 * timeScale; // Prosperity → post-materialism
    }
    if (wellbeing > 75 && (s.foodSecurity ?? 60) > 50) {
      selfExpressionDrift += 0.2 * timeScale; // Strong security → stronger shift
    }
    if (wellbeing < 35 || (s.stabilityIndex ?? 50) < 25) {
      selfExpressionDrift -= 0.5 * timeScale; // Crisis → materialist reversion
    }
    if ((s.atWar ?? false) || (s.warTurns ?? 0) > 0) {
      selfExpressionDrift -= 0.3 * timeScale; // War → survival values
    }

    // Traditional → Secular-rational axis: driven by education + urbanization
    let secularDrift = 0;
    if (educQ > 50) secularDrift += 0.2 * timeScale;
    if (urban > 50) secularDrift += 0.15 * timeScale;
    if (techLevel > 5) secularDrift += 0.1 * timeScale;

    // Apply to authority orientation (egalitarian ↔ hierarchical)
    // Post-materialist + secular → more egalitarian
    s.authorityOrientation = Utils.clamp(
      (s.authorityOrientation ?? 50) + (selfExpressionDrift + secularDrift) * 0.5, 0, 100);

    // Apply to risk orientation (innovation tolerance)
    // Post-materialists are more open to change and innovation
    s.riskOrientation = Utils.clamp(
      (s.riskOrientation ?? 50) + selfExpressionDrift * 0.4, 0, 100);

    // Apply to cooperation tendency
    // Post-materialists value cooperation and environmental concern
    if (s.behaviorReinforcement) {
      s.behaviorReinforcement.cooperation = Utils.clamp(
        (s.behaviorReinforcement.cooperation ?? 50) + selfExpressionDrift * 0.3, 0, 100);
    }
  }

  // 2. Cooperation/Competition tension for the disenfranchised stratum.
  // They have zero institutional power → no empathy suppression.
  // Instead, scarcity and structural barriers create tension between:
  //   - cooperation (empathy-driven mutual aid)
  //   - competition (survival-driven cutthroat scramble for scarce resources)
  _processLowestStrataTension(civ) {
    const s = civ?.state;
    if (!s) return;
    const tension = s.lowestStrataTension;
    if (!tension) return;

    const resourceSlack  = Utils.clamp(
      ((s.resourceDepletion?.forests ?? 80) + (s.resourceDepletion?.soil ?? 80) + (s.resourceDepletion?.water ?? 80)) / 3 / 100, 0, 1);
    const stabilityFac   = Utils.clamp((s.stabilityIndex ?? 50) / 100, 0, 1);
    const wellbeingFac   = Utils.clamp((s.averageWellbeing ?? 50) / 100, 0, 1);
    const disfranchEmpathy = Utils.clamp((s.empathyByStratum?.disenfranchised ?? 75) / 100, 0, 1);
    const mutualAidCap   = Utils.clamp((s.mutualAidCapacity ?? 50) / 100, 0, 1);

    // Cooperation pressure: empathy × mutual aid capacity × resource slack × stability
    const newCoop = Utils.clamp(
      (disfranchEmpathy * 0.40 + mutualAidCap * 0.30 + resourceSlack * 0.15 + stabilityFac * 0.15) * 100, 0, 100);
    // Competition pressure: scarcity + instability + opportunity competition
    const oppComp = Utils.clamp((s.opportunityCompetition ?? 50) / 100, 0, 1);
    const newComp = Utils.clamp(
      ((1 - resourceSlack) * 0.35 + (1 - wellbeingFac) * 0.30 + (1 - stabilityFac) * 0.20 + oppComp * 0.15) * 100, 0, 100);

    tension.cooperationPressure = Math.round(Utils.lerp(tension.cooperationPressure, newCoop, 0.08));
    tension.competitionPressure = Math.round(Utils.lerp(tension.competitionPressure, newComp, 0.08));
    tension.tensionScore = Math.round(Math.abs(tension.cooperationPressure - tension.competitionPressure));
    tension.dominantStrategy = tension.cooperationPressure > tension.competitionPressure + 5 ? 'cooperation'
      : tension.competitionPressure > tension.cooperationPressure + 5 ? 'competition' : 'neither';
    const prevSurvival = tension.survivalMode;
    tension.survivalMode = tension.tensionScore > 70 && (s.stabilityIndex ?? 50) < 30;

    // Cross-effects when in survival mode
    if (tension.survivalMode && !prevSurvival) {
      // Innovation and social cohesion suffer when lower strata are in survival mode
      if (s.educationQuality !== undefined) s.educationQuality = Utils.clamp(s.educationQuality - 2, 0, 100);
      if (s.institutionalQuality !== undefined) s.institutionalQuality = Utils.clamp(s.institutionalQuality - 1, 0, 100);
    }
  }

  // 3. Empathy × Reinforcement Interaction.
  // Tracks whether empathy and behavioral reinforcement compound or conflict,
  // producing virtuous cycles, vicious cycles, or conflicted states.
  // Both have textual and graphical representations at societal and strata levels.
  _processEmpathyReinforcementInteraction(civ) {
    const s = civ?.state;
    const eri = s?.empathyReinforcementInteraction;
    if (!eri) return;

    const empathy = Utils.clamp(s.empathyLevel ?? 50, 0, 100);
    const brScore = Utils.clamp(s.brCoopScore    ?? 50, 0, 100);

    // Determine interaction type and synergy bonus
    let type, synergy;
    if (empathy >= 65 && brScore >= 65) {
      type = 'virtuous'; synergy = +12;   // both high: self-reinforcing prosocial spiral
    } else if (empathy <= 35 && brScore <= 35) {
      type = 'vicious';  synergy = -12;   // both low: self-reinforcing antisocial spiral
    } else if (empathy >= 60 && brScore <= 40) {
      type = 'conflicted'; synergy = -5;  // values exist but aren't rewarded → cynicism risk
    } else if (brScore >= 60 && empathy <= 40) {
      type = 'conflicted'; synergy = -5;  // rewards exist but empathy suppressed → hollow cooperation
    } else {
      type = 'neutral'; synergy = 0;
    }

    const combined = Utils.clamp((empathy + brScore) / 2 + synergy, 0, 100);

    eri.empathyComponent      = Math.round(empathy);
    eri.reinforcementComponent= Math.round(brScore);
    eri.interactionType       = type;
    eri.combinedScore         = Math.round(combined);
    eri.synergyBonus          = synergy;

    // Per-stratum breakdown
    const strata = ['elite', 'upper_middle', 'lower_middle', 'working_class', 'disenfranchised'];
    const bReinf = s.behaviorReinforcement || {};
    const coopVal = Utils.clamp((bReinf.cooperation ?? 50), 0, 100);
    const mutVal  = Utils.clamp((bReinf.mutualAid   ?? 50), 0, 100);
    const compVal = Utils.clamp((bReinf.competition ?? 50), 0, 100);
    const stratBR = Utils.clamp((coopVal + mutVal - compVal + 50) / 2, 0, 100); // stratum-agnostic BR proxy

    for (const st of strata) {
      const stEmpathy = Utils.clamp(s.empathyByStratum?.[st] ?? 50, 0, 100);
      let stType, stSynergy;
      if (stEmpathy >= 65 && stratBR >= 65) { stType = 'virtuous';  stSynergy = +10; }
      else if (stEmpathy <= 35 && stratBR <= 35) { stType = 'vicious'; stSynergy = -10; }
      else if (stEmpathy >= 60 && stratBR <= 40)  { stType = 'conflicted'; stSynergy = -4; }
      else if (stratBR >= 60 && stEmpathy <= 40)  { stType = 'conflicted'; stSynergy = -4; }
      else { stType = 'neutral'; stSynergy = 0; }
      eri.byStratum[st] = {
        empathy:       Math.round(stEmpathy),
        reinforcement: Math.round(stratBR),
        combined:      Math.round(Utils.clamp((stEmpathy + stratBR) / 2 + stSynergy, 0, 100)),
        type:          stType,
      };
    }

    // Cross-effects on civilization
    if (combined > 70) {
      if (s.behaviorReinforcement?.cooperation !== undefined)
        s.behaviorReinforcement.cooperation = Utils.clamp(s.behaviorReinforcement.cooperation + 0.02, 0, 100);
      if (s.averageWellbeing !== undefined)
        s.averageWellbeing = Utils.clamp(s.averageWellbeing + 0.01, 0, 100);
    } else if (combined < 30) {
      if (s.stabilityIndex !== undefined)
        s.stabilityIndex = Utils.clamp(s.stabilityIndex - 0.02, 0, 100);
      if (s.corruptionIndex !== undefined)
        s.corruptionIndex = Utils.clamp(s.corruptionIndex + 0.02, 0, 100);
      // Low combined score also increases cynicism via cultural gap
      if (s.culturalGap) s.culturalGap.cynicismLevel = Utils.clamp(s.culturalGap.cynicismLevel + 0.01, 0, 100);
    }

    // History ring buffer
    if (!Array.isArray(eri.history)) eri.history = [];
    eri.history.push({
      turn:          this.game?.turnCount ?? 0,
      empathy:       eri.empathyComponent,
      reinforcement: eri.reinforcementComponent,
      combined:      eri.combinedScore,
      type:          eri.interactionType,
    });
    if (eri.history.length > 50) eri.history.shift();
  }

  // 4. Cultural Gap — stated vs. reinforced values.
  // Gap → cognitive dissonance → cynicism → revolutionary consciousness → paradigm shift readiness.
  // Economic model is the PRIMARY driver of reinforced values.
  _processCulturalGap(civ) {
    const s = civ?.state;
    const cg = s?.culturalGap;
    if (!cg) return;

    // Recompute stated values each turn (education, gov, religion can change)
    const eduTier = s.educationAccess ?? 'free_secondary_affordable_higher';
    const gov     = civ.governance?.modelId ?? 'representative';
    const econ    = civ.economic?.modelId   ?? 'mixed';

    const statedBase = (typeof CULTURAL_STATED_VALUES_BY_EDUCATION !== 'undefined' && CULTURAL_STATED_VALUES_BY_EDUCATION[eduTier])
      ? { ...CULTURAL_STATED_VALUES_BY_EDUCATION[eduTier] }
      : { cooperation: 60, empathy: 60, fairness: 58, civicDuty: 55, honesty: 60 };
    const statedGovMod = (typeof CULTURAL_STATED_VALUES_GOV_MODIFIER !== 'undefined')
      ? (CULTURAL_STATED_VALUES_GOV_MODIFIER[gov] || {}) : {};
    for (const k of Object.keys(statedGovMod)) {
      if (statedBase[k] !== undefined) statedBase[k] = Utils.clamp(statedBase[k] + statedGovMod[k], 0, 100);
    }
    // Religion modifier on stated values: high religion dominance boosts honesty+empathy
    const religionDom = civ.religion?.dominance ?? 0;
    if (religionDom > 50) {
      statedBase.honesty = Utils.clamp(statedBase.honesty + (religionDom - 50) * 0.1, 0, 100);
      statedBase.empathy = Utils.clamp(statedBase.empathy + (religionDom - 50) * 0.05, 0, 100);
    }

    // Reinforced values: economic model PRIMARY driver
    const reinforcedBase = (typeof CULTURAL_REINFORCED_VALUES_BY_ECON !== 'undefined' && CULTURAL_REINFORCED_VALUES_BY_ECON[econ])
      ? { ...CULTURAL_REINFORCED_VALUES_BY_ECON[econ] }
      : { cooperation: 50, empathy: 50, fairness: 50, civicDuty: 50, honesty: 50 };
    const reinforcedGovMod = (typeof CULTURAL_REINFORCED_VALUES_GOV_MODIFIER !== 'undefined')
      ? (CULTURAL_REINFORCED_VALUES_GOV_MODIFIER[gov] || {}) : {};
    for (const k of Object.keys(reinforcedGovMod)) {
      if (reinforcedBase[k] !== undefined) reinforcedBase[k] = Utils.clamp(reinforcedBase[k] + reinforcedGovMod[k], 0, 100);
    }

    // Wealth capture shifts reinforced values toward wealth-serving behaviors
    const wc = s.wealthCapture?.reinforcementControl ?? 0;
    if (wc > 0) {
      const wcFrac = wc / 100;
      reinforcedBase.cooperation = Utils.clamp(reinforcedBase.cooperation - wcFrac * 15, 0, 100);
      reinforcedBase.fairness    = Utils.clamp(reinforcedBase.fairness    - wcFrac * 18, 0, 100);
      reinforcedBase.empathy     = Utils.clamp(reinforcedBase.empathy     - wcFrac * 12, 0, 100);
      reinforcedBase.civicDuty   = Utils.clamp(reinforcedBase.civicDuty   - wcFrac * 10, 0, 100);
    }

    // Drift stated/reinforced toward computed targets (slow — values are cultural, change slowly)
    const driftRate = 0.04;
    for (const k of Object.keys(statedBase)) {
      cg.statedValues[k]    = Math.round(Utils.clamp(Utils.lerp(cg.statedValues[k]    ?? statedBase[k],    statedBase[k],    driftRate), 0, 100));
      cg.reinforcedValues[k]= Math.round(Utils.clamp(Utils.lerp(cg.reinforcedValues[k] ?? reinforcedBase[k], reinforcedBase[k], driftRate), 0, 100));
    }

    // Aggregate gap score: mean absolute difference across all value dimensions
    const keys = Object.keys(cg.statedValues);
    const totalGap = keys.reduce((sum, k) => sum + Math.abs((cg.statedValues[k] || 0) - (cg.reinforcedValues[k] || 0)), 0);
    cg.gapScore = Math.round(totalGap / keys.length);

    // Cognitive dissonance rises with gap (when gap > 20), converts slowly to cynicism
    if (cg.gapScore > 20) {
      cg.cognitiveDissonanceLevel = Utils.clamp(cg.cognitiveDissonanceLevel + (cg.gapScore - 20) * 0.008, 0, 100);
    } else {
      cg.cognitiveDissonanceLevel = Utils.clamp(cg.cognitiveDissonanceLevel - 0.3, 0, 100);
    }
    // High dissonance converts to cynicism (more stable, harder to reverse)
    if (cg.cognitiveDissonanceLevel > 55) {
      const conversion = (cg.cognitiveDissonanceLevel - 55) * 0.01;
      cg.cynicismLevel              = Utils.clamp(cg.cynicismLevel + conversion, 0, 100);
      cg.cognitiveDissonanceLevel   = Utils.clamp(cg.cognitiveDissonanceLevel - conversion * 0.4, 0, 100);
    }
    // Cynicism decays very slowly if gap closes
    if (cg.gapScore < 15 && cg.cynicismLevel > 0) {
      cg.cynicismLevel = Utils.clamp(cg.cynicismLevel - 0.05, 0, 100);
    }
    // Cross-effects of cynicism
    if (s.institutionalQuality !== undefined)
      s.institutionalQuality = Utils.clamp(s.institutionalQuality - cg.cynicismLevel * 0.005, 0, 100);
    if (s.behaviorReinforcement?.cooperation !== undefined)
      s.behaviorReinforcement.cooperation = Utils.clamp(s.behaviorReinforcement.cooperation - cg.cynicismLevel * 0.003, 0, 100);

    // Revolutionary consciousness: cynicism is fuel, epistemic health is the spark
    // (high cynicism alone produces apathy; epistemic health provides means to act)
    const ehFrac  = Utils.clamp((s.epistemicHealth ?? 50) / 100, 0, 1);
    const cynFrac = Utils.clamp(cg.cynicismLevel / 100, 0, 1);
    cg.revolutionaryConsciousness = Math.round(cynFrac * ehFrac * cg.gapScore);
    cg.paradigmShiftReadiness     = Math.round(Utils.clamp(cg.revolutionaryConsciousness / 50 * 100, 0, 100));

    // Per-stratum gap perception and psychological cost
    const percCfg = (typeof CULTURAL_GAP_STRATUM_PERCEPTION !== 'undefined') ? CULTURAL_GAP_STRATUM_PERCEPTION : {};
    for (const st of ['elite','upper_middle','lower_middle','working_class','disenfranchised']) {
      const perc = percCfg[st] ?? { perceptionMultiplier: 0.75, benefitFromGap: false };
      const stratGap = cg.gapScore * perc.perceptionMultiplier;
      cg.byStratum[st].gapPerception    = Math.round(stratGap);
      cg.byStratum[st].psychologicalCost= perc.benefitFromGap ? 0 : Math.round(stratGap * cg.cynicismLevel / 100);
      cg.byStratum[st].benefitFromGap   = perc.benefitFromGap;
    }

    // History ring buffer
    if (!Array.isArray(cg.history)) cg.history = [];
    cg.history.push({
      turn:        this.game?.turnCount ?? 0,
      gapScore:    cg.gapScore,
      dissonance:  Math.round(cg.cognitiveDissonanceLevel),
      cynicism:    Math.round(cg.cynicismLevel),
      revCons:     Math.round(cg.revolutionaryConsciousness),
      readiness:   Math.round(cg.paradigmShiftReadiness),
    });
    if (cg.history.length > 50) cg.history.shift();
  }

  // 5. Wealth Capture — how much concentrated wealth has captured governance institutions.
  // Economic model is the PRIMARY driver. Wealth capture also determines
  // what IS and IS NOT reinforced for survival (via reinforcementControl).
  _processWealthCapture(civ) {
    const s = civ?.state;
    const wc = s?.wealthCapture;
    if (!wc) return;

    const econ     = civ.economic?.modelId ?? 'mixed';
    const wealthConc = Utils.clamp(civ.economic?.wealthConcentration ?? 20, 0, 100);
    const iq       = Utils.clamp(s.institutionalQuality ?? 50, 0, 100);
    const eh       = Utils.clamp(s.epistemicHealth ?? 50, 0, 100);
    const econPot  = (typeof ECON_POWER_POTENTIAL !== 'undefined') ? (ECON_POWER_POTENTIAL[econ] ?? 0.30) : 0.30;
    const infoId   = s.informationEcosystem ?? 'free_market_media';

    // Overall degree: wealth concentration × economic power potential × institutional weakness
    // Pass 8: apply consequence deficit acceleration multiplier to lerp rate
    const deficitMult = s.consequenceDeficit?.accelerationMultiplier ?? 1.0;
    const rawDegree = wealthConc * econPot * (1 - iq / 100) * 1.2;
    wc.degree = Math.round(Utils.clamp(Utils.lerp(wc.degree, rawDegree, Utils.clamp(0.06 * deficitMult, 0.01, 0.25)), 0, 100));

    // Dimensions
    wc.institutionalCapture = Math.round(Utils.clamp(wc.degree * 0.80 * (1 - iq / 100), 0, 100));
    wc.electoralCapture     = Math.round(Utils.clamp(wc.degree * 0.70 * (1 - eh / 100), 0, 100));
    const mediaMultiplier   = (infoId === 'captured_commercial' || infoId === 'state_guided') ? 0.9 : 0.35;
    wc.mediaCapture         = Math.round(Utils.clamp(wc.degree * mediaMultiplier, 0, 100));
    wc.culturalCapture      = Math.round(Utils.clamp(wc.degree * 0.60, 0, 100));
    wc.reinforcementControl = Math.round(Utils.clamp(
      (wc.institutionalCapture + wc.electoralCapture + wc.mediaCapture + wc.culturalCapture) / 4, 0, 100));

    // Feudal dynamic detection
    const thr = (typeof WEALTH_CAPTURE_THRESHOLDS !== 'undefined') ? WEALTH_CAPTURE_THRESHOLDS : { feudal: 80 };
    wc.feudalDynamic  = wc.degree >= thr.feudal && wealthConc > 75;
    wc.feudalIntensity= wc.feudalDynamic ? Math.round((wc.degree - thr.feudal) / (100 - thr.feudal) * 100) : 0;

    // Cross-effects: high capture increases corruption, reduces institutional quality and EH
    if (wc.degree > 40) {
      const captureFrac = (wc.degree - 40) / 60;
      if (s.corruptionIndex !== undefined)
        s.corruptionIndex = Utils.clamp(s.corruptionIndex + captureFrac * 0.04, 0, 100);
      if (s.institutionalQuality !== undefined)
        s.institutionalQuality = Utils.clamp(s.institutionalQuality - captureFrac * 0.03, 0, 100);
      if (s.epistemicHealth !== undefined)
        s.epistemicHealth = Utils.clamp(s.epistemicHealth - wc.mediaCapture / 100 * 0.03, 0, 100);
    }

    // History ring buffer
    if (!Array.isArray(wc.history)) wc.history = [];
    wc.history.push({
      turn:                 this.game?.turnCount ?? 0,
      degree:               wc.degree,
      reinforcementControl: wc.reinforcementControl,
      feudalDynamic:        wc.feudalDynamic,
      institutionalCapture: wc.institutionalCapture,
      electoralCapture:     wc.electoralCapture,
      mediaCapture:         wc.mediaCapture,
    });
    if (wc.history.length > 50) wc.history.shift();
  }

  // 6. Theocratic empathy bias — splits empathy into in-group and out-group components.
  // Active when governance === 'theocratic' OR religion dominance > threshold.
  _processTheocraticEmpathyBias(civ) {
    const s = civ?.state;
    if (!s) return;
    const gov        = civ.governance?.modelId ?? '';
    const religionDom= civ.religion?.dominance ?? 0;
    const thr = (typeof THEOCRATIC_EMPATHY_BIAS !== 'undefined')
      ? THEOCRATIC_EMPATHY_BIAS
      : { triggerReligionDominance: 70, inGroupMultiplier: 1.15, outGroupMultiplier: 0.75 };

    const active = (gov === 'theocratic') || (religionDom > thr.triggerReligionDominance);
    const empathy = s.empathyLevel ?? 50;
    s.theocraticEmpathyBias = s.theocraticEmpathyBias || {};
    s.theocraticEmpathyBias.active = active;
    if (active) {
      s.theocraticEmpathyBias.inGroupEmpathy  = Utils.clamp(empathy * thr.inGroupMultiplier,  0, 95);
      s.theocraticEmpathyBias.outGroupEmpathy = Utils.clamp(empathy * thr.outGroupMultiplier, 0, 100);
    } else {
      s.theocraticEmpathyBias.inGroupEmpathy  = empathy;
      s.theocraticEmpathyBias.outGroupEmpathy = empathy;
    }
  }

  // 7. Active paradigm shift processing — tick consequences of in-progress shifts,
  // check auto-trigger conditions, process active strategy effects.
  _processActiveParadigmShifts(civ) {
    const s = civ?.state;
    const pss = s?.paradigmShiftState;
    if (!s || !pss) return;

    // Tick active shifts (process consequence chains)
    if (Array.isArray(pss.activeShifts)) {
      for (let i = pss.activeShifts.length - 1; i >= 0; i--) {
        const activeShift = pss.activeShifts[i];
        activeShift.turnsElapsed = (activeShift.turnsElapsed ?? 0) + 1;
        if (activeShift.turnsRemaining != null) activeShift.turnsRemaining = Math.max(0, activeShift.turnsRemaining - 1);

        // Institutional lock-in slows paradigm shift progress
        const lockin = s.institutionalLockin ?? 30;
        if (lockin > 40 && activeShift.turnsRemaining != null) {
          activeShift.turnsRemaining = Math.max(0,
            activeShift.turnsRemaining + lockin * 0.005);
        }

        // Find the shift definition
        const catalog = (typeof PARADIGM_SHIFT_CATALOG !== 'undefined') ? PARADIGM_SHIFT_CATALOG : null;
        if (!catalog) continue;
        const shiftDef = [...(catalog.governance || []), ...(catalog.economic || [])]
          .find(sd => sd.id === activeShift.shiftId);
        if (!shiftDef) continue;

        // Apply consequence effects at scheduled delays
        for (const consequence of (shiftDef.consequences || [])) {
          if (activeShift.turnsElapsed === consequence.delay) {
            this._applyShiftConsequence(civ, consequence.effects);
            activeShift.consequenceStep = (activeShift.consequenceStep ?? 0) + 1;
          }
        }

        // Process active strategies
        for (const stratId of (activeShift.strategiesActive || [])) {
          const stratDef = (typeof IMPLEMENTATION_STRATEGIES !== 'undefined')
            ? IMPLEMENTATION_STRATEGIES.find(st => st.id === stratId) : null;
          if (stratDef) this._applyStrategyEffect(civ, stratDef, activeShift);
        }

        // Complete shift when all consequences have fired
        const maxDelay = Math.max(...(shiftDef.consequences || [{ delay: 0 }]).map(c => c.delay), 0);
        if (activeShift.turnsElapsed > maxDelay + 2) {
          pss.completedShifts.unshift({
            shiftId:        activeShift.shiftId,
            type:           activeShift.type,
            from:           activeShift.fromModel,
            to:             activeShift.targetModel,
            completedTurn:  this.game?.turnCount ?? 0,
            strategiesUsed: activeShift.strategiesActive || [],
          });
          if (pss.completedShifts.length > 20) pss.completedShifts.length = 20;
          pss.activeShifts.splice(i, 1);
        }
      }
    }

    // Auto-trigger: spontaneous state collapse when instability is extreme
    const stability = s.stabilityIndex ?? 50;
    const cynicism  = s.culturalGap?.cynicismLevel ?? 0;
    const iq        = s.institutionalQuality ?? 50;
    const readiness = s.culturalGap?.paradigmShiftReadiness ?? 0;

    // Spontaneous shift if readiness very high and stability very low
    if (readiness > 85 && stability < 20 && !(pss.activeShifts?.length > 0)) {
      // Record spontaneous shift event in history (don't auto-apply; fire a notification instead)
      if (!pss._spontaneousTriggeredTurn || (this.game?.turnCount ?? 0) - pss._spontaneousTriggeredTurn > 10) {
        pss._spontaneousTriggeredTurn = this.game?.turnCount ?? 0;
        civ.history?.unshift({
          turn: this.game?.turnCount ?? 0,
          year: this.game?.currentYear ?? 0,
          type: 'paradigm_shift_pressure',
          text: `Revolutionary consciousness has reached a critical threshold. The existing governance and economic arrangements face an existential challenge. A paradigm shift appears imminent.`,
          color: '#f59e0b',
        });
      }
    }

    // Update resistance and enhancement scores for display
    pss.resistanceScore  = Math.round(Utils.clamp(
      (s.wealthCapture?.degree ?? 0) * 0.30 + (s.hierarchyEntrenched ?? 0) * 0.25 +
      (100 - s.epistemicHealth ?? 50) * 0.20 + cynicism * 0.15 + (100 - iq) * 0.10, 0, 100));
    pss.enhancementScore = Math.round(Utils.clamp(
      readiness * 0.30 + (s.epistemicHealth ?? 50) * 0.20 + iq * 0.20 +
      (100 - (s.wealthCapture?.degree ?? 0)) * 0.20 + (s.genderEquity ?? 50) * 0.10, 0, 100));
  }

  _applyShiftConsequence(civ, effects) {
    const s = civ?.state;
    if (!s || !effects) return;
    const clamp = Utils.clamp.bind(Utils);
    if (effects.stabilityIndex     !== undefined) s.stabilityIndex     = clamp(s.stabilityIndex     + effects.stabilityIndex,     0, 100);
    if (effects.empathyLevel       !== undefined) s.empathyLevel       = clamp(s.empathyLevel       + effects.empathyLevel,       0, 100);
    if (effects.corruptionIndex    !== undefined) s.corruptionIndex    = clamp(s.corruptionIndex    + effects.corruptionIndex,    0, 100);
    if (effects.epistemicHealth    !== undefined) s.epistemicHealth    = clamp(s.epistemicHealth    + effects.epistemicHealth,    0, 100);
    if (effects.equalityIndex      !== undefined) s.equalityIndex      = clamp(s.equalityIndex      + effects.equalityIndex,      0, 100);
    if (effects.wellbeingIndex     !== undefined) s.averageWellbeing   = clamp(s.averageWellbeing   + effects.wellbeingIndex,     0, 100);
    if (effects.institutionalQuality!== undefined) s.institutionalQuality = clamp(s.institutionalQuality + effects.institutionalQuality, 0, 100);
    if (effects.genderEquityIndex  !== undefined) s.genderEquity       = clamp(s.genderEquity       + effects.genderEquityIndex,  0, 100);
    if (effects.wealthConcentration!== undefined) civ.economic.wealthConcentration = clamp(civ.economic.wealthConcentration + effects.wealthConcentration, 0, 100);
    if (effects.cooperation        !== undefined) {
      const b = s.behaviorReinforcement;
      if (b?.cooperation !== undefined) b.cooperation = clamp(b.cooperation + effects.cooperation, 0, 100);
    }
    if (effects.cynicismLevel      !== undefined && s.culturalGap) {
      s.culturalGap.cynicismLevel = clamp(s.culturalGap.cynicismLevel + effects.cynicismLevel, 0, 100);
    }
    if (effects.theocraticEmpathyBiasActivated) {
      if (s.theocraticEmpathyBias) s.theocraticEmpathyBias.active = true;
    }
    if (effects.paradigmShiftReadiness !== undefined && s.culturalGap) {
      s.culturalGap.paradigmShiftReadiness = clamp(s.culturalGap.paradigmShiftReadiness + effects.paradigmShiftReadiness, 0, 100);
    }
    if (effects.lowestStrataTensionBonus !== undefined && s.lowestStrataTension) {
      s.lowestStrataTension.tensionScore = clamp(s.lowestStrataTension.tensionScore + effects.lowestStrataTensionBonus, 0, 100);
    }
  }

  _applyStrategyEffect(civ, stratDef, activeShift) {
    const s = civ?.state;
    if (!s || !stratDef?.effects) return;
    const e = stratDef.effects;
    const clamp = Utils.clamp.bind(Utils);
    const cg = s.culturalGap;

    // Apply per-turn fractional effects (strategies run over durationTurns)
    const turnFrac = 1 / Math.max(stratDef.durationTurns || 1, 1);
    if (e.cynicismReduction !== undefined && cg)
      cg.cynicismLevel = clamp(cg.cynicismLevel - e.cynicismReduction * turnFrac, 0, 100);
    if (e.culturalGapReduction !== undefined && cg)
      Object.keys(cg.statedValues).forEach(k => {
        // Narrow the gap by pulling reinforced values toward stated values
        const diff = (cg.statedValues[k] ?? 50) - (cg.reinforcedValues[k] ?? 50);
        cg.reinforcedValues[k] = clamp(cg.reinforcedValues[k] + diff * e.culturalGapReduction * turnFrac, 0, 100);
      });
    if (e.cooperationBonus !== undefined && s.behaviorReinforcement?.cooperation !== undefined)
      s.behaviorReinforcement.cooperation = clamp(s.behaviorReinforcement.cooperation + e.cooperationBonus * turnFrac, 0, 100);
    if (e.stabilityBonus !== undefined)
      s.stabilityIndex = clamp(s.stabilityIndex + e.stabilityBonus * turnFrac, 0, 100);
    if (e.wellbeingBonus !== undefined)
      s.averageWellbeing = clamp(s.averageWellbeing + e.wellbeingBonus * turnFrac, 0, 100);
    if (e.institutionalQualityBonus !== undefined)
      s.institutionalQuality = clamp(s.institutionalQuality + e.institutionalQualityBonus * turnFrac, 0, 100);
    if (e.resistanceReduction !== undefined && s.paradigmShiftState)
      s.paradigmShiftState.resistanceScore = clamp(s.paradigmShiftState.resistanceScore - e.resistanceReduction * 100 * turnFrac, 0, 100);
    if (e.lowestStrataTensionReduction !== undefined && s.lowestStrataTension)
      s.lowestStrataTension.tensionScore = clamp(s.lowestStrataTension.tensionScore - e.lowestStrataTensionReduction * 100 * turnFrac, 0, 100);
  }

  // Public method to trigger a paradigm shift (called from UI / game.handleEvent)
  triggerParadigmShift(civ, shiftId, targetModelId, strategiesSelected = []) {
    const s = civ?.state;
    if (!s) return null;
    const catalog = (typeof PARADIGM_SHIFT_CATALOG !== 'undefined') ? PARADIGM_SHIFT_CATALOG : null;
    if (!catalog) return null;
    // Determine whether this shift is governance or economic so we can tag it
    const isGovShift  = (catalog.governance || []).some(sd => sd.id === shiftId);
    const shiftDef = [...(catalog.governance || []), ...(catalog.economic || [])]
      .find(sd => sd.id === shiftId);
    if (!shiftDef) return null;
    const shiftCategory = isGovShift ? 'governance' : 'economic';

    // Apply immediate effects
    this._applyShiftConsequence(civ, shiftDef.immediateEffects || {});

    // Pass 8: Load behavioral shift into deferred queue (not applied immediately).
    // Behavioral inertia (_processInertia) trickles the delta through each turn
    // at a rate inversely proportional to the inertia coefficient.
    const bShift = shiftDef.behaviorShift || {};
    const b = s.behaviorReinforcement;
    const def = s.behaviorInertia?.deferredShift;
    if (def && b) {
      for (const [key, delta] of Object.entries(bShift)) {
        if (def[key] !== undefined) def[key] = (def[key] ?? 0) + delta;
      }
    } else if (b && !def) {
      // Fallback: if behaviorInertia not initialised (legacy save), apply immediately
      for (const [key, delta] of Object.entries(bShift)) {
        if (b[key] !== undefined) b[key] = Utils.clamp(b[key] + delta, 0, 100);
      }
    }

    // Register active shift
    if (!Array.isArray(s.paradigmShiftState?.activeShifts)) {
      if (s.paradigmShiftState) s.paradigmShiftState.activeShifts = [];
    }
    const totalDuration = Math.max(...(shiftDef.consequences || [{ delay: 0 }]).map(c => c.delay), 0) + 2;
    s.paradigmShiftState?.activeShifts?.push({
      shiftId,
      type:            shiftCategory,        // 'governance' or 'economic' — matches paradigm_panel render
      direction:       shiftDef.direction,    // 'flattening', 'concentrating', etc.
      fromModel:       shiftCategory === 'governance' ? civ.governance?.modelId : civ.economic?.modelId,
      targetModel:     targetModelId,         // matches paradigm_panel render expectation
      startTurn:       this.game?.turnCount ?? 0,
      turnsElapsed:    0,
      turnsRemaining:  totalDuration,
      consequenceStep: 0,
      strategiesActive: strategiesSelected,
    });

    // Log to shift history
    if (!Array.isArray(s.paradigmShiftState?.history)) {
      if (s.paradigmShiftState) s.paradigmShiftState.history = [];
    }
    s.paradigmShiftState?.history?.unshift({
      shiftId, targetModelId, strategiesSelected,
      turn: this.game?.turnCount ?? 0,
      year: this.game?.currentYear ?? 0,
    });
    if (s.paradigmShiftState?.history?.length > 20) s.paradigmShiftState.history.length = 20;

    // Add to civ history
    civ.history?.unshift({
      turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0,
      type: 'paradigm_shift', text: `Paradigm shift initiated: ${shiftDef.label}. Target: ${targetModelId}.`,
      color: '#a855f7',
    });

    return shiftDef;
  }

  _getDominantModel(axis) {
    const counts = {};
    for (const civ of this.game.civilizations) {
      const modelId = axis === 'economic' ? civ.economic.modelId : civ.governance.modelId;
      counts[modelId] = (counts[modelId] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PASS 8 — Behavioral Dynamics & Systemic Accountability
  // ══════════════════════════════════════════════════════════════════════════

  // P8-1: Behavioral Inertia — trickle deferred behavioral shifts through at
  // a rate inversely proportional to the inertia coefficient.
  _processInertia(civ) {
    const s = civ?.state;
    const bi = s?.behaviorInertia;
    const b  = s?.behaviorReinforcement;
    if (!s || !bi || !b) return;

    // Compute inertia coefficient this turn
    const timeInModel    = Utils.clamp(Math.max(s._govShiftAge ?? 0, s._econShiftAge ?? 0), 0, 60);
    const hierarchyE     = Utils.clamp(s.hierarchyEntrenched ?? 0, 0, 100);
    const wcd            = Utils.clamp(s.wealthCapture?.degree ?? 0, 0, 100);
    const eq             = Utils.clamp(s.educationQuality ?? 50, 0, 100);
    const eh             = Utils.clamp(s.epistemicHealth ?? 50, 0, 100);

    // Pass 9: cultural homogeneity raises inertia (monolithic culture = harder to shift)
    const homo = Utils.clamp(s.culturalHomogeneity?.value ?? 50, 0, 100);

    bi.coefficient = Utils.clamp(
      timeInModel * 0.5 + hierarchyE * 0.3 + wcd * 0.2 + (100 - eq) * 0.1 - eh * 0.1
      + homo * 0.12,
      0, 100
    );

    // Fraction of deferred shift applied per turn:
    // inertia=0 → 25%/turn (~4 turns full); inertia=80 → 5%/turn (~20 turns)
    const fraction = Utils.clamp((1 - bi.coefficient / 100) * 0.25, 0.01, 0.30);

    let pendingMagnitude = 0;
    for (const key of Object.keys(bi.deferredShift)) {
      const remaining = bi.deferredShift[key] ?? 0;
      if (Math.abs(remaining) < 0.01) { bi.deferredShift[key] = 0; continue; }

      const apply = Math.sign(remaining) * Math.min(Math.abs(remaining), Math.abs(remaining) * fraction);
      if (b[key] !== undefined) b[key] = Utils.clamp(b[key] + apply, 0, 100);
      bi.deferredShift[key] = remaining - apply;
      pendingMagnitude += Math.abs(bi.deferredShift[key]);
    }

    // Ring buffer
    if (!Array.isArray(bi.inertiaHistory)) bi.inertiaHistory = [];
    bi.inertiaHistory.push({ turn: this.game?.turnCount ?? 0, coefficient: Math.round(bi.coefficient), pendingMagnitude: Math.round(pendingMagnitude * 10) / 10 });
    if (bi.inertiaHistory.length > 50) bi.inertiaHistory.shift();
  }

  // P8-2: Facilitation Measures — deliberate interventions that accelerate
  // behavioral realignment after paradigm change. Bounded by EH (amplifier)
  // and structural conditions (ceiling). Distinct from propaganda.
  _processFacilitation(civ) {
    const s = civ?.state;
    const fs = s?.facilitationState;
    if (!s || !fs) return;
    const catalog = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];

    // Compute structural ceiling per behavior from economic model + wealth capture
    const econModel  = (typeof ECONOMIC_MODELS !== 'undefined') ? ECONOMIC_MODELS[civ.economic?.modelId] : null;
    const wcFrac     = Utils.clamp((s.wealthCapture?.degree ?? 0) / 100, 0, 1);
    const bKeys      = ['cooperation','competition','mutualAid','acquisitiveness','conformity','innovation','empathy','deference','individualism','collectivism'];
    for (const key of bKeys) {
      const modelMax = econModel?.behaviorModifiers?.[key] !== undefined
        ? Utils.clamp(50 + (econModel.behaviorModifiers[key] ?? 0), 10, 100)
        : 100;
      fs.structuralCeiling[key] = Utils.clamp(modelMax * (1 - wcFrac * 0.6), 10, 100);
    }

    const eh       = Utils.clamp(s.epistemicHealth ?? 50, 0, 100);
    const cg       = s.culturalGap;
    const bi       = s.behaviorInertia;
    let totalCynicRed = 0;
    let totalCoopBoost = 0;
    let measuresActive = 0;

    for (let i = fs.activeMeasures.length - 1; i >= 0; i--) {
      const am  = fs.activeMeasures[i];
      const def = catalog.find(m => m.id === am.measureId);
      if (!def) { fs.activeMeasures.splice(i, 1); continue; }

      // Check unavailability conditions
      let blocked = false;
      for (const cond of (def.unavailableWhen || [])) {
        if (cond === 'feudalDynamic' && s.wealthCapture?.feudalDynamic === true) { blocked = true; break; }
      }
      if (blocked) {
        civ.history?.unshift({ turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0, type: 'facilitation_blocked', text: `${def.label} has been blocked — feudal dynamic conditions prevent civilian facilitation programs.`, color: '#ef4444' });
        fs.activeMeasures.splice(i, 1);
        continue;
      }

      am.turnsActive = (am.turnsActive ?? 0) + 1;
      measuresActive++;

      // EH amplifier: EH=60 → 1.0x; EH=90 → 1.5x; EH=30 → 0.5x
      // Pass 9: heterogeneous civs are slightly more responsive to facilitation
      const homoFacMod = 1.0 + (50 - Utils.clamp(s.culturalHomogeneity?.value ?? 50, 0, 100)) / 500;
      const ehAmp = Utils.clamp(eh / 60 * homoFacMod, 0.05, 1.5);
      const ehMet = eh >= (def.effects.ehRequirement ?? 0);

      // Propaganda risk: if EH < 30 and propagandaRisk > 0 → backfire
      const propagandaBackfire = def.propagandaRisk > 0 && eh < 30;

      const dur = def.durationTurns > 0 ? def.durationTurns : 1;

      if (propagandaBackfire) {
        // Backfire: media campaigns in low-EH environment generate cynicism
        if (cg) cg.cynicismLevel = Utils.clamp(cg.cynicismLevel + 1.5, 0, 100);
      } else {
        // Cynicism reduction (50% effective even below EH requirement)
        if (cg && def.effects.cynicismReduction) {
          const cynicEff = ehMet ? def.effects.cynicismReduction * ehAmp : def.effects.cynicismReduction * ehAmp * 0.5;
          cg.cynicismLevel = Utils.clamp(cg.cynicismLevel - cynicEff / dur, 0, 100);
          totalCynicRed += cynicEff / dur;
        }

        if (ehMet) {
          // Gap narrowing: pull reinforced values toward stated values
          if (cg && def.effects.gapNarrowingRate) {
            const rate = def.effects.gapNarrowingRate * ehAmp;
            for (const k of Object.keys(cg.statedValues ?? {})) {
              if (cg.reinforcedValues?.[k] !== undefined) {
                const diff = (cg.statedValues[k] ?? 50) - (cg.reinforcedValues[k] ?? 50);
                cg.reinforcedValues[k] = Utils.clamp(cg.reinforcedValues[k] + diff * rate, 0, 100);
              }
            }
          }

          // Cooperation boost — goes through deferred shift (respects inertia) unless structuralCeiling: false
          if (def.effects.cooperationBoost && bi?.deferredShift) {
            const boost = def.effects.cooperationBoost * ehAmp / dur;
            if (def.effects.structuralCeiling === false) {
              // Structural intervention: apply directly, bypass ceiling
              if (s.behaviorReinforcement?.cooperation !== undefined)
                s.behaviorReinforcement.cooperation = Utils.clamp(s.behaviorReinforcement.cooperation + boost, 0, 100);
            } else {
              bi.deferredShift.cooperation = (bi.deferredShift.cooperation ?? 0) + boost;
              // Enforce structural ceiling on deferred target
              const ceiling = fs.structuralCeiling.cooperation ?? 100;
              const projected = (s.behaviorReinforcement?.cooperation ?? 50) + (bi.deferredShift.cooperation ?? 0);
              if (projected > ceiling) bi.deferredShift.cooperation = Math.max(0, ceiling - (s.behaviorReinforcement?.cooperation ?? 50));
            }
            totalCoopBoost += boost;
          }
          if (def.effects.mutualAidBoost && bi?.deferredShift) {
            bi.deferredShift.mutualAid = (bi.deferredShift.mutualAid ?? 0) + def.effects.mutualAidBoost * ehAmp / dur;
          }
          if (def.effects.acquisitivenessReduction && bi?.deferredShift) {
            bi.deferredShift.acquisitiveness = (bi.deferredShift.acquisitiveness ?? 0) - def.effects.acquisitivenessReduction * ehAmp / dur;
          }
        }
      }

      // Decrement duration
      if (def.durationTurns > 0) {
        am.turnsRemaining = Math.max(0, (am.turnsRemaining ?? def.durationTurns) - 1);
        if (am.turnsRemaining <= 0) {
          fs.activeMeasures.splice(i, 1);
        }
      }
    }

    // Ring buffer
    if (!Array.isArray(fs.facilitationHistory)) fs.facilitationHistory = [];
    fs.facilitationHistory.push({ turn: this.game?.turnCount ?? 0, measuresActive, totalCynicismReduction: Math.round(totalCynicRed * 10) / 10, totalCoopBoost: Math.round(totalCoopBoost * 10) / 10 });
    if (fs.facilitationHistory.length > 50) fs.facilitationHistory.shift();
  }

  // Public method: activate a facilitation measure (called from game.js event handler)
  activateFacilitationMeasure(civ, measureId) {
    const s = civ?.state;
    const fs = s?.facilitationState;
    if (!s || !fs) return false;
    const catalog = (typeof FACILITATION_MEASURES !== 'undefined') ? FACILITATION_MEASURES : [];
    const def = catalog.find(m => m.id === measureId);
    if (!def) return false;
    if (fs.activeMeasures.find(m => m.measureId === measureId)) return false; // already active
    fs.activeMeasures.push({ measureId, turnsActive: 0, turnsRemaining: def.durationTurns > 0 ? def.durationTurns : null, totalEffect: 0 });
    civ.history?.unshift({ turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0, type: 'facilitation_activated', text: `${def.label} activated. ${def.description}`, color: '#22c55e' });
    return true;
  }

  // Public method: deactivate a facilitation measure
  deactivateFacilitationMeasure(civ, measureId) {
    const s = civ?.state;
    const fs = s?.facilitationState;
    if (!s || !fs) return false;
    const idx = fs.activeMeasures.findIndex(m => m.measureId === measureId);
    if (idx === -1) return false;
    fs.activeMeasures.splice(idx, 1);
    return true;
  }

  // P8-3: Cooperative Outcomes — outcomes-feedback mechanism.
  // Does cooperative behavior under the current economic model produce material
  // gains for cooperators? If yes → reinforce; if no → weaken + raise cynicism.
  _processCooperativeOutcomes(civ) {
    const s = civ?.state;
    const co = s?.cooperativeOutcomes;
    const bi = s?.behaviorInertia;
    const cg = s?.culturalGap;
    if (!s || !co) return;

    const econ = civ.economic?.modelId ?? 'mixed';
    const econModel = (typeof ECONOMIC_MODELS !== 'undefined') ? ECONOMIC_MODELS[econ] : null;
    // Economic model cooperation modifier: normalize to 0–100 (base 50 ± modifiers)
    const econCoopMod = econModel?.behaviorModifiers?.cooperation !== undefined
      ? Utils.clamp(50 + (econModel.behaviorModifiers.cooperation ?? 0), 0, 100) : 50;

    const equality  = Utils.clamp(s.equalityIndex ?? 50, 0, 100);
    const wellbeing = Utils.clamp(s.averageWellbeing ?? 50, 0, 100);
    const wcd       = Utils.clamp(s.wealthCapture?.degree ?? 0, 0, 100);

    co.coopOutcomeScore = Utils.clamp(
      econCoopMod * 0.35 + equality * 0.25 + wellbeing * 0.20 + (100 - wcd) * 0.20,
      0, 100
    );

    if (co.coopOutcomeScore > 60) {
      const boost = (co.coopOutcomeScore - 60) / 40 * 0.8;
      co.feedback = 'reinforcing';
      co.feedbackMagnitude = Math.round(boost * 100) / 100;
      if (bi?.deferredShift) bi.deferredShift.cooperation = (bi.deferredShift.cooperation ?? 0) + boost;
      co.cumulativeReinforcement = (co.cumulativeReinforcement ?? 0) + boost;
    } else if (co.coopOutcomeScore < 40) {
      const drain = (40 - co.coopOutcomeScore) / 40 * 0.6;
      co.feedback = 'weakening';
      co.feedbackMagnitude = Math.round(drain * 100) / 100;
      if (bi?.deferredShift) bi.deferredShift.cooperation = (bi.deferredShift.cooperation ?? 0) - drain;
      co.cumulativeReinforcement = (co.cumulativeReinforcement ?? 0) - drain;
      // Direct cynicism pressure when cooperative effort doesn't pay off
      if (cg) cg.cynicismLevel = Utils.clamp(cg.cynicismLevel + (40 - co.coopOutcomeScore) / 100 * 0.5, 0, 100);
    } else {
      co.feedback = 'neutral';
      co.feedbackMagnitude = 0;
    }

    co.coopOutcomeScore = Math.round(co.coopOutcomeScore);
    if (!Array.isArray(co.history)) co.history = [];
    co.history.push({ turn: this.game?.turnCount ?? 0, score: co.coopOutcomeScore, feedback: co.feedback, magnitude: co.feedbackMagnitude });
    if (co.history.length > 50) co.history.shift();
  }

  // P8-4: Threshold Detection — evaluate named turning-point thresholds
  // against current civ state and fire events when crossed.
  _processThresholds(civ) {
    const s  = civ?.state;
    const te = s?.thresholdEvents;
    if (!s || !te) return;

    const defs = (typeof THRESHOLD_DEFINITIONS !== 'undefined') ? THRESHOLD_DEFINITIONS : [];
    if (!Array.isArray(te.fired))    te.fired = [];
    if (typeof te._cooldowns !== 'object' || te._cooldowns === null) te._cooldowns = {};

    // Decrement cooldowns
    for (const id of Object.keys(te._cooldowns)) {
      te._cooldowns[id] = (te._cooldowns[id] ?? 0) - 1;
      if (te._cooldowns[id] <= 0) delete te._cooldowns[id];
    }

    for (const def of defs) {
      // Skip if in cooldown
      if (te._cooldowns[def.id] > 0) continue;

      // Evaluate trigger
      let triggered = false;
      if (typeof def.customCheck === 'function') {
        try { triggered = def.customCheck(s); } catch(e) { /* ignore */ }
      } else if (def.field) {
        // Resolve dot-notation field path
        const parts = def.field.split('.');
        let val = s;
        for (const p of parts) { val = val?.[p]; if (val === undefined) break; }
        if (val !== undefined) {
          if      (def.trigger === '>=')  triggered = val >= def.value;
          else if (def.trigger === '<=')  triggered = val <= def.value;
          else if (def.trigger === '===') triggered = val === def.value;
          else if (def.trigger === '>')   triggered = val >  def.value;
          else if (def.trigger === '<')   triggered = val <  def.value;
        }
      }

      if (!triggered) continue;

      // Fire event
      const text = typeof def.text === 'function' ? def.text(s) : def.label;
      const event = {
        thresholdId: def.id,
        turn:       this.game?.turnCount ?? 0,
        year:       this.game?.currentYear ?? 0,
        label:      def.label,
        text,
        severity:   def.severity ?? 'info',
        color:      def.color ?? '#f59e0b',
      };

      te.fired.unshift(event);
      if (te.fired.length > 50) te.fired.pop();

      civ.history?.unshift({ turn: event.turn, year: event.year, type: 'threshold_event', text, color: def.color ?? '#f59e0b' });

      // Set cooldown
      te._cooldowns[def.id] = def.cooldown ?? 15;
    }
  }

  // P8-5: Consequence Deficit — unchecked abuse of power reduces expected cost
  // of future abuse. Deficit accumulates when accountability fails;
  // accelerationMultiplier is applied to capture/corruption growth rates.
  _processConsequenceDeficit(civ) {
    const s  = civ?.state;
    const cd = s?.consequenceDeficit;
    if (!s || !cd) return;

    const iq   = Utils.clamp(s.institutionalQuality ?? 50, 0, 100);
    const eh   = Utils.clamp(s.epistemicHealth ?? 50, 0, 100);
    const wcd  = Utils.clamp(s.wealthCapture?.degree ?? 0, 0, 100);
    const corr = Utils.clamp(s.corruptionIndex ?? 0, 0, 100);

    // Accountability strength: 0 = no accountability, 1 = full
    const accountabilityStrength = Utils.clamp((iq - 30) / 70 * 0.6 + (eh - 30) / 70 * 0.4, 0, 1);

    // Abuse pressure: fraction of system operating without accountability
    const abusePressure = Utils.clamp(wcd / 100 * 0.5 + corr / 100 * 0.5, 0, 1);

    // Deficit change this turn (accumulation > recovery — asymmetric by design)
    const deficitGain  = abusePressure * (1 - accountabilityStrength) * 3.0;
    const deficitLoss  = accountabilityStrength * 2.0;
    const deficitDelta = deficitGain - deficitLoss;

    const prevLevel = cd.level;
    cd.level = Utils.clamp(cd.level + deficitDelta, 0, 100);

    // Acceleration multiplier: at deficit=0 → 1.0x; at deficit=50 → 1.75x; at deficit=100 → 2.5x
    cd.accelerationMultiplier = Math.round((1.0 + (cd.level / 100) * 1.5) * 100) / 100;

    // Track consecutive turns without meaningful accountability
    if (accountabilityStrength < 0.3) {
      cd.turnsWithoutAccountability = (cd.turnsWithoutAccountability ?? 0) + 1;
    } else {
      if ((cd.turnsWithoutAccountability ?? 0) > 0) {
        cd.lastAccountabilityEvent = this.game?.turnCount ?? 0;
      }
      cd.turnsWithoutAccountability = 0;
    }

    // Accountability breakthrough: strong accountability when deficit is high
    if (accountabilityStrength > 0.7 && cd.level > 20) {
      const breakthrough = Math.min(10, cd.level * 0.15);
      cd.level = Utils.clamp(cd.level - breakthrough, 0, 100);
      if (!Array.isArray(cd.accountabilityHistory)) cd.accountabilityHistory = [];
      cd.accountabilityHistory.unshift({ turn: this.game?.turnCount ?? 0, type: 'breakthrough', deficitBefore: Math.round(prevLevel), deficitAfter: Math.round(cd.level) });
      if (cd.accountabilityHistory.length > 20) cd.accountabilityHistory.pop();
      civ.history?.unshift({ turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0, type: 'accountability_event', text: `Accountability breakthrough: consequence deficit reduced from ${Math.round(prevLevel)} to ${Math.round(cd.level)}. Institutional integrity is reasserting itself.`, color: '#22c55e' });
    }

    // Restoration event: deficit falls below 20 after being above 50
    if (prevLevel >= 50 && cd.level < 20) {
      civ.history?.unshift({ turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0, type: 'accountability_restored', text: `Accountability restored: consequence deficit has fallen below critical threshold. Power concentration dynamics are decelerating.`, color: '#22c55e' });
    }

    // Cross-effects: high deficit erodes institutions and epistemic health
    if (cd.level > 70) {
      if (s.institutionalQuality !== undefined) s.institutionalQuality = Utils.clamp(s.institutionalQuality - 0.5, 0, 100);
    }
    if (cd.level > 50) {
      if (s.epistemicHealth !== undefined) s.epistemicHealth = Utils.clamp(s.epistemicHealth - 0.3, 0, 100);
    }

    // Ring buffer
    if (!Array.isArray(cd.deficitHistory)) cd.deficitHistory = [];
    cd.deficitHistory.push({ turn: this.game?.turnCount ?? 0, level: Math.round(cd.level), multiplier: cd.accelerationMultiplier });
    if (cd.deficitHistory.length > 50) cd.deficitHistory.shift();
  }

  // ============================================================
  // Pass 9 Methods — Cultural Homogeneity + Behavioral Contagion
  // ============================================================

  // P9-1: Initialize culturalHomogeneity.value from founding conditions.
  // Called once per civ at game start (from simulation.js _initGame or equivalent).
  // Governance model + religion dominance + economic model → 10–90.
  _initCulturalHomogeneity(civ) {
    if (!civ?.state?.culturalHomogeneity) return;
    const govId  = civ.governance?.modelId ?? '';
    const econId = civ.economic?.modelId ?? '';
    const relDom = civ.religion?.dominance ?? 0;

    // Governance base
    let base = 50;
    if (['theocratic'].includes(govId))                             base = 72;
    else if (['absolute_monarchy','chiefdom'].includes(govId))      base = 65;
    else if (['monarchy','oligarchy','plutocracy'].includes(govId)) base = 58;
    else if (['technocracy'].includes(govId))                       base = 52;
    else if (['representative_democracy'].includes(govId))          base = 42;
    else if (['direct_democracy','council_consensus','flat_consensus'].includes(govId)) base = 32;
    else if (['shadow_government_covert','shadow_government_complicit'].includes(govId)) base = 62;

    // Religion modifier
    let relMod = 0;
    if (relDom > 70) relMod = +10;
    else if (relDom < 30) relMod = -5;

    // Economic modifier
    let econMod = 0;
    if (['gift','commons'].includes(econId))                              econMod = -10;
    else if (['command'].includes(econId))                                econMod = +15;
    else if (['laissez_faire','market_competitive'].includes(econId))     econMod = +5;

    civ.state.culturalHomogeneity.value = Utils.clamp(base + relMod + econMod, 10, 90);
  }

  // P9-2: Per-turn drift of culturalHomogeneity.
  // Called in the per-civ loop after all other per-civ processing.
  _processCulturalHomogeneity(civ) {
    const s = civ?.state;
    const ch = s?.culturalHomogeneity;
    if (!s || !ch) return;

    const govId = civ.governance?.modelId ?? '';
    let drift = 0;

    // Toward heterogeneity (diverse subcultures)
    const tradeDep = s.tradeDependency ?? 20;
    if (tradeDep > 50) drift -= 0.06 * ((tradeDep - 50) / 50);
    if (civ.migration?.lastEvent === 'influx') drift -= 0.12;
    if (govId === 'direct_democracy')          drift -= 0.05;
    if (['council_consensus','flat_consensus'].includes(govId)) drift -= 0.07;
    if ((s.artsSupport ?? 0) > 70 && (s.artsFreedom ?? 0) > 70) drift -= 0.05;
    if ((s.scienceFreedom ?? 0) > 70) drift -= 0.03;

    // Toward homogeneity (dominant monoculture)
    if (govId === 'theocratic')                                       drift += 0.10;
    if (['shadow_government_covert','shadow_government_complicit'].includes(govId)) drift += 0.07;
    if (['command','absolute_monarchy'].includes(govId))              drift += 0.08;
    if ((s.wealthCapture?.degree ?? 0) > 60)                         drift += 0.04;
    if ((s.epistemicHealth ?? 50) < 30)                              drift += 0.06;
    if (s.informationEcosystem === 'state_controlled')               drift += 0.05;

    // Clamp net drift to ±0.20/turn
    drift = Utils.clamp(drift, -0.20, 0.20);
    ch.value = Utils.clamp(ch.value + drift, 0, 100);

    // Ring buffer
    if (!Array.isArray(ch.history)) ch.history = [];
    ch.history.push({ turn: this.game?.turnCount ?? 0, year: this.game?.currentYear ?? 0, value: Math.round(ch.value * 10) / 10 });
    if (ch.history.length > 50) ch.history.shift();
  }

  // P9-3: Cross-civilization behavioral contagion.
  // Global method — iterates all civ pairs.
  // Called after _processInteractions in processTurn step 4b.
  _processBehavioralContagion() {
    const civs = this.game?.civilizations;
    if (!civs || civs.length < 2) return;

    // Reset per-turn contagion accumulators
    for (const civ of civs) {
      civ._p9CoopDelta     = 0;
      civ._p9CynicismDelta = 0;
      civ._p9EHDelta       = 0;
    }

    // Apply pairwise (bidirectional — each direction called separately)
    for (let i = 0; i < civs.length; i++) {
      for (let j = i + 1; j < civs.length; j++) {
        this._applyContagionPair(civs[i], civs[j]);
        this._applyContagionPair(civs[j], civs[i]);
      }
    }

    // Record per-turn ring buffer entry for each civ
    const turn = this.game.turnCount ?? 0;
    const year = this.game.currentYear ?? 0;
    for (const civ of civs) {
      const cs = civ.state?.contagionState;
      if (!cs) continue;
      if (!Array.isArray(cs.contagionHistory)) cs.contagionHistory = [];
      cs.contagionHistory.push({
        turn, year,
        netCoopDelta:     Math.round((civ._p9CoopDelta ?? 0) * 10000) / 10000,
        netCynicismDelta: Math.round((civ._p9CynicismDelta ?? 0) * 10000) / 10000,
        netEHDelta:       Math.round((civ._p9EHDelta ?? 0) * 10000) / 10000,
      });
      if (cs.contagionHistory.length > 50) cs.contagionHistory.shift();
      // Clean up scratch props
      delete civ._p9CoopDelta;
      delete civ._p9CynicismDelta;
      delete civ._p9EHDelta;
    }
  }

  // P9-4: Apply contagion from one source to one target (one direction).
  _applyContagionPair(source, target) {
    const s = source?.state;
    const t = target?.state;
    if (!s || !t) return;

    const cfg = (typeof CONTAGION_CONFIG !== 'undefined') ? CONTAGION_CONFIG : {};
    const baseRateScaling     = cfg.baseRateScaling     ?? 0.025;
    const cynicismSpeedFactor = cfg.cynicismSpeedFactor ?? 0.55;
    const ehSpeedFactor       = cfg.ehSpeedFactor       ?? 0.35;
    const minAttitudeFactor   = cfg.minAttitudeFactor   ?? 0.08;
    const warDampeningFactor  = cfg.warDampeningFactor  ?? 0.04;
    const burstThreshold      = cfg.contagionBurstThreshold ?? 30;

    // ── Contact rate factors ────────────────────────────────────────────────
    const tradeDep = Utils.clamp(((s.tradeDependency ?? 20) + (t.tradeDependency ?? 20)) / 2, 0, 100);
    const rel = target.relations?.get(source.id);
    const attitude = rel?.attitude ?? 0;
    const atWar    = rel?.war === true;

    const attitudeFactor = atWar
      ? warDampeningFactor
      : Utils.clamp((attitude + 100) / 200, minAttitudeFactor, 1.0);

    // ── Receiver receptivity from cultural homogeneity ─────────────────────
    // homo=0 → receptivity=1.00; homo=50 → 0.67; homo=100 → 0.33
    const homo        = Utils.clamp(t.culturalHomogeneity?.value ?? 50, 0, 100);
    const receptivity = Utils.clamp(1.0 - homo / 150, 0.33, 1.0);

    // ── Base rate ──────────────────────────────────────────────────────────
    const baseRate = (tradeDep / 100) * attitudeFactor * receptivity * baseRateScaling;
    if (baseRate < 0.00005) return; // negligible

    const turn = this.game?.turnCount ?? 0;

    // ── Vector 1: Cooperation (→ deferredShift — subject to inertia) ──────
    // Theocratic civs suppress outgoing cooperation to hostile neighbors
    let sourceCoop = s.behaviorReinforcement?.cooperation ?? 50;
    if (s.theocraticEmpathyBias?.active && attitude < 0) {
      sourceCoop = Math.min(sourceCoop, s.theocraticEmpathyBias.outGroupEmpathy ?? sourceCoop);
    }
    const targetCoop = t.behaviorReinforcement?.cooperation ?? 50;
    const coopDelta  = (sourceCoop - targetCoop) * baseRate;

    if (Math.abs(coopDelta) > 0.0005 && t.behaviorInertia?.deferredShift) {
      t.behaviorInertia.deferredShift.cooperation = Utils.clamp(
        (t.behaviorInertia.deferredShift.cooperation ?? 0) + coopDelta, -50, 50
      );
      target._p9CoopDelta = (target._p9CoopDelta ?? 0) + coopDelta;

      // Log surge event if gap is large and relations are warm
      if (Math.abs(sourceCoop - targetCoop) > burstThreshold && attitude > 60) {
        this._logContagionEvent(source, target, 'cooperation', coopDelta);
      }

      // Record received influence
      const ri = t.contagionState?.receivedInfluences;
      if (ri) {
        ri.push({ turn, sourceCivId: source.id, sourceCivName: source.name, vector: 'cooperation', delta: Math.round(coopDelta * 10000) / 10000, absorbed: Math.round(coopDelta * 10000) / 10000 });
        if (ri.length > 10) ri.shift();
      }
      // Record emitted influence
      const ei = s.contagionState?.emittedInfluences;
      if (ei) {
        ei.push({ turn, targetCivId: target.id, targetCivName: target.name, vector: 'cooperation', delta: Math.round(coopDelta * 10000) / 10000 });
        if (ei.length > 10) ei.shift();
      }
    }

    // ── Vector 2: Cynicism (direct, slower) ───────────────────────────────
    const sourceCynicism = s.culturalGap?.cynicismLevel ?? 0;
    const targetCynicism = t.culturalGap?.cynicismLevel ?? 0;
    const cynicismDelta  = (sourceCynicism - targetCynicism) * baseRate * cynicismSpeedFactor;
    if (Math.abs(cynicismDelta) > 0.0005 && t.culturalGap) {
      t.culturalGap.cynicismLevel = Utils.clamp(targetCynicism + cynicismDelta, 0, 100);
      target._p9CynicismDelta = (target._p9CynicismDelta ?? 0) + cynicismDelta;
    }

    // ── Vector 3: Epistemic Health (direct, slowest) ──────────────────────
    const sourceEH = s.epistemicHealth ?? 50;
    const targetEH = t.epistemicHealth ?? 50;
    const ehDelta  = (sourceEH - targetEH) * baseRate * ehSpeedFactor;
    if (Math.abs(ehDelta) > 0.0005) {
      t.epistemicHealth = Utils.clamp(targetEH + ehDelta, 0, 100);
      target._p9EHDelta = (target._p9EHDelta ?? 0) + ehDelta;
    }
  }

  // P9-5: Log a contagion surge event to target's history.
  _logContagionEvent(source, target, vector, delta) {
    if (!target?.addHistoryEntry) return;
    const label = delta > 0 ? 'Cooperative Norm Surge' : 'Cynicism Spread';
    const text  = delta > 0
      ? `${source.name}'s cooperative norms are significantly influencing ${target.name} through sustained cultural contact.`
      : `Cynicism spreading from ${source.name} is being absorbed by ${target.name} through trade and diplomatic contact.`;
    target.addHistoryEntry(this.game?.currentYear ?? 0, label, text, 'info');
  }

  // P9-6: Full Track 2 CSV export for a civilization.
  // All 13 sections; file name includes civ name, turn, and research seed.
  _exportTrack2CSV(civ) {
    if (!civ) return;
    const s    = civ.state;
    const seed = this.game?.researchSeed ?? 'unknown';
    const lines = [];

    const section = (name) => { lines.push(''); lines.push(`## ${name}`); };
    const row = (...cells) => lines.push(
      cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')
    );

    // ── RUN_METADATA ──────────────────────────────────────────────
    section('RUN_METADATA');
    row('key', 'value');
    row('seed',           seed);
    row('civ_name',       civ.name);
    row('game_year',      this.game?.currentYear ?? '');
    row('turn',           this.game?.turnCount ?? '');
    row('economic_model', civ.economic?.modelId ?? '');
    row('governance_model', civ.governance?.modelId ?? '');
    row('export_timestamp', new Date().toISOString());

    // ── ECONOMIC_HISTORY ──────────────────────────────────────────
    section('ECONOMIC_HISTORY');
    row('turn','year','gdp_proxy','wellbeing','equality','trade_dependency','debt_load');
    for (const e of (s?.economicHistory ?? [])) {
      row(e.turn??'', e.year??'', e.gdpProxy??'', e.wellbeing??'', e.equality??'', e.tradeDependency??'', e.debtLoad??'');
    }

    // ── EMPATHY_HISTORY ───────────────────────────────────────────
    section('EMPATHY_HISTORY');
    row('turn','year','empathy','leader_empathy','elite','disenfranchised','ri_combined');
    for (const e of (s?.empathyHistory ?? [])) {
      row(e.turn??'', e.year??'', e.empathy??'', e.leaderEmpathy??'', e.elite??'', e.disenfranchised??'', e.combined??'');
    }

    // ── CULTURAL_GAP_HISTORY ──────────────────────────────────────
    section('CULTURAL_GAP_HISTORY');
    row('turn','year','gap_score','dissonance','cynicism','rev_consciousness','shift_readiness');
    for (const e of (s?.culturalGap?.history ?? [])) {
      row(e.turn??'', e.year??'', e.gapScore??'', e.dissonance??'', e.cynicism??'', e.revConsciousness??'', e.readiness??'');
    }

    // ── WEALTH_CAPTURE_HISTORY ────────────────────────────────────
    section('WEALTH_CAPTURE_HISTORY');
    row('turn','year','degree','institutional','electoral','media','feudal_dynamic');
    for (const e of (s?.wealthCapture?.history ?? [])) {
      row(e.turn??'', e.year??'', e.degree??'', e.institutionalCapture??'', e.electoralCapture??'', e.mediaCapture??'', e.feudalDynamic??'');
    }

    // ── BEHAVIORAL_INERTIA_HISTORY ────────────────────────────────
    section('BEHAVIORAL_INERTIA_HISTORY');
    row('turn','year','coefficient','pending_magnitude');
    for (const e of (s?.behaviorInertia?.inertiaHistory ?? [])) {
      row(e.turn??'', e.year??'', e.coefficient??'', e.pendingMagnitude??'');
    }

    // ── FACILITATION_HISTORY ──────────────────────────────────────
    section('FACILITATION_HISTORY');
    row('turn','year','measures_active','cynicism_reduction','coop_boost');
    for (const e of (s?.facilitationState?.facilitationHistory ?? [])) {
      row(e.turn??'', e.year??'', e.measuresActive??'', e.totalCynicismReduction??'', e.totalCoopBoost??'');
    }

    // ── COOP_OUTCOMES_HISTORY ─────────────────────────────────────
    section('COOP_OUTCOMES_HISTORY');
    row('turn','year','coop_outcome_score','feedback','magnitude','cumulative_reinforcement');
    for (const e of (s?.cooperativeOutcomes?.history ?? [])) {
      row(e.turn??'', e.year??'', e.score??'', e.feedback??'', e.magnitude??'', e.cumulativeReinforcement??'');
    }

    // ── DEFICIT_HISTORY ───────────────────────────────────────────
    section('DEFICIT_HISTORY');
    row('turn','year','deficit_level','acceleration_multiplier');
    for (const e of (s?.consequenceDeficit?.deficitHistory ?? [])) {
      row(e.turn??'', e.year??'', e.level??'', e.multiplier??'');
    }

    // ── HOMOGENEITY_HISTORY ───────────────────────────────────────
    section('HOMOGENEITY_HISTORY');
    row('turn','year','cultural_homogeneity');
    for (const e of (s?.culturalHomogeneity?.history ?? [])) {
      row(e.turn??'', e.year??'', e.value??'');
    }

    // ── CONTAGION_HISTORY ─────────────────────────────────────────
    section('CONTAGION_HISTORY');
    row('turn','year','net_coop_delta','net_cynicism_delta','net_eh_delta');
    for (const e of (s?.contagionState?.contagionHistory ?? [])) {
      row(e.turn??'', e.year??'', e.netCoopDelta??'', e.netCynicismDelta??'', e.netEHDelta??'');
    }

    // ── THRESHOLD_EVENTS ──────────────────────────────────────────
    section('THRESHOLD_EVENTS');
    row('turn','year','threshold_id','label','severity');
    for (const e of (s?.thresholdEvents?.fired ?? [])) {
      row(e.turn??'', e.year??'', e.thresholdId??'', e.label??'', e.severity??'');
    }

    // ── HISTORY_EVENTS ────────────────────────────────────────────
    section('HISTORY_EVENTS');
    row('turn','year','title','type');
    for (const e of (civ.history ?? [])) {
      row(e.turn??'', e.year??'', e.title??'', e.type??'');
    }

    // ── Download ──────────────────────────────────────────────────
    const csvText = lines.join('\n');
    const blob    = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href     = url;
    a.download = `${civ.name.replace(/\s+/g,'_')}_turn${this.game?.turnCount ?? 0}_seed${seed}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ══════════════════════════════════════════════════════════════
  // BALANCE: Baseline Recovery & Resilience (added for real-world calibration)
  // ══════════════════════════════════════════════════════════════

  // ── Fix 9: Natural Economic Forces ─────────────────────────────
  // In reality, wealth concentration is counteracted by multiple forces:
  // estate division (partible inheritance), progressive taxation, economic
  // competition, creative destruction (Schumpeter), revolution, and natural
  // disasters. Corruption is counteracted by: institutional reform, generational
  // change, transparency pressure, and economic necessity (corrupt systems
  // are inefficient and lose competitiveness). Without these forces,
  // wealth concentration and corruption are monotonically increasing.
  _processNaturalEconomicForces(civ) {
    if (!civ.state || !civ.economic) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    let wc = civ.economic.wealthConcentration ?? 30;
    let corr = civ.governance?.corruptionLevel ?? 0;
    const iq = civ.state.institutionalQuality ?? 50;
    const cap = civ.state.stateCapacity ?? 50;
    const trust = civ.state.socialTrust ?? 50;
    const govId = civ.governance?.modelId ?? '';

    // Post-reconstitution momentum: new government honeymoon period
    // Decrement counter and boost institutional quality during momentum
    const momentum = civ.state._reconstitutionMomentum ?? 0;
    if (momentum > 0) {
      civ.state._reconstitutionMomentum = momentum - 1;
      // Boost institutional quality during honeymoon (+1.0/decade)
      civ.state.institutionalQuality = Utils.clamp(
        (civ.state.institutionalQuality ?? 15) + 1.0 * timeScale, 0, 100);
      // Extra corruption decay during reform period
      corr -= 0.5 * timeScale;
    }
    const isDemocratic = ['representative', 'direct_congress', 'flat_consensus', 'rotating'].includes(govId);

    // ── Wealth dispersion forces ──
    // Piketty (2014): r > g concentrates wealth, but taxes/inheritance/shocks
    // disperse it. The 20th century saw massive wealth deconcentration
    // (WWI, WWII, progressive taxation, unions). Gini fell 15-25 pts in
    // most developed nations 1914-1980.

    // Base dispersion: estate division, competition, random shocks, revolution
    // Stronger at higher concentration (more to lose, more targets for reform)
    // At extreme levels (>80), additional pressure from social upheaval, banditry,
    // warlord seizure — even without functioning institutions
    if (wc > 40) {
      let dispersion = 0.5 * ((wc - 40) / 60) * timeScale; // Max ~0.5/decade (increased from 0.3)

      // Extreme concentration: accelerating dispersion (revolution, social collapse,
      // warlord seizure — you can't hold wealth when institutions fail)
      // Historical: French Revolution, Russian Revolution, Chinese land reform
      // R4b: Strengthened — at WC>85, social fabric tears: banditry, elite fragmentation,
      // peasant revolt, flight of productive population. No empire sustained WC>90 long.
      // At WC>90: quadratic acceleration — wealth literally cannot be held (no workers,
      // no merchants, no soldiers willing to serve). This is INDEPENDENT of institutions.
      if (wc > 75) dispersion += 1.0 * ((wc - 75) / 25) * timeScale;
      if (wc > 85) dispersion += 2.0 * ((wc - 85) / 15) * timeScale;
      if (wc > 90) dispersion += 3.0 * ((wc - 90) / 10) * timeScale;

      // Institutional quality is the PRIMARY driver of wealth redistribution.
      // Strong institutions enable: progressive taxation, antitrust regulation,
      // social programs, rule of law, property rights enforcement.
      // This is NOT governance-type-dependent:
      // - China redistributed under Mao (authoritarian)
      // - Singapore has strong redistribution (technocratic)
      // - Scandinavian countries (democratic + high IQ)
      // - US New Deal (democratic but also required strong state capacity)
      // Piketty's insight: it's INSTITUTIONAL capacity for redistribution, not democracy per se
      if (iq > 40) dispersion *= 1.0 + (iq - 40) / 60 * 1.2; // up to 2.2x at iq=100

      // State capacity: ability to IMPLEMENT redistribution policy
      if (cap > 40) dispersion *= 1.0 + (cap - 40) / 60 * 0.5; // up to 1.5x at cap=100

      // Commons/gift economies: structural limits on accumulation
      // This IS a valid economic-model distinction — these models prevent
      // accumulation by design, which is a structural feature not a bias
      const ecoId = civ.economic?.modelId ?? '';
      if (['gift', 'commons', 'labor_credit'].includes(ecoId)) dispersion *= 2.0;

      wc -= dispersion;
    }

    // ── Corruption natural decay ──
    // Corruption is not self-sustaining in the long run. Even without
    // active anti-corruption campaigns, corruption decays through:
    // - Generational change (new officials with different norms)
    // - Economic inefficiency (corrupt systems underperform, creating reform pressure)
    // - International pressure and demonstration effects
    // - Religious/moral movements
    // Historical: Italy's Mani Pulite, Brazil's Lava Jato, South Korea's democratization

    // Base corruption decay: generational change, economic inefficiency
    // Even without institutions, corruption decays because corrupt systems
    // lose competitiveness and new leaders displace old ones
    let corrDecay = 0.3 * timeScale; // -0.3/decade baseline (increased from 0.2)

    // At extreme corruption (>60), accelerating decay — system is self-destructive
    // Corrupt officials fight each other, resources shrink, fewer rents to extract
    if (corr > 60) corrDecay += 0.3 * ((corr - 60) / 40) * timeScale;

    // Institutional quality accelerates corruption decay (Klitgaard: C = M + D - A)
    if (iq > 40) corrDecay += 0.3 * ((iq - 40) / 60) * timeScale;

    // State capacity: ability to enforce anti-corruption measures
    if (cap > 40) corrDecay += 0.2 * ((cap - 40) / 60) * timeScale;

    // Epistemic health (free press, transparency) drives accountability
    // Not governance-dependent: Singapore has low corruption without Western democracy;
    // China's anti-corruption campaigns under Xi; Hong Kong ICAC under British rule
    const eh = civ.state.epistemicHealth ?? 50;
    if (eh > 40) corrDecay += 0.3 * ((eh - 40) / 60) * timeScale;

    // High trust: social norms against corruption (Uslaner 2008)
    if (trust > 50) corrDecay += 0.2 * ((trust - 50) / 50) * timeScale;

    corr -= corrDecay;

    if (civ.economic) civ.economic.wealthConcentration = Utils.clamp(wc, 0, 93);
    // Apply corruption decay to ALL corruption fields (governance, state, and index)
    // The simulation has multiple corruption tracking fields that must stay in sync
    if (civ.governance) civ.governance.corruptionLevel = Utils.clamp(corr, 0, 90); // Cap at 90 for all governance
    if (civ.state.corruptionLevel !== undefined) {
      civ.state.corruptionLevel = Utils.clamp(
        (civ.state.corruptionLevel ?? 0) - corrDecay, 0, 90);
    }
    if (civ.state.corruptionIndex !== undefined) {
      civ.state.corruptionIndex = Utils.clamp(
        (civ.state.corruptionIndex ?? 0) - corrDecay * 0.5, 0, 100);
    }

    // Institutional quality absolute floor: even the simplest societies have
    // SOME institutional structures — religious courts, tribal councils, market customs.
    // IQ=0 means literally no institutions, which doesn't exist in reality.
    if ((civ.state.institutionalQuality ?? 0) < 10) {
      civ.state.institutionalQuality = Utils.clamp(
        (civ.state.institutionalQuality ?? 0) + 0.5 * timeScale, 0, 100);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ECOLOGICAL SYSTEMS: Biodiversity & Ocean Health
  // ══════════════════════════════════════════════════════════════

  // ── Biodiversity & Ecosystem Services ─────────────────────────
  // Biodiversity is derived from forest health, pollution, and ecological pressure.
  // It provides ecosystem services: pollination → food security, water filtration,
  // soil formation, disease regulation, climate regulation.
  // When biodiversity drops, these services degrade — a "silent crisis" that
  // compounds all other ecological problems.
  // References: IPBES (2019), Millennium Ecosystem Assessment (2005),
  // Rockström et al. (2009) planetary boundaries framework.
  _processBiodiversity(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const forests = civ.state.resourceDepletion?.forests ?? 100;
    const pollution = civ.state.pollutionIndex ?? 0;
    const waste = civ.state.wasteAccumulation ?? 0;
    const overshoot = civ.state.overshootRatio ?? 0.5;

    // Compute biodiversity index (0-100) from ecological indicators
    // Forests are the primary habitat; pollution and waste destroy ecosystems
    let biodiversity = civ.state.biodiversityIndex ?? 80;

    // Forest health is the primary driver (habitat loss is #1 cause of extinction)
    // IPBES: 75% of land surface significantly altered by human actions
    const forestTarget = forests * 0.7 + 30; // at forests=100 → target=100, forests=0 → target=30
    // Biodiversity drifts toward target (slow — extinction is faster than speciation)
    if (biodiversity > forestTarget) {
      // Biodiversity declining — extinction faster than recovery
      biodiversity -= Math.min(1.5, (biodiversity - forestTarget) * 0.05) * timeScale;
    } else if (biodiversity < forestTarget) {
      // Biodiversity recovering — speciation/recolonization is VERY slow
      // Full recovery from mass extinction takes 5-10 million years
      // Partial recovery (recolonization) takes centuries
      biodiversity += Math.min(0.3, (forestTarget - biodiversity) * 0.01) * timeScale;
    }

    // Pollution destroys biodiversity (pesticides → insect collapse, heavy metals → fish kills)
    if (pollution > 30) {
      biodiversity -= 0.3 * ((pollution - 30) / 70) * timeScale;
    }

    // Overshoot pressure (habitat conversion for agriculture/industry)
    if (overshoot > 0.8) {
      biodiversity -= 0.2 * ((overshoot - 0.8) / 0.5) * timeScale;
    }

    biodiversity = Utils.clamp(biodiversity, 5, 100);
    civ.state.biodiversityIndex = biodiversity;

    // ── Ecosystem service effects ──
    // Pollination: biodiversity < 50 reduces food security
    // IPBES: 75% of food crops depend on animal pollination
    if (biodiversity < 50) {
      const pollinationLoss = (50 - biodiversity) / 50; // 0 at bio=50, 1 at bio=0
      civ.state.foodSecurity = Utils.clamp(
        (civ.state.foodSecurity ?? 60) - pollinationLoss * 3 * timeScale, 0, 100);
    }

    // Disease regulation: low biodiversity increases disease burden
    // Keesing et al. (2010): biodiversity loss increases infectious disease transmission
    if (biodiversity < 40) {
      civ.state.diseaseBurden = Utils.clamp(
        (civ.state.diseaseBurden ?? 50) + 0.2 * ((40 - biodiversity) / 40) * timeScale, 0, 100);
    }

    // Ecological capacity: biodiversity supports carrying capacity
    // Low biodiversity reduces soil formation, water filtration, carbon sequestration
    if (biodiversity < 30) {
      civ.state.ecologicalCapacity = Utils.clamp(
        (civ.state.ecologicalCapacity ?? 100) - 0.5 * timeScale, 0, 200);
    }
  }

  // ── Ocean Health & Fisheries ──────────────────────────────────
  // Oceans provide: protein (fisheries), climate regulation (CO2 absorption),
  // oxygen production, weather patterns, coastal protection.
  // Threats: acidification (CO2 absorption), overfishing, pollution runoff,
  // temperature rise (coral bleaching), plastic waste.
  // References: IPCC Ocean/Cryosphere report (2019), FAO SOFIA (2020).
  _processOceanHealth(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const pollution = civ.state.pollutionIndex ?? 0;
    const gwContrib = civ.state.globalWarmingContribution ?? 0;
    const waste = civ.state.wasteAccumulation ?? 0;
    const pop = civ.state.population ?? 500;
    const tech = civ.state.technologyLevel ?? 1;

    // Ocean health index (0-100)
    let oceanHealth = civ.state.oceanHealthIndex ?? 90;

    // Ocean acidification from CO2 (primary threat to marine ecosystems)
    // Current ocean pH has dropped 0.1 units since pre-industrial → 30% more acidic
    // At pH drop of 0.3-0.5, shell-forming organisms collapse (coral, shellfish, plankton)
    if (gwContrib > 10) {
      oceanHealth -= 0.3 * ((gwContrib - 10) / 90) * timeScale;
    }

    // Pollution runoff: industrial waste, agricultural chemicals, plastic
    if (pollution > 20) {
      oceanHealth -= 0.2 * ((pollution - 20) / 80) * timeScale;
    }

    // Waste (especially plastic): Great Pacific Garbage Patch, microplastics in food chain
    if (waste > 30) {
      oceanHealth -= 0.2 * ((waste - 30) / 70) * timeScale;
    }

    // Overfishing: population + tech = fishing capacity
    // Industrial fishing (tech ≥ 7) can collapse fisheries within decades
    if (tech >= 7 && pop > 1000) {
      const fishingPressure = Math.min(0.5, (pop / 10000) * (tech - 6) * 0.1);
      oceanHealth -= fishingPressure * timeScale;
    }

    // Ocean recovery: very slow without intervention (coral takes decades)
    // Clean oceans can recover — but below 30, recovery is near-impossible
    // (coral bleaching is largely irreversible without temperature reduction)
    if (oceanHealth < 90 && pollution < 20 && gwContrib < 15) {
      oceanHealth += 0.1 * timeScale; // slow natural recovery when pressure removed
    }

    oceanHealth = Utils.clamp(oceanHealth, 5, 100);
    civ.state.oceanHealthIndex = oceanHealth;

    // ── Effects of ocean health ──
    // Fisheries: ocean health directly affects food security
    // FAO: 3.3 billion people rely on fish for >20% of animal protein
    // Coastal/island civilizations more affected (handled by tile counts)
    if (oceanHealth < 60) {
      const fisheriesLoss = (60 - oceanHealth) / 60;
      civ.state.foodSecurity = Utils.clamp(
        (civ.state.foodSecurity ?? 60) - fisheriesLoss * 2 * timeScale, 0, 100);
    }

    // Extreme ocean degradation: mass marine extinction event
    // Cascading collapse of marine food web
    if (oceanHealth < 20) {
      civ.state.foodSecurity = Utils.clamp(
        (civ.state.foodSecurity ?? 60) - 1.0 * timeScale, 0, 100);
      // Coastal flooding from coral reef loss
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - 0.3 * timeScale, 0, 100);
    }

    // Climate regulation loss: degraded oceans absorb less CO2
    // Positive feedback: ocean degradation → less CO2 absorption → more warming → more degradation
    if (oceanHealth < 40 && gwContrib > 20) {
      civ.state.globalWarmingContribution = Utils.clamp(
        gwContrib + 0.2 * timeScale, 0, 100);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ADVANCED SYSTEMS: Immigration, Pandemics, Trade, Disinformation, AI
  // ══════════════════════════════════════════════════════════════

  // ── Immigration Between Civilizations ─────────────────────────
  // Push-pull model (Lee 1966): people migrate FROM low-opportunity TO high-opportunity.
  // UN: ~3.6% of world population are international migrants (281M in 2020).
  // Solves Stage 5 population decline for prosperous civs.
  _processInterCivMigration(yearsDelta) {
    const civs = this.game.civilizations;
    if (civs.length < 2) return;
    const timeScale = yearsDelta / 10;

    for (let i = 0; i < civs.length; i++) {
      for (let j = i + 1; j < civs.length; j++) {
        const c1 = civs[i], c2 = civs[j];
        if (!c1.state || !c2.state) continue;

        // Innovation pull: skilled workers migrate toward innovation hubs
        // Florida 2002: creative class concentrates where talent, technology, tolerance align
        // Silicon Valley, Shenzhen, Bangalore: innovation magnets for global talent
        const innov1 = (c1.state.behaviorReinforcement?.innovation ?? 50);
        const innov2 = (c2.state.behaviorReinforcement?.innovation ?? 50);
        const attract1 = (c1.state.averageWellbeing ?? 50) * 0.35
          + (c1.state.foodSecurity ?? 60) * 0.2
          + (c1.state.stabilityIndex ?? 50) * 0.2
          + (c1.operatingPrinciples?.freedomLevel ?? 50) * 0.1
          + (c1.state.socialMobility ?? 50) * 0.05
          + innov1 * 0.1;
        const attract2 = (c2.state.averageWellbeing ?? 50) * 0.35
          + (c2.state.foodSecurity ?? 60) * 0.2
          + (c2.state.stabilityIndex ?? 50) * 0.2
          + (c2.operatingPrinciples?.freedomLevel ?? 50) * 0.1
          + (c2.state.socialMobility ?? 50) * 0.05
          + innov2 * 0.1;

        // Demographic pull factor: Stage 5 civs with declining populations
        // actively recruit immigrants (labor shortage, aging population)
        // Japan debate, Germany 2015 refugee intake, Canada/Australia points systems
        const demo1 = (c1.state.demographicTransitionStage ?? 1) >= 5 ? 10 : 0;
        const demo2 = (c2.state.demographicTransitionStage ?? 1) >= 5 ? 10 : 0;
        const adj1 = attract1 + demo1;
        const adj2 = attract2 + demo2;

        const diff = adj1 - adj2;
        if (Math.abs(diff) < 5) continue; // lowered from 10 — some migration always occurs

        const source = diff > 0 ? c2 : c1;
        const dest = diff > 0 ? c1 : c2;
        const pressure = Math.abs(diff);
        const isRefugee = source.governance?.modelId === 'failed_state';
        // UN data: ~3.6% of world pop are migrants. Annual migration ~0.5% of global pop.
        // Per decade: ~5% — but between any two civs, fraction depends on differential
        const migrationRate = isRefugee ? 0.03 : 0.01; // increased from 0.02/0.005
        const migrants = Math.max(1, Math.floor(source.state.population * migrationRate * (pressure / 100) * timeScale));
        if (migrants < 1) continue;

        source.state.population = Math.max(50, source.state.population - migrants);
        dest.state.population += migrants;

        // Feature 8: Track diaspora communities for remittances/knowledge transfer
        const sourceDiaspora = source.state.diasporaCommunities ?? {};
        if (!sourceDiaspora[dest.id]) {
          sourceDiaspora[dest.id] = { size: 0, established: this.game.currentYear, culturalMaintenance: 80 };
        }
        sourceDiaspora[dest.id].size += migrants;
        source.state.diasporaCommunities = sourceDiaspora;

        // Brain drain: skilled migration amplified by innovation gap
        // India→US, Africa→Europe: talent flows toward opportunity clusters
        // Docquier & Rapoport 2012: brain drain strongest from middle-income countries
        const sourceInnov = source.state.behaviorReinforcement?.innovation ?? 50;
        const destInnov = dest.state.behaviorReinforcement?.innovation ?? 50;
        const innovGap = Math.max(0, destInnov - sourceInnov); // only when dest is more innovative
        const brainDrainMult = 1.0 + (innovGap / 100) * 1.5; // up to 2.5× when gap is 100
        if (!isRefugee && migrants > 10) {
          source.state.educationQuality = Utils.clamp(
            (source.state.educationQuality ?? 50) - 0.1 * brainDrainMult * timeScale, 0, 100);
          // Source loses innovation capacity as skilled workers leave
          source.state.behaviorReinforcement = source.state.behaviorReinforcement ?? {};
          source.state.behaviorReinforcement.innovation = Utils.clamp(
            (source.state.behaviorReinforcement.innovation ?? 50) - 0.1 * brainDrainMult * timeScale, 0, 100);
        }
        // Destination: innovation boost scaled by gap + social pressure if low inclusion
        if (migrants > 20) {
          dest.state.behaviorReinforcement = dest.state.behaviorReinforcement ?? {};
          const innovBoost = 0.2 + (innovGap > 20 ? 0.15 : 0); // extra boost for talent magnets
          dest.state.behaviorReinforcement.innovation = Utils.clamp(
            (dest.state.behaviorReinforcement.innovation ?? 50) + innovBoost * timeScale, 0, 100);
          // Skilled migrants boost education quality at destination
          if (innovGap > 15) {
            dest.state.educationQuality = Utils.clamp(
              (dest.state.educationQuality ?? 50) + 0.05 * timeScale, 0, 100);
          }
          const inclusion = dest.state.politicalInclusion ?? 50;
          if (inclusion < 60) {
            dest.state.stabilityIndex = Utils.clamp(
              (dest.state.stabilityIndex ?? 70) - 0.1 * (1 - inclusion / 100) * timeScale, 0, 100);
          }
        }
      }
    }
  }

  // ── Pandemic Risk ─────────────────────────────────────────────
  // COVID-19 model: pandemics are systemic events (economics, politics, trust).
  // Risk: urbanization, trade connectivity, low biodiversity (zoonotic spillover).
  // Response: state capacity, healthcare, social trust, epistemic health.
  _processPandemicRisk(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const urban = civ.state.urbanizationRate ?? 20;
    const trade = civ.state.tradeDependency ?? 30;
    const bio = civ.state.biodiversityIndex ?? 80;
    const tech = civ.state.technologyLevel ?? 1;
    let pandemicProb = 0.01;
    if (urban > 60) pandemicProb += 0.01 * ((urban - 60) / 40);
    if (trade > 50) pandemicProb += 0.005 * ((trade - 50) / 50);
    if (bio < 40) pandemicProb += 0.01 * ((40 - bio) / 40);
    if (tech < 4) pandemicProb *= 0.3;
    const yr = this.game?.currentYear ?? 0;
    const recentPandemic = civ.history?.some(h => h.type === 'pandemic' && (yr - (h.year ?? 0)) < 100);
    if (!recentPandemic && Utils.random() < pandemicProb * timeScale) {
      const cap = civ.state.stateCapacity ?? 50;
      const trust = civ.state.socialTrust ?? 50;
      const eh = civ.state.epistemicHealth ?? 50;
      const responseFactor = (cap + trust + eh) / 300;
      const severity = Math.max(0.3, 1.0 - responseFactor * 0.7);
      const popLoss = 0.001 + severity * 0.019;
      civ.state.population = Math.max(50, Math.floor(civ.state.population * (1 - popLoss)));
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 50) - 5 * severity, 0, 100);
      civ.state.stabilityIndex = Utils.clamp((civ.state.stabilityIndex ?? 70) - 3 * severity, 0, 100);
      if (responseFactor > 0.6) civ.state.socialTrust = Utils.clamp(trust + 2, 0, 100);
      else civ.state.socialTrust = Utils.clamp(trust - 3 * severity, 0, 100);
      civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + 5 * severity, 0, 100);
      civ.addHistoryEntry(yr, '🦠 Pandemic',
        `Major pandemic in ${civ.name}. ${severity > 0.7 ? 'Overwhelmed healthcare, slow response.' : 'Swift public health response limited damage.'} ${Math.round(popLoss * 1000) / 10}% population loss.`, 'pandemic');
    }
  }

  // ── Disinformation & Epistemic Crisis ─────────────────────────
  // Social media era (tech ≥ 7): algorithmic amplification → filter bubbles →
  // polarization → institutional distrust. Cambridge Analytica, troll farms.
  _processDisinformation(civ) {
    if (!civ.state) return;
    const tech = civ.state.technologyLevel ?? 1;
    if (tech < 7) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const eh = civ.state.epistemicHealth ?? 50;
    const educQ = civ.state.educationQuality ?? 50;
    const trust = civ.state.socialTrust ?? 50;
    const wc = civ.economic?.wealthConcentration ?? 30;
    const iq = civ.state.institutionalQuality ?? 50;
    // Disinformation pressure: rises with tech but with diminishing returns
    // Societies develop antibodies: fact-checkers, media literacy, platform regulation
    // Peak at tech ~9-10, then plateaus. Pressure also from wealth concentration (media capture)
    // and low trust (vulnerable to "institutions are lying" narratives)
    const techFactor = Math.min(2.0, (tech - 6) * 0.5); // caps at 2.0
    let disinfoPress = techFactor * 0.2 * timeScale;
    if (wc > 60) disinfoPress += 0.15 * ((wc - 60) / 40) * timeScale;
    if (trust < 40) disinfoPress += 0.15 * timeScale;
    // Defense: education is PRIMARY (Finland model: mandatory media literacy)
    // Institutional quality and existing epistemic health also defend
    let defense = 0;
    if (educQ > 50) defense += 0.4 * ((educQ - 50) / 50) * timeScale;
    if (iq > 50) defense += 0.3 * ((iq - 50) / 50) * timeScale;
    if (eh > 50) defense += 0.2 * ((eh - 50) / 50) * timeScale;
    const netEffect = disinfoPress - defense;
    if (netEffect > 0) {
      civ.state.epistemicHealth = Utils.clamp(eh - netEffect * 0.5, 0, 100);
      civ.state.socialTrust = Utils.clamp(trust - netEffect * 0.2, 0, 100);
      civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + netEffect * 0.15, 0, 100);
    }
  }

  // ── AI / Automation Systemic Disruption ────────────────────────
  // Beyond tech unemployment: AI boosts productivity AND creates disruption.
  // Goldman Sachs: +7% global GDP from AI. But also deepfakes, labor displacement.
  _processAIDisruption(civ) {
    if (!civ.state) return;
    const autoLevel = civ.state.automationLevel ?? 0;
    if (autoLevel < 3) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const iq = civ.state.institutionalQuality ?? 50;
    const retrain = civ.state.retrainingCapacity ?? 30;
    // Productivity boost (scaled by institutional capacity to channel it)
    const productivityBoost = (autoLevel - 2) * 0.3 * timeScale;
    civ.state.averageWellbeing = Utils.clamp(
      (civ.state.averageWellbeing ?? 50) + productivityBoost * (iq / 100), 0, 100);
    // Labor displacement (if retraining is weak)
    if (retrain < 40) {
      const displacement = (autoLevel - 2) * 0.2 * ((40 - retrain) / 40) * timeScale;
      civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) + displacement, 0, 100);
      if (civ.economic) {
        civ.economic.wealthConcentration = Utils.clamp(
          (civ.economic.wealthConcentration ?? 30) + displacement * 0.5, 0, 93);
      }
    }
    // Deepfake epistemic disruption (advanced AI)
    if (autoLevel >= 5) {
      civ.state.epistemicHealth = Utils.clamp(
        (civ.state.epistemicHealth ?? 50) - 0.2 * ((autoLevel - 4) / 3) * timeScale, 0, 100);
    }
    // Good institutions channel AI productively
    if (iq > 70 && (civ.state.educationQuality ?? 50) > 60) {
      civ.state.behaviorReinforcement = civ.state.behaviorReinforcement ?? {};
      civ.state.behaviorReinforcement.innovation = Utils.clamp(
        (civ.state.behaviorReinforcement.innovation ?? 50) + 0.3 * timeScale, 0, 100);
    }
  }

  // ── Trade Network Effects ─────────────────────────────────────
  // Globalization: prosperity from trade + vulnerability from interdependence.
  // Supply chain disruption (COVID), financial contagion (2008).
  _processTradeNetworks(yearsDelta) {
    const civs = this.game.civilizations;
    if (civs.length < 2) return;
    const timeScale = yearsDelta / 10;
    let totalTrade = 0;
    for (const civ of civs) totalTrade += (civ.state?.tradeDependency ?? 30);
    const avgTrade = totalTrade / civs.length;
    // Globalization benefit
    if (avgTrade > 40) {
      for (const civ of civs) {
        if (!civ.state) continue;
        const td = civ.state.tradeDependency ?? 30;
        if (td > 30) {
          civ.state.averageWellbeing = Utils.clamp(
            (civ.state.averageWellbeing ?? 50) + 0.1 * (td / 100) * timeScale, 0, 100);
        }
      }
    }
    // Supply chain contagion from crisis civs
    const crisisCivs = civs.filter(c =>
      (c.state?.stabilityIndex ?? 70) < 20 || c.governance?.modelId === 'failed_state');
    if (crisisCivs.length > 0) {
      for (const civ of civs) {
        if (!civ.state || crisisCivs.includes(civ)) continue;
        const td = civ.state.tradeDependency ?? 30;
        if (td > 50) {
          const contagion = 0.1 * (crisisCivs.length / civs.length) * (td / 100) * timeScale;
          civ.state.averageWellbeing = Utils.clamp(
            (civ.state.averageWellbeing ?? 50) - contagion, 0, 100);
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 1: Natural Disaster Resilience (non-climate)
  // Earthquakes, tsunamis, volcanic eruptions — geological stochastic events.
  // Severity moderated by state capacity + tech + infrastructure.
  // Haiti 2010 vs Japan 2011: same earthquake magnitude, 100x death toll difference.
  // Volcanic eruptions cause temporary cooling (Pinatubo 1991, Tambora 1815).
  // ══════════════════════════════════════════════════════════════
  _processNaturalDisasterRisk(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    const cap = civ.state.stateCapacity ?? 50;
    const tech = civ.state.technologyLevel ?? 1;
    const infra = civ.state.infrastructureLevel ?? 30;
    const urban = civ.state.urbanizationRate ?? 20;
    const pop = civ.state.population ?? 500;
    const lastDisaster = civ.state.lastNaturalDisasterYear;

    // Update building code quality (slow, driven by tech + capacity)
    const targetBuildCode = Math.min(100, tech * 8 + cap * 0.3);
    civ.state.buildingCodeQuality = Utils.clamp(
      (civ.state.buildingCodeQuality ?? 10) + (targetBuildCode - (civ.state.buildingCodeQuality ?? 10)) * 0.05 * timeScale,
      0, 100);

    // Update preparedness (composite of cap, tech, building codes)
    civ.state.naturalDisasterPreparedness = Utils.clamp(
      (cap * 0.4 + tech * 5 + (civ.state.buildingCodeQuality ?? 10) * 0.3 + infra * 0.1), 0, 100);

    // Spam limit: max 1 per 80 years
    if (lastDisaster && (yr - lastDisaster) < 80) return;

    // Determine geographic risk from terrain tiles
    const tiles = this.game.map.getTilesForCiv(civ.id);
    let coastalRatio = 0;
    let mountainRatio = 0;
    if (tiles && tiles.length > 0) {
      const coastal = tiles.filter(t => t.terrain === 'coast' || t.terrain === 'ocean' || t.terrain === 'shallows').length;
      const mountain = tiles.filter(t => t.terrain === 'mountain' || t.terrain === 'hills').length;
      coastalRatio = coastal / tiles.length;
      mountainRatio = mountain / tiles.length;
    }

    // Seismic risk: higher near mountains (plate boundaries)
    const seismicBase = 0.003 + mountainRatio * 0.005; // ~0.3-0.8% per decade
    // Tsunami risk: coastal + seismic
    const tsunamiBase = coastalRatio > 0.2 ? seismicBase * 0.4 : 0;
    // Volcanic risk: near mountains
    const volcanicBase = mountainRatio > 0.1 ? 0.002 : 0.0005;

    // Roll for each type
    const disasters = [
      { type: 'earthquake', prob: seismicBase * timeScale, emoji: '🌋', label: 'Major Earthquake' },
      { type: 'tsunami', prob: tsunamiBase * timeScale, emoji: '🌊', label: 'Tsunami' },
      { type: 'volcanic_eruption', prob: volcanicBase * timeScale, emoji: '🌋', label: 'Volcanic Eruption' },
    ];

    for (const d of disasters) {
      if (d.prob <= 0 || Utils.random() > d.prob) continue;

      // Disaster triggered — calculate severity
      const preparedness = civ.state.naturalDisasterPreparedness ?? 20;
      // Resilience factor: high preparedness + tech reduces impact dramatically
      // Japan factor = 0.2 (high prep), Haiti factor = 0.9 (low prep)
      const resilienceFactor = Math.max(0.15, 1.0 - (preparedness / 120));
      const baseSeverity = 0.4 + Utils.random() * 0.6; // 0.4-1.0
      const severity = baseSeverity * resilienceFactor;

      // Population loss: 0.1% (Japan-level) to 5% (Haiti-level)
      const popLossPct = severity * 5;
      const popLoss = Math.max(1, Math.round(pop * popLossPct / 100));
      civ.state.population = Math.max(50, pop - popLoss);

      // Infrastructure damage
      civ.state.infrastructureLevel = Utils.clamp(
        infra - severity * 15, 0, 100);

      // Wellbeing shock
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - severity * 12, 0, 100);

      // Stability: minor short-term hit (societies rally)
      civ.state.stabilityIndex = Utils.clamp(
        (civ.state.stabilityIndex ?? 70) - severity * 5, 0, 100);

      // Collective trauma
      civ.state.collectiveTrauma = Utils.clamp(
        (civ.state.collectiveTrauma ?? 0) + severity * 15, 0, 100);

      // Short-term social cohesion boost (communities rally after disasters)
      if (cap > 30) {
        civ.state.socialCohesion = Utils.clamp(
          (civ.state.socialCohesion ?? 50) + (1 - severity) * 5, 0, 100);
      }

      // Food security hit (crop damage, supply chain disruption)
      civ.state.foodSecurity = Utils.clamp(
        (civ.state.foodSecurity ?? 70) - severity * 10, 0, 100);

      // Urban density amplifies casualties
      if (urban > 60 && d.type === 'earthquake') {
        civ.state.population = Math.max(50,
          civ.state.population - Math.round(pop * severity * 0.01 * (urban / 100)));
      }

      // Volcanic eruption: temporary cooling effect (Pinatubo -0.5°C for 2 years)
      if (d.type === 'volcanic_eruption' && baseSeverity > 0.7) {
        // Major eruption: reduce surface temp temporarily
        this.surfaceTemp = Math.max(0, (this.surfaceTemp ?? 0) - 0.3);
        // SO2 aerosols reduce incoming solar → food security hit globally
        for (const otherCiv of this.game.civilizations) {
          if (otherCiv.state) {
            otherCiv.state.foodSecurity = Utils.clamp(
              (otherCiv.state.foodSecurity ?? 70) - 3, 0, 100);
          }
        }
      }

      // Reconstruction stimulus (build-back-better with high capacity)
      if (cap > 50 && tech > 4) {
        // Innovation boost from reconstruction (post-disaster innovation is well-documented)
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          (civ.state.behaviorReinforcement.innovation ?? 50) + 2, 0, 100);
      }

      // Debt increase from reconstruction spending
      civ.state.sovereignDebtRatio = Utils.clamp(
        (civ.state.sovereignDebtRatio ?? 20) + severity * 10, 0, 200);

      civ.state.lastNaturalDisasterYear = yr;

      civ.addHistoryEntry(yr, `${d.emoji} ${d.label}`,
        `${d.label} strikes ${civ.name}. Preparedness: ${Math.round(preparedness)}%. ` +
        `${popLoss.toLocaleString()} casualties (${popLossPct.toFixed(1)}% of population). ` +
        `${severity < 0.3 ? 'Strong institutions enabled swift response.' :
          severity < 0.6 ? 'Significant damage to infrastructure and communities.' :
          'Catastrophic devastation — weak infrastructure amplified destruction.'}`,
        'natural_disaster');

      break; // only one disaster per turn
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 2: Sovereign Debt / Fiscal Crisis
  // Government debt accumulates from spending beyond tax capacity.
  // Crisis at debt/GDP > 90% (Reinhart & Rogoff 2009). Austerity vs default.
  // Greece 2010, Argentina 2001, Asian Financial Crisis 1997.
  // ══════════════════════════════════════════════════════════════
  _processSovereignDebt(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    let debt = civ.state.sovereignDebtRatio ?? 20;
    const cap = civ.state.stateCapacity ?? 50;
    const wc = civ.state.wealthCapture?.degree ?? 0;
    const military = civ.state.militaryPower ?? 20;
    const wb = civ.state.averageWellbeing ?? 50;
    const minskyPhase = civ.state.minskyPhase ?? 25;
    const govId = civ.governance?.modelId ?? '';
    const trust = civ.state.socialTrust ?? 50;
    const austerity = civ.state.austerityLevel ?? 0;

    // Tax capacity proxy: higher with institutions, education, formalized economy
    const taxCapacity = Math.min(80, cap * 0.4 + (civ.state.institutionalQuality ?? 50) * 0.3 +
      (civ.state.educationQuality ?? 50) * 0.1);

    // Spending pressure: military, social programs, infrastructure
    const spendingPressure = (military * 0.3 + (100 - wb) * 0.2 + // low wb → social spending pressure
      (civ.state.infrastructureLevel ?? 30 < 40 ? 15 : 0)); // infra deficit

    // Net debt accumulation (spending > tax = debt grows)
    const netSpending = Math.max(0, spendingPressure - taxCapacity) * 0.02;
    debt += netSpending * timeScale;

    // War costs: major debt driver (US WWII debt = 120% GDP)
    const atWar = this.activeWars.some(w =>
      w.attacker?.id === civ.id || w.defender?.id === civ.id);
    if (atWar) {
      debt += 3.0 * timeScale; // war is expensive
    }

    // Debt servicing costs (interest): rises with debt level
    const interestRate = debt > 90 ? 0.08 : debt > 60 ? 0.04 : 0.02;
    const servicing = debt * interestRate * 0.1;
    civ.state.debtServicingCost = Utils.clamp(servicing, 0, 50);

    // Austerity reduces debt but hurts wellbeing + stability
    if (austerity > 0) {
      debt -= austerity * 0.03 * timeScale;
      civ.state.averageWellbeing = Utils.clamp(wb - austerity * 0.05 * timeScale, 0, 100);
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + austerity * 0.03 * timeScale, 0, 100);
      // Austerity fatigue: erodes over time
      civ.state.austerityLevel = Utils.clamp(austerity - 2 * timeScale, 0, 100);
    }

    // Natural debt reduction: economic growth reduces debt/GDP ratio
    if (wb > 50 && (civ.state.stabilityIndex ?? 70) > 50) {
      debt -= 1.0 * timeScale; // GDP growth outpaces debt
    }

    // Capital flight at high debt
    if (debt > 80) {
      civ.state.capitalFlight = Utils.clamp(
        (civ.state.capitalFlight ?? 0) + (debt - 80) * 0.05 * timeScale, 0, 100);
      // Capital flight reduces investment → wellbeing
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - (civ.state.capitalFlight ?? 0) * 0.02 * timeScale, 0, 100);
    } else {
      civ.state.capitalFlight = Utils.clamp(
        (civ.state.capitalFlight ?? 0) - 3 * timeScale, 0, 100);
    }

    // Fiscal crisis trigger: debt > 90 AND vulnerable conditions
    if (debt > 90 && !civ.state.fiscalCrisisActive) {
      const crisisProb = 0.05 * ((debt - 90) / 50) * timeScale;
      // Minsky euphoria/panic amplifies crisis probability
      const minskyAmplifier = minskyPhase > 60 ? 1.5 : 1.0;
      if (Utils.random() < crisisProb * minskyAmplifier) {
        civ.state.fiscalCrisisActive = true;
        civ.state.fiscalCrisisTurns = 0;
        civ.state.capitalFlight = Utils.clamp((civ.state.capitalFlight ?? 0) + 20, 0, 100);
        civ.state.socialTrust = Utils.clamp(trust - 8, 0, 100);
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - 10, 0, 100);
        civ.state.tradeDependency = Utils.clamp(
          (civ.state.tradeDependency ?? 20) - 10, 0, 100);

        civ.addHistoryEntry(yr, '💰 Sovereign Debt Crisis',
          `${civ.name} faces fiscal crisis with debt at ${Math.round(debt)}% of GDP. ` +
          `Capital flight accelerating. International creditors demand reforms.`,
          'fiscal_crisis');
      }
    }

    // Crisis resolution: takes 3-5 turns
    if (civ.state.fiscalCrisisActive) {
      civ.state.fiscalCrisisTurns = (civ.state.fiscalCrisisTurns ?? 0) + 1;
      // Ongoing crisis effects
      civ.state.averageWellbeing = Utils.clamp(
        (civ.state.averageWellbeing ?? 50) - 2 * timeScale, 0, 100);

      // IMF-style bailout from stronger civ (if relations positive)
      const otherCivs = this.game.civilizations.filter(c => c.id !== civ.id && c.state);
      const potentialBailout = otherCivs.find(c =>
        (c.state.stateCapacity ?? 50) > 60 && (c.state.sovereignDebtRatio ?? 20) < 50 &&
        (c.relations?.[civ.id]?.attitude ?? 0) > 20);
      if (potentialBailout && civ.state.fiscalCrisisTurns > 2) {
        debt -= 20;
        civ.state.fiscalCrisisActive = false;
        civ.state.austerityLevel = Utils.clamp(austerity + 30, 0, 100); // conditions attached
        civ.addHistoryEntry(yr, '🏦 International Bailout',
          `${civ.name} receives financial assistance from ${potentialBailout.name}. ` +
          `Austerity conditions imposed.`, 'bailout');
      }

      // Self-resolution after 5 turns (partial default)
      if (civ.state.fiscalCrisisTurns > 5) {
        debt *= 0.7; // partial default / restructuring
        civ.state.fiscalCrisisActive = false;
        civ.state.socialTrust = Utils.clamp(
          (civ.state.socialTrust ?? 50) - 10, 0, 100);
        civ.state.lastDefaultYear = yr;
        civ.addHistoryEntry(yr, '📉 Debt Restructuring',
          `${civ.name} restructures sovereign debt after prolonged crisis. ` +
          `Trust damaged but fiscal pressure reduced.`, 'default');
      }
    }

    civ.state.sovereignDebtRatio = Utils.clamp(debt, 0, 200);
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 3: Media/Information Ecosystem Enhancement
  // Free press reduces corruption (Brunetti & Weder 2003).
  // Investigative journalism exposes corruption stochastically.
  // Public broadcasting boosts cohesion (BBC/NHK model).
  // Media literacy defends against disinformation (Finland model).
  // Oligarch media capture when wealth concentration high (Berlusconi/Murdoch).
  // ══════════════════════════════════════════════════════════════
  _processMediaEcosystem(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    const freedom = civ.operatingPrinciples?.freedomLevel ?? 50;
    const educQ = civ.state.educationQuality ?? 50;
    const iq = civ.state.institutionalQuality ?? 50;
    const wc = civ.state.wealthCapture?.degree ?? 0;
    const wcMedia = civ.state.wealthCapture?.mediaCapture ?? 0;
    const corr = civ.state.corruptionLevel ?? 20;
    const tech = civ.state.technologyLevel ?? 1;
    const cap = civ.state.stateCapacity ?? 50;
    const trust = civ.state.socialTrust ?? 50;

    // Press freedom: driven by political freedom + institutions, degraded by autocracy + oligarchy
    let targetPressFreedom = freedom * 0.5 + iq * 0.3 + (100 - wc) * 0.2;
    // State censorship in autocratic regimes
    if (civ.governance?.modelId === 'autocratic' || civ.governance?.modelId === 'theocratic') {
      targetPressFreedom *= 0.5;
    }
    civ.state.pressFreedom = Utils.clamp(
      (civ.state.pressFreedom ?? 50) + (targetPressFreedom - (civ.state.pressFreedom ?? 50)) * 0.08 * timeScale,
      0, 100);

    // Media literacy: grows with education quality + press freedom
    const targetLiteracy = Math.min(100, educQ * 0.6 + (civ.state.pressFreedom ?? 50) * 0.3);
    civ.state.mediaLiteracy = Utils.clamp(
      (civ.state.mediaLiteracy ?? 30) + (targetLiteracy - (civ.state.mediaLiteracy ?? 30)) * 0.05 * timeScale,
      0, 100);

    // Public broadcasting: requires tech ≥ 4 (radio/TV era) + state capacity
    if (tech >= 4 && cap > 30) {
      const pbTarget = Math.min(80, cap * 0.4 + iq * 0.3);
      civ.state.publicBroadcasting = Utils.clamp(
        (civ.state.publicBroadcasting ?? 0) + (pbTarget - (civ.state.publicBroadcasting ?? 0)) * 0.03 * timeScale,
        0, 100);
    }

    // Oligarch media capture: grows with wealth concentration + weak institutions
    if (tech >= 4) { // mass media era
      const captureDriver = Math.max(0, wcMedia * 0.5 + (wc > 50 ? (wc - 50) * 0.4 : 0) - iq * 0.3);
      civ.state.mediaOligarchCapture = Utils.clamp(
        (civ.state.mediaOligarchCapture ?? 0) + (captureDriver - (civ.state.mediaOligarchCapture ?? 0)) * 0.05 * timeScale,
        0, 100);
    }

    // Press freedom → corruption reduction (Brunetti & Weder 2003)
    const pf = civ.state.pressFreedom ?? 50;
    if (pf > 40) {
      const anticorrEffect = (pf - 40) / 60 * 0.3 * timeScale;
      civ.state.corruptionLevel = Utils.clamp(
        (civ.state.corruptionLevel ?? 20) - anticorrEffect, 0, 100);
      if (civ.state.corruptionIndex !== undefined) {
        civ.state.corruptionIndex = Utils.clamp(civ.state.corruptionIndex - anticorrEffect, 0, 100);
      }
    }

    // Oligarch capture → reduce press freedom and epistemic health
    const capture = civ.state.mediaOligarchCapture ?? 0;
    if (capture > 30) {
      civ.state.pressFreedom = Utils.clamp(
        (civ.state.pressFreedom ?? 50) - capture * 0.01 * timeScale, 0, 100);
      civ.state.epistemicHealth = Utils.clamp(
        (civ.state.epistemicHealth ?? 50) - capture * 0.005 * timeScale, 0, 100);
    }

    // Public broadcasting → social cohesion (shared narrative, public sphere)
    const pb = civ.state.publicBroadcasting ?? 0;
    if (pb > 20) {
      civ.state.socialCohesion = Utils.clamp(
        (civ.state.socialCohesion ?? 50) + pb * 0.005 * timeScale, 0, 100);
    }

    // Investigative journalism: stochastic corruption exposure events
    if (pf > 40 && educQ > 40 && corr > 25) {
      const lastInvest = civ.state.lastInvestigationYear;
      if (!lastInvest || (yr - lastInvest) > 30) {
        const investProb = 0.03 * (pf / 100) * (corr / 100) * timeScale;
        if (Utils.random() < investProb) {
          // Corruption exposed — reduces corruption, temporarily reduces trust
          const corrReduction = Math.min(10, corr * 0.15);
          civ.state.corruptionLevel = Utils.clamp(corr - corrReduction, 0, 100);
          if (civ.state.corruptionIndex !== undefined) {
            civ.state.corruptionIndex = Utils.clamp(civ.state.corruptionIndex - corrReduction, 0, 100);
          }
          // Short-term trust shock (scandal), long-term trust benefit
          civ.state.socialTrust = Utils.clamp(trust - 3, 0, 100);
          civ.state.lastInvestigationYear = yr;

          civ.addHistoryEntry(yr, '📰 Investigative Journalism Exposé',
            `Journalists in ${civ.name} expose systemic corruption. ` +
            `Public outrage leads to reforms. Corruption reduced by ${corrReduction.toFixed(1)} points.`,
            'investigation');
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 4: Drug/Addiction Epidemics
  // Vulnerability from anomie + low wellbeing + inequality + rapid change.
  // Era-gated substances. State response matters.
  // Portugal decriminalization vs US "war on drugs."
  // Opium Wars: economic warfare via addiction.
  // ══════════════════════════════════════════════════════════════
  _processAddictionEpidemic(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    const tech = civ.state.technologyLevel ?? 1;
    const anomie = civ.state.anomieLevel ?? 0;
    const wb = civ.state.averageWellbeing ?? 50;
    const wc = civ.state.wealthCapture?.degree ?? 0;
    const cap = civ.state.stateCapacity ?? 50;
    const healthAccess = civ.state.healthcareAccess ?? 'mixed_public_private';
    const trust = civ.state.socialTrust ?? 50;
    let prevalence = civ.state.addictionPrevalence ?? 0;

    // Available substance type by era
    let substanceType = null;
    if (tech >= 8) substanceType = 'synthetic';
    else if (tech >= 6) substanceType = 'opioids';
    else if (tech >= 4) substanceType = 'opium';
    else if (tech >= 2) substanceType = 'alcohol';
    else return; // pre-agricultural societies have minimal addiction risk

    // Vulnerability composite (what makes a population susceptible)
    const vulnerability = Utils.clamp(
      anomie * 0.3 +                          // Durkheim: anomie → substance abuse
      Math.max(0, 50 - wb) * 0.4 +            // despair (Case & Deaton "deaths of despair")
      Math.max(0, wc - 40) * 0.3 +            // inequality → hopelessness
      Math.max(0, 50 - trust) * 0.2,           // low social trust → isolation
      0, 100);
    civ.state.addictionVulnerability = vulnerability;

    // Epidemic onset: vulnerability > 30 triggers growth
    if (vulnerability > 30 && prevalence < 5) {
      const onsetProb = 0.02 * ((vulnerability - 30) / 70) * timeScale;
      if (Utils.random() < onsetProb) {
        prevalence = 5; // epidemic begins
        civ.state.addictionSubstance = substanceType;
        civ.addHistoryEntry(yr, '💊 Addiction Epidemic Emerges',
          `Rising ${substanceType} addiction in ${civ.name}. ` +
          `Vulnerability factors: ${anomie > 40 ? 'high anomie, ' : ''}` +
          `${wb < 40 ? 'low wellbeing, ' : ''}${wc > 50 ? 'high inequality' : 'social stress'}.`,
          'addiction');
      }
    }

    // Epidemic dynamics
    if (prevalence > 0) {
      // Growth: vulnerability-driven
      const growthRate = (vulnerability / 100) * 0.5;
      // Natural saturation ceiling (not everyone is vulnerable)
      const ceiling = Math.min(40, vulnerability * 0.5);

      if (prevalence < ceiling) {
        prevalence += growthRate * timeScale;
      }

      // State response effectiveness
      const response = civ.state.addictionResponse ?? 'none';
      let responseEffect = 0;
      switch (response) {
        case 'prohibition':
        case 'war_on_drugs':
          // High enforcement, mixed results (US model)
          // Reduces supply but creates black market, incarceration, doesn't address root causes
          responseEffect = -0.5 * (cap / 100) * timeScale; // slow reduction with high capacity
          // Side effects: increased incarceration → anomie, reduced trust
          civ.state.anomieLevel = Utils.clamp(anomie + 0.3 * timeScale, 0, 100);
          break;
        case 'harm_reduction':
          // Moderate effectiveness, fewer side effects (Switzerland, Netherlands)
          responseEffect = -0.8 * (cap / 100) * timeScale;
          break;
        case 'decriminalization':
          // Portugal model: most effective long-term, requires healthcare investment
          const healthFactor = healthAccess === 'universal_comprehensive' ? 1.5 :
            healthAccess === 'universal_basic' ? 1.2 : 0.8;
          responseEffect = -1.2 * (cap / 100) * healthFactor * timeScale;
          break;
        default: // 'none' — epidemic grows unchecked
          responseEffect = 0;
      }
      prevalence += responseEffect;

      // Natural recovery when root causes addressed (vulnerability drops)
      if (vulnerability < 20) {
        prevalence -= 0.5 * timeScale;
      }

      // Effects on society
      if (prevalence > 10) {
        // Productivity loss
        civ.state.averageWellbeing = Utils.clamp(
          (civ.state.averageWellbeing ?? 50) - prevalence * 0.02 * timeScale, 0, 100);
        // Healthcare burden
        civ.state.socialCohesion = Utils.clamp(
          (civ.state.socialCohesion ?? 50) - prevalence * 0.015 * timeScale, 0, 100);
      }

      if (prevalence > 25) {
        // Severe epidemic: trust erosion, stability hit
        civ.state.socialTrust = Utils.clamp(trust - 0.3 * timeScale, 0, 100);
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - 0.2 * timeScale, 0, 100);
      }
    }

    // Cross-civ weaponization: adversary with high trade + negative attitude
    if (prevalence < 10 && tech >= 4) {
      const civs = this.game.civilizations.filter(c => c.id !== civ.id && c.state);
      for (const other of civs) {
        const attitude = other.relations?.[civ.id]?.attitude ?? 0;
        const otherTrade = other.state?.tradeDependency ?? 0;
        if (attitude < -30 && otherTrade > 30 && (other.state?.technologyLevel ?? 1) >= 4) {
          const weaponizeProb = 0.005 * timeScale;
          if (Utils.random() < weaponizeProb && !civ.state.addictionForeignOrigin) {
            prevalence = Math.max(prevalence, 10);
            civ.state.addictionForeignOrigin = true;
            civ.state.addictionSubstance = 'opium';
            civ.addHistoryEntry(yr, '⚗️ Foreign Substance Trade',
              `${other.name} floods ${civ.name} with addictive substances through trade networks. ` +
              `Reminiscent of historical opium trade.`, 'addiction_foreign');
          }
        }
      }
    }

    civ.state.addictionPrevalence = Utils.clamp(prevalence, 0, 100);
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 5: Generational Value Shifts (Inglehart Enhancement)
  // Enhance existing _processGenerationalDrift with formative-conditions
  // tracking. Generations raised in security → post-materialist values.
  // Inglehart (1971, 1997), World Values Survey.
  // ══════════════════════════════════════════════════════════════
  _processGenerationalValues(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const wb = civ.state.averageWellbeing ?? 50;
    const stab = civ.state.stabilityIndex ?? 70;
    const food = civ.state.foodSecurity ?? 70;
    const atWar = this.activeWars.some(w =>
      w.attacker?.id === civ.id || w.defender?.id === civ.id);

    // Record current conditions as formative for future generations
    const conditions = civ.state.formativeConditions ?? [];
    conditions.push({ turn: this.game.turn, wb, stability: stab, warActive: atWar, food });
    if (conditions.length > 5) conditions.shift();
    civ.state.formativeConditions = conditions;

    // Look at conditions from 2-3 entries ago (20-30 years)
    const formativeIdx = Math.max(0, conditions.length - 3);
    const formative = conditions[formativeIdx] || { wb: 50, stability: 70, warActive: false, food: 70 };

    // Post-materialist orientation: shaped by formative security
    const formativeSecurity = (formative.wb * 0.4 + formative.stability * 0.3 +
      formative.food * 0.2 + (formative.warActive ? 0 : 10)) / 100 * 100;

    // Slow generational replacement: orientation drifts toward formative security level
    const currentOrientation = civ.state.postMaterialistOrientation ?? 30;
    const targetOrientation = Utils.clamp(formativeSecurity, 0, 100);
    // Very slow drift — generational replacement takes decades
    civ.state.postMaterialistOrientation = Utils.clamp(
      currentOrientation + (targetOrientation - currentOrientation) * 0.03 * timeScale,
      0, 100);

    const postMat = civ.state.postMaterialistOrientation;

    // Generational conflict: when current conditions differ sharply from formative
    const currentSecurity = (wb * 0.4 + stab * 0.3 + food * 0.2 + (atWar ? 0 : 10)) / 100 * 100;
    const orientationGap = Math.abs(postMat - currentSecurity);
    civ.state.generationalConflict = Utils.clamp(
      orientationGap * 0.5 + (civ.state.generationalConflict ?? 0) * 0.7,
      0, 100);

    // Post-materialist effects on other systems
    if (postMat > 60) {
      // Environmental concern: post-materialists prioritize environment
      // Pushes resource strategy toward conservation
      civ.state.behaviorReinforcement.cooperation = Utils.clamp(
        (civ.state.behaviorReinforcement.cooperation ?? 50) + (postMat - 60) * 0.005 * timeScale, 0, 100);

      // Gender equity pressure
      civ.state.genderEquity = Utils.clamp(
        (civ.state.genderEquity ?? 50) + (postMat - 60) * 0.003 * timeScale, 0, 100);

      // Democratic demands
      if (civ.governance?.hierarchyLevel > 60) {
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - (postMat - 60) * 0.005 * timeScale, 0, 100);
      }
    }

    if (postMat < 30) {
      // Materialist values: tolerance for inequality, strong-man governance
      civ.state.behaviorReinforcement.deference = Utils.clamp(
        (civ.state.behaviorReinforcement.deference ?? 50) + (30 - postMat) * 0.005 * timeScale, 0, 100);
    }

    // Generational conflict → anomie
    if (civ.state.generationalConflict > 30) {
      civ.state.anomieLevel = Utils.clamp(
        (civ.state.anomieLevel ?? 0) + (civ.state.generationalConflict - 30) * 0.005 * timeScale, 0, 100);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 6: Space Program (prestige/science bonus)
  // Based on US Apollo (STEM boost, cohesion), Soviet Sputnik (education reform),
  // Chinese/Indian/Japanese programs. NOT colonization — just Earth-based effects.
  // Apollo era: 50% increase in STEM PhDs, GDP multiplier 7:1 to 14:1.
  // ══════════════════════════════════════════════════════════════
  _processSpaceProgram(civ) {
    if (!civ.state) return;
    const sp = civ.state.spaceProgram;
    if (!sp) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    const tech = civ.state.technologyLevel ?? 1;
    const cap = civ.state.stateCapacity ?? 50;
    const educQ = civ.state.educationQuality ?? 50;
    const innovation = civ.state.behaviorReinforcement?.innovation ?? 50;

    // Tech gate: space programs require modern technology (post-WWII era)
    if (tech < 6 || !sp.active) {
      // Decay prestige if program inactive
      if (sp.prestige > 0) {
        sp.prestige = Utils.clamp(sp.prestige - 1 * timeScale, 0, 100);
      }
      sp.stemBoost = Math.max(0, (sp.stemBoost ?? 0) - 0.5 * timeScale);
      return;
    }

    // Investment effectiveness: scales with state capacity + education
    const investEffective = (sp.investmentLevel ?? 0) * (cap / 100) * (educQ / 100);

    // Milestone progression
    const milestones = [
      { id: 'satellite', requirement: 15, label: 'First Satellite Launch', emoji: '🛰️' },
      { id: 'crewed_orbit', requirement: 30, label: 'First Crewed Orbital Flight', emoji: '🚀' },
      { id: 'moon_landing', requirement: 55, label: 'Moon Landing', emoji: '🌙' },
      { id: 'space_station', requirement: 70, label: 'Space Station Established', emoji: '🏗️' },
      { id: 'mars_mission', requirement: 90, label: 'Mars Mission', emoji: '🔴' },
    ];

    const achieved = sp.achievements || [];
    const nextMilestone = milestones.find(m => !achieved.includes(m.id));

    if (nextMilestone && investEffective > nextMilestone.requirement) {
      // Probability of achievement: scales with investment above threshold
      const surplus = investEffective - nextMilestone.requirement;
      const achieveProb = 0.05 * (surplus / 30) * timeScale;

      if (Utils.random() < achieveProb) {
        achieved.push(nextMilestone.id);
        sp.achievements = achieved;
        sp.lastAchievementYear = yr;

        // Prestige surge
        sp.prestige = Utils.clamp(sp.prestige + 20, 0, 100);

        // STEM boost (Apollo effect: 50% more STEM PhDs)
        sp.stemBoost = Utils.clamp((sp.stemBoost ?? 0) + 5, 0, 30);

        // National pride / cohesion boost
        civ.state.socialCohesion = Utils.clamp(
          (civ.state.socialCohesion ?? 50) + 5, 0, 100);

        // Innovation stimulus
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          innovation + 3, 0, 100);

        civ.addHistoryEntry(yr, `${nextMilestone.emoji} ${nextMilestone.label}`,
          `${civ.name} achieves ${nextMilestone.label.toLowerCase()}! ` +
          `National prestige surges. STEM education boosted.`, 'space');

        // First-to-achieve bonus (space race dynamics)
        const otherCivs = this.game.civilizations.filter(c =>
          c.id !== civ.id && c.state?.spaceProgram?.achievements?.includes(nextMilestone.id));
        if (otherCivs.length === 0) {
          sp.prestige = Utils.clamp(sp.prestige + 10, 0, 100); // first mover bonus
        }
      }

      // Failure events (Challenger/Columbia analogue): ~2% chance per achievement attempt
      if (Utils.random() < 0.02 * timeScale && (!sp.lastFailureYear || yr - sp.lastFailureYear > 30)) {
        sp.lastFailureYear = yr;
        sp.prestige = Utils.clamp(sp.prestige - 10, 0, 100);
        civ.state.socialTrust = Utils.clamp(
          (civ.state.socialTrust ?? 50) - 3, 0, 100);
        civ.state.socialCohesion = Utils.clamp(
          (civ.state.socialCohesion ?? 50) - 2, 0, 100);

        civ.addHistoryEntry(yr, '💥 Space Program Disaster',
          `${civ.name} suffers a catastrophic space mission failure. ` +
          `Public confidence in the program shaken.`, 'space_failure');
      }
    }

    // Ongoing effects of active program
    // STEM education boost → education quality
    civ.state.educationQuality = Utils.clamp(
      educQ + sp.stemBoost * 0.05 * timeScale, 0, 100);

    // Science funding boost
    civ.state.scienceSupport = Utils.clamp(
      (civ.state.scienceSupport ?? 50) + sp.investmentLevel * 0.01 * timeScale, 0, 100);

    // Prestige decay without new achievements
    if (sp.lastAchievementYear && (yr - sp.lastAchievementYear) > 30) {
      sp.prestige = Utils.clamp(sp.prestige - 0.5 * timeScale, 0, 100);
    }

    // Cost: space programs are expensive → sovereign debt
    civ.state.sovereignDebtRatio = Utils.clamp(
      (civ.state.sovereignDebtRatio ?? 20) + sp.investmentLevel * 0.01 * timeScale, 0, 200);

    // Record history
    const history = sp.history || [];
    history.push({ turn: this.game.turn, prestige: sp.prestige, stemBoost: sp.stemBoost });
    if (history.length > 50) history.shift();
    sp.history = history;
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 7: Religious/Ideological Schism
  // Internal fault lines that split a civilization's cohesion.
  // Protestant Reformation, Sunni-Shia, Great Schism, Communist factions.
  // Resolution: suppression (trauma), accommodation (frac), reformation (renewal).
  // ══════════════════════════════════════════════════════════════
  _processSchismRisk(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    const yr = this.game.currentYear;
    const lockin = civ.state.institutionalLockin ?? 0;
    const leg = civ.state.legitimacyLevel ?? 50;
    const cohesion = civ.state.socialCohesion ?? 50;
    const educQ = civ.state.educationQuality ?? 50;
    const frac = civ.state.ethnicFractionalization ?? 30;
    const freedom = civ.operatingPrinciples?.freedomLevel ?? 50;
    const lastSchism = civ.state.lastSchismYear;
    const religionDominance = civ.religion?.stateRelationship === 'state_religion' ? 80 :
      civ.religion?.stateRelationship === 'established' ? 60 : 30;

    // Spam limit: max 1 per 150 years
    if (lastSchism && (yr - lastSchism) < 150) {
      // Active schism resolution
      if (civ.state.schismActive) {
        this._resolveSchism(civ, timeScale, yr);
      }
      return;
    }

    // Schism risk accumulation
    let riskPressure = 0;

    // High institutional lock-in + education = reform pressure
    if (lockin > 40 && educQ > 40) {
      riskPressure += (lockin - 40) * 0.01 * (educQ / 100);
    }

    // Low legitimacy = questioning of established order
    if (leg < 40) {
      riskPressure += (40 - leg) * 0.01;
    }

    // External cultural contact (trade opens minds)
    const trade = civ.state.tradeDependency ?? 20;
    if (trade > 30) {
      riskPressure += (trade - 30) * 0.005;
    }

    // Low freedom + high education = intellectual dissent
    if (freedom < 40 && educQ > 50) {
      riskPressure += (50 - freedom) * 0.005 * (educQ / 100);
    }

    // Dampeners
    // High cohesion suppresses schism
    if (cohesion > 60) riskPressure *= 0.5;
    // High legitimacy suppresses schism
    if (leg > 70) riskPressure *= 0.3;

    civ.state.schismRisk = Utils.clamp(
      (civ.state.schismRisk ?? 0) + riskPressure * timeScale, 0, 100);

    // Natural risk decay
    civ.state.schismRisk = Utils.clamp(civ.state.schismRisk - 0.3 * timeScale, 0, 100);

    // Schism trigger
    if (civ.state.schismRisk > 60) {
      const triggerProb = 0.03 * ((civ.state.schismRisk - 60) / 40) * timeScale;
      if (Utils.random() < triggerProb) {
        // Determine schism type
        let schismType = 'ideological';
        if (religionDominance > 60 && lockin > 50) {
          schismType = 'religious';
        } else if (frac > 50) {
          schismType = 'ethnic_political';
        }

        civ.state.schismActive = true;
        civ.state.schismType = schismType;
        civ.state.schismSeverity = Utils.clamp(civ.state.schismRisk * 0.6, 20, 80);
        civ.state.lastSchismYear = yr;

        // Immediate effects
        civ.state.socialCohesion = Utils.clamp(cohesion - 15, 0, 100);
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - 10, 0, 100);
        civ.state.anomieLevel = Utils.clamp(
          (civ.state.anomieLevel ?? 0) + 10, 0, 100);

        const typeLabels = { religious: 'Religious', ideological: 'Ideological', ethnic_political: 'Ethnic-Political' };
        civ.addHistoryEntry(yr, `⚡ ${typeLabels[schismType]} Schism`,
          `Deep internal divisions erupt in ${civ.name}. ${schismType === 'religious' ?
            'Religious reform movements challenge established orthodoxy.' :
            schismType === 'ideological' ? 'Competing ideological factions fracture the political order.' :
            'Ethnic and political fault lines split the community.'}`,
          'schism');
      }
    }
  }

  _resolveSchism(civ, timeScale, yr) {
    const resolution = civ.state.schismResolution;
    const severity = civ.state.schismSeverity ?? 30;
    let progress = civ.state.schismResolutionProgress ?? 0;

    if (!resolution) return; // no resolution path chosen yet — awaiting player action or auto-resolve

    switch (resolution) {
      case 'suppression':
        // Fast but traumatic (Albigensian Crusade, Tiananmen)
        progress += 8 * (civ.state.stateCapacity ?? 50) / 100 * timeScale;
        civ.state.collectiveTrauma = Utils.clamp(
          (civ.state.collectiveTrauma ?? 0) + severity * 0.05 * timeScale, 0, 100);
        civ.state.socialTrust = Utils.clamp(
          (civ.state.socialTrust ?? 50) - 1 * timeScale, 0, 100);
        break;
      case 'accommodation':
        // Moderate speed, increases fractionalization (Ottoman millet system)
        progress += 5 * timeScale;
        civ.state.ethnicFractionalization = Utils.clamp(
          (civ.state.ethnicFractionalization ?? 30) + 2 * timeScale, 0, 100);
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) + 1 * timeScale, 0, 100);
        break;
      case 'reformation':
        // Slow, chaotic, but leads to renewal (Protestant Reformation → literacy + innovation)
        progress += 3 * timeScale;
        civ.state.stabilityIndex = Utils.clamp(
          (civ.state.stabilityIndex ?? 70) - 2 * timeScale, 0, 100);
        // Innovation stimulus from reformation (printing press, new ideas)
        civ.state.behaviorReinforcement.innovation = Utils.clamp(
          (civ.state.behaviorReinforcement.innovation ?? 50) + 1 * timeScale, 0, 100);
        civ.state.educationQuality = Utils.clamp(
          (civ.state.educationQuality ?? 50) + 0.5 * timeScale, 0, 100);
        break;
    }

    civ.state.schismResolutionProgress = progress;

    if (progress >= 100) {
      civ.state.schismActive = false;
      civ.state.schismRisk = 10; // reset risk
      civ.state.schismResolutionProgress = 0;

      // Reformation bonus: long-term innovation + education boost
      if (resolution === 'reformation') {
        civ.state.institutionalLockin = Utils.clamp(
          (civ.state.institutionalLockin ?? 0) - 20, 0, 100);
        civ.addHistoryEntry(yr, '🔄 Reformation Complete',
          `${civ.name} emerges from internal reformation. ` +
          `Institutions renewed, innovation stimulated.`, 'reformation');
      } else {
        civ.addHistoryEntry(yr, '🕊️ Schism Resolved',
          `Internal divisions in ${civ.name} have been ${resolution === 'suppression' ?
            'suppressed' : 'accommodated'}.`, 'schism_resolved');
      }

      // Auto-resolve: if no player-chosen resolution, default after long enough
    } else if (!resolution && civ.state.schismActive) {
      // AI civs auto-choose based on governance
      if (!civ.isPlayerCiv) {
        const cap = civ.state.stateCapacity ?? 50;
        if (cap > 60 && (civ.governance?.modelId === 'autocratic' || civ.governance?.modelId === 'theocratic')) {
          civ.state.schismResolution = 'suppression';
        } else if (civ.state.institutionalQuality > 50) {
          civ.state.schismResolution = 'accommodation';
        } else {
          civ.state.schismResolution = 'reformation';
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 8: Diaspora Networks
  // Created by emigration. Effects: remittances, knowledge transfer,
  // trade facilitation, political lobbying. Return migration.
  // Jewish, Chinese, Indian, Armenian, Irish diasporas.
  // ══════════════════════════════════════════════════════════════
  _processDiasporaNetworks(yearsDelta) {
    const civs = this.game.civilizations;
    if (civs.length < 2) return;
    const timeScale = yearsDelta / 10;

    for (const civ of civs) {
      if (!civ.state) continue;
      const diaspora = civ.state.diasporaCommunities ?? {};
      let totalAbroad = 0;
      let totalRemittances = 0;
      let totalTradeBonus = 0;

      for (const [hostCivId, community] of Object.entries(diaspora)) {
        if (!community || community.size <= 0) continue;
        totalAbroad += community.size;

        const hostCiv = civs.find(c => c.id === hostCivId);
        if (!hostCiv || !hostCiv.state) continue;

        // Remittances: diaspora sends money home (proportional to host wellbeing)
        const hostWb = hostCiv.state.averageWellbeing ?? 50;
        const remit = community.size * (hostWb / 100) * 0.001;
        totalRemittances += remit;

        // Knowledge transfer: if host has higher tech, origin benefits
        const techGap = (hostCiv.state.technologyLevel ?? 1) - (civ.state.technologyLevel ?? 1);
        if (techGap > 0) {
          civ.state.behaviorReinforcement.innovation = Utils.clamp(
            (civ.state.behaviorReinforcement.innovation ?? 50) + techGap * community.size * 0.0001 * timeScale,
            0, 100);
        }

        // Trade facilitation: diaspora networks facilitate commerce
        totalTradeBonus += community.size * 0.0005;

        // Cultural maintenance decay (assimilation)
        if (community.culturalMaintenance !== undefined) {
          community.culturalMaintenance = Math.max(0, community.culturalMaintenance - 0.5 * timeScale);
        }

        // Return migration: when origin conditions improve significantly
        const originAttract = (civ.state.averageWellbeing ?? 50) * 0.4 +
          (civ.state.stabilityIndex ?? 70) * 0.3 + (civ.state.foodSecurity ?? 70) * 0.2;
        const hostAttract = hostWb * 0.4 + (hostCiv.state.stabilityIndex ?? 70) * 0.3;
        if (originAttract > hostAttract + 20 && community.size > 5) {
          const returnRate = Math.min(0.1, (originAttract - hostAttract - 20) / 200);
          const returnees = Math.max(1, Math.round(community.size * returnRate * timeScale));
          community.size -= returnees;
          civ.state.population = (civ.state.population ?? 500) + returnees;
          // Returnees bring skills
          civ.state.educationQuality = Utils.clamp(
            (civ.state.educationQuality ?? 50) + returnees * 0.01, 0, 100);
        }

        // Political lobbying: diaspora influences host's attitude toward origin
        if (community.size > 10) {
          if (hostCiv.relations && hostCiv.relations[civ.id]) {
            hostCiv.relations[civ.id].attitude = Utils.clamp(
              (hostCiv.relations[civ.id].attitude ?? 0) + community.size * 0.001 * timeScale, -100, 100);
          }
        }
      }

      // Apply remittance benefits
      civ.state.remittanceInflow = Utils.clamp(totalRemittances * 10, 0, 100);
      if (totalRemittances > 0) {
        civ.state.averageWellbeing = Utils.clamp(
          (civ.state.averageWellbeing ?? 50) + totalRemittances * 0.1 * timeScale, 0, 100);
      }

      // Apply trade bonus
      civ.state.diasporaTradeBonus = Utils.clamp(totalTradeBonus, 0, 50);
      if (totalTradeBonus > 0) {
        civ.state.tradeDependency = Utils.clamp(
          (civ.state.tradeDependency ?? 20) + totalTradeBonus * 0.05 * timeScale, 0, 100);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // FEATURE 9: Water/Resource Conflict Escalation
  // 5-stage escalation: Cooperation → Tension → Dispute → Confrontation → Conflict.
  // Based on Nile (Egypt-Ethiopia), Indus (India-Pakistan), Colorado River.
  // Climate warming amplifies existing water disputes.
  // ══════════════════════════════════════════════════════════════
  _processWaterConflictEscalation(yearsDelta) {
    const civs = this.game.civilizations;
    if (civs.length < 2) return;
    const timeScale = yearsDelta / 10;

    const stages = ['cooperation', 'tension', 'dispute', 'confrontation', 'conflict'];

    for (let i = 0; i < civs.length; i++) {
      const civA = civs[i];
      if (!civA.state) continue;

      for (let j = i + 1; j < civs.length; j++) {
        const civB = civs[j];
        if (!civB.state) continue;

        // Check if civs share water resources (adjacent on map)
        const tilesA = this.game.map.getTilesForCiv(civA.id);
        const tilesB = this.game.map.getTilesForCiv(civB.id);
        if (!tilesA || !tilesB || tilesA.length === 0 || tilesB.length === 0) continue;

        // Adjacency check (share border)
        let adjacent = false;
        for (const tA of tilesA) {
          for (const tB of tilesB) {
            if (Math.abs(tA.x - tB.x) <= 1 && Math.abs(tA.y - tB.y) <= 1) {
              adjacent = true;
              break;
            }
          }
          if (adjacent) break;
        }
        if (!adjacent) continue;

        // Water scarcity of both civs
        const waterA = civA.state.resourceDepletion?.water ?? 100;
        const waterB = civB.state.resourceDepletion?.water ?? 100;
        const avgWater = (waterA + waterB) / 2;

        // Get or initialize conflict stage
        const stagesA = civA.state.waterConflictStages ?? {};
        const stagesB = civB.state.waterConflictStages ?? {};
        let currentStage = stagesA[civB.id] || stagesB[civA.id] || 'cooperation';

        let stageIdx = stages.indexOf(currentStage);
        if (stageIdx < 0) stageIdx = 0;

        // Escalation factors
        let escalationPressure = 0;
        let deescalationPressure = 0;

        // Water scarcity drives escalation
        if (avgWater < 50) {
          escalationPressure += (50 - avgWater) * 0.02;
        }

        // Population pressure
        const popDensityA = (civA.state.population ?? 500) / Math.max(1, tilesA.length);
        const popDensityB = (civB.state.population ?? 500) / Math.max(1, tilesB.length);
        if (popDensityA + popDensityB > 200) {
          escalationPressure += 0.3;
        }

        // Climate amplifier: warming reduces water → escalates disputes
        const tempAnomaly = this.surfaceTemp ?? 0;
        if (tempAnomaly > 1.5) {
          escalationPressure += (tempAnomaly - 1.5) * 0.2;
        }

        // Negative relations amplify
        const attitudeAtoB = civA.relations?.[civB.id]?.attitude ?? 0;
        if (attitudeAtoB < -20) {
          escalationPressure += Math.abs(attitudeAtoB + 20) * 0.005;
        }

        // De-escalation factors
        // High institutional quality in both civs
        const iqA = civA.state.institutionalQuality ?? 50;
        const iqB = civB.state.institutionalQuality ?? 50;
        if (iqA > 50 && iqB > 50) {
          deescalationPressure += (iqA + iqB - 100) * 0.01;
        }

        // Positive relations
        if (attitudeAtoB > 20) {
          deescalationPressure += attitudeAtoB * 0.005;
        }

        // Active treaty
        const treatyA = civA.state.waterTreatyStatus ?? {};
        if (treatyA[civB.id] === 'signed') {
          deescalationPressure += 1.5;
        }

        // High state capacity enables diplomacy
        const capA = civA.state.stateCapacity ?? 50;
        const capB = civB.state.stateCapacity ?? 50;
        if (capA > 50 && capB > 50) {
          deescalationPressure += 0.3;
        }

        // Net escalation
        const netPressure = (escalationPressure - deescalationPressure) * timeScale;

        if (netPressure > 0.5 && stageIdx < stages.length - 1) {
          // Escalate
          const escalateProb = 0.05 * netPressure;
          if (Utils.random() < escalateProb) {
            stageIdx++;
            const newStage = stages[stageIdx];

            if (stageIdx >= 3) { // confrontation or conflict
              const yr = this.game.currentYear;
              civA.addHistoryEntry(yr, '💧 Water Dispute Escalation',
                `Water tensions between ${civA.name} and ${civB.name} escalate to ${newStage}. ` +
                `Average water availability: ${avgWater.toFixed(0)}%.`,
                'water_conflict');
            }

            // At conflict stage, feed into war system
            if (newStage === 'conflict') {
              // Lower the war declaration threshold between these civs
              if (civA.relations && civA.relations[civB.id]) {
                civA.relations[civB.id].attitude = Utils.clamp(
                  (civA.relations[civB.id].attitude ?? 0) - 30, -100, 100);
              }
              if (civB.relations && civB.relations[civA.id]) {
                civB.relations[civA.id].attitude = Utils.clamp(
                  (civB.relations[civA.id].attitude ?? 0) - 30, -100, 100);
              }
            }
          }
        } else if (netPressure < -0.5 && stageIdx > 0) {
          // De-escalate
          const deescalateProb = 0.05 * Math.abs(netPressure);
          if (Utils.random() < deescalateProb) {
            stageIdx--;

            // Treaty formation at cooperation stage
            if (stageIdx === 0) {
              const treatyStatusA = civA.state.waterTreatyStatus ?? {};
              const treatyStatusB = civB.state.waterTreatyStatus ?? {};
              if (treatyStatusA[civB.id] !== 'signed' && capA > 40 && capB > 40) {
                treatyStatusA[civB.id] = 'signed';
                treatyStatusB[civA.id] = 'signed';
                civA.state.waterTreatyStatus = treatyStatusA;
                civB.state.waterTreatyStatus = treatyStatusB;
              }
            }
          }
        }

        // Update stages for both civs
        stagesA[civB.id] = stages[stageIdx];
        stagesB[civA.id] = stages[stageIdx];
        civA.state.waterConflictStages = stagesA;
        civB.state.waterConflictStages = stagesB;
      }
    }
  }

  // ── Fix 1: Baseline Stability Recovery ────────────────────────
  // Every real civilization has homeostatic tendencies: local leaders emerge,
  // markets find equilibria, communities self-govern. Egypt recovered from
  // 3 Intermediate Periods; China from Warring States; Rome from the
  // Crisis of the Third Century. Without baseline recovery, any stability
  // loss is effectively permanent — historically inaccurate.
  _processStabilityRecovery(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    let stability = civ.state.stabilityIndex ?? 70;
    const trust = civ.state.socialTrust ?? 50;
    const iq = civ.state.institutionalQuality ?? 50;
    const cap = civ.state.stateCapacity ?? 50;
    const govId = civ.governance?.modelId ?? '';

    // Baseline: +1.0/decade (doubled from 0.5) — must counteract stochastic
    // event shocks of -3 to -8 that occur every 10-20 turns.
    // With 0.5 recovery and -8 shock every 15 turns, net is -0.5/turn decline.
    // With 1.0 recovery, net is ~0/turn — stability oscillates rather than declining.
    // Historical: most societies recover from shocks within 20-50 years
    let recovery = 1.0 * timeScale;

    // Institutional quality amplifies recovery (Weber: bureaucratic rationality)
    if (iq > 40) recovery += 0.5 * ((iq - 40) / 60) * timeScale;

    // Social trust amplifies recovery (Putnam: social capital enables collective action)
    if (trust > 30) recovery += 0.4 * ((trust - 30) / 70) * timeScale;

    // State capacity enables coordinated response
    if (cap > 30) recovery += 0.3 * ((cap - 30) / 70) * timeScale;

    // Failed states recover more slowly but DO still recover
    // (Somalia had local governance even at worst; warlords provide crude order)
    if (govId === 'failed_state') recovery *= 0.3;

    // Recovery stronger when stability is very low (regression to mean)
    // Easy fixes come first: stop active fighting, restore basic order
    if (stability < 30) recovery *= 1.5;
    else if (stability < 50) recovery *= 1.2;

    stability += recovery;

    // ── R4-2: Differentiated stability ceiling ──
    // Higher inequality/anomie → more internal friction → lower peak stability.
    // Low-WC societies (Scandinavia) can sustain higher stability than high-WC ones.
    // This breaks the 92-93 clustering where all democracies converged.
    if (stability > 80) {
      const wc = civ.state.wealthConcentration ?? 40;
      const anom = civ.state.anomie ?? 20;
      const ceilingCoeff = 0.008 + Math.max(0, (wc - 25)) * 0.0004
                                 + Math.max(0, (anom - 15)) * 0.0003;
      const excess = stability - 80;
      stability -= excess * excess * ceilingCoeff * timeScale;
    }

    civ.state.stabilityIndex = Utils.clamp(stability, 0, 100);
  }

  // ── Fix 2: Wellbeing Recovery & Economic Prosperity ──────────
  // Two mechanisms:
  // A) Floor enforcement: no society sustains wb below 10-15 (WVS data)
  // B) Prosperity growth: functioning economies produce sustained wellbeing
  //    improvement through GDP growth, healthcare, housing, education.
  //    This is the MISSING MECHANISM that caused early wellbeing collapse.
  //    In reality, market democracies with good institutions have steadily
  //    rising wellbeing (Easterlin paradox notwithstanding, absolute levels
  //    are correlated with GDP per capita up to ~$75k — Kahneman & Deaton 2010).
  _processWellbeingRecovery(civ) {
    if (!civ.state) return;
    const timeScale = (this.game.yearsDelta || 10) / 10;
    let wb = civ.state.averageWellbeing ?? 50;
    const foodSec = civ.state.foodSecurity ?? 60;
    const govId = civ.governance?.modelId ?? '';
    const iq = civ.state.institutionalQuality ?? 50;
    const cap = civ.state.stateCapacity ?? 50;
    const trust = civ.state.socialTrust ?? 50;
    const stability = civ.state.stabilityIndex ?? 50;
    const anomie = civ.state.anomieLevel ?? 0;

    // ── A) Floor enforcement ──
    const hardFloor = 15;
    if (wb < hardFloor) {
      wb += (hardFloor - wb) * 0.2 * timeScale;
      wb = Math.max(wb, 10);
    }

    // ── B) Economic prosperity → wellbeing growth ──
    // When conditions are favorable, wellbeing naturally grows.
    // This models: GDP growth → better healthcare, housing, food quality,
    // entertainment, sanitation, education, life expectancy.
    // WVS: average wellbeing correlates with institutional quality,
    // food security, stability, and trust (Hellevik 2003).
    let prosperity = 0;

    // The simulation has ~15 systems that each drain 0.05-0.2 wb/turn,
    // totaling ~1.5/turn structural drain even in good conditions.
    // Prosperity must exceed this to produce net wellbeing growth.
    // Target: +2.5-3.0/turn in optimal conditions (matching real-world
    // wellbeing improvement rate of 0.3-0.5 WVS points/decade = ~3-5/100/decade)

    // Calibration target: a well-functioning society (trust=80, iq=80, food=70,
    // stability=70, cap=70, democratic) should gain ~3-4/turn, enough to reach
    // wb=70 within 200 turns from wb=50, despite ~1.5/turn structural drains.
    // WVS: Nordic countries ~7.5/10, US ~6.9/10, UK ~6.7/10 → 67-75 on 0-100 scale

    // Food security is the foundation (Maslow's hierarchy)
    if (foodSec > 40) prosperity += 1.0 * ((foodSec - 40) / 60) * timeScale;
    if (foodSec > 70) prosperity += 0.5 * timeScale; // abundance bonus

    // Institutional quality enables economic development (North 1990, AJR 2012)
    if (iq > 30) prosperity += 1.0 * ((iq - 30) / 70) * timeScale;

    // Stability enables long-term investment and planning
    if (stability > 40) prosperity += 0.6 * ((stability - 40) / 60) * timeScale;

    // Trust enables economic cooperation (Knack & Keefer 1997)
    // Trust is the single strongest WVS predictor of national wellbeing
    if (trust > 30) prosperity += 0.8 * ((trust - 30) / 70) * timeScale;

    // State capacity enables public goods provision
    if (cap > 30) prosperity += 0.4 * ((cap - 30) / 70) * timeScale;

    // Governance accountability: responsive policy, public investment, rule of law
    // This is NOT governance-type dependent — it's about HOW governance functions.
    // Singapore (PAP): not democratic but high accountability, capacity, and wellbeing
    // China: massive prosperity growth under authoritarian rule (1980-2020)
    // Nordic countries: democratic AND high-capacity
    // The mechanism: accountability ≈ function of (IQ + capacity + legitimacy) / 3
    // NOT hardcoded to governance type — emerges from institutional quality
    const accountability = ((iq + cap + (civ.state.legitimacyLevel ?? 50)) / 3);
    if (accountability > 40) prosperity += 0.6 * ((accountability - 40) / 60) * timeScale;

    // High anomie suppresses prosperity gains (social dysfunction
    // prevents economic benefits from reaching people)
    if (anomie > 30) prosperity *= Math.max(0.2, 1.0 - (anomie - 30) / 100);

    // Failed states: minimal prosperity (only informal economy)
    if (govId === 'failed_state') prosperity *= 0.2;

    wb += prosperity;

    // ── C) Soft floor at 35: subsistence baseline ──
    if (wb >= hardFloor && wb < 35 && prosperity < 0.5) {
      const deficit = 35 - wb;
      let recovery = deficit * 0.06 * timeScale;
      if (foodSec > 50) recovery *= 1.3;
      if (govId === 'failed_state') recovery *= 0.5;
      wb += recovery;
    }

    civ.state.averageWellbeing = Utils.clamp(wb, 0, 100);
  }

  // ── Fix 6: Resilience Dampening ───────────────────────────────
  // When multiple metrics are simultaneously in crisis, the marginal
  // impact of each additional crisis is reduced. A society already at war,
  // in famine, with collapsed institutions, and high anomie is in "floor
  // state" — additional degradation just bounces off the floor.
  // Historical: post-WWII reconstruction, post-Black Death social mobility,
  // post-Bronze Age Collapse local recovery all show that civilizations
  // hit bottom and then bounce back.
  _applyResilienceDampening(civ) {
    if (!civ.state) return;
    const stability = civ.state.stabilityIndex ?? 70;
    const wb = civ.state.averageWellbeing ?? 50;
    const trust = civ.state.socialTrust ?? 50;
    const anomie = civ.state.anomieLevel ?? 0;

    // Count how many metrics are in "crisis" zone
    let crisisCount = 0;
    if (stability < 25) crisisCount++;
    if (wb < 25) crisisCount++;
    if (trust < 25) crisisCount++;
    if (anomie > 70) crisisCount++;

    // When 2+ metrics are in crisis, apply recovery nudge (lowered from 3+)
    // Society hits bottom → worst actors flee, new leaders emerge,
    // external aid arrives, people have nothing left to lose and rebuild
    // Nudge strength: 0.8 per crisis metric beyond 1 (increased from 0.4 beyond 2)
    if (crisisCount >= 2) {
      const timeScale = (this.game.yearsDelta || 10) / 10;
      const nudge = (crisisCount - 1) * 0.8 * timeScale;

      if (stability < 25) civ.state.stabilityIndex = Utils.clamp(stability + nudge, 0, 100);
      if (wb < 25) civ.state.averageWellbeing = Utils.clamp(wb + nudge * 0.7, 0, 100);
      if (trust < 25) civ.state.socialTrust = Utils.clamp(trust + nudge * 0.5, 0, 100);
      if (anomie > 70) civ.state.anomieLevel = Utils.clamp(anomie - nudge, 0, 100);
    }
  }

  // ── Fix 4d: Failed State Recovery Path ────────────────────────
  // Failed states DO recover: Somaliland self-organized; Afghanistan's
  // local shuras; post-collapse reconstruction is universal (Rotberg 2004).
  // Called from _generateHistoryEvents governance section.
  _checkFailedStateRecovery(civ, currentYear) {
    if (!civ.state || !civ.governance) return;
    if (civ.governance.modelId !== 'failed_state') return;

    const turns = civ.state._failedStateTurns ?? 0;
    if (turns < 5) return; // Minimum 5 decades (~50 years) before reconstitution possible

    const stability = civ.state.stabilityIndex ?? 0;
    const trust = civ.state.socialTrust ?? 0;

    // Recovery probability increases with time, stability, and trust
    // No stability minimum — reconstitution is time-driven, not condition-driven.
    // Historical: most failed states reconstitute within 10-30 years (Rotberg 2004).
    // Base: 5% per decade after initial 50 years, +0.5% per stability point, +2% if trust > 20
    const recoveryProb = 0.05 + stability * 0.005 + (trust > 20 ? 0.02 : 0)
      + (turns > 10 ? 0.03 : 0); // Extra 3% after 100 years of failure
    if (Utils.random() < Math.min(recoveryProb, 0.15)) {
      // Reconstitute as a simple governance form
      const newGov = trust > 40 ? 'elder_council' : 'tribal_chief';
      if (typeof GOVERNANCE_MODELS !== 'undefined' && GOVERNANCE_MODELS[newGov]) {
        civ.governance.modelId = newGov;
        civ.governance.model = GOVERNANCE_MODELS[newGov];
        civ.governance.hierarchyLevel = GOVERNANCE_MODELS[newGov].hierarchyLevel ?? 50;
      }
      // Major boost on reconstitution to break the death spiral cycle
      // New government purges worst actors, seizes assets, restores basic order
      // Historical: post-revolution/reconstitution periods typically see
      // significant corruption reduction and temporary social renewal
      civ.governance.corruptionLevel = Utils.clamp(
        (civ.governance.corruptionLevel ?? 50) * 0.4, 0, 100); // Cut corruption by 60%
      civ.state.stabilityIndex = Utils.clamp(stability + 25, 0, 100);
      civ.state.anomieLevel = Utils.clamp((civ.state.anomieLevel ?? 0) - 20, 0, 100);
      civ.state.averageWellbeing = Utils.clamp((civ.state.averageWellbeing ?? 0) + 15, 0, 100);
      civ.state.socialTrust = Utils.clamp((civ.state.socialTrust ?? 0) + 10, 0, 100);
      // Wealth redistribution on reconstitution (land reform, asset seizure)
      if (civ.economic) {
        civ.economic.wealthConcentration = Utils.clamp(
          (civ.economic.wealthConcentration ?? 50) * 0.7, 0, 93); // Cut 30%
      }
      civ.state._failedStateTurns = 0;
      // Post-reconstitution momentum: new government "honeymoon period"
      // For 10 turns (100 years), corruption growth is halved and institutional
      // quality gets a slow boost. This prevents immediate re-collapse.
      civ.state._reconstitutionMomentum = 10;

      civ.addHistoryEntry(currentYear, 'State Reconstitution',
        `After years of statelessness, local leaders in ${civ.name} have reconstituted basic governance. The new order is fragile but functional.`,
        'governance');
      const isPlayer = civ === this.game?.civilizations?.find(c => c.isPlayerCiv);
      if (isPlayer) {
        this.game.ui?.showNotification(
          `🏛️ ${civ.name}: State reconstituted! Basic governance restored after collapse.`, 'success');
      } else {
        this.game.ui?.showNotification(
          `🏛️ ${civ.name}: Governance reconstituted after state failure.`, 'info');
      }
    }
  }
}
