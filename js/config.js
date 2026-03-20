// ============================================================
// config.js - Game constants, data definitions, and presets
// ============================================================

const CONFIG = {
  MAP_COLS: 60,
  MAP_ROWS: 38,
  HEX_SIZE: 18,
  TURNS_PER_DECADE: 1,
  DEFAULT_TURN_YEARS: 10,
  MIN_YEAR: -4000,
  MAX_YEAR: 3000,
  NPC_POOL_SIZE: 24,
  MAX_HISTORY_EVENTS: 200,
};

// ── Terrain ──────────────────────────────────────────────────
const TERRAIN = {
  DEEP_OCEAN:    { id: 'deep_ocean',    label: 'Deep Ocean',    color: '#0d2b4e', passable: false, fertility: 0,  resource_bonus: 0 },
  OCEAN:         { id: 'ocean',         label: 'Ocean',         color: '#1a4a7a', passable: false, fertility: 0,  resource_bonus: 1 },
  COASTAL:       { id: 'coastal',       label: 'Coastal',       color: '#2980b9', passable: true,  fertility: 2,  resource_bonus: 2 },
  BEACH:         { id: 'beach',         label: 'Beach',         color: '#e8d080', passable: true,  fertility: 1,  resource_bonus: 1 },
  PLAINS:        { id: 'plains',        label: 'Plains',        color: '#6ab04c', passable: true,  fertility: 8,  resource_bonus: 2 },
  GRASSLAND:     { id: 'grassland',     label: 'Grassland',     color: '#4a9e4a', passable: true,  fertility: 9,  resource_bonus: 2 },
  FOREST:        { id: 'forest',        label: 'Forest',        color: '#2e7d32', passable: true,  fertility: 6,  resource_bonus: 3 },
  DENSE_FOREST:  { id: 'dense_forest',  label: 'Dense Forest',  color: '#1b5e20', passable: true,  fertility: 5,  resource_bonus: 4 },
  JUNGLE:        { id: 'jungle',        label: 'Jungle',        color: '#1a7a2a', passable: true,  fertility: 7,  resource_bonus: 4 },
  DESERT:        { id: 'desert',        label: 'Desert',        color: '#c8a040', passable: true,  fertility: 1,  resource_bonus: 2 },
  SAVANNA:       { id: 'savanna',       label: 'Savanna',       color: '#a8b840', passable: true,  fertility: 5,  resource_bonus: 2 },
  TUNDRA:        { id: 'tundra',        label: 'Tundra',        color: '#a0b8c8', passable: true,  fertility: 2,  resource_bonus: 1 },
  HILLS:         { id: 'hills',         label: 'Hills',         color: '#8a9a6a', passable: true,  fertility: 4,  resource_bonus: 4 },
  MOUNTAINS:     { id: 'mountains',     label: 'Mountains',     color: '#6e6e8a', passable: false, fertility: 1,  resource_bonus: 5 },
  SNOW:          { id: 'snow',          label: 'Snow',          color: '#d8e8f0', passable: false, fertility: 0,  resource_bonus: 0 },
  WETLANDS:      { id: 'wetlands',      label: 'Wetlands',      color: '#3a7a5a', passable: true,  fertility: 7,  resource_bonus: 3 },
  LAKE:          { id: 'lake',          label: 'Lake',          color: '#3a8baa', passable: false, fertility: 1,  resource_bonus: 2 },
};

// ── Economic Models ───────────────────────────────────────────
const ECONOMIC_MODELS = {
  gift: {
    id: 'gift',
    label: 'Gift Economy (No Currency)',
    description: 'Resources are given freely with no expectation of direct return. No currency is used — social bonds and reciprocity are the foundation.',
    currencyType: 'none',
    scarcityOrientation: 15,
    accumulationAllowed: false,
    behaviorModifiers: { cooperation: +25, mutualAid: +30, acquisitiveness: -30, competition: -20 },
  },
  barter: {
    id: 'barter',
    label: 'Barter Economy (No Currency)',
    description: 'Goods and services are exchanged directly. No currency is used — trade is based on direct exchange of goods.',
    currencyType: 'none',
    scarcityOrientation: 40,
    accumulationAllowed: true,
    behaviorModifiers: { cooperation: +5, mutualAid: +5, acquisitiveness: +5, competition: +10 },
  },
  labor_credit: {
    id: 'labor_credit',
    label: 'Labor Credit System (Hours-Based)',
    description: 'Time and effort are the unit of value. No traditional currency — hours worked are tracked and exchangeable.',
    currencyType: 'labor_time',
    scarcityOrientation: 30,
    accumulationAllowed: true,
    behaviorModifiers: { cooperation: +15, mutualAid: +10, acquisitiveness: -5, competition: +0 },
  },
  commons: {
    id: 'commons',
    label: 'Commons-Based Economy (No Currency)',
    description: 'Resources are held and managed collectively. No currency is used — access is based on need and contribution.',
    currencyType: 'none',
    scarcityOrientation: 20,
    accumulationAllowed: false,
    behaviorModifiers: { cooperation: +20, mutualAid: +25, acquisitiveness: -20, conformity: +10 },
  },
  commodity: {
    id: 'commodity',
    label: 'Commodity Currency',
    description: 'A physical commodity (grain, gold, shells) serves as medium of exchange.',
    currencyType: 'commodity',
    scarcityOrientation: 55,
    accumulationAllowed: true,
    behaviorModifiers: { acquisitiveness: +15, competition: +15, cooperation: -5, mutualAid: -5 },
  },
  market: {
    id: 'market',
    label: 'Market Economy',
    description: 'Prices emerge from supply and demand. Private ownership and profit motive drive production.',
    currencyType: 'fiat_or_commodity',
    scarcityOrientation: 70,
    accumulationAllowed: true,
    behaviorModifiers: { acquisitiveness: +30, competition: +25, cooperation: -10, mutualAid: -15, innovation: +20 },
  },
  planned: {
    id: 'planned',
    label: 'Planned Economy',
    description: 'Central coordination allocates resources according to collective priorities.',
    currencyType: 'internal',
    scarcityOrientation: 45,
    accumulationAllowed: false,
    behaviorModifiers: { conformity: +20, cooperation: +10, acquisitiveness: -10, innovation: -10 },
  },
  mixed: {
    id: 'mixed',
    label: 'Mixed Economy',
    description: 'Combines elements of market, commons, and planned allocation.',
    currencyType: 'fiat',
    scarcityOrientation: 50,
    accumulationAllowed: true,
    behaviorModifiers: { cooperation: +5, acquisitiveness: +10, competition: +10, mutualAid: +5 },
  },
  none: {
    id: 'none',
    label: 'No Formal Economy',
    description: 'Subsistence-level existence. Each household or small band provides for itself.',
    currencyType: 'none',
    scarcityOrientation: 35,
    accumulationAllowed: false,
    behaviorModifiers: { cooperation: +10, mutualAid: +15, acquisitiveness: -10 },
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    description: 'Define your own economic model.',
    currencyType: 'custom',
    scarcityOrientation: 50,
    accumulationAllowed: true,
    behaviorModifiers: {},
  },
};

// ── Governance Models ─────────────────────────────────────────
const GOVERNANCE_MODELS = {
  none: {
    id: 'none',
    label: 'No Formal Governance',
    description: 'No structured authority. Decisions emerge organically from community interactions.',
    hierarchyLevel: 0,
    powerConcentration: 0,
    behaviorModifiers: { cooperation: +15, innovation: +10, conformity: -20, deference: -20 },
  },
  flat_consensus: {
    id: 'flat_consensus',
    label: 'Flat / Consensus',
    description: 'All members have equal voice. Decisions require broad agreement.',
    hierarchyLevel: 5,
    powerConcentration: 5,
    behaviorModifiers: { cooperation: +20, mutualAid: +10, conformity: +5, deference: -15, innovation: +5 },
  },
  elder_council: {
    id: 'elder_council',
    label: 'Elder Council',
    description: 'Respected elders guide decisions based on accumulated wisdom and tradition.',
    hierarchyLevel: 30,
    powerConcentration: 25,
    behaviorModifiers: { conformity: +20, deference: +15, cooperation: +5, innovation: -10 },
  },
  rotating: {
    id: 'rotating',
    label: 'Rotating Leadership',
    description: 'Leadership roles cycle through members, preventing entrenchment.',
    hierarchyLevel: 20,
    powerConcentration: 15,
    behaviorModifiers: { cooperation: +15, deference: -5, conformity: +5, empathy: +10 },
  },
  tribal_chief: {
    id: 'tribal_chief',
    label: 'Tribal / Chieftain',
    description: 'A chief leads through personal authority, often hereditary or merit-based.',
    hierarchyLevel: 50,
    powerConcentration: 55,
    behaviorModifiers: { deference: +20, conformity: +15, competition: +15, cooperation: -10 },
  },
  representative: {
    id: 'representative',
    label: 'Representative / Democratic',
    description: 'Elected representatives make decisions on behalf of constituents.',
    hierarchyLevel: 40,
    powerConcentration: 35,
    behaviorModifiers: { deference: +10, conformity: +5, cooperation: +5, innovation: +10 },
  },
  oligarchy: {
    id: 'oligarchy',
    label: 'Oligarchy',
    description: 'A small group of elites hold power, typically through wealth or lineage.',
    hierarchyLevel: 70,
    powerConcentration: 75,
    behaviorModifiers: { acquisitiveness: +20, competition: +15, deference: +20, cooperation: -20, mutualAid: -20 },
  },
  autocratic: {
    id: 'autocratic',
    label: 'Autocratic / Monarchy',
    description: 'Power concentrated in a single ruler or ruling family.',
    hierarchyLevel: 85,
    powerConcentration: 90,
    behaviorModifiers: { deference: +30, conformity: +25, competition: -5, cooperation: -15, innovation: -15 },
  },
  theocratic: {
    id: 'theocratic',
    label: 'Theocratic',
    description: 'Religious authority IS political authority. Governance derived from divine mandate.',
    hierarchyLevel: 75,
    powerConcentration: 80,
    behaviorModifiers: { conformity: +35, deference: +25, innovation: -20, cooperation: +5 },
  },
  direct_congress: {
    id: 'direct_congress',
    label: 'Direct Congress / Third Path',
    description: 'Citizens govern themselves directly through nested congresses and committees. No political parties, no parliament — only the people themselves as the instrument of power. Rejects both capitalism and top-down statism. Workers are partners, not employees.',
    hierarchyLevel: 10,
    powerConcentration: 8,
    behaviorModifiers: { cooperation: +20, mutualAid: +15, deference: -25, acquisitiveness: -15, conformity: +10, innovation: +5 },
  },
  shadow_government_complicit: {
    id: 'shadow_government_complicit',
    label: 'Shadow Government (Complicit)',
    description: 'Formal governance exists — elections, courts, constitutions. The people who run them know exactly who they work for. The shadow network is not hidden from those in power; it is the source of their power. Cooperation is rewarded handsomely. Resistance is managed quietly. The population has no access to this arrangement.',
    hierarchyLevel: 92,
    powerConcentration: 95,
    hiddenControl: true,
    behaviorModifiers: { acquisitiveness: +30, deference: +20, conformity: +15, cooperation: -20, empathy: -25, innovation: -5 },
  },
  shadow_government_covert: {
    id: 'shadow_government_covert',
    label: 'Shadow Government (Covert)',
    description: 'The governments that citizens see are genuine — their leaders sincerely believe they are making their own decisions. What they do not know is that their information environment, their economic pressures, their advisors, their manufactured crises and manufactured opportunities, are carefully curated by an unseen hand. They are not puppets who know the strings. They are free actors in a designed garden.',
    hierarchyLevel: 88,
    powerConcentration: 92,
    hiddenControl: true,
    behaviorModifiers: { acquisitiveness: +20, deference: +10, conformity: +20, cooperation: -15, empathy: -15, innovation: +5 },
  },
  world_federation: {
    id: 'world_federation',
    label: 'World Federation',
    description: 'The civilizations of the world have voluntarily united under a federated global government — not a world empire, but a structured union. Member states retain cultural autonomy, local governance, and their own traditions. Federal authority covers collective goods: security, environment, trade frameworks, and dispute resolution.',
    hierarchyLevel: 28,
    powerConcentration: 20,
    behaviorModifiers: { cooperation: +30, mutualAid: +20, deference: -10, conformity: -15, innovation: +10 },
  },
  failed_state: {
    id: 'failed_state',
    label: 'Failed State',
    description: 'The institutions of governance have collapsed. There is no functioning law enforcement, no reliable courts, no delivery of public services. Power fragments into competing local militias, warlords, criminal networks, and clan structures — none strong enough to establish order, all strong enough to prevent it. Life is uncertain and dangerous.',
    hierarchyLevel: 12,
    powerConcentration: 30,
    behaviorModifiers: { competition: +30, acquisitiveness: +25, cooperation: -30, mutualAid: -25, empathy: -15, deference: -10 },
  },
  authoritarian_world_government: {
    id: 'authoritarian_world_government',
    label: 'Authoritarian World Government',
    description: 'Humanity has been unified under a single authoritarian regime — through military conquest or the slow consolidation of demagogic power. Formal institutions exist as instruments of control. There is no external power to check it: no rival state, no outside pressure, no alternative example. The conditions that historically constrain autocracy — competition between powers, exit options, the threat of defection — no longer exist. What remains is the uncontested management of a species.',
    hierarchyLevel: 98,
    powerConcentration: 98,
    behaviorModifiers: { deference: +35, conformity: +35, cooperation: -25, empathy: -30, innovation: -20, acquisitiveness: +20 },
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    description: 'Define your own governance structure.',
    hierarchyLevel: 50,
    powerConcentration: 50,
    behaviorModifiers: {},
  },
};

// ── Religion Presets ──────────────────────────────────────────
const RELIGION_PRESENCE = {
  none:       { id: 'none',       label: 'No Religion / Secular' },
  animist:    { id: 'animist',    label: 'Animist / Folk Traditions' },
  plurality:  { id: 'plurality',  label: 'Plurality of Religions' },
  dominant:   { id: 'dominant',   label: 'Dominant Religion (with minorities)' },
  theocratic: { id: 'theocratic', label: 'Theocratic (religion = governance)' },
};

const RELIGION_PROPAGATION = {
  passive:    { id: 'passive',    label: 'Passive',    description: 'Faith is personal; no active outreach' },
  communal:   { id: 'communal',   label: 'Communal',   description: 'Shared practice, welcoming to outsiders' },
  missionary: { id: 'missionary', label: 'Missionary', description: 'Active but peaceful conversion efforts' },
  aggressive: { id: 'aggressive', label: 'Aggressive', description: 'Strong pressure to convert; social rewards for conversion' },
  coercive:   { id: 'coercive',   label: 'Coercive',   description: 'Forced conversion; punishment for non-belief' },
};

const RELIGION_TOLERANCE = {
  accepting:    { id: 'accepting',    label: 'Accepting',    description: 'Other faiths welcomed and respected' },
  indifferent:  { id: 'indifferent',  label: 'Indifferent',  description: 'Other faiths tolerated but not engaged' },
  restrictive:  { id: 'restrictive',  label: 'Restrictive',  description: 'Other faiths allowed but discouraged' },
  persecutory:  { id: 'persecutory',  label: 'Persecutory',  description: 'Other faiths actively suppressed or punished' },
};

// ── Player Roles ──────────────────────────────────────────────
const PLAYER_ROLES = {
  leader: {
    id: 'leader',
    label: 'Leader',
    description: 'You hold a formal position of authority. You have direct influence over policy but risk empathy suppression over time.',
    empathySuppression: 0.8,
    directInfluence: 90,
    visibilityRange: 60,
  },
  founder: {
    id: 'founder',
    label: 'Founder',
    description: 'You establish the civilization\'s initial conditions. Highest impact at start, diminishing as it evolves.',
    empathySuppression: 0.3,
    directInfluence: 100,
    visibilityRange: 80,
    founderFade: true,
  },
  organizer: {
    id: 'organizer',
    label: 'Organizer',
    description: 'You work within the civilization to build coalitions and shift culture from within.',
    empathySuppression: 0.1,
    directInfluence: 40,
    visibilityRange: 70,
  },
  principles: {
    id: 'principles',
    label: 'Operating Principles',
    description: 'You ARE the founding principles of the civilization. You observe how well they are upheld or eroded over time.',
    empathySuppression: 0,
    directInfluence: 20,
    visibilityRange: 100,
  },
  influencer: {
    id: 'influencer',
    label: 'Influencer / Intellectual',
    description: 'You shape ideas, art, and philosophy. Indirect but culturally powerful over generations.',
    empathySuppression: 0.05,
    directInfluence: 30,
    visibilityRange: 75,
  },
  everyday: {
    id: 'everyday',
    label: 'Everyday Person',
    description: 'You live as an ordinary member of the civilization. The most grounded perspective — feel the full texture of daily life.',
    empathySuppression: 0,
    directInfluence: 5,
    visibilityRange: 40,
  },
};

// ── Behavior Types ────────────────────────────────────────────
const BEHAVIORS = {
  cooperation:    { id: 'cooperation',    label: 'Cooperation',         color: '#00d4aa' },
  competition:    { id: 'competition',    label: 'Competition',         color: '#ff6b6b' },
  mutualAid:      { id: 'mutualAid',      label: 'Mutual Aid',          color: '#6cd4a0' },
  acquisitiveness:{ id: 'acquisitiveness',label: 'Acquisitiveness',     color: '#f0a020' },
  conformity:     { id: 'conformity',     label: 'Conformity',          color: '#9090c0' },
  innovation:     { id: 'innovation',     label: 'Innovation',          color: '#60c0f0' },
  empathy:        { id: 'empathy',        label: 'Empathy',             color: '#f06090' },
  deference:      { id: 'deference',      label: 'Deference to Authority', color: '#c090a0' },
  individualism:  { id: 'individualism',  label: 'Individualism',       color: '#e0a060' },
  collectivism:   { id: 'collectivism',   label: 'Collectivism',        color: '#60a0e0' },
};

// ── Eras ──────────────────────────────────────────────────────
const ERAS = [
  { id: 'prehistoric', label: 'Prehistoric',       start: -4000, end: -3200, techLevel: 1,  color: '#6a5a3a' },
  { id: 'early_bronze',label: 'Early Bronze Age',  start: -3200, end: -2000, techLevel: 2,  color: '#8a7040' },
  { id: 'bronze',      label: 'Bronze Age',        start: -2000, end: -1200, techLevel: 3,  color: '#9a8050' },
  { id: 'iron',        label: 'Iron Age',          start: -1200, end: -500,  techLevel: 4,  color: '#7a7070' },
  { id: 'classical',   label: 'Classical',         start: -500,  end: 500,   techLevel: 5,  color: '#8a7060' },
  { id: 'medieval',    label: 'Medieval',          start: 500,   end: 1400,  techLevel: 6,  color: '#6a5a7a' },
  { id: 'renaissance', label: 'Renaissance',       start: 1400,  end: 1700,  techLevel: 7,  color: '#7a6a4a' },
  { id: 'industrial',  label: 'Industrial',        start: 1700,  end: 1900,  techLevel: 8,  color: '#5a5a6a' },
  { id: 'modern',      label: 'Modern',            start: 1900,  end: 2000,  techLevel: 9,  color: '#4a5a6a' },
  { id: 'contemporary',label: 'Contemporary',      start: 2000,  end: 2100,  techLevel: 10, color: '#3a4a5a' },
  { id: 'future',      label: 'Future',            start: 2100,  end: 3000,  techLevel: 11, color: '#2a3a6a' },
];

// ── Natural Disasters ─────────────────────────────────────────
const DISASTER_TYPES = {
  drought: {
    id: 'drought', label: 'Drought', icon: '☀️',
    description: 'Extended dry period severely reduces agricultural output.',
    fertilityCost: -40, populationRisk: 0.15, duration: [2, 5],
    eraRelevance: 'all',
  },
  flood: {
    id: 'flood', label: 'Flood', icon: '🌊',
    description: 'Catastrophic flooding destroys crops and settlements.',
    fertilityCost: -20, populationRisk: 0.1, duration: [1, 3],
    eraRelevance: 'all',
  },
  earthquake: {
    id: 'earthquake', label: 'Earthquake', icon: '🌋',
    description: 'Major seismic event damages infrastructure and causes casualties.',
    fertilityCost: 0, populationRisk: 0.12, duration: [1, 1],
    eraRelevance: 'all',
  },
  volcanic: {
    id: 'volcanic', label: 'Volcanic Eruption', icon: '🌋',
    description: 'Ash clouds and lava flows devastate surrounding regions.',
    fertilityCost: -60, populationRisk: 0.2, duration: [1, 4],
    eraRelevance: 'all',
  },
  plague: {
    id: 'plague', label: 'Plague / Epidemic', icon: '🦠',
    description: 'Disease spreads rapidly through the population.',
    fertilityCost: 0, populationRisk: 0.3, duration: [2, 8],
    eraRelevance: 'all',
  },
  famine: {
    id: 'famine', label: 'Famine', icon: '🌾',
    description: 'Widespread food shortage threatens survival.',
    fertilityCost: -50, populationRisk: 0.25, duration: [2, 6],
    eraRelevance: 'all',
  },
  ice_age: {
    id: 'ice_age', label: 'Climate Cooling', icon: '❄️',
    description: 'A period of significant cooling affects agriculture and habitability.',
    fertilityCost: -25, populationRisk: 0.08, duration: [5, 20],
    eraRelevance: 'ancient',
  },
  wildfire: {
    id: 'wildfire', label: 'Wildfire', icon: '🔥',
    description: 'Massive fires sweep through forests and settlements.',
    fertilityCost: -30, populationRisk: 0.08, duration: [1, 2],
    eraRelevance: 'all',
  },
  hurricane: {
    id: 'hurricane', label: 'Hurricane / Typhoon', icon: '🌀',
    description: 'Devastating storm surge and winds batter coastal civilizations.',
    fertilityCost: -15, populationRisk: 0.1, duration: [1, 1],
    eraRelevance: 'all',
  },
  locust: {
    id: 'locust', label: 'Locust Swarm', icon: '🦗',
    description: 'Massive swarms devastate crops across a wide region.',
    fertilityCost: -70, populationRisk: 0.05, duration: [1, 3],
    eraRelevance: 'ancient',
  },
};

