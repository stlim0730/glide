from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.core import serializers
from django.contrib import messages
import json
from .models import Project
import urllib
from urllib.request import urlopen
from urllib.parse import urlencode#, parse_qs, parse_qsl


@login_required
def start(request):
  username = request.user.username
  projects = Project.objects.filter(owner__username=username)
  return render(request, 'workspace/start.html', context={'projects': projects})


# @login_required
# def default(request):
#   return render(request, 'workspace/default.html')


# @login_required
# def projects(request):
#   username = request.user.username
#   res = Project.objects.filter(owner__username=username)
#   return HttpResponse(serializers.serialize('json', res), content_type='application/json')


@login_required
def createproject(request):
  user = request.user
  username = request.user.username
  repoUsername = username.split('@')[0]
  accessToken = request.session['accessToken']
  # Starting from Django 1.5,
  # POST does not contain non-form data anymore (e.g., AJAX).
  # They are now in request.body.
  # Also, to decode easily,
  # AJAX data can have contentType of 'application/x-www-form-urlencoded'
  # rather than 'application/json; charset=utf-8'.
  data = json.loads(request.body.decode())
  title = data['title']
  description = data['description']
  slug = data['slug']
  repoUrl = data['repoUrl']
  gitUrl = repoUrl + '.git'
  # Check if repo with the same slug exists
  reposUrl = 'https://api.github.com/user/repos?access_token=' + accessToken
  with urlopen(reposUrl) as reposRes:
    res = reposRes.read().decode('utf-8')
    repos = json.loads(res)
    repoNames = [repo['name'] for repo in repos]
    # Check if the repo exists on repoProvider
    if not slug in repoNames:
      # Check if the slug is being used on this server
      if not Project.objects.filter(slug=slug):
        # You may safely create a new repo on repoProvider
        createRepoData = {
          'name': slug,
          'description': description,
          'auto_init': True
        }
        createRepoUrl = 'https://api.github.com/user/repos?access_token=' + accessToken
        with urlopen(createRepoUrl, json.dumps(createRepoData).encode('utf-8')) as createRepoRes:
          res = createRepoRes.read().decode('utf-8')
          project = Project.objects.create(
            owner=user,
            title=title,
            slug=slug,
            description=description,
            repoUrl=repoUrl,
            gitUrl=gitUrl
          )
          return HttpResponse(res, content_type='application/json')
    # Error! The project title is being used.
    messages.error(request, 'The project title "{}" is being used. Try with a different title.'.format(slug), fail_silently=False)
    return HttpResponse(json.dumps(None), content_type='application/json')

@login_required
def open(request, slug):
  username = request.user.username
  repoUsername = username.split('@')[0]
  projects = Project.objects.filter(owner__username=username)
  project = projects.filter(slug=slug)[0]
  accessToken = request.session['accessToken']
  commitsUrl = 'https://api.github.com/repos/{}/{}/commits?access_token={}'.format(repoUsername, project.slug, accessToken)
  with urlopen(commitsUrl) as commitsRes:
    res = commitsRes.read().decode('utf-8')
    commits = json.loads(res)
    latestCommit = commits[0]
    latestSha = latestCommit['sha']
    treeUrl = 'https://api.github.com/repos/{}/{}/git/trees/{}?recursive=1?access_token={}'.format(repoUsername, project.slug, latestSha, accessToken)
    with urlopen(treeUrl) as treeRes:
      res = treeRes.read().decode('utf-8')
      tree = json.loads(res)
      # TODO: tree has unknown limit (supposedly large enough) of the array size
      #   truncated is set true if the limit applied.
      context = {
        'project': project,
        'projects': projects,
        'tree': tree
      }
      return render(request, 'workspace/default.html', context=context)
