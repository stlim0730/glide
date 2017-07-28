from django.conf.urls import url
from . import views

urlpatterns = [
  # url(r'^theme/?(?P<slug>.*)$', views.theme, name='theme'),
  url(r'^project/clone$', views.clone, name='clone'),
  url(r'^project/branch$', views.branch, name='branch'),
  # url(r'^project/create$', views.createProject, name='createProject'),
  # url(r'^project/get/(?P<slug>.*)$', views.project, name='project'),
  url(r'^project/branches/(?P<repositoryFullName>.+)$', views.branches, name='branches'),
  url(r'^project/commits/(?P<owner>.+)/(?P<repo>.+)/(?P<branch>.+)$', views.commits, name='commits'),
  url(r'^project/tree/(?P<owner>.+)/(?P<repo>.+)/(?P<branch>.+)/(?P<commit>.+)$', views.tree, name='tree'),
  url(r'^project/blob/(?P<owner>.+)/(?P<repo>.+)/(?P<sha>.{40})$', views.blob, name='blob'),
  # url(r'^project/blob/(?P<owner>.+)/(?P<repo>.+)$', views.blob, name='blob'),
]
