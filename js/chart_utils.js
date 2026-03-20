/**
 * chart_utils.js — Canvas 2D chart rendering utility
 * No external dependencies. Used by society_panel.js.
 *
 * Track 1: drawStratumBars, drawLineChart, drawBarChart (in-panel rendering)
 * Track 2: exportPNG will be wired to download buttons
 */

class ChartUtils {
  // ─────────────────────────────────────────────────────────────
  // STRATUM IMPACT BARS
  // strataData: [{ label, value, note, color? }]  value range typically −20…+20
  // options: { title, minVal, maxVal, barHeight, fontSize, padding }
  // ─────────────────────────────────────────────────────────────
  static drawStratumBars(canvas, strataData, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const {
      title    = '',
      minVal   = -25,
      maxVal   = 25,
      barH     = 26,
      fontSize = 11,
      padLeft  = 120,
      padRight = 12,
      padTop   = title ? 28 : 8,
      gapY     = 8,
    } = options;

    // Title
    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 18);
    }

    const usableW   = W - padLeft - padRight;
    const zeroX     = padLeft + (usableW * (Math.abs(minVal) / (maxVal - minVal)));
    const totalRows = strataData.length;
    const totalH    = totalRows * (barH + gapY);
    // Scale canvas height dynamically if needed
    if (H < totalH + padTop + 10) {
      canvas.height = totalH + padTop + 20;
    }

    // Zero line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(zeroX, padTop - 4);
    ctx.lineTo(zeroX, padTop + totalH + 4);
    ctx.stroke();

    strataData.forEach((row, i) => {
      const y   = padTop + i * (barH + gapY);
      const val = Math.max(minVal, Math.min(maxVal, row.value ?? 0));
      const pxPerUnit = usableW / (maxVal - minVal);
      const barW = Math.abs(val) * pxPerUnit;
      const barX = val >= 0 ? zeroX : zeroX - barW;

      // Bar color
      let color = row.color;
      if (!color) {
        if (val > 0)       color = '#22c55e';
        else if (val < 0)  color = '#ef4444';
        else               color = '#64748b';
      }

      // Bar fill
      ctx.fillStyle = color + 'cc'; // slight transparency
      ctx.fillRect(barX, y, barW || 1, barH);

      // Bar border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, y, barW || 1, barH);

      // Label (left)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(row.label, padLeft - 8, y + barH / 2 + fontSize / 2 - 1);

      // Value text (right of bar)
      const valStr = (val >= 0 ? '+' : '') + val.toFixed(1);
      const valX   = val >= 0 ? barX + barW + 4 : barX - 4;
      ctx.fillStyle = color;
      ctx.textAlign = val >= 0 ? 'left' : 'right';
      ctx.fillText(valStr, valX, y + barH / 2 + fontSize / 2 - 1);

      // Note (grey, further right)
      if (row.note) {
        ctx.fillStyle = '#64748b';
        ctx.font = `${fontSize - 1}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(row.note, W - padRight, y + barH / 2 + (fontSize - 1) / 2 - 1);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // HORIZONTAL BAR CHART (3-stat overview, e.g. finance summary)
  // bars: [{ label, value, maxVal, color }]   value 0–100
  // ─────────────────────────────────────────────────────────────
  static drawBarChart(canvas, bars, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const {
      title    = '',
      barH     = 22,
      fontSize = 11,
      padLeft  = 130,
      padRight = 50,
      padTop   = title ? 28 : 8,
      gapY     = 10,
    } = options;

    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, 8, 18);
    }

    const usableW = W - padLeft - padRight;

    bars.forEach((bar, i) => {
      const y    = padTop + i * (barH + gapY);
      const max  = bar.maxVal ?? 100;
      const frac = Math.max(0, Math.min(1, (bar.value ?? 0) / max));
      const barW = Math.round(frac * usableW);
      const color = bar.color ?? '#38bdf8';

      // Background track
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(padLeft, y, usableW, barH);

      // Filled bar
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(padLeft, y, barW, barH);

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.strokeRect(padLeft, y, usableW, barH);

      // Label
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(bar.label, padLeft - 8, y + barH / 2 + fontSize / 2 - 1);

      // Value
      const valStr = typeof bar.value === 'number' ? bar.value.toFixed(0) : '—';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(valStr, padLeft + usableW + 6, y + barH / 2 + fontSize / 2 - 1);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // LINE CHART — time-series
  // series: [{ label, color, points: [{ x, y }] }]
  // options: { title, minY, maxY, xLabel, yLabel, showLegend }
  // ─────────────────────────────────────────────────────────────
  static drawLineChart(canvas, series, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!series || series.length === 0) return;

    const {
      title      = '',
      fontSize   = 11,
      padLeft    = 40,
      padRight   = 16,
      padTop     = title ? 28 : 10,
      padBottom  = options.xLabel ? 42 : 28,
      showLegend = true,
      xLabel     = '',
      yLabel     = '',
    } = options;

    // Compute data bounds
    let allPoints = [];
    series.forEach(s => allPoints = allPoints.concat(s.points ?? []));
    if (allPoints.length === 0) return;

    const xMin = options.xMin ?? Math.min(...allPoints.map(p => p.x));
    const xMax = options.xMax ?? Math.max(...allPoints.map(p => p.x));
    const yMin = options.minY ?? Math.min(...allPoints.map(p => p.y));
    const yMax = options.maxY ?? Math.max(...allPoints.map(p => p.y));
    const xRange = Math.max(1, xMax - xMin);
    const yRange = Math.max(1, yMax - yMin);

    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toCanvasX = x => padLeft + ((x - xMin) / xRange) * plotW;
    const toCanvasY = y => padTop  + plotH - ((y - yMin) / yRange) * plotH;

    // Title
    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 18);
    }

    // Gridlines (horizontal)
    const gridCount = 4;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= gridCount; i++) {
      const yVal = yMin + (yRange / gridCount) * i;
      const cy   = toCanvasY(yVal);
      ctx.beginPath();
      ctx.moveTo(padLeft, cy);
      ctx.lineTo(padLeft + plotW, cy);
      ctx.stroke();
      // Y label
      ctx.fillStyle = '#475569';
      ctx.font      = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(yVal.toFixed(0), padLeft - 4, cy + (fontSize - 1) / 2);
    }

    // X axis
    ctx.strokeStyle = '#334155';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Y axis label
    if (yLabel) {
      ctx.save();
      ctx.translate(12, padTop + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }

    // X tick labels (approx 5)
    const xTickCount = Math.min(5, allPoints.length);
    if (xTickCount > 1) {
      for (let i = 0; i <= xTickCount; i++) {
        const xVal = xMin + (xRange / xTickCount) * i;
        const cx   = toCanvasX(xVal);
        ctx.fillStyle = '#475569';
        ctx.font      = `${fontSize - 1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(xVal), cx, padTop + plotH + 14);
      }
    }

    // X axis label
    if (xLabel) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(xLabel, padLeft + plotW / 2, padTop + plotH + 30);
    }

    // Draw series
    series.forEach(s => {
      if (!s.points || s.points.length === 0) return;
      const color = s.color ?? '#38bdf8';
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      s.points.forEach((pt, idx) => {
        const cx = toCanvasX(pt.x);
        const cy = toCanvasY(pt.y);
        if (idx === 0) ctx.moveTo(cx, cy);
        else           ctx.lineTo(cx, cy);
      });
      ctx.stroke();
    });

    // Legend — drawn inside plot area
    if (showLegend && series.length > 0) {
      ctx.font = `${fontSize - 1}px sans-serif`;
      const maxLabelW = Math.max(...series.map(s => ctx.measureText(s.label ?? '').width));
      const entryW = maxLabelW + 24;
      const legendLineH = 14;

      // If many series, use horizontal layout above the plot (below title)
      if (series.length > 3) {
        // Compact horizontal legend just below title line
        const ly = title ? 6 : 2;
        let lx = padLeft;
        const itemW = entryW + 6;
        ctx.fillStyle = 'rgba(15,23,42,0.75)';
        ctx.fillRect(lx - 2, ly - 2, Math.min(series.length * (itemW), W - padLeft), legendLineH + 4);
        series.forEach(s => {
          const color = s.color ?? '#38bdf8';
          ctx.fillStyle = color;
          ctx.fillRect(lx, ly, 8, 8);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = `${fontSize - 2}px sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(s.label ?? '', lx + 11, ly + 8);
          lx += ctx.measureText(s.label ?? '').width + 18;
        });
      } else {
        // Vertical legend at top-right, above plot area when title exists
        let lx = padLeft + plotW - maxLabelW - 24;
        let ly = title ? 4 : padTop + 4;
        const bgH = series.length * 16 + 4;
        ctx.fillStyle = 'rgba(15,23,42,0.75)';
        ctx.fillRect(lx - 4, ly - 2, entryW + 4, bgH);
        series.forEach(s => {
          const color = s.color ?? '#38bdf8';
          ctx.fillStyle = color;
          ctx.fillRect(lx, ly, 10, 10);
          ctx.fillStyle = '#cbd5e1';
          ctx.font = `${fontSize - 1}px sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(s.label ?? '', lx + 13, ly + 9);
          ly += 16;
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DIVERGENCE CHART — side-by-side aggregate vs. bottom-strata
  // aggregateValue: 0–100 composite
  // bottomValue: 0–100 average of working_class + disenfranchised
  // divergenceScore: number (aggregate − bottom, negative = suffering below aggregate)
  // ─────────────────────────────────────────────────────────────
  static drawDivergenceChart(canvas, aggregateValue, bottomValue, divergenceScore, options = {}) {
    const ctx    = canvas.getContext('2d');
    const W      = canvas.width;
    const H      = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { fontSize = 11, padTop = 8, barH = 28 } = options;

    const colW   = Math.floor(W / 2) - 12;
    const usableW = colW - 4;

    // Helper: draw one bar column
    const drawCol = (x, label, value, color, subLabel) => {
      const frac = Math.max(0, Math.min(1, value / 100));
      const barW = Math.round(frac * usableW);
      const y    = padTop + 18;

      // Col title
      ctx.fillStyle = '#94a3b8';
      ctx.font      = `${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(label, x, padTop + 12);

      // Track
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, usableW, barH);

      // Fill
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x, y, barW, barH);

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.strokeRect(x, y, usableW, barH);

      // Value
      ctx.fillStyle = color;
      ctx.font      = `bold ${fontSize + 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(0), x + usableW / 2, y + barH / 2 + (fontSize + 2) / 2 - 2);

      // Sublabel
      if (subLabel) {
        ctx.fillStyle = '#64748b';
        ctx.font      = `${fontSize - 1}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(subLabel, x, y + barH + 14);
      }
    };

    // Aggregate (left column)
    const aggColor = '#38bdf8'; // sky blue — civ-level headline
    drawCol(8, 'Civilizational Economy', aggregateValue, aggColor, 'Financial depth · trade · growth');

    // Bottom strata (right column)
    const div = divergenceScore ?? (aggregateValue - bottomValue);
    const botColor = div > 20 ? '#ef4444' : div > 8 ? '#f59e0b' : '#22c55e';
    drawCol(colW + 16, 'Lower-Strata Reality', bottomValue, botColor, 'Working class · disenfranchised');

    // Divergence badge (center-bottom, below sublabels)
    const divStr  = div >= 0 ? `+${div.toFixed(1)}` : div.toFixed(1);
    const badgeX  = W / 2;
    const badgeY  = padTop + 18 + barH + 38;
    const bgColor = div > 20 ? '#991b1b' : div > 8 ? '#92400e' : '#166534';
    const txColor = '#ffffff';
    ctx.fillStyle  = bgColor;
    ctx.beginPath();
    ctx.roundRect?.(badgeX - 60, badgeY - 14, 120, 20, 4);
    ctx.fill?.();
    ctx.fillStyle  = txColor;
    ctx.font       = `bold ${fontSize}px sans-serif`;
    ctx.textAlign  = 'center';
    ctx.fillText(`Divergence: ${divStr}`, badgeX, badgeY);
  }

  // ─────────────────────────────────────────────────────────────
  // DISTRIBUTION CURVE — bimodal+gamma susceptibility (Pass 7)
  // dist: {
  //   resistantFraction: 0–1,
  //   alpha: gamma shape parameter,
  //   beta:  gamma scale parameter,
  //   strataMeans: [{ label, mean, color }]  — optional vertical markers
  // }
  // options: { title, fontSize, xMax, showStrata, showLegend }
  // ─────────────────────────────────────────────────────────────
  static drawDistributionCurve(canvas, dist, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const {
      title      = 'Susceptibility Distribution',
      fontSize   = 11,
      padLeft    = 44,
      padRight   = 16,
      padTop     = title ? 28 : 10,
      padBottom  = 54,
      xMax       = 5,
      showStrata = true,
      showLegend = true,
    } = options;

    const { resistantFraction = 0.20, alpha = 2.0, beta = 1.0, strataMeans = [] } = dist ?? {};

    const plotW    = W - padLeft - padRight;
    const plotH    = H - padTop - padBottom;
    const nSamples = 200;

    // Unnormalized gamma PDF; normalized to canvas height for display.
    const gammaPDF = (x) => (x <= 0 ? 0 : Math.pow(x, alpha - 1) * Math.exp(-x / beta));

    // Sample curve points across [0, xMax]
    const samples = [];
    for (let i = 0; i <= nSamples; i++) {
      const x = (i / nSamples) * xMax;
      samples.push({ x, y: gammaPDF(x) });
    }
    const maxY = Math.max(...samples.map(s => s.y), 1e-10);

    const toX = (x) => padLeft + (x / xMax) * plotW;
    const toY = (y) => padTop + plotH - (y / maxY) * plotH;

    // Title
    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 18);
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // X axis tick labels
    for (let xv = 0; xv <= xMax; xv++) {
      ctx.fillStyle = '#475569';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(xv, toX(xv), padTop + plotH + 14);
    }
    ctx.fillStyle = '#64748b';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Susceptibility Index', padLeft + plotW / 2, padTop + plotH + 29);

    // Y axis label (rotated)
    ctx.save();
    ctx.translate(12, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText('Density', 0, 0);
    ctx.restore();

    // Gamma curve — filled area
    ctx.beginPath();
    ctx.moveTo(toX(0), padTop + plotH);
    samples.forEach(s => ctx.lineTo(toX(s.x), toY(s.y)));
    ctx.lineTo(toX(xMax), padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = '#38bdf820';
    ctx.fill();

    // Gamma curve — line
    ctx.beginPath();
    samples.forEach((s, i) => {
      if (i === 0) ctx.moveTo(toX(s.x), toY(s.y));
      else         ctx.lineTo(toX(s.x), toY(s.y));
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Resistant fraction spike — tall bar at left edge
    // Height scaled so spike is visually comparable to gamma peak.
    const spikeW = Math.max(8, plotW * 0.035);
    const spikeH = Math.min(plotH * 0.88, resistantFraction * plotH * 3.0);
    ctx.fillStyle = '#94a3b8cc';
    ctx.fillRect(padLeft, padTop + plotH - spikeH, spikeW, spikeH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop + plotH - spikeH, spikeW, spikeH);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${fontSize - 1}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(resistantFraction * 100)}%`, padLeft + spikeW / 2, padTop + plotH - spikeH - 4);

    // Legend — compact, right-aligned in the title row
    if (showLegend) {
      const ly = 8;
      const lx = padLeft + plotW - 80;
      ctx.fillStyle = 'rgba(15,23,42,0.8)';
      ctx.fillRect(lx - 4, ly - 4, 100, 16);
      ctx.fillStyle = '#94a3b8cc';
      ctx.fillRect(lx, ly, 8, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${fontSize - 2}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Resistant', lx + 11, ly + 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(lx + 60, ly, 8, 8);
      ctx.fillText('Susceptible', lx + 71, ly + 8);
    }

    // Stratum mean markers — vertical dashed lines + legend strip below chart
    if (showStrata && strataMeans.length > 0) {
      const valid = strataMeans.filter(sm => sm.mean != null);
      // Draw vertical dashed lines
      valid.forEach(sm => {
        const mx = toX(sm.mean);
        ctx.strokeStyle = sm.color ?? '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, padTop + 2);
        ctx.lineTo(mx, padTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      // Legend strip: color swatch + "Label=mean" in a row below the x-axis label
      const legendY = H - 4;
      let lx = padLeft;
      ctx.font = `bold ${fontSize}px sans-serif`;
      valid.forEach(sm => {
        ctx.fillStyle = sm.color ?? '#f59e0b';
        ctx.fillRect(lx, legendY - 9, 8, 8);
        ctx.textAlign = 'left';
        const txt = `${sm.label ?? ''} ${sm.mean.toFixed(1)}`;
        ctx.fillText(txt, lx + 11, legendY - 1);
        lx += ctx.measureText(txt).width + 16;
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DUAL-AXIS LINE — empathy × reinforcement interaction history (Pass 7)
  // history: [{ turn, empathyComponent, reinforcementComponent, combinedScore }]
  // options: { title, fontSize, showCombined }
  // ─────────────────────────────────────────────────────────────
  static drawDualAxisLine(canvas, history, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!history || history.length < 2) {
      ctx.fillStyle = '#475569';
      ctx.font = `11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Insufficient history', W / 2, H / 2);
      return;
    }

    const {
      title        = 'Empathy × Reinforcement',
      fontSize     = 11,
      padLeft      = 44,
      padRight     = 44,
      padTop       = title ? 28 : 10,
      padBottom    = 34,
      showCombined = true,
    } = options;

    const plotW  = W - padLeft - padRight;
    const plotH  = H - padTop - padBottom;
    const turns  = history.map(h => h.turn);
    const xMin   = turns[0];
    const xMax   = turns[turns.length - 1];
    const xRange = Math.max(1, xMax - xMin);

    const toX = (t) => padLeft + ((t - xMin) / xRange) * plotW;
    const toY = (v) => padTop + plotH - (Math.max(0, Math.min(100, v)) / 100) * plotH;

    // Title
    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 18);
    }

    // Gridlines + Y labels (left = empathy blue, right = reinforcement orange)
    for (let i = 0; i <= 4; i++) {
      const yv = i * 25;
      const cy = toY(yv);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, cy);
      ctx.lineTo(padLeft + plotW, cy);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(yv, padLeft - 4, cy + (fontSize - 1) / 2);
      ctx.fillStyle = '#f97316';
      ctx.textAlign = 'left';
      ctx.fillText(yv, padLeft + plotW + 4, cy + (fontSize - 1) / 2);
    }

    // Plot border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop);
    ctx.stroke();

    // X tick labels
    const xTicks = Math.min(5, history.length);
    for (let i = 0; i <= xTicks; i++) {
      const t  = xMin + (xRange / xTicks) * i;
      const cx = toX(t);
      ctx.fillStyle = '#475569';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(t), cx, padTop + plotH + 14);
    }

    // Combined score line (dashed, drawn first/behind)
    if (showCombined) {
      ctx.beginPath();
      history.forEach((h, i) => {
        const cx = toX(h.turn);
        const cy = toY(h.combinedScore ?? 50);
        if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
      });
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Empathy line
    ctx.beginPath();
    history.forEach((h, i) => {
      const cx = toX(h.turn);
      const cy = toY(h.empathyComponent ?? 50);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reinforcement line
    ctx.beginPath();
    history.forEach((h, i) => {
      const cx = toX(h.turn);
      const cy = toY(h.reinforcementComponent ?? 50);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotated axis labels
    ctx.save();
    ctx.translate(12, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText('Empathy', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(W - 12, padTop + plotH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f97316';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText('Reinforcement', 0, 0);
    ctx.restore();

    // Bottom legend
    const legItems = [
      { label: 'Empathy',       color: '#38bdf8', dash: false },
      { label: 'Reinforcement', color: '#f97316', dash: false },
    ];
    if (showCombined) legItems.push({ label: 'Combined', color: '#22c55e', dash: true });
    let lx = padLeft;
    const ly = padTop + plotH + 26;
    legItems.forEach(item => {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      if (item.dash) ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(lx, ly - 4); ctx.lineTo(lx + 18, ly - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = item.color;
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 22, ly);
      lx += item.label.length * 6.5 + 32;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // STRATUM COMPARISON — grouped bar chart across 5 strata (Pass 7)
  // data: {
  //   primary:   [{ value, color? }]   — one entry per stratum (required)
  //   secondary: [{ value, color? }]   — optional second bar per stratum
  // }
  // options: { title, minY, maxY, yLabel, primaryLabel, secondaryLabel }
  // ─────────────────────────────────────────────────────────────
  static drawStratumComparison(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const {
      title          = '',
      fontSize       = 11,
      padLeft        = 44,
      padRight       = 16,
      padTop         = title ? 28 : 10,
      padBottom      = 46,
      minY           = 0,
      maxY           = 100,
      yLabel         = '',
      primaryLabel   = 'Primary',
      secondaryLabel = 'Secondary',
    } = options;

    const primary      = data?.primary   ?? [];
    const secondary    = data?.secondary ?? [];
    const hasSecondary = secondary.length > 0;
    const nStrata      = primary.length;
    if (nStrata === 0) return;

    const plotW  = W - padLeft - padRight;
    const plotH  = H - padTop - padBottom;
    const yRange = Math.max(1, maxY - minY);
    const groupW = plotW / nStrata;
    const barW   = hasSecondary ? groupW * 0.36 : groupW * 0.58;
    const barGap = hasSecondary ? groupW * 0.06 : 0;

    const toY = (v) => padTop + plotH - ((Math.max(minY, Math.min(maxY, v)) - minY) / yRange) * plotH;

    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 18);
    }

    // Y gridlines + labels
    for (let i = 0; i <= 4; i++) {
      const yv = minY + (yRange / 4) * i;
      const cy = toY(yv);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, cy); ctx.lineTo(padLeft + plotW, cy);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(yv.toFixed(0), padLeft - 4, cy + (fontSize - 1) / 2);
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop); ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    if (yLabel) {
      ctx.save();
      ctx.translate(12, padTop + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }

    const STRATUM_COLORS = ['#a855f7','#3b82f6','#22c55e','#f59e0b','#ef4444'];
    const SHORT_LABELS   = ['Elite','Up-Mid','Lo-Mid','Working','Disenf.'];

    primary.forEach((item, i) => {
      const groupCX = padLeft + i * groupW + groupW / 2;
      const color   = item.color ?? STRATUM_COLORS[i] ?? '#38bdf8';
      const barTop  = toY(item.value ?? minY);
      const barBot  = padTop + plotH;

      // Primary bar (right of center if secondary present, centered otherwise)
      const bx1 = hasSecondary ? groupCX - barGap / 2 - barW : groupCX - barW / 2;
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(bx1, barTop, barW, barBot - barTop);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx1, barTop, barW, barBot - barTop);

      // Value label above primary bar
      ctx.fillStyle = color;
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText((item.value ?? 0).toFixed(0), bx1 + barW / 2, barTop - 3);

      // Secondary bar
      if (hasSecondary && secondary[i] != null) {
        const sec    = secondary[i];
        const sColor = sec.color ?? STRATUM_COLORS[i] ?? '#38bdf8';
        const sTop   = toY(sec.value ?? minY);
        const bx2    = groupCX + barGap / 2;
        ctx.fillStyle = sColor + '55';
        ctx.fillRect(bx2, sTop, barW, barBot - sTop);
        ctx.strokeStyle = sColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(bx2, sTop, barW, barBot - sTop);
        ctx.setLineDash([]);
        ctx.fillStyle = sColor;
        ctx.font = `${fontSize - 1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText((sec.value ?? 0).toFixed(0), bx2 + barW / 2, sTop - 3);
      }

      // Stratum label below x axis
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(SHORT_LABELS[i] ?? '', groupCX, padTop + plotH + 16);
    });

    // Legend (if secondary data present)
    if (hasSecondary) {
      const lx = padLeft;
      const ly = padTop + plotH + 32;
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'left';
      // Primary legend swatch + label
      ctx.fillStyle = '#94a3b8cc';
      ctx.fillRect(lx, ly, 10, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(primaryLabel, lx + 14, ly + 9);
      // Measure first label width so second legend doesn't overlap
      const gap2 = ctx.measureText(primaryLabel).width + 28;
      // Secondary legend swatch + label
      ctx.fillStyle = '#94a3b833';
      ctx.fillRect(lx + gap2, ly, 10, 10);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(lx + gap2, ly, 10, 10);
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(secondaryLabel, lx + gap2 + 14, ly + 9);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CASCADE FLOW — empathy suppression top → bottom of hierarchy (Pass 7)
  // levels: [{
  //   label: string,
  //   empathy: 0–100,
  //   isDisenfranchised?: bool,      — shows cooperation/competition bar instead
  //   cooperationPressure?: 0–100,
  //   competitionPressure?: 0–100,
  // }]
  // options: { title, fontSize }
  // ─────────────────────────────────────────────────────────────
  static drawCascadeFlow(canvas, levels, options = {}) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const {
      title    = 'Empathy Cascade',
      fontSize = 11,
      padSide  = 16,
      padTop   = title ? 28 : 10,
      padBot   = 18,
    } = options;

    if (!levels || levels.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', W / 2, H / 2);
      return;
    }

    if (title) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${fontSize + 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, padSide, 18);
    }

    const n      = levels.length;
    const drawH  = H - padTop - padBot;
    const boxH   = Math.min(46, Math.floor(drawH / n * 0.65));
    const totalBoxH = boxH * n;
    const totalGapH = drawH - totalBoxH;
    const gapH   = Math.max(10, totalGapH / Math.max(1, n - 1));
    const boxW   = W - padSide * 2;

    // empathy → color mapping
    const empColor = (e) => e >= 65 ? '#22c55e' : e >= 40 ? '#f59e0b' : '#ef4444';

    levels.forEach((lv, i) => {
      const y = padTop + i * (boxH + gapH);

      if (lv.isDisenfranchised) {
        // Cooperation / competition tension split
        const coop  = Math.max(0, Math.min(100, lv.cooperationPressure ?? 50));
        const comp  = Math.max(0, Math.min(100, lv.competitionPressure ?? 50));
        const coopW = Math.round((coop / 100) * boxW);
        const compW = Math.round((comp / 100) * boxW);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(padSide, y, boxW, boxH);

        if (coopW > 0) { ctx.fillStyle = '#22c55e66'; ctx.fillRect(padSide, y, coopW, boxH); }
        if (compW > 0) { ctx.fillStyle = '#ef444466'; ctx.fillRect(padSide + boxW - compW, y, compW, boxH); }

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(padSide, y, boxW, boxH);

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          `${lv.label}  ·  Coop ${coop.toFixed(0)} / Comp ${comp.toFixed(0)}`,
          padSide + boxW / 2, y + boxH / 2 + fontSize / 2 - 1
        );
      } else {
        const emp   = Math.max(0, Math.min(100, lv.empathy ?? 50));
        const color = empColor(emp);
        const fillW = Math.round((emp / 100) * boxW);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(padSide, y, boxW, boxH);
        if (fillW > 0) { ctx.fillStyle = color + 'aa'; ctx.fillRect(padSide, y, fillW, boxH); }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(padSide, y, boxW, boxH);

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(lv.label, padSide + 8, y + boxH / 2 + fontSize / 2 - 1);
        ctx.fillStyle = color;
        ctx.textAlign = 'right';
        ctx.fillText(`Empathy ${emp.toFixed(0)}`, padSide + boxW - 8, y + boxH / 2 + fontSize / 2 - 1);
      }

      // Arrow to next level
      if (i < n - 1) {
        const ax  = padSide + boxW / 2;
        const ay0 = y + boxH + 3;
        const ay1 = y + boxH + gapH - 5;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay0);
        ctx.lineTo(ax, ay1);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(ax - 5, ay1 - 7);
        ctx.lineTo(ax,     ay1);
        ctx.lineTo(ax + 5, ay1 - 7);
        ctx.stroke();
      }
    });

    // Color scale legend
    const legY = H - padBot + 5;
    [['#22c55e','High'], ['#f59e0b','Mid'], ['#ef4444','Low']].forEach(([c, lbl], i) => {
      const lx = padSide + i * 60;
      ctx.fillStyle = c + 'aa';
      ctx.fillRect(lx, legY, 10, 8);
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.strokeRect(lx, legY, 10, 8);
      ctx.fillStyle = '#64748b';
      ctx.font = `${fontSize - 1}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(lbl, lx + 13, legY + 7);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // PASS 8: BEHAVIORAL INERTIA CHART
  // Dual-axis line: coefficient (left, blue) + pendingMagnitude (right, orange)
  // inertiaHistory: [{turn, coefficient, pendingMagnitude}]
  // ─────────────────────────────────────────────────────────────
  static drawInertiaChart(canvas, inertiaHistory, options = {}) {
    if (!Array.isArray(inertiaHistory) || inertiaHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { title = 'Behavioral Inertia', fontSize = 11, padSide = 40, padTop = 28, padBot = 28 } = options;
    const chartW = W - padSide * 2;
    const chartH = H - padTop - padBot;

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold ${fontSize + 1}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 16);

    const n = inertiaHistory.length;
    const xOf = i => padSide + (i / Math.max(n - 1, 1)) * chartW;

    // Max pending magnitude for right-axis scaling
    const maxPending = Math.max(10, ...inertiaHistory.map(d => d.pendingMagnitude ?? 0));

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let v = 0; v <= 100; v += 25) {
      const y = padTop + chartH - (v / 100) * chartH;
      ctx.beginPath(); ctx.moveTo(padSide, y); ctx.lineTo(padSide + chartW, y); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(v, padSide - 4, y + 3);
    }

    // Coefficient line (left axis, blue, 0–100)
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.beginPath();
    inertiaHistory.forEach((d, i) => {
      const x = xOf(i);
      const y = padTop + chartH - Utils.clamp((d.coefficient ?? 0) / 100, 0, 1) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pending magnitude line (right axis, orange)
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    inertiaHistory.forEach((d, i) => {
      const x = xOf(i);
      const y = padTop + chartH - Utils.clamp((d.pendingMagnitude ?? 0) / maxPending, 0, 1) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // X-axis labels (turn numbers)
    ctx.fillStyle = '#475569'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'center';
    const xStep = Math.max(1, Math.floor(n / 5));
    for (let i = 0; i < n; i += xStep) {
      const turn = inertiaHistory[i]?.turn ?? i;
      ctx.fillText(turn, xOf(i), padTop + chartH + 12);
    }
    // Always label last point
    if (n > 1) {
      const lastTurn = inertiaHistory[n - 1]?.turn ?? (n - 1);
      ctx.fillText(lastTurn, xOf(n - 1), padTop + chartH + 12);
    }

    // Legend
    const legY = H - padBot + 16;
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(padSide, legY, 16, 3);
    ctx.fillStyle = '#94a3b8'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('Coefficient', padSide + 20, legY + 4);
    ctx.strokeStyle = '#f97316'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padSide + 90, legY + 2); ctx.lineTo(padSide + 106, legY + 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Pending Shift', padSide + 110, legY + 4);
  }

  // ─────────────────────────────────────────────────────────────
  // PASS 8: COOPERATIVE OUTCOMES CHART
  // Dual line: coopOutcomeScore (green) vs behaviorReinforcement.cooperation (blue)
  // coopHistory: [{turn, score, feedback}]; brCoopHistory: [{turn, value}]
  // ─────────────────────────────────────────────────────────────
  static drawCoopOutcomesChart(canvas, coopHistory, brCoopHistory, options = {}) {
    if (!Array.isArray(coopHistory) || coopHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { title = 'Cooperative Outcomes vs. Behavior', fontSize = 11, padSide = 40, padTop = 28, padBot = 28 } = options;
    const chartW = W - padSide * 2;
    const chartH = H - padTop - padBot;

    ctx.fillStyle = '#94a3b8'; ctx.font = `bold ${fontSize + 1}px sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText(title, W / 2, 16);

    const n = coopHistory.length;
    const xOf = i => padSide + (i / Math.max(n - 1, 1)) * chartW;

    // Grid
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for (let v = 0; v <= 100; v += 25) {
      const y = padTop + chartH - (v / 100) * chartH;
      ctx.beginPath(); ctx.moveTo(padSide, y); ctx.lineTo(padSide + chartW, y); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(v, padSide - 4, y + 3);
    }

    // Outcome score fill (shaded, green)
    ctx.beginPath();
    coopHistory.forEach((d, i) => {
      const x = xOf(i);
      const y = padTop + chartH - Utils.clamp((d.score ?? 50) / 100, 0, 1) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(xOf(n - 1), padTop + chartH);
    ctx.lineTo(xOf(0), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = '#22c55e22'; ctx.fill();

    // Outcome score line
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
    ctx.beginPath();
    coopHistory.forEach((d, i) => {
      const x = xOf(i);
      const y = padTop + chartH - Utils.clamp((d.score ?? 50) / 100, 0, 1) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // BR cooperation line (blue, dashed)
    if (Array.isArray(brCoopHistory) && brCoopHistory.length > 0) {
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      const ratio = brCoopHistory.length / n;
      coopHistory.forEach((_, i) => {
        const srcIdx = Math.min(Math.round(i * ratio), brCoopHistory.length - 1);
        const val = brCoopHistory[srcIdx]?.value ?? 50;
        const x = xOf(i);
        const y = padTop + chartH - Utils.clamp(val / 100, 0, 1) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Neutral 50 reference
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    const y50 = padTop + chartH - 0.5 * chartH;
    ctx.beginPath(); ctx.moveTo(padSide, y50); ctx.lineTo(padSide + chartW, y50); ctx.stroke();
    ctx.setLineDash([]);

    // X-axis labels (turn numbers)
    ctx.fillStyle = '#475569'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'center';
    const xStep = Math.max(1, Math.floor(n / 5));
    for (let i = 0; i < n; i += xStep) {
      const turn = coopHistory[i]?.turn ?? i;
      ctx.fillText(turn, xOf(i), padTop + chartH + 12);
    }
    if (n > 1) {
      const lastTurn = coopHistory[n - 1]?.turn ?? (n - 1);
      ctx.fillText(lastTurn, xOf(n - 1), padTop + chartH + 12);
    }

    // Legend
    const legY = H - padBot + 16;
    ctx.fillStyle = '#22c55e'; ctx.fillRect(padSide, legY, 16, 3);
    ctx.fillStyle = '#94a3b8'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('Outcome Score', padSide + 20, legY + 4);
    ctx.strokeStyle = '#38bdf8'; ctx.setLineDash([4, 3]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padSide + 100, legY + 2); ctx.lineTo(padSide + 116, legY + 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('Coop. Behavior', padSide + 120, legY + 4);
  }

  // ─────────────────────────────────────────────────────────────
  // PASS 8: CONSEQUENCE DEFICIT CHART
  // Line with colored fill: green → amber → red as deficit rises
  // deficitHistory: [{turn, level, multiplier}]
  // ─────────────────────────────────────────────────────────────
  static drawDeficitChart(canvas, deficitHistory, options = {}) {
    if (!Array.isArray(deficitHistory) || deficitHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { title = 'Consequence Deficit', fontSize = 11, padSide = 40, padTop = 28, padBot = 28 } = options;
    const chartW = W - padSide * 2;
    const chartH = H - padTop - padBot;

    ctx.fillStyle = '#94a3b8'; ctx.font = `bold ${fontSize + 1}px sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText(title, W / 2, 16);

    const n = deficitHistory.length;
    const xOf = i => padSide + (i / Math.max(n - 1, 1)) * chartW;
    const yOf = v => padTop + chartH - Utils.clamp(v / 100, 0, 1) * chartH;

    // Grid + threshold lines
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for (let v = 0; v <= 100; v += 25) {
      const y = yOf(v);
      ctx.beginPath(); ctx.moveTo(padSide, y); ctx.lineTo(padSide + chartW, y); ctx.stroke();
      ctx.fillStyle = '#475569'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(v, padSide - 4, y + 3);
    }
    // Danger threshold line at 75
    ctx.strokeStyle = '#dc262644'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(padSide, yOf(75)); ctx.lineTo(padSide + chartW, yOf(75)); ctx.stroke();
    ctx.setLineDash([]);

    // Build gradient fill path
    ctx.beginPath();
    deficitHistory.forEach((d, i) => { const x = xOf(i); const y = yOf(d.level ?? 0); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.lineTo(xOf(n - 1), padTop + chartH);
    ctx.lineTo(xOf(0), padTop + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, '#dc262666');   // red at top (high deficit)
    grad.addColorStop(0.35, '#f59e0b55'); // amber at mid
    grad.addColorStop(1, '#22c55e22');   // green at bottom (low deficit)
    ctx.fillStyle = grad; ctx.fill();

    // Deficit line
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    ctx.beginPath();
    deficitHistory.forEach((d, i) => {
      const x = xOf(i); const y = yOf(d.level ?? 0);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Multiplier mini-labels at key turns
    ctx.fillStyle = '#f97316'; ctx.font = `${fontSize - 2}px sans-serif`; ctx.textAlign = 'center';
    deficitHistory.forEach((d, i) => {
      if (i % Math.max(1, Math.floor(n / 5)) === 0 && (d.multiplier ?? 1) > 1.2) {
        ctx.fillText(`${d.multiplier?.toFixed(1)}×`, xOf(i), yOf(d.level ?? 0) - 6);
      }
    });

    // Legend
    const legY = H - padBot + 8;
    ctx.fillStyle = '#ef4444'; ctx.fillRect(padSide, legY, 16, 3);
    ctx.fillStyle = '#94a3b8'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('Deficit Level', padSide + 20, legY + 4);
    ctx.fillStyle = '#f97316'; ctx.fillText('(orange = multiplier labels)', padSide + 95, legY + 4);
  }

  // ─────────────────────────────────────────────────────────────
  // PASS 8: FACILITATION STRUCTURAL CEILING CHART
  // Horizontal grouped bars: ceiling (dimmed) vs current behavior value (solid)
  // ceiling: {cooperation, competition, ...}; current: same shape
  // ─────────────────────────────────────────────────────────────
  static drawFacilitationCeilingChart(canvas, ceiling, current, options = {}) {
    if (!ceiling || !current) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { title = 'Structural Ceiling vs. Current Behavior', fontSize = 10, padLeft = 110, padRight = 12, padTop = title ? 24 : 6, gapY = 4, barH = 12 } = options;
    const keys = ['cooperation','mutualAid','empathy','competition','acquisitiveness','deference','conformity','innovation','individualism','collectivism'];
    const usableW = W - padLeft - padRight;

    if (title) {
      ctx.fillStyle = '#94a3b8'; ctx.font = `bold ${fontSize + 1}px sans-serif`; ctx.textAlign = 'left';
      ctx.fillText(title, padLeft, 16);
    }

    keys.forEach((key, i) => {
      const y = padTop + i * (barH * 2 + gapY * 2);
      const ceilVal = Utils.clamp((ceiling[key] ?? 100) / 100, 0, 1);
      const currVal = Utils.clamp((current[key] ?? 50) / 100, 0, 1);

      // Label
      ctx.fillStyle = '#94a3b8'; ctx.font = `${fontSize}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), padLeft - 4, y + barH - 1);

      // Ceiling bar (dimmed)
      ctx.fillStyle = '#334155'; ctx.fillRect(padLeft, y, usableW, barH);
      ctx.fillStyle = '#3b82f655'; ctx.fillRect(padLeft, y, ceilVal * usableW, barH);
      ctx.fillStyle = '#64748b'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(ceilVal * 100)}`, padLeft + ceilVal * usableW - 2, y + barH - 2);

      // Current value bar (solid)
      const currColor = currVal > ceilVal - 0.05 ? '#22c55e' : currVal > 0.5 ? '#38bdf8' : '#f97316';
      ctx.fillStyle = '#1e293b'; ctx.fillRect(padLeft, y + barH + 2, usableW, barH);
      ctx.fillStyle = currColor; ctx.fillRect(padLeft, y + barH + 2, currVal * usableW, barH);
      ctx.fillStyle = '#e2e8f0'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(currVal * 100)}`, padLeft + currVal * usableW - 2, y + barH * 2);
    });

    // Legend
    const legY = padTop + keys.length * (barH * 2 + gapY * 2) + 4;
    ctx.fillStyle = '#3b82f655'; ctx.fillRect(padLeft, legY, 14, 8);
    ctx.fillStyle = '#64748b'; ctx.font = `${fontSize - 1}px sans-serif`; ctx.textAlign = 'left'; ctx.fillText('Ceiling', padLeft + 18, legY + 7);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(padLeft + 65, legY, 14, 8);
    ctx.fillStyle = '#64748b'; ctx.fillText('Current', padLeft + 83, legY + 7);
  }

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // Pass 9: Cultural Homogeneity History — single line (cyan)
  // history: [{turn, year, value}]
  // ─────────────────────────────────────────────────────────────
  static drawHomogeneityChart(canvas, history, options = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bg   = options.bg ?? '#1a2035';
    const pad  = { top: 24, right: 16, bottom: 28, left: 40 };
    const cW   = W - pad.left - pad.right;
    const cH   = H - pad.top - pad.bottom;
    const data = Array.isArray(history) ? history : [];

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + cH);
    ctx.lineTo(pad.left + cW, pad.top + cH);
    ctx.stroke();

    // Y gridlines + labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'right';
    for (const v of [0, 50, 100]) {
      const y = pad.top + cH - (v / 100) * cH;
      ctx.fillText(v, pad.left - 4, y + 3);
      ctx.setLineDash([2, 4]); ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Band labels
    ctx.fillStyle = '#64748b'; ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillText('← diverse', pad.left + 4, pad.top + cH - (15 / 100) * cH);
    ctx.fillText('← monolithic', pad.left + 4, pad.top + cH - (82 / 100) * cH);

    if (data.length < 2) {
      ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
      ctx.fillText('No data yet', pad.left + cW / 2, pad.top + cH / 2);
      return;
    }

    // Shaded fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    gradient.addColorStop(0, 'rgba(34,211,238,0.18)');
    gradient.addColorStop(1, 'rgba(34,211,238,0.02)');
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      const y = pad.top + cH - Utils.clamp((pt.value ?? 50) / 100, 0, 1) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + cW, pad.top + cH);
    ctx.lineTo(pad.left, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = gradient; ctx.fill();

    // Line
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      const y = pad.top + cH - Utils.clamp((pt.value ?? 50) / 100, 0, 1) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Title
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Cultural Homogeneity (0=diverse, 100=monolithic)', pad.left + cW / 2, 14);
  }

  // ─────────────────────────────────────────────────────────────
  // Pass 9: Cross-Civilization Contagion History — dual line
  // netCoopDelta (green solid), netCynicismDelta (amber dashed)
  // contagionHistory: [{turn, year, netCoopDelta, netCynicismDelta, netEHDelta}]
  // ─────────────────────────────────────────────────────────────
  static drawContagionChart(canvas, contagionHistory, options = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bg   = options.bg ?? '#1a2035';
    const pad  = { top: 24, right: 16, bottom: 38, left: 44 };
    const cW   = W - pad.left - pad.right;
    const cH   = H - pad.top - pad.bottom;
    const data = Array.isArray(contagionHistory) ? contagionHistory : [];

    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Determine symmetric y range
    let maxAbs = 0.005;
    for (const pt of data) {
      maxAbs = Math.max(maxAbs, Math.abs(pt.netCoopDelta ?? 0), Math.abs(pt.netCynicismDelta ?? 0));
    }
    const yRange = maxAbs * 1.25;

    // Axes
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + cH);
    ctx.lineTo(pad.left + cW, pad.top + cH);
    ctx.stroke();

    // Zero line
    const zeroY = pad.top + cH / 2;
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, zeroY); ctx.lineTo(pad.left + cW, zeroY); ctx.stroke();
    ctx.setLineDash([]);

    // Y labels — show numeric values at top, zero, and bottom
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
    const yTop = yRange >= 1 ? `+${yRange.toFixed(0)}` : `+${yRange.toFixed(2)}`;
    const yBot = yRange >= 1 ? `−${yRange.toFixed(0)}` : `−${yRange.toFixed(2)}`;
    ctx.fillText(yTop, pad.left - 4, pad.top + 10);
    ctx.fillText(yBot, pad.left - 4, pad.top + cH - 2);
    ctx.fillText('0', pad.left - 4, zeroY + 3);

    if (data.length < 2) {
      ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
      ctx.fillText('No data yet', pad.left + cW / 2, pad.top + cH / 2);
      return;
    }

    const toY = (v) => zeroY - Utils.clamp(v / yRange, -1, 1) * (cH / 2);

    // Coop delta line (green solid)
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      i === 0 ? ctx.moveTo(x, toY(pt.netCoopDelta ?? 0)) : ctx.lineTo(x, toY(pt.netCoopDelta ?? 0));
    });
    ctx.stroke();

    // Cynicism delta line (amber dashed)
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad.left + (i / (data.length - 1)) * cW;
      i === 0 ? ctx.moveTo(x, toY(pt.netCynicismDelta ?? 0)) : ctx.lineTo(x, toY(pt.netCynicismDelta ?? 0));
    });
    ctx.stroke(); ctx.setLineDash([]);

    // X-axis turn labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    const xLabelY = pad.top + cH + 14;
    const nLabels = Math.min(data.length, 6);
    for (let li = 0; li < nLabels; li++) {
      const idx = li === nLabels - 1 ? data.length - 1 : Math.round(li * (data.length - 1) / (nLabels - 1));
      const x = pad.left + (idx / (data.length - 1)) * cW;
      const turnNum = data[idx]?.turn ?? (idx + 1);
      ctx.fillText(`${turnNum}`, x, xLabelY);
    }

    // Legend
    ctx.font = '9px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = '#22c55e'; ctx.fillText('— coop', pad.left + 2, 14);
    ctx.fillStyle = '#f59e0b'; ctx.fillText('╌ cynicism', pad.left + 52, 14);

    // Footer
    ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
    ctx.fillText('Contagion: + receiving / − emitting', pad.left + cW / 2, H - 6);
  }

  // EXPORT PNG — stub for Track 1; wired to download in Track 2
  // Call this when you want to offer the user a PNG download.
  // Currently functional but not connected to any UI button.
  // ─────────────────────────────────────────────────────────────
  static exportPNG(canvas, filename) {
    try {
      const link = document.createElement('a');
      link.download = (filename ?? 'chart') + '.png';
      link.href     = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('[ChartUtils.exportPNG]', err);
    }
  }
}
