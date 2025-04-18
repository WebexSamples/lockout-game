// src/components/Game.jsx
import React from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { useLobbyContext } from '../context/useLobbyContext';

/**
 * Game component displayed when a game is in progress.
 * Currently only has the ability to end the game and return to lobby.
 * Only the host can end the game.
 */
const Game = () => {
  const { endGame, isUserHost, lobby } = useLobbyContext();

  // Only the host can end the game
  const canEndGame = isUserHost();

  // Find the host's name for display
  const hostParticipant = lobby?.participants?.find((p) => p.is_host);
  const hostName = hostParticipant?.display_name || 'Unknown';

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Paper sx={{ p: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Game In Progress
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }} align="center">
          The Lockout game is currently in progress.
        </Typography>

        {/* Game content would go here in future updates */}

        <Box sx={{ textAlign: 'center' }}>
          {canEndGame ? (
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={endGame}
            >
              End Game & Return to Lobby
            </Button>
          ) : (
            <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
              Only the host ({hostName}) can end the game.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Game;
