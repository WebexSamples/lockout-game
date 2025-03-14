// src/components/Lobby.jsx
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { LobbyProvider } from '../context/LobbyProvider';
import LobbyContent from './LobbyContent';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const initialUser = location.state?.user || null;

  return (
    <LobbyProvider lobbyId={lobbyId} initialUser={initialUser}>
      <LobbyContent />
    </LobbyProvider>
  );
};

export default Lobby;
