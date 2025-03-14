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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CrossIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import { useState } from 'react';
import PropTypes from 'prop-types'; // ✅ Import PropTypes
import useWebex from '../hooks/useWebex';

export default function Navbar({ darkMode, setDarkMode }) {
  const [anchorEl, setAnchorEl] = useState(null);
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

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Webex Launchpad
        </Typography>

        <Tooltip title="Toggle dark mode">
          <IconButton
            color="inherit"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Webex Info">
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="Webex Info Menu"
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
            <>
              <MenuItem>
                {isConnected ? (
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <CrossIcon color="error" sx={{ mr: 1 }} />
                )}
                {isConnected ? 'Connected to Webex' : 'Webex Not Connected'}
              </MenuItem>

              {!isRunningInWebex && (
                <MenuItem>
                  <ErrorIcon color="warning" sx={{ mr: 1 }} />
                  Running Outside Webex
                </MenuItem>
              )}

              {username && <MenuItem>{username}</MenuItem>}
              {meetingName && <MenuItem>{meetingName}</MenuItem>}
              {error && (
                <MenuItem>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  {error}
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

// ✅ Add PropTypes definition
Navbar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};
