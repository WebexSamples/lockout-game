// frontend/src/test/mocks/mockUseWebex.js

import { vi } from 'vitest';

const mockWebexState = {
  isLoading: false,
  isConnected: true,
  isRunningInWebex: true,
  username: 'TestUser',
  meetingName: 'Test Meeting',
  error: null,
  isShared: false,
  toggleShare: vi.fn(),
};

export const setMockWebexState = (overrides = {}) => {
  Object.assign(mockWebexState, overrides);
};

// Default mock (used by setup.js)
vi.mock('../../hooks/useWebex', () => {
  return {
    default: () => mockWebexState,
  };
});

// Make available for test override
globalThis.setMockWebexState = setMockWebexState;
