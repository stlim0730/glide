from django.contrib import admin
from .models import Project


class ProjectAdmin(admin.ModelAdmin):
  list_display = ('title', 'owner', 'repoUrl', 'isPrivate', 'createdAt', 'updatedAt')

admin.site.register(Project, ProjectAdmin)
