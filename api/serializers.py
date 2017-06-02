from rest_framework import serializers
from workspace.models import Theme, Project

class ThemeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Theme
    fields = ('name', 'slug', 'author', 'repoUrl', 'gitUrl')

class ProjectSerializer(serializers.ModelSerializer):
  class Meta:
    model = Project
    fields = (
      'owner', 'contributors', 'title', 'slug',
      'description', 'repoUrl', 'gitUrl', 'isPrivate',
      'createdAt', 'updatedAt', 'theme'
    )
