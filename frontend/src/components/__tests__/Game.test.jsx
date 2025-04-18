// frontend/src/components/__tests__/Game.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { createMockLobbyContext } from '../../test/mocks/mockLobbyContext';
import { renderWithLobbyContext } from '../../test/testUtils';
import Game from '../Game';

describe('Game', () => {
  describe('Game UI', () => {
    it('renders game in progress message', () => {
      const mockContext = createMockLobbyContext();
      renderWithLobbyContext(<Game />, mockContext);

      expect(screen.getByText(/Game In Progress/i)).toBeInTheDocument();
      expect(
        screen.getByText(/The Lockout game is currently in progress/i),
      ).toBeInTheDocument();
    });
  });

  describe('Host functionality', () => {
    it('shows end game button for the host', () => {
      const endGame = vi.fn();
      const mockHostContext = createMockLobbyContext({
        isUserHost: vi.fn(() => true),
        endGame,
      });

      renderWithLobbyContext(<Game />, mockHostContext);

      const endButton = screen.getByRole('button', {
        name: /End Game & Return to Lobby/i,
      });
      expect(endButton).toBeInTheDocument();

      // Test button action
      fireEvent.click(endButton);
      expect(endGame).toHaveBeenCalled();
    });

    it('hides end game button for non-host users', () => {
      const mockNonHostContext = createMockLobbyContext({
        isUserHost: vi.fn(() => false),
        lobby: {
          participants: [
            { id: 'host123', display_name: 'The Host', is_host: true },
          ],
        },
      });

      renderWithLobbyContext(<Game />, mockNonHostContext);

      // Button should not be visible
      expect(
        screen.queryByRole('button', { name: /End Game/i }),
      ).not.toBeInTheDocument();

      // Should show info message instead
      expect(screen.getByText(/Only the host/i)).toBeInTheDocument();
      expect(screen.getByText(/The Host/i)).toBeInTheDocument();
    });
  });
});
