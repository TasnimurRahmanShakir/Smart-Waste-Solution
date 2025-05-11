from rest_framework import serializers
from .models import Schedule
from bin.models import Bin
from bin.serializers import BinSerializer
from user.models import CustomUser
from user.serializer import UserSerializer
from area.models import AreaModel
from area.serializers import AreaSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    bins = serializers.PrimaryKeyRelatedField(queryset=Bin.objects.all(), many=True)
    requested_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    accepted_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    area = serializers.PrimaryKeyRelatedField(queryset=AreaModel.objects.all(), required=False)
    class Meta:
        model = Schedule
        fields = ['id', 'schedule_type', 'bins', 'status', 'created_at', 'area', 'requested_by', 'accepted_by', 'request_feedback']

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.accepted_by = validated_data.get('accepted_by', instance.accepted_by)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['requested_by'] = UserSerializer(instance.requested_by).data if instance.requested_by else None
        rep['accepted_by'] = UserSerializer(instance.accepted_by).data if instance.accepted_by else None 
        rep['area'] = AreaSerializer(instance.area).data if instance.area else None
        rep['bins'] = BinSerializer(instance.bins.all(), many=True).data
        return rep
    