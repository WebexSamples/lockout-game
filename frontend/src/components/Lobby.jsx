import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useWebex from '../hooks/useWebex';
import useLobby from '../hooks/useLobby';
import LobbyDetails from './LobbyDetails';
import LobbyParticipants from './LobbyParticipants';
import LobbyActions from './LobbyActions';
import JoinLobby from './JoinLobby';
import { Typography, Box } from '@mui/material';

const Lobby = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { webexData } = useWebex();

  const storedUser = JSON.parse(localStorage.getItem(`lobbyUser-${lobbyId}`));
  const [user, setUser] = useState(storedUser || location.state?.user || null);

  const {
    lobby,
    loading,
    joined,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateDisplayName,
    lobbyUrl,
    toggleTeam,
    requestTeamLead,
    demoteTeamLead,
    isUserTeamLead,
    hasTeamLead,
  } = useLobby(lobbyId, user);

  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (webexData && !user) {
      setUser({
        id: webexData.user.id,
        display_name: webexData.user.displayName || 'Guest',
      });
    }
  }, [webexData, user]);

  useEffect(() => {
    if (!joined && user?.id) {
      joinLobby(user);
    }
  }, [joined, user, joinLobby]);

  const handleJoinLobby = (userObj) => {
    setUser(userObj);
    joinLobby(userObj);
  };

  if (loading) {
    return <Typography textAlign="center">Loading lobby...</Typography>;
  }

  if (!joined) {
    return <JoinLobby onJoin={handleJoinLobby} />;
  }

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 600 }}>
      <LobbyDetails
        lobbyId={lobbyId}
        lobbyName={lobby?.lobby_name}
        lobbyUrl={lobbyUrl}
      />

      <LobbyParticipants
        participants={lobby.participants}
        currentUser={user}
        toggleReady={toggleReady}
      />

      <LobbyActions
        currentUser={user}
        newDisplayName={newDisplayName}
        setNewDisplayName={setNewDisplayName}
        updateDisplayName={updateDisplayName}
        leaveLobby={() => {
          leaveLobby();
          navigate('/lobby');
        }}
        toggleTeam={toggleTeam}
        requestTeamLead={requestTeamLead}
        demoteTeamLead={demoteTeamLead}
        isUserTeamLead={isUserTeamLead}
        hasTeamLead={hasTeamLead}
      />
    </Box>
  );
};

export default Lobby;
