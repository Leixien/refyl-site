// Refyl home: Italy drawn by its fuel stations, then the cheapest near you.
// Location never leaves the browser: the only request is the public price file.
(() => {
  "use strict";
  const EN = document.documentElement.lang === "en";
  const T = EN ? {
    loadingDots: "Drawing Italy…",
    loadingPrices: "Loading today's prices…",
    loaded: (n, d) => `${n} stations, official MIMIT prices of ${d}`,
    counting: (n, t, d) => `Painting the prices of ${d}: ${n} / ${t}`,
    failed: "Couldn't load prices. Check the connection and reload the page.",
    locating: "Finding your position…",
    denied: "Location blocked. Type a town instead, or tap the map.",
    noGeo: "This browser can't share its position. Type a town, or tap the map.",
    noCity: (q) => `No stations in “${q}”. Try the town's full name.`,
    none: "No stations with this fuel within 25 km. Try another fuel or tap elsewhere on the map.",
    within: (k) => `Cheapest within ${k} km`,
    self: "self-service", served: "attended",
    today: "updated today", ago: (d) => d === 1 ? "updated yesterday" : `updated ${d} days ago`,
    below: (d, m) => `${d} below today's national median (${m})`,
    above: (d, m) => `${d} above today's national median (${m})`,
    at: (m) => `at today's national median (${m})`,
    median: "national median", here: "you", tapHint: "Tap the map to search there",
    unit: "€/l", locale: "en-GB",
    map: (f) => `Map of Italy made of every fuel station; ${f} prices`,
  } : {
    loadingDots: "Disegno l'Italia…",
    loadingPrices: "Carico i prezzi di oggi…",
    loaded: (n, d) => `${n} distributori, prezzi ufficiali MIMIT del ${d}`,
    counting: (n, t, d) => `Dipingo i prezzi del ${d}: ${n} / ${t}`,
    failed: "Non riesco a caricare i prezzi. Controlla la connessione e ricarica la pagina.",
    locating: "Cerco la tua posizione…",
    denied: "Posizione bloccata. Scrivi un comune, oppure tocca la mappa.",
    noGeo: "Questo browser non condivide la posizione. Scrivi un comune, oppure tocca la mappa.",
    noCity: (q) => `Nessun distributore a “${q}”. Prova con il nome completo del comune.`,
    none: "Nessun distributore con questo carburante entro 25 km. Prova un altro carburante o tocca un altro punto.",
    within: (k) => `Il più economico entro ${k} km`,
    self: "self", served: "servito",
    today: "aggiornato oggi", ago: (d) => d === 1 ? "aggiornato ieri" : `aggiornato ${d} giorni fa`,
    below: (d, m) => `${d} sotto la mediana nazionale di oggi (${m})`,
    above: (d, m) => `${d} sopra la mediana nazionale di oggi (${m})`,
    at: (m) => `alla mediana nazionale di oggi (${m})`,
    median: "mediana nazionale", here: "tu", tapHint: "Tocca la mappa per cercare lì",
    unit: "€/l", locale: "it-IT",
    map: (f) => `Mappa d'Italia fatta di tutti i distributori; prezzi ${f}`,
  };

  const DATA_URL = "https://leixien.github.io/FuelFinder_DATA/stations.json";
  const ASSETS = new URL(".", document.currentScript.src).href;
  const LON0 = 6.6, LON1 = 18.6, LAT0 = 35.4, LAT1 = 47.2;
  const KX = Math.cos(41.5 * Math.PI / 180);
  const STALE_DAYS = 7, DAY = 864e5;
  const PAINT = "238,237,230", GREEN = "#30D158", YELLOW = "#F2C230";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (s) => document.querySelector(s);
  const canvas = $("#map"), ctx = canvas.getContext("2d");
  const railCanvas = $("#rail"), rctx = railCanvas.getContext("2d");
  const statusEl = $("#status"), loadingEl = $("#loading");
  const bestEl = $("#best"), listEl = $("#results"), cityInput = $("#city-q");

  const nf3 = new Intl.NumberFormat(T.locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const nf1 = new Intl.NumberFormat(T.locale, { maximumFractionDigits: 1 });
  const df = new Intl.DateTimeFormat(T.locale, { day: "numeric", month: "long", year: "numeric" });

  // ---------- state ----------
  let N = 0, px, py;                 // projected positions (degrees, x scaled by KX)
  let stations = null;               // full records once prices arrive
  let price, selfFlag, updMs;        // per-station values for the chosen fuel
  let stats = null;                  // { p10, median, lo, hi, sorted }
  let fuel = "benzina";
  let near = null;                   // { lat, lon, radius, items: [{i, km}], sel }
  let W = 0, H = 0, dpr = 1;
  const view = { cx: 0, cy: 0, s: 1, sy: 0 };  // sy: screen y of the view centre
  let anim = null;

  const project = (lon, lat) => [(lon - LON0) * KX, LAT1 - lat];

  function fitItaly() {
    const w = (LON1 - LON0) * KX, h = LAT1 - LAT0;
    return { cx: w / 2 + 0.25, cy: h / 2 - 0.15, s: Math.min(W / w, H / h) * 0.98, sy: H / 2 };
  }
  function fitAround(lat, lon, km) {
    const [x, y] = project(lon, lat);
    const deg = (km * 2.3) / 111;
    // the canvas grows with the results list: aim at the part of it that is on screen
    const top = canvas.getBoundingClientRect().top;
    const visH = Math.max(320, Math.min(H, innerHeight - Math.max(0, top)));
    return { cx: x, cy: y, s: Math.min(W, visH) / deg, sy: Math.min(H / 2, Math.max(0, -top) + visH / 2) };
  }

  // ---------- canvas ----------
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const rr = railCanvas.getBoundingClientRect();
    railCanvas.width = Math.round(rr.width * dpr); railCanvas.height = Math.round(rr.height * dpr);
    const target = near ? fitAround(near.lat, near.lon, near.radius) : fitItaly();
    Object.assign(view, target);
    draw(); drawRail();
  }

  function toScreen(i) {
    return [(px[i] - view.cx) * view.s + W / 2, (py[i] - view.cy) * view.s + view.sy];
  }

  function draw() {
    if (!N || !W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const r = Math.max(1.1, Math.min(5, view.s * 0.012));
    const now = Date.now();
    // paint buckets, drawn in one pass each
    const buckets = [[], [], [], [], []]; // 0 none, 1 stale, 2 fresh, 3 cheapest decile, 4 not yet painted
    for (let i = 0; i < N; i++) {
      const x = (px[i] - view.cx) * view.s + W / 2;
      if (x < -6 || x > W + 6) continue;
      const y = (py[i] - view.cy) * view.s + view.sy;
      if (y < -6 || y > H + 6) continue;
      let b = 2;
      if (reveal && py[i] > reveal.y) b = 4;
      else if (price) {
        const p = price[i];
        if (Number.isNaN(p)) b = 0;
        else if (now - updMs[i] > STALE_DAYS * DAY) b = 1;
        else if (stats && p <= stats.p10) b = 3;
      }
      buckets[b].push(x, y);
    }
    const styles = [`rgba(${PAINT},.13)`, `rgba(${PAINT},.3)`, `rgba(${PAINT},${price ? 0.78 : 0.55})`, GREEN, `rgba(${PAINT},.55)`];
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = styles[b];
      const a = buckets[b];
      for (let k = 0; k < a.length; k += 2) ctx.fillRect(a[k] - r / 2, a[k + 1] - r / 2, r, r);
    }
    if (reveal) {
      // the line-painting machine: a fresh stripe sweeping north to south
      const sy = (reveal.y - view.cy) * view.s + view.sy;
      ctx.fillStyle = `rgb(${PAINT})`; ctx.fillRect(0, sy - 1.5, W, 3);
      ctx.fillStyle = YELLOW; ctx.fillRect(W - 46, sy - 9, 34, 18);
      if (reveal.label) paintText(reveal.label, W - 56, sy - 12, 30, YELLOW, "right");
    }
    if (near) drawNear();
    else if (stats && stations && !reveal) drawRestBest();
  }

  // road lettering on the canvas: same face, stretched tall like the painted words
  function paintText(text, x, y, size, color, align = "center") {
    ctx.save();
    ctx.translate(x, y); ctx.scale(1, 1.6);
    ctx.font = `900 ${size}px Road, "Arial Narrow", sans-serif`;
    ctx.textAlign = align; ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round"; ctx.lineWidth = 6; ctx.strokeStyle = "rgba(49,52,55,.85)";
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color; ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  function drawRestBest() {
    const i = stats.minI;
    const [x, y] = toScreen(i);
    ctx.fillStyle = GREEN;
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    const right = x < W * 0.6;
    const ly = Math.max(y - 4, 56); // stay clear of the source line at the top
    paintText(nf3.format(price[i]), x + (right ? 14 : -14), ly, 38, GREEN, right ? "left" : "right");
    ctx.save(); ctx.font = "600 13px -apple-system, Helvetica, Arial, sans-serif"; ctx.fillStyle = `rgb(${PAINT})`;
    ctx.textAlign = right ? "left" : "right";
    ctx.lineJoin = "round"; ctx.lineWidth = 4; ctx.strokeStyle = "rgba(49,52,55,.85)";
    ctx.strokeText(nice(stations[i].city || ""), x + (right ? 16 : -16), ly + 20);
    ctx.fillText(nice(stations[i].city || ""), x + (right ? 16 : -16), ly + 20);
    ctx.restore();
  }

  function drawNear() {
    const [ux, uy] = [(project(near.lon, near.lat)[0] - view.cx) * view.s + W / 2, (project(near.lon, near.lat)[1] - view.cy) * view.s + view.sy];
    // search radius, painted as a dashed ring
    const rpx = (near.radius / 111) * view.s;
    ctx.save();
    ctx.setLineDash([14, 12]); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(${PAINT},.55)`;
    ctx.beginPath(); ctx.arc(ux, uy, rpx, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // you
    ctx.fillStyle = YELLOW;
    ctx.beginPath(); ctx.arc(ux, uy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#23221E"; ctx.lineWidth = 2; ctx.stroke();
    // results, last first so the cheapest sits on top
    for (let k = near.items.length - 1; k >= 0; k--) {
      const { i } = near.items[k];
      const [x, y] = toScreen(i);
      const sel = k === near.sel;
      ctx.fillStyle = sel ? GREEN : `rgb(${PAINT})`;
      ctx.beginPath(); ctx.arc(x, y, sel ? 9 : 6, 0, Math.PI * 2); ctx.fill();
      paintText(nf3.format(price[i]), x, y - (sel ? 16 : 12), sel ? 34 : 22, sel ? GREEN : `rgb(${PAINT})`);
    }
    // the town is painted where the ring meets the bottom, clear of the prices clustered at the centre
    if (near.label) paintText(near.label.toUpperCase(), ux, Math.min(uy + rpx * 0.82, view.sy * 2 - 24, H - 24), 40, `rgba(${PAINT},.9)`);
  }

  function drawRail() {
    if (!stats || !railCanvas.width) return;
    const w = railCanvas.width / dpr, h = railCanvas.height / dpr;
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rctx.clearRect(0, 0, w, h);
    const { lo, hi, sorted, median } = stats;
    const X = (p) => 4 + ((p - lo) / (hi - lo)) * (w - 8);
    // the edge line
    rctx.fillStyle = `rgba(${PAINT},.9)`;
    rctx.fillRect(0, h - 6, w, 4);
    // every station lands in a 2px bin: the stack height (log) is how many sell at that price
    const bins = new Uint16Array(Math.ceil(w / 2));
    for (const p of sorted) if (p >= lo && p <= hi) bins[Math.min(bins.length - 1, Math.floor(X(p) / 2))]++;
    const top = Math.log1p(Math.max(...bins)) || 1;
    rctx.fillStyle = `rgba(${PAINT},.55)`;
    bins.forEach((c, k) => { if (c) { const bh = Math.max(2, (Math.log1p(c) / top) * (h - 14)); rctx.fillRect(k * 2, h - 7 - bh, 1.5, bh); } });
    rctx.fillStyle = YELLOW; rctx.fillRect(X(median) - 2, 4, 4, h - 10);
    if (near && near.items.length) {
      const p = price[near.items[near.sel].i];
      rctx.fillStyle = GREEN; rctx.fillRect(Math.max(0, X(Math.max(p, lo)) - 3), 0, 6, h - 6);
    }
    $("#rail-lo").textContent = nf3.format(lo);
    $("#rail-mid").textContent = nf3.format(median);
    $("#rail-hi").textContent = nf3.format(hi);
  }

  // ---------- data ----------
  async function loadDots() {
    loadingEl.textContent = T.loadingDots;
    const buf = await (await fetch(ASSETS + "dots.bin")).arrayBuffer();
    const u = new Uint16Array(buf);
    N = u.length / 2; px = new Float32Array(N); py = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const [x, y] = project(LON0 + (u[2 * i] / 65535) * (LON1 - LON0), LAT0 + (u[2 * i + 1] / 65535) * (LAT1 - LAT0));
      px[i] = x; py[i] = y;
    }
    draw();
  }

  let dataPromise = null;
  function loadPrices() {
    if (dataPromise) return dataPromise;
    loadingEl.hidden = false; loadingEl.textContent = T.loadingPrices;
    dataPromise = fetch(DATA_URL).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((d) => {
      stations = d.stations.filter((s) => s.lat != null && s.lon != null);
      N = stations.length; px = new Float32Array(N); py = new Float32Array(N);
      stations.forEach((s, i) => { const [x, y] = project(s.lon, s.lat); px[i] = x; py[i] = y; });
      const ref = d.prices_reference_date ? df.format(new Date(d.prices_reference_date + "T12:00:00")) : "";
      buildCities();
      setFuel(fuel);
      // searches await this promise, so the flight always starts after the paint machine has finished
      return startReveal(ref);
    }).catch(() => {
      loadingEl.textContent = T.failed; dataPromise = null;
      throw new Error("prices");
    });
    return dataPromise;
  }

  // prices arrive: repaint Italy from north to south, counting the stations as the stripe passes
  let reveal = null;
  function startReveal(ref) {
    const nf = new Intl.NumberFormat(T.locale), total = nf.format(N);
    if (reduce || !W) { loadingEl.textContent = T.loaded(total, ref); draw(); return Promise.resolve(); }
    const sorted = Float32Array.from(py).sort();
    const top = sorted[0], bottom = sorted[N - 1], t0 = performance.now(), dur = 1900;
    reveal = { y: top, label: "" };
    loadingEl.setAttribute("aria-busy", "true"); // one announcement at the end, not one per frame
    let done;
    const finished = new Promise((r) => { done = r; });
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      reveal.y = top + (bottom - top) * e;
      let lo = 0, hi = N;
      while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] <= reveal.y) lo = m + 1; else hi = m; }
      reveal.label = nf.format(lo);
      loadingEl.textContent = T.counting(reveal.label, total, ref);
      if (k < 1) { draw(); requestAnimationFrame(tick); }
      else { reveal = null; loadingEl.removeAttribute("aria-busy"); loadingEl.textContent = T.loaded(total, ref); draw(); done(); }
    };
    requestAnimationFrame(tick);
    return finished;
  }

  function setFuel(f) {
    fuel = f;
    if (!stations) return;
    price = new Float32Array(N).fill(NaN); selfFlag = new Uint8Array(N); updMs = new Float64Array(N);
    const fresh = [];
    const now = Date.now();
    let minI = -1;
    for (let i = 0; i < N; i++) {
      for (const p of stations[i].prices) {
        if (p.fuel !== f || !(p.price > 0.3 && p.price < 4)) continue;
        if (Number.isNaN(price[i]) || p.price < price[i]) {
          price[i] = p.price; selfFlag[i] = p.self ? 1 : 0; updMs[i] = Date.parse(p.updated_at) || 0;
        }
      }
      if (!Number.isNaN(price[i]) && now - updMs[i] <= STALE_DAYS * DAY) { fresh.push(price[i]);  }
    }
    fresh.sort((a, b) => a - b);
    const q = (t) => fresh[Math.min(fresh.length - 1, Math.floor(t * fresh.length))];
    // the resting highlight skips the bottom 0.5%: those are usually reporting errors
    const floor = fresh.length ? q(0.005) : 0;
    for (let i = 0; i < N; i++) if (!Number.isNaN(price[i]) && price[i] >= floor && now - updMs[i] <= STALE_DAYS * DAY && (minI < 0 || price[i] < price[minI])) minI = i;
    stats = fresh.length ? { sorted: fresh, p10: q(0.1), median: q(0.5), lo: q(0.005), hi: q(0.995), minI } : null;
    canvas.setAttribute("aria-label", T.map(f));
    if (near) search(near.lat, near.lon, false, near.label); else { draw(); drawRail(); }
  }

  // ---------- search ----------
  const km = (aLat, aLon, bLat, bLon) => {
    const r = Math.PI / 180, dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  };

  function search(lat, lon, animate = true, label = "") {
    let found = [], radius = 25;
    for (const R of [5, 10, 25]) {
      found = [];
      for (let i = 0; i < N; i++) {
        if (Number.isNaN(price[i])) continue;
        const s = stations[i];
        if (Math.abs(s.lat - lat) > R / 100 || Math.abs(s.lon - lon) > R / 70) continue;
        const d = km(lat, lon, s.lat, s.lon);
        if (d <= R) found.push({ i, km: d });
      }
      if (found.length) { radius = R; break; }
    }
    if (!found.length) {
      near = null; bestEl.hidden = true; listEl.hidden = true;
      say(T.none, true); draw(); drawRail(); return;
    }
    // stale prices sink below fresh ones, as in the app
    const now = Date.now();
    const old = (i) => now - updMs[i] > STALE_DAYS * DAY;
    found.sort((a, b) => (old(a.i) - old(b.i)) || (price[a.i] - price[b.i]) || (a.km - b.km));
    near = { lat, lon, radius, items: found.slice(0, 5), sel: 0, label };
    say(T.within(radius));
    renderResults();
    flyTo(fitAround(lat, lon, radius), animate);
  }

  function renderResults() {
    const now = Date.now();
    const it = near.items[near.sel], s = stations[it.i], p = price[it.i];
    const age = Math.max(0, Math.floor((now - updMs[it.i]) / DAY));
    $("#best-price").textContent = nf3.format(p);
    $("#best-name").textContent = nice(s.brand) + (s.name && s.name !== s.brand ? ", " + nice(s.name) : "");
    $("#best-addr").textContent = `${nice(s.address || "")}${s.city ? ", " + nice(s.city) : ""}`;
    const ageText = age === 0 ? T.today : T.ago(age);
    const ageEl = $("#best-age");
    ageEl.textContent = `${nf1.format(it.km)} km, ${selfFlag[it.i] ? T.self : T.served}, ${ageText}`;
    ageEl.classList.toggle("stale-tag", age > STALE_DAYS);
    if (stats) {
      const d = p - stats.median, m = nf3.format(stats.median);
      $("#best-delta").textContent = Math.abs(d) < 0.0005 ? T.at(m) : (d < 0 ? T.below(nf3.format(-d) + " €", m) : T.above(nf3.format(d) + " €", m));
    }
    $("#best-go").href = `https://maps.apple.com/?daddr=${s.lat},${s.lon}&dirflg=d`;
    bestEl.hidden = false;

    listEl.replaceChildren(...near.items.map((r, k) => {
      const st = stations[r.i], a = Math.floor((now - updMs[r.i]) / DAY);
      const li = document.createElement("li");
      if (a > STALE_DAYS) li.className = "old";
      const b = document.createElement("button");
      b.type = "button";
      if (k === near.sel) b.setAttribute("aria-current", "true");
      const n = document.createElement("span"); n.className = "n"; n.textContent = nice(st.brand) + (st.city ? ", " + nice(st.city) : "");
      const m = document.createElement("span"); m.className = "m";
      m.textContent = `${nf1.format(r.km)} km, ${a === 0 ? T.today : T.ago(a)}`;
      if (a > STALE_DAYS) m.classList.add("stale-tag");
      const pr = document.createElement("span"); pr.className = "p"; pr.textContent = nf3.format(price[r.i]);
      b.append(n, m, pr);
      b.addEventListener("click", () => { near.sel = k; renderResults(); draw(); drawRail(); });
      li.append(b);
      return li;
    }));
    listEl.hidden = near.items.length < 2;
    drawRail();
  }

  function flyTo(target, animate) {
    if (anim) cancelAnimationFrame(anim);
    if (!animate || reduce) { Object.assign(view, target); draw(); return; }
    const from = { ...view }, t0 = performance.now(), dur = 1100;
    // zoom in log space so the scale change feels even
    const ls0 = Math.log(from.s), ls1 = Math.log(target.s);
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k);
      view.cx = from.cx + (target.cx - from.cx) * e;
      view.cy = from.cy + (target.cy - from.cy) * e;
      view.sy = from.sy + (target.sy - from.sy) * e;
      view.s = Math.exp(ls0 + (ls1 - ls0) * e);
      // the camera banks down over the map mid-flight and levels out to land
      const tilt = 40 * Math.sin(Math.PI * Math.min(1, k * 1.15));
      canvas.style.transform = tilt > 0.2 ? `perspective(1100px) rotateX(${tilt.toFixed(2)}deg) scale(${(1 + tilt / 140).toFixed(3)})` : "";
      draw();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  // ---------- towns ----------
  let towns = null;
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  function buildCities() {
    towns = new Map();
    for (const s of stations) {
      if (!s.city) continue;
      const k = norm(s.city);
      const t = towns.get(k) || { name: nice(s.city), lat: 0, lon: 0, n: 0 };
      t.lat += s.lat; t.lon += s.lon; t.n++; towns.set(k, t);
    }
    const dl = $("#towns");
    const names = [...towns.values()].map((t) => t.name).sort((a, b) => a.localeCompare(b, T.locale));
    dl.replaceChildren(...names.map((n) => { const o = document.createElement("option"); o.value = n; return o; }));
  }
  function findTown(q) {
    const k = norm(q);
    if (!k) return null;
    let t = towns.get(k);
    if (!t) for (const [name, v] of towns) if (name.startsWith(k)) { t = v; break; }
    if (!t) for (const [name, v] of towns) if (name.includes(k)) { t = v; break; }
    return t ? { lat: t.lat / t.n, lon: t.lon / t.n, name: t.name } : null;
  }

  // ---------- helpers ----------
  const SMALL = new Set(["di", "del", "della", "dei", "delle", "da", "e", "in", "sul", "sulla", "al", "alla", "s", "per"]);
  function nice(s) {
    if (!s || /[a-z]/.test(s)) return s || "";
    return s.toLowerCase().replace(/\b([\p{L}][\p{L}']*)/gu, (w, _x, off) => (off > 0 && SMALL.has(w)) ? w : w[0].toUpperCase() + w.slice(1))
      .replace(/\b(Ss|Sp|Sr|Sc|Km|Snc|Srl|Spa|Sas)\b/g, (m) => m.toUpperCase());
  }
  function say(msg, err = false) { statusEl.textContent = msg; statusEl.classList.toggle("err", err); }

  // ---------- wiring ----------
  document.querySelectorAll('input[name="fuel"]').forEach((r) => r.addEventListener("change", () => {
    if (r.checked) loadPrices().then(() => setFuel(r.value)).catch(() => {});
  }));

  const geoBtn = $("#near-me");
  geoBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) { say(T.noGeo, true); return; }
    say(T.locating); geoBtn.setAttribute("aria-busy", "true");
    const pricesReady = loadPrices();
    navigator.geolocation.getCurrentPosition(async (pos) => {
      geoBtn.removeAttribute("aria-busy");
      try { await pricesReady; } catch { say(T.failed, true); return; }
      search(pos.coords.latitude, pos.coords.longitude);
    }, () => { geoBtn.removeAttribute("aria-busy"); say(T.denied, true); },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  });

  $("#city").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = cityInput.value.trim();
    if (!q) { cityInput.focus(); return; }
    try { await loadPrices(); } catch { say(T.failed, true); return; }
    const t = findTown(q);
    if (!t) { say(T.noCity(q), true); return; }
    search(t.lat, t.lon, true, t.name);
  });

  canvas.addEventListener("click", async (e) => {
    const r = canvas.getBoundingClientRect();
    // offsetX/Y are resolved through the 3D tilt, unlike the projected bounding box
    const x = (e.offsetX - W / 2) / view.s + view.cx, y = (e.offsetY - view.sy) / view.s + view.cy;
    const lon = x / KX + LON0, lat = LAT1 - y;
    try { await loadPrices(); } catch { say(T.failed, true); return; }
    search(lat, lon);
  });
  canvas.title = T.tapHint;

  // ---------- scroll: the road tilts away like the view from the driver's seat ----------
  const road = $(".road"), park = $(".park"), centreLine = $(".centre");
  const parkImg = park && park.querySelector(".shots figure:first-child img");
  const parkRest = park ? [...park.querySelectorAll(".shots figure:not(:first-child)")] : [];
  const parkLead = park && park.querySelector(".sec-lead");
  const parkMQ = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    if (!reduce) {
      const r = road.getBoundingClientRect();
      const pr = park ? park.getBoundingClientRect() : null;
      centreLine.style.setProperty("--drive", `${(scrollY * 1.6).toFixed(1)}px`);
      // desktop: tilt from the first pixel of scroll; phone: only once the map is leaving, so it never tilts while in use
      // with results open the user scrolls to read them: tilt only once the road is leaving, as on phones
      const p = innerWidth > 900 && !near ? clamp01(-r.top / (r.height * 0.85)) : clamp01((vh * 0.5 - r.bottom) / (vh * 0.5));
      road.style.transform = p > 0.002 ? `perspective(1400px) rotateX(${(p * 32).toFixed(2)}deg)` : "";
      road.style.opacity = p > 0.002 ? (1 - p * 0.35).toFixed(3) : "";
      if (pr && pr.top < vh && pr.bottom > 0) parkStep(vh, pr);
      else if (pr && pr.bottom <= 0) parkStep(vh, pr, true);
    } else parkStep(vh);
  }
  // the app's map screenshot arrives full height and reverses into its parking bay
  function parkStep(vh, r, parked = false) {
    if (!park) return;
    if (!parkMQ.matches || parked) {
      parkImg.style.transform = ""; parkRest.forEach((f) => { f.style.opacity = ""; f.style.transform = ""; });
      return;
    }
    const p = clamp01(-r.top / ((r.height - vh) * 0.75)), e = 1 - (1 - p) ** 3;
    const fig = parkImg.parentElement, fr = fig.getBoundingClientRect();
    const w = parkImg.offsetWidth, h = parkImg.offsetHeight;
    const cx = fr.left + parkImg.offsetLeft + w / 2, cy = fr.top + parkImg.offsetTop + h / 2;
    // the big state sits in the free area right of the copy, centred on the sticky stage so it scrolls in with its section
    const freeL = parkLead.getBoundingClientRect().right + 48, freeW = innerWidth - freeL - 32;
    const S = Math.max(1, Math.min((vh * 0.94) / h, freeW / w));
    const k = 1 - e;
    const st = park.firstElementChild.getBoundingClientRect();
    const tx = freeL + freeW / 2 - cx, ty = st.top + st.height / 2 - cy;
    parkImg.style.transform = k > 0.001
      ? `translate(${(tx * k).toFixed(1)}px, ${(ty * k).toFixed(1)}px) scale(${(1 + (S - 1) * k).toFixed(3)})`
      : "";
    parkRest.forEach((f, i) => {
      const q = clamp01((p - 0.35 - i * 0.1) / 0.35);
      f.style.opacity = q.toFixed(3);
      f.style.transform = q < 1 ? `translateY(${((1 - q) * 70).toFixed(1)}px)` : "";
    });
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(onScroll));
  onScroll();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas); ro.observe(railCanvas);
  document.fonts && document.fonts.ready.then(() => draw());
  loadDots().then(() => {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
    idle(() => loadPrices().catch(() => {}));
  }).catch(() => { loadingEl.textContent = T.failed; });
})();
