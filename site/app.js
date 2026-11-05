// Page behaviour: theme, plates and lightbox, open problems, the chain demonstration, and the reference library.
(() => {
  const C = window.SURVEY_CONTENT;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
  const file = (n) => `assets/figures/figure-${n}.${n === 1 ? "webp" : "png"}`;

  // Theme: follows the system until the reader picks one.
  const root = document.documentElement;
  $(".theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("lhswe-theme", root.dataset.theme); } catch (e) {}
    document.dispatchEvent(new Event("themechange"));
  });

  // Plates, shown in full with their captions
  const grid = $("[data-plates]");
  grid.innerHTML = C.figures.map(([title, caption, w, h], i) => `
    <figure class="plate">
      <button class="plate-img" type="button" data-open="${i + 1}" aria-label="Enlarge Plate ${ROMAN[i]}: ${esc(title)}">
        <img src="${file(i + 1)}" width="${w}" height="${h}" alt="" loading="lazy" decoding="async">
      </button>
      <figcaption><b>Plate ${ROMAN[i]}</b> <strong>${esc(title)}</strong> ${esc(caption)}</figcaption>
    </figure>`).join("");

  // Lightbox
  const box = $(".lightbox");
  const boxImg = $("img", box), boxCap = $("figcaption", box);
  let shown = 1;
  function show(n) {
    shown = ((n - 1 + C.figures.length) % C.figures.length) + 1;
    const [title, caption, w, h] = C.figures[shown - 1];
    boxImg.src = file(shown); boxImg.width = w; boxImg.height = h; boxImg.alt = `Plate ${ROMAN[shown - 1]}: ${title}`;
    boxCap.innerHTML = `<b>Plate ${ROMAN[shown - 1]}.</b> <strong>${esc(title)}</strong> ${esc(caption)}`;
  }
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) { show(Number(opener.dataset.open)); box.showModal(); }
  });
  $(".lb-close", box).addEventListener("click", () => box.close());
  $(".prev", box).addEventListener("click", () => show(shown - 1));
  $(".next", box).addEventListener("click", () => show(shown + 1));
  box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(shown - 1);
    if (e.key === "ArrowRight") show(shown + 1);
  });

  // Open problems
  let count = 0;
  $("[data-problems]").innerHTML = C.problems.map(([group, rows], g) => `
    <section class="pgroup">
      <h3><span>${String(g + 1).padStart(2, "0")}</span>${esc(group)}</h3>
      ${rows.map(([name, known, next]) => `
        <details class="problem">
          <summary><span class="pn">P${++count}</span><span class="pt">${esc(name)}</span><span class="pi" aria-hidden="true"></span></summary>
          <dl><div><dt>What is known</dt><dd>${esc(known)}</dd></div><div><dt>First experiment</dt><dd>${esc(next)}</dd></div></dl>
        </details>`).join("")}
    </section>`).join("");

  // Chain demonstration: 4 chains × 5 stages, 2 failures to place.
  const chainGrid = $(".chain-grid");
  const ROWS = 4, STAGES = 5;
  let cells = [];
  const layouts = {
    concentrate: [[0, 1], [0, 3]],
    scatter: [[0, 2], [2, 4]],
  };
  function place(failures) {
    cells = Array.from({ length: ROWS }, () => Array(STAGES).fill(true));
    failures.forEach(([r, s]) => (cells[r][s] = false));
    renderChain();
  }
  function renderChain() {
    chainGrid.innerHTML = cells.map((row, r) => {
      const ok = row.every(Boolean);
      return `<div class="chain-row${ok ? " ok" : ""}"><span class="cl">Chain ${r + 1}</span>
        ${row.map((pass, s) => `<button type="button" class="stage ${pass ? "pass" : "fail"}" data-r="${r}" data-s="${s}"
          aria-pressed="${!pass}" aria-label="Chain ${r + 1}, stage ${s + 1}: ${pass ? "passes" : "fails"}">${s + 1}</button>`).join('<span class="link-line" aria-hidden="true"></span>')}
        <span class="cv">${ok ? "succeeds" : "fails"}</span></div>`;
    }).join("");
    const all = cells.flat();
    $("[data-stage]").textContent = `${Math.round((100 * all.filter(Boolean).length) / all.length)}%`;
    $("[data-chainrate]").textContent = `${Math.round((100 * cells.filter((row) => row.every(Boolean)).length) / ROWS)}%`;
  }
  chainGrid.addEventListener("click", (e) => {
    const b = e.target.closest(".stage");
    if (!b) return;
    const r = Number(b.dataset.r), s = Number(b.dataset.s);
    cells[r][s] = !cells[r][s];
    renderChain();
    $(`.stage[data-r="${r}"][data-s="${s}"]`, chainGrid)?.focus();
  });
  $$("[data-chain]").forEach((b) => b.addEventListener("click", () => place(layouts[b.dataset.chain])));
  place(layouts.scatter);

  // Reveal-on-scroll for the evidence chart and sections
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.2 });
  $$(".gap-chart, .sec .body > h2").forEach((el) => io.observe(el));
  // sections and plates can be taller than the viewport, so they reveal as soon as they enter it
  const io2 = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io2.unobserve(en.target); }
  }), { rootMargin: "0px 0px -12% 0px" });
  $$(".sec, .plate").forEach((el) => io2.observe(el));

  // Buttons: the ink spreads from where the pointer enters
  $$(".btn").forEach((b) => b.addEventListener("pointerenter", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--x", `${e.clientX - r.left}px`); b.style.setProperty("--y", `${e.clientY - r.top}px`);
  }));

  // Reading progress: a ridgeline under the header that fills with ink as the page is read
  const prog = document.createElement("div");
  prog.className = "progress"; prog.setAttribute("aria-hidden", "true");
  $(".bar").append(prog);
  function drawRidge() {
    const w = prog.clientWidth;
    let d = "";
    for (let x = 0; x <= w; x += 6) {
      const u = x / w;
      const y = 9 - 6.5 * Math.abs(Math.sin(u * 9.3 + 0.6)) * (0.55 + 0.45 * Math.sin(u * 3.1 + 1.2)) - 1.5 * Math.abs(Math.sin(u * 41));
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    const svg = `<svg width="${w}" viewBox="0 0 ${w} 12"><path d="${d}"/></svg>`;
    prog.innerHTML = `<div class="base">${svg}</div><div class="fill">${svg}</div>`;
  }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  };
  drawRidge(); onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { drawRidge(); onScroll(); });

  // Active section in the navigation
  const links = new Map($$(".bar nav a").map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => a.removeAttribute("aria-current"));
    const id = en.target.id === "questions" ? "findings" : en.target.id === "guidance" ? "measures" : en.target.id;
    links.get(id)?.setAttribute("aria-current", "true");
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main .sec").forEach((s) => spy.observe(s));

  // BibTeX: one block per line, so long values wrap with a hanging indent; textContent keeps the newlines for copying
  const bib = document.getElementById("bibtex");
  bib.innerHTML = bib.textContent.split("\n").map((l) => `<span>${esc(l)}</span>`).join("\n");

  // Copy BibTeX
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const text = document.getElementById(b.dataset.copy).textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; }
    catch (e) { b.textContent = "Select and copy"; }
    setTimeout(() => (b.textContent = "Copy"), 1800);
  }));

  // Reference library
  const lib = $("[data-lib]"), q = $("[data-q]"), countEl = $("[data-count]");
  let refs = [], type = "", timer = 0;
  const TYPE_LABEL = { conference: "Conference", journal: "Journal", preprint: "Preprint", book: "Book", other: "Other" };
  const authorsText = (a) => (a.length > 4 ? `${a.slice(0, 3).join(", ")}, et al.` : a.join(", "));
  function renderLib() {
    const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    const list = refs.filter((r) => (!type || r.type === type || (type === "other" && r.type === "book")) &&
      terms.every((t) => r._hay.includes(t)));
    countEl.textContent = terms.length || type ? `${list.length} matching ${list.length === 1 ? "reference" : "references"}` : "";
    if (!list.length) { lib.innerHTML = '<p class="lib-empty">No reference matches. Try fewer words.</p>'; return; }
    const years = new Map();
    list.forEach((r) => { const y = r.year ?? "Undated"; if (!years.has(y)) years.set(y, []); years.get(y).push(r); });
    lib.innerHTML = [...years].map(([year, items]) => `
      <section class="year"><h3><span>${year}</span><small>${items.length}</small></h3><ol>
      ${items.map((r) => `<li class="ref t-${r.type}">
        ${r.url ? `<a href="${esc(r.url)}" rel="noopener">${esc(r.title)}</a>` : `<span class="rt">${esc(r.title)}</span>`}
        <span class="ra">${esc(authorsText(r.authors))}</span>
        <span class="rv"><i>${esc(TYPE_LABEL[r.type] || r.type)}</i>${r.venue ? ` ${esc(r.venue)}` : ""}</span>
      </li>`).join("")}</ol></section>`).join("");
  }
  q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(renderLib, 120); });
  $("[data-types]").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    type = b.dataset.type;
    $$("[data-types] button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderLib();
  });
  fetch("data/references.json").then((r) => r.json()).then((data) => {
    refs = data
      .map((r) => ({ ...r, _hay: `${r.title} ${r.authors.join(" ")} ${r.venue}`.toLowerCase() }))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
    renderLib();
  }).catch(() => { lib.innerHTML = '<p class="lib-empty">The reference list could not be loaded. It is also on <a href="https://github.com/LongHorizonSWE/Awesome-LongHorizonSWE#references">GitHub</a>.</p>'; });
})();
