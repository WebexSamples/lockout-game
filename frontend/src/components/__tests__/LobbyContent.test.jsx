// frontend/src/components/__tests__/LobbyContent.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import LobbyContent from '../LobbyContent';
import { renderWithLobbyContext } from '../../test/testUtils';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';

describe('LobbyContent', () => {
  it('shows loading state when loading is true', () => {
    const ctx = createMockLobbyContext({ loading: true });
    renderWithLobbyContext(<LobbyContent />, ctx);

    expect(screen.getByText(/Loading lobby/i)).toBeInTheDocument();
  });

  it('renders JoinLobby screen when user is missing', () => {
    const ctx = createMockLobbyContext({
      user: null,
      joined: false,
    });
    renderWithLobbyContext(<LobbyContent />, ctx);

    // ✅ More precise: label for the input field (from JoinLobby)
    expect(
      screen.getByLabelText(/Enter your display name/i),
    ).toBeInTheDocument();
  });

  it('calls joinLobby automatically if user exists and not joined', () => {
    const joinLobby = vi.fn();
    const ctx = createMockLobbyContext({
      joined: false,
      user: { id: 'user123', display_name: 'AgentX' },
      joinLobby,
    });

    renderWithLobbyContext(<LobbyContent />, ctx);

    expect(joinLobby).toHaveBeenCalledWith({
      id: 'user123',
      display_name: 'AgentX',
    });
  });

  it('renders LobbyDetails, LobbyParticipants, and LobbyActions when joined', () => {
    const ctx = createMockLobbyContext({ joined: true });
    renderWithLobbyContext(<LobbyContent />, ctx);

    // These confirm all core subcomponents rendered
    expect(screen.getByText(/Lobby ID:/i)).toBeInTheDocument(); // LobbyDetails
    expect(screen.getByText(/Your Actions/i)).toBeInTheDocument(); // LobbyActions
    expect(screen.getByText(/Team 1/i)).toBeInTheDocument(); // LobbyParticipants
    expect(screen.getByText(/Team 2/i)).toBeInTheDocument();
  });
});
