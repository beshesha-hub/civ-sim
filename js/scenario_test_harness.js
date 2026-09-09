/**
 * Historical Scenario Test Harness
 * Programmatically runs 10 historical scenarios × 3 runs each,
 * collecting per-turn snapshots and final metrics.
 *
 * Usage: Load in browser console, then call runAllScenarios()
 */

const HISTORICAL_SCENARIOS = [
  {
    id: 'rome',
    name: 'Late Roman Republic / Early Empire',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Roman Republic',
      civColor: '#e74c3c',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'oligarchy', hierarchyLevel: 70, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 40, collectivismLevel: 30, participationVoluntary: 40,
        outsiderRelationship: 'trading', coreValues: ['military strength', 'civic duty'],
        innovationTolerance: 50,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 45, genderEquity: 15, debtModel: 'standard', tariffLevel: 25 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 40, scienceFreedomConstraint: 'none', artsSupport: 50, artsFreedom: 60, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 72,               // Roman provincial admin was the best in the ancient world
      institutionalQuality: 55,        // Roman law, magistrates, censors, cursus honorum
      legitimacyLevel: 72,             // SPQR — exceptionally strong civic-republican legitimacy
      stabilityIndex: 65,              // Republic was remarkably stable (500 year constitutional frame)
      socialTrust: 48,                 // Strong civic identity, but patron-client inequality
      corruptionLevel: 15,             // Early Republic relatively clean; censors enforced norms
      educationQuality: 45,            // Rhetoric schools, legal education, Greek tutors
      culturalCohesion: 65,            // Strong Roman civic identity, mos maiorum
    },
    expectations: {
      wealthConcentration: '>60 by turn 80',
      militaryPower: '>60 by turn 100',
      institutionalQuality: 'declining after turn 100',
      socialTrust: '<50 by turn 80',
    }
  },
  {
    id: 'song_dynasty',
    name: 'Song Dynasty China',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Song China',
      civColor: '#f1c40f',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 85, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 35, collectivismLevel: 60, participationVoluntary: 30,
        outsiderRelationship: 'trading', coreValues: ['order', 'scholarship'],
        innovationTolerance: 55,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal_lower', educationQuality: 60, genderEquity: 15, debtModel: 'standard', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 55, scienceFreedom: 55, scienceFreedomConstraint: 'government', artsSupport: 60, artsFreedom: 50, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'balanced', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 58,               // Civil service exam system — effective bureaucracy
      institutionalQuality: 48,        // Meritocratic but rigid
      educationQuality: 60,            // World-leading scholarship, printing
      socialTrust: 45,                 // Confucian social order
      corruptionLevel: 30,             // Moderate — exams reduced but didn't eliminate
      legitimacyLevel: 60,             // Mandate of heaven + meritocratic legitimacy
    },
    expectations: {
      urbanization: '>40 by turn 80',
      stateCapacity: '>60 sustained',
      institutionalLockIn: 'rising after turn 100',
    }
  },
  {
    id: 'haudenosaunee',
    name: 'Haudenosaunee Confederacy',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Haudenosaunee',
      civColor: '#2ecc71',
      aiCivCount: 3,
      economic: { model: 'gift', scarcityOrientation: 15, accumulationAllowed: false },
      governance: { model: 'flat_consensus', hierarchyLevel: 5, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 80, collectivismLevel: 75, participationVoluntary: 90,
        outsiderRelationship: 'trading', coreValues: ['mutual aid', 'ecological balance'],
        innovationTolerance: 50,
      },
      religion: { presence: 'animist', stateRelationship: 'separate', propagation: 'communal', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: false, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 35, genderEquity: 80, debtModel: 'debtless', tariffLevel: 15 },
      societyFamily: { familyStructure: 'community_clan', reproductiveHealthTier: 'available', womensRightsTier: 'full_parity', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 50, scienceFreedomConstraint: 'none', artsSupport: 60, artsFreedom: 70, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'conservation', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    expectations: {
      socialTrust: '>60 sustained',
      wealthConcentration: '<30 sustained',
      genderEquity: '>65 sustained',
      stability: '>60 sustained',
    }
  },
  {
    id: 'british_industrial',
    name: 'British Industrial Revolution',
    turns: 300,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Industrial Britain',
      civColor: '#3498db',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 55, collectivismLevel: 30, participationVoluntary: 50,
        outsiderRelationship: 'trading', coreValues: ['property rights', 'free trade'],
        innovationTolerance: 65,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'missionary', tolerance: 'restrictive' },
      worldClimate: { warmth: -1, moisture: 1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 55, genderEquity: 15, debtModel: 'standard', tariffLevel: 15 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 60, scienceFreedom: 65, scienceFreedomConstraint: 'capital', artsSupport: 50, artsFreedom: 60, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    expectations: {
      urbanization: 'rising rapidly after turn 80',
      wealthConcentration: '>65 by turn 180',
      demographicStage: '>1 by turn 150',
    }
  },
  {
    id: 'scandinavia',
    name: 'Scandinavian Social Democracy',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Nordic Federation',
      civColor: '#1abc9c',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 80, collectivismLevel: 60, participationVoluntary: 85,
        outsiderRelationship: 'welcoming', coreValues: ['equality', 'solidarity', 'sustainability'],
        innovationTolerance: 75,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: -1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 80, genderEquity: 85, debtModel: 'debtless', tariffLevel: 15 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'scandinavian', womensRightsTier: 'full_parity', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 75, scienceFreedom: 80, scienceFreedomConstraint: 'none', artsSupport: 70, artsFreedom: 80, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    expectations: {
      equality: '>65 sustained',
      socialTrust: '>70 sustained',
      epistemicHealth: '>70 sustained',
      wellbeing: 'rising to high levels',
    }
  },
  {
    id: 'khmer',
    name: 'Khmer Empire (Angkor)',
    turns: 300,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Khmer Empire',
      civColor: '#9b59b6',
      aiCivCount: 3,
      economic: { model: 'planned', scarcityOrientation: 45, accumulationAllowed: false },
      governance: { model: 'theocratic', hierarchyLevel: 75, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 20, collectivismLevel: 50, participationVoluntary: 20,
        outsiderRelationship: 'trading', coreValues: ['divine order', 'monumental construction'],
        innovationTolerance: 30,
      },
      religion: { presence: 'theocratic', stateRelationship: 'theocratic', propagation: 'aggressive', tolerance: 'restrictive' },
      worldClimate: { warmth: 2, moisture: 1 },
      geography: { oceanAccess: false, placement: 'continent' },
      society: { educationAccess: 'limited', educationQuality: 35, genderEquity: 15, debtModel: 'standard', tariffLevel: 30 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 25, scienceFreedom: 25, scienceFreedomConstraint: 'religion', artsSupport: 60, artsFreedom: 30, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    expectations: {
      casteRigidity: '>55 sustained',
      institutionalLockIn: 'rising',
      ecologicalOvershoot: 'PROSE — overshoot is an event, not a level',
      stateCapacity: '>30 early',                           // Seshat: Hier 5.67, hydraulic state (KhAngkC)
    }
  },
  {
    id: 'ottoman',
    name: 'Ottoman Empire (Classical)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Ottoman Empire',
      civColor: '#e67e22',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 85, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 35, collectivismLevel: 50, participationVoluntary: 25,
        outsiderRelationship: 'trading', coreValues: ['order', 'imperial greatness'],
        innovationTolerance: 45,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: -1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 50, genderEquity: 15, debtModel: 'standard', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 45, scienceFreedom: 45, scienceFreedomConstraint: 'religion', artsSupport: 55, artsFreedom: 45, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'balanced', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      legitimacyLevel: 75,             // Strong traditional + religious + performance legitimacy
      militaryBurden: 15,              // Significant military establishment
      culturalCohesion: 70,            // Strong Islamic cultural identity + millet system
      stateCapacity: 62,               // Devshirme system was highly effective state-building
      institutionalQuality: 45,        // Meritocratic bureaucracy (devshirme) above-average
      stabilityIndex: 60,              // Imperial stability — strong early Sultans
      corruptionLevel: 20,             // Low initial corruption (devshirme prevented hereditary elite)
      socialTrust: 45,                 // Millet system created functional multi-ethnic coexistence
      educationQuality: 55,            // Medrese system, scholarly tradition
    },
    expectations: {
      stateCapacity: '>60 early, declining after turn 100',
      militaryPower: '>60 sustained',                       // Seshat: MilTech 30.9, Janissary professional army (TrOttm3)
      institutionalLockIn: 'rising',
      institutionalLockIn: '>60 sustained',
      institutionalQuality: '>40 early',                    // Seshat: Gov 1.0, devshirme bureaucracy (TrOttm2/3)
    }
  },
  {
    id: 'post_colonial',
    name: 'Post-Colonial Sub-Saharan State',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Post-Colonial State',
      civColor: '#27ae60',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 45, collectivismLevel: 55, participationVoluntary: 40,
        outsiderRelationship: 'trading', coreValues: ['independence', 'development'],
        innovationTolerance: 40,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'communal', tolerance: 'accepting' },
      worldClimate: { warmth: 2, moisture: 0 },
      geography: { oceanAccess: false, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 30, genderEquity: 20, debtModel: 'standard', tariffLevel: 10 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 30, scienceFreedom: 40, scienceFreedomConstraint: 'capital', artsSupport: 40, artsFreedom: 50, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      institutionalLockin: 80,          // Colonial institutions persist (extractive legacy)
      ethnicFractionalization: 80,      // Arbitrary colonial borders → high fractionalization
      politicalInclusion: 20,           // Low inclusion (ethnic patronage politics)
      institutionalQuality: 15,         // Very weak inherited institutions
      corruptionLevel: 60,              // Corruption from colonial extraction legacy
      stateCapacity: 15,                // Very low state capacity (colonial state served metropole)
      stabilityIndex: 35,               // Fragile post-independence stability
      socialTrust: 25,                  // Low generalized trust (colonial divide-and-rule)
    },
    expectations: {
      institutionalQuality: '<45 by turn 60',
      youthBulge: 'PROSE — no youth cohort field in snapshot',
      wealthCapture: '>40 sustained',
    }
  },
  {
    id: 'athens',
    name: 'Classical Athens',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Athens',
      civColor: '#f39c12',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'direct_congress', hierarchyLevel: 10, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 65, collectivismLevel: 40, participationVoluntary: 60,
        outsiderRelationship: 'trading', coreValues: ['civic virtue', 'intellectual inquiry'],
        innovationTolerance: 70,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 55, genderEquity: 5, debtModel: 'standard', tariffLevel: 15 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'forbidden', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 65, scienceFreedom: 70, scienceFreedomConstraint: 'none', artsSupport: 70, artsFreedom: 75, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    expectations: {
      epistemicHealth: '>55 sustained',
      genderEquity: '<25 sustained',
      wealthConcentration: 'rising after turn 60',
    }
  },
  {
    id: 'soviet',
    name: 'Soviet Union',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Soviet Union',
      civColor: '#c0392b',
      aiCivCount: 3,
      economic: { model: 'planned', scarcityOrientation: 45, accumulationAllowed: false },
      governance: { model: 'autocratic', hierarchyLevel: 85, participationModel: 'mandatory' },
      operatingPrinciples: {
        freedomLevel: 20, collectivismLevel: 85, participationVoluntary: 15,
        outsiderRelationship: 'isolationist', coreValues: ['collective progress', 'state power'],
        innovationTolerance: 50,
      },
      religion: { presence: 'none', stateRelationship: 'separate', propagation: 'passive', tolerance: 'persecutory' },
      worldClimate: { warmth: -2, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 65, genderEquity: 55, debtModel: 'debtless', tariffLevel: 80 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'mostly_full', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 65, scienceFreedom: 50, scienceFreedomConstraint: 'government', artsSupport: 50, artsFreedom: 20, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'total_information_control' },
    },
    initialState: {
      legitimacyLevel: 65,             // Revolutionary ideological legitimacy
      militaryBurden: 20,              // Large military establishment
      stateCapacity: 55,               // Strong-ish state capacity (planned economy)
      institutionalQuality: 30,        // Rigid, extractive institutions
      stabilityIndex: 55,              // State-enforced stability (fragile)
      corruptionLevel: 35,             // Nomenklatura privilege seeking
      institutionalLockin: 60,         // Planned economy structural rigidity
    },
    expectations: {
      epistemicHealth: 'declining under info control',
      institutionalLockIn: '>65 sustained',
      wealthConcentration: '<45 sustained',
      urbanization: 'rising after turn 40',
    }
  },
];

