// Fig. 0, the hero artwork: a stratigraphy of checkpoints.
//
// Each line is a checkpoint drawn on top of the one before. Lines keep the shape they were born with and sink
// under newer ones, compressing toward the base but never disappearing. Now and then a checkpoint breaks part of
// an earlier one (a red fault); a later checkpoint revises it (a teal seam). The meter reads the toy record:
// R_t is the share of earlier checkpoints with no open fault, F_t also counts the checkpoint still in progress.
(() => {
  const canvas = document.querySelector("canvas.strata");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const meter = {
    t: document.querySelector("[data-t]"),
    r: document.querySelector("[data-r]"),
    f: document.querySelector("[data-f]"),
  };
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  const TAU = 10;            // depth scale, in checkpoints
  const DRAW_MS = 1700;      // time to lay one checkpoint
  const FAULT_P = 0.2;       // chance a new checkpoint breaks an earlier one
  const MAX = 70;

  let W = 0, H = 0, DPR = 1, horizon = 0, colors = {};
  let layers = [], born = 0, progress = 0, last = 0, running = false, visible = true;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    colors = { ink: v("--ink"), soft: v("--ink-soft"), bg: v("--paper"), fault: v("--red"), seam: v("--teal"), sun: v("--amber") };
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, box.width); H = Math.max(1, box.height);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    horizon = W < 820 ? H * 0.34 : H - Math.min(230, window.innerHeight * 0.3);
  }

  // A checkpoint's shape: a few slow harmonics whose phases drift with birth time, so neighbours nest.
  function makeLayer() {
    const b = born++;
    const layer = { b, h: [], fault: null, seam: null };
    for (let j = 0; j < 4; j++) {
      layer.h.push({ f: [1.3, 2.7, 5.1, 9.7][j], a: [1, 0.45, 0.22, 0.1][j], p: b * [0.05, 0.09, 0.13, 0.21][j] + j * 1.7 });
    }
    // revise the oldest open fault, or break an earlier checkpoint
    const open = layers.find((l) => l.fault && !l.fault.fixed);
    if (open && rand() < 0.55) {
      open.fault.fixed = true;
      layer.seam = { x: open.fault.x, w: open.fault.w };
    } else if (layers.length > 3 && rand() < FAULT_P) {
      const target = layers[layers.length - 1 - Math.floor(rand() * Math.min(6, layers.length - 1))];
      if (!target.fault) target.fault = { x: 0.48 + rand() * 0.46, w: 0.04 + rand() * 0.07, fixed: false, at: b };
    }
    layers.push(layer);
    if (layers.length > MAX) layers.shift();
  }

  const depth = (age) => horizon + (H - horizon) * (1 - Math.exp(-age / TAU));
  const shape = (layer, u) => layer.h.reduce((sum, k) => sum + k.a * Math.sin(u * k.f * Math.PI + k.p), 0);

  // Folding shared by every stratum, growing with depth: older ground has been bent by more later work.
  const fold = (u) => 0.62 * Math.sin(u * 2.2 * Math.PI + 0.5) + 0.38 * Math.sin(u * 4.6 * Math.PI + 2.1);

  function yAt(layer, u, age) {
    const spacing = (H - horizon) / TAU * Math.exp(-age / TAU);
    const own = Math.min(spacing * 0.9, 7) * (1 - Math.exp(-age / 3));
    const bend = Math.min(26, (H - horizon) * 0.11) * (1 - Math.exp(-age / 7));
    return depth(age) + shape(layer, u) * own + fold(u) * bend;
  }

  function fadeAt(u) {
    // keep the copy readable on wide screens: strata strengthen from left to right
    if (W < 820) return 1;
    return 0.35 + 0.65 * Math.min(1, Math.max(0, (u - 0.05) / 0.5));
  }

  function strokeRange(layer, age, u0, u1, color, width, alpha) {
    const step = 5 / W;
    ctx.beginPath();
    for (let u = u0; u <= u1 + step; u += step) {
      const uu = Math.min(u, u1);
      const y = yAt(layer, uu, age);
      if (u === u0) ctx.moveTo(uu * W, y); else ctx.lineTo(uu * W, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.stroke();
  }

  function drawSun() {
    const r = W < 820 ? Math.min(W, H) * 0.2 : Math.min(W * 0.13, horizon * 0.42);
    const cx = W * (W < 820 ? 0.72 : 0.79), cy = horizon + r * 0.18;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, horizon); ctx.clip();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = colors.sun; ctx.lineWidth = 1;
    for (let y = cy - r; y < horizon; y += 4.5) {
      // engraving: hatch gets denser toward the horizon
      ctx.globalAlpha = 0.18 + 0.5 * Math.pow((y - (cy - r)) / (horizon - cy + r), 1.4);
      ctx.beginPath(); ctx.moveTo(cx - r, y); ctx.lineTo(cx + r, y); ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, horizon); ctx.clip();
    ctx.globalAlpha = 0.7; ctx.strokeStyle = colors.sun; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.22, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.restore();
  }

  function drawHorizon() {
    const x0 = 0;
    const g = ctx.createLinearGradient(x0, 0, W, 0);
    g.addColorStop(0, "transparent"); g.addColorStop(0.12, colors.ink); g.addColorStop(1, colors.ink);
    ctx.globalAlpha = 0.9; ctx.strokeStyle = g; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(x0, horizon); ctx.lineTo(W, horizon); ctx.stroke();
    // surveyor's ticks along the horizon
    ctx.lineWidth = 1; ctx.strokeStyle = colors.ink;
    for (let x = W - 24, i = 0; x > x0 + 40; x -= 24, i++) {
      ctx.globalAlpha = 0.5 * fadeAt(x / W);
      ctx.beginPath(); ctx.moveTo(x, horizon - (i % 5 === 0 ? 7 : 3.5)); ctx.lineTo(x, horizon); ctx.stroke();
    }
  }

  function draw() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    drawSun();
    const n = layers.length;
    const segs = 24;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let k = 0; k < n; k++) {
      const layer = layers[k];
      const current = k === n - 1;
      const age = n - 1 - k + (current ? 0 : progress);
      if (depth(age) > H + 20) continue;
      const end = current ? progress : 1;
      const deep = Math.exp(-age / (TAU * 1.6));
      const width = 0.55 + 0.75 * deep;
      // ink strata, drawn in short runs so the left fade can vary along the line
      for (let s = 0; s < segs; s++) {
        const u0 = s / segs, u1 = Math.min(end, (s + 1) / segs);
        if (u0 >= end) break;
        strokeRange(layer, age, u0, u1, colors.ink, width, (0.16 + 0.62 * deep) * fadeAt((u0 + u1) / 2));
      }
      if (layer.fault) {
        const f = layer.fault, a0 = f.x - f.w / 2, a1 = f.x + f.w / 2;
        if (!current || a0 < end) strokeRange(layer, age + 0.35, a0, Math.min(a1, current ? end : 1), colors.fault, width + 1, f.fixed ? 0.45 : 0.95);
      }
      if (layer.seam) {
        const sm = layer.seam, a0 = sm.x - sm.w / 2, a1 = sm.x + sm.w / 2;
        if (!current || a0 < end) strokeRange(layer, age, a0, Math.min(a1, current ? end : 1), colors.seam, width + 1.4, 0.95);
      }
      // stratigraphic column labels on the right edge
      if (!current && layer.b % 5 === 0 && age < 26 && W >= 520) {
        ctx.globalAlpha = 0.55 * deep + 0.15;
        ctx.fillStyle = colors.soft; ctx.font = "10px 'IBM Plex Mono', monospace"; ctx.textAlign = "right";
        ctx.fillText(`t ${layer.b}`, W - 10, yAt(layer, 0.985, age) - 3);
      }
    }
    drawHorizon();
    // the agent at work: a point at the tip of the checkpoint being laid
    if (n && running) {
      const layer = layers[n - 1];
      const x = progress * W, y = yAt(layer, progress, 0);
      ctx.globalAlpha = 0.18; ctx.fillStyle = colors.seam;
      ctx.beginPath(); ctx.arc(x, y, 7 + 2 * Math.sin(last / 220), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = colors.ink;
      ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function updateMeter() {
    const earlier = layers.slice(0, -1);
    const open = earlier.filter((l) => l.fault && !l.fault.fixed).length;
    const r = earlier.length ? (earlier.length - open) / earlier.length : 1;
    const f = layers.length ? (earlier.length - open + (progress >= 1 ? 1 : 0)) / layers.length : 1;
    if (meter.t) meter.t.textContent = String(born - 1);
    if (meter.r) meter.r.textContent = r.toFixed(2);
    if (meter.f) meter.f.textContent = f.toFixed(2);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(64, now - (last || now));
    last = now;
    progress += dt / DRAW_MS;
    if (progress >= 1) { progress = 0; makeLayer(); updateMeter(); }
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || still.matches || !visible || document.hidden) return;
    running = true; last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  function staticFrame() { progress = 1; draw(); updateMeter(); }

  readColors();
  resize();
  for (let i = 0; i < 34; i++) makeLayer();
  updateMeter();
  if (still.matches) staticFrame(); else { draw(); start(); }

  new ResizeObserver(() => { resize(); still.matches ? staticFrame() : draw(); }).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  still.addEventListener("change", () => (still.matches ? (stop(), staticFrame()) : start()));
  document.addEventListener("themechange", () => { readColors(); draw(); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); draw(); });
})();
