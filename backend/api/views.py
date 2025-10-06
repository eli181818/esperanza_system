from django.shortcuts import render
from rest_framework import viewsets, status
from .models import Patient, VitalSigns, HCStaff
from .serializers import PatientSerializer, VitalSignsSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response    
from django.db.models import Q
from datetime import datetime

# Create your views here.

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny] 
    
    @action(detail=False, methods=['get']) # Custom action to get patient by PIN
    def by_pin(self, request): # GET /patients/by_pin/?pin=1234
        pin = request.query_params.get('pin')   
        if not pin:
            return Response({"error": "PIN is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            patient = Patient.objects.get(pin=pin) # Fetch patient by PIN
            serializer = self.get_serializer(patient) # Serialize the patient data
            return Response(serializer.data) # Return serialized data
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        
    def get_queryset(self): 
        queryset = Patient.objects.all()

        # General search filter
        if self.request.query_params.get('search'):
            search_term = self.request.query_params.get('search')
            queryset = queryset.filter(
                Q(first_name__icontains=search_term) | 
                Q(last_name__icontains=search_term) | 
                Q(address__icontains=search_term) | 
                Q(patient_id__icontains=search_term) 
            )
        return queryset
         
class VitalSignsViewSet(viewsets.ModelViewSet):
    queryset = VitalSigns.objects.all()
    serializer_class = VitalSignsSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self): # Filtering vital signs by patient_id and date range
        queryset = VitalSigns.objects.all()
        
        # Filter by patient_id
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)
            
        return queryset.select_related('patient').order_by('-timestamp')
    
    @action(detail=False, methods=['get'], url_path='by_patient/(?P<patient_id>[^/.]+)') # Custom action to get vitals by patient_id
    def by_patient(self, request, patient_id=None):
        vitals = VitalSigns.objects.filter(patient__patient_id=patient_id)
        serializer = self.get_serializer(vitals, many=True)
        return Response(serializer.data)
    
@api_view(['POST'])
def receive_vital_signs(request): # FOR RPi
    """
    FOR RPi - Receives vital signs data from Raspberry Pi
    
    Expected JSON format:
    {
        "patient_id": "P001",
        "heart_rate": 72,
        "temperature": 36.5,
        "oxygen_saturation": 98,
        "weight": 65.5,
        "height": 170.0,
        "BMI": 22.6
    }"""
    
    try:
        data = request.data # Expecting JSON data
        
        patient_id = data.get('patient_id')
        if not patient_id:
            return Response(
                {"error": "patient_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )        
        try:
            patient = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {
                    "error": "Patient not found",
                    "patient_id": patient_id
                }, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        vital_signs = VitalSigns.objects.create( # create new record from received data
            patient=patient,
            heart_rate=data.get('heart_rate'),
            temperature=data.get('temperature'),
            oxygen_saturation=data.get('oxygen_saturation'),
            weight=data.get('weight'),
            height=data.get('height'),
            BMI=data.get('BMI'),
            timestamp=datetime.now()
        )
        
        # Serialize and return the created record
        serializer = VitalSignsSerializer(vital_signs)
        
        return Response({
            "success": True,
            "message": "Vital signs received and saved successfully",
            "patient_name": patient.name,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error receiving vitals: {str(e)}")  # For debugging
        return Response({
            "error": "Server error",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def test_rpi_connection(request):
    """
    Simple test endpoint to verify RPi can connect to Django
    """
    return Response({
        "status": "connected",
        "message": "Django server is reachable from Raspberry Pi",
        "timestamp": datetime.now().isoformat()
    })
    
@api_view(['POST'])
def login(request):
    pin = request.data.get("pin")
    login_type = request.data.get("login_type")  # 'staff' or 'patient'
    username = request.data.get("username")  # For patient login
    
    if not pin:
        return Response({"error": "PIN required"}, status=status.HTTP_400_BAD_REQUEST)
    
    pin = str(pin).strip()
    
    # Staff login
    if login_type == 'staff':
        try:
            staff = HCStaff.objects.get(staff_pin=pin)
            return Response({
                "id": staff.id,
                "name": staff.name,
                "role": "staff"
            })
        except HCStaff.DoesNotExist:
            return Response({"error": "Invalid staff PIN"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Patient login (requires both username and PIN)
    elif login_type == 'patient':
        if not username:
            return Response({"error": "Username required for patient login"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            patient = Patient.objects.get(username=username.strip(), pin=pin)
            return Response({
                "id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "role": "patient",
                "patient": PatientSerializer(patient).data
            })
        except Patient.DoesNotExist:
            return Response({"error": "Invalid username or PIN"}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({"error": "Invalid login type"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_all_patients(request):
    # You might want to verify the user is staff here
    user = request.session.get('user')  # or however you handle auth
    
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)

# @api_view(['POST'])
# def receive_vital_signs(request): # FOR RPi
#     serializer = VitalSignsSerializer(data=request.data)
    
#     if serializer.is_valid():
#         serializer.save() # save data to db
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


