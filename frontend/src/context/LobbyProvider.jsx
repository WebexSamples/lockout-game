// src/context/LobbyProvider.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import api from '../utils/api';
import { SOCKET_EVENTS, ROUTES, TEAMS } from '../constants';
import { LobbyContext } from './LobbyContext';

/**
 * LobbyProvider manages lobby state and provides it via context.
 */
export const LobbyProvider = ({ lobbyId, initialUser, children }) => {
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(`lobbyUser-${lobbyId}`);
    return cached ? JSON.parse(cached) : initialUser || null;
  });

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }),
    [],
  );

  const lobbyUrl = useMemo(
    () => `${window.location.origin}${ROUTES.GAME_WITH_ID(lobbyId)}`,
    [lobbyId],
  );

  // Fetch initial lobby data
  useEffect(() => {
    if (!lobbyId) return;

    const fetchLobbyData = async () => {
      try {
        const data = await api.getLobby(lobbyId);
        setLobby(data);

        // Check if game is in progress from the lobby data
        if (data.game_in_progress) {
          console.log('Game in progress detected from lobby data');
          setGameStarted(true);
        }
      } catch (err) {
        console.error('Failed to load lobby:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyData();
  }, [lobbyId]);

  const getCurrentTeam = useCallback(() => {
    const p = lobby?.participants?.find((p) => p.id === user?.id);
    return p?.team || null;
  }, [lobby, user]);

  useEffect(() => {
    // Sync team data with user object
    if (user && lobby?.participants) {
      const participant = lobby.participants.find((p) => p.id === user.id);
      if (participant && participant.team !== user.team) {
        setUser((prevUser) => ({
          ...prevUser,
          team: participant.team,
          is_team_lead: participant.is_team_lead,
        }));
        localStorage.setItem(
          `lobbyUser-${lobbyId}`,
          JSON.stringify({
            ...user,
            team: participant.team,
            is_team_lead: participant.is_team_lead,
          }),
        );
      }
    }
  }, [lobby, user, lobbyId]);

  useEffect(() => {
    const handleUpdate = (data) => {
      setLobby(data);
    };

    const handleGameStart = () => {
      setGameStarted(true);
    };

    const handleGameEnd = () => {
      setGameStarted(false);
    };

    socket.on(SOCKET_EVENTS.LOBBY_UPDATE, handleUpdate);
    socket.on(SOCKET_EVENTS.LOBBY_START_GAME, handleGameStart);
    socket.on(SOCKET_EVENTS.LOBBY_END_GAME, handleGameEnd);

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATE, handleUpdate);
      socket.off(SOCKET_EVENTS.LOBBY_START_GAME, handleGameStart);
      socket.off(SOCKET_EVENTS.LOBBY_END_GAME, handleGameEnd);
    };
  }, [socket]);

  const joinLobby = useCallback(
    (userObj) => {
      if (!userObj?.id || !userObj.display_name?.trim()) return;
      socket.emit(SOCKET_EVENTS.LOBBY_JOIN, {
        lobby_id: lobbyId,
        user: userObj,
      });
      setJoined(true);
      setUser(userObj);
      localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(userObj));
    },
    [lobbyId, socket],
  );

  const leaveLobby = useCallback(() => {
    if (!user) return;
    socket.emit(SOCKET_EVENTS.LOBBY_LEAVE, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
    setJoined(false);
    localStorage.removeItem(`lobbyUser-${lobbyId}`);
  }, [user, lobbyId, socket]);

  const toggleReady = useCallback(() => {
    if (!user) return;
    socket.emit(SOCKET_EVENTS.LOBBY_TOGGLE_READY, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  }, [user, lobbyId, socket]);

  const updateDisplayName = useCallback(
    (newName) => {
      if (!newName.trim() || !user) return;
      const updatedUser = { ...user, display_name: newName };
      socket.emit(SOCKET_EVENTS.LOBBY_UPDATE_DISPLAY_NAME, {
        lobby_id: lobbyId,
        user_id: user.id,
        new_display_name: newName,
      });
      setUser(updatedUser);
      localStorage.setItem(`lobbyUser-${lobbyId}`, JSON.stringify(updatedUser));
    },
    [user, lobbyId, socket],
  );

  const toggleTeam = useCallback(() => {
    if (!user || !lobby) return;
    const participant = lobby.participants.find((p) => p.id === user.id);
    if (!participant) return;
    const newTeam =
      participant.team === TEAMS.TEAM1 ? TEAMS.TEAM2 : TEAMS.TEAM1;
    socket.emit(SOCKET_EVENTS.LOBBY_CHANGE_TEAM, {
      lobby_id: lobbyId,
      user_id: user.id,
      new_team: newTeam,
    });
  }, [user, lobby, lobbyId, socket]);

  const hasTeamLead = useCallback(
    (excludeUserId = null) => {
      const team = getCurrentTeam();
      return lobby?.participants?.some(
        (p) => p.team === team && p.is_team_lead && p.id !== excludeUserId,
      );
    },
    [lobby, getCurrentTeam],
  );

  const requestTeamLead = useCallback(() => {
    if (!user || !lobby || hasTeamLead(user.id)) return;
    socket.emit(SOCKET_EVENTS.LOBBY_ASSIGN_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
      team: getCurrentTeam(),
    });
  }, [user, lobby, hasTeamLead, getCurrentTeam, lobbyId, socket]);

  const demoteTeamLead = useCallback(() => {
    if (!user) return;
    socket.emit(SOCKET_EVENTS.LOBBY_DEMOTE_TEAM_LEAD, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  }, [user, lobbyId, socket]);

  const startGame = useCallback(() => {
    if (!lobbyId) return;
    socket.emit(SOCKET_EVENTS.LOBBY_START_GAME, {
      lobby_id: lobbyId,
    });
  }, [lobbyId, socket]);

  const forceStartGame = useCallback(() => {
    if (!lobbyId || !user?.id) return;
    socket.emit(SOCKET_EVENTS.LOBBY_FORCE_START, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  }, [lobbyId, socket, user]);

  const endGame = useCallback(() => {
    if (!lobbyId || !user?.id) return;
    socket.emit(SOCKET_EVENTS.LOBBY_END_GAME, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  }, [lobbyId, socket, user]);

  const isUserTeamLead = useCallback(() => {
    const p = lobby?.participants?.find((p) => p.id === user?.id);
    return p?.is_team_lead || false;
  }, [lobby, user]);

  const isUserHost = useCallback(() => {
    const p = lobby?.participants?.find((p) => p.id === user?.id);
    return p?.is_host || false;
  }, [lobby, user]);

  const contextValue = useMemo(
    () => ({
      lobby,
      lobbyUrl,
      loading,
      joined,
      gameStarted,
      joinLobby,
      leaveLobby,
      toggleReady,
      updateDisplayName,
      toggleTeam,
      requestTeamLead,
      demoteTeamLead,
      isUserTeamLead,
      isUserHost,
      hasTeamLead,
      startGame,
      forceStartGame,
      endGame,
      user,
      setUser,
      getCurrentTeam,
      socket, // Expose socket to allow components to emit events directly
    }),
    [
      lobby,
      lobbyUrl,
      loading,
      joined,
      gameStarted,
      joinLobby,
      leaveLobby,
      toggleReady,
      updateDisplayName,
      toggleTeam,
      requestTeamLead,
      demoteTeamLead,
      isUserTeamLead,
      isUserHost,
      hasTeamLead,
      startGame,
      forceStartGame,
      endGame,
      user,
      setUser,
      getCurrentTeam,
      socket,
    ],
  );

  return (
    <LobbyContext.Provider value={contextValue}>
      {children}
    </LobbyContext.Provider>
  );
};

LobbyProvider.propTypes = {
  lobbyId: PropTypes.string.isRequired,
  initialUser: PropTypes.object,
  children: PropTypes.node.isRequired,
};
