from django.urls import path
from .views import AnnouncementListView, AnnouncementCreateView, CollectorAnnouncementCreateView

urlpatterns = [
    path('', AnnouncementListView.as_view(), name='announcement-list'),
    path('create/', AnnouncementCreateView.as_view(), name='create-announcement' ),
    path('CollectorCreate/', CollectorAnnouncementCreateView.as_view(), name='collector-create-announcement' )
]
