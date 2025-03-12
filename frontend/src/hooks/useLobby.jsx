import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { SOCKET_EVENTS, ROUTES } from '../constants';

const socket = io(import.meta.env.VITE_SOCKET_URL);

/**
 * Custom hook to manage lobby state, user actions, and socket communication.
 *
 * @param {string} lobbyId - The unique ID of the lobby.
 * @param {Object} [initialUser] - The user object, if available.
 * @returns {Object} Lobby state and actions.
 */
const useLobby = (lobbyId, initialUser) => {
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem(`lobbyUser-${lobbyId}`));
    return savedUser || initialUser || null;
  });

  const lobbyUrl = `${window.location.origin}${ROUTES.LOBBY_WITH_ID(lobbyId)}`;

  useEffect(() => {
    if (!lobbyId) return;

    api
      .getLobby(lobbyId)
      .then((data) => {
        setLobby(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [lobbyId]);

  useEffect(() => {
    if (!joined) return;

    socket.on(SOCKET_EVENTS.LOBBY_UPDATE, (data) => {
      setLobby(data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATE);
    };
  }, [joined, lobbyId]);

  const joinLobby = (userObj) => {
    if (!userObj.id || !userObj.display_name.trim()) return;

    socket.emit(SOCKET_EVENTS.LOBBY_JOIN, { lobby_id: lobbyId, user: userObj });
    setJoined(true);
    setUser(userObj);
    localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(userObj));
  };

  const leaveLobby = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_LEAVE, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
      setJoined(false);
      localStorage.removeItem(`lobbyUser-${lobbyId}`);
    }
  };

  const toggleReady = () => {
    if (user) {
      socket.emit(SOCKET_EVENTS.LOBBY_TOGGLE_READY, {
        lobby_id: lobbyId,
        user_id: user.id,
      });
    }
  };

  const updateDisplayName = (newDisplayName) => {
    if (!newDisplayName.trim()) return;
    if (user) {
      const updatedUser = { ...user, display_name: newDisplayName };
      socket.emit(SOCKET_EVENTS.LOBBY_UPDATE_DISPLAY_NAME, {
        lobby_id: lobbyId,
        user_id: user.id,
        new_display_name: newDisplayName,
      });
      setUser(updatedUser);
      localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(updatedUser));
    }
  };

  const toggleTeam = () => {
    if (!user || !lobby) return;
    const newTeam = user.team === 'team1' ? 'team2' : 'team1';
    socket.emit(SOCKET_EVENTS.LOBBY_ASSIGN_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
      team: newTeam,
      is_team_lead: user.is_team_lead || false,
    });
  };

  const requestTeamLead = () => {
    if (!user || !lobby) return;
    socket.emit(SOCKET_EVENTS.LOBBY_ASSIGN_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
      team: user.team,
      is_team_lead: true,
    });
  };

  const demoteTeamLead = () => {
    if (!user || !lobby || !user.is_team_lead) return;
    socket.emit(SOCKET_EVENTS.LOBBY_DEMOTE_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  };

  return {
    lobby,
    lobbyUrl,
    loading,
    joined,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateDisplayName,
    user,
    toggleTeam,
    requestTeamLead,
    demoteTeamLead,
  };
};

export default useLobby;
