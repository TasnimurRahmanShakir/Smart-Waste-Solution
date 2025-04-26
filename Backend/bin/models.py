from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Create your models here.
class Bin(models.Model):
    bin_type = models.CharField(max_length=100, choices=[
        ('general', 'General Waste'),
        ('recyclable', 'Recyclable Waste'),
        ('organic', 'Organic Waste')
    ])
    area = models.ForeignKey('area.AreaModel', on_delete=models.CASCADE, null=True, blank=True)
    color = models.CharField(max_length=20, choices=[
        ('red', 'Red'),
        ('green', 'Green'),
    ], default='green')
    capacity = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    last_collected = models.DateTimeField(null=True, blank=True)
    
    

    
    def save(self, *args, **kwargs):
        super().save( *args, **kwargs)
        print("Bin color sent to monitoring group:", self.id, self.color, self.last_collected)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "monitoring_group",
            {
                "type": "send_bin_color",

                "message": {
                    "bin_id": self.id,
                    "id": self.id,
                    "color": self.color,
                    "latitude": self.latitude,
                    "longitude": self.longitude,
                }
            }
        )
        
