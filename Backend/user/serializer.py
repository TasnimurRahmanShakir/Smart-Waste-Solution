from rest_framework import serializers
from .models import CustomUser

class registerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'address', 'user_type', 'profile_image', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class loginSerializer(serializers.Serializer): 
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if not data.get('email') or not data.get('password'):
            raise serializers.ValidationError("Both email and password are required.")
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'address', 'user_type', 'profile_image']