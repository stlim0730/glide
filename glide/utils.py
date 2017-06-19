from django.conf import settings
import base64

def getAuthUrl(url):
  if '?' in url:
    delimeter = '&'
  else:
    delimeter = '?'
  authUrl = '{}{}client_id={}&client_secret={}'.format(
    url, delimeter, settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET
  )
  return authUrl

def getBase64Bytes(content):
  return base64.b64encode(content.encode('utf-8'))
