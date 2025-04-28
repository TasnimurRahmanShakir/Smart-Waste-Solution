from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import RegisterAPI, LoginAPI, ProfileAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('profile/', ProfileAPI.as_view(), name='user-profile'),

]



