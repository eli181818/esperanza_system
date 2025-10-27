from django.shortcuts import render  # Unused but kept if needed elsewhere
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Patient, VitalSigns, HCStaff, QueueEntry
from .serializers import PatientSerializer, VitalSignsSerializer, QueueEntrySerializer 
from django.db.models import Q, Case, When, IntegerField  # For queue sorting
from django.utils import timezone  
from .utils import compute_patient_priority
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view


# Create your views here.

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny] 
    
    @action(detail=False, methods=['get'])  # Custom action to get patient by PIN
    def by_pin(self, request):  # GET /patients/by_pin/?pin=1234
        pin = request.query_params.get('pin')   
        if not pin:
            return Response({"error": "PIN is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            patient = Patient.objects.get(pin=pin)  # Fetch patient by PIN
            serializer = self.get_serializer(patient)  # Serialize the patient data
            return Response(serializer.data)  # Return serialized data
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
    
    def get_queryset(self):  # Filtering vital signs by patient_id and date range
        queryset = VitalSigns.objects.all()
        
        # Filter by patient_id
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        
        # Filter by date range (fixed: use date_time_recorded)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date_time_recorded__gte=date_from)
        if date_to:
            queryset = queryset.filter(date_time_recorded__lte=date_to)
            
        return queryset.select_related('patient').order_by('-date_time_recorded')  # Fixed: correct field
    
    @action(detail=False, methods=['get'])  # Simplified: Use query params
    def by_patient(self, request):
        patient_id = request.query_params.get('patient_id')  # GET /vitals/by_patient/?patient_id=ABC
        if not patient_id:
            return Response({"error": "patient_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        vitals = VitalSigns.objects.filter(patient__patient_id=patient_id)
        serializer = self.get_serializer(vitals, many=True)
        return Response(serializer.data)
    
    

@api_view(['POST'])
def receive_vital_signs(request):  # FOR RPi
    """
    FOR RPi - Receives vital signs data from Raspberry Pi
    
    Expected JSON format:
    {
        "patient_id": "P001",
        "heart_rate": 72,
        "temperature": 36.5,
        "oxygen_saturation": 98,
        "weight": 65.5,
        "height": 170.0
        # BMI optional: auto-computed from height/weight
    }
    """
    
    try:
        data = request.data  # Expecting JSON data
        
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
            
        # Create vital signs (no 'timestamp'; auto_now_add handles it. BMI auto-computed)
        vital_signs = VitalSigns.objects.create(
            patient=patient,
            device_id=data.get('device_id'),  # Optional from RPi
            heart_rate=data.get('heart_rate'),
            temperature=data.get('temperature'),
            oxygen_saturation=data.get('oxygen_saturation'),
            weight=data.get('weight'),
            height=data.get('height'),
            # BMI: Auto-computed in model.save()
            # Add BP if implemented: blood_pressure_systolic=data.get('systolic'), etc.
        )
        
        # ✅ UPDATE LAST VISIT
        patient.last_visit = timezone.now()
        patient.save()
        
        queue_entry, created = QueueEntry.objects.get_or_create(patient=patient)
        queue_entry.priority = compute_patient_priority(patient)
        queue_entry.save()
        
        # Serialize and return
        serializer = VitalSignsSerializer(vital_signs)
        patient_name = f"{patient.first_name} {patient.last_name}".strip()
        
        return Response({
            "success": True,
            "message": "Vital signs received and saved successfully",
            "patient_name": patient_name,
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
        "timestamp": timezone.now().isoformat()
    })

@csrf_exempt
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
            
            # CREATE SESSION (server-side)
            request.session['user_id'] = staff.id
            request.session['user_type'] = 'staff'
            request.session['name'] = staff.name
            
            return Response({
                "role": "staff",
                "name": staff.name
            })
            
        except HCStaff.DoesNotExist:
            return Response({"error": "Invalid staff PIN"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Patient login (requires both username and PIN)
    elif login_type == 'patient':
        if not username:
            return Response({"error": "Username required for patient login"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            patient = Patient.objects.get(username=username.strip(), pin=pin)
            
            request.session['user_id'] = patient.id
            request.session['user_type'] = 'patient'
            request.session['patient_id'] = patient.patient_id
            
            return Response({
                "role": "patient",
                "patient_id": patient.patient_id,  # Just the ID, not full data
                "name": f"{patient.first_name} {patient.last_name}"
            })
            
        except Patient.DoesNotExist:
            return Response({"error": "Invalid username or PIN"}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({"error": "Invalid login type"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_patient_profile(request):
    """Get current logged-in patient's profile"""
    user_type = request.session.get('user_type')
    
    if user_type != 'patient':
        return Response({"error": "Not authenticated as patient"}, status=status.HTTP_401_UNAUTHORIZED)
    
    patient_id = request.session.get('patient_id')
    
    try:
        patient = Patient.objects.get(patient_id=patient_id)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def logout(request):
    """Clear session"""
    request.session.flush()
    return Response({"message": "Logged out successfully"})

@api_view(['GET'])
def get_all_patients(request):
    # Add auth check if needed (e.g., permission_classes = [IsAuthenticated])
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)

class QueueViewSet(viewsets.ModelViewSet):
    queryset = QueueEntry.objects.all()
    serializer_class = QueueEntrySerializer
    permission_classes = [AllowAny]  # Restrict in production
    
    @action(detail=False, methods=['get'])
    def current_queue(self, request):
        """Get sorted queue: Prioritize by priority level, then entered_at (earliest first)."""
        queue = QueueEntry.objects.all().select_related(
            'patient', 'patient__vital_signs'  # Fixed: correct related_name
        ).annotate(
            priority_order=Case(
                When(priority='CRITICAL', then=1),
                When(priority='HIGH', then=2),
                When(priority='MEDIUM', then=3),
                default=4,
                output_field=IntegerField()
            )
        ).order_by('priority_order', 'entered_at')
        
        serializer = self.get_serializer(queue, many=True)
        return Response(serializer.data)
 