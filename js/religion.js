// ============================================================
// religion.js - Religion system and dynamics
// ============================================================

class Religion {
  constructor(options = {}) {
    this.id = Utils.uid();
    this.name = options.name || 'Unnamed Faith';
    this.description = options.description || '';
    this.coreBeliefs = options.coreBeliefs || [];
    this.propagationStyle = options.propagationStyle || 'passive';
    this.toleranceLevel = options.toleranceLevel || 'indifferent';
    this.hierarchyType = options.hierarchyType || 'none'; // 'none' | 'priestly' | 'centralized' | 'congregational'
    this.stateAlignment = options.stateAlignment || 'separate'; // 'separate' | 'influential' | 'intertwined' | 'dominant'
    this.economicAttitude = options.economicAttitude || 'neutral'; // 'endorsing' | 'neutral' | 'critical'
    this.dominant = options.dominant || false;

    // Population metrics (within a civilization)
    this.adherentPercentage = options.adherentPercentage || 50;
    this.fervorLevel = options.fervorLevel || 50; // average fervor among adherents

    // Internal state
    this.spreadRate = this._computeSpreadRate();
    this.socialInfluence = this._computeSocialInfluence();
  }

  _computeSpreadRate() {
    const rates = { passive: 0.5, communal: 1.5, missionary: 4, aggressive: 7, coercive: 10 };
    return rates[this.propagationStyle] || 1;
  }

  _computeSocialInfluence() {
    let influence = 30;
    if (this.hierarchyType === 'centralized') influence += 20;
    if (this.stateAlignment === 'dominant' || this.stateAlignment === 'intertwined') influence += 30;
    if (this.economicAttitude === 'endorsing') influence += 10;
    if (this.toleranceLevel === 'persecutory') influence += 15; // fear as influence
    return Utils.clamp(influence, 10, 100);
  }

  // ── Behavior Modifiers from this religion ─────────────────────
  getBehaviorModifiers() {
    const mods = {};
    const prop = this.propagationStyle;
    const tol = this.toleranceLevel;

    // Coercive / aggressive religions suppress empathy and innovation
    if (prop === 'coercive') {
      mods.conformity = +25;
      mods.deference = +20;
      mods.empathy = -10;
      mods.innovation = -15;
    } else if (prop === 'aggressive') {
      mods.conformity = +15;
      mods.competition = +10;
      mods.deference = +10;
    } else if (prop === 'missionary') {
      mods.conformity = +5;
      mods.cooperation = +5;
    } else if (prop === 'communal') {
      mods.mutualAid = +10;
      mods.cooperation = +10;
    } else { // passive
      mods.individualism = +5;
    }

    // Tolerance
    if (tol === 'accepting') {
      mods.empathy = (mods.empathy || 0) + 10;
      mods.cooperation = (mods.cooperation || 0) + 5;
    } else if (tol === 'persecutory') {
      mods.empathy = (mods.empathy || 0) - 15;
      mods.conformity = (mods.conformity || 0) + 15;
    }

    // Theocratic + centralized hierarchy
    if (this.stateAlignment === 'dominant') {
      mods.deference = (mods.deference || 0) + 20;
      mods.innovation = (mods.innovation || 0) - 10;
    }

    // Pro-collectivism beliefs
    if (this.economicAttitude === 'critical') { // critical of accumulation
      mods.acquisitiveness = (mods.acquisitiveness || 0) - 15;
      mods.mutualAid = (mods.mutualAid || 0) + 10;
    } else if (this.economicAttitude === 'endorsing') {
      mods.acquisitiveness = (mods.acquisitiveness || 0) + 10;
    }

    return mods;
  }

  // ── Spread Mechanics ──────────────────────────────────────────
  processTurn(civ, otherReligions, yearsDelta) {
    const spreadFactor = this.spreadRate * (yearsDelta / 10) * 0.01;
    const suppressionFactor = this._computeSuppression(civ);

    // Spread toward state-aligned maximum
    let targetPercentage = this.dominant ? 70 : 30;

    if (civ.governance.modelId === 'theocratic' && this.stateAlignment === 'dominant') {
      targetPercentage = Math.min(95, targetPercentage + 30);
    }
    if (civ.operatingPrinciples.freedomLevel > 70) {
      // High freedom → pluralism → no religion dominates
      targetPercentage = Math.min(targetPercentage, 55);
    }

    this.adherentPercentage = Utils.clamp(
      Utils.lerp(this.adherentPercentage, targetPercentage, spreadFactor * (1 - suppressionFactor)),
      0, 98
    );

    // Fervor shifts
    if (civ.governance.modelId === 'theocratic') {
      this.fervorLevel = Utils.clamp(this.fervorLevel + 0.5, 0, 100);
    } else if (civ.operatingPrinciples.freedomLevel > 70) {
      this.fervorLevel = Utils.clamp(this.fervorLevel - 0.2, 0, 100);
    }
  }

  _computeSuppression(civ) {
    // High freedom + secular governance suppress religious dominance
    let suppression = 0;
    if (civ.operatingPrinciples.freedomLevel > 70) suppression += 0.3;
    if (civ.governance.modelId === 'flat_consensus') suppression += 0.2;
    if (civ.religion.stateRelationship === 'separate') suppression += 0.15;
    return Utils.clamp(suppression, 0, 0.8);
  }

