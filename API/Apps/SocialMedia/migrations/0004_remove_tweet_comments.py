# Generated by Django 5.0.3 on 2024-03-19 06:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('SocialMedia', '0003_remove_comment_from_user_remove_tweet_from_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tweet',
            name='comments',
        ),
    ]
