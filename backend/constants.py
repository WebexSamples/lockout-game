# backend/constants.py

# Socket event names for lobby-related actions
LOBBY_JOIN = "lobby:join"
LOBBY_LEAVE = "lobby:leave"
LOBBY_UPDATE_DISPLAY_NAME = "lobby:update_display_name"
LOBBY_TOGGLE_READY = "lobby:toggle_ready"
LOBBY_UPDATE = "lobby:update"
LOBBY_ERROR = "lobby:error"

# New socket events for extended team/host controls
LOBBY_ASSIGN_TEAM_LEAD = "lobby:assign_team_lead"
LOBBY_DEMOTE_TEAM_LEAD = "lobby:demote_team_lead"
LOBBY_START_GAME = "lobby:start_game"
LOBBY_FORCE_START = "lobby:force_start"

# Team constants
TEAM1 = "team1"
TEAM2 = "team2"

# Participant field keys
FIELD_TEAM = "team"
FIELD_IS_TEAM_LEAD = "is_team_lead"
FIELD_IS_HOST = "is_host"

# Default values
DEFAULT_TEAM = TEAM1
