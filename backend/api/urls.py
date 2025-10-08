from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, VitalSignsViewSet, QueueViewSet, login, receive_vital_signs, get_all_patients, test_rpi_connection

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'vitals', VitalSignsViewSet)
router.register(r'queue', QueueViewSet)

urlpatterns = [ # endpoints
    path('login/', login, name="login"), # handles login via PIN
    path('', include(router.urls)), # includes the viewsets for patients and vitals
    path('all-patients/', get_all_patients, name='all_patients'),
    path('receive-vitals/', receive_vital_signs, name='receive_vitals'),
    path('test-connection/', test_rpi_connection, name='test_connection'),
    # path('rpi/data/', receive_vital_signs, name='receive_vital_signs'),
    
]
