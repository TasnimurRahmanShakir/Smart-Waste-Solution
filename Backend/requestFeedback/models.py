from django.db import models
from user.models import CustomUser 

class RequestFeedback(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected')
    ]
    requested_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    requested_bin = models.ForeignKey('bin.Bin', on_delete=models.CASCADE, null=True, blank=True) 
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    request_type = models.CharField(max_length=20, choices=[
        ('feedback', 'Feedback'),
        ('collection_request', 'Collection Request'),
        ('bin', 'Bin'),
        ('complaint', 'Complaint'),
        ('suggestion', 'Suggestion'),
        ('other', 'Other')
    ], default='feedback')

    