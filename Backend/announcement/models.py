from django.db import models
from user.models import CustomUser
from area.models import AreaModel
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



class Announcement(models.Model):
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    area = models.ForeignKey(AreaModel, null=True, blank=True, on_delete=models.SET_NULL)
    user = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.CASCADE)  # For user-specific emergency announcements

    def is_valid(self):
        return timezone.now() - self.created_at <= timezone.timedelta(days=7)
    

