# backend/utils/game.py
import random
import uuid
import time
from ..constants import (
    CARD_TYPE_TEAM1,
    CARD_TYPE_TEAM2,
    CARD_TYPE_PENALTY,
    CARD_TYPE_NEUTRAL,
    TEAM1_CARD_COUNT,
    TEAM2_CARD_COUNT,
    PENALTY_CARD_COUNT,
    NEUTRAL_CARD_COUNT,
    GAME_PHASE_KEYWORD_ENTRY,
    TEAM1,
    TEAM2,
    DEFAULT_POINTS_TARGET
)

# Sample word list for game cards
# This would typically be loaded from a file or database
WORD_LIST = [
    # Themed words that could work for various game skins
    "ENCRYPT", "FIREWALL", "PROTOCOL", "TERMINAL", "BINARY", "CIPHER",
    "EXPLOIT", "MALWARE", "VIRUS", "BREACH", "HACK", "SENTINEL",
    "SERVER", "PASSWORD", "DATABASE", "ROUTER", "NETWORK", "SECURITY",
    "ACCESS", "DECRYPT", "PROXY", "TROJAN", "PHISHING", "KEYLOGGER",
    "BACKDOOR", "BUFFER", "COOKIE", "DOMAIN", "WORM", "SPYWARE",
    "RANSOMWARE", "BOTNET", "BIOMETRIC", "AUTHENTICATION", "INJECTION", "TOKEN"
]

# Dictionary to store all active games
# Key: lobby_id, Value: game state dict
active_games = {}


def create_game(lobby_id):
    """Create a new game state for a lobby"""
    if lobby_id in active_games:
        return active_games[lobby_id]
    
    # Generate a new game board with randomized word cards
    board = generate_game_board()
    
    # Create initial game state
    game_state = {
        "lobby_id": lobby_id,
        "active_team": TEAM1,  # Team 1 starts first
        "round_number": 1,
        "game_phase": GAME_PHASE_KEYWORD_ENTRY,
        "team_data": {
            TEAM1: {
                "points_remaining": DEFAULT_POINTS_TARGET,
            },
            TEAM2: {
                "points_remaining": DEFAULT_POINTS_TARGET,
            }
        },
        "game_started_at": int(time.time()),
        "active_keyword": None,
        "board": board,
        "game_over": False,
        "winner": None
    }
    
    active_games[lobby_id] = game_state
    return game_state


def get_game(lobby_id):
    """Get the game state for a lobby"""
    return active_games.get(lobby_id)


def end_game(lobby_id):
    """End the game for a lobby"""
    if lobby_id in active_games:
        del active_games[lobby_id]


def generate_game_board():
    """Generate a randomized game board with the correct distribution of card types"""
    # Create cards of each type
    cards = []
    
    # Team 1 cards
    for _ in range(TEAM1_CARD_COUNT):
        cards.append({"type": CARD_TYPE_TEAM1})
    
    # Team 2 cards
    for _ in range(TEAM2_CARD_COUNT):
        cards.append({"type": CARD_TYPE_TEAM2})
    
    # Penalty card
    for _ in range(PENALTY_CARD_COUNT):
        cards.append({"type": CARD_TYPE_PENALTY})
    
    # Neutral cards
    for _ in range(NEUTRAL_CARD_COUNT):
        cards.append({"type": CARD_TYPE_NEUTRAL})
    
    # Randomly assign words to each card
    random_words = random.sample(WORD_LIST, len(cards))
    
    for i, card in enumerate(cards):
        card["id"] = i + 1
        card["word"] = random_words[i]
        card["revealed"] = False
    
    # Randomly shuffle the cards
    random.shuffle(cards)
    return cards


