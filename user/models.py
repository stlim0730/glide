from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save


class UserProfile(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE, to_field='username')
  repoProvider = models.CharField(max_length=20)
  repoUsername = models.CharField(max_length=50)
  name = models.CharField(max_length=100, default='')
  repoEmail = models.EmailField(null=True, default=None)
  repoUrl = models.URLField(null=True, default=None)
  joinedOn = models.DateField(auto_now_add=True)
  isOnline = models.BooleanField(default=False)

  @receiver(post_save, sender=User)
  def createProfile(sender, instance, created, **kwargs):
    if not instance.is_superuser and created:
      UserProfile.objects.create(user=instance)

  @receiver(post_save, sender=User)
  def saveProfile(sender, instance, **kwargs):
    if not instance.is_superuser:
      instance.userprofile.save()
