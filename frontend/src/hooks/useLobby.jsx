import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { SOCKET_EVENTS, ROUTES, TEAMS } from '../constants';

const socket = io(import.meta.env.VITE_SOCKET_URL);

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
    socket.on(SOCKET_EVENTS.LOBBY_UPDATE, (data) => {
      setLobby(data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATE);
    };
  }, []);

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
    const currentParticipant = lobby.participants.find((p) => p.id === user.id);
    if (!currentParticipant) return;

    const newTeam =
      currentParticipant.team === TEAMS.TEAM1 ? TEAMS.TEAM2 : TEAMS.TEAM1;
    socket.emit(SOCKET_EVENTS.LOBBY_CHANGE_TEAM, {
      lobby_id: lobbyId,
      user_id: user.id,
      new_team: newTeam,
    });
  };

  const requestTeamLead = () => {
    if (!user || !lobby || hasTeamLead(user.id)) return;
    socket.emit(SOCKET_EVENTS.LOBBY_ASSIGN_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
      team: getCurrentTeam(),
      is_team_lead: true,
    });
  };

  const hasTeamLead = (excludeUserId = null) => {
    const currentTeam = getCurrentTeam();
    if (!lobby || !currentTeam) return false;
    return lobby.participants.some(
      (p) => p.team === currentTeam && p.is_team_lead && p.id !== excludeUserId,
    );
  };

  const demoteTeamLead = () => {
    if (!user || !lobby) return;
    socket.emit(SOCKET_EVENTS.LOBBY_DEMOTE_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  };

  const getCurrentTeam = () => {
    if (!lobby || !user) return null;
    const participant = lobby.participants.find((p) => p.id === user.id);
    return participant?.team || null;
  };

  const isUserTeamLead = () => {
    if (!lobby || !user) return false;
    const participant = lobby.participants.find((p) => p.id === user.id);
    return participant?.is_team_lead || false;
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
    isUserTeamLead,
    hasTeamLead,
  };
};

export default useLobby;
