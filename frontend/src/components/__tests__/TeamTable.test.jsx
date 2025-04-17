import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import TeamTable from '../TeamTable';
import { renderWithLobbyContext } from '../../test/testUtils';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';
import { TEAMS } from '../../constants';

const teamLabel = 'Team 1';

describe('TeamTable', () => {
  describe('Current User Scenarios', () => {
    it('renders Not Ready icon button when current user is not ready', () => {
      const toggleReady = vi.fn();
      const currentUser = { id: 'user-1', display_name: 'Alice' };
      const context = createMockLobbyContext({ user: currentUser });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={currentUser}
          toggleReady={toggleReady}
        />,
        context,
      );

      const button = screen.getByRole('button', { name: /Not Ready/i });
      expect(button).toBeInTheDocument();
      expect(button.tagName.toLowerCase()).toBe('button');
      fireEvent.click(button);
      expect(toggleReady).toHaveBeenCalled();
    });

    it('renders Ready icon button when current user is ready', () => {
      const toggleReady = vi.fn();
      const currentUser = { id: 'user-1', display_name: 'Alice' };
      const context = createMockLobbyContext({ user: currentUser });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: true,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={currentUser}
          toggleReady={toggleReady}
        />,
        context,
      );

      const button = screen.getByRole('button', { name: /Ready/i });
      expect(button).toBeInTheDocument();
      expect(button.tagName.toLowerCase()).toBe('button');
      fireEvent.click(button);
      expect(toggleReady).toHaveBeenCalled();
    });

    it('shows display name and (You) label for current user', () => {
      const context = createMockLobbyContext({
        user: { id: 'user-3', display_name: 'Charlie' },
      });

      const participants = [
        {
          id: 'user-3',
          display_name: 'Charlie',
          team: TEAMS.TEAM1,
          ready: false,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={context.user}
          toggleReady={context.toggleReady}
        />,
        context,
      );

      expect(screen.getByText(/Charlie/i)).toBeInTheDocument();
      expect(screen.getByText(/You/i)).toBeInTheDocument();
    });
  });

  describe('Non-Current User Scenarios', () => {
    it('renders static Ready icon for non-current user when ready', () => {
      const context = createMockLobbyContext({
        user: { id: 'user-3', display_name: 'Charlie' },
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: true,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={context.user}
          toggleReady={context.toggleReady}
        />,
        context,
      );

      const icon = screen.getByLabelText(/Ready/i);
      expect(icon.tagName.toLowerCase()).toBe('svg');
    });

    it('renders static Not Ready icon for non-current user when not ready', () => {
      const context = createMockLobbyContext({
        user: { id: 'user-3', display_name: 'Charlie' },
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={context.user}
          toggleReady={context.toggleReady}
        />,
        context,
      );

      const icon = screen.getByLabelText(/Not Ready/i);
      expect(icon.tagName.toLowerCase()).toBe('svg');
    });
  });

  describe('General TeamTable UI', () => {
    it('renders all participant names', () => {
      const context = createMockLobbyContext({
        user: { id: 'user-2', display_name: 'Bob' },
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
        },
        {
          id: 'user-2',
          display_name: 'Bob',
          team: TEAMS.TEAM1,
          ready: true,
        },
        {
          id: 'user-3',
          display_name: 'Charlie',
          team: TEAMS.TEAM1,
          ready: false,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={context.user}
          toggleReady={context.toggleReady}
        />,
        context,
      );

      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      expect(screen.getByText(/Charlie/)).toBeInTheDocument();
    });

    it('shows team lead and host badges', () => {
      const context = createMockLobbyContext();

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
          is_team_lead: true,
          is_host: false,
        },
        {
          id: 'user-2',
          display_name: 'Bob',
          team: TEAMS.TEAM1,
          ready: true,
          is_team_lead: false,
          is_host: true,
        },
      ];

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
  });

  describe('Team Lead Actions', () => {
    it('shows Become Team Lead button when user is on the team but not a team lead', () => {
      const currentUser = { id: 'user-1', display_name: 'Alice' };
      const mockContext = createMockLobbyContext({
        user: currentUser,
        isUserTeamLead: vi.fn(() => false),
        hasTeamLead: vi.fn(() => false),
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
          is_team_lead: false,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={currentUser}
          toggleReady={vi.fn()}
          isCurrentUserTeam={true}
        />,
        mockContext,
      );

      const button = screen.getByRole('button', { name: /Become Team Lead/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(mockContext.requestTeamLead).toHaveBeenCalled();
    });

    it('shows Step Down button when user is on the team and is a team lead', () => {
      const currentUser = { id: 'user-1', display_name: 'Alice' };
      const mockContext = createMockLobbyContext({
        user: currentUser,
        isUserTeamLead: vi.fn(() => true),
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
          is_team_lead: true,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={currentUser}
          toggleReady={vi.fn()}
          isCurrentUserTeam={true}
        />,
        mockContext,
      );

      const button = screen.getByRole('button', { name: /Step Down/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(mockContext.demoteTeamLead).toHaveBeenCalled();
    });

    it('does not show Step Down button when user is not on the team', () => {
      const currentUser = { id: 'user-1', display_name: 'Alice' };
      const mockContext = createMockLobbyContext({
        user: currentUser,
        isUserTeamLead: vi.fn(() => true),
      });

      const participants = [
        {
          id: 'user-1',
          display_name: 'Alice',
          team: TEAMS.TEAM1,
          ready: false,
          is_team_lead: true,
        },
      ];

      renderWithLobbyContext(
        <TeamTable
          teamLabel={teamLabel}
          participants={participants}
          currentUser={currentUser}
          toggleReady={vi.fn()}
          isCurrentUserTeam={false}
        />,
        mockContext,
      );

      const stepDownButton = screen.queryByRole('button', {
        name: /Step Down/i,
      });
      expect(stepDownButton).not.toBeInTheDocument();

      const switchTeamButton = screen.getByRole('button', {
        name: /Switch Team/i,
      });
      expect(switchTeamButton).toBeInTheDocument();
    });
  });
});