// ── Technology Categories & Tree ──────────────────────────────
// Each advance has an id, prerequisites (array of advance ids that must be adopted first),
// and an era (earliest era when the tech becomes available). Prerequisites create
// branching paths — a civ can progress along different tracks independently.
// Cross-category prerequisites model real interdependencies (e.g., Germ Theory
// requires Scientific Method from the science category).
const TECH_CATEGORIES = {
  materials: {
    id: 'materials', label: 'Materials & Metallurgy', icon: '⚒️',
    advances: [
      { id: 'stone_tools',     era: 'prehistoric',   name: 'Stone Tools',       prerequisites: [],                          effect: { production: +10 } },
      { id: 'pottery',         era: 'early_bronze',  name: 'Pottery',           prerequisites: ['stone_tools'],             effect: { production: +10, fertility: +5 } },
      { id: 'bronze_working',  era: 'bronze',        name: 'Bronze Working',    prerequisites: ['pottery'],                 effect: { production: +20 } },
      { id: 'iron_working',    era: 'iron',          name: 'Iron Working',      prerequisites: ['bronze_working'],          effect: { production: +25 } },
      { id: 'steel',           era: 'industrial',    name: 'Steel',             prerequisites: ['iron_working', 'scientific_method'], effect: { production: +30 } },
      { id: 'advanced_materials', era: 'contemporary', name: 'Advanced Materials', prerequisites: ['steel', 'computing'],   effect: { production: +20, innovation: +10 } },
    ],
  },
  agriculture: {
    id: 'agriculture', label: 'Agriculture', icon: '🌾',
    advances: [
      { id: 'basic_farming',       era: 'prehistoric',   name: 'Basic Farming',          prerequisites: [],                                      effect: { fertility: +20 } },
      { id: 'irrigation',          era: 'bronze',        name: 'Irrigation',             prerequisites: ['basic_farming'],                        effect: { fertility: +30 } },
      { id: 'crop_rotation',       era: 'medieval',      name: 'Crop Rotation',          prerequisites: ['irrigation'],                           effect: { fertility: +20 } },
      { id: 'mechanized_ag',       era: 'industrial',    name: 'Mechanized Agriculture', prerequisites: ['crop_rotation', 'steam_engine'],        effect: { fertility: +40, warmingContrib: +5 } },
      { id: 'precision_ag',        era: 'contemporary',  name: 'Precision Agriculture',  prerequisites: ['mechanized_ag', 'computing'],           effect: { fertility: +20 } },
    ],
  },
  energy: {
    id: 'energy', label: 'Energy', icon: '⚡',
    advances: [
      { id: 'steam_engine',     era: 'industrial',    name: 'Steam Engine',      prerequisites: ['iron_working'],                          effect: { production: +30, warmingContrib: +10 }, eroi: 35 },
      { id: 'coal_power',       era: 'industrial',    name: 'Coal Power',        prerequisites: ['steam_engine'],                          effect: { production: +40, warmingContrib: +15 }, eroi: 35 },
      { id: 'oil_petroleum',    era: 'modern',        name: 'Oil / Petroleum',   prerequisites: ['steam_engine'],                          effect: { production: +50, warmingContrib: +20 }, eroi: 60 },
      { id: 'nuclear_power',    era: 'modern',        name: 'Nuclear Power',     prerequisites: ['modern_physics', 'steel'],               effect: { production: +40, warmingContrib: +2 }, eroi: 75 },
      { id: 'renewable_energy', era: 'contemporary',  name: 'Renewable Energy',  prerequisites: ['modern_physics', 'steel'],               effect: { production: +30, warmingContrib: -10 }, eroi: 15 },
      { id: 'fusion_power',     era: 'future',        name: 'Fusion Power',      prerequisites: ['nuclear_power', 'computing'],            effect: { production: +80, warmingContrib: -20 }, eroi: 50 },
    ],
  },
  science: {
    id: 'science', label: 'Science & Knowledge', icon: '🔬',
    advances: [
      { id: 'mathematics',        era: 'classical',    name: 'Mathematics',        prerequisites: ['writing_systems'],                       effect: { innovation: +15 } },
      { id: 'philosophy',         era: 'classical',    name: 'Philosophy',         prerequisites: ['writing_systems'],                       effect: { innovation: +10, cohesion: +5 } },
      { id: 'scientific_method',  era: 'renaissance',  name: 'Scientific Method',  prerequisites: ['mathematics', 'philosophy', 'printing_press'], effect: { innovation: +25 } },
      { id: 'modern_physics',     era: 'modern',       name: 'Modern Physics',     prerequisites: ['scientific_method'],                     effect: { innovation: +20 } },
      { id: 'computing',          era: 'contemporary', name: 'Computing',          prerequisites: ['modern_physics', 'mathematics'],         effect: { innovation: +30 } },
    ],
  },
  communication: {
    id: 'communication', label: 'Communication', icon: '📡',
    advances: [
      { id: 'writing_systems',  era: 'classical',     name: 'Writing Systems',    prerequisites: [],                                        effect: { innovation: +20, cohesion: +10 } },
      { id: 'printing_press',   era: 'medieval',       name: 'Printing Press',     prerequisites: ['writing_systems', 'iron_working'],       effect: { innovation: +30, conformity: -15 } },
      { id: 'telegraph',        era: 'industrial',     name: 'Telegraph',          prerequisites: ['scientific_method'],                     effect: { innovation: +15 } },
      { id: 'radio_tv',         era: 'modern',         name: 'Radio / Television', prerequisites: ['telegraph'],                             effect: { conformity: +10, innovation: +10 } },
      { id: 'internet',         era: 'contemporary',   name: 'Internet',           prerequisites: ['computing', 'radio_tv'],                 effect: { innovation: +40, cooperation: +15, conformity: -10 } },
      { id: 'neural_networks',  era: 'future',         name: 'Neural Networks',    prerequisites: ['internet', 'computing'],                 effect: { innovation: +50, deference: -20 } },
    ],
  },
  medicine: {
    id: 'medicine', label: 'Medicine', icon: '🏥',
    advances: [
      { id: 'herbal_medicine',    era: 'classical',     name: 'Herbal Medicine',     prerequisites: [],                                      effect: { populationGrowth: +10 } },
      { id: 'surgical_techniques', era: 'medieval',     name: 'Surgical Techniques', prerequisites: ['herbal_medicine', 'iron_working'],     effect: { populationGrowth: +10 } },
      { id: 'germ_theory',        era: 'industrial',    name: 'Germ Theory',         prerequisites: ['scientific_method', 'surgical_techniques'], effect: { populationGrowth: +25 } },
      { id: 'antibiotics',        era: 'modern',        name: 'Antibiotics',         prerequisites: ['germ_theory'],                         effect: { populationGrowth: +30 } },
      { id: 'gene_therapy',       era: 'contemporary',  name: 'Gene Therapy',        prerequisites: ['computing', 'antibiotics'],             effect: { populationGrowth: +20 } },
      { id: 'life_extension',     era: 'future',        name: 'Life Extension',      prerequisites: ['gene_therapy'],                         effect: { populationGrowth: +10 } },
    ],
  },
  maritime: {
    id: 'maritime', label: 'Maritime & Trade', icon: '⚓',
    advances: [
      { id: 'rafts',          era: 'early_bronze', name: 'Rafts & Boats',    prerequisites: [],                                        effect: { cooperation: +5 } },
      { id: 'sailing',        era: 'bronze',       name: 'Sailing',          prerequisites: ['rafts'],                                  effect: { cooperation: +10, innovation: +5 } },
      { id: 'navigation',     era: 'renaissance',  name: 'Navigation',       prerequisites: ['sailing', 'mathematics'],                 effect: { cooperation: +15, innovation: +10 } },
      { id: 'steamships',     era: 'industrial',   name: 'Steamships',       prerequisites: ['navigation', 'steam_engine'],             effect: { cooperation: +10, production: +15 } },
    ],
  },
};

// ── Tech Tree Lookup Helpers ─────────────────────────────────
// Build a flat map of id→advance for fast prerequisite resolution.
const TECH_TREE_INDEX = {};
for (const category of Object.values(TECH_CATEGORIES)) {
  for (const advance of category.advances) {
    TECH_TREE_INDEX[advance.id] = { ...advance, category: category.id };
  }
}

// Returns true if all prerequisites of a tech are in the adopted set.
function techPrerequisitesMet(techId, adoptedSet) {
  const tech = TECH_TREE_INDEX[techId];
  if (!tech || !tech.prerequisites || tech.prerequisites.length === 0) return true;
  return tech.prerequisites.every(prereqId => adoptedSet.has(prereqId));
}

// Get the tech id from a tech name (for backward compat with adoptedTechnologies array of names)
function techIdFromName(name) {
  for (const [id, tech] of Object.entries(TECH_TREE_INDEX)) {
    if (tech.name === name) return id;
  }
  return null;
}

// Build a Set of adopted tech IDs from the adoptedTechnologies name array
function buildAdoptedTechIdSet(adoptedTechnologies) {
  const set = new Set();
  for (const name of (adoptedTechnologies || [])) {
    const id = techIdFromName(name);
    if (id) set.add(id);
  }
  return set;
}

// Prerequisites for the Introduce/Discontinue catalog (modern techs).
// Maps TECHNOLOGY_CATALOG id → array of tech tree ids that must be adopted first.
const TECH_CATALOG_PREREQUISITES = {
  aging_treatment:        ['gene_therapy', 'life_extension'],
  cancer_vaccine:         ['gene_therapy', 'antibiotics'],
  clean_energy:           ['renewable_energy'],
  brain_computer_interface: ['neural_networks', 'gene_therapy'],
  landfill_recovery:      ['advanced_materials'],
  crispr_disease:         ['gene_therapy'],
  vertical_farming:       ['precision_ag', 'renewable_energy'],
  quantum_computing:      ['computing', 'modern_physics'],
  universal_internet:     ['internet'],
  autonomous_transport:   ['computing', 'internet'],
};

// Prerequisites for the Discontinuation catalog.
const TECH_DISCONTINUATION_PREREQUISITES = {
  end_combustion:    ['renewable_energy'],
  end_factory_farming: ['precision_ag'],
  end_fossil_fuels:  ['renewable_energy', 'nuclear_power'],
  ban_pesticides:    ['precision_ag'],
  nuclear_disarmament: ['nuclear_power'],
};

// ── Civilization Color Palette ────────────────────────────────
const CIV_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff5722', '#607d8b', '#ffc107', '#673ab7', '#4caf50',
];

// ── Preset Civilizations ──────────────────────────────────────
const CIVILIZATION_PRESETS = {
  gift_flat: {
    name: 'Gift Economy / Flat',
    description: 'A non-hierarchical society organized around voluntary giving and mutual aid.',
    economic: { model: 'gift', scarcityOrientation: 10, accumulationAllowed: false },
    governance: { model: 'flat_consensus', hierarchyLevel: 5, participationModel: 'voluntary', inheritanceSystem: 'communal' },
    operatingPrinciples: {
      freedomLevel: 80, collectivismLevel: 70, participationVoluntary: 90,
      outsiderRelationship: 'welcoming',
      coreValues: ['mutual aid', 'voluntary participation', 'non-coercion', 'ecological balance'],
    },
    religion: { presence: 'animist', stateRelationship: 'separate' },
    society: { socialTrust: 75, stateCapacity: 50, socialMobility: 72, infrastructureLevel: 30, urbanizationRate: 10, militaryPower: 10, civilianControl: 75, legitimacyType: 'rational-legal', legitimacyLevel: 65, foodSecurity: 65, collectiveTrauma: 0, landConcentration: 10, casteRigidity: 0, institutionalLockin: 5, techUnemployment: 0, retrainingCapacity: 55, ethnicFractionalization: 25, politicalInclusion: 80, demographicTransitionStage: 1, fertilityRate: 43, mortalityRate: 38, lifeExpectancy: 34, infantMortality: 70, diseaseBurden: 55, sanitationLevel: 25, youthCohort: 38, elderlyCohort: 6 },
  },
  market_representative: {
    name: 'Market / Representative',
    description: 'A market economy with elected representative governance.',
    economic: { model: 'market', scarcityOrientation: 65, accumulationAllowed: true },
    governance: { model: 'representative', hierarchyLevel: 40, participationModel: 'voluntary', inheritanceSystem: 'partible' },
    operatingPrinciples: {
      freedomLevel: 65, collectivismLevel: 35, participationVoluntary: 70,
      outsiderRelationship: 'trading',
      coreValues: ['individual rights', 'rule of law', 'private property', 'free speech'],
    },
    religion: { presence: 'plurality', stateRelationship: 'separate' },
    society: { socialTrust: 58, stateCapacity: 60, socialMobility: 55, infrastructureLevel: 55, urbanizationRate: 45, militaryPower: 40, civilianControl: 65, legitimacyType: 'rational-legal', legitimacyLevel: 65, foodSecurity: 70, collectiveTrauma: 0, landConcentration: 45, casteRigidity: 12, institutionalLockin: 35, techUnemployment: 0, retrainingCapacity: 50, ethnicFractionalization: 55, politicalInclusion: 65, demographicTransitionStage: 1, fertilityRate: 44, mortalityRate: 40, lifeExpectancy: 33, infantMortality: 72, diseaseBurden: 58, sanitationLevel: 20, youthCohort: 40, elderlyCohort: 5 },
  },
  commons_council: {
    name: 'Commons / Elder Council',
    description: 'Collectively managed resources with wisdom-based governance.',
    economic: { model: 'commons', scarcityOrientation: 25, accumulationAllowed: false },
    governance: { model: 'elder_council', hierarchyLevel: 30, participationModel: 'voluntary', inheritanceSystem: 'communal' },
    operatingPrinciples: {
      freedomLevel: 55, collectivismLevel: 75, participationVoluntary: 60,
      outsiderRelationship: 'trading',
      coreValues: ['collective stewardship', 'respect for elders', 'community harmony'],
    },
    religion: { presence: 'dominant', stateRelationship: 'influential' },
    society: { socialTrust: 60, stateCapacity: 40, socialMobility: 40, infrastructureLevel: 30, urbanizationRate: 15, militaryPower: 20, civilianControl: 55, legitimacyType: 'traditional', legitimacyLevel: 60, foodSecurity: 60, collectiveTrauma: 0, landConcentration: 20, casteRigidity: 25, institutionalLockin: 30, techUnemployment: 0, retrainingCapacity: 35, ethnicFractionalization: 20, politicalInclusion: 50, demographicTransitionStage: 1, fertilityRate: 42, mortalityRate: 37, lifeExpectancy: 35, infantMortality: 68, diseaseBurden: 52, sanitationLevel: 22, youthCohort: 37, elderlyCohort: 7 },
  },
  theocratic_autocracy: {
    name: 'Theocratic Autocracy',
    description: 'Divine rule with absolute authority, unified faith.',
    economic: { model: 'planned', scarcityOrientation: 60, accumulationAllowed: false },
    governance: { model: 'theocratic', hierarchyLevel: 85, participationModel: 'compulsory', inheritanceSystem: 'primogeniture' },
    operatingPrinciples: {
      freedomLevel: 15, collectivismLevel: 60, participationVoluntary: 10,
      outsiderRelationship: 'isolationist',
      coreValues: ['divine law', 'obedience', 'purity', 'tradition'],
    },
    religion: { presence: 'theocratic', stateRelationship: 'dominant' },
    society: { socialTrust: 38, stateCapacity: 55, socialMobility: 28, infrastructureLevel: 50, urbanizationRate: 25, militaryPower: 55, civilianControl: 40, legitimacyType: 'traditional', legitimacyLevel: 70, foodSecurity: 55, collectiveTrauma: 10, landConcentration: 65, casteRigidity: 55, institutionalLockin: 60, techUnemployment: 0, retrainingCapacity: 25, ethnicFractionalization: 40, politicalInclusion: 25, demographicTransitionStage: 1, fertilityRate: 46, mortalityRate: 42, lifeExpectancy: 31, infantMortality: 78, diseaseBurden: 65, sanitationLevel: 12, youthCohort: 42, elderlyCohort: 4 },
  },
  barter_tribal: {
    name: 'Barter / Tribal',
    description: 'Small-scale tribal society with direct exchange and clan leadership.',
    economic: { model: 'barter', scarcityOrientation: 45, accumulationAllowed: true },
    governance: { model: 'tribal_chief', hierarchyLevel: 50, participationModel: 'voluntary', inheritanceSystem: 'primogeniture' },
    operatingPrinciples: {
      freedomLevel: 50, collectivismLevel: 60, participationVoluntary: 55,
      outsiderRelationship: 'isolationist',
      coreValues: ['clan loyalty', 'strength', 'honor', 'ancestral tradition'],
    },
    religion: { presence: 'animist', stateRelationship: 'influential' },
    society: { socialTrust: 45, stateCapacity: 30, socialMobility: 35, infrastructureLevel: 15, urbanizationRate: 5, militaryPower: 50, civilianControl: 35, legitimacyType: 'traditional', legitimacyLevel: 55, foodSecurity: 50, collectiveTrauma: 5, landConcentration: 25, casteRigidity: 40, institutionalLockin: 20, techUnemployment: 0, retrainingCapacity: 15, ethnicFractionalization: 15, politicalInclusion: 35, demographicTransitionStage: 1, fertilityRate: 48, mortalityRate: 43, lifeExpectancy: 30, infantMortality: 80, diseaseBurden: 70, sanitationLevel: 8, youthCohort: 43, elderlyCohort: 4 },
  },
  labor_cooperative: {
    name: 'Labor Credit / Cooperative',
    description: 'Workers own the means of production; time is the unit of value.',
    economic: { model: 'labor_credit', scarcityOrientation: 30, accumulationAllowed: true },
    governance: { model: 'rotating', hierarchyLevel: 20, participationModel: 'voluntary', inheritanceSystem: 'meritocratic' },
    operatingPrinciples: {
      freedomLevel: 70, collectivismLevel: 65, participationVoluntary: 75,
      outsiderRelationship: 'trading',
      coreValues: ['labor dignity', 'worker ownership', 'democratic control', 'solidarity'],
    },
    religion: { presence: 'none', stateRelationship: 'separate' },
    society: { socialTrust: 68, stateCapacity: 45, socialMobility: 65, infrastructureLevel: 40, urbanizationRate: 30, militaryPower: 15, civilianControl: 70, legitimacyType: 'rational-legal', legitimacyLevel: 60, foodSecurity: 65, collectiveTrauma: 0, landConcentration: 15, casteRigidity: 5, institutionalLockin: 15, techUnemployment: 0, retrainingCapacity: 60, ethnicFractionalization: 35, politicalInclusion: 75, demographicTransitionStage: 1, fertilityRate: 42, mortalityRate: 36, lifeExpectancy: 36, infantMortality: 65, diseaseBurden: 50, sanitationLevel: 30, youthCohort: 36, elderlyCohort: 7 },
  },
};

// ── Social Position Labels ────────────────────────────────────
const SOCIAL_POSITIONS = ['leader', 'elite', 'professional', 'laborer', 'marginalized'];

// ── Interview Question Categories ────────────────────────────
const INTERVIEW_CATEGORIES = [
  { id: 'daily_life',   label: 'Daily Life',           icon: '🏡' },
  { id: 'economy',      label: 'Economic Life',        icon: '⚖️' },
  { id: 'governance',   label: 'Governance & Power',   icon: '🏛️' },
  { id: 'religion',     label: 'Faith & Meaning',      icon: '✨' },
  { id: 'community',    label: 'Community & Relations', icon: '🤝' },
  { id: 'wellbeing',    label: 'Wellbeing & Happiness', icon: '💙' },
  { id: 'change',       label: 'Change & Future',      icon: '🔮' },
  { id: 'power',        label: 'Power & Agency',       icon: '✊' },
  { id: 'challenges',   label: 'Challenges of the Era', icon: '⚡' },
  { id: 'personal',     label: 'Personal Life',         icon: '🧑' },
];

// ── NPC Names by Era / Region (simplified pool) ───────────────
const NPC_NAME_POOL = {
  forenames_neutral: [
    'Asha','Kiran','River','Sage','Ember','Storm','Vale','Cove',
    'Lark','Fenn','Brook','Ash','Quinn','Reed','Wren','Sky',
    'Rowan','Cedar','Briar','Flint','Moss','Stone','Leaf','Rain',
  ],
  forenames_ancient: [
    'Amara','Darius','Lyra','Cato','Nira','Bel','Cyra','Aten',
    'Mira','Soren','Aria','Finn','Kali','Seth','Hera','Roan',
  ],
  forenames_medieval: [
    'Aldric','Maren','Theron','Elowen','Bram','Sable','Gareth','Niamh',
    'Roland','Isolde','Cador','Elara','Wulf','Brenna','Leofric','Seren',
  ],
  forenames_modern: [
    'Alex','Jordan','Maya','Kai','Sofia','Leo','Zara','Eli',
    'Luna','Noa','Mia','Theo','Eva','Sam','Nia','Finn',
  ],
  surnames: [
    'of the River','of the Hill','Stone','Fisher','Weaver','Miller',
    'of the Forest','Blacksmith','Healer','Keeper','Walker','Seeker',
    'of the Mountains','Maker','Grower','Builder','Scholar','Singer',
  ],
};

// ── Migration Event Presets ────────────────────────────────────
const MIGRATION_INFLUX_PRESETS = [
  {
    id: 'migration_refugees_war',
    icon: '🏕️',
    label: 'War Refugees',
    description: 'People fleeing armed conflict in a neighboring region arrive seeking safety. The influx strains infrastructure but adds population and generates cooperative goodwill.',
    populationChangePct: [8, 15],   // [min, max] percent
    effects: { stabilityDelta: -5, wellbeingDelta: -3, cooperationDelta: 8 },
  },
  {
    id: 'migration_refugees_disaster',
    icon: '🌊',
    label: 'Disaster Displaced',
    description: 'A natural disaster has displaced large numbers of people who have no choice but to seek shelter elsewhere. They arrive with little and need much.',
    populationChangePct: [5, 10],
    effects: { wellbeingDelta: -5, stabilityDelta: -3 },
  },
  {
    id: 'migration_refugees_oppression',
    icon: '✊',
    label: 'Fleeing Oppression',
    description: 'People are arriving who fled political persecution, targeted violence, or systematic exclusion in their homeland. Many are skilled, motivated, and deeply committed to not being controlled again.',
    populationChangePct: [5, 12],
    effects: { empathyDelta: 8, cooperationDelta: 6, freedomDelta: 3, stabilityDelta: -2 },
  },
  {
    id: 'migration_refugees_poverty',
    icon: '💼',
    label: 'Economic Migrants',
    description: 'People seeking better economic conditions arrive from poorer regions. They bring labor, skills, and cultural richness — and put pressure on existing social contracts.',
    populationChangePct: [4, 8],
    effects: { wealthConcDelta: 3, cooperationDelta: 4, wellbeingDelta: -1 },
  },
  {
    id: 'migration_open_borders',
    icon: '🌐',
    label: 'Open Borders Policy',
    description: 'A proactive open-borders policy has attracted a significant wave of settlers seeking opportunity and freedom. Population grows substantially and cooperation benefits are real — but so is the short-term adjustment pressure.',
    populationChangePct: [10, 20],
    effects: { wellbeingDelta: 5, cooperationDelta: 12, stabilityDelta: -4, innovationDelta: 6 },
    requiresOpenBorder: true,
  },
  {
    id: 'migration_opportunity_seekers',
    icon: '⭐',
    label: 'Opportunity Seekers',
    description: 'Word of this civilization\'s wellbeing and freedom has spread. Skilled, motivated people are choosing to move here — for the quality of life, not desperation.',
    populationChangePct: [5, 10],
    effects: { innovationDelta: 6, cooperationDelta: 6, wellbeingDelta: 3 },
  },
];

const MIGRATION_OUTFLOW_PRESETS = [
  {
    id: 'emigration_oppression',
    icon: '🚪',
    label: 'Brain / Population Drain',
    description: 'Educated, skilled, and entrepreneurial people are leaving — finding the conditions here incompatible with how they want to live or work. The ones most capable of improving things are the first to go.',
    populationChangePct: [-15, -8],
    effects: { innovationDelta: -8, empathyDelta: 5 },
  },
  {
    id: 'emigration_poverty',
    icon: '💸',
    label: 'Economic Emigration',
    description: 'People are leaving for better economic opportunities elsewhere. The outflow reduces the population that must be sustained, but also removes productive labor and social connections.',
    populationChangePct: [-10, -5],
    effects: { wealthConcDelta: -3, wellbeingDelta: -4 },
  },
  {
    id: 'emigration_expulsion',
    icon: '⚠️',
    label: 'Forced Expulsion',
    description: 'The governing authority has directed the removal of a population group — through explicit policy, targeted violence, or conditions engineered to make remaining impossible. This is a deliberate act with profound consequences.',
    populationChangePct: [-20, -10],
    effects: { stabilityDelta: -15, empathyDelta: -12, corruptionDelta: 8 },
    warning: true,
  },
  {
    id: 'emigration_environmental',
    icon: '🌡️',
    label: 'Environmental Displacement',
    description: 'Ecological collapse — desertification, flooding, soil depletion — has made parts of this civilization\'s territory uninhabitable. People are moving. Some cannot.',
    populationChangePct: [-12, -8],
    effects: { stabilityDelta: -8, wellbeingDelta: -10 },
  },
  {
    id: 'emigration_war_flight',
    icon: '⚔️',
    label: 'War Flight',
    description: 'Active armed conflict is driving mass civilian displacement. Families are leaving everything behind. The exodus compounds the destruction of the war itself.',
    populationChangePct: [-20, -10],
    effects: { stabilityDelta: -15, wellbeingDelta: -12, cooperationDelta: -8 },
  },
];

