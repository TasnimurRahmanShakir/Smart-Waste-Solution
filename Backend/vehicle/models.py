from django.db import models
from user.models import CustomUser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# Create your models here.
class Vehicle(models.Model):
    vehicle_type = models.CharField(max_length=100)
    capacity = models.FloatField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('in_use', 'In Use'),
            ('maintenance', 'Maintenance')
        ],
        default='available'
    )
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    assigned_to = models.OneToOneField('user.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save( *args, **kwargs)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "monitoring_group",
            {
                "type": "send_vehicle_location",
                "message": {
                    "vehicle_id": self.id,
                    "id": self.id,
                    "latitude": self.latitude,
                    "longitude": self.longitude,
                    "status": self.status
                }
            }
        )
        print("Vehicle location sent to monitoring group:", self.id, self.latitude, self.longitude)
        

    def __str__(self):
        return f"{self.vehicle_type} vehicle assigned to ({self.assigned_to})"