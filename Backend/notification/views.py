# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            where_to_send=request.user
        ).order_by('created_at')[:20]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
