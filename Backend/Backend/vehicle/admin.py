from django.contrib import admin
from .models import Vehicle
# Register your models here.
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle_type', 'capacity', 'latitude', 'longitude', 'status', 'assigned_to')
    search_fields = ('vehicle_type','id')
    list_filter = ('vehicle_type', )
    ordering = ('id',)