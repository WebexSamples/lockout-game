// frontend/src/components/__tests__/Lobby.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import Lobby from '../Lobby';
import { renderWithRouter } from '../../test/testUtils';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

vi.mock('../LobbyContent', () => ({
  default: () => (
    <div data-testid="mock-lobby-content">Lobby Content Rendered</div>
  ),
}));

describe('Lobby', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders LobbyContent inside LobbyProvider when initialUser is provided', () => {
    const lobbyId = 'abc123';
    const initialUser = { id: 'user1', display_name: 'TestUser' };

    renderWithRouter(<Lobby />, `/game/${lobbyId}`, { user: initialUser });

    expect(screen.getByTestId('mock-lobby-content')).toBeInTheDocument();
  });

  it('renders LobbyContent inside LobbyProvider with null initialUser fallback', () => {
    const lobbyId = 'abc456';

    renderWithRouter(<Lobby />, `/game/${lobbyId}`);

    expect(screen.getByTestId('mock-lobby-content')).toBeInTheDocument();
  });
});
