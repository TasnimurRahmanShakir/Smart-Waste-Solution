from django.db import models
from user.models import CustomUser

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
    latitude = models.FloatField(default=None)
    longitude = models.FloatField(default=None)
    assigned_to = models.ForeignKey('user.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)

        

    def __str__(self):
        return f"{self.name} vehicle assigned to ({self.assigned_to})"