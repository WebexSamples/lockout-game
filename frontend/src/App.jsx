// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
} from '@mui/material';
import CreateLobby from './components/CreateLobby';
import Lobby from './components/Lobby';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import useWebex from './hooks/useWebex';
import { ROUTES } from './constants';

function App() {
  const { theme: webexTheme } = useWebex();
  const [darkMode, setDarkMode] = useState(true); // Set dark mode as default

  useEffect(() => {
    // Only switch from dark if webex theme explicitly requests light
    setDarkMode(webexTheme !== 'light');
  }, [webexTheme]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      // Add hacker theme colors if dark mode
      ...(darkMode && {
        primary: {
          main: '#00ff00', // Hacker green
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      }),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Container>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOBBY} element={<CreateLobby />} />
          <Route path={ROUTES.LOBBY_WITH_ID(':lobbyId')} element={<Lobby />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
