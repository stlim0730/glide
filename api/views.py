from rest_framework.decorators import api_view
from rest_framework.response import Response
# from rest_framework.renderers import JSONRenderer
from .serializers import *
import json
from urllib.request import urlopen
from django.contrib.auth.models import User
from workspace.models import Project, Theme
from glide import getAuthUrl


@api_view(['GET'])
def theme(request, slug):
  """
  Responds with a list of all the themes available
    or a theme when specified
  """
  themes = Theme.objects.all()
  if slug:
    themes = themes.filter(slug=slug)
  serializer = ThemeSerializer(themes, many=True)
  return Response(serializer.data)


@api_view(['GET'])
def project(request, slug):
  """
  Responds with a project object specified
  """
  projects = Project.objects.all()
  if slug:
    projects = projects.filter(slug=slug)
  serializer = ProjectSerializer(projects, many=True)
  return Response(serializer.data)


@api_view(['GET'])
def branches(request, projectSlug):
  """
  Responds with a list of branches in the specified project
  """
  username = request.session['username']
  accessToken = request.session['accessToken']
  repoUsername = username.split('@')[0]
  getBranchesUrl = 'https://api.github.com/repos/{}/{}/branches?access_token={}'
  getBranchesUrl = getBranchesUrl.format(repoUsername, projectSlug, accessToken)
  getBranchesUrl = getAuthUrl(getBranchesUrl)
  with urlopen(getBranchesUrl) as branchesRes:
    resStr = branchesRes.read().decode('utf-8')
    branches = json.loads(resStr)
    serializer = BranchSerializer(branches, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def commits(request, projectSlug, branch):
  """
  Responds with a list of commits on the specified branch in the specified project
  """
  username = request.session['username']
  accessToken = request.session['accessToken']
  repoUsername = username.split('@')[0]
  getCommitsUrl = 'https://api.github.com/repos/{}/{}/commits?access_token={}'
  getCommitsUrl = getCommitsUrl.format(repoUsername, projectSlug, accessToken)
  getCommitsUrl = getAuthUrl(getCommitsUrl)
  with urlopen(getCommitsUrl) as commitsRes:
    resStr = commitsRes.read().decode('utf-8')
    commits = json.loads(resStr)
    serializer = CommitSerializer(commits, many=True)
    return Response(serializer.data)

def _getLatestCommit(accessToken, repoUsername, projectSlug):
  """
  Returns the latest commit object of a repository
  """
  commitsUrl = 'https://api.github.com/repos/{}/{}/commits?access_token={}'
  commitsUrl = commitsUrl.format(repoUsername, projectSlug, accessToken)
  commitsUrl = getAuthUrl(commitsUrl)
  with urlopen(commitsUrl) as commitsRes:
    res = commitsRes.read().decode('utf-8')
    commits = json.loads(res)
    # commits[0] is guaranteed
    #   as every Glide repo has been created with the option 'auto_init': True
    return commits[0]


def _getLatestSha(accessToken, repoUsername, projectSlug):
  """
  Returns the hash value of the latest commit of a repository
  """
  latestCommit = _getLatestCommit(accessToken, repoUsername, projectSlug)
  return latestCommit['sha']


def _getRepoTree(accessToken, repoUsername, projectSlug, branch='master'):
  """
  Returns the latest tree structure of a repository.
  The branch can be specified. Otherwise, it assumes master.
  """
  latestSha = _getLatestSha(accessToken, repoUsername, projectSlug)
  repoTreeUrl = 'https://api.github.com/repos/{}/{}/git/trees/{}?recursive=1?access_token={}'
  repoTreeUrl = repoTreeUrl.format(repoUsername, projectSlug, latestSha, accessToken)
  repoTreeUrl = getAuthUrl(repoTreeUrl)
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
      downloadUrl = 'https://raw.githubusercontent.com/{}/{}/{}/{}?access_token={}'
      file['downloadUrl'] = downloadUrl.format(repoUsername, projectSlug, branch, file['path'], accessToken)
    # repoTree['tree'] = [file for file in repoTree['tree'] if file['type'] != 'tree']
    return repoTree


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
  # Starting from Django 1.5,
  #   request.POST object does not contain non-form data anymore (e.g., AJAX).
  #   It is now in request.data object if using DRF.
  # Also, consider using
  #   'application/x-www-form-urlencoded'
  #   for contentType of AJAX data (on client side)
  #   rather than 'application/json; charset=utf-8',
  #   if something goes wrong.
  title = request.data['title']
  slug = request.data['slug']
  description = request.data['description']
  repoUrl = request.data['repoUrl']
  theme = request.data['theme']
  getAllReposUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
  getAllReposUrl = getAuthUrl(getAllReposUrl)
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
        createRepoUrl = getAuthUrl(createRepoUrl)
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
          # 
          # TODO: Load theme files and make a commit to start from
          # 
          themeTree = _getRepoTree(accessToken, theme.author, theme.slug)
          return Response({'project': ProjectSerializer(project, many=False).data, 'projects': ProjectSerializer(projects, many=True).data})
    # Error! The project title is being used.
    return Response({'error': 'The project title is being used. Try with a different title.'})


@api_view(['GET'])
def projectTree(request, projectSlug, branch):
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
  project = projects.filter(slug=projectSlug) # Leave it as a queryset: querysets are innately serializable as a response!
  theme = themes.filter(slug=project[0].theme.slug)[0]
  # GET the tree structure of the project repository
  repoTree = _getRepoTree(accessToken, repoUsername, project[0].slug, branch)
  # GET the tree structure of the theme repository
  themeTree = _getRepoTree(accessToken, theme.author, theme.slug)
  # Resolve path strings:
  #   Trees from GitHub have meta data on path.
  #   Build file structrue using the meta data.
  paths = list(set([file['path'] for file in repoTree['tree'] if file['type']=='tree'] + [file['path'] for file in themeTree['tree'] if file['type']=='tree']))
  # paths must have path strings in descending order: deepest first!
  paths = sorted(paths, key=lambda x:len(x.split('/')), reverse=True)
  
  def pathToDict(pathString):
    """
    Convert a sigle path string into a nested dictionary.
    """
    pathList = pathString.split('/')
    pathList.reverse()
    stack = [{}]
    for path in pathList:
      stack.append({path: stack.pop()})
    return stack[0]

  def mergeDicts(d1, d2):
    """
    Merge two nested dictionaries into one.
    """
    if d1 == {}:
      return d2
    if d2 == {}:
      return d1
    res = {}
    commonKeys = list(set(d1.keys()) & set(d2.keys()))
    for commonKey in commonKeys:
      res[commonKey] = mergeDicts(d1[commonKey], d2[commonKey])
    for key in list(d1.keys()):
      if not key in commonKeys:
        res[key] = d1[key]
    for key in list(d2.keys()):
      if not key in commonKeys:
        res[key] = d2[key]
    return res

  def traversFs(fsDict, stack, f):
    """
    Traverses fsDict to return:
    {
      "file-or-folder-name": {"content": "...", "file": {...}}
    }
    """
    for folder in list(fsDict.keys()):
      stack.append(folder)
      traversFs(fsDict[folder], stack, f)
      filesInFolder = [file for file in f if file['type'] != 'tree' and file['path'].startswith('/'.join(stack))]
      # print('{}: {}'.format('/'.join(stack), filesInFolder))
      for file in filesInFolder:
        name = file['name']
        file['content'] = None
        fsDict[folder][name] = file
        f.remove(file)
      stack.pop()

  def transformFs(fsDict, res, parentPath):
    def _isFolder(x):
      if not 'content' in x:
        return True
      else:
        return False
    res['nodes'] = []
    for key in fsDict:
      if _isFolder(fsDict[key]):
        path = '/'.join([parentPath, key])
        thisFolder = {'name': key, 'path': path, 'type': 'tree'}
        res['nodes'].append(transformFs(fsDict[key], thisFolder, path))
      else:
        fsDict[key]['nodes'] = []
        res['nodes'].append(fsDict[key])
    return res

  pathDicts = []
  fs = {}
  for path in paths:
    pathDict = pathToDict(path)
    pathDicts.append(pathDict)
  for pathDict in pathDicts:
    fs = mergeDicts(fs, pathDict)
  # Remove file name duplicates from repo and theme
  themePaths = set([file['path'] for file in themeTree['tree']])
  repoPaths = set([file['path'] for file in repoTree['tree']])
  duplicates = list(themePaths & repoPaths)
  files = [file for file in themeTree['tree'] if not file['path'] in duplicates] + repoTree['tree']
  # Fill out the file structure with files.
  traversFs(fs, [], files)
  # Add files from root
  rootFiles = [file for file in themeTree['tree'] if not file['path'] in duplicates and file['path'] == file['name'] and file['type'] != 'tree'] + [file for file in repoTree['tree'] if file['path'] == file['name'] and file['type'] != 'tree']
  for file in rootFiles:
    name = file['name']
    file['content'] = None
    fs[file['name']] = file
  # Transform fs for React-friendly form
  tree = transformFs(fs, {}, '')
  return Response({'tree': tree})


# @api_view(['POST'])
# def createBranch(request):
#   """
#   Returns tree structure of a project.
#   The HTTP parameter specifies the project ID (slug).
#   GETs the latest commit hash value (sha) of the repository.
#   GETs the tree (file structure in GitHub repo) data for the commit.
#   Actual content requests and delivery will be on client side (AJAX).
#   """
#   pass
