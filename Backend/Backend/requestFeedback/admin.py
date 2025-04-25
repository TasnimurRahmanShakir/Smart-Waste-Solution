from django.contrib import admin
from .models import RequestFeedback
# Register your models here.

@admin.register(RequestFeedback)
class RequestFeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'requested_by', 'requested_bin', 'message', 'status', 'created_at', 'request_type')
    search_fields = ('user__email', 'requested_by')
    list_filter = ('created_at',)
    ordering = ('-created_at',)