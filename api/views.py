from rest_framework.decorators import api_view
from rest_framework.response import Response
# from rest_framework.renderers import JSONRenderer
from .serializers import ThemeSerializer, ProjectSerializer
import json
from urllib.request import urlopen
from django.contrib.auth.models import User
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
  username = request.session['username']
  user = User.objects.filter(username=username)[0]
  accessToken = request.session['accessToken']
  description = request.data['description']
  repoUrl = request.data['repoUrl']
  slug = request.data['slug']
  theme = request.data['theme']
  title = request.data['title']
  getAllReposUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
  with urlopen(getAllReposUrl) as allReposRes:
    resStr = allReposRes.read().decode('utf-8')
    allReposJson = json.loads(resStr)
    repoNames = [repo['name'] for repo in allReposJson]
    # Check if the repo exists on repoProvider
    if not slug in repoNames:
      # Check if the project exists on Glide server
      if not Project.objects.filter(owner=username, slug=slug):
        # You may create a new repo on repoProvider
        createRepoUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
        createRepoData = {'name': slug, 'description': description, 'auto_init': True}
        createRepoData = json.dumps(createRepoData).encode('utf-8')
        with urlopen(createRepoUrl, createRepoData) as createRepoRes:
          resStr = createRepoRes.read().decode('utf-8')
          # TODO: Match the model structure with repo data structure?
          theme = Theme.objects.get(slug=theme)
          project = Project.objects.create(
            owner=user,
            title=title,
            slug=slug,
            description=description,
            repoUrl=repoUrl,
            theme=theme
          )
          return Response({'repoRes': resStr})
    return Response({'error': 'The project title is being used. Try with a different title.'})
