# Generated by Django 5.2 on 2025-05-03 17:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('area', '0001_initial'),
        ('schedule', '0007_alter_schedule_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='area',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='related_area', to='area.areamodel'),
        ),
    ]
