from django.db import models

# Create your models here.
class Depot(models.Model):
    weight = models.FloatField(null=True, blank=True, default=0.0)
    submitted_by = models.ForeignKey('user.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_depots')
    collected_at = models.DateField(auto_now_add=True)
    