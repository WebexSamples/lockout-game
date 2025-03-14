// frontend/src/components/__tests__/LobbyParticipants.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import LobbyParticipants from '../LobbyParticipants';
import { renderWithLobbyContext } from '../../test/testUtils';
import { TEAMS, TEAM_LABELS } from '../../constants';

// ✅ Mock TeamTable to isolate behavior
vi.mock('../TeamTable', () => ({
  default: ({ teamLabel, participants, currentUser, toggleReady }) => (
    <div data-testid={`team-${teamLabel}`}>
      <div>Label: {teamLabel}</div>
      <div>Count: {participants.length}</div>
      <div>Current User: {currentUser?.display_name}</div>
      <button onClick={toggleReady}>Mock Ready</button>
    </div>
  ),
}));

describe('LobbyParticipants', () => {
  it('renders TeamTable for both teams with correct data', () => {
    const mockUser = { id: 'user-1', display_name: 'Alice' };

    const participants = [
      { id: 'user-1', display_name: 'Alice', team: TEAMS.TEAM1 },
      { id: 'user-2', display_name: 'Bob', team: TEAMS.TEAM2 },
      { id: 'user-3', display_name: 'Charlie', team: TEAMS.TEAM2 },
    ];

    const context = {
      lobby: {
        participants,
      },
      user: mockUser,
      toggleReady: vi.fn(),
    };

    renderWithLobbyContext(<LobbyParticipants />, context);

    // ✅ Check both team labels exist
    expect(
      screen.getByTestId(`team-${TEAM_LABELS[TEAMS.TEAM1]}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`team-${TEAM_LABELS[TEAMS.TEAM2]}`),
    ).toBeInTheDocument();

    // ✅ Check participant count per team
    expect(screen.getByText(/Label: Team 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();

    expect(screen.getByText(/Label: Team 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Count: 2/i)).toBeInTheDocument();

    // ✅ Verify current user is passed
    expect(screen.getAllByText(/Current User: Alice/i)).toHaveLength(2);
  });

  it('calls toggleReady when mock button is clicked', () => {
    const toggleReady = vi.fn();

    const context = {
      lobby: {
        participants: [],
      },
      user: { id: 'user-1', display_name: 'Alice' },
      toggleReady,
    };

    renderWithLobbyContext(<LobbyParticipants />, context);

    const readyButtons = screen.getAllByRole('button', { name: /Mock Ready/i });
    readyButtons.forEach((btn) => {
      btn.click();
    });

    // ✅ Should call toggleReady for each button (we mocked 2 tables)
    expect(toggleReady).toHaveBeenCalledTimes(2);
  });
});
