from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import VehicleSerializer
from .models import Vehicle

# Create your views here.
class VehicleListCreateView(APIView):
    
    permission_class = [IsAuthenticated]
    def post(self, request):
        print(request.data)
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Vehicle created successfully!", "vehicle": serializer.data}, status=201)
        return Response(serializer.errors, status=400)
        
    
class VehicleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if request.user.user_type == 'admin':
                vehicles = Vehicle.objects.all()
                serializer = VehicleSerializer(vehicles, many=True)
            elif request.user.user_type == 'collector':
                vehicle = Vehicle.objects.get(assigned_to=request.user)
                serializer = VehicleSerializer(vehicle)
            else:
                return Response({"error": "Unauthorized user type"}, status=403)

            return Response(serializer.data, status=200)

        except Vehicle.DoesNotExist:
            return Response({"error": "No vehicle found for this user"}, status=404)
        
class AvailableVehicleList(APIView):
    def get(self, request):
        vehicles = Vehicle.objects.filter(status__in=['available', 'active'], assigned_to__isnull=True)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
        
class VehicleAssignView(APIView):
    permission_class = [IsAuthenticated]
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

class VehicleUpdate(APIView):
    def patch(self, request, pk):
        try:
            vehicle = Vehicle.objects.get(id=pk)
            serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
            if serializer.is_valid():
                data = serializer.save()
                return Response({'message': 'Vehicle updated successfully', 'data': VehicleSerializer(data).data}, status=200)
            else:
                return Response({'error' : serializer.errors}, status=400)
        except Vehicle.DoesNotExist:
            return Response({'error': 'vehicle not found'}, status=404)
        
class DeleteVehicle(APIView):
    def delete(self, request, pk):
        try:
            delete_vehicle = Vehicle.objects.filter(id=pk)
            
            if not delete_vehicle.exists():
                return Response({'error': 'Bin not found'}, status=404)

            delete_vehicle.delete()
            return Response(status=204)
        except Exception as e:
            return Response({'error': str(e)}, status=400)