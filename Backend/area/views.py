from django.shortcuts import render
from .serializers  import AreaSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AreaModel

# Create your views here.

class AreaView(APIView):
    def get(self, request):
        areas = AreaModel.objects.all()
        serializer = AreaSerializer(areas, many=True)
        return Response(serializer.data)

class AreaCreate(APIView):
    def post(self, request):
        serializer = AreaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)