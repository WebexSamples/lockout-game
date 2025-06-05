// src/context/GameProvider.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { GameContext } from './GameContext';
import { TEAMS, GAME_PHASE, SOCKET_EVENTS } from '../constants';

/**
 * GameProvider manages game state and provides it via context.
 */
export const GameProvider = ({ children, socket, lobbyId, user }) => {
  const [gameState, setGameState] = useState({
    activeTeam: TEAMS.TEAM1,
    gamePhase: GAME_PHASE.KEYWORD_ENTRY,
    activeKeyword: null,
    board: [],
    teamData: {
      [TEAMS.TEAM1]: { remainingCards: 0 },
      [TEAMS.TEAM2]: { remainingCards: 0 },
    },
    winner: null,
  });
  const [notification, setNotification] = useState(null);

  // Connect to backend socket events
  useEffect(() => {
    // Only set up listeners if socket is defined
    if (socket) {
      // Setup game update listener
      socket.on(SOCKET_EVENTS.GAME_UPDATE, (updatedGameState) => {
        console.log('Received game update:', updatedGameState);

        // Transform backend data structure to match frontend expectations
        const transformedState = {
          activeTeam: updatedGameState.active_team,
          gamePhase: updatedGameState.game_phase,
          activeKeyword: updatedGameState.active_keyword
            ? {
                word: updatedGameState.active_keyword.word,
                count: updatedGameState.active_keyword.point_count,
                team: updatedGameState.active_keyword.team,
              }
            : null,
          board: updatedGameState.board,
          teamData: {
            [TEAMS.TEAM1]: {
              remainingCards:
                updatedGameState.team_data?.[TEAMS.TEAM1]?.remaining_cards || 0,
            },
            [TEAMS.TEAM2]: {
              remainingCards:
                updatedGameState.team_data?.[TEAMS.TEAM2]?.remaining_cards || 0,
            },
          },
          gameStartedAt: updatedGameState.game_started_at,
          roundNumber: updatedGameState.round_number,
          winner: updatedGameState.winner,
        };

        setGameState(transformedState);

        // Notify the user based on the game state
        if (
          transformedState.gamePhase === GAME_PHASE.TEAM_GUESSING &&
          transformedState.activeKeyword
        ) {
          setNotification({
            message: `Team ${transformedState.activeTeam === TEAMS.TEAM1 ? '1' : '2'} Team Lead has provided the keyword: "${transformedState.activeKeyword.word}" for ${transformedState.activeKeyword.count} cards`,
            severity: 'info',
          });
        }

        // If game is over
        if (transformedState.winner) {
          setNotification({
            message: `Team ${transformedState.winner === TEAMS.TEAM1 ? '1' : '2'} has won the game!`,
            severity: 'success',
          });
        }
      });

      socket.on(SOCKET_EVENTS.GAME_ERROR, (error) => {
        console.error('Game error:', error);
        setNotification({
          message: `Error: ${error.message || 'Something went wrong'}`,
          severity: 'error',
        });
      });

      // Join game when component mounts
      if (lobbyId && user?.id) {
        console.log(`Joining game for lobby: ${lobbyId}`);
        socket.emit(SOCKET_EVENTS.GAME_JOIN, {
          lobby_id: lobbyId,
          user_id: user.id,
        });
      }

      // Cleanup listeners when component unmounts
      return () => {
        socket.off(SOCKET_EVENTS.GAME_UPDATE);
        socket.off(SOCKET_EVENTS.GAME_ERROR);

        if (lobbyId && user?.id) {
          socket.emit(SOCKET_EVENTS.GAME_LEAVE, {
            lobby_id: lobbyId,
            user_id: user.id,
          });
        }
      };
    }

    // Return empty cleanup function if socket is undefined
    return () => {};
  }, [socket, lobbyId, user?.id]);

  // Game action handlers
  const handleSubmitKeyword = useCallback(
    (keyword) => {
      console.log('Team Lead submitted keyword:', keyword);

      if (!socket) return;

      socket.emit(SOCKET_EVENTS.GAME_SUBMIT_KEYWORD, {
        lobby_id: lobbyId,
        user_id: user.id,
        keyword: {
          word: keyword.word,
          point_count: keyword.count,
        },
      });
    },
    [socket, lobbyId, user],
  );

  const handleSelectCard = useCallback(
    (cardId) => {
      if (!lobbyId || !user?.id || !socket) return;

      socket.emit(SOCKET_EVENTS.GAME_SUBMIT_GUESS, {
        lobby_id: lobbyId,
        user_id: user.id,
        card_ids: [cardId],
      });
    },
    [socket, lobbyId, user],
  );

  const handleSubmitGuess = useCallback(
    (cardIds) => {
      if (!lobbyId || !user?.id || !socket) return;
      socket.emit(SOCKET_EVENTS.GAME_SUBMIT_GUESS, {
        lobby_id: lobbyId,
        user_id: user.id,
        card_ids: cardIds,
      });
    },
    [socket, lobbyId, user],
  );

  const handleEndTurn = useCallback(() => {
    if (!lobbyId || !user?.id || !socket) return;

    socket.emit(SOCKET_EVENTS.GAME_END_TURN, {
      lobby_id: lobbyId,
      user_id: user.id,
    });
  }, [socket, lobbyId, user]);

  const handleCloseNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Context value to be provided
  const contextValue = useMemo(
    () => ({
      gameState,
      notification,
      handleSubmitKeyword,
      handleSelectCard,
      handleSubmitGuess, // <-- add to context
      handleEndTurn,
      handleCloseNotification,
    }),
    [
      gameState,
      notification,
      handleSubmitKeyword,
      handleSelectCard,
      handleSubmitGuess,
      handleEndTurn,
      handleCloseNotification,
    ],
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
  socket: PropTypes.object,
  lobbyId: PropTypes.string,
  user: PropTypes.object,
};
