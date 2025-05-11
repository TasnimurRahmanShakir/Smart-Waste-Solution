from rest_framework import serializers
from geopy.distance import geodesic
from .models import AreaModel

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaModel
        fields = ['id', 'area_name', 'latitude', 'longitude', 'radius']

    def validate(self, data):
        new_center = (data.get('latitude'), data.get('longitude'))
        new_radius = data.get('radius', 0)
        allowed_overlap = 100

        for area in AreaModel.objects.all():
            existing_center = (area.latitude, area.longitude)
            existing_radius = area.radius

            
            distance = geodesic(new_center, existing_center).meters

            
            if distance < (new_radius + existing_radius - allowed_overlap):
                raise serializers.ValidationError(
                    f"Area overlaps more than allowed with '{area.area_name}' (distance: {distance:.2f} m, allowed overlap: {allowed_overlap} m)"
                )

        return data
