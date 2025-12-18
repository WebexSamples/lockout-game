// frontend/src/components/Navbar.jsx

import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CrossIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import PropTypes from 'prop-types';
import useWebex from '../hooks/useWebex';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import AboutModal from './About/AboutModal';

export default function Navbar({ darkMode, setDarkMode, shouldLoadWebex = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  
  // Always call the hook, but it will internally skip initialization if disabled
  const {
    isConnected,
    isRunningInWebex,
    username,
    meetingName,
    loading,
    error,
  } = useWebex();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAboutOpen = (e) => {
    e.preventDefault(); // Prevent the default navigation
    setAboutModalOpen(true);
  };

  const handleAboutClose = () => {
    setAboutModalOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={3}
        sx={{
          backgroundColor: darkMode ? 'background.paper' : 'primary.main',
          borderBottom: darkMode ? '1px solid' : 'none',
          borderColor: darkMode ? 'primary.main' : 'inherit',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon
              sx={{ mr: 1, color: darkMode ? 'primary.main' : 'inherit' }}
            />
            <Typography
              variant="h6"
              component={RouterLink}
              to={ROUTES.HOME}
              sx={{
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                letterSpacing: '0.1rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              LOCKOUT
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* About page icon link */}
          <Tooltip title="About">
            <IconButton
              component={RouterLink}
              to={ROUTES.ABOUT}
              color="inherit"
              aria-label="About"
              onClick={handleAboutOpen}
              sx={{
                mr: 1,
                '&:hover': {
                  color: darkMode ? 'primary.main' : 'inherit',
                },
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>

          {/* Dark mode toggle */}
          <Tooltip title="Toggle dark mode">
            <IconButton
              color="inherit"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              sx={{
                mr: 1,
                '&:hover': {
                  color: darkMode ? 'primary.main' : 'inherit',
                },
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Webex Info Menu - Only show on /game routes */}
          {shouldLoadWebex && (
            <>
              <Tooltip title="Webex Info">
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  aria-label="Webex Info Menu"
                  sx={{
                    '&:hover': {
                      color: darkMode ? 'primary.main' : 'inherit',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {loading ? (
                  <MenuItem>
                    <CircularProgress size={18} />
                  </MenuItem>
                ) : (
                  [
                    <MenuItem key="status">
                      {isConnected ? (
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <CrossIcon color="error" sx={{ mr: 1 }} />
                      )}
                      {isConnected ? 'Connected to Webex' : 'Webex Not Connected'}
                    </MenuItem>,

                    !isRunningInWebex && (
                      <MenuItem key="not-webex">
                        <ErrorIcon color="warning" sx={{ mr: 1 }} />
                        Running Outside Webex
                      </MenuItem>
                    ),

                    username && <MenuItem key="username">{username}</MenuItem>,

                    meetingName && (
                      <MenuItem key="meetingName">{meetingName}</MenuItem>
                    ),

                    error && (
                      <MenuItem key="error">
                        <ErrorIcon color="error" sx={{ mr: 1 }} />
                        {error}
                      </MenuItem>
                    ),
                  ]
                )}
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* About Modal */}
      <AboutModal open={aboutModalOpen} onClose={handleAboutClose} />
    </>
  );
}

// ✅ PropTypes
Navbar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  shouldLoadWebex: PropTypes.bool,
};
