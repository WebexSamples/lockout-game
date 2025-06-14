// src/components/HostControls.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import { useLobbyContext } from '../context/useLobbyContext';
import { TEAMS } from '../constants';

/**
 * Game start controls and status.
 * Visible to all players but interactive only for the host.
 * Displays in a compact format at the bottom of the lobby.
 */
const HostControls = () => {
  const { lobby, isUserHost, startGame, forceStartGame } = useLobbyContext();

  // Local state for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [warningMessages, setWarningMessages] = useState([]);

  // Check if user is the host
  const userIsHost = isUserHost();

  // Get participants by team
  const participants = lobby?.participants || [];
  const team1Players = participants.filter((p) => p.team === TEAMS.TEAM1);
  const team2Players = participants.filter((p) => p.team === TEAMS.TEAM2);

  // Calculate state of game start criteria
  const team1HasEnoughPlayers = team1Players.length >= 2;
  const team2HasEnoughPlayers = team2Players.length >= 2;
  const team1HasLead = team1Players.some((p) => p.is_team_lead);
  const team2HasLead = team2Players.some((p) => p.is_team_lead);
  const allPlayersReady =
    participants.length > 0 && participants.every((p) => p.ready);

  // All criteria are ideal
  const allCriteriaMet =
    team1HasEnoughPlayers &&
    team2HasEnoughPlayers &&
    team1HasLead &&
    team2HasLead &&
    allPlayersReady;

  // Handler for the regular start button
  const handleStartClick = () => {
    // If all criteria are met, start immediately
    if (allCriteriaMet) {
      startGame();
      return;
    }

    // Otherwise gather warnings to show in the confirmation dialog
    const warnings = [];

    if (!team1HasEnoughPlayers) {
      warnings.push('Team 1 has fewer than 2 players');
    }

    if (!team2HasEnoughPlayers) {
      warnings.push('Team 2 has fewer than 2 players');
    }

    if (!team1HasLead) {
      warnings.push("Team 1 doesn't have a Hacker");
    }

    if (!team2HasLead) {
      warnings.push("Team 2 doesn't have a Hacker");
    }

    if (team1Players.length !== team2Players.length) {
      warnings.push(
        `Teams are unbalanced (${team1Players.length} vs ${team2Players.length})`,
      );
    }

    if (!allPlayersReady) {
      warnings.push('Not all players are ready');
    }

    // Open confirmation dialog with warnings
    setWarningMessages(warnings);
    setConfirmDialogOpen(true);
  };

  // Handler for confirming force start
  const handleForceStart = () => {
    setConfirmDialogOpen(false);
    forceStartGame();
  };

  return (
    <Card
      sx={{
        mt: 2,
        border: '1px solid',
        borderColor: 'primary.main',
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="subtitle1" component="span">
              Security Controls
            </Typography>
          </Grid>

          <Grid item xs>
            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <Tooltip
                  title="Each team should have at least 2 players to ensure a balanced and engaging game. This is recommended but not required."
                  arrow
                >
                  <Chip
                    icon={
                      team1HasEnoughPlayers ? (
                        <CheckCircleIcon />
                      ) : (
                        <ErrorIcon />
                      )
                    }
                    color={team1HasEnoughPlayers ? 'success' : 'error'}
                    size="small"
                    label="Team 1: 2+ players"
                    variant="outlined"
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title="Each team should have at least 2 players to ensure a balanced and engaging game. This is recommended but not required."
                  arrow
                >
                  <Chip
                    icon={
                      team2HasEnoughPlayers ? (
                        <CheckCircleIcon />
                      ) : (
                        <ErrorIcon />
                      )
                    }
                    color={team2HasEnoughPlayers ? 'success' : 'error'}
                    size="small"
                    label="Team 2: 2+ players"
                    variant="outlined"
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title="Each team needs a Hacker who will provide encrypted clues to their AI Agent teammates. This is required for optimal gameplay."
                  arrow
                >
                  <Chip
                    icon={team1HasLead ? <CheckCircleIcon /> : <ErrorIcon />}
                    color={team1HasLead ? 'success' : 'error'}
                    size="small"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CodeIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                        Team 1 Hacker
                      </Box>
                    }
                    variant="outlined"
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title="Each team needs a Hacker who will provide encrypted clues to their AI Agent teammates. This is required for optimal gameplay."
                  arrow
                >
                  <Chip
                    icon={team2HasLead ? <CheckCircleIcon /> : <ErrorIcon />}
                    color={team2HasLead ? 'success' : 'error'}
                    size="small"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CodeIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                        Team 2 Hacker
                      </Box>
                    }
                    variant="outlined"
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip
                  title="Players should be ready before starting the game, but the Security Admin can force start regardless."
                  arrow
                >
                  <Chip
                    icon={allPlayersReady ? <CheckCircleIcon /> : <ErrorIcon />}
                    color={allPlayersReady ? 'success' : 'warning'}
                    size="small"
                    label="All Ready"
                    variant="outlined"
                  />
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>

          {userIsHost && (
            <Grid item>
              {allCriteriaMet ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startGame}
                  size="small"
                  sx={{
                    boxShadow: '0 0 5px #00ff00',
                    '&:hover': {
                      boxShadow: '0 0 10px #00ff00',
                    },
                  }}
                >
                  Launch Operation
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleStartClick}
                  size="small"
                  sx={{
                    boxShadow: '0 0 5px #ff9800',
                    '&:hover': {
                      boxShadow: '0 0 10px #ff9800',
                    },
                  }}
                >
                  Override Protocols
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            border: '1px solid',
            borderColor: 'warning.main',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle>Override Security Protocols?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Warning: Attempting to access secure system with the following
            security vulnerabilities:
          </DialogContentText>
          <List dense>
            {warningMessages.map((warning, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ErrorIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary={warning} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleForceStart}
            variant="contained"
            color="warning"
            autoFocus
          >
            Execute Override
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default HostControls;
