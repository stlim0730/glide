from django.conf import settings

from django.shortcuts import render, redirect
from django.http import HttpResponse
from urllib.request import urlopen
from urllib.parse import urlencode, parse_qs

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login as loginUser

from django.contrib import messages

import json


def login(request, repoProvider):
  if repoProvider=='github':
    clientId = settings.GITHUB_CLIENT_ID
    redirectUrl = settings.OAUTH_REDIRECT_URI + repoProvider
    scope = settings.GITHUB_SCOPE
    githubUrl = settings.GITHUB_AUTH_URL.format(clientId, redirectUrl, scope)
    return redirect(githubUrl)

  elif repoProvider=='bitbucket':
    pass
  elif repoProvider=='gitlab':
    pass
  else:
    # Error! unidentified repoProvider
    pass


def loggingIn(request, repoProvider):
  '''
  If the user accepts the app's request,
  GitHub redirects back to the site
  with a temporary code in a code parameter.
  https://developer.github.com/v3/oauth/
  '''
  if repoProvider=='github':
    clientId = settings.GITHUB_CLIENT_ID
    clientSecret = settings.GITHUB_CLIENT_SECRET
    code = request.GET.get('code', '')
    redirectUri = settings.OAUTH_REDIRECT_URI + repoProvider
    data = [
      ('client_id', clientId),
      ('client_secret', clientSecret),
      ('redirect_uri', redirectUri),
      ('code', code)
    ]
    githubUrl = settings.GITHUB_ACCESS_TOKEN_URL
    data = urlencode(data).encode('utf-8')
    with urlopen(githubUrl, data) as githubAuthRes:
      res = parse_qs(githubAuthRes.read().decode('utf-8'))
      accessToken = res['access_token'][0]
      request.session['accessToken'] = accessToken
      if not 'error' in res:
        # If a user is authenticated
        scope = res['scope']
        # TODO: If scope granted by the user is not user,repo
        #   direct the user to review their access for this app
        #   https://developer.github.com/v3/oauth/#directing-users-to-review-their-access-for-an-application
        # Received GitHub credentials. Start local authentication.
        githubUserQuery = 'https://api.github.com/user?access_token=' + accessToken
        with urlopen(githubUserQuery) as githubUserRes:
          githubUser = json.loads(githubUserRes.read().decode('utf-8'))
          repoUsername = githubUser['login']
          username = '{}@{}'.format(repoUsername, repoProvider)
          # See if the user exists
          exUser = User.objects.filter(username=username)
          if not exUser:
            # Welcome this newbie!
            user = User.objects.create_user(username, password=repoUsername)
            user.repoProvider=repoProvider
            user.repoUsername=repoUsername
            messages.success(request, 'Welcome to Glide, {}!'.format(repoUsername), fail_silently=True)
          # Update the user
          else:
            user = exUser[0]
          user.name = githubUser['name']
          user.repoEmail = githubUser['email']
          user.repoUrl = githubUser['html_url']
          user.repoAvatar = githubUser['avatar_url']
          user.save()
          # Login the user
          user = authenticate(username=username, password=repoUsername)
          loginUser(request, user)
          if exUser:
            messages.info(request, 'Welcome back, {}!'.format(repoUsername), fail_silently=True)
          # return HttpResponse(username)
          # return HttpResponse(json.dumps(githubUser), content_type='application/json') # For Python object
          return redirect('/workspace')
      else:
        # TODO: better error handling in case the user's not authenticated
        return redirect('/')
  elif repoProvider=='bitbucket':
    pass
  elif repoProvider=='gitlab':
    pass
  else:
    # Error! unidentified repoProvider
    pass


def loggedIn(request):
  return HttpResponse(request.GET.get('access_token', 'molla'))
