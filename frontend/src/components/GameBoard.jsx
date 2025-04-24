// src/components/GameBoard.jsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { 
  Grid, 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Button,
  Chip
} from '@mui/material';
import { TEAMS } from '../constants';

/**
 * Card types and their respective counts
 */
const CARD_TYPES = {
  BLUEWAVE: 'bluewave', // 6 cards
  REDSHIFT: 'redshift', // 5 cards
  TRAP: 'trap',         // 1 card
  HONEYPOT: 'honeypot'  // 4 cards
};

/**
 * Mock data for the game board
 * In a real implementation, this would come from the backend
 */
const MOCK_BOARD_DATA = [
  { id: 1, word: 'ENCRYPT', type: CARD_TYPES.BLUEWAVE, revealed: false },
  { id: 2, word: 'FIREWALL', type: CARD_TYPES.BLUEWAVE, revealed: false },
  { id: 3, word: 'PROTOCOL', type: CARD_TYPES.BLUEWAVE, revealed: false },
  { id: 4, word: 'TERMINAL', type: CARD_TYPES.BLUEWAVE, revealed: false },
  { id: 5, word: 'BINARY', type: CARD_TYPES.BLUEWAVE, revealed: false },
  { id: 6, word: 'CIPHER', type: CARD_TYPES.BLUEWAVE, revealed: false },
  
  { id: 7, word: 'EXPLOIT', type: CARD_TYPES.REDSHIFT, revealed: false },
  { id: 8, word: 'MALWARE', type: CARD_TYPES.REDSHIFT, revealed: false },
  { id: 9, word: 'VIRUS', type: CARD_TYPES.REDSHIFT, revealed: false },
  { id: 10, word: 'BREACH', type: CARD_TYPES.REDSHIFT, revealed: false },
  { id: 11, word: 'HACK', type: CARD_TYPES.REDSHIFT, revealed: false },
  
  { id: 12, word: 'SENTINEL', type: CARD_TYPES.TRAP, revealed: false },
  
  { id: 13, word: 'SERVER', type: CARD_TYPES.HONEYPOT, revealed: false },
  { id: 14, word: 'PASSWORD', type: CARD_TYPES.HONEYPOT, revealed: false },
  { id: 15, word: 'DATABASE', type: CARD_TYPES.HONEYPOT, revealed: false },
  { id: 16, word: 'ROUTER', type: CARD_TYPES.HONEYPOT, revealed: false },
];

// Randomize the order of the cards
const shuffleCards = (cards) => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Individual game tile component
 */
const GameTile = ({ 
  card, 
  isHacker, 
  isAgent,
  isUserTurn,
  onCardSelect, 
  selected
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Define colors based on card type and theme mode
  const getCardColors = () => {
    if (card.revealed) {
      switch (card.type) {
        case CARD_TYPES.BLUEWAVE:
          return {
            bgcolor: isDarkMode ? '#1a3f6d' : '#bbdefb',
            color: isDarkMode ? '#90caf9' : '#0d47a1'
          };
        case CARD_TYPES.REDSHIFT:
          return {
            bgcolor: isDarkMode ? '#5c1c1c' : '#ffcdd2',
            color: isDarkMode ? '#ef9a9a' : '#b71c1c'
          };
        case CARD_TYPES.TRAP:
          return {
            bgcolor: isDarkMode ? '#1b1b1b' : '#212121',
            color: isDarkMode ? '#f5f5f5' : '#ffffff'
          };
        case CARD_TYPES.HONEYPOT:
          return {
            bgcolor: isDarkMode ? '#4a4a00' : '#fff9c4', 
            color: isDarkMode ? '#ffeb3b' : '#827717'
          };
        default:
          return {
            bgcolor: isDarkMode ? '#424242' : '#e0e0e0',
            color: isDarkMode ? '#f5f5f5' : '#212121'
          };
      }
    } else {
      return {
        bgcolor: isDarkMode ? '#424242' : '#e0e0e0',
        color: isDarkMode ? '#f5f5f5' : '#212121'
      };
    }
  };

  // Define border for the card if it's visible to the hacker
  const getCardBorder = () => {
    // If card is selected by an agent during their turn
    if (selected && !card.revealed) {
      return `2px solid ${isDarkMode ? '#ff9800' : '#ed6c02'}`;
    }
    
    // If card type is visible to the hacker
    if (!isHacker || card.revealed) return 'none';
    
    switch (card.type) {
      case CARD_TYPES.BLUEWAVE:
        return `2px solid ${isDarkMode ? '#90caf9' : '#1976d2'}`;
      case CARD_TYPES.REDSHIFT:
        return `2px solid ${isDarkMode ? '#ef9a9a' : '#d32f2f'}`;
      case CARD_TYPES.TRAP:
        return `2px solid ${isDarkMode ? '#f5f5f5' : '#000000'}`;
      case CARD_TYPES.HONEYPOT:
        return `2px solid ${isDarkMode ? '#ffeb3b' : '#fbc02d'}`;
      default:
        return 'none';
    }
  };

  const colors = getCardColors();
  const border = getCardBorder();
  
  // Determine if this card can be selected by an agent
  const isSelectable = isAgent && isUserTurn && !card.revealed;
  
  return (
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
        '&:hover': isSelectable ? {
          transform: 'translateY(-2px)',
          boxShadow: 6
        } : {}
      }}
    >
      <Typography variant="body1" align="center" fontWeight="medium">
        {card.word}
      </Typography>
    </Paper>
  );
};

