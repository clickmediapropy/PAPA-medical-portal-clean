#!/usr/bin/env python3
"""
Complete Lab Results Processor for Full Ornament PDF
Processes all laboratory test results and creates comprehensive CSV files
"""

import re
import csv
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import json

# Full lab data from the PDF
FULL_LAB_DATA = """
Signos Vitales
Altura 15.09.2025 178.00 — cm
Peso, promedio 15.09.2025 80.0 — kg
Índice de masa corporal (IMC) 15.09.2025 25.2 18.5 − 29.99 kg/m²

Análisis bioquímicos (sangre)
Alanina aminotransferasa 06.09.2025 12 7 − 55 IU/L
Alanina aminotransferasa 30.06.2025 11 7 − 55 IU/L
Alanina aminotransferasa 07.06.2025 8 7 − 55 IU/L
Alanina aminotransferasa 08.10.2024 10 7 − 55 IU/L
Alanina aminotransferasa 06.10.2024 25 7 − 55 IU/L
Alanina aminotransferasa 24.09.2024 10 7 − 55 IU/L
Alanina aminotransferasa 09.09.2024 10 7 − 55 IU/L
Alanina aminotransferasa 23.05.2024 11 7 − 55 IU/L
Albúmina suero 30.06.2025 4.2 3.5 − 5 g/dL
Albúmina suero 07.06.2025 4.4 3.5 − 5 g/dL
Albúmina suero 09.09.2024 3.8 3.5 − 5 g/dL
Albúmina suero 23.05.2024 4 3.5 − 5 g/dL
Aspartato amino transferasa 06.09.2025 12 8 − 48 IU/L
Aspartato amino transferasa 30.06.2025 9 8 − 48 IU/L
Aspartato amino transferasa 07.06.2025 10 8 − 48 IU/L
Aspartato amino transferasa 08.10.2024 11 8 − 48 IU/L
Aspartato amino transferasa 06.10.2024 19 8 − 48 IU/L
Aspartato amino transferasa 24.09.2024 10 8 − 48 IU/L
Aspartato amino transferasa 09.09.2024 11 8 − 48 IU/L
Aspartato amino transferasa 23.05.2024 10 8 − 48 IU/L
Base excess 07.06.2025 -4.1* -2.7 − 2.5 mEq/L
Base excess 06.10.2024 4.5* -2.7 − 2.5 mEq/L
Bicarbonate, serum 07.06.2025 21.5* 22 − 29 mEq/L
Bicarbonate, serum 08.10.2024 29.3* 22 − 29 mEq/L
Bicarbonate, serum 24.09.2024 35.5* 22 − 29 mEq/L
Bicarbonate, serum 23.05.2024 23.2 22 − 29 mEq/L
Bilirrubina directa 06.09.2025 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 30.06.2025 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 07.06.2025 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 08.10.2024 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 06.10.2024 0.2 0.00 − 0.29 mg/dL
Bilirrubina directa 24.09.2024 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 09.09.2024 0.1 0.00 − 0.29 mg/dL
Bilirrubina directa 23.05.2024 0.1 0.00 − 0.29 mg/dL
Bilirrubina indirecta 06.09.2025 0.2 0.00 − 1.05 mg/dL
Bilirrubina indirecta 30.06.2025 0.2 0.00 − 1.05 mg/dL
Bilirrubina indirecta 07.06.2025 0.1 0.00 − 1.05 mg/dL
Bilirrubina indirecta 24.09.2024 0.2 0.00 − 1.05 mg/dL
Bilirrubina indirecta 09.09.2024 0.2 0.00 − 1.05 mg/dL
Bilirubina total 06.09.2025 0.3 0.00 − 1.2 mg/dL
Bilirubina total 30.06.2025 0.3 0.00 − 1.2 mg/dL
Bilirubina total 07.06.2025 0.2 0.00 − 1.2 mg/dL
Bilirubina total 06.10.2024 32* 0.00 − 1.2 mg/dL
Bilirubina total 09.09.2024 0.3 0.00 − 1.2 mg/dL
Bilirubina total 23.05.2024 0.2 0.00 − 1.2 mg/dL
Calcio ionizado 30.06.2025 1.52* 1.16 − 1.31 mmol/L
Calcio suero 16.09.2025 11.5* 8.8 − 10.2 mg/dL
Calcio suero 06.09.2025 8.5* 8.8 − 10.2 mg/dL
Calcio suero 02.07.2025 11.5* 8.8 − 10.2 mg/dL
Calcio suero 01.07.2025 11.5* 8.8 − 10.2 mg/dL
Calcio suero 30.06.2025 11.5* 8.8 − 10.2 mg/dL
Calcio suero 07.06.2025 10.9* 8.8 − 10.2 mg/dL
Calcio suero 02.06.2025 11.5* 8.8 − 10.2 mg/dL
Calcio suero 08.10.2024 10.4* 8.8 − 10.2 mg/dL
Calcio suero 24.09.2024 9.9 8.8 − 10.2 mg/dL
Calcio suero 09.09.2024 9.3 8.8 − 10.2 mg/dL
Calcio suero 23.05.2024 10.1 8.8 − 10.2 mg/dL
Cloro suero 06.09.2025 100 98 − 107 mEq/L
Cloro suero 30.06.2025 105 98 − 107 mEq/L
Cloro suero 07.06.2025 100 98 − 107 mEq/L
Cloro suero 08.10.2024 102 98 − 107 mEq/L
Cloro suero 06.10.2024 108* 98 − 107 mEq/L
Cloro suero 24.09.2024 98 98 − 107 mEq/L
Cloro suero 09.09.2024 109* 98 − 107 mEq/L
Cloro suero 23.05.2024 110* 98 − 107 mEq/L
Colesterol HDL 06.09.2025 65 39.98 − 99.99 mg/dL
Colesterol HDL 30.06.2025 56 39.98 − 99.99 mg/dL
Colesterol HDL 07.06.2025 58 39.98 − 99.99 mg/dL
Colesterol HDL 08.10.2024 56 39.98 − 99.99 mg/dL
Colesterol HDL 24.09.2024 64 39.98 − 99.99 mg/dL
Colesterol HDL 09.09.2024 57 39.98 − 99.99 mg/dL
Colesterol HDL 23.05.2024 55 39.98 − 99.99 mg/dL
Colesterol LDL 06.09.2025 103* 0.00 − 99.99 mg/dL
Colesterol LDL 30.06.2025 70 0.00 − 99.99 mg/dL
Colesterol LDL 07.06.2025 81 0.00 − 99.99 mg/dL
Colesterol LDL 08.10.2024 83 0.00 − 99.99 mg/dL
Colesterol LDL 24.09.2024 68 0.00 − 99.99 mg/dL
Colesterol LDL 09.09.2024 91 0.00 − 99.99 mg/dL
Colesterol LDL 23.05.2024 68 0.00 − 99.99 mg/dL
Colesterol no HDL 07.06.2025 93 0.00 − 129.99 mg/dL
Colesterol total 06.09.2025 180 125.01 − 199.01 mg/dL
Colesterol total 01.07.2025 137 125.01 − 199.01 mg/dL
Colesterol total 30.06.2025 137 125.01 − 199.01 mg/dL
Colesterol total 07.06.2025 151 125.01 − 199.01 mg/dL
Colesterol total 08.10.2024 136 125.01 − 199.01 mg/dL
Colesterol total 24.09.2024 140 125.01 − 199.01 mg/dL
Colesterol total 09.09.2024 159 125.01 − 199.01 mg/dL
Colesterol total 23.05.2024 139 125.01 − 199.01 mg/dL
Colesterol VLDL 06.09.2025 12 0.00 − 30 mg/dL
Colesterol VLDL 30.06.2025 11 0.00 − 30 mg/dL
Colesterol VLDL 07.06.2025 12 0.00 − 30 mg/dL
Colesterol VLDL 08.10.2024 17 0.00 − 30 mg/dL
Colesterol VLDL 24.09.2024 14 0.00 − 30 mg/dL
Colesterol VLDL 09.09.2024 11 0.00 − 30 mg/dL
Colesterol VLDL 23.05.2024 16 0.00 − 30 mg/dL
Creatina quinasa MB (CK-MB) 07.06.2025 13 5 − 25 IU/L
Creatinfosfoquinasa (CK o CPK) 07.06.2025 82 39 − 308 IU/L
Creatinina suero 16.09.2025 10.5* 0.70 − 1.25 mg/dL
Creatinina suero 06.09.2025 8.2* 0.70 − 1.25 mg/dL
Creatinina suero 02.07.2025 10.5* 0.70 − 1.25 mg/dL
Creatinina suero 01.07.2025 10.5* 0.70 − 1.25 mg/dL
Creatinina suero 30.06.2025 10.5* 0.70 − 1.25 mg/dL
Creatinina suero 07.06.2025 9.4* 0.70 − 1.25 mg/dL
Creatinina suero 02.06.2025 10.5* 0.70 − 1.25 mg/dL
Creatinina suero 08.10.2024 10.1* 0.70 − 1.25 mg/dL
Creatinina suero 06.10.2024 1 0.70 − 1.25 mg/dL
Creatinina suero 24.09.2024 8.6* 0.70 − 1.25 mg/dL
Creatinina suero 09.09.2024 8* 0.70 − 1.25 mg/dL
Creatinina suero 23.05.2024 6.6* 0.70 − 1.25 mg/dL
Ferritina 06.09.2025 234.2 24 − 379.99 ng/mL
Ferritina 30.06.2025 196.8 24 − 379.99 ng/mL
Ferritina 24.09.2024 330.5 24 − 379.99 ng/mL
Ferritina 23.05.2024 317.5 24 − 379.99 ng/mL
Fosfatasa alcalina 06.09.2025 72 40 − 129 IU/L
Fosfatasa alcalina 30.06.2025 49 40 − 129 IU/L
Fosfatasa alcalina 07.06.2025 63 40 − 129 IU/L
Fosfatasa alcalina 08.10.2024 84 40 − 129 IU/L
Fosfatasa alcalina 06.10.2024 67 40 − 129 IU/L
Fosfatasa alcalina 24.09.2024 81 40 − 129 IU/L
Fosfatasa alcalina 09.09.2024 110 40 − 129 IU/L
Fosfatasa alcalina 23.05.2024 86 40 − 129 IU/L
Fosfato suero 16.09.2025 5.2* 2.5 − 4.5 mg/dL
Fosfato suero 06.09.2025 5.6* 2.5 − 4.5 mg/dL
Fosfato suero 02.07.2025 5.2* 2.5 − 4.5 mg/dL
Fosfato suero 01.07.2025 5.2* 2.5 − 4.5 mg/dL
Fosfato suero 30.06.2025 5.2* 2.5 − 4.5 mg/dL
Fosfato suero 07.06.2025 4.9* 2.5 − 4.5 mg/dL
Fosfato suero 02.06.2025 5.2* 2.5 − 4.5 mg/dL
Fosfato suero 24.09.2024 8.5* 2.5 − 4.5 mg/dL
Fosfato suero 09.09.2024 8* 2.5 − 4.5 mg/dL
Fosfato suero 23.05.2024 6* 2.5 − 4.5 mg/dL
Gamma glutamil transferasa (GGT) 06.09.2025 12 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 30.06.2025 9 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 07.06.2025 11 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 08.10.2024 17 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 06.10.2024 17 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 24.09.2024 11 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 09.09.2024 10 8 − 61 IU/L
Gamma glutamil transferasa (GGT) 23.05.2024 18 8 − 61 IU/L
Globulina 07.06.2025 1.3* 2 − 3.5 g/dL
Glucosa 06.09.2025 78 70.26 − 99.09 mg/dL
Glucosa 01.07.2025 80 70.26 − 99.09 mg/dL
Glucosa 30.06.2025 80 70.26 − 99.09 mg/dL
Glucosa 07.06.2025 113* 70.26 − 99.09 mg/dL
Glucosa 08.10.2024 100* 70.26 − 99.09 mg/dL
Glucosa 24.09.2024 100* 70.26 − 99.09 mg/dL
Glucosa 24.09.2024 78 70.26 − 99.09 mg/dL
Glucosa 09.09.2024 91 70.26 − 99.09 mg/dL
Glucosa 23.05.2024 88 70.26 − 99.09 mg/dL
Glucosa media estimada 08.10.2024 0.2* 90.98 − 114.04 mg/dL
Hemoglobina A1c 06.09.2025 4.3* 4.8 − 5.6 %
Hemoglobina A1c 01.07.2025 4.8 4.8 − 5.6 %
Hemoglobina A1c 23.05.2024 4.6* 4.8 − 5.6 %
Hierro suero 24.09.2024 37* 50 − 150 mcg/dL
Hierro suero 23.05.2024 41* 50 − 150 mcg/dL
LDH (Lactato deshidrogenasa) 07.06.2025 160 122 − 222 IU/L
Magnesio 06.09.2025 2.5* 1.7 − 2.3 mg/dL
Magnesio 30.06.2025 2.6* 1.7 − 2.3 mg/dL
Magnesio 07.06.2025 2.3* 1.7 − 2.3 mg/dL
Magnesio 08.10.2024 2.5* 1.7 − 2.3 mg/dL
Magnesio 24.09.2024 0.2* 1.7 − 2.3 mg/dL
Magnesio 09.09.2024 2.5* 1.7 − 2.3 mg/dL
Magnesio 23.05.2024 2.3* 1.7 − 2.3 mg/dL
Oxygen saturation (SO2), blood 07.06.2025 55.8* 95 − 100 %
Oxygen saturation (SO2), blood 24.09.2024 49.7* 95 − 100 %
Oxygen saturation (SO2), blood 23.05.2024 70.3* 95 − 100 %
PaCO2 07.06.2025 47* 35 − 45 mmHg
PaCO2 08.10.2024 48.9* 35 − 45 mmHg
PaCO2 24.09.2024 58.3* 35 − 45 mmHg
PaCO2 23.05.2024 43.4 35 − 45 mmHg
paO2 07.06.2025 32.6* 75 − 99.98 mmHg
paO2 08.10.2024 53.2* 75 − 99.98 mmHg
paO2 23.05.2024 42.3* 75 − 99.98 mmHg
pH, blood 07.06.2025 7.28* 7.35 − 7.45 %
pH, blood 24.09.2024 7.44 7.35 − 7.45 %
pH, blood 23.05.2024 7.36 7.35 − 7.45 %
Potasio suero 06.09.2025 5.2 3.6 − 5.2 mEq/L
Potasio suero 30.06.2025 4.9 3.6 − 5.2 mEq/L
Potasio suero 07.06.2025 5.1 3.6 − 5.2 mEq/L
Potasio suero 08.10.2024 6.1* 3.6 − 5.2 mEq/L
Potasio suero 24.09.2024 4.3 3.6 − 5.2 mEq/L
Potasio suero 09.09.2024 5.1 3.6 − 5.2 mEq/L
Potasio suero 23.05.2024 5.8* 3.6 − 5.2 mEq/L
Prealbumin, serum 09.09.2024 32.4 10 − 36 mg/dL
Proteína C reactiva 07.06.2025 2 0.00 − 5 mg/L
Proteína C reactiva 08.10.2024 1.2* 0.00 − 0.50 mg/dL
Proteína C reactiva 24.09.2024 1.2* 0.00 − 0.50 mg/dL
Proteína C reactiva 09.09.2024 0.4 0.00 − 0.50 mg/dL
Proteína C reactiva 23.05.2024 0.4 0.00 − 0.50 mg/dL
Proteínas totales suero 30.06.2025 5.8* 6 − 8.3 g/dL
Proteínas totales suero 07.06.2025 5.7* 6 − 8.3 g/dL
Proteínas totales suero 24.09.2024 5.3* 6 − 8.3 g/dL
Relación Albúmina/Globulina 07.06.2025 3.38* 1.1 − 2.5 ×100%
Sodio suero 06.09.2025 140 135 − 146 mEq/L
Sodio suero 30.06.2025 142 135 − 146 mEq/L
Sodio suero 07.06.2025 137 135 − 146 mEq/L
Sodio suero 08.10.2024 143 135 − 146 mEq/L
Sodio suero 06.10.2024 143 135 − 146 mEq/L
Sodio suero 24.09.2024 141 135 − 146 mEq/L
Sodio suero 09.09.2024 141 135 − 146 mEq/L
Sodio suero 23.05.2024 143 135 − 146 mEq/L
Transferrina 24.09.2024 174* 199 − 358.2 mg/dL
Transferrina 23.05.2024 180* 199 − 358.2 mg/dL
Triglicéridos 06.09.2025 60 0.00 − 150.45 mg/dL
Triglicéridos 01.07.2025 56 0.00 − 150.45 mg/dL
Triglicéridos 30.06.2025 56 0.00 − 150.45 mg/dL
Triglicéridos 07.06.2025 58 0.00 − 150.45 mg/dL
Triglicéridos 24.09.2024 5.3 0.00 − 150.45 mg/dL
Triglicéridos 24.09.2024 68 0.00 − 150.45 mg/dL
Triglicéridos 09.09.2024 54 0.00 − 150.45 mg/dL
Triglicéridos 23.05.2024 80 0.00 − 150.45 mg/dL
Urea suero 06.09.2025 126* 18.02 − 55.26 mg/dL
Urea suero 02.07.2025 173* 18.02 − 55.26 mg/dL
Urea suero 01.07.2025 173* 18.02 − 55.26 mg/dL
Urea suero 30.06.2025 173* 18.02 − 55.26 mg/dL
Urea suero 07.06.2025 127* 18.02 − 55.26 mg/dL
Urea suero 02.06.2025 173* 18.02 − 55.26 mg/dL
Urea suero 08.10.2024 152* 18.02 − 55.26 mg/dL
Urea suero 24.09.2024 127* 18.02 − 55.26 mg/dL
Urea suero 09.09.2024 168* 18.02 − 55.26 mg/dL
Urea suero 23.05.2024 142* 18.02 − 55.26 mg/dL
Ácido úrico suero 06.09.2025 5.5 3.7 − 8 mg/dL
Ácido úrico suero 30.06.2025 6.9 3.7 − 8 mg/dL
Ácido úrico suero 07.06.2025 5.4 3.7 − 8 mg/dL
Ácido úrico suero 08.10.2024 5.7 3.7 − 8 mg/dL
Ácido úrico suero 24.09.2024 5.3 3.7 − 8 mg/dL
Índice de saturación de transferrina 24.09.2024 17.2* 20 − 50 %
Índice de saturación de transferrina 23.05.2024 19* 20 − 50 %

Análisis de semen
Concentración espermatozoides 24.09.2024 1.09* 15M − 120M units/mL

Análisis general de orina
Bilirrubina en orina 30.06.2025 0.3* 0.00 − 0.00 mg/dL
Bilirrubina en orina 06.10.2024 0.4* 0.00 − 0.00 mg/dL
Bilirrubina en orina 24.09.2024 0.3* 0.00 − 0.00 mg/dL
Bilirrubina en orina 23.05.2024 0.3* 0.00 − 0.00 mg/dL
Bilirrubina orina cualitativo 06.09.2025 Undetected Undetected —
Bilirrubina orina cualitativo 30.06.2025 Undetected Undetected —
Bilirrubina orina cualitativo 07.06.2025 Undetected Undetected —
Bilirrubina orina cualitativo 08.10.2024 Undetected Undetected —
Bilirrubina orina cualitativo 06.10.2024 Undetected Undetected —
Bilirrubina orina cualitativo 24.09.2024 Undetected Undetected —
Bilirrubina orina cualitativo 09.09.2024 Undetected Undetected —
Bilirrubina orina cualitativo 23.05.2024 Undetected Undetected —
Cuepros cetonicos en orina 24.09.2024 0 0.00 − 3.48 mg/dL
Cuepros cetónicos orina cualitativo 06.09.2025 Undetected Undetected —
Cuepros cetónicos orina cualitativo 30.06.2025 Undetected Undetected —
Cuepros cetónicos orina cualitativo 07.06.2025 Undetected Undetected —
Cuepros cetónicos orina cualitativo 08.10.2024 Undetected Undetected —
Cuepros cetónicos orina cualitativo 06.10.2024 Undetected Undetected —
Cuepros cetónicos orina cualitativo 24.09.2024 Undetected Undetected —
Cuepros cetónicos orina cualitativo 09.09.2024 Undetected Undetected —
Cuepros cetónicos orina cualitativo 23.05.2024 Undetected Undetected —
Células epiteliales en orina 06.09.2025 5 0.00 − 27 units/mcL
Células epiteliales en orina 30.06.2025 0 0.00 − 27 units/mcL
Células epiteliales en orina 07.06.2025 1 0.00 − 27 units/mcL
Células epiteliales en orina 24.09.2024 0 0.00 − 27 units/mcL
Células epiteliales en orina 09.09.2024 0 0.00 − 27 units/mcL
Células epiteliales en orina 23.05.2024 0 0.00 − 27 units/mcL
Células epiteliales orina cualitativo 06.10.2024 Undetected Undetected —
Densidad orina 06.09.2025 1.009 1 − 1.03 ×100%
Densidad orina 30.06.2025 1.01 1 − 1.03 ×100%
Densidad orina 07.06.2025 1.02 1 − 1.03 ×100%
Densidad orina 08.10.2024 1010* 1 − 1.03 ×100%
Densidad orina 06.10.2024 1030* 1 − 1.03 ×100%
Densidad orina 24.09.2024 1.009 1 − 1.03 ×100%
Densidad orina 09.09.2024 1.008 1 − 1.03 ×100%
Densidad orina 23.05.2024 1.009 1 − 1.03 ×100%
Epithelial cells, urine 08.10.2024 5 0.00 − 55 units/mcL
Epithelial cells, urine 06.10.2024 1.98 0.00 − 55 units/mcL
Epithelial cells, urine 24.09.2024 5 0.00 − 55 units/mcL
Eritrocitos en orina 06.09.2025 4 0.00 − 17 units/mcL
Eritrocitos en orina 30.06.2025 46.64* 0.00 − 17 units/mcL
Eritrocitos en orina 07.06.2025 1 0.00 − 17 units/mcL
Eritrocitos en orina 08.10.2024 7.92 0.00 − 17 units/mcL
Eritrocitos en orina 06.10.2024 1018.16* 0.00 − 17 units/mcL
Eritrocitos en orina 24.09.2024 31.68* 0.00 − 17 units/mcL
Eritrocitos en orina por campo 09.09.2024 4.4* 0.00 − 3 HPF
Esterasa leucocitaria en orina cualitativo 06.09.2025 Negative Negative —
Esterasa leucocitaria en orina cualitativo 30.06.2025 Negative Negative —
Esterasa leucocitaria en orina cualitativo 07.06.2025 Positive* Negative —
Esterasa leucocitaria en orina cualitativo 08.10.2024 Negative Negative —
Esterasa leucocitaria en orina cualitativo 24.09.2024 Negative Negative —
Esterasa leucocitaria en orina cualitativo 09.09.2024 Negative Negative —
Esterasa leucocitaria en orina cualitativo 23.05.2024 Negative Negative —
Glucosa orina cualitativo 30.06.2025 Undetected Undetected —
Glucosa orina cualitativo 07.06.2025 Undetected Undetected —
Glucosa orina cualitativo 06.10.2024 Undetected Undetected —
Glucosa, orina 06.09.2025 100* 0.00 − 14.41 mg/dL
Glucosa, orina 30.06.2025 100* 0.00 − 14.41 mg/dL
Glucosa, orina 24.09.2024 0 0.00 − 14.41 mg/dL
Glucosa, orina 09.09.2024 250* 0.00 − 14.41 mg/dL
Glucosa, orina 23.05.2024 0 0.00 − 14.41 mg/dL
Hemoglobina en orina cualitativo 06.09.2025 Negative Negative —
Hemoglobina en orina cualitativo 30.06.2025 Negative Negative —
Hemoglobina en orina cualitativo 24.09.2024 Negative Negative —
Hemoglobina en orina cualitativo 09.09.2024 Negative Negative —
Hemoglobina en orina cualitativo 23.05.2024 Negative Negative —
Leucocitos orina 06.09.2025 3.3 0.00 − 11 units/mcL
Leucocitos orina 30.06.2025 0 0.00 − 11 units/mcL
Leucocitos orina 07.06.2025 16* 0.00 − 11 units/mcL
Leucocitos orina 08.10.2024 3.3 0.00 − 11 units/mcL
Leucocitos orina 24.09.2024 0 0.00 − 11 units/mcL
Leucocitos orina 23.05.2024 0 0.00 − 11 units/mcL
Leucocitos orina por campo 09.09.2024 0 0.00 − 2 HPF
Leukocyte esterase, urine 06.10.2024 135.3* 0.00 − 10 units/mcL
Nitritos orina cualitativo 06.09.2025 Undetected Undetected —
Nitritos orina cualitativo 30.06.2025 Undetected Undetected —
Nitritos orina cualitativo 07.06.2025 Undetected Undetected —
Nitritos orina cualitativo 08.10.2024 Undetected Undetected —
Nitritos orina cualitativo 06.10.2024 Detected* Undetected —
Nitritos orina cualitativo 24.09.2024 Undetected Undetected —
Nitritos orina cualitativo 09.09.2024 Undetected Undetected —
Nitritos orina cualitativo 23.05.2024 Undetected Undetected —
Non-fermentative Gram(-) bacteria, urine qualitative 06.10.2024 Detected* Undetected —
pH orina 06.09.2025 8 4.5 − 8 %
pH orina 30.06.2025 6.5 4.5 − 8 %
pH orina 07.06.2025 6 4.5 − 8 %
pH orina 06.10.2024 5.5 4.5 − 8 %
pH orina 09.09.2024 8.5* 4.5 − 8 %
pH orina 23.05.2024 8.5* 4.5 − 8 %
Proteínas orina 06.09.2025 300* 0.00 − 14 mg/dL
Proteínas orina 30.06.2025 300* 0.00 − 14 mg/dL
Proteínas orina 08.10.2024 300* 0.00 − 14 mg/dL
Proteínas orina 06.10.2024 30* 0.00 − 14 mg/dL
Proteínas orina 24.09.2024 300* 0.00 − 14 mg/dL
Proteínas orina 24.09.2024 0 0.00 − 14 mg/dL
Proteínas orina 09.09.2024 300* 0.00 − 14 mg/dL
Proteínas orina 23.05.2024 0 0.00 − 14 mg/dL
Proteínas orina cualitativo 30.06.2025 Negative Negative —
Proteínas orina cualitativo 07.06.2025 Negative Negative —
Proteínas orina cualitativo 06.10.2024 Positive* Negative —
Sangre en orina cualitativo 07.06.2025 Negative Negative —
Sangre en orina cualitativo 06.10.2024 Negative Negative —
Urobilina orina cualitativo 07.06.2025 Negative Negative —
Urobilinógeno orina 06.09.2025 0.2 0.20 − 1.00 mg/dL
Urobilinógeno orina 30.06.2025 0.2 0.20 − 1.00 mg/dL
Urobilinógeno orina 08.10.2024 0.2 0.20 − 1.00 mg/dL
Urobilinógeno orina 06.10.2024 1* 0.20 − 1.00 mg/dL
Urobilinógeno orina 24.09.2024 0.2 0.20 − 1.00 mg/dL
Urobilinógeno orina 09.09.2024 0.2 0.20 − 1.00 mg/dL
Urobilinógeno orina 23.05.2024 0.2 0.20 − 1.00 mg/dL

Diagnóstico de la oncopatología
Antigeno Ca 125 24.09.2024 8.3 — IU/mL
Antigeno Ca 15.3 24.09.2024 6.9 0.00 − 25 IU/mL
Antigeno Ca 19.9 24.09.2024 12.4 0.00 − 35 IU/mL
Antígeno Carcinoembrionario (ACE) 24.09.2024 1.9 0.00 − 5 ng/mL
Antígeno prostático específico libre 30.06.2025 0.6 — ng/mL
Antígeno prostático específico libre 24.09.2024 1.02 — ng/mL
Antígeno Prostático específico total 30.06.2025 0.94 0.00 − 4 ng/mL
Antígeno Prostático específico total 24.09.2024 1.8 0.00 − 4 ng/mL
Antígeno Prostático específico total 09.09.2024 1.48 0.00 − 4 ng/mL
B2M, serum 24.09.2024 13.04* 0.71 − 2.46 mg/L

Diagnóstico de laboratorio de enfermedades infecciosas
Antibodies Leishmania spp. IgG, qualitative 24.09.2024 Negative Negative —
Antibodies to Herpes Simplex Virus 1, IgG 06.09.2025 129.2* 0.00 − 8 IU/mL
Antibodies to Herpes Simplex Virus 1/2, IgG qualitative 24.09.2024 Positive* Negative —
Antibodies to Herpes Simplex Virus 2, IgG 06.09.2025 34.4* 0.00 − 16 IU/mL
Anticuerpos anti-Citomegalovirus IgM cualitativo 06.09.2025 Negative Negative —
Anticuerpos anti-Citomegalovirus IgM índice 06.09.2025 0.2 0.00 − 0.70 ×100%
Anticuerpos anti-Rubeola IgG 06.09.2025 400* 0.00 − 10 IU/mL
Anticuerpos anti-Rubeola IgM cualitativo 06.09.2025 Undetected Undetected —
Anticuerpos anti-Toxoplasma gondii IgG 06.09.2025 38.5* 0.00 − 9 IU/mL
Anticuerpos anti-Toxoplasma gondii IgG 24.09.2024 32.2* 0.00 − 9 IU/mL
Anticuerpos anti-Toxoplasma gondii IgM cualitativo 06.09.2025 Undetected Undetected —
Anticuerpos anti-Treponema pallidum totales cualitativo 24.09.2024 Undetected Undetected —
Anticuerpos anti-Virus Hepatitis C total cualitativo 30.06.2025 Negative Negative —
Anticuerpos anti-Virus Hepatitis C total cualitativo 24.09.2024 Negative Negative —
Antígeno de superficie virus Hepatitis B cualitativo 30.06.2025 Negative Negative —
Antígeno de superficie virus Hepatitis B cualitativo 24.09.2024 Negative Negative —
Cytomegalovirus IgG Ab, positivity coefficient 06.09.2025 15.6* 0.00 − 0.60 ×100%
Dengue Virus IgG Ab, qualitative 24.09.2024 Detected* Undetected —
Dengue Virus IgM Ab, qualitative 24.09.2024 Undetected Undetected —
Hepatitis B Core Ag IgG+IgM Ab, qualitative 30.06.2025 Negative Negative —
Hepatitis B Core Ag IgM Ab, qualitative 24.09.2024 Negative Negative —
Hepatitis B Surface Ag IgG+IgM Ab 30.06.2025 3.1 0.00 − 9.9 mIU/mL
Rubella virus IgM Ab, positivity coefficient 06.09.2025 0.1 0.00 − 0.80 ×100%
Toxoplasma gondii IgM Ab, Signal/Cutoff 06.09.2025 0.1 0.00 − 0.80 ×100%
VIH 1+2 Ab VIH1 Antígeno p24 cualitativo 30.06.2025 Negative Negative —
VIH 1+2 Ab VIH1 Antígeno p24 cualitativo 24.09.2024 Negative Negative —

Estudios de coagulación sanguínea
Dímero D 07.06.2025 343 0.00 − 500.04 ng/mL
Fibrinógeno 06.09.2025 439* 175 − 425 mg/dL
Fibrinógeno 07.06.2025 264 175 − 425 mg/dL
Fibrinógeno 24.09.2024 469* 175 − 425 mg/dL
Indice de Quick 06.09.2025 100 70 − 120 %
Indice de Quick 07.06.2025 89 70 − 120 %
Indice de Quick 24.09.2024 96 70 − 120 %
INR (Ratio internacional normalizado) 06.09.2025 1 0.90 − 1.1 ×100%
INR (Ratio internacional normalizado) 07.06.2025 1.09 0.90 − 1.1 ×100%
INR (Ratio internacional normalizado) 24.09.2024 1.03 0.90 − 1.1 ×100%
TP (Tiempo de Protrombina) 06.09.2025 13.6* 9.4 − 12.5 s
TP (Tiempo de Protrombina) 07.06.2025 13.9* 9.4 − 12.5 s
TP (Tiempo de Protrombina) 24.09.2024 13.8* 9.4 − 12.5 s
TTPa (Tiempo de tromboplastina parcial activado) 06.09.2025 34 25 − 37 s
TTPa (Tiempo de tromboplastina parcial activado) 07.06.2025 33 25 − 37 s
TTPa (Tiempo de tromboplastina parcial activado) 24.09.2024 29 25 − 37 s

Estudios hormonales
Alfa-Fetoproteina suero 24.09.2024 7.3 0.00 − 8.4 ng/mL
PTH (Paratohormona) 16.09.2025 200.34* 15 − 65 pg/mL
PTH (Paratohormona) 06.09.2025 204.1* 15 − 65 pg/mL
PTH (Paratohormona) 02.07.2025 200.34* 15 − 65 pg/mL
PTH (Paratohormona) 01.07.2025 200.34* 15 − 65 pg/mL
PTH (Paratohormona) 02.06.2025 200.34* 15 − 65 pg/mL
T3 total (Triiodotironina) 06.09.2025 1.04 0.80 − 2 ng/mL
Tirotropina 16.09.2025 64100* 0.30 − 4.2 mcIU/mL
Tirotropina 02.07.2025 64.1* 0.30 − 4.2 mcIU/mL
Tirotropina 01.07.2025 64100* 0.30 − 4.2 mcIU/mL
Tirotropina 02.06.2025 64.1* 0.30 − 4.2 mcIU/mL
Tiroxina libre (T4 libre) 16.09.2025 0.83* 0.90 − 1.7 ng/dl
Tiroxina libre (T4 libre) 02.07.2025 0.83* 0.90 − 1.7 ng/dl
Tiroxina libre (T4 libre) 01.07.2025 0.83* 0.90 − 1.7 ng/dl
Tiroxina libre (T4 libre) 02.06.2025 0.83* 0.90 − 1.7 ng/dl
Tiroxina total (T4T) 06.09.2025 5.5 4.5 − 11.7 mcg/dL
Triiodotironina libre 02.07.2025 1.58* 2 − 4.4 pg/mL
Triiodotironina libre 02.06.2025 1.58* 2 − 4.4 pg/mL

Examen clínico general
Ancho de Distribución Eritrocitaria (ADE) % 06.09.2025 16.8* 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 30.06.2025 14.9* 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 07.06.2025 16.8* 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 06.10.2024 13.2 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 24.09.2024 15* 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 09.09.2024 15.7* 11.8 − 14.5 %
Ancho de Distribución Eritrocitaria (ADE) % 23.05.2024 14.3 11.8 − 14.5 %
Anisocitosis cualitativo 09.09.2024 Undetected Undetected —
Basófilos % 08.10.2024 15.5* 0.50 − 1.00 %
Blastos 08.10.2024 6760* 0.00 − 0.00 units/mm³
Concentración de Hemoglobina Corpuscular Media (CHCM) 06.09.2025 32* 32 − 36 %
Concentración de Hemoglobina Corpuscular Media (CHCM) 30.06.2025 32* 32 − 36 %
Concentración de Hemoglobina Corpuscular Media (CHCM) 07.06.2025 32* 32 − 36 g/dL
Concentración de Hemoglobina Corpuscular Media (CHCM) 06.10.2024 35 32 − 36 %
Concentración de Hemoglobina Corpuscular Media (CHCM) 24.09.2024 32* 32 − 36 %
Concentración de Hemoglobina Corpuscular Media (CHCM) 09.09.2024 33 32 − 36 %
Concentración de Hemoglobina Corpuscular Media (CHCM) 23.05.2024 33 32 − 36 %
Eosinófilos 06.09.2025 658* 30 − 480 units/mm³
Eosinófilos 30.06.2025 510* 30 − 480 units/mm³
Eosinófilos 07.06.2025 312 30 − 480 units/mm³
Eosinófilos 08.10.2024 811* 30 − 480 units/mm³
Eosinófilos 24.09.2024 605* 30 − 480 units/mm³
Eosinófilos 09.09.2024 833* 30 − 480 units/mm³
Eosinófilos 23.05.2024 358 30 − 480 units/mm³
Eosinófilos % 06.09.2025 9* 1.00 − 4 %
Eosinófilos % 30.06.2025 7* 1.00 − 4 %
Eosinófilos % 07.06.2025 4 1.00 − 4 %
Eosinófilos % 08.10.2024 12* 1.00 − 4 %
Eosinófilos % 06.10.2024 1 1.00 − 4 %
Eosinófilos % 24.09.2024 10* 1.00 − 4 %
Eosinófilos % 09.09.2024 12* 1.00 − 4 %
Eosinófilos % 23.05.2024 5* 1.00 − 4 %
Eritrocitos 06.09.2025 4270000* 4.35M − 5.65M units/mm³
Eritrocitos 01.07.2025 3560000* 4.35M − 5.65M units/mm³
Eritrocitos 30.06.2025 3560000* 4.35M − 5.65M units/mm³
Eritrocitos 07.06.2025 2920000* 4.35M − 5.65M units/mm³
Eritrocitos 06.10.2024 5360000 4.35M − 5.65M units/mm³
Eritrocitos 24.09.2024 6050* 4.35M − 5.65M units/mm³
Eritrocitos 09.09.2024 3100000* 4.35M − 5.65M units/mm³
Eritrocitos 23.05.2024 3340000* 4.35M − 5.65M units/mm³
Hematocrito 06.09.2025 39.3 38.3 − 48.6 %
Hematocrito 30.06.2025 34.6* 38.3 − 48.6 %
Hematocrito 07.06.2025 29* 38.3 − 48.6 %
Hematocrito 08.10.2024 28* 38.3 − 48.6 %
Hematocrito 06.10.2024 44.5 38.3 − 48.6 %
Hematocrito 24.09.2024 29* 38.3 − 48.6 %
Hematocrito 09.09.2024 28.1* 38.3 − 48.6 %
Hematocrito 23.05.2024 30* 38.3 − 48.6 %
Hemoglobina 16.09.2025 11* 13.2 − 16.6 g/dL
Hemoglobina 06.09.2025 12.6* 13.2 − 16.6 g/dL
Hemoglobina 02.07.2025 11* 13.2 − 16.6 g/dL
Hemoglobina 01.07.2025 11* 13.2 − 16.6 g/dL
Hemoglobina 30.06.2025 11* 13.2 − 16.6 g/dL
Hemoglobina 07.06.2025 9.4* 13.2 − 16.6 g/dL
Hemoglobina 02.06.2025 11* 13.2 − 16.6 g/dL
Hemoglobina 08.10.2024 8.9* 13.2 − 16.6 g/dL
Hemoglobina 06.10.2024 15.5 13.2 − 16.6 g/dL
Hemoglobina 24.09.2024 9.2* 13.2 − 16.6 g/dL
Hemoglobina 09.09.2024 9.4* 13.2 − 16.6 g/dL
Hemoglobina 23.05.2024 10* 13.2 − 16.6 g/dL
Hemoglobina Corpuscular Media (HCM) 06.09.2025 30 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 30.06.2025 31 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 07.06.2025 32 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 08.10.2024 29 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 06.10.2024 29 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 24.09.2024 29 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 09.09.2024 30 27 − 33 pg
Hemoglobina Corpuscular Media (HCM) 23.05.2024 30 27 − 33 pg
Leucocitos 06.09.2025 7310 3.4K − 9.6K units/mm³
Leucocitos 30.06.2025 7280 3.4K − 9.6K units/mm³
Leucocitos 07.06.2025 7800 3.4K − 9.6K units/mm³
Leucocitos 08.10.2024 3110000* 3.4K − 9.6K units/mm³
Leucocitos 06.10.2024 10120* 3.4K − 9.6K units/mm³
Leucocitos 24.09.2024 3150000* 3.4K − 9.6K units/mm³
Leucocitos 09.09.2024 6940 3.4K − 9.6K units/mm³
Leucocitos 23.05.2024 7160 3.4K − 9.6K units/mm³
Linfocitos 06.09.2025 1535 950 − 3.07K units/mm³
Linfocitos 30.06.2025 2475 950 − 3.07K units/mm³
Linfocitos 07.06.2025 2808 950 − 3.07K units/mm³
Linfocitos 08.10.2024 2.096* 950 − 3.07K units/mm³
Linfocitos 06.10.2024 2.125* 950 − 3.07K units/mm³
Linfocitos 24.09.2024 1.694* 950 − 3.07K units/mm³
Linfocitos 24.09.2024 1694 950 − 3.07K units/mm³
Linfocitos 09.09.2024 1874 950 − 3.07K units/mm³
Linfocitos 23.05.2024 2076 950 − 3.07K units/mm³
Linfocitos % 06.09.2025 21 20 − 40 %
Linfocitos % 30.06.2025 34 20 − 40 %
Linfocitos % 07.06.2025 36 20 − 40 %
Linfocitos % 08.10.2024 31 20 − 40 %
Linfocitos % 06.10.2024 21 20 − 40 %
Linfocitos % 24.09.2024 28 20 − 40 %
Linfocitos % 09.09.2024 27 20 − 40 %
Linfocitos % 23.05.2024 29 20 − 40 %
Monocitos 06.09.2025 439 260 − 810 units/mm³
Monocitos 30.06.2025 437 260 − 810 units/mm³
Monocitos 07.06.2025 312 260 − 810 units/mm³
Monocitos 08.10.2024 270 260 − 810 units/mm³
Monocitos 06.10.2024 405 260 − 810 units/mm³
Monocitos 24.09.2024 363 260 − 810 units/mm³
Monocitos 09.09.2024 1041* 260 − 810 units/mm³
Monocitos 23.05.2024 501 260 − 810 units/mm³
Monocitos % 06.09.2025 6 2 − 8 %
Monocitos % 30.06.2025 6 2 − 8 %
Monocitos % 07.06.2025 4 2 − 8 %
Monocitos % 08.10.2024 4 2 − 8 %
Monocitos % 06.10.2024 4 2 − 8 %
Monocitos % 24.09.2024 6 2 − 8 %
Monocitos % 09.09.2024 15* 2 − 8 %
Monocitos % 23.05.2024 7 2 − 8 %
Neutrófilos segmentados 06.09.2025 4678 2.5K − 6K units/mm³
Neutrófilos segmentados 30.06.2025 3858 2.5K − 6K units/mm³
Neutrófilos segmentados 07.06.2025 4368 2.5K − 6K units/mm³
Neutrófilos segmentados 08.10.2024 3.583* 2.5K − 6K units/mm³
Neutrófilos segmentados 06.10.2024 7.489* 2.5K − 6K units/mm³
Neutrófilos segmentados 24.09.2024 3.388* 2.5K − 6K units/mm³
Neutrófilos segmentados 24.09.2024 3388 2.5K − 6K units/mm³
Neutrófilos segmentados 09.09.2024 3192 2.5K − 6K units/mm³
Neutrófilos segmentados 23.05.2024 4224 2.5K − 6K units/mm³
Neutrófilos segmentados % 06.09.2025 64* 40 − 60 %
Neutrófilos segmentados % 30.06.2025 53 40 − 60 %
Neutrófilos segmentados % 07.06.2025 56 40 − 60 %
Neutrófilos segmentados % 08.10.2024 53 40 − 60 %
Neutrófilos segmentados % 06.10.2024 74* 40 − 60 %
Neutrófilos segmentados % 24.09.2024 56 40 − 60 %
Neutrófilos segmentados % 09.09.2024 46 40 − 60 %
Neutrófilos segmentados % 23.05.2024 59 40 − 60 %
Plaquetas 06.09.2025 222000 135K − 317K units/mm³
Plaquetas 01.07.2025 255000 135K − 317K units/mm³
Plaquetas 30.06.2025 181000 135K − 317K units/mm³
Plaquetas 07.06.2025 271000 135K − 317K units/mm³
Plaquetas 08.10.2024 248000 135K − 317K units/mm³
Plaquetas 06.10.2024 257000 135K − 317K units/mm³
Plaquetas 24.09.2024 152000 135K − 317K units/mm³
Plaquetas 09.09.2024 164000 135K − 317K units/mm³
Plaquetas 23.05.2024 219000 135K − 317K units/mm³
Reticulocitos % 23.05.2024 1.4 0.60 − 2.71 %
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 06.09.2025 5 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 30.06.2025 4 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 07.06.2025 10 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 08.10.2024 62* 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 06.10.2024 12 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 24.09.2024 30* 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 09.09.2024 15 2 − 20 mm/hr
Velocidad de sedimentación eritrocitaria (VSG) 1 hora 23.05.2024 8 2 − 20 mm/hr
Volumen corpuscular medio (VCM) 30.06.2025 97 78.2 − 97.9 mcm³
Volumen corpuscular medio (VCM) 07.06.2025 99* 78.2 − 97.9 fL
Volumen corpuscular medio (VCM) 08.10.2024 90 78.2 − 97.9 mcm³
Volumen corpuscular medio (VCM) 06.10.2024 83 78.2 − 97.9 mcm³
Volumen corpuscular medio (VCM) 24.09.2024 92 78.2 − 97.9 mcm³
Volumen corpuscular medio (VCM) 23.05.2024 90 78.2 − 97.9 mcm³
Volumen Medio Plaquetario (VPM) 07.06.2025 8.4 7.5 − 11.5 fL
"""


