from rest_framework import serializers
from .models import Schedule
from bin.models import Bin

class ScheduleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Schedule
        fields = ['id', 'schedule_type', 'bins', 'status', 'created_at', 'area', 'requested_by', 'accepted_by', 'request_feedback']

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.accepted_by = validated_data.get('accepted_by', instance.accepted_by)
        instance.save()
        return instance
    
    