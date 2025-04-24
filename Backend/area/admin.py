
# Register your models here.
from django.contrib import admin
from .models import AreaModel

@admin.register(AreaModel)
class AreaModelAdmin(admin.ModelAdmin):
    list_display = ('id','area_name', 'latitude','longitude','radius',)
    search_fields = ('name',)
    ordering = ('id',)

