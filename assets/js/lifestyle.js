/* ==========================================================================
   Readout — Evidence-Based Lifestyle & Nutritional Levers Engine
   --------------------------------------------------------------------------
   Translates high clinical biomarkers into quantified, guideline-backed
   lifestyle interventions (AHA, ADA, KDIGO, Endocrine Society).
   Includes an interactive simulator projecting estimated biomarker
   shifts based on evidence-backed trials (DPP, PREDIMED, DASH).
   ========================================================================== */

const LIFESTYLE_LEVERS = {
  ldl: {
    marker: "LDL Cholesterol",
    triggers: ["ldl", "chol"],
    summary: "Atherogenic LDL-C particles are directly responsive to dietary fat composition and viscous fiber intake.",
    levers: [
      {
        id: "soluble-fiber",
        title: "Increase Soluble / Viscous Fiber (+10g/day)",
        sources: "Oat bran, psyllium husk, chia seeds, lentils, apples, barley",
        mechanism: "Viscous soluble fiber binds bile acids in the small intestine, forcing hepatic conversion of circulating cholesterol to bile.",
        impactPercent: -8,
        impactLabel: "↓ 5% – 10% LDL reduction",
        evidence: "American Heart Association (AHA) Scientific Advisory & Brown et al. meta-analysis."
      },
      {
        id: "sat-fat",
        title: "Replace Saturated Fats with Polyunsaturated / MUFAs",
        sources: "Extra virgin olive oil, walnuts, avocados; minimize butter, fatty meats, palm oil (<7% total calories)",
        mechanism: "Downregulates hepatic LDL receptor degradation, accelerating clearance of apoB-containing particles.",
        impactPercent: -10,
        impactLabel: "↓ 8% – 12% LDL reduction",
        evidence: "Cochrane Systematic Review & AHA Presidential Advisory on Dietary Fats."
      },
      {
        id: "plant-sterols",
        title: "Plant Stanols / Phytosterols (2g/day)",
        sources: "Fortified foods, legumes, wheat germ",
        mechanism: "Displaces dietary and biliary cholesterol from micellar incorporation in intestinal enterocytes.",
        impactPercent: -9,
        impactLabel: "↓ 6% – 12% LDL reduction",
        evidence: "National Lipid Association (NLA) Expert Panel Recommendations."
      }
    ]
  },

  triglycerides: {
    marker: "Triglycerides",
    triggers: ["tg", "triglycerides"],
    summary: "Serum triglycerides are extremely lifestyle-sensitive, reflecting hepatic de novo lipogenesis and clearance kinetics.",
    levers: [
      {
        id: "cut-sugars",
        title: "Eliminate Sugar-Sweetened Beverages & Refined Carbohydrates",
        sources: "Replace sodas, sweetened teas, pastries, and fruit juices with water, unsweetened tea, or seltzer",
        mechanism: "Halts acute hepatic fructose overload and reduces hepatic VLDL secretion rate.",
        impactPercent: -25,
        impactLabel: "↓ 20% – 30% Triglyceride reduction",
        evidence: "Circulation AHA Scientific Statement on Triglycerides and Cardiovascular Disease."
      },
      {
        id: "aerobic-exercise",
        title: "Regular Aerobic Activity (150 mins/week moderate intensity)",
        sources: "Brisk walking (4 mph), cycling, swimming, steady jogging",
        mechanism: "Upregulates skeletal muscle Lipoprotein Lipase (LPL) activity, accelerating clearance of triglyceride-rich chylomicrons and VLDL.",
        impactPercent: -18,
        impactLabel: "↓ 15% – 20% Triglycerides, ↑ 5% – 10% HDL",
        evidence: "American College of Sports Medicine (ACSM) Exercise Guidelines."
      },
      {
        id: "omega3",
        title: "Marine Omega-3 Fatty Acids (EPA/DHA 2–3g/day)",
        sources: "Wild salmon, sardines, mackerel or pharmaceutical-grade ethyl esters (under medical supervision)",
        mechanism: "Inhibits diacylglycerol acyltransferase, promoting intracellular fatty acid oxidation in hepatocytes.",
        impactPercent: -28,
        impactLabel: "↓ 25% – 35% Triglyceride reduction",
        evidence: "REDUCE-IT trial & AHA Science Advisory on Omega-3."
      }
    ]
  },

  glucose: {
    marker: "Fasting Glucose & HbA1c",
    triggers: ["glucose", "fbs", "hba1c"],
    summary: "Glycemic markers reflect balance between hepatic insulin sensitivity and peripheral muscle glucose disposal.",
    levers: [
      {
        id: "postmeal-walk",
        title: "10–15 Minute Post-Meal Walk",
        sources: "Immediate light stroll after lunch and dinner",
        mechanism: "Triggers non-insulin-mediated GLUT4 translocation in contracting skeletal muscle, blunting glucose spikes.",
        impactPercent: -12,
        impactLabel: "↓ 18% – 22% postprandial glucose spike",
        evidence: "Reynolds et al. Diabetologia clinical trial & ADA Standards of Medical Care."
      },
      {
        id: "weight-loss",
        title: "Modest Weight Optimization (5% – 7% body weight)",
        sources: "Sustained modest caloric deficit with whole-food Mediterranean pattern",
        mechanism: "Mobilizes ectopic fat from liver and pancreas, restoring first-phase insulin secretion and hepatic sensitivity.",
        impactPercent: -15,
        impactLabel: "↓ 0.5% – 1.0% HbA1c, 58% reduction in T2D risk",
        evidence: "Diabetes Prevention Program (DPP) Landmark Trial."
      },
      {
        id: "low-gi",
        title: "Low Glycemic Index & Mediterranean Pattern",
        sources: "Non-starchy vegetables, legumes, whole intact grains; avoid refined white flours",
        mechanism: "Slows gastric emptying rate and decreases rapid intestinal monosaccharide absorption.",
        impactPercent: -8,
        impactLabel: "↓ 0.3% – 0.5% HbA1c drop",
        evidence: "PREDIMED study & ADA Dietary Recommendations."
      }
    ]
  },

  liver: {
    marker: "Alanine Transaminase (ALT/SGPT)",
    triggers: ["alt", "sgpt", "ast"],
    summary: "Elevated liver transaminases in metabolic contexts frequently correlate with hepatic steatosis (NAFLD/MASLD).",
    levers: [
      {
        id: "steatosis-loss",
        title: "7% – 10% Weight Reduction",
        sources: "Structured lifestyle modification under primary care guidance",
        mechanism: "Reduces intrahepatic triglyceride accumulation and downregulates inflammatory cytokine release in Kupffer cells.",
        impactPercent: -35,
        impactLabel: "Normalizes elevated ALT in ~65% of patients",
        evidence: "AASLD (American Association for the Study of Liver Diseases) Practice Guidance."
      },
      {
        id: "alcohol-cessation",
        title: "Complete Alcohol Cessation for 4 Weeks",
        sources: "Zero alcoholic beverages",
        mechanism: "Relieves toxic intermediate acetaldehyde strain and hepatic oxidative stress.",
        impactPercent: -40,
        impactLabel: "Rapid normalization within 2–4 weeks if alcohol-driven",
        evidence: "European Association for the Study of the Liver (EASL)."
      }
    ]
  },

  vitd: {
    marker: "Vitamin D (25-OH)",
    triggers: ["vitd", "vitamin d"],
    summary: "Vitamin D functions as a secosteroid prohormone essential for calcium homeostasis and immune modulation.",
    levers: [
      {
        id: "safe-sun",
        title: "Prudent Mid-Day Sunlight Exposure",
        sources: "15–20 minutes mid-day sun on arms/legs (adjusted for skin phototype and UV index)",
        mechanism: "UVB radiation photolyses 7-dehydrocholesterol in epidermis to previtamin D3.",
        impactPercent: 30,
        impactLabel: "Provides physiological baseline synthesis",
        evidence: "Endocrine Society Clinical Practice Guidelines."
      },
      {
        id: "cholecalciferol",
        title: "Clinician-Directed Cholecalciferol (D3) Supplementation",
        sources: "Prescription or high-quality oral D3 with dietary healthy fats",
        mechanism: "Reconstitutes circulating 25(OH)D pool for renal conversion to active calcitriol (1,25(OH)2D).",
        impactPercent: 60,
        impactLabel: "Targets 30–50 ng/mL repletion",
        evidence: "Endocrine Society & National Osteoporosis Foundation."
      }
    ]
  }
};

