// ═══════════════════════════════════════════════════════════════
//  COUNTERFACTUAL ENGINE — snapshot, fork, compare trajectories
// ═══════════════════════════════════════════════════════════════

class CounterfactualEngine {
  constructor(game) {
    this.game = game;
    this.snapshots = [];       // saved snapshots: { id, label, year, turn, data }
    this.forks = [];           // completed forks: { id, snapshotId, label, modifications, trajectory }
    this._nextId = 1;
  }

  // ── Deep clone helpers ───────────────────────────────────────

  _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Map) {
      const m = new Map();
      for (const [k, v] of obj) m.set(k, this._deepClone(v));
      return m;
    }
    if (Array.isArray(obj)) return obj.map(item => this._deepClone(item));
    const clone = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'function') continue;
      clone[key] = this._deepClone(obj[key]);
    }
    return clone;
  }

  _cloneCivState(civ) {
    return {
      id: civ.id,
      name: civ.name,
      color: civ.color,
      isPlayerCiv: civ.isPlayerCiv,
      economic: this._deepClone(civ.economic),
      governance: this._deepClone(civ.governance),
      operatingPrinciples: this._deepClone(civ.operatingPrinciples),
      religion: this._deepClone(civ.religion),
      state: this._deepClone(civ.state),
      history: this._deepClone(civ.history),
      movements: this._deepClone(civ.movements),
      migration: this._deepClone(civ.migration),
      slavery: this._deepClone(civ.slavery),
      organizedCrime: this._deepClone(civ.organizedCrime),
      geography: this._deepClone(civ.geography),
    };
  }

  // ── Take Snapshot ────────────────────────────────────────────

  takeSnapshot(label) {
    const g = this.game;
    if (!g.simulation || !g.civilizations?.length) return null;

    const id = `snap_${this._nextId++}`;
    const snapshot = {
      id,
      label: label || `Turn ${g.turnCount} (${g.currentYear} AD)`,
      year: g.currentYear,
      turn: g.turnCount,
      yearsDelta: g.yearsDelta,
      takenAt: new Date().toISOString(),
      // Climate state
      climate: {
        warmingIndex: g.simulation.globalWarmingIndex || 0,
        atmosphericCO2: g.simulation.atmosphericCO2 || 0,
        surfaceTemp: g.simulation.surfaceTemp || 0,
        deepOceanTemp: g.simulation.deepOceanTemp || 0,
        tippingPermafrost: g.simulation._tippingPermafrost || false,
        tippingIceSheets: g.simulation._tippingIceSheets || false,
        tippingAMOC: g.simulation._tippingAMOC || false,
        tippingHothouse: g.simulation._tippingHothouse || false,
      },
      // Full civ states
      civilizations: g.civilizations.map(civ => this._cloneCivState(civ)),
      // Current trajectory data (for comparison baseline)
      trajectories: g.civilizations.map(civ => ({
        civId: civ.id,
        civName: civ.name,
        data: this._deepClone(civ.state?._trajectory || []),
      })),
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  // ── Fork from Snapshot ───────────────────────────────────────

  forkFromSnapshot(snapshotId, modifications, turnsToRun, label) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return { error: 'Snapshot not found' };

    const g = this.game;
    if (!g.simulation) return { error: 'No simulation active' };

    // Save current game state so we can restore after the fork run
    const savedState = this._saveCurrentState();

    // Restore from snapshot (unmodified) for baseline run
    this._restoreFromSnapshot(snapshot);

    // First: run unmodified baseline forward to capture what would happen without changes
    for (const civ of g.civilizations) {
      if (civ.state._trajectory) {
        civ.state._trajectory = civ.state._trajectory.filter(s => s.turn <= snapshot.turn);
      }
    }

    const maxYear = (typeof CONFIG !== 'undefined' ? CONFIG.MAX_YEAR : 3000);
    for (let i = 0; i < turnsToRun; i++) {
      if (g.currentYear + g.yearsDelta > maxYear) break;
      g.currentYear += g.yearsDelta;
      g.turnCount++;
      g.simulation.processTurn();
    }

    const baselineTrajectories = g.civilizations.map(civ => ({
      civId: civ.id,
      civName: civ.name,
      data: this._deepClone(civ.state?._trajectory || []),
    }));

    // Reset to snapshot for the modified fork run
    this._restoreFromSnapshot(snapshot);

    if (modifications) {
      this._applyModifications(modifications);
    }

    for (const civ of g.civilizations) {
      if (civ.state._trajectory) {
        civ.state._trajectory = civ.state._trajectory.filter(s => s.turn <= snapshot.turn);
      }
    }

    const turnsBefore = g.turnCount;
    for (let i = 0; i < turnsToRun; i++) {
      if (g.currentYear + g.yearsDelta > maxYear) break;
      g.currentYear += g.yearsDelta;
      g.turnCount++;
      g.simulation.processTurn();
    }

    // Capture forked trajectories
    const forkId = `fork_${this._nextId++}`;
    const forkedTrajectories = g.civilizations.map(civ => ({
      civId: civ.id,
      civName: civ.name,
      data: this._deepClone(civ.state?._trajectory || []),
    }));

    const fork = {
      id: forkId,
      snapshotId,
      label: label || `Fork from ${snapshot.label}`,
      modifications: this._deepClone(modifications),
      turnsRun: g.turnCount - turnsBefore,
      startYear: snapshot.year,
      endYear: g.currentYear,
      startTurn: snapshot.turn,
      endTurn: g.turnCount,
      trajectories: forkedTrajectories,
      baselineTrajectories,
      createdAt: new Date().toISOString(),
    };

    this.forks.push(fork);

    // Restore original game state
    this._restoreState(savedState);

    return fork;
  }

  // ── State Save/Restore (for fork isolation) ──────────────────

  _saveCurrentState() {
    const g = this.game;
    return {
      currentYear: g.currentYear,
      turnCount: g.turnCount,
      yearsDelta: g.yearsDelta,
      climate: {
        warmingIndex: g.simulation.globalWarmingIndex,
        atmosphericCO2: g.simulation.atmosphericCO2,
        surfaceTemp: g.simulation.surfaceTemp,
        deepOceanTemp: g.simulation.deepOceanTemp,
        tippingPermafrost: g.simulation._tippingPermafrost,
        tippingIceSheets: g.simulation._tippingIceSheets,
        tippingAMOC: g.simulation._tippingAMOC,
        tippingHothouse: g.simulation._tippingHothouse,
      },
      civilizations: g.civilizations.map(civ => this._cloneCivState(civ)),
    };
  }

  _restoreState(saved) {
    const g = this.game;
    g.currentYear = saved.currentYear;
    g.turnCount = saved.turnCount;
    g.yearsDelta = saved.yearsDelta;

    this._restoreClimate(saved.climate);
    this._restoreCivs(saved.civilizations);
  }

  _restoreFromSnapshot(snapshot) {
    const g = this.game;
    g.currentYear = snapshot.year;
    g.turnCount = snapshot.turn;
    g.yearsDelta = snapshot.yearsDelta;

    this._restoreClimate(snapshot.climate);
    this._restoreCivs(snapshot.civilizations);
  }

  _restoreClimate(climate) {
    const sim = this.game.simulation;
    sim.globalWarmingIndex = climate.warmingIndex;
    sim.atmosphericCO2 = climate.atmosphericCO2;
    sim.surfaceTemp = climate.surfaceTemp;
    sim.deepOceanTemp = climate.deepOceanTemp;
    sim._tippingPermafrost = climate.tippingPermafrost;
    sim._tippingIceSheets = climate.tippingIceSheets;
    sim._tippingAMOC = climate.tippingAMOC;
    sim._tippingHothouse = climate.tippingHothouse;
  }

  _restoreCivs(civDataArray) {
    const g = this.game;
    for (const civData of civDataArray) {
      const civ = g.civilizations.find(c => c.id === civData.id);
      if (!civ) continue;

      // Restore top-level objects — delete stale keys then assign
      for (const obj of ['economic', 'governance', 'religion']) {
        const cloned = this._deepClone(civData[obj]);
        for (const key of Object.keys(civ[obj])) {
          if (!(key in cloned)) delete civ[obj][key];
        }
        Object.assign(civ[obj], cloned);
      }
      civ.operatingPrinciples = this._deepClone(civData.operatingPrinciples);

      // Restore state — preserve object reference
      const clonedState = this._deepClone(civData.state);
      for (const key of Object.keys(civ.state)) {
        if (!(key in clonedState)) delete civ.state[key];
      }
      Object.assign(civ.state, clonedState);

      civ.history = this._deepClone(civData.history);
      civ.movements = this._deepClone(civData.movements);
      civ.migration = this._deepClone(civData.migration);
      civ.slavery = this._deepClone(civData.slavery);
      civ.organizedCrime = this._deepClone(civData.organizedCrime);
      civ.geography = this._deepClone(civData.geography);
    }
  }

  // ── Apply Modifications ──────────────────────────────────────

  _applyModifications(mods) {
    const g = this.game;

    // Per-civ modifications: { civId: { state: {...}, economic: {...}, governance: {...} } }
    if (mods.civModifications) {
      for (const [civId, civMods] of Object.entries(mods.civModifications)) {
        const civ = g.civilizations.find(c => c.id === civId);
        if (!civ) continue;

        if (civMods.state) {
          for (const [key, val] of Object.entries(civMods.state)) {
            civ.state[key] = val;
          }
        }
        if (civMods.economic) {
          for (const [key, val] of Object.entries(civMods.economic)) {
            civ.economic[key] = val;
          }
        }
        if (civMods.governance) {
          for (const [key, val] of Object.entries(civMods.governance)) {
            civ.governance[key] = val;
          }
        }
        if (civMods.behaviorReinforcement && civ.state.behaviorReinforcement) {
          for (const [key, val] of Object.entries(civMods.behaviorReinforcement)) {
            civ.state.behaviorReinforcement[key] = val;
          }
        }
      }
    }

    // Global modifications
    if (mods.climate) {
      const sim = g.simulation;
      if (mods.climate.warmingIndex !== undefined) sim.globalWarmingIndex = mods.climate.warmingIndex;
      if (mods.climate.atmosphericCO2 !== undefined) sim.atmosphericCO2 = mods.climate.atmosphericCO2;
    }
  }

  // ── Compare Trajectories ─────────────────────────────────────

  compareTrajectories(forkId, civId) {
    const fork = this.forks.find(f => f.id === forkId);
    if (!fork) return null;

    const snapshot = this.snapshots.find(s => s.id === fork.snapshotId);
    if (!snapshot) return null;

    // Use the fork's stored baseline trajectory (run without modifications)
    const civ = this.game.civilizations.find(c => c.id === civId);
    const baselineEntry = fork.baselineTrajectories?.find(t => t.civId === civId);
    const baselineData = baselineEntry?.data || civ?.state?._trajectory || [];

    // Get the forked trajectory
    const forkedEntry = fork.trajectories.find(t => t.civId === civId);
    const forkedData = forkedEntry?.data || [];

    if (baselineData.length === 0 && forkedData.length === 0) return null;

    // Build comparison series for key metrics
    const metrics = [
      'socialTrust', 'wealthConcentration', 'corruption', 'polarization',
      'freedomLevel', 'averageWellbeing', 'institutionalQuality',
      'epistemicHealth', 'stateCapacity', 'legitimacyLevel',
      'equalityIndex', 'socialMobility', 'population',
    ];

    const comparison = {};
    for (const metric of metrics) {
      const baselineSeries = baselineData
        .filter(s => s.turn >= fork.startTurn && s.turn <= fork.endTurn)
        .map(s => ({ x: s.year, y: s[metric] ?? 0 }));

      const forkedSeries = forkedData
        .filter(s => s.turn >= fork.startTurn)
        .map(s => ({ x: s.year, y: s[metric] ?? 0 }));

      // Divergence: absolute difference at each matching turn
      const divergence = [];
      const forkedByYear = new Map(forkedSeries.map(p => [p.x, p.y]));
      for (const bp of baselineSeries) {
        const fv = forkedByYear.get(bp.x);
        if (fv !== undefined) {
          divergence.push({ x: bp.x, y: Math.abs(bp.y - fv) });
        }
      }

      // Summary stats
      const endBaseline = baselineSeries[baselineSeries.length - 1]?.y ?? 0;
      const endForked = forkedSeries[forkedSeries.length - 1]?.y ?? 0;

      comparison[metric] = {
        baseline: baselineSeries,
        forked: forkedSeries,
        divergence,
        endDelta: endForked - endBaseline,
        avgDivergence: divergence.length > 0
          ? divergence.reduce((sum, d) => sum + d.y, 0) / divergence.length
          : 0,
      };
    }

    return {
      forkId,
      civId,
      civName: civ?.name || civId,
      forkLabel: fork.label,
      startYear: fork.startYear,
      endYear: fork.endYear,
      turnsCompared: fork.turnsRun,
      metrics: comparison,
    };
  }

  // Get a ranked list of which metrics diverged most
  getDivergenceRanking(forkId, civId) {
    const comp = this.compareTrajectories(forkId, civId);
    if (!comp) return [];

    return Object.entries(comp.metrics)
      .map(([metric, data]) => ({
        metric,
        avgDivergence: data.avgDivergence,
        endDelta: data.endDelta,
      }))
      .sort((a, b) => b.avgDivergence - a.avgDivergence);
  }

  // ── Cleanup ──────────────────────────────────────────────────

  deleteSnapshot(snapshotId) {
    this.snapshots = this.snapshots.filter(s => s.id !== snapshotId);
    this.forks = this.forks.filter(f => f.snapshotId !== snapshotId);
  }

  deleteFork(forkId) {
    this.forks = this.forks.filter(f => f.id !== forkId);
  }
}
