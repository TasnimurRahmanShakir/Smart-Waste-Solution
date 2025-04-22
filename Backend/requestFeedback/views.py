from django.shortcuts import render

# requestfeedback/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import RequestFeedback
from .serializers import RequestFeedbackSerializer
from notification.service import send_notification_to_admin, send_notification_to_user

class RequestFeedbackCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RequestFeedbackSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            send_notification_to_admin(f"New request/feedback from {request.user.email}")

            return Response({"message": "Feedback submitted successfully."})
        return Response(serializer.errors, status=400)

class RequestFeedbackUpdateStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            feedback = RequestFeedback.objects.get(id=pk)
            feedback.status = request.data.get('status')
            serializer = RequestFeedbackSerializer(feedback, data=request.data, partial=True)
            print("Feedback status:", feedback.requested_by_id)
            if serializer.is_valid():
                serializer.save()
                send_notification_to_user(feedback.requested_by_id, f"Your request has been {feedback.status}")

            return Response({"message": "Status updated successfully."})
        except RequestFeedback.DoesNotExist:
            return Response({"error": "Request/Feedback not found"}, status=404)

