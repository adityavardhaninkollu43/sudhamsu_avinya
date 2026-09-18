/* ==========================================================================
   Readout — Critical Value Clinical Triage Engine
   --------------------------------------------------------------------------
   Automated laboratory panic/critical limit surveillance based on CLSI,
   College of American Pathologists (CAP), and NHS Acute Care Guidelines.
   Identifies values posing imminent health risks that require urgent
   physician notification rather than routine review.
   ========================================================================== */

const CRITICAL_THRESHOLDS = {
  potassium: {
    name: "Serum Potassium",
    criticalLow: 2.8,
    criticalHigh: 6.0,
    unit: "mEq/L",
    lowRisk: "Severe Hypokalemia — Increased vulnerability to cardiac dysrhythmias, muscle paralysis, and ileus.",
    highRisk: "Severe Hyperkalemia — Acute risk of lethal cardiac dysrhythmias (ventricular fibrillation, asystole).",
    action: "Requires emergency medical evaluation and 12-lead ECG today. Contact on-call physician or local urgent care."
  },
  sodium: {
    name: "Serum Sodium",
    criticalLow: 120,
    criticalHigh: 158,
    unit: "mEq/L",
    lowRisk: "Severe Hyponatremia — Neurological risk including cerebral edema, seizures, and altered mental status.",
    highRisk: "Severe Hypernatremia — Severe intracellular dehydration and hyperosmolar encephalopathy risk.",
    action: "Requires immediate clinical assessment and controlled electrolyte correction in a monitored setting."
  },
  glucose: {
    name: "Blood Glucose",
    criticalLow: 50,
    criticalHigh: 400,
    unit: "mg/dL",
    lowRisk: "Severe Hypoglycemia — Risk of neuroglycopenia, loss of consciousness, and seizure.",
    highRisk: "Severe Hyperglycemia — Risk of Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS).",
    action: "If symptoms present (confusion, lethargy, diaphoresis), seek emergency medical care immediately."
  },
  hb: {
    name: "Haemoglobin",
    criticalLow: 7.0,
    criticalHigh: 20.0,
    unit: "g/dL",
    lowRisk: "Severe Anemia — Below standard clinical transfusion threshold; hemodynamic compromise risk.",
    highRisk: "Severe Polycythemia — Markedly increased blood viscosity and microvascular thrombosis risk.",
    action: "Prompt clinical consultation recommended today to evaluate etiology and transfusion necessity."
  },
  plt: {
    name: "Platelet Count",
    criticalLow: 30,
    criticalHigh: 1000,
    unit: "×10³/µL",
    lowRisk: "Critical Thrombocytopenia — High risk of spontaneous cutaneous, mucosal, or intracranial hemorrhage.",
    highRisk: "Extreme Thrombocytosis — Hypercoagulability or paradoxical microvascular bleeding.",
    action: "Avoid aspirin/NSAIDs/antiplatelets and contact your hematologist or emergency department today."
  },
  calcium: {
    name: "Serum Calcium",
    criticalLow: 6.5,
    criticalHigh: 13.0,
    unit: "mg/dL",
    lowRisk: "Severe Hypocalcemia — Tetany, laryngospasm, and prolonged QT-interval.",
    highRisk: "Hypercalcemic Crisis — Confusion, severe dehydration, and renal compromise.",
    action: "STAT medical consultation required for immediate parenteral or oral stabilization."
  },
  wbc: {
    name: "White Blood Cell Count",
    criticalLow: 1.5,
    criticalHigh: 35.0,
    unit: "×10³/µL",
    lowRisk: "Severe Agranulocytosis / Neutropenia — Extreme vulnerability to life-threatening bacterial/fungal sepsis.",
    highRisk: "Hyperleukocytosis / Severe Leukemoid Reaction — Acute hematologic or severe systemic infectious process.",
    action: "Immediate medical assessment. If fever (>100.4°F/38°C) is present, present to emergency room immediately."
  }
};

