from django.core.cache import cache


def add_player_to_cache(data, key, created_by=False):
    cached_data = cache.get(key) or []
    for player in cached_data:
        if player['nickname'] == data['nickname']:
            return cached_data
    data['owner'] = created_by
    data['is_ready'] = False
    cached_data.append(data)
    cache.set(key, cached_data)
    return cached_data


def remove_player_from_cache(key, nickname):
    cached_data = cache.get(key)

    if cached_data is not None:
        for player in cached_data:
            if player['nickname'] == nickname:
                cached_data.remove(player)
                cache.set(key, cached_data)
                return True
    return False


def get_players_from_cache(key):
    return cache.get(key) or []

def get_player_from_cache(key, nickname):
    cached_data = cache.get(key)

    if cached_data is not None:
        for player in cached_data:
            if player['nickname'] == nickname:
                return player
    return None
