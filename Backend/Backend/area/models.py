from django.db import models

# Create your models here.
class AreaModel(models.Model):
    area_name = models.CharField(max_length=100, unique=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    radius = models.FloatField(null=True, blank=True)  

