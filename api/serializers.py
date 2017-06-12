from rest_framework import serializers
from workspace.models import Theme, Project

class ThemeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Theme
    fields = ('name', 'slug', 'author', 'repoUrl')

class ProjectSerializer(serializers.ModelSerializer):
  class Meta:
    model = Project
    fields = (
      'owner', 'contributors', 'title', 'slug',
      'description', 'repoUrl', 'isPrivate',
      'createdAt', 'updatedAt', 'theme'
    )
