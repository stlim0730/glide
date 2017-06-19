from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^theme/?(?P<slug>.*)$', views.theme, name='theme'),
  url(r'^project/create$', views.createProject, name='createProject'),
  url(r'^project/get/(?P<slug>.*)$', views.project, name='project'),
  url(r'^project/branches/(?P<projectSlug>.+)$', views.branches, name='branches'),
  url(r'^project/commits/(?P<projectSlug>.+)/(?P<branch>.+)$', views.commits, name='commits'),
  url(r'^project/tree/(?P<projectSlug>.+)/(?P<branch>.+)/(?P<commit>.+)$', views.tree, name='tree'),
  # url(r'^project/branch$', views.createBranch, name='createBranch'),
]
