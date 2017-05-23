from django.contrib import admin
from .models import Project, Theme


class ProjectAdmin(admin.ModelAdmin):
  list_display = ('title', 'owner', 'repoUrl', 'theme', 'isPrivate', 'createdAt', 'updatedAt')

admin.site.register(Project, ProjectAdmin)


class ThemeAdmin(admin.ModelAdmin):
  list_display = ('name', 'slug', 'repoUrl')

admin.site.register(Theme, ThemeAdmin)
