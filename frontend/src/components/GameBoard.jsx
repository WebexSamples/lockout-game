// src/components/GameBoard.jsx
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Box,
  Paper,
  Typography,
  useTheme,
  Button,
  Chip,
} from '@mui/material';
import { TEAMS, CARD_TYPES } from '../constants';
import { useGameContext } from '../context/useGameContext';

/**
 * Individual game tile component
 */
const GameTile = ({
  card,
  isTeamLead,
  isTeamMember,
  isUserTurn,
  onCardSelect,
  selected,
  otherPlayersSelections,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Define colors based on card type and theme mode
  const getCardColors = () => {
    if (card.revealed) {
      switch (card.type) {
        case CARD_TYPES.TEAM1_CARD:
          return {
            bgcolor: isDarkMode ? '#1a3f6d' : '#bbdefb',
            color: isDarkMode ? '#90caf9' : '#0d47a1',
          };
        case CARD_TYPES.TEAM2_CARD:
          return {
            bgcolor: isDarkMode ? '#5c1c1c' : '#ffcdd2',
            color: isDarkMode ? '#ef9a9a' : '#b71c1c',
          };
        case CARD_TYPES.PENALTY:
          return {
            bgcolor: isDarkMode ? '#1b1b1b' : '#212121',
            color: isDarkMode ? '#f5f5f5' : '#ffffff',
          };
        case CARD_TYPES.NEUTRAL:
          return {
            bgcolor: isDarkMode ? '#4a4a00' : '#fff9c4',
            color: isDarkMode ? '#ffeb3b' : '#827717',
          };
        default:
          return {
            bgcolor: isDarkMode ? '#424242' : '#e0e0e0',
            color: isDarkMode ? '#f5f5f5' : '#212121',
          };
      }
    } else {
      return {
        bgcolor: isDarkMode ? '#424242' : '#e0e0e0',
        color: isDarkMode ? '#f5f5f5' : '#212121',
      };
    }
  };

  // Define border for the card
  const getCardBorder = () => {
    // If card is selected by current user during their turn (only for team members, not hackers)
    if (selected && !card.revealed && !isTeamLead) {
      return `3px solid ${isDarkMode ? '#ff9800' : '#ed6c02'}`;
    }

    // If other players have selected this card, show a different border (only for team members, not hackers)
    if (
      otherPlayersSelections &&
      otherPlayersSelections.length > 0 &&
      !card.revealed &&
      !isTeamLead
    ) {
      return `2px dashed ${isDarkMode ? '#9c27b0' : '#673ab7'}`;
    }

    // If card type is visible to the team lead
    if (!isTeamLead || card.revealed) return 'none';

    switch (card.type) {
      case CARD_TYPES.TEAM1_CARD:
        return `2px solid ${isDarkMode ? '#90caf9' : '#1976d2'}`;
      case CARD_TYPES.TEAM2_CARD:
        return `2px solid ${isDarkMode ? '#ef9a9a' : '#d32f2f'}`;
      case CARD_TYPES.PENALTY:
        return `2px solid ${isDarkMode ? '#f5f5f5' : '#000000'}`;
      case CARD_TYPES.NEUTRAL:
        return `2px solid ${isDarkMode ? '#ffeb3b' : '#fbc02d'}`;
      default:
        return 'none';
    }
  };

  const colors = getCardColors();
  const border = getCardBorder();

  // Determine if this card can be selected by a team member
  const isSelectable = isTeamMember && isUserTurn && !card.revealed;

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        elevation={3}
        onClick={() => isSelectable && onCardSelect(card.id)}
        sx={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.bgcolor,
          color: colors.color,
          border: border,
          cursor: isSelectable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': isSelectable
            ? {
                transform: 'translateY(-2px)',
                boxShadow: 6,
              }
            : {},
        }}
      >
        <Typography variant="body1" align="center" fontWeight="medium">
          {card.word}
        </Typography>
      </Paper>

      {/* Show indicator if other players have selected this card */}
      {otherPlayersSelections &&
        otherPlayersSelections.length > 0 &&
        !card.revealed && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: isDarkMode ? '#9c27b0' : '#673ab7',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1,
            }}
          >
            {otherPlayersSelections.length}
          </Box>
        )}
    </Box>
  );
};

GameTile.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    word: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    revealed: PropTypes.bool.isRequired,
  }).isRequired,
  isTeamLead: PropTypes.bool.isRequired,
  isTeamMember: PropTypes.bool.isRequired,
  isUserTurn: PropTypes.bool.isRequired,
  onCardSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  otherPlayersSelections: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * Game Board component that displays a grid of word tiles
 */
