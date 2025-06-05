// frontend/src/components/__tests__/GameContent.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import GameContent from '../GameContent';
import { GameContext } from '../../context/GameContext';
import { TEAMS, GAME_PHASE } from '../../constants';
import {
  createMockGameContext,
  createMockGameState,
} from '../../test/mocks/mockGameContext';

// Mock child components to simplify testing
vi.mock('../GameStatusIndicator', () => ({
  default: () => (
    <div data-testid="game-status-indicator">Game Status Mock</div>
  ),
}));

vi.mock('../GameBoard', () => ({
  default: ({ isUserTeamLead, userTeam, isUserTurn }) => (
    <div data-testid="game-board">
      <span data-testid="user-team">{userTeam}</span>
      <span data-testid="is-lead">{isUserTeamLead ? 'yes' : 'no'}</span>
      <span data-testid="is-user-turn">{isUserTurn ? 'yes' : 'no'}</span>
    </div>
  ),
}));

vi.mock('../HackerPrompt', () => ({
  default: ({ activeTeam, isTeamLead, isTeamTurn, onSubmitKeyword }) => (
    <div data-testid="hacker-prompt">
      <span data-testid="active-team">{activeTeam}</span>
      <span data-testid="is-team-lead">{isTeamLead ? 'yes' : 'no'}</span>
      <span data-testid="is-team-turn">{isTeamTurn ? 'yes' : 'no'}</span>
      <button
        data-testid="submit-keyword-btn"
        onClick={() => onSubmitKeyword({ word: 'test', count: 2 })}
      >
        Submit Keyword
      </button>
    </div>
  ),
}));

vi.mock('../GameDetails', () => ({
  default: () => <div data-testid="game-details">Game Details Mock</div>,
}));

describe('GameContent', () => {
  const baseLobby = {
    id: 'lobby1',
    lobby_name: 'Test Lobby',
    participants: [
      { id: '1', display_name: 'Alice', is_host: true, is_team_lead: true, team: 'red' },
      { id: '2', display_name: 'Bob', is_host: false, is_team_lead: false, team: 'red' },
      { id: '3', display_name: 'Charlie', is_host: false, is_team_lead: true, team: 'blue' },
      { id: '4', display_name: 'Dana', is_host: false, is_team_lead: false, team: 'blue' },
    ],
    game_in_progress: true,
  };

  const getCurrentTeam = vi.fn(() => 'red');
  const endGame = vi.fn();

  // Common props for testing
  const defaultProps = {
    endGame,
    isUserHost: false,
    lobby: baseLobby,
    user: { id: '2', display_name: 'Bob', team: 'red', is_team_lead: false },
    getCurrentTeam,
  };

  // Helper function to render component with context
  const renderWithGameContext = (ui, contextOverrides = {}) => {
    const gameContextValue = createMockGameContext(contextOverrides);

    return render(
      <GameContext.Provider value={gameContextValue}>
        {ui}
      </GameContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders game in progress message', () => {
    renderWithGameContext(<GameContent {...defaultProps} />);

    expect(screen.getByText(/Game In Progress/i)).toBeInTheDocument();
  });

  it('shows end game button for the host', () => {
    const hostProps = {
      ...defaultProps,
      isUserHost: true,
    };

    renderWithGameContext(<GameContent {...hostProps} />);

    const endButton = screen.getByRole('button', {
      name: /End Game & Return to Lobby/i,
    });
    expect(endButton).toBeInTheDocument();

    // Test button action
    fireEvent.click(endButton);
    expect(hostProps.endGame).toHaveBeenCalled();
  });

  it('hides end game button for non-host users and shows info message', () => {
    renderWithGameContext(<GameContent {...defaultProps} />);

    // Button should not be visible
    expect(
      screen.queryByRole('button', { name: /End Game & Return to Lobby/i }),
    ).not.toBeInTheDocument();

    // Should show info message instead
    expect(screen.getByText(/Only the host/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it('renders team lead controls when user is team lead and it is their team turn', () => {
    // Team lead during keyword entry phase
    const gameContextValue = {
      gameState: createMockGameState({
        activeTeam: TEAMS.TEAM1,
        gamePhase: GAME_PHASE.KEYWORD_ENTRY,
      }),
    };
    const leadProps = {
      ...defaultProps,
      user: { id: 'lead-id', display_name: 'Lead', team: TEAMS.TEAM1, is_team_lead: true },
      lobby: {
        ...defaultProps.lobby,
        participants: [
          { id: 'user-id', display_name: 'Regular User', team: TEAMS.TEAM1, is_team_lead: false },
          { id: 'lead-id', display_name: 'Lead', team: TEAMS.TEAM1, is_team_lead: true },
        ],
      },
      getCurrentTeam: () => TEAMS.TEAM1,
    };
    renderWithGameContext(<GameContent {...leadProps} />, gameContextValue);
    expect(screen.getByTestId('hacker-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('is-team-lead')).toHaveTextContent('yes');
    expect(screen.getByTestId('is-team-turn')).toHaveTextContent('yes');
  });

  it('allows team lead to submit keywords', () => {
    const handleSubmitKeyword = vi.fn();
    const leadProps = {
      ...defaultProps,
      user: { id: 'lead-id', display_name: 'Lead', team: TEAMS.TEAM1, is_team_lead: true },
      lobby: {
        ...defaultProps.lobby,
        participants: [
          { id: 'user-id', display_name: 'Regular User', team: TEAMS.TEAM1, is_team_lead: false },
          { id: 'lead-id', display_name: 'Lead', team: TEAMS.TEAM1, is_team_lead: true },
        ],
      },
      getCurrentTeam: () => TEAMS.TEAM1,
    };
    renderWithGameContext(<GameContent {...leadProps} />, {
      handleSubmitKeyword,
    });
    const submitButton = screen.getByTestId('submit-keyword-btn');
    fireEvent.click(submitButton);
    expect(handleSubmitKeyword).toHaveBeenCalledWith({
      word: 'test',
      count: 2,
    });
  });

  // --- Fix: wrap all direct <GameContent ... /> renders in renderWithGameContext ---
  it('shows HackerPrompt for team lead only', () => {
    const leadProps = {
      endGame,
      isUserHost: true,
      lobby: baseLobby,
      user: { id: '1', display_name: 'Alice', team: 'red', is_team_lead: true },
      getCurrentTeam,
    };
    renderWithGameContext(<GameContent {...leadProps} />);
    expect(screen.getByTestId('hacker-prompt')).toBeInTheDocument();
  });

  it('does not show HackerPrompt for regular team member', () => {
    const memberProps = {
      endGame,
      isUserHost: false,
      lobby: baseLobby,
      user: { id: '2', display_name: 'Bob', team: 'red', is_team_lead: false },
      getCurrentTeam,
    };
    renderWithGameContext(<GameContent {...memberProps} />);
    expect(screen.queryByTestId('hacker-prompt')).not.toBeInTheDocument();
  });

  it('does not show HackerPrompt for user not on a team', () => {
    const noTeamProps = {
      endGame,
      isUserHost: false,
      lobby: baseLobby,
      user: { id: '99', display_name: 'Eve', team: null, is_team_lead: false },
      getCurrentTeam: () => null,
    };
    renderWithGameContext(<GameContent {...noTeamProps} />);
    expect(screen.queryByTestId('hacker-prompt')).not.toBeInTheDocument();
  });

  it('shows game details and board for all users', () => {
    renderWithGameContext(<GameContent {...defaultProps} />);
    expect(screen.getByText(/Game In Progress/i)).toBeInTheDocument();
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    expect(screen.getByTestId('game-details')).toBeInTheDocument();
  });
});
