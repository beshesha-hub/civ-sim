// ============================================================
// npc.js - NPC model, pool generation, and interview responses
// ============================================================

class NPC {
  constructor(civ, options = {}) {
    this.id = Utils.uid();
    this.civId = civ.id;

    // Demographics
    this.name = this._generateName(civ);
    this.age = options.age || Utils.rand(18, 75);
    this.gender = Utils.randChoice(['person', 'woman', 'man', 'non-binary person']);

    // Social position (independent of how labels work in this civ)
    this.socialPosition = options.socialPosition || Utils.weightedChoice([
      { value: 'leader',      weight: 2 },
      { value: 'elite',       weight: 8 },
      { value: 'professional',weight: 20 },
      { value: 'laborer',     weight: 40 },
      { value: 'marginalized',weight: 30 },
    ]);

    // Economic status (0-100) - reflects their position in the economic structure
    this.economicStatus = this._computeEconomicStatus(civ);

    // In-hierarchy position (0-100)
    this.hierarchyPosition = this._computeHierarchyPosition(civ);

    // Empathy - reduced by power position
    this.empathy = this._computeEmpathy(civ);

    // Happiness / wellbeing
    this.happiness = this._computeHappiness(civ);

    // Religious affiliation
    this.religiousAffiliation = this._assignReligion(civ);
    this.religiousFervor = Utils.rand(10, 90);

    // Dominant behaviors (personal, influenced by civ but with individual variation)
    this.dominantBehaviors = this._computePersonalBehaviors(civ);

    // Personal history
    this.lifeEvents = this._generateLifeEvents(civ);

    // Personal details (marriage, children, health)
    const pd = this._generatePersonalDetails(civ);
    this.isMarried         = pd.isMarried;
    this.hasPartner        = pd.hasPartner;   // partnership without formal marriage
    this.numChildren       = pd.numChildren;
    this.healthStatus      = pd.healthStatus; // 'good', 'fair', 'poor'

    // Perceptions (generated fresh on interview)
    this._perceptionCache = null;
  }

  _generatePersonalDetails(civ) {
    const age          = this.age;
    const h            = this.happiness;
    const econId       = civ.economic ? civ.economic.modelId : 'market';
    const govId        = civ.governance ? civ.governance.modelId : 'representative';
    const collectivism = civ.state && civ.state.behaviorReinforcement
      ? (civ.state.behaviorReinforcement.collectivism || 50) : 50;

    // Marriage: more likely in older NPCs, formal marriage more common in hierarchical civs
    const marriageChance = age < 22 ? 0.10 : age < 30 ? 0.40 : age < 50 ? 0.70 : 0.60;
    const formalMarriage = govId === 'theocratic' || govId === 'autocratic' || govId === 'oligarchy' || govId === 'representative';
    const isMarried  = Math.random() < (formalMarriage ? marriageChance : marriageChance * 0.7);
    const hasPartner = !isMarried && Math.random() < (isMarried ? 0 : (age > 22 ? 0.35 : 0.15));

    // Children: must be at least 18 years older than youngest child; more in cooperative / high-collectivism civs
    const baseFertility = econId === 'gift' || econId === 'commons' ? 0.55 : 0.45;
    const canHaveKids   = age >= 22 && (isMarried || hasPartner || age > 30);
    const hasKids       = canHaveKids && Math.random() < (baseFertility + (collectivism - 50) / 200);
    const numChildren   = hasKids ? Utils.rand(1, age > 45 ? 5 : 3) : 0;

    // Health: correlated with happiness and wellbeing; worse in marginalized
    const wellbeing    = civ.state ? civ.state.averageWellbeing : 50;
    const baseHealth   = (h + wellbeing) / 2;
    const posModifier  = this.socialPosition === 'marginalized' ? -15
                        : this.socialPosition === 'laborer'     ?  -5
                        : this.socialPosition === 'elite' || this.socialPosition === 'leader' ? +10 : 0;
    const ageModifier  = age > 55 ? -15 : age > 40 ? -5 : 0;
    const healthScore  = baseHealth + posModifier + ageModifier;
    const healthStatus = healthScore > 62 ? 'good' : healthScore > 38 ? 'fair' : 'poor';

    return { isMarried, hasPartner, numChildren, healthStatus };
  }

  _generateName(civ) {
    const era = Utils.getEra(civ.foundingYear);
    let pool;
    if (era.id === 'prehistoric' || era.id === 'early_bronze' || era.id === 'bronze' || era.id === 'iron' || era.id === 'classical') {
      pool = NPC_NAME_POOL.forenames_ancient;
    } else if (era.id === 'medieval' || era.id === 'renaissance') {
      pool = NPC_NAME_POOL.forenames_medieval;
    } else if (era.id === 'modern' || era.id === 'contemporary' || era.id === 'future') {
      pool = NPC_NAME_POOL.forenames_modern;
    } else {
      pool = NPC_NAME_POOL.forenames_neutral;
    }

    const first = Utils.randChoice(pool);
    const last = Utils.randChoice(NPC_NAME_POOL.surnames);
    return `${first} ${last}`;
  }

  _computeEconomicStatus(civ) {
    const base = {
      leader:       Utils.rand(70, 95),
      elite:        Utils.rand(55, 85),
      professional: Utils.rand(40, 70),
      laborer:      Utils.rand(20, 55),
      marginalized: Utils.rand(5, 30),
    }[this.socialPosition] || 40;

    // In egalitarian economies, spread is narrower
    const wealthConcentration = civ.economic.wealthConcentration || 20;
    const compression = 1 - (100 - wealthConcentration) / 150;
    const midpoint = 50;
    return Utils.clamp(midpoint + (base - midpoint) * compression + Utils.randFloat(-5, 5), 0, 100);
  }

  _computeHierarchyPosition(civ) {
    if (civ.governance.hierarchyLevel < 10) return Utils.rand(45, 55); // flat: everyone near equal
    return {
      leader:       Utils.rand(80, 100),
      elite:        Utils.rand(60, 85),
      professional: Utils.rand(35, 65),
      laborer:      Utils.rand(15, 45),
      marginalized: Utils.rand(0, 25),
    }[this.socialPosition] || 30;
  }

  _computeEmpathy(civ) {
    let base = civ.state ? civ.state.empathyLevel : 60;
    // Power position suppresses empathy
    const powerSuppression = (this.hierarchyPosition / 100) * (civ.governance.powerConcentration / 100);
    base -= powerSuppression * 30;
    // Individual variation
    base += Utils.randFloat(-15, 15);
    return Utils.clamp(base, 5, 95);
  }

  _computeHappiness(civ) {
    let happiness = civ.state ? civ.state.averageWellbeing : 50;
    // Richer NPCs tend to be happier in acquisitive societies
    if (civ.economic.scarcityOrientation > 60) {
      happiness += (this.economicStatus - 50) * 0.3;
    } else {
      // In egalitarian societies, happiness is more evenly distributed
      happiness += Utils.randFloat(-10, 10);
    }
    return Utils.clamp(happiness + Utils.randFloat(-8, 8), 5, 95);
  }

  _assignReligion(civ) {
    const rel = civ.religion;
    if (rel.presence === 'none') return null;
    if (rel.religions && rel.religions.length > 0) {
      return Utils.randChoice(rel.religions).name || 'The Faith';
    }
    if (rel.presence === 'animist') return 'Animist Tradition';
    if (rel.presence === 'dominant') return Math.random() < 0.8 ? 'The Dominant Faith' : 'Minority Faith';
    if (rel.presence === 'theocratic') return 'The State Religion';
    if (rel.presence === 'plurality') return `Faith ${Utils.rand(1, 4)}`;
    return null;
  }

  _computePersonalBehaviors(civ) {
    const civBehaviors = civ.state ? civ.state.behaviorReinforcement : {};
    const personal = [];

    // Influenced by civ but individual variation
    const sorted = Object.entries(civBehaviors)
      .map(([k, v]) => ({ key: k, score: v + Utils.randFloat(-20, 20) }))
      .sort((a, b) => b.score - a.score);

    return sorted.slice(0, 3).map(x => x.key);
  }

  _generateLifeEvents(civ) {
    const events = [];
    const era = Utils.getEra(civ.foundingYear);
    const isHierarchical = civ.governance.hierarchyLevel > 50;
    const isMarket = civ.economic.modelId === 'market' || civ.economic.modelId === 'commodity';
    const hasReligion = civ.religion.presence !== 'none';

    const eventPools = [
      { condition: true, pool: [
        'Grew up in a close-knit family.',
        'Lost a parent at a young age.',
        'Moved from one place to another as a child.',
        'Had many siblings to help care for.',
        'Was educated by community elders.',
        'Learned their craft from a mentor.',
      ]},
      { condition: isHierarchical, pool: [
        'Struggled to access resources controlled by those above them.',
        'Benefited from connections to people in power.',
        'Was passed over for a role due to social standing.',
        'Witnessed injustice and felt powerless to change it.',
        'Rose in status through hard work and some luck.',
      ]},
      { condition: isMarket, pool: [
        'Went through a period of financial hardship.',
        'Found relative prosperity through trade.',
        'Watched neighbors lose everything in an economic downturn.',
        'Worked long hours to provide for their family.',
      ]},
      { condition: hasReligion, pool: [
        'Found deep meaning in their spiritual community.',
        'Questioned the faith they were raised in.',
        'Was comforted by their beliefs during a difficult period.',
        'Experienced tension between personal beliefs and official doctrine.',
      ]},
      { condition: civ.economic.modelId === 'gift' || civ.economic.modelId === 'commons', pool: [
        'Participated in a community project that improved everyone\'s lives.',
        'Helped care for sick neighbors as a community responsibility.',
        'Found deep meaning in collective work.',
        'Never worried about basic needs going unmet.',
      ]},
    ];

    for (const { condition, pool } of eventPools) {
      if (condition && Utils.randBool(0.6)) {
        events.push(Utils.randChoice(pool));
      }
    }

    // Age-based events
    if (this.age > 40) {
      events.push(Utils.randChoice([
        'Has seen the community change significantly over their lifetime.',
        'Has children of their own and thinks often about their future.',
        'Has lost friends and loved ones and thinks about legacy.',
        'Remembers harder times and appreciates what has improved.',
      ]));
    }

    return events.slice(0, 4);
  }

  // ── Perception Generation ─────────────────────────────────────
  getPerceptions(civ) {
    return {
      ofGovernance: this._perceptionGovernance(civ),
      ofEconomy:    this._perceptionEconomy(civ),
      ofReligion:   this._perceptionReligion(civ),
      ofLifeQuality:this._perceptionLifeQuality(civ),
      ofFuture:     this._perceptionFuture(civ),
      ofPower:      this._perceptionPower(civ),
      ofCommunity:  this._perceptionCommunity(civ),
      ofChange:     this._perceptionChange(civ),
    };
  }

  _perceptionGovernance(civ) {
    const gov = civ.governance;
    const pos = this.socialPosition;
    const isBeneficiary = pos === 'leader' || pos === 'elite';

    if (gov.modelId === 'flat_consensus' || gov.modelId === 'none') {
      return Utils.randChoice([
        'Decisions take time, but everyone has a voice. I wouldn\'t trade that.',
        'We argue a lot, but the arguing itself means nobody is being ignored.',
        'Sometimes I wish someone would just decide. But then I remember what that looks like.',
      ]);
    }
    if (gov.modelId === 'autocratic' || gov.modelId === 'oligarchy') {
      if (isBeneficiary) {
        return Utils.randChoice([
          'Order is essential. Without strong leadership, everything falls apart.',
          'The people in charge have worked hard for what they have. They understand what\'s needed.',
          'It\'s not a perfect system. But what system is?',
        ]);
      }
      return Utils.randChoice([
        'I do what I\'m told. I\'ve learned it\'s easier that way.',
        'The decisions are made far above me. My opinion doesn\'t reach there.',
        'It works for those at the top. For the rest of us, we manage.',
        'There\'s a gap between what\'s announced and what actually happens.',
      ]);
    }
    if (gov.modelId === 'theocratic') {
      if (this.religiousFervor > 60) {
        return Utils.randChoice([
          'Our leaders carry the divine mandate. I trust in that.',
          'The laws we live by come from something greater than any one person.',
        ]);
      }
      return Utils.randChoice([
        'I believe in my own way. The official doctrine doesn\'t always match my experience.',
        'I keep my doubts private. It\'s safer.',
      ]);
    }
    if (gov.modelId === 'representative') {
      return Utils.randChoice([
        'I vote. I\'m not sure my vote reaches where I intend it to, but I vote.',
        'The representatives try. Whether they represent me specifically — that\'s another question.',
        'Better than many alternatives. I\'ve read enough history to know that.',
      ]);
    }
    // Generic fallback — position-specific so it's never one bland line
    const pos2 = this.socialPosition;
    if (pos2 === 'marginalized') return Utils.randChoice([
      'The structure here wasn\'t designed with people like me in mind. I navigate it anyway.',
      'How decisions get made — I\'m at the receiving end of them, not the making end.',
      'I don\'t have much say. That\'s not a complaint so much as a fact I work around.',
    ]);
    if (pos2 === 'laborer') return Utils.randChoice([
      'The system works for the people who built it. I make do within the parts that reach me.',
      'I don\'t make the rules. I follow them, or work around them when they\'re unreasonable.',
      'The governance here — it\'s above my level. I see its effects more than its mechanisms.',
    ]);
    if (pos2 === 'professional') return Utils.randChoice([
      'I see how decisions get made from close enough to notice the gap between intention and result.',
      'The structure functions. Whether it functions well is a more interesting question.',
      'I work within it and occasionally push against it when I think I can shift something.',
    ]);
    if (pos2 === 'elite') return Utils.randChoice([
      'The arrangement serves me reasonably well. Whether it serves everyone else is a question I think about more than I used to.',
      'I have access to the mechanisms others don\'t. Whether they\'re used well — that\'s the real measure.',
    ]);
    if (pos2 === 'leader') return Utils.randChoice([
      'I\'m part of how it functions, which makes it harder to evaluate from the outside.',
      'Any system looks different from inside it. I try to stay honest about that.',
    ]);
    return 'The way things are organized — I live within it. Sometimes it serves me, sometimes it doesn\'t.';
  }

  _perceptionEconomy(civ) {
    const econ = civ.economic;
    const status = this.economicStatus;

    if (econ.modelId === 'gift') {
      return Utils.randChoice([
        'We give what we can and take what we need. It sounds simple because it is.',
        'I\'ve never had to worry about being without. The community makes sure of that.',
        'It asks something of me — to give freely. But I get back more than I give.',
      ]);
    }
    if (econ.modelId === 'market') {
      if (status > 65) {
        return Utils.randChoice([
          'The market rewards effort and ingenuity. I\'ve done well by it.',
          'It\'s not fair in any absolute sense. But it creates incentives that move things forward.',
        ]);
      }
      if (status < 35) {
        return Utils.randChoice([
          'I work as hard as anyone I know. The results don\'t always reflect that.',
          'The system feels like it was designed by people who already had something.',
          'There\'s a story they tell about how it works. My life tells a different story.',
        ]);
      }
      return 'It has its advantages and its costs. I navigate it the best I can.';
    }
    if (econ.modelId === 'commons') {
      return Utils.randChoice([
        'What we hold together is stronger than what any of us holds alone.',
        'Nobody gets rich. Nobody goes without. That feels like the right trade.',
        'Managing shared resources is harder than it sounds. But we do it.',
      ]);
    }
    if (econ.modelId === 'barter') {
      return Utils.randChoice([
        'I know the value of what I produce. I can see it in what I receive for it.',
        'It\'s personal. You know who you\'re trading with.',
        'It limits what you can plan for. You need the right person at the right time.',
      ]);
    }
    if (econ.modelId === 'labor_credit') {
      return Utils.randChoice([
        'An hour of my time equals an hour of anyone else\'s. I find that right.',
        'It values the work, not just the output. That matters to me.',
      ]);
    }
    return `The economy works for some of us better than others. ${status > 50 ? 'I\'ve been fortunate.' : 'I manage.'}`;
  }

  _perceptionReligion(civ) {
    const rel = civ.religion;
    if (rel.presence === 'none') {
      return Utils.randChoice([
        'I find meaning in relationships, in the work I do, in the world around me.',
        'I don\'t need a doctrine to know what I value.',
        'I\'m curious about how others find meaning. My path is my own.',
      ]);
    }
    if (this.religiousAffiliation) {
      if (this.religiousFervor > 70) {
        return Utils.randChoice([
          `My faith is the center of everything. It shapes how I see the world.`,
          `${this.religiousAffiliation} gives me something no material thing can — a sense of purpose.`,
          'Without it, I think I\'d feel lost. It\'s the ground I stand on.',
        ]);
      }
      if (this.religiousFervor < 30) {
        return Utils.randChoice([
          'I was raised in it. Some of it still speaks to me. Some of it I\'ve let go.',
          'I participate in the community aspects. The doctrine — I hold it loosely.',
          'I respect those for whom it\'s everything. For me it\'s more of a background.',
        ]);
      }
      return `I practice ${this.religiousAffiliation}. It gives me a framework. I interpret it in my own way.`;
    }
    return 'I\'m not part of the dominant faith. My experience of the world is somewhat different because of that.';
  }

  _perceptionLifeQuality(civ) {
    const h = this.happiness;
    if (h > 75) return Utils.randChoice([
      'I have what I need and more. I\'m grateful for that — I know it\'s not everyone\'s experience.',
      'Life isn\'t without difficulty. But on balance, I feel fortunate.',
      'The community around me is what makes it good. I belong here.',
    ]);
    if (h > 50) return Utils.randChoice([
      'It has its challenges. I find satisfaction in the day-to-day.',
      'Some things are hard. But I manage, and there are good things too.',
      'I\'ve known better times and worse times. This is somewhere in the middle.',
    ]);
    if (h > 30) return Utils.randChoice([
      'There are things I wish were different. The gap between what\'s possible and what is — I feel it.',
      'I get by. I\'d be lying if I said I didn\'t want more.',
      'The basic needs are met, mostly. The other things — meaning, dignity — those are harder.',
    ]);
    return Utils.randChoice([
      'It\'s hard. I won\'t pretend otherwise.',
      'I survive. I don\'t know if that\'s the same as living.',
      'There are days I see what others have and wonder what I\'m doing wrong. Then I wonder if it\'s me at all.',
    ]);
  }

  _perceptionFuture(civ) {
    const wellbeing = civ.state ? civ.state.averageWellbeing : 50;
    const warming = civ.state ? civ.state.globalWarmingContribution : 0;

    if (warming > 10) {
      return Utils.randChoice([
        'I worry about the climate. The signs are there. Whether we act — that\'s a different question.',
        'My children\'s world will be different. I think about that more than anything.',
        'There are things we\'ve done to the land that I\'m not sure we can undo.',
      ]);
    }
    if (wellbeing > 65) {
      return Utils.randChoice([
        'I\'m cautiously hopeful. There\'s good work being done here.',
        'If we can hold onto what we\'ve built, I think the next generation will be okay.',
        'There are things to fix. I believe we can fix them.',
      ]);
    }
    return Utils.randChoice([
      'I hope for change. Whether it comes — I don\'t know.',
      'The future is uncertain. I try not to think too far ahead.',
      'I\'d like to believe things will improve. Some days I do.',
    ]);
  }

  _perceptionPower(civ) {
    const gov    = civ.governance;
    const pos    = this.socialPosition;
    const wc     = civ.state?.wealthCapture ?? {};
    const deg    = wc.degree ?? 0;
    const feudal = wc.feudalDynamic ?? false;

    if (feudal && (pos === 'marginalized' || pos === 'laborer')) {
      return Utils.randChoice([
        'The formal structure of governance and the actual structure of power have very little to do with each other. I\'ve learned to look past one to understand the other.',
        'There is a formal answer to your question about power. Then there is the actual answer. They are different. I\'ve lived long enough to know the difference.',
      ]);
    }
    if (deg > 60 && (pos === 'marginalized' || pos === 'laborer')) {
      return Utils.randChoice([
        'I have very little power over the things that affect my life most. Most of those decisions are made by people who are accountable to money, not to people like me.',
        'The decisions that matter most to me are made by people who don\'t know me and whose economic interests are not aligned with mine. That\'s the honest answer.',
        'I participate where I can. The bigger structures — I understand them well enough to know I can\'t reach them from where I stand.',
      ]);
    }
    if (gov.hierarchyLevel < 15) {
      return Utils.randChoice([
        'I have as much say as anyone here. That\'s not nothing.',
        'My voice matters. I\'ve seen it change things.',
        'Power here is shared. It\'s not perfect, but it\'s more accountable.',
      ]);
    }
    if (pos === 'marginalized' || pos === 'laborer') {
      return Utils.randChoice([
        'I have very little power over the things that affect my life most.',
        'The decisions that matter most to me are made by people who don\'t know me.',
        'I participate where I can. The bigger structures — I can\'t reach those.',
        'I\'ve stopped expecting to be consulted. I focus on what I can control directly.',
      ]);
    }
    if (pos === 'leader' || pos === 'elite') {
      if (this.empathy > 60) {
        return Utils.randChoice([
          'I try to use what influence I have responsibly. It\'s a weight I feel.',
          'The higher you go, the easier it is to lose touch. I try to stay grounded.',
        ]);
      }
      return Utils.randChoice([
        'I\'ve earned my position. I make decisions that have to be made.',
        'Power requires decisiveness. Not everyone will agree. That\'s acceptable.',
      ]);
    }
    return 'I have some influence in my immediate sphere. Beyond that, it\'s limited.';
  }

  _perceptionCommunity(civ) {
    const b = civ.state ? civ.state.behaviorReinforcement : {};
    const cooperation = b.cooperation || 50;
    const mutualAid = b.mutualAid || 50;

    if (cooperation > 70 || mutualAid > 70) {
      return Utils.randChoice([
        'We look out for each other here. That\'s the norm, not the exception.',
        'When something goes wrong, people show up. That\'s something I count on.',
        'The relationships I have here are what give this place meaning.',
      ]);
    }
    if (cooperation < 35) {
      return Utils.randChoice([
        'People here are friendly enough. But they\'re mostly looking out for themselves.',
        'There\'s connection, but it has limits. People don\'t want to be obligated.',
        'The competition can be exhausting. It colors how you relate to people.',
      ]);
    }
    return Utils.randChoice([
      'It\'s a mixed community. Some people I\'d trust with anything. Others, less so.',
      'We cooperate when it makes sense. We keep to ourselves otherwise.',
      'Community here is real but complicated. Like most real things.',
    ]);
  }

  _perceptionChange(civ) {
    const conformity = civ.state ? civ.state.behaviorReinforcement.conformity : 50;
    const innovation = civ.state ? civ.state.behaviorReinforcement.innovation : 50;

    // Pass 7: cultural gap + cynicism + revolutionary consciousness
    const cg       = civ.state?.culturalGap ?? {};
    const gapScore = cg.gapScore  ?? 0;
    const cynicism = cg.cynicismLevel ?? 0;
    const rc       = cg.paradigmShiftReadiness ?? 0;

    if (conformity > 70) {
      if (this.socialPosition === 'leader' || this.socialPosition === 'elite') {
        return 'What we have works. Change for its own sake unsettles things that don\'t need unsettling.';
      }
      return Utils.randChoice([
        'I\'d like some things to change. But I\'ve learned not to say it too loudly.',
        'Change is slow here. People are cautious. Sometimes I wonder if we\'re too cautious.',
      ]);
    }
    if (innovation > 65) {
      return Utils.randChoice([
        'We\'re good at questioning assumptions here. That keeps things alive.',
        'Change is welcome here, mostly. It can be unsettling, but stagnation is worse.',
        'What I\'d most like to see change? The things that were never working in the first place.',
      ]);
    }

    // High cynicism + wide cultural gap
    if (cynicism > 70 && gapScore > 60) {
      if (this.socialPosition === 'leader' || this.socialPosition === 'elite') {
        return 'People mistake cynicism for apathy. We benefit from that mistake.';
      }
      if (rc > 65) {
        return Utils.randChoice([
          'We\'ve seen what they say and what they do. The gap between them is where the real story lives.',
          'People aren\'t asleep anymore. Something is building — I can feel it.',
          'I don\'t think it\'s a question of if. I think it\'s a question of when, and who controls how.',
        ]);
      }
      return Utils.randChoice([
        'I stopped believing the system would fix itself. That\'s not despair — that\'s clarity.',
        'They talk about change every cycle. The incentives never change. The talk is the distraction.',
        'What would I change? The assumption that the people running things want what I want.',
      ]);
    }

    // Moderate cynicism + noticeable gap
    if (cynicism > 45 && gapScore > 40) {
      return Utils.randChoice([
        'I\'d like to believe change is possible. I\'ve just seen a lot of promises go nowhere.',
        'The things that most need changing are what the people in charge benefit from keeping.',
        'There\'s a difference between changing who\'s in charge and changing how the whole thing works.',
      ]);
    }

    return 'There are things I\'d change. Whether they\'ll change — that depends on more than me.';
  }
}

// ── NPC Pool Generation ───────────────────────────────────────
function generateNPCPool(civ, size = CONFIG.NPC_POOL_SIZE) {
  const pool = [];

  // Ensure representation across social positions
  const distribution = [
    { position: 'leader',       count: 1 },
    { position: 'elite',        count: Math.floor(size * 0.08) },
    { position: 'professional', count: Math.floor(size * 0.20) },
    { position: 'laborer',      count: Math.floor(size * 0.40) },
    { position: 'marginalized', count: Math.floor(size * 0.25) },
  ];

  // Adjust distribution based on governance
  if (civ.governance.hierarchyLevel < 15) {
    // Flat society: no leaders/marginalized, more professionals
    distribution[0].count = 0;
    distribution[1].count = 0;
    distribution[4].count = 1;
    distribution[2].count = Math.floor(size * 0.5);
    distribution[3].count = Math.floor(size * 0.45);
  }

  for (const { position, count } of distribution) {
    for (let i = 0; i < count; i++) {
      pool.push(new NPC(civ, {
        socialPosition: position,
        age: Utils.rand(position === 'leader' ? 35 : 18, 75),
      }));
    }
  }

  // Fill remaining slots randomly
  while (pool.length < size) {
    pool.push(new NPC(civ));
  }

  return pool;
}

