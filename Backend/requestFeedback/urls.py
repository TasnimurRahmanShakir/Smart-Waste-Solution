from django.urls import path
from .views import RequestFeedbackCreateView, RequestFeedbackUpdateStatusView, EmergencyRequestView

urlpatterns = [
    path('emergencyRequest/', EmergencyRequestView.as_view(), name='get-emergency-request'),
    path('create/', RequestFeedbackCreateView.as_view(), name='create_feedback'),
    path('update/<int:pk>/', RequestFeedbackUpdateStatusView.as_view(), name='update_feedback_status'),
]