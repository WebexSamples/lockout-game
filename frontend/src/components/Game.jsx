// src/components/Game.jsx
import React from 'react';
import { useLobbyContext } from '../context/useLobbyContext';
import { GameProvider } from '../context/GameProvider';
import GameContent from './GameContent';

/**
 * GameWrapper component that sets up the GameProvider
 */
const GameWrapper = () => {
  const { endGame, lobby, user, getCurrentTeam, socket } = useLobbyContext();

  return (
    <GameProvider socket={socket} lobbyId={lobby?.id} user={user}>
      <GameContent
        endGame={endGame}
        isUserHost={lobby?.participants?.find(
          (p) => p.id === user?.id && p.is_host,
        )}
        lobby={lobby}
        user={user}
        getCurrentTeam={getCurrentTeam}
      />
    </GameProvider>
  );
};

export default GameWrapper;
