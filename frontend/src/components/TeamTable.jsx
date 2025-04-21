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
  Button,
  Stack,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircle';
import NotReadyIcon from '@mui/icons-material/HighlightOff';
import CodeIcon from '@mui/icons-material/Code';
import HostIcon from '@mui/icons-material/Security';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PropTypes from 'prop-types';
import { useLobbyContext } from '../context/useLobbyContext';

export default function TeamTable({
  teamLabel,
  participants,
  currentUser,
  toggleReady,
  isCurrentUserTeam,
}) {
  const isCurrentUser = (participant) => participant.id === currentUser?.id;
  const {
    requestTeamLead,
    demoteTeamLead,
    toggleTeam,
    isUserTeamLead,
    hasTeamLead,
  } = useLobbyContext();

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom>
          {teamLabel}
        </Typography>
        {currentUser && (
          <Stack direction="row" spacing={1}>
            {isCurrentUserTeam && !isUserTeamLead() && (
              <Tooltip
                title="The Hacker provides strategic clues to help their team extract data. As a Hacker, you'll be able to see all the board's secrets."
                arrow
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={requestTeamLead}
                  disabled={hasTeamLead(currentUser.id)}
                  startIcon={<CodeIcon />}
                  sx={{
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    },
                  }}
                >
                  Become Hacker
                </Button>
              </Tooltip>
            )}
            {isCurrentUserTeam && isUserTeamLead() && (
              <Tooltip
                title="Step down from Hacker role and become an AI Agent"
                arrow
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={demoteTeamLead}
                  startIcon={<SmartToyIcon />}
                  sx={{
                    borderColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    },
                  }}
                >
                  Become AI Agent
                </Button>
              </Tooltip>
            )}
            {!isCurrentUserTeam && (
              <Button
                variant="outlined"
                size="small"
                onClick={toggleTeam}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                  },
                }}
              >
                Switch Team
              </Button>
            )}
          </Stack>
        )}
      </Box>
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
                      <Tooltip title="Hacker - Gives strategic clues to the team">
                        <CodeIcon
                          fontSize="small"
                          aria-label="Hacker"
                          sx={{ mx: 0.5, color: 'primary.main' }}
                        />
                      </Tooltip>
                    )}
                    {!participant.is_team_lead && (
                      <Tooltip title="AI Agent - Decodes clues and extracts data">
                        <SmartToyIcon
                          fontSize="small"
                          aria-label="AI Agent"
                          sx={{ mx: 0.5, color: 'text.secondary' }}
                        />
                      </Tooltip>
                    )}
                    {participant.is_host && (
                      <Tooltip title="Security Admin - Controls the game">
                        <HostIcon
                          fontSize="small"
                          aria-label="Host"
                          sx={{
                            mx: 0.5,
                            color: participant.is_team_lead
                              ? 'primary.main'
                              : 'text.secondary',
                          }}
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
  isCurrentUserTeam: PropTypes.bool,
};
