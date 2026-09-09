// ============================================================
// HINDCASTING SCENARIOS
// ============================================================
// Four well-documented historical transitions with trajectory
// expectations at specific waypoints. Each turn = ~10 years.
//
// Sources: V-Dem v14, Polity5, Maddison Project, World Bank WDI,
// World Values Survey, Transparency International CPI, WIDER.

const HINDCAST_SCENARIOS = [

  // ── 1. SOUTH KOREA 1960–2010 ──────────────────────────────
  // Autocratic developmental state → democratic transition (1987)
  // → continued economic growth with democratization
  // One of the best-documented "miracle" transitions
  {
    id: 'hc_south_korea',
    name: 'Hindcast: South Korea 1960–2010',
    turns: 50,  // 50 turns ≈ 50 years at ~1 year/turn equivalent
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'South Korea',
      civColor: '#3498db',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 80, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 75, participationModel: 'restricted', inheritanceSystem: 'partible' },
      operatingPrinciples: {
        freedomLevel: 20, collectivismLevel: 70, participationVoluntary: 20,
        outsiderRelationship: 'trading', coreValues: ['order', 'scholarship'],
        innovationTolerance: 55,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'communal', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 35, genderEquity: 15, debtModel: 'standard', tariffLevel: 65 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 50, scienceFreedom: 35, scienceFreedomConstraint: 'government', artsSupport: 30, artsFreedom: 30, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 45,
      institutionalQuality: 30,
      legitimacyLevel: 40,
      stabilityIndex: 50,
      socialTrust: 30,
      corruptionLevel: 65,
      educationQuality: 35,
      culturalCohesion: 70,
      militaryPower: 55,
      urbanizationRate: 28,
      polarizationLevel: 30,
      epistemicHealth: 35,
      institutionalLockin: 60,
      wealthConcentration: 30, // Korea Gini ~31 in 1960 (relatively equal for developmental state)
      landConcentration: 20,   // Post-1950 land reform — one of history's most radical
      casteRigidity: 15,       // Yangban system dissolved during Japanese occupation/Korean War
    },
    benchmarks: {
      source: 'V-Dem v14, Polity5 (-9→+8), Maddison, WVS, TI CPI',
      historicalPeriod: '1960-2010',
    },
    // Trajectory expectations:
    // - State capacity should rise sharply (developmental state model)
    // - Wealth concentration should be moderate (Korea's Gini ~31→35)
    // - Wellbeing should rise dramatically (GDP per capita 100x)
    // - Stability should be maintained or improve
    expectations: {
      stateCapacity: 'rising after turn 10',
      wellbeing: 'rising after turn 10',
      wealthConcentration: '<65 sustained',
      stability: '>30 sustained',
    },
    waypoints: [
      { turn: 20, label: '~1980', checks: {
        stateCapacity: { op: '>', val: 55, note: 'Developmental state built' },
        wellbeing: { op: '>', val: 30, note: 'GDP growth underway' },
      }},
      { turn: 30, label: '~1987 democratic transition', checks: {
        stateCapacity: { op: '>', val: 65, note: 'Strong institutions survived transition' },
        wellbeing: { op: '>', val: 40, note: 'Middle-income achieved' },
      }},
      { turn: 50, label: '~2010 mature democracy', checks: {
        stateCapacity: { op: '>', val: 75, note: 'OECD-level institutions' },
        wellbeing: { op: '>', val: 50, note: 'High-income economy' },
        socialTrust: { op: '>', val: 20, note: 'WVS trust ~27-30%' },
      }},
    ],
  },

  // ── 2. CHILE 1970–2000 ────────────────────────────────────
  // Democracy (Allende) → military coup (1973) → Pinochet regime
  // → re-democratization (1990). Extreme polarization → collapse
  // → authoritarian stability → gradual recovery.
  {
    id: 'hc_chile',
    name: 'Hindcast: Chile 1970–2000',
    turns: 30,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Chile',
      civColor: '#e74c3c',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 55, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 55, collectivismLevel: 40, participationVoluntary: 55,
        outsiderRelationship: 'trading', coreValues: ['civic duty'],
        innovationTolerance: 45,
      },
      religion: { presence: 'dominant', stateRelationship: 'endorsed', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 45, genderEquity: 25, debtModel: 'standard', tariffLevel: 50 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 45, scienceFreedomConstraint: 'none', artsSupport: 40, artsFreedom: 50, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'balanced', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 50,
      institutionalQuality: 50,
      legitimacyLevel: 40,
      stabilityIndex: 30,
      socialTrust: 15,
      corruptionLevel: 45,
      educationQuality: 45,
      culturalCohesion: 40,
      militaryPower: 50,
      urbanizationRate: 75,
      polarizationLevel: 85,
      epistemicHealth: 45,
      institutionalLockin: 35,
      wealthConcentration: 46, // Chile Gini ~46 in 1970, among highest in Latin America
    },
    benchmarks: {
      source: 'V-Dem v14, Polity5 (+6→-7→+9), Maddison, Latinobarometro, TI CPI',
      historicalPeriod: '1970-2000',
    },
    // Key: extreme polarization should destabilize the system
    // The model should show instability from the polarization/trust configuration
    expectations: {
      stability: '<40 by turn 5',
      wealthConcentration: 'rising after turn 5',
      socialTrust: '<25 sustained',
    },
    waypoints: [
      { turn: 5, label: '~1975 post-coup', checks: {
        stability: { op: '<', val: 40, note: 'Coup/instability period' },
      }},
      { turn: 20, label: '~1990 re-democratization', checks: {
        wealthConcentration: { op: '>', val: 50, note: 'Inequality rose under Pinochet (Gini ~57)' },
      }},
      { turn: 30, label: '~2000 consolidated democracy', checks: {
        stability: { op: '>', val: 40, note: 'Regained democratic stability' },
        institutionalQuality: { op: '>', val: 40, note: 'Institutional recovery underway' },
      }},
    ],
  },

  // ── 3. RUSSIA 1985–2015 ───────────────────────────────────
  // Soviet system → collapse (1991) → oligarchic transition
  // → partial re-centralization under Putin. The canonical
  // "institutional collapse" case.
  {
    id: 'hc_russia',
    name: 'Hindcast: Russia 1985–2015',
    turns: 30,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Russia',
      civColor: '#9b59b6',
      aiCivCount: 3,
      economic: { model: 'planned', scarcityOrientation: 85, accumulationAllowed: false },
      governance: { model: 'autocratic', hierarchyLevel: 85, participationModel: 'restricted', inheritanceSystem: 'communal' },
      operatingPrinciples: {
        freedomLevel: 15, collectivismLevel: 85, participationVoluntary: 10,
        outsiderRelationship: 'defensive', coreValues: ['order', 'military strength'],
        innovationTolerance: 30,
      },
      religion: { presence: 'suppressed', stateRelationship: 'state_atheism', propagation: 'passive', tolerance: 'restrictive' },
      worldClimate: { warmth: -2, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 75, genderEquity: 55, debtModel: 'standard', tariffLevel: 90 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'state_controlled', womensRightsTier: 'mostly_full', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 70, scienceFreedom: 25, scienceFreedomConstraint: 'government', artsSupport: 50, artsFreedom: 15, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'treatment', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'state_controlled' },
    },
    initialState: {
      stateCapacity: 75,
      institutionalQuality: 35,
      legitimacyLevel: 35,
      stabilityIndex: 55,
      socialTrust: 35,
      corruptionLevel: 60,
      educationQuality: 75,
      culturalCohesion: 50,
      militaryPower: 90,
      urbanizationRate: 73,
      polarizationLevel: 40,
      epistemicHealth: 30,
      institutionalLockin: 90,
      resourceRentDependence: 55, // Oil/gas ~50% federal revenue, ~60% exports
      landConcentration: 10,   // All land state-owned under Soviet system
      casteRigidity: 5,        // Soviet system abolished class hierarchy (nomenklatura de facto, not caste)
    },
    benchmarks: {
      source: 'V-Dem v14, Polity5 (-7→+4→-4), Maddison, WVS, TI CPI, WIDER',
      historicalPeriod: '1985-2015',
    },
    // The Soviet system had high lock-in, moderate stability, low legitimacy.
    // When it collapsed, wealth concentration exploded, trust fell, corruption spiked.
    expectations: {
      wealthConcentration: 'rising after turn 5',
      socialTrust: 'declining after turn 5',
      corruption: '>50 sustained',
      militaryPower: '>40 sustained',
    },
    waypoints: [
      { turn: 7, label: '~1992 post-Soviet', checks: {
        stability: { op: '<', val: 40, note: 'System collapse, GDP fell 40%' },
        wealthConcentration: { op: '>', val: 40, note: 'Oligarch formation began' },
      }},
      { turn: 15, label: '~2000 early Putin', checks: {
        wealthConcentration: { op: '>', val: 65, note: 'Oligarchs peaked, Gini ~48' },
        corruption: { op: '>', val: 60, note: 'TI CPI very poor' },
        socialTrust: { op: '<', val: 30, note: 'WVS trust ~25%' },
      }},
      { turn: 30, label: '~2015 consolidated autocracy', checks: {
        militaryPower: { op: '>', val: 50, note: 'Military rebuilt' },
        institutionalLockIn: { op: '>', val: 50, note: 'Re-centralized' },
      }},
    ],
  },

  // ── 4. RWANDA 1990–2020 ───────────────────────────────────
  // Failed state → genocide (1994) → remarkable recovery under
  // developmental autocracy. One of the most dramatic
  // state-capacity recoveries in modern history.
  {
    id: 'hc_rwanda',
    name: 'Hindcast: Rwanda 1990–2020',
    turns: 30,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Rwanda',
      civColor: '#27ae60',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 80, participationModel: 'restricted', inheritanceSystem: 'partible' },
      operatingPrinciples: {
        freedomLevel: 15, collectivismLevel: 70, participationVoluntary: 15,
        outsiderRelationship: 'defensive', coreValues: ['order'],
        innovationTolerance: 25,
      },
      religion: { presence: 'dominant', stateRelationship: 'endorsed', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: 1 },
      geography: { oceanAccess: false, placement: 'landlocked' },
      society: { educationAccess: 'out_of_reach', educationQuality: 15, genderEquity: 10, debtModel: 'standard', tariffLevel: 40 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 10, scienceFreedom: 15, scienceFreedomConstraint: 'government', artsSupport: 10, artsFreedom: 15, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'basic_only', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'subsistence', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'state_controlled' },
    },
    initialState: {
      stateCapacity: 20,
      institutionalQuality: 10,
      legitimacyLevel: 10,
      stabilityIndex: 15,
      socialTrust: 10,
      corruptionLevel: 70,
      educationQuality: 15,
      culturalCohesion: 15,
      militaryPower: 25,
      urbanizationRate: 5,
      polarizationLevel: 95,
      epistemicHealth: 15,
      institutionalLockin: 30,
      ethnicFractionalization: 65,
      landConcentration: 35,   // Mostly subsistence smallholdings, some elite concentration
      casteRigidity: 25,       // Tutsi/Hutu hierarchy was ethnic not caste, but had rigid social barriers
    },
    benchmarks: {
      source: 'V-Dem, Polity5 (-7→-3), Maddison, Afrobarometer, TI CPI, Mo Ibrahim',
      historicalPeriod: '1990-2020',
    },
    // Key question: can the model produce recovery from near-zero starting conditions?
    // Rwanda is the most challenging case — extreme initial weakness, then dramatic improvement.
    expectations: {
      stability: '<20 by turn 5',
      wellbeing: 'rising after turn 10',
      corruption: 'declining after turn 10',
    },
    waypoints: [
      { turn: 5, label: '~1994 genocide/collapse', checks: {
        stability: { op: '<', val: 20, note: 'State collapse' },
      }},
      { turn: 15, label: '~2005 recovery begins', checks: {
        stateCapacity: { op: '>', val: 25, note: 'RPF rebuilding state capacity' },
        wellbeing: { op: '>', val: 15, note: 'GDP growth averaging 7-8%' },
      }},
      { turn: 30, label: '~2020 developmental state', checks: {
        stateCapacity: { op: '>', val: 40, note: 'Significant institutional development' },
        corruption: { op: '<', val: 55, note: 'TI CPI improved to ~54/100' },
        genderEquity: { op: '>', val: 25, note: 'World-leading female representation' },
      }},
    ],
  },

];

if (typeof module !== 'undefined') module.exports = { HINDCAST_SCENARIOS };
