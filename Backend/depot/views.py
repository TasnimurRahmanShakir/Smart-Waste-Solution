from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Depot
from .serializers import DepotSerializer
# Create your views here.

class DepotListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        depots = Depot.objects.all()
        serializer = DepotSerializer(depots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DepotCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DepotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(submitted_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)