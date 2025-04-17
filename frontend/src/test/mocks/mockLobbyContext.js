// frontend/src/test/mocks/mockLobbyContext.js

import { vi } from 'vitest';

/**
 * Returns a mock value to be passed into LobbyContext.Provider.
 * You can override parts in individual tests.
 */
export const createMockLobbyContext = (overrides = {}) => ({
  lobby: { lobby_name: 'Test Lobby', participants: [] },
  lobbyUrl: 'http://localhost/lobby/mock',
  loading: false,
  joined: true,
  joinLobby: vi.fn(),
  leaveLobby: vi.fn(),
  toggleReady: vi.fn(),
  updateDisplayName: vi.fn(),
  toggleTeam: vi.fn(),
  requestTeamLead: vi.fn(),
  demoteTeamLead: vi.fn(),
  isUserTeamLead: vi.fn(() => false),
  hasTeamLead: vi.fn(() => false),
  getCurrentTeam: vi.fn(() => overrides.userTeam || null),
  user: { id: 'user1', display_name: 'TestUser' },
  setUser: vi.fn(),
  ...overrides,
});
