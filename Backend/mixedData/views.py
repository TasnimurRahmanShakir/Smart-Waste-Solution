from django.shortcuts import render
from notification.service import send_notification_to_admin, send_notification_to_user
from schedule.models import Schedule
from user.models import CustomUser
from depot.models import Depot
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now, timedelta
from django.db.models import Sum

from datetime import time, datetime
# Create your views here.

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def missed_schedule_update(self):
        schedules = Schedule.objects.filter(status='pending')
        for schedule in schedules:
            if now() > schedule.created_at + timedelta(days=1):
                schedule.status = 'missed'
                schedule.save()
                if schedule.requested_by:
                    send_notification_to_user(schedule.requested_by, f"Your schedule for {schedule.schedule_type} has been marked as missed.")
                send_notification_to_admin(f"Schedule ID {schedule.id} has been marked as missed.")
    
    def todays_pickup(self):
        current_time = now()
        today = current_time.date()
        start_time = datetime.combine(today, time(10, 0)).astimezone()
        end_time = start_time + timedelta(days=1)

        if current_time < start_time:
            start_time -= timedelta(days=1)
            end_time -= timedelta(days=1)

        return Schedule.objects.filter(created_at__range=(start_time, end_time)).count()
    
    def get_weekly_waste_data(self):
        today = now().date()
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        start_of_week = today - timedelta(days=today.weekday())

        waste_data = []

        for i in range(7):
            day = start_of_week + timedelta(days=i)
            total = Depot.objects.filter(collected_at=day).aggregate(Sum('weight'))['weight__sum'] or 0
            waste_data.append(round(total, 2))

        return ({
            'labels': days,
            'data': waste_data
        })
        
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({"error": "You do not have permission to access this data."}, status=403)

        self.missed_schedule_update()
        
        missed_schedule = Schedule.objects.filter(status='missed').count()
        pending_schedule = Schedule.objects.filter(status='pending').count()
        
        total_user = CustomUser.objects.filter(user_type='citizen').count()
        total_collector = CustomUser.objects.filter(user_type='collector').count()
        
        totalWaste = Depot.objects.aggregate(Sum('weight'))['weight__sum'] or 0
        totalWaste = round(totalWaste, 2) if totalWaste else 0.0
        
        start_time = datetime.combine(now().date(), time(10, 0)).astimezone()
        today_pickup = self.todays_pickup()
        
        weekly_waste_data = self.get_weekly_waste_data()
        # Get the count of each user type
        data = {
            "missed_schedule": missed_schedule,
            "pending_schedule": pending_schedule,
            "total_user": total_user,
            "total_collector": total_collector,
            "today_pickup": today_pickup,
            "total_waste": totalWaste,
            "weekly_waste_data": weekly_waste_data,
        }
        return Response(data, status=200)
   