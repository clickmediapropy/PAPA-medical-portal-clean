#!/usr/bin/env python3
"""
Lab Results Extractor for Ornament Health PDF
Extracts laboratory test results and creates structured CSV files
"""

import re
import csv
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import json

class LabDataExtractor:
    def __init__(self):
        self.results = []
        self.categories = {
            'Signos Vitales': 'Vital Signs',
            'Análisis bioquímicos (sangre)': 'Blood Chemistry',
            'Análisis de semen': 'Semen Analysis',
            'Análisis general de orina': 'Urinalysis',
            'Diagnóstico de la oncopatología': 'Oncology',
            'Diagnóstico de laboratorio de enfermedades infecciosas': 'Infectious Diseases',
            'Estudios de coagulación sanguínea': 'Coagulation Studies',
            'Estudios hormonales': 'Hormonal Studies',
            'Examen clínico general': 'Complete Blood Count'
        }

    def parse_reference_range(self, ref_range: str) -> Tuple[Optional[float], Optional[float]]:
        """Parse reference range string into min and max values"""
        if not ref_range or ref_range == '—':
            return None, None

        # Handle different range formats
        if '−' in ref_range:  # Special dash character
            parts = ref_range.split('−')
        elif '-' in ref_range:  # Regular dash
            parts = ref_range.split('-')
        else:
            return None, None

        try:
            # Clean up the values
            min_val = parts[0].strip().replace(',', '')
            max_val = parts[1].strip().replace(',', '') if len(parts) > 1 else None

            # Handle special cases like "15M − 120M"
            min_val = re.sub(r'[MK]', '', min_val)
            if max_val:
                max_val = re.sub(r'[MK]', '', max_val)

            return float(min_val), float(max_val) if max_val else None
        except:
            return None, None

    def parse_result_value(self, result: str) -> Tuple[str, bool]:
        """Parse result value and determine if it's abnormal"""
        is_abnormal = False
        clean_result = result

        if '*' in result:
            is_abnormal = True
            clean_result = result.replace('*', '')

        return clean_result.strip(), is_abnormal

    def extract_lab_data(self, text_content: str):
        """Extract laboratory data from the PDF text content"""
        lines = text_content.split('\n')
        current_category = None

        for i, line in enumerate(lines):
            line = line.strip()

            # Check if this is a category header
            for cat_spanish, cat_english in self.categories.items():
                if cat_spanish in line:
                    current_category = cat_english
                    break

            # Try to parse data lines (format: biomarker date result range units)
            # Using regex to match the pattern
            pattern = r'^(.+?)\s+(\d{2}\.\d{2}\.\d{4})\s+([^\s]+)\s+(.+?)\s+([^\s]+)$'
            match = re.match(pattern, line)

            if match and current_category:
                biomarker = match.group(1).strip()
                date = match.group(2).strip()
                result_raw = match.group(3).strip()
                ref_range = match.group(4).strip()
                units = match.group(5).strip()

                # Parse result and check if abnormal
                result, is_abnormal = self.parse_result_value(result_raw)

                # Parse reference range
                ref_min, ref_max = self.parse_reference_range(ref_range)

                # Create record
                record = {
                    'Category': current_category,
                    'Biomarker': biomarker,
                    'Date': date,
                    'Result': result,
                    'Ref_Min': ref_min if ref_min is not None else '',
                    'Ref_Max': ref_max if ref_max is not None else '',
                    'Units': units,
                    'Status': 'Abnormal' if is_abnormal else 'Normal',
                    'Original_Result': result_raw
                }

                self.results.append(record)

    def save_to_csv(self, filename: str, records: List[Dict] = None):
        """Save records to CSV file"""
        if records is None:
            records = self.results

        if not records:
            print(f"No records to save to {filename}")
            return

        fieldnames = ['Category', 'Biomarker', 'Date', 'Result', 'Ref_Min', 'Ref_Max', 'Units', 'Status']

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for record in records:
                # Remove Original_Result field for CSV output
                csv_record = {k: v for k, v in record.items() if k != 'Original_Result'}
                writer.writerow(csv_record)

    def create_summary_statistics(self):
        """Generate summary statistics for the lab results"""
        summary = {
            'total_tests': len(self.results),
            'abnormal_tests': sum(1 for r in self.results if r['Status'] == 'Abnormal'),
            'normal_tests': sum(1 for r in self.results if r['Status'] == 'Normal'),
            'categories': {},
            'date_range': {'earliest': None, 'latest': None}
        }

        # Process dates
        dates = []
        for record in self.results:
            try:
                date_obj = datetime.strptime(record['Date'], '%d.%m.%Y')
                dates.append(date_obj)
            except:
                pass

        if dates:
            summary['date_range']['earliest'] = min(dates).strftime('%Y-%m-%d')
            summary['date_range']['latest'] = max(dates).strftime('%Y-%m-%d')

        # Category statistics
        for record in self.results:
            cat = record['Category']
            if cat not in summary['categories']:
                summary['categories'][cat] = {
                    'total': 0,
                    'abnormal': 0,
                    'biomarkers': set()
                }
            summary['categories'][cat]['total'] += 1
            if record['Status'] == 'Abnormal':
                summary['categories'][cat]['abnormal'] += 1
            summary['categories'][cat]['biomarkers'].add(record['Biomarker'])

        # Convert sets to counts for JSON serialization
        for cat in summary['categories']:
            summary['categories'][cat]['unique_biomarkers'] = len(summary['categories'][cat]['biomarkers'])
            del summary['categories'][cat]['biomarkers']

        return summary

    def filter_abnormal_results(self) -> List[Dict]:
        """Filter and return only abnormal results"""
        return [r for r in self.results if r['Status'] == 'Abnormal']

    def create_biomarker_timeline(self) -> Dict:
        """Create timeline view of each biomarker"""
        timeline = {}

        for record in self.results:
            biomarker = record['Biomarker']
            if biomarker not in timeline:
                timeline[biomarker] = []

            timeline[biomarker].append({
                'Date': record['Date'],
                'Result': record['Result'],
                'Status': record['Status'],
                'Category': record['Category']
            })

        # Sort by date for each biomarker
        for biomarker in timeline:
            timeline[biomarker].sort(key=lambda x: datetime.strptime(x['Date'], '%d.%m.%Y'))

        return timeline


