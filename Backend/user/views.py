import traceback
from django.shortcuts import render
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import CustomUserSerializer, LoginSerializer, UserSerializer
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
# Create your views here.

class ProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(UserSerializer(user).data)
class LoginAPI(APIView):
    def post(self, request, *args, **kwargs):
        
            try:
                data = request.data
                print(data)
                serializer_class = LoginSerializer(data=data)
                if serializer_class.is_valid():
                    email = serializer_class.validated_data['email']
                    password = serializer_class.validated_data['password']
                    
                    user = authenticate(email=email, password=password)
                    if user is not None:
                        refresh = RefreshToken.for_user(user)

                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                            'user': UserSerializer(user).data,
                            'message': 'Login successful'
                        })
                    else:
                        return Response('Invalid credentials', status=400)
                    
                
                else:
                    return Response(
                        {
                            'message': 'Wrong credential, please enter correct Email and password.',
                            'errors': serializer_class.errors
                        }, 
                        status=400
                    )
            except Exception as e:
                print("Backend error:\n", traceback.format_exc())  # Optional: logs full trace
                return Response({'error': str(e)}, status=500)

class RegisterAPI(APIView):
    def post(self, request, *args, **kwargs):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }, status=201)
        return Response(serializer.errors, status=400)
    
class DeleteUserAPI(APIView):
    def delete(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id)
            if user.profile_image and os.path.isfile(user.profile_image.path):
                os.remove(user.profile_image.path)
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)