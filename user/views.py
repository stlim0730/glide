from django.shortcuts import render, redirect
from django.http import HttpResponse
from urllib.request import urlopen
from urllib.parse import urlencode

# Create your views here.
def login(request):
  clientId = '1bcffc14a7141019248d'
  redirectUrl = 'https://glidecloud.herokuapp.com/user/logging_in'
  scope = 'user,repo'
  githubUrl = 'https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}'.format(clientId, redirectUrl, scope)
  return redirect(githubUrl)

def loggingIn(request):
  '''
  If the user accepts the app's request,
  GitHub redirects back to the site
  with a temporary code in a code parameter.
  https://developer.github.com/v3/oauth/
  '''
  clientId = '1bcffc14a7141019248d'
  clientSecret = 'b4398ac47191a0ccaee15117080b0c82709d46ae'
  code = request.GET.get('code', '')
  # redirectUri = 'http://localhost:8888/user/logged_in'
  redirectUri = 'https://glidecloud.herokuapp.com/user/logged_in'
  data = [
    ('client_id', clientId),
    ('client_secret', clientSecret),
    ('redirect_uri', redirectUri),
    ('code', code)
  ]
  githubUrl = 'https://github.com/login/oauth/authorize'
  data = urlencode(data).encode('utf-8')
  with urlopen(githubUrl, data) as res:
    return HttpResponse(res.read())
