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
  const { lobby, user, toggleReady, getCurrentTeam } = useLobbyContext();

  const participants = lobby?.participants || [];

  const team1 = participants.filter((p) => p.team === TEAMS.TEAM1);
  const team2 = participants.filter((p) => p.team === TEAMS.TEAM2);

  // Get the user's current team using the context function
  const userTeam = getCurrentTeam();

  return (
    <Box>
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM1]}
        participants={team1}
        currentUser={user}
        toggleReady={toggleReady}
        isCurrentUserTeam={userTeam === TEAMS.TEAM1}
      />
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM2]}
        participants={team2}
        currentUser={user}
        toggleReady={toggleReady}
        isCurrentUserTeam={userTeam === TEAMS.TEAM2}
      />
    </Box>
  );
};

export default LobbyParticipants;
