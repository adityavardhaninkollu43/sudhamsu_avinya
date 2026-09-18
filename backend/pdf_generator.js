import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates an authentic, clinic-grade laboratory report PDF
 * complete with laboratory branding, patient demographics, barcode,
 * reference intervals, and medical safety disclaimers.
 */
export async function generateClinicalReportPdf(reportType = 'metabolic') {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4: 595 x 842 pt
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const colorPrimary = rgb(0.08, 0.18, 0.36); // Deep Navy
  const colorSlate = rgb(0.35, 0.40, 0.48);   // Muted Slate
  const colorInk = rgb(0.12, 0.14, 0.17);     // Dark Ink
  const colorLine = rgb(0.85, 0.88, 0.92);    // Border line
  const colorRed = rgb(0.78, 0.15, 0.15);     // High/Low Red Flag
  const colorBgSunk = rgb(0.96, 0.97, 0.98);  // Light Gray Fill

  let labName = 'MERIDIAN DIAGNOSTIC LABORATORIES';
  let labSub = 'Department of Clinical Pathology & Laboratory Medicine · ISO 15189 / CAP Certified';
  let patientName = 'Ananya Sharma';
  let patientAge = '41 Y / Female';
  let sampleId = 'ACC-2026-89410';
  let collectedDate = '04-Mar-2026, 07:40 AM';
  let reportedDate = '05-Mar-2026, 11:15 AM';
  let fastingStatus = 'Fasting: Yes (12 Hours Overnight)';
  let orderingPhysician = 'Dr. R. K. Saxena, MD (Internal Medicine)';
  let reportTitle = 'COMPREHENSIVE METABOLIC & LIPID PROFILE';
  let testRows = [];
  let comments = [];

  if (reportType === 'thyroid') {
    labName = 'QUEST DIAGNOSTIC NETWORK LABORATORIES';
    labSub = 'Specialized Endocrinology & Hematology Laboratory · CLIA #09D2081492 / CAP Accredited';
    patientName = 'Priya Sundaram';
    patientAge = '34 Y / Female';
    sampleId = 'QST-2026-44102';
    collectedDate = '12-Sep-2026, 08:15 AM';
    reportedDate = '13-Sep-2026, 02:30 PM';
    fastingStatus = 'Fasting: Yes (10 Hours)';
    orderingPhysician = 'Dr. Sarah Jenkins, MD (Endocrinology)';
    reportTitle = 'THYROID FUNCTION & ANEMIA EVALUATION PANEL';
    testRows = [
      { name: 'Haemoglobin (HGB)', value: '9.6', unit: 'g/dL', range: '12.0 - 15.5', flag: 'LOW' },
      { name: 'Serum Ferritin', value: '8.2', unit: 'ng/mL', range: '15.0 - 150.0', flag: 'LOW' },
      { name: 'Thyroid Stimulating Hormone (TSH)', value: '6.80', unit: 'µIU/mL', range: '0.40 - 4.00', flag: 'HIGH' },
      { name: 'Free Thyroxine (Free T4)', value: '0.72', unit: 'ng/dL', range: '0.80 - 1.80', flag: 'LOW' },
      { name: 'Serum Iron', value: '32', unit: 'µg/dL', range: '60 - 170', flag: 'LOW' },
      { name: 'Total Iron Binding Capacity (TIBC)', value: '412', unit: 'µg/dL', range: '240 - 450', flag: '' },
      { name: 'Platelet Count', value: '342', unit: 'x10^3/µL', range: '150 - 410', flag: '' },
      { name: 'Fasting Blood Glucose', value: '86', unit: 'mg/dL', range: '70 - 99', flag: '' },
      { name: 'Serum Creatinine', value: '0.78', unit: 'mg/dL', range: '0.60 - 1.10', flag: '' }
    ];
    comments = [
      'Microcytic hypochromic erythrocyte morphology noted on peripheral blood review.',
      'Markedly depleted ferritin indicates severe iron store depletion.',
      'Elevated TSH with subnormal Free T4 is consistent with primary hypothyroidism.'
    ];
  } else if (reportType === 'critical') {
    labName = 'ST. JUDE REGIONAL ACUTE CARE CLINICAL LABORATORIES';
    labSub = 'Critical Care & Emergency Pathology Department · 24/7 STAT Laboratory Services';
    patientName = 'Simulated Patient (Emergency Triage)';
    patientAge = '58 Y / Male';
    sampleId = 'STAT-EMERG-2026-99';
    collectedDate = '17-Sep-2026, 06:10 AM';
    reportedDate = '17-Sep-2026, 06:45 AM (STAT)';
    fastingStatus = 'Fasting: Unknown / Emergency Room Admission';
    orderingPhysician = 'Dr. M. K. Thorne, MD (Critical Care / Emergency)';
    reportTitle = 'CRITICAL CARE METABOLIC & HEMATOLOGY STAT PANEL';
    testRows = [
      { name: 'Serum Potassium (K+)', value: '6.3', unit: 'mEq/L', range: '3.5 - 5.0', flag: 'CRITICAL HIGH' },
      { name: 'Serum Sodium (Na+)', value: '118', unit: 'mEq/L', range: '136 - 145', flag: 'CRITICAL LOW' },
      { name: 'Haemoglobin (HGB)', value: '6.8', unit: 'g/dL', range: '13.0 - 17.5', flag: 'CRITICAL LOW' },
      { name: 'Blood Glucose (STAT)', value: '435', unit: 'mg/dL', range: '70 - 99', flag: 'CRITICAL HIGH' },
      { name: 'Platelet Count', value: '22', unit: 'x10^3/µL', range: '150 - 410', flag: 'CRITICAL LOW' },
      { name: 'Serum Creatinine', value: '3.4', unit: 'mg/dL', range: '0.70 - 1.30', flag: 'HIGH' },
      { name: 'White Blood Cell Count (WBC)', value: '14.2', unit: 'x10^3/µL', range: '4.0 - 11.0', flag: 'HIGH' }
    ];
    comments = [
      '*** PANIC / CRITICAL VALUE ALERT: Results immediately telephoned to ordering physician. ***',
      'Hyperkalemia (K+ 6.3 mEq/L) carries urgent cardiac arrhythmia risk. Obtain 12-lead ECG STAT.',
      'Severe symptomatic anemia (Hgb 6.8 g/dL) meets clinical transfusion consideration criteria.',
      'Severe hyponatremia (Na+ 118 mEq/L) requires controlled correction in an acute care setting.'
    ];
  } else {
    // Metabolic & Lipid
    testRows = [
      { name: 'Haemoglobin (HGB)', value: '13.4', unit: 'g/dL', range: '12.0 - 15.5', flag: '' },
      { name: 'Haematocrit (PCV)', value: '40.2', unit: '%', range: '36.0 - 46.0', flag: '' },
      { name: 'White Blood Cell Count (WBC)', value: '11.8', unit: 'x10^3/µL', range: '4.0 - 11.0', flag: 'HIGH' },
      { name: 'Platelet Count', value: '268', unit: 'x10^3/µL', range: '150 - 410', flag: '' },
      { name: 'Fasting Blood Glucose', value: '112', unit: 'mg/dL', range: '70 - 99', flag: 'HIGH' },
      { name: 'HbA1c (Glycated Haemoglobin)', value: '6.1', unit: '%', range: '4.0 - 5.6', flag: 'HIGH' },
      { name: 'Total Cholesterol', value: '214', unit: 'mg/dL', range: '< 200', flag: 'HIGH' },
      { name: 'LDL Cholesterol (Direct)', value: '141', unit: 'mg/dL', range: '< 100', flag: 'HIGH' },
      { name: 'HDL Cholesterol', value: '38', unit: 'mg/dL', range: '> 40', flag: 'LOW' },
      { name: 'Triglycerides', value: '178', unit: 'mg/dL', range: '< 150', flag: 'HIGH' },
      { name: 'Alanine Transaminase (ALT/SGPT)', value: '46', unit: 'U/L', range: '7 - 56', flag: '' },
      { name: 'Aspartate Transaminase (AST/SGOT)', value: '34', unit: 'U/L', range: '10 - 40', flag: '' },
      { name: 'Serum Creatinine', value: '0.86', unit: 'mg/dL', range: '0.60 - 1.10', flag: '' },
      { name: 'Estimated GFR (CKD-EPI)', value: '94', unit: 'mL/min', range: '> 90', flag: '' },
      { name: 'Thyroid Stimulating Hormone (TSH)', value: '2.40', unit: 'µIU/mL', range: '0.40 - 4.00', flag: '' },
      { name: 'Vitamin D (25-Hydroxy)', value: '17', unit: 'ng/mL', range: '30 - 100', flag: 'LOW' }
    ];
    comments = [
      'Elevated fasting plasma glucose and HbA1c indicative of impaired fasting glycaemia (prediabetes range).',
      'Atherogenic lipid phenotype with elevated triglycerides, reduced HDL-C, and elevated LDL-C.',
      'Vitamin D deficiency noted; clinical correlation and dietary or cholecalciferol repletion recommended.'
    ];
  }

  // --- DRAW HEADER ---
  page.drawRectangle({
    x: 36,
    y: height - 60,
    width: width - 72,
    height: 4,
    color: colorPrimary
  });

  page.drawText(labName, {
    x: 36,
    y: height - 44,
    size: 14,
    font: fontBold,
    color: colorPrimary
  });

  page.drawText(labSub, {
    x: 36,
    y: height - 56,
    size: 8,
    font: fontRegular,
    color: colorSlate
  });

  // --- REPORT TITLE BAR ---
  page.drawRectangle({
    x: 36,
    y: height - 90,
    width: width - 72,
    height: 22,
    color: colorBgSunk,
    borderColor: colorLine,
    borderWidth: 1
  });

  page.drawText(reportTitle, {
    x: 46,
    y: height - 76,
    size: 10,
    font: fontBold,
    color: colorPrimary
  });

  // Barcode mock text
  page.drawText(`BARCODE: ||||||| | |||| | |||||| ${sampleId}`, {
    x: width - 210,
    y: height - 76,
    size: 7.5,
    font: fontRegular,
    color: colorSlate
  });

  // --- PATIENT DEMOGRAPHICS BOX ---
  const demoTop = height - 100;
  page.drawRectangle({
    x: 36,
    y: demoTop - 52,
    width: width - 72,
    height: 52,
    borderColor: colorLine,
    borderWidth: 1,
    color: rgb(1, 1, 1)
  });

  // Left Column
  page.drawText('Patient Name:', { x: 44, y: demoTop - 14, size: 8, font: fontBold, color: colorSlate });
  page.drawText(patientName, { x: 105, y: demoTop - 14, size: 8.5, font: fontBold, color: colorInk });

  page.drawText('Age / Sex:', { x: 44, y: demoTop - 28, size: 8, font: fontBold, color: colorSlate });
  page.drawText(patientAge, { x: 105, y: demoTop - 28, size: 8.5, font: fontRegular, color: colorInk });

  page.drawText('Ordering MD:', { x: 44, y: demoTop - 42, size: 8, font: fontBold, color: colorSlate });
  page.drawText(orderingPhysician, { x: 105, y: demoTop - 42, size: 8.5, font: fontRegular, color: colorInk });

  // Right Column
  page.drawText('Specimen ID:', { x: 310, y: demoTop - 14, size: 8, font: fontBold, color: colorSlate });
  page.drawText(sampleId, { x: 375, y: demoTop - 14, size: 8.5, font: fontBold, color: colorInk });

  page.drawText('Collected:', { x: 310, y: demoTop - 28, size: 8, font: fontBold, color: colorSlate });
  page.drawText(collectedDate, { x: 375, y: demoTop - 28, size: 8.5, font: fontRegular, color: colorInk });

  page.drawText('Status:', { x: 310, y: demoTop - 42, size: 8, font: fontBold, color: colorSlate });
  page.drawText(`${fastingStatus}`, { x: 375, y: demoTop - 42, size: 8.5, font: fontRegular, color: colorInk });

  // --- RESULTS TABLE HEADER ---
  const tableTop = demoTop - 70;
  page.drawRectangle({
    x: 36,
    y: tableTop - 18,
    width: width - 72,
    height: 18,
    color: colorPrimary
  });

  page.drawText('INVESTIGATION / TEST NAME', { x: 44, y: tableTop - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('OBSERVED RESULT', { x: 250, y: tableTop - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('UNITS', { x: 345, y: tableTop - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('REFERENCE INTERVAL', { x: 410, y: tableTop - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('FLAG', { x: 520, y: tableTop - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });

  // --- TEST ROWS ---
  let currentY = tableTop - 20;
  const rowHeight = 17;

  testRows.forEach((t, i) => {
    // Alternating zebra row background
    if (i % 2 === 1) {
      page.drawRectangle({
        x: 36,
        y: currentY - rowHeight + 4,
        width: width - 72,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.99)
      });
    }

    // Border underline
    page.drawLine({
      start: { x: 36, y: currentY - rowHeight + 4 },
      end: { x: width - 36, y: currentY - rowHeight + 4 },
      thickness: 0.5,
      color: colorLine
    });

    const isFlagged = t.flag.length > 0;
    const isCritical = t.flag.includes('CRITICAL');
    const resultColor = isCritical ? colorRed : (isFlagged ? colorRed : colorInk);
    const resultFont = isFlagged ? fontBold : fontRegular;

    page.drawText(t.name, { x: 44, y: currentY - 8, size: 8, font: fontRegular, color: colorInk });
    page.drawText(t.value, { x: 250, y: currentY - 8, size: 8.5, font: resultFont, color: resultColor });
    page.drawText(t.unit, { x: 345, y: currentY - 8, size: 8, font: fontRegular, color: colorSlate });
    page.drawText(t.range, { x: 410, y: currentY - 8, size: 8, font: fontRegular, color: colorSlate });

    if (t.flag) {
      page.drawText(`[${t.flag}]`, { x: 510, y: currentY - 8, size: 7.5, font: fontBold, color: colorRed });
    }

    currentY -= rowHeight;
  });

  // --- CLINICAL COMMENTS BOX ---
  currentY -= 14;
  page.drawRectangle({
    x: 36,
    y: currentY - 60,
    width: width - 72,
    height: 60,
    borderColor: colorLine,
    borderWidth: 1,
    color: colorBgSunk
  });

  page.drawText('CLINICAL PATHOLOGIST OBSERVATIONS & METHODOLOGY:', {
    x: 44,
    y: currentY - 14,
    size: 7.5,
    font: fontBold,
    color: colorPrimary
  });

  let commentY = currentY - 26;
  comments.forEach((c) => {
    page.drawText(`• ${c}`, {
      x: 48,
      y: commentY,
      size: 7,
      font: fontRegular,
      color: colorInk
    });
    commentY -= 10;
  });

  // --- SAFETY FOOTER ---
  page.drawLine({
    start: { x: 36, y: 55 },
    end: { x: width - 36, y: 55 },
    thickness: 1,
    color: colorLine
  });

  page.drawText('CONFIDENTIAL MEDICAL LABORATORY RECORD · FOR PATIENT & CLINICIAN REVIEW', {
    x: 36,
    y: 42,
    size: 7,
    font: fontBold,
    color: colorSlate
  });

  page.drawText('Readout Medical AI Test Instrument — Values printed above reflect calibrated clinical reference ranges.', {
    x: 36,
    y: 30,
    size: 6.5,
    font: fontOblique,
    color: colorSlate
  });

  page.drawText(`Generated: ${new Date().toISOString().split('T')[0]} · Page 1 of 1`, {
    x: width - 150,
    y: 30,
    size: 6.5,
    font: fontRegular,
    color: colorSlate
  });

  return await pdfDoc.save();
}
