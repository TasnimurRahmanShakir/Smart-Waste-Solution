from django.urls import path
from .views import AdminDashboardView, CollectorDashboardView

urlpatterns = [
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('collector-dashboard/', CollectorDashboardView.as_view(), name='collector-dashboard'),
]