# Sample data to process (this would come from the actual PDF parsing)
sample_lab_data = """
Signos Vitales
Altura 15.09.2025 178.00 — cm
Peso, promedio 15.09.2025 80.0 — kg
Índice de masa corporal (IMC) 15.09.2025 25.2 18.5 − 29.99 kg/m²

Análisis bioquímicos (sangre)
Alanina aminotransferasa 06.09.2025 12 7 − 55 IU/L
Alanina aminotransferasa 30.06.2025 11 7 − 55 IU/L
Albúmina suero 30.06.2025 4.2 3.5 − 5 g/dL
Aspartato amino transferasa 06.09.2025 12 8 − 48 IU/L
Base excess 07.06.2025 -4.1* -2.7 − 2.5 mEq/L
Bicarbonate, serum 07.06.2025 21.5* 22 − 29 mEq/L
Bilirrubina directa 06.09.2025 0.1 0.00 − 0.29 mg/dL
Bilirubina total 06.10.2024 32* 0.00 − 1.2 mg/dL
Calcio suero 16.09.2025 11.5* 8.8 − 10.2 mg/dL
Cloro suero 06.09.2025 100 98 − 107 mEq/L
Colesterol HDL 06.09.2025 65 39.98 − 99.99 mg/dL
Colesterol LDL 06.09.2025 103* 0.00 − 99.99 mg/dL
Colesterol total 06.09.2025 180 125.01 − 199.01 mg/dL
Creatinina suero 16.09.2025 10.5* 0.70 − 1.25 mg/dL
Ferritina 06.09.2025 234.2 24 − 379.99 ng/mL
Fosfatasa alcalina 06.09.2025 72 40 − 129 IU/L
Fosfato suero 16.09.2025 5.2* 2.5 − 4.5 mg/dL
Glucosa 06.09.2025 78 70.26 − 99.09 mg/dL
Hemoglobina A1c 06.09.2025 4.3* 4.8 − 5.6 %
Magnesio 06.09.2025 2.5* 1.7 − 2.3 mg/dL
Potasio suero 06.09.2025 5.2 3.6 − 5.2 mEq/L
Sodio suero 06.09.2025 140 135 − 146 mEq/L
Triglicéridos 06.09.2025 60 0.00 − 150.45 mg/dL
Urea suero 06.09.2025 126* 18.02 − 55.26 mg/dL
Ácido úrico suero 06.09.2025 5.5 3.7 − 8 mg/dL

Análisis general de orina
Bilirrubina en orina 30.06.2025 0.3* 0.00 − 0.00 mg/dL
Densidad orina 06.09.2025 1.009 1 − 1.03 ×100%
Eritrocitos en orina 30.06.2025 46.64* 0.00 − 17 units/mcL
Glucosa, orina 06.09.2025 100* 0.00 − 14.41 mg/dL
Leucocitos orina 07.06.2025 16* 0.00 − 11 units/mcL
pH orina 06.09.2025 8 4.5 − 8 %
Proteínas orina 06.09.2025 300* 0.00 − 14 mg/dL

Estudios hormonales
PTH (Paratohormona) 16.09.2025 200.34* 15 − 65 pg/mL
Tirotropina 16.09.2025 64100* 0.30 − 4.2 mcIU/mL
Tiroxina libre (T4 libre) 16.09.2025 0.83* 0.90 − 1.7 ng/dl
T3 total (Triiodotironina) 06.09.2025 1.04 0.80 − 2 ng/mL

Examen clínico general
Hemoglobina 16.09.2025 11* 13.2 − 16.6 g/dL
Hematocrito 06.09.2025 39.3 38.3 − 48.6 %
Leucocitos 06.09.2025 7310 3.4K − 9.6K units/mm³
Plaquetas 06.09.2025 222000 135K − 317K units/mm³
Neutrófilos segmentados % 06.09.2025 64* 40 − 60 %
Linfocitos % 06.09.2025 21 20 − 40 %
"""

