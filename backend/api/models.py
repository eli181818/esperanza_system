from django.db import models
from django.utils import timezone
from datetime import date
from .utils import compute_patient_priority

class HCStaff(models.Model):
    name = models.CharField(max_length=50)
    staff_pin = models.CharField(max_length=4, unique=True)

class Patient(models.Model):    
    patient_id = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=100)
    middle_initial = models.CharField(max_length=1, null=True, blank=True)
    last_name = models.CharField(max_length=50)
    age = models.IntegerField(null=True, blank=True)
    sex = models.CharField(max_length=6, choices=[('Male', 'Male'), ('Female', 'Female')])
    contact = models.CharField(max_length=11, default='N/A')
    address = models.TextField(max_length=450)
    username = models.CharField(max_length=50, null=True, blank=True, unique=True)
    birthdate = models.DateField(null=True, blank=True)
    pin = models.CharField(max_length=4)
    fingerprint_id = models.CharField(max_length=4, null=True, blank=True, unique=True)
    last_visit = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):  # Calculate age
        if self.birthdate:
            today = date.today()
            calculated_age = today.year - self.birthdate.year
            
            # Adjust if birthday hasn't happened yet this year
            if (today.month, today.day) < (self.birthdate.month, self.birthdate.day):
                calculated_age -= 1
            self.age = calculated_age
            
        if not self.patient_id:
            today = timezone.now().date()
            yyyymmdd = today.strftime("%Y%m%d")
            
            # Count patients created today
            count_today = Patient.objects.filter(patient_id__startswith=f"P-{yyyymmdd}").count() + 1
            self.patient_id = f"P-{yyyymmdd}-{count_today:03d}"
        super().save(*args, **kwargs)

    def is_senior(self):
        """Helper: Check if patient is senior (age >= 65)."""
        return self.age is not None and self.age >= 65

class VitalSigns(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vital_signs')  # Link to Patient model
    device_id = models.CharField(max_length=50, null=True, blank=True)  # Link to the RPi device
    date_time_recorded = models.DateTimeField(auto_now_add=True)
    heart_rate = models.IntegerField(null=True, blank=True)  # bpm; Allow null for optional
    temperature = models.FloatField(null=True, blank=True)  # °C
    oxygen_saturation = models.FloatField(null=True, blank=True)  # %
    # Optional: Add BP if needed (as per your original query)
    # blood_pressure_systolic = models.IntegerField(null=True, blank=True)  # mmHg
    # blood_pressure_diastolic = models.IntegerField(null=True, blank=True)  # mmHg
    height = models.FloatField(null=True, blank=True)  # meters
    weight = models.FloatField(null=True, blank=True)  # kg
    BMI = models.FloatField(null=True, blank=True) 
    
    def save(self, *args, **kwargs):  # Fixed: Override save() to auto-compute BMI
        # Compute BMI if height and weight are provided
        if self.height and self.weight and self.height > 0:
            self.BMI = round(self.weight / (self.height ** 2), 2)
        # If no height/weight, leave BMI as None
        super().save(*args, **kwargs)

class QueueEntry(models.Model):
    PRIORITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('NORMAL', 'Normal'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='queue_entries')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, null=True, blank=True)
    entered_at = models.DateTimeField(default=timezone.now)
    queue_number = models.CharField(max_length=10, null=True, blank=True)
    
    class Meta:
        ordering = ['-entered_at']
    
    def save(self, *args, **kwargs):
        # ✅ UPDATE LAST VISIT when entering queue
        self.patient.last_visit = timezone.now()
        self.patient.save()
        
        # Auto-compute priority on save (if not set)
        if not self.priority:
            self.priority = compute_patient_priority(self.patient)
        
        if not self.queue_number:
            today = timezone.now().date()
            count_today = QueueEntry.objects.filter(entered_at__date=today).count() + 1
            self.queue_number = f"Q{count_today:03d}"
        super().save(*args, **kwargs)