// ── Organized Crime Types & Countermeasures ───────────────────
const CRIME_TYPES = {
  street_gang: {
    id: 'street_gang',
    label: 'Street Gangs',
    icon: '🔫',
    description: 'Organized criminal networks at the neighborhood level — filling voids left by poverty, lack of opportunity, and institutional neglect. Control local turf, recruit from marginalized youth, and exact tribute.',
    emergenceConditions: 'Emerges when stability is low and equality is very low.',
    primaryEffects: { stability: -0.3, wellbeing: -0.2, cooperation: -0.15 },
    countermeasures: [
      {
        id: 'community_investment',
        label: 'Community Investment',
        icon: '🏫',
        description: 'Fund schools, job programs, community centers, and social services in high-crime areas. Addresses root causes. Slow but durable.',
        turns: 4,
        crimeLevelDelta: -25,
        effects: { cooperationDelta: 12, stabilityDelta: 8, wellbeingDelta: 5 },
      },
      {
        id: 'police_crackdown',
        label: 'Police Crackdown',
        icon: '🚔',
        description: 'Aggressive law enforcement presence, mass arrests, and zero-tolerance policies. Fast, but at significant cost to freedom and community trust.',
        turns: 2,
        crimeLevelDelta: -35,
        effects: { freedomDelta: -10, stabilityDelta: 5, cooperationDelta: -5 },
      },
      {
        id: 'gang_truce',
        label: 'Brokered Gang Truce',
        icon: '🤝',
        description: 'Mediated negotiations between rival gang factions to reduce violence, often using community leaders or former gang members as mediators. Unconventional but reduces harm without mass incarceration.',
        turns: 3,
        crimeLevelDelta: -15,
        effects: { cooperationDelta: 8, stabilityDelta: 5 },
      },
    ],
  },
  cartel: {
    id: 'cartel',
    label: 'Cartel',
    icon: '💊',
    description: 'Large-scale criminal enterprise controlling the production and distribution of illegal goods — drugs, weapons, counterfeit currency, or black-market resources. Operates with military-grade violence and deep economic corruption.',
    emergenceConditions: 'Emerges when wealth is highly concentrated and corruption is high.',
    primaryEffects: { corruption: 0.3, wealthConcentration: 0.2, freedom: -0.15 },
    countermeasures: [
      {
        id: 'interdiction',
        label: 'Interdiction',
        icon: '🛡️',
        description: 'Active law enforcement disruption of supply chains — raids, seizures, extradition. Produces results but requires significant security resources and has collateral stability costs.',
        turns: 3,
        crimeLevelDelta: -30,
        effects: { corruptionDelta: -10, stabilityDelta: -5 },
      },
      {
        id: 'prosecution',
        label: 'Prosecution & Rule of Law',
        icon: '⚖️',
        description: 'Systematic legal prosecution of cartel leadership and networks, strengthening judicial independence. Slower but builds institutional capacity to resist future emergence.',
        turns: 4,
        crimeLevelDelta: -20,
        effects: { corruptionDelta: -15, freedomDelta: 5, stabilityDelta: 2 },
      },
      {
        id: 'legalization',
        label: 'Regulated Legalization',
        icon: '📋',
        description: 'Remove the illegal market the cartel operates in by legalizing and regulating the goods under state control. Dramatically cuts violence and corruption, but politically contentious.',
        turns: 5,
        crimeLevelDelta: -40,
        effects: { corruptionDelta: -5, wealthConcDelta: 5, wellbeingDelta: 3 },
      },
    ],
  },
  mafia: {
    id: 'mafia',
    label: 'Mafia',
    icon: '🎩',
    description: 'A sophisticated criminal organization that has embedded itself in economic and political structures. Controls contracts, influences officials, provides parallel "protection" services, and ensures its own impunity through strategic corruption.',
    emergenceConditions: 'Emerges when corruption and power concentration are both very high.',
    primaryEffects: { corruption: 0.4, equality: -0.2 },
    countermeasures: [
      {
        id: 'anti_corruption_drive',
        label: 'Anti-Corruption Drive',
        icon: '🔎',
        description: 'Systematic investigation and prosecution of public officials with ties to organized crime. Requires political will and carries real risks — those being investigated push back hard.',
        turns: 4,
        crimeLevelDelta: -20,
        effects: { corruptionDelta: -20, stabilityDelta: -5 },
      },
      {
        id: 'judicial_independence',
        label: 'Strengthen Judicial Independence',
        icon: '🏛️',
        description: 'Reform the judiciary, install independent prosecutors, establish oversight bodies with real authority. Long-term institution-building that mafia influence cannot easily capture.',
        turns: 5,
        crimeLevelDelta: -15,
        effects: { corruptionDelta: -25, freedomDelta: 8, stabilityDelta: 3 },
      },
      {
        id: 'whistleblower_protection',
        label: 'Whistleblower Protection',
        icon: '📢',
        description: 'Legal protections and financial incentives for insiders to come forward with evidence of criminal-state relationships. Exposes networks that are otherwise opaque.',
        turns: 4,
        crimeLevelDelta: -20,
        effects: { corruptionDelta: -20, innovationDelta: 5 },
      },
    ],
  },
  pirate_network: {
    id: 'pirate_network',
    label: 'Pirate Network',
    icon: '🏴‍☠️',
    description: 'Organized maritime criminal enterprise raiding trade routes, extorting shipping, and running contraband. Historically enabled by weak coastal governance and economic desperation. Disrupts inter-civilization trade and diplomacy.',
    emergenceConditions: 'Emerges in ocean-access civilizations with poor conditions. Cannot emerge in landlocked civs.',
    primaryEffects: { diplomacy: -0.5, wealthConcentration: 0.1 },
    requiresOceanAccess: true,
    countermeasures: [
      {
        id: 'naval_patrols',
        label: 'Naval Patrols',
        icon: '⚓',
        description: 'Dedicated naval forces patrol shipping lanes and coastal areas. Effective at suppression but resource-intensive and creates ongoing commitment.',
        turns: 3,
        crimeLevelDelta: -30,
        effects: { wellbeingDelta: -3, stabilityDelta: 3 },
      },
      {
        id: 'economic_development',
        label: 'Coastal Economic Development',
        icon: '🏗️',
        description: 'Address the economic conditions that drive piracy recruitment. Build port infrastructure, expand legitimate maritime trade, create alternatives to criminal enterprise.',
        turns: 6,
        crimeLevelDelta: -20,
        effects: { stabilityDelta: 8, wellbeingDelta: 5, cooperationDelta: 4 },
      },
      {
        id: 'privateering',
        label: 'Privateering (State-Licensed Piracy)',
        icon: '🔱',
        description: 'Issue letters of marque to formerly criminal maritime operators, directing their activity against enemy shipping and trade competitors. Suppresses internal crime but generates diplomatic blowback and deepens corruption.',
        turns: 2,
        crimeLevelDelta: -35,
        effects: { corruptionDelta: 10, diplomacyDelta: -10 },
      },
    ],
  },
};

// ── Geography Terrain Tags ────────────────────────────────────
const GEOGRAPHY_TERRAIN_TAGS = [
  { id: 'mountainous', label: 'Mountainous',       icon: '⛰️',  statNote: '+innovation, −expansion' },
  { id: 'forested',    label: 'Forested',           icon: '🌲',  statNote: '+fertility, −warming' },
  { id: 'grasslands',  label: 'Grasslands/Steppes', icon: '🌾',  statNote: '+expansion, +food' },
  { id: 'marshy',      label: 'Marshy/Swampy',      icon: '🌿',  statNote: '−population growth, disease risk' },
  { id: 'arid',        label: 'Arid/Desert',        icon: '🏜️',  statNote: '−fertility, +innovation (scarcity pressure)' },
  { id: 'coastal',     label: 'Coastal Access',     icon: '🌊',  statNote: '+trade, +diplomacy' },
];

const CLIMATE_ZONES = [
  { id: 'arctic',      label: 'Arctic / Frigid',  icon: '❄️',   statNote: '−population growth, −wellbeing' },
  { id: 'temperate',   label: 'Temperate',         icon: '🌤️',   statNote: 'Balanced baseline' },
  { id: 'subtropical', label: 'Subtropical',       icon: '🌞',   statNote: '+fertility, moderate disease risk' },
  { id: 'tropical',    label: 'Tropical',          icon: '🌴',   statNote: '+fertility, higher disease risk' },
  { id: 'mixed',       label: 'Mixed / Varied',    icon: '🗺️',   statNote: 'No single dominant effect' },
];

// ── Strata Impact Profiles ────────────────────────────────────
// For each social pressure factor, per-tier severity 0–5 (5 = most severe)
// Special value -1 = benefit to that tier rather than harm.
const STRATA_IMPACT_PROFILES = {
  street_gang: {
    label: 'Street Gang Activity', icon: '🔫',
    tiers: { elite: 1, upper_middle: 2, lower_middle: 3, working_class: 4, disenfranchised: 5 },
    tierNotes: {
      elite:           'Security services insulate',
      upper_middle:    'Business disruption nearby',
      lower_middle:    'Neighborhood safety at risk',
      working_class:   'Daily safety concerns',
      disenfranchised: 'Most exposed, fewest options',
    },
  },
  cartel: {
    label: 'Cartel Activity', icon: '💰',
    tiers: { elite: 2, upper_middle: 4, lower_middle: 5, working_class: 3, disenfranchised: 2 },
    tierNotes: {
      elite:           'Extortion of large firms',
      upper_middle:    'Business and property threatened',
      lower_middle:    'Small business extortion',
      working_class:   'Market price manipulation',
      disenfranchised: 'Largely bypassed by cartel focus',
    },
  },
  mafia: {
    label: 'Mafia / Governance Capture', icon: '🤝',
    tiers: { elite: 4, upper_middle: 5, lower_middle: 3, working_class: 2, disenfranchised: 1 },
    tierNotes: {
      elite:           'Power-sharing demands imposed',
      upper_middle:    'Governance access blocked or taxed',
      lower_middle:    'Permits and courts corrupt',
      working_class:   'Limited direct impact',
      disenfranchised: 'Largely invisible to organized crime',
    },
  },
  pirate_network: {
    label: 'Pirate Network', icon: '🏴‍☠️',
    tiers: { elite: 3, upper_middle: 4, lower_middle: 4, working_class: 3, disenfranchised: 2 },
    tierNotes: {
      elite:           'Trade route disruption',
      upper_middle:    'Merchant and shipping losses',
      lower_middle:    'Supply chain impacts',
      working_class:   'Goods prices rise',
      disenfranchised: 'Some economic insulation',
    },
  },
  slavery_active: {
    label: 'Institutionalized Slavery', icon: '⛓️',
    tiers: { elite: -1, upper_middle: 1, lower_middle: 2, working_class: 3, disenfranchised: 5 },
    tierNotes: {
      elite:           'Extracted labor enriches',
      upper_middle:    'Some labor competition',
      lower_middle:    'Wage suppression',
      working_class:   'Direct wage and labor competition',
      disenfranchised: 'Catastrophic exploitation',
    },
  },
  climate_warming: {
    label: 'Climate Warming', icon: '🌡️',
    tiers: { elite: 1, upper_middle: 2, lower_middle: 3, working_class: 4, disenfranchised: 5 },
    tierNotes: {
      elite:           'Wealth buffers exposure',
      upper_middle:    'Some property risk',
      lower_middle:    'Food costs rise',
      working_class:   'Livelihood threatened',
      disenfranchised: 'Most vulnerable, least resourced',
    },
  },
  high_inequality: {
    label: 'Extreme Inequality', icon: '📊',
    tiers: { elite: 0, upper_middle: 1, lower_middle: 3, working_class: 4, disenfranchised: 5 },
    tierNotes: {
      elite:           'Structural advantage maintained',
      upper_middle:    'Ceiling effects appear',
      lower_middle:    'Upward mobility blocked',
      working_class:   'Stagnant wages',
      disenfranchised: 'Permanent structural exclusion',
    },
  },
  civil_conflict: {
    label: 'Civil Conflict / Instability', icon: '⚔️',
    tiers: { elite: 2, upper_middle: 3, lower_middle: 4, working_class: 4, disenfranchised: 5 },
    tierNotes: {
      elite:           'Property and assets at risk',
      upper_middle:    'Business disruption',
      lower_middle:    'Safety concerns escalate',
      working_class:   'Livelihood disrupted',
      disenfranchised: 'Front-line exposure',
    },
  },
  systemic_corruption: {
    label: 'Systemic Corruption', icon: '🏛️',
    tiers: { elite: 1, upper_middle: 4, lower_middle: 5, working_class: 4, disenfranchised: 3 },
    tierNotes: {
      elite:           'Corruption lubricates power',
      upper_middle:    'Bribery costs escalate',
      lower_middle:    'Services blocked by graft',
      working_class:   'Wages and services skimmed',
      disenfranchised: 'Services already largely denied',
    },
  },
};

// ── Technology Introduction Catalog ────────────────────────────────────────────
const TECHNOLOGY_CATALOG = [
  {
    id: 'aging_treatment',
    name: 'Longevity Treatment',
    category: 'biotech',
    icon: '🧬',
    description: 'Medical intervention that significantly slows or reverses biological aging processes, extending healthy lifespan for those with access.',
    rolloutProfile: 'elite_first',
    rolloutTurns: 4,
    tags: ['aging', 'longevity', 'lifespan', 'medical'],
    immediateEffects: { wellbeing: 8, equality: -5, innovation: 5, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 20, note: 'Life extension, maintained power base' },
      upper_middle:    { wellbeing: 14, note: 'Extended productive years' },
      lower_middle:    { wellbeing: 6,  note: 'Limited initial access via insurance' },
      working_class:   { wellbeing: 2,  note: 'Minimal early access' },
      disenfranchised: { wellbeing: 0,  note: 'No access initially' },
    },
    consequenceChain: [
      { turnDelay: 3,  type: 'population_surge',     magnitude: 2, label: 'Longevity Boom',    icon: '👥', description: 'Population growth accelerates as death rates fall among those with access.' },
      { turnDelay: 6,  type: 'resource_strain',      magnitude: 3, label: 'Resource Pressure', icon: '📉', description: 'A larger living population strains food production and material supply chains.' },
      { turnDelay: 10, type: 'climate_acceleration', magnitude: 2, label: 'Climate Pressure',  icon: '🌡️', description: 'Sustained overpopulation accelerates resource consumption and warming.' },
    ],
  },
  {
    id: 'cancer_vaccine',
    name: 'Universal Cancer Vaccine',
    category: 'biotech',
    icon: '💉',
    description: 'A broadly effective prophylactic vaccine that prevents most common cancers before onset, dramatically reducing cancer mortality across the population.',
    rolloutProfile: 'universal',
    rolloutTurns: 2,
    tags: ['cancer', 'vaccine', 'medical', 'health'],
    immediateEffects: { wellbeing: 12, equality: 3, innovation: 4, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 12, note: 'Reinforces existing health advantage' },
      upper_middle:    { wellbeing: 13, note: 'Strong benefit, good access' },
      lower_middle:    { wellbeing: 12, note: 'Broad access via public health' },
      working_class:   { wellbeing: 11, note: 'Universal rollout reaches most workers' },
      disenfranchised: { wellbeing: 8,  note: 'Partial reach via community programs' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'population_surge',  magnitude: 1, label: 'Population Growth',  icon: '👥', description: 'Reduced cancer mortality increases overall life expectancy and population.' },
      { turnDelay: 5, type: 'inequality_surge',  magnitude: 1, label: 'Pharma Access Gap',  icon: '📊', description: 'Patent disputes and access gaps appear in lower-resource regions.' },
    ],
  },
  {
    id: 'clean_energy',
    name: 'Clean and Free Energy',
    category: 'energy',
    icon: '⚡',
    description: 'Breakthrough energy generation technology providing effectively unlimited, near-zero-cost, zero-emission power — fusion, advanced solar, or equivalent.',
    rolloutProfile: 'market_driven',
    rolloutTurns: 5,
    tags: ['energy', 'clean', 'renewable', 'fusion', 'solar'],
    immediateEffects: { wellbeing: 6, equality: -2, innovation: 8, warmingImpact: -3 },
    strataEffects: {
      elite:           { wellbeing: 8, note: 'Early investor and infrastructure access' },
      upper_middle:    { wellbeing: 7, note: 'Residential adoption wave' },
      lower_middle:    { wellbeing: 5, note: 'Grid benefits after transition delay' },
      working_class:   { wellbeing: 3, note: 'Legacy industry displacement begins' },
      disenfranchised: { wellbeing: 2, note: 'Infrastructure gaps persist initially' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock',          magnitude: 2, label: 'Fossil Fuel Displacement', icon: '⚙️', description: 'Workers in fossil fuel and legacy energy industries face rapid job loss.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 3, label: 'Emission Decline',         icon: '🌿', description: 'Global warming contribution begins to fall significantly.' },
      { turnDelay: 7, type: 'economic_disruption',       magnitude: 1, label: 'Energy Market Shock',      icon: '💱', description: 'Energy commodity markets restructure, causing transitional economic disruption.' },
    ],
  },
  {
    id: 'brain_computer_interface',
    name: 'Brain-Computer Interface',
    category: 'computing',
    icon: '🧠',
    description: 'Direct neural-digital interfaces that augment cognition, memory, and communication — giving users dramatically enhanced information processing and productivity.',
    rolloutProfile: 'elite_first',
    rolloutTurns: 6,
    tags: ['brain', 'interface', 'neural', 'cognitive', 'bci'],
    immediateEffects: { wellbeing: 5, equality: -8, innovation: 12, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 18,  note: 'Cognitive augmentation cements power advantage' },
      upper_middle:    { wellbeing: 10,  note: 'Productivity and learning gains' },
      lower_middle:    { wellbeing: 2,   note: 'Limited access, awareness of gap grows' },
      working_class:   { wellbeing: -2,  note: 'Competitive disadvantage without augmentation' },
      disenfranchised: { wellbeing: -4,  note: 'Structurally excluded, further marginalized' },
    },
    consequenceChain: [
      { turnDelay: 3, type: 'inequality_surge',    magnitude: 3, label: 'Cognitive Divide',    icon: '📊', description: 'Augmented elites accumulate advantage at an accelerating rate.' },
      { turnDelay: 6, type: 'economic_disruption', magnitude: 2, label: 'Labor Market Shift',  icon: '💱', description: 'Augmented workers displace non-augmented in cognitive labor markets.' },
    ],
  },
  {
    id: 'landfill_recovery',
    name: 'Landfill Resource Recovery',
    category: 'environment',
    icon: '♻️',
    description: 'Industrial-scale mining and processing of existing landfills to recover metals, rare earths, and usable materials from accumulated waste.',
    rolloutProfile: 'universal',
    rolloutTurns: 3,
    tags: ['landfill', 'recycling', 'waste', 'recovery', 'rare earth'],
    immediateEffects: { wellbeing: 4, equality: 3, innovation: 3, warmingImpact: -1 },
    strataEffects: {
      elite:           { wellbeing: 3, note: 'Modest resource windfall' },
      upper_middle:    { wellbeing: 4, note: 'Environmental improvement near former dump sites' },
      lower_middle:    { wellbeing: 5, note: 'Job creation in recovery sector' },
      working_class:   { wellbeing: 6, note: 'New employment, reduced waste burden' },
      disenfranchised: { wellbeing: 7, note: 'Often near former waste sites — direct relief' },
    },
    consequenceChain: [
      { turnDelay: 3, type: 'environmental_improvement', magnitude: 2, label: 'Waste Remediation', icon: '🌿', description: 'Legacy waste sites are remediated, improving local environmental health.' },
    ],
  },
  {
    id: 'crispr_disease',
    name: 'CRISPR Disease Elimination',
    category: 'biotech',
    icon: '🔬',
    description: 'Precision gene editing deployed at scale to eliminate hereditary diseases and certain infectious diseases from human populations.',
    rolloutProfile: 'universal',
    rolloutTurns: 4,
    tags: ['crispr', 'genetic', 'disease', 'gene', 'editing', 'hereditary'],
    immediateEffects: { wellbeing: 10, equality: 4, innovation: 6, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 10, note: 'Enhanced life quality' },
      upper_middle:    { wellbeing: 11, note: 'Broad access through health system' },
      lower_middle:    { wellbeing: 10, note: 'Significant disease burden reduction' },
      working_class:   { wellbeing: 9,  note: 'Major health improvement' },
      disenfranchised: { wellbeing: 6,  note: 'Access gaps but still meaningful benefit' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'population_surge',  magnitude: 1, label: 'Population Growth',    icon: '👥', description: 'Reduced disease mortality increases population.' },
      { turnDelay: 5, type: 'inequality_surge',  magnitude: 2, label: 'Genetic Access Divide', icon: '📊', description: 'Premium gene therapies create new tiers of biological privilege.' },
    ],
  },
  {
    id: 'vertical_farming',
    name: 'Vertical Farming',
    category: 'agriculture',
    icon: '🌱',
    description: 'Urban indoor farming at scale, producing crops year-round without traditional land, water, and weather requirements.',
    rolloutProfile: 'market_driven',
    rolloutTurns: 3,
    tags: ['farming', 'vertical', 'food', 'agriculture', 'urban'],
    immediateEffects: { wellbeing: 5, equality: 2, innovation: 4, warmingImpact: -1 },
    strataEffects: {
      elite:           { wellbeing: 4, note: 'Premium local produce access' },
      upper_middle:    { wellbeing: 5, note: 'Food security improvement' },
      lower_middle:    { wellbeing: 5, note: 'More stable food prices' },
      working_class:   { wellbeing: 6, note: 'Reduced food insecurity' },
      disenfranchised: { wellbeing: 4, note: 'Distribution depends on food system model' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock',          magnitude: 1, label: 'Agricultural Displacement', icon: '⚙️', description: 'Traditional farming employment declines in regions where vertical farming scales.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 2, label: 'Land Release',              icon: '🌿', description: 'Agricultural land freed for rewilding or other uses.' },
    ],
  },
  {
    id: 'quantum_computing',
    name: 'Quantum Computing',
    category: 'computing',
    icon: '💻',
    description: 'Practical quantum computers capable of solving problems intractable to classical hardware, from cryptography to drug discovery to financial modeling.',
    rolloutProfile: 'elite_first',
    rolloutTurns: 5,
    tags: ['quantum', 'computing', 'cryptography', 'ai'],
    immediateEffects: { wellbeing: 3, equality: -4, innovation: 15, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 12, note: 'Encryption advantage, financial modeling' },
      upper_middle:    { wellbeing: 6,  note: 'Research and professional productivity gain' },
      lower_middle:    { wellbeing: 2,  note: 'Indirect benefits through system improvements' },
      working_class:   { wellbeing: 0,  note: 'No direct benefit initially' },
      disenfranchised: { wellbeing: -1, note: 'Existing power structures strengthened' },
    },
    consequenceChain: [
      { turnDelay: 3, type: 'economic_disruption', magnitude: 2, label: 'Encryption Disruption', icon: '💱', description: 'Quantum-breaking of existing encryption forces global infrastructure overhaul.' },
      { turnDelay: 5, type: 'inequality_surge',    magnitude: 2, label: 'Tech Power Gap',        icon: '📊', description: 'Entities with quantum access gain structural advantages in finance and surveillance.' },
    ],
  },
  {
    id: 'universal_internet',
    name: 'Universal Internet Access',
    category: 'information',
    icon: '🌐',
    description: 'Global broadband connectivity reaching every person regardless of geography or income — eliminating the digital divide.',
    rolloutProfile: 'equity_focused',
    rolloutTurns: 3,
    tags: ['internet', 'universal', 'connectivity', 'access', 'information'],
    immediateEffects: { wellbeing: 7, equality: 6, innovation: 8, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 5,  note: 'Already connected; marginal improvement' },
      upper_middle:    { wellbeing: 6,  note: 'Enhanced services and options' },
      lower_middle:    { wellbeing: 8,  note: 'Significant economic and educational access' },
      working_class:   { wellbeing: 9,  note: 'Economic opportunity and organizing potential' },
      disenfranchised: { wellbeing: 12, note: 'Transformative access to services, markets, and voice' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'inequality_surge',    magnitude: -1, label: 'Information Democratization', icon: '📚', description: 'Wider access to knowledge and opportunity reduces structural information gaps. (Benefit)' },
      { turnDelay: 4, type: 'economic_disruption', magnitude: 1,  label: 'Platform Concentration',      icon: '💱', description: 'Digital platform monopolies intensify as global markets integrate.' },
    ],
  },
  {
    id: 'autonomous_transport',
    name: 'Autonomous Transport',
    category: 'transport',
    icon: '🚗',
    description: 'Fully self-driving vehicles operating across road, rail, and air — eliminating human-driven transport and transforming logistics.',
    rolloutProfile: 'market_driven',
    rolloutTurns: 4,
    tags: ['autonomous', 'transport', 'vehicle', 'driving', 'self-driving'],
    immediateEffects: { wellbeing: 4, equality: -2, innovation: 6, warmingImpact: -1 },
    strataEffects: {
      elite:           { wellbeing: 6,  note: 'Luxury fleet access, time reclaimed' },
      upper_middle:    { wellbeing: 5,  note: 'Commute efficiency, safety improvement' },
      lower_middle:    { wellbeing: 3,  note: 'Access to affordable autonomous transit' },
      working_class:   { wellbeing: -4, note: 'Professional driving employment eliminated' },
      disenfranchised: { wellbeing: 1,  note: 'Mobility improvement but job sector loss' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock',          magnitude: 3, label: 'Driver Displacement',          icon: '⚙️', description: 'Truck drivers, taxi workers, and delivery workers face mass unemployment.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 1, label: 'Traffic Optimization',          icon: '🌿', description: 'Optimized routing reduces fuel consumption and urban emissions.' },
      { turnDelay: 6, type: 'economic_disruption',       magnitude: 2, label: 'Insurance and Liability Shift', icon: '💱', description: 'Auto insurance, liability law, and urban planning face structural disruption.' },
    ],
  },
];