def get_sanitized_game_state(game_state, user_id, participants):
    """
    Return a sanitized version of the game state based on user role.
    Team leads can see unrevealed card types, regular team members cannot.
    """
    if not game_state:
        return None
        
    # Create a deep copy of the game state to avoid modifying the original
    sanitized = {
        "lobby_id": game_state["lobby_id"],
        "active_team": game_state["active_team"],
        "round_number": game_state["round_number"],
        "game_phase": game_state["game_phase"],
        "team_data": game_state["team_data"].copy(),
        "game_started_at": game_state["game_started_at"],
        "active_keyword": game_state["active_keyword"],
        "game_over": game_state["game_over"],
        "winner": game_state["winner"]
    }
    
    # Find the user's role
    user_participant = next((p for p in participants if p["id"] == user_id), None)
    is_team_lead = user_participant and user_participant.get("is_team_lead", False) if user_participant else False
    
    # Copy the board, sanitizing as needed based on user role
    sanitized_board = []
    for card in game_state["board"]:
        card_copy = card.copy()
        # If user is not a team lead and card is not revealed, remove the type
        if not is_team_lead and not card["revealed"]:
            # For team members, don't expose the card type of unrevealed cards
            card_copy = {
                "id": card["id"],
                "word": card["word"],
                "revealed": card["revealed"]
            }
        sanitized_board.append(card_copy)
    
    sanitized["board"] = sanitized_board
    return sanitized


def submit_keyword(game_state, keyword_data):
    """Process a team lead's keyword submission"""
    if not game_state or game_state["game_over"]:
        return False
    
    if game_state["game_phase"] != GAME_PHASE_KEYWORD_ENTRY:
        return False
    
    # Validate keyword data structure
    if not isinstance(keyword_data, dict) or "word" not in keyword_data or "point_count" not in keyword_data or "team" not in keyword_data:
        return False
    
    # Validate team has enough points remaining
    team = keyword_data["team"]
    count = keyword_data["point_count"]
    if team not in game_state["team_data"] or count > game_state["team_data"][team]["points_remaining"] or count <= 0:
        return False
        
    # Set active keyword
    game_state["active_keyword"] = {
        "word": keyword_data["word"],
        "point_count": count,
        "team": team
    }
    
    # Move to team guessing phase
    game_state["game_phase"] = "team_guessing"
    return True


def submit_guess(game_state, guess_data):
    """Process team members' card guesses"""
    if not game_state or game_state["game_over"]:
        return False, None
    
    if game_state["game_phase"] != "team_guessing" or not game_state["active_keyword"]:
        return False, None
    
    # Validate guess data
    if not isinstance(guess_data, dict) or "card_ids" not in guess_data or not isinstance(guess_data["card_ids"], list):
        return False, None
    
    # Get the active team
    active_team = game_state["active_team"]
    
    # Get the cards being guessed
    card_ids = guess_data["card_ids"]
    guessed_cards = []
    for card_id in card_ids:
        card = next((c for c in game_state["board"] if c["id"] == card_id and not c["revealed"]), None)
        if card:
            guessed_cards.append(card)
    
    # Validate we have the right number of cards
    if len(guessed_cards) != game_state["active_keyword"]["point_count"]:
        return False, None
    
    # Process the guesses
    result = {
        "correct_guesses": 0,
        "incorrect_guesses": 0,
        "penalty_triggered": False,
        "cards": []
    }
    
    # Mark each guessed card as revealed
    for card in guessed_cards:
        card["revealed"] = True
        result["cards"].append(card)
        
        # Check if guess was correct for the active team
        if (active_team == TEAM1 and card["type"] == CARD_TYPE_TEAM1) or \
           (active_team == TEAM2 and card["type"] == CARD_TYPE_TEAM2):
            result["correct_guesses"] += 1
        elif card["type"] == CARD_TYPE_PENALTY:
            result["penalty_triggered"] = True
        else:
            result["incorrect_guesses"] += 1
    
    # Update the team's points remaining based on correct guesses
    game_state["team_data"][active_team]["points_remaining"] -= result["correct_guesses"]
    
    # Check for win condition
    if game_state["team_data"][active_team]["points_remaining"] <= 0:
        game_state["game_over"] = True
        game_state["winner"] = active_team
    
    # Move to reveal results phase
    game_state["game_phase"] = "reveal_results"
    
    return True, result


def end_turn(game_state):
    """End the current turn and set up for the next team"""
    if not game_state or game_state["game_over"]:
        return False
    
    # Switch active team
    game_state["active_team"] = TEAM2 if game_state["active_team"] == TEAM1 else TEAM1
    
    # Clear active keyword
    game_state["active_keyword"] = None
    
    # Move to keyword entry phase
    game_state["game_phase"] = GAME_PHASE_KEYWORD_ENTRY
    
    # Increment round number if needed
    if game_state["active_team"] == TEAM1:
        game_state["round_number"] += 1
    
    return True