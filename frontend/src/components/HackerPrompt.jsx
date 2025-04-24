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
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import { TEAMS } from '../constants';

/**
 * AI Prompt input component for the active team's hacker
 */
const HackerPrompt = ({ 
  gameState, 
  activeTeam, 
  isUserHacker,
  isTeamTurn,
  activePrompt,
  onSubmitPrompt
}) => {
  const theme = useTheme();
  const [word, setWord] = useState('');
  const [dataFragmentCount, setDataFragmentCount] = useState(1);
  
  const maxFragments = gameState.teamData[activeTeam].dataFragments;
  const isDisabled = !isUserHacker || !isTeamTurn || maxFragments <= 0 || activePrompt !== null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled || !word.trim() || dataFragmentCount < 1) return;
    
    // Submit the prompt
    onSubmitPrompt({
      word: word.trim(),
      dataFragmentCount,
      team: activeTeam
    });
    
    // Clear the input after submission
    setWord('');
    setDataFragmentCount(1);
  };
  
  // Generate array of numbers from 1 to maxFragments for the select menu
  const fragmentOptions = Array.from(
    { length: maxFragments }, 
    (_, i) => i + 1
  );
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        opacity: isDisabled ? 0.7 : 1,
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.grey[900] 
          : theme.palette.grey[100]
      }} 
      elevation={3}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CodeIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Hacker Terminal</Typography>
      </Box>
      
      {/* Show active prompt if there is one */}
      {activePrompt && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your current active prompt: <strong>{activePrompt.word}</strong> for <strong>{activePrompt.dataFragmentCount}</strong> data fragment(s).
          <br />
          Wait for your agents to make their selections.
        </Alert>
      )}
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {isUserHacker 
          ? isTeamTurn
            ? activePrompt
              ? "Your agents are now selecting data fragments based on your prompt."
              : "Your team is active. Enter your AI prompt below."
            : "Wait for your team's turn to input a prompt."
          : "Only the team's Hacker can input AI prompts."
        }
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <TextField
            label="AI Prompt Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={isDisabled}
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Enter a single word..."
            helperText="Input a strategic word to help your agents find data fragments"
          />
          
          <FormControl 
            sx={{ minWidth: 120 }}
            size="small"
            disabled={isDisabled}
          >
            <InputLabel>Fragments</InputLabel>
            <Select
              value={dataFragmentCount}
              onChange={(e) => setDataFragmentCount(e.target.value)}
              label="Fragments"
            >
              {fragmentOptions.map(num => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            type="submit"
            variant="contained"
            color={activeTeam === TEAMS.TEAM1 ? "primary" : "error"}
            endIcon={<SendIcon />}
            disabled={isDisabled || !word.trim()}
          >
            Send
          </Button>
        </Stack>
        {maxFragments <= 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            No data fragments remaining.
          </Typography>
        )}
      </form>
    </Paper>
  );
};

HackerPrompt.propTypes = {
  gameState: PropTypes.shape({
    activeTeam: PropTypes.string.isRequired,
    teamData: PropTypes.object.isRequired
  }).isRequired,
  activeTeam: PropTypes.string.isRequired,
  isUserHacker: PropTypes.bool.isRequired,
  isTeamTurn: PropTypes.bool.isRequired,
  activePrompt: PropTypes.shape({
    word: PropTypes.string.isRequired,
    dataFragmentCount: PropTypes.number.isRequired,
    team: PropTypes.string.isRequired
  }),
  onSubmitPrompt: PropTypes.func.isRequired
};

export default HackerPrompt;