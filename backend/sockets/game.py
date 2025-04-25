# backend/sockets/game.py

from flask_socketio import emit, join_room, leave_room

from ..constants import (
    GAME_ERROR,
    GAME_UPDATE,
    GAME_SUBMIT_KEYWORD,
    GAME_SUBMIT_GUESS,
    FIELD_IS_TEAM_LEAD,
    FIELD_TEAM,
)
from ..routes.lobby import get_lobbies
from ..utils.game import (
    create_game,
    get_game,
    get_sanitized_game_state,
    submit_keyword,
    submit_guess,
    end_turn
)


def register_game_socket_handlers(socketio):
    """Registers game-specific socket events."""
    
    def send_game_update(lobby_id, game_state, participants):
        """Send game state updates to all players in the room, sanitizing as needed."""
        for participant in participants:
            user_id = participant["id"]
            sanitized_state = get_sanitized_game_state(game_state, user_id, participants)
            
            # Send personalized game state to each player
            emit(GAME_UPDATE, sanitized_state, to=f"{lobby_id}_{user_id}")
    
    @socketio.on('connect')
    def handle_connect():
        """Handle client connections"""
        pass
    
    @socketio.on('join_game')
    def handle_join_game(data):
        """Handle a player joining a game"""
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        
        if not lobby_id or not user_id:
            emit(GAME_ERROR, {"message": "Missing lobby_id or user_id"})
            return
            
        # Create a unique room for this player in this lobby
        # This allows us to send personalized game states
        player_room = f"{lobby_id}_{user_id}"
        join_room(player_room)
        join_room(lobby_id)  # Also join the lobby room for broadcast messages
        
        # Get the lobby data
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(GAME_ERROR, {"message": "Lobby not found"})
            return
            
        lobby = lobbies[lobby_id]
        
        # Get or create game state
        game_state = get_game(lobby_id)
        if not game_state:
            game_state = create_game(lobby_id)
            
        # Send the initial game state to this player
        sanitized_state = get_sanitized_game_state(game_state, user_id, lobby['participants'])
        emit(GAME_UPDATE, sanitized_state)
    
    @socketio.on('leave_game')
    def handle_leave_game(data):
        """Handle a player leaving a game"""
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        
        if not lobby_id or not user_id:
            return
            
        player_room = f"{lobby_id}_{user_id}"
        leave_room(player_room)
        # Don't leave the lobby room as they may still be in the lobby
    
    @socketio.on(GAME_SUBMIT_KEYWORD)
    def handle_submit_keyword(data):
        """Handle a team lead submitting a keyword"""
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        keyword = data.get('keyword')
        
        if not lobby_id or not user_id or not keyword:
            emit(GAME_ERROR, {"message": "Invalid keyword submission"})
            return
            
        # Get the game state
        game_state = get_game(lobby_id)
        if not game_state:
            emit(GAME_ERROR, {"message": "Game not found"})
            return
            
        # Get the lobby data
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(GAME_ERROR, {"message": "Lobby not found"})
            return
            
        lobby = lobbies[lobby_id]
        
        # Verify the user is a team lead for their team
        user_participant = next((p for p in lobby['participants'] if p['id'] == user_id), None)
        if not user_participant or not user_participant.get(FIELD_IS_TEAM_LEAD):
            emit(GAME_ERROR, {"message": "Only team leads can submit keywords"})
            return
            
        # Verify it's this team's turn
        user_team = user_participant.get(FIELD_TEAM)
        if user_team != game_state['active_team']:
            emit(GAME_ERROR, {"message": "It's not your team's turn"})
            return
        
        # Process the keyword
        result = submit_keyword(game_state, {
            "word": keyword.get('word'),
            "point_count": keyword.get('point_count'),
            "team": user_team
        })
        
        if not result:
            emit(GAME_ERROR, {"message": "Invalid keyword"})
            return
        
        # Send updated game state to all players
        send_game_update(lobby_id, game_state, lobby['participants'])
    
    @socketio.on(GAME_SUBMIT_GUESS)
    def handle_submit_guess(data):
        """Handle team members submitting card guesses"""
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        card_ids = data.get('card_ids')
        
        if not lobby_id or not user_id or not isinstance(card_ids, list):
            emit(GAME_ERROR, {"message": "Invalid guess submission"})
            return
            
        # Get the game state
        game_state = get_game(lobby_id)
        if not game_state:
            emit(GAME_ERROR, {"message": "Game not found"})
            return
            
        # Get the lobby data
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(GAME_ERROR, {"message": "Lobby not found"})
            return
            
        lobby = lobbies[lobby_id]
        
        # Verify the user is on the active team but is not a team lead
        user_participant = next((p for p in lobby['participants'] if p['id'] == user_id), None)
        if not user_participant:
            emit(GAME_ERROR, {"message": "User not found in lobby"})
            return
            
        user_team = user_participant.get(FIELD_TEAM)
        is_team_lead = user_participant.get(FIELD_IS_TEAM_LEAD, False)
        
        if user_team != game_state['active_team'] or is_team_lead:
            emit(GAME_ERROR, {"message": "Only team members on the active team can submit guesses"})
            return
        
        # Process the guess
        success, result = submit_guess(game_state, {"card_ids": card_ids})
        
        if not success:
            emit(GAME_ERROR, {"message": "Invalid guess"})
            return
        
        # Send updated game state to all players
        send_game_update(lobby_id, game_state, lobby['participants'])
        
        # If the game is over, don't process turn end
        if game_state.get("game_over", False):
            return
            
        # Wait a moment to show the results, then end the turn
        # In a real application, this would be triggered by a frontend action
        # or would use a delayed task queue
        socketio.sleep(3)  # Small delay to show results
        
        # End the turn if a penalty was triggered or after results are shown
        end_turn(game_state)
        
        # Send the updated game state again
        send_game_update(lobby_id, game_state, lobby['participants'])
    
    @socketio.on('end_turn')
    def handle_end_turn(data):
        """Manually end the current turn (useful for debugging)"""
        lobby_id = data.get('lobby_id')
        user_id = data.get('user_id')
        
        if not lobby_id or not user_id:
            emit(GAME_ERROR, {"message": "Missing lobby_id or user_id"})
            return
            
        # Get the game state
        game_state = get_game(lobby_id)
        if not game_state:
            emit(GAME_ERROR, {"message": "Game not found"})
            return
            
        # Get the lobby data
        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(GAME_ERROR, {"message": "Lobby not found"})
            return
            
        lobby = lobbies[lobby_id]
        
        # End the turn
        end_turn(game_state)
        
        # Send updated game state to all players
        send_game_update(lobby_id, game_state, lobby['participants'])