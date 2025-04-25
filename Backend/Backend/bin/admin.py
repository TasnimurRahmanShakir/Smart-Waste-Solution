from django.contrib import admin
from .models import Bin
# Register your models here.

@admin.register(Bin)
class BinAdmin(admin.ModelAdmin):
    list_display = ('id', 'bin_type', 'latitude', 'longitude', 'color', 'area', 'capacity', 'last_collected')
    search_fields = ('bin_name',)
    list_filter = ('bin_type', 'area')
    ordering = ('id',)