from rest_framework import serializers
from .models import Bin
from area.models import AreaModel
from area.serializers import AreaSerializer
from math import radians, sin, cos, sqrt, atan2

class BinSerializer(serializers.ModelSerializer):
    area = serializers.PrimaryKeyRelatedField(queryset=AreaModel.objects.all(), required=False)
    class Meta:
        model = Bin
        fields = '__all__'
        
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['area'] = AreaSerializer(instance.area).data if instance.area else None
        return rep
        
    def create(self, validated_data):
        latitude = validated_data.get('latitude')
        longitude = validated_data.get('longitude')
        if latitude and longitude:
            flag = False
            areas = AreaModel.objects.all()
            for area in areas:
                
                if area.latitude and area.longitude and area.radius:
                    distance = self.haversine(longitude, latitude, area.longitude, area.latitude)
                    print(area.latitude, area.longitude, distance)
                    if distance <= area.radius:
                        
                        validated_data['area'] = area
                        flag = True
                        break
            if not flag:
                raise ValueError("Bin location is not within any service area radius.")
            
            if Bin.objects.filter(latitude=latitude, longitude=longitude).exists():
                raise serializers.ValidationError("Duplicate bin location detected.")
            
            bins = Bin.objects.all()
            for bin in bins:
                bin_distance = self.haversine(longitude, latitude, bin.longitude, bin.latitude)
                if bin_distance <= 50 and bin.bin_type == validated_data.get('bin_type'):
                    raise serializers.ValidationError("Another bin of the same type is already placed within 50 meters.")

            return super().create(validated_data)

        
    def update(self, instance, validated_data):
        instance.bin_type = validated_data.get('bin_type', instance.bin_type)
        instance.area = validated_data.get('area', instance.area)
        instance.color = validated_data.get('color', instance.color)
        instance.capacity = validated_data.get('capacity', instance.capacity)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.last_collected = validated_data.get('last_collected', instance.last_collected)
        instance.save()
        return instance

    def haversine(self, lon1, lat1, lon2, lat2):
        R = 6371.0
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c * 1000
        return distance