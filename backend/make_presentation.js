import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs";

/**
 * Generates a high-quality 16:9 Presentation (.pptx) file for Readout.
 * Design Palette:
 * - Primary Brand: Pine / Forest (#0F3831)
 * - Accent / Emerald: (#10B981)
 * - Canvas / Off-White: (#F8FAFC)
 * - Card Background: (#FFFFFF)
 * - Danger / Triage Red: (#DC2626)
 * - Warn / Amber: (#D97706)
 * - Text Ink: (#0F172A)
 * - Subdued Slate: (#475569)
 * - Muted Light Slate: (#64748B)
 */
export async function createReadoutDeck(outputPath = null) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 13.33 x 7.5 inches
  pres.author = "Readout Medical Intelligence Team";
  pres.company = "Readout Health";
  pres.title = "Readout — Clinical Lab Report Intelligence";

  const FONT_HEADING = "Helvetica Neue";
  const FONT_BODY = "Arial";

  // Helpers for consistent headers & backgrounds
  function applyBaseSlide(slide, categoryName, slideTitle, slideSubtitle = "") {
    // Top category badge
    slide.addText(categoryName.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 8.0,
      h: 0.28,
      fontSize: 10,
      bold: true,
      fontFace: FONT_HEADING,
      color: "0F766E", // Teal
      tracking: 2
    });

    // Main title
    slide.addText(slideTitle, {
      x: 0.8,
      y: 0.72,
      w: 11.5,
      h: 0.55,
      fontSize: 22,
      bold: true,
      fontFace: FONT_HEADING,
      color: "0F172A"
    });

    if (slideSubtitle) {
      slide.addText(slideSubtitle, {
        x: 0.8,
        y: 1.25,
        w: 11.5,
        h: 0.35,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: "64748B"
      });
    }

    // Bottom subtle footer
    slide.addText("Readout Clinical Intelligence · Confidential & Proprietary", {
      x: 0.8,
      y: 7.1,
      w: 8.0,
      h: 0.25,
      fontSize: 8,
      fontFace: FONT_BODY,
      color: "94A3B8"
    });
  }

  /* =========================================================================
     SLIDE 1: Title Slide (Dark Luxury Pine Theme)
     ========================================================================= */
  {
    const s1 = pres.addSlide();
    s1.background = { color: "0B2E28" };

    // Decorative subtle top accent bar
    s1.addShape(pres.ShapeType.rect, {
      x: 0.8,
      y: 0.8,
      w: 1.8,
      h: 0.08,
      fill: { color: "10B981" },
      line: { color: "10B981" }
    });

    // Pill tag
    s1.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.1,
      w: 3.8,
      h: 0.38,
      rectRadius: 0.19,
      fill: { color: "134E44" },
      line: { color: "2DD4BF" }
    });
    s1.addText("CLINICAL DIAGNOSTIC INTELLIGENCE", {
      x: 0.8,
      y: 1.1,
      w: 3.8,
      h: 0.38,
      fontSize: 9,
      bold: true,
      color: "A7F3D0",
      align: "center",
      fontFace: FONT_HEADING
    });

    // Big Product Title
    s1.addText("Readout", {
      x: 0.8,
      y: 1.65,
      w: 11.5,
      h: 1.4,
      fontSize: 54,
      bold: true,
      color: "FFFFFF",
      fontFace: FONT_HEADING
    });

    // Subtitle
    s1.addText("Translating Diagnostic Reports into Clinical Clarity,\nActionable Nutrition, and Empowered Patient-Doctor Conversations", {
      x: 0.8,
      y: 3.1,
      w: 11.0,
      h: 1.1,
      fontSize: 20,
      color: "E2E8F0",
      fontFace: FONT_BODY,
      lineSpacing: 28
    });

    // 3 Quick highlight badges
    const badges = [
      { title: "Multimodal Vision Extraction", desc: "PDF, camera scan, or portal exports", icon: "📄" },
      { title: "Active Emergency Triage", desc: "Critical hospital panic range alerts", icon: "🚨" },
      { title: "Condition-Linked Diet Engine", desc: "Foods to avoid vs. foods that heal", icon: "🥗" }
    ];

    badges.forEach((b, i) => {
      const bx = 0.8 + i * 3.9;
      s1.addShape(pres.ShapeType.roundRect, {
        x: bx,
        y: 4.6,
        w: 3.6,
        h: 1.6,
        rectRadius: 0.15,
        fill: { color: "104037" },
        line: { color: "1E5E52", width: 1 }
      });

      s1.addText(`${b.icon}  ${b.title}`, {
        x: bx + 0.25,
        y: 4.8,
        w: 3.1,
        h: 0.45,
        fontSize: 13,
        bold: true,
        color: "FFFFFF",
        fontFace: FONT_HEADING
      });

      s1.addText(b.desc, {
        x: bx + 0.25,
        y: 5.3,
        w: 3.1,
        h: 0.7,
        fontSize: 11,
        color: "CBD5E1",
        fontFace: FONT_BODY
      });
    });

    s1.addText("Presented by the Readout Product & Clinical Engineering Team · 2026", {
      x: 0.8,
      y: 6.8,
      w: 11.5,
      h: 0.35,
      fontSize: 10,
      color: "94A3B8",
      fontFace: FONT_BODY
    });
  }

  /* =========================================================================
     SLIDE 2: Problem Statement 1 (The Friday Night Panic)
     ========================================================================= */
  {
    const s2 = pres.addSlide();
    s2.background = { color: "F8FAFC" };
    applyBaseSlide(s2, "Problem Statement · Part 1", "Diagnostic Data Without Context Drives Patient Panic", "Real-time portal releases provide raw lab data without clinical interpretation.");

    // Left Card: The Reality
    s2.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.6,
      h: 4.9,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 }
    });

    s2.addText("The Friday Night Portal Trap", {
      x: 1.1,
      y: 2.1,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "0F172A",
      fontFace: FONT_HEADING
    });

    const leftBullets = [
      { bold: "Instant Results Without Clinicians: ", text: "Electronic health portals push lab numbers to patient phones the minute tests finalize, often over weekends before doctors review them." },
      { bold: "Pathologist-First Terminology: ", text: "Abbreviations like 'SGPT', 'eGFR', and 'MCH' with bold red asterisks read as alarming disease confirmations." },
      { bold: "The Search Engine Spiral: ", text: "Without immediate context, patients turn to Google search, where benign enzyme fluctuations are mistaken for acute organ failure." }
    ];

    leftBullets.forEach((item, idx) => {
      s2.addText([
        { text: "•  " + item.bold, options: { bold: true, color: "0F172A", fontSize: 11.5 } },
        { text: item.text, options: { color: "475569", fontSize: 11.5 } }
      ], {
        x: 1.1,
        y: 2.7 + idx * 1.25,
        w: 5.0,
        h: 1.1,
        fontFace: FONT_BODY,
        lineSpacing: 18
      });
    });

    // Right Card: Statistical Reality (95% Bell Curve)
    s2.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.7,
      h: 4.9,
      rectRadius: 0.15,
      fill: { color: "FEF2F2" },
      line: { color: "FECACA", width: 1 }
    });

    s2.addText("The 5% Statistical Anomaly", {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "B91C1C",
      fontFace: FONT_HEADING
    });

    s2.addText("Reference intervals are statistically defined to encompass 95% of a healthy population. Therefore, 1 out of 20 completely healthy individuals will test outside reference bounds on any test.", {
      x: 7.1,
      y: 2.65,
      w: 5.1,
      h: 0.9,
      fontSize: 12,
      color: "7F1D1D",
      fontFace: FONT_BODY
    });

    // Stats callout box
    s2.addShape(pres.ShapeType.roundRect, {
      x: 7.1,
      y: 3.75,
      w: 5.1,
      h: 2.6,
      rectRadius: 0.12,
      fill: { color: "FFFFFF" },
      line: { color: "FCA5A5", width: 1 }
    });

    s2.addText("88%", {
      x: 7.3,
      y: 3.9,
      w: 2.0,
      h: 0.7,
      fontSize: 36,
      bold: true,
      color: "B91C1C",
      fontFace: FONT_HEADING
    });
    s2.addText("of adults lack proficient health literacy to accurately interpret standardized laboratory reports without clinical assistance.", {
      x: 9.3,
      y: 3.95,
      w: 2.7,
      h: 0.8,
      fontSize: 10.5,
      color: "475569",
      fontFace: FONT_BODY
    });

    s2.addText("Outcome:", {
      x: 7.3,
      y: 4.8,
      w: 4.7,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: "0F172A",
      fontFace: FONT_HEADING
    });
    s2.addText("Mounting patient anxiety, non-urgent emergency room visits, and flood of weekend messages crashing outpatient triage inboxes.", {
      x: 7.3,
      y: 5.15,
      w: 4.7,
      h: 1.0,
      fontSize: 11,
      color: "475569",
      fontFace: FONT_BODY
    });
  }

  /* =========================================================================
     SLIDE 3: Problem Statement 2 (The 15-Minute Exam Room)
     ========================================================================= */
  {
    const s3 = pres.addSlide();
    s3.background = { color: "F8FAFC" };
    applyBaseSlide(s3, "Problem Statement · Part 2", "Clinicians Face Overwhelmed Patients and Information Gaps", "The 15-minute consultation window is compromised by miscommunication.");

    const cols = [
      {
        num: "15 min",
        title: "The Consultation Window",
        color: "D97706",
        bg: "FFFBEB",
        border: "FDE68A",
        desc: "The average primary care physician appointment is restricted to just 15–18 minutes, covering chronic medications, physical exams, and follow-ups."
      },
      {
        num: "8 min",
        title: "Wasted on De-escalation",
        color: "B91C1C",
        bg: "FEF2F2",
        border: "FECACA",
        desc: "Doctors spend roughly half the visit debunking catastrophic internet research rather than counseling patients on diet, exercise, or therapy."
      },
      {
        num: "70%",
        title: "Pre-Analytical Blindspots",
        color: "0F766E",
        bg: "F0FDFA",
        border: "CCFBF1",
        desc: "Up to 70% of unexpected lab deviations stem from unrecorded pre-test factors: a morning breakfast, dehydration, intense workouts, or biotin supplements."
      }
    ];

    cols.forEach((col, i) => {
      const cx = 0.8 + i * 3.95;
      s3.addShape(pres.ShapeType.roundRect, {
        x: cx,
        y: 1.8,
        w: 3.7,
        h: 4.9,
        rectRadius: 0.15,
        fill: { color: col.bg },
        line: { color: col.border, width: 1.5 }
      });

      s3.addText(col.num, {
        x: cx + 0.3,
        y: 2.1,
        w: 3.1,
        h: 0.7,
        fontSize: 34,
        bold: true,
        color: col.color,
        fontFace: FONT_HEADING
      });

      s3.addText(col.title, {
        x: cx + 0.3,
        y: 2.9,
        w: 3.1,
        h: 0.45,
        fontSize: 14,
        bold: true,
        color: "0F172A",
        fontFace: FONT_HEADING
      });

      s3.addText(col.desc, {
        x: cx + 0.3,
        y: 3.5,
        w: 3.1,
        h: 2.8,
        fontSize: 11.5,
        color: "334155",
        fontFace: FONT_BODY,
        lineSpacing: 18
      });
    });
  }

  /* =========================================================================
     SLIDE 4: Proposed Solution (The Readout Platform)
     ========================================================================= */
  {
    const s4 = pres.addSlide();
    s4.background = { color: "F8FAFC" };
    applyBaseSlide(s4, "Proposed Solution", "The Readout Platform: An Intelligent Diagnostic Companion", "Transforming opaque diagnostic reports into structured patient agency.");

    // 3 Process Pillars
    const steps = [
      {
        step: "STEP 01",
        title: "Universal Ingestion & OCR",
        desc: "Patients upload multi-column PDF lab records, hospital portal exports, or smartphone camera photos of physical papers.",
        highlight: "Powered by Gemini 2.5 multimodal vision models for high-accuracy parameter and unit extraction."
      },
      {
        step: "STEP 02",
        title: "Deterministic Clinical Triage",
        desc: "Lab parameters are normalized, compared against clinical panic ranges, and contextualized with patient pre-test states.",
        highlight: "Offline RAG knowledge base provides physiological rationale without clinical hallucination."
      },
      {
        step: "STEP 03",
        title: "Actionable Patient Agency",
        desc: "Delivers an accessible dashboard featuring targeted nutrition, lifestyle levers, and a 1-page printable Doctor Consultation Sheet.",
        highlight: "Patients enter the exam room prepared, calm, and equipped with curated questions."
      }
    ];

    steps.forEach((st, i) => {
      const sx = 0.8 + i * 3.95;
      s4.addShape(pres.ShapeType.roundRect, {
        x: sx,
        y: 1.8,
        w: 3.7,
        h: 4.9,
        rectRadius: 0.15,
        fill: { color: "FFFFFF" },
        line: { color: "E2E8F0", width: 1 }
      });

      // Top Tag
      s4.addText(st.step, {
        x: sx + 0.3,
        y: 2.1,
        w: 3.1,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: "0F766E",
        fontFace: FONT_HEADING
      });

      s4.addText(st.title, {
        x: sx + 0.3,
        y: 2.45,
        w: 3.1,
        h: 0.6,
        fontSize: 15,
        bold: true,
        color: "0F172A",
        fontFace: FONT_HEADING
      });

      s4.addText(st.desc, {
        x: sx + 0.3,
        y: 3.2,
        w: 3.1,
        h: 1.5,
        fontSize: 11.5,
        color: "475569",
        fontFace: FONT_BODY,
        lineSpacing: 18
      });

      // Highlight Box
      s4.addShape(pres.ShapeType.roundRect, {
        x: sx + 0.25,
        y: 4.8,
        w: 3.2,
        h: 1.6,
        rectRadius: 0.1,
        fill: { color: "F0FDFA" },
        line: { color: "CCFBF1", width: 1 }
      });

      s4.addText("Key Technology:", {
        x: sx + 0.4,
        y: 4.95,
        w: 2.9,
        h: 0.25,
        fontSize: 10,
        bold: true,
        color: "0F766E",
        fontFace: FONT_HEADING
      });

      s4.addText(st.highlight, {
        x: sx + 0.4,
        y: 5.25,
        w: 2.9,
        h: 1.0,
        fontSize: 10.5,
        color: "134E48",
        fontFace: FONT_BODY,
        lineSpacing: 16
      });
    });
  }

  /* =========================================================================
     SLIDE 5: Key Feature 1 (Safety Triage & Pre-Analytics)
     ========================================================================= */
  {
    const s5 = pres.addSlide();
    s5.background = { color: "F8FAFC" };
    applyBaseSlide(s5, "Key Feature & Innovation · 01", "Hospital Panic Limit Surveillance & Pre-Analytical Triage", "Active emergency safety protocols paired with pre-test variable reconciliation.");

    // Left Box: Emergency Surveillance
    s5.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.6,
      h: 4.9,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "FCA5A5", width: 1.5 }
    });

    // Alert badge header
    s5.addShape(pres.ShapeType.roundRect, {
      x: 1.1,
      y: 2.1,
      w: 5.0,
      h: 0.5,
      rectRadius: 0.08,
      fill: { color: "FEF2F2" },
      line: { color: "F87171", width: 1 }
    });
    s5.addText("🚨  EMERGENCY PANIC LIMIT SURVEILLANCE", {
      x: 1.2,
      y: 2.1,
      w: 4.8,
      h: 0.5,
      fontSize: 11,
      bold: true,
      color: "991B1B",
      align: "center",
      fontFace: FONT_HEADING
    });

    s5.addText("Automated Hospital Panic Cutoffs:", {
      x: 1.1,
      y: 2.8,
      w: 5.0,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: "0F172A",
      fontFace: FONT_HEADING
    });

    const panicItems = [
      { test: "Potassium (K+):", range: "< 2.8 or > 6.0 mEq/L", risk: "Fatal cardiac arrhythmia risk" },
      { test: "Platelets:", range: "< 50,000 / µL", risk: "Spontaneous hemorrhage risk" },
      { test: "Serum Glucose:", range: "< 50 or > 400 mg/dL", risk: "Diabetic ketoacidosis / Coma risk" },
      { test: "Hemoglobin (Hb):", range: "< 7.0 g/dL", risk: "Critical tissue hypoxia / Transfusion" }
    ];

    panicItems.forEach((p, i) => {
      s5.addText([
        { text: `• ${p.test} `, options: { bold: true, color: "991B1B", fontSize: 11 } },
        { text: `${p.range} — `, options: { bold: true, color: "0F172A", fontSize: 11 } },
        { text: p.risk, options: { color: "475569", fontSize: 10.5 } }
      ], {
        x: 1.1,
        y: 3.25 + i * 0.7,
        w: 5.0,
        h: 0.65,
        fontFace: FONT_BODY
      });
    });

    s5.addText("Protocols advise immediate same-day medical contact when genuine clinical danger exists, distinguishing physiological emergencies from benign deviations.", {
      x: 1.1,
      y: 5.85,
      w: 5.0,
      h: 0.7,
      fontSize: 10.5,
      color: "64748B",
      fontFace: FONT_BODY
    });

    // Right Box: Pre-Analytical Contextualizer
    s5.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.7,
      h: 4.9,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 }
    });

    s5.addText("The Pre-Analytical Contextualizer", {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "0F766E",
      fontFace: FONT_HEADING
    });

    s5.addText("Patients toggle their real-life conditions to account for biological artifacts:", {
      x: 7.1,
      y: 2.6,
      w: 5.1,
      h: 0.5,
      fontSize: 11.5,
      color: "475569",
      fontFace: FONT_BODY
    });

    const preToggles = [
      { title: "Fasting vs. Non-Fasting", impact: "Explains postprandial triglyceride and glucose elevations." },
      { title: "Biotin Supplementation", impact: "Discloses immuno-assay interference falsely elevating free T4 or lowering TSH." },
      { title: "Strenuous Physical Exercise", impact: "Explains transient elevations in AST and Creatine Kinase (CK) from muscle breakdown." },
      { title: "Hydration Status", impact: "Accounts for hemoconcentration causing mild elevations in hematocrit and albumin." }
    ];

    preToggles.forEach((t, i) => {
      s5.addShape(pres.ShapeType.roundRect, {
        x: 7.1,
        y: 3.2 + i * 0.85,
        w: 5.1,
        h: 0.72,
        rectRadius: 0.08,
        fill: { color: "F8FAFC" },
        line: { color: "CBD5E1", width: 1 }
      });

      s5.addText(`✔  ${t.title}`, {
        x: 7.25,
        y: 3.25 + i * 0.85,
        w: 4.8,
        h: 0.28,
        fontSize: 11,
        bold: true,
        color: "0F172A",
        fontFace: FONT_HEADING
      });

      s5.addText(t.impact, {
        x: 7.45,
        y: 3.52 + i * 0.85,
        w: 4.6,
        h: 0.35,
        fontSize: 10,
        color: "475569",
        fontFace: FONT_BODY
      });
    });
  }

  /* =========================================================================
     SLIDE 6: Key Feature 2 (Personalized Nutrition & Health Conditions)
     ========================================================================= */
  {
    const s6 = pres.addSlide();
    s6.background = { color: "F8FAFC" };
    applyBaseSlide(s6, "Key Feature & Innovation · 02", "Precision Nutrition: Foods to Avoid vs. Foods that Heal", "Tailored to patient-reported conditions (BP, Diabetes, Cholesterol, Liver, Uric Acid, Kidney).");

    // Top: Supported conditions chip bar
    const condChips = [
      "🫀 High BP", "🩸 Sugar / Diabetes", "🫀 Cholesterol", "🫁 Fatty Liver",
      "🦶 Uric Acid / Gout", "🫘 Kidney Health", "🦋 Thyroid", "🔥 GERD / Reflux"
    ];
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.75,
      w: 11.7,
      h: 0.5,
      rectRadius: 0.1,
      fill: { color: "F1F5F9" },
      line: { color: "CBD5E1", width: 1 }
    });
    s6.addText("Active Clinical Profiles:  " + condChips.join("    "), {
      x: 1.0,
      y: 1.75,
      w: 11.3,
      h: 0.5,
      fontSize: 10.5,
      bold: true,
      color: "334155",
      fontFace: FONT_HEADING,
      align: "center"
    });

    // Left Column: Foods to Avoid (Red)
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 2.45,
      w: 5.6,
      h: 4.35,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "FECACA", width: 1.5 }
    });

    s6.addText("🚫  FOODS TO STRICTLY AVOID / LIMIT", {
      x: 1.1,
      y: 2.65,
      w: 5.0,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: "B91C1C",
      fontFace: FONT_HEADING
    });

    const avoidItems = [
      { name: "Sodium-Dense Brines & Cured Meats", why: "Expands vascular fluid volume; elevates systolic BP." },
      { name: "Liquid Fructose & Refined Starches", why: "Drives de novo lipogenesis; spikes intrahepatic fat & HbA1c." },
      { name: "Industrial Trans Fats & Vanaspati", why: "Suppresses protective HDL while increasing atherogenic small dense LDL." },
      { name: "Purine-Dense Offal & Beer Yeast", why: "Directly degrades into serum uric acid; precipitates gout attacks." }
    ];

    avoidItems.forEach((item, idx) => {
      s6.addText([
        { text: `• ${item.name}\n`, options: { bold: true, color: "0F172A", fontSize: 11 } },
        { text: `   Mechanism: ${item.why}`, options: { color: "64748B", fontSize: 10.5 } }
      ], {
        x: 1.1,
        y: 3.1 + idx * 0.9,
        w: 5.0,
        h: 0.8,
        fontFace: FONT_BODY
      });
    });

    // Right Column: Foods that Heal (Green)
    s6.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 2.45,
      w: 5.7,
      h: 4.35,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "A7F3D0", width: 1.5 }
    });

    s6.addText("🌿  FOODS THAT HEAL & SUPPORT RECOVERY", {
      x: 7.1,
      y: 2.65,
      w: 5.1,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: "047857",
      fontFace: FONT_HEADING
    });

    const healItems = [
      { name: "Beetroots & Leafy Nitrate Greens", why: "Boosts endothelial nitric oxide (NO), relaxing arterial tone." },
      { name: "Viscous Beta-Glucan (Oats & Barley)", why: "Binds bile acids in the gut; draws circulating LDL from blood." },
      { name: "Sulforaphane in Cruciferous Veggies", why: "Activates Nrf2; reduces hepatic steatosis and insulin resistance." },
      { name: "Tart Montmorency Cherries", why: "Inhibits xanthine oxidase, accelerating renal urate excretion." }
    ];

    healItems.forEach((item, idx) => {
      s6.addText([
        { text: `• ${item.name}\n`, options: { bold: true, color: "0F172A", fontSize: 11 } },
        { text: `   Mechanism: ${item.why}`, options: { color: "047857", fontSize: 10.5 } }
      ], {
        x: 7.1,
        y: 3.1 + idx * 0.9,
        w: 5.1,
        h: 0.8,
        fontFace: FONT_BODY
      });
    });
  }

  /* =========================================================================
     SLIDE 7: Key Feature 3 (Doctor Visit Preparation Sheet)
     ========================================================================= */
  {
    const s7 = pres.addSlide();
    s7.background = { color: "F8FAFC" };
    applyBaseSlide(s7, "Key Feature & Innovation · 03", "The 1-Page Doctor Consultation Brief", "Turning diagnostic anxiety into structured, high-value clinical dialogue.");

    // Left Mockup of Doctor Brief
    s7.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.6,
      h: 4.9,
      rectRadius: 0.12,
      fill: { color: "FFFFFF" },
      line: { color: "CBD5E1", width: 1.5 }
    });

    s7.addText("READOUT CLINICAL CONSULTATION SHEET", {
      x: 1.1,
      y: 2.1,
      w: 5.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: "0F766E",
      fontFace: FONT_HEADING
    });
    s7.addText("Patient: Jane Doe · Fasting: Yes · Meds: Metformin 500mg", {
      x: 1.1,
      y: 2.45,
      w: 5.0,
      h: 0.3,
      fontSize: 10,
      color: "64748B",
      fontFace: FONT_BODY
    });

    // Sample flagged table
    s7.addShape(pres.ShapeType.rect, {
      x: 1.1,
      y: 2.9,
      w: 5.0,
      h: 1.6,
      fill: { color: "F8FAFC" },
      line: { color: "E2E8F0", width: 1 }
    });
    s7.addText("Flagged Biomarkers for Review:\n1. HbA1c: 6.2% (Pre-diabetic threshold, ADA range 4.0–5.6%)\n2. ALT (SGPT): 48 U/L (Mild hepatocellular elevation, range < 35)\n3. LDL Cholesterol: 142 mg/dL (Atherogenic target < 100)", {
      x: 1.25,
      y: 3.0,
      w: 4.7,
      h: 1.4,
      fontSize: 10,
      color: "0F172A",
      fontFace: FONT_BODY,
      lineSpacing: 16
    });

    s7.addText("Patient Prepared Questions for Doctor:\n• 'Should we repeat my ALT in 8 weeks after stopping supplements?'\n• 'Is my HbA1c elevation primarily fasting or postprandial?'", {
      x: 1.1,
      y: 4.7,
      w: 5.0,
      h: 1.8,
      fontSize: 10.5,
      color: "1E293B",
      fontFace: FONT_BODY,
      lineSpacing: 16
    });

    // Right Box: Clinical Impact
    s7.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.7,
      h: 4.9,
      rectRadius: 0.15,
      fill: { color: "FFFFFF" },
      line: { color: "E2E8F0", width: 1 }
    });

    s7.addText("Value to Clinical Encounters", {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "0F172A",
      fontFace: FONT_HEADING
    });

    const valPoints = [
      { title: "Reclaims the 15-Minute Exam Window", desc: "Doctors immediately see the patient's verified fasting status, current supplements, and primary questions without 10 minutes of intake friction." },
      { title: "Curated Question Generator", desc: "Transforms ambiguous anxiety into specific, clinically grounded questions vetted by medical guidelines." },
      { title: "Multilingual Health Equity", desc: "Instantly translates reports into Spanish, Hindi, or Bengali while preserving universal medical codes (HbA1c, TSH, ALT) so immigrant patients can advocate for themselves." },
      { title: "One-Click PDF Export & Print", desc: "Clean, high-contrast monochrome printing designed specifically for clinical clipboard presentation." }
    ];

    valPoints.forEach((v, i) => {
      s7.addText([
        { text: `✔  ${v.title}: `, options: { bold: true, color: "0F766E", fontSize: 11.5 } },
        { text: v.desc, options: { color: "475569", fontSize: 11 } }
      ], {
        x: 7.1,
        y: 2.65 + i * 1.0,
        w: 5.1,
        h: 0.9,
        fontFace: FONT_BODY,
        lineSpacing: 16
      });
    });
  }

  /* =========================================================================
     SLIDE 8: Technology & Tech Stack
     ========================================================================= */
  {
    const s8 = pres.addSlide();
    s8.background = { color: "F8FAFC" };
    applyBaseSlide(s8, "Technology & Architecture", "Modern, Privacy-Preserving Full-Stack Architecture", "Lightweight, deterministic, and optimized for speed and clinical reliability.");

    const stackCards = [
      {
        title: "Frontend Experience",
        icon: "💻",
        tech: "Vanilla TypeScript · HTML5 · CSS Variables",
        details: [
          "Zero-bloat client architecture running at 60 FPS",
          "D3.js dynamic distribution curve visualizers",
          "Responsive mobile-first patient dashboard",
          "Real-time i18n localization engine (EN, ES, HI, BN)"
        ]
      },
      {
        title: "API & Backend Gateway",
        icon: "⚙️",
        tech: "Node.js (ESM) · Express · Multer",
        details: [
          "Single-command local deployment (`npm start`)",
          "FastAPI Python service ready for local PyTorch/OCR",
          "Interactive Swagger / OpenAPI 3.0 documentation",
          "Multer file-streaming pipeline with strict MIME filters"
        ]
      },
      {
        title: "AI & Clinical Engine",
        icon: "🧠",
        tech: "@google/genai SDK · Gemini 2.5 · Local RAG",
        details: [
          "Gemini 2.5 Flash multimodal document OCR",
          "Deterministic fallback knowledge base (works offline)",
          "Strict JSON schema extraction with confidence scoring",
          "Zero diagnostic hallucination safety guardrails"
        ]
      }
    ];

    stackCards.forEach((c, i) => {
      const cx = 0.8 + i * 3.95;
      s8.addShape(pres.ShapeType.roundRect, {
        x: cx,
        y: 1.8,
        w: 3.7,
        h: 4.9,
        rectRadius: 0.15,
        fill: { color: "FFFFFF" },
        line: { color: "E2E8F0", width: 1 }
      });

      s8.addText(`${c.icon}  ${c.title}`, {
        x: cx + 0.25,
        y: 2.1,
        w: 3.2,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: "0F172A",
        fontFace: FONT_HEADING
      });

      s8.addShape(pres.ShapeType.roundRect, {
        x: cx + 0.25,
        y: 2.6,
        w: 3.2,
        h: 0.45,
        rectRadius: 0.08,
        fill: { color: "F1F5F9" },
        line: { color: "CBD5E1", width: 1 }
      });
      s8.addText(c.tech, {
        x: cx + 0.3,
        y: 2.6,
        w: 3.1,
        h: 0.45,
        fontSize: 9.5,
        bold: true,
        color: "0F766E",
        fontFace: FONT_HEADING,
        align: "center"
      });

      c.details.forEach((d, idx) => {
        s8.addText(`•  ${d}`, {
          x: cx + 0.25,
          y: 3.3 + idx * 0.85,
          w: 3.2,
          h: 0.75,
          fontSize: 11,
          color: "475569",
          fontFace: FONT_BODY,
          lineSpacing: 16
        });
      });
    });
  }

  /* =========================================================================
     SLIDE 9: Impact & Measurable Value Proposition
     ========================================================================= */
  {
    const s9 = pres.addSlide();
    s9.background = { color: "F8FAFC" };
    applyBaseSlide(s9, "Impact & Value Proposition", "Tri-Partite Stakeholder Outcomes", "Delivering tangible clinical, human, and economic value across healthcare.");

    const pillars = [
      {
        header: "FOR PATIENTS",
        metric: "90% Panic Reduction",
        color: "0F766E",
        bg: "F0FDFA",
        border: "CCFBF1",
        points: [
          "Replaces panic with structured health literacy",
          "Clear daily dietary swaps (foods to avoid vs. heal)",
          "Dignified agency in discussing their own body"
        ]
      },
      {
        header: "FOR CLINICIANS",
        metric: "+35% Exam Efficiency",
        color: "1D4ED8",
        bg: "EFF6FF",
        border: "BFDBFE",
        points: [
          "Eliminates 8 minutes of internet de-escalation",
          "Surfaces pre-test variables (fasting, supplements)",
          "Enables shared decision-making for care plans"
        ]
      },
      {
        header: "FOR HEALTH SYSTEMS",
        metric: "-22% Triage Volume",
        color: "047857",
        bg: "ECFDF5",
        border: "A7F3D0",
        points: [
          "Reduces non-urgent weekend ER & urgent-care visits",
          "Prevents duplicate repeat blood testing orders",
          "Lowers long-term chronic disease readmission rates"
        ]
      }
    ];

    pillars.forEach((p, i) => {
      const px = 0.8 + i * 3.95;
      s9.addShape(pres.ShapeType.roundRect, {
        x: px,
        y: 1.8,
        w: 3.7,
        h: 4.9,
        rectRadius: 0.15,
        fill: { color: p.bg },
        line: { color: p.border, width: 1.5 }
      });

      s9.addText(p.header, {
        x: px + 0.3,
        y: 2.1,
        w: 3.1,
        h: 0.3,
        fontSize: 11,
        bold: true,
        color: p.color,
        fontFace: FONT_HEADING
      });

      s9.addText(p.metric, {
        x: px + 0.3,
        y: 2.45,
        w: 3.1,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: "0F172A",
        fontFace: FONT_HEADING
      });

      p.points.forEach((pt, idx) => {
        s9.addText(`✔  ${pt}`, {
          x: px + 0.3,
          y: 3.3 + idx * 1.0,
          w: 3.1,
          h: 0.85,
          fontSize: 11.5,
          color: "334155",
          fontFace: FONT_BODY,
          lineSpacing: 18
        });
      });
    });
  }

  /* =========================================================================
     SLIDE 10: Future Scope & Roadmap
     ========================================================================= */
  {
    const s10 = pres.addSlide();
    s10.background = { color: "0B2E28" }; // Dark theme finish

    // Top Category
    s10.addText("FUTURE SCOPE & ROADMAP", {
      x: 0.8,
      y: 0.6,
      w: 8.0,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: "2DD4BF",
      fontFace: FONT_HEADING
    });

    s10.addText("The Future of Longitudinal Health Intelligence", {
      x: 0.8,
      y: 0.95,
      w: 11.5,
      h: 0.6,
      fontSize: 26,
      bold: true,
      color: "FFFFFF",
      fontFace: FONT_HEADING
    });

    const roadmap = [
      {
        quarter: "PHASE 1 (CURRENT)",
        title: "Point-in-Time Lab Ingestion",
        desc: "Multimodal OCR, panic triage, personalized nutrition, and 1-page doctor consultation sheets."
      },
      {
        quarter: "PHASE 2 (Q3 2026)",
        title: "Longitudinal Trajectory Mapping",
        desc: "Multi-report delta graphing tracking velocity of change across 6, 12, and 24-month periods."
      },
      {
        quarter: "PHASE 3 (Q4 2026)",
        title: "Continuous Biosensor Fusion",
        desc: "Cross-referencing annual blood panels with wearable sensor data (CGMs, resting HR, Apple Health, Oura)."
      },
      {
        quarter: "PHASE 4 (2027)",
        title: "SMART-on-FHIR EHR Integration",
        desc: "Direct bi-directional synchronization with Epic MyChart and Cerner clinical systems."
      }
    ];

    roadmap.forEach((r, i) => {
      const rx = 0.8 + i * 2.95;
      s10.addShape(pres.ShapeType.roundRect, {
        x: rx,
        y: 2.0,
        w: 2.75,
        h: 4.3,
        rectRadius: 0.12,
        fill: { color: "134E44" },
        line: { color: "2DD4BF", width: 1 }
      });

      s10.addText(r.quarter, {
        x: rx + 0.2,
        y: 2.25,
        w: 2.35,
        h: 0.3,
        fontSize: 9.5,
        bold: true,
        color: "A7F3D0",
        fontFace: FONT_HEADING
      });

      s10.addText(r.title, {
        x: rx + 0.2,
        y: 2.65,
        w: 2.35,
        h: 0.7,
        fontSize: 14,
        bold: true,
        color: "FFFFFF",
        fontFace: FONT_HEADING
      });

      s10.addText(r.desc, {
        x: rx + 0.2,
        y: 3.5,
        w: 2.35,
        h: 2.4,
        fontSize: 11,
        color: "CBD5E1",
        fontFace: FONT_BODY,
        lineSpacing: 18
      });
    });

    s10.addText("Readout: Clear Results · Prepared Patients · Better Healthcare Conversations", {
      x: 0.8,
      y: 6.75,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: "2DD4BF",
      align: "center",
      fontFace: FONT_HEADING
    });
  }

  // Save presentation
  const dest = outputPath || path.join(process.cwd(), "Readout_Clinical_Intelligence_Deck.pptx");
  await pres.writeFile({ fileName: dest });
  console.log(`[PPT Generator] Presentation written to ${dest}`);
  return dest;
}

// CLI execution test
if (process.argv[1] && process.argv[1].endsWith("make_presentation.js")) {
  createReadoutDeck().then((p) => {
    console.log("Deck generation complete:", p);
  }).catch((err) => {
    console.error("Deck generation failed:", err);
    process.exit(1);
  });
}
