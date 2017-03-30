# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-30 20:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_auto_20170330_1557'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='email',
            field=models.EmailField(default=None, max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='repoUrl',
            field=models.URLField(default=None, null=True),
        ),
    ]
