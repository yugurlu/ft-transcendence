# Generated by Django 5.0.3 on 2024-04-14 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Profile', '0019_stats_points'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='mmr',
            field=models.IntegerField(default=1000),
        ),
    ]
