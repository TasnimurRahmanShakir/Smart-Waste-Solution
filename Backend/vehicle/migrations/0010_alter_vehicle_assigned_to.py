# Generated by Django 5.2 on 2025-05-01 06:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vehicle', '0009_alter_vehicle_assigned_to_alter_vehicle_latitude_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='vehicle',
            name='assigned_to',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_vehicle', to=settings.AUTH_USER_MODEL),
        ),
    ]
