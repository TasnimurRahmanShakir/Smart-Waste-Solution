from rest_framework import serializers
from .models import Vehicle
from user.models import CustomUser
from user.serializer import UserSerializer

class VehicleSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    class Meta:
        model = Vehicle
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['assigned_to'] = UserSerializer(instance.assigned_to).data if instance.assigned_to else None
        return rep
    
    def create(self, validated_data):
        vehicle = Vehicle.objects.create(**validated_data)
        return vehicle

    def update(self, instance, validated_data):
        instance.vehicle_type = validated_data.get('vehicle_type', instance.vehicle_type)
        instance.capacity = validated_data.get('capacity', instance.capacity)
        instance.status = validated_data.get('status', instance.status)
        instance.assigned_to = validated_data.get('assigned_to', instance.assigned_to)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.save()
        return instance