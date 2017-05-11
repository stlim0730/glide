# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-06 11:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Theme',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.CharField(max_length=100, unique=True)),
                ('repoUrl', models.URLField(default=None, max_length=250)),
                ('gitUrl', models.CharField(default=None, max_length=250)),
            ],
        ),
    ]
