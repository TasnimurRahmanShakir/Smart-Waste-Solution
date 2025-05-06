from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from area.models import AreaModel
from .serializers import ScheduleSerializer
from .models import Schedule
from bin.models import Bin
from rest_framework import status
from notification.service import send_notification_to_admin, send_notification_to_user
from user.models import CustomUser
from notification.models import Notification
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

        error_response = self._validate_request_data(data)
        if error_response:
            return error_response

        if 'area' in data:
            bin_ids = self._process_area_data(data)
            if isinstance(bin_ids, Response):
                return bin_ids
            data['bins'] = bin_ids

        if 'requested_bin' in data:
            bin_response = self._process_requested_bin(data)
            if bin_response:
                return bin_response

        serializer = ScheduleSerializer(data=data)
        if serializer.is_valid():
            schedule = serializer.save()
            self._update_bin_colors(schedule.bins.all(), 'red')
            self._handle_request_feedback(data)
            self._send_notifications(schedule, data)
            return Response({
                "message": "Schedule created successfully.",
                "schedule": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _validate_request_data(self, data):
        if not ('requested_bin' in data or 'area' in data):
            return Response({"error": "You must provide either 'requested_bin' or 'area'."}, status=status.HTTP_400_BAD_REQUEST)
        return None

    def _process_area_data(self, data):
        if self._area_has_active_schedule(data['area']):
            return Response({"error": f"Schedule for this area {data['area']} already exists."}, status=status.HTTP_400_BAD_REQUEST)
        bin_ids = self._get_bins_in_area(data['area'])
        if not bin_ids:
            return Response({"error": "No bins found for the selected area."}, status=status.HTTP_400_BAD_REQUEST)
        return bin_ids

    def _process_requested_bin(self, data):
        if self._bin_has_pending_schedule(data['requested_bin']):
            return Response({"error": f"Bin {data['requested_bin']} is already in a pending schedule."}, status=status.HTTP_400_BAD_REQUEST)
        data['bins'] = [data['requested_bin']]
        return None

    def _update_bin_colors(self, bins, color):
        for _bin in bins:
            bin_obj = Bin.objects.get(id=_bin.id)
            bin_obj.color = color
            bin_obj.save()

    def _handle_request_feedback(self, data):
        if 'request_feedback' in data:
            try:
                feedback = RequestFeedback.objects.get(id=data['request_feedback'])
                feedback.status = 'accepted'
                feedback.save()
            except RequestFeedback.DoesNotExist:
                pass


    def _area_has_active_schedule(self, area_id):
        return Schedule.objects.filter(area_id=area_id, status__in=['pending', 'ongoing']).exists()

    def _bin_has_pending_schedule(self, bin_id):
        return Schedule.objects.filter(bins=bin_id, status__in=['pending', 'ongoing']).exists()


    def _get_bins_in_area(self, area_id):
        return list(Bin.objects.filter(area_id=area_id).values_list('id', flat=True))

    def _send_notifications(self, schedule, data):
        if 'requested_by' in data:
            
            notification = Notification.objects.create(
                where_to_send=CustomUser.objects.get(id=data['requested_by']),
                message=f"Your Collection request is now accepted. New schedule created with ID: {schedule.id}",
            )
            send_notification_to_user(data['requested_by'], f"Your Collection request is now accepted. New schedule created with ID: {schedule.id}", notification.created_at)

        if 'area' in data:
            collectors = CustomUser.objects.filter(user_type='collector', area_id=data['area'])
        else:
            collectors = CustomUser.objects.filter(user_type='collector')

        for collector in collectors:
            
            notification = Notification.objects.create(
                where_to_send=collector,
                message=f"New {schedule.schedule_type} schedule created. Please check your tasks.",
            )
            send_notification_to_user(collector.id, f"New {schedule.schedule_type} schedule created. Please check your tasks.", notification.created_at)

class ScheduleUpdate(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            
            schedule = Schedule.objects.get(id=pk)
            if  request.user != schedule.accepted_by:
                return Response({"error": "You are not authorized to update this schedule. This schedule is not accepted by you"}, status=status.HTTP_403_FORBIDDEN)
            
            request.data['status'] = 'completed'
            
            serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                for _bin in schedule.bins.all():
                    set_color = Bin.objects.get(id=_bin.id)
                    set_color.color = 'green'
                    set_color.last_collected = schedule.created_at
                    set_color.save()
                
                if schedule.requested_by:
                    if schedule.request_feedback:
                        schedule.request_feedback.status = 'completed'
                        schedule.request_feedback.save()

                   
                    
                    notification = Notification.objects.create(
                        where_to_send=schedule.requested_by,
                        message=f"Your Collection request is now completed. Schedule ID: {schedule.id}",
                    )
                    send_notification_to_user(schedule.requested_by_id, f"Your Collection request is now completed. Schedule ID: {schedule.id}", notification.created_at)
                else:
                    
                    for admin in CustomUser.objects.filter(user_type='admin'):
                        notification = Notification.objects.create(
                            where_to_send=admin,
                            message=f"{schedule.area} is now completed. Schedule ID: {schedule.id}",
                        )
                        send_notification_to_admin( f"{schedule.area} is now completed. Schedule ID: {schedule.id}", notification.created_at)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print("Error:", e)
            return Response({"error": "Something went wrong.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleAccept(APIView):
  
    permission_classes = [IsAuthenticated]

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
                    
                    
                    notification = Notification.objects.create(
                        where_to_send=schedule.request_feedback.requested_by,
                        message=f"Your request is in Progress. Schedule ID: {schedule.id}",
                    )
                    send_notification_to_user(schedule.request_feedback.requested_by_id, f"Your request is in Progress. Schedule ID: {schedule.id}", notification.created_at)
                    
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print("Error:", e)
            return Response({"error": "Something went wrong.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ScheduleDelete(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        try:
            delete_schedule = Schedule.objects.filter(id=pk)
            
            if not delete_schedule.exists():
                return Response({'error': 'Bin not found'}, status=404)

            delete_schedule.delete()
            return Response( status=204)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
class UnscheduledArea(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        areas = AreaModel.objects.all()

        area_status = []
        for area in areas:
            has_active_schedule = Schedule.objects.filter(
                area=area,
                schedule_type='daily',
                status__in=['pending', 'ongoing']
            ).exists()
            if not has_active_schedule:
                area_status.append({
                    'id': area.id,
                    'name': area.area_name
                })
                
        return Response(area_status, status=201)

    