// ── Technology Discontinuation Catalog ────────────────────────────────────────
const TECH_DISCONTINUATION_CATALOG = [
  {
    id: 'end_combustion',
    name: 'End Combustion Engines',
    category: 'energy',
    icon: '🚫',
    description: 'Mandatory phase-out of all internal combustion engines in transport and machinery — banning fossil-fuel-powered vehicles and equipment.',
    rolloutProfile: 'universal',
    rolloutTurns: 5,
    tags: ['combustion', 'engine', 'fossil', 'transport', 'ban'],
    immediateEffects: { wellbeing: -3, equality: -2, innovation: 4, warmingImpact: -2 },
    strataEffects: {
      elite:           { wellbeing: 2,  note: 'EV adoption already underway; marginal cost' },
      upper_middle:    { wellbeing: 0,  note: 'Transition costs manageable' },
      lower_middle:    { wellbeing: -4, note: 'Vehicle replacement costs burdensome' },
      working_class:   { wellbeing: -8, note: 'Older vehicles; higher replacement burden' },
      disenfranchised: { wellbeing: -6, note: 'Transit dependency; rural access disruption' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock',          magnitude: 3, label: 'Auto Sector Disruption', icon: '⚙️', description: 'ICE manufacturing, service, and supply chain employment collapses.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 3, label: 'Emission Reduction',     icon: '🌿', description: 'Transport emissions fall significantly, improving urban air quality.' },
      { turnDelay: 6, type: 'economic_disruption',       magnitude: 2, label: 'Oil Demand Collapse',    icon: '💱', description: 'Petroleum markets restructure globally; oil-dependent economies face pressure.' },
    ],
  },
  {
    id: 'end_factory_farming',
    name: 'End Factory Farming',
    category: 'agriculture',
    icon: '🐄',
    description: 'Ban on industrial-scale confined animal feeding operations (CAFOs) and related factory farming practices across the civilization.',
    rolloutProfile: 'universal',
    rolloutTurns: 4,
    tags: ['factory', 'farming', 'animal', 'agriculture', 'ban', 'meat'],
    immediateEffects: { wellbeing: -2, equality: 2, innovation: 2, warmingImpact: -2 },
    strataEffects: {
      elite:           { wellbeing: 3,  note: 'Premium alternative proteins already accessible' },
      upper_middle:    { wellbeing: 1,  note: 'Modest food cost increase; health improvement' },
      lower_middle:    { wellbeing: -3, note: 'Cheap protein sources disrupted' },
      working_class:   { wellbeing: -6, note: 'Food costs rise; agricultural jobs disrupted' },
      disenfranchised: { wellbeing: -5, note: 'Food security stress from price increases' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'food_security_crisis',      magnitude: 2, label: 'Protein Supply Disruption',  icon: '🌾', description: 'Cheap animal protein supply chain disrupted before alternatives fully scale.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 3, label: 'Agricultural Emission Drop',  icon: '🌿', description: 'Methane and agricultural emissions decline significantly.' },
      { turnDelay: 5, type: 'employment_shock',          magnitude: 2, label: 'Ag Employment Disruption',    icon: '⚙️', description: 'Factory farm workers and related supply chain jobs displaced.' },
    ],
  },
  {
    id: 'end_fossil_fuels',
    name: 'End Fossil Fuel Energy',
    category: 'energy',
    icon: '🛢️',
    description: 'Complete mandated phase-out of coal, oil, and natural gas in all energy production and heating — the most aggressive climate action possible.',
    rolloutProfile: 'universal',
    rolloutTurns: 6,
    tags: ['fossil', 'fuel', 'coal', 'oil', 'gas', 'ban', 'energy'],
    immediateEffects: { wellbeing: -4, equality: -3, innovation: 5, warmingImpact: -4 },
    strataEffects: {
      elite:           { wellbeing: 0,  note: 'Asset diversification buffers impact' },
      upper_middle:    { wellbeing: -2, note: 'Energy cost volatility during transition' },
      lower_middle:    { wellbeing: -5, note: 'Energy bills and heating costs spike' },
      working_class:   { wellbeing: -9, note: 'Energy poverty risk; job loss in fossil sector' },
      disenfranchised: { wellbeing: -8, note: 'Energy access crisis; heating and cooking disruption' },
    },
    consequenceChain: [
      { turnDelay: 1, type: 'employment_shock',          magnitude: 4,  label: 'Fossil Fuel Job Collapse', icon: '⚙️', description: 'Mining, extraction, refining, and related industries face immediate disruption.' },
      { turnDelay: 3, type: 'economic_disruption',       magnitude: 3,  label: 'Energy Price Shock',       icon: '💱', description: 'Energy prices spike during transition period before renewables fully scale.' },
      { turnDelay: 5, type: 'environmental_improvement', magnitude: 5,  label: 'Emission Collapse',        icon: '🌿', description: 'Largest single source of global emissions eliminated.' },
      { turnDelay: 8, type: 'climate_acceleration',      magnitude: -3, label: 'Warming Slowdown',         icon: '🌡️', description: 'Warming index begins to plateau and slowly decline as emissions collapse.' },
    ],
  },
  {
    id: 'ban_pesticides',
    name: 'Ban Chemical Pesticides',
    category: 'agriculture',
    icon: '🌿',
    description: 'Prohibition of all synthetic chemical pesticides and herbicides in agriculture, forcing transition to organic and biological pest management.',
    rolloutProfile: 'universal',
    rolloutTurns: 4,
    tags: ['pesticide', 'chemical', 'ban', 'agriculture', 'herbicide'],
    immediateEffects: { wellbeing: 2, equality: 3, innovation: 3, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 4,  note: 'Health benefit; organic produce already consumed' },
      upper_middle:    { wellbeing: 3,  note: 'Health and environmental quality improvement' },
      lower_middle:    { wellbeing: 0,  note: 'Food cost increases offset health benefit' },
      working_class:   { wellbeing: -3, note: 'Farmworker transition burden; food costs rise' },
      disenfranchised: { wellbeing: -4, note: 'Food affordability worsens during transition' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'food_security_crisis',      magnitude: 2, label: 'Crop Yield Reduction', icon: '🌾', description: 'Transitional yield drops as chemical support is removed before alternatives scale.' },
      { turnDelay: 4, type: 'environmental_improvement', magnitude: 3, label: 'Ecosystem Recovery',  icon: '🌿', description: 'Soil health, waterways, and insect populations begin to recover.' },
    ],
  },
  {
    id: 'nuclear_disarmament',
    name: 'Nuclear Disarmament',
    category: 'military',
    icon: '☮️',
    description: 'Verified elimination of all nuclear weapons stockpiles and discontinuation of all nuclear weapons programs — unilateral or multilateral.',
    rolloutProfile: 'universal',
    rolloutTurns: 8,
    tags: ['nuclear', 'disarmament', 'weapons', 'military', 'ban'],
    immediateEffects: { wellbeing: 8, equality: 5, innovation: -2, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 6,  note: 'Security improved; defense contracts lost' },
      upper_middle:    { wellbeing: 8,  note: 'Reduced existential threat; budget reallocation' },
      lower_middle:    { wellbeing: 9,  note: 'Social trust and security gains' },
      working_class:   { wellbeing: 8,  note: 'Major existential risk reduction' },
      disenfranchised: { wellbeing: 10, note: 'Greatest relative gain from reduced war risk' },
    },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock',    magnitude: 2, label: 'Defense Industry Contraction', icon: '⚙️', description: 'Nuclear weapons manufacturing, research, and delivery system jobs eliminated.' },
      { turnDelay: 4, type: 'economic_disruption', magnitude: 1, label: 'Defense Budget Reallocation', icon: '💱', description: 'Military budget reorientation creates transitional economic shifts.' },
    ],
  },
];

// ── Technology Keyword Map (for custom tech analysis) ─────────────────────────
const TECH_KEYWORD_MAP = {
  // Health / Medical
  aging:        { effects: { wellbeing: 8,  equality: -3, innovation: 3 },            category: 'biotech',      label: 'Longevity Technology' },
  longevity:    { effects: { wellbeing: 8,  equality: -4, innovation: 4 },            category: 'biotech',      label: 'Longevity Technology' },
  lifespan:     { effects: { wellbeing: 6,  equality: -2, innovation: 2 },            category: 'biotech',      label: 'Life Extension' },
  cancer:       { effects: { wellbeing: 10, equality: 2,  innovation: 3 },            category: 'biotech',      label: 'Cancer Treatment' },
  vaccine:      { effects: { wellbeing: 8,  equality: 3,  innovation: 2 },            category: 'biotech',      label: 'Vaccine Technology' },
  cure:         { effects: { wellbeing: 9,  equality: 2,  innovation: 3 },            category: 'biotech',      label: 'Disease Cure' },
  disease:      { effects: { wellbeing: 7,  equality: 2,  innovation: 2 },            category: 'biotech',      label: 'Disease Treatment' },
  medical:      { effects: { wellbeing: 6,  equality: 1,  innovation: 2 },            category: 'biotech',      label: 'Medical Technology' },
  health:       { effects: { wellbeing: 6,  equality: 2,  innovation: 2 },            category: 'biotech',      label: 'Health Technology' },
  genetic:      { effects: { wellbeing: 7,  equality: -1, innovation: 5 },            category: 'biotech',      label: 'Genetic Technology' },
  crispr:       { effects: { wellbeing: 8,  equality: 2,  innovation: 6 },            category: 'biotech',      label: 'Gene Editing' },
  gene:         { effects: { wellbeing: 6,  equality: -1, innovation: 5 },            category: 'biotech',      label: 'Genetic Engineering' },
  // Energy
  clean:        { effects: { wellbeing: 4,  equality: 1,  innovation: 4, warmingImpact: -2 }, category: 'energy',  label: 'Clean Technology' },
  renewable:    { effects: { wellbeing: 4,  equality: 2,  innovation: 3, warmingImpact: -3 }, category: 'energy',  label: 'Renewable Energy' },
  solar:        { effects: { wellbeing: 3,  equality: 2,  innovation: 3, warmingImpact: -2 }, category: 'energy',  label: 'Solar Energy' },
  fusion:       { effects: { wellbeing: 6,  equality: 2,  innovation: 8, warmingImpact: -4 }, category: 'energy',  label: 'Fusion Energy' },
  nuclear:      { effects: { wellbeing: 3,  equality: 0,  innovation: 5, warmingImpact: -1 }, category: 'energy',  label: 'Nuclear Power' },
  wind:         { effects: { wellbeing: 3,  equality: 2,  innovation: 2, warmingImpact: -2 }, category: 'energy',  label: 'Wind Energy' },
  energy:       { effects: { wellbeing: 3,  equality: 0,  innovation: 3, warmingImpact: -1 }, category: 'energy',  label: 'Energy Technology' },
  // Computing / AI
  quantum:      { effects: { wellbeing: 2,  equality: -4, innovation: 12 },           category: 'computing',    label: 'Quantum Computing' },
  ai:           { effects: { wellbeing: 3,  equality: -5, innovation: 10 },           category: 'computing',    label: 'Artificial Intelligence' },
  automation:   { effects: { wellbeing: 2,  equality: -6, innovation: 7 },            category: 'computing',    label: 'Automation' },
  robot:        { effects: { wellbeing: 2,  equality: -5, innovation: 6 },            category: 'computing',    label: 'Robotics' },
  brain:        { effects: { wellbeing: 4,  equality: -6, innovation: 10 },           category: 'computing',    label: 'Brain-Computer Interface' },
  neural:       { effects: { wellbeing: 3,  equality: -5, innovation: 9 },            category: 'computing',    label: 'Neural Technology' },
  interface:    { effects: { wellbeing: 3,  equality: -4, innovation: 8 },            category: 'computing',    label: 'Human-Computer Interface' },
  computing:    { effects: { wellbeing: 2,  equality: -2, innovation: 8 },            category: 'computing',    label: 'Computing Advance' },
  // Transport
  autonomous:   { effects: { wellbeing: 3,  equality: -3, innovation: 5 },            category: 'transport',    label: 'Autonomous Technology' },
  transport:    { effects: { wellbeing: 3,  equality: 0,  innovation: 3 },            category: 'transport',    label: 'Transport Technology' },
  vehicle:      { effects: { wellbeing: 2,  equality: -1, innovation: 3 },            category: 'transport',    label: 'Vehicle Technology' },
  // Agriculture / Food
  farming:      { effects: { wellbeing: 4,  equality: 2,  innovation: 2 },            category: 'agriculture',  label: 'Farming Technology' },
  vertical:     { effects: { wellbeing: 4,  equality: 2,  innovation: 3 },            category: 'agriculture',  label: 'Vertical Farming' },
  food:         { effects: { wellbeing: 5,  equality: 2,  innovation: 1 },            category: 'agriculture',  label: 'Food Technology' },
  agriculture:  { effects: { wellbeing: 4,  equality: 2,  innovation: 2 },            category: 'agriculture',  label: 'Agricultural Technology' },
  crop:         { effects: { wellbeing: 3,  equality: 2,  innovation: 1 },            category: 'agriculture',  label: 'Crop Technology' },
  // Environment / Resources
  water:        { effects: { wellbeing: 6,  equality: 4,  innovation: 1, warmingImpact: 0  }, category: 'environment', label: 'Water Technology' },
  landfill:     { effects: { wellbeing: 3,  equality: 3,  innovation: 2, warmingImpact: -1 }, category: 'environment', label: 'Waste Recovery' },
  recycling:    { effects: { wellbeing: 3,  equality: 3,  innovation: 2, warmingImpact: -1 }, category: 'environment', label: 'Recycling Technology' },
  waste:        { effects: { wellbeing: 3,  equality: 2,  innovation: 2, warmingImpact: -1 }, category: 'environment', label: 'Waste Management' },
  pollution:    { effects: { wellbeing: 5,  equality: 3,  innovation: 2, warmingImpact: -2 }, category: 'environment', label: 'Pollution Reduction' },
  // Information / Communication
  internet:     { effects: { wellbeing: 6,  equality: 5,  innovation: 7 },            category: 'information',  label: 'Internet Access' },
  connectivity: { effects: { wellbeing: 5,  equality: 5,  innovation: 6 },            category: 'information',  label: 'Connectivity Technology' },
  communication:{ effects: { wellbeing: 4,  equality: 3,  innovation: 5 },            category: 'information',  label: 'Communication Technology' },
};

// ── Technology Out-of-Scope Keywords ──────────────────────────────────────────
// Violates current understanding of physical law
const TECH_IMPOSSIBLE_KEYWORDS = [
  'ftl', 'faster than light', 'warp drive', 'warp speed', 'wormhole',
  'time travel', 'time machine', 'time reversal',
  'perpetual motion', 'infinite energy', 'free energy machine',
  'antimatter bomb', 'matter replication', 'replicator',
  'resurrection', 'soul transfer', 'immortality machine',
];

// Effects too transformative or unknowable for this simulation to model
const TECH_UNMODELABLE_KEYWORDS = [
  'teleportation', 'teleport',
  'singularity', 'technological singularity',
  'consciousness upload', 'mind upload', 'digital consciousness',
  'weather control', 'weather machine', 'gravity manipulation', 'antigravity',
  'dimension travel', 'dimensional', 'parallel universe',
  'telepathy', 'telekinesis', 'psychic', 'mind reading', 'precognition',
  'magic', 'magical', 'supernatural', 'miracle',
];

// ── AI & Robotics Automation Levels ────────────────────────────────────────────
// Six discrete levels (0–5) describing the penetration of AI and robotics into
// a civilization's economy and daily life. Each level has immediate effects on
// introduction, ongoing per-turn effects while maintained, a skills/capabilities
// transformation table, per-stratum wellbeing impacts, and a consequence chain.
const AUTOMATION_LEVELS = [
  {
    level: 0,
    id: 'pre_automation',
    label: 'Pre-Automation',
    icon: '⚙️',
    description: 'Traditional tools and manual labor predominate. Mechanical assistance exists but computation and robotics are minimal. Skills have stable, predictable value and most occupations are unchanged across generations.',
    immediateEffects: { wellbeing: 0, equality: 0, innovation: 0, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 0,  note: 'Traditional power structures intact' },
      upper_middle:    { wellbeing: 0,  note: 'Professional skills fully valued' },
      lower_middle:    { wellbeing: 0,  note: 'Skilled labor in reliable demand' },
      working_class:   { wellbeing: 0,  note: 'Manual labor essential and employed' },
      disenfranchised: { wellbeing: 0,  note: 'Low-skill work available as entry path' },
    },
    obsoleteSkills: [],
    newCapabilities: [],
    perTurnEffects: { wellbeing: 0, equality: 0, innovation: 0 },
    consequenceChain: [],
  },
  {
    level: 1,
    id: 'nascent',
    label: 'Nascent Automation',
    icon: '🔧',
    description: 'Digital tools and basic automation emerge as curiosities and productivity aids. Computers handle data entry and routine calculations; early robots take over the most dangerous industrial tasks. Most occupations are unaffected, and the dominant feeling is optimism about new tools rather than anxiety about displacement.',
    immediateEffects: { wellbeing: 2, equality: 0, innovation: 4, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 4,  note: 'Early adoption grants competitive advantage' },
      upper_middle:    { wellbeing: 4,  note: 'Tools amplify professional productivity' },
      lower_middle:    { wellbeing: 2,  note: 'Modest efficiency gains in most roles' },
      working_class:   { wellbeing: 2,  note: 'Automation handles most dangerous tasks' },
      disenfranchised: { wellbeing: 0,  note: 'Limited access to new digital tools' },
    },
    obsoleteSkills: ['Routine data entry', 'Basic arithmetic calculation', 'Hazardous manual industrial work'],
    newCapabilities: ['Digital communication', 'Computer-aided design', 'Improved industrial safety', 'Electronic record-keeping'],
    perTurnEffects: { wellbeing: 0.05, equality: 0, innovation: 0.08 },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock', magnitude: 1, label: 'Clerical Displacement', icon: '📋', description: 'Data entry and basic clerical roles begin to shrink as computers take over routine information tasks.' },
    ],
  },
  {
    level: 2,
    id: 'productive',
    label: 'Productive Enhancement',
    icon: '🤝',
    description: 'AI serves as co-pilot for knowledge workers, multiplying individual productivity. A developer can accomplish in hours what once took weeks; a musician can produce studio-quality recordings independently; a researcher can synthesize years of literature in hours. Most roles still exist — they are amplified by tools, not replaced. The democratization of high-quality production is the defining characteristic of this level.',
    immediateEffects: { wellbeing: 4, equality: -1, innovation: 8, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 8,  note: 'Capital returns on automation infrastructure' },
      upper_middle:    { wellbeing: 8,  note: 'Massive productivity multiplier for skilled workers' },
      lower_middle:    { wellbeing: 5,  note: 'Creative and technical tools become broadly accessible' },
      working_class:   { wellbeing: 1,  note: 'Some role expansion, scattered early displacement' },
      disenfranchised: { wellbeing: -1, note: 'Fewer entry-level clerical positions available' },
    },
    obsoleteSkills: ['Basic coding without AI assistance', 'Routine legal research', 'Standard bookkeeping', 'Simple graphic layout work'],
    newCapabilities: ['AI-assisted development', 'Solo studio music production', 'Independent publishing and filmmaking', 'AI-enhanced research synthesis', 'Personalized learning systems'],
    perTurnEffects: { wellbeing: 0.08, equality: -0.05, innovation: 0.12 },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock', magnitude: 2, label: 'Professional Role Compression', icon: '💼', description: 'Firms need fewer junior professionals as AI handles entry-level knowledge work, compressing career pipelines.' },
      { turnDelay: 4, type: 'inequality_surge', magnitude: 1, label: 'Productivity Gap Widens', icon: '📊', description: 'Workers with AI access vastly outperform those without, widening skills gaps across and between strata.' },
    ],
  },
  {
    level: 3,
    id: 'partial',
    label: 'Partial Automation',
    icon: '🤖',
    description: 'AI replaces specific occupational categories while expanding others in complex, asymmetric ways. Junior software roles are broadly obsolete, yet one person with AI can build what once required a team. AI-generated music, art, and writing threaten entire creative industries while simultaneously democratizing high-quality production for individuals. Net effects depend heavily on stratum, adaptability, and access to the new tools.',
    immediateEffects: { wellbeing: 3, equality: -4, innovation: 10, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 12,  note: 'Automation capital generates outsized returns' },
      upper_middle:    { wellbeing: 6,   note: 'Productivity soars; career paths narrow' },
      lower_middle:    { wellbeing: 2,   note: 'Individual capability expands, but job market value compresses' },
      working_class:   { wellbeing: -3,  note: 'Service and routine roles significantly displaced' },
      disenfranchised: { wellbeing: -5,  note: 'Structural exclusion from labor market accelerates' },
    },
    obsoleteSkills: ['Junior software development', 'Medical transcription and coding', 'Paralegal document review', 'Many assembly and logistics roles', 'Basic customer service'],
    newCapabilities: ['Solo full-stack development', 'AI-assisted medical diagnosis', 'Personal legal research tools', 'Independent film production', 'AI co-writing and creative assistance'],
    perTurnEffects: { wellbeing: 0.02, equality: -0.12, innovation: 0.18 },
    consequenceChain: [
      { turnDelay: 2, type: 'employment_shock', magnitude: 3, label: 'Occupation Replacement Wave', icon: '🌊', description: 'Entire job categories across knowledge and manual sectors are eliminated or radically downsized.' },
      { turnDelay: 4, type: 'inequality_surge', magnitude: 2, label: 'Capital-Labor Divergence', icon: '💰', description: 'Returns from automation concentrate with capital owners; displaced workers face structural, not cyclical, unemployment.' },
      { turnDelay: 6, type: 'economic_disruption', magnitude: 2, label: 'Labor Market Restructuring', icon: '🔄', description: 'New industries emerge but require skills that most displaced workers cannot quickly acquire.' },
    ],
  },
  {
    level: 4,
    id: 'broad',
    label: 'Broad Automation',
    icon: '🏭',
    description: 'Wide-scale displacement across most sectors. Knowledge work, creative production, and physical labor are all substantially automated. A single individual with AI can match the output of entire former departments. New human-AI collaborative capabilities emerge, but traditional pathways to economic participation are severely narrowed for all but the highest strata.',
    immediateEffects: { wellbeing: 2, equality: -8, innovation: 12, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 18,  note: 'Automation ownership compounds wealth exponentially' },
      upper_middle:    { wellbeing: 5,   note: 'Strategic judgment still valued; competition for roles intensifies' },
      lower_middle:    { wellbeing: -3,  note: 'Most previously skilled trades automated or severely devalued' },
      working_class:   { wellbeing: -8,  note: 'Structural unemployment for large portions of workforce' },
      disenfranchised: { wellbeing: -12, note: 'Near-total exclusion from formal economy without policy intervention' },
    },
    obsoleteSkills: ['Most routine professional roles', 'Physical transportation and logistics', 'Administrative and clerical work', 'Basic creative production for commercial use', 'Entry-level analysis and consulting'],
    newCapabilities: ['Human-AI creative co-production at scale', 'Personalized precision medicine', 'Precision agriculture', 'Automated infrastructure management', 'Universal real-time translation'],
    perTurnEffects: { wellbeing: -0.08, equality: -0.2, innovation: 0.22 },
    consequenceChain: [
      { turnDelay: 1, type: 'employment_shock', magnitude: 4, label: 'Mass Displacement', icon: '📉', description: 'Rapid automation shocks labor markets across sectors simultaneously; adaptation pathways are too slow.' },
      { turnDelay: 3, type: 'inequality_surge', magnitude: 4, label: 'Wealth Concentration Spiral', icon: '💎', description: 'Automation returns concentrate in an ever-narrower capital-owning class; labor share of income collapses.' },
      { turnDelay: 5, type: 'economic_disruption', magnitude: 3, label: 'Economic Model Crisis', icon: '⚠️', description: 'Traditional employment-based economic participation collapses for most of the population.' },
      { turnDelay: 8, type: 'resource_strain', magnitude: 2, label: 'Social Infrastructure Strain', icon: '🏥', description: 'Reduced tax base from mass unemployment strains public services, healthcare, and social support.' },
    ],
  },
  {
    level: 5,
    id: 'pervasive',
    label: 'Pervasive Automation',
    icon: '🌐',
    description: 'Near-total automation of routine and complex tasks alike. Traditional employment as the basis of economic participation is structurally obsolete. This level represents both a potential post-scarcity breakthrough and a civilizational crisis. Whether the civilization thrives or collapses depends entirely on whether governance can redistribute automation\'s extraordinary gains broadly — or fails, producing extreme polarization.',
    immediateEffects: { wellbeing: 5, equality: -12, innovation: 15, warmingImpact: 0 },
    strataEffects: {
      elite:           { wellbeing: 25,  note: 'Automation capital generates extraordinary wealth with minimal labor' },
      upper_middle:    { wellbeing: 4,   note: 'Specialized judgment prized; fierce competition for few positions' },
      lower_middle:    { wellbeing: -8,  note: 'Traditional skilled roles nearly all automated or devalued' },
      working_class:   { wellbeing: -15, note: 'Structural mass unemployment; social contract under severe stress' },
      disenfranchised: { wellbeing: -18, note: 'Complete exclusion from formal economy without major redistribution' },
    },
    obsoleteSkills: ['Most knowledge work at professional level', 'Physical labor across industries', 'Creative production at commercial scale', 'Professional services excluding peak judgment roles', 'Transportation and logistics at all levels'],
    newCapabilities: ['Post-scarcity production potential', 'Accelerated scientific discovery', 'Fully personalized education and medicine', 'Autonomous infrastructure management', 'Human creative expression freed from economic necessity'],
    perTurnEffects: { wellbeing: -0.15, equality: -0.35, innovation: 0.28 },
    consequenceChain: [
      { turnDelay: 1,  type: 'employment_shock',    magnitude: 5, label: 'Economic Paradigm Collapse',     icon: '💥', description: 'Traditional employment-based economy structurally collapses; alternative models urgently required.' },
      { turnDelay: 2,  type: 'inequality_surge',    magnitude: 5, label: 'Extreme Wealth Polarization',    icon: '🔺', description: 'Without redistribution, automation wealth concentrates in an ever-narrower elite; most see real income collapse.' },
      { turnDelay: 4,  type: 'economic_disruption', magnitude: 4, label: 'Social Contract Rupture',        icon: '⛓️', description: 'The link between productive work and economic survival breaks, requiring fundamental reinvention of governance.' },
      { turnDelay: 7,  type: 'population_surge',    magnitude: -1, label: 'Demographic Contraction',       icon: '👥', description: 'Economic insecurity and loss of social purpose suppress birth rates across most strata.' },
      { turnDelay: 10, type: 'resource_strain',     magnitude: 3, label: 'Redistribution Governance Test', icon: '🏛️', description: 'Governance systems face a defining test: distribute automation gains broadly or face civilizational instability.' },
    ],
  },
];