// ── OUT-OF-SAMPLE VALIDATION SCENARIOS ──────────────────────────────
// These were NOT seen during development. No tuning was performed against them.

const VALIDATION_SCENARIOS = [
  // ── UNTESTED HISTORICAL CIVILIZATIONS ──────────────────────────────

  // 1. Tokugawa Japan (1603-1868): Isolated, stable feudal state with high culture
  {
    id: 'tokugawa',
    name: 'Tokugawa Japan (Edo Period)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Tokugawa Japan',
      civColor: '#d63031',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 40, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 90, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 20, collectivismLevel: 70, participationVoluntary: 15,
        outsiderRelationship: 'isolationist', coreValues: ['order', 'duty'],
        innovationTolerance: 25,
      },
      religion: { presence: 'plurality', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'restrictive' },
      worldClimate: { warmth: 0, moisture: 1 },
      geography: { oceanAccess: true, placement: 'island' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 55, genderEquity: 10, debtModel: 'standard', tariffLevel: 90 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 35, scienceFreedom: 30, scienceFreedomConstraint: 'government', artsSupport: 70, artsFreedom: 55, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'prevention', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 65,               // Bakuhan system — effective feudal administration
      institutionalQuality: 50,        // Rigid but functional caste-based order
      legitimacyLevel: 75,             // Strong traditional legitimacy + Confucian order
      stabilityIndex: 80,              // 250 years of peace (Pax Tokugawa)
      socialTrust: 55,                 // High in-group trust, rigid social stratification
      corruptionLevel: 25,             // Moderate — feudal rent-seeking
      educationQuality: 55,            // Terakoya schools, high literacy (~40%)
      culturalCohesion: 85,            // Extreme cultural homogeneity, sakoku isolation
      casteRigidity: 75,               // Shi-no-ko-sho rigid caste system
      institutionalLockin: 70,         // Very rigid institutional structure
    },
    expectations: {
      stability: '>65 early, declining after turn 120',
      institutionalLockIn: 'very high',
      innovationTolerance: '<45 sustained',
      culturalCohesion: '>65 sustained',
      schismRisk: 'rising after turn 120',
      militaryPower: '>40 sustained',              // Seshat: MilLev 6, professional army (JpTokgw)
      stateCapacity: '>50 early, declining after turn 120', // Seshat: AdmLev 7 → bakuhan decline
    }
  },

  // 2. Mughal India (1526-1857): Multi-ethnic empire, syncretic culture, declining central authority
  {
    id: 'mughal',
    name: 'Mughal Empire',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Mughal Empire',
      civColor: '#6c5ce7',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 55, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 80, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 30, collectivismLevel: 45, participationVoluntary: 20,
        outsiderRelationship: 'trading', coreValues: ['imperial grandeur', 'cultural synthesis'],
        innovationTolerance: 45,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'accepting' },
      worldClimate: { warmth: 2, moisture: 1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'limited', educationQuality: 40, genderEquity: 10, debtModel: 'standard', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'forbidden', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 40, scienceFreedomConstraint: 'religion', artsSupport: 65, artsFreedom: 50, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 55,               // Mansabdari system — effective but dependent on center
      institutionalQuality: 40,        // Syncretic administration but personal-rule dependent
      legitimacyLevel: 70,             // Divine right + military prestige + cultural patronage
      stabilityIndex: 55,              // Stable under strong rulers, fragile under weak ones
      socialTrust: 35,                 // Multi-religious, multi-ethnic — functional coexistence
      corruptionLevel: 30,             // Moderate — jagirdari system prone to extraction
      educationQuality: 40,            // Madrasas + Persian court culture, limited mass access
      culturalCohesion: 45,            // Syncretic (Akbar) but underlying Hindu-Muslim tension
      ethnicFractionalization: 75,     // Very high — dozens of ethnic/linguistic groups
      casteRigidity: 70,               // Hindu caste system deeply embedded
    },
    expectations: {
      ethnicFractionalization: '>50 sustained',
      schismRisk: '>35 sustained',
      stateCapacity: '>60 early, declining after turn 120',
      casteRigidity: '>55 sustained',
      militaryPower: '>55 sustained',               // Seshat: MilLev 9, professional army (InMugl*)
    }
  },

  // 3. Venetian Republic (697-1797): Merchant oligarchy, naval power, republican longevity
  {
    id: 'venice',
    name: 'Venetian Republic',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Venetian Republic',
      civColor: '#00b894',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 80, accumulationAllowed: true },
      governance: { model: 'oligarchy', hierarchyLevel: 55, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 45, collectivismLevel: 35, participationVoluntary: 35,
        outsiderRelationship: 'trading', coreValues: ['commerce', 'civic duty'],
        innovationTolerance: 60,
      },
      religion: { presence: 'dominant', stateRelationship: 'separate', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'island' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 50, genderEquity: 10, debtModel: 'standard', tariffLevel: 15 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 50, scienceFreedom: 55, scienceFreedomConstraint: 'capital', artsSupport: 65, artsFreedom: 60, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 60,               // Remarkably efficient bureaucracy for size
      institutionalQuality: 55,        // Great Council, Doge elections, complex checks
      legitimacyLevel: 65,             // Republican civic identity — Myth of Venice
      stabilityIndex: 75,              // 1100 years of continuous governance
      socialTrust: 50,                 // Civic trust among patricians, weaker for popolani
      corruptionLevel: 20,             // Council of Ten kept corruption in check
      educationQuality: 50,            // Trade-oriented education, printing center
      culturalCohesion: 70,            // Strong Venetian identity
    },
    expectations: {
      wealthConcentration: 'rising after turn 60',
      stability: '>65 early, declining after turn 120',
      institutionalLockIn: 'rising after turn 60',
      trade: 'strong but declining as Atlantic trade rises',
      epistemicHealth: '>35 sustained',              // Seshat: max info complexity (ItVenR3/R4)
    }
  },

  // 4. Ptolemaic Egypt (305-30 BC): Greek ruling class over Egyptian population
  {
    id: 'ptolemaic',
    name: 'Ptolemaic Egypt',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Ptolemaic Egypt',
      civColor: '#fdcb6e',
      aiCivCount: 3,
      economic: { model: 'planned', scarcityOrientation: 55, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 90, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 25, collectivismLevel: 55, participationVoluntary: 15,
        outsiderRelationship: 'trading', coreValues: ['divine kingship', 'monumental architecture'],
        innovationTolerance: 40,
      },
      religion: { presence: 'theocratic', stateRelationship: 'theocratic', propagation: 'communal', tolerance: 'accepting' },
      worldClimate: { warmth: 2, moisture: -1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'limited', educationQuality: 50, genderEquity: 20, debtModel: 'standard', tariffLevel: 25 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 55, scienceFreedom: 50, scienceFreedomConstraint: 'government', artsSupport: 55, artsFreedom: 45, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 60,               // Highly effective bureaucratic state (grain tax system)
      institutionalQuality: 45,        // Greek administrative layer over Egyptian traditions
      legitimacyLevel: 60,             // Pharaonic legitimacy adopted by Greek rulers
      stabilityIndex: 50,              // Stable but reliant on strong ruler
      socialTrust: 30,                 // Ethnic divide between Greek elite and Egyptian majority
      corruptionLevel: 35,             // Tax farming + absentee landlords
      educationQuality: 50,            // Library of Alexandria, Museum — elite education
      culturalCohesion: 35,            // Deep Greek/Egyptian cultural divide
      ethnicFractionalization: 65,     // Greek rulers, Egyptian majority, Jewish minority
    },
    expectations: {
      ethnicFractionalization: '>50 sustained',
      schismRisk: '>30 sustained',
      stateCapacity: '>50 early, declining after turn 120', // Seshat: AdmLev 6, replaced prose (EgPtol1/2)
      corruption: 'rising after turn 100',
    }
  },

  // ── NOVEL (UNTESTED CONFIGURATION) SCENARIOS ──────────────────────

  // 5. High-Tech Theocracy: What if a theocratic state achieved strong institutions?
  // No direct historical analog — tests edge case
  {
    id: 'tech_theocracy',
    name: 'Novel: High-Tech Theocracy',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Techno-Theocracy',
      civColor: '#a29bfe',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'theocratic', hierarchyLevel: 70, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 30, collectivismLevel: 65, participationVoluntary: 30,
        outsiderRelationship: 'trading', coreValues: ['divine order', 'knowledge'],
        innovationTolerance: 55,
      },
      religion: { presence: 'theocratic', stateRelationship: 'theocratic', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 70, genderEquity: 30, debtModel: 'standard', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 60, scienceFreedom: 50, scienceFreedomConstraint: 'religion', artsSupport: 55, artsFreedom: 40, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'balanced', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 60,               // Strong institutions — Islamic Golden Age model
      institutionalQuality: 55,        // Good bureaucracy despite theocratic overlay
      educationQuality: 70,            // Universal religious + secular education
      legitimacyLevel: 75,             // Strong theocratic legitimacy
      stabilityIndex: 70,              // Stable from religious authority + institutions
      socialTrust: 55,                 // In-group solidarity
      corruptionLevel: 15,             // Religious accountability norms
    },
    expectations: {
      note: 'NOVEL — no tuning against this scenario',
      question: 'Can theocracy sustain with strong institutions? Islamic Golden Age says partially yes',
      schismRisk: '>35 by turn 200',
      institutionalLockIn: 'rising after turn 60',
    }
  },

  // 6. Egalitarian Market: What if a market economy had strong equality institutions?
  // Partial analog: post-war Japan, South Korea, Taiwan (developmental state with markets)
  {
    id: 'egalitarian_market',
    name: 'Novel: Egalitarian Market Economy',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Egalitarian Market',
      civColor: '#55efc4',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 60, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 25, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 75, collectivismLevel: 55, participationVoluntary: 80,
        outsiderRelationship: 'welcoming', coreValues: ['equality', 'innovation'],
        innovationTolerance: 70,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 75, genderEquity: 75, debtModel: 'standard', tariffLevel: 15 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'scandinavian', womensRightsTier: 'full_parity', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 70, scienceFreedom: 75, scienceFreedomConstraint: 'none', artsSupport: 65, artsFreedom: 70, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    initialState: {
      stateCapacity: 60,
      institutionalQuality: 65,
      socialTrust: 65,
      stabilityIndex: 70,
      legitimacyLevel: 70,
      corruptionLevel: 10,
      educationQuality: 75,
    },
    expectations: {
      note: 'NOVEL — tests whether market + equality institutions can coexist long-term',
      question: 'Does wealth concentration inevitably overwhelm equality institutions?',
      wealthConcentration: '<70 sustained',
    }
  },

  // 7. Isolationist Commune: Small-scale, self-sufficient, deliberately non-expansionist
  // Partial analogs: Amish communities, kibbutzim, Bhutan
  {
    id: 'isolationist_commune',
    name: 'Novel: Isolationist Commune',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Isolated Commune',
      civColor: '#81ecec',
      aiCivCount: 3,
      economic: { model: 'gift', scarcityOrientation: 20, accumulationAllowed: false },
      governance: { model: 'elder_council', hierarchyLevel: 25, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 60, collectivismLevel: 80, participationVoluntary: 70,
        outsiderRelationship: 'isolationist', coreValues: ['simplicity', 'community'],
        innovationTolerance: 20,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'restrictive' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: false, placement: 'inland' },
      society: { educationAccess: 'universal_lower', educationQuality: 40, genderEquity: 40, debtModel: 'debtless', tariffLevel: 90 },
      societyFamily: { familyStructure: 'community_clan', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 20, scienceFreedom: 25, scienceFreedomConstraint: 'religion', artsSupport: 40, artsFreedom: 35, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'conservation', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stabilityIndex: 85,
      socialTrust: 80,
      culturalCohesion: 90,
      corruptionLevel: 5,
      institutionalLockin: 50,
    },
    expectations: {
      note: 'NOVEL — tests sustainability of deliberate isolation',
      question: 'Can isolation protect stability, or does tech gap create vulnerability?',
      techLevel: '<8 sustained',
      stability: '>60 sustained',
    }
  },

  // 8. Military-Industrial Autocracy: High military spending, planned economy, expansionist
  // Partial analogs: Prussian militarism, Spartan society, North Korea
  {
    id: 'military_autocracy',
    name: 'Novel: Military-Industrial Autocracy',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Military State',
      civColor: '#636e72',
      aiCivCount: 3,
      economic: { model: 'planned', scarcityOrientation: 60, accumulationAllowed: false },
      governance: { model: 'autocratic', hierarchyLevel: 90, participationModel: 'mandatory' },
      operatingPrinciples: {
        freedomLevel: 15, collectivismLevel: 75, participationVoluntary: 10,
        outsiderRelationship: 'aggressive', coreValues: ['military strength', 'state power'],
        innovationTolerance: 40,
      },
      religion: { presence: 'none', stateRelationship: 'separate', propagation: 'passive', tolerance: 'persecutory' },
      worldClimate: { warmth: -1, moisture: 0 },
      geography: { oceanAccess: false, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 55, genderEquity: 30, debtModel: 'debtless', tariffLevel: 80 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 55, scienceFreedom: 35, scienceFreedomConstraint: 'government', artsSupport: 25, artsFreedom: 15, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'treatment', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'total_information_control' },
    },
    initialState: {
      stateCapacity: 65,
      militaryBurden: 25,
      institutionalQuality: 35,
      legitimacyLevel: 55,
      stabilityIndex: 60,
      socialTrust: 30,
      corruptionLevel: 30,
    },
    expectations: {
      note: 'NOVEL — tests military-first state sustainability',
      question: 'Does military dominance drain civilian institutions over time?',
      militaryPower: '>60 sustained',
      wellbeing: '<50 sustained',
      anomie: 'rising after turn 60',
    }
  },
];

