from rest_framework.decorators import api_view
from rest_framework.response import Response
# from rest_framework.renderers import JSONRenderer
from .serializers import ThemeSerializer, ProjectSerializer
from workspace.models import Project, Theme


@api_view(['GET'])
def theme(request, slug):
  themes = Theme.objects.all()
  if slug:
    themes = themes.filter(slug=slug)
  serializer = ThemeSerializer(themes, many=True)
  return Response(serializer.data)

@api_view(['POST'])
def createProject(request):
  pass
