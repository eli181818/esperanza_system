from django.db import models
from django.contrib.auth.models import User 
from django.utils import timezone
from datetime import date

class HCStaff(models.Model):
    name = models.CharField(max_length=100)
    staff_pin = models.CharField(max_length=4, unique=True)

class Patient(models.Model):    
    patient_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=6, choices=[('Male', 'Male'), ('Female', 'Female')])
    contact = models.CharField(max_length=11, default='N/A')
    address = models.TextField(max_length=450)
    username = models.CharField(max_length=50, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    pin = models.CharField(max_length=4)
    fingerprint_id = models.CharField(max_length=4, null=True, blank=True)

    def save(self, *args, **kwargs): # Auto-generate the patient_id 
        if not self.patient_id:
            today = timezone.now().date()
            yyyymmdd = today.strftime("%Y%m%d")
            
            # Count patients created today
            count_today = Patient.objects.filter(patient_id__startswith=f"P-{yyyymmdd}").count() + 1
            self.patient_id = f"P-{yyyymmdd}-{count_today:03d}"
        super().save(*args, **kwargs)
        
    @property
    def age(self):
        if self.birthdate:
            today = date.today()
            age = today.year - self.birthdate.year
            # Adjust if birthday hasn't happened yet this year
            if (today.month, today.day) < (self.birthdate.month, self.birthdate.day):
                age -= 1
            return age
        return None

class VitalSigns(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vital_signs') # Link to Patient model
    device_id = models.CharField(max_length=50, null=True, blank=True) # Link to the RPi device
    date_time_recorded = models.DateTimeField(auto_now_add=True)
    heart_rate = models.IntegerField()
    temperature = models.FloatField()
    oxygen_saturation = models.FloatField()
    height = models.FloatField()
    weight = models.FloatField()
    BMI = models.FloatField(null=True, blank=True) 
    
    
    @property
    def bmi(self, *args, **kwargs): # Auto-save the BMI value
        if self.height > 0:
            self.BMI = round(self.weight / (self.height ** 2), 2)
        super().save(*args, **kwargs)
        

        