// ============================================================
// map.js - Hex map generation and canvas rendering
// ============================================================

class HexMap {
  constructor(cols, rows, hexSize) {
    this.cols = cols;
    this.rows = rows;
    this.hexSize = hexSize;
    this.tiles = new Map();      // key -> tile data
    this.resources = new Map();  // key -> resource info
    this.climate = new Map();    // key -> climate modifier
    this.warmingOverlay = 0;     // 0-1 global warming visual intensity

    // Canvas setup
    this.canvas = null;
    this.ctx = null;

    // Camera / viewport
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1.0;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    // Selection
    this.hoveredTile = null;
    this.selectedTile = null;

    // Overlay mode: 'terrain' | 'civilization' | 'fertility' | 'wellbeing' | 'warming'
    this.overlayMode = 'terrain';

    this._noiseSeeds = [Math.random() * 1000, Math.random() * 1000, Math.random() * 1000];
    this._civTerritories = new Map(); // key -> civId

    // ── Climate bias (from world setup) ───────────────────────
    // warmth: −2 (cold-dominant) to +2 (tropical); moisture: −2 (arid) to +2 (humid)
    this.climateBias = { warmth: 0, moisture: 0 };

    // ── Map view mode ─────────────────────────────────────────
    // 'hex' = standard hex grid  |  'map' = cartographic view (no grid, terrain icons, capitals)
    this.viewMode = 'hex';
    this._capitalTiles = new Map(); // civId → { q, r }
  }

