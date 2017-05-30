from django.contrib.auth.decorators import login_required
import urllib
from urllib.request import urlopen
# from urllib.parse import urlencode#, parse_qs#, parse_qsl
from django.core import serializers
import json
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Project, Theme


@login_required
def start(request):
  """
  Old version:
  Opens an empty workspace UI.
  Serves a list of existing projects that the user owns
  """
  # username = request.user.username
  # projects = Project.objects.filter(owner__username=username)
  # themes = Theme.objects.all()
  # context={'projects': projects, 'themes': themes}
  # return render(request, 'workspace/start.html', context=context)
  """
  New version:
  Serves the whole application package
  """
  return render(request, 'workspace.html', context={})


@login_required
def createproject(request):
  """
  Create a new instance of project.
  GETs existing repositories on GitHub to check potential name duplicates.
  POSTs a new repository on GitHub and create a project instance on Glide server.
  """
  user = request.user
  username = request.user.username
  repoUsername = username.split('@')[0]
  accessToken = request.session['accessToken']
  # Starting from Django 1.5,
  #   request.POST object does not contain non-form data anymore (e.g., AJAX).
  #   It is now in request.body object.
  # Also, for easier decoding,
  #   AJAX data (on client side) can have contentType of
  #   'application/x-www-form-urlencoded'
  #   rather than 'application/json; charset=utf-8'.
  data = json.loads(request.body.decode())
  title = data['title']
  description = data['description']
  slug = data['slug']
  repoUrl = data['repoUrl']
  gitUrl = '{}.git'.format(repoUrl)
  themeSlug = data['theme']
  # Check if repo with the same slug exists
  reposUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
  with urlopen(reposUrl) as reposRes:
    res = reposRes.read().decode('utf-8')
    repos = json.loads(res)
    repoNames = [repo['name'] for repo in repos]
    # Check if the repo exists on repoProvider
    if not slug in repoNames:
      # Check if the slug is being used on this server
      if not Project.objects.filter(slug=slug):
        # You may safely create a new repo on repoProvider
        createRepoUrl = 'https://api.github.com/user/repos?access_token={}'.format(accessToken)
        createRepoData = {'name': slug, 'description': description, 'auto_init': True}
        createRepoData = json.dumps(createRepoData).encode('utf-8')
        with urlopen(createRepoUrl, createRepoData) as createRepoRes:
          res = createRepoRes.read().decode('utf-8')
          # TODO: Match the model structure to repo data structure
          theme = Theme.objects.get(slug=themeSlug)
          project = Project.objects.create(
            owner=user,
            title=title,
            slug=slug,
            description=description,
            repoUrl=repoUrl,
            gitUrl=gitUrl,
            theme=theme
          )
          return HttpResponse(res, content_type='application/json')
    # Error! The project title is being used.
    messages.error(
      request,
      'The project title "{}" is being used. Try with a different title.'.format(slug),
      fail_silently=False
    )
    return HttpResponse(json.dumps(None), content_type='application/json')


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
        file['ext'] = ''
      file['editable'] = ''
      if file['ext'] in ['glide', 'md', 'yml', 'yaml']:
        file['editable'] = 'data'
      elif file['ext'] in ['html', 'htm']:
        file['editable'] = 'html'
      elif file['ext'] in ['css']:
        file['editable'] = 'css'
      file['name'] = file['path'].split('/')[-1]
      downloadUrl = 'https://raw.githubusercontent.com/{}/{}/master/{}?access_token={}'
      file['downloadUrl'] = downloadUrl.format(repoUsername, projectSlug, file['path'], accessToken)
      # else:
        # file['downloadUrl'] = None
        # file = None
    repoTree['tree'] = [file for file in repoTree['tree'] if file['type'] != 'tree']
    return repoTree
    # https://raw.githubusercontent.com/stlim0730/yyy/master/README.md


@login_required
def open(request, slug):
  """
  Opens a project instance in the Glide workspace.
  The HTTP parameter specifies the project ID (slug).
  GETs the latest commit hash value (sha) of the repository.
  GETs the tree (file structure in GitHub repo) data for the commit.
  Actual content requests and delivery will be on client side (AJAX).
  """
  username = request.user.username
  repoUsername = username.split('@')[0]
  projects = Project.objects.filter(owner__username=username)
  themes = Theme.objects.all()
  # TODO: col_projects = Project.objects.filter(contributors__username=username)
  # TODO: How to filter by ManyToMany field?
  # TODO: How to concatenate two or more QuerySets?
  project = projects.filter(slug=slug)[0]
  theme = themes.filter(slug=project.theme.slug)[0]
  accessToken = request.session.get('accessToken', None)
  # TODO: If projects has nothing or project has nothing, raise an error
  # TODO: messages.error(request, 'Couldn\'t find the project.', fail_silently=True)
  # TODO: return redirect('/workspace')
  # GET the tree structure of the project repository
  repoTree = _getRepoTree(accessToken, repoUsername, project.slug)
  # GET the tree structure of the theme repository
  themeTree = _getRepoTree(accessToken, theme.author, theme.slug)
  context = {
    'project': project, 'projects': projects,
    'theme': theme, 'themes': themes,
    'repoTree': repoTree, 'themeTree': themeTree
  }
  return render(request, 'workspace/default.html', context=context)
  