from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ScheduleSerializer
from .models import Schedule
from bin.models import Bin
from rest_framework import status
from notification.service import send_notification_to_admin, send_notification_to_user
from user.models import CustomUser

# Create your views here.

class ScheduleView(APIView):
    def get(self, request):
        schedules = Schedule.objects.all()
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
class ScheduleCreate(APIView):
    def post(self, request):
        data = request.data.copy()

        if not ('requested_bin' in data or 'area' in data):
            return Response({"error": "You must provide either 'requested_bin' or 'area'."}, status=status.HTTP_400_BAD_REQUEST)

        if 'area' in data:
            if self._area_has_active_schedule(data['area']):
                return Response({"error": f"Schedule for this area {data['area']} already exists."}, status=status.HTTP_400_BAD_REQUEST)
            bin_ids = self._get_bins_in_area(data['area'])
            if not bin_ids:
                return Response({"error": "No bins found for the selected area."}, status=status.HTTP_400_BAD_REQUEST)
            data['bins'] = bin_ids

        if 'requested_bin' in data:
            if self._bin_has_pending_schedule(data['requested_bin']):
                return Response({"error": f"Bin {data['requested_bin']} is already in a pending schedule."}, status=status.HTTP_400_BAD_REQUEST)
            data['bins'] = [data['requested_bin']]

        serializer = ScheduleSerializer(data=data)
        if serializer.is_valid():
            schedule = serializer.save()
            self._send_notifications(schedule, data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _area_has_active_schedule(self, area_id):
        return Schedule.objects.filter(area_id=area_id, status__in=['pending', 'ongoing']).exists()

    def _bin_has_pending_schedule(self, bin_id):
        return Schedule.objects.filter(bins=bin_id, status__in=['pending', 'ongoing']).exists()


    def _get_bins_in_area(self, area_id):
        return list(Bin.objects.filter(area_id=area_id).values_list('id', flat=True))

    def _send_notifications(self, schedule, data):
        if 'requested_by' in data:
            send_notification_to_user(data['requested_by'], f"Your Collection request is now ongoing. New schedule created with ID: {schedule.id}")

        if 'area' in data:
            collectors = CustomUser.objects.filter(user_type='collector', area_id=data['area'])
        else:
            collectors = CustomUser.objects.filter(user_type='collector')

        for collector in collectors:
            send_notification_to_user(collector.id, f"New {schedule.schedule_type} schedule created. Please check your tasks.")

class ScheduleUpdate(APIView):
    def update(self, request, pk):
        #handle update logic here
        pass