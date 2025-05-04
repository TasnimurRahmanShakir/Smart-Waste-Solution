from rest_framework import serializers

from user.models import CustomUser
from user.serializer import UserSerializer
from .models import RequestFeedback

class RequestFeedbackSerializer(serializers.ModelSerializer):
    requested_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    class Meta:
        model = RequestFeedback
        fields = '__all__'
        
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['requested_by'] = UserSerializer(instance.requested_by).data if instance.requested_by else None
        return rep