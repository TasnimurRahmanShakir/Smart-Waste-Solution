from django.db import models
from area.models import AreaModel
from user.models import CustomUser
from requestFeedback.models import RequestFeedback
class Schedule(models.Model):
    SCHEDULE_TYPE_CHOICES = [
        ('daily', 'Daily Collection'),
        ('emergency', 'Emergency Collection'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('missed', 'Missed')
    ]
    request_feedback = models.OneToOneField(RequestFeedback, on_delete=models.CASCADE, null=True, blank=True)
    schedule_type = models.CharField(max_length=20, choices=SCHEDULE_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bins = models.ManyToManyField('bin.Bin', blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    area = models.ForeignKey(AreaModel, on_delete=models.CASCADE, null=True, blank=True, related_name='related_area')
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='requested_schedules')
    accepted_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_schedules')

    