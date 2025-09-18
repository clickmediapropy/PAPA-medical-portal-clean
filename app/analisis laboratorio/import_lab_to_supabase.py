#!/usr/bin/env python3
"""
Import Lab Results from CSV to Supabase Database
Processes extracted lab data and imports it into the Supabase database structure
"""

import os
import csv
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from parent app directory
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

class LabDataImporter:
    def __init__(self):
        # Initialize Supabase client
        url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

        if not url or not key:
            raise ValueError("Supabase credentials not found in environment variables")

        self.supabase: Client = create_client(url, key)
        self.biomarker_map = {}  # Cache biomarker name to ID mapping
        self.category_mapping = {
            'Vital Signs': 'vital_signs',
            'Blood Chemistry': 'blood_chemistry',
            'Semen Analysis': 'reproductive',
            'Urinalysis': 'urinalysis',
            'Oncology Markers': 'oncology',
            'Infectious Disease': 'infectious',
            'Coagulation Studies': 'coagulation',
            'Hormonal Studies': 'hormonal',
            'Complete Blood Count': 'hematology'
        }
        self.stats = {
            'biomarkers_created': 0,
            'biomarkers_existing': 0,
            'lab_results_created': 0,
            'lab_parsed_values_created': 0,
            'errors': []
        }

    def convert_date(self, date_str: str) -> str:
        """Convert date from DD.MM.YYYY to YYYY-MM-DD format"""
        try:
            dt = datetime.strptime(date_str, '%d.%m.%Y')
            return dt.strftime('%Y-%m-%d')
        except:
            return date_str

    def parse_numeric_value(self, value: str) -> Optional[float]:
        """Parse numeric value from string"""
        try:
            # Remove any thousand separators and convert decimal point
            cleaned = value.replace(',', '')
            return float(cleaned)
        except:
            return None

    def get_or_create_biomarker(self, name: str, category: str, unit: str,
                               ref_min: str, ref_max: str) -> Optional[str]:
        """Get existing biomarker or create new one, return biomarker ID"""

        # Check cache first
        if name in self.biomarker_map:
            self.stats['biomarkers_existing'] += 1
            return self.biomarker_map[name]

        # Check if biomarker exists in database
        result = self.supabase.table('biomarkers').select('id').eq('name', name).execute()

        if result.data and len(result.data) > 0:
            biomarker_id = result.data[0]['id']
            self.biomarker_map[name] = biomarker_id
            self.stats['biomarkers_existing'] += 1
            return biomarker_id

        # Create new biomarker
        biomarker_data = {
            'name': name,
            'display_name': name,
            'category': self.category_mapping.get(category, 'other'),
            'unit': unit if unit else '',
            'reference_min': self.parse_numeric_value(ref_min) if ref_min else None,
            'reference_max': self.parse_numeric_value(ref_max) if ref_max else None,
            'description': f'Imported from lab data - {category}'
        }

        try:
            result = self.supabase.table('biomarkers').insert(biomarker_data).execute()
            if result.data and len(result.data) > 0:
                biomarker_id = result.data[0]['id']
                self.biomarker_map[name] = biomarker_id
                self.stats['biomarkers_created'] += 1
                return biomarker_id
        except Exception as e:
            self.stats['errors'].append(f"Error creating biomarker {name}: {str(e)}")
            return None

    def import_lab_result(self, patient_id: str, row: Dict[str, str]) -> Optional[str]:
        """Import a single lab result and return its ID"""

        # Parse values
        value = self.parse_numeric_value(row['Result'])
        ref_min = self.parse_numeric_value(row['Ref_Min']) if row['Ref_Min'] else None
        ref_max = self.parse_numeric_value(row['Ref_Max']) if row['Ref_Max'] else None
        is_critical = row['Status'] == 'Abnormal'
        test_date = self.convert_date(row['Date'])

        lab_result_data = {
            'patient_id': patient_id,
            'test_name': row['Biomarker'],
            'value': value,
            'unit': row['Units'] if row['Units'] else None,
            'reference_min': ref_min,
            'reference_max': ref_max,
            'is_critical': is_critical,
            'test_date': test_date
        }

        try:
            result = self.supabase.table('lab_results').insert(lab_result_data).execute()
            if result.data and len(result.data) > 0:
                self.stats['lab_results_created'] += 1
                return result.data[0]['id']
        except Exception as e:
            self.stats['errors'].append(f"Error creating lab result for {row['Biomarker']}: {str(e)}")
            return None

    def create_lab_parsed_value(self, lab_result_id: str, biomarker_id: str,
                               row: Dict[str, str]) -> bool:
        """Create lab parsed value entry linking result to biomarker"""

        value = self.parse_numeric_value(row['Result'])

        parsed_value_data = {
            'lab_result_id': lab_result_id,
            'biomarker_id': biomarker_id,
            'raw_name': row['Biomarker'],
            'raw_value': row['Result'],
            'parsed_value': value,
            'unit': row['Units'] if row['Units'] else None,
            'confidence_score': 1.0,  # High confidence for CSV import
            'extraction_method': 'csv_import'
        }

        try:
            result = self.supabase.table('lab_parsed_values').insert(parsed_value_data).execute()
            if result.data:
                self.stats['lab_parsed_values_created'] += 1
                return True
        except Exception as e:
            self.stats['errors'].append(f"Error creating parsed value for {row['Biomarker']}: {str(e)}")
            return False

    def get_patient_id(self) -> Optional[str]:
        """Get the first patient ID from the database"""
        result = self.supabase.table('patients').select('id').limit(1).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]['id']
        else:
            print("No patient found in database. Please create a patient first.")
            return None

    def import_csv_data(self, csv_file: str, patient_id: Optional[str] = None, batch_size: int = 50):
        """Import all data from CSV file with batch processing"""

        # Get patient ID if not provided
        if not patient_id:
            patient_id = self.get_patient_id()
            if not patient_id:
                return False

        print(f"Importing data for patient ID: {patient_id}")

        # Read CSV file
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        # Filter out empty rows
        rows = [r for r in rows if r.get('Biomarker')]
        print(f"Processing {len(rows)} lab results...")

        # Process in batches for better performance
        for batch_start in range(0, len(rows), batch_size):
            batch_end = min(batch_start + batch_size, len(rows))
            batch = rows[batch_start:batch_end]

            print(f"Processing batch {batch_start+1}-{batch_end}/{len(rows)}...")

            lab_results_batch = []
            parsed_values_batch = []

            for row in batch:
                # 1. Get or create biomarker
                biomarker_id = self.get_or_create_biomarker(
                    name=row['Biomarker'],
                    category=row['Category'],
                    unit=row['Units'],
                    ref_min=row['Ref_Min'],
                    ref_max=row['Ref_Max']
                )

                # 2. Create lab result
                lab_result_id = self.import_lab_result(patient_id, row)

                # 3. Create parsed value linking result to biomarker
                if lab_result_id and biomarker_id:
                    self.create_lab_parsed_value(lab_result_id, biomarker_id, row)

        return True

    def print_summary(self):
        """Print import summary"""
        print("\n" + "="*50)
        print("IMPORT SUMMARY")
        print("="*50)
        print(f"Biomarkers created: {self.stats['biomarkers_created']}")
        print(f"Biomarkers existing: {self.stats['biomarkers_existing']}")
        print(f"Lab results created: {self.stats['lab_results_created']}")
        print(f"Lab parsed values created: {self.stats['lab_parsed_values_created']}")

        if self.stats['errors']:
            print(f"\nErrors encountered: {len(self.stats['errors'])}")
            for error in self.stats['errors'][:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(self.stats['errors']) > 5:
                print(f"  ... and {len(self.stats['errors']) - 5} more errors")
        else:
            print("\nNo errors encountered!")

        # Save detailed stats to file
        with open('import_summary.json', 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, indent=2, ensure_ascii=False)
        print("\nDetailed summary saved to import_summary.json")


def main():
    """Main import function"""
    print("Lab Data Importer for Supabase")
    print("="*50)

    # Initialize importer
    try:
        importer = LabDataImporter()
    except ValueError as e:
        print(f"Error: {e}")
        print("Please ensure your .env.local file contains SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        return

    # Choose which CSV to import
    csv_files = {
        '1': ('lab_results_full.csv', 'Full lab results (all 563 records)'),
        '2': ('lab_results_abnormal_full.csv', 'Abnormal results only (208 records)'),
        '3': ('lab_results_complete.csv', 'Sample data (45 records)')
    }

    print("\nAvailable CSV files:")
    for key, (filename, description) in csv_files.items():
        print(f"{key}. {description} - {filename}")

    choice = input("\nWhich file would you like to import? (1/2/3): ").strip()

    if choice not in csv_files:
        print("Invalid choice. Defaulting to full results.")
        choice = '1'

    csv_file, description = csv_files[choice]
    print(f"\nImporting: {description}")

    # Import data
    success = importer.import_csv_data(csv_file)

    if success:
        print("\nImport completed successfully!")
        importer.print_summary()
    else:
        print("\nImport failed. Check errors above.")


if __name__ == "__main__":
    main()