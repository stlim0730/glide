from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
  owner = models.ForeignKey(User, on_delete=models.CASCADE, to_field='username')
  contributors = models.ManyToManyField(User, related_name='contributors')
  title = models.CharField(max_length=100)
  slug = models.CharField(unique=True, max_length=100)
  description = models.CharField(null=True, max_length=250)
  repoUrl = models.URLField(default=None, max_length=250)
  gitUrl = models.CharField(default=None, max_length=250)
  isPrivate = models.BooleanField(default=False)
  createdAt = models.DateField(auto_now_add=True)
  updatedAt = models.DateField(auto_now=True)

  def __str__(self):
    return self.title