// ── Education Accessibility Tiers ───────────────────────────────────────────────
const EDUCATION_ACCESS_TIERS = [
  {
    id: 'universal',
    label: 'Universal — Free at All Levels',
    icon: '🏫',
    description: 'Education is free and accessible at every level for every stratum. Primary, secondary, and higher education are public goods.',
    strataMultipliers: { elite: 1.0, upper_middle: 1.0, lower_middle: 1.0, working_class: 0.9, disenfranchised: 0.8 },
    equalityBonus: 8, innovationBonus: 6, mobilityBonus: 10,
  },
  {
    id: 'universal_lower',
    label: 'Free Through Secondary, Affordable Above',
    icon: '🏛️',
    description: 'Primary and secondary education are universal. Higher education is subsidized but requires means. Most middle-stratum citizens can access it with effort.',
    strataMultipliers: { elite: 1.0, upper_middle: 0.95, lower_middle: 0.7, working_class: 0.3, disenfranchised: 0.1 },
    equalityBonus: 3, innovationBonus: 3, mobilityBonus: 5,
  },
  {
    id: 'free_basic_expensive_higher',
    label: 'Free Through Secondary, Prohibitively Expensive Above',
    icon: '🚧',
    description: 'Basic education is available to all but higher education is out of reach for most. A sharp credential gap stratifies life outcomes by birth stratum rather than ability.',
    strataMultipliers: { elite: 1.0, upper_middle: 0.85, lower_middle: 0.35, working_class: 0.05, disenfranchised: 0.0 },
    equalityBonus: -3, innovationBonus: 0, mobilityBonus: -5,
  },
  {
    id: 'limited',
    label: 'Out of Reach for Most',
    icon: '⛔',
    description: 'Education is a privilege of elite and upper strata. Most of the population has minimal access to formal schooling. Human capital development is severely suppressed.',
    strataMultipliers: { elite: 1.0, upper_middle: 0.5, lower_middle: 0.1, working_class: 0.02, disenfranchised: 0.0 },
    equalityBonus: -8, innovationBonus: -6, mobilityBonus: -12,
  },
];

// ── Debt Model Types ────────────────────────────────────────────────────────────
const DEBT_MODEL_TYPES = [
  {
    id: 'debtless',
    label: 'Debtless Society',
    icon: '🤲',
    description: 'No formal debt system. Exchange is gift-based, barter, or commons allocation. Surplus is shared rather than lent. Growth is slower but financial crises are structurally impossible.',
    strataWellbeingEffects: { elite: 0, upper_middle: 1, lower_middle: 3, working_class: 4, disenfranchised: 5 },
    equalityEffect: 8, growthModifier: -0.1, crisisRisk: 0,
    forgivenessMechanisms: [],
    predatoryFeatures: [],
  },
  {
    id: 'community_debt',
    label: 'Community Debt with Forgiveness',
    icon: '🤝',
    description: 'Debt exists as a social contract, not a punitive instrument. Forgiveness is built in: jubilee cycles, service-based discharge (military, civic, educational contribution), and community adjudication of hardship.',
    strataWellbeingEffects: { elite: -1, upper_middle: 2, lower_middle: 4, working_class: 5, disenfranchised: 4 },
    equalityEffect: 5, growthModifier: 0.05, crisisRisk: 0.05,
    forgivenessMechanisms: [
      { id: 'jubilee',      label: 'Jubilee Forgiveness',       description: 'Periodic mass debt cancellation (e.g., every 7 or 50 years). Resets economic stratification.' },
      { id: 'service',      label: 'Service-Based Discharge',   description: 'Military service, civic labor, or national service earns debt cancellation at set rates.' },
      { id: 'contribution', label: 'Civic Contribution Offset', description: 'Recognized contributions to society — teaching, caregiving, community building — reduce debt obligations.' },
      { id: 'hardship',     label: 'Hardship Adjudication',     description: 'Community panel reviews hardship cases and can discharge debt on humanitarian grounds.' },
    ],
    predatoryFeatures: [],
  },
  {
    id: 'regulated_credit',
    label: 'Regulated Credit with Protections',
    icon: '⚖️',
    description: 'Debt with legal ceilings on interest rates, bankruptcy protections, and regulatory oversight. Creditors have rights, but so do debtors. The system enables growth while limiting the worst exploitation.',
    strataWellbeingEffects: { elite: 3, upper_middle: 4, lower_middle: 2, working_class: -1, disenfranchised: -2 },
    equalityEffect: 0, growthModifier: 0.1, crisisRisk: 0.1,
    forgivenessMechanisms: [
      { id: 'bankruptcy', label: 'Bankruptcy Protection', description: 'Structured debt discharge process prevents permanent debt bondage.' },
    ],
    predatoryFeatures: [],
  },
  {
    id: 'market_debt',
    label: 'Market-Rate Credit',
    icon: '💰',
    description: 'Interest rates set by market competition. Credit access is stratified: upper strata borrow cheaply, lower strata pay higher risk premiums. Debt reporting affects access to housing, employment, and financial assistance.',
    strataWellbeingEffects: { elite: 6, upper_middle: 4, lower_middle: -2, working_class: -5, disenfranchised: -8 },
    equalityEffect: -5, growthModifier: 0.15, crisisRisk: 0.2,
    forgivenessMechanisms: [],
    predatoryFeatures: [
      { id: 'debt_reporting', label: 'Debt Reporting Affects Life Access', description: 'Credit history determines access to employment, housing, and financial assistance — creating compounding disadvantage for lower strata.' },
    ],
  },
  {
    id: 'predatory_debt',
    label: 'Predatory Debt System',
    icon: '⛓️',
    description: "Punitive interest rates, wage garnishment, aggressive debt reporting, and — in the most extreme cases — debtors' prisons or indentured servitude. Debt functions as a mechanism of permanent stratification and social control.",
    strataWellbeingEffects: { elite: 10, upper_middle: 3, lower_middle: -5, working_class: -12, disenfranchised: -18 },
    equalityEffect: -12, growthModifier: 0.08, crisisRisk: 0.35,
    forgivenessMechanisms: [],
    predatoryFeatures: [
      { id: 'punitive_interest', label: 'Crippling Interest Rates',          description: 'Interest compounds faster than income can grow. Debts become permanent for most lower-stratum borrowers.' },
      { id: 'wage_garnishment',  label: 'Wage Garnishment',                  description: 'A share of wages is legally seized to service debt, reducing take-home pay indefinitely.' },
      { id: 'debt_reporting',    label: 'Debt Reporting Blocks Life Access', description: 'Debt history prevents access to employment, housing, and public assistance.' },
      { id: 'debtors_prison',    label: "Debtors' Prisons / Indentured Servitude", description: 'Those who cannot pay face incarceration or forced labor until debt is discharged — effectively permanent for the lowest strata.' },
    ],
  },
];

// ── Demographic Profiles ────────────────────────────────────────────────────────
const DEMOGRAPHIC_PROFILES = [
  {
    id: 'young',
    label: 'Young Population',
    icon: '🌱',
    description: 'Large youth cohort, high birth rates. Growth energy and labor supply are strong, but if resources and livelihoods are insufficient, instability risk rises sharply.',
    perTurnEffects: { wellbeing: 0.05, equalityIndex: 0, innovation: 0.05, stabilityRisk: 0.02 },
    note: 'High growth potential; instability risk if working-class unemployment is high.',
  },
  {
    id: 'balanced',
    label: 'Balanced Demographics',
    icon: '⚖️',
    description: 'Optimal dependency ratio. Working-age population supports dependents without excessive fiscal strain. The most productive demographic structure.',
    perTurnEffects: { wellbeing: 0.02, equalityIndex: 0.01, innovation: 0.02, stabilityRisk: 0 },
    note: 'Optimal structure. No demographic penalty.',
  },
  {
    id: 'aging',
    label: 'Aging Population',
    icon: '🌅',
    description: 'Shrinking working-age cohort supports a growing elderly population. Fiscal pressure rises, innovation rate dips, and labor shortages emerge. Longevity technologies accelerate this transition.',
    perTurnEffects: { wellbeing: -0.03, equalityIndex: -0.02, innovation: -0.04, stabilityRisk: 0.01 },
    note: 'Fiscal strain, labor shortage. Automation at Level 3+ can compensate.',
  },
  {
    id: 'demographic_stress',
    label: 'Demographic Stress',
    icon: '⚠️',
    description: 'Either a severe youth bulge straining available resources and social stability, or an acute aging crisis with unsustainable dependency burden. Both represent demographic emergencies.',
    perTurnEffects: { wellbeing: -0.1, equalityIndex: -0.05, innovation: -0.05, stabilityRisk: 0.05 },
    note: 'Crisis state. Urgent policy response required.',
  },
];

// ── Demographic Transition Stages ─────────────────────────────────────────────

const DEMOGRAPHIC_TRANSITION_STAGES = [
  {
    id: 'pre_transition', stage: 1, label: 'Pre-Transition', icon: '🌾',
    description: 'High birth and death rates. Population growth near zero. Infectious disease dominant. Life expectancy ~30-35 years.',
    baseFertility: 45, baseMortality: 40, baseLifeExpectancy: 32, baseInfantMortality: 75,
    diseaseProfile: 'infectious_dominant', diseaseProfileLabel: 'Infectious Disease Dominant',
  },
  {
    id: 'early_transition', stage: 2, label: 'Early Transition', icon: '📈',
    description: 'Death rates falling (sanitation, food security). Birth rates still high. Rapid population growth. Receding pandemics.',
    baseFertility: 42, baseMortality: 25, baseLifeExpectancy: 50, baseInfantMortality: 50,
    diseaseProfile: 'receding_pandemics', diseaseProfileLabel: 'Receding Pandemics',
  },
  {
    id: 'late_transition', stage: 3, label: 'Late Transition', icon: '📉',
    description: 'Birth rates falling (child survival, education, urbanization). Population growth slowing. Degenerative diseases emerging.',
    baseFertility: 25, baseMortality: 12, baseLifeExpectancy: 65, baseInfantMortality: 25,
    diseaseProfile: 'degenerative_emerging', diseaseProfileLabel: 'Degenerative Diseases Emerging',
  },
  {
    id: 'post_transition', stage: 4, label: 'Post-Transition', icon: '⚖️',
    description: 'Low birth and death rates. Population stable or slowly growing. Chronic diseases dominant. Aging begins.',
    baseFertility: 13, baseMortality: 10, baseLifeExpectancy: 76, baseInfantMortality: 8,
    diseaseProfile: 'chronic_dominant', diseaseProfileLabel: 'Chronic Diseases Dominant',
  },
  {
    id: 'second_transition', stage: 5, label: 'Second Transition', icon: '👴',
    description: 'Below-replacement fertility. Population declining without immigration. Aging-related diseases dominant. Fiscal strain from dependency.',
    baseFertility: 8, baseMortality: 11, baseLifeExpectancy: 83, baseInfantMortality: 3,
    diseaseProfile: 'aging_dominant', diseaseProfileLabel: 'Aging-Related Diseases Dominant',
  },
];

// ── Family, Identity & Reproductive Health Systems ────────────────────────────

const FAMILY_STRUCTURES = [
  {
    id: 'nuclear', label: 'Nuclear Family', icon: '👨‍👩‍👧',
    description: 'Parent(s) and children as primary unit. Independence from extended kin is culturally valued. Higher individual mobility; weaker intergenerational safety net.',
    perTurnEffects: { wellbeing: 0, socialCohesion: -0.01 },
    elderlyCareFactor: 0.3,
    childDevelopmentBonus: 0.0,
    mobilityBonus: 0.02,
  },
  {
    id: 'extended', label: 'Extended Family', icon: '👨‍👩‍👧‍👦',
    description: 'Grandparents, parents, siblings, and their children share resources and obligations. Strong intergenerational safety net; lower geographic mobility.',
    perTurnEffects: { wellbeing: 0.02, socialCohesion: 0.02 },
    elderlyCareFactor: 0.8,
    childDevelopmentBonus: 0.03,
    mobilityBonus: -0.01,
  },
  {
    id: 'community_clan', label: 'Community / Clan', icon: '🏘️',
    description: 'Primary loyalty and resource-sharing at community or clan level. Very high social capital; individual autonomy reduced in favor of collective well-being.',
    perTurnEffects: { wellbeing: 0.03, socialCohesion: 0.04 },
    elderlyCareFactor: 0.9,
    childDevelopmentBonus: 0.04,
    mobilityBonus: -0.02,
  },
];

const SEXUAL_ORIENTATION_POLICIES = [
  {
    id: 'full_support', label: 'Full Legal & Cultural Support', icon: '🏳️‍🌈',
    description: 'LGBTQ+ rights legally protected and culturally celebrated. Same-sex marriage, adoption, and full legal equality across all domains. Non-traditional gender identities recognized and accommodated in all institutions.',
    wellbeingEffect: 8, epistemicHealthBonus: 4, socialCohesionEffect: 2, innovationBonus: 3,
  },
  {
    id: 'tolerant', label: 'Legal Protection, Cultural Acceptance', icon: '🤝',
    description: 'Legal protections exist. Same-sex relationships are recognized. Acceptance is widespread but not universal — some friction remains at cultural and religious margins.',
    wellbeingEffect: 2, epistemicHealthBonus: 1, socialCohesionEffect: 0, innovationBonus: 1,
  },
  {
    id: 'grudging', label: 'Legal but Socially Stigmatized', icon: '⚠️',
    description: 'Not criminalized but actively discouraged. Discrimination is tolerated; no formal relationship recognition. Significant stigma suppresses wellbeing and life outcomes for a meaningful share of the population.',
    wellbeingEffect: -5, epistemicHealthBonus: -2, socialCohesionEffect: -1, innovationBonus: -1,
  },
  {
    id: 'suppressive', label: 'Criminalized or Persecuted', icon: '⛓️',
    description: 'Illegal or actively persecuted. Affected individuals face imprisonment, forced conversion, or violent social sanction. A significant share of the population lives in fear.',
    wellbeingEffect: -15, epistemicHealthBonus: -8, socialCohesionEffect: -4, innovationBonus: -4,
  },
];

const CHILDCARE_NORMS = [
  {
    id: 'mother_primary', label: 'Mother as Primary Caregiver', icon: '👩‍🍼',
    description: 'Cultural and legal default places primary childcare responsibility on mothers regardless of employment status. Suppresses female labor participation and innovation contribution.',
    geiDriftEffect: -0.02, laborParticipationBonus: -0.03, childDevelopmentBonus: 0.0,
  },
  {
    id: 'father_primary', label: 'Father as Primary Caregiver', icon: '👨‍🍼',
    description: 'Cultural norm assigns primary childcare to fathers. Rare historically; tends to emerge in high-GEI societies with deliberate policy. Frees mothers for full labor participation.',
    geiDriftEffect: 0.03, laborParticipationBonus: 0.01, childDevelopmentBonus: 0.01,
  },
  {
    id: 'shared', label: 'Shared Co-Parenting', icon: '👫',
    description: 'Equal co-parenting is culturally expected and legally supported (parental leave for all genders, flexible work norms). Both parents participate fully in both childcare and the labor force.',
    geiDriftEffect: 0.04, laborParticipationBonus: 0.03, childDevelopmentBonus: 0.02,
  },
  {
    id: 'extended_family', label: 'Extended Family as Caregiver', icon: '👴👵',
    description: 'Grandparents, aunts, uncles, and other kin take active childcare roles, freeing parents of both genders for work while maintaining strong intergenerational bonds and knowledge transfer.',
    geiDriftEffect: 0.01, laborParticipationBonus: 0.02, childDevelopmentBonus: 0.03,
  },
  {
    id: 'institutional', label: 'State, Community, or Religious Organization', icon: '🏫',
    description: 'Formal childcare institutions — state-funded daycare, community creches, or religious organizations — bear primary responsibility. Enables full labor participation; quality varies by institution type and funding.',
    geiDriftEffect: 0.02, laborParticipationBonus: 0.04, childDevelopmentBonus: 0.01,
  },
];

const REPRODUCTIVE_HEALTH_TIERS = [
  {
    id: 'scandinavian', label: 'Universal, Free, Fact-Based', icon: '🩺',
    description: 'Comprehensive fact-based sex education is universal and mandatory. All reproductive health services — contraception, abortion, prenatal and postnatal care — are free and universally accessible. No cultural taboos suppress open discussion of sexuality or reproductive health.',
    birthRateModifier: -0.3,
    strataWellbeingBonus: { lower_middle: 5, working_class: 8, disenfranchised: 10 },
    geiDriftBonus: 0.03, epistemicHealthBonus: 4,
  },
  {
    id: 'available', label: 'Available but Uneven', icon: '🏥',
    description: 'Sex education and reproductive health services (including contraception and abortion) exist and are available to most of the population. Religion and cultural norms exert some influence on behavior. Minors typically require parental consent.',
    birthRateModifier: -0.1,
    strataWellbeingBonus: { lower_middle: 2, working_class: 3, disenfranchised: 4 },
    geiDriftBonus: 0.01, epistemicHealthBonus: 1,
  },
  {
    id: 'restricted', label: 'Heavily Restricted', icon: '🚧',
    description: 'Reproductive health options nominally exist but are constrained by laws, bureaucracy, financial barriers, and pervasive religious or cultural taboos. Access is heavily stratified — upper strata navigate restrictions while lower strata often cannot.',
    birthRateModifier: 0.1,
    strataWellbeingBonus: { lower_middle: -3, working_class: -6, disenfranchised: -10 },
    geiDriftBonus: -0.02, epistemicHealthBonus: -3,
  },
  {
    id: 'forbidden', label: 'Absent or Forbidden', icon: '⛔',
    description: 'Sex education is absent or forbidden. Sexuality is a taboo subject. Abortion is criminalized. Birth control is highly restricted. Consequences fall almost entirely on women and lower strata, whose reproductive autonomy is effectively nonexistent.',
    birthRateModifier: 0.3,
    strataWellbeingBonus: { lower_middle: -8, working_class: -12, disenfranchised: -18 },
    geiDriftBonus: -0.05, epistemicHealthBonus: -8,
  },
];

const FAMILY_SIZE_POLICIES = [
  {
    id: 'large_encouraged', label: 'Large Families Encouraged', icon: '👨‍👩‍👧‍👦',
    description: 'State, cultural, or religious institutions actively incentivize large families through tax breaks, child payments, social prestige, or religious obligation. Anti-natalist views are discouraged or suppressed.',
    birthRateModifier: 0.25,
    strataWellbeingBonus: { elite: 1, upper_middle: 1, lower_middle: -2, working_class: -4, disenfranchised: -6 },
    demographicDriftPressure: 'young',
    note: 'Lowest strata bear the heaviest burden — more children with fewer resources per household.',
  },
  {
    id: 'neutral', label: 'Left to Individual Choice', icon: '🤷',
    description: 'No official state position on family size. Families make their own decisions without active encouragement or discouragement from government, religion, or cultural institutions.',
    birthRateModifier: 0,
    strataWellbeingBonus: { elite: 0, upper_middle: 0, lower_middle: 0, working_class: 0, disenfranchised: 0 },
    demographicDriftPressure: null,
    note: 'Neutral effect. Family size tracks other structural factors (education, GEI, economics).',
  },
  {
    id: 'small_encouraged', label: 'Small Families Encouraged', icon: '👨‍👩‍👧',
    description: 'Cultural norms, economic incentives, or explicit policy encourage smaller families (2 children or fewer). Environmental or resource concerns may be invoked. No coercive enforcement.',
    birthRateModifier: -0.2,
    strataWellbeingBonus: { elite: 0, upper_middle: 1, lower_middle: 2, working_class: 3, disenfranchised: 3 },
    demographicDriftPressure: 'aging',
    note: 'Lower strata benefit most — fewer dependents means more resources per child.',
  },
  {
    id: 'strictly_controlled', label: 'State-Mandated Family Size', icon: '📋',
    description: 'State enforces family size limits through penalties, mandatory contraception, or sterilization programs. Individual reproductive choice is subordinated to population management goals.',
    birthRateModifier: -0.4,
    strataWellbeingBonus: { elite: -2, upper_middle: -3, lower_middle: -5, working_class: -7, disenfranchised: -10 },
    demographicDriftPressure: 'aging',
    note: 'Effective at reducing birth rates; severe wellbeing, equality, and epistemic health penalties.',
    epistemicHealthPenalty: 5,   // per turn (additional, applied in simulation)
    equalityPenalty: 4,          // per turn delta to equalityIndex
  },
];

const WOMENS_RIGHTS_TIERS = [
  {
    id: 'full_parity', label: 'Full Parity', icon: '⚖️',
    description: 'Women have full and equal participation in all domains: education, employment, governance, law, finance, and public life. Pay equity is legally mandated and culturally enforced. Women hold leadership positions proportional to their share of the population.',
    geiAnchor: 80,
    innovationBonus: 0.08,
    strataWellbeingBonus: { lower_middle: 5, working_class: 8, disenfranchised: 10 },
    equalityBonus: 5, financialDepthBonus: 0.05,
  },
  {
    id: 'mostly_full', label: 'Mostly Full (Structural Barriers)', icon: '🔓',
    description: 'Women participate broadly in education, work, and public life. However, persistent wage gaps, underrepresentation in leadership, and subtle cultural barriers mean structural inequality remains. The glass ceiling is real but not absolute.',
    geiAnchor: 55,
    innovationBonus: 0.04,
    strataWellbeingBonus: { lower_middle: 1, working_class: 2, disenfranchised: 2 },
    equalityBonus: 0, financialDepthBonus: 0.01,
  },
  {
    id: 'minimal', label: 'Minimal (Grudging Participation)', icon: '🔒',
    description: 'Women may participate in limited sectors of work and public life but face substantial legal and cultural barriers to leadership, property ownership, and autonomous decision-making. Women\'s voices are systematically undervalued.',
    geiAnchor: 25,
    innovationBonus: -0.04,
    strataWellbeingBonus: { lower_middle: -4, working_class: -8, disenfranchised: -12 },
    equalityBonus: -5, financialDepthBonus: -0.02,
  },
  {
    id: 'forbidden', label: 'No Legal Rights', icon: '⛓️',
    description: 'Women cannot study independently, work unattended, own property, vote, or have legal standing. No reproductive autonomy, no right to divorce, no protection from domestic violence. Social role is defined entirely as wife, mother, and housekeeper.',
    geiAnchor: 5,
    innovationBonus: -0.10,
    strataWellbeingBonus: { lower_middle: -10, working_class: -15, disenfranchised: -22 },
    equalityBonus: -12, financialDepthBonus: -0.05,
  },
];

// ── Healthcare ─────────────────────────────────────────────────────────────────

const HEALTHCARE_ACCESS_TIERS = [
  {
    id: 'universal_public',
    label: 'Universal Public Healthcare', icon: '🏥',
    description: 'All residents receive comprehensive care free at point of use, funded by public taxation. Outcomes equalized across strata. Administrative overhead low; innovation incentives may lag private systems.',
    strataMultipliers: { elite: 1.0, upper_middle: 1.0, lower_middle: 1.0, working_class: 1.0, disenfranchised: 1.0 },
    wellbeingBase: 8, equalityBonus: 6, financialRisk: -0.03, birthRateMod: -0.05,
  },
  {
    id: 'universal_insurance',
    label: 'Universal Managed Insurance', icon: '📋',
    description: 'Mandatory insurance (public or private) covers everyone. Near-universal access but co-pays, deductibles, and plan tiers create minor stratification. Common in mixed economies.',
    strataMultipliers: { elite: 1.0, upper_middle: 1.0, lower_middle: 0.85, working_class: 0.7, disenfranchised: 0.55 },
    wellbeingBase: 5, equalityBonus: 3, financialRisk: -0.01, birthRateMod: -0.03,
  },
  {
    id: 'mixed_public_private',
    label: 'Mixed Public/Private', icon: '⚖️',
    description: 'Public safety net for catastrophic care; private market for everything else. Upper strata access excellent care; lower strata receive basic-to-minimal care depending on funding level.',
    strataMultipliers: { elite: 1.0, upper_middle: 0.95, lower_middle: 0.65, working_class: 0.45, disenfranchised: 0.25 },
    wellbeingBase: 2, equalityBonus: -1, financialRisk: 0.01, birthRateMod: 0,
  },
  {
    id: 'private_only',
    label: 'Private Market Only', icon: '💰',
    description: 'Healthcare is a market good. Those who can pay receive excellent care; those who cannot receive charity, emergency-only, or no care. Strong innovation incentives at top; catastrophic burden at bottom.',
    strataMultipliers: { elite: 1.0, upper_middle: 0.9, lower_middle: 0.45, working_class: 0.2, disenfranchised: 0.05 },
    wellbeingBase: -3, equalityBonus: -6, financialRisk: 0.04, birthRateMod: 0.05,
  },
  {
    id: 'minimal_traditional',
    label: 'Minimal / Traditional', icon: '🌿',
    description: 'Little to no formal healthcare infrastructure. Traditional medicine, community herbalism, religious healing. High infant/maternal mortality; short life expectancy; disease spread unchecked.',
    strataMultipliers: { elite: 0.7, upper_middle: 0.5, lower_middle: 0.3, working_class: 0.15, disenfranchised: 0.05 },
    wellbeingBase: -8, equalityBonus: -3, financialRisk: 0.02, birthRateMod: 0.15,
  },
];

