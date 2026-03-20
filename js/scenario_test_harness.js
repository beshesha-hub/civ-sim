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
      stability: 'high and sustained',
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
      wealthConcentration: 'spiking during industrial phase',
      demographicTransition: 'visible by turn 150',
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
      casteRigidity: 'high',
      institutionalLockIn: 'rising',
      ecologicalOvershoot: 'possible by turn 200',
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
      militaryPower: '>60 sustained',
      institutionalLockIn: 'rising',
      reformResistance: 'high late game',
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
      institutionalQuality: 'struggling early',
      youthBulge: 'developing',
      wealthCapture: 'risk from weak institutions',
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
      epistemicHealth: 'high',
      genderEquity: 'stays very low',
      wealthConcentration: 'moderate and growing',
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
      institutionalLockIn: 'very high',
      wealthConcentration: 'stays low (planned economy)',
      urbanization: 'rapid growth',
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
      stability: 'high early, late tension from lock-in',
      institutionalLockIn: 'very high',
      innovationTolerance: 'low — sakoku limits tech absorption',
      culturalCohesion: 'very high from isolation',
      schismRisk: 'low early, rising as external pressure builds',
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
      ethnicFractionalization: 'persistent — hard to reduce',
      schismRisk: 'significant — Hindu-Muslim tensions under Aurangzeb-style rulers',
      stateCapacity: 'declining after peak — centrifugal forces',
      casteRigidity: 'persistent',
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
      wealthConcentration: 'rising — oligarchic wealth accumulation (Serrata)',
      stability: 'high early, gradual decline as oligarchy ossifies',
      institutionalLockIn: 'rising — patrician class closure',
      trade: 'strong but declining as Atlantic trade rises',
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
      ethnicFractionalization: 'persistent Greek-Egyptian divide',
      schismRisk: 'moderate — cultural/religious tensions',
      stateCapacity: 'dependent on ruler quality',
      corruption: 'rising as central control weakens',
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
      schismRisk: 'should eventually emerge from science-religion tension',
      institutionalLockIn: 'should rise — theocratic rigidity',
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
      wealthConcentration: 'should rise but be checked by strong institutions',
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
      techLevel: 'should lag significantly',
      stability: 'high but fragile to external contact',
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
      militaryPower: 'should stay high',
      wellbeing: 'should be suppressed by military spending crowding out',
      anomie: 'should rise from low freedom + mandatory participation',
    }
  },
];

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
function runSingleScenario(scenario) {
  // Start fresh game
  game.startGame(scenario.config);

  const playerCiv = game.civilizations[0];

  // Apply initial state overrides if specified (Fix R3: scenario differentiation)
  if (scenario.initialState) {
    for (const [key, value] of Object.entries(scenario.initialState)) {
      playerCiv.state[key] = value;
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
        wealthCapture: Math.round(s.wealthCaptureDegree ?? 0),
        legitimacy: Math.round(s.legitimacyLevel ?? 0),
        socialMobility: Math.round(s.socialMobility ?? 0),
        infrastructureLevel: Math.round(s.infrastructureLevel ?? 0),
        demographicStage: s.demographicTransitionStage ?? 1,
        govModelId: gov.modelId ?? 'unknown',
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
window.HISTORICAL_SCENARIOS = HISTORICAL_SCENARIOS;
window.runAllScenarios = runAllScenarios;
window.runSingleScenario = runSingleScenario;
window.averageRuns = averageRuns;

console.log('[ScenarioTest] Harness loaded. Call runAllScenarios() to start.');
