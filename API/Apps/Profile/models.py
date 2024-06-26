from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import m2m_changed
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import urllib.request
import uuid


class Stats(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_games = models.IntegerField()
    total_wins = models.IntegerField()
    total_losses = models.IntegerField()
    points = models.IntegerField()

    def __str__(self):
        return f"Total Games: {self.total_games}, Total Wins: {self.total_wins}, Total Losses: {self.total_losses}, Points: {self.points}"


class Profile(models.Model):
    ColorChoices = [
        ('white', 'White'),
        ('blue', 'Blue'),
        ('red', 'Red'),
        ('green', 'Green'),
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    nickname = models.CharField(max_length=100, unique=True, blank=False, null=False, validators=[MinLengthValidator(3)])
    stats = models.OneToOneField(Stats, on_delete=models.CASCADE, null=True)
    profile_picture = models.ImageField(upload_to='profile-pictures/', default="profile-pictures/default.png")
    is_online = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    friends = models.ManyToManyField('Profile', blank=True, related_name='profile_friends')
    bio = models.TextField(blank=True, null=True, default=None)
    mmr = models.IntegerField(default=1000)
    blocked_users = models.ManyToManyField('Profile', blank=True, related_name='users_blocked')

    def __str__(self):
        return self.nickname

    def win_games(self, opponent_mmr):
        k_factor = 32
        expected_score = 1 / (1 + 10 ** ((opponent_mmr - self.mmr) / 400))
        self.mmr += k_factor * (1 - expected_score)
        self.stats.total_games += 1
        self.stats.total_wins += 1
        self.stats.save()
        self.save()

    def lose_games(self, opponent_mmr):
        k_factor = 32
        expected_score = 1 / (1 + 10 ** ((opponent_mmr - self.mmr) / 400))
        self.mmr += k_factor * (0 - expected_score)
        self.stats.total_games += 1
        self.stats.total_losses += 1
        self.stats.save()
        self.save()

    def save_image_from_url(self, url):
        img_temp = NamedTemporaryFile()
        img_temp.write(urllib.request.urlopen(url).read())
        img_temp.flush()
        self.profile_picture.save(f"{self.pk}.jpeg", File(img_temp), save=True)


@receiver(m2m_changed, sender=Profile.friends.through)
def update_friends(sender, instance, action, **kwargs):
    if action == 'post_add':
        for friend in kwargs['pk_set']:
            friend_profile = Profile.objects.get(pk=friend)
            friend_profile.friends.add(instance)
