// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import About from './components/About';
import { ROUTES } from './constants';

function App() {
  const [darkMode, setDarkMode] = useState(true); // Set dark mode as default
  const location = useLocation();
  
  // Only load Webex on /game routes
  const shouldLoadWebex = location.pathname.startsWith('/game');

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
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} shouldLoadWebex={shouldLoadWebex} />
      <Container>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.GAME} element={<CreateLobby />} />
          <Route path={ROUTES.GAME_WITH_ID(':lobbyId')} element={<Lobby />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
