from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ScheduleSerializer
from .models import Schedule
from bin.models import Bin
from rest_framework import status
from notification.service import send_notification_to_admin, send_notification_to_user
from user.models import CustomUser
from requestFeedback.models import RequestFeedback
from django.db.models import Q, Case, When, IntegerField

# Create your views here.

class ScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.user_type == 'admin':
            schedules = Schedule.objects.all().order_by(
                Case(
                    When(status='pending', then=0),
                    When(status='ongoing', then=1),
                    When(status='completed', then=2),
                    output_field=IntegerField()
                ))
        elif request.user.user_type == 'collector':
            schedules = Schedule.objects.filter(Q(accepted_by=request.user) | Q(status__in=['pending', 'ongoing']))
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
            if 'request_feedback' in data:
                try:
                    feedback = RequestFeedback.objects.get(id=data['request_feedback'])
                    feedback.status = 'accepted'
                    feedback.save()
                except RequestFeedback.DoesNotExist:
                    pass

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
            send_notification_to_user(data['requested_by'], f"Your Collection request is now accepted. New schedule created with ID: {schedule.id}")

        if 'area' in data:
            collectors = CustomUser.objects.filter(user_type='collector', area_id=data['area'])
        else:
            collectors = CustomUser.objects.filter(user_type='collector')

        for collector in collectors:
            send_notification_to_user(collector.id, f"New {schedule.schedule_type} schedule created. Please check your tasks.")

class ScheduleUpdate(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            
            schedule = Schedule.objects.get(id=pk)
            if  request.user != schedule.accepted_by:
                return Response({"error": "You are not authorized to update this schedule. This schedule is not accepted by you"}, status=status.HTTP_403_FORBIDDEN)
            
            request.data['status'] = 'completed'
            
            serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if schedule.requested_by:
                    if schedule.request_feedback:
                        schedule.request_feedback.status = 'completed'
                        schedule.request_feedback.save()

                    send_notification_to_user(schedule.requested_by_id, f"Your Collection request is now completed. Schedule ID: {schedule.id}")
                else:
                    send_notification_to_admin( f"{schedule.area} is now completed. Schedule ID: {schedule.id}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print("Error:", e)
            return Response({"error": "Something went wrong.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleAccept(APIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            schedule = Schedule.objects.get(id=pk)
            if schedule.accepted_by_id:
                return Response({"error": "Schedule already accepted."}, status=status.HTTP_400_BAD_REQUEST)
            request.data['accepted_by'] = request.user.id
            request.data['status'] = 'ongoing'
            serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if schedule.request_feedback:
                    schedule.request_feedback.status = 'in_progress'
                    schedule.request_feedback.save()
                    send_notification_to_user(schedule.request_feedback.requested_by_id, f"Your request is in Progress. Schedule ID: {schedule.id}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print("Error:", e)
            return Response({"error": "Something went wrong.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)