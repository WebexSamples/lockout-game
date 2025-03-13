// src/context/useLobbyContext.js
import { useContext } from 'react';
import { LobbyContext } from './LobbyContext';

/**
 * Hook to access LobbyContext.
 * Must be used inside a <LobbyProvider>.
 * @returns {object} Lobby state and actions
 */
export const useLobbyContext = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobbyContext must be used within a LobbyProvider');
  }
  return context;
};
