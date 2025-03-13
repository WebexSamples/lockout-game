// src/context/LobbyContext.js
import { createContext } from 'react';

/**
 * LobbyContext is used to share lobby state globally.
 * Defined in a separate file for React Refresh compatibility.
 */
export const LobbyContext = createContext(null);
