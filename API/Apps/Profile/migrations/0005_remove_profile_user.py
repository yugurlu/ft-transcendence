# Generated by Django 5.0.3 on 2024-03-17 21:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Profile', '0004_alter_profile_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='user',
        ),
    ]