class FullLabDataProcessor:
    """Complete processor for full Ornament PDF lab data"""

    def __init__(self):
        self.results = []
        self.categories = {
            'Signos Vitales': 'Vital Signs',
            'Análisis bioquímicos (sangre)': 'Blood Chemistry',
            'Análisis de semen': 'Semen Analysis',
            'Análisis general de orina': 'Urinalysis',
            'Diagnóstico de la oncopatología': 'Oncology Markers',
            'Diagnóstico de laboratorio de enfermedades infecciosas': 'Infectious Disease',
            'Estudios de coagulación sanguínea': 'Coagulation Studies',
            'Estudios hormonales': 'Hormonal Studies',
            'Examen clínico general': 'Complete Blood Count'
        }

    def parse_reference_range(self, ref_range: str) -> Tuple[Optional[str], Optional[str]]:
        """Parse reference range string, keeping original format"""
        if not ref_range or ref_range == '—':
            return '', ''

        # Handle different dash characters
        if '−' in ref_range:
            parts = ref_range.split('−')
        elif '-' in ref_range:
            parts = ref_range.split('-')
        else:
            return '', ''

        min_val = parts[0].strip()
        max_val = parts[1].strip() if len(parts) > 1 else ''

        return min_val, max_val

    def parse_result_value(self, result: str) -> Tuple[str, bool]:
        """Parse result value and determine if abnormal"""
        is_abnormal = '*' in result
        clean_result = result.replace('*', '').strip()
        return clean_result, is_abnormal

    def process_data(self):
        """Process the full lab data"""
        lines = FULL_LAB_DATA.strip().split('\n')
        current_category = None

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Check for category headers
            for cat_spanish, cat_english in self.categories.items():
                if line == cat_spanish:
                    current_category = cat_english
                    break

            # Skip if no category set yet
            if not current_category:
                continue

            # Try to parse data lines
            # Pattern: biomarker date result range units
            parts = line.split()
            if len(parts) >= 5:
                # Look for date pattern DD.MM.YYYY
                date_pattern = r'\d{2}\.\d{2}\.\d{4}'
                date_match = None
                date_idx = -1

                for idx, part in enumerate(parts):
                    if re.match(date_pattern, part):
                        date_match = part
                        date_idx = idx
                        break

                if date_match and date_idx > 0:
                    # Extract components
                    biomarker = ' '.join(parts[:date_idx])
                    date = date_match

                    # Result is next after date
                    if date_idx + 1 < len(parts):
                        result_raw = parts[date_idx + 1]

                        # Check for qualitative results
                        if result_raw in ['Undetected', 'Negative', 'Positive', 'Detected', 'Positive*', 'Detected*']:
                            # Qualitative result
                            result, is_abnormal = self.parse_result_value(result_raw)
                            ref_range = parts[date_idx + 2] if date_idx + 2 < len(parts) else ''
                            units = parts[-1] if parts[-1] not in ['—', result_raw, ref_range] else ''
                        else:
                            # Quantitative result
                            result, is_abnormal = self.parse_result_value(result_raw)

                            # Find units (last element that's not —)
                            units = parts[-1] if parts[-1] != '—' else ''

                            # Reference range is between result and units
                            if date_idx + 2 < len(parts) - 1:
                                ref_range = ' '.join(parts[date_idx + 2:-1])
                            else:
                                ref_range = '—'

                        # Parse reference range
                        ref_min, ref_max = self.parse_reference_range(ref_range)

                        # Create record
                        record = {
                            'Category': current_category,
                            'Biomarker': biomarker,
                            'Date': date,
                            'Result': result,
                            'Ref_Min': ref_min,
                            'Ref_Max': ref_max,
                            'Units': units if units != '—' else '',
                            'Status': 'Abnormal' if is_abnormal else 'Normal'
                        }

                        self.results.append(record)

    def save_complete_csv(self, filename='lab_results_full.csv'):
        """Save all results to CSV"""
        if not self.results:
            print(f"No results to save")
            return

        fieldnames = ['Category', 'Biomarker', 'Date', 'Result', 'Ref_Min', 'Ref_Max', 'Units', 'Status']

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.results)

        print(f"Saved {len(self.results)} records to {filename}")

    def save_abnormal_csv(self, filename='lab_results_abnormal_full.csv'):
        """Save only abnormal results"""
        abnormal = [r for r in self.results if r['Status'] == 'Abnormal']

        if not abnormal:
            print("No abnormal results found")
            return

        fieldnames = ['Category', 'Biomarker', 'Date', 'Result', 'Ref_Min', 'Ref_Max', 'Units', 'Status']

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(abnormal)

        print(f"Saved {len(abnormal)} abnormal records to {filename}")

    def generate_summary(self):
        """Generate summary statistics"""
        summary = {
            'total_tests': len(self.results),
            'abnormal_count': sum(1 for r in self.results if r['Status'] == 'Abnormal'),
            'categories': {},
            'biomarkers': {}
        }

        # Category breakdown
        for record in self.results:
            cat = record['Category']
            bio = record['Biomarker']

            if cat not in summary['categories']:
                summary['categories'][cat] = {'total': 0, 'abnormal': 0}
            summary['categories'][cat]['total'] += 1
            if record['Status'] == 'Abnormal':
                summary['categories'][cat]['abnormal'] += 1

            # Biomarker tracking
            if bio not in summary['biomarkers']:
                summary['biomarkers'][bio] = {'count': 0, 'abnormal': 0}
            summary['biomarkers'][bio]['count'] += 1
            if record['Status'] == 'Abnormal':
                summary['biomarkers'][bio]['abnormal'] += 1

        return summary


