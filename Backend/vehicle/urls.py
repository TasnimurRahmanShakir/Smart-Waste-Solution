from django.urls import path
from .views import VehicleListCreateView, VehicleDetailView, VehicleAssignView, VehicleLocationUpdateView, VehicleUpdate, DeleteVehicle

urlpatterns = [
    path('create/', VehicleListCreateView.as_view(), name='vehicle-list-create'),
    path('', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('assign/<int:pk>/', VehicleAssignView.as_view(), name='vehicle-assign'),
    path('update/<int:pk>/', VehicleUpdate.as_view(), name='vehicle-update'),
    path('delete/<int:pk>/', DeleteVehicle.as_view(), name='delete-vehicle'),
    path('locationUpdate/', VehicleLocationUpdateView.as_view(), name='vehicle-location-update'),
]