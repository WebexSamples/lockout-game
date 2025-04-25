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
  // Common props for testing
  const defaultProps = {
    endGame: vi.fn(),
    isUserHost: false,
    lobby: {
      id: 'test-lobby',
      participants: [
        { id: 'host-id', display_name: 'Host User', is_host: true },
        {
          id: 'user-id',
          display_name: 'Regular User',
          is_team_lead: true,
          team: TEAMS.TEAM1,
        },
        { id: 'other-user', display_name: 'Team Member', team: TEAMS.TEAM1 },
      ],
    },
    user: { id: 'user-id', display_name: 'Regular User' },
    getCurrentTeam: () => TEAMS.TEAM1,
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
    expect(screen.getByText(/Host User/i)).toBeInTheDocument();
  });

  it('renders team lead controls when user is team lead and it is their team turn', () => {
    // Team lead during keyword entry phase
    const gameContextValue = {
      gameState: createMockGameState({
        activeTeam: TEAMS.TEAM1,
        gamePhase: GAME_PHASE.KEYWORD_ENTRY,
      }),
    };

    renderWithGameContext(<GameContent {...defaultProps} />, gameContextValue);

    expect(screen.getByTestId('hacker-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('is-team-lead')).toHaveTextContent('yes');
    expect(screen.getByTestId('is-team-turn')).toHaveTextContent('yes');
  });

  it('allows team lead to submit keywords', () => {
    const handleSubmitKeyword = vi.fn();

    renderWithGameContext(<GameContent {...defaultProps} />, {
      handleSubmitKeyword,
    });

    const submitButton = screen.getByTestId('submit-keyword-btn');
    fireEvent.click(submitButton);

    expect(handleSubmitKeyword).toHaveBeenCalledWith({
      word: 'test',
      count: 2,
    });
  });

  it('displays notifications when present', () => {
    renderWithGameContext(<GameContent {...defaultProps} />, {
      notification: { message: 'Test notification', severity: 'info' },
    });

    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('handles different game phases correctly', () => {
    // Team guessing phase
    const guessingPhaseState = createMockGameState({
      activeTeam: TEAMS.TEAM1,
      gamePhase: GAME_PHASE.TEAM_GUESSING,
      activeKeyword: { word: 'hack', count: 3, team: TEAMS.TEAM1 },
    });

    const teamMemberProps = {
      ...defaultProps,
      getCurrentTeam: () => TEAMS.TEAM1,
      user: { id: 'other-user', display_name: 'Team Member' },
    };

    renderWithGameContext(<GameContent {...teamMemberProps} />, {
      gameState: guessingPhaseState,
    });

    // Team members should see their turn to guess
    expect(screen.getByTestId('is-user-turn')).toHaveTextContent('yes');
  });
});