// ═══════════════════════════════════════════════════════════════
// REAL-COUNTRY CALIBRATION SCENARIOS
// These map contemporary nations to civ-sim configs and compare
// simulated trajectories against World Bank, V-Dem, Polity, and
// UNDP benchmarks. Validation only — no model tuning against these.
//
// Mapping conventions (real-world → sim 0-100):
//   Gini (0-100)                → wealthConcentration (~direct)
//   V-Dem Liberal Democracy 0-1 → freedomLevel, politicalInclusion (~×80)
//   WGI Govt Effectiveness      → stateCapacity (−2.5→10, 0→50, +2.5→90)
//   WGI Control of Corruption   → corruptionLevel (inverted: +2.5→5, 0→50, −2.5→90)
//   HDI 0-1                     → wellbeing proxy (~×85+10)
//   Ethnic Frac 0-1             → ethnicFractionalization (×100)
//   Social trust WVS %          → socialTrust (~direct)
// ═══════════════════════════════════════════════════════════════
const CALIBRATION_SCENARIOS = [

  // ── 1. DENMARK — Nordic social democracy ──────────────────
  // Gini 28, V-Dem 0.90, Polity +10, HDI 0.952, WGI GovEff 1.9, WGI CoC 2.2
  // Labor share ~62%, Military 1.4% GDP, Ethnic frac 0.08, Social trust 74%
  {
    id: 'cal_denmark',
    name: 'Calibration: Denmark (Nordic Social Democracy)',
    turns: 200,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Denmark',
      civColor: '#c0392b',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 45, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 20, powerConcentration: 20, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 80, collectivismLevel: 65, participationVoluntary: 85,
        outsiderRelationship: 'welcoming', coreValues: ['equality', 'civic duty'],
        innovationTolerance: 70,
      },
      religion: { presence: 'nominal', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: -1, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 78, genderEquity: 80, debtModel: 'regulated_credit', tariffLevel: 10 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'scandinavian', womensRightsTier: 'full_parity', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 70, scienceFreedom: 80, scienceFreedomConstraint: 'none', artsSupport: 65, artsFreedom: 80, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    initialState: {
      stateCapacity: 82,
      institutionalQuality: 78,
      legitimacyLevel: 80,
      stabilityIndex: 82,
      socialTrust: 74,
      corruptionLevel: 8,
      educationQuality: 78,
      culturalCohesion: 80,
      ethnicFractionalization: 8,
      cleavageCrosscutting: 70,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024',
      gini: 28, vdem: 0.90, polity: 10, hdi: 0.962,
      govEffectiveness: 1.91, controlCorruption: 2.29, laborShare: 56,
      militaryPctGDP: 1.4, ethnicFrac: 0.08, socialTrustWVS: 74,
    },
    expectations: {
      wealthConcentration: '<45 sustained',
      stability: '>65 sustained',
      corruption: '<25 sustained',
      socialTrust: '>55 sustained',
      wellbeing: '>60 sustained',
      equality: '>55 sustained',
      epistemicHealth: '>55 sustained',
    }
  },

  // ── 2. UNITED STATES — Liberal market democracy ───────────
  // Gini 41, V-Dem 0.74, Polity +8, HDI 0.921, WGI GovEff 1.5, WGI CoC 1.2
  // Labor share ~58%, Military 3.5% GDP, Ethnic frac 0.49, Social trust 31%
  {
    id: 'cal_usa',
    name: 'Calibration: United States (Liberal Market Democracy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'United States',
      civColor: '#2980b9',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 75, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 35, powerConcentration: 25, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 70, collectivismLevel: 25, participationVoluntary: 75,
        outsiderRelationship: 'trading', coreValues: ['individual liberty', 'innovation'],
        innovationTolerance: 75,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'proselytizing', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 65, genderEquity: 60, debtModel: 'market_debt', tariffLevel: 10 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 70, scienceFreedom: 75, scienceFreedomConstraint: 'capital', artsSupport: 50, artsFreedom: 75, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'provider_revenue' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 72,
      institutionalQuality: 62,
      legitimacyLevel: 65,
      stabilityIndex: 62,
      socialTrust: 31,
      corruptionLevel: 28,
      educationQuality: 65,
      culturalCohesion: 45,
      ethnicFractionalization: 49,
      cleavageCrosscutting: 25,
      polarizationLevel: 40,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, SIPRI 2023',
      gini: 41, vdem: 0.74, polity: 8, hdi: 0.937,
      govEffectiveness: 1.36, controlCorruption: 1.09, laborShare: 55,
      militaryPctGDP: 3.5, ethnicFrac: 0.49, socialTrustWVS: 37,
    },
    expectations: {
      wealthConcentration: '>45 sustained',
      stability: '>45 sustained',
      corruption: '<45 sustained',
      socialTrust: '<50 sustained',
      wellbeing: '>50 sustained',
      militaryPower: '>50 sustained',
      epistemicHealth: '>40 sustained',
    }
  },

  // ── 3. CHINA — Authoritarian state capitalism ─────────────
  // Gini 38, V-Dem 0.06, Polity −7, HDI 0.788, WGI GovEff 0.5, WGI CoC −0.2
  // Labor share ~52%, Military 1.7% GDP, Ethnic frac 0.15, Social trust 64%
  {
    id: 'cal_china',
    name: 'Calibration: China (State Capitalism)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'China',
      civColor: '#e74c3c',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 60, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 80, participationModel: 'mandatory' },
      operatingPrinciples: {
        freedomLevel: 15, collectivismLevel: 70, participationVoluntary: 10,
        outsiderRelationship: 'trading', coreValues: ['order', 'national revival'],
        innovationTolerance: 55,
      },
      religion: { presence: 'none', stateRelationship: 'separate', propagation: 'passive', tolerance: 'restrictive' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 60, genderEquity: 40, debtModel: 'regulated_credit', tariffLevel: 25 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'discouraged' },
      societyCulture: { scienceSupport: 65, scienceFreedom: 40, scienceFreedomConstraint: 'government', artsSupport: 45, artsFreedom: 25, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'balanced', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'total_information_control' },
    },
    initialState: {
      stateCapacity: 70,
      institutionalQuality: 48,
      legitimacyLevel: 62,
      stabilityIndex: 65,
      socialTrust: 64,
      corruptionLevel: 38,
      educationQuality: 60,
      culturalCohesion: 72,
      ethnicFractionalization: 15,
      cleavageCrosscutting: 40,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024',
      gini: 36, vdem: 0.06, polity: -7, hdi: 0.797,
      govEffectiveness: 0.90, controlCorruption: 0.09, laborShare: 51,
      militaryPctGDP: 1.7, ethnicFrac: 0.15, socialTrustWVS: 64,
    },
    expectations: {
      wealthConcentration: '>35 sustained',
      stability: '>50 sustained',
      stateCapacity: '>50 sustained',
      wellbeing: '>40 sustained',
      institutionalLockIn: '>40 sustained',
      epistemicHealth: '<50 sustained',
    }
  },

  // ── 4. NIGERIA — Post-colonial multi-ethnic state ─────────
  // Gini 35, V-Dem 0.34, Polity +7 (fragile), HDI 0.539, WGI GovEff −1.0, WGI CoC −1.1
  // Labor share ~45%, Military 0.7% GDP, Ethnic frac 0.85, Social trust 15%
  {
    id: 'cal_nigeria',
    name: 'Calibration: Nigeria (Post-Colonial Multi-Ethnic)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Nigeria',
      civColor: '#27ae60',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 65, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 55, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 35, collectivismLevel: 40, participationVoluntary: 40,
        outsiderRelationship: 'trading', coreValues: ['ethnic solidarity', 'resource access'],
        innovationTolerance: 40,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'proselytizing', tolerance: 'restrictive' },
      worldClimate: { warmth: 2, moisture: 1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'limited', educationQuality: 30, genderEquity: 20, debtModel: 'predatory_debt', tariffLevel: 30 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 25, scienceFreedom: 35, scienceFreedomConstraint: 'capital', artsSupport: 40, artsFreedom: 45, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'minimal_traditional', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 28,
      institutionalQuality: 25,
      legitimacyLevel: 35,
      stabilityIndex: 35,
      socialTrust: 15,
      corruptionLevel: 65,
      educationQuality: 30,
      culturalCohesion: 20,
      ethnicFractionalization: 85,
      cleavageCrosscutting: 15,
      polarizationLevel: 50,
      resourceRentDependence: 55,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, Alesina et al.',
      gini: 34, vdem: 0.34, polity: 7, hdi: 0.539,
      govEffectiveness: -1.0, controlCorruption: -1.1, laborShare: 45,
      militaryPctGDP: 0.7, ethnicFrac: 0.85, socialTrustWVS: 15,
    },
    expectations: {
      corruption: '>45 sustained',
      socialTrust: '<35 sustained',
      ethnicFractionalization: '>50 sustained',
      schismRisk: '>25 sustained',
      stateCapacity: '<50 sustained',
      wellbeing: '<55 sustained',
    }
  },

  // ── 5. SAUDI ARABIA — Petro-theocratic monarchy ───────────
  // Gini 46 (est), V-Dem 0.02, Polity −10, HDI 0.875, WGI GovEff 0.3, WGI CoC 0.2
  // Labor share ~35%, Military 6.0% GDP, Ethnic frac 0.18, Social trust ~35%
  {
    id: 'cal_saudi',
    name: 'Calibration: Saudi Arabia (Petro-Theocratic Monarchy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Saudi Arabia',
      civColor: '#2ecc71',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'theocratic', hierarchyLevel: 90, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 10, collectivismLevel: 55, participationVoluntary: 5,
        outsiderRelationship: 'trading', coreValues: ['divine order', 'resource wealth'],
        innovationTolerance: 30,
      },
      religion: { presence: 'theocratic', stateRelationship: 'theocratic', propagation: 'proselytizing', tolerance: 'restrictive' },
      worldClimate: { warmth: 2, moisture: -2 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal_lower', educationQuality: 45, genderEquity: 15, debtModel: 'regulated_credit', tariffLevel: 15 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'forbidden', familySizePolicy: 'large_encouraged' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 25, scienceFreedomConstraint: 'religion', artsSupport: 30, artsFreedom: 15, artsFreedomConstraint: 'religion' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 65,
      institutionalQuality: 38,
      legitimacyLevel: 65,
      stabilityIndex: 60,
      socialTrust: 50,
      corruptionLevel: 22,
      educationQuality: 45,
      culturalCohesion: 65,
      resourceRentDependence: 75,
      ethnicFractionalization: 18,
      cleavageCrosscutting: 30,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, SIPRI 2023',
      gini: 46, vdem: 0.02, polity: -10, hdi: 0.900,
      govEffectiveness: 0.30, controlCorruption: 0.20, laborShare: 31,
      militaryPctGDP: 6.4, ethnicFrac: 0.18, socialTrustWVS: 50,
    },
    expectations: {
      wealthConcentration: '>50 sustained',
      institutionalLockIn: '>40 sustained',
      epistemicHealth: '<45 sustained',
      genderEquity: '<35 sustained',
      militaryPower: '>45 sustained',
    }
  },

  // ── 6. SINGAPORE — Developmental authoritarian city-state ──
  // Gini 45, V-Dem 0.35, Polity −2, HDI 0.939, WGI GovEff 2.2, WGI CoC 2.1
  // Labor share ~48%, Military 3.0% GDP, Ethnic frac 0.39, Social trust 40%
  {
    id: 'cal_singapore',
    name: 'Calibration: Singapore (Developmental Authoritarian)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Singapore',
      civColor: '#e67e22',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 70, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 60, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 35, collectivismLevel: 55, participationVoluntary: 30,
        outsiderRelationship: 'trading', coreValues: ['meritocracy', 'pragmatism'],
        innovationTolerance: 65,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: 2, moisture: 2 },
      geography: { oceanAccess: true, placement: 'island' },
      society: { educationAccess: 'universal', educationQuality: 80, genderEquity: 55, debtModel: 'regulated_credit', tariffLevel: 5 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'discouraged' },
      societyCulture: { scienceSupport: 75, scienceFreedom: 60, scienceFreedomConstraint: 'government', artsSupport: 50, artsFreedom: 40, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'balanced', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 85,
      institutionalQuality: 75,
      legitimacyLevel: 72,
      stabilityIndex: 80,
      socialTrust: 40,
      corruptionLevel: 5,
      educationQuality: 80,
      culturalCohesion: 55,
      ethnicFractionalization: 39,
      cleavageCrosscutting: 75,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, SIPRI 2023',
      gini: 36, vdem: 0.35, polity: -2, hdi: 0.946,
      govEffectiveness: 2.2, controlCorruption: 2.1, laborShare: 48,
      militaryPctGDP: 3.0, ethnicFrac: 0.39, socialTrustWVS: 40,
    },
    expectations: {
      corruption: '<20 sustained',
      stateCapacity: '>60 sustained',
      stability: '>60 sustained',
      wellbeing: '>55 sustained',
      wealthConcentration: '>40 sustained',
      epistemicHealth: '<55 sustained',
    }
  },

  // ── 7. BRAZIL — Middle-income democracy with high inequality ─
  // Gini 53, V-Dem 0.60, Polity +8, HDI 0.760, WGI GovEff −0.2, WGI CoC −0.4
  // Labor share ~52%, Military 1.3% GDP, Ethnic frac 0.54, Social trust 7%
  {
    id: 'cal_brazil',
    name: 'Calibration: Brazil (Unequal Democracy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Brazil',
      civColor: '#f39c12',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 65, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 50, powerConcentration: 35, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 55, collectivismLevel: 30, participationVoluntary: 55,
        outsiderRelationship: 'trading', coreValues: ['opportunity', 'cultural identity'],
        innovationTolerance: 50,
      },
      religion: { presence: 'dominant', stateRelationship: 'separate', propagation: 'proselytizing', tolerance: 'accepting' },
      worldClimate: { warmth: 2, moisture: 2 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 38, genderEquity: 45, debtModel: 'market_debt', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 40, scienceFreedom: 55, scienceFreedomConstraint: 'capital', artsSupport: 55, artsFreedom: 65, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 42,
      institutionalQuality: 38,
      legitimacyLevel: 45,
      stabilityIndex: 45,
      socialTrust: 7,
      corruptionLevel: 55,
      educationQuality: 38,
      culturalCohesion: 50,
      ethnicFractionalization: 54,
      cleavageCrosscutting: 65,
      polarizationLevel: 35,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, WVS Wave 7',
      gini: 53, vdem: 0.60, polity: 8, hdi: 0.760,
      govEffectiveness: -0.2, controlCorruption: -0.4, laborShare: 52,
      militaryPctGDP: 1.3, ethnicFrac: 0.54, socialTrustWVS: 7,
    },
    expectations: {
      wealthConcentration: '>50 sustained',
      corruption: '>35 sustained',
      socialTrust: '<30 sustained',
      wellbeing: '>35 sustained',
      stability: '>30 sustained',
    }
  },

  // ── 8. RUSSIA — Hybrid authoritarian petrostate ───────────
  // Gini 36, V-Dem 0.10, Polity −4 (pre-2022), HDI 0.822, WGI GovEff −0.1, WGI CoC −0.8
  // Labor share ~50%, Military 4.1% GDP, Ethnic frac 0.25, Social trust 28%
  {
    id: 'cal_russia',
    name: 'Calibration: Russia (Hybrid Authoritarian)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Russia',
      civColor: '#3498db',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 60, accumulationAllowed: true },
      governance: { model: 'autocratic', hierarchyLevel: 75, participationModel: 'restricted' },
      operatingPrinciples: {
        freedomLevel: 20, collectivismLevel: 45, participationVoluntary: 15,
        outsiderRelationship: 'aggressive', coreValues: ['state power', 'national greatness'],
        innovationTolerance: 40,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: -2, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 58, genderEquity: 45, debtModel: 'market_debt', tariffLevel: 30 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 55, scienceFreedom: 35, scienceFreedomConstraint: 'government', artsSupport: 45, artsFreedom: 30, artsFreedomConstraint: 'government' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'state_guided' },
    },
    initialState: {
      stateCapacity: 48,
      institutionalQuality: 32,
      legitimacyLevel: 50,
      stabilityIndex: 50,
      socialTrust: 28,
      corruptionLevel: 58,
      educationQuality: 58,
      culturalCohesion: 55,
      ethnicFractionalization: 25,
      cleavageCrosscutting: 35,
      resourceRentDependence: 50,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, SIPRI 2023',
      gini: 33, vdem: 0.10, polity: 4, hdi: 0.832,
      govEffectiveness: -0.32, controlCorruption: -0.89, laborShare: 48,
      militaryPctGDP: 7.1, ethnicFrac: 0.25, socialTrustWVS: 23,
    },
    expectations: {
      corruption: '>35 sustained',
      institutionalLockIn: '>35 sustained',
      epistemicHealth: '<50 sustained',
      militaryPower: '>45 sustained',
      socialTrust: '<45 sustained',
    }
  },
  // ── 9. JAPAN — Collectivist democracy ─────────────────────
  // Gini 32.9, V-Dem 0.79, Polity +10, HDI 0.920, WGI GovEff 1.42, WGI CoC 1.49
  // Labor share ~53%, Military 1.0% GDP, Ethnic frac 0.01, Social trust 36%
  {
    id: 'cal_japan',
    name: 'Calibration: Japan (Collectivist Democracy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Japan',
      civColor: '#e74c3c',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 50, powerConcentration: 30, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 75, collectivismLevel: 70, participationVoluntary: 70,
        outsiderRelationship: 'cautious', coreValues: ['harmony', 'duty'],
        innovationTolerance: 55,
      },
      religion: { presence: 'nominal', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 1 },
      geography: { oceanAccess: true, placement: 'island' },
      society: { educationAccess: 'universal', educationQuality: 72, genderEquity: 40, debtModel: 'regulated_credit', tariffLevel: 10 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 65, scienceFreedom: 60, scienceFreedomConstraint: 'none', artsSupport: 55, artsFreedom: 65, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'prevention', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 72,
      institutionalQuality: 68,
      legitimacyLevel: 65,
      stabilityIndex: 72,
      socialTrust: 36,
      corruptionLevel: 27,
      educationQuality: 72,
      culturalCohesion: 85,
      ethnicFractionalization: 1,
      cleavageCrosscutting: 80,
      polarizationLevel: 15,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, WVS Wave 7',
      gini: 32.9, vdem: 0.79, polity: 10, hdi: 0.920,
      govEffectiveness: 1.42, controlCorruption: 1.49, laborShare: 53,
      militaryPctGDP: 1.0, ethnicFrac: 0.01, socialTrustWVS: 36,
    },
    expectations: {
      socialTrust: '>25 sustained',
      corruption: '<35 sustained',
      wealthConcentration: '<65 sustained',
      stability: '>55 sustained',
      wellbeing: '>55 sustained',
    }
  },

  // ── 10. GERMANY — European industrial democracy ──────────
  // Gini 31.7, V-Dem 0.86, Polity +10, HDI 0.950, WGI GovEff 1.49, WGI CoC 1.86
  // Labor share ~58%, Military 1.5% GDP, Ethnic frac 0.17, Social trust 44%
  {
    id: 'cal_germany',
    name: 'Calibration: Germany (Social Market Economy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'Germany',
      civColor: '#2c3e50',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 50, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 30, powerConcentration: 25, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 78, collectivismLevel: 55, participationVoluntary: 80,
        outsiderRelationship: 'welcoming', coreValues: ['order', 'solidarity'],
        innovationTolerance: 70,
      },
      religion: { presence: 'nominal', stateRelationship: 'separate', propagation: 'passive', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'universal', educationQuality: 72, genderEquity: 70, debtModel: 'regulated_credit', tariffLevel: 10 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'scandinavian', womensRightsTier: 'full_parity', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 70, scienceFreedom: 75, scienceFreedomConstraint: 'none', artsSupport: 60, artsFreedom: 75, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'balanced', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'durability_first' },
      societyInfo: { informationEcosystem: 'open_civic' },
    },
    initialState: {
      stateCapacity: 78,
      institutionalQuality: 75,
      legitimacyLevel: 72,
      stabilityIndex: 75,
      socialTrust: 44,
      corruptionLevel: 18,
      educationQuality: 72,
      culturalCohesion: 72,
      ethnicFractionalization: 17,
      cleavageCrosscutting: 60,
      polarizationLevel: 25,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, WVS Wave 7',
      gini: 31.7, vdem: 0.86, polity: 10, hdi: 0.950,
      govEffectiveness: 1.49, controlCorruption: 1.86, laborShare: 58,
      militaryPctGDP: 1.5, ethnicFrac: 0.17, socialTrustWVS: 44,
    },
    expectations: {
      socialTrust: '>30 sustained',
      corruption: '<30 sustained',
      wealthConcentration: '<65 sustained',
      stability: '>55 sustained',
      wellbeing: '>55 sustained',
    }
  },

  // ── 11. INDIA — Diverse federal democracy ────────────────
  // Gini 35.7, V-Dem 0.38, Polity +7, HDI 0.644, WGI GovEff −0.21, WGI CoC −0.33
  // Labor share ~55%, Military 2.4% GDP, Ethnic frac 0.42 (language ~0.81), Social trust 21%
  {
    id: 'cal_india',
    name: 'Calibration: India (Diverse Democracy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'India',
      civColor: '#e67e22',
      aiCivCount: 3,
      economic: { model: 'mixed', scarcityOrientation: 60, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 55, powerConcentration: 35, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 50, collectivismLevel: 55, participationVoluntary: 55,
        outsiderRelationship: 'cautious', coreValues: ['pluralism', 'tradition'],
        innovationTolerance: 50,
      },
      religion: { presence: 'dominant', stateRelationship: 'aligned', propagation: 'communal', tolerance: 'indifferent' },
      worldClimate: { warmth: 2, moisture: 1 },
      geography: { oceanAccess: true, placement: 'continent' },
      society: { educationAccess: 'free_basic_expensive_higher', educationQuality: 40, genderEquity: 35, debtModel: 'market_debt', tariffLevel: 20 },
      societyFamily: { familyStructure: 'extended', reproductiveHealthTier: 'restricted', womensRightsTier: 'minimal', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 50, scienceFreedom: 50, scienceFreedomConstraint: 'capital', artsSupport: 45, artsFreedom: 55, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'mixed_public_private', healthcareEmphasis: 'treatment', healthcareIncentive: 'mixed' },
      societyResources: { resourceStrategy: 'extraction_growth', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 40,
      institutionalQuality: 38,
      legitimacyLevel: 55,
      stabilityIndex: 50,
      socialTrust: 21,
      corruptionLevel: 45,
      educationQuality: 40,
      culturalCohesion: 42,
      ethnicFractionalization: 42,
      cleavageCrosscutting: 25,
      polarizationLevel: 55,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, WVS Wave 7',
      gini: 35.7, vdem: 0.38, polity: 7, hdi: 0.644,
      govEffectiveness: -0.21, controlCorruption: -0.33, laborShare: 55,
      militaryPctGDP: 2.4, ethnicFrac: 0.42, socialTrustWVS: 21,
    },
    expectations: {
      socialTrust: '<35 sustained',
      corruption: '>30 sustained',
      wealthConcentration: '>45 sustained',
      stability: '>30 sustained',
    }
  },

  // ── 12. SOUTH KOREA — Confucian developmental democracy ──
  // Gini 31.4, V-Dem 0.82, Polity +8, HDI 0.929, WGI GovEff 1.25, WGI CoC 1.16
  // Labor share ~55%, Military 2.7% GDP, Ethnic frac 0.002, Social trust 30%
  {
    id: 'cal_south_korea',
    name: 'Calibration: South Korea (Developmental Democracy)',
    turns: 250,
    config: {
      startYear: -3000,
      playerRole: 'founder',
      civName: 'South Korea',
      civColor: '#1abc9c',
      aiCivCount: 3,
      economic: { model: 'market', scarcityOrientation: 55, accumulationAllowed: true },
      governance: { model: 'representative', hierarchyLevel: 45, powerConcentration: 30, participationModel: 'voluntary' },
      operatingPrinciples: {
        freedomLevel: 65, collectivismLevel: 60, participationVoluntary: 65,
        outsiderRelationship: 'trading', coreValues: ['education', 'achievement'],
        innovationTolerance: 75,
      },
      religion: { presence: 'plurality', stateRelationship: 'separate', propagation: 'proselytizing', tolerance: 'accepting' },
      worldClimate: { warmth: 0, moisture: 0 },
      geography: { oceanAccess: true, placement: 'peninsula' },
      society: { educationAccess: 'universal', educationQuality: 75, genderEquity: 50, debtModel: 'regulated_credit', tariffLevel: 10 },
      societyFamily: { familyStructure: 'nuclear', reproductiveHealthTier: 'available', womensRightsTier: 'partial', familySizePolicy: 'neutral' },
      societyCulture: { scienceSupport: 75, scienceFreedom: 70, scienceFreedomConstraint: 'capital', artsSupport: 50, artsFreedom: 65, artsFreedomConstraint: 'none' },
      societyHealth: { healthcareAccess: 'universal_public', healthcareEmphasis: 'balanced', healthcareIncentive: 'patient_outcomes' },
      societyResources: { resourceStrategy: 'balanced_stewardship', obsolescenceModel: 'market_driven' },
      societyInfo: { informationEcosystem: 'free_market_media' },
    },
    initialState: {
      stateCapacity: 68,
      institutionalQuality: 60,
      legitimacyLevel: 62,
      stabilityIndex: 65,
      socialTrust: 30,
      corruptionLevel: 37,
      educationQuality: 75,
      culturalCohesion: 78,
      ethnicFractionalization: 2,
      cleavageCrosscutting: 85,
      polarizationLevel: 35,
    },
    benchmarks: {
      source: 'World Bank 2023, V-Dem v14, UNDP HDR 2024, WVS Wave 7',
      gini: 31.4, vdem: 0.82, polity: 8, hdi: 0.929,
      govEffectiveness: 1.25, controlCorruption: 1.16, laborShare: 55,
      militaryPctGDP: 2.7, ethnicFrac: 0.002, socialTrustWVS: 30,
    },
    expectations: {
      socialTrust: '>20 sustained',
      corruption: '<45 sustained',
      wealthConcentration: '<65 sustained',
      stability: '>50 sustained',
      wellbeing: '>55 sustained',
    }
  },
];

