from rest_framework.decorators import api_view
from rest_framework.response import Response
# from rest_framework.renderers import JSONRenderer
from .serializers import *
import json
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from django.contrib.auth.models import User
from workspace.models import Project, Theme
from copy import deepcopy
from glide import *


# @api_view(['GET'])
# def theme(request, slug):
#   """
#   Responds with a list of all the themes available
#     or a theme when specified
#   """
#   themes = Theme.objects.all()
#   if slug:
#     themes = themes.filter(slug=slug)
#   serializer = ThemeSerializer(themes, many=True)
#   return Response(serializer.data)


# @api_view(['GET'])
# def project(request, slug):
#   """
#   Responds with a project object specified
#   """
#   projects = Project.objects.all()
#   if slug:
#     projects = projects.filter(slug=slug)
#   serializer = ProjectSerializer(projects, many=True)
#   return Response(serializer.data)


@api_view(['GET'])
def branches(request, repositoryFullName):
  """
  Responds with a list of branches in the specified project
  """
  accessToken = request.session['accessToken']
  getBranchesUrl = 'https://api.github.com/repos/{}/branches?access_token={}'
  getBranchesUrl = getBranchesUrl.format(repositoryFullName, accessToken)
  getBranchesUrl = getAuthUrl(getBranchesUrl)
  with urlopen(getBranchesUrl) as branchesRes:
    resStr = branchesRes.read().decode('utf-8')
    return Response({ 'branches': resStr })


@api_view(['GET'])
def commits(request, owner, repo, branch):
  """
  Responds with a list of commits on the specified branch
    in the specified repository
  """
  accessToken = request.session['accessToken']
  getCommitsUrl = 'https://api.github.com/repos/{}/{}/commits?sha={}&access_token={}'
  getCommitsUrl = getCommitsUrl.format(owner, repo, branch, accessToken)
  getCommitsUrl = getAuthUrl(getCommitsUrl)
  with urlopen(getCommitsUrl) as commitsRes:
    resStr = commitsRes.read().decode('utf-8')
    return Response({ 'commits': resStr })


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


def _getRepoTree(accessToken, repoUsername, projectSlug, branch='master', commit=None):
  """
  Returns the latest tree structure of a repository.
  The branch can be specified. Otherwise, it assumes master.
  The commit SHA can be specified. Otherwise, it assumes latest commit.
  """
  sha = ''
  if not commit:
    sha = _getLatestSha(accessToken, repoUsername, projectSlug)
  else:
    sha = commit
  repoTreeUrl = 'https://api.github.com/repos/{}/{}/git/trees/{}?recursive=1?access_token={}'
  repoTreeUrl = repoTreeUrl.format(repoUsername, projectSlug, sha, accessToken)
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
        # file['downloadUrl'] = None
      file['editor'] = ''
      if file['ext'] in ['glide', 'md', 'yml', 'yaml']:
        file['editor'] = 'data'
      elif file['ext'] in ['html', 'htm']:
        file['editor'] = 'html'
      elif file['ext'] in ['css']:
        file['editor'] = 'css'
      file['name'] = file['path'].split('/')[-1]
      # TODO: Use GitHub Blobs API rather than custom string operations
      # downloadUrl = 'https://raw.githubusercontent.com/{}/{}/{}/{}?access_token={}'
      # file['downloadUrl'] = downloadUrl.format(repoUsername, projectSlug, branch, file['path'], accessToken)
    # repoTree['tree'] = [file for file in repoTree['tree'] if file['type'] != 'tree']
    return repoTree


# def _createFile(accessToken, repoUsername, projectSlug, fileObj, branch='master', message=None):
#   createFileUrl = 'https://api.github.com/repos/{}/{}/contents/{}?access_token={}'
#   # fileObj.path should be like 'foo/bar'
#   createFileUrl = createFileUrl.format(repoUsername, projectSlug, fileObj['path'], accessToken)
#   createFileUrl = getAuthUrl(createFileUrl)
#   if not message:
#     message = 'added {}'.format(fileObj['path'])
#   createFileData = {
#     'message': message,
#     'originalContent': fileObj['originalContent'].decode('utf-8'),
#     'branch': branch
#   }
#   req = Request(
#     url=createFileUrl, headers={'Content-Type': 'application/json'},
#     data=json.dumps(createFileData).encode('utf-8'), method='PUT')
#   with urlopen(req) as createFileRes:
#     resStr = createFileRes.read().decode('utf-8')
#     return json.loads(resStr)


