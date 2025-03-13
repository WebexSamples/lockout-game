// src/components/LobbyContent.jsx
import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import useWebex from '../hooks/useWebex';
import { useLobbyContext } from '../context/useLobbyContext';
import LobbyDetails from './LobbyDetails';
import LobbyParticipants from './LobbyParticipants';
import LobbyActions from './LobbyActions';
import JoinLobby from './JoinLobby';

/**
 * LobbyContent is the main lobby interface.
 * It handles Webex identity sync and conditionally renders the lobby or join screen.
 */
const LobbyContent = () => {
  const { webexData } = useWebex();
  const { loading, joined, joinLobby, user, setUser } = useLobbyContext();

  // Apply Webex user to context if not set
  useEffect(() => {
    if (webexData && !user) {
      setUser({
        id: webexData.user.id,
        display_name: webexData.user.displayName || 'Guest',
      });
    }
  }, [webexData, user, setUser]);

  // Auto-join socket once user is set
  useEffect(() => {
    if (!joined && user?.id) {
      joinLobby(user);
    }
  }, [joined, user, joinLobby]);

  if (loading) {
    return <Typography textAlign="center">Loading lobby...</Typography>;
  }

  if (!joined) {
    return <JoinLobby onJoin={joinLobby} />;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>
      <LobbyDetails />
      <LobbyParticipants />
      <LobbyActions />
    </Box>
  );
};

export default LobbyContent;
