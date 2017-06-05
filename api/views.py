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


@api_view(['GET'])
def project(request, slug):
  projects = Project.objects.all()
  if slug:
    projects = projects.filter(slug=slug)
  serializer = ProjectSerializer(projects, many=True)
  return Response(serializer.data)


@api_view(['POST'])
def createProject(request):
  """
  Create a new instance of project.
  GETs existing repositories on GitHub to check potential name duplicates.
  POSTs a new repository on GitHub and create a project instance on Glide server.
  """
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
          # (optional) TODO: Match the model structure with repo data structure?
          theme = Theme.objects.get(slug=theme)
          project = Project.objects.create(
            owner=user,
            title=title,
            slug=slug,
            description=description,
            repoUrl=repoUrl,
            theme=theme
          )
          projects = Project.objects.all()
          serializer = ProjectSerializer(projects, many=True)
          return Response({'project': resStr, 'projects': serializer.data})
    return Response({'error': 'The project title is being used. Try with a different title.'})


def _getLatestCommit(accessToken, repoUsername, projectSlug):
  commitsUrl = 'https://api.github.com/repos/{}/{}/commits?access_token={}'
  commitsUrl = commitsUrl.format(repoUsername, projectSlug, accessToken)
  with urlopen(commitsUrl) as commitsRes:
    res = commitsRes.read().decode('utf-8')
    commits = json.loads(res)
    # commits[0] is guaranteed
    #   as every Glide repo has been created with the option 'auto_init': True
    return commits[0]


def _getLatestSha(accessToken, repoUsername, projectSlug):
  latestCommit = _getLatestCommit(accessToken, repoUsername, projectSlug)
  return latestCommit['sha']


def _getRepoTree(accessToken, repoUsername, projectSlug):
  latestSha = _getLatestSha(accessToken, repoUsername, projectSlug)
  repoTreeUrl = 'https://api.github.com/repos/{}/{}/git/trees/{}?recursive=1?access_token={}'
  repoTreeUrl = repoTreeUrl.format(repoUsername, projectSlug, latestSha, accessToken)
  with urlopen(repoTreeUrl) as repoTreeRes:
    # TODO: This API request sometimes gives 409 conflicts response. # Why?
    res = repoTreeRes.read().decode('utf-8')
    repoTree = json.loads(res)
    for file in repoTree['tree']:
      file['ext'] = file['path'].split('.')[-1]
      if file['path'] == file['ext']:
        # It's a folder
        file['ext'] = None
        file['downloadUrl'] = None
      file['editor'] = ''
      if file['ext'] in ['glide', 'md', 'yml', 'yaml']:
        file['editor'] = 'data'
      elif file['ext'] in ['html', 'htm']:
        file['editor'] = 'html'
      elif file['ext'] in ['css']:
        file['editor'] = 'css'
      file['name'] = file['path'].split('/')[-1]
      downloadUrl = 'https://raw.githubusercontent.com/{}/{}/master/{}?access_token={}'
      file['downloadUrl'] = downloadUrl.format(repoUsername, projectSlug, file['path'], accessToken)
    # repoTree['tree'] = [file for file in repoTree['tree'] if file['type'] != 'tree']
    return repoTree


@api_view(['GET'])
def getProjectTree(request, slug):
  """
  Returns tree structure of a project.
  The HTTP parameter specifies the project ID (slug).
  GETs the latest commit hash value (sha) of the repository.
  GETs the tree (file structure in GitHub repo) data for the commit.
  Actual content requests and delivery will be on client side (AJAX).
  """
  username = request.session['username']
  repoUsername = username.split('@')[0]
  accessToken = request.session['accessToken']
  user = User.objects.filter(username=username)[0]
  projects = Project.objects.filter(owner__username=username)
  themes = Theme.objects.all()
  project = projects.filter(slug=slug)[0]
  theme = themes.filter(slug=project.theme.slug)[0]
  # GET the tree structure of the project repository
  repoTree = _getRepoTree(accessToken, repoUsername, project.slug)
  # GET the tree structure of the theme repository
  themeTree = _getRepoTree(accessToken, theme.author, theme.slug)
  paths = list(set([file['path'] for file in repoTree['tree'] if file['type']=='tree'] + [file['path'] for file in themeTree['tree'] if file['type']=='tree']))
  def compare(item1, item2):
    if len(item1.split('/')) < len(item2.split('/')):
      return -1
    elif len(item1.split('/')) > len(item2.split('/')):
      return 1
    else:
      return 0
  paths = sorted(paths, key=lambda x:len(x.split('/')))
  return Response({'repoTree': repoTree, 'themeTree': themeTree, 'paths':paths})