@api_view(['POST'])
def clone(request):
  """
  Clone a project from specified GitHub url.
  GETs existing repositories on GitHub to check potential name duplicates.
  POSTs a new repository on GitHub and create a project instance on Glide server.
  """
  accessToken = request.session['accessToken']
  # Starting from Django 1.5,
  #   request.POST object does not contain non-form data anymore (e.g., AJAX).
  #   It is now in request.data object if using DRF.
  repoUrl = request.data['repoUrl']
  owner = request.data['owner']
  repo = request.data['repo']
  getRepoUrl = 'https://api.github.com/repos/{}/{}?access_token={}'.format(owner, repo, accessToken)
  getRepoUrl = getAuthUrl(getRepoUrl)
  with urlopen(getRepoUrl) as reposRes:
    resStr = reposRes.read().decode('utf-8')
    return Response({ 'repository': resStr })


@api_view(['POST'])
def branch(request):
  """
  Create a reference on GitHub repo as a new branch
  """
  accessToken = request.session['accessToken']
  newBranch = request.data['newBranch']
  branchFrom = request.data['branchFrom']
  owner = request.data['owner']
  repo = request.data['repo']
  createRefUrl = 'https://api.github.com/repos/{}/{}/git/refs?access_token={}'.format(owner, repo, accessToken)
  createRefUrl = getAuthUrl(createRefUrl)
  createRefData = {
    'ref': 'refs/heads/' + newBranch,
    'sha': branchFrom
  }
  createRefData = json.dumps(createRefData).encode('utf-8')
  with urlopen(createRefUrl, createRefData) as createRefRes:
    resStr = createRefRes.read().decode('utf-8')
    return Response({
      'createRefRes': json.loads(resStr),
      'code': createRefRes.getcode()
    })


# @api_view(['POST'])
# def createProject(request):
#   """
#   Create a new instance of project.
#   GETs existing repositories on GitHub to check potential name duplicates.
#   POSTs a new repository on GitHub and create a project instance on Glide server.
#   """
#   username = request.session['username']
#   repoUsername = username.split('@')[0]
#   user = User.objects.filter(username=username)[0]
#   accessToken = request.session['accessToken']
#   # Starting from Django 1.5,
#   #   request.POST object does not contain non-form data anymore (e.g., AJAX).
#   #   It is now in request.data object if using DRF.
#   # Also, consider using
#   #   'application/x-www-form-urlencoded'
#   #   for contentType of AJAX data (on client side)
#   #   rather than 'application/json; charset=utf-8',
#   #   if something goes wrong.
#   title = request.data['title']
#   slug = request.data['slug']
#   description = request.data['description']
#   repoUrl = request.data['repoUrl']
#   theme = request.data['theme']
#   getAllReposUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
#   getAllReposUrl = getAuthUrl(getAllReposUrl)
#   with urlopen(getAllReposUrl) as allReposRes:
#     resStr = allReposRes.read().decode('utf-8')
#     allReposJson = json.loads(resStr)
#     repoNames = [repo['name'] for repo in allReposJson]
#     # Check if the repo exists on repoProvider
#     if not slug in repoNames:
#       # Check if the project exists on Glide server
#       if not Project.objects.filter(owner=username, slug=slug):
#         # You may create a new repo on repoProvider
#         createRepoUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
#         createRepoData = {'name': slug, 'description': description, 'auto_init': True}
#         createRepoData = json.dumps(createRepoData).encode('utf-8')
#         createRepoUrl = getAuthUrl(createRepoUrl)
#         with urlopen(createRepoUrl, createRepoData) as createRepoRes:
#           resStr = createRepoRes.read().decode('utf-8')
#           # (optional) TODO: Match the model structure with repo data structure?
#           theme = Theme.objects.get(slug=theme)
#           project = Project.objects.create(
#             owner=user,
#             title=title,
#             slug=slug,
#             description=description,
#             repoUrl=repoUrl,
#             theme=theme
#           )
#           projects = Project.objects.all()
#           # 
#           # Load theme files and make a commit to start from
#           # 
#           themeTree = _getRepoTree(accessToken, theme.author, theme.slug)
#           for file in themeTree['tree']:
#             if file['type'] == 'tree' or not file['downloadUrl']:
#               continue
#             newFile = {}
#             newFile['path'] = 'theme/' + file['path']
#             with urlopen(file['downloadUrl']) as fileContentRes:
#               newFile['originalContent'] = getBase64Bytes(fileContentRes.read())#.decode('utf-8')
#               _createFile(accessToken, repoUsername, slug, newFile)
#           return Response({
#             'project': ProjectSerializer(project, many=False).data,
#             'projects': ProjectSerializer(projects, many=True).data
#           })
#     # Error! The project title is being used.
#     return Response({'error': 'The project title is being used. Try with a different title.'})


