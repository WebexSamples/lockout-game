// src/components/LobbyDetails.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Link,
  Button,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useWebex from '../hooks/useWebex';
import { useLobbyContext } from '../context/useLobbyContext';

/**
 * Displays key game lobby information, Webex sharing controls, and a
 * mobile-friendly share button using the Web Share API with a clipboard fallback.
 */
const LobbyDetails = () => {
  const { isShared, isRunningInWebex, toggleShare } = useWebex();
  const { lobby, lobbyUrl } = useLobbyContext();
  const [copySnackbarOpen, setCopySnackbarOpen] = useState(false);

  const canNativeShare =
    typeof navigator !== 'undefined' && Boolean(navigator.share);

  const handleShareLobby = async () => {
    const shareData = {
      title: `Join ${lobby?.lobby_name || 'Game Lobby'} — Lockout`,
      text: `Join my Lockout game "${lobby?.lobby_name || 'Game Lobby'}"!`,
      url: lobbyUrl,
    };

    if (canNativeShare) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet — no action needed
      }
    } else {
      // Clipboard fallback for desktop browsers
      try {
        await navigator.clipboard.writeText(lobbyUrl);
        setCopySnackbarOpen(true);
      } catch {
        // Clipboard write failed — nothing we can do silently
      }
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">
          🔒 {lobby?.lobby_name || 'Game Lobby'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Game ID: {lobby?.id}
        </Typography>
        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
          Game URL:{' '}
          <Link href={lobbyUrl} target="_blank" rel="noopener noreferrer">
            {lobbyUrl}
          </Link>
        </Typography>

        {/* Mobile-friendly share button */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleShareLobby}
            startIcon={canNativeShare ? <ShareIcon /> : <ContentCopyIcon />}
            fullWidth
            data-testid="share-lobby-button"
          >
            {canNativeShare ? 'Share Lobby' : 'Copy Lobby Link'}
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Lobby Sharing:</strong>{' '}
          {isShared ? 'Active ✅' : 'Inactive ❌'}
        </Typography>

        <Button
          variant="contained"
          color={isShared ? 'error' : 'primary'}
          sx={{ mt: 2 }}
          onClick={() => toggleShare(lobbyUrl)}
          disabled={!isRunningInWebex}
        >
          {isShared ? 'Deactivate Shared Lobby' : 'Activate Shared Lobby'}
        </Button>

        {!isRunningInWebex && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 1 }}
          >
            Sharing is only available inside Webex.
          </Typography>
        )}
      </CardContent>

      <Snackbar
        open={copySnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setCopySnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopySnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Lobby link copied to clipboard!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default LobbyDetails;
