// frontend/src/components/__tests__/LobbyContent.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import LobbyContent from '../LobbyContent';
import { renderWithLobbyContext } from '../../test/testUtils';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';

// Mock child components to simplify testing
vi.mock('../LobbyDetails', () => ({
  default: () => <div data-testid="lobby-details">LobbyDetails Mock</div>,
}));

vi.mock('../LobbyParticipants', () => ({
  default: () => (
    <div data-testid="lobby-participants">LobbyParticipants Mock</div>
  ),
}));

vi.mock('../LobbyActions', () => ({
  default: () => <div data-testid="lobby-actions">LobbyActions Mock</div>,
}));

vi.mock('../HostControls', () => ({
  default: () => <div data-testid="host-controls">HostControls Mock</div>,
}));

vi.mock('../JoinLobby', () => ({
  default: ({ onJoin }) => (
    <div
      data-testid="join-lobby"
      onClick={() => onJoin({ id: 'test-id', display_name: 'Test User' })}
    >
      JoinLobby Mock
    </div>
  ),
}));

vi.mock('../Game', () => ({
  default: () => <div data-testid="game-view">Game Mock</div>,
}));

vi.mock('../../hooks/useWebex', () => ({
  default: () => ({
    webexData: { user: { id: 'webex-id', displayName: 'Webex User' } },
  }),
}));

describe('LobbyContent', () => {
  it('renders loading state initially', () => {
    const mockContext = createMockLobbyContext({ loading: true });
    renderWithLobbyContext(<LobbyContent />, mockContext);

    expect(screen.getByText(/Loading lobby.../i)).toBeInTheDocument();
  });

  it('renders JoinLobby when not joined', () => {
    const mockContext = createMockLobbyContext({
      loading: false,
      joined: false,
    });
    renderWithLobbyContext(<LobbyContent />, mockContext);

    expect(screen.getByTestId('join-lobby')).toBeInTheDocument();
  });

  it('renders all lobby components in correct order when joined', () => {
    const mockContext = createMockLobbyContext({
      loading: false,
      joined: true,
    });
    renderWithLobbyContext(<LobbyContent />, mockContext);

    // Check all components are rendered
    expect(screen.getByTestId('lobby-details')).toBeInTheDocument();
    expect(screen.getByTestId('lobby-participants')).toBeInTheDocument();
    expect(screen.getByTestId('lobby-actions')).toBeInTheDocument();
    expect(screen.getByTestId('host-controls')).toBeInTheDocument();

    // Check that HostControls appears after LobbyActions in the DOM
    const lobbyActionsIndex = screen
      .getByTestId('lobby-actions')
      .compareDocumentPosition(screen.getByTestId('host-controls'));

    // Flag 4 is set when the node follows the reference node
    expect(lobbyActionsIndex & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders Game component when game is started', () => {
    const mockContext = createMockLobbyContext({
      loading: false,
      joined: true,
      gameStarted: true,
    });

    renderWithLobbyContext(<LobbyContent />, mockContext);

    // Game should be rendered instead of lobby components
    expect(screen.getByTestId('game-view')).toBeInTheDocument();

    // Lobby components should not be rendered
    expect(screen.queryByTestId('lobby-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lobby-participants')).not.toBeInTheDocument();
    expect(screen.queryByTestId('host-controls')).not.toBeInTheDocument();
  });
});
