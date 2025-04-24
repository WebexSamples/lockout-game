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
LOBBY_CHANGE_TEAM = "lobby:change_team"
LOBBY_END_GAME = "lobby:end_game"

# Game-related socket events
GAME_UPDATE = "game:update"               # Sends updated game state
GAME_SUBMIT_KEYWORD = "game:submit_keyword" # Team lead submits keyword and count
GAME_SUBMIT_GUESS = "game:submit_guess"   # Team members submit their card guesses
GAME_ERROR = "game:error"                 # Game-related errors

# Game card types
CARD_TYPE_TEAM1 = "team1_card"   # Team 1 cards
CARD_TYPE_TEAM2 = "team2_card"   # Team 2 cards
CARD_TYPE_PENALTY = "penalty"    # Penalty card
CARD_TYPE_NEUTRAL = "neutral"    # Neutral cards

# Card distribution
TEAM1_CARD_COUNT = 6    # Number of Team 1 cards
TEAM2_CARD_COUNT = 5    # Number of Team 2 cards
PENALTY_CARD_COUNT = 1  # Number of Penalty cards
NEUTRAL_CARD_COUNT = 4  # Number of Neutral cards

# Game phases
GAME_PHASE_KEYWORD_ENTRY = "keyword_entry"  # Team lead provides a keyword
GAME_PHASE_TEAM_GUESSING = "team_guessing"  # Team members make guesses
GAME_PHASE_REVEAL_RESULTS = "reveal_results"  # Results are shown
GAME_PHASE_TURN_END = "turn_end"            # Turn ends, next team's turn

# Team constants
TEAM1 = "team1"
TEAM2 = "team2"

# Participant field keys
FIELD_TEAM = "team"
FIELD_IS_TEAM_LEAD = "is_team_lead"
FIELD_IS_HOST = "is_host"

# Default values
DEFAULT_TEAM = TEAM1

# Game state default points to collect
DEFAULT_POINTS_TARGET = 5
