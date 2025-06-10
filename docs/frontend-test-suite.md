# Frontend Test Suite Documentation

## Overview

This document provides a comprehensive overview of the frontend test suite for the Lockout Game application. The test suite is built using Vitest and Testing Library, providing thorough coverage of components, contexts, hooks, and utilities.

## Test Statistics

- **Total Test Files**: 19
- **Total Tests**: 103 (97 passed, 6 skipped)
- **Test Categories**: Components, Contexts, Hooks, Utilities
- **Testing Framework**: Vitest with React Testing Library
- **Coverage Areas**: Unit tests, Integration tests, UI behavior tests

## Test Structure

### Components Tests (`/src/components/__tests__/`)

#### Core Game Components

**GameBoard.test.jsx** - 15 tests

- Card border behavior for hackers vs team members
- Selection counter display and functionality
- Hacker legend display (card type indicators)
- Submit button behavior and validation
- Dark mode compatibility
- Revealed card interactions
- Comprehensive coverage of the main game board functionality

**GameContent.test.jsx** - 9 tests

- Game state rendering and display
- Host controls and permissions
- Team lead vs team member UI differences
- Keyword submission functionality
- End game functionality

**Game.test.jsx** - 3 tests

- Overall game component rendering
- Game state management
- Component integration

#### Lobby Management Components

**CreateLobby.test.jsx** - 4 tests

- Lobby creation form validation
- Host setup and configuration
- Error handling for lobby creation
- User input validation

**JoinLobby.test.jsx** - 3 tests

- Lobby joining functionality
- User identification and validation
- Error handling for invalid lobbies

**Lobby.test.jsx** - 2 tests

- Lobby state management
- Participant management

**LobbyActions.test.jsx** - 5 tests

- Host action controls (start game, end game)
- Permission-based action availability
- Action confirmation and error handling

**LobbyContent.test.jsx** - 4 tests

- Lobby information display
- Participant list rendering
- Real-time updates

**LobbyDetails.test.jsx** - 5 tests

- Lobby metadata display
- Configuration settings
- Status indicators

**LobbyParticipants.test.jsx** - 3 tests

- Participant list management
- Team assignment display
- Role indicators (host, team lead)

#### UI and Navigation Components

**Navbar.test.jsx** - 7 tests (6 skipped)

- Navigation functionality
- User authentication state
- Menu interactions
- Route handling

**LandingPage.test.jsx** - 3 tests

- Initial page rendering
- Navigation to lobby creation/joining
- User onboarding flow

#### Team and Host Management

**TeamTable.test.jsx** - 10 tests

- Team composition display
- Member role assignments
- Team lead designation
- Interactive team management

**HostControls.test.jsx** - 8 tests

- Host-specific control panel
- Game state management controls
- Permission validation
- Control availability based on game state

#### Environment and Sanity

**envSanity.test.jsx** - 1 test

- Environment configuration validation
- Basic setup verification

### Context Tests (`/src/context/__tests__/`)

**GameProvider.test.jsx** - 9 tests

- Game state management
- Context provider functionality
- State updates and propagation
- Game logic integration

**LobbyProvider.game.test.jsx** - 5 tests

- Lobby-to-game state transitions
- Context switching between lobby and game states
- Data persistence during transitions

### Hooks Tests (`/src/hooks/__tests__/`)

**useWebex.test.js** - 3 tests

- Webex SDK integration
- Connection management
- Error handling for SDK failures
- Real-time communication setup

### Utilities Tests (`/src/utils/__tests__/`)

**api.test.js** - 4 tests

- API client functionality
- Error handling and response processing
- HTTP request/response validation
- Network error scenarios

## Test Infrastructure

### Testing Tools and Libraries

- **Vitest**: Modern test runner with ES modules support
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **Material-UI Test Utils**: Theme and component testing support

### Mock Infrastructure

**Mock Files** (`/src/test/mocks/`)

- `mockApi.js`: API call mocking
- `mockGameContext.js`: Game state mocking utilities
- `mockLobbyContext.js`: Lobby state mocking utilities
- `mockReactRouterDom.js`: Router navigation mocking
- `mockUseWebex.js`: Webex SDK mocking

### Test Utilities

**testUtils.jsx**: Custom render functions with providers

- Context providers wrapper
- Theme provider integration
- Router provider setup
- Common test setup utilities

**setup.js**: Global test configuration

- Testing library setup
- Mock configurations
- Global test utilities

## Key Testing Patterns

### 1. Component Isolation

Each component is tested in isolation with mocked dependencies, ensuring unit test reliability.

### 2. Context Integration

Tests verify that components correctly consume and interact with React contexts.

### 3. User Interaction Testing

Comprehensive testing of user interactions including clicks, form submissions, and navigation.

### 4. Permission-Based Testing

Extensive testing of role-based functionality (host vs participant, team lead vs team member).

### 5. Error Handling

Robust testing of error scenarios and edge cases.

### 6. Real-time Features

Testing of live updates, WebSocket connections, and real-time state synchronization.

## Coverage Areas

### Game Logic

- Card selection and validation
- Turn management
- Score calculation
- Win/lose conditions
- Keyword submission and validation

### User Interface

- Component rendering
- Interactive elements
- Form validation
- Navigation flows
- Responsive behavior

### State Management

- Context providers
- State updates
- Data persistence
- Cross-component communication

### Integration Points

- API communication
- WebSocket connections
- External SDK integration
- Route handling

## Test Quality Standards

### Accessibility

Tests include accessibility considerations using Testing Library's accessibility-focused queries.

### Performance

Tests verify that components render efficiently and handle large datasets appropriately.

### Error Boundaries

Comprehensive error handling testing ensures graceful failure modes.

### Browser Compatibility

Tests are designed to work across different browser environments.

## Recent Additions

### GameBoard Component Testing

The GameBoard test suite was recently expanded to include comprehensive testing of the new selection behavior:

- **Selection Border Visibility**: Tests verify that hackers cannot see selection borders while team members can
- **Card Type Borders**: Ensures hackers retain access to card type identification through color borders
- **Selection Counters**: Validates that selection counters remain visible to all players
- **Role-Based Interactions**: Comprehensive testing of different user roles and their permitted actions

## Running Tests

### Full Test Suite

```bash
npm test
```

### Specific Test File

```bash
npm test -- GameBoard.test.jsx
```

### Watch Mode

```bash
npm test --watch
```

### Coverage Report

```bash
npm test --coverage
```

## Test Maintenance

### Best Practices

1. Keep tests focused and isolated
2. Use descriptive test names
3. Mock external dependencies
4. Test user behavior, not implementation details
5. Maintain test data consistency

### Regular Maintenance

- Update tests when components change
- Add tests for new features
- Remove obsolete tests
- Keep mock data current
- Review and update test utilities

## Conclusion

The frontend test suite provides comprehensive coverage of the Lockout Game application, ensuring reliability, maintainability, and quality. The tests cover all major functionality areas and provide confidence for ongoing development and refactoring efforts.
