from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^theme/?(?P<slug>.*)$', views.theme, name='theme'),
  url(r'^project/create$', views.createProject, name='createProject'),
  url(r'^project/get/?(?P<slug>.*)$', views.project, name='project'),
  url(r'^project/tree/(?P<slug>.+)$', views.getProjectTree, name='getProjectTree'),
]