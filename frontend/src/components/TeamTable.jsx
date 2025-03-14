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
  Button,
  Tooltip,
  Paper,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircle';
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
            {participants.map((participant) => (
              <TableRow
                key={participant.id}
                selected={isCurrentUser(participant)}
              >
                <TableCell>
                  {participant.display_name}
                  {isCurrentUser(participant) && ' (You)'}
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
                  {isCurrentUser(participant) ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={toggleReady}
                      aria-label="Ready Button"
                    >
                      Ready
                    </Button>
                  ) : participant.is_ready ? (
                    <Tooltip title="Ready">
                      <CheckIcon
                        fontSize="small"
                        color="success"
                        aria-label="Ready"
                      />
                    </Tooltip>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ✅ PropTypes
TeamTable.propTypes = {
  teamLabel: PropTypes.string.isRequired,
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      team: PropTypes.string.isRequired,
      is_ready: PropTypes.bool,
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
