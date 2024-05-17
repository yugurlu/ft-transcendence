# Generated by Django 5.0.3 on 2024-05-13 16:29

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('Profile', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tweet',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField(blank=True, default=None, max_length=250, null=True)),
                ('image', models.ImageField(blank=True, default=None, null=True, upload_to='')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('from_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Profile.profile')),
                ('liked_users', models.ManyToManyField(blank=True, related_name='tweet_liked_users', to='Profile.profile')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField(blank=True, default=None, max_length=250, null=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('from_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='Profile.profile')),
                ('liked_users', models.ManyToManyField(blank=True, related_name='comment_liked_users', to='Profile.profile')),
                ('tweet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='SocialMedia.tweet')),
            ],
        ),
    ]
