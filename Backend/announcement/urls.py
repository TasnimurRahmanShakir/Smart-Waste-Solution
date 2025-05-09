from django.urls import path
from .views import AnnouncementListView, AnnouncementCreateView

urlpatterns = [
    path('', AnnouncementListView.as_view(), name='announcement-list'),
    path('create/', AnnouncementCreateView.as_view(), name='create-announcement' )
]
