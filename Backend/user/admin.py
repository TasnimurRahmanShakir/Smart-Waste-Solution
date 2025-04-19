from django.contrib import admin
from .models import CustomUser
# Register your models here.

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'user_type', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    list_filter = ('user_type', 'is_active')
    ordering = ('email',)



