from django.urls import path
from .views import DepotListView, DepotCreateView

urlpatterns = [
    path('', DepotListView.as_view(), name='depot-list'),
    path('create/', DepotCreateView.as_view(), name='depot-create')
]
