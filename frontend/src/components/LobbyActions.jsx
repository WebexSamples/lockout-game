import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

const LobbyActions = ({
  currentUser,
  newDisplayName,
  setNewDisplayName,
  updateDisplayName,
  leaveLobby,
  toggleTeam,
  requestTeamLead,
  demoteTeamLead,
}) => {
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const handleLeaveLobby = () => {
    setLeaveConfirmOpen(true);
  };

  const confirmLeaveLobby = () => {
    leaveLobby();
    setLeaveConfirmOpen(false);
  };

  if (!currentUser) return null;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Actions
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 xs={12} md={8}>
            <TextField
              fullWidth
              label="Update Display Name"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              variant="outlined"
            />
          </Grid2>
          <Grid2 xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              disabled={!newDisplayName.trim()}
              onClick={() => updateDisplayName(newDisplayName)}
            >
              Update Name
            </Button>
          </Grid2>

          <Grid2 xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={toggleTeam}
              disabled={!toggleTeam}
            >
              Switch Team
            </Button>
          </Grid2>

          {!currentUser.is_team_lead && (
            <Grid2 xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={requestTeamLead}
                disabled={!requestTeamLead}
              >
                Become Team Lead
              </Button>
            </Grid2>
          )}

          {currentUser.is_team_lead && (
            <Grid2 xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={demoteTeamLead}
                disabled={!demoteTeamLead}
              >
                Demote Self
              </Button>
            </Grid2>
          )}

          <Grid2 xs={12}>
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

LobbyActions.propTypes = {
  currentUser: PropTypes.object.isRequired,
  newDisplayName: PropTypes.string.isRequired,
  setNewDisplayName: PropTypes.func.isRequired,
  updateDisplayName: PropTypes.func.isRequired,
  leaveLobby: PropTypes.func.isRequired,
  toggleTeam: PropTypes.func,
  requestTeamLead: PropTypes.func,
  demoteTeamLead: PropTypes.func,
};

export default LobbyActions;
