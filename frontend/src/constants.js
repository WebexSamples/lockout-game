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

  // Game events
  GAME_UPDATE: 'game:update',
  GAME_ERROR: 'game:error',
  GAME_JOIN: 'join_game',
  GAME_LEAVE: 'leave_game',
  GAME_SUBMIT_KEYWORD: 'game:submit_keyword',
  GAME_SUBMIT_GUESS: 'game:submit_guess',
  GAME_SELECT_CARD: 'game:select_card',
  GAME_CARD_SELECTION_UPDATE: 'game:card_selection_update',
  GAME_END_TURN: 'end_turn',
};

// Team constants
export const TEAMS = {
  TEAM1: 'team1',
  TEAM2: 'team2',
};

// Card types
export const CARD_TYPES = {
  TEAM1_CARD: 'team1_card', // Previously 'bluewave'
  TEAM2_CARD: 'team2_card', // Previously 'redshift'
  PENALTY: 'penalty', // Previously 'trap'
  NEUTRAL: 'neutral', // Previously 'honeypot'
};

// Field names to match backend constants
export const FIELDS = {
  IS_TEAM_LEAD: 'is_team_lead',
  TEAM: 'team',
};

export const TEAM_LABELS = {
  [TEAMS.TEAM1]: 'Team 1 (Bluewave)',
  [TEAMS.TEAM2]: 'Team 2 (Redshift)',
};

// Game phases
export const GAME_PHASE = {
  KEYWORD_ENTRY: 'keyword_entry', // Previously 'hacker_prompt'
  TEAM_GUESSING: 'team_guessing', // Previously 'agent_guessing'
  REVEAL_RESULTS: 'reveal_results',
  TURN_END: 'turn_end',
};

// Route constants
export const ROUTES = {
  HOME: '/',
  GAME: '/game',
  GAME_WITH_ID: (lobbyId) => `/game/${lobbyId}`,
  ABOUT: '/about',
};
