// ============================================================
// utils.js - Utility functions
// ============================================================

const Utils = {

  // ── Seeded PRNG (Mulberry32) ───────────────────────────────
  // Fast 32-bit seeded PRNG for reproducible simulation runs.
  // Same seed + same parameters = identical trajectory.
  _rng: null,

  createRNG(seed) {
    let t = seed | 0;
    return function() {
      t = (t + 0x6D2B79F5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  },

  seedRNG(seed) {
    Utils._rng = Utils.createRNG(seed);
  },

  random() {
    return Utils._rng ? Utils._rng() : Math.random();
  },

  // ── Random ──────────────────────────────────────────────────
  rand(min, max) { return Math.floor(Utils.random() * (max - min + 1)) + min; },
  randFloat(min, max) { return Utils.random() * (max - min) + min; },
  randChoice(arr) { return arr[Math.floor(Utils.random() * arr.length)]; },
  randBool(probability = 0.5) { return Utils.random() < probability; },

  weightedChoice(options) {
    // options: [{value, weight}, ...]
    const total = options.reduce((s, o) => s + o.weight, 0);
    let r = Utils.random() * total;
    for (const o of options) {
      r -= o.weight;
      if (r <= 0) return o.value;
    }
    return options[options.length - 1].value;
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Utils.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // ── Math ─────────────────────────────────────────────────────
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  lerp(a, b, t) { return a + (b - a) * t; },
  normalise(val, min, max) { return (val - min) / (max - min); },

  // ── Year / Era ───────────────────────────────────────────────
  formatYear(year) {
    if (year < 0) return `${Math.abs(year)} BC`;
    if (year === 0) return '1 AD';
    return `${year} AD`;
  },

  getEra(year) {
    for (const era of ERAS) {
      if (year >= era.start && year < era.end) return era;
    }
    return ERAS[ERAS.length - 1];
  },

  // ── Hex Math ─────────────────────────────────────────────────
  // Pointy-top hex grid using axial coordinates
  hexToPixel(q, r, size) {
    const x = size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = size * (3 / 2 * r);
    return { x, y };
  },

  pixelToHex(px, py, size) {
    const q = (Math.sqrt(3) / 3 * px - 1 / 3 * py) / size;
    const r = (2 / 3 * py) / size;
    return Utils.hexRound(q, r);
  },

  hexRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    return { q: rq, r: rr };
  },

  hexNeighbors(q, r) {
    return [
      { q: q+1, r: r   }, { q: q-1, r: r   },
      { q: q,   r: r+1 }, { q: q,   r: r-1 },
      { q: q+1, r: r-1 }, { q: q-1, r: r+1 },
    ];
  },

  hexDistance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
  },

  hexKey(q, r) { return `${q},${r}`; },

  hexCorners(cx, cy, size) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      corners.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) });
    }
    return corners;
  },

  // ── String ───────────────────────────────────────────────────
  capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); },

  truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  },

  // ── Color ────────────────────────────────────────────────────
  hexColorWithAlpha(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  },

  blendColors(color1, color2, ratio) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  },

  // ── ID Generation ─────────────────────────────────────────────
  uid() {
    return Math.random().toString(36).substr(2, 9);
  },

  // ── Deep Clone ───────────────────────────────────────────────
  deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },

  // ── Simple Noise (for map generation) ────────────────────────
  // Smooth value noise
  noise: (() => {
    const perm = new Array(512);
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(hash, x, y) {
      const h = hash & 3;
      const u = h < 2 ? x : y;
      const v = h < 2 ? y : x;
      return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    return function(x, y) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x); y -= Math.floor(y);
      const u = fade(x), v = fade(y);
      const a = perm[X] + Y, b = perm[X + 1] + Y;
      return lerp(
        lerp(grad(perm[a], x, y), grad(perm[b], x - 1, y), u),
        lerp(grad(perm[a + 1], x, y - 1), grad(perm[b + 1], x - 1, y - 1), u),
        v
      );
    };
  })(),

  // Fractal noise (multiple octaves)
  fractalNoise(x, y, octaves = 4, persistence = 0.5, scale = 0.05) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += Utils.noise(x * frequency * scale, y * frequency * scale) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return value / maxValue;
  },

  // ── LLM Fetch (routes through /llm-proxy on localhost) ───────
  async llmFetch(url, options = {}) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      const proxy = { url, method: options.method || (options.body ? 'POST' : 'GET'), headers: {} };
      if (options.headers) {
        const h = options.headers instanceof Headers ? Object.fromEntries(options.headers) : options.headers;
        for (const [k, v] of Object.entries(h)) proxy.headers[k] = v;
      }
      if (options.body) {
        try { proxy.body = JSON.parse(options.body); } catch { proxy.body = options.body; }
      }
      return fetch('/llm-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxy),
        signal: options.signal,
      });
    }
    return fetch(url, options);
  },

  // ── DOM Helpers ───────────────────────────────────────────────
  el(id) { return document.getElementById(id); },
  qs(sel, ctx = document) { return ctx.querySelector(sel); },
  qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); },

  createEl(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  },

  show(el) {
    if (!el) return;
    const needsFlex = el.classList.contains('overlay-panel') || el.classList.contains('full-overlay-panel');
    el.style.display = needsFlex ? 'flex' : 'block';
  },
  hide(el) { if (el) el.style.display = 'none'; },
  toggle(el) { if (el) el.style.display = el.style.display === 'none' ? '' : 'none'; },

  // ── Encode / Decode Config (for share codes) ─────────────────
  encodeConfig(config) {
    try { return btoa(JSON.stringify(config)); } catch(e) { return null; }
  },
  decodeConfig(code) {
    try { return JSON.parse(atob(code)); } catch(e) { return null; }
  },
};
