import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import lockoutImage from '../lockout.png';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <img
          src={lockoutImage}
          alt="Lockout Game"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
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
        <Typography variant="h3" gutterBottom sx={{ color: 'primary.main' }}>
          Lockout 🔐
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          component="p"
          sx={{ mb: 3 }}
        >
          In the digital underworld, two rival hacker groups —{' '}
          <strong>Bluewave</strong> and <strong>Redshift</strong> — compete to
          extract sensitive data from a hostile AI system called{' '}
          <strong>Sentinel</strong>. Will you outsmart the AI, or fall into its
          trap?
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<VideocamIcon />}
              onClick={() => navigate(ROUTES.GAME)}
              sx={{
                boxShadow: '0 0 10px #00ff00',
                '&:hover': {
                  boxShadow: '0 0 15px #00ff00',
                },
              }}
            >
              Launch in Webex
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<VideocamOffIcon />}
              onClick={() => navigate(`${ROUTES.GAME}?disableWebex=true`)}
              sx={{
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(0, 255, 0, 0.1)',
                },
              }}
            >
              Standalone Browser
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPage;
