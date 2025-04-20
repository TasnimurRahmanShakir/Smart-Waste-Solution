from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_type', 'capacity', 'status', 'assigned_to']

    def create(self, validated_data):
        vehicle = Vehicle.objects.create(**validated_data)
        return vehicle

    def update(self, instance, validated_data):
        instance.vehicle_type = validated_data.get('vehicle_type', instance.vehicle_type)
        instance.capacity = validated_data.get('capacity', instance.capacity)
        instance.status = validated_data.get('status', instance.status)
        instance.assigned_to = validated_data.get('assigned_to', instance.assigned_to)
        instance.save()
        return instance