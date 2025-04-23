from django.urls import path
from .views import ScheduleView, ScheduleCreate, ScheduleUpdate

urlpatterns = [
    path('', ScheduleView.as_view(), name='schedule-list'),
    path('create/', ScheduleCreate.as_view(), name='schedule-detail'),
    path('update/<int:pk>/', ScheduleUpdate.as_view(), name='schedule-update'),
    
]