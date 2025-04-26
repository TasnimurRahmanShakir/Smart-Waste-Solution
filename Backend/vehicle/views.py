from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import VehicleSerializer
from .models import Vehicle

# Create your views here.
class VehicleListCreateView(APIView):
    
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Vehicle created successfully!", "vehicle": serializer.data}, status=201)
        return Response(serializer.errors, status=400)
        
    
    
class VehicleDetailView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            vehicle = Vehicle.objects.all()
            serializer = VehicleSerializer(vehicle, many=True)
            return Response(serializer.data, status=200)
            
        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=404)
        
class VehicleAssignView(APIView):
    def patch(self, request, pk):
        print(request)
        try:
            vehicle = Vehicle.objects.get(pk=pk)
            serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Vehicle assigned successfully!", "vehicle": serializer.data}, status=200)
            return Response(serializer.errors, status=400)
        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=404)

class VehicleLocationUpdateView(APIView):
    def patch(self, request):
        try:
            vehicle = Vehicle.objects.get(assigned_to=request.user)
            serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Vehicle location updated successfully!", "vehicle": serializer.data}, status=200)
            return Response(serializer.errors, status=400)
        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=404)