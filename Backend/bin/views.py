from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BinSerializer
from .models import Bin
from rest_framework.permissions import IsAuthenticated
import math
# Create your views here.


class BinListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def haversine(self, lat1, lon1, lat2, lon2):
        R = 6371 
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c 
    
    def get(self, request):
        if request.user.user_type == 'admin':
            bins = Bin.objects.all()
            serializer = BinSerializer(bins, many=True)
            return Response(serializer.data)
        
        elif request.user.user_type == 'citizen':
            try:
                user_lat = float(request.query_params['latitude'])
                user_lng = float(request.query_params['longitude'])
                print(user_lat, user_lng)
            except (TypeError, ValueError):
                return Response({'error': 'Invalid or missing latitude/longitude'}, status=400)

            bins = Bin.objects.all()
            distances = []
            for bin in bins:
                distance = self.haversine(user_lat, user_lng, bin.latitude, bin.longitude)
                distances.append((bin, distance))
            
            distances.sort(key=lambda x: x[1])
            closest_bins = [bin for bin, _ in distances[:5]] 
            
            serializer = BinSerializer(closest_bins, many=True)
            return Response(serializer.data)
class AddNewBinView(APIView):
    permission_class = [IsAuthenticated]
    def post(self, request):
        try:
            serializer = BinSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                print(serializer.data)
                return Response(serializer.data, status=201)
            return Response({'error': serializer.errors}, status=400)
        except Exception as e:
            print(str(e))
            return Response({
                'error' : str(e),
            },status = 400)
class UpdateBinDetails(APIView):
    def patch(self, request, pk):
        try:
            binObj = Bin.objects.get(pk=pk)
        except Bin.DoesNotExist:
            return Response(status=404)
        serializer = BinSerializer(binObj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class DeleteBin(APIView):
    def delete(self, request, pk):
        try:
            delete_bin = Bin.objects.filter(id=pk)
            
            if not delete_bin.exists():  # Check if the bin exists before trying to delete
                return Response({'error': 'Bin not found'}, status=404)

            delete_bin.delete()
            return Response( status=204)
        except Exception as e:
            return Response({'error': str(e)}, status=400)