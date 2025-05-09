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