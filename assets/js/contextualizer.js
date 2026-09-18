/* ==========================================================================
   Readout — Smart Clinical Context Engine
   --------------------------------------------------------------------------
   Pre-analytical variables (fasting state, biotin intake, thyroid meds,
   steroids, and diuretics) substantially alter laboratory interpretations.
   This engine detects drug-lab interferences and physiological postprandial
   shifts, annotating values so clinicians and patients understand the context.
   ========================================================================== */

const Contextualizer = {
  // Stored state
  getState() {
    return Store.get("clinical_context", {
      fasting: true,
      biotin: false,
      thyroidMeds: false,
      steroids: false,
      diuretics: false
    });
  },

  setState(updates) {
    const current = Contextualizer.getState();
    const next = { ...current, ...updates };
    Store.set("clinical_context", next);
    return next;
  },

  /**
   * Evaluates active context against current parameters and returns
   * alerts and individual parameter annotations.
   */
  evaluate(parameters = []) {
    const state = Contextualizer.getState();
    const alerts = [];
    const annotations = {}; // paramId -> array of badges/notes

    // 1. Non-Fasting State Checks
    if (!state.fasting) {
      alerts.push({
        id: "non-fasting-alert",
        type: "info",
        icon: "⏱️",
        title: "Non-Fasting / Postprandial State Active",
        message: "Blood glucose and serum triglycerides rise significantly for 3–5 hours after meal consumption. Elevations on this test may reflect normal digestive physiology rather than impaired metabolic regulation. A 10–12 hour overnight fasting blood draw is required to confirm impaired fasting glucose or calculate accurate Friedewald LDL-C."
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id.includes("glucose") || id === "fbs" || id === "fpg") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Postprandial Note",
            color: "#0369a1",
            bg: "#e0f2fe",
            detail: "Elevated glucose (120–140 mg/dL) can be normal post-meal in non-diabetic individuals."
          });
        } else if (id === "tg" || id.includes("triglyceride")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Dietary Lipemia Note",
            color: "#0369a1",
            bg: "#e0f2fe",
            detail: "Chylomicron production after meals elevates triglycerides 20–50% above fasting baseline."
          });
        }
      });
    }

    // 2. Biotin (Vitamin B7) Interference
    if (state.biotin) {
      alerts.push({
        id: "biotin-alert",
        type: "warning",
        icon: "⚠️",
        title: "Biotin Immunoassay Interference Risk (FDA Safety Advisory)",
        message: "High-dose biotin (>5 mg/day, common in hair/skin/nail supplements) interferes with streptavidin-biotin immunoassays. It frequently causes falsely low TSH (mimicking hyperthyroidism) and falsely elevated Free T4/Free T3. Endocrine Society guidelines advise stopping biotin 48–72 hours prior to thyroid repeat."
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id === "tsh" || id.includes("thyroid stimulating")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Biotin Interference",
            color: "#c2410c",
            bg: "#ffedd5",
            detail: "Exogenous biotin can cause falsely suppressed TSH readings on standard immunoassays."
          });
        } else if (id.includes("free t4") || id.includes("t4") || id.includes("thyroxine")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Biotin Interference",
            color: "#c2410c",
            bg: "#ffedd5",
            detail: "Exogenous biotin can cause falsely elevated Free T4 readings."
          });
        }
      });
    }

    // 3. Thyroid Medication Intake
    if (state.thyroidMeds) {
      alerts.push({
        id: "thyroid-timing-alert",
        type: "info",
        icon: "💊",
        title: "Thyroid Medication Timing Context",
        message: "Taking synthetic thyroid hormone (Levothyroxine/Synthroid) within 2–4 hours prior to blood collection creates a temporary peak in circulating Free T4. Best clinical practice is having blood drawn in the morning BEFORE taking your daily thyroid pill."
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id === "tsh" || id.includes("t4")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Dosing Timing Note",
            color: "#4338ca",
            bg: "#e0e7ff",
            detail: "Blood drawn shortly after taking levothyroxine reflects absorption peak rather than baseline."
          });
        }
      });
    }

    // 4. Corticosteroids
    if (state.steroids) {
      alerts.push({
        id: "steroid-alert",
        type: "info",
        icon: "💊",
        title: "Corticosteroid Metabolic & Hematologic Influence",
        message: "Glucocorticoids (Prednisone, Dexamethasone, Hydrocortisone) stimulate hepatic gluconeogenesis and peripheral insulin resistance (raising glucose) and induce neutrophil demargination (raising WBC count) without active microbial infection."
      });

      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id === "wbc" || id.includes("white blood")) {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Steroid Leukocytosis",
            color: "#0f766e",
            bg: "#ccfbf1",
            detail: "Steroids stimulate release of margined neutrophils into circulating blood pool."
          });
        } else if (id.includes("glucose") || id === "hba1c") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Steroid Hyperglycemia",
            color: "#0f766e",
            bg: "#ccfbf1",
            detail: "Glucocorticoids antagonize insulin action and increase hepatic glucose output."
          });
        }
      });
    }

    // 5. Diuretics
    if (state.diuretics) {
      parameters.forEach((p) => {
        const id = (p.canonicalId || p.id || "").toLowerCase();
        if (id.includes("potassium") || id.includes("sodium") || id.includes("uric") || id === "creat") {
          annotations[p.id] = annotations[p.id] || [];
          annotations[p.id].push({
            label: "Diuretic Electrolyte Note",
            color: "#7e22ce",
            bg: "#f3e8ff",
            detail: "Diuretics shift renal electrolyte excretion and can raise serum uric acid or creatinine."
          });
        }
      });
    }

    return {
      state,
      alerts,
      annotations
    };
  },

  renderBar(targetElement, onUpdate) {
    if (!targetElement) return;
    const state = Contextualizer.getState();

    targetElement.innerHTML = `
      <div class="card" style="padding:14px 16px;margin-bottom:18px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">🧪</span>
            <div>
              <div style="font-size:12px;font-weight:700;letter-spacing:0.03em;color:var(--ink);text-transform:uppercase">
                Smart Contextualizer: Fasting & Medications
              </div>
              <div style="font-size:11.5px;color:var(--ink-2)">
                How long you fasted and medications you take directly shift how clinical numbers are read.
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <!-- Fasting Buttons -->
            <div style="display:inline-flex;background:var(--surface-sunk);padding:3px;border-radius:20px;border:1px solid var(--line)">
              <button type="button" class="btn btn-sm ctx-fast-btn ${state.fasting ? 'btn-primary' : 'btn-ghost'}" data-fasting="true" style="padding:4px 12px;font-size:11.5px;border-radius:16px">
                Fasting (8-12h)
              </button>
              <button type="button" class="btn btn-sm ctx-fast-btn ${!state.fasting ? 'btn-primary' : 'btn-ghost'}" data-fasting="false" style="padding:4px 12px;font-size:11.5px;border-radius:16px">
                Non-Fasting / Meal
              </button>
            </div>

            <!-- Medication Checkboxes -->
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <label class="ctx-pill" style="cursor:pointer;font-size:11px;padding:4px 10px;border-radius:14px;border:1px solid var(--line);background:${state.biotin ? 'var(--primary-subtle, #f0fdf4)' : 'transparent'};display:inline-flex;align-items:center;gap:5px">
                <input type="checkbox" id="ctx-biotin" ${state.biotin ? 'checked' : ''} style="margin:0"> Biotin (B7)
              </label>
              <label class="ctx-pill" style="cursor:pointer;font-size:11px;padding:4px 10px;border-radius:14px;border:1px solid var(--line);background:${state.thyroidMeds ? 'var(--primary-subtle, #f0fdf4)' : 'transparent'};display:inline-flex;align-items:center;gap:5px">
                <input type="checkbox" id="ctx-thyroid" ${state.thyroidMeds ? 'checked' : ''} style="margin:0"> Thyroid Meds
              </label>
              <label class="ctx-pill" style="cursor:pointer;font-size:11px;padding:4px 10px;border-radius:14px;border:1px solid var(--line);background:${state.steroids ? 'var(--primary-subtle, #f0fdf4)' : 'transparent'};display:inline-flex;align-items:center;gap:5px">
                <input type="checkbox" id="ctx-steroids" ${state.steroids ? 'checked' : ''} style="margin:0"> Corticosteroids
              </label>
              <label class="ctx-pill" style="cursor:pointer;font-size:11px;padding:4px 10px;border-radius:14px;border:1px solid var(--line);background:${state.diuretics ? 'var(--primary-subtle, #f0fdf4)' : 'transparent'};display:inline-flex;align-items:center;gap:5px">
                <input type="checkbox" id="ctx-diuretics" ${state.diuretics ? 'checked' : ''} style="margin:0"> Diuretics
              </label>
            </div>
          </div>
        </div>

        <div id="ctx-alerts-box" style="margin-top:10px"></div>
      </div>
    `;

    // Render active alerts
    Contextualizer.renderAlertsBox($("#ctx-alerts-box"));

    // Event listeners
    $$(".ctx-fast-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const isFasting = btn.dataset.fasting === "true";
        Contextualizer.setState({ fasting: isFasting });
        Contextualizer.renderBar(targetElement, onUpdate);
        if (typeof onUpdate === "function") onUpdate();
      });
    });

    const bindCheck = (id, prop) => {
      const el = $(`#${id}`);
      if (el) {
        el.addEventListener("change", (e) => {
          Contextualizer.setState({ [prop]: e.target.checked });
          Contextualizer.renderBar(targetElement, onUpdate);
          if (typeof onUpdate === "function") onUpdate();
        });
      }
    };

    bindCheck("ctx-biotin", "biotin");
    bindCheck("ctx-thyroid", "thyroidMeds");
    bindCheck("ctx-steroids", "steroids");
    bindCheck("ctx-diuretics", "diuretics");
  },

  renderAlertsBox(container) {
    if (!container) return;
    const { alerts } = Contextualizer.evaluate(PARAMETERS || []);
    if (!alerts.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = alerts.map((a) => `
      <div style="background:var(--surface-sunk);border-left:3px solid ${a.type === 'warning' ? '#f59e0b' : '#3b82f6'};padding:8px 12px;border-radius:4px;margin-top:6px;display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:14px">${a.icon}</span>
        <div style="flex:1">
          <strong style="font-size:12px;color:var(--ink)">${esc(a.title)}:</strong>
          <span style="font-size:11.5px;color:var(--ink-2);line-height:1.45;display:inline"> ${esc(a.message)}</span>
        </div>
      </div>
    `).join("");
  }
};

window.Contextualizer = Contextualizer;
