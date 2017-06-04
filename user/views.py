from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login as loginUser
from urllib.request import urlopen
from urllib.parse import urlencode, parse_qs
import json
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings


def login(request, repoProvider):
  """
  Redirects the user to login UIs of which a repo provider with OAuth supports.
  Currently, only GitHub is available.
  """
  if repoProvider=='github':
    clientId = settings.GITHUB_CLIENT_ID
    redirectUrl = '{}{}'.format(settings.OAUTH_REDIRECT_URI, repoProvider)
    scope = settings.GITHUB_SCOPE
    githubUrl = settings.GITHUB_AUTH_URL.format(clientId, redirectUrl, scope)
    return redirect(githubUrl)

  elif repoProvider=='bitbucket':
    pass
  elif repoProvider=='gitlab':
    pass
  else:
    # Unidentified repoProvider
    # TODO: Perhaps, render generic login page with options of provider?
    # TODO: Then, what's the difference from the landing page?
    pass


def loggingIn(request, repoProvider):
  """
  This callback function handles OAuth provider's response with access code.
    GitHub: https://developer.github.com/v3/oauth/
    BitBucket: TBD
    GitLab: TBD
  POSTs a request for access token.
    If the user accepts the app's request,
    OAuth provider redirects back to the site
    with a temporary code in a code parameter.
  GETs the user profile data.
  Creates and/or logs in the user using the user profile.
  """
  if repoProvider=='github':
    clientId = settings.GITHUB_CLIENT_ID
    clientSecret = settings.GITHUB_CLIENT_SECRET
    code = request.GET.get('code', '')
    redirectUrl = '{}{}'.format(settings.OAUTH_REDIRECT_URI, repoProvider)
    data = [
      ('client_id', clientId),
      ('client_secret', clientSecret),
      ('redirect_uri', redirectUrl),
      ('code', code)
    ]
    data = urlencode(data).encode('utf-8')
    githubUrl = settings.GITHUB_ACCESS_TOKEN_URL
    with urlopen(githubUrl, data) as githubAuthRes:
      res = parse_qs(githubAuthRes.read().decode('utf-8'))
      accessToken = res['access_token'][0]
      request.session['accessToken'] = accessToken
      if not 'error' in res:
        # If a user is authenticated
        scope = res['scope']
        # TODO: If scope granted by the user is not "user,repo",
        #   direct the user to review their access for this app
        #   https://developer.github.com/v3/oauth/#directing-users-to-review-their-access-for-an-application
        # Start local authentication using GitHub reponse with credentials.
        githubUserQuery = 'https://api.github.com/user?access_token={}'
        githubUserQuery = githubUserQuery.format(accessToken)
        with urlopen(githubUserQuery) as githubUserRes:
          githubUser = json.loads(githubUserRes.read().decode('utf-8'))
          repoUsername = githubUser['login']
          username = '{}@{}'.format(repoUsername, repoProvider)
          request.session['username'] = username
          # See if the user exists on Glide server
          exUser = User.objects.filter(username=username)
          if not exUser:
            # Welcome this newbie!
            user = User.objects.create_user(username, password=repoUsername)
            user.userprofile.repoProvider = repoProvider
            user.userprofile.repoUsername = repoUsername
            messages.success(
              request,
              'Welcome to Glide, {}!'.format(repoUsername),
              fail_silently=True
            )
          # Update the user
          else:
            user = exUser[0]
          user.userprofile.name = githubUser['name']
          user.userprofile.repoEmail = githubUser['email']
          user.userprofile.repoUrl = githubUser['html_url']
          user.userprofile.repoAvatar = githubUser['avatar_url']
          user.save()
          # Login the user
          #   As the user has been authenticated by the OAuth provider,
          #   give him a free pass.
          user = authenticate(username=username, password=repoUsername)
          loginUser(request, user)
          if exUser:
            messages.info(
              request,
              'Welcome back, {}!'.format(repoUsername),
              fail_silently=True
            )
          return redirect('/workspace')
      else:
        return redirect('/')
        # TODO: better error handling in case the user's not authenticated
        # TODO: messages.error(
        #   request,
        #   'The project title "{}" is being used. Try with a different title.'.format(slug),
        #   fail_silently=False
        # )
        # TODO: return redirect('/user/login/{}'.format(repoProvider))
  elif repoProvider=='bitbucket':
    pass
  elif repoProvider=='gitlab':
    pass


def logout(request):
  """
  TODO: Logs out the user.
  """
  pass
