// Clinical reference vocabularies used to drive autofill across the app's free-text
// clinical fields. Mirrors the philosophy of data/labReference.ts: every list is a
// curated starting point, and every field that consumes it keeps free-text entry
// (MUI Autocomplete `freeSolo`) so nothing is lost — these only speed up the common case.
//
//   • Allergens   → CreatePatientDialog (Allergies)
//   • Diagnoses   → CreatePatientDialog (Diagnoses), ChartReviewTab (Encounter diagnosis)
//   • Medications → MARTab (autofills dose/route/frequency), OrdersTab (Medication orders)
//   • Diet / Nursing / Therapy order catalogs → OrdersTab sub-tabs
//
// Medication route/frequency strings intentionally match the option values in MARTab so a
// selected default lands on a valid Select option.

// ---------------------------------------------------------------------------
// Allergies
// ---------------------------------------------------------------------------

// Common drug, food, and environmental allergens. "No Known Allergies (NKA)" lets a nurse
// document the explicit negative, as real charting systems require.
export const ALLERGENS: string[] = [
  'No Known Allergies (NKA)',
  'No Known Drug Allergies (NKDA)',
  // Drugs
  'Penicillin',
  'Amoxicillin',
  'Ampicillin',
  'Cephalosporins',
  'Sulfa (Sulfonamides)',
  'Aspirin',
  'NSAIDs (Ibuprofen, Naproxen)',
  'Ibuprofen',
  'Codeine',
  'Morphine',
  'Hydrocodone',
  'Oxycodone',
  'Tramadol',
  'Acetaminophen',
  'Erythromycin',
  'Azithromycin',
  'Ciprofloxacin',
  'Levofloxacin',
  'Vancomycin',
  'Tetracycline',
  'Clindamycin',
  'Metronidazole',
  'Heparin',
  'Warfarin',
  'Insulin',
  'Lisinopril (ACE inhibitor)',
  'Statins',
  'Phenytoin',
  'Carbamazepine',
  'Lamotrigine',
  'Allopurinol',
  'Contrast Dye (Iodinated)',
  'Gadolinium Contrast',
  'Local Anesthetics (Lidocaine)',
  'Latex',
  // Foods
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Fish',
  'Eggs',
  'Milk / Dairy',
  'Soy',
  'Wheat / Gluten',
  'Sesame',
  'Strawberries',
  // Environmental / other
  'Bee / Wasp Stings',
  'Pollen',
  'Dust Mites',
  'Animal Dander',
  'Mold',
  'Adhesive / Tape',
  'Chlorhexidine',
  'Iodine / Betadine',
]

// Common allergic reactions — for documenting the reaction alongside the allergen.
export const ALLERGY_REACTIONS: string[] = [
  'Rash',
  'Hives (Urticaria)',
  'Itching (Pruritus)',
  'Swelling (Angioedema)',
  'Anaphylaxis',
  'Difficulty breathing',
  'Wheezing',
  'Nausea / Vomiting',
  'Diarrhea',
  'Dizziness',
  'Hypotension',
  'Throat tightness',
  'GI upset',
  'Unknown',
]

// ---------------------------------------------------------------------------
// Diagnoses
// ---------------------------------------------------------------------------

