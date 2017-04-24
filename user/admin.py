from django.contrib import admin
from .models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):
  list_display = ('repoUsername', 'repoProvider', 'repoEmail', 'isOnline')

admin.site.register(UserProfile, UserProfileAdmin)
