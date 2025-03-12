# backend/sockets/lobby.py

from flask_socketio import emit, join_room, leave_room

from ..constants import (
    FIELD_IS_HOST,
    FIELD_IS_TEAM_LEAD,
    FIELD_TEAM,
    LOBBY_ASSIGN_TEAM_LEAD,
    LOBBY_DEMOTE_TEAM_LEAD,
    LOBBY_ERROR,
    LOBBY_FORCE_START,
    LOBBY_JOIN,
    LOBBY_LEAVE,
    LOBBY_START_GAME,
    LOBBY_TOGGLE_READY,
    LOBBY_UPDATE,
    LOBBY_UPDATE_DISPLAY_NAME,
    LOBBY_CHANGE_TEAM,
    TEAM1,
    TEAM2,
)
from ..routes.lobby import get_lobbies
from ..utils.helpers import auto_assign_team


def register_lobby_socket_handlers(socketio):
    """Registers lobby socket events."""

    @socketio.on(LOBBY_JOIN)
    def handle_join_lobby(data):
        lobby_id = data.get("lobby_id")
        user = data.get("user")

        if not user or not user.get("id") or not user.get("display_name"):
            emit(LOBBY_ERROR, {"message": "User id and display_name required"})
            return

        lobbies = get_lobbies()
        if lobby_id not in lobbies:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        user_id = user["id"]
        lobby = lobbies[lobby_id]
        existing_user = next(
            (p for p in lobby["participants"] if p["id"] == user_id), None
        )

        if existing_user:
            existing_user["display_name"] = user["display_name"]
        else:
            team = auto_assign_team(lobby["participants"])
            participant = {
                "id": user_id,
                "display_name": user["display_name"],
                "ready": False,
                FIELD_TEAM: team,
                FIELD_IS_TEAM_LEAD: False,
                FIELD_IS_HOST: False,
            }
            lobby["participants"].append(participant)

        join_room(lobby_id)
        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_LEAVE)
    def handle_leave_lobby(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            return

        lobby["participants"] = [p for p in lobby["participants"] if p["id"] != user_id]
        leave_room(lobby_id)
        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_UPDATE_DISPLAY_NAME)
    def handle_update_display_name(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        new_name = data.get("new_display_name")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        for p in lobby["participants"]:
            if p["id"] == user_id:
                p["display_name"] = new_name
                break

        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_TOGGLE_READY)
    def handle_toggle_ready(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        for p in lobby["participants"]:
            if p["id"] == user_id:
                p["ready"] = not p.get("ready", False)
                break

        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_ASSIGN_TEAM_LEAD)
    def handle_assign_team_lead(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        # Remove current team lead from user's team
        for p in lobby["participants"]:
            if p[FIELD_TEAM] == data.get("team") and p.get(FIELD_IS_TEAM_LEAD):
                p[FIELD_IS_TEAM_LEAD] = False

        for p in lobby["participants"]:
            if p["id"] == user_id:
                p[FIELD_IS_TEAM_LEAD] = True
                p["ready"] = False
                break

        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_DEMOTE_TEAM_LEAD)
    def handle_demote_team_lead(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        for p in lobby["participants"]:
            if p["id"] == user_id:
                p[FIELD_IS_TEAM_LEAD] = False
                p["ready"] = False
                break

        emit(LOBBY_UPDATE, lobby, room=lobby_id)

    @socketio.on(LOBBY_CHANGE_TEAM)
    def handle_change_team(data):
        lobby_id = data.get("lobby_id")
        user_id = data.get("user_id")
        new_team = data.get("new_team")
        lobby = get_lobbies().get(lobby_id)

        if not lobby:
            emit(LOBBY_ERROR, {"message": "Lobby not found"})
            return

        for p in lobby["participants"]:
            if p["id"] == user_id:
                # Demote team lead status if switching teams
                if p.get(FIELD_IS_TEAM_LEAD):
                    p[FIELD_IS_TEAM_LEAD] = False
                p[FIELD_TEAM] = new_team
                p["ready"] = False
                break

        emit(LOBBY_UPDATE, lobby, room=lobby_id)


    @socketio.on(LOBBY_START_GAME)
    def handle_start_game(data):
        lobby_id = data.get("lobby_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby or not _can_start_game(lobby):
            emit(LOBBY_ERROR, {"message": "Cannot start game"})
            return

        emit(LOBBY_START_GAME, {}, room=lobby_id)

    @socketio.on(LOBBY_FORCE_START)
    def handle_force_start_game(data):
        lobby_id = data.get("lobby_id")
        lobby = get_lobbies().get(lobby_id)

        if not lobby or not _all_ready(lobby["participants"]):
            emit(LOBBY_ERROR, {"message": "All players must be ready to force start"})
            return

        emit(LOBBY_START_GAME, {}, room=lobby_id)

    def _can_start_game(lobby):
        p = lobby["participants"]
        leads = {TEAM1: 0, TEAM2: 0}
        counts = {TEAM1: 0, TEAM2: 0}
        for x in p:
            t = x[FIELD_TEAM]
            counts[t] += 1
            if x[FIELD_IS_TEAM_LEAD]:
                leads[t] += 1
        return (
            leads[TEAM1] == 1
            and leads[TEAM2] == 1
            and counts[TEAM1] == counts[TEAM2]
            and _all_ready(p)
        )

    def _all_ready(participants):
        return all(p.get("ready") for p in participants)
