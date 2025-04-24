// src/components/Game.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { useLobbyContext } from '../context/useLobbyContext';
import { MOCK_GAME_STATE, GAME_PHASE } from '../utils/mockGameData';
import GameStatusIndicator from './GameStatusIndicator';
import GameDetails from './GameDetails';
import HackerPrompt from './HackerPrompt';
import GameBoard from './GameBoard';
import { TEAMS } from '../constants';

/**
 * Game component displayed when a game is in progress.
 * Orchestrates turn-based gameplay between hackers and agents.
 */
const Game = () => {
  const { endGame, isUserHost, lobby, user, getCurrentTeam, socket } = useLobbyContext();
  const [gameState, setGameState] = useState(MOCK_GAME_STATE);
  const [notification, setNotification] = useState(null);
  const gameBoardRef = useRef(null);
  
  // User information and role
  const userTeam = getCurrentTeam();
  const isUserHacker = lobby?.participants?.find(
    p => p.id === user?.id && p.is_team_lead
  ) != null;
  const isUserAgent = userTeam && !isUserHacker;
  
  // Game state helper functions
  const isUserTurn = userTeam === gameState.activeTeam;
  const isTeamPromptPhase = gameState.gamePhase === GAME_PHASE.HACKER_PROMPT;
  const isTeamGuessingPhase = gameState.gamePhase === GAME_PHASE.AGENT_GUESSING;
  
  // Only the host can end the game
  const canEndGame = isUserHost();
  
  // Find the host's name for display
  const hostParticipant = lobby?.participants?.find((p) => p.is_host);
  const hostName = hostParticipant?.display_name || 'Unknown';
  
  // Handle the hacker's prompt submission
  const handleSubmitPrompt = (prompt) => {
    // In a real implementation, this would be sent to the backend
    console.log('Hacker submitted prompt:', prompt);
    
    // Update game state with the new prompt and change phase to agent guessing
    setGameState(prev => ({
      ...prev,
      activePrompt: prompt,
      gamePhase: GAME_PHASE.AGENT_GUESSING
    }));
    
    setNotification({
      message: `${user.display_name} has provided the prompt: "${prompt.word}" for ${prompt.dataFragmentCount} data fragments`,
      severity: 'info'
    });
  };
  
  // Handle the agent's guess submission
  const handleSubmitGuess = () => {
    if (!gameBoardRef.current) return;
    
    // Get selected cards from the GameBoard component
    const selectedCards = gameBoardRef.current.getSelectedCards();
    if (!selectedCards || selectedCards.length === 0) return;
    
    // In a real implementation, this would be sent to the backend
    console.log('Agent submitted guesses:', selectedCards);
    
    // Reveal the selected cards
    gameBoardRef.current.revealCards(selectedCards.map(card => card.id));
    
    // Update the team data fragment count based on the revealed cards
    const updatedTeamData = { ...gameState.teamData };
    
    // Count how many correct cards were found for the active team
    const correctGuesses = selectedCards.filter(card => {
      if (gameState.activeTeam === TEAMS.TEAM1) {
        return card.type === 'bluewave';
      } else {
        return card.type === 'redshift';
      }
    }).length;
    
    // Update the active team's data fragment count
    updatedTeamData[gameState.activeTeam].dataFragments = 
      Math.max(0, updatedTeamData[gameState.activeTeam].dataFragments - correctGuesses);
    
    // Check for trap card
    const hitTrap = selectedCards.some(card => card.type === 'trap');
    
    // Show result notification
    if (hitTrap) {
      setNotification({
        message: "ALERT: Sentinel defense system activated! Turn ends immediately.",
        severity: 'error'
      });
    } else if (correctGuesses === selectedCards.length) {
      setNotification({
        message: `Perfect guess! Found ${correctGuesses} data fragments.`,
        severity: 'success'
      });
    } else if (correctGuesses > 0) {
      setNotification({
        message: `Found ${correctGuesses} data fragments and ${selectedCards.length - correctGuesses} incorrect items.`,
        severity: 'warning'
      });
    } else {
      setNotification({
        message: "No data fragments found. Better luck next time!",
        severity: 'warning'
      });
    }
    
    // Change game state to reveal results phase
    setGameState(prev => ({
      ...prev,
      teamData: updatedTeamData,
      gamePhase: GAME_PHASE.REVEAL_RESULTS
    }));
    
    // After a delay, end the turn and switch teams
    setTimeout(() => {
      const nextTeam = gameState.activeTeam === TEAMS.TEAM1 ? TEAMS.TEAM2 : TEAMS.TEAM1;
      
      setGameState(prev => ({
        ...prev,
        activeTeam: nextTeam,
        gamePhase: GAME_PHASE.HACKER_PROMPT,
        activePrompt: null
      }));
      
      // Reset selections on the game board
      if (gameBoardRef.current) {
        gameBoardRef.current.resetSelections();
      }
      
      setNotification({
        message: `Turn ended. ${nextTeam === TEAMS.TEAM1 ? 'Bluewave' : 'Redshift'} team's turn now.`,
        severity: 'info'
      });
    }, 3000); // 3 second delay to show results
  };
  
  // Handle closing notifications
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  // Check for game over
  useEffect(() => {
    // If a team has 0 data fragments left, they win
    const team1Fragments = gameState.teamData[TEAMS.TEAM1].dataFragments;
    const team2Fragments = gameState.teamData[TEAMS.TEAM2].dataFragments;
    
    if (team1Fragments <= 0) {
      setNotification({
        message: "Bluewave team has found all data fragments and wins!",
        severity: 'success'
      });
    } else if (team2Fragments <= 0) {
      setNotification({
        message: "Redshift team has found all data fragments and wins!",
        severity: 'success'
      });
    }
  }, [gameState.teamData]);
  
  // In a real implementation, this would receive updates from the server
  // For now we'll just simulate it by switching turns every so often
  /*
  useEffect(() => {
    // This is commented out since we now handle turn changes based on user actions
    const timer = setInterval(() => {
      setGameState(prevState => ({
        ...prevState,
        activeTeam: prevState.activeTeam === TEAMS.TEAM1 ? TEAMS.TEAM2 : TEAMS.TEAM1,
      }));
    }, 15000); // Switch teams every 15 seconds
    
    return () => clearInterval(timer);
  }, []);
  */
  
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
          isUserHacker={isUserHacker} 
          userTeam={userTeam}
          activePrompt={gameState.activePrompt}
          isUserTurn={isUserTurn && isTeamGuessingPhase && isUserAgent}
        />

        {/* AI Prompt input - only for hackers */}
        {userTeam && (
          <HackerPrompt 
            gameState={gameState} 
            activeTeam={userTeam}
            isUserHacker={isUserHacker}
            isTeamTurn={isUserTurn && isTeamPromptPhase} 
            activePrompt={userTeam === gameState.activeTeam ? gameState.activePrompt : null}
            onSubmitPrompt={handleSubmitPrompt}
          />
        )}

        {/* Submit guess button - only for agents during guessing phase */}
        {isUserAgent && isUserTurn && isTeamGuessingPhase && gameState.activePrompt && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color={userTeam === TEAMS.TEAM1 ? "primary" : "error"}
              size="large"
              onClick={handleSubmitGuess}
            >
              Submit Guess
            </Button>
          </Box>
        )}

        {/* Game details */}
        <GameDetails gameState={gameState} lobby={lobby} />

        <Box sx={{ textAlign: 'center' }}>
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

export default Game;
