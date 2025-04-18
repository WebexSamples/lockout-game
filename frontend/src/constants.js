// Socket event constants
export const SOCKET_EVENTS = {
  LOBBY_JOIN: 'lobby:join',
  LOBBY_LEAVE: 'lobby:leave',
  LOBBY_UPDATE_DISPLAY_NAME: 'lobby:update_display_name',
  LOBBY_TOGGLE_READY: 'lobby:toggle_ready',
  LOBBY_UPDATE: 'lobby:update',
  LOBBY_ERROR: 'lobby:error',
  LOBBY_ASSIGN_TEAM_LEAD: 'lobby:assign_team_lead',
  LOBBY_DEMOTE_TEAM_LEAD: 'lobby:demote_team_lead',
  LOBBY_START_GAME: 'lobby:start_game',
  LOBBY_FORCE_START: 'lobby:force_start',
  LOBBY_CHANGE_TEAM: 'lobby:change_team',
  LOBBY_END_GAME: 'lobby:end_game',
};

// Team constants
export const TEAMS = {
  TEAM1: 'team1',
  TEAM2: 'team2',
};

export const TEAM_LABELS = {
  [TEAMS.TEAM1]: 'Team 1 (Bluewave)',
  [TEAMS.TEAM2]: 'Team 2 (Redshift)',
};

// Route constants
export const ROUTES = {
  HOME: '/',
  LOBBY: '/lobby',
  LOBBY_WITH_ID: (lobbyId) => `/lobby/${lobbyId}`,
};
