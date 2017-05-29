"""
Django settings for glide project.

Generated by 'django-admin startproject' using Django 1.10.6.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os
from django.contrib.messages import constants as messages

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# TODO: How to configure Django Admin password from code?

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

CSRF_USE_SESSIONS = True

SESSION_EXPIRE_AT_BROWSER_CLOSE = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
  'django.contrib.admin',
  'django.contrib.auth',
  'django.contrib.contenttypes',
  'django.contrib.sessions',
  'django.contrib.messages',
  'django.contrib.staticfiles',
  'webpack_loader',
  'workspace',
  'user',
  'channels'
]

MIDDLEWARE = [
  'django.middleware.security.SecurityMiddleware',
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.contrib.auth.middleware.AuthenticationMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'glide.urls'

WEBPACK_LOADER = {
  'DEFAULT': {
    'BUNDLE_DIR_NAME': '',
    'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json')
  }
}

TEMPLATES = [
  {
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [
      os.path.join(BASE_DIR, 'templates')
    ],
    'APP_DIRS': False,
    'OPTIONS': {
      'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
      ],
    },
  },
]

MESSAGE_TAGS = {
  messages.ERROR: 'danger'
}

WSGI_APPLICATION = 'glide.wsgi.application'

CHANNEL_LAYERS = {
  'default': {
    'BACKEND': 'asgi_redis.RedisChannelLayer',
    'CONFIG': {
      'hosts': [os.getenv('REDIS_URL')],
    },
    'ROUTING': 'glide.routing.channel_routing',
  },
}

# # TODO: Celery settings
# BROKER_URL = 'redis://localhost:6379/0'  # our redis address
# # use json format for everything
# CELERY_ACCEPT_CONTENT = ['json']
# CELERY_TASK_SERIALIZER = 'json'
# CELERY_RESULT_SERIALIZER = 'json'

# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
  'default': {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': os.getenv('DB_NAME'),
    'USER': os.getenv('DB_USER'),
    'PASSWORD': os.getenv('DB_PASSWORD'),
    'HOST': os.getenv('DB_HOST'),
    'PORT': os.getenv('DB_PORT')
  }
}

# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
  # {
  #   'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
  # },
  # {
  #   'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
  # },
  # {
  #   'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
  # },
  # {
  #   'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
  # },
]

LOGIN_URL = '/user/login/github'


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'US/Eastern'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

PROJECT_ROOT = BASE_DIR # os.path.dirname(os.path.abspath(__file__))

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'staticfiles')
STATIC_URL = '/static/'

# Extra places for collectstatic to find static files.
STATICFILES_DIRS = (
  os.path.join(PROJECT_ROOT, 'static'),
)


# OAuth credentials and info
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
OAUTH_REDIRECT_URI = os.getenv('OAUTH_REDIRECT_URI')
GITHUB_SCOPE = 'user,repo'
GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize?client_id={}&redirect_uri={}&scope={}'
GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token'


# To override local settings from default settings,
#   local_settings.py must not exist on the production server or in shared repository.
#   This should be at the end of settings.py to override default settings.
try:
  from .local_settings import *
except ImportError:
  pass