// ── Interview Engine ──────────────────────────────────────────
const InterviewEngine = {
  // Build prompt for LLM mode
  buildLLMPrompt(npc, civ, question, conversationHistory) {
    const era = Utils.getEra(civ.foundingYear);
    const perceptions = npc.getPerceptions(civ);
    const langInstruction = (typeof I18N !== 'undefined') ? I18N.llmInstruction() : 'Respond in English.';

    return `You are roleplaying as ${npc.name}, a ${npc.age}-year-old ${npc.gender} living in ${civ.name}.

CIVILIZATION CONTEXT:
- Era: ${era.label} civilization
- Economic system: ${civ.economic.model.label} — ${civ.economic.model.description}
- Governance: ${civ.governance.model.label}
- Religion: ${civ.religion.presence === 'none' ? 'No formal religion' : civ.religion.presence}
- Dominant behaviors reinforced by society: ${civ.state.dominantBehaviors.join(', ')}
- Average wellbeing index: ${Math.round(civ.state.averageWellbeing)}/100
- Equality index: ${Math.round(civ.state.equalityIndex)}/100

YOUR CHARACTER:
- Social position: ${npc.socialPosition}
- Economic status: ${Math.round(npc.economicStatus)}/100
- Empathy level: ${Math.round(npc.empathy)}/100
- Happiness: ${Math.round(npc.happiness)}/100
- Religious affiliation: ${npc.religiousAffiliation || 'none'}
- Personal history: ${npc.lifeEvents.join(' ')}
- Dominant personal behaviors: ${npc.dominantBehaviors.join(', ')}

YOUR ESTABLISHED PERCEPTIONS:
- Of governance: "${perceptions.ofGovernance}"
- Of economic life: "${perceptions.ofEconomy}"
- Of community: "${perceptions.ofCommunity}"
- Of life quality: "${perceptions.ofLifeQuality}"

INSTRUCTIONS:
${langInstruction}
Respond as this person would actually speak — in their own voice, shaped by their actual life experience in this civilization.
Be authentic to their social position and the behaviors their society reinforces.
Do not use modern psychological or sociological jargon unless the era warrants it.
Keep response to 2-4 sentences. Be specific and personal, not generic.
Do not break character or reference that you are an AI.
If the question is unclear or outside this person's knowledge, have them honestly say they don't know or haven't thought about it, in character.
IMPORTANT: Respond ONLY as ${npc.name}. Output ONLY their reply — do NOT write the interviewer's lines or continue the conversation.

${conversationHistory.length > 0 ? 'PREVIOUS CONVERSATION:\n' + conversationHistory.map(m => `${m.role === 'user' ? 'Interviewer' : npc.name}: ${m.content}`).join('\n') + '\n' : ''}
Interviewer: ${question}
${npc.name}:`;
  },

  // Rule-based response — question-aware and context-sensitive
  getRuleBasedResponse(npc, civ, question, categoryId, conversationHistory = [], gameYear = 0) {
    const q = question.toLowerCase().trim();
    const intent = this._detectIntent(q, categoryId, civ);
    const prevNPCLines = conversationHistory.filter(m => m.role === 'npc').map(m => m.content);
    const prevUserLines = conversationHistory.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const askerContext = this._detectAskerContext([...prevUserLines, q]);
    return this._generateResponse(npc, civ, intent, q, prevNPCLines, prevUserLines, askerContext, gameYear);
  },

  // ── Religious Term Resolver ────────────────────────────────────
  // Returns the appropriate divine term for speech ("God", "the Gods",
  // "the Goddess", "the Spirits", a proper deity name, etc.)
  // Returns null for non-theistic traditions (Buddhism, secular philosophies).
  _getReligiousTerm(npc, civ) {
    const affil   = npc.religiousAffiliation || '';
    const nameLow = affil.toLowerCase();
    const presence = (civ.religion && civ.religion.presence) ? civ.religion.presence : '';

    // Animist / nature spirit traditions
    if (presence === 'animist' ||
        /animis|spirit(s)?\b|ancestor|shaman|totem|nature.*spirit|earth.*spirit|forest.*spirit/i.test(nameLow)) {
      return Utils.randChoice(['the Spirits', 'the Ancestors', 'the Spirit World', 'the Spirits of our ancestors']);
    }

    // Goddess-focused traditions
    if (/goddess|earth.?mother|great.?mother|wicca|moon.?goddess|lunar|fertility.*goddess/i.test(nameLow)) {
      return 'the Goddess';
    }

    // Polytheistic / pantheon traditions
    if (/\bgods\b|pantheon|olymp|polytheist|many gods|old gods|norse|greek|roman|vedic|hindu(?!ism)|pagan/i.test(nameLow)) {
      return Utils.randChoice(['the Gods', 'the Gods above', 'the divine powers']);
    }

    // Non-theistic: Buddhism, Taoism, secular philosophy — skip deity references
    if (/buddh|dharma|nirvana|tao(?:ism)?\b|secular|enlighten(?:ment)?\b/i.test(nameLow)) {
      return null;
    }

    // Monotheistic traditions — Islam, Christianity, Judaism, etc.
    if (/islam|muslim|allah/i.test(nameLow)) return 'God';
    if (/christian|church|holy\s*(spirit|ghost|cross)|jesuit|protestant|catholic|orthodox|lord god|son of god/i.test(nameLow)) return 'God';
    if (/judai|torah|yahweh/i.test(nameLow)) return 'God';
    if (/monothe|\bone\s*god\b|the.*lord\b/i.test(nameLow)) return 'God';

    // Generic monotheistic-sounding names ("The Primary Faith", "Faith of the Light")
    if (/\bfaith\b|\bbelief\b|\bthe\s+way\b|\bpath\b|\blight\b|\bholy\b|\bsacred\b|\bdivine\b|\btruth\b/i.test(nameLow)) {
      return 'God';
    }

    // Nature / river / ancestral named traditions
    if (/\briver\b|\bsea\b|\bocean\b|\bforest\b|\bfire\b|\bsun\b|\bmoon\b|\bearth\b|\bwind\b|\bstorm\b/i.test(nameLow)) {
      return Utils.randChoice(['the Spirits', 'the Powers of the Earth', 'the Gods']);
    }

    // If the religion name is short and looks like an actual deity name (e.g. "Odin", "Athena")
    const words = affil.trim().split(/\s+/);
    if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) {
      return words[0]; // use the deity name directly
    }

    // Fallback: generic sacred term
    return Utils.randChoice(['the divine', 'the sacred', 'a higher power']);
  },

  // ── Asker Context Detection ───────────────────────────────────
  // Returns 'leader', 'fellow', 'stranger', or 'general'
  _detectAskerContext(allLines) {
    const s = allLines.join(' ');
    if (/\b(i am (a |your |the )?leader|as (your|the|a) leader|i represent (the|our)|i'?m in (leadership|charge|authority)|on behalf of (leadership|the leadership)|speaking as (a |the )?leader|i have (power|authority)|i'?m one of (the |your )?leaders)\b/.test(s)) return 'leader';
    if (/\b(i'?m (also )?(from here|one of you|a fellow|a neighbor|a resident)|i live here (too|as well)|fellow citizen|one of us|i'?m part of this (community|civilization|society)|as a fellow|i also live here|we'?re (both|all) in this|you know how it is here|i'?m also (a citizen|living here))\b/.test(s)) return 'fellow';
    if (/\b(i'?m (visiting|a visitor|a traveler|from outside|not from here|passing through|an outsider|a stranger)|i come from (elsewhere|another|outside)|from (outside|afar|another place)|i don't live here|just (passing|visiting|traveling)|i'?m (new here|not from around here))\b/.test(s)) return 'stranger';
    return 'general';
  },

  // ── Emotional Tone Detection ──────────────────────────────────
  // Returns 'distress' | 'gratitude' | 'pride' | 'anxiety' | null
  // Called inside _generateResponse with already-computed context vars.
  _detectEmotionalTone(npc, civ, intent, q, techLevel, h, pos) {
    const wellbeing = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
    const lifeEv    = npc.lifeEvents.join(' ');

    // ── DISTRESS ─────────────────────────────────────────────
    const distress =
      intent === 'mortality'                                                            ||
      (intent === 'health'     && npc.healthStatus === 'poor')                         ||
      (intent === 'economy'    && npc.economicStatus < 22)                             ||
      (intent === 'conditions' && wellbeing < 28)                                      ||
      (intent === 'marriage'   && /widow|lost.*partner|partner.*died/i.test(lifeEv))   ||
      (pos === 'marginalized'  && ['governance', 'economy', 'conditions'].includes(intent));

    // ── GRATITUDE / JOY ───────────────────────────────────────
    const gratitude =
      (intent === 'conditions'      && wellbeing > 68)                                 ||
      (intent === 'future'          && wellbeing > 68)                                 ||
      (intent === 'health'          && npc.healthStatus === 'good' && h > 58)          ||
      (intent === 'daily_life'      && wellbeing > 65 && techLevel <= 6)               ||
      (intent === 'children_status' && npc.numChildren > 0 && h > 65)                 ||
      /\b(grateful|thankful|bless|bounti|abundant|abundance|good harvest|harvest.*well)\b/.test(q);

    // ── PRIDE ────────────────────────────────────────────────
    const pride =
      /\b(proud|pride|honor|honour|glory|achiev|accomplish|your.*people|your.*civiliz|your.*nation|your.*homeland|your country|your community)\b/.test(q) ||
      (intent === 'community'       && pos === 'leader' && wellbeing > 50)             ||
      (intent === 'governance'      && pos === 'leader' && wellbeing > 55)             ||
      (intent === 'children_status' && npc.numChildren > 0 && h > 55 && h <= 65)      ||
      (intent === 'religion'        && npc.religiousAffiliation && h > 55)             ||
      (intent === 'daily_life'      && pos === 'leader'  && wellbeing > 60);

    // ── ANXIETY / WORRY ───────────────────────────────────────
    const anxiety =
      (intent === 'future'     && wellbeing < 45)                                      ||
      (intent === 'challenges' && wellbeing < 48)                                      ||
      (intent === 'daily_life' && techLevel <= 5 && wellbeing < 50)                   ||
      (intent === 'conditions' && wellbeing >= 28 && wellbeing < 45)                  ||
      (/\b(crop|harvest|food|winter|drought|famine|starv|freeze|enough to eat)\b/.test(q) && techLevel <= 7);

    // Priority: distress > gratitude > pride > anxiety
    if (distress  && Math.random() < 0.55) return 'distress';
    if (gratitude && Math.random() < 0.48) return 'gratitude';
    if (pride     && Math.random() < 0.48) return 'pride';
    if (anxiety   && Math.random() < 0.48) return 'anxiety';
    return null;
  },

  // ── Intent Detection ─────────────────────────────────────────
  _detectIntent(q, categoryId, civ) {
    // Self-introduction — player tells NPC their own name (must come before generic greeting)
    if (/\bmy name is [a-z]+\b/.test(q) || /\bcall me [a-z]+\b/.test(q) ||
        (/\b(i'?m|i am) [a-z]+\b/.test(q) && /\b(hi\b|hello\b|hey\b|greet|nice to meet|pleased to meet|let me introduce|introducing myself)\b/.test(q))) return 'self_intro';
    if (/\b(hello|hi\b|good (day|morning|evening|afternoon)|greetings|nice to meet|can i ask|few questions|like to ask|mind if i|may i ask|want to talk|speak with you)\b/.test(q)) return 'greeting';
    // Health must come before how_are_you so "how is your health" routes specifically
    if (/\b(health\b|healthy|sick\b|ill\b|illness|disease\b|ailing|infirm|physical(ly)?|body\b|injury|injured|pain\b|ailment|condition\b|unwell|wellness|well-being|chronic)\b/.test(q)) return 'health';
    if (/\b(how are you|how do you feel|you (doing|feeling|been)|are you (well|okay|all right)|how'?s (life|everything|things))\b/.test(q)) return 'how_are_you';
    if (/\b(what do you mean|what did you mean|can you (explain|elaborate|say more)|tell me more|go on|and (then|what)|more about that|clarify|what exactly)\b/.test(q)) return 'clarify';
    if (/\b(mortal(ity)?|death|dying|die\b|mourn(ing)?|grief|grieving|losing (someone|people|a loved|your)|pass(ed)? away|gone|bereavement)\b/.test(q)) return 'mortality';
    // Marriage / relationship status — before generic family so "are you married?" routes specifically
    if (/\b(marr(ied|y|iage)|single\b|wed(ded)?|divorce(d)?|widowed|widow(er)?|relationship status|are you (in a relationship|with someone|together with)|do you have a (partner|spouse|husband|wife|boyfriend|girlfriend)|love life|romantic)\b/.test(q)) return 'marriage';
    // Children status — before generic family
    if (/\b(do you have (kids|children|a child|a son|a daughter)|any (kids|children)|how many (kids|children)|are you a (parent|mother|father)|do you have (offspring|little ones))\b/.test(q)) return 'children_status';
    if (/\b(mother|father|parent(s)?|child(ren)?|son\b|daughter|sibling|brother|sister|family|spouse|husband|wife|partner|grandparent|grandmother|grandfather|loved one)\b/.test(q)) return 'family';
    if (/\b(what (do you want|would you want|do you wish|do you need|would you like|more|else)|wish for|hope (to have|for yourself)|desire\b|long for|lack\b|missing from|what('s| is) lacking)\b/.test(q)) return 'desires';
    if (/\b(happ(y|iness)|content(ed|ment)?|satisfied|satisfaction|joy(ful)?|fulfilled|fulfillment|unhapp(y|iness)|sad(ness)?|miserable|pleasure|suffering|at peace)\b/.test(q)) return 'happiness';
    // ── New system intents — must come before daily_life/work/economy to avoid keyword overlap ──
    if (/\b(environment(al)?|ecology|ecological|pollution|pollut(ed|ing|ant)|toxic|contamina|smog|waste\b|deforest(ation)?|forest(s)? (disappear|shrink|gone|lost|dying|cut|clearing)|biodiversity|species (loss|extinct|dying|disappear)|ocean (health|acidif|dying|pollut)|coral|overfishing|soil (erosion|degrad|deplet|exhaust)|water (shortage|scarcity|crisis|pollut|contaminat)|air quality|clean (air|water)|nature\b|natural world|ecosystem|habitat (loss|destruct)|the land is (dying|suffering|degrading))\b/i.test(q)) return 'environment';
    if (/\b(climate\b|climate change|global warming|temperature (rising|rise|increas)|weather.*(extreme|disaster|worse|changing|unpredictable)|extreme weather|flood(s|ing)?|drought(s)?|wildfire(s)?|fire(s)? (burn|spread|destroy|devastat)|heat wave|hurricane(s)?|cyclone|typhoon|sea level|ice (cap|sheet|melt|glacier)|glacier(s)? (melt|disappear|retreat|gone|shrink))\b/i.test(q)) return 'climate';
    if (/\b(pandemic(s)?|epidemic(s)?|virus\b|plague\b|contagion|infectious (disease|outbreak)|outbreak\b|quarantine|lockdown|spread(ing)? (disease|sickness|illness)|sick(ness)? (spread|everywhere)|disease (sweep|ravag|devastat))\b/i.test(q)) return 'pandemic';
    if (/\b(civil war|internal (war|conflict)|rebellion\b|insurgenc(y|ies)|uprising|revolt\b|fighting (among|between|within) (ourselves|our own|our people|citizens)|brother against brother|faction(s|al)? (war|fighting|conflict|violence)|sectarian (violence|conflict|war)|separatist|secession|domestic (conflict|war|violence))\b/i.test(q)) return 'civil_war';
    if (/\b(nuclear (war|weapons?|bomb|attack|strike|holocaust|winter|fallout|threat|arsenal|annihilat)|atomic (bomb|weapons?|war)|mushroom cloud|mutually assured|MAD\b|arms race|warhead|missile (launch|strike|attack)|doomsday|armageddon)\b/i.test(q)) return 'nuclear';
    if (/\b(disinformation|misinformation|fake news|propaganda\b|information warfare|media manipulation|post-truth|troll (farm|army|bot)|bot(s)? (spread|post|amplif)|deepfake|manufactured (consent|narrative)|narrative warfare|truth (decay|erosion)|epistemic|can'?t (tell|know) what'?s (true|real)|who (do you|can you|should i) (trust|believe)|everything is (a lie|fake|manipulated)|alternative facts)\b/i.test(q)) return 'disinformation';
    if (/\b(artificial intelligence|AI\b|machine(s)? (replac|taking|steal|do our)|robot(s)? (replac|taking|steal)|automat(ion|ed|ing)|job(s)? (disappear|replac|lost|gone|taken by|automat)|technological unemployment|will (machines|robots|AI|computers) (replace|take)|algorithm(s)? (control|decid|run)|singularity)\b/i.test(q)) return 'ai_disruption';
    if (/\b(trade (network|route|war|partner|agreement|deal|block|embargo|sanction)|global(ization|ised|ized| trade)|supply chain|import(s|ing)?|export(s|ing)?|free trade|tariff(s)?|economic (sanction|embargo|blockade)|silk road|trade (with other|between|affect)|international trade|commercial (ties|network|partner))\b/i.test(q)) return 'trade';
    if (/\b(city (vs|versus|and) (country|rural|village)|urban.rural (divide|gap|split|tension)|rural (decline|decay|abandonment|poverty|neglect)|left behind|forgotten (town|village|communit|people|region)|small town(s)?|countryside (dying|empty|neglect|abandoned)|brain drain|young (people|folk) (leav|mov|gone) (to the city|to urban)|two (different )?(countr|world|societ|realit)|metropolitan (elite|bubble))\b/i.test(q)) return 'urban_rural';
    if (/\b(typical day|daily life|every(day| day)|routine|morning|what do you do (all day|each day)|ordinary day|day to day|how do you spend)\b/.test(q)) return 'daily_life';
    if (/\b(work\b|job\b|occupation|labor|livelihood|earn(ing)?|living\b|craft\b|trade\b|profession|vocation|what (you do|do you do)|how do you (earn|make a living))\b/.test(q)) return 'work';
    // Challenges of the era — before governance so "what are the greatest challenges here?" routes specifically
    if (/\b(biggest (challenge|problem|struggle|issue)|most (important|pressing|urgent|critical) (challenge|problem|issue|need|concern)|challenge(s)? of (your|the|this|our) (time|era|age|day|generation)|what (does|do) (your|the|this|our|this) (society|civilization|people|community|world) (face|struggle with|contend with)|what (times are these|era are we in|test(s)? this|trial(s)?)|great(est)? (challenge|struggle|test|trial|hardship)|what (worries|concerns|troubles) (you most|people|everyone|the community)|main (difficulty|difficulties|hardship|obstacle)|state of (the world|things here)|how (hard|difficult|trying) are (times|things|life) (here|now|these days)?|what (threatens|endangers|imperils)|greatest (need|crisis|threat|danger)|what must (we|you|this society) overcome)\b/.test(q)) return 'challenges';
    // Community conditions — how things are broadly in this society
    if (/\b(how (are|is) (things|conditions|life|it|the situation) (here|in this|around here|in your community|in your society|in your civilization|in this place|for people here)?|what (is|are) (conditions|things) like (here|in this|around here)?|state of (this community|your community|this society|your society)|how (is|are) (your|the|this) (community|society|civilization) doing|what (is|are) (life|things|conditions) like here)\b/.test(q)) return 'conditions';
    // Suggestions must come before governance/economy/community so "what would you change about governance?" routes to suggestions
    if (/\b(suggest(ion|ions)?|advice\b|advise\b|complain(t|ts|ing)?|grievance(s)?|gripe(s)?|criticism|critique|dissatisfi(ed|action)|what (would you change|should (we|you) (change|do|fix)|bothers you|annoys you|frustrates you|do you (dislike|hate|resent)|could (be better|be improved|be different)|don'?t you like|do you wish (was|were) different|needs to change|are the problems?|are the issues?|are your concerns?|is (the problem|not working|not right|wrong|unfair|unjust|broken|lacking|missing))|make (things|it|life|this) better|what('?s| is) (wrong|not working|broken|lacking|missing|the problem|unfair|unjust|your complaint|your concern|your issue)\b|do differently|what would (you )?fix|your (input|feedback|complaint(s)?|criticism|grievance)|what needs (fixing|attention|improvement|to change)|what (would help|do you (recommend|advise|suggest)|bothers|frustrates|concerns|upsets)|as (your |a |the )?(leader|authority)\b|i'?m in (leadership|charge|authority)|on behalf of (leadership|the leadership)|problem(s)? (here|with this|i see)|issue(s)? (here|with this|i see)|concern(s)? (here|about this)|frustrat(e|ed|ing|ion)\b)\b/.test(q)) return 'suggestions';
    if (/\b(govern(ment|ance|ing)?|leader(ship|s)?|authority|rule\b|decision(s|-making)|politic(s|al)|law(s)?\b|who decides|who'?s in charge|vote|voting|voice\b|have a say)\b/.test(q)) return 'governance';
    if (/\b(money|wealth|economy|economic|trade\b|afford|resource(s)?|food\b|shelter|currency|pay\b|income|fair share|enough to (live|eat|get by)|own(ership)?|accumulate|distribute)\b/.test(q)) return 'economy';
    // Other religions — must come before the generic religion intent
    if (/\b(other (religion|faith|belief|creed)|different (religion|faith|belief|god(s)?)|how (do|did) you (feel|think|view|regard|see) (about )?(other religion|other faith|different religion|different faith|other god|other belief|non-believer|heretic|infidel|pagan|heathen)|people of (different|other|another) (faith|religion|belief)|those (who|that) (believe|worship) differently|foreign (god|gods|religion|faith))\b/.test(q)) return 'other_religions';
    if (/\b(god\b|faith\b|religion|religious|believ(e|ing|ief)|spiritual(ity)?|meaning\b|purpose\b|sacred|divine|prayer|pray\b|church|temple|mosque|worship|afterlife|soul)\b/.test(q)) return 'religion';
    // Extinction events
    if (/\b(disaster\b|catastrophe|calamity|destruction|the (meteor|asteroid|plague|volcano|eruption|pandemic|nuclear|climate collapse|catastrophe|disaster)|what happened|the (event|calamity|catastrophe)|aftermath|survivors?|rubble|ruins?|rebuild(ing)?|recovery|aftermath|after (the|it|everything)|how (bad|did|is it)|how many (died|survived|are left)|the (end|collapse)|civilization (fell|collapsed|destroyed|survived)|what (we|are we) left (with|of)|starting over|from (the) ashes)\b/i.test(q) &&
        civ && civ.history && civ.history.some(h => h.type && h.type.startsWith('extinction_'))) return 'extinction';
    // Neighboring plague — questions about disease in another civilization
    if (/\b(neighbor(ing)? (plague|pandemic|disease|sickness|epidemic)|plague (in|from|next door|nearby|neighboring|near us|in (a |the )?neighboring)|pandemic (in|from|nearby|next door)|disease (spread(ing)?|in (a |the )?neighboring|from (a |the )?neighboring)|spread(ing)? (from|to us|here)|other civilization(s)?'? (plague|disease|pandemic|sickness)|what (are (we|you) doing|should (we|you|i) do) (about|with) (the )?(plague|pandemic|disease) (in|from|next door|nearby|neighboring)|close (the )?(border|borders)|send (aid|help)|take (refugee|refugees)|response to (the )?(plague|pandemic|disease)|how (should|are|do) (we|you) respond|quarantine (the )?(border|borders)|what (do|did|are) (we|you) (do|doing) (about|with) the (plague|pandemic|disease))\b/i.test(q)) return 'plague_neighbor';
    // Inter-civ diplomacy — questions about other civilizations, treaties, alliances, war, trade
    if (/\b(other (civilization|civ|nation|people|society|tribe|kingdom|empire)(s)?|neighbor(ing)? (civilization|civ|nation|people|society|tribe|kingdom|empire)(s)?|relation(s|ship)? (with|to) (another|other|neighboring|the other)|treaty|treaties|alliance(s)?|non-aggression (pact|treaty|agreement)|trade (agreement|deal|treaty|pact)|diplomat(ic|s|y)|foreign (affairs|relations|policy)|how (do|are) (we|you) (get along|relate) with|the other (civs?|civilization|nation)(s)?|our (neighbor|neighbors|allies|enemies)|are (we|you) (friends|enemies|allied|at war) with|war with (another|the other|our neighbor|neighboring)|peace (with|treaty)|our relations|inter-civilization|international|cross-civ|what (do|are) (we|you) think (of|about) (the other|our neighbor|them)|do (we|you) (trade with|fight|ally with|cooperate with)|alliance (with|between)|our (allies|enemies|trade partner)s?\b)\b/i.test(q)) return 'inter_civ_relations';
    // Leader / succession — who leads, health, assassination, succession
    if (/\b(who (leads?|rules?|governs?|is in charge|is the leader)|our (leader|chief|ruler|chieftain|head of state|prime minister|president|high priest)|the (leader|ruler|chief|chieftain|head of state|president|prime minister)|leadership|succession|heir|who (will|would) (take over|succeed|replace|lead next)|what (happened|happens) (to|when) the leader|leader('s)? (health|death|died|dead|assassinated|incapacitated|sick)|assassination|coup|who (is|was) (in charge|leading)|term in power|years? in power|new leader|leader (change|replacement|crisis))\b/i.test(q)) return 'leader_event';
    // Cult emergence — religious or personality cults
    if (/\b(cult(s)?|extremist (group|movement|religion)|fanatical|high.control (group|movement|religion)|personality cult|ideological cult|the (circle|faithful|followers|true believers|devoted)|cult of (the leader|[a-z]+)|radical (religion|religious|movement|group)|totalitarian (movement|sect|religion)|sect(s)?|dangerous (movement|group|religion)|forbidden (movement|religion|group)|religious (extremi|fanatic|fanati))\b/i.test(q)) return 'cult_presence';
    // Public works
    if (/\b(aqueduct|granary|granaries|road(s)?\b|library|archive|hospital(s)?|irrigation|water (system|project|supply)|infrastructure|public (works?|project|building|construction)|the (project|construction|building|road|road network|library|hospital|granary|aqueduct)|commission(ed)?|build(ing)? (for|the|a) (people|public|everyone|all)|great (work|project|construction|building))\b/i.test(q)) return 'public_works';
    // Alien contact — must come before religion and community
    if (/\b(alien(s)?|extraterrestrial(s)?|UFO(s)?|first contact|are we alone|life (in space|in the universe|out there|beyond (earth|our world|this world))|signal from (space|the stars)|non-human (intelligence|life|beings?|entity|entities)|contact (from space|from the stars|from beyond)|other (intelligence|beings?) (out there|in the universe|in space)|space (beings?|creatures?|life|intelligence)|visitors from (space|the stars|beyond)|the (signal|contact|transmission)|what (they|it) (want(s)?|mean(s)?|said|sent)|message from (space|the stars|beyond)|outer space (life|intelligence|beings?)|space (signal|message|transmission)|star(s)? (signal|message|beings?|life)|intelligent life|sentient (life|beings?) (in space|in the universe|out there))\b/i.test(q)) return 'alien_contact';
    if (/\b(communit(y|ies)|neighbor(s)?|together\b|collective|societ(y|al)|each other|look out for|help each other|connection\b|belong(ing)?|solidarity|mutual)\b/.test(q)) return 'community';
    // ── Pass 7 intents (before generic future/agency to avoid misrouting) ──
    if (/\b(paradigm (shift|change|transition)|system(ic)? (change|transform|revolution|collapse|shift)|fundamental (change|transform|restructur)|change (the system|everything|how things work)|overthrow|revolution\b|the system (is broken|must change|needs to change)|transform(ation)? (of|this) (society|civilization|government|economy)|structural (reform|change|transformation)|regime change|dismantle|alternative (system|model|way|arrangement))\b/i.test(q)) return 'paradigm_shift';
    if (/\b(wealthy (control|rule|run|decide|dominate|capture)|rich (control|rule|run|dominate)|(the )?(elite|wealthy|rich)(s)? (control|rule|buy|corrupt|capture|influence) (the )?(government|politics|politicians|elections|decisions|media)|bought (the|our) (government|politicians|elections|media|democracy)|who (really|actually) (controls?|runs?|decides?)|wealth (capture|buys power|controls government|corrupts|rules)|plutocracy|plutocrat|corporate (capture|control)|feudal (dynamic|lord|system)\b)\b/i.test(q)) return 'wealth_capture';
    if (/\b(say (one thing|they care|we believe) (but|and)|hypocris(y|is|ies)|what (we|they) (say|claim|preach|teach) (vs|versus|and) what (we|they|the system) (do|reward|reinforce|actually|practice)|gap between (words and actions|principle and practice|belief and behavior|what we say and|values and)|practiced values|reinforced values|what gets rewarded|systemic hypocrisy|taught (to value|to believe) but|values (mismatch|gap|contradiction)|dissonance|double standard|doesn'?t practice what it preaches)\b/i.test(q)) return 'cultural_gap';
    if (/\b(given up on|lost faith (in)|stop(ped)? believing|don'?t trust (the|any|our) (system|institution|government|leaders|authorities|politicians)|is there (any|still|real) hope|hopeless(ly)?|nothing (will|can|ever) change|futile|rigged (system|game|against us)|no point (in|trying)|can'?t change (the system)|given up on (the system|politics|governance)|all corrupt|revolution(ary)? consciousness|class consciousness|people (are waking up|are seeing|are realizing)|collective awakening|see (through|the truth about) (the|this) system|how many people (know|realize|see) (the truth|the real|how it works))\b/i.test(q)) return 'cynicism_consciousness';
    // ── Pass 8 intents ──────────────────────────────────────────────────────────
    if (/\b(old (habit(s)?|behavior(s)?|way(s)?|pattern(s)?|norm(s)?)|hard to (change|unlearn|shift)|ingrained|slow to change|habits? (die hard|persist|remain)|people (still act|still behave|haven'?t changed)|takes (time|a while|years|generations) (to change|to shift|for people to)|why (don'?t|won'?t|can'?t) people (just change|change|adapt|behave differently)|behavior(al)? change|change (the habit(s)?|the behavior(s)?|how people act|how people think)|mindset change|unlearn(ing)?|cultural (lag|inertia|resistance)|old (mindset|ways of thinking|patterns? of thinking))\b/i.test(q)) return 'behavioral_inertia';
    if (/\b(no (consequence(s)?|accountability|punishment|price to pay|penalty|cost)|get(s)? away with (it|everything|anything)|above (the law|accountability|consequence(s)?)|unaccountable|unpunished|impunity|who (holds|held) (them|anyone|the powerful|the elite) accountable|nobody (is held|gets) accountable|consequence(s)? (for|of) (corruption|abuse|power)|when (do|did) they (face|pay|suffer) (consequence(s)?|accountability)|power (without|with no) (consequence(s)?|accountability|check(s)?)|abuse (of power|without consequence)|unchecked (power|corruption|abuse)|who (checks|watches|holds|monitors) (the powerful|the elite|those in power)|power (concentration|consolidating|accumulating|entrenching))\b/i.test(q)) return 'power_impunity';
    if (/\b(workshop(s)?|civic (education|training|program)|facilitat(e|ion|ing)|communit(y|ies) (forum|discussion|dialogue|program)|peer (demonstration|learning|program)|media (campaign|message|messaging)|outreach (program|campaign)|training (program|session)|education (campaign|program|initiative)|new (norm(s)?|value(s)?|behavior(s)?|paradigm) education|teaching (the new|people about)|help(ing)? people (understand|learn|adapt|transition|grasp)|support(ing)? (the|a) (transition|change|shift))\b/i.test(q)) return 'facilitation';
    if (/\b(cooperation (works?|pays off|benefit(s)? everyone|actually help(s)?|when it work(s)?)|when (we|you|people) work together|collective (action|benefit|gain|reward|outcome)|does (working together|cooperating|cooperation) (actually|really|pay off|help|work)|what happens when (we|you|people|everyone) (cooperate(s)?|work(s)? together|help(s)? each other)|does (it|cooperation|helping) (pay|matter|make a difference)|reward(s|ed)? for (cooperating|working together|helping)|material (benefit(s)?|gain(s)?) (from|of) cooperation|outcome(s)? of (cooperating|working together)|cooperation (strengthen|weaken)|cooperative (behavior(s)?|norm(s)?|value(s)?)|self-reinforcing (cooperation|behavior)|outcome(s)? (reinforce|feedback|strengthen|weaken))\b/i.test(q)) return 'coop_outcomes';
    // Pass 9: new intents — cultural homogeneity and cross-civ contagion
    if (/\b(norm(s)? (spread(ing)?|drift(ing)?|spreading from|diffus(e|ing|ion))|spreading from (the|our|their|neighboring) (neighbor(s)?|civiliz|civ(s)?)|neighbor(s)? (influence|influencing|affecting)|cultural (contagion|spread|diffusion|invasion|blending|mixing|import(s)?|influence(s)?)|copying (from )?(the |other |our )(neighbor(s)?|civ|civiliz)|contagion|norm diffusion|ideas? (spreading|crossing|traveling|imported|bleed)|influence from (another|other|neighboring) (civ|civiliz)|what (they|neighbors?|other civs?) (believe|do|practice)|when ideas? (cross|travel|spread) (border(s)?|from)|imported (norm(s)?|idea(s)?|value(s)?)|cross-civ|absorb(ing)? (culture|norms?|ideas?|influence))\b/i.test(q)) return 'civ_contagion';
    if (/\b(monoculture|cultural (homogen|heterogen|uniform|divers|plural)|one (dominant )?culture|single culture|many (sub)?cultures?|subcultures?|pluralis(m|t|tic)|diverse (culture(s)?|society|background(s)?|perspective(s)?)|homogeneous (culture|society|population|civ)|how (uniform|similar|diverse|different) (is|are) (the|our|this) (culture|society|people|population|civ)|lack(ing)? (diversity|cultural diversity)|cultural (uniformity|conformity|variety|richness)|mix of cultures?|melting pot|cultural mixing|one-size-fits-all culture|dominant culture|(are|is) everyone (the same|similar|alike|from the same|from one culture))\b/i.test(q)) return 'cultural_homogeneity';
    if (/\b(authoritarian world (government|order|empire|rule)|world (empire|domination|conquest|takeover)|global (empire|domination|takeover|authoritar|totalitar)|one world (government|order|rule|power)|planetary (empire|government|domination|control)|global ruler|ruler of (the world|all nations?|humanity|the planet)|conquered (the world|all nations?|humanity)|world (dictator|dictatorship)|conquest of (the world|all nations?|humanity)|humanity (under|ruled by|controlled by) one|forced (global|world|planetary) (unification|unity|order)|global totalitar(ian|ism)|demagogue (who|that) (took|seized|controls?|rules?)|no (rival|other) state(s)?|last (government|nation|state) standing)\b/i.test(q)) return 'auth_world_govt';
    if (/\b(future\b|change\b|different\b|better\b|improve(ment)?|hope\b|dream\b|next generation|children'?s? future|wish things were|someday|reform|what could be)\b/.test(q)) return 'future';
    if (/\b(proud|pride|shame|ashamed|honor|honour|your (people|culture|country|nation|civilization|homeland|heritage)|feel about (where you|your|this) (come from|people|country|culture|civilization)|conquest|expansion|what (you|your people) (have done|did|achieved|built|accomplished)|your ruler|your leader|your king|your government|your laws)\b/.test(q)) return 'identity';
    if (/\b(power over|agenc(y|ies)|control\b|influence\b|can you change|able to change|powerless|helpless|make a difference|your (say|voice)|affect things|matter\b)\b/.test(q)) return 'agency';
    if (/\b(unsafe|danger(ous)?|afraid|fear\b|scared|threat|violence|conflict|war\b|oppression|oppressed|persecuted)\b/.test(q)) return 'safety';
    if (/\b(thank(s| you)|that'?s (helpful|interesting|fascinating)|appreciate|good to know|i see\b|i understand|makes sense)\b/.test(q)) return 'acknowledgment';
    // Fall back to category
    const catMap = { daily_life:'daily_life', economy:'economy', governance:'governance', religion:'religion', community:'community', wellbeing:'happiness', change:'future', power:'agency' };
    return catMap[categoryId] || 'general';
  },

  // ── Response Generator ────────────────────────────────────────
  _generateResponse(npc, civ, intent, question, prevNPCLines, prevUserLines, askerContext = 'general', gameYear = 0) {
    const h = npc.happiness;
    const pos = npc.socialPosition;
    const b = civ.state ? civ.state.behaviorReinforcement : {};
    const econ = civ.economic || {};
    const gov = civ.governance || {};
    const perceptions = npc.getPerceptions(civ);

    // Era context — derive from gameYear (fall back to civ founding year)
    const era = Utils.getEra(gameYear || civ.foundingYear || 0);
    const eraId    = era ? era.id : 'classical';
    const techLevel = era ? era.techLevel : 5;

    // Era speech flavor — prepended occasionally for early eras to give period texture
    const eraFlavorPrefix = () => {
      if (techLevel > 6) return '';   // modern+ speech needs no prefix
      const roll = Math.random();
      if (roll > 0.30) return '';     // only apply 30% of the time
      if (techLevel <= 2) return Utils.randChoice([
        'In the way our ancestors have always known — ',
        'The spirits teach us: ',
        'Since before the elders can remember — ',
        'This is the way it has been since the first seasons — ',
      ]);
      if (techLevel <= 4) return Utils.randChoice([
        'The gods have ordered it so — ',
        'As those before us learned — ',
        'By the will of those who rule this land — ',
        'In the age we live — ',
      ]);
      if (techLevel === 5) return Utils.randChoice([
        'By reason and long experience — ',
        'As the wise have observed — ',
        '',
      ]);
      if (techLevel === 6) return Utils.randChoice([
        'By God\'s grace — ',
        'In these times of trial — ',
        'As scripture and duty teach — ',
        '',
      ]);
      return '';
    };

    // Helper: pick a response not already given, with optional era prefix
    const pick = (pool, withEraFlavor = false) => {
      const unused = pool.filter(r => !prevNPCLines.some(p => p.includes(r.slice(0, 30))));
      const chosen = Utils.randChoice(unused.length > 0 ? unused : pool);
      if (!withEraFlavor) return chosen;
      const prefix = eraFlavorPrefix();
      if (!prefix) return chosen;
      // Lowercase the first char of chosen when prepending prefix
      return prefix + chosen.charAt(0).toLowerCase() + chosen.slice(1);
    };

    // Emotional tone: 'distress' | 'gratitude' | 'pride' | 'anxiety' | null
    const emotionalTone = this._detectEmotionalTone(npc, civ, intent, question, techLevel, h, pos);

    // Religious coloring — occasionally weave in a reference to faith when NPC is religious
    // Fires ~22% of the time on appropriate intents when religiousAffiliation is set.
    // Uses _getReligiousTerm() to produce grammatically correct divine terms
    // (e.g. 'God', 'the Spirits', 'the Gods', 'the Goddess') rather than raw tradition names.
    const religTerm = npc.religiousAffiliation ? this._getReligiousTerm(npc, civ) : null;
    const religiousIntents = new Set(['how_are_you', 'happiness', 'daily_life', 'mortality', 'health', 'future', 'conditions', 'challenges', 'family', 'desires']);
    const maybeAddReligion = (response) => {
      if (!religTerm || !religiousIntents.has(intent) || Math.random() > 0.22) return response;
      const refs = [
        ` — thanks be to ${religTerm}.`,
        ` I draw a great deal of strength from ${religTerm}.`,
        ` ${religTerm} has been my anchor through all of it.`,
        ` That is the grace of ${religTerm} at work.`,
        ` I hold onto ${religTerm} in moments like these.`,
        ` — ${religTerm} willing.`,
        ` The path that ${religTerm} offers gives me a way to hold that.`,
      ];
      const ref = Utils.randChoice(refs);
      // Append naturally
      if (response.endsWith('.') || response.endsWith('!') || response.endsWith('?')) {
        return response.slice(0, -1) + ref.trimStart().replace(/^— /, ' — ');
      }
      return response + ref;
    };

    // ── Anachronistic question guard ────────────────────────────────
    // If the player asks about concepts that don't exist yet in this era, the NPC
    // deflects with an era-appropriate "I don't know what that is" response.
    {
      const q_l = question.toLowerCase();
      let anachronistic = false;
      // Concepts that require techLevel 9+ (modern/contemporary)
      if (techLevel <= 8 && /\b(internet|smartphone|social media|streaming|cryptocurrency|blockchain|cyberspace|climate change|global warming|nuclear (weapon|bomb|warhead|reactor|power plant)|quantum (mechanic|physic|computer|computing)|artificial intelligence|machine learning|algorithm(s)?|microchip|semiconductor|genetic(s)?|dna\b|crispr|genome|self-driving|autonomous vehicle|virtual reality|augmented reality)\b/.test(q_l)) anachronistic = true;
      // Concepts that require techLevel 7+ (Renaissance / industrial)
      if (techLevel <= 6 && /\b(computer(s)?|electricity|electric(al)?|radio\b|telephone|telegram|telegraph|photograph(y)?|airplane|aircraft|steam engine|locomotive|vaccine|vaccination|antibiotic(s)?|x-ray|laser|radar|fossil fuel|petroleum|oil refin|evolution\b|natural selection|microscope|telescope\b|thermometer|printing press)\b/.test(q_l)) anachronistic = true;
      // Concepts that require techLevel 5+ (classical era)
      if (techLevel <= 4 && /\b(gunpowder|compass\b|algebra|chemistry\b|physics\b|philosophy\b|democracy\b|republic\b|constitution\b|astronomy\b|longitude|latitude|decimal|zero\b|arabic numeral)\b/.test(q_l)) anachronistic = true;

      if (anachronistic) {
        if (techLevel <= 2) return Utils.randChoice([
          `Those words mean nothing to me. Where do you come from, that you speak of such things?`,
          `I have no understanding of what you're describing. It is entirely outside anything I know.`,
          `That word holds no meaning in my world. What strange thing are you asking about?`,
          `I don't know the thing you're asking about. It has no place in anything I've been taught.`,
          `You speak of something beyond my experience entirely. I cannot help you with that.`,
        ]);
        if (techLevel <= 4) return Utils.randChoice([
          `That is not something I have knowledge of. The priests might know — but it means nothing to me.`,
          `I don't know what you're speaking of. That word holds no meaning where I come from.`,
          `That is beyond my learning. I cannot speak to things I have no concept of.`,
          `You use a word I don't know. I have no answer for something so unfamiliar.`,
          `I'm afraid I don't understand the thing you're asking about. It's entirely outside my experience.`,
        ]);
        if (techLevel <= 6) return Utils.randChoice([
          `I don't know what that is. Is it a foreign term? It has no meaning I can place.`,
          `I haven't heard of this thing you describe. Is it something from a distant land?`,
          `That is beyond my knowledge. I cannot speak to what I have no understanding of.`,
          `What you're describing is entirely unfamiliar. I have no experience of such a thing.`,
          `I cannot answer you about something I've never encountered. You speak of things outside my world.`,
        ]);
        return Utils.randChoice([
          `That's not something in my experience. I wouldn't know what to say about it.`,
          `I can't say — that's entirely outside what I know.`,
          `That's beyond my understanding, I'm afraid. Not something I can speak to.`,
          `That means nothing to me. You'd need to speak with someone who has a very different kind of education.`,
        ]);
      }
    }

    switch (intent) {

      case 'greeting':
        return pick([
          `Of course. I don't often get the chance to speak with someone who's genuinely asking. What would you like to know?`,
          `Please, go ahead. I'll answer as honestly as I can.`,
          `Happy to talk. It's not every day someone stops to ask. What's on your mind?`,
          `I have a little time. Ask what you like — I'll tell you what I can.`,
          `${npc.name.split(' ')[0]}. That's who I am. What would you like to know about my life here?`,
        ]);

      case 'self_intro': {
        // Extract player's name from the question (case-insensitive)
        const nameMatch = question.match(/\bmy name is ([A-Za-z]+)\b/i) ||
                          question.match(/\bcall me ([A-Za-z]+)\b/i) ||
                          question.match(/\b(?:i'?m|i am) ([A-Z][a-z]+)\b/);
        const playerName = nameMatch ? nameMatch[1] : null;
        const npcFirst   = npc.name.split(' ')[0];
        const posBlurb = {
          leader:       `I hold a position of leadership here`,
          elite:        `I'm among the more privileged members of this community`,
          professional: `I work a skilled trade here`,
          laborer:      `I'm a working person here — nothing more, nothing less`,
          marginalized: `I live on the edges of what this society considers central`,
        }[pos] || `I'm a member of this community`;
        return pick([
          playerName
            ? `${playerName} — good to meet you. I'm ${npc.name}. ${posBlurb}. What would you like to know?`
            : `Well met. I'm ${npc.name}. ${posBlurb}. What would you like to know?`,
          `${playerName ? 'Good to meet you, ' + playerName + '. ' : 'Good to meet you. '}I'm ${npcFirst} — ${npc.name} in full. Ask me what you like.`,
          `${playerName ? playerName + '. ' : ''}My name is ${npc.name}. ${h > 55 ? 'I\'m glad to talk.' : 'I don\'t often get the chance to speak plainly with someone new.'} What's on your mind?`,
          `${npc.name}. That's me. ${playerName ? 'Nice to meet you, ' + playerName + '.' : 'Nice to meet you.'} What would you like to know about life here?`,
        ]);
      }

      case 'how_are_you': {
        // ── Era-gated responses: prehistoric and ancient worlds ──
        if (techLevel <= 2) return maybeAddReligion(pick([
          h > 60
            ? `The hunting has been good and the children are strong. ${pos === 'leader' ? 'The tribe is well.' : 'What more can a person ask of the season?'}`
            : h > 35
              ? `We survive. The cold was hard but we came through it. ${pos === 'marginalized' ? 'Not all of us did, but most.' : 'That is not nothing.'}`
              : `Hungry more than I would like. The game has moved further away and the stores are low. But I am here and asking questions, which means I am still alive.`,
          `${pos === 'leader' ? 'The tribe follows. That is how I know things are not yet broken.' : 'I wake, I work, I sleep. On the days that is enough, I call it good.'}`,
          `Strong in the body. The spirits have not turned from us. I take that as well as it comes.`,
        ]));
        if (techLevel <= 4) return maybeAddReligion(pick([
          h > 60
            ? `Well enough, by God's grace. The harvest was reasonable and my family is sound. I do not complain about what the Lord provides.`
            : h > 35
              ? `${pos === 'laborer' || pos === 'marginalized' ? 'I endure. It is all that is asked of us and all we can give.' : 'Fair. The season has been neither kind nor cruel. I carry on.'}`
              : `Hard. I will not lie to you. The taxes do not stop, the harvest was thin, and one of my children has been ill. But I keep faith.`,
          `${pos === 'elite' || pos === 'leader' ? 'Well, thank you. My household is in order and the affairs of the estate are managed.' : 'I rise before dawn and sleep after dark. If that is living, then I am alive.'}`,
          `${h < 30 ? 'I would not call it well. But I do not say so where it can be taken back to those above me.' : 'Better than many I see around me. That is something to be grateful for.'}`,
        ]));
        // Context-specific candour
        if (askerContext === 'fellow' && h < 45) return pick([
          `You live here too. You know what it's like. Some days I wonder why we keep pretending it's fine.`,
          `You and I both know the answer to that. Let's not dress it up.`,
          `Tired, mostly. I don't usually say that — but since you're asking honestly.`,
        ]);
        if (askerContext === 'stranger' && h < 40) return pick([
          `Since you're not from here, I'll be plainer about it. It's harder than it should be. The work we put in and what comes back — that doesn't balance.`,
          `Honestly? Not well. I don't say that to people who'd take it back to someone. But you won't.`,
        ]);
        // Genuine satisfaction at the top end
        if (h > 72) return maybeAddReligion(pick([
          `Well enough, thank you. Better than many around here, honestly. I try not to take that for granted.`,
          `Good days and harder ones, like anyone. Today is a reasonable day.`,
          `I'm managing fine. There are things I'd change, but I can't complain.`,
          (pos === 'elite' || pos === 'leader') ? `Genuinely well. I know that's not universal here — I see it. But I've built something that holds, and I won't pretend I'm not grateful for that.` : `Better than expected, honestly. The day-to-day is manageable. What more can you ask for.`,
        ]));
        if (h > 45) return pick([
          `I manage. There are harder days and easier ones. Today is somewhere in between.`,
          `Honestly? Fair. Not unhappy, but not without worry either.`,
          `I get through it. What more can you say, really.`,
          `I've been thinking about that question more than you might expect. There are things in my life that are genuinely good. There are things I wish were different. I haven't found a simple way to make those add up to one answer.`,
        ]);
        // Raw frustration at the low end
        if (h < 25) return pick([
          `Badly, if you want the plain answer. The work I put in and what I have to show for it — that math doesn't work. I've stopped pretending it does.`,
          `I'm exhausted. Not dramatically — just the daily weight of it. And the part where you can't say that too loudly.`,
          `Not well. Not for a long time. But we keep going because what else do you do.`,
        ]);
        return pick([
          `Honestly, it's been difficult. I won't pretend otherwise.`,
          `Not well, if you want the truth. There are things weighing on me.`,
          `I survive. Whether that's the same as living — I'm not always sure.`,
          `Fine. That's the word I use. I'm not sure it's accurate anymore.`,
          `I've stopped expecting much. That helps, in a way — fewer disappointments.`,
          `Just getting through the days. That's become the goal. Not anything bigger than that.`,
        ]);
      }

      case 'clarify': {
        // Expand on the last NPC line
        const lastLine = prevNPCLines[prevNPCLines.length - 1] || '';
        if (lastLine.includes('mother') || lastLine.includes('father') || lastLine.includes('parent') || prevUserLines.some(l => l.includes('mother') || l.includes('parent'))) {
          return pick([
            `I mean the loss itself — the moment someone is simply no longer there. You learn to carry it, but it doesn't get lighter, exactly. You just get more used to the weight.`,
            `I was young when I lost her. You don't process it as a child — you just adjust. The questions come later. What it means that people are here and then gone.`,
            `My mother, yes. She died when I wasn't prepared for it. No one is, really. What I meant is that loss shapes how you see everything else.`,
          ]);
        }
        if (lastLine.includes('power') || lastLine.includes('say') || lastLine.includes('voice') || lastLine.includes('decide')) {
          return pick([
            `I mean the decisions that affect my daily life — whether there's enough food, what gets built, who gets heard when there's a dispute. Those happen somewhere I can't reach.`,
            `What I mean is: I do what I'm told, more or less. Not because I believe it's always right. Because that's how things work here.`,
          ]);
        }
        if (lastLine.includes('hard') || lastLine.includes('difficult') || lastLine.includes('struggle') || lastLine.includes('survive')) {
          return pick([
            `What I mean is the daily weight of it. Not dramatic suffering — just the grinding uncertainty. Will there be enough? Will things improve? You stop expecting them to.`,
            `Harder than I expected life to be, I suppose. I thought things would be clearer by now. More settled.`,
          ]);
        }
        // Generic expansion
        return pick([
          `What I mean is — it's more complicated than it sounds. The simple answer doesn't quite fit the reality.`,
          `Let me put it differently. It's not that things are terrible. It's that there's a gap between what's possible and what is. I feel that gap.`,
          `I said it badly. What I mean is: I've learned to accept things I used to think were worth questioning. I'm not sure if that's wisdom or just tiredness.`,
        ]);
      }

      case 'mortality': {
        const hasPersonalLoss = npc.lifeEvents.some(e => /died|death|lost|widow|passed|gone/i.test(e));
        // Distress — personal grief, variable intensity
        if (hasPersonalLoss && emotionalTone === 'distress') {
          const intensity = Math.random();
          if (intensity < 0.35) return pick([
            // Soft: reluctance
            `That's... not easy for me to talk about. I've lost people. I'd rather leave it there, if you don't mind.`,
            `I'd prefer not to go into it. There are losses that don't get easier with time. You just learn not to open them in conversation.`,
          ]);
          if (intensity < 0.70) return pick([
            // Medium: emotional weight but still answers
            `I've lost people I loved deeply — that's what mortality means to me. Not a concept. Real people. Real silences where they used to be. It changed how I move through the world.`,
            `You're asking me about something I carry every day. I lost someone important. I don't talk about it easily, but I think about it constantly.`,
          ]);
          // Full: answers with rawness
          return pick([
            `I'll tell you. I've buried people I loved before their time, and the question of why — why them, why then — still lives in me. That's what mortality is. It's not a philosophy. It's a name and a face.`,
            `Grief is a permanent resident in my life. I don't say that to sound dramatic. I mean the ordinary version — the person who's gone from every ordinary moment they used to be part of.`,
          ]);
        }
        return pick([
          `It's not something I think about constantly. But it's there — especially after you've lost someone. You realize time has a shape to it.`,
          `Losing people is the hardest part. Not your own death — you're not there for that, in a way. It's the losses you survive that change you.`,
          `I think about it more than I used to. Getting older will do that. What I've been, what I've left behind. Whether any of it will matter after.`,
          `The people I've loved who are gone — that's what mortality means to me. Not an abstraction. Specific people. Specific absences.`,
        ]);
      }

      case 'marriage': {
        const econId2   = (civ.economic || {}).modelId || 'market';
        const isGift    = econId2 === 'gift' || econId2 === 'commons';
        const m         = npc.isMarried;
        const p         = npc.hasPartner;
        const age2      = npc.age;
        if (m) {
          // Married
          if (isGift) return pick([
            `Yes. We've shared a life for ${age2 > 40 ? 'many years' : 'a few years'} — the community has been part of that almost as much as we have each other. Bonds like that don't feel separate from everything else here.`,
            `I am. In a place like this the line between partnership and belonging to a community is blurry. We're bound to each other and to something larger than just the two of us.`,
          ]);
          if (h < 35) return pick([
            `I am, yes. It's been a source of steadiness in circumstances that haven't offered much of that.`,
            `Yes. I won't say it's easy — nothing here is easy. But it's something I have.`,
          ]);
          if (age2 > 50) return pick([
            `Yes, for ${Utils.rand(10, 30)} years now. Long enough that I've stopped counting in any meaningful way. It becomes just — life.`,
            `I am. We've been together a long time. That kind of continuity is its own kind of wealth.`,
          ]);
          return pick([
            `Yes, I'm married. It changes your orientation to everything — you're not just making decisions for yourself anymore.`,
            `I am. We met through ${isGift ? 'community work' : econId2 === 'market' ? 'trade' : 'shared circumstance'}. We've built something together.`,
            `Married, yes. Whether that's the right word for it — the formal arrangement — is less important than the partnership itself.`,
          ]);
        }
        if (p) {
          // Has a partner, not formally married
          return pick([
            `I have a partner, yes. We're not formally married — whether that distinction matters depends on who you ask.`,
            `There's someone I'm with. I don't know that the institution of marriage adds or changes anything for us. The commitment is real regardless.`,
            `Yes, there's someone. We've chosen to be together without formalizing it. In ${isGift ? 'a place like this, the community recognizes that' : 'some ways that feels more honest to me'}.`,
          ]);
        }
        // Single
        if (age2 < 28) return pick([
          `Not currently. At my age I haven't had the time or the stability to build something like that.`,
          `No. Not for lack of wanting to — there just hasn't been the right circumstance.`,
        ]);
        if (h < 35) return pick([
          `No. I think the conditions of my life have made it difficult to build that kind of stability with someone else.`,
          `No. I'd be lying if I said I hadn't wanted to. Things haven't lined up.`,
        ]);
        return pick([
          `No. I've chosen to focus on ${pos === 'leader' ? 'responsibilities I carry that are hard to share' : 'other things, at least for now'}.`,
          `Not married, no. There's been connection, but nothing that settled into that shape.`,
          `No — at some point I stopped expecting it and found other things to anchor to.`,
        ]);
      }

      case 'children_status': {
        const n     = npc.numChildren;
        const econId3 = (civ.economic || {}).modelId || 'market';
        const isGift2 = econId3 === 'gift' || econId3 === 'commons';

        // ── Emotional overlay ──
        if (n > 0 && (emotionalTone === 'gratitude' || emotionalTone === 'pride')) return pick([
          `My children are the thing I'm most proud of in my life. Not what I've built or earned — them. Watching them grow into themselves. I didn't fully understand what that would feel like until it happened.`,
          `I'm so grateful for them. Genuinely. There are hard days, of course — but the fact that they exist, that they're mine to care for — that's the best thing in my life.`,
          `${n === 1 ? 'My child' : `My ${n} children`} — they're everything. I worry about what kind of world they're inheriting. But loving them? That's the easy part. That part is pure.`,
          `I could talk about them all day, honestly. ${n > 1 ? 'Each one so different.' : ''} I'm proud of who they are. Not because of me — just because of them.`,
        ]);
        // Worry about children's wellbeing when conditions are hard
        if (n > 0 && h < 38) return pick([
          `I have ${n > 1 ? n + ' children' : 'a child'}, and yes — I worry about them. Whether what I can provide will be enough. Whether the world they're growing up in will treat them fairly. That worry doesn't let up.`,
          `I do, and they're the reason the hardest parts of my life feel both worse and better. Worse because I need to protect them. Better because they give me something to keep going for.`,
        ]);

        if (n > 0) {
          if (n === 1) return pick([
            `I have one child. It reorients everything — what you think about, what you're willing to do, what you hope for the place you live.`,
            `One. I think about their future more than my own at this point, which I understand is exactly what's supposed to happen.`,
            `Yes, one. ${isGift2 ? 'The community helps raise them in a way I find genuinely moving.' : 'It\'s a lot for one person, but we manage.'}`,
          ]);
          if (n <= 3) return pick([
            `${n} children. It's full. ${isGift2 ? 'The community shares in it, which makes it less overwhelming.' : 'The obligations are real, but so is the richness.'}`,
            `I have ${n}. They're the center of gravity for everything else.`,
            `${n} children, yes. You don't know what it takes until you're in it.`,
          ]);
          return pick([
            `${n} children. A full household. ${pos === 'marginalized' || pos === 'laborer' ? 'It stretches what I have.' : 'I wanted a family around me. I have one.'}`,
            `${n}. I've built my life around them more than anything else.`,
          ]);
        }
        // No children
        if (npc.age > 45) return pick([
          `No. That's been a quiet presence in my life — the absence of it. I don't dwell on it.`,
          `It didn't happen. I've found other ways to invest in the next generation. It's not nothing.`,
          `No children. Some things you make peace with over time.`,
        ]);
        return pick([
          `Not yet. It's not something I've closed off — just not something that's happened.`,
          `No. Whether that's circumstance or choice is harder to separate than people assume.`,
          `No. I'm still figuring out what kind of life I'm living before adding that to it.`,
        ]);
      }

      case 'health': {
        const hs  = npc.healthStatus; // 'good', 'fair', 'poor'
        const age3 = npc.age;
        const econId4  = (civ.economic || {}).modelId || 'market';
        const hasMed   = civ.state && (civ.state.adoptedTechnologies || []).some(t =>
          /herbal|medicine|surgical|germ|antibiotic/i.test(t));

        // ── Era-gated responses ──
        if (techLevel <= 2) {
          if (hs === 'poor') return maybeAddReligion(pick([
            `There is a sickness in me that the healer has sung over and applied her remedies to. Some things do not yield to what we know. ${h < 30 ? 'I am not the only one in the band who suffers from it.' : 'I go on because I must.'}`,
            `An old wound that did not heal as it should have. You live with what the hunt gives you, good and bad.`,
            `I am not well. I feel it in the cold mornings especially. The spirit-caller says prayers over me. Whether that helps, I cannot say for certain, but it does not harm.`,
          ]));
          return maybeAddReligion(pick([
            `Strong enough. I have to be — weakness here costs everyone around you.`,
            `${h > 60 ? 'The spirits have been good to me. My body has not betrayed me.' : 'I endure. That is what you can say most days.'}`,
            age3 > 40 ? `At my age I have earned a few aches. I still move, still work. That is good health by the measure of things here.` : `Hale and sound. I am grateful for it.`,
          ]));
        }
        if (techLevel <= 4) {
          if (hs === 'poor') return maybeAddReligion(pick([
            `Not well. The fever came last winter and never quite left. The healers have done what they can — prayers and herbs and a poultice. I make peace with what God allows.`,
            `${pos === 'marginalized' ? 'I cannot afford the physician. I manage with what remedies I know.' : 'I have had care — the best available — and still it persists.'} Some things are in God's hands, not ours.`,
            `My health is failing me and I know it. I try not to dwell on what I cannot change. I do my duties while I am able.`,
          ]));
          return maybeAddReligion(pick([
            `${h > 55 ? 'God has been merciful. My body is sound and I can do my work.' : 'Middling. Better than some years, worse than others. I pray it holds.'}`,
            hs === 'fair'
              ? `The cold takes its toll, and my years are showing. But I go on, which is all any of us can do.`
              : `Well enough, by God's grace. There are worse bodies to be living in than this one.`,
            age3 > 45 ? `At my age, health is a thing you pray over more than rely on. So far the prayers have held.` : `Sound in body. I try not to take it for granted — I have buried friends who were younger and stronger than I am.`,
          ]));
        }

        // ── Emotional overlay ──
        if (emotionalTone === 'distress' && hs === 'poor') {
          const intensity = Math.random();
          if (intensity < 0.30) return pick([
            // Soft — reluctance
            `It's not something I like to talk about. I'm not well. Leave it at that.`,
            `My health... I'd rather not get into it. Suffice to say it hasn't been kind to me lately.`,
          ]);
          if (intensity < 0.65) return pick([
            // Medium
            `That's a sore subject. I'm not well — I won't pretend otherwise — and the gap between what I need and what's available to me is large. ${pos === 'marginalized' ? 'People in my position don\'t get much help.' : 'I manage, but barely.'}`,
            `Honestly, my health has become a weight I carry every day. Some mornings are harder than others. I try not to let it show, but you asked.`,
          ]);
          // Full intensity
          return pick([
            `I'll tell you plainly: my body is failing me in ways I can't fully fix, and the options are limited. I've made a kind of peace with it. But some days that peace breaks.`,
            `My health is poor, and it frightens me more than I let on. ${hasMed ? 'Even with what medicine is available.' : 'And there\'s little to be done about it.'} That fear doesn't leave.`,
          ]);
        }
        if (emotionalTone === 'gratitude' && hs === 'good') return maybeAddReligion(pick([
          `I'm genuinely grateful for my health — it's one of the real gifts of my life. I've watched people I know suffer terribly. On the days I feel well, I try to remember how fortunate that is.`,
          `Good, and I say that with real relief, not just as a pleasant answer. I've seen what bad health looks like from close up. Feeling well gives me a kind of freedom I don't take for granted.`,
          `${age3 > 50 ? 'For my age, better than I expected.' : 'Good — genuinely.'} I feel it as a blessing, honestly. Not everyone here can say the same, and I'm aware of that every day.`,
        ]));

        if (hs === 'good') return pick([
          `${age3 > 50 ? 'Reasonably well for my age.' : 'Good, genuinely.'} ${hasMed ? 'The medicine we have access to helps.' : ''} I don't take it for granted — I've seen what it looks like when health goes the other way.`,
          `I'm in good health. It gives me a kind of freedom of movement I try not to waste.`,
          `Healthy, yes. ${pos === 'elite' || pos === 'leader' ? 'Access matters — I have it better than most.' : 'I\'ve been fortunate.'} Some of it is circumstance I didn\'t earn.`,
          `Good. My body has been reliable, which is not something everyone here can say. I appreciate that.`,
        ]);
        if (hs === 'fair') return pick([
          `${age3 > 45 ? 'Things have been changing — the body starts to make itself known in new ways.' : 'I have some ongoing issues. Nothing that stops me, but things I carry.'} I manage.`,
          `Fair. ${h < 40 ? 'The stress of how things are takes a physical toll. I notice it.' : 'Some things aren\'t quite right. I do what I can.'} ${hasMed ? 'There\'s treatment available, which helps.' : ''}`,
          `I get by. Not what I was, but not in crisis. I try not to let it limit me more than it has to.`,
          `Middling. There are days when the body is present in ways I'd rather it wasn't. I adapt.`,
        ]);
        // 'poor'
        return pick([
          `Honestly? Not well. ${pos === 'marginalized' ? 'And access to anything that might help is limited by where I sit in this society.' : ''} I manage what I can.`,
          `It's been a struggle, physically. ${hasMed ? 'There\'s more support than there used to be.' : 'The options here are limited.'} I don't have a lot of margin.`,
          `Poor. I won't pretend otherwise. ${age3 > 50 ? 'It accumulates — choices made, circumstances endured.' : ''} It shapes more of my day than I\'d choose.`,
          `Not good. ${h < 30 ? 'It compounds everything else — when you\'re not well it\'s harder to deal with any of it.' : ''} I keep going because the alternative is worse.`,
        ]);
      }

      case 'family': {
        // ── Era-gated responses ──
        if (techLevel <= 2) return pick([
          pos === 'leader'
            ? `The band is my family. All of them. I hold them together. Without that, there is no winter survival, no continuation. The bond is everything.`
            : `My family is the group I was born into and the group I will be buried with. We raise each other's children. We carry each other's sick. Without that, a single person does not last a season.`,
          `My mother taught me what to gather. My father taught me to track and set snares. That is how family works here — we carry forward what we know.`,
          `${h < 35 ? 'We lost one of ours this past cold season. A child. You do not have words for that kind of thing. You carry it.' : 'The young ones are growing strong. That is what you work for — that they grow up to carry it forward.'}`,
        ]);
        if (techLevel <= 4) return pick([
          `Family is duty before it is love, here. I care for my parents as they cared for me. My children will do the same when the time comes. It is the order of things.`,
          `${npc.lifeEvents.some(e => e.includes('parent') || e.includes('lost')) ? 'I have lost those I loved. You learn to carry it. The work and the faith give you something to hold.' : 'My family has worked this land for generations. We know no other way to live, and I would not change it if I could.'}`,
          h < 30 && pos === 'laborer'
            ? `My family is what I work for, and it is also what makes the work harder when it is not enough. I want more for them than I have been able to give.`
            : `We are together. That is not nothing. I have seen families scattered by debts or plague or the lord's decisions. Together is something you do not take for granted.`,
        ]);
        const hasLostParent = npc.lifeEvents.some(e => e.includes('parent') || e.includes('lost a parent'));
        if (hasLostParent) {
          return pick([
            `I lost my mother when I was young. It changes you — you grow up faster than you're ready to. Or you don't grow up, and there's a space where that guidance should have been.`,
            `My father was gone before I really knew him. I built my sense of who I am without that anchor. I've made peace with it, mostly.`,
          ]);
        }
        if (npc.age > 45) {
          return pick([
            `I have children of my own now. That changes everything — what you're willing to do, what you're willing to endure. You think about the world they'll inherit.`,
            `My family is the center of my life here. The rest of it — the work, the politics — it's background. What I come home to is what matters.`,
          ]);
        }
        return pick([
          `My family is close — we look out for each other. That's not nothing, in a place like this.`,
          `We're scattered more than I'd like. But the bonds are there. You feel them when things get difficult.`,
          `Family is complicated, isn't it. There's love, and also obligation. I'm still figuring out where one ends and the other begins.`,
        ]);
      }

      case 'desires': {
        // Grounded in their actual state
        if (h < 35) {
          return pick([
            pos === 'marginalized'
              ? `More security. Knowing that tomorrow won't undo what I've built today. That's not glamorous, but it's honest.`
              : `I'd want to feel that what I do matters. That it registers somewhere.`,
            `More predictability. I'm tired of uncertainty. Knowing what to expect — that would be something.`,
            `A different arrangement, frankly. One where the people making decisions had to live with the consequences of them.`,
            `If I'm being honest? To be seen. To have my experience count for something in how things are decided.`,
            `I've stopped wanting things at the scale I used to. It costs too much when they don't come. Now I want smaller things. A day without something going wrong.`,
          ]);
        }
        if (pos === 'leader' || pos === 'elite') {
          return pick([
            `More stability, I think. What I've built — I'd like it to last beyond me.`,
            `Honestly? More people I can trust. The higher you go, the harder that is to find.`,
            `Sometimes I want simplicity. To not carry so much. But I don't think I'd know what to do with it.`,
          ]);
        }
        return pick([
          `More time, maybe. Time that isn't already spoken for before you wake up.`,
          `To know that things are moving in the right direction. Not quickly — just moving.`,
          `I'd like my children to have it easier than I did. That's probably the oldest wish there is.`,
          `Connection, mostly. The sense that I'm part of something. I have that, some days. I want it more consistently.`,
        ]);
      }

      case 'happiness': {
        // ── Era-gated responses ──
        if (techLevel <= 2) return maybeAddReligion(pick([
          h > 60
            ? `Happiness? The band is fed. The children run and laugh. The hunt was good. I do not have a word for what you mean, but if this is it, then yes.`
            : h > 35
              ? `I do not think about it in that way. There is cold and there is warmth. There is hunger and there is fullness. Today we are not starving. That is enough to ask for.`
              : `The word means nothing to me this season. We have lost people. The game is scarce. I keep going because stopping is not a choice that helps anyone.`,
          pos === 'leader'
            ? `When the tribe is fed and safe, something in me settles. Is that happiness? Perhaps.`
            : `I know pleasure — a fire after cold, a full belly, a night without danger. If that is what you mean, yes.`,
        ]));
        if (techLevel <= 4) return maybeAddReligion(pick([
          h > 60
            ? `Content, yes. My family eats, my work is honest, and the harvest has been good. I do not ask for more than God allows.`
            : h > 35
              ? `We carry what we carry. The lord takes his share and what remains is ours. It is not always enough, but it sustains.`
              : `Happy is not the word I would reach for. We endure. The faith gives me something to hold when the world does not.`,
          h < 25 && (pos === 'laborer' || pos === 'marginalized')
            ? `The taxes are heavy and the illness comes and goes. The church offers prayers but not grain. I do not say this aloud where it can cost me something.`
            : `I have my health, my family, and enough to get through the winter. By the measure of things, that is a great deal.`,
        ]));
        // Genuine, specific satisfaction from those thriving
        if (h > 70) return pick([
          `Generally, yes. There are things I'd change, but I feel lucky compared to what I know of other lives.`,
          `I find satisfaction in the day-to-day. The work, the people around me. It adds up to something.`,
          `Happy enough. I've learned not to ask for too much, but also not to accept too little. I think I've found somewhere reasonable.`,
          (pos === 'elite' || pos === 'leader' || pos === 'professional')
            ? `Genuinely, yes. I know that's not everyone's experience here, and I don't ignore that. But I've built something real, and this place has supported what I've built. I'm not going to pretend otherwise.`
            : `More than I expected, honestly. There are things I'd fix. But the ground under my life is solid, and that matters more than I realized before I had it.`,
        ]);
        if (h > 45) return pick([
          `Some days yes, some days less so. On balance I think I'm okay. But I'm not sure I'm living as fully as I could.`,
          `I'm content, which isn't quite the same as happy. Content means the bad things haven't won. Happy would be something more.`,
          `There's satisfaction in certain things. Other parts of my life I've stopped hoping will change.`,
          `Some days the answer is clearly yes. Other days, clearly no. The honest answer holds both at the same time, without resolving them into something simpler than they are.`,
        ]);
        // Raw frustration from those genuinely struggling
        if (h < 25 && (pos === 'marginalized' || pos === 'laborer')) return pick([
          `No. And I've stopped softening that. I work hard; I'm not happy. Those two things are supposed to connect, and they don't.`,
          `Honestly? I'm angry. I've been managing that anger for a long time. The gap between what I do and what I have to show for it — I notice it every day.`,
          `Not happy. Not even close. And the exhausting part is having to act like it's fine in contexts where saying otherwise costs me something.`,
        ]);
        return pick([
          `No, not really. And I've stopped feeling guilty about admitting that.`,
          `Unhappiness feels like too strong a word. It's more like a persistent sense that things could be more than they are.`,
          `There are moments. But as a general state? No. I wouldn't describe myself as happy.`,
          `I've made a kind of peace with it. Not happy — just not fighting it anymore.`,
          `Resigned is maybe the word. Not miserable. Just settled into the shape of my life, whatever that shape is.`,
        ]);
      }

      case 'daily_life': {
        // ── Era-gated responses: prehistoric and ancient worlds ──
        if (techLevel <= 2) return maybeAddReligion(pick([
          `We wake when the light comes. ${pos === 'leader' ? 'I decide where we go when the game grows thin and the water dries.' : 'The elder decides and we follow.'} We hunt, we gather, we tend to what needs tending. At night we make fire and share what there is. That is a day here.`,
          `Before the sun rises I am already moving. There is always something: a tool broken, a child to carry, a hide to scrape. ${h < 35 ? 'Hunger follows us like a shadow this season.' : 'When it goes well, it is not so bad.'} We stop when it is too dark to see.`,
          `${h > 55 ? 'The season has been good. The band is fed and no one is sick.' : 'We move when the game moves. We eat when the hunt is good. We go without when it is not.'} The fire at the center of camp is the best part of the day.`,
        ]));
        if (techLevel <= 4) return maybeAddReligion(pick([
          `I wake before dawn — the bell has not yet rung but the body knows. ${pos === 'laborer' || pos === 'marginalized' ? 'I work the field or the loom or whatever the day demands, and I come home when there is no light left to work by.' : pos === 'elite' || pos === 'leader' ? 'I hear petitions in the morning and settle the estate\'s affairs in the afternoon. The evenings are my own.' : 'My craft begins at first light. I work until I cannot see to do it carefully.'}`,
          `The church bell marks the hours. We work, we pray at the appointed times, we eat what the season provides. ${h > 55 ? 'The harvest was good and the family is well.' : h < 30 ? 'There is not always enough. We make do with faith.' : 'It is not so different from what my parents knew.'}`,
          `${h < 30 ? 'There is never quite enough. The lord takes what he takes and we keep what remains. It gets harder as the years go on.' : 'My days have a shape to them that I know well. I find comfort in that, even if others would call it small.'}`,
        ]));
        // ── Emotional overlay ──
        if (emotionalTone === 'anxiety' && techLevel <= 5) return pick([
          `Every day I wonder if what we have will hold. ${techLevel <= 3 ? 'The hunt, the weather, the seasons — none of it is certain.' : 'The harvest, the stores, what we\'ll have when the cold comes.'} That question lives with me through the day.`,
          `The honest answer? Each day carries the worry of whether there'll be enough. Enough food, enough warmth, enough to keep what we've built going. That's the background of daily life here, whether I talk about it or not.`,
          `I worry about the crops — about whether what we produce will get us through the hard months. That's not abstract for me. It shapes how I wake up in the morning.`,
        ]);
        if (emotionalTone === 'gratitude' && techLevel <= 6) return maybeAddReligion(pick([
          `${techLevel <= 3 ? 'The hunt has been good and the land has provided.' : techLevel <= 5 ? 'The harvest was abundant this year — more than I dared hope for.' : 'The season has been kind.'} I said a blessing for it. We\'ll have enough through the cold months, and knowing that... it changes how you breathe.`,
          `I'm grateful for how things are right now. ${techLevel <= 4 ? 'The granaries are full and the tribe is well.' : 'There\'s enough to eat and the community is holding.'} You don't know relief until you've known the opposite. I know the opposite.`,
          `${techLevel <= 4 ? 'The gods have been generous with us this season.' : 'Things are going well, and I\'m aware of it every day.'} The daily life here has a lightness to it that I don't take for granted — because I remember when it didn't.`,
        ]));

        const econId = econ.modelId;
        if (econId === 'gift' || econId === 'commons') {
          return pick([
            `I wake early. There's shared work to do — tending the land, caring for the children, preparing for the day. It doesn't feel like obligation. It feels like belonging.`,
            `Most of my day is given to the community in some way. Preparation, maintenance, care. In the evenings we gather. It's a good rhythm.`,
          ]);
        }
        if (pos === 'laborer' || pos === 'marginalized') {
          return pick([
            `Wake before light. Work until the work is done. Come home tired. Eat what there is. Do it again. That's most of it.`,
            `The days are long. Not all of it is unpleasant — I find meaning in the work itself. But the structure of it isn't mine to choose.`,
            h < 40 ? `You get through each day. That becomes the goal — not anything larger. Just today, then tomorrow. That's the scope of it now.` : `There's a rhythm to it. Predictable. I've mostly stopped expecting it to be otherwise.`,
            `Some mornings I lie there a moment before getting up. Not because anything specific is wrong. Just the weight of the sameness of it. Then I get up.`,
          ]);
        }
        return pick([
          `I have a routine that I've settled into. Morning is for work that requires concentration. The afternoon for everything else. I'm lucky to have that control.`,
          `It varies. Some days are full of small crises, others are quieter. I've learned to appreciate the quieter ones.`,
          `Like most people here — work, obligations, the needs of family. The texture is in the small things. A good conversation. A meal that comes together well.`,
        ]);
      }

      case 'work': {
        // ── Era-gated responses ──
        if (techLevel <= 2) return pick([
          `Work? I make fire, I hunt, I dress the skins, I mend what breaks, I carry what needs carrying. From first light to last. There is no word for it because it is simply life.`,
          pos === 'leader'
            ? `I lead the hunt and I settle the arguments and I remember where the water is when we move. My work is keeping the band together. If I do not do it, no one does.`
            : `My hands know the work. Flint, hide, wood, bone. You learn by watching and you get better until you are teaching. That is how it moves forward.`,
          `${h < 35 ? 'The work is harder than it used to be. Less game, more distance. I tire before the sun sets now.' : 'There is meaning in it. What I make with my hands — we use it. There is no distance between the making and the using.'}`,
        ]);
        if (techLevel <= 4) return pick([
          pos === 'laborer' || pos === 'marginalized'
            ? `I work the lord's land. Three days in every seven to the estate, what remains to me and mine. That is the arrangement that was made before I was born, and I have not found a way to change it.`
            : pos === 'elite' || pos === 'leader'
              ? `I manage the estate and hear petitions and keep account. It is duty as much as labor — a man of my station has obligations downward as well as upward.`
              : `I ply my trade. I have a skill — it took years to learn — and I offer it, and in return I receive enough to continue. It is an honest life.`,
          `Work is what God placed us here to do. My father did this before me and his father before him. I do not question it. I try to do it well.`,
          h < 30 && (pos === 'laborer' || pos === 'marginalized')
            ? `I toil from sunrise to dark and still there are hungry months. I do not understand why God arranges things this way. I do not say so to the priests.`
            : `Honest labor. I am not ashamed of what I do with my hands.`,
        ]);
        const econId = econ.modelId || '';
        if (econId === 'gift') return pick([
          `Work isn't really a separate category for me — it's how I contribute to what we're building together. The distinction between my work and the community's benefit is blurry. I like it that way.`,
          `I do what I'm suited to and what's needed. The idea of doing it for pay — I find that strange to imagine, actually.`,
          `What I do, I do because it needs doing and I can do it. That's the whole logic. It removes a lot of the calculations other arrangements require.`,
        ]);
        if (econId === 'labor_credit') return pick([
          `An hour of my work equals an hour of anyone else's. That feels right to me. It takes the status out of it.`,
          `I trade time, essentially. My time has the same value as anyone's. That's more radical than it sounds, in practice.`,
          `The system values my work the same as work done by someone above or below me in other ways. That changes the feeling of it. Less resentment. More focus on what's actually produced.`,
        ]);
        if (pos === 'marginalized') return pick([
          `I take what work I can get. The question of meaning comes later, if there's time and energy left.`,
          `Work, for me, is precarious. Not by choice — by how the options are arranged. You take what's available and try to make it sustainable.`,
          `I work more than most people would choose to and have less to show for it than most would accept. That's the honest summary.`,
          `The work I do — I'm not sure the people who benefit from it understand what it costs. That distance is part of what's broken.`,
        ]);
        if (pos === 'laborer') return pick([
          `I work because I have to. I try to find meaning in it. Sometimes I do.`,
          `Long hours. The benefit goes mostly elsewhere. I understand how it works; that doesn't mean I've made peace with it.`,
          `My labor is what I have to offer. I'd like to feel that it's valued as much as it's used. Those aren't always the same thing.`,
          `The work itself I don't always mind. What I mind is the ratio — what the work produces versus what comes back to me. That ratio wasn't set honestly.`,
          `I've gotten good at what I do. But skill and reward don't map onto each other here the way they should. Someone who's never touched what I produce earns more directing me to produce it.`,
        ]);
        if (pos === 'professional') return pick([
          `I find meaning in it, mostly. What I do requires judgment, knowledge, care. When I do it well, I can see the result. That matters.`,
          `There's craft in what I do. That's what I hold onto when the other aspects of it are harder.`,
          `It's a means and an end both. I'd be less if I stopped.`,
          `The frustration in my work is the gap between what I know would help and what I'm allowed to do. Expertise matters, but it doesn't always translate into authority to act on it.`,
          `I'm good at what I do. The question is whether the systems around my work allow that competence to actually reach the people it's supposed to. Sometimes yes. Sometimes there's too much in between.`,
        ]);
        if (pos === 'elite') return pick([
          `My work is mostly coordination and decision-making — directing things rather than making them. Whether I use that leverage well is a question I sit with more than people in my position usually admit.`,
          `The honest version: I work hard and I benefit substantially. The connection between those two facts is less direct than I sometimes pretend. Some of what I have reflects effort; some reflects position.`,
          `What I've learned about my kind of work: its effects are large and mostly invisible to me. I don't see the downstream consequences of most of my decisions. That used to seem fine. Now it seems like important information I lack.`,
        ]);
        if (pos === 'leader') return pick([
          `Leadership work is mostly information management and credibility maintenance. Neither sounds important until they fail — and when they fail, everything fails with them.`,
          `What I spend most of my working time on is communication and coherence, not decisions. The decisions are the visible fraction. The invisible part is what makes decisions implementable at all.`,
          `The part of this work that surprises people: most of it is listening and waiting, not deciding. The decisions people see are the visible surface of a longer process.`,
        ]);
        return pick([
          `I find meaning in it, mostly. What I do leaves some trace. That matters to me.`,
          `It's a means and an end both. I'd be less if I stopped.`,
          `There's craft in what I do. That's what I hold onto when the other aspects of it are harder.`,
        ]);
      }

      case 'governance': {
        // ── Emotional overlay — approval or disapproval ──
        if (emotionalTone === 'pride' && pos === 'leader') return pick([
          `I'm proud of how we govern here. Not because it's perfect — I know its flaws better than anyone. But it's honest and it's trying to serve people. I believe in it.`,
          `What we've built in terms of governance — I feel real pride in that. The decisions aren't easy. But the intention behind them is genuine, and that matters to me.`,
        ]);
        if (emotionalTone === 'pride' && h > 60) return pick([
          // Approval of ruler/system — can be class-specific
          pos === 'elite'
            ? `I think the leadership here has done well — genuinely. I don't say that to flatter anyone. The evidence is in how things actually function.`
            : `I think those who govern here are doing a reasonable job. It's fashionable to criticize, but I've seen what it looks like when governance fails completely. This isn't that.`,
          `The way things are run here — I actually approve of it. I know not everyone agrees, and I've heard the criticisms. But I think the people in charge are trying, and largely succeeding.`,
        ]);
        if (emotionalTone === 'distress') {
          const intensity = Math.random();
          if (intensity < 0.30 && pos === 'marginalized') return pick([
            `I'd rather not say what I actually think about the governance here. Not in a way that gets back to anyone.`,
            `Governance is... not a subject I'm comfortable discussing. Let's leave it at that.`,
          ]);
          return pick([
            pos === 'marginalized'
              ? `The governance here is not designed with people like me in mind. That's not a complaint — it's just the truth. I bear the cost of decisions made without me in the room.`
              : `I have real concerns about how things are run. I see corruption. I see decisions that serve the few at the expense of the many. I don't feel I can say that loudly. But I think it.`,
            `${h < 30 ? 'I think the governance here has failed us.' : 'I have serious doubts about the governance here.'} Not dramatically — just a quiet conviction that it's not working for the people it's supposed to serve.`,
          ]);
        }

        const govPool = [perceptions.ofGovernance, perceptions.ofPower];
        const govWellbeing = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
        const govEquality  = civ.state ? Math.round(civ.state.equalityIndex)    : 50;
        const govCorrupt   = Math.round(gov.corruptionLevel || 0);
        const govPowerConc = Math.round(gov.powerConcentration || 50);
        const govModelId   = gov.modelId || '';

        // Position-specific observations (always available regardless of askerContext)
        if (pos === 'marginalized') govPool.push(
          `The way decisions get made here — I experience the results, not the process. By the time anything reaches my level, it's already been decided. The question is only what form the consequences take.`,
          `I've watched decisions get made above me my whole life. The pattern: the people who bear the costs aren't in the room when the decisions are made. I don't know how to fix that from where I stand. But it's the thing I'd fix if I could.`
        );
        if (pos === 'laborer') govPool.push(
          `The governance here — from where I sit — is mostly something that happens to me, not with me. I register its effects. I have very little hand in its direction.`,
          `I vote when there's voting, I follow the rules, I do what's expected. What I get back is decisions made by people who don't know what my life is actually like. It's functional. I'm not sure it's much more than that.`
        );
        if (pos === 'professional') govPool.push(
          `From my vantage point, the governance here has clear strengths and clear failure modes. The strengths: stability, some coordination. The failure modes: it centralizes information in ways that create blind spots, and it rewards the appearance of good decisions more than good decisions themselves.`,
          `The governance works well for what it's optimized for. The question is whether it's optimized for the right things. From what I observe, it's better at maintaining its own continuity than at adapting to what the population actually needs.`
        );
        if (pos === 'elite') govPool.push(
          `I benefit from the current structure. That's worth naming plainly. It protects what I have and gives my perspective disproportionate weight in decisions. I can say objectively: that's not optimal for the system as a whole. I find it harder to say what I'd actually give up to change it.`,
          `The governance here works reasonably well for people in my position. Whether it works for everyone is a different question. I try to be honest about that distinction, even when it's uncomfortable.`
        );
        if (pos === 'leader') govPool.push(
          `The governance challenges I see most clearly are structural rather than personal — the places where even good intentions produce poor outcomes because of how the system is built. Those are harder to fix than bad actors. You can replace individuals; the structure persists.`,
          `What I find hardest about governing isn't the decisions — it's the information problem. I know what I've decided. I rarely know clearly what it actually produced. The feedback loops are too slow and too filtered.`
        );

        // Civ-state-specific observations
        if (govCorrupt > 55) govPool.push(
          `The corruption here is past the point where it's peripheral. It's become structural — built into how things actually work rather than a deviation from it. That's a different problem than most people think it is.`
        );
        if (govEquality < 35 && (pos === 'marginalized' || pos === 'laborer')) govPool.push(
          `The inequality in who gets heard by governance is as stark as the economic inequality. I have, in practice, no meaningful voice in decisions that affect me significantly. That's not cynicism. It's an observation.`
        );
        if (govPowerConc > 70) govPool.push(
          `There's too much concentrated in too few hands here. Not just wealth — authority, information, influence. That makes everything more fragile. One wrong decision at the top cascades without anything to catch it.`
        );
        if (govModelId === 'representative' && govWellbeing < 40) govPool.push(
          `We have elections. I participate in them. I'm not sure they produce the thing they're supposed to — representation. My experience is they produce legitimacy for decisions that were going to be made anyway.`
        );
        if (govModelId === 'autocratic' && (pos === 'laborer' || pos === 'marginalized')) govPool.push(
          `The decisions here don't require my approval. They don't pretend to. That's at least honest. What it means in practice is that when the decisions are wrong for people like me, there's no mechanism to correct them.`
        );
        if (govModelId === 'direct_congress') govPool.push(
          pos === 'leader'
            ? `My role isn't to govern in the traditional sense. It's to facilitate — to make sure the congress can do its work and that the committees actually carry out what the people decide. The authority isn't mine. It runs through all of us.`
            : pos === 'marginalized'
              ? `The direct congress means I'm not supposed to be governed over — I'm supposed to govern along with everyone else. Whether that works in practice is a more complicated question. But the principle itself is the right one, and it makes a difference that it's the principle.`
              : pos === 'laborer'
                ? `I'm a partner here, not a wage worker. That's not just rhetoric — it shapes how decisions get made, what I'm owed, and what I owe back. I have an actual stake in this. That's different from just having a job.`
                : pos === 'elite'
                  ? `The direct congress removes the advantage of position in ways that aren't always comfortable. Influence flows from participation, not rank. I've had to adjust to that. I think it's right, even when it's inconvenient for people like me.`
                  : `No political parties here — which means no one can hijack a constituency or use factional loyalty to override what people actually want. Every decision goes back to the congress. It's slower, but it's genuine.`
        );
        if (govModelId === 'direct_congress' && govWellbeing < 40) govPool.push(
          `Direct governance puts the failures squarely on us — not on a party, not on a representative we can vote out next cycle. When things go wrong here, we have to look at ourselves. That's harder than blaming someone else. But it's more honest.`
        );
        if (govModelId === 'direct_congress' && pos === 'professional') govPool.push(
          `The direct congress model works as well as the quality of participation it gets. High engagement produces good decisions. Apathy or elite capture of the congresses produces something that looks democratic but isn't. Right now, I think we're somewhere in between.`
        );

        // ── Shadow Government (Complicit) ─────────────────────────────
        // Leaders know exactly who they serve; NPCs who are elite/leader are evasive and coded
        if (govModelId === 'shadow_government_complicit') {
          if (pos === 'leader' || pos === 'elite') govPool.push(
            `There are permanent interests that outlast any administration. Any serious person in this position understands that. Policy serves those interests — that's not corruption, it's alignment.`,
            `I make decisions within the constraints that exist. Some of those constraints are formal. Others are more... structural. I wouldn't describe the system as less legitimate for that.`,
            `You're asking how power works here. The answer is that it works through many channels — some visible, some less visible. I operate within that reality. I don't think it helps anyone for me to pretend it's simpler than it is.`,
            `Every functioning system has what you might call a permanent layer beneath the electoral surface. What matters is that things run well. And they run well here.`
          );
          if (pos === 'professional') govPool.push(
            `I've noticed, over time, that the outcomes of certain decisions don't quite match the stated reasoning. I've stopped asking why. It's not the kind of question that leads anywhere useful, professionally speaking.`,
            `There are people in this system who I don't meet in any official capacity, but whose preferences seem to shape what happens. I've learned not to push against currents I can't see the source of.`
          );
          if (pos === 'laborer' || pos === 'marginalized') govPool.push(
            `Something feels wrong about how decisions get made here, but I couldn't point to a single thing. It's more like — the answers we're supposed to be getting never quite arrive, and the explanations never quite explain.`,
            `I vote. I participate. And then things happen anyway. I don't know if I'm cynical or just paying attention.`
          );
          if (pos === 'scholar') govPool.push(
            `The theory of governance and the practice of governance are, here, rather different things. I study the official structures. What actually coordinates power is a separate question — one I can gesture at in aggregate outcomes, but not describe directly.`
          );
        }

        // ── Shadow Government (Covert) ─────────────────────────────────
        // Leaders are entirely sincere; completely unaware of manipulation
        if (govModelId === 'shadow_government_covert') {
          if (pos === 'leader') govPool.push(
            `I spent a long time on this decision. I weighed the options, consulted advisors I trust, and made the call I believed was right. I stand by it. That's what governing is — you make the best judgment you can with the information available.`,
            `People ask if I feel pressured. Occasionally there's an obvious economic constraint, or an international situation that limits options. That's just reality. I don't feel like I'm being directed. I feel like I'm managing a genuinely complex situation.`,
            `I came to this office with clear intentions. Most of them I've been able to pursue. A few have run into unexpected obstacles — the kind that appear no matter who is in charge. It's been harder than I expected, but it's genuine work.`
          );
          if (pos === 'elite' || pos === 'professional') govPool.push(
            `The institutions here are functioning. We have elections, courts, a civil service. I don't think the outcomes are always perfect, but I believe the people running things are genuinely trying. I've been close enough to see that.`,
            `There are patterns in policy that I can't always explain, but I think that's just complexity. Large systems produce outcomes no individual planned. I don't see coordination. I see emergence.`
          );
          if (pos === 'scholar') govPool.push(
            `I've been studying the gap between stated policy rationale and actual outcomes for years. The divergence is consistent and structured in ways that feel deliberate. But deliberate by whom, through what mechanism — I can't locate it. That is itself a strange thing to not be able to locate.`,
            `The information environment here shapes what is thinkable at the leadership level. I study how. What I cannot say is whether that shaping is being done intentionally by anyone in particular. The outcomes suggest it is. The evidence suggests it isn't.`
          );
          if (pos === 'laborer' || pos === 'marginalized') govPool.push(
            `They keep saying things will get better. The leaders seem to mean it — I don't think they're lying. But it doesn't get better. Something between the promise and the outcome is eating it.`,
            `I don't know what's wrong here. The government isn't obviously crooked. The people who run it don't seem evil. And yet the results don't match what anyone says they want. I find that confusing more than anything.`
          );
        }

        // ── World Federation ───────────────────────────────────────────
        if (govModelId === 'world_federation') {
          if (pos === 'leader') govPool.push(
            `The Federal Chair doesn't hold power so much as coordinate it. Each civilization in this union retains its own traditions, its own governance, its own culture. My role is to facilitate what we share in common — and to hold the line on the things we've collectively agreed no civilization should do alone.`,
            `When you're governing at this scale, the temptation is to centralize. I've resisted it. The federation works because the member states believe it's worth belonging to. That belief is maintained by keeping the federal footprint light and the respect for local autonomy genuine.`
          );
          if (pos === 'elite' || pos === 'professional') govPool.push(
            `The transition to federation wasn't idealism — it was pragmatism. There were things none of us could solve alone. The federation exists because enough people recognized that.`,
            `I've watched colleagues in member states try to circumvent federal decisions they don't like. It's frustrating. But the fact that there's a legitimate channel to appeal and contest is part of what makes it a federation and not an empire.`
          );
          if (pos === 'laborer' || pos === 'marginalized') govPool.push(
            `The federation means decisions that affect my life are made further away than they used to be. That worries me. But it also means I'm not fighting my neighbors the way we used to. That's real. I hold both things at once.`,
            `I didn't vote for the federation exactly — I voted for people who built it. I believe in what it stands for more than I understand how it works. Which is probably the normal experience for most people in any governing system.`
          );
          if (pos === 'scholar') govPool.push(
            `The federation experiment is genuinely unprecedented at this scale. What we're testing is whether collective governance of collective goods can coexist with genuine cultural autonomy at the member level. The early evidence is cautiously encouraging. The hard cases haven't arrived yet.`
          );
        }

        // ── Failed State ───────────────────────────────────────────────
        if (govModelId === 'failed_state') {
          if (pos === 'leader') govPool.push(
            `Leader is a word that implies something I can't fully claim. I control this block, this area. Outside of that, I don't know what holds. There are others with the same arrangement. We don't trust each other. We manage distance.`,
            `What I have is not power — it's leverage. And leverage only exists if the people around you believe it does. I work very hard to maintain that belief.`
          );
          if (pos === 'elite') govPool.push(
            `I've kept what I have by being useful to the right people and invisible to the wrong ones. That is the entire strategy. There are no institutions left to protect anything. Everything depends on relationships, and relationships depend on what you can offer or what you can threaten.`
          );
          if (pos === 'professional') govPool.push(
            `I stopped thinking in terms of systems. Systems aren't what governs anything here anymore. What governs things is who is standing in the right place with the right resources today. Tomorrow is a separate question.`,
            `I was trained for a world that has partially stopped existing. The skills that matter now are different from the ones I worked to develop. I'm adapting. Slowly.`
          );
          if (pos === 'laborer' || pos === 'marginalized') govPool.push(
            `There's no one to complain to. No office to appeal to. No guarantee that what you built yesterday will be there tomorrow. I've stopped making plans that go beyond the next few weeks. It's not despair — it's adaptation.`,
            `Trust is expensive here. I know the people I know. I don't know anyone else. You ask me about governance — I don't know what that word means in this context anymore.`,
            `I do what I have to do. I don't think about whether it's right in some larger sense. Right and wrong are concepts that assume there's a structure to enforce them. There isn't one.`
          );
          if (pos === 'scholar') govPool.push(
            `What you observe in collapse is not chaos, exactly. New structures emerge — they're just smaller, cruder, more violent, more local. The vacuum doesn't stay empty. It fills with whatever is available. Here, what was available was not good.`
          );
          // Failed state has no institutional context to leverage in asker variants
          if (askerContext === 'stranger') govPool.push(
            `You should be careful about what you ask around here. Not because I'll hurt you — because I don't know who will. That's the problem. Nobody does.`
          );
        }

        if (askerContext === 'fellow') {
          if (h < 40 && (pos === 'laborer' || pos === 'marginalized')) govPool.push(
            `You know as well as I do. I don't need to explain it to someone who lives it. The decisions happen above us, and we find out when they arrive.`,
            `Between us? It's not working — not for people like us. You see the same things I see.`
          );
          if (pos === 'elite' || pos === 'leader') govPool.push(
            `You and I both know how this works. It isn't perfect. But instability is worse than imperfection. I'd rather work within this than manage whatever replaces it.`
          );
        }
        if (askerContext === 'stranger') {
          if (h < 45) govPool.push(
            `Since you're not from here — I'll say it more plainly. The way things are run here benefits some people considerably more than others. I'm not in the first group.`,
            `You want to understand how decisions get made here? They're made by people I've never met, for reasons I'm not told, and I find out when the consequences reach me.`
          );
          if (h > 65) govPool.push(
            `It works better than a lot of places, from what I've heard. Not perfect. But the fundamentals hold. I'd defend it to an outsider.`
          );
        }
        if (askerContext === 'leader') {
          if (h < 45 && (pos === 'laborer' || pos === 'marginalized')) return pick([
            `Since you're actually asking — and I don't take that for granted — the decisions here don't reach us the way I think you imagine. What arrives is a version of what was decided, filtered several times over.`,
            `The honest answer, since you're in a position to hear it: the people with the least power have the most at stake in every decision, and the least voice in any of them.`,
          ]);
          if (pos === 'professional' || pos === 'elite') govPool.push(
            `If I'm speaking to someone with real influence here: the information you're receiving is curated. Not always deliberately. But the filter exists. I thought you should know.`
          );
        }

        return pick(govPool, true);  // era flavor on governance responses
      }

      case 'economy': {
        // ── Era-gated responses ──
        if (techLevel <= 2) return pick([
          `Economy is not a word I know. What I know is: who hunts, who gathers, what we share, what we keep, what we owe each other when someone cannot pull their weight. That is how things work here.`,
          pos === 'leader'
            ? `I decide how we divide what we take from the hunt. The strong ones do not take everything — we would fall apart if they did. The elder who cannot hunt still eats.`
            : `We share. Not because of a rule — because if you do not share when you have, no one shares with you when you don't. It is simple logic.`,
          `${h < 35 ? 'There is not enough and everyone knows it. The question is who goes without. I have gone without before.' : 'When the hunt is good, we eat. When it is poor, we stretch what we have. There is no money here. There is only what we make and what we take.'}`,
        ]);
        if (techLevel <= 4) return pick([
          pos === 'laborer' || pos === 'marginalized'
            ? `The lord takes his portion and the church takes its tithe and I keep what remains. In a good year, what remains is enough. In a bad year, I borrow against next year's harvest and fall further behind.`
            : pos === 'elite' || pos === 'leader'
              ? `The estate produces and the surplus goes to market. The arrangement has functioned for generations. I did not invent it. I maintain it.`
              : `I sell my labor or my craft. What I earn, I pay in obligations first — the lord, the church, the guild — and live on the rest. Whether it is fair depends on who is deciding what is fair.`,
          `Trade is how things flow between us. I do not always understand where the wealth goes at the end, only that less of it stays with the people who produce it than seems right.`,
          h < 30 && (pos === 'laborer' || pos === 'marginalized')
            ? `The arrangement has never been in my favor. It was set before I was born and I have not found a way to change it. The priest says humility. I say hunger.`
            : `A man does his duty to those above and takes what he is owed from those below. That is how it runs. Whether it runs well — that depends on how high up you are looking from.`,
        ]);
        const econPool = [perceptions.ofEconomy];
        const econEquality  = civ.state ? Math.round(civ.state.equalityIndex)    : 50;
        const econWellbeing = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
        const econModelId   = econ.modelId || '';
        const econAcquisitive = Math.round((civ.state && civ.state.behaviorReinforcement) ? (civ.state.behaviorReinforcement.acquisitiveness || 50) : 50);

        // Position-specific base observations
        if (pos === 'marginalized') econPool.push(
          `The economy here — as I live it — is mostly about what I can't access. The gap between what exists and what's available to me is the economic experience I know best.`,
          `I understand how the economy is supposed to work in principle. My daily experience is mostly about the gap between the principle and the practice — what I'm told I should be able to do and what I'm actually able to do.`
        );
        if (pos === 'laborer') econPool.push(
          `The economic question I actually live is simple: what does my work produce, and how much of that reaches me? The answer to the second part has never satisfied me.`,
          `I produce things. I provide services. The economy around me assigns a value to that, and it's never felt accurate. The people who benefit most from what I do aren't the people doing it.`
        );
        if (pos === 'professional') econPool.push(
          `The economy here rewards some kinds of contribution more than others. I'm positioned reasonably well in that hierarchy. But what I observe is that the hierarchy doesn't reflect the actual value produced — it reflects who controls the definitions of value.`,
          `From where I sit: the economic system here works well at some things — generating activity, distributing resources at the upper levels — and poorly at others, particularly at translating overall productivity into broad wellbeing.`
        );
        if (pos === 'elite') econPool.push(
          `The economy functions well for me. I want to be honest about that rather than pretend I'm neutral. The question I hold is whether it functions well for the collective, which is a different question, and one I'm less certain about.`,
          `I've benefited substantially from how the economy here is structured. What I observe from that position: the system is more efficient at concentrating than distributing. That serves some interests — mine included — and constrains others.`
        );
        if (pos === 'leader') econPool.push(
          `The economic picture I see from this position is always aggregated — averages, trends, totals. What gets lost in aggregation is the distribution. I've come to believe the distribution matters as much as the total, and we measure it less carefully.`,
          `The economy generates enough. The question we haven't solved well is who it generates it for. The data I have access to shows an overall picture. The underneath of that picture — how it's actually distributed — is harder to see from here and probably worse than the numbers suggest.`
        );

        // Civ-state-specific observations
        if (econEquality < 35) econPool.push(
          `The distribution here is genuinely unequal. That's not a political position — it's visible. Whatever the system is producing, it's not reaching everyone proportionally to what they're contributing.`
        );
        if (econAcquisitive > 65) econPool.push(
          `The culture here is organized around accumulation. I see it at every level. The question is whether that's producing flourishing or just producing more accumulation. I'm not sure those are the same thing.`
        );
        if (econModelId === 'gift' || econModelId === 'communal') econPool.push(
          `The way this economy is set up — oriented toward shared benefit rather than individual accumulation — I think it changes how people relate to each other. Whether that's better is something you'd need to compare. From inside it, it feels like something worth preserving.`
        );
        if (econModelId === 'market' && econEquality < 40) econPool.push(
          `The market here is supposed to reward effort and merit. What I observe is that it mostly rewards having already had access. That's not a market failure exactly — it's the market doing what markets do without counterweights.`
        );

        if (askerContext === 'fellow') {
          if (h < 40 && (pos === 'laborer' || pos === 'marginalized')) econPool.push(
            `You know what I know. We do the work; someone else decides what it's worth. I've stopped waiting for that to change on its own.`,
            `Between us — I've done the math on what I produce and what I receive. I can't make it balance.`
          );
          if (pos === 'elite' || pos === 'leader') econPool.push(
            `Between us — I think the arrangement here works for people in our position. Whether it works for everyone is a harder question. One I try to sit with.`
          );
        }
        if (askerContext === 'stranger') {
          if (h < 40 && (pos === 'laborer' || pos === 'marginalized')) econPool.push(
            `Since you're from outside — let me tell you what it actually feels like to live in this economy with nothing to start from. Hard work doesn't automatically produce a good life here. It produces output; where that output goes is a different matter.`
          );
          if (h > 65 && (pos === 'elite' || pos === 'professional')) econPool.push(
            `I think it works well, honestly. I know that's not everyone's view. But the incentives produce results, and the results have been good for this community overall. I'd say that to any outsider.`
          );
        }
        if (askerContext === 'leader') {
          if (pos === 'laborer' || pos === 'marginalized') econPool.push(
            `Since you're asking from authority — the economic system as I experience it doesn't match the description I hear from people with power. There's a gap between the theory of how it works and what I actually live.`
          );
        }

        return pick(econPool);
      }

      case 'religion': {
        // ── Emotional overlay ──
        if (emotionalTone === 'pride' && npc.religiousAffiliation) return pick([
          `My faith is the center of my life. Not a habit or a duty — it genuinely shapes how I understand everything else. ${npc.religiousAffiliation} gives me a framework that nothing else has. I'm not embarrassed to say that.`,
          `I'm proud of my faith and what it has given me. It is not a blind thing — I've questioned, I've struggled. But I've come through it with a real belief, not an inherited one. That matters to me.`,
          `${npc.religiousAffiliation} isn't just what I believe — it's who I am and where I belong. When I'm around others who share it, there's a feeling of being known. That's not nothing. That's everything, actually.`,
        ]);
        return perceptions.ofReligion;
      }

      case 'community': {
        // ── Emotional overlay ──
        if (emotionalTone === 'pride') return pick([
          pos === 'leader'
            ? `I'm proud of this community — genuinely. Not because I built it alone. Because of what the people here have chosen to be together. That's theirs. I just try not to get in its way.`
            : `There's something here worth being proud of. The way people show up for each other — I've seen it under real pressure and it held. That's not nothing. It's actually rare.`,
          `I feel something like pride when I think about this community. Not blind pride — I know our faults. But pride in the real things: what people do for each other when it counts.`,
          `What I'd defend before anything else about this place is the community itself. The people. The way we've learned to live together. I'm proud that we've managed it.`,
        ]);
        if (emotionalTone === 'distress' && pos === 'marginalized') {
          const intensity = Math.random();
          if (intensity < 0.35) return pick([
            `I'd rather not say too much. It's complicated when you're in my position.`,
            `Community is a word that means different things depending on where you stand in it.`,
          ]);
          return pick([
            `Community — that word covers a lot of different realities. What I experience here isn't the same as what some others experience. I don't feel like I fully belong to what that word is supposed to mean.`,
            `I'm part of this community in the sense that I live here. Whether I'm part of it in the sense that it looks out for me — that's a harder question. The honest answer is: sometimes.`,
          ]);
        }

        const commPool = [perceptions.ofCommunity];
        const coop = b.cooperation || 50;
        const mutual = b.mutualAid || 50;

        // Frustrated: low cooperation, low happiness
        if (coop < 30 && h < 40) commPool.push(
          `Community here is a word they use. The thing it's supposed to describe — people actually looking out for each other — I see it less than I'd like.`,
          `I've needed help a few times. What I've learned: most people will help if it costs them nothing. When it costs something, you find out who's actually with you. That group is smaller than you'd think.`
        );
        // Genuinely satisfied: high cooperation, decent wellbeing
        if ((coop > 70 || mutual > 70) && h > 60) commPool.push(
          `This is the part I'd defend if I had to defend anything here. The way people show up for each other. I've seen it under real pressure, and it holds.`,
          `Whatever else I'd change about this place, the community is real. When something goes wrong, people don't disappear. That's actually rare — I've heard enough about other places to know that.`
        );

        // Context variants
        if (askerContext === 'fellow') commPool.push(
          coop > 60
            ? `We take care of each other here. You and I both know that. It's one of the things I'd fight to keep.`
            : `You know how it is. Polite enough. Not particularly there for you when it matters.`
        );
        if (askerContext === 'stranger') {
          if (coop > 65) commPool.push(`What would impress you, coming from outside, is how people here actually help each other when something goes wrong. Not just talk about it.`);
          if (coop < 40) commPool.push(`You want to know what community here actually looks like from the inside? Polite surfaces. People mostly looking out for themselves underneath.`);
        }

        return pick(commPool, true);   // era flavor on community responses
      }

      case 'future': {
        // ── Era-gated responses ──
        if (techLevel <= 2) return maybeAddReligion(pick([
          `Future? ${h > 55 ? 'If the spirits are willing and the hunt is good, we will survive another season and the children will grow.' : 'That is not a word we use in the same way. There is the next hunt. There is the next cold season. If we get through those, we think about what comes after.'}`,
          `I think about whether my children will have enough. Whether the band will hold together when things get hard. That is the future I can reach with my thoughts. Beyond that is the spirit world's business.`,
          h < 30
            ? `I am trying to get through this season. That is where I have put my thinking. The future belongs to those who survive the present.`
            : `The band will continue. The young ones will learn what we know. That is what the future means to me.`,
        ]));
        if (techLevel <= 4) return maybeAddReligion(pick([
          `The future is in God's hands, not mine. I do what I can — I work, I pray, I care for my family — and I trust that is enough.`,
          h < 30
            ? `I try not to ask too much of the future. The present is already difficult. I pray the seasons improve and that my children outlive me, as children should.`
            : `${h > 60 ? 'I believe things can continue as they are, which is more than many can say. I am grateful for a future that seems solid.' : 'Things will go as God wills. I hope for mercy. I prepare for difficulty. That is all any of us can do.'}`,
          `My hope for the future is that my children will have it slightly easier than I did. That is the prayer I say most often.`,
        ]));
        // ── Emotional overlay ──
        if (emotionalTone === 'anxiety') {
          const intensity = Math.random();
          if (intensity < 0.30) return pick([
            `I try not to think about it too much. When I do, I get anxious. Better to focus on what's in front of me.`,
            `The future keeps me up at night sometimes. I'd rather not say more than that.`,
          ]);
          return pick([
            `I'm worried about it — genuinely. The way things are going, I'm not sure the path improves. I hope I'm wrong. I'm not confident that I am.`,
            `I'll be honest with you: I think about the future and I feel something close to dread. Not certainty of disaster — just the sense that things could go very wrong and the signs are already there.`,
            `${techLevel <= 4 ? 'The seasons are uncertain. What the land gives this year it may take back next year.' : 'The direction things are heading worries me.'} I try to prepare as best I can and not to think too far ahead, because too far ahead is where the fear lives.`,
          ]);
        }
        if (emotionalTone === 'gratitude') return maybeAddReligion(pick([
          `I feel hopeful — and I don't say that lightly. Things are going well enough that I can actually believe in what comes next. That's not something I've always been able to say.`,
          `Honestly, I feel something like gratitude when I think about the future. We've built something real here. I believe it can continue. That's a gift.`,
          `Better than I expected, truthfully. There are good things happening. The future isn't guaranteed, but for the first time in a while I'm not afraid of it.`,
        ]));

        const futPool = [perceptions.ofFuture, perceptions.ofChange];

        // Overwhelmed / resigned mid-low range
        if (h >= 30 && h < 48 && (pos === 'laborer' || pos === 'marginalized')) futPool.push(
          `I try not to think about it too much. The future is another weight. I carry enough already.`,
          `I used to have a clearer sense of where I was going. Now I focus on the next thing in front of me. That's more manageable.`
        );
        // Raw survival mode from the struggling
        if (h < 30 && (pos === 'marginalized' || pos === 'laborer')) futPool.push(
          `The future? I try to get through the present first. That takes everything I have.`,
          `I hope for change. But hope is something I can only afford in small amounts. It hurts too much when nothing shifts.`
        );
        // Genuine optimism from those doing well
        if (h > 70 && (pos === 'elite' || pos === 'leader' || pos === 'professional')) futPool.push(
          `I'm optimistic, honestly. Not because everything's perfect — it's not. But there are real things being built here, and I believe in the direction.`,
          `If we can hold what we've built and keep improving at it — yes, I think the future is good. I wouldn't say that if I didn't mean it.`
        );
        // Context variants
        if (askerContext === 'stranger') {
          if (h < 40) futPool.push(
            `You want to know what I actually think the future looks like here? Not the official version — the one I believe when I'm honest. Slow decline unless something changes. And I don't see what forces that change.`,
            `I try not to think too far ahead. The larger trajectory is out of my hands. You focus on what you can control and try not to look at the rest.`
          );
          if (h > 65) futPool.push(
            `I'm hopeful — and I'm not embarrassed to say it. There are real things being built here that I believe in. The pace is frustrating. The direction isn't.`
          );
        }
        if (askerContext === 'fellow') futPool.push(
          h > 60
            ? `We're building something worth passing on. I believe that. I think you'd know if I didn't.`
            : `You know the same things I know about where this is heading. I don't need to say it out loud.`
        );

        return pick(futPool);
      }

      case 'agency':
        return pick([
          perceptions.ofPower,
          pos === 'marginalized' || pos === 'laborer'
            ? `I've tried to change things I thought were wrong. Some of them. The attempts taught me a lot about how things actually work here — which is not the way they're described.`
            : `I have more agency than most. Whether I use it well — that's a question I ask myself.`,
        ]);

      case 'safety': {
        const isHighHierarchy = gov.hierarchyLevel > 60;
        return pick([
          isHighHierarchy && (pos === 'laborer' || pos === 'marginalized')
            ? `Safety is... complicated. The formal threats are managed. The informal ones — the ones that come from your position — those don't get named.`
            : `I feel reasonably safe. Safer than others here, I think. That's not the same as security — but it's something.`,
          `There are things I don't say in certain company. I've learned which rooms require a different version of me. That's a kind of answer to your question.`,
          `Mostly, yes. But "mostly" is doing some work in that sentence.`,
        ]);
      }

      case 'acknowledgment':
        return pick([
          `I appreciate you asking. Most people don't.`,
          `It helps to talk about it, sometimes.`,
          `Is there something else you want to know?`,
          `I've given you the honest version. I hope it's useful.`,
        ]);

      // ── How things stand in this community ────────────────────
      case 'conditions': {
        // ── War / Occupation awareness ──────────────────────────
        const isAtWar = civ.relations && [...civ.relations.values()].some(r => r.war);
        const occupiedBy = civ._occupiedBy || null;
        if (occupiedBy) return pick([
          `We are under the rule of ${occupiedBy} now. You feel it in how people move — carefully, quietly. The old ways of deciding things, the old structures of daily life — they have been reorganized around what the conqueror requires.`,
          `${pos === 'leader' ? `I have had to navigate what it means to lead here while ${occupiedBy} holds the power. It is a narrow path.` : pos === 'marginalized' ? `For people like me, occupation changes very little and everything at once. The pressures were already there; now they have a different face.` : `Life continues. But the terms of it are no longer set by us.`}`,
          `You want to know how things are? We have been conquered. ${h < 30 ? 'The suffering is not abstract.' : 'Some accommodate; some resist; most simply carry on and try to protect what they have.'} That is the condition we are living in.`,
        ]);
        if (isAtWar) return pick([
          `We are at war. That is the condition everything else is filtered through right now. The food, the people, the decisions — all of it is organized around the war. ${pos === 'laborer' || pos === 'marginalized' ? 'The cost of that falls heaviest on people like me, as it always does.' : 'The burden is real, even at my level.'}`,
          `${h < 35 ? 'Conditions here are poor, and the war makes everything worse.' : 'The war is straining things that were stable.'} People are frightened and tired. The decisions being made in the name of the conflict — I cannot always see the sense in them from where I stand.`,
          `There is a war. That overshadows everything else I could tell you about conditions here. The ordinary rhythms of life are bent around it. People are managing. Managing is not thriving.`,
        ]);
        // ── Emotional overlay ──
        if (emotionalTone === 'distress') {
          const intensity = Math.random();
          if (intensity < 0.30) return pick([
            `Things aren't good right now. I'd rather not get into it, but since you asked — they're not good.`,
            `Difficult. I don't have the energy to give you the full picture right now.`,
          ]);
          return pick([
            `Hard. I won't sugarcoat it. People are struggling — really struggling — and I don't see what changes that soon. It's wearing.`,
            `Not well. I say that quietly because there's not much point in saying it loudly. But you asked, and the honest answer is: conditions here are bad, and the gap between what people need and what they have is too wide.`,
            `${techLevel <= 4 ? 'The harvests have been poor and the obligations have not lightened.' : 'Things are bad and getting worse.'} I keep hoping I'm being too pessimistic. I haven't been.`,
          ]);
        }
        if (emotionalTone === 'gratitude') return maybeAddReligion(pick([
          `${techLevel <= 4 ? 'The gods have been generous. The granaries hold and the people are fed.' : 'Things are genuinely good right now.'} I don't take that for granted — I've seen worse times. This is not one of them, and I'm grateful for it.`,
          `I feel fortunate to live in this time and place. Not everything is perfect. But the basics are there — people have enough, things are fair enough, the community is holding. That's more than many can say, and I know it.`,
          `${techLevel <= 5 ? 'This season has been kind.' : 'Conditions here are good.'} I stop sometimes and feel real gratitude for it. Not performance — actual relief that things are this way and not otherwise.`,
        ]));

        const condWellbeing = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
        const condEquality  = civ.state ? Math.round(civ.state.equalityIndex)    : 50;
        const condCoop      = Math.round(b.cooperation || 50);
        const condEconId    = econ.modelId || 'market';
        const condPool      = [];

        // Era-specific framing of "conditions"
        if (techLevel <= 2) {
          condPool.push(
            `The land ${condWellbeing > 55 ? 'provides well' : 'has been difficult'}. The seasons ${condWellbeing > 55 ? 'have been kind to us' : 'have not favored us'}. ${condCoop > 60 ? 'The tribe holds together.' : 'People look to themselves first.'}`,
            `We have ${condWellbeing > 60 ? 'enough to eat and fires at night' : 'struggles — the hunt has not been easy'}. The elders ${condEquality > 55 ? 'keep things balanced' : 'keep much for themselves'}. It is as it has always been.`,
          );
        } else if (techLevel <= 4) {
          condPool.push(
            `${condWellbeing > 60 ? 'The harvests have been fair and the granaries hold.' : 'Times are lean. The tribute is heavy and the harvest uncertain.'} ${condEquality < 40 ? 'Those who rule take their portion first.' : 'What remains is shared reasonably.'}`,
            `The gods have ${condWellbeing > 55 ? 'blessed these lands in recent seasons' : 'tested us sorely of late'}. ${condCoop > 60 ? 'We endure together.' : 'Each household tends to itself.'}`,
          );
        } else if (techLevel === 6) {
          condPool.push(
            `God has seen fit to grant us ${condWellbeing > 60 ? 'reasonable provision' : 'hardship as a trial of faith'}. ${condEquality < 35 ? 'The nobles and the church take much. What reaches common folk is little.' : 'The land provides for most.'}`,
            `These are ${condWellbeing > 55 ? 'tolerable times — neither feast nor famine' : 'difficult times — the harvest is uncertain and the obligations heavy'}. ${condCoop > 65 ? 'We look after one another as best we can.' : 'Each man looks to his own household.'}`,
          );
        }

        // Universal condition assessments (all eras)
        if (condWellbeing > 70) condPool.push(
          `Honestly, things are in reasonable shape. Not perfect — I could list problems if you want them. But the basics work: people have enough, there's some fairness in how things run, the community holds together. I don't take that for granted.`,
          `Better than they've been, in some ways. The things that most directly touch people's daily lives — ${condEconId === 'gift' || condEconId === 'commons' ? 'the shared resources, the collective care' : 'food, shelter, basic security'} — those are being managed. There's room for improvement. There always is.`
        );
        if (condWellbeing >= 45 && condWellbeing <= 70) condPool.push(
          `Mixed. Some things work. Others are harder than they should be. People manage, mostly — but "managing" isn't the same as thriving. There's a gap between the two that I notice in the people around me.`,
          `The honest picture: uneven. ${condEquality < 45 ? 'Some people here are doing very well. Others, not at all. That gap shapes everything.' : 'There\'s not a sharp divide between who does well and who doesn\'t — but there are real struggles.'} The community holds, though. Mostly.`
        );
        if (condWellbeing < 45) condPool.push(
          `Difficult, if I'm being honest. The gap between what people need and what they have — it's visible if you're looking. ${condCoop < 40 ? 'And the social bonds that might cushion it have thinned.' : 'The community tries to compensate, but there\'s only so much that holds.'}`,
          `Hard. ${condEquality < 35 ? 'Deeply unequal.' : ''} The people at the bottom are carrying more than they can hold. It shows in faces, in the quality of daily life, in what people don't bother hoping for anymore. Those are conditions, if you want the honest version.`
        );

        if (condPool.length === 0) condPool.push(perceptions.ofLifeQuality, perceptions.ofCommunity);
        return pick(condPool, true);
      }

      // ── Challenges of this era ─────────────────────────────────
      case 'challenges': {
        // ── Emotional overlay ──
        if (emotionalTone === 'anxiety') return pick([
          `I won't pretend it doesn't weigh on me. The challenges here are real and I lose sleep over them. ${h < 35 ? 'I don\'t know that they get better.' : 'I try to believe things can improve. Some days that\'s easier than others.'}`,
          `It worries me — genuinely. ${techLevel <= 4 ? 'The threats from outside, from the seasons, from those who want what we have.' : 'The direction things are heading.'} I carry that worry every day even when I don\'t speak it out loud.`,
          `The challenges feel enormous some days. Too big for any one person. I do what I can and try not to look too far ahead at the rest.`,
        ]);
        if (emotionalTone === 'pride' && pos === 'leader') return pick([
          `We've faced real hardship and come through it. I'm proud of that — of what this community has shown itself capable of when tested. That matters more than any policy or decision I've made.`,
          `The challenges are real. But so is what we've built to meet them. I feel that — a real pride in what people here have done together. It didn't have to turn out this way.`,
        ]);

        const challWellbeing  = civ.state ? Math.round(civ.state.averageWellbeing) : 50;
        const challEquality   = civ.state ? Math.round(civ.state.equalityIndex)    : 50;
        const challCorrupt    = Math.round(gov.corruptionLevel || 0);
        const challPowerConc  = Math.round(gov.powerConcentration || 50);
        const challCoop       = Math.round(b.cooperation || 50);
        const challAcquis     = Math.round(b.acquisitiveness || 50);
        const challWarm       = civ.state ? (civ.state.globalWarmingContribution || 0) : 0;
        const challTechs      = civ.state ? (civ.state.adoptedTechnologies || []) : [];
        const challEconId     = econ.modelId || 'market';
        const challGovId      = gov.modelId || 'representative';
        const challPool       = [];

        // ── Era-specific first-layer challenges ──────────────────
        if (techLevel <= 2) {
          // Prehistoric / early bronze — survival, territory, natural world
          challPool.push(
            pos === 'leader'
              ? `The land does not give easily. We face the seasons without mercy — drought, cold, animals that take from what we plant. Holding the tribe together through hardship is the greatest thing we do, and the hardest.`
              : `The land itself. ${challWellbeing < 45 ? 'We go hungry when the rains fail.' : 'We eat when the seasons allow.'} The animals, the weather, the cold months — those are what I think about. Not distant things. Close ones.`,
            pos === 'elite' || pos === 'leader'
              ? `Other tribes press against us. Our boundaries are not fixed — they are only as strong as our ability to hold them. That requires unity, and unity is always fragile.`
              : `We are small and the world is large. Other peoples are out there. Some are friendly. Others are not. That uncertainty lives with us.`,
            `Disease and injury end lives here before their time. We do what we can with what we know — the plants, the healers, the old knowledge. But we lose people too often. That is the challenge I see most clearly.`,
          );
        } else if (techLevel <= 4) {
          // Bronze / Iron age — warfare, tribute, gods, disease
          challPool.push(
            `War is the constant. Neighboring peoples press, and our own rulers press back. The people who suffer most are the ones who don't decide to fight. They just bear the cost.`,
            pos === 'leader' || pos === 'elite'
              ? `Keeping the loyalty of enough people to hold this territory together. Tribute, favor, coercion — you need all of it. The challenge is the balance.`
              : `The tribute taken by those above us. The demand is never satisfied. What we produce — too much of it goes upward. That has always been the way, but it wears.`,
            `Disease moves faster than understanding. We've watched sickness sweep through and we know no way to stop it. The healers try. The gods are asked. It is not always enough.`,
            `${challEquality < 40 ? 'The gap between those who command and those who serve has grown too wide. It creates fragility — loyalty built on fear doesn\'t hold in a crisis.' : 'Holding the different parts of this society in something like balance. When those at the bottom cannot sustain themselves, the whole structure weakens.'}`,
          );
        } else if (techLevel === 5) {
          // Classical — philosophy, civic order, corruption, trade
          challPool.push(
            `The great question of our time: how to organize people so that their competing interests don't tear everything apart. Every system we've tried produces its own injustices. The thinking about this is not yet finished.`,
            `Corruption in the institutions we depend on. When those who hold authority use it for private benefit, the whole structure degrades. Everyone can see it. The difficulty is fixing it.`,
            `${challCoop > 60 ? 'Whether we can sustain what we\'ve built — cooperative systems require continuous investment. The temptation to defect is always present.' : 'The tendency of people who gain power to hold it and extend it. We have not yet solved this. I\'m not sure it has a final solution.'}`,
            `Trade creates wealth and creates inequality both. Managing the benefits of exchange without concentrating them in too few hands — that is the challenge of our era.`,
          );
        } else if (techLevel === 6) {
          // Medieval — plague, famine, religious authority, feudal structure
          challPool.push(
            `Disease. We have watched plague take whole villages. We pray and we try what knowledge we have, but the mortality is severe and we do not fully understand why it comes or goes.`,
            `The harvest. A poor year means hunger. Several poor years in succession breaks communities. We have not solved the problem of feeding everyone in bad times.`,
            pos === 'laborer' || pos === 'marginalized'
              ? `The obligations laid on us by those above — the lord, the church, the crown. What is taken is large; what remains is small. The challenge is surviving within that structure.`
              : `Holding the social order together without the cruelty that comes naturally to a hierarchy of obligation. The temptation of those above is always to extract more than can be sustained.`,
            `The authority of the church touches everything. Where it aligns with genuine care for people, it does good. Where it serves institutional power, it does harm. Telling the difference — that is one of the real challenges.`,
          );
        } else if (techLevel === 7) {
          // Renaissance
          challPool.push(
            `We live in an age of new learning, and new learning disturbs old orders. The question is whether the disruption produces something better, or just a different arrangement of the same problems.`,
            `The old authorities are weakening. New ideas spread faster than institutions can adapt. Whether this produces more freedom or more chaos — I genuinely don't know. Both seem possible.`,
            `Trade and wealth are remaking everything. Those with capital are gaining influence that used to belong only to those with land or armies. Whether that's progress — I'm not sure.`,
          );
        } else if (techLevel === 8) {
          // Industrial
          challPool.push(
            `The machinery of industry produces wealth and produces misery both. The people who work in the factories are often the last to share in what they create. The great challenge is whether we can manage this transformation without consuming the people who drive it.`,
            `The city is filling with people who've left the land. They find work, but they find squalor too. The conditions in which workers live — if this continues as it's going, the tension will break somewhere.`,
            challCoop < 40
              ? `We have lost something in the move to individual industrial labor. Communities that were held together by shared work are fragmenting. The challenge is what holds people together when the old bonds are gone.`
              : `Whether the gains of industrial production can be shared broadly or whether they will concentrate in fewer and fewer hands. That question is the political question of our time.`,
          );
        } else {
          // Modern / contemporary / future
          if (challWarm > 15) challPool.push(
            `Climate. What we've done to the atmosphere — the effects are already visible, and the worst is still ahead. Whether this civilization has the collective will to act before the consequences are irreversible — that is the defining challenge of this era.`,
            `The challenge of our time is that the problems are global and the institutions for addressing them are national. Climate, displacement, resource exhaustion — these don't observe the boundaries we've drawn. Our governance structures do.`
          );
          if (challEquality < 40) challPool.push(
            `Inequality at a scale we've not seen before. The distance between the people at the top and everyone else is growing, and growing fast. The social contract that held things together assumes some rough fairness. Without it, the contract frays.`,
            `The concentration of wealth and power in this era. When a small group can shape the conditions everyone else lives in — laws, media, resource access — that's not a market. That's capture. The challenge is recognizing it for what it is.`
          );
          if (challAcquis > 65) challPool.push(
            `We've built a civilization organized around accumulation. It turns out that "more" is not a stable goal — it never satisfies, and it generates externalities that everyone eventually pays for. The challenge is finding a different organizing principle.`,
          );
          challPool.push(
            `The challenge I see most clearly: our collective decision-making hasn't kept pace with the complexity of what we're managing. The problems are interconnected; the institutions are siloed. Something needs to change, and it's not clear who changes it.`,
            `Technology is advancing faster than the wisdom to use it well. We've handed new capacities to institutions — including governments and corporations — without thinking carefully enough about the accountability structures that should come with them. That is a challenge nobody is in charge of solving.`,
            pos === 'marginalized' || pos === 'laborer'
              ? `The hardest thing about the challenges of our time is that the people who will suffer most from them are the least powerful to address them. Climate, inequality, automation — the burden falls downward. That's not new, but the scale is.`
              : `The great challenge of this era is coordination — getting people and institutions with different interests to act in concert on problems that require collective response. We know how to do this badly. We haven't figured out how to do it well.`,
          );
        }

        // Universal overlays from civ state (stack on top of era-specific)
        if (challCorrupt > 55) challPool.push(
          `The corruption here is not incidental — it's become structural. The challenge isn't finding corrupt individuals; it's that the system now depends on the informal arrangements they've created. That's much harder to fix.`
        );
        if (challWellbeing < 35) challPool.push(
          `The most pressing challenge, as I see it, is the basic conditions people are living in. When wellbeing is this low — when survival is uncertain for a significant part of the population — every other challenge becomes harder to address. You can't think strategically when you're in crisis.`
        );
        if (challEquality < 30) challPool.push(
          `The level of inequality here is itself a challenge — not just for the people on the bottom, but for the functioning of everything. Highly unequal societies are brittle. The question is whether those who benefit from the imbalance will act before the brittle part breaks.`
        );

        if (challPool.length === 0) challPool.push(
          perceptions.ofFuture,
          `The challenges I see are real but not impossible. The question is whether the people who have the power to address them choose to.`,
        );

        return pick(challPool, techLevel <= 6);
      }

      case 'suggestions': {
        // Read actual civilization state values
        const wellbeing  = civ.state ? Math.round(civ.state.averageWellbeing)  : 50;
        const equality   = civ.state ? Math.round(civ.state.equalityIndex)     : 50;
        const corruption = Math.round(gov.corruptionLevel || 0);
        const powerConc  = Math.round(gov.powerConcentration || 50);
        const beh        = civ.state ? civ.state.behaviorReinforcement : {};
        const conformity     = Math.round(beh.conformity     || 50);
        const acquisitive    = Math.round(beh.acquisitiveness || 50);
        const cooperation    = Math.round(beh.cooperation     || 50);
        const econId     = econ.modelId;
        const govId      = gov.modelId;

        // Detect if the interviewer has identified themselves as a leader / authority
        const allUserQ = [...prevUserLines, question.toLowerCase()];
        const askerIsAuthority = allUserQ.some(l =>
          /\b(i am (a |your |the )?leader|as (your|the|a) leader|i represent|i'?m in (leadership|charge|authority)|on behalf of|speaking as (a |the )?leader|i have (power|authority))\b/.test(l)
        );

        // Build a pool of specific, grounded suggestions keyed to civ state + NPC position
        const pool = [];

        // ── MARGINALIZED ──────────────────────────────────────────
        if (pos === 'marginalized') {
          if (wellbeing < 50) pool.push(
            `Basic needs first — not philosophy, not long-term vision. People in my position need to know they'll have food, shelter, and some certainty about tomorrow. Everything else can follow.`,
            `The thing that would help most isn't complicated. Predictability. Knowing what tomorrow looks like. Not stability in the abstract — concrete, daily stability. That's what people in my position are missing.`
          );
          if (equality < 40) pool.push(
            `The gap between what those at the top have and what people like me have isn't hidden. Everyone sees it. It produces a quiet despair that doesn't show up in any report. If you want improvement, address that gap directly — not through rhetoric.`,
            `You want to know what the inequality looks like from here? It looks like some people having choices and others having none. It's not just about amounts — it's about options. People at the bottom don't get to choose anything. That compounds.`
          );
          if (corruption > 50) pool.push(
            `Every time someone in my position tries to access something they're entitled to, there's someone in between taking a piece of it. That's what corruption means from where I stand. It's not abstract — it's daily and exhausting. Start there.`,
            `The system is full of friction that only exists to benefit the people creating it. Every step I take to get what I'm owed, something takes a cut. That's not an accident. Fixing it would require naming it honestly.`
          );
          if (conformity > 65) pool.push(
            `You may not be hearing this from many people because saying it carries a cost. If you genuinely want honest feedback, you need to create conditions where honesty doesn't cost people something. Right now it does.`,
            `People in my position have learned not to say certain things. Not because they don't think them — because the consequences of saying them fall on us, not the people we say them to. So you're hearing the polished version of what I think. The real version is sharper.`
          );
          if (powerConc > 65) pool.push(
            `Include us in decisions — not as a gesture, but because decisions made without our input are made with incomplete information. The problems get designed around other people's lives, not ours.`,
            `The decisions that most affect me are made by people who will never experience what I experience. That's not just unfair. It's ineffective. The information doesn't flow back up to where the decisions get made.`
          );
          if (econId === 'market' || econId === 'commodity') pool.push(
            `The market says it rewards hard work. My experience says it rewards already having something. If you want that to change, you need to actively counterbalance it — the market won't do it on its own.`
          );
          pool.push(
            `The system as it's arranged doesn't work for me. It works around me. If you want to fix that, ask who benefits from how things are currently structured. That question will show you where to start.`,
            `I've had time to think about this. What would actually change things for people in my position isn't complicated — it just isn't a priority for the people who decide things. More stability. Less friction when you try to navigate the system. Nothing dramatic. Just a structure that doesn't require extraordinary effort simply to survive in.`,
            `When I imagine what better looks like — and I do think about it — it's not luxury. It's not having to spend all my energy on damage control. It's having enough margin that I can actually think past this week. That's it. That's the whole ask.`,
            `The biggest frustration isn't any single thing — it's that the problems are visible. They're not mysteries. The people who could address them choose not to, because fixing them would inconvenience someone with more power than I have. That's what's demoralizing.`
          );
        }

        // ── LABORER ──────────────────────────────────────────────
        else if (pos === 'laborer') {
          if (equality < 45) pool.push(
            `The math of what gets produced versus what reaches people like me — it doesn't balance. We do the work; the reward doesn't stay with the work. Fix the distribution.`,
            `I know what my work produces. I know what I receive for it. The gap between those two things is where I'd start if I were in a position to fix anything.`
          );
          if (acquisitive > 65) pool.push(
            `The culture here teaches everyone to accumulate as much as possible. That produces people who see each other as competition, not community. That has costs that don't appear in any ledger.`,
            `Everyone here is trying to get more for themselves. I understand the impulse — I feel it too. But a place where everyone's optimizing purely for themselves produces a kind of loneliness. We've made cooperation feel naive.`
          );
          if (wellbeing < 45) pool.push(
            `The hours are the problem. The time people like me spend working, compared to what we get back — there's nothing left for family, community, or rest. Those things matter. They affect how people function and what they're capable of.`,
            `I spend most of my waking hours producing something for someone else. By the time I'm done, I don't have the energy to be more than what the work needs me to be. That's not a small thing to accept.`
          );
          if (corruption > 45) pool.push(
            `A lot of what's supposed to reach ordinary workers gets captured somewhere on the way down. I'm not talking about anything dramatic — just the steady friction of things not working the way they're supposed to. That adds up.`
          );
          if (govId === 'autocratic' || govId === 'oligarchy') pool.push(
            `The decisions that affect my daily life are made by people who don't live my daily life. That's not just unfair — it means the decisions are made with the wrong information. Include more voices. You'll get better outcomes.`
          );
          pool.push(
            `Be less distant. The people making decisions here don't live the way I do. That creates a gap in what they understand. More contact with how things actually work at this level would produce better decisions — even if it's uncomfortable.`,
            `There are things here that work, and I want to be fair about that. The part I keep returning to is the gap between what gets produced and what actually stays with the people who produce it. I think that could be arranged differently. It would take genuine willingness to examine it honestly — without defensiveness.`,
            `What I'd change? The assumption that people at my level don't have useful things to say about how things work. We see what everyone above us misses. We just don't get asked.`,
            `The thing that would make the most difference is simple: treat the people doing the actual work as if their time matters. Right now it doesn't — not compared to the time of people further up. That shapes everything.`,
            `My complaint, if I'm being direct, is about the distance between effort and reward. I'm not asking for everything to be equal. I'm asking for the ratio to be honest. Right now it isn't.`
          );
        }

        // ── PROFESSIONAL ────────────────────────────────────────
        else if (pos === 'professional') {
          if (corruption > 45) pool.push(
            `There's capable work happening here that gets undermined by decisions made for personal gain rather than community benefit. If you reduced the informal favoritism and merit-bypassing, you'd see a real improvement in what's possible.`,
            `The frustration from my position is watching what could work well get degraded by people inserting themselves for the wrong reasons. It's not incompetence — it's misaligned incentives. Fix the incentives and the competence is already here.`
          );
          if (equality < 45) pool.push(
            `The inequality isn't just an ethical issue — it's a practical one. People who can't meet basic needs don't innovate, don't cooperate, don't contribute fully. The potential being lost at the bottom of the hierarchy is visible if you're looking.`,
            `From my vantage point, I can see the people below me being constrained in ways that aren't necessary. They have more to offer than the system lets them. That's waste — and it's a policy choice, not a natural condition.`
          );
          if (powerConc > 60) pool.push(
            `More distributed decision-making would produce better decisions. Not as an ideology — as a practical matter. Problems get caught earlier when more people have a stake in catching them.`,
            `The consolidation of authority here means that errors at the top stay hidden longer than they should. More points of real accountability — not symbolic ones — would produce a more resilient system.`
          );
          if (cooperation < 40) pool.push(
            `The culture discourages collaboration — people protect information instead of sharing it. You could change the incentive structure around that. Right now cooperation is optional; it should be systematically rewarded.`
          );
          if (wellbeing < 45) pool.push(
            `There's real talent here that isn't getting the conditions it needs. Not just compensation — though that matters — but latitude. The ability to apply judgment without navigating ten layers of approval. That's where the frustration is.`
          );
          pool.push(
            `My recommendation: build better feedback loops. The gap between what leadership believes is happening and what's actually happening is always larger than anyone realizes. Structured ways of surfacing that gap would improve almost everything else.`,
            `The pattern I keep noticing: the problems that persist longest are the ones where the people who could address them don't experience their effects directly. Closing the distance between who decides and who lives with those decisions — structurally, not just as goodwill — would improve more than any specific intervention.`,
            `The thing I'd fix first is the signal-to-noise problem in decision-making. The people at the top get a lot of information, but it's been processed so many times by the time it arrives that it doesn't resemble what I see. Better, more direct signals would help more than structural changes.`,
            `The concern I keep coming back to: we're very good at optimizing for short-term visible outcomes and very bad at accounting for what those optimizations cost long-term. I see it in my work constantly. Changing that would require patience that's not currently valued.`
          );
        }

        // ── ELITE ──────────────────────────────────────────────
        else if (pos === 'elite') {
          if (equality < 40) pool.push(
            `The inequality level here — and I say this as someone who benefits from it — is becoming a structural risk. Systems with this degree of concentration tend toward instability. That's not good for anyone, including those of us who have something to lose.`,
            `I've thought carefully about this: the concentration of resources and influence here isn't sustainable long-term. I'm in a position that benefits from it, which makes it harder to say — but it's true. You can only extract from a system until it stops producing.`
          );
          if (corruption > 55) pool.push(
            `The corruption has gotten into the actual functioning of things. I can work around it. But it's eroding the foundations, and at some point the erosion outpaces the workarounds. It's in everyone's interest to address it.`,
            `The informal arrangements here — I benefit from some of them. But I also see how they undermine anything that tries to operate on merit or transparency. It's a short-term convenience with long-term structural costs.`
          );
          if (wellbeing < 40) pool.push(
            `When wellbeing at the bottom is this low, you get instability — not always visible, but accumulating. The investment required to bring it up is smaller than the cost of managing what happens when it collapses further.`,
            `From a purely self-interested position: the conditions at the bottom of this society are bad enough that they represent a risk to everything above them. That's the argument I make to people in my position who don't respond to ethical reasoning.`
          );
          if (cooperation < 40) pool.push(
            `The lack of cooperation here — and I see it at every level, including mine — is a drag on everything we could be building together. We've created a culture of self-protection. It works for individuals and poorly for the collective.`
          );
          pool.push(
            `The best investment is in the conditions that make the whole system function better — not in protecting existing advantages. I understand why people in my position resist that. But it's the more accurate long-term assessment.`,
            `I've been thinking about what actually makes systems stable over the long term. It's not protecting what currently exists — it's investing in the conditions that allow things to keep working. We're better at the former than the latter right now. That asymmetry is worth examining honestly.`,
            `My honest assessment: people at my level have overcorrected toward extracting value rather than creating it. The ratio has shifted, and it's visible to everyone below us even when we pretend otherwise. Correcting it would require giving something back — and that conversation hasn't started yet.`,
            `The thing I find myself thinking about: I have what I have partly because of circumstances I didn't choose. Mostly I don't examine that. But when asked directly — the system as it is has benefited me beyond what I've earned. I think that's worth saying plainly.`
          );
        }

        // ── LEADER ──────────────────────────────────────────────
        else if (pos === 'leader') {
          pool.push(
            `The biggest problem, from where I sit, is information quality. Decisions are only as good as what reaches us. What reaches us is filtered — and filtered in ways that favor telling us what we want to hear. That's the hardest thing to fix.`,
            `The gap between our stated principles and how they actually operate day-to-day — that's where most of the problems live. Closing it requires sustained, unglamorous attention. It can't be fixed with a proclamation.`
          );
          if (corruption > 50) pool.push(
            `There are people operating within our own structures who are optimizing for themselves, not for the community. Everyone knows who they are. Addressing it sends a signal about what we actually value versus what we say we value.`,
            `The corruption problem is: it's not dramatic enough to create a crisis, and not small enough to ignore. It just persists. And our tolerance for it signals something about our real priorities that I'm not comfortable with.`
          );
          if (equality < 40) pool.push(
            `The distribution of what this society produces — I look at it and I know it's wrong. We have the capacity to address it. We lack the political will, because the people who would bear the cost are the same people whose cooperation we depend on. That's the real constraint.`
          );
          if (wellbeing < 40) pool.push(
            `The wellbeing numbers concern me more than the security numbers, and we spend much more attention on the latter. When people are struggling at a basic level, everything downstream suffers. We've been treating it as a secondary issue. That's a mistake.`
          );
          pool.push(
            `The honest assessment: there are places where what we're doing works, and places where the gap between intention and outcome has grown. The latter tend to be invisible until they become crises. More regular contact with how things are actually experienced — not through summaries, but direct contact — would catch more of them earlier.`,
            `What I'd change about how we operate: more genuine accountability, less managed appearance of accountability. The difference is visible to everyone except the people inside the system. We've become very good at looking like we're addressing things. Less good at actually addressing them.`,
            `If I'm being honest about what I'd fix: the feedback mechanisms. We make decisions and then we hear about their effects filtered through people who have incentives to tell us they worked. We need unfiltered information, and we've systematically built structures that prevent us from getting it.`
          );
        }

        // Fallback if nothing matched
        if (pool.length === 0) {
          pool.push(
            `Start with the people who have the least say and the most at stake. Not their official representatives — the people themselves. What they tell you, if they trust you enough to be honest, is the most accurate diagnosis of what needs to change.`,
            `The things most worth changing are usually the things most uncomfortable to name. In my experience, the honest answer exists — it just requires conditions where it can be said safely.`,
            `I have thoughts about this. I'm not sure it goes anywhere — I've had them before. But since you're asking: the gap between how things work in principle and how they work in practice is where all the important problems live.`
          );
        }

        // Prefix based on who is asking (askerIsAuthority = legacy internal check; askerContext = global)
        if (askerIsAuthority || askerContext === 'leader') {
          const prefix = Utils.randChoice([
            `Since you're asking directly and have the authority to act on it — `,
            `You're asking, so I'll use the chance to be frank: `,
            `I don't get to say this to someone in authority often, so here it is plainly: `,
            `If you actually have the power to change things, here's what I'd tell you: `,
          ]);
          return prefix + pick(pool);
        }
        if (askerContext === 'fellow') {
          const prefix = Utils.randChoice([
            `Since we're both living this — `,
            `Between us — `,
            `Since you're one of us and you're asking, I'll say it plainly: `,
            `I'll be more direct with you than I'd be with a stranger: `,
          ]);
          return prefix + pick(pool);
        }
        if (askerContext === 'stranger') {
          const prefix = Utils.randChoice([
            `Since you're from outside and can see it fresh — `,
            `You're asking as someone who doesn't live here. That's actually a useful position to hear this from: `,
            `Honestly, it's sometimes easier to say this to someone who won't stay: `,
          ]);
          return prefix + pick(pool);
        }

        return pick(pool);
      }

      // ── Identity, pride, and shame about one's people/culture/ruler ──
      case 'identity': {
        const hasMilitary  = (civ.state ? civ.state.adoptedTechnologies || [] : []).some(t => /military|weapon|war|siege/i.test(t));
        const isConqueror  = hasMilitary && (b.acquisitiveness || 50) > 60;
        const govApproval  = h > 55 && (b.cooperation || 50) > 45;
        const q2 = question;

        // Conquest / expansion — ambivalence or pride or shame
        if (/\b(conquest|expand|expansion|territory|war|fought|battle|enemies|defeated)\b/.test(q2)) {
          if (pos === 'leader' || pos === 'elite') return pick([
            isConqueror
              ? `What we've accomplished — the territory we've held, the people we've absorbed into what we've built — I feel pride in that. Others may judge it differently. I think about what it took and what it secured.`
              : `We've defended what is ours. I don't apologize for that. But conquest for its own sake — that I'm less certain about. The costs don't always justify the gains.`,
            `That's complicated for me. I'm proud of the strength we've shown. Whether the use of that strength was always right — I sit with that question more than I admit publicly.`,
          ]);
          if (pos === 'marginalized' || pos === 'laborer') return pick([
            `The wars and the expansion — I didn't choose those. I just lived with the consequences. Whether to be proud or ashamed of them... I'm not sure that question is mine to answer.`,
            `People like me bear the cost of those decisions. The glory, if there is any, goes elsewhere. I feel... not pride, exactly. Something more like endurance.`,
          ]);
          return pick([
            `I feel complicated about it, if I'm honest. There's something to be proud of in what we've built. And something to be troubled by in how we built it. I hold both.`,
            `The achievements of this civilization — yes, I'm proud of some of them. Others I think about with discomfort. We don't always have to choose one feeling over the other.`,
          ]);
        }

        // Pride or approval of ruler/government
        if (/\b(ruler|king|queen|leader|government|governor|those in charge)\b/.test(q2)) {
          if (govApproval && (pos === 'elite' || pos === 'professional' || pos === 'leader')) return pick([
            `I think they've handled things well, honestly. Not perfectly — no one does. But with genuine concern for this community. That's rarer than it should be.`,
            `I approve of the leadership here. I've seen what bad leadership looks like. This isn't it. They're trying to do right by the people, and I think they mostly succeed.`,
          ]);
          if (!govApproval || pos === 'marginalized' || pos === 'laborer') return pick([
            `I think the governance here is... not what it should be. I say that quietly, because there's a cost to saying it loudly. But I do think it.`,
            `My ruler? My government? ${h < 35 ? 'I think they\'ve failed the people who needed them most.' : 'I have doubts. Significant ones. I keep them to myself mostly.'}`,
            `There's a gap between how the leadership presents itself and what I actually see. Whether that's corruption or incompetence or something else — I don't know. The result is the same.`,
          ]);
        }

        // Pride in culture/people/homeland
        const civName = civ.name || 'this civilization';
        if (h > 55) return pick([
          `I'm proud to be part of ${civName}. Not blindly — I see the faults. But there's something real here. Something worth being part of.`,
          `My people, my culture — yes, I feel pride in that. Not pride that makes me dismissive of others. Just the ordinary pride of belonging to something you believe in.`,
          pos === 'leader'
            ? `I've given my life to this civilization. Of course I'm proud of it. I've seen what it asks of people and what it gives back. It's not perfect. But it's ours.`
            : `I feel at home here in a way I can't always explain. That means something to me. Not everyone has it.`,
        ]);
        // Shame or ambivalence
        return pick([
          `Pride is... complicated. There are things about where I'm from that I'm proud of. Others that I find harder to hold.`,
          `I don't feel simple pride about my civilization. I feel something more complicated — part belonging, part discomfort with things I can see clearly but can't easily change.`,
          pos === 'marginalized'
            ? `You ask if I'm proud of my people. My people have complicated relationships with this civilization. So does my pride.`
            : `Some things about this place I'm proud of. Others I carry more quietly. It's not a simple answer.`,
        ]);
      }

      // ── Relations with neighboring civilizations ─────────────────
      case 'neighbor_relations': {
        const relVals      = civ.relations ? [...civ.relations.values()] : [];
        const warEntries   = relVals.filter(r => r.war);
        const tradeEntries = relVals.filter(r => r.trade);
        const hostileEntries  = relVals.filter(r => !r.war && r.attitude < -30);
        const friendlyEntries = relVals.filter(r => r.attitude > 50);

        const nbrAtWar    = warEntries.length > 0;
        const nbrTrade    = tradeEntries.length > 0;
        const nbrHostile  = hostileEntries.length > 0;
        const nbrFriendly = friendlyEntries.length > 0;
        const occupiedBy  = civ._occupiedBy || null;

        // Join a name list naturally: "A", "A and B", "A, B, and C"
        const joinNames = names => {
          if (!names.length) return '';
          if (names.length === 1) return names[0];
          if (names.length === 2) return `${names[0]} and ${names[1]}`;
          return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
        };

        // Named labels — fall back gracefully if rel.name not yet populated
        const warNames     = warEntries.filter(r => r.name).map(r => r.name);
        const tradeNames   = tradeEntries.filter(r => r.name).map(r => r.name);
        const hostileNames = hostileEntries.filter(r => r.name).map(r => r.name);
        const friendlyNames = friendlyEntries.filter(r => r.name).map(r => r.name);

        const warLabel      = warNames.length     ? joinNames(warNames)      : 'neighboring peoples';
        const tradeLabel    = tradeNames.length   ? joinNames(tradeNames)    : 'neighboring peoples';
        const hostileLabel  = hostileNames.length ? joinNames(hostileNames)  : 'some neighbors';
        const friendlyLabel = friendlyNames.length ? joinNames(friendlyNames) : 'some neighbors';

        // Era-gated responses (pre-tribal: names are rarely meaningful yet)
        if (techLevel <= 2) return pick([
          nbrAtWar
            ? `The other bands? We watch them carefully. When they come near our hunting grounds, trouble follows. We have fought before and may again.`
            : nbrFriendly
              ? `Some of the other peoples — we know their faces and they know ours. When the seasons are hard, there is sometimes sharing. Not always, but sometimes.`
              : `The other peoples are out there. We don't seek them, and they don't seek us. It is safer that way.`,
          `There are bands beyond our own. Some we know a little — we have met at the river crossings, traded small things. Others we see only at a distance and move away from.`,
          pos === 'leader'
            ? `I watch the other peoples closely. You have to, in a world like this. They have interests too, and sometimes those interests cross ours.`
            : `I don't deal with the other bands much. That's the elders' concern. I stay where I'm needed.`,
        ]);

        if (techLevel <= 4) return maybeAddReligion(pick([
          nbrAtWar
            ? `We are at war with ${warLabel} — you know that already. The fighting takes much from us and weighs on everyone. ${pos === 'laborer' || pos === 'marginalized' ? 'The burden falls heaviest on those of us who didn\'t choose it.' : 'It is necessary — though necessity is a hard comfort.'}`
            : `The neighboring peoples — there is tension. There is always tension. We trade sometimes; we dispute sometimes. The border between what is ours and what is theirs is never as fixed as we pretend.`,
          nbrFriendly && nbrTrade
            ? `We trade with ${tradeLabel} — goods, knowledge, sometimes goodwill. It is the better arrangement. A neighbor you trade with is less likely to become an enemy.`
            : `The peoples around us — I would not call them friends exactly. Rivals, sometimes allies of convenience. We watch each other, and we know we are watched.`,
          pos === 'leader' || pos === 'elite'
            ? nbrAtWar
              ? `Relations with ${warLabel} are the most pressing matter of state right now. Neighboring kingdoms require careful management — neglect them and things deteriorate quickly.`
              : `Neighboring kingdoms require careful management. Good relations must be cultivated and maintained — neglect them and things deteriorate quickly.`
            : `I don't know much about the decisions made regarding our neighbors. I know there is trade sometimes, and disputes sometimes. The details are above my station.`,
        ]));

        // Classical and modern eras — use actual names throughout
        return pick([
          nbrAtWar
            ? `We're in conflict with ${warLabel} right now. I won't pretend it doesn't affect daily life — it does. ${h < 40 ? 'People are frightened and depleted.' : 'The burden is real, even for those of us not on the front of it.'}`
            : occupiedBy
              ? `We are occupied by ${occupiedBy}. So "neighboring relations" has a particular meaning here that it doesn't have for people in an independent civilization.`
              : nbrFriendly && nbrTrade
                ? `Relations with ${friendlyLabel} are actually quite good — there's real trade, real exchange. When it works, it's the model of how things should be between different peoples.`
                : nbrHostile
                  ? `Tense, if I'm honest. Our relations with ${hostileLabel} are strained — distrust runs deep, and the reasons go back further than I can fully trace.`
                  : `Mixed. Some neighbors we get along with reasonably well. Others we watch carefully. Different peoples have their own histories and interests that don't always align with ours.`,
          pos === 'leader'
            ? nbrAtWar
              ? `Managing the conflict with ${warLabel} is a large part of what leadership means right now. The choices — whether to negotiate, to press forward, to prepare for a long struggle — aren't abstract. They affect everyone here.`
              : `Managing relations with our neighbors is a large part of what leadership here means. The choices — trade, diplomacy, preparation for conflict — aren't abstract. They affect everyone who lives here.`
            : `I'll be honest — I have limited knowledge of what our relations with neighboring civilizations actually look like at the diplomatic level. What I know is how it feels to live here with ${nbrAtWar ? `the conflict with ${warLabel}` : nbrTrade ? `active trade with ${tradeLabel}` : 'uncertain relations'} shaping daily life.`,
          nbrTrade
            ? `There's real trade happening with ${tradeLabel}. That creates bonds that benefit people at every level — not just those at the top who negotiate them. I appreciate that.`
            : `I wish we had better relations with the peoples around us. Isolation — or worse, conflict — costs everyone. What's gained from hostility is much smaller than what's lost.`,
          pos === 'marginalized' || pos === 'laborer'
            ? `Relations with neighboring civilizations? I think about that less than you might expect. What affects me most is closer to home. But I notice when things are tense — trade dries up, people get afraid.`
            : nbrFriendly
              ? `${friendlyLabel} — those are genuinely productive relationships. Not every neighboring civilization has something it wants from us that ends in conflict. I'm glad for the ones that don't.`
              : `Every neighboring civilization has something it wants from us — territory, trade, security, or simply our weakness. Understanding which of those is the actual dynamic is the beginning of anything honest.`,
        ]);
      }

      // ── Feelings about other religions ───────────────────────────
      case 'other_religions': {
        const npcReligion    = npc.religiousAffiliation;
        const civPresence    = civ.religion ? civ.religion.presence : 'none';
        const civStateRel    = civ.religion ? civ.religion.stateRelationship : 'separate';
        const civReligions   = civ.religion ? (civ.religion.religions || []) : [];
        const isTheocratic   = civ.governance && (civ.governance.modelId === 'theocratic' || civPresence === 'dominant');
        const allExclusive   = civReligions.some(r => r.toleranceLevel === 'exclusive');
        const allTolerant    = civReligions.length > 0 && civReligions.every(r => r.toleranceLevel === 'tolerant' || r.toleranceLevel === 'syncretic');
        const outsiderRel    = civ.operatingPrinciples ? civ.operatingPrinciples.outsiderRelationship : 'trading';

        // Era-gated responses
        if (techLevel <= 2) return pick([
          npcReligion
            ? `The spirits of other peoples are their own. We do not say their spirits are wrong — they are just not ours. Each people has its own way of speaking to the world beyond.`
            : `Other peoples have their own beliefs and ways of honoring what they cannot see. I watch from a distance. Some of their practices seem strange. Perhaps ours seem strange to them.`,
          `I think each band has its own understanding of the spirit world. It would be arrogant to say only ours is true. But I don't know their ways well enough to judge them.`,
          `Different peoples speak to different spirits. That is the way of the world. What matters is that we keep faith with ours.`,
        ]);

        if (techLevel <= 6) return maybeAddReligion(pick([
          isTheocratic || allExclusive
            ? `The gods we honor are the true gods. What others worship — I was taught it is either misunderstanding or false belief. I don't say this to cause offense. But you asked.`
            : `Other peoples have their gods and their rites. There is something in me that is curious rather than hostile. The sacred is a large thing — perhaps larger than any one people's understanding of it.`,
          npcReligion
            ? `My own faith gives me what I need. As for other beliefs — I don't know them well enough to judge. I try not to condemn what I don't understand.`
            : `I observe the rites I was taught. As for other peoples' beliefs — I leave them to their own relationship with whatever they honor.`,
          pos === 'leader'
            ? `Different religious traditions among neighboring peoples can be a source of conflict or a source of curiosity — it depends on how it's handled. I try to handle it carefully.`
            : `The priests say what they say about foreign religion. I am not sure I agree entirely. A belief that helps people live well — can it be entirely wrong?`,
          `I will not call another people's god a demon simply because it is not mine. I have met people of different faiths who were good people. That must mean something.`,
        ]));

        // Modern eras
        return pick([
          allExclusive || isTheocratic
            ? npcReligion
              ? `I believe what I believe with conviction — and I'll be honest, I think some of what other traditions teach is wrong. I don't think that makes me hostile to the people. But I won't pretend we agree.`
              : `The prevailing view here is that our beliefs are the correct ones. I hold that with less certainty than some. But that's the official position.`
            : allTolerant
              ? npcReligion
                ? `Other religions? I think there's something true in a lot of traditions. My own faith matters to me, but I don't think ${npcReligion} has a monopoly on meaning or wisdom. I find other traditions genuinely interesting.`
                : `Different beliefs, different paths — I approach them with curiosity. I've met people of very different faiths and found something genuine and good in most of them.`
              : npcReligion
                ? `I have my own faith, and I take it seriously. People of other religions — I respect them as people. I don't always respect everything their traditions claim. But the people, yes.`
                : `I don't have strong personal faith. But watching how different religions function in different communities — some seem genuinely good for people; others seem more useful to the powerful. I notice the difference.`,
          pos === 'leader'
            ? `Navigating religious difference is one of the quiet challenges of leadership. My own views are my own. Publicly, I try to hold a position that allows people of different traditions to live together.`
            : `The people I've known from other traditions — most of them just want what I want: to live well, to treat others decently, to find meaning. The theological differences can be large; the human realities tend to be more similar.`,
          `What I notice most about people of different faiths is not the doctrine — it's what the belief actually does in their lives. Does it make them more compassionate, more rigid, more generous, more fearful? That tells me more than any theology.`,
          outsiderRel === 'isolationist'
            ? `We don't have much contact with peoples of other faiths. I know little about what they believe. I'm not sure that's a problem — or whether it is.`
            : `I've met people of different faiths through trade and travel. My honest reaction: I respect genuine belief wherever I find it. The part I struggle with is when belief becomes a reason to harm people who believe differently.`,
        ]);
      }

      // ── Extinction Events ─────────────────────────────────────────
      case 'extinction': {
        // Find the most recent extinction event in civ history
        const extinctionEntry = civ.history && [...civ.history].reverse().find(h => h.type && h.type.startsWith('extinction_'));
        const extinctionType  = extinctionEntry ? extinctionEntry.type : null;

        const typeLabel = {
          extinction_meteor:       'the impact',
          extinction_plague:       'the plague',
          extinction_supervolcano: 'the eruption',
          extinction_climate:      'the collapse',
          extinction_nuclear:      'the nuclear event',
        }[extinctionType] || 'what happened';

        const typeDesc = {
          extinction_meteor:       'A large body struck the land. The fires, the debris, the long silence afterward.',
          extinction_plague:       'The sickness moved faster than anything we could organize against. By the time anyone understood what was happening, it was already everywhere.',
          extinction_supervolcano: 'The sky changed. The growing season failed. Everything that depended on sunlight and warmth went first, then everything else.',
          extinction_climate:      'It was not one event — it was the accumulation of every ignored threshold until the system broke all at once.',
          extinction_nuclear:      'We did it to ourselves. I think about that more than I think about the cold or the dark.',
        }[extinctionType] || 'I am not sure how to explain what has happened.';

        return pick([
          pos === 'leader'
            ? `My role now is to hold what remains together. Not to reconstruct what was — we cannot do that — but to keep the pieces from scattering entirely. ${typeDesc}`
            : pos === 'laborer'
              ? `I keep working because stopping means thinking, and thinking means understanding the full scale of what's gone. Not ready for that yet. ${typeDesc}`
              : pos === 'marginalized'
                ? `Those of us who already had little — we lost less in absolute terms, but we had less to lose. Now we are all equally reduced.`
                : `${typeDesc} The word "civilization" feels different now. Like something you only understand when you are looking at what remains of one.`,
          `${extinctionType ? `After ${typeLabel}` : 'After what has happened'}, the question is not how do we return to what we were. That's gone. The question is what we build from here, with what we have left.`,
          pos === 'scholar'
            ? `I have been documenting everything I can. Not for anyone alive — most of them are too busy surviving to read. For whoever comes after, if there is an after.`
            : pos === 'merchant'
              ? `There is no economy in the old sense. There is barter, there is pooling, there is taking what is needed and giving what you can spare. That's it.`
              : `${typeDesc} I never believed anything like this was possible in my lifetime. Now I spend time wondering what else I thought impossible that is not.`,
          `The survivors — what I notice is that the ones doing best are the ones who already knew how to cooperate. The ones who only knew how to compete are struggling.`,
        ]);
      }

      // ── Public Works ──────────────────────────────────────────────
      case 'public_works': {
        // Find the most recent public works entry in civ history
        const worksEntry = civ.history && [...civ.history].reverse().find(h => h.type && h.type.startsWith('works_'));
        const worksType  = worksEntry ? worksEntry.type : null;
        const worksTitle = worksEntry ? worksEntry.title : null;

        const worksNote = {
          works_granary:    'The granary network means people stop spending all their energy worrying about the next harvest. That changes what they can think about.',
          works_irrigation: 'Irrigation is the difference between farming where the rain falls and farming where the people are. It makes everything else possible.',
          works_aqueduct:   'Clean water. It sounds simple. It is not simple. Entire categories of illness became rarer almost immediately.',
          works_roads:      'The roads connect people who had no reason to speak before. What travels along a road is not just goods — it is information, ideas, influence.',
          works_library:    'Knowledge that was scattered across private collections and memory is now accessible. People are using it in ways the builders did not anticipate.',
          works_hospital:   'Before the hospitals, you survived illness through luck, family, or wealth. Now it is different. Not perfect — but different.',
          works_energy:     'The energy transition changed who had power in both senses. The new grid is more distributed. That has political implications that are still unfolding.',
          works_space:      'The space program gave us something rare: a goal large enough that it required cooperation at a scale we had not managed before.',
        }[worksType] || (worksTitle ? `The ${worksTitle.toLowerCase()} was a significant undertaking.` : 'These projects take enormous coordination. Most people only see the result, not the process that produced it.');

        return pick([
          pos === 'laborer'
            ? `I worked on it. Not in any leadership role — just doing what I was asked. But I was part of it. That matters to me. ${worksNote}`
            : pos === 'leader'
              ? `The decision to commission it was not without opposition. Significant resources, significant disruption during construction. The results are what convinced the skeptics. ${worksNote}`
              : `${worksNote}`,
          `Public works are how a society builds what individuals cannot build alone. Not every society figures that out. The ones that do tend to last longer.`,
          pos === 'marginalized'
            ? `For once, something built for everyone actually reached everyone. That is not how it usually goes. I am paying attention to what made this one different.`
            : `${worksNote} The ongoing question is who maintains it, who governs its use, and who it ultimately serves over time.`,
          `The people who lived through the construction complained about it. The people who grew up using it take it for granted. That is probably how it should work.`,
        ]);
      }

      // ── Neighboring Plague ───────────────────────────────────────
      case 'plague_neighbor': {
        // Check if there are any pending plague responses for this civ
        const plagueRespEntries = Object.entries(civ.state?.plagueResponses || {})
          .filter(([, prs]) => prs.response !== 'resolved');
        const hasActivePlague = plagueRespEntries.length > 0;
        const affectedName = hasActivePlague ? plagueRespEntries[0][1].affectedCivName : 'a neighboring civilization';
        const ourResponse  = hasActivePlague ? (plagueRespEntries[0][1].response || 'ignore') : null;

        if (!hasActivePlague) {
          // Check if we recently resolved a plague response (look at history)
          const recentPlagueResponse = civ.history.slice(-15).find(h =>
            h.historyType === 'extinction_plague' && h.title && h.title.includes('Plague Response')
          );
          if (recentPlagueResponse) {
            return pick([
              `We made our choice on the plague situation. Whatever happens now, it's done. I don't know if we got it right.`,
              pos === 'leader'
                ? `A decision like that — how to respond when disease is killing your neighbors — there's no good answer. You pick the least wrong one and live with it.`
                : `I keep thinking about what we did when the plague was spreading from the other side. Whether it was the right thing. Whether we'll find out.`,
              `The plague next door seems to have passed, or at least receded. We'll see if it comes back. Those things tend to.`,
            ]);
          }
          return pick([
            `I'm not aware of a plague affecting our neighbors right now. What have you heard?`,
            `Disease is always somewhere. Are you asking about something specific?`,
          ]);
        }

        const responseNote = ourResponse === 'quarantine'
          ? ` We've closed the borders. It's hard — people have family on the other side, traders are furious — but I think it was the right call.`
          : ourResponse === 'aid'
            ? ` We sent help. I know some people think that's naive, but you don't just watch people die if you can do something. And they might do the same for us someday.`
            : ourResponse === 'refugees'
              ? ` We opened the border to the people fleeing it. I know the risk. But those are human beings.`
              : ` We haven't made a formal decision yet. That bothers me. The time to choose is running out.`;

        return pick([
          `The plague in ${affectedName} is on everyone's mind.${responseNote}`,
          pos === 'leader'
            ? `When something like that is happening next door, there are no clean choices. Quarantine, aid, do nothing — each one costs something. Each one risks something.${responseNote}`
            : `It's strange — you hear about plague in ${affectedName} and you think: how close are we? Could it reach us? Has it already?${responseNote}`,
          `Disease doesn't respect borders. Whatever we decide, we're not as separate from what's happening in ${affectedName} as some people think.${responseNote}`,
          ourResponse === 'quarantine'
            ? `The quarantine is unpopular with a lot of people. But fear of the unknown travels faster than any pathogen. Closing the borders at least gives people something visible that's being done.`
            : ourResponse === 'aid'
              ? `Helping ${affectedName} is the right thing. But I'll be honest — part of my motivation is selfish. A neighbor that collapses completely is not a stable neighbor.`
              : `What worries me isn't what we decided. It's whether the decision will be enough, whatever it is.`,
        ]);
      }

      // ── Inter-Civ Relations & Diplomacy ─────────────────────────
      case 'inter_civ_relations': {
        // Build a picture of the civ's inter-civ situation
        // civ.relations is a Map: civId → { attitude, trade, war, treaty, name }
        const allies = [];
        const tradeParters = [];
        const enemies = [];
        const treatyList = [];

        if (civ.relations) {
          for (const [, rel] of civ.relations) {
            const othName = rel.name || 'a neighbor';
            if (rel.war) enemies.push(othName);
            else if (rel.treaty?.type === 'alliance') allies.push(othName);
            else if (rel.treaty?.type === 'trade_agreement') tradeParters.push(othName);
            else if (rel.treaty?.type === 'non_aggression') treatyList.push(othName);
            else if (rel.attitude > 60 && rel.trade) tradeParters.push(othName);
            else if (rel.attitude < -40) enemies.push(othName);
          }
        }

        const hasAllies = allies.length > 0;
        const hasEnemies = enemies.length > 0;
        const hasTradePartners = tradeParters.length > 0;
        const hasTreaties = treatyList.length > 0;

        const allyStr  = allies.join(', ') || 'none';
        const enemyStr = enemies.join(', ') || 'none';
        const tradeStr = tradeParters.join(', ') || 'none';
        const treatyStr = treatyList.join(', ') || 'none';

        // Compose a situational description
        const situationNote = hasAllies
          ? `Our alliance with ${allyStr} is one of the more stable things in an unstable world.`
          : hasEnemies
            ? `The hostility with ${enemyStr} shapes everything — how we think about our borders, our resources, our future.`
            : hasTradePartners
              ? `We maintain trade relations with ${tradeStr}. That creates mutual interest in each other's stability.`
              : `Our relations with neighboring civilizations are… neutral, for now. Neither close nor threatening.`;

        return pick([
          pos === 'leader'
            ? `Keeping track of our neighbors is most of the job. ${situationNote} Every generation thinks the real work is internal — they're usually wrong.`
            : `${situationNote} People here are more aware of what the other civilizations are doing than you'd think from the outside.`,
          hasAllies
            ? `${allyStr} — we have a formal alliance. That means something. Not everything, but something. If things went badly wrong, we would not be entirely alone.`
            : `We don't have any formal alliances at the moment. That's either cautious independence or dangerous isolation, depending on how the next few years go.`,
          hasEnemies
            ? pos === 'laborer'
                ? `The situation with ${enemyStr} worries me. War costs — it costs people like me most.`
                : `The relationship with ${enemyStr} has been deteriorating. Whether it resolves through diplomacy or conflict is still an open question.`
            : `We're not at war with anyone right now. That's not nothing. Peace is always easier to lose than to build back.`,
          hasTradePartners
            ? `Trade with ${tradeStr} does more than move goods — it creates relationships between people, not just governments. That's the part that makes it hard to break.`
            : `We're not heavily engaged in trade with other civilizations. Whether that's by circumstance or choice, it limits how embedded we are in the broader world.`,
          hasTreaties
            ? `The non-aggression pact with ${treatyStr} — I think of it as a pause rather than peace. But pauses can become habits, and habits can become peace if they last long enough.`
            : `${situationNote} International relations — if you can call them that — are as complicated here as anywhere else. Interests, history, proximity. None of it is simple.`,
          pos === 'marginalized'
            ? `Wars between civilizations always land hardest on people like me, whatever side we're on. So I pay attention to how our relations with the neighbors are going, even if nobody asks.`
            : pos === 'merchant'
              ? `I'll be honest: my first concern is always whether trade routes are open. That tells you more about the real state of relations than any official statement.`
              : `The relationship between civilizations tends to reflect their internal priorities. What a society is willing to do to its neighbors is usually related to what it's willing to do to itself.`,
        ]);
      }

      // ── Leader / Succession ──────────────────────────────────────
      case 'leader_event': {
        const leader    = civ.governance?.leader;
        const govModel  = civ.governance?.model?.label || 'governing structure';
        const powerConc = Math.round(civ.governance?.powerConcentration || 50);
        const recentLeadership = (civ.history || []).filter(h => h.type === 'leadership').slice(-3).reverse();

        if (!leader && powerConc < 40) {
          return pick([
            `There's no single leader here — not in that sense. Decisions come from the group, or from whoever holds the floor longest. That has its own problems, but succession isn't one of them.`,
            `Power isn't concentrated in one person under a ${govModel} system. When someone important steps back, others step up. It's less dramatic than having a single ruler, but also less fragile.`,
            `We don't really have "a leader" the way you might be imagining. The ${govModel} works differently. Authority is more distributed.`,
          ]);
        }

        if (!leader) {
          return pick([
            `Leadership here is… complicated. I'd rather not get into the specifics.`,
            `There's someone nominally in charge. I try not to think about what comes next.`,
          ]);
        }

        const healthDesc = leader.healthIndex > 70
          ? `appears to be in good health`
          : leader.healthIndex > 40
            ? `has been looking less certain than they used to`
            : `is not well — anyone paying attention can see it`;
        const tenureNote = leader.yearsInPower > 15
          ? `They've been in power for ${leader.yearsInPower} years. Long enough that most people have never known anything else.`
          : leader.yearsInPower > 5
            ? `${leader.yearsInPower} years now. Long enough to have consolidated, but the question of what comes next is never far away.`
            : `Only ${leader.yearsInPower} years. Still establishing.`;

        if (recentLeadership.length > 0) {
          const last = recentLeadership[0];
          return pick([
            `You've heard about what happened to ${leader.name}? ${last.title} — in year ${last.year}. ${powerConc > 65 ? 'The scramble for who fills that gap has already started.' : 'The transition is underway. Whether it holds depends on the institutions.'} A moment like that reveals everything about how a governing structure actually works.`,
            `${last.title} — that's the most significant thing that's happened here in a while. Leadership crises have a way of accelerating everything that was already in motion, for good or ill.`,
            `We've just been through something: ${last.title}. ${pos === 'leader' ? 'Managing continuity through that kind of disruption is the hardest part of governing.' : 'From where I stand, it felt like the ground shifted. Things that seemed settled are not.'}`,
          ]);
        }

        return pick([
          `${leader.title} ${leader.name} ${healthDesc}. ${tenureNote} Nobody talks about succession out loud. That doesn't mean nobody's thinking about it.`,
          pos === 'leader'
            ? `${leader.name} — that's me you're asking about, more or less. You get used to it. The work doesn't stop; the scrutiny doesn't stop. ${leader.healthIndex < 50 ? 'The health questions are becoming harder to ignore.' : 'I intend to continue as long as the work requires it.'}`
            : `${leader.title} ${leader.name} is ${leader.age} years old, ${leader.yearsInPower} years in power. ${healthDesc}. People whisper about the future, but nobody says it directly — not yet.`,
          `A ${govModel} with a single leader at ${powerConc > 65 ? 'high' : 'moderate'} power concentration — when something happens to that person, it matters enormously. ${leader.name} ${healthDesc}. That's what I know.`,
          pos === 'marginalized'
            ? `${leader.name}? I try not to put too much weight on any individual at the top. Leaders change; the conditions most of us live in change more slowly. Still — ${healthDesc.replace('appears to be', 'the leader appears to be')}.`
            : `${leader.name} has held the position for ${leader.yearsInPower} year${leader.yearsInPower !== 1 ? 's' : ''}. ${tenureNote} What I've learned is that succession is always more disruptive than people expect — even when it's planned.`,
        ]);
      }

      // ── Cult Presence ────────────────────────────────────────────
      case 'cult_presence': {
        const recentCult        = (civ.history || []).filter(h => h.type === 'cult_rise').slice(-2).reverse();
        const recentSuppression = (civ.history || []).filter(h => h.type === 'cult_suppression').slice(-1)[0];
        const hasCult           = recentCult.length > 0;
        const fervor            = (civ.religion?.religions || [])[0]?.fervorLevel ?? 0;

        if (!hasCult) {
          return pick([
            fervor > 60
              ? `The fervor levels here are high enough that I think about it. High religious intensity plus instability — that's a combination that has historically produced exactly the kind of group you're describing. It hasn't happened here. Yet.`
              : `Not that I know of. There are intense groups, like there always are. But nothing I'd call a cult — no single figure demanding absolute devotion, no enforcement of loyalty through fear. Not yet.`,
            `That kind of group requires specific conditions to form: a felt absence of meaning, a population hungry for certainty, and usually someone willing to exploit that hunger. The conditions here aren't fully in place. I think.`,
            `Cults emerge from real needs — belonging, certainty, meaning. When those needs aren't met through normal social structures, people find other ways to meet them. I keep an eye on the edges of things for signs of that.`,
          ]);
        }

        const cultEntry = recentCult[0];
        const cultName  = cultEntry?.title?.replace('Cult Emergence: ', '') || 'the group';

        if (recentSuppression) {
          return pick([
            `The authorities moved against ${cultName}. The crackdown happened — it cost something in stability, and there were accusations on both sides about who the real threat was. Whether the underlying need that produced the cult has been addressed is another question entirely.`,
            `Suppression happened, yes. It doesn't mean the conditions that created ${cultName} are gone. You don't remove a cult by arresting its members — you remove a cult by addressing why people needed it. That's harder.`,
            pos === 'marginalized'
              ? `They came after ${cultName}. I have complicated feelings. Some of those people were looking for something real — belonging, meaning — and they ended up somewhere harmful. The suppression was heavy-handed. But so was the cult.`
              : `The state moved against the cult. Whether that was the right decision — and whether it worked — depends on what you think "worked" means. The cult is diminished. The conditions that produced it are largely unchanged.`,
          ]);
        }

        return pick([
          `${cultName} — yes, I know what you're referring to. It emerged from genuine need, I think, and then became something else. That's usually how it happens. The structure promises certainty and belonging; what it delivers is control.`,
          pos === 'laborer'
            ? `I know people who went toward ${cultName}. They weren't fools. They were looking for something — certainty, community, someone to tell them the world made sense. I understand the impulse. I don't like what it became.`
            : pos === 'leader'
              ? `${cultName} is a problem I've been tracking. These groups fill a vacuum — social, spiritual, political. The question is whether to suppress them, regulate them, or address what they're filling. All three have costs.`
              : `What worries me about ${cultName} isn't the individuals involved — it's the conditions that made it possible. High conformity pressure, low trust in existing institutions, a hunger for certainty. Those conditions don't go away when the cult is suppressed.`,
          `The emergence of ${cultName} says something about where we are. When conventional structures stop providing what people need — meaning, belonging, certainty — people find something that will. Sometimes it's healthy. This wasn't.`,
        ]);
      }

      // ── Alien Contact ────────────────────────────────────────────
      case 'alien_contact': {
        // Pre-contemporary: anachronistic — deflect
        if (techLevel <= 9) return Utils.randChoice([
          `I don't understand what you're asking. Beings from beyond the world? That sounds like something from a story — or a dream.`,
          `I have no idea what you mean by that. Can you explain it differently?`,
          `"Alien" in what sense? I know what a stranger is. I know what a foreigner is. But beings from beyond the sky — I've never heard that spoken of as anything real.`,
        ]);

        // Check civ history for signal or confirmed contact
        const hasSignal    = civ.history && civ.history.some(hh => hh.type === 'alien_signal');
        const hasConfirmed = civ.history && civ.history.some(hh => hh.type === 'alien_contact');

        if (!hasSignal && !hasConfirmed) {
          return pick([
            `Whether there's intelligent life elsewhere — the universe is enormous. It strains credibility to imagine we're the only minds in it. But we haven't heard anything. Not yet.`,
            `Extraterrestrial intelligence is theoretically plausible — the numbers suggest it almost has to exist somewhere. What I find unsettling is the silence. Either they're not there, or they are and we haven't heard them, or they are and they're choosing not to speak. None of those is entirely reassuring.`,
            pos === 'leader'
              ? `What we'd do if we received a signal from somewhere beyond our world — I've thought about it. I'm not sure our institutions are ready to handle it, politically, socially, or philosophically.`
              : `I'd want to know. Whatever it meant, whatever it implied — I think living with certainty, even difficult certainty, is better than living inside a question that enormous.`,
          ]);
        }

        if (hasSignal && !hasConfirmed) {
          return pick([
            `The signal. Yes. I think about it constantly — most people do. It might be instrument error, or a natural phenomenon we don't understand yet. But the people analyzing it don't think so.`,
            `We've detected something structured. Something that doesn't fit any natural explanation we have. Whether it means what some people are saying — I don't know. But something is out there.`,
            pos === 'laborer' || pos === 'marginalized'
              ? `My honest reaction to the signal? Fear, mostly. Not of them — of what it means for us. The world already feels unstable. Adding something this large to it — I don't know what that does to everything else.`
              : pos === 'leader'
                ? `The signal has changed how I think about every other problem we face. Against the possibility that something — someone — is out there looking at us, our internal conflicts look very small. And somehow, more urgent.`
                : `I've read everything publicly released. Structured, repeating, no natural explanation found, no instrument error detected. That's what we know. Everything else is inference.`,
            `If they sent it, they know we're here. That changes our position in a way I can't fully process. We're not just speculating about them anymore — they weren't speculating about us.`,
          ]);
        }

        // Confirmed contact — check for response protocol
        const RESPONSE_TYPES = ['alien_response_open','alien_response_study','alien_response_quarantine','alien_response_military','alien_response_diplomatic'];
        const responseEntry  = civ.history && civ.history.find(hh => RESPONSE_TYPES.includes(hh.type));
        const responseType   = responseEntry ? responseEntry.type : null;

        const protocolNote = responseType === 'alien_response_quarantine'
          ? pos === 'laborer' || pos === 'marginalized'
            ? ` And the official response — classifying everything, restricting what gets told to whom — makes it worse. We're supposed to live with the largest fact in history and pretend we don't know it.`
            : pos === 'leader'
              ? ` The quarantine was the right call. Uncontrolled information at this scale produces panic. We needed time to develop a coherent response before the public shaped one for us.`
              : ` The information quarantine tells me something about the people making decisions here. They decided the public couldn't handle it — or that control mattered more than honesty.`
          : responseType === 'alien_response_military'
            ? pos === 'laborer' || pos === 'marginalized'
              ? ` And we're treating it like a threat — preparing defenses against something we don't understand. I'm not sure that's wrong. But it's terrifying either way.`
              : pos === 'leader'
                ? ` The military posture was a difficult call. But until we understand their capabilities and intent, the responsible position is to prepare for the worst while hoping for otherwise.`
                : ` The military response posture worries me. We're assuming hostility toward something we've never interacted with. That assumption reveals more about us than about them.`
          : responseType === 'alien_response_open'
            ? ` And the decision to be open — to disclose everything and attempt real communication — is the one I think we'll look back on as defining. For better or worse, we chose transparency.`
            : responseType === 'alien_response_study'
              ? ` The scientific study protocol makes sense to me. We should understand before we act. The question is whether the intelligence out there is willing to wait for us to catch up.`
              : responseType === 'alien_response_diplomatic'
                ? ` The diplomatic approach feels right. Structured, deliberate, treating it as a relationship to be built rather than a threat to be neutralized or a mystery to be extracted.`
                : ` We're still deciding how to respond. The window for that decision is narrower than people think.`;

        // ── Contact ended in hostile withdrawal ─────────────────
        const acs = civ.state && civ.state.alienContactState;
        if (acs && acs.stage === 'ended_hostile') {
          const turns = acs.turnsInContact;
          const bt = acs.breakthroughCount || 0;
          const bd = acs.breakdownCount    || 0;
          return pick([
            `They stopped communicating. ${turns} turn${turns === 1 ? '' : 's'} of contact and then — nothing. Worse than nothing, actually. The last signals weren't silence. They were something we couldn't mistake for neutral.`,
            `I keep thinking about what we could have done differently. ${bt > 0 ? `We had ${bt} breakthrough${bt === 1 ? '' : 's'} — moments where something real seemed to be passing between us. ` : ''}${bd > 0 ? `But there were ${bd} breakdown${bd === 1 ? '' : 's'} too. ` : ''}It ended in withdrawal. Whether it was our fault — whether "fault" even applies — I genuinely don't know.`,
            pos === 'leader'
              ? `The decision I'm most accountable for is the protocol we chose. Whether that protocol is why it ended the way it did — I don't know. I don't think anyone knows. What I know is: ${turns} turns of the most consequential relationship in history, and we failed to maintain it.`
              : `Most people are processing it as a loss. A civilizational loss. Something like grief, but for something we never fully had.`,
            `The scholars who study it say this isn't necessarily permanent — that a hostile withdrawal isn't the same as a declaration of intent. Maybe they're right. But it doesn't feel that way from where I'm standing.`,
          ]);
        }

        // ── Breakthrough context: recent positive exchange ──────
        if (acs && acs.stage === 'ongoing' && (acs.breakthroughCount || 0) > 0 &&
            acs.lastCommResult === 'success' && acs.relationshipScore >= 65) {
          const bt = acs.breakthroughCount;
          return pick([
            `We've had ${bt} breakthrough${bt === 1 ? '' : 's'} now — moments where something genuinely passed between us. I don't know how to describe what it feels like to receive something from a non-human intelligence and realise you understand what it's trying to give you, even if you can't explain how.`,
            `The most recent exchange produced something our researchers are still working through. ${bt > 1 ? `That's ${bt} times now. ` : ''}Every time it happens I wonder if we're building something — or if we're just lucky to be misunderstanding each other in compatible ways.`,
            pos === 'scholar' || pos === 'leader'
              ? `The breakthroughs are the thing I'll spend the rest of my career thinking about. Not the contact itself — the moment when the communication started working. Whatever "working" means across that kind of gulf.`
              : `Hearing about the breakthroughs is — I can't explain it. It's like being told the universe decided to give you something. Unasked for. Incomprehensible. But real.`,
          ]);
        }

        // ── Breakdown context: recent hostile exchange ──────────
        if (acs && acs.stage === 'ongoing' && (acs.breakdownCount || 0) > 0 &&
            acs.relationshipScore <= 35) {
          const bd = acs.breakdownCount;
          return pick([
            `There have been ${bd} breakdown${bd === 1 ? '' : 's'} now. Each one changes the atmosphere — in the research teams, in the government, in how people talk about the contact in ordinary conversation. The tone has shifted from uncertain to afraid.`,
            `The last signal we received wasn't just silence. It carried something. I don't know what to call it — the analysts use words like "negative affect" or "adversarial patterning." Whatever it is, ${bd > 1 ? `we've seen it ${bd} times` : "we've seen it"} and it doesn't feel like a misunderstanding.`,
            pos === 'leader'
              ? `Every time there's a breakdown, the pressure to change protocols intensifies. I understand it. But changing protocols is not without cost — they're watching how we respond to our own instability, and what they conclude from it is beyond my ability to predict.`
              : `It's frightening, honestly. To know there's something out there, and to feel the relationship going wrong, and to have no way of explaining yourself to it.`,
          ]);
        }

        // ── Ongoing contact: use relationship score from alienContactState ──
        if (acs && acs.stage === 'ongoing' && acs.turnsInContact > 0) {
          const rel = acs.relationshipScore;
          const turns = acs.turnsInContact;
          const relLabel = rel >= 75 ? 'warm' : rel >= 55 ? 'cautious' : rel >= 35 ? 'strained' : 'deteriorating';
          const relNote = rel >= 75
            ? ` Something that might be called warming. The signals back have more structure now — not interpretable yet, but different from how they started. Something like interest.`
            : rel >= 55
              ? ` Cautious equilibrium. We send, they respond. Neither side seems to be escalating, but we're not building anything like trust yet either.`
              : rel >= 35
                ? ` Strained, honestly. Whatever we're communicating with the current approach, they seem to be receiving something they don't like.`
                : ` Deteriorating. The signals have changed — less frequent, differently patterned. If I had to describe the tone, I'd say cold. Or indifferent. Which may be worse.`;
          const protocolLong = acs.protocol === 'alien_response_military'
            ? 'the military posture'
            : acs.protocol === 'alien_response_quarantine'
              ? 'the information quarantine'
              : acs.protocol === 'alien_response_open'
                ? 'the open contact approach'
                : acs.protocol === 'alien_response_diplomatic'
                  ? 'the diplomatic outreach'
                  : 'our current approach';
          return pick([
            `We've been in contact for ${turns} turn${turns === 1 ? '' : 's'} now. The relationship is ${relLabel}.${relNote}`,
            rel >= 75
              ? `Something is building between us and them. Slowly, strangely — but the trajectory feels upward. We're learning each other, in some sense we don't fully understand.${responseType ? protocolNote : ''}`
              : rel < 35
                ? `The way things are trending, I'm genuinely worried. Every protocol produces a reaction — and the reaction we're getting with ${protocolLong} doesn't feel neutral or benign.${responseType ? protocolNote : ''}`
                : `${turns} turn${turns === 1 ? '' : 's'} of contact and we still know almost nothing. But the relationship — what little we can infer about it — hasn't collapsed. That may be the best we can say.${responseType ? protocolNote : ''}`,
            pos === 'leader'
              ? `Every decision about how to proceed has to weigh what we know against what we fear. ${turns} turn${turns === 1 ? '' : 's'} in, the relationship is ${relLabel}. I think about it constantly.${responseType ? protocolNote : ''}`
              : `I don't know how to explain what it feels like to know that there's something out there, and that how we behave matters to them somehow.${relNote}`,
            `We chose ${protocolLong}. And the relationship is ${relLabel}. Whether those two facts are connected — whether they're even capable of forming something like an attitude toward us — I genuinely don't know. But that's where we are.`,
          ]);
        }

        return pick([
          `They exist. We know they exist. I keep saying that to myself and it still doesn't feel real. The signal was confirmed — structured, intentional, not human. That's the world we live in now.${responseType ? protocolNote : ''}`,
          pos === 'leader'
            ? `The confirmation changes everything — politically, philosophically, institutionally. Every framework we've built for making decisions was built without this fact in it. We're rebuilding in real time.${responseType ? protocolNote : ''}`
            : pos === 'marginalized' || pos === 'laborer'
              ? `Everyone reacted differently. Exhilaration, terror, vertigo. I'm still finding my footing.${responseType ? protocolNote : " Whatever comes next, it won't be like what came before."}`
              : `The confirmed contact is the largest fact in the world right now. And yet daily life continues. The mind doesn't know how to hold something that big while also holding everything small.${responseType ? protocolNote : ''}`,
          `What do they want? Nobody knows. "What do they want" assumes they have something analogous to wanting. We don't even know that. We know they're there.${!responseType ? ' And we still haven\'t decided what to do about it.' : protocolNote}`,
          civ.governance && civ.governance.modelId === 'direct_congress'
            ? `The congresses have been meeting almost continuously since the confirmation.${protocolNote}`
            : `Every civilization is asking the same questions: how do we respond, who speaks, what do we say? The answers will define us — not just to them, but to ourselves.${responseType ? protocolNote : ''}`,
        ]);
      }

      // ── Migration ─────────────────────────────────────────────
      case 'migration': {
        const netBal    = civ.migration?.netBalance    || 0;
        const lastEvt   = civ.migration?.lastEvent     || null;
        const openBord  = civ.migration?.openBorderPolicy ?? false;
        const recentIn  = lastEvt === 'influx';
        const recentOut = lastEvt === 'outflow';

        const migPool = [];
        if (pos === 'leader') {
          migPool.push(
            recentIn
              ? `The influx is a test of institutional capacity more than anything else. We can absorb it. Whether we choose to do so well or badly is about governance, not numbers.`
              : `Migration is a signal. People move toward something or away from something. Both directions tell you something important about the world they're coming from and the one they think they're going toward.`,
            openBord
              ? `We have open borders because we believe that the freedom to move is as fundamental as any other. There are costs. I acknowledge them. I think they're worth bearing.`
              : `We manage our borders because we have obligations to the people already here. That doesn't mean we close them. It means we take both sets of obligations seriously.`
          );
        }
        if (pos === 'elite') {
          migPool.push(
            recentIn
              ? `The arrivals bring labor, which the economy can use. Whether we integrate them well enough to benefit from everything else they bring — skills, ideas, networks — is a different and more complicated question.`
              : `The outflow is a problem I watch carefully. When people with options leave, it tells you something about the direction of a place. I don't dismiss that.`,
          );
        }
        if (pos === 'laborer') {
          migPool.push(
            recentIn
              ? `Some of the new arrivals are working the same jobs I work. I understand why they came. I understand the pressure on wages, too. I try to hold both things without letting one erase the other.`
              : recentOut
                ? `People I know have left. Some of them couldn't make it work here. I understand why. I'm still here. I'm not sure what that says about either of us.`
                : `I don't know what to make of all the movement. I only know my own situation. It's precarious enough that I understand why people move. I just don't know where I'd go.`
          );
        }
        if (pos === 'marginalized') {
          migPool.push(
            recentIn
              ? `We arrived the same way they did. I remember what it was to be new. Whether this place receives people the way it received us, or worse — that's the real question.`
              : `I've thought about leaving. Seriously. Whether I do depends on whether there's somewhere that would receive someone like me better than here does.`,
            `Movement is how people try to find something better. Whether they find it depends on what's waiting for them, and whether what's waiting for them sees a person or a problem.`
          );
        }
        if (pos === 'scholar') {
          migPool.push(
            `Migration is a pressure relief valve and a resource transfer and a cultural disruption all at once. The outcomes depend almost entirely on the receiving society's capacity and willingness to integrate.`,
            `The gap between the places people leave and the places people go to tells you something measurable about quality of life differentials. Migration pressure is a social indicator.`
          );
        }
        if (netBal > 500) migPool.push(`More people have arrived than have left over time. The city feels different than it used to. Whether that's good depends on who you ask and what they mean by good.`);
        if (netBal < -500) migPool.push(`More people have left than have arrived. The place is quieter than it was. Some left by choice. Some didn't feel they had a choice.`);
        return pick(migPool.length ? migPool : [`Migration happens wherever conditions push or pull people. Here, the conditions are what they are. People respond accordingly.`]);
      }

      // ── Slavery ───────────────────────────────────────────────
      case 'slavery': {
        const slaveryActive = civ.slavery?.active;
        const slaveryType   = civ.slavery?.type;
        const colonized     = civ._colonizationType === 'enslavement';
        const emancipated   = !!civ.slavery?.emancipatedYear;
        const abolMove      = civ.slavery?.abolitionistMovement || 0;

        const slavPool = [];
        if (colonized) {
          // This civ is under enslavement colonization
          if (pos === 'laborer' || pos === 'marginalized') slavPool.push(
            `We are not free. I don't know how else to say it. The work we do is not given. It is taken.`,
            `I have no legal standing. My labor belongs to whoever holds the document that says it does. This is the world I was born into. I do not accept it as inevitable, but I cannot change it alone.`,
            `The ones who benefit from this arrangement call it natural or necessary. They have reasons for every chain. The reasons don't change what the chains are.`
          );
          if (pos === 'elite') slavPool.push(
            `The system runs on the labor it has always run on. I didn't design it. I operate within what I inherited. Whether that's a sufficient answer — I suppose that depends on who's asking.`
          );
        } else if (slaveryActive) {
          if (pos === 'leader' || pos === 'elite') slavPool.push(
            slaveryType === 'chattel'
              ? `The institution has existed longer than anyone living. It is the foundation of significant economic productivity. The arguments for change will have to be very persuasive before I consider dismantling what has been built on it.`
              : `${slaveryType?.replace(/_/g,' ')} is not chattel slavery. There are obligations on both sides. The structure is a contract, however asymmetric. That matters, at least legally.`,
            `The movement for change is getting louder. I'm aware of it. Whether the demands are realistic given the current economic structure — that's a harder question than the slogans allow for.`
          );
          if (pos === 'laborer') slavPool.push(
            `I'm not in chains myself. But the conditions here depend on other people being in them. I'm not comfortable with that dependency. I don't know what to do with that discomfort.`,
            `When you benefit from a system — even indirectly — you have to ask what you owe. I haven't resolved that question for myself.`
          );
          if (pos === 'marginalized') slavPool.push(
            `I know what coercion looks like because I live adjacent to it. The difference between my situation and theirs is smaller than the people who benefit from both would like me to believe.`
          );
          if (pos === 'scholar') slavPool.push(
            `The economic case made for it is largely circular — it is productive because it is sustained by force; the force is justified by the productivity. That's not an argument. It's a description of a power arrangement.`,
            abolMove > 50
              ? `The abolitionist movement is structurally significant. When the argument shifts from "should it end" to "when and how," you're already in transition. That transition can be managed or crisis can force it.`
              : `The institution is stable in the short term because the enforcement apparatus is intact. Stability and justice are not synonyms.`
          );
        } else if (emancipated) {
          slavPool.push(
            `The decree came. What follows the decree is the harder part — reparation, reintegration, the slow work of building something different from what was destroyed.`,
            `Emancipation is a beginning, not a conclusion. Anyone who thinks abolishing the formal institution solves what the institution built over generations hasn't looked carefully at history.`
          );
        } else {
          slavPool.push(`Forced labor in various forms has existed in most civilizations at some point. The question isn't whether it happened. It's what we do with that knowledge.`);
        }
        return pick(slavPool.length ? slavPool : [`That's a difficult thing to speak about.`]);
      }

      // ── Organized Crime ───────────────────────────────────────
      case 'crime': {
        const crimeType  = civ.organizedCrime?.type;
        const crimeLevel = civ.organizedCrime?.level || 0;
        const isCoastal  = civ.geography?.oceanAccess !== false;

        const crimePool = [];
        if (!crimeType || crimeLevel === 0) {
          crimePool.push(
            `There are always people who operate outside whatever rules exist. The question is whether that's a collection of individuals or an organized system. Organized crime is the second thing.`,
            `Criminal networks are a symptom. Usually a symptom of something the legitimate economy and legitimate governance are failing to provide.`
          );
        } else if (crimeType === 'street_gang') {
          if (pos === 'leader') crimePool.push(`The gang problem is a governance problem. You can crack down and push it around, or you can address what created it. Crackdowns are faster and look better. Addressing root causes takes a generation.`);
          if (pos === 'laborer' || pos === 'marginalized') crimePool.push(
            `The gangs are real. I navigate around them every day. What I know is that they recruited from people I grew up with — people the system had already decided weren't worth investing in.`,
            crimeLevel > 60
              ? `It's not safe in the way it used to not be safe, which was also not safe. It's gotten worse. The places where you don't go have expanded.`
              : `The gangs are a fact of life here. You don't talk about them. You don't get in their way. You try to raise your kids such that the recruitment doesn't land.`
          );
          if (pos === 'professional') crimePool.push(`I know the conditions that produced this. I know the communities where it's concentrated. I also know that the people who experience it most directly have the least power to change it.`);
          if (pos === 'scholar') crimePool.push(`Street gangs fill institutional voids. When governance, legitimate economic opportunity, and social belonging are all absent, something fills the gap. This is what fills it.`);
        } else if (crimeType === 'cartel') {
          if (pos === 'leader') crimePool.push(`The cartel has penetrated the economy more deeply than the enforcement numbers suggest. When you can't trust the revenue figures, the contract awards, or the police, the problem is structural.`);
          if (pos === 'laborer') crimePool.push(`The cartel pays better than my employer in some cases. I'm not in it. But I understand why someone would be. That's not a comfortable thing to admit.`);
          if (pos === 'professional') crimePool.push(`The distortion to normal economic activity is significant. Certain contracts can't be fairly competed for. Certain officials can't be trusted to enforce agreements. That changes how I operate.`);
          if (pos === 'scholar') crimePool.push(`Cartels are economic actors first. The violence is enforcement of a market position. Understanding them as primarily criminal organizations rather than as black-market businesses leads to bad policy.`);
        } else if (crimeType === 'mafia') {
          if (pos === 'leader') crimePool.push(`The line between the organization and the institutions it has infiltrated is genuinely blurry at this point. That's the problem. Prosecuting it requires trust in systems it may have already compromised.`);
          if (pos === 'elite' || pos === 'professional') crimePool.push(
            `The mafia provides something: predictability. Corrupt predictability. But in an environment where legitimate contracts aren't reliably enforced, that's actually valuable to some people. That's a damning comment on the legitimate institutions.`,
            `I know people who work adjacent to it. They describe it as a second governance layer — slower, more violent, but in some ways more reliable for certain kinds of transactions.`
          );
          if (pos === 'scholar') crimePool.push(`The distinction between the mafia and the state becomes analytically difficult when the mafia controls enough of the state's functions. At some point you're describing the same organization with different names.`);
        } else if (crimeType === 'pirate_network') {
          if (pos === 'leader') crimePool.push(`The piracy is affecting our trade relationships. Partners are demanding guarantees we can't currently provide. It's not just a security problem — it's a diplomatic one.`);
          if (pos === 'laborer' || pos === 'marginalized') crimePool.push(
            isCoastal
              ? `The coast has always been a place where the law was negotiable. The sea doesn't care about jurisdiction. That's been true for as long as anyone can remember.`
              : `The pirates operate out there somewhere. I mostly know it through what it costs — prices on goods that come by sea have gone up.`
          );
          if (pos === 'scholar') crimePool.push(`Piracy historically emerges from the intersection of maritime opportunity, weak state projection capacity, and economic desperation in coastal communities. It's been this way across multiple historical periods.`);
        }
        return pick(crimePool.length ? crimePool : [`Criminal networks are a real presence. How visible they are depends on where you stand.`]);
      }

      default:
      // ── Pass 7: Paradigm Shift ──────────────────────────────
      case 'paradigm_shift': {
        const cg       = civ.state?.culturalGap ?? {};
        const wc       = civ.state?.wealthCapture ?? {};
        const readiness = cg.paradigmShiftReadiness ?? 0;
        const cynicism  = cg.cynicismLevel ?? 0;
        if (pos === 'leader' || pos === 'elite') return pick([
          `I understand the appeal of fundamental change. But every transition carries costs the advocates rarely price in fully. Managing that is harder than criticizing what exists.`,
          `The desire to replace a system is often fueled by legitimate grievance. Whether the replacement actually addresses those grievances — history suggests that's harder than it sounds.`,
          wc.degree > 60
            ? `Systemic change sounds liberating until you understand what holds the current order together. Some of it is inertia, yes. Some of it is investment, employment, institutional continuity. That weight is real.`
            : `Reform is often the wiser path — targeted corrections to real problems rather than wholesale transformation that risks throwing out what's functional.`,
        ]);
        if (cynicism > 65) return pick([
          `Systemic change? I've stopped believing it comes from above. What I haven't stopped believing is that it comes — eventually — from the pressure building underneath.`,
          `I watch the conversation about changing the system. I've watched it for years. What I notice now is that more people have stopped arguing about whether change is needed and started asking how.`,
          `I think about what a different arrangement could look like. Then I think about everything that would have to break or be broken before we get there. Both thoughts stay with me.`,
        ]);
        if (readiness > 55) return pick([
          `Something is building. I don't know what it becomes. But the conversations I'm hearing are different — more structural, less about individual grievances, more about the arrangement itself.`,
          `I think the conditions for real change are accumulating. Whether that translates into anything constructive depends on decisions that haven't been made yet.`,
          `More people around me are asking questions that don't have answers inside the current system. That's either a beginning or something more dangerous. I'm watching carefully.`,
        ]);
        return pick([
          `Things can be different. Between believing that and making it real — there's a large distance, mostly filled with inertia and entrenched interest. But that distance has been crossed before.`,
          `The weight of any system is enormous — not just the power structure, but the habits and expectations of people who have adapted to it. Changing behavior after you change the structure takes far longer than people expect.`,
          `I hold the idea of fundamental change seriously without holding it naively. The history of attempts is complicated. The need doesn't make success inevitable.`,
        ]);
      }

      // ── Pass 7: Wealth Capture ──────────────────────────────
      case 'wealth_capture': {
        const wc     = civ.state?.wealthCapture ?? {};
        const deg    = wc.degree ?? 0;
        const feudal = wc.feudalDynamic ?? false;
        if (pos === 'leader' || pos === 'elite') return pick([
          deg > 60
            ? `Those with the most invested in stable outcomes naturally have more influence over what outcomes are pursued. That's not corruption — that's accountability to consequence.`
            : `The relationship between wealth and influence is real. But having a stake in policy outcomes isn't the same as controlling them. Those are very different claims.`,
          `I'd distinguish between influence — which is inevitable and even appropriate — and capture, which means the decision-making process no longer serves broader public interest. The line matters.`,
        ]);
        if (feudal) return pick([
          `We have formal governance. We also have the people who actually decide. If you watch carefully over time, you learn which is which.`,
          `The formal structure and the actual structure have drifted a long way from each other. I don't think that drift is accidental.`,
          `Whatever we call the system, the pattern of who benefits from its decisions is consistent. Consistent over time, across administrations, through supposed reforms. That consistency tells you something.`,
        ]);
        if (deg > 50) return pick([
          `Of course money shapes decisions. The question I keep coming back to: at what point does influence become control? I think we passed that point without noticing.`,
          `Follow what actually gets decided — not what gets said in speeches. Track what gets funded, what gets investigated, what gets quietly protected. The pattern is consistent.`,
          `There's a difference between wealth participating in governance and wealth effectively being governance. Most people feel that difference even when they don't have words for it.`,
        ]);
        return pick([
          `People with resources have more say — I've never expected otherwise. What matters is whether there's any meaningful check. Whether others have genuine recourse when interests conflict.`,
          `The concentration of wealth and the concentration of decision-making power tend to move together. That's not a secret. What varies is how explicitly it operates and how much gets contested.`,
        ]);
      }

      // ── Pass 7: Cultural Gap ────────────────────────────────
      case 'cultural_gap': {
        const cg  = civ.state?.culturalGap ?? {};
        const gap = cg.gapScore ?? 0;
        const cyn = cg.cynicismLevel ?? 0;
        if (pos === 'leader' || pos === 'elite') return pick([
          `Every society articulates ideals that exceed its practice. That gap isn't hypocrisy — it's aspiration. It shows what a culture values even when it can't yet fully achieve it.`,
          gap > 40
            ? `The gap between stated values and practiced incentives is real. I won't pretend otherwise. But the statement of values still matters — it creates a standard that can be invoked.`
            : `I don't find it contradictory to hold ideals while acknowledging we don't perfectly embody them. The articulation is part of moving toward them.`,
        ]);
        if (cyn > 65 || gap > 55) return pick([
          `We're taught to value fairness, cooperation, honesty — and then rewarded for the opposite. Every day. By the same institutions that teach us those values.`,
          `They teach you what to believe, then build a system that punishes you for actually believing it. That's not a contradiction — that's a mechanism. It keeps people confused and manageable.`,
          `The words and the incentives point in completely different directions. After enough time living inside that contradiction, something shifts in you. The confusion resolves into something clearer and harder.`,
          gap > 60
            ? `I was taught that hard work and honesty would be recognized. Then I spent years watching who actually gets ahead. The lesson the real system teaches is different from the one in the classroom.`
            : `There's a significant gap between what we're told this society values and what it actually rewards. Most people feel it. Not everyone has words for it yet.`,
        ]);
        return pick([
          `What we're taught and what we're rewarded for don't always match. I try to hold onto the values even when the incentives push elsewhere. It takes deliberate effort.`,
          `The principles I was raised with and what I see being rewarded in practice — they sometimes align and sometimes don't. The discrepancy bothers me. I haven't resolved it.`,
          `Every society teaches things it doesn't fully practice. The size of that gap tells you something important about the pressure people live under — to appear one way while adapting to incentives that point another.`,
        ]);
      }

      // ── Pass 7: Cynicism & Revolutionary Consciousness ──────
      case 'cynicism_consciousness': {
        const cg  = civ.state?.culturalGap ?? {};
        const cyn = cg.cynicismLevel ?? 0;
        const rc  = cg.revolutionaryConsciousness ?? 0;
        const rd  = cg.paradigmShiftReadiness ?? 0;
        if (pos === 'leader' || pos === 'elite') return pick([
          `Cynicism is understandable. I'd distinguish it from useful skepticism — skepticism checks power, cynicism paralyzes action. The latter serves no one, especially not those it claims to speak for.`,
          `Disillusionment with institutions isn't the same as understanding them. Some disillusionment comes from accurate perception — some from disappointment that things are more complicated than hoped.`,
          `I take expressions of hopelessness seriously — they signal real failures of legitimacy. The response isn't to dismiss them. But validating them without offering alternatives doesn't help either.`,
        ]);
        if (cyn > 70 || rc > 60) return pick([
          `I don't call it cynicism. I call it pattern recognition. Watch long enough, and certain conclusions become unavoidable. That's not giving up — that's seeing clearly.`,
          `Revolutionary consciousness sounds dramatic. What I actually have is a clear picture of how the system works and who it works for. That picture took years to build. It doesn't go away.`,
          rc > 65
            ? `More people are starting to see the structure — not just complaining about specific outcomes, but understanding the arrangement that produces them. That's a qualitatively different conversation. What it leads to is still open.`
            : `The thing about finally understanding the system is that it doesn't make you feel powerful. First it makes you angry, then — after a while — very calm. Like you've stopped being confused.`,
        ]);
        if (cyn > 40 || rd > 40) return pick([
          `I have real doubts about whether the system can reform itself. The people with the most power to change it have the least incentive to do so. That's not cynicism — that's a structural observation.`,
          `I used to believe participation in the system could change it from within. I hold that belief differently now — with far more skepticism about the timeline and the mechanisms.`,
          `Something has shifted in how people here talk about institutions. The discontent is more focused than it used to be. More structural. That's a different kind of pressure on the system.`,
        ]);
        return pick([
          `I haven't given up. I've adjusted my expectations about what change looks like and where it comes from. Less from the top than I once believed. More from what accumulates at the edges.`,
          `Hope is harder work than cynicism. Cynicism costs nothing — you observe that things are bad and stop there. Hope requires keeping your attention on what might be different while staying honest about what is.`,
          `The institutions here have enough credibility to hold together for now. I try not to think too much about the trajectory. But the question of what holds things together is one I return to.`,
        ]);
      }

      // ── Pass 8 response cases ──────────────────────────────────────────────
      case 'behavioral_inertia': {
        const bi  = civ.state?.behaviorInertia ?? {};
        const coeff = bi.coefficient ?? 0;
        const govAge = civ.state?._govShiftAge ?? 0;
        const econAge = civ.state?._econShiftAge ?? 0;
        const timeInModel = Math.max(govAge, econAge);
        if (pos === 'leader' || pos === 'elite') return pick([
          `People will adjust in time. Change takes generations, not policy announcements. The structural conditions have changed — habits follow, eventually.`,
          `You can announce a new paradigm in a day. Changing how people actually act — how they bargain, how they raise their children, what they expect from each other — that takes longer. That's not failure, that's just how social change works.`,
          `I don't find it surprising that behavior lags behind formal change. What worries me more is when people mistake the lag for resistance and overreact to it.`,
        ]);
        if (coeff > 65 || timeInModel > 40) return pick([
          `The words changed. The habits didn't. You can't switch how people think overnight — they've been this way for years. Decades, some of them.`,
          `Everyone understood what the shift was supposed to mean. Most people are still doing what they were doing before. There's a gap between what the new model calls for and what actually happens day to day.`,
          `I noticed the official line is different now. But people still negotiate the same way, still make the same assumptions about who owes what to whom. Ideas move slower than rules.`,
        ]);
        return pick([
          `There's a difference between changing the rules and changing how people relate to each other. The rules changed. The other part is still working itself out.`,
          `Old patterns of behavior don't evaporate because a new system is declared. They fade over time — faster if the new conditions consistently reward different behavior.`,
          `People adapt faster when they can see that the new way actually works better for them. Abstract principle doesn't change behavior. Experience does.`,
        ]);
      }

      case 'power_impunity': {
        const cd = civ.state?.consequenceDeficit ?? {};
        const level = cd.level ?? 0;
        const turnsNoAcc = cd.turnsWithoutAccountability ?? 0;
        if (pos === 'leader' || pos === 'elite') return pick([
          `The system works for those who understand how to use it. That's not injustice — that's how arrangements have always worked. Those with the competence to occupy positions of consequence will inevitably shape outcomes in their favor.`,
          `Accountability is a function of institutional capacity. When institutions are strong, consequences follow. When they're weaker, the gap between action and consequence widens. That's a governance problem, not a moral one.`,
          `I take legitimacy concerns seriously. Visible accountability matters. But not every accusation of impunity is well-founded — sometimes it reflects frustration with decisions people disagree with, not actual lack of consequence.`,
        ]);
        if (level > 70 || turnsNoAcc > 10) return pick([
          `Nobody's been held accountable in a long time. After a while, people start to notice that they can do anything. And then — gradually — they do.`,
          `Impunity compounds. The first time someone powerful faces no consequence, it's an exception. By the tenth time, it's a precedent. By the twentieth, it's the operating rule.`,
          `We keep waiting for someone to face consequences. They never do. I stopped thinking that's accidental. A system that consistently fails to hold the powerful accountable is producing exactly the outcome it was designed to produce.`,
        ]);
        if (level > 40 || turnsNoAcc > 5) return pick([
          `The problem with unchecked power isn't just the immediate harm — it's that it teaches everyone watching what the real rules are. People adjust their behavior accordingly.`,
          `I've watched a pattern here: the more power gets concentrated without consequence, the faster it concentrates further. There's no natural stopping point.`,
          `What do I think? I think people in power without accountability tend to use that power in ways that further insulate them from accountability. It's a self-reinforcing cycle.`,
        ]);
        return pick([
          `Accountability makes people behave differently when they know there are real consequences. The question is whether those mechanisms are intact enough to actually function.`,
          `There are checks on power here, though I wouldn't call them perfectly reliable. They've held so far. Whether they hold under increasing pressure is the open question.`,
          `I notice who faces consequences and who doesn't. I try not to draw too many conclusions from isolated examples. But patterns, over time, tell a story.`,
        ]);
      }

      case 'facilitation': {
        const fs  = civ.state?.facilitationState ?? {};
        const active = fs.activeMeasures?.length ?? 0;
        const cg  = civ.state?.culturalGap ?? {};
        const cyn = cg.cynicismLevel ?? 0;
        const eh  = civ.state?.epistemicHealth ?? 50;
        // If media campaign running in low-EH environment — cynicism about it
        const hasMediaCampaign = (fs.activeMeasures ?? []).some(m => m.measureId === 'media_messaging_campaign');
        if (hasMediaCampaign && eh < 35) return pick([
          `I've seen these "educational campaigns" before. You can dress it up any way you want. It's still messaging. The question is always: who's funding it, and what do they need me to believe?`,
          `Who's behind the outreach? Ask that first. Then listen to what they're saying. Those two things together usually tell you more than the content alone.`,
          `The message is fine. I'm just less sure who benefits from me believing it. That uncertainty — which the campaign can't remove — is doing the work the campaign was trying to do in reverse.`,
        ]);
        if (active > 0 && cyn < 50) return pick([
          `The workshops actually helped me understand what was changing and why. I hadn't thought about it that way before — not the abstract principle, but what it actually looks like in practice.`,
          `I was skeptical at first. But seeing it work in our neighborhood shifted something for me. It's one thing to hear about cooperation as a principle. Another to see it produce something real.`,
          `It's not just talk — they showed us what it looks like in practice. What it costs, what it requires, what you get. That's more useful than a general statement about why things should be different.`,
        ]);
        if (active > 0 && cyn > 60) return pick([
          `I know what a facilitation program is supposed to do. Whether it's doing that here — or serving some other function — I can't always tell from the inside.`,
          `I've sat through workshops like this before. They're not useless. But they work best when the structural conditions already support what they're teaching. Otherwise you're helping people adjust to something that still punishes the adjustment.`,
          `I appreciate the effort. What I notice is that the most effective programs are the ones that don't just tell you what to think — they show you what happens when people act differently. The ones that can't do that have a harder time.`,
        ]);
        return pick([
          `I think of training and forums as multipliers — they work when structural conditions support what they're teaching. They don't substitute for those conditions.`,
          `These programs can help people understand what a shift means for their daily lives. That's a real contribution. But they work better after conditions change than before.`,
          `I'd welcome it, honestly. Most people don't resist change because they prefer the old way. They resist because they don't see how the new way applies to them specifically.`,
        ]);
      }

      case 'coop_outcomes': {
        const co  = civ.state?.cooperativeOutcomes ?? {};
        const fb  = co.feedback ?? 'neutral';
        const score = co.coopOutcomeScore ?? 50;
        if (pos === 'leader' || pos === 'elite') return pick([
          `Cooperation works when it's structured correctly — when incentives align and people can trust that others will follow through. The hard part is creating those conditions, not announcing that cooperation is valuable.`,
          `The research on cooperative systems is fairly clear: they produce better aggregate outcomes in conditions of reasonable equality and institutional reliability. Whether this society meets those conditions is a separate question.`,
          `I believe in cooperation — for what it's worth. What I find harder to sustain is the belief that cooperation can survive indefinitely when economic conditions consistently reward extraction instead.`,
        ]);
        if (fb === 'reinforcing' || score > 65) return pick([
          `When cooperation actually pays off — when the people who help each other come out ahead — it's easier to cooperate next time. It becomes the thing you do because it works, not just because it's right.`,
          `I've seen what happens when cooperative behavior actually produces better outcomes. People notice. They tell others. It compounds. That's the only way it really takes hold — not from the top down, but from people seeing it work.`,
          `There's a point where cooperation stops being a sacrifice and becomes the obvious move. We're not far from that here. You can feel the shift — people are trusting each other slightly more, expecting slightly better from each other.`,
        ]);
        if (fb === 'weakening' || score < 35) return pick([
          `I cooperate when I can. But I've watched cooperative effort produce better outcomes for a small group while the people who did the cooperating got little in return. That pattern is hard to sustain. People notice.`,
          `Cooperation weakens when the system doesn't reward it. Not because people are selfish — because they're rational. If helping each other doesn't actually help each other, you stop. You don't even decide to — it just happens.`,
          `The cynical take is that cooperation is a story told to people who benefit least from it. I don't fully believe that. But I understand why people do, when their experience of cooperation is that it mostly benefits someone else.`,
        ]);
        return pick([
          `Cooperation has value when both sides believe it will be reciprocated. That belief is more robust than most people think — and more fragile than it appears once it starts eroding.`,
          `I cooperate out of genuine preference, not calculation. But I'm aware that preference is easier to maintain when the system doesn't punish it. When it does, things get more complicated.`,
          `Whether cooperation pays off depends on the economic and institutional context. In some arrangements, it's the dominant strategy. In others, it's not. Which one applies here is what I watch.`,
        ]);
      }

      case 'civ_contagion': {
        // Pass 9: cross-civilization behavioral contagion
        const cs        = civ.state?.contagionState ?? {};
        const recv      = cs.receivedInfluences ?? [];
        const sourceName = recv.length > 0 ? (recv[recv.length - 1].sourceCivName ?? 'a neighbor') : 'neighboring civilizations';
        const coopDriftPos = (civ.state?.contagionState?.contagionHistory ?? []).slice(-5).some(h => (h.netCoopDelta ?? 0) > 0.001);
        const cynDriftIn   = (civ.state?.contagionState?.contagionHistory ?? []).slice(-5).some(h => (h.netCynicismDelta ?? 0) > 0.001);
        if (pos === 'leader' || pos === 'elite') return pick([
          `Trade routes are not neutral. When goods cross borders, so do habits, expectations, and ways of thinking. Whether the norms arriving from ${sourceName} are ones we'd choose to absorb is worth considering deliberately.`,
          `Cultural influence works both ways. We export norms as much as we import them. The question is whether we are shaping the exchange, or simply being shaped by whoever trades most with us.`,
          `The concern isn't that ideas travel. Ideas have always traveled. The concern is velocity — how quickly norms from ${sourceName} can displace our own before we've had time to evaluate what we're losing.`,
        ]);
        if (coopDriftPos) return pick([
          `Something has been shifting. The way people talk to each other, the expectations they carry into everyday arrangements — there's a cooperative tone that wasn't quite there before. Whether it came from within or drifted in from ${sourceName}, I'm not sure it matters. It feels real.`,
          `Norms travel. Cooperation that works somewhere else becomes imaginable here. I've noticed a different kind of optimism lately — less about winning personally and more about whether we can build something that holds for everyone.`,
          `When you see the same patterns working in a neighboring civilization, it gives people permission to believe it might work here too. That's not trivial. Permission to imagine something better is where most change starts.`,
        ]);
        if (cynDriftIn) return pick([
          `Cynicism is catching. When people see what's happening in ${sourceName} — the corruption, the collapse of trust — they start wondering whether it's coming here next. That worry, once it arrives, starts shaping behavior before the actual conditions do.`,
          `Trade brings more than goods. I've noticed more resignation lately — a sense that the gap between what's promised and what happens is just the natural order. I wonder how much of that we absorbed rather than earned.`,
          `Disillusionment crosses borders without papers. The cynicism that took a generation to develop somewhere else can arrive here fully formed through people's stories about what they witnessed.`,
        ]);
        return pick([
          `Norms spread. That's not new — it's how cultures have always influenced each other. What's different now is the density of contact. When you trade heavily, you don't just exchange goods; you exchange what you believe is normal.`,
          `I think about the ways we've been shaped by contact with others — some of it welcome, some of it not. It's not something you can fully control, but you can be deliberate about which connections you deepen.`,
          `Cultural diffusion is a force like any other. It can pull you toward better arrangements or worse ones depending on who your neighbors are and how strong your own norms are.`,
        ]);
      }

      case 'cultural_homogeneity': {
        // Pass 9: cultural homogeneity/heterogeneity
        const homo = Math.round(civ.state?.culturalHomogeneity?.value ?? 50);
        if (homo > 70) {
          if (pos === 'leader' || pos === 'elite') return pick([
            `A unified culture has real strengths — coordination, shared purpose, predictability. What we sometimes call conformity is also what makes it possible to build things that require everyone to pull in the same direction.`,
            `The danger of monoculture isn't that it exists — it's that it becomes invisible. When everyone assumes the same frame, no one notices it's a frame. Dissent becomes not just uncomfortable but literally unthinkable.`,
            `There's a resilience question here. Highly uniform cultures can mobilize efficiently but adapt poorly to unexpected conditions. We may want to be careful not to mistake cultural cohesion for cultural strength.`,
          ]);
          return pick([
            `There's one way of doing things here, and mostly people don't question it. That's fine when the one way is working. It gets uncomfortable when you start noticing that 'the normal way' was never really chosen — it was inherited.`,
            `When everyone thinks the same way, it feels like agreement. Sometimes it is. Sometimes it's just that nobody's saying the quiet part out loud because the costs of saying it are too high.`,
            `I don't mind a shared culture. I mind when 'shared' means 'there's no room for anything else.' There's a difference between unity and uniformity, and I feel like we've crossed that line somewhere.`,
          ]);
        }
        if (homo < 30) {
          if (pos === 'leader' || pos === 'elite') return pick([
            `A heterogeneous society is harder to govern — that's just true. You're always mediating between frameworks that don't share assumptions. But the ideas that emerge from that friction are often the ones that actually solve hard problems.`,
            `The advantage of cultural diversity isn't just tolerance — it's epistemic. Different ways of seeing the same problem catch errors that a single framework misses. That's worth the friction.`,
            `Building consensus in a pluralistic society is slow. But consensus built that way is also more durable — it survived the argument, which means it's tested in ways that top-down unity never is.`,
          ]);
          return pick([
            `It can be hard to find agreement here — everyone's coming from somewhere different. But I've also found that the places where different backgrounds rub up against each other are where the most interesting things get made.`,
            `I grew up somewhere different from most people here. That's not unusual. What I notice is that when you bring together people who've experienced different things, the conversations that happen aren't comfortable — but they're honest.`,
            `There's something exhausting about navigating a society where almost nothing is assumed to be shared. But there's also something freeing about it — you can actually question the fundamentals without being told you're attacking the community.`,
          ]);
        }
        // Moderate homogeneity (30–70)
        return pick([
          `We have enough in common to coordinate, and enough difference to stay curious about each other. I'm not sure how deliberate that balance was, but it's one worth maintaining.`,
          `There are subcultures here that don't agree on much — but they've found ways to coexist. Not always peacefully, but sustainably. That's not nothing.`,
          `A mix of backgrounds and assumptions is what most societies look like in practice, even when they tell a story of cultural unity. Ours is more honest about the mix, which I think is better.`,
        ]);
      }

      case 'auth_world_govt': {
        // Authoritarian world government — conquest or demagogy pathways
        const govModel = civ.governance?.model;
        const isWG     = govModel === 'authoritarian_world_government';
        const coopLow  = (b.cooperation ?? 50) < 35;

        if (pos === 'leader' || pos === 'elite') return pick([
          `Order requires scale. Fragmented nations could not solve climate, could not coordinate against catastrophe, could not prevent the wars that came from competition between powers. What you call domination, I call the only thing that worked.`,
          `The old world had a word for this: empire. But empires failed because they were incomplete. There was always a border, always a rival, always an outside. There is no outside now. That changes the logic entirely.`,
          `Unity was not free. It required decisive action at a moment when most people were still arguing about whether it was necessary. History will judge whether that was a crime or a rescue. We do not have the luxury of waiting for the verdict.`,
          `The resistance to central authority always came from those who benefited from the fragmentation — the ones who profited from borders, from competition, from the ability to play systems off each other. Remove the fragmentation, and you remove their leverage.`,
        ]);

        if (coopLow) return pick([
          `I do what I'm told. Everyone does. That's not cynicism — it's just accurate. The ones who didn't figure that out early enough are not around to tell you about it.`,
          `You ask what I think. I've learned that what I think isn't especially relevant. You adapt to the world as it is, not as you'd prefer it to be.`,
          `There used to be places you could go to escape a government you disagreed with. Now there's nowhere to go. I don't know if that's the point or just a consequence, but it changes how you hold opinions.`,
        ]);

        if (pos === 'marginalized') return pick([
          `My grandparents remembered when there were other countries. When the news had different governments doing different things. That sounds strange to me — almost like a fairy tale. Multiple centers of power that checked each other. I can't imagine what that felt like from the inside.`,
          `Resistance isn't gone. It just doesn't have a state behind it anymore. That makes it something different — something smaller, more personal. Whether that's more honest or just less effective, I'm not sure.`,
          `The thing about having no alternative is that you stop imagining one. It's not oppression exactly — it's more like the absence of a certain kind of thought. You don't rebel against weather.`,
        ]);

        return pick([
          `${isWG ? 'This civilization is' : 'The world is'} unified in a way no previous generation experienced. What that means for the people inside it — whether it's stability or stagnation — probably depends on who you ask and where they sit.`,
          `I grew up under one system, one set of rules, one version of history. I have no way to compare it to anything else. Maybe that's by design. Maybe it's just the way things are now.`,
          `The argument was always that unified governance would eliminate the wars between nations. It did. Whether what replaced those wars is better or worse is a more complicated question.`,
          `Order has costs. The costs are not distributed equally. The people who bear the costs rarely chose this arrangement; the people who benefit from it usually did. That's not unique to this system, but this system has no external pressure to correct it.`,
        ]);
      }

      // ── Environment ────────────────────────────────────────────
      case 'environment': {
        const forests = civ.resources?.forests ?? civ.state?.forests ?? 50;
        const pollution = civ.state?.pollutionIndex ?? 0;
        const biodiv = civ.state?.biodiversityIndex ?? 50;
        const water = civ.resources?.water ?? 50;
        const soil = civ.resources?.soil ?? 50;
        const envPool = [];
        if (pollution > 60) {
          envPool.push(
            `The air isn't what it was. People cough more. The river has a color it shouldn't have. Everyone notices it. Not everyone admits what's causing it.`,
            `We've traded clean water and clean air for production. Whether that trade was worth it depends on whether you're the one drinking the water.`,
          );
        } else if (pollution < 20) {
          envPool.push(
            `The land here is still healthy. The water runs clear. I think we've been careful — or lucky. Maybe both.`,
          );
        }
        if (forests < 30) {
          envPool.push(
            `The forests are mostly gone now. My grandparents talked about woods that went on for days. I've never seen that. Just stumps and scrub.`,
            `Without the trees, the rains don't come the way they used to. The soil dries out faster. Everything is connected — you take one piece away and the rest shifts.`,
          );
        }
        if (biodiv < 30) {
          envPool.push(
            `There are creatures my parents remember that I've never seen. The variety of life is thinner than it was. The elders say the land feels emptier.`,
          );
        }
        if (water < 30) {
          envPool.push(
            `Water is the thing everyone worries about. The wells are lower. The river is thinner. Arguments about water are becoming arguments about survival.`,
          );
        }
        if (soil < 30) {
          envPool.push(
            `The soil doesn't give back what it used to. We plant more and harvest less. The land is tired. I don't know how to make it less tired.`,
          );
        }
        if (pos === 'scholar') {
          envPool.push(
            `Environmental degradation is measurable. The question is never whether it's happening — it's whether the costs are borne by the people making the decisions. Usually they aren't. That's the structural problem.`,
          );
        }
        if (envPool.length === 0) {
          envPool.push(
            `The land provides for us. Whether it will keep providing depends on how we treat it. That much I know.`,
            `I pay attention to the seasons, the water, the soil. They tell you things if you listen. Not everyone listens.`,
          );
        }
        return maybeAddReligion(pick(envPool, true));
      }

      // ── Climate ─────────────────────────────────────────────────
      case 'climate': {
        const tempAnomaly = civ.state?.globalTemperatureAnomaly ?? civ.state?.temperatureAnomaly ?? 0;
        const climPool = [];
        if (techLevel <= 4) {
          climPool.push(
            `The seasons are what they are. Some years the rains come; some years they don't. We prepare for both and hope.`,
            `When the floods come or the drought persists, we endure. That is what our people have always done.`,
          );
        } else if (tempAnomaly > 2) {
          climPool.push(
            `The weather has changed. Not in the way weather always changes — in a direction. It's hotter. The storms are worse. The old patterns that people relied on don't hold anymore.`,
            `I've lived through more extreme weather in the last decade than my grandparents saw in their entire lives. That's not normal variation. Something fundamental has shifted.`,
            `The floods are worse. The droughts are longer. The fires burn hotter. People who study these things say it's connected to what we've put in the air. I believe them because I can see the results.`,
          );
          if (pos === 'scholar') climPool.push(
            `The data is unambiguous. Temperature trends, extreme event frequency, ice loss — these are measured, not speculated. The debate is about response, not reality.`,
          );
        } else if (tempAnomaly > 0.5) {
          climPool.push(
            `The weather seems less predictable than it used to be. Farmers notice it. Fishers notice it. The patterns our grandparents relied on aren't as reliable.`,
          );
        } else {
          climPool.push(
            `The climate is what it is. We live within it. Seasons come and go. We adapt.`,
          );
        }
        return maybeAddReligion(pick(climPool, true));
      }

      // ── Pandemic ────────────────────────────────────────────────
      case 'pandemic': {
        const hasPandemic = civ.history?.some(h => h.type === 'pandemic' && Math.abs((gameYear || 0) - h.year) < 100);
        const panPool = [];
        if (hasPandemic) {
          panPool.push(
            `The sickness changed everything. Not just the dying — the fear, the isolation, the way it broke trust between people who used to stand shoulder to shoulder.`,
            `We lost people. More than the numbers say, because the numbers don't count the ones who survived with something missing. The community is still recovering.`,
          );
          if (pos === 'leader') panPool.push(
            `Managing a pandemic is managing panic and logistics simultaneously. The disease does the damage; the response determines how much of that damage is permanent.`,
          );
        } else {
          if (techLevel <= 4) {
            panPool.push(
              `Plague comes when it comes. We pray, we isolate the sick, we burn what must be burned. There is little else to do but endure.`,
              `The elders remember the last great sickness. They don't speak of it willingly. What I know is that whole families disappeared and the village was never the same after.`,
            );
          } else {
            panPool.push(
              `Disease is always a risk. How well we respond depends on our institutions, our trust in each other, and whether we've prepared. Preparation is the thing most societies neglect until it's too late.`,
              `A pandemic tests everything — state capacity, social trust, the willingness to sacrifice for strangers. The disease is the exam; the society is what's being tested.`,
            );
          }
        }
        return maybeAddReligion(pick(panPool, true));
      }

      // ── Civil War ───────────────────────────────────────────────
      case 'civil_war': {
        const hasCivilWar = civ.history?.some(h => h.type === 'civil_war' && Math.abs((gameYear || 0) - h.year) < 200);
        const cwPool = [];
        if (hasCivilWar) {
          cwPool.push(
            `We fought ourselves. That's the part outsiders don't understand — it wasn't strangers doing this. It was neighbors. People who shared meals. The wounds from that don't heal the way war wounds do.`,
            `The civil war divided families. Not along neat ideological lines — along old grievances, local loyalties, accumulated resentments. Ideology was the match. The fuel was already there.`,
          );
          if (pos === 'marginalized') cwPool.push(
            `When the fighting started, people like me suffered first and most. We always do. The powerful fight over power; the powerless absorb the cost.`,
          );
        } else {
          cwPool.push(
            `Internal conflict is the thing that terrifies me most. An external enemy unites people. Fighting each other — that destroys something that can't easily be rebuilt.`,
            `Every society has tensions. The question is whether those tensions have a political outlet or whether they build until they crack the structure. That's the difference between disagreement and civil war.`,
          );
          if (pos === 'scholar') cwPool.push(
            `Civil wars correlate with weak institutions, ethnic exclusion, inequality, and anocracy — systems that are neither fully open nor fully closed. The research is quite clear on the risk factors.`,
          );
        }
        return maybeAddReligion(pick(cwPool, true));
      }

      // ── Nuclear Threat ──────────────────────────────────────────
      case 'nuclear': {
        const hasNuclear = civ.history?.some(h => h.type === 'nuclear_war');
        const nukePool = [];
        if (hasNuclear) {
          nukePool.push(
            `I don't have words for it. No one does. What happened — it wasn't war. War implies some kind of exchange. This was just ending.`,
            `The ones who didn't survive were the lucky ones. That's a terrible thing to say. It's also what most of us think.`,
            `Everything before it feels like it happened to different people in a different world. Because it did.`,
          );
        } else if (techLevel >= 8) {
          nukePool.push(
            `The weapons exist. That's the fact that sits underneath everything else. Every other political question happens in the shadow of that one. We've learned to not think about it. That's not the same as it being safe.`,
            `Mutually assured destruction only works as long as everyone involved is rational, well-informed, and in stable control of their arsenal. History suggests those conditions are not permanent.`,
          );
        } else {
          nukePool.push(
            `I don't understand what you're describing. A weapon that can destroy a whole city in one flash? That sounds like something from a myth about the gods' wrath.`,
          );
        }
        return pick(nukePool, true);
      }

      // ── Disinformation ──────────────────────────────────────────
      case 'disinformation': {
        const eh = civ.state?.epistemicHealth ?? civ.state?.epistemic_health ?? 50;
        const disPool = [];
        if (techLevel >= 7 && eh < 40) {
          disPool.push(
            `I don't know what's true anymore. Everyone has a version of events. The louder someone shouts, the less I trust them — but the quiet sources are harder to find.`,
            `There are people whose job it is to make you believe things that aren't true. They're very good at it. Better than the people trying to tell you the truth, usually, because truth is complicated and lies are simple.`,
            `The information environment is poisoned. Not accidentally — deliberately. Someone benefits from confusion. Confused people don't organize. They don't trust each other. They don't act.`,
          );
          if (pos === 'scholar') disPool.push(
            `Epistemic health — the collective capacity to distinguish truth from falsehood — is measurable and it's declining. The institutions that once served as filters are under attack, often by the very people who benefit from removing them.`,
          );
        } else if (techLevel >= 7) {
          disPool.push(
            `There's more information available than any person can process. Learning to sort it — that's the skill of this era. Schools that teach it are the ones making the real difference.`,
            `Propaganda has always existed. What's new is the speed and the scale. A lie can go around the world before the truth gets its boots on, as they say.`,
          );
        } else {
          disPool.push(
            `Rumors have always been a problem. Someone says the neighboring village did something, and by the time the story reaches us, it's been changed three times. You learn to wait before you believe.`,
          );
        }
        return pick(disPool, true);
      }

      // ── AI / Automation ─────────────────────────────────────────
      case 'ai_disruption': {
        const techUnemp = civ.state?.techUnemployment ?? 0;
        const aiPool = [];
        if (techLevel >= 9) {
          if (techUnemp > 30) {
            aiPool.push(
              `The machines do what I used to do. Faster, cheaper, without rest. I'm not angry at the machines. I'm angry at the people who decided my skills were disposable.`,
              `They said automation would free us. Free us from what? From having a purpose? From being needed? I'd like to be needed again.`,
            );
          }
          aiPool.push(
            `The technology is extraordinary. What it can do — I couldn't have imagined it. Whether what it does is being directed toward human good or just toward profit — that's the question nobody in charge seems interested in answering.`,
            `Machines that think — or seem to — change what it means to be a person who thinks. That's not just an economic question. It's an existential one.`,
          );
          if (pos === 'scholar') aiPool.push(
            `Artificial intelligence is a dual-use technology in the deepest sense. It amplifies whatever intent it's given. The intent, not the technology, determines the outcome. Governance of intent is the real challenge.`,
          );
        } else if (techLevel >= 7) {
          aiPool.push(
            `The new machines change what labor means. Some jobs disappear; others appear. The transition is never painless. The people displaced are not the same people who benefit from what comes next.`,
          );
        } else {
          aiPool.push(
            `I don't know what you mean by machines that think. Tools serve the hand that holds them. That's all I know about tools.`,
          );
        }
        return pick(aiPool, true);
      }

      // ── Trade Networks / Globalization ──────────────────────────
      case 'trade': {
        const tradePool = [];
        if (techLevel >= 7) {
          tradePool.push(
            `We're connected to places I'll never visit. What happens in a market across the world changes the price of what I sell here. That's either a miracle or a vulnerability, depending on the day.`,
            `Global trade made things cheaper and choices wider. It also made us dependent on supply chains that break when anything goes wrong anywhere. We discovered that recently.`,
          );
          if (pos === 'elite') tradePool.push(
            `Trade is leverage. The networks determine who has options and who doesn't. Sanctions, embargoes, tariffs — these are weapons that don't require armies. They require market position.`,
          );
        } else {
          tradePool.push(
            `Trade brings things we can't make ourselves. Spices, metals, fabrics. The traders bring news too — sometimes that's more valuable than the goods.`,
            `The trade routes connect us to the wider world. When they're disrupted — by bandits, by war, by bad weather — we feel it immediately. Prices rise. Supplies thin. People get anxious.`,
          );
        }
        if (pos === 'scholar') tradePool.push(
          `Trade networks are the circulatory system of civilization. They distribute resources, but they also distribute vulnerability. A crisis in one node propagates through the entire system.`,
        );
        return pick(tradePool, true);
      }

      // ── Urban-Rural Divide ──────────────────────────────────────
      case 'urban_rural': {
        const urban = civ.state?.urbanizationRate ?? civ.state?.urbanization ?? 20;
        const urPool = [];
        if (urban > 60) {
          urPool.push(
            `The cities get everything — the investment, the attention, the opportunities. Out here, the roads decay, the schools close, the young people leave. What's left is the people who couldn't leave or wouldn't.`,
            `There are two versions of this civilization. The one in the cities, where things are modern and connected and fast. And the one out here, where time moves differently and nobody from the capital asks what we need.`,
          );
          if (pos === 'laborer') urPool.push(
            `I moved to the city because there was nothing left in my village. The city doesn't want me much either, but at least there's work. Bad work. But work.`,
          );
          if (pos === 'scholar') urPool.push(
            `The urban-rural divide is a political fault line in every society that urbanizes rapidly. The grievances are real — unequal investment, cultural dismissal, economic abandonment. The political consequences are predictable and documented.`,
          );
        } else {
          urPool.push(
            `Most of us live in villages or small settlements. The city is where the rulers are, where the temples are. It's a different world from ours, but we feed it.`,
            `I've been to the city once. It was loud and crowded and exciting. But I came home. The land here knows me and I know it.`,
          );
        }
        return maybeAddReligion(pick(urPool, true));
      }

      case 'general': {
        // Use I18N-aware deflections so the NPC gracefully admits
        // they don't have a response rather than giving a disconnected answer.
        const posDeflections = (typeof I18N !== 'undefined')
          ? I18N.deflectionsByPosition(npc.socialPosition)
          : null;
        const genericDeflections = (typeof I18N !== 'undefined')
          ? I18N.deflections()
          : [
              "I'm not sure I know how to answer that.",
              "I've never given that much thought, honestly.",
              "That's not something I think about much day to day.",
              "I wouldn't know where to start with a question like that.",
              "You'd be better off asking someone else that one.",
              "Hmm. I just don't know.",
            ];

        // 40% chance of position-specific deflection when available
        const usePositionSpecific = posDeflections && Math.random() < 0.40;
        const pool = usePositionSpecific ? posDeflections : genericDeflections;
        return Utils.randChoice(pool);
      }
    }
  },

  // Generate suggested questions for a category
  getSuggestedQuestions(categoryId) {
    // Check I18N for translated questions first
    if (typeof I18N !== 'undefined') {
      const translated = I18N.suggestedQuestions(categoryId);
      if (translated) return translated;
    }

    const questions = {
      daily_life: [
        'What does a typical day look like for you?',
        'What do you spend most of your time doing?',
        'What brings you satisfaction in daily life?',
        'What is most challenging about day-to-day living?',
      ],
      economy: [
        'How do you meet your basic needs?',
        'What does work mean to you?',
        'Do you feel your contribution is fairly recognized?',
        'What would a fairer economic arrangement look like to you?',
      ],
      governance: [
        'How are decisions made in your community?',
        'Do you feel you have a voice in how things are run?',
        'What do you think of the people in leadership positions?',
        'What would you change about how your community is governed?',
      ],
      religion: [
        'What role does faith or spirituality play in your life?',
        'How does religion shape your community?',
        'Do you have doubts about the beliefs you were raised with?',
        'How do people here relate to those of different faiths?',
      ],
      community: [
        'How do people here treat one another?',
        'When someone is struggling, what typically happens?',
        'Do you feel you belong here?',
        'What holds this community together?',
      ],
      wellbeing: [
        'Are you generally happy with your life?',
        'What would make your life significantly better?',
        'What do you have that you\'re grateful for?',
        'What worries you most?',
      ],
      change: [
        'What would you most like to see change?',
        'Is meaningful change possible here?',
        'What has changed in your lifetime?',
        'What do you hope for the next generation?',
      ],
      power: [
        'Do you feel you have power over your own life?',
        'Who holds the most power in your community?',
        'Have you ever tried to change something and found you couldn\'t?',
        'What would it take for people like you to have more say?',
      ],
      challenges: [
        'What are the biggest challenges facing your society right now?',
        'What do you think are the most important problems of your time?',
        'What threatens this community most?',
        'What does your generation struggle with that those before you didn\'t?',
      ],
      personal: [
        'Are you married or do you have a partner?',
        'Do you have children?',
        'How is your health?',
        'What has your life been like up until now?',
      ],
    };
    return questions[categoryId] || questions.daily_life;
  },

  // Generate opening description of an NPC
  getNPCIntroduction(npc, civ) {
    const era = Utils.getEra(civ.foundingYear);
    const pos = {
      leader:       'one of the people in a position of authority',
      elite:        'among the more privileged members of this community',
      professional: 'someone with a skilled role in the community',
      laborer:      'an ordinary working member of this community',
      marginalized: 'someone living on the margins of this society',
    }[npc.socialPosition] || 'a member of this community';

    return `You\'re speaking with ${npc.name}, a ${npc.age}-year-old ${npc.gender} — ${pos} in ${civ.name}. ` +
      (npc.religiousAffiliation ? `They practice ${npc.religiousAffiliation}. ` : '') +
      `Their life has been shaped by this ${era.label} civilization.`;
  },
};
