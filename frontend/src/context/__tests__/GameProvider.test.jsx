// frontend/src/context/__tests__/GameProvider.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, act, fireEvent } from '@testing-library/react';
import { GameProvider } from '../GameProvider';
import { GameContext } from '../GameContext';
import { SOCKET_EVENTS, TEAMS, GAME_PHASE } from '../../constants';

// Create mock socket
const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
const mockSocketEmit = vi.fn();
const mockSocket = {
  on: mockSocketOn,
  off: mockSocketOff,
  emit: mockSocketEmit,
};

// Mock console methods to prevent noise in test output
console.log = vi.fn();
console.error = vi.fn();

describe('GameProvider', () => {
  let mockSocketEvents = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Update on method to store event handlers
    mockSocketOn.mockImplementation((event, handler) => {
      mockSocketEvents[event] = handler;
    });
  });

  it('provides initial game state through context', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div>
          <div data-testid="active-team">{context.gameState.activeTeam}</div>
          <div data-testid="game-phase">{context.gameState.gamePhase}</div>
          <div data-testid="has-board">
            {context.gameState.board ? 'yes' : 'no'}
          </div>
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Check initial state
    expect(screen.getByTestId('active-team')).toHaveTextContent(TEAMS.TEAM1);
    expect(screen.getByTestId('game-phase')).toHaveTextContent(
      GAME_PHASE.KEYWORD_ENTRY,
    );
    expect(screen.getByTestId('has-board')).toHaveTextContent('yes');

    // Verify socket connection was made
    expect(mockSocketEmit).toHaveBeenCalledWith(SOCKET_EVENTS.GAME_JOIN, {
      lobby_id: 'test-lobby',
      user_id: 'user-123',
    });
  });

  it('updates game state when receiving GAME_UPDATE socket event', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div>
          <div data-testid="active-team">{context.gameState.activeTeam}</div>
          <div data-testid="game-phase">{context.gameState.gamePhase}</div>
          <div data-testid="team1-remaining">
            {context.gameState.teamData[TEAMS.TEAM1].remainingCards}
          </div>
          <div data-testid="team2-remaining">
            {context.gameState.teamData[TEAMS.TEAM2].remainingCards}
          </div>
          {context.gameState.activeKeyword && (
            <div data-testid="active-keyword">
              {context.gameState.activeKeyword.word}
            </div>
          )}
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Initial values
    expect(screen.getByTestId('active-team')).toHaveTextContent(TEAMS.TEAM1);
    expect(screen.getByTestId('team1-remaining')).toHaveTextContent('0');
    expect(screen.getByTestId('team2-remaining')).toHaveTextContent('0');
    expect(screen.queryByTestId('active-keyword')).not.toBeInTheDocument();

    // Simulate receiving game update event
    await act(async () => {
      if (mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]) {
        mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]({
          active_team: TEAMS.TEAM2,
          game_phase: GAME_PHASE.TEAM_GUESSING,
          active_keyword: {
            word: 'password',
            point_count: 3,
            team: TEAMS.TEAM2,
          },
          board: Array(25)
            .fill(null)
            .map((_, i) => ({
              id: i,
              word: `card-${i}`,
              revealed: false,
              team:
                i % 3 === 0 ? TEAMS.TEAM1 : i % 3 === 1 ? TEAMS.TEAM2 : null,
            })),
          team_data: {
            [TEAMS.TEAM1]: { remaining_cards: 7 },
            [TEAMS.TEAM2]: { remaining_cards: 8 },
          },
          round_number: 1,
        });
      }
    });

    // Updated values
    expect(screen.getByTestId('active-team')).toHaveTextContent(TEAMS.TEAM2);
    expect(screen.getByTestId('game-phase')).toHaveTextContent(
      GAME_PHASE.TEAM_GUESSING,
    );
    expect(screen.getByTestId('team1-remaining')).toHaveTextContent('7');
    expect(screen.getByTestId('team2-remaining')).toHaveTextContent('8');
    expect(screen.getByTestId('active-keyword')).toHaveTextContent('password');
  });

  it('shows notification when a team lead submits a keyword', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div>
          <div data-testid="notification">
            {context.notification
              ? context.notification.message
              : 'No notification'}
          </div>
          <button
            data-testid="close-notification"
            onClick={context.handleCloseNotification}
          >
            Close
          </button>
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Initial state should have no notification
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'No notification',
    );

    // Simulate a team lead submitting a keyword
    await act(async () => {
      if (mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]) {
        mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]({
          active_team: TEAMS.TEAM1,
          game_phase: GAME_PHASE.TEAM_GUESSING,
          active_keyword: {
            word: 'network',
            point_count: 3,
            team: TEAMS.TEAM1,
          },
          board: [],
          team_data: {
            [TEAMS.TEAM1]: { remaining_cards: 9 },
            [TEAMS.TEAM2]: { remaining_cards: 8 },
          },
        });
      }
    });

    // Should show notification about the keyword
    expect(screen.getByTestId('notification')).toHaveTextContent(
      /Team 1 Team Lead has provided the keyword/,
    );
    expect(screen.getByTestId('notification')).toHaveTextContent(/network/);
    expect(screen.getByTestId('notification')).toHaveTextContent(/3 cards/);

    // Close notification
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-notification'));
    });

    // Notification should be cleared
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'No notification',
    );
  });

  it('shows error notifications when receiving GAME_ERROR events', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div data-testid="notification">
          {context.notification
            ? context.notification.message
            : 'No notification'}
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Initial state should have no notification
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'No notification',
    );

    // Simulate error event
    await act(async () => {
      if (mockSocketEvents[SOCKET_EVENTS.GAME_ERROR]) {
        mockSocketEvents[SOCKET_EVENTS.GAME_ERROR]({
          message: 'Invalid move',
        });
      }
    });

    // Should show error notification
    expect(screen.getByTestId('notification')).toHaveTextContent(
      /Error: Invalid move/,
    );
  });

  it('emits GAME_SUBMIT_KEYWORD event when handleSubmitKeyword is called', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <button
          data-testid="submit-keyword"
          onClick={() =>
            context.handleSubmitKeyword({ word: 'security', count: 2 })
          }
        >
          Submit Keyword
        </button>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Click submit keyword button
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-keyword'));
    });

    // Check that socket.emit was called with correct event and data
    expect(mockSocketEmit).toHaveBeenCalledWith(
      SOCKET_EVENTS.GAME_SUBMIT_KEYWORD,
      {
        lobby_id: 'test-lobby',
        user_id: 'user-123',
        keyword: {
          word: 'security',
          point_count: 2,
        },
      },
    );
  });

  it('emits GAME_END_TURN event when handleEndTurn is called', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <button data-testid="end-turn" onClick={context.handleEndTurn}>
          End Turn
        </button>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Click end turn button
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });

    // Check that socket.emit was called with correct event and data
    expect(mockSocketEmit).toHaveBeenCalledWith(SOCKET_EVENTS.GAME_END_TURN, {
      lobby_id: 'test-lobby',
      user_id: 'user-123',
    });
  });

  it('shows game winner notification when a team wins', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div>
          <div data-testid="notification">
            {context.notification
              ? context.notification.message
              : 'No notification'}
          </div>
          <div data-testid="winner">
            {context.gameState.winner || 'No winner'}
          </div>
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={mockSocket}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Initial state should have no winner
    expect(screen.getByTestId('winner')).toHaveTextContent('No winner');

    // Simulate a team winning
    await act(async () => {
      if (mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]) {
        mockSocketEvents[SOCKET_EVENTS.GAME_UPDATE]({
          active_team: TEAMS.TEAM2,
          game_phase: GAME_PHASE.GAME_OVER,
          board: [],
          team_data: {
            [TEAMS.TEAM1]: { remaining_cards: 0 },
            [TEAMS.TEAM2]: { remaining_cards: 0 },
          },
          winner: TEAMS.TEAM2,
        });
      }
    });

    // Should show winner notification and update game state
    expect(screen.getByTestId('notification')).toHaveTextContent(
      /Team 2 has won the game/,
    );
    expect(screen.getByTestId('winner')).toHaveTextContent(TEAMS.TEAM2);
  });

  it('handles null socket gracefully', async () => {
    const TestConsumer = () => {
      const context = React.useContext(GameContext);
      return (
        <div>
          <button
            data-testid="submit-keyword"
            onClick={() =>
              context.handleSubmitKeyword({ word: 'test', count: 1 })
            }
          >
            Submit Keyword
          </button>
          <button data-testid="end-turn" onClick={context.handleEndTurn}>
            End Turn
          </button>
        </div>
      );
    };

    await act(async () => {
      render(
        <GameProvider
          socket={null}
          lobbyId="test-lobby"
          user={{ id: 'user-123', display_name: 'Test User' }}
        >
          <TestConsumer />
        </GameProvider>,
      );
    });

    // Clicking buttons shouldn't cause errors when socket is null
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-keyword'));
      fireEvent.click(screen.getByTestId('end-turn'));
    });

    // No socket.emit calls should have been made
    expect(mockSocketEmit).not.toHaveBeenCalled();
  });

  it('unsubscribes from socket events on unmount', async () => {
    const { unmount } = render(
      <GameProvider
        socket={mockSocket}
        lobbyId="test-lobby"
        user={{ id: 'user-123', display_name: 'Test User' }}
      >
        <div>Test</div>
      </GameProvider>,
    );

    // Unmount component
    unmount();

    // Should remove socket listeners
    expect(mockSocketOff).toHaveBeenCalledWith(SOCKET_EVENTS.GAME_UPDATE);
    expect(mockSocketOff).toHaveBeenCalledWith(SOCKET_EVENTS.GAME_ERROR);

    // Should emit leave event
    expect(mockSocketEmit).toHaveBeenCalledWith(SOCKET_EVENTS.GAME_LEAVE, {
      lobby_id: 'test-lobby',
      user_id: 'user-123',
    });
  });
});
