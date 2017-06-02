from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^theme', views.theme, name='theme'),
]