const HEALTHCARE_EMPHASIS_TYPES = [
  {
    id: 'prevention',
    label: 'Prevention-First', icon: '🛡️',
    description: 'Investment in public health: vaccines, screening, nutrition, sanitation, mental health, and early detection. Reduces long-term disease burden and costs; effects compound slowly over turns.',
    wellbeingDriftBonus: 0.04, plagueMitigationBonus: 0.5, costEfficiencyBonus: 0.03,
  },
  {
    id: 'treatment',
    label: 'Diagnosis & Treatment Focus', icon: '💊',
    description: 'Investment in curative medicine, hospital capacity, specialty care, and pharmaceuticals. Responds well to crises; expensive per-patient; does not reduce underlying incidence rates.',
    wellbeingDriftBonus: 0.01, plagueMitigationBonus: 0.3, costEfficiencyBonus: -0.02,
  },
  {
    id: 'balanced',
    label: 'Balanced (Both Equally)', icon: '🔄',
    description: 'Proportional investment across prevention, early detection, and treatment. Moderate performance on all axes. Pragmatic default for most modern systems.',
    wellbeingDriftBonus: 0.025, plagueMitigationBonus: 0.4, costEfficiencyBonus: 0.005,
  },
];

const HEALTHCARE_INCENTIVE_MODELS = [
  {
    id: 'patient_outcomes',
    label: 'Patient Outcomes First', icon: '❤️',
    description: 'Providers rewarded for measurable health improvements, not volume of procedures. Incentivizes prevention, reduces unnecessary treatment, keeps costs predictable.',
    equalityBonus: 4, epistemicHealthBonus: 2, financialRisk: -0.02, wellbeingModifier: 0.03,
  },
  {
    id: 'profit_first',
    label: 'Business/Profit Outcomes First', icon: '📈',
    description: 'Providers rewarded for revenue, procedure volume, and shareholder returns. Incentivizes over-treatment of insured patients, under-treatment of uninsured. Innovation in profitable niches; neglect of unprofitable ones.',
    equalityBonus: -5, epistemicHealthBonus: -2, financialRisk: 0.03, wellbeingModifier: -0.02,
  },
  {
    id: 'mixed',
    label: 'Mixed / Hybrid', icon: '🔀',
    description: 'Some outcome-based payment with profit motivation. Quality varies by institution; patchwork results. Typical in systems transitioning between public and private models.',
    equalityBonus: 0, epistemicHealthBonus: 0, financialRisk: 0.01, wellbeingModifier: 0.005,
  },
];

// ── Resource Management ────────────────────────────────────────────────────────

const RESOURCE_STRATEGIES = [
  {
    id: 'conservation',
    label: 'Conservation & Sustainability', icon: '🌱',
    description: 'Resources treated as finite commons. Extraction rates regulated to stay within regeneration limits. Renewable investment high. Economic growth is secondary to long-term viability.',
    depletionMultiplier: 0.4, pollutionMultiplier: 0.35, wasteMultiplier: 0.3,
    growthPenalty: -0.015, wellbeingBonus: 2, crisisThresholdBonus: 15,
  },
  {
    id: 'balanced_stewardship',
    label: 'Balanced Stewardship', icon: '⚖️',
    description: 'Moderate extraction with reinvestment in regeneration. Environmental impact mitigated but not eliminated. Pragmatic middle path used by most regulated market economies.',
    depletionMultiplier: 0.8, pollutionMultiplier: 0.75, wasteMultiplier: 0.7,
    growthPenalty: 0, wellbeingBonus: 0, crisisThresholdBonus: 5,
  },
  {
    id: 'extraction_growth',
    label: 'Extraction for Growth', icon: '⛏️',
    description: 'Resources extracted at rates that maximize short-term economic output and profit. Built-in obsolescence, high-volume production, and growth metrics incentivize overconsumption. Long-term depletion risk high.',
    depletionMultiplier: 1.5, pollutionMultiplier: 1.6, wasteMultiplier: 1.8,
    growthPenalty: 0.02, wellbeingBonus: 1, crisisThresholdBonus: -10,
  },
  {
    id: 'government_managed',
    label: 'Government-Controlled', icon: '🏛️',
    description: 'State owns and allocates resource extraction quotas. Prevents market overextraction but creates political allocation pressures. Effectiveness scales with institutional quality: strong institutions → near conservation; weak institutions → near extraction.',
    depletionMultiplier: null, pollutionMultiplier: null, wasteMultiplier: null,
    growthPenalty: -0.005, wellbeingBonus: 0, crisisThresholdBonus: 0,
  },
];

const OBSOLESCENCE_MODELS = [
  {
    id: 'durability_first',
    label: 'Durability-First Design', icon: '🔩',
    description: 'Products designed for long useful life, repairability, and material reuse. Reduces replacement frequency, consumption, and waste. Compatible with right-to-repair laws. Lowers profit velocity in consumer markets.',
    wasteMultiplierMod: -0.3, resourceDepletionMod: -0.2, growthMod: -0.01, wellbeingMod: 0.01,
  },
  {
    id: 'regulated',
    label: 'Regulated Obsolescence', icon: '📝',
    description: 'Minimum durability standards, right-to-repair provisions, and extended producer responsibility laws. Products have reasonably long lifespans but still replaced on a market cycle.',
    wasteMultiplierMod: -0.1, resourceDepletionMod: -0.05, growthMod: 0, wellbeingMod: 0,
  },
  {
    id: 'market_driven',
    label: 'Market-Driven (Planned Obsolescence)', icon: '🔄',
    description: 'Producers intentionally limit product lifespan through design choices, software lock-out, unavailable spare parts, and fashion cycles. High replacement frequency drives revenue. Greatly accelerates resource consumption and waste streams. Combined with extraction-growth strategy, waste × 2.5 and depletion × 2.0.',
    wasteMultiplierMod: 0.4, resourceDepletionMod: 0.3, growthMod: 0.015, wellbeingMod: -0.01,
  },
];

// ── Information Ecosystem ──────────────────────────────────────────────────────

const INFORMATION_ECOSYSTEM_TYPES = [
  {
    id: 'open_civic',
    label: 'Open Civic Media', icon: '🗞️',
    description: 'Free, independent press with strong local journalism, public broadcasting, and robust civic discourse culture. High investigative capacity. Government accountability maintained through transparency.',
    epistemicHealthEffect: 4, innovationBonus: 3, socialCohesionEffect: 1, equalityEffect: 2,
    truthAnchor: 90,
  },
  {
    id: 'free_market_media',
    label: 'Commercial Free Press', icon: '📺',
    description: 'Independent but profit-driven media. Sensationalism and engagement-maximizing algorithms compete with quality journalism. Social media amplifies both truth and misinformation.',
    epistemicHealthEffect: 1, innovationBonus: 2, socialCohesionEffect: -1, equalityEffect: 0,
    truthAnchor: 60,
  },
  {
    id: 'captured_commercial',
    label: 'Oligarch-Captured Media', icon: '🏢',
    description: 'Media outlets owned by politically-aligned oligarchs or corporate interests. Officially free but editorially constrained. Inconvenient truths buried; narratives serve power.',
    epistemicHealthEffect: -2, innovationBonus: 0, socialCohesionEffect: 0, equalityEffect: -2,
    truthAnchor: 40,
  },
  {
    id: 'state_guided',
    label: 'State-Guided Narrative', icon: '📡',
    description: 'Government narrative dominates all major channels. Independent voices marginalized or co-opted. Dissent technically legal but practically discouraged. Epistemic quality degrades over time.',
    epistemicHealthEffect: -5, innovationBonus: -2, socialCohesionEffect: 2, equalityEffect: -3,
    truthAnchor: 25,
  },
  {
    id: 'total_information_control',
    label: 'Total Information Control', icon: '🔒',
    description: 'State propaganda monopoly. Opposition media illegal. Internet censored or state-controlled. History rewritten to serve current power. Citizens have no access to independent fact-checking.',
    epistemicHealthEffect: -10, innovationBonus: -5, socialCohesionEffect: 3, equalityEffect: -5,
    truthAnchor: 10,
  },
];

// ── PASS 7: SOCIAL PSYCHOLOGY ─────────────────────────────────────────────────

// How much wealth-derived power each economic model generates.
// Multiplied by actual wealth concentration (1 − equalityIndex/100) → economicPowerHierarchy.
// At market + full inequality (equalityIndex=0): economicPowerHierarchy = 0.85×100 = 85,
// which can subsume even a representative government (govHL ≈ 40–50).
const ECON_POWER_POTENTIAL = {
  gift:         0.00,   // no private wealth accumulation; no wealth-power
  none:         0.00,   // subsistence; no accumulation
  commons:      0.05,   // collective stewardship limits concentration
  labor_credit: 0.10,   // limited concentration; labor-time cannot compound indefinitely
  barter:       0.15,   // some accumulation but no financial instruments to amplify it
  planned:      0.20,   // state controls wealth; power is political, not economic
  mixed:        0.30,   // regulated markets; moderate concentration possible
  commodity:    0.45,   // significant accumulation possible; historical mercantile pattern
  market:       0.85,   // unconstrained accumulation; strong plutocratic potential
  custom:       0.30,   // default for user-defined models
};

// Base power-over-others each stratum holds (before scaling by effective hierarchy).
// disenfranchised = 0.00: no institutional power → no power-induced empathy suppression.
const STRATUM_POWER_BASE = {
  elite:          0.90,
  upper_middle:   0.58,
  lower_middle:   0.32,
  working_class:  0.10,
  disenfranchised: 0.00,
};

// Population-level susceptibility to power-induced empathy suppression.
// Modeled as a bimodal + gamma distribution, consistent with:
//   - Behavioral addiction research (gambling ~1-2% pathological, compulsive buying ~5-8%)
//     with GREATER weight placed on behavioral addictions (gambling, shopping, extreme sports,
//     social media) than substance addictions — they share the same mesolimbic dopamine
//     mechanism as power-induced suppression (variable-ratio reinforcement, D2 downregulation)
//   - Pathogen susceptibility (Miura et al. 2024: bimodal+gamma best fit for coronavirus)
//   - Drug/medicine effectiveness distributions (log-normal/gamma; Elassaiss-Schaap 2020)
// All three domains share the same root cause: genetics, neurobiology, and life experience.
// External factors shift realized prevalence but NOT the underlying distribution shape.
// Only generational drift applies: slow random walk on alpha/beta each generation.
//
// Per-stratum offsets reflect ACE (Adverse Childhood Experiences) load by socioeconomic position:
//   - Lower strata: higher ACE burden → higher intrinsic susceptibility
//   - Upper strata: more resilience resources → lower susceptibility
//   - disenfranchised: highest intrinsic susceptibility BUT zero power
//     → no power-induced empathy suppression; instead: cooperation/competition tension
//
// Bimodal component: resistant fraction (high compassion, secure attachment, OXTR variants)
// Gamma component: susceptible population — right-skewed, bounded at zero
const SUSCEPTIBILITY_MODELS = [
  {
    id: 'low_variation',
    label: 'Low Population Variation', icon: '📊',
    description: 'Most people respond relatively uniformly to power. Fewer extreme cases in either direction — fewer abusive outliers at every level, but also fewer who retain strong empathy near the top.',
    sigma: 0.3,
    abusiveTailFraction: 0.02,
    empatheticRetentionFraction: 0.12,
    cascadeRate: 0.85,
    // Bimodal+gamma parameters
    resistantFraction: 0.28,  // 28% largely immune (high compassion, secure attachment, OXTR variants)
    alpha: 1.5,               // gamma shape (right-skewed; most people moderately susceptible)
    beta: 2.2,                // gamma rate (mean = alpha/beta ≈ 0.68)
    // Per-stratum offset from population mean (positive = more susceptible)
    // Driven by ACE load, chronic stress, cortisol exposure, access to resilience resources
    stratumOffset: { elite: -0.10, upper_middle: -0.03, lower_middle: +0.03, working_class: +0.10, disenfranchised: +0.18 },
  },
  {
    id: 'moderate_variation',
    label: 'Moderate Variation (Default)', icon: '📈',
    description: 'Significant individual differences. Some become abusive with moderate power; others retain empathy at senior levels. Consistent with behavioral addiction research (~5% clinical threshold).',
    sigma: 0.6,
    abusiveTailFraction: 0.05,
    empatheticRetentionFraction: 0.09,
    cascadeRate: 1.0,
    resistantFraction: 0.20,
    alpha: 2.0,
    beta: 2.5,
    stratumOffset: { elite: -0.15, upper_middle: -0.05, lower_middle: +0.05, working_class: +0.15, disenfranchised: +0.25 },
  },
  {
    id: 'high_variation',
    label: 'High Variation', icon: '📉',
    description: 'Wide spread. A meaningful minority becomes abusive even at low power levels; a small fraction retains strong empathy even near the top of a steep hierarchy.',
    sigma: 1.0,
    abusiveTailFraction: 0.10,
    empatheticRetentionFraction: 0.07,
    cascadeRate: 1.2,
    resistantFraction: 0.14,
    alpha: 2.5,
    beta: 2.5,
    stratumOffset: { elite: -0.18, upper_middle: -0.07, lower_middle: +0.07, working_class: +0.20, disenfranchised: +0.32 },
  },
  {
    id: 'extreme_variation',
    label: 'Extreme Variation', icon: '⚡',
    description: 'Rare individuals are dramatically more or less susceptible than the norm. Strong "supersuppressor" and "empathy retainer" tails. Outcomes depend heavily on which individuals happen to hold power.',
    sigma: 1.5,
    abusiveTailFraction: 0.15,
    empatheticRetentionFraction: 0.06,
    cascadeRate: 1.4,
    resistantFraction: 0.08,
    alpha: 3.0,
    beta: 2.5,
    stratumOffset: { elite: -0.20, upper_middle: -0.08, lower_middle: +0.08, working_class: +0.25, disenfranchised: +0.40 },
  },
];

// Generational drift parameters for susceptibility distribution.
// The underlying genetic susceptibility distribution is stable across generations.
// A slow random walk on alpha/beta models epigenetic and cohort-level changes.
// Environmental changes (exposure intensity) shift realized prevalence without
// changing the distribution shape — consistent with all three research domains.
const SUSCEPTIBILITY_GENERATIONAL_DRIFT = {
  generationLengthTurns: 25,  // turns per generation (at 10yr/turn ≈ 250 years)
  alphaMaxDrift: 0.02,        // max change to alpha per generation tick (very slow)
  betaMaxDrift:  0.02,        // max change to beta per generation tick
  alphaRange:    [0.5, 5.0],  // hard clamp bounds
  betaRange:     [0.5, 5.0],
};

// Theocratic empathy bias: theocracies (and high-religion-influence civs) produce
// a split empathy profile rather than uniform suppression.
// Triggered when governance === 'theocratic' OR religion dominance > 70.
// In-group empathy is elevated; out-group empathy is suppressed.
// Internal wellbeing calculations use inGroup value; cross-civ interactions use outGroup.
const THEOCRATIC_EMPATHY_BIAS = {
  triggerReligionDominance: 70,  // religion influence threshold (0-100)
  inGroupMultiplier:  1.15,      // internal prosocial behavior amplified (capped at 95)
  outGroupMultiplier: 0.75,      // cross-group empathy suppressed
};

// ── PASS 7: CULTURAL GAP ──────────────────────────────────────────────────────
// Cultural Gap models the difference between:
//   STATED values: what the educational/cultural/religious system teaches as virtuous
//   REINFORCED values: what the economic and social system actually rewards in practice
// Gap drives: cognitive dissonance → cynicism → revolutionary consciousness → paradigm shift readiness
// Economic model is the PRIMARY driver of reinforced values (stronger than governance).
// Elites often benefit from maintaining the gap; lower strata bear its psychological costs.

// What the educational system teaches (base stated values, 0-100 per dimension)
const CULTURAL_STATED_VALUES_BY_EDUCATION = {
  universal:                       { cooperation: 75, empathy: 72, fairness: 70, civicDuty: 68, honesty: 70 },
  universal_free:                  { cooperation: 75, empathy: 72, fairness: 70, civicDuty: 68, honesty: 70 },
  universal_lower:                 { cooperation: 68, empathy: 65, fairness: 63, civicDuty: 60, honesty: 65 },
  free_secondary_affordable_higher:{ cooperation: 65, empathy: 62, fairness: 60, civicDuty: 58, honesty: 62 },
  free_basic_expensive_higher:     { cooperation: 60, empathy: 58, fairness: 55, civicDuty: 52, honesty: 58 },
  free_secondary_expensive_higher: { cooperation: 55, empathy: 52, fairness: 48, civicDuty: 45, honesty: 52 },
  limited:                         { cooperation: 45, empathy: 42, fairness: 40, civicDuty: 35, honesty: 44 },
  out_of_reach:                    { cooperation: 40, empathy: 38, fairness: 35, civicDuty: 30, honesty: 40 },
};

// Governance modifier on stated values (additive to education base)
const CULTURAL_STATED_VALUES_GOV_MODIFIER = {
  none:                        { civicDuty: -10, cooperation: +5 },
  flat_consensus:              { civicDuty: +15, cooperation: +15, empathy: +10 },
  rotating:                    { civicDuty: +12, cooperation: +10, fairness: +8 },
  elder_council:               { civicDuty: +8,  honesty: +5, cooperation: +5 },
  representative:              { civicDuty: +10, fairness: +5, cooperation: +5 },
  direct_congress:             { civicDuty: +20, cooperation: +20, fairness: +15, empathy: +10 },
  tribal_chief:                { civicDuty: +5 },
  oligarchy:                   { civicDuty: -5,  fairness: -10, honesty: -8 },
  autocratic:                  { civicDuty: +5,  fairness: -15, honesty: -10 },
  theocratic:                  { honesty: +10,   empathy: +5,  fairness: -5, civicDuty: +8 },
  shadow_government_complicit: { honesty: -20,   fairness: -15, civicDuty: -10 },
  shadow_government_covert:    { honesty: -10,   fairness: -8,  civicDuty: +2 },
  world_federation:            { civicDuty: +15, cooperation: +20, fairness: +15, empathy: +15 },
  failed_state:                { civicDuty: -20, cooperation: -15, honesty: -10 },
  custom:                      {},
};

// What the economic system actually rewards (reinforced values, 0-100 per dimension).
// Economic model is the PRIMARY driver — more powerful than governance.
// In wealth-accumulating models with high wealth capture, the wealthy determine
// what is reinforced for survival at scale: employment signals, media, status markers.
const CULTURAL_REINFORCED_VALUES_BY_ECON = {
  gift:         { cooperation: 80, empathy: 75, fairness: 78, civicDuty: 70, honesty: 75 },
  commons:      { cooperation: 75, empathy: 68, fairness: 72, civicDuty: 65, honesty: 68 },
  labor_credit: { cooperation: 65, empathy: 58, fairness: 65, civicDuty: 60, honesty: 65 },
  barter:       { cooperation: 55, empathy: 50, fairness: 52, civicDuty: 40, honesty: 58 },
  mixed:        { cooperation: 50, empathy: 45, fairness: 50, civicDuty: 50, honesty: 50 },
  planned:      { cooperation: 55, empathy: 42, fairness: 48, civicDuty: 62, honesty: 45 },
  commodity:    { cooperation: 35, empathy: 30, fairness: 32, civicDuty: 28, honesty: 38 },
  market:       { cooperation: 28, empathy: 25, fairness: 25, civicDuty: 22, honesty: 35 },
  none:         { cooperation: 50, empathy: 55, fairness: 48, civicDuty: 25, honesty: 60 },
  custom:       { cooperation: 50, empathy: 50, fairness: 50, civicDuty: 50, honesty: 50 },
};

// Governance modifier on reinforced values (additive, secondary to economic model)
const CULTURAL_REINFORCED_VALUES_GOV_MODIFIER = {
  none:                        { civicDuty: -10 },
  flat_consensus:              { cooperation: +10, fairness: +8,  civicDuty: +10 },
  rotating:                    { fairness: +6,     cooperation: +6 },
  elder_council:               { honesty: +5,      civicDuty: +5 },
  representative:              { civicDuty: +5,    fairness: +3 },
  direct_congress:             { cooperation: +15, fairness: +12, civicDuty: +15 },
  tribal_chief:                { cooperation: -5,  civicDuty: -5 },
  oligarchy:                   { fairness: -15,    empathy: -10,  civicDuty: -10, honesty: -12 },
  autocratic:                  { fairness: -12,    empathy: -8,   civicDuty: -5,  honesty: -8 },
  theocratic:                  { honesty: +8,      empathy: +3,   fairness: -5 },
  shadow_government_complicit: { fairness: -20,    honesty: -18,  empathy: -12,   civicDuty: -15 },
  shadow_government_covert:    { fairness: -12,    honesty: -10,  empathy: -6 },
  world_federation:            { cooperation: +12, fairness: +10, civicDuty: +12 },
  failed_state:                { cooperation: -15, civicDuty: -20, honesty: -10 },
  custom:                      {},
};

// How each stratum perceives and is affected by the cultural gap.
// Elites benefit from the gap → rationalize it → perceive it less.
// Disenfranchised live the gap most directly → highest perception and psychological cost.
const CULTURAL_GAP_STRATUM_PERCEPTION = {
  elite:          { perceptionMultiplier: 0.35, benefitFromGap: true  },
  upper_middle:   { perceptionMultiplier: 0.60, benefitFromGap: false },
  lower_middle:   { perceptionMultiplier: 0.80, benefitFromGap: false },
  working_class:  { perceptionMultiplier: 0.95, benefitFromGap: false },
  disenfranchised:{ perceptionMultiplier: 1.00, benefitFromGap: false },
};

// ── PASS 7: WEALTH CAPTURE ────────────────────────────────────────────────────
// Wealth capture tracks how much concentrated wealth has captured governance institutions.
// In wealth-accumulating economic models, wealth confers power that can exceed democratic
// institutions and subsume/capture them — creating a model resembling feudalism.
// Wealth capture also operates on psychological reinforcement: those of extreme wealth
// largely determine what IS and IS NOT reinforced for survival (employment signals,
// media, culture industry, status markers). Economic model > governance in reinforcement.

const WEALTH_CAPTURE_THRESHOLDS = {
  mild:    25,  // Noticeable lobbying influence; advisory capture of some agencies
  moderate:50,  // Regulatory capture; electoral finance dominates; media influence strong
  severe:  70,  // Courts and media substantially controlled; formal democracy eroded
  feudal:  80,  // Wealth IS governance; economic hierarchy subsumes political hierarchy
};

// ── PASS 7: IMPLEMENTATION STRATEGIES ────────────────────────────────────────
// Player-selectable strategies to accelerate behavior change and overcome
// persistence of old patterns after a governance or economic paradigm shift.
// Each strategy: has a cost, a duration, stat effects, synergies, and
// differential effectiveness by stratum and current cultural gap level.

