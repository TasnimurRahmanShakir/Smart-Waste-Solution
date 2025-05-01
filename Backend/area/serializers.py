from rest_framework import serializers
from .models import AreaModel

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaModel
        fields = ['id', 'area_name', 'latitude', 'longitude', 'radius']

    
    def create(self, validated_data):
        latitude = validated_data.get('latitude')
        longitude = validated_data.get('longitude')
        if AreaModel.objects.filter(latitude=latitude, longitude=longitude).exists():
                raise ValueError("Duplicate Area location detected. The same latitude and longitude already exist.")
    

        return super().create(validated_data)