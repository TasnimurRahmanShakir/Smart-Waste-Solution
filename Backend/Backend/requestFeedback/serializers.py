from rest_framework import serializers
from .models import RequestFeedback

class RequestFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestFeedback
        fields = '__all__'
        
    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
    