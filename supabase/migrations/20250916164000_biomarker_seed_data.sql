-- Biomarker dictionary seed data
-- Common laboratory biomarkers with reference ranges and lifestyle notes

-- Cardiac biomarkers
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('troponin_i', 'Troponina I', 'cardiac', 'ng/mL', 0.0, 0.04, null, 0.1, 'Cardiac muscle protein indicating heart damage', 'Elevated with heart attacks, strenuous exercise, or heart muscle inflammation'),
('troponin_t', 'Troponina T', 'cardiac', 'ng/mL', 0.0, 0.01, null, 0.03, 'Cardiac muscle protein indicating heart damage', 'More specific than Troponin I, elevated in heart attacks'),
('ck_mb', 'CK-MB', 'cardiac', 'ng/mL', 0.0, 5.0, null, 10.0, 'Creatine kinase muscle-brain isoenzyme', 'Elevated in heart attacks, decreases after 2-3 days'),
('nt_probnp', 'NT-proBNP', 'cardiac', 'pg/mL', 0, 125, null, 450, 'N-terminal pro-brain natriuretic peptide', 'Elevated in heart failure, useful for monitoring treatment response'),
('bnp', 'BNP', 'cardiac', 'pg/mL', 0, 100, null, 400, 'Brain natriuretic peptide', 'Elevated in heart failure, shorter half-life than NT-proBNP');

-- Metabolic biomarkers
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('glucose', 'Glucosa', 'metabolic', 'mg/dL', 70, 100, 40, 400, 'Blood sugar level', 'Fasting glucose >126 mg/dL suggests diabetes. Affected by diet, exercise, medications'),
('hba1c', 'Hemoglobina A1c', 'metabolic', '%', 4.0, 5.6, null, 7.0, 'Average blood glucose over 2-3 months', 'Target <7% for diabetics. Reflects long-term glucose control'),
('insulin', 'Insulina', 'metabolic', 'μU/mL', 2.6, 24.9, null, null, 'Pancreatic hormone regulating glucose', 'Elevated in insulin resistance, type 2 diabetes'),
('c_peptide', 'C-Péptido', 'metabolic', 'ng/mL', 0.9, 3.7, null, null, 'Marker of insulin production', 'Low in type 1 diabetes, high in insulin resistance'),
('triglycerides', 'Triglicéridos', 'metabolic', 'mg/dL', 0, 150, null, 500, 'Blood fat levels', 'Elevated with high-carb diet, alcohol, diabetes, obesity');

-- Lipid panel
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('total_cholesterol', 'Colesterol Total', 'lipid', 'mg/dL', 0, 200, null, 300, 'Total cholesterol in blood', 'Target <200 mg/dL. Affected by diet, exercise, genetics'),
('ldl_cholesterol', 'LDL Colesterol', 'lipid', 'mg/dL', 0, 100, null, 190, 'Low-density lipoprotein cholesterol', 'Target <100 mg/dL. "Bad" cholesterol, increases heart disease risk'),
('hdl_cholesterol', 'HDL Colesterol', 'lipid', 'mg/dL', 40, null, 20, null, 'High-density lipoprotein cholesterol', 'Target >40 mg/dL. "Good" cholesterol, protects against heart disease'),
('non_hdl_cholesterol', 'Colesterol No-HDL', 'lipid', 'mg/dL', 0, 130, null, 220, 'Total cholesterol minus HDL', 'Target <130 mg/dL. Better predictor than LDL alone');

-- Renal biomarkers
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('creatinine', 'Creatinina', 'renal', 'mg/dL', 0.6, 1.2, null, 2.0, 'Kidney function marker', 'Elevated with kidney disease, dehydration, muscle mass. Affected by age, gender'),
('bun', 'BUN', 'renal', 'mg/dL', 7, 20, null, 30, 'Blood urea nitrogen', 'Elevated with kidney disease, dehydration, high protein diet'),
('egfr', 'TFG estimada', 'renal', 'mL/min/1.73m²', 90, null, 15, null, 'Estimated glomerular filtration rate', 'Target >90. Decreases with age, kidney disease'),
('cystatin_c', 'Cistatina C', 'renal', 'mg/L', 0.6, 1.0, null, 1.5, 'Kidney function marker', 'More accurate than creatinine, less affected by muscle mass'),
('microalbumin', 'Microalbúmina', 'renal', 'mg/g', 0, 30, null, 300, 'Early kidney damage marker', 'Elevated in diabetes, hypertension, kidney disease');

