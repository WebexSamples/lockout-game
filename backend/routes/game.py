# backend/routes/game.py

from flask import Blueprint, jsonify, request

from ..utils.game import get_game, get_sanitized_game_state
from ..routes.lobby import get_lobbies

# Create a Blueprint for game routes
game_bp = Blueprint('game', __name__, url_prefix='/game')

@game_bp.route('/<lobby_id>', methods=['GET'])
def get_game_state(lobby_id):
    """
    Get the current state of a game for a specific lobby.
    
    This endpoint is useful for initially loading the game state
    or for reconnecting to an ongoing game.
    """
    # Get the user_id from query parameters
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id query parameter is required"}), 400
    
    # Get the game state
    game_state = get_game(lobby_id)
    
    if not game_state:
        return jsonify({"error": "Game not found"}), 404
    
    # Get the lobby to access participants
    lobbies = get_lobbies()
    if lobby_id not in lobbies:
        return jsonify({"error": "Associated lobby not found"}), 404
    
    lobby = lobbies[lobby_id]
    
    # Sanitize the game state based on user role
    sanitized_state = get_sanitized_game_state(game_state, user_id, lobby['participants'])
    
    # Return the sanitized game state
    return jsonify(sanitized_state)