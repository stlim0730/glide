from django.conf.urls import url
from . import views

urlpatterns = [
  url(r'^theme/?(?P<slug>.*)$', views.theme, name='theme'),
]
