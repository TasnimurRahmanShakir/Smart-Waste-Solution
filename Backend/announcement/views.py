from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Announcement
from .serializers import AnnouncementSerializer
from django.db.models import Q
from user.models import CustomUser
from notification.models import Notification
from notification.service import send_notification_to_user
from rest_framework import status
from schedule.models import Schedule

class AnnouncementListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_area = user.area

        one_week_ago = timezone.now() - timedelta(days=7)
        announcements = Announcement.objects.filter(created_at__gte=one_week_ago).order_by('-created_at')

        if user_area:
            announcements = announcements.filter(Q(area=user_area) | Q(user=user) )

        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)
    
class AnnouncementCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            announcement = serializer.save()

            message = announcement.message
            created_at = announcement.created_at

            if announcement.area:
                users = CustomUser.objects.filter(area=announcement.area).filter(user_type='citizen')
                for user in users:
                    Notification.objects.create(
                        where_to_send=user,
                        message=message
                    )
                    send_notification_to_user(user.id, message, created_at)

            # Case 2: User-specific announcement (e.g., emergency)
            elif announcement.user:
                Notification.objects.create(
                    where_to_send=announcement.user,
                    message=message,
                    created_at=created_at
                )
                send_notification_to_user(announcement.user.id, message, created_at)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CollectorAnnouncementCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.data)
        bin_id = request.data.get('bin_id')
        message = request.data.get('message')

        if not bin_id or not message:
            return Response({"error": "Bin ID and message are required."}, status=400)

        # Check for ongoing emergency schedule with the bin
        try:
            schedule = Schedule.objects.filter(
                status='ongoing',
                schedule_type='emergency',
                accepted_by=request.user.id,
                bins=bin_id
            ).select_related('requested_by').first()

            if not schedule:
                return Response({"error": "You are not accepted emergency schedule found for this bin."}, status=404)

            requested_user = schedule.requested_by
            if not requested_user:
                return Response({"error": "Requested user not found in the schedule."}, status=404)

            announcement = Announcement.objects.create(
                user=requested_user,
                message=message
            )

            Notification.objects.create(
                where_to_send=requested_user,
                message=message,
                created_at=announcement.created_at
            )

            send_notification_to_user(requested_user.id, message, announcement.created_at)

            return Response({"success": "Announcement sent successfully."}, status=201)

        except Exception as e:
            print("Error in announcement:", str(e))
            return Response({"error": "Something went wrong."}, status=500)