from rest_framework import serializers
from .models import AreaModel

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaModel
        fields = ['id', 'area_name', 'latitude', 'longitude', 'radius']

    

