// src/components/GameContent.jsx
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { useGameContext } from '../context/useGameContext';
import GameStatusIndicator from './GameStatusIndicator';
import GameDetails from './GameDetails';
import HackerPrompt from './HackerPrompt';
import GameBoard from './GameBoard';
import { GAME_PHASE } from '../constants';

/**
 * Game content component displayed when a game is in progress.
 * Orchestrates turn-based gameplay between teams.
 */
const GameContent = ({ endGame, isUserHost, lobby, user, getCurrentTeam }) => {
  const {
    gameState,
    notification,
    handleSubmitKeyword,
    handleCloseNotification,
  } = useGameContext();

  const gameBoardRef = useRef(null);

  // User information and role
  const userTeam = getCurrentTeam();
  const isUserTeamLead =
    lobby?.participants?.find((p) => p.id === user?.id && p.is_team_lead) !=
    null;
  const isTeamMember = userTeam && !isUserTeamLead;

  // Game state helper functions
  const isUserTurn = userTeam === gameState.activeTeam;
  const isTeamPromptPhase = gameState.gamePhase === GAME_PHASE.KEYWORD_ENTRY;
  const isTeamGuessingPhase = gameState.gamePhase === GAME_PHASE.TEAM_GUESSING;

  // Only the host can end the game
  const canEndGame = isUserHost;

  // Find the host's name for display
  const hostParticipant = lobby?.participants?.find((p) => p.is_host);
  const hostName = hostParticipant?.display_name || 'Unknown';

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Paper sx={{ p: 4, mb: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Game In Progress
        </Typography>

        {/* Game status indicator with team members */}
        <GameStatusIndicator gameState={gameState} lobby={lobby} />

        {/* Game board with word tiles */}
        <GameBoard
          ref={gameBoardRef}
          gameState={gameState}
          isUserTeamLead={isUserTeamLead}
          userTeam={userTeam}
          activeKeyword={gameState.activeKeyword}
          isUserTurn={isUserTurn && isTeamGuessingPhase && isTeamMember}
        />

        {/* Team Lead keyword input */}
        {userTeam && (
          <HackerPrompt
            gameState={gameState}
            activeTeam={userTeam}
            isTeamLead={isUserTeamLead}
            isTeamTurn={isUserTurn && isTeamPromptPhase}
            activeKeyword={
              userTeam === gameState.activeTeam ? gameState.activeKeyword : null
            }
            onSubmitKeyword={handleSubmitKeyword}
          />
        )}

        {/* Game details */}
        <GameDetails gameState={gameState} lobby={lobby} />

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          {canEndGame ? (
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={endGame}
            >
              End Game & Return to Lobby
            </Button>
          ) : (
            <Alert severity="info" sx={{ maxWidth: 400, mx: 'auto' }}>
              Only the host ({hostName}) can end the game.
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Notifications */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

// PropTypes for GameContent component
GameContent.propTypes = {
  endGame: PropTypes.func.isRequired,
  isUserHost: PropTypes.bool,
  lobby: PropTypes.shape({
    id: PropTypes.string,
    lobby_name: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        display_name: PropTypes.string.isRequired,
        is_host: PropTypes.bool,
        is_team_lead: PropTypes.bool,
        team: PropTypes.string,
      }),
    ),
    game_in_progress: PropTypes.bool,
  }),
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    display_name: PropTypes.string.isRequired,
    team: PropTypes.string,
    is_team_lead: PropTypes.bool,
  }),
  getCurrentTeam: PropTypes.func.isRequired,
};

// Default props
GameContent.defaultProps = {
  isUserHost: false,
  lobby: null,
  user: null,
};

export default GameContent;