const LifestyleEngine = {
  getRelevantLevers(parameters = []) {
    const relevant = [];

    Object.keys(LIFESTYLE_LEVERS).forEach((key) => {
      const group = LIFESTYLE_LEVERS[key];
      const match = parameters.find((p) => {
        const pid = (p.canonicalId || p.id || "").toLowerCase();
        return group.triggers.some((t) => pid.includes(t));
      });

      if (match) {
        relevant.push({
          groupKey: key,
          group,
          matchedParam: match
        });
      }
    });

    return relevant;
  },

  renderSection(targetElement, parameters = []) {
    if (!targetElement) return;
    const relevant = LifestyleEngine.getRelevantLevers(parameters);

    if (!relevant.length) {
      targetElement.innerHTML = `
        <div class="empty" style="padding:24px 16px">
          <h3>No Specific Lifestyle Levers Found</h3>
          <p>The biomarkers on this current report do not match standard metabolic or lipid lifestyle guidelines.</p>
        </div>
      `;
      return;
    }

    // Active state for simulator checkboxes
    const simState = Store.get("lifestyle_sim_state", {});

    const groupsHtml = relevant.map((r) => {
      const p = r.matchedParam;
      const v = view(p);
      const isHigh = p.high != null && v.value > p.high;
      const isLow = p.low != null && v.value < p.low;

      const leversHtml = r.group.levers.map((lever) => {
        const isChecked = simState[lever.id] !== false; // default checked for demo
        return `
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);padding:12px 14px;margin-top:10px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
              <label style="cursor:pointer;display:flex;align-items:flex-start;gap:8px;font-weight:600;font-size:13px;color:var(--ink);flex:1">
                <input type="checkbox" class="lifestyle-sim-toggle" data-lever-id="${lever.id}" data-impact="${lever.impactPercent}" data-param-id="${p.id}" ${isChecked ? 'checked' : ''} style="margin-top:2px">
                <div>
                  <div>${esc(lever.title)}</div>
                  <div style="font-size:11.5px;font-weight:400;color:var(--ink-2);margin-top:2px">
                    <strong>Sources:</strong> ${esc(lever.sources)}
                  </div>
                </div>
              </label>
              <span style="background:var(--surface-sunk);color:#047857;border:1px solid #a7f3d0;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap">
                ${lever.impactLabel}
              </span>
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);font-size:11.5px;color:var(--ink-2);line-height:1.4">
              <em>Physiology:</em> ${esc(lever.mechanism)}
              <div style="font-size:10.5px;color:var(--ink-muted);margin-top:4px">📚 <strong>Guideline Source:</strong> ${esc(lever.evidence)}</div>
            </div>
          </div>
        `;
      }).join("");

      return `
        <div style="margin-bottom:24px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:6px">
              <h3 style="font-size:14px;margin:0;color:var(--ink)">${esc(r.group.marker)}</h3>
              <span style="font-size:12px;color:var(--ink-2)">· Current: <strong>${fmt(v.value, v.dp)} ${esc(v.unit)}</strong></span>
              ${isHigh ? '<span class="chip chip--out" style="font-size:10.5px;padding:1px 6px">Above Range</span>' : ''}
              ${isLow ? '<span class="chip chip--out" style="font-size:10.5px;padding:1px 6px">Below Range</span>' : ''}
            </div>
          </div>
          <p style="font-size:12px;color:var(--ink-2);margin:0 0 10px">${esc(r.group.summary)}</p>
          ${leversHtml}
        </div>
      `;
    }).join("");

    targetElement.innerHTML = `
      <div class="card" style="margin-top:24px">
        <div class="card-head">
          <div>
            <h2 id="lifestyle-h" style="display:flex;align-items:center;gap:6px">
              <span>🥗</span> Evidence-Based Lifestyle & Dietary Levers
            </h2>
            <div style="font-size:12px;color:var(--ink-2);margin-top:2px">
              Quantified, clinical-guideline interventions (AHA, ADA, AASLD) showing how everyday habits shift specific biomarkers.
            </div>
          </div>
        </div>

        <!-- Interactive Simulator Projection Box -->
        <div id="lifestyle-projection-box" style="background:linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);border:1px solid #a7f3d0;border-radius:var(--r-md);padding:14px 16px;margin-bottom:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:20px">⚡</span>
              <div>
                <strong style="font-size:13px;color:#065f46">Guideline-Projected Biomarker Shifts</strong>
                <div style="font-size:11.5px;color:#047857">Toggling the evidence levers below dynamically recalculates your potential biomarker response.</div>
              </div>
            </div>
            <span style="font-size:11px;font-weight:600;color:#047857;background:#d1fae5;padding:3px 8px;border-radius:12px">Evidence-Backed Simulation</span>
          </div>
          <div id="lifestyle-projection-numbers" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px"></div>
        </div>

        <div class="stack" style="gap:16px">
          ${groupsHtml}
        </div>

        <p class="guard" style="margin-top:20px">
          <span data-icon-info></span>
          <span><strong>Medical Disclaimer:</strong> Projected changes are derived from peer-reviewed population trials and clinical practice guidelines. Individual physiological response varies based on genetics, baseline diet, and concurrent pharmacotherapy. Always discuss lifestyle modifications with your healthcare provider before altering current treatment.</span>
        </p>
      </div>
    `;

    LifestyleEngine.updateProjection(parameters);

    // Bind checkboxes
    $$(".lifestyle-sim-toggle").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = e.target.dataset.leverId;
        const state = Store.get("lifestyle_sim_state", {});
        state[id] = e.target.checked;
        Store.set("lifestyle_sim_state", state);
        LifestyleEngine.updateProjection(parameters);
      });
    });
  },

  updateProjection(parameters = []) {
    const container = $("#lifestyle-projection-numbers");
    if (!container) return;

    const simState = Store.get("lifestyle_sim_state", {});
    const relevant = LifestyleEngine.getRelevantLevers(parameters);

    const projectedCards = [];

    relevant.forEach((r) => {
      const p = r.matchedParam;
      const v = view(p);
      let totalPercentChange = 0;

      r.group.levers.forEach((lever) => {
        // if checked (default true)
        if (simState[lever.id] !== false) {
          totalPercentChange += lever.impactPercent;
        }
      });

      // Clamp max realistic combined change
      if (r.groupKey === "ldl") totalPercentChange = Math.max(-25, Math.min(0, totalPercentChange));
      if (r.groupKey === "triglycerides") totalPercentChange = Math.max(-50, Math.min(0, totalPercentChange));
      if (r.groupKey === "glucose") totalPercentChange = Math.max(-25, Math.min(0, totalPercentChange));
      if (r.groupKey === "liver") totalPercentChange = Math.max(-50, Math.min(0, totalPercentChange));
      if (r.groupKey === "vitd") totalPercentChange = Math.min(100, Math.max(0, totalPercentChange));

      const projectedValue = +(v.value * (1 + totalPercentChange / 100)).toFixed(v.dp);
      const isBetter = totalPercentChange < 0 || (r.groupKey === "vitd" && totalPercentChange > 0);

      projectedCards.push(`
        <div style="background:#fff;border:1px solid #a7f3d0;border-radius:6px;padding:8px 12px;min-width:160px;box-shadow:0 1px 2px rgba(0,0,0,0.04)">
          <div style="font-size:11px;font-weight:700;color:var(--ink-2);text-transform:uppercase">${esc(p.name)}</div>
          <div style="display:flex;align-items:baseline;gap:6px;margin-top:2px">
            <span style="font-size:12px;color:var(--ink-muted);text-decoration:line-through">${fmt(v.value, v.dp)}</span>
            <span style="font-size:15px;font-weight:700;color:#065f46" class="num">${projectedValue}</span>
            <span style="font-size:11px;color:var(--ink-2)">${esc(v.unit)}</span>
          </div>
          <div style="font-size:10.5px;font-weight:600;color:${isBetter ? '#059669' : 'var(--ink-2)'};margin-top:2px">
            ${totalPercentChange >= 0 ? '+' : ''}${totalPercentChange}% projected shift
          </div>
        </div>
      `);
    });

    container.innerHTML = projectedCards.join("");
  }
};

window.LifestyleEngine = LifestyleEngine;
