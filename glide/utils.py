from django.conf import settings

def getAuthUrl(url):
  if '?' in url:
    delimeter = '&'
  else:
    delimeter = '?'
  authUrl = '{}{}client_id={}&client_secret={}'.format(
    url, delimeter, settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET
  )
  return authUrl