if __name__ == "__main__":
    processor = FullLabDataProcessor()
    processor.process_data()

    # Save complete results
    processor.save_complete_csv('lab_results_full.csv')

    # Save abnormal results only
    processor.save_abnormal_csv('lab_results_abnormal_full.csv')

    # Generate and display summary
    summary = processor.generate_summary()

    print(f"\n=== Full Lab Data Summary ===")
    print(f"Total tests processed: {summary['total_tests']}")
    print(f"Abnormal tests: {summary['abnormal_count']} ({summary['abnormal_count']/summary['total_tests']*100:.1f}%)")

    print(f"\n=== Tests by Category ===")
    for cat, stats in summary['categories'].items():
        abnormal_pct = (stats['abnormal']/stats['total']*100) if stats['total'] > 0 else 0
        print(f"{cat:30} {stats['total']:4} tests, {stats['abnormal']:3} abnormal ({abnormal_pct:.1f}%)")

    print(f"\n=== Most Frequently Tested Biomarkers ===")
    sorted_biomarkers = sorted(summary['biomarkers'].items(), key=lambda x: x[1]['count'], reverse=True)[:15]
    for bio, stats in sorted_biomarkers:
        abnormal_pct = (stats['abnormal']/stats['count']*100) if stats['count'] > 0 else 0
        print(f"{bio:40} {stats['count']:3} tests, {stats['abnormal']:2} abnormal ({abnormal_pct:.1f}%)")

    # Save summary to JSON
    with open('lab_results_summary_full.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)