// Common admitting / working diagnoses across med-surg, cardiac, respiratory, endocrine,
// renal, GI, neuro, and infectious presentations students are likely to chart.
export const DIAGNOSES: string[] = [
  // Cardiovascular
  'Hypertension',
  'Hypertensive Crisis',
  'Coronary Artery Disease',
  'Acute Myocardial Infarction (STEMI)',
  'Acute Myocardial Infarction (NSTEMI)',
  'Unstable Angina',
  'Congestive Heart Failure',
  'Atrial Fibrillation',
  'Deep Vein Thrombosis (DVT)',
  'Pulmonary Embolism',
  'Peripheral Vascular Disease',
  'Cardiogenic Shock',
  'Hyperlipidemia',
  // Respiratory
  'Pneumonia',
  'COPD Exacerbation',
  'Asthma Exacerbation',
  'Acute Respiratory Failure',
  'Acute Respiratory Distress Syndrome (ARDS)',
  'Pleural Effusion',
  'COVID-19',
  'Bronchitis',
  // Endocrine / Metabolic
  'Type 1 Diabetes Mellitus',
  'Type 2 Diabetes Mellitus',
  'Diabetic Ketoacidosis (DKA)',
  'Hyperosmolar Hyperglycemic State (HHS)',
  'Hypoglycemia',
  'Hypothyroidism',
  'Hyperthyroidism',
  'Electrolyte Imbalance',
  'Dehydration',
  // Renal / GU
  'Acute Kidney Injury',
  'Chronic Kidney Disease',
  'End-Stage Renal Disease',
  'Urinary Tract Infection',
  'Pyelonephritis',
  'Nephrolithiasis (Kidney Stones)',
  'Urinary Retention',
  // GI
  'Gastrointestinal Bleed',
  'Gastroesophageal Reflux Disease (GERD)',
  'Peptic Ulcer Disease',
  'Pancreatitis',
  'Cholecystitis',
  'Small Bowel Obstruction',
  'Diverticulitis',
  'Cirrhosis',
  'Hepatic Encephalopathy',
  'Appendicitis',
  // Neuro
  'Cerebrovascular Accident (Stroke)',
  'Transient Ischemic Attack (TIA)',
  'Seizure Disorder',
  'Altered Mental Status',
  'Dementia',
  'Parkinson Disease',
  'Migraine',
  // Infectious / Other
  'Sepsis',
  'Septic Shock',
  'Cellulitis',
  'Influenza',
  'Clostridioides difficile Infection',
  'Anemia',
  'Falls / Fall Risk',
  'Pressure Injury',
  'Post-Operative Status',
  'Acute Pain',
  'Chronic Pain',
  'Failure to Thrive',
]

// ---------------------------------------------------------------------------
// Medications
// ---------------------------------------------------------------------------

export interface MedicationDef {
  /** Canonical display name, e.g. "Metoprolol (Lopressor)". */
  name: string
  /** Searchable synonyms / brand or generic names. */
  aliases?: string[]
  /** Therapeutic class (shown as the group / detail hint). */
  drugClass: string
  /** A typical starting dose to prefill (still editable). */
  defaultDose: string
  /** Must match a value in MARTab ROUTES. */
  defaultRoute: string
  /** Must match a value in MARTab FREQUENCIES. */
  defaultFrequency: string
}

