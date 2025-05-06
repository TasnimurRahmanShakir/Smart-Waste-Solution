from django.urls import path
from .views import NotificationListView

urlpatterns = [
    # Example URL pattern
    path('', NotificationListView.as_view(), name='notification'),
]