const TriageEngine = {
  getPanicInfo(p) {
    if (!p) return null;
    const id = (p.canonicalId || p.id || "").toLowerCase();
    const val = Number(p.value);
    if (isNaN(val)) return null;

    // Check matching rule
    let rule = null;
    if (id.includes("potassium") || id === "k" || id === "k+") rule = CRITICAL_THRESHOLDS.potassium;
    else if (id.includes("sodium") || id === "na" || id === "na+") rule = CRITICAL_THRESHOLDS.sodium;
    else if (id.includes("glucose") || id === "fbs" || id === "fpg") rule = CRITICAL_THRESHOLDS.glucose;
    else if (id === "hb" || id.includes("haemoglobin") || id.includes("hemoglobin")) rule = CRITICAL_THRESHOLDS.hb;
    else if (id === "plt" || id.includes("platelet")) rule = CRITICAL_THRESHOLDS.plt;
    else if (id.includes("calcium") || id === "ca") rule = CRITICAL_THRESHOLDS.calcium;
    else if (id === "wbc" || id.includes("white blood")) rule = CRITICAL_THRESHOLDS.wbc;

    if (!rule) return null;

    if (rule.criticalLow != null && val <= rule.criticalLow) {
      return {
        param: p,
        rule,
        type: "LOW",
        value: val,
        threshold: rule.criticalLow,
        risk: rule.lowRisk,
        rationale: rule.lowRisk,
        action: rule.action
      };
    } else if (rule.criticalHigh != null && val >= rule.criticalHigh) {
      return {
        param: p,
        rule,
        type: "HIGH",
        value: val,
        threshold: rule.criticalHigh,
        risk: rule.highRisk,
        rationale: rule.highRisk,
        action: rule.action
      };
    }
    return null;
  },

  isPanic(p) {
    return !!this.getPanicInfo(p);
  },

  evaluate(parameters = []) {
    const criticals = [];

    parameters.forEach((p) => {
      const info = this.getPanicInfo(p);
      if (info) criticals.push(info);
    });

    return {
      hasCritical: criticals.length > 0,
      criticals,
      count: criticals.length
    };
  },

  renderBanner(triageResult, targetElement) {
    if (!targetElement) return;

    if (!triageResult || !triageResult.hasCritical) {
      targetElement.innerHTML = `
        <div style="display:inline-flex;align-items:center;gap:6px;background:var(--surface-sunk);border:1px solid var(--line);padding:4px 10px;border-radius:16px;font-size:11.5px;color:var(--ink-2);margin-bottom:12px">
          <span style="color:#16a34a;font-size:12px">🛡️</span>
          <span><strong>Clinical Safety Triage:</strong> No panic-level critical lab boundaries breached on this report.</span>
        </div>
      `;
      return;
    }

    const itemsHtml = triageResult.criticals.map((c) => `
      <div style="background:#fff;border-left:4px solid #dc2626;padding:10px 14px;border-radius:4px;margin-top:8px;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <strong style="color:#991b1b;font-size:13.5px">
            🚨 ${esc(c.param.name)}: <span class="num">${c.value} ${esc(c.param.unit)}</span>
          </strong>
          <span style="background:#fee2e2;color:#991b1b;font-weight:700;padding:2px 8px;border-radius:10px;font-size:11px">
            CRITICAL ${c.type} (Threshold: ${c.type === 'LOW' ? '≤' : '≥'} ${c.threshold} ${c.rule.unit})
          </span>
        </div>
        <p style="font-size:12.5px;color:#7f1d1d;margin:6px 0 4px;line-height:1.45">
          <strong>Clinical Risk:</strong> ${esc(c.risk)}
        </p>
        <p style="font-size:12px;color:#1e293b;margin:0;font-weight:500">
          <strong>Immediate Protocol:</strong> ${esc(c.action)}
        </p>
      </div>
    `).join("");

    targetElement.innerHTML = `
      <div class="card" style="background:#fef2f2;border:2px solid #ef4444;border-radius:var(--r-md);padding:16px 18px;margin-bottom:20px;box-shadow:0 4px 12px rgba(220,38,38,0.12)">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="font-size:24px;line-height:1">⚠️</div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
              <h2 style="font-size:16px;color:#991b1b;margin:0;font-weight:700">
                Urgent Clinical Action Recommended (${triageResult.count} Critical ${triageResult.count === 1 ? 'Value' : 'Values'})
              </h2>
              <span style="background:#dc2626;color:#fff;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:12px;text-transform:uppercase;letter-spacing:0.04em">
                STAT Priority
              </span>
            </div>
            <p style="font-size:12.5px;color:#7f1d1d;margin:6px 0 8px;line-height:1.5">
              One or more results cross established hospital panic limits. These are not standard mild variations — they represent acute physiological disturbances that require direct medical evaluation today.
            </p>
            ${itemsHtml}
            <div style="margin-top:12px;padding-top:10px;border-top:1px solid #fecaca;font-size:11.5px;color:#991b1b;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <span>⚠️ Do not stop or alter prescription medications without physician confirmation.</span>
              <span style="font-weight:600">Take this original report to your urgent care or physician.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.TriageEngine = TriageEngine;
