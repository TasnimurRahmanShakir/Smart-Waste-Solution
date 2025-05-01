from django.urls import path
from .views import VehicleListCreateView, VehicleDetailView, VehicleAssignView, VehicleLocationUpdateView

urlpatterns = [
    path('create/', VehicleListCreateView.as_view(), name='vehicle-list-create'),
    path('', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('assign/<int:pk>/', VehicleAssignView.as_view(), name='vehicle-assign'),
    path('locationUpdate/', VehicleLocationUpdateView.as_view(), name='vehicle-location-update'),
]