window.CALIBRATION_SCENARIOS = CALIBRATION_SCENARIOS;

// Make validation scenarios available
window.VALIDATION_SCENARIOS = VALIDATION_SCENARIOS;

/**
 * Run all validation scenarios × 3 runs each.
 */
function runValidationScenarios() {
  const allResults = {};
  const totalRuns = VALIDATION_SCENARIOS.length * 3;
  let completed = 0;

  for (const scenario of VALIDATION_SCENARIOS) {
    allResults[scenario.id] = {
      name: scenario.name,
      turns: scenario.turns,
      runs: [],
    };

    for (let run = 0; run < 3; run++) {
      completed++;
      console.log(`[ValidationTest] Running ${scenario.name} (run ${run + 1}/3) — ${completed}/${totalRuns} total`);

      const result = runSingleScenario(scenario);
      result.runNumber = run + 1;
      allResults[scenario.id].runs.push(result);
    }
  }

  console.log('[ValidationTest] All validation scenarios complete!');
  return allResults;
}

window.runValidationScenarios = runValidationScenarios;

/**
 * Run a single scenario for the specified number of turns.
 * Returns per-turn snapshots + final stats.
 */
function runSingleScenario(scenario, seed) {
  // Start fresh game. A seed makes the run reproducible — without one,
  // scenario results cannot be replicated or compared across code
  // versions, which invalidated the original plausibility scoring.
  const cfg = seed == null ? scenario.config
            : Object.assign({}, scenario.config, { researchSeed: seed });
  game.startGame(cfg);

  const playerCiv = game.civilizations[0];

  // Apply initial state overrides if specified (Fix R3: scenario differentiation)
  if (scenario.initialState) {
    // Some scenario keys name concepts whose actual state field differs.
    // `culturalCohesion` was being written to a field that does not
    // exist — the real one is culturalHomogeneity.value — so Tokugawa's
    // "very high cohesion from isolation" initial condition silently did
    // nothing and the expectation could never pass.
    const ALIAS = { culturalCohesion: ['culturalHomogeneity', 'value'] };
    for (const [key, value] of Object.entries(scenario.initialState)) {
      const alias = ALIAS[key];
      if (alias) {
        if (playerCiv.state[alias[0]] && typeof playerCiv.state[alias[0]] === 'object') {
          playerCiv.state[alias[0]][alias[1]] = value;
        }
        continue;
      }
      if (!(key in playerCiv.state)) {
        console.warn(`[ScenarioTest] initialState key "${key}" does not exist on civ.state — ignored`);
        continue;
      }
      playerCiv.state[key] = value;
      if (key === 'corruptionLevel' && playerCiv.governance) {
        playerCiv.governance.corruptionLevel = value;
      }
    }
  }

  const snapshots = [];

  // Run specified turns
  for (let t = 0; t < scenario.turns; t++) {
    // Click next turn button to process turn properly
    game.nextTurn();

    // Snapshot every 10 turns
    if ((t + 1) % 10 === 0 || t === scenario.turns - 1) {
      const s = playerCiv.state;
      const eco = playerCiv.economic || {};
      const gov = playerCiv.governance || {};
      snapshots.push({
        turn: t + 1,
        year: game.currentYear,
        population: s.population,
        wellbeing: Math.round(s.averageWellbeing ?? 0),
        stability: Math.round(s.stabilityIndex ?? 0),
        equality: Math.round(s.equalityIndex ?? 0),
        socialTrust: Math.round(s.socialTrust ?? 0),
        epistemicHealth: Math.round(s.epistemicHealth ?? 0),
        urbanization: Math.round(s.urbanizationRate ?? 0),
        wealthConcentration: Math.round(eco.wealthConcentration ?? 0),
        corruption: Math.round(gov.corruptionLevel ?? 0),
        stateCapacity: Math.round(s.stateCapacity ?? 0),
        institutionalQuality: Math.round(s.institutionalQuality ?? 0),
        innovation: Math.round(s.behaviorReinforcement?.innovation ?? 0),
        militaryPower: Math.round(s.militaryPower ?? 0),
        civilianControl: Math.round(s.civilianControl ?? 0),
        anomie: Math.round(s.anomieLevel ?? 0),
        genderEquity: Math.round(s.genderEquity ?? 0),
        foodSecurity: Math.round(s.foodSecurity ?? 0),
        techLevel: s.technologyLevel ?? 0,
        institutionalLockIn: Math.round(s.institutionalLockin ?? 0),
        casteRigidity: Math.round(s.casteRigidity ?? 0),
        // The field is state.wealthCapture.degree, not wealthCaptureDegree.
        // The old read resolved to undefined and every snapshot recorded 0,
        // so post_colonial's elite-capture expectation could never pass —
        // the same phantom-field class as culturalCohesion.
        wealthCapture: Math.round(s.wealthCapture?.degree ?? 0),
        legitimacy: Math.round(s.legitimacyLevel ?? 0),
        socialMobility: Math.round(s.socialMobility ?? 0),
        infrastructureLevel: Math.round(s.infrastructureLevel ?? 0),
        demographicStage: s.demographicTransitionStage ?? 1,
        govModelId: gov.modelId ?? 'unknown',
        // Added so previously-unscoreable expectations can be evaluated
        ethnicFractionalization: Math.round(s.ethnicFractionalization ?? 0),
        schismRisk: Math.round(s.schismRisk ?? 0),
        culturalHomogeneity: Math.round(s.culturalHomogeneity?.value ?? 0),
        innovationTolerance: Math.round(s.behaviorReinforcement?.innovation ?? 0),
        attractorScore: +(s.attractorScore ?? 0).toFixed(4),
        oligarchicPull: +(s.oligarchicPull ?? 0).toFixed(4),
        egalitarianPull: +(s.egalitarianPull ?? 0).toFixed(4),
        attractorBasin: s.attractorBasin ?? 'unknown',
        tradeDependency: Math.round(s.tradeDependency ?? 0),
        primaryExportShare: Math.round(s.primaryExportShare ?? 50),
        polarization: Math.round(s.polarizationLevel ?? 0),
      });
    }
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    turns: scenario.turns,
    snapshots: snapshots,
    finalYear: game.currentYear,
    survived: playerCiv.state.population > 0,
    finalPop: playerCiv.state.population,
    govAtEnd: playerCiv.governance?.modelId ?? 'unknown',
  };
}