export const MEDICATIONS: MedicationDef[] = [
  // Cardiovascular
  { name: 'Lisinopril', aliases: ['Prinivil', 'Zestril'], drugClass: 'ACE Inhibitor', defaultDose: '10 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Losartan', aliases: ['Cozaar'], drugClass: 'ARB', defaultDose: '50 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Metoprolol Tartrate', aliases: ['Lopressor'], drugClass: 'Beta Blocker', defaultDose: '25 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Metoprolol Succinate', aliases: ['Toprol XL'], drugClass: 'Beta Blocker', defaultDose: '50 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Carvedilol', aliases: ['Coreg'], drugClass: 'Beta Blocker', defaultDose: '6.25 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Amlodipine', aliases: ['Norvasc'], drugClass: 'Calcium Channel Blocker', defaultDose: '5 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Diltiazem', aliases: ['Cardizem'], drugClass: 'Calcium Channel Blocker', defaultDose: '30 mg', defaultRoute: 'Oral', defaultFrequency: 'Four times daily (QID)' },
  { name: 'Hydrochlorothiazide', aliases: ['HCTZ', 'Microzide'], drugClass: 'Thiazide Diuretic', defaultDose: '25 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Furosemide', aliases: ['Lasix'], drugClass: 'Loop Diuretic', defaultDose: '40 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Spironolactone', aliases: ['Aldactone'], drugClass: 'Potassium-Sparing Diuretic', defaultDose: '25 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Atorvastatin', aliases: ['Lipitor'], drugClass: 'Statin', defaultDose: '40 mg', defaultRoute: 'Oral', defaultFrequency: 'At bedtime (HS)' },
  { name: 'Simvastatin', aliases: ['Zocor'], drugClass: 'Statin', defaultDose: '20 mg', defaultRoute: 'Oral', defaultFrequency: 'At bedtime (HS)' },
  { name: 'Aspirin', aliases: ['ASA'], drugClass: 'Antiplatelet', defaultDose: '81 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Clopidogrel', aliases: ['Plavix'], drugClass: 'Antiplatelet', defaultDose: '75 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Warfarin', aliases: ['Coumadin'], drugClass: 'Anticoagulant', defaultDose: '5 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Apixaban', aliases: ['Eliquis'], drugClass: 'Anticoagulant (DOAC)', defaultDose: '5 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Rivaroxaban', aliases: ['Xarelto'], drugClass: 'Anticoagulant (DOAC)', defaultDose: '20 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Enoxaparin', aliases: ['Lovenox'], drugClass: 'Anticoagulant (LMWH)', defaultDose: '40 mg', defaultRoute: 'Subcutaneous', defaultFrequency: 'Once daily' },
  { name: 'Heparin', drugClass: 'Anticoagulant', defaultDose: '5,000 units', defaultRoute: 'Subcutaneous', defaultFrequency: 'Every 8 hours' },
  { name: 'Digoxin', aliases: ['Lanoxin'], drugClass: 'Cardiac Glycoside', defaultDose: '0.125 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Nitroglycerin', aliases: ['Nitrostat'], drugClass: 'Nitrate', defaultDose: '0.4 mg', defaultRoute: 'Sublingual', defaultFrequency: 'As needed (PRN)' },
  // Endocrine
  { name: 'Metformin', aliases: ['Glucophage'], drugClass: 'Biguanide (Antidiabetic)', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Glipizide', aliases: ['Glucotrol'], drugClass: 'Sulfonylurea', defaultDose: '5 mg', defaultRoute: 'Oral', defaultFrequency: 'Before meals (AC)' },
  { name: 'Insulin Glargine', aliases: ['Lantus', 'Basaglar'], drugClass: 'Long-Acting Insulin', defaultDose: '10 units', defaultRoute: 'Subcutaneous', defaultFrequency: 'At bedtime (HS)' },
  { name: 'Insulin Lispro', aliases: ['Humalog'], drugClass: 'Rapid-Acting Insulin', defaultDose: '4 units', defaultRoute: 'Subcutaneous', defaultFrequency: 'Before meals (AC)' },
  { name: 'Insulin Regular', aliases: ['Humulin R', 'Novolin R'], drugClass: 'Short-Acting Insulin', defaultDose: 'Per sliding scale', defaultRoute: 'Subcutaneous', defaultFrequency: 'Before meals (AC)' },
  { name: 'Levothyroxine', aliases: ['Synthroid'], drugClass: 'Thyroid Hormone', defaultDose: '50 mcg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Prednisone', aliases: ['Deltasone'], drugClass: 'Corticosteroid', defaultDose: '20 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Methylprednisolone', aliases: ['Solu-Medrol'], drugClass: 'Corticosteroid', defaultDose: '40 mg', defaultRoute: 'IV', defaultFrequency: 'Every 8 hours' },
  // GI
  { name: 'Pantoprazole', aliases: ['Protonix'], drugClass: 'Proton Pump Inhibitor', defaultDose: '40 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Omeprazole', aliases: ['Prilosec'], drugClass: 'Proton Pump Inhibitor', defaultDose: '20 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Famotidine', aliases: ['Pepcid'], drugClass: 'H2 Blocker', defaultDose: '20 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Ondansetron', aliases: ['Zofran'], drugClass: 'Antiemetic', defaultDose: '4 mg', defaultRoute: 'IV', defaultFrequency: 'Every 6 hours' },
  { name: 'Docusate Sodium', aliases: ['Colace'], drugClass: 'Stool Softener', defaultDose: '100 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Senna', aliases: ['Senokot'], drugClass: 'Laxative', defaultDose: '8.6 mg', defaultRoute: 'Oral', defaultFrequency: 'At bedtime (HS)' },
  { name: 'Polyethylene Glycol', aliases: ['MiraLAX'], drugClass: 'Osmotic Laxative', defaultDose: '17 g', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  // Pain / Fever
  { name: 'Acetaminophen', aliases: ['Tylenol', 'APAP'], drugClass: 'Analgesic / Antipyretic', defaultDose: '650 mg', defaultRoute: 'Oral', defaultFrequency: 'Every 6 hours' },
  { name: 'Ibuprofen', aliases: ['Motrin', 'Advil'], drugClass: 'NSAID', defaultDose: '400 mg', defaultRoute: 'Oral', defaultFrequency: 'Every 6 hours' },
  { name: 'Ketorolac', aliases: ['Toradol'], drugClass: 'NSAID', defaultDose: '15 mg', defaultRoute: 'IV', defaultFrequency: 'Every 6 hours' },
  { name: 'Morphine', drugClass: 'Opioid Analgesic', defaultDose: '2 mg', defaultRoute: 'IV', defaultFrequency: 'As needed (PRN)' },
  { name: 'Hydromorphone', aliases: ['Dilaudid'], drugClass: 'Opioid Analgesic', defaultDose: '0.5 mg', defaultRoute: 'IV', defaultFrequency: 'As needed (PRN)' },
  { name: 'Oxycodone', aliases: ['OxyContin', 'Roxicodone'], drugClass: 'Opioid Analgesic', defaultDose: '5 mg', defaultRoute: 'Oral', defaultFrequency: 'As needed (PRN)' },
  { name: 'Oxycodone-Acetaminophen', aliases: ['Percocet'], drugClass: 'Opioid Combination', defaultDose: '5/325 mg', defaultRoute: 'Oral', defaultFrequency: 'As needed (PRN)' },
  { name: 'Tramadol', aliases: ['Ultram'], drugClass: 'Opioid Analgesic', defaultDose: '50 mg', defaultRoute: 'Oral', defaultFrequency: 'As needed (PRN)' },
  // Anti-infectives
  { name: 'Ceftriaxone', aliases: ['Rocephin'], drugClass: 'Cephalosporin Antibiotic', defaultDose: '1 g', defaultRoute: 'IV', defaultFrequency: 'Once daily' },
  { name: 'Cefepime', aliases: ['Maxipime'], drugClass: 'Cephalosporin Antibiotic', defaultDose: '1 g', defaultRoute: 'IV', defaultFrequency: 'Every 8 hours' },
  { name: 'Piperacillin-Tazobactam', aliases: ['Zosyn'], drugClass: 'Penicillin Antibiotic', defaultDose: '3.375 g', defaultRoute: 'IV', defaultFrequency: 'Every 6 hours' },
  { name: 'Vancomycin', aliases: ['Vancocin'], drugClass: 'Glycopeptide Antibiotic', defaultDose: '1 g', defaultRoute: 'IV', defaultFrequency: 'Every 12 hours' },
  { name: 'Azithromycin', aliases: ['Zithromax', 'Z-Pak'], drugClass: 'Macrolide Antibiotic', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Ciprofloxacin', aliases: ['Cipro'], drugClass: 'Fluoroquinolone Antibiotic', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFrequency: 'Every 12 hours' },
  { name: 'Levofloxacin', aliases: ['Levaquin'], drugClass: 'Fluoroquinolone Antibiotic', defaultDose: '750 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Metronidazole', aliases: ['Flagyl'], drugClass: 'Antibiotic', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFrequency: 'Every 8 hours' },
  { name: 'Amoxicillin-Clavulanate', aliases: ['Augmentin'], drugClass: 'Penicillin Antibiotic', defaultDose: '875 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  // Respiratory
  { name: 'Albuterol', aliases: ['ProAir', 'Ventolin'], drugClass: 'Bronchodilator (SABA)', defaultDose: '2.5 mg (neb)', defaultRoute: 'Inhalation', defaultFrequency: 'Every 6 hours' },
  { name: 'Ipratropium-Albuterol', aliases: ['DuoNeb', 'Combivent'], drugClass: 'Bronchodilator Combination', defaultDose: '3 mL (neb)', defaultRoute: 'Inhalation', defaultFrequency: 'Every 6 hours' },
  { name: 'Fluticasone-Salmeterol', aliases: ['Advair'], drugClass: 'Inhaled Corticosteroid/LABA', defaultDose: '1 puff', defaultRoute: 'Inhalation', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Tiotropium', aliases: ['Spiriva'], drugClass: 'Bronchodilator (LAMA)', defaultDose: '1 capsule', defaultRoute: 'Inhalation', defaultFrequency: 'Once daily' },
  // Neuro / Psych
  { name: 'Gabapentin', aliases: ['Neurontin'], drugClass: 'Anticonvulsant', defaultDose: '300 mg', defaultRoute: 'Oral', defaultFrequency: 'Three times daily (TID)' },
  { name: 'Levetiracetam', aliases: ['Keppra'], drugClass: 'Anticonvulsant', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFrequency: 'Twice daily (BID)' },
  { name: 'Lorazepam', aliases: ['Ativan'], drugClass: 'Benzodiazepine', defaultDose: '1 mg', defaultRoute: 'Oral', defaultFrequency: 'As needed (PRN)' },
  { name: 'Sertraline', aliases: ['Zoloft'], drugClass: 'SSRI Antidepressant', defaultDose: '50 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Haloperidol', aliases: ['Haldol'], drugClass: 'Antipsychotic', defaultDose: '2 mg', defaultRoute: 'Oral', defaultFrequency: 'As needed (PRN)' },
  // Other common
  { name: 'Ondansetron ODT', aliases: ['Zofran ODT'], drugClass: 'Antiemetic', defaultDose: '4 mg', defaultRoute: 'Oral', defaultFrequency: 'Every 8 hours' },
  { name: 'Potassium Chloride', aliases: ['KCl', 'Klor-Con'], drugClass: 'Electrolyte Supplement', defaultDose: '20 mEq', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Ferrous Sulfate', aliases: ['Iron'], drugClass: 'Iron Supplement', defaultDose: '325 mg', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
  { name: 'Multivitamin', drugClass: 'Supplement', defaultDose: '1 tablet', defaultRoute: 'Oral', defaultFrequency: 'Once daily' },
]

/** Case-insensitive lookup by canonical name or alias. */
export const findMedication = (name: string): MedicationDef | undefined => {
  const q = name.trim().toLowerCase()
  if (!q) return undefined
  return MEDICATIONS.find(
    (m) =>
      m.name.toLowerCase() === q ||
      (m.aliases || []).some((a) => a.toLowerCase() === q),
  )
}

// ---------------------------------------------------------------------------
// Non-lab order catalogs (Orders tab sub-tabs)
// ---------------------------------------------------------------------------

export interface OrderOption {
  name: string
  /** Autofills the Details field when it's empty. */
  detail: string
}

// Diet orders — standard hospital diet types.
export const DIET_ORDERS: OrderOption[] = [
  { name: 'Regular Diet', detail: 'No restrictions; balanced general diet.' },
  { name: 'NPO (Nothing by Mouth)', detail: 'Nothing by mouth; verify indication and duration.' },
  { name: 'Clear Liquid Diet', detail: 'Clear fluids only (broth, gelatin, clear juice, ice chips).' },
  { name: 'Full Liquid Diet', detail: 'Liquids including milk, cream soups, and ice cream.' },
  { name: 'Mechanical Soft Diet', detail: 'Soft, easily chewed foods; ground or minced as needed.' },
  { name: 'Pureed Diet', detail: 'Smooth pureed consistency for dysphagia.' },
  { name: 'Cardiac Diet', detail: 'Low sodium (2 g), low saturated fat / cholesterol.' },
  { name: 'Low Sodium Diet (2 g Na)', detail: 'Sodium restricted to 2 grams per day.' },
  { name: 'Diabetic / Carb-Controlled Diet', detail: 'Consistent carbohydrate, e.g., 1800 kcal ADA.' },
  { name: 'Renal Diet', detail: 'Restrict sodium, potassium, phosphorus, and protein per orders.' },
  { name: 'Low Residue / Low Fiber Diet', detail: 'Reduced fiber to limit stool bulk.' },
  { name: 'High Protein Diet', detail: 'Increased protein to support healing.' },
  { name: 'Dysphagia Diet', detail: 'Texture-modified per speech therapy / thickened liquids.' },
  { name: 'Tube Feeding (Enteral)', detail: 'Specify formula, rate, and route (NG/PEG).' },
  { name: 'Gluten-Free Diet', detail: 'Exclude wheat, barley, rye for celiac/intolerance.' },
]

// Nursing orders — common nurse-driven interventions and monitoring.
export const NURSING_ORDERS: OrderOption[] = [
  { name: 'Vital Signs Q4H', detail: 'Monitor and document vital signs every 4 hours.' },
  { name: 'Vital Signs Q8H', detail: 'Monitor and document vital signs every 8 hours.' },
  { name: 'Continuous Pulse Oximetry', detail: 'Continuous SpO2 monitoring; notify provider if < 92%.' },
  { name: 'Telemetry Monitoring', detail: 'Continuous cardiac monitoring; report dysrhythmias.' },
  { name: 'Strict Intake & Output', detail: 'Record all intake and output each shift.' },
  { name: 'Daily Weights', detail: 'Weigh daily, same scale, same time, before breakfast.' },
  { name: 'Fall Precautions', detail: 'Bed low/locked, call light in reach, nonskid socks, hourly rounding.' },
  { name: 'Seizure Precautions', detail: 'Padded rails, suction/O2 at bedside, low bed.' },
  { name: 'Aspiration Precautions', detail: 'HOB ≥ 30°, supervise meals, thickened liquids per SLP.' },
  { name: 'Contact Isolation', detail: 'Gown and gloves on entry; dedicated equipment.' },
  { name: 'Droplet Isolation', detail: 'Surgical mask within 6 feet of patient.' },
  { name: 'Foley Catheter Care', detail: 'Maintain closed system; daily necessity assessment.' },
  { name: 'Incentive Spirometry', detail: '10 breaths every hour while awake.' },
  { name: 'Turn & Reposition Q2H', detail: 'Reposition every 2 hours; offload pressure points.' },
  { name: 'Wound Care / Dressing Change', detail: 'Specify site, frequency, and dressing type.' },
  { name: 'Sequential Compression Devices (SCDs)', detail: 'Apply to bilateral lower extremities while in bed.' },
  { name: 'Accu-Checks (Blood Glucose)', detail: 'Point-of-care glucose AC and HS; treat per protocol.' },
  { name: 'Neuro Checks Q2H', detail: 'Assess neuro status and GCS every 2 hours.' },
  { name: 'Encourage Oral Fluids', detail: 'Encourage PO intake unless contraindicated.' },
  { name: 'Ambulate TID', detail: 'Assist patient to ambulate three times daily as tolerated.' },
]

// Therapy / consult orders — ancillary services.
export const THERAPY_ORDERS: OrderOption[] = [
  { name: 'Physical Therapy (PT) Evaluation', detail: 'Evaluate and treat; assess mobility and gait.' },
  { name: 'Occupational Therapy (OT) Evaluation', detail: 'Evaluate ADLs and recommend adaptive strategies.' },
  { name: 'Speech-Language Pathology (SLP) Evaluation', detail: 'Evaluate swallow and communication; diet recommendations.' },
  { name: 'Respiratory Therapy Consult', detail: 'Assess airway, nebulizer treatments, and oxygen needs.' },
  { name: 'Wound Care / Ostomy Consult', detail: 'Evaluate wound, staging, and dressing recommendations.' },
  { name: 'Nutrition / Dietitian Consult', detail: 'Assess nutritional status and recommend diet.' },
  { name: 'Case Management / Social Work', detail: 'Discharge planning and resource coordination.' },
  { name: 'Cardiac Rehabilitation', detail: 'Evaluate for supervised cardiac rehab program.' },
  { name: 'Palliative Care Consult', detail: 'Symptom management and goals-of-care discussion.' },
  { name: 'Pain Management Consult', detail: 'Evaluate and optimize multimodal pain regimen.' },
  { name: 'Chaplain / Spiritual Care', detail: 'Provide spiritual and emotional support.' },
]
