import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import TeamTable from './TeamTable';

const LobbyParticipants = ({ participants, currentUser, toggleReady }) => {
  const team1 = participants.filter((p) => p.team === 'team1');
  const team2 = participants.filter((p) => p.team === 'team2');

  return (
    <Box>
      <TeamTable
        teamLabel="Team 1 (Bluewave)"
        participants={team1}
        currentUser={currentUser}
        toggleReady={toggleReady}
      />
      <TeamTable
        teamLabel="Team 2 (Redshift)"
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
