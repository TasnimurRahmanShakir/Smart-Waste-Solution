from django.urls import path
from .views import AreaView,AreaCreate

urlpatterns = [
    path('', AreaView.as_view(), name='area-list'),
    path('create/', AreaCreate.as_view(), name='area-detail'),
]