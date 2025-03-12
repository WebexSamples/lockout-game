# backend/utils/helpers.py

from ..constants import TEAM1, TEAM2, FIELD_TEAM

def get_team_counts(participants):
    """
    Returns a count of participants per team.
    Example output: { 'team1': 2, 'team2': 3 }
    """
    counts = {TEAM1: 0, TEAM2: 0}
    for p in participants:
        team = p.get(FIELD_TEAM)
        if team in counts:
            counts[team] += 1
    return counts

def auto_assign_team(participants):
    """
    Assigns a player to the team with fewer members.
    Defaults to TEAM1 if counts are equal.
    """
    counts = get_team_counts(participants)
    return TEAM1 if counts[TEAM1] <= counts[TEAM2] else TEAM2