const IMPLEMENTATION_STRATEGIES = [
  {
    id: 'skills_education',
    label: 'Skills Training in Education',
    description: 'Integrate new economic and civic skills into the educational curriculum. Retrains the population for the demands of the new model; reduces cultural gap by aligning what is taught with new reinforcement norms.',
    costType: 'stability', costAmount: 3, durationTurns: 8,
    effects: { culturalGapReduction: 0.15, behaviorChangeRateBonus: 0.30, cynicismReduction: 5 },
    synergiesWith: ['community_forums', 'media_messaging'],
    conflictsWith: [],
    effectivenessModifiers: {
      byEducationTier: {
        universal_free: 1.50, free_secondary_affordable_higher: 1.10,
        free_secondary_expensive_higher: 0.65, out_of_reach: 0.25,
      },
    },
    stratumBenefit: { working_class: 'high', lower_middle: 'high', disenfranchised: 'moderate' },
  },
  {
    id: 'media_messaging',
    label: 'Media Messaging Campaign',
    description: 'Public communication about new values and the challenges of transition. Effectiveness is heavily gated by information ecosystem quality and epistemic health — propaganda-dominated systems cannot produce genuine cultural change.',
    costType: 'wealth', costAmount: 5, durationTurns: 4,
    effects: { cynicismReduction: 5, culturalGapReduction: 0.10, awarenessBonus: 15 },
    synergiesWith: ['community_forums'],
    conflictsWith: ['total_information_control'],
    effectivenessModifiers: {
      byInfoEcosystem: {
        open_civic_media: 1.40, free_market_media: 1.10,
        captured_commercial: 0.65, state_guided: 0.50, total_information_control: 0.15,
      },
      byEpistemicHealth: 'linear',  // effectiveness × epistemicHealth/100
    },
    stratumBenefit: { all: 'moderate' },
  },
  {
    id: 'community_forums',
    label: 'Community Discussion Forums',
    description: 'Facilitate distributed deliberative spaces where citizens discuss challenges and build shared understanding. Reduces cynicism, builds cooperation, and channels revolutionary consciousness constructively rather than toward destabilizing conflict.',
    costType: 'stability', costAmount: 2, durationTurns: 5,
    effects: { cynicismReduction: 8, cooperationBonus: 8, paradigmShiftReadinessReduction: 10 },
    synergiesWith: ['skills_education', 'media_messaging', 'transitional_justice'],
    conflictsWith: ['total_information_control'],
    stratumBenefit: { lower_middle: 'high', working_class: 'high', disenfranchised: 'moderate' },
  },
  {
    id: 'transitional_justice',
    label: 'Truth & Reconciliation Process',
    description: 'Structured process to address grievances from the old paradigm. Reduces active resistance from aggrieved groups; rebuilds legitimacy of new institutions; essential when old paradigm produced serious injustices.',
    costType: 'stability', costAmount: 5, durationTurns: 10,
    effects: { resistanceReduction: 0.25, cooperationBonus: 10, culturalGapReduction: 0.10, institutionalQualityBonus: 3 },
    synergiesWith: ['community_forums'],
    conflictsWith: [],
    stratumBenefit: { working_class: 'high', disenfranchised: 'high', lower_middle: 'moderate' },
  },
  {
    id: 'transitional_institutions',
    label: 'Transitional / Hybrid Institutions',
    description: 'Build bridge institutions that connect old and new governance and economic forms, reducing destabilization during the transition period and building new institutional capacity.',
    costType: 'stability', costAmount: 8, durationTurns: 12,
    effects: { stabilityBonus: 10, resistanceReduction: 0.20, institutionalQualityBonus: 5 },
    synergiesWith: ['skills_education'],
    conflictsWith: [],
    stratumBenefit: { upper_middle: 'high', lower_middle: 'high' },
  },
  {
    id: 'economic_security',
    label: 'Economic Security Guarantees',
    description: 'Guarantee basic economic needs during the transition period. Reduces survival-driven resistance in lower strata, who bear the heaviest transition costs and are most vulnerable to material insecurity during institutional change.',
    costType: 'wealth', costAmount: 10, durationTurns: 6,
    effects: { resistanceReduction: 0.20, wellbeingBonus: 8, lowestStrataTensionReduction: 0.30 },
    synergiesWith: ['community_forums', 'transitional_justice'],
    conflictsWith: [],
    stratumBenefit: { working_class: 'very_high', disenfranchised: 'very_high' },
  },
];

// ── PASS 7: PARADIGM SHIFT CATALOG ───────────────────────────────────────────
// All possible paradigm shifts in all directions — governance and economic.
// No directional bias: authoritarian shifts modeled as fully as democratic ones;
// extractive economic shifts modeled as fully as redistributive ones.
// The system describes consequences; it does not prescribe direction.
// Each entry includes: resistance factors, enhancement factors, immediate stat effects,
// behavioral reinforcement shifts, multi-turn consequence chains, and recommended strategies.

