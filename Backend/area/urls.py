from django.urls import path
from .views import AreaView,AreaCreate, DeleteArea

urlpatterns = [
    path('', AreaView.as_view(), name='area-list'),
    path('create/', AreaCreate.as_view(), name='area-detail'),
    path('delete/<int:pk>/', DeleteArea.as_view(), name='area-delete')
]