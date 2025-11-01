from .models import Patient, QueueEntry, VitalSigns
from rest_framework import serializers
import re 
from datetime import date

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('patient_id',)  # Make patient_id read-only
    
    def validate_contact(self, value):
        if not re.match(r'^\d{11}$', value):
            raise serializers.ValidationError("Contact number must be exactly 11 digits.")
        return value
    
    def validate_birthdate(self, value):
        if value > date.today():
            raise serializers.ValidationError("Birthdate cannot be in the future.")
        return value
    
    def validate_pin(self, value):
        if not re.match(r'^\d{4}$', value): 
            raise serializers.ValidationError("PIN must be exactly 4 digits.")
        return value
    
class VitalSignsSerializer(serializers.ModelSerializer): 
    class Meta:
        model = VitalSigns
        fields = '__all__'

class QueueEntrySerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    class Meta:
        model = QueueEntry
        fields = ['id', 'patient', 'priority', 'entered_at', 'queue_number']
  
        
    
    