const GameBoard = forwardRef(
  ({ isUserTeamLead, userTeam, isUserTurn, user }, ref) => {
    const theme = useTheme();
    const { gameState, handleSubmitGuess, handleCardSelection } =
      useGameContext();
    const [boardData, setBoardData] = useState(gameState?.board || []);
    const [selectedCards, setSelectedCards] = useState([]);
    const isTeamMember = userTeam && !isUserTeamLead;
    const activeKeyword = gameState?.activeKeyword;

    // Update board data when game state changes
    useEffect(() => {
      if (gameState?.board) {
        setBoardData(gameState.board);
      }
    }, [gameState]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      // Function to reveal cards based on guesses
      revealCards: (cardIds) => {
        setBoardData((prevData) =>
          prevData.map((card) =>
            cardIds.includes(card.id) ? { ...card, revealed: true } : card,
          ),
        );
        setSelectedCards([]);
      },
      // Get the currently selected cards
      getSelectedCards: () => {
        return selectedCards.map((id) =>
          boardData.find((card) => card.id === id),
        );
      },
      // Get all board data
      getBoardData: () => boardData,
      // Reset selections
      resetSelections: () => setSelectedCards([]),
    }));

    // Handle card selection by team members
    const handleCardSelect = (cardId) => {
      setSelectedCards((prev) => {
        const isCurrentlySelected = prev.includes(cardId);
        let newSelections;

        // If already selected, deselect it
        if (isCurrentlySelected) {
          newSelections = prev.filter((id) => id !== cardId);
        } else {
          // If we've already selected the maximum number of cards (based on keyword)
          // remove the first selected card and add this new one
          if (activeKeyword && prev.length >= activeKeyword.count) {
            const updatedSelections = [...prev];
            updatedSelections.shift(); // Remove the first (oldest) selection
            newSelections = [...updatedSelections, cardId];
          } else {
            // Otherwise add this card to selections
            newSelections = [...prev, cardId];
          }
        }

        // Emit real-time card selection to other players
        handleCardSelection(cardId, !isCurrentlySelected);

        return newSelections;
      });
    };

    // Submit team's guesses to the backend
    const submitGuesses = () => {
      if (selectedCards.length === 0 || !activeKeyword || !activeKeyword.count)
        return;

      // Submit all selected cards at once
      handleSubmitGuess(selectedCards);

      // Reset selections after submitting
      setSelectedCards([]);
    };

    return (
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Game Board</Typography>

          {/* Show active keyword if one exists */}
          {activeKeyword && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Active Keyword:</Typography>
              <Chip
                label={activeKeyword.word}
                color={activeKeyword.team === TEAMS.TEAM1 ? 'primary' : 'error'}
              />
              <Typography variant="body2">for</Typography>
              <Chip
                label={`${activeKeyword.count} ${activeKeyword.count > 1 ? 'cards' : 'card'}`}
                size="small"
                variant="outlined"
                color={activeKeyword.team === TEAMS.TEAM1 ? 'primary' : 'error'}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" align="center" color="text.secondary">
            {isUserTeamLead
              ? 'As Hacker, you can see the type of each card. Submit keywords to help your team find them.'
              : isUserTurn
                ? "Select words that match your Hacker's keyword, then click 'Submit Guess'."
                : "As a team member, you must rely on your Hacker's guidance to identify the correct cards."}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {boardData.map((card) => {
            // Get other players who have selected this card (excluding current user)
            const otherPlayersSelections = Object.entries(
              gameState?.selectedCards || {},
            )
              .filter(
                ([userId, selectedCardIds]) =>
                  userId !== user?.id && selectedCardIds.includes(card.id),
              )
              .map(([userId]) => userId);

            return (
              <Grid item xs={3} key={card.id}>
                <GameTile
                  card={card}
                  isTeamLead={isUserTeamLead}
                  isTeamMember={isTeamMember}
                  isUserTurn={isUserTurn}
                  onCardSelect={handleCardSelect}
                  selected={selectedCards.includes(card.id)}
                  otherPlayersSelections={otherPlayersSelections}
                />
              </Grid>
            );
          })}
        </Grid>

        {/* Legend for hackers */}
        {isUserTeamLead && (
          <Box
            sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor:
                    theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                  mr: 1,
                }}
              />
              <Typography variant="caption">Bluewave</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor:
                    theme.palette.mode === 'dark' ? '#ef9a9a' : '#d32f2f',
                  mr: 1,
                }}
              />
              <Typography variant="caption">Redshift</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor:
                    theme.palette.mode === 'dark' ? '#f5f5f5' : '#000000',
                  mr: 1,
                }}
              />
              <Typography variant="caption">Cyber-Security Trap</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor:
                    theme.palette.mode === 'dark' ? '#ffeb3b' : '#fbc02d',
                  mr: 1,
                }}
              />
              <Typography variant="caption">Honeypot</Typography>
            </Box>
          </Box>
        )}

        {/* Submit button for team members */}
        {isTeamMember &&
          isUserTurn &&
          activeKeyword &&
          selectedCards.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color={userTeam === TEAMS.TEAM1 ? 'primary' : 'error'}
                onClick={submitGuesses}
                // Allow submitting any number up to the count
                disabled={selectedCards.length > activeKeyword.count}
              >
                Submit Guess ({selectedCards.length}/{activeKeyword.count})
              </Button>
            </Box>
          )}
      </Paper>
    );
  },
);

GameBoard.propTypes = {
  isUserTeamLead: PropTypes.bool.isRequired,
  userTeam: PropTypes.string,
  isUserTurn: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
};

GameBoard.displayName = 'GameBoard';

export default GameBoard;
