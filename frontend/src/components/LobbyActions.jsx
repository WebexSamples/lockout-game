// src/components/LobbyActions.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid2,
} from '@mui/material';
import { useLobbyContext } from '../context/useLobbyContext';

/**
 * User actions: update name, switch team, team lead management, leave lobby.
 */
const LobbyActions = () => {
  const {
    user,
    updateDisplayName,
    leaveLobby,
    toggleTeam,
    requestTeamLead,
    demoteTeamLead,
    isUserTeamLead,
    hasTeamLead,
  } = useLobbyContext();

  const [newDisplayName, setNewDisplayName] = useState('');
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const handleLeaveLobby = () => setLeaveConfirmOpen(true);
  const confirmLeaveLobby = () => {
    leaveLobby();
    setLeaveConfirmOpen(false);
  };

  if (!user) return null;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Actions
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              label="Update Display Name"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              variant="outlined"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={!newDisplayName.trim()}
              onClick={() => updateDisplayName(newDisplayName)}
            >
              Update Name
            </Button>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={toggleTeam}
              disabled={!toggleTeam}
            >
              Switch Team
            </Button>
          </Grid2>

          {!isUserTeamLead() && (
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={requestTeamLead}
                disabled={hasTeamLead(user.id)}
              >
                Become Team Lead
              </Button>
            </Grid2>
          )}

          {isUserTeamLead() && (
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={demoteTeamLead}
              >
                Demote Self
              </Button>
            </Grid2>
          )}

          <Grid2 size={12}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleLeaveLobby}
            >
              Leave Lobby
            </Button>
          </Grid2>
        </Grid2>
      </CardContent>

      <Dialog
        open={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
      >
        <DialogTitle>Leave Lobby</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave the lobby? You’ll be removed from the
            game and may have to rejoin manually.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmLeaveLobby}>
            Confirm Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default LobbyActions;
