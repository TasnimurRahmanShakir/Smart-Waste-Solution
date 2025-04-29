from rest_framework import serializers
from .models import Depot
from user.models import CustomUser

class DepotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Depot
        fields = '__all__'

