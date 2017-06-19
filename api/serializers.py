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

class BranchSerializer(serializers.BaseSerializer):
  def to_representation(self, obj):
    return {
      'name': obj['name'],
      'commit': {
        'sha': obj['commit']['sha'],
        'url': obj['commit']['url']
      }
    }

class CommitSerializer(serializers.BaseSerializer):
  def to_representation(self, obj):
    return {
      'url': obj['url'],
      'sha': obj['sha'],
      'html_url': obj['html_url'],
      'commit': {
        'url': obj['commit']['url'],
        'committer': {
          'name': obj['commit']['committer']['name'],
          'date': obj['commit']['committer']['date']
        },
        'message': obj['commit']['message'],
        'tree': {
          'url': obj['commit']['tree']['url'],
          'sha': obj['commit']['tree']['sha']
        }
      }
    }