  // ── Generation ───────────────────────────────────────────────
  generate() {
    this.tiles.clear();
    this.resources.clear();

    const cols = this.cols, rows = this.rows;
    const [s1, s2, s3] = this._noiseSeeds;

    // Generate elevation, moisture, temperature maps
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const nx = (q + s1) * 0.04;
        const ny = (r + s2) * 0.04;

        // Multi-octave noise for elevation
        const elev = (Utils.fractalNoise(nx, ny, 5, 0.55, 1.0) + 1) / 2;
        const rawMoisture    = (Utils.fractalNoise(nx + 100 + s3, ny + 50, 4, 0.5, 1.0) + 1) / 2;
        const rawTemperature = 1 - Math.abs(r / rows - 0.5) * 2; // warm equator, cold poles
        // Apply world climate bias (climateBias.warmth and .moisture each range −2 to +2)
        const moisture    = Utils.clamp(rawMoisture    + this.climateBias.moisture * 0.10, 0, 1);
        const temperature = Utils.clamp(rawTemperature + this.climateBias.warmth   * 0.10, 0, 1);

        // Continental bias: edges tend toward ocean
        const edgeDist = Math.min(q / cols, (cols - q) / cols, r / rows, (rows - r) / rows);
        const elevAdj = elev * 0.7 + edgeDist * 0.3 + moisture * 0.05;

        const terrain = this._classifyTerrain(elevAdj, moisture, temperature);
        const key = Utils.hexKey(q, r);

        this.tiles.set(key, {
          q, r,
          terrain,
          elevation: elevAdj,
          moisture,
          temperature,
          fertility: this._baseFertility(terrain, moisture),
          resource: null,
          civId: null,
        });
      }
    }

    this._markOceanTiles();
    this._generateRivers();
    this._placeResources();
    this._computeClimateCells();
  }

  /** BFS from edge water tiles to distinguish true ocean from inland lakes. */
  _markOceanTiles() {
    const waterIds = new Set(['ocean', 'coastal', 'deep_ocean']);
    const visited = new Set();
    const queue = [];
    // Seed: water tiles on map edges
    for (const [key, tile] of this.tiles) {
      if (!waterIds.has(tile.terrain.id)) continue;
      if (tile.q === 0 || tile.q === this.cols - 1 || tile.r === 0 || tile.r === this.rows - 1) {
        queue.push(key);
        visited.add(key);
      }
    }
    // Flood-fill to find all ocean-connected water
    while (queue.length > 0) {
      const key = queue.shift();
      const tile = this.tiles.get(key);
      tile.isOcean = true;
      for (const n of Utils.hexNeighbors(tile.q, tile.r)) {
        const nk = Utils.hexKey(n.q, n.r);
        if (visited.has(nk)) continue;
        const nt = this.tiles.get(nk);
        if (!nt || !waterIds.has(nt.terrain.id)) continue;
        visited.add(nk);
        queue.push(nk);
      }
    }
    // Anything not reached is inland water → reclassify as lake
    for (const [, tile] of this.tiles) {
      if (waterIds.has(tile.terrain.id) && !tile.isOcean) {
        tile.isOcean = false;
        tile.terrain = TERRAIN.LAKE;
      }
    }
  }

  /** Generate rivers flowing from high elevation to water bodies. */
  _generateRivers() {
    this.rivers = [];
    const waterIds = new Set(['ocean', 'coastal', 'deep_ocean', 'lake']);

    // Collect highland tiles as potential river sources
    const sources = [];
    for (const [, tile] of this.tiles) {
      if (tile.terrain.id === 'mountains' || tile.terrain.id === 'hills') sources.push(tile);
    }
    if (sources.length === 0) return;

    // Generate ~6 rivers (scaled to map)
    const numRivers = Math.min(8, Math.max(3, Math.floor(sources.length / 30)));
    const used = new Set(); // prevent overlapping rivers

    for (let i = 0; i < numRivers; i++) {
      const start = Utils.randChoice(sources);
      const startKey = Utils.hexKey(start.q, start.r);
      if (used.has(startKey)) continue;

      const path = [{ q: start.q, r: start.r }];
      const visited = new Set([startKey]);
      let current = start;

      for (let step = 0; step < 80; step++) {
        // Find lowest-elevation neighbor
        const neighbors = Utils.hexNeighbors(current.q, current.r);
        let best = null, bestElev = current.elevation;
        for (const n of neighbors) {
          const nt = this.tiles.get(Utils.hexKey(n.q, n.r));
          if (!nt || visited.has(Utils.hexKey(n.q, n.r))) continue;
          if (nt.elevation < bestElev) { best = nt; bestElev = nt.elevation; }
        }

        if (!best) break; // stuck — no lower neighbor
        const bestKey = Utils.hexKey(best.q, best.r);
        visited.add(bestKey);
        path.push({ q: best.q, r: best.r });

        // Reached water — river is complete
        if (waterIds.has(best.terrain.id)) break;
        current = best;
      }

      // Only keep rivers that reach water and are long enough to be visible
      if (path.length >= 4) {
        this.rivers.push(path);
        for (const p of path) {
          const key = Utils.hexKey(p.q, p.r);
          used.add(key);
          const tile = this.tiles.get(key);
          if (tile && tile.terrain.passable) {
            tile.hasRiver = true;
            tile.fertility = Math.min(12, tile.fertility + 2);
          }
        }
      }
    }
  }

  _classifyTerrain(elev, moisture, temp) {
    if (elev < 0.28) return TERRAIN.DEEP_OCEAN;
    if (elev < 0.36) return TERRAIN.OCEAN;
    if (elev < 0.40) return TERRAIN.COASTAL;
    if (elev < 0.43) return TERRAIN.BEACH;
    if (elev > 0.82) return temp < 0.2 ? TERRAIN.SNOW : TERRAIN.MOUNTAINS;
    if (elev > 0.68) return TERRAIN.HILLS;
    if (temp < 0.15) return TERRAIN.SNOW;
    if (temp < 0.25) return TERRAIN.TUNDRA;
    if (temp > 0.85 && moisture < 0.25) return TERRAIN.DESERT;
    if (temp > 0.75 && moisture > 0.7)  return TERRAIN.JUNGLE;
    if (moisture < 0.30) return TERRAIN.DESERT;
    if (moisture < 0.45) return temp > 0.6 ? TERRAIN.SAVANNA : TERRAIN.PLAINS;
    if (moisture < 0.60) return TERRAIN.GRASSLAND;
    if (moisture < 0.75) return TERRAIN.FOREST;
    if (moisture < 0.80) return TERRAIN.WETLANDS;
    return TERRAIN.DENSE_FOREST;
  }

  _baseFertility(terrain, moisture) {
    return Utils.clamp(terrain.fertility + Math.floor(moisture * 3), 0, 12);
  }

  _placeResources() {
    const RESOURCES = [
      { id: 'grain',    label: 'Grain',     icon: '🌾', terrains: ['plains','grassland'],        probability: 0.12 },
      { id: 'iron',     label: 'Iron',      icon: '⛏️', terrains: ['mountains','hills'],          probability: 0.14 },
      { id: 'gold',     label: 'Gold',      icon: '✨', terrains: ['mountains','hills','desert'], probability: 0.06 },
      { id: 'timber',   label: 'Timber',    icon: '🌲', terrains: ['forest','dense_forest'],      probability: 0.15 },
      { id: 'fish',     label: 'Fish',      icon: '🐟', terrains: ['ocean','coastal','lake'],     probability: 0.16 },
      { id: 'stone',    label: 'Stone',     icon: '🪨', terrains: ['mountains','hills','plains'], probability: 0.10 },
      { id: 'herbs',    label: 'Herbs',     icon: '🌿', terrains: ['forest','wetlands','jungle'], probability: 0.10 },
      { id: 'livestock',label: 'Livestock', icon: '🐂', terrains: ['grassland','plains','savanna'],probability: 0.10 },
      { id: 'coal',     label: 'Coal',      icon: '🪨', terrains: ['mountains','hills'],          probability: 0.08 },
      { id: 'oil',      label: 'Oil',       icon: '🛢️', terrains: ['desert','coastal'],           probability: 0.05 },
      { id: 'spices',   label: 'Spices',    icon: '🌶️', terrains: ['jungle','savanna'],           probability: 0.07 },
      { id: 'gems',     label: 'Gems',      icon: '💎', terrains: ['mountains','desert'],          probability: 0.04 },
    ];

    for (const [key, tile] of this.tiles) {
      if (!tile.terrain.passable) continue;
      for (const res of RESOURCES) {
        if (res.terrains.includes(tile.terrain.id) && Math.random() < res.probability) {
          tile.resource = { ...res };
          break;
        }
      }
    }
  }

  _computeClimateCells() {
    // Simple latitude-based climate zones; modified by terrain
    for (const [key, tile] of this.tiles) {
      this.climate.set(key, {
        baseTemp: tile.temperature,
        currentTemp: tile.temperature,
        warmingDelta: 0,
      });
    }
  }

  // ── Climate / Warming ─────────────────────────────────────────
  applyGlobalWarming(warmingIndex) {
    // warmingIndex: 0-100
    this.warmingOverlay = warmingIndex / 100;
    const tempRise = warmingIndex * 0.025; // max +2.5°C at 100

    for (const [key, cell] of this.climate) {
      const tile = this.tiles.get(key);
      cell.warmingDelta = tempRise;
      cell.currentTemp = cell.baseTemp + tempRise / 4;

      // At high warming, some tiles degrade
      if (warmingIndex > 50 && tile) {
        if (tile.terrain.id === 'tundra' && warmingIndex > 70) {
          // Tundra thaw → wetlands (positive in some ways)
        }
        if (tile.terrain.id === 'grassland' && warmingIndex > 75 && tile.moisture < 0.4) {
          tile.terrain = TERRAIN.DESERT;
          tile.fertility = Math.max(1, tile.fertility - 3);
        }
        if (tile.terrain.id === 'coastal' && warmingIndex > 80) {
          tile.terrain = TERRAIN.OCEAN;
          tile.fertility = 0;
        }
      }
    }
  }

  // ── Territory ─────────────────────────────────────────────────
  claimTile(q, r, civId) {
    const key = Utils.hexKey(q, r);
    const tile = this.tiles.get(key);
    if (tile && tile.terrain.passable) {
      tile.civId = civId;
      this._civTerritories.set(key, civId);
      return true;
    }
    return false;
  }

  getTilesForCiv(civId) {
    const result = [];
    for (const [key, tile] of this.tiles) {
      if (tile.civId === civId) result.push(tile);
    }
    return result;
  }

  getRandomPassableTile() {
    const passable = [];
    for (const [, tile] of this.tiles) {
      if (tile.terrain.passable && !tile.civId) passable.push(tile);
    }
    return Utils.randChoice(passable);
  }

  // ── Canvas Setup ──────────────────────────────────────────────
  attachCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._setupInteraction();
    this._centerMap();
  }

  _centerMap() {
    const { x: maxX, y: maxY } = Utils.hexToPixel(this.cols, this.rows / 2, this.hexSize);
    this.offsetX = (this.canvas.width / 2) - (maxX / 2);
    this.offsetY = (this.canvas.height / 2) - (maxY / 2);
  }

  _setupInteraction() {
    const canvas = this.canvas;

    canvas.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - this.offsetX) / this.zoom;
      const my = (e.clientY - rect.top - this.offsetY) / this.zoom;
      const { q, r } = Utils.pixelToHex(mx, my, this.hexSize);
      this.hoveredTile = this.tiles.get(Utils.hexKey(q, r)) || null;

      if (this.isDragging) {
        this.offsetX += e.clientX - this.lastMouse.x;
        this.offsetY += e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    canvas.addEventListener('mouseup', e => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // Detect click (no significant drag)
      const dx = Math.abs(e.clientX - this.lastMouse.x);
      const dy = Math.abs(e.clientY - this.lastMouse.y);
      if (dx < 3 && dy < 3) {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left - this.offsetX) / this.zoom;
        const my = (e.clientY - rect.top - this.offsetY) / this.zoom;
        const { q, r } = Utils.pixelToHex(mx, my, this.hexSize);
        const tile = this.tiles.get(Utils.hexKey(q, r));
        this.selectedTile = tile || null;
        if (this.onTileSelect) this.onTileSelect(tile);
      }
    });

    canvas.addEventListener('mouseleave', () => { this.isDragging = false; });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.offsetX = mx - (mx - this.offsetX) * zoomFactor;
      this.offsetY = my - (my - this.offsetY) * zoomFactor;
      this.zoom = Utils.clamp(this.zoom * zoomFactor, 0.4, 3.0);
    }, { passive: false });

    // Touch support
    let lastTouchDist = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2) {
        lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        this.offsetX += e.touches[0].clientX - this.lastMouse.x;
        this.offsetY += e.touches[0].clientY - this.lastMouse.y;
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.touches.length === 2 && lastTouchDist) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.zoom = Utils.clamp(this.zoom * (dist / lastTouchDist), 0.4, 3.0);
        lastTouchDist = dist;
      }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { this.isDragging = false; lastTouchDist = null; });
  }

  // ── Rendering ─────────────────────────────────────────────────
  render(civilizations = [], year = 0) {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.zoom, this.zoom);

    // Render all tiles
    for (const [, tile] of this.tiles) {
      this._renderTile(ctx, tile, civilizations);
    }

    // Rivers
    this._renderRivers(ctx);

    // Borders between civilizations
    this._renderBorders(ctx, civilizations);

    // Terrain feature icons (both map and hex modes)
    // Map mode: larger icons for cartographic clarity
    const iconMult = this.viewMode === 'map' ? 0.75 : 0.65;
    for (const [, tile] of this.tiles) {
      const { x, y } = Utils.hexToPixel(tile.q, tile.r, this.hexSize);
      this._renderTerrainFeatureForId(ctx, x, y, this.hexSize * iconMult, tile.terrain.id);
    }
    // Capital markers: always shown in both map and hex modes
    this._renderCapitalMarkers(ctx, civilizations);

    // Resource icons (only when zoomed in enough and not in map mode)
    if (this.zoom > 0.9 && this.viewMode === 'hex') {
      this._renderResources(ctx);
    }

    // Hover highlight
    if (this.hoveredTile) {
      this._highlightTile(ctx, this.hoveredTile, 'rgba(255,255,255,0.25)', 2);
    }

    // Selected tile
    if (this.selectedTile) {
      this._highlightTile(ctx, this.selectedTile, 'rgba(255,220,50,0.6)', 3);
    }

    ctx.restore();

    // Global warming vignette
    if (this.warmingOverlay > 0.1) {
      this._renderWarmingVignette(ctx, w, h);
    }

    // Mini overlay: year stamp
    this._renderYearStamp(ctx, year, w, h);

    // Map-mode legend (drawn outside transform so it stays fixed in corner)
    if (this.viewMode === 'map') {
      this._renderMapLegend(ctx, w, h);
    }
  }

  _renderTile(ctx, tile, civilizations) {
    const { x, y } = Utils.hexToPixel(tile.q, tile.r, this.hexSize);
    const corners = Utils.hexCorners(x, y, this.hexSize - 0.5);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();

    // Base terrain color
    let fillColor = tile.terrain.color;

    // Overlay modes
    if (this.overlayMode === 'fertility') {
      const t = tile.fertility / 12;
      fillColor = Utils.blendColors('#402010', '#20e040', t);
    } else if (this.overlayMode === 'wellbeing' && tile.civId) {
      const civ = civilizations.find(c => c.id === tile.civId);
      if (civ) {
        const t = civ.state.averageWellbeing / 100;
        fillColor = Utils.blendColors('#cc2020', '#20cc60', t);
      }
    }

    ctx.fillStyle = fillColor;
    ctx.fill();

    // Civilization territory overlay
    if (tile.civId) {
      const civ = civilizations.find(c => c.id === tile.civId);
      if (civ) {
        // Player civ: lower alpha so terrain icons show through clearly
        const alpha = this.viewMode === 'map'
          ? (civ.isPlayerCiv ? 0.40 : 0.25)
          : (civ.isPlayerCiv ? 0.45 : 0.30);
        ctx.fillStyle = Utils.hexColorWithAlpha(civ.color, alpha);
        ctx.fill();
      }
    }

    // Warming desert overlay
    if (this.warmingOverlay > 0.3 && tile.terrain.id !== 'deep_ocean' && tile.terrain.id !== 'ocean') {
      const intensity = Math.max(0, this.warmingOverlay - 0.3) * 0.3;
      ctx.fillStyle = `rgba(200,80,0,${intensity})`;
      ctx.fill();
    }

    // Grid line — suppressed in map mode for cartographic look
    if (this.viewMode !== 'map') {
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  _renderRivers(ctx) {
    if (!this.rivers || this.rivers.length === 0) return;
    ctx.save();
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = this.hexSize * 0.18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const path of this.rivers) {
      if (path.length < 2) continue;
      ctx.beginPath();
      const p0 = Utils.hexToPixel(path[0].q, path[0].r, this.hexSize);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < path.length; i++) {
        const p = Utils.hexToPixel(path[i].q, path[i].r, this.hexSize);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  _renderBorders(ctx, civilizations) {
    const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
    const isMapMode = this.viewMode === 'map';
    for (const [, tile] of this.tiles) {
      if (!tile.civId) continue;
      const { x, y } = Utils.hexToPixel(tile.q, tile.r, this.hexSize);
      const corners = Utils.hexCorners(x, y, this.hexSize - 0.5);
      const civ = civilizations.find(c => c.id === tile.civId);
      if (!civ) continue;

      const isPlayer = civ.isPlayerCiv;

      for (let d = 0; d < 6; d++) {
        const nq = tile.q + DIRECTIONS[d][0];
        const nr = tile.r + DIRECTIONS[d][1];
        const neighbor = this.tiles.get(Utils.hexKey(nq, nr));
        if (!neighbor || neighbor.civId !== tile.civId) {
          // Draw border edge
          const c1 = corners[d];
          const c2 = corners[(d + 1) % 6];
          ctx.beginPath();
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
          ctx.strokeStyle = civ.color;
          if (isMapMode) {
            if (isPlayer) {
              ctx.lineWidth = 3.5;
              ctx.shadowColor = civ.color;
              ctx.shadowBlur = 4;
            } else {
              ctx.lineWidth = 2.5;
              ctx.shadowBlur = 0;
            }
          } else {
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset after each stroke
        }
      }
    }
    ctx.shadowBlur = 0;
  }

  // ── Map-View: Terrain Feature Icons ───────────────────────────
  // Draws a small canvas-shape icon at (cx, cy) scaled by s (= hexSize × 0.28).
  // Called inside the ctx.scale(zoom) transform, so icons auto-scale.
  _renderTerrainFeature(ctx, cx, cy, s) {
    // We read the tile's terrain id via a caller loop; here we receive the id via
    // the wrapper in render() which passes tile.terrain.id explicitly.
    // This is called via the bound wrapper below that captures terrainId.
  }

  _renderTerrainFeatureForId(ctx, cx, cy, s, terrainId) {
    ctx.save();
    // Drop shadow for terrain icons so they pop against territory overlays
    // Scale shadow with icon size; disable at very small sizes to avoid zoom artifacts
    if (s > 3) {
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = Math.min(4, Math.max(2, s * 0.25));
      ctx.shadowOffsetX = Math.min(2, Math.max(1, s * 0.08));
      ctx.shadowOffsetY = Math.min(2, Math.max(1, s * 0.08));
    }
    switch (terrainId) {
      // ── Mountains / Hills: warm brown triangle with dark outline ─
      case 'mountains':
      case 'hills':
        ctx.beginPath();
        ctx.moveTo(cx,     cy - s * 1.1);
        ctx.lineTo(cx - s, cy + s * 0.55);
        ctx.lineTo(cx + s, cy + s * 0.55);
        ctx.closePath();
        ctx.fillStyle = terrainId === 'mountains' ? 'rgba(139,119,101,0.95)' : 'rgba(160,142,120,0.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(60,50,40,0.9)';
        ctx.lineWidth = Math.max(1, s * 0.08);
        ctx.stroke();
        // Snow cap (mountains only)
        if (terrainId === 'mountains') {
          ctx.fillStyle = 'rgba(245,248,255,0.98)';
          ctx.beginPath();
          ctx.moveTo(cx,            cy - s * 1.1);
          ctx.lineTo(cx - s * 0.35, cy - s * 0.25);
          ctx.lineTo(cx + s * 0.35, cy - s * 0.25);
          ctx.closePath();
          ctx.fill();
        }
        break;

      // ── Forest / Dense Forest / Jungle: little green tree ─
      case 'forest':
      case 'dense_forest':
      case 'jungle': {
        const trunkW = s * 0.32, trunkH = s * 0.45;
        // Trunk (brown rect)
        ctx.fillStyle = terrainId === 'jungle' ? 'rgba(60,35,10,0.95)' : 'rgba(80,45,15,0.95)';
        ctx.fillRect(cx - trunkW / 2, cy + s * 0.05, trunkW, trunkH);
        // Canopy (green triangle)
        const canopyColor = terrainId === 'jungle'
          ? 'rgba(15,90,20,0.95)'
          : terrainId === 'dense_forest'
            ? 'rgba(20,75,20,0.95)'
            : 'rgba(30,105,30,0.95)';
        ctx.fillStyle = canopyColor;
        ctx.beginPath();
        ctx.moveTo(cx,          cy - s * 0.95);
        ctx.lineTo(cx - s * 0.85, cy + s * 0.1);
        ctx.lineTo(cx + s * 0.85, cy + s * 0.1);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // ── Desert / Savanna: tan diamond with dark outline ────
      case 'desert':
      case 'savanna':
        ctx.fillStyle = terrainId === 'desert'
          ? 'rgba(210,170,60,1.0)'
          : 'rgba(180,190,50,1.0)';
        ctx.strokeStyle = terrainId === 'desert'
          ? 'rgba(120,80,20,0.8)'
          : 'rgba(80,100,20,0.8)';
        ctx.lineWidth = Math.max(1, s * 0.08);
        ctx.beginPath();
        ctx.moveTo(cx,       cy - s);
        ctx.lineTo(cx + s,   cy);
        ctx.lineTo(cx,       cy + s);
        ctx.lineTo(cx - s,   cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      // ── Snow / Tundra: blue ❄ snowflake ───────────────────
      case 'snow':
      case 'tundra':
        ctx.fillStyle = terrainId === 'snow'
          ? 'rgba(170,210,250,0.95)'
          : 'rgba(150,190,225,0.90)';
        ctx.font = `bold ${Math.round(s * 2.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄', cx, cy);
        break;

      // ── Ocean / Deep Ocean / Coastal: 2 wave arcs ─────────
      case 'ocean':
      case 'deep_ocean':
      case 'coastal': {
        const waveColor = terrainId === 'deep_ocean'
          ? 'rgba(255,255,255,0.55)'
          : 'rgba(255,255,255,0.65)';
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = s * 0.32;
        ctx.lineCap = 'round';
        const ww = s * 1.3;
        for (let wi = 0; wi < 2; wi++) {
          const wy = cy + (wi - 0.5) * s * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx - ww, wy);
          ctx.quadraticCurveTo(cx - ww / 2, wy - s * 0.45, cx, wy);
          ctx.quadraticCurveTo(cx + ww / 2, wy + s * 0.45, cx + ww, wy);
          ctx.stroke();
        }
        ctx.lineCap = 'butt';
        break;
      }

      // ── Wetlands: cattails icon ─────────────────────────
      case 'wetlands': {
        // Water ripple at base
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(80,160,210,0.85)';
        ctx.lineWidth = Math.max(1.8, s * 0.16);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.7, cy + s * 0.5);
        ctx.quadraticCurveTo(cx - s * 0.25, cy + s * 0.3, cx, cy + s * 0.5);
        ctx.quadraticCurveTo(cx + s * 0.25, cy + s * 0.7, cx + s * 0.7, cy + s * 0.5);
        ctx.stroke();
        // Left cattail stem
        ctx.strokeStyle = 'rgba(50,130,40,0.95)';
        ctx.lineWidth = Math.max(1.8, s * 0.14);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.3, cy + s * 0.5);
        ctx.lineTo(cx - s * 0.25, cy - s * 0.6);
        ctx.stroke();
        // Left cattail head (brown oval)
        ctx.fillStyle = 'rgba(90,55,15,1.0)';
        ctx.beginPath();
        ctx.ellipse(cx - s * 0.25, cy - s * 0.75, s * 0.16, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right cattail stem
        ctx.strokeStyle = 'rgba(50,130,40,0.95)';
        ctx.lineWidth = Math.max(1.8, s * 0.14);
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.25, cy + s * 0.5);
        ctx.lineTo(cx + s * 0.2, cy - s * 0.4);
        ctx.stroke();
        // Right cattail head (brown oval)
        ctx.fillStyle = 'rgba(90,55,15,1.0)';
        ctx.beginPath();
        ctx.ellipse(cx + s * 0.2, cy - s * 0.55, s * 0.14, s * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineCap = 'butt';
        break;
      }

      // ── Lake: calm circle ─────────────────────────────────
      case 'lake':
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, s * 0.7, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        break; // plains, grassland, beach — color alone distinguishes
    }
    ctx.restore();
  }

  // ── Map-View: Capital City Markers ────────────────────────────
  _renderCapitalMarkers(ctx, civs) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const [civId, { q, r }] of this._capitalTiles) {
      const civ = civs.find(c => c.id === civId);
      if (!civ) continue;
      const { x, y } = Utils.hexToPixel(q, r, this.hexSize);
      const isPlayer = civ.isPlayerCiv;
      const radius   = isPlayer ? 6.5 : 4.5;

      // Outer ring (player civ only)
      if (isPlayer) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = civ.color;
      ctx.fill();

      // Dark center dot (identifies capital without blending into snow/white terrain)
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fill();

      // Civ name label (with shadow for legibility)
      const label  = civ.name.length > 14 ? civ.name.slice(0, 13) + '…' : civ.name;
      const fSize  = isPlayer ? 8.5 : 7;
      ctx.font     = `bold ${fSize}px sans-serif`;
      const labelY = y + radius + 3;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(label, x + 0.8, labelY + 0.8);
      // Text
      ctx.fillStyle = isPlayer ? '#ffffff' : 'rgba(235,235,235,0.92)';
      ctx.fillText(label, x, labelY);
    }
    ctx.restore();
  }

  // ── Map-View: Terrain Legend (fixed corner overlay) ───────────
  _renderMapLegend(ctx, w, h) {
    const items = [
      { shape: 'mountain', label: 'Mountains / Hills' },
      { shape: 'tree',     label: 'Forest / Jungle' },
      { shape: 'diamond',  label: 'Desert / Savanna' },
      { shape: 'snow',     label: 'Snow / Tundra' },
      { shape: 'wave',     label: 'Ocean / Coastal' },
      { shape: 'wetland',  label: 'Wetlands' },
      { shape: 'dot',      label: 'Capital city' },
    ];

    const PAD = 10, ICON_SIZE = 10, LINE = 18, TXT_OFFSET = 18;
    const boxW = 148, boxH = PAD * 2 + items.length * LINE;
    const bx = w - boxW - 8, by = h - boxH - 8;

    // Background pill
    ctx.save();
    ctx.fillStyle = 'rgba(8,12,20,0.82)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = 'rgba(200,210,230,0.9)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('MAP LEGEND', bx + PAD, by + PAD / 2 + 5);

    items.forEach((item, i) => {
      const ix = bx + PAD + ICON_SIZE / 2;
      const iy = by + PAD + 10 + i * LINE + LINE / 2;
      const s  = ICON_SIZE * 0.42;

      ctx.save();
      switch (item.shape) {
        case 'mountain':
          ctx.fillStyle = 'rgba(110,100,110,0.9)';
          ctx.beginPath(); ctx.moveTo(ix, iy - s * 1.1); ctx.lineTo(ix - s, iy + s * 0.55); ctx.lineTo(ix + s, iy + s * 0.55); ctx.closePath(); ctx.fill();
          break;
        case 'tree':
          ctx.fillStyle = 'rgba(80,45,15,0.9)';
          ctx.fillRect(ix - s * 0.22, iy + s * 0.05, s * 0.44, s * 0.55);
          ctx.fillStyle = 'rgba(30,115,30,0.9)';
          ctx.beginPath(); ctx.moveTo(ix, iy - s); ctx.lineTo(ix - s * 0.85, iy + s * 0.12); ctx.lineTo(ix + s * 0.85, iy + s * 0.12); ctx.closePath(); ctx.fill();
          break;
        case 'diamond':
          ctx.fillStyle = 'rgba(185,145,50,0.75)';
          ctx.beginPath(); ctx.moveTo(ix, iy - s); ctx.lineTo(ix + s, iy); ctx.lineTo(ix, iy + s); ctx.lineTo(ix - s, iy); ctx.closePath(); ctx.fill();
          break;
        case 'snow':
          ctx.fillStyle = 'rgba(160,200,240,0.9)';
          ctx.font = `bold ${Math.round(s * 2.8)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('❄', ix, iy);
          break;
        case 'wave':
          ctx.strokeStyle = 'rgba(80,155,225,0.8)';
          ctx.lineWidth = s * 0.45; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(ix - s, iy); ctx.quadraticCurveTo(ix - s/2, iy - s * 0.5, ix, iy); ctx.quadraticCurveTo(ix + s/2, iy + s * 0.5, ix + s, iy); ctx.stroke();
          break;
        case 'wetland':
          ctx.strokeStyle = 'rgba(50,140,95,0.8)';
          ctx.lineWidth = s * 0.4; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(ix - s, iy); ctx.quadraticCurveTo(ix - s/2, iy - s * 0.4, ix, iy); ctx.quadraticCurveTo(ix + s/2, iy + s * 0.4, ix + s, iy); ctx.stroke();
          break;
        case 'dot':
          ctx.beginPath(); ctx.arc(ix, iy, s * 0.95, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(180,180,180,0.8)'; ctx.fill();
          ctx.beginPath(); ctx.arc(ix, iy, s * 0.32, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.fill();
          break;
      }
      ctx.restore();

      // Label
      ctx.fillStyle = 'rgba(200,210,230,0.88)';
      ctx.font = '8.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, bx + PAD + TXT_OFFSET, iy);
    });

    ctx.restore();
  }

  _renderResources(ctx) {
    for (const [, tile] of this.tiles) {
      if (!tile.resource || !tile.terrain.passable) continue;
      const { x, y } = Utils.hexToPixel(tile.q, tile.r, this.hexSize);
      ctx.font = `${this.hexSize * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tile.resource.icon, x, y);
    }
  }

  _highlightTile(ctx, tile, color, lineWidth) {
    const { x, y } = Utils.hexToPixel(tile.q, tile.r, this.hexSize);
    const corners = Utils.hexCorners(x, y, this.hexSize - 0.5);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  _renderWarmingVignette(ctx, w, h) {
    const intensity = this.warmingOverlay * 0.35;
    const gradient = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.3, w/2, h/2, Math.max(w,h)*0.8);
    gradient.addColorStop(0, 'rgba(180,40,0,0)');
    gradient.addColorStop(1, `rgba(180,40,0,${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Heat shimmer text when severe
    if (this.warmingOverlay > 0.7) {
      ctx.fillStyle = `rgba(255,100,0,${(this.warmingOverlay - 0.7) * 0.8})`;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Climate Crisis', w/2, 22);
    }
  }

  _renderYearStamp(ctx, year, w, h) {
    // Rendered by UI instead
  }

  // ── Civ Capital Placement ─────────────────────────────────────
  placeCapital(civId, preferredTerrain = null, options = {}) {
    // Find good starting tiles; separate coastal candidates when ocean access wanted
    const candidates = [];
    const coastalCandidates = [];
    for (const [, tile] of this.tiles) {
      if (!tile.terrain.passable || tile.civId) continue;
      if (preferredTerrain && tile.terrain.id !== preferredTerrain) continue;
      if (tile.fertility >= 5) {
        candidates.push(tile);
        if (options.wantOceanAccess) {
          const nbrs = Utils.hexNeighbors(tile.q, tile.r);
          const hasOcean = nbrs.some(n => {
            const nt = this.tiles.get(Utils.hexKey(n.q, n.r));
            return nt && nt.isOcean;
          });
          if (hasOcean) coastalCandidates.push(tile);
        }
      }
    }

    // When ocean access wanted and coastal tiles exist, draw from those
    const pool = (options.wantOceanAccess && coastalCandidates.length > 0)
      ? coastalCandidates : candidates;

    // Spread capitals apart
    let best = null, bestScore = -Infinity;
    for (let i = 0; i < Math.min(50, pool.length); i++) {
      const candidate = Utils.randChoice(pool);
      let minDist = Infinity;
      for (const [, t] of this.tiles) {
        if (t.civId && t.civId !== civId) {
          const d = Utils.hexDistance(candidate.q, candidate.r, t.q, t.r);
          if (d < minDist) minDist = d;
        }
      }
      let score = candidate.fertility * 2 + minDist;
      if (score > bestScore) { bestScore = score; best = candidate; }
    }

    if (!best && candidates.length > 0) best = Utils.randChoice(candidates);
    if (!best) {
      // Fallback: any passable tile
      for (const [, t] of this.tiles) {
        if (t.terrain.passable && !t.civId) { best = t; break; }
      }
    }

    if (best) {
      this.claimTile(best.q, best.r, civId);
      // Mark as capital for map-view rendering
      best.isCapital = true;
      this._capitalTiles.set(civId, { q: best.q, r: best.r });
      // Claim a few neighboring tiles
      const neighbors = Utils.hexNeighbors(best.q, best.r);
      for (const n of Utils.shuffle(neighbors).slice(0, 4)) {
        this.claimTile(n.q, n.r, civId);
      }
      return best;
    }
    return null;
  }

  /** Toggle between hex grid view and cartographic map view. */
  toggleViewMode() {
    this.viewMode = this.viewMode === 'hex' ? 'map' : 'hex';
  }

  // ── Expansion ─────────────────────────────────────────────────
  expandCiv(civId, amount = 1) {
    const territory = [];
    for (const [, tile] of this.tiles) {
      if (tile.civId === civId) territory.push(tile);
    }
    if (territory.length === 0) return;

    const border = [];
    for (const tile of territory) {
      for (const n of Utils.hexNeighbors(tile.q, tile.r)) {
        const nTile = this.tiles.get(Utils.hexKey(n.q, n.r));
        if (nTile && nTile.terrain.passable && !nTile.civId) {
          border.push(nTile);
        }
      }
    }

    const shuffled = Utils.shuffle(border);
    for (let i = 0; i < Math.min(amount, shuffled.length); i++) {
      this.claimTile(shuffled[i].q, shuffled[i].r, civId);
    }
  }

  // ── Resize ───────────────────────────────────────────────────
  resize(width, height) {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  // ── Tile Info ─────────────────────────────────────────────────
  getTileInfo(tile) {
    if (!tile) return null;
    return {
      terrain: tile.terrain.label,
      fertility: tile.fertility,
      resource: tile.resource ? tile.resource.label : 'None',
      civId: tile.civId || 'Unclaimed',
      q: tile.q, r: tile.r,
    };
  }

  setOverlayMode(mode) {
    this.overlayMode = mode;
  }
}