/**
 * Run all 10 scenarios × 3 runs each.
 * Returns structured results object.
 */
function runAllScenarios() {
  const allResults = {};
  const totalRuns = HISTORICAL_SCENARIOS.length * 3;
  let completed = 0;

  for (const scenario of HISTORICAL_SCENARIOS) {
    allResults[scenario.id] = {
      name: scenario.name,
      turns: scenario.turns,
      runs: [],
    };

    for (let run = 0; run < 3; run++) {
      completed++;
      console.log(`[ScenarioTest] Running ${scenario.name} (run ${run + 1}/3) — ${completed}/${totalRuns} total`);

      const result = runSingleScenario(scenario);
      result.runNumber = run + 1;
      allResults[scenario.id].runs.push(result);
    }
  }

  console.log('[ScenarioTest] All scenarios complete!');
  return allResults;
}

/**
 * Compute averaged metrics across 3 runs for a scenario.
 */
function averageRuns(runs) {
  if (!runs || runs.length === 0) return [];

  // Get all unique turns
  const turnSet = new Set();
  runs.forEach(r => r.snapshots.forEach(s => turnSet.add(s.turn)));
  const turns = Array.from(turnSet).sort((a, b) => a - b);

  const metrics = ['population', 'wellbeing', 'stability', 'equality', 'socialTrust',
    'epistemicHealth', 'urbanization', 'wealthConcentration', 'corruption',
    'stateCapacity', 'institutionalQuality', 'innovation', 'militaryPower',
    'civilianControl', 'anomie', 'genderEquity', 'foodSecurity', 'techLevel',
    'institutionalLockIn', 'casteRigidity', 'wealthCapture', 'legitimacy',
    'socialMobility', 'infrastructureLevel', 'demographicStage'];

  return turns.map(turn => {
    const avg = { turn };
    const snapsAtTurn = runs.map(r => r.snapshots.find(s => s.turn === turn)).filter(Boolean);
    if (snapsAtTurn.length === 0) return avg;

    avg.year = snapsAtTurn[0].year;
    for (const m of metrics) {
      const vals = snapsAtTurn.map(s => s[m]).filter(v => v !== undefined);
      avg[m] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }
    return avg;
  });
}

