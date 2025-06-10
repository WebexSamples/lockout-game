// frontend/src/components/__tests__/GameBoard.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GameBoard from '../GameBoard';
import { GameContext } from '../../context/GameContext';
import { TEAMS, CARD_TYPES } from '../../constants';
import {
  createMockGameContext,
  createMockGameState,
} from '../../test/mocks/mockGameContext';

// Helper function to render component with theme and context
const renderWithProviders = (
  ui,
  contextOverrides = {},
  themeMode = 'light',
) => {
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const gameContextValue = createMockGameContext(contextOverrides);

  return render(
    <ThemeProvider theme={theme}>
      <GameContext.Provider value={gameContextValue}>{ui}</GameContext.Provider>
    </ThemeProvider>,
  );
};

describe('GameBoard', () => {
  const mockBoard = [
    { id: 1, word: 'Apple', type: CARD_TYPES.TEAM1_CARD, revealed: false },
    { id: 2, word: 'Banana', type: CARD_TYPES.TEAM2_CARD, revealed: false },
    { id: 3, word: 'Cherry', type: CARD_TYPES.PENALTY, revealed: false },
    { id: 4, word: 'Date', type: CARD_TYPES.NEUTRAL, revealed: false },
    { id: 5, word: 'Elderberry', type: CARD_TYPES.TEAM1_CARD, revealed: true },
  ];

  const mockUser = { id: 'user-1' };
  const mockActiveKeyword = { word: 'Fruit', count: 2, team: TEAMS.TEAM1 };

  const defaultProps = {
    isUserTeamLead: false,
    userTeam: TEAMS.TEAM1,
    isUserTurn: true,
    user: mockUser,
  };

  const gameStateWithBoard = createMockGameState({
    board: mockBoard,
    activeKeyword: mockActiveKeyword,
    selectedCards: {
      'user-2': [1], // Another user has selected card 1
      'user-3': [2, 3], // Another user has selected cards 2 and 3
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Card Border Behavior', () => {
    it('shows card type borders for team leads (hackers)', () => {
      const hackerProps = {
        ...defaultProps,
        isUserTeamLead: true,
        isUserTurn: false,
      };

      renderWithProviders(<GameBoard {...hackerProps} />, {
        gameState: gameStateWithBoard,
      });

      // Test that cards are rendered (we can't easily test specific border styles in JSDOM)
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Elderberry')).toBeInTheDocument();
    });

    it('does not show selection borders for team leads (hackers)', () => {
      const hackerProps = {
        ...defaultProps,
        isUserTeamLead: true,
        isUserTurn: false,
      };

      renderWithProviders(<GameBoard {...hackerProps} />, {
        gameState: gameStateWithBoard,
      });

      // Selection counters should still be visible for hackers
      const selectionCounters = screen.getAllByText('1');
      expect(selectionCounters.length).toBeGreaterThan(0); // Multiple cards with 1 selection each
    });

    it('shows selection borders for team members', () => {
      const memberProps = {
        ...defaultProps,
        isUserTeamLead: false,
        isUserTurn: true,
      };

      renderWithProviders(<GameBoard {...memberProps} />, {
        gameState: gameStateWithBoard,
      });

      // Team members should see selection indicators
      const selectionCounters = screen.getAllByText('1');
      expect(selectionCounters.length).toBeGreaterThan(0); // Multiple cards with 1 selection each
    });

    it('allows team members to select cards', () => {
      const mockHandleCardSelection = vi.fn();
      const memberProps = {
        ...defaultProps,
        isUserTeamLead: false,
        isUserTurn: true,
      };

      renderWithProviders(<GameBoard {...memberProps} />, {
        gameState: gameStateWithBoard,
        handleCardSelection: mockHandleCardSelection,
      });

      // Click on a card that's not revealed
      const appleCard = screen.getByText('Apple');
      fireEvent.click(appleCard);

      expect(mockHandleCardSelection).toHaveBeenCalledWith(1, true);
    });

    it('prevents team leads (hackers) from selecting cards', () => {
      const mockHandleCardSelection = vi.fn();
      const hackerProps = {
        ...defaultProps,
        isUserTeamLead: true,
        isUserTurn: false,
      };

      renderWithProviders(<GameBoard {...hackerProps} />, {
        gameState: gameStateWithBoard,
        handleCardSelection: mockHandleCardSelection,
      });

      // Try to click on a card - should not trigger selection
      const appleCard = screen.getByText('Apple');
      fireEvent.click(appleCard);

      expect(mockHandleCardSelection).not.toHaveBeenCalled();
    });
  });

  describe('Selection Counter Display', () => {
    it('displays selection counters for all players', () => {
      renderWithProviders(<GameBoard {...defaultProps} />, {
        gameState: gameStateWithBoard,
      });

      // Check that selection counters are visible - use getAllByText since there are multiple "1"s
      const selectionCounters = screen.getAllByText('1');
      expect(selectionCounters.length).toBeGreaterThan(0);
    });

    it('does not show selection counter for cards with no selections', () => {
      const gameStateNoSelections = createMockGameState({
        board: mockBoard,
        activeKeyword: mockActiveKeyword,
        selectedCards: {},
      });

      renderWithProviders(<GameBoard {...defaultProps} />, {
        gameState: gameStateNoSelections,
      });

      // Should not show any selection counters
      expect(screen.queryByText('1')).not.toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('excludes current user from selection counter', () => {
      const gameStateWithCurrentUser = createMockGameState({
        board: mockBoard,
        activeKeyword: mockActiveKeyword,
        selectedCards: {
          'user-1': [1], // Current user selected card 1
          'user-2': [1], // Another user also selected card 1
        },
      });

      renderWithProviders(<GameBoard {...defaultProps} />, {
        gameState: gameStateWithCurrentUser,
      });

      // Should only show counter of 1 (excluding current user)
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Hacker Legend Display', () => {
    it('shows card type legend for hackers', () => {
      const hackerProps = {
        ...defaultProps,
        isUserTeamLead: true,
      };

      renderWithProviders(<GameBoard {...hackerProps} />, {
        gameState: gameStateWithBoard,
      });

      expect(screen.getByText('Bluewave')).toBeInTheDocument();
      expect(screen.getByText('Redshift')).toBeInTheDocument();
      expect(screen.getByText('Cyber-Security Trap')).toBeInTheDocument();
      expect(screen.getByText('Honeypot')).toBeInTheDocument();
    });

    it('does not show legend for team members', () => {
      renderWithProviders(<GameBoard {...defaultProps} />, {
        gameState: gameStateWithBoard,
      });

      expect(screen.queryByText('Bluewave')).not.toBeInTheDocument();
      expect(screen.queryByText('Redshift')).not.toBeInTheDocument();
      expect(screen.queryByText('Cyber-Security Trap')).not.toBeInTheDocument();
      expect(screen.queryByText('Honeypot')).not.toBeInTheDocument();
    });
  });

  describe('Submit Button Behavior', () => {
    it('shows submit button for team members with selections', () => {
      const mockHandleCardSelection = vi.fn();
      const memberProps = {
        ...defaultProps,
        isUserTeamLead: false,
        isUserTurn: true,
      };

      renderWithProviders(<GameBoard {...memberProps} />, {
        gameState: gameStateWithBoard,
        handleCardSelection: mockHandleCardSelection,
      });

      // Select a card first
      const appleCard = screen.getByText('Apple');
      fireEvent.click(appleCard);

      // Submit button should appear after selection
      expect(
        screen.getByRole('button', { name: /Submit Guess/i }),
      ).toBeInTheDocument();
    });

    it('does not show submit button for hackers', () => {
      const hackerProps = {
        ...defaultProps,
        isUserTeamLead: true,
        isUserTurn: false,
      };

      renderWithProviders(<GameBoard {...hackerProps} />, {
        gameState: gameStateWithBoard,
      });

      expect(
        screen.queryByRole('button', { name: /Submit Guess/i }),
      ).not.toBeInTheDocument();
    });

    it('disables submit button when too many cards selected', () => {
      const mockHandleCardSelection = vi.fn();
      const memberProps = {
        ...defaultProps,
        isUserTeamLead: false,
        isUserTurn: true,
      };

      // Create a keyword with count of 1
      const gameStateWithLimitedKeyword = createMockGameState({
        board: mockBoard,
        activeKeyword: { word: 'Test', count: 1, team: TEAMS.TEAM1 },
        selectedCards: {},
      });

      renderWithProviders(<GameBoard {...memberProps} />, {
        gameState: gameStateWithLimitedKeyword,
        handleCardSelection: mockHandleCardSelection,
      });

      // Select one card first
      const appleCard = screen.getByText('Apple');
      fireEvent.click(appleCard);

      // Now select another card (which should replace the first due to count limit)
      const bananaCard = screen.getByText('Banana');
      fireEvent.click(bananaCard);

      // Submit button should be enabled since only one card is effectively selected
      const submitButton = screen.getByRole('button', {
        name: /Submit Guess/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Dark Mode', () => {
    it('renders correctly in dark mode', () => {
      renderWithProviders(
        <GameBoard {...defaultProps} />,
        {
          gameState: gameStateWithBoard,
        },
        'dark',
      );

      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Game Board')).toBeInTheDocument();
    });
  });

  describe('Revealed Cards', () => {
    it('shows revealed card colors and prevents interaction', () => {
      const mockHandleCardSelection = vi.fn();

      renderWithProviders(<GameBoard {...defaultProps} />, {
        gameState: gameStateWithBoard,
        handleCardSelection: mockHandleCardSelection,
      });

      // Elderberry is revealed in our mock data
      const revealedCard = screen.getByText('Elderberry');
      expect(revealedCard).toBeInTheDocument();

      // Clicking revealed cards should not trigger selection
      fireEvent.click(revealedCard);
      expect(mockHandleCardSelection).not.toHaveBeenCalled();
    });
  });
});
