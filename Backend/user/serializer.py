from rest_framework import serializers
from .models import CustomUser
from area.models import AreaModel
from area.serializers import AreaSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'address', 'user_type', 'profile_image', 'area']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer): 
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if not data.get('email') or not data.get('password'):
            raise serializers.ValidationError("Both email and password are required.")
        return data

class UserSerializer(serializers.ModelSerializer):
    area = serializers.PrimaryKeyRelatedField(queryset=AreaModel.objects.all(), required=False)
    vehicle = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number', 'address',
            'user_type', 'profile_image', 'area', 'vehicle'
        ]
        

    def get_vehicle(self, obj):
        vehicle = getattr(obj, 'assigned_vehicle', None)
        if vehicle:
            return {
                'id': vehicle.id,
                'vehicle_type': vehicle.vehicle_type,
                'capacity': vehicle.capacity,
                'status': vehicle.status,
                'latitude': vehicle.latitude,
                'longitude': vehicle.longitude,
                'license_no': vehicle.license_no
            }
        return None
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['area'] = AreaSerializer(instance.area).data if instance.area else None
        return rep
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

        
