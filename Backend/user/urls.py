from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import RegisterAPI, LoginAPI, ProfileAPI, DeleteUserAPI, UserList, UserProfile, UpdateUserAPI

urlpatterns = [
    path('',UserList.as_view(), name='All-user' ),
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('profile/', ProfileAPI.as_view(), name='profile'),
    path('userProfile/<int:user_id>/', UserProfile.as_view(), name='user-profile'),
    path('delete/<int:user_id>/', DeleteUserAPI.as_view(), name='delete-user'),
    path('update/<int:user_id>/', UpdateUserAPI.as_view(), name='update-user')

]



