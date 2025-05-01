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
        try:
            serializer = AreaSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response({'error': serializer.errors}, status=400)
        except Exception as e:
                print(str(e))
                return Response({
                    'error' : str(e),
                },status = 400)
    
class DeleteArea(APIView):
    def delete(self, request, pk):
        try:
            delete_area = AreaModel.objects.filter(id=pk)
            
            if not delete_area.exists():
                return Response({'error': 'Bin not found'}, status=404)

            delete_area.delete()
            return Response( status=204)
        except Exception as e:
            return Response({'error': str(e)}, status=400)