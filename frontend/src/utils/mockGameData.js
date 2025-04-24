// src/utils/mockGameData.js
import { TEAMS } from '../constants';

/**
 * Game turn phases
 */
export const GAME_PHASE = {
  HACKER_PROMPT: 'hacker_prompt',  // Hacker provides a prompt
  AGENT_GUESSING: 'agent_guessing', // Agents make guesses based on the prompt
  REVEAL_RESULTS: 'reveal_results', // Results are shown
  TURN_END: 'turn_end'             // Turn ends, next team's turn begins
};

/**
 * Mock game data - will be replaced with backend data later
 */
export const MOCK_GAME_STATE = {
  activeTeam: TEAMS.TEAM1,
  roundNumber: 1,
  gamePhase: GAME_PHASE.HACKER_PROMPT,
  teamData: {
    [TEAMS.TEAM1]: {
      dataFragments: 5,
    },
    [TEAMS.TEAM2]: {
      dataFragments: 5,
    }
  },
  gameStartedAt: new Date().toISOString(),
  activePrompt: null   // Stores the current prompt from the hacker
};