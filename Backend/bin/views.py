from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BinSerializer
from .models import Bin
# Create your views here.


class BinListView(APIView):
    def get(self, request):
        bins = Bin.objects.all()
        serializer = BinSerializer(bins, many=True)
        return Response(serializer.data)
    
class AddNewBinView(APIView):
    def post(self, request):
        serializer = BinSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
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