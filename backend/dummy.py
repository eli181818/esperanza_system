"""
Django Management Command to Generate Sample Patients and Vital Signs for Queue Testing

OPTION 1 - As Management Command:
1. Save as: patients/management/commands/generate_test_data.py
2. Run: python manage.py generate_test_data

OPTION 2 - In Django Shell (PowerShell):
python manage.py shell
Then run: exec(open('dummy.py').read())

OPTION 3 - In Django Shell (Copy-Paste):
python manage.py shell
Then copy-paste this entire code
"""

from django.core.management.base import BaseCommand

from datetime import datetime, timedelta
from django.utils import timezone
from api.models import Patient, VitalSigns, QueueEntry
from api.utils import compute_patient_priority

# Clear existing test data (optional - comment out if you want to keep existing data)
print("Clearing existing queue entries, vital signs, and patients...")
QueueEntry.objects.all().delete()
VitalSigns.objects.all().delete()
Patient.objects.filter(patient_id__startswith='TEST-').delete()

print("\n" + "="*60)
print("Creating Sample Patients with Various Health Conditions")
print("="*60 + "\n")

# Sample patient data with different priority scenarios
sample_patients = [
    # CRITICAL CASES
    {
        "patient_id": "TEST-CRIT-001",
        "first_name": "Maria",
        "last_name": "Santos",
        "age": 72,
        "gender": "Female",
        "contact": "09171234567",
        "address": "123 Main St, Quezon City",
        "username": "maria_santos",
        "pin": "1111",
        "vitals": {
            "heart_rate": 135,  # Very high
            "temperature": 38.9,  # High fever
            "oxygen_saturation": 88,  # Low O2
            "weight": 58.0,
            "height": 1.58
        }
    },
    {
        "patient_id": "TEST-CRIT-002",
        "first_name": "Roberto",
        "last_name": "Cruz",
        "age": 68,
        "gender": "Male",
        "contact": "09181234568",
        "address": "456 Rizal Ave, Manila",
        "username": "roberto_cruz",
        "pin": "2222",
        "vitals": {
            "heart_rate": 48,  # Very low
            "temperature": 35.2,  # Hypothermia
            "oxygen_saturation": 86,  # Critical O2
            "weight": 75.0,
            "height": 1.72
        }
    },
    
    # HIGH PRIORITY CASES
    {
        "patient_id": "TEST-HIGH-001",
        "first_name": "Carmen",
        "last_name": "Reyes",
        "age": 66,
        "gender": "Female",
        "contact": "09191234569",
        "address": "789 Bonifacio St, Makati",
        "username": "carmen_reyes",
        "pin": "3333",
        "vitals": {
            "heart_rate": 115,  # Elevated
            "temperature": 38.2,  # Moderate fever
            "oxygen_saturation": 92,  # Slightly low
            "weight": 62.0,
            "height": 1.60
        }
    },
    {
        "patient_id": "TEST-HIGH-002",
        "first_name": "Jose",
        "last_name": "Garcia",
        "age": 70,
        "gender": "Male",
        "contact": "09201234570",
        "address": "321 Luna St, Pasig",
        "username": "jose_garcia",
        "pin": "4444",
        "vitals": {
            "heart_rate": 58,  # Low
            "temperature": 37.8,  # Slight fever
            "oxygen_saturation": 91,  # Low-ish O2
            "weight": 68.0,
            "height": 1.68
        }
    },
    
    # MEDIUM PRIORITY CASES
    {
        "patient_id": "TEST-MED-001",
        "first_name": "Ana",
        "last_name": "Lim",
        "age": 45,
        "gender": "Female",
        "contact": "09211234571",
        "address": "654 Mabini St, Taguig",
        "username": "ana_lim",
        "pin": "5555",
        "vitals": {
            "heart_rate": 95,  # Slightly elevated
            "temperature": 37.9,  # Mild fever
            "oxygen_saturation": 96,  # Normal
            "weight": 55.0,
            "height": 1.62
        }
    },
    {
        "patient_id": "TEST-MED-002",
        "first_name": "Pedro",
        "last_name": "Ramos",
        "age": 67,
        "gender": "Male",
        "contact": "09221234572",
        "address": "987 Del Pilar St, Mandaluyong",
        "username": "pedro_ramos",
        "pin": "6666",
        "vitals": {
            "heart_rate": 78,  # Normal
            "temperature": 37.2,  # Normal
            "oxygen_saturation": 95,  # Normal
            "weight": 70.0,
            "height": 1.70
        }
    },
    
    # NORMAL PRIORITY CASES
    {
        "patient_id": "TEST-NORM-001",
        "first_name": "Lisa",
        "last_name": "Tan",
        "age": 28,
        "gender": "Female",
        "contact": "09231234573",
        "address": "159 Aguinaldo St, Paranaque",
        "username": "lisa_tan",
        "pin": "7777",
        "vitals": {
            "heart_rate": 72,  # Normal
            "temperature": 36.8,  # Normal
            "oxygen_saturation": 98,  # Normal
            "weight": 58.0,
            "height": 1.65
        }
    },
    {
        "patient_id": "TEST-NORM-002",
        "first_name": "Miguel",
        "last_name": "Fernandez",
        "age": 35,
        "gender": "Male",
        "contact": "09241234574",
        "address": "753 Roxas Blvd, Pasay",
        "username": "miguel_fernandez",
        "pin": "8888",
        "vitals": {
            "heart_rate": 68,  # Normal
            "temperature": 36.5,  # Normal
            "oxygen_saturation": 99,  # Normal
            "weight": 72.0,
            "height": 1.75
        }
    },
    {
        "patient_id": "TEST-NORM-003",
        "first_name": "Sofia",
        "last_name": "Martinez",
        "age": 42,
        "gender": "Female",
        "contact": "09251234575",
        "address": "246 Taft Ave, Manila",
        "username": "sofia_martinez",
        "pin": "9999",
        "vitals": {
            "heart_rate": 75,  # Normal
            "temperature": 37.0,  # Normal
            "oxygen_saturation": 97,  # Normal
            "weight": 60.0,
            "height": 1.63
        }
    },
]

# Create patients and their vital signs
created_count = 0
for idx, patient_data in enumerate(sample_patients, 1):
    vitals_data = patient_data.pop('vitals')
    
    # Create patient
    patient = Patient.objects.create(**patient_data)
    
    # Create vital signs
    vitals = VitalSigns.objects.create(
        patient=patient,
        device_id=f"RPI-TEST-{idx:02d}",
        **vitals_data
    )
    
    # Create queue entry (this will auto-compute priority)
    queue_entry = QueueEntry.objects.create(patient=patient)
    
    created_count += 1
    print(f"✓ Created: {patient.first_name} {patient.last_name}")
    print(f"  Patient ID: {patient.patient_id}")
    print(f"  Age: {patient.age} | Senior: {patient.is_senior()}")
    print(f"  Vitals: HR={vitals.heart_rate}, Temp={vitals.temperature}°C, O2={vitals.oxygen_saturation}%")
    print(f"  BMI: {vitals.BMI}")
    print(f"  Priority: {queue_entry.priority}")
    print(f"  Queue #: {queue_entry.queue_number}")
    print()

print("="*60)
print(f"✓ Successfully created {created_count} test patients")
print("="*60)
print("\nQueue Priority Summary:")
print("-" * 60)

# Display queue statistics
for priority in ['CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL']:
    count = QueueEntry.objects.filter(priority=priority).count()
    print(f"{priority:10s}: {count} patient(s)")

print("\n" + "="*60)
print("Testing Complete! Check your queue at:")
print("GET /api/queue/current_queue/")
print("="*60)