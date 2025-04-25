// src/components/HackerPrompt.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  useTheme,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import { TEAMS } from '../constants';
import { useGameContext } from '../context/useGameContext';

/**
 * AI Prompt input component for the active team's hacker
 */
const HackerPrompt = ({ activeTeam, isTeamLead, isTeamTurn }) => {
  const theme = useTheme();
  const { gameState, handleSubmitKeyword } = useGameContext();
  const [word, setWord] = useState('');
  const [count, setCount] = useState(1);

  const remainingCards = gameState.teamData[activeTeam]?.remainingCards || 0;
  const activeKeyword = gameState.activeKeyword;
  const isActiveTeamKeyword =
    activeKeyword && activeKeyword.team === activeTeam;
  const isDisabled =
    !isTeamLead || !isTeamTurn || remainingCards <= 0 || isActiveTeamKeyword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled || !word.trim() || count < 1) return;

    // Submit the keyword using the context function
    handleSubmitKeyword({
      word: word.trim(),
      count,
      team: activeTeam,
    });

    // Clear the input after submission
    setWord('');
    setCount(1);
  };

  // Generate array of numbers from 1 to remainingCards for the select menu
  const countOptions = Array.from(
    { length: Math.min(remainingCards, 5) }, // Limit to 5 max cards at a time
    (_, i) => i + 1,
  );

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        opacity: isDisabled ? 0.7 : 1,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
      }}
      elevation={3}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CodeIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Hacker Terminal</Typography>
      </Box>

      {/* Show active keyword if there is one */}
      {isActiveTeamKeyword && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your current active keyword: <strong>{activeKeyword.word}</strong> for{' '}
          <strong>{activeKeyword.count}</strong> card(s).
          <br />
          Wait for your team members to make their selections.
        </Alert>
      )}

      <Typography variant="body2" sx={{ mb: 2 }}>
        {isTeamLead
          ? isTeamTurn
            ? isActiveTeamKeyword
              ? 'Your team members are now selecting cards based on your keyword.'
              : 'Your team is active. Enter your keyword below.'
            : "Wait for your team's turn to input a keyword."
          : "Only the team's Hacker (team lead) can input keywords."}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            label="Keyword"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={isDisabled}
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter a single word..."
            helperText="Input a strategic word to help your team find your cards"
          />

          <FormControl
            sx={{ minWidth: 120 }}
            size="small"
            disabled={isDisabled}
          >
            <InputLabel>Cards</InputLabel>
            <Select
              value={count}
              onChange={(e) => setCount(e.target.value)}
              label="Cards"
            >
              {countOptions.map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color={activeTeam === TEAMS.TEAM1 ? 'primary' : 'error'}
            endIcon={<SendIcon />}
            disabled={isDisabled || !word.trim()}
          >
            Send
          </Button>
        </Stack>
        {remainingCards <= 0 && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: 'block' }}
          >
            No cards remaining for your team.
          </Typography>
        )}
      </form>
    </Paper>
  );
};

HackerPrompt.propTypes = {
  activeTeam: PropTypes.string.isRequired,
  isTeamLead: PropTypes.bool.isRequired,
  isTeamTurn: PropTypes.bool.isRequired,
};

export default HackerPrompt;
