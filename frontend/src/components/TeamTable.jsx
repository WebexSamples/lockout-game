// frontend/src/components/TeamTable.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircle';
import NotReadyIcon from '@mui/icons-material/HighlightOff';
import TeamLeadIcon from '@mui/icons-material/WorkspacePremium';
import HostIcon from '@mui/icons-material/Star';
import PropTypes from 'prop-types';

export default function TeamTable({
  teamLabel,
  participants,
  currentUser,
  toggleReady,
}) {
  const isCurrentUser = (participant) => participant.id === currentUser?.id;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        {teamLabel}
      </Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="center">Roles</TableCell>
              <TableCell align="center">Ready</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => {
              const isSelf = isCurrentUser(participant);
              const isReady = participant.ready;

              return (
                <TableRow key={participant.id} selected={isSelf}>
                  <TableCell>
                    {participant.display_name}
                    {isSelf && ' (You)'}
                  </TableCell>

                  <TableCell align="center">
                    {participant.is_team_lead && (
                      <Tooltip title="Team Lead">
                        <TeamLeadIcon
                          fontSize="small"
                          aria-label="Team Lead"
                          sx={{ mx: 0.5 }}
                        />
                      </Tooltip>
                    )}
                    {participant.is_host && (
                      <Tooltip title="Host">
                        <HostIcon
                          fontSize="small"
                          aria-label="Host"
                          sx={{ mx: 0.5 }}
                        />
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {isSelf ? (
                      <Tooltip title={isReady ? 'Ready' : 'Not Ready'}>
                        <IconButton
                          aria-label={isReady ? 'Ready' : 'Not Ready'}
                          onClick={toggleReady}
                          size="small"
                        >
                          {isReady ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : (
                            <NotReadyIcon color="warning" fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    ) : isReady ? (
                      <Tooltip title="Ready">
                        <CheckIcon
                          fontSize="small"
                          color="success"
                          aria-label="Ready"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Not Ready">
                        <NotReadyIcon
                          fontSize="small"
                          color="disabled"
                          aria-label="Not Ready"
                        />
                      </Tooltip>
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
}

TeamTable.propTypes = {
  teamLabel: PropTypes.string.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      team: PropTypes.string.isRequired,
      ready: PropTypes.bool,
      is_team_lead: PropTypes.bool,
      is_host: PropTypes.bool,
    }),
  ).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    display_name: PropTypes.string,
  }),
  toggleReady: PropTypes.func.isRequired,
};
