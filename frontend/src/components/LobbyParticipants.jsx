import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TeamTable from './TeamTable';
import { TEAMS, TEAM_LABELS } from '../constants';

const LobbyParticipants = ({ participants, currentUser, toggleReady }) => {
  const team1 = participants.filter((p) => p.team === TEAMS.TEAM1);
  const team2 = participants.filter((p) => p.team === TEAMS.TEAM2);

  return (
    <Box>
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM1]}
        participants={team1}
        currentUser={currentUser}
        toggleReady={toggleReady}
      />
      <TeamTable
        teamLabel={TEAM_LABELS[TEAMS.TEAM2]}
        participants={team2}
        currentUser={currentUser}
        toggleReady={toggleReady}
      />
    </Box>
  );
};

LobbyParticipants.propTypes = {
  participants: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  toggleReady: PropTypes.func.isRequired,
};

export default LobbyParticipants;