  getSummary() {
    return {
      name: this.name,
      description: this.description,
      propagation: RELIGION_PROPAGATION[this.propagationStyle]?.label || this.propagationStyle,
      tolerance: RELIGION_TOLERANCE[this.toleranceLevel]?.label || this.toleranceLevel,
      adherents: Math.round(this.adherentPercentage),
      fervor: Math.round(this.fervorLevel),
      influence: Math.round(this.socialInfluence),
    };
  }
}

// ── Religion Manager ──────────────────────────────────────────
class ReligionManager {
  constructor(civ) {
    this.civ = civ;
    this.religions = [];
    this._initialize();
  }

  _initialize() {
    const presence = this.civ.religion.presence;

    if (presence === 'none') {
      this.religions = [];
      return;
    }

    if (presence === 'animist') {
      this.religions = [new Religion({
        name: 'Animist Tradition',
        description: 'Ancient beliefs in the spirits of nature and ancestors.',
        propagationStyle: 'passive',
        toleranceLevel: 'accepting',
        hierarchyType: 'none',
        stateAlignment: this.civ.religion.stateRelationship,
        economicAttitude: 'neutral',
        dominant: true,
        adherentPercentage: 80,
        fervorLevel: 40,
      })];
    }

    if (presence === 'dominant' || presence === 'theocratic') {
      // Use player-defined religions if available
      if (this.civ.religion.religions && this.civ.religion.religions.length > 0) {
        this.religions = this.civ.religion.religions.map((r, i) =>
          new Religion({ ...r, dominant: i === 0, adherentPercentage: i === 0 ? 75 : 15 })
        );
      } else {
        this.religions = [
          new Religion({
            name: 'The Primary Faith',
            description: 'The dominant religious tradition of this civilization.',
            propagationStyle: presence === 'theocratic' ? 'missionary' : 'communal',
            toleranceLevel: presence === 'theocratic' ? 'restrictive' : 'indifferent',
            hierarchyType: 'priestly',
            stateAlignment: presence === 'theocratic' ? 'dominant' : this.civ.religion.stateRelationship,
            dominant: true,
            adherentPercentage: 75,
            fervorLevel: 60,
          }),
          new Religion({
            name: 'Minority Tradition',
            description: 'A smaller faith practiced by some in this civilization.',
            propagationStyle: 'passive',
            toleranceLevel: 'accepting',
            dominant: false,
            adherentPercentage: 15,
            fervorLevel: 45,
          }),
        ];
      }
    }

    if (presence === 'plurality') {
      if (this.civ.religion.religions && this.civ.religion.religions.length > 0) {
        const total = this.civ.religion.religions.length;
        this.religions = this.civ.religion.religions.map((r, i) =>
          new Religion({ ...r, adherentPercentage: Math.floor(80 / total), dominant: false })
        );
      } else {
        this.religions = [
          new Religion({ name: 'Faith of the River', description: 'A nature-based tradition.', propagationStyle: 'passive', toleranceLevel: 'accepting', adherentPercentage: 30 }),
          new Religion({ name: 'The Old Way', description: 'Ancient ancestral practices.', propagationStyle: 'communal', toleranceLevel: 'accepting', adherentPercentage: 28 }),
          new Religion({ name: 'Seekers of Light', description: 'A philosophically-oriented faith.', propagationStyle: 'missionary', toleranceLevel: 'indifferent', adherentPercentage: 25 }),
        ];
      }
    }
  }

  processTurn(yearsDelta) {
    // Normalize percentages
    let total = this.religions.reduce((s, r) => s + r.adherentPercentage, 0);
    if (total > 100) {
      for (const r of this.religions) r.adherentPercentage = (r.adherentPercentage / total) * 95;
    }

    for (const religion of this.religions) {
      const others = this.religions.filter(r => r.id !== religion.id);
      religion.processTurn(this.civ, others, yearsDelta);
    }

    // Apply behavior modifiers to civilization
    this._applyReligiousBehaviors();
  }

  _applyReligiousBehaviors() {
    const civ = this.civ;
    // Weighted average of all religion behavior modifiers by adherent percentage
    const totalMods = {};
    for (const rel of this.religions) {
      const mods = rel.getBehaviorModifiers();
      const weight = rel.adherentPercentage / 100;
      for (const [k, v] of Object.entries(mods)) {
        totalMods[k] = (totalMods[k] || 0) + v * weight;
      }
    }

    const b = civ.state.behaviorReinforcement;
    for (const [k, v] of Object.entries(totalMods)) {
      if (k in b) {
        b[k] = Utils.clamp(b[k] + v * 0.05, 0, 100);
      }
    }
  }

  addReligion(religionConfig) {
    const newRel = new Religion(religionConfig);
    this.religions.push(newRel);
    this.civ.addHistoryEntry(0, `New Religion Emerged: ${newRel.name}`, newRel.description, 'religion');
    return newRel;
  }

  getReligiousTension() {
    if (this.religions.length < 2) return 0;
    let tension = 0;
    for (const r1 of this.religions) {
      for (const r2 of this.religions) {
        if (r1.id === r2.id) continue;
        if (r1.toleranceLevel === 'persecutory') tension += 20 * (r1.adherentPercentage / 100);
        if (r1.toleranceLevel === 'restrictive' && r2.adherentPercentage > 20) tension += 10;
        if (r1.propagationStyle === 'aggressive') tension += 5;
      }
    }
    return Utils.clamp(tension, 0, 100);
  }

  getSummary() {
    return {
      presence: this.civ.religion.presence,
      stateRelationship: this.civ.religion.stateRelationship,
      religions: this.religions.map(r => r.getSummary()),
      tension: this.getReligiousTension(),
    };
  }
}
