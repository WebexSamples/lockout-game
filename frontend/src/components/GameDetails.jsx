// src/components/GameDetails.jsx
import React from 'react';
import { Typography, Paper, Grid, Divider } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Game details component showing additional information
 */
const GameDetails = ({ gameState, lobby }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Game Details
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Lobby ID:</strong> {lobby?.id || 'Unknown'}
          </Typography>
          <Typography variant="body2">
            <strong>Host:</strong> {lobby?.participants?.find(p => p.is_host)?.display_name || 'Unknown'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">
            <strong>Started:</strong> {new Date(gameState.gameStartedAt).toLocaleTimeString()}
          </Typography>
          <Typography variant="body2">
            <strong>Players:</strong> {lobby?.participants?.length || 0}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

GameDetails.propTypes = {
  gameState: PropTypes.shape({
    gameStartedAt: PropTypes.string.isRequired
  }).isRequired,
  lobby: PropTypes.object
};

export default GameDetails;