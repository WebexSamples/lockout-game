// src/components/LobbyDetails.jsx
import React from 'react';
import { Card, CardContent, Typography, Link, Button } from '@mui/material';
import useWebex from '../hooks/useWebex';
import { useLobbyContext } from '../context/useLobbyContext';

/**
 * Displays key lobby information and Webex sharing controls.
 */
const LobbyDetails = () => {
  const { isShared, isRunningInWebex, toggleShare } = useWebex();
  const { lobby, lobbyUrl } = useLobbyContext();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          {lobby?.lobby_name || 'Lobby'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Lobby ID: {lobby?.lobbyId}
        </Typography>
        <Typography variant="body2">
          Lobby URL:{' '}
          <Link href={lobbyUrl} target="_blank" rel="noopener noreferrer">
            {lobbyUrl}
          </Link>
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Lobby Sharing:</strong>{' '}
          {isShared ? 'Active ✅' : 'Inactive ❌'}
        </Typography>

        <Button
          variant="contained"
          color={isShared ? 'error' : 'primary'}
          sx={{ mt: 2 }}
          onClick={() => toggleShare(lobbyUrl)}
          disabled={!isRunningInWebex}
        >
          {isShared ? 'Deactivate Shared Lobby' : 'Activate Shared Lobby'}
        </Button>

        {!isRunningInWebex && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 1 }}
          >
            Sharing is only available inside Webex.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default LobbyDetails;
