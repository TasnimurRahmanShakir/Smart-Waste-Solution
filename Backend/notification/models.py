from django.db import models
from user.models import CustomUser
# Create your models here.
class Notification(models.Model):
    where_to_send  = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    message = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)