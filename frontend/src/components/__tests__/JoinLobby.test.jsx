// frontend/src/components/__tests__/JoinLobby.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import JoinLobby from '../JoinLobby';
import { renderWithRouter } from '../../test/testUtils';

describe('JoinLobby', () => {
  let onJoin;

  beforeEach(() => {
    vi.clearAllMocks();
    onJoin = vi.fn();
    renderWithRouter(<JoinLobby onJoin={onJoin} />);
  });

  it('renders display name input and join button', () => {
    expect(
      screen.getByLabelText(/Enter your display name/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Join Lobby/i }),
    ).toBeInTheDocument();
  });

  it('calls onJoin with a user object when display name is provided', () => {
    const input = screen.getByLabelText(/Enter your display name/i);
    fireEvent.change(input, { target: { value: 'TestPlayer' } });

    const button = screen.getByRole('button', { name: /Join Lobby/i });
    fireEvent.click(button);

    expect(onJoin).toHaveBeenCalledTimes(1);
    const user = onJoin.mock.calls[0][0];

    expect(user.display_name).toBe('TestPlayer');
    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('string');
  });

  it('does not call onJoin if display name is empty', () => {
    fireEvent.change(screen.getByLabelText(/Enter your display name/i), {
      target: { value: ' ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Join Lobby/i }));

    expect(onJoin).not.toHaveBeenCalled();
  });
});
