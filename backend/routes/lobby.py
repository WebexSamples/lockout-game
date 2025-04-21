# backend/routes/lobby.py

from flask import Blueprint, jsonify, request
import uuid

from ..config import Config
from ..constants import (
    DEFAULT_TEAM,
    FIELD_IS_HOST,
    FIELD_IS_TEAM_LEAD,
    FIELD_TEAM,
)

lobby_bp = Blueprint("lobby_bp", __name__)

# In-memory store for lobbies
# {
#   lobby_id: {
#     'host': str,
#     'lobby_name': str,
#     'participants': [
#       {
#         'id': str,
#         'display_name': str,
#         'ready': bool,
#         'team': str,
#         'is_team_lead': bool,
#         'is_host': bool
#       }
#     ]
#   }
# }
lobbies = {}


def get_lobbies():
    """Returns the current lobby store."""
    return lobbies


@lobby_bp.route("/lobby", methods=["POST"])
def create_lobby():
    """Creates a new lobby and assigns the host."""
    data = request.json
    host_id = data.get("host_id")
    host_name = data.get("host_display_name", "Host")
    lobby_name = data.get("lobby_name", "Default Lobby")

    if not host_id:
        return jsonify({"error": "host_id is required"}), 400

    lobby_id = str(uuid.uuid4())
    team = DEFAULT_TEAM

    participant = {
        "id": host_id,
        "display_name": host_name,
        "ready": False,
        FIELD_TEAM: team,
        FIELD_IS_TEAM_LEAD: False,
        FIELD_IS_HOST: True,
    }

    lobbies[lobby_id] = {
        "host": host_id,
        "lobby_name": lobby_name,
        "participants": [participant],
    }

    lobby_url = f"{Config.FRONTEND_URL}/game/{lobby_id}"

    return (
        jsonify(
            {
                "lobby_id": lobby_id,
                "lobby_url": lobby_url,
                "lobby_name": lobby_name,
            }
        ),
        201,
    )


@lobby_bp.route("/lobby/<lobby_id>", methods=["GET"])
def get_lobby(lobby_id):
    """Returns a lobby by ID."""
    lobby = lobbies.get(lobby_id)
    if not lobby:
        return jsonify({"error": "Lobby not found"}), 404
    return jsonify(lobby), 200
