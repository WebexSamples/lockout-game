// frontend/src/components/__tests__/Game.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';
import { renderWithLobbyContext } from '../../test/testUtils';
import Game from '../Game';

// Mock GameContent component to simplify testing the wrapper
vi.mock('../GameContent', () => ({
  default: ({ endGame, isUserHost, lobby, user }) => (
    <div data-testid="game-content">
      <p>Game Content Mock</p>
      <button data-testid="mock-end-game-btn" onClick={endGame}>
        Mock End Game
      </button>
      <div data-testid="props-check">
        <span data-testid="is-host">{isUserHost ? 'true' : 'false'}</span>
        <span data-testid="user-id">{user?.id}</span>
        <span data-testid="lobby-id">{lobby?.id}</span>
      </div>
    </div>
  ),
}));

// Mock GameProvider to avoid socket connection issues in tests
vi.mock('../../context/GameProvider', () => ({
  GameProvider: ({ children, socket, lobbyId, user }) => (
    <div data-testid="game-provider">
      <div data-testid="provider-props">
        <span data-testid="provider-lobby-id">{lobbyId}</span>
        <span data-testid="provider-user-id">{user?.id}</span>
        <span data-testid="has-socket">{socket ? 'true' : 'false'}</span>
      </div>
      {children}
    </div>
  ),
}));

describe('Game (Wrapper)', () => {
  it('renders the GameContent component with GameProvider', () => {
    const mockContext = createMockLobbyContext({
      lobby: { id: 'test-lobby-123' },
      user: { id: 'test-user-123', display_name: 'Test User' },
      socket: { on: vi.fn(), emit: vi.fn() },
    });

    renderWithLobbyContext(<Game />, mockContext);

    // Check that GameProvider is rendered with correct props
    expect(screen.getByTestId('game-provider')).toBeInTheDocument();
    expect(screen.getByTestId('provider-lobby-id')).toHaveTextContent(
      'test-lobby-123',
    );
    expect(screen.getByTestId('provider-user-id')).toHaveTextContent(
      'test-user-123',
    );
    expect(screen.getByTestId('has-socket')).toHaveTextContent('true');

    // Check that GameContent is rendered
    expect(screen.getByTestId('game-content')).toBeInTheDocument();
  });

  it('passes correct props to GameContent', () => {
    const endGame = vi.fn();
    const getCurrentTeam = vi.fn();

    const mockContext = createMockLobbyContext({
      endGame,
      getCurrentTeam,
      lobby: {
        id: 'lobby-123',
        participants: [
          { id: 'user-123', display_name: 'Test User', is_host: true },
        ],
      },
      user: { id: 'user-123', display_name: 'Test User' },
    });

    renderWithLobbyContext(<Game />, mockContext);

    // Check user is host properly determined from participants array
    expect(screen.getByTestId('is-host')).toHaveTextContent('true');
    expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
    expect(screen.getByTestId('lobby-id')).toHaveTextContent('lobby-123');

    // Test endGame function forwarding
    screen.getByTestId('mock-end-game-btn').click();
    expect(endGame).toHaveBeenCalled();
  });

  it('properly handles non-host users', () => {
    const mockContext = createMockLobbyContext({
      lobby: {
        id: 'lobby-456',
        participants: [
          { id: 'host-789', display_name: 'The Host', is_host: true },
          { id: 'user-456', display_name: 'Regular User', is_host: false },
        ],
      },
      user: { id: 'user-456', display_name: 'Regular User' },
    });

    renderWithLobbyContext(<Game />, mockContext);

    // User should not be identified as host
    expect(screen.getByTestId('is-host')).toHaveTextContent('false');
  });
});
