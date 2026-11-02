// The hero painting: an endless handscroll in the blue-and-green manner of Chinese landscape (qinglü shanshui).
//
// Each range is painted once into a seamless strip (mineral azurite on the peaks, malachite on the slopes, ochre in
// the foothills, hemp-fibre texture strokes, moss dots, pines), then the strips unroll at different speeds, nearer
// ranges faster, as if the scroll were being opened, while a skein of wild geese crosses the sky. A long journey laid
// down range over range.
(() => {
  const canvas = document.querySelector("canvas.scroll");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const darkQ = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : darkQ.matches; };

  // Daylight is mineral pigment on silk; night is the gold-outlined manner (jinbi) on dark silk.
  const PALETTES = {
    light: { silk: "#f2ede3", azure: "#2a5f8f", deep: "#1b4266", mal: "#3e8a6a", ochre: "#b9884c", line: "#22313a", moss: "#173b30", pine: "#2b5b45", goose: "#2b2a24" },
    dark: { silk: "#0e1312", azure: "#3a6e98", deep: "#22496c", mal: "#33775c", ochre: "#3b3f33", line: "#d1ad66", moss: "#0b1d17", pine: "#1f4a38", goose: "#dccb9c" },
  };

  // From the far range to the near bank. base and amp are fractions of the hero height; speed is px per second.
  const LAYERS = [
    { base: 0.52, amp: 0.24, depth: 0.2, speed: 3.5, haze: 0.62, seed: 11 },
    { base: 0.6, amp: 0.27, depth: 0.22, speed: 6.5, haze: 0.4, seed: 23 },
    { base: 0.68, amp: 0.2, depth: 0.2, speed: 10, haze: 0.18, seed: 37 },
    { base: 0.83, amp: 0.13, depth: 0.2, speed: 19, haze: 0.04, seed: 53, pines: 1 },
    { base: 0.95, amp: 0.09, depth: 0.12, speed: 27, haze: 0, seed: 71, pines: 1.6 },
  ];

  let W = 0, H = 0, DPR = 1, L = 0, P = PALETTES.light, strips = [], t = 0, last = 0, running = false, visible = true;

  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const rgba = (h, a) => `rgba(${hex(h).join(",")},${a})`;

  // A seamless ridge on [0, 1): a crowd of pointed peaks (the highest one wins at each point), roughened by fine
  // ridged harmonics, wrapping around so the strip tiles without a seam.
  function ridge(seed, count) {
    const r = rng(seed);
    const peaks = Array.from({ length: count }, () => {
      const tall = r() < 0.3;
      return { x: r(), h: tall ? 0.65 + r() * 0.35 : 0.2 + r() * 0.4, w: (tall ? 0.6 : 1) * (0.5 + r() * 0.8) / count * 2.4, p: 1.2 + r() * 0.8 };
    });
    const rough = [13, 23, 37, 61].map((n, i) => ({ n, a: 0.05 / (i + 1), p: r() * Math.PI }));
    return (x) => {
      x = ((x % 1) + 1) % 1;
      let v = 0;
      for (const k of peaks) {
        let d = Math.abs(x - k.x); d = Math.min(d, 1 - d);
        if (d < k.w) v = Math.max(v, k.h * Math.pow(1 - d / k.w, k.p));
      }
      for (const w of rough) v += w.a * (1 - Math.abs(Math.sin(Math.PI * w.n * x + w.p))) * (0.3 + v);
      return Math.min(1, v);
    };
  }

  function makeStrip(spec) {
    const c = document.createElement("canvas");
    const g = c.getContext("2d");
    const r = rng(spec.seed || 5);
    const f = ridge(spec.seed, Math.round(L / (spec.pines ? 150 : 120)));
    const yR = (x) => H * (spec.base - spec.amp * f(x / L));
    const top = H * (spec.base - spec.amp) - 34;
    const bottom = Math.min(H, H * (spec.base + spec.depth));
    const h = bottom - top;
    c.width = Math.round(L * DPR); c.height = Math.round(h * DPR); g.scale(DPR, DPR); g.translate(0, -top);
    const step = 3;

    const outline = () => { g.beginPath(); g.moveTo(0, bottom); for (let x = 0; x <= L; x += step) g.lineTo(x, yR(x)); g.lineTo(L, bottom); g.closePath(); };
    const far = (col, a = 1) => rgba(mix(col, P.silk, spec.haze), a);
    const band = (bottom - top) * 0.78;

    // mineral wash: azurite on the high peaks, malachite on the slopes, measured from each column's own ridge; the
    // ochre foothills and the mist below sit at fixed heights, so the colour bands run level across the range.
    // Columns are laid in whole device pixels, clipped to the ridge, so they neither overlap nor leave a seam.
    g.save(); outline(); g.clip();
    g.setTransform(1, 0, 0, 1, 0, -top * DPR);
    const yOchre = H * spec.base + band * 0.05;
    for (let xd = 0; xd < c.width; xd += 2) {
      const x = (xd + 1) / DPR, y = yR(x) - 4, lift = f(x / L), span = bottom - y;
      const at = (yy) => Math.min(0.99, Math.max(0, (yy - y) / span));
      const gr = g.createLinearGradient(0, y * DPR, 0, bottom * DPR);
      const sOch = Math.max(at(yOchre), 0.3), sMal = Math.min(at(y + band * 0.24), sOch - 0.08);
      gr.addColorStop(0, far(mix(P.deep, P.mal, Math.max(0, 1 - lift * 1.8))));
      gr.addColorStop(Math.min(at(y + band * 0.08), sMal - 0.04), far(mix(P.azure, P.mal, Math.max(0, 1 - lift * 1.4))));
      gr.addColorStop(sMal, far(P.mal)); gr.addColorStop(sOch, far(P.ochre, 0.62)); gr.addColorStop(1, rgba(P.silk, 0));
      g.fillStyle = gr; g.fillRect(xd, y * DPR, 2, span * DPR);
    }
    g.restore();

    g.save(); outline(); g.clip();
    // folds: inner contours that repeat the ridge lower down, giving each massif its stacked rock faces
    for (let k = 1; k <= 3; k++) {
      const drop = band * (0.1 + k * 0.11), ph = r() * 0.3;
      g.beginPath();
      for (let x = 0; x <= L; x += step) {
        const y = yR(x + (k * 23 + ph * L) % 60) + drop * (0.7 + 0.3 * f((x / L + ph) % 1));
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.strokeStyle = rgba(P.line, (0.22 - k * 0.04) * (1 - spec.haze * 0.8)); g.lineWidth = 0.8; g.stroke();
    }
    // hemp-fibre strokes: long, wavering lines that fall from the crest along the slope
    const n = Math.round(L / 3);
    for (let i = 0; i < n; i++) {
      const x0 = r() * L;
      const len = (18 + r() * 70) * (0.5 + spec.amp * 2.5);
      let x = x0, y = yR(x0) + 1 + r() * 4;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        const slope = (yR(x + 5) - yR(x - 5)) / 10;          // run downhill, more steeply as the line descends
        x += Math.sign(slope) * Math.min(1.6, Math.abs(slope)) * (len / 6) * (0.75 - k * 0.1);
        y += len / 6;
        g.lineTo(x + (r() - 0.5) * 1.6, y);
      }
      g.strokeStyle = rgba(r() < 0.8 ? P.deep : P.line, (0.1 + r() * 0.18) * (1 - spec.haze * 0.85));
      g.lineWidth = 0.5 + r() * 0.7; g.stroke();
    }
    g.restore();

    // drifting mist that cuts the range into floating peaks
    for (let i = 0; i < L / 420; i++) {
      const x = r() * L, y = bottom - (bottom - top) * (0.18 + r() * 0.3), rw = 160 + r() * 260, rh = 7 + r() * 10;
      for (const dx of [0, L, -L]) {
        const mg = g.createRadialGradient(x + dx, y, 0, x + dx, y, rw);
        mg.addColorStop(0, rgba(P.silk, 0.6)); mg.addColorStop(1, rgba(P.silk, 0));
        g.save(); g.translate(x + dx, y); g.scale(1, rh / rw); g.translate(-x - dx, -y);
        g.fillStyle = mg; g.beginPath(); g.arc(x + dx, y, rw, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }

    // the ridge line, then moss dots along it
    g.beginPath(); for (let x = 0; x <= L; x += step) x ? g.lineTo(x, yR(x)) : g.moveTo(x, yR(x));
    g.strokeStyle = rgba(P.line, 0.55 * (1 - spec.haze * 0.75)); g.lineWidth = 1.1; g.stroke();
    for (let i = 0; i < L / 9; i++) {
      const x = r() * L, y = yR(x) + r() * 18;
      g.fillStyle = rgba(P.moss, (0.25 + r() * 0.45) * (1 - spec.haze));
      g.beginPath(); g.ellipse(x, y, 1 + r() * 1.3, 0.7 + r() * 0.8, 0, 0, Math.PI * 2); g.fill();
    }
    // pines on the near ranges: a leaning trunk and tiers of needle clusters, each a fan of short strokes
    if (spec.pines) {
      g.lineCap = "round";
      for (let i = 0; i < (L / 70) * spec.pines; i++) {
        const x = r() * L, y = yR(x) + 2, s = (0.7 + r() * 0.6) * spec.pines * 0.8;
        if (x < 24 || x > L - 24) continue;
        const lean = (r() - 0.5) * 5 * s, hT = (15 + r() * 8) * s;
        g.strokeStyle = rgba(P.line, 0.8); g.lineWidth = 0.9 * s;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * 0.2, y - hT * 0.5, x + lean, y - hT); g.stroke();
        for (let k = 0; k < 4; k++) {
          const u = 0.38 + k * 0.2, side = k % 2 ? 1 : -1;
          const cx = x + lean * u + side * 2.2 * s * (1 - u * 0.5), cy = y - hT * u, rad = (6 - k * 1) * s;
          g.fillStyle = rgba(P.pine, 0.32);
          g.beginPath(); g.ellipse(cx, cy - rad * 0.18, rad, rad * 0.32, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = rgba(P.pine, 0.95); g.lineWidth = 0.65 * Math.min(1.4, s);
          g.beginPath();
          for (let j = 0; j <= 8; j++) {
            const a = Math.PI * (1.04 + 0.92 * j / 8);
            g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.5);
          }
          g.stroke();
        }
      }
    }
    return { c, y: top, spec };
  }

  function build() {
    const box = canvas.getBoundingClientRect();
    W = Math.max(1, box.width); H = Math.max(1, box.height);
    DPR = Math.min(window.devicePixelRatio || 1, W < 820 ? 1.5 : 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    L = Math.max(1600, Math.min(2800, Math.ceil(W * 1.4)));
    P = isDark() ? PALETTES.dark : PALETTES.light;
    strips = LAYERS.map(makeStrip);
  }

  // A skein of wild geese in a chevron, each bird two brush strokes that beat slowly, crossing from left to right.
  const GEESE = [[0, 0], [-1, -1], [-2, -2], [-3, -3], [-1, 1], [-2, 2], [-3, 3], [-4, 4]].map(([k, side], i) => ({
    dx: k * 17 + Math.sin(i * 7.3) * 3, dy: side * 9 + Math.cos(i * 3.1) * 2, ph: i * 1.7, s: 6.6 - Math.abs(k) * 0.25,
  }));
  function drawGeese() {
    const span = W + 320;
    const lead = ((t * 15 + W * 0.66 + 160) % span) - 160;
    const top = H * (W < 820 ? 0.42 : 0.13);
    const scale = W < 820 ? 0.85 : 1;
    ctx.save();
    ctx.strokeStyle = P.goose; ctx.globalAlpha = 0.72; ctx.lineWidth = 1.35; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const g of GEESE) {
      const x = lead + g.dx * scale, y = top + g.dy * scale + Math.sin(t * 0.9 + g.ph) * 1.6;
      // two wings arching up from the body, their tips rising and falling with the beat
      const s = g.s * scale, beat = Math.sin(t * 3 + g.ph), arch = s * (0.55 + 0.25 * beat), tip = s * 0.35 * beat;
      ctx.beginPath();
      ctx.moveTo(x - s, y - tip);
      ctx.quadraticCurveTo(x - s * 0.5, y - arch, x, y);
      ctx.quadraticCurveTo(x + s * 0.5, y - arch, x + s * 0.95, y - tip);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of strips) {
      const off = (t * s.spec.speed) % L;
      for (let x = -off; x < W; x += L) ctx.drawImage(s.c, x, s.y, L, s.c.height / DPR);
    }
    // the scroll fades into bare silk at its lower edge
    const fade = ctx.createLinearGradient(0, H * 0.84, 0, H);
    fade.addColorStop(0, rgba(P.silk, 0)); fade.addColorStop(1, rgba(P.silk, 1));
    ctx.fillStyle = fade; ctx.fillRect(0, H * 0.84, W, H * 0.16 + 1);
    drawGeese();
    // wash of bare silk behind the title, as a painter leaves space for the inscription
    const wash = W < 820 ? ctx.createLinearGradient(0, 0, 0, H) : ctx.createLinearGradient(0, 0, W, 0);
    if (W < 820) { wash.addColorStop(0, rgba(P.silk, 0.9)); wash.addColorStop(0.55, rgba(P.silk, 0.82)); wash.addColorStop(0.75, rgba(P.silk, 0)); }
    else { wash.addColorStop(0, rgba(P.silk, 0.9)); wash.addColorStop(0.3, rgba(P.silk, 0.78)); wash.addColorStop(0.52, rgba(P.silk, 0)); }
    ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);
  }

  function frame(now) {
    if (!running) return;
    t += Math.min(0.064, (now - (last || now)) / 1000);
    last = now;
    draw();
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || still.matches || !visible || document.hidden) return;
    running = true; last = 0; requestAnimationFrame(frame);
  }
  const stop = () => { running = false; };
  const rebuild = () => { build(); draw(); };

  rebuild(); start();
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(rebuild, 120); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  still.addEventListener("change", () => (still.matches ? stop() : start()));
  document.addEventListener("themechange", rebuild);
  darkQ.addEventListener("change", rebuild);
})();
