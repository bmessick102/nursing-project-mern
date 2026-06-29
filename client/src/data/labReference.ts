// Unified reference catalog for lab tests, used to drive autofill across the app:
//   • ResultsTab  — searchable picker that autofills category/unit/reference range and
//     renders the right input (numeric slider, qualitative select, or text), plus panel
//     quick-add.
//   • OrdersTab (Labs) — searchable order-name picker for tests and panels.
//
// Ranges are sourced from the project's categorized lab reference sheet. Anything NOT in
// the catalog still works via free-text entry, so this list can grow over time.
//
// The numeric severity model intentionally mirrors utils/vitalRanges.ts so labs and vitals
// behave consistently across the app.

import type { Severity } from 'utils/vitalRanges'

export type LabKind = 'numeric' | 'qualitative' | 'interpretive'

export interface LabCatalogEntry {
  /** Canonical display name shown in pickers and stored on the result. */
  name: string
  /** Searchable synonyms / abbreviations (e.g. "Na" for Sodium, "SGOT" for AST). */
  aliases?: string[]
  /** Must match one of the CATEGORIES in ResultsTab. */
  category: string
  kind: LabKind
  unit?: string
  /** Pre-formatted reference-range string stored on the result and shown in the table. */
  referenceRange: string
  /** Panels this test belongs to (informational / future use). */
  panels?: string[]

  // ---- numeric only ----
  /** Slider bounds — extend a little past critical thresholds so out-of-range values can still be charted. */
  min?: number
  max?: number
  normalLow?: number
  normalHigh?: number
  /** Below criticalLow or above criticalHigh is "critical". */
  criticalLow?: number
  criticalHigh?: number
  /** Slider granularity (e.g. 0.1 for creatinine, 1 for glucose). */
  step?: number

  // ---- qualitative only ----
  /** Selectable results, e.g. ['Negative','Positive']. */
  options?: string[]
  /** Expected/normal qualitative result, e.g. 'Negative'. */
  defaultResult?: string
}

/** Narrowed type for entries that drive a numeric slider. */
export interface NumericLab extends LabCatalogEntry {
  kind: 'numeric'
  unit: string
  min: number
  max: number
  normalLow: number
  normalHigh: number
  step: number
}

export const isNumericLab = (e: LabCatalogEntry): e is NumericLab => e.kind === 'numeric'

