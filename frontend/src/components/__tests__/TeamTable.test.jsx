import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import TeamTable from '../TeamTable';
import { renderWithLobbyContext } from '../../test/testUtils';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';
import { TEAMS } from '../../constants';

describe('TeamTable', () => {
  const teamLabel = 'Team 1';

  const participants = [
    {
      id: 'user-1',
      display_name: 'Alice',
      team: TEAMS.TEAM1,
      is_ready: false,
      is_team_lead: true,
      is_host: false,
    },
    {
      id: 'user-2',
      display_name: 'Bob',
      team: TEAMS.TEAM1,
      is_ready: true,
      is_team_lead: false,
      is_host: true,
    },
    {
      id: 'user-3',
      display_name: 'Charlie',
      team: TEAMS.TEAM1,
      is_ready: false,
      is_team_lead: false,
      is_host: false,
    },
  ];

  it('renders all participants', () => {
    const context = createMockLobbyContext({
      user: { id: 'user-2', display_name: 'Bob' },
    });

    renderWithLobbyContext(
      <TeamTable
        teamLabel={teamLabel}
        participants={participants}
        currentUser={context.user}
        toggleReady={context.toggleReady}
      />,
      context,
    );

    // ✅ Use flexible matchers to allow for "(You)" suffix
    expect(
      screen.getByText((text) => text.includes('Alice')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes('Bob')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes('Charlie')),
    ).toBeInTheDocument();
  });

  it('highlights current user and shows "You"', () => {
    const context = createMockLobbyContext({
      user: { id: 'user-3', display_name: 'Charlie' },
    });

    renderWithLobbyContext(
      <TeamTable
        teamLabel={teamLabel}
        participants={participants}
        currentUser={context.user}
        toggleReady={context.toggleReady}
      />,
      context,
    );

    expect(
      screen.getByText((text) => text.includes('Charlie')),
    ).toBeInTheDocument();
    expect(screen.getByText(/You/i)).toBeInTheDocument();
  });

  it('calls toggleReady when current user clicks "Ready"', () => {
    const toggleReady = vi.fn();
    const context = createMockLobbyContext({
      user: { id: 'user-1', display_name: 'Alice' },
    });

    renderWithLobbyContext(
      <TeamTable
        teamLabel={teamLabel}
        participants={participants}
        currentUser={context.user}
        toggleReady={toggleReady}
      />,
      context,
    );

    fireEvent.click(screen.getByRole('button', { name: /Ready/i }));
    expect(toggleReady).toHaveBeenCalled();
  });

  it('shows team lead and host badges', () => {
    const context = createMockLobbyContext();

    renderWithLobbyContext(
      <TeamTable
        teamLabel={teamLabel}
        participants={participants}
        currentUser={context.user}
        toggleReady={context.toggleReady}
      />,
      context,
    );

    expect(screen.getAllByLabelText(/Team Lead/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/Host/i)).toHaveLength(1);
  });

  it('shows ready status check icon for ready players', () => {
    const context = createMockLobbyContext();

    renderWithLobbyContext(
      <TeamTable
        teamLabel={teamLabel}
        participants={participants}
        currentUser={context.user}
        toggleReady={context.toggleReady}
      />,
      context,
    );

    expect(screen.getAllByLabelText(/Ready/i).length).toBeGreaterThan(0);
  });
});
