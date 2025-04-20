from django.urls import path
from .views import VehicleListCreateView, VehicleDetailView, VehicleAssignView

urlpatterns = [
    path('create/', VehicleListCreateView.as_view(), name='vehicle-list-create'),
    path('<int:pk>/', VehicleDetailView.as_view(), name='vehicle-detail'),
    path('assign/<int:pk>/', VehicleAssignView.as_view(), name='vehicle-assign'),
]