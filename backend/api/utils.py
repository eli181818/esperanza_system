from decimal import Decimal

# Priority computation function (moved here for self-containment; can go to utils.py later)
def is_abnormal_vital(vital_type, value):
    """Check if a vital is abnormal using standard adult thresholds."""
    if value is None:
        return False
    
    if vital_type == 'heart_rate':
        return value < 50 or value > 110
    elif vital_type == 'temperature':
        return value < 35.5 or value > 38.5
    elif vital_type == 'oxygen_saturation':
        return value < 92
    elif vital_type == 'blood_pressure':
        # Note: Your model doesn't have BP fields yet—add them if needed!
        # For now, this will always return False; implement when you add systolic/diastolic.
        return False
    return False

def compute_patient_priority(patient):
    """Compute priority score and map to tier based on latest vitals and age."""
    # Get latest vitals
    latest_vitals = patient.vital_signs.order_by('-date_time_recorded').first()
    if not latest_vitals:
        return 'NORMAL'  # No vitals? Default to normal
    score = 0
    is_senior = patient.is_senior()
    # Check core vitals (adapt if you add BP later)
    if is_abnormal_vital('heart_rate', latest_vitals.heart_rate):
        score += 3
    if is_abnormal_vital('temperature', latest_vitals.temperature):
        score += 2
    if is_abnormal_vital('oxygen_saturation', latest_vitals.oxygen_saturation):
        score += 4  # Higher weight for oxygenation
    
    # Note: No BP in your model yet—add fields like:
    # blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    # blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    # Then: if is_abnormal_vital('blood_pressure', {'systolic': ..., 'diastolic': ...}): score += 3
    # Senior bonus
    if is_senior:
        score += 2
    # BMI factor (using your computed BMI)
    if latest_vitals.BMI and latest_vitals.BMI >= 30:
        score += 1
    # Map to tier
    if score >= 6:
        return 'CRITICAL'
    elif score >= 3:
        return 'HIGH'
    elif score >= 1:
        return 'MEDIUM'
    else:
        return 'NORMAL'