const PARADIGM_SHIFT_CATALOG = {
  governance: [
    // ── Flattening / Democratizing ───────────────────────────────────────────
    {
      id: 'democratization',
      label: 'Democratization',
      direction: 'flattening',
      description: 'Transfer of political power from concentrated authority toward elected representative structures. Power becomes formally accountable to broader populations.',
      eligibleFrom: ['autocratic','oligarchy','tribal_chief','theocratic','shadow_government_complicit','shadow_government_covert','failed_state'],
      targetModels: ['representative'],
      resistanceFactors: [
        { id: 'elite_entrenchment',    label: 'Elite Entrenchment',            weight: 0.30 },
        { id: 'wealth_capture',        label: 'Wealth Capture Degree',         weight: 0.25 },
        { id: 'cultural_inertia',      label: 'Cultural Gap (Inertia)',         weight: 0.20 },
        { id: 'info_control',          label: 'Information Ecosystem',          weight: 0.15 },
        { id: 'low_iq',                label: 'Weak Institutions',              weight: 0.10 },
      ],
      enhancementFactors: [
        { id: 'shift_readiness',       label: 'Revolutionary Consciousness',    weight: 0.30 },
        { id: 'epistemic_health',      label: 'Epistemic Health',               weight: 0.20 },
        { id: 'institutional_quality', label: 'Institutional Quality',          weight: 0.20 },
        { id: 'low_wealth_capture',    label: 'Low Wealth Capture',             weight: 0.20 },
        { id: 'gender_equity',         label: 'Gender Equity Index',            weight: 0.10 },
      ],
      immediateEffects: { stabilityIndex: -15, empathyLevel: +4, corruptionIndex: -5 },
      behaviorShift: { cooperation: +12, competition: -8, deference: -20, conformity: -10, civicDuty: +18 },
      consequences: [
        { delay: 2,  description: 'Power redistribution destabilizes entrenched elites; institutional conflict peaks.', effects: { stabilityIndex: -8, corruptionIndex: -3 } },
        { delay: 5,  description: 'New representative institutions begin setting different behavioral expectations.', effects: { empathyLevel: +3, cooperation: +5 } },
        { delay: 12, description: 'Cultural gap narrows as stated civic values align more closely with reinforced ones.', effects: { cynicismLevel: -8, institutionalQuality: +5 } },
        { delay: 20, description: 'If wealth capture was not also addressed, plutocratic re-capture risk peaks.', effects: { wealthCaptureRisk: +15 } },
      ],
      recommendedStrategies: ['transitional_institutions','media_messaging','community_forums','economic_security'],
    },
    {
      id: 'direct_democracy_emergence',
      label: 'Direct Democracy Emergence',
      direction: 'flattening',
      description: 'Citizens begin governing themselves directly through nested assemblies and committees, bypassing representative intermediaries.',
      eligibleFrom: ['representative','rotating','flat_consensus','direct_congress'],
      targetModels: ['direct_congress'],
      resistanceFactors: [
        { id: 'elite_entrenchment',    label: 'Elite Entrenchment',            weight: 0.25 },
        { id: 'low_civic_capacity',    label: 'Low Civic Capacity (Education)',weight: 0.30 },
        { id: 'wealth_capture',        label: 'Wealth Capture',                weight: 0.20 },
        { id: 'cultural_inertia',      label: 'Cultural Inertia',              weight: 0.25 },
      ],
      enhancementFactors: [
        { id: 'shift_readiness',       label: 'Revolutionary Consciousness',   weight: 0.25 },
        { id: 'epistemic_health',      label: 'Epistemic Health',              weight: 0.25 },
        { id: 'education_quality',     label: 'Education Access & Quality',    weight: 0.30 },
        { id: 'low_wealth_capture',    label: 'Low Wealth Capture',            weight: 0.20 },
      ],
      immediateEffects: { stabilityIndex: -10, empathyLevel: +6, corruptionIndex: -8 },
      behaviorShift: { cooperation: +20, deference: -25, civicDuty: +25, acquisitiveness: -10, conformity: -15 },
      consequences: [
        { delay: 3,  description: 'Deliberative overload and coordination challenges stress new assemblies.', effects: { stabilityIndex: -5 } },
        { delay: 8,  description: 'Participatory norms begin reshaping behavioral reinforcement in public life.', effects: { cooperation: +8, culturalGapReduction: 0.15 } },
        { delay: 15, description: 'Wealth capture pressure intensifies as economic elites lose political leverage.', effects: { wealthCaptureResistance: +20 } },
      ],
      recommendedStrategies: ['skills_education','community_forums','transitional_institutions'],
    },
    {
      id: 'decentralization',
      label: 'Decentralization',
      direction: 'flattening',
      description: 'Power dispersed from central authority to regional, local, or community levels. Hierarchy level drops; power concentration falls.',
      eligibleFrom: ['autocratic','representative','theocratic','tribal_chief','oligarchy'],
      targetModels: ['rotating','elder_council','flat_consensus'],
      resistanceFactors: [
        { id: 'elite_entrenchment',    label: 'Centralized Elite Resistance',  weight: 0.35 },
        { id: 'coordination_cost',     label: 'Coordination Complexity',       weight: 0.30 },
        { id: 'wealth_capture',        label: 'Wealth Capture',                weight: 0.20 },
        { id: 'cultural_inertia',      label: 'Cultural Deference Norms',      weight: 0.15 },
      ],
      enhancementFactors: [
        { id: 'institutional_quality', label: 'Strong Local Institutions',     weight: 0.30 },
        { id: 'epistemic_health',      label: 'Epistemic Health',              weight: 0.20 },
        { id: 'shift_readiness',       label: 'Popular Demand',                weight: 0.25 },
        { id: 'geography',             label: 'Geographic Diversity',          weight: 0.25 },
      ],
      immediateEffects: { stabilityIndex: -8, empathyLevel: +3, corruptionIndex: -4 },
      behaviorShift: { deference: -15, cooperation: +8, innovation: +6, conformity: -8 },
      consequences: [
        { delay: 4,  description: 'Local governance capacity gaps emerge; some regions struggle more than others.', effects: { stabilityIndex: -4, institutionalQuality: -3 } },
        { delay: 10, description: 'Diverse local experiments produce innovation and cross-community learning.', effects: { innovationIndex: +5, cooperation: +5 } },
      ],
      recommendedStrategies: ['skills_education','transitional_institutions'],
    },
    {
      id: 'world_federation_formation',
      label: 'World Federation Formation',
      direction: 'integration',
      description: 'Multiple civilizations voluntarily unite under federated global governance. Cultural autonomy preserved; war suppressed; cooperative norms radiate outward.',
      eligibleFrom: ['*'],
      targetModels: ['world_federation'],
      resistanceFactors: [
        { id: 'sovereignty',           label: 'National Sovereignty Instinct', weight: 0.30 },
        { id: 'cultural_gap',          label: 'Inter-Civ Cultural Divergence', weight: 0.25 },
        { id: 'elite_entrenchment',    label: 'Elite Resistance to Power Loss',weight: 0.25 },
        { id: 'wealth_capture',        label: 'Competing Plutocratic Interests',weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'cooperation',           label: 'High Inter-Civ Cooperation',    weight: 0.35 },
        { id: 'tech_level',            label: 'High Tech Level',               weight: 0.20 },
        { id: 'epistemic_health',      label: 'Shared Epistemic Health',       weight: 0.20 },
        { id: 'low_wealth_capture',    label: 'Low Wealth Capture Across Civs',weight: 0.25 },
      ],
      immediateEffects: { stabilityIndex: -5, empathyLevel: +8, cooperation: +20 },
      behaviorShift: { cooperation: +25, deference: -12, civicDuty: +15, conformity: -10 },
      consequences: [
        { delay: 3,  description: 'Federal coordination structures strain under diverse member expectations.', effects: { stabilityIndex: -5 } },
        { delay: 8,  description: 'Federated empathy norms begin cross-civ propagation; war risk drops sharply.', effects: { empathyLevel: +5 } },
        { delay: 20, description: 'Consolidated institutions begin addressing wealth capture at global scale.', effects: { wealthCaptureReduction: 10 } },
      ],
      recommendedStrategies: ['community_forums','media_messaging','transitional_institutions'],
    },

    // ── Steepening / Concentrating ───────────────────────────────────────────
    {
      id: 'authoritarianization',
      label: 'Authoritarianization',
      direction: 'steepening',
      description: 'Concentration of political power into a single ruler or ruling clique. Formal democratic structures may persist nominally while real power concentrates.',
      eligibleFrom: ['representative','rotating','elder_council','oligarchy','direct_congress','world_federation'],
      targetModels: ['autocratic'],
      resistanceFactors: [
        { id: 'civil_society',         label: 'Civil Society Strength',        weight: 0.30 },
        { id: 'epistemic_health',      label: 'Epistemic Health / Free Press', weight: 0.25 },
        { id: 'institutional_quality', label: 'Institutional Quality',         weight: 0.25 },
        { id: 'gender_equity',         label: 'Gender Equity Index',           weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'instability',           label: 'Crisis / Instability',          weight: 0.30 },
        { id: 'low_epistemic_health',  label: 'Information Ecosystem Control', weight: 0.25 },
        { id: 'cynicism',              label: 'Population Cynicism',           weight: 0.20 },
        { id: 'wealth_capture',        label: 'Wealth Capture (Backing)',      weight: 0.25 },
      ],
      immediateEffects: { stabilityIndex: +8, corruptionIndex: +10, empathyLevel: -6 },
      behaviorShift: { deference: +25, conformity: +20, cooperation: -15, innovation: -10, civicDuty: -12 },
      consequences: [
        { delay: 2,  description: 'Suppression of opposition increases short-term stability; dissent goes underground.', effects: { stabilityIndex: +5, epistemicHealth: -8 } },
        { delay: 6,  description: 'Empathy cascade accelerates under heightened hierarchy; corruption rises.', effects: { empathyLevel: -5, corruptionIndex: +8 } },
        { delay: 15, description: 'Cultural gap widens as stated values diverge from reinforced ones (fear, compliance).', effects: { cynicismLevel: +10 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'plutocratization',
      label: 'Plutocratization',
      direction: 'wealth_capture',
      description: 'Formal democratic institutions are progressively captured by concentrated wealth. Governance serves plutocratic interests. Resembles feudalism in function when capture is severe.',
      eligibleFrom: ['representative','oligarchy','direct_congress'],
      targetModels: ['oligarchy','shadow_government_complicit'],
      resistanceFactors: [
        { id: 'epistemic_health',      label: 'Press Freedom / Epistemic Health',weight: 0.30 },
        { id: 'institutional_quality', label: 'Rule of Law',                    weight: 0.30 },
        { id: 'low_wealth_conc',       label: 'Low Wealth Concentration',       weight: 0.25 },
        { id: 'civil_society',         label: 'Civil Society Mobilization',     weight: 0.15 },
      ],
      enhancementFactors: [
        { id: 'wealth_concentration',  label: 'Wealth Concentration',           weight: 0.35 },
        { id: 'low_epistemic',         label: 'Captured / Weak Media',          weight: 0.25 },
        { id: 'low_iq',                label: 'Weak Institutions',              weight: 0.25 },
        { id: 'cynicism',              label: 'Civic Cynicism (Demobilizes)',   weight: 0.15 },
      ],
      immediateEffects: { corruptionIndex: +12, equalityIndex: -8, empathyLevel: -4 },
      behaviorShift: { acquisitiveness: +20, competition: +15, deference: +15, civicDuty: -15, fairness: -20 },
      consequences: [
        { delay: 3,  description: 'Regulatory agencies begin serving industry over public; wealth reinforcement strengthens.', effects: { corruptionIndex: +5 } },
        { delay: 8,  description: 'Cultural gap surges as reinforced behaviors (competition, acquisition) contradict stated democratic values.', effects: { cynicismLevel: +12 } },
        { delay: 15, description: 'Feudal dynamic threshold may be crossed; economic hierarchy subsumes governance.', effects: { wealthCaptureFeudalCheck: true } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'theocratization',
      label: 'Theocratization',
      direction: 'religious_capture',
      description: 'Religious authority progressively absorbs political authority. Empathy takes on in-group/out-group split character: elevated within the faith community, suppressed toward outsiders.',
      eligibleFrom: ['*'],
      targetModels: ['theocratic'],
      resistanceFactors: [
        { id: 'secular_institutions',  label: 'Secular Institutional Strength', weight: 0.30 },
        { id: 'epistemic_health',      label: 'Epistemic Health',               weight: 0.25 },
        { id: 'religious_diversity',   label: 'Religious Diversity',            weight: 0.20 },
        { id: 'gender_equity',         label: 'Gender Equity Index',            weight: 0.25 },
      ],
      enhancementFactors: [
        { id: 'religion_dominance',    label: 'Religion Dominance',             weight: 0.35 },
        { id: 'instability',           label: 'Crisis / Instability',           weight: 0.25 },
        { id: 'low_epistemic',         label: 'Low Epistemic Health',           weight: 0.20 },
        { id: 'cynicism',              label: 'Secular Cynicism',               weight: 0.20 },
      ],
      immediateEffects: { stabilityIndex: +5, genderEquityIndex: -10, epistemicHealth: -8 },
      behaviorShift: { conformity: +25, deference: +20, innovation: -15, cooperation: +5 },
      consequences: [
        { delay: 2,  description: 'Theocratic empathy bias activates: in-group empathy rises, out-group empathy suppressed.', effects: { theocraticEmpathyBiasActivated: true } },
        { delay: 6,  description: 'Epistemic health deteriorates as religious narrative crowds out empirical epistemology.', effects: { epistemicHealth: -6, scienceSupport: -10 } },
        { delay: 12, description: 'Gender equity continues declining under doctrinal gender hierarchy.', effects: { genderEquityIndex: -8 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'shadow_gov_emergence',
      label: 'Shadow Government Emergence',
      direction: 'covert_capture',
      description: 'A hidden network assumes real control while formal governance remains as facade. Complicit variant: visible leaders know. Covert variant: leaders sincerely believe they govern freely.',
      eligibleFrom: ['representative','oligarchy','autocratic'],
      targetModels: ['shadow_government_complicit','shadow_government_covert'],
      resistanceFactors: [
        { id: 'epistemic_health',      label: 'Press Freedom',                  weight: 0.35 },
        { id: 'institutional_quality', label: 'Rule of Law',                    weight: 0.30 },
        { id: 'low_wealth_capture',    label: 'Low Wealth Capture',             weight: 0.20 },
        { id: 'civil_society',         label: 'Investigative Civil Society',    weight: 0.15 },
      ],
      enhancementFactors: [
        { id: 'wealth_concentration',  label: 'Extreme Wealth Concentration',   weight: 0.30 },
        { id: 'info_capture',          label: 'Information Ecosystem Capture',  weight: 0.25 },
        { id: 'low_iq',                label: 'Weak Institutions',              weight: 0.25 },
        { id: 'cynicism',              label: 'Population Demobilized by Cynicism', weight: 0.20 },
      ],
      immediateEffects: { corruptionIndex: +15, empathyLevel: -8, epistemicHealth: -10 },
      behaviorShift: { acquisitiveness: +25, conformity: +15, honesty: -20, civicDuty: -15 },
      consequences: [
        { delay: 2,  description: 'Hidden network solidifies. Information ecosystem increasingly managed.', effects: { epistemicHealth: -8 } },
        { delay: 8,  description: 'Cultural gap reaches crisis levels: stated democratic values overtly contradicted by all reinforced behaviors.', effects: { cynicismLevel: +15 } },
        { delay: 15, description: 'Covert: sincere belief prevents correction. Complicit: coordination costs create instability.', effects: { stabilityIndex: -8 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'state_collapse',
      label: 'State Collapse',
      direction: 'collapse',
      description: 'Central governance institutions fail completely. Power fragments into competing local actors. Creates conditions for either reconsolidation or long-term fragmentation.',
      eligibleFrom: ['*'],
      targetModels: ['failed_state'],
      resistanceFactors: [
        { id: 'institutional_quality', label: 'Institutional Resilience',       weight: 0.35 },
        { id: 'civil_society',         label: 'Civil Society & Community Bonds',weight: 0.30 },
        { id: 'economic_security',     label: 'Economic Baseline Security',     weight: 0.20 },
        { id: 'cooperation',           label: 'Social Cohesion',                weight: 0.15 },
      ],
      enhancementFactors: [
        { id: 'instability',           label: 'Severe Instability',             weight: 0.35 },
        { id: 'low_iq',                label: 'Institutional Decay',            weight: 0.25 },
        { id: 'cynicism',              label: 'Legitimacy Collapse',            weight: 0.20 },
        { id: 'external_shock',        label: 'External Shock (War/Disaster)',  weight: 0.20 },
      ],
      immediateEffects: { stabilityIndex: -30, empathyLevel: -10, wellbeingIndex: -15, corruptionIndex: +20 },
      behaviorShift: { competition: +30, acquisitiveness: +20, cooperation: -25, mutualAid: -20, civicDuty: -25 },
      consequences: [
        { delay: 1,  description: 'Services collapse; local power vacuums fill with armed factions.', effects: { wellbeingIndex: -10, stabilityIndex: -10 } },
        { delay: 5,  description: 'Disenfranchised stratum competition/cooperation tension reaches maximum.', effects: { lowestStrataTensionBonus: +30 } },
        { delay: 10, description: 'Reconsolidation attempts begin; direction depends on which faction gains critical mass.', effects: { paradigmShiftReadiness: +40 } },
      ],
      recommendedStrategies: ['economic_security','transitional_institutions','community_forums'],
    },
  ],

  economic: [
    // ── Toward Redistribution / Commons ──────────────────────────────────────
    {
      id: 'socialization',
      label: 'Socialization / Nationalization',
      direction: 'redistributive',
      description: 'Key industries and wealth sources brought into public or collective ownership. Redistribution of returns from capital to the broader population.',
      eligibleFrom: ['market','commodity','mixed','barter'],
      targetModels: ['mixed','planned','labor_credit'],
      resistanceFactors: [
        { id: 'wealth_capture',        label: 'Plutocratic Resistance',        weight: 0.35 },
        { id: 'behavioral_inertia',    label: 'Acquisitive/Competitive Norms', weight: 0.25 },
        { id: 'info_capture',          label: 'Media Capture',                 weight: 0.20 },
        { id: 'cultural_inertia',      label: 'Cultural Gap (Market Norms)',   weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'shift_readiness',       label: 'Revolutionary Consciousness',   weight: 0.30 },
        { id: 'low_equality',          label: 'Extreme Inequality (Pressure)', weight: 0.25 },
        { id: 'epistemic_health',      label: 'Press Freedom',                 weight: 0.20 },
        { id: 'instability',           label: 'Economic Crisis',               weight: 0.25 },
      ],
      immediateEffects: { equalityIndex: +8, stabilityIndex: -10, wealthConcentration: -10 },
      behaviorShift: { cooperation: +10, acquisitiveness: -15, competition: -10, civicDuty: +10 },
      consequences: [
        { delay: 3,  description: 'Capital flight and elite resistance destabilize output; transitional costs peak.', effects: { stabilityIndex: -8, wealthConcentration: -5 } },
        { delay: 8,  description: 'New behavioral reinforcement begins: cooperation and mutual aid become economically rewarded.', effects: { cooperation: +8, mutualAid: +6 } },
        { delay: 15, description: 'Cultural gap narrows as reinforced values begin aligning with stated cooperative norms.', effects: { cynicismLevel: -8 } },
      ],
      recommendedStrategies: ['skills_education','media_messaging','economic_security','transitional_institutions'],
    },
    {
      id: 'commons_transition',
      label: 'Commons Economy Transition',
      direction: 'redistributive',
      description: 'Productive resources brought under collective stewardship. Access based on need and contribution; accumulation structurally prevented.',
      eligibleFrom: ['market','mixed','planned','labor_credit','commodity','barter'],
      targetModels: ['commons'],
      resistanceFactors: [
        { id: 'wealth_capture',        label: 'Plutocratic Resistance',        weight: 0.30 },
        { id: 'behavioral_inertia',    label: 'Acquisitive Behavioral Norms',  weight: 0.30 },
        { id: 'coordination_cost',     label: 'Collective Management Complexity', weight: 0.20 },
        { id: 'cultural_inertia',      label: 'Cultural Individualism',        weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'shift_readiness',       label: 'Revolutionary Consciousness',   weight: 0.25 },
        { id: 'low_equality',          label: 'High Inequality',               weight: 0.25 },
        { id: 'institutional_quality', label: 'Institutional Quality',         weight: 0.25 },
        { id: 'education',             label: 'Education Access',              weight: 0.25 },
      ],
      immediateEffects: { equalityIndex: +12, stabilityIndex: -12, wealthConcentration: -15 },
      behaviorShift: { cooperation: +18, mutualAid: +20, acquisitiveness: -22, competition: -15, conformity: +8 },
      consequences: [
        { delay: 4,  description: 'Transition coordination costs are high; some production inefficiencies emerge.', effects: { stabilityIndex: -6 } },
        { delay: 10, description: 'Mutual aid and cooperation begin self-reinforcing as economic rewards align with prosocial behavior.', effects: { cooperation: +8 } },
        { delay: 20, description: 'Behavioral norms shift substantially; stated and reinforced values converge.', effects: { cynicismLevel: -12, empathyLevel: +6 } },
      ],
      recommendedStrategies: ['skills_education','community_forums','economic_security','transitional_justice'],
    },
    {
      id: 'degrowth_transition',
      label: 'Degrowth / Steady-State Transition',
      direction: 'redistributive',
      description: 'The economy deliberately scales down material throughput, prioritizing wellbeing, sustainability, and equity over growth metrics.',
      eligibleFrom: ['market','mixed','commodity'],
      targetModels: ['commons','mixed'],
      resistanceFactors: [
        { id: 'wealth_capture',        label: 'Growth-Dependent Elites',       weight: 0.30 },
        { id: 'behavioral_inertia',    label: 'Acquisitive Norms',             weight: 0.25 },
        { id: 'employment_fear',       label: 'Employment/Stability Fear',     weight: 0.25 },
        { id: 'info_capture',          label: 'Media Framing of Growth',       weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'environmental_crisis',  label: 'Environmental Crisis Pressure', weight: 0.30 },
        { id: 'epistemic_health',      label: 'Epistemic Health',              weight: 0.25 },
        { id: 'shift_readiness',       label: 'Revolutionary Consciousness',   weight: 0.25 },
        { id: 'gender_equity',         label: 'Gender Equity (Care Economy)',  weight: 0.20 },
      ],
      immediateEffects: { stabilityIndex: -8, wellbeingIndex: +4, equalityIndex: +6 },
      behaviorShift: { acquisitiveness: -18, competition: -12, cooperation: +10, mutualAid: +10 },
      consequences: [
        { delay: 3,  description: 'GDP metrics decline; wellbeing and sustainability metrics improve.', effects: { wellbeingIndex: +5 } },
        { delay: 10, description: 'Behavioral norms shift as success is redefined away from accumulation.', effects: { cynicismLevel: -5 } },
      ],
      recommendedStrategies: ['media_messaging','skills_education','community_forums','economic_security'],
    },
    {
      id: 'gift_economy_emergence',
      label: 'Post-Scarcity Gift Economy',
      direction: 'redistributive',
      description: 'High technology and abundance enable a gift economy where resources are freely shared. Requires very high tech level and low scarcity.',
      eligibleFrom: ['commons','mixed','market'],
      targetModels: ['gift'],
      resistanceFactors: [
        { id: 'scarcity',              label: 'Remaining Scarcity',            weight: 0.35 },
        { id: 'behavioral_inertia',    label: 'Acquisitive Behavioral Norms',  weight: 0.35 },
        { id: 'wealth_capture',        label: 'Plutocratic Resistance',        weight: 0.30 },
      ],
      enhancementFactors: [
        { id: 'tech_level',            label: 'High Tech Level (Abundance)',   weight: 0.40 },
        { id: 'low_scarcity',          label: 'Low Resource Scarcity',         weight: 0.30 },
        { id: 'low_wealth_capture',    label: 'Low Wealth Capture',            weight: 0.30 },
      ],
      immediateEffects: { equalityIndex: +20, empathyLevel: +10, cooperation: +20, wealthConcentration: -20 },
      behaviorShift: { cooperation: +25, mutualAid: +30, acquisitiveness: -30, competition: -20 },
      consequences: [
        { delay: 5,  description: 'Accumulation ceases to be meaningful; social bonds replace transactional exchange.', effects: { cooperation: +10, empathyLevel: +5 } },
        { delay: 15, description: 'Cultural gap effectively closes; stated and reinforced values converge on gift principles.', effects: { cynicismLevel: -20 } },
      ],
      recommendedStrategies: ['community_forums','media_messaging'],
    },

    // ── Toward Extraction / Market ────────────────────────────────────────────
    {
      id: 'marketization',
      label: 'Marketization / Privatization',
      direction: 'extractive',
      description: 'Public or collective assets transferred to private ownership. Market mechanisms replace collective or planned allocation. Accumulation potential rises.',
      eligibleFrom: ['planned','commons','labor_credit','mixed','barter','none'],
      targetModels: ['market','commodity','mixed'],
      resistanceFactors: [
        { id: 'civil_society',         label: 'Commons Defense Movements',     weight: 0.30 },
        { id: 'cultural_inertia',      label: 'Cooperative Cultural Norms',    weight: 0.25 },
        { id: 'institutional_quality', label: 'Public Institution Strength',   weight: 0.25 },
        { id: 'epistemic_health',      label: 'Epistemic Health',              weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'external_pressure',     label: 'External Economic Pressure',    weight: 0.30 },
        { id: 'instability',           label: 'Economic Crisis (Shock Doctrine)', weight: 0.25 },
        { id: 'low_epistemic',         label: 'Information Capture',           weight: 0.25 },
        { id: 'wealth_capture',        label: 'Domestic Wealth Capture',       weight: 0.20 },
      ],
      immediateEffects: { equalityIndex: -8, wealthConcentration: +10, innovationIndex: +5 },
      behaviorShift: { acquisitiveness: +20, competition: +15, cooperation: -12, mutualAid: -15, innovation: +10 },
      consequences: [
        { delay: 3,  description: 'Privatized services increase efficiency for those who can pay; accessibility declines for lower strata.', effects: { wellbeingIndex: -5, equalityIndex: -5 } },
        { delay: 8,  description: 'Behavioral reinforcement shifts: market success signals replace cooperative signals.', effects: { cynicismLevel: +6 } },
        { delay: 15, description: 'Wealth concentration enables growing plutocratic capture of political institutions.', effects: { wealthCaptureRisk: +15 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'enclosure',
      label: 'Commons Enclosure',
      direction: 'extractive',
      description: 'Collectively held resources converted to private property. Historical precedent: English enclosure movements, colonial land appropriation. Drives dispossession of lower strata.',
      eligibleFrom: ['commons','gift','none','barter'],
      targetModels: ['commodity','market','barter'],
      resistanceFactors: [
        { id: 'civil_society',         label: 'Commons Defense',               weight: 0.35 },
        { id: 'institutional_quality', label: 'Rule of Law',                   weight: 0.30 },
        { id: 'cooperation',           label: 'Community Solidarity',          weight: 0.35 },
      ],
      enhancementFactors: [
        { id: 'external_force',        label: 'External Military/Economic Force', weight: 0.35 },
        { id: 'elite_entrenchment',    label: 'Landed Elite Power',            weight: 0.30 },
        { id: 'low_epistemic',         label: 'Information Suppression',       weight: 0.20 },
        { id: 'instability',           label: 'Instability / Crisis',          weight: 0.15 },
      ],
      immediateEffects: { equalityIndex: -15, wealthConcentration: +20, empathyLevel: -5, stabilityIndex: -8 },
      behaviorShift: { acquisitiveness: +25, competition: +20, mutualAid: -20, cooperation: -20, civicDuty: -15 },
      consequences: [
        { delay: 2,  description: 'Dispossessed population swells working class and disenfranchised strata.', effects: { wealthConcentration: +10, equalityIndex: -8 } },
        { delay: 6,  description: 'Cooperation/competition tension maximizes in disenfranchised stratum.', effects: { lowestStrataTensionBonus: +20 } },
        { delay: 12, description: 'Cultural gap peaks as stated communal values are replaced by enforced market logic.', effects: { cynicismLevel: +15 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'financialization',
      label: 'Financialization',
      direction: 'extractive',
      description: 'The financial sector expands to dominate the economy. Returns to capital increasingly exceed returns to labor. Wealth concentration accelerates; debt becomes the primary mechanism of control.',
      eligibleFrom: ['market','mixed','commodity'],
      targetModels: ['market'],
      resistanceFactors: [
        { id: 'institutional_quality', label: 'Financial Regulatory Quality',  weight: 0.30 },
        { id: 'epistemic_health',      label: 'Economic Literacy / Press',     weight: 0.25 },
        { id: 'low_debt',              label: 'Low Debt Load',                 weight: 0.25 },
        { id: 'civil_society',         label: 'Labor Movement Strength',       weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'wealth_capture',        label: 'Existing Wealth Capture',       weight: 0.35 },
        { id: 'low_epistemic',         label: 'Financial Opacity / Complexity',weight: 0.25 },
        { id: 'deregulation',          label: 'Deregulation',                  weight: 0.25 },
        { id: 'global_trade',          label: 'Trade Dependency',              weight: 0.15 },
      ],
      immediateEffects: { wealthConcentration: +12, equalityIndex: -10, debtLoad: +15 },
      behaviorShift: { acquisitiveness: +15, competition: +10, civicDuty: -10, cooperation: -8 },
      consequences: [
        { delay: 4,  description: 'Debt load on lower strata grows; predatory finance effects appear.', effects: { wellbeingIndex: -6, equalityIndex: -5 } },
        { delay: 10, description: 'Financial sector reshapes behavioral reinforcement: speculation rewarded over production.', effects: { cynicismLevel: +8 } },
        { delay: 18, description: 'Financial crisis probability peaks; system fragility high.', effects: { financialCrisisRisk: +20 } },
      ],
      recommendedStrategies: [],
    },
    {
      id: 'planned_economy_imposition',
      label: 'Planned Economy Imposition',
      direction: 'centralization',
      description: 'Central authority assumes control of resource allocation and production planning. May be ideologically motivated or crisis-driven. Accumulation suppressed; conformity reinforced.',
      eligibleFrom: ['market','mixed','commodity','barter','commons'],
      targetModels: ['planned'],
      resistanceFactors: [
        { id: 'market_entrenchment',   label: 'Market Behavioral Entrenchment',weight: 0.30 },
        { id: 'wealth_capture',        label: 'Capitalist Class Resistance',   weight: 0.30 },
        { id: 'epistemic_health',      label: 'Information Pluralism',         weight: 0.20 },
        { id: 'institutional_quality', label: 'Planning Capacity',             weight: 0.20 },
      ],
      enhancementFactors: [
        { id: 'instability',           label: 'War / Economic Crisis',         weight: 0.30 },
        { id: 'political_power',       label: 'Concentrated Political Power',  weight: 0.30 },
        { id: 'low_epistemic',         label: 'Information Control Capacity',  weight: 0.20 },
        { id: 'shift_readiness',       label: 'Popular Mandate',               weight: 0.20 },
      ],
      immediateEffects: { wealthConcentration: -10, equalityIndex: +8, stabilityIndex: -5, innovationIndex: -8 },
      behaviorShift: { conformity: +20, cooperation: +10, acquisitiveness: -15, innovation: -12, deference: +15 },
      consequences: [
        { delay: 3,  description: 'Planning bureaucracy grows; information bottlenecks emerge.', effects: { institutionalQuality: -3, innovationIndex: -5 } },
        { delay: 8,  description: 'Conformity norms strengthen; non-conforming behavioral signals decline.', effects: { epistemicHealth: -5 } },
        { delay: 15, description: 'If institutional quality adequate: stability and equality hold. If inadequate: shortages and corruption emerge.', effects: { planningQualityCheck: true } },
      ],
      recommendedStrategies: ['skills_education','transitional_institutions','community_forums'],
    },
    {
      id: 'barter_reversion',
      label: 'Monetary Collapse / Barter Reversion',
      direction: 'collapse',
      description: 'Currency system collapses or loses legitimacy. Economy reverts to direct exchange. Often follows state collapse or hyperinflation.',
      eligibleFrom: ['market','commodity','planned','mixed','labor_credit'],
      targetModels: ['barter'],
      resistanceFactors: [
        { id: 'institutional_quality', label: 'Central Bank / Monetary Stability', weight: 0.40 },
        { id: 'trade_dependency',      label: 'International Trade Backing',   weight: 0.30 },
        { id: 'epistemic_health',      label: 'Public Trust in Institutions',  weight: 0.30 },
      ],
      enhancementFactors: [
        { id: 'financial_crisis',      label: 'Financial Crisis / Hyperinflation', weight: 0.35 },
        { id: 'instability',           label: 'State Collapse / War',          weight: 0.35 },
        { id: 'low_trust',             label: 'Low Institutional Trust',       weight: 0.30 },
      ],
      immediateEffects: { stabilityIndex: -20, wealthConcentration: -15, equalityIndex: +5, innovationIndex: -10 },
      behaviorShift: { cooperation: +5, competition: +10, deference: -15, civicDuty: -15 },
      consequences: [
        { delay: 2,  description: 'Local exchange networks emerge; regional variation grows sharply.', effects: { stabilityIndex: -8 } },
        { delay: 6,  description: 'New informal institutions begin regulating exchange; trust rebuilds slowly at local scale.', effects: { cooperation: +3 } },
      ],
      recommendedStrategies: ['community_forums','economic_security'],
    },
  ],
};

// ── Pass 8: Facilitation Measures ─────────────────────────────────────────
// Interventions that can accelerate behavioral realignment after a paradigm shift.
// Mechanically distinct from propaganda: facilitation works THROUGH epistemic health
// (EH is an amplifier); propaganda suppresses EH. Facilitation is bounded by structural
// conditions (economic model + wealth capture ceiling); propaganda bypasses this.
const FACILITATION_MEASURES = [
  {
    id: 'civic_education_workshops',
    label: 'Civic Education Workshops',
    description: 'Structured educational programs teaching civic participation, rights, and the implications of the new paradigm.',
    category: 'education',
    cost: 15,               // resource cost per turn active (deducted from resourceStores.food as proxy)
    durationTurns: 10,      // 0 = runs until manually deactivated
    effects: {
      cynicismReduction: 3,      // per turn reduction to culturalGap.cynicismLevel (× EH amplifier)
      gapNarrowingRate: 0.04,    // fraction of cultural gap narrowed per turn (× EH amplifier)
      cooperationBoost: 0.5,     // per turn added to deferredShift.cooperation (× EH amplifier)
      ehRequirement: 35,         // minimum epistemicHealth for behavioral effects; cymicism still 50% below
      structuralCeiling: true,   // respect structural behavior ceiling
    },
    propagandaRisk: 0,           // 0 = clean; > 0 = risk of backfire when EH < 30
    unavailableWhen: ['feudalDynamic'], // blocked when feudalDynamic is true
  },
  {
    id: 'community_forums',
    label: 'Community Deliberation Forums',
    description: 'Facilitated public spaces for collective problem-solving and shared sense-making about societal change.',
    category: 'civic',
    cost: 8,
    durationTurns: 0,
    effects: {
      cynicismReduction: 1.5,
      gapNarrowingRate: 0.025,
      cooperationBoost: 0.8,
      mutualAidBoost: 0.5,
      ehRequirement: 25,
      structuralCeiling: true,
    },
    propagandaRisk: 0,
    unavailableWhen: [],
  },
  {
    id: 'peer_demonstration',
    label: 'Peer Demonstration Programs',
    description: 'Visible, replicable examples of cooperative behavior producing better outcomes for ordinary people.',
    category: 'civic',
    cost: 5,
    durationTurns: 0,
    effects: {
      cynicismReduction: 2,
      cooperationBoost: 1.2,
      mutualAidBoost: 0.8,
      ehRequirement: 20,
      structuralCeiling: true,
    },
    propagandaRisk: 0,
    unavailableWhen: [],
  },
  {
    id: 'media_messaging_campaign',
    label: 'Media Messaging Campaign',
    description: 'Public information campaigns reinforcing new paradigm values. Effectiveness depends heavily on epistemic health — low EH turns this into propaganda.',
    category: 'media',
    cost: 20,
    durationTurns: 5,
    effects: {
      cynicismReduction: 2,
      gapNarrowingRate: 0.05,
      cooperationBoost: 0.3,
      ehRequirement: 40,        // higher bar — low EH environment makes this counterproductive
      structuralCeiling: true,
    },
    propagandaRisk: 1,          // if EH < 30: generates +cynicism instead of -cynicism
    unavailableWhen: [],
  },
  {
    id: 'economic_incentive_alignment',
    label: 'Economic Incentive Realignment',
    description: 'Policy changes that make cooperative behaviors materially rewarding under the new model. A structural intervention, not an epistemic one — bypasses inertia ceiling.',
    category: 'economic',
    cost: 30,
    durationTurns: 0,
    effects: {
      cooperationBoost: 2.0,
      acquisitivenessReduction: 1.0,
      cynicismReduction: 1.0,
      ehRequirement: 0,         // structural effect — always works regardless of EH
      structuralCeiling: false, // bypasses ceiling (this IS the structural condition)
    },
    propagandaRisk: 0,
    unavailableWhen: ['feudalDynamic'],
  },
];

// ── Pass 8: Threshold & Turning-Point Definitions ─────────────────────────
// Each definition specifies a state condition that, when crossed, logs a named
// event to civ.history and thresholdEvents.fired. Cooldowns prevent event spam.
// 'oneShot: false' means the threshold can fire repeatedly (with cooldown).
// customCheck(s): optional function — if provided, overrides field/trigger/value logic.
// text(s): function returning the event description string (receives civ.state).
const THRESHOLD_DEFINITIONS = [

  // ── Cynicism ────────────────────────────────────────────────────────────
  {
    id: 'cynicism_rising',
    label: 'Cynicism Rising',
    field: 'culturalGap.cynicismLevel',
    trigger: '>=', value: 40,
    oneShot: false, cooldown: 15,
    color: '#f59e0b', severity: 'info',
    text: (s) => `Cynicism is rising — ${Math.round(s.culturalGap?.cynicismLevel ?? 0)}% of the population has lost confidence in stated values. Cultural dissonance is becoming systemic.`,
  },
  {
    id: 'cynicism_critical',
    label: 'Cynicism Critical',
    field: 'culturalGap.cynicismLevel',
    trigger: '>=', value: 70,
    oneShot: false, cooldown: 20,
    color: '#ef4444', severity: 'warning',
    text: (s) => `Critical cynicism level reached (${Math.round(s.culturalGap?.cynicismLevel ?? 0)}%). Revolutionary consciousness is forming. Paradigm change pressure is mounting.`,
  },
  {
    id: 'cynicism_collapse',
    label: 'Social Contract Collapse',
    field: 'culturalGap.cynicismLevel',
    trigger: '>=', value: 90,
    oneShot: false, cooldown: 25,
    color: '#dc2626', severity: 'crisis',
    text: (s) => `Social contract collapse: cynicism at ${Math.round(s.culturalGap?.cynicismLevel ?? 0)}%. Collective disillusionment is near-total. Systemic change or failed-state conditions are likely.`,
  },

  // ── Empathy ─────────────────────────────────────────────────────────────
  {
    id: 'elite_empathy_floor',
    label: 'Elite Empathy Floor',
    field: 'empathyByStratum.elite',
    trigger: '<=', value: 20,
    oneShot: false, cooldown: 20,
    color: '#ef4444', severity: 'warning',
    text: (s) => `Elite empathy has fallen to floor level (${Math.round(s.empathyByStratum?.elite ?? 0)}%). The ruling stratum has functionally decoupled its psychology from mass welfare. Structural abuse is likely.`,
  },
  {
    id: 'empathy_inversion',
    label: 'Empathy Inversion',
    field: null,
    oneShot: false, cooldown: 20,
    color: '#dc2626', severity: 'crisis',
    customCheck: (s) => (s.empathyByStratum?.elite ?? 50) < (s.empathyByStratum?.disenfranchised ?? 50) - 40,
    text: (s) => `Empathy inversion detected: disenfranchised populations show dramatically higher empathy than elites (${Math.round(s.empathyByStratum?.disenfranchised ?? 0)} vs ${Math.round(s.empathyByStratum?.elite ?? 0)}). Structural inequality is generating moral divergence across strata.`,
  },

  // ── Wealth Capture ───────────────────────────────────────────────────────
  {
    id: 'capture_entrenched',
    label: 'Wealth Capture Entrenched',
    field: 'wealthCapture.degree',
    trigger: '>=', value: 50,
    oneShot: false, cooldown: 20,
    color: '#f97316', severity: 'warning',
    text: (s) => `Wealth capture has reached ${Math.round(s.wealthCapture?.degree ?? 0)}% — institutional governance is now significantly compromised. Democratic accountability faces structural barriers.`,
  },
  {
    id: 'feudal_dynamic',
    label: 'Feudal Dynamic Active',
    field: 'wealthCapture.feudalDynamic',
    trigger: '===', value: true,
    oneShot: false, cooldown: 30,
    color: '#dc2626', severity: 'crisis',
    text: (s) => `Feudal dynamic has activated: wealth concentration exceeds 75% and capture degree exceeds 80%. Economic and political power have effectively merged into a hereditary hierarchy.`,
  },

  // ── Cooperation ──────────────────────────────────────────────────────────
  {
    id: 'coop_tipping_up',
    label: 'Cooperation Tipping Point (Rise)',
    field: 'behaviorReinforcement.cooperation',
    trigger: '>=', value: 70,
    oneShot: false, cooldown: 20,
    color: '#22c55e', severity: 'info',
    text: (s) => `Cooperation has crossed a positive tipping point (${Math.round(s.behaviorReinforcement?.cooperation ?? 50)}%). Self-reinforcing cooperative norms are stabilizing. Mutual aid infrastructure is strengthening.`,
  },
  {
    id: 'coop_tipping_down',
    label: 'Cooperation Tipping Point (Fall)',
    field: 'behaviorReinforcement.cooperation',
    trigger: '<=', value: 30,
    oneShot: false, cooldown: 20,
    color: '#ef4444', severity: 'warning',
    text: (s) => `Cooperation has collapsed below critical threshold (${Math.round(s.behaviorReinforcement?.cooperation ?? 50)}%). Competitive and acquisitive behaviors are becoming dominant. Social cohesion is at risk.`,
  },

  // ── Consequence Deficit ──────────────────────────────────────────────────
  {
    id: 'deficit_accumulating',
    label: 'Consequence Deficit Accumulating',
    field: 'consequenceDeficit.level',
    trigger: '>=', value: 40,
    oneShot: false, cooldown: 15,
    color: '#f59e0b', severity: 'info',
    text: (s) => `Consequence deficit is accumulating (${Math.round(s.consequenceDeficit?.level ?? 0)}%). Unchecked abuse of power is reducing the expected cost of further abuses. Power concentration is accelerating.`,
  },
  {
    id: 'deficit_critical',
    label: 'Consequence Deficit Critical',
    field: 'consequenceDeficit.level',
    trigger: '>=', value: 75,
    oneShot: false, cooldown: 20,
    color: '#dc2626', severity: 'crisis',
    text: (s) => `Critical consequence deficit (${Math.round(s.consequenceDeficit?.level ?? 0)}%). Accountability mechanisms have failed. Power concentration is entering a self-reinforcing acceleration phase.`,
  },

  // ── Paradigm Shift Readiness ─────────────────────────────────────────────
  {
    id: 'shift_readiness_high',
    label: 'Paradigm Shift Readiness: High',
    field: 'culturalGap.paradigmShiftReadiness',
    trigger: '>=', value: 60,
    oneShot: false, cooldown: 15,
    color: '#a855f7', severity: 'info',
    text: (s) => `Paradigm shift readiness has reached ${Math.round(s.culturalGap?.paradigmShiftReadiness ?? 0)}%. Structural conditions and collective consciousness are aligning. The existing order is increasingly unstable.`,
  },
  {
    id: 'shift_imminent',
    label: 'Paradigm Shift Imminent',
    field: 'culturalGap.paradigmShiftReadiness',
    trigger: '>=', value: 85,
    oneShot: false, cooldown: 20,
    color: '#dc2626', severity: 'crisis',
    text: (s) => `Paradigm shift is imminent. Readiness at ${Math.round(s.culturalGap?.paradigmShiftReadiness ?? 0)}%. The existing political-economic arrangement cannot sustain the weight of accumulated contradictions.`,
  },

  // ── Behavioral Inertia ───────────────────────────────────────────────────
  {
    id: 'inertia_extreme',
    label: 'Extreme Behavioral Inertia',
    field: 'behaviorInertia.coefficient',
    trigger: '>=', value: 80,
    oneShot: false, cooldown: 20,
    color: '#f97316', severity: 'warning',
    text: (s) => `Behavioral inertia has reached extreme levels (${Math.round(s.behaviorInertia?.coefficient ?? 0)}%). Old behavioral patterns have become deeply entrenched. Paradigm shifts will have minimal immediate effect without facilitation measures.`,
  },

  // ── Epistemic Health ─────────────────────────────────────────────────────
  {
    id: 'eh_critical',
    label: 'Epistemic Health Critical',
    field: 'epistemicHealth',
    trigger: '<=', value: 25,
    oneShot: false, cooldown: 20,
    color: '#ef4444', severity: 'crisis',
    text: (s) => `Epistemic health is critically low (${Math.round(s.epistemicHealth ?? 50)}%). The information environment is severely compromised. Facilitation measures are largely ineffective and media campaigns risk becoming propaganda.`,
  },
];

// ── Pass 9: Cross-Civilization Behavioral Contagion ───────────────────────────
const CONTAGION_CONFIG = {
  baseRateScaling:          0.025,  // per-turn rate at tradeDep=100, attitude=+100, receptivity=1.0
  cynicismSpeedFactor:      0.55,   // cynicism spreads more slowly than cooperation
  ehSpeedFactor:            0.35,   // epistemic health is most structural — slowest
  minAttitudeFactor:        0.08,   // even hostile civs have minimal cultural bleed
  warDampeningFactor:       0.04,   // war almost halts cultural exchange
  contagionBurstThreshold:  30,     // when source-target gap > this AND attitude > 60, log a 'contagion_surge' event
};
