from rest_framework import serializers
from .models import Schedule
from bin.models import Bin

class ScheduleSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Schedule
        fields = ['id', 'schedule_type', 'bins', 'status', 'created_at', 'area', 'requested_by']

    #validate on bin cannot be in two active schedules
    