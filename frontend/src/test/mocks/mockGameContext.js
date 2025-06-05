// frontend/src/test/mocks/mockGameContext.js

import { vi } from 'vitest';
import { TEAMS, GAME_PHASE } from '../../constants';

/**
 * Creates a default game state object for testing
 */
export const createMockGameState = (overrides = {}) => ({
  activeTeam: TEAMS.TEAM1,
  gamePhase: GAME_PHASE.KEYWORD_ENTRY,
  activeKeyword: null,
  board: Array(25)
    .fill(null)
    .map((_, i) => ({
      id: i,
      word: `Test Word ${i}`,
      revealed: false,
      team: i % 3 === 0 ? TEAMS.TEAM1 : i % 3 === 1 ? TEAMS.TEAM2 : null,
    })),
  teamData: {
    [TEAMS.TEAM1]: { remainingCards: 9 },
    [TEAMS.TEAM2]: { remainingCards: 8 },
  },
  winner: null,
  gameStartedAt: new Date().toISOString(),
  roundNumber: 1,
  ...overrides,
});

/**
 * Returns a mock value to be passed into GameContext.Provider.
 * You can override parts in individual tests.
 */
export const createMockGameContext = (overrides = {}) => ({
  gameState: createMockGameState(),
  notification: null,
  handleSubmitKeyword: vi.fn(),
  handleEndTurn: vi.fn(),
  handleCloseNotification: vi.fn(),
  ...overrides,
});
