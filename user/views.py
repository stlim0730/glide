from django.shortcuts import render, redirect
from django.http import HttpResponse
from urllib.request import urlopen
from urllib.parse import urlencode, parse_qs
import json


def login(request, repoProvider):
  if repoProvider=='github':
    clientId = '1bcffc14a7141019248d'
    redirectUrl = 'http://localhost:8888/user/logging_in/' + repoProvider
    scope = 'user,repo'
    githubUrl = 'https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}'.format(clientId, redirectUrl, scope)
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
    clientId = '1bcffc14a7141019248d'
    clientSecret = 'b4398ac47191a0ccaee15117080b0c82709d46ae'
    code = request.GET.get('code', '')
    redirectUri = 'http://localhost:8888/user/logging_in/' + repoProvider
    data = [
      ('client_id', clientId),
      ('client_secret', clientSecret),
      ('redirect_uri', redirectUri),
      ('code', code)
    ]
    githubUrl = 'https://github.com/login/oauth/access_token'
    data = urlencode(data).encode('utf-8')
    with urlopen(githubUrl, data) as githubAuthRes:
      res = parse_qs(githubAuthRes.read().decode('utf-8'))
      accessToken = res['access_token'][0]
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
          return HttpResponse(username)
          # return HttpResponse(json.dumps(githubUser), content_type='application/json') # For Python object
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