// Make functions available globally
// ═══════════════════════════════════════════════════════════════
// Machine evaluation of scenario expectations
//
// The `expectations` fields were written as prose. Roughly a third
// follow a quantitative grammar and can be scored mechanically; the
// rest ("persistent", "dependent on ruler quality") cannot, and are
// reported as UNSCOREABLE rather than silently counted as passes.
//
// A previously reported overall plausibility of 5.6/10 was a human
// reading of unseeded runs. It was neither reproducible nor auditable.
// ═══════════════════════════════════════════════════════════════

// Expectation key -> snapshot field. Keys with no snapshot field are
// unscoreable by construction.
const EXPECTATION_FIELD_MAP = {
  wealthConcentration: 'wealthConcentration',
  institutionalLockIn:  'institutionalLockIn',
  stateCapacity:        'stateCapacity',
  stability:            'stability',
  militaryPower:        'militaryPower',
  socialTrust:          'socialTrust',
  urbanization:         'urbanization',
  epistemicHealth:      'epistemicHealth',
  institutionalQuality: 'institutionalQuality',
  genderEquity:         'genderEquity',
  wellbeing:            'wellbeing',
  casteRigidity:        'casteRigidity',
  equality:             'equality',
  wealthCapture:        'wealthCapture',
  corruption:           'corruption',
  techLevel:            'techLevel',
  anomie:               'anomie',
  ethnicFractionalization: 'ethnicFractionalization',
  schismRisk:           'schismRisk',
  culturalCohesion:     'culturalHomogeneity',
  innovationTolerance:  'innovationTolerance',
  legitimacy:           'legitimacy',
  socialMobility:       'socialMobility',
  infrastructureLevel:  'infrastructureLevel',
  demographicStage:     'demographicStage',
  wealthCapture:        'wealthCapture',
};

