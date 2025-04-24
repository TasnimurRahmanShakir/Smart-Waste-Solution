from django.contrib import admin
from .models import Schedule
# Register your models here.
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'schedule_type', 'status', 'created_at', 'area', 'requested_by', 'accepted_by')
    search_fields = ('schedule_type','requested_by__email', 'accepted_by__email', 'area__area_name')
    list_filter = ('status',)
    ordering = ('-created_at',)
    