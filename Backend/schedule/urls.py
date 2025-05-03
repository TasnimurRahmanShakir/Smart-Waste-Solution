from django.urls import path
from .views import ScheduleView, ScheduleCreate, ScheduleUpdate, ScheduleAccept, ScheduleDelete, UnscheduledArea

urlpatterns = [
    path('', ScheduleView.as_view(), name='schedule-list'),
    path('create/', ScheduleCreate.as_view(), name='schedule-detail'),
    path('update/<int:pk>/', ScheduleUpdate.as_view(), name='schedule-update'), 
    path('accept/<int:pk>/', ScheduleAccept.as_view(), name='schedule-accepted'),
    path('delete/<int:pk>/', ScheduleDelete.as_view(), name='schedule-delete'),
    path('area/', UnscheduledArea.as_view(), name='unscheduled_area')
]