export const LAB_CATALOG: LabCatalogEntry[] = [
  // ============================ CHEMISTRY (numeric) ============================
  { name: 'Sodium (Na)', aliases: ['Na', 'Sodium', 'Serum sodium'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mEq/L', min: 110, max: 175, normalLow: 135, normalHigh: 145, criticalLow: 120, criticalHigh: 160, step: 1, referenceRange: '135-145 mEq/L', panels: ['BMP', 'CMP', 'Electrolyte Panel', 'Renal Function Panel'] },
  { name: 'Potassium (K)', aliases: ['K', 'Potassium'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mEq/L', min: 1.5, max: 8, normalLow: 3.5, normalHigh: 5.0, criticalLow: 2.5, criticalHigh: 6.5, step: 0.1, referenceRange: '3.5-5.0 mEq/L', panels: ['BMP', 'CMP', 'Electrolyte Panel', 'Renal Function Panel'] },
  { name: 'Chloride (Cl)', aliases: ['Cl', 'Chloride', 'Chlorine'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mEq/L', min: 70, max: 130, normalLow: 98, normalHigh: 106, criticalLow: 80, criticalHigh: 115, step: 1, referenceRange: '98-106 mEq/L', panels: ['BMP', 'CMP', 'Electrolyte Panel', 'Renal Function Panel'] },
  { name: 'CO2 / Bicarbonate (HCO3)', aliases: ['CO2', 'Bicarb', 'Bicarbonate', 'HCO3'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mEq/L', min: 5, max: 50, normalLow: 22, normalHigh: 26, criticalLow: 15, criticalHigh: 40, step: 1, referenceRange: '22-26 mEq/L', panels: ['BMP', 'CMP', 'Electrolyte Panel', 'Renal Function Panel'] },
  { name: 'BUN (Blood Urea Nitrogen)', aliases: ['BUN', 'Urea nitrogen', 'Serum Urea Nitrogen'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 2, max: 130, normalLow: 7, normalHigh: 20, criticalHigh: 100, step: 1, referenceRange: '7-20 mg/dL', panels: ['BMP', 'CMP', 'Renal Function Panel'] },
  { name: 'Creatinine', aliases: ['Creatinine', 'Serum creatinine'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0.1, max: 10, normalLow: 0.6, normalHigh: 1.2, criticalHigh: 7.4, step: 0.1, referenceRange: '0.6-1.2 mg/dL', panels: ['BMP', 'CMP', 'Renal Function Panel'] },
  { name: 'Glucose', aliases: ['Glucose', 'Blood sugar', 'FBG', 'Fasting Blood Sugar', 'AccuCheck'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 20, max: 500, normalLow: 70, normalHigh: 99, criticalLow: 40, criticalHigh: 400, step: 1, referenceRange: '70-99 mg/dL (fasting)', panels: ['BMP', 'CMP', 'Renal Function Panel'] },
  { name: 'Calcium (Ca)', aliases: ['Ca', 'Calcium', 'Total calcium'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 5, max: 16, normalLow: 8.5, normalHigh: 10.5, criticalLow: 7.0, criticalHigh: 13.0, step: 0.1, referenceRange: '8.5-10.5 mg/dL', panels: ['BMP', 'CMP', 'Renal Function Panel'] },
  { name: 'Ionized Calcium', aliases: ['Ionized Calcium', 'Free calcium'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 2, max: 8, normalLow: 4.5, normalHigh: 5.6, criticalLow: 3.0, criticalHigh: 6.0, step: 0.1, referenceRange: '4.5-5.6 mg/dL' },
  { name: 'Magnesium (Mg)', aliases: ['Mg', 'Magnesium'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0.5, max: 6, normalLow: 1.5, normalHigh: 2.5, criticalLow: 1.0, criticalHigh: 4.0, step: 0.1, referenceRange: '1.5-2.5 mg/dL' },
  { name: 'Phosphate (PO4)', aliases: ['Phosphate', 'Phosphorus', 'PO4', 'P'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0.5, max: 8, normalLow: 2.5, normalHigh: 4.5, criticalLow: 1.0, step: 0.1, referenceRange: '2.5-4.5 mg/dL', panels: ['Renal Function Panel'] },
  { name: 'Albumin', aliases: ['Albumin', 'Serum albumin'], category: 'CHEMISTRY', kind: 'numeric', unit: 'g/dL', min: 1, max: 7, normalLow: 3.5, normalHigh: 5.5, step: 0.1, referenceRange: '3.5-5.5 g/dL', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'Total Protein', aliases: ['Total Protein', 'Protein', 'Serum Protein'], category: 'CHEMISTRY', kind: 'numeric', unit: 'g/dL', min: 3, max: 10, normalLow: 6.0, normalHigh: 8.0, step: 0.1, referenceRange: '6.0-8.0 g/dL', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'AST (SGOT)', aliases: ['AST', 'SGOT', 'Aspartate aminotransferase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 200, normalLow: 10, normalHigh: 40, step: 1, referenceRange: '10-40 U/L', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'ALT (SGPT)', aliases: ['ALT', 'SGPT', 'Alanine aminotransferase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 200, normalLow: 7, normalHigh: 56, step: 1, referenceRange: '7-56 U/L', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'ALP (Alkaline Phosphatase)', aliases: ['ALP', 'Alkaline Phosphatase', 'Alk Phos'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 300, normalLow: 44, normalHigh: 147, step: 1, referenceRange: '44-147 U/L', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'Total Bilirubin', aliases: ['Total Bilirubin', 'Bilirubin Serum', 'Bilirubin'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 20, normalLow: 0.3, normalHigh: 1.0, criticalHigh: 15, step: 0.1, referenceRange: '0.3-1.0 mg/dL', panels: ['CMP', 'Hepatic Function Panel'] },
  { name: 'Direct Bilirubin', aliases: ['Direct Bilirubin', 'Conjugated bilirubin'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 5, normalLow: 0.1, normalHigh: 0.3, step: 0.1, referenceRange: '0.1-0.3 mg/dL', panels: ['Hepatic Function Panel'] },
  { name: 'Anion Gap', aliases: ['Anion Gap'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mEq/L', min: 0, max: 40, normalLow: 8, normalHigh: 16, step: 1, referenceRange: '8-16 mEq/L' },
  { name: 'Ammonia', aliases: ['Ammonia', 'NH3', 'Plasma ammonia'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mcg/dL', min: 0, max: 200, normalLow: 15, normalHigh: 45, step: 1, referenceRange: '15-45 mcg/dL' },
  { name: 'Amylase', aliases: ['Amylase', 'Amylase Serum', 'Serum amylase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 500, normalLow: 30, normalHigh: 110, step: 1, referenceRange: '30-110 U/L' },
  { name: 'Lipase', aliases: ['Lipase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 600, normalLow: 0, normalHigh: 160, step: 1, referenceRange: '0-160 U/L' },
  { name: 'Lactate (Lactic Acid)', aliases: ['Lactate', 'Lactic Acid'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mmol/L', min: 0, max: 10, normalLow: 0.5, normalHigh: 2.2, criticalHigh: 4, step: 0.1, referenceRange: '0.5-2.2 mmol/L' },
  { name: 'LDH', aliases: ['LDH', 'Lactate dehydrogenase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 600, normalLow: 100, normalHigh: 190, step: 1, referenceRange: '100-190 U/L' },
  { name: 'Uric Acid', aliases: ['Uric Acid'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 18, normalLow: 3.4, normalHigh: 7.0, criticalHigh: 13, step: 0.1, referenceRange: '3.4-7.0 mg/dL (blood)' },
  { name: 'HbA1c', aliases: ['HbA1c', 'HgbA1C', 'A1c', 'Glycohemoglobin', 'GHb'], category: 'CHEMISTRY', kind: 'numeric', unit: '%', min: 3, max: 15, normalLow: 4.0, normalHigh: 5.6, step: 0.1, referenceRange: '4.0-5.6%' },
  { name: 'Total Cholesterol', aliases: ['Cholesterol', 'Total Cholesterol'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 400, normalLow: 0, normalHigh: 200, step: 1, referenceRange: '<200 mg/dL (desirable)', panels: ['Lipid Panel'] },
  { name: 'LDL Cholesterol', aliases: ['LDL', 'Low-density lipoprotein'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 300, normalLow: 0, normalHigh: 100, step: 1, referenceRange: '<100 mg/dL (optimal)', panels: ['Lipid Panel'] },
  { name: 'HDL Cholesterol', aliases: ['HDL', 'High-density lipoprotein'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 10, max: 120, normalLow: 40, normalHigh: 120, step: 1, referenceRange: '>40 mg/dL (men), >50 (women)', panels: ['Lipid Panel'] },
  { name: 'Triglycerides', aliases: ['Triglycerides', 'TGs'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 600, normalLow: 0, normalHigh: 150, step: 1, referenceRange: '<150 mg/dL', panels: ['Lipid Panel'] },
  { name: 'VLDL', aliases: ['VLDL', 'Very-low-density lipoprotein'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 80, normalLow: 2, normalHigh: 30, step: 1, referenceRange: '2-30 mg/dL', panels: ['Lipid Panel'] },
  { name: 'Osmolality', aliases: ['Osmolality', 'Serum osmolality'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mOsm/kg', min: 250, max: 350, normalLow: 275, normalHigh: 295, step: 1, referenceRange: '275-295 mOsm/kg' },
  { name: 'Iron (Fe)', aliases: ['Iron', 'Fe', 'Serum iron'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mcg/dL', min: 0, max: 300, normalLow: 60, normalHigh: 170, step: 1, referenceRange: '60-170 mcg/dL', panels: ['Iron Studies'] },
  { name: 'Ferritin', aliases: ['Ferritin'], category: 'CHEMISTRY', kind: 'numeric', unit: 'ng/mL', min: 0, max: 500, normalLow: 12, normalHigh: 300, step: 1, referenceRange: 'Male 12-300, Female 12-150 ng/mL', panels: ['Iron Studies'] },
  { name: 'TIBC', aliases: ['TIBC', 'Total iron-binding capacity'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mcg/dL', min: 100, max: 600, normalLow: 250, normalHigh: 450, step: 5, referenceRange: '250-450 mcg/dL', panels: ['Iron Studies'] },
  { name: 'Transferrin Saturation', aliases: ['Transferrin saturation', 'Iron saturation'], category: 'CHEMISTRY', kind: 'numeric', unit: '%', min: 0, max: 100, normalLow: 20, normalHigh: 50, step: 1, referenceRange: '20-50%', panels: ['Iron Studies'] },
  { name: 'Vitamin B12', aliases: ['Vitamin B12', 'B12', 'Cyanocobalamin', 'Cobalamin'], category: 'CHEMISTRY', kind: 'numeric', unit: 'pg/mL', min: 0, max: 1200, normalLow: 200, normalHigh: 900, step: 10, referenceRange: '200-900 pg/mL' },
  { name: 'Vitamin D (25-OH)', aliases: ['Vitamin D', '25-hydroxyvitamin D'], category: 'CHEMISTRY', kind: 'numeric', unit: 'ng/mL', min: 0, max: 150, normalLow: 30, normalHigh: 100, step: 1, referenceRange: '30-100 ng/mL' },
  { name: 'Folate (Folic Acid)', aliases: ['Folate', 'Folic Acid'], category: 'CHEMISTRY', kind: 'numeric', unit: 'ng/mL', min: 0, max: 30, normalLow: 3, normalHigh: 20, step: 0.1, referenceRange: '3-20 ng/mL' },
  { name: 'GGT', aliases: ['GGT', 'GGTP', 'Gamma-glutamyl transferase'], category: 'CHEMISTRY', kind: 'numeric', unit: 'U/L', min: 0, max: 200, normalLow: 8, normalHigh: 61, step: 1, referenceRange: '8-61 U/L' },
  { name: 'Prealbumin', aliases: ['Prealbumin', 'Transthyretin', 'PAB'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 50, normalLow: 15, normalHigh: 36, step: 1, referenceRange: '15-36 mg/dL' },
  { name: 'eGFR', aliases: ['eGFR', 'GFR', 'Estimated glomerular filtration rate'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mL/min/1.73m²', min: 0, max: 130, normalLow: 60, normalHigh: 120, step: 1, referenceRange: '>60 mL/min/1.73 m²', panels: ['Renal Function Panel'] },
  { name: 'Creatinine Clearance', aliases: ['Creatinine Clearance'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mL/min', min: 0, max: 200, normalLow: 85, normalHigh: 125, step: 1, referenceRange: '85-125 mL/min' },
  { name: 'Homocysteine', aliases: ['Homocysteine'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mcmol/L', min: 0, max: 50, normalLow: 4, normalHigh: 14, step: 0.5, referenceRange: '4-14 mcmol/L' },
  { name: 'C-Reactive Protein (CRP)', aliases: ['CRP', 'C-Reactive Protein'], category: 'CHEMISTRY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 30, normalLow: 0, normalHigh: 1.0, step: 0.1, referenceRange: '<1.0 mg/dL (hs-CRP <3 mg/L)' },
  { name: 'Procalcitonin', aliases: ['Procalcitonin', 'PCT'], category: 'CHEMISTRY', kind: 'numeric', unit: 'ng/mL', min: 0, max: 20, normalLow: 0, normalHigh: 0.1, step: 0.05, referenceRange: '<0.1 ng/mL' },

  // ============================ HEMATOLOGY (numeric) ============================
  { name: 'WBC (White Blood Cell count)', aliases: ['WBC', 'Leukocyte count', 'White blood cell count'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'cells/mcL', min: 0, max: 50000, normalLow: 5000, normalHigh: 10000, criticalLow: 2000, criticalHigh: 30000, step: 100, referenceRange: '5,000-10,000/mcL', panels: ['CBC', 'CBC with Differential'] },
  { name: 'RBC (Red Blood Cell count)', aliases: ['RBC', 'Erythrocyte count', 'Red blood cell count'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'million/mcL', min: 2, max: 8, normalLow: 4.2, normalHigh: 6.1, step: 0.1, referenceRange: 'Male 4.7-6.1, Female 4.2-5.4 million/mcL', panels: ['CBC', 'CBC with Differential'] },
  { name: 'Hemoglobin (Hgb)', aliases: ['Hemoglobin', 'Hgb', 'Hemaglobin'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'g/dL', min: 3, max: 25, normalLow: 12, normalHigh: 18, criticalLow: 7.0, criticalHigh: 20, step: 0.1, referenceRange: 'Male 14-18, Female 12-16 g/dL', panels: ['CBC', 'CBC with Differential'] },
  { name: 'Hematocrit (Hct)', aliases: ['Hematocrit', 'Hct', 'PCV', 'Packed cell volume'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 10, max: 70, normalLow: 37, normalHigh: 52, criticalLow: 20, criticalHigh: 60, step: 1, referenceRange: 'Male 42-52%, Female 37-47%', panels: ['CBC', 'CBC with Differential'] },
  { name: 'Platelet Count', aliases: ['Platelet Count', 'Platelets', 'Thrombocyte Count'], category: 'HEMATOLOGY', kind: 'numeric', unit: '/mcL', min: 0, max: 1000000, normalLow: 150000, normalHigh: 400000, criticalLow: 20000, criticalHigh: 1000000, step: 1000, referenceRange: '150,000-400,000/mcL', panels: ['CBC', 'CBC with Differential', 'DIC Panel'] },
  { name: 'MCV', aliases: ['MCV', 'Mean corpuscular volume'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'fL', min: 60, max: 120, normalLow: 80, normalHigh: 100, step: 1, referenceRange: '80-100 fL', panels: ['CBC', 'CBC with Differential'] },
  { name: 'MCH', aliases: ['MCH', 'Mean corpuscular hemoglobin'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'pg', min: 15, max: 45, normalLow: 27, normalHigh: 33, step: 0.5, referenceRange: '27-33 pg', panels: ['CBC', 'CBC with Differential'] },
  { name: 'MCHC', aliases: ['MCHC', 'Mean corpuscular hemoglobin concentration'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'g/dL', min: 25, max: 40, normalLow: 32, normalHigh: 36, step: 0.5, referenceRange: '32-36 g/dL', panels: ['CBC', 'CBC with Differential'] },
  { name: 'RDW', aliases: ['RDW', 'Red cell distribution width'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 10, max: 25, normalLow: 11.5, normalHigh: 14.5, step: 0.1, referenceRange: '11.5-14.5%', panels: ['CBC', 'CBC with Differential'] },
  { name: 'ESR (Sed Rate)', aliases: ['ESR', 'Sed rate', 'Sedimentation Rate', 'Erythrocyte sedimentation rate'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'mm/hr', min: 0, max: 120, normalLow: 0, normalHigh: 20, step: 1, referenceRange: 'Male ≤15, Female ≤20 mm/hr' },
  { name: 'Reticulocyte Count', aliases: ['Reticulocyte count', 'Retic count'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 0, max: 10, normalLow: 0.5, normalHigh: 2.5, step: 0.1, referenceRange: '0.5-2.5%' },
  { name: 'Neutrophils', aliases: ['Neutrophil count', 'Neutrophils', 'Segs'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 0, max: 100, normalLow: 40, normalHigh: 60, step: 1, referenceRange: '40-60%', panels: ['CBC with Differential'] },
  { name: 'Lymphocytes', aliases: ['Lymphocyte Count', 'Lymphocytes', 'Lymphs'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 0, max: 100, normalLow: 20, normalHigh: 40, step: 1, referenceRange: '20-40%', panels: ['CBC with Differential'] },
  { name: 'Monocytes', aliases: ['Monocyte Count', 'Monocytes', 'Monos'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 0, max: 20, normalLow: 2, normalHigh: 8, step: 1, referenceRange: '2-8%', panels: ['CBC with Differential'] },
  { name: 'Eosinophils', aliases: ['Eosinophil Count', 'Eosinophils', 'Eos'], category: 'HEMATOLOGY', kind: 'numeric', unit: '%', min: 0, max: 20, normalLow: 0, normalHigh: 5, step: 1, referenceRange: '0-5%', panels: ['CBC with Differential'] },
  { name: 'MPV', aliases: ['MPV', 'Mean platelet volume'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'fL', min: 5, max: 15, normalLow: 7.4, normalHigh: 10.4, step: 0.1, referenceRange: '7.4-10.4 fL' },
  { name: 'Haptoglobin', aliases: ['Haptoglobin'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 300, normalLow: 30, normalHigh: 200, step: 5, referenceRange: '30-200 mg/dL' },
  { name: 'Erythropoietin (EPO)', aliases: ['EPO', 'Erythropoietin'], category: 'HEMATOLOGY', kind: 'numeric', unit: 'mU/mL', min: 0, max: 60, normalLow: 4, normalHigh: 26, step: 1, referenceRange: '4-26 mU/mL' },
  // HEMATOLOGY (qualitative)
  { name: 'Sickle Cell Screen', aliases: ['Sickle cell screen', 'Sickledex', 'Hgb S'], category: 'HEMATOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'G6PD Screen', aliases: ['G6PD screen', 'G6PD'], category: 'HEMATOLOGY', kind: 'qualitative', referenceRange: 'Normal (no deficiency)', options: ['Normal', 'Deficient'], defaultResult: 'Normal' },
  { name: 'Direct Coombs (DAT)', aliases: ['DAT', 'Coombs Direct', 'Direct antiglobulin test'], category: 'HEMATOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },

  // ============================ COAGULATION ============================
  { name: 'PT (Prothrombin Time)', aliases: ['PT', 'Prothrombin time', 'Prothrombin'], category: 'COAGULATION', kind: 'numeric', unit: 'sec', min: 8, max: 60, normalLow: 11, normalHigh: 13.5, criticalHigh: 30, step: 0.1, referenceRange: '11-13.5 sec', panels: ['Coagulation Panel', 'DIC Panel'] },
  { name: 'aPTT / PTT', aliases: ['aPTT', 'PTT', 'Activated partial thromboplastin time'], category: 'COAGULATION', kind: 'numeric', unit: 'sec', min: 20, max: 120, normalLow: 30, normalHigh: 40, criticalHigh: 70, step: 1, referenceRange: '30-40 sec', panels: ['Coagulation Panel', 'DIC Panel'] },
  { name: 'INR', aliases: ['INR', 'International normalized ratio'], category: 'COAGULATION', kind: 'numeric', unit: '', min: 0.5, max: 8, normalLow: 0.8, normalHigh: 1.1, criticalHigh: 5.0, step: 0.1, referenceRange: '0.8-1.1 (untreated)', panels: ['Coagulation Panel'] },
  { name: 'Fibrinogen', aliases: ['Fibrinogen', 'Factor 1', 'Quantitative fibrinogen'], category: 'COAGULATION', kind: 'numeric', unit: 'mg/dL', min: 50, max: 700, normalLow: 200, normalHigh: 400, criticalLow: 100, step: 10, referenceRange: '200-400 mg/dL', panels: ['DIC Panel'] },
  { name: 'D-Dimer', aliases: ['D-Dimer', 'Fragment D-dimer'], category: 'COAGULATION', kind: 'numeric', unit: 'mcg/mL FEU', min: 0, max: 10, normalLow: 0, normalHigh: 0.5, step: 0.1, referenceRange: '<0.5 mcg/mL FEU', panels: ['DIC Panel'] },
  { name: 'Antithrombin III Activity', aliases: ['Antithrombin III activity', 'Functional antithrombin III'], category: 'COAGULATION', kind: 'numeric', unit: '%', min: 0, max: 150, normalLow: 80, normalHigh: 120, step: 1, referenceRange: '80-120% activity' },
  { name: 'Lupus Anticoagulant', aliases: ['Lupus Anticoagulant'], category: 'COAGULATION', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },

  // ============================ URINALYSIS ============================
  { name: 'Specific Gravity (Urine)', aliases: ['Specific Gravity', 'Urine specific gravity'], category: 'URINALYSIS', kind: 'numeric', unit: '', min: 1.0, max: 1.04, normalLow: 1.005, normalHigh: 1.03, step: 0.001, referenceRange: '1.005-1.030', panels: ['Urinalysis'] },
  { name: 'Urine pH', aliases: ['Urine pH', 'pH (urine)'], category: 'URINALYSIS', kind: 'numeric', unit: '', min: 4, max: 9, normalLow: 4.5, normalHigh: 8.0, step: 0.5, referenceRange: '4.5-8.0', panels: ['Urinalysis'] },
  { name: 'Urobilinogen (Urine)', aliases: ['Urobilinogen', 'Urine urobilinogen'], category: 'URINALYSIS', kind: 'numeric', unit: 'mg/dL', min: 0, max: 10, normalLow: 0.2, normalHigh: 1.0, step: 0.1, referenceRange: '0.2-1.0 mg/dL', panels: ['Urinalysis'] },
  { name: 'Urine Glucose', aliases: ['Urine glucose', 'Urine Sugar'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Trace', '1+', '2+', '3+', '4+'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Urine Ketones', aliases: ['Urine ketones', 'Ketones (Urine)'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Trace', 'Small', 'Moderate', 'Large'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Urine Protein (dipstick)', aliases: ['Urine Protein', 'Proteinuria'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Trace', '1+', '2+', '3+'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Urine Blood (Heme)', aliases: ['Urine blood', 'Heme', 'Blood (urine)'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Trace', '1+', '2+', '3+'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Urine Nitrites', aliases: ['Urine Nitrites', 'Nitrates (Urine)'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Leukocyte Esterase', aliases: ['Leukocyte Esterase', 'WBC esterase'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Trace', '1+', '2+', '3+'], defaultResult: 'Negative', panels: ['Urinalysis'] },
  { name: 'Urine Bilirubin', aliases: ['Urine bilirubin', 'Bilirubin Urine'], category: 'URINALYSIS', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative', panels: ['Urinalysis'] },

  // ============================ BLOOD GAS ============================
  { name: 'ABG pH', aliases: ['pH', 'ABG pH', 'ABG'], category: 'BLOOD GAS', kind: 'numeric', unit: '', min: 6.8, max: 7.8, normalLow: 7.35, normalHigh: 7.45, criticalLow: 7.1, criticalHigh: 7.55, step: 0.01, referenceRange: '7.35-7.45', panels: ['ABG'] },
  { name: 'PaCO2', aliases: ['PCO2', 'PaCO2', 'Partial pressure of CO2'], category: 'BLOOD GAS', kind: 'numeric', unit: 'mmHg', min: 10, max: 100, normalLow: 35, normalHigh: 45, criticalLow: 20, criticalHigh: 70, step: 1, referenceRange: '35-45 mmHg', panels: ['ABG'] },
  { name: 'PaO2', aliases: ['PO2', 'PaO2', 'Partial pressure of O2'], category: 'BLOOD GAS', kind: 'numeric', unit: 'mmHg', min: 20, max: 150, normalLow: 80, normalHigh: 100, criticalLow: 40, step: 1, referenceRange: '80-100 mmHg', panels: ['ABG'] },
  { name: 'HCO3 (ABG)', aliases: ['HCO3 ABG', 'Bicarbonate ABG'], category: 'BLOOD GAS', kind: 'numeric', unit: 'mEq/L', min: 5, max: 50, normalLow: 22, normalHigh: 26, step: 1, referenceRange: '22-26 mEq/L', panels: ['ABG'] },
  { name: 'Carboxyhemoglobin (COHb)', aliases: ['COHb', 'Carboxyhemoglobin', 'CO'], category: 'BLOOD GAS', kind: 'numeric', unit: '%', min: 0, max: 50, normalLow: 0, normalHigh: 2, criticalHigh: 25, step: 0.5, referenceRange: '<2% (nonsmoker)' },
  { name: 'Methemoglobin', aliases: ['Methemoglobin', 'MetHb'], category: 'BLOOD GAS', kind: 'numeric', unit: '%', min: 0, max: 50, normalLow: 0, normalHigh: 1.5, criticalHigh: 30, step: 0.5, referenceRange: '<1.5%' },

  // ============================ CARDIAC MARKERS ============================
  { name: 'Troponin I', aliases: ['Troponin', 'Troponin I', 'Cardiac troponin'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'ng/mL', min: 0, max: 10, normalLow: 0, normalHigh: 0.04, step: 0.01, referenceRange: '<0.04 ng/mL' },
  { name: 'BNP', aliases: ['BNP', 'B-type natriuretic peptide'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'pg/mL', min: 0, max: 1000, normalLow: 0, normalHigh: 100, criticalHigh: 400, step: 5, referenceRange: '<100 pg/mL' },
  { name: 'NT-pro-BNP', aliases: ['NT-pro-BNP', 'N-terminal pro-BNP'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'pg/mL', min: 0, max: 1000, normalLow: 0, normalHigh: 125, step: 5, referenceRange: '<125 pg/mL (age-dependent)' },
  { name: 'CK (Creatine Kinase)', aliases: ['CK', 'CPK', 'Creatine kinase', 'Creatinine Kinase'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'U/L', min: 0, max: 1000, normalLow: 30, normalHigh: 170, step: 5, referenceRange: 'Male 55-170, Female 30-135 U/L' },
  { name: 'CK-MB', aliases: ['CK-MB', 'Creatine kinase-MB'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'ng/mL', min: 0, max: 50, normalLow: 0, normalHigh: 3, step: 0.5, referenceRange: '0-3 ng/mL (<5% of total CK)' },
  { name: 'Myoglobin', aliases: ['Myoglobin'], category: 'CARDIAC MARKERS', kind: 'numeric', unit: 'ng/mL', min: 0, max: 500, normalLow: 0, normalHigh: 90, step: 5, referenceRange: '<90 ng/mL' },

  // ============================ TOXICOLOGY ============================
  { name: 'Ethanol (Alcohol)', aliases: ['Alcohol', 'Ethanol', 'Ethyl alcohol', 'ETOH', 'Blood Alcohol'], category: 'TOXICOLOGY', kind: 'numeric', unit: 'mg/dL', min: 0, max: 500, normalLow: 0, normalHigh: 0, criticalHigh: 300, step: 5, referenceRange: '0 mg/dL; toxic >300-400 mg/dL' },
  { name: 'Urine Drug Screen', aliases: ['Urine drug screen', 'Multipanel drug screen', 'Drug screen panel', 'Toxicology Screening'], category: 'TOXICOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'THC (Cannabis)', aliases: ['THC', 'Cannabis', 'Tetrahydrocannabinol'], category: 'TOXICOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'Cocaine', aliases: ['Cocaine'], category: 'TOXICOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'Amphetamines (Urine)', aliases: ['Urine amphetamines', 'Amphetamines', 'Methamphetamine'], category: 'TOXICOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'Opiates', aliases: ['Opiates', 'Opioids'], category: 'TOXICOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },

  // ============================ MICROBIOLOGY ============================
  { name: 'Blood Culture', aliases: ['Blood Culture', 'Culture'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'No growth', options: ['No growth', 'Positive', 'Pending'], defaultResult: 'No growth' },
  { name: 'Urine Culture (C&S)', aliases: ['Urine C&S', 'Urine Culture', 'Culture & Sensitivity'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'No growth', options: ['No growth', 'Positive', 'Pending'], defaultResult: 'No growth' },
  { name: 'Wound Culture', aliases: ['Wound Culture', 'Soft Tissue C&S'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'No growth', options: ['No growth', 'Positive', 'Pending'], defaultResult: 'No growth' },
  { name: 'Sputum Culture (C&S)', aliases: ['Sputum C&S', 'Sputum Culture'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'No growth', options: ['No growth', 'Positive', 'Pending'], defaultResult: 'No growth' },
  { name: 'Throat/Strep Culture', aliases: ['Throat Culture', 'Strep screen', 'Rapid strep antigen', 'Strep test'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive', 'Pending'], defaultResult: 'Negative' },
  { name: 'C. difficile (CDIFF)', aliases: ['CDIFF', 'C diff', 'Clostridioides difficile toxin'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'Respiratory Virus Panel', aliases: ['Respiratory virus panel', 'SARS viral panel', 'COVID', 'Influenza'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive', 'Pending'], defaultResult: 'Negative' },
  { name: 'HIV Screen', aliases: ['HIV', 'HIV RNA viral load', 'Urine HIV'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'Non-reactive', options: ['Non-reactive', 'Reactive', 'Pending'], defaultResult: 'Non-reactive' },
  { name: 'H. pylori', aliases: ['H.Pylori', 'Helicobacter pylori test', 'Rapid urease test', 'UBT'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: 'Negative', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
  { name: 'Gram Stain', aliases: ['Gram Stain'], category: 'MICROBIOLOGY', kind: 'interpretive', referenceRange: 'No organisms seen; interpretive' },
  { name: 'TB Skin Test (PPD)', aliases: ['PPD', 'TB skin test', 'TST', 'Tuberculin skin test'], category: 'MICROBIOLOGY', kind: 'qualitative', referenceRange: '<5 mm induration (negative)', options: ['Negative', 'Positive'], defaultResult: 'Negative' },

  // ============================ ENDOCRINE ============================
  { name: 'TSH', aliases: ['TSH', 'Thyrotropin', 'Thyroid-stimulating hormone'], category: 'ENDOCRINE', kind: 'numeric', unit: 'mIU/L', min: 0, max: 20, normalLow: 0.4, normalHigh: 4.0, step: 0.1, referenceRange: '0.4-4.0 mIU/L', panels: ['Thyroid Panel'] },
  { name: 'Free T4 (FT4)', aliases: ['FT4', 'Free T4', 'Free Thyroxine'], category: 'ENDOCRINE', kind: 'numeric', unit: 'ng/dL', min: 0, max: 5, normalLow: 0.8, normalHigh: 1.8, step: 0.1, referenceRange: '0.8-1.8 ng/dL', panels: ['Thyroid Panel'] },
  { name: 'Total T3', aliases: ['T3', 'Triiodothyronine', 'Total T3'], category: 'ENDOCRINE', kind: 'numeric', unit: 'ng/dL', min: 0, max: 400, normalLow: 70, normalHigh: 200, step: 5, referenceRange: '70-200 ng/dL', panels: ['Thyroid Panel'] },
  { name: 'Total T4 (Thyroxine)', aliases: ['T4', 'Thyroxine', 'Total T4'], category: 'ENDOCRINE', kind: 'numeric', unit: 'mcg/dL', min: 0, max: 25, normalLow: 5, normalHigh: 12, step: 0.1, referenceRange: '5-12 mcg/dL' },
  { name: 'Cortisol (AM)', aliases: ['Cortisol', 'Cortisol Blood', 'Serum cortisol'], category: 'ENDOCRINE', kind: 'numeric', unit: 'mcg/dL', min: 0, max: 60, normalLow: 5, normalHigh: 23, step: 0.5, referenceRange: 'AM 5-23 mcg/dL' },
  { name: 'PTH (Parathyroid Hormone)', aliases: ['PTH', 'Parathyroid hormone'], category: 'ENDOCRINE', kind: 'numeric', unit: 'pg/mL', min: 0, max: 200, normalLow: 10, normalHigh: 65, step: 1, referenceRange: '10-65 pg/mL' },
  { name: 'Insulin (fasting)', aliases: ['Insulin', 'Insulin assay', 'Serum insulin'], category: 'ENDOCRINE', kind: 'numeric', unit: 'microU/mL', min: 0, max: 50, normalLow: 2, normalHigh: 20, step: 0.5, referenceRange: '2-20 microU/mL (fasting)' },
  { name: 'Prolactin', aliases: ['Prolactin', 'PRL', 'Prolactin Level'], category: 'ENDOCRINE', kind: 'numeric', unit: 'ng/mL', min: 0, max: 150, normalLow: 0, normalHigh: 20, step: 1, referenceRange: 'Male <15, Female <20 ng/mL' },
  { name: 'Testosterone', aliases: ['Testosterone'], category: 'ENDOCRINE', kind: 'numeric', unit: 'ng/dL', min: 0, max: 1200, normalLow: 280, normalHigh: 1100, step: 5, referenceRange: 'Male 280-1100, Female 15-70 ng/dL' },
  { name: 'Pregnancy Test (hCG, qualitative)', aliases: ['Pregnancy Test', 'HCG', 'Human chorionic gonadotropin'], category: 'ENDOCRINE', kind: 'qualitative', referenceRange: 'Negative (nonpregnant)', options: ['Negative', 'Positive'], defaultResult: 'Negative' },
]

export interface PanelDef {
  name: string
  category: string
  /** Component test names (must match LAB_CATALOG entry names). */
  members: string[]
}

export const PANELS: PanelDef[] = [
  { name: 'BMP (Basic Metabolic Panel)', category: 'CHEMISTRY', members: ['Glucose', 'BUN (Blood Urea Nitrogen)', 'Creatinine', 'Sodium (Na)', 'Potassium (K)', 'Chloride (Cl)', 'CO2 / Bicarbonate (HCO3)', 'Calcium (Ca)'] },
  { name: 'CMP (Comprehensive Metabolic Panel)', category: 'CHEMISTRY', members: ['Glucose', 'BUN (Blood Urea Nitrogen)', 'Creatinine', 'Sodium (Na)', 'Potassium (K)', 'Chloride (Cl)', 'CO2 / Bicarbonate (HCO3)', 'Calcium (Ca)', 'Albumin', 'Total Protein', 'ALP (Alkaline Phosphatase)', 'ALT (SGPT)', 'AST (SGOT)', 'Total Bilirubin'] },
  { name: 'Electrolyte Panel', category: 'CHEMISTRY', members: ['Sodium (Na)', 'Potassium (K)', 'Chloride (Cl)', 'CO2 / Bicarbonate (HCO3)'] },
  { name: 'Renal Function Panel', category: 'CHEMISTRY', members: ['BUN (Blood Urea Nitrogen)', 'Creatinine', 'eGFR', 'Sodium (Na)', 'Potassium (K)', 'Chloride (Cl)', 'CO2 / Bicarbonate (HCO3)', 'Calcium (Ca)', 'Phosphate (PO4)', 'Glucose'] },
  { name: 'Hepatic Function Panel', category: 'CHEMISTRY', members: ['Albumin', 'Total Protein', 'ALP (Alkaline Phosphatase)', 'ALT (SGPT)', 'AST (SGOT)', 'Total Bilirubin', 'Direct Bilirubin'] },
  { name: 'Lipid Panel', category: 'CHEMISTRY', members: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL'] },
  { name: 'Iron Studies', category: 'CHEMISTRY', members: ['Iron (Fe)', 'TIBC', 'Ferritin', 'Transferrin Saturation'] },
  { name: 'CBC (Complete Blood Count)', category: 'HEMATOLOGY', members: ['WBC (White Blood Cell count)', 'RBC (Red Blood Cell count)', 'Hemoglobin (Hgb)', 'Hematocrit (Hct)', 'Platelet Count', 'MCV', 'MCH', 'MCHC', 'RDW'] },
  { name: 'CBC with Differential', category: 'HEMATOLOGY', members: ['WBC (White Blood Cell count)', 'RBC (Red Blood Cell count)', 'Hemoglobin (Hgb)', 'Hematocrit (Hct)', 'Platelet Count', 'MCV', 'MCH', 'MCHC', 'RDW', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils'] },
  { name: 'Coagulation Panel', category: 'COAGULATION', members: ['PT (Prothrombin Time)', 'aPTT / PTT', 'INR'] },
  { name: 'DIC Panel', category: 'COAGULATION', members: ['PT (Prothrombin Time)', 'aPTT / PTT', 'Fibrinogen', 'D-Dimer', 'Platelet Count'] },
  { name: 'Thyroid Panel', category: 'ENDOCRINE', members: ['TSH', 'Free T4 (FT4)', 'Total T3'] },
  { name: 'ABG (Arterial Blood Gas)', category: 'BLOOD GAS', members: ['ABG pH', 'PaCO2', 'PaO2', 'HCO3 (ABG)'] },
  { name: 'Urinalysis', category: 'URINALYSIS', members: ['Specific Gravity (Urine)', 'Urine pH', 'Urine Glucose', 'Urine Protein (dipstick)', 'Urine Ketones', 'Urine Blood (Heme)', 'Urine Nitrites', 'Leukocyte Esterase', 'Urine Bilirubin', 'Urobilinogen (Urine)'] },
]

/** Look up a catalog entry by canonical name or alias (case-insensitive). */
export const findLabEntry = (name: string): LabCatalogEntry | undefined => {
  if (!name) return undefined
  const q = name.trim().toLowerCase()
  return LAB_CATALOG.find(
    (e) =>
      e.name.toLowerCase() === q ||
      (e.aliases || []).some((a) => a.toLowerCase() === q),
  )
}

/** Look up a panel by name. */
export const findPanel = (name: string): PanelDef | undefined =>
  PANELS.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())

/** Resolve a panel's member tests to their catalog entries (skips any unknown names). */
export const panelMembers = (panel: PanelDef): LabCatalogEntry[] =>
  panel.members
    .map((m) => LAB_CATALOG.find((e) => e.name === m))
    .filter((e): e is LabCatalogEntry => e !== undefined)

/** Severity of a numeric value, mirroring vitalRanges getVitalSeverity. */
export const getLabSeverity = (def: NumericLab, value: number): Severity => {
  if (Number.isNaN(value)) return 'normal'
  if (
    (def.criticalLow !== undefined && value < def.criticalLow) ||
    (def.criticalHigh !== undefined && value > def.criticalHigh)
  ) {
    return 'critical'
  }
  if (value < def.normalLow || value > def.normalHigh) return 'borderline'
  return 'normal'
}

/** Derive the H / L / C flag for a numeric value, matching the app's flag vocabulary. */
export const computeLabFlag = (def: NumericLab, value: number): '' | 'H' | 'L' | 'C' => {
  if (Number.isNaN(value)) return ''
  if (getLabSeverity(def, value) === 'critical') return 'C'
  if (value > def.normalHigh) return 'H'
  if (value < def.normalLow) return 'L'
  return ''
}

/** Default slider position when a numeric lab is first picked: midpoint of its normal range. */
export const defaultNumericValue = (def: NumericLab): number => {
  const decimals = (String(def.step).split('.')[1] || '').length
  const mid = (def.normalLow + def.normalHigh) / 2
  return parseFloat((Math.round(mid / def.step) * def.step).toFixed(decimals))
}