-- Liver biomarkers
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('alt', 'ALT', 'liver', 'U/L', 7, 56, null, 200, 'Alanine aminotransferase', 'Elevated with liver damage, hepatitis, fatty liver, medications'),
('ast', 'AST', 'liver', 'U/L', 10, 40, null, 200, 'Aspartate aminotransferase', 'Elevated with liver damage, heart damage, muscle damage'),
('alkaline_phosphatase', 'Fosfatasa Alcalina', 'liver', 'U/L', 44, 147, null, 300, 'Liver and bone enzyme', 'Elevated with liver disease, bone disease, pregnancy'),
('total_bilirubin', 'Bilirrubina Total', 'liver', 'mg/dL', 0.3, 1.2, null, 3.0, 'Liver function marker', 'Elevated with liver disease, bile duct obstruction, hemolysis'),
('albumin', 'Albúmina', 'liver', 'g/dL', 3.5, 5.0, 2.0, null, 'Liver protein synthesis marker', 'Low with liver disease, malnutrition, inflammation');

-- Electrolytes
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('sodium', 'Sodio', 'electrolyte', 'mEq/L', 136, 145, 120, 160, 'Blood sodium level', 'Critical for fluid balance. Affected by hydration, kidney function'),
('potassium', 'Potasio', 'electrolyte', 'mEq/L', 3.5, 5.0, 2.5, 6.5, 'Blood potassium level', 'Critical for heart rhythm. Affected by kidney function, medications'),
('chloride', 'Cloruro', 'electrolyte', 'mEq/L', 98, 107, 80, 120, 'Blood chloride level', 'Usually follows sodium levels. Affected by acid-base balance'),
('co2', 'CO2', 'electrolyte', 'mEq/L', 22, 28, 15, 35, 'Bicarbonate level', 'Reflects acid-base balance. Low in acidosis, high in alkalosis'),
('calcium', 'Calcio', 'electrolyte', 'mg/dL', 8.5, 10.5, 7.0, 12.0, 'Blood calcium level', 'Critical for bones, nerves, muscles. Affected by parathyroid, vitamin D');

-- Complete blood count
insert into public.biomarkers (name, display_name, category, unit, reference_min, reference_max, critical_min, critical_max, description, lifestyle_notes) values
('hemoglobin', 'Hemoglobina', 'cbc', 'g/dL', 12.0, 16.0, 7.0, 20.0, 'Oxygen-carrying protein', 'Low indicates anemia. Affected by iron, B12, folate deficiency'),
('hematocrit', 'Hematocrito', 'cbc', '%', 36, 46, 21, 60, 'Percentage of blood that is red cells', 'Low indicates anemia. Follows hemoglobin levels'),
('wbc', 'Leucocitos', 'cbc', 'K/μL', 4.5, 11.0, 2.0, 30.0, 'White blood cell count', 'Elevated with infection, inflammation. Low with immune suppression'),
('platelets', 'Plaquetas', 'cbc', 'K/μL', 150, 450, 50, 1000, 'Blood clotting cells', 'Low increases bleeding risk. High increases clotting risk'),
('mcv', 'VCM', 'cbc', 'fL', 80, 100, 60, 120, 'Mean corpuscular volume', 'Size of red blood cells. High in B12/folate deficiency, low in iron deficiency');

-- Lab sources
insert into public.lab_sources (name, display_name, description) values
('manual_entry', 'Entrada Manual', 'Manually entered lab results'),
('pdf_upload', 'Carga de PDF', 'Lab results extracted from uploaded PDF documents'),
('photo_upload', 'Carga de Foto', 'Lab results extracted from uploaded photos'),
('api_integration', 'Integración API', 'Lab results from integrated laboratory systems');
