# Generated by Django 5.0.3 on 2024-04-03 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Profile', '0018_remove_stats_points_alter_profile_nickname'),
    ]

    operations = [
        migrations.AddField(
            model_name='stats',
            name='points',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
