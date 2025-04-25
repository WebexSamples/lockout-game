// src/components/GameStatusIndicator.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import { TEAMS, TEAM_LABELS } from '../constants';
import TeamMembers from './TeamMembers';
import { useGameContext } from '../context/useGameContext';

/**
 * Status component showing current game metrics for both teams
 */
const GameStatusIndicator = ({ lobby }) => {
  const theme = useTheme();
  const { gameState } = useGameContext();
  const isDarkMode = theme.palette.mode === 'dark';

  // Adjusted colors for better dark mode compatibility
  const team1BgColor = isDarkMode ? '#193857' : '#e3f2fd';
  const team2BgColor = isDarkMode ? '#5c1c1c' : '#ffebee';
  const team1BorderColor = '#1976d2';
  const team2BorderColor = '#d32f2f';
  const team1TextColor = isDarkMode ? '#90caf9' : 'inherit';
  const team2TextColor = isDarkMode ? '#f48fb1' : 'inherit';

  const team1RemainingCards =
    gameState.teamData[TEAMS.TEAM1]?.remainingCards || 0;
  const team2RemainingCards =
    gameState.teamData[TEAMS.TEAM2]?.remainingCards || 0;

  return (
    <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
      <Typography variant="h6" gutterBottom align="center">
        Game Status - Round {gameState.roundNumber || 1}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Box
            sx={{
              p: 2,
              bgcolor: team1BgColor,
              color: team1TextColor,
              borderRadius: 1,
              border:
                gameState.activeTeam === TEAMS.TEAM1
                  ? `2px solid ${team1BorderColor}`
                  : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {TEAM_LABELS[TEAMS.TEAM1]}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography>Remaining Cards:</Typography>
              <Chip label={team1RemainingCards} color="primary" size="small" />
            </Box>
            <Divider sx={{ width: '100%', my: 1 }} />
            <TeamMembers
              participants={lobby?.participants}
              team={TEAMS.TEAM1}
              textColor={team1TextColor}
            />
          </Box>
        </Grid>

        <Grid
          item
          xs={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">Active</Typography>
            <Typography variant="h6" color="primary">
              {gameState.activeTeam === TEAMS.TEAM1 ? '←' : '→'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={5}>
          <Box
            sx={{
              p: 2,
              bgcolor: team2BgColor,
              color: team2TextColor,
              borderRadius: 1,
              border:
                gameState.activeTeam === TEAMS.TEAM2
                  ? `2px solid ${team2BorderColor}`
                  : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {TEAM_LABELS[TEAMS.TEAM2]}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography>Remaining Cards:</Typography>
              <Chip label={team2RemainingCards} color="error" size="small" />
            </Box>
            <Divider sx={{ width: '100%', my: 1 }} />
            <TeamMembers
              participants={lobby?.participants}
              team={TEAMS.TEAM2}
              textColor={team2TextColor}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

GameStatusIndicator.propTypes = {
  lobby: PropTypes.object,
};

export default GameStatusIndicator;
