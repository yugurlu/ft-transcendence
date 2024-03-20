# Generated by Django 5.0.3 on 2024-03-19 04:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Profile', '0002_profile_is_verified_alter_profile_nickname'),
        ('SocialMedia', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='comment',
            name='from_user',
        ),
        migrations.RemoveField(
            model_name='tweet',
            name='from_user',
        ),
        migrations.AddField(
            model_name='comment',
            name='from_user',
            field=models.ManyToManyField(blank=True, to='Profile.profile'),
        ),
        migrations.AddField(
            model_name='tweet',
            name='from_user',
            field=models.ManyToManyField(blank=True, to='Profile.profile'),
        ),
    ]
