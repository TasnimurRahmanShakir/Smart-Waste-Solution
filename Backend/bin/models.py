from django.db import models

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
