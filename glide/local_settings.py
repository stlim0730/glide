"""
Local settings for development purpose
This should be at the end of settings.py to override default settings.
"""

SECRET_KEY = '#jx$!#(86=m2h7ri!y24t+hlg&_m=5((7(obgo=_hrgy!$2nl#'

DEBUG = True

CHANNEL_LAYERS = {
  'default': {
    'BACKEND': 'asgi_redis.RedisChannelLayer',
    'CONFIG': {
      'hosts': '<placeholder>',
    },
    'ROUTING': '<placeholder>',
  },
}

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': '<placeholder>',
    'USER': '<placeholder>',
    'PASSWORD': '<placeholder>',
    'PORT': '<placeholder>'
  }
}
