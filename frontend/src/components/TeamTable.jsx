// src/components/TeamTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';

/**
 * Renders a participant list table for a given team.
 *
 * @param {Object} props
 * @param {string} teamLabel - Label to display for the team
 * @param {Array} participants - List of participants on the team
 * @param {Object} currentUser - The current user object
 * @param {Function} toggleReady - Handler to toggle user's ready state
 */
const TeamTable = ({ teamLabel, participants, currentUser, toggleReady }) => {
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.is_team_lead && !b.is_team_lead) return -1;
    if (!a.is_team_lead && b.is_team_lead) return 1;
    return a.display_name.localeCompare(b.display_name);
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {teamLabel}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Display Name</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Ready</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedParticipants.map((p) => {
              const isCurrent = p.id === currentUser?.id;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <Typography fontWeight={isCurrent ? 'bold' : 'normal'}>
                      {p.display_name}{' '}
                      {p.is_host && <span title="Host">🏆</span>}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {p.is_team_lead ? 'Team Lead 🏅' : 'Member'}
                  </TableCell>
                  <TableCell align="center">
                    {p.ready ? '✅ Ready' : '❌ Not Ready'}
                  </TableCell>
                  <TableCell align="right">
                    {isCurrent && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={toggleReady}
                      >
                        {p.ready ? 'Unready' : 'Ready'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

TeamTable.propTypes = {
  teamLabel: PropTypes.string.isRequired,
  participants: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  toggleReady: PropTypes.func.isRequired,
};

export default TeamTable;
