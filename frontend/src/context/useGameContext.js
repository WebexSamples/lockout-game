// src/context/useGameContext.js
import { useContext } from 'react';
import { GameContext } from './GameContext';

/**
 * Hook to access GameContext.
 * Must be used inside a <GameProvider>.
 * @returns {object} Game state and actions
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
