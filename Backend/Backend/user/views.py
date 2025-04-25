from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import registerSerializer, loginSerializer, UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# Create your views here.


class RegisterAPI(APIView):
    def post(self, request, *args, **kwargs):
        serializer = registerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data['password'])
            user.save()
            return Response({f"message": "User registered successfully: \n{request.data}"}, status=201)
        return Response(serializer.errors, status=400)
    
class LoginAPI(APIView):
    def post(self, request, *args, **kwargs):
        
            try:
                data = request.data
                print(data)
                serializer_class = loginSerializer(data=data)
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
                return Response(f"Error: {str(e)}", status=500)
            