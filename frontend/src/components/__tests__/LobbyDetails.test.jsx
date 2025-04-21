// frontend/src/components/__tests__/LobbyDetails.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import LobbyDetails from '../LobbyDetails';
import { renderWithLobbyContext } from '../../test/testUtils';
import useWebex from '../../hooks/useWebex';

vi.mock('../../hooks/useWebex');

// ✅ Shared context value
const baseContext = {
  lobby: {
    lobby_name: 'Mock Lobby Name',
    lobbyId: 'lobby123',
    participants: [],
  },
  lobbyUrl: 'http://localhost/lobby/lobby123',
};

describe('LobbyDetails', () => {
  it('renders lobby name, ID, and URL', () => {
    useWebex.mockReturnValue({
      isShared: false,
      isRunningInWebex: true,
      toggleShare: vi.fn(),
    });

    renderWithLobbyContext(<LobbyDetails />, baseContext);

    expect(screen.getByText(/Mock Lobby Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Game ID:/i)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      baseContext.lobbyUrl,
    );
  });

  it('shows shared state as "Inactive ❌" when not shared', () => {
    useWebex.mockReturnValue({
      isShared: false,
      isRunningInWebex: true,
      toggleShare: vi.fn(),
    });

    renderWithLobbyContext(<LobbyDetails />, baseContext);
    expect(screen.getByText(/Lobby Sharing:/i)).toBeInTheDocument();
    expect(screen.getByText(/Inactive ❌/i)).toBeInTheDocument();
  });

  it('shows shared state as "Active ✅" when shared', () => {
    useWebex.mockReturnValue({
      isShared: true,
      isRunningInWebex: true,
      toggleShare: vi.fn(),
    });

    renderWithLobbyContext(<LobbyDetails />, baseContext);
    expect(screen.getByText(/Active ✅/i)).toBeInTheDocument();
  });

  it('disables share button when not running in Webex', () => {
    useWebex.mockReturnValue({
      isShared: false,
      isRunningInWebex: false,
      toggleShare: vi.fn(),
    });

    renderWithLobbyContext(<LobbyDetails />, baseContext);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/only available inside Webex/i),
    ).toBeInTheDocument();
  });

  it('calls toggleShare on share button click', () => {
    const toggleShare = vi.fn();
    useWebex.mockReturnValue({
      isShared: false,
      isRunningInWebex: true,
      toggleShare,
    });

    renderWithLobbyContext(<LobbyDetails />, baseContext);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(toggleShare).toHaveBeenCalledWith(baseContext.lobbyUrl);
  });
});