function _trendAfter(snaps, field, fromTurn) {
  const pts = snaps.filter(s => s.turn >= fromTurn && Number.isFinite(s[field]));
  if (pts.length < 3) return null;
  // least-squares slope
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.turn, 0) / n;
  const my = pts.reduce((a, p) => a + p[field], 0) / n;
  let num = 0, den = 0;
  for (const p of pts) { num += (p.turn - mx) * (p[field] - my); den += (p.turn - mx) ** 2; }
  return den === 0 ? null : num / den;
}

function evaluateExpectation(key, phrase, snaps) {
  const field = EXPECTATION_FIELD_MAP[key];
  if (!field) return { key, phrase, verdict: 'UNSCOREABLE', score: null, reason: 'no snapshot field' };
  const vals = snaps.filter(s => Number.isFinite(s[field]));
  if (!vals.length) return { key, phrase, verdict: 'UNSCOREABLE', score: null, reason: 'no data' };
  const p = phrase.trim();
  let m;

  // ">N sustained" / "<N sustained" — holds for >=60% of snapshots after warmup
  if ((m = p.match(/^([<>])\s*(\d+)\s+sustained$/))) {
    const op = m[1], thr = +m[2];
    const post = vals.filter(s => s.turn > vals[0].turn);
    const hits = post.filter(s => op === '>' ? s[field] > thr : s[field] < thr).length;
    const frac = post.length ? hits / post.length : 0;
    return { key, phrase, verdict: frac >= 0.6 ? 'PASS' : 'FAIL',
             score: Math.min(1, frac / 0.6),
             detail: `${(frac * 100).toFixed(0)}% of snapshots ${op}${thr}` };
  }
  // ">N by turn T" / "<N by turn T"
  if ((m = p.match(/^([<>])\s*(\d+)\s+by turn\s+(\d+)/))) {
    const op = m[1], thr = +m[2], turn = +m[3];
    const upto = vals.filter(s => s.turn <= turn);
    const ok = upto.some(s => op === '>' ? s[field] > thr : s[field] < thr);
    const best = upto.length ? (op === '>' ? Math.max(...upto.map(s => s[field]))
                                          : Math.min(...upto.map(s => s[field]))) : null;
    // Graded: how close the best observed value came to the threshold.
    let sc = ok ? 1 : 0;
    if (!ok && best != null && thr !== 0) {
      sc = op === '>' ? Math.max(0, Math.min(1, best / thr))
                      : Math.max(0, Math.min(1, thr / Math.max(best, 1e-6)));
    }
    return { key, phrase, verdict: ok ? 'PASS' : 'FAIL', score: sc,
             detail: `best by turn ${turn}: ${best}` };
  }
  // "declining after turn T" / "rising after turn T"
  if ((m = p.match(/^(declining|rising)(?: rapidly)? after turn\s+(\d+)/))) {
    const dir = m[1], turn = +m[2];
    const slope = _trendAfter(vals, field, turn);
    if (slope == null) return { key, phrase, verdict: 'UNSCOREABLE', score: null, reason: 'too few points' };
    const ok = dir === 'declining' ? slope < 0 : slope > 0;
    // Graded: a slope of the wrong sign but near zero is far closer to
    // correct than a strongly wrong one. Scaled against a reference
    // magnitude so "nearly flat" reads as partial credit.
    const REF = 0.2;
    const sc = ok ? 1 : Math.max(0, 1 - Math.min(1, Math.abs(slope) / REF)) * 0.5;
    return { key, phrase, verdict: ok ? 'PASS' : 'FAIL', score: sc,
             detail: `slope ${slope.toFixed(3)}/turn` };
  }
  // ">N early, declining after turn T"
  if ((m = p.match(/^>\s*(\d+)\s+early,\s*declining after turn\s+(\d+)/))) {
    const thr = +m[1], turn = +m[2];
    const early = vals.filter(s => s.turn <= turn);
    const hitEarly = early.some(s => s[field] > thr);
    const slope = _trendAfter(vals, field, turn);
    const ok = hitEarly && slope != null && slope < 0;
    const partA = hitEarly ? 1 : 0;
    const partB = (slope != null && slope < 0) ? 1
                : (slope == null ? 0 : Math.max(0, 1 - Math.min(1, Math.abs(slope) / 0.2)) * 0.5);
    return { key, phrase, verdict: ok ? 'PASS' : 'FAIL', score: (partA + partB) / 2,
             detail: `early>${thr}: ${hitEarly}, slope ${slope == null ? 'n/a' : slope.toFixed(3)}` };
  }
  return { key, phrase, verdict: 'UNSCOREABLE', score: null, reason: 'prose expectation' };
}

function evaluateScenario(scenario, snaps) {
  const out = [];
  for (const [k, v] of Object.entries(scenario.expectations || {})) {
    if (typeof v !== 'string') continue;
    out.push(evaluateExpectation(k, v, snaps));
  }
  return out;
}

/**
 * Run every historical scenario across a fixed set of seeds and score
 * the quantitative expectations. Reproducible and auditable.
 */
