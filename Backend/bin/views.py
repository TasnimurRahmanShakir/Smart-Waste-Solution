from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BinSerializer
from .models import Bin
from rest_framework.permissions import IsAuthenticated
# Create your views here.


class BinListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        bins = Bin.objects.all()
        serializer = BinSerializer(bins, many=True)
        return Response(serializer.data)
    
class AddNewBinView(APIView):
    permission_class = [IsAuthenticated]
    def post(self, request):
        try:
            print(request.data)
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