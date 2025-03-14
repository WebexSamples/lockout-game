// frontend/src/test/mocks/mockApi.js

import { vi } from 'vitest';

const mockCreateLobby = vi.fn();

vi.mock('../../utils/api', () => {
  return {
    default: {
      createLobby: mockCreateLobby,
    },
  };
});

globalThis.mockCreateLobby = mockCreateLobby;