function runSeededSuite(seeds) {
  seeds = seeds || [1001, 2002, 3003];
  const results = {};
  let pass = 0, fail = 0, unscoreable = 0;

  for (const scenario of HISTORICAL_SCENARIOS) {
    const perSeed = [];
    for (const seed of seeds) {
      const r = runSingleScenario(scenario, seed);
      const evals = evaluateScenario(scenario, r.snapshots || []);
      perSeed.push({ seed, evals });
    }
    // An expectation passes for the scenario if it passes on a majority of seeds
    const byKey = {};
    for (const ps of perSeed) {
      for (const e of ps.evals) {
        (byKey[e.key] = byKey[e.key] || { phrase: e.phrase, verdicts: [], details: [] });
        byKey[e.key].verdicts.push(e.verdict);
        byKey[e.key].details.push(e.detail || e.reason || '');
      }
    }
    const summary = {};
    for (const [k, v] of Object.entries(byKey)) {
      const p = v.verdicts.filter(x => x === 'PASS').length;
      const f = v.verdicts.filter(x => x === 'FAIL').length;
      const u = v.verdicts.filter(x => x === 'UNSCOREABLE').length;
      let verdict;
      if (u === v.verdicts.length) { verdict = 'UNSCOREABLE'; unscoreable++; }
      else if (p >= f) { verdict = 'PASS'; pass++; }
      else { verdict = 'FAIL'; fail++; }
      summary[k] = { phrase: v.phrase, verdict, seedVerdicts: v.verdicts, detail: v.details[0] };
    }
    results[scenario.id] = { name: scenario.name, turns: scenario.turns, expectations: summary };
  }

  const scoreable = pass + fail;
  return {
    seeds,
    totals: { pass, fail, unscoreable, scoreable,
              passRate: scoreable ? +(pass / scoreable * 100).toFixed(1) : 0 },
    results,
  };
}

window.evaluateExpectation = evaluateExpectation;
window.evaluateScenario = evaluateScenario;
window.runSeededSuite = runSeededSuite;
window.HISTORICAL_SCENARIOS = HISTORICAL_SCENARIOS;
window.runAllScenarios = runAllScenarios;
window.runSingleScenario = runSingleScenario;
window.averageRuns = averageRuns;

console.log('[ScenarioTest] Harness loaded. Call runAllScenarios() to start.');


/**
 * Graded suite score. Binary verdicts remain the regression gate; the
 * graded mean is the progress signal.
 *
 * Binary scoring could not see real improvement: repairing the schism
 * subsystem moved three metrics from 0/0/8% to 17/42/46% and the score
 * reported no change at all, because every one of them stayed on the
 * failing side of its threshold.
 */
function scoreSuiteGraded(scenarios, seeds) {
  seeds = seeds || [1001, 2002, 3003];
  let P = 0, F = 0, U = 0;
  const scored = [];
  for (const sc of scenarios) {
    const byKey = {};
    for (const seed of seeds) {
      const r = runSingleScenario(sc, seed);
      for (const e of evaluateScenario(sc, r.snapshots || [])) {
        (byKey[e.key] = byKey[e.key] || { phrase: e.phrase, v: [], s: [], det: e.detail || e.reason });
        byKey[e.key].v.push(e.verdict);
        if (typeof e.score === 'number') byKey[e.key].s.push(e.score);
      }
    }
    for (const [k, v] of Object.entries(byKey)) {
      const p = v.v.filter(x => x === 'PASS').length;
      const f = v.v.filter(x => x === 'FAIL').length;
      const u = v.v.filter(x => x === 'UNSCOREABLE').length;
      if (u === v.v.length) { U++; continue; }
      const mean = v.s.length ? v.s.reduce((a, b) => a + b, 0) / v.s.length : 0;
      if (p >= f) P++; else F++;
      scored.push({ id: `${sc.id}.${k}`, verdict: p >= f ? 'PASS' : 'FAIL',
        score: +mean.toFixed(3), detail: v.det });
    }
  }
  const graded = scored.length ? scored.reduce((a, b) => a + b.score, 0) / scored.length : 0;
  return { pass: P, fail: F, unscoreable: U,
    binaryRate: (P + F) ? +(P / (P + F) * 100).toFixed(1) : null,
    gradedMean: +(graded * 100).toFixed(1),
    nearMisses: scored.filter(x => x.verdict === 'FAIL' && x.score >= 0.6)
      .sort((a, b) => b.score - a.score),
    worst: scored.filter(x => x.verdict === 'FAIL').sort((a, b) => a.score - b.score).slice(0, 6),
    scored };
}
window.scoreSuiteGraded = scoreSuiteGraded;

// ═══════════════════════════════════════════════════════════════
// Seshat-derived cross-scenario validation
//
// Source: Equinox-2020, Seshat Global History Databank
// 414 societies, 51 variables, 30 regions, 10,000 years.
//
// Seshat codes INSTITUTIONAL COMPLEXITY (presence/absence of features),
// not civ-sim's QUALITY/EFFECTIVENESS metrics. Direct value comparison
// is not meaningful. What IS meaningful: RELATIVE ORDERINGS between
// civilizations on the same dimension. If Seshat codes the Mughal
// military as more complex than Tokugawa's, the model should produce
// the same ordering.
// ═══════════════════════════════════════════════════════════════

const SESHAT_BENCHMARKS = {
  rome:         { polIds: ['ItRomLR', 'ItRomPr'], militaryPower: 92, institutionalQuality: 37, epistemicHealth: 92, stateCapacity: 80 },
  song_dynasty: { polIds: ['CnNSong'],            militaryPower: 100, institutionalQuality: 99, epistemicHealth: 92, stateCapacity: 83 },
  tokugawa:     { polIds: ['JpTokgw'],             militaryPower: 77, institutionalQuality: 86, epistemicHealth: 100, stateCapacity: 78 },
  mughal:       { polIds: ['InMugl*'],             militaryPower: 77, institutionalQuality: 97, epistemicHealth: 91, stateCapacity: 78 },
  venice:       { polIds: ['ItVenR3', 'ItVenR4'], militaryPower: 100, institutionalQuality: 83, epistemicHealth: 99, stateCapacity: 61 },
  ptolemaic:    { polIds: ['EgPtol1', 'EgPtol2'], militaryPower: 94, institutionalQuality: 84, epistemicHealth: 98, stateCapacity: 67 },
  ottoman:      { polIds: ['TrOttm1', 'TrOttm2', 'TrOttm3', 'TrOttm4'], militaryPower: 85, institutionalQuality: 97, epistemicHealth: 100, stateCapacity: 80 },
  khmer:        { polIds: ['KhAngkE', 'KhAngkC', 'KhAngkL'], militaryPower: 65, institutionalQuality: 80, epistemicHealth: 95, stateCapacity: 55 },
};

const SESHAT_ORDERINGS = [
  { metric: 'militaryPower', higher: 'mughal', lower: 'ptolemaic', note: 'Mughal MilLev 9 > Ptolemaic 7' },
  { metric: 'militaryPower', higher: 'mughal', lower: 'venice',    note: 'Mughal professional army vs Venetian naval-mercenary' },
  { metric: 'militaryPower', higher: 'tokugawa', lower: 'ptolemaic', note: 'Tokugawa MilLev 6 standing samurai class' },
  { metric: 'stateCapacity', higher: 'tokugawa', lower: 'venice',  note: 'Tokugawa AdmLev 7 > Venice 5.5' },
  { metric: 'stateCapacity', higher: 'mughal', lower: 'venice',    note: 'Mughal mansabdari system > Venetian compact state' },
  { metric: 'institutionalQuality', higher: 'song_dynasty', lower: 'rome', note: 'Song IQ 99 (exam system, full bureaucracy) > Rome 37' },
  { metric: 'militaryPower', higher: 'ottoman', lower: 'khmer',    note: 'Ottoman MilTech 30.9 (Janissary + gunpowder) > Khmer 24.2' },
  { metric: 'stateCapacity', higher: 'ottoman', lower: 'khmer',    note: 'Ottoman Hier 8.17 (devshirme provincial system) > Khmer 5.67' },
  { metric: 'militaryPower', higher: 'ottoman', lower: 'ptolemaic', note: 'Ottoman MilTech 30.9 > Ptolemaic 25.7' },
  { metric: 'stateCapacity', higher: 'rome', lower: 'khmer',       note: 'Rome Hier 8.17 (provincial admin) > Khmer 5.67 (hydraulic)' },
];

function validateSeshatOrderings(seeds) {
  seeds = seeds || [1001, 2002, 3003];
  const allScenarios = [...HISTORICAL_SCENARIOS, ...VALIDATION_SCENARIOS];
  const peaks = {};

  for (const sc of allScenarios) {
    if (!SESHAT_BENCHMARKS[sc.id]) continue;
    const peakVals = {};

    for (const seed of seeds) {
      const r = runSingleScenario(sc, seed);
      for (const snap of r.snapshots) {
        for (const metric of ['militaryPower', 'institutionalQuality', 'epistemicHealth', 'stateCapacity']) {
          const val = snap[metric];
          if (val != null && (peakVals[metric] == null || val > peakVals[metric])) {
            peakVals[metric] = val;
          }
        }
      }
    }
    peaks[sc.id] = peakVals;
  }

  let pass = 0, fail = 0;
  const details = [];

  for (const ord of SESHAT_ORDERINGS) {
    const hPeak = peaks[ord.higher]?.[ord.metric];
    const lPeak = peaks[ord.lower]?.[ord.metric];
    if (hPeak == null || lPeak == null) {
      details.push({ ...ord, verdict: 'SKIP', reason: 'missing data' });
      continue;
    }
    const ok = hPeak > lPeak;
    if (ok) pass++; else fail++;
    details.push({ ...ord, verdict: ok ? 'PASS' : 'FAIL',
      values: { [ord.higher]: hPeak, [ord.lower]: lPeak } });
  }

  return { pass, fail, total: pass + fail, rate: pass + fail > 0 ? +(pass / (pass + fail) * 100).toFixed(1) : null, details };
}

window.SESHAT_BENCHMARKS = SESHAT_BENCHMARKS;
window.SESHAT_ORDERINGS = SESHAT_ORDERINGS;
window.validateSeshatOrderings = validateSeshatOrderings;
