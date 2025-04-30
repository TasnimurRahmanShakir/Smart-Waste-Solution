from django.urls import path
from .views import BinListView, AddNewBinView, UpdateBinDetails, DeleteBin

urlpatterns = [
    path('', BinListView.as_view(), name='bin-list'),
    path('create/', AddNewBinView.as_view(), name='add-bin'),
    path('update/<int:pk>/', UpdateBinDetails.as_view(), name='update-bin'),
    path('delete/<int:pk>/', DeleteBin.as_view(), name='delete-bin')
]