GameTile.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    word: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    revealed: PropTypes.bool.isRequired
  }).isRequired,
  isHacker: PropTypes.bool.isRequired,
  isAgent: PropTypes.bool.isRequired,
  isUserTurn: PropTypes.bool.isRequired,
  onCardSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired
};

/**
 * Game Board component that displays a grid of word tiles
 */
const GameBoard = forwardRef(({ 
  isUserHacker, 
  userTeam,
  activePrompt,
  isUserTurn
}, ref) => {
  const theme = useTheme();
  const [boardData, setBoardData] = useState(() => shuffleCards(MOCK_BOARD_DATA));
  const [selectedCards, setSelectedCards] = useState([]);
  const isAgent = userTeam && !isUserHacker;
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Function to reveal cards based on the hacker's prompts or agent guesses
    revealCards: (cardIds) => {
      setBoardData(prevData => 
        prevData.map(card => 
          cardIds.includes(card.id) ? { ...card, revealed: true } : card
        )
      );
      setSelectedCards([]);
    },
    // Get the currently selected cards
    getSelectedCards: () => {
      return selectedCards.map(id => 
        boardData.find(card => card.id === id)
      );
    },
    // Get all board data
    getBoardData: () => boardData,
    // Reset selections
    resetSelections: () => setSelectedCards([])
  }));
  
  // Handle card selection by agents
  const handleCardSelect = (cardId) => {
    setSelectedCards(prev => {
      // If already selected, deselect it
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      
      // If we've already selected the maximum number of cards (based on prompt)
      // remove the first selected card and add this new one
      if (activePrompt && prev.length >= activePrompt.dataFragmentCount) {
        const newSelections = [...prev];
        newSelections.shift(); // Remove the first (oldest) selection
        return [...newSelections, cardId];
      }
      
      // Otherwise add this card to selections
      return [...prev, cardId];
    });
  };
  
  // Process the agent's guesses
  const processGuesses = () => {
    // In a real implementation, we would send these guesses to the backend
    console.log('Processing guesses:', selectedCards);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Data Fragments
        </Typography>
        
        {/* Show active prompt if one exists */}
        {activePrompt && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Active Prompt:</Typography>
            <Chip 
              label={activePrompt.word}
              color={activePrompt.team === TEAMS.TEAM1 ? "primary" : "error"}
            />
            <Typography variant="body2">for</Typography>
            <Chip 
              label={`${activePrompt.dataFragmentCount} ${activePrompt.dataFragmentCount > 1 ? 'fragments' : 'fragment'}`}
              size="small" 
              variant="outlined"
              color={activePrompt.team === TEAMS.TEAM1 ? "primary" : "error"}
            />
          </Box>
        )}
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" align="center" color="text.secondary">
          {isUserHacker ? 
            "As a Hacker, you can see the type of each data fragment. Submit prompts to help your team find them." :
            isUserTurn ?
            "Select words that match your Hacker's prompt, then click 'Process Guess'." :
            "As an Agent, you must rely on your Hacker's guidance to identify data fragments."
          }
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {boardData.map((card) => (
          <Grid item xs={3} key={card.id}>
            <GameTile 
              card={card}
              isHacker={isUserHacker}
              isAgent={isAgent}
              isUserTurn={isUserTurn}
              onCardSelect={handleCardSelect}
              selected={selectedCards.includes(card.id)}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Legend for hackers */}
      {isUserHacker && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              bgcolor: theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2', 
              mr: 1 
            }} />
            <Typography variant="caption">Bluewave</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              bgcolor: theme.palette.mode === 'dark' ? '#ef9a9a' : '#d32f2f', 
              mr: 1 
            }} />
            <Typography variant="caption">Redshift</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              bgcolor: theme.palette.mode === 'dark' ? '#f5f5f5' : '#000000', 
              mr: 1 
            }} />
            <Typography variant="caption">Trap</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              bgcolor: theme.palette.mode === 'dark' ? '#ffeb3b' : '#fbc02d', 
              mr: 1 
            }} />
            <Typography variant="caption">Honeypot</Typography>
          </Box>
        </Box>
      )}
      
      {/* Process button for agents */}
      {isAgent && isUserTurn && activePrompt && selectedCards.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color={userTeam === TEAMS.TEAM1 ? "primary" : "error"}
            onClick={processGuesses}
            disabled={selectedCards.length !== activePrompt.dataFragmentCount}
          >
            Process Guess ({selectedCards.length}/{activePrompt.dataFragmentCount})
          </Button>
        </Box>
      )}
    </Paper>
  );
});

GameBoard.propTypes = {
  gameState: PropTypes.object.isRequired,
  isUserHacker: PropTypes.bool.isRequired,
  userTeam: PropTypes.string,
  activePrompt: PropTypes.shape({
    word: PropTypes.string.isRequired,
    dataFragmentCount: PropTypes.number.isRequired,
    team: PropTypes.string.isRequired
  }),
  isUserTurn: PropTypes.bool.isRequired
};

GameBoard.displayName = 'GameBoard';

export default GameBoard;