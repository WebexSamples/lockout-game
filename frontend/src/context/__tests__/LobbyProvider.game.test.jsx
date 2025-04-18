// frontend/src/context/__tests__/LobbyProvider.game.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, act, fireEvent } from '@testing-library/react';
import { LobbyProvider } from '../LobbyProvider';
import { LobbyContext } from '../LobbyContext';
import { SOCKET_EVENTS } from '../../constants';

// Create mock socket
const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
const mockSocketEmit = vi.fn();
const mockSocket = {
  on: mockSocketOn,
  off: mockSocketOff,
  emit: mockSocketEmit,
};

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket),
}));

// Mock API
vi.mock('../../utils/api', () => ({
  default: {
    getLobby: vi
      .fn()
      .mockResolvedValue({ lobby_name: 'Test Lobby', participants: [] }),
  },
}));

describe('LobbyProvider Game Events', () => {
  let mockSocketEvents = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Update on method to store event handlers
    mockSocketOn.mockImplementation((event, handler) => {
      mockSocketEvents[event] = handler;
    });
  });

  it('sets gameStarted to true when receiving game start event', async () => {
    const TestConsumer = () => {
      const context = React.useContext(LobbyContext);
      return (
        <div>
          <div data-testid="game-status">
            {context.gameStarted ? 'Game Started' : 'Not Started'}
          </div>
          <button onClick={context.startGame}>Start Game</button>
        </div>
      );
    };

    render(
      <LobbyProvider
        lobbyId="test-id"
        initialUser={{ id: 'user1', display_name: 'Test User' }}
      >
        <TestConsumer />
      </LobbyProvider>,
    );

    // Initial state should be not started
    expect(screen.getByTestId('game-status')).toHaveTextContent('Not Started');

    // Simulate receiving game start event
    act(() => {
      if (mockSocketEvents[SOCKET_EVENTS.LOBBY_START_GAME]) {
        mockSocketEvents[SOCKET_EVENTS.LOBBY_START_GAME]();
      }
    });

    // Should now show game started
    expect(screen.getByTestId('game-status')).toHaveTextContent('Game Started');
  });

  it('sets gameStarted to false when receiving game end event', async () => {
    const TestConsumer = () => {
      const context = React.useContext(LobbyContext);
      return (
        <div>
          <div data-testid="game-status">
            {context.gameStarted ? 'Game Started' : 'Not Started'}
          </div>
          <button onClick={context.endGame}>End Game</button>
        </div>
      );
    };

    // Set up provider with game already started
    render(
      <LobbyProvider
        lobbyId="test-id"
        initialUser={{ id: 'user1', display_name: 'Test User' }}
      >
        <TestConsumer />
      </LobbyProvider>,
    );

    // Set the initial state to game started
    act(() => {
      if (mockSocketEvents[SOCKET_EVENTS.LOBBY_START_GAME]) {
        mockSocketEvents[SOCKET_EVENTS.LOBBY_START_GAME]();
      }
    });

    // Verify game is started
    expect(screen.getByTestId('game-status')).toHaveTextContent('Game Started');

    // Simulate receiving game end event
    act(() => {
      if (mockSocketEvents[SOCKET_EVENTS.LOBBY_END_GAME]) {
        mockSocketEvents[SOCKET_EVENTS.LOBBY_END_GAME]();
      }
    });

    // Should now show not started
    expect(screen.getByTestId('game-status')).toHaveTextContent('Not Started');
  });

  it('emits start game event with lobbyId when startGame is called', async () => {
    const TestConsumer = () => {
      const context = React.useContext(LobbyContext);
      return (
        <div>
          <button data-testid="start-button" onClick={context.startGame}>
            Start Game
          </button>
        </div>
      );
    };

    render(
      <LobbyProvider
        lobbyId="test-lobby"
        initialUser={{ id: 'user1', display_name: 'Test User' }}
      >
        <TestConsumer />
      </LobbyProvider>,
    );

    // Click start button
    fireEvent.click(screen.getByTestId('start-button'));

    // Check that socket.emit was called with correct event and data
    expect(mockSocketEmit).toHaveBeenCalledWith(
      SOCKET_EVENTS.LOBBY_START_GAME,
      { lobby_id: 'test-lobby' },
    );
  });

  it('emits force start game event with lobbyId and userId when forceStartGame is called', async () => {
    const TestConsumer = () => {
      const context = React.useContext(LobbyContext);
      return (
        <div>
          <button
            data-testid="force-start-button"
            onClick={context.forceStartGame}
          >
            Force Start Game
          </button>
        </div>
      );
    };

    render(
      <LobbyProvider
        lobbyId="test-lobby"
        initialUser={{ id: 'user1', display_name: 'Test User' }}
      >
        <TestConsumer />
      </LobbyProvider>,
    );

    // Click force start button
    fireEvent.click(screen.getByTestId('force-start-button'));

    // Check that socket.emit was called with correct event and data
    expect(mockSocketEmit).toHaveBeenCalledWith(
      SOCKET_EVENTS.LOBBY_FORCE_START,
      {
        lobby_id: 'test-lobby',
        user_id: 'user1',
      },
    );
  });

  it('emits end game event with lobbyId and userId when endGame is called', async () => {
    const TestConsumer = () => {
      const context = React.useContext(LobbyContext);
      return (
        <div>
          <button data-testid="end-button" onClick={context.endGame}>
            End Game
          </button>
        </div>
      );
    };

    render(
      <LobbyProvider
        lobbyId="test-lobby"
        initialUser={{ id: 'user1', display_name: 'Test User' }}
      >
        <TestConsumer />
      </LobbyProvider>,
    );

    // Click end button
    fireEvent.click(screen.getByTestId('end-button'));

    // Check that socket.emit was called with correct event and data
    expect(mockSocketEmit).toHaveBeenCalledWith(SOCKET_EVENTS.LOBBY_END_GAME, {
      lobby_id: 'test-lobby',
      user_id: 'user1',
    });
  });
});
