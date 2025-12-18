import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  CircularProgress,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../constants';
import useWebex from '../hooks/useWebex';
import api from '../utils/api';
import LockIcon from '@mui/icons-material/Lock';

const CreateLobby = () => {
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize webexEnabled based on URL parameter
  const [webexEnabled, setWebexEnabled] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('disableWebex') !== 'true';
  });
  
  const { isLoading, username, meetingName } = useWebex();

  // Once isLoading is false, set default values from Webex SDK
  // This is a workaround to avoid setting default values before Webex SDK is ready
  useEffect(() => {
    if (!isLoading && webexEnabled) {
      if (meetingName) {
        setLobbyName(meetingName);
      }
      if (username) {
        setDisplayName(username);
      }
    }
  }, [isLoading, meetingName, username, webexEnabled]);

  const handleCreateLobby = async () => {
    if (!lobbyName.trim() || !displayName.trim()) return;
    setLoading(true);

    try {
      const hostId = uuidv4();
      const data = await api.createLobby(hostId, displayName, lobbyName);
      
      // Build the game URL with optional disableWebex parameter
      let gameUrl = ROUTES.GAME_WITH_ID(data.lobby_id);
      if (!webexEnabled) {
        gameUrl += '?disableWebex=true';
      }
      
      navigate(gameUrl, {
        state: { user: { id: hostId, display_name: displayName } },
      });
    } catch (error) {
      console.error('Error creating game:', error);
      alert(error.message || 'Failed to create game.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h4">Create a New Game</Typography>
        </Box>
        <form
          role="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateLobby();
          }}
        >
          <TextField
            fullWidth
            label="Game Name"
            variant="outlined"
            margin="normal"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
          />
          <TextField
            fullWidth
            label="Your Display Name"
            variant="outlined"
            margin="normal"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={webexEnabled}
                  onChange={(e) => setWebexEnabled(e.target.checked)}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="textSecondary">
                  Enable Webex Integration
                </Typography>
              }
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              boxShadow: '0 0 10px #00ff00',
              '&:hover': {
                boxShadow: '0 0 15px #00ff00',
              },
            }}
            disabled={loading || !lobbyName.trim() || !displayName.trim()}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />{' '}
                Creating Game
              </>
            ) : (
              'Create Game'
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateLobby;
