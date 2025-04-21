// frontend/src/components/__tests__/HostControls.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';
import { renderWithLobbyContext } from '../../test/testUtils';
import HostControls from '../HostControls';
import { TEAMS } from '../../constants';

describe('HostControls', () => {
  // Test scenarios
  describe('Visibility and Host-specific functionality', () => {
    it('displays game criteria chips for all users', () => {
      // Create a mock with a non-host user
      const nonHostContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(false),
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, nonHostContext);

      // All chips should be visible even for non-hosts
      expect(screen.getByText('Team 1: 2+ players')).toBeInTheDocument();
      expect(screen.getByText('Team 2: 2+ players')).toBeInTheDocument();
      expect(screen.getByText('Team 1 Hacker')).toBeInTheDocument();
      expect(screen.getByText('Team 2 Hacker')).toBeInTheDocument();
      expect(screen.getByText('All Ready')).toBeInTheDocument();
    });

    it('shows security controls button only for hosts', () => {
      // Create a mock with a host user
      const hostContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, hostContext);

      // Host should see the start button
      expect(
        screen.getByRole('button', { name: /Override Protocols/i }),
      ).toBeInTheDocument();
    });

    it('hides security controls button for non-hosts', () => {
      // Create a mock with a non-host user
      const nonHostContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(false),
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, nonHostContext);

      // Non-host should not see the start button
      expect(
        screen.queryByRole('button', {
          name: /Launch Operation|Override Protocols/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Game start criteria indicators', () => {
    it('displays correct status when all criteria are met', () => {
      const mockContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
              is_team_lead: true,
              ready: true,
            },
            {
              id: 'user2',
              display_name: 'User 2',
              team: TEAMS.TEAM1,
              ready: true,
            },
            {
              id: 'user3',
              display_name: 'User 3',
              team: TEAMS.TEAM2,
              is_team_lead: true,
              ready: true,
            },
            {
              id: 'user4',
              display_name: 'User 4',
              team: TEAMS.TEAM2,
              ready: true,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, mockContext);

      // All check indicators should be success icons (5 in total)
      const successIcons = screen.getAllByTestId('CheckCircleIcon');
      expect(successIcons.length).toBe(5);

      // Button should say "Launch Operation" not "Override Protocols"
      expect(
        screen.getByRole('button', { name: /Launch Operation/i }),
      ).toBeInTheDocument();
    });

    it('displays correct status when criteria are not met', () => {
      const mockContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
              ready: true,
            },
            {
              id: 'user2',
              display_name: 'User 2',
              team: TEAMS.TEAM2,
              ready: false,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, mockContext);

      // Should see error icons
      const errorIcons = screen.getAllByTestId('ErrorIcon');
      expect(errorIcons.length).toBeGreaterThan(0);

      // Button should say "Override Protocols" not "Launch Operation"
      expect(
        screen.getByRole('button', { name: /Override Protocols/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Game start actions', () => {
    it('calls startGame when all criteria are met', () => {
      const startGame = vi.fn();
      const forceStartGame = vi.fn();

      const mockContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        startGame,
        forceStartGame,
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
              is_team_lead: true,
              ready: true,
            },
            {
              id: 'user2',
              display_name: 'User 2',
              team: TEAMS.TEAM1,
              ready: true,
            },
            {
              id: 'user3',
              display_name: 'User 3',
              team: TEAMS.TEAM2,
              is_team_lead: true,
              ready: true,
            },
            {
              id: 'user4',
              display_name: 'User 4',
              team: TEAMS.TEAM2,
              ready: true,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, mockContext);

      const startButton = screen.getByRole('button', {
        name: /Launch Operation/i,
      });
      fireEvent.click(startButton);

      expect(startGame).toHaveBeenCalled();
      expect(forceStartGame).not.toHaveBeenCalled();
    });

    it('shows confirmation dialog when using Override Protocols', async () => {
      const startGame = vi.fn();
      const forceStartGame = vi.fn();

      const mockContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        startGame,
        forceStartGame,
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
              ready: true,
            },
            {
              id: 'user2',
              display_name: 'User 2',
              team: TEAMS.TEAM2,
              ready: false,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, mockContext);

      const forceStartButton = screen.getByRole('button', {
        name: /Override Protocols/i,
      });
      fireEvent.click(forceStartButton);

      // Dialog should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText(/Override Security Protocols/i),
      ).toBeInTheDocument();

      // Dialog should list issues
      expect(
        screen.getByText(/Team 1 has fewer than 2 players/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Team 2 has fewer than 2 players/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Not all players are ready/i),
      ).toBeInTheDocument();

      // Confirm force start
      const confirmButton = screen.getByRole('button', {
        name: /Execute Override/i,
      });
      fireEvent.click(confirmButton);

      expect(forceStartGame).toHaveBeenCalled();
      expect(startGame).not.toHaveBeenCalled();
    });

    it('cancels force start when dialog is dismissed', async () => {
      const startGame = vi.fn();
      const forceStartGame = vi.fn();

      const mockContext = createMockLobbyContext({
        isUserHost: vi.fn().mockReturnValue(true),
        startGame,
        forceStartGame,
        lobby: {
          participants: [
            {
              id: 'user1',
              display_name: 'User 1',
              team: TEAMS.TEAM1,
              is_host: true,
              ready: true,
            },
            {
              id: 'user2',
              display_name: 'User 2',
              team: TEAMS.TEAM2,
              ready: false,
            },
          ],
        },
      });

      renderWithLobbyContext(<HostControls />, mockContext);

      const forceStartButton = screen.getByRole('button', {
        name: /Override Protocols/i,
      });
      fireEvent.click(forceStartButton);

      // Dialog should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Cancel force start
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(forceStartGame).not.toHaveBeenCalled();
      expect(startGame).not.toHaveBeenCalled();

      // Wait for dialog to be closed - the state update might be asynchronous
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
