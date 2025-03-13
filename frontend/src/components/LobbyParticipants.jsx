// src/components/LobbyParticipants.jsx
import React from 'react';
import { Box } from '@mui/material';
import TeamTable from './TeamTable';
import { TEAMS, TEAM_LABELS } from '../constants';
import { useLobbyContext } from '../context/useLobbyContext';

/**
 * Displays both team rosters using TeamTable components.
 */
const LobbyParticipants = () => {
  const { lobby, user, toggleReady } = useLobbyContext();

  const participants = lobby?.participants || [];

  const team1 = participants.filter((p) => p.team === TEAMS.TEAM1);
  const team2 = participants.filter((p) => p.team === TEAMS.TEAM2);

  return (
    <Box>
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM1]}
        participants={team1}
        currentUser={user}
        toggleReady={toggleReady}
      />
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM2]}
        participants={team2}
        currentUser={user}
        toggleReady={toggleReady}
      />
    </Box>
  );
};

export default LobbyParticipants;