if __name__ == "__main__":
    # Initialize extractor
    extractor = LabDataExtractor()

    # Process the sample data (in real use, this would be the full PDF content)
    extractor.extract_lab_data(sample_lab_data)

    # Save complete results
    extractor.save_to_csv('lab_results_complete.csv')
    print(f"Saved {len(extractor.results)} lab results to lab_results_complete.csv")

    # Save abnormal results
    abnormal = extractor.filter_abnormal_results()
    extractor.save_to_csv('lab_results_abnormal.csv', abnormal)
    print(f"Saved {len(abnormal)} abnormal results to lab_results_abnormal.csv")

    # Generate and save summary statistics
    summary = extractor.create_summary_statistics()
    with open('lab_results_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"Saved summary statistics to lab_results_summary.json")

    # Print summary
    print(f"\n=== Summary Statistics ===")
    print(f"Total tests: {summary['total_tests']}")
    print(f"Abnormal tests: {summary['abnormal_tests']} ({summary['abnormal_tests']/summary['total_tests']*100:.1f}%)")
    print(f"Date range: {summary['date_range']['earliest']} to {summary['date_range']['latest']}")
    print(f"\nTests by category:")
    for cat, stats in summary['categories'].items():
        print(f"  {cat}: {stats['total']} tests, {stats['abnormal']} abnormal")