@api_view(['GET'])
def tree(request, owner, repo, branch, commit):
  """
  Returns tree structure of a project.
  The HTTP parameter specifies the project ID (slug).
  GETs the latest commit hash value (sha) of the repository.
  GETs the tree (file structure in GitHub repo) data for the commit.
  Actual content requests and delivery will be on client side (AJAX).
  """
  accessToken = request.session['accessToken']
  # GET the tree structure of the project repository
  repoTree = _getRepoTree(accessToken, owner, repo, branch, commit)
  # Set aside a raw tree
  #   for part of response to return
  tree = deepcopy(repoTree)
  # 
  # Resolve path strings:
  #   Trees from GitHub have meta data on path.
  #   Build recursive file structrue using the meta data.
  # 
  paths = list(set([file['path'] for file in repoTree['tree'] if file['type']=='tree']))
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
        file['originalContent'] = None
        file['modified'] = False
        file['added'] = False
        fsDict[folder][name] = file
        f.remove(file)
      stack.pop()

  def transformFs(fsDict, res, parentPath):
    def _isFolder(x):
      if not 'originalContent' in x:
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
  # Fill out the file structure with files.
  traversFs(fs, [], repoTree['tree'])
  # Add files from root
  rootFiles = [file for file in repoTree['tree'] if file['path'] == file['name'] and file['type'] != 'tree']
  for file in rootFiles:
    name = file['name']
    file['originalContent'] = None
    file['modified'] = False
    file['added'] = False
    fs[file['name']] = file
  # Transform fs for view-friendly form with recursive structure
  recursiveTree = transformFs(fs, {}, '')
  return Response({ 'recursiveTree': recursiveTree, 'tree': tree })


@api_view(['GET', 'POST'])
def blob(request, owner, repo, sha):
  """
  GET a blob specified and return it
  POST a blob to create it on GitHub
  """
  accessToken = request.session['accessToken']
  if request.method == 'GET':
    # Get a blob
    if sha:
      getBlobUrl = 'https://api.github.com/repos/{}/{}/git/blobs/{}?access_token={}'
      getBlobUrl = getBlobUrl.format(owner, repo, sha, accessToken)
      getBlobUrl = getAuthUrl(getBlobUrl)
      with urlopen(getBlobUrl) as blobRes:
        resStr = blobRes.read().decode('utf-8')
        return Response({ 'blob': json.loads(resStr) })
    else:
      return Response({ 'error': 'sha should be specified' })
  elif request.method == 'POST':
    # TODO: Create a blob
    content = request.data['originalContent']
    encoding = 'utf-8'
    if 'encoding' in request.data:
      encoding = request.data['encoding']
    createBlobUrl = 'https://api.github.com/repos/{}/{}/git/blobs?access_token={}'
    createBlobUrl = createBlobUrl.format(owner, repo, accessToken)
    createBlobUrl = getAuthUrl(createBlobUrl)
    createBlobData = { 'content': content, 'encoding': encoding }
    createBlobData = json.dumps(createBlobData).encode('utf-8')
    with urlopen(createBlobUrl, createBlobData) as createBlobRes:
      resStr = createBlobRes.read().decode('utf-8')
      return Response({
        'createBlobRes': json.loads(resStr),
        'code': createBlobRes.getcode()
      })
